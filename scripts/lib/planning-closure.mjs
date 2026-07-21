import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import {
  canonicalFileDigest,
  resolveAuthoritativeEvidenceReference,
  validateEvidenceAuthorityBinding,
} from "./evidence-authority.mjs";
import {
  evidenceDigest,
  extractMachineReadableEvidence,
  loadSchema,
  validateEvidenceBlock,
} from "./artifact-schema.mjs";

export const PLANNING_CLOSURE_STATES = Object.freeze([
  "PLANNING_READY",
  "PLANNING_IN_PROGRESS",
  "PLANNING_INPUT_NEEDED",
  "PLANNING_DISCOVERY_NEEDED",
  "PLANNING_BLOCKED",
  "PLANNING_INVALID",
]);

export const SOURCE_CONFIG = Object.freeze({
  TASK_GOVERNANCE: config("task-governance-reports", "task-governance.schema.json", "scripts/check-task-governance.mjs", ["--require-report", "--require-structured-evidence"], "task_governance_digest", "outcome", [
    "LOW_LIGHTWEIGHT_GOVERNANCE", "MEDIUM_TARGETED_GOVERNANCE", "HIGH_REQUIRES_FULL_GOVERNANCE",
  ]),
  BUSINESS_UNIVERSE: config("business-universe-coverage-reports", "business-universe-coverage.schema.json", "scripts/check-business-universe-coverage.mjs", ["--require-report", "--require-structured-evidence", "--require-ready"], "coverage_digest", "outcome", ["COVERAGE_READY"]),
  BUSINESS_RULE: config("business-rule-closures", "business-rule-closure.schema.json", "scripts/check-business-rule-closure.mjs", ["--require-report", "--require-structured-evidence", "--require-business-rule-closure"], "closure_digest", "state", ["READY_FOR_IMPACT_COVERAGE"]),
  CHANGE_IMPACT: config("change-impact-coverage-reports", "change-impact-coverage.schema.json", "scripts/check-change-impact-coverage.mjs", [
    "--require-structured-evidence",
    "--mode", "preflight",
    "--strict-evidence",
    "--require-task-lineage",
  ], "impact_digest", "outcome", ["CHANGE_IMPACT_RECORDED"]),
  VERIFICATION_PLAN: config("verification-plans", "verification-plan.schema.json", "scripts/check-verification-plan.mjs", ["--require-report", "--require-structured-evidence", "--strict-source-binding"], "verification_plan_digest", "verification_state", ["VERIFICATION_PLAN_READY", "NOT_APPLICABLE_WITH_REASON"]),
  PLAN_REVIEW: config("plan-review-reports", "plan-review.schema.json", "scripts/check-plan-review.mjs", ["--require-report", "--require-structured-evidence"], "plan_review_digest", "plan_review_state", ["PLAN_REVIEW_PASSED", "NO_PLAN_REQUIRED"]),
  CONTROL_EFFECTIVENESS: config("control-effectiveness-reports", "control-effectiveness.schema.json", "scripts/check-control-effectiveness.mjs", ["--require-report", "--require-structured-evidence", "--require-effective"], "report_digest", "outcome", ["CONTROL_PROVEN_EFFECTIVE"]),
});

const OPERATING_BASELINE_OPERATIONS = new Set([
  "CONTINUE_TASK",
  "RESUME_TASK",
  "FINISH_TASK",
]);

function config(directory, schema, checker, checkerArgs, digestField, stateField, readyStates) {
  return { directory, schema, checker, checkerArgs, digestField, stateField, readyStates };
}

export function requirementMatrix(taskGovernance) {
  const before = taskGovernance?.required_before_implementation_review || {};
  const review = taskGovernance?.review_policy || {};
  const impact = taskGovernance?.impact_classification?.task_impact || "UNKNOWN";
  return [
    requirement("BUSINESS_UNIVERSE", before.business_universe_coverage_required === "Yes"),
    requirement("BUSINESS_RULE", before.business_rule_closure_required === "Yes"),
    requirement("CHANGE_IMPACT", before.change_impact_coverage_required === "Yes"),
    requirement("VERIFICATION_PLAN", before.verification_plan_required === "Yes"),
    requirement("PLAN_REVIEW", impact !== "LOW" || review.review_level !== "LIGHTWEIGHT"),
    requirement("CONTROL_EFFECTIVENESS", before.control_effectiveness_required === "Yes"),
  ];
}

export function requiresOperatingBaselineConsumption({ behavioralAdoptionState, operation }) {
  return behavioralAdoptionState === "VERIFIED_ACTIVE"
    && OPERATING_BASELINE_OPERATIONS.has(operation);
}

export function validateBaselineEnforcementConsumption(report) {
  const checks = Array.isArray(report?.checks) ? report.checks : [];
  const passing = (pattern) => checks.filter((item) => String(item?.status || "").toUpperCase() === "PASS"
    && pattern.test(String(item?.message || "").trim()));
  const platformReady = passing(/^platform baseline strict state is BASELINE_READY$/i);
  const industrialReady = passing(/^industrial baseline strict state is (?:BASELINE_READY|NOT_APPLICABLE)$/i);
  const platformFailures = checks.filter((item) => String(item?.status || "").toUpperCase() !== "PASS"
    && /^platform baseline\b/i.test(String(item?.message || "").trim()));
  const industrialFailures = checks.filter((item) => String(item?.status || "").toUpperCase() !== "PASS"
    && /^industrial baseline\b/i.test(String(item?.message || "").trim()));
  const blockers = [];

  if (report?.mode !== "implementation") blockers.push("Baseline Enforcement did not run in implementation mode.");
  if (!/^BL[0-2]$/.test(String(report?.baselineLevel || ""))) blockers.push("Baseline Enforcement did not identify one supported baseline level.");
  if (platformReady.length !== 1) {
    blockers.push(platformFailures[0]?.message || "Platform baseline strict readiness was not proven exactly once.");
  }
  if (industrialReady.length !== 1) {
    blockers.push(industrialFailures[0]?.message || "Industrial baseline strict readiness was not proven exactly once.");
  }

  const ok = blockers.length === 0;
  return {
    ok,
    outcome: ok ? "BASELINE_READY" : "BASELINE_BLOCKED",
    reason: blockers[0] || "",
    blockers,
    remediationAction: platformReady.length === 1
      ? "RUN_INDUSTRIAL_BASELINE_SETUP"
      : "RUN_PLATFORM_BASELINE_SETUP",
    advisoryCount: checks.filter((item) => String(item?.status || "").toUpperCase() === "PENDING").length,
  };
}

function requirement(sourceKind, required) {
  return { sourceKind, required: required ? "Yes" : "No" };
}

export function findSourceReport(projectRoot, sourceKind, explicitRef, taskRef, intentDigest) {
  const source = SOURCE_CONFIG[sourceKind];
  if (!source) return null;
  if (explicitRef) return resolveReport(projectRoot, explicitRef, source.directory);
  const roots = [path.join(projectRoot, source.directory), path.join(projectRoot, ".intentos", source.directory)];
  const candidates = [];
  for (const root of roots) {
    if (!safeDirectory(root)) continue;
    for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
      const file = path.join(root, entry.name);
      const parsed = extractMachineReadableEvidence(fs.readFileSync(file, "utf8"));
      if (!parsed?.ok) continue;
      const evidence = parsed.value;
      const taskMatch = expectedIdentityMatch(
        evidence.task_ref || evidence.authority_binding?.task?.task_ref,
        taskRef,
      );
      const intentMatch = expectedIdentityMatch(
        evidence.intent_digest || evidence.authority_binding?.task?.intent_digest,
        intentDigest,
      );
      candidates.push({ file, taskMatch, intentMatch, mtime: fs.statSync(file).mtimeMs });
    }
  }
  candidates.sort((a, b) => Number(b.taskMatch === "Yes" && b.intentMatch === "Yes")
    - Number(a.taskMatch === "Yes" && a.intentMatch === "Yes")
    || b.mtime - a.mtime);
  return candidates[0]?.file || null;
}

export function validatePlanningSource({ projectRoot, sourceKind, file, taskRef, intentDigest, kitRoot }) {
  const source = SOURCE_CONFIG[sourceKind];
  if (!source) return invalidSource(sourceKind, "Unknown planning source kind.");
  if (!file) return missingSource(sourceKind, "No current report was found.");
  if (!safeRegularFile(file)) return invalidSource(sourceKind, "Report must be a regular non-symlink file.");
  const relative = relativeRef(projectRoot, file);
  if (!relative) return invalidSource(sourceKind, "Report is outside the current project authority root.");
  const content = fs.readFileSync(file, "utf8");
  const schema = loadSchema(projectRoot, `schemas/artifacts/${source.schema}`);
  const checked = validateEvidenceBlock(content, schema, relative, { require: true, digestField: source.digestField });
  if (!checked.ok) return invalidSource(sourceKind, checked.errors.join("; "), relative, canonicalFileDigest(file));
  const evidence = checked.value;
  const checker = runChecker({ projectRoot, kitRoot, source, relative, taskRef, intentDigest });
  const taskMatch = evidence.task_ref ? (evidence.task_ref === taskRef ? "Yes" : "No") : taskMatchFromNested(evidence, taskRef);
  const intentMatch = evidence.intent_digest ? (evidence.intent_digest === intentDigest ? "Yes" : "No") : intentMatchFromNested(evidence, intentDigest);
  const state = String(evidence[source.stateField] || "UNKNOWN");
  const ready = source.readyStates.includes(state);
  const valid = checker.ok && taskMatch === "Yes" && intentMatch === "Yes";
  return {
    source_kind: sourceKind,
    report_ref: `file:${relative}`,
    report_digest: String(evidence[source.digestField] || canonicalFileDigest(file)),
    source_state: state,
    validation_state: valid && ready ? "VALID" : valid ? "BLOCKED" : "INVALID",
    current_task_match: taskMatch,
    current_intent_match: intentMatch,
    reason: !checker.ok
      ? checker.reason
      : taskMatch !== "Yes"
        ? "Report does not prove an exact match to the current task."
        : intentMatch !== "Yes"
          ? "Report does not prove an exact match to the current intent."
          : ready
            ? "The source passed its strict checker and is ready."
            : `The source is valid but remains ${state}.`,
    evidence,
  };
}

function runChecker({ projectRoot, kitRoot, source, relative, taskRef, intentDigest }) {
  const checker = resolveChecker(projectRoot, kitRoot, source.checker);
  if (!checker) return { ok: false, reason: `Required checker is unavailable: ${source.checker}` };
  const args = [checker, projectRoot, "--report", relative, ...source.checkerArgs];
  if (source.checker.endsWith("check-control-effectiveness.mjs")) args.push("--task-ref", taskRef, "--intent-digest", intentDigest);
  const result = spawnSync(process.execPath, args, { cwd: projectRoot, encoding: "utf8", maxBuffer: 1024 * 1024 * 32 });
  return {
    ok: result.status === 0,
    reason: result.status === 0 ? "Checker passed." : condensedFailure(result.stdout, result.stderr),
  };
}

function resolveChecker(projectRoot, kitRoot, relative) {
  for (const file of [path.join(projectRoot, relative), path.join(projectRoot, ".intentos", relative), path.join(kitRoot, relative)]) {
    if (safeRegularFile(file)) return file;
  }
  return "";
}

function condensedFailure(stdout, stderr) {
  const lines = `${stdout || ""}\n${stderr || ""}`.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const failures = lines.filter((line) => /^FAIL\b/.test(line));
  return (failures[0] || lines[lines.length - 1] || "Checker failed.").slice(0, 500);
}

export function derivePlanningState({ entryReady, currentTask, taskGovernance, requirements }) {
  const blockers = [];
  if (!entryReady) blockers.push(blocker("PROJECT_ENTRY_NOT_READY", "CODEX_TECHNICAL_WORK", "Project Entry Trust does not permit ordinary IntentOS operation.", "Codex repairs or completes project entry before planning continues.", "PLANNING_BLOCKED"));
  if (!currentTask || currentTask.current_task_count !== 1) blockers.push(blocker("CURRENT_TASK_AMBIGUOUS", "CODEX_TECHNICAL_WORK", "Exactly one current task is required.", "Codex reconciles the Work Queue or verified project-native task system.", "PLANNING_INVALID"));
  else if (currentTask.current_task_match !== "Yes") blockers.push(blocker("CURRENT_TASK_MISMATCH", "CODEX_TECHNICAL_WORK", "The requested task or intent does not match the current task.", "Codex routes, pauses, resumes, or switches work through the current task authority.", "PLANNING_INVALID"));
  if (!taskGovernance || taskGovernance.validation_state !== "VALID") blockers.push(blocker("TASK_GOVERNANCE_NOT_READY", "CODEX_TECHNICAL_WORK", taskGovernance?.reason || "Current Task Governance evidence is missing.", "Codex produces and validates current Task Governance evidence.", taskGovernance?.validation_state === "INVALID" ? "PLANNING_INVALID" : "PLANNING_IN_PROGRESS"));
  const taskImpact = taskGovernance?.evidence?.impact_classification?.task_impact || "UNKNOWN";
  if (taskImpact === "POSSIBLE_HIGH") blockers.push(blocker("TASK_IMPACT_UNRESOLVED", "CODEX_TECHNICAL_WORK", "Task impact is still POSSIBLE_HIGH.", "Codex completes bounded read-only inspection before planning can become ready.", "PLANNING_DISCOVERY_NEEDED"));
  const universeRouting = taskGovernance?.evidence?.business_universe_routing;
  if (universeRouting?.routing_result === "TECHNICAL_INSPECTION_REQUIRED") blockers.push(blocker("BUSINESS_UNIVERSE_INSPECTION_REQUIRED", "CODEX_TECHNICAL_WORK", "Business omission risk still requires read-only inspection.", "Codex completes the bounded Business Universe inspection.", "PLANNING_DISCOVERY_NEEDED"));
  const controlRouting = taskGovernance?.evidence?.control_effectiveness_routing;
  if (controlRouting?.routing_result === "TECHNICAL_INSPECTION_REQUIRED") blockers.push(blocker("CONTROL_DEPENDENCY_INSPECTION_REQUIRED", "CODEX_TECHNICAL_WORK", "Relied-on control dependencies still require inspection.", "Codex identifies the exact control claims and proves their effectiveness.", "PLANNING_DISCOVERY_NEEDED"));
  for (const item of requirements.filter((row) => row.required === "Yes")) {
    if (item.validation_state === "VALID") continue;
    const invalid = item.validation_state === "INVALID";
    blockers.push(blocker(
      `${item.source_kind}_${invalid ? "INVALID" : "NOT_READY"}`,
      ownerForSource(item),
      item.reason,
      nextActionForSource(item.source_kind),
      invalid ? "PLANNING_INVALID" : outcomeForSource(item),
    ));
  }
  if (blockers.length === 0) return { outcome: "PLANNING_READY", blockers: [], firstBlocker: blocker("NONE", "NONE", "Every required planning source is current and ready.", "Codex may continue to controlled implementation review after pre-write revalidation.", "PLANNING_READY") };
  const priority = ["PLANNING_INVALID", "PLANNING_BLOCKED", "PLANNING_INPUT_NEEDED", "PLANNING_DISCOVERY_NEEDED", "PLANNING_IN_PROGRESS"];
  blockers.sort((a, b) => priority.indexOf(a.outcome) - priority.indexOf(b.outcome) || a.code.localeCompare(b.code));
  return { outcome: blockers[0].outcome, blockers, firstBlocker: blockers[0] };
}

function blocker(code, ownerClass, summary, nextAction, outcome) {
  return { code, owner_class: ownerClass, summary, next_action: nextAction, outcome };
}

function ownerForSource(item) {
  if (/BUSINESS_FACT_NEEDED|NEEDS_USER_CONFIRMATION/.test(item.source_state)) return "BUSINESS_FACT_NEEDED";
  if (/EXTERNAL_FACT_NEEDED|NEEDS_DOMAIN_OWNER/.test(item.source_state)) return "EXTERNAL_FACT_NEEDED";
  return "CODEX_TECHNICAL_WORK";
}

function outcomeForSource(item) {
  const owner = ownerForSource(item);
  if (owner === "BUSINESS_FACT_NEEDED" || owner === "EXTERNAL_FACT_NEEDED") return "PLANNING_INPUT_NEEDED";
  return item.validation_state === "MISSING" ? "PLANNING_IN_PROGRESS" : "PLANNING_BLOCKED";
}

function nextActionForSource(sourceKind) {
  const actions = {
    BUSINESS_UNIVERSE: "Codex completes business category, lifecycle, provenance, and reverse-path coverage.",
    BUSINESS_RULE: "Codex closes the affected business rule or asks for one unavailable business fact.",
    CHANGE_IMPACT: "Codex maps every affected implementation and verification surface.",
    VERIFICATION_PLAN: "Codex creates and checks the current verification obligations.",
    PLAN_REVIEW: "Codex completes the required plan review and governs blocking findings.",
    CONTROL_EFFECTIVENESS: "Codex proves the exact relied-on control claims before using them.",
  };
  return actions[sourceKind] || "Codex completes the missing technical planning evidence.";
}

export function buildExecutionEntryContract({ authorityBinding, sourceGitCommit = "N/A", taskRef, intentDigest, taskImpact, reportRef, closureDigest, sources }) {
  if (!new Set(["LOW", "MEDIUM", "HIGH"]).has(taskImpact)) return null;
  const sourceBindings = sources.filter((item) => item.required === "Yes").map((item) => ({
    source_kind: item.source_kind,
    ref: item.report_ref,
    digest: item.report_digest,
    state: item.source_state,
    current_task_match: item.current_task_match,
  }));
  const base = {
    contract_id: `execution-entry:${slug(taskRef)}`,
    contract_digest: "",
    project_identity_digest: authorityBinding.project.fingerprint,
    source_revision_digest: authorityBinding.project.revision,
    source_git_commit: sourceGitCommit,
    task_ref: taskRef,
    intent_digest: intentDigest,
    task_impact: taskImpact,
    planning_closure_ref: reportRef,
    planning_closure_digest: closureDigest,
    source_bindings: sourceBindings,
    authorizes_implementation: "No",
    authorizes_project_writes: "No",
    authorizes_apply: "No",
    authorizes_release: "No",
    authorizes_production: "No",
    requires_pre_write_revalidation: "Yes",
  };
  return { ...base, contract_digest: evidenceDigest(base, ["contract_digest"]) };
}

export function validatePlanningClosureEvidence(projectRoot, reportFile, evidence, options = {}) {
  const errors = [];
  if (!PLANNING_CLOSURE_STATES.includes(evidence.outcome)) errors.push(`unknown Planning Closure outcome ${evidence.outcome}`);
  const sourceRefs = evidence.source_requirements.filter((item) => item.required === "Yes" && item.report_ref.startsWith("file:")).map((item) => item.report_ref);
  if (evidence.task_governance.ref.startsWith("file:")) sourceRefs.push(evidence.task_governance.ref);
  const authority = validateEvidenceAuthorityBinding(projectRoot, evidence.authority_binding, {
    taskRef: evidence.task_ref,
    intentDigest: evidence.intent_digest,
    sourceRefs: [...new Set(sourceRefs)],
    fromFile: reportFile,
    allowRevisionAdvance: options.allowRevisionAdvance === true,
    sourceRevisionDigest: evidence.execution_entry_contract?.source_revision_digest,
    sourceGitCommit: evidence.execution_entry_contract?.source_git_commit,
  });
  errors.push(...authority.errors);
  for (const source of evidence.source_requirements.filter((item) => item.required === "Yes")) {
    if (source.validation_state !== "VALID") continue;
    const resolved = resolveAuthoritativeEvidenceReference(projectRoot, reportFile, source.report_ref, { markdownOnly: true });
    if (!resolved.ok) errors.push(`${source.source_kind} report is unsafe or unresolved: ${resolved.error}`);
    else if (!acceptedDigests(resolved.file).has(source.report_digest)) errors.push(`${source.source_kind} report digest does not match current evidence`);
    if (source.current_task_match !== "Yes") errors.push(`${source.source_kind} does not prove an exact current-task match`);
    if (source.current_intent_match !== "Yes") errors.push(`${source.source_kind} does not prove an exact current-intent match`);
  }
  if (evidence.outcome === "PLANNING_READY") {
    if (!evidence.execution_entry_contract) errors.push("PLANNING_READY requires an Execution Entry Contract");
    for (const source of evidence.source_requirements.filter((item) => item.required === "Yes")) if (source.validation_state !== "VALID") errors.push(`PLANNING_READY cannot use non-valid ${source.source_kind}`);
  } else if (evidence.execution_entry_contract !== null) errors.push(`${evidence.outcome} must not emit an Execution Entry Contract`);
  if (evidence.execution_entry_contract) {
    const contract = evidence.execution_entry_contract;
    const expected = evidenceDigest(contract, ["contract_digest"]);
    if (contract.contract_digest !== expected) errors.push("Execution Entry Contract digest is invalid");
    if (contract.source_revision_digest !== evidence.authority_binding?.project?.revision) errors.push("Execution Entry Contract source revision does not match Planning Closure authority");
    for (const field of ["authorizes_implementation", "authorizes_project_writes", "authorizes_apply", "authorizes_release", "authorizes_production"]) if (contract[field] !== "No") errors.push(`Execution Entry Contract ${field} must be No`);
    if (contract.planning_closure_digest !== evidence.closure_core_digest) errors.push("Execution Entry Contract must bind the exact Planning Closure core digest");
  }
  return { ok: errors.length === 0, errors };
}

function acceptedDigests(file) {
  const values = new Set([canonicalFileDigest(file)]);
  const parsed = extractMachineReadableEvidence(fs.readFileSync(file, "utf8"));
  if (parsed.ok) for (const [key, value] of Object.entries(parsed.value)) if (key.endsWith("_digest") && typeof value === "string" && value === evidenceDigest(parsed.value, [key])) values.add(value);
  return values;
}

function expectedIdentityMatch(observed, expected) {
  if (!expected || !observed) return "Unknown";
  return observed === expected ? "Yes" : "No";
}

function taskMatchFromNested(evidence, taskRef) {
  const refs = [
    evidence.user_request?.task_ref,
    evidence.task_governance?.task_ref,
    evidence.authority_binding?.task?.task_ref,
    evidence.business_rule_ref && evidence.task_ref,
  ].filter(Boolean);
  if (refs.length === 0) return "Unknown";
  return refs.every((value) => value === taskRef) ? "Yes" : "No";
}

function intentMatchFromNested(evidence, intentDigest) {
  const values = [
    evidence.user_request?.intent ? digest(evidence.user_request.intent) : "",
    evidence.source_request_digest,
    evidence.authority_binding?.task?.intent_digest,
  ].filter(Boolean);
  if (values.length === 0) return "Unknown";
  return values.every((value) => value === intentDigest) ? "Yes" : "No";
}

function missingSource(kind, reason) {
  return { source_kind: kind, report_ref: "N/A", report_digest: "N/A", source_state: "MISSING", validation_state: "MISSING", current_task_match: "Unknown", current_intent_match: "Unknown", reason, evidence: null };
}

function invalidSource(kind, reason, ref = "N/A", digest = "N/A") {
  return { source_kind: kind, report_ref: ref, report_digest: digest, source_state: "INVALID", validation_state: "INVALID", current_task_match: "Unknown", current_intent_match: "Unknown", reason, evidence: null };
}

function resolveReport(projectRoot, value, directory) {
  const normalized = String(value).replace(/^(?:artifact|file):/, "").replaceAll("\\", "/");
  if (!normalized.startsWith(`${directory}/`) && !normalized.startsWith(`.intentos/${directory}/`)) return null;
  const resolved = resolveAuthoritativeEvidenceReference(projectRoot, "", `file:${normalized}`, { markdownOnly: true });
  return resolved.ok ? resolved.file : null;
}

function relativeRef(projectRoot, file) {
  const realRoot = fs.realpathSync(projectRoot);
  const realFile = fs.realpathSync(file);
  const relative = path.relative(realRoot, realFile).split(path.sep).join("/");
  return relative && !relative.startsWith("../") ? relative : "";
}

function safeRegularFile(file) {
  try { const stat = fs.lstatSync(file); return stat.isFile() && !stat.isSymbolicLink(); } catch { return false; }
}

function safeDirectory(dir) {
  try { const stat = fs.lstatSync(dir); return stat.isDirectory() && !stat.isSymbolicLink(); } catch { return false; }
}

function slug(value) {
  return String(value || "task").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "task";
}

export function digest(value) {
  return `sha256:${crypto.createHash("sha256").update(String(value)).digest("hex")}`;
}
