#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import os from "node:os";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { evaluateVerifiedAdoptionApplyChain } from "./lib/adoption-apply-chain.mjs";
import { evidenceDigest, loadSchema, validateSchema } from "./lib/artifact-schema.mjs";
import { resolveProjectEntryTrust } from "./lib/project-entry-trust.mjs";
import { verifyProjectLocalBehavioralRoute } from "./lib/behavioral-adoption-activation.mjs";
import {
  createSameRunEvidenceEnvelope,
  encodeSameRunEnvelopeBundle,
  sameRunBindingFromTrust,
  sourceRowFromEnvelope,
  validateSameRunEvidenceEnvelope,
} from "./lib/same-run-evidence-envelope.mjs";

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
  const entryTrust = resolveProjectEntryTrust({
    projectRoot: root,
    sourceRoot: kitRoot,
    goal: options.intent,
  });
  const sources = resolveSources(root, options);
  const sameRunEvidence = sameRunEvidenceFor(sources._sameRun);
  const simulation = simulationFor(root, signals);
  const surfaces = surfacesFor(root, signals, sources, simulation);
  const dirty = entryTrust?.project_fact_projection?.current_work_continuity?.state === "CURRENT_CONFLICTED";
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
    same_run_evidence: sameRunEvidence,
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
    sameRunEvidence,
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

function sameRunEvidenceFor(chain) {
  return {
    run_id: chain?.runId || "N/A",
    task_ref: chain?.binding?.taskRef || "N/A",
    persistence_status: "EPHEMERAL",
    durable_authority: "No",
    authorizes_apply: "No",
    authorizes_activation: "No",
    envelopes: (chain?.envelopes || []).map((envelope) => ({
      evidence_type: envelope.evidence_type,
      envelope_id: envelope.envelope_id,
      envelope_digest: envelope.envelope_digest,
      sequence: envelope.sequence,
      producer: envelope.producer,
    })),
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
    hasAiRules: hasAny(["AGENTS.md", "agent.md", ".agent.md", ".codex", ".cursor", ".claude"]),
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
  const entryTrust = resolveProjectEntryTrust({
    projectRoot: root,
    sourceRoot: kitRoot,
    goal: options.intent,
  });
  const binding = sameRunBindingFromTrust(entryTrust);
  const runId = crypto.randomUUID();
  const envelopes = [];
  const native = runSameRunProducer({
    name: "native_migration",
    script: "resolve-native-migration.mjs",
    args: ["--json"],
    schemaRef: "schemas/artifacts/native-migration-plan.schema.json",
    root,
    runId,
    sequence: 1,
    binding,
    sources: [],
    env: process.env,
  });
  if (native.envelope) envelopes.push(native.envelope);

  const reconciliation = runSameRunProducer({
    name: "existing_rule_reconciliation",
    script: "resolve-existing-rule-reconciliation.mjs",
    args: ["--auto-native", "--json", "--intent", options.intent],
    schemaRef: "schemas/artifacts/existing-rule-reconciliation.schema.json",
    root,
    runId,
    sequence: 2,
    binding,
    sources: envelopes,
    env: envelopeEnvironment(process.env, envelopes),
  });
  if (reconciliation.envelope) envelopes.push(reconciliation.envelope);

  const convergence = runSameRunProducer({
    name: "governance_convergence",
    script: "resolve-governance-convergence.mjs",
    args: ["--json", "--intent", options.intent],
    schemaRef: "schemas/artifacts/governance-convergence.schema.json",
    root,
    runId,
    sequence: 3,
    binding,
    sources: envelopes,
    env: envelopeEnvironment(process.env, envelopes),
  });
  if (convergence.envelope) envelopes.push(convergence.envelope);

  const adoptionReview = runSameRunProducer({
    name: "controlled_native_adoption_review",
    script: "resolve-controlled-native-adoption-review.mjs",
    args: ["--json", "--intent", options.intent],
    schemaRef: "schemas/artifacts/controlled-native-adoption-review.schema.json",
    root,
    runId,
    sequence: 4,
    binding,
    sources: convergence.envelope ? [convergence.envelope] : [],
    env: envelopeEnvironment(process.env, convergence.envelope ? [convergence.envelope] : []),
  });
  if (adoptionReview.envelope) envelopes.push(adoptionReview.envelope);

  const result = {
    workflow_next: resolveSource("workflow_next", "workflow-next.mjs", root, ["--json"]),
    native_migration: native.source,
    existing_rule_reconciliation: reconciliation.source,
    governance_convergence: convergence.source,
    controlled_native_adoption_review: adoptionReview.source,
    release_plan: resolveSource("release_plan", "resolve-release-plan.mjs", root, ["--json", "--intent", options.intent]),
  };
  Object.defineProperty(result, "_sameRun", {
    enumerable: false,
    value: { runId, envelopes, binding },
  });
  return result;
}

function runSameRunProducer(options) {
  const humanArgs = options.args.filter((item) => item !== "--json");
  const result = spawnSync(process.execPath, [path.join(scriptDir, options.script), options.root, ...humanArgs], {
    cwd: kitRoot,
    env: options.env,
    input: options.sources.length > 0 ? encodeSameRunEnvelopeBundle(options.sources) : undefined,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 50,
  });
  const extracted = extractSingleMachineEvidence(result.stdout);
  const evidence = extracted.ok ? extracted.value : null;
  const parsed = evidence ? {
    reportType: evidence.report_type,
    schemaVersion: evidence.schema_version,
    generatedBy: `scripts/${options.script}`,
    projectRoot: options.root,
    intent: optionValue(options.args, "--intent") || "Not provided",
    structuredEvidence: evidence,
    outcome: evidence.outcome,
  } : null;
  const schema = loadSchema(options.root, options.schemaRef);
  const validation = evidence && schema
    ? validateSchema(evidence, schema, { label: options.name })
    : { ok: false, errors: [evidence ? `${options.schemaRef} is unavailable` : "structured evidence is missing"] };
  const semantic = result.status === 0 && parsed && validation.ok
    ? validateProducerWithStrictChecker(options, evidence, result.stdout)
    : { ok: false, errors: [] };
  const ok = result.status === 0 && parsed && validation.ok && semantic.ok;
  if (!ok) {
    const diagnostic = [result.error?.message, result.stderr, !parsed ? result.stdout : validation.errors?.join("; "), semantic.errors?.join("; ")]
      .filter(Boolean)
      .join("; ") || `${options.name} unavailable`;
    return {
      source: {
        name: options.name,
        status: "BLOCKED",
        ref: options.script,
        contribution: normalizeLine(diagnostic),
        authority_block: "No",
      },
      envelope: null,
    };
  }
  const envelope = createSameRunEvidenceEnvelope({
    runId: options.runId,
    sequence: options.sequence,
    evidenceType: options.name,
    producer: `scripts/${options.script}`,
    producerSchemaVersion: String(parsed.schemaVersion || evidence.schema_version || "unknown"),
    projectBinding: options.binding.projectBinding,
    taskRef: options.binding.taskRef,
    intentDigest: options.binding.goalDigest,
    goalDigest: options.binding.goalDigest,
    projectFactDigest: options.binding.projectFactDigest,
    guidanceDigest: options.binding.guidanceDigest,
    authorityInventoryDigest: options.binding.authorityInventoryDigest,
    sourceRevision: options.binding.sourceRevision,
    sources: options.sources.map((item) => sourceRowFromEnvelope(item)),
    payload: compactProducerPayload(parsed),
    checkerResult: "PASS",
  });
  const envelopeValidation = validateSameRunEvidenceEnvelope(envelope, {
    evidenceType: options.name,
    producer: `scripts/${options.script}`,
    projectBinding: options.binding.projectBinding,
    taskRef: options.binding.taskRef,
    goalDigest: options.binding.goalDigest,
    projectFactDigest: options.binding.projectFactDigest,
    guidanceDigest: options.binding.guidanceDigest,
    authorityInventoryDigest: options.binding.authorityInventoryDigest,
    sourceRevision: options.binding.sourceRevision,
  });
  if (!envelopeValidation.ok) throw new Error(envelopeValidation.errors.join("; "));
  return {
    source: {
      name: options.name,
      status: sourceStatusFor(options.name, parsed),
      ref: `${envelope.envelope_id}#${envelope.envelope_digest}`,
      contribution: sourceContribution(options.name, parsed),
      authority_block: hasProjectAuthorityBlock(options.name, parsed) ? "Yes" : "No",
    },
    envelope,
  };
}

function validateProducerWithStrictChecker(options, expectedEvidence, humanOutput) {
  const config = sameRunCheckerConfig(options.name);
  if (!config) return { ok: false, errors: [`no strict checker is registered for ${options.name}`] };
  const humanEvidence = extractSingleMachineEvidence(humanOutput);
  if (!humanEvidence.ok) return humanEvidence;
  if (evidenceDigest(humanEvidence.value, []) !== evidenceDigest(expectedEvidence, [])) {
    return { ok: false, errors: [`${options.name} JSON and Markdown evidence differ`] };
  }
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), `intentos-same-run-${options.name}-`));
  try {
    const reportDir = path.join(tempRoot, config.directory);
    fs.mkdirSync(reportDir, { recursive: true });
    const reportFile = sameRunReportFile(tempRoot, reportDir, config, expectedEvidence);
    fs.mkdirSync(path.dirname(reportFile), { recursive: true });
    fs.writeFileSync(reportFile, humanOutput, { flag: "wx" });
    const checked = spawnSync(process.execPath, [
      path.join(scriptDir, config.script),
      tempRoot,
      "--require-structured-evidence",
      ...config.args,
    ], {
      cwd: kitRoot,
      encoding: "utf8",
      maxBuffer: 1024 * 1024 * 50,
    });
    if (checked.status !== 0) {
      return { ok: false, errors: [`${options.name} strict checker failed: ${normalizeLine(checked.stderr || checked.stdout)}`] };
    }
    return { ok: true, errors: [], checker: config.script };
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

function sameRunReportFile(tempRoot, reportDir, config, evidence) {
  if (!config.refField) return path.join(reportDir, "same-run.md");
  const candidate = String(evidence?.[config.refField] || "").replaceAll("\\", "/");
  if (!candidate || path.posix.isAbsolute(candidate) || candidate.split("/").includes("..")) {
    throw new Error(`${config.refField} must be a safe project-relative report path`);
  }
  const normalized = path.posix.normalize(candidate);
  const requiredPrefix = `${config.directory}/`;
  if (!normalized.startsWith(requiredPrefix) || !normalized.endsWith(".md")) {
    throw new Error(`${config.refField} must stay inside ${config.directory} and end in .md`);
  }
  const resolved = path.resolve(tempRoot, normalized);
  const relative = path.relative(path.resolve(reportDir), resolved);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`${config.refField} escapes the strict-check report directory`);
  }
  return resolved;
}

function optionValue(args, flag) {
  const index = args.indexOf(flag);
  return index >= 0 ? String(args[index + 1] || "") : "";
}

function sameRunCheckerConfig(name) {
  return {
    native_migration: { script: "check-native-migration.mjs", directory: "native-migration-plans", args: [] },
    existing_rule_reconciliation: { script: "check-existing-rule-reconciliation.mjs", directory: "existing-rule-reconciliations", args: [] },
    governance_convergence: { script: "check-governance-convergence.mjs", directory: "governance-convergence-reports", args: [] },
    controlled_native_adoption_review: {
      script: "check-controlled-native-adoption-review.mjs",
      directory: "native-adoption-review-reports",
      args: ["--require-report"],
      refField: "review_ref",
    },
  }[name] || null;
}

function extractSingleMachineEvidence(content) {
  const section = String(content || "").match(/## Machine-Readable Evidence\s*\n+```json\s*([\s\S]*?)```/i);
  if (!section) return { ok: false, errors: ["same-run human report has no Machine-Readable Evidence JSON"] };
  try { return { ok: true, value: JSON.parse(section[1]), errors: [] }; } catch (error) {
    return { ok: false, errors: [`same-run human evidence is invalid JSON: ${error.message}`] };
  }
}

function compactProducerPayload(report) {
  return {
    reportType: report.reportType,
    schemaVersion: report.schemaVersion,
    generatedBy: report.generatedBy,
    projectRoot: report.projectRoot,
    intent: report.intent,
    structuredEvidence: report.structuredEvidence,
    outcome: report.outcome,
  };
}

function envelopeEnvironment(base, envelopes) {
  const env = { ...base };
  if (envelopes.length > 0) env.INTENTOS_SAME_RUN_STDIN = "1";
  return env;
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
  if (name === "controlled_native_adoption_review") {
    const state = parsed.structuredEvidence?.adoption_recommendation?.state || parsed.outcome || "";
    return /^(BLOCKED|FAILED)/i.test(String(state)) ? "NEEDS_INPUT" : "RECORDED";
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
  if (name === "controlled_native_adoption_review") {
    const state = parsed.structuredEvidence?.adoption_recommendation?.state || parsed.outcome || "";
    return /BLOCKED_BY_PROJECT_AUTHORITY|NATIVE_APPLY_NOT_RECOMMENDED/i.test(String(state));
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
  if (name === "controlled_native_adoption_review") return parsed.structuredEvidence?.adoption_recommendation?.state || parsed.outcome || "recorded";
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
    surface("release_rollback", "PROJECT_OWNED", "checker:release-plan", signals.hasReleaseRollback ? "Release and rollback remain project-owned." : "Release readiness is not yet assessed and does not block behavioral adoption."),
    surface("ci_hooks", "PROJECT_OWNED", "checker:convergence", signals.hasCiHooks ? "Existing CI/hooks remain project-owned and are compared before mutation." : "No CI/hook authority was observed; Codex keeps this release-scoped surface separate from behavioral adoption."),
    surface("documents", signals.hasDocuments || hasConvergence ? "MAPPED" : "MISSING", "checker:convergence", "Document source-of-truth and archive posture must be known."),
    surface("work_queue", signals.hasWorkQueue ? "MAPPED" : "PENDING_APPLY", "checker:work-queue", "Current, paused, and backlog behavior must be known."),
    surface("ai_logs_audit", signals.hasAiLogs || hasConvergence ? "MAPPED" : "PENDING_APPLY", "checker:convergence", "AI logs are governance notes only, not routine command logs."),
    surface("risk_authority", "PROJECT_OWNED", "checker:native-migration", hasMigration || hasConvergence ? "Protected authority remains project-owned and mapped." : "Protected authority remains project-owned while Codex continues evidence mapping."),
    surface("apply_chain", applyChain.status, applyChain.evidence, applyChain.notes),
    surface("simulation_task", simulation.state === "SIMULATION_PASSED" ? "VERIFIED" : "MISSING", simulation.id, "Read-only synthetic task routing must pass before full adoption can be claimed."),
  ];
}

function surface(surfaceName, status, evidence, notes) {
  return { surface: surfaceName, status, evidence, notes };
}

function applyChainStateFor(root, signals) {
  return evaluateVerifiedAdoptionApplyChain(root, { schemasRoot: kitRoot });
}

function simulationFor(root, signals) {
  const verification = verifyProjectLocalBehavioralRoute({
    targetRoot: root,
    sourceRoot: kitRoot,
    goal: simulationTask,
  });
  const steps = verification.results.map((item) => ({
    step: item.name,
    status: item.exit_code === 0 ? "PASSED" : "FAILED",
    ref: `project-local:${item.name}`,
    exit_code: item.exit_code,
    read_only: "Yes",
    writes_target_files: "No",
    target_diff_status: "UNCHANGED",
    output_digest: item.output_digest,
    outcome: item.error || item.outcome,
  }));
  const route = steps.map((item) => item.step);
  const state = verification.ok
    ? verification.state === "VERIFIED_ACTIVE" ? "SIMULATION_PASSED" : "SIMULATION_READ_ONLY_PASSED"
    : signals.exists === "Yes" ? "SIMULATION_BLOCKED" : "SIMULATION_PARTIAL";
  return {
    id: "simulation:synthetic-required-field-validation",
    state,
    task: simulationTask,
    writes_target_files: "No",
    route,
    steps,
    behavioral_activation_state: verification.state,
    blockers: verification.errors,
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
  return Object.entries(sources).some(([name, source]) => name !== "release_plan"
    && (source.status === "NEEDS_INPUT" || source.status === "BLOCKED"));
}

function assuranceStateFor({ surfaces, simulation, dirty, sources }) {
  if (dirty) return "BLOCKED_BY_DIRTY_WORKTREE";
  if (Object.entries(sources).some(([name, source]) => name !== "release_plan" && source.authority_block === "Yes")) {
    return "BLOCKED_BY_PROJECT_AUTHORITY";
  }
  if (hasBlockingSources(sources)) return "BLOCKED_BY_UPSTREAM_EVIDENCE";
  const applyChain = surfaces.find((item) => item.surface === "apply_chain");
  const hasMissing = surfaces.some((item) => item.status === "MISSING");
  const hasPending = surfaces.some((item) => item.status === "PENDING_APPLY" || item.status === "PENDING_HUMAN_DECISION" || item.status === "BLOCKED" || item.status === "PRESENT_UNVERIFIED");
  const allSourcesRecorded = Object.entries(sources).every(([name, source]) => name === "release_plan" || source.status === "RECORDED");
  const allSimulationStepsPassed = Array.isArray(simulation.steps)
    && simulation.steps.length > 0
    && simulation.steps.every((step) => step.status === "PASSED" && step.exit_code === 0 && step.writes_target_files === "No" && step.target_diff_status === "UNCHANGED");
  if (!hasMissing && !hasPending && applyChain?.status === "VERIFIED" && simulation.state === "SIMULATION_PASSED" && allSourcesRecorded && allSimulationStepsPassed) return "VERIFIED_ACTIVE";
  if (simulation.state === "SIMULATION_FAILED") return "FAILED_ASSURANCE";
  return hasMissing ? "READ_ONLY_DIAGNOSIS_ONLY" : "PARTIAL_ADOPTION";
}

function pendingDecisionsFor(surfaces, dirty, sources) {
  const pending = [];
  if (dirty) pending.push("NO_USER_ACTION: Codex must resolve current-work ownership conflicts before overlapping apply actions.");
  for (const item of surfaces) {
    if (["MISSING", "PENDING_APPLY", "PENDING_HUMAN_DECISION", "BLOCKED"].includes(item.status)) {
      pending.push(`NO_USER_ACTION: ${item.surface}: ${item.notes}`);
    }
  }
  for (const [name, source] of Object.entries(sources)) {
    if (name === "release_plan" && source.status === "NEEDS_INPUT") continue;
    if (source.status === "NEEDS_INPUT" || source.status === "BLOCKED") {
      pending.push(`NO_USER_ACTION: ${source.name}: ${source.contribution}`);
    }
  }
  return [...new Set(pending)];
}

function evidenceRefsFor(surfaces, sources, simulation) {
  const refs = surfaces.map((item) => item.evidence).filter(Boolean);
  const applyChain = applyChainStateFor(projectRoot, collectSignals(projectRoot));
  for (const ref of applyChain.refs || []) refs.push(ref);
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
  if (state === "BLOCKED_BY_DIRTY_WORKTREE") return "Codex resolves current-work ownership and blocks only overlapping apply actions";
  if (state === "BLOCKED_BY_PROJECT_AUTHORITY") return "Codex preserves project authority and continues evidence mapping; ask only for a missing business or external fact";
  if (state === "BLOCKED_BY_UPSTREAM_EVIDENCE") return "Codex resolves blocked migration, reconciliation, or convergence evidence before claiming adoption";
  if (state === "READ_ONLY_DIAGNOSIS_ONLY") return "Codex records and closes missing adoption surfaces before claiming adoption";
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
