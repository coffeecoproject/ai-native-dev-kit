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
  "core/real-project-adoption-trial.md",
  "templates/real-adoption-trial-report.md",
  "templates/existing-governance-map.md",
  "checklists/real-adoption-trial-review.md",
  "prompts/real-adoption-agent.md",
  "scripts/check-real-adoption-trial.mjs",
  "scripts/lib/risk-surfaces.mjs",
];

const requiredDirectories = [
  "real-adoption-trials",
  "governance-maps",
  "patch-classifications",
];

const reportSections = [
  "Human Summary",
  "Trial Boundary",
  "Target Project State",
  "Existing Governance Sources",
  "Bridge Layer Decision",
  "Governance Map",
  "Patch Classification",
  "Public Evidence",
  "Human Decisions",
  "Subagent Orchestration",
  "Verification Evidence",
  "Outcome",
];

const allowedModes = new Set([
  "NEW_PROJECT",
  "EXISTING_LIGHT_PROJECT",
  "EXISTING_GOVERNED_PROJECT",
  "EXISTING_PRODUCTION_PROJECT",
  "BLOCKED_UNKNOWN_RISK",
]);

const governedModes = new Set([
  "EXISTING_GOVERNED_PROJECT",
  "EXISTING_PRODUCTION_PROJECT",
]);

const allowedBridgeModes = new Set([
  "NO_WRITE_MAP",
  "DOCS_ONLY_BRIDGE",
  "THIN_OPERATIONAL_BRIDGE",
  "NOT_PROPOSED",
]);

const allowedEvidenceStatus = new Set([
  "LOCAL_ONLY",
  "SANITIZED_APPROVED",
  "PUBLIC_APPROVED",
]);

const allowedOutcomes = new Set([
  "READ_ONLY_ADOPTION_RECORDED",
  "NEEDS_HUMAN_DECISION",
  "BLOCKED",
]);

const forbiddenClaims = [
  /\bproduction[- ]validated\b/i,
  /\bproduction[- ]proven\b/i,
  /\bproduction[- ]ready\b/i,
  /\brelease approved\b/i,
  /\bsecurity approved\b/i,
  /\bprivacy approved\b/i,
  /\bcompliance approved\b/i,
  /\blegal approved\b/i,
  /\bfully safe\b/i,
  /\bguaranteed compliant\b/i,
  /\bvalidated by AI Native Dev Kit\b/i,
];

let failed = false;
const checks = [];

if (!outputJson) {
  console.log("# Real Adoption Trial Check");
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
checkRealAdoptionReports();

if (isSourceRepo) checkSourceEvidence();
else pass("source-only 1.8 real adoption evidence checks skipped for target project");

emitAndExit();

function checkCoreContent() {
  const core = readResolved("core/real-project-adoption-trial.md");
  if (!core) return;
  for (const marker of [
    "Real project adoption is read-only by default",
    "primary mode plus secondary tags",
    "NO_WRITE_MAP",
    "DOCS_ONLY_BRIDGE",
    "THIN_OPERATIONAL_BRIDGE",
    "Public Evidence Status",
    "Patch classification authorizes code changes",
  ]) {
    if (core.includes(marker)) pass(`real adoption core includes ${marker}`);
    else fail(`real adoption core missing ${marker}`);
  }
}

function checkRealAdoptionReports() {
  const files = markdownFiles("real-adoption-trials");
  if (files.length === 0) {
    pass("real adoption check skipped: no real adoption trial reports");
    return;
  }

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const label = rel(file);
    for (const section of reportSections) requireSection(content, section, label);

    if (containsSecretLikeValue(content)) fail(`${label} contains secret-like content`);
    for (const pattern of forbiddenClaims) {
      if (pattern.test(content)) fail(`${label} contains forbidden real-adoption overclaim: ${pattern.source}`);
    }

    requireTableValue(content, label, "Trial mode", "READ_ONLY");
    requireTableValue(content, label, "No target writes performed", "Yes");
    requireTableValue(content, label, "External service commands run", "No");
    requireTableValue(content, label, "Runtime / DB / migration / seed commands run", "No");
    requireTableValue(content, label, "Target git status checked before", "Yes");
    requireTableValue(content, label, "Target git status checked after", "Yes");

    const mode = tableValue(content, "Primary adoption mode");
    if (allowedModes.has(mode)) pass(`${label} has valid primary adoption mode`);
    else fail(`${label} has invalid primary adoption mode: ${mode || "<empty>"}`);

    const secondaryTags = tableValue(content, "Secondary risk tags");
    if (secondaryTags) pass(`${label} records secondary risk tags`);
    else fail(`${label} must record secondary risk tags`);

    const confidence = tableValue(content, "Confidence");
    if (/^(low|medium|high)$/i.test(confidence)) pass(`${label} records confidence`);
    else fail(`${label} must record confidence as low, medium, or high`);

    const evidence = tableValue(content, "Evidence");
    if (evidence && !/[<>]/.test(evidence)) pass(`${label} records concrete evidence`);
    else fail(`${label} must replace placeholder evidence`);

    const bridgeMode = tableValue(content, "Bridge layer mode");
    if (allowedBridgeModes.has(bridgeMode)) pass(`${label} has valid bridge layer mode`);
    else fail(`${label} has invalid bridge layer mode: ${bridgeMode || "<empty>"}`);

    if (governedModes.has(mode)) {
      if (bridgeMode) pass(`${label} records bridge layer mode for governed/production project`);
      requireTableValue(content, label, "Human approval required before bridge writes", "Yes");
    }

    const agentsProposed = tableValue(content, "AGENTS.md proposed");
    if (/^Yes$/i.test(agentsProposed)) {
      const existingAgent = tableValue(content, "Existing agent.md considered");
      if (/agent\.md|absent/i.test(existingAgent)) {
        pass(`${label} considers existing agent authority before AGENTS.md`);
      } else {
        fail(`${label} proposes AGENTS.md without considering existing agent.md`);
      }
    }

    const governanceBody = sectionBody(content, "Existing Governance Sources");
    if (/(agent|baseline|gate|release|rollback|evidence|governance)/i.test(governanceBody)
      && /(keep|map|gap)/i.test(governanceBody)) {
      pass(`${label} maps existing governance sources`);
    } else {
      fail(`${label} must map existing governance sources`);
    }

    const publicStatus = tableValue(content, "Public Evidence Status");
    if (allowedEvidenceStatus.has(publicStatus)) pass(`${label} has valid Public Evidence Status`);
    else fail(`${label} has invalid Public Evidence Status: ${publicStatus || "<empty>"}`);

    const concreteName = tableValue(content, "Concrete target name included");
    if (/^Yes$/i.test(concreteName) && publicStatus === "LOCAL_ONLY") {
      fail(`${label} cannot include a concrete target name when Public Evidence Status is LOCAL_ONLY`);
    } else {
      pass(`${label} respects public evidence naming boundary`);
    }

    if (/WorkControl|\/Users\/liushan\/Developer\/WorkControl/.test(content) && publicStatus !== "PUBLIC_APPROVED") {
      fail(`${label} includes a concrete private target reference without PUBLIC_APPROVED status`);
    }

    requireSubagentClosure(content, label);
    requireHumanDecisionBoundary(content, label);

    const outcome = codeOrTextValue(sectionBody(content, "Outcome"));
    if (allowedOutcomes.has(outcome)) pass(`${label} has valid Outcome`);
    else fail(`${label} has invalid Outcome: ${outcome || "<empty>"}`);
  }
}

function checkSourceEvidence() {
  for (const file of [
    "real-adoption-trials/180-governed-web-readonly.md",
    "governance-maps/180-governed-web-readonly.md",
    "patch-classifications/180-governed-web-repair-scale.md",
    "examples/1.8-real-project-readonly/README.md",
    "releases/1.8.0/release-record.md",
    "releases/1.8.0/known-limitations.md",
    "releases/1.8.0/self-check-report.md",
  ]) {
    if (exists(file)) pass(`real adoption source evidence exists ${file}`);
    else fail(`real adoption source evidence missing ${file}`);
  }

  for (const [name, target, expected] of [
    ["overclaim", "test-fixtures/bad/bad-real-adoption-overclaim", "forbidden real-adoption overclaim"],
    ["target write", "test-fixtures/bad/bad-real-adoption-target-write", "No target writes performed"],
    ["public name boundary", "test-fixtures/bad/bad-real-adoption-public-name", "Public Evidence Status is LOCAL_ONLY"],
  ]) {
    const result = runSelf([target]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`real adoption rejects ${name}`);
    } else {
      fail(`real adoption must reject ${name}: ${output}`);
    }
  }
}

function requireTableValue(content, label, field, expected) {
  const value = tableValue(content, field);
  if (value === expected) pass(`${label} ${field} is ${expected}`);
  else fail(`${label} ${field} must be ${expected}, got ${value || "<empty>"}`);
}

function requireHumanDecisionBoundary(content, label) {
  const body = sectionBody(content, "Human Decisions");
  if (!body || !/\b(PENDING|APPROVED|DEFERRED|NOT_APPROVED|Not Approved)\b/i.test(body)) {
    fail(`${label} must record human decisions`);
    return;
  }
  if (!/(public evidence|bridge|write|production|release|risk|approval)/i.test(body)) {
    fail(`${label} must keep bridge, write, risk, or public-evidence decisions human-owned`);
    return;
  }
  pass(`${label} records human decision boundary`);
}

function requireSubagentClosure(content, label) {
  const body = sectionBody(content, "Subagent Orchestration");
  if (!body) {
    fail(`${label} missing subagent orchestration boundary`);
    return;
  }
  if (/\bRUNNING\b/i.test(body)) {
    fail(`${label} must not leave subagents RUNNING`);
    return;
  }
  if (!/\b(NOT_USED|CLOSED|SKIPPED)\b/i.test(body)) {
    fail(`${label} must mark subagents NOT_USED, CLOSED, or SKIPPED`);
    return;
  }
  pass(`${label} closes or skips subagents`);
}

function markdownFiles(dir) {
  const resolved = resolveDirectory(dir);
  if (!resolved) return [];
  const files = [];
  walk(resolved, (file) => {
    if (file.endsWith(".md")) files.push(file);
  });
  return files.sort();
}

function walk(dir, visit) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, visit);
    else visit(full);
  }
}

function exists(relativePath) {
  return Boolean(resolveAsset(relativePath) || resolveDirectory(relativePath));
}

function resolveAsset(relativePath) {
  const candidates = assetCandidates(relativePath);
  return candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile()) || null;
}

function resolveDirectory(relativePath) {
  const candidates = assetCandidates(relativePath);
  return candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) || null;
}

function readResolved(relativePath) {
  const resolved = resolveAsset(relativePath);
  return resolved ? fs.readFileSync(resolved, "utf8") : "";
}

function assetCandidates(relativePath) {
  const normalized = relativePath.replace(/^\.\//, "");
  const candidates = [path.join(projectRoot, normalized)];
  if (!isSourceRepo && !normalized.startsWith(".ai-native/")) {
    candidates.push(path.join(projectRoot, ".ai-native", normalized));
  }
  return candidates;
}

function displayAsset(expected, resolved) {
  return rel(resolved) === expected ? expected : `${expected} (${rel(resolved)})`;
}

function requireSection(content, section, label) {
  const pattern = new RegExp(`^##\\s+${escapeRegExp(section)}\\s*$`, "m");
  if (pattern.test(content)) pass(`${label} includes section ${section}`);
  else fail(`${label} missing section ${section}`);
}

function sectionBody(content, section) {
  const pattern = new RegExp(`^##\\s+${escapeRegExp(section)}\\s*\\n([\\s\\S]*?)(?=^##\\s+|(?![\\s\\S]))`, "m");
  const match = content.match(pattern);
  return match ? match[1].trim() : "";
}

function tableValue(content, field) {
  const pattern = new RegExp(`^\\|\\s*${escapeRegExp(field)}\\s*\\|\\s*([^|]+?)\\s*\\|\\s*$`, "mi");
  const match = content.match(pattern);
  return match ? match[1].trim().replace(/^`|`$/g, "") : "";
}

function codeOrTextValue(body) {
  const code = body.match(/`([^`]+)`/);
  if (code) return code[1].trim();
  return body.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)[0] || "";
}

function rel(fullPath) {
  return path.relative(projectRoot, fullPath).replaceAll(path.sep, "/") || ".";
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function runSelf(extraArgs) {
  return spawnSync(process.execPath, [new URL(import.meta.url).pathname, ...extraArgs], {
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
  if (!outputJson) console.error(`FAIL ${message}`);
}

function emitAndExit() {
  if (outputJson) {
    console.log(JSON.stringify({
      status: failed ? "FAIL" : "PASS",
      target: projectRoot,
      checks,
    }, null, 2));
  } else {
    console.log("");
    console.log(failed ? "Real adoption trial check failed" : "Real adoption trial check passed");
  }
  process.exit(failed ? 1 : 0);
}
