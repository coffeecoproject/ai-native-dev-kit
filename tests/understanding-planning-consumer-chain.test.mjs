import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const kitRoot = path.resolve(import.meta.dirname, "..");
const intent = "修改首页按钮文案";

test("Operating Model consumes ready Planning Closure before implementation review", () => {
  const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-planning-consumer-"));
  try {
    const initialized = run("scripts/init-project.mjs", [
      "--target", projectRoot,
      "--starter", "codex-web-app",
      "--goal", "create a bounded local web project",
    ]);
    assert.equal(initialized.status, 0, combined(initialized));
    confirmGeneratedOnboarding(projectRoot);

    const governanceRef = "task-governance-reports/current.md";
    const governance = run("scripts/resolve-task-governance.mjs", [
      projectRoot,
      "--intent", intent,
      "--out", governanceRef,
    ]);
    assert.equal(governance.status, 0, combined(governance));
    const evidence = machineEvidence(fs.readFileSync(path.join(projectRoot, governanceRef), "utf8"));

    fs.rmSync(path.join(projectRoot, "work-queue"), { recursive: true, force: true });
    fs.mkdirSync(path.join(projectRoot, "work-queue"), { recursive: true });
    fs.writeFileSync(
      path.join(projectRoot, "work-queue/current.md"),
      workQueue(evidence.task_ref, evidence.intent_digest),
    );

    const planning = run("scripts/resolve-planning-closure.mjs", [
      projectRoot,
      "--intent", intent,
      "--task-ref", evidence.task_ref,
      "--intent-digest", evidence.intent_digest,
      "--json",
    ]);
    assert.equal(planning.status, 0, combined(planning));
    const planningReport = JSON.parse(planning.stdout);
    assert.equal(planningReport.outcome, "PLANNING_READY", JSON.stringify(planningReport, null, 2));

    const result = run("scripts/resolve-operating-loop.mjs", [projectRoot, "--intent", intent, "--json"]);
    assert.equal(result.status, 0, combined(result));
    const report = JSON.parse(result.stdout);
    const planningSource = report.sourceSystemTrace.find((source) => source.sourceSystem === "PLANNING_CLOSURE");

    assert.ok(planningSource, "Operating Model must consume Planning Closure");
    assert.equal(planningSource.outcome, "PLANNING_READY", JSON.stringify(planningSource, null, 2));
    assert.equal(report.operatingLoop.state, "READY_FOR_LIGHTWEIGHT_WORK_REVIEW");
    assert.equal(report.operatingDecision.actionCode, "PREPARE_LIGHTWEIGHT_IMPLEMENTATION_REVIEW");
    assert.equal(report.operatingDecision.materialActionAuthorized, "No");
    assert.equal(report.operatingDecision.routineEngineeringMayProceedAfterInternalGates, "Yes");
    assert.equal(report.decisionResponsibility.technicalDecisionRequiredFromUser, "No");
  } finally {
    fs.rmSync(projectRoot, { recursive: true, force: true });
  }
});

test("Execution Assurance fails closed when Planning Closure authority is missing", () => {
  const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-execution-planning-"));
  try {
    const result = run("scripts/resolve-execution-assurance.mjs", [
      projectRoot,
      "--intent", intent,
      "--task", "task:missing-planning-closure",
      "--json",
    ]);
    assert.equal(result.status, 0, combined(result));
    const report = JSON.parse(result.stdout);
    assert.equal(report.structuredEvidence.planning_closure_binding.requirement, "REQUIRED");
    assert.equal(report.structuredEvidence.planning_closure_binding.status, "BLOCKED");
    assert.notEqual(report.outcome, "VERIFIED_DONE");
    assert.equal(report.structuredEvidence.can_claim_done, "No");
  } finally {
    fs.rmSync(projectRoot, { recursive: true, force: true });
  }
});

function confirmGeneratedOnboarding(projectRoot) {
  for (const name of [
    "project-onboarding.md",
    "project-profile.md",
    "tech-stack-strategy.md",
    "business-spec-index.md",
    "sample-policy.md",
    "onboarding-decisions.md",
  ]) {
    const file = path.join(projectRoot, "docs", name);
    const content = fs.readFileSync(file, "utf8")
      .replace(/<[^>\n]+>/g, "fixture-confirmed")
      .replace(/PENDING_CONFIRMATION|NOT_READY|PENDING\b|TBD|TODO/g, "CONFIRMED");
    fs.writeFileSync(file, content);
  }
  for (const name of ["baseline-selection.md", "baseline-evidence.md"]) {
    const file = path.join(projectRoot, "docs", name);
    const content = fs.readFileSync(file, "utf8")
      .replace(/PENDING_EVIDENCE|EVIDENCE_PENDING/g, "VERIFIED");
    fs.writeFileSync(file, content);
  }
  const environment = path.join(projectRoot, "docs/environment-baseline.md");
  fs.writeFileSync(
    environment,
    fs.readFileSync(environment, "utf8").replace(/PENDING_CONFIRMATION/g, "CONFIRMED"),
  );
}

function workQueue(taskRef, intentDigest) {
  return `# Work Queue\n\n## Work Items\n\n| Task ID | Title | State | Task Ref | Intent Digest | Evidence | Resume Review | Notes |\n|---|---|---|---|---|---|---|---|\n| TASK-001 | ${intent} | CURRENT | ${taskRef} | ${intentDigest} | current Task Governance | N/A | bounded fixture |\n`;
}

function machineEvidence(content) {
  const match = content.match(/## Machine-Readable Evidence[\s\S]*?```json\s*([\s\S]*?)```/i);
  assert.ok(match, "Task Governance report must contain structured evidence");
  return JSON.parse(match[1]);
}

function run(script, args) {
  return spawnSync(process.execPath, [path.join(kitRoot, script), ...args], {
    cwd: kitRoot,
    encoding: "utf8",
    timeout: 180_000,
    maxBuffer: 1024 * 1024 * 100,
  });
}

function combined(result) {
  return `${result.stdout || ""}\n${result.stderr || ""}`;
}
