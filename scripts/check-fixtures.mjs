#!/usr/bin/env node

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseArgs } from "./lib/args.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const kitRoot = path.resolve(__dirname, "..");
const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["case", "json"]);

for (const key of Object.keys(args)) {
  if (key !== "_" && !knownFlags.has(key)) {
    console.error(`FAIL unknown option: --${key}`);
    process.exit(1);
  }
}

const casesPath = path.join(kitRoot, "test-fixtures", "fixture-cases.json");
const selectedCase = args.case ? String(args.case) : null;
const outputJson = Boolean(args.json);
let failed = false;
const results = [];
const allowedCaseTypes = new Set(["golden", "bad", "migration", "cli", "init-update", "output-quality"]);

function loadCases() {
  if (!fs.existsSync(casesPath)) {
    console.error("FAIL missing test-fixtures/fixture-cases.json");
    process.exit(1);
  }
  const parsed = JSON.parse(fs.readFileSync(casesPath, "utf8"));
  if (!Array.isArray(parsed)) {
    console.error("FAIL fixture-cases.json must contain an array");
    process.exit(1);
  }
  return parsed;
}

function validateCase(testCase, index) {
  const label = `fixture case #${index + 1}`;
  if (!testCase || typeof testCase !== "object" || Array.isArray(testCase)) {
    return `${label} must be an object`;
  }
  if (!testCase.name) return `${label} missing name`;
  if (!testCase.type) return `${testCase.name} missing type`;
  if (!allowedCaseTypes.has(testCase.type)) return `${testCase.name} has invalid type: ${testCase.type}`;
  if (!testCase.checker) return `${testCase.name} missing checker`;
  if (!testCase.script) return `${testCase.name} missing script`;
  if (!Array.isArray(testCase.args)) return `${testCase.name} args must be an array`;
  if (!("expectStatus" in testCase)) return `${testCase.name} missing expectStatus`;
  if (!testCase.howToFix) return `${testCase.name} missing howToFix`;
  if (testCase.setup && typeof testCase.setup !== "object") return `${testCase.name} setup must be an object`;
  return null;
}

function includesAll(output, expected) {
  return (expected || []).every((needle) => output.includes(needle));
}

function createRunContext(testCase) {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-fixture-"));
  const context = {
    tempRoot,
    manifest: path.join(tempRoot, "intentos-manifest.mismatch.json"),
    project: path.join(tempRoot, "project"),
  };
  const setup = testCase.setup || {};
  if (setup.manifestVersionMismatch) {
    const manifestPath = path.join(kitRoot, "intentos-manifest.json");
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    manifest.intentOSVersion = setup.manifestVersionMismatch.version || "0.0.0";
    if (manifest.compatibilityPolicy) {
      manifest.compatibilityPolicy.phase = manifest.intentOSVersion;
    }
    fs.writeFileSync(context.manifest, `${JSON.stringify(manifest, null, 2)}\n`);
  }
  if (setup.generatedProject) {
    const options = typeof setup.generatedProject === "object" ? setup.generatedProject : {};
    const starter = options.starter || "generic-project";
    const setupResult = spawnSync(process.execPath, [
      path.join(kitRoot, "scripts/init-project.mjs"),
      "--starter",
      starter,
      "--target",
      context.project,
      ...(Array.isArray(options.args) ? options.args.map(String) : []),
    ], {
      cwd: kitRoot,
      encoding: "utf8",
    });
    context.setupCommand = `node scripts/init-project.mjs --starter ${starter} --target {project}`;
    context.setupStdout = setupResult.stdout || "";
    context.setupStderr = setupResult.stderr || "";
    context.setupStatus = setupResult.status ?? 1;
    if (context.setupStatus !== 0) {
      context.setupFailed = true;
    }
  }
  return context;
}

function substitute(value, context) {
  return String(value)
    .replaceAll("{project}", context.project)
    .replaceAll("{manifest}", context.manifest)
    .replaceAll("{tmp}", context.tempRoot)
    .replaceAll("{kit}", kitRoot);
}

function fixtureCommand(script, args) {
  return `node ${[script, ...args].join(" ")}`;
}

function expectedOutput(testCase) {
  const parts = [];
  if (testCase.expectStatus !== undefined) parts.push(`status=${testCase.expectStatus}`);
  for (const value of testCase.expectStdoutIncludes || []) parts.push(`stdout includes: ${value}`);
  for (const value of testCase.expectStderrIncludes || []) parts.push(`stderr includes: ${value}`);
  for (const value of testCase.expectOutputIncludes || []) parts.push(`output includes: ${value}`);
  return parts.join("; ");
}

function runCase(testCase) {
  const context = createRunContext(testCase);
  const script = String(testCase.script || "");
  const scriptPath = path.join(kitRoot, script);
  const caseArgs = Array.isArray(testCase.args) ? testCase.args.map((item) => substitute(item, context)) : [];
  const expectedStatus = testCase.expectStatus ?? 0;
  const name = String(testCase.name || script);
  const command = fixtureCommand(script, caseArgs);
  const expectation = expectedOutput(testCase);

  try {
    if (context.setupFailed) {
      return {
        name,
        type: testCase.type,
        checker: testCase.checker,
        status: "FAIL",
        reason: `setup failed with status ${context.setupStatus}`,
        command,
        expected: expectation,
        actual: `${context.setupStdout}\n${context.setupStderr}`.trim(),
        howToFix: testCase.howToFix || "Fix fixture setup before checking the case command.",
      };
    }

    if (!script || !fs.existsSync(scriptPath)) {
      return {
        name,
        type: testCase.type,
        checker: testCase.checker,
        status: "FAIL",
        reason: `missing fixture script: ${script}`,
        command,
        expected: expectation,
        howToFix: testCase.howToFix || "Check the script path in test-fixtures/fixture-cases.json.",
      };
    }

    const result = spawnSync(process.execPath, [scriptPath, ...caseArgs], {
      cwd: kitRoot,
      encoding: "utf8",
    });
    const stdout = result.stdout || "";
    const stderr = result.stderr || "";
    const combined = `${stdout}\n${stderr}`;
    const exitCode = result.status ?? 1;
    const statusMatches = expectedStatus === "nonzero" ? exitCode !== 0 : exitCode === Number(expectedStatus);
    const stdoutMatches = includesAll(stdout, testCase.expectStdoutIncludes);
    const stderrMatches = includesAll(stderr, testCase.expectStderrIncludes);
    const outputMatches = includesAll(combined, testCase.expectOutputIncludes);

    if (!statusMatches) {
      return {
        name,
        type: testCase.type,
        checker: testCase.checker,
        status: "FAIL",
        reason: `expected status ${expectedStatus}, got ${exitCode}`,
        command,
        expected: expectation,
        actual: combined.trim(),
        howToFix: testCase.howToFix,
        stdout,
        stderr,
      };
    }
    if (!stdoutMatches) {
      return {
        name,
        type: testCase.type,
        checker: testCase.checker,
        status: "FAIL",
        reason: "stdout missing expected text",
        command,
        expected: expectation,
        actual: combined.trim(),
        howToFix: testCase.howToFix,
        stdout,
        stderr,
      };
    }
    if (!stderrMatches) {
      return {
        name,
        type: testCase.type,
        checker: testCase.checker,
        status: "FAIL",
        reason: "stderr missing expected text",
        command,
        expected: expectation,
        actual: combined.trim(),
        howToFix: testCase.howToFix,
        stdout,
        stderr,
      };
    }
    if (!outputMatches) {
      return {
        name,
        type: testCase.type,
        checker: testCase.checker,
        status: "FAIL",
        reason: "output missing expected text",
        command,
        expected: expectation,
        actual: combined.trim(),
        howToFix: testCase.howToFix,
        stdout,
        stderr,
      };
    }
    return {
      name,
      type: testCase.type,
      checker: testCase.checker,
      status: "PASS",
      exitCode,
      command,
      expected: expectation,
      stdout,
      stderr,
    };
  } finally {
    fs.rmSync(context.tempRoot, { recursive: true, force: true });
  }
}

function groupedCounts(items, key) {
  const counts = new Map();
  for (const item of items) {
    const label = item[key] || "unknown";
    counts.set(label, (counts.get(label) || 0) + 1);
  }
  return [...counts.entries()].sort(([left], [right]) => left.localeCompare(right));
}

let cases = loadCases();
for (const [index, testCase] of cases.entries()) {
  const validationError = validateCase(testCase, index);
  if (validationError) {
    console.error(`FAIL ${validationError}`);
    process.exit(1);
  }
}
if (selectedCase) {
  cases = cases.filter((testCase) => String(testCase.name || "") === selectedCase);
  if (cases.length === 0) {
    console.error(`FAIL fixture case not found: ${selectedCase}`);
    process.exit(1);
  }
}

for (const testCase of cases) {
  const result = runCase(testCase);
  results.push(result);
  if (result.status === "PASS") {
    if (!outputJson) console.log(`PASS [${result.type}/${result.checker}] ${result.name}`);
  } else {
    failed = true;
    if (!outputJson) {
      console.error(`FAIL ${result.name}: ${result.reason}`);
      if (result.command) console.error(`Command: ${result.command}`);
      if (result.expected) console.error(`Expected: ${result.expected}`);
      if (result.actual) console.error(`Actual: ${result.actual}`);
      if (result.howToFix) console.error(`How to fix: ${result.howToFix}`);
      if (result.stdout) console.error(result.stdout.trim());
      if (result.stderr) console.error(result.stderr.trim());
    }
  }
}

if (outputJson) {
  console.log(JSON.stringify({
    status: failed ? "FAIL" : "PASS",
    caseCount: cases.length,
    summary: {
      byType: Object.fromEntries(groupedCounts(results, "type")),
      byChecker: Object.fromEntries(groupedCounts(results, "checker")),
    },
    results,
  }, null, 2));
}

if (failed) {
  if (outputJson) process.exit(1);
  console.error("");
  console.error("Human Summary");
  console.error("One or more governance fixture checks failed. This means either a golden example no longer follows the protocol, or a bad fixture is no longer rejected for the expected reason.");
  console.error("");
  console.error("What failed");
  for (const result of results.filter((item) => item.status === "FAIL")) {
    console.error(`- ${result.name}: ${result.reason}`);
  }
  console.error("");
  console.error("How to fix");
  for (const result of results.filter((item) => item.status === "FAIL")) {
    console.error(`- ${result.name}: ${result.howToFix || "Run the listed command and update either the fixture or the checker expectation."}`);
  }
  process.exit(1);
}

if (!outputJson) {
  console.log("");
  console.log("Human Summary");
  console.log("Fixture matrix passed. Golden, bad, migration, CLI/init-update, and output-quality cases matched their expected behavior.");
  console.log("");
  console.log("Coverage by type");
  for (const [type, count] of groupedCounts(results, "type")) console.log(`- ${type}: ${count}`);
  console.log("");
  console.log("Coverage by checker");
  for (const [checker, count] of groupedCounts(results, "checker")) console.log(`- ${checker}: ${count}`);
  console.log("");
  console.log("");
  console.log(`Fixture checks passed (${cases.length} case(s)).`);
}
