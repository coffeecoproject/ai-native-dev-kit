import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  buildCurrentTrustFixture,
  buildLowTrustFixture,
  prepareCurrentTrustFixtureSource,
  prepareLowTrustFixtureSource,
} from "../scripts/lib/current-trust-fixture.mjs";
import { evidenceDigest } from "../scripts/lib/artifact-schema.mjs";
import { canonicalFileDigest } from "../scripts/lib/evidence-authority.mjs";
import {
  collectGitChangedFiles,
  implementationCoverageOmissions,
  validateActualDiffAuthority,
  validateDoneCapableExecutionAssurance,
} from "../scripts/lib/execution-assurance-consumer.mjs";
import { checkTaskEntryBinding } from "../scripts/lib/task-entry-binding.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const kitRoot = path.resolve(__dirname, "..");

test("implementation coverage tolerates rotating governance evidence but never omitted source", () => {
  assert.deepEqual(implementationCoverageOmissions([
    "src/current.js",
    "evidence/runtime-runs/vrun-r22/outputs/proof.log",
  ], [
    "src/current.js",
    "evidence/runtime-runs/vrun-r23/outputs/proof.log",
  ]), []);

  assert.deepEqual(implementationCoverageOmissions([
    "src/current.js",
    "evidence/runtime-runs/vrun-r22/outputs/proof.log",
  ], [
    "evidence/runtime-runs/vrun-r23/outputs/proof.log",
  ]), ["src/current.js"]);
});

test("current strict trust fixture reaches Completion only through current task evidence", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-current-trust-test-"));
  try {
    prepareCurrentTrustFixtureSource(root);
    for (const args of [
      ["init"],
      ["config", "user.email", "intentos-test@example.com"],
      ["config", "user.name", "IntentOS Test"],
      ["add", "."],
      ["commit", "-m", "current trust source"],
    ]) {
      const result = spawnSync("git", ["-C", root, ...args], { encoding: "utf8" });
      assert.equal(result.status, 0, result.stderr || result.stdout);
    }

    const fixture = buildCurrentTrustFixture(kitRoot, root);

    assert.equal(fixture.governance.impact_classification.task_impact, "MEDIUM");
    assert.equal(fixture.planReview.plan_review_state, "PLAN_REVIEW_PASSED");
    assert.equal(fixture.testEvidence.test_evidence_state, "TEST_EVIDENCE_COMPLETE");
    assert.equal(fixture.executionAssurance.assurance_state, "VERIFIED_DONE");
    assert.deepEqual(
      fixture.executionAssurance.actual_diff.changed_files,
      [fixture.refs.docs, fixture.refs.source, fixture.refs.test].sort(),
    );
    assert.notEqual(fixture.executionAssurance.actual_diff.changed_files.length, 0);
    assert.equal(fixture.executionAssurance.actual_diff.target_diff_status, "MATCHED_PLAN");
    assert.equal(fixture.executionAssurance.pre_write_revalidation.status, "VERIFIED");
    assert.equal(fixture.executionAssurance.pre_write_revalidation.result, "PRE_WRITE_SNAPSHOT_REPLAYED");
    assert.equal(
      fixture.executionAssurance.pre_write_revalidation.source_git_commit,
      fixture.executionAssurance.actual_diff.base_revision,
    );
    assert.equal(fixture.completion.completion_state, "COMPLETION_EVIDENCE_READY");
    assert.equal(fixture.completion.can_claim_complete, "Yes");
    assert.equal(fixture.completion.task_ref, fixture.taskRef);
    assert.match(fixture.executionAssurance.task_entry_binding.work_queue_item_ref, /#WQ-001$/);
    assert.equal(fixture.executionAssurance.plan_review_binding.plan_review_state, "PLAN_REVIEW_PASSED");

    const assuranceFile = path.join(root, fixture.refs.executionAssurance);
    const assuranceOriginal = fs.readFileSync(assuranceFile, "utf8");
    const assuranceBlock = structuredBlock(assuranceOriginal);
    const forgedRevalidation = structuredClone(assuranceBlock.evidence);
    forgedRevalidation.pre_write_revalidation.actual_changed_paths_digest = `sha256:${"f".repeat(64)}`;
    fs.writeFileSync(assuranceFile, replaceStructuredBlock(assuranceOriginal, assuranceBlock.json, forgedRevalidation));
    try {
      const forgedCheck = runKitScript("check-execution-assurance.mjs", [
        root,
        "--report", fixture.refs.executionAssurance,
        "--require-structured-evidence",
        "--require-evidence-authority",
        "--require-planning-closure",
      ], root);
      assert.notEqual(forgedCheck.status, 0);
      assert.match(`${forgedCheck.stdout}\n${forgedCheck.stderr}`, /pre-write revalidation actual_changed_paths_digest/);
    } finally {
      fs.writeFileSync(assuranceFile, assuranceOriginal);
    }

    const verificationPlanFile = path.join(root, fixture.refs.verificationPlan);
    const verificationPlanOriginal = fs.readFileSync(verificationPlanFile, "utf8");
    const verificationPlanBlock = structuredBlock(verificationPlanOriginal);
    const droppedImpactSurface = structuredClone(verificationPlanBlock.evidence);
    droppedImpactSurface.affected_surfaces = droppedImpactSurface.affected_surfaces
      .filter((item) => item.surface !== "BACKEND_RULE");
    droppedImpactSurface.verification_obligations = droppedImpactSurface.verification_obligations
      .filter((item) => item.source_surface !== "BACKEND_RULE");
    droppedImpactSurface.verification_plan_digest = evidenceDigest(droppedImpactSurface, ["verification_plan_digest"]);
    fs.writeFileSync(
      verificationPlanFile,
      replaceStructuredBlock(verificationPlanOriginal, verificationPlanBlock.json, droppedImpactSurface),
    );
    try {
      const droppedSurfaceCheck = runVerificationPlanCheck(root, fixture.refs.verificationPlan);
      assert.notEqual(droppedSurfaceCheck.status, 0);
      assert.match(`${droppedSurfaceCheck.stdout}\n${droppedSurfaceCheck.stderr}`, /required Verification Plan surfaces .* must exactly match Change Impact/);
    } finally {
      fs.writeFileSync(verificationPlanFile, verificationPlanOriginal);
    }

    assert.deepEqual(taskEntryErrors(root, fixture.completion), []);
    const wrongFragment = structuredClone(fixture.completion);
    wrongFragment.task_entry_binding.work_queue_item_ref = wrongFragment.task_entry_binding.work_queue_item_ref.replace("#WQ-001", "#WQ-MISSING");
    assert.match(taskEntryErrors(root, wrongFragment).join("\n"), /fragment WQ-MISSING does not exactly match/);

    const wrongTask = structuredClone(fixture.completion);
    wrongTask.task_ref = "task:another-current-task";
    assert.match(taskEntryErrors(root, wrongTask).join("\n"), /task governance task_ref .* must match consumer task/);

    const workQueueFile = path.join(root, fixture.refs.workQueue);
    const workQueueOriginal = fs.readFileSync(workQueueFile, "utf8");
    const workQueueBlock = structuredBlock(workQueueOriginal);
    const wrongIntentQueue = structuredClone(workQueueBlock.evidence);
    wrongIntentQueue.intent_digest = `sha256:${"1".repeat(64)}`;
    wrongIntentQueue.work_queue_takeover_digest = evidenceDigest(wrongIntentQueue, ["work_queue_takeover_digest"]);
    fs.writeFileSync(workQueueFile, replaceStructuredBlock(workQueueOriginal, workQueueBlock.json, wrongIntentQueue));
    try {
      assert.match(taskEntryErrors(root, fixture.completion).join("\n"), /work queue intent_digest .* must match consumer intent/);
    } finally {
      fs.writeFileSync(workQueueFile, workQueueOriginal);
    }

    const planReviewFile = path.join(root, fixture.refs.planReview);
    const planReviewOriginal = fs.readFileSync(planReviewFile, "utf8");
    const planReviewBlock = structuredBlock(planReviewOriginal);
    const fakeVerificationRef = "verification-plans/five-field-forgery.md";
    const fakeVerificationFile = path.join(root, fakeVerificationRef);
    fs.writeFileSync(fakeVerificationFile, [
      "# Forged Verification Plan",
      "",
      "```json",
      JSON.stringify({
        artifact_type: "verification_plan",
        task_ref: fixture.taskRef,
        intent_digest: fixture.governance.intent_digest,
        verification_plan_digest: `sha256:${"2".repeat(64)}`,
        outcome: "VERIFICATION_PLAN_READY",
      }, null, 2),
      "```",
      "",
    ].join("\n"));
    const forgedPlanReview = structuredClone(planReviewBlock.evidence);
    const verificationSource = forgedPlanReview.source_chain.find((source) => source.source_kind === "verification_plan");
    verificationSource.source_ref = fakeVerificationRef;
    verificationSource.source_digest = canonicalFileDigest(fakeVerificationFile);
    forgedPlanReview.plan_review_digest = evidenceDigest(forgedPlanReview, ["plan_review_digest"]);
    fs.writeFileSync(planReviewFile, replaceStructuredBlock(planReviewOriginal, planReviewBlock.json, forgedPlanReview));
    try {
      const forgedSource = runPlanReviewCheck(root, fixture.refs.planReview);
      assert.notEqual(forgedSource.status, 0);
      assert.match(`${forgedSource.stdout}\n${forgedSource.stderr}`, /source_chain\.verification_plan|required|trusted check-verification-plan/);
    } finally {
      fs.writeFileSync(planReviewFile, planReviewOriginal);
    }

    const businessRuleFile = path.join(root, fixture.refs.businessRule);
    const businessRuleText = fs.readFileSync(businessRuleFile, "utf8");
    const businessRuleBlock = businessRuleText.match(/```json\s*([\s\S]*?)```/i);
    assert.ok(businessRuleBlock);
    const blockedBusinessRule = JSON.parse(businessRuleBlock[1]);
    blockedBusinessRule.state = "BLOCKED_INCOMPLETE_RULE";
    fs.writeFileSync(businessRuleFile, businessRuleText.replace(
      businessRuleBlock[1],
      `${JSON.stringify(blockedBusinessRule, null, 2)}\n`,
    ));
    const blockedReview = spawnSync(process.execPath, [
      path.join(kitRoot, "scripts/resolve-plan-review.mjs"), root,
      "--intent", fixture.intent,
      "--plan", fixture.refs.plan,
      "--task-governance", `artifact:${fixture.refs.taskGovernance}`,
      "--business-rule", `artifact:${fixture.refs.businessRule}`,
      "--impact", `artifact:${fixture.refs.impact}`,
      "--verification-plan", `artifact:${fixture.refs.verificationPlan}`,
      "--json",
    ], { cwd: root, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
    assert.equal(blockedReview.status, 0, blockedReview.stderr || blockedReview.stdout);
    assert.equal(JSON.parse(blockedReview.stdout).structuredEvidence.plan_review_state, "BLOCKED_BY_INCOMPLETE_REVIEW");
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("LOW non-behavioral completion records proportional NOT_REQUIRED sources without bypassing Execution Assurance", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-low-trust-test-"));
  try {
    prepareLowTrustFixtureSource(root);
    for (const args of [
      ["init"],
      ["config", "user.email", "intentos-test@example.com"],
      ["config", "user.name", "IntentOS Test"],
      ["add", "."],
      ["commit", "-m", "low trust source"],
    ]) {
      const result = spawnSync("git", ["-C", root, ...args], { encoding: "utf8" });
      assert.equal(result.status, 0, result.stderr || result.stdout);
    }

    const fixture = buildLowTrustFixture(kitRoot, root);
    assert.equal(fixture.governance.impact_classification.task_impact, "LOW");
    assert.equal(fixture.governance.impact_classification.task_kind, "docs_only");
    assert.equal(fixture.executionAssurance.assurance_state, "VERIFIED_DONE");
    assert.deepEqual(fixture.executionAssurance.actual_diff.changed_files, [fixture.refs.docs]);
    assert.deepEqual(fixture.executionAssurance.execution_plan.planned_target_paths, [fixture.refs.docs]);
    assert.equal(fixture.completion.completion_state, "COMPLETION_EVIDENCE_READY");
    assert.equal(fixture.completion.can_claim_complete, "Yes");
    const sources = new Map(fixture.completion.source_chain.map((source) => [source.name, source]));
    for (const name of ["business_rule_closure", "verification_plan", "test_evidence"]) {
      assert.equal(sources.get(name).requirement, "NOT_REQUIRED", name);
      assert.equal(sources.get(name).status, "NOT_REQUIRED", name);
      assert.equal(sources.get(name).ready, "Yes", name);
    }
    assert.equal(sources.get("execution_assurance").requirement, "REQUIRED");
    assert.equal(sources.get("execution_assurance").status, "RECORDED");

    const forged = structuredClone(fixture.executionAssurance);
    const weakReviewRef = "artifact:review-summaries/free-form-pass.md";
    forged.review.review_refs = [weakReviewRef];
    forged.completion_contract.criteria[0].evidence_refs = [weakReviewRef];
    forged.evidence_bindings[0].evidence_ref = weakReviewRef;
    const forgedErrors = validateDoneCapableExecutionAssurance(forged, {
      business_rule_closure: false,
      verification_plan: false,
      test_evidence: false,
      execution_assurance: true,
    });
    assert.match(forgedErrors.join("\n"), /exact current-task Plan Review|NO_PLAN_REQUIRED Plan Review/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("Execution Assurance rejects a recorded Test Evidence source that fails its strict checker", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-assurance-test-source-"));
  try {
    prepareCurrentTrustFixtureSource(root);
    initializeFixtureGit(root, "execution assurance source validation");
    const fixture = buildCurrentTrustFixture(kitRoot, root);
    const testEvidenceFile = path.join(root, fixture.refs.testEvidence);
    const original = fs.readFileSync(testEvidenceFile, "utf8");
    const block = structuredBlock(original);
    const tampered = structuredClone(block.evidence);
    const observed = tampered.evidence_items.find((item) => item.evidence_type === "LOG_EXCERPT");
    assert.ok(observed);
    observed.result_state = "FAILED";
    tampered.test_evidence_digest = evidenceDigest(tampered, ["test_evidence_digest"]);
    fs.writeFileSync(testEvidenceFile, replaceStructuredBlock(original, block.json, tampered));

    const out = "execution-assurance-reports/tampered-test-source.md";
    const resolved = runKitScript("resolve-execution-assurance.mjs", [
      root,
      "--intent", fixture.intent,
      "--task", fixture.taskRef,
      "--out", out,
    ], root);
    assert.equal(resolved.status, 0, resolved.stderr || resolved.stdout);
    const checked = runKitScript("check-execution-assurance.mjs", [
      root,
      "--report", out,
      "--require-structured-evidence",
      "--require-evidence-authority",
    ], root);
    assert.notEqual(checked.status, 0);
    assert.match(`${checked.stdout}\n${checked.stderr}`, /referenced Test Evidence fails its strict checker/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("LOW execution keeps governed documentation scope and blocks an extra executable diff", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-low-scope-drift-"));
  try {
    prepareLowTrustFixtureSource(root);
    for (const args of [
      ["init"],
      ["config", "user.email", "intentos-test@example.com"],
      ["config", "user.name", "IntentOS Test"],
      ["add", "."],
      ["commit", "-m", "low scope source"],
    ]) {
      const result = spawnSync("git", ["-C", root, ...args], { encoding: "utf8" });
      assert.equal(result.status, 0, result.stderr || result.stdout);
    }

    const fixture = buildLowTrustFixture(kitRoot, root);
    fs.mkdirSync(path.join(root, "scripts"), { recursive: true });
    fs.writeFileSync(path.join(root, "scripts/unplanned.mjs"), "export const unplanned = true;\n");
    const result = spawnSync(process.execPath, [
      path.join(kitRoot, "scripts/resolve-execution-assurance.mjs"), root,
      "--intent", fixture.intent,
      "--task", fixture.taskRef,
      "--kind", "SAFE_PATCH",
      "--task-governance-ref", `artifact:${fixture.refs.taskGovernance}`,
      "--work-queue-ref", `artifact:${fixture.refs.workQueue}`,
      "--work-queue-item-id", "WQ-001",
      "--plan-review-ref", `artifact:${fixture.refs.planReview}`,
      "--json",
    ], { cwd: root, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
    assert.equal(result.status, 0, result.stderr || result.stdout);
    const assurance = JSON.parse(result.stdout).structuredEvidence;
    assert.deepEqual(assurance.execution_plan.planned_target_paths, [fixture.refs.docs]);
    assert.deepEqual(assurance.actual_diff.changed_files, [fixture.refs.docs, "scripts/unplanned.mjs"].sort());
    assert.equal(assurance.actual_diff.target_diff_status, "REQUIRES_EXPLICIT_EXECUTION_PLAN");
    assert.equal(assurance.assurance_state, "BLOCKED_BY_SCOPE_DRIFT");
    assert.equal(assurance.can_claim_done, "No");
    assert.deepEqual(assurance.pending_human_decisions, []);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("LOW proportional completion rejects forged NOT_REQUIRED semantics and missing Execution Assurance", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-low-trust-negative-"));
  try {
    prepareLowTrustFixtureSource(root);
    for (const args of [
      ["init"],
      ["config", "user.email", "intentos-test@example.com"],
      ["config", "user.name", "IntentOS Test"],
      ["add", "."],
      ["commit", "-m", "low trust negative source"],
    ]) {
      const result = spawnSync("git", ["-C", root, ...args], { encoding: "utf8" });
      assert.equal(result.status, 0, result.stderr || result.stdout);
    }
    const fixture = buildLowTrustFixture(kitRoot, root);
    const completionFile = path.join(root, fixture.refs.completion);
    const original = fs.readFileSync(completionFile, "utf8");
    const block = original.match(/```json\s*([\s\S]*?)```/i);
    assert.ok(block);
    const evidence = JSON.parse(block[1]);
    evidence.source_chain.find((source) => source.name === "test_evidence").requirement = "REQUIRED";
    evidence.completion_gate_digest = evidenceDigest(evidence, ["completion_gate_digest"]);
    fs.writeFileSync(completionFile, original.replace(block[1], `${JSON.stringify(evidence, null, 2)}\n`));

    const forged = runCompletionCheck(root, fixture.refs.completion);
    assert.notEqual(forged.status, 0);
    assert.match(`${forged.stdout}\n${forged.stderr}`, /test_evidence requirement REQUIRED must be NOT_REQUIRED/);

    fs.writeFileSync(completionFile, original);
    fs.unlinkSync(path.join(root, fixture.refs.executionAssurance));
    const missingExecution = runCompletionCheck(root, fixture.refs.completion);
    assert.notEqual(missingExecution.status, 0);
    assert.match(`${missingExecution.stdout}\n${missingExecution.stderr}`, /Execution Assurance reference is unsafe or unresolved|source execution_assurance ref is not resolvable/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("1.113 Unified Closure round-trips typed current Completion Evidence and rejects weaker claims", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-closure-roundtrip-"));
  try {
    prepareLowTrustFixtureSource(root);
    initializeFixtureGit(root, "closure round-trip source");
    const fixture = buildLowTrustFixture(kitRoot, root);
    const common = [
      root,
      "--intent", fixture.intent,
      "--task", fixture.taskRef,
      "--intent-digest", fixture.completion.intent_digest,
      "--completion-evidence", fixture.refs.completion,
    ];

    const resolved = runKitScript("resolve-closure-decision.mjs", [...common, "--json"], root);
    assert.equal(resolved.status, 0, resolved.stderr || resolved.stdout);
    const decision = JSON.parse(resolved.stdout);
    assert.equal(decision.closureDecision.decision, "DONE");
    assert.equal(decision.closureDecision.canCountAsDone, "Yes");
    assert.equal(
      decision.humanSummary.needFromHuman,
      "No human decision is required by this read-only decision.",
    );
    assert.deepEqual(
      decision.inputVerification
        .filter((entry) => ["Verification", "Runtime Trust", "Change Impact Coverage", "Execution Closure", "Human Decision"].includes(entry.input))
        .map((entry) => [entry.input, entry.required]),
      [
        ["Verification", "No"],
        ["Runtime Trust", "No"],
        ["Change Impact Coverage", "No"],
        ["Execution Closure", "No"],
        ["Human Decision", "No"],
      ],
    );

    const rendered = runKitScript("resolve-closure-decision.mjs", common, root);
    assert.equal(rendered.status, 0, rendered.stderr || rendered.stdout);
    fs.mkdirSync(path.join(root, "closure-decisions"), { recursive: true });
    fs.writeFileSync(path.join(root, "closure-decisions/current.md"), rendered.stdout);

    const checked = runClosureCheck(root, "closure-decisions/current.md");
    assert.equal(checked.status, 0, checked.stderr || checked.stdout);
    assert.match(checked.stdout, /verified Completion Evidence passes strict current-authority checks/);

    fs.mkdirSync(path.join(root, "evidence"), { recursive: true });
    fs.writeFileSync(path.join(root, "evidence/fake-ok.txt"), "ok PASS\n");
    const forged = rendered.stdout.replaceAll(fixture.refs.completion, "evidence/fake-ok.txt");
    fs.writeFileSync(path.join(root, "closure-decisions/forged.md"), forged);
    const forgedCheck = runClosureCheck(root, "closure-decisions/forged.md");
    assert.notEqual(forgedCheck.status, 0);
    assert.match(
      `${forgedCheck.stdout}\n${forgedCheck.stderr}`,
      /typed completion_evidence_gate evidence|strict current-authority checks/,
    );

    const wrongTask = rendered.stdout.replace(
      `| Task ref | \`${fixture.taskRef}\` |`,
      "| Task ref | `task:other-current-task` |",
    );
    fs.writeFileSync(path.join(root, "closure-decisions/wrong-task.md"), wrongTask);
    const wrongTaskCheck = runClosureCheck(root, "closure-decisions/wrong-task.md");
    assert.notEqual(wrongTaskCheck.status, 0);
    assert.match(
      `${wrongTaskCheck.stdout}\n${wrongTaskCheck.stderr}`,
      /Completion Evidence must match the exact Closure task(?:, intent text, and digest| and intent)/,
    );

    const blocked = runKitScript("resolve-closure-decision.mjs", [
      ...common,
      "--verification", "failed: the current behavior test is broken",
      "--json",
    ], root);
    assert.equal(blocked.status, 0, blocked.stderr || blocked.stdout);
    assert.equal(JSON.parse(blocked.stdout).closureDecision.decision, "BLOCKED");

    const guided = runKitScript("resolve-guided-closure.mjs", [
      root,
      "--intent", fixture.intent,
      "--verification", "focused tests passed",
      "--json",
    ], root);
    assert.equal(guided.status, 0, guided.stderr || guided.stdout);
    const guidedCard = JSON.parse(guided.stdout);
    assert.equal(guidedCard.plainCloseOutStatus.canCountAsDone, "No");
    assert.equal(guidedCard.technicalDetails.finalClosureAuthority, "UNIFIED_CLOSURE_DECISION");
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

function runCompletionCheck(root, report) {
  return spawnSync(process.execPath, [
    path.join(kitRoot, "scripts/check-completion-evidence.mjs"), root,
    "--report", report,
    "--require-report", "--require-structured-evidence", "--require-source-refs", "--require-ready",
    "--require-task-governance", "--require-work-queue", "--strict-task-consumer",
    "--require-evidence-authority",
  ], { cwd: kitRoot, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
}

function runClosureCheck(root, report) {
  return runKitScript("check-closure-decision.mjs", [
    root,
    "--report", report,
    "--require-task-governance",
    "--require-work-queue",
    "--strict-task-consumer",
  ], root);
}

function runKitScript(script, args, cwd) {
  return spawnSync(process.execPath, [path.join(kitRoot, "scripts", script), ...args], {
    cwd,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
}

function initializeFixtureGit(root, message) {
  for (const args of [
    ["init"],
    ["config", "user.email", "intentos-test@example.com"],
    ["config", "user.name", "IntentOS Test"],
    ["add", "."],
    ["commit", "-m", message],
  ]) {
    const result = spawnSync("git", ["-C", root, ...args], { encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr || result.stdout);
  }
}

function runPlanReviewCheck(root, report) {
  return spawnSync(process.execPath, [
    path.join(kitRoot, "scripts/check-plan-review.mjs"), root,
    "--report", report,
    "--require-report", "--require-structured-evidence",
  ], { cwd: kitRoot, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
}

function runVerificationPlanCheck(root, report) {
  return spawnSync(process.execPath, [
    path.join(kitRoot, "scripts/check-verification-plan.mjs"), root,
    "--report", report,
    "--require-report", "--require-structured-evidence",
    "--require-business-rule-ref", "--require-impact-ref",
    "--strict-source-binding", "--require-evidence-authority",
  ], { cwd: kitRoot, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
}

function taskEntryErrors(root, evidence) {
  const errors = [];
  checkTaskEntryBinding({
    evidence,
    label: "fixture",
    projectRoot: root,
    consumer: "completion_evidence",
    requireTaskGovernance: true,
    requireWorkQueue: true,
    strictTaskConsumer: true,
    pass: () => {},
    fail: (message) => errors.push(message),
  });
  return errors;
}

function structuredBlock(content) {
  const match = content.match(/```json\s*([\s\S]*?)```/i);
  assert.ok(match);
  return { json: match[1], evidence: JSON.parse(match[1]) };
}

function replaceStructuredBlock(content, json, evidence) {
  return content.replace(json, `${JSON.stringify(evidence, null, 2)}\n`);
}

function runChangeImpactCheck(root, report, extra = []) {
  return spawnSync(process.execPath, [
    path.join(kitRoot, "scripts/check-change-impact-coverage.mjs"), root,
    "--report", report,
    "--require-structured-evidence", "--strict-evidence", "--require-task-lineage",
    ...extra,
  ], { cwd: kitRoot, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
}

test("1.113 Change Impact rejects prose-only exclusions and unbound user decisions", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-impact-negative-"));
  try {
    prepareCurrentTrustFixtureSource(root);
    initializeFixtureGit(root, "change impact source");
    const fixture = buildCurrentTrustFixture(kitRoot, root);
    const impactFile = path.join(root, fixture.refs.impact);
    const original = fs.readFileSync(impactFile, "utf8");
    const block = structuredBlock(original);

    const proseOnly = structuredClone(block.evidence);
    proseOnly.mode = "closure";
    const excluded = proseOnly.implementation_coverage.find((item) => item.status === "NOT_APPLICABLE");
    assert.ok(excluded);
    excluded.status = "OUT_OF_SCOPE";
    excluded.evidence = "No change is expected here.";
    proseOnly.impact_digest = evidenceDigest(proseOnly, ["impact_digest"]);
    fs.writeFileSync(impactFile, replaceStructuredBlock(original, block.json, proseOnly));
    const exclusionCheck = runChangeImpactCheck(root, fixture.refs.impact, [
      "--mode", "closure", "--resolve-evidence-refs", "--require-precise-evidence",
    ]);
    assert.notEqual(exclusionCheck.status, 0);
    assert.match(
      `${exclusionCheck.stdout}\n${exclusionCheck.stderr}`,
      /structured implementation exclusion .* (?:evidence has no resolvable reference|precise evidence ref failed)/,
    );

    const unboundDecision = structuredClone(block.evidence);
    unboundDecision.affected_surface_map[0].status = "NEEDS_HUMAN_DECISION";
    unboundDecision.pending_decisions = [];
    unboundDecision.impact_digest = evidenceDigest(unboundDecision, ["impact_digest"]);
    fs.writeFileSync(impactFile, replaceStructuredBlock(original, block.json, unboundDecision));
    const decisionCheck = runChangeImpactCheck(root, fixture.refs.impact, ["--mode", "preflight"]);
    assert.notEqual(decisionCheck.status, 0);
    assert.match(`${decisionCheck.stdout}\n${decisionCheck.stderr}`, /NEEDS_HUMAN_DECISION surfaces require a structured non-technical pending decision/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("actual diff authority rejects empty feature, omitted untracked, and forged file sets", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-actual-diff-negative-"));
  try {
    fs.writeFileSync(path.join(root, "README.md"), "baseline\n");
    for (const args of [
      ["init"],
      ["config", "user.email", "intentos-test@example.com"],
      ["config", "user.name", "IntentOS Test"],
      ["add", "."],
      ["commit", "-m", "actual diff source"],
    ]) {
      const result = spawnSync("git", ["-C", root, ...args], { encoding: "utf8" });
      assert.equal(result.status, 0, result.stderr || result.stdout);
    }

    const emptyFeature = validateActualDiffAuthority(root, {
      execution_kind: "FEATURE_IMPLEMENTATION",
      assurance_state: "VERIFIED_DONE",
      actual_diff: { diff_source: "git:working-tree", changed_files: [], unexpected_files: [] },
    }, { required: true });
    assert.equal(emptyFeature.ok, false);
    assert.match(emptyFeature.errors.join("\n"), /non-empty actual diff/);

    fs.writeFileSync(path.join(root, "README.md"), "changed\n");
    fs.writeFileSync(path.join(root, "new-file.txt"), "untracked\n");
    const omittedUntracked = validateActualDiffAuthority(root, {
      execution_kind: "FEATURE_IMPLEMENTATION",
      assurance_state: "VERIFIED_DONE",
      actual_diff: { diff_source: "git:working-tree", changed_files: ["README.md"], unexpected_files: [] },
    }, { required: true });
    assert.equal(omittedUntracked.ok, false);
    assert.match(omittedUntracked.errors.join("\n"), /observed \[README\.md, new-file\.txt\]/);

    const forged = validateActualDiffAuthority(root, {
      execution_kind: "FEATURE_IMPLEMENTATION",
      assurance_state: "VERIFIED_DONE",
      actual_diff: { diff_source: "git:working-tree", changed_files: ["forged.txt"], unexpected_files: [] },
    }, { required: true });
    assert.equal(forged.ok, false);
    assert.match(forged.errors.join("\n"), /does not match the current Git worktree/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("actual implementation diff excludes governed outputs but retains project files", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-113-governed-diff-"));
  try {
    fs.writeFileSync(path.join(root, "README.md"), "# Initial\n");
    for (const args of [
      ["init"],
      ["config", "user.email", "intentos-test@example.com"],
      ["config", "user.name", "IntentOS Test"],
      ["add", "."],
      ["commit", "-m", "governed diff source"],
    ]) {
      const result = spawnSync("git", ["-C", root, ...args], { encoding: "utf8" });
      assert.equal(result.status, 0, result.stderr || result.stdout);
    }

    fs.writeFileSync(path.join(root, "README.md"), "# Changed\n");
    fs.mkdirSync(path.join(root, "completion-evidence-reports"), { recursive: true });
    fs.writeFileSync(path.join(root, "completion-evidence-reports/current.md"), "governed evidence\n");
    fs.mkdirSync(path.join(root, "work-queue"), { recursive: true });
    fs.writeFileSync(path.join(root, "work-queue/current.md"), "governed queue\n");

    const observed = collectGitChangedFiles(root, "git:working-tree");
    assert.equal(observed.ok, true);
    assert.deepEqual(observed.files, ["README.md"]);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("candidate diff sources exclude unrelated unstaged drafts", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-113-candidate-diff-"));
  try {
    fs.writeFileSync(path.join(root, "README.md"), "baseline\n");
    for (const args of [
      ["init"],
      ["config", "user.email", "intentos-test@example.com"],
      ["config", "user.name", "IntentOS Test"],
      ["add", "."],
      ["commit", "-m", "candidate diff source"],
    ]) {
      const result = spawnSync("git", ["-C", root, ...args], { encoding: "utf8" });
      assert.equal(result.status, 0, result.stderr || result.stdout);
    }

    fs.writeFileSync(path.join(root, "README.md"), "candidate\n");
    fs.writeFileSync(path.join(root, "candidate.txt"), "included\n");
    fs.writeFileSync(path.join(root, "draft.txt"), "unrelated\n");
    for (const file of ["README.md", "candidate.txt"]) {
      const result = spawnSync("git", ["-C", root, "add", file], { encoding: "utf8" });
      assert.equal(result.status, 0, result.stderr || result.stdout);
    }

    const cached = collectGitChangedFiles(root, "git:cached");
    assert.equal(cached.ok, true);
    assert.deepEqual(cached.files, ["README.md", "candidate.txt"]);

    const base = collectGitChangedFiles(root, "git:HEAD");
    assert.equal(base.ok, true);
    assert.deepEqual(base.files, ["README.md", "candidate.txt"]);

    const workingTree = collectGitChangedFiles(root, "git:working-tree");
    assert.equal(workingTree.ok, true);
    assert.deepEqual(workingTree.files, ["README.md", "candidate.txt", "draft.txt"]);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("cached candidate diff replays the exact committed candidate in a clean checkout", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-113-committed-candidate-"));
  try {
    fs.writeFileSync(path.join(root, "README.md"), "baseline\n");
    for (const args of [
      ["init"],
      ["config", "user.email", "intentos-test@example.com"],
      ["config", "user.name", "IntentOS Test"],
      ["add", "."],
      ["commit", "-m", "candidate base"],
    ]) {
      const result = spawnSync("git", ["-C", root, ...args], { encoding: "utf8" });
      assert.equal(result.status, 0, result.stderr || result.stdout);
    }
    const base = spawnSync("git", ["-C", root, "rev-parse", "HEAD"], { encoding: "utf8" }).stdout.trim();
    fs.writeFileSync(path.join(root, "README.md"), "candidate\n");
    fs.writeFileSync(path.join(root, "candidate.txt"), "included\n");
    for (const args of [["add", "README.md", "candidate.txt"], ["commit", "-m", "candidate"]]) {
      const result = spawnSync("git", ["-C", root, ...args], { encoding: "utf8" });
      assert.equal(result.status, 0, result.stderr || result.stdout);
    }

    const replayed = collectGitChangedFiles(root, "git:cached", { baseRevision: base });
    assert.equal(replayed.ok, true);
    assert.deepEqual(replayed.files, ["README.md", "candidate.txt"]);
    const workingTreeReplay = collectGitChangedFiles(root, "git:working-tree", { baseRevision: base });
    assert.equal(workingTreeReplay.ok, true);
    assert.deepEqual(workingTreeReplay.files, ["README.md", "candidate.txt"]);

    fs.writeFileSync(path.join(root, "unrelated-draft.txt"), "dirty\n");
    const dirty = collectGitChangedFiles(root, "git:cached", { baseRevision: base });
    assert.equal(dirty.ok, false);
    assert.match(dirty.reason, /completely clean worktree/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
