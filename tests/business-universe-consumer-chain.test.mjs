import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const kitRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const coverageSuite = path.join(kitRoot, "tests", "business-universe-coverage.test.mjs");

function run(script, args, options = {}) {
  return spawnSync(process.execPath, [path.join(kitRoot, script), ...args], {
    cwd: options.cwd || kitRoot,
    encoding: "utf8",
    timeout: 120_000,
    maxBuffer: 64 * 1024 * 1024,
    env: { ...process.env, ...(options.env || {}) },
  });
}

function runCoverageTest(pattern, env = {}) {
  const childEnv = { ...process.env, ...env };
  delete childEnv.NODE_TEST_CONTEXT;
  return spawnSync(process.execPath, [
    "--test",
    `--test-name-pattern=${pattern}`,
    coverageSuite,
  ], {
    cwd: kitRoot,
    encoding: "utf8",
    timeout: 120_000,
    maxBuffer: 64 * 1024 * 1024,
    env: childEnv,
  });
}

function classify(intent, projectFiles = {}, extraArgs = []) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-universe-tier-"));
  for (const [relativePath, content] of Object.entries(projectFiles)) {
    const file = path.join(root, relativePath);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content);
  }
  const result = run("scripts/resolve-task-governance.mjs", [root, "--intent", intent, "--json", ...extraArgs]);
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  return JSON.parse(result.stdout).structuredEvidence;
}

test("1.108 LOW remains LIGHTWEIGHT and does not synthesize Business Universe evidence", () => {
  const evidence = classify("Fix one typo in README documentation", { "README.md": "# Sample\n" });
  assert.equal(evidence.impact_classification.task_impact, "LOW");
  assert.equal(evidence.review_policy.review_level, "LIGHTWEIGHT");
  assert.equal(evidence.business_universe_routing.required, "No");
  assert.equal(evidence.business_universe_routing.routing_result, "NOT_REQUIRED_WITH_REASON");
  assert.equal(evidence.required_before_completion_claim.test_evidence_required, "No");
});

test("1.108 evidence-backed omission risk upgrades a provisional LOW task monotonically to MEDIUM", () => {
  const evidence = classify("Update label: interactive and imported entries use the same runtime path", {
    "src/labels.ts": "// Interactive and imported entries use the same runtime path.\nexport const sharedLabel = 'Current label';\n",
  }, ["--task-kind", "copy"]);
  assert.equal(evidence.impact_classification.task_impact, "MEDIUM");
  assert.equal(evidence.business_universe_routing.required, "Yes");
  assert.equal(evidence.business_universe_routing.routing_result, "REQUIRED_WITH_EVIDENCE");
  assert.deepEqual(evidence.impact_classification.upgrade_history, [
    "LOW->MEDIUM: business-universe structural evidence",
  ]);
  assert.equal(evidence.review_policy.review_level, "TARGETED");
});

test("1.113 public finish fails closed when a legacy Work Queue row lacks canonical task identity", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-universe-finish-"));
  fs.mkdirSync(path.join(root, "src"), { recursive: true });
  fs.mkdirSync(path.join(root, "work-queue"), { recursive: true });
  const currentIntent = "Update label: alpha, beta use same validation";
  fs.writeFileSync(path.join(root, "src/labels.ts"), "export function validateAlphaBeta() { return true; }\n");
  fs.writeFileSync(path.join(root, "work-queue/current.md"), [
    "# Work Queue",
    "",
    "| Task ID | Title | State | Evidence | Resume Review | Notes |",
    "|---|---|---|---|---|---|",
    `| TASK-1 | ${currentIntent} | CURRENT | current task | N/A | current |`,
    "",
  ].join("\n"));
  const result = run("scripts/resolve-operating-loop.mjs", [root, "--intent", "这个任务完成了吗", "--json"]);
  assert.notEqual(result.status, 0, "A public finish request must return a failing process status when the current task identity is invalid");
  const report = JSON.parse(result.stdout);
  assert.equal(report.operatingLoop.operation, "FINISH_TASK");
  assert.equal(
    report.sourceSystemTrace.find((item) => item.sourceSystem === "CURRENT_TASK_IDENTITY")?.outcome,
    "INVALID",
  );
  assert.equal(
    report.sourceSystemTrace.find((item) => item.sourceSystem === "TASK_GOVERNANCE_CHECK")?.readStatus,
    "FAILED",
  );
  assert.notEqual(report.operatingDecision.actionCode, "TASK_DONE");
});

test("1.108 MEDIUM preserves every scenario through the targeted structured consumer chain", () => {
  const result = runCoverageTest("preserves every scenario through Plan Review", {
    INTENTOS_BUSINESS_UNIVERSE_TEST_INTENT: "Interactive forms and local imports use the same validation; when processing fails it retries, and when cancelled it compensates before updating derived status.",
    INTENTOS_BUSINESS_UNIVERSE_EXPECTED_TIER: "MEDIUM",
  });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
});

test("1.108 POSSIBLE_HIGH remains read-only until Codex resolves technical impact", () => {
  const evidence = classify("Change the rule for the current behavior", {
    "src/behavior.ts": "export function currentBehavior() { return 'current'; }\n",
  });
  assert.equal(evidence.impact_classification.task_impact, "POSSIBLE_HIGH");
  assert.equal(evidence.review_policy.review_level, "BLOCKING_CLARIFICATION");
  assert.equal(evidence.readiness.ready_for_implementation_review, "No");
  assert.equal(evidence.readiness.implementation_authorized_by_this_report, "No");
  assert.equal(evidence.user_prompt.technical_terms_required, "No");
});

test("1.108 HIGH preserves every scenario through the full structured consumer chain", () => {
  const result = runCoverageTest("preserves every scenario through Plan Review", {
    INTENTOS_BUSINESS_UNIVERSE_TEST_INTENT: "Interactive forms and scheduled jobs use the same validation; when processing fails it retries, and when cancelled it compensates before updating derived status.",
    INTENTOS_BUSINESS_UNIVERSE_EXPECTED_TIER: "HIGH",
  });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
});

test("1.108 strict chain fails closed when task entry or a downstream scenario is removed", () => {
  for (const pattern of [
    "candidate output fails closed without exact Work Queue",
    "rejects a scenario removed from a downstream completion consumer",
  ]) {
    const result = runCoverageTest(pattern);
    assert.equal(result.status, 0, `${pattern}\n${result.stdout}\n${result.stderr}`);
  }
});

test("1.108 checker keeps trusted historical Verification Plan evidence readable", () => {
  const root = path.join(kitRoot, "examples", "1.76-verification-plan", "appointment-service-time");
  const result = run("scripts/check-verification-plan.mjs", [root, "--require-structured-evidence"]);
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.match(result.stdout, /Verification Plan check passed\./);
});

test("1.108 checker keeps trusted historical Execution Assurance evidence readable", () => {
  const root = path.join(kitRoot, "examples", "1.72-execution-assurance-chain", "feature-contract-validation");
  const result = run("scripts/check-execution-assurance.mjs", [
    root,
    "--require-structured-evidence",
    "--require-evidence-refs",
    "--require-review",
    "--require-actual-diff",
  ]);
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.match(result.stdout, /Execution assurance check passed\./);
});

test("1.113 historical Change Impact remains readable but cannot satisfy strict task lineage", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-historical-impact-lineage-"));
  for (const relativePath of [
    "business-rule-closures/109-project-entry-adoption-trust.md",
    "change-impact-coverage-reports/109-project-entry-adoption-trust.md",
  ]) {
    const target = path.join(root, relativePath);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(kitRoot, relativePath), target);
  }

  const compatibility = run("scripts/check-change-impact-coverage.mjs", [
    root,
    "--report",
    "change-impact-coverage-reports/109-project-entry-adoption-trust.md",
    "--require-structured-evidence",
  ]);
  assert.equal(compatibility.status, 0, `${compatibility.stdout}\n${compatibility.stderr}`);
  assert.match(compatibility.stdout, /historical Business Rule task binding remains readable/);

  const strict = run("scripts/check-change-impact-coverage.mjs", [
    root,
    "--report",
    "change-impact-coverage-reports/109-project-entry-adoption-trust.md",
    "--require-structured-evidence",
    "--require-task-lineage",
  ]);
  assert.notEqual(strict.status, 0, `${strict.stdout}\n${strict.stderr}`);
  assert.match(`${strict.stdout}\n${strict.stderr}`, /must exactly match Business Rule Closure/);
});
