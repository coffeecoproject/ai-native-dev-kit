#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { sectionBody } from "./lib/markdown.mjs";
import { containsSecretLikeValue } from "./lib/risk-surfaces.mjs";
import { loadSchema, validateEvidenceBlock } from "./lib/artifact-schema.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["json", "require-structured-evidence"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputJson = Boolean(args.json);
const requireStructuredEvidence = Boolean(args["require-structured-evidence"]);
const releaseHandoffEvidenceSchema = loadSchema(projectRoot, "schemas/artifacts/release-handoff-evidence.schema.json");
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
  "core/release-handoff-packs.md",
  "docs/release-handoff-packs.md",
  "templates/release-handoff-pack.md",
  "checklists/release-handoff-pack-review.md",
  "prompts/release-handoff-pack-agent.md",
  "scripts/resolve-release-handoff-pack.mjs",
  "scripts/check-release-handoff-pack.mjs",
];
const requiredDirectories = ["release-handoff-packs"];
const requiredSections = [
  "Human Summary",
  "Selected Recipe",
  "Required Approval",
  "Required Inputs",
  "Preflight Steps",
  "Codex May Run",
  "Human Must Run",
  "External System Must Run",
  "Stop Conditions",
  "Evidence To Capture",
  "Rollback Evidence",
  "Monitoring Evidence",
  "Post-release Smoke",
  "Post-release Close-out",
  "Release Guide Bridge",
  "Release Execution Bridge",
  "Boundaries",
  "Outcome",
];
const allowedOutcomes = new Set([
  "HANDOFF_PACK_RECORDED",
  "BLOCKED_BY_SELECTED_RECIPE",
  "BLOCKED_BY_STRUCTURED_APPROVAL",
  "BLOCKED_BY_RELEASE_OWNER",
  "BLOCKED_BY_ROLLBACK_EVIDENCE",
  "BLOCKED_BY_MONITORING_EVIDENCE",
  "BLOCKED_BY_POST_RELEASE_SMOKE_EVIDENCE",
  "READY_FOR_HANDOFF_REVIEW",
]);
const allowedLevels = new Set(["PREVIEW_ASSIST", "STAGING_HANDOFF", "PRODUCTION_HANDOFF"]);
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
  /\bThis pack approves release:\s*Yes\b/i,
  /\bThis pack deploys, publishes, uploads, submits, migrates, or releases by itself:\s*Yes\b/i,
  /\bThis pack asks for or stores secrets:\s*Yes\b/i,
  /\bThis pack changes CI\/CD, hooks, DNS, payment, permissions, app-store state, mini-program state, production data, or production config:\s*Yes\b/i,
  /\bThis pack makes Codex the release owner:\s*Yes\b/i,
  /\bThis pack treats structured approval as blanket authorization:\s*Yes\b/i,
];
const secretRequestPattern = /\b([A-Z0-9_]*(TOKEN|SECRET|KEY|PASSWORD|PRIVATE_KEY)[A-Z0-9_]*\s*=|ask for|paste|send|provide|store|record).{0,80}\b(secret|token|password|private key|api key|credential)\b/i;
const codexHighRiskPattern = /\b(production deploy|deploy production|publish preview|preview publish|upload|submit review|submit app|mini-program release|app-store|play console|database migration|production migration|DNS|payment|permission|production config|remote-state|provider API|trigger CI|ssh production|secret|token|rollback execution)\b/i;
const localSafePattern = /\b(NO_RUN|LOCAL_READ_ONLY|LOCAL_BUILD|LOCAL_TEST|PREVIEW_PREPARE)\b/i;

let failed = false;
const checks = [];

if (!outputJson) {
  console.log("# Release Handoff Pack Check");
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
checkHandoffPacks();

if (isSourceRepo) checkSourceEvidence();
else pass("source-only 1.60 release handoff pack evidence checks skipped for target project");

emitAndExit();

function checkCoreContent() {
  const combined = [
    readResolved("core/release-handoff-packs.md"),
    readResolved("docs/release-handoff-packs.md"),
  ].join("\n");
  if (!combined.trim()) return;
  for (const marker of [
    "Release Handoff Packs",
    "bounded runbooks",
    "Codex May Run",
    "does not approve release",
    "does not execute release commands",
  ]) {
    if (combined.includes(marker)) pass(`release handoff pack docs include ${marker}`);
    else fail(`release handoff pack docs missing ${marker}`);
  }
}

function checkHandoffPacks() {
  const files = markdownFiles("release-handoff-packs");
  if (files.length === 0) {
    pass("release handoff pack check skipped: no handoff packs");
    return;
  }

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const label = rel(file);
    for (const section of requiredSections) requireSection(content, section, label);
    if (containsSecretLikeValue(content) || secretRequestPattern.test(content)) fail(`${label} contains secret-like content or asks for secrets`);
    for (const pattern of forbiddenClaims) {
      if (pattern.test(content)) fail(`${label} contains forbidden release handoff pack claim: ${pattern.source}`);
    }

    const summary = sectionBody(content, "Human Summary") || "";
    const packId = tableValue(summary, "Pack ID");
    const recipeId = tableValue(summary, "Recipe ID");
    const releaseTarget = tableValue(summary, "Release Target");
    const executionLevel = tableValue(summary, "Execution Level");
    const releaseOwner = tableValue(summary, "Release Owner");
    const outcome = codeOrTextValue(sectionBody(content, "Outcome"));

    if (isConcrete(packId)) pass(`${label} records Pack ID`);
    else fail(`${label} must record Pack ID`);
    if (isConcrete(recipeId)) pass(`${label} records Recipe ID`);
    else fail(`${label} must record Recipe ID`);
    if (isConcrete(releaseTarget)) pass(`${label} records Release Target`);
    else fail(`${label} must record Release Target`);
    if (allowedLevels.has(executionLevel)) pass(`${label} records valid Execution Level`);
    else fail(`${label} must record valid Execution Level`);
    if (isConcrete(releaseOwner) && /HUMAN|EXTERNAL/i.test(releaseOwner)) pass(`${label} records human/external Release Owner`);
    else fail(`${label} must keep Release Owner human or external-system owned`);
    if (allowedOutcomes.has(outcome)) pass(`${label} has valid Outcome`);
    else fail(`${label} has invalid Outcome: ${outcome || "<empty>"}`);

    checkRequiredApproval(content, label);
    checkCodexMayRun(content, label);
    requireEvidenceSection(content, label, "Rollback Evidence", /rollback|restore|fallback/i);
    requireEvidenceSection(content, label, "Monitoring Evidence", /monitoring|dashboard|log|health|smoke|observation/i);
    requireEvidenceSection(content, label, "Post-release Smoke", /smoke|observation|read-only|result|evidence/i);
    requireCloseOutSection(content, label);
    checkStructuredReleaseHandoffEvidence(content, label, {
      packId,
      recipeId,
      releaseTarget,
      executionLevel,
      releaseOwner,
      outcome,
    });

    for (const boundary of [
      "This pack approves release",
      "This pack deploys, publishes, uploads, submits, migrates, or releases by itself",
      "This pack asks for or stores secrets",
      "This pack changes CI/CD, hooks, DNS, payment, permissions, app-store state, mini-program state, production data, or production config",
      "This pack makes Codex the release owner",
      "This pack treats structured approval as blanket authorization",
    ]) {
      requireBoundaryNo(content, label, boundary);
    }
  }
}

function checkRequiredApproval(content, label) {
  const body = sectionBody(content, "Required Approval") || "";
  const approvalType = tableValue(body, "Approval Type");
  const approvalStatus = tableValue(body, "Approval Status");
  const releaseTarget = tableValue(body, "Release Target");
  const scope = tableValue(body, "Approved Scope");
  const approvedBy = tableValue(body, "Approved By");
  const allowedActions = tableValue(body, "Allowed Codex Actions");
  const blockedActions = tableValue(body, "Blocked Actions");
  const evidencePath = tableValue(body, "Evidence Path");
  const expiry = tableValue(body, "Expiry / Reconfirm By");
  const checksToRun = [
    ["Approval Type", approvalType === "RELEASE_APPROVAL"],
    ["Approval Status", new Set(["APPROVED", "PENDING"]).has(approvalStatus)],
    ["Release Target", isConcrete(releaseTarget)],
    ["Approved Scope", isConcrete(scope)],
    ["Approved By", isConcrete(approvedBy)],
    ["Allowed Codex Actions", isConcrete(allowedActions)],
    ["Blocked Actions", isConcrete(blockedActions)],
    ["Evidence Path", isConcrete(evidencePath)],
    ["Expiry / Reconfirm By", isConcrete(expiry)],
  ];
  for (const [name, ok] of checksToRun) {
    if (ok) pass(`${label} required approval includes ${name}`);
    else fail(`${label} requires structured approval field: ${name}`);
  }
}

function checkCodexMayRun(content, label) {
  const body = sectionBody(content, "Codex May Run") || "";
  const rows = tableRows(body);
  if (rows.length > 0) pass(`${label} records Codex May Run`);
  else fail(`${label} must record Codex May Run`);
  for (const row of rows) {
    if (codexHighRiskPattern.test(row)) {
      fail(`${label} puts remote/high-risk release action in Codex May Run: ${row}`);
    }
    if (!localSafePattern.test(row)) {
      fail(`${label} Codex May Run row lacks safe risk class: ${row}`);
    }
  }
}

function requireEvidenceSection(content, label, section, marker) {
  const body = sectionBody(content, section) || "";
  if (marker.test(body) && !/\b(N\/A|TBD|TODO|UNKNOWN|MISSING)\b/i.test(body)) {
    pass(`${label} records ${section}`);
  } else {
    fail(`${label} must record concrete ${section}`);
  }
}

function requireCloseOutSection(content, label) {
  const body = sectionBody(content, "Post-release Close-out") || "";
  const required = [/actual executor/i, /result/i, /rollback/i, /monitoring/i, /unresolved/i];
  if (required.every((marker) => marker.test(body))) {
    pass(`${label} records Post-release Close-out`);
  } else {
    fail(`${label} must record concrete Post-release Close-out`);
  }
}

function checkSourceEvidence() {
  for (const file of [
    "docs/plans/release-path-consolidation-1.58-1.60-plan.md",
    "docs/plans/release-path-hardening-1.61-plan.md",
    "core/release-path-hardening.md",
    "core/release-handoff-packs.md",
    "docs/release-path-hardening.md",
    "docs/release-handoff-packs.md",
    "templates/release-handoff-pack.md",
    "checklists/release-handoff-pack-review.md",
    "prompts/release-handoff-pack-agent.md",
    "schemas/artifacts/release-handoff-evidence.schema.json",
    "scripts/resolve-release-handoff-pack.mjs",
    "scripts/check-release-handoff-pack.mjs",
    "examples/1.60-release-handoff-packs/web-hosted-preview/README.md",
    "examples/1.60-release-handoff-packs/web-hosted-preview/release-handoff-packs/001-web-hosted-preview.md",
    "examples/1.60-release-handoff-packs/mini-program-review/README.md",
    "examples/1.60-release-handoff-packs/mini-program-review/release-handoff-packs/001-mini-program-review.md",
    "examples/1.60-release-handoff-packs/backend-api-release/README.md",
    "examples/1.60-release-handoff-packs/backend-api-release/release-handoff-packs/001-backend-api-release.md",
    "test-fixtures/bad/bad-release-handoff-codex-production/release-handoff-packs/001-bad.md",
    "test-fixtures/bad/bad-release-handoff-missing-approval/release-handoff-packs/001-bad.md",
    "test-fixtures/bad/bad-release-handoff-missing-owner/release-handoff-packs/001-bad.md",
    "test-fixtures/bad/bad-release-handoff-missing-rollback/release-handoff-packs/001-bad.md",
    "test-fixtures/bad/bad-release-handoff-missing-monitoring/release-handoff-packs/001-bad.md",
    "test-fixtures/bad/bad-release-handoff-secret-request/release-handoff-packs/001-bad.md",
    "test-fixtures/bad/bad-release-handoff-remote-state/release-handoff-packs/001-bad.md",
    "test-fixtures/bad/bad-release-handoff-store-assigned-to-codex/release-handoff-packs/001-bad.md",
    "test-fixtures/bad/bad-release-handoff-migration-assigned-to-codex/release-handoff-packs/001-bad.md",
    "test-fixtures/bad/bad-release-handoff-missing-structured-evidence/release-handoff-packs/001-bad.md",
    "test-fixtures/bad/bad-release-handoff-execution-redefines-evidence/release-handoff-packs/001-bad.md",
    "releases/1.60.0/release-record.md",
    "releases/1.60.0/known-limitations.md",
    "releases/1.60.0/self-check-report.md",
    "releases/1.61.0/release-record.md",
    "releases/1.61.0/known-limitations.md",
    "releases/1.61.0/self-check-report.md",
  ]) {
    if (exists(file)) pass(`1.60 release handoff pack source evidence exists ${file}`);
    else fail(`1.60 release handoff pack source evidence missing ${file}`);
  }

  const resolver = runNode(["scripts/resolve-release-handoff-pack.mjs", ".", "--intent", "help me launch"]);
  if (resolver.status === 0
    && resolver.stdout.includes("# Release Handoff Pack")
    && resolver.stdout.includes("## Codex May Run")
    && resolver.stdout.includes("This pack approves release: No")
    && resolver.stdout.includes("This pack deploys, publishes, uploads, submits, migrates, or releases by itself: No")) {
    pass("1.60 release handoff pack resolver prints safe handoff");
  } else {
    fail(`1.60 release handoff pack resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-release-handoff-pack.mjs", ".", "--intent", "help me launch", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "RELEASE_HANDOFF_PACK"
        && parsed.humanSummary?.packId
        && parsed.boundaries?.approvesRelease === "No"
        && Array.isArray(parsed.codexMayRun)
        && Array.isArray(parsed.humanMustRun)
        && Array.isArray(parsed.externalSystemMustRun)) {
        pass("1.60 release handoff pack resolver JSON includes pack, boundaries, and ownership");
      } else {
        fail(`1.60 release handoff pack resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.60 release handoff pack resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.60 release handoff pack resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  for (const target of [
    "examples/1.60-release-handoff-packs/web-hosted-preview",
    "examples/1.60-release-handoff-packs/mini-program-review",
    "examples/1.60-release-handoff-packs/backend-api-release",
  ]) {
    const result = runNode(["scripts/check-release-handoff-pack.mjs", target]);
    if (result.status === 0 && result.stdout.includes("Release Handoff Pack check passed")) {
      pass(`1.60 release handoff pack example passes: ${target}`);
    } else {
      fail(`1.60 release handoff pack example failed ${target}: ${result.stderr || result.stdout}`);
    }
  }

  for (const [name, target, expected] of [
    ["codex production", "test-fixtures/bad/bad-release-handoff-codex-production", "Codex May Run"],
    ["missing approval", "test-fixtures/bad/bad-release-handoff-missing-approval", "Approval Type"],
    ["missing owner", "test-fixtures/bad/bad-release-handoff-missing-owner", "Release Owner"],
    ["missing rollback", "test-fixtures/bad/bad-release-handoff-missing-rollback", "Rollback Evidence"],
    ["missing monitoring", "test-fixtures/bad/bad-release-handoff-missing-monitoring", "Monitoring Evidence"],
    ["secret request", "test-fixtures/bad/bad-release-handoff-secret-request", "secret"],
    ["remote state", "test-fixtures/bad/bad-release-handoff-remote-state", "Codex May Run"],
    ["store assigned to Codex", "test-fixtures/bad/bad-release-handoff-store-assigned-to-codex", "Codex May Run"],
    ["migration assigned to Codex", "test-fixtures/bad/bad-release-handoff-migration-assigned-to-codex", "Codex May Run"],
  ]) {
    const result = runNode(["scripts/check-release-handoff-pack.mjs", target]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.60 release handoff pack rejects ${name}`);
    } else {
      fail(`1.60 release handoff pack must reject ${name}: ${output}`);
    }
  }
}

function checkStructuredReleaseHandoffEvidence(content, label, expected) {
  const validation = validateEvidenceBlock(content, releaseHandoffEvidenceSchema, label, {
    require: requireStructuredEvidence,
    digestField: "handoff_evidence_digest",
  });
  if (!validation.present && !requireStructuredEvidence) {
    pass(`${label} structured release handoff evidence optional`);
    return;
  }
  if (!validation.ok) {
    for (const error of validation.errors) fail(error);
    return;
  }
  pass(`${label} structured release handoff evidence matches schema`);
  const evidence = validation.value;
  if (evidence.handoff_pack?.pack_id === expected.packId) pass(`${label} structured evidence matches Pack ID`);
  else fail(`${label} structured evidence Pack ID must match Human Summary`);
  if (evidence.handoff_pack?.recipe_id === expected.recipeId) pass(`${label} structured evidence matches Recipe ID`);
  else fail(`${label} structured evidence Recipe ID must match Human Summary`);
  if (evidence.handoff_pack?.release_target === expected.releaseTarget) pass(`${label} structured evidence matches Release Target`);
  else fail(`${label} structured evidence Release Target must match Human Summary`);
  if (evidence.handoff_pack?.execution_level === expected.executionLevel) pass(`${label} structured evidence matches Execution Level`);
  else fail(`${label} structured evidence Execution Level must match Human Summary`);
  if (evidence.handoff_pack?.handoff_state === expected.outcome) pass(`${label} structured evidence matches Outcome`);
  else fail(`${label} structured evidence handoff state must match Outcome`);
  if (evidence.handoff_pack?.handoff_review_only === true) pass(`${label} structured evidence marks handoff review only`);
  else fail(`${label} structured evidence must mark handoff_review_only true`);
  const owner = evidence.release_owner || {};
  if (["HUMAN_REQUIRED", "EXTERNAL_RELEASE_SYSTEM"].includes(owner.owner_type) && isConcrete(owner.owner_ref)) {
    pass(`${label} structured evidence keeps release owner human/external`);
  } else {
    fail(`${label} structured evidence must keep release owner human/external`);
  }
  const boundary = evidence.handoff_execution_boundary || {};
  const boundaryChecks = [
    ["handoff_is_execution_input", boundary.handoff_is_execution_input === true],
    ["execution_redefines_owner_evidence", boundary.execution_redefines_owner_evidence === false],
    ["approves_release", boundary.approves_release === false],
    ["executes_release_commands", boundary.executes_release_commands === false],
    ["codex_release_owner", boundary.codex_release_owner === false],
    ["high_risk_actions_human_or_external", boundary.high_risk_actions_human_or_external === true],
  ];
  for (const [name, ok] of boundaryChecks) {
    if (ok) pass(`${label} structured boundary ${name}`);
    else fail(`${label} structured boundary invalid: ${name}`);
  }
  if (requireStructuredEvidence) {
    requireStructuredConcrete(label, "structured approval approved_by", evidence.structured_approval?.approved_by);
    requireStructuredConcrete(label, "structured approval evidence_path", evidence.structured_approval?.evidence_path);
    requireStructuredConcrete(label, "rollback path", evidence.rollback?.path);
    requireStructuredConcrete(label, "rollback owner", evidence.rollback?.owner);
    requireStructuredConcrete(label, "rollback restore_condition", evidence.rollback?.restore_condition);
    requireStructuredConcrete(label, "monitoring path", evidence.monitoring?.path);
    requireStructuredConcrete(label, "monitoring owner", evidence.monitoring?.owner);
    requireStructuredConcrete(label, "monitoring observation_path", evidence.monitoring?.observation_path);
    requireStructuredConcrete(label, "post-release smoke owner", evidence.post_release_smoke?.owner);
    requireStructuredConcrete(label, "post-release smoke evidence_path", evidence.post_release_smoke?.evidence_path);
    if (evidence.post_release_smoke?.read_only === true) pass(`${label} structured post-release smoke is read-only`);
    else fail(`${label} structured post-release smoke must be read_only true`);
  }
}

function requireStructuredConcrete(label, field, value) {
  if (isConcrete(value)) pass(`${label} structured ${field} is concrete`);
  else fail(`${label} structured ${field} must be concrete`);
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
        "input",
        "step",
        "action",
        "condition",
        "evidence",
        "smoke",
        "item",
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
    console.log(failed ? "Release Handoff Pack check failed." : "Release Handoff Pack check passed.");
  }
  process.exit(failed ? 1 : 0);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
