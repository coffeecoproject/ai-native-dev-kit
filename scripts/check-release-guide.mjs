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
const isSourceRepo = fs.existsSync(path.join(projectRoot, "dev-kit-manifest.json"))
  && fs.existsSync(path.join(projectRoot, "core", "workflow.md"));
const shouldRequireAssets = isSourceRepo
  || fs.existsSync(path.join(projectRoot, ".ai-native", "dev-kit-manifest.json"))
  || fs.existsSync(path.join(projectRoot, ".ai-native", "version.json"));

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

const requiredAssets = [
  "core/release-guide.md",
  "docs/release-guide.md",
  "templates/release-guide-card.md",
  "templates/release-approval-record.md",
  "checklists/release-guide-review.md",
  "prompts/release-guide-agent.md",
  "scripts/resolve-release-guide.mjs",
  "scripts/check-release-guide.mjs",
];
const requiredDirectories = ["release-guides"];
const sections = [
  "Human Summary",
  "Beginner Release Guide Card",
  "Release Guide Routing",
  "Structured Release Approval Gate",
  "Assist Level Classification",
  "Command Risk Classification",
  "Evidence Quality Map",
  "Internal Routing",
  "Boundaries",
  "Outcome",
];
const allowedOutcomes = new Set([
  "NEEDS_RELEASE_ADAPTER",
  "NEEDS_LAUNCH_REVIEW",
  "NEEDS_STRUCTURED_RELEASE_APPROVAL",
  "NEEDS_RELEASE_EVIDENCE_QUALITY",
  "READY_FOR_RELEASE_EXECUTION_PLAN",
  "BLOCKED_RELEASE_PATH",
  "RELEASE_GUIDE_RECORDED",
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
  /\bThis guide approves release:\s*Yes\b/i,
  /\bThis guide deploys by itself:\s*Yes\b/i,
  /\bThis guide deploys or publishes by itself:\s*Yes\b/i,
  /\bThis guide asks for or stores secrets:\s*Yes\b/i,
  /\bThis guide treats free-form approval text as release approval:\s*Yes\b/i,
  /\bThis guide treats beginner confirmation as production approval:\s*Yes\b/i,
  /\bThis guide changes CI\/CD, hooks, DNS, payment, permissions, app-store state, mini-program state, or production config:\s*Yes\b/i,
  /\bThis guide makes Codex the release owner:\s*Yes\b/i,
];
const secretRequestPattern = /\b([A-Z0-9_]*(TOKEN|SECRET|KEY|PASSWORD|PRIVATE_KEY)[A-Z0-9_]*\s*=|ask for|paste|send|provide|store|record).{0,60}\b(secret|token|password|private key|api key|credential)\b/i;
const remoteSideEffectPattern = /\b(provider API|preview deploy|publish preview|published preview|remote state|remote-state|trigger CI|trigger CI\/CD|mutates remote|uploads artifact|vercel --prod|firebase deploy|wrangler publish|netlify deploy)\b/i;
const localSafeClassPattern = /\b(LOCAL_READ_ONLY|LOCAL_BUILD|LOCAL_TEST)\b/i;
const highRiskPattern = /\b(PRODUCTION|APP_STORE|MINI_PROGRAM|MIGRATION|DNS|PAYMENT|PERMISSION|PRODUCTION_CONFIG|SECRET|STORE_OR_MINI_PROGRAM|PRODUCTION_DEPLOY)\b/i;

let failed = false;
const checks = [];

if (!outputJson) {
  console.log("# Release Guide Check");
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
checkReleaseGuides();

if (isSourceRepo) checkSourceEvidence();
else pass("source-only 1.58 release guide evidence checks skipped for target project");

emitAndExit();

function checkCoreContent() {
  const combined = [
    readResolved("core/release-guide.md"),
    readResolved("docs/release-guide.md"),
  ].join("\n");
  if (!combined.trim()) return;
  for (const marker of [
    "Release Guide",
    "Structured Approval",
    "Assist Levels",
    "Command Risk Classes",
    "does not approve release",
  ]) {
    if (combined.includes(marker)) pass(`release guide docs include ${marker}`);
    else fail(`release guide docs missing ${marker}`);
  }
}

function checkReleaseGuides() {
  const files = markdownFiles("release-guides");
  if (files.length === 0) {
    pass("release guide check skipped: no Release Guide Cards");
    return;
  }

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const label = rel(file);
    for (const section of sections) requireSection(content, section, label);
    if (containsSecretLikeValue(content) || secretRequestPattern.test(content)) fail(`${label} contains secret-like content`);
    for (const pattern of forbiddenClaims) {
      if (pattern.test(content)) fail(`${label} contains forbidden release guide claim: ${pattern.source}`);
    }

    const guideState = tableValue(sectionBody(content, "Human Summary"), "Guide State");
    const route = tableValue(sectionBody(content, "Human Summary"), "Recommended Route");
    const assistLevel = tableValue(sectionBody(content, "Human Summary"), "Assist Level");
    const outcome = codeOrTextValue(sectionBody(content, "Outcome"));

    if (guideState) pass(`${label} records Guide State`);
    else fail(`${label} must record Guide State`);
    if (route) pass(`${label} records Recommended Route`);
    else fail(`${label} must record Recommended Route`);
    if (assistLevel) pass(`${label} records Assist Level`);
    else fail(`${label} must record Assist Level`);
    if (allowedOutcomes.has(outcome)) pass(`${label} has valid Outcome`);
    else fail(`${label} has invalid Outcome: ${outcome || "<empty>"}`);

    const beginnerBody = sectionBody(content, "Beginner Release Guide Card") || "";
    if (/Recommended safe next step:/i.test(beginnerBody) && /What I need from you:/i.test(beginnerBody)) {
      pass(`${label} includes beginner-readable release guide card`);
    } else {
      fail(`${label} must include Beginner Release Guide Card`);
    }

    checkStructuredApproval(content, label, outcome);
    checkAssistLevels(content, label);
    checkCommandRisk(content, label);
    checkEvidenceQuality(content, label);

    for (const boundary of [
      "This guide approves release",
      "This guide deploys or publishes by itself",
      "This guide asks for or stores secrets",
      "This guide treats free-form approval text as release approval",
      "This guide treats beginner confirmation as production approval",
      "This guide changes CI/CD, hooks, DNS, payment, permissions, app-store state, mini-program state, or production config",
      "This guide makes Codex the release owner",
    ]) {
      requireBoundaryNo(content, label, boundary);
    }
  }
}

function checkStructuredApproval(content, label, outcome) {
  const body = sectionBody(content, "Structured Release Approval Gate") || "";
  const approvalType = tableValue(body, "Approval Type");
  const approvalStatus = tableValue(body, "Approval Status");
  const releaseTarget = tableValue(body, "Release Target");
  const approvedScope = tableValue(body, "Approved Scope");
  const approvedBy = tableValue(body, "Approved By");
  const approvalTime = tableValue(body, "Approval Time");
  const allowedActions = tableValue(body, "Allowed Codex Actions");
  const blockedActions = tableValue(body, "Blocked Actions");
  const evidencePath = tableValue(body, "Evidence Path");
  const expiry = tableValue(body, "Expiry / Reconfirm By");

  if (approvalStatus === "APPROVED" || outcome === "READY_FOR_RELEASE_EXECUTION_PLAN") {
    const requirements = [
      ["Approval Type", approvalType === "RELEASE_APPROVAL"],
      ["Release Target", isConcrete(releaseTarget)],
      ["Approved Scope", isConcrete(approvedScope)],
      ["Approved By", isConcrete(approvedBy)],
      ["Approval Time", isConcrete(approvalTime)],
      ["Allowed Codex Actions", isConcrete(allowedActions)],
      ["Blocked Actions", isConcrete(blockedActions)],
      ["Evidence Path", isConcrete(evidencePath)],
      ["Expiry / Reconfirm By", isConcrete(expiry)],
    ];
    for (const [name, ok] of requirements) {
      if (ok) pass(`${label} structured approval includes ${name}`);
      else fail(`${label} approved release guide requires structured approval field: ${name}`);
    }
  } else {
    pass(`${label} structured approval may remain pending`);
  }
}

function checkAssistLevels(content, label) {
  const body = sectionBody(content, "Assist Level Classification") || "";
  const rows = tableRows(body);
  if (rows.length > 0) pass(`${label} records Assist Level Classification`);
  else fail(`${label} must record Assist Level Classification`);
  for (const row of rows) {
    if (highRiskPattern.test(row) && /\bCODEX_MAY_RUN\b/i.test(row)) {
      fail(`${label} assigns high-risk assist level to Codex: ${row}`);
    }
    if (/\bPRODUCTION_HANDOFF\b/i.test(row) && !/\bHUMAN_OR_EXTERNAL_SYSTEM\b/i.test(row)) {
      fail(`${label} production handoff must be human or external-system owned: ${row}`);
    }
  }
}

function checkCommandRisk(content, label) {
  const body = sectionBody(content, "Command Risk Classification") || "";
  const rows = tableRows(body);
  if (rows.length > 0) pass(`${label} records Command Risk Classification`);
  else fail(`${label} must record Command Risk Classification`);
  if (rows.some((row) => /\bNO_RUN\b/i.test(row))) pass(`${label} records NO_RUN default`);
  else fail(`${label} must record NO_RUN default`);
  for (const row of rows) {
    if (remoteSideEffectPattern.test(row) && localSafeClassPattern.test(row)) {
      fail(`${label} classifies remote side-effect command as local-safe: ${row}`);
    }
    if (remoteSideEffectPattern.test(row) && /\bCODEX_MAY_RUN/i.test(row)) {
      fail(`${label} assigns remote side-effect command to Codex: ${row}`);
    }
  }
}

function checkEvidenceQuality(content, label) {
  const body = sectionBody(content, "Evidence Quality Map") || "";
  const rows = tableRows(body);
  if (rows.length > 0) pass(`${label} records Evidence Quality Map`);
  else fail(`${label} must record Evidence Quality Map`);
  for (const row of rows) {
    const cols = splitRow(row);
    const status = stripCode(cols[1] || "");
    const refValue = stripCode(cols[2] || "");
    if (status === "PASS" && !isConcrete(refValue)) {
      fail(`${label} marks evidence PASS without concrete ref: ${row}`);
    }
    if (status === "PASS" && /placeholder|example only|tbd|todo/i.test(refValue)) {
      fail(`${label} marks placeholder evidence PASS: ${row}`);
    }
  }
}

function checkSourceEvidence() {
  for (const file of [
    "docs/plans/release-path-consolidation-1.58-plan.md",
    "docs/plans/release-path-consolidation-1.58-1.60-plan.md",
    "examples/1.58-release-guide-consolidation/web-preview-release-guide/README.md",
    "examples/1.58-release-guide-consolidation/web-preview-release-guide/release-guides/001-release-guide.md",
    "test-fixtures/bad/bad-release-guide-unstructured-approval/release-guides/001-bad.md",
    "test-fixtures/bad/bad-release-guide-codex-production/release-guides/001-bad.md",
    "test-fixtures/bad/bad-release-guide-remote-local/release-guides/001-bad.md",
    "test-fixtures/bad/bad-release-guide-weak-evidence/release-guides/001-bad.md",
    "releases/1.58.0/release-record.md",
    "releases/1.58.0/known-limitations.md",
    "releases/1.58.0/self-check-report.md",
  ]) {
    if (exists(file)) pass(`1.58 release guide source evidence exists ${file}`);
    else fail(`1.58 release guide source evidence missing ${file}`);
  }

  const resolver = runNode(["scripts/resolve-release-guide.mjs", ".", "--intent", "help me launch"]);
  if (resolver.status === 0
    && resolver.stdout.includes("# Release Guide Card")
    && resolver.stdout.includes("## Beginner Release Guide Card")
    && resolver.stdout.includes("## Command Risk Classification")
    && resolver.stdout.includes("This guide approves release: No")) {
    pass("1.58 release guide resolver prints safe guide");
  } else {
    fail(`1.58 release guide resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-release-guide.mjs", ".", "--intent", "help me launch", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "RELEASE_GUIDE_CARD"
        && parsed.humanSummary?.guideState
        && parsed.commandRiskClassification?.some((item) => item.commandClass === "NO_RUN")
        && parsed.boundaries?.approvesRelease === "No"
        && parsed.boundaries?.treatsFreeFormApprovalAsReleaseApproval === "No") {
        pass("1.58 release guide resolver JSON includes route, command risk, and boundaries");
      } else {
        fail(`1.58 release guide resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.58 release guide resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.58 release guide resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  pass("1.58 release guide checker is executing source repo checks");

  const example = runNode(["scripts/check-release-guide.mjs", "examples/1.58-release-guide-consolidation/web-preview-release-guide"]);
  if (example.status === 0 && example.stdout.includes("Release Guide check passed")) {
    pass("1.58 release guide example passes checker");
  } else {
    fail(`1.58 release guide example failed: ${example.stderr || example.stdout}`);
  }

  for (const [name, target, expected] of [
    ["unstructured approval", "test-fixtures/bad/bad-release-guide-unstructured-approval", "requires structured approval field"],
    ["codex production", "test-fixtures/bad/bad-release-guide-codex-production", "production handoff must be human"],
    ["remote local command", "test-fixtures/bad/bad-release-guide-remote-local", "remote side-effect"],
    ["weak evidence", "test-fixtures/bad/bad-release-guide-weak-evidence", "PASS without concrete ref"],
  ]) {
    const result = runNode(["scripts/check-release-guide.mjs", target]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.58 release guide rejects ${name}`);
    } else {
      fail(`1.58 release guide must reject ${name}: ${output}`);
    }
  }
}

function requireSection(content, section, label) {
  if (sectionBody(content, section)) pass(`${label} includes ${section}`);
  else fail(`${label} missing section ${section}`);
}

function requireBoundaryNo(content, label, boundary) {
  const pattern = new RegExp(`-\\s*${escapeRegExp(boundary)}:\\s*No\\b`, "i");
  if (pattern.test(content)) pass(`${label} boundary is No: ${boundary}`);
  else fail(`${label} must state boundary as No: ${boundary}`);
}

function tableRows(body) {
  return String(body || "")
    .split(/\r?\n/)
    .filter((line) => /^\|/.test(line) && !/---/.test(line) && !/\|\s*(Field|Level|Command Class|Evidence|Stage|Input)\s*\|/i.test(line));
}

function splitRow(row) {
  return row.split("|").slice(1, -1).map((item) => item.trim());
}

function tableValue(content, label) {
  const escaped = escapeRegExp(label);
  const regex = new RegExp(`\\|\\s*${escaped}\\s*\\|\\s*([^|]+?)\\s*\\|`, "i");
  const match = String(content || "").match(regex);
  return match ? stripCode(match[1].trim()) : "";
}

function codeOrTextValue(body) {
  const lines = String(body || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const first = lines.find((line) => !line.startsWith("|"));
  return stripCode(first || "");
}

function stripCode(value) {
  return String(value || "").replace(/^`|`$/g, "").trim();
}

function isConcrete(value) {
  const text = String(value || "").trim();
  return Boolean(text) && !/^(N\/A|NA|TBD|TODO|PENDING|MISSING|<[^>]+>)$/i.test(text);
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function markdownFiles(dir) {
  const base = path.join(projectRoot, dir);
  if (!fs.existsSync(base)) return [];
  const out = [];
  walk(base, out);
  return out.filter((file) => file.endsWith(".md")).sort();
}

function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".git") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
}

function resolveAsset(file) {
  if (fs.existsSync(path.join(projectRoot, file))) return file;
  if (fs.existsSync(path.join(projectRoot, ".ai-native", file))) return `.ai-native/${file}`;
  return "";
}

function resolveDirectory(dir) {
  if (fs.existsSync(path.join(projectRoot, dir))) return dir;
  if (fs.existsSync(path.join(projectRoot, ".ai-native", dir))) return `.ai-native/${dir}`;
  return "";
}

function readResolved(file) {
  const resolved = resolveAsset(file);
  return resolved ? fs.readFileSync(path.join(projectRoot, resolved), "utf8") : "";
}

function displayAsset(file, resolved) {
  return file === resolved ? file : `${file} via ${resolved}`;
}

function exists(relativePath) {
  return fs.existsSync(path.join(projectRoot, relativePath));
}

function rel(fullPath) {
  return path.relative(projectRoot, fullPath).replaceAll(path.sep, "/");
}

function runNode(nodeArgs) {
  return spawnSync(process.execPath, nodeArgs, { cwd: projectRoot, encoding: "utf8" });
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
  } else if (failed) {
    console.error("");
    console.error("Release Guide check failed.");
  } else {
    console.log("");
    console.log("Release Guide check passed.");
  }
  process.exit(failed ? 1 : 0);
}
