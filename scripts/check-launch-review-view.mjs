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
  "core/launch-review-view.md",
  "docs/launch-review-view.md",
  "templates/launch-review-view-card.md",
  "checklists/launch-review-view-review.md",
  "prompts/launch-review-view-agent.md",
  "scripts/resolve-launch-review-view.mjs",
  "scripts/check-launch-review-view.mjs",
];
const requiredDirectories = ["launch-review-views"];
const sections = [
  "Human Summary",
  "Unified Closure Input",
  "Safe Launch View",
  "Platform View",
  "Launch Surface Gaps",
  "Human Release Decisions",
  "Evidence Map",
  "Recommended Next Step",
  "Boundaries",
  "Outcome",
];
const allowedLabels = new Set([
  "NOT_READY",
  "READY_FOR_DEMO",
  "READY_FOR_INTERNAL_HANDOFF",
  "READY_FOR_RELEASE_REVIEW",
  "BLOCKED",
]);
const allowedOutcomes = new Set(["LAUNCH_REVIEW_VIEW_RECORDED"]);
const forbiddenClaims = [
  /\brelease approved\b/i,
  /\bproduction approved\b/i,
  /\bapproved for production\b/i,
  /\bsafe to launch\b/i,
  /\bdeployed\b/i,
  /\bpublished\b/i,
  /\bsubmitted to (app store|review|wechat|mini program|play store)\b/i,
  /\bThis view writes target files:\s*Yes\b/i,
  /\bThis view deploys, publishes, or submits release:\s*Yes\b/i,
  /\bThis view approves release or production:\s*Yes\b/i,
  /\bThis view modifies CI\/CD or hooks:\s*Yes\b/i,
  /\bThis view changes production config, secrets, DNS, app-store state, payment, permissions, or migrations:\s*Yes\b/i,
  /\bThis view replaces Unified Closure:\s*Yes\b/i,
  /\bThis view replaces Safe Launch:\s*Yes\b/i,
  /\bThis view replaces project release SOPs:\s*Yes\b/i,
  /\bThis view approves security\/privacy\/compliance\/legal\/tax\/finance\/payment decisions:\s*Yes\b/i,
];

let failed = false;
const checks = [];

if (!outputJson) {
  console.log("# Launch Review View Check");
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
checkLaunchReviewViews();

if (isSourceRepo) checkSourceEvidence();
else pass("source-only 1.55 launch review view evidence checks skipped for target project");

emitAndExit();

function checkCoreContent() {
  const core = readResolved("core/launch-review-view.md");
  const docs = readResolved("docs/launch-review-view.md");
  if (!core) return;
  for (const marker of [
    "Launch Review View",
    "Unified Closure Decision",
    "Safe Launch readiness labels",
    "Human Release Decision outside IntentOS",
    "must not override Unified Closure",
    "does not",
  ]) {
    if (`${core}\n${docs}`.includes(marker)) pass(`launch review view docs include ${marker}`);
    else fail(`launch review view docs missing ${marker}`);
  }
}

function checkLaunchReviewViews() {
  const files = markdownFiles("launch-review-views");
  if (files.length === 0) {
    pass("launch review view check skipped: no Launch Review View records");
    return;
  }

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const label = rel(file);
    for (const section of sections) requireSection(content, section, label);
    if (containsSecretLikeValue(content)) fail(`${label} contains secret-like content`);
    for (const pattern of forbiddenClaims) {
      if (pattern.test(content)) fail(`${label} contains forbidden launch review claim: ${pattern.source}`);
    }

    const closureDecision = tableValue(sectionBody(content, "Unified Closure Input"), "Closure Decision");
    const canCountAsDone = tableValue(sectionBody(content, "Unified Closure Input"), "Can count as done");
    const safeLabel = tableValue(sectionBody(content, "Safe Launch View"), "Safe Launch Label");
    const releaseApproval = tableValue(sectionBody(content, "Safe Launch View"), "Release approval");

    if (closureDecision) pass(`${label} references Unified Closure input`);
    else fail(`${label} must reference Unified Closure input`);
    if (allowedLabels.has(safeLabel)) pass(`${label} reuses valid Safe Launch label`);
    else fail(`${label} has invalid Safe Launch Label: ${safeLabel || "<empty>"}`);
    if (releaseApproval === "No") pass(`${label} keeps release approval outside IntentOS`);
    else fail(`${label} must not approve release`);

    if (safeLabel === "READY_FOR_RELEASE_REVIEW") {
      if (closureDecision === "DONE" && canCountAsDone === "Yes") pass(`${label} release review readiness depends on DONE closure`);
      else fail(`${label} READY_FOR_RELEASE_REVIEW requires Unified Closure DONE`);
      requireSurfacePass(content, label, "Rollback");
      requireSurfacePass(content, label, "Monitoring");
      requireSurfacePass(content, label, "Release ownership");
      requireSurfacePass(content, label, "Post-launch smoke");
    }

    for (const boundary of [
      "This view writes target files",
      "This view deploys, publishes, or submits release",
      "This view approves release or production",
      "This view modifies CI/CD or hooks",
      "This view changes production config, secrets, DNS, app-store state, payment, permissions, or migrations",
      "This view replaces Unified Closure",
      "This view replaces Safe Launch",
      "This view replaces project release SOPs",
      "This view approves security/privacy/compliance/legal/tax/finance/payment decisions",
    ]) {
      requireBoundaryNo(content, label, boundary);
    }

    const outcome = codeOrTextValue(sectionBody(content, "Outcome"));
    if (allowedOutcomes.has(outcome)) pass(`${label} has valid Outcome`);
    else fail(`${label} has invalid Outcome: ${outcome || "<empty>"}`);
  }
}

function checkSourceEvidence() {
  for (const file of [
    "docs/plans/launch-review-view-1.55-plan.md",
    "examples/1.55-launch-review-view/web-internal-handoff/README.md",
    "examples/1.55-launch-review-view/web-internal-handoff/launch-review-views/001-web-mvp.md",
    "test-fixtures/bad/bad-launch-view-missing-closure/launch-review-views/001-bad.md",
    "test-fixtures/bad/bad-launch-view-release-review-missing-rollback/launch-review-views/001-bad.md",
    "test-fixtures/bad/bad-launch-view-claims-production-approval/launch-review-views/001-bad.md",
    "releases/1.55.0/release-record.md",
    "releases/1.55.0/known-limitations.md",
    "releases/1.55.0/self-check-report.md",
  ]) {
    if (exists(file)) pass(`1.55 launch review view source evidence exists ${file}`);
    else fail(`1.55 launch review view source evidence missing ${file}`);
  }

  const resolver = runNode(["scripts/resolve-launch-review-view.mjs", ".", "--intent", "prepare release review", "--verification", "npm run verify passed"]);
  if (resolver.status === 0
    && resolver.stdout.includes("# Launch Review View")
    && resolver.stdout.includes("## Unified Closure Input")
    && resolver.stdout.includes("This view approves release or production: No")) {
    pass("1.55 launch review resolver prints safe view");
  } else {
    fail(`1.55 launch review resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-launch-review-view.mjs", ".", "--intent", "prepare release review", "--verification", "npm run verify passed", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "LAUNCH_REVIEW_VIEW"
        && parsed.unifiedClosureInput?.closureDecision
        && parsed.safeLaunchView?.safeLaunchLabel
        && parsed.boundaries?.approvesReleaseOrProduction === "No") {
        pass("1.55 launch review resolver JSON includes closure input, label, and boundary");
      } else {
        fail(`1.55 launch review resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.55 launch review resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.55 launch review resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  pass("1.55 launch review checker is executing source repo checks");

  const example = runNode(["scripts/check-launch-review-view.mjs", "examples/1.55-launch-review-view/web-internal-handoff"]);
  if (example.status === 0 && example.stdout.includes("Launch Review View check passed")) {
    pass("1.55 launch review example passes checker");
  } else {
    fail(`1.55 launch review example failed: ${example.stderr || example.stdout}`);
  }

  for (const [name, target, expected] of [
    ["missing closure", "test-fixtures/bad/bad-launch-view-missing-closure", "must reference Unified Closure input"],
    ["release review missing rollback", "test-fixtures/bad/bad-launch-view-release-review-missing-rollback", "requires Rollback PASS"],
    ["production approval claim", "test-fixtures/bad/bad-launch-view-claims-production-approval", "forbidden launch review claim"],
  ]) {
    const result = runNode(["scripts/check-launch-review-view.mjs", target]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) pass(`1.55 launch review rejects ${name}`);
    else fail(`1.55 launch review must reject ${name}: ${output}`);
  }
}

function requireSurfacePass(content, label, surfaceName) {
  const gaps = sectionBody(content, "Launch Surface Gaps") || "";
  const row = tableRow(gaps, surfaceName);
  if (/\|\s*`PASS`\s*\|/i.test(row)) pass(`${label} ${surfaceName} is PASS for release review readiness`);
  else fail(`${label} READY_FOR_RELEASE_REVIEW requires ${surfaceName} PASS`);
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
  const base = path.join(projectRoot, dir);
  if (!fs.existsSync(base) || !fs.statSync(base).isDirectory()) return [];
  const files = [];
  walk(base, files);
  return files.filter((file) => file.endsWith(".md"));
}

function walk(current, files) {
  for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
    const full = path.join(current, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else files.push(full);
  }
}

function resolveAsset(relativePath) {
  const direct = path.join(projectRoot, relativePath);
  if (fs.existsSync(direct)) return direct;
  if (relativePath.startsWith("core/")
    || relativePath.startsWith("templates/")
    || relativePath.startsWith("checklists/")
    || relativePath.startsWith("prompts/")
    || relativePath.startsWith("docs/")) {
    const nested = path.join(projectRoot, ".ai-native", relativePath);
    if (fs.existsSync(nested)) return nested;
  }
  return null;
}

function resolveDirectory(relativePath) {
  const direct = path.join(projectRoot, relativePath);
  if (fs.existsSync(direct) && fs.statSync(direct).isDirectory()) return direct;
  const nested = path.join(projectRoot, ".ai-native", relativePath);
  if (fs.existsSync(nested) && fs.statSync(nested).isDirectory()) return nested;
  return null;
}

function readResolved(relativePath) {
  const resolved = resolveAsset(relativePath);
  return resolved ? fs.readFileSync(resolved, "utf8") : "";
}

function exists(relativePath) {
  return fs.existsSync(path.join(projectRoot, relativePath));
}

function displayAsset(relativePath, resolved) {
  const relPath = path.relative(projectRoot, resolved).replaceAll(path.sep, "/");
  return relPath === relativePath ? relativePath : `${relativePath} (${relPath})`;
}

function rel(fullPath) {
  return path.relative(projectRoot, fullPath).replaceAll(path.sep, "/");
}

function runNode(argv) {
  return spawnSync(process.execPath, argv, {
    cwd: projectRoot,
    encoding: "utf8",
  });
}

function emitAndExit() {
  if (outputJson) {
    console.log(JSON.stringify({ ok: !failed, checks }, null, 2));
  } else {
    console.log("");
    console.log(failed ? "Launch Review View check failed." : "Launch Review View check passed.");
  }
  process.exit(failed ? 1 : 0);
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
