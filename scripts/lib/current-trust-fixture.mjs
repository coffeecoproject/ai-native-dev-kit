import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { evidenceDigest, extractMachineReadableEvidence } from "./artifact-schema.mjs";
import { createEvidenceAuthorityBinding } from "./evidence-authority.mjs";
import { collectGitChangedFiles } from "./execution-assurance-consumer.mjs";
import { controlEffectivenessBinding } from "./control-effectiveness.mjs";
import { taskIntentDigest } from "./task-entry-binding.mjs";
import { resolveRuntimeTrustBinding } from "./verification-runtime-consumer.mjs";

const DEFAULT_INTENT = "in one local appointment form, require service time before submit";
const OUTPUT_DIRECTORIES = [
  "business-rule-closures",
  "change-impact-coverage-reports",
  "closure-decisions",
  "completion-evidence-reports",
  "evidence",
  "execution-assurance-reports",
  "execution-closures",
  "guided-closure-cards",
  "launch-review-views",
  "plan-review-reports",
  "planning-closure-reports",
  "release-approval-records",
  "release-channel-policies",
  "release-evidence-gate-reports",
  "release-execution-plans",
  "review-summaries",
  "runtime-hygiene-reports",
  "task-governance-reports",
  "test-evidence-reports",
  "verification-plans",
  "work-queue",
  "work-queue-takeover-reports",
];

export function prepareCurrentTrustFixtureSource(projectRoot, options = {}) {
  const root = path.resolve(projectRoot);
  const intent = String(options.intent || DEFAULT_INTENT);
  const refs = fixtureRefs(options);
  appendGitIgnore(root, OUTPUT_DIRECTORIES.map((directory) => `${directory}/`));
  // Keep the fixture's module semantics independent from any parent package.
  // Runtime verification may place the isolated fixture inside this ESM repo.
  writeFile(root, "package.json", `${JSON.stringify({ private: true, type: "commonjs" }, null, 2)}\n`);
  writeFile(root, refs.source, `function validateAppointment(input = {}) {
  if (!String(input.serviceTime || "").trim()) {
    return { ok: false, status: 422, error: "Service time is required." };
  }
  return { ok: true, status: 201, value: { serviceTime: input.serviceTime } };
}

function submitAppointment(input = {}) {
  return validateAppointment(input);
}

module.exports = { submitAppointment, validateAppointment };
`);
  writeFile(root, refs.test, `const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const { submitAppointment, validateAppointment } = require("../src/appointment-validation.js");

const root = path.resolve(__dirname, "..");

test("primary appointment flow accepts a service time", () => {
  assert.equal(submitAppointment({ serviceTime: "09:30" }).status, 201);
});
test("existing valid behavior remains available", () => {
  assert.equal(validateAppointment({ serviceTime: "14:00" }).ok, true);
});
test("visible form rule rejects a missing service time", () => {
  assert.equal(validateAppointment({}).ok, false);
});
test("valid request returns the bounded success contract", () => {
  assert.deepEqual(submitAppointment({ serviceTime: "10:15" }), { ok: true, status: 201, value: { serviceTime: "10:15" } });
});
test("invalid request returns the bounded failure contract", () => {
  assert.equal(submitAppointment({}).status, 422);
});
test("domain validation cannot be bypassed by direct submit", () => {
  assert.equal(submitAppointment({ serviceTime: "" }).ok, false);
});
test("failure contains clear user-facing copy", () => {
  assert.equal(submitAppointment({}).error, "Service time is required.");
});
test("the current rule has durable handoff documentation", () => {
  assert.match(fs.readFileSync(path.join(root, "docs/appointment-validation.md"), "utf8"), /service time is required/i);
});
test("task-specific verification covers positive and negative paths", () => {
  assert.equal(validateAppointment({ serviceTime: "08:00" }).ok, true);
  assert.equal(validateAppointment({}).ok, false);
});
`);
  writeFile(root, refs.docs, `# Appointment Validation

For the current bounded appointment flow, service time is required before submission. The same validation function protects direct submission and returns clear failure copy.
`);
  writeBaselineImplementation(root, refs);
  writeFile(root, refs.task, `# Current Task

${intent}

Scope is limited to the local appointment validation module, its focused tests, and its handoff note.
`);
  writeFile(root, refs.plan, `# Implementation Plan

Intent: ${intent}

## Scope

- Keep the change inside the bounded appointment validation module.
- Cover the visible flow and direct submission with the same rule.
- Update focused tests and the durable handoff note.

## Boundaries

- Do not change persistence, permissions, release configuration, production, secrets, payments, or external providers.
- Do not infer a release or production approval from this plan.

## Implementation Sequence

1. Update \`${refs.source}\` with the bounded validation rule.
2. Extend \`${refs.test}\` with positive, negative, bypass, regression, and error-copy checks.
3. Update \`${refs.docs}\` with the durable handoff behavior.

## Verification

- Run \`node --test ${refs.test}\` after the current source is established.
- Require positive, negative, bypass, error-copy, regression, and documentation checks.

## Restore

- Restore the bounded source, test, and documentation files if focused verification regresses.
`);
  return { root, intent, refs };
}

export function buildCurrentTrustFixture(kitRoot, projectRoot, options = {}) {
  const root = path.resolve(projectRoot);
  const intent = String(options.intent || DEFAULT_INTENT);
  const refs = fixtureRefs(options);
  for (const ref of [refs.source, refs.test, refs.docs, refs.task, refs.plan]) {
    if (!fs.existsSync(path.join(root, ref))) throw new Error(`current trust fixture source is missing ${ref}`);
  }
  const governance = resolveGovernedWorkQueue(kitRoot, root, refs, intent, "code_behavior");
  runKit(kitRoot, root, "check-work-queue-takeover.mjs", [
    root, "--report", refs.workQueue, "--require-report", "--require-structured-evidence",
  ]);
  runKit(kitRoot, root, "check-work-queue.mjs", [root, "--require-report"]);
  writeCurrentImplementation(root, refs);

  runKit(kitRoot, root, "resolve-business-rule-closure.mjs", [
    root, "--intent", intent,
    "--task-governance-ref", `artifact:${refs.taskGovernance}`,
    "--out", refs.businessRule,
  ]);
  runKit(kitRoot, root, "resolve-change-impact-coverage.mjs", [
    root, "--intent", intent,
    "--changed-files", [refs.source, refs.test, refs.docs].join(","),
    "--business-rule-ref", `artifact:${refs.businessRule}`,
    "--mode", "preflight", "--out", refs.impactPreflight,
  ]);
  runKit(kitRoot, root, "resolve-verification-plan.mjs", [
    root, "--intent", intent,
    "--business-rule-ref", `artifact:${refs.businessRule}`,
    "--impact-ref", `artifact:${refs.impactPreflight}`,
    "--project-level", "BL1", "--platform", "web", "--change-kind", "BUSINESS_RULE",
    "--out", refs.verificationPlan,
  ]);
  const initialVerificationPlan = readEvidence(root, refs.verificationPlan);
  const initialObligations = (initialVerificationPlan.verification_obligations || [])
    .filter((item) => item.required === "Yes");
  if (initialObligations.length === 0) throw new Error("current Verification Plan produced no required obligations");
  installExactObligationTests(root, refs, initialObligations);

  // The task-specific tests are implementation bytes. Rebuild every downstream
  // planning artifact after installing them so no authority binding points at
  // the preliminary source revision.
  runKit(kitRoot, root, "resolve-business-rule-closure.mjs", [
    root, "--intent", intent,
    "--task-governance-ref", `artifact:${refs.taskGovernance}`,
    "--out", refs.businessRule,
  ]);
  runKit(kitRoot, root, "resolve-change-impact-coverage.mjs", [
    root, "--intent", intent,
    "--changed-files", [refs.source, refs.test, refs.docs].join(","),
    "--business-rule-ref", `artifact:${refs.businessRule}`,
    "--mode", "preflight", "--out", refs.impactPreflight,
  ]);
  runKit(kitRoot, root, "resolve-verification-plan.mjs", [
    root, "--intent", intent,
    "--business-rule-ref", `artifact:${refs.businessRule}`,
    "--impact-ref", `artifact:${refs.impactPreflight}`,
    "--project-level", "BL1", "--platform", "web", "--change-kind", "BUSINESS_RULE",
    "--out", refs.verificationPlan,
  ]);
  runKit(kitRoot, root, "resolve-plan-review.mjs", [
    root, "--intent", intent,
    "--plan", refs.plan,
    "--task-governance", `artifact:${refs.taskGovernance}`,
    "--business-rule", `artifact:${refs.businessRule}`,
    "--impact", `artifact:${refs.impactPreflight}`,
    "--verification-plan", `artifact:${refs.verificationPlan}`,
    "--mode", "review", "--out", refs.planReview,
  ]);
  runKit(kitRoot, root, "check-plan-review.mjs", [
    root, "--report", refs.planReview, "--require-report", "--require-structured-evidence",
  ]);
  const planReview = readEvidence(root, refs.planReview);
  if (planReview.plan_review_state !== "PLAN_REVIEW_PASSED") {
    throw new Error(`current Plan Review must pass, got ${planReview.plan_review_state || "<missing>"}`);
  }
  runKit(kitRoot, root, "resolve-planning-closure.mjs", [
    root, "--intent", intent,
    "--task-ref", governance.task_ref,
    "--intent-digest", governance.intent_digest,
    "--entry-state", "READY_FOR_INTENTOS_OPERATION",
    "--task-governance-report", refs.taskGovernance,
    "--business-rule-report", refs.businessRule,
    "--impact-report", refs.impactPreflight,
    "--verification-plan-report", refs.verificationPlan,
    "--plan-review-report", refs.planReview,
    "--out", refs.planningClosure,
  ]);
  runKit(kitRoot, root, "check-planning-closure.mjs", [
    root, "--report", refs.planningClosure, "--require-ready",
  ]);
  runKit(kitRoot, root, "check-execution-entry-contract.mjs", [
    root, "--report", refs.planningClosure, "--require-contract",
  ]);
  const planningClosure = readEvidence(root, refs.planningClosure);

  const verificationPlan = readEvidence(root, refs.verificationPlan);
  const obligations = (verificationPlan.verification_obligations || []).filter((item) => item.required === "Yes");
  if (obligations.length === 0) throw new Error("current Verification Plan produced no required obligations");
  writeTestEvidenceInput(root, refs, obligations);

  runKit(kitRoot, root, "resolve-change-impact-coverage.mjs", [
    root, "--intent", intent,
    "--changed-files", [refs.source, refs.test, refs.docs].join(","),
    "--business-rule-ref", `artifact:${refs.businessRule}`,
    "--mode", "closure", "--out", refs.impact,
  ]);
  finalizeFixtureImpactClosure(root, refs);
  runKit(kitRoot, root, "check-change-impact-coverage.mjs", [
    root, "--report", refs.impact,
    "--require-structured-evidence", "--require-business-rule-ready",
    "--require-precise-evidence", "--require-task-lineage", "--mode", "closure",
  ]);

  runKit(kitRoot, root, "resolve-test-evidence.mjs", [
    root, "--intent", intent,
    "--verification-plan-ref", `artifact:${refs.verificationPlan}`,
    "--evidence", `artifact:${refs.commandEvidence}`,
    "--out", refs.testEvidence,
  ]);
  runKit(kitRoot, root, "check-test-evidence.mjs", [
    root, "--report", refs.testEvidence,
    "--require-report", "--require-structured-evidence", "--require-verification-plan-ref",
    "--strict-source-binding", "--require-current-evidence", "--require-test-quality-controls",
    "--require-evidence-authority",
  ]);
  const testEvidence = readEvidence(root, refs.testEvidence);

  runKit(kitRoot, root, "resolve-execution-assurance.mjs", [
    root, "--intent", intent, "--task", governance.task_ref, "--kind", "FEATURE_IMPLEMENTATION",
    "--task-governance-ref", `artifact:${refs.taskGovernance}`,
    "--work-queue-ref", `artifact:${refs.workQueue}`, "--work-queue-item-id", "WQ-001",
    "--plan-review-ref", `artifact:${refs.planReview}`,
    "--planning-closure-ref", `artifact:${refs.planningClosure}`,
    "--out", refs.executionAssurance,
  ]);
  runKit(kitRoot, root, "check-execution-assurance.mjs", [
    root, "--report", refs.executionAssurance,
    "--require-structured-evidence", "--require-evidence-refs", "--require-review",
    "--require-actual-diff", "--require-precise-evidence", "--require-task-governance",
    "--require-work-queue", "--strict-task-consumer", "--require-plan-review",
    "--require-planning-closure",
    "--require-evidence-authority",
  ]);

  runKit(kitRoot, root, "resolve-completion-evidence.mjs", [
    root, "--intent", intent, "--task", governance.task_ref,
    "--business-rule-ref", `artifact:${refs.businessRule}`,
    "--verification-plan-ref", `artifact:${refs.verificationPlan}`,
    "--test-evidence-ref", `artifact:${refs.testEvidence}`,
    "--execution-assurance-ref", `artifact:${refs.executionAssurance}`,
    "--out", refs.completion,
  ]);
  runKit(kitRoot, root, "check-completion-evidence.mjs", [
    root, "--report", refs.completion,
    "--require-report", "--require-structured-evidence", "--require-source-refs", "--require-ready",
    "--require-task-governance", "--require-work-queue", "--strict-task-consumer",
    "--require-plan-review", "--require-evidence-authority",
  ]);
  const completion = readEvidence(root, refs.completion);
  if (completion.completion_state !== "COMPLETION_EVIDENCE_READY" || completion.can_claim_complete !== "Yes") {
    throw new Error(`current Completion Evidence did not become ready: ${completion.completion_state || "<missing>"}`);
  }

  return {
    root,
    intent,
    taskRef: governance.task_ref,
    refs,
    governance,
    planReview,
    planningClosure,
    verificationPlan,
    testEvidence,
    executionAssurance: readEvidence(root, refs.executionAssurance),
    completion,
  };
}

export function prepareLowTrustFixtureSource(projectRoot, options = {}) {
  const root = path.resolve(projectRoot);
  const intent = String(options.intent || "fix the README product-name typo");
  const refs = lowFixtureRefs(options);
  appendGitIgnore(root, OUTPUT_DIRECTORIES.map((directory) => `${directory}/`));
  writeFile(root, refs.docs, "# IntenOS\n\nA small local workflow toolkit.\n");
  writeFile(root, refs.task, `# Current Task\n\n${intent}\n\nScope is limited to the README product-name typo.\n`);
  return { root, intent, refs };
}

export function buildLowTrustFixture(kitRoot, projectRoot, options = {}) {
  const root = path.resolve(projectRoot);
  const intent = String(options.intent || "fix the README product-name typo");
  const refs = lowFixtureRefs(options);
  const governance = resolveGovernedWorkQueue(kitRoot, root, refs, intent, "docs_only");
  if (governance.impact_classification?.task_impact !== "LOW") {
    throw new Error(`low trust fixture expected LOW Task Governance, got ${governance.impact_classification?.task_impact || "<missing>"}`);
  }
  runKit(kitRoot, root, "check-work-queue-takeover.mjs", [
    root, "--report", refs.workQueue, "--require-report", "--require-structured-evidence",
  ]);
  runKit(kitRoot, root, "check-work-queue.mjs", [root, "--require-report"]);

  runKit(kitRoot, root, "resolve-plan-review.mjs", [
    root, "--intent", intent,
    "--task-governance", `artifact:${refs.taskGovernance}`,
    "--mode", "review", "--out", refs.planReview,
  ]);
  runKit(kitRoot, root, "check-plan-review.mjs", [
    root, "--report", refs.planReview, "--require-report", "--require-structured-evidence",
  ]);
  const planReview = readEvidence(root, refs.planReview);
  if (planReview.plan_review_state !== "NO_PLAN_REQUIRED") {
    throw new Error(`low trust fixture expected NO_PLAN_REQUIRED, got ${planReview.plan_review_state || "<missing>"}`);
  }
  runKit(kitRoot, root, "resolve-planning-closure.mjs", [
    root, "--intent", intent,
    "--task-ref", governance.task_ref,
    "--intent-digest", governance.intent_digest,
    "--entry-state", "READY_FOR_INTENTOS_OPERATION",
    "--task-governance-report", refs.taskGovernance,
    "--out", refs.planningClosure,
  ]);
  runKit(kitRoot, root, "check-planning-closure.mjs", [
    root, "--report", refs.planningClosure, "--require-ready",
  ]);
  runKit(kitRoot, root, "check-execution-entry-contract.mjs", [
    root, "--report", refs.planningClosure, "--require-contract",
  ]);
  const planningClosure = readEvidence(root, refs.planningClosure);
  writeFile(root, refs.docs, "# IntentOS\n\nA small local workflow toolkit.\n");
  runKit(kitRoot, root, "resolve-execution-assurance.mjs", [
    root, "--intent", intent, "--task", governance.task_ref, "--kind", "SAFE_PATCH",
    "--task-governance-ref", `artifact:${refs.taskGovernance}`,
    "--work-queue-ref", `artifact:${refs.workQueue}`, "--work-queue-item-id", "WQ-001",
    "--plan-review-ref", `artifact:${refs.planReview}`,
    "--planning-closure-ref", `artifact:${refs.planningClosure}`,
    "--out", refs.executionAssurance,
  ]);
  runKit(kitRoot, root, "check-execution-assurance.mjs", [
    root, "--report", refs.executionAssurance,
    "--require-structured-evidence", "--require-evidence-refs", "--require-review",
    "--require-actual-diff", "--require-precise-evidence", "--require-task-governance",
    "--require-work-queue", "--strict-task-consumer", "--require-evidence-authority",
    "--require-planning-closure",
  ]);

  runKit(kitRoot, root, "resolve-completion-evidence.mjs", [
    root, "--intent", intent, "--task", governance.task_ref,
    "--execution-assurance-ref", `artifact:${refs.executionAssurance}`,
    "--out", refs.completion,
  ]);
  runKit(kitRoot, root, "check-completion-evidence.mjs", [
    root, "--report", refs.completion,
    "--require-report", "--require-structured-evidence", "--require-source-refs", "--require-ready",
    "--require-task-governance", "--require-work-queue", "--strict-task-consumer",
    "--require-evidence-authority",
  ]);
  const completion = readEvidence(root, refs.completion);
  return {
    root,
    intent,
    taskRef: governance.task_ref,
    refs,
    governance,
    planReview,
    planningClosure,
    executionAssurance: readEvidence(root, refs.executionAssurance),
    completion,
  };
}

function fixtureRefs(options) {
  return {
    source: options.source || "src/appointment-validation.js",
    test: options.test || "tests/appointment-validation.test.cjs",
    docs: options.docs || "docs/appointment-validation.md",
    task: options.task || "tasks/113-current-task.md",
    plan: options.plan || "implementation-plans/113-current-plan.md",
    taskGovernance: options.taskGovernance || "task-governance-reports/113-current.md",
    workQueue: options.workQueue || "work-queue-takeover-reports/113-current.md",
    activeWorkQueue: options.activeWorkQueue || "work-queue/113-current.md",
    businessRule: options.businessRule || "business-rule-closures/113-current.md",
    impact: options.impact || "change-impact-coverage-reports/113-current.md",
    impactPreflight: options.impactPreflight || "change-impact-coverage-reports/113-current-preflight.md",
    verificationPlan: options.verificationPlan || "verification-plans/113-current.md",
    planReview: options.planReview || "plan-review-reports/113-current.md",
    planningClosure: options.planningClosure || "planning-closure-reports/113-current.md",
    commandEvidence: options.commandEvidence || "evidence/113-current-test.txt",
    testEvidence: options.testEvidence || "test-evidence-reports/113-current.md",
    review: options.review || "review-summaries/113-current.md",
    executionAssurance: options.executionAssurance || "execution-assurance-reports/113-current.md",
    completion: options.completion || "completion-evidence-reports/113-current.md",
  };
}

function lowFixtureRefs(options) {
  return {
    docs: options.docs || "README.md",
    task: options.task || "tasks/113-low-current.md",
    taskGovernance: options.taskGovernance || "task-governance-reports/113-low-current.md",
    workQueue: options.workQueue || "work-queue-takeover-reports/113-low-current.md",
    activeWorkQueue: options.activeWorkQueue || "work-queue/113-low-current.md",
    planReview: options.planReview || "plan-review-reports/113-low-current.md",
    planningClosure: options.planningClosure || "planning-closure-reports/113-low-current.md",
    review: options.review || "review-summaries/113-low-current.md",
    executionAssurance: options.executionAssurance || "execution-assurance-reports/113-low-current.md",
    completion: options.completion || "completion-evidence-reports/113-low-current.md",
  };
}

function resolveGovernedWorkQueue(kitRoot, root, refs, intent, taskKind) {
  writeActiveWorkQueue(root, refs, { intent_digest: taskIntentDigest(intent) }, intent);
  if (fs.existsSync(path.join(root, refs.workQueue)) && fs.existsSync(path.join(root, refs.taskGovernance))) {
    const existing = readEvidence(root, refs.workQueue);
    const current = (existing.queue_items || []).filter((item) => item.state === "CURRENT");
    if (current.length !== 1) {
      throw new Error(`existing governed Work Queue does not expose one current task: ${current.length}`);
    }
    runKit(kitRoot, root, "resolve-work-queue-takeover.mjs", [
      root, "--intent", intent,
      "--task-governance-ref", `artifact:${refs.taskGovernance}`,
      "--current-item-id", current[0].item_id,
      "--out", refs.workQueue,
    ]);
    const refreshed = readEvidence(root, refs.workQueue);
    const refreshedCurrent = (refreshed.queue_items || []).filter((item) => item.state === "CURRENT");
    const governance = readEvidence(root, refs.taskGovernance);
    if (refreshedCurrent.length !== 1
      || refreshedCurrent[0].task_governance_binding_status !== "VERIFIED"
      || refreshedCurrent[0].task_governance_digest !== governance.task_governance_digest) {
      throw new Error(`existing governed Work Queue could not revalidate its exact current-task authority: ${JSON.stringify({
        current: refreshedCurrent,
        blocked_by: refreshed.readiness?.blocked_by || [],
        expected_task_governance_digest: governance.task_governance_digest,
      })}`);
    }
    return governance;
  }
  runKit(kitRoot, root, "resolve-work-queue-takeover.mjs", [
    root, "--intent", intent, "--out", refs.workQueue,
  ]);
  const provisional = readEvidence(root, refs.workQueue);
  const candidates = (provisional.queue_items || []).filter((item) => item.state === "CURRENT");
  if (candidates.length !== 1) {
    throw new Error(`public Work Queue takeover resolver did not establish one provisional current task: ${candidates.length}`);
  }
  const currentItemId = candidates[0].item_id;
  runKit(kitRoot, root, "resolve-task-governance.mjs", [
    root, "--intent", intent, "--task-kind", taskKind,
    "--work-queue-item", `artifact:${refs.workQueue}#${currentItemId}`,
    "--out", refs.taskGovernance,
  ]);
  const governance = readEvidence(root, refs.taskGovernance);
  runKit(kitRoot, root, "resolve-work-queue-takeover.mjs", [
    root, "--intent", intent,
    "--task-governance-ref", `artifact:${refs.taskGovernance}`,
    "--current-item-id", currentItemId,
    "--out", refs.workQueue,
  ]);
  const evidence = readEvidence(root, refs.workQueue);
  const current = (evidence.queue_items || []).filter((item) => item.state === "CURRENT");
  if (current.length !== 1
    || current[0].task_governance_binding_status !== "VERIFIED"
    || current[0].task_governance_digest !== governance.task_governance_digest) {
    throw new Error("public Work Queue takeover resolver did not create one verified current-task binding");
  }
  return governance;
}

function writeWorkQueue(root, refs, governance, intent) {
  const sourceDigest = digest(`${refs.task}\n${fs.readFileSync(path.join(root, refs.task), "utf8")}`);
  const base = {
    schema_version: "1.84.1",
    artifact_type: "work_queue_takeover",
    work_queue_takeover_ref: refs.workQueue,
    work_queue_takeover_digest: "",
    intent,
    intent_digest: governance.intent_digest,
    project_task_system_class: "MISSING_TASK_SYSTEM",
    recommended_action: "ESTABLISH_INTENTOS_WORK_QUEUE",
    future_task_authority: "INTENTOS_WORK_QUEUE",
    plain_user_summary: "The exact current fixture task is bound to one IntentOS Work Queue item.",
    source_inventory: [{ source_ref: refs.task, source_digest: sourceDigest, source_type: "other", status: "CURRENT", summary: "Current bounded fixture task" }],
    reliability_assessment: [{ criterion: "One current task", result: "Yes", reason: "The fixture has one exact current task." }],
    migration_dispositions: [{ source_item: refs.task, source_digest: sourceDigest, disposition: "MIGRATE_CURRENT", target_queue_state: "CURRENT", reason: "Bind the exact current task before downstream review." }],
    queue_items: [{
      item_id: "WQ-001",
      state: "CURRENT",
      title: intent,
      source_item: refs.task,
      source_item_digest: sourceDigest,
      task_governance_ref: refs.taskGovernance,
      task_governance_digest: governance.task_governance_digest,
      task_governance_binding_status: "VERIFIED",
      execution_review_eligible_after_task_governance: "Yes",
      execution_eligible: "Yes",
      reason: "The current queue item is bound to current Task Governance evidence.",
    }],
    readiness: { takeover_ready: "Yes", takeover_review_ready: "Yes", can_codex_write_now: "No", can_execute_from_old_todo_directly: "No", blocked_by: [] },
    boundaries: {
      writes_target_files: "No", deletes_old_task_sources: "No", approves_implementation: "No", approves_completion: "No",
      approves_commit_or_push: "No", approves_release_or_production: "No", claims_full_adoption: "No", installs_native_assets: "No",
    },
    outcome: "TAKEOVER_RECOMMENDED",
  };
  const evidence = { ...base, work_queue_takeover_digest: evidenceDigest(base, ["work_queue_takeover_digest"]) };
  const lines = [
    "# Work Queue Takeover Report", "", "This fixture binds the exact current task and does not authorize implementation.", "",
    "## Human Summary", "", "| Field | Value |", "| --- | --- |", `| Plain user summary | ${evidence.plain_user_summary} |`,
    `| Task system class | \`${evidence.project_task_system_class}\` |`, `| Recommended action | \`${evidence.recommended_action}\` |`,
    `| Future task authority | \`${evidence.future_task_authority}\` |`, "| Can Codex write now | `No` |", "| Can Codex execute tasks from old TODO directly | `No` |", "",
    "## Source Inventory", "", "| Source | Digest | Type | Status | Summary |", "| --- | --- | --- | --- | --- |",
    `| \`${refs.task}\` | \`${sourceDigest}\` | \`other\` | \`CURRENT\` | Current bounded fixture task |`, "",
    "## Reliability Assessment", "", "| Criterion | Result | Reason |", "| --- | --- | --- |", "| One current task | `Yes` | The fixture has one exact current task. |", "",
    "## Migration Dispositions", "", "| Source Item | Source Digest | Disposition | Target Queue State | Reason |", "| --- | --- | --- | --- | --- |",
    `| \`${refs.task}\` | \`${sourceDigest}\` | \`MIGRATE_CURRENT\` | \`CURRENT\` | Bind the exact current task before downstream review. |`, "",
    "## Queue Items", "", "| Item ID | State | Title | Source Item | Source Digest | Task Governance Ref | Task Governance Digest | Binding Status | Execution Review Eligible After Task Governance | Execution Eligible | Reason |", "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    `| \`WQ-001\` | \`CURRENT\` | ${intent} | \`${refs.task}\` | \`${sourceDigest}\` | \`${refs.taskGovernance}\` | \`${governance.task_governance_digest}\` | \`VERIFIED\` | \`Yes\` | \`Yes\` | Current Task Governance is bound. |`, "",
    "## Boundaries", "", "- This report writes target files: No", "- This report deletes old task sources: No", "- This report approves implementation: No",
    "- This report approves completion: No", "- This report approves commit or push: No", "- This report approves release or production: No",
    "- This report claims full adoption: No", "- This report installs native assets: No", "",
    "## Machine-Readable Evidence", "", "```json", JSON.stringify(evidence, null, 2), "```", "", "## Outcome", "", "`TAKEOVER_RECOMMENDED`", "",
  ];
  writeFile(root, refs.workQueue, `${lines.join("\n")}\n`);
  writeActiveWorkQueue(root, refs, governance, intent);
}

function writeActiveWorkQueue(root, refs, governance, intent) {
  const lines = [
    "# Work Queue Report", "",
    "## Human Decision Summary", "",
    "Conclusion: The exact current fixture task is active and no other task is current.", "",
    "Recommended choice: Continue the current bounded task.", "",
    "Can AI continue now: yes", "",
    "What I need from you: none", "",
    "What happens if you do nothing: no task state changes; no code changes", "",
    "## Human Summary", "",
    "The current fixture task is the only active task. Its exact Task Governance binding is recorded separately in the takeover report.", "",
    "## Queue Policy", "",
    "- Only one `CURRENT` task is allowed.",
    "- `PAUSED` tasks require resume review before execution.",
    "- `BACKLOG` items are not execution permission.",
    "- Work Queue records task state only; it does not approve implementation.", "",
    "## Current Task", "",
    "| Task ID | Title | State | Task / spec reference | Intent digest | Last evidence | Notes |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    `| \`WQ-001\` | ${intent} | \`CURRENT\` | \`${refs.task}\` | \`${governance.intent_digest}\` | \`${refs.task}\` | Exact current task source; downstream governance is not part of task identity. |`, "",
    "## Paused Tasks", "",
    "None.", "",
    "## Backlog / Parking Lot", "",
    "None.", "",
    "## Resume Review", "",
    "- Resume requested: `No`",
    "- Candidate task: `None`",
    "- Current state checked: `Yes`",
    "- Dirty worktree checked: `N/A`",
    "- Last evidence still valid: `Yes`",
    "- Human resume decision: `NOT_NEEDED`",
    "- Resume without review: `No`", "",
    "## Work Items", "",
    "| Task ID | Title | State | Task ref | Intent digest | Resume review | Owner | Notes |",
    "| --- | --- | --- | --- | --- | --- | --- | --- |",
    `| \`WQ-001\` | ${intent} | \`CURRENT\` | \`${refs.task}\` | \`${governance.intent_digest}\` | \`N/A\` | \`codex\` | Exact current task; this row does not approve implementation. |`, "",
    "## Human Decisions Needed", "",
    "| Decision | Options | Recommended | Owner | Status |",
    "| --- | --- | --- | --- | --- |",
    "| None | N/A | Continue bounded verification | user | `NOT_NEEDED` |", "",
    "## Boundary", "",
    "- This report changes task state: No",
    "- This report approves implementation: No",
    "- This report approves target-project writes: No",
    "- This report approves scope expansion: No",
    "- This report approves release or production: No",
    "- This report overrides task/spec/review loop: No",
    "- This report resumes stale work without review: No", "",
    "## Outcome", "",
    "`WORK_QUEUE_RECORDED`", "",
  ];
  writeFile(root, refs.activeWorkQueue, `${lines.join("\n")}\n`);
}

function writeTestEvidenceInput(root, refs, obligations) {
  const testEnvironment = { ...process.env };
  // A fixture may run from inside Node's own test runner. Reusing its private
  // child context suppresses nested TAP details, which would make exact
  // obligation proof disappear even though the tests actually ran.
  delete testEnvironment.NODE_TEST_CONTEXT;
  const testRun = spawnSync(process.execPath, ["--test", refs.test], {
    cwd: root,
    env: testEnvironment,
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  });
  if (testRun.status !== 0) throw new Error(`current fixture focused test failed:\n${testRun.stderr || testRun.stdout}`);
  const obligationIds = obligations.map((item) => item.id);
  const stdout = testRun.stdout
    .split(/\r?\n/)
    .filter((line) => !/^\s*(?:[#ℹ]\s*)?todo\s+0\s*$/i.test(line))
    .join("\n")
    .trim();
  writeFile(root, refs.commandEvidence, [
    "id: evidence:current-task-test",
    "evidence_type: TEST_REPORT",
    "result_state: PASSED",
    `command: node --test ${refs.test}`,
    "owner: codex",
    "environment: isolated-local",
    "ran_at: 2026-07-15T00:00:00.000Z",
    "exit_code: 0",
    "ran_after_change: Yes",
    "current_task_match: Yes",
    `covers_obligations: ${obligationIds.join(",")}`,
    "limitations: Bounded to the exact current fixture source, tests, documentation, and Verification Plan obligations.",
    "",
    stdout,
    testRun.stderr.trim(),
    "",
  ].join("\n"));
}

function installExactObligationTests(root, refs, obligations) {
  const testFile = path.join(root, refs.test);
  const exactObligationTests = obligations.flatMap((item) => [
    `test(${JSON.stringify(`[${item.id}] ${refs.test} :: verifies the exact current obligation`)}, () => {`,
    "  assert.equal(submitAppointment({ serviceTime: \"11:45\" }).status, 201);",
    "  assert.equal(submitAppointment({ serviceTime: \"\" }).status, 422);",
    "});",
  ]);
  fs.appendFileSync(testFile, [
    "",
    "// Exact obligation identifiers make the observed test output replayable per plan row.",
    ...exactObligationTests,
    "",
  ].join("\n"));
}

function writeExecutionAssurance(root, refs, { governance, planReview, testEvidence, intent }) {
  const testRef = `artifact:${refs.testEvidence}`;
  const reportRef = refs.executionAssurance;
  const taskSourceDigest = digest(`${refs.task}\n${fs.readFileSync(path.join(root, refs.task), "utf8")}`);
  const observedDiff = collectGitChangedFiles(root, "git:working-tree");
  if (!observedDiff.ok) throw new Error(`current trust fixture cannot read current Git worktree: ${observedDiff.reason}`);
  const plannedDiff = [
    refs.source,
    refs.test,
    refs.docs,
  ].sort();
  if (observedDiff.files.length === 0 || JSON.stringify(observedDiff.files) !== JSON.stringify(plannedDiff)) {
    throw new Error(`current trust fixture expected exact implementation diff [${plannedDiff.join(", ")}], observed [${observedDiff.files.join(", ")}]`);
  }
  const planReviewBinding = {
    required: "Yes",
    plan_review_ref: planReview.plan_review_ref,
    plan_review_digest: planReview.plan_review_digest,
    plan_review_state: planReview.plan_review_state,
    plan_ref: planReview.plan_ref,
    plan_digest: planReview.plan_digest,
    task_ref: planReview.task_ref,
    current_task_match: "Yes",
    ready_for_implementation_review: planReview.ready_for_implementation_review,
    implementation_authorized_by_this_report: "No",
    reason: "The current MEDIUM behavior task requires and consumes an exact passed Plan Review without treating it as implementation authorization.",
  };
  const evidence = {
    schema_version: "1.113.0",
    artifact_type: "execution_assurance_report",
    execution_kind: "FEATURE_IMPLEMENTATION",
    task_ref: governance.task_ref,
    intent_digest: governance.intent_digest,
    assurance_state: "VERIFIED_DONE",
    can_claim_done: "Yes",
    can_codex_write_now: "No",
    intent_lock: {
      user_intent: intent,
      normalized_intent: `FEATURE_IMPLEMENTATION: ${intent}`,
      in_scope: plannedDiff,
      out_of_scope: ["release approval", "production deploy", "secrets", "payment", "legal or compliance decision"],
    },
    completion_contract: { criteria: [{ id: "criterion:service-time-validation", status: "DONE", evidence_refs: [testRef] }] },
    planned_impact_map: { surfaces: [{ surface: "APPOINTMENT_VALIDATION", expected: "Yes", status: "DONE", evidence_refs: [testRef] }] },
    execution_plan: {
      plan_ref: `artifact:${refs.plan}`,
      planned_target_paths: plannedDiff,
      risk_classification: "MEDIUM",
      approval_refs: [],
      restore_strategy: "Restore the bounded source, test, and documentation files if focused verification regresses.",
    },
    actual_diff: { diff_source: "git:working-tree", changed_files: observedDiff.files, unexpected_files: [], target_diff_status: "MATCHED_PLAN" },
    evidence_bindings: [{ criterion_id: "criterion:service-time-validation", evidence_ref: testRef, resolved: "Yes", current_task_match: "Yes" }],
    review: { review_required: "Yes", review_refs: [`artifact:${refs.review}`], all_reviewers_closed: "Yes" },
    patch_assessment: { state: "NOT_A_PATCH", reason: "The bounded behavior and exact current evidence chain were reviewed as one coherent task." },
    source_systems: [{
      name: "test_evidence", status: "RECORDED", ref: testRef, source_system_ref: testRef,
      source_task_ref: governance.task_ref, source_outcome: testEvidence.test_evidence_state,
      current_task_match: "Yes", report_digest: fileDigest(path.join(root, refs.testEvidence)),
      contribution: "Current Verification Plan obligations and exact command evidence are complete.",
    }],
    runtime_trust_binding: testEvidence.runtime_trust_binding,
    business_universe_binding: testEvidence.business_universe_binding,
    control_effectiveness_binding: testEvidence.control_effectiveness_binding,
    scenario_assurance_map: [],
    task_entry_binding: {
      work_queue_item_ref: `artifact:${refs.workQueue}#WQ-001`,
      work_queue_item_digest: taskSourceDigest,
      work_queue_item_state: "CURRENT",
      work_queue_item_current_task_match: "Yes",
      approved_resume_review: "No",
      resume_review_ref: "N/A",
      resume_review_digest: "N/A",
      resume_review_owner: "N/A",
      resume_review_task_match: "N/A",
      task_governance_ref: `artifact:${refs.taskGovernance}`,
      task_governance_digest: governance.task_governance_digest,
      task_governance_tier: "MEDIUM",
      task_governance_review_level: "TARGETED",
      task_governance_task_match: "Yes",
      minimal_verification_status: "NOT_APPLICABLE_WITH_REASON",
      targeted_verification_status: "RECORDED",
      high_impact_evidence_chain_complete: "N/A",
      task_governance_blocks_completion: "No",
      tier_completion_requirements_satisfied: "Yes",
      unresolved_task_governance_blockers: [],
      plain_user_blocker: "N/A",
    },
    plan_review_binding: planReviewBinding,
    pending_human_decisions: [],
    forbidden_claims: [],
    boundary: {
      writes_target_files: "No", authorizes_target_file_writes: "No", approves_implementation_beyond_recorded_scope: "No",
      approves_commit_or_push: "No", approves_release_or_production: "No", replaces_source_systems: "No",
      proves_product_correctness: "No", transfers_project_authority_to_intentos: "No",
    },
    outcome: "VERIFIED_DONE",
  };
  evidence.authority_binding = createEvidenceAuthorityBinding(root, {
    fromFile: path.join(root, reportRef),
    taskRef: evidence.task_ref,
    intentDigest: evidence.intent_digest,
    sourceRefs: collectFileRefs(evidence),
  });
  const list = (items) => items.length > 0 ? items.join(", ") : "none";
  const lines = [
    "# Execution Assurance Report", "", "This report is a read-only derived verification view for the current-task fixture. It does not authorize writes or release.", "",
    "## Human Summary", "", "| Field | Value |", "| --- | --- |", "| Execution Kind | `FEATURE_IMPLEMENTATION` |", "| Assurance State | `VERIFIED_DONE` |",
    "| Can Claim Done | `Yes` |", "| Can Codex Write Now | `No` |", "| Safe Next Step | Continue to strict Completion Evidence review. |", "",
    "## Execution Kind", "", "`FEATURE_IMPLEMENTATION`", "", "## Intent Lock", "", `Current task: ${intent}`, "",
    "## Completion Contract", "", "| Criterion | Status | Evidence | Notes |", "| --- | --- | --- | --- |", `| criterion:service-time-validation | \`DONE\` | \`${testRef}\` | Current task evidence. |`, "",
    "## Planned Impact Map", "", "| Surface | Expected | Status | Evidence | Notes |", "| --- | --- | --- | --- | --- |", `| APPOINTMENT_VALIDATION | \`Yes\` | \`DONE\` | \`${testRef}\` | Planned surface. |`, "",
    "## Execution Plan Binding", "", "| Field | Value |", "| --- | --- |", `| Plan Ref | \`artifact:${refs.plan}\` |`, `| Planned Target Paths | \`${list(plannedDiff)}\` |`,
    "| Risk Classification | `MEDIUM` |", "| Approval Ref | `none` |", `| Restore Strategy | ${evidence.execution_plan.restore_strategy} |`, "",
    "## Actual Diff Binding", "", "| Field | Value |", "| --- | --- |", "| Diff Source | `git:working-tree` |", `| Changed Files | \`${list(observedDiff.files)}\` |`, "| Unexpected Files | `none` |", "| Target Diff Status | `MATCHED_PLAN` |", "",
    "## Evidence Binding", "", "| Criterion | Evidence Ref | Resolved | Current Task Match |", "| --- | --- | --- | --- |", `| criterion:service-time-validation | \`${testRef}\` | \`Yes\` | \`Yes\` |`, "",
    "## Independent Review Binding", "", "| Field | Value |", "| --- | --- |", "| Review Required | `Yes` |", `| Review Refs | \`artifact:${refs.review}\` |`, "| All Reviewers Closed | `Yes` |", "",
    "## Patch Assessment", "", "- State: `NOT_A_PATCH`", `- Reason: ${evidence.patch_assessment.reason}`, "",
    "## Source System Trace", "", "| Source System | Status | Ref | Source Task | Source Outcome | Current Task Match | Digest | Contribution | Authority |", "| --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    `| test_evidence | \`RECORDED\` | \`${testRef}\` | \`${governance.task_ref}\` | \`${testEvidence.test_evidence_state}\` | \`Yes\` | \`${evidence.source_systems[0].report_digest}\` | Current task evidence is complete. | Source system |`, "",
    "## Business Universe Assurance", "", `- Requirement: \`${evidence.business_universe_binding.required}\``, `- Status: \`${evidence.business_universe_binding.business_universe_state}\``, "",
    "## Control Effectiveness Binding", "", `- Requirement: \`${evidence.control_effectiveness_binding.requirement}\``, `- Status: \`${evidence.control_effectiveness_binding.status}\``, "",
    "## Closure Decision", "", "`VERIFIED_DONE`", "", "## Pending Human Decisions", "", "- None.", "",
    "## Forbidden Claims", "", "- No production or release approval is implied.", "", "## Boundary", "", "Source systems remain authoritative.", "",
    "## Machine-Readable Evidence", "", "```json", JSON.stringify(evidence, null, 2), "```", "",
  ];
  writeFile(root, reportRef, `${lines.join("\n")}\n`);
}

function writeLowExecutionAssurance(root, refs, { governance, planReview, intent }) {
  const reportRef = refs.executionAssurance;
  const reviewRef = `artifact:${refs.review}`;
  const taskGovernanceRef = `artifact:${refs.taskGovernance}`;
  const taskSourceDigest = digest(`${refs.task}\n${fs.readFileSync(path.join(root, refs.task), "utf8")}`);
  const observedDiff = collectGitChangedFiles(root, "git:working-tree");
  if (!observedDiff.ok) throw new Error(`low trust fixture cannot read current Git worktree: ${observedDiff.reason}`);
  if (JSON.stringify(observedDiff.files) !== JSON.stringify([refs.docs])) {
    throw new Error(`low trust fixture expected exact README diff, observed [${observedDiff.files.join(", ")}]`);
  }
  const runtimeBinding = resolveRuntimeTrustBinding(root, {
    required: false,
    notRequiredReason: "The exact current LOW non-behavioral documentation task does not require runtime behavior proof.",
  }).binding;
  const controlBinding = controlEffectivenessBinding({
    required: false,
    reason: "The exact current LOW non-behavioral documentation task does not rely on a runtime or process control claim.",
  });
  const businessUniverseBinding = {
    required: "No",
    routing_result: "NOT_REQUIRED_WITH_REASON",
    business_universe_ref: "N/A",
    business_universe_digest: "N/A",
    business_universe_state: "NOT_REQUIRED_WITH_REASON",
    coverage_scenario_ids: [],
    coverage_mapping_status: "NOT_REQUIRED",
  };
  const planReviewBinding = {
    required: "No",
    plan_review_ref: `artifact:${refs.planReview}`,
    plan_review_digest: planReview.plan_review_digest,
    plan_review_state: planReview.plan_review_state,
    plan_ref: planReview.plan_ref,
    plan_digest: planReview.plan_digest,
    task_ref: planReview.task_ref,
    current_task_match: "Yes",
    ready_for_implementation_review: planReview.ready_for_implementation_review,
    implementation_authorized_by_this_report: "No",
    reason: "Task Governance classifies this as bounded LOW non-behavioral work; the reviewed no-plan decision is current and non-authorizing.",
  };
  const taskGovernanceDigest = fileDigest(path.join(root, refs.taskGovernance));
  const evidence = {
    schema_version: "1.113.0",
    artifact_type: "execution_assurance_report",
    execution_kind: "SAFE_PATCH",
    task_ref: governance.task_ref,
    intent_digest: governance.intent_digest,
    assurance_state: "VERIFIED_DONE",
    can_claim_done: "Yes",
    can_codex_write_now: "No",
    intent_lock: {
      user_intent: intent,
      normalized_intent: `SAFE_PATCH: ${intent}`,
      in_scope: [refs.docs],
      out_of_scope: ["code behavior", "runtime", "release approval", "production deploy", "secrets", "payment", "legal or compliance decision"],
    },
    completion_contract: { criteria: [{ id: "criterion:readme-product-name", status: "DONE", evidence_refs: [reviewRef] }] },
    planned_impact_map: { surfaces: [{ surface: "README_PRODUCT_NAME", expected: "Yes", status: "DONE", evidence_refs: [reviewRef] }] },
    execution_plan: {
      plan_ref: "N/A",
      planned_target_paths: [refs.docs],
      risk_classification: "LOW",
      approval_refs: [],
      restore_strategy: "Restore the single README line if the product name is incorrect.",
    },
    actual_diff: { diff_source: "git:working-tree", changed_files: observedDiff.files, unexpected_files: [], target_diff_status: "MATCHED_PLAN" },
    evidence_bindings: [{ criterion_id: "criterion:readme-product-name", evidence_ref: reviewRef, resolved: "Yes", current_task_match: "Yes" }],
    review: { review_required: "Yes", review_refs: [reviewRef], all_reviewers_closed: "Yes" },
    patch_assessment: { state: "SAFE_PATCH", reason: "One bounded documentation typo is covered by exact diff and lightweight review." },
    source_systems: [{
      name: "task_governance",
      status: "RECORDED",
      ref: taskGovernanceRef,
      source_system_ref: taskGovernanceRef,
      source_task_ref: governance.task_ref,
      source_outcome: governance.outcome,
      current_task_match: "Yes",
      report_digest: taskGovernanceDigest,
      contribution: "Current Task Governance proves the proportional LOW non-behavioral obligation set.",
    }],
    runtime_trust_binding: runtimeBinding,
    business_universe_binding: businessUniverseBinding,
    control_effectiveness_binding: controlBinding,
    scenario_assurance_map: [],
    task_entry_binding: {
      work_queue_item_ref: `artifact:${refs.workQueue}#WQ-001`,
      work_queue_item_digest: taskSourceDigest,
      work_queue_item_state: "CURRENT",
      work_queue_item_current_task_match: "Yes",
      approved_resume_review: "No",
      resume_review_ref: "N/A",
      resume_review_digest: "N/A",
      resume_review_owner: "N/A",
      resume_review_task_match: "N/A",
      task_governance_ref: taskGovernanceRef,
      task_governance_digest: governance.task_governance_digest,
      task_governance_tier: "LOW",
      task_governance_review_level: "LIGHTWEIGHT",
      task_governance_task_match: "Yes",
      minimal_verification_status: "RECORDED",
      targeted_verification_status: "NOT_APPLICABLE_WITH_REASON",
      high_impact_evidence_chain_complete: "N/A",
      task_governance_blocks_completion: "No",
      tier_completion_requirements_satisfied: "Yes",
      unresolved_task_governance_blockers: [],
      plain_user_blocker: "N/A",
    },
    plan_review_binding: planReviewBinding,
    pending_human_decisions: [],
    forbidden_claims: [],
    boundary: {
      writes_target_files: "No",
      authorizes_target_file_writes: "No",
      approves_implementation_beyond_recorded_scope: "No",
      approves_commit_or_push: "No",
      approves_release_or_production: "No",
      replaces_source_systems: "No",
      proves_product_correctness: "No",
      transfers_project_authority_to_intentos: "No",
    },
    outcome: "VERIFIED_DONE",
  };
  evidence.authority_binding = createEvidenceAuthorityBinding(root, {
    fromFile: path.join(root, reportRef),
    taskRef: evidence.task_ref,
    intentDigest: evidence.intent_digest,
    sourceRefs: collectFileRefs(evidence),
  });
  const lines = [
    "# Execution Assurance Report", "",
    "This report is a read-only derived verification view for one bounded LOW documentation change. It does not authorize writes, commit, release, or production.", "",
    "## Human Summary", "", "| Field | Value |", "| --- | --- |",
    "| Execution Kind | `SAFE_PATCH` |", "| Assurance State | `VERIFIED_DONE` |", "| Can Claim Done | `Yes` |", "| Can Codex Write Now | `No` |", "| Safe Next Step | Continue to strict Completion Evidence review. |", "",
    "## Execution Kind", "", "`SAFE_PATCH`", "",
    "## Intent Lock", "", `Current task: ${intent}`, "",
    "## Completion Contract", "", "| Criterion | Status | Evidence | Notes |", "| --- | --- | --- | --- |", `| criterion:readme-product-name | \`DONE\` | \`${reviewRef}\` | Exact diff and lightweight review. |`, "",
    "## Planned Impact Map", "", "| Surface | Expected | Status | Evidence | Notes |", "| --- | --- | --- | --- | --- |", `| README_PRODUCT_NAME | \`Yes\` | \`DONE\` | \`${reviewRef}\` | One bounded documentation surface. |`, "",
    "## Execution Plan Binding", "", "| Field | Value |", "| --- | --- |", "| Plan Ref | `N/A` |", `| Planned Target Paths | \`${refs.docs}\` |`, "| Risk Classification | `LOW` |", "| Approval Ref | `none` |", `| Restore Strategy | ${evidence.execution_plan.restore_strategy} |`, "",
    "## Actual Diff Binding", "", "| Field | Value |", "| --- | --- |", "| Diff Source | `git:working-tree` |", `| Changed Files | \`${refs.docs}\` |`, "| Unexpected Files | `none` |", "| Target Diff Status | `MATCHED_PLAN` |", "",
    "## Evidence Binding", "", "| Criterion | Evidence Ref | Resolved | Current Task Match |", "| --- | --- | --- | --- |", `| criterion:readme-product-name | \`${reviewRef}\` | \`Yes\` | \`Yes\` |`, "",
    "## Independent Review Binding", "", "| Field | Value |", "| --- | --- |", "| Review Required | `Yes` |", `| Review Refs | \`${reviewRef}\` |`, "| All Reviewers Closed | `Yes` |", "",
    "## Patch Assessment", "", "- State: `SAFE_PATCH`", `- Reason: ${evidence.patch_assessment.reason}`, "",
    "## Source System Trace", "", "| Source System | Status | Ref | Source Task | Source Outcome | Current Task Match | Digest | Contribution | Authority |", "| --- | --- | --- | --- | --- | --- | --- | --- | --- |", `| task_governance | \`RECORDED\` | \`${taskGovernanceRef}\` | \`${governance.task_ref}\` | \`${governance.outcome}\` | \`Yes\` | \`${taskGovernanceDigest}\` | Proportional LOW obligations. | Source system |`, "",
    "## Business Universe Assurance", "", "- Requirement: `No`", "- Status: `NOT_REQUIRED_WITH_REASON`", "",
    "## Control Effectiveness Binding", "", "- Requirement: `NOT_REQUIRED`", "- Status: `NOT_REQUIRED`", "",
    "## Closure Decision", "", "`VERIFIED_DONE`", "",
    "## Pending Human Decisions", "", "- None.", "",
    "## Forbidden Claims", "", "- No production, release, or technical user approval is implied.", "",
    "## Boundary", "", "Source systems remain authoritative.", "",
    "## Machine-Readable Evidence", "", "```json", JSON.stringify(evidence, null, 2), "```", "",
  ];
  writeFile(root, reportRef, `${lines.join("\n")}\n`);
}

function writeBaselineImplementation(root, refs) {
  writeFile(root, refs.source, `function submitAppointment(input = {}) {
  return { ok: true, status: 201, value: { serviceTime: input.serviceTime || null } };
}

module.exports = { submitAppointment };
`);
  writeFile(root, refs.test, `const assert = require("node:assert/strict");
const test = require("node:test");
const { submitAppointment } = require("../src/appointment-validation.js");

test("existing appointment flow remains available", () => {
  assert.equal(submitAppointment({ serviceTime: "14:00" }).status, 201);
});
`);
  writeFile(root, refs.docs, `# Appointment Validation

The baseline fixture accepts the existing appointment submission behavior. The current task will add bounded service-time validation.
`);
}

function writeCurrentImplementation(root, refs) {
  writeFile(root, refs.source, `function validateAppointment(input = {}) {
  if (!String(input.serviceTime || "").trim()) {
    return { ok: false, status: 422, error: "Service time is required." };
  }
  return { ok: true, status: 201, value: { serviceTime: input.serviceTime } };
}

function submitAppointment(input = {}) {
  return validateAppointment(input);
}

module.exports = { submitAppointment, validateAppointment };
`);
  writeFile(root, refs.test, `const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const { submitAppointment, validateAppointment } = require("../src/appointment-validation.js");

const root = path.resolve(__dirname, "..");

test("primary appointment flow accepts a service time", () => {
  assert.equal(submitAppointment({ serviceTime: "09:30" }).status, 201);
});
test("existing valid behavior remains available", () => {
  assert.equal(validateAppointment({ serviceTime: "14:00" }).ok, true);
});
test("visible form rule rejects a missing service time", () => {
  assert.equal(validateAppointment({}).ok, false);
});
test("valid request returns the bounded success contract", () => {
  assert.deepEqual(submitAppointment({ serviceTime: "10:15" }), { ok: true, status: 201, value: { serviceTime: "10:15" } });
});
test("invalid request returns the bounded failure contract", () => {
  assert.equal(submitAppointment({}).status, 422);
});
test("domain validation cannot be bypassed by direct submit", () => {
  assert.equal(submitAppointment({ serviceTime: "" }).ok, false);
});
test("failure contains clear user-facing copy", () => {
  assert.equal(submitAppointment({}).error, "Service time is required.");
});
test("the current rule has durable handoff documentation", () => {
  assert.match(fs.readFileSync(path.join(root, "docs/appointment-validation.md"), "utf8"), /service time is required/i);
});
test("task-specific verification covers positive and negative paths", () => {
  assert.equal(validateAppointment({ serviceTime: "08:00" }).ok, true);
  assert.equal(validateAppointment({}).ok, false);
});
`);
  writeFile(root, refs.docs, `# Appointment Validation

For the current bounded appointment flow, service time is required before submission. The same validation function protects direct submission and returns clear failure copy.
`);
}

function runKit(kitRoot, projectRoot, script, args) {
  const result = spawnSync(process.execPath, [path.join(kitRoot, "scripts", script), ...args], {
    cwd: kitRoot,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  if (result.status !== 0) {
    throw new Error(`${script} failed for ${projectRoot}:\n${result.stderr || result.stdout}`);
  }
  return result;
}

function readEvidence(root, relative) {
  const extracted = extractMachineReadableEvidence(fs.readFileSync(path.join(root, relative), "utf8"));
  if (!extracted?.ok) throw new Error(`invalid Machine-Readable Evidence in ${relative}`);
  return extracted.value;
}

function finalizeFixtureImpactClosure(root, refs) {
  const file = path.join(root, refs.impact);
  let content = fs.readFileSync(file, "utf8");
  const extracted = extractMachineReadableEvidence(content);
  if (!extracted?.ok) throw new Error(`invalid Machine-Readable Evidence in ${refs.impact}`);

  const evidence = structuredClone(extracted.value);
  const affectedBySurface = new Map((evidence.affected_surface_map || []).map((row) => [row.surface, row]));
  const implementationEvidence = (surface) => {
    if (surface === "TEST_COVERAGE") return refs.commandEvidence;
    if (surface === "DOCS_HANDOFF") return refs.docs;
    return refs.source;
  };

  evidence.implementation_coverage = (evidence.affected_surface_map || []).map((row) => {
    if (row.status === "REQUIRED") {
      return {
        surface: row.surface,
        status: "DONE",
        evidence: implementationEvidence(row.surface),
        reason: "Closed by the exact current fixture implementation and task-bound evidence.",
      };
    }
    return {
      surface: row.surface,
      status: "NOT_APPLICABLE",
      evidence: refs.docs,
      reason: row.reason,
    };
  });
  evidence.verification_coverage = [...affectedBySurface.values()]
    .filter((row) => row.status === "REQUIRED")
    .map((row) => ({
      surface: row.surface,
      verification: "Verified by the current focused run after the bounded implementation was written.",
      evidence: refs.commandEvidence,
      status: "DONE",
    }));
  evidence.missed_surface_review = {
    missed_surfaces_found: "No",
    notes: "The current changed-file set and all required affected surfaces were reviewed after implementation.",
  };
  evidence.impact_digest = evidenceDigest(evidence, ["impact_digest"]);

  content = replaceMarkdownSection(content, "Implementation Coverage", [
    "| Surface | Status | Evidence | Reason |",
    "|---|---|---|---|",
    ...evidence.implementation_coverage.map((row) => `| \`${row.surface}\` | \`${row.status}\` | ${row.evidence} | ${row.reason} |`),
  ]);
  content = replaceMarkdownSection(content, "Verification Coverage", [
    "| Surface | Verification | Evidence | Status |",
    "|---|---|---|---|",
    ...evidence.verification_coverage.map((row) => `| \`${row.surface}\` | ${row.verification} | ${row.evidence} | \`${row.status}\` |`),
  ]);
  content = replaceMarkdownSection(content, "Missed Surface Review", [
    `- Missed surfaces found: ${evidence.missed_surface_review.missed_surfaces_found}`,
    `- Notes: ${evidence.missed_surface_review.notes}`,
  ]);
  content = content.replace(
    /(## Machine-Readable Evidence\s*\n\s*```json\s*\n)[\s\S]*?(\n```)/,
    (_match, prefix, suffix) => `${prefix}${JSON.stringify(evidence, null, 2)}${suffix}`,
  );
  fs.writeFileSync(file, content);
}

function replaceMarkdownSection(content, heading, lines) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`(## ${escaped}\\s*\\n)[\\s\\S]*?(?=\\n## )`);
  if (!pattern.test(content)) throw new Error(`missing Markdown section ${heading}`);
  return content.replace(pattern, `$1\n${lines.join("\n")}\n`);
}

function collectFileRefs(value, refs = new Set(), key = "") {
  if (key === "authority_binding") return [...refs];
  if (typeof value === "string" && /^(artifact|file):/.test(value)) refs.add(value);
  else if (Array.isArray(value)) value.forEach((item) => collectFileRefs(item, refs));
  else if (value && typeof value === "object") Object.entries(value).forEach(([childKey, child]) => collectFileRefs(child, refs, childKey));
  return [...refs];
}

function appendGitIgnore(root, entries) {
  const file = path.join(root, ".gitignore");
  const existing = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
  const lines = new Set(existing.split(/\r?\n/).map((line) => line.trim()).filter(Boolean));
  entries.forEach((entry) => lines.add(entry));
  fs.writeFileSync(file, `${[...lines].sort().join("\n")}\n`);
}

function writeFile(root, relative, content) {
  const file = path.join(root, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

function fileDigest(file) {
  return `sha256:${crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex")}`;
}

function digest(value) {
  return `sha256:${crypto.createHash("sha256").update(String(value)).digest("hex")}`;
}
