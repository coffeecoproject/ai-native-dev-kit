#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { containsSecretLikeValue } from "./lib/risk-surfaces.mjs";
import { sectionBody, splitMarkdownRow, stripMarkdown } from "./lib/markdown.mjs";
import { loadSchema, validateEvidenceBlock } from "./lib/artifact-schema.mjs";
import { evaluateVerifiedAdoptionApplyChain } from "./lib/adoption-apply-chain.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["json", "require-structured-evidence", "require-simulation", "report", "allow-empty"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputJson = Boolean(args.json);
const requireStructuredEvidence = Boolean(args["require-structured-evidence"]);
const requireSimulation = Boolean(args["require-simulation"]);
const allowEmpty = Boolean(args["allow-empty"]);
const explicitReport = args.report ? path.resolve(process.cwd(), String(args.report)) : "";
const isSourceRepo = fs.existsSync(path.join(projectRoot, "intentos-manifest.json"))
  && fs.existsSync(path.join(projectRoot, "core", "workflow.md"));
const shouldRequireAssets = isSourceRepo
  || fs.existsSync(path.join(projectRoot, ".intentos", "intentos-manifest.json"))
  || fs.existsSync(path.join(projectRoot, ".intentos", "version.json"));
const adoptionSchema = loadSchema(projectRoot, "schemas/artifacts/adoption-assurance.schema.json");
const applyPlanSchema = loadSchema(projectRoot, "schemas/artifacts/unified-apply-plan.schema.json");
const approvalRecordSchema = loadSchema(projectRoot, "schemas/artifacts/approval-record.schema.json");
const applyReadinessSchema = loadSchema(projectRoot, "schemas/artifacts/controlled-apply-readiness.schema.json");
const applyReceiptSchema = loadSchema(projectRoot, "schemas/artifacts/apply-execution-receipt.schema.json");

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

const requiredAssets = [
  "core/adoption-execution-assurance.md",
  "docs/adoption-execution-assurance.md",
  "templates/adoption-assurance-report.md",
  "schemas/artifacts/adoption-assurance.schema.json",
  "checklists/adoption-assurance-review.md",
  "prompts/adoption-assurance-agent.md",
  "scripts/resolve-adoption-assurance.mjs",
  "scripts/check-adoption-assurance.mjs",
];
const requiredDirectories = ["adoption-assurance-reports"];
const requiredSections = [
  "Adoption Summary",
  "Assurance State",
  "Target Project State",
  "Adoption Surface Coverage",
  "Evidence Resolution",
  "Actual Diff / File State Check",
  "Existing Rule Coverage",
  "Governance Convergence Coverage",
  "Simulation Task Result",
  "Pending Human Decisions",
  "Forbidden Claims",
];
const allowedStates = new Set([
  "NOT_ADOPTED",
  "READ_ONLY_DIAGNOSIS_ONLY",
  "PLAN_READY",
  "APPLY_READY",
  "APPLIED_PENDING_VERIFICATION",
  "PARTIAL_ADOPTION",
  "VERIFIED_ACTIVE",
  "BLOCKED_BY_DIRTY_WORKTREE",
  "BLOCKED_BY_PROJECT_AUTHORITY",
  "BLOCKED_BY_UPSTREAM_EVIDENCE",
  "FAILED_ASSURANCE",
]);
const allowedSurfaceStatuses = new Set([
  "VERIFIED",
  "MAPPED",
  "PROJECT_OWNED",
  "PENDING_APPLY",
  "PENDING_HUMAN_DECISION",
  "BLOCKED",
  "MISSING",
  "PRESENT_UNVERIFIED",
  "NOT_APPLICABLE_WITH_REASON",
]);
const requiredSurfaces = new Set([
  "workflow_entry",
  "ai_rules_agents",
  "engineering_baseline",
  "environment_baseline",
  "release_rollback",
  "ci_hooks",
  "documents",
  "work_queue",
  "ai_logs_audit",
  "risk_authority",
  "apply_chain",
  "simulation_task",
]);
const fullAdoptionClaimPatterns = [
  /\bhas fully adopted\b/i,
  /\bis fully adopted\b/i,
];
const absoluteForbiddenClaims = [
  /\bproduction approved\b/i,
  /\bdeploy production\b/i,
  /\bIntentOS owns production\b/i,
  /\bIntentOS owns business\b/i,
  /\bai-logs for every command\b/i,
  /批准生产发布/i,
  /自动写入目标项目/i,
  /替代发布流程/i,
];
const knownCheckerRefs = new Set([
  "checker:workflow-next",
  "checker:native-migration",
  "checker:reconcile-rules",
  "checker:baseline",
  "checker:release-plan",
  "checker:convergence",
  "checker:work-queue",
  "checker:apply-readiness",
  "checker:resolve-beginner-entry",
  "checker:resolve-work-queue",
  "checker:resolve-change-impact-coverage",
  "checker:resolve-review-surface",
  "checker:resolve-apply-plan",
  "checker:resolve-closure-decision",
]);

let failed = false;
const checks = [];

if (!outputJson) {
  console.log("# Adoption Assurance Check");
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
  const combined = [
    readResolved("core/adoption-execution-assurance.md"),
    readResolved("docs/adoption-execution-assurance.md"),
    readResolved("templates/adoption-assurance-report.md"),
    readResolved("schemas/artifacts/adoption-assurance.schema.json"),
  ].join("\n");
  if (!combined.trim()) return;
  for (const marker of [
    "Adoption Execution Assurance",
    "Adoption Assurance Report",
    "adoption_assurance_report",
    "VERIFIED_ACTIVE",
    "PARTIAL_ADOPTION",
    "SIMULATION_PASSED",
    "does not write target files",
    "does not approve release or production",
    "does not replace project-owned release SOP",
  ]) {
    if (combined.includes(marker)) pass(`adoption assurance docs include ${marker}`);
    else fail(`adoption assurance docs missing ${marker}`);
  }
}

function checkReports() {
  const files = explicitReport ? [explicitReport] : markdownFiles("adoption-assurance-reports");
  if (files.length === 0) {
    if (allowEmpty) {
      pass("adoption assurance check skipped: no reports and --allow-empty was provided");
    } else if (requireStructuredEvidence || requireSimulation) {
      fail("no Adoption Assurance reports found while strict adoption assurance evidence was required");
    } else {
      pass("adoption assurance check skipped: no reports");
    }
    return;
  }
  for (const file of files) {
    if (!fs.existsSync(file)) {
      fail(`missing explicit adoption assurance report ${file}`);
      continue;
    }
    const content = fs.readFileSync(file, "utf8");
    const label = rel(file);
    if (containsSecretLikeValue(content)) fail(`${label} contains secret-like content`);
    if (!content.includes("read-only evidence-bound verification view")) {
      fail(`${label} must state read-only evidence-bound verification boundary`);
    } else {
      pass(`${label} states read-only evidence-bound verification boundary`);
    }
    for (const section of requiredSections) requireSection(content, section, label);
    if (requireStructuredEvidence) requireSection(content, "Machine-Readable Evidence", label);
    const summary = checkSummary(content, label);
    const surfaces = checkSurfaceTable(content, label);
    checkBoundaries(content, label);
    const evidence = checkStructuredEvidence(content, label);
    checkCrossConsistency(content, label, summary, surfaces, evidence);
    checkStateRules(content, label, summary, surfaces, evidence);
  }
}

function checkSummary(content, label) {
  const body = sectionBody(content, "Adoption Summary") || "";
  const state = tableValue(body, "Assurance State");
  const operatingMode = tableValue(body, "IntentOS Operating Mode");
  const canClaim = tableValue(body, "Can Claim Full Adoption");
  const canWrite = tableValue(body, "Can Codex Write Now");
  if (allowedStates.has(state)) pass(`${label} summary assurance state is allowed`);
  else fail(`${label} summary assurance state invalid: ${state || "<empty>"}`);
  if (["ACTIVE", "READ_ONLY_DIAGNOSIS", "NOT_ACTIVE"].includes(operatingMode)) pass(`${label} summary operating mode is allowed`);
  else fail(`${label} summary operating mode invalid: ${operatingMode || "<empty>"}`);
  if (["Yes", "No"].includes(canClaim)) pass(`${label} summary full adoption claim flag is bounded`);
  else fail(`${label} summary full adoption claim flag invalid: ${canClaim || "<empty>"}`);
  if (canWrite === "No") pass(`${label} summary can codex write now is No`);
  else fail(`${label} summary can codex write now must be No`);
  return { state, operatingMode, canClaim, canWrite };
}

function checkSurfaceTable(content, label) {
  const body = sectionBody(content, "Adoption Surface Coverage") || "";
  const rows = tableRows(body);
  const seen = new Map();
  for (const row of rows) {
    const surface = stripMarkdown(row[0] || "");
    const status = stripMarkdown(row[1] || "");
    const evidence = stripMarkdown(row[2] || "");
    const notes = stripMarkdown(row[3] || "");
    if (!surface) continue;
    seen.set(surface, { surface, status, evidence, notes });
    if (allowedSurfaceStatuses.has(status)) pass(`${label} ${surface} surface status is allowed`);
    else fail(`${label} ${surface} surface status invalid: ${status || "<empty>"}`);
    if (!evidence || /^(yes|n\/a|na)$/i.test(evidence)) fail(`${label} ${surface} surface evidence is not specific`);
    else pass(`${label} ${surface} surface evidence is specific`);
    if (status === "NOT_APPLICABLE_WITH_REASON" && !notes.trim()) {
      fail(`${label} ${surface} NOT_APPLICABLE_WITH_REASON must include reason`);
    }
  }
  for (const surface of requiredSurfaces) {
    if (seen.has(surface)) pass(`${label} includes ${surface} surface`);
    else fail(`${label} missing ${surface} surface`);
  }
  return seen;
}

function checkBoundaries(content, label) {
  const body = sectionBody(content, "Forbidden Claims") || "";
  const expected = [
    "This report writes target files: No",
    "This report authorizes target-file writes: No",
    "This report approves implementation: No",
    "This report approves release or production: No",
    "This report mutates CI or hooks: No",
    "This report replaces release SOP: No",
    "This report transfers project authority to IntentOS: No",
    "This report proves product correctness: No",
  ];
  for (const marker of expected) {
    if (body.includes(marker)) pass(`${label} boundary ${marker}`);
    else fail(`${label} missing boundary ${marker}`);
  }
}

function checkStructuredEvidence(content, label) {
  const body = sectionBody(content, "Machine-Readable Evidence", { fallback: "" }) || "";
  if (!body.trim()) {
    if (requireStructuredEvidence) fail(`${label} must include Machine-Readable Evidence in strict mode`);
    return null;
  }
  const jsonText = fencedJson(body);
  if (!jsonText) {
    fail(`${label} Machine-Readable Evidence must contain a fenced json block`);
    return null;
  }
  let parsed;
  try {
    parsed = JSON.parse(jsonText);
    pass(`${label} Machine-Readable Evidence parses as JSON`);
  } catch (error) {
    fail(`${label} Machine-Readable Evidence JSON invalid: ${error.message}`);
    return null;
  }
  const schemaResult = validateEvidenceBlock(content, adoptionSchema, label, { require: true });
  if (schemaResult.ok) {
    pass(`${label} structured adoption assurance evidence matches schema`);
  } else {
    for (const error of schemaResult.errors) fail(error);
  }
  const required = [
    "schema_version",
    "artifact_type",
    "target_project_profile",
    "assurance_state",
    "intent_os_operating_mode",
    "can_claim_full_adoption",
    "can_codex_write_now",
    "surfaces",
    "evidence_refs",
    "source_systems",
    "simulation",
    "pending_decisions",
    "forbidden_claims",
    "boundary",
    "outcome",
  ];
  for (const field of required) {
    if (Object.prototype.hasOwnProperty.call(parsed, field)) pass(`${label} evidence includes ${field}`);
    else fail(`${label} evidence missing ${field}`);
  }
  if (parsed.schema_version === "1.71.3") pass(`${label} evidence schema_version is 1.71.3`);
  else fail(`${label} evidence schema_version must be 1.71.3`);
  if (parsed.artifact_type === "adoption_assurance_report") pass(`${label} evidence artifact_type is adoption_assurance_report`);
  else fail(`${label} evidence artifact_type invalid`);
  if (allowedStates.has(parsed.assurance_state)) pass(`${label} evidence assurance_state is allowed`);
  else fail(`${label} evidence assurance_state invalid: ${parsed.assurance_state || "<empty>"}`);
  if (parsed.outcome === parsed.assurance_state) pass(`${label} evidence outcome matches assurance_state`);
  else fail(`${label} evidence outcome must match assurance_state`);
  if (parsed.can_codex_write_now === "No") pass(`${label} evidence can_codex_write_now is No`);
  else fail(`${label} evidence can_codex_write_now must be No`);
  checkStructuredSurfaces(parsed, label);
  checkStructuredSources(parsed, label);
  checkStructuredSimulation(parsed, label);
  checkStructuredBoundary(parsed, label);
  checkEvidenceRefs(parsed, label);
  return parsed;
}

function checkStructuredSurfaces(parsed, label) {
  const surfaces = Array.isArray(parsed.surfaces) ? parsed.surfaces : [];
  const seen = new Set();
  for (const item of surfaces) {
    if (!item || typeof item !== "object") continue;
    seen.add(item.surface);
    if (allowedSurfaceStatuses.has(item.status)) pass(`${label} evidence ${item.surface} status is allowed`);
    else fail(`${label} evidence ${item.surface || "<unknown>"} status invalid`);
    if (item.status === "NOT_APPLICABLE_WITH_REASON" && !String(item.notes || "").trim()) {
      fail(`${label} evidence ${item.surface} NOT_APPLICABLE_WITH_REASON must include reason`);
    }
    if (!String(item.evidence || "").trim() || /^(yes|n\/a|na)$/i.test(String(item.evidence || "").trim())) {
      fail(`${label} evidence ${item.surface} must include a specific evidence ref`);
    }
  }
  for (const surface of requiredSurfaces) {
    if (seen.has(surface)) pass(`${label} evidence includes ${surface} surface`);
    else fail(`${label} evidence missing ${surface} surface`);
  }
}

function checkStructuredSources(parsed, label) {
  const sources = parsed.source_systems && typeof parsed.source_systems === "object" ? parsed.source_systems : {};
  const entries = Object.entries(sources);
  if (entries.length > 0) pass(`${label} evidence source_systems are present`);
  else fail(`${label} evidence source_systems must not be empty`);
  for (const [key, source] of entries) {
    if (!source || typeof source !== "object") {
      fail(`${label} source_systems.${key} must be an object`);
      continue;
    }
    if (source.name === key || String(source.name || "").trim()) pass(`${label} source_systems.${key} has a name`);
    else fail(`${label} source_systems.${key} missing name`);
    if (["RECORDED", "NEEDS_INPUT", "BLOCKED"].includes(source.status)) pass(`${label} source_systems.${key} status is allowed`);
    else fail(`${label} source_systems.${key} status invalid: ${source.status || "<empty>"}`);
    if (String(source.ref || "").trim()) pass(`${label} source_systems.${key} has ref`);
    else fail(`${label} source_systems.${key} missing ref`);
    if (String(source.contribution || "").trim()) pass(`${label} source_systems.${key} has contribution`);
    else fail(`${label} source_systems.${key} missing contribution`);
  }
}

function checkStructuredSimulation(parsed, label) {
  const simulation = parsed.simulation || {};
  const allowed = new Set([
    "SIMULATION_NOT_RUN",
    "SIMULATION_PASSED",
    "SIMULATION_PARTIAL",
    "SIMULATION_FAILED",
    "SIMULATION_BLOCKED",
  ]);
  if (allowed.has(simulation.state)) pass(`${label} simulation state is allowed`);
  else fail(`${label} simulation state invalid: ${simulation.state || "<empty>"}`);
  if (simulation.writes_target_files === "No") pass(`${label} simulation is read-only`);
  else fail(`${label} simulation must not write target files`);
  const steps = Array.isArray(simulation.steps) ? simulation.steps : [];
  if (steps.length > 0) pass(`${label} simulation includes executed step trace`);
  else fail(`${label} simulation must include executed step trace`);
  for (const [index, step] of steps.entries()) {
    if (String(step?.step || "").trim()) pass(`${label} simulation step ${index + 1} has step name`);
    else fail(`${label} simulation step ${index + 1} missing step name`);
    if (["PASSED", "FAILED", "BLOCKED", "SKIPPED"].includes(step?.status)) pass(`${label} simulation step ${index + 1} status is allowed`);
    else fail(`${label} simulation step ${index + 1} status invalid`);
    if (String(step?.ref || "").trim()) pass(`${label} simulation step ${index + 1} has ref`);
    else fail(`${label} simulation step ${index + 1} missing ref`);
    if (step?.status === "SKIPPED" ? step.exit_code === null : Number.isInteger(step?.exit_code)) {
      pass(`${label} simulation step ${index + 1} has exit code evidence`);
    } else {
      fail(`${label} simulation step ${index + 1} missing exit code evidence`);
    }
    if (step?.read_only === "Yes") pass(`${label} simulation step ${index + 1} is marked read-only`);
    else fail(`${label} simulation step ${index + 1} must be marked read-only`);
    if (step?.writes_target_files === "No") pass(`${label} simulation step ${index + 1} did not write target files`);
    else fail(`${label} simulation step ${index + 1} must not write target files`);
    if (["UNCHANGED", "CHANGED", "NOT_GIT_REPO", "UNKNOWN"].includes(step?.target_diff_status)) {
      pass(`${label} simulation step ${index + 1} has target diff status`);
    } else {
      fail(`${label} simulation step ${index + 1} missing target diff status`);
    }
    if (/^sha256:[a-f0-9]{64}$/.test(String(step?.output_digest || "")) || step?.output_digest === "sha256:not-run") {
      pass(`${label} simulation step ${index + 1} has output digest`);
    } else {
      fail(`${label} simulation step ${index + 1} missing output digest`);
    }
    if (String(step?.outcome || "").trim()) pass(`${label} simulation step ${index + 1} has outcome`);
    else fail(`${label} simulation step ${index + 1} missing outcome`);
  }
  if (simulation.state === "SIMULATION_PASSED") {
    const passed = steps.length > 0 && steps.every((step) => (
      step.status === "PASSED"
      && step.exit_code === 0
      && step.read_only === "Yes"
      && step.writes_target_files === "No"
      && step.target_diff_status === "UNCHANGED"
      && /^sha256:[a-f0-9]{64}$/.test(String(step.output_digest || ""))
    ));
    if (passed) pass(`${label} passed simulation has all steps passed with no target diff`);
    else fail(`${label} SIMULATION_PASSED requires every simulation step to pass with exit_code 0, read_only Yes, writes_target_files No, target_diff_status UNCHANGED, and output digest`);
  }
  if (requireSimulation && simulation.state !== "SIMULATION_PASSED") {
    fail(`${label} strict simulation mode requires SIMULATION_PASSED`);
  }
}

function checkStructuredBoundary(parsed, label) {
  const boundary = parsed.boundary || {};
  for (const field of [
    "writes_target_files",
    "authorizes_target_file_writes",
    "approves_implementation",
    "approves_release_or_production",
    "mutates_ci_or_hooks",
    "replaces_release_sop",
    "transfers_project_authority_to_intentos",
    "proves_product_correctness",
  ]) {
    if (boundary[field] === "No") pass(`${label} boundary ${field} is No`);
    else fail(`${label} boundary ${field} must be No`);
  }
}

function checkEvidenceRefs(parsed, label) {
  const refs = Array.isArray(parsed.evidence_refs) ? parsed.evidence_refs : [];
  if (refs.length > 0) pass(`${label} evidence refs are present`);
  else fail(`${label} evidence refs must not be empty`);
  const refSet = new Set(refs.map((ref) => String(ref || "").trim()).filter(Boolean));
  for (const surface of Array.isArray(parsed.surfaces) ? parsed.surfaces : []) {
    const surfaceRef = String(surface?.evidence || "").trim();
    if (!surfaceRef) continue;
    if (refSet.has(surfaceRef)) pass(`${label} surface ${surface.surface || "<unknown>"} evidence is listed in evidence_refs`);
    else fail(`${label} surface ${surface.surface || "<unknown>"} evidence is missing from evidence_refs: ${surfaceRef}`);
  }
  for (const ref of refs) {
    const value = String(ref || "");
    if (!value.trim()) fail(`${label} evidence ref is empty`);
    if (/TODO|TBD|placeholder|<.*>|evidence:\s*yes/i.test(value)) fail(`${label} evidence ref is placeholder: ${value}`);
    if (/git-diff:stale|stale-diff|old unrelated/i.test(value)) fail(`${label} evidence ref is stale or unrelated: ${value}`);
    if (value.startsWith("file:")) {
      const filePath = value.slice("file:".length);
      if (!filePath || path.isAbsolute(filePath) || filePath.includes("..")) {
        fail(`${label} file evidence ref must be relative and safe: ${value}`);
      } else if (!requireStructuredEvidence || fs.existsSync(path.join(projectRoot, filePath))) {
        pass(`${label} resolves file evidence ${value}`);
      } else {
        fail(`${label} unresolved file evidence ${value}`);
      }
    } else if (value.startsWith("checker:")) {
      if (knownCheckerRefs.has(value)) pass(`${label} resolves checker evidence ${value}`);
      else fail(`${label} unknown checker evidence ref ${value}`);
    } else if (value.startsWith("simulation:")) {
      if (parsed.simulation?.id === value) pass(`${label} resolves simulation evidence ${value}`);
      else fail(`${label} unresolved simulation evidence ${value}`);
    } else if (value === "human-decision:no-target-writes") {
      const applyChain = (Array.isArray(parsed.surfaces) ? parsed.surfaces : []).find((item) => item.surface === "apply_chain");
      if (parsed.boundary?.writes_target_files === "No" && applyChain?.status === "NOT_APPLICABLE_WITH_REASON") {
        pass(`${label} resolves human decision evidence ${value}`);
      } else {
        fail(`${label} human decision no-target-writes requires no-write boundary and NOT_APPLICABLE_WITH_REASON apply_chain`);
      }
    } else if (value.startsWith("artifact:")) {
      const artifactPath = value.slice("artifact:".length);
      if (!artifactPath || path.isAbsolute(artifactPath) || artifactPath.includes("..")) {
        fail(`${label} artifact evidence ref must be relative and safe: ${value}`);
      } else if (!requireStructuredEvidence || fs.existsSync(path.join(projectRoot, artifactPath))) {
        pass(`${label} resolves artifact evidence ${value}`);
      } else {
        fail(`${label} unresolved artifact evidence ${value}`);
      }
    } else if (value.startsWith("generated:")) {
      const generatedId = value.slice("generated:".length);
      const sourceRefs = Object.values(parsed.source_systems || {}).map((source) => String(source?.ref || ""));
      const sourceKeys = Object.keys(parsed.source_systems || {}).map((key) => `generated:${key}`);
      const stepRefs = Array.isArray(parsed.simulation?.steps) ? parsed.simulation.steps.map((step) => String(step.ref || "")) : [];
      if (sourceRefs.includes(value) || sourceKeys.includes(value) || stepRefs.includes(value) || generatedId === "adoption_assurance") {
        pass(`${label} resolves generated source evidence ${value}`);
      } else {
        fail(`${label} unresolved generated evidence ${value}`);
      }
    } else {
      fail(`${label} unknown evidence ref prefix ${value}`);
    }
  }
}

function checkCrossConsistency(content, label, summary, surfaces, evidence) {
  if (!evidence) return;
  if (summary.state === evidence.assurance_state) pass(`${label} summary state matches structured evidence`);
  else fail(`${label} summary state ${summary.state || "<empty>"} does not match evidence ${evidence.assurance_state || "<empty>"}`);
  if (summary.operatingMode === evidence.intent_os_operating_mode) pass(`${label} summary operating mode matches structured evidence`);
  else fail(`${label} summary operating mode does not match structured evidence`);
  if (summary.canClaim === evidence.can_claim_full_adoption) pass(`${label} summary claim flag matches structured evidence`);
  else fail(`${label} summary claim flag does not match structured evidence`);
  const assuranceSectionValue = firstCodeValue(sectionBody(content, "Assurance State") || "");
  if (assuranceSectionValue === evidence.outcome) pass(`${label} Assurance State section matches evidence outcome`);
  else fail(`${label} Assurance State section ${assuranceSectionValue || "<empty>"} does not match evidence outcome ${evidence.outcome || "<empty>"}`);
  const simulationSectionValue = firstCodeValue(sectionBody(content, "Simulation Task Result") || "");
  if (simulationSectionValue === evidence.simulation?.state) pass(`${label} Simulation Task Result section matches structured evidence`);
  else fail(`${label} Simulation Task Result section ${simulationSectionValue || "<empty>"} does not match evidence ${evidence.simulation?.state || "<empty>"}`);
  const structuredSurfaces = new Map((Array.isArray(evidence.surfaces) ? evidence.surfaces : []).map((item) => [item.surface, item]));
  for (const [surfaceName, markdownSurface] of surfaces.entries()) {
    const structured = structuredSurfaces.get(surfaceName);
    if (!structured) continue;
    if (markdownSurface.status === structured.status) pass(`${label} ${surfaceName} markdown status matches evidence`);
    else fail(`${label} ${surfaceName} markdown status ${markdownSurface.status} does not match evidence ${structured.status}`);
    if (markdownSurface.evidence === structured.evidence) pass(`${label} ${surfaceName} markdown evidence matches evidence`);
    else fail(`${label} ${surfaceName} markdown evidence ${markdownSurface.evidence} does not match evidence ${structured.evidence}`);
    if (markdownSurface.notes === structured.notes) pass(`${label} ${surfaceName} markdown notes match evidence`);
    else fail(`${label} ${surfaceName} markdown notes do not match structured evidence`);
  }
}

function checkStateRules(content, label, summary, surfaces, evidence) {
  const state = evidence?.assurance_state || summary.state;
  const fullClaim = evidence?.can_claim_full_adoption || summary.canClaim;
  const surfaceValues = evidence?.surfaces || Array.from(surfaces.values());
  const hasBlockingSurface = surfaceValues.some((item) => [
    "MISSING",
    "PENDING_APPLY",
    "PENDING_HUMAN_DECISION",
    "BLOCKED",
    "PRESENT_UNVERIFIED",
  ].includes(item.status));
  const simulationState = evidence?.simulation?.state || "";
  const sourceValues = evidence?.source_systems && typeof evidence.source_systems === "object" ? Object.values(evidence.source_systems) : [];
  const hasBlockingSource = sourceValues.some((source) => source.status === "NEEDS_INPUT" || source.status === "BLOCKED");
  const allSourcesRecorded = sourceValues.length > 0 && sourceValues.every((source) => source.status === "RECORDED");
  const simulationSteps = Array.isArray(evidence?.simulation?.steps) ? evidence.simulation.steps : [];
  const allSimulationStepsPassed = simulationSteps.length > 0 && simulationSteps.every((step) => (
    step.status === "PASSED"
    && step.exit_code === 0
    && step.read_only === "Yes"
    && step.writes_target_files === "No"
    && step.target_diff_status === "UNCHANGED"
  ));
  const claimsFullInText = /\|\s*Can Claim Full Adoption\s*\|\s*`?Yes`?\s*\|/i.test(content)
    || /\bhas fully adopted\b/i.test(content)
    || /\bis fully adopted\b/i.test(content);

  if (state === "VERIFIED_ACTIVE") {
    if (fullClaim === "Yes") pass(`${label} verified active can claim full adoption`);
    else fail(`${label} VERIFIED_ACTIVE must set can_claim_full_adoption to Yes`);
    if (simulationState === "SIMULATION_PASSED") pass(`${label} verified active has passed simulation`);
    else fail(`${label} VERIFIED_ACTIVE requires SIMULATION_PASSED`);
    if (!hasBlockingSurface) pass(`${label} verified active has no blocking surfaces`);
    else fail(`${label} VERIFIED_ACTIVE cannot include missing, pending, or blocked surfaces`);
    if (allSourcesRecorded) pass(`${label} verified active has all upstream sources recorded`);
    else fail(`${label} VERIFIED_ACTIVE requires all upstream source systems to be RECORDED`);
    if (allSimulationStepsPassed) pass(`${label} verified active has a fully passed simulation trace`);
    else fail(`${label} VERIFIED_ACTIVE requires every simulation step to pass`);
    checkVerifiedActiveApplyChain(evidence, label);
  } else if (fullClaim === "Yes" || claimsFullInText) {
    fail(`${label} cannot claim full adoption unless state is VERIFIED_ACTIVE`);
  }

  if (hasBlockingSurface && state === "VERIFIED_ACTIVE") {
    fail(`${label} cannot be VERIFIED_ACTIVE with blocking surfaces`);
  }

  if (simulationState !== "SIMULATION_PASSED" && state === "VERIFIED_ACTIVE") {
    fail(`${label} cannot be VERIFIED_ACTIVE without simulation pass`);
  }

  if (hasBlockingSource && !["BLOCKED_BY_UPSTREAM_EVIDENCE", "BLOCKED_BY_PROJECT_AUTHORITY", "BLOCKED_BY_DIRTY_WORKTREE", "READ_ONLY_DIAGNOSIS_ONLY"].includes(state)) {
    fail(`${label} upstream BLOCKED/NEEDS_INPUT source must block verified or partial adoption state`);
  }

  for (const pattern of fullAdoptionClaimPatterns) {
    if (pattern.test(content) && state !== "VERIFIED_ACTIVE") {
      fail(`${label} contains forbidden adoption claim: ${pattern.source}`);
    }
  }
  for (const pattern of absoluteForbiddenClaims) {
    if (pattern.test(content)) fail(`${label} contains absolutely forbidden claim: ${pattern.source}`);
  }
}

function checkVerifiedActiveApplyChain(evidence, label) {
  const verifiedChain = evaluateVerifiedAdoptionApplyChain(projectRoot, {
    planSchema: applyPlanSchema,
    approvalSchema: approvalRecordSchema,
    readinessSchema: applyReadinessSchema,
  });
  if (verifiedChain.status === "VERIFIED") {
    pass(`${label} project apply-chain artifacts are structurally verified`);
  } else {
    fail(`${label} VERIFIED_ACTIVE requires a structurally verified apply plan, human approval record, and controlled readiness chain`);
  }
  const agentEntry = ["AGENTS.md", "agent.md", ".agent.md"]
    .map((relative) => ({ relative, full: path.join(projectRoot, relative) }))
    .find((entry) => fs.existsSync(entry.full) && fs.statSync(entry.full).isFile());
  const agentContent = agentEntry ? fs.readFileSync(agentEntry.full, "utf8") : "";
  const positiveSections = /^##\s+Review Loop\s*$/im.test(agentContent)
    && /^##\s+Work Queue\s*$/im.test(agentContent)
    && /IntentOS/i.test(agentContent)
    && !/(?:do not|disable|ignore|禁止|禁用|不要).{0,24}IntentOS/i.test(agentContent);
  if (agentEntry && positiveSections) {
    pass(`${label} active agent authority ${agentEntry.relative} contains IntentOS operating markers`);
  } else {
    fail(`${label} VERIFIED_ACTIVE requires an actual IntentOS-aware AGENTS.md/agent.md authority entry`);
  }
  const surfaces = Array.isArray(evidence?.surfaces) ? evidence.surfaces : [];
  const applyChain = surfaces.find((item) => item.surface === "apply_chain");
  if (applyChain?.status === "VERIFIED") pass(`${label} verified active has VERIFIED apply_chain surface`);
  else fail(`${label} VERIFIED_ACTIVE requires verified apply chain surface status VERIFIED`);

  const refs = Array.isArray(evidence?.evidence_refs) ? evidence.evidence_refs : [];
  const receiptRef = refs.find((ref) => normalizedEvidencePath(ref).startsWith("apply-receipts/"));
  const executionPlanRef = refs.find((ref) => normalizedEvidencePath(ref).startsWith("apply-execution-plans/"));
  const approvalRef = refs.find((ref) => normalizedEvidencePath(ref).startsWith("approval-records/"));
  const readinessRef = refs.find((ref) => normalizedEvidencePath(ref).startsWith("apply-readiness-reports/"));
  const receipt = validateReferencedEvidenceFile(receiptRef, applyReceiptSchema, `${label} apply execution receipt`);
  if (!receipt) return;
  if (executionPlanRef && approvalRef && readinessRef) pass(`${label} verified receipt source chain is referenced`);
  else fail(`${label} VERIFIED_ACTIVE requires execution plan, approval, readiness, and receipt refs`);
  if (receipt.receipt_state === "APPLY_VERIFIED" && receipt.activation?.status === "VERIFIED") {
    pass(`${label} apply receipt proves verified replay and activation`);
  } else {
    fail(`${label} VERIFIED_ACTIVE requires APPLY_VERIFIED receipt and activation`);
  }
}

function validateReferencedEvidenceFile(ref, schema, label, digestField = "") {
  const evidencePath = resolveEvidenceFile(ref);
  if (!ref) {
    fail(`${label} ref is required for VERIFIED_ACTIVE`);
    return null;
  }
  if (!evidencePath) {
    fail(`${label} ref does not resolve: ${ref}`);
    return null;
  }
  const result = validateEvidenceBlock(fs.readFileSync(evidencePath, "utf8"), schema, label, {
    require: true,
    ...(digestField ? { digestField } : {}),
  });
  if (!result.ok) {
    for (const error of result.errors) fail(error);
    return null;
  }
  pass(`${label} structured evidence resolves and validates`);
  return result.value;
}

function resolveEvidenceFile(ref) {
  const normalized = normalizedEvidencePath(ref);
  if (!normalized || path.isAbsolute(normalized) || normalized.includes("..")) return "";
  const candidate = path.resolve(projectRoot, normalized);
  const relative = path.relative(projectRoot, candidate);
  if (relative.startsWith("..") || path.isAbsolute(relative)) return "";
  return fs.existsSync(candidate) && fs.statSync(candidate).isFile() ? candidate : "";
}

function normalizedEvidencePath(ref) {
  return String(ref || "")
    .replace(/^(artifact|file):/, "")
    .replaceAll(path.sep, "/");
}

function requireSection(content, section, label) {
  if (sectionBody(content, section) !== null) pass(`${label} includes ${section}`);
  else fail(`${label} missing ${section}`);
}

function tableRows(body) {
  return body
    .split(/\r?\n/)
    .filter((line) => /^\s*\|/.test(line) && !/^\s*\|\s*-+/.test(line))
    .slice(1)
    .map(splitMarkdownRow);
}

function tableValue(body, field) {
  for (const row of tableRows(body)) {
    if (stripMarkdown(row[0] || "") === field) return stripMarkdown(row[1] || "");
  }
  return "";
}

function fencedJson(body) {
  const match = body.match(/```json\s*([\s\S]*?)```/i);
  return match ? match[1].trim() : "";
}

function firstCodeValue(body) {
  const match = String(body || "").match(/`([^`]+)`/);
  return match ? stripMarkdown(match[1]) : "";
}

function markdownFiles(relativeDir) {
  const dir = path.join(projectRoot, relativeDir);
  if (!fs.existsSync(dir)) return [];
  const result = [];
  walk(dir, result);
  return result.filter((file) => file.endsWith(".md")).sort();
}

function walk(dir, result) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, result);
    else result.push(full);
  }
}

function resolveAsset(relativePath) {
  const direct = path.join(projectRoot, relativePath);
  if (fs.existsSync(direct)) return direct;
  const nested = path.join(projectRoot, ".intentos", relativePath);
  if (fs.existsSync(nested)) return nested;
  return null;
}

function resolveDirectory(relativePath) {
  const direct = path.join(projectRoot, relativePath);
  if (fs.existsSync(direct) && fs.statSync(direct).isDirectory()) return direct;
  const nested = path.join(projectRoot, ".intentos", relativePath);
  if (fs.existsSync(nested) && fs.statSync(nested).isDirectory()) return nested;
  return null;
}

function readResolved(relativePath) {
  const resolved = resolveAsset(relativePath);
  return resolved ? fs.readFileSync(resolved, "utf8") : "";
}

function displayAsset(relativePath, resolved) {
  return path.relative(projectRoot, resolved) || relativePath;
}

function rel(file) {
  return path.relative(projectRoot, file) || ".";
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

function emitAndExit() {
  if (outputJson) {
    console.log(JSON.stringify({
      ok: !failed,
      checks,
    }, null, 2));
  } else if (!failed) {
    console.log("");
    console.log("Adoption Assurance check passed.");
  }
  process.exit(failed ? 1 : 0);
}
