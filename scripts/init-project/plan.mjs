
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

function enrichExecutionActions(actions, targetPath, options, createdAt, receiptPath) {
  const backupRoot = controlledBackupRunRoot(
    options.backupDir || `.intentos/backups/${planRunId(createdAt)}`,
    "plan backup run root",
  );
  for (const action of actions) {
    action.executionSupported = true;
    if (!action.willWrite) {
      action.sourceHash = action.source ? sha256File(path.join(kitRoot, action.source)) : null;
      action.expectedHashAfter = action.hashBefore;
      continue;
    }
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
    } else if (action.path === ".intentos/version.json") {
      const record = buildVersionRecord(targetPath, options.starter, {
        update: options.update,
        baselineConfig: options.baselineConfig,
        projectEntryOrigin: options.projectEntryOrigin,
        actions,
      }, createdAt);
      const content = `${JSON.stringify(record, null, 2)}\n`;
      action.inlineContentBase64 = Buffer.from(content).toString("base64");
      action.sourceHash = sha256Content(content);
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
  const status = spawnSync("git", [
    "-C", targetPath, "status", "--short", "--", ".",
    ":(exclude)apply-execution-plans/**",
    ":(exclude)approval-records/**",
    ":(exclude)release-approval-records/**",
    ":(exclude)apply-readiness-reports/**",
    ":(exclude)apply-receipts/**",
    ":(exclude).intentos/backups/**",
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
  const ownership = existed ? priorManagedAssetOwnership(targetPath, safeTargetRel, currentHash) : { state: "NEW_TARGET" };
  let type;
  if (!existed) type = "CREATE";
  else if (currentHash === sourceHash) type = "SKIP_EXISTING";
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
  });
}

function addGeneratedFilePlanAction(actions, targetPath, targetRel, content, options = {}) {
  const safeTargetRel = assertSafeRelativePath(targetRel, "generated plan action target path");
  const destPath = assertSafeWritePath(targetPath, safeTargetRel, "generated plan action target path");
  const existed = fs.existsSync(destPath);
  const currentHash = sha256File(destPath);
  const nextHash = sha256Content(content);
  const ownership = existed ? priorManagedAssetOwnership(targetPath, safeTargetRel, currentHash) : { state: "NEW_TARGET" };
  let type;
  if (!existed) type = "CREATE";
  else if (currentHash === nextHash) type = "SKIP_EXISTING";
  else if (options.controlledReconciliation) type = options.backupDir ? "BACKUP_THEN_RECONCILE" : "RECONCILE_PRESERVE";
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
  });
}

function priorManagedAssetOwnership(targetPath, targetRel, currentHash) {
  const versionPath = path.join(targetPath, ".intentos", "version.json");
  if (!currentHash || !fs.existsSync(versionPath)) return { state: "UNPROVEN_PROJECT_OWNED" };
  let stat;
  try { stat = fs.lstatSync(versionPath); } catch { return { state: "UNPROVEN_PROJECT_OWNED" }; }
  if (stat.isSymbolicLink() || !stat.isFile()) return { state: "UNPROVEN_PROJECT_OWNED" };
  let version;
  try { version = JSON.parse(fs.readFileSync(versionPath, "utf8")); } catch { return { state: "UNPROVEN_PROJECT_OWNED" }; }
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
  return managedDigest === currentHash && declared
    ? { state: "VERIFIED_PRIOR_INTENTOS_MANAGED", evidence_ref: ".intentos/version.json", managed_digest: currentHash }
    : { state: "UNPROVEN_PROJECT_OWNED" };
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
  } else {
    const content = fs.readFileSync(agentsPath, "utf8");
    const missingMarkers = requiredAgentGovernanceMarkers.filter((marker) => !content.includes(marker));
    if (missingMarkers.length === 0) {
      actions.push({ type: "SKIP_EXISTING", path: agentEntry, source: null, reason: `${agentEntry} already has required governance markers`, willWrite: false, hashBefore: sha256File(agentsPath) });
    } else if (options.applyAgentGovernance) {
      const merged = `${content.trimEnd()}\n\n${agentGovernanceAppendix(missingMarkers).trim()}\n`;
      const targetEntry = agentEntry === "AGENTS.md" ? agentEntry : "AGENTS.md";
      const agentTargetPath = path.join(targetPath, targetEntry);
      actions.push({
        type: fs.existsSync(agentTargetPath)
          ? (options.backupDir ? "BACKUP_THEN_RECONCILE" : "RECONCILE_PRESERVE")
          : "CREATE",
        path: targetEntry,
        source: null,
        inlineContentBase64: Buffer.from(merged).toString("base64"),
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


function buildPlan(targetPath, options = {}) {
  if (options.backupDir) resolveBackupRoot(targetPath, controlledBackupRunRoot(options.backupDir));
  const operation = options.update ? "UPDATE_WORKFLOW_ASSETS" : "INIT_PROJECT";
  const actions = [];
  const baselineConfig = baselineConfigurationForPlan(targetPath, options);
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
  options = {
    ...options,
    baselineConfig,
    projectEntryOrigin,
    applyAgentGovernance: Boolean(
      options.applyAgentGovernance
      || operationKind === "NATIVE_ADOPTION"
      || operationKind === "CONTROLLED_UPDATE"
    ),
  };
  addOnboardingDocPlanActions(actions, targetPath);
  if (!options.update) {
    addDirectoryPlanActions(actions, targetPath, path.join(kitRoot, "starters", options.starter), ".", {
      overwrite: false,
      reason: "starter asset",
    });
  }
  const copyRules = manifestCopyRules(kitRoot, { fallback: fallbackCopyRules() });
  for (const rule of copyRules.directories || []) {
    addDirectoryPlanActions(actions, targetPath, path.join(kitRoot, rule.source), rule.target, {
      overwrite: options.update,
      backupDir: options.backupDir,
      reason: "manifest directory copy rule",
    });
  }
  for (const rule of copyRules.files || []) {
    addFilePlanAction(actions, targetPath, path.join(kitRoot, rule.source), rule.target, {
      overwrite: options.update,
      backupDir: options.backupDir,
      reason: "manifest file copy rule",
    });
  }
  addIndustrialPlanActions(actions, targetPath, {
    ...options,
    industrialPacks: baselineConfig.industrialPacks.join(","),
  });
  addBaselineConfigurationPlanActions(actions, targetPath, baselineConfig, options);
  addGovernancePlanActions(actions, targetPath, options.starter, options);
  addWorkflowDirPlanActions(actions, targetPath);
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
  collapseDuplicateTargetActions(actions);
  const createdAt = options.createdAt || new Date().toISOString();
  const receiptPath = operation === "INIT_PROJECT" && projectEntryOrigin === "NEW_PROJECT"
    ? ".intentos/bootstrap-receipt.json"
    : `apply-receipts/${planRunId(createdAt)}.md`;
  enrichExecutionActions(actions, targetPath, options, createdAt, receiptPath);
  boundControlledAdoptionActions(actions, operation);
  assignPlanActionIds(actions);

  const adoptionAssessment = operationKind === "NATIVE_ADOPTION"
    ? buildNativeAdoptionAssessment(targetPath, String(options.goal || "").trim())
    : null;
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
      industrialPacks: options.industrialPacks || "",
      profiles: baselineConfig.profiles,
      baselineLevel: baselineConfig.baselineLevel,
      standardPacks: baselineConfig.standardPacks,
      selectedIndustrialPacks: baselineConfig.industrialPacks,
      backupDir: options.backupDir || null,
      controlledAdoption: true,
      projectEntryOrigin,
      goal: String(options.goal || "").trim(),
      goalDigest: String(options.goal || "").trim()
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
  };
  plan.receiptActionId = actions.find((action) => action.type === "WRITE_APPLY_RECEIPT")?.id || null;
  plan.planDigest = planDigest(plan);
  if (operationKind === "NATIVE_ADOPTION"
    && adoptionAssessment?.work_queue_takeover?.recommended_action === "ESTABLISH_INTENTOS_WORK_QUEUE") {
    attachInitialGoalToPlan(plan, projectGoalProjection(options.goal), { existingAdoption: true });
  }
  if (operationKind === "NATIVE_ADOPTION") boundRequestNativeAdoptionActions(plan);
  return plan;
}

function boundRequestNativeAdoptionActions(plan) {
  for (const action of plan.actions || []) {
    if (!action.willWrite || isRequestBoundLocalActionAllowed(action, plan)) continue;
    action.originalType = action.type;
    action.type = "HUMAN_ONLY";
    action.willWrite = false;
    action.executionSupported = false;
    action.reason = `${action.reason}; excluded from request-bound local adoption authority`;
    action.backupPath = null;
    action.expectedHashAfter = action.hashBefore;
  }
  for (const action of plan.actions || []) delete action.id;
  assignPlanActionIds(plan.actions);
  plan.receiptActionId = plan.actions.find((action) => action.dynamicReceipt)?.id || null;
  plan.targetFingerprint = createTargetFingerprint(plan.targetRoot, plan.actions);
  plan.expectedPreconditions = {
    targetExists: fs.existsSync(plan.targetRoot),
    fileHashes: plan.targetFingerprint.fileHashes,
  };
  plan.planDigest = planDigest(plan);
}

function buildNativeAdoptionAssessment(targetPath, goal) {
  if (!goal) {
    return {
      assessment_state: "BLOCKED_MISSING_REQUEST",
      blockers: ["The original natural-language adoption request is required."],
      assessment_digest: evidenceDigest("BLOCKED_MISSING_REQUEST", []),
    };
  }
  const sourceBefore = targetSourceStateDigest(targetPath);
  const native = runReadOnlyAdoptionResolver("resolve-native-migration.mjs", [targetPath, "--json", "--intent", goal]);
  const reconciliation = runReadOnlyAdoptionResolver("resolve-existing-rule-reconciliation.mjs", [targetPath, "--json", "--auto-native", "--intent", goal]);
  const queue = runReadOnlyAdoptionResolver("resolve-work-queue-takeover.mjs", [targetPath, "--json", "--intent", goal]);
  const sourceAfter = targetSourceStateDigest(targetPath);
  const nativeDecisions = Array.isArray(native.humanDecisionsNeeded) ? native.humanDecisionsNeeded : [];
  const userTechnicalDecisionRequired = nativeDecisions.some((item) => {
    const owner = String(item?.owner || "").trim().toLowerCase();
    const status = String(item?.status || "").trim();
    return owner === "user" && !["NO_USER_ACTION", "REAL_WORLD_EFFECT_ONLY"].includes(status);
  });
  const coverage = reconciliation.ruleReconciliationCoverage || {};
  const decision = reconciliation.nativeAdoptionDecision || {};
  const blockers = [];
  if (sourceBefore !== sourceAfter) blockers.push("Read-only adoption assessment changed the target source state.");
  if (native.outcome !== "NATIVE_MIGRATION_PLAN_RECORDED") blockers.push(`Native Migration outcome is ${native.outcome || "missing"}.`);
  if (reconciliation.outcome !== "RECONCILIATION_RECORDED") blockers.push(`Rule Reconciliation outcome is ${reconciliation.outcome || "missing"}.`);
  if (Number(coverage.omittedRules || 0) !== 0 || coverage.blocksSelectedNativeAdoption !== "No") blockers.push("Existing-rule reconciliation is incomplete.");
  if (decision.recommendation !== "SELECTED_NATIVE_ADOPTION" || reconciliation.canRecommendApplyPlanNow !== "Yes") blockers.push("Selected native adoption is not technically ready.");
  if ((reconciliation.conflicts || []).length > 0) blockers.push("Rule reconciliation retains unresolved conflicts.");
  const queueCanBeEstablishedByThisPlan = queue.recommended_action === "ESTABLISH_INTENTOS_WORK_QUEUE"
    && queue.readiness?.takeover_review_ready === "Yes";
  const existingQueueIsAlreadyBound = queue.recommended_action === "MAP_EXISTING_TASK_SYSTEM"
    && queue.readiness?.takeover_ready === "Yes";
  if (!queueCanBeEstablishedByThisPlan && !existingQueueIsAlreadyBound) {
    blockers.push("Work Queue takeover is not ready for an executable adoption plan.");
  }
  if (userTechnicalDecisionRequired) blockers.push("Native Migration still asks the user for a technical decision.");
  const base = {
    schema_version: "1.113.0",
    assessment_state: blockers.length === 0 ? "READY_FOR_REQUEST_BOUND_NATIVE_ADOPTION" : "BLOCKED",
    project_state: native.projectState?.state || "UNKNOWN",
    native_migration: {
      posture: native.posture || "UNKNOWN",
      outcome: native.outcome || "UNKNOWN",
      rule_extraction_coverage: native.ruleExtractionCoverage || [],
      rule_classifications: native.ruleClassifications || [],
      conflicts: native.conflicts || [],
      user_technical_decision_required: userTechnicalDecisionRequired ? "Yes" : "No",
    },
    rule_reconciliation: {
      outcome: reconciliation.outcome || "UNKNOWN",
      coverage,
      recommendation: decision.recommendation || "UNKNOWN",
      migration_depth: decision.migrationDepth || "UNKNOWN",
      conflicts: reconciliation.conflicts || [],
      protected_constraints: reconciliation.protectedConstraints || [],
    },
    work_queue_takeover: {
      outcome: queue.outcome || "UNKNOWN",
      project_task_system_class: queue.project_task_system_class || "UNKNOWN",
      recommended_action: queue.recommended_action || "UNKNOWN",
      future_task_authority: queue.future_task_authority || "UNKNOWN",
      source_inventory: queue.source_inventory || [],
      migration_dispositions: queue.migration_dispositions || [],
      queue_items: queue.queue_items || [],
      readiness: queue.readiness || {},
    },
    source_state_unchanged: sourceBefore === sourceAfter,
    source_state_digest: sourceAfter,
    blockers,
  };
  return { ...base, assessment_digest: evidenceDigest(base, []) };
}

function runReadOnlyAdoptionResolver(scriptName, resolverArgs) {
  const result = spawnSync(process.execPath, [path.join(kitRoot, "scripts", scriptName), ...resolverArgs], {
    cwd: targetPathForResolver(resolverArgs[0]),
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 40,
    timeout: 120000,
  });
  if (result.status !== 0) {
    throw new Error(`${scriptName} failed during native-adoption assessment: ${normalizeOutput(result.stderr || result.stdout)}`);
  }
  try {
    return JSON.parse(result.stdout);
  } catch (error) {
    throw new Error(`${scriptName} returned invalid JSON during native-adoption assessment: ${error.message}`);
  }
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
  return {
    targetExists: fs.existsSync(targetPath),
    ...gitFingerprint(targetPath),
    sourceStateDigest: targetSourceStateDigest(targetPath),
    fileHashes,
  };
}

function targetSourceStateDigest(targetPath) {
  if (!fs.existsSync(targetPath)) return sha256Content("TARGET_MISSING");
  const ignored = [
    ".git/",
    "node_modules/",
    "apply-execution-plans/",
    "approval-records/",
    "release-approval-records/",
    "apply-readiness-reports/",
    "apply-receipts/",
    ".intentos/apply-plans/",
    ".intentos/apply-authorities/",
    ".intentos/backups/",
  ];
  const rows = [];
  const ignoreRelative = (relative) => {
    const normalized = relative.replaceAll(path.sep, "/");
    return ignored.some((prefix) => normalized === prefix.slice(0, -1) || normalized.startsWith(prefix));
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


function attachInitialGoalToPlan(plan, goalProjection, options = {}) {
  const existingAdoption = options.existingAdoption === true;
  const slug = existingAdoption ? "intentos-adoption-goal" : "initial-goal";
  const requestTitle = existingAdoption ? "IntentOS Adoption Goal" : "Initial Product Goal";
  const requestPath = `requests/001-${slug}.md`;
  const queuePath = `work-queue/001-${slug}.md`;
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
  for (const action of plan.actions) delete action.id;
  assignPlanActionIds(plan.actions);
  plan.receiptActionId = plan.actions.find((action) => action.dynamicReceipt)?.id || null;
  plan.targetFingerprint = createTargetFingerprint(plan.targetRoot, plan.actions);
  plan.expectedPreconditions = {
    targetExists: fs.existsSync(plan.targetRoot),
    fileHashes: plan.targetFingerprint.fileHashes,
  };
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
};
