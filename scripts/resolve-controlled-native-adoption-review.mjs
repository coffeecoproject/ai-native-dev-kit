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
  const sources = resolveSources(root);
  const maturity = maturityFor(signals, sources);
  const recommendation = recommendationFor(maturity, signals, sources);
  const reviewRef = outputPath
    ? path.relative(root, outputPath).replaceAll(path.sep, "/")
    : "native-adoption-review-reports/generated.md";
  const baseEvidence = {
    schema_version: "1.82.0",
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
    schemaVersion: "1.82.0",
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
    hasAgents: hasAny(["AGENTS.md", ".codex", ".cursor", ".claude"]),
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

function resolveSources(root) {
  return [
    resolveSource("existing_project_adoption_autopilot", "user-facing summary", "derived_view", "resolve-existing-project-adoption-autopilot.mjs", root, ["--json", "--intent", intent]),
    resolveSource("native_migration", "native migration source evidence", "source_evidence", "resolve-native-migration.mjs", root, ["--json"]),
    resolveSource("existing_rule_reconciliation", "maturity evidence", "source_evidence", "resolve-existing-rule-reconciliation.mjs", root, ["--auto-native", "--json"]),
    resolveSource("governance_convergence", "daily workflow convergence evidence", "source_evidence", "resolve-governance-convergence.mjs", root, ["--json", "--intent", intent]),
    resolveSource("adoption_assurance", "adoption assurance evidence", "source_evidence", "resolve-adoption-assurance.mjs", root, ["--json", "--intent", intent]),
    projectSignalSource(root),
  ];
}

function resolveSource(name, role, authority, script, root, extraArgs) {
  const result = spawnSync(process.execPath, [path.join(scriptDir, script), root, ...extraArgs], {
    cwd: kitRoot,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 20,
  });
  const parsed = parseJson(result.stdout);
  const ok = result.status === 0 && parsed;
  return {
    name,
    role,
    authority,
    status: ok ? sourceStatusFor(name, parsed) : "UNAVAILABLE",
    summary: ok ? sourceSummaryFor(name, parsed) : normalizeLine(result.stderr || result.stdout || `${name} unavailable`),
  };
}

function projectSignalSource(root) {
  const signals = collectSignals(root);
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
    status: signals.exists ? "RECORDED" : "BLOCKED",
    summary: signals.exists ? `present=${present.join(",") || "basic project only"}` : "target project not found",
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

function maturityFor(signals, sources) {
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

  let state = "WEAK_GOVERNANCE_PROJECT";
  if (!signals.exists) state = "UNKNOWN_OR_OWNERLESS_PROJECT";
  else if (signals.dirty) state = "DIRTY_OR_UNSAFE_PROJECT";
  else if (signals.productionSensitive && missing.length >= 3) state = "MESSY_PRODUCTION_PROJECT";
  else if (present.length >= 6 && signals.hasRelease && signals.hasCi) state = "STRONG_GOVERNED_PROJECT";
  else if (!signals.productionSensitive && present.length <= 3) state = "LIGHT_LOW_RISK_PROJECT";

  return {
    state,
    confidence: state === "WEAK_GOVERNANCE_PROJECT" ? "medium" : "high",
    signals_present: present.length > 0 ? present : ["basic project path"],
    signals_missing: missing.length > 0 ? missing : ["no major governance gaps detected"],
    production_sensitivity: signals.productionSensitive ? "yes" : signals.exists ? "unknown" : "unknown",
    recommended_adoption_depth: adoptionDepthFor(state),
  };
}

function adoptionDepthFor(state) {
  if (state === "STRONG_GOVERNED_PROJECT") return "KEEP_PARTIAL_ADOPTION";
  if (state === "MESSY_PRODUCTION_PROJECT") return "GOVERNANCE_REPAIR_ONLY";
  if (state === "LIGHT_LOW_RISK_PROJECT") return "SELECTED_NATIVE_PLAN_ONLY";
  if (state === "DIRTY_OR_UNSAFE_PROJECT" || state === "UNKNOWN_OR_OWNERLESS_PROJECT") return "BLOCK_NATIVE_ADOPTION";
  return "GOVERNANCE_REPAIR_THEN_SELECTED_NATIVE_PLAN";
}

function recommendationFor(maturity, signals, sources) {
  const currentAdoption = currentAdoptionStateFor(sources);
  if (maturity.state === "DIRTY_OR_UNSAFE_PROJECT") {
    return recommendation("BLOCKED_BY_UNSAFE_PROJECT_STATE", currentAdoption, "BLOCK_NATIVE_ADOPTION", "Resolve the unsafe project state before deeper adoption review.", "The project state is unsafe for deeper adoption planning.");
  }
  if (maturity.state === "UNKNOWN_OR_OWNERLESS_PROJECT") {
    return recommendation("BLOCKED_BY_PROJECT_AUTHORITY", currentAdoption, "BLOCK_NATIVE_ADOPTION", "Confirm the project owner or authority boundary before deeper adoption.", "Project authority is unknown.");
  }
  if (maturity.state === "STRONG_GOVERNED_PROJECT") {
    return recommendation("RECOMMEND_STAY_PARTIAL", currentAdoption, "KEEP_PARTIAL_ADOPTION", "Keep the current safe IntentOS working mode.", "Existing governance appears stronger than a generic native asset install.");
  }
  if (maturity.state === "MESSY_PRODUCTION_PROJECT") {
    return recommendation("RECOMMEND_GOVERNANCE_REPAIR", currentAdoption, "GOVERNANCE_REPAIR_ONLY", "Let Codex prepare a governance repair plan without touching code or release settings.", "Production sensitivity and missing governance signals make deeper adoption unsafe.");
  }
  if (maturity.state === "LIGHT_LOW_RISK_PROJECT") {
    return recommendation("READY_FOR_SELECTED_NATIVE_PLAN_ONLY", currentAdoption, "SELECTED_NATIVE_PLAN_ONLY", "Let Codex prepare a deeper adoption plan only.", "The project looks light enough for plan-only deeper adoption review.");
  }
  return recommendation("RECOMMEND_GOVERNANCE_REPAIR", currentAdoption, "GOVERNANCE_REPAIR_THEN_SELECTED_NATIVE_PLAN", "Let Codex prepare a low-risk governance repair plan first.", "Governance gaps should be repaired before any deeper adoption plan.");
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
  if (recommendationValue.recommendation_class === "KEEP_PARTIAL_ADOPTION") {
    return [{ id: "CNAR-KEEP-001", plain_summary: "Keep IntentOS as a planning and review method for the next task.", risk: "low", execution: "review_only" }];
  }
  if (recommendationValue.recommendation_class === "GOVERNANCE_REPAIR_ONLY") {
    return [{ id: "CNAR-REPAIR-001", plain_summary: "Prepare a governance repair plan for workflow, verification, documents, and ownership gaps.", risk: "medium", execution: "plan_only" }];
  }
  if (recommendationValue.recommendation_class === "SELECTED_NATIVE_PLAN_ONLY") {
    return [{ id: "CNAR-PLAN-001", plain_summary: "Prepare a selected deeper adoption plan without applying files.", risk: "low", execution: "plan_only" }];
  }
  if (recommendationValue.recommendation_class === "BLOCK_NATIVE_ADOPTION") {
    return [{ id: "CNAR-BLOCK-001", plain_summary: "Continue read-only analysis until the blocking project state is resolved.", risk: "high", execution: "review_only" }];
  }
  return [{ id: "CNAR-REPAIR-001", plain_summary: "Prepare a low-risk governance repair plan before any deeper adoption proposal.", risk: maturity.production_sensitivity === "yes" ? "medium" : "low", execution: "plan_only" }];
}

function blockedActionsFor(recommendationValue) {
  return [
    { id: "CNAR-B001", plain_summary: "Do not install IntentOS assets.", reason: "1.82 is review-only and cannot apply native assets." },
    { id: "CNAR-B002", plain_summary: "Do not change code, release, CI, production, secrets, data, or provider state.", reason: "Those actions require separate plans, owners, and approval." },
    { id: "CNAR-B003", plain_summary: "Do not claim full adoption.", reason: `The current recommendation is ${recommendationValue.state}, not applied adoption evidence.` },
  ];
}

function humanDecisionsFor(recommendationValue) {
  if (recommendationValue.recommendation_class === "KEEP_PARTIAL_ADOPTION") {
    return [{ decision: "accept_stay_partial", plain_question: "I recommend keeping the current safe working mode. Should Codex continue using that for planning and review?", required_now: "No" }];
  }
  if (recommendationValue.recommendation_class === "BLOCK_NATIVE_ADOPTION") {
    return [{ decision: "resolve_blocker_first", plain_question: "The project needs its blocking state or owner boundary resolved before deeper adoption. Should Codex keep this read-only?", required_now: "Yes" }];
  }
  return [{ decision: "prepare_plan_only_next_step", plain_question: `${recommendationValue.recommended_user_choice} Should Codex prepare that plan?`, required_now: "No" }];
}

function riskVerificationRollbackFor(recommendationValue, maturity) {
  return {
    risk_summary: recommendationValue.reason,
    verification_required: "Re-run this review after any plan is prepared and before any apply step.",
    rollback_plan_required: "Any future write must include a separate rollback or restore plan before approval.",
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
  if (state === "STRONG_GOVERNED_PROJECT") return "This project already has strong governance. Keeping IntentOS as a safe planning and review layer is likely best.";
  if (state === "WEAK_GOVERNANCE_PROJECT") return "This project has governance gaps. A repair plan should come before deeper adoption.";
  if (state === "MESSY_PRODUCTION_PROJECT") return "This project may be production-sensitive and incomplete. Repair governance first without touching runtime or release.";
  if (state === "LIGHT_LOW_RISK_PROJECT") return "This looks like a light, lower-risk project. A deeper adoption plan can be prepared, but not applied.";
  if (state === "UNKNOWN_OR_OWNERLESS_PROJECT") return "The project owner or authority boundary is unclear.";
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
