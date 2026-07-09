import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {
  loadSchema,
  validateEvidenceBlock,
} from "./artifact-schema.mjs";

const readyStates = new Set(["PLAN_REVIEW_PASSED", "NO_PLAN_REQUIRED"]);

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
  const raw = String(value || "").replace(/^(artifact|file):/, "");
  if (!raw || path.isAbsolute(raw) || raw.includes("..")) return "";
  const candidates = [
    path.resolve(projectRoot, raw),
    currentFile ? path.resolve(path.dirname(currentFile), raw) : "",
  ].filter(Boolean);
  for (const candidate of candidates) {
    const relative = path.relative(projectRoot, candidate);
    if (relative.startsWith("..") || path.isAbsolute(relative)) continue;
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  return "";
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
  return `sha256:${crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex")}`;
}
