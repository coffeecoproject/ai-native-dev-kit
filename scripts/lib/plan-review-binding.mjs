import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  evidenceDigest,
  extractMachineReadableEvidence,
  loadSchema,
  validateEvidenceBlock,
} from "./artifact-schema.mjs";
import { canonicalFileDigest, resolveAuthoritativeEvidenceReference } from "./evidence-authority.mjs";
import { planContainsCurrentIntent } from "./task-obligations.mjs";
import {
  normalizeTaskIntent,
  resolveWorkQueueTaskIdentity,
  taskIntentDigest,
  validateEmbeddedTaskGovernanceLineage,
  validateTaskGovernanceLineage,
} from "./task-entry-binding.mjs";

const readyStates = new Set(["PLAN_REVIEW_PASSED", "NO_PLAN_REQUIRED"]);
const scriptsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const currentPlanReviewSchemaVersion = "1.113.0";
const sourceContracts = Object.freeze({
  apply_plan: Object.freeze({
    digestField: "plan_digest",
    bindingDigest: "artifact",
    taskIdentity: false,
  }),
  task_governance: Object.freeze({
    schema: "schemas/artifacts/task-governance.schema.json",
    digestField: "task_governance_digest",
    bindingDigest: "file",
    checker: "check-task-governance.mjs",
    checkerArgs: ["--require-report", "--require-structured-evidence"],
    taskIdentity: true,
  }),
  verification_plan: Object.freeze({
    schema: "schemas/artifacts/verification-plan.schema.json",
    digestField: "verification_plan_digest",
    bindingDigest: "file",
    checker: "check-verification-plan.mjs",
    checkerArgs: ["--require-report", "--require-structured-evidence", "--strict-source-binding", "--require-evidence-authority"],
    taskIdentity: true,
  }),
  business_rule_closure: Object.freeze({
    schema: "schemas/artifacts/business-rule-closure.schema.json",
    digestField: "closure_digest",
    bindingDigest: "file",
    checker: "check-business-rule-closure.mjs",
    checkerArgs: ["--require-report", "--require-structured-evidence", "--require-business-rule-closure"],
    taskIdentity: true,
  }),
  change_impact_coverage: Object.freeze({
    schema: "schemas/artifacts/change-impact-coverage.schema.json",
    digestField: "impact_digest",
    bindingDigest: "file",
    checker: "check-change-impact-coverage.mjs",
    checkerArgs: ["--require-structured-evidence", "--resolve-evidence-refs"],
    taskIdentity: true,
  }),
  business_universe_coverage: Object.freeze({
    schema: "schemas/artifacts/business-universe-coverage.schema.json",
    digestField: "coverage_digest",
    bindingDigest: "file",
    checker: "check-business-universe-coverage.mjs",
    checkerArgs: ["--require-report", "--require-structured-evidence"],
    readyCheckerArgs: ["--require-ready"],
    taskIdentity: true,
  }),
  control_effectiveness: Object.freeze({
    schema: "schemas/artifacts/control-effectiveness.schema.json",
    digestField: "report_digest",
    bindingDigest: "artifact",
    checker: "check-control-effectiveness.mjs",
    checkerArgs: ["--require-report", "--require-structured-evidence"],
    readyCheckerArgs: ["--require-effective"],
    checkerIdentityArgs: true,
    taskIdentity: true,
    requiresIntentText: false,
  }),
  review_surface_card: Object.freeze({
    bindingDigest: "file",
    checker: "check-review-surface.mjs",
    checkerArgs: [],
    checkerAcceptsReport: false,
    taskIdentity: false,
  }),
  project_native_review_surface: Object.freeze({ bindingDigest: "file", taskIdentity: false }),
  project_native_equivalent: Object.freeze({ bindingDigest: "file", taskIdentity: false }),
});

export function checkPlanReviewBinding({
  projectRoot,
  currentFile,
  evidence,
  label,
  requirePlanReview,
  consumer,
  consumerPlanRef,
  consumerPlanDigest,
  consumerPlanLabel = "consumer plan",
  requireCurrentTaskLineage,
  pass,
  fail,
}) {
  const binding = evidence?.plan_review_binding;
  if (!binding) {
    if (requirePlanReview) {
      fail(`${label} requires plan_review_binding before ${consumer} can consume Plan Review Gate`);
    } else {
      pass(`${label} plan review binding is optional for this consumer mode`);
    }
    return;
  }

  for (const field of [
    "required",
    "plan_review_ref",
    "plan_review_digest",
    "plan_review_state",
    "plan_ref",
    "plan_digest",
    "task_ref",
    "current_task_match",
    "ready_for_implementation_review",
    "implementation_authorized_by_this_report",
    "reason",
  ]) {
    if (Object.prototype.hasOwnProperty.call(binding, field)) pass(`${label} plan_review_binding includes ${field}`);
    else fail(`${label} plan_review_binding missing ${field}`);
  }

  const bindingRequired = binding.required === "Yes";
  const mustBePassed = requirePlanReview || bindingRequired;
  if (requirePlanReview && !bindingRequired) {
    fail(`${label} --require-plan-review requires plan_review_binding.required Yes`);
  }
  if (binding.implementation_authorized_by_this_report === "No") {
    pass(`${label} plan review binding does not authorize implementation`);
  } else {
    fail(`${label} plan review binding must not authorize implementation`);
  }

  if (mustBePassed) {
    if (binding.plan_review_state === "PLAN_REVIEW_PASSED") pass(`${label} required plan review passed`);
    else fail(`${label} required plan review must be PLAN_REVIEW_PASSED, got ${binding.plan_review_state || "<missing>"}`);
    if (binding.ready_for_implementation_review === "Yes") pass(`${label} plan review is ready for implementation review`);
    else fail(`${label} required plan review must be ready_for_implementation_review Yes`);
    if (binding.current_task_match === "Yes") pass(`${label} plan review binding matches current task`);
    else fail(`${label} required plan review must match current task`);
  } else if (readyStates.has(binding.plan_review_state)) {
    pass(`${label} optional plan review binding has non-blocking state`);
  } else {
    fail(`${label} optional plan review binding records blocking state ${binding.plan_review_state || "<missing>"}`);
  }

  const resolved = resolveEvidenceReference(projectRoot, currentFile, binding.plan_review_ref);
  if (!resolved) {
    fail(`${label} plan_review_ref does not resolve: ${binding.plan_review_ref || "<missing>"}`);
    return;
  }
  pass(`${label} plan_review_ref resolves`);

  const schema = loadSchema(projectRoot, "schemas/artifacts/plan-review.schema.json");
  const result = validateEvidenceBlock(fs.readFileSync(resolved, "utf8"), schema, `${label} referenced Plan Review`, {
    require: true,
    digestField: "plan_review_digest",
  });
  if (!result.ok) {
    result.errors.forEach((error) => fail(error));
    return;
  }
  const planReviewEvidence = result.value;
  pass(`${label} referenced Plan Review schema and digest are valid`);

  const sourceValidation = validatePlanReviewSourceEvidence(projectRoot, resolved, planReviewEvidence, {
    requireCurrentTaskLineage: requireCurrentTaskLineage ?? mustBePassed,
  });
  sourceValidation.errors.forEach((error) => fail(`${label} referenced Plan Review ${error}`));
  if (sourceValidation.ok) pass(`${label} referenced Plan Review source chain resolves with current digests`);

  compare(label, "plan_review_digest", binding.plan_review_digest, planReviewEvidence.plan_review_digest, fail, pass);
  compare(label, "plan_review_state", binding.plan_review_state, planReviewEvidence.plan_review_state, fail, pass);
  compare(label, "plan_ref", binding.plan_ref, planReviewEvidence.plan_ref, fail, pass);
  compare(label, "plan_digest", binding.plan_digest, planReviewEvidence.plan_digest, fail, pass);
  compare(label, "task_ref", binding.task_ref, planReviewEvidence.task_ref, fail, pass);
  compareConsumerPlan(label, binding, { consumerPlanRef, consumerPlanDigest, consumerPlanLabel, fail, pass });

  if (evidence.task_ref) {
    if (binding.task_ref === evidence.task_ref && planReviewEvidence.task_ref === evidence.task_ref) {
      pass(`${label} plan review task_ref matches consumer task_ref`);
    } else {
      fail(`${label} plan review task_ref must match consumer task_ref`);
    }
  } else if (binding.current_task_match === "Yes") {
    pass(`${label} plan review binding records current task match for taskless consumer`);
  } else {
    fail(`${label} taskless consumer requires plan_review_binding.current_task_match Yes`);
  }
  if (planReviewEvidence.implementation_authorized_by_this_report === "No") {
    pass(`${label} referenced Plan Review remains non-authorizing`);
  } else {
    fail(`${label} referenced Plan Review must not authorize implementation`);
  }
}

export function validatePlanReviewSourceEvidence(projectRoot, reportFile, evidence, options = {}) {
  const errors = [];
  const checkerCache = new Map();
  const currentAuthority = Boolean(options.requireCurrentTaskLineage)
    || (evidence?.schema_version === currentPlanReviewSchemaVersion
      && readyStates.has(evidence?.plan_review_state));
  const normalizedIntent = normalizeTaskIntent(evidence?.intent);
  if (currentAuthority
    && (!normalizedIntent
      || evidence?.intent !== normalizedIntent
      || evidence?.intent_digest !== taskIntentDigest(normalizedIntent))) {
    errors.push("intent and intent_digest must be canonical and exact");
  }
  if (currentAuthority) {
    const workQueue = resolveWorkQueueTaskIdentity(projectRoot, evidence?.work_queue_item_ref, {
      fromFile: reportFile,
      requireCurrent: true,
    });
    if (!workQueue.ok) {
      errors.push(`Work Queue task lineage is not current authority: ${workQueue.error}`);
    } else if (evidence.work_queue_item_digest !== workQueue.identity.work_queue_item_digest
      || evidence.task_ref !== workQueue.identity.task_ref
      || evidence.intent !== workQueue.identity.intent
      || evidence.intent_digest !== workQueue.identity.intent_digest) {
      errors.push("Work Queue item, task_ref, intent text, and intent_digest must bind the exact task instance");
    }
  }
  const checkHistorical = (name, ref, digest, options = {}) => {
    const value = String(ref || "").trim();
    if (!value || value === "N/A" || value.startsWith("derived:")) {
      if (options.required) errors.push(`${name} must resolve to a concrete project-local file`);
      return;
    }
    const resolved = resolveAuthoritativeEvidenceReference(projectRoot, reportFile, value, { markdownOnly: true });
    if (!resolved.ok) {
      errors.push(`${name} ${value} is unsafe or unresolved: ${resolved.error}`);
      return;
    }
    const acceptedDigests = new Set([canonicalFileDigest(resolved.file)]);
    const sourceEvidence = extractMachineReadableEvidence(fs.readFileSync(resolved.file, "utf8"));
    const contract = options.sourceKind ? sourceContracts[options.sourceKind] : null;
    if (contract?.digestField && sourceEvidence?.ok && sourceEvidence.value && typeof sourceEvidence.value === "object") {
      const declaredDigest = sourceEvidence.value[contract.digestField];
      if (typeof declaredDigest === "string"
        && declaredDigest === evidenceDigest(sourceEvidence.value, [contract.digestField])) {
        acceptedDigests.add(declaredDigest);
      }
    }
    if (!acceptedDigests.has(digest) && !options.allowStale) {
      errors.push(`${name} digest ${digest || "<missing>"} does not match ${resolved.relativePath}`);
    }
  };
  const checkCurrent = (name, sourceKind, ref, digest, options = {}) => {
    const contract = sourceContracts[sourceKind];
    if (!contract) {
      errors.push(`${name} uses unsupported current source_kind ${sourceKind || "<missing>"}`);
      return;
    }
    const value = String(ref || "").trim();
    if (!value || value === "N/A" || value.startsWith("derived:")) {
      errors.push(`${name} must resolve to a concrete project-local file`);
      return;
    }
    const resolved = resolveAuthoritativeEvidenceReference(projectRoot, reportFile, value, { markdownOnly: true });
    if (!resolved.ok) {
      errors.push(`${name} ${value} is unsafe or unresolved: ${resolved.error}`);
      return;
    }
    const content = fs.readFileSync(resolved.file, "utf8");
    let sourceEvidence = null;
    if (contract.schema) {
      const checked = validateEvidenceBlock(
        content,
        loadSchema(projectRoot, contract.schema),
        name,
        { require: true, digestField: contract.digestField },
      );
      if (!checked.ok) {
        errors.push(...checked.errors);
        return;
      }
      sourceEvidence = checked.value;
    }
    const digestMode = options.bindingDigest || contract.bindingDigest;
    const expectedDigest = digestMode === "artifact"
      ? sourceEvidence?.[contract.digestField]
      : canonicalFileDigest(resolved.file);
    if (digest !== expectedDigest) {
      errors.push(`${name} digest ${digest || "<missing>"} does not match the trusted ${digestMode} digest ${expectedDigest || "<missing>"}`);
    }
    if (contract.taskIdentity) {
      const sourceTaskRef = sourceTaskRefFor(sourceEvidence);
      const sourceIntentDigest = sourceIntentDigestFor(sourceEvidence);
      const sourceIntent = sourceIntentFor(sourceEvidence);
      if (!options.taskRef || sourceTaskRef !== options.taskRef) {
        errors.push(`${name} task_ref ${sourceTaskRef || "<missing>"} does not match ${options.taskRef || "<missing>"}`);
      }
      if (!options.intentDigest || sourceIntentDigest !== options.intentDigest) {
        errors.push(`${name} intent digest ${sourceIntentDigest || "<missing>"} does not match ${options.intentDigest || "<missing>"}`);
      }
      if (contract.requiresIntentText !== false
        && (!options.intent || sourceIntent !== normalizeTaskIntent(options.intent))) {
        errors.push(`${name} intent text ${sourceIntent || "<missing>"} does not match the Plan Review intent`);
      }
      if (options.currentTaskMatch === "Yes"
        && (sourceTaskRef !== options.taskRef || sourceIntentDigest !== options.intentDigest)) {
        errors.push(`${name} claims current_task_match Yes without exact task and intent identity`);
      }
    }
    if (currentAuthority && sourceKind === "task_governance") {
      const lineage = validateTaskGovernanceLineage(projectRoot, sourceEvidence, {
        fromFile: resolved.file,
        requireCurrent: true,
      });
      errors.push(...lineage.errors.map((error) => `${name} ${error}`));
      if (lineage.current
        && (normalizeReference(sourceEvidence.task_lineage?.work_queue_item_ref) !== normalizeReference(evidence.work_queue_item_ref)
          || sourceEvidence.task_lineage?.work_queue_item_digest !== evidence.work_queue_item_digest)) {
        errors.push(`${name} Work Queue lineage does not match Plan Review`);
      }
    }
    if (currentAuthority && sourceKind === "business_rule_closure") {
      const lineage = validateEmbeddedTaskGovernanceLineage(projectRoot, sourceEvidence?.source_rule_refs, {
        taskRef: evidence.task_ref,
        intent: evidence.intent,
        intentDigest: evidence.intent_digest,
      }, {
        fromFile: resolved.file,
        requireCurrent: true,
      });
      errors.push(...lineage.errors.map((error) => `${name} ${error}`));
    }
    if (options.expectedOutcome) {
      const observedOutcome = sourceOutcomeFor(sourceEvidence, sourceKind);
      if (observedOutcome !== options.expectedOutcome) {
        errors.push(`${name} must be ${options.expectedOutcome}, observed ${observedOutcome || "<missing>"}`);
      }
    }
    if (options.runChecker !== false && contract.checker) {
      const cacheKey = [contract.checker, resolved.relativePath, options.expectedOutcome, options.taskRef, options.intentDigest, currentAuthority].join("\0");
      let checker = checkerCache.get(cacheKey);
      if (!checker) {
        checker = runTrustedSourceChecker(projectRoot, resolved.relativePath, contract, {
          requireReady: Boolean(options.expectedOutcome),
          taskRef: options.taskRef,
          intentDigest: options.intentDigest,
          requireCurrentTaskLineage: currentAuthority,
        });
        checkerCache.set(cacheKey, checker);
      }
      if (!checker.ok) errors.push(`${name} failed trusted ${contract.checker}: ${checker.reason}`);
    }
  };

  if (evidence.plan_ref !== "N/A") {
    checkHistorical("plan_ref", evidence.plan_ref, evidence.plan_digest, {
      required: !["PLAN_REQUIRED", "PLAN_DRAFTED", "PLAN_REVIEW_REQUIRED"].includes(evidence.plan_review_state),
      allowStale: evidence.plan_review_state === "BLOCKED_BY_STALE_PLAN",
      sourceKind: "apply_plan",
    });
    if (evidence.schema_version === "1.113.0") {
      const resolved = resolveAuthoritativeEvidenceReference(projectRoot, reportFile, evidence.plan_ref, { markdownOnly: true });
      if (resolved.ok && !planContainsCurrentIntent(fs.readFileSync(resolved.file, "utf8"), {
        intent: evidence.intent,
        intentDigest: evidence.intent_digest,
      })) {
        errors.push("plan_ref does not contain the current intent or exact intent digest");
      }
    }
  }
  if (evidence.schema_version === currentPlanReviewSchemaVersion) {
    checkCurrent("task_governance.ref", "task_governance", evidence.task_governance?.ref, evidence.task_governance?.digest, {
      bindingDigest: "artifact",
      taskRef: evidence.task_ref,
      intent: evidence.intent,
      intentDigest: evidence.intent_digest,
      currentTaskMatch: evidence.task_governance?.current_task_match,
    });
  } else {
    checkHistorical("task_governance.ref", evidence.task_governance?.ref, evidence.task_governance?.digest, {
      required: ["HIGH", "POSSIBLE_HIGH"].includes(evidence.task_impact) || evidence.plan_review_state === "PLAN_REVIEW_PASSED",
      sourceKind: "task_governance",
    });
  }
  checkHistorical("review_surface_analysis.ref", evidence.review_surface_analysis?.ref, evidence.review_surface_analysis?.digest, {
    required: evidence.plan_review_state === "PLAN_REVIEW_PASSED" && ["HIGH", "POSSIBLE_HIGH"].includes(evidence.task_impact),
    sourceKind: evidence.review_surface_analysis?.source,
  });
  const readyOutcomes = {
    verification_plan: "VERIFICATION_PLAN_READY",
    business_rule_closure: "READY_FOR_IMPACT_COVERAGE",
    change_impact_coverage: "CHANGE_IMPACT_RECORDED",
    business_universe_coverage: "COVERAGE_READY",
    control_effectiveness: "CONTROL_PROVEN_EFFECTIVE",
  };
  for (const source of evidence.source_chain || []) {
    if (evidence.schema_version === currentPlanReviewSchemaVersion) {
      checkCurrent(`source_chain.${source.source_kind}`, source.source_kind, source.source_ref, source.source_digest, {
        taskRef: evidence.task_ref,
        intent: evidence.intent,
        intentDigest: evidence.intent_digest,
        currentTaskMatch: source.current_task_match,
        expectedOutcome: evidence.plan_review_state === "PLAN_REVIEW_PASSED" ? readyOutcomes[source.source_kind] : "",
      });
    } else {
      checkHistorical(`source_chain.${source.source_kind}`, source.source_ref, source.source_digest, {
        required: true,
        sourceKind: source.source_kind,
      });
    }
  }
  return { ok: errors.length === 0, errors };
}

export function planReviewSourceDigest(sourceKind, file, evidence) {
  const contract = sourceContracts[sourceKind];
  if (!contract || !file) return "";
  if (contract.bindingDigest === "artifact") return String(evidence?.[contract.digestField] || "");
  return canonicalFileDigest(file);
}

function runTrustedSourceChecker(projectRoot, relativePath, contract, options) {
  const checker = path.join(scriptsDir, contract.checker);
  let checkerStat;
  try {
    checkerStat = fs.lstatSync(checker);
  } catch {
    return { ok: false, reason: "trusted checker is missing" };
  }
  if (!checkerStat.isFile() || checkerStat.isSymbolicLink()) {
    return { ok: false, reason: "trusted checker is not a regular file" };
  }
  const args = [checker, projectRoot];
  if (contract.checkerAcceptsReport !== false) args.push("--report", relativePath);
  args.push(...contract.checkerArgs);
  if (options.requireReady) args.push(...(contract.readyCheckerArgs || []));
  if (contract.checkerIdentityArgs) {
    args.push("--task-ref", options.taskRef, "--intent-digest", options.intentDigest);
  }
  if (options.requireCurrentTaskLineage) {
    if (contract.checker === "check-task-governance.mjs") args.push("--require-current-task-lineage");
    if (["check-business-rule-closure.mjs", "check-change-impact-coverage.mjs", "check-verification-plan.mjs"].includes(contract.checker)) {
      args.push("--require-task-lineage");
    }
  }
  const result = spawnSync(process.execPath, args, {
    cwd: projectRoot,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
  return {
    ok: result.status === 0,
    reason: result.status === 0 ? "checker passed" : firstCheckerFailure(result.stdout, result.stderr),
  };
}

function firstCheckerFailure(stdout, stderr) {
  const lines = `${stdout || ""}\n${stderr || ""}`
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  return (lines.find((line) => line.startsWith("FAIL ")) || lines.at(-1) || "checker failed").slice(0, 500);
}

function sourceTaskRefFor(value) {
  return String(value?.task_ref || value?.user_request?.task_ref || "").trim();
}

function sourceIntentDigestFor(value) {
  if (typeof value?.intent_digest === "string") return value.intent_digest;
  if (typeof value?.source_request_digest === "string") return value.source_request_digest;
  if (typeof value?.user_request?.intent !== "string") return "";
  return taskIntentDigest(value.user_request.intent);
}

function sourceIntentFor(value) {
  if (typeof value?.intent === "string") return normalizeTaskIntent(value.intent);
  if (typeof value?.user_request === "string") return normalizeTaskIntent(value.user_request);
  if (typeof value?.user_request?.intent === "string") return normalizeTaskIntent(value.user_request.intent);
  return "";
}

function sourceOutcomeFor(value, sourceKind) {
  const fields = {
    verification_plan: ["verification_state", "outcome"],
    business_rule_closure: ["state", "outcome"],
    change_impact_coverage: ["outcome", "impact_state"],
    business_universe_coverage: ["outcome"],
    control_effectiveness: ["outcome", "assessment_outcome"],
  }[sourceKind] || ["outcome", "state"];
  for (const field of fields) {
    if (typeof value?.[field] === "string" && value[field]) return value[field];
  }
  return "";
}

export function planReviewBindingSchema() {
  return {
    type: "object",
    additionalProperties: false,
    required: [
      "required",
      "plan_review_ref",
      "plan_review_digest",
      "plan_review_state",
      "plan_ref",
      "plan_digest",
      "task_ref",
      "current_task_match",
      "ready_for_implementation_review",
      "implementation_authorized_by_this_report",
      "reason",
    ],
    properties: {
      required: { enum: ["Yes", "No"] },
      plan_review_ref: { type: "string", minLength: 1 },
      plan_review_digest: { type: "string", pattern: "^sha256:[a-f0-9]{64}$" },
      plan_review_state: {
        enum: [
          "NO_PLAN_REQUIRED",
          "PLAN_REQUIRED",
          "PLAN_DRAFTED",
          "PLAN_REVIEW_REQUIRED",
          "PLAN_REVISION_REQUIRED",
          "PLAN_REVIEW_PASSED",
          "BLOCKED_BY_STALE_PLAN",
          "BLOCKED_BY_INCOMPLETE_REVIEW",
          "BLOCKED_BY_USER_DECISION",
          "BLOCKED_BY_REPEATED_PLAN_REVIEW_FAILURE",
          "PLAN_REVIEW_REQUIRED_WITH_TASK_GOVERNANCE_RECHECK",
        ],
      },
      plan_ref: { type: "string", minLength: 1 },
      plan_digest: { type: "string", minLength: 1 },
      task_ref: { type: "string", minLength: 1 },
      current_task_match: { enum: ["Yes", "No", "Unknown", "N/A"] },
      ready_for_implementation_review: { enum: ["Yes", "No"] },
      implementation_authorized_by_this_report: { enum: ["Yes", "No"] },
      reason: { type: "string", minLength: 1 },
    },
  };
}

function resolveEvidenceReference(projectRoot, currentFile, value) {
  const resolved = resolveAuthoritativeEvidenceReference(projectRoot, currentFile, value, { markdownOnly: true });
  return resolved.ok ? resolved.file : "";
}

function compare(label, field, actual, expected, fail, pass) {
  if (actual === expected) pass(`${label} plan review binding ${field} matches referenced report`);
  else fail(`${label} plan review binding ${field} ${actual || "<missing>"} must match referenced report ${expected || "<missing>"}`);
}

function compareConsumerPlan(label, binding, { consumerPlanRef, consumerPlanDigest, consumerPlanLabel, fail, pass }) {
  if (consumerPlanRef !== undefined) {
    if (sameReference(consumerPlanRef, binding.plan_ref)) {
      pass(`${label} ${consumerPlanLabel} ref matches plan_review_binding.plan_ref`);
    } else {
      fail(`${label} ${consumerPlanLabel} ref ${consumerPlanRef || "<missing>"} must match plan_review_binding.plan_ref ${binding.plan_ref || "<missing>"}`);
    }
  }
  if (consumerPlanDigest !== undefined) {
    if (consumerPlanDigest === binding.plan_digest) {
      pass(`${label} ${consumerPlanLabel} digest matches plan_review_binding.plan_digest`);
    } else {
      fail(`${label} ${consumerPlanLabel} digest ${consumerPlanDigest || "<missing>"} must match plan_review_binding.plan_digest ${binding.plan_digest || "<missing>"}`);
    }
  }
}

function sameReference(actual, expected) {
  return normalizeReference(actual) === normalizeReference(expected);
}

function normalizeReference(value) {
  return String(value || "").trim().replace(/^(artifact|file):/, "");
}

export function fileDigest(file) {
  return canonicalFileDigest(file);
}
