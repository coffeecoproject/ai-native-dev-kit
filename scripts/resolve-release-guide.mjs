#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseArgs, unknownOptions } from "./lib/args.mjs";

const __filename = fileURLToPath(import.meta.url);
const scriptDir = path.dirname(__filename);
const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set([
  "json",
  "format",
  "intent",
  "release-target",
  "platform",
  "recipe-id",
  "pack-id",
  "release-owner",
  "approval-ref",
  "approval-status",
  "approval-type",
  "approval-scope",
  "approval-time",
  "allowed-codex-actions",
  "blocked-actions",
  "approval-expiry",
  "evidence-path",
  "verification",
  "launch-view-ref",
  "release-sop",
  "rollback",
  "monitoring",
  "environment",
  "post-launch-smoke",
]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputFormat = args.json ? "json" : String(args.format || "human");

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

if (!new Set(["human", "json"]).has(outputFormat)) {
  console.error(`FAIL unknown --format: ${outputFormat}`);
  process.exit(1);
}

const context = {
  intent: stringArg("intent") || args._[1] || "help me launch",
  releaseTarget: normalizeTarget(stringArg("release-target")),
  platform: stringArg("platform"),
  recipeId: stringArg("recipe-id"),
  packId: stringArg("pack-id"),
  releaseOwner: stringArg("release-owner"),
  approvalRef: stringArg("approval-ref"),
  approvalStatus: normalizeApprovalStatus(stringArg("approval-status")),
  approvalType: stringArg("approval-type"),
  approvalScope: stringArg("approval-scope"),
  approvalTime: stringArg("approval-time"),
  allowedCodexActions: stringArg("allowed-codex-actions"),
  blockedActions: stringArg("blocked-actions"),
  approvalExpiry: stringArg("approval-expiry"),
  evidencePath: stringArg("evidence-path") || "release-guides",
  verification: stringArg("verification"),
  launchViewRef: stringArg("launch-view-ref"),
  releaseSop: stringArg("release-sop"),
  rollback: stringArg("rollback"),
  monitoring: stringArg("monitoring"),
  environment: stringArg("environment"),
  postLaunchSmoke: stringArg("post-launch-smoke"),
};

const report = buildReleaseGuide(projectRoot, context);
if (outputFormat === "json") console.log(JSON.stringify(report, null, 2));
else printHuman(report);

function buildReleaseGuide(root, options) {
  const adapter = resolveAdapter(root, options);
  const recipe = resolveRecipe(root, options);
  const launchReview = resolveLaunchReview(root, options);
  const approval = resolveStructuredApproval(root, options);
  const evidenceQuality = buildEvidenceQuality(options, launchReview, approval);
  const releaseTarget = options.releaseTarget || adapter.recommendedTarget || "PREVIEW_OR_TEST";
  const assistLevel = assistLevelFor(releaseTarget);
  let route = chooseRoute(adapter, recipe, launchReview, approval, evidenceQuality);
  const handoff = shouldResolveHandoff(route)
    ? resolveHandoff(root, options, recipe)
    : deferredHandoff(route);
  if (route.state === "READY_FOR_RELEASE_EXECUTION_PLAN" && handoff.status !== "READY") {
    route = routeValue("NEEDS_RELEASE_HANDOFF", "RELEASE_HANDOFF_PACK", "NEEDS_RELEASE_HANDOFF");
  }
  const safeNextStep = nextStepFor(route, adapter, launchReview, approval, evidenceQuality);
  const commandRisk = commandRiskClassification();

  return {
    reportType: "RELEASE_GUIDE_CARD",
    generatedBy: "scripts/resolve-release-guide.mjs",
    generatedAt: new Date().toISOString(),
    projectRoot: root,
    readOnly: true,
    humanSummary: {
      guideState: route.state,
      recommendedRoute: route.recommendedRoute,
      releaseTarget,
      assistLevel,
      safeNextStep,
    },
    beginnerReleaseGuideCard: beginnerCard(route, adapter, recipe, launchReview, approval, evidenceQuality, safeNextStep),
    releaseGuideRouting: routingRows(adapter, recipe, handoff, launchReview, approval, route),
    platformReleaseRecipe: recipeRows(recipe),
    releaseHandoffPack: handoffRows(handoff),
    structuredReleaseApprovalGate: approvalRows(approval),
    assistLevelClassification: assistLevelRows(assistLevel),
    commandRiskClassification: commandRisk,
    evidenceQualityMap: evidenceQuality,
    internalRouting: [
      { input: "Release Adapter", ref: adapter.ref },
      { input: "Platform Release Recipe", ref: recipe.ref },
      { input: "Release Handoff Pack", ref: handoff.ref },
      { input: "Launch Review View", ref: launchReview.ref },
      { input: "Release Execution", ref: "scripts/resolve-release-execution.mjs" },
    ],
    releaseExecutionBridge: releaseBridgeRows(options, recipe, releaseTarget, handoff),
    boundaries: {
      approvesRelease: "No",
      deploysOrPublishesByItself: "No",
      asksForOrStoresSecrets: "No",
      treatsFreeFormApprovalAsReleaseApproval: "No",
      treatsBeginnerConfirmationAsProductionApproval: "No",
      changesCiHooksDnsPaymentPermissionsAppStoreMiniProgramOrProductionConfig: "No",
      makesCodexReleaseOwner: "No",
    },
    outcome: route.outcome,
  };
}

function shouldResolveHandoff(route) {
  return new Set(["READY_FOR_RELEASE_EXECUTION_PLAN"]).has(route.state);
}

function deferredHandoff(route) {
  return {
    status: "DEFERRED",
    packId: "N/A",
    executionLevel: "N/A",
    handoffState: "DEFERRED_UNTIL_RELEASE_GUIDE_READY",
    releaseOwner: "N/A",
    ref: "deferred:release-handoff-pack",
    reason: `Release Handoff Pack will be generated after ${route.recommendedRoute} is resolved.`,
  };
}

function resolveRecipe(root, options) {
  const command = [
    path.join(scriptDir, "resolve-platform-release-recipe.mjs"),
    root,
    "--intent",
    options.intent,
    "--json",
  ];
  if (options.platform) command.push("--platform", options.platform);
  if (options.recipeId) command.push("--recipe-id", options.recipeId);
  if (options.releaseTarget) command.push("--release-target", options.releaseTarget);
  const result = spawnSync(process.execPath, command, { encoding: "utf8" });
  if (result.status !== 0) {
    return {
      status: "MISSING",
      selectedRecipeId: "N/A",
      recipeStatus: "N/A",
      platformFamily: "N/A",
      selectionConfidence: "LOW",
      safeFirstTarget: "N/A",
      ref: "scripts/resolve-platform-release-recipe.mjs",
      reason: result.stderr || result.stdout || "Platform Release Recipe could not be resolved.",
    };
  }
  try {
    const parsed = JSON.parse(result.stdout);
    const summary = parsed.humanSummary || {};
    return {
      status: summary.recipeStatus === "STRICT" ? "PASS" : "NEEDS_CONFIRMATION",
      selectedRecipeId: summary.selectedRecipeId || "N/A",
      recipeStatus: summary.recipeStatus || "N/A",
      platformFamily: summary.platformFamily || "N/A",
      selectionConfidence: summary.selectionConfidence || "LOW",
      safeFirstTarget: summary.safeFirstTarget || "N/A",
      ref: "generated:resolve-platform-release-recipe",
      reason: summary.why || "Platform Release Recipe generated.",
    };
  } catch (error) {
    return {
      status: "MISSING",
      selectedRecipeId: "N/A",
      recipeStatus: "N/A",
      platformFamily: "N/A",
      selectionConfidence: "LOW",
      safeFirstTarget: "N/A",
      ref: "scripts/resolve-platform-release-recipe.mjs",
      reason: `Platform Release Recipe JSON could not be parsed: ${error.message}`,
    };
  }
}

function resolveHandoff(root, options, recipe) {
  const command = [
    path.join(scriptDir, "resolve-release-handoff-pack.mjs"),
    root,
    "--intent",
    options.intent,
    "--json",
  ];
  if (options.platform) command.push("--platform", options.platform);
  if (options.recipeId || recipe.selectedRecipeId) command.push("--recipe-id", options.recipeId || recipe.selectedRecipeId);
  if (options.packId) command.push("--pack-id", options.packId);
  if (options.releaseTarget) command.push("--release-target", options.releaseTarget);
  if (options.releaseOwner) command.push("--release-owner", options.releaseOwner);
  if (options.approvalRef) command.push("--approval-ref", options.approvalRef);
  if (options.approvalStatus) command.push("--approval-status", options.approvalStatus);
  if (options.approvalType) command.push("--approval-type", options.approvalType);
  if (options.approvalScope) command.push("--approval-scope", options.approvalScope);
  if (options.approvalTime) command.push("--approval-time", options.approvalTime);
  if (options.allowedCodexActions) command.push("--allowed-codex-actions", options.allowedCodexActions);
  if (options.blockedActions) command.push("--blocked-actions", options.blockedActions);
  if (options.approvalExpiry) command.push("--approval-expiry", options.approvalExpiry);
  if (options.evidencePath) command.push("--evidence-path", options.evidencePath);
  if (options.releaseSop) command.push("--release-sop", options.releaseSop);
  if (options.rollback) command.push("--rollback", options.rollback);
  if (options.monitoring) command.push("--monitoring", options.monitoring);
  if (options.environment) command.push("--environment", options.environment);
  if (options.postLaunchSmoke) command.push("--post-launch-smoke", options.postLaunchSmoke);
  const result = spawnSync(process.execPath, command, { encoding: "utf8" });
  if (result.status !== 0) {
    return {
      status: "MISSING",
      packId: "N/A",
      executionLevel: "N/A",
      handoffState: "BLOCKED",
      releaseOwner: "N/A",
      ref: "scripts/resolve-release-handoff-pack.mjs",
      reason: result.stderr || result.stdout || "Release Handoff Pack could not be resolved.",
    };
  }
  try {
    const parsed = JSON.parse(result.stdout);
    const summary = parsed.humanSummary || {};
    return {
      status: summary.handoffState === "READY_FOR_HANDOFF_REVIEW" ? "READY" : "BLOCKED",
      packId: summary.packId || "N/A",
      executionLevel: summary.executionLevel || "N/A",
      handoffState: summary.handoffState || "N/A",
      releaseOwner: summary.releaseOwner || "N/A",
      ref: "generated:resolve-release-handoff-pack",
      reason: summary.safeNextStep || "Release Handoff Pack generated.",
    };
  } catch (error) {
    return {
      status: "MISSING",
      packId: "N/A",
      executionLevel: "N/A",
      handoffState: "BLOCKED",
      releaseOwner: "N/A",
      ref: "scripts/resolve-release-handoff-pack.mjs",
      reason: `Release Handoff Pack JSON could not be parsed: ${error.message}`,
    };
  }
}

function resolveAdapter(root, options) {
  const command = [
    path.join(scriptDir, "resolve-release-adapter.mjs"),
    root,
    "--intent",
    options.intent,
    "--json",
  ];
  if (options.releaseTarget) command.push("--release-target", options.releaseTarget);
  if (options.releaseOwner) command.push("--release-owner", options.releaseOwner);
  if (options.releaseSop) command.push("--sop-ref", options.releaseSop);
  if (options.environment) command.push("--environment-ref", options.environment);
  if (options.rollback) command.push("--rollback-ref", options.rollback);
  if (options.monitoring) command.push("--monitoring-ref", options.monitoring);
  const result = spawnSync(process.execPath, command, { encoding: "utf8" });
  if (result.status !== 0) {
    return {
      status: "BLOCKED",
      adapterState: "BLOCKED_BY_MISSING_RELEASE_PATH",
      recommendedTarget: options.releaseTarget || "PREVIEW_OR_TEST",
      ref: "scripts/resolve-release-adapter.mjs",
      reason: result.stderr || result.stdout || "Release Adapter could not be resolved.",
    };
  }
  try {
    const parsed = JSON.parse(result.stdout);
    return {
      status: parsed.humanSummary?.adapterState === "READY_FOR_RELEASE_EXECUTION_PLAN" ? "PASS" : "NEEDS_INPUT",
      adapterState: parsed.humanSummary?.adapterState || "NEEDS_BEGINNER_RELEASE_DECISION",
      recommendedTarget: parsed.humanSummary?.recommendedTarget || options.releaseTarget || "PREVIEW_OR_TEST",
      ref: "generated:resolve-release-adapter",
      reason: parsed.humanSummary?.why || "Release Adapter generated.",
    };
  } catch (error) {
    return {
      status: "BLOCKED",
      adapterState: "BLOCKED_BY_MISSING_RELEASE_PATH",
      recommendedTarget: options.releaseTarget || "PREVIEW_OR_TEST",
      ref: "scripts/resolve-release-adapter.mjs",
      reason: `Release Adapter JSON could not be parsed: ${error.message}`,
    };
  }
}

function resolveLaunchReview(root, options) {
  if (options.launchViewRef) {
    const resolved = resolveRef(root, options.launchViewRef);
    if (resolved) {
      const content = fs.readFileSync(path.join(root, resolved), "utf8");
      const label = tableValue(content, "Safe Launch Label") || "NOT_READY";
      const canProceed = tableValue(content, "Launch review can proceed") || "No";
      return {
        status: label === "READY_FOR_RELEASE_REVIEW" && canProceed === "Yes" ? "PASS" : "NEEDS_INPUT",
        safeLaunchLabel: label,
        launchReviewCanProceed: canProceed,
        ref: resolved,
        reason: tableValue(content, "Plain reason") || "Recorded Launch Review View supplied.",
      };
    }
    return {
      status: "MISSING",
      safeLaunchLabel: "BLOCKED",
      launchReviewCanProceed: "No",
      ref: options.launchViewRef,
      reason: "Launch Review View ref does not resolve.",
    };
  }

  const command = [
    path.join(scriptDir, "resolve-launch-review-view.mjs"),
    root,
    "--intent",
    options.intent,
    "--verification",
    options.verification || "",
    "--json",
  ];
  if (options.releaseOwner) command.push("--release-owner", options.releaseOwner);
  if (options.rollback) command.push("--rollback", options.rollback);
  if (options.monitoring) command.push("--monitoring", options.monitoring);
  if (options.environment) command.push("--environment", options.environment);
  if (options.postLaunchSmoke) command.push("--post-launch-smoke", options.postLaunchSmoke);
  const result = spawnSync(process.execPath, command, { encoding: "utf8" });
  if (result.status !== 0) {
    return {
      status: "BLOCKED",
      safeLaunchLabel: "BLOCKED",
      launchReviewCanProceed: "No",
      ref: "scripts/resolve-launch-review-view.mjs",
      reason: result.stderr || result.stdout || "Launch Review View could not be resolved.",
    };
  }
  try {
    const parsed = JSON.parse(result.stdout);
    const label = parsed.safeLaunchView?.safeLaunchLabel || "NOT_READY";
    const canProceed = parsed.safeLaunchView?.launchReviewCanProceed || "No";
    return {
      status: label === "READY_FOR_RELEASE_REVIEW" && canProceed === "Yes" ? "PASS" : "NEEDS_INPUT",
      safeLaunchLabel: label,
      launchReviewCanProceed: canProceed,
      ref: "generated:resolve-launch-review-view",
      reason: parsed.safeLaunchView?.plainReason || parsed.humanSummary?.why || "Launch Review View generated.",
    };
  } catch (error) {
    return {
      status: "BLOCKED",
      safeLaunchLabel: "BLOCKED",
      launchReviewCanProceed: "No",
      ref: "scripts/resolve-launch-review-view.mjs",
      reason: `Launch Review View JSON could not be parsed: ${error.message}`,
    };
  }
}

function resolveStructuredApproval(root, options) {
  const fromArgs = {
    approvalType: options.approvalType,
    approvalStatus: options.approvalStatus,
    releaseTarget: options.releaseTarget,
    approvedScope: options.approvalScope,
    approvedBy: options.releaseOwner,
    approvalTime: options.approvalTime,
    allowedCodexActions: options.allowedCodexActions,
    blockedActions: options.blockedActions,
    evidencePath: options.evidencePath,
    expiry: options.approvalExpiry,
    ref: options.approvalRef || "N/A",
  };

  if (!options.approvalRef) return normalizeApproval(fromArgs);
  const resolved = resolveRef(root, options.approvalRef);
  if (!resolved) return normalizeApproval({ ...fromArgs, approvalStatus: "MISSING", ref: options.approvalRef });

  const content = fs.readFileSync(path.join(root, resolved), "utf8");
  return normalizeApproval({
    approvalType: tableValue(content, "Approval Type") || fromArgs.approvalType,
    approvalStatus: tableValue(content, "Approval Status") || fromArgs.approvalStatus,
    releaseTarget: tableValue(content, "Release Target") || fromArgs.releaseTarget,
    approvedScope: tableValue(content, "Approved Scope") || tableValue(content, "Scope") || fromArgs.approvedScope,
    approvedBy: tableValue(content, "Approved By") || tableValue(content, "Release Owner") || fromArgs.approvedBy,
    approvalTime: tableValue(content, "Approval Time") || fromArgs.approvalTime,
    allowedCodexActions: tableValue(content, "Allowed Codex Actions") || fromArgs.allowedCodexActions,
    blockedActions: tableValue(content, "Blocked Actions") || fromArgs.blockedActions,
    evidencePath: tableValue(content, "Evidence Path") || fromArgs.evidencePath,
    expiry: tableValue(content, "Expiry / Reconfirm By") || tableValue(content, "Expiry") || fromArgs.expiry,
    ref: resolved,
  });
}

function normalizeApproval(input) {
  const approval = {
    approvalType: input.approvalType || "MISSING",
    approvalStatus: normalizeApprovalStatus(input.approvalStatus),
    releaseTarget: input.releaseTarget || "N/A",
    approvedScope: input.approvedScope || "N/A",
    approvedBy: input.approvedBy || "N/A",
    approvalTime: input.approvalTime || "N/A",
    allowedCodexActions: input.allowedCodexActions || "N/A",
    blockedActions: input.blockedActions || "N/A",
    evidencePath: input.evidencePath || "N/A",
    expiry: input.expiry || "N/A",
    ref: input.ref || "N/A",
  };
  const required = [
    approval.approvalType === "RELEASE_APPROVAL",
    approval.approvalStatus === "APPROVED",
    isConcrete(approval.releaseTarget),
    isConcrete(approval.approvedScope),
    isConcrete(approval.approvedBy),
    isConcrete(approval.approvalTime),
    isConcrete(approval.allowedCodexActions),
    isConcrete(approval.blockedActions),
    isConcrete(approval.evidencePath),
    isConcrete(approval.expiry),
  ];
  approval.structured = required.every(Boolean) ? "Yes" : "No";
  return approval;
}

function buildEvidenceQuality(options, launchReview, approval) {
  return [
    evidence("Release owner", options.releaseOwner || approval.approvedBy, "Named owner or external release system."),
    evidence("Rollback", options.rollback, "Path, owner, and restoration condition."),
    evidence("Monitoring", options.monitoring, "Dashboard/log/check path and owner."),
    evidence("Environment", options.environment, "Target environment and non-secret setup reference."),
    evidence("Post-launch smoke", options.postLaunchSmoke, "Target level: local / preview / staging / production."),
    evidence("Approval", approval.structured === "Yes" ? approval.ref : "", "Structured release approval record."),
    evidence("Launch Review View", launchReview.status === "PASS" ? launchReview.ref : "", "READY_FOR_RELEASE_REVIEW with proceed=Yes."),
  ];
}

function chooseRoute(adapter, recipe, launchReview, approval, evidenceQuality) {
  if (adapter.status === "BLOCKED") {
    return routeValue("BLOCKED_RELEASE_PATH", "RELEASE_ADAPTER", "BLOCKED_RELEASE_PATH");
  }
  if (adapter.status !== "PASS") {
    return routeValue("NEEDS_RELEASE_ADAPTER", "RELEASE_ADAPTER", "NEEDS_RELEASE_ADAPTER");
  }
  if (recipe.status !== "PASS") {
    return routeValue("NEEDS_PLATFORM_RELEASE_RECIPE", "PLATFORM_RELEASE_RECIPE", "NEEDS_PLATFORM_RELEASE_RECIPE");
  }
  if (launchReview.status !== "PASS") {
    return routeValue("NEEDS_LAUNCH_REVIEW", "LAUNCH_REVIEW_VIEW", "NEEDS_LAUNCH_REVIEW");
  }
  if (approval.structured !== "Yes") {
    return routeValue("NEEDS_STRUCTURED_RELEASE_APPROVAL", "STRUCTURED_RELEASE_APPROVAL", "NEEDS_STRUCTURED_RELEASE_APPROVAL");
  }
  const missingEvidence = evidenceQuality.filter((item) => item.status !== "PASS");
  if (missingEvidence.length > 0) {
    return routeValue("NEEDS_RELEASE_EVIDENCE_QUALITY", "RELEASE_GUIDE_EVIDENCE", "NEEDS_RELEASE_EVIDENCE_QUALITY");
  }
  return routeValue("READY_FOR_RELEASE_EXECUTION_PLAN", "RELEASE_EXECUTION_PROTOCOL", "READY_FOR_RELEASE_EXECUTION_PLAN");
}

function routeValue(state, recommendedRoute, outcome) {
  return { state, recommendedRoute, outcome };
}

function nextStepFor(routeValue, adapter, launchReview, approval, evidenceQuality) {
  if (routeValue.state === "NEEDS_RELEASE_ADAPTER") {
    return "Codex should inspect the Release Adapter output and select the safest first release target.";
  }
  if (routeValue.state === "NEEDS_PLATFORM_RELEASE_RECIPE") {
    return "Codex should select and verify the matching platform release recipe before generating a handoff pack.";
  }
  if (routeValue.state === "NEEDS_LAUNCH_REVIEW") {
    return `Close Launch Review gaps before release approval. Current launch label: ${launchReview.safeLaunchLabel}.`;
  }
  if (routeValue.state === "NEEDS_STRUCTURED_RELEASE_APPROVAL") {
    return "Codex should prepare the exact release action, evidence, and rollback, then request current-user consent to that concrete effect.";
  }
  if (routeValue.state === "NEEDS_RELEASE_EVIDENCE_QUALITY") {
    const missing = evidenceQuality.filter((item) => item.status !== "PASS").map((item) => item.evidence).join(", ");
    return `Improve release evidence quality before execution planning: ${missing}.`;
  }
  if (routeValue.state === "READY_FOR_RELEASE_EXECUTION_PLAN") {
    return "Codex should prepare a Release Execution Plan; external actions remain blocked until exact current-user consent and strict gates pass.";
  }
  if (routeValue.state === "NEEDS_RELEASE_HANDOFF") {
    return "Prepare a Release Handoff Pack first; execution planning must consume handoff facts instead of redefining them.";
  }
  return adapter.reason || "Release path is blocked until project release inputs are clarified.";
}

function beginnerCard(routeValue, adapter, recipe, launchReview, approval, evidenceQuality, safeNextStep) {
  return {
    recommendedSafeNextStep: safeNextStep,
    whatIFound: [
      `Release Adapter state: ${adapter.adapterState}.`,
      `Platform recipe: ${recipe.selectedRecipeId} (${recipe.recipeStatus}, confidence ${recipe.selectionConfidence}).`,
      `Release handoff: ${routeValue.state === "READY_FOR_RELEASE_EXECUTION_PLAN" ? "ready to generate" : `deferred until ${routeValue.recommendedRoute} is resolved`}.`,
      `Launch Review label: ${launchReview.safeLaunchLabel}.`,
      `Structured approval: ${approval.structured}.`,
      `Missing evidence quality: ${evidenceQuality.filter((item) => item.status !== "PASS").map((item) => item.evidence).join(", ") || "none"}.`,
    ],
    questions: [],
    codexCanPrepare: [
      "Release Adapter review.",
      "Platform Release Recipe selection.",
      "Launch Review gap summary.",
      "Exact current-user consent record for the concrete release effect when it is ready.",
      "PLAN_ONLY Release Execution bridge.",
    ],
    codexMustNotDo: [
      "Deploy production, publish previews, or submit app-store/mini-program review by itself.",
      "Ask for or store secrets.",
      "Run provider API, upload, remote-state mutation, or CI/CD-triggering commands unless explicitly classified and approved.",
    ],
  };
}

function routingRows(adapter, recipe, handoff, launchReview, approval, routeValue) {
  return [
    stage("Release Adapter", adapter.status, adapter.ref, adapter.reason),
    stage("Platform Release Recipe", recipe.status, recipe.ref, recipe.reason),
    stage("Release Handoff Pack", handoff.status, handoff.ref, handoff.reason),
    stage("Launch Review View", launchReview.status, launchReview.ref, launchReview.reason),
    stage("Structured Release Approval", approval.structured === "Yes" ? "PASS" : "MISSING", approval.ref, approval.structured === "Yes" ? "Structured approval is complete." : "Structured target/scope/owner/actions/evidence/expiry required."),
    stage("Release Execution Protocol", routeValue.state === "READY_FOR_RELEASE_EXECUTION_PLAN" ? "READY" : "PLAN_ONLY", "scripts/resolve-release-execution.mjs", "No real release action is approved by Release Guide."),
  ];
}

function recipeRows(recipe) {
  return [
    field("Selected Recipe", code(recipe.selectedRecipeId)),
    field("Recipe Status", code(recipe.recipeStatus)),
    field("Platform Family", code(recipe.platformFamily)),
    field("Selection Confidence", code(recipe.selectionConfidence)),
    field("Safe First Target", code(recipe.safeFirstTarget)),
    field("Ref", recipe.ref),
    field("Notes", recipe.reason),
  ];
}

function handoffRows(handoff) {
  return [
    field("Pack ID", code(handoff.packId)),
    field("Status", code(handoff.status)),
    field("Execution Level", code(handoff.executionLevel)),
    field("Handoff State", code(handoff.handoffState)),
    field("Release Owner", handoff.releaseOwner),
    field("Ref", handoff.ref),
    field("Notes", `${handoff.reason} Ready means handoff review only, not release approval.`),
  ];
}

function approvalRows(approval) {
  return [
    field("Approval Type", code(approval.approvalType)),
    field("Approval Status", code(approval.approvalStatus)),
    field("Release Target", approval.releaseTarget),
    field("Approved Scope", approval.approvedScope),
    field("Approved By", approval.approvedBy),
    field("Approval Time", approval.approvalTime),
    field("Allowed Codex Actions", approval.allowedCodexActions),
    field("Blocked Actions", approval.blockedActions),
    field("Evidence Path", approval.evidencePath),
    field("Expiry / Reconfirm By", approval.expiry),
  ];
}

function assistLevelRows(selected) {
  return [
    assist("LOCAL_ASSIST", "CODEX_MAY_RUN_AFTER_APPROVAL", selected === "LOCAL_ASSIST" ? "SELECTED" : "AVAILABLE", "Local read/build/test only."),
    assist("PREVIEW_ASSIST", "HUMAN_OR_EXTERNAL_SYSTEM", selected === "PREVIEW_ASSIST" ? "SELECTED" : "CONDITIONAL", "Preview deploy mutates remote state unless prepare-only."),
    assist("STAGING_HANDOFF", "HUMAN_OR_EXTERNAL_SYSTEM", selected === "STAGING_HANDOFF" ? "SELECTED" : "HANDOFF", "Staging release action."),
    assist("PRODUCTION_HANDOFF", "HUMAN_OR_EXTERNAL_SYSTEM", selected === "PRODUCTION_HANDOFF" ? "SELECTED" : "HANDOFF", "Production/store/review/migration action."),
  ];
}

function commandRiskClassification() {
  return [
    risk("NO_RUN", "HUMAN_OR_EXTERNAL_SYSTEM", "DEFAULT", "Unknown commands default here."),
    risk("LOCAL_READ_ONLY", "CODEX_MAY_RUN_AFTER_APPROVAL", "CONDITIONAL", "Local read-only checks."),
    risk("LOCAL_BUILD", "CODEX_MAY_RUN_AFTER_APPROVAL", "CONDITIONAL", "Local build without upload/publish."),
    risk("LOCAL_TEST", "CODEX_MAY_RUN_AFTER_APPROVAL", "CONDITIONAL", "Local tests without remote writes."),
    risk("PREVIEW_PREPARE", "CODEX_MAY_PREPARE", "CONDITIONAL", "Prepare instructions/artifacts only."),
    risk("PREVIEW_EXECUTE_BY_HUMAN", "HUMAN_OR_EXTERNAL_SYSTEM", "HANDOFF", "Preview deploy or upload mutates remote state."),
    risk("PRODUCTION_HANDOFF_ONLY", "HUMAN_OR_EXTERNAL_SYSTEM", "HANDOFF", "Production, stores, migrations, DNS, payment, permissions, config."),
  ];
}

function evidence(name, ref, requirement) {
  return {
    evidence: name,
    status: isConcrete(ref) ? "PASS" : "MISSING",
    ref: isConcrete(ref) ? ref : "N/A",
    qualityRequirement: requirement,
  };
}

function assist(level, owner, status, notes) {
  return { level, owner, status, notes };
}

function risk(commandClass, owner, status, notes) {
  return { commandClass, owner, status, notes };
}

function stage(stageValue, status, ref, notes) {
  return { stage: stageValue, status, ref: ref || "N/A", notes: notes || "N/A" };
}

function field(fieldValue, value) {
  return { field: fieldValue, value: value || "N/A" };
}

function releaseBridgeRows(options, recipe, releaseTarget, handoff) {
  if (handoff.status === "DEFERRED") {
    return [
      `# release-handoff deferred: ${handoff.reason}`,
      "# release-execution deferred until a handoff pack exists",
    ];
  }
  return [
    `node scripts/cli.mjs release-handoff . --intent "${options.intent}" --recipe-id ${recipe.selectedRecipeId} --release-target ${releaseTarget}`,
    `node scripts/cli.mjs release-execution . --intent "prepare release execution" --mode PLAN_ONLY`,
  ];
}

function printHuman(report) {
  console.log("# Release Guide Card");
  console.log("");
  console.log("## Human Summary");
  printTable(["Field", "Value"], [
    ["Guide State", code(report.humanSummary.guideState)],
    ["Recommended Route", code(report.humanSummary.recommendedRoute)],
    ["Release Target", code(report.humanSummary.releaseTarget)],
    ["Assist Level", code(report.humanSummary.assistLevel)],
    ["Safe Next Step", report.humanSummary.safeNextStep],
  ]);
  console.log("");

  console.log("## Beginner Release Guide Card");
  console.log("");
  console.log(`Recommended safe next step: ${report.beginnerReleaseGuideCard.recommendedSafeNextStep}`);
  console.log("");
  console.log("What I found:");
  console.log("");
  for (const item of report.beginnerReleaseGuideCard.whatIFound) console.log(`- ${item}`);
  console.log("");
  console.log("What I need from you:");
  console.log("");
  for (const item of report.beginnerReleaseGuideCard.questions) console.log(`- ${item}`);
  console.log("");
  console.log("What Codex can prepare:");
  console.log("");
  for (const item of report.beginnerReleaseGuideCard.codexCanPrepare) console.log(`- ${item}`);
  console.log("");
  console.log("What Codex must not do:");
  console.log("");
  for (const item of report.beginnerReleaseGuideCard.codexMustNotDo) console.log(`- ${item}`);
  console.log("");

  console.log("## Release Guide Routing");
  printTable(["Stage", "Status", "Ref", "Notes"], report.releaseGuideRouting.map((item) => [item.stage, code(item.status), item.ref, item.notes]));
  console.log("");

  console.log("## Platform Release Recipe");
  printTable(["Field", "Value"], report.platformReleaseRecipe.map((item) => [item.field, item.value]));
  console.log("");

  console.log("## Release Handoff Pack");
  printTable(["Field", "Value"], report.releaseHandoffPack.map((item) => [item.field, item.value]));
  console.log("");

  console.log("## Structured Release Approval Gate");
  printTable(["Field", "Value"], report.structuredReleaseApprovalGate.map((item) => [item.field, item.value]));
  console.log("");

  console.log("## Assist Level Classification");
  printTable(["Level", "Owner", "Status", "Notes"], report.assistLevelClassification.map((item) => [code(item.level), code(item.owner), code(item.status), item.notes]));
  console.log("");

  console.log("## Command Risk Classification");
  printTable(["Command Class", "Owner", "Status", "Notes"], report.commandRiskClassification.map((item) => [code(item.commandClass), code(item.owner), code(item.status), item.notes]));
  console.log("");

  console.log("## Evidence Quality Map");
  printTable(["Evidence", "Status", "Ref", "Quality Requirement"], report.evidenceQualityMap.map((item) => [item.evidence, code(item.status), item.ref, item.qualityRequirement]));
  console.log("");

  console.log("## Internal Routing");
  printTable(["Input", "Ref"], report.internalRouting.map((item) => [item.input, item.ref]));
  console.log("");

  console.log("## Release Execution Bridge");
  console.log("");
  console.log("```bash");
  for (const command of report.releaseExecutionBridge) console.log(command);
  console.log("```");
  console.log("");

  console.log("## Boundaries");
  console.log("");
  console.log(`- This guide approves release: ${report.boundaries.approvesRelease}`);
  console.log(`- This guide deploys or publishes by itself: ${report.boundaries.deploysOrPublishesByItself}`);
  console.log(`- This guide asks for or stores secrets: ${report.boundaries.asksForOrStoresSecrets}`);
  console.log(`- This guide treats free-form approval text as release approval: ${report.boundaries.treatsFreeFormApprovalAsReleaseApproval}`);
  console.log(`- This guide treats beginner confirmation as production approval: ${report.boundaries.treatsBeginnerConfirmationAsProductionApproval}`);
  console.log(`- This guide changes CI/CD, hooks, DNS, payment, permissions, app-store state, mini-program state, or production config: ${report.boundaries.changesCiHooksDnsPaymentPermissionsAppStoreMiniProgramOrProductionConfig}`);
  console.log(`- This guide makes Codex the release owner: ${report.boundaries.makesCodexReleaseOwner}`);
  console.log("");

  console.log("## Outcome");
  console.log("");
  console.log(code(report.outcome));
}

function printTable(headers, rows) {
  console.log(`| ${headers.join(" | ")} |`);
  console.log(`|${headers.map(() => "---").join("|")}|`);
  for (const rowItems of rows) console.log(`| ${rowItems.map((item) => String(item || "N/A")).join(" | ")} |`);
}

function tableValue(content, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`\\|\\s*${escaped}\\s*\\|\\s*([^|]+?)\\s*\\|`, "i");
  const match = content.match(regex);
  return match ? stripCode(match[1].trim()) : "";
}

function stripCode(value) {
  return String(value || "").replace(/^`|`$/g, "").trim();
}

function resolveRef(root, ref) {
  if (!ref || ref === "N/A" || /^generated:/.test(ref)) return "";
  const normalized = path.normalize(ref);
  if (path.isAbsolute(normalized) || normalized.startsWith("..")) return "";
  const full = path.join(root, normalized);
  return fs.existsSync(full) && fs.statSync(full).isFile() ? normalized.replaceAll(path.sep, "/") : "";
}

function normalizeTarget(value) {
  const normalized = String(value || "").trim().toUpperCase().replace(/-/g, "_");
  const targets = new Set(["PREVIEW_OR_TEST", "STAGING_OR_INTERNAL", "PRODUCTION_REVIEW", "APP_OR_MINI_PROGRAM_REVIEW", "PAUSE", "PRODUCTION", "STAGING", "PREVIEW", "APP_STORE", "MINI_PROGRAM_REVIEW"]);
  return targets.has(normalized) ? normalized : "";
}

function normalizeApprovalStatus(value) {
  const normalized = String(value || "").trim().toUpperCase();
  if (["APPROVED", "REJECTED", "PENDING", "MISSING"].includes(normalized)) return normalized;
  return value ? "PENDING" : "MISSING";
}

function assistLevelFor(target) {
  if (/PRODUCTION|APP_STORE|MINI_PROGRAM|REVIEW/.test(target) && target !== "PREVIEW_OR_TEST") return "PRODUCTION_HANDOFF";
  if (/STAGING/.test(target)) return "STAGING_HANDOFF";
  if (/PREVIEW|TEST/.test(target)) return "PREVIEW_ASSIST";
  return "LOCAL_ASSIST";
}

function isConcrete(value) {
  const text = String(value || "").trim();
  return Boolean(text) && !/^(N\/A|NA|TBD|TODO|PENDING|MISSING|<[^>]+>)$/i.test(text);
}

function stringArg(name) {
  const value = args[name];
  if (Array.isArray(value)) return String(value[value.length - 1] || "").trim();
  if (value === true || value === undefined || value === null) return "";
  return String(value).trim();
}

function code(value) {
  return `\`${value}\``;
}
