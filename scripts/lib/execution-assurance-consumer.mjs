import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { evidenceDigest, extractMachineReadableEvidence } from "./artifact-schema.mjs";
import {
  isFileEvidenceRef,
  isGovernedWorkflowOutputPath,
  projectIdentity,
  resolveAuthoritativeEvidenceReference,
} from "./evidence-authority.mjs";
import { completionSourceRequirements, validateTaskObligationProjection } from "./task-obligations.mjs";

const kitRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

export function validateExecutionAssuranceForCompletion({
  projectRoot,
  executionAssuranceRef,
  fromFile = "",
  expectedTaskRef = "",
  expectedIntentDigest = "",
} = {}) {
  const ref = String(executionAssuranceRef || "").trim();
  if (!ref) return blocked("MISSING", "Execution Assurance reference is missing.");
  const resolved = resolveAuthoritativeEvidenceReference(projectRoot, fromFile, ref, { markdownOnly: true });
  if (!resolved.ok) return blocked("INVALID", `Execution Assurance reference is unsafe or unresolved: ${resolved.error}`);
  const extracted = extractMachineReadableEvidence(fs.readFileSync(resolved.file, "utf8"));
  if (!extracted?.ok) return blocked("INVALID", "Execution Assurance has invalid Machine-Readable Evidence.");
  const evidence = extracted.value;
  const errors = [];
  if (expectedTaskRef && evidence.task_ref !== expectedTaskRef) errors.push(`task mismatch: expected ${expectedTaskRef}, observed ${evidence.task_ref || "<empty>"}`);
  if (expectedIntentDigest && evidence.intent_digest !== expectedIntentDigest) errors.push("intent digest does not match the current completion intent");
  const taskAuthority = resolveCompletionRequirements({
    projectRoot,
    executionAssurance: evidence,
    fromFile: resolved.file,
    expectedTaskRef,
    expectedIntentDigest,
  });
  errors.push(...taskAuthority.errors);
  errors.push(...validateDoneCapableExecutionAssurance(evidence, taskAuthority.requirements));

  const checkerArgs = [
    path.join(kitRoot, "scripts/check-execution-assurance.mjs"),
    projectRoot,
    "--report", resolved.relativePath,
    "--require-structured-evidence",
    "--require-evidence-refs",
    "--require-review",
    "--require-actual-diff",
    "--require-precise-evidence",
    "--require-task-governance",
    "--require-work-queue",
    "--strict-task-consumer",
    "--require-evidence-authority",
    "--json",
  ];
  if (evidence.plan_review_binding?.required === "Yes") checkerArgs.push("--require-plan-review");
  checkerArgs.push("--require-planning-closure");
  if (evidence.runtime_trust_binding?.requirement === "REQUIRED") checkerArgs.push("--require-runtime-trust");
  const assuranceCheck = spawnSync(process.execPath, checkerArgs, {
    cwd: projectRoot,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
  if (assuranceCheck.status !== 0) errors.push(`authoritative Execution Assurance checker failed: ${firstLine(assuranceCheck.stderr || assuranceCheck.stdout)}`);

  const testSource = (evidence.source_systems || []).find((item) => item.name === "test_evidence" && item.status === "RECORDED");
  const testRef = String(testSource?.source_system_ref || testSource?.ref || "");
  if (taskAuthority.requirements.test_evidence && !testRef) {
    errors.push("Execution Assurance does not bind a recorded Test Evidence source");
  } else if (testRef) {
    const resolvedTest = resolveAuthoritativeEvidenceReference(projectRoot, resolved.file, testRef, { markdownOnly: true });
    if (!resolvedTest.ok) {
      errors.push(`Test Evidence reference is unsafe or unresolved: ${resolvedTest.error}`);
    } else {
      const testExtracted = extractMachineReadableEvidence(fs.readFileSync(resolvedTest.file, "utf8"));
      if (!testExtracted?.ok || testExtracted.value?.test_evidence_state !== "TEST_EVIDENCE_COMPLETE") {
        errors.push(`Test Evidence must be TEST_EVIDENCE_COMPLETE, observed ${testExtracted?.value?.test_evidence_state || "<invalid>"}`);
      }
      const testArgs = [
        path.join(kitRoot, "scripts/check-test-evidence.mjs"),
        projectRoot,
        "--report", resolvedTest.relativePath,
        "--require-report",
        "--require-structured-evidence",
        "--require-verification-plan-ref",
        "--strict-source-binding",
        "--require-current-evidence",
        "--require-test-quality-controls",
        "--require-evidence-authority",
        "--json",
      ];
      if (evidence.runtime_trust_binding?.requirement === "REQUIRED") testArgs.push("--require-runtime-trust");
      const testCheck = spawnSync(process.execPath, testArgs, {
        cwd: projectRoot,
        encoding: "utf8",
        maxBuffer: 32 * 1024 * 1024,
      });
      if (testCheck.status !== 0) errors.push(`authoritative Test Evidence checker failed: ${firstLine(testCheck.stderr || testCheck.stdout)}`);
    }
  }

  return {
    ok: errors.length === 0,
    outcome: errors.length === 0 ? "READY" : "BLOCKED",
    errors,
    evidence,
    reportRef: `artifact:${resolved.relativePath}`,
    requirements: taskAuthority.requirements,
  };
}

export function resolvePlanningClosureForExecution({
  projectRoot,
  explicitRef = "",
  fromFile = "",
  expectedTaskRef = "",
  expectedIntentDigest = "",
  expectedCandidateBaseRevision = "",
} = {}) {
  const candidate = resolveCurrentPlanningClosure({
    projectRoot,
    explicitRef,
    fromFile,
    expectedTaskRef,
    expectedIntentDigest,
  });
  if (!candidate) {
    return {
      ok: false,
      errors: ["Current-task Planning Closure evidence is missing."],
      binding: blockedPlanningClosureBinding(expectedTaskRef, expectedIntentDigest, "Current-task Planning Closure evidence is missing."),
      evidence: null,
      file: "",
    };
  }
  const { resolved, evidence } = candidate;
  const errors = [];
  if (evidence.artifact_type !== "planning_closure") errors.push("Planning Closure artifact_type is invalid.");
  if (evidence.task_ref !== expectedTaskRef) errors.push("Planning Closure task_ref does not match the current task.");
  if (evidence.intent_digest !== expectedIntentDigest) errors.push("Planning Closure intent_digest does not match the current intent.");
  if (evidence.outcome !== "PLANNING_READY") errors.push(`Planning Closure is ${evidence.outcome || "<missing>"}, not PLANNING_READY.`);
  const contract = evidence.execution_entry_contract;
  if (!contract) errors.push("Planning Closure does not contain an Execution Entry Contract.");
  else {
    if (contract.task_ref !== expectedTaskRef) errors.push("Execution Entry Contract task_ref does not match the current task.");
    if (contract.intent_digest !== expectedIntentDigest) errors.push("Execution Entry Contract intent_digest does not match the current intent.");
    if (contract.planning_closure_digest !== evidence.closure_core_digest) errors.push("Execution Entry Contract does not bind the exact Planning Closure core digest.");
    for (const field of ["authorizes_implementation", "authorizes_project_writes", "authorizes_apply", "authorizes_release", "authorizes_production"]) {
      if (contract[field] !== "No") errors.push(`Execution Entry Contract ${field} must remain No.`);
    }
    if (contract.requires_pre_write_revalidation !== "Yes") errors.push("Execution Entry Contract requires_pre_write_revalidation must be Yes.");
    if (expectedCandidateBaseRevision && contract.source_git_commit !== expectedCandidateBaseRevision) {
      errors.push("Execution Entry Contract source Git commit does not match the actual candidate diff base revision.");
    }
  }
  const reportCheck = runPlanningChecker("scripts/check-planning-closure.mjs", [
    projectRoot,
    "--report", resolved.relativePath,
    "--require-report",
    "--require-structured-evidence",
    "--require-ready",
    "--task-ref", expectedTaskRef,
    "--intent-digest", expectedIntentDigest,
    "--post-write-consumer",
  ], projectRoot);
  if (!reportCheck.ok) errors.push(`authoritative Planning Closure checker failed: ${reportCheck.reason}`);
  const contractCheck = runPlanningChecker("scripts/check-execution-entry-contract.mjs", [
    projectRoot,
    "--report", resolved.relativePath,
    "--require-contract",
    "--task-ref", expectedTaskRef,
    "--intent-digest", expectedIntentDigest,
    "--post-write-consumer",
  ], projectRoot);
  if (!contractCheck.ok) errors.push(`authoritative Execution Entry Contract checker failed: ${contractCheck.reason}`);
  const ok = errors.length === 0;
  return {
    ok,
    errors,
    evidence,
    file: resolved.file,
    binding: {
      requirement: "REQUIRED",
      status: ok ? "VERIFIED" : "BLOCKED",
      planning_closure_ref: `artifact:${resolved.relativePath}`,
      planning_closure_report_digest: String(evidence.report_digest || "N/A"),
      planning_closure_core_digest: String(evidence.closure_core_digest || "N/A"),
      planning_closure_outcome: String(evidence.outcome || "PLANNING_INVALID"),
      task_ref: String(evidence.task_ref || expectedTaskRef || "N/A"),
      intent_digest: String(evidence.intent_digest || expectedIntentDigest || "N/A"),
      current_project_match: reportCheck.ok ? "Yes" : "No",
      current_task_match: evidence.task_ref === expectedTaskRef ? "Yes" : "No",
      current_intent_match: evidence.intent_digest === expectedIntentDigest ? "Yes" : "No",
      execution_entry_contract_digest: String(contract?.contract_digest || "N/A"),
      contract_non_authorizing: contract && ["authorizes_implementation", "authorizes_project_writes", "authorizes_apply", "authorizes_release", "authorizes_production"].every((field) => contract[field] === "No") ? "Yes" : "No",
      requires_pre_write_revalidation: contract?.requires_pre_write_revalidation === "Yes" ? "Yes" : "No",
      checker: "scripts/check-planning-closure.mjs --require-ready + scripts/check-execution-entry-contract.mjs --require-contract",
      reason: ok ? "The exact current-task Planning Closure and non-authorizing Execution Entry Contract passed their authoritative checkers." : errors.join(" "),
    },
  };
}

export function executionPathSetDigest(paths = []) {
  return evidenceDigest({ paths: [...new Set(paths.map((item) => String(item || "").trim()).filter(Boolean))].sort() });
}

export function derivePreWriteRevalidation({ projectRoot, planningClosure, actualDiff, plannedTargetPaths = [] } = {}) {
  const contract = planningClosure?.evidence?.execution_entry_contract || null;
  const current = projectIdentity(projectRoot);
  const verified = planningClosure?.ok === true
    && planningClosure?.binding?.status === "VERIFIED"
    && contract?.requires_pre_write_revalidation === "Yes"
    && contract?.source_revision_digest === planningClosure?.evidence?.authority_binding?.project?.revision
    && (!actualDiff?.base_revision || contract?.source_git_commit === actualDiff.base_revision);
  return {
    status: verified ? "VERIFIED" : "BLOCKED",
    checked_at: new Date().toISOString(),
    project_identity: current,
    planning_closure_ref: String(planningClosure?.binding?.planning_closure_ref || "N/A"),
    planning_closure_core_digest: String(planningClosure?.binding?.planning_closure_core_digest || "N/A"),
    execution_entry_contract_digest: String(planningClosure?.binding?.execution_entry_contract_digest || "N/A"),
    source_revision_digest: String(contract?.source_revision_digest || "N/A"),
    source_git_commit: String(contract?.source_git_commit || "N/A"),
    candidate_base_revision: String(actualDiff?.base_revision || "N/A"),
    planned_target_paths_digest: executionPathSetDigest(plannedTargetPaths),
    actual_changed_paths_digest: executionPathSetDigest(actualDiff?.changed_files || []),
    result: verified ? "PRE_WRITE_SNAPSHOT_REPLAYED" : "BLOCKED",
    reason: verified
      ? "The immutable Planning Closure source snapshot, Execution Entry Contract, candidate base, current project identity, planned target set, and observed changed-path set were replayed without widening authority."
      : planningClosure?.errors?.join(" ") || "The pre-write planning snapshot could not be replayed against the current candidate.",
  };
}

export function validatePreWriteRevalidation({ projectRoot, evidence, fromFile = "" } = {}) {
  const recorded = evidence?.pre_write_revalidation;
  if (!recorded) return { ok: false, errors: ["Execution Assurance lacks structured pre-write revalidation evidence."] };
  const planningClosure = resolvePlanningClosureForExecution({
    projectRoot,
    explicitRef: evidence?.planning_closure_binding?.planning_closure_ref,
    fromFile,
    expectedTaskRef: evidence?.task_ref,
    expectedIntentDigest: evidence?.intent_digest,
    expectedCandidateBaseRevision: evidence?.actual_diff?.base_revision,
  });
  const expected = derivePreWriteRevalidation({
    projectRoot,
    planningClosure,
    actualDiff: evidence?.actual_diff,
    plannedTargetPaths: evidence?.execution_plan?.planned_target_paths || [],
  });
  const errors = [];
  const checkedAt = Date.parse(recorded.checked_at || "");
  if (!Number.isFinite(checkedAt) || checkedAt > Date.now() + 60_000) errors.push("pre-write revalidation checked_at must be a valid non-future timestamp");
  for (const field of [
    "status", "planning_closure_ref", "planning_closure_core_digest", "execution_entry_contract_digest",
    "source_revision_digest", "source_git_commit", "candidate_base_revision", "planned_target_paths_digest",
    "actual_changed_paths_digest", "result",
  ]) {
    if (recorded[field] !== expected[field]) errors.push(`pre-write revalidation ${field} does not match the replayed current candidate`);
  }
  if (JSON.stringify(recorded.project_identity) !== JSON.stringify(expected.project_identity)) {
    errors.push("pre-write revalidation project_identity does not match the current project identity");
  }
  if (evidence?.assurance_state === "VERIFIED_DONE" && (recorded.status !== "VERIFIED" || recorded.result !== "PRE_WRITE_SNAPSHOT_REPLAYED")) {
    errors.push("VERIFIED_DONE requires a replayed pre-write Planning Closure snapshot");
  }
  return { ok: errors.length === 0, errors };
}

export function validatePlanningClosureBindingForExecution({
  projectRoot,
  binding,
  fromFile = "",
  expectedTaskRef = "",
  expectedIntentDigest = "",
  expectedCandidateBaseRevision = "",
} = {}) {
  if (!binding || binding.requirement !== "REQUIRED") {
    return { ok: false, errors: ["Execution Assurance does not require Planning Closure authority."] };
  }
  const resolved = resolvePlanningClosureForExecution({
    projectRoot,
    explicitRef: binding.planning_closure_ref,
    fromFile,
    expectedTaskRef,
    expectedIntentDigest,
    expectedCandidateBaseRevision,
  });
  const fields = [
    "status",
    "planning_closure_ref",
    "planning_closure_report_digest",
    "planning_closure_core_digest",
    "planning_closure_outcome",
    "task_ref",
    "intent_digest",
    "current_project_match",
    "current_task_match",
    "current_intent_match",
    "execution_entry_contract_digest",
    "contract_non_authorizing",
    "requires_pre_write_revalidation",
    "checker",
  ];
  const errors = [...resolved.errors];
  for (const field of fields) {
    if (binding[field] !== resolved.binding[field]) errors.push(`Planning Closure binding ${field} does not match authoritative evidence.`);
  }
  if (binding.status !== "VERIFIED") errors.push("Planning Closure binding must be VERIFIED before completion.");
  return { ok: errors.length === 0, errors, resolved };
}

export function resolveCompletionRequirements({
  projectRoot,
  executionAssurance,
  fromFile = "",
  expectedTaskRef = "",
  expectedIntentDigest = "",
} = {}) {
  const fallback = {
    business_rule_closure: true,
    verification_plan: true,
    test_evidence: true,
    execution_assurance: true,
  };
  const errors = [];
  const binding = executionAssurance?.task_entry_binding;
  const ref = String(binding?.task_governance_ref || "").trim();
  if (!ref || ref === "N/A") {
    return { ok: false, requirements: fallback, taskGovernance: null, errors: ["Execution Assurance does not bind Task Governance authority."] };
  }
  const resolved = resolveAuthoritativeEvidenceReference(projectRoot, fromFile, ref, { markdownOnly: true });
  if (!resolved.ok) {
    return { ok: false, requirements: fallback, taskGovernance: null, errors: [`Task Governance reference is unsafe or unresolved: ${resolved.error}`] };
  }
  const extracted = extractMachineReadableEvidence(fs.readFileSync(resolved.file, "utf8"));
  if (!extracted?.ok || extracted.value?.artifact_type !== "task_governance") {
    return { ok: false, requirements: fallback, taskGovernance: null, errors: ["Task Governance authority has invalid Machine-Readable Evidence."] };
  }
  const governance = extracted.value;
  const expectedGovernanceDigest = evidenceDigest(governance, ["task_governance_digest"]);
  if (governance.task_governance_digest !== expectedGovernanceDigest) errors.push("Task Governance evidence digest is invalid.");
  if (binding.task_governance_digest !== governance.task_governance_digest) errors.push("Task Governance binding digest does not match the referenced report.");
  if (binding.task_governance_task_match !== "Yes") errors.push("Task Governance binding does not claim a current-task match.");
  if (expectedTaskRef && governance.task_ref !== expectedTaskRef) errors.push(`Task Governance task mismatch: expected ${expectedTaskRef}, observed ${governance.task_ref || "<empty>"}.`);
  if (executionAssurance?.task_ref && governance.task_ref !== executionAssurance.task_ref) errors.push("Task Governance task_ref does not match Execution Assurance.");
  if (expectedIntentDigest && governance.intent_digest !== expectedIntentDigest) errors.push("Task Governance intent digest does not match the current completion intent.");
  if (executionAssurance?.intent_digest && governance.intent_digest !== executionAssurance.intent_digest) errors.push("Task Governance intent digest does not match Execution Assurance.");
  const projection = validateTaskObligationProjection(governance);
  if (!projection.ok) errors.push(`Task Governance weakens minimum task obligations: ${projection.missing.join(", ")}.`);
  if (binding.task_governance_blocks_completion === "Yes") errors.push("Task Governance explicitly blocks completion.");
  if ((binding.unresolved_task_governance_blockers || []).length > 0) errors.push("Task Governance has unresolved completion blockers.");
  return {
    ok: errors.length === 0,
    requirements: completionSourceRequirements(governance),
    taskGovernance: governance,
    reportRef: `artifact:${resolved.relativePath}`,
    errors,
  };
}

export function validateDoneCapableExecutionAssurance(evidence, requirements = {}) {
  const errors = [];
  if (evidence?.assurance_state !== "VERIFIED_DONE" || evidence?.can_claim_done !== "Yes") {
    errors.push(`Execution Assurance state ${evidence?.assurance_state || "<missing>"} cannot support completion`);
  }
  if ((evidence?.pending_human_decisions || []).length > 0) {
    errors.push("Execution Assurance cannot claim done while business facts or real-world consent remain pending.");
  }
  const testSource = (evidence?.source_systems || []).find((item) => item.name === "test_evidence");
  if (requirements.test_evidence && (!testSource || testSource.status !== "RECORDED")) {
    errors.push("Task Governance requires recorded Test Evidence before completion.");
  }
  if (testSource?.status === "RECORDED" && testSource.source_outcome !== "TEST_EVIDENCE_COMPLETE") {
    errors.push(`Recorded Test Evidence must be TEST_EVIDENCE_COMPLETE, observed ${testSource.source_outcome || "<missing>"}.`);
  }
  if (evidence?.actual_diff?.target_diff_status !== "MATCHED_PLAN") {
    errors.push(`VERIFIED_DONE requires actual diff to match the reviewed plan, observed ${evidence?.actual_diff?.target_diff_status || "<missing>"}.`);
  }
  const planReview = evidence?.plan_review_binding;
  const expectedPlanState = evidence?.task_entry_binding?.task_governance_tier === "LOW"
    ? "NO_PLAN_REQUIRED"
    : "PLAN_REVIEW_PASSED";
  if (!planReview
    || planReview.plan_review_state !== expectedPlanState
    || planReview.current_task_match !== "Yes"
    || !isFileEvidenceRef(planReview.plan_review_ref)) {
    errors.push(`VERIFIED_DONE requires exact current-task Plan Review state ${expectedPlanState}.`);
  }
  const reviewRefs = evidence?.review?.review_refs || [];
  if (!planReview || reviewRefs.length !== 1 || normalizeRef(reviewRefs[0]) !== normalizeRef(planReview.plan_review_ref)) {
    errors.push("VERIFIED_DONE review closure must use the exact current-task Plan Review, not free-form review text.");
  }
  const criteria = evidence?.completion_contract?.criteria || [];
  const bindings = evidence?.evidence_bindings || [];
  const planning = evidence?.planning_closure_binding;
  if (!planning
    || planning.requirement !== "REQUIRED"
    || planning.status !== "VERIFIED"
    || planning.planning_closure_outcome !== "PLANNING_READY"
    || planning.current_project_match !== "Yes"
    || planning.current_task_match !== "Yes"
    || planning.current_intent_match !== "Yes"
    || planning.contract_non_authorizing !== "Yes"
    || planning.requires_pre_write_revalidation !== "Yes"
    || !isFileEvidenceRef(planning.planning_closure_ref)) {
    errors.push("VERIFIED_DONE requires the exact current-task PLANNING_READY closure and non-authorizing Execution Entry Contract.");
  }
  if (planning && !bindings.some((item) => normalizeRef(item.evidence_ref) === normalizeRef(planning.planning_closure_ref)
    && item.resolved === "Yes" && item.current_task_match === "Yes")) {
    errors.push("Execution Assurance lacks a resolved current-task Planning Closure evidence binding.");
  }
  if (evidence?.pre_write_revalidation?.status !== "VERIFIED"
    || evidence?.pre_write_revalidation?.result !== "PRE_WRITE_SNAPSHOT_REPLAYED") {
    errors.push("VERIFIED_DONE requires structured replay of the exact pre-write Planning Closure snapshot.");
  }
  if (requirements.test_evidence) {
    const testRef = String(testSource?.source_system_ref || testSource?.ref || "");
    if (!testRef || criteria.some((item) => item.status === "DONE"
      && !(item.evidence_refs || []).some((ref) => normalizeRef(ref) === normalizeRef(testRef)))) {
      errors.push("Every completed criterion must bind the exact current-task Test Evidence required by Task Governance.");
    }
    if (!bindings.some((item) => normalizeRef(item.evidence_ref) === normalizeRef(testRef)
      && item.resolved === "Yes" && item.current_task_match === "Yes")) {
      errors.push("Execution Assurance lacks a resolved current-task binding to required Test Evidence.");
    }
  } else if (planReview) {
    const planRef = planReview.plan_review_ref;
    if (criteria.some((item) => item.status === "DONE"
      && !(item.evidence_refs || []).some((ref) => normalizeRef(ref) === normalizeRef(planRef)))) {
      errors.push("LOW completion criteria must bind the exact NO_PLAN_REQUIRED Plan Review decision.");
    }
    if (!bindings.some((item) => normalizeRef(item.evidence_ref) === normalizeRef(planRef)
      && item.resolved === "Yes" && item.current_task_match === "Yes")) {
      errors.push("LOW Execution Assurance lacks a resolved current-task Plan Review binding.");
    }
  }
  return errors;
}

function resolveCurrentPlanningClosure({ projectRoot, explicitRef, fromFile, expectedTaskRef, expectedIntentDigest }) {
  const refs = explicitRef ? [explicitRef] : planningClosureCandidateRefs(projectRoot, expectedTaskRef, expectedIntentDigest);
  for (const ref of refs) {
    const resolved = resolveAuthoritativeEvidenceReference(projectRoot, fromFile, ref, { markdownOnly: true });
    if (!resolved.ok) continue;
    const extracted = extractMachineReadableEvidence(fs.readFileSync(resolved.file, "utf8"));
    if (!extracted?.ok || extracted.value?.artifact_type !== "planning_closure") continue;
    if (!explicitRef && (extracted.value.task_ref !== expectedTaskRef || extracted.value.intent_digest !== expectedIntentDigest)) continue;
    return { resolved, evidence: extracted.value };
  }
  return null;
}

function planningClosureCandidateRefs(projectRoot, taskRef, intentDigest) {
  const candidates = [];
  for (const directory of ["planning-closure-reports", ".intentos/planning-closure-reports"]) {
    const root = path.join(projectRoot, directory);
    let entries;
    try {
      const stat = fs.lstatSync(root);
      if (!stat.isDirectory() || stat.isSymbolicLink()) continue;
      entries = fs.readdirSync(root, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
      const file = path.join(root, entry.name);
      let stat;
      try {
        stat = fs.lstatSync(file);
        if (!stat.isFile() || stat.isSymbolicLink()) continue;
      } catch {
        continue;
      }
      const extracted = extractMachineReadableEvidence(fs.readFileSync(file, "utf8"));
      if (!extracted?.ok || extracted.value?.artifact_type !== "planning_closure") continue;
      const exact = extracted.value.task_ref === taskRef && extracted.value.intent_digest === intentDigest;
      candidates.push({ ref: `artifact:${directory}/${entry.name}`, exact, mtime: stat.mtimeMs });
    }
  }
  return candidates
    .sort((a, b) => Number(b.exact) - Number(a.exact) || b.mtime - a.mtime)
    .map((item) => item.ref);
}

function runPlanningChecker(relativeScript, args, cwd) {
  const script = path.join(kitRoot, relativeScript);
  if (!fs.existsSync(script)) return { ok: false, reason: `required checker is missing: ${relativeScript}` };
  const result = spawnSync(process.execPath, [script, ...args], {
    cwd,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
  return { ok: result.status === 0, reason: result.status === 0 ? "checker passed" : firstLine(result.stderr || result.stdout) };
}

function blockedPlanningClosureBinding(taskRef, intentDigest, reason) {
  return {
    requirement: "REQUIRED",
    status: "BLOCKED",
    planning_closure_ref: "N/A",
    planning_closure_report_digest: "N/A",
    planning_closure_core_digest: "N/A",
    planning_closure_outcome: "PLANNING_INVALID",
    task_ref: taskRef || "N/A",
    intent_digest: intentDigest || "N/A",
    current_project_match: "No",
    current_task_match: "No",
    current_intent_match: "No",
    execution_entry_contract_digest: "N/A",
    contract_non_authorizing: "No",
    requires_pre_write_revalidation: "No",
    checker: "scripts/check-planning-closure.mjs --require-ready + scripts/check-execution-entry-contract.mjs --require-contract",
    reason,
  };
}

function normalizeRef(value) {
  return String(value || "").trim().replace(/^(artifact|file):/, "");
}

export function collectGitChangedFiles(projectRoot, diffSource = "git:working-tree", options = {}) {
  const root = path.resolve(projectRoot);
  const source = String(diffSource || "");
  const gitRoot = spawnSync("git", ["rev-parse", "--show-toplevel"], { cwd: root, encoding: "utf8" });
  if (gitRoot.status !== 0) return { ok: false, files: [], reason: "project is not a readable Git worktree" };
  let trackedArgs;
  if (source === "git:working-tree") trackedArgs = ["diff", "--name-only", "HEAD"];
  else if (source === "git:cached") trackedArgs = ["diff", "--cached", "--name-only"];
  else if (source.startsWith("git:") && source.slice(4).trim()) trackedArgs = ["diff", "--name-only", source.slice(4).trim()];
  else return { ok: false, files: [], reason: `unsupported diff source ${source || "<missing>"}` };
  let tracked = spawnSync("git", trackedArgs, { cwd: root, encoding: "utf8" });
  const untracked = source === "git:working-tree"
    ? spawnSync("git", ["ls-files", "--others", "--exclude-standard"], { cwd: root, encoding: "utf8" })
    : { status: 0, stdout: "", stderr: "" };
  const emptyCandidate = tracked.status === 0 && !tracked.stdout.trim() && !untracked.stdout.trim();
  if ((source === "git:cached" || source === "git:working-tree") && emptyCandidate && options.baseRevision) {
    const replay = replayCommittedCandidate(root, options.baseRevision);
    if (!replay.ok) return replay;
    tracked = { status: 0, stdout: replay.stdout, stderr: "" };
  }
  if (tracked.status !== 0 || untracked.status !== 0) {
    return { ok: false, files: [], reason: firstLine(tracked.stderr || untracked.stderr || "Git diff read failed") };
  }
  const files = [...new Set(`${tracked.stdout}\n${untracked.stdout || ""}`
    .split(/\r?\n/)
    .map((item) => item.trim().replaceAll("\\", "/"))
    .filter((item) => item && !isGovernedWorkflowOutputPath(item)))].sort();
  return { ok: true, files, reason: "" };
}

export function implementationCoverageOmissions(plannedChangedFiles = [], closureChangedFiles = []) {
  const implementationFiles = (files) => [...new Set(files
    .map(normalizeProjectPath)
    .filter(Boolean)
    .filter((file) => !isGovernedWorkflowOutputPath(file)))].sort();
  const planned = implementationFiles(Array.isArray(plannedChangedFiles) ? plannedChangedFiles : []);
  const closure = new Set(implementationFiles(Array.isArray(closureChangedFiles) ? closureChangedFiles : []));
  return planned.filter((file) => !closure.has(file));
}

function replayCommittedCandidate(root, baseRevision) {
  const base = String(baseRevision || "").trim();
  if (!/^[a-f0-9]{40,64}$/.test(base)) {
    return { ok: false, files: [], reason: "clean-checkout candidate replay requires an exact base revision" };
  }
  const status = spawnSync("git", ["status", "--porcelain=v1", "--untracked-files=all"], { cwd: root, encoding: "utf8" });
  if (status.status !== 0 || status.stdout.trim()) {
    return { ok: false, files: [], reason: "clean-checkout candidate replay requires a completely clean worktree" };
  }
  const resolvedBase = spawnSync("git", ["rev-parse", "--verify", `${base}^{commit}`], { cwd: root, encoding: "utf8" });
  const head = spawnSync("git", ["rev-parse", "--verify", "HEAD^{commit}"], { cwd: root, encoding: "utf8" });
  if (resolvedBase.status !== 0 || head.status !== 0 || resolvedBase.stdout.trim() !== base) {
    return { ok: false, files: [], reason: "clean-checkout candidate replay base revision is unavailable or ambiguous" };
  }
  if (head.stdout.trim() === base) {
    return { ok: false, files: [], reason: "clean-checkout candidate replay has no committed candidate after the recorded base revision" };
  }
  const ancestor = spawnSync("git", ["merge-base", "--is-ancestor", base, "HEAD"], { cwd: root, encoding: "utf8" });
  if (ancestor.status !== 0) {
    return { ok: false, files: [], reason: "clean-checkout candidate replay base revision is not an ancestor of HEAD" };
  }
  const diff = spawnSync("git", ["diff", "--name-only", `${base}..HEAD`], { cwd: root, encoding: "utf8" });
  if (diff.status !== 0) {
    return { ok: false, files: [], reason: firstLine(diff.stderr || "committed candidate diff read failed") };
  }
  return { ok: true, files: [], stdout: diff.stdout, reason: "" };
}

export function classifyUnexpectedExecutionFiles(changedFiles = [], plannedTargetPaths = []) {
  const planned = new Set(plannedTargetPaths.map(normalizeProjectPath));
  return changedFiles
    .map(normalizeProjectPath)
    .filter(Boolean)
    .filter((file) => {
      if (/(^|\/)\.DS_Store$|(^|\/)(\.env|secrets?|local-secrets)|\.tmp$/i.test(file)) return true;
      if (!/\.log$/i.test(file)) return false;
      if (isGovernedExecutionLog(file)) return false;
      return !planned.has(file);
    });
}

export function isGovernedExecutionRuntimeOutput(file) {
  return /(^|\/)(?:\.intentos\/|evidence\/)runtime-runs\/vrun-[a-z0-9-]+\//i.test(normalizeProjectPath(file));
}

function isGovernedExecutionLog(file) {
  return /(^|\/)evidence\/[^/]+\.log$/i.test(file)
    || /(^|\/)(?:\.intentos\/|evidence\/)runtime-runs\/vrun-[a-z0-9-]+\/outputs\/[a-zA-Z0-9:_-]+\.log$/i.test(file);
}

function normalizeProjectPath(value) {
  return String(value || "").trim().replaceAll("\\", "/").replace(/^\.\//, "");
}

export function validateActualDiffAuthority(projectRoot, evidence, { required = false } = {}) {
  const errors = [];
  const diff = evidence?.actual_diff || {};
  if (!required && evidence?.assurance_state !== "VERIFIED_DONE") return { ok: true, observedFiles: [], errors };
  const observed = collectGitChangedFiles(projectRoot, diff.diff_source, {
    baseRevision: diff.base_revision,
  });
  if (!observed.ok) return { ok: false, observedFiles: [], errors: [observed.reason] };
  const declared = [...new Set((diff.changed_files || []).map((item) => String(item).replaceAll("\\", "/")))].sort();
  if (evidence?.execution_kind === "FEATURE_IMPLEMENTATION" && declared.length === 0) {
    errors.push("FEATURE_IMPLEMENTATION requires a non-empty actual diff.");
  }
  if (declared.length !== observed.files.length || declared.some((item, index) => item !== observed.files[index])) {
    errors.push(`actual_diff.changed_files does not match the current Git worktree; declared [${declared.join(", ")}], observed [${observed.files.join(", ")}].`);
  }
  return { ok: errors.length === 0, observedFiles: observed.files, errors };
}

function blocked(outcome, reason) {
  return { ok: false, outcome, errors: [reason], evidence: null, reportRef: "" };
}

function firstLine(value) {
  return String(value || "checker failed").trim().split("\n").find(Boolean) || "checker failed";
}
