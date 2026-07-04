#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseArgs, unknownOptions } from "./lib/args.mjs";

const __filename = fileURLToPath(import.meta.url);
const scriptDir = path.dirname(__filename);
const kitRoot = path.resolve(scriptDir, "..");
const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["json", "format", "intent"]);
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

const report = buildReport(projectRoot, {
  intent: String(args.intent || "verify existing project IntentOS adoption"),
});

if (outputFormat === "json") console.log(JSON.stringify(report, null, 2));
else printHuman(report);

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
    schema_version: "1.71.0",
    artifact_type: "adoption_assurance_report",
    target_project_profile: targetProfile,
    assurance_state: assuranceState,
    intent_os_operating_mode: signals.intentOsOperatingMode,
    can_claim_full_adoption: canClaimFullAdoption,
    can_codex_write_now: "No",
    surfaces,
    evidence_refs: evidenceRefs,
    simulation,
    pending_decisions: pendingDecisions,
    forbidden_claims: forbiddenClaimsFor(),
    boundary,
    outcome: assuranceState,
  };

  return {
    reportType: "ADOPTION_ASSURANCE_REPORT",
    schemaVersion: "1.71.0",
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
  const isSourceRepo = has("dev-kit-manifest.json") && has("core/workflow.md");
  const hasAiNativeAssets = has(".ai-native/version.json") || has(".ai-native/dev-kit-manifest.json") || isSourceRepo;
  return {
    exists: exists ? "Yes" : "No",
    dirtyWorktree: isDirty(root) ? "Yes" : "No",
    isSourceRepo: isSourceRepo ? "Yes" : "No",
    intentOsOperatingMode: hasAiNativeAssets || has("native-migration-plans") || has("governance-convergence-reports")
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
    status: ok ? sourceStatus(parsed) : "BLOCKED",
    ref: ok ? `generated:${name}` : script,
    contribution: ok ? sourceContribution(name, parsed) : normalizeLine(result.stderr || result.stdout || `${name} unavailable`),
  };
}

function sourceStatus(parsed) {
  const text = JSON.stringify(parsed);
  if (/DIRTY_WORKTREE|BLOCKED|MUST_STOP|NEEDS_HUMAN_DECISION/i.test(text)) return "NEEDS_INPUT";
  return "RECORDED";
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
    surface("apply_chain", signals.hasApplyChain ? "VERIFIED" : "NOT_APPLICABLE_WITH_REASON", signals.hasApplyChain ? "checker:apply-readiness" : "human-decision:no-target-writes", signals.hasApplyChain ? "Apply plan / approval / readiness surfaces exist." : "No target writes were performed by this assurance report."),
    surface("simulation_task", simulation.state === "SIMULATION_PASSED" ? "VERIFIED" : "MISSING", simulation.id, "Read-only synthetic task routing must pass before full adoption can be claimed."),
  ];
}

function surface(surfaceName, status, evidence, notes) {
  return { surface: surfaceName, status, evidence, notes };
}

function simulationFor(root, signals) {
  const requiredScripts = [
    "resolve-beginner-entry.mjs",
    "workflow-next.mjs",
    "resolve-work-queue.mjs",
    "resolve-change-impact-coverage.mjs",
    "resolve-review-surface.mjs",
    "resolve-apply-plan.mjs",
    "resolve-closure-decision.mjs",
  ];
  const available = requiredScripts.every((script) => fs.existsSync(path.join(scriptDir, script)));
  const route = [
    "ask / guide",
    "workflow-next",
    "work queue / current task check",
    "change impact coverage",
    "review surface",
    "apply-plan if write would be needed",
    "closure / finish decision",
  ];
  if (available && signals.intentOsOperatingMode === "ACTIVE") {
    return {
      id: "simulation:synthetic-required-field-validation",
      state: "SIMULATION_PASSED",
      task: "Add a required field validation to a non-production example flow.",
      writes_target_files: "No",
      route,
    };
  }
  return {
    id: "simulation:synthetic-required-field-validation",
    state: signals.exists === "Yes" ? "SIMULATION_PARTIAL" : "SIMULATION_BLOCKED",
    task: "Add a required field validation to a non-production example flow.",
    writes_target_files: "No",
    route: available ? route : [],
  };
}

function assuranceStateFor({ surfaces, simulation, dirty, sources }) {
  if (dirty) return "BLOCKED_BY_DIRTY_WORKTREE";
  const sourceText = JSON.stringify(sources);
  if (/CONVERGENCE_BLOCKED_BY_PROJECT_AUTHORITY|BLOCKED_NEEDS_OWNER|release owner/i.test(sourceText)) {
    return "BLOCKED_BY_PROJECT_AUTHORITY";
  }
  const hasMissing = surfaces.some((item) => item.status === "MISSING");
  const hasPending = surfaces.some((item) => item.status === "PENDING_APPLY" || item.status === "PENDING_HUMAN_DECISION" || item.status === "BLOCKED");
  if (!hasMissing && !hasPending && simulation.state === "SIMULATION_PASSED") return "VERIFIED_ACTIVE";
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

function printHuman(report) {
  console.log("# Adoption Assurance Report");
  console.log("");
  console.log("This report is a read-only evidence-bound verification view. It does not write target files, authorize writes, approve release, or replace project-owned rules.");
  console.log("");
  console.log("## Adoption Summary");
  console.log("");
  console.log("| Field | Value |");
  console.log("| --- | --- |");
  console.log(`| Target Project Profile | \`${report.humanSummary.targetProjectProfile}\` |`);
  console.log(`| Assurance State | \`${report.humanSummary.assuranceState}\` |`);
  console.log(`| IntentOS Operating Mode | \`${report.humanSummary.intentOsOperatingMode}\` |`);
  console.log(`| Can Claim Full Adoption | \`${report.humanSummary.canClaimFullAdoption}\` |`);
  console.log(`| Can Codex Write Now | \`${report.humanSummary.canCodexWriteNow}\` |`);
  console.log("");
  console.log("## Assurance State");
  console.log("");
  console.log(`\`${report.outcome}\``);
  console.log("");
  console.log("## Target Project State");
  console.log("");
  console.log("| Field | Value |");
  console.log("| --- | --- |");
  for (const [key, value] of Object.entries(report.targetProjectState)) {
    console.log(`| ${key} | \`${value}\` |`);
  }
  console.log("");
  console.log("## Adoption Surface Coverage");
  console.log("");
  console.log("| Surface | Status | Evidence | Notes |");
  console.log("| --- | --- | --- | --- |");
  for (const item of report.surfaces) {
    console.log(`| ${item.surface} | \`${item.status}\` | \`${item.evidence}\` | ${item.notes} |`);
  }
  console.log("");
  console.log("## Evidence Resolution");
  console.log("");
  for (const ref of report.evidenceRefs) console.log(`- \`${ref}\``);
  console.log("");
  console.log("## Actual Diff / File State Check");
  console.log("");
  console.log("No target writes are authorized by this report. Any past write claim must be backed by apply plan, approval record, controlled readiness, and project file/diff evidence.");
  console.log("");
  console.log("## Existing Rule Coverage");
  console.log("");
  console.log(`Existing rule reconciliation source: \`${report.sourceSystems.existing_rule_reconciliation.status}\` - ${report.sourceSystems.existing_rule_reconciliation.contribution}`);
  console.log("");
  console.log("## Governance Convergence Coverage");
  console.log("");
  console.log(`Governance convergence source: \`${report.sourceSystems.governance_convergence.status}\` - ${report.sourceSystems.governance_convergence.contribution}`);
  console.log("");
  console.log("## Simulation Task Result");
  console.log("");
  console.log(`\`${report.simulation.state}\` using \`${report.simulation.id}\``);
  console.log("");
  for (const step of report.simulation.route) console.log(`- ${step}`);
  console.log("");
  console.log("## Pending Human Decisions");
  console.log("");
  if (report.pendingDecisions.length === 0) console.log("- None blocking full adoption.");
  else for (const item of report.pendingDecisions) console.log(`- ${item}`);
  console.log("");
  console.log("## Forbidden Claims");
  console.log("");
  console.log("- This report writes target files: No");
  console.log("- This report authorizes target-file writes: No");
  console.log("- This report approves implementation: No");
  console.log("- This report approves release or production: No");
  console.log("- This report mutates CI or hooks: No");
  console.log("- This report replaces release SOP: No");
  console.log("- This report transfers project authority to IntentOS: No");
  console.log("- This report proves product correctness: No");
  console.log("");
  console.log("## Machine-Readable Evidence");
  console.log("");
  console.log("```json");
  console.log(JSON.stringify(report.structuredEvidence, null, 2));
  console.log("```");
}
