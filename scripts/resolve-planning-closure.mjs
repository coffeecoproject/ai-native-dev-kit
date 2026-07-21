#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { evidenceDigest, extractMachineReadableEvidence } from "./lib/artifact-schema.mjs";
import { createEvidenceAuthorityBinding } from "./lib/evidence-authority.mjs";
import { validateTaskGovernanceLineage } from "./lib/task-entry-binding.mjs";
import {
  buildExecutionEntryContract,
  derivePlanningState,
  digest,
  findSourceReport,
  requirementMatrix,
  validatePlanningSource,
} from "./lib/planning-closure.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set([
  "json", "intent", "intent-digest", "task-ref", "out", "entry-state",
  "task-governance-report", "business-universe-report", "business-rule-report",
  "impact-report", "verification-plan-report", "plan-review-report",
  "control-effectiveness-report",
]);
const unknown = unknownOptions(args, knownFlags);
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const kitRoot = path.resolve(scriptDir, "..");
const projectRoot = canonicalRoot(path.resolve(process.cwd(), args._[0] || "."));
const intent = String(args.intent || args._.slice(1).join(" ") || "continue the current task").trim();
const outputPath = args.out ? safeOutputPath(String(args.out)) : "";

if (unknown.length > 0) abort(`unknown option: --${unknown.join(", --")}`);
if (args.out && !outputPath) abort("--out must be a project-relative planning-closure-reports/*.md path");

const report = buildReport();
const markdown = renderMarkdown(report);
if (outputPath) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, markdown);
}
process.stdout.write(args.json ? `${JSON.stringify(report, null, 2)}\n` : markdown);

function buildReport() {
  const workQueue = runJson("scripts/resolve-work-queue.mjs", [projectRoot, "--json"]);
  const currentCandidates = workQueue.value?.currentTaskCandidates || [];
  const current = currentCandidates.length === 1 ? currentCandidates[0] : null;
  const preliminaryTaskRef = String(args["task-ref"] || current?.taskRef || "");
  const preliminaryIntentDigest = String(args["intent-digest"] || current?.intentDigest || digest(intent));
  const entryState = String(args["entry-state"] || projectEntryState());
  const entryReady = entryState === "READY_FOR_INTENTOS_OPERATION";
  const taskGovernanceFile = findSourceReport(
    projectRoot,
    "TASK_GOVERNANCE",
    args["task-governance-report"],
    preliminaryTaskRef,
    preliminaryIntentDigest,
  );
  const taskGovernanceIdentity = readTaskGovernanceIdentity(taskGovernanceFile);
  const requestedTaskRef = String(args["task-ref"] || taskGovernanceIdentity.taskRef || preliminaryTaskRef || `task:${slug(intent)}`);
  const requestedIntentDigest = String(args["intent-digest"] || taskGovernanceIdentity.intentDigest || preliminaryIntentDigest);
  const taskGovernance = validatePlanningSource({
    projectRoot,
    sourceKind: "TASK_GOVERNANCE",
    file: taskGovernanceFile,
    taskRef: requestedTaskRef,
    intentDigest: requestedIntentDigest,
    kitRoot,
  });
  const currentTask = resolveCurrentTask({
    current,
    currentTaskCount: currentCandidates.length,
    requestedTaskRef,
    requestedIntentDigest,
    taskGovernanceFile,
    taskGovernanceEvidence: taskGovernance.evidence,
  });
  const matrix = requirementMatrix(taskGovernance.evidence);
  const sourceRows = matrix.map((item) => {
    if (item.required === "No") return {
      source_kind: item.sourceKind,
      required: "No",
      report_ref: "N/A",
      report_digest: "N/A",
      source_state: "NOT_REQUIRED",
      validation_state: "NOT_REQUIRED",
      current_task_match: "N/A",
      current_intent_match: "N/A",
      reason: "Task Governance does not require this source for the current task.",
    };
    const file = findSourceReport(projectRoot, item.sourceKind, explicitSourceArg(item.sourceKind), requestedTaskRef, requestedIntentDigest);
    const validated = validatePlanningSource({ projectRoot, sourceKind: item.sourceKind, file, taskRef: requestedTaskRef, intentDigest: requestedIntentDigest, kitRoot });
    return { ...withoutEvidence(validated), required: "Yes" };
  });
  const state = derivePlanningState({ entryReady, currentTask, taskGovernance, requirements: sourceRows });
  const reportRef = outputPath ? `file:${relative(outputPath)}` : "planning-closure-reports/generated.md";
  const sourceRefs = [taskGovernance.report_ref, ...sourceRows.filter((item) => item.required === "Yes").map((item) => item.report_ref)].filter((ref) => ref.startsWith("file:"));
  const authorityBinding = createEvidenceAuthorityBinding(projectRoot, {
    taskRef: requestedTaskRef,
    intentDigest: requestedIntentDigest,
    sourceRefs,
    fromFile: outputPath,
  });
  const taskImpact = taskGovernance.evidence?.impact_classification?.task_impact || "UNKNOWN";
  const taskGovernanceBinding = {
    source_kind: "TASK_GOVERNANCE",
    ref: taskGovernance.report_ref,
    digest: taskGovernance.report_digest,
    state: taskGovernance.source_state,
    current_task_match: taskGovernance.current_task_match,
  };
  const coreBase = {
    schema_version: "1.111.0",
    artifact_type: "planning_closure",
    report_ref: reportRef,
    report_digest: "",
    closure_core_digest: "",
    task_ref: requestedTaskRef,
    intent_digest: requestedIntentDigest,
    task_impact: taskImpact,
    authority_binding: authorityBinding,
    project_entry: {
      state: entryState,
      ready_for_intentos_operation: entryReady ? "Yes" : "No",
      reason: entryReady ? "Project Entry Trust permits ordinary IntentOS operation." : "Project Entry Trust must be repaired or completed before ordinary planning can close.",
    },
    current_task: currentTask,
    task_governance: taskGovernanceBinding,
    source_requirements: sourceRows,
    first_blocker: withoutOutcome(state.firstBlocker),
    execution_entry_contract: null,
    plain_summary: plainSummary(state.outcome),
    plain_next_step: state.firstBlocker.next_action,
    technical_decision_required_from_user: "No",
    boundaries: boundaries(),
    outcome: state.outcome,
  };
  const closureCoreDigest = evidenceDigest(coreBase, ["report_digest", "closure_core_digest", "execution_entry_contract"]);
  const contract = state.outcome === "PLANNING_READY"
    ? buildExecutionEntryContract({
      authorityBinding,
      sourceGitCommit: currentGitCommit(),
      taskRef: requestedTaskRef,
      intentDigest: requestedIntentDigest,
      taskImpact,
      reportRef,
      closureDigest: closureCoreDigest,
      sources: [{ ...taskGovernanceBinding, required: "Yes", report_ref: taskGovernanceBinding.ref, report_digest: taskGovernanceBinding.digest, source_state: taskGovernanceBinding.state }, ...sourceRows],
    })
    : null;
  const evidenceBase = { ...coreBase, closure_core_digest: closureCoreDigest, execution_entry_contract: contract };
  const structuredEvidence = { ...evidenceBase, report_digest: evidenceDigest(evidenceBase, ["report_digest"]) };
  return {
    reportType: "PLANNING_CLOSURE",
    schemaVersion: "1.111.0",
    generatedBy: "scripts/resolve-planning-closure.mjs",
    generatedAt: new Date().toISOString(),
    projectRoot,
    readOnly: true,
    plainSummary: structuredEvidence.plain_summary,
    plainNextStep: structuredEvidence.plain_next_step,
    blockers: state.blockers.map(withoutOutcome),
    structuredEvidence,
    outcome: structuredEvidence.outcome,
  };
}

function readTaskGovernanceIdentity(file) {
  if (!file) return { taskRef: "", intentDigest: "" };
  try {
    const parsed = extractMachineReadableEvidence(fs.readFileSync(file, "utf8"));
    if (!parsed?.ok || parsed.value?.artifact_type !== "task_governance") return { taskRef: "", intentDigest: "" };
    return {
      taskRef: String(parsed.value.task_ref || ""),
      intentDigest: String(parsed.value.intent_digest || ""),
    };
  } catch {
    return { taskRef: "", intentDigest: "" };
  }
}

function currentGitCommit() {
  const result = spawnSync("git", ["rev-parse", "--verify", "HEAD^{commit}"], { cwd: projectRoot, encoding: "utf8" });
  return result.status === 0 ? result.stdout.trim() : "N/A";
}

function resolveCurrentTask({ current, currentTaskCount, requestedTaskRef, requestedIntentDigest, taskGovernanceFile, taskGovernanceEvidence }) {
  const lineage = taskGovernanceEvidence && taskGovernanceFile
    ? validateTaskGovernanceLineage(projectRoot, taskGovernanceEvidence, {
      fromFile: taskGovernanceFile,
      requireCurrent: true,
    })
    : { ok: false };
  if (lineage.ok) {
    const identity = lineage.workQueue.identity;
    return {
      work_queue_ref: identity.work_queue_item_ref,
      work_queue_item_digest: identity.work_queue_item_digest,
      current_task_count: currentTaskCount,
      task_ref: identity.task_ref,
      intent_digest: identity.intent_digest,
      current_task_match: identity.task_ref === requestedTaskRef && identity.intent_digest === requestedIntentDigest ? "Yes" : "No",
    };
  }
  const currentTaskMatch = current
    ? current.taskRef === requestedTaskRef && (!current.intentDigest || current.intentDigest === requestedIntentDigest) ? "Yes" : "No"
    : "Unknown";
  return {
    work_queue_ref: current?.source || "N/A",
    work_queue_item_digest: current ? digest(JSON.stringify(current)) : "N/A",
    current_task_count: currentTaskCount,
    task_ref: current?.taskRef || "",
    intent_digest: current?.intentDigest || "",
    current_task_match: currentTaskMatch,
  };
}

function projectEntryState() {
  const result = runJson("scripts/workflow-next.mjs", [projectRoot, "--json", "--intent", intent]);
  return result.value?.projectEntryTrust?.entry_state || "PROJECT_ENTRY_UNVERIFIED";
}

function runJson(relativeScript, commandArgs) {
  const script = resolveScript(relativeScript);
  if (!script) return { ok: false, value: null, error: `missing ${relativeScript}` };
  const result = spawnSync(process.execPath, [script, ...commandArgs], { cwd: projectRoot, encoding: "utf8", maxBuffer: 1024 * 1024 * 32 });
  if (result.status !== 0) return { ok: false, value: null, error: String(result.stderr || result.stdout || "source failed").trim() };
  try { return { ok: true, value: JSON.parse(result.stdout), error: "" }; }
  catch { return { ok: false, value: null, error: "source returned invalid JSON" }; }
}

function resolveScript(relativeScript) {
  for (const file of [path.join(projectRoot, relativeScript), path.join(projectRoot, ".intentos", relativeScript), path.join(kitRoot, relativeScript)]) {
    if (safeRegularFile(file)) return file;
  }
  return "";
}

function explicitSourceArg(kind) {
  return {
    BUSINESS_UNIVERSE: args["business-universe-report"],
    BUSINESS_RULE: args["business-rule-report"],
    CHANGE_IMPACT: args["impact-report"],
    VERIFICATION_PLAN: args["verification-plan-report"],
    PLAN_REVIEW: args["plan-review-report"],
    CONTROL_EFFECTIVENESS: args["control-effectiveness-report"],
  }[kind] || "";
}

function renderMarkdown(report) {
  const e = report.structuredEvidence;
  const requiredRows = e.source_requirements.map((item) => `| \`${item.source_kind}\` | \`${item.required}\` | \`${item.validation_state}\` | \`${item.source_state}\` | ${item.reason} |`).join("\n");
  const contract = e.execution_entry_contract
    ? `\`${e.execution_entry_contract.contract_id}\` is available as a non-authorizing handoff. All mutable authority fields remain \`No\`.`
    : "No Execution Entry Contract is emitted for this planning state.";
  return `# Planning Closure Report

## Plain Summary

${e.plain_summary}

## Current Task

- Task ref: \`${e.task_ref}\`
- Intent digest: \`${e.intent_digest}\`
- Task impact: \`${e.task_impact}\`
- Current task match: \`${e.current_task.current_task_match}\`

## Required Planning Sources

| Source | Required | Validation | State | Reason |
|---|---|---|---|---|
${requiredRows}

## First Blocker And Next Step

- Code: \`${e.first_blocker.code}\`
- Responsibility: \`${e.first_blocker.owner_class}\`
- Reason: ${e.first_blocker.summary}
- Next step: ${e.first_blocker.next_action}

## Execution Entry Contract

${contract}

## Boundaries

This report changes no task state and authorizes no implementation, project
write, apply, release, production, or completion claim.

## Machine-Readable Evidence

\`\`\`json
${JSON.stringify(e, null, 2)}
\`\`\`

## Outcome

\`${e.outcome}\`
`;
}

function plainSummary(outcome) {
  const summaries = {
    PLANNING_READY: "Codex has current, reviewed planning evidence for this task. No code was changed by this check; the next layer must revalidate before any write.",
    PLANNING_IN_PROGRESS: "Codex is still completing required technical planning. You do not need to choose a technical approach.",
    PLANNING_INPUT_NEEDED: "Planning is waiting for one business, product, or authoritative external fact that the project cannot prove.",
    PLANNING_DISCOVERY_NEEDED: "Codex needs one bounded technical inspection before the plan can be trusted. No implementation has started.",
    PLANNING_BLOCKED: "Current planning evidence is blocked. Codex will keep the task paused until the named technical or authority condition is resolved.",
    PLANNING_INVALID: "Current planning evidence does not belong to one consistent project, task, intent, or source state. Codex must repair the evidence chain first.",
  };
  return summaries[outcome];
}

function boundaries() {
  return { read_only: "Yes", changes_task_state: "No", authorizes_implementation: "No", authorizes_writes: "No", authorizes_apply: "No", authorizes_release: "No", authorizes_production: "No", proves_completion: "No" };
}

function withoutEvidence(item) {
  const { evidence, ...rest } = item;
  return rest;
}

function withoutOutcome(item) {
  const { outcome, ...rest } = item;
  return rest;
}

function relative(file) {
  return path.relative(projectRoot, file).split(path.sep).join("/");
}

function safeOutputPath(value) {
  const normalized = String(value).replaceAll("\\", "/");
  if (!/^(?:\.intentos\/)?planning-closure-reports\/[a-zA-Z0-9._/-]+\.md$/.test(normalized) || normalized.split("/").includes("..")) return "";
  const file = path.resolve(projectRoot, normalized);
  return file.startsWith(`${projectRoot}${path.sep}`) ? file : "";
}

function safeRegularFile(file) {
  try { const stat = fs.lstatSync(file); return stat.isFile() && !stat.isSymbolicLink(); } catch { return false; }
}

function canonicalRoot(root) {
  try { return fs.realpathSync(root); } catch { abort(`project root does not exist: ${root}`); }
}

function slug(value) {
  return String(value || "task").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "task";
}

function abort(message) {
  console.error(`FAIL ${message}`);
  process.exit(1);
}
