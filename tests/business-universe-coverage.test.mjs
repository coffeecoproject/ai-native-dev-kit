import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { evidenceDigest, extractMachineReadableEvidence } from "../scripts/lib/artifact-schema.mjs";
import {
  BUSINESS_UNIVERSE_LIFECYCLE_STAGES,
  businessUniverseChallengerDigest,
  coverageScenarioIdentity,
  runBusinessUniversePreflight,
} from "../scripts/lib/business-universe.mjs";
import { createEvidenceAuthorityBinding } from "../scripts/lib/evidence-authority.mjs";

const kitRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const intent = process.env.INTENTOS_BUSINESS_UNIVERSE_TEST_INTENT
  || "Interactive forms and local imports use the same validation; when processing fails it retries, and when cancelled it compensates before updating derived status.";
const expectedTier = process.env.INTENTOS_BUSINESS_UNIVERSE_EXPECTED_TIER || "MEDIUM";
const requiredStages = new Set([
  "ORIGIN_OR_ENTRY",
  "FAILURE_RETRY_OR_RECOVERY",
  "TERMINATION_REVERSAL_OR_COMPENSATION",
]);

function run(script, args, cwd = kitRoot) {
  return spawnSync(process.execPath, [path.join(kitRoot, script), ...args], {
    cwd,
    encoding: "utf8",
    timeout: 180_000,
    maxBuffer: 32 * 1024 * 1024,
  });
}

function project() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-business-universe-"));
  for (const dir of [
    "src", "src/components", "tests", "reviews", "evidence", "task-governance-reports", "work-queue-takeover-reports",
    "business-universe-coverage-reports", "business-rule-closures",
    "change-impact-coverage-reports", "plan-review-reports", "verification-plans",
    "test-evidence-reports", "execution-assurance-reports", "completion-evidence-reports",
    "review-surface-cards", "implementation-plans", "planning-closure-reports",
    "verification-runtime-plans", "verification-runtime-lifecycle-plans", "verification-run-manifests",
    ".intentos",
  ]) fs.mkdirSync(path.join(root, dir), { recursive: true });
  fs.writeFileSync(
    path.join(root, "src/components/interactive-entry.tsx"),
    "export function validateInteractiveSubmissionsAndDerivedStatus() { return 'shared validation'; }\n",
  );
  fs.writeFileSync(
    path.join(root, "src/scheduled-import.ts"),
    "export function retryScheduledImportsWithSchedulerAndCompensate() { return 'recovery path'; }\n",
  );
  fs.writeFileSync(path.join(root, "package.json"), JSON.stringify({
    name: "business-universe-runtime-fixture",
    private: true,
    scripts: { dev: "node runtime-service.mjs" },
  }, null, 2));
  fs.writeFileSync(path.join(root, "runtime-service.mjs"), `
import fs from "node:fs";
import path from "node:path";
if (!process.env.TEST_ISOLATION_PATH) process.exit(2);
fs.writeFileSync(path.join(process.env.TEST_ISOLATION_PATH, "ready"), "ready");
setInterval(() => {}, 1000);
`);
  fs.writeFileSync(path.join(root, "verify-current-task.mjs"), `
import fs from "node:fs";
import path from "node:path";
if (!process.env.INTENTOS_RUN_ID || !process.env.INTENTOS_OWNER_TOKEN) process.exit(2);
const session = process.env.TEST_ISOLATION_PATH;
const ready = session && fs.existsSync(path.join(session, "ready"));
const forbidden = session && fs.existsSync(path.join(session, "forbidden"));
if (process.argv[2] === "positive" ? !ready : forbidden) process.exit(3);
console.log("Business Universe runtime verified", process.argv[2], process.env.INTENTOS_RUN_ID);
`);
  const reviewSurface = run("scripts/resolve-review-surface.mjs", [root, "--intent", intent]);
  assert.equal(reviewSurface.status, 0, `${reviewSurface.stdout}\n${reviewSurface.stderr}`);
  fs.writeFileSync(path.join(root, "review-surface-cards/current.md"), reviewSurface.stdout);
  writeMachineEvidence(path.join(root, "reviews/challenger.md"), "Business Universe Challenger", {
    schema_version: "1.108.0",
    artifact_type: "business_universe_challenger",
    task_ref: "PENDING",
    intent_digest: `sha256:${"0".repeat(64)}`,
    discovery_boundary_digest: `sha256:${"0".repeat(64)}`,
    review_mode: "ISOLATED_READ_ONLY_REVIEW",
    reviewer_ref: "subagent:business-universe-challenger",
    reviewed_scenarios: [],
    checked_risks: ["pending semantic review"],
    findings: [],
    boundaries: {
      writes_target_files: "No",
      authorizes_implementation: "No",
      approves_completion: "No",
      replaces_unified_closure: "No",
    },
    challenger_digest: `sha256:${"0".repeat(64)}`,
    outcome: "PENDING",
  });
  return root;
}

function evidence(file) {
  const parsed = extractMachineReadableEvidence(fs.readFileSync(file, "utf8"));
  assert.equal(parsed?.ok, true, file);
  return parsed.value;
}

function writeMachineEvidence(file, title, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `# ${title}\n\n## Machine-Readable Evidence\n\n\`\`\`json\n${JSON.stringify(value, null, 2)}\n\`\`\`\n`);
}

function generateTaskGovernance(root, taskIntent = intent, workQueueItemRef = "") {
  const args = [
    root, "--intent", taskIntent, "--out", "task-governance-reports/current.md",
  ];
  if (workQueueItemRef) args.push("--work-queue-item", workQueueItemRef);
  const result = run("scripts/resolve-task-governance.mjs", args);
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  return evidence(path.join(root, "task-governance-reports/current.md"));
}

function writeCurrentWorkQueue(root, governance) {
  const sourceRef = "work-queue/current-task.md";
  const sourceContent = `# Work Queue Report

## Current Task

| Task ID | Title | State | Task ref | Intent digest | Notes |
| --- | --- | --- | --- | --- | --- |
| \`WQ-001\` | ${governance.intent} | \`CURRENT\` | \`${sourceRef}\` | \`${governance.intent_digest}\` | Current governed task. |

## Work Items

| Task ID | Title | State | Task ref | Intent digest | Resume review | Owner | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| \`WQ-001\` | ${governance.intent} | \`CURRENT\` | \`${sourceRef}\` | \`${governance.intent_digest}\` | \`N/A\` | \`Codex\` | Current governed task. |
`;
  fs.mkdirSync(path.join(root, "work-queue"), { recursive: true });
  fs.writeFileSync(path.join(root, sourceRef), sourceContent);
  const sourceDigest = `sha256:${crypto.createHash("sha256").update(`${sourceRef}\n${sourceContent}`).digest("hex")}`;
  const base = {
    schema_version: "1.84.1",
    artifact_type: "work_queue_takeover",
    work_queue_takeover_ref: "work-queue-takeover-reports/current.md",
    work_queue_takeover_digest: "",
    intent: governance.intent,
    intent_digest: governance.intent_digest,
    project_task_system_class: "MISSING_TASK_SYSTEM",
    recommended_action: "ESTABLISH_INTENTOS_WORK_QUEUE",
    future_task_authority: "INTENTOS_WORK_QUEUE",
    plain_user_summary: "The current task is bound to one IntentOS Work Queue item.",
    source_inventory: [{
      source_ref: sourceRef,
      source_digest: sourceDigest,
      source_type: "other",
      status: "CURRENT",
      summary: "Current user task",
    }],
    reliability_assessment: [{
      criterion: "One current task",
      result: "Yes",
      reason: "This fixture has one exact current task.",
    }],
    migration_dispositions: [{
      source_item: sourceRef,
      source_digest: sourceDigest,
      disposition: "MIGRATE_CURRENT",
      target_queue_state: "CURRENT",
      reason: "Bind the exact current task before downstream review.",
    }],
    queue_items: [{
      item_id: "WQ-001",
      state: "CURRENT",
      title: governance.intent,
      source_item: sourceRef,
      source_item_digest: sourceDigest,
      task_governance_ref: "task-governance-reports/current.md",
      task_governance_digest: governance.task_governance_digest,
      task_governance_binding_status: "VERIFIED",
      execution_review_eligible_after_task_governance: "Yes",
      execution_eligible: "Yes",
      reason: "The queue item is bound to current Task Governance evidence.",
    }],
    readiness: {
      takeover_ready: "Yes",
      takeover_review_ready: "Yes",
      can_codex_write_now: "No",
      can_execute_from_old_todo_directly: "No",
      blocked_by: [],
    },
    boundaries: {
      writes_target_files: "No",
      deletes_old_task_sources: "No",
      approves_implementation: "No",
      approves_completion: "No",
      approves_commit_or_push: "No",
      approves_release_or_production: "No",
      claims_full_adoption: "No",
      installs_native_assets: "No",
    },
    outcome: "TAKEOVER_RECOMMENDED",
  };
  const value = {
    ...base,
    work_queue_takeover_digest: evidenceDigest(base, ["work_queue_takeover_digest"]),
  };
  writeMachineEvidence(path.join(root, "work-queue-takeover-reports/current.md"), "Work Queue Takeover Report", value);
  return value;
}

function generateCandidateUniverse(root, options = {}) {
  const args = [
    root,
    "--intent", options.taskIntent || intent,
    "--task-governance-ref", "artifact:task-governance-reports/current.md",
    "--out", "business-universe-coverage-reports/current.md",
  ];
  if (options.withWorkQueue !== false) {
    args.push(
      "--work-queue-ref", "artifact:work-queue-takeover-reports/current.md",
      "--work-queue-item-id", "WQ-001",
    );
  }
  if (options.withChallenger !== false) args.push("--challenger-ref", "file:reviews/challenger.md");
  const generated = run("scripts/resolve-business-universe-coverage.mjs", args);
  assert.equal(generated.status, 0, `${generated.stdout}\n${generated.stderr}`);
  return evidence(path.join(root, "business-universe-coverage-reports/current.md"));
}

function prepareReadyUniverse(root) {
  let governance = generateTaskGovernance(root);
  assert.equal(governance.business_universe_routing.required, "Yes");
  assert.equal(governance.business_universe_routing.routing_result, "REQUIRED_WITH_EVIDENCE");
  writeCurrentWorkQueue(root, governance);
  governance = generateTaskGovernance(
    root,
    intent,
    "artifact:work-queue-takeover-reports/current.md#WQ-001",
  );
  writeCurrentWorkQueue(root, governance);
  const reviewSurfaceFile = path.join(root, "review-surface-cards/current.md");
  const reviewSurfaceEvidence = {
    schema_version: "1.113.0",
    artifact_type: "review_surface_card",
    task_ref: governance.task_ref,
    intent_digest: governance.intent_digest,
    reviewed_surfaces: ["scope", "verification", "lifecycle", "provenance", "reverse_path"],
    outcome: "READY",
  };
  fs.appendFileSync(reviewSurfaceFile, `\n## Machine-Readable Evidence\n\n\`\`\`json\n${JSON.stringify(reviewSurfaceEvidence, null, 2)}\n\`\`\`\n`);
  const value = generateCandidateUniverse(root);
  const sourceLocators = value.evidence_locators.filter((item) => item.evidence_kind === "PROJECT_SOURCE");
  assert.ok(sourceLocators.length >= 2, "fixture must discover two task-relevant project sources");

  const definitions = [
    {
      id: "interactive",
      name: "Interactive submission",
      provenance: "PROJECT_RUNTIME_PATH",
      locator: sourceLocators.find((item) => item.source_ref.endsWith("interactive-entry.tsx")) || sourceLocators[0],
    },
    {
      id: "scheduled",
      name: "Scheduled import",
      provenance: "PROJECT_NATIVE_AUTOMATION",
      locator: sourceLocators.find((item) => item.source_ref.endsWith("scheduled-import.ts")) || sourceLocators[1],
    },
  ];
  value.categories = definitions.map((item) => ({
    category_id: `category:${item.id}`,
    name: item.name,
    disposition: "REQUIRED",
    semantic_state: "EVIDENCE_BOUND",
    evidence_locator_refs: [item.locator.locator_id],
    exclusion_basis_locator_refs: [],
    notes: "Task-relevant behavior is bound to an exact project source locator.",
  }));
  value.participants = [];
  value.origins = definitions.map((item) => ({
    origin_id: `origin:${item.id}`,
    name: `${item.name} origin`,
    category_ids: [`category:${item.id}`],
    participant_ids: [],
    path_provenance: item.provenance,
    semantic_state: "EVIDENCE_BOUND",
    evidence_locator_refs: [item.locator.locator_id],
  }));
  value.processing_paths = definitions.map((item) => ({
    processing_path_id: `processing-path:${item.id}`,
    name: `${item.name} processing path`,
    category_ids: [`category:${item.id}`],
    origin_ids: [`origin:${item.id}`],
    path_provenance: item.provenance,
    semantic_state: "EVIDENCE_BOUND",
    evidence_locator_refs: [item.locator.locator_id],
  }));
  value.selection_points = [];
  value.consistency_groups = [];
  value.coverage_scenarios = definitions.flatMap((item) => [...requiredStages].map((stage) => {
    const base = {
      category_ids: [`category:${item.id}`],
      participant_ids: [],
      origin_ids: [`origin:${item.id}`],
      lifecycle_stage: stage,
      processing_path_ids: [`processing-path:${item.id}`],
      selection_point_ids: [],
      consistency_group_ids: [],
      path_provenance: item.provenance,
      required_proof_strength: "PROJECT_NATIVE_BEHAVIOR_PROOF",
      expected_behavior: `${item.name} follows the shared rule at ${stage}.`,
      negative_or_reverse_behavior: `${item.name} exposes and verifies the opposite or recovery behavior at ${stage}.`,
      source_locator_refs: [item.locator.locator_id],
    };
    return { ...coverageScenarioIdentity(base), ...base };
  }));
  const scenariosByCategoryAndStage = new Map(value.coverage_scenarios.map((scenario) => [
    `${scenario.category_ids[0]}|${scenario.lifecycle_stage}`,
    scenario.coverage_scenario_id,
  ]));
  value.lifecycle_coverage = definitions.flatMap((item) => BUSINESS_UNIVERSE_LIFECYCLE_STAGES.map((stage) => {
    const required = requiredStages.has(stage);
    return {
      lifecycle_coverage_id: `lifecycle:${item.id}-${stage.toLowerCase().replaceAll("_", "-")}`,
      category_ids: [`category:${item.id}`],
      lifecycle_stage: stage,
      disposition: required ? "REQUIRED" : "NOT_APPLICABLE_WITH_EVIDENCE",
      reason: required
        ? "The current task explicitly covers this lifecycle stage."
        : "The exact project source shows no separate behavior for this stage in the current task boundary.",
      evidence_locator_refs: [item.locator.locator_id],
      coverage_scenario_ids: required
        ? [scenariosByCategoryAndStage.get(`category:${item.id}|${stage}`)]
        : [],
    };
  }));
  value.fact_dependencies = [];
  value.unresolved_items = [];
  const challengerBase = {
    schema_version: "1.108.0",
    artifact_type: "business_universe_challenger",
    task_ref: value.task_ref,
    intent_digest: value.intent_digest,
    discovery_boundary_digest: value.discovery_projection.discovery_boundary_digest,
    review_mode: "ISOLATED_READ_ONLY_REVIEW",
    reviewer_ref: "subagent:business-universe-challenger",
    reviewed_scenarios: value.coverage_scenarios.map((scenario) => ({
      coverage_scenario_id: scenario.coverage_scenario_id,
      scenario_digest: scenario.scenario_digest,
    })),
    checked_risks: [
      "missing task-relevant class or origin",
      "positive-only lifecycle coverage",
      "non-runtime path presented as runtime proof",
      "partial or inconsistent side effect",
    ],
    findings: [],
    boundaries: {
      writes_target_files: "No",
      authorizes_implementation: "No",
      approves_completion: "No",
      replaces_unified_closure: "No",
    },
    outcome: "PASSED",
  };
  const challenger = {
    ...challengerBase,
    challenger_digest: businessUniverseChallengerDigest(challengerBase),
  };
  writeMachineEvidence(
    path.join(root, "reviews/challenger.md"),
    "Business Universe Challenger",
    challenger,
  );
  const authoritySourceRefs = value.authority_binding.sources.map((item) => item.ref);
  value.authority_binding = createEvidenceAuthorityBinding(root, {
    taskRef: value.task_ref,
    intentDigest: value.intent_digest,
    sourceRefs: authoritySourceRefs,
  });
  value.challenger_review.status = "PASSED";
  value.challenger_review.checked_risks = [...challenger.checked_risks];
  value.challenger_review.findings = [];
  value.outcome = "COVERAGE_READY";
  value.coverage_digest = evidenceDigest(value, ["coverage_digest"]);
  fs.writeFileSync(path.join(root, "business-universe-coverage-reports/current.md"), renderUniverse(value));
  return { governance, universe: value };
}

function strictUniverseCheck(root) {
  return run("scripts/check-business-universe-coverage.mjs", [
    root,
    "--report", "business-universe-coverage-reports/current.md",
    "--require-structured-evidence",
    "--require-ready",
  ]);
}

function generateVerificationChain(root) {
  const businessRule = run("scripts/resolve-business-rule-closure.mjs", [
    root,
    "--intent", intent,
    "--task-governance-ref", "artifact:task-governance-reports/current.md",
    "--business-universe-ref", "artifact:business-universe-coverage-reports/current.md",
    "--out", "business-rule-closures/current.md",
  ]);
  assert.equal(businessRule.status, 0, `${businessRule.stdout}\n${businessRule.stderr}`);

  const impact = run("scripts/resolve-change-impact-coverage.mjs", [
    root,
    "--intent", intent,
    "--business-rule-ref", "artifact:business-rule-closures/current.md",
    "--out", "change-impact-coverage-reports/current.md",
  ]);
  assert.equal(impact.status, 0, `${impact.stdout}\n${impact.stderr}`);

  const verification = run("scripts/resolve-verification-plan.mjs", [
    root,
    "--intent", intent,
    "--business-rule-ref", "artifact:business-rule-closures/current.md",
    "--impact-ref", "artifact:change-impact-coverage-reports/current.md",
    "--out", "verification-plans/current.md",
  ]);
  assert.equal(verification.status, 0, `${verification.stdout}\n${verification.stderr}`);
  return {
    businessRule: evidence(path.join(root, "business-rule-closures/current.md")),
    impact: evidence(path.join(root, "change-impact-coverage-reports/current.md")),
    verification: evidence(path.join(root, "verification-plans/current.md")),
  };
}

function scenarioPlan(universe) {
  const scenarioRows = universe.coverage_scenarios.map((scenario) => [
    `Scenario ${scenario.coverage_scenario_id}`,
    `Lifecycle ${scenario.lifecycle_stage}`,
    `Provenance ${scenario.path_provenance}`,
    `Expected ${scenario.expected_behavior}`,
    `Reverse ${scenario.negative_or_reverse_behavior}`,
  ].join("\n")).join("\n\n");
  const highImpactControls = expectedTier === "HIGH"
    ? `
## Permission And Destructive-Data Controls

Resolve authorization before existence checks so unauthorized actors cannot infer
whether a protected record exists; this explicitly prevents existence leakage and
preserves error priority. Return the authorization failure before any not-found or
validation detail, and verify both allowed and denied actor paths.

Before deletion, check historical associations and block deletion while protected
history remains. Write the immutable audit event before the destructive mutation;
if audit persistence fails, abort without deleting. Verify the blocked-history,
audit-failure, and successful-delete sequences independently.
`
    : "";
  return `# Implementation Plan

Intent: ${intent}
Task reference: ${universe.task_ref}

## Scope

Update the shared interactive and scheduled validation paths in
\`src/components/interactive-entry.tsx\` and \`src/scheduled-import.ts\` while
preserving every Business Universe scenario and its reverse behavior.

## Boundaries

Keep the change inside the current fixture. Do not use production resources,
external effects, unrelated files, or user-selected technical exceptions.

## Implementation Sequence

1. Update the interactive validation path and its visible failure behavior.
2. Update scheduled retries, duplicate handling, compensation, and derived state.
3. Verify current runtime behavior, interruption handling, and safe recovery.

${scenarioRows}

${highImpactControls}

## Verification

Run \`git diff --check\` and bind focused current-task evidence for every
generated verification obligation, including background and recovery paths.

## Rollback And Recovery

Restore \`src/components/interactive-entry.tsx\` and
\`src/scheduled-import.ts\` together if any scenario, runtime, retry, or
compensation proof fails; partial restoration is not accepted.

Verification command: node --test tests/current-task.test.mjs
`;
}

function writeObligationEvidence(root, verification) {
  const refs = [];
  for (const [index, obligation] of verification.verification_obligations.filter((item) => item.required === "Yes").entries()) {
    const relative = `evidence/obligation-${index + 1}.txt`;
    const childEnvironment = { ...process.env };
    delete childEnvironment.NODE_TEST_CONTEXT;
    const observed = spawnSync(process.execPath, ["--test", "tests/current-task.test.cjs"], {
      cwd: root,
      env: childEnvironment,
      encoding: "utf8",
      timeout: 30_000,
      maxBuffer: 4 * 1024 * 1024,
    });
    assert.equal(observed.status, 0, `${observed.stdout}\n${observed.stderr}`);
    fs.writeFileSync(path.join(root, relative), [
      `id: evidence:${index + 1}`,
      "evidence_type: TEST_REPORT",
      "result_state: PASSED",
      "command: node --test tests/current-task.test.cjs",
      "owner: codex",
      "environment: isolated-local",
      "ran_at: 2026-07-13T00:00:00.000Z",
      "exit_code: 0",
      "ran_after_change: Yes",
      "current_task_match: Yes",
      `covers_obligations: ${obligation.id}`,
      "limitations: Bound only to the named verification obligation.",
      "",
      observed.stdout.trim(),
      observed.stderr.trim(),
    ].join("\n"));
    refs.push(`artifact:${relative}`);
  }
  return refs;
}

function installExactObligationTest(root, verification) {
  const obligations = verification.verification_obligations.filter((item) => item.required === "Yes");
  const cases = obligations.flatMap((obligation) => [
    `test(${JSON.stringify(`[${obligation.id}] tests/current-task.test.cjs :: exact current obligation has observed positive and reverse behavior`)}, () => {`,
    "  const interactive = fs.readFileSync(path.join(process.cwd(), \"src/components/interactive-entry.tsx\"), \"utf8\");",
    "  const scheduled = fs.readFileSync(path.join(process.cwd(), \"src/scheduled-import.ts\"), \"utf8\");",
    "  assert.match(interactive, /shared validation/);",
    "  assert.match(scheduled, /recovery path/);",
    "  assert.doesNotMatch(interactive, /bypass validation/i);",
    "  assert.doesNotMatch(scheduled, /skip recovery/i);",
    "});",
  ]);
  fs.writeFileSync(path.join(root, "tests/current-task.test.cjs"), [
    'const assert = require("node:assert/strict");',
    'const fs = require("node:fs");',
    'const path = require("node:path");',
    'const test = require("node:test");',
    "",
    ...cases,
    "",
  ].join("\n"));
}

function refreshUniverseAuthority(root, universe) {
  universe.authority_binding = createEvidenceAuthorityBinding(root, {
    taskRef: universe.task_ref,
    intentDigest: universe.intent_digest,
    sourceRefs: universe.authority_binding.sources.map((item) => item.ref),
  });
  universe.coverage_digest = evidenceDigest(universe, ["coverage_digest"]);
  fs.writeFileSync(path.join(root, "business-universe-coverage-reports/current.md"), renderUniverse(universe));
}

function completeVerificationRuntime(root, governance, verification) {
  const obligationIds = verification.verification_obligations
    .filter((item) => item.required === "Yes")
    .map((item) => item.id);
  const runtimeResources = [{
    resource_id: "session",
    resource_type: "SESSION_NAMESPACE",
    relative_path: "resources/session",
    environment_name: "TEST_ISOLATION_PATH",
    created_by_action: "executor:preflight",
    cleanup_strategy: "REMOVE_OWNED_PATH",
    production_instance: "No",
    shared_resource: "No",
    role: "test-user",
    migration_revision: "not-recorded",
  }];
  if (expectedTier === "HIGH") {
    runtimeResources.push({
      resource_id: "data",
      resource_type: "CACHE_NAMESPACE",
      relative_path: "resources/data",
      environment_name: "TEST_DATA_NAMESPACE",
      created_by_action: "executor:preflight",
      cleanup_strategy: "REMOVE_OWNED_PATH",
      production_instance: "No",
      shared_resource: "No",
      role: "test-user",
      migration_revision: "not-recorded",
    });
  }
  fs.writeFileSync(path.join(root, ".intentos/verification-runtime-lifecycle.json"), JSON.stringify({
    version: "1.103.0",
    adapter_kind: "LOCAL_PROCESS",
    actions: [
      {
        id: "business-universe-service",
        phase: "START_SERVICE",
        kind: "SERVICE",
        argv: ["node", "runtime-service.mjs"],
        cwd: ".",
        timeout_ms: 10_000,
        environment: [],
        obligation_ids: [],
        positive_path: "No",
        negative_path: "No",
        resource_ids: ["session"],
        external_effect: "No",
        depends_on: [],
      },
      {
        id: "verify-business-universe-positive",
        phase: "VERIFY",
        kind: "PROBE",
        argv: ["node", "--test", "tests/current-task.test.cjs"],
        cwd: ".",
        timeout_ms: 10_000,
        environment: [],
        obligation_ids: obligationIds,
        positive_path: "Yes",
        negative_path: "No",
        resource_ids: ["session"],
        external_effect: "No",
        depends_on: ["business-universe-service"],
      },
      {
        id: "verify-business-universe-negative",
        phase: "VERIFY",
        kind: "PROBE",
        argv: ["node", "--test", "tests/current-task.test.cjs"],
        cwd: ".",
        timeout_ms: 10_000,
        environment: [],
        obligation_ids: obligationIds,
        positive_path: "No",
        negative_path: "Yes",
        resource_ids: ["session"],
        external_effect: "No",
        depends_on: ["business-universe-service"],
      },
    ],
    resources: runtimeResources,
  }, null, 2));
  const runtimePlan = run("scripts/resolve-verification-runtime-plan.mjs", [
    root,
    "--intent", intent,
    "--task-ref", governance.task_ref,
    "--task-tier", expectedTier,
    "--task-governance-ref", "artifact:task-governance-reports/current.md",
    "--verification-plan-ref", "artifact:verification-plans/current.md",
    "--out", "verification-runtime-plans/current.md",
  ]);
  assert.equal(runtimePlan.status, 0, `${runtimePlan.stdout}\n${runtimePlan.stderr}`);
  const lifecycle = run("scripts/resolve-verification-runtime-lifecycle.mjs", [
    root,
    "--runtime-plan-ref", "artifact:verification-runtime-plans/current.md",
    "--run-id", "vrun-business-universe-current",
    "--out", "verification-runtime-lifecycle-plans/current.md",
  ]);
  assert.equal(lifecycle.status, 0, `${lifecycle.stdout}\n${lifecycle.stderr}`);
  const executed = run("scripts/run-verification-runtime.mjs", [
    root,
    "--plan", "artifact:verification-runtime-lifecycle-plans/current.md",
    "--out", "verification-run-manifests/current.md",
  ]);
  assert.equal(executed.status, 0, `${executed.stdout}\n${executed.stderr}`);
  return "artifact:verification-run-manifests/current.md";
}

function rewriteEmbeddedEvidence(file, value) {
  const content = fs.readFileSync(file, "utf8");
  fs.writeFileSync(file, content.replace(
    /```json\s*[\s\S]*?```/,
    `\`\`\`json\n${JSON.stringify(value, null, 2)}\n\`\`\``,
  ));
}

test("1.108 skips bounded non-behavioral work without writing an empty report", () => {
  const root = project();
  const taskIntent = "Fix one typo in README documentation";
  const governance = generateTaskGovernance(root, taskIntent);
  assert.equal(governance.business_universe_routing.required, "No");
  const out = "business-universe-coverage-reports/not-required.md";
  const result = run("scripts/resolve-business-universe-coverage.mjs", [
    root,
    "--intent", taskIntent,
    "--task-governance-ref", "artifact:task-governance-reports/current.md",
    "--out", out,
    "--json",
  ]);
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.equal(JSON.parse(result.stdout).outcome, "NOT_REQUIRED_WITH_REASON");
  assert.equal(fs.existsSync(path.join(root, out)), false);
});

test("1.108 keeps ambiguous behavioral work in technical inspection instead of asking the user", () => {
  const root = project();
  const taskIntent = "Adjust the local result behavior";
  const governance = generateTaskGovernance(root, taskIntent);
  assert.equal(governance.business_universe_routing.required, "Unknown");
  assert.equal(governance.business_universe_routing.routing_result, "TECHNICAL_INSPECTION_REQUIRED");
  assert.equal(governance.business_universe_routing.technical_terms_required_from_user, "No");
  assert.equal(governance.readiness.ready_for_implementation_review, "No");
});

test("1.113 discovery includes ESM implementation and test sources", () => {
  const root = project();
  fs.mkdirSync(path.join(root, "scripts"), { recursive: true });
  fs.mkdirSync(path.join(root, "tests"), { recursive: true });
  fs.writeFileSync(path.join(root, "scripts", "apply-policy.mjs"), "export const applyPolicy = 'atomic recovery';\n");
  fs.writeFileSync(path.join(root, "tests", "apply-policy.test.mjs"), "// atomic recovery verification\n");

  const preflight = runBusinessUniversePreflight({
    projectRoot: root,
    intent: "Complete atomic apply recovery behavior and verification",
    taskKind: "code_behavior",
  });

  assert.ok(preflight.discovery_projection.inspected_roots.includes("scripts"));
  assert.ok(preflight.discovery_projection.inspected_roots.includes("tests"));
  assert.ok(preflight.discovery_projection.scan_segments.some((item) => item.root === "scripts" && item.status === "COMPLETE"));
  assert.ok(preflight.discovery_projection.scan_segments.some((item) => item.root === "tests" && item.status === "COMPLETE"));
});

test("1.108 candidate output fails closed without exact Work Queue, semantic inspection, and Challenger closure", () => {
  const root = project();
  const governance = generateTaskGovernance(root);
  assert.equal(governance.business_universe_routing.required, "Yes");
  generateCandidateUniverse(root, { withWorkQueue: false, withChallenger: false });
  const checked = strictUniverseCheck(root);
  assert.notEqual(checked.status, 0);
  assert.match(`${checked.stdout}\n${checked.stderr}`, /Work Queue|Challenger|COVERAGE_READY|semantic/i);
});

test("1.108 accepts only a complete lifecycle, provenance, task, authority, and Challenger-bound Universe", () => {
  const root = project();
  const { universe } = prepareReadyUniverse(root);
  const checked = strictUniverseCheck(root);
  assert.equal(checked.status, 0, `${checked.stdout}\n${checked.stderr}`);
  assert.equal(universe.lifecycle_coverage.length, universe.categories.length * BUSINESS_UNIVERSE_LIFECYCLE_STAGES.length);
  assert.ok(universe.coverage_scenarios.every((scenario) => scenario.negative_or_reverse_behavior.length > 0));
});

test("1.108 rejects structurally valid Challenger evidence from another task", () => {
  const root = project();
  const { universe } = prepareReadyUniverse(root);
  const challengerFile = path.join(root, "reviews/challenger.md");
  const challenger = evidence(challengerFile);
  challenger.task_ref = "task:another-business-universe";
  challenger.challenger_digest = businessUniverseChallengerDigest(challenger);
  writeMachineEvidence(challengerFile, "Business Universe Challenger", challenger);

  universe.authority_binding = createEvidenceAuthorityBinding(root, {
    taskRef: universe.task_ref,
    intentDigest: universe.intent_digest,
    sourceRefs: universe.authority_binding.sources.map((item) => item.ref),
  });
  universe.coverage_digest = evidenceDigest(universe, ["coverage_digest"]);
  fs.writeFileSync(path.join(root, "business-universe-coverage-reports/current.md"), renderUniverse(universe));

  const checked = strictUniverseCheck(root);
  assert.notEqual(checked.status, 0);
  assert.match(`${checked.stdout}\n${checked.stderr}`, /Challenger task_ref does not match/i);
});

test("1.108 rejects a missing lifecycle declaration even when the remaining scenarios are valid", () => {
  const root = project();
  const { universe } = prepareReadyUniverse(root);
  universe.lifecycle_coverage = universe.lifecycle_coverage.filter((item) => !(
    item.category_ids.includes("category:interactive")
      && item.lifecycle_stage === "OBSERVATION_OR_AUDIT"
  ));
  universe.coverage_digest = evidenceDigest(universe, ["coverage_digest"]);
  fs.writeFileSync(path.join(root, "business-universe-coverage-reports/current.md"), renderUniverse(universe));
  const checked = strictUniverseCheck(root);
  assert.notEqual(checked.status, 0);
  assert.match(`${checked.stdout}\n${checked.stderr}`, /must declare lifecycle stage OBSERVATION_OR_AUDIT/i);
});

test("1.108 rejects fixture, mock, seed, or manual paths presented as runtime proof", () => {
  const root = project();
  const { universe } = prepareReadyUniverse(root);
  const scenario = universe.coverage_scenarios[0];
  scenario.path_provenance = "FIXTURE_OR_SEED_PATH";
  Object.assign(scenario, coverageScenarioIdentity(scenario));
  const previousId = universe.lifecycle_coverage
    .find((item) => item.category_ids.includes("category:interactive") && item.lifecycle_stage === scenario.lifecycle_stage)
    .coverage_scenario_ids[0];
  universe.lifecycle_coverage.forEach((item) => {
    item.coverage_scenario_ids = item.coverage_scenario_ids.map((id) => id === previousId ? scenario.coverage_scenario_id : id);
  });
  universe.coverage_digest = evidenceDigest(universe, ["coverage_digest"]);
  fs.writeFileSync(path.join(root, "business-universe-coverage-reports/current.md"), renderUniverse(universe));
  const checked = strictUniverseCheck(root);
  assert.notEqual(checked.status, 0);
  assert.match(`${checked.stdout}\n${checked.stderr}`, /cannot use FIXTURE_OR_SEED_PATH/i);
});

test("1.108 preserves every scenario through Business Rule, Impact, and Verification Plan", () => {
  const root = project();
  const { universe } = prepareReadyUniverse(root);
  assert.equal(strictUniverseCheck(root).status, 0);

  const businessRule = run("scripts/resolve-business-rule-closure.mjs", [
    root,
    "--intent", intent,
    "--task-governance-ref", "artifact:task-governance-reports/current.md",
    "--business-universe-ref", "artifact:business-universe-coverage-reports/current.md",
    "--out", "business-rule-closures/current.md",
  ]);
  assert.equal(businessRule.status, 0, `${businessRule.stdout}\n${businessRule.stderr}`);
  const businessRuleValue = evidence(path.join(root, "business-rule-closures/current.md"));
  assert.equal(businessRuleValue.state, "READY_FOR_IMPACT_COVERAGE");
  assert.ok(
    businessRuleValue.dimensions.every((item) => item.evidence_refs.includes("artifact:business-universe-coverage-reports/current.md")),
    "Universe-routed rule dimensions must use current Universe evidence instead of an abstract human-decision placeholder",
  );
  assert.doesNotMatch(
    businessRuleValue.dimensions.find((item) => item.dimension === "HUMAN_DECISION")?.summary || "",
    /low-risk/i,
  );
  assert.deepEqual(
    new Set(businessRuleValue.business_rule_scenario_mappings.flatMap((item) => item.source_coverage_scenario_ids)),
    new Set(universe.coverage_scenarios.map((item) => item.coverage_scenario_id)),
  );
  const businessRuleCheck = run("scripts/check-business-rule-closure.mjs", [
    root, "--report", "business-rule-closures/current.md", "--require-structured-evidence",
  ]);
  assert.equal(businessRuleCheck.status, 0, `${businessRuleCheck.stdout}\n${businessRuleCheck.stderr}`);

  const impact = run("scripts/resolve-change-impact-coverage.mjs", [
    root,
    "--intent", intent,
    "--business-rule-ref", "artifact:business-rule-closures/current.md",
    "--out", "change-impact-coverage-reports/current.md",
  ]);
  assert.equal(impact.status, 0, `${impact.stdout}\n${impact.stderr}`);
  const impactValue = evidence(path.join(root, "change-impact-coverage-reports/current.md"));
  assert.deepEqual(
    new Set(impactValue.impact_scenario_mappings.flatMap((item) => item.source_coverage_scenario_ids)),
    new Set(universe.coverage_scenarios.map((item) => item.coverage_scenario_id)),
  );
  assert.equal(
    impactValue.affected_surface_map.some((item) => item.surface === "API_CONTRACT"),
    false,
    "a Web plus worker fixture must not synthesize an API contract surface",
  );
  const impactCheck = run("scripts/check-change-impact-coverage.mjs", [
    root,
    "--report", "change-impact-coverage-reports/current.md",
    "--require-structured-evidence",
    "--require-business-rule-ready",
  ]);
  assert.equal(impactCheck.status, 0, `${impactCheck.stdout}\n${impactCheck.stderr}`);

  const highRiskImpact = run("scripts/resolve-change-impact-coverage.mjs", [
    root,
    "--intent", intent,
    "--business-rule-ref", "artifact:business-rule-closures/current.md",
    "--changed-files", "prisma/schema.prisma,src/auth/permissions.ts,.github/workflows/release.yml",
    "--out", "change-impact-coverage-reports/high-risk.md",
  ]);
  assert.equal(highRiskImpact.status, 0, `${highRiskImpact.stdout}\n${highRiskImpact.stderr}`);
  const highRiskImpactValue = evidence(path.join(root, "change-impact-coverage-reports/high-risk.md"));
  assert.equal(highRiskImpactValue.outcome, "CHANGE_IMPACT_RECORDED");
  for (const surface of ["DATA_MODEL", "PERMISSION_RISK", "RELEASE_IMPACT"]) {
    assert.equal(
      highRiskImpactValue.affected_surface_map.find((item) => item.surface === surface)?.status,
      "REQUIRED",
      `${surface} must remain a Codex-owned verification obligation instead of a user technical decision`,
    );
  }
  assert.equal(
    highRiskImpactValue.affected_surface_map.some((item) => item.status === "NEEDS_HUMAN_DECISION"),
    false,
  );

  const highRiskVerification = run("scripts/resolve-verification-plan.mjs", [
    root,
    "--intent", intent,
    "--business-rule-ref", "artifact:business-rule-closures/current.md",
    "--impact-ref", "artifact:change-impact-coverage-reports/high-risk.md",
    "--change-kind", "REFACTOR",
    "--out", "verification-plans/high-risk.md",
  ]);
  assert.equal(highRiskVerification.status, 0, `${highRiskVerification.stdout}\n${highRiskVerification.stderr}`);
  const highRiskVerificationValue = evidence(path.join(root, "verification-plans/high-risk.md"));
  for (const surface of ["DATA_MODEL", "PERMISSION_RISK", "RELEASE_IMPACT"]) {
    const obligation = highRiskVerificationValue.verification_obligations.find((item) => item.source_surface === surface);
    assert.ok(obligation, `${surface} must produce a verification obligation`);
    assert.equal(obligation.owner, "codex", `${surface} technical verification must remain Codex-owned`);
    assert.equal(obligation.decision_ref, "", `${surface} must not require a user technical decision`);
  }
  assert.equal(
    highRiskVerificationValue.manual_verification.some((item) => /domain-owner|release-owner|verification-scope/i.test([
      item.owner,
      item.decision_ref,
      item.expected_manual_evidence,
    ].join(" "))),
    false,
    "technical risk verification must not be delegated to a domain or release owner",
  );
  const highRiskVerificationCheck = run("scripts/check-verification-plan.mjs", [
    root,
    "--report", "verification-plans/high-risk.md",
    "--require-structured-evidence",
    "--require-business-rule-ref",
    "--require-impact-ref",
    "--strict-source-binding",
    "--require-evidence-authority",
  ]);
  assert.equal(highRiskVerificationCheck.status, 0, `${highRiskVerificationCheck.stdout}\n${highRiskVerificationCheck.stderr}`);

  const verification = run("scripts/resolve-verification-plan.mjs", [
    root,
    "--intent", intent,
    "--business-rule-ref", "artifact:business-rule-closures/current.md",
    "--impact-ref", "artifact:change-impact-coverage-reports/current.md",
    "--out", "verification-plans/current.md",
  ]);
  assert.equal(verification.status, 0, `${verification.stdout}\n${verification.stderr}`);
  const verificationValue = evidence(path.join(root, "verification-plans/current.md"));
  for (const scenario of universe.coverage_scenarios) {
    const obligations = verificationValue.verification_obligations.filter((item) =>
      item.source_coverage_scenario_ids.includes(scenario.coverage_scenario_id));
    assert.ok(obligations.some((item) => item.required === "Yes" && /expected/i.test(item.id)));
    assert.ok(obligations.some((item) => item.required === "Yes" && /negative/i.test(item.id)));
  }
  const scenarioSurfaces = new Map(universe.coverage_scenarios.map((scenario) => [
    scenario.coverage_scenario_id,
    new Set(verificationValue.verification_obligations
      .filter((item) => item.source_coverage_scenario_ids.includes(scenario.coverage_scenario_id))
      .map((item) => item.source_surface)),
  ]));
  for (const scenario of universe.coverage_scenarios) {
    const category = scenario.category_ids[0];
    if (category === "category:interactive") {
      assert.deepEqual(scenarioSurfaces.get(scenario.coverage_scenario_id), new Set(["WEB_CLIENT_BEHAVIOR"]));
    }
    if (category === "category:scheduled") {
      assert.deepEqual(scenarioSurfaces.get(scenario.coverage_scenario_id), new Set(["WORKER_OR_DATA_PATH"]));
    }
  }
  const verificationCheck = run("scripts/check-verification-plan.mjs", [
    root,
    "--report", "verification-plans/current.md",
    "--require-structured-evidence",
    "--require-business-rule-ref",
    "--require-impact-ref",
    "--strict-source-binding",
    "--require-evidence-authority",
  ]);
  assert.equal(verificationCheck.status, 0, `${verificationCheck.stdout}\n${verificationCheck.stderr}`);
});

test("1.108 fails when Change Impact drops one Business Universe scenario", () => {
  const root = project();
  prepareReadyUniverse(root);
  run("scripts/resolve-business-rule-closure.mjs", [
    root, "--intent", intent,
    "--task-governance-ref", "artifact:task-governance-reports/current.md",
    "--business-universe-ref", "artifact:business-universe-coverage-reports/current.md",
    "--out", "business-rule-closures/current.md",
  ]);
  run("scripts/resolve-change-impact-coverage.mjs", [
    root, "--intent", intent,
    "--business-rule-ref", "artifact:business-rule-closures/current.md",
    "--out", "change-impact-coverage-reports/current.md",
  ]);
  const file = path.join(root, "change-impact-coverage-reports/current.md");
  const value = evidence(file);
  value.impact_scenario_mappings.pop();
  value.impact_digest = evidenceDigest(value, ["impact_digest"]);
  rewriteEmbeddedEvidence(file, value);
  const checked = run("scripts/check-change-impact-coverage.mjs", [
    root,
    "--report", "change-impact-coverage-reports/current.md",
    "--require-structured-evidence",
    "--require-business-rule-ready",
  ]);
  assert.notEqual(checked.status, 0);
  assert.match(`${checked.stdout}\n${checked.stderr}`, /scenario|Business Universe/i);
});

test("1.108 preserves every scenario through Plan Review, Test Evidence, Execution Assurance, and Completion", () => {
  const root = project();
  const { governance, universe } = prepareReadyUniverse(root);
  assert.equal(governance.impact_classification.task_impact, expectedTier);
  assert.equal(governance.review_policy.review_level, expectedTier === "HIGH" ? "FULL" : "TARGETED");
  let universeCheck = strictUniverseCheck(root);
  assert.equal(universeCheck.status, 0, `Business Universe became stale before downstream planning:\n${universeCheck.stdout}\n${universeCheck.stderr}`);
  let { verification } = generateVerificationChain(root);
  const initialObligationIds = verification.verification_obligations
    .filter((item) => item.required === "Yes")
    .map((item) => item.id);
  installExactObligationTest(root, verification);
  refreshUniverseAuthority(root, universe);
  ({ verification } = generateVerificationChain(root));
  assert.deepEqual(
    verification.verification_obligations.filter((item) => item.required === "Yes").map((item) => item.id),
    initialObligationIds,
    "installing exact tests must not alter the reviewed obligation set",
  );
  universeCheck = strictUniverseCheck(root);
  assert.equal(universeCheck.status, 0, `Business Universe became stale after downstream evidence generation:\n${universeCheck.stdout}\n${universeCheck.stderr}`);
  fs.writeFileSync(path.join(root, "implementation-plans/current.md"), scenarioPlan(universe));
  universeCheck = strictUniverseCheck(root);
  assert.equal(universeCheck.status, 0, `Business Universe became stale after implementation plan generation:\n${universeCheck.stdout}\n${universeCheck.stderr}`);

  const planReview = run("scripts/resolve-plan-review.mjs", [
    root,
    "--intent", intent,
    "--plan", "implementation-plans/current.md",
    "--task-governance", "artifact:task-governance-reports/current.md",
    "--business-universe", "artifact:business-universe-coverage-reports/current.md",
    "--review-surface", "artifact:review-surface-cards/current.md",
    "--business-rule", "artifact:business-rule-closures/current.md",
    "--impact", "artifact:change-impact-coverage-reports/current.md",
    "--verification-plan", "artifact:verification-plans/current.md",
    "--work-queue-item", "artifact:work-queue-takeover-reports/current.md#WQ-001",
    "--out", "plan-review-reports/current.md",
  ]);
  assert.equal(planReview.status, 0, `${planReview.stdout}\n${planReview.stderr}`);
  universeCheck = strictUniverseCheck(root);
  assert.equal(universeCheck.status, 0, `Business Universe became stale after Plan Review report generation:\n${universeCheck.stdout}\n${universeCheck.stderr}`);
  const planReviewValue = evidence(path.join(root, "plan-review-reports/current.md"));
  assert.deepEqual(
    new Set(planReviewValue.plan_scenario_reviews.flatMap((item) => item.source_coverage_scenario_ids)),
    new Set(universe.coverage_scenarios.map((item) => item.coverage_scenario_id)),
  );
  assert.ok(planReviewValue.plan_scenario_reviews.every((item) => item.review_state === "REVIEWED"));
  const planReviewCheck = run("scripts/check-plan-review.mjs", [
    root,
    "--report", "plan-review-reports/current.md",
    "--require-structured-evidence",
  ]);
  assert.equal(planReviewCheck.status, 0, `${planReviewCheck.stdout}\n${planReviewCheck.stderr}`);
  assert.equal(planReviewValue.plan_review_state, "PLAN_REVIEW_PASSED");

  const planningClosure = run("scripts/resolve-planning-closure.mjs", [
    root,
    "--intent", intent,
    "--task-ref", governance.task_ref,
    "--intent-digest", governance.intent_digest,
    "--entry-state", "READY_FOR_INTENTOS_OPERATION",
    "--task-governance-report", "task-governance-reports/current.md",
    "--business-universe-report", "business-universe-coverage-reports/current.md",
    "--business-rule-report", "business-rule-closures/current.md",
    "--impact-report", "change-impact-coverage-reports/current.md",
    "--verification-plan-report", "verification-plans/current.md",
    "--plan-review-report", "plan-review-reports/current.md",
    "--out", "planning-closure-reports/current.md",
  ]);
  assert.equal(planningClosure.status, 0, `${planningClosure.stdout}\n${planningClosure.stderr}`);
  const planningClosureCheck = run("scripts/check-planning-closure.mjs", [
    root,
    "--report", "planning-closure-reports/current.md",
    "--require-ready",
  ]);
  assert.equal(planningClosureCheck.status, 0, `${planningClosureCheck.stdout}\n${planningClosureCheck.stderr}`);

  const runtimeManifestRef = completeVerificationRuntime(root, governance, verification);
  const evidenceRefs = writeObligationEvidence(root, verification);
  const testEvidence = run("scripts/resolve-test-evidence.mjs", [
    root,
    "--intent", intent,
    "--verification-plan-ref", "artifact:verification-plans/current.md",
    "--runtime-manifest-ref", runtimeManifestRef,
    "--evidence", evidenceRefs.join(","),
    "--out", "test-evidence-reports/current.md",
  ]);
  assert.equal(testEvidence.status, 0, `${testEvidence.stdout}\n${testEvidence.stderr}`);
  const testEvidenceValue = evidence(path.join(root, "test-evidence-reports/current.md"));
  assert.deepEqual(
    new Set(testEvidenceValue.scenario_coverage_map.map((item) => item.coverage_scenario_id)),
    new Set(universe.coverage_scenarios.map((item) => item.coverage_scenario_id)),
  );
  assert.ok(testEvidenceValue.scenario_coverage_map.every((item) => item.coverage_state === "COVERED"));
  const testEvidenceCheck = run("scripts/check-test-evidence.mjs", [
    root,
    "--report", "test-evidence-reports/current.md",
    "--require-structured-evidence",
    "--require-verification-plan-ref",
    "--strict-source-binding",
  ]);
  assert.equal(testEvidenceCheck.status, 0, `${testEvidenceCheck.stdout}\n${testEvidenceCheck.stderr}`);

  const assurance = run("scripts/resolve-execution-assurance.mjs", [
    root,
    "--intent", intent,
    "--task", governance.task_ref,
    "--out", "execution-assurance-reports/current.md",
  ]);
  assert.equal(assurance.status, 0, `${assurance.stdout}\n${assurance.stderr}`);
  const assuranceValue = evidence(path.join(root, "execution-assurance-reports/current.md"));
  assert.deepEqual(
    new Set(assuranceValue.scenario_assurance_map.map((item) => item.coverage_scenario_id)),
    new Set(universe.coverage_scenarios.map((item) => item.coverage_scenario_id)),
  );
  assert.ok(assuranceValue.scenario_assurance_map.every((item) => item.assurance_state === "ASSURED"));
  const assuranceCheck = run("scripts/check-execution-assurance.mjs", [
    root,
    "--report", "execution-assurance-reports/current.md",
    "--require-structured-evidence",
  ]);
  assert.equal(assuranceCheck.status, 0, `${assuranceCheck.stdout}\n${assuranceCheck.stderr}`);

  const completion = run("scripts/resolve-completion-evidence.mjs", [
    root,
    "--intent", intent,
    "--task", governance.task_ref,
    "--business-rule-ref", "artifact:business-rule-closures/current.md",
    "--verification-plan-ref", "artifact:verification-plans/current.md",
    "--test-evidence-ref", "artifact:test-evidence-reports/current.md",
    "--execution-assurance-ref", "artifact:execution-assurance-reports/current.md",
    "--out", "completion-evidence-reports/current.md",
  ]);
  assert.equal(completion.status, 0, `${completion.stdout}\n${completion.stderr}`);
  const completionValue = evidence(path.join(root, "completion-evidence-reports/current.md"));
  assert.deepEqual(
    new Set(completionValue.scenario_completion_map.map((item) => item.coverage_scenario_id)),
    new Set(universe.coverage_scenarios.map((item) => item.coverage_scenario_id)),
  );
  assert.ok(completionValue.scenario_completion_map.every((item) => item.completion_state === "COMPLETE"));
  assert.notEqual(completionValue.completion_state, "COMPLETION_EVIDENCE_READY", "missing Runtime Trust or execution completion must still block the final claim");
  const completionCheck = run("scripts/check-completion-evidence.mjs", [
    root,
    "--report", "completion-evidence-reports/current.md",
    "--require-structured-evidence",
    "--require-source-refs",
  ]);
  assert.equal(completionCheck.status, 0, `${completionCheck.stdout}\n${completionCheck.stderr}`);

  assuranceValue.assurance_state = "VERIFIED_DONE";
  assuranceValue.can_claim_done = "Yes";
  assuranceValue.outcome = "VERIFIED_DONE";
  assuranceValue.patch_assessment.state = "PATCH_SMELL";
  assuranceValue.patch_assessment.reason = "Adversarial fixture keeps a blocking patch smell while self-reporting completion.";
  rewriteEmbeddedEvidence(path.join(root, "execution-assurance-reports/current.md"), assuranceValue);
  const adversarialCompletion = run("scripts/resolve-completion-evidence.mjs", [
    root,
    "--intent", intent,
    "--task", governance.task_ref,
    "--business-rule-ref", "artifact:business-rule-closures/current.md",
    "--verification-plan-ref", "artifact:verification-plans/current.md",
    "--test-evidence-ref", "artifact:test-evidence-reports/current.md",
    "--execution-assurance-ref", "artifact:execution-assurance-reports/current.md",
    "--out", "completion-evidence-reports/adversarial.md",
  ]);
  assert.equal(adversarialCompletion.status, 0, `${adversarialCompletion.stdout}\n${adversarialCompletion.stderr}`);
  const adversarialValue = evidence(path.join(root, "completion-evidence-reports/adversarial.md"));
  assert.notEqual(adversarialValue.completion_state, "COMPLETION_EVIDENCE_READY");
  const assuranceGate = adversarialValue.gate_checks.find((item) => item.id === "check:execution_assurance");
  assert.equal(assuranceGate.status, "FAIL");
  assert.match(assuranceGate.reason, /authoritative Execution Assurance checker failed/i);
});

test("1.108 rejects a scenario removed from a downstream completion consumer", () => {
  const root = project();
  const { governance, universe } = prepareReadyUniverse(root);
  let { verification } = generateVerificationChain(root);
  installExactObligationTest(root, verification);
  refreshUniverseAuthority(root, universe);
  ({ verification } = generateVerificationChain(root));
  const evidenceRefs = writeObligationEvidence(root, verification);
  run("scripts/resolve-test-evidence.mjs", [
    root, "--intent", intent,
    "--verification-plan-ref", "artifact:verification-plans/current.md",
    "--evidence", evidenceRefs.join(","),
    "--out", "test-evidence-reports/current.md",
  ]);
  run("scripts/resolve-execution-assurance.mjs", [
    root, "--intent", intent, "--task", governance.task_ref,
    "--out", "execution-assurance-reports/current.md",
  ]);
  const file = path.join(root, "execution-assurance-reports/current.md");
  const value = evidence(file);
  value.scenario_assurance_map.pop();
  rewriteEmbeddedEvidence(file, value);
  const checked = run("scripts/check-execution-assurance.mjs", [
    root,
    "--report", "execution-assurance-reports/current.md",
    "--require-structured-evidence",
  ]);
  assert.notEqual(checked.status, 0);
  assert.match(`${checked.stdout}\n${checked.stderr}`, /scenario|Business Universe/i);
});

function renderUniverse(value) {
  return `# Business Universe Coverage Report

This is an internal evidence source. It does not authorize implementation, completion, release, or production.

## Human Summary

Codex evidence-bound the task-relevant classes, lifecycle stages, paths, and verification scenarios.

## Task Entry Binding

The exact current Work Queue item and Task Governance report are bound in structured evidence.

## Preliminary Routing

Task Governance routed this task using project evidence.

## Structural Relationships

${value.trigger.structural_relationships.map((item) => `- \`${item.relationship_id}\`: ${item.summary}`).join("\n")}

## Discovery Boundary

The bounded discovery projection is recorded in structured evidence.

## Categories, Participants, Origins, And Paths

Every task-relevant row is evidence-bound to a project-local locator.

## Lifecycle And Provenance

Every applicable or non-applicable lifecycle stage and path provenance is explicit.

## Selection And Consistency

Selection points and consistency groups are recorded when required by structural routing.

## Coverage Scenarios

${value.coverage_scenarios.map((item) => `- \`${item.coverage_scenario_id}\` / \`${item.lifecycle_stage}\` / \`${item.path_provenance}\``).join("\n")}

## Fact Dependencies

None recorded.

## Unresolved Items

None.

## Challenger Review

- Required: \`${value.challenger_review.required}\`
- Status: \`${value.challenger_review.status}\`

## Boundaries

- Writes target files: \`No\`
- Authorizes implementation: \`No\`
- Approves completion: \`No\`
- Approves release or production: \`No\`

## Machine-Readable Evidence

\`\`\`json
${JSON.stringify(value, null, 2)}
\`\`\`

## Outcome

\`${value.outcome}\`
`;
}
