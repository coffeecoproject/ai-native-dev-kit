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
} from "./lib/artifact-schema.mjs";
import {
  resolveAuthoritativeEvidenceReference,
  validateEvidenceAuthorityBinding,
} from "./lib/evidence-authority.mjs";
import {
  BUSINESS_UNIVERSE_LIFECYCLE_STAGES,
  coverageScenarioIdentity,
  validateBusinessUniverseChallenger,
} from "./lib/business-universe.mjs";
import { sectionBody, stripMarkdown } from "./lib/markdown.mjs";
import { containsSecretLikeValue } from "./lib/risk-surfaces.mjs";
import { checkTaskEntryBinding } from "./lib/task-entry-binding.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["json", "allow-empty", "report", "require-report", "require-structured-evidence", "require-ready"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = canonicalProjectRoot(path.resolve(process.cwd(), args._[0] || "."));
const outputJson = Boolean(args.json);
const allowEmpty = Boolean(args["allow-empty"]);
const requireReport = Boolean(args["require-report"]);
const requireStructuredEvidence = Boolean(args["require-structured-evidence"]);
const requireReady = Boolean(args["require-ready"]);
const explicitReport = args.report ? safeReportPath(String(args.report)) : "";
const schema = loadSchema(projectRoot, "schemas/artifacts/business-universe-coverage.schema.json");
const taskGovernanceSchema = loadSchema(projectRoot, "schemas/artifacts/task-governance.schema.json");
const shouldRequireAssets = fs.existsSync(path.join(projectRoot, "intentos-manifest.json"))
  || fs.existsSync(path.join(projectRoot, ".intentos", "intentos-manifest.json"));
const checks = [];
let failed = false;

if (unknown.length > 0) abort(`unknown option: --${unknown.join(", --")}`);
if (args.report && !explicitReport) abort("--report must be a safe project-relative Markdown path");
if (!outputJson) console.log("# Business Universe Coverage Check\n");

if (shouldRequireAssets) checkAssets();
checkReports();
emit();

function checkAssets() {
  for (const relative of [
    "core/business-universe-coverage.md",
    "docs/business-universe-coverage.md",
    "templates/business-universe-coverage-report.md",
    "checklists/business-universe-coverage-review.md",
    "prompts/business-universe-coverage-agent.md",
    "schemas/artifacts/business-universe-coverage.schema.json",
    "scripts/lib/business-universe.mjs",
    "scripts/resolve-business-universe-coverage.mjs",
    "scripts/check-business-universe-coverage.mjs",
  ]) {
    const found = resolveAsset(relative);
    if (found) pass(`${displayAsset(relative, found)} exists`);
    else fail(`missing ${relative}`);
  }
  if (resolveDirectory("business-universe-coverage-reports")) pass("business-universe-coverage-reports exists");
  else fail("missing business-universe-coverage-reports");
}

function checkReports() {
  const files = explicitReport ? [explicitReport] : reportFiles();
  if (files.length === 0) {
    if (requireReport || requireReady || requireStructuredEvidence || explicitReport) fail("no Business Universe Coverage reports found");
    else if (allowEmpty) pass("business universe coverage skipped by explicit --allow-empty: no reports");
    else pass("SKIPPED_NO_REPORT: no Business Universe Coverage reports found");
    return;
  }
  files.forEach(checkReport);
}

function checkReport(file) {
  const label = relative(file);
  if (!fs.existsSync(file)) {
    fail(`missing Business Universe Coverage report ${label}`);
    return;
  }
  const content = fs.readFileSync(file, "utf8");
  if (containsSecretLikeValue(content)) fail(`${label} contains secret-like content`);
  else pass(`${label} contains no secret-like value`);
  if (/does not authorize implementation, completion, release, or production/i.test(content)) pass(`${label} states its non-authorizing boundary`);
  else fail(`${label} must state that it does not authorize implementation, completion, release, or production`);
  for (const section of [
    "Human Summary", "Task Entry Binding", "Preliminary Routing", "Structural Relationships",
    "Discovery Boundary", "Categories, Participants, Origins, And Paths", "Lifecycle And Provenance",
    "Selection And Consistency", "Coverage Scenarios", "Fact Dependencies", "Unresolved Items",
    "Challenger Review", "Boundaries", "Machine-Readable Evidence", "Outcome",
  ]) {
    if (sectionBody(content, section)) pass(`${label} includes ${section}`);
    else fail(`${label} missing section ${section}`);
  }
  const validation = validateEvidenceBlock(content, schema, label, {
    require: requireStructuredEvidence || requireReady,
    digestField: "coverage_digest",
  });
  if (!validation.present && !requireStructuredEvidence && !requireReady) {
    pass(`${label} structured evidence optional and not present`);
    return;
  }
  if (!validation.ok) {
    validation.errors.forEach(fail);
    return;
  }
  pass(`${label} has valid final 1.108 structured evidence`);
  checkEvidence(file, content, label, validation.value);
}

function checkEvidence(file, content, label, evidence) {
  if ([`artifact:${relative(file)}`, `file:${relative(file)}`, relative(file)].includes(evidence.coverage_ref)) pass(`${label} coverage_ref points to this report`);
  else fail(`${label} coverage_ref must point to this report`);

  checkTaskEntryBinding({
    content,
    evidence,
    label,
    projectRoot,
    consumer: "business_universe_coverage",
    requireTaskGovernance: true,
    requireWorkQueue: true,
    strictTaskConsumer: true,
    pass,
    fail,
  });
  const taskGovernance = referencedTaskGovernance(file, label, evidence);
  if (taskGovernance) checkRoutingBinding(label, evidence, taskGovernance);

  const locators = indexBy(evidence.evidence_locators, "locator_id", label);
  const authoritySourceRefs = unique([
    ...evidence.evidence_locators.map((item) => item.source_ref),
    stripFragment(evidence.task_entry_binding.work_queue_item_ref),
    evidence.task_entry_binding.task_governance_ref,
    ...evidence.challenger_review.evidence_refs,
  ].filter((item) => /^(artifact|file):/.test(item)));
  const authority = validateEvidenceAuthorityBinding(projectRoot, evidence.authority_binding, {
    taskRef: evidence.task_ref,
    intentDigest: evidence.intent_digest,
    sourceRefs: authoritySourceRefs,
    fromFile: file,
  });
  if (authority.ok) pass(`${label} Evidence Authority binding matches current project, task, revision, and sources`);
  else authority.errors.forEach((error) => fail(`${label} ${error}`));
  checkLocators(file, label, evidence, locators);
  checkDiscovery(label, evidence.discovery_projection);
  checkRelationships(label, evidence, locators);
  checkUniverseGraph(label, evidence, locators);
  checkOutcomes(file, content, label, evidence);
}

function referencedTaskGovernance(fromFile, label, evidence) {
  const ref = evidence.task_entry_binding.task_governance_ref;
  const resolved = resolveAuthoritativeEvidenceReference(projectRoot, fromFile, ref);
  if (!resolved.ok) {
    fail(`${label} Task Governance ref is unsafe or unresolved: ${resolved.error}`);
    return null;
  }
  const source = fs.readFileSync(resolved.file, "utf8");
  const validation = validateEvidenceBlock(source, taskGovernanceSchema, `${label} referenced Task Governance`, {
    require: true,
    digestField: "task_governance_digest",
  });
  if (!validation.ok) {
    validation.errors.forEach(fail);
    return null;
  }
  pass(`${label} references valid current Task Governance evidence`);
  return validation.value;
}

function checkRoutingBinding(label, evidence, governance) {
  const routing = governance.business_universe_routing;
  if (routing?.routing_result === "REQUIRED_WITH_EVIDENCE" && routing.required === "Yes") pass(`${label} Task Governance requires Business Universe Coverage with evidence`);
  else fail(`${label} Task Governance must route REQUIRED_WITH_EVIDENCE`);
  compareSets(label, "reason codes", evidence.preliminary_routing.reason_codes, routing?.reason_codes || []);
  compareSets(label, "relationship ids", evidence.preliminary_routing.relationship_ids, routing?.relationship_ids || []);
  if (evidence.preliminary_routing.preflight_digest === routing?.preflight?.preflight_digest) pass(`${label} preflight digest matches Task Governance`);
  else fail(`${label} preflight digest must match Task Governance`);
  if (evidence.preliminary_routing.discovery_boundary_digest === routing?.preflight?.discovery_boundary_digest) pass(`${label} discovery boundary matches Task Governance preflight`);
  else fail(`${label} discovery boundary must match Task Governance preflight`);
  if (evidence.task_ref === governance.task_ref && evidence.intent_digest === governance.intent_digest) pass(`${label} task and intent match Task Governance`);
  else fail(`${label} task and intent must match Task Governance`);
}

function checkLocators(fromFile, label, evidence, locators) {
  const bindingRefs = new Set((evidence.authority_binding.sources || []).map((item) => item.ref));
  const inspectedRoots = new Set(evidence.discovery_projection.inspected_roots || []);
  const completeSegments = new Set((evidence.discovery_projection.scan_segments || [])
    .filter((item) => item.status === "COMPLETE")
    .map((item) => item.root));
  const rolesBySource = new Map();
  for (const locator of evidence.evidence_locators) {
    if (locator.authority_binding_ref === locator.source_ref) pass(`${label} ${locator.locator_id} points to its Evidence Authority source`);
    else fail(`${label} ${locator.locator_id} authority_binding_ref must equal its source_ref`);
    if (bindingRefs.has(locator.source_ref)) pass(`${label} ${locator.locator_id} source is present in Evidence Authority binding`);
    else fail(`${label} ${locator.locator_id} source is missing from Evidence Authority binding`);
    if (locator.evidence_kind === "PROJECT_SOURCE" && locator.source_ref.startsWith("file:")) {
      const relative = locator.source_ref.slice("file:".length).replaceAll("\\", "/");
      const [sourceRoot] = relative.split("/");
      if (inspectedRoots.has(sourceRoot) && completeSegments.has(sourceRoot)) {
        pass(`${label} ${locator.locator_id} source belongs to a completed discovery segment`);
      } else {
        fail(`${label} ${locator.locator_id} source is outside the completed discovery boundary`);
      }
    }
    const resolved = resolveAuthoritativeEvidenceReference(projectRoot, fromFile, locator.source_ref);
    if (!resolved.ok) {
      fail(`${label} ${locator.locator_id} source is unsafe or unresolved: ${resolved.error}`);
      continue;
    }
    const semantic = semanticDigestFor(resolved.file, locator);
    if (semantic.ok && semantic.digest === locator.semantic_digest) pass(`${label} ${locator.locator_id} semantic digest matches exact locator`);
    else fail(`${label} ${locator.locator_id} semantic locator is stale or unsupported: ${semantic.error || "digest mismatch"}`);
    const roles = rolesBySource.get(locator.source_ref) || [];
    roles.push(`${locator.locator_kind}:${locator.locator}:${locator.relation}`);
    rolesBySource.set(locator.source_ref, roles);
  }
  for (const [source, roles] of rolesBySource) {
    if (new Set(roles).size === roles.length) pass(`${label} ${source} has distinct locators for every recorded role`);
    else fail(`${label} ${source} reuses a bare or duplicate locator for multiple semantic roles`);
  }
  for (const ref of evidence.preliminary_routing.trigger_evidence_locator_refs) requireRef(locators, ref, label, "preliminary routing locator");
}

function checkDiscovery(label, projection) {
  const digestBase = { ...projection };
  delete digestBase.discovery_boundary_digest;
  if (projection.discovery_boundary_digest === evidenceDigest(digestBase, [])) pass(`${label} discovery boundary digest is canonical`);
  else fail(`${label} discovery boundary digest must match the bounded projection`);
  const expectedResumeDigest = evidenceDigest({
    inventory_digest: projection.inventory_digest,
    next_file_index: projection.next_file_index,
    candidate_sources: [...projection.candidate_sources].sort(),
    unsupported_constructs: [...projection.unsupported_constructs].sort(),
  }, []);
  if (projection.resume_state_digest === expectedResumeDigest) pass(`${label} discovery resume state is canonical`);
  else fail(`${label} discovery resume state digest must match the current cursor and candidates`);
  if (projection.next_file_index >= 0
    && projection.total_semantic_files >= 0
    && projection.next_file_index <= projection.total_semantic_files) pass(`${label} discovery cursor is within the semantic inventory`);
  else fail(`${label} discovery cursor exceeds the semantic inventory`);
  if (projection.resumed === "Yes" && /^sha256:[a-f0-9]{64}$/.test(projection.resume_from_state_digest)) pass(`${label} resumed discovery binds the previous state`);
  else if (projection.resumed === "No" && projection.resume_from_state_digest === "N/A") pass(`${label} initial discovery has no fabricated resume source`);
  else fail(`${label} discovery resume source must agree with resumed state`);
  const segmentIds = new Set((projection.scan_segments || []).map((item) => item.segment_id));
  for (const id of [...projection.completed_segment_ids, ...projection.remaining_segment_ids]) {
    if (segmentIds.has(id) || id === "segment:budget-remainder") pass(`${label} discovery segment ${id} is represented`);
    else fail(`${label} discovery segment ${id} is not represented`);
  }
  if (projection.support_status === "SUPPORTED"
    && projection.truncated === "No"
    && projection.budget_exhausted === "No"
    && projection.next_file_index === projection.total_semantic_files
    && projection.remaining_segment_ids.length === 0
    && projection.unsupported_constructs.length === 0) {
    pass(`${label} discovery projection is complete within its explicit boundary`);
  } else if (requireReady) {
    fail(`${label} COVERAGE_READY requires supported, non-truncated, non-exhausted discovery with no remaining segments or unsupported constructs`);
  } else {
    pass(`${label} incomplete discovery remains visible and cannot satisfy ready mode`);
  }
}

function checkRelationships(label, evidence, locators) {
  const relationshipIds = new Set();
  const relationshipReasons = new Set();
  for (const relation of evidence.trigger.structural_relationships) {
    if (relationshipIds.has(relation.relationship_id)) fail(`${label} duplicate relationship_id ${relation.relationship_id}`);
    relationshipIds.add(relation.relationship_id);
    relationshipReasons.add(relation.reason_code);
    if (relation.evidence_locator_refs.length > 0) pass(`${label} ${relation.relationship_id} has structural evidence locators`);
    else fail(`${label} ${relation.relationship_id} cannot be supported by prose alone`);
    relation.evidence_locator_refs.forEach((ref) => requireRef(locators, ref, label, `relationship ${relation.relationship_id}`));
  }
  compareSets(label, "trigger reason codes", evidence.trigger.reason_codes, evidence.preliminary_routing.reason_codes);
  for (const reason of evidence.preliminary_routing.reason_codes.filter((item) => item !== "HIGH_RISK_OMISSION_AMPLIFIER")) {
    if (relationshipReasons.has(reason)) pass(`${label} ${reason} has an exact structural relationship`);
    else fail(`${label} ${reason} requires an exact structural relationship`);
  }
  if (relationshipReasons.has("SELECTIVE_INCLUSION_OR_FANOUT") && evidence.selection_points.length === 0) fail(`${label} selective inclusion or fan-out requires a selection point`);
  if (relationshipReasons.has("DERIVED_OUTPUT_DEPENDENCY") && evidence.consistency_groups.length === 0) fail(`${label} derived output dependency requires a consistency group`);
  if (relationshipReasons.has("LIFECYCLE_BRANCH_OR_RECOVERY")) {
    const branchStages = new Set(["MUTATION_OR_CORRECTION", "FAILURE_RETRY_OR_RECOVERY", "TERMINATION_REVERSAL_OR_COMPENSATION"]);
    if (evidence.lifecycle_coverage.some((item) => branchStages.has(item.lifecycle_stage) && item.disposition === "REQUIRED")) pass(`${label} lifecycle branch routing has a required non-forward stage`);
    else fail(`${label} lifecycle branch routing requires an evidenced non-forward lifecycle stage`);
  }
  if (relationshipReasons.has("PATH_PROVENANCE_AMBIGUITY")) {
    const provenances = new Set(evidence.processing_paths.map((item) => item.path_provenance));
    if (provenances.size >= 2 || provenances.has("UNKNOWN_PATH")) pass(`${label} path-provenance routing records coexistence or ambiguity`);
    else fail(`${label} path-provenance ambiguity requires distinct or unknown path provenance`);
  }
}

function checkUniverseGraph(label, evidence, locators) {
  const categories = indexBy(evidence.categories, "category_id", label);
  const participants = indexBy(evidence.participants, "participant_id", label);
  const origins = indexBy(evidence.origins, "origin_id", label);
  const paths = indexBy(evidence.processing_paths, "processing_path_id", label);
  const selections = indexBy(evidence.selection_points, "selection_point_id", label);
  const groups = indexBy(evidence.consistency_groups, "consistency_group_id", label);
  const scenarios = indexBy(evidence.coverage_scenarios, "coverage_scenario_id", label);
  const facts = indexBy(evidence.fact_dependencies, "fact_dependency_id", label);

  for (const category of evidence.categories) {
    category.evidence_locator_refs.forEach((ref) => requireRef(locators, ref, label, category.category_id));
    category.exclusion_basis_locator_refs.forEach((ref) => requireRef(locators, ref, label, `${category.category_id} exclusion`));
    if (category.disposition === "EXCLUDED_WITH_EVIDENCE" && category.exclusion_basis_locator_refs.length === 0) fail(`${label} ${category.category_id} excluded disposition requires exact exclusion evidence`);
    if (category.disposition !== "EXCLUDED_WITH_EVIDENCE" && category.evidence_locator_refs.length === 0) fail(`${label} ${category.category_id} requires semantic evidence`);
    if (evidence.outcome === "COVERAGE_READY" && category.semantic_state !== "EVIDENCE_BOUND") fail(`${label} ready coverage cannot contain ${category.semantic_state} category ${category.category_id}`);
  }
  for (const participant of evidence.participants) participant.evidence_locator_refs.forEach((ref) => requireRef(locators, ref, label, participant.participant_id));
  for (const origin of evidence.origins) {
    origin.category_ids.forEach((ref) => requireRef(categories, ref, label, origin.origin_id));
    origin.participant_ids.forEach((ref) => requireRef(participants, ref, label, origin.origin_id));
    origin.evidence_locator_refs.forEach((ref) => requireRef(locators, ref, label, origin.origin_id));
    if (evidence.outcome === "COVERAGE_READY" && ["CANDIDATE", "TECHNICAL_INSPECTION_REQUIRED"].includes(origin.semantic_state)) fail(`${label} ready coverage cannot contain unresolved origin ${origin.origin_id}`);
  }
  for (const processingPath of evidence.processing_paths) {
    processingPath.category_ids.forEach((ref) => requireRef(categories, ref, label, processingPath.processing_path_id));
    processingPath.origin_ids.forEach((ref) => requireRef(origins, ref, label, processingPath.processing_path_id));
    processingPath.evidence_locator_refs.forEach((ref) => requireRef(locators, ref, label, processingPath.processing_path_id));
    if (evidence.outcome === "COVERAGE_READY" && ["UNKNOWN_PATH"].includes(processingPath.path_provenance)) fail(`${label} ready coverage cannot contain UNKNOWN_PATH ${processingPath.processing_path_id}`);
    if (evidence.outcome === "COVERAGE_READY" && processingPath.semantic_state !== "EVIDENCE_BOUND") fail(`${label} ready coverage cannot contain unresolved path ${processingPath.processing_path_id}`);
  }
  for (const selection of evidence.selection_points) {
    selection.affected_category_ids.forEach((ref) => requireRef(categories, ref, label, selection.selection_point_id));
    selection.evidence_locator_refs.forEach((ref) => requireRef(locators, ref, label, selection.selection_point_id));
    if (selection.handling === "BLOCKED" && evidence.outcome === "COVERAGE_READY") fail(`${label} ready coverage cannot contain blocked selection point ${selection.selection_point_id}`);
  }
  for (const group of evidence.consistency_groups) {
    group.contributor_category_ids.forEach((ref) => requireRef(categories, ref, label, group.consistency_group_id));
    group.contributor_origin_ids.forEach((ref) => requireRef(origins, ref, label, group.consistency_group_id));
    group.evidence_locator_refs.forEach((ref) => requireRef(locators, ref, label, group.consistency_group_id));
    const contributorCount = new Set([...group.contributor_category_ids, ...group.contributor_origin_ids]).size;
    if (contributorCount >= 2) pass(`${label} ${group.consistency_group_id} has at least two exact contributors`);
    else fail(`${label} ${group.consistency_group_id} requires at least two contributors`);
  }
  for (const lifecycle of evidence.lifecycle_coverage) {
    lifecycle.category_ids.forEach((ref) => requireRef(categories, ref, label, lifecycle.lifecycle_coverage_id));
    lifecycle.evidence_locator_refs.forEach((ref) => requireRef(locators, ref, label, lifecycle.lifecycle_coverage_id));
    lifecycle.coverage_scenario_ids.forEach((ref) => requireRef(scenarios, ref, label, lifecycle.lifecycle_coverage_id));
    if (!BUSINESS_UNIVERSE_LIFECYCLE_STAGES.includes(lifecycle.lifecycle_stage)) fail(`${label} ${lifecycle.lifecycle_coverage_id} uses unknown lifecycle stage`);
    if (lifecycle.disposition === "NOT_APPLICABLE_WITH_EVIDENCE" && lifecycle.evidence_locator_refs.length === 0) fail(`${label} ${lifecycle.lifecycle_coverage_id} not-applicable disposition requires exact evidence`);
    if (lifecycle.disposition === "REQUIRED" && lifecycle.coverage_scenario_ids.length === 0) fail(`${label} ${lifecycle.lifecycle_coverage_id} required stage needs a scenario`);
    if (lifecycle.disposition === "NOT_APPLICABLE_WITH_EVIDENCE" && lifecycle.coverage_scenario_ids.length > 0) fail(`${label} ${lifecycle.lifecycle_coverage_id} not-applicable stage cannot carry required scenarios`);
    if (evidence.outcome === "COVERAGE_READY" && lifecycle.disposition === "TECHNICAL_INSPECTION_REQUIRED") fail(`${label} ready coverage cannot contain technical-inspection lifecycle row ${lifecycle.lifecycle_coverage_id}`);
  }
  for (const scenario of evidence.coverage_scenarios) {
    scenario.category_ids.forEach((ref) => requireRef(categories, ref, label, scenario.coverage_scenario_id));
    scenario.participant_ids.forEach((ref) => requireRef(participants, ref, label, scenario.coverage_scenario_id));
    scenario.origin_ids.forEach((ref) => requireRef(origins, ref, label, scenario.coverage_scenario_id));
    scenario.processing_path_ids.forEach((ref) => requireRef(paths, ref, label, scenario.coverage_scenario_id));
    scenario.selection_point_ids.forEach((ref) => requireRef(selections, ref, label, scenario.coverage_scenario_id));
    scenario.consistency_group_ids.forEach((ref) => requireRef(groups, ref, label, scenario.coverage_scenario_id));
    scenario.source_locator_refs.forEach((ref) => requireRef(locators, ref, label, scenario.coverage_scenario_id));
    const expected = coverageScenarioIdentity(scenario);
    if (scenario.coverage_scenario_id === expected.coverage_scenario_id && scenario.scenario_digest === expected.scenario_digest) pass(`${label} ${scenario.coverage_scenario_id} has stable canonical identity`);
    else fail(`${label} ${scenario.coverage_scenario_id} identity or digest does not match its semantic scenario`);
    checkProofScope(label, scenario);
  }
  checkLifecycleMatrix(label, evidence, categories, scenarios);
  for (const fact of evidence.fact_dependencies) {
    fact.dependent_category_ids.forEach((ref) => requireRef(categories, ref, label, fact.fact_dependency_id));
    fact.dependent_processing_path_ids.forEach((ref) => requireRef(paths, ref, label, fact.fact_dependency_id));
    fact.dependent_coverage_scenario_ids.forEach((ref) => requireRef(scenarios, ref, label, fact.fact_dependency_id));
  }
  for (const unresolved of evidence.unresolved_items) {
    unresolved.dependent_fact_ids.forEach((ref) => requireRef(facts, ref, label, unresolved.unresolved_id));
    unresolved.evidence_locator_refs.forEach((ref) => requireRef(locators, ref, label, unresolved.unresolved_id));
  }
  for (const category of evidence.categories.filter((item) => item.disposition !== "EXCLUDED_WITH_EVIDENCE")) {
    if (evidence.coverage_scenarios.some((scenario) => scenario.category_ids.includes(category.category_id))) pass(`${label} ${category.category_id} is preserved in coverage scenarios`);
    else fail(`${label} ${category.category_id} is dropped before coverage scenarios`);
  }
}

function checkLifecycleMatrix(label, evidence, categories, scenarios) {
  const rowsByCategoryAndStage = new Map();
  for (const row of evidence.lifecycle_coverage) {
    for (const categoryId of row.category_ids) {
      const key = `${categoryId}|${row.lifecycle_stage}`;
      const rows = rowsByCategoryAndStage.get(key) || [];
      rows.push(row);
      rowsByCategoryAndStage.set(key, rows);
    }
  }

  for (const category of evidence.categories.filter((item) => item.disposition !== "EXCLUDED_WITH_EVIDENCE")) {
    for (const stage of BUSINESS_UNIVERSE_LIFECYCLE_STAGES) {
      const key = `${category.category_id}|${stage}`;
      const rows = rowsByCategoryAndStage.get(key) || [];
      if (evidence.outcome === "COVERAGE_READY" && rows.length === 1) {
        pass(`${label} ${category.category_id} declares lifecycle stage ${stage} exactly once`);
      } else if (evidence.outcome === "COVERAGE_READY") {
        fail(`${label} ${category.category_id} must declare lifecycle stage ${stage} exactly once`);
      }
      for (const row of rows.filter((item) => item.disposition === "REQUIRED")) {
        const exactScenarios = row.coverage_scenario_ids
          .map((id) => scenarios.get(id))
          .filter((scenario) => scenario
            && scenario.lifecycle_stage === stage
            && scenario.category_ids.includes(category.category_id));
        if (exactScenarios.length === row.coverage_scenario_ids.length && exactScenarios.length > 0) {
          pass(`${label} ${category.category_id} ${stage} scenarios match the exact category and lifecycle stage`);
        } else {
          fail(`${label} ${category.category_id} ${stage} requires exact category-and-stage scenarios`);
        }
      }
    }
  }

  for (const scenario of evidence.coverage_scenarios) {
    const represented = evidence.lifecycle_coverage.some((row) => row.disposition === "REQUIRED"
      && row.lifecycle_stage === scenario.lifecycle_stage
      && row.coverage_scenario_ids.includes(scenario.coverage_scenario_id)
      && scenario.category_ids.every((categoryId) => row.category_ids.includes(categoryId)));
    if (represented) pass(`${label} ${scenario.coverage_scenario_id} is anchored to a required lifecycle row`);
    else fail(`${label} ${scenario.coverage_scenario_id} must be anchored to a required lifecycle row`);
  }
}

function checkProofScope(label, scenario) {
  if (["FIXTURE_OR_SEED_PATH", "MOCK_OR_STUB_PATH", "MANUAL_ONLY_PATH"].includes(scenario.path_provenance)
    && ["PROJECT_NATIVE_BEHAVIOR_PROOF", "RUNTIME_TRUSTED_BEHAVIOR_PROOF"].includes(scenario.required_proof_strength)) {
    fail(`${label} ${scenario.coverage_scenario_id} cannot use ${scenario.path_provenance} to demand or imply project-runtime proof`);
  }
  if (scenario.path_provenance === "UNKNOWN_PATH" && scenario.required_proof_strength !== "STRUCTURAL_SOURCE_PROOF") {
    fail(`${label} ${scenario.coverage_scenario_id} with UNKNOWN_PATH cannot claim behavior proof`);
  }
}

function checkOutcomes(file, content, label, evidence) {
  const unresolvedTypes = new Set(evidence.unresolved_items.map((item) => item.unresolved_type));
  if (evidence.outcome === "COVERAGE_READY") {
    if (evidence.unresolved_items.length === 0) pass(`${label} ready coverage has no unresolved items`);
    else fail(`${label} ready coverage cannot contain unresolved items`);
    if (evidence.challenger_review.required === "Yes") {
      if (evidence.challenger_review.status === "PASSED" && evidence.challenger_review.evidence_refs.length > 0) pass(`${label} required Challenger passed with evidence`);
      else fail(`${label} required Challenger must pass with project-local evidence before ready`);
    }
  }
  if (evidence.outcome === "BLOCKED_INCOMPLETE_UNIVERSE" && !unresolvedTypes.has("TECHNICAL_INSPECTION")) fail(`${label} incomplete coverage must record a technical inspection blocker`);
  if (evidence.outcome === "BUSINESS_FACT_NEEDED" && !unresolvedTypes.has("BUSINESS_FACT")) fail(`${label} BUSINESS_FACT_NEEDED requires a scoped business fact dependency`);
  if (evidence.outcome === "EXTERNAL_FACT_NEEDED" && !unresolvedTypes.has("EXTERNAL_FACT")) fail(`${label} EXTERNAL_FACT_NEEDED requires a scoped external fact dependency`);
  for (const ref of evidence.challenger_review.evidence_refs) {
    const resolved = resolveAuthoritativeEvidenceReference(projectRoot, file, ref);
    if (!resolved.ok) {
      fail(`${label} Challenger evidence is unsafe or unresolved: ${ref}`);
      continue;
    }
    const extracted = extractMachineReadableEvidence(fs.readFileSync(resolved.file, "utf8"));
    const validation = validateBusinessUniverseChallenger(extracted?.ok ? extracted.value : null, {
      taskRef: evidence.task_ref,
      intentDigest: evidence.intent_digest,
      discoveryBoundaryDigest: evidence.discovery_projection.discovery_boundary_digest,
      scenarios: evidence.coverage_scenarios,
    });
    if (validation.ok) pass(`${label} Challenger evidence is current-task, intent, scan, and scenario bound`);
    else validation.errors.forEach((error) => fail(`${label} ${error}`));
  }
  const outcomeText = stripMarkdown(sectionBody(content, "Outcome") || "");
  if (outcomeText.includes(evidence.outcome)) pass(`${label} Markdown outcome matches structured evidence`);
  else fail(`${label} Markdown outcome must match structured evidence`);
  for (const [field, expected] of Object.entries({
    writes_target_files: "No",
    authorizes_implementation: "No",
    approves_completion: "No",
    approves_release_or_production: "No",
    replaces_unified_closure: "No",
    claims_real_world_completeness: "No",
  })) {
    if (evidence.boundaries[field] === expected) pass(`${label} boundary ${field} is ${expected}`);
    else fail(`${label} boundary ${field} must be ${expected}`);
  }
  if (requireReady && evidence.outcome !== "COVERAGE_READY") fail(`${label} --require-ready requires COVERAGE_READY`);
}

function semanticDigestFor(file, locator) {
  const content = fs.readFileSync(file, "utf8");
  if (locator.locator_kind === "LINE_RANGE") {
    const match = /^L(\d+)-L(\d+)$/.exec(locator.locator);
    if (!match) return { ok: false, error: "invalid line-range locator" };
    const start = Number(match[1]);
    const end = Number(match[2]);
    const lines = content.split(/\r?\n/);
    if (start < 1 || end < start || end > lines.length) return { ok: false, error: "line range is outside source" };
    return { ok: true, digest: digest(lines.slice(start - 1, end).join("\n").trim().replace(/\s+/g, " ")) };
  }
  if (locator.locator_kind === "JSON_POINTER") {
    try {
      const value = jsonPointer(JSON.parse(content), locator.locator);
      return value.found ? { ok: true, digest: digest(JSON.stringify(value.value)) } : { ok: false, error: "JSON pointer does not resolve" };
    } catch {
      return { ok: false, error: "JSON source is invalid" };
    }
  }
  if (["SYMBOL", "SCHEMA_ENTITY", "ROUTE_ID", "TEST_ID", "PROJECT_NATIVE_ID", "YAML_PATH"].includes(locator.locator_kind)) {
    const line = content.split(/\r?\n/).find((item) => item.includes(locator.locator));
    if (!line && locator.locator_kind !== "PROJECT_NATIVE_ID") return { ok: false, error: "stable locator is not present in source" };
    const material = line ? line.trim().replace(/\s+/g, " ") : content;
    return { ok: true, digest: digest(material) };
  }
  return { ok: false, error: `unsupported locator kind ${locator.locator_kind}` };
}

function jsonPointer(root, pointer) {
  if (pointer === "") return { found: true, value: root };
  if (!pointer.startsWith("/")) return { found: false };
  let value = root;
  for (const token of pointer.slice(1).split("/").map((item) => item.replace(/~1/g, "/").replace(/~0/g, "~"))) {
    if (value === null || typeof value !== "object" || !(token in value)) return { found: false };
    value = value[token];
  }
  return { found: true, value };
}

function indexBy(rows, key, label) {
  const map = new Map();
  for (const row of rows || []) {
    const id = row[key];
    if (map.has(id)) fail(`${label} duplicate ${key} ${id}`);
    map.set(id, row);
  }
  return map;
}

function requireRef(index, ref, label, owner) {
  if (index.has(ref)) pass(`${label} ${owner} references ${ref}`);
  else fail(`${label} ${owner} references missing ${ref}`);
}

function compareSets(label, name, left, right) {
  const actual = [...new Set(left || [])].sort();
  const expected = [...new Set(right || [])].sort();
  if (JSON.stringify(actual) === JSON.stringify(expected)) pass(`${label} ${name} match authoritative source`);
  else fail(`${label} ${name} do not match authoritative source (${actual.join(", ")} != ${expected.join(", ")})`);
}

function safeReportPath(value) {
  if (path.isAbsolute(value)) return "";
  const resolved = resolveAuthoritativeEvidenceReference(projectRoot, "", `artifact:${value}`, { markdownOnly: true });
  return resolved.ok ? resolved.file : "";
}

function reportFiles() {
  const roots = [path.join(projectRoot, "business-universe-coverage-reports"), path.join(projectRoot, ".intentos", "business-universe-coverage-reports")];
  return roots.flatMap((root) => fs.existsSync(root) ? fs.readdirSync(root)
    .filter((entry) => entry.endsWith(".md"))
    .map((entry) => path.join(root, entry))
    .filter((file) => fs.statSync(file).isFile()) : []);
}

function resolveAsset(relativePath) {
  for (const file of [path.join(projectRoot, relativePath), path.join(projectRoot, ".intentos", relativePath)]) if (fs.existsSync(file)) return file;
  return "";
}

function resolveDirectory(relativePath) {
  for (const dir of [path.join(projectRoot, relativePath), path.join(projectRoot, ".intentos", relativePath)]) if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) return dir;
  return "";
}

function displayAsset(requested, resolved) {
  return resolved.includes(`${path.sep}.intentos${path.sep}`) ? `.intentos/${requested}` : requested;
}

function stripFragment(ref) {
  return String(ref || "").split("#")[0];
}

function relative(file) {
  return path.relative(projectRoot, file).split(path.sep).join("/");
}

function canonicalProjectRoot(root) {
  return fs.existsSync(root) ? fs.realpathSync(root) : root;
}

function digest(value) {
  return `sha256:${crypto.createHash("sha256").update(String(value)).digest("hex")}`;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function pass(message) {
  checks.push({ status: "PASS", message });
  if (!outputJson) console.log(`PASS ${message}`);
}

function fail(message) {
  failed = true;
  checks.push({ status: "FAIL", message });
  if (!outputJson) console.error(`FAIL ${message}`);
}

function abort(message) {
  console.error(`FAIL ${message}`);
  process.exit(1);
}

function emit() {
  if (outputJson) process.stdout.write(`${JSON.stringify({ ok: !failed, checks }, null, 2)}\n`);
  else if (!failed) console.log("\nBusiness Universe Coverage check passed.");
  process.exitCode = failed ? 1 : 0;
}
