#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import {
  evidenceDigest,
  extractMachineReadableEvidence,
  loadSchema,
  validateEvidenceBlock,
  validateSchema,
} from "./lib/artifact-schema.mjs";
import { sectionBody, splitMarkdownRow, stripMarkdown } from "./lib/markdown.mjs";
import { containsSecretLikeValue } from "./lib/risk-surfaces.mjs";
import { isFileEvidenceRef, resolveAuthoritativeEvidenceReference, validateEvidenceAuthorityBinding } from "./lib/evidence-authority.mjs";
import { asArtifactRef, validateRuntimeTrustBinding } from "./lib/verification-runtime-consumer.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set([
  "json",
  "allow-empty",
  "report",
  "require-report",
  "require-structured-evidence",
  "require-verification-plan-ref",
  "strict-source-binding",
  "require-current-evidence",
  "require-test-quality-controls",
  "require-evidence-authority",
  "require-runtime-trust",
]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputJson = Boolean(args.json);
const allowEmpty = Boolean(args["allow-empty"]);
const requireReport = Boolean(args["require-report"]);
const requireStructuredEvidence = Boolean(args["require-structured-evidence"]);
const requireVerificationPlanRef = Boolean(args["require-verification-plan-ref"]);
const strictSourceBinding = Boolean(args["strict-source-binding"]);
const requireCurrentEvidence = Boolean(args["require-current-evidence"]);
const requireTestQualityControls = Boolean(args["require-test-quality-controls"]);
const requireEvidenceAuthority = Boolean(args["require-evidence-authority"]);
const requireRuntimeTrust = Boolean(args["require-runtime-trust"]);
const strictRequested = requireReport || requireStructuredEvidence || requireVerificationPlanRef
  || strictSourceBinding || requireCurrentEvidence || requireTestQualityControls
  || requireEvidenceAuthority || requireRuntimeTrust || Boolean(args.report);
const explicitReport = args.report ? resolveReportPath(String(args.report)) : "";
const structuredEvidenceSchema = loadSchema(projectRoot, "schemas/artifacts/test-evidence.schema.json");
const verificationPlanSchema = loadSchema(projectRoot, "schemas/artifacts/verification-plan.schema.json");
const isSourceRepo = fs.existsSync(path.join(projectRoot, "intentos-manifest.json"))
  && fs.existsSync(path.join(projectRoot, "core", "workflow.md"));
const shouldRequireAssets = isSourceRepo
  || fs.existsSync(path.join(projectRoot, ".intentos", "intentos-manifest.json"))
  || fs.existsSync(path.join(projectRoot, ".intentos", "version.json"));

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

const requiredAssets = [
  "core/test-evidence-binding.md",
  "docs/test-evidence-binding.md",
  "templates/test-evidence-report.md",
  "schemas/artifacts/test-evidence.schema.json",
  "checklists/test-evidence-review.md",
  "prompts/test-evidence-agent.md",
  "scripts/resolve-test-evidence.mjs",
  "scripts/check-test-evidence.mjs",
];
const requiredDirectories = ["test-evidence-reports"];
const requiredSections = [
  "Human Summary",
  "User Request",
  "Source Systems",
  "Test Evidence Identity",
  "Verification Plan Binding",
  "Evidence Items",
  "Coverage Map",
  "Test Quality Controls",
  "Known Gaps",
  "Manual Verification",
  "Existing Project Mapping",
  "Boundaries",
  "Machine-Readable Evidence",
  "Outcome",
];
const forbiddenClaims = [
  /\bimplementation approved\b/i,
  /\brelease approved\b/i,
  /\bproduction approved\b/i,
  /\bproduction ready\b/i,
  /\bsafe to launch\b/i,
  /\btests prove product correctness\b/i,
  /\bthis report approves release or production:\s*Yes\b/i,
  /\bthis report authorizes implementation:\s*Yes\b/i,
  /\bthis report executes tests:\s*Yes\b/i,
  /\bthis report fabricates evidence:\s*Yes\b/i,
  /\bthis report proves product correctness:\s*Yes\b/i,
  /批准(实现|发布|生产|上线)/,
];
const passingStates = new Set(["PASSED"]);
const nonPassingStates = new Set([
  "FAILED",
  "NOT_RUN_WITH_REASON",
  "SKIPPED_WITH_REASON",
  "FLAKY_REQUIRES_REVIEW",
  "UNRESOLVED",
]);
const invalidManualOwners = new Set(["", "ai", "codex", "tbd", "todo", "unknown", "not recorded", "not provided", "none"]);

let failed = false;
const checks = [];

if (!outputJson) {
  console.log("# Test Evidence Check");
  console.log("");
}

if (shouldRequireAssets) {
  for (const file of requiredAssets) {
    const resolved = resolveAsset(file);
    if (resolved) pass(`${displayAsset(file, resolved)} exists`);
    else fail(`missing ${file}`);
  }
  for (const dir of requiredDirectories) {
    const resolved = resolveDirectory(dir);
    if (resolved) pass(`${displayAsset(dir, resolved)} exists`);
    else fail(`missing ${dir}`);
  }
} else {
  pass("asset completeness check skipped for standalone example or fixture");
}

checkCoreContent();
checkReports();
emitAndExit();

function checkCoreContent() {
  if (!shouldRequireAssets) return;
  const combined = [
    readResolved("core/test-evidence-binding.md"),
    readResolved("docs/test-evidence-binding.md"),
    readResolved("templates/test-evidence-report.md"),
    JSON.stringify(structuredEvidenceSchema || {}),
  ].join("\n");
  if (!combined.trim()) return;
  for (const marker of [
    "Test Evidence Binding",
    "Test Evidence Report",
    "test_evidence_digest",
    "test_evidence_ref",
    "verification_plan_ref",
    "coverage_map",
    "covers_obligations",
    "does not execute tests",
    "does not approve release or production",
  ]) {
    if (combined.includes(marker)) pass(`test evidence docs include ${marker}`);
    else fail(`test evidence docs missing ${marker}`);
  }
}

function checkReports() {
  const files = explicitReport ? [explicitReport] : markdownFiles("test-evidence-reports");
  if (files.length === 0) {
    if (allowEmpty && !strictRequested) {
      pass("test evidence check skipped by explicit --allow-empty: no reports");
    } else if (strictRequested) {
      fail("no Test Evidence reports found; run `test-evidence --out <relative-report-path>` first");
    } else {
      pass("SKIPPED_NO_REPORT: no Test Evidence reports found; no completion claim made");
    }
    return;
  }
  for (const file of files) {
    if (!fs.existsSync(file)) {
      fail(`missing explicit Test Evidence report ${file}`);
      continue;
    }
    checkReport(file);
  }
}

function checkReport(file) {
  const content = fs.readFileSync(file, "utf8");
  const label = rel(file);
  if (containsSecretLikeValue(content)) fail(`${label} contains secret-like content`);
  for (const pattern of forbiddenClaims) {
    if (pattern.test(content)) fail(`${label} contains forbidden Test Evidence claim: ${pattern.source}`);
  }
  for (const section of requiredSections) {
    if (hasSection(content, section)) pass(`${label} includes ${section}`);
    else fail(`${label} missing section ${section}`);
  }
  if (requireRuntimeTrust) {
    if (hasSection(content, "Runtime Trust Binding")) pass(`${label} includes Runtime Trust Binding`);
    else fail(`${label} missing section Runtime Trust Binding`);
  }
  requireBoundaryNo(content, label, "This report writes target files");
  requireBoundaryNo(content, label, "This report executes tests");
  requireBoundaryNo(content, label, "This report fabricates evidence");
  requireBoundaryNo(content, label, "This report authorizes implementation");
  requireBoundaryNo(content, label, "This report approves release or production");
  requireBoundaryNo(content, label, "This report proves product correctness");
  requireBoundaryNo(content, label, "This report proves real-environment behavior");

  const result = validateEvidenceBlock(content, structuredEvidenceSchema, label, {
    require: requireStructuredEvidence || requireVerificationPlanRef || strictSourceBinding || requireCurrentEvidence || requireTestQualityControls || requireEvidenceAuthority || requireRuntimeTrust,
    digestField: "test_evidence_digest",
  });
  if (!result.present && !(requireStructuredEvidence || requireVerificationPlanRef || strictSourceBinding || requireCurrentEvidence || requireTestQualityControls || requireEvidenceAuthority || requireRuntimeTrust)) {
    pass(`${label} structured evidence optional and not present`);
    return;
  }
  if (!result.ok) {
    result.errors.forEach((error) => fail(error));
    return;
  }
  const evidence = result.value;
  pass(`${label} has valid structured evidence`);
  checkRuntimeTrust(label, file, evidence);
  const markdown = parseMarkdownEvidence(content);
  checkEvidenceAuthority(label, file, evidence);
  checkStructuredEvidence(label, file, evidence, markdown);
}

function checkRuntimeTrust(label, file, evidence) {
  const runtimeRequiredByScenario = (evidence.scenario_coverage_map || [])
    .some((item) => item.required_proof_strength === "RUNTIME_TRUSTED_BEHAVIOR_PROOF");
  const runtimeRequired = requireRuntimeTrust || runtimeRequiredByScenario;
  if (!["1.104.0", "1.108.0"].includes(evidence.schema_version)) {
    if (runtimeRequired) fail(`${label} --require-runtime-trust requires Test Evidence schema 1.104.0 or 1.108.0`);
    return;
  }
  if (!runtimeRequired && evidence.runtime_trust_binding?.requirement === "NOT_REQUIRED") {
    const validation = validateRuntimeTrustBinding(projectRoot, evidence.runtime_trust_binding, { required: false });
    if (validation.ok) pass(`${label} Runtime Trust is explicitly not required by the current Verification Plan`);
    else validation.errors.forEach((error) => fail(`${label} ${error}`));
    return;
  }
  const validation = validateRuntimeTrustBinding(projectRoot, evidence.runtime_trust_binding, {
    required: true,
    fromFile: file,
    taskRef: evidence.task_ref,
    intentDigest: evidence.intent_digest,
    verificationPlanRef: evidence.verification_plan_ref,
    verificationPlanDigest: evidence.verification_plan_digest,
  });
  if (!validation.ok) {
    validation.errors.forEach((error) => fail(`${label} ${error}`));
    return;
  }
  pass(`${label} Runtime Trust binding matches the authoritative current run`);
  if (!runtimeRequiredByScenario) return;
  const planRef = resolveAuthoritativeEvidenceReference(projectRoot, file, evidence.verification_plan_ref, { markdownOnly: true });
  const planExtracted = planRef.ok
    ? extractMachineReadableEvidence(fs.readFileSync(planRef.file, "utf8"))
    : null;
  const verificationObligations = planExtracted?.ok && Array.isArray(planExtracted.value?.verification_obligations)
    ? planExtracted.value.verification_obligations
    : [];
  const runtimeObligationIds = new Set(verificationObligations
    .filter((item) => item.required === "Yes" && item.required_proof_strength === "RUNTIME_TRUSTED_BEHAVIOR_PROOF")
    .map((item) => item.id));
  const executionById = new Map((validation.manifest.verification_executions || []).map((item) => [`runtime:${item.id}`, item]));
  const evidenceById = new Map((evidence.evidence_items || []).map((item) => [item.id, item]));
  for (const row of evidence.coverage_map || []) {
    if (row.coverage_state !== "COVERED" || !runtimeObligationIds.has(row.obligation_id)) continue;
    const runtimeIds = (row.evidence_ids || []).filter((id) => executionById.has(id));
    if (runtimeIds.length === 0) {
      fail(`${label} covered obligation ${row.obligation_id} requires evidence from the bound Runtime Trust run`);
      continue;
    }
    for (const id of runtimeIds) {
      const execution = executionById.get(id);
      const item = evidenceById.get(id);
      if (!item || execution.result !== "PASSED" || item.result_state !== "PASSED") {
        fail(`${label} Runtime Trust evidence ${id} must be PASSED in both manifest and Test Evidence`);
        continue;
      }
      if (item.ref !== asArtifactRef(execution.output_ref) || item.output_digest !== execution.output_digest) {
        fail(`${label} Runtime Trust evidence ${id} output ref/digest does not match the bound run`);
      }
      if (!execution.covers_obligations.includes(row.obligation_id) || !item.covers_obligations.includes(row.obligation_id)) {
        fail(`${label} Runtime Trust evidence ${id} does not cover ${row.obligation_id} in both records`);
      }
    }
  }
}

function checkBusinessUniverseScenarioCoverage(label, evidence, verificationPlan) {
  if (evidence.schema_version !== "1.108.0") return;
  const binding = evidence.business_universe_binding;
  const planBinding = verificationPlan?.business_universe_binding;
  if (!binding) {
    fail(`${label} 1.108.0 requires Business Universe bindings in Test Evidence and Verification Plan`);
    return;
  }
  if (!planBinding) {
    if (verificationPlan?.schema_version === "1.76.0"
      && isBoundedNotRequiredUniverseProjection(binding, evidence)) {
      pass(`${label} trusted legacy Verification Plan is projected as Business Universe not required`);
    } else {
      fail(`${label} 1.108.0 requires Business Universe bindings in Test Evidence and current Verification Plan`);
    }
    return;
  }
  if (planBinding.required === "No") {
    if (isBoundedNotRequiredUniverseProjection(binding, evidence)) {
      pass(`${label} non-required Business Universe has no synthetic Test Evidence scenario map`);
    } else {
      fail(`${label} non-required Business Universe must remain a bounded N/A projection`);
    }
    return;
  }
  if (planBinding.required === "Unknown") {
    if (binding.required === "Unknown"
      && binding.routing_result === "TECHNICAL_INSPECTION_REQUIRED"
      && binding.coverage_mapping_status === "BLOCKED"
      && evidence.test_evidence_state === "TEST_EVIDENCE_BLOCKED") {
      pass(`${label} unresolved Business Universe inspection blocks Test Evidence`);
    } else {
      fail(`${label} unresolved Business Universe inspection must block Test Evidence`);
    }
    return;
  }
  for (const field of [
    "required",
    "routing_result",
    "business_universe_ref",
    "business_universe_digest",
    "business_universe_state",
    "coverage_mapping_status",
  ]) {
    if (binding[field] === planBinding[field]) pass(`${label} Business Universe ${field} matches Verification Plan`);
    else fail(`${label} Business Universe ${field} must match Verification Plan`);
  }
  const expectedScenarioIds = uniqueStrings(planBinding.coverage_scenario_ids || []);
  if (sameStringSet(binding.coverage_scenario_ids, expectedScenarioIds) && expectedScenarioIds.length > 0) {
    pass(`${label} Test Evidence binds the exact Business Universe scenario set`);
  } else {
    fail(`${label} Test Evidence must bind the exact non-empty Business Universe scenario set`);
  }
  const rows = evidence.scenario_coverage_map || [];
  const rowIds = rows.map((item) => item.coverage_scenario_id);
  if (sameStringSet(rowIds, expectedScenarioIds) && new Set(rowIds).size === rows.length) {
    pass(`${label} scenario_coverage_map contains every and only Business Universe scenario once`);
  } else {
    fail(`${label} scenario_coverage_map must contain every and only Business Universe scenario once`);
  }
  const coverageByObligation = new Map((evidence.coverage_map || []).map((item) => [item.obligation_id, item]));
  const evidenceIds = new Set((evidence.evidence_items || []).map((item) => item.id));
  for (const scenarioId of expectedScenarioIds) {
    const row = rows.find((item) => item.coverage_scenario_id === scenarioId);
    if (!row) continue;
    const obligations = (verificationPlan.verification_obligations || [])
      .filter((item) => item.required === "Yes" && (item.source_coverage_scenario_ids || []).includes(scenarioId));
    const requiredIds = obligations.map((item) => item.id);
    const coveredIds = requiredIds.filter((id) => coverageByObligation.get(id)?.coverage_state === "COVERED");
    const expectedEvidenceIds = uniqueStrings(requiredIds.flatMap((id) => coverageByObligation.get(id)?.evidence_ids || []));
    const proofStrengths = uniqueStrings(obligations.map((item) => item.required_proof_strength));
    if (sameStringSet(row.required_obligation_ids, requiredIds) && requiredIds.length >= 2) {
      pass(`${label} scenario ${scenarioId} binds all required Verification Plan obligations`);
    } else {
      fail(`${label} scenario ${scenarioId} must bind all expected and negative/reverse obligations`);
    }
    if (sameStringSet(row.covered_obligation_ids, coveredIds)) pass(`${label} scenario ${scenarioId} covered obligations match coverage_map`);
    else fail(`${label} scenario ${scenarioId} covered obligations do not match coverage_map`);
    if (proofStrengths.length === 1 && row.required_proof_strength === proofStrengths[0]) pass(`${label} scenario ${scenarioId} preserves proof strength`);
    else fail(`${label} scenario ${scenarioId} has inconsistent proof strength`);
    if (sameStringSet(row.evidence_ids, expectedEvidenceIds)
      && row.evidence_ids.every((id) => evidenceIds.has(id))) pass(`${label} scenario ${scenarioId} evidence IDs are exact`);
    else fail(`${label} scenario ${scenarioId} evidence IDs must match covered obligation evidence`);
    const expectedState = binding.coverage_mapping_status !== "COMPLETE" || requiredIds.length === 0
      ? "BLOCKED"
      : coveredIds.length === requiredIds.length ? "COVERED" : coveredIds.length > 0 ? "PARTIAL" : "NOT_COVERED";
    if (row.coverage_state === expectedState) pass(`${label} scenario ${scenarioId} coverage state is derived correctly`);
    else fail(`${label} scenario ${scenarioId} coverage state must be ${expectedState}`);
  }
  if (evidence.test_evidence_state === "TEST_EVIDENCE_COMPLETE"
    && rows.some((item) => item.coverage_state !== "COVERED")) {
    fail(`${label} TEST_EVIDENCE_COMPLETE cannot leave a Business Universe scenario incomplete`);
  }
}

function isBoundedNotRequiredUniverseProjection(binding, evidence) {
  return binding.required === "No"
    && binding.routing_result === "NOT_REQUIRED_WITH_REASON"
    && binding.business_universe_ref === "N/A"
    && binding.business_universe_digest === "N/A"
    && binding.business_universe_state === "NOT_REQUIRED_WITH_REASON"
    && binding.coverage_mapping_status === "NOT_REQUIRED"
    && (binding.coverage_scenario_ids || []).length === 0
    && (evidence.scenario_coverage_map || []).length === 0;
}

function checkEvidenceAuthority(label, file, evidence) {
  if (!requireEvidenceAuthority) return;
  const report = resolveAuthoritativeEvidenceReference(projectRoot, "", `artifact:${path.relative(projectRoot, file).split(path.sep).join("/")}`, { markdownOnly: true });
  if (!report.ok) {
    fail(`${label} strict authority requires a project-local non-symlink report: ${report.error}`);
    return;
  }
  const sourceRefs = [
    evidence.verification_plan_ref,
    ...(evidence.source_systems || []).filter((item) => item.status === "RECORDED").map((item) => item.ref),
    ...(evidence.evidence_items || []).map((item) => item.ref),
  ].filter(isFileEvidenceRef);
  const binding = validateEvidenceAuthorityBinding(projectRoot, evidence.authority_binding, {
    fromFile: file,
    taskRef: evidence.task_ref,
    intentDigest: evidence.intent_digest,
    sourceRefs,
  });
  if (binding.ok) pass(`${label} authority binding matches the current project, task, and source files`);
  else binding.errors.forEach((error) => fail(`${label} ${error}`));
}

function checkStructuredEvidence(label, file, evidence, markdown) {
  const refs = testEvidenceRefCandidates(file);
  if (refs.includes(evidence.test_evidence_ref)) {
    pass(`${label} test_evidence_ref points to this report`);
  } else {
    fail(`${label} test_evidence_ref ${evidence.test_evidence_ref || "<missing>"} must point to ${refs.join(" or ")}`);
  }

  if (requireVerificationPlanRef || evidence.test_evidence_state !== "TEST_EVIDENCE_BLOCKED") {
    if (!artifactRef(evidence.verification_plan_ref)) fail(`${label} verification_plan_ref is required`);
  }

  const verificationPlan = checkVerificationPlanBinding(label, file, evidence);
  checkSourceSystemsConsistency(label, evidence, verificationPlan);
  checkEvidenceItems(label, file, evidence, verificationPlan);
  checkCoverageMap(label, evidence, verificationPlan);
  checkBusinessUniverseScenarioCoverage(label, evidence, verificationPlan);
  checkTestQualityControls(label, evidence, verificationPlan);
  checkManualVerification(label, evidence);
  checkBoundaries(label, evidence);
  checkMarkdownJsonConsistency(label, evidence, markdown);
}

function checkVerificationPlanBinding(label, file, evidence) {
  const ref = artifactRef(evidence.verification_plan_ref);
  if (!ref) return null;
  const resolved = resolveArtifact(file, ref, { markdownOnly: true });
  if (!resolved) {
    fail(`${label} verification_plan_ref is not resolvable: ${ref}`);
    return null;
  }
  pass(`${label} verification_plan_ref resolves: ${ref}`);
  const extracted = extractMachineReadableEvidence(fs.readFileSync(resolved, "utf8"));
  if (!extracted?.ok) {
    fail(`${label} verification_plan_ref ${ref} missing valid Machine-Readable Evidence`);
    return null;
  }
  const plan = extracted.value;
  if (verificationPlanSchema) {
    const validation = validateSchema(plan, verificationPlanSchema, { label: `${label} verification_plan_ref ${ref}` });
    if (validation.ok) pass(`${label} verification_plan_ref has valid Verification Plan evidence`);
    else validation.errors.forEach((error) => fail(error));
  }
  if (evidence.verification_plan_digest === plan.verification_plan_digest) {
    pass(`${label} verification_plan_digest matches referenced Verification Plan`);
  } else {
    fail(`${label} verification_plan_digest ${evidence.verification_plan_digest || "<missing>"} must match referenced Verification Plan ${plan.verification_plan_digest || "<missing>"}`);
  }
  if (evidence.task_ref === plan.task_ref) {
    pass(`${label} task_ref matches referenced Verification Plan`);
  } else {
    fail(`${label} task_ref ${evidence.task_ref || "<missing>"} must match Verification Plan task_ref ${plan.task_ref || "<missing>"}`);
  }
  if (evidence.intent_digest === plan.intent_digest) {
    pass(`${label} intent_digest matches referenced Verification Plan`);
  } else {
    fail(`${label} intent_digest must match referenced Verification Plan intent_digest`);
  }
  if (evidence.verification_plan_state === plan.verification_state) {
    pass(`${label} verification_plan_state matches referenced Verification Plan`);
  } else {
    fail(`${label} verification_plan_state ${evidence.verification_plan_state || "<missing>"} must match Verification Plan ${plan.verification_state || "<missing>"}`);
  }
  return plan;
}

function checkSourceSystemsConsistency(label, evidence, verificationPlan) {
  const byName = new Map((evidence.source_systems || []).map((source) => [source.name, source]));
  const planSource = byName.get("verification_plan");
  if (evidence.test_evidence_state === "TEST_EVIDENCE_COMPLETE" || strictSourceBinding) {
    requireRecordedSource(label, planSource, "verification_plan");
    if (verificationPlan?.source_systems?.some((item) => item.name === "business_rule_closure")) {
      requireRecordedSource(label, byName.get("business_rule_closure"), "business_rule_closure");
    }
    if (verificationPlan?.source_systems?.some((item) => item.name === "business_universe_coverage")) {
      requireRecordedSource(label, byName.get("business_universe_coverage"), "business_universe_coverage");
    }
    if (verificationPlan?.source_systems?.some((item) => item.name === "change_impact_coverage")) {
      requireRecordedSource(label, byName.get("change_impact_coverage"), "change_impact_coverage");
    }
  }
  requireSourceField(label, planSource, "verification_plan", "ref", evidence.verification_plan_ref);
  requireSourceField(label, planSource, "verification_plan", "digest", evidence.verification_plan_digest);
  requireSourceField(label, planSource, "verification_plan", "source_outcome", evidence.verification_plan_state);
  if (strictSourceBinding && verificationPlan) {
    for (const source of verificationPlan.source_systems || []) {
      if (!["business_rule_closure", "business_universe_coverage", "change_impact_coverage"].includes(source.name)) continue;
      const carried = byName.get(source.name);
      if (!carried) {
        fail(`${label} source_systems must preserve ${source.name} from Verification Plan`);
        continue;
      }
      requireSourceField(label, carried, source.name, "ref", source.ref);
      requireSourceField(label, carried, source.name, "digest", source.digest);
      requireSourceField(label, carried, source.name, "source_outcome", source.source_outcome);
    }
  }
}

function checkEvidenceItems(label, file, evidence, verificationPlan) {
  const ids = new Set();
  const obligationIds = new Set((verificationPlan?.verification_obligations || []).map((item) => item.id));
  for (const item of evidence.evidence_items || []) {
    if (ids.has(item.id)) fail(`${label} duplicate evidence item ${item.id}`);
    ids.add(item.id);
    if (nonPassingStates.has(item.result_state)) {
      pass(`${label} evidence ${item.id} records non-passing state ${item.result_state}`);
    }
    if (item.result_state === "WAIVED_BY_HUMAN_DECISION" && !/^human-decision:/i.test(item.ref)) {
      fail(`${label} waived evidence ${item.id} requires human-decision ref`);
    }
    if (item.result_state === "PASSED") {
      if (!/^artifact:/i.test(String(item.ref || ""))) fail(`${label} passed evidence ${item.id} requires artifact ref`);
      if (exitCodeValue(item.exit_code) !== 0 && (item.evidence_type === "COMMAND_OUTPUT" || item.evidence_type === "TEST_REPORT")) {
        fail(`${label} passed command evidence ${item.id} requires exit_code 0`);
      }
      if (requireCurrentEvidence && item.ran_after_change !== "Yes") fail(`${label} passed evidence ${item.id} must run after change`);
      if (requireCurrentEvidence && item.current_task_match !== "Yes") fail(`${label} passed evidence ${item.id} must match current task`);
    }
    if (item.result_state === "FAILED" && (item.evidence_type === "COMMAND_OUTPUT" || item.evidence_type === "TEST_REPORT")) {
      const code = exitCodeValue(item.exit_code);
      if ((code === null || code === 0) && !meaningful(item.failure_reason)) {
        fail(`${label} failed command evidence ${item.id} requires non-zero exit_code or failure_reason`);
      }
    }
    if (item.evidence_type === "COMMAND_OUTPUT" || item.evidence_type === "TEST_REPORT") {
      if (!meaningful(item.command)) fail(`${label} command evidence ${item.id} needs command`);
      if (!meaningful(item.environment)) fail(`${label} command evidence ${item.id} needs environment`);
      if (!meaningful(item.ran_at)) fail(`${label} command evidence ${item.id} needs ran_at`);
      if (!Array.isArray(item.covers_obligations) || item.covers_obligations.length === 0) {
        fail(`${label} command evidence ${item.id} needs covers_obligations`);
      }
    }
    if (item.evidence_type === "MANUAL_VERIFICATION" || item.evidence_type === "HUMAN_DECISION") {
      if (invalidOwner(item.owner)) fail(`${label} manual evidence ${item.id} needs a real owner`);
      if (!meaningful(item.environment)) fail(`${label} manual evidence ${item.id} needs environment`);
      if (!meaningful(item.limitations)) fail(`${label} manual evidence ${item.id} needs limitations`);
    }
    for (const obligation of item.covers_obligations || []) {
      if (!obligationIds.has(obligation)) fail(`${label} evidence ${item.id} covers unknown obligation ${obligation}`);
    }
    const resolved = resolveArtifact(file, item.ref, { markdownOnly: false });
    if (resolved) {
      const actualDigest = fileDigest(resolved);
      if (item.output_digest === actualDigest) {
        pass(`${label} evidence ${item.id} output_digest matches ${item.ref}`);
      } else {
        fail(`${label} evidence ${item.id} output_digest ${item.output_digest || "<missing>"} must match ${actualDigest}`);
      }
    } else if (/^artifact:/i.test(item.ref) && item.result_state !== "NOT_RUN_WITH_REASON") {
      fail(`${label} evidence ${item.id} ref is not resolvable: ${item.ref}`);
    }
  }
}

function checkCoverageMap(label, evidence, verificationPlan) {
  const requiredObligations = (verificationPlan?.verification_obligations || []).filter((item) => item.required === "Yes");
  const requiredIds = new Set(requiredObligations.map((item) => item.id));
  const coverageById = new Map((evidence.coverage_map || []).map((row) => [row.obligation_id, row]));
  const evidenceById = new Map((evidence.evidence_items || []).map((item) => [item.id, item]));

  for (const obligation of requiredObligations) {
    const row = coverageById.get(obligation.id);
    if (!row) {
      fail(`${label} coverage_map missing required obligation ${obligation.id}`);
      continue;
    }
    if (row.verification_plan_required !== "Yes") fail(`${label} coverage_map ${obligation.id} must mark verification_plan_required Yes`);
    if (row.coverage_state === "COVERED") {
      if (!row.evidence_ids.length) fail(`${label} covered obligation ${obligation.id} needs evidence_ids`);
      for (const id of row.evidence_ids) {
        const item = evidenceById.get(id);
        if (!item) {
          fail(`${label} coverage_map ${obligation.id} references missing evidence ${id}`);
          continue;
        }
        if (!passingStates.has(item.result_state)) fail(`${label} covered obligation ${obligation.id} cannot use ${item.result_state} evidence ${id}`);
        if (!/^artifact:/i.test(String(item.ref || ""))) fail(`${label} covered obligation ${obligation.id} requires artifact evidence ref for ${id}`);
        if (!item.covers_obligations.includes(obligation.id)) fail(`${label} evidence ${id} must list covers_obligations ${obligation.id}`);
        if (requireCurrentEvidence && item.ran_after_change !== "Yes") fail(`${label} evidence ${id} for ${obligation.id} must run after change`);
        if (requireCurrentEvidence && item.current_task_match !== "Yes") fail(`${label} evidence ${id} for ${obligation.id} must match current task`);
        if (obligation.broad_command_only === "No" && /^npm test$|^npm run test$|^pnpm test$|^npm run verify$/i.test(String(item.command || "").trim())) {
          fail(`${label} covered obligation ${obligation.id} cannot rely on broad command only`);
        }
      }
    }
    if (row.coverage_state === "WAIVED_BY_HUMAN_DECISION") {
      const waiver = row.evidence_ids.map((id) => evidenceById.get(id)).find((item) => item?.result_state === "WAIVED_BY_HUMAN_DECISION");
      if (!waiver) fail(`${label} waived obligation ${obligation.id} requires waived evidence item`);
    }
    if (row.coverage_state !== "COVERED" && evidence.test_evidence_state === "TEST_EVIDENCE_COMPLETE") {
      fail(`${label} TEST_EVIDENCE_COMPLETE cannot include ${row.coverage_state} for ${obligation.id}`);
    }
  }

  for (const row of evidence.coverage_map || []) {
    if (!requiredIds.has(row.obligation_id)) fail(`${label} coverage_map has extra or non-required obligation ${row.obligation_id}`);
    for (const id of row.evidence_ids || []) {
      if (!evidenceById.has(id)) fail(`${label} coverage_map ${row.obligation_id} references missing evidence ${id}`);
    }
  }

  if (evidence.test_evidence_state === "TEST_EVIDENCE_COMPLETE") {
    const allCovered = requiredObligations.length > 0
      && requiredObligations.every((item) => coverageById.get(item.id)?.coverage_state === "COVERED");
    if (allCovered) pass(`${label} TEST_EVIDENCE_COMPLETE covers every required obligation`);
    else fail(`${label} TEST_EVIDENCE_COMPLETE requires every required obligation covered`);
  }
}

function checkTestQualityControls(label, evidence, verificationPlan) {
  if (requireTestQualityControls && (!Array.isArray(evidence.test_quality_controls) || evidence.test_quality_controls.length === 0)) {
    fail(`${label} requires test_quality_controls`);
  }
  const evidenceIds = new Set((evidence.evidence_items || []).map((item) => item.id));
  const evidenceById = new Map((evidence.evidence_items || []).map((item) => [item.id, item]));
  const controlsById = new Map((evidence.test_quality_controls || []).map((control) => [control.id, control]));
  const obligations = verificationPlan?.verification_obligations || [];
  for (const control of evidence.test_quality_controls || []) {
    if (control.status === "SATISFIED" && (!control.evidence_ids || control.evidence_ids.length === 0)) {
      fail(`${label} satisfied control ${control.id} needs evidence_ids`);
    }
    for (const id of control.evidence_ids || []) {
      if (!evidenceIds.has(id)) fail(`${label} control ${control.id} references missing evidence ${id}`);
    }
  }
  for (const required of verificationPlan?.test_correctness_controls || []) {
    if (required.required !== "Yes") continue;
    const carried = controlsById.get(required.id);
    if (!carried) {
      fail(`${label} test_quality_controls must preserve required Verification Plan control ${required.id}`);
      continue;
    }
    if (carried.status !== "SATISFIED" && carried.status !== "NOT_APPLICABLE_WITH_REASON") {
      fail(`${label} required Verification Plan control ${required.id} must be SATISFIED or NOT_APPLICABLE_WITH_REASON`);
    }
    const relatedObligations = obligations
      .filter((obligation) => obligation.required === "Yes" && surfaceList(required.applies_to).includes(obligation.source_surface))
      .map((obligation) => obligation.id);
    if (carried.status === "SATISFIED") {
      if (!carried.evidence_ids?.length) fail(`${label} satisfied required Verification Plan control ${required.id} needs evidence_ids`);
      for (const id of carried.evidence_ids || []) {
        const item = evidenceById.get(id);
        if (!item) continue;
        if (!/^artifact:/i.test(String(item.ref || ""))) fail(`${label} satisfied control ${required.id} requires artifact evidence ref for ${id}`);
        if (item.result_state !== "PASSED" && item.result_state !== "WAIVED_BY_HUMAN_DECISION") {
          fail(`${label} satisfied control ${required.id} cannot rely on ${item.result_state} evidence ${id}`);
        }
      }
      if (relatedObligations.length > 0) {
        const covered = new Set((carried.evidence_ids || []).flatMap((id) => evidenceById.get(id)?.covers_obligations || []));
        for (const obligationId of relatedObligations) {
          if (!covered.has(obligationId)) fail(`${label} satisfied control ${required.id} must support related obligation ${obligationId}`);
        }
      }
    }
    if (carried.status === "NOT_APPLICABLE_WITH_REASON" && !meaningful(carried.reason)) {
      fail(`${label} not-applicable control ${required.id} needs reason`);
    }
  }
  const broad = (evidence.test_quality_controls || []).find((item) => item.id === "control:broad-command-not-proof");
  if (requireTestQualityControls && (!broad || broad.status !== "SATISFIED")) {
    fail(`${label} needs satisfied control:broad-command-not-proof`);
  }
}

function checkManualVerification(label, evidence) {
  for (const item of evidence.manual_verification || []) {
    if (item.status === "RECORDED" || item.status === "WAIVED_BY_HUMAN_DECISION") {
      if (invalidOwner(item.owner)) fail(`${label} manual verification ${item.id} needs a real owner`);
      if (!meaningful(item.decision_ref)) fail(`${label} manual verification ${item.id} needs decision_ref`);
      if (!meaningful(item.evidence_ref)) fail(`${label} manual verification ${item.id} needs evidence_ref`);
    }
  }
}

function checkBoundaries(label, evidence) {
  const boundaries = evidence.boundaries || {};
  for (const field of [
    "writes_target_files",
    "executes_tests",
    "fabricates_evidence",
    "authorizes_implementation",
    "approves_release_or_production",
    "proves_product_correctness",
    "proves_real_environment_behavior",
  ]) {
    if (boundaries[field] === "No") pass(`${label} structured boundary ${field}: No`);
    else fail(`${label} structured boundary ${field} must be No`);
  }
}

function checkMarkdownJsonConsistency(label, evidence, markdown) {
  compareScalar(label, "Markdown identity test_evidence_ref", markdown.identity.test_evidence_ref, evidence.test_evidence_ref);
  compareScalar(label, "Markdown identity test_evidence_digest", markdown.identity.test_evidence_digest, evidence.test_evidence_digest);
  compareScalar(label, "Markdown identity verification_plan_ref", markdown.identity.verification_plan_ref, evidence.verification_plan_ref);
  compareScalar(label, "Markdown identity verification_plan_digest", markdown.identity.verification_plan_digest, evidence.verification_plan_digest);
  compareScalar(label, "Markdown identity intent_digest", markdown.identity.intent_digest, evidence.intent_digest);
  checkMarkdownSourceSystems(label, evidence, markdown.sourceSystems);
  compareScenarioCoverageRows(label, evidence.scenario_coverage_map || [], markdown.scenarioCoverageMap);
  compareEvidenceRows(label, evidence.evidence_items || [], markdown.evidenceItems);
  compareCoverageRows(label, evidence.coverage_map || [], markdown.coverageMap);
  compareQualityControlRows(label, evidence.test_quality_controls || [], markdown.testQualityControls);
  compareKnownGapRows(label, evidence.known_gaps || [], markdown.knownGaps);
  compareManualRows(label, evidence.manual_verification || [], markdown.manualVerification);
  compareScalar(label, "Markdown existing project status", markdown.existingProject.status, evidence.existing_project_mapping?.status);
  compareScalar(label, "Markdown existing project ref", markdown.existingProject.ref, evidence.existing_project_mapping?.ref);
  compareScalar(label, "Markdown existing project reason", markdown.existingProject.reason, evidence.existing_project_mapping?.reason);
  if (markdown.outcome) {
    if (markdown.outcome === evidence.test_evidence_state) pass(`${label} Markdown outcome matches structured test_evidence_state`);
    else fail(`${label} Markdown outcome ${markdown.outcome} must match structured test_evidence_state ${evidence.test_evidence_state || "<missing>"}`);
  } else {
    fail(`${label} Markdown Outcome section must include the structured test_evidence_state`);
  }
}

function parseMarkdownEvidence(content) {
  return {
    sourceSystems: tableRows(sectionBody(content, "Source Systems", { fallback: "" })).map((row) => ({
      source: row.source,
      status: row.status,
      ref: row.ref,
      outcome: row.outcome,
      digest: row.digest,
    })),
    identity: {
      test_evidence_ref: bulletValue(content, "Test Evidence Identity", "Test evidence ref"),
      test_evidence_digest: bulletValue(content, "Test Evidence Identity", "Test evidence digest"),
      verification_plan_ref: bulletValue(content, "Test Evidence Identity", "Verification plan ref"),
      verification_plan_digest: bulletValue(content, "Test Evidence Identity", "Verification plan digest"),
      intent_digest: bulletValue(content, "Test Evidence Identity", "Intent digest"),
    },
    scenarioCoverageMap: tableRows(sectionBody(content, "Business Universe Scenario Coverage", { fallback: "" })).map((row) => ({
      coverage_scenario_id: row.scenario_id,
      required_obligation_ids: splitRefs(row.required_obligations),
      covered_obligation_ids: splitRefs(row.covered_obligations),
      required_proof_strength: row.proof_strength,
      coverage_state: row.coverage_state,
      evidence_ids: splitRefs(row.evidence_ids),
    })),
    evidenceItems: tableRows(sectionBody(content, "Evidence Items", { fallback: "" })).map((row) => ({
      id: row.id,
      type: row.type,
      result_state: row.result_state,
      ref: row.ref,
      command: row.command,
      owner: row.owner,
      environment: row.environment,
      exit_code: row.exit_code,
      ran_after_change: row.ran_after_change,
      current_task_match: row.current_task_match,
      covers_obligations: splitRefs(row.covers_obligations),
      output_digest: row.output_digest,
      failure_reason: row.failure_reason,
      limitations: row.limitations,
    })),
    coverageMap: tableRows(sectionBody(content, "Coverage Map", { fallback: "" })).map((row) => ({
      obligation_id: row.obligation_id,
      coverage_state: row.coverage_state,
      evidence_ids: splitRefs(row.evidence_ids),
      reason: row.reason,
    })),
    testQualityControls: tableRows(sectionBody(content, "Test Quality Controls", { fallback: "" })).map((row) => ({
      id: row.id,
      applies_to: row.applies_to,
      status: row.status,
      evidence_ids: splitRefs(row.evidence_ids),
      reason: row.reason,
    })),
    knownGaps: tableRows(sectionBody(content, "Known Gaps", { fallback: "" })).map((row) => ({
      id: row.gap_id,
      severity: row.severity,
      reason: row.reason,
      required_follow_up: row.required_follow_up,
    })),
    manualVerification: tableRows(sectionBody(content, "Manual Verification", { fallback: "" })).map((row) => ({
      id: row.id,
      owner: row.owner,
      decision_ref: row.decision_ref,
      evidence_ref: row.evidence_ref,
      status: row.status,
      reason: row.reason,
    })),
    existingProject: {
      status: bulletValue(content, "Existing Project Mapping", "Status"),
      ref: bulletValue(content, "Existing Project Mapping", "Ref"),
      reason: bulletTextValue(content, "Existing Project Mapping", "Reason"),
    },
    outcome: codeOrTextValue(sectionBody(content, "Outcome", { fallback: "" })),
  };
}

function compareScenarioCoverageRows(label, structuredRows, markdownRows) {
  const markdownById = new Map(markdownRows.map((row) => [row.coverage_scenario_id, row]));
  const structuredIds = new Set(structuredRows.map((row) => row.coverage_scenario_id));
  for (const row of structuredRows) {
    const markdown = markdownById.get(row.coverage_scenario_id);
    if (!markdown) {
      fail(`${label} Markdown Business Universe Scenario Coverage missing ${row.coverage_scenario_id}`);
      continue;
    }
    compareSet(label, `Markdown scenario ${row.coverage_scenario_id} required obligations`, markdown.required_obligation_ids, row.required_obligation_ids || []);
    compareSet(label, `Markdown scenario ${row.coverage_scenario_id} covered obligations`, markdown.covered_obligation_ids, row.covered_obligation_ids || []);
    compareScalar(label, `Markdown scenario ${row.coverage_scenario_id} proof strength`, markdown.required_proof_strength, row.required_proof_strength);
    compareScalar(label, `Markdown scenario ${row.coverage_scenario_id} state`, markdown.coverage_state, row.coverage_state);
    compareSet(label, `Markdown scenario ${row.coverage_scenario_id} evidence ids`, markdown.evidence_ids, row.evidence_ids || []);
  }
  for (const row of markdownRows) {
    if (!structuredIds.has(row.coverage_scenario_id) && row.coverage_scenario_id !== "N/A") {
      fail(`${label} Markdown Business Universe Scenario Coverage has extra row ${row.coverage_scenario_id}`);
    }
  }
}

function checkMarkdownSourceSystems(label, evidence, rows) {
  const markdownByName = new Map(rows.map((row) => [row.source, row]));
  const structuredNames = new Set((evidence.source_systems || []).map((row) => row.name));
  for (const source of evidence.source_systems || []) {
    const row = markdownByName.get(source.name);
    if (!row) {
      fail(`${label} Markdown Source Systems missing ${source.name}`);
      continue;
    }
    compareScalar(label, `Markdown source ${source.name} status`, row.status, source.status);
    compareScalar(label, `Markdown source ${source.name} ref`, row.ref, source.ref);
    compareScalar(label, `Markdown source ${source.name} outcome`, row.outcome, source.source_outcome);
    compareScalar(label, `Markdown source ${source.name} digest`, row.digest, source.digest);
  }
  for (const row of rows) {
    if (!structuredNames.has(row.source)) fail(`${label} Markdown Source Systems has extra row ${row.source}`);
  }
}

function compareEvidenceRows(label, structuredRows, markdownRows) {
  const markdownById = new Map(markdownRows.map((row) => [row.id, row]));
  const structuredIds = new Set(structuredRows.map((row) => row.id));
  for (const row of structuredRows) {
    const markdown = markdownById.get(row.id);
    if (!markdown) {
      fail(`${label} Markdown Evidence Items missing ${row.id}`);
      continue;
    }
    compareScalar(label, `Markdown evidence ${row.id} type`, markdown.type, row.evidence_type);
    compareScalar(label, `Markdown evidence ${row.id} result`, markdown.result_state, row.result_state);
    compareScalar(label, `Markdown evidence ${row.id} ref`, markdown.ref, row.ref);
    compareScalar(label, `Markdown evidence ${row.id} command`, markdown.command, row.command);
    compareScalar(label, `Markdown evidence ${row.id} owner`, markdown.owner, row.owner);
    compareScalar(label, `Markdown evidence ${row.id} environment`, markdown.environment, row.environment);
    compareScalar(label, `Markdown evidence ${row.id} exit code`, markdown.exit_code, row.exit_code);
    compareScalar(label, `Markdown evidence ${row.id} ran after change`, markdown.ran_after_change, row.ran_after_change);
    compareScalar(label, `Markdown evidence ${row.id} current task match`, markdown.current_task_match, row.current_task_match);
    compareSet(label, `Markdown evidence ${row.id} covers obligations`, markdown.covers_obligations, row.covers_obligations || []);
    compareScalar(label, `Markdown evidence ${row.id} output digest`, markdown.output_digest, row.output_digest);
    compareScalar(label, `Markdown evidence ${row.id} failure reason`, markdown.failure_reason, row.failure_reason);
  }
  for (const row of markdownRows) {
    if (!structuredIds.has(row.id)) fail(`${label} Markdown Evidence Items has extra row ${row.id}`);
  }
}

function compareCoverageRows(label, structuredRows, markdownRows) {
  const markdownById = new Map(markdownRows.map((row) => [row.obligation_id, row]));
  const structuredIds = new Set(structuredRows.map((row) => row.obligation_id));
  for (const row of structuredRows) {
    const markdown = markdownById.get(row.obligation_id);
    if (!markdown) {
      fail(`${label} Markdown Coverage Map missing ${row.obligation_id}`);
      continue;
    }
    compareScalar(label, `Markdown coverage ${row.obligation_id} state`, markdown.coverage_state, row.coverage_state);
    compareSet(label, `Markdown coverage ${row.obligation_id} evidence ids`, markdown.evidence_ids, row.evidence_ids || []);
    compareScalar(label, `Markdown coverage ${row.obligation_id} reason`, markdown.reason, row.reason);
  }
  for (const row of markdownRows) {
    if (!structuredIds.has(row.obligation_id)) fail(`${label} Markdown Coverage Map has extra row ${row.obligation_id}`);
  }
}

function compareQualityControlRows(label, structuredRows, markdownRows) {
  const markdownById = new Map(markdownRows.map((row) => [row.id, row]));
  const structuredIds = new Set(structuredRows.map((row) => row.id));
  for (const row of structuredRows) {
    const markdown = markdownById.get(row.id);
    if (!markdown) {
      fail(`${label} Markdown Test Quality Controls missing ${row.id}`);
      continue;
    }
    compareScalar(label, `Markdown quality control ${row.id} applies to`, markdown.applies_to, row.applies_to);
    compareScalar(label, `Markdown quality control ${row.id} status`, markdown.status, row.status);
    compareSet(label, `Markdown quality control ${row.id} evidence ids`, markdown.evidence_ids, row.evidence_ids || []);
    compareScalar(label, `Markdown quality control ${row.id} reason`, markdown.reason, row.reason);
  }
  for (const row of markdownRows) {
    if (!structuredIds.has(row.id)) fail(`${label} Markdown Test Quality Controls has extra row ${row.id}`);
  }
}

function compareKnownGapRows(label, structuredRows, markdownRows) {
  const markdownById = new Map(markdownRows.map((row) => [row.id, row]));
  const structuredIds = new Set(structuredRows.map((row) => row.id));
  for (const row of structuredRows) {
    const markdown = markdownById.get(row.id);
    if (!markdown) {
      fail(`${label} Markdown Known Gaps missing ${row.id}`);
      continue;
    }
    compareScalar(label, `Markdown known gap ${row.id} severity`, markdown.severity, row.severity);
    compareScalar(label, `Markdown known gap ${row.id} reason`, markdown.reason, row.reason);
    compareScalar(label, `Markdown known gap ${row.id} required follow up`, markdown.required_follow_up, row.required_follow_up);
  }
  for (const row of markdownRows) {
    if (!structuredIds.has(row.id)) fail(`${label} Markdown Known Gaps has extra row ${row.id}`);
  }
}

function compareManualRows(label, structuredRows, markdownRows) {
  const markdownById = new Map(markdownRows.map((row) => [row.id, row]));
  const structuredIds = new Set(structuredRows.map((row) => row.id));
  for (const row of structuredRows) {
    const markdown = markdownById.get(row.id);
    if (!markdown) {
      fail(`${label} Markdown Manual Verification missing ${row.id}`);
      continue;
    }
    compareScalar(label, `Markdown manual verification ${row.id} owner`, markdown.owner, row.owner);
    compareScalar(label, `Markdown manual verification ${row.id} decision ref`, markdown.decision_ref, row.decision_ref);
    compareScalar(label, `Markdown manual verification ${row.id} evidence ref`, markdown.evidence_ref, row.evidence_ref);
    compareScalar(label, `Markdown manual verification ${row.id} status`, markdown.status, row.status);
    compareScalar(label, `Markdown manual verification ${row.id} reason`, markdown.reason, row.reason);
  }
  for (const row of markdownRows) {
    if (!structuredIds.has(row.id)) fail(`${label} Markdown Manual Verification has extra row ${row.id}`);
  }
}

function requireRecordedSource(label, source, sourceName) {
  if (!source) {
    fail(`${label} source_systems must include ${sourceName}`);
    return;
  }
  if (source.status === "RECORDED") pass(`${label} source_systems ${sourceName}.status is RECORDED`);
  else fail(`${label} source_systems ${sourceName}.status must be RECORDED, got ${source.status || "<missing>"}`);
}

function requireSourceField(label, source, sourceName, field, expected) {
  if (!meaningful(expected) || /^not provided$/i.test(String(expected))) return;
  if (!source) {
    fail(`${label} source_systems must include ${sourceName} for ${field} consistency`);
    return;
  }
  if (source[field] === expected) pass(`${label} source_systems ${sourceName}.${field} matches top-level binding`);
  else fail(`${label} source_systems ${sourceName}.${field} ${source[field] || "<missing>"} must match top-level ${expected}`);
}

function artifactRef(value) {
  const text = String(value || "").trim();
  if (!text || /^not provided$/i.test(text)) return "";
  return text.startsWith("artifact:") ? text : "";
}

function resolveArtifact(reportFile, ref, options = {}) {
  const match = String(ref || "").trim().match(/^artifact:(.+)$/i);
  if (!match) return null;
  const relativeRef = match[1].trim();
  if (!relativeRef || path.isAbsolute(relativeRef)) return null;
  const candidates = [
    path.resolve(projectRoot, relativeRef),
    path.resolve(path.dirname(reportFile), relativeRef),
    path.resolve(projectRoot, ".intentos", relativeRef),
  ];
  for (const candidate of candidates) {
    const relative = path.relative(projectRoot, candidate);
    if (relative.startsWith("..") || path.isAbsolute(relative)) continue;
    if (!fs.existsSync(candidate) || !fs.statSync(candidate).isFile()) continue;
    if (options.markdownOnly && !/\.md$/i.test(candidate)) continue;
    return candidate;
  }
  return null;
}

function testEvidenceRefCandidates(file) {
  const relative = rel(file);
  const candidates = [`artifact:${relative}`];
  if (relative.startsWith(".intentos/")) candidates.push(`artifact:${relative.slice(".intentos/".length)}`);
  return candidates;
}

function requireBoundaryNo(content, label, boundary) {
  const pattern = new RegExp(`${escapeRegExp(boundary)}:\\s*No`, "i");
  if (pattern.test(content)) pass(`${label} boundary ${boundary}: No`);
  else fail(`${label} must state boundary: ${boundary}: No`);
}

function tableRows(body) {
  const lines = String(body || "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("|") && line.endsWith("|"));
  if (lines.length < 2) return [];
  const headers = splitMarkdownRow(lines[0]).map((header) => normalizeHeader(header));
  return lines.slice(2)
    .filter((line) => !/^\|\s*-+/.test(line))
    .map((line) => {
      const row = {};
      splitMarkdownRow(line).forEach((cell, index) => {
        row[headers[index] || `col_${index}`] = stripMarkdown(cell);
      });
      return row;
    });
}

function normalizeHeader(value) {
  return stripMarkdown(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function bulletValue(content, heading, label) {
  const body = sectionBody(content, heading, { fallback: "" });
  const pattern = new RegExp(`^-\\s+${escapeRegExp(label)}:\\s*(.+)$`, "im");
  const match = body.match(pattern);
  return match ? codeOrTextValue(match[1]) : "";
}

function bulletTextValue(content, heading, label) {
  const body = sectionBody(content, heading, { fallback: "" });
  const pattern = new RegExp(`^-\\s+${escapeRegExp(label)}:\\s*(.+)$`, "im");
  const match = body.match(pattern);
  return match ? stripMarkdown(match[1]).trim() : "";
}

function codeOrTextValue(value) {
  const text = String(value || "").trim();
  const code = text.match(/`([^`]+)`/);
  if (code) return stripMarkdown(code[1]);
  return stripMarkdown(text).split(/\s+/)[0] || "";
}

function splitRefs(value) {
  return String(value || "")
    .split(/\s*,\s*/)
    .map((item) => stripMarkdown(item))
    .filter((item) => item && !/^(none|not required|n\/a)$/i.test(item));
}

function compareScalar(label, name, markdownValue, structuredValue) {
  const left = normalizeCell(markdownValue);
  const right = normalizeCell(structuredValue);
  if (left === right) pass(`${label} ${name} matches structured evidence`);
  else fail(`${label} ${name} ${markdownValue || "<missing>"} must match structured evidence ${structuredValue || "<missing>"}`);
}

function compareSet(label, name, markdownValues, structuredValues) {
  const left = normalizeSet(markdownValues);
  const right = normalizeSet(structuredValues);
  if (sameArray(left, right)) pass(`${label} ${name} matches structured evidence`);
  else fail(`${label} ${name} ${left.join(",") || "<missing>"} must match structured evidence ${right.join(",") || "<missing>"}`);
}

function normalizeSet(values) {
  return [...new Set((Array.isArray(values) ? values : [values])
    .map((item) => normalizeCell(item))
    .filter(Boolean))]
    .sort();
}

function normalizeCell(value) {
  return stripMarkdown(value)
    .replace(/\s+/g, " ")
    .trim();
}

function sameArray(left, right) {
  return left.length === right.length && left.every((item, index) => item === right[index]);
}

function uniqueStrings(values) {
  return normalizeSet(values);
}

function sameStringSet(left, right) {
  return sameArray(uniqueStrings(left), uniqueStrings(right));
}

function hasSection(content, heading) {
  return new RegExp(`^##\\s+${escapeRegExp(heading)}\\s*$`, "im").test(content);
}

function meaningful(value) {
  const text = String(value || "").trim();
  return Boolean(text) && !/^(n\/a|none|todo|tbd|not provided|not recorded|placeholder|unknown)$/i.test(text);
}

function exitCodeValue(value) {
  const text = String(value ?? "").trim();
  if (!text || /^(n\/a|none|todo|tbd|not provided|not recorded|placeholder|unknown)$/i.test(text)) return null;
  if (!/^-?\d+$/.test(text)) return null;
  return Number(text);
}

function surfaceList(value) {
  return String(value || "")
    .split(/\s*,\s*/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function invalidOwner(value) {
  return invalidManualOwners.has(String(value || "").trim().toLowerCase());
}

function fileDigest(file) {
  return `sha256:${crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex")}`;
}

function resolveReportPath(report) {
  const normalized = String(report || "").trim();
  if (!normalized) return "";
  const direct = path.resolve(projectRoot, normalized);
  const managed = path.resolve(projectRoot, ".intentos", normalized);
  if (fs.existsSync(direct)) return direct;
  if (fs.existsSync(managed)) return managed;
  return direct;
}

function markdownFiles(relativeDir) {
  const dirs = [path.join(projectRoot, relativeDir), path.join(projectRoot, ".intentos", relativeDir)];
  const files = [];
  for (const dir of dirs) {
    if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) continue;
    for (const entry of fs.readdirSync(dir)) {
      if (/\.md$/i.test(entry)) files.push(path.join(dir, entry));
    }
  }
  return files.sort();
}

function resolveAsset(relativePath) {
  const direct = path.join(projectRoot, relativePath);
  if (fs.existsSync(direct) && fs.statSync(direct).isFile()) return direct;
  const managed = path.join(projectRoot, ".intentos", relativePath);
  if (fs.existsSync(managed) && fs.statSync(managed).isFile()) return managed;
  return "";
}

function resolveDirectory(relativePath) {
  const direct = path.join(projectRoot, relativePath);
  if (fs.existsSync(direct) && fs.statSync(direct).isDirectory()) return direct;
  const managed = path.join(projectRoot, ".intentos", relativePath);
  if (fs.existsSync(managed) && fs.statSync(managed).isDirectory()) return managed;
  return "";
}

function readResolved(relativePath) {
  const file = resolveAsset(relativePath);
  return file ? fs.readFileSync(file, "utf8") : "";
}

function displayAsset(expected, resolved) {
  const relative = path.relative(projectRoot, resolved).split(path.sep).join("/");
  return relative || expected;
}

function rel(file) {
  return path.relative(projectRoot, file).split(path.sep).join("/");
}

function pass(message) {
  checks.push({ status: "PASS", message });
  if (!outputJson) console.log(`PASS ${message}`);
}

function fail(message) {
  failed = true;
  checks.push({ status: "FAIL", message });
  if (!outputJson) console.log(`FAIL ${message}`);
}

function emitAndExit() {
  if (outputJson) {
    console.log(JSON.stringify({ ok: !failed, checks }, null, 2));
  } else {
    console.log("");
    console.log(failed ? "Test Evidence check failed." : "Test Evidence check passed.");
  }
  process.exit(failed ? 1 : 0);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
