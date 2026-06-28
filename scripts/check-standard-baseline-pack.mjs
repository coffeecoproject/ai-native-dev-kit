#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "./lib/args.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const kitRoot = path.resolve(__dirname, "..");
const validTypes = new Set(["primary-platform", "capability", "quality", "environment", "release"]);
const validStatuses = new Set(["draft", "candidate", "stable", "deprecated", "retired"]);
const requiredPackFiles = ["pack.json", "pack.md", "evidence.md", "maturity.md", "owner.md", "changelog.md"];
const requiredPackDirs = ["baselines", "checklists", "templates"];
const allowedPackMetadataKeys = new Set([
  "id",
  "type",
  "status",
  "displayName",
  "baselineLayer",
  "recommendedForBL",
  "allowedForBL",
  "activeByDefault",
  "appliesToProfiles",
  "recommendedWhen",
  "canBeRecommendedByAI",
  "selectionRequiresHumanDecision",
  "canAuthorizeWrites",
  "canApproveImplementation",
  "canApproveRelease",
  "canApproveComplianceSecurityPrivacy",
  "requiresEvidenceForConfirmed",
  "maturityStage",
  "extensions",
]);
const allowedPublicUrlHosts = new Set([
  "127.0.0.1",
  "localhost",
  "example.com",
  "example.invalid",
  "w3.org",
  "www.w3.org",
  "owasp.org",
  "www.owasp.org",
  "developer.mozilla.org",
  "docs.github.com",
  "developer.apple.com",
  "developer.android.com",
  "source.android.com",
]);

const args = parseArgs(process.argv.slice(2));
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputJson = Boolean(args.json);
const knownFlags = new Set(["json"]);
const results = [];
let failed = false;

for (const key of Object.keys(args)) {
  if (key !== "_" && !knownFlags.has(key)) {
    console.error(`FAIL unknown option: --${key}`);
    process.exit(1);
  }
}

function record(status, message) {
  results.push({ status, message });
  if (!outputJson) {
    const write = status === "FAIL" ? console.error : console.log;
    write(`${status} ${message}`);
  }
}

function pass(message) {
  record("PASS", message);
}

function fail(message) {
  failed = true;
  record("FAIL", message);
}

function readJson(filePath, label) {
  if (!fs.existsSync(filePath)) {
    fail(`${label} missing: ${filePath}`);
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    fail(`${label} invalid JSON: ${error.message}`);
    return null;
  }
}

function registryRoot(root) {
  const candidates = [
    path.join(root, ".ai-native", "standard-baseline-packs"),
    path.join(root, "standard-baseline-packs"),
    path.join(kitRoot, "standard-baseline-packs"),
  ];
  return candidates.find((candidate) => fs.existsSync(path.join(candidate, "index.json"))) || candidates[0];
}

function walkFiles(root) {
  if (!fs.existsSync(root)) return [];
  const out = [];
  for (const item of fs.readdirSync(root, { withFileTypes: true })) {
    const full = path.join(root, item.name);
    if (item.isDirectory()) out.push(...walkFiles(full));
    else out.push(full);
  }
  return out;
}

function rel(root, filePath) {
  return path.relative(root, filePath).replaceAll(path.sep, "/");
}

function hasForbiddenClaim(content) {
  const forbidden = [
    { label: "defaultForBL", pattern: /\bdefaultForBL\b/ },
    { label: "stable default", pattern: /\bstable default\b/i },
    { label: "production ready", pattern: /\bproduction[- ]ready\b/i },
    { label: "production baseline", pattern: /\bproduction baseline\b/i },
    { label: "validated for production", pattern: /\bvalidated for production\b/i },
    { label: "compliance ready", pattern: /\bcompliance ready\b/i },
    { label: "security approved", pattern: /\bsecurity approved\b/i },
    { label: "privacy approved", pattern: /\bprivacy approved\b/i },
    { label: "release approved", pattern: /\brelease approved\b/i },
    { label: "BL2 required", pattern: /\bBL2\b.{0,40}\brequired\b/i },
    { label: "must use this pack", pattern: /\bmust use this pack\b/i },
    { label: "write authorization", pattern: /\b(authorizes target-project writes|can authorize writes)\s*:\s*yes\b/i },
    { label: "implementation approval", pattern: /\b(can approve implementation|approves implementation)\s*:\s*yes\b/i },
    { label: "release approval", pattern: /\b(can approve release|approves release)\s*:\s*yes\b/i },
    { label: "compliance/security/privacy approval", pattern: /\b(can approve compliance|can approve security|can approve privacy|approves compliance\/security\/privacy)\s*:\s*yes\b/i },
  ];
  return forbidden.filter((item) => item.pattern.test(content));
}

function hasProjectSpecificSecret(content) {
  const findings = [];
  if (/\b(?:github_pat|ghp|sk-[A-Za-z0-9]|xox[baprs]-)[A-Za-z0-9_-]{8,}/.test(content)) {
    findings.push({ label: "token-like secret" });
  }

  const urlPattern = /\bhttps?:\/\/[^\s)]+/gi;
  const urls = content.match(urlPattern) || [];
  for (const rawUrl of urls) {
    const cleaned = rawUrl.replace(/[.,;:!?]+$/, "");
    try {
      const parsed = new URL(cleaned);
      if (!allowedPublicUrlHosts.has(parsed.hostname.toLowerCase())) {
        findings.push({ label: `private URL ${cleaned}` });
      }
    } catch {
      findings.push({ label: `private URL ${cleaned}` });
    }
  }

  const withoutUrls = content.replace(urlPattern, "");
  if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(withoutUrls)) {
    findings.push({ label: "email address" });
  }
  if (/\b[A-Za-z][A-Za-z0-9_]*(?:\.[A-Za-z][A-Za-z0-9_]*){2,}\b/.test(withoutUrls)) {
    findings.push({ label: "bundle id" });
  }
  return findings;
}

function validateBooleanFalse(pack, key, packId) {
  if (pack[key] === false) pass(`${packId} ${key} is false`);
  else fail(`${packId} ${key} must be false`);
}

function validateBooleanTrue(pack, key, packId) {
  if (pack[key] === true) pass(`${packId} ${key} is true`);
  else fail(`${packId} ${key} must be true`);
}

function validatePackMetadata(pack, source, packId) {
  for (const key of Object.keys(pack)) {
    if (allowedPackMetadataKeys.has(key)) pass(`${packId} metadata field allowed ${key}`);
    else fail(`${packId} unknown pack metadata field ${key}`);
  }
  if (pack.id === packId) pass(`${packId} id matches index`);
  else fail(`${source} id ${pack.id || "<missing>"} must match index id ${packId}`);
  if (/^[a-z0-9][a-z0-9-]*-standard$/.test(pack.id || "")) pass(`${packId} id ends with -standard`);
  else fail(`${packId} id must end with -standard`);
  if (validTypes.has(pack.type)) pass(`${packId} type ${pack.type}`);
  else fail(`${packId} invalid type ${pack.type || "<missing>"}`);
  if (pack.baselineLayer === "standard") pass(`${packId} baselineLayer standard`);
  else fail(`${packId} baselineLayer must be standard`);
  if (!Object.prototype.hasOwnProperty.call(pack, "defaultForBL")) pass(`${packId} does not use defaultForBL`);
  else fail(`${packId} must use recommendedForBL, not defaultForBL`);
  if (Array.isArray(pack.recommendedForBL)) pass(`${packId} recommendedForBL`);
  else fail(`${packId} missing recommendedForBL`);
  if (Array.isArray(pack.allowedForBL)) pass(`${packId} allowedForBL`);
  else fail(`${packId} missing allowedForBL`);
  validateBooleanFalse(pack, "activeByDefault", packId);
  validateBooleanTrue(pack, "canBeRecommendedByAI", packId);
  validateBooleanTrue(pack, "selectionRequiresHumanDecision", packId);
  validateBooleanFalse(pack, "canAuthorizeWrites", packId);
  validateBooleanFalse(pack, "canApproveImplementation", packId);
  validateBooleanFalse(pack, "canApproveRelease", packId);
  validateBooleanFalse(pack, "canApproveComplianceSecurityPrivacy", packId);
  validateBooleanTrue(pack, "requiresEvidenceForConfirmed", packId);
  if (validStatuses.has(pack.status)) pass(`${packId} status ${pack.status}`);
  else fail(`${packId} invalid status ${pack.status || "<missing>"}`);
  if (validStatuses.has(pack.maturityStage)) pass(`${packId} maturityStage ${pack.maturityStage}`);
  else fail(`${packId} invalid maturityStage ${pack.maturityStage || "<missing>"}`);
  if (pack.status === "draft" && pack.maturityStage === "draft") pass(`${packId} draft status and maturity aligned`);
  else if (pack.status === "draft") fail(`${packId} draft status must use draft maturityStage`);
}

function validatePack(root, entry) {
  const packId = entry.id || "<missing>";
  const packDir = path.join(root, entry.path || "");
  if (!fs.existsSync(packDir)) {
    fail(`${packId} pack directory missing`);
    return;
  }
  pass(`${packId} pack directory exists`);
  for (const file of requiredPackFiles) {
    const full = path.join(packDir, file);
    if (fs.existsSync(full) && fs.statSync(full).isFile()) pass(`${packId} required file ${file}`);
    else fail(`${packId} missing required file ${file}`);
  }
  for (const dir of requiredPackDirs) {
    const full = path.join(packDir, dir);
    if (fs.existsSync(full) && fs.statSync(full).isDirectory() && fs.readdirSync(full).length > 0) {
      pass(`${packId} required directory ${dir}`);
    } else {
      fail(`${packId} missing non-empty directory ${dir}`);
    }
  }
  const packJson = readJson(path.join(packDir, "pack.json"), `${packId} pack.json`);
  if (packJson) validatePackMetadata(packJson, `${packId} pack.json`, packId);

  const combined = walkFiles(packDir)
    .filter((file) => [".md", ".json"].includes(path.extname(file)))
    .map((file) => fs.readFileSync(file, "utf8"))
    .join("\n");
  const claims = hasForbiddenClaim(combined);
  if (claims.length === 0) pass(`${packId} avoids forbidden claims`);
  else for (const claim of claims) fail(`${packId} forbidden claim: ${claim.label}`);
  const secrets = hasProjectSpecificSecret(combined);
  if (secrets.length === 0) pass(`${packId} avoids project-specific secrets or URLs`);
  else for (const secret of secrets) fail(`${packId} contains project-specific ${secret.label}`);
}

const root = registryRoot(projectRoot);
if (!outputJson) {
  console.log("# Standard Baseline Pack Check");
  console.log("");
}

const index = readJson(path.join(root, "index.json"), "standard-baseline-packs/index.json");
if (index) {
  if (index.baselineLayer === "standard") pass("index baselineLayer standard");
  else fail("index baselineLayer must be standard");
  if (Array.isArray(index.packs)) pass("index packs array");
  else fail("index must contain packs array");
  const seen = new Set();
  for (const entry of index.packs || []) {
    if (!entry.id) {
      fail("index pack missing id");
      continue;
    }
    if (seen.has(entry.id)) fail(`duplicate pack id ${entry.id}`);
    else pass(`unique pack id ${entry.id}`);
    seen.add(entry.id);
    validatePack(root, entry);
  }
}

if (outputJson) {
  console.log(JSON.stringify({
    status: failed ? "FAIL" : "PASS",
    projectRoot,
    standardPacksRoot: root,
    results,
  }, null, 2));
}

if (failed) process.exit(1);

if (!outputJson) {
  console.log("");
  console.log("Standard baseline pack check passed.");
}
