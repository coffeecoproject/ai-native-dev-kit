import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { evidenceDigest, extractMachineReadableEvidence } from "../scripts/lib/artifact-schema.mjs";
import {
  inspectGovernedWorkQueueTakeover,
  resolveGovernedCurrentTaskRoute,
} from "../scripts/lib/behavioral-adoption-activation.mjs";
import { extractNativeRulesFromMarkdown } from "../scripts/lib/native-rule-extraction.mjs";
import { collectProjectAgentAuthority, resolveProjectEntryTrust } from "../scripts/lib/project-entry-trust.mjs";
import {
  createTaskResumeDecision,
  taskIntentDigest,
  validateTaskResumeDecision,
} from "../scripts/lib/task-entry-binding.mjs";

const kitRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function fixture(t, prefix = "intentos-existing-activation-") {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return root;
}

function write(root, relativePath, content) {
  const file = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  return file;
}

function runJson(script, root, args = []) {
  const result = spawnSync(process.execPath, [path.join(kitRoot, script), root, ...args], {
    cwd: kitRoot,
    encoding: "utf8",
    timeout: 120_000,
    maxBuffer: 64 * 1024 * 1024,
  });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  return JSON.parse(result.stdout);
}

function runOk(script, root, args = []) {
  const result = spawnSync(process.execPath, [path.join(kitRoot, script), root, ...args], {
    cwd: kitRoot,
    encoding: "utf8",
    timeout: 120_000,
    maxBuffer: 64 * 1024 * 1024,
  });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  return result;
}

function runJsonWithBlockedOutcome(script, root, args = []) {
  const result = spawnSync(process.execPath, [path.join(kitRoot, script), root, ...args], {
    cwd: kitRoot,
    encoding: "utf8",
    timeout: 120_000,
    maxBuffer: 64 * 1024 * 1024,
  });
  assert.ok([0, 2].includes(result.status), `${result.stdout}\n${result.stderr}`);
  return JSON.parse(result.stdout);
}

function writeEvidence(root, relativePath, title, evidence) {
  return write(root, relativePath, [
    `# ${title}`,
    "",
    "## Machine-Readable Evidence",
    "",
    "```json",
    JSON.stringify(evidence, null, 2),
    "```",
    "",
  ].join("\n"));
}

function governedQueueFixture(t, goal = "Update README copy for invoice validation") {
  const root = fixture(t, "intentos-governed-current-");
  const goalDigest = taskIntentDigest(goal);
  write(root, "requests/001-current.md", [
    "# Current Request",
    "",
    "## Raw Request",
    "",
    goal,
    "",
  ].join("\n"));
  write(root, "work-queue/001-current.md", [
    "# Work Queue",
    "",
    "## Work Items",
    "",
    "| Task ID | Title | State | Task ref | Intent digest | Evidence |",
    "| --- | --- | --- | --- | --- | --- |",
    `| TASK-113 | Invoice validation | CURRENT | requests/001-current.md | ${goalDigest} | request:001-current |`,
    "",
  ].join("\n"));
  const taskGovernanceRef = "task-governance-reports/001-current.md";
  const takeoverRef = "work-queue-takeover-reports/001-current.md";
  runOk("scripts/resolve-work-queue-takeover.mjs", root, ["--intent", goal, "--out", takeoverRef]);
  const provisional = extractMachineReadableEvidence(fs.readFileSync(path.join(root, takeoverRef), "utf8"));
  assert.equal(provisional.ok, true);
  const currentItems = provisional.value.queue_items.filter((item) => item.state === "CURRENT");
  assert.equal(currentItems.length, 1);
  const currentItemRef = `artifact:${takeoverRef}#${currentItems[0].item_id}`;
  runOk("scripts/resolve-task-governance.mjs", root, [
    "--intent", goal,
    "--work-queue-item", currentItemRef,
    "--out", taskGovernanceRef,
  ]);
  runOk("scripts/resolve-work-queue-takeover.mjs", root, [
    "--intent", goal,
    "--task-governance-ref", taskGovernanceRef,
    "--current-item-id", currentItems[0].item_id,
    "--out", takeoverRef,
  ]);
  const queue = runJson("scripts/resolve-work-queue.mjs", root, ["--json"]);
  const resume = runJson("scripts/resolve-work-queue.mjs", root, ["--json"]);
  const governance = runJson("scripts/resolve-task-governance.mjs", root, [
    "--json", "--intent", goal, "--work-queue-item", currentItemRef,
  ]);
  return {
    root,
    goal,
    goalDigest,
    queue,
    resume,
    governance,
    taskGovernanceRef,
    takeoverRef,
    currentItemRef,
  };
}

test("short unpunctuated governance rules and CI YAML signals are never silently omitted", () => {
  const markdown = extractNativeRulesFromMarkdown([
    "# Production Rules",
    "",
    "Never deploy to production",
    "",
  ].join("\n"), "AGENTS.md");
  assert.ok(markdown.rules.length >= 1);
  assert.ok(markdown.rules.some((item) => item.source_excerpt === "Never deploy to production" && item.rule_class === "PRODUCTION_CONTROL"));
  assert.equal(markdown.coverage.unclassified_blocks.length, 0);

  const workflow = extractNativeRulesFromMarkdown([
    "name: quality",
    "on:",
    "  push:",
    "permissions:",
    "  contents: read",
    "jobs:",
    "  test:",
    "    runs-on: ubuntu-latest",
    "    steps:",
    "      - uses: actions/checkout@v4",
    "      - run: npm test",
    "Never deploy to production",
    "",
  ].join("\n"), ".github/workflows/quality.yml");
  assert.ok(workflow.rules.length >= 6, JSON.stringify(workflow, null, 2));
  assert.ok(workflow.rules.some((item) => /CI workflow structure/.test(item.source_excerpt)));
  assert.ok(workflow.rules.some((item) => item.rule_class === "PRODUCTION_CONTROL"));
  assert.equal(workflow.coverage.rules_extracted, workflow.rules.length);
  assert.equal(workflow.coverage.unclassified_blocks.length, 0);
});

test("all root and nested agent authorities participate in identity and semantic conflict checks", (t) => {
  const root = fixture(t, "intentos-nested-authority-");
  write(root, "README.md", "# Existing project\n");
  write(root, "AGENTS.md", "# Root Rules\n\nNever deploy to production\n");
  write(root, "packages/api/a/b/c/agent.md", "# API Rules\n\nAlways deploy to production\n");
  write(root, "packages/web/AGENTS.md", "# Web Rules\n\nThe user must choose the architecture.\n");

  const inventory = collectProjectAgentAuthority(root);
  assert.equal(inventory.total_sources, 3);
  assert.deepEqual(inventory.sources.map((item) => item.path), [
    "AGENTS.md",
    "packages/api/a/b/c/agent.md",
    "packages/web/AGENTS.md",
  ]);
  assert.equal(inventory.state, "INVALID");
  assert.ok(inventory.scope_conflicts.some((item) => item.code === "NESTED_AGENT_AUTHORITY_CONFLICT"));
  assert.ok(inventory.sources.find((item) => item.path === "packages/web/AGENTS.md").conflict_codes.includes("TECHNICAL_DECISION_DELEGATED_TO_USER"));

  const trust = resolveProjectEntryTrust({
    projectRoot: root,
    sourceRoot: kitRoot,
    goal: "Continue the current project",
  });
  assert.equal(trust.guidance_authority.state, "INVALID");
  assert.equal(trust.entry_state, "BLOCKED_REPAIR_REQUIRED");
  assert.ok(trust.guidance_authority.invalid_nodes.some((item) => item.path === "packages/api/a/b/c/agent.md"));
  assert.ok(trust.guidance_authority.invalid_nodes.some((item) => item.path === "packages/web/AGENTS.md"));
});

test("a governed Work Queue takeover requires one durable CURRENT and survives a fresh process", (t) => {
  const value = governedQueueFixture(t);
  const inspected = inspectGovernedWorkQueueTakeover({
    targetRoot: value.root,
    goal: value.goal,
    expectedGoalDigest: value.goalDigest,
    requireCurrentIntentBinding: true,
    requireDurableGovernance: true,
    queueReport: value.queue,
    resumeQueueReport: value.resume,
    taskGovernanceReport: value.governance,
  });
  assert.equal(inspected.state, "VERIFIED", inspected.blockers.join("; "));
  assert.equal(inspected.task_governance_binding_state, "VERIFIED");
  assert.equal(inspected.fresh_process_resume_state, "VERIFIED");
  assert.equal(inspected.current_intent_binding_state, "VERIFIED");
  assert.equal(inspected.durable_takeover_state, "VERIFIED");
  assert.equal(inspected.durable_takeover_ref, value.takeoverRef);
  assert.equal(inspected.task_governance_ref, value.taskGovernanceRef);
  assert.match(inspected.current_item_ref, /^work-queue\/001-current\.md#TASK-113$/);

  const changedResume = structuredClone(value.resume);
  changedResume.currentTaskCandidates[0].title = "Different task in fresh process";
  const mismatched = inspectGovernedWorkQueueTakeover({
    targetRoot: value.root,
    goal: value.goal,
    expectedGoalDigest: value.goalDigest,
    requireCurrentIntentBinding: true,
    requireDurableGovernance: true,
    queueReport: value.queue,
    resumeQueueReport: changedResume,
    taskGovernanceReport: value.governance,
  });
  assert.equal(mismatched.state, "BLOCKED");
  assert.ok(mismatched.blockers.includes("FRESH_PROCESS_DID_NOT_RESOLVE_SAME_CURRENT_ITEM"));
});

test("takeover rejects UNBOUND_COMPATIBILITY Task Governance", (t) => {
  const root = fixture(t, "intentos-unbound-takeover-");
  const goal = "Repair invoice validation copy";
  const digest = taskIntentDigest(goal);
  write(root, "requests/current.md", `# Request\n\n## Raw Request\n\n${goal}\n`);
  write(root, "work-queue/current.md", [
    "# Work Queue", "", "## Work Items", "",
    "| Task ID | Title | State | Task ref | Intent digest | Evidence |",
    "| --- | --- | --- | --- | --- | --- |",
    `| TASK-UNBOUND | ${goal} | CURRENT | requests/current.md | ${digest} | request:current |`,
    "",
  ].join("\n"));
  const takeoverRef = "work-queue-takeover-reports/current.md";
  const governanceRef = "task-governance-reports/unbound.md";
  runOk("scripts/resolve-work-queue-takeover.mjs", root, ["--intent", goal, "--out", takeoverRef]);
  runOk("scripts/resolve-task-governance.mjs", root, ["--intent", goal, "--out", governanceRef]);
  runOk("scripts/resolve-work-queue-takeover.mjs", root, [
    "--intent", goal,
    "--task-governance-ref", governanceRef,
    "--current-item-id", "WQ-001",
    "--out", takeoverRef,
  ]);
  const extracted = extractMachineReadableEvidence(fs.readFileSync(path.join(root, takeoverRef), "utf8"));
  assert.equal(extracted.ok, true);
  assert.equal(extracted.value.readiness.takeover_ready, "No");
  assert.equal(extracted.value.queue_items[0].task_governance_binding_status, "PENDING");
  assert.ok(extracted.value.readiness.blocked_by.some((item) => /WORK_QUEUE_ITEM.*UNBOUND_COMPATIBILITY/.test(item)));
});

test("takeover migrates each structured table task and blocks multiple CURRENT rows", (t) => {
  const root = fixture(t, "intentos-table-migration-");
  const goal = "Migrate the exact current task";
  const digest = taskIntentDigest(goal);
  write(root, "work-queue/current.md", [
    "# Work Queue", "", "## Work Items", "",
    "| Task ID | Title | State | Task ref | Intent digest | Evidence |",
    "| --- | --- | --- | --- | --- | --- |",
    `| TASK-1 | ${goal} | CURRENT | requests/1.md | ${digest} | issue:1 |`,
    `| TASK-2 | Later task | BACKLOG | requests/2.md | ${digest} | issue:2 |`,
    `| TASK-3 | Paused task | PAUSED | requests/3.md | ${digest} | issue:3 |`,
    `| TASK-4 | Blocked task | BLOCKED | requests/4.md | ${digest} | issue:4 |`,
    `| TASK-5 | Completed task | DONE | requests/5.md | ${digest} | issue:5 |`,
    "",
  ].join("\n"));
  const report = runJson("scripts/resolve-work-queue-takeover.mjs", root, ["--json", "--intent", goal]);
  assert.deepEqual(report.migration_dispositions.map((item) => [item.source_item, item.disposition, item.target_queue_state]), [
    ["work-queue/current.md#TASK-1", "MIGRATE_CURRENT", "CURRENT"],
    ["work-queue/current.md#TASK-2", "MIGRATE_BACKLOG", "BACKLOG"],
    ["work-queue/current.md#TASK-3", "MIGRATE_PAUSED", "PAUSED"],
    ["work-queue/current.md#TASK-4", "MIGRATE_BLOCKED", "BLOCKED"],
    ["work-queue/current.md#TASK-5", "MARK_DONE_WITH_EVIDENCE", "DONE"],
  ]);
  assert.deepEqual(report.queue_items.map((item) => item.state), ["CURRENT", "BACKLOG", "PAUSED", "BLOCKED", "DONE"]);

  write(root, "work-queue/current.md", [
    "# Work Queue", "", "## Work Items", "",
    "| Task ID | Title | State | Task ref | Intent digest | Evidence |",
    "| --- | --- | --- | --- | --- | --- |",
    `| TASK-1 | ${goal} | CURRENT | requests/1.md | ${digest} | issue:1 |`,
    `| TASK-2 | Conflicting current | CURRENT | requests/2.md | ${digest} | issue:2 |`,
    "",
  ].join("\n"));
  const blocked = runJson("scripts/resolve-work-queue-takeover.mjs", root, ["--json", "--intent", goal]);
  assert.equal(blocked.project_task_system_class, "UNSAFE_TO_TAKE_OVER");
  assert.equal(blocked.queue_items.length, 0);
  assert.ok(blocked.readiness.blocked_by.some((item) => /multiple CURRENT task rows detected/.test(item)));
});

test("durable takeover selection excludes archives, stale copies, and wrong lineage", (t) => {
  const value = governedQueueFixture(t);
  const originalFile = path.join(value.root, value.takeoverRef);
  const originalContent = fs.readFileSync(originalFile, "utf8");
  write(value.root, "work-queue-takeover-reports/archive/exact-copy.md", originalContent);
  write(value.root, "work-queue-takeover-reports/exact-copy.md", originalContent);

  const original = extractMachineReadableEvidence(originalContent).value;
  const wrongLineage = structuredClone(original);
  wrongLineage.work_queue_takeover_ref = "work-queue-takeover-reports/wrong-lineage.md";
  wrongLineage.work_queue_takeover_digest = evidenceDigest(wrongLineage, ["work_queue_takeover_digest"]);
  writeEvidence(value.root, wrongLineage.work_queue_takeover_ref, "Wrong historical lineage", wrongLineage);

  const route = resolveGovernedCurrentTaskRoute({ targetRoot: value.root, queueReport: value.queue });
  assert.equal(route.state, "VERIFIED", route.blockers.join("; "));
  assert.equal(route.takeover_ref, value.takeoverRef);
  assert.equal(route.work_queue_item_ref, value.currentItemRef);
  assert.equal(route.task_governance_ref, value.taskGovernanceRef);
  assert.deepEqual(route.public_route.map((item) => item.step), [
    "WORK_QUEUE",
    "EXACT_CURRENT_ITEM",
    "TASK_GOVERNANCE_LINEAGE",
    "PLANNING_CLOSURE",
  ]);
});

test("structured resume decisions bind the current project revision and public operating route", (t) => {
  const value = governedQueueFixture(t);
  const arbitraryRef = "decision-briefs/resume.md";
  write(value.root, arbitraryRef, "# Resume approved\n\nThe current task may resume.\n");
  const arbitrary = validateTaskResumeDecision(value.root, arbitraryRef);
  assert.equal(arbitrary.ok, false);
  assert.ok(arbitrary.errors.some((item) => /typed task_resume_decision evidence/.test(item)));

  const forgedEntry = runJsonWithBlockedOutcome("scripts/resolve-operating-loop.mjs", value.root, [
    "--json",
    "--intent", "resume the current paused task",
    "--resume-decision", arbitraryRef,
  ]);
  assert.equal(forgedEntry.operatingLoop.operation, "RESUME_TASK");
  assert.equal(forgedEntry.resumeDecision.state, "REVIEW_REQUIRED");
  assert.ok(forgedEntry.resumeDecision.blockers.some((item) => /typed task_resume_decision evidence/.test(item)));

  const decision = createTaskResumeDecision(value.root, {
    resumeDecisionRef: arbitraryRef,
    workQueueItemRef: value.currentItemRef,
    taskGovernanceRef: `artifact:${value.taskGovernanceRef}`,
    decidedBy: "current-operator",
  });
  writeEvidence(value.root, arbitraryRef, "Current Task Resume Decision", decision);
  const valid = validateTaskResumeDecision(value.root, arbitraryRef);
  assert.equal(valid.ok, true, valid.errors.join("; "));
  assert.equal(valid.approved, true);

  const operating = runJsonWithBlockedOutcome("scripts/resolve-operating-loop.mjs", value.root, [
    "--json",
    "--intent", "resume the current paused task",
    "--resume-decision", arbitraryRef,
  ]);
  assert.equal(operating.operatingLoop.operation, "RESUME_TASK");
  assert.equal(operating.resumeDecision.state, "APPROVED_CURRENT", operating.resumeDecision.blockers.join("; "));
  assert.equal(operating.publicTaskRoute.state, "VERIFIED", operating.publicTaskRoute.blockers.join("; "));
  assert.deepEqual(operating.publicTaskRoute.sequence.map((item) => item.step), [
    "WORK_QUEUE",
    "EXACT_CURRENT_ITEM",
    "TASK_GOVERNANCE_LINEAGE",
    "PLANNING_CLOSURE",
  ]);
  assert.equal(operating.publicTaskRoute.sequence[1].ref, value.currentItemRef);
  assert.equal(operating.publicTaskRoute.sequence[2].ref, value.taskGovernanceRef);

  write(value.root, "src/revision-change.txt", "revision changed\n");
  const stale = validateTaskResumeDecision(value.root, arbitraryRef);
  assert.equal(stale.ok, false);
  assert.ok(stale.errors.some((item) => /another project identity or revision/.test(item)));
});

test("Work Queue and adoption assurance reject directory and .gitkeep presence as behavioral proof", (t) => {
  const root = fixture(t, "intentos-placeholder-adoption-");
  write(root, "README.md", "# Existing project\n");
  for (const directory of [
    "work-queue",
    "task-governance-reports",
    "apply-plans",
    "approval-records",
    "apply-readiness-reports",
    "adoption-assurance-reports",
  ]) write(root, `${directory}/.gitkeep`, "");

  const queue = runJson("scripts/resolve-work-queue.mjs", root, ["--json"]);
  const governance = runJson("scripts/resolve-task-governance.mjs", root, ["--json", "--intent", "Continue placeholder task"]);
  const inspected = inspectGovernedWorkQueueTakeover({
    targetRoot: root,
    goal: "Continue placeholder task",
    requireCurrentIntentBinding: true,
    queueReport: queue,
    resumeQueueReport: queue,
    taskGovernanceReport: governance,
  });
  assert.equal(inspected.state, "BLOCKED");
  assert.ok(inspected.blockers.includes("WORK_QUEUE_HAS_NO_DURABLE_REPORT"));
  assert.ok(inspected.blockers.includes("WORK_QUEUE_REQUIRES_EXACTLY_ONE_CURRENT"));

  const assurance = runJson("scripts/resolve-adoption-assurance.mjs", root, [
    "--json",
    "--intent", "verify existing project IntentOS adoption",
  ]);
  assert.equal(assurance.targetProjectState.hasWorkQueue, false);
  assert.equal(assurance.targetProjectState.hasApplyChain, false);
  assert.notEqual(assurance.structuredEvidence.assurance_state, "VERIFIED_ACTIVE");
  assert.notEqual(assurance.structuredEvidence.surfaces.find((item) => item.surface === "work_queue").status, "MAPPED");
  assert.notEqual(assurance.structuredEvidence.surfaces.find((item) => item.surface === "apply_chain").status, "VERIFIED");
});
