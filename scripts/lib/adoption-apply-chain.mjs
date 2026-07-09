import fs from "node:fs";
import path from "node:path";
import { extractMachineReadableEvidence, loadSchema, validateEvidenceBlock, validateSchema } from "./artifact-schema.mjs";
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
  const directories = ["apply-plans", "approval-records", "apply-readiness-reports"];
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
  const allFiles = [...planFiles, ...approvalFiles, ...readinessFiles];
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
          status: "VERIFIED",
          evidence: "checker:apply-readiness",
          refs: [
            `artifact:${plan.relativePath}`,
            `artifact:${approval.relativePath}`,
            `artifact:${readiness.relativePath}`,
          ],
          notes: "Apply plan, human approval record, and controlled readiness report are structured, current, digest-bound, action-bound, and path-bound.",
          errors: [],
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

export function validateApprovalRecordForInitApplyPlan(plan, approvalEvidence) {
  const executableActions = initExecutableActions(plan);
  return validateApprovalEvidenceForActionSet(approvalEvidence, {
    label: "approval record",
    planDigest: plan.planDigest,
    expectedActions: executableActions,
  });
}

export function initExecutableActions(plan) {
  const actions = Array.isArray(plan?.actions) ? plan.actions : [];
  return actions
    .map((action, index) => ({
      id: String(action?.id || formatActionId(index + 1)),
      targetPaths: normalizePathList(action?.path ? [action.path] : action?.target_paths),
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
