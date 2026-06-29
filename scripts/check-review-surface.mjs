#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
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
  "core/review-surface-governance.md",
  "docs/review-surface-governance.md",
  "templates/review-surface-card.md",
  "checklists/review-surface-review.md",
  "prompts/review-surface-agent.md",
  "scripts/resolve-review-surface.mjs",
  "scripts/check-review-surface.mjs",
];

const requiredDirectories = [
  "review-surface-cards",
];

const reportSections = [
  "Human Decision Summary",
  "Plain Summary",
  "Project Reading",
  "Selected Review Surfaces",
  "Review Surface Checklist",
  "Questions For Human",
  "Post-Execution Review Contract",
  "Boundaries",
  "Outcome",
];

const allowedSurfaces = new Set([
  "FUNCTIONAL_REVIEW",
  "CODE_REVIEW",
  "DATA_REVIEW",
  "PERMISSION_REVIEW",
  "UX_REVIEW",
  "VERIFICATION_REVIEW",
  "DOCUMENTATION_REVIEW",
  "RELEASE_IMPACT_REVIEW",
  "DEBT_REVIEW",
  "EXISTING_GOVERNANCE_REVIEW",
  "SECURITY_PRIVACY_REVIEW",
]);

const alwaysRequiredSurfaces = [
  "FUNCTIONAL_REVIEW",
  "CODE_REVIEW",
  "VERIFICATION_REVIEW",
  "DEBT_REVIEW",
];

const allowedOutcomes = new Set([
  "REVIEW_SURFACE_RECORDED",
  "NEEDS_HUMAN_DECISION",
  "BLOCKED",
]);

const forbiddenClaims = [
  /\bwrites target files:\s*Yes\b/i,
  /\bmodifies CI:\s*Yes\b/i,
  /\binstalls hooks:\s*Yes\b/i,
  /\bdeletes or archives documents:\s*Yes\b/i,
  /\bchanges task state:\s*Yes\b/i,
  /\bapproves implementation:\s*Yes\b/i,
  /\bapproves release or production:\s*Yes\b/i,
  /\bproduction ready\b/i,
  /\brelease approved\b/i,
  /\bsafe to launch\b/i,
  /\bimplementation approved\b/i,
];

let failed = false;
const checks = [];

if (!outputJson) {
  console.log("# Review Surface Check");
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
checkCards();

if (isSourceRepo) checkSourceEvidence();
else pass("source-only 1.25 review surface evidence checks skipped for target project");

emitAndExit();

function checkCoreContent() {
  const core = readResolved("core/review-surface-governance.md");
  if (!core) return;
  for (const marker of [
    "Review Surface Governance",
    "Codex selects review surfaces",
    "Review Surface Card is pre-execution planning only",
    "DEBT_REVIEW is always required",
    "Post-Execution Review Contract",
    "This card approves implementation: No",
    "This card approves release or production: No",
  ]) {
    if (core.includes(marker)) pass(`review surface core includes ${marker}`);
    else fail(`review surface core missing ${marker}`);
  }
}

function checkCards() {
  const files = markdownFiles("review-surface-cards");
  if (files.length === 0) {
    pass("review surface check skipped: no Review Surface Cards");
    return;
  }

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const label = rel(file);
    for (const section of reportSections) requireSection(content, section, label);

    if (containsSecretLikeValue(content)) fail(`${label} contains secret-like content`);
    for (const pattern of forbiddenClaims) {
      if (pattern.test(content)) fail(`${label} contains forbidden review surface claim: ${pattern.source}`);
    }

    const surfaces = selectedSurfaceNames(content);
    if (surfaces.length === 0) fail(`${label} must include at least one selected review surface`);
    for (const surface of surfaces) {
      if (allowedSurfaces.has(surface)) pass(`${label} uses allowed surface ${surface}`);
      else fail(`${label} has invalid review surface: ${surface}`);
    }
    for (const surface of alwaysRequiredSurfaces) {
      if (surfaces.includes(surface)) pass(`${label} includes required review surface: ${surface}`);
      else fail(`${label} missing required review surface: ${surface}`);
    }

    requirePostExecutionContract(content, label);
    requireBoundaryNo(content, label, "This card writes target files");
    requireBoundaryNo(content, label, "This card modifies CI");
    requireBoundaryNo(content, label, "This card installs hooks");
    requireBoundaryNo(content, label, "This card deletes or archives documents");
    requireBoundaryNo(content, label, "This card changes task state");
    requireBoundaryNo(content, label, "This card approves implementation");
    requireBoundaryNo(content, label, "This card approves release or production");
    requireBoundaryNo(content, label, "This card approves security/privacy/compliance/payment/migration decisions");

    const riskLevel = strip(tableValue(content, "Risk level")).toLowerCase();
    const questions = numberedItems(sectionBody(content, "Questions For Human"));
    const maxQuestions = riskLevel === "high" ? 5 : 3;
    if (questions.length <= maxQuestions) pass(`${label} question count within limit`);
    else fail(`${label} asks too many questions: ${questions.length} > ${maxQuestions}`);

    const outcome = codeOrTextValue(sectionBody(content, "Outcome"));
    if (allowedOutcomes.has(outcome)) pass(`${label} has valid Outcome`);
    else fail(`${label} has invalid Outcome: ${outcome || "<empty>"}`);
  }
}

function requirePostExecutionContract(content, label) {
  const body = sectionBody(content, "Post-Execution Review Contract");
  for (const marker of [
    "Per-surface result",
    "Unverified surfaces",
    "Debt result",
    "Next delivery state",
  ]) {
    if (body.includes(marker)) pass(`${label} post-execution contract includes ${marker}`);
    else fail(`${label} post-execution contract missing ${marker}`);
  }
}

function selectedSurfaceNames(content) {
  const body = sectionBody(content, "Selected Review Surfaces");
  const found = [];
  for (const match of body.matchAll(/\b[A-Z]+(?:_[A-Z]+)*_REVIEW\b/g)) {
    if (!found.includes(match[0])) found.push(match[0]);
  }
  return found;
}

function checkSourceEvidence() {
  for (const file of [
    "examples/1.25-review-surface-governance/README.md",
    "examples/1.25-review-surface-governance/review-surface-cards/001-booking-review-surface.md",
    "releases/1.25.0/release-record.md",
    "releases/1.25.0/known-limitations.md",
    "releases/1.25.0/self-check-report.md",
  ]) {
    if (exists(file)) pass(`1.25 review surface source evidence exists ${file}`);
    else fail(`1.25 review surface source evidence missing ${file}`);
  }

  const resolver = runNode(["scripts/resolve-review-surface.mjs", "."]);
  if (resolver.status === 0
    && resolver.stdout.includes("Review Surface Card")
    && resolver.stdout.includes("This card writes target files: No")) {
    pass("1.25 review surface resolver prints safe card");
  } else {
    fail(`1.25 review surface resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-review-surface.mjs", ".", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "REVIEW_SURFACE_CARD"
        && parsed.boundaries?.writesTargetFiles === "No"
        && parsed.selectedReviewSurfaces?.some((item) => item.surface === "DEBT_REVIEW")) {
        pass("1.25 review surface resolver JSON includes boundaries and required surfaces");
      } else {
        fail(`1.25 review surface resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.25 review surface resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.25 review surface resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const example = runNode(["scripts/check-review-surface.mjs", "examples/1.25-review-surface-governance"]);
  if (example.status === 0 && example.stdout.includes("Review surface check passed")) {
    pass("1.25 review surface example passes checker");
  } else {
    fail(`1.25 review surface example failed: ${example.stderr || example.stdout}`);
  }

  for (const [name, target, expected] of [
    ["approval overclaim", "test-fixtures/bad/bad-review-surface-approves-implementation", "forbidden review surface claim"],
    ["missing debt", "test-fixtures/bad/bad-review-surface-missing-debt", "missing required review surface: DEBT_REVIEW"],
  ]) {
    const result = runNode(["scripts/check-review-surface.mjs", target]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.25 review surface rejects ${name}`);
    } else {
      fail(`1.25 review surface must reject ${name}: ${output}`);
    }
  }
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
      projectRoot,
      results: checks,
    }, null, 2));
  } else if (!failed) {
    console.log("");
    console.log("Review surface check passed.");
  }
  process.exit(failed ? 1 : 0);
}

function requireSection(content, section, label) {
  const body = sectionBody(content, section);
  if (body.trim()) pass(`${label} has ${section}`);
  else fail(`${label} missing ${section}`);
}

function requireBoundaryNo(content, label, key) {
  const pattern = new RegExp(`^-\\s*${escapeRegExp(key)}:\\s*No\\s*$`, "im");
  if (pattern.test(content)) pass(`${label} boundary ${key}: No`);
  else fail(`${label} missing boundary ${key}: No`);
}

function tableValue(content, label) {
  const pattern = new RegExp(`\\|\\s*${escapeRegExp(label)}\\s*\\|\\s*([^|]+)\\|`, "i");
  const match = content.match(pattern);
  return match ? strip(match[1]) : "";
}

function numberedItems(body) {
  return String(body || "")
    .split(/\r?\n/)
    .filter((line) => /^\s*\d+\.\s+/.test(line));
}

function sectionBody(content, section) {
  const pattern = new RegExp(`^##\\s+${escapeRegExp(section)}\\s*$`, "im");
  const match = pattern.exec(content);
  if (!match) return "";
  const start = match.index + match[0].length;
  const rest = content.slice(start);
  const next = /^##\s+/m.exec(rest);
  return next ? rest.slice(0, next.index).trim() : rest.trim();
}

function codeOrTextValue(body) {
  const code = String(body || "").match(/`([A-Z_]+)`/);
  if (code) return code[1];
  const text = String(body || "").trim().split(/\s+/)[0];
  return text ? text.replace(/[^A-Z_]/gi, "").toUpperCase() : "";
}

function markdownFiles(dir) {
  const rootDir = path.join(projectRoot, dir);
  if (!fs.existsSync(rootDir)) return [];
  const files = [];
  walk(rootDir, files);
  return files.filter((file) => /\.md$/i.test(file)).sort();
}

function walk(dir, files) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else files.push(full);
  }
}

function resolveAsset(file) {
  const targetAsset = path.join(projectRoot, file);
  if (fs.existsSync(targetAsset)) return targetAsset;
  const nativeAsset = path.join(projectRoot, ".ai-native", file);
  if (fs.existsSync(nativeAsset)) return nativeAsset;
  return null;
}

function resolveDirectory(dir) {
  const targetDir = path.join(projectRoot, dir);
  if (fs.existsSync(targetDir) && fs.statSync(targetDir).isDirectory()) return targetDir;
  return null;
}

function readResolved(file) {
  const resolved = resolveAsset(file);
  if (!resolved) return "";
  return fs.readFileSync(resolved, "utf8");
}

function exists(file) {
  return fs.existsSync(path.join(projectRoot, file));
}

function rel(file) {
  return path.relative(projectRoot, file).replaceAll(path.sep, "/");
}

function displayAsset(expected, resolved) {
  const relative = rel(resolved);
  return relative || expected;
}

function strip(value) {
  return String(value || "").replace(/`/g, "").replace(/\*\*/g, "").trim();
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function runNode(argv) {
  return spawnSync(process.execPath, argv, {
    cwd: projectRoot,
    encoding: "utf8",
  });
}
