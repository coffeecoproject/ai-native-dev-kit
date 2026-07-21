import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { evidenceDigest, extractMachineReadableEvidence } from "../scripts/lib/artifact-schema.mjs";

const kitRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const obligationCount = 119;
const intent = "prove every required verification obligation with current command output";
const taskRef = "task:test-evidence-obligation-proof";
const planRef = "verification-plans/current.md";
const evidenceRef = "evidence/current-test-run.log";
const reportRef = "test-evidence-reports/current.md";

function sha256(value) {
  return `sha256:${crypto.createHash("sha256").update(value).digest("hex")}`;
}

function project(options = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-test-evidence-proof-"));
  const targets = Array.from({ length: 9 }, (_, index) => `tests/focused-${index + 1}.test.mjs`);
  const obligationItems = obligations(options.obligationCount || obligationCount);
  fs.mkdirSync(path.join(root, "src"), { recursive: true });
  fs.writeFileSync(path.join(root, "src/fixture-behavior.mjs"), [
    "export function evaluate(value) {",
    "  if (!Number.isInteger(value) || value <= 0) throw new TypeError('value must be a positive integer');",
    "  return { accepted: true, doubled: value * 2 };",
    "}",
    "",
  ].join("\n"));
  for (const target of [...targets, "tests/not-selected.test.mjs"]) {
    const file = path.join(root, target);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, "// populated before the observed command runs\n");
  }
  writeVerificationPlan(root, obligationItems, options);
  return { root, targets, obligationItems };
}

function obligations(count = obligationCount) {
  return Array.from({ length: count }, (_, index) => ({
    id: `verify:fixture-${String(index + 1).padStart(3, "0")}`,
    source_surface: "TEST_COVERAGE",
    verification_type: "UNIT_BEHAVIOR_TEST",
    required: "Yes",
    priority: "BLOCKING",
    behavior_under_test: `Required fixture behavior ${index + 1}`,
    expected_evidence: "A selected current test target emits a passed entry for this exact obligation.",
    test_correctness_risk: "A declaration without an observed test entry is not proof.",
    suggested_command: "",
    broad_command_only: "No",
    source_refs: ["task:current-verification-scope"],
    owner: "codex",
    decision_ref: "",
    not_applicable_reason: "",
  }));
}

function writeVerificationPlan(root, obligationItems, options = {}) {
  const structuredBase = {
    schema_version: "1.76.0",
    artifact_type: "verification_plan",
    task_ref: taskRef,
    intent,
    intent_digest: sha256(intent),
    verification_plan_ref: `artifact:${planRef}`,
    verification_plan_digest: "",
    business_rule_ref: "not provided",
    business_rule_digest: "not provided",
    business_rule_state: "not provided",
    impact_ref: "not provided",
    impact_digest: "not provided",
    source_systems: [],
    project_level: options.projectLevel || "BL2",
    platform_profiles: ["node"],
    change_kind: "REFACTOR",
    risk_domains: options.riskDomains || ["high-risk-domain"],
    verification_state: "VERIFICATION_PLAN_READY",
    affected_surfaces: options.affectedSurfaces || [{
      surface: "TEST_COVERAGE",
      status: "REQUIRED",
      reason: "The fixture exercises strict high-trust Test Evidence coverage.",
      expected_evidence: "Observed command output for every required obligation.",
    }],
    verification_obligations: obligationItems,
    test_correctness_controls: options.testCorrectnessControls || [{
      id: "control:broad-command-not-proof",
      applies_to: "TEST_COVERAGE",
      required: "Yes",
      reason: "A command must map observed test entries to exact obligations.",
    }],
    manual_verification: [],
    not_applicable_obligations: [],
    boundaries: {
      writes_target_files: "No",
      executes_tests: "No",
      authorizes_implementation: "No",
      approves_release_or_production: "No",
      proves_product_correctness: "No",
      proves_real_environment_behavior: "No",
    },
    next_step: "Bind current observed command evidence.",
  };
  const evidence = {
    ...structuredBase,
    verification_plan_digest: evidenceDigest(structuredBase, ["verification_plan_digest"]),
  };
  const file = path.join(root, planRef);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `# Verification Plan\n\n## Machine-Readable Evidence\n\n\`\`\`json\n${JSON.stringify(evidence, null, 2)}\n\`\`\`\n`);
}

function writeCommandEvidence(root, targets, obligationItems, { observedMode }) {
  const ids = obligationItems.map((item) => item.id);
  const command = `node --test --test-concurrency=1 ${targets.join(" ")}`;
  writeTestTargets(root, targets, obligationItems, observedMode);
  const childEnv = { ...process.env };
  delete childEnv.NODE_TEST_CONTEXT;
  const testRun = spawnSync(process.execPath, ["--test", "--test-concurrency=1", ...targets], {
    cwd: root,
    encoding: "utf8",
    env: childEnv,
    maxBuffer: 32 * 1024 * 1024,
  });
  assert.equal(testRun.status, 0, testRun.stderr || testRun.stdout);
  const unselectedRun = observedMode === "unselected"
    ? spawnSync(process.execPath, ["--test", "tests/not-selected.test.mjs"], {
      cwd: root,
      encoding: "utf8",
      env: childEnv,
      maxBuffer: 32 * 1024 * 1024,
    })
    : null;
  if (unselectedRun) assert.equal(unselectedRun.status, 0, unselectedRun.stderr || unselectedRun.stdout);
  const file = path.join(root, evidenceRef);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, [
    "id: evidence:focused-nine-target-run",
    "evidence_type: COMMAND_OUTPUT",
    "result_state: PASSED",
    `command: ${command}`,
    "owner: codex",
    "environment: isolated-local-node",
    "ran_at: 2026-07-18T00:00:00.000Z",
    "exit_code: 0",
    "ran_after_change: Yes",
    "current_task_match: Yes",
    `covers_obligations: ${ids.join(",")}`,
    "failure_reason: N/A",
    "limitations: Bounded to selected local test targets and their observed output.",
    "",
    testRun.stdout.trim(),
    testRun.stderr.trim(),
    unselectedRun?.stdout.trim() || "",
    unselectedRun?.stderr.trim() || "",
    "",
  ].join("\n"));
  return { command, output: `${testRun.stdout}\n${testRun.stderr}` };
}

function writeDelegatedCommandEvidence(root, obligationItems, { reportThroughWrapper }) {
  const wrapper = "tests/proof-runner.test.mjs";
  const child = "tests/focused-1.test.mjs";
  writeTestTargets(root, [child], obligationItems, "selected");
  const reportedTarget = reportThroughWrapper ? wrapper : child;
  const wrapperSource = [
    'import assert from "node:assert/strict";',
    'import { spawnSync } from "node:child_process";',
    'import test from "node:test";',
    "",
    ...obligationItems.flatMap((item, index) => [
      `test(${JSON.stringify(`[${item.id}] ${reportedTarget} :: ${child} :: delegated behavior ${index + 1}`)}, () => {`,
      `  const result = spawnSync(process.execPath, ["--test", ${JSON.stringify(child)}], { encoding: "utf8" });`,
      "  assert.equal(result.status, 0, result.stderr || result.stdout);",
      "});",
    ]),
    "",
  ].join("\n");
  fs.writeFileSync(path.join(root, wrapper), wrapperSource);

  const childEnv = { ...process.env };
  delete childEnv.NODE_TEST_CONTEXT;
  const testRun = spawnSync(process.execPath, ["--test", "--test-concurrency=1", wrapper], {
    cwd: root,
    encoding: "utf8",
    env: childEnv,
    maxBuffer: 32 * 1024 * 1024,
  });
  assert.equal(testRun.status, 0, testRun.stderr || testRun.stdout);

  const ids = obligationItems.map((item) => item.id);
  const file = path.join(root, evidenceRef);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, [
    "id: evidence:delegated-proof-run",
    "evidence_type: COMMAND_OUTPUT",
    "result_state: PASSED",
    `command: node --test --test-concurrency=1 ${wrapper}`,
    "owner: codex",
    "environment: isolated-local-node",
    "ran_at: 2026-07-19T00:00:00.000Z",
    "exit_code: 0",
    "ran_after_change: Yes",
    "current_task_match: Yes",
    `covers_obligations: ${ids.join(",")}`,
    "failure_reason: N/A",
    "limitations: The selected wrapper runs bounded child tests and emits wrapper-bound obligation entries.",
    "",
    testRun.stdout.trim(),
    testRun.stderr.trim(),
    "",
  ].join("\n"));
}

function writeTestTargets(root, targets, obligationItems, observedMode) {
  for (const [targetIndex, target] of targets.entries()) {
    const assigned = observedMode === "selected"
      ? obligationItems.filter((_, index) => index % targets.length === targetIndex)
      : [];
    const names = assigned.length > 0
      ? assigned.map((item, index) => `[${item.id}] ${target} :: verifies fixture behavior ${index + 1}`)
      : [`focused local test ${targetIndex + 1}`];
    fs.writeFileSync(path.join(root, target), [
      'import assert from "node:assert/strict";',
      'import test from "node:test";',
      'import { evaluate } from "../src/fixture-behavior.mjs";',
      "",
      ...names.flatMap((name, index) => [
        `test(${JSON.stringify(name)}, () => {`,
        `  assert.deepEqual(evaluate(${index + 1}), { accepted: true, doubled: ${(index + 1) * 2} });`,
        "  assert.throws(() => evaluate(0), /positive integer/);",
        "});",
      ]),
      "",
    ].join("\n"));
  }

  const unselected = "tests/not-selected.test.mjs";
  const unselectedNames = observedMode === "unselected"
    ? obligationItems.map((item, index) => `[${item.id}] ${unselected} :: unselected fixture behavior ${index + 1}`)
    : ["unselected local test"];
  fs.writeFileSync(path.join(root, unselected), [
    'import assert from "node:assert/strict";',
    'import test from "node:test";',
    'import { evaluate } from "../src/fixture-behavior.mjs";',
    "",
    ...unselectedNames.flatMap((name, index) => [
      `test(${JSON.stringify(name)}, () => {`,
      `  assert.equal(evaluate(${index + 1}).doubled, ${(index + 1) * 2});`,
      "  assert.throws(() => evaluate(-1), /positive integer/);",
      "});",
    ]),
    "",
  ].join("\n"));
}

function resolveEvidence(root) {
  return spawnSync(process.execPath, [
    path.join(kitRoot, "scripts/resolve-test-evidence.mjs"),
    root,
    "--intent", intent,
    "--verification-plan-ref", `artifact:${planRef}`,
    "--evidence", `artifact:${evidenceRef}`,
    "--out", reportRef,
  ], { cwd: root, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
}

function resolveEvidenceWithoutPlan(root) {
  return spawnSync(process.execPath, [
    path.join(kitRoot, "scripts/resolve-test-evidence.mjs"),
    root,
    "--intent", intent,
    "--out", reportRef,
  ], { cwd: root, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
}

function checkBlockedEvidence(root) {
  return spawnSync(process.execPath, [
    path.join(kitRoot, "scripts/check-test-evidence.mjs"),
    root,
    "--report", reportRef,
    "--require-structured-evidence",
  ], { cwd: root, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
}

function checkEvidence(root) {
  return spawnSync(process.execPath, [
    path.join(kitRoot, "scripts/check-test-evidence.mjs"),
    root,
    "--report", reportRef,
    "--require-report",
    "--require-structured-evidence",
    "--require-verification-plan-ref",
    "--strict-source-binding",
    "--require-current-evidence",
    "--require-test-quality-controls",
    "--require-evidence-authority",
  ], { cwd: root, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
}

function reportEvidence(root) {
  const extracted = extractMachineReadableEvidence(fs.readFileSync(path.join(root, reportRef), "utf8"));
  assert.equal(extracted?.ok, true, extracted?.errors?.join("; "));
  return extracted.value;
}

test("a missing Verification Plan produces valid blocked evidence that strict consumers reject", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-test-evidence-no-plan-"));
  try {
    const resolved = resolveEvidenceWithoutPlan(root);
    assert.equal(resolved.status, 0, resolved.stderr || resolved.stdout);
    const evidence = reportEvidence(root);
    assert.equal(evidence.verification_plan_ref, "not provided");
    assert.equal(evidence.verification_plan_digest, "not provided");
    assert.equal(evidence.test_evidence_state, "TEST_EVIDENCE_BLOCKED");

    const blockedCheck = checkBlockedEvidence(root);
    assert.equal(blockedCheck.status, 0, blockedCheck.stderr || blockedCheck.stdout);

    const strictCheck = checkEvidence(root);
    assert.notEqual(strictCheck.status, 0, `${strictCheck.stdout}\n${strictCheck.stderr}`);
    assert.match(`${strictCheck.stdout}\n${strictCheck.stderr}`, /verification_plan_ref|verification_plan/i);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("strict Test Evidence rejects a nine-target local command declaring all 119 obligations", () => {
  const { root, targets, obligationItems } = project();
  try {
    const run = writeCommandEvidence(root, targets, obligationItems, { observedMode: "unselected" });
    assert.equal(run.command.split(/\s+/).filter((token) => token.endsWith(".test.mjs")).length, 9);
    assert.match(run.output, /tests 9\b/);

    const resolved = resolveEvidence(root);
    assert.equal(resolved.status, 0, resolved.stderr || resolved.stdout);
    const evidence = reportEvidence(root);
    assert.equal(evidence.coverage_map.length, obligationCount);
    assert.equal(evidence.coverage_map.every((row) => row.coverage_state === "PARTIAL"), true);
    assert.equal(evidence.evidence_items.filter((item) => item.evidence_type === "LOG_EXCERPT").length, 0);

    const checked = checkEvidence(root);
    assert.notEqual(checked.status, 0, checked.stderr || checked.stdout);
    assert.match(`${checked.stdout}\n${checked.stderr}`, /lacks observed command\/log proof for verify:fixture-001/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("a required quality control is not applicable when its surface has no current obligation", () => {
  const controls = [
    {
      id: "control:negative-path-required",
      applies_to: "API_CONTRACT",
      required: "Yes",
      reason: "API work requires negative-path proof when API obligations exist.",
    },
    {
      id: "control:broad-command-not-proof",
      applies_to: "TEST_COVERAGE",
      required: "Yes",
      reason: "A command must map observed test entries to exact obligations.",
    },
  ];
  const { root, targets, obligationItems } = project({
    obligationCount: 1,
    projectLevel: "BL1",
    riskDomains: [],
    testCorrectnessControls: controls,
  });
  try {
    writeCommandEvidence(root, targets, obligationItems, { observedMode: "selected" });
    const resolved = resolveEvidence(root);
    assert.equal(resolved.status, 0, resolved.stderr || resolved.stdout);
    const evidence = reportEvidence(root);
    const apiControl = evidence.test_quality_controls.find((item) => item.id === "control:negative-path-required");
    assert.equal(apiControl.status, "NOT_APPLICABLE_WITH_REASON");
    assert.match(apiControl.reason, /No Verification Plan obligation uses this control surface/);

    const checked = checkEvidence(root);
    assert.equal(checked.status, 0, `${checked.stdout}\n${checked.stderr}`);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("strict high-trust Test Evidence rejects even complete hand-written command output without Runtime Trust", () => {
  const { root, targets, obligationItems } = project();
  try {
    const run = writeCommandEvidence(root, targets, obligationItems, { observedMode: "selected" });
    assert.match(run.output, /tests 119\b/);
    const resolved = resolveEvidence(root);
    assert.equal(resolved.status, 0, resolved.stderr || resolved.stdout);
    const evidence = reportEvidence(root);
    const proofItems = evidence.evidence_items.filter((item) => item.evidence_type === "LOG_EXCERPT");
    assert.equal(evidence.test_evidence_state, "TEST_EVIDENCE_BLOCKED");
    assert.equal(evidence.runtime_trust_binding.status, "BLOCKED");
    assert.equal(proofItems.length, obligationCount);
    assert.equal(evidence.coverage_map.every((row) => row.coverage_state === "COVERED"), true);

    const checked = checkEvidence(root);
    assert.notEqual(checked.status, 0, `${checked.stdout}\n${checked.stderr}`);
    assert.match(`${checked.stdout}\n${checked.stderr}`, /runtime_trust_binding|Runtime Trust|Verification Run Manifest/i);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("a selected proof runner may bind delegated child results only through its recorded wrapper target", () => {
  const { root, obligationItems } = project({
    obligationCount: 2,
    projectLevel: "BL1",
    riskDomains: [],
  });
  try {
    writeDelegatedCommandEvidence(root, obligationItems, { reportThroughWrapper: true });
    let resolved = resolveEvidence(root);
    assert.equal(resolved.status, 0, resolved.stderr || resolved.stdout);
    let evidence = reportEvidence(root);
    assert.equal(evidence.test_evidence_state, "TEST_EVIDENCE_COMPLETE");
    assert.equal(evidence.evidence_items.filter((item) => item.evidence_type === "LOG_EXCERPT").length, 2);
    assert.equal(evidence.coverage_map.every((row) => row.coverage_state === "COVERED"), true);

    writeDelegatedCommandEvidence(root, obligationItems, { reportThroughWrapper: false });
    resolved = resolveEvidence(root);
    assert.equal(resolved.status, 0, resolved.stderr || resolved.stdout);
    evidence = reportEvidence(root);
    assert.equal(evidence.test_evidence_state, "TEST_EVIDENCE_PARTIAL");
    assert.equal(evidence.evidence_items.filter((item) => item.evidence_type === "LOG_EXCERPT").length, 0);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("Verification Plan RUNTIME_BEHAVIOR cannot be downgraded by omitting the runtime manifest option", () => {
  const { root, targets, obligationItems } = project({
    obligationCount: 1,
    projectLevel: "BL0",
    riskDomains: [],
    affectedSurfaces: [{
      surface: "RUNTIME_BEHAVIOR",
      status: "REQUIRED",
      reason: "The current service path must execute the changed code.",
      expected_evidence: "A current project-bound Verification Run Manifest.",
    }],
  });
  try {
    writeCommandEvidence(root, targets, obligationItems, { observedMode: "selected" });
    const resolved = resolveEvidence(root);
    assert.equal(resolved.status, 0, resolved.stderr || resolved.stdout);
    const evidence = reportEvidence(root);
    assert.equal(evidence.runtime_trust_binding.requirement, "REQUIRED");
    assert.equal(evidence.runtime_trust_binding.status, "BLOCKED");
    assert.equal(evidence.test_evidence_state, "TEST_EVIDENCE_BLOCKED");

    const checked = checkEvidence(root);
    assert.notEqual(checked.status, 0, checked.stderr || checked.stdout);
    assert.match(`${checked.stdout}\n${checked.stderr}`, /Runtime Trust|runtime_trust_binding|Verification Run Manifest/i);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("strict checker rejects BL1 declaration-only evidence without observed behavior", () => {
  const { root, targets, obligationItems } = project({
    obligationCount: 2,
    projectLevel: "BL1",
    riskDomains: [],
  });
  try {
    writeCommandEvidence(root, targets.slice(0, 1), obligationItems, { observedMode: "none" });
    const resolved = resolveEvidence(root);
    assert.equal(resolved.status, 0, resolved.stderr || resolved.stdout);
    const evidence = reportEvidence(root);
    assert.equal(evidence.test_evidence_state, "TEST_EVIDENCE_PARTIAL");
    assert.equal(evidence.evidence_items.filter((item) => item.evidence_type === "LOG_EXCERPT").length, 0);

    const checked = checkEvidence(root);
    assert.notEqual(checked.status, 0, `${checked.stdout}\n${checked.stderr}`);
    assert.match(`${checked.stdout}\n${checked.stderr}`, /observed command\/log proof|TEST_EVIDENCE_COMPLETE|coverage/i);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("a blocked Verification Plan can never produce complete Test Evidence", () => {
  const { root, targets, obligationItems } = project({
    obligationCount: 2,
    projectLevel: "BL1",
    riskDomains: [],
  });
  try {
    writeCommandEvidence(root, targets.slice(0, 1), obligationItems, { observedMode: "selected" });
    const planFile = path.join(root, planRef);
    const original = fs.readFileSync(planFile, "utf8");
    const match = original.match(/```json\s*([\s\S]*?)```/i);
    assert.ok(match);
    const blocked = JSON.parse(match[1]);
    blocked.verification_state = "BLOCKED_BY_UNCLEAR_TEST_SCOPE";
    blocked.verification_plan_digest = evidenceDigest(blocked, ["verification_plan_digest"]);
    fs.writeFileSync(planFile, original.replace(match[1], `${JSON.stringify(blocked, null, 2)}\n`));

    const resolved = resolveEvidence(root);
    assert.equal(resolved.status, 0, resolved.stderr || resolved.stdout);
    const evidence = reportEvidence(root);
    assert.equal(evidence.verification_plan_state, "BLOCKED_BY_UNCLEAR_TEST_SCOPE");
    assert.equal(evidence.test_evidence_state, "TEST_EVIDENCE_BLOCKED");
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
