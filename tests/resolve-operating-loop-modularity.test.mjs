import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const kitRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const entryPath = path.join(kitRoot, "scripts/resolve-operating-loop.mjs");
const moduleRoot = path.join(kitRoot, "scripts/operating-loop");
const moduleFiles = [
  "classification.mjs",
  "decision.mjs",
  "identity.mjs",
  "presentation.mjs",
  "shared.mjs",
  "source-execution.mjs",
  "source-orchestration.mjs",
  "state.mjs",
];

test("resolve-operating-loop keeps a bounded composition entry and cohesive internal modules", async () => {
  const entry = fs.readFileSync(entryPath, "utf8");
  assert.ok(entry.split("\n").length <= 380, "public composition entry must stay below 380 lines");

  for (const file of moduleFiles) {
    const source = fs.readFileSync(path.join(moduleRoot, file), "utf8");
    assert.ok(source.split("\n").length <= 500, `${file} must stay below 500 lines`);
    assert.match(entry, new RegExp(`from "\\./operating-loop/${file.replace(".", "\\.")}"`));
    const loaded = await import(`${pathToFileURL(path.join(moduleRoot, file)).href}?modularity=${Date.now()}-${file}`);
    assert.ok(Object.keys(loaded).length > 0, `${file} must expose an explicit internal contract`);
  }
});

test("operating-loop modules remain Manifest-authoritative distributed assets", () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(kitRoot, "intentos-manifest.json"), "utf8"));
  const workflowVersion = JSON.parse(fs.readFileSync(path.join(kitRoot, "templates/workflow-version.json"), "utf8"));
  const sourceRequired = new Set(manifest.groups.sourceRequired || []);
  const scripts = new Set(manifest.groups.scripts || []);
  const workflowAssets = new Set(workflowVersion.workflowAssets || []);
  const copyRules = new Set((manifest.copyRules?.files || []).map((rule) => `${rule.source}:${rule.target}`));

  for (const file of moduleFiles) {
    const relative = `scripts/operating-loop/${file}`;
    assert.equal(sourceRequired.has(relative), true, `${relative}:sourceRequired`);
    assert.equal(scripts.has(relative), true, `${relative}:scripts`);
    assert.equal(workflowAssets.has(relative), true, `${relative}:workflow-version`);
    assert.equal(copyRules.has(`${relative}:${relative}`), true, `${relative}:copy-rule`);
  }
});

test("operating-loop dependency direction stays acyclic", () => {
  const sources = Object.fromEntries(moduleFiles.map((file) => [file, fs.readFileSync(path.join(moduleRoot, file), "utf8")]));
  assert.doesNotMatch(sources["shared.mjs"], /from "\.\/(?:classification|decision|identity|presentation|source-execution|source-orchestration|state)\.mjs"/);
  assert.doesNotMatch(sources["classification.mjs"], /from "\.\/(?:decision|identity|presentation|source-execution|source-orchestration|state)\.mjs"/);
  assert.doesNotMatch(sources["state.mjs"], /from "\.\/(?:classification|decision|identity|presentation|source-execution|source-orchestration)\.mjs"/);
  assert.doesNotMatch(sources["presentation.mjs"], /from "\.\/(?:decision|identity|source-execution|source-orchestration|state)\.mjs"/);
  assert.doesNotMatch(sources["source-execution.mjs"], /from "\.\/(?:decision|identity|presentation|source-orchestration|state)\.mjs"/);
  assert.doesNotMatch(sources["source-orchestration.mjs"], /from "\.\/(?:decision|identity|presentation|state)\.mjs"/);
  assert.doesNotMatch(sources["decision.mjs"], /from "\.\/(?:identity|source-execution|source-orchestration|state)\.mjs"/);
});
