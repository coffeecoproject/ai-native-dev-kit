#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { evidenceDigest, extractMachineReadableEvidence } from "./lib/artifact-schema.mjs";
import { createEvidenceAuthorityBinding, resolveAuthoritativeEvidenceReference } from "./lib/evidence-authority.mjs";
import {
  resolveRuntimeTrustBinding,
  runtimeBindingMarkdown,
  runtimeEvidenceItems,
} from "./lib/verification-runtime-consumer.mjs";
import { controlEffectivenessBinding } from "./lib/control-effectiveness.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set([
  "json",
  "format",
  "intent",
  "verification-plan-ref",
  "runtime-manifest-ref",
  "evidence",
  "existing-project-ref",
  "out",
]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputFormat = args.json ? "json" : String(args.format || "human");
const intent = String(args.intent || args._.slice(1).join(" ") || "").trim();
const verificationPlanRef = String(args["verification-plan-ref"] || "").trim();
const runtimeManifestRef = String(args["runtime-manifest-ref"] || "").trim();
const evidenceRefs = splitList(args.evidence);
const existingProjectRef = String(args["existing-project-ref"] || "").trim();
const outputPath = args.out ? resolveOutputPath(projectRoot, args.out) : "";

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
  const verificationPlan = resolveVerificationPlan(root, verificationPlanRef);
  const planEvidence = verificationPlan.evidence;
  const resolvedIntent = intent || planEvidence?.intent || "Not provided";
  const taskRef = planEvidence?.task_ref || `tasks/001-${slugify(resolvedIntent)}.md`;
  const intentDigest = planEvidence?.intent_digest || digest(resolvedIntent);
  const reportSlug = slugify(resolvedIntent || "test-evidence");
  const testEvidenceRef = testEvidenceRefForOutput(root, outputPath, reportSlug);
  const sourceSystems = sourceSystemsFor(verificationPlan);
  const requiredObligations = requiredObligationsFor(planEvidence);
  const runtimeTrustRequired = Boolean(runtimeManifestRef)
    || requiredObligations.some((item) => item.required_proof_strength === "RUNTIME_TRUSTED_BEHAVIOR_PROOF");
  const runtimeTrust = resolveRuntimeTrustBinding(root, {
    required: runtimeTrustRequired,
    notRequiredReason: "The current Verification Plan does not require runtime-trusted behavior proof.",
    manifestRef: runtimeManifestRef,
    taskRef,
    intentDigest,
    verificationPlanRef: verificationPlan.ref,
    verificationPlanDigest: planEvidence?.verification_plan_digest,
  });
  if (runtimeTrust.manifest) {
    sourceSystems.push({
      name: "verification_run_manifest",
      status: "RECORDED",
      ref: runtimeTrust.binding.run_manifest_ref,
      source_outcome: runtimeTrust.manifest.outcome,
      digest: runtimeTrust.binding.run_manifest_digest,
    });
  }
  const evidenceItems = [
    ...runtimeEvidenceItems(runtimeTrust.manifest),
    ...evidenceRefs.map((ref, index) => evidenceItemFor(root, ref, index + 1)),
  ];
  const coverageMap = coverageMapFor(requiredObligations, evidenceItems);
  const universeBinding = testEvidenceUniverseBindingFor(planEvidence?.business_universe_binding);
  const controlBinding = testEvidenceControlBindingFor(planEvidence?.control_effectiveness_binding);
  const scenarioCoverageMap = scenarioCoverageMapFor(universeBinding, requiredObligations, coverageMap);
  const controls = testQualityControlsFor(planEvidence, evidenceItems, coverageMap);
  const manual = manualVerificationFor(planEvidence, evidenceItems);
  const gaps = knownGapsFor(requiredObligations, coverageMap, evidenceItems);
  const state = stateFor(
    requiredObligations,
    coverageMap,
    scenarioCoverageMap,
    universeBinding,
    evidenceItems,
    verificationPlan,
    runtimeTrustRequired,
    runtimeTrust.binding,
    controlBinding,
  );
  const boundaries = boundariesFor();
  const structuredBase = {
    schema_version: "1.110.0",
    artifact_type: "test_evidence",
    task_ref: taskRef,
    intent: resolvedIntent,
    intent_digest: intentDigest,
    test_evidence_ref: testEvidenceRef,
    test_evidence_digest: "",
    verification_plan_ref: verificationPlan.ref || "not provided",
    verification_plan_digest: planEvidence?.verification_plan_digest || "not provided",
    verification_plan_state: planEvidence?.verification_state || "not provided",
    source_systems: sourceSystems,
    runtime_trust_binding: runtimeTrust.binding,
    control_effectiveness_binding: controlBinding,
    authority_binding: createEvidenceAuthorityBinding(root, {
      taskRef,
      intentDigest,
      sourceRefs: [
        verificationPlan.ref,
        ...sourceSystems.map((item) => item.ref),
        ...evidenceItems.map((item) => item.ref),
      ],
    }),
    test_evidence_state: state,
    evidence_items: evidenceItems,
    coverage_map: coverageMap,
    business_universe_binding: universeBinding,
    scenario_coverage_map: scenarioCoverageMap,
    test_quality_controls: controls,
    known_gaps: gaps,
    manual_verification: manual,
    existing_project_mapping: existingProjectMappingFor(existingProjectRef),
    boundaries,
    next_step: nextStepFor(state),
  };
  const structuredEvidence = {
    ...structuredBase,
    test_evidence_digest: evidenceDigest(structuredBase, ["test_evidence_digest"]),
  };
  return {
    reportType: "TEST_EVIDENCE_REPORT",
    schemaVersion: "1.110.0",
    generatedBy: "scripts/resolve-test-evidence.mjs",
    generatedAt: new Date().toISOString(),
    projectRoot: root,
    readOnly: true,
    humanSummary: summaryFor(state, requiredObligations, coverageMap, evidenceItems),
    intent: resolvedIntent,
    taskRef,
    verificationPlan,
    evidenceItems,
    coverageMap,
    businessUniverseBinding: universeBinding,
    scenarioCoverageMap,
    testQualityControls: controls,
    knownGaps: gaps,
    manualVerification: manual,
    existingProjectMapping: structuredEvidence.existing_project_mapping,
    boundaries,
    outcome: state,
    nextStep: nextStepFor(state),
    structuredEvidence,
  };
}

function resolveVerificationPlan(root, ref) {
  if (!normalizeArtifactRef(ref)) return { ref: "", file: "", evidence: null };
  const resolved = resolveAuthoritativeEvidenceReference(root, "", ref);
  if (!resolved.ok) return { ref, file: "", evidence: null };
  const content = fs.readFileSync(resolved.file, "utf8");
  const extracted = extractMachineReadableEvidence(content);
  return { ref, file: resolved.file, evidence: extracted?.ok ? extracted.value : null };
}

function sourceSystemsFor(verificationPlan) {
  const systems = [];
  if (verificationPlan.ref) {
    systems.push({
      name: "verification_plan",
      status: verificationPlan.evidence ? "RECORDED" : "UNRESOLVED",
      ref: verificationPlan.ref,
      source_outcome: verificationPlan.evidence?.verification_state || "UNRESOLVED",
      digest: verificationPlan.evidence?.verification_plan_digest || "not provided",
    });
  }
  for (const source of verificationPlan.evidence?.source_systems || []) {
    if (["business_rule_closure", "business_universe_coverage", "control_effectiveness", "change_impact_coverage"].includes(source.name)) {
      systems.push({
        name: source.name,
        status: source.status,
        ref: source.ref,
        source_outcome: source.source_outcome,
        digest: source.digest,
      });
    }
  }
  return systems;
}

function requiredObligationsFor(planEvidence) {
  return (planEvidence?.verification_obligations || [])
    .filter((item) => item.required === "Yes")
    .map((item) => ({
      id: item.id,
      source_surface: item.source_surface,
      verification_type: item.verification_type,
      priority: item.priority,
      broad_command_only: item.broad_command_only,
      expected_evidence: item.expected_evidence,
      source_coverage_scenario_ids: [...(item.source_coverage_scenario_ids || [])],
      required_proof_strength: item.required_proof_strength || "NOT_APPLICABLE",
    }));
}

function testEvidenceUniverseBindingFor(binding) {
  if (!binding) {
    return {
      required: "No",
      routing_result: "NOT_REQUIRED_WITH_REASON",
      business_universe_ref: "N/A",
      business_universe_digest: "N/A",
      business_universe_state: "NOT_REQUIRED_WITH_REASON",
      coverage_scenario_ids: [],
      coverage_mapping_status: "NOT_REQUIRED",
    };
  }
  return {
    required: binding.required,
    routing_result: binding.routing_result,
    business_universe_ref: binding.business_universe_ref,
    business_universe_digest: binding.business_universe_digest,
    business_universe_state: binding.business_universe_state,
    coverage_scenario_ids: [...(binding.coverage_scenario_ids || [])],
    coverage_mapping_status: binding.coverage_mapping_status,
  };
}

function scenarioCoverageMapFor(binding, obligations, coverageMap) {
  if (binding.required !== "Yes") return [];
  const coverageByObligation = new Map(coverageMap.map((item) => [item.obligation_id, item]));
  return (binding.coverage_scenario_ids || []).map((scenarioId) => {
    const scenarioObligations = obligations.filter((item) => (item.source_coverage_scenario_ids || []).includes(scenarioId));
    const requiredIds = scenarioObligations.map((item) => item.id);
    const coveredIds = requiredIds.filter((id) => coverageByObligation.get(id)?.coverage_state === "COVERED");
    const evidenceIds = [...new Set(requiredIds.flatMap((id) => coverageByObligation.get(id)?.evidence_ids || []))];
    const proofStrengths = [...new Set(scenarioObligations.map((item) => item.required_proof_strength))];
    const state = binding.coverage_mapping_status !== "COMPLETE" || requiredIds.length === 0
      ? "BLOCKED"
      : coveredIds.length === requiredIds.length
        ? "COVERED"
        : coveredIds.length > 0 ? "PARTIAL" : "NOT_COVERED";
    return {
      coverage_scenario_id: scenarioId,
      required_obligation_ids: requiredIds,
      covered_obligation_ids: coveredIds,
      required_proof_strength: proofStrengths.length === 1 ? proofStrengths[0] : "MIXED_OR_INVALID",
      coverage_state: state,
      evidence_ids: evidenceIds,
    };
  });
}

function evidenceItemFor(root, ref, index) {
  const normalized = normalizeArtifactRef(ref) || ref;
  const file = resolveEvidenceFile(root, normalized);
  const content = file ? fs.readFileSync(file, "utf8") : "";
  const metadata = evidenceMetadata(content);
  const id = metadata.id || `evidence:${slugify(path.basename(normalized || `item-${index}`, path.extname(normalized || ""))) || index}`;
  return {
    id,
    evidence_type: metadata.evidence_type || "COMMAND_OUTPUT",
    result_state: metadata.result_state || (file ? "UNRESOLVED" : "NOT_RUN_WITH_REASON"),
    ref: ref.startsWith("artifact:") ? ref : artifactRefFromPath(root, file || normalized),
    command: metadata.command || "not recorded",
    owner: metadata.owner || "not recorded",
    environment: metadata.environment || "not recorded",
    ran_at: metadata.ran_at || "not recorded",
    exit_code: exitCodeFor(metadata),
    ran_after_change: metadata.ran_after_change || "Unknown",
    current_task_match: metadata.current_task_match || "Unknown",
    covers_obligations: splitList(metadata.covers_obligations || metadata.covers || ""),
    output_digest: file ? fileDigest(file) : "not provided",
    failure_reason: metadata.failure_reason || "not recorded",
    limitations: metadata.limitations || "not recorded",
  };
}

function evidenceMetadata(content) {
  const metadata = {};
  for (const line of String(content || "").split(/\r?\n/)) {
    const match = line.match(/^\s*([a-zA-Z0-9_-]+)\s*:\s*(.+?)\s*$/);
    if (!match) continue;
    metadata[match[1].trim().toLowerCase().replace(/-/g, "_")] = match[2].trim();
  }
  return metadata;
}

function coverageMapFor(requiredObligations, evidenceItems) {
  return requiredObligations.map((obligation) => {
    const matching = evidenceItems.filter((item) => item.covers_obligations.includes(obligation.id));
    if (matching.some((item) => item.result_state === "PASSED")) {
      return {
        obligation_id: obligation.id,
        coverage_state: "COVERED",
        evidence_ids: matching.map((item) => item.id),
        verification_plan_required: "Yes",
        reason: "Task-specific evidence explicitly covers this Verification Plan obligation.",
      };
    }
    if (matching.some((item) => item.result_state === "WAIVED_BY_HUMAN_DECISION")) {
      return {
        obligation_id: obligation.id,
        coverage_state: "WAIVED_BY_HUMAN_DECISION",
        evidence_ids: matching.map((item) => item.id),
        verification_plan_required: "Yes",
        reason: "Coverage was waived by human decision and must remain visible.",
      };
    }
    if (matching.length > 0) {
      return {
        obligation_id: obligation.id,
        coverage_state: "PARTIAL",
        evidence_ids: matching.map((item) => item.id),
        verification_plan_required: "Yes",
        reason: "Evidence exists but is not passing task-bound coverage.",
      };
    }
    return {
      obligation_id: obligation.id,
      coverage_state: "NOT_COVERED",
      evidence_ids: [],
      verification_plan_required: "Yes",
      reason: "No explicit evidence item covers this required obligation.",
    };
  });
}

function testQualityControlsFor(planEvidence, evidenceItems, coverageMap) {
  const controls = [];
  const evidenceByObligation = new Map();
  for (const item of evidenceItems) {
    for (const obligation of item.covers_obligations || []) {
      const list = evidenceByObligation.get(obligation) || [];
      list.push(item.id);
      evidenceByObligation.set(obligation, list);
    }
  }
  const requiredObligations = planEvidence?.verification_obligations || [];
  for (const control of planEvidence?.test_correctness_controls || []) {
    const relatedObligationIds = requiredObligations
      .filter((obligation) => surfaceList(control.applies_to).includes(obligation.source_surface))
      .map((obligation) => obligation.id);
    const evidenceIds = [...new Set(relatedObligationIds.flatMap((id) => evidenceByObligation.get(id) || []))];
    const relevantCoverage = coverageMap.filter((item) => relatedObligationIds.includes(item.obligation_id));
    const allCovered = relevantCoverage.length > 0
      && relevantCoverage.every((item) => item.coverage_state === "COVERED" || item.coverage_state === "WAIVED_BY_HUMAN_DECISION");
    const notApplicable = relevantCoverage.length === 0 && control.required !== "Yes";
    controls.push({
      id: control.id,
      applies_to: control.applies_to,
      status: allCovered && evidenceIds.length > 0 ? "SATISFIED" : (notApplicable ? "NOT_APPLICABLE_WITH_REASON" : "NOT_SATISFIED"),
      evidence_ids: evidenceIds,
      reason: allCovered
        ? "Evidence is mapped to related Verification Plan obligations."
        : (notApplicable ? "Control is not required by this Verification Plan." : "Related Verification Plan obligations remain incomplete or unmapped."),
    });
  }
  if (!controls.some((item) => item.id === "control:broad-command-not-proof")) {
    controls.push({
      id: "control:broad-command-not-proof",
      applies_to: "TEST_COVERAGE",
      status: evidenceItems.some((item) => item.covers_obligations.length > 0) ? "SATISFIED" : "NOT_SATISFIED",
      evidence_ids: evidenceItems.map((item) => item.id),
      reason: "Broad commands must map to specific obligations.",
    });
  }
  return controls;
}

function manualVerificationFor(planEvidence, evidenceItems) {
  const manualPlan = planEvidence?.manual_verification || [];
  if (manualPlan.length === 0) {
    return [{
      id: "none",
      owner: "None",
      decision_ref: "not required",
      evidence_ref: "not required",
      status: "NOT_REQUIRED",
      reason: "No manual verification required by the Verification Plan.",
    }];
  }
  return manualPlan.map((item) => {
    const matching = evidenceItems.find((evidence) => evidence.covers_obligations.includes(item.id) || evidence.ref === item.decision_ref);
    return {
      id: item.id,
      owner: item.owner || "not recorded",
      decision_ref: item.decision_ref || "not recorded",
      evidence_ref: matching?.ref || "not recorded",
      status: matching ? "RECORDED" : "PENDING",
      reason: matching ? "Manual evidence is recorded." : "Manual evidence is pending.",
    };
  });
}

function knownGapsFor(requiredObligations, coverageMap) {
  const gaps = coverageMap
    .filter((item) => item.coverage_state !== "COVERED")
    .map((item) => ({
      id: `gap:${slugify(item.obligation_id)}`,
      severity: item.coverage_state === "NOT_COVERED" ? "BLOCKING" : "MEDIUM",
      reason: `${item.obligation_id} is ${item.coverage_state}.`,
      required_follow_up: "Attach task-bound evidence or record an explicit human decision.",
    }));
  if (requiredObligations.length === 0) {
    return [{
      id: "gap:missing-verification-plan",
      severity: "BLOCKING",
      reason: "No required Verification Plan obligations were available.",
      required_follow_up: "Create or resolve a Verification Plan before binding test evidence.",
    }];
  }
  if (gaps.length === 0) {
    return [{
      id: "none",
      severity: "NONE",
      reason: "No known gaps recorded.",
      required_follow_up: "Not required.",
    }];
  }
  return gaps;
}

function stateFor(requiredObligations, coverageMap, scenarioCoverageMap, universeBinding, evidenceItems, verificationPlan, runtimeTrustRequired, runtimeTrustBinding, controlBinding) {
  if (controlBinding?.requirement === "REQUIRED" && controlBinding.status !== "VERIFIED") return "TEST_EVIDENCE_BLOCKED";
  if (controlBinding?.requirement === "NOT_REQUIRED" && controlBinding.status !== "NOT_REQUIRED") return "TEST_EVIDENCE_BLOCKED";
  if (runtimeTrustRequired && runtimeTrustBinding?.status !== "VERIFIED") return "TEST_EVIDENCE_BLOCKED";
  if (!runtimeTrustRequired && runtimeTrustBinding?.status !== "NOT_REQUIRED") return "TEST_EVIDENCE_BLOCKED";
  if (!verificationPlan.ref || !verificationPlan.evidence) return "TEST_EVIDENCE_BLOCKED";
  if (requiredObligations.length === 0) return "TEST_EVIDENCE_BLOCKED";
  if (evidenceItems.length === 0) return "TEST_EVIDENCE_BLOCKED";
  if (universeBinding.required === "Unknown" || universeBinding.coverage_mapping_status === "BLOCKED") return "TEST_EVIDENCE_BLOCKED";
  if (universeBinding.required === "Yes" && (scenarioCoverageMap.length === 0
    || scenarioCoverageMap.some((item) => item.coverage_state !== "COVERED"))) return "TEST_EVIDENCE_PARTIAL";
  if (coverageMap.every((item) => item.coverage_state === "COVERED")) return "TEST_EVIDENCE_COMPLETE";
  if (coverageMap.every((item) => item.coverage_state === "COVERED" || item.coverage_state === "WAIVED_BY_HUMAN_DECISION")) {
    return "TEST_EVIDENCE_WAIVED_WITH_DECISION";
  }
  return "TEST_EVIDENCE_PARTIAL";
}

function testEvidenceControlBindingFor(binding) {
  if (!binding) return controlEffectivenessBinding({
    required: false,
    reason: "The referenced pre-1.110 Verification Plan predates Control Effectiveness routing; no control-backed completion claim is inferred.",
  });
  return JSON.parse(JSON.stringify(binding));
}

function existingProjectMappingFor(ref) {
  if (!ref) {
    return {
      status: "NOT_APPLICABLE",
      ref: "not provided",
      reason: "No existing-project mapping was provided for this Test Evidence Report.",
    };
  }
  return {
    status: "MAPPED_READ_ONLY",
    ref,
    reason: "Existing-project mapping is referenced read-only; this report does not migrate or overwrite project governance.",
  };
}

function summaryFor(state, requiredObligations, coverageMap, evidenceItems) {
  const covered = coverageMap.filter((item) => item.coverage_state === "COVERED").length;
  return `Test evidence state ${state}; ${covered}/${requiredObligations.length} required obligations covered by ${evidenceItems.length} evidence item(s).`;
}

function nextStepFor(state) {
  if (state === "TEST_EVIDENCE_COMPLETE") return "Proceed to execution closure or finish check with this report as evidence.";
  if (state === "TEST_EVIDENCE_WAIVED_WITH_DECISION") return "Review the human decisions before using this report for closure.";
  if (state === "TEST_EVIDENCE_PARTIAL") return "Attach missing task-bound evidence before claiming completion.";
  if (state === "TEST_EVIDENCE_NOT_APPLICABLE") return "Keep the not-applicable reason visible in closure.";
  return "Create a Verification Plan or attach explicit evidence inputs before claiming completion.";
}

function boundariesFor() {
  return {
    writes_target_files: "No",
    executes_tests: "No",
    fabricates_evidence: "No",
    authorizes_implementation: "No",
    approves_release_or_production: "No",
    proves_product_correctness: "No",
    proves_real_environment_behavior: "No",
  };
}

function exitCodeFor(metadata) {
  const raw = String(metadata.exit_code || metadata.exitcode || "").trim();
  if (!raw) return "not recorded";
  if (/^-?\d+$/.test(raw)) return Number(raw);
  return raw;
}

function surfaceList(value) {
  return String(value || "")
    .split(/\s*,\s*/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function humanReportText(report) {
  const evidence = report.structuredEvidence;
  return `# Test Evidence Report

## Human Summary

${report.humanSummary}

## User Request

- Request: ${report.intent}
- Task ref: \`${report.taskRef}\`

## Source Systems

| Source | Status | Ref | Outcome | Digest |
|---|---|---|---|---|
${evidence.source_systems.length > 0 ? evidence.source_systems.map((item) => `| \`${item.name}\` | \`${item.status}\` | \`${item.ref}\` | \`${item.source_outcome}\` | \`${item.digest}\` |`).join("\n") : "| `none` | `NOT_PROVIDED` | `not provided` | `not provided` | `not provided` |"}

## Test Evidence Identity

- Test evidence ref: \`${evidence.test_evidence_ref}\`
- Test evidence digest: \`${evidence.test_evidence_digest}\`
- Verification plan ref: \`${evidence.verification_plan_ref}\`
- Verification plan digest: \`${evidence.verification_plan_digest}\`
- Intent digest: \`${evidence.intent_digest}\`

## Verification Plan Binding

- Verification plan state: \`${evidence.verification_plan_state}\`
- Required obligations: \`${report.coverageMap.length}\`
- Covered obligations: \`${report.coverageMap.filter((item) => item.coverage_state === "COVERED").length}\`
- Missing obligations: \`${report.coverageMap.filter((item) => item.coverage_state !== "COVERED").length}\`

## Runtime Trust Binding

${runtimeBindingMarkdown(evidence.runtime_trust_binding)}

## Control Effectiveness Binding

- Requirement: \`${evidence.control_effectiveness_binding.requirement}\`
- Status: \`${evidence.control_effectiveness_binding.status}\`
- Report: \`${evidence.control_effectiveness_binding.report_ref}\`
- Report digest: \`${evidence.control_effectiveness_binding.report_digest}\`
- Required claims: ${evidence.control_effectiveness_binding.required_claim_ids.map((item) => `\`${item}\``).join(", ") || "N/A"}
- Assessment outcome: \`${evidence.control_effectiveness_binding.assessment_outcome}\`
- Reason: ${evidence.control_effectiveness_binding.reason}

## Business Universe Scenario Coverage

| Scenario ID | Required obligations | Covered obligations | Proof strength | Coverage state | Evidence IDs |
|---|---|---|---|---|---|
${evidence.scenario_coverage_map.length > 0 ? evidence.scenario_coverage_map.map((item) => `| \`${item.coverage_scenario_id}\` | ${item.required_obligation_ids.map((id) => `\`${id}\``).join(", ")} | ${item.covered_obligation_ids.map((id) => `\`${id}\``).join(", ") || "N/A"} | \`${item.required_proof_strength}\` | \`${item.coverage_state}\` | ${item.evidence_ids.map((id) => `\`${id}\``).join(", ") || "N/A"} |`).join("\n") : "| N/A | N/A | N/A | NOT_APPLICABLE | NOT_COVERED | N/A |"}

## Evidence Items

| ID | Type | Result State | Ref | Command | Owner | Environment | Exit Code | Ran After Change | Current Task Match | Covers Obligations | Output Digest | Failure Reason | Limitations |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
${evidence.evidence_items.length > 0 ? evidence.evidence_items.map((item) => `| \`${item.id}\` | \`${item.evidence_type}\` | \`${item.result_state}\` | \`${item.ref}\` | ${item.command} | ${item.owner} | ${item.environment} | \`${item.exit_code}\` | \`${item.ran_after_change}\` | \`${item.current_task_match}\` | ${item.covers_obligations.map((id) => `\`${id}\``).join(", ")} | \`${item.output_digest}\` | ${item.failure_reason} | ${item.limitations} |`).join("\n") : "| `none` | `COMMAND_OUTPUT` | `NOT_RUN_WITH_REASON` | `not provided` | not recorded | not recorded | not recorded | `not recorded` | `Unknown` | `Unknown` |  | `not provided` | not recorded | No evidence input was provided. |"}

## Coverage Map

| Obligation ID | Coverage State | Evidence IDs | Reason |
|---|---|---|---|
${evidence.coverage_map.length > 0 ? evidence.coverage_map.map((item) => `| \`${item.obligation_id}\` | \`${item.coverage_state}\` | ${item.evidence_ids.map((id) => `\`${id}\``).join(", ")} | ${item.reason} |`).join("\n") : "| `none` | `BLOCKED` |  | No Verification Plan obligations available. |"}

## Test Quality Controls

| ID | Applies To | Status | Evidence IDs | Reason |
|---|---|---|---|---|
${evidence.test_quality_controls.map((item) => `| \`${item.id}\` | \`${item.applies_to}\` | \`${item.status}\` | ${item.evidence_ids.map((id) => `\`${id}\``).join(", ")} | ${item.reason} |`).join("\n")}

## Known Gaps

| Gap ID | Severity | Reason | Required Follow-up |
|---|---|---|---|
${evidence.known_gaps.map((item) => `| \`${item.id}\` | \`${item.severity}\` | ${item.reason} | ${item.required_follow_up} |`).join("\n")}

## Manual Verification

| ID | Owner | Decision Ref | Evidence Ref | Status | Reason |
|---|---|---|---|---|---|
${evidence.manual_verification.map((item) => `| \`${item.id}\` | ${item.owner} | \`${item.decision_ref}\` | \`${item.evidence_ref}\` | \`${item.status}\` | ${item.reason} |`).join("\n")}

## Existing Project Mapping

- Status: \`${evidence.existing_project_mapping.status}\`
- Ref: \`${evidence.existing_project_mapping.ref}\`
- Reason: ${evidence.existing_project_mapping.reason}

## Boundaries

- This report writes target files: ${evidence.boundaries.writes_target_files}
- This report executes tests: ${evidence.boundaries.executes_tests}
- This report fabricates evidence: ${evidence.boundaries.fabricates_evidence}
- This report authorizes implementation: ${evidence.boundaries.authorizes_implementation}
- This report approves release or production: ${evidence.boundaries.approves_release_or_production}
- This report proves product correctness: ${evidence.boundaries.proves_product_correctness}
- This report proves real-environment behavior: ${evidence.boundaries.proves_real_environment_behavior}

## Machine-Readable Evidence

\`\`\`json
${JSON.stringify(evidence, null, 2)}
\`\`\`

## Outcome

\`${evidence.test_evidence_state}\`

## Next Step

${evidence.next_step}
`;
}

function normalizeArtifactRef(ref) {
  const match = String(ref || "").trim().match(/^artifact:(.+)$/i);
  if (!match) return "";
  const relative = match[1].trim();
  if (!relative || path.isAbsolute(relative)) return "";
  return relative;
}

function resolveEvidenceFile(root, relativeOrRef) {
  const normalized = normalizeArtifactRef(relativeOrRef) || String(relativeOrRef || "").trim();
  const ref = /^artifact:/i.test(String(relativeOrRef || "")) ? relativeOrRef : `artifact:${normalized}`;
  const resolved = resolveAuthoritativeEvidenceReference(root, "", ref);
  return resolved.ok ? resolved.file : "";
}

function artifactRefFromPath(root, fileOrRelative) {
  if (!fileOrRelative) return "not provided";
  const absolute = path.isAbsolute(fileOrRelative) ? fileOrRelative : path.resolve(root, fileOrRelative);
  const relative = path.relative(root, absolute).split(path.sep).join("/");
  if (relative.startsWith("..") || path.isAbsolute(relative)) return "not provided";
  return `artifact:${relative}`;
}

function testEvidenceRefForOutput(root, out, slug) {
  if (out) {
    const relative = path.relative(root, out).split(path.sep).join("/");
    return `artifact:${relative}`;
  }
  return `artifact:test-evidence-reports/001-${slug}.md`;
}

function resolveOutputPath(root, value) {
  const relative = String(value || "").trim();
  if (!relative || path.isAbsolute(relative)) {
    console.error("FAIL --out must be a relative path inside the project.");
    process.exit(1);
  }
  const resolved = path.resolve(root, relative);
  const boundary = path.relative(root, resolved);
  if (boundary.startsWith("..") || path.isAbsolute(boundary)) {
    console.error("FAIL --out must stay inside the project.");
    process.exit(1);
  }
  return resolved;
}

function writeOutputIfRequested(output) {
  if (!outputPath) return;
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, output);
}

function splitList(value) {
  return String(value || "")
    .split(/\s*,\s*/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function fileDigest(file) {
  return `sha256:${crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex")}`;
}

function digest(text) {
  return `sha256:${crypto.createHash("sha256").update(String(text || "")).digest("hex")}`;
}

function slugify(value) {
  const slug = String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return slug || "test-evidence";
}
