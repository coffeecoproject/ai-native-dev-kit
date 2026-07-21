import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const kitRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cli = path.join(kitRoot, "scripts/cli.mjs");

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-operating-entry-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return root;
}

function run(cwd, args) {
  return spawnSync(process.execPath, [cli, ...args], {
    cwd,
    encoding: "utf8",
    timeout: 30_000,
    maxBuffer: 32 * 1024 * 1024,
  });
}

test("public work target is resolved relative to the caller instead of the IntentOS checkout", (t) => {
  const parent = fixture(t);
  const caller = path.join(parent, "caller");
  const project = path.join(parent, "project");
  fs.mkdirSync(caller);
  fs.mkdirSync(project);

  const result = run(caller, ["--dry-run", "work", "../project", "检查当前项目"]);
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.match(result.stdout, new RegExp(escapeRegExp(fs.realpathSync(project))));
  assert.doesNotMatch(result.stdout, /ai-native-dev-kit\/\.\.\/project/);
});

test("compatibility finish entry derives the current task and fails closed without completion evidence", (t) => {
  const root = fixture(t);
  const project = path.join(root, "project");
  fs.mkdirSync(project);

  const result = run(root, ["finish", "./project", "--json"]);
  assert.equal(result.status, 2, `${result.stdout}\n${result.stderr}`);
  const report = JSON.parse(result.stdout);
  assert.equal(report.operatingLoop.operation, "FINISH_TASK");
  assert.match(report.operatingLoop.state, /NOT_DONE|BLOCKED_BY_SOURCE_FAILURE/);
  assert.notEqual(report.operatingDecision.actionCode, "REPORT_TASK_COMPLETE");
  assert.equal(report.operatingDecision.materialActionAuthorized, "No");
});

test("human public output leads with the user goal and result rather than internal gates", (t) => {
  const root = fixture(t);
  const project = path.join(root, "project");
  fs.mkdirSync(project);
  const goal = "检查当前任务做到哪里了";

  const result = run(root, ["work", "./project", goal]);
  assert.ok([0, 2].includes(result.status), `${result.stdout}\n${result.stderr}`);
  const goalIndex = result.stdout.indexOf(`我理解的是: ${goal}`);
  const resultIndex = result.stdout.indexOf("结论:");
  const nextIndex = result.stdout.indexOf("下一步:");
  assert.ok(goalIndex >= 0 && resultIndex > goalIndex && nextIndex > resultIndex, result.stdout);
  assert.doesNotMatch(result.stdout, /Schema|checker|subagent|Task Governance|Work Queue/i);
});

test("zero-experience guides expose natural language and work before maintainer diagnostics", () => {
  for (const [relative, maintainerHeading] of [
    ["docs/source-only-adoption.md", "## Maintainer Diagnostics"],
    ["platforms/codex/quickstart.md", "## Maintainer Debugging"],
  ]) {
    const content = fs.readFileSync(path.join(kitRoot, relative), "utf8");
    const splitAt = content.indexOf(maintainerHeading);
    assert.ok(splitAt > 0, `${relative}: missing maintainer boundary`);
    const publicGuidance = content.slice(0, splitAt);
    const maintainerGuidance = content.slice(splitAt);
    assert.match(publicGuidance, /ordinary language|natural language|普通|自然语言|`work`/i, relative);
    assert.match(publicGuidance, /scripts\/cli\.mjs work/, relative);
    for (const command of publicGuidance.match(/^node\s+.+$/gm) || []) {
      assert.match(command, /^node\s+(?:--version|(?:intentos\/)?scripts\/cli\.mjs work\b)/, `${relative}: ${command}`);
    }
    assert.doesNotMatch(publicGuidance, /scripts\/(?:start-project|init-project|workflow-next|check-[^\s`]+)\.mjs|scripts\/cli\.mjs\s+(?:start|next|doctor|baseline)\b/i, relative);
    assert.match(maintainerGuidance, /scripts\/(?:start-project|init-project)|scripts\/cli\.mjs\s+(?:start|next|doctor|baseline)/i, relative);
  }
});

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
