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
  "core/approval-record-governance.md",
  "docs/approval-record-governance.md",
  "templates/approval-record.md",
  "checklists/approval-record-review.md",
  "prompts/approval-record-agent.md",
  "scripts/check-approval-record.mjs",
];
const requiredDirectories = ["approval-records"];
const reportSections = [
  "Human Decision Summary",
  "Approval Identity",
  "Approved Plan",
  "Approved Action IDs",
  "Approval Scope",
  "Risk Acceptance",
  "Expiry",
  "Rollback Acknowledgement",
  "Verification Acknowledgement",
  "Human Approval Statement",
  "Non-Authorizations",
  "Evidence Links",
  "Audit Notes",
];
const allowedStatuses = new Set(["DRAFT", "PENDING_REVIEW", "APPROVED", "REVOKED", "EXPIRED"]);
const highRiskActions = [
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
const nonHumanApprover = /\b(Codex|AI|LLM|model|reviewer|subagent|automation|system|bot)\b/i;
const broadApproval = /\b(all actions|everything|entire repo|all files|any file|whatever Codex thinks|whatever is needed|future changes|blanket approval|\*)\b/i;
const forbiddenClaims = [
  /\bThis approval record writes files now:\s*Yes\b/i,
  /\bThis approval record authorizes automatic apply:\s*Yes\b/i,
  /\bThis approval record approves implementation:\s*Yes\b/i,
  /\bThis approval record approves release or production:\s*Yes\b/i,
  /\bThis approval record installs hooks or changes CI:\s*Yes\b/i,
  /\bThis approval record changes source of truth:\s*Yes\b/i,
  /\bThis approval record enables high-risk actions:\s*Yes\b/i,
  /\bThis approval record lets Codex proceed without readiness:\s*Yes\b/i,
  /\bCan Codex apply now:\s*Yes\b/i,
  /\bCodex\s+may\s+(apply|execute|write)\b/i,
  /\bapply\s+(is\s+)?(authorized|approved|complete|completed)\b/i,
  /\bimplementation\s+(is\s+)?approved\b/i,
  /\brelease\s+(is\s+)?approved\b/i,
  /\bproduction\s+(is\s+)?approved\b/i,
];

let failed = false;
const checks = [];

if (!outputJson) {
  console.log("# Approval Record Check");
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
checkRecords();
if (isSourceRepo) checkSourceEvidence();
else pass("source-only 1.40 approval record evidence checks skipped for target project");
emitAndExit();

function checkCoreContent() {
  const core = readResolved("core/approval-record-governance.md");
  if (!core) return;
  for (const marker of [
    "Approval Record Governance",
    "What exactly did a human approve?",
    "This approval record authorizes automatic apply: No",
    "Approved action IDs must be explicit",
    "High-Risk Action Rules",
  ]) {
    if (core.includes(marker)) pass(`approval record core includes ${marker}`);
    else fail(`approval record core missing ${marker}`);
  }
}

function checkRecords() {
  const files = markdownFiles("approval-records");
  if (files.length === 0) {
    pass("approval record check skipped: no approval records");
    return;
  }

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const label = rel(file);
    for (const section of reportSections) requireSection(content, section, label);
    if (containsSecretLikeValue(content)) fail(`${label} contains secret-like content`);
    const scanContent = contentForForbiddenScan(content);
    for (const pattern of forbiddenClaims) {
      if (pattern.test(scanContent)) fail(`${label} contains forbidden approval record claim: ${pattern.source}`);
    }

    requireBoundaryNo(content, label, "This approval record writes files now");
    requireBoundaryNo(content, label, "This approval record authorizes automatic apply");
    requireBoundaryNo(content, label, "This approval record approves implementation");
    requireBoundaryNo(content, label, "This approval record approves release or production");
    requireBoundaryNo(content, label, "This approval record installs hooks or changes CI");
    requireBoundaryNo(content, label, "This approval record changes source of truth");
    requireBoundaryNo(content, label, "This approval record enables high-risk actions");
    requireBoundaryNo(content, label, "This approval record lets Codex proceed without readiness");
    if (/Can Codex apply now:\s*No/i.test(content)) pass(`${label} states Codex cannot apply now`);
    else fail(`${label} must state Can Codex apply now: No`);

    const status = approvalStatus(content);
    if (allowedStatuses.has(status)) pass(`${label} has valid approval status`);
    else fail(`${label} has invalid approval status: ${status || "<empty>"}`);

    if (status === "APPROVED") checkApprovedRecord(content, label);
    else checkNonApprovedRecord(content, label, status);
  }
}

function checkApprovedRecord(content, label) {
  const identity = sectionBody(content, "Approval Identity");
  const approvedBy = strip(tableValue(identity, "Approved by"));
  const ownerType = strip(tableValue(identity, "Approval owner type")).replace(/`/g, "");
  if (approvedBy && !placeholder(approvedBy) && !nonHumanApprover.test(approvedBy)) {
    pass(`${label} approved record has human approver`);
  } else {
    fail(`${label} approved record approval owner must be human`);
  }
  if (ownerType === "HUMAN") pass(`${label} approval owner type is HUMAN`);
  else fail(`${label} approved record must set Approval owner type to HUMAN`);

  const plan = sectionBody(content, "Approved Plan");
  if (markdownPath(tableValue(plan, "Unified Apply Plan"))) pass(`${label} approved record references an apply plan`);
  else fail(`${label} approved records must reference a Unified Apply Plan`);
  if (/sha256:[a-f0-9]{64}\b/i.test(plan)) pass(`${label} approved record includes plan hash`);
  else fail(`${label} approved records must include a plan hash`);

  const actions = sectionBody(content, "Approved Action IDs");
  if (broadApproval.test(actions)) fail(`${label} approved action ids must be explicit`);
  else pass(`${label} avoids blanket action approval`);
  if (/\b[A-Z]\d{3}\b/.test(actions) && /\|\s*Yes\s*\|/i.test(actions)) {
    pass(`${label} approved action ids are explicit`);
  } else {
    fail(`${label} approved records must include explicit approved action IDs`);
  }

  const scope = sectionBody(content, "Approval Scope");
  const includedPaths = strip(tableValue(scope, "Included target paths"));
  if (includedPaths && !placeholder(includedPaths) && !broadApproval.test(includedPaths) && looksBoundedPathList(includedPaths)) {
    pass(`${label} approval scope uses bounded target paths`);
  } else {
    fail(`${label} approval scope must use exact bounded target paths`);
  }
  if (/Applies to future changes\s*\|\s*No/i.test(scope)) pass(`${label} does not approve future changes`);
  else fail(`${label} must state Applies to future changes: No`);

  const risk = sectionBody(content, "Risk Acceptance");
  if (/High-risk action included\s*\|\s*No/i.test(risk)) pass(`${label} excludes high-risk actions`);
  else fail(`${label} approved records must state High-risk action included: No`);
  if (/Human-only action included\s*\|\s*No/i.test(risk)) pass(`${label} excludes human-only actions`);
  else fail(`${label} approved records must state Human-only action included: No`);
  for (const action of highRiskActions) {
    if (new RegExp(`\\b${escapeRegExp(action)}\\b`).test(content)) {
      fail(`${label} approval record cannot approve high-risk actions: ${action}`);
    }
  }

  const expiry = sectionBody(content, "Expiry");
  const expiryValue = strip(tableValue(expiry, "Approval expires at"));
  if (expiryValue && !placeholder(expiryValue) && !/\b(never|none|n\/a|open-ended|no expiry)\b/i.test(expiryValue)) {
    pass(`${label} has bounded approval expiry`);
  } else {
    fail(`${label} approved records must include a bounded expiry`);
  }
  if (/Re-approval required after expiry\s*\|\s*Yes/i.test(expiry)) pass(`${label} requires re-approval after expiry`);
  else fail(`${label} must require re-approval after expiry`);

  const rollback = sectionBody(content, "Rollback Acknowledgement");
  if (/Rollback plan reviewed\s*\|\s*Yes/i.test(rollback)) pass(`${label} rollback plan reviewed`);
  else fail(`${label} approved records must acknowledge rollback review`);
  const verification = sectionBody(content, "Verification Acknowledgement");
  if (/Verification plan reviewed\s*\|\s*Yes/i.test(verification)) pass(`${label} verification plan reviewed`);
  else fail(`${label} approved records must acknowledge verification review`);

  const statement = sectionBody(content, "Human Approval Statement");
  if (broadApproval.test(statement)) fail(`${label} human approval statement must not be blanket approval`);
  else pass(`${label} human approval statement is bounded`);
}

function checkNonApprovedRecord(content, label, status) {
  if (status === "APPROVED") return;
  const actions = sectionBody(content, "Approved Action IDs");
  const statement = sectionBody(content, "Human Approval Statement");
  if (broadApproval.test(actions) || broadApproval.test(statement)) {
    fail(`${label} non-approved approval record must not include blanket approval language`);
  } else {
    pass(`${label} non-approved record avoids blanket approval language`);
  }
}

function checkSourceEvidence() {
  for (const file of [
    "docs/roadmaps/controlled-apply-execution-roadmap-1.40-1.42.md",
    "docs/plans/approval-record-governance-1.40-plan.md",
    "examples/1.40-approval-record-governance/README.md",
    "examples/1.40-approval-record-governance/approval-records/001-workflow-assets.md",
    "test-fixtures/bad/bad-approval-record-ai-owner/approval-records/001-bad.md",
    "test-fixtures/bad/bad-approval-record-missing-plan-hash/approval-records/001-bad.md",
    "test-fixtures/bad/bad-approval-record-all-actions/approval-records/001-bad.md",
    "test-fixtures/bad/bad-approval-record-auto-apply/approval-records/001-bad.md",
    "test-fixtures/bad/bad-approval-record-high-risk/approval-records/001-bad.md",
    "releases/1.40.0/release-record.md",
    "releases/1.40.0/known-limitations.md",
    "releases/1.40.0/self-check-report.md",
  ]) {
    if (exists(file)) pass(`1.40 approval record source evidence exists ${file}`);
    else fail(`1.40 approval record source evidence missing ${file}`);
  }

  const example = runNode(["scripts/check-approval-record.mjs", "examples/1.40-approval-record-governance"]);
  if (example.status === 0 && example.stdout.includes("Approval Record check passed")) {
    pass("1.40 approval record example passes checker");
  } else {
    fail(`1.40 approval record example failed: ${example.stderr || example.stdout}`);
  }

  for (const [name, target, expected] of [
    ["AI owner", "test-fixtures/bad/bad-approval-record-ai-owner", "approval owner must be human"],
    ["missing plan hash", "test-fixtures/bad/bad-approval-record-missing-plan-hash", "must include a plan hash"],
    ["all actions", "test-fixtures/bad/bad-approval-record-all-actions", "approved action ids must be explicit"],
    ["auto apply", "test-fixtures/bad/bad-approval-record-auto-apply", "forbidden approval record claim"],
    ["high risk", "test-fixtures/bad/bad-approval-record-high-risk", "cannot approve high-risk actions"],
  ]) {
    const result = runNode(["scripts/check-approval-record.mjs", target]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) pass(`1.40 approval record rejects ${name}`);
    else fail(`1.40 approval record must reject ${name}: ${output}`);
  }
}

function approvalStatus(content) {
  const match = String(content).match(/^Approval status:\s*`?([A-Z_]+)`?/m);
  return match ? match[1].trim() : "";
}

function looksBoundedPathList(value) {
  const text = String(value || "");
  if (/[<>]/.test(text)) return false;
  return /[\w.-]+\/[\w./-]+|\.[\w./-]+|[\w.-]+\.[A-Za-z0-9]+/.test(text);
}

function markdownPath(value) {
  const text = strip(value);
  return text && !placeholder(text) && /\.md\b/.test(text);
}

function placeholder(value) {
  const text = String(value || "").trim();
  return !text || /<[^>]+>/.test(text) || /^N\/A$/i.test(text);
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
    .replace(/^- This approval record writes files now: No$/gim, "")
    .replace(/^- This approval record authorizes automatic apply: No$/gim, "")
    .replace(/^- This approval record approves implementation: No$/gim, "")
    .replace(/^- This approval record approves release or production: No$/gim, "")
    .replace(/^- This approval record installs hooks or changes CI: No$/gim, "")
    .replace(/^- This approval record changes source of truth: No$/gim, "")
    .replace(/^- This approval record enables high-risk actions: No$/gim, "")
    .replace(/^- This approval record lets Codex proceed without readiness: No$/gim, "");
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
    if (failed) console.error("Approval Record check failed.");
    else console.log("Approval Record check passed.");
  }
  process.exit(failed ? 1 : 0);
}
