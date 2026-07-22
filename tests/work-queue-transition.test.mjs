import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  evidenceDigest,
  extractMachineReadableEvidence,
} from "../scripts/lib/artifact-schema.mjs";

const kitRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function sha256(value) {
  return `sha256:${crypto.createHash("sha256").update(value).digest("hex")}`;
}

function run(root, script, args = [], expected = 0) {
  const result = spawnSync(process.execPath, [path.join(kitRoot, "scripts", script), root, ...args], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  assert.equal(result.status, expected, result.stderr || result.stdout);
  return result;
}

function writeQueue(root, file, taskId, title, intent) {
  const relative = `work-queue/${file}`;
  fs.mkdirSync(path.join(root, "work-queue"), { recursive: true });
  fs.writeFileSync(path.join(root, relative), `# Work Queue Report

## Human Decision Summary

Conclusion: ${title} is current.

## Human Summary

${title}

## Queue Policy

- Only one CURRENT task is allowed.
- PAUSED tasks require resume review.
- BACKLOG is not execution permission.
- This report does not approve implementation.

## Current Task

| Task ID | Title | State | Intent Digest |
| --- | --- | --- | --- |
| ${taskId} | ${title} | CURRENT | ${sha256(intent)} |

## Paused Tasks

None.

## Backlog / Parking Lot

None.

## Resume Review

- Resume requested: No
- Current state checked: Yes
- Dirty worktree checked: Yes
- Last evidence still valid: Yes
- Human resume decision: NOT_NEEDED
- Resume without review: No

## Work Items

| Task ID | Title | State | Intent Digest |
| --- | --- | --- | --- |
| ${taskId} | ${title} | CURRENT | ${sha256(intent)} |

## Human Decisions Needed

None.

## Boundary

- This report changes task state: No
- This report approves implementation: No
- This report approves target-project writes: No
- This report approves scope expansion: No
- This report approves release or production: No
- This report overrides task/spec/review loop: No
- This report resumes stale work without review: No

## Outcome

WORK_QUEUE_RECORDED
`);
  return relative;
}

function generateGovernedTakeover(root, intent, slug) {
  const takeover = `work-queue-takeover-reports/${slug}.md`;
  const governance = `task-governance-reports/${slug}.md`;
  run(root, "resolve-work-queue-takeover.mjs", ["--intent", intent, "--out", takeover]);
  const provisional = extractMachineReadableEvidence(fs.readFileSync(path.join(root, takeover), "utf8")).value;
  const current = provisional.queue_items.filter((item) => item.state === "CURRENT");
  assert.equal(current.length, 1);
  run(root, "resolve-task-governance.mjs", [
    "--intent", intent,
    "--work-queue-item", `artifact:${takeover}#${current[0].item_id}`,
    "--out", governance,
  ]);
  run(root, "resolve-work-queue-takeover.mjs", [
    "--intent", intent,
    "--task-governance-ref", governance,
    "--current-item-id", current[0].item_id,
    "--out", takeover,
  ]);
  return { takeover, governance };
}

test("append-only transition closes an immutable predecessor and selects one successor", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-wq-transition-"));
  const oldIntent = "Complete the prior governed task.";
  const nextIntent = "Refactor the local self-check entry without behavior drift.";
  const oldQueue = writeQueue(root, "prior.md", "WQ-OLD", "Prior governed task", oldIntent);
  const oldSnapshot = fs.readFileSync(path.join(root, oldQueue), "utf8");
  const oldChain = generateGovernedTakeover(root, oldIntent, "prior");
  const nextQueue = writeQueue(root, "next.md", "WQ-NEXT", "Next governed task", nextIntent);

  run(root, "resolve-work-queue-transition.mjs", [
    "--predecessor", `${oldQueue}#WQ-OLD`,
    "--successor", `${nextQueue}#WQ-NEXT`,
    "--sequence", "1",
    "--decision-ref", "user-confirmation:test",
    "--out", "work-queue-transitions/001-prior-to-next.md",
  ]);

  run(root, "check-work-queue-transition.mjs", ["--require-report"]);
  run(root, "check-work-queue.mjs", ["--require-report"]);
  run(root, "check-task-governance.mjs", ["--require-structured-evidence"]);
  const queue = JSON.parse(run(root, "resolve-work-queue.mjs", ["--json"]).stdout);
  assert.equal(queue.currentTaskCount, 1);
  assert.equal(queue.currentTaskCandidates[0].taskId, "WQ-NEXT");
  assert.equal(queue.queueInventory.appliedTransitionCount, 1);

  const nextTakeover = "work-queue-takeover-reports/next.md";
  run(root, "resolve-work-queue-takeover.mjs", ["--intent", nextIntent, "--out", nextTakeover]);
  const nextEvidence = extractMachineReadableEvidence(fs.readFileSync(path.join(root, nextTakeover), "utf8")).value;
  assert.equal(nextEvidence.queue_items.filter((item) => item.state === "CURRENT").length, 1);
  assert.equal(nextEvidence.queue_items.find((item) => item.state === "CURRENT").source_item, `${nextQueue}#WQ-NEXT`);
  assert.equal(fs.readFileSync(path.join(root, oldQueue), "utf8"), oldSnapshot);
  assert.ok(fs.existsSync(path.join(root, oldChain.governance)));
});

test("transition validation fails closed when an immutable source snapshot changes", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-wq-transition-stale-"));
  const oldQueue = writeQueue(root, "prior.md", "WQ-OLD", "Prior", "Prior intent.");
  const nextQueue = writeQueue(root, "next.md", "WQ-NEXT", "Next", "Next intent.");
  run(root, "resolve-work-queue-transition.mjs", [
    "--predecessor", `${oldQueue}#WQ-OLD`,
    "--successor", `${nextQueue}#WQ-NEXT`,
    "--sequence", "1",
    "--decision-ref", "user-confirmation:test",
    "--out", "work-queue-transitions/001-prior-to-next.md",
  ]);
  fs.appendFileSync(path.join(root, oldQueue), "\nchanged after transition\n");
  const result = run(root, "check-work-queue-transition.mjs", ["--require-report"], 1);
  assert.match(result.stdout, /predecessor source digest is stale/);
});

test("transition validation rejects a non-positive sequence even with a valid digest", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-wq-transition-sequence-"));
  const oldQueue = writeQueue(root, "prior.md", "WQ-OLD", "Prior", "Prior intent.");
  const nextQueue = writeQueue(root, "next.md", "WQ-NEXT", "Next", "Next intent.");
  const transition = "work-queue-transitions/001-prior-to-next.md";
  run(root, "resolve-work-queue-transition.mjs", [
    "--predecessor", `${oldQueue}#WQ-OLD`,
    "--successor", `${nextQueue}#WQ-NEXT`,
    "--sequence", "1",
    "--decision-ref", "user-confirmation:test",
    "--out", transition,
  ]);

  const file = path.join(root, transition);
  const content = fs.readFileSync(file, "utf8");
  const extracted = extractMachineReadableEvidence(content);
  const evidence = { ...extracted.value, sequence: 0 };
  evidence.transition_digest = evidenceDigest(evidence, ["transition_digest"]);
  fs.writeFileSync(file, content.replace(
    /(## Machine-Readable Evidence\s*\n\s*```json\s*\n)[\s\S]*?(\n```)/,
    `$1${JSON.stringify(evidence, null, 2)}$2`,
  ));

  const result = run(root, "check-work-queue-transition.mjs", ["--require-report"], 1);
  assert.match(result.stdout, /sequence must be a positive integer/);
});
