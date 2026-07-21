#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
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
  controlledApplyImpactFlags,
  initExecutableActions,
  isWorkflowActivationState,
  validateVerifiedApplyReceiptFile,
  validateApprovalRecordForInitApplyPlan,
  validateReadinessForInitApplyPlan,
} from "./lib/adoption-apply-chain.mjs";
import { gitWorktreeState } from "./lib/git.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["require-structured-evidence", "allow-empty", "receipt"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const requireEvidence = Boolean(args["require-structured-evidence"]);
const receiptSchema = loadSchema(projectRoot, "schemas/artifacts/apply-execution-receipt.schema.json");
const approvalSchema = loadSchema(projectRoot, "schemas/artifacts/approval-record.schema.json");
const readinessSchema = loadSchema(projectRoot, "schemas/artifacts/controlled-apply-readiness.schema.json");
let failures = 0;

if (unknown.length > 0) fail(`unknown option: --${unknown.join(", --")}`);

const files = args.receipt
  ? selectedReceiptFiles(String(args.receipt))
  : markdownFiles(path.join(projectRoot, "apply-receipts"));
if (files.length === 0) {
  if (requireEvidence) fail("apply execution receipt is required but no report exists");
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
  if (receipt.schema_version === "1.113.0") {
    const current = validateVerifiedApplyReceiptFile(projectRoot, relative, { schemasRoot: projectRoot });
    if (!current.ok) {
      for (const error of current.errors) fail(`${relative}: ${error}`);
      return;
    }
    pass(`${relative} binds one current request authority, exact action graph, current targets, and full behavioral activation`);
    const planResolved = resolveLocal(file, receipt.execution_plan.path, "execution plan");
    const plan = planResolved ? readJson(planResolved.file, `${relative} execution plan`) : null;
    if (plan) checkActivation(receipt, plan, relative);
    return;
  }
  if (receipt.outcome === receipt.receipt_state) pass(`${relative} outcome matches receipt state`);
  else fail(`${relative} outcome must match receipt_state`);

  const identity = projectIdentity(projectRoot);
  if (receipt.project_identity.root_digest === identity.fingerprint) pass(`${relative} matches current project identity`);
  else fail(`${relative} belongs to another project`);

  const planResolved = resolveLocal(file, receipt.execution_plan.path, "execution plan");
  const approvalResolved = resolveLocal(file, receipt.approval_record.path, "approval record");
  const readinessResolved = resolveLocal(file, receipt.readiness_report.path, "readiness report");
  if (!planResolved || !approvalResolved || !readinessResolved) return;

  const plan = readJson(planResolved.file, `${relative} execution plan`);
  const approval = readMarkdownEvidence(approvalResolved.file, approvalSchema, `${relative} approval record`);
  const readiness = readMarkdownEvidence(readinessResolved.file, readinessSchema, `${relative} readiness report`);
  if (!plan || !approval || !readiness) return;
  checkBoundary(receipt, plan, relative);

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

  const actionFailuresBefore = failures;
  checkActionSet(receipt, plan, relative);
  if (failures > actionFailuresBefore) return;
  checkActivation(receipt, plan, relative);
}

function checkBoundary(receipt, plan, label) {
  const boundary = receipt.boundary || {};
  if (boundary.only_approved_actions_executed === true) pass(`${label} records approved-only execution`);
  else fail(`${label} must record approved-only execution`);
  for (const key of [
    "approves_business_implementation",
    "approves_release_or_production",
    "proves_product_correctness",
  ]) {
    if (boundary[key] === false) pass(`${label} boundary ${key} is false`);
    else fail(`${label} boundary ${key} must be false`);
  }
  const expectedImpact = controlledApplyImpactFlags(initExecutableActions(plan));
  if (boundary.modifies_ci_or_hooks === expectedImpact.modifiesCiOrHooks) pass(`${label} CI/hook impact matches the execution plan`);
  else fail(`${label} CI/hook impact must match the execution plan`);
  if (boundary.changes_project_authority === expectedImpact.changesProjectAuthority) pass(`${label} project-authority impact matches the execution plan`);
  else fail(`${label} project-authority impact must match the execution plan`);
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

function checkActivation(receipt, plan, label) {
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

  const version = readJson(path.join(projectRoot, ".intentos", "version.json"), `${label} installed IntentOS version`);
  if (version?.intentOSVersion === plan.intentOSVersion) pass(`${label} installed IntentOS version remains current`);
  else fail(`${label} installed IntentOS version no longer matches the approved plan`);

  const workflowNext = path.join(projectRoot, "scripts", "workflow-next.mjs");
  if (!fs.existsSync(workflowNext)) {
    fail(`${label} installed workflow-next entry is missing`);
    return;
  }
  if (!matchesApprovedPlanTarget(plan, "scripts/workflow-next.mjs")) {
    fail(`${label} installed workflow-next does not match the approved plan action`);
    return;
  }
  const before = gitWorktreeState(projectRoot);
  const result = spawnSync(process.execPath, [workflowNext, projectRoot, "--json"], {
    cwd: projectRoot,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 20,
    timeout: 30000,
  });
  const after = gitWorktreeState(projectRoot);
  let current = null;
  try {
    current = JSON.parse(result.stdout);
  } catch {
    current = null;
  }
  const nextAction = String(current?.nextAction || "");
  const projectState = typeof current?.projectState === "string"
    ? current.projectState
    : String(current?.projectState?.state || current?.projectStateTags?.[0] || "");
  if (result.status === 0 && current && isWorkflowActivationState(current, plan) && projectState) {
    pass(`${label} current workflow activation remains ready`);
  } else {
    fail(`${label} current workflow activation is no longer ready`);
  }
  if (before.observationStatus === after.observationStatus && before.changedFilesDigest === after.changedFilesDigest) {
    pass(`${label} activation recheck is read-only`);
  } else {
    fail(`${label} activation recheck changed the project or Git observation failed`);
  }
  if (nextAction === receipt.activation.next_action && projectState === receipt.activation.project_state) {
    pass(`${label} current activation route matches the recorded receipt`);
  } else {
    fail(`${label} current activation route differs from the recorded receipt`);
  }

  if (plan?.arguments?.baselineLevel && Array.isArray(plan?.arguments?.profiles) && plan.arguments.profiles.length > 0) {
    runCurrentBaselineCheck(plan, label);
  }
}

function runCurrentBaselineCheck(plan, label) {
  const baselineChecker = path.join(projectRoot, "scripts", "check-baseline-installation.mjs");
  if (!fs.existsSync(baselineChecker)) {
    fail(`${label} installed baseline checker is missing`);
    return;
  }
  if (!matchesApprovedPlanTarget(plan, "scripts/check-baseline-installation.mjs")) {
    fail(`${label} installed baseline checker does not match the approved plan action`);
    return;
  }
  const baseline = spawnSync(process.execPath, [
    baselineChecker,
    projectRoot,
    "--require-selection",
    "--allow-pending-receipt",
  ], { cwd: projectRoot, encoding: "utf8", maxBuffer: 1024 * 1024 * 20, timeout: 30000 });
  if (baseline.status === 0) pass(`${label} current baseline installation remains structurally valid`);
  else fail(`${label} current baseline installation is invalid`);

  if (plan.arguments.baselineLevel !== "BL2_INDUSTRIAL") return;
  const industrialChecker = path.join(projectRoot, "scripts", "check-industrial-baseline.mjs");
  if (fs.existsSync(industrialChecker) && !matchesApprovedPlanTarget(plan, "scripts/check-industrial-baseline.mjs")) {
    fail(`${label} installed industrial checker does not match the approved plan action`);
    return;
  }
  const industrial = fs.existsSync(industrialChecker)
    ? spawnSync(process.execPath, [industrialChecker, projectRoot, "--strict"], {
      cwd: projectRoot,
      encoding: "utf8",
      maxBuffer: 1024 * 1024 * 20,
      timeout: 30000,
    })
    : { status: 1 };
  if (industrial.status === 0) pass(`${label} current BL2 industrial evidence remains valid`);
  else fail(`${label} current BL2 industrial evidence is invalid`);
}

function matchesApprovedPlanTarget(plan, relativePath) {
  const action = (plan.actions || []).find((item) => item.path === relativePath);
  if (!action?.expectedHashAfter) return false;
  const fullPath = path.join(projectRoot, relativePath);
  return canonicalFileDigest(fullPath) === action.expectedHashAfter;
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
