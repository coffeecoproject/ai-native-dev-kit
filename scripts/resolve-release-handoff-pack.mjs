#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { evidenceDigest } from "./lib/artifact-schema.mjs";

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
  releaseTarget: normalizeInput(stringArg("release-target")),
  platform: normalizeInput(stringArg("platform")),
  recipeId: normalizeInput(stringArg("recipe-id")),
  packId: normalizeInput(stringArg("pack-id")),
  releaseOwner: stringArg("release-owner"),
  approvalRef: stringArg("approval-ref"),
  approvalStatus: normalizeApprovalStatus(stringArg("approval-status")),
  approvalType: stringArg("approval-type"),
  approvalScope: stringArg("approval-scope"),
  approvalTime: stringArg("approval-time"),
  allowedCodexActions: stringArg("allowed-codex-actions"),
  blockedActions: stringArg("blocked-actions"),
  approvalExpiry: stringArg("approval-expiry"),
  evidencePath: stringArg("evidence-path") || "release-handoff-packs",
  releaseSop: stringArg("release-sop"),
  rollback: stringArg("rollback"),
  monitoring: stringArg("monitoring"),
  environment: stringArg("environment"),
  postLaunchSmoke: stringArg("post-launch-smoke"),
};

function buildReleaseHandoffPack(root, options) {
  const recipe = resolveRecipe(root, options);
  const pack = selectPack(recipe, options);
  const approval = resolveStructuredApproval(root, options);
  const releaseTarget = options.releaseTarget || pack.defaultTarget;
  const owner = options.releaseOwner || approval.approvedBy || "N/A";
  const evidence = buildEvidence(options, approval);
  const handoff = evaluateHandoff(recipe, approval, owner, evidence);
  const codexMayRun = codexMayRunRows(options, approval, pack);
  const machineReadableEvidence = buildMachineReadableEvidence({
    pack,
    recipe,
    approval,
    releaseTarget,
    owner,
    evidence,
    handoff,
    options,
  });

  return {
    reportType: "RELEASE_HANDOFF_PACK",
    generatedBy: "scripts/resolve-release-handoff-pack.mjs",
    generatedAt: new Date().toISOString(),
    projectRoot: root,
    readOnly: true,
    humanSummary: {
      packId: pack.id,
      recipeId: recipe.selectedRecipeId,
      releaseTarget,
      executionLevel: pack.executionLevel,
      releaseOwner: owner,
      handoffState: handoff.state,
      safeNextStep: handoff.safeNextStep,
    },
    selectedRecipe: recipeRows(recipe),
    requiredApproval: approvalRows(approval, releaseTarget),
    requiredInputs: requiredInputRows(options, owner),
    preflightSteps: pack.preflightSteps,
    codexMayRun,
    humanMustRun: pack.humanMustRun,
    externalSystemMustRun: pack.externalSystemMustRun,
    stopConditions: stopConditionRows(pack),
    evidenceToCapture: evidence.evidenceToCapture,
    rollbackEvidence: evidence.rollbackEvidence,
    monitoringEvidence: evidence.monitoringEvidence,
    postReleaseSmoke: evidence.postReleaseSmoke,
    postReleaseCloseOut: postReleaseCloseOutRows(pack),
    machineReadableEvidence,
    releaseGuideBridge: [
      `node scripts/cli.mjs release-guide . --intent "${options.intent}" --recipe-id ${recipe.selectedRecipeId} --release-target ${releaseTarget}`,
    ],
    releaseExecutionBridge: [
      `node scripts/cli.mjs release-execution . --intent "prepare release execution" --mode PLAN_ONLY --release-target ${releaseTarget}`,
    ],
    knownLimits: pack.knownLimits,
    boundaries: {
      approvesRelease: "No",
      deploysPublishesUploadsSubmitsMigratesOrReleasesByItself: "No",
      asksForOrStoresSecrets: "No",
      changesCiHooksDnsPaymentPermissionsAppStoreMiniProgramProductionDataOrProductionConfig: "No",
      makesCodexReleaseOwner: "No",
      treatsStructuredApprovalAsBlanketAuthorization: "No",
    },
    outcome: handoff.outcome,
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
      selectedRecipeId: options.recipeId || "N/A",
      recipeStatus: "N/A",
      platformFamily: "N/A",
      selectionConfidence: "LOW",
      safeFirstTarget: options.releaseTarget || "N/A",
      ref: "scripts/resolve-platform-release-recipe.mjs",
      reason: result.stderr || result.stdout || "Platform Release Recipe could not be resolved.",
    };
  }
  try {
    const parsed = JSON.parse(result.stdout);
    const summary = parsed.humanSummary || {};
    return {
      status: summary.selectedRecipeId ? "PASS" : "MISSING",
      selectedRecipeId: summary.selectedRecipeId || options.recipeId || "N/A",
      recipeStatus: summary.recipeStatus || "N/A",
      platformFamily: summary.platformFamily || "N/A",
      selectionConfidence: summary.selectionConfidence || "LOW",
      safeFirstTarget: summary.safeFirstTarget || options.releaseTarget || "N/A",
      ref: "generated:resolve-platform-release-recipe",
      reason: summary.why || "Platform Release Recipe generated.",
    };
  } catch (error) {
    return {
      status: "MISSING",
      selectedRecipeId: options.recipeId || "N/A",
      recipeStatus: "N/A",
      platformFamily: "N/A",
      selectionConfidence: "LOW",
      safeFirstTarget: options.releaseTarget || "N/A",
      ref: "scripts/resolve-platform-release-recipe.mjs",
      reason: `Platform Release Recipe JSON could not be parsed: ${error.message}`,
    };
  }
}

function selectPack(recipe, options) {
  if (options.packId) return packById(options.packId);
  const target = `${options.releaseTarget || recipe.safeFirstTarget || ""}`.toLowerCase();
  if (recipe.selectedRecipeId === "web-hosted-preview" && /prod/.test(target)) return packById("web-hosted-production-handoff");
  if (recipe.selectedRecipeId === "web-hosted-preview") return packById("web-hosted-preview");
  if (recipe.selectedRecipeId === "backend-api-handoff") return packById("backend-api-release-handoff");
  if (recipe.selectedRecipeId === "mini-program-review-handoff" && /preview/.test(target)) return packById("mini-program-preview-handoff");
  if (recipe.selectedRecipeId === "mini-program-review-handoff") return packById("mini-program-review-handoff");
  if (recipe.selectedRecipeId === "ios-testflight-handoff") return packById("ios-testflight-handoff");
  if (recipe.selectedRecipeId === "android-internal-testing-handoff") return packById("android-internal-testing-handoff");
  if (recipe.selectedRecipeId === "web-container-release-handoff") return packById("web-container-staging-handoff");
  return packById("web-hosted-preview");
}

function resolveStructuredApproval(root, options) {
  const fromArgs = normalizeApproval({
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
    ref: options.approvalRef || options.evidencePath || "N/A",
  });

  if (!options.approvalRef) return fromArgs;
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

function buildEvidence(options, approval) {
  return {
    evidenceToCapture: [
      evidence("Structured release approval", approval.structured === "Yes" ? approval.ref : "", "Approval type, target, scope, owner, allowed actions, blocked actions, evidence, and expiry."),
      evidence("Release SOP", options.releaseSop, "Project release procedure or owner-owned path."),
      evidence("Environment", options.environment, "Target environment and non-secret setup reference."),
      evidence("Verification output", options.evidencePath, "Command, timestamp, result, and path."),
    ],
    rollbackEvidence: [
      evidence("Rollback path", options.rollback, "Path, owner, and restoration condition."),
    ],
    monitoringEvidence: [
      evidence("Monitoring path", options.monitoring, "Dashboard/log/check path and owner."),
    ],
    postReleaseSmoke: [
      evidence("Post-release smoke", options.postLaunchSmoke, "Target level, owner, read-only checks, and result path."),
    ],
  };
}

function evaluateHandoff(recipe, approval, owner, evidence) {
  if (recipe.status !== "PASS") {
    return state("BLOCKED_BY_SELECTED_RECIPE", "Codex must resolve and verify the matching platform recipe before preparing a handoff pack; the user is not asked to choose technical recipe identifiers.");
  }
  if (approval.structured !== "Yes") {
    return state("BLOCKED_BY_STRUCTURED_APPROVAL", "Create structured release approval before any release handoff can be treated as ready.");
  }
  if (!isConcrete(owner)) {
    return state("BLOCKED_BY_RELEASE_OWNER", "Name the human release owner or external release system.");
  }
  if (evidence.rollbackEvidence.some((item) => item.status !== "PASS")) {
    return state("BLOCKED_BY_ROLLBACK_EVIDENCE", "Record rollback path, owner, and restoration condition.");
  }
  if (evidence.monitoringEvidence.some((item) => item.status !== "PASS")) {
    return state("BLOCKED_BY_MONITORING_EVIDENCE", "Record monitoring or observation path and owner.");
  }
  if (evidence.postReleaseSmoke.some((item) => item.status !== "PASS")) {
    return state("BLOCKED_BY_POST_RELEASE_SMOKE_EVIDENCE", "Record post-release smoke target, owner, read-only checks, and evidence path.");
  }
  return state("READY_FOR_HANDOFF_REVIEW", "Ready for handoff review, not release approval. Review with the release owner; high-risk actions remain human/external-system-owned.");
}

function state(outcome, safeNextStep) {
  return { state: outcome, outcome, safeNextStep };
}

function codexMayRunRows(options, approval, pack) {
  if (approval.structured !== "Yes" || !isConcrete(options.allowedCodexActions)) {
    return [
      { action: "None by default", riskClass: "NO_RUN", condition: "Requires structured approval, recipe policy, and local-safe command classification." },
    ];
  }
  const allowed = options.allowedCodexActions;
  if (/LOCAL_READ_ONLY|LOCAL_BUILD|LOCAL_TEST/i.test(allowed) && !remoteOrHighRiskPattern().test(allowed)) {
    return [
      { action: allowed, riskClass: localRiskClass(allowed), condition: "Allowed only within structured approval, recipe policy, and stop conditions." },
    ];
  }
  return [
    { action: "None by default", riskClass: "NO_RUN", condition: "Approved actions are not local-safe or need human/external execution." },
  ];
}

function localRiskClass(value) {
  const text = String(value || "");
  if (/LOCAL_BUILD/i.test(text)) return "LOCAL_BUILD";
  if (/LOCAL_TEST/i.test(text)) return "LOCAL_TEST";
  return "LOCAL_READ_ONLY";
}

function requiredInputRows(options, owner) {
  return [
    { input: "Release owner", minimumQuality: isConcrete(owner) ? owner : "Named human owner or external release system required." },
    { input: "Release SOP", minimumQuality: options.releaseSop || "Documented path or owner-owned procedure required." },
    { input: "Rollback", minimumQuality: options.rollback || "Path, owner, and restoration condition required." },
    { input: "Monitoring", minimumQuality: options.monitoring || "Dashboard/log/check path and owner required." },
  ];
}

function stopConditionRows(pack) {
  return [
    { condition: "Missing structured release approval", response: "Stop for human decision." },
    { condition: "Secret required", response: "Stop for human or external system." },
    { condition: "Remote-state mutation implied", response: "Stop for human or external system." },
    { condition: "Action outside pack execution level", response: `Stop; this pack is ${pack.executionLevel}.` },
  ];
}

function postReleaseCloseOutRows(pack) {
  return [
    { item: "Actual executor", requirement: "Record human or external release system that ran the release action." },
    { item: "Result", requirement: "Record pass/fail, timestamp, target, and evidence path." },
    { item: "Rollback status", requirement: "Record whether rollback is still available and who owns it." },
    { item: "Monitoring status", requirement: "Record observation path and owner." },
    { item: "Unresolved decisions", requirement: "Record remaining human decisions or N/A reason." },
    { item: "Pack limit", requirement: `This pack remains ${pack.executionLevel}; it is not release approval.` },
  ];
}

function buildMachineReadableEvidence({ pack, recipe, approval, releaseTarget, owner, evidence, handoff, options }) {
  const value = {
    schema_version: "1.61.0",
    artifact_type: "release_handoff_evidence",
    artifact_id: slug(`${pack.id}-${releaseTarget}`),
    handoff_evidence_digest: "",
    handoff_pack: {
      pack_id: pack.id,
      recipe_id: recipe.selectedRecipeId,
      release_target: releaseTarget,
      execution_level: pack.executionLevel,
      handoff_state: handoff.state,
      handoff_review_only: true,
    },
    structured_approval: {
      approval_type: approval.approvalType,
      approval_status: approval.approvalStatus,
      release_target: approval.releaseTarget || releaseTarget,
      approved_scope: approval.approvedScope,
      approved_by: approval.approvedBy,
      approval_time: approval.approvalTime,
      allowed_codex_actions: splitActions(approval.allowedCodexActions),
      blocked_actions: splitActions(approval.blockedActions),
      evidence_path: approval.evidencePath,
      expiry: approval.expiry,
    },
    release_owner: {
      owner_type: ownerType(owner),
      owner_ref: owner || "N/A",
    },
    rollback: {
      path: firstEvidenceRef(evidence.rollbackEvidence),
      owner: ownerFromEvidence(options.rollback, owner),
      restore_condition: restoreConditionFromEvidence(options.rollback),
    },
    monitoring: {
      path: firstEvidenceRef(evidence.monitoringEvidence),
      owner: ownerFromEvidence(options.monitoring, owner),
      signal_type: monitoringSignalType(options.monitoring),
      observation_path: firstEvidenceRef(evidence.monitoringEvidence),
    },
    post_release_smoke: {
      target_level: smokeTargetLevel(releaseTarget),
      owner: ownerFromEvidence(options.postLaunchSmoke, owner),
      read_only: true,
      evidence_path: firstEvidenceRef(evidence.postReleaseSmoke),
    },
    handoff_execution_boundary: {
      handoff_is_execution_input: true,
      execution_redefines_owner_evidence: false,
      approves_release: false,
      executes_release_commands: false,
      codex_release_owner: false,
      high_risk_actions_human_or_external: true,
    },
    outcome: handoff.outcome,
  };
  value.handoff_evidence_digest = evidenceDigest(value, ["handoff_evidence_digest"]);
  return value;
}

function recipeRows(recipe) {
  return [
    field("Recipe ID", code(recipe.selectedRecipeId)),
    field("Recipe Status", code(recipe.recipeStatus)),
    field("Platform Family", code(recipe.platformFamily)),
    field("Selection Confidence", code(recipe.selectionConfidence)),
    field("Safe First Target", code(recipe.safeFirstTarget)),
    field("Recipe Ref", recipe.ref),
    field("Notes", recipe.reason),
  ];
}

function approvalRows(approval, releaseTarget) {
  return [
    field("Approval Type", code(approval.approvalType)),
    field("Approval Status", code(approval.approvalStatus)),
    field("Release Target", approval.releaseTarget || releaseTarget),
    field("Approved Scope", approval.approvedScope),
    field("Approved By", approval.approvedBy),
    field("Approval Time", approval.approvalTime),
    field("Allowed Codex Actions", approval.allowedCodexActions),
    field("Blocked Actions", approval.blockedActions),
    field("Evidence Path", approval.evidencePath),
    field("Expiry / Reconfirm By", approval.expiry),
  ];
}

function evidence(evidenceName, ref, minimumQuality) {
  return {
    evidence: evidenceName,
    status: isConcrete(ref) ? "PASS" : "MISSING",
    ref: isConcrete(ref) ? ref : "N/A",
    minimumQuality,
  };
}

function field(fieldName, value) {
  return { field: fieldName, value: value || "N/A" };
}

function printHuman(report) {
  console.log("# Release Handoff Pack");
  console.log("");
  console.log("## Human Summary");
  printTable(["Field", "Value"], [
    ["Pack ID", code(report.humanSummary.packId)],
    ["Recipe ID", code(report.humanSummary.recipeId)],
    ["Release Target", code(report.humanSummary.releaseTarget)],
    ["Execution Level", code(report.humanSummary.executionLevel)],
    ["Release Owner", report.humanSummary.releaseOwner],
    ["Handoff State", code(report.humanSummary.handoffState)],
    ["Safe Next Step", report.humanSummary.safeNextStep],
  ]);
  printObjectRows("Selected Recipe", report.selectedRecipe);
  printObjectRows("Required Approval", report.requiredApproval);
  printObjectRows("Required Inputs", report.requiredInputs);
  printObjectRows("Preflight Steps", report.preflightSteps);
  printObjectRows("Codex May Run", report.codexMayRun);
  printObjectRows("Human Must Run", report.humanMustRun);
  printObjectRows("External System Must Run", report.externalSystemMustRun);
  printObjectRows("Stop Conditions", report.stopConditions);
  printObjectRows("Evidence To Capture", report.evidenceToCapture);
  printObjectRows("Rollback Evidence", report.rollbackEvidence);
  printObjectRows("Monitoring Evidence", report.monitoringEvidence);
  printObjectRows("Post-release Smoke", report.postReleaseSmoke);
  printObjectRows("Post-release Close-out", report.postReleaseCloseOut);
  console.log("## Machine-Readable Evidence");
  console.log("");
  console.log("```json");
  console.log(JSON.stringify(report.machineReadableEvidence, null, 2));
  console.log("```");
  console.log("");
  console.log("## Release Guide Bridge");
  console.log("");
  console.log("```bash");
  for (const command of report.releaseGuideBridge) console.log(command);
  console.log("```");
  console.log("");
  console.log("## Release Execution Bridge");
  console.log("");
  console.log("```bash");
  for (const command of report.releaseExecutionBridge) console.log(command);
  console.log("```");
  console.log("");
  printObjectRows("Known Limits", report.knownLimits);
  console.log("## Boundaries");
  console.log("");
  console.log(`- This pack approves release: ${report.boundaries.approvesRelease}`);
  console.log(`- This pack deploys, publishes, uploads, submits, migrates, or releases by itself: ${report.boundaries.deploysPublishesUploadsSubmitsMigratesOrReleasesByItself}`);
  console.log(`- This pack asks for or stores secrets: ${report.boundaries.asksForOrStoresSecrets}`);
  console.log(`- This pack changes CI/CD, hooks, DNS, payment, permissions, app-store state, mini-program state, production data, or production config: ${report.boundaries.changesCiHooksDnsPaymentPermissionsAppStoreMiniProgramProductionDataOrProductionConfig}`);
  console.log(`- This pack makes Codex the release owner: ${report.boundaries.makesCodexReleaseOwner}`);
  console.log(`- This pack treats structured approval as blanket authorization: ${report.boundaries.treatsStructuredApprovalAsBlanketAuthorization}`);
  console.log("");
  console.log("## Outcome");
  console.log("");
  console.log(code(report.outcome));
}

function printObjectRows(title, rows) {
  console.log(`## ${title}`);
  console.log("");
  if (!rows || rows.length === 0) {
    console.log("| Item | Detail |");
    console.log("|---|---|");
    console.log("| N/A | N/A |");
    console.log("");
    return;
  }
  const keys = Object.keys(rows[0]);
  console.log(`| ${keys.join(" | ")} |`);
  console.log(`| ${keys.map(() => "---").join(" | ")} |`);
  for (const row of rows) console.log(`| ${keys.map((key) => row[key] || "N/A").join(" | ")} |`);
  console.log("");
}

function printTable(headers, rows) {
  console.log(`| ${headers.join(" | ")} |`);
  console.log(`| ${headers.map(() => "---").join(" | ")} |`);
  for (const row of rows) console.log(`| ${row.join(" | ")} |`);
  console.log("");
}

function packById(id) {
  return PACKS.find((pack) => pack.id === id) || PACKS[0];
}

function resolveRef(root, ref) {
  if (!ref || ref === "N/A") return "";
  const normalized = ref.split(path.sep).join("/");
  if (path.isAbsolute(normalized) || normalized.includes("..")) return "";
  return fs.existsSync(path.join(root, normalized)) ? normalized : "";
}

function tableValue(content, key) {
  const normalizedKey = key.toLowerCase();
  for (const line of String(content || "").split(/\r?\n/)) {
    if (!/^\|/.test(line) || /---/.test(line)) continue;
    const cells = line.split("|").slice(1, -1).map((cell) => cell.trim());
    if ((cells[0] || "").replace(/`/g, "").trim().toLowerCase() === normalizedKey) {
      return stripCode(cells[1] || "");
    }
  }
  return "";
}

function stringArg(name) {
  const value = args[name];
  if (value === true || value === false || value === undefined) return "";
  return String(value).trim();
}

function normalizeInput(value) {
  return String(value || "").trim();
}

function normalizeApprovalStatus(value) {
  const normalized = String(value || "").trim().toUpperCase();
  if (new Set(["APPROVED", "REJECTED", "PENDING", "MISSING"]).has(normalized)) return normalized;
  return normalized ? normalized : "PENDING";
}

function stripCode(value) {
  return String(value || "").replace(/`/g, "").trim();
}

function code(value) {
  return `\`${value || "N/A"}\``;
}

function isConcrete(value) {
  const normalized = stripCode(value);
  return Boolean(normalized) && !/^(N\/A|TBD|TODO|PENDING|MISSING|UNKNOWN|REPLACE_WITH|none)$/i.test(normalized);
}

function splitActions(value) {
  const text = stripCode(value);
  if (!isConcrete(text)) return [];
  return text
    .split(/[,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function slug(value) {
  return String(value || "release-handoff")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    || "release-handoff";
}

function firstEvidenceRef(rows) {
  const row = (rows || []).find((item) => isConcrete(item.ref));
  return row ? row.ref : "N/A";
}

function ownerType(owner) {
  return /external/i.test(String(owner || "")) ? "EXTERNAL_RELEASE_SYSTEM" : "HUMAN_REQUIRED";
}

function ownerFromEvidence(text, fallbackOwner) {
  const value = stripCode(text);
  const ownerMatch = value.match(/\bowned by\s+(.+)$/i);
  if (ownerMatch) return ownerMatch[1].trim();
  if (/external/i.test(value)) return "EXTERNAL_RELEASE_SYSTEM";
  return isConcrete(fallbackOwner) ? fallbackOwner : "HUMAN_REQUIRED";
}

function restoreConditionFromEvidence(text) {
  const value = stripCode(text);
  if (!isConcrete(value)) return "N/A";
  const conditionMatch = value.match(/\brestore(?:s|d)?(?: when| if| condition)?[:\s]+(.+)$/i);
  return conditionMatch ? conditionMatch[1].trim() : value;
}

function monitoringSignalType(text) {
  const value = String(text || "").toLowerCase();
  if (/dashboard/.test(value)) return "dashboard";
  if (/\blog\b|logs/.test(value)) return "log";
  if (/health/.test(value)) return "healthcheck";
  if (/smoke/.test(value)) return "smoke";
  if (/incident/.test(value)) return "incident-channel";
  return "other";
}

function smokeTargetLevel(target) {
  const value = String(target || "").toLowerCase();
  if (/prod/.test(value)) return "production";
  if (/stag/.test(value)) return "staging";
  if (/review|mini|app/.test(value)) return "review";
  if (/preview|test/.test(value)) return "preview";
  return "local";
}

function remoteOrHighRiskPattern() {
  return /\b(production deploy|deploy production|publish preview|preview publish|upload|submit review|submit app|mini-program release|app-store|play console|database migration|production migration|DNS|payment|permission|production config|remote-state|provider API|trigger CI|ssh production|secret|token)\b/i;
}

const PACKS = [
  {
    id: "web-hosted-preview",
    executionLevel: "PREVIEW_ASSIST",
    defaultTarget: "preview",
    preflightSteps: [
      { step: "Inspect local package scripts and release docs", owner: "CODEX_MAY_RUN_AFTER_APPROVAL", riskClass: "LOCAL_READ_ONLY" },
      { step: "Run local build/test only when approved", owner: "CODEX_MAY_RUN_AFTER_APPROVAL", riskClass: "LOCAL_BUILD_OR_TEST" },
      { step: "Prepare preview publish instructions", owner: "CODEX_MAY_PREPARE", riskClass: "PREVIEW_PREPARE" },
    ],
    humanMustRun: [
      { action: "Approve preview publication and release risk", owner: "HUMAN_REQUIRED" },
      { action: "Run provider preview publish if it mutates remote state", owner: "HUMAN_REQUIRED" },
    ],
    externalSystemMustRun: [
      { action: "Preview publication or hosted-provider deployment", owner: "EXTERNAL_RELEASE_SYSTEM" },
    ],
    knownLimits: [{ limit: "Provider-specific deploy commands are not executed by this pack." }],
  },
  {
    id: "web-hosted-production-handoff",
    executionLevel: "PRODUCTION_HANDOFF",
    defaultTarget: "production",
    preflightSteps: [{ step: "Prepare production handoff evidence checklist", owner: "CODEX_MAY_PREPARE", riskClass: "PREVIEW_PREPARE" }],
    humanMustRun: [{ action: "Production deploy, customer rollout, rollback risk acceptance", owner: "HUMAN_REQUIRED" }],
    externalSystemMustRun: [{ action: "Production deployment and rollback controls", owner: "EXTERNAL_RELEASE_SYSTEM" }],
    knownLimits: [{ limit: "Production deployment is never a Codex-owned action." }],
  },
  {
    id: "web-container-staging-handoff",
    executionLevel: "STAGING_HANDOFF",
    defaultTarget: "staging",
    preflightSteps: [{ step: "Prepare container/server staging handoff checklist", owner: "CODEX_MAY_PREPARE", riskClass: "PREVIEW_PREPARE" }],
    humanMustRun: [{ action: "Server access, staging deploy, rollback risk acceptance", owner: "HUMAN_REQUIRED" }],
    externalSystemMustRun: [{ action: "Container registry, server process, reverse proxy, or deployment system", owner: "EXTERNAL_RELEASE_SYSTEM" }],
    knownLimits: [{ limit: "SSH, registry push, and remote server mutation stay outside Codex execution." }],
  },
  {
    id: "mini-program-preview-handoff",
    executionLevel: "PREVIEW_ASSIST",
    defaultTarget: "mini-program-preview",
    preflightSteps: [{ step: "Inspect local mini-program config and prepare preview checklist", owner: "CODEX_MAY_PREPARE", riskClass: "PREVIEW_PREPARE" }],
    humanMustRun: [{ action: "Mini-program upload/preview action in platform tooling", owner: "HUMAN_REQUIRED" }],
    externalSystemMustRun: [{ action: "Mini-program platform upload/preview", owner: "EXTERNAL_RELEASE_SYSTEM" }],
    knownLimits: [{ limit: "Platform upload and preview publication are not local-safe commands." }],
  },
  {
    id: "mini-program-review-handoff",
    executionLevel: "PRODUCTION_HANDOFF",
    defaultTarget: "mini-program-review",
    preflightSteps: [{ step: "Prepare mini-program review handoff checklist", owner: "CODEX_MAY_PREPARE", riskClass: "PREVIEW_PREPARE" }],
    humanMustRun: [{ action: "Mini-program upload, review submission, release timing, rollback risk acceptance", owner: "HUMAN_REQUIRED" }],
    externalSystemMustRun: [{ action: "Mini-program platform review and release controls", owner: "EXTERNAL_RELEASE_SYSTEM" }],
    knownLimits: [{ limit: "Upload, review submission, and release remain human/platform-owned." }],
  },
  {
    id: "ios-testflight-handoff",
    executionLevel: "PRODUCTION_HANDOFF",
    defaultTarget: "testflight",
    preflightSteps: [{ step: "Prepare archive/TestFlight handoff checklist", owner: "CODEX_MAY_PREPARE", riskClass: "PREVIEW_PREPARE" }],
    humanMustRun: [{ action: "Archive upload, TestFlight submission, App Store review decisions", owner: "HUMAN_REQUIRED" }],
    externalSystemMustRun: [{ action: "Apple developer platform processing and review", owner: "EXTERNAL_RELEASE_SYSTEM" }],
    knownLimits: [{ limit: "Code signing, upload, and store review are external/human-owned." }],
  },
  {
    id: "android-internal-testing-handoff",
    executionLevel: "PRODUCTION_HANDOFF",
    defaultTarget: "internal-testing",
    preflightSteps: [{ step: "Prepare bundle/internal testing handoff checklist", owner: "CODEX_MAY_PREPARE", riskClass: "PREVIEW_PREPARE" }],
    humanMustRun: [{ action: "Bundle upload, Play Console testing setup, rollout decisions", owner: "HUMAN_REQUIRED" }],
    externalSystemMustRun: [{ action: "Google Play Console processing and review", owner: "EXTERNAL_RELEASE_SYSTEM" }],
    knownLimits: [{ limit: "Signing, upload, and Play Console actions are external/human-owned." }],
  },
  {
    id: "backend-api-release-handoff",
    executionLevel: "PRODUCTION_HANDOFF",
    defaultTarget: "production-api-handoff",
    preflightSteps: [{ step: "Prepare backend verification, migration review, rollback, and monitoring handoff", owner: "CODEX_MAY_PREPARE", riskClass: "PREVIEW_PREPARE" }],
    humanMustRun: [{ action: "Production deploy, production migration, data risk acceptance, rollback risk acceptance", owner: "HUMAN_REQUIRED" }],
    externalSystemMustRun: [{ action: "Deployment platform, migration runner, monitoring and incident system", owner: "EXTERNAL_RELEASE_SYSTEM" }],
    knownLimits: [{ limit: "Production migration and data-risk operations are never Codex-owned." }],
  },
];

const report = buildReleaseHandoffPack(projectRoot, context);
if (outputFormat === "json") console.log(JSON.stringify(report, null, 2));
else printHuman(report);
