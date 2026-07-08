import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {
  extractMachineReadableEvidence,
  loadSchema,
  validateEvidenceBlock,
} from "./artifact-schema.mjs";
import { sectionBody, stripMarkdown } from "./markdown.mjs";

const SHA_RE = /^sha256:[a-f0-9]{64}$/;
const TIERS = new Set(["LOW", "MEDIUM", "POSSIBLE_HIGH", "HIGH"]);

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
    workQueueBinding = checkWorkQueueBinding({ binding, label, projectRoot, strictTaskConsumer, pass, fail });
  }
  if (requireTaskGovernance || strictTaskConsumer) {
    taskGovernanceBinding = checkTaskGovernanceBinding({
      binding,
      label,
      projectRoot,
      consumerEvidence: evidence,
      strictTaskConsumer,
      pass,
      fail,
    });
  }
  if (strictTaskConsumer && workQueueBinding?.item && taskGovernanceBinding?.evidence) {
    checkJointBinding({ binding, workQueueItem: workQueueBinding.item, label, pass, fail });
  }
  checkTierRules({ binding, tier, label, consumer, evidence, pass, fail });
}

function checkWorkQueueBinding({ binding, label, projectRoot, strictTaskConsumer, pass, fail }) {
  const ref = String(binding.work_queue_item_ref || "").trim();
  const digest = String(binding.work_queue_item_digest || "").trim();
  const state = String(binding.work_queue_item_state || "").trim();
  const taskMatch = String(binding.work_queue_item_current_task_match || "").trim();
  const resume = String(binding.approved_resume_review || "No").trim();

  if (ref && ref !== "N/A") pass(`${label} work queue item ref is present`);
  else fail(`${label} requires work_queue_item_ref`);
  if (SHA_RE.test(digest)) pass(`${label} work queue item digest is sha256`);
  else fail(`${label} requires sha256 work_queue_item_digest`);
  if (state === "CURRENT" || resume === "Yes") pass(`${label} work queue item is current or has approved resume review`);
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
  const items = Array.isArray(extracted.value?.queue_items) ? extracted.value.queue_items : [];
  const item = items.find((candidate) => {
    if (resolved.fragment && candidate.item_id === resolved.fragment) return true;
    return candidate.source_item_digest === digest;
  });
  if (!item) {
    fail(`${label} work queue item digest/ref does not match a queue item in ${ref}`);
    return;
  }
  pass(`${label} work queue item resolves to queue report`);
  if (item.source_item_digest === digest) pass(`${label} work queue item digest matches queue report`);
  else fail(`${label} work queue item digest does not match queue report`);
  if (item.state === state) pass(`${label} work queue item state matches queue report`);
  else fail(`${label} work queue item state ${state || "<empty>"} must match queue report ${item.state || "<empty>"}`);
  if (["STALE", "RISKY"].includes(sourceStatusFor(extracted.value, item.source_item))) {
    fail(`${label} stale or risky work queue source cannot feed execution/completion`);
  }
  return { evidence: extracted.value, item, resolved };
}

function checkTaskGovernanceBinding({ binding, label, projectRoot, consumerEvidence, strictTaskConsumer, pass, fail }) {
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
  return { evidence: taskGovernance, resolved };
}

function checkJointBinding({ binding, workQueueItem, label, pass, fail }) {
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
}

function checkResumeReviewBinding({ binding, label, pass, fail }) {
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
}

function checkTierRules({ binding, tier, label, consumer, evidence, pass, fail }) {
  checkResumeReviewBinding({ binding, label, pass, fail });
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
  const raw = String(ref || "").trim();
  const withoutPrefix = raw.replace(/^(artifact|file):/, "");
  const [relative, fragment] = withoutPrefix.split("#");
  if (!relative || path.isAbsolute(relative) || relative.includes("..")) return null;
  for (const base of [projectRoot, path.join(projectRoot, ".intentos")]) {
    const candidate = path.resolve(base, relative);
    const rel = path.relative(projectRoot, candidate);
    if (rel.startsWith("..") || path.isAbsolute(rel)) continue;
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return { file: candidate, fragment: fragment || "" };
    }
  }
  return null;
}

function stripArtifactPrefix(ref) {
  const raw = String(ref || "").trim().replace(/^(artifact|file):/, "");
  return raw.split("#")[0];
}

export function fileDigest(file) {
  return `sha256:${crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex")}`;
}
