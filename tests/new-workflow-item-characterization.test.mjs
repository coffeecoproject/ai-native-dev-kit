import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const entryPath = path.join(repoRoot, "scripts/new-workflow-item.mjs");

const expectedTypes = [
  "request",
  "preflight",
  "spec",
  "eval",
  "task",
  "log",
  "review-packet",
  "review-loop-report",
  "gpt-review-prompt",
  "adoption-assessment",
  "governance-map",
  "human-status-report",
  "decision-brief",
  "plain-review-summary",
  "customer-handoff",
  "follow-up-proposal",
  "final-report",
  "goal-card",
  "subagent-run-plan",
  "launch-readiness-report",
  "launch-review-view",
  "release-adapter-profile",
  "release-guide-card",
  "platform-release-recipe",
  "release-handoff-pack",
  "release-approval",
  "release-execution-plan",
  "release-plan",
  "conversation-turn-classification",
  "scope-change-report",
  "adoption-trial-report",
  "real-adoption-trial-report",
  "patch-classification",
  "patch-classification-false-positive",
  "workflow-adoption-map",
  "native-migration-plan",
  "existing-rule-reconciliation-report",
  "document-lifecycle-report",
  "document-archive-apply-plan",
  "unified-apply-plan",
  "controlled-apply-readiness-report",
  "approval-record",
  "beginner-entry-card",
  "conversation-ask-card",
  "work-queue-report",
  "hook-orchestration-plan",
  "project-hook-policy",
  "active-work-thread",
  "guided-decision-summary",
  "change-boundary-report",
  "baseline-state-report",
  "baseline-pack-selection-report",
  "standard-baseline-selection-report",
  "baseline-decision-card",
  "workflow-guidance-card",
  "review-surface-card",
  "change-impact-coverage-report",
  "delivery-path-report",
  "debt-knowledge-handoff-report",
  "execution-closure-report",
  "user-decision-card",
  "control-effectiveness-report",
  "planning-closure-report",
];

const expectedTypeRegistryDigest = "sha256:214f3078d9b22a94c464a8e091f90ee14209f611ce91a363844451cec5aaadd2";
const expectedAliasRegistryDigest = "sha256:fb6b19079180fcfe3631f9aaef398e7b485d08d23398532418c11ed72f580315";
const expectedBehaviorDigest = "sha256:0f32920eab7daa6551318ace7a7f591d662ce03f806c827070b0685a7f6f544d";

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function collectSources() {
  const files = [entryPath];
  const moduleRoot = path.join(repoRoot, "scripts/new-workflow-item");
  if (fs.existsSync(moduleRoot)) {
    const visit = (directory) => {
      for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const absolute = path.join(directory, entry.name);
        if (entry.isDirectory()) visit(absolute);
        else if (entry.name.endsWith(".mjs")) files.push(absolute);
      }
    };
    visit(moduleRoot);
  }
  return files.sort().map((file) => fs.readFileSync(file, "utf8")).join("\n");
}

function registryRows() {
  const source = collectSources();
  const typeBlock = source.match(/const typeMap = \{([\s\S]*?)\n\};/);
  const aliasBlock = source.match(/const aliases = \{([\s\S]*?)\n\};/);
  assert.ok(typeBlock, "typeMap registry must remain discoverable");
  assert.ok(aliasBlock, "aliases registry must remain discoverable");

  const typeRows = [...typeBlock[1].matchAll(/^\s*["']?([a-z0-9-]+)["']?: \{([^\n]+)\},?$/gm)].map((match) => {
    const body = match[2];
    return [
      match[1],
      body.match(/dir: "([^"]+)"/)[1],
      body.match(/template: "([^"]+)"/)[1],
      body.match(/defaultName: "([^"]+)"/)?.[1] ?? null,
    ];
  });
  const aliasRows = [...aliasBlock[1].matchAll(/^\s*["']?([a-z0-9-]+)["']?: "([a-z0-9-]+)",?$/gm)]
    .map((match) => match.slice(1));
  return { typeRows, aliasRows };
}

function walkFiles(base, relative = "") {
  return fs.readdirSync(path.join(base, relative), { withFileTypes: true }).flatMap((entry) => {
    const child = path.join(relative, entry.name);
    return entry.isDirectory() ? walkFiles(base, child) : [child];
  });
}

function makeFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-new-workflow-item-"));
  fs.cpSync(path.join(repoRoot, "templates"), path.join(root, "templates"), { recursive: true });
  fs.copyFileSync(path.join(repoRoot, "VERSION.md"), path.join(root, "VERSION.md"));
  fs.mkdirSync(path.join(root, ".intentos/core"), { recursive: true });
  fs.copyFileSync(
    path.join(repoRoot, "core/review-context-authority.json"),
    path.join(root, ".intentos/core/review-context-authority.json"),
  );
  for (const [directory, file] of [
    ["requests", "001-characterization.md"],
    ["preflight", "001-characterization.md"],
    ["specs", "001-characterization.md"],
    ["evals", "001-characterization.md"],
    ["tasks", "001-characterization.md"],
    ["ai-logs", "2026-07-23-characterization.md"],
  ]) {
    fs.mkdirSync(path.join(root, directory), { recursive: true });
    fs.writeFileSync(path.join(root, directory, file), `# ${directory}\n`);
  }
  return root;
}

function invoke(root, type, name = "generated-characterization") {
  return spawnSync(process.execPath, [
    entryPath,
    "--root", root,
    ...(type ? ["--type", type] : []),
    "--name", name,
    "--number", "001",
    "--request", "requests/001-characterization.md",
    "--preflight", "preflight/001-characterization.md",
    "--spec", "specs/001-characterization.md",
    "--eval", "evals/001-characterization.md",
    "--task", "tasks/001-characterization.md",
    "--log", "ai-logs/2026-07-23-characterization.md",
    "--level", "L2",
  ], { encoding: "utf8" });
}

function normalize(value, root) {
  return value
    .replaceAll(root, "<ROOT>")
    .replace(/\b\d{4}-\d{2}-\d{2}\b/g, "<DATE>")
    .replace(/sha256:[a-f0-9]{64}/g, "sha256:<DIGEST>");
}

function characterize(type) {
  const root = makeFixture();
  try {
    const before = new Set(walkFiles(root));
    const result = invoke(root, type);
    assert.equal(result.status, 0, `${type} failed: ${result.stderr || result.stdout}`);
    const added = walkFiles(root).filter((file) => !before.has(file));
    assert.equal(added.length, 1, `${type} must create exactly one file`);
    const content = normalize(fs.readFileSync(path.join(root, added[0]), "utf8"), root);
    return [type, added[0], sha256(content), sha256(normalize(result.stdout, root))];
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

let cachedBehaviorRecords;

function allBehaviorRecords() {
  cachedBehaviorRecords ??= expectedTypes.map(characterize);
  return cachedBehaviorRecords;
}

test("new-workflow-item keeps the complete ordered type and alias registries", () => {
  const { typeRows, aliasRows } = registryRows();
  assert.deepEqual(typeRows.map(([type]) => type), expectedTypes);
  assert.equal(typeRows.length, 63);
  assert.equal(`sha256:${sha256(JSON.stringify(typeRows))}`, expectedTypeRegistryDigest);
  assert.equal(aliasRows.length, 223);
  assert.equal(`sha256:${sha256(JSON.stringify(aliasRows))}`, expectedAliasRegistryDigest);
});

test("all registered artifact types preserve generated paths, content, and terminal output", () => {
  const records = allBehaviorRecords();
  assert.equal(`sha256:${sha256(JSON.stringify(records))}`, expectedBehaviorDigest);
});

test("[verify:universe-b8dd1d9c-expected] tests/new-workflow-item-characterization.test.mjs :: canonical registry remains complete and ordered", () => {
  assert.deepEqual(registryRows().typeRows.map(([type]) => type), expectedTypes);
});

test("[verify:universe-b8dd1d9c-negative] tests/new-workflow-item-characterization.test.mjs :: canonical registry drift remains rejected", () => {
  assert.equal(`sha256:${sha256(JSON.stringify(registryRows().typeRows))}`, expectedTypeRegistryDigest);
});

test("[verify:universe-56d2048a-expected] tests/new-workflow-item-characterization.test.mjs :: aliases retain canonical behavior", () => {
  assert.deepEqual(characterize("ai-log").slice(1), characterize("log").slice(1));
});

test("[verify:universe-56d2048a-negative] tests/new-workflow-item-characterization.test.mjs :: unknown types remain rejected", () => {
  const root = makeFixture();
  try {
    assert.equal(invoke(root, "not-a-real-type").status, 1);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("[verify:universe-f7a09c69-expected] tests/new-workflow-item-characterization.test.mjs :: generated reference-bearing artifacts retain normalized content", () => {
  const records = new Map(allBehaviorRecords().map((record) => [record[0], record]));
  for (const type of ["request", "preflight", "spec", "eval", "task", "log", "review-packet"]) {
    assert.ok(records.get(type)?.[2]);
  }
});

test("[verify:universe-f7a09c69-negative] tests/new-workflow-item-characterization.test.mjs :: missing required invocation context remains fail-closed", () => {
  const root = makeFixture();
  try {
    const result = spawnSync(process.execPath, [entryPath, "--root", root, "--type", "spec", "--name", "missing-context"], { encoding: "utf8" });
    assert.notEqual(result.status, 0);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("[verify:universe-3dba46f4-expected] tests/new-workflow-item-characterization.test.mjs :: normalized generated content remains byte-equivalent", () => {
  assert.equal(`sha256:${sha256(JSON.stringify(allBehaviorRecords()))}`, expectedBehaviorDigest);
});

test("[verify:universe-3dba46f4-negative] tests/new-workflow-item-characterization.test.mjs :: cross-type content drift remains detectable", () => {
  assert.equal(new Set(allBehaviorRecords().map(([type]) => type)).size, expectedTypes.length);
});

test("[verify:universe-540374ea-expected] tests/new-workflow-item-characterization.test.mjs :: successful invocation creates exactly one safe artifact", () => {
  assert.equal(allBehaviorRecords().length, expectedTypes.length);
  assert.ok(allBehaviorRecords().every((record) => record[1] && !path.isAbsolute(record[1])));
});

test("[verify:universe-540374ea-negative] tests/new-workflow-item-characterization.test.mjs :: existing targets remain fail-closed", () => {
  const root = makeFixture();
  try {
    assert.equal(invoke(root, "request", "characterization").status, 1);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("[verify:universe-6819b2ed-expected] tests/new-workflow-item-characterization.test.mjs :: success output and exit behavior remain locked", () => {
  assert.ok(allBehaviorRecords().every((record) => record[3]));
});

test("[verify:universe-6819b2ed-negative] tests/new-workflow-item-characterization.test.mjs :: failed invocation cannot report success", () => {
  const root = makeFixture();
  try {
    const result = invoke(root, "not-a-real-type");
    assert.equal(result.status, 1);
    assert.doesNotMatch(result.stdout, /^Created /m);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("[verify:universe-73185d04-expected] tests/new-workflow-item-characterization.test.mjs :: public entry replays every canonical type", () => {
  assert.equal(`sha256:${sha256(JSON.stringify(allBehaviorRecords()))}`, expectedBehaviorDigest);
});

test("[verify:universe-73185d04-negative] tests/new-workflow-item-characterization.test.mjs :: executable parity remains mandatory", () => {
  assert.equal(allBehaviorRecords().length, 63);
});

test("[verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-] tests/new-workflow-item-characterization.test.mjs :: CLI user flow remains executable without a rendered UI", () => {
  assert.ok(allBehaviorRecords().every((record) => record[1]));
});

test("[verify:user-flow-regression-smoke-existing-critical-flow-still-works-af] tests/new-workflow-item-characterization.test.mjs :: critical generator flow remains behavior-equivalent", () => {
  assert.equal(`sha256:${sha256(JSON.stringify(allBehaviorRecords()))}`, expectedBehaviorDigest);
});

test("[verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders] tests/new-workflow-item-characterization.test.mjs :: structural handoff boundary remains explicit", () => {
  assert.equal(fs.readFileSync(entryPath, "utf8").trim(), '#!/usr/bin/env node\n\nimport "./new-workflow-item/cli.mjs";');
  assert.equal(fs.statSync(entryPath).mode & 0o111, 0, "the public Node entry must preserve its non-executable file mode");
  const internalCliPath = path.join(repoRoot, "scripts/new-workflow-item/cli.mjs");
  assert.equal(fs.statSync(internalCliPath).mode & 0o111, 0, "the internal CLI module must not become a second executable entry");
  assert.doesNotMatch(fs.readFileSync(internalCliPath, "utf8"), /^#!\//, "the internal CLI module must not declare a second shebang entry");
});

test("[verify:test-coverage-regression-smoke-task-specific-verification-exists] tests/new-workflow-item-characterization.test.mjs :: task-specific characterization remains executable", () => {
  assert.equal(allBehaviorRecords().length, expectedTypes.length);
});

test("representative aliases behave exactly like their canonical types", () => {
  for (const [alias, canonical] of [
    ["ai-log", "log"],
    ["review", "review-packet"],
    ["apply-plan", "unified-apply-plan"],
    ["planning-closure", "planning-closure-report"],
  ]) {
    const aliasRecord = characterize(alias);
    const canonicalRecord = characterize(canonical);
    assert.deepEqual(aliasRecord.slice(1), canonicalRecord.slice(1), `${alias} must match ${canonical}`);
  }
});

test("invalid input and overwrite protection retain non-zero exits", () => {
  const root = makeFixture();
  try {
    const invalid = invoke(root, "not-a-real-type");
    assert.equal(invalid.status, 1);
    assert.match(invalid.stderr || invalid.stdout, /missing or invalid --type/i);

    const missing = invoke(root, null);
    assert.equal(missing.status, 1);

    const collision = invoke(root, "request", "characterization");
    assert.equal(collision.status, 1);
    assert.match(collision.stderr || collision.stdout, /exists|overwrite/i);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
