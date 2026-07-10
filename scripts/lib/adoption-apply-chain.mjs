import fs from "node:fs";
import path from "node:path";
import { evidenceDigest, extractMachineReadableEvidence, loadSchema, validateEvidenceBlock, validateSchema } from "./artifact-schema.mjs";
import { canonicalFileDigest, projectIdentity, resolveAuthoritativeEvidenceReference } from "./evidence-authority.mjs";
import {
  normalizePathList,
  sameSet,
  validateApprovalEvidenceForActionSet,
} from "./approval-record-validation.mjs";

const ignoredNames = new Set([".gitkeep", ".DS_Store"]);

export function evaluateVerifiedAdoptionApplyChain(projectRoot, options = {}) {
  const schemasRoot = options.schemasRoot || projectRoot;
  const planSchema = options.planSchema || loadSchema(schemasRoot, "schemas/artifacts/unified-apply-plan.schema.json");
  const approvalSchema = options.approvalSchema || loadSchema(schemasRoot, "schemas/artifacts/approval-record.schema.json");
  const readinessSchema = options.readinessSchema || loadSchema(schemasRoot, "schemas/artifacts/controlled-apply-readiness.schema.json");
  const receiptSchema = options.receiptSchema || loadSchema(schemasRoot, "schemas/artifacts/apply-execution-receipt.schema.json");
  const directories = ["apply-plans", "approval-records", "apply-readiness-reports", "apply-receipts"];
  const existingDirectories = directories.filter((dir) => fs.existsSync(path.join(projectRoot, dir)));
  if (existingDirectories.length === 0) {
    return {
      status: "NOT_APPLICABLE_WITH_REASON",
      evidence: "human-decision:no-target-writes",
      refs: ["human-decision:no-target-writes"],
      notes: "No target writes were performed by this assurance report.",
      errors: [],
    };
  }

  const planFiles = markdownFiles(projectRoot, "apply-plans");
  const approvalFiles = markdownFiles(projectRoot, "approval-records");
  const readinessFiles = markdownFiles(projectRoot, "apply-readiness-reports");
  const receiptFiles = markdownFiles(projectRoot, "apply-receipts");
  const allFiles = [...planFiles, ...approvalFiles, ...readinessFiles, ...receiptFiles];
  if (allFiles.length === 0) {
    return {
      status: "PRESENT_UNVERIFIED",
      evidence: "checker:apply-readiness",
      refs: ["checker:apply-readiness"],
      notes: "Apply-chain directories exist, but no non-placeholder apply plan, approval record, or readiness report was found.",
      errors: ["no non-placeholder apply-chain files found"],
    };
  }

  const plans = planFiles.map((file) => readEvidenceFile(projectRoot, file, planSchema, "apply plan", { digestField: "plan_digest" }));
  const approvals = approvalFiles.map((file) => readEvidenceFile(projectRoot, file, approvalSchema, "approval record"));
  const readinessReports = readinessFiles.map((file) => readEvidenceFile(projectRoot, file, readinessSchema, "apply readiness"));
  const parseErrors = [...plans, ...approvals, ...readinessReports].flatMap((item) => item.errors);

  const verifiedReceipt = findVerifiedApplyReceipt(projectRoot, receiptFiles, {
    receiptSchema,
    approvalSchema,
    readinessSchema,
  });
  if (verifiedReceipt.ok) {
    return {
      status: "VERIFIED",
      evidence: "checker:apply-receipt",
      refs: verifiedReceipt.refs,
      notes: "The exact approved execution graph, current target hashes, and read-only workflow activation are verified by a project-bound Apply Receipt.",
      errors: [],
    };
  }

  for (const plan of plans.filter((item) => item.ok)) {
    const planDigest = String(plan.value?.plan_digest || "");
    if (!planDigest) continue;
    const planActions = normalizePlanActions(plan.value);
    for (const approval of approvals.filter((item) => item.ok)) {
      const approvalErrors = validateApprovalForPlan(approval.value, planDigest, planActions);
      if (approvalErrors.length > 0) continue;
      for (const readiness of readinessReports.filter((item) => item.ok)) {
        const readinessErrors = validateReadinessForPlan(readiness.value, planDigest, planActions);
        if (readinessErrors.length > 0) continue;
        return {
          status: "PRESENT_UNVERIFIED",
          evidence: "checker:apply-readiness",
          refs: [
            `artifact:${plan.relativePath}`,
            `artifact:${approval.relativePath}`,
            `artifact:${readiness.relativePath}`,
          ],
          notes: "Plan, approval, and readiness are verified as preparation evidence, but applied adoption still requires a valid project-bound Apply Receipt.",
          errors: verifiedReceipt.errors.length > 0 ? verifiedReceipt.errors : ["apply receipt is missing"],
        };
      }
    }
  }

  return {
    status: "PRESENT_UNVERIFIED",
    evidence: "checker:apply-readiness",
    refs: [
      "checker:apply-readiness",
      ...allFiles.map((file) => `artifact:${file}`),
    ],
    notes: "Apply-chain evidence is present but is not fully verified; plan, human approval, readiness, digest, action IDs, and target paths must all match before verified apply can be claimed.",
    errors: parseErrors.length > 0 ? parseErrors : ["no verified plan/approval/readiness chain matched"],
  };
}

function findVerifiedApplyReceipt(projectRoot, receiptFiles, schemas) {
  const errors = [];
  for (const relativePath of receiptFiles) {
    const fullPath = path.join(projectRoot, relativePath);
    const validated = validateEvidenceBlock(fs.readFileSync(fullPath, "utf8"), schemas.receiptSchema, relativePath, { require: true });
    if (!validated.ok) {
      errors.push(...validated.errors);
      continue;
    }
    const receipt = validated.value;
    const receiptErrors = validateReceiptAgainstProject(projectRoot, fullPath, receipt, schemas);
    if (receiptErrors.length === 0) {
      return {
        ok: true,
        refs: [
          `artifact:${relativePath}`,
          `artifact:${receipt.execution_plan.path}`,
          `artifact:${receipt.approval_record.path}`,
          `artifact:${receipt.readiness_report.path}`,
        ],
        errors: [],
      };
    }
    errors.push(...receiptErrors.map((error) => `${relativePath}: ${error}`));
  }
  return { ok: false, refs: [], errors };
}

function validateReceiptAgainstProject(projectRoot, receiptFile, receipt, schemas) {
  const errors = [];
  if (receipt.receipt_state !== "APPLY_VERIFIED" || receipt.outcome !== "APPLY_VERIFIED") errors.push("receipt state is not APPLY_VERIFIED");
  if (receipt.project_identity?.root_digest !== projectIdentity(projectRoot).fingerprint) errors.push("receipt project identity mismatch");
  if (!Array.isArray(receipt.unexpected_changed_paths) || receipt.unexpected_changed_paths.length > 0) errors.push("receipt contains unexpected changed paths");
  if (receipt.activation?.status !== "VERIFIED" || receipt.activation?.read_only !== true || receipt.activation?.workflow_next_exit_code !== "0") {
    errors.push("receipt activation is not verified and read-only");
  }

  const planRef = resolveAuthoritativeEvidenceReference(projectRoot, receiptFile, receipt.execution_plan?.path);
  const approvalRef = resolveAuthoritativeEvidenceReference(projectRoot, receiptFile, receipt.approval_record?.path);
  const readinessRef = resolveAuthoritativeEvidenceReference(projectRoot, receiptFile, receipt.readiness_report?.path);
  if (!planRef.ok) errors.push(`execution plan unresolved: ${planRef.error}`);
  if (!approvalRef.ok) errors.push(`approval record unresolved: ${approvalRef.error}`);
  if (!readinessRef.ok) errors.push(`readiness report unresolved: ${readinessRef.error}`);
  if (errors.length > 0) return errors;

  let plan;
  try {
    plan = JSON.parse(fs.readFileSync(planRef.file, "utf8"));
  } catch (error) {
    return [`execution plan JSON invalid: ${error.message}`];
  }
  if (plan.planDigest !== evidenceDigest(plan, ["planDigest"]) || receipt.execution_plan.plan_digest !== plan.planDigest) {
    errors.push("execution plan digest mismatch");
  }
  if (receipt.execution_plan.manifest_digest !== plan.manifestDigest) errors.push("manifest digest mismatch");

  const approval = readStructuredMarkdown(approvalRef.file, schemas.approvalSchema, "approval record", errors);
  const readiness = readStructuredMarkdown(readinessRef.file, schemas.readinessSchema, "readiness report", errors);
  if (!approval || !readiness) return errors;
  errors.push(...validateApprovalRecordForInitApplyPlan(plan, approval));
  errors.push(...validateReadinessForInitApplyPlan(plan, readiness));
  if (receipt.approval_record.artifact_id !== approval.artifact_id) errors.push("approval identity mismatch");
  if (receipt.readiness_report.artifact_id !== readiness.artifact_id) errors.push("readiness identity mismatch");
  if (receipt.readiness_report.evidence_digest !== evidenceDigest(readiness, [])) errors.push("readiness evidence digest mismatch");

  const expectedActions = initExecutableActions(plan);
  const receiptActions = Array.isArray(receipt.actions) ? receipt.actions : [];
  if (!sameSet(expectedActions.map((item) => item.id), receiptActions.map((item) => item.id))) errors.push("receipt action IDs do not match execution plan");
  const receiptById = new Map(receiptActions.map((item) => [item.id, item]));
  for (const action of plan.actions || []) {
    if (!action.willWrite || action.id === plan.receiptActionId) continue;
    const observed = receiptById.get(action.id);
    if (!observed || observed.result !== "APPLIED") {
      errors.push(`receipt action ${action.id} is not APPLIED`);
      continue;
    }
    const target = resolveAuthoritativeEvidenceReference(projectRoot, receiptFile, action.path);
    if (!target.ok) errors.push(`applied target ${action.path} is missing or unsafe`);
    else if (canonicalFileDigest(target.file) !== observed.hash_after || observed.hash_after !== action.expectedHashAfter) {
      errors.push(`applied target ${action.path} is stale or mismatched`);
    }
  }
  return errors;
}

function readStructuredMarkdown(file, schema, label, errors) {
  const extracted = extractMachineReadableEvidence(fs.readFileSync(file, "utf8"));
  if (!extracted?.ok) {
    errors.push(`${label} missing or invalid Machine-Readable Evidence`);
    return null;
  }
  const validated = validateSchema(extracted.value, schema, { label });
  if (!validated.ok) {
    errors.push(...validated.errors);
    return null;
  }
  return extracted.value;
}

export function validateApprovalRecordForInitApplyPlan(plan, approvalEvidence) {
  const executableActions = initExecutableActions(plan);
  return validateApprovalEvidenceForActionSet(approvalEvidence, {
    label: "approval record",
    planDigest: plan.planDigest,
    expectedActions: executableActions,
  });
}

export function validateReadinessForInitApplyPlan(plan, readinessEvidence) {
  const executableActions = initExecutableActions(plan);
  return validateReadinessForPlan(readinessEvidence, plan.planDigest, executableActions);
}

export function initExecutableActions(plan) {
  const actions = Array.isArray(plan?.actions) ? plan.actions : [];
  return actions
    .map((action, index) => ({
      id: String(action?.id || formatActionId(index + 1)),
      targetPaths: normalizePathList(action?.path
        ? [action.path, action.backupPath].filter(Boolean)
        : action?.target_paths),
      willWrite: action?.willWrite === true || action?.will_write_now === true,
      type: String(action?.type || action?.action_type || ""),
    }))
    .filter((action) => action.willWrite);
}

export function formatActionId(index) {
  return `A-${String(index).padStart(3, "0")}`;
}

function markdownFiles(root, relativeDir) {
  const dir = path.join(root, relativeDir);
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return [];
  const result = [];
  walk(dir, (file) => {
    const name = path.basename(file);
    if (ignoredNames.has(name)) return;
    if (!fs.statSync(file).isFile()) return;
    if (file.endsWith(".md")) result.push(path.join(relativeDir, path.relative(dir, file)).replaceAll(path.sep, "/"));
  });
  return result.sort();
}

function walk(dir, visit) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, visit);
    else visit(full);
  }
}

function readEvidenceFile(root, relativePath, schema, label, options = {}) {
  const fullPath = path.join(root, relativePath);
  const content = fs.readFileSync(fullPath, "utf8");
  if (options.digestField) {
    const result = validateEvidenceBlock(content, schema, relativePath, {
      require: true,
      digestField: options.digestField,
    });
    return {
      ok: result.ok,
      relativePath,
      value: result.value,
      errors: result.errors,
    };
  }
  const extracted = extractMachineReadableEvidence(content);
  if (!extracted) return { ok: false, relativePath, value: null, errors: [`${relativePath}: ${label} missing Machine-Readable Evidence`] };
  if (!extracted.ok) return { ok: false, relativePath, value: null, errors: extracted.errors.map((error) => `${relativePath}: ${error}`) };
  if (!schema) return { ok: false, relativePath, value: extracted.value, errors: [`${relativePath}: ${label} schema missing`] };
  const validation = validateSchema(extracted.value, schema, { label: relativePath });
  return {
    ok: validation.ok,
    relativePath,
    value: extracted.value,
    errors: validation.errors,
  };
}

function normalizePlanActions(plan) {
  return (Array.isArray(plan?.actions) ? plan.actions : []).map((action) => ({
    id: String(action?.id || ""),
    targetPaths: normalizePathList(action?.target_paths),
  })).filter((action) => action.id && action.targetPaths.length > 0);
}

function validateApprovalForPlan(approval, planDigest, planActions) {
  return validateApprovalEvidenceForActionSet(approval, {
    label: "approval record",
    planDigest,
    expectedActions: planActions,
  });
}

function validateReadinessForPlan(readiness, planDigest, planActions) {
  const errors = [];
  if (readiness.readiness_state !== "READY_FOR_HUMAN_APPROVED_APPLY") errors.push("readiness state is not READY_FOR_HUMAN_APPROVED_APPLY");
  if (readiness.can_codex_apply_now !== false) errors.push("readiness must not let Codex apply now");
  if (readiness.requires_explicit_human_approval !== true) errors.push("readiness must require explicit human approval");
  if (readiness.can_proceed_without_new_approval !== false) errors.push("readiness must not proceed without new approval");
  if (readiness.apply_plan?.plan_digest !== planDigest) errors.push("readiness plan digest mismatch");
  const readinessActions = (Array.isArray(readiness.actions) ? readiness.actions : []).map((action) => ({
    id: String(action?.id || ""),
    targetPaths: normalizePathList(action?.target_paths),
  })).filter((action) => action.id && action.targetPaths.length > 0);
  if (!sameSet(planActions.map((action) => action.id), readinessActions.map((action) => action.id))) {
    errors.push("readiness action IDs do not match plan actions");
  }
  const readinessById = new Map(readinessActions.map((action) => [action.id, action.targetPaths]));
  for (const action of planActions) {
    if (!sameSet(action.targetPaths, readinessById.get(action.id) || [])) {
      errors.push(`readiness target paths do not match ${action.id}`);
    }
  }
  return errors;
}
