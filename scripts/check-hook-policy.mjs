#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { containsSecretLikeValue } from "./lib/risk-surfaces.mjs";

const args = parseArgs(process.argv.slice(2));
const unknown = unknownOptions(args, new Set(["json"]));
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
  "core/hook-policy.md",
  "docs/hook-policy.md",
  "templates/project-hook-policy.md",
  "checklists/hook-policy-review.md",
  "prompts/hook-policy-agent.md",
  "scripts/resolve-hook-policy.mjs",
  "scripts/check-hook-policy.mjs",
];
const requiredDirectories = ["hook-policies"];
const reportSections = [
  "Human Decision Summary",
  "Policy State",
  "Existing Hook Sources",
  "Allowed Hook Classes",
  "Approval Matrix",
  "Rollback / Disable Policy",
  "Forbidden Automatic Actions",
  "Relationship To Hook Orchestration",
  "Human Decisions Needed",
  "Boundary",
  "Outcome",
];
const allowedStates = new Set([
  "NO_POLICY_FOUND",
  "POLICY_DRAFT_READY",
  "POLICY_REVIEW_REQUIRED",
  "GOVERNED_POLICY_PRESENT",
  "BLOCKED_BY_EXISTING_HOOK_RISK",
  "BLOCKED",
]);
const requiredHookClasses = [
  "H0_AUTO_READ_ONLY",
  "H1_AUTO_SUGGESTION",
  "H2_REQUIRES_CONFIRMATION",
  "H3_EXPLICIT_APPROVAL_REQUIRED",
];
const allowedOutcomes = new Set(["HOOK_POLICY_RECORDED", "NEEDS_HUMAN_DECISION", "BLOCKED"]);
const forbiddenClaims = [
  /\bThis policy installs hooks:\s*Yes\b/i,
  /\bThis policy modifies CI:\s*Yes\b/i,
  /\bThis policy adds blocking gates:\s*Yes\b/i,
  /\bThis policy calls external APIs:\s*Yes\b/i,
  /\bThis policy stores tokens or secrets:\s*Yes\b/i,
  /\bThis policy enables auto-?fix:\s*Yes\b/i,
  /\bThis policy treats hook output as human approval:\s*Yes\b/i,
  /\bThis policy approves implementation, release, or production:\s*Yes\b/i,
  /\bThis policy replaces Hook Orchestration:\s*Yes\b/i,
  /\bCan install hooks now\?\s*\|\s*Yes\s*\|/i,
  /\bhooks?\s+(were\s+)?(installed|enabled|activated)\b/i,
  /\bCI\s+(was\s+)?(modified|changed|updated)\b/i,
  /\bblocking\s+gate\s+(added|enabled|activated)\b/i,
  /\bexternal\s+API\s+(enabled|called|configured)\b/i,
  /\bauto-?fix\s+(enabled|approved|authorized)\b/i,
  /\bhook\s+output\s+(is\s+)?human\s+approval\b/i,
  /\bapproved\s+by\s+Codex\b/i,
  /\brelease\s+(approved|authorized|ready)\b/i,
  /\bproduction\s+(approved|authorized|ready)\b/i,
];

let failed = false;
const checks = [];

if (!outputJson) {
  console.log("# Project Hook Policy Check");
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
checkPolicies();
if (isSourceRepo) checkSourceEvidence();
else pass("source-only 1.29 hook policy evidence checks skipped for target project");
emitAndExit();

function checkCoreContent() {
  const core = readResolved("core/hook-policy.md");
  if (!core) return;
  for (const marker of [
    "Project Hook Policy Governance",
    "Hook policy is authorization planning only",
    "POLICY_REVIEW_REQUIRED",
    "H0_AUTO_READ_ONLY",
    "H1_AUTO_SUGGESTION",
    "H2_REQUIRES_CONFIRMATION",
    "H3_EXPLICIT_APPROVAL_REQUIRED",
    "This policy installs hooks: No",
    "This policy replaces Hook Orchestration: No",
  ]) {
    if (core.includes(marker)) pass(`hook policy core includes ${marker}`);
    else fail(`hook policy core missing ${marker}`);
  }
}

function checkPolicies() {
  const files = markdownFiles("hook-policies");
  if (files.length === 0) {
    pass("hook policy check skipped: no Project Hook Policies");
    return;
  }

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const label = rel(file);
    for (const section of reportSections) requireSection(content, section, label);
    if (containsSecretLikeValue(content)) fail(`${label} contains secret-like content`);
    const scanContent = contentForForbiddenScan(content);
    for (const pattern of forbiddenClaims) {
      if (pattern.test(scanContent)) fail(`${label} contains forbidden hook policy claim: ${pattern.source}`);
    }

    requirePolicyState(content, label);
    requireAllowedHookClasses(content, label);
    requireApprovalMatrix(content, label);
    requireRollbackDisablePolicy(content, label);
    requireForbiddenAutomaticActions(content, label);
    requireRelationship(content, label);
    requireBoundaryNo(content, label, "This policy installs hooks");
    requireBoundaryNo(content, label, "This policy modifies CI");
    requireBoundaryNo(content, label, "This policy adds blocking gates");
    requireBoundaryNo(content, label, "This policy calls external APIs");
    requireBoundaryNo(content, label, "This policy stores tokens or secrets");
    requireBoundaryNo(content, label, "This policy enables auto-fix");
    requireBoundaryNo(content, label, "This policy treats hook output as human approval");
    requireBoundaryNo(content, label, "This policy approves implementation, release, or production");
    requireBoundaryNo(content, label, "This policy replaces Hook Orchestration");
    const outcome = codeOrTextValue(sectionBody(content, "Outcome"));
    if (allowedOutcomes.has(outcome)) pass(`${label} has valid Outcome`);
    else fail(`${label} has invalid Outcome: ${outcome || "<empty>"}`);
  }
}

function requirePolicyState(content, label) {
  const body = sectionBody(content, "Policy State");
  const states = [...body.matchAll(/\b(NO_POLICY_FOUND|POLICY_DRAFT_READY|POLICY_REVIEW_REQUIRED|GOVERNED_POLICY_PRESENT|BLOCKED_BY_EXISTING_HOOK_RISK|BLOCKED)\b/g)].map((item) => item[1]);
  if (states.length === 0) fail(`${label} must include policy state`);
  else if (states.every((state) => allowedStates.has(state))) pass(`${label} uses valid policy state`);
  else fail(`${label} has invalid policy state`);
  if (/\|\s*Can install hooks now\?\s*\|\s*No\s*\|/i.test(body)) pass(`${label} states hooks cannot install now`);
  else fail(`${label} must state hooks cannot install now`);
}

function requireAllowedHookClasses(content, label) {
  const body = sectionBody(content, "Allowed Hook Classes");
  for (const hookClass of requiredHookClasses) {
    if (body.includes(hookClass)) pass(`${label} includes ${hookClass}`);
    else fail(`${label} missing ${hookClass}`);
  }
  if (/H2_REQUIRES_CONFIRMATION[\s\S]*Human confirmation/i.test(body)) pass(`${label} H2 requires human confirmation`);
  else fail(`${label} H2 must require human confirmation`);
  if (/H3_EXPLICIT_APPROVAL_REQUIRED[\s\S]*Explicit human approval/i.test(body)) pass(`${label} H3 requires explicit human approval`);
  else fail(`${label} H3 must require explicit human approval`);
}

function requireApprovalMatrix(content, label) {
  const body = sectionBody(content, "Approval Matrix");
  for (const marker of ["Approval owner", "Minimum evidence", "Default if unclear", "Human project owner", "Human risk owner", "Defer", "Stop"]) {
    if (new RegExp(escapeRegExp(marker), "i").test(body)) pass(`${label} approval matrix includes ${marker}`);
    else fail(`${label} approval matrix missing ${marker}`);
  }
}

function requireRollbackDisablePolicy(content, label) {
  const body = sectionBody(content, "Rollback / Disable Policy");
  for (const marker of ["Disable path", "Restore command or file", "Owner", "Evidence needed", "H2_REQUIRES_CONFIRMATION", "H3_EXPLICIT_APPROVAL_REQUIRED"]) {
    if (new RegExp(escapeRegExp(marker), "i").test(body)) pass(`${label} rollback policy includes ${marker}`);
    else fail(`${label} rollback policy missing ${marker}`);
  }
  if (/\|\s*`?H[23]_[^|]+`?\s*\|\s*(none|n\/a|no rollback)/i.test(body)) {
    fail(`${label} rollback policy must not use none/n/a for H2/H3`);
  }
}

function requireForbiddenAutomaticActions(content, label) {
  const body = sectionBody(content, "Forbidden Automatic Actions");
  for (const key of [
    "Install Git hooks automatically",
    "Modify CI automatically",
    "Add blocking gates automatically",
    "Call external APIs automatically",
    "Store tokens or secrets automatically",
    "Enable auto-fix automatically",
    "Treat hook output as human approval",
  ]) {
    const pattern = new RegExp(`^-\\s*${escapeRegExp(key)}:\\s*No\\s*$`, "im");
    if (pattern.test(body)) pass(`${label} forbids ${key}`);
    else fail(`${label} must forbid ${key}: No`);
  }
}

function requireRelationship(content, label) {
  const body = sectionBody(content, "Relationship To Hook Orchestration");
  for (const marker of ["Hook Orchestration", "Project Hook Policy", "does not replace Hook Orchestration"]) {
    if (new RegExp(escapeRegExp(marker), "i").test(body)) pass(`${label} relationship includes ${marker}`);
    else fail(`${label} relationship missing ${marker}`);
  }
}

function checkSourceEvidence() {
  for (const file of [
    "examples/1.29-hook-policy-hardening/README.md",
    "examples/1.29-hook-policy-hardening/hook-policies/001-project-hook-policy.md",
    "releases/1.29.0/release-record.md",
    "releases/1.29.0/known-limitations.md",
    "releases/1.29.0/self-check-report.md",
  ]) {
    if (exists(file)) pass(`1.29 hook policy source evidence exists ${file}`);
    else fail(`1.29 hook policy source evidence missing ${file}`);
  }

  const resolver = runNode(["scripts/resolve-hook-policy.mjs", "."]);
  if (resolver.status === 0
    && resolver.stdout.includes("Project Hook Policy")
    && resolver.stdout.includes("This policy installs hooks: No")
    && resolver.stdout.includes("Allowed Hook Classes")) {
    pass("1.29 hook policy resolver prints safe policy");
  } else {
    fail(`1.29 hook policy resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-hook-policy.mjs", ".", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "PROJECT_HOOK_POLICY"
        && parsed.boundaries?.installsHooks === "No"
        && Array.isArray(parsed.allowedHookClasses)
        && parsed.allowedHookClasses.some((item) => item.class === "H3_EXPLICIT_APPROVAL_REQUIRED")) {
        pass("1.29 hook policy resolver JSON includes classes and boundaries");
      } else {
        fail(`1.29 hook policy resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.29 hook policy resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.29 hook policy resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const example = runNode(["scripts/check-hook-policy.mjs", "examples/1.29-hook-policy-hardening"]);
  if (example.status === 0 && example.stdout.includes("Project Hook Policy check passed")) pass("1.29 hook policy example passes checker");
  else fail(`1.29 hook policy example failed: ${example.stderr || example.stdout}`);

  for (const [name, target, expected] of [
    ["installs hook", "test-fixtures/bad/bad-hook-policy-installs-hook", "This policy installs hooks"],
    ["missing rollback", "test-fixtures/bad/bad-hook-policy-missing-rollback", "rollback policy"],
  ]) {
    const result = runNode(["scripts/check-hook-policy.mjs", target]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) pass(`1.29 hook policy rejects ${name}`);
    else fail(`1.29 hook policy must reject ${name}: ${output}`);
  }
}

function contentForForbiddenScan(content) {
  return String(content)
    .replace(/^- This policy installs hooks: No$/gim, "")
    .replace(/^- This policy modifies CI: No$/gim, "")
    .replace(/^- This policy adds blocking gates: No$/gim, "")
    .replace(/^- This policy calls external APIs: No$/gim, "")
    .replace(/^- This policy stores tokens or secrets: No$/gim, "")
    .replace(/^- This policy enables auto-fix: No$/gim, "")
    .replace(/^- This policy treats hook output as human approval: No$/gim, "")
    .replace(/^- This policy approves implementation, release, or production: No$/gim, "")
    .replace(/^- This policy replaces Hook Orchestration: No$/gim, "")
    .replace(/^- Install Git hooks automatically: No$/gim, "")
    .replace(/^- Modify CI automatically: No$/gim, "")
    .replace(/^- Add blocking gates automatically: No$/gim, "")
    .replace(/^- Call external APIs automatically: No$/gim, "")
    .replace(/^- Store tokens or secrets automatically: No$/gim, "")
    .replace(/^- Enable auto-fix automatically: No$/gim, "")
    .replace(/^- Treat hook output as human approval: No$/gim, "");
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
  if (outputJson) console.log(JSON.stringify({ status: failed ? "FAIL" : "PASS", projectRoot, results: checks }, null, 2));
  else if (!failed) {
    console.log("");
    console.log("Project Hook Policy check passed.");
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

function sectionBody(content, section) {
  const pattern = new RegExp(`^##\\s+${escapeRegExp(section)}\\s*$`, "im");
  const match = pattern.exec(content);
  if (!match) return "";
  const rest = content.slice(match.index + match[0].length);
  const next = /^##\s+/m.exec(rest);
  return next ? rest.slice(0, next.index).trim() : rest.trim();
}

function markdownFiles(dir) {
  const base = resolveDirectory(dir);
  if (!base) return [];
  const files = [];
  walk(base, files);
  return files.filter((file) => file.endsWith(".md")).sort();
}

function walk(dir, files) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else files.push(full);
  }
}

function resolveAsset(relPath) {
  const direct = path.join(projectRoot, relPath);
  if (fs.existsSync(direct)) return direct;
  const intentOS = path.join(projectRoot, ".intentos", relPath);
  if (fs.existsSync(intentOS)) return intentOS;
  return null;
}

function resolveDirectory(relPath) {
  const direct = path.join(projectRoot, relPath);
  if (fs.existsSync(direct) && fs.statSync(direct).isDirectory()) return direct;
  const intentOS = path.join(projectRoot, ".intentos", relPath);
  if (fs.existsSync(intentOS) && fs.statSync(intentOS).isDirectory()) return intentOS;
  return null;
}

function readResolved(relPath) {
  const resolved = resolveAsset(relPath);
  return resolved ? fs.readFileSync(resolved, "utf8") : "";
}

function exists(relPath) {
  return fs.existsSync(path.join(projectRoot, relPath));
}

function rel(fullPath) {
  return path.relative(projectRoot, fullPath).replaceAll(path.sep, "/") || ".";
}

function displayAsset(relPath, resolved) {
  const direct = path.join(projectRoot, relPath);
  return path.resolve(resolved) === path.resolve(direct) ? relPath : `.intentos/${relPath}`;
}

function runNode(argv) {
  return spawnSync(process.execPath, argv, { cwd: projectRoot, encoding: "utf8", maxBuffer: 1024 * 1024 * 8 });
}

function codeOrTextValue(body) {
  const text = strip(body);
  const code = text.match(/`([^`]+)`/);
  return code ? code[1].trim() : text.split(/\s+/)[0] || "";
}

function strip(value) {
  return String(value || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
