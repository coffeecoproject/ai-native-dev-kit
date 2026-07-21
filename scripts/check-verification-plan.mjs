#!/usr/bin/env node

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
import {
  decodeTaskGovernanceLineage,
  normalizeTaskIntent,
  taskIntentDigest,
  validateEmbeddedTaskGovernanceLineage,
} from "./lib/task-entry-binding.mjs";
import { containsSecretLikeValue } from "./lib/risk-surfaces.mjs";
import { isFileEvidenceRef, resolveAuthoritativeEvidenceReference, validateEvidenceAuthorityBinding } from "./lib/evidence-authority.mjs";
import { resolveBoundBusinessUniverse } from "./lib/business-universe.mjs";
import { validateControlEffectivenessBinding } from "./lib/control-effectiveness.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set([
  "json",
  "allow-empty",
  "report",
  "require-report",
  "require-structured-evidence",
  "require-business-rule-ref",
  "require-impact-ref",
  "strict-source-binding",
  "require-evidence-authority",
  "require-task-lineage",
  "strict",
]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputJson = Boolean(args.json);
const allowEmpty = Boolean(args["allow-empty"]);
const requireReport = Boolean(args["require-report"]);
const requireStructuredEvidence = Boolean(args["require-structured-evidence"]);
const requireBusinessRuleRef = Boolean(args["require-business-rule-ref"]);
const requireImpactRef = Boolean(args["require-impact-ref"]);
const strictSourceBinding = Boolean(args["strict-source-binding"]);
const requireEvidenceAuthority = Boolean(args["require-evidence-authority"]);
const requireTaskLineage = Boolean(args["require-task-lineage"] || args.strict);
const strictRequested = requireReport || requireStructuredEvidence || requireBusinessRuleRef
  || requireImpactRef || strictSourceBinding || requireEvidenceAuthority || requireTaskLineage || Boolean(args.report);
const explicitReport = args.report ? resolveReportPath(String(args.report)) : "";
const structuredEvidenceSchema = loadSchema(projectRoot, "schemas/artifacts/verification-plan.schema.json");
const businessRuleSchema = loadSchema(projectRoot, "schemas/artifacts/business-rule-closure.schema.json");
const impactSchema = loadSchema(projectRoot, "schemas/artifacts/change-impact-coverage.schema.json");
const businessUniverseSchema = loadSchema(projectRoot, "schemas/artifacts/business-universe-coverage.schema.json");
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
  "core/verification-test-governance.md",
  "docs/verification-test-governance.md",
  "templates/verification-plan.md",
  "schemas/artifacts/verification-plan.schema.json",
  "checklists/verification-plan-review.md",
  "prompts/verification-plan-agent.md",
  "scripts/resolve-verification-plan.mjs",
  "scripts/check-verification-plan.mjs",
];
const requiredDirectories = ["verification-plans"];
const requiredSections = [
  "Human Summary",
  "User Request",
  "Source Systems",
  "Verification Plan Identity",
  "Project Calibration",
  "Affected Surface Inputs",
  "Verification Obligations",
  "Test Correctness Controls",
  "Manual Verification",
  "Not Applicable Obligations",
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
  /\bthis plan approves release or production:\s*Yes\b/i,
  /\bthis plan authorizes implementation:\s*Yes\b/i,
  /\bthis plan executes tests:\s*Yes\b/i,
  /\bthis plan proves product correctness:\s*Yes\b/i,
  /批准(实现|发布|生产|上线)/,
];
const allowedReadyStates = new Set(["VERIFICATION_PLAN_READY"]);
const highRiskSurfaces = new Set(["DATA_MODEL", "PERMISSION_RISK", "RELEASE_IMPACT"]);

let failed = false;
const checks = [];

if (!outputJson) {
  console.log("# Verification Plan Check");
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
    readResolved("core/verification-test-governance.md"),
    readResolved("docs/verification-test-governance.md"),
    readResolved("templates/verification-plan.md"),
    JSON.stringify(structuredEvidenceSchema || {}),
  ].join("\n");
  if (!combined.trim()) return;
  for (const marker of [
    "Verification Plan Governance",
    "Verification Plan",
    "verification_plan_digest",
    "source_systems",
    "Test Correctness",
    "does not execute tests",
    "does not approve release or production",
  ]) {
    if (combined.includes(marker)) pass(`verification plan docs include ${marker}`);
    else fail(`verification plan docs missing ${marker}`);
  }
}

function checkReports() {
  const files = explicitReport ? [explicitReport] : markdownFiles("verification-plans");
  if (files.length === 0) {
    if (allowEmpty && !strictRequested) {
      pass("verification plan check skipped by explicit --allow-empty: no reports");
    } else if (strictRequested) {
      fail("no verification plan reports found; run `verification-plan --out <relative-report-path>` first");
    } else {
      pass("SKIPPED_NO_REPORT: no verification plan reports found; no readiness claim made");
    }
    return;
  }
  for (const file of files) {
    if (!fs.existsSync(file)) {
      fail(`missing explicit verification plan report ${file}`);
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
    if (pattern.test(content)) fail(`${label} contains forbidden verification plan claim: ${pattern.source}`);
  }
  for (const section of requiredSections) {
    if (hasSection(content, section)) pass(`${label} includes ${section}`);
    else fail(`${label} missing section ${section}`);
  }
  requireBoundaryNo(content, label, "This plan writes target files");
  requireBoundaryNo(content, label, "This plan executes tests");
  requireBoundaryNo(content, label, "This plan authorizes implementation");
  requireBoundaryNo(content, label, "This plan approves release or production");
  requireBoundaryNo(content, label, "This plan proves product correctness");
  requireBoundaryNo(content, label, "This plan proves real-environment behavior");

  const result = validateEvidenceBlock(content, structuredEvidenceSchema, label, {
    require: requireStructuredEvidence || requireBusinessRuleRef || requireImpactRef || strictSourceBinding || requireEvidenceAuthority || requireTaskLineage,
    digestField: "verification_plan_digest",
  });
  if (!result.present && !(requireStructuredEvidence || requireBusinessRuleRef || requireImpactRef || strictSourceBinding || requireEvidenceAuthority || requireTaskLineage)) {
    pass(`${label} structured evidence optional and not present`);
    return;
  }
  if (!result.ok) {
    result.errors.forEach((error) => fail(error));
    return;
  }
  const evidence = result.value;
  pass(`${label} has valid structured evidence`);
  const markdown = parseMarkdownEvidence(content);
  checkEvidenceAuthority(label, file, evidence);
  checkStructuredEvidence(label, file, evidence, markdown);
}

function checkEvidenceAuthority(label, file, evidence) {
  if (!requireEvidenceAuthority) return;
  const report = resolveAuthoritativeEvidenceReference(projectRoot, "", `artifact:${path.relative(projectRoot, file).split(path.sep).join("/")}`, { markdownOnly: true });
  if (!report.ok) {
    fail(`${label} strict authority requires a project-local non-symlink report: ${report.error}`);
    return;
  }
  const sourceRefs = [
    evidence.business_rule_ref,
    evidence.impact_ref,
    ...(evidence.source_systems || []).filter((item) => item.status === "RECORDED").map((item) => item.ref),
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
  const normalizedIntent = normalizeTaskIntent(evidence.intent);
  if (evidence.intent === normalizedIntent && evidence.intent_digest === taskIntentDigest(normalizedIntent)) {
    pass(`${label} intent text and digest are canonical`);
  } else {
    fail(`${label} intent_digest must be recomputed from normalized intent`);
  }
  const planRefs = verificationPlanRefCandidates(file);
  if (planRefs.includes(evidence.verification_plan_ref)) {
    pass(`${label} verification_plan_ref points to this report`);
  } else {
    fail(`${label} verification_plan_ref ${evidence.verification_plan_ref || "<missing>"} must point to ${planRefs.join(" or ")}`);
  }

  if (allowedReadyStates.has(evidence.verification_state)) {
    if (!meaningful(evidence.task_ref)) fail(`${label} READY plan requires task_ref`);
    if (!meaningful(evidence.intent_digest)) fail(`${label} READY plan requires intent_digest`);
    if (!meaningfulDigest(evidence.verification_plan_digest)) fail(`${label} READY plan requires verification_plan_digest`);
    if (!Array.isArray(evidence.source_systems) || evidence.source_systems.length === 0) {
      fail(`${label} READY plan requires source_systems`);
    }
  }

  const sourceNames = new Set((evidence.source_systems || []).map((item) => item.name));
  if (requireBusinessRuleRef || evidence.change_kind === "BUSINESS_RULE") {
    if (!artifactRef(evidence.business_rule_ref)) fail(`${label} business_rule_ref is required for business-rule verification plans`);
    if (!sourceNames.has("business_rule_closure")) fail(`${label} source_systems must include business_rule_closure`);
  }
  if (requireImpactRef || evidence.verification_state === "VERIFICATION_PLAN_READY") {
    if (!artifactRef(evidence.impact_ref)) fail(`${label} impact_ref is required for READY verification plans`);
    if (!sourceNames.has("change_impact_coverage")) fail(`${label} source_systems must include change_impact_coverage`);
  }
  checkSourceSystemsConsistency(label, evidence);

  const businessRule = checkBusinessRuleBinding(label, file, evidence);
  const impact = checkImpactBinding(label, file, evidence);
  checkImpactSurfaceCoverage(label, evidence, impact);
  checkBusinessUniverseBinding(label, file, evidence, businessRule, impact);
  checkControlEffectivenessBinding(label, file, evidence);
  checkSourceChainConsistency(label, evidence, impact);
  checkTaskBinding(label, file, evidence, businessRule, impact);
  checkObligations(label, evidence);
  checkManualVerification(label, evidence);
  checkBoundaries(label, evidence);
  checkMarkdownJsonConsistency(label, evidence, markdown);
}

function checkSourceSystemsConsistency(label, evidence) {
  const byName = new Map();
  for (const source of evidence.source_systems || []) {
    if (!source?.name) continue;
    byName.set(source.name, source);
  }
  if (evidence.verification_state === "VERIFICATION_PLAN_READY") {
    requireRecordedSource(label, byName.get("business_rule_closure"), "business_rule_closure");
    requireRecordedSource(label, byName.get("change_impact_coverage"), "change_impact_coverage");
  }
  requireSourceField(label, byName.get("business_rule_closure"), "business_rule_closure", "ref", evidence.business_rule_ref);
  requireSourceField(label, byName.get("business_rule_closure"), "business_rule_closure", "digest", evidence.business_rule_digest);
  requireSourceField(label, byName.get("business_rule_closure"), "business_rule_closure", "source_outcome", evidence.business_rule_state);
  requireSourceField(label, byName.get("change_impact_coverage"), "change_impact_coverage", "ref", evidence.impact_ref);
  requireSourceField(label, byName.get("change_impact_coverage"), "change_impact_coverage", "digest", evidence.impact_digest);
  const universeBinding = evidence.business_universe_binding;
  if (universeBinding?.required === "Yes") {
    requireRecordedSource(label, byName.get("business_universe_coverage"), "business_universe_coverage");
    requireSourceField(label, byName.get("business_universe_coverage"), "business_universe_coverage", "ref", universeBinding.business_universe_ref);
    requireSourceField(label, byName.get("business_universe_coverage"), "business_universe_coverage", "digest", universeBinding.business_universe_digest);
    requireSourceField(label, byName.get("business_universe_coverage"), "business_universe_coverage", "source_outcome", universeBinding.business_universe_state);
  }
}

function checkBusinessUniverseBinding(label, verificationFile, evidence, businessRule, impact) {
  if (!businessRule) return;
  const binding = evidence.business_universe_binding;
  const businessRuleBinding = businessRule.business_universe_binding;
  if (!["1.108.0", "1.110.0"].includes(evidence.schema_version)) {
    return;
  }
  if (!binding) {
    fail(`${label} 1.108.0 requires a Business Universe binding in Verification Plan`);
    return;
  }
  if (!businessRuleBinding) {
    const trustedLegacyProjection = businessRule.schema_version === "1.75.0"
      && binding.required === "No"
      && binding.routing_result === "NOT_REQUIRED_WITH_REASON"
      && binding.business_universe_ref === "N/A"
      && binding.business_universe_digest === "N/A"
      && binding.business_universe_state === "NOT_REQUIRED_WITH_REASON"
      && binding.coverage_mapping_status === "NOT_REQUIRED"
      && (binding.coverage_scenario_ids || []).length === 0
      && !(evidence.verification_obligations || []).some((item) => (item.source_coverage_scenario_ids || []).length > 0);
    if (trustedLegacyProjection) {
      pass(`${label} trusted historical Business Rule Closure remains a bounded non-Universe source`);
    } else {
      fail(`${label} current Verification Plan cannot project a missing Business Universe binding as required evidence`);
    }
    return;
  }
  const businessRuleFile = resolveArtifact(verificationFile, artifactRef(evidence.business_rule_ref));
  const universe = resolveBoundBusinessUniverse(projectRoot, businessRuleFile, businessRule);
  if (businessRuleBinding.required === "No") {
    if (binding.required === "No"
      && binding.routing_result === "NOT_REQUIRED_WITH_REASON"
      && binding.business_universe_ref === "N/A"
      && binding.business_universe_digest === "N/A"
      && binding.coverage_mapping_status === "NOT_REQUIRED"
      && (binding.coverage_scenario_ids || []).length === 0
      && !(evidence.verification_obligations || []).some((item) => (item.source_coverage_scenario_ids || []).length > 0)) {
      pass(`${label} Business Universe is not required and no synthetic scenario obligations exist`);
    } else {
      fail(`${label} non-required Business Universe must remain a bounded N/A projection`);
    }
    return;
  }
  if (businessRuleBinding.required === "Unknown") {
    if (binding.required === "Unknown"
      && binding.routing_result === "TECHNICAL_INSPECTION_REQUIRED"
      && binding.coverage_mapping_status === "BLOCKED"
      && evidence.verification_state === "BLOCKED_BY_UNCLEAR_TEST_SCOPE") {
      pass(`${label} unresolved Business Universe inspection blocks Verification Plan`);
    } else {
      fail(`${label} unresolved Business Universe inspection must remain blocked`);
    }
    return;
  }
  if (!universe.evidence) {
    fail(`${label} required Business Universe is unresolved: ${universe.error}`);
    return;
  }
  const validation = validateSchema(universe.evidence, businessUniverseSchema, { label: `${label} Business Universe` });
  if (validation.ok) pass(`${label} Business Universe structured evidence is valid`);
  else validation.errors.forEach(fail);
  for (const field of [
    "required",
    "routing_result",
    "business_universe_ref",
    "business_universe_digest",
    "business_universe_state",
    "coverage_mapping_status",
  ]) {
    if (binding[field] === businessRuleBinding[field]) pass(`${label} Business Universe ${field} matches Business Rule Closure`);
    else fail(`${label} Business Universe ${field} must match Business Rule Closure`);
    if (impact?.business_universe_binding?.[field] === businessRuleBinding[field]) pass(`${label} impact Business Universe ${field} preserves the chain`);
    else fail(`${label} impact Business Universe ${field} must preserve the chain`);
  }
  if (binding.business_universe_digest === universe.evidence.coverage_digest
    && binding.business_universe_state === "COVERAGE_READY") pass(`${label} Business Universe report is exact and ready`);
  else fail(`${label} Business Universe report must be exact and COVERAGE_READY`);
  const universeScenarioIds = uniqueStrings((universe.evidence.coverage_scenarios || []).map((item) => item.coverage_scenario_id));
  if (sameStringSet(binding.coverage_scenario_ids, universeScenarioIds)
    && sameStringSet(impact?.business_universe_binding?.coverage_scenario_ids, universeScenarioIds)
    && universeScenarioIds.length > 0) {
    pass(`${label} Business Universe scenario identity is preserved through Impact and Verification Plan`);
  } else {
    fail(`${label} Impact and Verification Plan must preserve the exact Business Universe scenario set`);
  }
  const impactScenarioIds = uniqueStrings((impact?.impact_scenario_mappings || []).flatMap((item) => item.source_coverage_scenario_ids || []));
  if (sameStringSet(impactScenarioIds, universeScenarioIds)) pass(`${label} Change Impact mapped every Business Universe scenario`);
  else fail(`${label} Change Impact scenario mappings are incomplete or contain unknown scenarios`);

  const scenarioById = new Map((universe.evidence.coverage_scenarios || []).map((item) => [item.coverage_scenario_id, item]));
  const covered = new Map();
  for (const obligation of evidence.verification_obligations || []) {
    for (const scenarioId of obligation.source_coverage_scenario_ids || []) {
      const scenario = scenarioById.get(scenarioId);
      if (!scenario) {
        fail(`${label} obligation ${obligation.id} references unknown Business Universe scenario ${scenarioId}`);
        continue;
      }
      if (obligation.required_proof_strength === scenario.required_proof_strength) {
        pass(`${label} obligation ${obligation.id} preserves proof strength for ${scenarioId}`);
      } else {
        fail(`${label} obligation ${obligation.id} proof strength must match ${scenarioId}`);
      }
      if (obligation.required === "Yes") {
        const rows = covered.get(scenarioId) || [];
        rows.push(obligation);
        covered.set(scenarioId, rows);
      }
    }
  }
  for (const [scenarioId, scenario] of scenarioById) {
    const rows = covered.get(scenarioId) || [];
    const expectedBound = rows.some((item) => item.behavior_under_test === scenario.expected_behavior);
    const reverseBound = rows.some((item) => item.behavior_under_test === scenario.negative_or_reverse_behavior);
    if (expectedBound && reverseBound) pass(`${label} scenario ${scenarioId} has expected and negative/reverse verification obligations`);
    else fail(`${label} scenario ${scenarioId} requires both expected and negative/reverse verification obligations`);
    if (scenario.required_proof_strength === "RUNTIME_TRUSTED_BEHAVIOR_PROOF"
      && rows.every((item) => /Verification Run Manifest|runtime-trusted/i.test(item.expected_evidence || ""))) {
      pass(`${label} runtime-trusted scenario ${scenarioId} requires current-run evidence`);
    } else if (scenario.required_proof_strength === "RUNTIME_TRUSTED_BEHAVIOR_PROOF") {
      fail(`${label} runtime-trusted scenario ${scenarioId} must require current Verification Run Manifest evidence`);
    }
    if (scenario.required_proof_strength === "EXTERNAL_FACT_PROOF"
      && rows.every((item) => item.verification_type === "MANUAL_VERIFICATION_REQUIRED" && meaningful(item.decision_ref))) {
      pass(`${label} external-fact scenario ${scenarioId} remains bound to an external fact`);
    } else if (scenario.required_proof_strength === "EXTERNAL_FACT_PROOF") {
      fail(`${label} external-fact scenario ${scenarioId} must remain externally bound`);
    }
  }
}

function checkControlEffectivenessBinding(label, file, evidence) {
  if (evidence.schema_version !== "1.110.0") return;
  const binding = evidence.control_effectiveness_binding;
  const validation = validateControlEffectivenessBinding(projectRoot, binding, {
    required: binding?.requirement === "REQUIRED",
    fromFile: file,
    taskRef: evidence.task_ref,
    intentDigest: evidence.intent_digest,
  });
  if (validation.ok) pass(`${label} Control Effectiveness binding is exact and current`);
  else validation.errors.forEach((error) => fail(`${label} ${error}`));
  const source = (evidence.source_systems || []).find((item) => item.name === "control_effectiveness");
  if (source
    && source.ref === binding.report_ref
    && source.digest === binding.report_digest
    && source.source_outcome === binding.assessment_outcome) pass(`${label} source systems preserve Control Effectiveness binding`);
  else fail(`${label} source systems must preserve the exact Control Effectiveness binding`);
  if (binding.requirement === "REQUIRED" && binding.status !== "VERIFIED" && evidence.verification_state === "VERIFICATION_PLAN_READY") {
    fail(`${label} cannot be ready while a relied-on control is unproven`);
  }
}

function requireRecordedSource(label, source, sourceName) {
  if (!source) return;
  if (source.status === "RECORDED") {
    pass(`${label} READY source_systems ${sourceName}.status is RECORDED`);
  } else {
    fail(`${label} READY source_systems ${sourceName}.status must be RECORDED, got ${source.status || "<missing>"}`);
  }
}

function requireSourceField(label, source, sourceName, field, expected) {
  if (!meaningful(expected) || /^not provided$/i.test(String(expected))) return;
  if (!source) {
    fail(`${label} source_systems must include ${sourceName} for ${field} consistency`);
    return;
  }
  if (source[field] === expected) {
    pass(`${label} source_systems ${sourceName}.${field} matches top-level binding`);
  } else {
    fail(`${label} source_systems ${sourceName}.${field} ${source[field] || "<missing>"} must match top-level ${expected}`);
  }
}

function checkBusinessRuleBinding(label, file, evidence) {
  const ref = artifactRef(evidence.business_rule_ref);
  if (!ref) return null;
  const resolved = resolveArtifact(file, ref);
  if (!resolved) {
    fail(`${label} business_rule_ref is not resolvable: ${ref}`);
    return null;
  }
  pass(`${label} business_rule_ref resolves: ${ref}`);
  const extracted = extractMachineReadableEvidence(fs.readFileSync(resolved, "utf8"));
  if (!extracted?.ok) {
    fail(`${label} business_rule_ref ${ref} missing valid Machine-Readable Evidence`);
    return null;
  }
  const businessRule = extracted.value;
  if (businessRuleSchema) {
    const validation = validateSchema(businessRule, businessRuleSchema, { label: `${label} business_rule_ref ${ref}` });
    if (validation.ok) pass(`${label} business_rule_ref has valid Business Rule Closure evidence`);
    else validation.errors.forEach((error) => fail(error));
  }
  if (evidence.business_rule_digest === businessRule.business_rule_digest) {
    pass(`${label} business_rule_digest matches referenced Business Rule Closure`);
  } else {
    fail(`${label} business_rule_digest ${evidence.business_rule_digest || "<missing>"} must match referenced Business Rule Closure ${businessRule.business_rule_digest || "<missing>"}`);
  }
  if (evidence.business_rule_state === businessRule.state) {
    pass(`${label} business_rule_state matches referenced Business Rule Closure`);
  } else {
    fail(`${label} business_rule_state ${evidence.business_rule_state || "<missing>"} must match referenced Business Rule Closure ${businessRule.state || "<missing>"}`);
  }
  if ((requireBusinessRuleRef || evidence.change_kind === "BUSINESS_RULE") && businessRule.state !== "READY_FOR_IMPACT_COVERAGE") {
    fail(`${label} business-rule verification plan requires READY Business Rule Closure`);
  }
  return businessRule;
}

function checkImpactBinding(label, file, evidence) {
  const ref = artifactRef(evidence.impact_ref);
  if (!ref) return null;
  const resolved = resolveArtifact(file, ref);
  if (!resolved) {
    fail(`${label} impact_ref is not resolvable: ${ref}`);
    return null;
  }
  pass(`${label} impact_ref resolves: ${ref}`);
  const extracted = extractMachineReadableEvidence(fs.readFileSync(resolved, "utf8"));
  if (!extracted?.ok) {
    fail(`${label} impact_ref ${ref} missing valid Machine-Readable Evidence`);
    return null;
  }
  const impact = extracted.value;
  if (impactSchema) {
    const validation = validateSchema(impact, impactSchema, { label: `${label} impact_ref ${ref}` });
    if (validation.ok) pass(`${label} impact_ref has valid Change Impact Coverage evidence`);
    else validation.errors.forEach((error) => fail(error));
  }
  if (evidence.impact_digest === impact.impact_digest) {
    pass(`${label} impact_digest matches referenced Change Impact Coverage`);
  } else {
    fail(`${label} impact_digest ${evidence.impact_digest || "<missing>"} must match referenced Change Impact Coverage ${impact.impact_digest || "<missing>"}`);
  }
  return impact;
}

function checkImpactSurfaceCoverage(label, evidence, impact) {
  if (!impact) return;
  const activeStatuses = new Set(["REQUIRED", "NEEDS_HUMAN_DECISION"]);
  const impactBySurface = new Map((impact.affected_surface_map || []).map((item) => [item.surface, item]));
  const planBySurface = new Map((evidence.affected_surfaces || []).map((item) => [item.surface, item]));
  const requiredImpactSurfaces = [...impactBySurface.values()]
    .filter((item) => activeStatuses.has(item.status))
    .map((item) => item.surface)
    .sort();
  const requiredPlanSurfaces = [...planBySurface.values()]
    .filter((item) => activeStatuses.has(item.status))
    .map((item) => item.surface)
    .sort();

  if (JSON.stringify(requiredPlanSurfaces) === JSON.stringify(requiredImpactSurfaces)) {
    pass(`${label} preserves the exact required Change Impact surface set`);
  } else {
    fail(`${label} required Verification Plan surfaces ${requiredPlanSurfaces.join(", ") || "<none>"} must exactly match Change Impact ${requiredImpactSurfaces.join(", ") || "<none>"}`);
  }

  for (const surface of requiredImpactSurfaces) {
    const impactRow = impactBySurface.get(surface);
    const planRow = planBySurface.get(surface);
    if (!planRow) continue;
    if (planRow.status === impactRow.status) {
      pass(`${label} surface ${surface} preserves Change Impact status ${impactRow.status}`);
    } else {
      fail(`${label} surface ${surface} status ${planRow.status || "<missing>"} must preserve Change Impact ${impactRow.status}`);
    }
  }
}

function checkSourceChainConsistency(label, evidence, impact) {
  if (!impact) return;
  const shouldRequireBusinessRuleChain = requireBusinessRuleRef
    || strictSourceBinding
    || evidence.change_kind === "BUSINESS_RULE"
    || meaningfulArtifact(evidence.business_rule_ref);
  if (!shouldRequireBusinessRuleChain) return;
  if (impact.business_rule_ref === evidence.business_rule_ref) {
    pass(`${label} impact report business_rule_ref matches Verification Plan`);
  } else {
    fail(`${label} impact report business_rule_ref ${impact.business_rule_ref || "<missing>"} must match Verification Plan ${evidence.business_rule_ref || "<missing>"}`);
  }
  if (impact.business_rule_digest === evidence.business_rule_digest) {
    pass(`${label} impact report business_rule_digest matches Verification Plan`);
  } else {
    fail(`${label} impact report business_rule_digest ${impact.business_rule_digest || "<missing>"} must match Verification Plan ${evidence.business_rule_digest || "<missing>"}`);
  }
  if (impact.business_rule_state === evidence.business_rule_state) {
    pass(`${label} impact report business_rule_state matches Verification Plan`);
  } else {
    fail(`${label} impact report business_rule_state ${impact.business_rule_state || "<missing>"} must match Verification Plan ${evidence.business_rule_state || "<missing>"}`);
  }
}

function checkTaskBinding(label, file, evidence, businessRule, impact) {
  if (!strictSourceBinding && evidence.verification_state !== "VERIFICATION_PLAN_READY") return;
  if (businessRule?.task_ref && evidence.task_ref !== businessRule.task_ref) {
    fail(`${label} task_ref ${evidence.task_ref} must match Business Rule Closure task_ref ${businessRule.task_ref}`);
  } else if (businessRule?.task_ref) {
    pass(`${label} task_ref matches Business Rule Closure`);
  }
  if (businessRule?.source_request_digest && evidence.intent_digest !== businessRule.source_request_digest) {
    fail(`${label} intent_digest must match Business Rule Closure source_request_digest`);
  } else if (businessRule?.source_request_digest) {
    pass(`${label} intent_digest matches Business Rule Closure`);
  }
  const impactTask = impact?.user_request?.task_ref;
  if (impactTask && !/^not provided$/i.test(impactTask) && evidence.task_ref !== impactTask) {
    fail(`${label} task_ref ${evidence.task_ref} must match Change Impact Coverage task_ref ${impactTask}`);
  }
  if (businessRule?.user_request && businessRule.user_request !== evidence.intent) {
    fail(`${label} intent text must match Business Rule Closure exactly`);
  } else if (businessRule?.user_request) {
    pass(`${label} intent text matches Business Rule Closure`);
  }
  if (impact?.user_request?.intent && impact.user_request.intent !== evidence.intent) {
    fail(`${label} intent text must match Change Impact Coverage exactly`);
  } else if (impact?.user_request?.intent) {
    pass(`${label} intent text matches Change Impact Coverage`);
  }
  if (businessRule) {
    const hasLineage = (businessRule.source_rule_refs || []).some((item) => decodeTaskGovernanceLineage(item));
    const lineage = validateEmbeddedTaskGovernanceLineage(projectRoot, businessRule.source_rule_refs, {
      taskRef: evidence.task_ref,
      intent: evidence.intent,
      intentDigest: evidence.intent_digest,
    }, { fromFile: file, requireCurrent: requireTaskLineage });
    if (lineage.ok) pass(`${label} Business Rule preserves exact current Task Governance lineage`);
    else if (requireTaskLineage || hasLineage) lineage.errors.forEach((error) => fail(`${label} ${error}`));
    else pass(`${label} historical Business Rule lineage remains readable without current authority`);
  }
}

function checkObligations(label, evidence) {
  const obligations = evidence.verification_obligations || [];
  const requiredSurfaces = new Set((evidence.affected_surfaces || [])
    .filter((item) => item.status === "REQUIRED" || item.status === "NEEDS_HUMAN_DECISION")
    .map((item) => item.surface));
  const bySurface = new Map();
  for (const obligation of obligations) {
    if (!bySurface.has(obligation.source_surface)) bySurface.set(obligation.source_surface, []);
    bySurface.get(obligation.source_surface).push(obligation);
    if (obligation.required === "Yes" && (!Array.isArray(obligation.source_refs) || obligation.source_refs.length === 0)) {
      fail(`${label} required obligation ${obligation.id} needs source_refs`);
    }
    if (obligation.required === "Yes" && sourceRefsAreImplementationOnly(obligation.source_refs || [])) {
      fail(`${label} required obligation ${obligation.id} cannot cite only implementation files`);
    }
    if (obligation.required === "Yes"
      && obligation.broad_command_only === "Yes"
      && obligation.verification_type !== "REGRESSION_SMOKE") {
      fail(`${label} required obligation ${obligation.id} cannot be broad-command-only`);
    }
    if (obligation.required === "Yes" && !meaningful(obligation.behavior_under_test)) {
      fail(`${label} required obligation ${obligation.id} needs behavior_under_test`);
    }
    if (obligation.required === "Yes" && !meaningful(obligation.expected_evidence)) {
      fail(`${label} required obligation ${obligation.id} needs expected_evidence`);
    }
    if (evidence.schema_version === "1.108.0") {
      if (!Array.isArray(obligation.source_coverage_scenario_ids)) {
        fail(`${label} 1.108 obligation ${obligation.id} requires source_coverage_scenario_ids`);
      }
      if (!meaningful(obligation.required_proof_strength)) {
        fail(`${label} 1.108 obligation ${obligation.id} requires required_proof_strength`);
      }
      if ((obligation.source_coverage_scenario_ids || []).length === 0 && obligation.required_proof_strength !== "NOT_APPLICABLE") {
        fail(`${label} non-Universe obligation ${obligation.id} must use NOT_APPLICABLE proof strength`);
      }
      if ((obligation.source_coverage_scenario_ids || []).length > 0 && obligation.required_proof_strength === "NOT_APPLICABLE") {
        fail(`${label} Universe-bound obligation ${obligation.id} requires a concrete proof strength`);
      }
    }
  }

  for (const surface of requiredSurfaces) {
    if (!bySurface.has(surface)) fail(`${label} required surface ${surface} has no verification obligation`);
  }

  requireTypes(label, bySurface, "API_CONTRACT", ["API_POSITIVE_TEST", "API_NEGATIVE_TEST"]);
  requireTypes(label, bySurface, "BACKEND_RULE", ["BACKEND_RULE_TEST"]);
  requireTypes(label, bySurface, "FRONTEND_UI", ["UI_INTERACTION_TEST"]);
  if (requiredSurfaces.has("DATA_MODEL")) requireTypes(label, bySurface, "DATA_MODEL", ["DATA_MODEL_CHECK"]);
  if (requiredSurfaces.has("PERMISSION_RISK")) requireAnyTypes(label, bySurface, "PERMISSION_RISK", ["PERMISSION_BOUNDARY_TEST", "MANUAL_VERIFICATION_REQUIRED", "PRIVACY_DATA_CHECK"]);

  if (evidence.change_kind === "BUG_FIX" && !obligations.some((item) => item.verification_type === "REGRESSION_SMOKE")) {
    fail(`${label} bug-fix verification plan requires regression obligation`);
  }

  const onlySmoke = obligations.length > 0 && obligations.every((item) => item.verification_type === "REGRESSION_SMOKE");
  const highRisk = evidence.project_level === "BL2"
    || (evidence.risk_domains || []).some((item) => /high-risk|permission|security|privacy|release/i.test(item))
    || [...requiredSurfaces].some((surface) => highRiskSurfaces.has(surface));
  if (highRisk && onlySmoke) fail(`${label} high-risk or BL2 plan cannot be smoke-only`);

  const controls = evidence.test_correctness_controls || [];
  if (highRisk && !controls.some((item) => item.id === "control:generated-test-review-required")) {
    fail(`${label} high-risk or BL2 plan needs generated-test review control`);
  }
  if (!controls.some((item) => item.id === "control:broad-command-not-proof")) {
    fail(`${label} needs broad-command-not-proof test correctness control`);
  }
}

function requireTypes(label, bySurface, surface, types) {
  const obligations = bySurface.get(surface);
  if (!obligations) return;
  for (const type of types) {
    if (obligations.some((item) => item.verification_type === type)) {
      pass(`${label} ${surface} includes ${type}`);
    } else {
      fail(`${label} ${surface} requires ${type}`);
    }
  }
}

function requireAnyTypes(label, bySurface, surface, types) {
  const obligations = bySurface.get(surface);
  if (!obligations) return;
  if (obligations.some((item) => types.includes(item.verification_type))) {
    pass(`${label} ${surface} includes risk verification`);
  } else {
    fail(`${label} ${surface} requires one of ${types.join(", ")}`);
  }
}

function checkManualVerification(label, evidence) {
  for (const item of evidence.manual_verification || []) {
    if (!meaningful(item.owner)) fail(`${label} manual verification ${item.id} needs owner`);
    if (!meaningful(item.decision_ref)) fail(`${label} manual verification ${item.id} needs decision_ref`);
    if (!meaningful(item.expected_manual_evidence)) fail(`${label} manual verification ${item.id} needs expected evidence`);
  }
}

function checkBoundaries(label, evidence) {
  const boundaries = evidence.boundaries || {};
  for (const field of [
    "writes_target_files",
    "executes_tests",
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
  checkMarkdownIdentity(label, evidence, markdown.identity);
  checkMarkdownProjectCalibration(label, evidence, markdown.projectCalibration);
  checkMarkdownSourceSystems(label, evidence, markdown.sourceSystems);
  compareSurfaceRows(label, evidence.affected_surfaces || [], markdown.affectedSurfaces);
  compareObligationRows(label, evidence.verification_obligations || [], markdown.obligations);
  compareTestCorrectnessControlRows(label, evidence.test_correctness_controls || [], markdown.testCorrectnessControls);
  compareManualVerificationRows(label, evidence.manual_verification || [], markdown.manualVerification);
  compareNotApplicableRows(label, evidence.not_applicable_obligations || [], markdown.notApplicable);
  if (markdown.outcome) {
    if (markdown.outcome === evidence.verification_state) pass(`${label} Markdown outcome matches structured verification_state`);
    else fail(`${label} Markdown outcome ${markdown.outcome} must match structured verification_state ${evidence.verification_state || "<missing>"}`);
  } else {
    fail(`${label} Markdown Outcome section must include the structured verification_state`);
  }
}

function checkMarkdownIdentity(label, evidence, identity) {
  compareScalar(label, "Markdown identity verification_plan_ref", identity.verification_plan_ref, evidence.verification_plan_ref);
  compareScalar(label, "Markdown identity verification_plan_digest", identity.verification_plan_digest, evidence.verification_plan_digest);
  compareScalar(label, "Markdown identity intent_digest", identity.intent_digest, evidence.intent_digest);
}

function checkMarkdownProjectCalibration(label, evidence, calibration) {
  compareScalar(label, "Markdown project level", calibration.project_level, evidence.project_level);
  compareScalar(label, "Markdown change kind", calibration.change_kind, evidence.change_kind);
  compareSet(label, "Markdown platform profiles", calibration.platform_profiles, evidence.platform_profiles || []);
  compareSet(label, "Markdown risk domains", calibration.risk_domains, evidence.risk_domains || []);
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

function compareSurfaceRows(label, structuredRows, markdownRows) {
  const markdownBySurface = new Map(markdownRows.map((row) => [row.surface, row]));
  const structuredSurfaces = new Set(structuredRows.map((row) => row.surface));
  for (const row of structuredRows) {
    const markdown = markdownBySurface.get(row.surface);
    if (!markdown) {
      fail(`${label} Markdown Affected Surface Inputs missing ${row.surface}`);
      continue;
    }
    compareScalar(label, `Markdown affected surface ${row.surface} status`, markdown.status, row.status);
    compareScalar(label, `Markdown affected surface ${row.surface} reason`, markdown.reason, row.reason);
    compareScalar(label, `Markdown affected surface ${row.surface} expected evidence`, markdown.expected_evidence, row.expected_evidence);
  }
  for (const row of markdownRows) {
    if (!structuredSurfaces.has(row.surface)) fail(`${label} Markdown Affected Surface Inputs has extra row ${row.surface}`);
  }
}

function compareObligationRows(label, structuredRows, markdownRows) {
  const markdownById = new Map(markdownRows.map((row) => [row.id, row]));
  const structuredIds = new Set(structuredRows.map((row) => row.id));
  for (const row of structuredRows) {
    const markdown = markdownById.get(row.id);
    if (!markdown) {
      fail(`${label} Markdown Verification Obligations missing ${row.id}`);
      continue;
    }
    compareScalar(label, `Markdown obligation ${row.id} surface`, markdown.surface, row.source_surface);
    compareScalar(label, `Markdown obligation ${row.id} type`, markdown.type, row.verification_type);
    compareScalar(label, `Markdown obligation ${row.id} required`, markdown.required, row.required);
    compareScalar(label, `Markdown obligation ${row.id} priority`, markdown.priority, row.priority);
    compareScalar(label, `Markdown obligation ${row.id} behavior`, markdown.behavior_under_test, row.behavior_under_test);
    compareScalar(label, `Markdown obligation ${row.id} expected evidence`, markdown.expected_evidence, row.expected_evidence);
    compareScalar(label, `Markdown obligation ${row.id} broad command only`, markdown.broad_command_only, row.broad_command_only);
    compareSet(label, `Markdown obligation ${row.id} source refs`, markdown.source_refs, row.source_refs || []);
    compareSet(label, `Markdown obligation ${row.id} coverage scenario ids`, markdown.source_coverage_scenario_ids, row.source_coverage_scenario_ids || []);
    compareScalar(label, `Markdown obligation ${row.id} proof strength`, markdown.required_proof_strength, row.required_proof_strength);
  }
  for (const row of markdownRows) {
    if (!structuredIds.has(row.id)) fail(`${label} Markdown Verification Obligations has extra row ${row.id}`);
  }
}

function compareTestCorrectnessControlRows(label, structuredRows, markdownRows) {
  const markdownById = new Map(markdownRows.map((row) => [row.id, row]));
  const structuredIds = new Set(structuredRows.map((row) => row.id));
  for (const row of structuredRows) {
    const markdown = markdownById.get(row.id);
    if (!markdown) {
      fail(`${label} Markdown Test Correctness Controls missing ${row.id}`);
      continue;
    }
    compareScalar(label, `Markdown test correctness control ${row.id} applies to`, markdown.applies_to, row.applies_to);
    compareScalar(label, `Markdown test correctness control ${row.id} required`, markdown.required, row.required);
    compareScalar(label, `Markdown test correctness control ${row.id} reason`, markdown.reason, row.reason);
  }
  for (const row of markdownRows) {
    if (!structuredIds.has(row.id)) fail(`${label} Markdown Test Correctness Controls has extra row ${row.id}`);
  }
}

function compareManualVerificationRows(label, structuredRows, markdownRows) {
  if (structuredRows.length === 0) {
    const none = markdownRows.length === 1
      && /^none$/i.test(markdownRows[0].id)
      && /not required/i.test(`${markdownRows[0].decision_ref} ${markdownRows[0].expected_manual_evidence}`);
    if (none) pass(`${label} Markdown Manual Verification records none`);
    else fail(`${label} Markdown Manual Verification must record none when structured evidence has no manual verification`);
    return;
  }
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
    compareScalar(label, `Markdown manual verification ${row.id} expected evidence`, markdown.expected_manual_evidence, row.expected_manual_evidence);
    compareScalar(label, `Markdown manual verification ${row.id} blocking`, markdown.blocking, row.blocking);
  }
  for (const row of markdownRows) {
    if (!structuredIds.has(row.id)) fail(`${label} Markdown Manual Verification has extra row ${row.id}`);
  }
}

function compareNotApplicableRows(label, structuredRows, markdownRows) {
  if (structuredRows.length === 0) {
    const none = markdownRows.length === 1
      && /^none$/i.test(markdownRows[0].surface)
      && /no not-applicable obligations recorded/i.test(markdownRows[0].reason);
    if (none) pass(`${label} Markdown Not Applicable Obligations records none`);
    else fail(`${label} Markdown Not Applicable Obligations must record none when structured evidence has no not-applicable obligations`);
    return;
  }
  const markdownBySurface = new Map(markdownRows.map((row) => [row.surface, row]));
  const structuredSurfaces = new Set(structuredRows.map((row) => row.source_surface || row.surface));
  for (const row of structuredRows) {
    const surface = row.source_surface || row.surface;
    const markdown = markdownBySurface.get(surface);
    if (!markdown) {
      fail(`${label} Markdown Not Applicable Obligations missing ${surface}`);
      continue;
    }
    compareScalar(label, `Markdown not applicable ${surface} reason`, markdown.reason, row.reason);
  }
  for (const row of markdownRows) {
    if (!structuredSurfaces.has(row.surface)) fail(`${label} Markdown Not Applicable Obligations has extra row ${row.surface}`);
  }
}

function sourceRefsAreImplementationOnly(refs) {
  if (refs.some((ref) => /^artifact:(business-rule-closures|change-impact-coverage-reports|verification-plans|human-decisions)\//i.test(ref))) {
    return false;
  }
  if (refs.some((ref) => /^human-decision:/i.test(ref))) return false;
  return refs.every((ref) => /\.(js|ts|tsx|jsx|swift|kt|java|go|py|rb|php|rs|cs|sql)$/i.test(ref));
}

function artifactRef(value) {
  const text = String(value || "").trim();
  if (!text || /^not provided$/i.test(text)) return "";
  return text.startsWith("artifact:") ? text : "";
}

function meaningfulArtifact(value) {
  return Boolean(artifactRef(value));
}

function resolveArtifact(reportFile, ref) {
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
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile() && /\.md$/i.test(candidate)) return candidate;
  }
  return null;
}

function verificationPlanRefCandidates(file) {
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
      verification_plan_ref: bulletValue(content, "Verification Plan Identity", "Verification plan ref"),
      verification_plan_digest: bulletValue(content, "Verification Plan Identity", "Verification plan digest"),
      intent_digest: bulletValue(content, "Verification Plan Identity", "Intent digest"),
    },
    projectCalibration: {
      project_level: bulletValue(content, "Project Calibration", "Project level"),
      platform_profiles: codeValuesFromBullet(content, "Project Calibration", "Platform profiles"),
      change_kind: bulletValue(content, "Project Calibration", "Change kind"),
      risk_domains: codeValuesFromBullet(content, "Project Calibration", "Risk domains"),
    },
    affectedSurfaces: tableRows(sectionBody(content, "Affected Surface Inputs", { fallback: "" })).map((row) => ({
      surface: row.surface,
      status: row.status,
      reason: row.reason,
      expected_evidence: row.expected_evidence,
    })),
    obligations: tableRows(sectionBody(content, "Verification Obligations", { fallback: "" })).map((row) => ({
      id: row.id,
      surface: row.surface,
      type: row.type,
      required: row.required,
      priority: row.priority,
      behavior_under_test: row.behavior_under_test,
      expected_evidence: row.expected_evidence,
      broad_command_only: row.broad_command_only,
      source_refs: splitRefs(row.source_refs),
      source_coverage_scenario_ids: splitRefs(row.coverage_scenario_ids).filter((value) => value !== "N/A"),
      required_proof_strength: row.required_proof_strength,
    })),
    testCorrectnessControls: tableRows(sectionBody(content, "Test Correctness Controls", { fallback: "" })).map((row) => ({
      id: row.id,
      applies_to: row.applies_to,
      required: row.required,
      reason: row.reason,
    })),
    manualVerification: tableRows(sectionBody(content, "Manual Verification", { fallback: "" })).map((row) => ({
      id: row.id,
      owner: row.owner,
      decision_ref: row.decision_ref,
      expected_manual_evidence: row.expected_manual_evidence,
      blocking: row.blocking,
    })),
    notApplicable: tableRows(sectionBody(content, "Not Applicable Obligations", { fallback: "" })).map((row) => ({
      surface: row.surface,
      reason: row.reason,
    })),
    outcome: codeOrTextValue(sectionBody(content, "Outcome", { fallback: "" })),
  };
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

function codeValuesFromBullet(content, heading, label) {
  const body = sectionBody(content, heading, { fallback: "" });
  const pattern = new RegExp(`^-\\s+${escapeRegExp(label)}:\\s*(.+)$`, "im");
  const match = body.match(pattern);
  if (!match) return [];
  const codeValues = [...match[1].matchAll(/`([^`]+)`/g)].map((item) => item[1].trim()).filter(Boolean);
  if (codeValues.length > 0) return codeValues;
  return splitRefs(stripMarkdown(match[1]));
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
  return Boolean(text) && !/^(n\/a|none|todo|tbd|not provided|placeholder)$/i.test(text);
}

function meaningfulDigest(value) {
  return /^sha256:[a-f0-9]{64}$/.test(String(value || ""));
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
    console.log(JSON.stringify({
      ok: !failed,
      checks,
    }, null, 2));
  } else {
    console.log("");
    console.log(failed ? "Verification Plan check failed." : "Verification Plan check passed.");
  }
  process.exit(failed ? 1 : 0);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
