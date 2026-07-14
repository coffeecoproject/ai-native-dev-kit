#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { evidenceDigest } from "./lib/artifact-schema.mjs";
import { resolveProjectEntryTrust } from "./lib/project-entry-trust.mjs";
import {
  consumeSameRunEvidenceEnvelope,
  readSameRunEnvelopeFromEnvironment,
  sameRunBindingFromTrust,
} from "./lib/same-run-evidence-envelope.mjs";

const __filename = fileURLToPath(import.meta.url);
const scriptDir = path.dirname(__filename);
const kitRoot = path.resolve(scriptDir, "..");
const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["json", "format", "intent", "out"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputFormat = args.json ? "json" : String(args.format || "human");
const intent = String(args.intent || "review deeper IntentOS adoption").trim();
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
  const signals = collectSignals(root);
  const entryTrust = resolveProjectEntryTrust({
    projectRoot: root,
    sourceRoot: kitRoot,
    goal: intent,
  });
  const sources = resolveSources(root, entryTrust);
  const maturity = maturityFor(signals, sources, entryTrust);
  const recommendation = recommendationFor(maturity, signals, sources);
  const reviewRef = outputPath
    ? path.relative(root, outputPath).replaceAll(path.sep, "/")
    : "native-adoption-review-reports/generated.md";
  const baseEvidence = {
    schema_version: "1.82.1",
    artifact_type: "controlled_native_adoption_review",
    intent,
    intent_digest: digest(intent),
    review_ref: reviewRef,
    review_digest: "",
    governance_maturity: maturity,
    adoption_recommendation: recommendation,
    recommended_actions: recommendedActionsFor(recommendation, maturity),
    blocked_actions: blockedActionsFor(recommendation, maturity),
    human_decisions: humanDecisionsFor(recommendation),
    source_chain: sources,
    risk_verification_rollback: riskVerificationRollbackFor(recommendation, maturity),
    boundaries: boundaryFor(),
    outcome: recommendation.state,
  };
  const structuredEvidence = {
    ...baseEvidence,
    review_digest: evidenceDigest(baseEvidence, ["review_digest"]),
  };
  return {
    reportType: "CONTROLLED_NATIVE_ADOPTION_REVIEW",
    schemaVersion: "1.82.1",
    generatedBy: "scripts/resolve-controlled-native-adoption-review.mjs",
    generatedAt: new Date().toISOString(),
    projectRoot: root,
    readOnly: true,
    humanSummary: {
      projectMaturity: plainMaturityFor(maturity.state),
      recommendation: recommendation.recommended_user_choice,
      codexCanWriteNow: "No",
      nativeApplyAllowed: "No",
      fullAdoptionClaim: "No",
    },
    maturitySignals: maturitySignalsFor(maturity),
    sourceChain: sources,
    recommendedActions: structuredEvidence.recommended_actions,
    blockedActions: structuredEvidence.blocked_actions,
    humanDecisions: structuredEvidence.human_decisions,
    riskVerificationRollback: structuredEvidence.risk_verification_rollback,
    boundaries: structuredEvidence.boundaries,
    structuredEvidence,
    outcome: recommendation.state,
  };
}

function collectSignals(root) {
  const exists = fs.existsSync(root);
  const has = (relativePath) => exists && fs.existsSync(path.join(root, relativePath));
  const hasAny = (items) => items.some((item) => has(item));
  const dirty = exists && isGitDirty(root);
  return {
    exists,
    dirty,
    hasAgents: hasAny(["AGENTS.md", "agent.md", ".agent.md", ".codex", ".cursor", ".claude"]),
    hasCi: hasAny([".github/workflows", "scripts/ci", "scripts/guard", ".husky"]),
    hasRelease: hasAny(["docs/WEB_RELEASE_ROLLBACK_BASELINE.md", "docs/release", "docs/releases", "docs/runbooks", "release-evidence-reports"]),
    hasEngineeringBaseline: hasAny(["docs/engineering-baseline.md", "docs/WEB_ENGINEERING_BASELINE.md", "core/engineering-baseline.md"]),
    hasEnvironmentBaseline: hasAny(["docs/environment-baseline.md", "docs/WEB_ENVIRONMENT_BASELINE.md", "core/environment-baseline.md"]),
    hasTests: hasAny(["tests", "test", "__tests__", "e2e", "playwright.config.ts", "vitest.config.ts", "jest.config.js"]),
    hasDocs: hasAny(["README.md", "docs", "core"]),
    hasWorkQueue: hasAny(["work-queue", "active-work-threads", "core/work-queue.md"]),
    hasApplyChain: hasAny(["apply-plans", "approval-records", "apply-readiness-reports"]),
    productionSensitive: hasAny(["docs/WEB_RELEASE_ROLLBACK_BASELINE.md", "docs/runbooks", "infra/production", "scripts/ci", "release-evidence-reports"]),
  };
}

function resolveSources(root, entryTrust) {
  const envelopes = {
    native_migration: readSameRunEnvelopeFromEnvironment("native_migration"),
    existing_rule_reconciliation: readSameRunEnvelopeFromEnvironment("existing_rule_reconciliation"),
    governance_convergence: readSameRunEnvelopeFromEnvironment("governance_convergence"),
  };
  const sameRunMode = Object.values(envelopes).some(Boolean);
  const expectedRunId = envelopes.governance_convergence?.run_id || envelopes.native_migration?.run_id;
  if (sameRunMode && envelopes.governance_convergence && !envelopes.native_migration && !envelopes.existing_rule_reconciliation) {
    return [
      resolveEnvelopeOrSource("governance_convergence", "bound same-run adoption source chain", "source_evidence", "resolve-governance-convergence.mjs", root, ["--json", "--intent", intent], entryTrust, 3, expectedRunId, true, envelopes.governance_convergence),
      projectSignalSource(root, entryTrust),
    ];
  }
  return [
    resolveEnvelopeOrSource("native_migration", "native migration source evidence", "source_evidence", "resolve-native-migration.mjs", root, ["--json"], entryTrust, 1, expectedRunId, sameRunMode, envelopes.native_migration),
    resolveEnvelopeOrSource("existing_rule_reconciliation", "maturity evidence", "source_evidence", "resolve-existing-rule-reconciliation.mjs", root, ["--auto-native", "--json"], entryTrust, 2, expectedRunId, sameRunMode, envelopes.existing_rule_reconciliation),
    resolveEnvelopeOrSource("governance_convergence", "daily workflow convergence evidence", "source_evidence", "resolve-governance-convergence.mjs", root, ["--json", "--intent", intent], entryTrust, 3, expectedRunId, sameRunMode, envelopes.governance_convergence),
    projectSignalSource(root, entryTrust),
  ];
}

function resolveEnvelopeOrSource(name, role, authority, script, root, extraArgs, entryTrust, sequence, runId, sameRunMode, suppliedEnvelope) {
  const envelope = suppliedEnvelope || null;
  if (sameRunMode && !envelope) {
    return {
      name,
      role,
      authority,
      status: "BLOCKED",
      summary: `same-run chain is incomplete: ${name} envelope is missing`,
      ref: `same-run:${name}:missing`,
      digest: digest(`missing:${name}`),
      source_outcome: "INCOMPLETE_SAME_RUN_EVIDENCE",
      current_project_match: "Unknown",
      blocker_class: "unavailable",
    };
  }
  if (!envelope) return resolveSource(name, role, authority, script, root, extraArgs, entryTrust);
  const binding = sameRunBindingFromTrust(entryTrust);
  try {
    const parsed = consumeSameRunEvidenceEnvelope(envelope, {
      evidenceType: name,
      producer: `scripts/${script}`,
      sequence,
      runId,
      projectBinding: binding.projectBinding,
      taskRef: binding.taskRef,
      intentDigest: binding.goalDigest,
      goalDigest: binding.goalDigest,
      projectFactDigest: binding.projectFactDigest,
      guidanceDigest: binding.guidanceDigest,
      authorityInventoryDigest: binding.authorityInventoryDigest,
      sourceRevision: binding.sourceRevision,
    });
    const summary = sourceSummaryFor(name, parsed);
    const blockerClass = sourceBlockerClassFor(name, parsed, summary, true, entryTrust);
    return {
      name,
      role,
      authority,
      status: sourceStatusFor(name, parsed),
      summary,
      ref: envelope.envelope_id,
      digest: envelope.envelope_digest,
      source_outcome: sourceOutcomeFor(name, parsed),
      current_project_match: currentProjectMatchFor(root, blockerClass, true),
      blocker_class: blockerClass,
    };
  } catch (error) {
    return {
      name,
      role,
      authority,
      status: "BLOCKED",
      summary: `same-run source rejected: ${error.message}`,
      ref: envelope?.envelope_id || `same-run:${name}:invalid`,
      digest: envelope?.envelope_digest || digest("invalid-envelope"),
      source_outcome: "INVALID_SAME_RUN_EVIDENCE",
      current_project_match: "Unknown",
      blocker_class: "unavailable",
    };
  }
}

function resolveSource(name, role, authority, script, root, extraArgs, entryTrust) {
  const result = spawnSync(process.execPath, [path.join(scriptDir, script), root, ...extraArgs], {
    cwd: kitRoot,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 20,
  });
  const parsed = parseJson(result.stdout);
  const ok = result.status === 0 && parsed;
  const summary = ok ? sourceSummaryFor(name, parsed) : normalizeLine(result.stderr || result.stdout || `${name} unavailable`);
  const outcome = ok ? sourceOutcomeFor(name, parsed) : "UNAVAILABLE";
  const blockerClass = sourceBlockerClassFor(name, parsed, summary, ok, entryTrust);
  return {
    name,
    role,
    authority,
    status: ok ? sourceStatusFor(name, parsed) : "UNAVAILABLE",
    summary,
    ref: `resolver:${script}`,
    digest: digest(result.stdout || result.stderr || `${name}:empty-output`),
    source_outcome: outcome,
    current_project_match: currentProjectMatchFor(root, blockerClass, ok),
    blocker_class: blockerClass,
  };
}

function currentProjectMatchFor(root, blockerClass, ok) {
  if (!ok) return "Unknown";
  const insideKit = root === kitRoot || root.startsWith(`${kitRoot}${path.sep}`);
  const hasOwnGit = fs.existsSync(path.join(root, ".git"));
  if (blockerClass === "dirty_or_unsafe" && insideKit && !hasOwnGit) return "No";
  return "Yes";
}

function projectSignalSource(root, entryTrust) {
  const signals = collectSignals(root);
  const currentWorkConflicted = entryTrust?.project_fact_projection?.current_work_continuity?.state === "CURRENT_CONFLICTED";
  const present = [
    signals.hasAgents ? "agents" : "",
    signals.hasCi ? "ci" : "",
    signals.hasRelease ? "release" : "",
    signals.hasEngineeringBaseline ? "engineering-baseline" : "",
    signals.hasEnvironmentBaseline ? "environment-baseline" : "",
    signals.hasTests ? "tests" : "",
  ].filter(Boolean);
  return {
    name: "project_signals",
    role: "filesystem governance signals",
    authority: "project_signal",
    status: !signals.exists || currentWorkConflicted ? "BLOCKED" : "RECORDED",
    summary: signals.exists ? `present=${present.join(",") || "basic project only"}; dirty=${signals.dirty ? "yes" : "no"}` : "target project not found",
    ref: "project:filesystem-signals",
    digest: digest(JSON.stringify(signals)),
    source_outcome: signals.exists
      ? (currentWorkConflicted ? "CURRENT_WORK_CONFLICTED" : signals.dirty ? "DIRTY_WORKTREE_MAPPED" : "PROJECT_SIGNALS_RECORDED")
      : "TARGET_PROJECT_NOT_FOUND",
    current_project_match: signals.exists ? "Yes" : "No",
    blocker_class: !signals.exists ? "project_authority" : currentWorkConflicted ? "dirty_or_unsafe" : "none",
  };
}

function sourceStatusFor(name, parsed) {
  const text = JSON.stringify(parsed);
  if (/DIRTY_WORKTREE_PROJECT|dirty worktree/i.test(text)) return "BLOCKED";
  if (name === "existing_project_adoption_autopilot") return "RECORDED";
  if (/BLOCKED_BY_PROJECT_AUTHORITY|BLOCKED_NEEDS_OWNER|NEEDS_OWNER/i.test(text)) return "BLOCKED";
  if (/NEEDS_REVIEW|NEEDS_INPUT|CONVERGENCE_BLOCKED|BLOCKED_BY_RULE_COVERAGE/i.test(text)) return "NEEDS_INPUT";
  return "RECORDED";
}

function sourceSummaryFor(name, parsed) {
  if (name === "existing_project_adoption_autopilot") {
    return `state=${parsed.structuredEvidence?.adoption_state || parsed.outcome || "recorded"}`;
  }
  if (name === "native_migration") {
    return `project=${parsed.structuredEvidence?.project_state || parsed.projectState?.state || parsed.outcome || "recorded"}`;
  }
  if (name === "existing_rule_reconciliation") {
    const coverage = parsed.structuredEvidence?.rule_reconciliation_coverage || {};
    const recommendation = parsed.structuredEvidence?.native_adoption_decision?.recommendation || parsed.outcome || "recorded";
    return `recommendation=${recommendation}; omitted=${coverage.omitted_rules ?? 0}`;
  }
  if (name === "governance_convergence") {
    return `state=${parsed.structuredEvidence?.convergence_state || parsed.humanSummary?.convergenceState || parsed.outcome || "recorded"}`;
  }
  if (name === "adoption_assurance") {
    return `state=${parsed.structuredEvidence?.assurance_state || parsed.humanSummary?.assuranceState || parsed.outcome || "recorded"}`;
  }
  return parsed.outcome || parsed.reportType || "recorded";
}

function sourceOutcomeFor(name, parsed) {
  if (name === "existing_project_adoption_autopilot") {
    return parsed.structuredEvidence?.outcome || parsed.outcome || parsed.structuredEvidence?.adoption_state || "RECORDED";
  }
  if (name === "native_migration") {
    return parsed.structuredEvidence?.project_state || parsed.projectState?.state || parsed.outcome || "RECORDED";
  }
  if (name === "existing_rule_reconciliation") {
    return parsed.structuredEvidence?.native_adoption_decision?.recommendation || parsed.outcome || "RECORDED";
  }
  if (name === "governance_convergence") {
    return parsed.structuredEvidence?.convergence_state || parsed.humanSummary?.convergenceState || parsed.outcome || "RECORDED";
  }
  if (name === "adoption_assurance") {
    return parsed.structuredEvidence?.assurance_state || parsed.humanSummary?.assuranceState || parsed.outcome || "RECORDED";
  }
  return parsed.outcome || parsed.reportType || "RECORDED";
}

function sourceBlockerClassFor(name, parsed, summary, ok, entryTrust) {
  if (!ok) return "unavailable";
  const text = `${summary}\n${JSON.stringify(parsed)}`;
  if (/DIRTY_WORKTREE_PROJECT|dirty worktree/i.test(text)) {
    return entryTrust?.project_fact_projection?.current_work_continuity?.state === "CURRENT_CONFLICTED"
      ? "dirty_or_unsafe"
      : "none";
  }
  if (/BLOCKED_BY_PROJECT_AUTHORITY|BLOCKED_NEEDS_OWNER|NEEDS_OWNER|authority boundary|owner/i.test(text)) return "project_authority";
  if (/BLOCKED_BY_RULE_COVERAGE|omitted=\d*[1-9]\d*|omitted_rules"\s*:\s*[1-9]\d*/i.test(text)) return "rule_coverage";
  if (/NEEDS_REVIEW|NEEDS_INPUT|CONVERGENCE_BLOCKED/i.test(text)) return "needs_input";
  return "none";
}

function maturityFor(signals, sources, entryTrust) {
  const present = [];
  const missing = [];
  const add = (flag, label) => (flag ? present : missing).push(label);
  add(signals.hasAgents, "collaboration rules");
  add(signals.hasCi, "CI or guard scripts");
  add(signals.hasRelease, "release or rollback policy");
  add(signals.hasEngineeringBaseline, "engineering baseline");
  add(signals.hasEnvironmentBaseline, "environment baseline");
  add(signals.hasTests, "test strategy or test entry");
  add(signals.hasDocs, "project documents");
  add(signals.hasWorkQueue, "work queue");

  const targetHardBlocker = targetBlockingSourceFor(sources);
  const lowRiskEvidence = signals.exists
    && !signals.productionSensitive
    && !signals.hasCi
    && !signals.hasRelease
    && !signals.hasApplyChain
    && !signals.hasWorkQueue;
  const productionSensitivity = signals.productionSensitive ? "yes" : lowRiskEvidence ? "no" : "unknown";
  let state = "WEAK_GOVERNANCE_PROJECT";
  if (!signals.exists) state = "UNKNOWN_OR_OWNERLESS_PROJECT";
  else if (targetHardBlocker?.blocker_class === "dirty_or_unsafe"
    && entryTrust?.project_fact_projection?.current_work_continuity?.state === "CURRENT_CONFLICTED") state = "DIRTY_OR_UNSAFE_PROJECT";
  else if (targetHardBlocker?.blocker_class === "project_authority") state = "UNKNOWN_OR_OWNERLESS_PROJECT";
  else if (signals.productionSensitive && missing.length >= 3) state = "MESSY_PRODUCTION_PROJECT";
  else if (present.length >= 6 && signals.hasRelease && signals.hasCi) state = "STRONG_GOVERNED_PROJECT";
  else if (lowRiskEvidence && present.length <= 3) state = "LIGHT_LOW_RISK_PROJECT";

  return {
    state,
    confidence: state === "WEAK_GOVERNANCE_PROJECT" ? "medium" : "high",
    signals_present: present.length > 0 ? present : ["basic project path"],
    signals_missing: missing.length > 0 ? missing : ["no major governance gaps detected"],
    production_sensitivity: productionSensitivity,
    recommended_adoption_depth: adoptionDepthFor(state),
  };
}

function targetBlockingSourceFor(sources) {
  return sources.find((source) => {
    if (source.status !== "BLOCKED") return false;
    if (!["dirty_or_unsafe", "project_authority"].includes(source.blocker_class)) return false;
    return source.current_project_match === "Yes";
  });
}

function adoptionDepthFor(state) {
  if (state === "STRONG_GOVERNED_PROJECT" || state === "LIGHT_LOW_RISK_PROJECT") return "SELECTED_NATIVE_OVERLAY_PLAN";
  if (state === "MESSY_PRODUCTION_PROJECT" || state === "WEAK_GOVERNANCE_PROJECT") return "GOVERNANCE_REPAIR_THEN_SELECTED_OVERLAY_PLAN";
  if (state === "UNKNOWN_OR_OWNERLESS_PROJECT") return "AUTHORITY_RECONCILIATION_THEN_SELECTED_OVERLAY_PLAN";
  return "BLOCK_NATIVE_ADOPTION";
}

function recommendationFor(maturity, signals, sources) {
  const currentAdoption = currentAdoptionStateFor(sources);
  if (maturity.state === "DIRTY_OR_UNSAFE_PROJECT") {
    return recommendation("BLOCKED_BY_UNSAFE_PROJECT_STATE", currentAdoption, "BLOCK_NATIVE_ADOPTION", "Resolve the unsafe project state before deeper adoption review.", "The project state is unsafe for deeper adoption planning.");
  }
  if (maturity.state === "UNKNOWN_OR_OWNERLESS_PROJECT") {
    return recommendation("READY_FOR_AUTHORITY_RECONCILIATION", currentAdoption, "AUTHORITY_RECONCILIATION_THEN_SELECTED_OVERLAY_PLAN", "Codex will map project authority before preparing the selected overlay.", "Project authority is incomplete, so only the dependent apply actions remain blocked.");
  }
  if (maturity.state === "STRONG_GOVERNED_PROJECT") {
    return recommendation("READY_FOR_SELECTED_NATIVE_OVERLAY_PLAN", currentAdoption, "SELECTED_NATIVE_OVERLAY_PLAN", "Codex will preserve stronger project rules and prepare the smallest behavior-complete overlay.", "Strong governance is mapped authority, not a reason to remain adapter-only.");
  }
  if (maturity.state === "MESSY_PRODUCTION_PROJECT") {
    return recommendation("READY_FOR_GOVERNANCE_REPAIR_AND_OVERLAY_PLAN", currentAdoption, "GOVERNANCE_REPAIR_THEN_SELECTED_OVERLAY_PLAN", "Codex will repair missing governance in the plan and then prepare a selected overlay.", "Production-sensitive gaps require stricter planning but do not create a permanent adapter-only state.");
  }
  if (maturity.state === "LIGHT_LOW_RISK_PROJECT") {
    return recommendation("READY_FOR_SELECTED_NATIVE_OVERLAY_PLAN", currentAdoption, "SELECTED_NATIVE_OVERLAY_PLAN", "Codex will prepare the smallest behavior-complete overlay.", "The project is light enough for a bounded selected overlay plan.");
  }
  return recommendation("READY_FOR_GOVERNANCE_REPAIR_AND_OVERLAY_PLAN", currentAdoption, "GOVERNANCE_REPAIR_THEN_SELECTED_OVERLAY_PLAN", "Codex will prepare governance repairs and a behavior-complete overlay as one bounded plan.", "Governance gaps must be repaired before their dependent overlay actions can apply.");
}

function recommendation(state, currentAdoption, recommendationClass, userChoice, reason) {
  return {
    state,
    current_adoption_state: currentAdoption,
    recommendation_class: recommendationClass,
    recommended_user_choice: userChoice,
    safe_to_apply_now: false,
    native_apply_allowed: false,
    reason,
  };
}

function currentAdoptionStateFor(sources) {
  const adoption = sources.find((source) => source.name === "existing_project_adoption_autopilot");
  const match = adoption?.summary?.match(/state=([^;\s]+)/);
  return match?.[1] || "READ_ONLY_ADOPTION_REVIEWED";
}

function recommendedActionsFor(recommendationValue, maturity) {
  if (recommendationValue.recommendation_class === "SELECTED_NATIVE_OVERLAY_PLAN") {
    return [{ id: "CNAR-PLAN-001", plain_summary: "Prepare the smallest project-local overlay that makes IntentOS the verified daily workflow while preserving stronger project authority.", risk: maturity.production_sensitivity === "yes" ? "medium" : "low", execution: "plan_only" }];
  }
  if (recommendationValue.recommendation_class === "GOVERNANCE_REPAIR_THEN_SELECTED_OVERLAY_PLAN") {
    return [{ id: "CNAR-REPAIR-001", plain_summary: "Prepare one bounded plan that repairs missing governance and then activates the selected IntentOS overlay.", risk: "medium", execution: "plan_only" }];
  }
  if (recommendationValue.recommendation_class === "AUTHORITY_RECONCILIATION_THEN_SELECTED_OVERLAY_PLAN") {
    return [{ id: "CNAR-AUTH-001", plain_summary: "Complete project-authority reconciliation before preparing dependent overlay actions.", risk: "medium", execution: "review_only" }];
  }
  if (recommendationValue.recommendation_class === "BLOCK_NATIVE_ADOPTION") {
    return [{ id: "CNAR-BLOCK-001", plain_summary: "Continue read-only analysis until the blocking project state is resolved.", risk: "high", execution: "review_only" }];
  }
  return [{ id: "CNAR-REPAIR-001", plain_summary: "Prepare a low-risk governance repair plan before any deeper adoption proposal.", risk: maturity.production_sensitivity === "yes" ? "medium" : "low", execution: "plan_only" }];
}

function blockedActionsFor(recommendationValue) {
  return [
    { id: "CNAR-B001", plain_summary: "Do not install IntentOS assets.", reason: "1.82 is review-only and cannot apply native assets." },
    { id: "CNAR-B002", plain_summary: "Do not change code, release, CI, production, secrets, data, or provider state.", reason: "Those actions require a bounded plan, current project evidence, and exact real-world consent when an external effect is ready." },
    { id: "CNAR-B003", plain_summary: "Do not claim full adoption.", reason: `The current recommendation is ${recommendationValue.state}, not applied adoption evidence.` },
  ];
}

function humanDecisionsFor(recommendationValue) {
  return [{
    decision: "NO_USER_ACTION",
    plain_question: "No technical decision is required from the user. Codex continues the safe internal review and planning route.",
    required_now: "No",
  }];
}

function riskVerificationRollbackFor(recommendationValue, maturity) {
  return {
    risk_summary: recommendationValue.reason,
    verification_required: "Re-run this review after any plan is prepared and before any apply step.",
    rollback_plan_required: "Any future write must include a separate rollback or restore plan before controlled apply.",
  };
}

function boundaryFor() {
  return {
    writes_target_files: "No",
    installs_intentos: "No",
    changes_agents_or_ci: "No",
    native_apply_allowed: "No",
    approves_implementation: "No",
    approves_release_or_production: "No",
    full_adoption_claim: "No",
  };
}

function maturitySignalsFor(maturity) {
  return [
    ...maturity.signals_present.map((signal) => ({ signal, status: "present" })),
    ...maturity.signals_missing.map((signal) => ({ signal, status: "missing" })),
  ];
}

function humanReportText(report) {
  const e = report.structuredEvidence;
  return `# Controlled Native Adoption Review Report

This report is a read-only maturity and adoption-depth recommendation. It does not change the target project.

## Human Summary

| Field | Value |
| --- | --- |
| Project maturity | ${plainMaturityFor(e.governance_maturity.state)} |
| Recommendation | ${e.adoption_recommendation.recommended_user_choice} |
| Codex can write now | \`No\` |
| Native apply allowed | \`No\` |
| Full adoption claim | \`No\` |

## Maturity Evidence

| Signal | Status |
| --- | --- |
${report.maturitySignals.map((item) => `| ${item.signal} | \`${item.status}\` |`).join("\n")}

## Source Authority

| Source | Role | Authority | Status |
| --- | --- | --- | --- |
${e.source_chain.map((source) => `| \`${source.name}\` | ${source.role} | \`${source.authority}\` | \`${source.status}\` |`).join("\n")}

## Recommended Actions

${e.recommended_actions.map((item) => `- ${item.plain_summary} (${item.execution})`).join("\n")}

## Blocked Actions

${e.blocked_actions.map((item) => `- ${item.plain_summary}: ${item.reason}`).join("\n")}

## Human Decisions

${e.human_decisions.map((item) => `- ${item.plain_question}`).join("\n")}

## Risk / Verification / Rollback

| Field | Value |
| --- | --- |
| Risk summary | ${e.risk_verification_rollback.risk_summary} |
| Verification required | ${e.risk_verification_rollback.verification_required} |
| Rollback plan required | ${e.risk_verification_rollback.rollback_plan_required} |

## Boundaries

| Boundary | Value |
| --- | --- |
| Writes target files | \`${e.boundaries.writes_target_files}\` |
| Installs IntentOS assets | \`${e.boundaries.installs_intentos}\` |
| Changes AGENTS or CI | \`${e.boundaries.changes_agents_or_ci}\` |
| Native apply allowed | \`${e.boundaries.native_apply_allowed}\` |
| Approves implementation | \`${e.boundaries.approves_implementation}\` |
| Approves release or production | \`${e.boundaries.approves_release_or_production}\` |

## Machine-Readable Evidence

\`\`\`json
${JSON.stringify(e, null, 2)}
\`\`\`

## Outcome

\`${e.outcome}\`
`;
}

function plainMaturityFor(state) {
  if (state === "STRONG_GOVERNED_PROJECT") return "This project has strong governance. IntentOS should preserve it and add only the verified daily-workflow overlay.";
  if (state === "WEAK_GOVERNANCE_PROJECT") return "This project has governance gaps. Codex should repair them inside the selected adoption plan.";
  if (state === "MESSY_PRODUCTION_PROJECT") return "This project may be production-sensitive and incomplete. Codex must prepare stricter repairs before dependent writes.";
  if (state === "LIGHT_LOW_RISK_PROJECT") return "This project can use a small selected overlay after bounded review.";
  if (state === "UNKNOWN_OR_OWNERLESS_PROJECT") return "Project authority must be mapped from evidence before dependent overlay actions are prepared.";
  return "The project state is unsafe for deeper adoption work.";
}

function isGitDirty(root) {
  if (!fs.existsSync(path.join(root, ".git"))) return false;
  const result = spawnSync("git", ["status", "--porcelain"], { cwd: root, encoding: "utf8" });
  return result.status === 0 && result.stdout.trim().length > 0;
}

function digest(value) {
  return `sha256:${crypto.createHash("sha256").update(value).digest("hex")}`;
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

function resolveOutputPath(root, relativePath) {
  if (path.isAbsolute(relativePath)) {
    console.error("FAIL --out must be relative to the target project");
    process.exit(1);
  }
  const resolved = path.resolve(root, relativePath);
  const relative = path.relative(root, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    console.error("FAIL --out must stay inside the target project");
    process.exit(1);
  }
  return resolved;
}

function writeOutputIfRequested(output) {
  if (!outputPath) return;
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, output);
}
