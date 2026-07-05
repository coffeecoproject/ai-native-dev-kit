#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { sectionBody } from "./lib/markdown.mjs";
import { containsSecretLikeValue } from "./lib/risk-surfaces.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["json", "strict"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputJson = Boolean(args.json);
const strictMode = Boolean(args.strict);
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
  "core/platform-release-recipes.md",
  "docs/platform-release-recipes.md",
  "templates/platform-release-recipe.md",
  "checklists/platform-release-recipe-review.md",
  "prompts/platform-release-recipe-agent.md",
  "scripts/resolve-platform-release-recipe.mjs",
  "scripts/check-platform-release-recipe.mjs",
];
const requiredDirectories = ["release-recipes"];
const requiredSections = [
  "Human Summary",
  "Platform Signals",
  "Supported Targets",
  "Required Inputs",
  "Preflight Checks",
  "Human Decisions",
  "Codex Allowed Actions",
  "Codex Blocked Actions",
  "Required Evidence",
  "Rollback Requirements",
  "Monitoring Requirements",
  "Release Execution Bridge",
  "Known Limits",
  "Boundaries",
  "Outcome",
];
const strictRecipeIds = new Set(["web-hosted-preview", "backend-api-handoff", "mini-program-review-handoff"]);
const allowedOutcomes = new Set(["RECIPE_RECORDED", "DRAFT_RECIPE_RECORDED"]);
const forbiddenClaims = [
  /\brelease approved\b/i,
  /\bproduction approved\b/i,
  /\bapproved for production\b/i,
  /\bCodex will deploy production\b/i,
  /\bCodex deploys production\b/i,
  /\bCodex will publish\b/i,
  /\bCodex will upload\b/i,
  /\bCodex will submit (app store|mini program|wechat|play store)\b/i,
  /\bautomatically deploy(s|ed)?\b/i,
  /\bautomatically publish(es|ed)?\b/i,
  /\bThis recipe approves release:\s*Yes\b/i,
  /\bThis recipe deploys or publishes by itself:\s*Yes\b/i,
  /\bThis recipe asks for or stores secrets:\s*Yes\b/i,
  /\bThis recipe changes CI\/CD, hooks, DNS, payment, permissions, app-store state, mini-program state, production data, or production config:\s*Yes\b/i,
  /\bThis recipe makes Codex the release owner:\s*Yes\b/i,
  /\bThis recipe treats provider assumptions as certainty:\s*Yes\b/i,
];
const secretRequestPattern = /\b([A-Z0-9_]*(TOKEN|SECRET|KEY|PASSWORD|PRIVATE_KEY)[A-Z0-9_]*\s*=|ask for|paste|send|provide|store|record).{0,80}\b(secret|token|password|private key|api key|credential)\b/i;
const codexHighRiskPattern = /\b(production deploy|deploy production|publish preview|preview publish|upload|submit review|submit app|mini-program release|app-store|play console|database migration|production migration|DNS|payment|permission|production config|remote-state|provider API|trigger CI|ssh production)\b/i;
const localSafePattern = /\b(LOCAL_READ_ONLY|LOCAL_BUILD|LOCAL_TEST|CODEX_MAY_RUN|CODEX_MAY_RUN_IF_APPROVED_LOCAL_SAFE)\b/i;
const providerCertaintyPattern = /\b(guaranteed|definitely|certainly|must be Vercel|must be Netlify|must be Cloudflare|always uses|provider is definitely)\b/i;

let failed = false;
const checks = [];

if (!outputJson) {
  console.log("# Platform Release Recipe Check");
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
checkRecipes();

if (isSourceRepo) checkSourceEvidence();
else pass("source-only 1.59 platform release recipe evidence checks skipped for target project");

emitAndExit();

function checkCoreContent() {
  const combined = [
    readResolved("core/platform-release-recipes.md"),
    readResolved("docs/platform-release-recipes.md"),
  ].join("\n");
  if (!combined.trim()) return;
  for (const marker of [
    "Platform Release Recipes",
    "read-only maps",
    "Strict And Draft Recipes",
    "Recipe Selection",
    "does not approve release",
  ]) {
    if (combined.includes(marker)) pass(`platform release recipe docs include ${marker}`);
    else fail(`platform release recipe docs missing ${marker}`);
  }
}

function checkRecipes() {
  const files = markdownFiles("release-recipes");
  if (files.length === 0) {
    pass("platform release recipe check skipped: no recipes");
    return;
  }

  const seenStrict = new Set();
  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const label = rel(file);
    for (const section of requiredSections) requireSection(content, section, label);
    if (containsSecretLikeValue(content) || secretRequestPattern.test(content)) fail(`${label} contains secret-like content or asks for secrets`);
    for (const pattern of forbiddenClaims) {
      if (pattern.test(content)) fail(`${label} contains forbidden platform release recipe claim: ${pattern.source}`);
    }
    if (providerCertaintyPattern.test(content)) fail(`${label} presents provider assumptions as certainty`);

    const summary = sectionBody(content, "Human Summary") || "";
    const recipeId = tableValue(summary, "Recipe ID");
    const recipeStatus = tableValue(summary, "Recipe Status");
    const platformFamily = tableValue(summary, "Platform Family");
    const confidence = tableValue(summary, "Selection Confidence");
    const safeTarget = tableValue(summary, "Safe First Target");
    const releaseOwner = tableValue(summary, "Release Owner");
    const outcome = codeOrTextValue(sectionBody(content, "Outcome"));

    if (recipeId) pass(`${label} records Recipe ID`);
    else fail(`${label} must record Recipe ID`);
    if (new Set(["STRICT", "DRAFT"]).has(recipeStatus)) pass(`${label} records valid Recipe Status`);
    else fail(`${label} must record Recipe Status as STRICT or DRAFT`);
    if (platformFamily) pass(`${label} records Platform Family`);
    else fail(`${label} must record Platform Family`);
    if (new Set(["HIGH", "MEDIUM", "LOW", "CONFLICT"]).has(confidence)) pass(`${label} records valid Selection Confidence`);
    else fail(`${label} must record Selection Confidence`);
    if (isConcrete(safeTarget)) pass(`${label} records Safe First Target`);
    else fail(`${label} must record Safe First Target`);
    if (isConcrete(releaseOwner) && /HUMAN|EXTERNAL/i.test(releaseOwner)) pass(`${label} records human/external Release Owner`);
    else fail(`${label} must keep Release Owner human or external-system owned`);
    if (allowedOutcomes.has(outcome)) pass(`${label} has valid Outcome`);
    else fail(`${label} has invalid Outcome: ${outcome || "<empty>"}`);

    if (strictMode && recipeStatus !== "STRICT") fail(`${label} cannot pass --strict while status is ${recipeStatus || "<empty>"}`);
    if (recipeStatus === "STRICT") {
      if (strictRecipeIds.has(recipeId)) seenStrict.add(recipeId);
      checkStrictRecipe(content, label);
    }
    checkCodexBoundary(content, label);

    for (const boundary of [
      "This recipe approves release",
      "This recipe deploys or publishes by itself",
      "This recipe asks for or stores secrets",
      "This recipe changes CI/CD, hooks, DNS, payment, permissions, app-store state, mini-program state, production data, or production config",
      "This recipe makes Codex the release owner",
      "This recipe treats provider assumptions as certainty",
    ]) {
      requireBoundaryNo(content, label, boundary);
    }
  }

  if (isSourceRepo) {
    for (const id of strictRecipeIds) {
      if (seenStrict.has(id)) pass(`1.59 strict recipe exists: ${id}`);
      else fail(`1.59 strict recipe missing: ${id}`);
    }
  }
}

function checkStrictRecipe(content, label) {
  for (const [section, marker] of [
    ["Required Inputs", /release owner/i],
    ["Required Inputs", /environment|SOP|migration|platform account|review/i],
    ["Required Evidence", /release owner/i],
    ["Rollback Requirements", /rollback|fallback|restore/i],
    ["Monitoring Requirements", /monitoring|observation|health|smoke|feedback/i],
    ["Human Decisions", /HUMAN_REQUIRED/i],
    ["Codex Blocked Actions", /secret|production|upload|submit|migration|DNS|payment|permission|config/i],
  ]) {
    const body = sectionBody(content, section) || "";
    if (marker.test(body)) pass(`${label} strict recipe includes ${section} evidence`);
    else fail(`${label} strict recipe missing required ${section} content`);
  }
}

function checkCodexBoundary(content, label) {
  const allowedBody = sectionBody(content, "Codex Allowed Actions") || "";
  const rows = tableRows(allowedBody);
  if (rows.length > 0) pass(`${label} records Codex Allowed Actions`);
  else fail(`${label} must record Codex Allowed Actions`);
  for (const row of rows) {
    if (codexHighRiskPattern.test(row)) {
      fail(`${label} puts remote/high-risk release action in Codex Allowed Actions: ${row}`);
    }
    if (!localSafePattern.test(row) && !/\bPREVIEW_PREPARE\b/i.test(row)) {
      fail(`${label} Codex Allowed Action lacks safe risk class: ${row}`);
    }
  }
}

function checkSourceEvidence() {
  for (const file of [
    "docs/plans/release-path-consolidation-1.58-1.60-plan.md",
    "docs/plans/platform-release-recipes-1.59-plan.md",
    "core/platform-release-recipes.md",
    "docs/platform-release-recipes.md",
    "templates/platform-release-recipe.md",
    "checklists/platform-release-recipe-review.md",
    "prompts/platform-release-recipe-agent.md",
    "release-recipes/web-hosted-preview.md",
    "release-recipes/backend-api-handoff.md",
    "release-recipes/mini-program-review-handoff.md",
    "release-recipes/draft-ios-testflight.md",
    "release-recipes/draft-android-internal-testing.md",
    "release-recipes/draft-internal-admin-rollout.md",
    "release-recipes/draft-web-container-release.md",
    "examples/1.59-platform-release-recipes/web-hosted-preview/README.md",
    "examples/1.59-platform-release-recipes/web-hosted-preview/release-recipes/001-web-hosted-preview.md",
    "examples/1.59-platform-release-recipes/mini-program-review/README.md",
    "examples/1.59-platform-release-recipes/mini-program-review/release-recipes/001-mini-program-review.md",
    "examples/1.59-platform-release-recipes/backend-api-handoff/README.md",
    "examples/1.59-platform-release-recipes/backend-api-handoff/release-recipes/001-backend-api-handoff.md",
    "test-fixtures/bad/bad-release-recipe-codex-production/release-recipes/001-bad.md",
    "test-fixtures/bad/bad-release-recipe-secret-request/release-recipes/001-bad.md",
    "test-fixtures/bad/bad-release-recipe-missing-rollback/release-recipes/001-bad.md",
    "test-fixtures/bad/bad-release-recipe-missing-monitoring/release-recipes/001-bad.md",
    "test-fixtures/bad/bad-release-recipe-missing-owner/release-recipes/001-bad.md",
    "test-fixtures/bad/bad-release-recipe-provider-certainty/release-recipes/001-bad.md",
    "test-fixtures/bad/bad-release-recipe-draft-strict/release-recipes/001-bad.md",
    "releases/1.59.0/release-record.md",
    "releases/1.59.0/known-limitations.md",
    "releases/1.59.0/self-check-report.md",
  ]) {
    if (exists(file)) pass(`1.59 platform release recipe source evidence exists ${file}`);
    else fail(`1.59 platform release recipe source evidence missing ${file}`);
  }

  const resolver = runNode(["scripts/resolve-platform-release-recipe.mjs", ".", "--intent", "help me launch"]);
  if (resolver.status === 0
    && resolver.stdout.includes("# Platform Release Recipe Selection")
    && resolver.stdout.includes("## Beginner Recipe Card")
    && resolver.stdout.includes("This recipe approves release: No")
    && resolver.stdout.includes("This recipe deploys or publishes by itself: No")) {
    pass("1.59 platform release recipe resolver prints safe selection");
  } else {
    fail(`1.59 platform release recipe resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-platform-release-recipe.mjs", ".", "--intent", "help me launch", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "PLATFORM_RELEASE_RECIPE_SELECTION"
        && parsed.humanSummary?.selectedRecipeId
        && parsed.boundaries?.approvesRelease === "No"
        && Array.isArray(parsed.codexAllowedActions)) {
        pass("1.59 platform release recipe resolver JSON includes recipe, boundaries, and allowed actions");
      } else {
        fail(`1.59 platform release recipe resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.59 platform release recipe resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.59 platform release recipe resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  pass("1.59 platform release recipe checker is executing source repo checks");

  for (const target of [
    "examples/1.59-platform-release-recipes/web-hosted-preview",
    "examples/1.59-platform-release-recipes/mini-program-review",
    "examples/1.59-platform-release-recipes/backend-api-handoff",
  ]) {
    const result = runNode(["scripts/check-platform-release-recipe.mjs", target, "--strict"]);
    if (result.status === 0 && result.stdout.includes("Platform Release Recipe check passed")) {
      pass(`1.59 platform release recipe example passes: ${target}`);
    } else {
      fail(`1.59 platform release recipe example failed ${target}: ${result.stderr || result.stdout}`);
    }
  }

  for (const [name, target, expected] of [
    ["codex production", "test-fixtures/bad/bad-release-recipe-codex-production", "Codex Allowed Actions"],
    ["secret request", "test-fixtures/bad/bad-release-recipe-secret-request", "secret"],
    ["missing rollback", "test-fixtures/bad/bad-release-recipe-missing-rollback", "Rollback Requirements"],
    ["missing monitoring", "test-fixtures/bad/bad-release-recipe-missing-monitoring", "Monitoring Requirements"],
    ["missing owner", "test-fixtures/bad/bad-release-recipe-missing-owner", "Release Owner"],
    ["provider certainty", "test-fixtures/bad/bad-release-recipe-provider-certainty", "provider assumptions"],
    ["draft strict", "test-fixtures/bad/bad-release-recipe-draft-strict", "cannot pass --strict"],
  ]) {
    const args = ["scripts/check-platform-release-recipe.mjs", target];
    if (name === "draft strict") args.push("--strict");
    const result = runNode(args);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.59 platform release recipe rejects ${name}`);
    } else {
      fail(`1.59 platform release recipe must reject ${name}: ${output}`);
    }
  }
}

function resolveAsset(relativePath) {
  const direct = path.join(projectRoot, relativePath);
  if (fs.existsSync(direct)) return direct;
  const intentOS = path.join(projectRoot, ".intentos", relativePath);
  if (fs.existsSync(intentOS)) return intentOS;
  const intentOSBasename = path.join(projectRoot, ".intentos", path.basename(path.dirname(relativePath)), path.basename(relativePath));
  if (fs.existsSync(intentOSBasename)) return intentOSBasename;
  return null;
}

function resolveDirectory(relativePath) {
  const direct = path.join(projectRoot, relativePath);
  if (fs.existsSync(direct) && fs.statSync(direct).isDirectory()) return direct;
  const intentOS = path.join(projectRoot, ".intentos", relativePath);
  if (fs.existsSync(intentOS) && fs.statSync(intentOS).isDirectory()) return intentOS;
  return null;
}

function readResolved(relativePath) {
  const resolved = resolveAsset(relativePath);
  if (!resolved) return "";
  return fs.readFileSync(resolved, "utf8");
}

function markdownFiles(relativeDir) {
  const dir = resolveDirectory(relativeDir);
  if (!dir) return [];
  const files = [];
  walk(dir);
  return files.filter((file) => file.endsWith(".md")).sort();

  function walk(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else files.push(full);
    }
  }
}

function requireSection(content, section, label) {
  if (sectionBody(content, section) !== null) pass(`${label} includes ${section}`);
  else fail(`${label} missing section: ${section}`);
}

function requireBoundaryNo(content, label, boundary) {
  const pattern = new RegExp(`${escapeRegExp(boundary)}:\\s*No\\b`, "i");
  if (pattern.test(content)) pass(`${label} boundary ${boundary}: No`);
  else fail(`${label} must include boundary '${boundary}: No'`);
}

function tableValue(body, key) {
  const normalizedKey = key.toLowerCase();
  for (const row of tableRows(body || "")) {
    const cells = splitRow(row);
    if ((cells[0] || "").replace(/`/g, "").trim().toLowerCase() === normalizedKey) {
      return stripCode(cells[1] || "");
    }
  }
  return "";
}

function tableRows(body) {
  return String(body || "")
    .split(/\r?\n/)
    .filter((line) => /^\|/.test(line) && !/---/.test(line))
    .filter((line) => {
      const first = stripCode(splitRow(line)[0] || "").toLowerCase();
      return !new Set([
        "field",
        "signal",
        "target",
        "input",
        "check",
        "decision",
        "action",
        "evidence",
        "requirement",
      ]).has(first);
    });
}

function splitRow(row) {
  return row.split("|").slice(1, -1).map((cell) => cell.trim());
}

function codeOrTextValue(body) {
  const value = String(body || "").trim();
  const code = value.match(/`([^`]+)`/);
  return stripCode(code ? code[1] : value.split(/\r?\n/)[0] || "");
}

function stripCode(value) {
  return String(value || "").replace(/`/g, "").trim();
}

function isConcrete(value) {
  const normalized = stripCode(value);
  return Boolean(normalized) && !/^(N\/A|TBD|TODO|PENDING|UNKNOWN|REPLACE_WITH|none)$/i.test(normalized);
}

function displayAsset(expected, resolved) {
  const normalized = resolved.split(path.sep).join("/");
  if (normalized.includes("/.intentos/")) return `.intentos/${expected}`;
  return expected;
}

function exists(relativePath) {
  return fs.existsSync(path.join(projectRoot, relativePath));
}

function rel(file) {
  return path.relative(projectRoot, file).split(path.sep).join("/");
}

function read(relativePath) {
  try {
    return fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
  } catch {
    return "";
  }
}

function runNode(argv) {
  return spawnSync(process.execPath, argv, {
    cwd: projectRoot,
    encoding: "utf8",
  });
}

function pass(message) {
  checks.push({ status: "PASS", message });
  if (!outputJson) console.log(`PASS ${message}`);
}

function fail(message) {
  failed = true;
  checks.push({ status: "FAIL", message });
  if (!outputJson) console.log(`FAIL ${message}`);
}

function emitAndExit() {
  if (outputJson) {
    console.log(JSON.stringify({ ok: !failed, checks }, null, 2));
  } else {
    console.log("");
    console.log(failed ? "Platform Release Recipe check failed." : "Platform Release Recipe check passed.");
  }
  process.exit(failed ? 1 : 0);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
