import path from "node:path";
import { spawnSync } from "node:child_process";
import { requireAcceptedOutcome } from "../lib/check-result.mjs";
import { validateBaselineEnforcementConsumption } from "../lib/planning-closure.mjs";
import { firstUsefulLine, sha256 } from "./shared.mjs";

function runFinalDecision(kitRoot, name, script, childArgs) {
  const source = runSource(kitRoot, name, script, childArgs);
  return {
    ...source,
    sourceKind: "FINAL_DECISION",
    sourceContract: "UNIFIED_CLOSURE_AFTER_REQUIRED_CONSUMERS",
  };
}

export function normalizeProjectRef(value) {
  return String(value || "")
    .trim()
    .replace(/^(?:artifact|file):/i, "")
    .split("#")[0]
    .replaceAll("\\", "/");
}

function runSource(kitRoot, name, script, childArgs) {
  const result = spawnSync(process.execPath, [path.join(kitRoot, script), ...childArgs], {
    cwd: kitRoot,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 32,
  });
  if (result.status !== 0) {
    return {
      name,
      script,
      sourceKind: "RESOLVER",
      readStatus: "FAILED",
      outcome: "BLOCKED_BY_SOURCE_FAILURE",
      ref: `generated:${script}`,
      semanticDigest: `sha256:${sha256(result.stderr || result.stdout || "source resolver failed")}`,
      value: null,
      error: firstUsefulLine(result.stderr || result.stdout || "source resolver failed"),
    };
  }
  try {
    const value = JSON.parse(result.stdout);
    const nestedFailures = name === "WORKFLOW_GUIDANCE"
      ? (value.deepOrchestration?.failures || [])
      : [];
    const semanticValue = { ...value };
    delete semanticValue.generatedAt;
    return {
      name,
      script,
      sourceKind: "RESOLVER",
      readStatus: nestedFailures.length > 0 ? "FAILED" : "CURRENT_RUN",
      outcome: nestedFailures.length > 0 ? "BLOCKED_BY_NESTED_SOURCE_FAILURE" : sourceOutcome(value),
      ref: sourceRef(value, script),
      semanticDigest: `sha256:${sha256(JSON.stringify(semanticValue))}`,
      value,
      error: nestedFailures.length > 0
        ? nestedFailures.map((item) => `${item.id}: ${item.reason}`).join("; ")
        : "",
    };
  } catch (error) {
    return {
      name,
      script,
      sourceKind: "RESOLVER",
      readStatus: "FAILED",
      outcome: "BLOCKED_BY_INVALID_SOURCE",
      ref: `generated:${script}`,
      semanticDigest: `sha256:${sha256(result.stdout || error.message)}`,
      value: null,
      error: `invalid JSON: ${error.message}`,
    };
  }
}

function runGateSource(kitRoot, name, script, childArgs) {
  const result = spawnSync(process.execPath, [path.join(kitRoot, script), ...childArgs], {
    cwd: kitRoot,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 32,
  });
  try {
    const value = JSON.parse(result.stdout);
    const contract = gateContractResult(name, value);
    const acceptedExitStatuses = Array.isArray(contract.acceptedExitStatuses)
      ? contract.acceptedExitStatuses
      : [0];
    const accepted = acceptedExitStatuses.includes(result.status) && contract.ok;
    const reportIndex = childArgs.indexOf("--report");
    const reportRef = reportIndex >= 0 ? normalizeProjectRef(childArgs[reportIndex + 1]) : "";
    return {
      name,
      script,
      sourceKind: "GATE",
      sourceContract: contract.contract,
      readStatus: accepted ? "CURRENT_RUN" : "FAILED",
      outcome: contract.outcome,
      ref: reportRef ? `artifact:${reportRef}` : `generated:${script}`,
      semanticDigest: `sha256:${sha256(JSON.stringify(value))}`,
      value,
      remediationAction: contract.remediationAction || "",
      error: accepted
        ? ""
        : firstUsefulLine(contract.reason || firstFailedGateMessage(value) || result.stderr || `checker exited ${result.status}`),
    };
  } catch (error) {
    return {
      name,
      script,
      sourceKind: "GATE",
      sourceContract: "INVALID_JSON",
      readStatus: "FAILED",
      outcome: "BLOCKED_BY_INVALID_SOURCE",
      ref: `generated:${script}`,
      semanticDigest: `sha256:${sha256(result.stderr || result.stdout || error.message)}`,
      value: null,
      error: firstUsefulLine(result.stderr || result.stdout || error.message),
    };
  }
}

function gateContractResult(name, value) {
  if (name === "BASELINE_ENFORCEMENT_CHECK") {
    const baseline = validateBaselineEnforcementConsumption(value);
    return {
      ...baseline,
      contract: "IMPLEMENTATION_BASELINE_READINESS",
      acceptedExitStatuses: [0, 1],
    };
  }

  if (Object.prototype.hasOwnProperty.call(value || {}, "consumerOutcome")) {
    return {
      ...requireAcceptedOutcome(value),
      contract: "TYPED_CONSUMER_OUTCOME",
    };
  }

  if (name === "COMPLETION_EVIDENCE") {
    const checks = gateChecks(value);
    const reports = Array.isArray(value?.reports) ? value.reports : [];
    const ready = reports.length === 1
      && reports[0].completionState === "COMPLETION_EVIDENCE_READY"
      && reports[0].canClaimComplete === "Yes";
    const strict = strictCheckSet(checks, [/has valid structured evidence/i, /ready gate can claim complete/i]);
    return {
      ok: strict.ok && ready,
      outcome: strict.ok && ready ? "READY" : "INVALID",
      reason: strict.reason || (reports.length !== 1
        ? "strict Completion Evidence must resolve exactly one report"
        : "Completion Evidence is not ready to support a completion claim"),
      contract: "STRICT_COMPLETION_EVIDENCE",
    };
  }

  const requiredMarkers = {
    WORK_QUEUE_TAKEOVER_CHECK: [/has valid structured evidence/i, /Task Governance lineage binds this Work Queue task instance/i],
    TASK_GOVERNANCE_CHECK: [/has valid structured evidence/i, /task-instance lineage is valid/i],
    BUSINESS_UNIVERSE_COVERAGE_CHECK: [/has valid final 1\.108 structured evidence/i, /ready coverage has no unresolved items/i],
    CONTROL_EFFECTIVENESS_CHECK: [/has valid strict 1\.110 structured evidence/i, /required claims are proven effective/i],
    EXECUTION_ASSURANCE_CHECK: [/evidence artifact_type is execution_assurance_report/i, /VERIFIED_DONE satisfies current task completion obligations/i],
    RELEASE_CHANNEL_POLICY_CHECK: [/has valid structured evidence/i],
    RELEASE_EXECUTION_TOPOLOGY_CHECK: [/has valid strict topology evidence/i],
    RUNTIME_HYGIENE_CHECK: [/has valid structured evidence/i, /release preflight ready operation is release/i],
    RELEASE_EVIDENCE_GATE_CHECK: [/has valid structured evidence/i, /ready state can hand off to release owner/i],
  }[name];
  if (!requiredMarkers) {
    return {
      ok: false,
      outcome: "INVALID",
      reason: "gate result has no consumerOutcome and no source-specific strict contract",
      contract: "UNSUPPORTED_UNTYPED_RESULT",
    };
  }
  const strict = strictCheckSet(gateChecks(value), requiredMarkers);
  return {
    ...strict,
    outcome: strict.ok ? "READY" : "INVALID",
    contract: "SOURCE_SPECIFIC_STRICT_CHECKS",
  };
}

function gateChecks(value) {
  if (Array.isArray(value?.checks)) return value.checks;
  if (Array.isArray(value?.results)) return value.results;
  return [];
}

function strictCheckSet(checks, requiredMarkers) {
  if (checks.length === 0) return { ok: false, reason: "strict checker returned no check evidence" };
  const invalid = checks.find((item) => String(item?.status || "").toUpperCase() !== "PASS");
  if (invalid) return { ok: false, reason: invalid.message || "strict checker returned a non-PASS check" };
  const messages = checks.map((item) => String(item.message || "")).join("\n");
  const missing = requiredMarkers.find((marker) => !marker.test(messages));
  if (missing) return { ok: false, reason: `strict checker omitted required evidence marker ${missing}` };
  return { ok: true, reason: "" };
}

function firstFailedGateMessage(value) {
  return gateChecks(value).find((item) => item.status === "FAIL" || item.ok === false)?.message || "";
}

export function operatingExitCode(report) {
  if (report.outcome === "BLOCKED_BY_SOURCE_FAILURE") return 2;
  const strictGateBlocked = report.sourceSystemTrace?.some(
    (source) => source.sourceKind === "GATE" && source.readStatus === "FAILED",
  );
  const baselineBlocked = report.sourceSystemTrace?.some(
    (source) => source.sourceSystem === "BASELINE_ENFORCEMENT_CHECK" && source.readStatus === "FAILED",
  );
  if (baselineBlocked && ["CONTINUE_TASK", "RESUME_TASK"].includes(report.operatingLoop?.operation)) return 1;
  if (report.operatingLoop?.operation === "FINISH_TASK"
    && (strictGateBlocked || report.operatingLoop.state !== "READY_TO_REPORT_DONE")) return 1;
  if (report.operatingLoop?.operation === "CHECK_STATUS"
    && report.operatingLoop.statusScope === "CURRENT_TASK"
    && report.operatingLoop.state !== "STATUS_AVAILABLE") return 1;
  return 0;
}

function sourceOutcome(value) {
  return String(
    value?.outcome
      || value?.closureDecision?.decision
      || value?.deliveryStatus?.currentState
      || value?.humanSummary?.adoptionState
      || value?.nextAction
      || value?.humanDecisionSummary?.conclusion
      || "READ_ONLY_RESULT",
  );
}

function sourceRef(value, script) {
  return String(
    value?.structuredEvidence?.report_ref
      || value?.structuredEvidence?.task_governance_ref
      || value?.structuredEvidence?.adoption_autopilot_ref
      || value?.reportRef
      || `generated:${script}`,
  );
}

export function toSourceTrace(source) {
  return {
    sourceSystem: source.name,
    sourceKind: source.sourceKind,
    sourceContract: source.sourceContract || "RESOLVER_OUTPUT",
    ref: source.ref,
    readStatus: source.readStatus,
    outcome: source.outcome,
    error: source.error || "",
    semanticDigest: source.semanticDigest,
    authority: "SOURCE_SYSTEM_REMAINS_AUTHORITATIVE",
  };
}

export function createSourceExecution(kitRoot) {
  return {
    runFinalDecision: (name, script, childArgs) => runFinalDecision(kitRoot, name, script, childArgs),
    runSource: (name, script, childArgs) => runSource(kitRoot, name, script, childArgs),
    runGateSource: (name, script, childArgs) => runGateSource(kitRoot, name, script, childArgs),
  };
}
