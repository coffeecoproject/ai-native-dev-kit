import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const evidenceDir = path.dirname(fileURLToPath(import.meta.url));
const kitRoot = path.resolve(evidenceDir, "..");
const entryPath = path.join(kitRoot, "scripts/check-intentos.mjs");
const suiteRoot = path.join(kitRoot, "scripts/self-check");
const target = "evidence/114-check-intentos-obligation-evidence.test.mjs";
const domains = [
  ["foundation.mjs", "runFoundationChecks", "verify:universe-33f79b03-expected", "verify:universe-33f79b03-negative"],
  ["adoption.mjs", "runAdoptionChecks", "verify:universe-06f53a6d-expected", "verify:universe-06f53a6d-negative"],
  ["evidence.mjs", "runEvidenceChecks", "verify:universe-6bce3aca-expected", "verify:universe-6bce3aca-negative"],
  ["architecture.mjs", "runArchitectureChecks", "verify:universe-267360df-expected", "verify:universe-267360df-negative"],
  ["release.mjs", "runReleaseChecks", "verify:universe-7e157cbe-expected", "verify:universe-7e157cbe-negative"],
  ["distribution.mjs", "runDistributionChecks", "verify:universe-4c6a26a6-expected", "verify:universe-4c6a26a6-negative"],
  ["generated-project-e2e.mjs", "runGeneratedProjectE2ECheck", "verify:universe-f256ee46-expected", "verify:universe-f256ee46-negative"],
  ["runtime.mjs", "hasFailed", "verify:universe-ad616f84-expected", "verify:universe-ad616f84-negative"],
];

const entry = fs.readFileSync(entryPath, "utf8");
const expectedRunners = domains.slice(0, 7).map(([, runner]) => runner);

function entryCalls(source) {
  return [...source.matchAll(/^(run[A-Z][A-Za-z0-9_]+)\(\);$/gm)].map((match) => match[1]);
}

function assertExactOrder(calls) {
  assert.deepEqual(calls, expectedRunners);
}

for (const [index, [file, runner, expectedId, negativeId]] of domains.slice(0, 7).entries()) {
  test(`[${expectedId}] ${target} :: ${file} remains present at its exact unified-entry position`, () => {
    const source = fs.readFileSync(path.join(suiteRoot, file), "utf8");
    assert.equal(entryCalls(entry)[index], runner);
    assert.match(source, new RegExp(`export function ${runner}\\(\\)`));
    const declared = [...source.matchAll(/^function\s+(check[A-Za-z0-9_]+)\s*\(/gm)].map((match) => match[1]);
    const body = source.match(new RegExp(`export function ${runner}\\(\\) \\{([\\s\\S]*?)\\n\\}`))?.[1] || "";
    const invoked = [...body.matchAll(/^\s*(check[A-Za-z0-9_]+)\(\);$/gm)].map((match) => match[1]);
    assert.deepEqual(invoked, declared);
  });

  test(`[${negativeId}] ${target} :: omitting ${runner} is rejected by the exact-order contract`, () => {
    const mutated = entryCalls(entry).filter((name) => name !== runner);
    assert.throws(() => assertExactOrder(mutated), assert.AssertionError);
  });
}

test("[verify:universe-ad616f84-expected] evidence/114-check-intentos-obligation-evidence.test.mjs :: shared runtime exposes the one fail-closed state consumed by the entry", () => {
  const runtime = fs.readFileSync(path.join(suiteRoot, "runtime.mjs"), "utf8");
  assert.match(runtime, /export let failed = false;/);
  assert.match(runtime, /export function fail\(message\)[\s\S]*?failed = true;/);
  assert.match(runtime, /export function hasFailed\(\)[\s\S]*?return failed;/);
  assert.match(entry, /if \(hasFailed\(\)\) \{\s*process\.exit\(1\);\s*\}/);
});

test("[verify:universe-ad616f84-negative] evidence/114-check-intentos-obligation-evidence.test.mjs :: a recorded suite failure produces a non-zero shared exit decision", () => {
  const runtimeUrl = new URL("../scripts/self-check/runtime.mjs", import.meta.url).href;
  const probe = spawnSync(process.execPath, [
    "--input-type=module",
    "--eval",
    `import { fail, hasFailed } from ${JSON.stringify(runtimeUrl)}; fail("obligation probe"); process.exit(hasFailed() ? 1 : 0);`,
  ], { cwd: kitRoot, encoding: "utf8" });
  assert.equal(probe.status, 1, probe.stderr || probe.stdout);
  assert.match(probe.stderr, /FAIL obligation probe/);
});

test("[verify:universe-a8dfc71b-expected] evidence/114-check-intentos-obligation-evidence.test.mjs :: the complete unified candidate verification passed through all ordered suites", () => {
  const log = fs.readFileSync(path.join(evidenceDir, "114-check-intentos-full-verification.log"), "utf8");
  assert.match(log, /IntentOS self-check passed\./);
  assertExactOrder(entryCalls(entry));
});

test("[verify:universe-a8dfc71b-negative] evidence/114-check-intentos-obligation-evidence.test.mjs :: omission duplication and reordering all fail the unified order contract", () => {
  const calls = entryCalls(entry);
  assert.throws(() => assertExactOrder(calls.slice(1)), assert.AssertionError);
  assert.throws(() => assertExactOrder([...calls, calls[0]]), assert.AssertionError);
  assert.throws(() => assertExactOrder([calls[1], calls[0], ...calls.slice(2)]), assert.AssertionError);
});

test("[verify:release-impact-release-smoke-check-release-rollback-monitoring-o] evidence/114-check-intentos-obligation-evidence.test.mjs :: candidate remains local and does not modify hosted release automation", () => {
  const diff = spawnSync("git", ["diff", "--cached", "--name-only", "--diff-filter=ACDMRTUXB"], {
    cwd: kitRoot,
    encoding: "utf8",
  });
  assert.equal(diff.status, 0, diff.stderr);
  const paths = diff.stdout.trim().split(/\r?\n/).filter(Boolean);
  assert.equal(paths.some((name) => name.startsWith(".github/workflows/")), false);
  assert.equal(paths.some((name) => /(?:deploy|production|release-approval)/i.test(name)), false);
  assert.equal(paths.includes("scripts/check-intentos.mjs"), true);
  assert.equal(paths.some((name) => name.startsWith("scripts/self-check/")), true);
});
