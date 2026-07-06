#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { evidenceDigest, extractMachineReadableEvidence } from "./lib/artifact-schema.mjs";

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
  const completionEvidenceRef = completionEvidenceRefForOutput(root, outputPath, slugify(intent));
  const checks = buildChecks(sources, taskRef);
  const state = stateFor(checks);
  const canClaimComplete = state === "COMPLETION_EVIDENCE_READY" ? "Yes" : "No";
  const base = {
    schema_version: "1.78.0",
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
      source_outcome: source.outcome || "not provided",
      digest: source.digest || "not provided",
      ready: source.ready,
      reason: source.reason,
    })),
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
    completion_gate_digest: evidenceDigest(base, ["completion_gate_digest"]),
  };
  return {
    reportType: "COMPLETION_EVIDENCE_GATE",
    schemaVersion: "1.78.0",
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
    taskRef: String(evidence?.task_ref || ""),
    outcome,
    digest: options.digestField ? String(evidence?.[options.digestField] || "") : fileDigest(resolved),
    ready: readyState && extraReady ? "Yes" : "No",
    reason: readyState && extraReady
      ? "Source artifact is recorded and in a completion-ready state."
      : `Source artifact state ${outcome || "<missing>"} is not completion-ready.`,
  };
}

function buildChecks(sources, taskRef) {
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
  const consistency = taskConsistencyFor(sources, taskRef);
  checks.push({
    id: "check:task-consistency",
    status: consistency.all_sources_same_task === "Yes" ? "PASS" : "FAIL",
    source: "source_chain",
    expected: "All recorded source artifacts bind to the current task.",
    actual: consistency.all_sources_same_task,
    reason: consistency.reason,
  });
  return checks;
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

function stateFor(checks) {
  if (checks.every((check) => check.status === "PASS")) return "COMPLETION_EVIDENCE_READY";
  if (checks.some((check) => check.id === "check:task-consistency" && check.status !== "PASS")) return "BLOCKED_BY_TASK_MISMATCH";
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

| Source | Status | Ref | Task Ref | Outcome | Ready | Digest | Reason |
|---|---|---|---|---|---|---|---|
${evidence.source_chain.map((source) => `| \`${source.name}\` | \`${source.status}\` | \`${source.ref}\` | \`${source.task_ref}\` | \`${source.source_outcome}\` | \`${source.ready}\` | \`${source.digest}\` | ${source.reason} |`).join("\n")}

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
