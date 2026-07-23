
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createHash, randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { manifestCopyRules, manifestGroup, workflowVersionAssets } from "../lib/manifest.mjs";
import { evidenceDigest, extractMachineReadableEvidence, loadSchema, validateSchema } from "../lib/artifact-schema.mjs";
import {
  controlledApplyImpactFlags,
  formatActionId,
  initExecutableActions,
  isWorkflowActivationState,
  validateVerifiedApplyReceiptFile,
  validateApprovalRecordForInitApplyPlan,
  validateReadinessForInitApplyPlan,
  validateReadinessPlanReview,
} from "../lib/adoption-apply-chain.mjs";
import { isGovernedWorkflowOutputPath, projectIdentity } from "../lib/evidence-authority.mjs";
import {
  createBootstrapTransaction,
  executeBootstrapTransaction,
  recoverInterruptedBootstrap,
} from "../lib/bootstrap-transaction.mjs";
import {
  beginControlledApplyJournal,
  commitControlledApplyAction,
  completeControlledApplyJournal,
  markControlledApplyActionApplied,
  markControlledApplyMutationComplete,
  markControlledApplyRollbackIncomplete,
  prepareControlledApplyAction,
  recoverInterruptedControlledApply,
  rollbackControlledApply,
  writeControlledApplyReceipt,
} from "../lib/controlled-apply-transaction.mjs";
import {
  resolveBehavioralAdoptionActivation,
  validateBehavioralActivation,
  verifyProjectLocalBehavioralRoute,
} from "../lib/behavioral-adoption-activation.mjs";
import {
  consumeRequestBoundApplyAuthority,
  createRequestBoundApplyAuthority,
  createRequestBoundReadiness,
  evaluateRequestBoundApplyPreflight,
  isRequestBoundLocalActionAllowed,
  requestBoundAuthorityConsumptionState,
  requestBoundSupportPaths,
  validateCurrentRequestForPlan,
  validateRequestBoundApplyAuthority,
  validateRequestBoundLocalActionGraph,
  validateRequestBoundReadiness,
} from "../lib/request-bound-apply-authority.mjs";
import { resolveProjectEntryTrust, requireTrustedProjectEntry } from "../lib/project-entry-trust.mjs";
import { projectGoalProjection } from "../lib/project-fact-projection.mjs";
import { inspectTargetTopology } from "../lib/target-topology.mjs";
import {
  normalizeBaselineLevel,
  parseSelectionIds,
  renderBaselineEvidence,
  renderBaselineSelection,
  renderEnvironmentBaseline,
  renderProjectProfile,
  resolveBaselineConfiguration,
} from "../lib/baseline-selection.mjs";
import {
  assertInsideRoot,
  assertNoSymlinkInPath,
  assertSafeNameSegment,
  assertSafeRelativePath,
  assertSafeWritePath,
  resolveBackupRoot,
  resolveUnderRoot,
} from "../lib/path-safety.mjs";

import {
  agentGovernanceAppendix,
  agentsGovernanceMigrationReportPath,
  assertExistingTargetRootIsSafe,
  baselineConfigurationForPlan,
  buildVersionRecord,
  copyDir,
  copySharedAssets,
  currentIntentOSVersion,
  fallbackCopyRules,
  installedIndustrialPackIds,
  isIgnorableNewProjectEntry,
  kitRoot,
  normalizeOutput,
  parseArgs,
  parseIndustrialPackIds,
  preferredAgentEntry,
  pullRequestTemplateMigrationReportPath,
  readExistingStarter,
  readJsonIfExists,
  requiredAgentGovernanceMarkers,
  requiredPullRequestTemplateMarkers,
  resolvePullRequestTemplateSource,
  selectedIndustrialPackIdsFromProject,
  sha256Content,
  sha256File,
  validateControlledApplyReceipt,
  snapshotTargetFiles,
  writeVersionFile
} from "./assets.mjs";

import {
  assignPlanActionIds,
  attachInitialGoalToPlan,
  bootstrapActionsFromPlan,
  buildNativeAdoptionAssessment,
  buildPlan,
  controlledBackupRunRoot,
  createTargetFingerprint,
  gitFingerprint,
  isForbiddenControlledApplyAction,
  planDigest
} from "./plan.mjs";

function validatePlanForApply(plan, backupDirOverride = null) {
  if (!plan || plan.planVersion !== "1.1") {
    throw new Error("Invalid plan: planVersion must be 1.1; regenerate the plan with IntentOS 1.92+");
  }
  if (!["INIT_PROJECT", "UPDATE_WORKFLOW_ASSETS"].includes(plan.operation)) {
    throw new Error(`Invalid plan operation: ${plan.operation}`);
  }
  if (plan.intentOSVersion !== currentIntentOSVersion) {
    throw new Error(`Plan intentOSVersion ${plan.intentOSVersion} does not match current ${currentIntentOSVersion}`);
  }
  if (plan.manifestDigest !== sha256File(path.join(kitRoot, "intentos-manifest.json"))) {
    throw new Error("Plan precondition failed: IntentOS manifest changed; regenerate the plan");
  }
  const currentProjectIdentity = projectIdentity(plan.targetRoot);
  if (plan.projectIdentity?.fingerprint !== currentProjectIdentity.fingerprint) {
    throw new Error("Plan precondition failed: target project identity changed");
  }
  if (plan.projectIdentity?.revision !== currentProjectIdentity.revision) {
    throw new Error("Plan precondition failed: target project revision changed; regenerate the plan");
  }
  if (!plan.planDigest || plan.planDigest !== planDigest(plan)) {
    throw new Error("Plan precondition failed: planDigest is missing or does not match current plan content; regenerate the plan");
  }
  if (!Array.isArray(plan.actions) || plan.actions.length === 0) {
    throw new Error("Invalid plan: actions must be a non-empty array");
  }
  if ((plan.ownershipConflicts || []).length > 0) {
    throw new Error(`Plan is blocked by unproven asset ownership: ${plan.ownershipConflicts.map((item) => item.path).join(", ")}; preserve the project-owned files or record an explicit reconcile action`);
  }
  if (!["NEW_PROJECT", "EXISTING_PROJECT"].includes(plan.arguments?.projectEntryOrigin)) {
    throw new Error("Invalid plan: projectEntryOrigin must be NEW_PROJECT or EXISTING_PROJECT");
  }
  const expectedOperationKind = plan.arguments.projectEntryOrigin === "NEW_PROJECT"
    ? "NEW_BOOTSTRAP"
    : fs.existsSync(path.join(plan.targetRoot, ".intentos", "version.json"))
      ? "CONTROLLED_UPDATE"
      : "NATIVE_ADOPTION";
  if (plan.operationKind !== expectedOperationKind) {
    throw new Error(`Plan precondition failed: operationKind must be ${expectedOperationKind}`);
  }
  if (plan.operation === "INIT_PROJECT" && plan.arguments.projectEntryOrigin === "NEW_PROJECT") {
    const goal = String(plan.arguments.goal || "").trim();
    if (!goal) {
      throw new Error("New-project controlled apply requires the original natural-language goal");
    }
    if (projectGoalProjection(goal).goal_digest !== plan.arguments.goalDigest) {
      throw new Error("New-project controlled apply goal binding is missing or invalid");
    }
    if (plan.receiptPath !== ".intentos/bootstrap-receipt.json") {
      throw new Error("New-project controlled apply must use the canonical bootstrap receipt path");
    }
  }
  if (plan.operationKind === "NATIVE_ADOPTION") {
    const goal = String(plan.arguments.goal || "").trim();
    if (!goal || projectGoalProjection(goal).goal_digest !== plan.arguments.goalDigest) {
      throw new Error("Native-adoption apply requires the original natural-language request and its exact digest");
    }
    const currentAssessment = buildNativeAdoptionAssessment(plan.targetRoot, goal);
    if (currentAssessment.assessment_state !== "READY_FOR_REQUEST_BOUND_NATIVE_ADOPTION") {
      throw new Error(`Native-adoption assessment is blocked: ${(currentAssessment.blockers || []).join("; ")}`);
    }
    if (plan.adoptionAssessment?.assessment_digest !== currentAssessment.assessment_digest) {
      throw new Error("Native-adoption assessment changed; regenerate the apply plan");
    }
  }
  for (const action of plan.actions) {
    if (!action || typeof action !== "object") {
      throw new Error("Invalid plan: every action must be an object");
    }
    if (action.path) assertSafeRelativePath(action.path, "plan action path");
    if (action.source) assertSafeRelativePath(action.source, "plan action source");
    if (!/^A-[0-9]{3,}$/.test(String(action.id || ""))) {
      throw new Error("Invalid plan: every action must include a stable A-000 style id with at least three digits; regenerate the plan");
    }
    if (action.backupPath) {
      const backupPath = assertSafeRelativePath(action.backupPath, "plan action backup path");
      const parts = backupPath.split("/");
      const runRoot = controlledBackupRunRoot(parts.slice(0, 3).join("/"), "plan action backup run root");
      if (!action.hashBefore || backupPath !== `${runRoot}/${action.path}`) {
        throw new Error(`Plan action ${action.id} backup must exactly mirror its target below the transaction backup run`);
      }
      if (isForbiddenControlledApplyAction({ ...action, path: runRoot }, plan.operation)) {
        throw new Error(`Plan action ${action.id} backup path is in a forbidden directory`);
      }
    } else if (action.hashBefore && action.willWrite && action.type !== "WRITE_APPLY_RECEIPT") {
      throw new Error(`Plan action ${action.id} is missing its transaction-owned rollback backup`);
    }
    if (action.willWrite && action.type !== "WRITE_APPLY_RECEIPT" && action.executionSupported !== true) {
      throw new Error(`Plan contains an unsupported generated action ${action.id} for ${action.path}; use a narrower selected migration plan`);
    }
    if (action.willWrite && isForbiddenControlledApplyAction(action, plan.operation)) {
      throw new Error(`Plan contains a human-only or high-risk controlled apply action ${action.id} for ${action.path}`);
    }
    const currentHash = sha256File(assertSafeWritePath(plan.targetRoot, action.path, "plan action target"));
    if (currentHash !== (action.hashBefore || null)) {
      throw new Error(`Plan precondition failed: ${action.path} changed or appeared after planning`);
    }
    if (action.source && action.willWrite) {
      const sourcePath = resolveUnderRoot(kitRoot, action.source, "plan action source");
      if (sha256File(sourcePath) !== action.sourceHash || action.expectedHashAfter !== action.sourceHash) {
        throw new Error(`Plan precondition failed: source for ${action.id} changed: ${action.source}`);
      }
    }
  }
  const forbiddenAction = plan.actions.find((action) => action.type === "FORBIDDEN");
  if (forbiddenAction) {
    throw new Error(`Plan contains forbidden action for ${forbiddenAction.path}: ${forbiddenAction.reason}`);
  }
  const backupDir = backupDirOverride || plan.arguments?.backupDir || null;
  if (backupDirOverride && backupDirOverride !== plan.arguments?.backupDir) {
    throw new Error("Plan precondition failed: backupDir override is not allowed after approval");
  }
  if (backupDir) resolveBackupRoot(plan.targetRoot, controlledBackupRunRoot(backupDir));
  const backupRoots = new Set(plan.actions.map((action) => action.backupPath)
    .filter(Boolean)
    .map((backupPath) => backupPath.split("/").slice(0, 3).join("/")));
  if (backupRoots.size > 1) throw new Error("Plan actions must share one transaction-owned backup run directory");
  for (const backupRoot of backupRoots) {
    const full = assertSafeWritePath(plan.targetRoot, backupRoot, "plan backup run root");
    try {
      fs.lstatSync(full);
      throw new Error(`Plan precondition failed: backup run already exists: ${backupRoot}`);
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
  }
  const currentFingerprint = createTargetFingerprint(plan.targetRoot, plan.actions);
  if (currentFingerprint.targetExists !== plan.targetFingerprint?.targetExists) {
    throw new Error("Plan precondition failed: target existence changed");
  }
  for (const key of ["isGitRepository", "gitBranch", "gitHead"]) {
    if (currentFingerprint[key] !== plan.targetFingerprint?.[key]) {
      throw new Error(`Plan precondition failed: target fingerprint ${key} changed`);
    }
  }
  if (currentFingerprint.sourceStateDigest !== plan.targetFingerprint?.sourceStateDigest) {
    throw new Error("Plan precondition failed: target source state changed; regenerate the plan");
  }
  const expectedHashes = plan.targetFingerprint?.fileHashes || {};
  for (const [rel, expected] of Object.entries(expectedHashes)) {
    const actual = currentFingerprint.fileHashes[rel] || null;
    if (actual !== expected) {
      throw new Error(`Plan precondition failed: ${rel} changed`);
    }
  }
  validateCanonicalApplyPlan(plan);
  return backupDir;
}

function validateCanonicalApplyPlan(plan) {
  const expected = buildPlan(plan.targetRoot, {
    starter: plan.arguments.starter,
    update: plan.operation === "UPDATE_WORKFLOW_ASSETS",
    applyPrTemplateGovernance: plan.arguments.applyPrTemplateGovernance,
    applyAgentGovernance: plan.arguments.applyAgentGovernance,
    withIndustrialPacks: plan.arguments.withIndustrialPacks,
    industrialPacks: (plan.arguments.selectedIndustrialPacks || []).join(","),
    profiles: (plan.arguments.profiles || []).join(","),
    baselineLevel: plan.arguments.baselineLevel,
    standardPacks: (plan.arguments.standardPacks || []).join(","),
    backupDir: plan.arguments.backupDir || "",
    goal: plan.arguments.goal || "",
    projectEntryOrigin: plan.arguments.projectEntryOrigin,
    createdAt: plan.createdAt,
  });
  if (expected.operation === "INIT_PROJECT" && expected.arguments?.projectEntryOrigin === "NEW_PROJECT") {
    attachInitialGoalToPlan(expected, projectGoalProjection(plan.arguments.goal));
  }
  if (expected.planDigest !== plan.planDigest) {
    const expectedActions = expected.actions || [];
    const actualActions = plan.actions || [];
    const firstDifference = Array.from({ length: Math.max(expectedActions.length, actualActions.length) }, (_, index) => index)
      .find((index) => JSON.stringify(expectedActions[index] || null) !== JSON.stringify(actualActions[index] || null));
    const differingKeys = firstDifference === undefined ? [] : [...new Set([
      ...Object.keys(expectedActions[firstDifference] || {}),
      ...Object.keys(actualActions[firstDifference] || {}),
    ])].filter((key) => JSON.stringify(expectedActions[firstDifference]?.[key]) !== JSON.stringify(actualActions[firstDifference]?.[key]));
    const detail = firstDifference === undefined
      ? `metadata differs (expected ${expected.planDigest}, received ${plan.planDigest})`
      : `action ${firstDifference + 1} differs in ${differingKeys.join(",") || "unknown fields"} (expected ${expectedActions[firstDifference]?.id || "missing"}:${expectedActions[firstDifference]?.path || "missing"}, received ${actualActions[firstDifference]?.id || "missing"}:${actualActions[firstDifference]?.path || "missing"})`;
    throw new Error(`Plan precondition failed: the action graph cannot be reproduced from the current manifest, request, and project state; ${detail}`);
  }
}


function readApprovalRecordForApply(recordPath) {
  if (!recordPath) {
    throw new Error("Approval record required: rerun with --approval-record <approval-record.md>");
  }
  const fullPath = path.resolve(process.cwd(), recordPath);
  if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
    throw new Error(`Approval record not found: ${fullPath}`);
  }
  const content = fs.readFileSync(fullPath, "utf8");
  const extracted = extractMachineReadableEvidence(content);
  if (!extracted) {
    throw new Error("Approval record must include Machine-Readable Evidence");
  }
  if (!extracted.ok) {
    throw new Error(`Approval record Machine-Readable Evidence invalid: ${extracted.errors.join("; ")}`);
  }
  const schema = loadSchema(kitRoot, "schemas/artifacts/approval-record.schema.json");
  const validation = validateSchema(extracted.value, schema, { label: "approval record" });
  if (!validation.ok) {
    throw new Error(`Approval record schema validation failed: ${validation.errors.join("; ")}`);
  }
  return { fullPath, evidence: extracted.value };
}

function validateApprovalRecordForApply(plan, approvalRecord, applyPlanFullPath) {
  const errors = validateApprovalRecordForInitApplyPlan(plan, approvalRecord.evidence);
  if (!approvalPlanPathMatches(plan, approvalRecord, applyPlanFullPath)) {
    errors.push("approval record approved_plan.path must resolve to the apply plan being executed");
  }
  if (errors.length > 0) {
    throw new Error(`Approval record precondition failed: ${errors.join("; ")}`);
  }
}

function approvalPlanPathMatches(plan, approvalRecord, applyPlanFullPath) {
  const approvedPath = String(approvalRecord.evidence?.approved_plan?.path || "");
  if (!approvedPath.trim()) return false;
  const candidates = [
    path.resolve(process.cwd(), approvedPath),
    path.resolve(path.dirname(approvalRecord.fullPath), approvedPath),
    path.resolve(plan.targetRoot, approvedPath),
  ];
  return candidates.some((candidate) => path.resolve(candidate) === path.resolve(applyPlanFullPath));
}

function readReadinessReportForApply(recordPath) {
  if (!recordPath) {
    throw new Error("Controlled Apply Readiness Report required: rerun with --readiness-report <readiness-report.md>");
  }
  const fullPath = path.resolve(process.cwd(), recordPath);
  if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
    throw new Error(`Controlled Apply Readiness Report not found: ${fullPath}`);
  }
  const content = fs.readFileSync(fullPath, "utf8");
  const extracted = extractMachineReadableEvidence(content);
  if (!extracted?.ok) {
    throw new Error("Controlled Apply Readiness Report must include valid Machine-Readable Evidence");
  }
  const schema = loadSchema(kitRoot, "schemas/artifacts/controlled-apply-readiness.schema.json");
  const validation = validateSchema(extracted.value, schema, { label: "controlled apply readiness" });
  if (!validation.ok) {
    throw new Error(`Controlled Apply Readiness schema validation failed: ${validation.errors.join("; ")}`);
  }
  return { fullPath, evidence: extracted.value };
}

function validateReadinessReportForApply(plan, readinessRecord, applyPlanFullPath) {
  const errors = validateReadinessForInitApplyPlan(plan, readinessRecord.evidence);
  errors.push(...validateReadinessPlanReview(plan.targetRoot, readinessRecord.fullPath, readinessRecord.evidence));
  if (!evidencePlanPathMatches(plan, readinessRecord, readinessRecord.evidence?.apply_plan?.path, applyPlanFullPath)) {
    errors.push("controlled apply readiness apply_plan.path must resolve to the execution plan being replayed");
  }
  if (errors.length > 0) {
    throw new Error(`Controlled Apply Readiness precondition failed: ${errors.join("; ")}`);
  }
}

function createAutomaticRequestBoundApplyContext(plan, applyPlanFullPath, options = {}) {
  if (plan.operationKind === "NEW_BOOTSTRAP") {
    throw new Error("Use the ordinary new-project command for automatic bootstrap; a standalone new-project apply plan does not create a second authority path");
  }
  const requestValidation = validateCurrentRequestForPlan(plan, {
    request: options.activeRequest,
    requestDigest: options.activeRequestDigest,
    now: options.now,
  });
  if (!requestValidation.ok) {
    throw new Error(`Current request cannot authorize this apply plan: ${requestValidation.errors.join("; ")}`);
  }
  const graphErrors = validateRequestBoundLocalActionGraph(plan);
  if (graphErrors.length > 0) {
    throw new Error(`Request-bound local apply is not allowed: ${graphErrors.join("; ")}`);
  }
  const planRelativePath = requireProjectLocalEvidencePath(plan.targetRoot, applyPlanFullPath, "execution plan");
  const [authorityRelativePath, readinessRelativePath] = requestBoundSupportPaths(plan);
  const authorityPath = assertSafeWritePath(plan.targetRoot, authorityRelativePath, "request-bound apply authority");
  const readinessPath = assertSafeWritePath(plan.targetRoot, readinessRelativePath, "request-bound apply readiness");
  for (const [label, file] of [["request-bound apply authority", authorityPath], ["request-bound apply readiness", readinessPath]]) {
    if (fs.existsSync(file)) throw new Error(`${label} already exists; regenerate the apply plan before another attempt`);
  }
  const authorityEvidence = createRequestBoundApplyAuthority({
    plan,
    planRelativePath,
    activeRequest: options.activeRequest,
    issuedAt: plan.createdAt,
  });
  const authoritySchema = loadSchema(kitRoot, "schemas/artifacts/request-bound-apply-authority.schema.json");
  const authorityStructural = validateSchema(authorityEvidence, authoritySchema, { label: "request-bound apply authority" });
  const authoritySemantic = validateRequestBoundApplyAuthority(authorityEvidence, {
    plan,
    planRelativePath,
    activeRequest: options.activeRequest,
    activeRequestDigest: options.activeRequestDigest,
    now: options.now,
    usedAuthorityDigests: requestBoundAuthorityConsumptionState(plan.targetRoot, authorityEvidence.authority_digest).consumed
      ? [authorityEvidence.authority_digest]
      : [],
  });
  const authorityErrors = [...authorityStructural.errors, ...authoritySemantic.errors];
  if (authorityErrors.length > 0) throw new Error(`Request-bound apply authority is invalid: ${authorityErrors.join("; ")}`);

  const preflight = evaluateRequestBoundApplyPreflight({
    plan,
    authority: authorityEvidence,
    planRelativePath,
    activeRequest: options.activeRequest,
    activeRequestDigest: options.activeRequestDigest,
    now: options.now,
  });
  if (!preflight.ok) throw new Error(`Request-bound apply preflight failed: ${preflight.errors.join("; ")}`);

  const readinessEvidence = createRequestBoundReadiness({
    plan,
    authority: authorityEvidence,
    planRelativePath,
    authorityRelativePath,
    preflight,
  });
  const readinessSchema = loadSchema(kitRoot, "schemas/artifacts/controlled-apply-readiness.schema.json");
  const readinessStructural = validateSchema(readinessEvidence, readinessSchema, { label: "request-bound controlled apply readiness" });
  const readinessSemantic = validateRequestBoundReadiness(readinessEvidence, {
    plan,
    authority: authorityEvidence,
    planRelativePath,
    authorityRelativePath,
  });
  const readinessErrors = [...readinessStructural.errors, ...readinessSemantic.errors];
  if (readinessErrors.length > 0) throw new Error(`Request-bound apply readiness is invalid: ${readinessErrors.join("; ")}`);
  const supportIds = transactionSupportActionIds(plan, 2);
  const authorityContent = `${JSON.stringify(authorityEvidence, null, 2)}\n`;
  const readinessContent = renderRequestBoundReadiness(readinessEvidence);
  return {
    planRelativePath,
    authorityKind: "REQUEST_BOUND_LOCAL",
    authorityRelativePath,
    authority: { fullPath: authorityPath, evidence: authorityEvidence },
    readinessRelativePath,
    readiness: { fullPath: readinessPath, evidence: readinessEvidence },
    activeRequest: options.activeRequest,
    activeRequestDigest: options.activeRequestDigest,
    authorityNow: options.now,
    transactionSupportActions: [
      transactionSupportAction(supportIds[0], authorityRelativePath, authorityContent, "request-bound apply authority"),
      transactionSupportAction(supportIds[1], readinessRelativePath, readinessContent, "request-bound apply readiness"),
    ],
  };
}

function controlledApplyRecoveryBinding(plan, context) {
  const authority = context?.authority?.evidence;
  return {
    planDigest: plan.planDigest,
    receiptPath: plan.receiptPath,
    requestDigest: authority?.request?.request_digest,
    authorityMode: context?.authorityKind,
    authorityPath: context?.authorityRelativePath,
    authorityDigest: authority?.authority_digest,
    authorizedPaths: (authority?.actions || []).flatMap((action) => action.target_paths || []),
  };
}

function deriveControlledApplyRecoveryBinding(plan, applyPlanFullPath, options = {}) {
  if (!plan?.planDigest || plan.planDigest !== planDigest(plan)) {
    throw new Error("Recovery refused: current execution plan digest is missing or invalid");
  }
  const planRelativePath = requireProjectLocalEvidencePath(plan.targetRoot, applyPlanFullPath, "execution plan");
  const [authorityRelativePath] = requestBoundSupportPaths(plan);
  const authority = createRequestBoundApplyAuthority({
    plan,
    planRelativePath,
    activeRequest: options.activeRequest,
    issuedAt: plan.createdAt,
  });
  const validation = validateRequestBoundApplyAuthority(authority, {
    plan,
    planRelativePath,
    activeRequest: options.activeRequest,
    activeRequestDigest: options.activeRequestDigest,
    now: options.now,
    postApplyExactGraph: true,
  });
  if (!validation.ok) {
    throw new Error(`Recovery refused: current request-bound apply authority is invalid: ${validation.errors.join("; ")}`);
  }
  return controlledApplyRecoveryBinding(plan, {
    authorityKind: "REQUEST_BOUND_LOCAL",
    authorityRelativePath,
    authority: { evidence: authority },
  });
}

function transactionSupportActionIds(plan, count) {
  const used = new Set((plan.actions || []).map((action) => action.id));
  const ids = [];
  let value = Math.max(900000, ...(plan.actions || []).map((action) => Number(String(action.id || "").replace(/^A-/, "")) || 0));
  while (ids.length < count) {
    value += 1;
    const id = `A-${value}`;
    if (!used.has(id)) ids.push(id);
  }
  return ids;
}

function transactionSupportAction(id, relativePath, content, reason) {
  const digest = sha256Content(content);
  return {
    id,
    type: "CREATE_TRANSACTION_SUPPORT_EVIDENCE",
    path: relativePath,
    source: null,
    inlineContentBase64: Buffer.from(content).toString("base64"),
    reason,
    willWrite: true,
    hashBefore: null,
    backupPath: null,
    sourceHash: digest,
    expectedHashAfter: digest,
    executionSupported: true,
    receiptRequired: false,
  };
}

function renderRequestBoundReadiness(evidence) {
  return [
    `# Request-Bound Controlled Apply Readiness: ${evidence.artifact_id}`,
    "",
    "## Human Summary",
    "",
    "IntentOS verified that the current natural-language request authorizes only the exact reversible project-local governance actions listed below. No technical choice is required from the user.",
    "",
    "## Machine-Readable Evidence",
    "",
    "```json",
    JSON.stringify(evidence, null, 2),
    "```",
    "",
    "## Boundary",
    "",
    "- Business implementation: not authorized",
    "- CI, hooks, release, production, secrets, paid resources, and irreversible data operations: not authorized",
    "- Unlisted paths: not authorized",
    "",
  ].join("\n");
}

function evidencePlanPathMatches(plan, record, approvedPath, applyPlanFullPath) {
  const value = String(approvedPath || "").trim();
  if (!value) return false;
  const candidates = [
    path.resolve(process.cwd(), value),
    path.resolve(path.dirname(record.fullPath), value),
    path.resolve(plan.targetRoot, value),
  ];
  return candidates.some((candidate) => path.resolve(candidate) === path.resolve(applyPlanFullPath));
}

function requireProjectLocalEvidencePath(targetRoot, filePath, label) {
  const root = fs.existsSync(targetRoot) ? fs.realpathSync(targetRoot) : path.resolve(targetRoot);
  const file = fs.realpathSync(filePath);
  const relative = path.relative(root, file);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`${label} must be stored inside the target project before controlled apply`);
  }
  assertNoSymlinkInPath(root, file, label);
  return relative.replaceAll(path.sep, "/");
}


function changedSnapshotPaths(before, after) {
  const keys = new Set([...before.keys(), ...after.keys()]);
  return [...keys].filter((key) => before.get(key) !== after.get(key)).sort();
}

function actionTargetPaths(action, additionalPaths = []) {
  return [...new Set([action.path, action.backupPath, ...additionalPaths].filter(Boolean))].sort();
}

function replayApprovedPlan(plan, context) {
  consumeRequestBoundApplyAuthority(context.authority.evidence, {
    plan,
    planRelativePath: context.planRelativePath,
    activeRequest: context.activeRequest,
    activeRequestDigest: context.activeRequestDigest,
    now: context.authorityNow,
  });
  const beforeSnapshot = snapshotTargetFiles(plan.targetRoot);
  const transactionSupportActions = context.transactionSupportActions || [];
  const executable = initExecutableActions(plan);
  const executableIds = new Set(executable.map((item) => item.id));
  const receiptAction = plan.actions.find((action) => action.id === plan.receiptActionId && action.type === "WRITE_APPLY_RECEIPT");
  if (!receiptAction || !executableIds.has(receiptAction.id)) {
    throw new Error("Execution plan is missing its approved receipt action");
  }
  const results = new Map();
  const replayed = [];
  let activation = activationNotRun();
  let unexpectedChangedPaths = [];
  let receiptState = "APPLY_FAILED_NO_WRITE";
  let rollbackAttempted = false;
  let rollbackVerified = true;
  let executionError = null;
  const mutationActions = [
    ...transactionSupportActions,
    ...plan.actions.filter((action) => action.willWrite && action.id !== receiptAction.id),
  ];
  const transaction = beginControlledApplyJournal({
    targetRoot: plan.targetRoot,
    planDigest: plan.planDigest,
    receiptPath: plan.receiptPath,
    actions: mutationActions,
    recoveryBinding: controlledApplyRecoveryBinding(plan, context),
  });

  try {
    for (const action of mutationActions) {
      const journalEntry = prepareControlledApplyAction(transaction, action);
      replayed.push(action);
      const hashAfter = replayAction(plan, action, transaction, journalEntry);
      if (hashAfter !== action.expectedHashAfter) {
        throw new Error(`Post-write digest mismatch for ${action.id} ${action.path}`);
      }
      markControlledApplyActionApplied(transaction, action.id, hashAfter);
      results.set(action.id, receiptActionResult(action, "APPLIED", hashAfter));
    }

    const afterReplay = snapshotTargetFiles(plan.targetRoot);
    const allowed = new Set([...plan.actions, ...transactionSupportActions]
      .flatMap((action) => actionTargetPaths(action)));
    allowed.add(".intentos-controlled-apply.lock.json");
    allowed.add(".intentos-controlled-apply.recovery.lock.json");
    allowed.add(path.relative(plan.targetRoot, transaction.file).replaceAll(path.sep, "/"));
    // plan.targetRoot may use an OS alias such as /var while the transaction
    // journal is anchored to its canonical /private/var root. The journal is
    // still the exact project-local file created by this transaction.
    allowed.add(path.basename(transaction.file));
    unexpectedChangedPaths = changedSnapshotPaths(beforeSnapshot, afterReplay).filter((item) => !allowed.has(item));
    if (unexpectedChangedPaths.length > 0) {
      throw new Error(`Unexpected target writes detected: ${unexpectedChangedPaths.join(", ")}`);
    }

    markControlledApplyMutationComplete(transaction);
    const pendingActivation = writePendingControlledUpdateActivation(plan, context, results, transaction);
    activation = verifyControlledAdoptionActivation(plan.targetRoot, plan, pendingActivation.environment);
    if (activation.status !== "VERIFIED") {
      throw new Error(`Installed workflow activation failed: ${activation.reason || "unknown error"}`);
    }
    receiptState = "APPLY_VERIFIED";
  } catch (error) {
    executionError = error;
    rollbackAttempted = true;
    rollbackVerified = rollbackActions(plan, replayed, results, transaction);
    receiptState = rollbackVerified ? "APPLY_FAILED_ROLLED_BACK" : "APPLY_PARTIAL_ROLLBACK_REQUIRED";
    if (!rollbackVerified) markControlledApplyRollbackIncomplete(transaction, [error.message]);
  }

  for (const action of plan.actions) {
    if (!action.willWrite || results.has(action.id) || action.id === receiptAction.id) continue;
    results.set(action.id, receiptActionResult(action, "FAILED", sha256File(path.join(plan.targetRoot, action.path))));
  }
  results.set(receiptAction.id, receiptActionResult(
    receiptAction,
    "RECEIPT_WRITTEN",
    "self",
    requestBoundSupportPaths(plan),
  ));

  let receipt = buildApplyReceipt(plan, context, {
    receiptState,
    actions: executable.map((action) => results.get(action.id)),
    unexpectedChangedPaths,
    activation,
    rollbackAttempted,
    rollbackVerified,
  });
  try {
    writeApplyReceipt(plan, receipt, transaction, receiptState === "APPLY_VERIFIED" ? "final-success" : "final-failure");
  } catch (receiptError) {
    rollbackAttempted = true;
    rollbackVerified = rollbackActions(plan, replayed, results, transaction);
    receiptState = rollbackVerified ? "APPLY_FAILED_ROLLED_BACK" : "APPLY_PARTIAL_ROLLBACK_REQUIRED";
    if (!rollbackVerified) markControlledApplyRollbackIncomplete(transaction, [receiptError.message]);
    executionError ||= receiptError;
    results.set(receiptAction.id, receiptActionResult(receiptAction, "FAILED", sha256File(path.join(plan.targetRoot, receiptAction.path))));
    receipt = buildApplyReceipt(plan, context, {
      receiptState,
      actions: executable.map((action) => results.get(action.id)),
      unexpectedChangedPaths,
      activation,
      rollbackAttempted,
      rollbackVerified,
    });
    try {
      writeApplyReceipt(plan, receipt, transaction, "fallback-failure");
    } catch (failureReceiptError) {
      throw new Error(`${executionError.message}; failed to persist failure receipt: ${failureReceiptError.message}`);
    }
  }
  if (receiptState === "APPLY_VERIFIED") {
    completeControlledApplyJournal(transaction, {
      outcome: "APPLY_VERIFIED",
      validateVerifiedReceipt: validateControlledApplyReceipt,
    });
  } else if (rollbackVerified && (rollbackAttempted || replayed.length === 0)) {
    completeControlledApplyJournal(transaction, {
      outcome: rollbackAttempted ? "APPLY_FAILED_ROLLED_BACK" : "APPLY_FAILED_NO_WRITE",
    });
  } else if (!rollbackVerified) {
    markControlledApplyRollbackIncomplete(transaction, [executionError?.message || "controlled apply rollback was not verified"]);
  }
  if (executionError) throw new Error(`${executionError.message}; apply receipt: ${plan.receiptPath}`);
  return receipt;
}

function verifyControlledAdoptionActivation(targetRoot, plan, activationEnvironment) {
  const entry = verifyInstalledWorkflowActivation(targetRoot, plan, activationEnvironment);
  const behavioral = verifyProjectLocalBehavioralRoute({
    targetRoot,
    sourceRoot: kitRoot,
    goal: plan.arguments?.goal || "continue the current IntentOS-governed task",
    allowProjectLocalExecution: true,
    activationEnvironment,
    requestBoundInitialQueue: requestBoundInitialQueueFromPlan(plan),
  });
  const verified = entry.status === "VERIFIED" && behavioral.ok && behavioral.state === "VERIFIED_ACTIVE";
  return {
    ...entry,
    status: verified ? "VERIFIED" : "FAILED",
    cold_start_state: behavioral.coldStart?.state || "BLOCKED",
    cold_start_digest: behavioral.coldStart?.digest || evidenceDigest("missing-cold-start", []),
    route_state: behavioral.routeCalibration?.state || "BLOCKED",
    route_digest: behavioral.routeCalibration?.digest || evidenceDigest("missing-route", []),
    project_work_queue_unchanged: behavioral.routeCalibration?.project_work_queue_unchanged || "No",
    synthetic_current_items_created: behavioral.routeCalibration?.synthetic_current_items_created || "Unknown",
    behavioral_results_digest: evidenceDigest(behavioral.results || [], []),
    reason: verified ? "" : [entry.reason, ...(behavioral.errors || [])].filter(Boolean).join("; "),
  };
}

function requestBoundInitialQueueFromPlan(plan) {
  const request = (plan.actions || []).find((action) => action.willWrite && /^requests\/[A-Za-z0-9._-]+\.md$/.test(String(action.path || "")));
  const queue = (plan.actions || []).find((action) => action.willWrite && /^work-queue\/[A-Za-z0-9._-]+\.md$/.test(String(action.path || "")));
  if (!request || !queue || !plan.arguments?.goal || !/^sha256:[a-f0-9]{64}$/.test(String(plan.arguments?.goalDigest || ""))) return null;
  return {
    intent: plan.arguments.goal,
    intent_digest: plan.arguments.goalDigest,
    request_path: request.path,
    request_digest: request.expectedHashAfter,
    queue_path: queue.path,
    queue_digest: queue.expectedHashAfter,
  };
}

function writePendingControlledUpdateActivation(plan, context, results, transaction = null) {
  const capability = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  const appliedActions = plan.actions
    .filter((action) => action.willWrite && action.id !== plan.receiptActionId)
    .map((action) => ({
      id: action.id,
      path: action.path,
      hash_after: results.get(action.id)?.hash_after || "N/A",
      expected_hash_after: action.expectedHashAfter || "N/A",
    }));
  const base = {
    schema_version: "1.109.0",
    artifact_type: "pending_controlled_update_activation",
    canonical_root: fs.realpathSync(plan.targetRoot),
    owner_pid: process.pid,
    created_at: new Date().toISOString(),
    expires_at: expiresAt,
    capability_digest: sha256Content(capability),
    receipt_ref: plan.receiptPath,
    plan_ref: context.planRelativePath,
    plan_file_digest: evidenceFileDigest(path.join(plan.targetRoot, context.planRelativePath)),
    plan_digest: plan.planDigest,
    apply_authority_ref: context.authorityRelativePath,
    apply_authority_file_digest: evidenceFileDigest(context.authority.fullPath),
    apply_authority_mode: context.authorityKind,
    apply_authority_digest: context.authority.evidence.authority_digest
      || evidenceDigest(context.authority.evidence, []),
    readiness_ref: context.readinessRelativePath,
    readiness_file_digest: evidenceFileDigest(context.readiness.fullPath),
    action_graph_digest: evidenceDigest(appliedActions, []),
    applied_actions: appliedActions,
    boundary: {
      temporary_identity_only: true,
      authorizes_additional_writes: false,
      authorizes_release_or_production: false,
    },
  };
  const record = { ...base, record_digest: evidenceDigest(base, []) };
  const receiptPath = assertSafeWritePath(plan.targetRoot, plan.receiptPath, "pending controlled update activation");
  const content = `${JSON.stringify(record, null, 2)}\n`;
  if (transaction) writeControlledApplyReceipt(transaction, content, "pending-activation");
  else {
    fs.mkdirSync(path.dirname(receiptPath), { recursive: true });
    atomicWriteFile(receiptPath, content);
  }
  return {
    environment: {
      INTENTOS_CONTROLLED_UPDATE_ACTIVATION_RECEIPT: plan.receiptPath,
      INTENTOS_CONTROLLED_UPDATE_ACTIVATION_CAPABILITY: capability,
      INTENTOS_CONTROLLED_UPDATE_ACTIVATION_RECORD_DIGEST: record.record_digest,
    },
  };
}

function evidenceFileDigest(file) {
  return evidenceDigest(fs.readFileSync(file).toString("base64"), []);
}

function preservedBootstrapControlFiles(targetRoot, relativePaths) {
  const expected = [...new Set(relativePaths.map((item) => assertSafeRelativePath(item, "bootstrap control evidence")))].sort();
  const snapshot = snapshotTargetFiles(targetRoot);
  const unexpected = [...snapshot.keys()].filter((item) => !expected.includes(item)).sort();
  const missing = expected.filter((item) => !snapshot.has(item));
  if (unexpected.length > 0 || missing.length > 0) {
    throw new Error([
      unexpected.length > 0 ? `New-project bootstrap shell contains non-control files: ${unexpected.join(", ")}` : "",
      missing.length > 0 ? `New-project bootstrap shell is missing control evidence: ${missing.join(", ")}` : "",
    ].filter(Boolean).join("; "));
  }
  return expected.map((relative) => {
    const file = assertSafeWritePath(targetRoot, relative, "bootstrap control evidence");
    const stat = fs.lstatSync(file);
    if (!stat.isFile() || stat.isSymbolicLink()) throw new Error(`Bootstrap control evidence must be a regular file: ${relative}`);
    return { path: relative, digest: sha256File(file) };
  });
}

function replayApprovedNewProjectPlan(plan, context) {
  if (plan.operation !== "INIT_PROJECT" || plan.arguments?.projectEntryOrigin !== "NEW_PROJECT") {
    throw new Error("Bootstrap replay requires an approved NEW_PROJECT initialization plan");
  }
  if (plan.receiptPath !== ".intentos/bootstrap-receipt.json") {
    throw new Error("New-project plan must use the canonical bootstrap receipt path");
  }
  const goalProjection = projectGoalProjection(plan.arguments?.goal);
  if (goalProjection.goal_digest !== plan.arguments?.goalDigest) {
    throw new Error("New-project plan goal binding changed after planning");
  }
  const actions = bootstrapActionsFromPlan(plan);
  const sourceInventory = plan.actions
    .filter((action) => action.willWrite && !action.dynamicReceipt)
    .map((action) => ({
      id: action.id,
      path: action.path,
      source_ref: action.source || "N/A",
      source_hash: action.sourceHash,
    }));
  const preservedControlFiles = preservedBootstrapControlFiles(plan.targetRoot, [
    context.planRelativePath,
    context.approvalRelativePath,
    context.readinessRelativePath,
  ]);
  const transaction = createBootstrapTransaction({
    topology: inspectTargetTopology(plan.targetRoot),
    actions,
    preservedControlFiles,
    goalDigest: goalProjection.goal_digest,
    planRef: context.planRelativePath,
    planDigest: plan.planDigest,
    approvalRef: context.approvalRelativePath,
    approvalDigest: evidenceDigest(context.approval.evidence, []),
    readinessRef: context.readinessRelativePath,
    readinessDigest: evidenceDigest(context.readiness.evidence, []),
    sourceInventoryDigest: evidenceDigest(sourceInventory, []),
    successReceiptPath: plan.receiptPath,
  });
  let behavioralActivation = null;
  const result = executeBootstrapTransaction(transaction, {
    verifyActivation: () => verifyProjectLocalBehavioralRoute({
      targetRoot: plan.targetRoot,
      sourceRoot: kitRoot,
      goal: goalProjection.original_goal,
      transaction,
      sourceInventory,
      allowProjectLocalExecution: true,
    }),
    finalizeActivation: ({ receipt, verification }) => {
      behavioralActivation = resolveBehavioralAdoptionActivation({
        projectBinding: projectIdentity(plan.targetRoot),
        goalDigest: goalProjection.goal_digest,
        applyReceipt: {
          ref: transaction.success_receipt_path,
          digest: receipt.receipt_digest,
          state: receipt.state,
        },
        coldStart: verification.coldStart,
        routeCalibration: verification.routeCalibration,
      });
      const semantic = validateBehavioralActivation(behavioralActivation, {
        projectBinding: behavioralActivation.project_binding,
        goalDigest: goalProjection.goal_digest,
      });
      const schema = loadSchema(kitRoot, "schemas/artifacts/behavioral-adoption-activation.schema.json");
      const structural = validateSchema(behavioralActivation, schema, { label: "behavioral adoption activation" });
      return { ok: semantic.ok && structural.ok, errors: [...semantic.errors, ...structural.errors] };
    },
    verifyCommittedInstallation: () => verifyCommittedBootstrapInstallation(plan.targetRoot),
  });
  if (result.state !== "APPLY_VERIFIED" || behavioralActivation?.activation_state !== "VERIFIED_ACTIVE") {
    throw new Error(`Controlled new-project apply did not verify: ${(result.errors || []).join("; ") || result.state}`);
  }
  return result;
}

function replayAction(plan, action, transaction, journalEntry) {
  const target = assertSafeWritePath(plan.targetRoot, action.path, `action ${action.id} target`);
  assertControlledActionPrecondition(target, action, "before staging");
  let content;
  if (action.source) {
    const source = resolveUnderRoot(kitRoot, action.source, `action ${action.id} source`);
    if (sha256File(source) !== action.sourceHash) throw new Error(`Source digest changed for ${action.id}: ${action.source}`);
    content = fs.readFileSync(source);
  } else if (typeof action.inlineContentBase64 === "string") {
    content = Buffer.from(action.inlineContentBase64, "base64");
    if (sha256Content(content) !== action.sourceHash) throw new Error(`Inline content digest mismatch for ${action.id}`);
  } else {
    throw new Error(`Action ${action.id} has no replayable source`);
  }
  if (!journalEntry?.transaction_temp_path) {
    throw new Error(`Action ${action.id} requires a transaction-owned temporary path`);
  }
  return commitControlledApplyAction(transaction, action.id, content);
}

function assertControlledActionPrecondition(target, action, phase) {
  let stat = null;
  try {
    stat = fs.lstatSync(target);
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
  if (stat) {
    if (!stat.isFile() || stat.isSymbolicLink()) throw new Error(`Action ${action.id} target is not a regular file ${phase}`);
  }
  const observed = stat ? sha256File(target) : null;
  const expected = action.hashBefore || null;
  if (observed !== expected) {
    throw new Error(`Action ${action.id} target precondition changed ${phase}: expected ${expected || "absent"}, observed ${observed || "absent"}`);
  }
}

function fsyncRegularFile(file) {
  const fd = fs.openSync(file, "r");
  try { fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
}

function atomicWriteFile(target, content, transactionTemp = "") {
  const temp = transactionTemp || path.join(path.dirname(target), `.${path.basename(target)}.intentos-${process.pid}-${Date.now()}.tmp`);
  try {
    fs.writeFileSync(temp, content, { flag: "wx" });
    const fd = fs.openSync(temp, "r");
    try { fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
    fs.renameSync(temp, target);
    fsyncDirectoryPath(path.dirname(target));
  } finally {
    if (fs.existsSync(temp)) {
      fs.unlinkSync(temp);
      fsyncDirectoryPath(path.dirname(temp));
    }
  }
}

function rollbackActions(plan, actions, results, transaction) {
  let rollback;
  try {
    rollback = rollbackControlledApply(transaction);
  } catch (error) {
    rollback = { ok: false, errors: [error.message] };
  }
  let verified = rollback.ok;
  for (const action of actions) {
    const hashAfter = sha256File(path.join(plan.targetRoot, action.path));
    const actionVerified = hashAfter === (action.hashBefore || null);
    if (!actionVerified) verified = false;
    results.set(action.id, receiptActionResult(action, actionVerified ? "ROLLED_BACK" : "FAILED", hashAfter));
  }
  return verified;
}

function fsyncDirectoryPath(directory) {
  let fd;
  try {
    fd = fs.openSync(directory, "r");
    fs.fsyncSync(fd);
  } catch {
    // Directory fsync is not supported by every filesystem.
  } finally {
    if (fd !== undefined) fs.closeSync(fd);
  }
}

function verifyInstalledWorkflowActivation(targetRoot, plan, activationEnvironment = {}) {
  const script = path.join(targetRoot, "scripts", "workflow-next.mjs");
  if (!fs.existsSync(script)) return { ...activationNotRun(), status: "FAILED", reason: "installed workflow-next entry is missing" };
  const trustedWorkflowNext = path.join(kitRoot, "scripts", "workflow-next.mjs");
  if (sha256File(script) !== sha256File(trustedWorkflowNext)) {
    return { ...activationNotRun(), status: "FAILED", reason: "installed workflow-next entry does not match the approved IntentOS source" };
  }
  const versionRecord = readJsonIfExists(path.join(targetRoot, ".intentos", "version.json"));
  if (versionRecord?.intentOSVersion !== plan.intentOSVersion) {
    return { ...activationNotRun(), status: "FAILED", reason: "installed IntentOS version does not match the approved plan" };
  }
  const before = snapshotTargetFiles(targetRoot);
  const result = spawnSync(process.execPath, [script, targetRoot, "--json"], {
    cwd: targetRoot,
    env: { ...process.env, ...activationEnvironment },
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 20,
    timeout: 120000,
  });
  let baselineResult = null;
  let industrialResult = null;
  if (plan?.arguments?.baselineLevel && Array.isArray(plan?.arguments?.profiles) && plan.arguments.profiles.length > 0) {
    const baselineScript = path.join(targetRoot, "scripts", "check-baseline-installation.mjs");
    baselineResult = fs.existsSync(baselineScript)
      ? spawnSync(process.execPath, [baselineScript, targetRoot, "--require-selection", "--allow-pending-receipt"], {
        cwd: targetRoot,
        env: { ...process.env, ...activationEnvironment },
        encoding: "utf8",
        maxBuffer: 1024 * 1024 * 20,
        timeout: 60000,
      })
      : { status: 1, stdout: "", stderr: "installed baseline checker is missing" };
  }
  if (plan?.arguments?.baselineLevel === "BL2_INDUSTRIAL") {
    const industrialScript = path.join(targetRoot, "scripts", "check-industrial-baseline.mjs");
    industrialResult = fs.existsSync(industrialScript)
      ? spawnSync(process.execPath, [industrialScript, targetRoot], {
        cwd: targetRoot,
        env: { ...process.env, ...activationEnvironment },
        encoding: "utf8",
        maxBuffer: 1024 * 1024 * 20,
        timeout: 60000,
      })
      : { status: 1, stdout: "", stderr: "installed industrial baseline checker is missing" };
  }
  const after = snapshotTargetFiles(targetRoot);
  let parsed = null;
  try {
    parsed = JSON.parse(result.stdout);
  } catch {
    parsed = null;
  }
  const changed = changedSnapshotPaths(before, after);
  const nextAction = String(parsed?.nextAction || "");
  const projectState = typeof parsed?.projectState === "string"
    ? parsed.projectState
    : String(parsed?.projectState?.state || parsed?.projectStateTags?.[0] || "");
  const baselineOk = !baselineResult || baselineResult.status === 0;
  const industrialOk = !industrialResult || industrialResult.status === 0;
  const ok = result.status === 0 && parsed && isWorkflowActivationState(parsed, plan) && projectState && changed.length === 0 && baselineOk && industrialOk;
  const projectEntryReason = String(parsed?.projectEntryTrust?.project_identity?.reason || "").trim();
  return {
    status: ok ? "VERIFIED" : "FAILED",
    workflow_next_exit_code: String(result.status ?? "N/A"),
    output_digest: sha256Content(String(result.stdout || "")),
    project_state: projectState || "N/A",
    next_action: nextAction || "N/A",
    read_only: changed.length === 0,
    reason: ok ? "" : normalizeOutput(
      baselineResult && baselineResult.status !== 0
        ? baselineResult.stderr || baselineResult.stdout
        : industrialResult && industrialResult.status !== 0
          ? industrialResult.stderr || industrialResult.stdout
        : projectEntryReason || result.stderr || result.stdout || `activation changed: ${changed.join(", ")}`,
    ),
  };
}

function verifyCommittedBootstrapInstallation(targetRoot) {
  const script = assertSafeWritePath(targetRoot, "scripts/check-baseline-installation.mjs", "committed bootstrap baseline checker");
  let stat;
  try {
    stat = fs.lstatSync(script);
  } catch (error) {
    return { ok: false, errors: [`installed baseline checker is missing: ${error.message}`] };
  }
  if (stat.isSymbolicLink() || !stat.isFile()) {
    return { ok: false, errors: ["installed baseline checker is not a non-symlink regular file"] };
  }
  const before = snapshotTargetFiles(targetRoot);
  const result = spawnSync(process.execPath, [script, targetRoot, "--require-selection"], {
    cwd: targetRoot,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 20,
    timeout: 60000,
  });
  const after = snapshotTargetFiles(targetRoot);
  const changed = changedSnapshotPaths(before, after);
  if (result.status !== 0 || changed.length > 0) {
    return {
      ok: false,
      errors: [normalizeOutput(
        changed.length > 0
          ? `committed baseline validation mutated: ${changed.join(", ")}`
          : result.stderr || result.stdout || "committed baseline validation failed",
      )],
    };
  }
  return { ok: true, errors: [] };
}

function activationNotRun() {
  return {
    status: "NOT_RUN",
    workflow_next_exit_code: "N/A",
    output_digest: sha256Content(""),
    project_state: "N/A",
    next_action: "N/A",
    read_only: true,
    reason: "not run",
  };
}

function receiptActionResult(action, result, hashAfter, additionalPaths = []) {
  return {
    id: action.id,
    type: action.type,
    target_paths: actionTargetPaths(action, additionalPaths),
    result,
    hash_before: action.hashBefore || "N/A",
    hash_after: hashAfter || "N/A",
    expected_hash_after: action.expectedHashAfter || (action.dynamicReceipt ? "dynamic" : "N/A"),
    source_hash: action.sourceHash || "N/A",
  };
}

function buildApplyReceipt(plan, context, result) {
  const before = plan.targetFingerprint || {};
  const after = gitFingerprint(plan.targetRoot);
  const impact = controlledApplyImpactFlags(result.actions);
  const receipt = {
    schema_version: "1.113.0",
    artifact_type: "apply_execution_receipt",
    artifact_id: path.basename(plan.receiptPath, ".md"),
    receipt_state: result.receiptState,
    executed_at: new Date().toISOString(),
    project_identity: {
      root_digest: plan.projectIdentity.fingerprint,
      git_repository: Boolean(before.isGitRepository),
      git_branch_before: before.gitBranch || "N/A",
      git_head_before: before.gitHead || "N/A",
      git_head_after: after.gitHead || "N/A",
    },
    execution_plan: {
      path: context.planRelativePath,
      plan_digest: plan.planDigest,
      intentos_version: plan.intentOSVersion,
      manifest_digest: plan.manifestDigest,
      operation_kind: plan.operationKind,
      adoption_assessment_digest: plan.adoptionAssessment?.assessment_digest || "N/A",
    },
    apply_authority: {
      path: context.authorityRelativePath,
      artifact_id: context.authority.evidence.artifact_id,
      authority_mode: context.authorityKind,
      authority_digest: context.authority.evidence.authority_digest
        || evidenceDigest(context.authority.evidence, []),
      expires_at: context.authority.evidence.expires_at,
    },
    readiness_report: {
      path: context.readinessRelativePath,
      artifact_id: context.readiness.evidence.artifact_id,
      evidence_digest: evidenceDigest(context.readiness.evidence, []),
      readiness_state: context.readiness.evidence.readiness_state,
    },
    actions: result.actions,
    unexpected_changed_paths: result.unexpectedChangedPaths,
    activation: {
      status: result.activation.status,
      workflow_next_exit_code: result.activation.workflow_next_exit_code,
      output_digest: result.activation.output_digest,
      project_state: result.activation.project_state,
      next_action: result.activation.next_action,
      read_only: result.activation.read_only,
      cold_start_state: result.activation.cold_start_state || "BLOCKED",
      cold_start_digest: result.activation.cold_start_digest || evidenceDigest("missing-cold-start", []),
      route_state: result.activation.route_state || "BLOCKED",
      route_digest: result.activation.route_digest || evidenceDigest("missing-route", []),
      project_work_queue_unchanged: result.activation.project_work_queue_unchanged || "No",
      synthetic_current_items_created: result.activation.synthetic_current_items_created || "Unknown",
      behavioral_results_digest: result.activation.behavioral_results_digest || evidenceDigest("missing-results", []),
    },
    rollback: {
      required: result.actions.some((action) => action.hash_before !== "N/A" && action.type !== "WRITE_APPLY_RECEIPT"),
      attempted: result.rollbackAttempted,
      verified: result.rollbackVerified,
      backup_paths: plan.actions.map((action) => action.backupPath).filter(Boolean),
    },
    boundary: {
      only_authorized_actions_executed: result.unexpectedChangedPaths.length === 0,
      approves_business_implementation: false,
      approves_release_or_production: false,
      modifies_ci_or_hooks: impact.modifiesCiOrHooks,
      changes_project_authority: impact.changesProjectAuthority,
      proves_product_correctness: false,
    },
    outcome: result.receiptState,
  };
  return receipt;
}

function writeApplyReceipt(plan, receipt, transaction = null, phase = "final") {
  const receiptPath = assertSafeWritePath(plan.targetRoot, plan.receiptPath, "apply receipt");
  const humanResult = receipt.receipt_state === "APPLY_VERIFIED"
    ? "The exact authorized IntentOS governance plan was applied and the full project-local working route was verified."
    : "The controlled apply did not complete as verified; review rollback and blocker evidence.";
  const content = [
    `# Apply Execution Receipt: ${receipt.artifact_id}`,
    "",
    "## Human Summary",
    "",
    `Result: \`${receipt.receipt_state}\``,
    "",
    humanResult,
    "",
    `Changed action count: ${receipt.actions.filter((item) => item.result === "APPLIED").length}`,
    "",
    `Unexpected changed paths: ${receipt.unexpected_changed_paths.length === 0 ? "none" : receipt.unexpected_changed_paths.join(", ")}`,
    "",
    "## Machine-Readable Evidence",
    "",
    "```json",
    JSON.stringify(receipt, null, 2),
    "```",
    "",
    "## Boundary",
    "",
    "- This receipt approves business implementation: No",
    "- This receipt approves release or production: No",
    `- This receipt records CI or hook file changes: ${receipt.boundary.modifies_ci_or_hooks ? "Yes" : "No"}`,
    `- This receipt records project authority file changes: ${receipt.boundary.changes_project_authority ? "Yes" : "No"}`,
    "- This receipt proves product correctness: No",
    "",
  ].join("\n");
  if (transaction) writeControlledApplyReceipt(transaction, content, phase);
  else {
    fs.mkdirSync(path.dirname(receiptPath), { recursive: true });
    atomicWriteFile(receiptPath, content);
  }
}


export {
  createAutomaticRequestBoundApplyContext,
  deriveControlledApplyRecoveryBinding,
  replayApprovedNewProjectPlan,
  replayApprovedPlan,
  transactionSupportActionIds,
  validatePlanForApply,
  verifyCommittedBootstrapInstallation
};
