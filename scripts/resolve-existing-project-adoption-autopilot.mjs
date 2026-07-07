#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { evidenceDigest } from "./lib/artifact-schema.mjs";

const __filename = fileURLToPath(import.meta.url);
const scriptDir = path.dirname(__filename);
const kitRoot = path.resolve(scriptDir, "..");
const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["json", "format", "intent", "out"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputFormat = args.json ? "json" : String(args.format || "human");
const intent = String(args.intent || args._.slice(1).join(" ") || "adopt existing project into IntentOS").trim();
const outputPath = args.out ? resolveOutputPath(projectRoot, String(args.out)) : "";

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

if (!["human", "json"].includes(outputFormat)) {
  console.error(`FAIL unknown --format: ${outputFormat}`);
  console.error("Use --format human or --json.");
  process.exit(1);
}

const report = buildReport(projectRoot);

if (outputFormat === "json") {
  const output = `${JSON.stringify(report, null, 2)}\n`;
  writeOutputIfRequested(output);
  process.stdout.write(output);
} else {
  const output = humanReportText(report);
  writeOutputIfRequested(output);
  process.stdout.write(output);
}

function buildReport(root) {
  const exists = fs.existsSync(root);
  const sources = exists ? resolveSources(root) : [];
  const projectClassification = projectClassificationFor(root, exists, sources);
  const adoptionState = adoptionStateFor(exists, projectClassification, sources);
  const workingMode = workingModeFor(adoptionState);
  const adoptionRef = outputPath
    ? path.relative(root, outputPath).replaceAll(path.sep, "/")
    : "adoption-autopilot-reports/generated.md";
  const boundary = boundaryFor();
  const forbidden = forbiddenSurfaces();
  const baseEvidence = {
    schema_version: "1.81.0",
    artifact_type: "existing_project_adoption_autopilot",
    intent,
    intent_digest: digest(intent),
    adoption_autopilot_ref: adoptionRef,
    adoption_autopilot_digest: "",
    adoption_state: adoptionState,
    project_classification: projectClassification,
    intentos_working_mode: workingMode,
    project_authority_changed: "No",
    native_assets_installed: "No",
    full_adoption_claim: "No",
    safe_action_budget: "S0_READ_ONLY_ONLY",
    writes_performed: "No",
    runtime_changes_performed: "No",
    source_chain: sources.length > 0 ? sources.map(toEvidenceSource) : [missingProjectSource()],
    internal_actions: internalActionsFor(exists, sources),
    blocked_actions: blockedActionsFor(adoptionState),
    human_decisions: humanDecisionsFor(adoptionState),
    forbidden_surfaces_not_touched: forbidden,
    boundary,
    outcome: adoptionState,
  };
  const structuredEvidence = {
    ...baseEvidence,
    adoption_autopilot_digest: evidenceDigest(baseEvidence, ["adoption_autopilot_digest"]),
  };
  return {
    reportType: "EXISTING_PROJECT_ADOPTION_AUTOPILOT",
    schemaVersion: "1.81.0",
    generatedBy: "scripts/resolve-existing-project-adoption-autopilot.mjs",
    generatedAt: new Date().toISOString(),
    projectRoot: root,
    readOnly: true,
    humanSummary: {
      adoptionState,
      intentosWorkingMode: workingMode,
      projectAuthorityChanged: "No",
      nativeAssetsInstalled: "No",
      fullAdoptionClaim: "No",
      safeNextStep: nextStepFor(adoptionState),
    },
    whatChecked: checkedItemsFor(exists),
    sourceChain: structuredEvidence.source_chain,
    blockedActions: structuredEvidence.blocked_actions,
    humanDecisions: structuredEvidence.human_decisions,
    boundary,
    structuredEvidence,
    outcome: adoptionState,
  };
}

function resolveSources(root) {
  return [
    resolveSource("workflow_next", "workflow-next.mjs", root, ["--json"]),
    resolveSource("native_migration", "resolve-native-migration.mjs", root, ["--json"]),
    resolveSource("existing_rule_reconciliation", "resolve-existing-rule-reconciliation.mjs", root, ["--auto-native", "--json"]),
    resolveSource("governance_convergence", "resolve-governance-convergence.mjs", root, ["--json", "--intent", intent]),
    resolveSource("adoption_assurance", "resolve-adoption-assurance.mjs", root, ["--json", "--intent", intent]),
  ];
}

function resolveSource(name, script, root, extraArgs) {
  const result = spawnSync(process.execPath, [path.join(scriptDir, script), root, ...extraArgs], {
    cwd: kitRoot,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 20,
  });
  if (result.status !== 0) {
    return {
      name,
      status: "FAILED",
      summary: normalizeLine(result.stderr || result.stdout || `${name} failed`),
      authorityBlock: "No",
      parsed: null,
    };
  }
  const parsed = parseJson(result.stdout);
  if (!parsed) {
    return {
      name,
      status: "FAILED",
      summary: `${name} returned non-json output`,
      authorityBlock: "No",
      parsed: null,
    };
  }
  return {
    name,
    status: sourceStatusFor(name, parsed),
    summary: sourceSummaryFor(name, parsed),
    authorityBlock: sourceAuthorityBlockFor(name, parsed),
    parsed,
  };
}

function sourceStatusFor(name, parsed) {
  if (hasDirtyState(parsed)) return "BLOCKED";
  if (name === "workflow_next") {
    return parsed.mustStopForHuman === "yes" ? "NEEDS_REVIEW" : "RECORDED";
  }
  if (name === "native_migration") {
    const state = parsed.projectState?.state || parsed.structuredEvidence?.project_state || parsed.outcome || "";
    if (/DIRTY|BLOCKED/i.test(String(state))) return "BLOCKED";
    if (/PRODUCTION|GOVERNED/i.test(String(state))) return "NEEDS_REVIEW";
    return "RECORDED";
  }
  if (name === "existing_rule_reconciliation") {
    const omitted = Number(parsed.structuredEvidence?.rule_reconciliation_coverage?.omitted_rules || 0);
    const recommendation = parsed.structuredEvidence?.native_adoption_decision?.recommendation || parsed.outcome || "";
    if (/DIRTY/i.test(String(recommendation))) return "BLOCKED";
    if (omitted > 0 || /^BLOCKED|NEEDS_/i.test(String(recommendation))) return "NEEDS_REVIEW";
    return "RECORDED";
  }
  if (name === "governance_convergence") {
    const state = parsed.structuredEvidence?.convergence_state || parsed.humanSummary?.convergenceState || parsed.outcome || "";
    return /^CONVERGENCE_BLOCKED/i.test(String(state)) ? "NEEDS_REVIEW" : "RECORDED";
  }
  if (name === "adoption_assurance") {
    const state = parsed.structuredEvidence?.assurance_state || parsed.humanSummary?.assuranceState || parsed.outcome || "";
    return /^BLOCKED|FAILED/i.test(String(state)) ? "NEEDS_REVIEW" : "RECORDED";
  }
  return "RECORDED";
}

function sourceAuthorityBlockFor(name, parsed) {
  if (name === "existing_rule_reconciliation") {
    const recommendation = parsed.structuredEvidence?.native_adoption_decision?.recommendation || parsed.outcome || "";
    return /PROJECT_AUTHORITY/i.test(String(recommendation)) ? "Yes" : "No";
  }
  if (name === "governance_convergence") {
    const state = parsed.structuredEvidence?.convergence_state || parsed.humanSummary?.convergenceState || parsed.outcome || "";
    return /PROJECT_AUTHORITY/i.test(String(state)) ? "Yes" : "No";
  }
  if (name === "adoption_assurance") {
    const state = parsed.structuredEvidence?.assurance_state || parsed.humanSummary?.assuranceState || parsed.outcome || "";
    return /PROJECT_AUTHORITY/i.test(String(state)) ? "Yes" : "No";
  }
  return "No";
}

function sourceSummaryFor(name, parsed) {
  if (name === "workflow_next") return `next=${parsed.nextAction || "recorded"}`;
  if (name === "native_migration") {
    return `project=${parsed.projectState?.state || parsed.structuredEvidence?.project_state || parsed.outcome || "recorded"}`;
  }
  if (name === "existing_rule_reconciliation") {
    const coverage = parsed.structuredEvidence?.rule_reconciliation_coverage || {};
    return `rules=${coverage.reconciled_rules ?? "unknown"}, omitted=${coverage.omitted_rules ?? 0}`;
  }
  if (name === "governance_convergence") {
    return `state=${parsed.structuredEvidence?.convergence_state || parsed.outcome || "recorded"}`;
  }
  if (name === "adoption_assurance") {
    return `state=${parsed.structuredEvidence?.assurance_state || parsed.outcome || "recorded"}`;
  }
  return "recorded";
}

function projectClassificationFor(root, exists, sources) {
  if (!exists) return "NO_PROJECT";
  if (fs.existsSync(path.join(root, "intentos-manifest.json")) && fs.existsSync(path.join(root, "core", "workflow.md"))) {
    return "INTENTOS_SOURCE_REPOSITORY";
  }
  const native = sources.find((source) => source.name === "native_migration")?.parsed;
  const state = native?.projectState?.state || native?.structuredEvidence?.project_state || "";
  if (/DIRTY/.test(state)) return "DIRTY_WORKTREE_PROJECT";
  if (/PRODUCTION/.test(state)) return "PRODUCTION_SENSITIVE_PROJECT";
  if (/GOVERNED/.test(state)) return "EXISTING_GOVERNED_PROJECT";
  if (/LIGHT/.test(state)) return "EXISTING_LIGHT_PROJECT";
  return "UNKNOWN_EXISTING_PROJECT";
}

function adoptionStateFor(exists, classification, sources) {
  if (!exists) return "BLOCKED_BY_PROJECT_NOT_FOUND";
  if (classification === "DIRTY_WORKTREE_PROJECT" || sources.some((source) => source.status === "BLOCKED")) {
    return "BLOCKED_BY_UNSAFE_PROJECT_STATE";
  }
  if (sources.some((source) => source.status === "FAILED")) return "FAILED_INVALID_EVIDENCE";
  if (sources.some((source) => source.authorityBlock === "Yes")) return "BLOCKED_BY_PROJECT_AUTHORITY";
  if (sources.some((source) => source.status === "NEEDS_REVIEW")) return "READY_FOR_RULE_ENTRY_REVIEW";
  return "SAFE_READ_ONLY_ADOPTION_COMPLETE";
}

function workingModeFor(state) {
  if (state === "BLOCKED_BY_PROJECT_NOT_FOUND" || state === "FAILED_INVALID_EVIDENCE") return "NOT_AVAILABLE";
  if (state === "BLOCKED_BY_UNSAFE_PROJECT_STATE") return "READ_ONLY_DIAGNOSIS_ONLY";
  return "AVAILABLE_FOR_SAFE_USE";
}

function toEvidenceSource(source) {
  return {
    name: source.name,
    status: source.status,
    summary: source.summary || "recorded",
    authority_block: source.authorityBlock || "No",
  };
}

function missingProjectSource() {
  return {
    name: "project_path",
    status: "BLOCKED",
    summary: "target project path does not exist",
    authority_block: "No",
  };
}

function internalActionsFor(exists, sources) {
  if (!exists) {
    return [{ id: "project_path_check", level: "S0", status: "BLOCKED", summary: "Target project path was not found." }];
  }
  return [
    { id: "project_signal_check", level: "S0", status: "COMPLETED", summary: "Project signals were checked without writing files." },
    { id: "read_only_adoption_chain", level: "S0", status: sources.some((source) => source.status === "FAILED") ? "BLOCKED" : "COMPLETED", summary: "Existing IntentOS read-only diagnosis was summarized." },
  ];
}

function blockedActionsFor(state) {
  const common = [
    {
      action: "Write target project files",
      reason: "The 1.81 adoption autopilot line is read-only.",
      required_confirmation: "Handled in a future safe docs-only phase, not this report.",
    },
    {
      action: "Install native IntentOS assets",
      reason: "Native asset installation changes project structure.",
      required_confirmation: "Requires a separate apply plan and approval record.",
    },
  ];
  if (state === "BLOCKED_BY_UNSAFE_PROJECT_STATE") {
    common.push({
      action: "Continue adoption writes",
      reason: "Project state is unsafe for writes.",
      required_confirmation: "Classify current project changes first.",
    });
  }
  return common;
}

function humanDecisionsFor(state) {
  if (state === "READY_FOR_RULE_ENTRY_REVIEW") {
    return [{
      decision: "collaboration_file_review",
      plain_question: "Codex can prepare a plan to update collaboration instructions while preserving stricter project rules. Should Codex prepare that plan?",
      required_now: "No",
    }];
  }
  if (state === "BLOCKED_BY_PROJECT_AUTHORITY") {
    return [{
      decision: "project_owner_review",
      plain_question: "This project has rules that require owner review before deeper adoption. Should Codex prepare an owner review plan?",
      required_now: "No",
    }];
  }
  if (state === "BLOCKED_BY_UNSAFE_PROJECT_STATE") {
    return [{
      decision: "worktree_review",
      plain_question: "The project has existing changes. Should Codex first classify those changes without writing files?",
      required_now: "No",
    }];
  }
  return [{
    decision: "none_required_for_read_only_use",
    plain_question: "No decision is required to use IntentOS as a read-only working method.",
    required_now: "No",
  }];
}

function checkedItemsFor(exists) {
  if (!exists) return ["Target project path"];
  return [
    "Project type and safety signals",
    "Existing rules and governance signals",
    "Whether IntentOS can be used without changing project authority",
    "Whether deeper adoption needs a separate approval plan",
  ];
}

function nextStepFor(state) {
  if (state === "SAFE_READ_ONLY_ADOPTION_COMPLETE") return "Use IntentOS for the next task in read-only guided mode.";
  if (state === "READY_FOR_RULE_ENTRY_REVIEW") return "Prepare a separate plan for collaboration-instruction updates before any project file changes.";
  if (state === "BLOCKED_BY_PROJECT_AUTHORITY") return "Ask the project owner whether Codex may prepare an adoption review plan.";
  if (state === "BLOCKED_BY_UNSAFE_PROJECT_STATE") return "Classify the existing project changes before any adoption writes.";
  if (state === "BLOCKED_BY_PROJECT_NOT_FOUND") return "Provide a valid project path.";
  return "Fix invalid evidence before continuing.";
}

function forbiddenSurfaces() {
  return [
    "code",
    "CI or hooks",
    "release or production configuration",
    "database",
    "API",
    "Web runtime",
    "Docker",
    "secrets",
    "DNS",
    "payment",
    "provider state",
    "data migration",
    "compliance/legal/HR/finance/tax authority",
  ];
}

function boundaryFor() {
  return {
    writes_target_files: "No",
    runtime_changes_performed: "No",
    project_authority_changed: "No",
    native_assets_installed: "No",
    full_adoption_claim: "No",
    approves_implementation: "No",
    approves_release_or_production: "No",
  };
}

function humanReportText(report) {
  const e = report.structuredEvidence;
  return `# Existing Project Adoption Autopilot Report

This report is a read-only adoption view. It did not change the target project.

## Human Summary

| Field | Value |
| --- | --- |
| Current state | \`${e.adoption_state}\` |
| IntentOS working mode | \`${e.intentos_working_mode}\` |
| Project authority changed | \`${e.project_authority_changed}\` |
| Native assets installed | \`${e.native_assets_installed}\` |
| Full adoption claim | \`${e.full_adoption_claim}\` |

## What I Checked

${report.whatChecked.map((item) => `- ${item}`).join("\n")}

## Current Adoption State

${plainStateFor(e.adoption_state)}

## Safe Action Budget

| Level | Status | Meaning |
| --- | --- | --- |
| S0 read-only diagnosis | \`Completed\` | Checked the project without writing files. |

## What I Did Not Change

${e.forbidden_surfaces_not_touched.map((item) => `- ${item}`).join("\n")}
- Project authority files

## What Codex Can Safely Do Next

${report.humanSummary.safeNextStep}

## Human Decisions Needed

${e.human_decisions.map((item) => `- ${item.plain_question}`).join("\n")}

## Technical Trace

| Source | Status | Outcome |
| --- | --- | --- |
${e.source_chain.map((source) => `| \`${source.name}\` | \`${source.status}\` | \`${source.summary}\` |`).join("\n")}

## Boundaries

| Boundary | Value |
| --- | --- |
| Writes target files | \`${e.boundary.writes_target_files}\` |
| Runtime changes performed | \`${e.boundary.runtime_changes_performed}\` |
| Project authority changed | \`${e.boundary.project_authority_changed}\` |
| Native assets installed | \`${e.boundary.native_assets_installed}\` |
| Full adoption claimed | \`${e.boundary.full_adoption_claim}\` |
| Approves implementation | \`${e.boundary.approves_implementation}\` |
| Approves release or production | \`${e.boundary.approves_release_or_production}\` |

## Machine-Readable Evidence

\`\`\`json
${JSON.stringify(e, null, 2)}
\`\`\`

## Outcome

\`${e.outcome}\`
`;
}

function plainStateFor(state) {
  if (state === "SAFE_READ_ONLY_ADOPTION_COMPLETE") return "The project can use IntentOS as a safe read-only working method now. No project files were changed.";
  if (state === "READY_FOR_RULE_ENTRY_REVIEW") return "The project can use IntentOS safely, but deeper adoption needs a separate collaboration-instruction review plan.";
  if (state === "BLOCKED_BY_PROJECT_AUTHORITY") return "The project has authority rules that must be reviewed before deeper adoption.";
  if (state === "BLOCKED_BY_UNSAFE_PROJECT_STATE") return "The project has an unsafe current state for adoption writes. Codex can keep analyzing without writing files.";
  if (state === "BLOCKED_BY_PROJECT_NOT_FOUND") return "The target project path was not found.";
  return "The evidence is invalid or incomplete, so Codex cannot claim adoption status.";
}

function hasDirtyState(parsed) {
  const text = JSON.stringify([
    parsed.projectState,
    parsed.projectState?.state,
    parsed.structuredEvidence?.project_state,
    parsed.outcome,
  ]);
  return /DIRTY_WORKTREE_PROJECT|dirty worktree/i.test(text);
}

function parseJson(content) {
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

function digest(value) {
  return `sha256:${crypto.createHash("sha256").update(String(value || "")).digest("hex")}`;
}

function normalizeLine(value) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, 240) || "not recorded";
}

function resolveOutputPath(root, value) {
  const requested = String(value || "").trim();
  if (!requested) return "";
  if (path.isAbsolute(requested)) {
    const relative = path.relative(root, requested);
    if (relative.startsWith("..") || path.isAbsolute(relative)) {
      console.error("--out must stay inside the target project");
      process.exit(1);
    }
    return requested;
  }
  const resolved = path.resolve(root, requested);
  const relative = path.relative(root, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    console.error("--out must stay inside the target project");
    process.exit(1);
  }
  return resolved;
}

function writeOutputIfRequested(output) {
  if (!outputPath) return;
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, output);
}
