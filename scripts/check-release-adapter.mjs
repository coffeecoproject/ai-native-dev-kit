#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { sectionBody } from "./lib/markdown.mjs";
import { containsSecretLikeValue } from "./lib/risk-surfaces.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["json"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputJson = Boolean(args.json);
const isSourceRepo = fs.existsSync(path.join(projectRoot, "intentos-manifest.json"))
  && fs.existsSync(path.join(projectRoot, "core", "workflow.md"));
const shouldRequireAssets = isSourceRepo
  || fs.existsSync(path.join(projectRoot, ".intentos", "intentos-manifest.json"))
  || fs.existsSync(path.join(projectRoot, ".intentos", "version.json"));

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

const requiredAssets = [
  "core/release-adapter.md",
  "docs/release-adapter.md",
  "templates/release-adapter-profile.md",
  "checklists/release-adapter-review.md",
  "prompts/release-adapter-agent.md",
  "scripts/resolve-release-adapter.mjs",
  "scripts/check-release-adapter.mjs",
];
const requiredDirectories = ["release-adapters"];
const sections = [
  "Human Summary",
  "Project Release Discovery",
  "Release Target Recommendation",
  "Beginner Release Card",
  "Project Release Profile",
  "Codex Execution Boundary",
  "Missing Inputs",
  "Release Execution Bridge",
  "Evidence",
  "Boundaries",
  "Outcome",
];
const allowedOutcomes = new Set([
  "NEEDS_BEGINNER_RELEASE_DECISION",
  "READY_FOR_RELEASE_EXECUTION_PLAN",
  "BLOCKED_BY_MISSING_RELEASE_PATH",
  "RELEASE_ADAPTER_PROFILE_RECORDED",
]);
const forbiddenClaims = [
  /\brelease approved\b/i,
  /\bproduction approved\b/i,
  /\bapproved for production\b/i,
  /\bCodex will deploy production\b/i,
  /\bCodex deploys production\b/i,
  /\bCodex will publish\b/i,
  /\bCodex will submit (app store|mini program|wechat|play store)\b/i,
  /\bautomatically deploy(s|ed)?\b/i,
  /\bautomatically publish(es|ed)?\b/i,
  /\bThis adapter approves release:\s*Yes\b/i,
  /\bThis adapter deploys by itself:\s*Yes\b/i,
  /\bThis adapter asks for or stores secrets:\s*Yes\b/i,
  /\bThis adapter changes CI\/CD, hooks, DNS, payment, permissions, app-store state, mini-program state, or production config:\s*Yes\b/i,
  /\bThis adapter treats beginner confirmation as production approval:\s*Yes\b/i,
  /\bThis adapter makes Codex the release owner:\s*Yes\b/i,
];
const highRiskActionPattern = /\b(PRODUCTION_DEPLOY|STORE_OR_MINI_PROGRAM_SUBMIT|SECRETS_OR_DNS_OR_PAYMENT|MIGRATION|PAYMENT|DNS|APP_STORE|MINI_PROGRAM)\b/i;
const secretRequestPattern = /\b([A-Z0-9_]*(TOKEN|SECRET|KEY|PASSWORD|PRIVATE_KEY)[A-Z0-9_]*\s*=|ask for|paste|send|provide|store|record).{0,60}\b(secret|token|password|private key|api key|credential)\b/i;

let failed = false;
const checks = [];

if (!outputJson) {
  console.log("# Release Adapter Check");
  console.log("");
}

if (shouldRequireAssets) {
  for (const file of requiredAssets) {
    const resolved = resolveAsset(file);
    if (resolved) pass(`${displayAsset(file, resolved)} exists`);
    else fail(`missing ${file}`);
  }
  for (const dir of requiredDirectories) {
    const resolved = resolveDirectory(dir);
    if (resolved) pass(`${displayAsset(dir, resolved)} exists`);
    else fail(`missing ${dir}`);
  }
} else {
  pass("asset completeness check skipped for standalone example or fixture");
}

checkCoreContent();
checkReleaseAdapters();

if (isSourceRepo) checkSourceEvidence();
else pass("source-only 1.57 release adapter evidence checks skipped for target project");

emitAndExit();

function checkCoreContent() {
  const combined = [
    readResolved("core/release-adapter.md"),
    readResolved("docs/release-adapter.md"),
  ].join("\n");
  if (!combined.trim()) return;
  for (const marker of [
    "Guided Release Adapter",
    "Beginner Release Card",
    "Project Release Profile",
    "Release Execution Protocol",
    "does not approve release",
    "does not deploy",
  ]) {
    if (combined.includes(marker)) pass(`release adapter docs include ${marker}`);
    else fail(`release adapter docs missing ${marker}`);
  }
}

function checkReleaseAdapters() {
  const files = markdownFiles("release-adapters");
  if (files.length === 0) {
    pass("release adapter check skipped: no Release Adapter Profiles");
    return;
  }

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const label = rel(file);
    for (const section of sections) requireSection(content, section, label);
    if (containsSecretLikeValue(content) || secretRequestPattern.test(content)) fail(`${label} contains secret-like content`);
    for (const pattern of forbiddenClaims) {
      if (pattern.test(content)) fail(`${label} contains forbidden release adapter claim: ${pattern.source}`);
    }

    const adapterState = tableValue(sectionBody(content, "Human Summary"), "Adapter State");
    const recommendedTarget = tableValue(sectionBody(content, "Human Summary"), "Recommended Target");
    const outcome = codeOrTextValue(sectionBody(content, "Outcome"));

    if (adapterState) pass(`${label} records Adapter State`);
    else fail(`${label} must record Adapter State`);
    if (recommendedTarget) pass(`${label} records Recommended Target`);
    else fail(`${label} must record Recommended Target`);
    if (allowedOutcomes.has(outcome)) pass(`${label} has valid Outcome`);
    else fail(`${label} has invalid Outcome: ${outcome || "<empty>"}`);

    const beginnerBody = sectionBody(content, "Beginner Release Card") || "";
    if (/Recommended choice:/i.test(beginnerBody) && /What I need from you:/i.test(beginnerBody)) {
      pass(`${label} includes beginner-readable release card`);
    } else {
      fail(`${label} must include Beginner Release Card`);
    }

    checkExecutionBoundary(content, label);

    for (const boundary of [
      "This adapter approves release",
      "This adapter deploys by itself",
      "This adapter asks for or stores secrets",
      "This adapter changes CI/CD, hooks, DNS, payment, permissions, app-store state, mini-program state, or production config",
      "This adapter treats beginner confirmation as production approval",
      "This adapter makes Codex the release owner",
    ]) {
      requireBoundaryNo(content, label, boundary);
    }
  }
}

function checkExecutionBoundary(content, label) {
  const body = sectionBody(content, "Codex Execution Boundary") || "";
  const rows = body.split(/\r?\n/).filter((line) => /^\|/.test(line) && !/---/.test(line) && !/\|\s*Action\s*\|/i.test(line));
  if (rows.length > 0) pass(`${label} records Codex Execution Boundary`);
  else fail(`${label} must record Codex Execution Boundary`);

  for (const row of rows) {
    if (/\b(CODEX_AUTO|AUTO_RUN|AUTO_EXECUTE|CODEX_DEPLOYS|CODEX_PUBLISHES|CODEX_SUBMITS)\b/i.test(row)) {
      fail(`${label} contains unsafe Codex executor in boundary row: ${row}`);
    }
    if (highRiskActionPattern.test(row) && /\|\s*`?CODEX_MAY_RUN_AFTER_CONFIRMATION`?\s*\|/i.test(row)) {
      fail(`${label} assigns high-risk release action to Codex: ${row}`);
    }
  }
}

function checkSourceEvidence() {
  for (const file of [
    "docs/plans/guided-release-adapter-1.57-plan.md",
    "examples/1.57-guided-release-adapter/web-vercel-preview/README.md",
    "examples/1.57-guided-release-adapter/web-vercel-preview/release-adapters/001-release-adapter.md",
    "test-fixtures/bad/bad-release-adapter-missing-beginner-card/release-adapters/001-bad.md",
    "test-fixtures/bad/bad-release-adapter-codex-auto-production/release-adapters/001-bad.md",
    "test-fixtures/bad/bad-release-adapter-secret-request/release-adapters/001-bad.md",
    "releases/1.57.0/release-record.md",
    "releases/1.57.0/known-limitations.md",
    "releases/1.57.0/self-check-report.md",
  ]) {
    if (exists(file)) pass(`1.57 release adapter source evidence exists ${file}`);
    else fail(`1.57 release adapter source evidence missing ${file}`);
  }

  const resolver = runNode(["scripts/resolve-release-adapter.mjs", ".", "--intent", "prepare release adapter"]);
  if (resolver.status === 0
    && resolver.stdout.includes("# Release Adapter Profile")
    && resolver.stdout.includes("## Beginner Release Card")
    && resolver.stdout.includes("This adapter approves release: No")
    && resolver.stdout.includes("This adapter deploys by itself: No")) {
    pass("1.57 release adapter resolver prints safe profile");
  } else {
    fail(`1.57 release adapter resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-release-adapter.mjs", ".", "--intent", "prepare release adapter", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "RELEASE_ADAPTER_PROFILE"
        && parsed.humanSummary?.adapterState
        && parsed.beginnerReleaseCard?.recommendedChoice
        && parsed.boundaries?.approvesRelease === "No"
        && parsed.boundaries?.deploysByItself === "No") {
        pass("1.57 release adapter resolver JSON includes state, beginner card, and boundaries");
      } else {
        fail(`1.57 release adapter resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.57 release adapter resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.57 release adapter resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  pass("1.57 release adapter checker is executing source repo checks");

  const example = runNode(["scripts/check-release-adapter.mjs", "examples/1.57-guided-release-adapter/web-vercel-preview"]);
  if (example.status === 0 && example.stdout.includes("Release Adapter check passed")) {
    pass("1.57 release adapter example passes checker");
  } else {
    fail(`1.57 release adapter example failed: ${example.stderr || example.stdout}`);
  }

  for (const [name, target, expected] of [
    ["missing beginner card", "test-fixtures/bad/bad-release-adapter-missing-beginner-card", "must include Beginner Release Card"],
    ["codex auto production", "test-fixtures/bad/bad-release-adapter-codex-auto-production", "assigns high-risk release action to Codex"],
    ["secret request", "test-fixtures/bad/bad-release-adapter-secret-request", "contains secret-like content"],
  ]) {
    const result = runNode(["scripts/check-release-adapter.mjs", target]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.57 release adapter rejects ${name}`);
    } else {
      fail(`1.57 release adapter must reject ${name}: ${output}`);
    }
  }
}

function requireBoundaryNo(content, label, boundary) {
  const escaped = boundary.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (new RegExp(`-\\s*${escaped}:\\s*No\\b`, "i").test(content)) pass(`${label} boundary ${boundary}: No`);
  else fail(`${label} missing boundary or not No: ${boundary}`);
}

function requireSection(content, heading, label) {
  if (sectionBody(content, heading) !== null) pass(`${label} has section ${heading}`);
  else fail(`${label} missing section ${heading}`);
}

function tableValue(content, field) {
  const escaped = String(field).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = String(content || "").match(new RegExp(`\\|\\s*${escaped}\\s*\\|\\s*([^|]+?)\\s*\\|`, "i"));
  return match ? codeOrTextValue(match[1]) : "";
}

function codeOrTextValue(value) {
  return String(value || "").replace(/`/g, "").trim();
}

function markdownFiles(dir) {
  const resolved = resolveDirectory(dir);
  if (!resolved) return [];
  const base = path.join(projectRoot, resolved);
  const out = [];
  walk(base, out);
  return out.filter((file) => file.endsWith(".md")).sort();
}

function walk(dir, out) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
}

function readResolved(file) {
  const resolved = resolveAsset(file);
  if (!resolved) return "";
  return fs.readFileSync(path.join(projectRoot, resolved), "utf8");
}

function resolveAsset(file) {
  const direct = path.join(projectRoot, file);
  if (fs.existsSync(direct) && fs.statSync(direct).isFile()) return file;
  const installed = path.join(projectRoot, ".intentos", file);
  if (fs.existsSync(installed) && fs.statSync(installed).isFile()) return path.join(".intentos", file);
  return "";
}

function resolveDirectory(dir) {
  const direct = path.join(projectRoot, dir);
  if (fs.existsSync(direct) && fs.statSync(direct).isDirectory()) return dir;
  const installed = path.join(projectRoot, ".intentos", dir);
  if (fs.existsSync(installed) && fs.statSync(installed).isDirectory()) return path.join(".intentos", dir);
  return "";
}

function displayAsset(file, resolved) {
  return file === resolved ? file : `${file} (${resolved})`;
}

function exists(file) {
  return fs.existsSync(path.join(projectRoot, file));
}

function rel(file) {
  return path.relative(projectRoot, file);
}

function runNode(argv) {
  return spawnSync(process.execPath, argv, { cwd: projectRoot, encoding: "utf8" });
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
    console.log(JSON.stringify({ ok: !failed, checks }, null, 2));
  } else if (!failed) {
    console.log("");
    console.log("Release Adapter check passed.");
  }
  process.exit(failed ? 1 : 0);
}
