import fs from "node:fs";
import path from "node:path";
import { evidenceDigest, extractMachineReadableEvidence, loadSchema, validateEvidenceBlock, validateSchema } from "./artifact-schema.mjs";
import { canonicalFileDigest, projectIdentity, resolveAuthoritativeEvidenceReference } from "./evidence-authority.mjs";
import {
  normalizePathList,
  sameSet,
  validateApprovalEvidenceForActionSet,
} from "./approval-record-validation.mjs";
import { checkPlanReviewBinding } from "./plan-review-binding.mjs";
import { validateRequestBoundApplyAuthority, validateRequestBoundReadiness } from "./request-bound-apply-authority.mjs";

const ignoredNames = new Set([".gitkeep", ".DS_Store"]);

export const workflowActivationActions = new Set([
  "READY_FOR_FIRST_REQUEST",
  "READY_FOR_TASK_EXECUTION",
]);

export function isWorkflowActivationAction(value) {
  return workflowActivationActions.has(String(value || ""));
}

export function isWorkflowActivationState(state, plan = null) {
  if (isWorkflowActivationAction(state?.nextAction)) return true;
  return false;
}

export function evaluateVerifiedAdoptionApplyChain(projectRoot, options = {}) {
  const schemasRoot = options.schemasRoot || projectRoot;
  const planSchema = options.planSchema || loadSchema(schemasRoot, "schemas/artifacts/unified-apply-plan.schema.json");
  const approvalSchema = options.approvalSchema || loadSchema(schemasRoot, "schemas/artifacts/approval-record.schema.json");
  const requestAuthoritySchema = options.requestAuthoritySchema || loadSchema(schemasRoot, "schemas/artifacts/request-bound-apply-authority.schema.json");
  const readinessSchema = options.readinessSchema || loadSchema(schemasRoot, "schemas/artifacts/controlled-apply-readiness.schema.json");
  const receiptSchema = options.receiptSchema || loadSchema(schemasRoot, "schemas/artifacts/apply-execution-receipt.schema.json");
  const directories = ["apply-plans", "approval-records", "apply-readiness-reports", "apply-receipts", ".intentos/apply-authorities"];
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

  const receiptReference = String(options.receiptReference || "").trim();
  const receiptSchemas = {
    receiptSchema,
    approvalSchema,
    requestAuthoritySchema,
    readinessSchema,
  };
  const verifiedReceipt = receiptReference
    ? verifiedApplyReceiptForReference(projectRoot, receiptReference, receiptSchemas)
    : findVerifiedApplyReceipt(projectRoot, receiptFiles, receiptSchemas);
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
        readinessErrors.push(...validateReadinessPlanReview(
          projectRoot,
          path.join(projectRoot, readiness.relativePath),
          readiness.value,
        ));
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

export function validateVerifiedApplyReceiptFile(projectRoot, receiptReference, options = {}) {
  const schemasRoot = options.schemasRoot || projectRoot;
  const schemas = {
    receiptSchema: options.receiptSchema || loadSchema(schemasRoot, "schemas/artifacts/apply-execution-receipt.schema.json"),
    approvalSchema: options.approvalSchema || loadSchema(schemasRoot, "schemas/artifacts/approval-record.schema.json"),
    requestAuthoritySchema: options.requestAuthoritySchema || loadSchema(schemasRoot, "schemas/artifacts/request-bound-apply-authority.schema.json"),
    readinessSchema: options.readinessSchema || loadSchema(schemasRoot, "schemas/artifacts/controlled-apply-readiness.schema.json"),
  };
  const resolved = resolveAuthoritativeEvidenceReference(projectRoot, options.fromFile || "", receiptReference);
  if (!resolved.ok) return { ok: false, value: null, relativePath: "", errors: [`apply receipt unresolved: ${resolved.error}`] };
  const validated = validateEvidenceBlock(
    fs.readFileSync(resolved.file, "utf8"),
    schemas.receiptSchema,
    resolved.relativePath,
    { require: true },
  );
  if (!validated.ok) return { ok: false, value: validated.value, relativePath: resolved.relativePath, errors: validated.errors };
  const errors = validateReceiptAgainstProject(projectRoot, resolved.file, validated.value, schemas);
  return {
    ok: errors.length === 0,
    value: validated.value,
    relativePath: resolved.relativePath,
    errors,
  };
}

function findVerifiedApplyReceipt(projectRoot, receiptFiles, schemas) {
  const errors = [];
  for (const relativePath of receiptFiles) {
    const validation = validateVerifiedApplyReceiptFile(projectRoot, relativePath, schemas);
    if (validation.ok) {
      return {
        ok: true,
        refs: receiptChainRefs(relativePath, validation.value),
        errors: [],
      };
    }
    errors.push(...validation.errors.map((error) => `${relativePath}: ${error}`));
  }
  return { ok: false, refs: [], errors };
}

function verifiedApplyReceiptForReference(projectRoot, receiptReference, schemas) {
  const validation = validateVerifiedApplyReceiptFile(projectRoot, receiptReference, schemas);
  if (!validation.ok) return { ok: false, refs: [], errors: validation.errors };
  return {
    ok: true,
    refs: receiptChainRefs(validation.relativePath, validation.value),
    errors: [],
  };
}

function receiptChainRefs(receiptPath, receipt) {
  return [
    `artifact:${receiptPath}`,
    `artifact:${receipt.execution_plan.path}`,
    `artifact:${receipt.apply_authority?.path || receipt.approval_record?.path}`,
    `artifact:${receipt.readiness_report.path}`,
  ];
}

function validateReceiptAgainstProject(projectRoot, receiptFile, receipt, schemas) {
  const errors = [];
  const currentReceipt = receipt.schema_version === "1.113.0";
  if (receipt.receipt_state !== "APPLY_VERIFIED" || receipt.outcome !== "APPLY_VERIFIED") errors.push("receipt state is not APPLY_VERIFIED");
  if (receipt.project_identity?.root_digest !== projectIdentity(projectRoot).fingerprint) errors.push("receipt project identity mismatch");
  if (!Array.isArray(receipt.unexpected_changed_paths) || receipt.unexpected_changed_paths.length > 0) errors.push("receipt contains unexpected changed paths");
  if (receipt.activation?.status !== "VERIFIED" || receipt.activation?.read_only !== true || receipt.activation?.workflow_next_exit_code !== "0") {
    errors.push("receipt activation is not verified and read-only");
  }
  if (currentReceipt && (
    receipt.activation?.cold_start_state !== "COLD_START_VERIFIED"
    || receipt.activation?.route_state !== "ROUTE_VERIFIED"
    || receipt.activation?.project_work_queue_unchanged !== "Yes"
    || receipt.activation?.synthetic_current_items_created !== "No"
    || !/^sha256:[a-f0-9]{64}$/.test(String(receipt.activation?.cold_start_digest || ""))
    || !/^sha256:[a-f0-9]{64}$/.test(String(receipt.activation?.route_digest || ""))
  )) {
    errors.push("receipt does not prove the full project-local IntentOS behavioral route");
  }

  const planRef = resolveAuthoritativeEvidenceReference(projectRoot, receiptFile, receipt.execution_plan?.path);
  const authorityReference = receipt.apply_authority?.path || receipt.approval_record?.path;
  const authorityRef = resolveAuthoritativeEvidenceReference(projectRoot, receiptFile, authorityReference);
  const readinessRef = resolveAuthoritativeEvidenceReference(projectRoot, receiptFile, receipt.readiness_report?.path);
  if (!planRef.ok) errors.push(`execution plan unresolved: ${planRef.error}`);
  if (!authorityRef.ok) errors.push(`apply authority unresolved: ${authorityRef.error}`);
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
  if (currentReceipt) {
    if (!Date.parse(String(receipt.executed_at || ""))) errors.push("current receipt executed_at is missing or invalid");
    if (receipt.execution_plan.operation_kind !== plan.operationKind) errors.push("execution operation kind mismatch");
    if (receipt.execution_plan.adoption_assessment_digest !== (plan.adoptionAssessment?.assessment_digest || "N/A")) errors.push("native-adoption assessment digest mismatch");
    if (plan.operationKind === "NATIVE_ADOPTION" && plan.adoptionAssessment?.assessment_state !== "READY_FOR_REQUEST_BOUND_NATIVE_ADOPTION") {
      errors.push("native-adoption plan was not technically ready");
    }
  }

  const readiness = readStructuredMarkdown(readinessRef.file, schemas.readinessSchema, "readiness report", errors);
  if (!readiness) return errors;
  if (receipt.apply_authority?.authority_mode === "REQUEST_BOUND_LOCAL") {
    const authority = readStructuredJson(authorityRef.file, schemas.requestAuthoritySchema, "request-bound apply authority", errors);
    if (!authority) return errors;
    const executedAt = Date.parse(String(receipt.executed_at || ""));
    const authorityIssuedAt = Date.parse(String(authority.issued_at || ""));
    const authorityExpiresAt = Date.parse(String(authority.expires_at || ""));
    const authorityValidation = validateRequestBoundApplyAuthority(authority, {
      plan,
      planRelativePath: planRef.relativePath,
      allowExpired: true,
      postApplyExactGraph: true,
    });
    errors.push(...authorityValidation.errors);
    errors.push(...validateRequestBoundReadiness(readiness, {
      plan,
      authority,
      planRelativePath: planRef.relativePath,
      authorityRelativePath: authorityRef.relativePath,
    }).errors);
    if (!Number.isFinite(executedAt) || executedAt < authorityIssuedAt || executedAt > authorityExpiresAt) errors.push("receipt execution time is outside the request authority lifetime");
    if (receipt.apply_authority.artifact_id !== authority.artifact_id) errors.push("request authority identity mismatch");
    if (receipt.apply_authority.authority_digest !== authority.authority_digest) errors.push("request authority digest mismatch");
  } else {
    const approval = readStructuredMarkdown(authorityRef.file, schemas.approvalSchema, "approval record", errors);
    if (!approval) return errors;
    errors.push(...validateApprovalRecordForInitApplyPlan(plan, approval));
    errors.push(...validateReadinessForInitApplyPlan(plan, readiness));
    if ((receipt.apply_authority?.artifact_id || receipt.approval_record?.artifact_id) !== approval.artifact_id) errors.push("approval identity mismatch");
    if (receipt.apply_authority?.authority_digest && receipt.apply_authority.authority_digest !== evidenceDigest(approval, [])) errors.push("approval authority digest mismatch");
  }
  errors.push(...validateReadinessPlanReview(projectRoot, readinessRef.file, readiness));
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
  const expectedImpact = controlledApplyImpactFlags(expectedActions);
  if (receipt.boundary?.modifies_ci_or_hooks !== expectedImpact.modifiesCiOrHooks) {
    errors.push("receipt CI/hook impact does not match the execution plan");
  }
  if (receipt.boundary?.changes_project_authority !== expectedImpact.changesProjectAuthority) {
    errors.push("receipt project-authority impact does not match the execution plan");
  }
  if (currentReceipt && receipt.boundary?.only_authorized_actions_executed !== true) errors.push("receipt does not confirm the exact authorized action graph");
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

function readStructuredJson(file, schema, label, errors) {
  let value;
  try {
    value = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    errors.push(`${label} JSON invalid: ${error.message}`);
    return null;
  }
  const validated = validateSchema(value, schema, { label });
  if (!validated.ok) {
    errors.push(...validated.errors);
    return null;
  }
  return value;
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

export function controlledApplyImpactFlags(actions = []) {
  const paths = actions.flatMap((action) => normalizePathList(
    action?.targetPaths
      || action?.target_paths
      || [action?.path].filter(Boolean),
  ));
  return {
    modifiesCiOrHooks: paths.some((relative) => relative.startsWith(".github/workflows/")
      || relative.startsWith("hooks/")
      || relative.startsWith(".git/hooks/")),
    changesProjectAuthority: paths.some((relative) => [
      "AGENTS.md",
      "agent.md",
      ".agent.md",
      ".intentos-bridge.json",
    ].includes(relative)),
  };
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
  for (const action of readiness.actions || []) {
    if (action.classification !== "LOW_RISK_CANDIDATE") {
      errors.push(`readiness action ${action.id || "<unknown>"} is not a low-risk candidate`);
    }
  }
  for (const precondition of readiness.preconditions || []) {
    if (precondition.status === "fail") errors.push(`readiness precondition failed: ${precondition.name || "<unknown>"}`);
  }
  if (readiness.rollback?.required !== true) errors.push("readiness rollback must be required");
  for (const field of ["path", "step", "verification"]) {
    if (!String(readiness.rollback?.[field] || "").trim()) errors.push(`readiness rollback.${field} is required`);
  }
  for (const field of ["pre_apply", "post_apply", "evidence_path"]) {
    if (!String(readiness.verification?.[field] || "").trim()) errors.push(`readiness verification.${field} is required`);
  }
  if (readiness.outcome !== "READINESS_RECORDED") errors.push("readiness outcome must be READINESS_RECORDED");
  for (const [field, value] of Object.entries(readiness.boundary || {})) {
    if (value !== false) errors.push(`readiness boundary ${field} must be false`);
  }
  return errors;
}

export function validateReadinessPlanReview(projectRoot, readinessFile, readiness) {
  const errors = [];
  checkPlanReviewBinding({
    projectRoot,
    currentFile: readinessFile,
    evidence: readiness,
    label: "apply readiness",
    requirePlanReview: readiness?.plan_review_binding?.required === "Yes",
    consumer: "adoption apply chain",
    consumerPlanRef: readiness.apply_plan?.path,
    consumerPlanDigest: readiness.apply_plan?.plan_digest,
    consumerPlanLabel: "apply_plan",
    pass: () => {},
    fail: (message) => errors.push(message),
  });
  return errors;
}
