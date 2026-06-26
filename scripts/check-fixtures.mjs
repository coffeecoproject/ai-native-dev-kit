#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

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

function parseArgs(argv) {
  const parsed = { _: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (!item.startsWith("--")) {
      parsed._.push(item);
      continue;
    }
    const key = item.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      parsed[key] = true;
    } else {
      parsed[key] = next;
      index += 1;
    }
  }
  return parsed;
}

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
  if (!testCase.script) return `${testCase.name} missing script`;
  if (!Array.isArray(testCase.args)) return `${testCase.name} args must be an array`;
  if (!("expectStatus" in testCase)) return `${testCase.name} missing expectStatus`;
  return null;
}

function includesAll(output, expected) {
  return (expected || []).every((needle) => output.includes(needle));
}

function runCase(testCase) {
  const script = String(testCase.script || "");
  const scriptPath = path.join(kitRoot, script);
  const caseArgs = Array.isArray(testCase.args) ? testCase.args.map(String) : [];
  const expectedStatus = testCase.expectStatus ?? 0;
  const name = String(testCase.name || script);
  const command = `node ${[script, ...caseArgs].join(" ")}`;

  if (!script || !fs.existsSync(scriptPath)) {
    return {
      name,
      status: "FAIL",
      reason: `missing fixture script: ${script}`,
      command,
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
      status: "FAIL",
      reason: `expected status ${expectedStatus}, got ${exitCode}`,
      command,
      howToFix: testCase.howToFix,
      stdout,
      stderr,
    };
  }
  if (!stdoutMatches) {
    return {
      name,
      status: "FAIL",
      reason: "stdout missing expected text",
      command,
      howToFix: testCase.howToFix,
      stdout,
      stderr,
    };
  }
  if (!stderrMatches) {
    return {
      name,
      status: "FAIL",
      reason: "stderr missing expected text",
      command,
      howToFix: testCase.howToFix,
      stdout,
      stderr,
    };
  }
  if (!outputMatches) {
    return {
      name,
      status: "FAIL",
      reason: "output missing expected text",
      command,
      howToFix: testCase.howToFix,
      stdout,
      stderr,
    };
  }
  return {
    name,
    status: "PASS",
    exitCode,
    command,
  };
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
    if (!outputJson) console.log(`PASS ${result.name}`);
  } else {
    failed = true;
    if (!outputJson) {
      console.error(`FAIL ${result.name}: ${result.reason}`);
      if (result.command) console.error(`Command: ${result.command}`);
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
  console.log(`Fixture checks passed (${cases.length} case(s)).`);
}
