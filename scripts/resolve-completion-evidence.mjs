#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { evidenceDigest, extractMachineReadableEvidence } from "./lib/artifact-schema.mjs";
import { createEvidenceAuthorityBinding } from "./lib/evidence-authority.mjs";
import {
  resolveRuntimeTrustBinding,
  runtimeBindingMarkdown,
  runtimeTrustBindingsAgree,
} from "./lib/verification-runtime-consumer.mjs";
import { controlEffectivenessBinding } from "./lib/control-effectiveness.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set([
  "json",
  "format",
  "intent",
  "task",
  "business-rule-ref",
  "verification-plan-ref",
  "test-evidence-ref",
  "execution-assurance-ref",
  "runtime-manifest-ref",
  "out",
]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputFormat = args.json ? "json" : String(args.format || "human");
const intent = String(args.intent || args._.slice(1).join(" ") || "verify task completion").trim();
const explicitTask = String(args.task || "").trim();
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
  const sources = [
    sourceFor(root, "business_rule_closure", args["business-rule-ref"], {
      stateField: "state",
      digestField: "closure_digest",
      readyStates: ["READY_FOR_IMPACT_COVERAGE"],
    }),
    sourceFor(root, "verification_plan", args["verification-plan-ref"], {
      stateField: "verification_state",
      digestField: "verification_plan_digest",
      readyStates: ["VERIFICATION_PLAN_READY"],
    }),
    sourceFor(root, "test_evidence", args["test-evidence-ref"], {
      stateField: "test_evidence_state",
      digestField: "test_evidence_digest",
      readyStates: ["TEST_EVIDENCE_COMPLETE"],
    }),
    sourceFor(root, "execution_assurance", args["execution-assurance-ref"], {
      stateField: "assurance_state",
      digestField: "",
      readyStates: ["VERIFIED_DONE"],
      extraReady: (evidence) => evidence?.can_claim_done === "Yes",
    }),
  ];
  const taskRef = explicitTask || firstTaskRef(sources) || `tasks/001-${slugify(intent)}.md`;
  const verificationPlan = sources.find((source) => source.name === "verification_plan");
  const runtimeTrustRequired = Boolean(args["runtime-manifest-ref"])
    || runtimeTrustRequiredFor(sources);
  const runtimeTrust = resolveRuntimeTrustBinding(root, {
    required: runtimeTrustRequired,
    notRequiredReason: "The current Test Evidence and Execution Assurance do not require runtime-trusted behavior proof.",
    manifestRef: String(args["runtime-manifest-ref"] || ""),
    taskRef,
    intentDigest: digest(intent),
    verificationPlanRef: verificationPlan?.ref,
    verificationPlanDigest: verificationPlan?.digest,
  });
  const businessUniverse = businessUniverseCompletionFor(sources);
  const controlEffectiveness = controlEffectivenessCompletionFor(sources);
  const completionEvidenceRef = completionEvidenceRefForOutput(root, outputPath, slugify(intent));
  const checks = buildChecks(sources, taskRef, digest(intent), runtimeTrust, businessUniverse, controlEffectiveness);
  const state = stateFor(checks);
  const canClaimComplete = state === "COMPLETION_EVIDENCE_READY" ? "Yes" : "No";
  const base = {
    schema_version: "1.110.0",
    artifact_type: "completion_evidence_gate",
    task_ref: taskRef,
    intent,
    intent_digest: digest(intent),
    completion_evidence_ref: completionEvidenceRef,
    completion_gate_digest: "",
    completion_state: state,
    can_claim_complete: canClaimComplete,
    source_chain: sources.map((source) => ({
      name: source.name,
      status: source.status,
      ref: source.ref || "not provided",
      task_ref: source.taskRef || "not provided",
      intent_digest: source.intentDigest || "not provided",
      source_outcome: source.outcome || "not provided",
      digest: source.digest || "not provided",
      ready: source.ready,
      reason: source.reason,
    })),
    runtime_trust_binding: runtimeTrust.binding,
    business_universe_binding: businessUniverse.binding,
    control_effectiveness_binding: controlEffectiveness.binding,
    scenario_completion_map: businessUniverse.scenarios,
    gate_checks: checks,
    task_consistency: taskConsistencyFor(sources, taskRef),
    missing_or_blocking_items: checks
      .filter((check) => check.status !== "PASS")
      .map((check) => `${check.id}: ${check.reason}`),
    boundary: boundariesFor(),
    next_step: nextStepFor(state),
  };
  const structuredEvidence = {
    ...base,
    authority_binding: createEvidenceAuthorityBinding(root, {
      fromFile: outputPath,
      taskRef,
      intentDigest: base.intent_digest,
      sourceRefs: [
        ...sources.filter((source) => source.status === "RECORDED").map((source) => source.ref),
        runtimeTrust.binding.run_manifest_ref,
        ...(/^(artifact|file):/.test(businessUniverse.binding.business_universe_ref)
          ? [businessUniverse.binding.business_universe_ref]
          : []),
        ...(/^(artifact|file):/.test(controlEffectiveness.binding.report_ref)
          ? [controlEffectiveness.binding.report_ref]
          : []),
      ],
    }),
    completion_gate_digest: evidenceDigest(base, ["completion_gate_digest"]),
  };
  structuredEvidence.completion_gate_digest = evidenceDigest(structuredEvidence, ["completion_gate_digest"]);
  return {
    reportType: "COMPLETION_EVIDENCE_GATE",
    schemaVersion: "1.110.0",
    generatedBy: "scripts/resolve-completion-evidence.mjs",
    generatedAt: new Date().toISOString(),
    projectRoot: root,
    readOnly: true,
    humanSummary: {
      completionState: state,
      canClaimComplete,
      safeNextStep: nextStepFor(state),
    },
    intent,
    taskRef,
    sourceChain: structuredEvidence.source_chain,
    gateChecks: checks,
    taskConsistency: structuredEvidence.task_consistency,
    missingOrBlockingItems: structuredEvidence.missing_or_blocking_items,
    boundary: structuredEvidence.boundary,
    structuredEvidence,
    outcome: state,
  };
}

function sourceFor(root, name, refValue, options) {
  const ref = String(refValue || "").trim();
  if (!ref) {
    return {
      name,
      status: "NOT_PROVIDED",
      ref: "",
      taskRef: "",
      outcome: "",
      digest: "",
      ready: "No",
      reason: "Required source reference was not provided.",
    };
  }
  const resolved = resolveArtifact(root, ref);
  if (!resolved) {
    return {
      name,
      status: "UNRESOLVED",
      ref,
      taskRef: "",
      outcome: "",
      digest: "",
      ready: "No",
      reason: "Source reference did not resolve to a local artifact.",
    };
  }
  const content = fs.readFileSync(resolved, "utf8");
  const extracted = extractMachineReadableEvidence(content);
  if (!extracted?.ok) {
    return {
      name,
      status: "INVALID",
      ref,
      taskRef: "",
      outcome: "",
      digest: fileDigest(resolved),
      ready: "No",
      reason: "Source artifact has missing or invalid Machine-Readable Evidence.",
    };
  }
  const evidence = extracted.value;
  const outcome = String(evidence?.[options.stateField] || evidence?.outcome || "UNKNOWN");
  const readyState = options.readyStates.includes(outcome);
  const extraReady = options.extraReady ? options.extraReady(evidence) : true;
  return {
    name,
    status: "RECORDED",
    ref,
    file: resolved,
    evidence,
    taskRef: String(evidence?.task_ref || ""),
    intentDigest: String(evidence?.intent_digest || evidence?.source_request_digest || ""),
    outcome,
    digest: options.digestField ? String(evidence?.[options.digestField] || "") : fileDigest(resolved),
    ready: readyState && extraReady ? "Yes" : "No",
    reason: readyState && extraReady
      ? "Source artifact is recorded and in a completion-ready state."
      : `Source artifact state ${outcome || "<missing>"} is not completion-ready.`,
  };
}

function buildChecks(sources, taskRef, intentDigest, runtimeTrust, businessUniverse, controlEffectiveness) {
  const required = [
    ["business_rule_closure", "Business Rule Closure is READY_FOR_IMPACT_COVERAGE."],
    ["verification_plan", "Verification Plan is VERIFICATION_PLAN_READY."],
    ["test_evidence", "Test Evidence is TEST_EVIDENCE_COMPLETE."],
    ["execution_assurance", "Execution Assurance is VERIFIED_DONE and can_claim_done is Yes."],
  ];
  const checks = required.map(([name, label]) => {
    const source = sources.find((item) => item.name === name);
    const pass = source?.status === "RECORDED" && source.ready === "Yes";
    return {
      id: `check:${name}`,
      status: pass ? "PASS" : "FAIL",
      source: name,
      expected: label,
      actual: source?.outcome || source?.status || "NOT_PROVIDED",
      reason: pass ? "Required source is ready." : source?.reason || "Required source is missing.",
    };
  });
  checks.push({
    id: "check:runtime-trust",
    status: runtimeTrust.ok ? "PASS" : "FAIL",
    source: "verification_run_manifest",
    expected: runtimeTrust.binding.requirement === "REQUIRED"
      ? "The exact current-task Verification Run Manifest passes Runtime Trust authority checks."
      : "Runtime Trust is explicitly not required by the current verification obligations.",
    actual: runtimeTrust.binding.status,
    reason: runtimeTrust.binding.reason,
  });
  const universeReady = (businessUniverse.binding.required === "No"
      && businessUniverse.binding.routing_result === "NOT_REQUIRED_WITH_REASON"
      && businessUniverse.scenarios.length === 0)
    || (businessUniverse.binding.required === "Yes"
      && businessUniverse.binding.business_universe_state === "COVERAGE_READY"
      && businessUniverse.binding.coverage_mapping_status === "COMPLETE"
      && businessUniverse.scenarios.length > 0
      && businessUniverse.scenarios.every((item) => item.completion_state === "COMPLETE"));
  checks.push({
    id: "check:business-universe",
    status: universeReady ? "PASS" : "FAIL",
    source: "business_universe_coverage",
    expected: "Every required Business Universe scenario remains bound through Test Evidence and Execution Assurance.",
    actual: universeReady ? "COMPLETE" : businessUniverse.binding.coverage_mapping_status,
    reason: universeReady
      ? "Business Universe is not required or every required scenario has exact completion evidence."
      : "Business Universe routing or scenario evidence is unresolved, incomplete, stale, or inconsistent.",
  });
  checks.push({
    id: "check:control-effectiveness",
    status: controlEffectiveness.ok ? "PASS" : "FAIL",
    source: "control_effectiveness",
    expected: controlEffectiveness.binding.requirement === "REQUIRED"
      ? "Verification Plan, Test Evidence, and Execution Assurance bind the same current effective control proof."
      : "Control Effectiveness is explicitly not required by every current-task consumer.",
    actual: controlEffectiveness.binding.status,
    reason: controlEffectiveness.reason,
  });
  const testEvidence = sources.find((item) => item.name === "test_evidence")?.evidence;
  const executionAssurance = sources.find((item) => item.name === "execution_assurance")?.evidence;
  const agreement = runtimeTrustBindingsAgree([
    runtimeTrust.binding,
    testEvidence?.runtime_trust_binding,
    executionAssurance?.runtime_trust_binding,
  ]);
  const completeConsumerSet = Boolean(testEvidence?.runtime_trust_binding && executionAssurance?.runtime_trust_binding);
  checks.push({
    id: "check:runtime-consumer-agreement",
    status: runtimeTrust.ok && completeConsumerSet && agreement.ok ? "PASS" : "FAIL",
    source: "runtime_trust_consumers",
    expected: "Test Evidence, Execution Assurance, and Completion Evidence bind the same current run.",
    actual: completeConsumerSet && agreement.ok ? "AGREED" : "MISMATCHED_OR_MISSING",
    reason: !completeConsumerSet
      ? "Test Evidence and Execution Assurance must both carry Runtime Trust bindings."
      : agreement.ok ? "All completion consumers bind the same Runtime Trust run." : agreement.errors.join("; "),
  });
  const consistency = taskConsistencyFor(sources, taskRef);
  checks.push({
    id: "check:task-consistency",
    status: consistency.all_sources_same_task === "Yes" ? "PASS" : "FAIL",
    source: "source_chain",
    expected: "All recorded source artifacts bind to the current task.",
    actual: consistency.all_sources_same_task,
    reason: consistency.reason,
  });
  const sourceDigestConsistency = sourceDigestConsistencyFor(sources);
  checks.push({
    id: "check:source-digest-consistency",
    status: sourceDigestConsistency.all_source_digests_recorded === "Yes" ? "PASS" : "FAIL",
    source: "source_chain",
    expected: "All recorded source artifacts include a source identity digest.",
    actual: sourceDigestConsistency.all_source_digests_recorded,
    reason: sourceDigestConsistency.reason,
  });
  const intentConsistency = sourceIntentConsistencyFor(sources, intentDigest);
  checks.push({
    id: "check:intent-consistency",
    status: intentConsistency.all_recorded_sources_have_intent === "Yes" ? "PASS" : "FAIL",
    source: "source_chain",
    expected: "Recorded source artifacts expose current intent digest when available.",
    actual: intentConsistency.all_recorded_sources_have_intent,
    reason: intentConsistency.reason,
  });
  const sourceChainBinding = sourceChainBindingFor(sources);
  checks.push({
    id: "check:source-chain-binding",
    status: sourceChainBinding.all_source_bindings_match === "Yes" ? "PASS" : "FAIL",
    source: "source_chain",
    expected: "BRC -> Verification Plan -> Test Evidence -> Execution Assurance refs and digests match.",
    actual: sourceChainBinding.all_source_bindings_match,
    reason: sourceChainBinding.reason,
  });
  return checks;
}

function controlEffectivenessCompletionFor(sources) {
  const byName = new Map(sources.map((item) => [item.name, item.evidence]));
  const verificationPlan = byName.get("verification_plan");
  const verificationBinding = verificationPlan?.control_effectiveness_binding;
  const testBinding = byName.get("test_evidence")?.control_effectiveness_binding;
  const executionBinding = byName.get("execution_assurance")?.control_effectiveness_binding;
  const legacyProjection = !verificationBinding
    && verificationPlan?.schema_version !== "1.110.0"
    && testBinding?.requirement === "NOT_REQUIRED"
    && testBinding?.status === "NOT_REQUIRED"
    && JSON.stringify(testBinding) === JSON.stringify(executionBinding);
  if (legacyProjection) {
    return {
      binding: JSON.parse(JSON.stringify(testBinding)),
      ok: true,
      reason: "A trusted pre-1.110 Verification Plan is projected through matching non-required current consumers without fabricating control proof.",
    };
  }
  const bindings = [verificationBinding, testBinding, executionBinding];
  const fallback = controlEffectivenessBinding({
    required: true,
    reason: "One or more completion consumers do not carry a Control Effectiveness decision.",
  });
  if (bindings.some((item) => !item)) return { binding: fallback, ok: false, reason: fallback.reason };
  const first = bindings[0];
  const exact = bindings.every((item) => JSON.stringify(item) === JSON.stringify(first));
  if (!exact) {
    const binding = { ...fallback, reason: "Completion consumers disagree on the exact Control Effectiveness report, digest, claims, or state." };
    return { binding, ok: false, reason: binding.reason };
  }
  const ready = (first.requirement === "REQUIRED" && first.status === "VERIFIED")
    || (first.requirement === "NOT_REQUIRED" && first.status === "NOT_REQUIRED");
  return {
    binding: JSON.parse(JSON.stringify(first)),
    ok: ready,
    reason: ready
      ? "Every completion consumer preserves the same bounded Control Effectiveness decision."
      : "The exact Control Effectiveness decision remains blocked.",
  };
}

function runtimeTrustRequiredFor(sources) {
  const consumers = [
    sources.find((source) => source.name === "test_evidence")?.evidence,
    sources.find((source) => source.name === "execution_assurance")?.evidence,
  ].filter(Boolean);
  return consumers.some((evidence) => evidence.runtime_trust_binding?.requirement === "REQUIRED"
    || (evidence.scenario_coverage_map || evidence.scenario_assurance_map || [])
      .some((item) => item.required_proof_strength === "RUNTIME_TRUSTED_BEHAVIOR_PROOF"));
}

function businessUniverseCompletionFor(sources) {
  const fallback = {
    required: "Unknown",
    routing_result: "TECHNICAL_INSPECTION_REQUIRED",
    business_universe_ref: "N/A",
    business_universe_digest: "N/A",
    business_universe_state: "TECHNICAL_INSPECTION_REQUIRED",
    coverage_scenario_ids: [],
    coverage_mapping_status: "BLOCKED",
  };
  const byName = new Map(sources.map((item) => [item.name, item]));
  const brc = byName.get("business_rule_closure")?.evidence;
  const verificationPlan = byName.get("verification_plan")?.evidence;
  const testEvidence = byName.get("test_evidence")?.evidence;
  const executionAssurance = byName.get("execution_assurance")?.evidence;
  const sourceBinding = brc?.business_universe_binding;
  if (!sourceBinding) {
    const legacyUpstream = brc?.schema_version === "1.75.0"
      && verificationPlan?.schema_version === "1.76.0";
    const downstreamBindings = [
      testEvidence?.business_universe_binding,
      executionAssurance?.business_universe_binding,
    ];
    if (legacyUpstream && downstreamBindings.every(isBoundedNotRequiredUniverseBinding)) {
      return {
        binding: compactBusinessUniverseBinding(testEvidence.business_universe_binding),
        scenarios: [],
      };
    }
    return { binding: fallback, scenarios: [] };
  }
  const binding = compactBusinessUniverseBinding(sourceBinding);
  const downstreamBindings = [
    verificationPlan?.business_universe_binding,
    testEvidence?.business_universe_binding,
    executionAssurance?.business_universe_binding,
  ];
  const bindingsAgree = downstreamBindings.every((item) => businessUniverseBindingsAgree(binding, item));
  if (binding.required === "No") {
    return {
      binding: {
        ...binding,
        coverage_mapping_status: bindingsAgree ? "NOT_REQUIRED" : "BLOCKED",
      },
      scenarios: [],
    };
  }
  if (binding.required !== "Yes") return { binding: { ...binding, coverage_mapping_status: "BLOCKED" }, scenarios: [] };

  const testRows = new Map((testEvidence?.scenario_coverage_map || []).map((item) => [item.coverage_scenario_id, item]));
  const assuranceRows = new Map((executionAssurance?.scenario_assurance_map || []).map((item) => [item.coverage_scenario_id, item]));
  const scenarios = (binding.coverage_scenario_ids || []).map((scenarioId) => {
    const testRow = testRows.get(scenarioId);
    const assurance = assuranceRows.get(scenarioId);
    const exact = testRow && assurance
      && sameStringSet(testRow.required_obligation_ids, assurance.required_obligation_ids)
      && sameStringSet(testRow.covered_obligation_ids, assurance.covered_obligation_ids)
      && sameStringSet(testRow.evidence_ids, assurance.test_evidence_ids)
      && testRow.required_proof_strength === assurance.required_proof_strength
      && testRow.coverage_state === assurance.test_evidence_state;
    const completionState = !exact
      ? "BLOCKED_SOURCE_MISMATCH"
      : testRow.coverage_state !== "COVERED" || (testRow.evidence_ids || []).length === 0
        ? "BLOCKED_TEST_EVIDENCE"
        : assurance.assurance_state !== "ASSURED"
          ? "BLOCKED_EXECUTION_ASSURANCE"
          : "COMPLETE";
    return {
      coverage_scenario_id: scenarioId,
      verification_obligation_ids: testRow?.required_obligation_ids || [],
      test_evidence_ids: testRow?.evidence_ids || [],
      required_proof_strength: testRow?.required_proof_strength || "STRUCTURAL_SOURCE_PROOF",
      test_evidence_state: testRow?.coverage_state || "NOT_COVERED",
      execution_assurance_state: assurance?.assurance_state || "BLOCKED_SOURCE_MISMATCH",
      completion_state: completionState,
    };
  });
  const exactScenarioSets = sameStringSet([...testRows.keys()], binding.coverage_scenario_ids)
    && sameStringSet([...assuranceRows.keys()], binding.coverage_scenario_ids);
  return {
    binding: {
      ...binding,
      coverage_mapping_status: bindingsAgree
        && exactScenarioSets
        && binding.business_universe_state === "COVERAGE_READY"
        && scenarios.every((item) => item.completion_state === "COMPLETE")
        ? "COMPLETE"
        : "BLOCKED",
    },
    scenarios,
  };
}

function compactBusinessUniverseBinding(binding) {
  return {
    required: binding.required || "Unknown",
    routing_result: binding.routing_result || "TECHNICAL_INSPECTION_REQUIRED",
    business_universe_ref: binding.business_universe_ref || "N/A",
    business_universe_digest: binding.business_universe_digest || "N/A",
    business_universe_state: binding.business_universe_state || "TECHNICAL_INSPECTION_REQUIRED",
    coverage_scenario_ids: [...(binding.coverage_scenario_ids || [])],
    coverage_mapping_status: binding.coverage_mapping_status || "BLOCKED",
  };
}

function businessUniverseBindingsAgree(expected, actual) {
  if (!actual) return false;
  return expected.required === actual.required
    && expected.routing_result === actual.routing_result
    && normalizeRef(expected.business_universe_ref) === normalizeRef(actual.business_universe_ref)
    && expected.business_universe_digest === actual.business_universe_digest
    && expected.business_universe_state === actual.business_universe_state
    && sameStringSet(expected.coverage_scenario_ids, actual.coverage_scenario_ids);
}

function isBoundedNotRequiredUniverseBinding(binding) {
  return binding?.required === "No"
    && binding.routing_result === "NOT_REQUIRED_WITH_REASON"
    && binding.business_universe_ref === "N/A"
    && binding.business_universe_digest === "N/A"
    && binding.business_universe_state === "NOT_REQUIRED_WITH_REASON"
    && binding.coverage_mapping_status === "NOT_REQUIRED"
    && (binding.coverage_scenario_ids || []).length === 0;
}

function sameStringSet(left, right) {
  const a = [...new Set((left || []).map(String))].sort();
  const b = [...new Set((right || []).map(String))].sort();
  return a.length === b.length && a.every((item, index) => item === b[index]);
}

function taskConsistencyFor(sources, taskRef) {
  const recorded = sources.filter((item) => item.status === "RECORDED");
  const mismatched = recorded.filter((item) => item.taskRef !== taskRef);
  return {
    expected_task_ref: taskRef,
    recorded_task_refs: recorded.map((item) => `${item.name}:${item.taskRef || "not provided"}`),
    all_sources_same_task: recorded.length > 0 && mismatched.length === 0 ? "Yes" : "No",
    reason: recorded.length === 0
      ? "No recorded source artifacts were available."
      : mismatched.length === 0
        ? "All recorded source artifacts reference the same task."
        : `Mismatched task refs: ${mismatched.map((item) => `${item.name}=${item.taskRef || "not provided"}`).join(", ")}`,
  };
}

function sourceDigestConsistencyFor(sources) {
  const recorded = sources.filter((item) => item.status === "RECORDED");
  const mismatched = recorded.filter((item) => item.digest !== expectedDigestForSource(item));
  return {
    all_source_digests_recorded: recorded.length > 0 && mismatched.length === 0 ? "Yes" : "No",
    reason: recorded.length === 0
      ? "No recorded source artifacts were available."
      : mismatched.length === 0
        ? "All recorded source artifact digests match referenced evidence."
        : `Mismatched source digests: ${mismatched.map((item) => `${item.name}=${item.digest || "not provided"}`).join(", ")}`,
  };
}

function sourceIntentConsistencyFor(sources, intentDigest) {
  const recorded = sources.filter((item) => item.status === "RECORDED");
  const mismatched = recorded.filter((item) => item.intentDigest !== intentDigest);
  return {
    all_recorded_sources_have_intent: recorded.length > 0 && mismatched.length === 0 ? "Yes" : "No",
    reason: recorded.length === 0
      ? "No recorded source artifacts with intent digest were available."
      : mismatched.length === 0
        ? "Business Rule Closure, Verification Plan, Test Evidence, and Execution Assurance match the completion intent digest."
        : `Mismatched source intent digests: ${mismatched.map((item) => `${item.name}=${item.intentDigest || "not provided"}`).join(", ")}`,
  };
}

function sourceChainBindingFor(sources) {
  const byName = new Map(sources.map((item) => [item.name, item]));
  const brc = byName.get("business_rule_closure");
  const vp = byName.get("verification_plan");
  const te = byName.get("test_evidence");
  const ea = byName.get("execution_assurance");
  if ([brc, vp, te, ea].some((item) => item?.status !== "RECORDED")) {
    return {
      all_source_bindings_match: "No",
      reason: "All four source artifacts must be recorded before source-chain binding can pass.",
    };
  }
  const failures = [];
  if (!sameRef(vp.evidence?.business_rule_ref, brc.ref)) failures.push("Verification Plan business_rule_ref does not match Completion Evidence BRC ref");
  if (vp.evidence?.business_rule_digest !== brc.evidence?.business_rule_digest) failures.push("Verification Plan business_rule_digest does not match referenced BRC");
  if (!sourceSystemsContains(vp.evidence?.source_systems, "business_rule_closure", brc.ref, brc.evidence?.business_rule_digest, brc.outcome)) failures.push("Verification Plan source_systems does not bind BRC ref/digest/outcome");
  if (!sameRef(te.evidence?.verification_plan_ref, vp.ref)) failures.push("Test Evidence verification_plan_ref does not match Completion Evidence Verification Plan ref");
  if (te.evidence?.verification_plan_digest !== vp.digest) failures.push("Test Evidence verification_plan_digest does not match referenced Verification Plan");
  if (!sourceSystemsContains(te.evidence?.source_systems, "verification_plan", vp.ref, vp.digest, vp.outcome)) failures.push("Test Evidence source_systems does not bind Verification Plan ref/digest/outcome");
  if (!executionAssuranceContainsTestEvidence(ea.evidence, te)) failures.push("Execution Assurance does not bind the referenced Test Evidence");
  return {
    all_source_bindings_match: failures.length === 0 ? "Yes" : "No",
    reason: failures.length === 0 ? "BRC, Verification Plan, Test Evidence, and Execution Assurance form one bound source chain." : failures.join("; "),
  };
}

function expectedDigestForSource(source) {
  if (source.name === "business_rule_closure") return source.evidence?.closure_digest || "";
  if (source.name === "verification_plan") return source.evidence?.verification_plan_digest || "";
  if (source.name === "test_evidence") return source.evidence?.test_evidence_digest || "";
  if (source.name === "execution_assurance") return source.evidence?.report_digest || fileDigest(source.file || "");
  return "";
}

function sourceSystemsContains(items, name, ref, digestValue, outcome) {
  return (items || []).some((item) => item.name === name
    && sameRef(item.ref || item.source_system_ref, ref)
    && item.digest === digestValue
    && item.source_outcome === outcome);
}

function executionAssuranceContainsTestEvidence(evidence, testEvidenceSource) {
  const sourceMatch = (evidence?.source_systems || []).some((item) => item.name === "test_evidence"
    && sameRef(item.source_system_ref || item.ref, testEvidenceSource.ref)
    && item.source_task_ref === testEvidenceSource.taskRef
    && item.source_outcome === testEvidenceSource.outcome);
  if (sourceMatch) return true;
  return collectEvidenceRefs(evidence).some((ref) => sameRef(ref, testEvidenceSource.ref));
}

function collectEvidenceRefs(value) {
  const refs = [];
  visit(value);
  return refs;

  function visit(item) {
    if (Array.isArray(item)) {
      item.forEach(visit);
      return;
    }
    if (!item || typeof item !== "object") return;
    for (const [key, child] of Object.entries(item)) {
      if (key === "evidence_ref" || key === "source_system_ref" || key === "ref") refs.push(String(child || ""));
      if (key === "evidence_refs" && Array.isArray(child)) refs.push(...child.map((ref) => String(ref || "")));
      visit(child);
    }
  }
}

function sameRef(left, right) {
  return normalizeRef(left) === normalizeRef(right);
}

function normalizeRef(value) {
  return String(value || "").trim().replace(/^(artifact|file):/, "");
}

function stateFor(checks) {
  if (checks.every((check) => check.status === "PASS")) return "COMPLETION_EVIDENCE_READY";
  if (checks.some((check) => check.id === "check:business-universe" && check.status !== "PASS")) return "BLOCKED_BY_BUSINESS_UNIVERSE";
  if (checks.some((check) => check.id.startsWith("check:runtime-") && check.status !== "PASS")) return "BLOCKED_BY_RUNTIME_TRUST";
  if (checks.some((check) => check.id === "check:task-consistency" && check.status !== "PASS")) return "BLOCKED_BY_TASK_MISMATCH";
  if (checks.some((check) => check.id === "check:intent-consistency" && check.status !== "PASS")) return "BLOCKED_BY_TASK_MISMATCH";
  if (checks.some((check) => check.id === "check:source-digest-consistency" && check.status !== "PASS")) return "BLOCKED_BY_MISSING_SOURCE";
  if (checks.some((check) => check.id === "check:source-chain-binding" && check.status !== "PASS")) return "BLOCKED_BY_MISSING_SOURCE";
  if (checks.some((check) => check.id === "check:test_evidence" && check.status !== "PASS")) return "BLOCKED_BY_TEST_EVIDENCE";
  if (checks.some((check) => check.id === "check:execution_assurance" && check.status !== "PASS")) return "BLOCKED_BY_EXECUTION_ASSURANCE";
  return "BLOCKED_BY_MISSING_SOURCE";
}

function firstTaskRef(sources) {
  return sources.find((source) => source.taskRef)?.taskRef || "";
}

function nextStepFor(state) {
  const map = {
    COMPLETION_EVIDENCE_READY: "Prepare a final response with evidence summary; do not claim release or production approval.",
    BLOCKED_BY_TEST_EVIDENCE: "Fix or record Test Evidence before claiming completion.",
    BLOCKED_BY_EXECUTION_ASSURANCE: "Create a VERIFIED_DONE Execution Assurance report before claiming completion.",
    BLOCKED_BY_TASK_MISMATCH: "Regenerate stale or reused source artifacts for the current task.",
    BLOCKED_BY_MISSING_SOURCE: "Attach the missing BRC, Verification Plan, Test Evidence, and Execution Assurance artifacts.",
    BLOCKED_BY_RUNTIME_TRUST: "Regenerate the current-task verification run and all completion consumers from the same Runtime Trust manifest.",
    BLOCKED_BY_BUSINESS_UNIVERSE: "Complete every required business scenario and regenerate the bound verification evidence before claiming completion.",
  };
  return map[state] || "Resolve missing completion evidence.";
}

function boundariesFor() {
  return {
    writes_target_files: "No",
    runs_tests: "No",
    fabricates_evidence: "No",
    authorizes_implementation: "No",
    approves_commit_or_push: "No",
    approves_release_or_production: "No",
    proves_product_correctness: "No",
    proves_real_environment_behavior: "No",
    replaces_source_systems: "No",
  };
}

function humanReportText(report) {
  const evidence = report.structuredEvidence;
  return `# Completion Evidence Gate Report

This report is a read-only completion gate. It does not run tests, write target files, approve commits, or approve release.

## Human Summary

| Field | Value |
|---|---|
| Completion State | \`${evidence.completion_state}\` |
| Can Claim Complete | \`${evidence.can_claim_complete}\` |
| Safe Next Step | ${evidence.next_step} |

## User Request

- Request: ${report.intent}
- Task ref: \`${report.taskRef}\`

## Completion Evidence Gate

| Check | Status | Source | Expected | Actual | Reason |
|---|---|---|---|---|---|
${evidence.gate_checks.map((check) => `| \`${check.id}\` | \`${check.status}\` | \`${check.source}\` | ${check.expected} | \`${check.actual}\` | ${check.reason} |`).join("\n")}

## Source Chain

| Source | Status | Ref | Task Ref | Intent Digest | Outcome | Ready | Digest | Reason |
|---|---|---|---|---|---|---|---|---|
${evidence.source_chain.map((source) => `| \`${source.name}\` | \`${source.status}\` | \`${source.ref}\` | \`${source.task_ref}\` | \`${source.intent_digest || "not provided"}\` | \`${source.source_outcome}\` | \`${source.ready}\` | \`${source.digest}\` | ${source.reason} |`).join("\n")}

## Runtime Trust Binding

${runtimeBindingMarkdown(evidence.runtime_trust_binding)}

## Control Effectiveness Completion

- Requirement: \`${evidence.control_effectiveness_binding.requirement}\`
- Status: \`${evidence.control_effectiveness_binding.status}\`
- Report: \`${evidence.control_effectiveness_binding.report_ref}\`
- Report digest: \`${evidence.control_effectiveness_binding.report_digest}\`
- Required claims: ${evidence.control_effectiveness_binding.required_claim_ids.map((item) => `\`${item}\``).join(", ") || "N/A"}
- Assessment outcome: \`${evidence.control_effectiveness_binding.assessment_outcome}\`
- Reason: ${evidence.control_effectiveness_binding.reason}

## Business Universe Completion

| Field | Value |
|---|---|
| Required | \`${evidence.business_universe_binding.required}\` |
| Routing Result | \`${evidence.business_universe_binding.routing_result}\` |
| Coverage Ref | \`${evidence.business_universe_binding.business_universe_ref}\` |
| Coverage State | \`${evidence.business_universe_binding.business_universe_state}\` |
| Mapping Status | \`${evidence.business_universe_binding.coverage_mapping_status}\` |

| Coverage Scenario | Verification Obligations | Test Evidence | Required Proof | Test State | Assurance State | Completion State |
|---|---|---|---|---|---|---|
${evidence.scenario_completion_map.length > 0
    ? evidence.scenario_completion_map.map((item) => `| \`${item.coverage_scenario_id}\` | \`${item.verification_obligation_ids.join(", ")}\` | \`${item.test_evidence_ids.join(", ") || "none"}\` | \`${item.required_proof_strength}\` | \`${item.test_evidence_state}\` | \`${item.execution_assurance_state}\` | \`${item.completion_state}\` |`).join("\n")
    : "| N/A | N/A | N/A | N/A | N/A | N/A | NOT_REQUIRED |"}

## Task Consistency

- Expected task ref: \`${evidence.task_consistency.expected_task_ref}\`
- All sources same task: \`${evidence.task_consistency.all_sources_same_task}\`
- Reason: ${evidence.task_consistency.reason}

## Missing Or Blocking Items

${evidence.missing_or_blocking_items.length > 0 ? evidence.missing_or_blocking_items.map((item) => `- ${item}`).join("\n") : "- None."}

## Boundaries

- This report writes target files: No
- This report runs tests: No
- This report fabricates evidence: No
- This report authorizes implementation: No
- This report approves commit or push: No
- This report approves release or production: No
- This report proves product correctness: No
- This report proves real-environment behavior: No
- This report replaces source systems: No

## Machine-Readable Evidence

\`\`\`json
${JSON.stringify(evidence, null, 2)}
\`\`\`

## Outcome

\`${evidence.completion_state}\`

## Next Step

${evidence.next_step}
`;
}

function resolveArtifact(root, ref) {
  const normalized = String(ref || "").replace(/^(artifact|file):/, "");
  if (!normalized || path.isAbsolute(normalized) || normalized.includes("..")) return "";
  const candidates = [
    path.resolve(root, normalized),
    path.resolve(root, ".intentos", normalized),
  ];
  return candidates.find((candidate) => {
    const relative = path.relative(root, candidate);
    return !relative.startsWith("..") && !path.isAbsolute(relative) && fs.existsSync(candidate) && fs.statSync(candidate).isFile();
  }) || "";
}

function resolveOutputPath(root, relativePath) {
  const output = String(relativePath || "");
  if (!output || path.isAbsolute(output) || output.includes("..")) {
    console.error("--out requires a relative report path inside the project.");
    process.exit(1);
  }
  return path.resolve(root, output);
}

function completionEvidenceRefForOutput(root, outPath, fallbackSlug) {
  if (outPath) return `artifact:${path.relative(root, outPath)}`;
  return `artifact:completion-evidence-reports/001-${fallbackSlug || "completion-evidence"}.md`;
}

function writeOutputIfRequested(output) {
  if (!outputPath) return;
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, output);
}

function digest(value) {
  return `sha256:${crypto.createHash("sha256").update(String(value)).digest("hex")}`;
}

function fileDigest(file) {
  return `sha256:${crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex")}`;
}

function slugify(value) {
  return String(value || "completion-evidence")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "completion-evidence";
}
