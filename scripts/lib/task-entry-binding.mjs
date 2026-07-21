import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {
  evidenceDigest,
  extractMachineReadableEvidence,
  loadSchema,
  validateEvidenceBlock,
  validateSchema,
} from "./artifact-schema.mjs";
import {
  projectIdentity,
  resolveAuthoritativeEvidenceReference,
} from "./evidence-authority.mjs";
import { sectionBody, stripMarkdown } from "./markdown.mjs";

const SHA_RE = /^sha256:[a-f0-9]{64}$/;
const TASK_REF_RE = /^task:[a-f0-9]{64}$/;
const TIERS = new Set(["LOW", "MEDIUM", "POSSIBLE_HIGH", "HIGH"]);
export const TASK_IDENTITY_VERSION = "task-instance/v1";
const TASK_GOVERNANCE_LINEAGE_PREFIX = "lineage:task_governance:";
const RESUME_DECISION_CHECK_IDS = [
  "PROJECT_IDENTITY_CURRENT",
  "PROJECT_REVISION_CURRENT",
  "WORK_QUEUE_ITEM_CURRENT",
  "TASK_GOVERNANCE_CURRENT",
  "WORKTREE_REVIEWED",
  "PRIOR_EVIDENCE_CURRENT",
];
const TASK_RESUME_DECISION_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "schema_version", "artifact_type", "resume_decision_ref", "resume_decision_digest",
    "project_binding", "work_queue_item_binding", "task_governance_binding",
    "pre_resume_checks", "blocking_findings", "decision", "boundaries",
  ],
  properties: {
    schema_version: { const: "1.113.0" },
    artifact_type: { const: "task_resume_decision" },
    resume_decision_ref: { type: "string", minLength: 1 },
    resume_decision_digest: { type: "string", pattern: "^sha256:[a-f0-9]{64}$" },
    project_binding: {
      type: "object",
      additionalProperties: false,
      required: ["kind", "fingerprint", "revision"],
      properties: {
        kind: { enum: ["GIT", "NON_GIT"] },
        fingerprint: { type: "string", pattern: "^sha256:[a-f0-9]{64}$" },
        revision: { type: "string", pattern: "^sha256:[a-f0-9]{64}$" },
      },
    },
    work_queue_item_binding: {
      type: "object",
      additionalProperties: false,
      required: ["ref", "digest", "state", "task_ref", "intent_digest"],
      properties: {
        ref: { type: "string", minLength: 1 },
        digest: { type: "string", pattern: "^sha256:[a-f0-9]{64}$" },
        state: { enum: ["CURRENT", "PAUSED"] },
        task_ref: { type: "string", pattern: "^task:[a-f0-9]{64}$" },
        intent_digest: { type: "string", pattern: "^sha256:[a-f0-9]{64}$" },
      },
    },
    task_governance_binding: {
      type: "object",
      additionalProperties: false,
      required: ["ref", "digest", "task_ref", "intent_digest", "work_queue_item_ref", "work_queue_item_digest"],
      properties: {
        ref: { type: "string", minLength: 1 },
        digest: { type: "string", pattern: "^sha256:[a-f0-9]{64}$" },
        task_ref: { type: "string", pattern: "^task:[a-f0-9]{64}$" },
        intent_digest: { type: "string", pattern: "^sha256:[a-f0-9]{64}$" },
        work_queue_item_ref: { type: "string", minLength: 1 },
        work_queue_item_digest: { type: "string", pattern: "^sha256:[a-f0-9]{64}$" },
      },
    },
    pre_resume_checks: {
      type: "array",
      minItems: RESUME_DECISION_CHECK_IDS.length,
      maxItems: RESUME_DECISION_CHECK_IDS.length,
      uniqueItems: true,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["check_id", "status", "evidence_digest"],
        properties: {
          check_id: { enum: RESUME_DECISION_CHECK_IDS },
          status: { enum: ["PASS", "FAIL"] },
          evidence_digest: { type: "string", pattern: "^sha256:[a-f0-9]{64}$" },
        },
      },
    },
    blocking_findings: {
      type: "array",
      uniqueItems: true,
      items: { type: "string", minLength: 1 },
    },
    decision: {
      type: "object",
      additionalProperties: false,
      required: ["state", "authority", "decided_by"],
      properties: {
        state: { enum: ["APPROVED", "REJECTED", "BLOCKED"] },
        authority: { const: "EXPLICIT_CURRENT_USER_DECISION" },
        decided_by: { type: "string", minLength: 1 },
      },
    },
    boundaries: {
      type: "object",
      additionalProperties: false,
      required: ["changes_task_state", "authorizes_implementation", "authorizes_release_or_production"],
      properties: {
        changes_task_state: { const: "No" },
        authorizes_implementation: { const: "No" },
        authorizes_release_or_production: { const: "No" },
      },
    },
  },
};

export function normalizeTaskIntent(value) {
  return String(value || "")
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    .trim();
}

export function taskIntentDigest(value) {
  return digest(normalizeTaskIntent(value));
}

export function deriveWorkQueueTaskIdentity({ workQueueItemRef, item, intent }) {
  const normalizedIntent = normalizeTaskIntent(intent);
  const normalizedRef = normalizeArtifactReference(workQueueItemRef);
  const fragment = normalizedRef.includes("#") ? normalizedRef.slice(normalizedRef.indexOf("#") + 1) : "";
  const itemId = String(item?.item_id || "").trim();
  if (!normalizedRef || !fragment || fragment !== itemId) {
    return { ok: false, error: "Work Queue item ref must contain the exact item_id fragment" };
  }
  if (!normalizedIntent) return { ok: false, error: "Work Queue task intent is missing" };
  if (!SHA_RE.test(String(item?.source_item_digest || ""))) {
    return { ok: false, error: "Work Queue source_item_digest must be sha256" };
  }
  const material = {
    identity_version: TASK_IDENTITY_VERSION,
    work_queue_item_ref: normalizedRef,
    item_id: itemId,
    source_item_ref: String(item?.source_item || "").trim(),
    source_item_digest: item.source_item_digest,
    intent: normalizedIntent,
    intent_digest: taskIntentDigest(normalizedIntent),
  };
  const workQueueItemDigest = digest(JSON.stringify(material));
  return {
    ok: true,
    ...material,
    work_queue_item_digest: workQueueItemDigest,
    task_ref: `task:${workQueueItemDigest.slice("sha256:".length)}`,
  };
}

export function resolveWorkQueueTaskIdentity(projectRoot, reference, options = {}) {
  const resolved = resolveAuthoritativeEvidenceReference(projectRoot, options.fromFile || "", reference, { markdownOnly: true });
  if (!resolved.ok) return { ok: false, error: `Work Queue item reference is unsafe or unresolved: ${resolved.error}` };
  if (!resolved.fragment) return { ok: false, error: "Work Queue item reference requires an exact item_id fragment" };
  if (options.allowArchived !== true && isArchivedTaskAuthorityRef(resolved.relativePath)) {
    return { ok: false, error: "archived Work Queue takeover evidence cannot provide current task authority" };
  }
  const content = fs.readFileSync(resolved.file, "utf8");
  const extracted = extractMachineReadableEvidence(content);
  if (!extracted?.ok || extracted.value?.artifact_type !== "work_queue_takeover") {
    return { ok: false, error: "Work Queue item reference does not contain typed takeover evidence" };
  }
  const evidence = extracted.value;
  if (evidence.work_queue_takeover_digest !== evidenceDigest(evidence, ["work_queue_takeover_digest"])) {
    return { ok: false, error: "Work Queue takeover digest is invalid" };
  }
  if (normalizeArtifactPath(evidence.work_queue_takeover_ref) !== resolved.relativePath) {
    return { ok: false, error: "Work Queue takeover self-reference does not point to the referenced report" };
  }
  const normalizedIntent = normalizeTaskIntent(evidence.intent);
  if (!normalizedIntent || evidence.intent !== normalizedIntent || evidence.intent_digest !== taskIntentDigest(normalizedIntent)) {
    return { ok: false, error: "Work Queue intent or intent_digest is not canonical" };
  }
  const items = Array.isArray(evidence.queue_items) ? evidence.queue_items : [];
  const matchingItems = items.filter((candidate) => candidate.item_id === resolved.fragment);
  if (matchingItems.length !== 1) {
    return { ok: false, error: `Work Queue item ${resolved.fragment} must resolve exactly once` };
  }
  const item = matchingItems[0];
  if (!item) return { ok: false, error: `Work Queue item ${resolved.fragment} does not exist` };
  if (options.requireCurrent !== false && items.filter((candidate) => candidate.state === "CURRENT").length !== 1) {
    return { ok: false, error: "Work Queue takeover must contain exactly one CURRENT item" };
  }
  if (options.requireCurrent !== false && item.state !== "CURRENT") {
    return { ok: false, error: `Work Queue item ${resolved.fragment} is not CURRENT` };
  }
  const source = (evidence.source_inventory || []).find((candidate) => candidate.source_ref === item.source_item);
  if (!source || source.source_digest !== item.source_item_digest) {
    return { ok: false, error: "Work Queue item does not bind an exact source inventory entry" };
  }
  const sourceResolved = resolveAuthoritativeEvidenceReference(projectRoot, resolved.file, source.source_ref);
  if (!sourceResolved.ok) {
    return { ok: false, error: `Work Queue evidence source is unsafe or unresolved: ${sourceResolved.error}` };
  }
  const sourceDigest = digest(`${source.source_ref}\n${fs.readFileSync(sourceResolved.file, "utf8")}`);
  if (sourceDigest !== source.source_digest) {
    return { ok: false, error: "Work Queue evidence source digest does not match its current file" };
  }
  const itemRef = `artifact:${resolved.relativePath}#${resolved.fragment}`;
  const identity = deriveWorkQueueTaskIdentity({ workQueueItemRef: itemRef, item, intent: normalizedIntent });
  if (!identity.ok) return identity;
  return { ok: true, evidence, item, resolved, source, sourceResolved, identity };
}

export function validateTaskGovernanceLineage(projectRoot, evidence, options = {}) {
  const errors = [];
  const normalizedIntent = normalizeTaskIntent(evidence?.intent);
  if (!normalizedIntent || evidence?.intent !== normalizedIntent) errors.push("Task Governance intent must be normalized");
  if (evidence?.intent_digest !== taskIntentDigest(normalizedIntent)) errors.push("Task Governance intent_digest must be recomputed from normalized intent");
  const lineage = evidence?.task_lineage;
  if (!lineage || lineage.identity_version !== TASK_IDENTITY_VERSION || lineage.authority !== "WORK_QUEUE_ITEM") {
    if (options.requireCurrent || options.requireWorkQueueAuthority) {
      errors.push("Task Governance current authority requires WORK_QUEUE_ITEM task_lineage");
    }
    return { ok: errors.length === 0, errors, current: false };
  }
  const resolved = resolveWorkQueueTaskIdentity(projectRoot, lineage.work_queue_item_ref, {
    fromFile: options.fromFile || "",
    requireCurrent: options.requireCurrent !== false,
  });
  if (!resolved.ok) {
    errors.push(resolved.error);
    return { ok: false, errors, current: true };
  }
  const expected = resolved.identity;
  if (!TASK_REF_RE.test(String(evidence.task_ref || ""))) errors.push("Task Governance current task_ref must be an opaque task-instance sha256 ref");
  if (lineage.work_queue_item_digest !== expected.work_queue_item_digest) errors.push("Task Governance work_queue_item_digest does not match the exact Work Queue item");
  if (evidence.task_ref !== expected.task_ref) errors.push("Task Governance task_ref does not match the exact Work Queue task instance");
  if (evidence.intent !== expected.intent) errors.push("Task Governance intent does not match the exact Work Queue item intent");
  if (evidence.intent_digest !== expected.intent_digest) errors.push("Task Governance intent_digest does not match the exact Work Queue item intent");
  return { ok: errors.length === 0, errors, current: true, workQueue: resolved };
}

export function encodeTaskGovernanceLineage(ref, digestValue) {
  const normalizedRef = normalizeArtifactReference(ref);
  if (!normalizedRef || !SHA_RE.test(String(digestValue || ""))) return "";
  return `${TASK_GOVERNANCE_LINEAGE_PREFIX}${Buffer.from(normalizedRef).toString("base64url")}:${digestValue}`;
}

export function decodeTaskGovernanceLineage(value) {
  const raw = String(value || "").trim();
  if (!raw.startsWith(TASK_GOVERNANCE_LINEAGE_PREFIX)) return null;
  const payload = raw.slice(TASK_GOVERNANCE_LINEAGE_PREFIX.length);
  const separator = payload.lastIndexOf(":sha256:");
  if (separator < 1) return null;
  try {
    const ref = Buffer.from(payload.slice(0, separator), "base64url").toString("utf8");
    const digestValue = payload.slice(separator + 1);
    if (!normalizeArtifactReference(ref) || !SHA_RE.test(digestValue)) return null;
    return { ref, digest: digestValue };
  } catch {
    return null;
  }
}

export function validateEmbeddedTaskGovernanceLineage(projectRoot, sourceRuleRefs, expected, options = {}) {
  const records = (sourceRuleRefs || []).map(decodeTaskGovernanceLineage).filter(Boolean);
  if (records.length !== 1) return { ok: false, errors: ["exactly one Task Governance lineage record is required"] };
  const record = records[0];
  const resolved = resolveAuthoritativeEvidenceReference(projectRoot, options.fromFile || "", record.ref, { markdownOnly: true });
  if (!resolved.ok) return { ok: false, errors: [`Task Governance lineage ref is unsafe or unresolved: ${resolved.error}`] };
  const extracted = extractMachineReadableEvidence(fs.readFileSync(resolved.file, "utf8"));
  if (!extracted?.ok || extracted.value?.artifact_type !== "task_governance") {
    return { ok: false, errors: ["Task Governance lineage ref does not contain typed governance evidence"] };
  }
  const governance = extracted.value;
  const errors = [];
  if (record.digest !== governance.task_governance_digest) errors.push("Task Governance lineage digest does not match referenced evidence");
  if (governance.task_governance_digest !== evidenceDigest(governance, ["task_governance_digest"])) errors.push("referenced Task Governance digest is invalid");
  if (expected?.taskRef && governance.task_ref !== expected.taskRef) errors.push("Task Governance lineage task_ref does not match the consumer");
  if (expected?.intentDigest && governance.intent_digest !== expected.intentDigest) errors.push("Task Governance lineage intent_digest does not match the consumer");
  if (expected?.intent && governance.intent !== normalizeTaskIntent(expected.intent)) errors.push("Task Governance lineage intent text does not match the consumer");
  const current = validateTaskGovernanceLineage(projectRoot, governance, { fromFile: resolved.file, requireCurrent: Boolean(options.requireCurrent) });
  errors.push(...current.errors);
  return { ok: errors.length === 0, errors, record, governance, resolved, current };
}

export function createTaskResumeDecision(projectRoot, options = {}) {
  const decisionRef = normalizeResumeDecisionRef(options.resumeDecisionRef);
  if (!decisionRef) throw new Error("resume decision ref must be a safe project-relative Markdown path");
  const workQueue = resolveWorkQueueTaskIdentity(projectRoot, options.workQueueItemRef, {
    requireCurrent: false,
  });
  if (!workQueue.ok) throw new Error(workQueue.error);
  if (!["CURRENT", "PAUSED"].includes(workQueue.item.state)) {
    throw new Error("resume decision requires a CURRENT or PAUSED Work Queue item");
  }
  const governance = resolveStrictTaskGovernance(projectRoot, options.taskGovernanceRef, {
    requireCurrent: workQueue.item.state === "CURRENT",
  });
  if (!governance.ok) throw new Error(governance.errors.join("; "));
  if (governance.lineage.workQueue.identity.work_queue_item_ref !== workQueue.identity.work_queue_item_ref
    || governance.lineage.workQueue.identity.work_queue_item_digest !== workQueue.identity.work_queue_item_digest) {
    throw new Error("Task Governance does not bind the selected Work Queue item");
  }
  const binding = safeProjectIdentity(projectRoot);
  if (!binding.ok) throw new Error(binding.error);
  const state = String(options.state || "APPROVED").toUpperCase();
  const decidedBy = String(options.decidedBy || "current-user").trim();
  const checks = expectedResumeChecks(binding.value, workQueue.identity, governance.evidence)
    .map((item) => ({ ...item, status: state === "APPROVED" ? "PASS" : "FAIL" }));
  const base = {
    schema_version: "1.113.0",
    artifact_type: "task_resume_decision",
    resume_decision_ref: decisionRef,
    resume_decision_digest: "",
    project_binding: binding.value,
    work_queue_item_binding: {
      ref: workQueue.identity.work_queue_item_ref,
      digest: workQueue.identity.work_queue_item_digest,
      state: workQueue.item.state,
      task_ref: workQueue.identity.task_ref,
      intent_digest: workQueue.identity.intent_digest,
    },
    task_governance_binding: {
      ref: `artifact:${governance.resolved.relativePath}`,
      digest: governance.evidence.task_governance_digest,
      task_ref: governance.evidence.task_ref,
      intent_digest: governance.evidence.intent_digest,
      work_queue_item_ref: workQueue.identity.work_queue_item_ref,
      work_queue_item_digest: workQueue.identity.work_queue_item_digest,
    },
    pre_resume_checks: checks,
    blocking_findings: state === "APPROVED" ? [] : [String(options.reason || "resume was not approved")],
    decision: {
      state,
      authority: "EXPLICIT_CURRENT_USER_DECISION",
      decided_by: decidedBy,
    },
    boundaries: {
      changes_task_state: "No",
      authorizes_implementation: "No",
      authorizes_release_or_production: "No",
    },
  };
  return { ...base, resume_decision_digest: evidenceDigest(base, ["resume_decision_digest"]) };
}

export function validateTaskResumeDecision(projectRoot, reference, options = {}) {
  const errors = [];
  const resolved = resolveAuthoritativeEvidenceReference(projectRoot, options.fromFile || "", reference, { markdownOnly: true });
  if (!resolved.ok) return { ok: false, approved: false, errors: [`resume decision ref is unsafe or unresolved: ${resolved.error}`] };
  if (isArchivedTaskAuthorityRef(resolved.relativePath)) {
    return { ok: false, approved: false, errors: ["archived resume decisions cannot restore task authority"] };
  }
  const extracted = extractMachineReadableEvidence(fs.readFileSync(resolved.file, "utf8"));
  if (!extracted?.ok || extracted.value?.artifact_type !== "task_resume_decision") {
    return { ok: false, approved: false, errors: ["resume decision must contain typed task_resume_decision evidence"] };
  }
  const evidence = extracted.value;
  const structural = validateSchema(evidence, TASK_RESUME_DECISION_SCHEMA, { label: "task resume decision" });
  errors.push(...structural.errors);
  if (evidence.resume_decision_digest !== evidenceDigest(evidence, ["resume_decision_digest"])) {
    errors.push("resume decision digest is not canonical");
  }
  if (normalizeArtifactPath(evidence.resume_decision_ref) !== resolved.relativePath) {
    errors.push("resume decision self-reference does not point to this report");
  }

  const currentProject = safeProjectIdentity(projectRoot);
  if (!currentProject.ok) errors.push(currentProject.error);
  else if (!sameJson(evidence.project_binding, currentProject.value)) {
    errors.push("resume decision belongs to another project identity or revision");
  }

  const queueRef = evidence.work_queue_item_binding?.ref;
  const queue = resolveWorkQueueTaskIdentity(projectRoot, queueRef, { fromFile: resolved.file, requireCurrent: false });
  if (!queue.ok) {
    errors.push(`resume decision Work Queue binding is invalid: ${queue.error}`);
  } else {
    const expectedQueue = {
      ref: queue.identity.work_queue_item_ref,
      digest: queue.identity.work_queue_item_digest,
      state: queue.item.state,
      task_ref: queue.identity.task_ref,
      intent_digest: queue.identity.intent_digest,
    };
    if (!sameJson(evidence.work_queue_item_binding, expectedQueue)) {
      errors.push("resume decision does not bind the exact current Work Queue task instance");
    }
  }

  const governance = resolveStrictTaskGovernance(projectRoot, evidence.task_governance_binding?.ref, {
    fromFile: resolved.file,
    requireCurrent: evidence.work_queue_item_binding?.state === "CURRENT",
  });
  if (!governance.ok) {
    errors.push(...governance.errors.map((error) => `resume decision Task Governance binding is invalid: ${error}`));
  } else if (queue.ok) {
    const expectedGovernance = {
      ref: `artifact:${governance.resolved.relativePath}`,
      digest: governance.evidence.task_governance_digest,
      task_ref: governance.evidence.task_ref,
      intent_digest: governance.evidence.intent_digest,
      work_queue_item_ref: queue.identity.work_queue_item_ref,
      work_queue_item_digest: queue.identity.work_queue_item_digest,
    };
    if (!sameJson(evidence.task_governance_binding, expectedGovernance)) {
      errors.push("resume decision Task Governance binding does not match the exact Work Queue lineage");
    }
  }

  if (currentProject.ok && queue.ok && governance.ok) {
    const expectedChecks = new Map(expectedResumeChecks(currentProject.value, queue.identity, governance.evidence)
      .map((item) => [item.check_id, item.evidence_digest]));
    const observedChecks = Array.isArray(evidence.pre_resume_checks) ? evidence.pre_resume_checks : [];
    const observedIds = observedChecks.map((item) => item?.check_id);
    if (new Set(observedIds).size !== RESUME_DECISION_CHECK_IDS.length
      || RESUME_DECISION_CHECK_IDS.some((id) => !observedIds.includes(id))) {
      errors.push("resume decision must record every required pre-resume check exactly once");
    }
    for (const check of observedChecks) {
      if (expectedChecks.get(check?.check_id) !== check?.evidence_digest) {
        errors.push(`resume decision pre-resume check ${check?.check_id || "<missing>"} does not bind current evidence`);
      }
    }
  }

  const approved = evidence.decision?.state === "APPROVED"
    && (evidence.pre_resume_checks || []).every((item) => item.status === "PASS")
    && (evidence.blocking_findings || []).length === 0;
  if (options.requireApproved !== false && !approved) errors.push("resume decision is not approved with all pre-resume checks passing");
  if (options.expected) checkExpectedResumeBinding(evidence, options.expected, errors);
  return {
    ok: errors.length === 0,
    approved: errors.length === 0 && approved,
    errors,
    evidence,
    resolved,
    workQueue: queue.ok ? queue : null,
    taskGovernance: governance.ok ? governance : null,
  };
}

function resolveStrictTaskGovernance(projectRoot, reference, options = {}) {
  const resolved = resolveAuthoritativeEvidenceReference(projectRoot, options.fromFile || "", reference, { markdownOnly: true });
  if (!resolved.ok) return { ok: false, errors: [`Task Governance ref is unsafe or unresolved: ${resolved.error}`] };
  if (isArchivedTaskAuthorityRef(resolved.relativePath)) return { ok: false, errors: ["archived Task Governance cannot restore task authority"] };
  const extracted = extractMachineReadableEvidence(fs.readFileSync(resolved.file, "utf8"));
  if (!extracted?.ok || extracted.value?.artifact_type !== "task_governance") {
    return { ok: false, errors: ["Task Governance ref does not contain typed governance evidence"] };
  }
  const evidence = extracted.value;
  const errors = [];
  if (evidence.task_governance_digest !== evidenceDigest(evidence, ["task_governance_digest"])) errors.push("Task Governance digest is invalid");
  if (normalizeArtifactPath(evidence.task_governance_ref) !== resolved.relativePath) errors.push("Task Governance self-reference does not point to this report");
  const lineage = validateTaskGovernanceLineage(projectRoot, evidence, {
    fromFile: resolved.file,
    requireCurrent: Boolean(options.requireCurrent),
    requireWorkQueueAuthority: true,
  });
  errors.push(...lineage.errors);
  return { ok: errors.length === 0, errors, evidence, resolved, lineage };
}

function expectedResumeChecks(project, workQueueIdentity, governance) {
  const priorEvidenceDigest = evidenceDigest({
    work_queue_item_digest: workQueueIdentity.work_queue_item_digest,
    task_governance_digest: governance.task_governance_digest,
  }, []);
  return [
    { check_id: "PROJECT_IDENTITY_CURRENT", evidence_digest: project.fingerprint },
    { check_id: "PROJECT_REVISION_CURRENT", evidence_digest: project.revision },
    { check_id: "WORK_QUEUE_ITEM_CURRENT", evidence_digest: workQueueIdentity.work_queue_item_digest },
    { check_id: "TASK_GOVERNANCE_CURRENT", evidence_digest: governance.task_governance_digest },
    { check_id: "WORKTREE_REVIEWED", evidence_digest: project.revision },
    { check_id: "PRIOR_EVIDENCE_CURRENT", evidence_digest: priorEvidenceDigest },
  ];
}

function checkExpectedResumeBinding(evidence, expected, errors) {
  const queue = evidence.work_queue_item_binding || {};
  const governance = evidence.task_governance_binding || {};
  if (expected.workQueueItemRef && normalizeArtifactReference(queue.ref) !== normalizeArtifactReference(expected.workQueueItemRef)) errors.push("resume decision Work Queue ref does not match the selected route");
  if (expected.workQueueItemDigest && queue.digest !== expected.workQueueItemDigest) errors.push("resume decision Work Queue digest does not match the selected route");
  if (expected.taskGovernanceRef && normalizeArtifactPath(governance.ref) !== normalizeArtifactPath(expected.taskGovernanceRef)) errors.push("resume decision Task Governance ref does not match the selected route");
  if (expected.taskGovernanceDigest && governance.digest !== expected.taskGovernanceDigest) errors.push("resume decision Task Governance digest does not match the selected route");
  if (expected.taskRef && queue.task_ref !== expected.taskRef) errors.push("resume decision task_ref does not match the selected route");
  if (expected.intentDigest && queue.intent_digest !== expected.intentDigest) errors.push("resume decision intent_digest does not match the selected route");
}

function safeProjectIdentity(projectRoot) {
  try {
    return { ok: true, value: projectIdentity(projectRoot), error: "" };
  } catch (error) {
    return { ok: false, value: null, error: `cannot establish current project identity for resume decision: ${error.message}` };
  }
}

export function checkTaskEntryBinding({
  content = "",
  evidence = null,
  label,
  projectRoot,
  consumer,
  requireTaskGovernance = false,
  requireWorkQueue = false,
  strictTaskConsumer = false,
  pass,
  fail,
}) {
  const binding = evidence?.task_entry_binding || parseMarkdownTaskEntryBinding(content);
  const required = requireTaskGovernance || requireWorkQueue || strictTaskConsumer;
  const requireCurrentLineage = strictTaskConsumer && consumerClaimsDone(consumer, evidence);
  if (!required && !binding) {
    pass(`${label} task entry binding is optional in compatibility mode`);
    return;
  }
  if (!binding || typeof binding !== "object") {
    fail(`${label} requires task_entry_binding in strict task consumer mode`);
    return;
  }

  pass(`${label} includes task entry binding`);
  const tier = String(binding.task_governance_tier || "").trim();
  if (TIERS.has(tier)) pass(`${label} task governance tier is valid`);
  else fail(`${label} task governance tier is invalid: ${tier || "<empty>"}`);

  let workQueueBinding = null;
  let taskGovernanceBinding = null;
  if (requireWorkQueue || strictTaskConsumer) {
    workQueueBinding = checkWorkQueueBinding({
      binding,
      label,
      projectRoot,
      consumerEvidence: evidence,
      strictTaskConsumer,
      requireCurrentLineage,
      pass,
      fail,
    });
  }
  if (requireTaskGovernance || strictTaskConsumer) {
    taskGovernanceBinding = checkTaskGovernanceBinding({
      binding,
      label,
      projectRoot,
      consumerEvidence: evidence,
      strictTaskConsumer,
      requireCurrentLineage,
      pass,
      fail,
    });
  }
  if (strictTaskConsumer && workQueueBinding?.item && taskGovernanceBinding?.evidence) {
    checkJointBinding({ binding, workQueueBinding, taskGovernanceBinding, label, pass, fail });
  }
  checkTierRules({ binding, tier, label, consumer, evidence, projectRoot, pass, fail });
}

function checkWorkQueueBinding({ binding, label, projectRoot, consumerEvidence, strictTaskConsumer, requireCurrentLineage, pass, fail }) {
  const ref = String(binding.work_queue_item_ref || "").trim();
  const digest = String(binding.work_queue_item_digest || "").trim();
  const state = String(binding.work_queue_item_state || "").trim();
  const taskMatch = String(binding.work_queue_item_current_task_match || "").trim();
  const resume = String(binding.approved_resume_review || "No").trim();

  if (ref && ref !== "N/A") pass(`${label} work queue item ref is present`);
  else fail(`${label} requires work_queue_item_ref`);
  if (SHA_RE.test(digest)) pass(`${label} work queue item digest is sha256`);
  else fail(`${label} requires sha256 work_queue_item_digest`);
  if (state === "CURRENT" || (state === "PAUSED" && resume === "Yes")) pass(`${label} work queue item is current or is PAUSED with approved resume review`);
  else fail(`${label} work queue item must be CURRENT unless approved resume review is recorded`);
  if (taskMatch === "Yes") pass(`${label} work queue item matches current task`);
  else fail(`${label} work queue item must match current task`);

  const resolved = resolveArtifact(projectRoot, ref);
  if (!resolved) {
    fail(`${label} work_queue_item_ref does not resolve: ${ref || "<missing>"}`);
    return null;
  }
  const sourceContent = fs.readFileSync(resolved.file, "utf8");
  if (strictTaskConsumer) {
    const validation = validateEvidenceBlock(
      sourceContent,
      loadSchema(projectRoot, "schemas/artifacts/work-queue-takeover.schema.json"),
      `${label} referenced Work Queue report`,
      { require: true, digestField: "work_queue_takeover_digest" },
    );
    if (validation.ok) pass(`${label} referenced Work Queue report has valid structured evidence`);
    else validation.errors.forEach((error) => fail(error));
  }
  const extracted = extractMachineReadableEvidence(sourceContent);
  if (!extracted?.ok) {
    fail(`${label} work queue source has invalid Machine-Readable Evidence`);
    return null;
  }
  const queueIntent = normalizeTaskIntent(extracted.value.intent);
  if (extracted.value.intent !== queueIntent || extracted.value.intent_digest !== taskIntentDigest(queueIntent)) {
    fail(`${label} Work Queue intent_digest must be recomputed from normalized intent`);
  } else {
    pass(`${label} Work Queue intent and intent_digest are canonical`);
  }
  if (strictTaskConsumer && !consumerEvidence?.intent_digest) {
    fail(`${label} strict task consumer requires consumer intent_digest`);
  } else if (!strictTaskConsumer || extracted.value.intent_digest === consumerEvidence.intent_digest) {
    pass(`${label} work queue intent_digest matches consumer intent`);
  } else {
    fail(`${label} work queue intent_digest ${extracted.value.intent_digest || "<missing>"} must match consumer intent ${consumerEvidence.intent_digest || "<missing>"}`);
  }
  const items = Array.isArray(extracted.value?.queue_items) ? extracted.value.queue_items : [];
  const item = resolved.fragment
    ? items.find((candidate) => candidate.item_id === resolved.fragment)
    : items.find((candidate) => candidate.source_item_digest === digest);
  if (!item) {
    if (resolved.fragment) {
      fail(`${label} work queue fragment ${resolved.fragment} does not exactly match an item_id in ${ref}`);
    } else {
      fail(`${label} work queue item digest/ref does not match a queue item in ${ref}`);
    }
    return;
  }
  pass(`${label} work queue item resolves to queue report`);
  const itemIdentity = deriveWorkQueueTaskIdentity({
    workQueueItemRef: ref,
    item,
    intent: queueIntent,
  });
  if (item.source_item_digest === digest) {
    pass(`${label} work queue item digest matches the legacy source item`);
  } else if (itemIdentity.ok && itemIdentity.work_queue_item_digest === digest) {
    pass(`${label} work queue item digest binds the exact task instance`);
  } else if (!requireCurrentLineage) {
    fail(`${label} work queue item digest does not match the source item or exact task instance`);
  }
  if (item.state === state) pass(`${label} work queue item state matches queue report`);
  else fail(`${label} work queue item state ${state || "<empty>"} must match queue report ${item.state || "<empty>"}`);
  if (["STALE", "RISKY"].includes(sourceStatusFor(extracted.value, item.source_item))) {
    fail(`${label} stale or risky work queue source cannot feed execution/completion`);
  }
  let identity = null;
  if (requireCurrentLineage) {
    const current = resolveWorkQueueTaskIdentity(projectRoot, ref, { requireCurrent: true });
    if (!current.ok) {
      fail(`${label} current Work Queue task lineage is invalid: ${current.error}`);
    } else {
      identity = current.identity;
      if (digest === identity.work_queue_item_digest) pass(`${label} work queue item digest binds the exact task instance`);
      else fail(`${label} work_queue_item_digest must bind the exact Work Queue task instance`);
      if (consumerEvidence?.task_ref === identity.task_ref) pass(`${label} Work Queue task_ref matches consumer task`);
      else fail(`${label} Work Queue task_ref must match consumer task_ref`);
      if (consumerEvidence?.intent_digest === identity.intent_digest) pass(`${label} Work Queue item intent_digest matches consumer intent`);
      else fail(`${label} Work Queue item intent_digest must match consumer intent_digest`);
      if (consumerEvidence?.intent && normalizeTaskIntent(consumerEvidence.intent) !== identity.intent) {
        fail(`${label} Work Queue item intent text must match consumer intent text`);
      }
    }
  }
  return { evidence: extracted.value, item, resolved, identity };
}

function checkTaskGovernanceBinding({ binding, label, projectRoot, consumerEvidence, strictTaskConsumer, requireCurrentLineage, pass, fail }) {
  const ref = String(binding.task_governance_ref || "").trim();
  const digest = String(binding.task_governance_digest || "").trim();
  const match = String(binding.task_governance_task_match || "").trim();
  if (ref && ref !== "N/A") pass(`${label} task governance ref is present`);
  else fail(`${label} requires task_governance_ref`);
  if (SHA_RE.test(digest)) pass(`${label} task governance digest is sha256`);
  else fail(`${label} requires sha256 task_governance_digest`);
  if (match === "Yes") pass(`${label} task governance matches current task`);
  else fail(`${label} task governance must match current task`);

  const resolved = resolveArtifact(projectRoot, ref);
  if (!resolved) {
    fail(`${label} task_governance_ref does not resolve: ${ref || "<missing>"}`);
    return null;
  }
  const sourceContent = fs.readFileSync(resolved.file, "utf8");
  if (strictTaskConsumer) {
    const validation = validateEvidenceBlock(
      sourceContent,
      loadSchema(projectRoot, "schemas/artifacts/task-governance.schema.json"),
      `${label} referenced Task Governance report`,
      { require: true, digestField: "task_governance_digest" },
    );
    if (validation.ok) pass(`${label} referenced Task Governance report has valid structured evidence`);
    else validation.errors.forEach((error) => fail(error));
  }
  const extracted = extractMachineReadableEvidence(sourceContent);
  if (!extracted?.ok) {
    fail(`${label} task governance source has invalid Machine-Readable Evidence`);
    return null;
  }
  const taskGovernance = extracted.value;
  if (taskGovernance.task_governance_digest === digest) pass(`${label} task governance digest matches referenced report`);
  else fail(`${label} task governance digest does not match referenced report`);
  if (taskGovernance.impact_classification?.task_impact === binding.task_governance_tier) {
    pass(`${label} task governance tier matches referenced report`);
  } else {
    fail(`${label} task governance tier must match referenced report`);
  }
  if (strictTaskConsumer && !consumerEvidence?.task_ref) {
    fail(`${label} strict task consumer requires consumer task_ref`);
  } else if (!consumerEvidence?.task_ref || taskGovernance.task_ref === consumerEvidence.task_ref) {
    pass(`${label} task governance task_ref matches consumer task`);
  } else {
    fail(`${label} task governance task_ref ${taskGovernance.task_ref || "<missing>"} must match consumer task ${consumerEvidence.task_ref || "<missing>"}`);
  }
  if (strictTaskConsumer && !consumerEvidence?.intent_digest) {
    fail(`${label} strict task consumer requires consumer intent_digest`);
  } else if (!strictTaskConsumer || taskGovernance.intent_digest === consumerEvidence.intent_digest) {
    pass(`${label} task governance intent_digest matches consumer intent`);
  } else {
    fail(`${label} task governance intent_digest ${taskGovernance.intent_digest || "<missing>"} must match consumer intent ${consumerEvidence.intent_digest || "<missing>"}`);
  }
  if (taskGovernance.intent !== normalizeTaskIntent(taskGovernance.intent)
    || taskGovernance.intent_digest !== taskIntentDigest(taskGovernance.intent)) {
    fail(`${label} Task Governance intent_digest must be recomputed from normalized intent`);
  } else {
    pass(`${label} Task Governance intent and intent_digest are canonical`);
  }
  if (consumerEvidence?.intent && normalizeTaskIntent(consumerEvidence.intent) !== taskGovernance.intent) {
    fail(`${label} Task Governance intent text must match consumer intent text`);
  }
  const lineage = validateTaskGovernanceLineage(projectRoot, taskGovernance, {
    fromFile: resolved.file,
    requireCurrent: requireCurrentLineage,
  });
  if (lineage.ok) pass(`${label} Task Governance lineage is valid for its authority mode`);
  else lineage.errors.forEach((error) => fail(`${label} ${error}`));
  return { evidence: taskGovernance, resolved, lineage };
}

function checkJointBinding({ binding, workQueueBinding, taskGovernanceBinding, label, pass, fail }) {
  const workQueueItem = workQueueBinding.item;
  if (workQueueItem.task_governance_ref === stripArtifactPrefix(binding.task_governance_ref)) {
    pass(`${label} work queue item task governance ref matches binding`);
  } else {
    fail(`${label} work queue item task governance ref ${workQueueItem.task_governance_ref || "<missing>"} must match binding ${stripArtifactPrefix(binding.task_governance_ref) || "<missing>"}`);
  }
  if (workQueueItem.task_governance_digest === binding.task_governance_digest) {
    pass(`${label} work queue item task governance digest matches binding`);
  } else {
    fail(`${label} work queue item task governance digest must match binding task governance digest`);
  }
  if (binding.task_governance_blocks_completion === "No") {
    if (workQueueItem.task_governance_binding_status === "VERIFIED") {
      pass(`${label} work queue item has verified Task Governance binding`);
    } else {
      fail(`${label} work queue item must have VERIFIED Task Governance binding before done-capable consumer claims`);
    }
  }
  if (workQueueBinding.identity) {
    if (taskGovernanceBinding.evidence.task_ref === workQueueBinding.identity.task_ref) {
      pass(`${label} Work Queue and Task Governance share the exact task-instance ref`);
    } else {
      fail(`${label} Work Queue and Task Governance task_ref must match the exact task instance`);
    }
    if (taskGovernanceBinding.evidence.intent === workQueueBinding.identity.intent
      && taskGovernanceBinding.evidence.intent_digest === workQueueBinding.identity.intent_digest) {
      pass(`${label} Work Queue and Task Governance share exact intent text and digest`);
    } else {
      fail(`${label} Work Queue and Task Governance intent text and digest must match`);
    }
  }
}

function checkResumeReviewBinding({ binding, label, projectRoot, pass, fail }) {
  if (String(binding.approved_resume_review || "").trim() !== "Yes") return;
  const ref = String(binding.resume_review_ref || "").trim();
  const digest = String(binding.resume_review_digest || "").trim();
  const owner = String(binding.resume_review_owner || "").trim();
  const taskMatch = String(binding.resume_review_task_match || "").trim();
  if (ref && ref !== "N/A") pass(`${label} approved resume review has ref`);
  else fail(`${label} approved resume review requires resume_review_ref`);
  if (SHA_RE.test(digest)) pass(`${label} approved resume review has sha256 digest`);
  else fail(`${label} approved resume review requires sha256 resume_review_digest`);
  if (owner && owner !== "N/A") pass(`${label} approved resume review has owner`);
  else fail(`${label} approved resume review requires resume_review_owner`);
  if (taskMatch === "Yes") pass(`${label} approved resume review matches current task`);
  else fail(`${label} approved resume review requires resume_review_task_match Yes`);
  const validation = validateTaskResumeDecision(projectRoot, ref, {
    requireApproved: true,
    expected: {
      workQueueItemRef: binding.work_queue_item_ref,
      workQueueItemDigest: binding.work_queue_item_digest,
      taskGovernanceRef: binding.task_governance_ref,
      taskGovernanceDigest: binding.task_governance_digest,
    },
  });
  if (!validation.ok) {
    validation.errors.forEach((error) => fail(`${label} approved resume review ${error}`));
    return;
  }
  if (validation.evidence.resume_decision_digest === digest) pass(`${label} approved resume review digest matches canonical structured evidence`);
  else fail(`${label} approved resume review digest must match canonical structured resume decision evidence`);
  if (validation.evidence.decision.decided_by === owner) pass(`${label} approved resume review owner matches structured decision authority`);
  else fail(`${label} approved resume review owner must match structured decision authority`);
}

function checkTierRules({ binding, tier, label, consumer, evidence, projectRoot, pass, fail }) {
  checkResumeReviewBinding({ binding, label, projectRoot, pass, fail });
  const blockers = Array.isArray(binding.unresolved_task_governance_blockers)
    ? binding.unresolved_task_governance_blockers
    : parseList(binding.unresolved_task_governance_blockers);
  const blocksCompletion = String(binding.task_governance_blocks_completion || "").trim();
  const satisfied = String(binding.tier_completion_requirements_satisfied || "").trim();
  const reviewLevel = String(binding.task_governance_review_level || "").trim();
  const minimal = String(binding.minimal_verification_status || "").trim();
  const targeted = String(binding.targeted_verification_status || "").trim();
  const highChain = String(binding.high_impact_evidence_chain_complete || "N/A").trim();
  const plainBlocker = String(binding.plain_user_blocker || "").trim();
  const claimsDone = consumerClaimsDone(consumer, evidence);
  const blocked = blocksCompletion === "Yes";

  if (blocksCompletion === "Yes" && claimsDone) {
    fail(`${label} cannot claim done/complete while Task Governance blocks completion`);
  }
  if (blocksCompletion === "Yes" && blockers.length === 0) {
    fail(`${label} blocking Task Governance requires unresolved blocker details`);
  }
  if (blocksCompletion === "Yes" && !plainBlocker) {
    fail(`${label} blocking Task Governance requires a plain user blocker`);
  }

  if (tier === "LOW") {
    if (reviewLevel === "LIGHTWEIGHT") pass(`${label} LOW task uses lightweight review`);
    else fail(`${label} LOW task must use LIGHTWEIGHT review`);
    if (claimsDone || !blocked) {
      if (["RECORDED", "NOT_APPLICABLE_WITH_REASON"].includes(minimal)) pass(`${label} LOW task has acceptable minimal verification status`);
      else fail(`${label} LOW task requires recorded minimal verification or accepted reason before done claim`);
      if (satisfied === "Yes") pass(`${label} LOW task completion requirements are satisfied`);
      else fail(`${label} LOW task cannot claim complete until lightweight requirements are satisfied`);
    } else {
      pass(`${label} LOW task may remain blocked before lightweight completion requirements are satisfied`);
    }
  }
  if (tier === "MEDIUM") {
    if (reviewLevel === "TARGETED") pass(`${label} MEDIUM task uses targeted review`);
    else fail(`${label} MEDIUM task must use TARGETED review`);
    if (claimsDone || !blocked) {
      if (targeted === "RECORDED") pass(`${label} MEDIUM task has targeted verification recorded`);
      else fail(`${label} MEDIUM task requires targeted verification recorded before done claim`);
      if (satisfied === "Yes") pass(`${label} MEDIUM task completion requirements are satisfied`);
      else fail(`${label} MEDIUM task cannot claim complete until targeted requirements are satisfied`);
    } else {
      pass(`${label} MEDIUM task may remain blocked before targeted completion requirements are satisfied`);
    }
  }
  if (tier === "POSSIBLE_HIGH") {
    if (blocksCompletion === "Yes") pass(`${label} unresolved POSSIBLE_HIGH blocks completion`);
    else fail(`${label} POSSIBLE_HIGH must block completion until resolved`);
    if (!claimsDone) pass(`${label} POSSIBLE_HIGH does not claim done`);
    else fail(`${label} unresolved POSSIBLE_HIGH cannot claim done`);
  }
  if (tier === "HIGH") {
    if (reviewLevel === "FULL") pass(`${label} HIGH task uses full review`);
    else fail(`${label} HIGH task must use FULL review`);
    if (claimsDone || !blocked) {
      if (highChain === "Yes") pass(`${label} HIGH task has complete high-impact evidence chain`);
      else fail(`${label} HIGH task requires complete high-impact evidence chain before done claim`);
      if (satisfied === "Yes") pass(`${label} HIGH task completion requirements are satisfied`);
      else fail(`${label} HIGH task cannot claim complete until full requirements are satisfied`);
    } else {
      pass(`${label} HIGH task may remain blocked before full completion requirements are satisfied`);
    }
  }
}

function consumerClaimsDone(consumer, evidence) {
  if (!evidence) return false;
  if (consumer === "execution_assurance") return evidence.assurance_state === "VERIFIED_DONE" || evidence.can_claim_done === "Yes";
  if (consumer === "completion_evidence") return evidence.completion_state === "COMPLETION_EVIDENCE_READY" || evidence.can_claim_complete === "Yes";
  if (consumer === "closure_decision") return evidence.decision === "DONE" || evidence.closure_decision === "DONE";
  if (consumer === "user_delivery_console") return evidence.task_done === "Yes" || evidence.outcome === "TASK_DONE_WITH_EVIDENCE";
  return false;
}

function parseMarkdownTaskEntryBinding(content) {
  const body = sectionBody(content, "Task Entry Binding", { fallback: "" }) || "";
  if (!body.trim()) return null;
  const binding = {};
  for (const line of body.split(/\r?\n/)) {
    if (!line.trim().startsWith("|")) continue;
    const cells = line.split("|").slice(1, -1).map((cell) => stripMarkdown(cell.trim()));
    if (cells.length < 2 || !cells[0] || /^-+$/.test(cells[0])) continue;
    binding[keyFor(cells[0])] = cells[1] || "";
  }
  return binding;
}

function keyFor(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function parseList(value) {
  return String(value || "")
    .split(/[,;]+/)
    .map((item) => item.trim())
    .filter((item) => item && item !== "N/A" && item !== "None");
}

function sourceStatusFor(evidence, sourceItem) {
  const match = (evidence.source_inventory || []).find((item) => item.source_ref === sourceItem);
  return match?.status || "";
}

function resolveArtifact(projectRoot, ref) {
  const resolved = resolveAuthoritativeEvidenceReference(projectRoot, "", ref, { markdownOnly: true });
  return resolved.ok ? resolved : null;
}

function stripArtifactPrefix(ref) {
  const raw = String(ref || "").trim().replace(/^(artifact|file):/, "");
  return raw.split("#")[0];
}

function normalizeArtifactReference(value) {
  const raw = String(value || "").trim().replace(/^(artifact|file):/i, "");
  if (!raw) return "";
  return `artifact:${raw}`;
}

function normalizeArtifactPath(value) {
  return String(value || "")
    .trim()
    .replace(/^(?:artifact|file):/i, "")
    .split("#")[0]
    .replaceAll("\\", "/")
    .replace(/^\.\//, "");
}

function normalizeResumeDecisionRef(value) {
  const normalized = normalizeArtifactPath(value);
  if (!normalized || !/\.md$/i.test(normalized) || path.posix.isAbsolute(normalized)) return "";
  const portable = path.posix.normalize(normalized);
  if (portable === ".." || portable.startsWith("../") || portable.includes("/../")) return "";
  return portable;
}

function isArchivedTaskAuthorityRef(value) {
  const normalized = normalizeArtifactPath(value).toLowerCase();
  const segments = normalized.split("/").filter(Boolean);
  return segments.some((segment) => /^(?:archive|archived|history|historical)(?:[-_.].*)?$/.test(segment))
    || /(?:^|[-_.])(?:archive|archived|historical)(?:[-_.]|$)/.test(path.posix.basename(normalized, ".md"));
}

function sameJson(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function digest(value) {
  return `sha256:${crypto.createHash("sha256").update(String(value)).digest("hex")}`;
}

export function fileDigest(file) {
  return `sha256:${crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex")}`;
}
