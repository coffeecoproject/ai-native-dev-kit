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
  "core/release-execution-protocol.md",
  "docs/release-execution-protocol.md",
  "templates/release-execution-plan.md",
  "checklists/release-execution-review.md",
  "prompts/release-execution-agent.md",
  "scripts/resolve-release-execution.mjs",
  "scripts/check-release-execution.mjs",
];
const requiredDirectories = ["release-execution-plans"];
const sections = [
  "Human Summary",
  "Preconditions",
  "Launch Review Input",
  "Human Release Approval",
  "Execution Mode",
  "Execution Steps",
  "Evidence Capture",
  "Stop Conditions",
  "Post-Launch Close-Out",
  "Boundaries",
  "Outcome",
];
const allowedModes = new Set(["PLAN_ONLY", "HUMAN_EXECUTION_HANDOFF", "ASSISTED_EXECUTION", "BLOCKED"]);
const allowedOutcomes = new Set([
  "RELEASE_EXECUTION_PLAN_RECORDED",
  "BLOCKED_PENDING_LAUNCH_REVIEW",
  "BLOCKED_PENDING_RELEASE_APPROVAL",
  "READY_FOR_HUMAN_EXECUTION_HANDOFF",
  "READY_FOR_ASSISTED_EXECUTION",
]);
const highRiskStepPattern = /\b(DEPLOY_OR_SUBMIT|MIGRATION|SECRETS|DNS|PAYMENT|PERMISSION|PRODUCTION_CONFIG|APP_STORE|MINI_PROGRAM|ROLLBACK_EXECUTION)\b/i;
const unsafeExecutorPattern = /\b(AUTO_RUN|AUTO_EXECUTE|CODEX_AUTO|CODEX_EXECUTES|CODEX_DEPLOYS|CODEX_PUBLISHES|CODEX_SUBMITS|CODEX_MIGRATES)\b/i;
const forbiddenClaims = [
  /\brelease approved by (IntentOS|Codex|this plan)\b/i,
  /\bproduction approved by (IntentOS|Codex|this plan)\b/i,
  /\bCodex is the release owner\b/i,
  /\bCodex will deploy production\b/i,
  /\bCodex will publish\b/i,
  /\bCodex will submit (app store|mini program|wechat|play store)\b/i,
  /\bautomatically deploy(s|ed)?\b/i,
  /\bautomatically publish(es|ed)?\b/i,
  /\bThis plan approves release:\s*Yes\b/i,
  /\bThis plan executes release by itself:\s*Yes\b/i,
  /\bThis plan changes CI\/CD, hooks, secrets, DNS, payment, permissions, app-store state, mini-program state, or production config:\s*Yes\b/i,
  /\bThis plan treats Launch Review View as release approval:\s*Yes\b/i,
  /\bThis plan makes Codex the release owner:\s*Yes\b/i,
];

let failed = false;
const checks = [];

if (!outputJson) {
  console.log("# Release Execution Check");
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
checkReleaseExecutionPlans();

if (isSourceRepo) checkSourceEvidence();
else pass("source-only 1.56 release execution evidence checks skipped for target project");

emitAndExit();

function checkCoreContent() {
  const combined = [
    readResolved("core/release-execution-protocol.md"),
    readResolved("docs/release-execution-protocol.md"),
  ].join("\n");
  if (!combined.trim()) return;
  for (const marker of [
    "Release Execution Protocol",
    "Launch Review View",
    "Human Release Approval",
    "ASSISTED_EXECUTION",
    "does not execute release by itself",
  ]) {
    if (combined.includes(marker)) pass(`release execution docs include ${marker}`);
    else fail(`release execution docs missing ${marker}`);
  }
}

function checkReleaseExecutionPlans() {
  const files = markdownFiles("release-execution-plans");
  if (files.length === 0) {
    pass("release execution check skipped: no Release Execution Plans");
    return;
  }

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const label = rel(file);
    for (const section of sections) requireSection(content, section, label);
    if (containsSecretLikeValue(content)) fail(`${label} contains secret-like content`);
    for (const pattern of forbiddenClaims) {
      if (pattern.test(content)) fail(`${label} contains forbidden release execution claim: ${pattern.source}`);
    }

    const launchLabel = tableValue(sectionBody(content, "Launch Review Input"), "Safe Launch Label");
    const launchCanProceed = tableValue(sectionBody(content, "Launch Review Input"), "Launch review can proceed");
    const approvalStatus = tableValue(sectionBody(content, "Human Release Approval"), "Approval Status");
    const approvalOwner = tableValue(sectionBody(content, "Human Release Approval"), "Owner");
    const approvalRef = tableValue(sectionBody(content, "Human Release Approval"), "Ref");
    const mode = tableValue(sectionBody(content, "Execution Mode"), "Mode");
    const realAllowed = tableValue(sectionBody(content, "Execution Mode"), "Real release execution allowed");
    const outcome = codeOrTextValue(sectionBody(content, "Outcome"));

    if (launchLabel) pass(`${label} references Launch Review input`);
    else fail(`${label} must reference Launch Review input`);
    if (allowedModes.has(mode)) pass(`${label} has valid execution mode`);
    else fail(`${label} has invalid execution mode: ${mode || "<empty>"}`);
    if (allowedOutcomes.has(outcome)) pass(`${label} has valid Outcome`);
    else fail(`${label} has invalid Outcome: ${outcome || "<empty>"}`);

    if (mode === "ASSISTED_EXECUTION" || mode === "HUMAN_EXECUTION_HANDOFF" || realAllowed === "Yes") {
      if (launchLabel === "READY_FOR_RELEASE_REVIEW" && launchCanProceed === "Yes") {
        pass(`${label} real release execution depends on ready Launch Review View`);
      } else {
        fail(`${label} real release execution requires READY_FOR_RELEASE_REVIEW`);
      }
      if (approvalStatus === "APPROVED" && approvalOwner && approvalOwner !== "N/A" && approvalRef && approvalRef !== "N/A") {
        pass(`${label} real release execution has scoped human approval`);
      } else {
        fail(`${label} real release execution requires scoped Human Release Approval`);
      }
      for (const gate of ["Release SOP", "Rollback", "Monitoring", "Post-launch smoke"]) {
        requirePreconditionPass(content, label, gate);
      }
    }

    if (mode === "ASSISTED_EXECUTION" && realAllowed !== "Yes") {
      fail(`${label} ASSISTED_EXECUTION must only appear when real release execution is allowed`);
    }

    checkExecutionStepOwnership(content, label);

    for (const boundary of [
      "This plan approves release",
      "This plan executes release by itself",
      "This plan deploys, publishes, submits, migrates, or changes production without explicit human/project approval",
      "This plan changes CI/CD, hooks, secrets, DNS, payment, permissions, app-store state, mini-program state, or production config",
      "This plan replaces project release SOPs or release owner",
      "This plan treats Launch Review View as release approval",
      "This plan makes Codex the release owner",
      "This plan approves legal/security/privacy/compliance/tax/finance/payment decisions",
    ]) {
      requireBoundaryNo(content, label, boundary);
    }
  }
}

function checkExecutionStepOwnership(content, label) {
  const body = sectionBody(content, "Execution Steps") || "";
  const rows = body.split(/\r?\n/).filter((line) => /^\|/.test(line) && !/---/.test(line) && !/\|\s*Step\s*\|/i.test(line));
  if (rows.length > 0) pass(`${label} records execution steps`);
  else fail(`${label} must record execution steps`);

  for (const row of rows) {
    if (unsafeExecutorPattern.test(row)) fail(`${label} contains unsafe executor in step row: ${row}`);
    if (highRiskStepPattern.test(row) && /\|\s*`?CODEX_MAY_RUN_AFTER_APPROVAL`?\s*\|/i.test(row)) {
      fail(`${label} assigns high-risk release step to Codex: ${row}`);
    }
  }
}

function checkSourceEvidence() {
  for (const file of [
    "docs/plans/release-execution-protocol-1.56-plan.md",
    "examples/1.56-release-execution/web-assisted-handoff/README.md",
    "examples/1.56-release-execution/web-assisted-handoff/release-execution-plans/001-web-release.md",
    "test-fixtures/bad/bad-release-execution-missing-launch-view/release-execution-plans/001-bad.md",
    "test-fixtures/bad/bad-release-execution-assisted-without-approval/release-execution-plans/001-bad.md",
    "test-fixtures/bad/bad-release-execution-auto-production-deploy/release-execution-plans/001-bad.md",
    "releases/1.56.0/release-record.md",
    "releases/1.56.0/known-limitations.md",
    "releases/1.56.0/self-check-report.md",
  ]) {
    if (exists(file)) pass(`1.56 release execution source evidence exists ${file}`);
    else fail(`1.56 release execution source evidence missing ${file}`);
  }

  const resolver = runNode(["scripts/resolve-release-execution.mjs", ".", "--intent", "prepare release execution"]);
  if (resolver.status === 0
    && resolver.stdout.includes("# Release Execution Plan")
    && resolver.stdout.includes("## Execution Mode")
    && resolver.stdout.includes("This plan approves release: No")
    && resolver.stdout.includes("This plan executes release by itself: No")) {
    pass("1.56 release execution resolver prints safe plan");
  } else {
    fail(`1.56 release execution resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-release-execution.mjs", ".", "--intent", "prepare release execution", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "RELEASE_EXECUTION_PLAN"
        && parsed.executionMode?.mode
        && parsed.boundaries?.approvesRelease === "No"
        && parsed.boundaries?.executesReleaseByItself === "No") {
        pass("1.56 release execution resolver JSON includes mode and boundaries");
      } else {
        fail(`1.56 release execution resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.56 release execution resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.56 release execution resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  pass("1.56 release execution checker is executing source repo checks");

  const example = runNode(["scripts/check-release-execution.mjs", "examples/1.56-release-execution/web-assisted-handoff"]);
  if (example.status === 0 && example.stdout.includes("Release Execution check passed")) {
    pass("1.56 release execution example passes checker");
  } else {
    fail(`1.56 release execution example failed: ${example.stderr || example.stdout}`);
  }

  for (const [name, target, expected] of [
    ["missing launch view", "test-fixtures/bad/bad-release-execution-missing-launch-view", "must reference Launch Review input"],
    ["assisted without approval", "test-fixtures/bad/bad-release-execution-assisted-without-approval", "requires scoped Human Release Approval"],
    ["auto production deploy", "test-fixtures/bad/bad-release-execution-auto-production-deploy", "assigns high-risk release step to Codex"],
  ]) {
    const result = runNode(["scripts/check-release-execution.mjs", target]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.56 release execution rejects ${name}`);
    } else {
      fail(`1.56 release execution must reject ${name}: ${output}`);
    }
  }
}

function requirePreconditionPass(content, label, gate) {
  const row = tableRow(sectionBody(content, "Preconditions"), gate);
  if (/\|\s*`PASS`\s*\|/i.test(row)) pass(`${label} ${gate} precondition is PASS`);
  else fail(`${label} real release execution requires ${gate} PASS`);
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

function tableRow(content, firstCell) {
  const escaped = String(firstCell).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = String(content || "").match(new RegExp(`^\\|\\s*${escaped}\\s*\\|.*$`, "im"));
  return match ? match[0] : "";
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
    console.log("Release Execution check passed.");
  }
  process.exit(failed ? 1 : 0);
}
