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
  releaseTarget: stringArg("release-target") || "PREVIEW_OR_TEST",
  platform: stringArg("platform"),
  recipeId: stringArg("recipe-id"),
  packId: stringArg("pack-id"),
  releaseOwner: stringArg("release-owner"),
  approvalRef: stringArg("approval-ref"),
  approvalStatus: stringArg("approval-status"),
  approvalType: stringArg("approval-type"),
  approvalScope: stringArg("approval-scope"),
  approvalTime: stringArg("approval-time"),
  allowedCodexActions: stringArg("allowed-codex-actions"),
  blockedActions: stringArg("blocked-actions"),
  approvalExpiry: stringArg("approval-expiry"),
  evidencePath: stringArg("evidence-path") || "release-plans",
  verification: stringArg("verification"),
  launchViewRef: stringArg("launch-view-ref"),
  releaseSop: stringArg("release-sop"),
  rollback: stringArg("rollback"),
  monitoring: stringArg("monitoring"),
  environment: stringArg("environment"),
  postLaunchSmoke: stringArg("post-launch-smoke"),
};

const report = buildReleasePlan(projectRoot, context);
if (outputFormat === "json") console.log(JSON.stringify(report, null, 2));
else printHuman(report);

function buildReleasePlan(root, options) {
  const projectProfile = classifyProject(root);
  const adapter = resolveSource("Release Adapter", "resolve-release-adapter.mjs", root, options, ["adapterState"]);
  const guide = resolveSource("Release Guide", "resolve-release-guide.mjs", root, options, ["guideState"]);
  const recipe = resolveSource("Platform Release Recipe", "resolve-platform-release-recipe.mjs", root, options, ["recipeStatus"]);
  const launch = resolveSource("Launch Review View", "resolve-launch-review-view.mjs", root, options, ["safeLaunchLabel"]);
  const handoff = resolveSource("Release Handoff Pack", "resolve-release-handoff-pack.mjs", root, options, ["handoffState"]);
  const execution = resolveSource("Release Execution Protocol", "resolve-release-execution.mjs", root, options, ["executionMode"]);
  const nativeMigration = resolveSource("Native Migration Plan", "resolve-native-migration.mjs", root, options, ["migrationMode", "projectState"]);
  const ruleReconciliation = resolveSource("Existing Rule Reconciliation", "resolve-existing-rule-reconciliation.mjs", root, options, ["projectState", "outcome"]);
  const sourceSystems = [adapter, guide, recipe, launch, handoff, execution, nativeMigration, ruleReconciliation];
  const releasePlanState = chooseSummaryState(sourceSystems, projectProfile, options);
  const migrationDepth = chooseMigrationDepth(projectProfile, nativeMigration, ruleReconciliation);
  const releaseTarget = options.releaseTarget || guide.summary.releaseTarget || adapter.summary.recommendedTarget || "PREVIEW_OR_TEST";
  const ruleComparison = buildExistingRuleComparison(root, projectProfile, ruleReconciliation);
  const safeNextStep = safeNextStepFor(releasePlanState, projectProfile, migrationDepth);
  const trace = sourceSystems.map((source) => ({
    sourceSystem: source.name,
    status: source.status,
    ref: source.ref,
    contribution: source.contribution,
    controlAuthority: "No",
  }));
  const machineReadableEvidence = buildMachineReadableEvidence({
    releasePlanState,
    releaseTarget,
    migrationDepth,
    safeNextStep,
    trace,
    ruleComparison,
  });

  return {
    reportType: "RELEASE_PLAN",
    schemaVersion: "1.67.0",
    generatedBy: "scripts/resolve-release-plan.mjs",
    generatedAt: new Date().toISOString(),
    projectRoot: root,
    intent: options.intent,
    readOnly: true,
    humanSummary: {
      releasePlanState,
      summaryStateKind: "SUMMARY_ONLY",
      releaseTarget,
      releasePlanIsPureView: "Yes",
      intentosOperatingMode: "ACTIVE",
      projectAssetMigrationDepth: migrationDepth,
      safeNextStep,
    },
    releaseDecisionView: decisionRows(releasePlanState, sourceSystems, safeNextStep),
    releasePlanTrace: trace,
    sourceSystemInputs: sourceSystems.map((source) => ({
      system: source.name,
      authority: "SOURCE_SYSTEM",
      status: source.status,
      ref: source.ref,
      notes: source.contribution,
    })),
    existingProjectDecisionSummary: {
      projectState: projectProfile.projectState,
      intentosOperatingMode: "ACTIVE",
      operatingModeGrantsWritePermission: "No",
      projectAssetMigrationDepth: migrationDepth,
      ruleComparisonRequired: "Yes",
      why: projectProfile.reason,
    },
    existingProjectRuleComparison: ruleComparison,
    codexMayDo: codexMayDoRows(projectProfile),
    humanMustDecide: humanMustDecideRows(),
    externalSystemActions: externalSystemRows(),
    evidenceRequirements: evidenceRows(sourceSystems, projectProfile),
    rollbackMonitoringSmoke: rolloutRows(options),
    conflicts: conflictRows(sourceSystems),
    boundaries: {
      approvesRelease: "No",
      approvesProduction: "No",
      writesTargetProjectFiles: "No",
      changesCommandBehavior: "No",
      letsTraceControlExecution: "No",
      letsSummaryStateDriveExecution: "No",
      treatsIntentosOperatingModeAsWritePermission: "No",
      makesCodexReleaseOwner: "No",
      replacesExistingGovernance: "No",
      modifiesCiOrHooks: "No",
      asksForOrStoresSecrets: "No",
    },
    machineReadableEvidence,
    outcome: releasePlanState,
  };
}

function resolveSource(name, script, root, options, summaryKeys) {
  const command = [
    path.join(scriptDir, script),
    root,
    "--intent",
    options.intent,
    "--json",
  ];
  appendSourceArgs(command, script, options);

  const result = spawnSync(process.execPath, command, { encoding: "utf8" });
  if (result.status !== 0) {
    return {
      name,
      status: "BLOCKED",
      ref: script,
      summary: {},
      contribution: normalizeLine(result.stderr || result.stdout || `${name} could not be resolved.`),
    };
  }
  try {
    const parsed = JSON.parse(result.stdout);
    const summary = parsed.humanSummary || parsed.safeLaunchView || {};
    const key = summaryKeys.find((item) => summary[item]);
    const value = key ? summary[key] : parsed.outcome || parsed.reportType || "RECORDED";
    const status = sourceStatusFrom(value, parsed.outcome);
    return {
      name,
      status,
      ref: `generated:${script.replace(/^resolve-/, "").replace(/\.mjs$/, "")}`,
      summary,
      contribution: `${key || "outcome"}=${value}; lower-level result remains authoritative.`,
    };
  } catch (error) {
    return {
      name,
      status: "BLOCKED",
      ref: script,
      summary: {},
      contribution: `${name} JSON could not be parsed: ${error.message}`,
    };
  }
}

function appendSourceArgs(command, script, options) {
  if (script === "resolve-release-guide.mjs" || script === "resolve-release-handoff-pack.mjs") {
    appendIf(command, "--release-target", options.releaseTarget);
    appendIf(command, "--platform", options.platform);
    appendIf(command, "--recipe-id", options.recipeId);
    appendIf(command, "--pack-id", options.packId);
    appendIf(command, "--release-owner", options.releaseOwner);
    appendIf(command, "--approval-ref", options.approvalRef);
    appendIf(command, "--approval-status", options.approvalStatus);
    appendIf(command, "--approval-type", options.approvalType);
    appendIf(command, "--approval-scope", options.approvalScope);
    appendIf(command, "--approval-time", options.approvalTime);
    appendIf(command, "--allowed-codex-actions", options.allowedCodexActions);
    appendIf(command, "--blocked-actions", options.blockedActions);
    appendIf(command, "--approval-expiry", options.approvalExpiry);
    appendIf(command, "--evidence-path", options.evidencePath);
    appendIf(command, "--verification", options.verification);
    appendIf(command, "--launch-view-ref", options.launchViewRef);
    appendIf(command, "--release-sop", options.releaseSop);
    appendIf(command, "--rollback", options.rollback);
    appendIf(command, "--monitoring", options.monitoring);
    appendIf(command, "--environment", options.environment);
    appendIf(command, "--post-launch-smoke", options.postLaunchSmoke);
    return;
  }
  if (script === "resolve-platform-release-recipe.mjs") {
    appendIf(command, "--release-target", options.releaseTarget);
    appendIf(command, "--platform", options.platform);
    appendIf(command, "--recipe-id", options.recipeId);
    return;
  }
  if (script === "resolve-launch-review-view.mjs") {
    appendIf(command, "--verification", options.verification);
    appendIf(command, "--release-owner", options.releaseOwner);
    appendIf(command, "--rollback", options.rollback);
    appendIf(command, "--monitoring", options.monitoring);
    appendIf(command, "--environment", options.environment);
    appendIf(command, "--post-launch-smoke", options.postLaunchSmoke);
    return;
  }
  if (script === "resolve-release-execution.mjs") {
    appendIf(command, "--verification", options.verification);
    appendIf(command, "--release-owner", options.releaseOwner);
    appendIf(command, "--approval-ref", options.approvalRef);
    appendIf(command, "--approval-status", options.approvalStatus);
    appendIf(command, "--approval-scope", options.approvalScope);
    appendIf(command, "--release-sop", options.releaseSop);
    appendIf(command, "--rollback", options.rollback);
    appendIf(command, "--monitoring", options.monitoring);
    appendIf(command, "--environment", options.environment);
    appendIf(command, "--post-launch-smoke", options.postLaunchSmoke);
  }
}

function classifyProject(root) {
  const markers = [
    "AGENTS.md",
    ".github/workflows",
    "docs/WEB_ENGINEERING_BASELINE.md",
    "docs/WEB_ENVIRONMENT_BASELINE.md",
    "docs/WEB_RELEASE_ROLLBACK_BASELINE.md",
    "docs/workcontrol-release-promotion-sop.md",
    "scripts/guard",
    "release-plans",
    "native-migration-plans",
    "existing-rule-reconciliations",
  ].filter((item) => fs.existsSync(path.join(root, item)));
  const isIntentOS = fs.existsSync(path.join(root, "intentos-manifest.json")) && fs.existsSync(path.join(root, "core", "workflow.md"));
  const hasGit = fs.existsSync(path.join(root, ".git"));
  const hasPackage = fs.existsSync(path.join(root, "package.json"));
  const hasStrictGovernance = markers.some((item) => /WEB_|release|guard|AGENTS|workflows/.test(item));
  if (isIntentOS) {
    return {
      projectState: "INTENTOS_SOURCE_REPOSITORY",
      existingGovernance: "Yes",
      reason: "This repository owns IntentOS assets; Release Plan can be generated as source evidence.",
      markers,
    };
  }
  if (hasStrictGovernance) {
    return {
      projectState: "EXISTING_GOVERNED_PROJECT",
      existingGovernance: "Yes",
      reason: "Existing governance markers were found; Codex may work in IntentOS Operating Mode, but asset migration must be compared and approved.",
      markers,
    };
  }
  if (hasGit || hasPackage || markers.length > 0) {
    return {
      projectState: "EXISTING_PROJECT",
      existingGovernance: markers.length > 0 ? "Partial" : "No",
      reason: "Existing project detected; IntentOS Operating Mode may guide Codex while migration depth is recommended.",
      markers,
    };
  }
  return {
    projectState: "NEW_OR_EMPTY_PROJECT",
    existingGovernance: "No",
    reason: "No strong existing project markers were found.",
    markers,
  };
}

function chooseSummaryState(sources, projectProfile) {
  if (projectProfile.projectState === "EXISTING_GOVERNED_PROJECT" && sources.some((item) => item.name === "Existing Rule Reconciliation" && item.status !== "PASS")) {
    return "BLOCKED_BY_PROJECT_AUTHORITY";
  }
  if (sources.some((item) => item.status === "BLOCKED")) return "BLOCKED_BY_HUMAN_DECISION";
  if (sources.some((item) => item.name === "Platform Release Recipe" && item.status !== "PASS")) return "NEEDS_PLATFORM_RECIPE";
  if (sources.some((item) => item.name === "Launch Review View" && item.status !== "PASS")) return "NEEDS_LAUNCH_REVIEW";
  if (sources.some((item) => item.name === "Release Handoff Pack" && item.status !== "PASS")) return "NEEDS_STRUCTURED_APPROVAL";
  return "READY_FOR_HANDOFF_REVIEW";
}

function chooseMigrationDepth(projectProfile, nativeMigration, ruleReconciliation) {
  if (projectProfile.projectState === "INTENTOS_SOURCE_REPOSITORY") return "RECOMMEND_ONLY";
  if (projectProfile.projectState === "EXISTING_GOVERNED_PROJECT") return "ADAPTER_ONLY";
  if (projectProfile.projectState === "EXISTING_PROJECT") {
    if (nativeMigration.status === "PASS" && ruleReconciliation.status === "PASS") return "SELECTIVE_INTENTOS_NATIVE";
    return "RECOMMEND_ONLY";
  }
  return "FULL_INTENTOS_NATIVE_CANDIDATE";
}

function buildExistingRuleComparison(root, projectProfile, ruleReconciliation) {
  const rows = [];
  const markerMap = [
    ["Engineering baseline", "docs/WEB_ENGINEERING_BASELINE.md", "core/engineering-baseline.md"],
    ["Environment baseline", "docs/WEB_ENVIRONMENT_BASELINE.md", "core/environment-baseline.md"],
    ["Release / rollback", "docs/WEB_RELEASE_ROLLBACK_BASELINE.md", "core/release-core-model.md"],
    ["Release SOP", "docs/workcontrol-release-promotion-sop.md", "core/release-handoff-packs.md"],
    ["CI / hooks", ".github/workflows", "core/hook-policy.md"],
    ["Guard scripts", "scripts/guard", "core/controlled-apply-readiness.md"],
    ["Agent instructions", "AGENTS.md", "core/native-first-existing-project-migration.md"],
  ];
  for (const [surface, existingPath, intentosRef] of markerMap) {
    const exists = fs.existsSync(path.join(root, existingPath));
    if (exists) {
      rows.push(ruleRow(surface, existingPath, intentosRef, stricterRecommendation(surface), "Existing project rule found; compare before applying IntentOS wording.", true));
    }
  }
  if (rows.length === 0) {
    rows.push(ruleRow("Engineering baseline", "N/A", "core/engineering-baseline.md", "GAP_SUGGESTION", "No existing engineering baseline marker found; recommend a gap review, not automatic write.", true));
    rows.push(ruleRow("Environment baseline", "N/A", "core/environment-baseline.md", "GAP_SUGGESTION", "No existing environment baseline marker found; recommend a gap review, not automatic write.", true));
    rows.push(ruleRow("Release / rollback", "N/A", "core/release-core-model.md", projectProfile.projectState === "NEW_OR_EMPTY_PROJECT" ? "GAP_SUGGESTION" : "NEEDS_HUMAN_DECISION", "Codex must prepare release and rollback rules; the user confirms only the later concrete external effect.", true));
  }
  if (ruleReconciliation.status === "PASS") {
    rows.push(ruleRow("Existing Rule Reconciliation", ruleReconciliation.ref, "core/existing-rule-reconciliation.md", "KEEP_EXISTING_AS_STRICTER", "Structured reconciliation already exists and remains the source system.", true));
  }
  return rows;
}

function stricterRecommendation(surface) {
  if (/Release|SOP|CI|hooks|Guard|Agent/.test(surface)) return "KEEP_EXISTING_AS_STRICTER";
  return "MERGE_AFTER_REVIEW";
}

function ruleRow(surface, existingRef, intentosRef, recommendation, reason, humanDecisionRequired) {
  return {
    surface,
    existingRef,
    intentosRef,
    recommendation,
    reason,
    humanDecisionRequired: humanDecisionRequired ? "Yes" : "No",
  };
}

function decisionRows(state, sources, safeNextStep) {
  return [
    decision("Final release-plan state", code(state), "Stricter source result is summarized.", safeNextStep),
    decision("Release source systems", code(sourceSummary(sources)), "Lower-level systems remain authoritative.", "Inspect trace before acting."),
    decision("Execution authority", code("HUMAN_OR_EXTERNAL_SYSTEM"), "Release Plan cannot approve or execute release.", "Use structured approval and handoff."),
  ];
}

function codexMayDoRows(projectProfile) {
  return [
    action("Work in IntentOS Operating Mode", "Read-only planning, task routing, comparison, and local-safe verification."),
    action("Prepare Native Migration Plan", "No target-file writes; migration depth is recommended."),
    action("Prepare Existing Rule Reconciliation", "Compare existing rules against IntentOS before changes."),
    action("Prepare Unified Apply Plan", "Only after a concrete proposed write is understood."),
    action("Run local-safe checks", "Only when project policy and approval permit."),
    action("For this project", projectProfile.reason),
  ];
}

function humanMustDecideRows() {
  return [
    decision("Concrete release effect", "REAL_WORLD_CONSENT_NEEDED", "Production, publication, provider, cost, or real-user effects require explicit consent.", "Codex prepares the exact action and rollback, then asks the current user for consent."),
    decision("Conflicting business behavior", "BUSINESS_FACT_NEEDED", "Codex reconciles technical rules, but cannot invent the intended real business behavior.", "Ask one plain business question only if project evidence cannot resolve it."),
    decision("External policy fact", "EXTERNAL_FACT_NEEDED", "Legal, tax, compliance, or provider facts cannot be proved by code.", "Keep only the dependent capability or claim blocked while unaffected work continues."),
  ];
}

function externalSystemRows() {
  return [
    action("Production deploy / publish / submit", "After structured current-user consent, Codex may execute the exact approved action when project policy and provider access allow; otherwise use the existing release system."),
    action("Store / mini-program review submission", "After structured current-user consent and complete platform evidence."),
    action("DNS / payment / provider-state change", "After structured current-user consent to the named external effect and only within the approved scope."),
    action("Production migration", "After structured current-user consent, verified backup/rollback, and the project production protocol."),
  ];
}

function evidenceRows(sources, projectProfile) {
  const rows = sources.map((source) => ({
    evidence: source.name,
    required: "Yes",
    status: source.status,
    ref: source.ref,
  }));
  rows.push({
    evidence: "Existing Rule Reconciliation",
    required: projectProfile.projectState.startsWith("EXISTING") ? "Yes" : "Conditional",
    status: sources.find((item) => item.name === "Existing Rule Reconciliation")?.status || "MISSING",
    ref: "existing-rule-reconciliations/",
  });
  return rows;
}

function rolloutRows(options) {
  return [
    { surface: "Rollback", status: isConcrete(options.rollback) ? "RECORDED" : "MISSING", ref: options.rollback || "N/A" },
    { surface: "Monitoring", status: isConcrete(options.monitoring) ? "RECORDED" : "MISSING", ref: options.monitoring || "N/A" },
    { surface: "Post-release smoke", status: isConcrete(options.postLaunchSmoke) ? "RECORDED" : "MISSING", ref: options.postLaunchSmoke || "N/A" },
  ];
}

function conflictRows(sources) {
  const blocked = sources.filter((item) => item.status === "BLOCKED");
  if (blocked.length === 0) {
    return [{ conflict: "No blocking source conflict found", status: "NONE", resolution: "Keep source systems authoritative; Release Plan remains view-only." }];
  }
  return blocked.map((item) => ({
    conflict: `${item.name} blocked`,
    status: "BLOCKED",
    resolution: "Use stricter source result; Release Plan does not override.",
  }));
}

function buildMachineReadableEvidence(input) {
  const evidence = {
    schema_version: "1.67.0",
    artifact_type: "release_plan_evidence",
    artifact_id: "release-plan",
    release_plan_digest: "sha256:0000000000000000000000000000000000000000000000000000000000000000",
    release_plan: {
      state: input.releasePlanState,
      summary_state_kind: "SUMMARY_ONLY",
      release_target: input.releaseTarget,
      project_asset_migration_depth: input.migrationDepth,
      safe_next_step: input.safeNextStep,
    },
    release_plan_boundary: {
      pure_view_model: true,
      approves_release: false,
      approves_production: false,
      writes_target_files: false,
      changes_command_behavior: false,
      trace_controls_execution: false,
      summary_state_drives_execution: false,
      operating_mode_grants_write_permission: false,
      codex_release_owner: false,
      replaces_existing_governance: false,
      modifies_ci_or_hooks: false,
      asks_for_or_stores_secrets: false,
    },
    existing_project_intentos_mode: {
      operating_mode_active: true,
      operating_mode_grants_write_permission: false,
      migration_depth: input.migrationDepth,
      rule_comparison_required: true,
    },
    trace: input.trace.map((item) => ({
      source_system: item.sourceSystem,
      status: item.status,
      ref: item.ref,
      contribution: item.contribution,
      control_authority: false,
    })),
    existing_rule_comparison: input.ruleComparison.map((item) => ({
      surface: item.surface,
      existing_ref: item.existingRef,
      intentos_ref: item.intentosRef,
      recommendation: item.recommendation,
      human_decision_required: item.humanDecisionRequired === "Yes",
    })),
    outcome: input.releasePlanState,
  };
  evidence.release_plan_digest = evidenceDigest(evidence, ["release_plan_digest"]);
  return evidence;
}

function sourceStatusFrom(value, outcome) {
  const text = `${value || ""} ${outcome || ""}`;
  if (/\b(READY|PASS|STRICT|RECORDED|APPROVED)\b/i.test(text)) return "PASS";
  if (/\b(BLOCKED|FAIL|REJECTED|MISSING)\b/i.test(text)) return "BLOCKED";
  return "NEEDS_INPUT";
}

function sourceSummary(sources) {
  if (sources.every((item) => item.status === "PASS")) return "ALL_PASS";
  if (sources.some((item) => item.status === "BLOCKED")) return "HAS_BLOCKERS";
  return "NEEDS_INPUT";
}

function safeNextStepFor(state, projectProfile, migrationDepth) {
  if (projectProfile.projectState === "EXISTING_GOVERNED_PROJECT" && migrationDepth !== "SELECTIVE_INTENTOS_NATIVE") {
    return "Keep Codex in IntentOS Operating Mode, then complete Native Migration and Existing Rule Reconciliation before changing governance files.";
  }
  if (state === "NEEDS_PLATFORM_RECIPE") return "Codex selects and verifies the matching platform release recipe before handoff planning.";
  if (state === "NEEDS_LAUNCH_REVIEW") return "Close launch review evidence gaps before release approval.";
  if (state === "NEEDS_STRUCTURED_APPROVAL") return "Codex prepares the exact release action; request current-user consent to the concrete external effect before execution.";
  if (state.startsWith("READY")) return "Prepare the exact release action and rollback; request consent only when the real-world effect is ready to occur.";
  return "Clarify release shape and source-system blockers before any release-facing action.";
}

function printHuman(report) {
  console.log("# Release Plan");
  console.log("");
  printFieldTable("Human Summary", [
    ["Release Plan State", code(report.humanSummary.releasePlanState)],
    ["Summary State Kind", code(report.humanSummary.summaryStateKind)],
    ["Release Target", code(report.humanSummary.releaseTarget)],
    ["Release Plan Is Pure View", report.humanSummary.releasePlanIsPureView],
    ["IntentOS Operating Mode", code(report.humanSummary.intentosOperatingMode)],
    ["Project Asset Migration Depth", code(report.humanSummary.projectAssetMigrationDepth)],
    ["Safe Next Step", report.humanSummary.safeNextStep],
  ]);
  printTable("Release Decision View", ["Decision", "Status", "Reason", "Next Step"], report.releaseDecisionView.map((item) => [item.decision, item.status, item.reason, item.nextStep]));
  printTable("Release Plan Trace", ["Source System", "Status", "Ref", "Contribution", "Control Authority"], report.releasePlanTrace.map((item) => [item.sourceSystem, code(item.status), item.ref, item.contribution, item.controlAuthority]));
  printTable("Source System Inputs", ["System", "Authority", "Status", "Ref", "Notes"], report.sourceSystemInputs.map((item) => [item.system, code(item.authority), code(item.status), item.ref, item.notes]));
  printFieldTable("Existing Project Decision Summary", [
    ["Project State", code(report.existingProjectDecisionSummary.projectState)],
    ["IntentOS Operating Mode", code(report.existingProjectDecisionSummary.intentosOperatingMode)],
    ["Operating Mode Grants Write Permission", report.existingProjectDecisionSummary.operatingModeGrantsWritePermission],
    ["Project Asset Migration Depth", code(report.existingProjectDecisionSummary.projectAssetMigrationDepth)],
    ["Rule Comparison Required", report.existingProjectDecisionSummary.ruleComparisonRequired],
    ["Why", report.existingProjectDecisionSummary.why],
  ]);
  printTable("Existing Project Rule Comparison", ["Surface", "Existing Ref", "IntentOS Ref", "Recommendation", "Reason", "Human Decision"], report.existingProjectRuleComparison.map((item) => [
    item.surface,
    item.existingRef,
    item.intentosRef,
    code(item.recommendation),
    item.reason,
    item.humanDecisionRequired,
  ]));
  printTable("Codex May Do", ["Action", "Condition"], report.codexMayDo.map((item) => [item.action, item.condition]));
  printTable("User Input Boundary", ["Input", "Why", "Next Step"], report.humanMustDecide.map((item) => [item.decision, item.reason, item.nextStep]));
  printTable("Real-World Actions", ["Action", "Execution Boundary"], report.externalSystemActions.map((item) => [item.action, item.condition]));
  printTable("Evidence Requirements", ["Evidence", "Required", "Status", "Ref"], report.evidenceRequirements.map((item) => [item.evidence, item.required, code(item.status), item.ref]));
  printTable("Rollback / Monitoring / Smoke", ["Surface", "Status", "Ref"], report.rollbackMonitoringSmoke.map((item) => [item.surface, code(item.status), item.ref]));
  printTable("Conflicts", ["Conflict", "Status", "Resolution"], report.conflicts.map((item) => [item.conflict, code(item.status), item.resolution]));
  console.log("## Boundaries");
  console.log("");
  console.log("- This plan approves release: No");
  console.log("- This plan approves production: No");
  console.log("- This plan writes target-project files: No");
  console.log("- This plan changes command behavior: No");
  console.log("- This plan lets trace control execution: No");
  console.log("- This plan lets summary state drive execution: No");
  console.log("- This plan treats IntentOS Operating Mode as write permission: No");
  console.log("- This plan makes technical readiness equal user consent: No");
  console.log("- This plan replaces existing governance: No");
  console.log("- This plan modifies CI or hooks: No");
  console.log("- This plan asks for or stores secrets: No");
  console.log("");
  console.log("## Machine-Readable Evidence");
  console.log("");
  console.log("```json");
  console.log(JSON.stringify(report.machineReadableEvidence, null, 2));
  console.log("```");
  console.log("");
  console.log("## Outcome");
  console.log("");
  console.log(code(report.outcome));
}

function printFieldTable(title, rows) {
  printTable(title, ["Field", "Value"], rows);
}

function printTable(title, headers, rows) {
  console.log(`## ${title}`);
  console.log("");
  console.log(`| ${headers.join(" | ")} |`);
  console.log(`| ${headers.map(() => "---").join(" | ")} |`);
  for (const row of rows) console.log(`| ${row.map(escapeCell).join(" | ")} |`);
  console.log("");
}

function action(actionName, condition) {
  return { action: actionName, condition };
}

function decision(decisionName, status, reason, nextStep) {
  return { decision: decisionName, status, reason, nextStep };
}

function appendIf(command, flag, value) {
  if (isConcrete(value)) command.push(flag, String(value));
}

function stringArg(name) {
  const value = args[name];
  return typeof value === "string" ? value : "";
}

function isConcrete(value) {
  const text = String(value || "").trim();
  return Boolean(text) && !/^(N\/A|NA|TBD|TODO|PENDING|MISSING|<[^>]+>)$/i.test(text);
}

function code(value) {
  return `\`${value}\``;
}

function escapeCell(value) {
  return String(value ?? "").replace(/\n/g, " ").replace(/\|/g, "\\|");
}

function normalizeLine(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}
