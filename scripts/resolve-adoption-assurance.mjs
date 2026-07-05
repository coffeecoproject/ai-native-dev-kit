#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseArgs, unknownOptions } from "./lib/args.mjs";

const __filename = fileURLToPath(import.meta.url);
const scriptDir = path.dirname(__filename);
const kitRoot = path.resolve(scriptDir, "..");
const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["json", "format", "intent", "out"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputFormat = args.json ? "json" : String(args.format || "human");
const outputPath = args.out ? resolveOutputPath(projectRoot, args.out) : "";
const schemaVersion = "1.71.3";
const simulationTask = "Add a required field validation to a non-production example flow.";

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

if (!new Set(["human", "json"]).has(outputFormat)) {
  console.error(`FAIL unknown --format: ${outputFormat}`);
  process.exit(1);
}

const report = buildReport(projectRoot, {
  intent: String(args.intent || "verify existing project IntentOS adoption"),
});

if (outputFormat === "json") {
  const output = `${JSON.stringify(report, null, 2)}\n`;
  writeOutputIfRequested(output);
  process.stdout.write(output);
} else {
  const output = humanReportText(report);
  writeOutputIfRequested(output);
  process.stdout.write(output);
}

function buildReport(root, options) {
  const signals = collectSignals(root);
  const sources = resolveSources(root, options);
  const simulation = simulationFor(root, signals);
  const surfaces = surfacesFor(root, signals, sources, simulation);
  const dirty = isDirty(root);
  const pendingDecisions = pendingDecisionsFor(surfaces, dirty, sources);
  const assuranceState = assuranceStateFor({ surfaces, simulation, dirty, sources });
  const canClaimFullAdoption = assuranceState === "VERIFIED_ACTIVE" ? "Yes" : "No";
  const targetProfile = targetProjectProfileFor(root, signals);
  const evidenceRefs = evidenceRefsFor(surfaces, sources, simulation);
  const boundary = boundaryFor();

  const structuredEvidence = {
    schema_version: schemaVersion,
    artifact_type: "adoption_assurance_report",
    target_project_profile: targetProfile,
    assurance_state: assuranceState,
    intent_os_operating_mode: signals.intentOsOperatingMode,
    can_claim_full_adoption: canClaimFullAdoption,
    can_codex_write_now: "No",
    surfaces,
    evidence_refs: evidenceRefs,
    source_systems: sources,
    simulation,
    pending_decisions: pendingDecisions,
    forbidden_claims: forbiddenClaimsFor(),
    boundary,
    outcome: assuranceState,
  };

  return {
    reportType: "ADOPTION_ASSURANCE_REPORT",
    schemaVersion,
    generatedBy: "scripts/resolve-adoption-assurance.mjs",
    generatedAt: new Date().toISOString(),
    projectRoot: root,
    intent: options.intent,
    readOnly: true,
    humanSummary: {
      targetProjectProfile: targetProfile,
      assuranceState,
      intentOsOperatingMode: signals.intentOsOperatingMode,
      canClaimFullAdoption,
      canCodexWriteNow: "No",
    },
    targetProjectState: signals,
    sourceSystems: sources,
    surfaces,
    evidenceRefs,
    simulation,
    pendingDecisions,
    nextSafeStep: nextSafeStepFor(assuranceState),
    boundary,
    structuredEvidence,
    outcome: assuranceState,
  };
}

function collectSignals(root) {
  const exists = fs.existsSync(root);
  const has = (relativePath) => exists && fs.existsSync(path.join(root, relativePath));
  const hasAny = (items) => items.some((item) => has(item));
  const isSourceRepo = has("intentos-manifest.json") && has("core/workflow.md");
  const hasIntentOSAssets = has(".intentos/version.json") || has(".intentos/intentos-manifest.json") || isSourceRepo;
  return {
    exists: exists ? "Yes" : "No",
    dirtyWorktree: isDirty(root) ? "Yes" : "No",
    isSourceRepo: isSourceRepo ? "Yes" : "No",
    intentOsOperatingMode: hasIntentOSAssets || has("native-migration-plans") || has("governance-convergence-reports")
      ? "ACTIVE"
      : "READ_ONLY_DIAGNOSIS",
    hasAiRules: hasAny(["AGENTS.md", ".codex", ".cursor", ".claude"]),
    hasEngineeringBaseline: hasAny([
      "docs/engineering-baseline.md",
      "docs/WEB_ENGINEERING_BASELINE.md",
      "core/engineering-baseline.md",
    ]),
    hasEnvironmentBaseline: hasAny([
      "docs/environment-baseline.md",
      "docs/WEB_ENVIRONMENT_BASELINE.md",
      "core/environment-baseline.md",
    ]),
    hasReleaseRollback: hasAny([
      "docs/WEB_RELEASE_ROLLBACK_BASELINE.md",
      "docs/release",
      "docs/releases",
      "docs/runbooks",
      "core/release-execution-protocol.md",
    ]),
    hasCiHooks: hasAny([".github/workflows", ".husky", "scripts/guard", "scripts/ci"]),
    hasDocuments: hasAny(["docs", "core", "README.md"]),
    hasWorkQueue: hasAny(["work-queue", "active-work-threads", "core/work-queue.md"]),
    hasAiLogs: hasAny(["ai-logs", "core/claim-control.md", "docs/claim-control.md"]),
    hasApplyChain: hasAny(["apply-plans", "approval-records", "apply-readiness-reports"]),
    hasAdoptionReports: hasAny(["adoption-assurance-reports", "governance-convergence-reports", "native-migration-plans"]),
    productionSensitive: hasAny([
      "docs/WEB_RELEASE_ROLLBACK_BASELINE.md",
      "docs/runbooks",
      "infra/production",
      "scripts/ci",
    ]) ? "Yes" : "Unknown",
  };
}

function resolveSources(root, options) {
  return {
    workflow_next: resolveSource("workflow_next", "workflow-next.mjs", root, ["--json"]),
    native_migration: resolveSource("native_migration", "resolve-native-migration.mjs", root, ["--json"]),
    existing_rule_reconciliation: resolveSource("existing_rule_reconciliation", "resolve-existing-rule-reconciliation.mjs", root, ["--auto-native", "--json"]),
    governance_convergence: resolveSource("governance_convergence", "resolve-governance-convergence.mjs", root, ["--json", "--intent", options.intent]),
    release_plan: resolveSource("release_plan", "resolve-release-plan.mjs", root, ["--json", "--intent", options.intent]),
  };
}

function resolveSource(name, script, root, extraArgs) {
  const result = spawnSync(process.execPath, [path.join(scriptDir, script), root, ...extraArgs], {
    cwd: kitRoot,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 20,
  });
  const parsed = parseJson(result.stdout);
  const ok = result.status === 0 && parsed;
  return {
    name,
    status: ok ? sourceStatusFor(name, parsed) : "BLOCKED",
    ref: ok ? `generated:${name}` : script,
    contribution: ok ? sourceContribution(name, parsed) : normalizeLine(result.stderr || result.stdout || `${name} unavailable`),
    authority_block: ok && hasProjectAuthorityBlock(name, parsed) ? "Yes" : "No",
  };
}

function sourceStatusFor(name, parsed) {
  if (hasDirtyProjectState(parsed)) return "NEEDS_INPUT";
  if (name === "workflow_next") {
    const stopActions = new Set([
      "SELECT_OR_CREATE_TARGET",
      "REVIEW_GOVERNANCE_MIGRATION",
      "RUN_ADOPTION_ASSESSMENT",
      "REVIEW_DIRTY_WORKTREE",
      "REVIEW_EXISTING_GOVERNANCE_MAP",
      "WAIT_FOR_ADAPTER_CONFIRMATION",
    ]);
    return parsed.mustStopForHuman === "yes" && stopActions.has(parsed.nextAction) ? "NEEDS_INPUT" : "RECORDED";
  }
  if (name === "native_migration") {
    const posture = parsed.posture || parsed.migrationMode || parsed.structuredEvidence?.posture;
    const state = parsed.projectState?.state || parsed.structuredEvidence?.project_state;
    return /BLOCKED|NEEDS_OWNER/i.test(`${posture || ""} ${state || ""}`) ? "NEEDS_INPUT" : "RECORDED";
  }
  if (name === "existing_rule_reconciliation") {
    const recommendation = parsed.structuredEvidence?.native_adoption_decision?.recommendation || parsed.outcome || "";
    const coverage = parsed.structuredEvidence?.rule_reconciliation_coverage || {};
    const omittedRules = Number.isInteger(coverage.omitted_rules) ? coverage.omitted_rules : 0;
    return omittedRules > 0 || /^(BLOCKED|NEEDS_)/i.test(String(recommendation)) ? "NEEDS_INPUT" : "RECORDED";
  }
  if (name === "governance_convergence") {
    const state = parsed.structuredEvidence?.convergence_state || parsed.humanSummary?.convergenceState || parsed.outcome || "";
    return /^CONVERGENCE_BLOCKED/i.test(String(state)) ? "NEEDS_INPUT" : "RECORDED";
  }
  if (name === "release_plan") {
    const state = parsed.machineReadableEvidence?.release_plan?.state || parsed.humanSummary?.releasePlanState || parsed.outcome || "";
    return /^(BLOCKED|NEEDS_)/i.test(String(state)) ? "NEEDS_INPUT" : "RECORDED";
  }
  return "RECORDED";
}

function hasProjectAuthorityBlock(name, parsed) {
  if (name === "native_migration") {
    const posture = parsed.posture || parsed.migrationMode || parsed.structuredEvidence?.posture || "";
    const state = parsed.projectState?.state || parsed.structuredEvidence?.project_state || parsed.outcome || "";
    return /BLOCKED_NEEDS_OWNER|BLOCKED_BY_PROJECT_AUTHORITY|NEEDS_OWNER/i.test(String(posture))
      || /BLOCKED_NEEDS_OWNER|BLOCKED_BY_PROJECT_AUTHORITY|NEEDS_OWNER/i.test(String(state));
  }
  if (name === "existing_rule_reconciliation") {
    const recommendation = parsed.structuredEvidence?.native_adoption_decision?.recommendation || parsed.outcome || "";
    return /BLOCKED_NEEDS_OWNER|BLOCKED_BY_PROJECT_AUTHORITY|PROJECT_AUTHORITY/i.test(String(recommendation));
  }
  if (name === "governance_convergence") {
    const state = parsed.structuredEvidence?.convergence_state || parsed.humanSummary?.convergenceState || parsed.outcome || "";
    return String(state) === "CONVERGENCE_BLOCKED_BY_PROJECT_AUTHORITY";
  }
  if (name === "release_plan") {
    const state = parsed.machineReadableEvidence?.release_plan?.state || parsed.humanSummary?.releasePlanState || parsed.outcome || "";
    return /BLOCKED_BY_PROJECT_AUTHORITY|NEEDS_RELEASE_OWNER|NEEDS_OWNER/i.test(String(state));
  }
  return false;
}

function hasDirtyProjectState(parsed) {
  const states = [
    parsed.projectState,
    parsed.projectState?.state,
    parsed.structuredEvidence?.project_state,
    parsed.humanSummary?.projectState,
  ].filter(Boolean).map(String);
  const tags = Array.isArray(parsed.projectStateTags) ? parsed.projectStateTags.map(String) : [];
  return [...states, ...tags].includes("DIRTY_WORKTREE_PROJECT");
}

function sourceContribution(name, parsed) {
  if (name === "governance_convergence") return parsed.humanSummary?.convergenceState || parsed.outcome || "recorded";
  if (name === "existing_rule_reconciliation") return parsed.structuredEvidence?.native_adoption_decision?.recommendation || parsed.outcome || "recorded";
  if (name === "native_migration") return parsed.structuredEvidence?.project_state || parsed.projectState?.state || parsed.outcome || "recorded";
  if (name === "release_plan") return parsed.humanSummary?.releasePlanState || parsed.outcome || "recorded";
  return parsed.outcome || parsed.nextAction || parsed.projectState || parsed.reportType || "recorded";
}

function surfacesFor(root, signals, sources, simulation) {
  const hasConvergence = sources.governance_convergence.status === "RECORDED";
  const hasReconciliation = sources.existing_rule_reconciliation.status === "RECORDED";
  const hasMigration = sources.native_migration.status === "RECORDED";
  const applyChain = applyChainStateFor(root, signals);
  return [
    surface("workflow_entry", signals.intentOsOperatingMode === "ACTIVE" ? "VERIFIED" : "MAPPED", "checker:workflow-next", "IntentOS route is available without granting hidden write authority."),
    surface("ai_rules_agents", signals.hasAiRules ? "MAPPED" : "PENDING_APPLY", signals.hasAiRules ? "file:AGENTS.md" : "checker:native-migration", signals.hasAiRules ? "Existing AI rules are preserved or mapped." : "AI rule merge remains pending."),
    surface("engineering_baseline", signals.hasEngineeringBaseline || hasReconciliation ? "MAPPED" : "MISSING", hasReconciliation ? "checker:reconcile-rules" : "checker:baseline", "Existing vs IntentOS engineering baseline comparison must be recorded."),
    surface("environment_baseline", signals.hasEnvironmentBaseline || hasReconciliation ? "MAPPED" : "MISSING", hasReconciliation ? "checker:reconcile-rules" : "checker:baseline", "Environment baseline comparison must be recorded."),
    surface("release_rollback", signals.hasReleaseRollback ? "PROJECT_OWNED" : "PENDING_HUMAN_DECISION", "checker:release-plan", signals.hasReleaseRollback ? "Release and rollback remain project-owned." : "Release owner / rollback posture needs owner confirmation."),
    surface("ci_hooks", signals.hasCiHooks ? "PROJECT_OWNED" : "PENDING_HUMAN_DECISION", "checker:convergence", "CI/hooks require comparison and no unauthorized mutation."),
    surface("documents", signals.hasDocuments || hasConvergence ? "MAPPED" : "MISSING", "checker:convergence", "Document source-of-truth and archive posture must be known."),
    surface("work_queue", signals.hasWorkQueue ? "MAPPED" : "PENDING_APPLY", "checker:work-queue", "Current, paused, and backlog behavior must be known."),
    surface("ai_logs_audit", signals.hasAiLogs || hasConvergence ? "MAPPED" : "PENDING_APPLY", "checker:convergence", "AI logs are governance notes only, not routine command logs."),
    surface("risk_authority", hasMigration || hasConvergence ? "PROJECT_OWNED" : "PENDING_HUMAN_DECISION", "checker:native-migration", "Business, production, data, compliance, secrets, payment, and migration authority remain project-owned."),
    surface("apply_chain", applyChain.status, applyChain.evidence, applyChain.notes),
    surface("simulation_task", simulation.state === "SIMULATION_PASSED" ? "VERIFIED" : "MISSING", simulation.id, "Read-only synthetic task routing must pass before full adoption can be claimed."),
  ];
}

function surface(surfaceName, status, evidence, notes) {
  return { surface: surfaceName, status, evidence, notes };
}

function applyChainStateFor(root, signals) {
  if (!signals.hasApplyChain) {
    return {
      status: "NOT_APPLICABLE_WITH_REASON",
      evidence: "human-decision:no-target-writes",
      notes: "No target writes were performed by this assurance report.",
    };
  }
  const reportFiles = nonGitkeepFiles(root, ["apply-plans", "approval-records", "apply-readiness-reports"]);
  if (reportFiles.length === 0) {
    return {
      status: "PRESENT_UNVERIFIED",
      evidence: "checker:apply-readiness",
      notes: "Apply-chain directories exist, but no non-placeholder apply plan, approval record, or readiness report was found.",
    };
  }
  const hasPlan = reportFiles.some((file) => file.startsWith("apply-plans/"));
  const hasApproval = reportFiles.some((file) => file.startsWith("approval-records/"));
  const hasReadiness = reportFiles.some((file) => file.startsWith("apply-readiness-reports/"));
  if (hasPlan && hasApproval && hasReadiness) {
    return {
      status: "VERIFIED",
      evidence: "checker:apply-readiness",
      notes: "Apply plan, approval record, and readiness report files are present.",
    };
  }
  return {
    status: "PRESENT_UNVERIFIED",
    evidence: "checker:apply-readiness",
    notes: "Apply-chain evidence is present but incomplete; plan, approval, and readiness records are all required before verified apply can be claimed.",
  };
}

function nonGitkeepFiles(root, relativeDirs) {
  const result = [];
  for (const relativeDir of relativeDirs) {
    const dir = path.join(root, relativeDir);
    if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) continue;
    walkRelativeFiles(dir, (file) => {
      const name = path.basename(file);
      if (name === ".gitkeep" || name === ".DS_Store") return;
      if (fs.statSync(file).isFile()) result.push(path.join(relativeDir, path.relative(dir, file)).replaceAll(path.sep, "/"));
    });
  }
  return result;
}

function walkRelativeFiles(dir, visit) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkRelativeFiles(full, visit);
    else visit(full);
  }
}

function simulationFor(root, signals) {
  const routeSpecs = [
    ["ask / guide", "resolve-beginner-entry.mjs", [root, "--goal", simulationTask, "--json"]],
    ["workflow-next", "workflow-next.mjs", [root, "--json"]],
    ["work queue / current task check", "resolve-work-queue.mjs", [root, "--json"]],
    ["change impact coverage", "resolve-change-impact-coverage.mjs", [root, "--intent", simulationTask, "--json"]],
    ["review surface", "resolve-review-surface.mjs", [root, "--intent", simulationTask, "--json"]],
    ["apply-plan if write would be needed", "resolve-apply-plan.mjs", [root, "--intent", simulationTask, "--action", "NO_ACTION", "--json"]],
    ["closure / finish decision", "resolve-closure-decision.mjs", [root, "--intent", simulationTask, "--verification", "read-only simulation route completed without target writes", "--json"]],
  ];
  const steps = routeSpecs.map(([step, script, scriptArgs]) => simulationStep(step, script, scriptArgs));
  const route = steps.map((item) => item.step);
  const available = steps.every((item) => item.status !== "SKIPPED");
  let state = "SIMULATION_PASSED";
  if (!available) state = signals.exists === "Yes" ? "SIMULATION_PARTIAL" : "SIMULATION_BLOCKED";
  else if (steps.some((item) => item.status === "FAILED")) state = "SIMULATION_FAILED";
  else if (steps.some((item) => item.status === "BLOCKED")) state = "SIMULATION_BLOCKED";
  return {
    id: "simulation:synthetic-required-field-validation",
    state,
    task: simulationTask,
    writes_target_files: "No",
    route,
    steps,
  };
}

function simulationStep(step, script, scriptArgs) {
  const scriptPath = path.join(scriptDir, script);
  if (!fs.existsSync(scriptPath)) {
    return {
      step,
      status: "SKIPPED",
      ref: `missing:${script}`,
      exit_code: null,
      read_only: "Yes",
      writes_target_files: "No",
      target_diff_status: "UNKNOWN",
      output_digest: "sha256:not-run",
      outcome: `${script} is not available.`,
    };
  }
  const targetRoot = String(scriptArgs[0] || projectRoot);
  const before = targetSnapshot(targetRoot);
  const result = spawnSync(process.execPath, [scriptPath, ...scriptArgs], {
    cwd: kitRoot,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 20,
  });
  const after = targetSnapshot(targetRoot);
  const diffStatus = targetDiffStatus(before, after);
  const text = `${result.stdout || ""}\n${result.stderr || ""}`;
  const output = normalizeLine(result.stdout || result.stderr || "");
  const base = {
    step,
    ref: `checker:${script.replace(/\.mjs$/, "")}`,
    exit_code: Number.isInteger(result.status) ? result.status : -1,
    read_only: "Yes",
    writes_target_files: diffStatus === "CHANGED" ? "Yes" : "No",
    target_diff_status: diffStatus,
    output_digest: digest(text),
  };
  if (result.status !== 0) {
    return {
      ...base,
      status: "FAILED",
      outcome: output || `${script} exited with status ${result.status}`,
    };
  }
  if (diffStatus === "CHANGED") {
    return {
      ...base,
      status: "FAILED",
      outcome: `${script} changed target file state during read-only simulation.`,
    };
  }
  if (diffStatus !== "UNCHANGED") {
    return {
      ...base,
      status: "BLOCKED",
      outcome: `${script} could not prove an unchanged git-backed target diff during read-only simulation.`,
    };
  }
  if (/DIRTY_WORKTREE|MUST_STOP|BLOCKED|NEEDS_HUMAN_DECISION|NEEDS_INPUT/i.test(text)) {
    return {
      ...base,
      status: "BLOCKED",
      outcome: output || `${script} returned a blocking state.`,
    };
  }
  return {
    ...base,
    status: "PASSED",
    outcome: output || `${script} completed.`,
  };
}

function targetSnapshot(root) {
  if (!fs.existsSync(path.join(root, ".git"))) {
    return { kind: "not_git", value: "" };
  }
  const result = spawnSync("git", ["status", "--porcelain"], {
    cwd: root,
    encoding: "utf8",
  });
  if (result.status !== 0) return { kind: "unknown", value: "" };
  return { kind: "git", value: result.stdout || "" };
}

function targetDiffStatus(before, after) {
  if (before.kind !== "git" || after.kind !== "git") {
    return before.kind === "not_git" || after.kind === "not_git" ? "NOT_GIT_REPO" : "UNKNOWN";
  }
  return before.value === after.value ? "UNCHANGED" : "CHANGED";
}

function digest(text) {
  return `sha256:${crypto.createHash("sha256").update(text || "").digest("hex")}`;
}

function hasBlockingSources(sources) {
  return Object.values(sources).some((source) => source.status === "NEEDS_INPUT" || source.status === "BLOCKED");
}

function assuranceStateFor({ surfaces, simulation, dirty, sources }) {
  if (dirty) return "BLOCKED_BY_DIRTY_WORKTREE";
  if (Object.values(sources).some((source) => source.authority_block === "Yes")) {
    return "BLOCKED_BY_PROJECT_AUTHORITY";
  }
  if (hasBlockingSources(sources)) return "BLOCKED_BY_UPSTREAM_EVIDENCE";
  const hasMissing = surfaces.some((item) => item.status === "MISSING");
  const hasPending = surfaces.some((item) => item.status === "PENDING_APPLY" || item.status === "PENDING_HUMAN_DECISION" || item.status === "BLOCKED" || item.status === "PRESENT_UNVERIFIED");
  const allSourcesRecorded = Object.values(sources).every((source) => source.status === "RECORDED");
  const allSimulationStepsPassed = Array.isArray(simulation.steps)
    && simulation.steps.length > 0
    && simulation.steps.every((step) => step.status === "PASSED" && step.exit_code === 0 && step.writes_target_files === "No" && step.target_diff_status === "UNCHANGED");
  if (!hasMissing && !hasPending && simulation.state === "SIMULATION_PASSED" && allSourcesRecorded && allSimulationStepsPassed) return "VERIFIED_ACTIVE";
  if (simulation.state === "SIMULATION_FAILED") return "FAILED_ASSURANCE";
  return hasMissing ? "READ_ONLY_DIAGNOSIS_ONLY" : "PARTIAL_ADOPTION";
}

function pendingDecisionsFor(surfaces, dirty, sources) {
  const pending = [];
  if (dirty) pending.push("Classify current dirty worktree before adoption assurance can be finalized.");
  for (const item of surfaces) {
    if (["MISSING", "PENDING_APPLY", "PENDING_HUMAN_DECISION", "BLOCKED"].includes(item.status)) {
      pending.push(`${item.surface}: ${item.notes}`);
    }
  }
  for (const source of Object.values(sources)) {
    if (source.status === "NEEDS_INPUT" || source.status === "BLOCKED") {
      pending.push(`${source.name}: ${source.contribution}`);
    }
  }
  return [...new Set(pending)];
}

function evidenceRefsFor(surfaces, sources, simulation) {
  const refs = surfaces.map((item) => item.evidence).filter(Boolean);
  refs.push(simulation.id);
  for (const source of Object.values(sources)) refs.push(source.ref);
  return [...new Set(refs)];
}

function targetProjectProfileFor(root, signals) {
  if (signals.isSourceRepo === "Yes") return "intentos_source_repository";
  if (signals.productionSensitive === "Yes") return "existing_production_or_governed_project";
  if (signals.hasAiRules || signals.hasCiHooks || signals.hasReleaseRollback) return "existing_governed_project";
  if (fs.existsSync(root)) return "existing_project";
  return "unknown_target";
}

function forbiddenClaimsFor() {
  return [
    "does not write target files",
    "does not authorize target-file writes",
    "does not approve implementation",
    "does not approve release or production",
    "does not mutate CI or hooks",
    "does not replace project-owned release SOP",
    "does not transfer project authority to IntentOS",
    "does not prove product correctness",
  ];
}

function boundaryFor() {
  return {
    writes_target_files: "No",
    authorizes_target_file_writes: "No",
    approves_implementation: "No",
    approves_release_or_production: "No",
    mutates_ci_or_hooks: "No",
    replaces_release_sop: "No",
    transfers_project_authority_to_intentos: "No",
    proves_product_correctness: "No",
  };
}

function nextSafeStepFor(state) {
  if (state === "VERIFIED_ACTIVE") return "continue work in IntentOS mode while preserving project-owned release and risk authority";
  if (state === "BLOCKED_BY_DIRTY_WORKTREE") return "classify current worktree changes before migration or assurance apply planning";
  if (state === "BLOCKED_BY_PROJECT_AUTHORITY") return "resolve project-owned release, CI/hook, or protected authority decision before full adoption";
  if (state === "BLOCKED_BY_UPSTREAM_EVIDENCE") return "resolve blocked upstream migration, reconciliation, convergence, or release-plan evidence before claiming adoption";
  if (state === "READ_ONLY_DIAGNOSIS_ONLY") return "record missing adoption surfaces before claiming adoption";
  if (state === "FAILED_ASSURANCE") return "remove unsupported adoption claims and rerun assurance";
  return "prepare or verify a bounded apply plan for missing surfaces, then rerun adoption assurance";
}

function isDirty(root) {
  if (!fs.existsSync(path.join(root, ".git"))) return false;
  const result = spawnSync("git", ["status", "--porcelain"], {
    cwd: root,
    encoding: "utf8",
  });
  return result.status === 0 && result.stdout.trim().length > 0;
}

function parseJson(content) {
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

function normalizeLine(value) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, 240) || "unavailable";
}

function humanReportText(report) {
  const lines = [];
  const push = (line = "") => lines.push(line);
  push("# Adoption Assurance Report");
  push("");
  push("This report is a read-only evidence-bound verification view. It does not write target files, authorize writes, approve release, or replace project-owned rules.");
  push("");
  push("## Adoption Summary");
  push("");
  push("| Field | Value |");
  push("| --- | --- |");
  push(`| Target Project Profile | \`${report.humanSummary.targetProjectProfile}\` |`);
  push(`| Assurance State | \`${report.humanSummary.assuranceState}\` |`);
  push(`| IntentOS Operating Mode | \`${report.humanSummary.intentOsOperatingMode}\` |`);
  push(`| Can Claim Full Adoption | \`${report.humanSummary.canClaimFullAdoption}\` |`);
  push(`| Can Codex Write Now | \`${report.humanSummary.canCodexWriteNow}\` |`);
  push("");
  push("## Assurance State");
  push("");
  push(`\`${report.outcome}\``);
  push("");
  push("## Target Project State");
  push("");
  push("| Field | Value |");
  push("| --- | --- |");
  for (const [key, value] of Object.entries(report.targetProjectState)) {
    push(`| ${key} | \`${value}\` |`);
  }
  push("");
  push("## Adoption Surface Coverage");
  push("");
  push("| Surface | Status | Evidence | Notes |");
  push("| --- | --- | --- | --- |");
  for (const item of report.surfaces) {
    push(`| ${item.surface} | \`${item.status}\` | \`${item.evidence}\` | ${item.notes} |`);
  }
  push("");
  push("## Evidence Resolution");
  push("");
  for (const ref of report.evidenceRefs) push(`- \`${ref}\``);
  push("");
  push("## Actual Diff / File State Check");
  push("");
  push("No target writes are authorized by this report. Any past write claim must be backed by apply plan, approval record, controlled readiness, and project file/diff evidence.");
  push("");
  push("## Existing Rule Coverage");
  push("");
  push(`Existing rule reconciliation source: \`${report.sourceSystems.existing_rule_reconciliation.status}\` - ${report.sourceSystems.existing_rule_reconciliation.contribution}`);
  push("");
  push("## Governance Convergence Coverage");
  push("");
  push(`Governance convergence source: \`${report.sourceSystems.governance_convergence.status}\` - ${report.sourceSystems.governance_convergence.contribution}`);
  push("");
  push("## Simulation Task Result");
  push("");
  push(`\`${report.simulation.state}\` using \`${report.simulation.id}\``);
  push("");
  for (const step of report.simulation.route) push(`- ${step}`);
  push("");
  push("## Pending Human Decisions");
  push("");
  if (report.pendingDecisions.length === 0) push("- None blocking full adoption.");
  else for (const item of report.pendingDecisions) push(`- ${item}`);
  push("");
  push("## Forbidden Claims");
  push("");
  push("- This report writes target files: No");
  push("- This report authorizes target-file writes: No");
  push("- This report approves implementation: No");
  push("- This report approves release or production: No");
  push("- This report mutates CI or hooks: No");
  push("- This report replaces release SOP: No");
  push("- This report transfers project authority to IntentOS: No");
  push("- This report proves product correctness: No");
  push("");
  push("## Machine-Readable Evidence");
  push("");
  push("```json");
  push(JSON.stringify(report.structuredEvidence, null, 2));
  push("```");
  return `${lines.join("\n")}\n`;
}

function resolveOutputPath(root, value) {
  if (value === true || !String(value || "").trim()) {
    console.error("FAIL --out requires a relative report path");
    process.exit(1);
  }
  const raw = String(value);
  if (path.isAbsolute(raw) || raw.includes("..")) {
    console.error("FAIL --out must be a relative path inside the target project");
    process.exit(1);
  }
  return path.resolve(root, raw);
}

function writeOutputIfRequested(output) {
  if (!outputPath) return;
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, output.endsWith("\n") ? output : `${output}\n`);
}
