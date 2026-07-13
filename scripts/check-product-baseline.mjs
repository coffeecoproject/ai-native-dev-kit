#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { sectionBody } from "./lib/markdown.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["json"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputJson = Boolean(args.json);
const isSourceRepo = fs.existsSync(path.join(projectRoot, "intentos-manifest.json"))
  && fs.existsSync(path.join(projectRoot, "core", "workflow.md"));

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

const requiredFiles = [
  "core/outcome-baseline.md",
  "core/product-baseline.md",
  "core/claim-control.md",
  "core/assumption-register.md",
  "templates/product-baseline-review.md",
  "templates/claim-control-report.md",
  "templates/assumption-register.md",
  "checklists/product-baseline-review.md",
  "checklists/claim-control-review.md",
  "prompts/product-baseline-agent.md",
  "prompts/claim-control-agent.md",
  "docs/guided-delivery-baseline.md",
  "docs/product-baseline.md",
  "docs/claim-control.md",
  "scripts/check-claim-control.mjs",
];

const contentMarkers = {
  "core/outcome-baseline.md": [
    "IntentOS/Codex owns technical judgment",
    "The zero-experience solo user supplies",
    "AI may",
    "Delivery does not authorize production",
  ],
  "core/product-baseline.md": [
    "Reports are not approvals",
    "Simulated evidence is not production evidence",
    "Industrial packs are selected-only",
    "Existing project writes are plan-first",
    "Allowed Claims",
    "Forbidden Claims",
    "Evidence Status",
    "Known Limitations",
  ],
  "core/claim-control.md": [
    "Claims must match evidence",
    "Forbidden Claims",
    "production proven",
    "report approved release",
  ],
  "core/assumption-register.md": [
    "must not become an approved engineering or environment baseline rule",
    "User input class",
    "PENDING_CONFIRMATION",
  ],
  "templates/final-report.md": [
    "This report does not approve",
    "Assumption Register",
  ],
  "templates/product-baseline-review.md": [
    "Outcome Alignment",
    "Assumption Register",
  ],
  "templates/claim-control-report.md": [
    "Allowed Claims",
    "Forbidden Claims",
    "Evidence Status",
  ],
};

let failed = false;
const checks = [];

if (!outputJson) {
  console.log("# Product Baseline Check");
  console.log("");
}

for (const file of requiredFiles) {
  const resolved = resolveAsset(file);
  if (resolved) pass(`${displayAsset(file, resolved)} exists`);
  else fail(`missing ${file}`);
}

for (const [file, markers] of Object.entries(contentMarkers)) {
  const resolved = resolveAsset(file);
  if (!resolved) continue;
  const content = fs.readFileSync(resolved, "utf8");
  for (const marker of markers) {
    if (content.includes(marker)) pass(`${displayAsset(file, resolved)} includes ${marker}`);
    else fail(`${displayAsset(file, resolved)} missing ${marker}`);
  }
}

if (isSourceRepo) {
  checkReleaseRecord();
  checkWorkflowArtifacts();
} else {
  pass("source-only guided delivery release and workflow artifact checks skipped for target project");
}
runClaimControl();

emitAndExit();

function checkReleaseRecord() {
  const version = currentVersion();
  const releaseRecord = version ? `releases/${version}/release-record.md` : null;
  if (!releaseRecord || !exists(releaseRecord)) {
    fail("current release record is missing");
    return;
  }
  const content = read(releaseRecord);
  for (const section of ["Allowed Claims", "Forbidden Claims", "Evidence Status", "Known Limitations", "Verification"]) {
    const body = sectionBody(content, section);
    if (body && meaningfulSectionBody(body)) pass(`${releaseRecord} includes meaningful ${section}`);
    else fail(`${releaseRecord} missing meaningful ${section}`);
  }
}

function meaningfulSectionBody(body) {
  const normalized = String(body || "")
    .replace(/```[a-zA-Z0-9_-]*\n?/g, "")
    .replace(/\[[^\]]+\]\([^)]+\)/g, "")
    .replace(/[#>*_`|:\-\s]/g, "");
  return normalized.length >= 20;
}

function checkWorkflowArtifacts() {
  for (const file of [
    "tasks/130-guided-delivery-baseline.md",
    "goal-cards/130-guided-delivery-baseline.md",
    "subagent-run-plans/130-guided-delivery-baseline.md",
    "review-loop-reports/130-guided-delivery-baseline.md",
    "final-reports/130-guided-delivery-baseline.md",
  ]) {
    if (exists(file)) pass(`${file} exists`);
    else fail(`missing ${file}`);
  }

  if (exists("subagent-run-plans/130-guided-delivery-baseline.md")) {
    const content = read("subagent-run-plans/130-guided-delivery-baseline.md");
    if (/Many readers, one writer/i.test(content)) pass("1.3 subagent plan keeps many readers / one writer");
    else fail("1.3 subagent plan must state Many readers, one writer");
    if (!/\|\s*RUNNING\s*\|/i.test(content) && /\b(CLOSED|SKIPPED)\b/i.test(content)) {
      pass("1.3 subagent plan has no running subagents");
    } else {
      fail("1.3 subagent plan must close or skip every subagent");
    }
  }

  if (exists("final-reports/130-guided-delivery-baseline.md")) {
    const content = read("final-reports/130-guided-delivery-baseline.md");
    if (/does not approve release, risk, scope expansion, or future work/i.test(content)) {
      pass("1.3 final report keeps approval boundary");
    } else {
      fail("1.3 final report must state that it does not approve release, risk, scope expansion, or future work");
    }
    if (/Assumption Register/i.test(content)) pass("1.3 final report includes Assumption Register");
    else fail("1.3 final report missing Assumption Register");
  }
}

function runClaimControl() {
  const result = spawnSync(process.execPath, [path.join(projectRoot, "scripts", "check-claim-control.mjs"), projectRoot], {
    cwd: projectRoot,
    encoding: "utf8",
  });
  if (result.status === 0) {
    pass("claim control checker passes current artifacts");
  } else {
    fail(`claim control checker failed: ${result.stderr || result.stdout}`);
  }
}

function resolveAsset(file) {
  const direct = path.join(projectRoot, file);
  if (fs.existsSync(direct)) return direct;
  if (/^(core|templates|prompts|checklists|docs)\//.test(file)) {
    const intentOS = path.join(projectRoot, ".intentos", file);
    if (fs.existsSync(intentOS)) return intentOS;
  }
  return null;
}

function displayAsset(file, resolved) {
  return path.relative(projectRoot, resolved).replace(/\\/g, "/") || file;
}

function currentVersion() {
  if (!exists("VERSION.md")) return null;
  const match = read("VERSION.md").match(/Current version:\s*`([^`]+)`/);
  return match ? match[1] : null;
}

function exists(file) {
  return fs.existsSync(path.join(projectRoot, file));
}

function read(file) {
  return fs.readFileSync(path.join(projectRoot, file), "utf8");
}

function pass(message) {
  checks.push({ status: "PASS", message });
  if (!outputJson) console.log(`PASS ${message}`);
}

function fail(message) {
  failed = true;
  checks.push({ status: "FAIL", message });
  if (!outputJson) console.error(`FAIL ${message}`);
}

function emitAndExit() {
  if (outputJson) {
    console.log(JSON.stringify({
      status: failed ? "FAIL" : "PASS",
      checks,
    }, null, 2));
  }
  if (failed) process.exit(1);
  if (!outputJson) {
    console.log("");
    console.log("Product baseline check passed.");
  }
}
