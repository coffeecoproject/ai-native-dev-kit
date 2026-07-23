
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

import {
  createAutomaticRequestBoundApplyContext,
  deriveControlledApplyRecoveryBinding,
  replayApprovedNewProjectPlan,
  replayApprovedPlan,
  transactionSupportActionIds,
  validatePlanForApply,
  verifyCommittedBootstrapInstallation
} from "./apply.mjs";

function writePlan(plan, planPath) {
  if (!fs.existsSync(plan.targetRoot)) {
    throw new Error("--write-plan is read-only and will not create an absent target; use --dry-run or the ordinary controlled init entry");
  }
  if (path.isAbsolute(String(planPath || ""))) throw new Error("--write-plan must use a project-local relative path");
  const fullPath = path.resolve(plan.targetRoot, planPath);
  assertInsideRoot(plan.targetRoot, fullPath, "--write-plan");
  const relative = path.relative(plan.targetRoot, fullPath).split(path.sep).join("/");
  if (!relative.startsWith("apply-execution-plans/") && !relative.startsWith(".intentos/apply-plans/")) {
    throw new Error("--write-plan must stay under apply-execution-plans/ or .intentos/apply-plans/ in the target project");
  }
  assertNoSymlinkInPath(plan.targetRoot, fullPath, "--write-plan");
  if (fs.existsSync(fullPath)) throw new Error(`--write-plan refuses to overwrite existing file: ${relative}`);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${JSON.stringify(plan, null, 2)}\n`, { flag: "wx" });
  console.log(`Wrote init/update plan: ${fullPath}`);
}

async function printPlan(plan) {
  const output = `${JSON.stringify(plan, null, 2)}\n`;
  await new Promise((resolve, reject) => {
    const onError = (error) => {
      process.stdout.off("error", onError);
      reject(error);
    };
    process.stdout.once("error", onError);
    process.stdout.write(output, () => {
      process.stdout.off("error", onError);
      resolve();
    });
  });
}

function workflowNextGate(targetPath) {
  if (!fs.existsSync(targetPath)) return { allowed: true };
  const result = spawnSync(process.execPath, [path.join(kitRoot, "scripts", "workflow-next.mjs"), targetPath, "--json"], {
    encoding: "utf8",
  });
  if (result.status !== 0) {
    return { allowed: false, reason: result.stderr || result.stdout || "workflow-next failed" };
  }
  let parsed;
  try {
    parsed = JSON.parse(result.stdout);
  } catch (error) {
    return { allowed: false, reason: `workflow-next JSON parse failed: ${error.message}` };
  }
  const tags = new Set(parsed.projectStateTags || []);
  const hasVersion = fs.existsSync(path.join(targetPath, ".intentos", "version.json"));
  const isBootstrapped = hasVersion || tags.has("INTENTOS_BOOTSTRAPPED_PROJECT") || tags.has("BOOTSTRAPPED_PROJECT");
  const blocked = parsed.nextAction === "REVIEW_DIRTY_WORKTREE"
    || tags.has("DIRTY_WORKTREE_PROJECT")
    || !isBootstrapped;
  return {
    allowed: !blocked,
    reason: blocked
      ? `workflow-next requires guarded update path: NEXT_ACTION=${parsed.nextAction}, PROJECT_STATE_TAGS=${[...tags].join(", ")}`
      : null,
  };
}

function executeUpdate(targetPath, starter, options = {}) {
  if (options.backupDir) resolveBackupRoot(targetPath, options.backupDir);
  copySharedAssets(targetPath, {
    overwrite: true,
    starter,
    applyPrTemplateGovernance: options.applyPrTemplateGovernance,
    applyAgentGovernance: options.applyAgentGovernance,
    update: true,
    withIndustrialPacks: options.withIndustrialPacks,
    industrialPacks: options.industrialPacks,
    backupDir: options.backupDir,
  });
  writeVersionFile(targetPath, starter, { update: true, backupDir: options.backupDir });
  console.log("");
  console.log(`Updated workflow assets at ${targetPath}`);
  console.log("Updated .intentos/, workflow scripts, workflow CI, missing onboarding docs, missing AGENTS.md, and missing workflow directories.");
  console.log("Industrial pack registry and schemas are updated by default; concrete packs are updated only when already installed, selected, or explicitly requested.");
  console.log("Existing PR templates and AGENTS.md files are left unchanged unless an explicit apply flag is passed; review .intentos/migration-reports/ when present.");
}

function executeInit(targetPath, starter, options = {}) {
  if (options.backupDir) resolveBackupRoot(targetPath, options.backupDir);
  copyDir(path.join(kitRoot, "starters", starter), targetPath, { targetPath, backupDir: options.backupDir });
  copySharedAssets(targetPath, {
    starter,
    withIndustrialPacks: options.withIndustrialPacks,
    industrialPacks: options.industrialPacks,
    backupDir: options.backupDir,
  });
  writeVersionFile(targetPath, starter, {
    backupDir: options.backupDir,
    projectEntryOrigin: "NEW_PROJECT",
  });
  console.log("");
  console.log(`Initialized ${starter} at ${targetPath}`);
  printNextSteps();
}

function executeControlledNewProjectSetup(targetPath, starter, options = {}) {
  const recovery = recoverInterruptedBootstrap(targetPath);
  if (!recovery.ok) throw new Error((recovery.errors || [recovery.state]).join("; "));
  const topology = inspectTargetTopology(targetPath);
  if (!["ABSENT_LEAF", "EMPTY_DIRECTORY"].includes(topology.state)) {
    throw new Error(`Controlled new-project setup requires an absent leaf or empty directory, received ${topology.state}`);
  }
  const goalProjection = projectGoalProjection(
    options.goal || `Create a new ${starter} project named ${path.basename(targetPath)}`,
  );
  const entryTrust = resolveProjectEntryTrust({
    projectRoot: targetPath,
    sourceRoot: kitRoot,
    goal: goalProjection.original_goal,
  });
  const entryGate = requireTrustedProjectEntry(entryTrust, "CONTROLLED_SETUP");
  if (!entryGate.ok) throw new Error(`Project entry trust blocked setup: ${entryGate.errors.join("; ")}`);

  const plan = buildPlan(targetPath, { ...options, starter, update: false });
  attachInitialGoalToPlan(plan, goalProjection);
  const actions = bootstrapActionsFromPlan(plan);
  const canonicalPlanRef = ".intentos/bootstrap-plan.json";
  if (plan.actions.some((action) => action.path === canonicalPlanRef)) {
    throw new Error(`Bootstrap plan path collides with the generated action graph: ${canonicalPlanRef}`);
  }
  const planContent = `${JSON.stringify(plan, null, 2)}\n`;
  const [planAssetId] = transactionSupportActionIds(plan, 1);
  const transactionActions = [
    ...actions,
    {
      id: planAssetId,
      path: canonicalPlanRef,
      content: planContent,
      receiptRequired: false,
    },
  ];
  const requestAuthority = {
    artifact_type: "bootstrap_request_authority",
    target_root: targetPath,
    starter,
    goal_digest: goalProjection.goal_digest,
    execution_intent: goalProjection.execution_intent,
    user_technical_choice_required: "No",
    real_world_effect: "REVERSIBLE_LOCAL_PROJECT_SETUP",
  };
  const readiness = {
    artifact_type: "bootstrap_controlled_readiness",
    entry_trust_digest: entryTrust.entry_trust_digest,
    topology_digest: topology.topology_digest,
    plan_digest: plan.planDigest,
    operation: plan.operation,
    exact_action_ids: actions.map((action) => action.id),
    blockers: [],
  };
  const sourceInventory = plan.actions
    .filter((action) => action.willWrite && !action.dynamicReceipt)
    .map((action) => ({
      id: action.id,
      path: action.path,
      source_ref: action.source || "N/A",
      source_hash: action.sourceHash,
    }));
  const transaction = createBootstrapTransaction({
    topology,
    actions: transactionActions,
    goalDigest: goalProjection.goal_digest,
    planRef: canonicalPlanRef,
    planDigest: plan.planDigest,
    approvalRef: "bootstrap:original-natural-language-request",
    approvalDigest: evidenceDigest(requestAuthority, []),
    readinessRef: "bootstrap:derived-controlled-readiness",
    readinessDigest: evidenceDigest(readiness, []),
    sourceInventoryDigest: evidenceDigest(sourceInventory, []),
  });
  let behavioralActivation = null;
  const result = executeBootstrapTransaction(transaction, {
    verifyActivation: () => verifyProjectLocalBehavioralRoute({
      targetRoot: targetPath,
      sourceRoot: kitRoot,
      goal: goalProjection.original_goal,
      transaction,
      sourceInventory,
      allowProjectLocalExecution: true,
    }),
    finalizeActivation: ({ receipt, verification }) => {
      const applyReceipt = {
        ref: transaction.success_receipt_path,
        digest: receipt.receipt_digest,
        state: receipt.state,
      };
      behavioralActivation = resolveBehavioralAdoptionActivation({
        projectBinding: projectIdentity(targetPath),
        goalDigest: goalProjection.goal_digest,
        applyReceipt,
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
    verifyCommittedInstallation: () => verifyCommittedBootstrapInstallation(targetPath),
  });
  if (result.state !== "APPLY_VERIFIED" || behavioralActivation?.activation_state !== "VERIFIED_ACTIVE") {
    throw new Error(`Controlled setup did not verify: ${[...(result.errors || []), ...(behavioralActivation?.blockers || [])].join("; ") || result.state}`);
  }
  console.log("");
  console.log(`Initialized and verified ${starter} at ${targetPath}`);
  console.log(`Apply receipt: ${path.join(targetPath, transaction.success_receipt_path)}`);
  console.log("IntentOS operating mode: VERIFIED_ACTIVE");
  printNextSteps();
}


function printNextSteps() {
  console.log("Next steps:");
  console.log("1. Tell Codex the product goal in plain language.");
  console.log("2. Codex reads the project, derives the platform and baseline, and prepares any required controlled setup plan.");
  console.log("3. You provide only a missing business fact, product preference, exact real-world consent, or unavailable external fact when one is needed.");
  console.log("4. Codex completes onboarding, builds the first useful slice, runs the required review and verification, and records evidence.");
  console.log("5. Codex reports one plain result: done, limited, blocked, or one decision needed.");
}


const args = parseArgs(process.argv.slice(2));
const target = args.target;
const updateWorkflowAssets = Boolean(args["update-workflow-assets"]);
const applyPrTemplateGovernance = Boolean(args["apply-pr-template-governance"]);
const applyAgentGovernance = Boolean(args["apply-agent-governance"]);
const withIndustrialPacks = Boolean(args["with-industrial-packs"]);
const industrialPacks = args["industrial-packs"] || "";
const profiles = args.profiles || "";
const baselineLevel = args["baseline-level"] || "";
const standardPacks = args["standard-packs"] || "";
const dryRun = Boolean(args["dry-run"]);
const writePlanPath = args["write-plan"];
const applyPlanPath = args["apply-plan"];
const approvalRecordPath = args["approval-record"];
const readinessReportPath = args["readiness-report"];
const backupDir = args["backup-dir"] || "";
const goal = args.goal || "";

if (!target && !applyPlanPath) {
  console.error("Usage: node scripts/init-project.mjs --starter generic-project --target ../my-project");
  console.error("       node scripts/init-project.mjs --starter generic-project --target ../my-project --goal \"build an appointment app\"");
  console.error("       node scripts/init-project.mjs --target ../my-project --update-workflow-assets");
  console.error("       node scripts/init-project.mjs --target ../my-project --update-workflow-assets --dry-run");
  console.error("       node scripts/init-project.mjs --target ../my-project --update-workflow-assets --write-plan apply-execution-plans/init-update-plan.json");
  console.error("       node scripts/init-project.mjs --apply-plan ./apply-execution-plans/init-update-plan.json --approval-record ./approval-records/approval.md --readiness-report ./apply-readiness-reports/readiness.md");
  console.error("       node scripts/init-project.mjs --target ../my-project --update-workflow-assets --industrial-packs web-app-industrial,backend-api-industrial");
  console.error("       node scripts/init-project.mjs --starter codex-web-app --target ../my-project --profiles web-app --baseline-level BL1_STANDARD --write-plan apply-execution-plans/init.json");
  console.error("       node scripts/init-project.mjs --starter codex-web-app --target ../my-project --profiles web-app --baseline-level BL2_INDUSTRIAL --standard-packs web-runtime-standard,environment-standard --industrial-packs web-app-industrial --write-plan apply-execution-plans/init.json");
  console.error("       node scripts/init-project.mjs --target ../my-project --with-industrial-packs");
  console.error("       node scripts/init-project.mjs --target ../my-project --update-workflow-assets --apply-pr-template-governance");
  console.error("       node scripts/init-project.mjs --target ../my-project --update-workflow-assets --apply-agent-governance");
  process.exit(1);
}

if (applyPlanPath) {
  const fullPlanPath = path.resolve(process.cwd(), applyPlanPath);
  if (!fs.existsSync(fullPlanPath)) {
    console.error(`Plan not found: ${fullPlanPath}`);
    process.exit(1);
  }
  let plan;
  try {
    plan = JSON.parse(fs.readFileSync(fullPlanPath, "utf8"));
  } catch (error) {
    console.error(`Plan JSON parse failed: ${error.message}`);
    process.exit(1);
  }
  if (target && path.resolve(process.cwd(), target) !== path.resolve(plan.targetRoot)) {
    console.error(`--target does not match plan targetRoot: ${target} != ${plan.targetRoot}`);
    process.exit(1);
  }
  try {
    assertExistingTargetRootIsSafe(plan.targetRoot);
  } catch (error) {
    console.error(error.message);
    process.exit(2);
  }
  if (approvalRecordPath || readinessReportPath) {
    console.error("Project-local init/update does not accept file-authored HUMAN_APPROVAL or legacy controlled-readiness authority; use the active natural-language request with --goal. Real-world effects require their dedicated consent path.");
    process.exit(2);
  }
  const activeRequest = String(goal || "").trim();
  const activeRequestDigest = activeRequest ? projectGoalProjection(activeRequest).goal_digest : "N/A";
  const activeRequestValidation = validateCurrentRequestForPlan(plan, {
    request: activeRequest,
    requestDigest: activeRequestDigest,
  });
  if (!activeRequestValidation.ok) {
    console.error(`Current request cannot authorize this apply plan: ${activeRequestValidation.errors.join("; ")}`);
    process.exit(2);
  }
  let recoveryBinding = null;
  if (plan.operationKind !== "NEW_BOOTSTRAP") {
    try {
      recoveryBinding = deriveControlledApplyRecoveryBinding(plan, fullPlanPath, {
        activeRequest,
        activeRequestDigest,
      });
    } catch (error) {
      console.error(error.message);
      process.exit(2);
    }
  }
  while (recoveryBinding) {
    let controlledRecovery;
    try {
      controlledRecovery = recoverInterruptedControlledApply(plan.targetRoot, {
        binding: recoveryBinding,
        validateVerifiedReceipt: validateControlledApplyReceipt,
      });
    } catch (error) {
      console.error(`Interrupted controlled apply recovery failed: ${error.message}`);
      process.exit(2);
    }
    if (!controlledRecovery.ok) {
      console.error(`Interrupted controlled apply could not be recovered: ${(controlledRecovery.errors || [controlledRecovery.state]).join("; ")}`);
      process.exit(2);
    }
    if (!controlledRecovery.recovered) break;
    if (controlledRecovery.state === "CONTROLLED_APPLY_SUCCESS_RECOVERED"
      && controlledRecovery.planDigest === plan.planDigest) {
      console.log(`Recovered verified controlled apply: ${path.join(plan.targetRoot, controlledRecovery.receiptPath || plan.receiptPath)}`);
      process.exit(0);
    }
  }
  let planBackupDir;
  let replayContext;
  try {
    planBackupDir = validatePlanForApply(plan, backupDir || null);
    replayContext = {
      ...createAutomaticRequestBoundApplyContext(plan, fullPlanPath, {
        activeRequest,
        activeRequestDigest,
      }),
      backupDir: planBackupDir,
    };
  } catch (error) {
    console.error(error.message);
    process.exit(2);
  }
  try {
    if (plan.operation === "INIT_PROJECT" && plan.arguments?.projectEntryOrigin === "NEW_PROJECT") {
      replayApprovedNewProjectPlan(plan, replayContext);
    } else {
      replayApprovedPlan(plan, replayContext);
    }
  } catch (error) {
    console.error(error.message);
    process.exit(2);
  }
  console.log("");
  console.log(`Applied exact approved init/update action graph: ${fullPlanPath}`);
  console.log(`Apply receipt: ${path.join(plan.targetRoot, plan.receiptPath)}`);
  process.exit(0);
}

const targetPath = path.resolve(process.cwd(), target);
const starter = assertSafeNameSegment(args.starter || readExistingStarter(targetPath) || "generic-project", "starter");
const starterPath = resolveUnderRoot(path.join(kitRoot, "starters"), starter, "starter path");

if (!fs.existsSync(starterPath)) {
  console.error(`Starter not found: ${starterPath}`);
  process.exit(1);
}

if (updateWorkflowAssets && !fs.existsSync(targetPath)) {
  console.error(`Target does not exist for workflow update: ${targetPath}`);
  process.exit(1);
}
try {
  assertExistingTargetRootIsSafe(targetPath);
} catch (error) {
  console.error(error.message);
  process.exit(2);
}

const commonOptions = {
  starter,
  applyPrTemplateGovernance,
  applyAgentGovernance,
  withIndustrialPacks,
  industrialPacks,
  profiles,
  baselineLevel,
  standardPacks,
  backupDir,
  goal,
};

if (dryRun || writePlanPath) {
  let plan;
  try {
    plan = buildPlan(targetPath, {
      ...commonOptions,
      update: updateWorkflowAssets,
    });
    if (plan.operation === "INIT_PROJECT" && plan.arguments?.projectEntryOrigin === "NEW_PROJECT") {
      if (!String(goal || "").trim()) {
        throw new Error("New-project plan-first setup requires --goal with the original natural-language product request");
      }
      attachInitialGoalToPlan(plan, projectGoalProjection(goal));
    }
  } catch (error) {
    console.error(`FAIL ${error.message}`);
    process.exit(2);
  }
  if (dryRun) {
    await printPlan(plan);
    process.exit(0);
  }
  writePlan(plan, writePlanPath);
  process.exit(0);
}

if (updateWorkflowAssets) {
  const gate = workflowNextGate(targetPath);
  console.error(`Workflow update requires the 1.92 plan-first path${gate.reason ? `: ${gate.reason}` : "."}`);
  console.error("Codex must write the exact plan, review its bounded local action graph, then run --apply-plan. IntentOS derives request-bound local authority automatically; only real-world or irreversible effects require separate consent.");
  process.exit(2);
}

if (profiles || baselineLevel || standardPacks || industrialPacks || withIndustrialPacks) {
  console.error("Selected baseline/profile/pack setup requires the controlled plan-first path.");
  console.error("Codex must write and review the exact plan, then run --apply-plan. No technical approval is required from the user for reversible project-local setup.");
  process.exit(2);
}

if (args["force-new-project"]) {
  console.error("--force-new-project was removed because it bypassed project-entry and rollback trust.");
  console.error("Use the ordinary init command; IntentOS now derives and runs the controlled new-project setup automatically.");
  process.exit(2);
}

const interruptedRecovery = recoverInterruptedBootstrap(targetPath);
if (!interruptedRecovery.ok) {
  console.error(`Interrupted project setup could not be recovered: ${(interruptedRecovery.errors || [interruptedRecovery.state]).join("; ")}`);
  process.exit(2);
}

const directTopology = inspectTargetTopology(targetPath);
if (!["ABSENT_LEAF", "EMPTY_DIRECTORY"].includes(directTopology.state)) {
  console.error(`Direct new-project setup is not allowed for ${directTopology.state}.`);
  console.error("IntentOS will treat a non-empty target as an existing project and use read-only adoption assessment before any controlled apply.");
  process.exit(2);
}
if (!String(goal || "").trim()) {
  console.error("IntentOS needs the product goal before creating a project.");
  console.error("Tell Codex what you want the product to do in plain language; no project files were written.");
  process.exit(2);
}
try {
  executeControlledNewProjectSetup(targetPath, starter, commonOptions);
} catch (error) {
  console.error(`Controlled new-project setup failed: ${error.message}`);
  process.exit(2);
}
