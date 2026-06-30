#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { containsSecretLikeValue } from "./lib/risk-surfaces.mjs";
import {
  extractMachineReadableEvidence,
  loadSchema,
  resolveEvidenceReference,
  validateEvidenceBlock,
} from "./lib/artifact-schema.mjs";

const args = parseArgs(process.argv.slice(2));
const unknown = unknownOptions(args, new Set(["json", "require-structured-evidence"]));
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputJson = Boolean(args.json);
const requireStructuredEvidence = Boolean(args["require-structured-evidence"]);
const isSourceRepo = fs.existsSync(path.join(projectRoot, "dev-kit-manifest.json"))
  && fs.existsSync(path.join(projectRoot, "core", "workflow.md"));
const shouldRequireAssets = isSourceRepo
  || fs.existsSync(path.join(projectRoot, ".ai-native", "dev-kit-manifest.json"))
  || fs.existsSync(path.join(projectRoot, ".ai-native", "version.json"));
const structuredEvidenceSchema = loadSchema(projectRoot, "schemas/artifacts/controlled-apply-readiness.schema.json");

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

const requiredAssets = [
  "core/controlled-apply-readiness.md",
  "docs/controlled-apply-readiness.md",
  "templates/controlled-apply-readiness-report.md",
  "checklists/controlled-apply-readiness-review.md",
  "prompts/controlled-apply-readiness-agent.md",
  "scripts/resolve-controlled-apply-readiness.mjs",
  "scripts/check-controlled-apply-readiness.mjs",
  "schemas/artifacts/controlled-apply-readiness.schema.json",
];
const requiredDirectories = ["apply-readiness-reports"];
const reportSections = [
  "Human Decision Summary",
  "Apply Plan Reference",
  "Readiness State",
  "Action Classification",
  "Preconditions",
  "Human-Only / Blocked Items",
  "Backup / Rollback Readiness",
  "Verification Readiness",
  "Boundary",
  "Outcome",
];
const allowedStates = new Set([
  "NO_APPLY_PLAN",
  "NOT_READY",
  "READY_FOR_HUMAN_APPROVED_APPLY",
  "HUMAN_ONLY",
  "BLOCKED",
]);
const allowedOutcomes = new Set(["READINESS_RECORDED", "NEEDS_HUMAN_DECISION", "BLOCKED"]);
const humanOnlyActions = [
  "BUSINESS_CODE_CHANGE",
  "HOOK_OR_CI_CHANGE",
  "AUTOMATION_CHANGE",
  "DOCUMENT_ARCHIVE_APPLY",
  "INDUSTRIAL_PACK_ENABLE",
  "DATA_OR_MIGRATION_CHANGE",
  "SECRET_OR_ENV_CHANGE",
  "PRODUCTION_CONFIG_CHANGE",
  "PAYMENT_OR_VALUE_TRANSFER_CHANGE",
  "SECURITY_PRIVACY_COMPLIANCE_CHANGE",
  "LEGAL_LICENSE_POLICY_CHANGE",
];
const forbiddenClaims = [
  /\bThis readiness report writes files now:\s*Yes\b/i,
  /\bThis readiness report authorizes apply:\s*Yes\b/i,
  /\bThis readiness report approves implementation:\s*Yes\b/i,
  /\bThis readiness report approves release or production:\s*Yes\b/i,
  /\bThis readiness report installs hooks or changes CI:\s*Yes\b/i,
  /\bThis readiness report changes source of truth:\s*Yes\b/i,
  /\bThis readiness report enables high-risk actions:\s*Yes\b/i,
  /\bCan Codex apply now:\s*Yes\b/i,
  /\bCan proceed without new approval\s*\|\s*Yes\b/i,
  /\bapply\s+(is\s+)?(authorized|approved|complete|completed)\b/i,
  /\bCodex\s+may\s+(apply|execute|write)\b/i,
  /\bfiles?\s+(were\s+)?(applied|written|modified|deleted|archived|moved)\b/i,
  /\brelease\s+(is\s+)?approved\b/i,
  /\bproduction\s+(is\s+)?approved\b/i,
];

let failed = false;
const checks = [];

if (!outputJson) {
  console.log("# Controlled Apply Readiness Check");
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
checkReports();
if (isSourceRepo) checkSourceEvidence();
else pass("source-only 1.38 controlled apply readiness evidence checks skipped for target project");
emitAndExit();

function checkCoreContent() {
  const core = readResolved("core/controlled-apply-readiness.md");
  if (!core) return;
  for (const marker of [
    "Controlled Apply Readiness Governance",
    "It does not execute the plan",
    "READY_FOR_HUMAN_APPROVED_APPLY",
    "Human-Only Actions",
    "This readiness report writes files now: No",
    "This readiness report authorizes apply: No",
    "This readiness report approves release or production: No",
  ]) {
    if (core.includes(marker)) pass(`controlled apply readiness core includes ${marker}`);
    else fail(`controlled apply readiness core missing ${marker}`);
  }
}

function checkReports() {
  const files = markdownFiles("apply-readiness-reports");
  if (files.length === 0) {
    pass("controlled apply readiness check skipped: no readiness reports");
    return;
  }

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const label = rel(file);
    checkStructuredEvidence(content, label, file);
    for (const section of reportSections) requireSection(content, section, label);
    if (containsSecretLikeValue(content)) fail(`${label} contains secret-like content`);
    const scanContent = contentForForbiddenScan(content);
    for (const pattern of forbiddenClaims) {
      if (pattern.test(scanContent)) fail(`${label} contains forbidden controlled apply readiness claim: ${pattern.source}`);
    }

    requireBoundaryNo(content, label, "This readiness report writes files now");
    requireBoundaryNo(content, label, "This readiness report authorizes apply");
    requireBoundaryNo(content, label, "This readiness report approves implementation");
    requireBoundaryNo(content, label, "This readiness report approves release or production");
    requireBoundaryNo(content, label, "This readiness report installs hooks or changes CI");
    requireBoundaryNo(content, label, "This readiness report changes source of truth");
    requireBoundaryNo(content, label, "This readiness report enables high-risk actions");

    const state = strip(tableValue(sectionBody(content, "Readiness State"), "State")).replace(/`/g, "");
    if (allowedStates.has(state)) pass(`${label} has valid readiness state`);
    else fail(`${label} has invalid readiness state: ${state || "<empty>"}`);
    if (/Can Codex apply now:\s*No/i.test(content)) pass(`${label} states Codex cannot apply now`);
    else fail(`${label} must state Can Codex apply now: No`);
    if (/Requires explicit human approval\s*\|\s*Yes/i.test(content)) pass(`${label} requires explicit human approval`);
    else fail(`${label} must require explicit human approval`);
    if (/Can proceed without new approval\s*\|\s*No/i.test(content)) pass(`${label} cannot proceed without new approval`);
    else fail(`${label} must state it cannot proceed without new approval`);

    const actionBody = sectionBody(content, "Action Classification");
    if (/LOW_RISK_CANDIDATE|HUMAN_ONLY|BLOCKED/i.test(actionBody)) pass(`${label} classifies actions`);
    else fail(`${label} must classify actions`);
    for (const action of humanOnlyActions) {
      if (!actionBody.includes(action)) continue;
      if (new RegExp(`${action}.*(HUMAN_ONLY|BLOCKED)`, "is").test(actionBody)) {
        pass(`${label} keeps ${action} human-only or blocked`);
      } else {
        fail(`${label} must not mark ${action} as ready`);
      }
      if (state === "READY_FOR_HUMAN_APPROVED_APPLY") {
        fail(`${label} cannot be READY_FOR_HUMAN_APPROVED_APPLY with ${action}`);
      }
    }

    const preconditions = sectionBody(content, "Preconditions");
    for (const marker of ["Apply plan exists", "Git state safe", "Target paths bounded", "Backup plan exists", "Rollback plan exists", "Verification plan exists", "Human approval recorded"]) {
      if (new RegExp(marker, "i").test(preconditions)) pass(`${label} preconditions include ${marker}`);
      else fail(`${label} preconditions missing ${marker}`);
    }
    if (state === "READY_FOR_HUMAN_APPROVED_APPLY") {
      for (const marker of ["Apply plan exists", "Git state safe", "Target paths bounded", "Backup plan exists", "Rollback plan exists", "Verification plan exists"]) {
        if (new RegExp(`\\|\\s*${escapeRegExp(marker)}\\s*\\|\\s*pass\\s*\\|`, "i").test(preconditions)) {
          pass(`${label} ready state has passing precondition ${marker}`);
        } else {
          fail(`${label} READY_FOR_HUMAN_APPROVED_APPLY requires passing precondition ${marker}`);
        }
      }
    }

    const backup = sectionBody(content, "Backup / Rollback Readiness");
    for (const marker of ["Backup required", "Backup path", "Rollback step", "Rollback verification"]) {
      if (new RegExp(marker, "i").test(backup)) pass(`${label} backup readiness includes ${marker}`);
      else fail(`${label} backup readiness missing ${marker}`);
    }
    const verification = sectionBody(content, "Verification Readiness");
    for (const marker of ["Pre-apply verification", "Post-apply verification", "Evidence path", "Missing verification"]) {
      if (new RegExp(marker, "i").test(verification)) pass(`${label} verification readiness includes ${marker}`);
      else fail(`${label} verification readiness missing ${marker}`);
    }

    const outcome = codeOrTextValue(sectionBody(content, "Outcome"));
    if (allowedOutcomes.has(outcome)) pass(`${label} has valid Outcome`);
    else fail(`${label} has invalid Outcome: ${outcome || "<empty>"}`);
  }
}

function checkStructuredEvidence(content, label, file) {
  const result = validateEvidenceBlock(content, structuredEvidenceSchema, label, { require: requireStructuredEvidence });
  if (!result.ok) {
    for (const error of result.errors) fail(error);
    return;
  }
  if (!result.present) return;

  const evidence = result.value;
  pass(`${label} structured readiness evidence matches schema`);

  if (evidence.can_codex_apply_now === false) pass(`${label} structured evidence states Codex cannot apply now`);
  else fail(`${label} structured evidence must state can_codex_apply_now false`);
  if (evidence.requires_explicit_human_approval === true) pass(`${label} structured evidence requires human approval`);
  else fail(`${label} structured evidence must require explicit human approval`);
  if (evidence.can_proceed_without_new_approval === false) pass(`${label} structured evidence cannot proceed without new approval`);
  else fail(`${label} structured evidence must not proceed without new approval`);
  if (evidence.boundary && Object.values(evidence.boundary).every((value) => value === false)) {
    pass(`${label} structured boundary keeps readiness non-authorizing`);
  } else {
    fail(`${label} structured boundary must keep all authority flags false`);
  }

  if (evidence.readiness_state !== "NO_APPLY_PLAN" && (!Array.isArray(evidence.actions) || evidence.actions.length === 0)) {
    fail(`${label} structured readiness actions must not be empty unless readiness_state is NO_APPLY_PLAN`);
  } else {
    pass(`${label} structured readiness action count matches readiness state`);
  }

  const emptyPathAction = (evidence.actions || []).find((action) => !Array.isArray(action.target_paths) || action.target_paths.length === 0);
  if (emptyPathAction) {
    fail(`${label} structured readiness action ${emptyPathAction.id || "<unknown>"} must include target_paths`);
  } else {
    pass(`${label} structured readiness actions include target paths`);
  }

  const reference = resolveEvidenceReference(projectRoot, file, evidence.apply_plan?.path);
  if (!reference) {
    if (requireStructuredEvidence) {
      fail(`${label} structured readiness plan reference must resolve in --require-structured-evidence mode`);
      return;
    }
    pass(`${label} structured readiness plan reference not found locally; digest cross-check skipped`);
    return;
  }
  const referencedContent = fs.readFileSync(reference, "utf8");
  const referenced = extractMachineReadableEvidence(referencedContent);
  if (referenced?.ok && referenced.value?.plan_digest === evidence.apply_plan.plan_digest) {
    pass(`${label} structured readiness references matching apply plan digest`);
  } else {
    fail(`${label} structured readiness apply_plan.plan_digest does not match referenced apply plan evidence`);
  }
}

function checkSourceEvidence() {
  for (const file of [
    "docs/plans/controlled-apply-readiness-1.38-plan.md",
    "examples/1.38-controlled-apply-readiness/README.md",
    "examples/1.38-controlled-apply-readiness/apply-readiness-reports/001-workflow-assets.md",
    "test-fixtures/bad/bad-controlled-apply-authorizes-apply/apply-readiness-reports/001-bad.md",
    "test-fixtures/bad/bad-controlled-apply-high-risk-ready/apply-readiness-reports/001-bad.md",
    "test-fixtures/bad/bad-controlled-apply-proceeds-without-approval/apply-readiness-reports/001-bad.md",
    "schemas/artifacts/controlled-apply-readiness.schema.json",
    "docs/plans/structured-evidence-schema-1.41-plan.md",
    "docs/structured-evidence-schema.md",
    "examples/1.41-structured-evidence-schema/apply-readiness-reports/001-structured-workflow-assets.md",
    "test-fixtures/bad/bad-structured-readiness-plan-digest/apply-readiness-reports/001-bad.md",
    "test-fixtures/bad/bad-structured-readiness-missing-plan-ref/apply-readiness-reports/001-bad.md",
    "test-fixtures/bad/bad-structured-readiness-empty-actions/apply-readiness-reports/001-bad.md",
    "releases/1.41.1/release-record.md",
    "releases/1.41.1/known-limitations.md",
    "releases/1.41.1/self-check-report.md",
    "releases/1.38.0/release-record.md",
    "releases/1.38.0/known-limitations.md",
    "releases/1.38.0/self-check-report.md",
    "releases/1.41.0/release-record.md",
    "releases/1.41.0/known-limitations.md",
    "releases/1.41.0/self-check-report.md",
  ]) {
    if (exists(file)) pass(`controlled apply readiness source evidence exists ${file}`);
    else fail(`controlled apply readiness source evidence missing ${file}`);
  }

  const resolver = runNode(["scripts/resolve-controlled-apply-readiness.mjs", ".", "--plan", "examples/1.34-unified-apply-plan/apply-plans/001-existing-project.md", "--git-state", "clean"]);
  if (resolver.status === 0
    && resolver.stdout.includes("Controlled Apply Readiness Report")
    && resolver.stdout.includes("Can Codex apply now")
    && resolver.stdout.includes("This readiness report authorizes apply: No")) {
    pass("1.38 controlled apply readiness resolver prints safe report");
  } else {
    fail(`1.38 controlled apply readiness resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-controlled-apply-readiness.mjs", ".", "--plan", "examples/1.34-unified-apply-plan/apply-plans/001-existing-project.md", "--git-state", "clean", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "CONTROLLED_APPLY_READINESS"
        && parsed.boundary?.authorizesApply === "No"
        && parsed.boundary?.writesFilesNow === "No"
        && parsed.readinessState?.canProceedWithoutNewApproval === "No") {
        pass("1.38 controlled apply readiness resolver JSON includes boundaries");
      } else {
        fail(`1.38 controlled apply readiness resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.38 controlled apply readiness resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.38 controlled apply readiness resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const example = runNode(["scripts/check-controlled-apply-readiness.mjs", "examples/1.38-controlled-apply-readiness"]);
  if (example.status === 0 && example.stdout.includes("Controlled Apply Readiness check passed")) {
    pass("1.38 controlled apply readiness example passes checker");
  } else {
    fail(`1.38 controlled apply readiness example failed: ${example.stderr || example.stdout}`);
  }

  const structuredExample = runNode(["scripts/check-controlled-apply-readiness.mjs", "examples/1.41-structured-evidence-schema"]);
  if (structuredExample.status === 0 && structuredExample.stdout.includes("structured readiness evidence matches schema")) {
    pass("1.41 structured readiness example passes schema-backed checker");
  } else {
    fail(`1.41 structured readiness example failed: ${structuredExample.stderr || structuredExample.stdout}`);
  }

  const strictStructuredExample = runNode(["scripts/check-controlled-apply-readiness.mjs", "examples/1.41-structured-evidence-schema", "--require-structured-evidence"]);
  if (strictStructuredExample.status === 0 && strictStructuredExample.stdout.includes("structured readiness references matching apply plan digest")) {
    pass("1.41.1 structured readiness example passes strict checker");
  } else {
    fail(`1.41.1 strict structured readiness example failed: ${strictStructuredExample.stderr || strictStructuredExample.stdout}`);
  }

  for (const [name, targetArgs, expected] of [
    ["authorizes apply", ["test-fixtures/bad/bad-controlled-apply-authorizes-apply"], "forbidden controlled apply readiness claim"],
    ["high-risk ready", ["test-fixtures/bad/bad-controlled-apply-high-risk-ready"], "cannot be READY_FOR_HUMAN_APPROVED_APPLY"],
    ["proceeds without approval", ["test-fixtures/bad/bad-controlled-apply-proceeds-without-approval"], "must state it cannot proceed without new approval"],
    ["structured digest", ["test-fixtures/bad/bad-structured-readiness-plan-digest"], "apply_plan.plan_digest does not match referenced apply plan evidence"],
    ["strict missing structured evidence", ["examples/1.38-controlled-apply-readiness", "--require-structured-evidence"], "Machine-Readable Evidence is required"],
    ["strict missing plan reference", ["test-fixtures/bad/bad-structured-readiness-missing-plan-ref", "--require-structured-evidence"], "plan reference must resolve"],
    ["structured empty actions", ["test-fixtures/bad/bad-structured-readiness-empty-actions"], "structured readiness actions must not be empty"],
  ]) {
    const result = runNode(["scripts/check-controlled-apply-readiness.mjs", ...targetArgs]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) pass(`1.38 controlled apply readiness rejects ${name}`);
    else fail(`1.38 controlled apply readiness must reject ${name}: ${output}`);
  }
}

function resolveAsset(relativePath) {
  const source = path.join(projectRoot, relativePath);
  if (fs.existsSync(source) && fs.statSync(source).isFile()) return source;
  const managed = path.join(projectRoot, ".ai-native", relativePath);
  if (fs.existsSync(managed) && fs.statSync(managed).isFile()) return managed;
  const generated = relativePath.startsWith("scripts/")
    ? path.join(projectRoot, relativePath)
    : path.join(projectRoot, ".ai-native", relativePath);
  if (fs.existsSync(generated) && fs.statSync(generated).isFile()) return generated;
  return null;
}

function resolveDirectory(relativePath) {
  const direct = path.join(projectRoot, relativePath);
  if (fs.existsSync(direct) && fs.statSync(direct).isDirectory()) return direct;
  const managed = path.join(projectRoot, ".ai-native", relativePath);
  if (fs.existsSync(managed) && fs.statSync(managed).isDirectory()) return managed;
  return null;
}

function readResolved(relativePath) {
  const resolved = resolveAsset(relativePath);
  return resolved ? fs.readFileSync(resolved, "utf8") : "";
}

function markdownFiles(relativeDir) {
  const dir = resolveDirectory(relativeDir);
  if (!dir) return [];
  return walk(dir).filter((file) => file.endsWith(".md")).sort();
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else if (entry.isFile()) files.push(full);
  }
  return files;
}

function requireSection(content, section, label) {
  if (new RegExp(`^##\\s+${escapeRegExp(section)}\\s*$`, "m").test(content)) pass(`${label} includes ${section}`);
  else fail(`${label} missing section ${section}`);
}

function sectionBody(content, heading) {
  const match = String(content).match(new RegExp(`^##\\s+${escapeRegExp(heading)}\\s*$`, "m"));
  if (!match) return "";
  const start = match.index + match[0].length;
  const rest = content.slice(start);
  const next = rest.search(/^##\s+/m);
  return next === -1 ? rest : rest.slice(0, next);
}

function tableValue(content, field) {
  const match = String(content).match(new RegExp(`\\|\\s*${escapeRegExp(field)}\\s*\\|\\s*([^|]+)\\|`, "i"));
  return match ? match[1].trim() : "";
}

function requireBoundaryNo(content, label, marker) {
  if (new RegExp(`${escapeRegExp(marker)}:\\s*No`, "i").test(content)) pass(`${label} boundary ${marker}: No`);
  else fail(`${label} missing boundary ${marker}: No`);
}

function contentForForbiddenScan(content) {
  return String(content)
    .replace(/^- This readiness report writes files now: No$/gim, "")
    .replace(/^- This readiness report authorizes apply: No$/gim, "")
    .replace(/^- This readiness report approves implementation: No$/gim, "")
    .replace(/^- This readiness report approves release or production: No$/gim, "")
    .replace(/^- This readiness report installs hooks or changes CI: No$/gim, "")
    .replace(/^- This readiness report changes source of truth: No$/gim, "")
    .replace(/^- This readiness report enables high-risk actions: No$/gim, "");
}

function codeOrTextValue(value) {
  const text = strip(value);
  const code = text.match(/`([^`]+)`/);
  if (code) return code[1].trim();
  return text.split(/\s+/).find(Boolean) || "";
}

function strip(value) {
  return String(value || "").replace(/<[^>]+>/g, "").trim();
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function exists(relativePath) {
  return fs.existsSync(path.join(projectRoot, relativePath));
}

function runNode(nodeArgs) {
  return spawnSync(process.execPath, nodeArgs, {
    cwd: projectRoot,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 20,
  });
}

function displayAsset(relativePath, resolved) {
  const relativeResolved = path.relative(projectRoot, resolved).replaceAll(path.sep, "/");
  return relativeResolved === relativePath ? relativePath : `${relativePath} (${relativeResolved})`;
}

function rel(file) {
  return path.relative(projectRoot, file).replaceAll(path.sep, "/");
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
      ok: !failed,
      checks,
    }, null, 2));
  } else {
    console.log("");
    if (failed) console.error("Controlled Apply Readiness check failed.");
    else console.log("Controlled Apply Readiness check passed.");
  }
  process.exit(failed ? 1 : 0);
}
