#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import {
  evidenceDigest,
  extractMachineReadableEvidence,
  loadSchema,
  validateEvidenceBlock,
  validateSchema,
} from "./lib/artifact-schema.mjs";
import {
  canonicalFileDigest,
  projectIdentity,
  resolveAuthoritativeEvidenceReference,
} from "./lib/evidence-authority.mjs";
import {
  initExecutableActions,
  validateApprovalRecordForInitApplyPlan,
  validateReadinessForInitApplyPlan,
} from "./lib/adoption-apply-chain.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["require-structured-evidence", "allow-empty", "receipt"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const requireEvidence = Boolean(args["require-structured-evidence"]);
const allowEmpty = Boolean(args["allow-empty"]);
const receiptSchema = loadSchema(projectRoot, "schemas/artifacts/apply-execution-receipt.schema.json");
const approvalSchema = loadSchema(projectRoot, "schemas/artifacts/approval-record.schema.json");
const readinessSchema = loadSchema(projectRoot, "schemas/artifacts/controlled-apply-readiness.schema.json");
let failures = 0;

if (unknown.length > 0) fail(`unknown option: --${unknown.join(", --")}`);

const files = args.receipt
  ? selectedReceiptFiles(String(args.receipt))
  : markdownFiles(path.join(projectRoot, "apply-receipts"));
if (files.length === 0) {
  if (requireEvidence && !allowEmpty) fail("apply execution receipt is required but no report exists");
  else pass("apply execution receipt check skipped: no reports");
} else {
  for (const file of files) checkReceipt(file);
}

if (failures > 0) {
  console.error(`Apply Execution Receipt check failed with ${failures} issue(s).`);
  process.exit(1);
}
console.log("Apply Execution Receipt check passed.");

function checkReceipt(file) {
  const relative = path.relative(projectRoot, file).replaceAll(path.sep, "/");
  const content = fs.readFileSync(file, "utf8");
  const validated = validateEvidenceBlock(content, receiptSchema, relative, { require: true });
  if (!validated.ok) {
    for (const error of validated.errors) fail(error);
    return;
  }
  const receipt = validated.value;
  pass(`${relative} matches apply receipt schema`);
  if (receipt.outcome === receipt.receipt_state) pass(`${relative} outcome matches receipt state`);
  else fail(`${relative} outcome must match receipt_state`);

  const identity = projectIdentity(projectRoot);
  if (receipt.project_identity.root_digest === identity.fingerprint) pass(`${relative} matches current project identity`);
  else fail(`${relative} belongs to another project`);

  checkBoundary(receipt, relative);
  const planResolved = resolveLocal(file, receipt.execution_plan.path, "execution plan");
  const approvalResolved = resolveLocal(file, receipt.approval_record.path, "approval record");
  const readinessResolved = resolveLocal(file, receipt.readiness_report.path, "readiness report");
  if (!planResolved || !approvalResolved || !readinessResolved) return;

  const plan = readJson(planResolved.file, `${relative} execution plan`);
  const approval = readMarkdownEvidence(approvalResolved.file, approvalSchema, `${relative} approval record`);
  const readiness = readMarkdownEvidence(readinessResolved.file, readinessSchema, `${relative} readiness report`);
  if (!plan || !approval || !readiness) return;

  const actualPlanDigest = evidenceDigest(plan, ["planDigest"]);
  if (plan.planDigest === actualPlanDigest && receipt.execution_plan.plan_digest === actualPlanDigest) {
    pass(`${relative} binds the current execution plan digest`);
  } else {
    fail(`${relative} execution plan digest is stale or mismatched`);
  }
  if (receipt.execution_plan.intentos_version === plan.intentOSVersion) pass(`${relative} IntentOS version matches plan`);
  else fail(`${relative} IntentOS version does not match plan`);
  if (receipt.execution_plan.manifest_digest === plan.manifestDigest) pass(`${relative} manifest digest matches plan`);
  else fail(`${relative} manifest digest does not match plan`);

  for (const error of validateApprovalRecordForInitApplyPlan(plan, approval)) fail(`${relative}: ${error}`);
  for (const error of validateReadinessForInitApplyPlan(plan, readiness)) fail(`${relative}: ${error}`);
  if (receipt.approval_record.artifact_id === approval.artifact_id) pass(`${relative} approval identity matches`);
  else fail(`${relative} approval identity mismatch`);
  if (receipt.readiness_report.artifact_id === readiness.artifact_id) pass(`${relative} readiness identity matches`);
  else fail(`${relative} readiness identity mismatch`);
  if (receipt.readiness_report.evidence_digest === evidenceDigest(readiness, [])) pass(`${relative} readiness evidence digest matches`);
  else fail(`${relative} readiness evidence digest mismatch`);

  checkActionSet(receipt, plan, relative);
  checkActivation(receipt, relative);
}

function checkBoundary(receipt, label) {
  const boundary = receipt.boundary || {};
  if (boundary.only_approved_actions_executed === true) pass(`${label} records approved-only execution`);
  else fail(`${label} must record approved-only execution`);
  for (const key of [
    "approves_business_implementation",
    "approves_release_or_production",
    "modifies_ci_or_hooks",
    "changes_project_authority",
    "proves_product_correctness",
  ]) {
    if (boundary[key] === false) pass(`${label} boundary ${key} is false`);
    else fail(`${label} boundary ${key} must be false`);
  }
}

function checkActionSet(receipt, plan, label) {
  const expected = initExecutableActions(plan);
  const actual = Array.isArray(receipt.actions) ? receipt.actions : [];
  const expectedIds = expected.map((item) => item.id).sort();
  const actualIds = actual.map((item) => item.id).sort();
  if (JSON.stringify(expectedIds) === JSON.stringify(actualIds)) pass(`${label} receipt action IDs match plan`);
  else fail(`${label} receipt action IDs do not match executable plan actions`);

  const planById = new Map((plan.actions || []).map((item) => [String(item.id), item]));
  let matchedPaths = 0;
  let matchedHashes = 0;
  for (const item of actual) {
    const action = planById.get(String(item.id));
    if (!action) continue;
    const expectedPaths = [action.path, action.backupPath].filter(Boolean).sort();
    const actualPaths = [...item.target_paths].sort();
    if (JSON.stringify(expectedPaths) === JSON.stringify(actualPaths)) matchedPaths += 1;
    else fail(`${label} ${item.id} paths do not match plan`);
    if (item.id === plan.receiptActionId) continue;
    if (receipt.receipt_state === "APPLY_VERIFIED" && item.result !== "APPLIED" && item.result !== "SKIPPED") {
      fail(`${label} ${item.id} is not applied or skipped in verified receipt`);
    }
    if (item.result === "APPLIED") {
      const target = resolveAuthoritativeEvidenceReference(projectRoot, fileForLabel(label), action.path);
      if (!target.ok) {
        fail(`${label} ${item.id} current target is missing or unsafe: ${target.error}`);
      } else if (canonicalFileDigest(target.file) === item.hash_after && item.hash_after === item.expected_hash_after) {
        matchedHashes += 1;
      } else {
        fail(`${label} ${item.id} current target hash is stale or mismatched`);
      }
    }
  }
  if (matchedPaths === actual.length) pass(`${label} all receipt action paths match plan`);
  const appliedCount = actual.filter((item) => item.result === "APPLIED").length;
  if (matchedHashes === appliedCount) pass(`${label} all applied target hashes remain current`);
  if (receipt.receipt_state === "APPLY_VERIFIED" && receipt.unexpected_changed_paths.length === 0) {
    pass(`${label} has no unexpected changed paths`);
  } else if (receipt.receipt_state === "APPLY_VERIFIED") {
    fail(`${label} verified receipt must not contain unexpected changed paths`);
  }
}

function checkActivation(receipt, label) {
  if (receipt.receipt_state !== "APPLY_VERIFIED") return;
  if (receipt.activation.status === "VERIFIED" && receipt.activation.read_only === true && receipt.activation.workflow_next_exit_code === "0") {
    pass(`${label} activation is verified and read-only`);
  } else {
    fail(`${label} verified receipt requires successful read-only activation`);
  }
  if (receipt.activation.output_digest.startsWith("sha256:") && receipt.activation.project_state && receipt.activation.next_action) {
    pass(`${label} activation includes route evidence`);
  } else {
    fail(`${label} activation route evidence is incomplete`);
  }
}

function resolveLocal(fromFile, reference, label) {
  const resolved = resolveAuthoritativeEvidenceReference(projectRoot, fromFile, reference);
  if (!resolved.ok) {
    fail(`${path.relative(projectRoot, fromFile)} ${label} is unsafe or unresolved: ${resolved.error}`);
    return null;
  }
  return resolved;
}

function readJson(file, label) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    fail(`${label} JSON invalid: ${error.message}`);
    return null;
  }
}

function readMarkdownEvidence(file, schema, label) {
  const extracted = extractMachineReadableEvidence(fs.readFileSync(file, "utf8"));
  if (!extracted?.ok) {
    fail(`${label} missing or invalid Machine-Readable Evidence`);
    return null;
  }
  const validation = validateSchema(extracted.value, schema, { label });
  if (!validation.ok) {
    for (const error of validation.errors) fail(error);
    return null;
  }
  return extracted.value;
}

function markdownFiles(dir) {
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return [];
  return fs.readdirSync(dir)
    .filter((name) => name.endsWith(".md") && !name.startsWith("."))
    .map((name) => path.join(dir, name))
    .filter((file) => fs.statSync(file).isFile())
    .sort();
}

function selectedReceiptFiles(reference) {
  const resolved = resolveAuthoritativeEvidenceReference(projectRoot, "", reference, { markdownOnly: true });
  if (!resolved.ok) {
    fail(`selected apply receipt is unsafe or unresolved: ${resolved.error}`);
    return [];
  }
  if (!resolved.relativePath.startsWith("apply-receipts/") || path.dirname(resolved.relativePath) !== "apply-receipts") {
    fail("selected apply receipt must be a direct child of apply-receipts/");
    return [];
  }
  return [resolved.file];
}

function fileForLabel(label) {
  return path.join(projectRoot, label);
}

function pass(message) {
  console.log(`PASS ${message}`);
}

function fail(message) {
  failures += 1;
  console.error(`FAIL ${message}`);
}
