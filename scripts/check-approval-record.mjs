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
const structuredEvidenceSchema = loadSchema(projectRoot, "schemas/artifacts/approval-record.schema.json");

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
  "schemas/artifacts/approval-record.schema.json",
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
const ambiguousHumanApprover = /^(human|owner|user|the user|someone|somebody|stakeholder|team|project team|approver|not specified|unknown|tbd|n\/a)$/i;
const broadApproval = /\b(all actions|everything|entire repo|all files|any file|whatever Codex thinks|whatever is needed|future changes|blanket approval|\*)\b/i;
const unsafePathPattern = /(^\/|^~\/|^[A-Za-z]:\\|(^|\/)\.\.(\/|$)|\\|[*?\[\]{}]|\bsymlink:)/i;
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
    checkStructuredEvidence(content, label, file);
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

function checkStructuredEvidence(content, label, file) {
  const result = validateEvidenceBlock(content, structuredEvidenceSchema, label, { require: requireStructuredEvidence });
  if (!result.ok) {
    for (const error of result.errors) fail(error);
    return;
  }
  if (!result.present) return;

  const evidence = result.value;
  pass(`${label} structured approval evidence matches schema`);

  if (evidence.approval_status === "APPROVED") {
    if (evidence.approved_by && !nonHumanApprover.test(evidence.approved_by) && !ambiguousHumanApprover.test(evidence.approved_by)) {
      pass(`${label} structured approval owner is specific human`);
    } else {
      fail(`${label} structured approval owner must be a specific human owner`);
    }
    if (evidence.plan_changed_after_approval === false) pass(`${label} structured approval confirms plan unchanged`);
    else fail(`${label} structured approval must not approve a changed plan`);
    if (evidence.risk_acceptance?.high_risk_action_included === false
      && evidence.risk_acceptance?.human_only_action_included === false) {
      pass(`${label} structured approval excludes high-risk and human-only actions`);
    } else {
      fail(`${label} structured approval must exclude high-risk and human-only actions`);
    }
    if (evidence.rollback_reviewed === true && evidence.verification_reviewed === true) {
      pass(`${label} structured approval includes rollback and verification acknowledgement`);
    } else {
      fail(`${label} structured approval must acknowledge rollback and verification review`);
    }
  }

  const approvedPathIds = new Set((evidence.approved_action_paths || []).map((item) => item.id));
  const approvedIds = new Set(evidence.approved_action_ids || []);
  const idsMatch = approvedIds.size === approvedPathIds.size && [...approvedIds].every((id) => approvedPathIds.has(id));
  if (idsMatch) pass(`${label} structured approval action IDs match action path rows`);
  else fail(`${label} structured approval action IDs must match action path rows`);

  if ((evidence.approved_action_paths || []).every((item) => exactStructuredPaths(item.target_paths))) {
    pass(`${label} structured approval paths are exact and bounded`);
  } else {
    fail(`${label} structured approval target paths must be exact and bounded`);
  }

  if (evidence.boundary && Object.values(evidence.boundary).every((value) => value === false)) {
    pass(`${label} structured approval boundary keeps approval non-executing`);
  } else {
    fail(`${label} structured approval boundary must keep all authority flags false`);
  }

  const reference = resolveEvidenceReference(projectRoot, file, evidence.approved_plan?.path);
  if (!reference) {
    if (requireStructuredEvidence) {
      fail(`${label} structured approval plan reference must resolve in --require-structured-evidence mode`);
      return;
    }
    pass(`${label} structured approval plan reference not found locally; digest cross-check skipped`);
    return;
  }
  const referencedContent = fs.readFileSync(reference, "utf8");
  const referenced = extractMachineReadableEvidence(referencedContent);
  if (referenced?.ok && referenced.value?.plan_digest === evidence.approved_plan.plan_digest) {
    pass(`${label} structured approval references matching apply plan digest`);
  } else {
    fail(`${label} structured approval approved_plan.plan_digest does not match referenced apply plan evidence`);
  }
}

function exactStructuredPaths(paths) {
  if (!Array.isArray(paths) || paths.length === 0) return false;
  return paths.every((item) => looksBoundedPathList(`\`${item}\``));
}

function checkApprovedRecord(content, label) {
  const identity = sectionBody(content, "Approval Identity");
  const approvedBy = strip(tableValue(identity, "Approved by"));
  const ownerType = strip(tableValue(identity, "Approval owner type")).replace(/`/g, "");
  if (approvedBy && !placeholder(approvedBy) && !nonHumanApprover.test(approvedBy) && !ambiguousHumanApprover.test(approvedBy)) {
    pass(`${label} approved record has human approver`);
  } else {
    fail(`${label} approved record approval owner must be a specific human owner`);
  }
  if (ownerType === "HUMAN") pass(`${label} approval owner type is HUMAN`);
  else fail(`${label} approved record must set Approval owner type to HUMAN`);

  const plan = sectionBody(content, "Approved Plan");
  if (markdownPath(tableValue(plan, "Unified Apply Plan"))) pass(`${label} approved record references an apply plan`);
  else fail(`${label} approved records must reference a Unified Apply Plan`);
  if (/sha256:[a-f0-9]{64}\b/i.test(plan)) pass(`${label} approved record includes plan hash`);
  else fail(`${label} approved records must include a plan hash`);
  if (/Plan changed after approval\s*\|\s*Yes/i.test(plan)) fail(`${label} plan changed after approval and must be re-approved`);
  else pass(`${label} does not record plan changes after approval`);

  const actions = sectionBody(content, "Approved Action IDs");
  const approvedRows = approvedActionRows(actions);
  const approvedIds = approvedRows.map((row) => row.id);
  if (broadApproval.test(actions)) fail(`${label} approved action ids must be explicit`);
  else pass(`${label} avoids blanket action approval`);
  if (approvedIds.length > 0) {
    pass(`${label} approved action ids are explicit`);
  } else {
    fail(`${label} approved records must include explicit approved action IDs`);
  }
  for (const row of approvedRows) {
    if (looksBoundedPathList(row.paths)) pass(`${label} approved action ${row.id} uses bounded target paths`);
    else fail(`${label} approved action ${row.id} must use exact bounded target paths`);
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
  if (isExpiredApproval(expiryValue)) fail(`${label} approval is expired and must be re-approved`);
  else pass(`${label} approval is not expired`);
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
  const statementIds = [...new Set([...statement.matchAll(/\b[A-Z]-?\d{3}\b/g)].map((match) => match[0]))];
  const missingStatementIds = approvedIds.filter((id) => !statementIds.includes(id));
  const extraStatementIds = statementIds.filter((id) => !approvedIds.includes(id));
  if (approvedIds.length > 0 && missingStatementIds.length === 0 && extraStatementIds.length === 0) {
    pass(`${label} human approval statement matches approved action IDs`);
  } else {
    fail(`${label} human approval statement must match approved action IDs`);
  }
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
    "test-fixtures/bad/bad-approval-record-wildcard-path/approval-records/001-bad.md",
    "test-fixtures/bad/bad-approval-record-parent-traversal/approval-records/001-bad.md",
    "test-fixtures/bad/bad-approval-record-symlink-path/approval-records/001-bad.md",
    "test-fixtures/bad/bad-approval-record-expired/approval-records/001-bad.md",
    "test-fixtures/bad/bad-approval-record-ambiguous-owner/approval-records/001-bad.md",
    "test-fixtures/bad/bad-approval-record-mismatched-action-id/approval-records/001-bad.md",
    "test-fixtures/bad/bad-approval-record-plan-changed/approval-records/001-bad.md",
    "schemas/artifacts/approval-record.schema.json",
    "docs/plans/structured-evidence-schema-1.41-plan.md",
    "docs/structured-evidence-schema.md",
    "examples/1.41-structured-evidence-schema/approval-records/001-structured-workflow-assets.md",
    "test-fixtures/bad/bad-structured-approval-plan-digest/approval-records/001-bad.md",
    "test-fixtures/bad/bad-structured-approval-missing-plan-ref/approval-records/001-bad.md",
    "releases/1.41.1/release-record.md",
    "releases/1.41.1/known-limitations.md",
    "releases/1.41.1/self-check-report.md",
    "releases/1.40.0/release-record.md",
    "releases/1.40.0/known-limitations.md",
    "releases/1.40.0/self-check-report.md",
    "releases/1.41.0/release-record.md",
    "releases/1.41.0/known-limitations.md",
    "releases/1.41.0/self-check-report.md",
  ]) {
    if (exists(file)) pass(`approval record source evidence exists ${file}`);
    else fail(`approval record source evidence missing ${file}`);
  }

  const example = runNode(["scripts/check-approval-record.mjs", "examples/1.40-approval-record-governance"]);
  if (example.status === 0 && example.stdout.includes("Approval Record check passed")) {
    pass("1.40 approval record example passes checker");
  } else {
    fail(`1.40 approval record example failed: ${example.stderr || example.stdout}`);
  }

  const structuredExample = runNode(["scripts/check-approval-record.mjs", "examples/1.41-structured-evidence-schema"]);
  if (structuredExample.status === 0 && structuredExample.stdout.includes("structured approval evidence matches schema")) {
    pass("1.41 structured approval example passes schema-backed checker");
  } else {
    fail(`1.41 structured approval example failed: ${structuredExample.stderr || structuredExample.stdout}`);
  }

  const strictStructuredExample = runNode(["scripts/check-approval-record.mjs", "examples/1.41-structured-evidence-schema", "--require-structured-evidence"]);
  if (strictStructuredExample.status === 0 && strictStructuredExample.stdout.includes("structured approval references matching apply plan digest")) {
    pass("1.41.1 structured approval example passes strict checker");
  } else {
    fail(`1.41.1 strict structured approval example failed: ${strictStructuredExample.stderr || strictStructuredExample.stdout}`);
  }

  for (const [name, targetArgs, expected] of [
    ["AI owner", ["test-fixtures/bad/bad-approval-record-ai-owner"], "approval owner must be a specific human owner"],
    ["missing plan hash", ["test-fixtures/bad/bad-approval-record-missing-plan-hash"], "must include a plan hash"],
    ["all actions", ["test-fixtures/bad/bad-approval-record-all-actions"], "approved action ids must be explicit"],
    ["auto apply", ["test-fixtures/bad/bad-approval-record-auto-apply"], "forbidden approval record claim"],
    ["high risk", ["test-fixtures/bad/bad-approval-record-high-risk"], "cannot approve high-risk actions"],
    ["wildcard path", ["test-fixtures/bad/bad-approval-record-wildcard-path"], "must use exact bounded target paths"],
    ["parent traversal", ["test-fixtures/bad/bad-approval-record-parent-traversal"], "must use exact bounded target paths"],
    ["symlink path", ["test-fixtures/bad/bad-approval-record-symlink-path"], "must use exact bounded target paths"],
    ["expired approval", ["test-fixtures/bad/bad-approval-record-expired"], "approval is expired"],
    ["ambiguous owner", ["test-fixtures/bad/bad-approval-record-ambiguous-owner"], "approval owner must be a specific human owner"],
    ["mismatched action ID", ["test-fixtures/bad/bad-approval-record-mismatched-action-id"], "human approval statement must match approved action IDs"],
    ["plan changed", ["test-fixtures/bad/bad-approval-record-plan-changed"], "plan changed after approval"],
    ["structured digest", ["test-fixtures/bad/bad-structured-approval-plan-digest"], "approved_plan.plan_digest does not match referenced apply plan evidence"],
    ["strict missing structured evidence", ["examples/1.40-approval-record-governance", "--require-structured-evidence"], "Machine-Readable Evidence is required"],
    ["strict missing plan reference", ["test-fixtures/bad/bad-structured-approval-missing-plan-ref", "--require-structured-evidence"], "plan reference must resolve"],
  ]) {
    const result = runNode(["scripts/check-approval-record.mjs", ...targetArgs]);
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
  if (!text || /[<>]/.test(text) || unsafePathPattern.test(text)) return false;
  const paths = pathList(text);
  return paths.length > 0 && paths.every(isSafeRelativePath);
}

function pathList(value) {
  return String(value || "")
    .split(/[,;\n]/)
    .map((item) => item.replace(/`/g, "").trim())
    .filter(Boolean);
}

function isSafeRelativePath(value) {
  const text = String(value || "").trim();
  if (!text || placeholder(text)) return false;
  if (broadApproval.test(text) || unsafePathPattern.test(text)) return false;
  if (path.isAbsolute(text) || text.startsWith("~")) return false;
  const normalized = path.posix.normalize(text.replaceAll("\\", "/"));
  if (normalized === "." || normalized === ".." || normalized.startsWith("../") || normalized.includes("/../")) return false;
  return /[\w.-]+\/[\w./-]+|\.[\w./-]+|[\w.-]+\.[A-Za-z0-9]+/.test(text);
}

function approvedActionRows(section) {
  return String(section || "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("|") && !/^\|\s*-+/.test(line))
    .map((line) => line.split("|").slice(1, -1).map((cell) => cell.trim()))
    .filter((cells) => cells.length >= 5 && /\b[A-Z]-?\d{3}\b/.test(cells[0]) && /^yes$/i.test(cells[3]))
    .map((cells) => ({
      id: cells[0].replace(/`/g, ""),
      type: cells[1].replace(/`/g, ""),
      paths: cells[2],
    }));
}

function isExpiredApproval(value) {
  const date = parseDateValue(value);
  if (!date) return false;
  return date.getTime() < Date.now();
}

function parseDateValue(value) {
  const text = strip(value);
  const match = text.match(/\b(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/);
  if (!match) return null;
  const [, year, month, day, hour = "23", minute = "59"] = match;
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute)));
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
