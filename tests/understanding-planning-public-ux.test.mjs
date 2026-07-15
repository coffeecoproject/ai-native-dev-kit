import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");

test("1.111 public contract keeps technical decisions inside IntentOS", () => {
  const content = [
    "core/understanding-planning-closure.md",
    "docs/understanding-planning-closure.md",
    "prompts/planning-closure-agent.md",
  ].map((file) => fs.readFileSync(path.join(root, file), "utf8")).join("\n");
  assert.match(content, /user states the goal|describe the desired result/i);
  assert.match(content, /does not authorize\s+implementation/i);
  assert.doesNotMatch(content, /user (?:must|should) (?:choose|select|approve) (?:the )?(?:architecture|risk tier|workflow|test tool|reviewer|baseline)/i);
});

test("1.111 stays behind the existing public work entry", () => {
  const cli = fs.readFileSync(path.join(root, "scripts/cli.mjs"), "utf8");
  const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
  assert.match(cli, /planning-closure/);
  assert.match(readme, /ordinary user|普通用户|natural language/i);
  assert.doesNotMatch(readme, /ordinary users? must run .*planning-closure/i);
});
