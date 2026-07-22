import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const kitRoot = path.resolve(testDir, "..");
const entryPath = path.join(kitRoot, "scripts/check-intentos.mjs");
const suiteRoot = path.join(kitRoot, "scripts/self-check");
const suiteFiles = [
  "foundation.mjs",
  "adoption.mjs",
  "evidence.mjs",
  "architecture.mjs",
  "release.mjs",
  "distribution.mjs",
  "generated-project-e2e.mjs",
];
const suiteRunners = [
  "runFoundationChecks",
  "runAdoptionChecks",
  "runEvidenceChecks",
  "runArchitectureChecks",
  "runReleaseChecks",
  "runDistributionChecks",
  "runGeneratedProjectE2ECheck",
];

test("IntentOS self-check keeps one thin entry and explicit domain suites", async () => {
  const entry = fs.readFileSync(entryPath, "utf8");
  assert.ok(entry.split("\n").length <= 40, "self-check entry must remain thin");
  assert.doesNotMatch(entry, /^function\s+check/m);
  const entryCalls = [...entry.matchAll(/^(run[A-Z][A-Za-z0-9_]+)\(\);$/gm)].map((match) => match[1]);
  assert.deepEqual(entryCalls, suiteRunners, "self-check suite order is part of observable behavior");

  const checkNames = [];
  for (const [index, file] of suiteFiles.entries()) {
    const full = path.join(suiteRoot, file);
    assert.equal(fs.existsSync(full), true, file);
    const content = fs.readFileSync(full, "utf8");
    assert.match(content, /import \* as runtime from "\.\/runtime\.mjs";/);
    assert.doesNotMatch(content, /from "\.\/(?:foundation|adoption|evidence|architecture|release|distribution|generated-project-e2e)\.mjs"/, `${file}: domain suites must not depend on each other`);
    const declaredChecks = [...content.matchAll(/^function\s+(check[A-Za-z0-9_]+)\s*\(/gm)].map((match) => match[1]);
    const runnerMatch = content.match(new RegExp(`export function ${suiteRunners[index]}\\(\\) \\{([\\s\\S]*?)\\n\\}`));
    assert.ok(runnerMatch, `${file}: expected ${suiteRunners[index]}`);
    const invokedChecks = [...runnerMatch[1].matchAll(/^\s*(check[A-Za-z0-9_]+)\(\);$/gm)].map((match) => match[1]);
    assert.deepEqual(invokedChecks, declaredChecks, `${file}: declared checks must run once in declaration order`);
    checkNames.push(...declaredChecks);
    const loaded = await import(`${pathToFileURL(full).href}?modularity=${Date.now()}-${file}`);
    assert.equal(Object.keys(loaded).filter((name) => /^run[A-Z].*Checks?$/.test(name)).length, 1, file);
  }

  assert.equal(checkNames.length, 109);
  assert.equal(new Set(checkNames).size, checkNames.length, "domain check names must remain unique");
});

test("IntentOS self-check modules remain Manifest-authoritative source assets", () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(kitRoot, "intentos-manifest.json"), "utf8"));
  const sourceRequired = new Set(manifest.groups.sourceRequired || []);
  const scripts = new Set(manifest.groups.scripts || []);
  for (const file of ["runtime.mjs", ...suiteFiles]) {
    const relative = `scripts/self-check/${file}`;
    assert.equal(sourceRequired.has(relative), true, `${relative}:sourceRequired`);
    assert.equal(scripts.has(relative), true, `${relative}:scripts`);
  }
});
