import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { evidenceDigest, extractMachineReadableEvidence } from "../scripts/lib/artifact-schema.mjs";
import { canonicalFileDigest, projectIdentity } from "../scripts/lib/evidence-authority.mjs";
import { STAGED_RELEASE_CANDIDATE_CHECK } from "../scripts/lib/release-trust.mjs";
import {
  requiredImplementationSources,
  validateTaskObligationProjection,
} from "../scripts/lib/task-obligations.mjs";

const kitRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function resolveTask(root, intent, extra = []) {
  const result = spawnSync(process.execPath, [
    path.join(kitRoot, "scripts/resolve-task-governance.mjs"),
    root,
    "--intent", intent,
    "--json",
    ...extra,
  ], { cwd: root, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return JSON.parse(result.stdout);
}

function writeTaskGovernance(root, intent, file = "task-governance-reports/current.md", extra = []) {
  const result = spawnSync(process.execPath, [
    path.join(kitRoot, "scripts/resolve-task-governance.mjs"),
    root,
    "--intent", intent,
    "--out", file,
    ...extra,
  ], { cwd: root, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return file;
}

function resolvePlanReview(root, intent, taskGovernance, extra = []) {
  const result = spawnSync(process.execPath, [
    path.join(kitRoot, "scripts/resolve-plan-review.mjs"),
    root,
    "--intent", intent,
    "--task-governance", taskGovernance,
    "--json",
    ...extra,
  ], { cwd: root, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return JSON.parse(result.stdout);
}

function sha256(value) {
  return `sha256:${crypto.createHash("sha256").update(value).digest("hex")}`;
}

function git(root, args) {
  const result = spawnSync("git", ["-C", root, ...args], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr || result.stdout);
}

function taskGovernanceEvidence(root, file) {
  const content = fs.readFileSync(path.join(root, file), "utf8");
  const block = content.match(/```json\s*([\s\S]*?)```/i);
  assert.ok(block, file);
  return { content, block, evidence: JSON.parse(block[1]) };
}

function writeTaskGovernanceEvidence(root, file, current, evidence) {
  evidence.task_governance_digest = evidenceDigest(evidence, ["task_governance_digest"]);
  fs.writeFileSync(
    path.join(root, file),
    current.content.replace(current.block[1], `${JSON.stringify(evidence, null, 2)}\n`),
  );
}

function resolveWorkQueueTakeover(root, intent, taskGovernance, currentItemId, takeover = "work-queue-takeover-reports/current.md") {
  const result = spawnSync(process.execPath, [
    path.join(kitRoot, "scripts/resolve-work-queue-takeover.mjs"),
    root,
    "--intent", intent,
    "--task-governance-ref", `artifact:${taskGovernance}`,
    "--current-item-id", currentItemId,
    "--out", takeover,
  ], { cwd: root, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const extracted = extractMachineReadableEvidence(fs.readFileSync(path.join(root, takeover), "utf8"));
  assert.equal(extracted.ok, true, extracted.errors?.join("; "));
  return extracted.value;
}

function writeActiveWorkQueue(root, intent) {
  const relative = "work-queue/current.md";
  fs.mkdirSync(path.dirname(path.join(root, relative)), { recursive: true });
  fs.writeFileSync(path.join(root, relative), `# Work Queue\n\n## Current Task\n\n| Task ID | Title | State | Intent Digest |\n| --- | --- | --- | --- |\n| WQ-001 | ${intent} | CURRENT | ${sha256(intent)} |\n\n## Work Items\n\n| Task ID | Title | State | Intent Digest |\n| --- | --- | --- | --- |\n| WQ-001 | ${intent} | CURRENT | ${sha256(intent)} |\n`);
  return relative;
}

function writeGovernedTask(root, intent, options = {}) {
  writeActiveWorkQueue(root, intent);
  const taskGovernance = options.taskGovernance || "task-governance-reports/current.md";
  const takeover = options.takeover || "work-queue-takeover-reports/current.md";
  const provisional = spawnSync(process.execPath, [
    path.join(kitRoot, "scripts/resolve-work-queue-takeover.mjs"), root,
    "--intent", intent,
    "--out", takeover,
  ], { cwd: root, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
  assert.equal(provisional.status, 0, provisional.stderr || provisional.stdout);
  const extracted = extractMachineReadableEvidence(fs.readFileSync(path.join(root, takeover), "utf8"));
  assert.equal(extracted.ok, true, extracted.errors?.join("; "));
  const current = (extracted.value.queue_items || []).filter((item) => item.state === "CURRENT");
  assert.equal(
    current.length,
    1,
    `the provisional Work Queue must expose one CURRENT item: ${JSON.stringify(extracted.value.queue_items || [])}; blocked=${JSON.stringify(extracted.value.readiness?.blocked_by || [])}`,
  );
  writeTaskGovernance(root, intent, taskGovernance, [
    ...(options.taskKind ? ["--task-kind", options.taskKind] : []),
    "--work-queue-item", `artifact:${takeover}#${current[0].item_id}`,
  ]);
  const finalized = spawnSync(process.execPath, [
    path.join(kitRoot, "scripts/resolve-work-queue-takeover.mjs"), root,
    "--intent", intent,
    "--task-governance-ref", `artifact:${taskGovernance}`,
    "--current-item-id", current[0].item_id,
    "--out", takeover,
  ], { cwd: root, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
  assert.equal(finalized.status, 0, finalized.stderr || finalized.stdout);
  return { taskGovernance, takeover, currentItemId: current[0].item_id };
}

test("1.113 Runtime Hygiene preserves the exact current intent digest", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-113-runtime-intent-"));
  const intent = "verify the current source candidate without an external effect";
  const intentDigest = sha256(intent);
  const result = spawnSync(process.execPath, [
    path.join(kitRoot, "scripts/resolve-runtime-hygiene.mjs"),
    root,
    "--intent", intent,
    "--intent-digest", intentDigest,
    "--json",
  ], { cwd: root, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(JSON.parse(result.stdout).intent_digest, intentDigest);

  const schema = JSON.parse(fs.readFileSync(path.join(kitRoot, "schemas/artifacts/runtime-hygiene.schema.json"), "utf8"));
  assert.equal(schema.required.includes("intent_digest"), true);
});

test("1.113 Runtime Hygiene keeps release review compatible with a zero-experience solo user", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-113-runtime-solo-release-"));
  const intent = "prepare the exact source candidate for release review";
  const taskRef = "task:runtime-solo-release";
  const intentDigest = sha256(intent);
  const candidateRef = "artifact:release-candidates/source.md";
  fs.mkdirSync(path.join(root, "release-candidates"), { recursive: true });
  fs.writeFileSync(path.join(root, "README.md"), "baseline\n");
  for (const args of [
    ["init"],
    ["config", "user.email", "intentos-test@example.com"],
    ["config", "user.name", "IntentOS Test"],
    ["add", "README.md"],
    ["commit", "-m", "runtime release baseline"],
  ]) {
    const git = spawnSync("git", ["-C", root, ...args], { encoding: "utf8" });
    assert.equal(git.status, 0, git.stderr || git.stdout);
  }
  fs.writeFileSync(path.join(root, "release-candidates/source.md"), "# Source Candidate\n\nBounded source-only review candidate.\n");
  const staged = spawnSync("git", ["-C", root, "add", "release-candidates/source.md"], { encoding: "utf8" });
  assert.equal(staged.status, 0, staged.stderr || staged.stdout);
  const candidateDigest = canonicalFileDigest(path.join(root, "release-candidates/source.md"));
  const sourceRevision = projectIdentity(root).revision;
  const releaseEventRef = "evidence/release-preflight.json";
  const receipt = {
    schema_version: "1.113.0",
    artifact_type: "release_preflight_receipt",
    operation: "release_preflight",
    task_ref: taskRef,
    intent_digest: intentDigest,
    release_candidate_ref: candidateRef,
    release_candidate_digest: candidateDigest,
    source_revision: sourceRevision,
    lane_state: "PREFLIGHT_ONLY",
    command: STAGED_RELEASE_CANDIDATE_CHECK,
    result: "PASS",
    exit_code: 0,
    external_effects_executed: "No",
    production_touched: "No",
    receipt_digest: "",
  };
  receipt.receipt_digest = evidenceDigest(receipt, ["receipt_digest"]);
  fs.mkdirSync(path.join(root, "evidence"), { recursive: true });
  fs.writeFileSync(path.join(root, releaseEventRef), `${JSON.stringify(receipt, null, 2)}\n`);
  const result = spawnSync(process.execPath, [
    path.join(kitRoot, "scripts/resolve-runtime-hygiene.mjs"),
    root,
    "--intent", intent,
    "--task-ref", taskRef,
    "--intent-digest", intentDigest,
    "--operation", "release",
    "--release-lane", "PREFLIGHT_ONLY",
    "--release-event", path.join(root, releaseEventRef),
    "--release-event-ref", `artifact:${releaseEventRef}`,
    "--release-candidate-ref", candidateRef,
    "--release-candidate-digest", candidateDigest,
    "--source-revision", sourceRevision,
    "--json",
  ], { cwd: root, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const report = JSON.parse(result.stdout);
  assert.equal(report.decision_state, "CAN_CONTINUE_TO_RELEASE_REVIEW");
  assert.doesNotMatch(`${report.plain_user_summary}\n${report.plain_next_step}`, /release[- ]owner/i);
  assert.match(report.plain_next_step, /exact release-consent record/i);
});

test("1.113 release-channel blockers stay plain-language and do not require role assignment", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-113-solo-release-channel-"));
  const result = spawnSync(process.execPath, [
    path.join(kitRoot, "scripts/resolve-release-channel-policy.mjs"),
    root,
    "--intent", "prepare a source-only release path",
    "--project-type", "new_project",
    "--channel", "source_only",
    "--release-workflow-detected", "Yes",
    "--github-hosted-runner-used", "Yes",
    "--actions-minutes-cost-risk", "Unknown",
    "--cache-storage-cost-risk", "Unknown",
    "--release-owner-ref", "missing",
    "--cost-owner-ref", "missing",
    "--json",
  ], { cwd: root, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const summary = JSON.parse(result.stdout).decision.plain_user_summary;
  assert.doesNotMatch(summary, /owner|missing_release|missing_cost/i);
  assert.match(summary, /do not need to choose the technical release path/i);
});

test("1.113 Work Queue takeover ignores fixtures and accepts one governed current task in a dirty worktree", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-113-queue-runtime-"));
  git(root, ["init"]);
  git(root, ["config", "user.email", "intentos-test@example.com"]);
  git(root, ["config", "user.name", "IntentOS Test"]);
  fs.writeFileSync(path.join(root, "README.md"), "# Governed project\n");
  git(root, ["add", "README.md"]);
  git(root, ["commit", "-m", "initial"]);

  const intent = "change the local permission boundary without external effects";
  writeActiveWorkQueue(root, intent);
  fs.mkdirSync(path.join(root, "work-queue"), { recursive: true });
  fs.writeFileSync(path.join(root, "work-queue/history.md"), `# Historical queue\n\n## Queue Policy\n\nOnly one CURRENT task is allowed.\n\n## Current Task\n\nNone. This report contains only completed historical work.\n\n## Work Items\n\n| Task ID | State |\n| --- | --- |\n| old | DONE |\n`);
  git(root, ["add", "work-queue"]);
  git(root, ["commit", "-m", "record governed queue"]);

  const { taskGovernance, takeover, currentItemId } = writeGovernedTask(root, intent, { taskKind: "code_behavior" });
  fs.mkdirSync(path.join(root, "test-fixtures/bad/unsafe"), { recursive: true });
  fs.writeFileSync(path.join(root, "test-fixtures/bad/unsafe/TODO.md"), "UNSAFE_TO_TAKE_OVER production incident\n");
  fs.mkdirSync(path.join(root, "examples/demo"), { recursive: true });
  fs.writeFileSync(path.join(root, "examples/demo/tasks.md"), "release conflict\n");
  fs.writeFileSync(path.join(root, "local-change.txt"), "dirty but governed\n");

  const report = resolveWorkQueueTakeover(root, intent, taskGovernance, currentItemId, takeover);
  assert.equal(report.project_task_system_class, "RELIABLE_EXISTING_TASK_SYSTEM");
  assert.equal(report.outcome, "MAPPED_EXISTING_SYSTEM");
  assert.equal(report.readiness.takeover_ready, "Yes");
  assert.deepEqual(report.readiness.blocked_by, []);
  assert.equal(report.queue_items.filter((item) => item.state === "CURRENT").length, 1);
  assert.equal(report.queue_items[0].task_governance_binding_status, "VERIFIED");
  assert.equal(report.source_inventory.some((item) => item.source_ref.startsWith("test-fixtures/")), false);
  assert.equal(report.source_inventory.some((item) => item.source_ref.startsWith("examples/")), false);
});

test("1.113 consumer chain uses HEAD for a staged candidate instead of mixing in the previous release commit", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-113-consumer-base-"));
  git(root, ["init"]);
  git(root, ["config", "user.email", "intentos-test@example.com"]);
  git(root, ["config", "user.name", "IntentOS Test"]);
  fs.writeFileSync(path.join(root, "README.md"), "initial\n");
  git(root, ["add", "README.md"]);
  git(root, ["commit", "-m", "initial"]);

  fs.mkdirSync(path.join(root, "scripts"), { recursive: true });
  fs.writeFileSync(path.join(root, "scripts/prior-release.mjs"), "export const prior = true;\n");
  git(root, ["add", "scripts/prior-release.mjs"]);
  git(root, ["commit", "-m", "prior release"]);

  fs.mkdirSync(path.join(root, "review-summaries"), { recursive: true });
  fs.writeFileSync(path.join(root, "review-summaries/current.md"), "# Current review\n");
  git(root, ["add", "review-summaries/current.md"]);
  fs.mkdirSync(path.join(root, "docs/plans"), { recursive: true });
  fs.writeFileSync(path.join(root, "docs/plans/unrelated-draft.md"), "# Unrelated future plan\n");

  const result = spawnSync(process.execPath, [
    path.join(kitRoot, "scripts/check-consumer-chain.mjs"),
    root,
  ], { cwd: root, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.match(result.stdout, /no task-governed project change/);
  assert.doesNotMatch(result.stdout, /prior-release/);

  fs.writeFileSync(path.join(root, "scripts/untracked-runtime.mjs"), "export const untracked = true;\n");
  const unsafe = spawnSync(process.execPath, [
    path.join(kitRoot, "scripts/check-consumer-chain.mjs"),
    root,
  ], { cwd: root, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
  assert.notEqual(unsafe.status, 0);
  assert.match(`${unsafe.stdout}\n${unsafe.stderr}`, /untracked executable\/configuration inputs/);
});

test("1.113 LOW non-behavioral work keeps lightweight verification but still requires execution and completion proof", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-113-low-"));
  const report = resolveTask(root, "fix a README typo");
  assert.equal(report.impactClassification.task_impact, "LOW");
  assert.equal(report.impactClassification.task_kind, "docs_only");
  assert.equal(report.requiredBeforeImplementation.business_rule_closure_required, "No");
  assert.equal(report.requiredBeforeCompletion.test_evidence_required, "No");
  assert.equal(report.requiredBeforeCompletion.execution_assurance_required, "Yes");
  assert.equal(report.requiredBeforeCompletion.completion_evidence_required, "Yes");
});

test("1.113 explicit README copy scope is not promoted by the behavior it documents", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-113-doc-scope-"));
  const documentation = resolveTask(root, "Update README copy for invoice validation");
  assert.equal(documentation.impactClassification.task_kind, "docs_only");
  assert.equal(documentation.impactClassification.task_impact, "LOW");

  const mixed = resolveTask(root, "Update README copy and modify invoice validation logic");
  assert.equal(mixed.impactClassification.task_kind, "code_behavior");
  assert.notEqual(mixed.impactClassification.task_impact, "LOW");
});

test("1.113 UI activation intent outranks visual wording across English forms and Chinese requests", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-113-ui-activation-"));
  const intents = [
    "handle a click on the button",
    "make the button clickable by changing its style",
    "fix clicking the button",
    "make the control respond to a press",
    "handle repeated button presses",
    "let the user tap the card",
    "make the styled card tappable",
    "通过修改样式让按钮可点击",
    "修复点击按钮后没有响应",
    "支持用户轻触卡片打开详情",
  ];

  for (const intent of intents) {
    const report = resolveTask(root, intent);
    assert.equal(report.impactClassification.task_kind, "code_behavior", intent);
    assert.equal(report.impactClassification.task_impact, "MEDIUM", intent);
    for (const field of ["business_rule_closure_required", "change_impact_coverage_required", "verification_plan_required"]) {
      assert.equal(report.requiredBeforeImplementation[field], "Yes", `${intent}: ${field}`);
    }
    assert.equal(report.requiredBeforeCompletion.test_evidence_required, "Yes", intent);
  }
});

test("1.113 explicit non-behavioral visual and copy requests stay LOW", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-113-explicit-visual-"));
  const cases = [
    ["change the button color", "visual_only"],
    ["adjust spacing between the form fields", "visual_only"],
    ["update the button label copy", "copy"],
    ["only change the button color and spacing; do not change click behavior", "visual_only"],
    ["只调整按钮颜色和间距，不改变点击行为", "visual_only"],
    ["只修改按钮文案，不改变点击行为", "copy"],
  ];

  for (const [intent, taskKind] of cases) {
    const report = resolveTask(root, intent);
    assert.equal(report.impactClassification.task_kind, taskKind, intent);
    assert.equal(report.impactClassification.task_impact, "LOW", intent);
    assert.equal(report.requiredBeforeImplementation.business_rule_closure_required, "No", intent);
    assert.equal(report.requiredBeforeCompletion.test_evidence_required, "No", intent);
  }
});

test("1.113 low-impact visual words cannot downgrade unresolved behavior from POSSIBLE_HIGH", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-113-possible-high-floor-"));
  const report = resolveTask(root, "change its behavior while updating its style");
  assert.equal(report.impactClassification.task_kind, "code_behavior");
  assert.equal(report.impactClassification.task_impact, "POSSIBLE_HIGH");
  assert.deepEqual(report.impactClassification.triggered_surfaces, ["unclassified code behavior"]);
  assert.equal(report.requiredBeforeImplementation.business_rule_closure_required, "Yes");
  assert.equal(report.requiredBeforeImplementation.verification_plan_required, "Yes");
  assert.equal(report.requiredBeforeCompletion.test_evidence_required, "Yes");
});

test("1.113 MEDIUM behavior keeps the minimum business, impact, verification, test, and completion chain without Universe routing", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-113-medium-"));
  fs.mkdirSync(path.join(root, "src"));
  fs.writeFileSync(path.join(root, "src/component.ts"), "export const component = true;\n");
  const report = resolveTask(root, "change a local component interaction");
  assert.equal(report.impactClassification.task_impact, "MEDIUM");
  for (const field of ["business_rule_closure_required", "change_impact_coverage_required", "verification_plan_required"]) {
    assert.equal(report.requiredBeforeImplementation[field], "Yes", field);
  }
  for (const field of ["test_evidence_required", "execution_assurance_required", "completion_evidence_required"]) {
    assert.equal(report.requiredBeforeCompletion[field], "Yes", field);
  }
});

test("1.113 Task Governance rejects weakened Business Universe and Control Effectiveness projections", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-113-routing-projection-"));
  try {
    fs.mkdirSync(path.join(root, "src"), { recursive: true });
    fs.writeFileSync(path.join(root, "src/labels.ts"), [
      "// Interactive and imported entries use the same runtime path.",
      "export const sharedLabel = 'Current label';",
      "",
    ].join("\n"));
    fs.writeFileSync(path.join(root, "package.json"), `${JSON.stringify({
      scripts: { "gate:quality": "node scripts/gate.mjs" },
    }, null, 2)}\n`);
    const intent = "Update label: interactive and imported entries use the same runtime path; verify with quality gate";
    const reportRef = writeTaskGovernance(root, intent, "task-governance-reports/current.md", ["--task-kind", "copy"]);
    const baseline = spawnSync(process.execPath, [
      path.join(kitRoot, "scripts/check-task-governance.mjs"), root,
      "--report", reportRef,
      "--require-structured-evidence",
    ], { cwd: root, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
    assert.equal(baseline.status, 0, `${baseline.stdout}\n${baseline.stderr}`);

    const current = taskGovernanceEvidence(root, reportRef);
    const weakened = structuredClone(current.evidence);
    assert.equal(weakened.business_universe_routing.required, "Yes");
    assert.equal(weakened.control_effectiveness_routing.required, "Yes");
    weakened.required_before_implementation_review.business_universe_coverage_required = "No";
    weakened.required_before_implementation_review.control_effectiveness_required = "No";

    const validation = validateTaskObligationProjection(weakened);
    assert.equal(validation.ok, false);
    assert.match(validation.errors.join("\n"), /business_universe_coverage_required must equal business_universe_routing\.required \(Yes\)/);
    assert.match(validation.errors.join("\n"), /control_effectiveness_required must equal control_effectiveness_routing\.required \(Yes\)/);
    const requiredSources = new Set(requiredImplementationSources(weakened).map((item) => item.source));
    assert.ok(requiredSources.has("business_universe"));
    assert.ok(requiredSources.has("control_effectiveness"));

    writeTaskGovernanceEvidence(root, reportRef, current, weakened);
    const check = spawnSync(process.execPath, [
      path.join(kitRoot, "scripts/check-task-governance.mjs"), root,
      "--report", reportRef,
      "--require-structured-evidence",
    ], { cwd: root, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
    assert.notEqual(check.status, 0);
    assert.match(`${check.stdout}\n${check.stderr}`, /business_universe_coverage_required must equal business_universe_routing\.required \(Yes\)/);
    assert.match(`${check.stdout}\n${check.stderr}`, /control_effectiveness_required must equal control_effectiveness_routing\.required \(Yes\)/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("1.113 an explicit non-behavioral override cannot downgrade inferred behavior", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-113-floor-"));
  const report = resolveTask(root, "change click handler copy", ["--task-kind", "docs_only"]);
  assert.equal(report.impactClassification.task_kind, "code_behavior");
  assert.equal(report.impactClassification.task_impact, "MEDIUM");
  assert.ok(report.impactClassification.upgrade_history.includes("LOW->MEDIUM: behavioral task-kind floor"));
  assert.equal(report.requiredBeforeCompletion.test_evidence_required, "Yes");
});

test("1.113 Plan Review only accepts the exact current Task Governance identity", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-113-plan-task-"));
  const currentIntent = "fix a README typo";
  const { taskGovernance } = writeGovernedTask(root, currentIntent, { taskKind: "docs_only" });

  const current = resolvePlanReview(root, currentIntent, taskGovernance);
  assert.equal(current.structuredEvidence.plan_review_state, "NO_PLAN_REQUIRED");
  assert.equal(current.structuredEvidence.task_governance.current_task_match, "Yes");
  const reportRef = "plan-review-reports/current.md";
  const write = spawnSync(process.execPath, [
    path.join(kitRoot, "scripts/resolve-plan-review.mjs"), root,
    "--intent", currentIntent,
    "--task-governance", taskGovernance,
    "--out", reportRef,
  ], { cwd: root, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
  assert.equal(write.status, 0, write.stderr || write.stdout);
  const check = spawnSync(process.execPath, [
    path.join(kitRoot, "scripts/check-plan-review.mjs"), root,
    "--report", reportRef,
    "--require-structured-evidence",
  ], { cwd: root, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
  assert.equal(check.status, 0, check.stderr || check.stdout);

  const replay = resolvePlanReview(root, "fix a different README typo", taskGovernance);
  assert.equal(replay.structuredEvidence.plan_review_state, "PLAN_REVIEW_REQUIRED_WITH_TASK_GOVERNANCE_RECHECK");
  assert.equal(replay.structuredEvidence.task_governance.current_task_match, "No");
});

test("1.113 Plan Review binds plan content and all minimum MEDIUM obligations", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-113-plan-binding-"));
  const intent = "change a local component interaction";
  const { taskGovernance } = writeGovernedTask(root, intent, { taskKind: "code_behavior" });
  fs.mkdirSync(path.join(root, "docs"), { recursive: true });
  fs.writeFileSync(path.join(root, "docs/current-plan.md"), `# Plan\n\nIntent digest: ${sha256(intent)}\n`);
  fs.writeFileSync(path.join(root, "docs/stale-plan.md"), "# Plan\n\nThis belongs to another task.\n");

  const missingSources = resolvePlanReview(root, intent, taskGovernance, ["--plan", "docs/current-plan.md"]);
  assert.equal(missingSources.structuredEvidence.plan_task_match, "Yes");
  assert.equal(missingSources.structuredEvidence.plan_review_state, "BLOCKED_BY_INCOMPLETE_REVIEW");
  assert.equal(missingSources.structuredEvidence.plan_content_review.status, "INCOMPLETE");
  assert.ok(missingSources.structuredEvidence.plan_content_review.missing_requirements.length > 0);

  const stalePlan = resolvePlanReview(root, intent, taskGovernance, ["--plan", "docs/stale-plan.md"]);
  assert.equal(stalePlan.structuredEvidence.plan_task_match, "No");
  assert.equal(stalePlan.structuredEvidence.plan_review_state, "BLOCKED_BY_STALE_PLAN");

  fs.writeFileSync(path.join(root, "docs/unknown-command-plan.md"), `# Plan

Intent digest: ${sha256(intent)}

## Scope

- Update \`src/local-component.js\` only.

## Boundaries

- Do not change release or production configuration.

## Implementation Sequence

1. Update \`src/local-component.js\`.

## Verification

- Run \`npm run command-that-does-not-exist\`.

## Restore

- Restore \`src/local-component.js\` if verification fails.
`);
  const unknownCommand = resolvePlanReview(root, intent, taskGovernance, ["--plan", "docs/unknown-command-plan.md"]);
  assert.equal(unknownCommand.structuredEvidence.verification_command_review.all_commands_authoritative, "No");
  assert.equal(
    unknownCommand.structuredEvidence.verification_command_review.commands.some((item) => item.executable_or_script_exists === "No"),
    true,
  );
  assert.notEqual(unknownCommand.structuredEvidence.plan_review_state, "PLAN_REVIEW_PASSED");

  const highIntent = "change permission and release boundaries without an external effect";
  fs.writeFileSync(path.join(root, "work-queue/current.md"), `# Work Queue\n\n## Current Task\n\n| Task ID | Title | State | Intent Digest |\n| --- | --- | --- | --- |\n| WQ-001 | ${highIntent} | CURRENT | ${sha256(highIntent)} |\n\n## Work Items\n\n| Task ID | Title | State | Intent Digest |\n| --- | --- | --- | --- |\n| WQ-001 | ${highIntent} | CURRENT | ${sha256(highIntent)} |\n`);
  const { taskGovernance: highTaskGovernance } = writeGovernedTask(root, highIntent, {
    taskGovernance: "task-governance-reports/high.md",
    takeover: "work-queue-takeover-reports/high.md",
  });
  fs.writeFileSync(path.join(root, "docs/high-plan.md"), `# Plan\n\nIntent digest: ${sha256(highIntent)}\n`);
  const highReview = resolvePlanReview(root, highIntent, highTaskGovernance, ["--plan", "docs/high-plan.md"]);
  assert.equal(highReview.structuredEvidence.task_impact, "HIGH");
  assert.equal(
    highReview.structuredEvidence.review_surface_matrix.every((item) => item.human_decision_needed === "No"),
    true,
    "technical review surfaces must remain Codex-owned for the default solo user",
  );
});
