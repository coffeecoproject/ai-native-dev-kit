
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createHash, randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { manifestCopyRules, manifestGroup, workflowVersionAssets } from "../lib/manifest.mjs";
import {
  resolveLegacyAgentReconciliation,
  resolveLegacyManagedAssetOwnership,
} from "../lib/legacy-intentos-installation.mjs";
import { evidenceDigest, extractMachineReadableEvidence, loadSchema, validateSchema } from "../lib/artifact-schema.mjs";
import {
  controlledUpdateDirtyWriteOverlap,
  controlledApplyImpactFlags,
  formatActionId,
  initExecutableActions,
  inspectControlledDirtyActivation,
  validateVerifiedApplyReceiptFile,
  validateApprovalRecordForInitApplyPlan,
  validateReadinessForInitApplyPlan,
  validateReadinessPlanReview,
} from "../lib/adoption-apply-chain.mjs";
import {
  controlledApplyProtocolArtifactRoots,
  isControlledApplyProtocolArtifactPath,
  isGovernedWorkflowOutputPath,
  projectIdentity,
} from "../lib/evidence-authority.mjs";
import { createGuidanceFileView } from "../lib/review-context-authority.mjs";
import {
  createBootstrapTransaction,
  executeBootstrapTransaction,
  recoverInterruptedBootstrap,
  verifiedBootstrapManagedOwnership,
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
  createInitialTaskIntakeState,
  resolveBehavioralAdoptionActivation,
  resolveVerifiedInitialTaskIntakeProof,
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
import {
  evaluateGuidanceAuthority,
  resolveProjectEntryTrust,
  requireTrustedProjectEntry,
} from "../lib/project-entry-trust.mjs";
import {
  projectAssetLifecycle,
  projectAssetLifecycles,
  projectOwnedPreservationAction,
} from "../lib/project-asset-lifecycle.mjs";
import { createSelectedProfilesReconciliationAction } from "../lib/project-profile-reconciliation.mjs";
import {
  assessExistingProjectGovernanceBacklog,
  resolveExistingProjectAdoptionCheckpoint,
} from "../lib/existing-project-adoption-coordinator.mjs";
import { projectGoalProjection } from "../lib/project-fact-projection.mjs";
import { inspectTargetTopology } from "../lib/target-topology.mjs";
import {
  nativeAdoptionActionCapability,
  nativeAdoptionOperationalPolicy,
  normalizeNativeAdoptionMigrationDepth,
  resolveNativeAdoptionStage,
  selectedNativeOverlayAssets,
} from "../lib/native-adoption-overlay.mjs";
import { runStructuredJsonChildSync } from "../lib/structured-child-process.mjs";
import {
  createSameRunEvidenceEnvelope,
  encodeSameRunEnvelopeBundle,
} from "../lib/same-run-evidence-envelope.mjs";
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
  assertSafeNameSegment,
  assertSafeRelativePath,
  assertSafeWritePath,
  resolveBackupRoot,
  resolveUnderRoot,
} from "../lib/path-safety.mjs";

import {
  agentGovernanceAppendix,
  selectedAgentGovernanceAppendix,
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
  nativeAdoptionProfileConfigurationForPlan,
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

function planRunId(createdAt) {
  return createdAt.replace(/[^0-9A-Za-z]+/g, "-").replace(/^-|-$/g, "").toLowerCase();
}

function controlledBackupRunRoot(value, label = "backupDir") {
  const relative = assertSafeRelativePath(String(value || ""), label);
  const parts = relative.split("/");
  if (parts.length !== 3
    || parts[0] !== ".intentos"
    || parts[1] !== "backups"
    || !/^[a-z0-9][a-z0-9._-]*$/i.test(parts[2])) {
    throw new Error(`${label} must use the fixed .intentos/backups/<run> transaction namespace`);
  }
  return relative;
}

function selectedWorkflowAssetsFromBoundActions(actions, operation) {
  return actions
    .filter((action) => action.path
      && !action.dynamicReceipt
      && action.executionSupported === true
      && (action.willWrite || action.type === "SKIP_EXISTING")
      && !isForbiddenControlledApplyAction(action, operation))
    .map((action) => action.path);
}

function enrichExecutionActions(actions, targetPath, options, createdAt, receiptPath, operation) {
  const backupRoot = controlledBackupRunRoot(
    options.backupDir || `.intentos/backups/${planRunId(createdAt)}`,
    "plan backup run root",
  );
  const versionAction = actions.find((action) => action.path === ".intentos/version.json");
  for (const action of actions) {
    action.executionSupported = true;
    if (!action.willWrite) {
      action.sourceHash = action.source ? sha256File(path.join(kitRoot, action.source)) : null;
      action.expectedHashAfter = action.hashBefore;
      if (options.update
        && action.type === "SKIP_EXISTING"
        && action.source
        && action.assetLifecycle === projectAssetLifecycles.INTENTOS_MANAGED_REFRESH
        && action.sourceHash !== action.hashBefore) {
        throw new Error(`Controlled update cannot skip source drift for ${action.path}`);
      }
      continue;
    }
    if (action === versionAction) continue;
    if (action.source) {
      const sourcePath = resolveUnderRoot(kitRoot, action.source, "plan action source");
      action.sourceHash = sha256File(sourcePath);
      action.expectedHashAfter = action.sourceHash;
    } else if (typeof action.inlineContentBase64 === "string") {
      const content = Buffer.from(action.inlineContentBase64, "base64");
      action.sourceHash = sha256Content(content);
      action.expectedHashAfter = action.sourceHash;
    } else if (action.path.endsWith("/.gitkeep")) {
      action.inlineContentBase64 = Buffer.from("").toString("base64");
      action.sourceHash = sha256Content("");
      action.expectedHashAfter = action.sourceHash;
    } else {
      action.executionSupported = false;
      action.sourceHash = null;
      action.expectedHashAfter = null;
    }
    if (action.hashBefore) {
      action.backupPath = assertSafeRelativePath(`${backupRoot}/${action.path}`, "plan action backup path");
    }
  }
  boundControlledAdoptionActions(actions, operation);
  if (versionAction?.willWrite) {
    const workflowAssetsOverride = options.assetMigrationDepth === "SELECTED_ASSETS"
      ? selectedWorkflowAssetsFromBoundActions(actions, operation)
      : options.workflowAssetsOverride;
    const record = buildVersionRecord(targetPath, options.starter, {
      update: options.update,
      baselineConfig: options.baselineConfig,
      projectEntryOrigin: options.projectEntryOrigin,
      assetMigrationDepth: options.assetMigrationDepth,
      initialTaskIntake: options.initialTaskIntake,
      workflowAssetsOverride,
      actions,
    }, createdAt);
    const content = `${JSON.stringify(record, null, 2)}\n`;
    versionAction.inlineContentBase64 = Buffer.from(content).toString("base64");
    versionAction.sourceHash = sha256Content(content);
    versionAction.expectedHashAfter = versionAction.sourceHash;
    if (versionAction.hashBefore) {
      versionAction.backupPath = assertSafeRelativePath(`${backupRoot}/${versionAction.path}`, "plan action backup path");
    }
  }
  actions.push({
    type: "WRITE_APPLY_RECEIPT",
    path: receiptPath,
    source: null,
    reason: "runtime apply and activation evidence",
    willWrite: true,
    hashBefore: sha256File(path.join(targetPath, receiptPath)),
    sourceHash: null,
    expectedHashAfter: null,
    executionSupported: true,
    dynamicReceipt: true,
  });
}

function boundControlledAdoptionActions(actions, operation) {
  for (const action of actions) {
    if (!action.willWrite) {
      if (action.type === "NEEDS_HUMAN_APPROVAL") {
        action.originalType = action.type;
        action.type = "HUMAN_ONLY";
        action.executionSupported = false;
        action.reason = `${action.reason}; excluded from the bounded 1.92 controlled apply graph`;
      }
      continue;
    }
    if (action.type === "WRITE_APPLY_RECEIPT") continue;
    if (action.executionSupported === true && !isForbiddenControlledApplyAction(action, operation)) continue;
    action.originalType = action.type;
    action.type = "HUMAN_ONLY";
    action.willWrite = false;
    action.executionSupported = false;
    action.reason = `${action.reason}; excluded from the bounded 1.92 controlled apply graph`;
    action.backupPath = null;
  }
}

function planDigest(plan) {
  const normalized = JSON.stringify(sortForStableJson(omitPlanDigest(plan)));
  return `sha256:${createHash("sha256").update(normalized).digest("hex")}`;
}

function buildCandidateStaticActivationPreflight(plan) {
  const selectedExistingProject = plan.arguments?.projectEntryOrigin === "EXISTING_PROJECT"
    && plan.arguments?.migrationDepth === "SELECTED_ASSETS";
  if (plan.executionState !== "EXECUTABLE" || !selectedExistingProject) {
    const base = {
      schema_version: "1.113.0",
      state: "NOT_APPLICABLE",
      reason: plan.executionState !== "EXECUTABLE"
        ? "The plan has no executable candidate write graph."
        : "Candidate activation preflight is scoped to selected-assets existing-project adoption and update.",
      action_graph_digest: evidenceDigest([], []),
      guidance: { state: "NOT_EVALUATED", guidance_digest: "N/A", graph_digest: "N/A" },
      runtime_identity: { state: "NOT_EVALUATED" },
      operational_policy: { state: "NOT_EVALUATED" },
      dirty_activation: { state: "NOT_EVALUATED" },
      invalid_nodes: [],
      cycles: [],
      boundaries: {
        reads_candidate_view_only: "Yes",
        writes_target_files: "No",
        authorizes_apply: "No",
      },
    };
    return { ...base, preflight_digest: evidenceDigest(base, []) };
  }
  const candidateActions = bootstrapActionsFromPlan(plan);
  const contentOverrides = new Map(candidateActions.map((action) => [action.path, action.content]));
  const candidateView = createGuidanceFileView(plan.targetRoot, contentOverrides);
  const actionById = new Map(plan.actions.map((action) => [action.id, action]));
  const actionGraph = candidateActions.map((action) => ({
    id: action.id,
    path: action.path,
    expected_hash_after: actionById.get(action.id)?.expectedHashAfter || "N/A",
  }));
  let guidance;
  try {
    guidance = evaluateGuidanceAuthority({
      authorityRoot: plan.targetRoot,
      installed: true,
      contentOverrides,
      requireAgentAuthority: true,
    });
  } catch (error) {
    guidance = {
      state: "INVALID",
      guidance_digest: "N/A",
      graph_digest: "N/A",
      invalid_nodes: [],
      cycles: [],
      reason: error.message,
    };
  }
  let candidateVersion = null;
  try {
    candidateVersion = JSON.parse(contentOverrides.get(".intentos/version.json")?.toString("utf8") || "");
  } catch {
    candidateVersion = null;
  }
  const workflowNextAction = plan.actions.find((action) => action.path === "scripts/workflow-next.mjs");
  const workflowNextContent = candidateView.exists("scripts/workflow-next.mjs")
    ? candidateView.readBuffer("scripts/workflow-next.mjs")
    : null;
  const workflowNextDigest = workflowNextContent ? sha256Content(workflowNextContent) : null;
  const runtimeErrors = [];
  if (!candidateVersion) runtimeErrors.push("CANDIDATE_VERSION_RECORD_INVALID");
  if (candidateVersion?.intentOSVersion !== plan.intentOSVersion) runtimeErrors.push("CANDIDATE_VERSION_MISMATCH");
  if (!(candidateVersion?.workflowAssets || []).includes("scripts/workflow-next.mjs")) {
    runtimeErrors.push("WORKFLOW_NEXT_NOT_DECLARED");
  }
  if (!workflowNextAction || !workflowNextContent || workflowNextDigest !== workflowNextAction.expectedHashAfter) {
    runtimeErrors.push("WORKFLOW_NEXT_CANDIDATE_NOT_BOUND");
  }
  if (candidateVersion?.managedAssetDigests?.["scripts/workflow-next.mjs"] !== workflowNextDigest) {
    runtimeErrors.push("WORKFLOW_NEXT_MANAGED_DIGEST_MISMATCH");
  }
  const runtimeIdentity = {
    state: runtimeErrors.length === 0 ? "READY" : "BLOCKED",
    intentos_version: candidateVersion?.intentOSVersion || "N/A",
    workflow_next_digest: workflowNextDigest || "N/A",
    errors: runtimeErrors,
  };
  const operational = candidateVersion ? nativeAdoptionOperationalPolicy(candidateVersion) : null;
  const operationalPolicy = {
    state: operational?.valid === true ? "READY" : "BLOCKED",
    profile: operational?.profile || "INVALID",
    missing_required_assets: operational?.missingRequiredAssets || [],
  };
  const dirtyEligibility = plan.targetFingerprint?.isGitRepository === true
    && plan.targetFingerprint?.isDirty === true
    ? inspectControlledDirtyActivation(plan)
    : null;
  const dirtyActivation = dirtyEligibility
    ? {
      state: dirtyEligibility.ok ? "READY" : "BLOCKED",
      mode: dirtyEligibility.mode,
      code: dirtyEligibility.code,
      overlap_paths: dirtyEligibility.overlapPaths,
    }
    : {
      state: "NOT_APPLICABLE",
      mode: "CLEAN_OR_NON_GIT_TARGET",
      code: "NOT_REQUIRED",
      overlap_paths: [],
    };
  const componentFailures = [
    guidance.state === "CURRENT" ? null : "GUIDANCE_AUTHORITY_INVALID",
    runtimeIdentity.state === "READY" ? null : "RUNTIME_IDENTITY_INVALID",
    operationalPolicy.state === "READY" ? null : "OPERATIONAL_POLICY_INVALID",
    dirtyActivation.state === "BLOCKED" ? "DIRTY_ACTIVATION_INVALID" : null,
  ].filter(Boolean);
  const base = {
    schema_version: "1.113.0",
    state: componentFailures.length === 0 ? "READY" : "BLOCKED",
    reason: componentFailures.length === 0
      ? "The exact selected-assets candidate passes all predictable static activation checks."
      : componentFailures.join("; "),
    action_graph_digest: evidenceDigest(actionGraph, []),
    guidance: {
      state: guidance.state,
      guidance_digest: guidance.guidance_digest || "N/A",
      graph_digest: guidance.graph_digest || "N/A",
    },
    runtime_identity: runtimeIdentity,
    operational_policy: operationalPolicy,
    dirty_activation: dirtyActivation,
    invalid_nodes: guidance.invalid_nodes || [],
    cycles: guidance.cycles || [],
    boundaries: {
      reads_candidate_view_only: "Yes",
      writes_target_files: "No",
      authorizes_apply: "No",
    },
  };
  return { ...base, preflight_digest: evidenceDigest(base, []) };
}

function omitPlanDigest(value) {
  if (Array.isArray(value)) return value.map(omitPlanDigest);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value)
    .filter(([key]) => key !== "planDigest")
    .map(([key, child]) => [key, omitPlanDigest(child)]));
}

function sortForStableJson(value) {
  if (Array.isArray(value)) return value.map(sortForStableJson);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.keys(value)
    .sort()
    .map((key) => [key, sortForStableJson(value[key])]));
}

function walkSourceFiles(sourceRoot) {
  if (!fs.existsSync(sourceRoot)) return [];
  const results = [];
  for (const entry of fs.readdirSync(sourceRoot, { withFileTypes: true })) {
    if (isIgnorableNewProjectEntry(entry.name)) continue;
    const full = path.join(sourceRoot, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkSourceFiles(full));
    } else if (entry.isFile()) {
      results.push(full);
    }
  }
  return results.sort();
}

function gitFingerprint(targetPath) {
  const gitCheck = spawnSync("git", ["-C", targetPath, "rev-parse", "--is-inside-work-tree"], { encoding: "utf8" });
  if (gitCheck.status !== 0 || gitCheck.stdout.trim() !== "true") {
    return {
      isGitRepository: false,
      gitBranch: null,
      gitHead: null,
      isDirty: false,
      changedFileCount: 0,
      changedFilesSample: [],
    };
  }
  const branch = spawnSync("git", ["-C", targetPath, "branch", "--show-current"], { encoding: "utf8" });
  const head = spawnSync("git", ["-C", targetPath, "rev-parse", "HEAD"], { encoding: "utf8" });
  const protocolPathspecs = controlledApplyProtocolArtifactRoots.flatMap((root) => [
    `:(exclude)${root}`,
    `:(exclude)${root}/**`,
  ]);
  const status = spawnSync("git", [
    "-C", targetPath, "status", "--short", "--untracked-files=all", "--", ".",
    ...protocolPathspecs,
  ], { encoding: "utf8" });
  const changedFiles = status.stdout.split("\n").map((line) => line.trim()).filter(Boolean);
  return {
    isGitRepository: true,
    gitBranch: branch.status === 0 ? branch.stdout.trim() || null : null,
    gitHead: head.status === 0 ? head.stdout.trim() || null : null,
    isDirty: changedFiles.length > 0,
    changedFileCount: changedFiles.length,
    changedFilesSample: changedFiles.slice(0, 20),
    changedFiles,
  };
}

function addFilePlanAction(actions, targetPath, sourcePath, targetRel, options = {}) {
  const safeTargetRel = assertSafeRelativePath(targetRel, "plan action target path");
  const destPath = assertSafeWritePath(targetPath, safeTargetRel, "plan action target path");
  const existed = fs.existsSync(destPath);
  const overwrite = Boolean(options.overwrite);
  const sourceRel = assertSafeRelativePath(path.relative(kitRoot, sourcePath).replaceAll(path.sep, "/"), "plan action source path");
  const currentHash = sha256File(destPath);
  const sourceHash = sha256File(sourcePath);
  const assetLifecycle = projectAssetLifecycle(safeTargetRel);
  const ownership = existed ? priorManagedAssetOwnership(targetPath, safeTargetRel, currentHash) : { state: "NEW_TARGET" };
  let type;
  if (!existed) type = "CREATE";
  else if (currentHash === sourceHash) type = "SKIP_EXISTING";
  else if (assetLifecycle === projectAssetLifecycles.PROJECT_OWNED_AFTER_BOOTSTRAP) type = projectOwnedPreservationAction;
  else if (options.allowLegacyManagedUpdate
    && ownership.state === "VERIFIED_LEGACY_INTENTOS_MANAGED") {
    type = options.backupDir ? "BACKUP_THEN_UPDATE" : "UPDATE_MANAGED";
  }
  else if (!overwrite) type = "SKIP_EXISTING";
  else if (ownership.state === "VERIFIED_PRIOR_INTENTOS_MANAGED") type = options.backupDir ? "BACKUP_THEN_UPDATE" : "UPDATE_MANAGED";
  else type = "PRESERVE_UNMANAGED";
  actions.push({
    type,
    path: safeTargetRel,
    source: sourceRel,
    reason: options.reason || "managed workflow asset",
    willWrite: ["CREATE", "BACKUP_THEN_UPDATE", "UPDATE_MANAGED"].includes(type),
    hashBefore: currentHash,
    ownership,
    assetLifecycle,
  });
}

function addGeneratedFilePlanAction(actions, targetPath, targetRel, content, options = {}) {
  const safeTargetRel = assertSafeRelativePath(targetRel, "generated plan action target path");
  const destPath = assertSafeWritePath(targetPath, safeTargetRel, "generated plan action target path");
  const existed = fs.existsSync(destPath);
  const currentHash = sha256File(destPath);
  const nextHash = sha256Content(content);
  const assetLifecycle = projectAssetLifecycle(safeTargetRel);
  const ownership = existed ? priorManagedAssetOwnership(targetPath, safeTargetRel, currentHash) : { state: "NEW_TARGET" };
  let type;
  if (!existed) type = "CREATE";
  else if (currentHash === nextHash) type = "SKIP_EXISTING";
  else if (options.controlledReconciliation) type = options.backupDir ? "BACKUP_THEN_RECONCILE" : "RECONCILE_PRESERVE";
  else if (assetLifecycle === projectAssetLifecycles.PROJECT_OWNED_AFTER_BOOTSTRAP) type = projectOwnedPreservationAction;
  else if (!options.overwrite) type = "SKIP_EXISTING";
  else if (ownership.state === "VERIFIED_PRIOR_INTENTOS_MANAGED") type = options.backupDir ? "BACKUP_THEN_UPDATE" : "UPDATE_MANAGED";
  else type = "PRESERVE_UNMANAGED";
  actions.push({
    type,
    path: safeTargetRel,
    source: null,
    reason: options.reason || "plan-bound generated project record",
    willWrite: ["CREATE", "BACKUP_THEN_UPDATE", "UPDATE_MANAGED", "BACKUP_THEN_RECONCILE", "RECONCILE_PRESERVE"].includes(type),
    hashBefore: currentHash,
    inlineContentBase64: Buffer.from(content).toString("base64"),
    ownership,
    assetLifecycle,
  });
}

function priorManagedAssetOwnership(targetPath, targetRel, currentHash) {
  const versionPath = path.join(targetPath, ".intentos", "version.json");
  if (!currentHash) return { state: "UNPROVEN_PROJECT_OWNED" };
  if (fs.existsSync(versionPath)) {
    let stat;
    try { stat = fs.lstatSync(versionPath); } catch { stat = null; }
    if (stat?.isFile() && !stat.isSymbolicLink()) {
      let version;
      try { version = JSON.parse(fs.readFileSync(versionPath, "utf8")); } catch { version = null; }
      if (version) {
        if (targetRel === ".intentos/version.json"
          && /^\d+\.\d+\.\d+/.test(String(version.intentOSVersion || ""))
          && Array.isArray(version.workflowAssets)
          && version.workflowAssets.length > 0
          && sha256File(versionPath) === currentHash) {
          return { state: "VERIFIED_PRIOR_INTENTOS_MANAGED", evidence_ref: ".intentos/version.json", managed_digest: currentHash };
        }
        const managedDigest = version.managedAssetDigests?.[targetRel];
        const declared = (version.workflowAssets || []).some((value) => {
          const managed = String(value || "").replaceAll("\\", "/").replace(/^\.\//, "").replace(/\/$/, "");
          return managed && (targetRel === managed || targetRel.startsWith(`${managed}/`));
        });
        if (managedDigest === currentHash && declared) {
          return { state: "VERIFIED_PRIOR_INTENTOS_MANAGED", evidence_ref: ".intentos/version.json", managed_digest: currentHash };
        }
      }
    }
  }
  const bootstrapOwnership = verifiedBootstrapManagedOwnership(targetPath, targetRel, currentHash);
  if (bootstrapOwnership) return bootstrapOwnership;
  return resolveLegacyManagedAssetOwnership(targetPath, kitRoot, targetRel, currentHash);
}

function addDirectoryPlanActions(actions, targetPath, sourceDir, targetRel, options = {}) {
  for (const sourceFile of walkSourceFiles(sourceDir)) {
    const nestedRel = path.relative(sourceDir, sourceFile).replaceAll(path.sep, "/");
    const targetFile = targetRel === "." || targetRel === "" ? nestedRel : `${targetRel}/${nestedRel}`;
    addFilePlanAction(actions, targetPath, sourceFile, targetFile, options);
  }
}

function addWorkflowDirPlanActions(actions, targetPath) {
  const dirs = manifestGroup(kitRoot, "workflowDirs", { fallback: [] });
  for (const dir of dirs) {
    const keepRel = `${dir}/.gitkeep`;
    const keepPath = path.join(targetPath, keepRel);
    actions.push({
      type: fs.existsSync(keepPath) ? "SKIP_EXISTING" : "CREATE",
      path: keepRel,
      source: null,
      reason: "workflow directory marker",
      willWrite: !fs.existsSync(keepPath),
      hashBefore: sha256File(keepPath),
    });
  }
}

function addOnboardingDocPlanActions(actions, targetPath) {
  for (const docName of [
    "project-onboarding.md",
    "project-profile.md",
    "tech-stack-strategy.md",
    "business-spec-index.md",
    "sample-policy.md",
    "onboarding-decisions.md",
    "verification-matrix.md",
    "engineering-baseline.md",
    "environment-baseline.md",
  ]) {
    addFilePlanAction(actions, targetPath, path.join(kitRoot, "templates", docName), `docs/${docName}`, {
      overwrite: false,
      reason: "project onboarding document",
    });
  }
}

function addBaselineConfigurationPlanActions(actions, targetPath, config, options = {}) {
  if (!config) return;
  const projectName = path.basename(targetPath) || "project";
  const reconciliationRequired = options.projectEntryOrigin !== "NEW_PROJECT"
    && config.reconciliation?.required === true;
  const generated = [
    ["docs/project-profile.md", renderProjectProfile(config, { projectName }), false],
    ["docs/baseline-selection.md", renderBaselineSelection(config), reconciliationRequired],
    ["docs/baseline-evidence.md", renderBaselineEvidence(config), false],
    ["docs/environment-baseline.md", renderEnvironmentBaseline(config, {
      projectName,
      starter: options.starter,
    }), false],
  ];
  if (reconciliationRequired) {
    generated.push([
      "baseline-gap-reports/intentos-baseline-reconciliation.md",
      renderBaselineReconciliation(config),
      true,
    ]);
  }
  for (const [targetRel, content, controlledReconciliation] of generated) {
    addGeneratedFilePlanAction(actions, targetPath, targetRel, content, {
      overwrite: false,
      backupDir: options.backupDir,
      controlledReconciliation,
      reason: controlledReconciliation
        ? "Codex-derived technical baseline reconciliation; preserves project platform facts and requires exact controlled apply replay"
        : "selected baseline configuration bound to controlled init plan",
    });
  }
}

function addSelectedBaselineAssetPlanActions(actions, targetPath, config, options = {}) {
  const overwrite = Boolean(options.update);
  for (const profileId of config.profiles || []) {
    addDirectoryPlanActions(
      actions,
      targetPath,
      path.join(kitRoot, "profiles", profileId),
      `.intentos/profiles/${profileId}`,
      { overwrite, backupDir: options.backupDir, reason: `selected profile baseline: ${profileId}` },
    );
  }

  const standardIndex = readJsonIfExists(path.join(kitRoot, "standard-baseline-packs", "index.json"));
  const standardById = new Map((standardIndex?.packs || []).map((entry) => [entry.id, entry]));
  for (const packId of config.standardPacks || []) {
    const entry = standardById.get(packId);
    if (!entry?.path) throw new Error(`Selected standard pack has no distributable path: ${packId}`);
    addDirectoryPlanActions(
      actions,
      targetPath,
      path.join(kitRoot, "standard-baseline-packs", entry.path),
      `.intentos/standard-baseline-packs/${entry.path}`,
      { overwrite, backupDir: options.backupDir, reason: `selected standard baseline pack: ${packId}` },
    );
  }

  if ((config.standardPacks || []).length > 0) {
    for (const relative of ["README.md", "selection-guide.md", "index.json"]) {
      addFilePlanAction(
        actions,
        targetPath,
        path.join(kitRoot, "standard-baseline-packs", relative),
        `.intentos/standard-baseline-packs/${relative}`,
        { overwrite, backupDir: options.backupDir, reason: "selected standard baseline registry" },
      );
    }
    addDirectoryPlanActions(
      actions,
      targetPath,
      path.join(kitRoot, "standard-baseline-packs", "schema"),
      ".intentos/standard-baseline-packs/schema",
      { overwrite, backupDir: options.backupDir, reason: "selected standard baseline schema" },
    );
  }
}

function renderBaselineReconciliation(config) {
  const reconciliation = config.reconciliation;
  return [
    "# IntentOS Baseline Reconciliation",
    "",
    "## Conclusion",
    "",
    `Codex derived a monotonic technical baseline change: ${reconciliation.levelChange}.`,
    "",
    "This record does not change business facts, production state, external accounts, secrets, or release authority.",
    "",
    "## Current Selection",
    "",
    "```json",
    JSON.stringify(reconciliation.current, null, 2),
    "```",
    "",
    "## Target Selection",
    "",
    "```json",
    JSON.stringify(reconciliation.target, null, 2),
    "```",
    "",
    "## Controlled Apply Boundary",
    "",
    "- Technical decision owner: Codex",
    "- User technical choice required: No",
    "- Existing profiles removed: No",
    "- Existing selected packs removed: No",
    "- Backup and rollback required before replacing the canonical technical selection: Yes",
    "- Existing project environment facts are overwritten: No",
    "- Production, paid service, real-user communication, provider-account, or irreversible real-data effect authorized: No",
    "",
  ].join("\n");
}

function addIndustrialPlanActions(actions, targetPath, options = {}) {
  const sourceRoot = path.join(kitRoot, "industrial-packs");
  const addRegistry = (source, target) => addFilePlanAction(actions, targetPath, path.join(sourceRoot, source), `.intentos/industrial-packs/${target}`, {
    overwrite: options.update,
    backupDir: options.backupDir,
    reason: "industrial pack registry asset",
  });
  addRegistry("README.md", "README.md");
  addRegistry("selection-guide.md", "selection-guide.md");
  addRegistry("index.json", "index.json");
  addDirectoryPlanActions(actions, targetPath, path.join(sourceRoot, "schema"), ".intentos/industrial-packs/schema", {
    overwrite: options.update,
    backupDir: options.backupDir,
    reason: "industrial pack schema asset",
  });
  if (options.withIndustrialPacks) {
    addDirectoryPlanActions(actions, targetPath, sourceRoot, ".intentos/industrial-packs", {
      overwrite: options.update,
      backupDir: options.backupDir,
      reason: "explicit full industrial pack install",
    });
    return;
  }
  const sourceIndex = readJsonIfExists(path.join(sourceRoot, "index.json"));
  const explicitPacks = parseIndustrialPackIds(options.industrialPacks);
  const selectedPacks = options.update ? selectedIndustrialPackIdsFromProject(targetPath) : [];
  const installedPacks = options.update ? installedIndustrialPackIds(targetPath, sourceIndex) : [];
  const packIds = [...new Set([...explicitPacks, ...selectedPacks, ...installedPacks])].sort();
  const entriesById = new Map((sourceIndex?.packs || []).map((entry) => [entry.id, entry]));
  for (const packId of packIds) {
    const entry = entriesById.get(packId);
    if (!entry || entry.status === "planned" || !entry.path) {
      actions.push({
        type: "FORBIDDEN",
        path: `.intentos/industrial-packs/${packId}`,
        source: null,
        reason: `industrial pack is not executable: ${packId}`,
        willWrite: false,
        hashBefore: null,
      });
      continue;
    }
    addDirectoryPlanActions(actions, targetPath, path.join(sourceRoot, entry.path), `.intentos/industrial-packs/${entry.path}`, {
      overwrite: options.update,
      backupDir: options.backupDir,
      reason: `selected industrial pack: ${packId}`,
    });
  }
}

function addGovernancePlanActions(actions, targetPath, starter, options = {}) {
  const agentEntry = preferredAgentEntry(targetPath);
  if (agentEntry !== "AGENTS.md") {
    for (let index = actions.length - 1; index >= 0; index -= 1) {
      if (actions[index]?.path === "AGENTS.md") actions.splice(index, 1);
    }
  }
  const agentsPath = path.join(targetPath, agentEntry);
  if (!fs.existsSync(agentsPath)) {
    if (options.selectedNativeOverlay) {
      const content = `${selectedAgentGovernanceAppendix().trim()}\n`;
      actions.push({
        type: "CREATE",
        path: "AGENTS.md",
        source: null,
        inlineContentBase64: Buffer.from(content).toString("base64"),
        reason: "selected native overlay AGENTS.md governance entry",
        willWrite: true,
        hashBefore: null,
      });
    } else {
      const starterAgent = path.join(kitRoot, "starters", starter, "AGENTS.md");
      const agentSource = !options.update && fs.existsSync(starterAgent)
        ? starterAgent
        : path.join(kitRoot, "platforms", "codex", "AGENTS.template.md");
      addFilePlanAction(actions, targetPath, agentSource, "AGENTS.md", {
        overwrite: false,
        reason: !options.update && agentSource === starterAgent
          ? "starter-owned AGENTS.md governance entry"
          : "missing AGENTS.md governance file",
      });
    }
  } else {
    const content = fs.readFileSync(agentsPath, "utf8");
    const missingMarkers = requiredAgentGovernanceMarkers.filter((marker) => !content.includes(marker));
    const legacyReconciliation = options.selectedNativeOverlay && agentEntry === "AGENTS.md"
      ? resolveLegacyAgentReconciliation(targetPath, kitRoot)
      : { state: "NOT_APPLICABLE" };
    if (legacyReconciliation.state === "BLOCKED") {
      throw new Error(`Legacy AGENTS.md reconciliation blocked: ${legacyReconciliation.errors.join("; ")}`);
    }
    if (["VERIFIED_LEGACY_AGENT_SUFFIX", "VERIFIED_LEGACY_GENERATED_AGENT"].includes(legacyReconciliation.state)) {
      const replacesGeneratedAgent = legacyReconciliation.state === "VERIFIED_LEGACY_GENERATED_AGENT";
      const merged = `${replacesGeneratedAgent ? "" : legacyReconciliation.projectPrefix}${selectedAgentGovernanceAppendix().trim()}\n`;
      const preservation = replacesGeneratedAgent
        ? {
            mode: "REPLACE_VERIFIED_LEGACY_GENERATED_AGENT",
            sourcePath: "AGENTS.md",
            sourceDigest: legacyReconciliation.sourceDigest,
            sourceBytes: legacyReconciliation.sourceBytes,
            generatedAgentSourcePath: legacyReconciliation.generatedAgentSourcePath,
            generatedAgentDigest: legacyReconciliation.generatedAgentDigest,
            generatedAgentBytes: legacyReconciliation.generatedAgentBytes,
            legacyVersion: legacyReconciliation.legacyVersion,
            sourceRevision: legacyReconciliation.sourceRevision,
            installationDigest: legacyReconciliation.installationDigest,
            reconciliationDigest: legacyReconciliation.reconciliationDigest,
          }
        : {
            mode: "EXACT_PREFIX_REPLACE_VERIFIED_LEGACY_SUFFIX",
            sourcePath: "AGENTS.md",
            sourceDigest: legacyReconciliation.sourceDigest,
            sourceBytes: legacyReconciliation.sourceBytes,
            projectPrefixDigest: legacyReconciliation.projectPrefixDigest,
            projectPrefixBytes: legacyReconciliation.projectPrefixBytes,
            legacySuffixDigest: legacyReconciliation.legacySuffixDigest,
            legacySuffixBytes: legacyReconciliation.legacySuffixBytes,
            legacyVersion: legacyReconciliation.legacyVersion,
            sourceRevision: legacyReconciliation.sourceRevision,
            installationDigest: legacyReconciliation.installationDigest,
            migrationReportDigest: legacyReconciliation.migrationReportDigest,
            reconciliationDigest: legacyReconciliation.reconciliationDigest,
          };
      actions.push({
        type: options.backupDir ? "BACKUP_THEN_RECONCILE" : "RECONCILE_PRESERVE",
        path: "AGENTS.md",
        source: null,
        inlineContentBase64: Buffer.from(merged).toString("base64"),
        preservation,
        reason: replacesGeneratedAgent
          ? "replace the exact verified legacy generated AGENTS.md with selected native governance"
          : "replace only the verified legacy IntentOS AGENTS.md suffix while preserving the exact project prefix",
        willWrite: true,
        hashBefore: legacyReconciliation.sourceDigest,
      });
    } else if (missingMarkers.length === 0) {
      actions.push({ type: "SKIP_EXISTING", path: agentEntry, source: null, reason: `${agentEntry} already has required governance markers`, willWrite: false, hashBefore: sha256File(agentsPath) });
    } else if (options.applyAgentGovernance) {
      const appendix = options.selectedNativeOverlay
        ? selectedAgentGovernanceAppendix(missingMarkers)
        : agentGovernanceAppendix(missingMarkers);
      const separator = content.endsWith("\n") ? "\n" : "\n\n";
      const merged = `${content}${separator}${appendix.trim()}\n`;
      const targetEntry = agentEntry === "AGENTS.md" ? agentEntry : "AGENTS.md";
      const agentTargetPath = path.join(targetPath, targetEntry);
      const sourceDigest = sha256Content(Buffer.from(content));
      actions.push({
        type: fs.existsSync(agentTargetPath)
          ? (options.backupDir ? "BACKUP_THEN_RECONCILE" : "RECONCILE_PRESERVE")
          : "CREATE",
        path: targetEntry,
        source: null,
        inlineContentBase64: Buffer.from(merged).toString("base64"),
        preservation: {
          mode: "EXACT_PREFIX_APPEND",
          sourcePath: agentEntry,
          sourceDigest,
          sourceBytes: Buffer.byteLength(content),
          separator,
        },
        reason: agentEntry === "AGENTS.md"
          ? "request-bound AGENTS.md governance convergence"
          : `request-bound AGENTS.md bridge preserving ${agentEntry}`,
        willWrite: true,
        hashBefore: sha256File(agentTargetPath),
      });
    } else {
      actions.push({ type: "NEEDS_HUMAN_APPROVAL", path: agentEntry, source: null, reason: `missing markers: ${missingMarkers.join(", ")}`, willWrite: false, hashBefore: sha256File(agentsPath) });
      actions.push({ type: "WRITE_MIGRATION_REPORT", path: ".intentos/migration-reports/agents-governance.md", source: null, reason: `${agentEntry} governance migration report`, willWrite: true, hashBefore: sha256File(agentsGovernanceMigrationReportPath(targetPath)) });
    }
  }

  if (options.includePullRequestGovernance === false) return;

  const prPath = path.join(targetPath, ".github", "pull_request_template.md");
  if (!fs.existsSync(prPath)) {
    addFilePlanAction(actions, targetPath, resolvePullRequestTemplateSource(starter), ".github/pull_request_template.md", {
      overwrite: false,
      reason: "missing pull request template",
    });
  } else {
    const content = fs.readFileSync(prPath, "utf8");
    const missingMarkers = requiredPullRequestTemplateMarkers.filter((marker) => !content.includes(marker));
    if (missingMarkers.length === 0) {
      actions.push({ type: "SKIP_EXISTING", path: ".github/pull_request_template.md", source: null, reason: "PR template already has required governance markers", willWrite: false, hashBefore: sha256File(prPath) });
    } else if (options.applyPrTemplateGovernance) {
      actions.push({ type: options.backupDir ? "BACKUP_THEN_UPDATE" : "UPDATE_MANAGED", path: ".github/pull_request_template.md", source: null, reason: "explicit PR template governance apply", willWrite: true, hashBefore: sha256File(prPath) });
    } else {
      actions.push({ type: "NEEDS_HUMAN_APPROVAL", path: ".github/pull_request_template.md", source: null, reason: `missing markers: ${missingMarkers.join(", ")}`, willWrite: false, hashBefore: sha256File(prPath) });
      actions.push({ type: "WRITE_MIGRATION_REPORT", path: ".intentos/migration-reports/pr-template-governance.md", source: null, reason: "PR template governance migration report", willWrite: true, hashBefore: sha256File(pullRequestTemplateMigrationReportPath(targetPath)) });
    }
  }
}


function addFullDistributionPlanActions(actions, targetPath, options) {
  const copyRules = manifestCopyRules(kitRoot, { fallback: fallbackCopyRules() });
  for (const rule of copyRules.directories || []) {
    addDirectoryPlanActions(actions, targetPath, path.join(kitRoot, rule.source), rule.target, {
      overwrite: options.update,
      backupDir: options.backupDir,
      reason: "manifest full-distribution directory rule",
    });
  }
  for (const rule of copyRules.files || []) {
    addFilePlanAction(actions, targetPath, path.join(kitRoot, rule.source), rule.target, {
      overwrite: options.update,
      backupDir: options.backupDir,
      reason: "manifest full-distribution file rule",
    });
  }
}

function addSelectedDistributionPlanActions(actions, targetPath, options) {
  for (const asset of selectedNativeOverlayAssets()) {
    addFilePlanAction(actions, targetPath, path.join(kitRoot, asset.source), asset.target, {
      overwrite: Boolean(options.update),
      allowLegacyManagedUpdate: true,
      backupDir: options.backupDir,
      reason: `selected native overlay: ${asset.capabilities.join("+")}`,
    });
    const action = actions.at(-1);
    action.capability = asset.capabilities[0];
    action.selectedBy = {
      policy: "adoptionPolicies.selectedAssets",
      source_groups: asset.sourceGroups,
    };
  }
}

function addVersionPlanAction(actions, targetPath, options = {}) {
  const versionTarget = path.join(targetPath, ".intentos", "version.json");
  const versionHash = sha256File(versionTarget);
  const versionOwnership = versionHash
    ? priorManagedAssetOwnership(targetPath, ".intentos/version.json", versionHash)
    : { state: "NEW_TARGET" };
  const canUpdateVersion = !versionHash || versionOwnership.state === "VERIFIED_PRIOR_INTENTOS_MANAGED";
  actions.push({
    type: versionHash
      ? canUpdateVersion
        ? (options.backupDir ? "BACKUP_THEN_UPDATE" : "UPDATE_MANAGED")
        : "PRESERVE_UNMANAGED"
      : "CREATE",
    path: ".intentos/version.json",
    source: null,
    reason: "workflow version record",
    willWrite: canUpdateVersion,
    hashBefore: versionHash,
    ownership: versionOwnership,
  });
}

function decorateNativeAdoptionActions(actions, assessment) {
  for (const action of actions) {
    action.capability ||= nativeAdoptionActionCapability(action.path);
    action.selectionEvidence = assessment?.assessment_digest || "N/A";
    if (action.willWrite && action.capability === "UNCLASSIFIED") {
      throw new Error(`Native adoption write has no selected capability: ${action.path || action.type}`);
    }
  }
}

function blockedNativeAdoptionActions(assessment, migrationDepth) {
  return [{
    type: "BLOCKED_ADOPTION_DIAGNOSTIC",
    path: null,
    source: null,
    reason: migrationDepth !== "SELECTED_ASSETS"
      ? `${migrationDepth.toLowerCase()} stage requested; no target write graph was generated`
      : `native adoption assessment blocked: ${(assessment?.blockers || []).join("; ")}`,
    willWrite: false,
    hashBefore: null,
    sourceHash: null,
    expectedHashAfter: null,
    executionSupported: false,
    capability: "DIAGNOSTIC_ONLY",
  }];
}

function buildPlan(targetPath, options = {}) {
  if (options.backupDir) resolveBackupRoot(targetPath, controlledBackupRunRoot(options.backupDir));
  const detectedProjectEntryOrigin = fs.existsSync(targetPath)
    && fs.statSync(targetPath).isDirectory()
    && fs.readdirSync(targetPath).some((entry) => !isIgnorableNewProjectEntry(entry))
    ? "EXISTING_PROJECT"
    : "NEW_PROJECT";
  const projectEntryOrigin = options.projectEntryOrigin || detectedProjectEntryOrigin;
  const operationKind = projectEntryOrigin === "NEW_PROJECT"
    ? "NEW_BOOTSTRAP"
    : fs.existsSync(path.join(targetPath, ".intentos", "version.json"))
      ? "CONTROLLED_UPDATE"
      : "NATIVE_ADOPTION";
  const operation = operationKind === "CONTROLLED_UPDATE"
    ? "UPDATE_WORKFLOW_ASSETS"
    : "INIT_PROJECT";
  const installedVersion = operationKind === "CONTROLLED_UPDATE"
    ? readJsonIfExists(path.join(targetPath, ".intentos", "version.json"))
    : null;
  const migrationDepth = operationKind === "NATIVE_ADOPTION"
    ? normalizeNativeAdoptionMigrationDepth(options.migrationDepth)
    : operationKind === "CONTROLLED_UPDATE" && installedVersion?.assetMigrationDepth === "SELECTED_ASSETS"
      ? "SELECTED_ASSETS"
      : "FULL_NATIVE";
  const baselineConfig = operationKind === "NATIVE_ADOPTION" && migrationDepth !== "SELECTED_ASSETS"
    ? nativeAdoptionProfileConfigurationForPlan(targetPath, options)
    : baselineConfigurationForPlan(targetPath, options);
  let initialTaskIntake = installedVersion?.initialTaskIntake || null;
  if (operationKind === "CONTROLLED_UPDATE"
    && migrationDepth === "SELECTED_ASSETS"
    && !initialTaskIntake) {
    const legacyInitialIntake = resolveVerifiedInitialTaskIntakeProof({ targetRoot: targetPath });
    if (legacyInitialIntake.state === "VERIFIED") {
      initialTaskIntake = createInitialTaskIntakeState(legacyInitialIntake.request_bound_proof);
    }
  }
  const goal = String(options.goal || "").trim();
  const adoptionAssessment = operationKind === "NATIVE_ADOPTION"
    ? buildNativeAdoptionAssessment(targetPath, goal, {
      migrationDepth,
      baselineConfig,
      nativeRuleDecisions: options.nativeRuleDecisions,
    })
    : null;
  const executableProfileReconciliation = operationKind === "NATIVE_ADOPTION"
    && migrationDepth === "DOCS_BRIDGE"
    && adoptionAssessment?.assessment_state === "READY_FOR_PROFILE_RECONCILIATION"
    && baselineConfig.profileReconciliation?.state === "ADDITIVE_RECONCILIATION_REQUIRED";
  const executableNativeAdoption = operationKind !== "NATIVE_ADOPTION"
    || executableProfileReconciliation
    || (migrationDepth === "SELECTED_ASSETS"
      && adoptionAssessment?.assessment_state === "READY_FOR_REQUEST_BOUND_NATIVE_ADOPTION");
  options = {
    ...options,
    update: operationKind === "CONTROLLED_UPDATE",
    baselineConfig,
    projectEntryOrigin,
    migrationDepth,
    initialTaskIntake,
    applyAgentGovernance: Boolean(
      options.applyAgentGovernance
      || operationKind === "NATIVE_ADOPTION"
      || operationKind === "CONTROLLED_UPDATE"
    ),
  };

  const actions = executableNativeAdoption ? [] : blockedNativeAdoptionActions(adoptionAssessment, migrationDepth);
  if (executableNativeAdoption) {
    const selectedExistingOverlay = projectEntryOrigin === "EXISTING_PROJECT"
      && migrationDepth === "SELECTED_ASSETS";
    if (executableProfileReconciliation) {
      actions.push(createSelectedProfilesReconciliationAction({
        currentContent: fs.readFileSync(path.join(targetPath, "docs", "project-profile.md"), "utf8"),
        assessment: baselineConfig.profileReconciliation,
        backupDir: options.backupDir,
      }));
    } else if (!selectedExistingOverlay) addOnboardingDocPlanActions(actions, targetPath);
    if (operationKind === "NEW_BOOTSTRAP") {
      addDirectoryPlanActions(actions, targetPath, path.join(kitRoot, "starters", options.starter), ".", {
        overwrite: false,
        reason: "starter asset",
      });
    }
    if (executableProfileReconciliation) {
      // DOCS_BRIDGE is one exact project-owned section transaction. Selected
      // assets are planned only after this receipt changes the project facts.
    } else if (selectedExistingOverlay) {
      addSelectedDistributionPlanActions(actions, targetPath, options);
      addSelectedBaselineAssetPlanActions(actions, targetPath, baselineConfig, options);
    } else {
      addFullDistributionPlanActions(actions, targetPath, options);
    }
    if (!executableProfileReconciliation) {
      addIndustrialPlanActions(actions, targetPath, {
        ...options,
        industrialPacks: baselineConfig.industrialPacks.join(","),
      });
      addBaselineConfigurationPlanActions(actions, targetPath, baselineConfig, options);
      addGovernancePlanActions(actions, targetPath, options.starter, {
        ...options,
        includePullRequestGovernance: !selectedExistingOverlay,
        selectedNativeOverlay: selectedExistingOverlay,
      });
      if (!selectedExistingOverlay) {
        addWorkflowDirPlanActions(actions, targetPath);
      }
      addVersionPlanAction(actions, targetPath, options);
    }
  }
  collapseDuplicateTargetActions(actions);
  const createdAt = options.createdAt || new Date().toISOString();
  const receiptPath = operation === "INIT_PROJECT" && projectEntryOrigin === "NEW_PROJECT"
    ? ".intentos/bootstrap-receipt.json"
    : `apply-receipts/${planRunId(createdAt)}.md`;
  if (executableNativeAdoption) {
    enrichExecutionActions(actions, targetPath, {
      ...options,
      assetMigrationDepth: migrationDepth,
    }, createdAt, receiptPath, operation);
  }
  if (operationKind === "NATIVE_ADOPTION") decorateNativeAdoptionActions(actions, adoptionAssessment);
  assignPlanActionIds(actions);
  const targetFingerprint = createTargetFingerprint(targetPath, actions);
  const plan = {
    planVersion: "1.1",
    intentOSVersion: currentIntentOSVersion,
    manifestVersion: readJsonIfExists(path.join(kitRoot, "intentos-manifest.json"))?.intentOSVersion || currentIntentOSVersion,
    manifestDigest: sha256File(path.join(kitRoot, "intentos-manifest.json")),
    operation,
    operationKind,
    targetRoot: targetPath,
    createdAt,
    projectIdentity: projectIdentity(targetPath),
    receiptPath,
    arguments: {
      starter: options.starter,
      updateWorkflowAssets: Boolean(options.update),
      applyPrTemplateGovernance: Boolean(options.applyPrTemplateGovernance),
      applyAgentGovernance: Boolean(options.applyAgentGovernance),
      withIndustrialPacks: Boolean(options.withIndustrialPacks),
      industrialPacks: baselineConfig.industrialPacks.join(","),
      profiles: baselineConfig.profiles,
      baselineLevel: baselineConfig.baselineLevel,
      standardPacks: baselineConfig.standardPacks,
      selectedIndustrialPacks: baselineConfig.industrialPacks,
      backupDir: options.backupDir || null,
      controlledAdoption: true,
      projectEntryOrigin,
      migrationDepth,
      nativeRuleDecisions: options.nativeRuleDecisions || "",
      nativeRuleDecisionDigest: adoptionAssessment?.native_migration?.block_decision_resolution?.artifact_digest || "N/A",
      historicalTaskMigration: operationKind === "NATIVE_ADOPTION" ? "NOT_REQUESTED" : "NOT_APPLICABLE",
      goal,
      goalDigest: goal
        ? projectGoalProjection(options.goal).goal_digest
        : "N/A",
    },
    targetFingerprint,
    expectedPreconditions: {
      targetExists: fs.existsSync(targetPath),
      fileHashes: targetFingerprint.fileHashes,
    },
    actions,
    ownershipConflicts: actions
      .filter((action) => action.type === "PRESERVE_UNMANAGED")
      .map((action) => ({ path: action.path, hash: action.hashBefore, disposition: "PRESERVE_AND_BLOCK" })),
    adoptionAssessment,
    adoptionSelection: operationKind === "NATIVE_ADOPTION" ? {
      migration_depth: migrationDepth,
      reconciliation_assessment_digest: adoptionAssessment?.assessment_digest || "N/A",
      selected_capabilities: [...new Set(actions
        .filter((action) => action.willWrite)
        .map((action) => action.capability))].sort(),
      historical_task_migration: "NOT_REQUESTED",
    } : null,
    executionState: executableNativeAdoption ? "EXECUTABLE" : "DIAGNOSTIC_ONLY",
  };
  plan.receiptActionId = actions.find((action) => action.type === "WRITE_APPLY_RECEIPT")?.id || null;
  if (operationKind === "NATIVE_ADOPTION"
    && executableNativeAdoption
    && migrationDepth === "SELECTED_ASSETS") {
    attachInitialGoalToPlan(plan, projectGoalProjection(options.goal), { existingAdoption: true });
    decorateNativeAdoptionActions(plan.actions, adoptionAssessment);
  }
  plan.candidateStaticActivationPreflight = buildCandidateStaticActivationPreflight(plan);
  if (plan.candidateStaticActivationPreflight.state === "BLOCKED") {
    const details = [
      plan.candidateStaticActivationPreflight.reason,
      ...(plan.candidateStaticActivationPreflight.runtime_identity?.errors || []),
      ...(plan.candidateStaticActivationPreflight.operational_policy?.missing_required_assets || [])
        .map((item) => `MISSING_OPERATIONAL_ASSET:${item}`),
      ...plan.candidateStaticActivationPreflight.invalid_nodes.map((item) => `${item.path}:${(item.conflict_codes || []).join(",") || item.state}`),
      ...plan.candidateStaticActivationPreflight.cycles.map((cycle) => cycle.join(" -> ")),
    ].filter(Boolean);
    throw new Error(`Candidate activation preflight failed before target writes: ${details.join("; ")}`);
  }
  plan.planDigest = planDigest(plan);
  if (operationKind === "NATIVE_ADOPTION" && executableNativeAdoption) {
    assertRequestBoundNativeAdoptionActions(plan);
  }
  return plan;
}

function assertRequestBoundNativeAdoptionActions(plan) {
  const errors = validateRequestBoundLocalActionGraph(plan);
  if (errors.length > 0) {
    throw new Error(`Selected native adoption produced an unauthorized action graph: ${errors.join("; ")}`);
  }
}

function buildNativeAdoptionAssessment(targetPath, goal, options = {}) {
  const migrationDepth = normalizeNativeAdoptionMigrationDepth(options.migrationDepth);
  const profileMapping = nativeAdoptionProfileMapping(options.baselineConfig, migrationDepth);
  if (!goal) {
    const base = {
      schema_version: "1.113.0",
      assessment_state: "BLOCKED_MISSING_REQUEST",
      migration_depth: migrationDepth,
      historical_task_migration: {
        state: "NOT_REQUESTED",
        reason: "Historical task migration is a separate explicit plan and is not part of native adoption.",
      },
      adoption_stage: {
        requested_stage: migrationDepth,
        reconciliation_path: "NOT_EVALUATED",
        state: "BLOCKED_MISSING_REQUEST",
        required_stages: ["READ_ONLY_DIAGNOSIS"],
        completed_stages: [],
        next_stage: null,
        selected_assets_eligible: "No",
        write_graph_allowed: "No",
        transition_evidence: {
          scan_state: "NOT_EVALUATED",
          recommendation: "NOT_EVALUATED",
          reconciliation_path: "NOT_EVALUATED",
          can_recommend_apply_plan_now: "No",
        },
        blockers: ["The original natural-language adoption request is required."],
      },
      profile_mapping: profileMapping,
      blockers: ["The original natural-language adoption request is required."],
    };
    return {
      ...base,
      assessment_digest: evidenceDigest(base, []),
    };
  }
  const sourceBefore = targetSourceStateDigest(targetPath);
  const decisionArgs = options.nativeRuleDecisions
    ? ["--native-rule-decisions", path.resolve(options.nativeRuleDecisions)]
    : [];
  const native = runReadOnlyAdoptionResolver("resolve-native-migration.mjs", [
    targetPath,
    "--json",
    "--intent",
    goal,
    ...decisionArgs,
  ]);
  const reconciliation = runReadOnlyAdoptionReconciliation(targetPath, goal, decisionArgs, native);
  const sourceAfter = targetSourceStateDigest(targetPath);
  const nativeDecisions = Array.isArray(native.humanDecisionsNeeded) ? native.humanDecisionsNeeded : [];
  const userTechnicalDecisionRequired = nativeDecisions.some((item) => {
    const owner = String(item?.owner || "").trim().toLowerCase();
    const status = String(item?.status || "").trim();
    return owner === "user" && !["NO_USER_ACTION", "REAL_WORLD_EFFECT_ONLY"].includes(status);
  });
  const coverage = reconciliation.ruleReconciliationCoverage || {};
  const decision = reconciliation.nativeAdoptionDecision || {};
  const nativeRuleDecisionWorkPacket = native.nativeRuleDecisionWorkPacket || null;
  const governanceBacklog = assessExistingProjectGovernanceBacklog({
    reconciliationCoverage: coverage,
    nativeEvidence: native.structuredEvidence,
    packet: nativeRuleDecisionWorkPacket,
    blockDecisionResolution: native.blockDecisionResolution,
  });
  const adoptionStage = resolveNativeAdoptionStage({
    requestedStage: migrationDepth,
    recommendation: decision.recommendation,
    reconciliationPath: decision.migrationDepth,
    canRecommendApplyPlanNow: reconciliation.canRecommendApplyPlanNow,
    scanState: coverage.scanState,
    profileReconciliationState: options.baselineConfig?.profileReconciliation?.state,
    governanceBacklogState: governanceBacklog.state,
  });
  adoptionStage.transition_evidence_digest = evidenceDigest(adoptionStage.transition_evidence, []);
  const blockers = [];
  if (sourceBefore !== sourceAfter) blockers.push("Read-only adoption assessment changed the target source state.");
  if (!native.outcome) blockers.push("Native Migration outcome is missing.");
  if (!reconciliation.outcome) blockers.push("Rule Reconciliation outcome is missing.");
  if (migrationDepth === "DOCS_BRIDGE") {
    blockers.push(...adoptionStage.blockers);
  }
  if (migrationDepth === "SELECTED_ASSETS") {
    if (profileMapping.state === "TECHNICAL_DISCOVERY_REQUIRED") {
      blockers.push(profileMapping.reason);
    }
    if (native.outcome !== "NATIVE_MIGRATION_PLAN_RECORDED") blockers.push(`Native Migration outcome is ${native.outcome || "missing"}.`);
    if (governanceBacklog.blocks_operation === "Yes") {
      blockers.push(...governanceBacklog.reasons);
    } else if (governanceBacklog.state === "CURRENT") {
      if (reconciliation.outcome !== "RECONCILIATION_RECORDED") blockers.push(`Rule Reconciliation outcome is ${reconciliation.outcome || "missing"}.`);
      if (decision.recommendation !== "SELECTED_NATIVE_ADOPTION" || reconciliation.canRecommendApplyPlanNow !== "Yes") blockers.push("Selected native adoption is not technically ready.");
    }
    if ((reconciliation.conflicts || []).length > 0) blockers.push("Rule reconciliation retains unresolved conflicts.");
    if (userTechnicalDecisionRequired) blockers.push("Native Migration still asks the user for a technical decision.");
  }
  const goalPaths = initialGoalPaths(projectGoalProjection(goal), { existingAdoption: true });
  const pathCollisions = [goalPaths.requestPath, goalPaths.queuePath]
    .filter((relative) => fs.existsSync(path.join(targetPath, relative)));
  if (migrationDepth === "SELECTED_ASSETS" && pathCollisions.length > 0) {
    blockers.push(`Current request bridge paths already exist: ${pathCollisions.join(", ")}.`);
  }
  const assessmentState = blockers.length > 0
    ? "BLOCKED"
    : migrationDepth === "READ_ONLY_DIAGNOSIS"
      ? "READ_ONLY_DIAGNOSIS_COMPLETE"
      : migrationDepth === "DOCS_BRIDGE"
        ? options.baselineConfig?.profileReconciliation?.state === "ADDITIVE_RECONCILIATION_REQUIRED"
          ? "READY_FOR_PROFILE_RECONCILIATION"
          : adoptionStage.state
        : "READY_FOR_REQUEST_BOUND_NATIVE_ADOPTION";
  const adoptionCheckpoint = existingProjectAdoptionCheckpointFor({
    native,
    reconciliation,
    profileReconciliation: options.baselineConfig?.profileReconciliation,
    migrationDepth,
    sourceStateUnchanged: sourceBefore === sourceAfter,
    governanceBacklog,
  });
  const base = {
    schema_version: "1.113.0",
    assessment_state: assessmentState,
    migration_depth: migrationDepth,
    project_state: native.projectState?.state || "UNKNOWN",
    native_migration: {
      posture: native.posture || "UNKNOWN",
      outcome: native.outcome || "UNKNOWN",
      rule_extraction_coverage: native.ruleExtractionCoverage || [],
      rule_classifications: native.ruleClassifications || [],
      conflicts: native.conflicts || [],
      block_decision_resolution: {
        state: native.blockDecisionResolution?.state || "NOT_PROVIDED",
        artifact_ref: native.blockDecisionResolution?.artifactRef || "N/A",
        artifact_digest: native.blockDecisionResolution?.artifactDigest || "N/A",
        decisions_declared: Number(native.blockDecisionResolution?.decisionsDeclared || 0),
        decisions_applied: Number(native.blockDecisionResolution?.decisionsApplied || 0),
        errors: native.blockDecisionResolution?.errors || [],
      },
      user_technical_decision_required: userTechnicalDecisionRequired ? "Yes" : "No",
    },
    native_rule_decision_work_packet: nativeRuleDecisionWorkPacket,
    governance_backlog: governanceBacklog,
    adoption_checkpoint: adoptionCheckpoint,
    rule_reconciliation: {
      outcome: reconciliation.outcome || "UNKNOWN",
      coverage,
      source_mode: reconciliation.sameRunSource?.mode || "UNKNOWN",
      recommendation: decision.recommendation || "UNKNOWN",
      migration_depth: decision.migrationDepth || "UNKNOWN",
      conflicts: reconciliation.conflicts || [],
      protected_constraints: reconciliation.protectedConstraints || [],
    },
    current_task_bridge: {
      state: pathCollisions.length === 0 ? "READY" : "BLOCKED",
      request_path: goalPaths.requestPath,
      queue_path: goalPaths.queuePath,
      intent_digest: projectGoalProjection(goal).goal_digest,
      scope: "CURRENT_NATURAL_LANGUAGE_REQUEST_ONLY",
    },
    profile_mapping: profileMapping,
    profile_reconciliation: options.baselineConfig?.profileReconciliation || {
      state: "NOT_APPLICABLE",
      assessment_digest: "N/A",
    },
    historical_task_migration: {
      state: "NOT_REQUESTED",
      scans_existing_task_history: "No",
      archives_existing_task_history: "No",
      changes_existing_task_authority: "No",
      reason: "Historical task migration requires a separate explicit plan and evidence chain.",
    },
    source_state_unchanged: sourceBefore === sourceAfter,
    source_state_digest: sourceAfter,
    adoption_stage: adoptionStage,
    blockers,
  };
  return { ...base, assessment_digest: evidenceDigest(base, []) };
}

function existingProjectAdoptionCheckpointFor(options = {}) {
  const nativeEvidence = options.native?.structuredEvidence || {};
  const coverage = options.reconciliation?.ruleReconciliationCoverage || {};
  const packet = options.native?.nativeRuleDecisionWorkPacket;
  const packetCurrent = packet?.artifact_type === "native_rule_decision_work_packet"
    && Number.isSafeInteger(packet.required_decisions)
    && packet.required_decisions > 0;
  const unresolvedCovered = packetCurrent
    && Number(coverage.omittedRules || 0) === packet.required_decisions;
  const scanState = unresolvedCovered
    ? "COMPLETE_ACTIONABLE_RULES"
    : String(coverage.scanState || "UNKNOWN");
  const decisionState = options.native?.blockDecisionResolution?.state === "INVALID"
    ? "INVALID"
    : packetCurrent ? "NOT_PROVIDED" : "CURRENT";
  const profile = options.profileReconciliation || {};
  const governanceBacklog = options.governanceBacklog || assessExistingProjectGovernanceBacklog({
    reconciliationCoverage: coverage,
    nativeEvidence,
    packet,
    blockDecisionResolution: options.native?.blockDecisionResolution,
  });
  return resolveExistingProjectAdoptionCheckpoint({
    binding: {
      state: nativeEvidence.project_binding
        && /^sha256:[a-f0-9]{64}$/.test(String(nativeEvidence.project_fact_digest || ""))
        ? "CURRENT"
        : "MISSING",
      projectBinding: nativeEvidence.project_binding || {},
      projectFactDigest: nativeEvidence.project_fact_digest || "N/A",
      sourceRevision: nativeEvidence.source_revision || "N/A",
    },
    discovery: {
      state: options.sourceStateUnchanged && nativeEvidence.artifact_type === "native_migration_plan"
        ? "CURRENT"
        : "MISSING",
      evidenceDigest: evidenceDigest(nativeEvidence, []),
    },
    profile: {
      state: profile.state || (options.migrationDepth === "SELECTED_ASSETS" ? "CURRENT" : "MISSING"),
      declaredProfiles: profile.declared_profiles || [],
      observedProfiles: profile.observed_profiles || [],
      proposedProfiles: profile.proposed_profiles || [],
      evidenceDigest: profile.assessment_digest || "N/A",
      humanDecisionRequired: profile.human_decision_required || "No",
    },
    rules: {
      scanState,
      unresolvedBlocks: packetCurrent
        ? packet.required_decisions
        : ["COMPLETE_NO_ACTIONABLE_RULES", "COMPLETE_ACTIONABLE_RULES"].includes(scanState) ? 0 : null,
      decisionState,
      operationalBoundaryState: governanceBacklog.state,
      evidenceDigest: packetCurrent ? packet.packet_digest : evidenceDigest(coverage, []),
    },
    selectedAssetsPlan: { state: "MISSING", planDigest: "N/A" },
    apply: { state: "MISSING", receiptDigest: "N/A" },
    activation: { state: "MISSING", evidenceDigest: "N/A" },
  });
}

function nativeAdoptionProfileMapping(baselineConfig, migrationDepth) {
  if (migrationDepth !== "SELECTED_ASSETS") {
    return {
      state: "NOT_APPLICABLE",
      selected_profiles: [],
      baseline_level: null,
      next_action: "N/A",
      reason: "Selected profile mapping is required only for selected-assets adoption.",
    };
  }
  const selectedProfiles = [...new Set(Array.isArray(baselineConfig?.profiles)
    ? baselineConfig.profiles.map((value) => String(value || "").trim()).filter(Boolean)
    : [])].sort();
  const baselineLevel = normalizeBaselineLevel(baselineConfig?.baselineLevel);
  if (selectedProfiles.length === 0 || !baselineLevel) {
    return {
      state: "TECHNICAL_DISCOVERY_REQUIRED",
      selected_profiles: selectedProfiles,
      baseline_level: baselineLevel,
      next_action: "RUN_TECHNICAL_DISCOVERY",
      reason: "Selected native adoption cannot activate until Codex derives a project profile and baseline level from project evidence.",
    };
  }
  return {
    state: "PROFILE_MAPPING_READY",
    selected_profiles: selectedProfiles,
    baseline_level: baselineLevel,
    next_action: "N/A",
    reason: "Project profile and baseline level are bound to the selected adoption plan.",
  };
}

function runReadOnlyAdoptionResolver(scriptName, resolverArgs) {
  return runReadOnlyAdoptionResolverWithOptions(scriptName, resolverArgs);
}

function runReadOnlyAdoptionReconciliation(targetPath, goal, decisionArgs, nativeReport) {
  const evidence = nativeReport?.structuredEvidence || {};
  const taskRef = /^sha256:[a-f0-9]{64}$/.test(String(evidence.goal_digest || ""))
    ? `task:${evidence.goal_digest.slice("sha256:".length)}`
    : "N/A";
  const envelope = createSameRunEvidenceEnvelope({
    evidenceType: "native_migration",
    producer: "scripts/resolve-native-migration.mjs",
    producerSchemaVersion: evidence.schema_version || "unknown",
    projectBinding: evidence.project_binding || {},
    taskRef,
    intentDigest: evidence.goal_digest || "N/A",
    goalDigest: evidence.goal_digest || "N/A",
    projectFactDigest: evidence.project_fact_digest || "N/A",
    guidanceDigest: evidence.guidance_digest || "N/A",
    authorityInventoryDigest: evidence.authority_inventory_digest || "N/A",
    sourceRevision: evidence.source_revision || "N/A",
    payload: nativeReport,
  });
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-native-reconciliation-"));
  const bundleFile = path.join(tempRoot, "same-run-envelope.json");
  try {
    fs.writeFileSync(bundleFile, encodeSameRunEnvelopeBundle([envelope]));
    return runReadOnlyAdoptionResolverWithOptions("resolve-existing-rule-reconciliation.mjs", [
      targetPath,
      "--json",
      "--auto-native",
      "--intent",
      goal,
      ...decisionArgs,
    ], {
      env: {
        ...process.env,
        INTENTOS_SAME_RUN_BUNDLE_FILE: bundleFile,
      },
    });
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

function runReadOnlyAdoptionResolverWithOptions(scriptName, resolverArgs, options = {}) {
  const result = runStructuredJsonChildSync({
    command: process.execPath,
    args: [path.join(kitRoot, "scripts", scriptName), ...resolverArgs],
    cwd: targetPathForResolver(resolverArgs[0]),
    timeout: 120000,
    env: options.env,
  });
  const acceptedExitStatuses = scriptName === "resolve-existing-rule-reconciliation.mjs"
    ? [0, 1]
    : [0];
  if (result.state !== "CURRENT_RUN"
    || !acceptedExitStatuses.includes(result.exitStatus)
    || !result.value) {
    throw new Error(`${scriptName} failed during native-adoption assessment: ${result.state}: ${structuredResolverFailureReason(result)}`);
  }
  return result.value;
}

function structuredResolverFailureReason(result) {
  const value = result.value && typeof result.value === "object" ? result.value : {};
  const blockers = Array.isArray(value.blockers) ? value.blockers : [];
  const reason = [
    ...blockers,
    value.reason,
    value.nativeAdoptionDecision?.defaultPath,
    value.outcome ? `outcome ${value.outcome}` : "",
    result.error,
    result.stderrPreview,
    result.exitStatus !== null ? `exit ${result.exitStatus}` : "",
  ].map(normalizeOutput).find(Boolean);
  return reason || "structured resolver returned no diagnostic reason";
}

function targetPathForResolver(value) {
  return fs.existsSync(value) && fs.statSync(value).isDirectory() ? value : process.cwd();
}

function assignPlanActionIds(actions) {
  actions.forEach((action, index) => {
    if (!action.id) action.id = formatActionId(index + 1);
  });
}

function collapseDuplicateTargetActions(actions) {
  const lastIndexByPath = new Map();
  actions.forEach((action, index) => {
    if (action?.path) lastIndexByPath.set(action.path, index);
  });
  const collapsed = actions.filter((action, index) => !action?.path || lastIndexByPath.get(action.path) === index);
  actions.splice(0, actions.length, ...collapsed);
}

function createTargetFingerprint(targetPath, actions) {
  const fileHashes = {};
  for (const action of actions) {
    if (!action.path) continue;
    let rel;
    try {
      rel = assertSafeRelativePath(action.path, "plan fingerprint action path");
    } catch {
      continue;
    }
    const full = assertSafeWritePath(targetPath, rel, "plan fingerprint action path");
    if (fs.existsSync(full) && fs.statSync(full).isFile()) {
      fileHashes[rel] = sha256File(full);
    }
  }
  const gitState = gitFingerprint(targetPath);
  return {
    targetExists: fs.existsSync(targetPath),
    ...gitState,
    verifiedPriorApplyOverlap: verifiedPriorApplyOverlap(targetPath, actions, gitState, fileHashes),
    sourceStateDigest: targetSourceStateDigest(targetPath),
    fileHashes,
  };
}

function verifiedPriorApplyOverlap(targetPath, actions, gitState, fileHashes) {
  if (!gitState.isGitRepository || !gitState.isDirty) return null;
  const overlap = controlledUpdateDirtyWriteOverlap(gitState, actions);
  if (!overlap.ok || overlap.paths.length === 0) return null;

  const receiptsDir = path.join(targetPath, "apply-receipts");
  let receiptNames;
  try {
    const stat = fs.lstatSync(receiptsDir);
    if (stat.isSymbolicLink() || !stat.isDirectory()) return null;
    receiptNames = fs.readdirSync(receiptsDir, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
      .map((entry) => entry.name)
      .sort()
      .reverse();
  } catch {
    return null;
  }
  for (const name of receiptNames) {
    const receiptRelative = assertSafeRelativePath(`apply-receipts/${name}`, "prior apply receipt path");
    const validated = validateVerifiedApplyReceiptFile(targetPath, receiptRelative, { schemasRoot: kitRoot });
    if (!validated.ok) continue;
    let planRelative;
    let planFile;
    let priorPlan;
    try {
      planRelative = assertSafeRelativePath(
        String(validated.value?.execution_plan?.path || ""),
        "prior apply execution plan path",
      );
      planFile = assertSafeWritePath(targetPath, planRelative, "prior apply execution plan path");
      const stat = fs.lstatSync(planFile);
      if (stat.isSymbolicLink() || !stat.isFile()) continue;
      priorPlan = JSON.parse(fs.readFileSync(planFile, "utf8"));
    } catch {
      return null;
    }
    if (validated.value?.execution_plan?.plan_digest !== priorPlan.planDigest) return null;

    const receiptById = new Map((validated.value.actions || []).map((action) => [action.id, action]));
    const priorByPath = new Map();
    for (const action of priorPlan.actions || []) {
      if (action?.willWrite !== true || action.id === priorPlan.receiptActionId) continue;
      let relative;
      try {
        relative = assertSafeRelativePath(action.path, "prior applied action path");
      } catch {
        return null;
      }
      if (priorByPath.has(relative)) return null;
      priorByPath.set(relative, action);
    }

    const paths = [];
    for (const relative of overlap.paths) {
      const action = priorByPath.get(relative);
      const observed = action ? receiptById.get(action.id) : null;
      if (!action
        || !/^A-[0-9]+$/.test(String(action.id || ""))
        || observed?.result !== "APPLIED"
        || observed.hash_after !== action.expectedHashAfter
        || fileHashes[relative] !== observed.hash_after) {
        return null;
      }
      const current = assertSafeWritePath(targetPath, relative, "prior applied overlap path");
      let stat;
      try {
        stat = fs.lstatSync(current);
      } catch {
        return null;
      }
      if (stat.isSymbolicLink() || !stat.isFile() || sha256File(current) !== observed.hash_after) return null;
      paths.push({ path: relative, priorActionId: action.id, hashAfter: observed.hash_after });
    }
    return {
      state: "VERIFIED_PRIOR_APPLY_OVERLAP",
      receiptRef: `artifact:${receiptRelative}`,
      receiptFileDigest: sha256File(path.join(targetPath, receiptRelative)),
      executionPlanRef: `artifact:${planRelative}`,
      executionPlanDigest: priorPlan.planDigest,
      paths,
    };
  }
  return null;
}

function targetSourceStateDigest(targetPath) {
  if (!fs.existsSync(targetPath)) return sha256Content("TARGET_MISSING");
  const rows = [];
  const ignoreRelative = (relative) => {
    const normalized = relative.replaceAll(path.sep, "/");
    return normalized === ".git"
      || normalized.startsWith(".git/")
      || normalized === "node_modules"
      || normalized.startsWith("node_modules/")
      || isControlledApplyProtocolArtifactPath(normalized);
  };
  for (const [relative, digest] of snapshotTargetFiles(targetPath, { ignoreRelative })) {
    const normalized = relative.replaceAll(path.sep, "/");
    rows.push(`${normalized}:${digest}`);
  }
  return sha256Content(rows.sort().join("\n"));
}


function isForbiddenControlledApplyAction(action, operation = "UPDATE_WORKFLOW_ASSETS") {
  const target = String(action?.path || "");
  const reason = String(action?.reason || "");
  const generatedProjectGithubAsset = operation === "INIT_PROJECT" && target.startsWith(".github/");
  return (!generatedProjectGithubAsset && target.startsWith(".github/"))
    || target.startsWith("hooks/")
    || target.startsWith("migrations/")
    || target.startsWith("deploy/")
    || target.startsWith("src/")
    || /^\.env/.test(target)
    || /explicit full industrial pack/i.test(reason);
}


function initialGoalPaths(goalProjection, options = {}) {
  const existingAdoption = options.existingAdoption === true;
  const digestSuffix = String(goalProjection?.goal_digest || "")
    .replace(/^sha256:/, "")
    .slice(0, 12);
  const slug = existingAdoption ? `intentos-current-${digestSuffix}` : "initial-goal";
  return {
    slug,
    requestPath: `requests/001-${slug}.md`,
    queuePath: `work-queue/001-${slug}.md`,
  };
}

function attachInitialGoalToPlan(plan, goalProjection, options = {}) {
  const existingAdoption = options.existingAdoption === true;
  const { slug, requestPath, queuePath } = initialGoalPaths(goalProjection, options);
  const requestTitle = existingAdoption ? "IntentOS Adoption Goal" : "Initial Product Goal";
  const title = markdownCell(goalProjection.original_goal);
  const requestContent = [
    "---",
    "schema_version: 1.0",
    "artifact_type: request",
    "number: 001",
    `slug: ${slug}`,
    `title: ${requestTitle}`,
    "priority: P1",
    "task_level: L2",
    "status: ready",
    `created_at: ${plan.createdAt}`,
    "---",
    `# Request: 001-${slug}`,
    "",
    "## Raw Request",
    "",
    goalProjection.original_goal,
    "",
    "## User / Customer",
    "",
    "The requester and the product users whose needs Codex must derive from the current goal and later business facts.",
    "",
    "## Problem",
    "",
    "The current goal is recorded, but its business rules, complete scope, implementation slices, and verification obligations still need evidence-based derivation.",
    "",
    "## Desired Outcome",
    "",
    "Codex turns the current goal into a complete governed delivery path without delegating technical choices to the user.",
    "",
    "## Constraints",
    "",
    `- Preserve the current intent digest: \`${goalProjection.goal_digest}\`.`,
    "- Derive technical architecture, baseline, task risk, implementation, and verification through IntentOS.",
    "- Do not perform release, production, paid-service, destructive-data, or other real-world effects without exact consent when required.",
    "",
    "## Priority",
    "",
    "P1",
    "",
    "## Suggested Task Level",
    "",
    "L2",
    "",
    "## Intent Binding",
    "",
    `- Intent digest: \`${goalProjection.goal_digest}\``,
    "- Source: current natural-language project request",
    "- State: CURRENT",
    "",
    "## Governance",
    "",
    "Codex must derive the governed spec, eval, task, Business Rule Closure, Business Universe Coverage when required, Change Impact Coverage, implementation plan, verification, review, and finish evidence before claiming completion.",
    "",
    "This request records intent only. It does not authorize implementation, release, production, paid services, destructive data changes, or other real-world effects.",
    "",
  ].join("\n");
  const queueContent = [
    `# Work Queue: ${requestTitle}`,
    "",
    "## Human Decision Summary",
    "",
    "Conclusion: The current natural-language goal is the only current task.",
    "",
    "Recommended choice: Codex continues the current task through IntentOS.",
    "",
    "Can AI continue now: yes, subject to Task Governance and required evidence.",
    "",
    "What I need from you: none unless a business fact, product preference, external fact, or exact real-world consent is missing.",
    "",
    "What happens if you do nothing: the task remains current; no real-world action occurs.",
    "",
    "## Human Summary",
    "",
    "The current natural-language goal is the only current task. Codex owns technical planning and verification; the user is asked only for missing business facts, product preferences, external facts, or exact real-world consent.",
    "",
    "## Queue Policy",
    "",
    "- Only one `CURRENT` task is allowed.",
    "- `PAUSED` tasks require resume review before execution.",
    "- `BACKLOG` items are not execution permission.",
    "- Work Queue records task state only; it does not approve implementation.",
    "",
    "## Current Task",
    "",
    "| Task ID | Title | State | Request / task reference | Intent digest | Last evidence | Notes |",
    "|---|---|---|---|---|---|---|",
    `| \`001\` | ${title} | \`CURRENT\` | \`${requestPath}\` | \`${goalProjection.goal_digest}\` | \`${requestPath}\` | Derive the governed task chain from the current user goal. |`,
    "",
    "## Paused Tasks",
    "",
    "None.",
    "",
    "## Backlog / Parking Lot",
    "",
    "None.",
    "",
    "## Resume Review",
    "",
    "- Resume requested: `No`",
    "- Candidate task: `None`",
    "- Current state checked: `Yes`",
    "- Dirty worktree checked: `N/A`",
    "- Last evidence still valid: `Yes`",
    "- Human resume decision: `NOT_NEEDED`",
    "- Resume without review: `No`",
    "",
    "## Work Items",
    "",
    "| Task ID | Title | State | Task ref | Intent digest | Resume review | Owner | Notes |",
    "|---|---|---|---|---|---|---|---|",
    `| \`001\` | ${title} | \`CURRENT\` | \`${requestPath}\` | \`${goalProjection.goal_digest}\` | \`N/A\` | \`Codex\` | Governed intake awaiting automatic spec/eval/task derivation. |`,
    "",
    "## Human Decisions Needed",
    "",
    "None.",
    "",
    "## Boundary",
    "",
    "- This report changes task state: No",
    "- This report approves implementation: No",
    "- This report approves target-project writes: No",
    "- This report approves scope expansion: No",
    "- This report approves release or production: No",
    "- This report overrides task/spec/review loop: No",
    "- This report resumes stale work without review: No",
    "",
    "## Outcome",
    "",
    "`WORK_QUEUE_RECORDED`",
    "",
  ].join("\n");
  const additions = [
    inlinePlanAction(requestPath, requestContent, "original goal request card"),
    inlinePlanAction(queuePath, queueContent, "original goal Work Queue binding"),
  ];
  const receiptIndex = plan.actions.findIndex((action) => action.dynamicReceipt);
  plan.actions.splice(receiptIndex < 0 ? plan.actions.length : receiptIndex, 0, ...additions);
  const versionAction = plan.actions.find((action) => action.path === ".intentos/version.json" && action.willWrite);
  if (versionAction?.inlineContentBase64) {
    const version = JSON.parse(Buffer.from(versionAction.inlineContentBase64, "base64").toString("utf8"));
    version.initialTaskIntake = createInitialTaskIntakeState({
      intent: goalProjection.original_goal,
      intent_digest: goalProjection.goal_digest,
      request_path: requestPath,
      request_digest: additions[0].expectedHashAfter,
      queue_path: queuePath,
      queue_digest: additions[1].expectedHashAfter,
    });
    const versionContent = `${JSON.stringify(version, null, 2)}\n`;
    versionAction.inlineContentBase64 = Buffer.from(versionContent).toString("base64");
    versionAction.sourceHash = sha256Content(versionContent);
    versionAction.expectedHashAfter = versionAction.sourceHash;
  }
  for (const action of plan.actions) delete action.id;
  assignPlanActionIds(plan.actions);
  plan.receiptActionId = plan.actions.find((action) => action.dynamicReceipt)?.id || null;
  plan.targetFingerprint = createTargetFingerprint(plan.targetRoot, plan.actions);
  plan.expectedPreconditions = {
    targetExists: fs.existsSync(plan.targetRoot),
    fileHashes: plan.targetFingerprint.fileHashes,
  };
  if (plan.candidateStaticActivationPreflight) {
    plan.candidateStaticActivationPreflight = buildCandidateStaticActivationPreflight(plan);
  }
  plan.planDigest = planDigest(plan);
}

function inlinePlanAction(relativePath, content, reason) {
  const encoded = Buffer.from(content).toString("base64");
  const digest = sha256Content(content);
  return {
    type: "CREATE",
    path: relativePath,
    source: null,
    inlineContentBase64: encoded,
    reason,
    willWrite: true,
    hashBefore: null,
    sourceHash: digest,
    expectedHashAfter: digest,
    executionSupported: true,
  };
}

function markdownCell(value) {
  return String(value || "Initial product goal").replaceAll("|", "\\|").replace(/\s+/g, " ").trim();
}

function bootstrapActionsFromPlan(plan) {
  return plan.actions
    .filter((action) => action.willWrite && !action.dynamicReceipt)
    .map((action) => {
      if (action.executionSupported !== true) throw new Error(`Bootstrap plan action ${action.id} is not executable`);
      let content;
      if (action.source) {
        const source = resolveUnderRoot(kitRoot, action.source, `bootstrap source ${action.id}`);
        if (sha256File(source) !== action.sourceHash) throw new Error(`Bootstrap source changed for ${action.id}`);
        content = fs.readFileSync(source);
      } else if (typeof action.inlineContentBase64 === "string") {
        content = Buffer.from(action.inlineContentBase64, "base64");
        if (sha256Content(content) !== action.sourceHash) throw new Error(`Bootstrap inline content changed for ${action.id}`);
      } else {
        throw new Error(`Bootstrap action ${action.id} has no exact replayable content`);
      }
      return { id: action.id, path: action.path, content };
    });
}

export {
  addSelectedBaselineAssetPlanActions,
  addSelectedDistributionPlanActions,
  assignPlanActionIds,
  attachInitialGoalToPlan,
  bootstrapActionsFromPlan,
  buildCandidateStaticActivationPreflight,
  buildNativeAdoptionAssessment,
  buildPlan,
  controlledBackupRunRoot,
  createTargetFingerprint,
  gitFingerprint,
  isForbiddenControlledApplyAction,
  planDigest,
  priorManagedAssetOwnership,
};
