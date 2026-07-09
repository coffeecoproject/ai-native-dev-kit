#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { loadSchema, validateEvidenceBlock } from "./lib/artifact-schema.mjs";
import { sectionBody, stripMarkdown } from "./lib/markdown.mjs";
import { containsSecretLikeValue } from "./lib/risk-surfaces.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["json", "allow-empty", "report", "require-report", "require-structured-evidence"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputJson = Boolean(args.json);
const allowEmpty = Boolean(args["allow-empty"]);
const requireReport = Boolean(args["require-report"]);
const requireStructuredEvidence = Boolean(args["require-structured-evidence"]);
const explicitReport = args.report ? path.resolve(projectRoot, String(args.report)) : "";
const schema = loadSchema(projectRoot, "schemas/artifacts/plan-review.schema.json");
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
  "core/plan-review-gate.md",
  "docs/plan-review-gate.md",
  "templates/plan-review-report.md",
  "schemas/artifacts/plan-review.schema.json",
  "checklists/plan-review-gate-review.md",
  "prompts/plan-review-gate-agent.md",
  "scripts/resolve-plan-review.mjs",
  "scripts/check-plan-review.mjs",
];
const requiredDirectories = ["plan-review-reports"];
const requiredSections = [
  "Human Summary",
  "Plan Identity",
  "Task Governance Binding",
  "Review Surface Analysis",
  "Review Surface Matrix",
  "Source Chain",
  "Reviewed Surfaces",
  "Findings",
  "Revision Loop",
  "Verification Command Review",
  "Subagent Review Routing",
  "Boundaries",
  "Outcome",
  "Machine-Readable Evidence",
];
const states = new Set([
  "NO_PLAN_REQUIRED",
  "PLAN_REQUIRED",
  "PLAN_DRAFTED",
  "PLAN_REVIEW_REQUIRED",
  "PLAN_REVISION_REQUIRED",
  "PLAN_REVIEW_PASSED",
  "BLOCKED_BY_STALE_PLAN",
  "BLOCKED_BY_INCOMPLETE_REVIEW",
  "BLOCKED_BY_USER_DECISION",
  "BLOCKED_BY_REPEATED_PLAN_REVIEW_FAILURE",
  "PLAN_REVIEW_REQUIRED_WITH_TASK_GOVERNANCE_RECHECK",
]);
const forbiddenUserBurden = [
  /Task Governance/i,
  /Review Surface/i,
  /Business Rule Closure/i,
  /Change Impact Coverage/i,
  /Verification Plan/i,
  /Plan Review Gate/i,
  /choose technical/i,
  /select review surfaces/i,
  /选择.*审查面/,
];

let failed = false;
const checks = [];

if (!outputJson) {
  console.log("# Plan Review Gate Check");
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
    readResolved("core/plan-review-gate.md"),
    readResolved("docs/plan-review-gate.md"),
    readResolved("templates/plan-review-report.md"),
    readResolved("schemas/artifacts/plan-review.schema.json"),
  ].join("\n");
  if (!combined.trim()) return;
  for (const marker of [
    "Plan Review Gate",
    "PLAN_REVIEW_PASSED",
    "NO_PLAN_REQUIRED",
    "PLAN_REVISION_REQUIRED",
    "Task Governance remains the source of truth",
    "Review Surface Governance remains the source of truth",
    "A derived review-surface matrix is helper evidence only",
    "does not authorize implementation",
    "does not execute tests",
  ]) {
    if (combined.includes(marker)) pass(`plan review docs include ${marker}`);
    else fail(`plan review docs missing ${marker}`);
  }
}

function checkReports() {
  const files = explicitReport ? [explicitReport] : markdownFiles("plan-review-reports");
  if (files.length === 0) {
    if (allowEmpty) pass("plan review check skipped by explicit --allow-empty: no reports");
    else if (requireReport || explicitReport || requireStructuredEvidence) fail("no Plan Review reports found");
    else pass("SKIPPED_NO_REPORT: no Plan Review reports found");
    return;
  }
  for (const file of files) {
    if (!fs.existsSync(file)) {
      fail(`missing explicit Plan Review report ${file}`);
      continue;
    }
    checkReport(file);
  }
}

function checkReport(file) {
  const content = fs.readFileSync(file, "utf8");
  const label = rel(file);
  if (containsSecretLikeValue(content)) fail(`${label} contains secret-like content`);
  for (const section of requiredSections) {
    if (sectionBody(content, section)) pass(`${label} includes ${section}`);
    else fail(`${label} missing section ${section}`);
  }
  if (/authorizes implementation:\s*Yes/i.test(content)
    || /approves release or production:\s*Yes/i.test(content)
    || /executes tests:\s*Yes/i.test(content)
    || /implementation approved/i.test(content)
    || /release approved/i.test(content)) {
    fail(`${label} contains forbidden authorization claim`);
  }
  const result = validateEvidenceBlock(content, schema, label, {
    require: requireStructuredEvidence,
    digestField: "plan_review_digest",
  });
  if (!result.present && !requireStructuredEvidence) {
    pass(`${label} structured evidence optional and not present`);
    return;
  }
  if (!result.ok) {
    result.errors.forEach((error) => fail(error));
    return;
  }
  const evidence = result.value;
  pass(`${label} has valid structured evidence`);
  checkStructuredEvidence(content, label, file, evidence);
}

function checkStructuredEvidence(content, label, file, evidence) {
  if (reportRefCandidates(file).includes(evidence.plan_review_ref)) pass(`${label} plan_review_ref points to this report`);
  else fail(`${label} plan_review_ref ${evidence.plan_review_ref || "<missing>"} must point to this report`);
  if (states.has(evidence.plan_review_state)) pass(`${label} has valid plan_review_state`);
  else fail(`${label} has invalid plan_review_state`);
  if (evidence.outcome === evidence.plan_review_state) pass(`${label} outcome matches plan_review_state`);
  else fail(`${label} outcome must match plan_review_state`);
  if (stripMarkdown(sectionBody(content, "Outcome") || "").includes(evidence.outcome)) pass(`${label} Markdown outcome matches structured outcome`);
  else fail(`${label} Markdown Outcome must include structured outcome`);

  checkBoundaries(label, evidence);
  checkUserFacingText(label, evidence);
  checkPlanIdentity(label, file, evidence);
  checkTaskGovernance(label, evidence);
  checkSkipRules(label, evidence);
  checkReviewSurfaces(label, evidence);
  checkSourceChain(label, evidence);
  checkFindings(label, evidence);
  checkSubagents(label, evidence);
  checkVerificationReview(label, evidence);
  checkRevisionLoop(label, evidence);
  checkPassRules(label, evidence);
  checkMarkdownConsistency(content, label, evidence);
}

function checkBoundaries(label, evidence) {
  const boundaries = evidence.boundaries || {};
  for (const [field, expected] of [
    ["writes_target_files", "No"],
    ["authorizes_implementation", "No"],
    ["approves_commit_or_push", "No"],
    ["approves_release_or_production", "No"],
    ["executes_tests", "No"],
    ["changes_production", "No"],
  ]) {
    if (boundaries[field] === expected) pass(`${label} boundary ${field} is ${expected}`);
    else fail(`${label} boundary ${field} must be ${expected}`);
  }
  if (evidence.implementation_authorized_by_this_report === "No") pass(`${label} implementation_authorized_by_this_report is No`);
  else fail(`${label} implementation_authorized_by_this_report must be No`);
}

function checkUserFacingText(label, evidence) {
  const text = `${evidence.plain_user_summary || ""}\n${evidence.plain_next_step || ""}`;
  if (text.trim()) pass(`${label} has plain user summary and next step`);
  else fail(`${label} must include plain user summary and next step`);
  if (evidence.technical_terms_required === "No") pass(`${label} technical_terms_required is No`);
  else fail(`${label} technical_terms_required must be No`);
  for (const pattern of forbiddenUserBurden) {
    if (pattern.test(text)) fail(`${label} user-facing text exposes technical workflow burden: ${pattern.source}`);
  }
}

function checkPlanIdentity(label, file, evidence) {
  if (evidence.plan_review_state === "NO_PLAN_REQUIRED") {
    if (evidence.plan_ref === "N/A" && evidence.plan_digest === "N/A") pass(`${label} NO_PLAN_REQUIRED uses N/A plan identity`);
    else fail(`${label} NO_PLAN_REQUIRED must use plan_ref=N/A and plan_digest=N/A`);
    return;
  }
  if (!evidence.plan_ref || evidence.plan_ref === "N/A") {
    if (["PLAN_REQUIRED", "PLAN_REVIEW_REQUIRED", "PLAN_DRAFTED"].includes(evidence.plan_review_state)) pass(`${label} missing plan ref is compatible with required/drafted state`);
    else fail(`${label} must include concrete plan_ref unless no plan is required`);
    return;
  }
  const planPath = resolveRelativeFile(evidence.plan_ref);
  if (!planPath) {
    if (["PLAN_REQUIRED", "BLOCKED_BY_STALE_PLAN"].includes(evidence.plan_review_state)) pass(`${label} unresolved plan ref is blocked`);
    else fail(`${label} plan_ref does not resolve: ${evidence.plan_ref}`);
    return;
  }
  const actual = fileDigest(planPath);
  if (evidence.plan_digest === actual) pass(`${label} plan_digest matches plan file`);
  else if (evidence.plan_review_state === "BLOCKED_BY_STALE_PLAN") pass(`${label} stale plan digest is blocked`);
  else fail(`${label} plan_digest does not match plan file`);
}

function checkTaskGovernance(label, evidence) {
  const taskGovernance = evidence.task_governance || {};
  if (evidence.task_impact !== taskGovernance.task_impact) {
    fail(`${label} plan review must not override Task Governance task impact`);
  } else {
    pass(`${label} task impact matches Task Governance`);
  }
  if (taskGovernance.task_ref === evidence.task_ref) pass(`${label} Task Governance task_ref matches report task_ref`);
  else fail(`${label} Task Governance task_ref must match report task_ref`);
  if (taskGovernance.current_task_match === "Yes" || evidence.plan_review_state === "NO_PLAN_REQUIRED") pass(`${label} Task Governance current task match is acceptable`);
  else fail(`${label} Task Governance current_task_match must be Yes`);
  if (["HIGH", "POSSIBLE_HIGH"].includes(evidence.task_impact)) {
    if (taskGovernance.ref && taskGovernance.ref !== "N/A") pass(`${label} high-impact review includes Task Governance ref`);
    else fail(`${label} high-impact review requires Task Governance ref`);
    if (taskGovernance.digest && /^sha256:[a-f0-9]{64}$/.test(taskGovernance.digest)) pass(`${label} high-impact review includes Task Governance digest`);
    else fail(`${label} high-impact review requires Task Governance digest`);
    if (taskGovernance.plan_review_required === "Yes") pass(`${label} high-impact Task Governance requires plan review`);
    else fail(`${label} high-impact Task Governance must require plan review`);
  }
  if (taskGovernance.digest === zeroDigest()) fail(`${label} Task Governance digest mismatch sentinel is blocked`);
}

function checkSkipRules(label, evidence) {
  if (evidence.plan_review_state !== "NO_PLAN_REQUIRED") return;
  const skip = evidence.skip_review || {};
  if (evidence.task_impact === "LOW" && evidence.task_governance?.task_impact === "LOW") pass(`${label} NO_PLAN_REQUIRED is backed by LOW Task Governance`);
  else fail(`${label} NO_PLAN_REQUIRED requires LOW Task Governance`);
  if (skip.skip_allowed === "Yes" && skip.skip_source === "task_governance" && skip.skip_reason && skip.skip_reason !== "N/A") {
    pass(`${label} NO_PLAN_REQUIRED has structured skip reason`);
  } else {
    fail(`${label} NO_PLAN_REQUIRED requires structured Task Governance skip reason`);
  }
}

function checkReviewSurfaces(label, evidence) {
  if (evidence.plan_review_state === "NO_PLAN_REQUIRED") {
    pass(`${label} review surface matrix is informational for NO_PLAN_REQUIRED`);
    return;
  }
  const matrix = evidence.review_surface_matrix || [];
  const required = evidence.required_review_surfaces || [];
  if (["HIGH", "POSSIBLE_HIGH"].includes(evidence.task_impact)) {
    if (matrix.length > 0) pass(`${label} high-impact review has review surface matrix`);
    else fail(`${label} high-impact review requires review surface matrix`);
    if (evidence.review_surface_analysis?.ref && evidence.review_surface_analysis.ref !== "N/A") pass(`${label} high-impact review has review surface analysis`);
    else fail(`${label} high-impact review requires review surface analysis or derived matrix`);
    if (evidence.review_surface_analysis?.user_selected_surfaces === "No") pass(`${label} review surfaces are not delegated to user selection`);
    else fail(`${label} must not ask user to choose technical review surfaces`);
  }
  const surfaceMap = new Map(matrix.map((item) => [item.surface, item]));
  for (const item of matrix) {
    if (item.required === "Yes" && !required.includes(item.surface)) {
      fail(`${label} required review surface matrix entry is missing from required_review_surfaces: ${item.surface}`);
    }
  }
  for (const surface of required) {
    const item = surfaceMap.get(surface);
    if (!item) {
      fail(`${label} required review surface missing from matrix: ${surface}`);
      continue;
    }
    if (item.required === "Yes" && item.reviewed === "Yes") pass(`${label} required surface reviewed: ${surface}`);
    else if (evidence.plan_review_state === "BLOCKED_BY_INCOMPLETE_REVIEW") pass(`${label} incomplete surface is blocked: ${surface}`);
    else fail(`${label} required surface not reviewed: ${surface}`);
  }
  if ((evidence.reviewed_surfaces || []).some((item) => item.surface === "review_surface_card_approval")) {
    fail(`${label} treats Review Surface Card as implementation approval`);
  }
  if (evidence.plan_review_state === "PLAN_REVIEW_PASSED" && ["HIGH", "POSSIBLE_HIGH"].includes(evidence.task_impact)) {
    const analysis = evidence.review_surface_analysis || {};
    const sourceKinds = new Set((evidence.source_chain || []).map((source) => source.source_kind));
    const hasAuthoritativeSurfaceSource = ["review_surface_card", "project_native_review_surface", "project_native_equivalent"]
      .some((kind) => sourceKinds.has(kind))
      || ["review_surface_card", "project_native_equivalent"].includes(analysis.source);
    if (analysis.source === "derived_plan_review_matrix" || analysis.derived_by_plan_review === "Yes") {
      if (hasAuthoritativeSurfaceSource) {
        pass(`${label} derived review surface matrix is backed by project-native Review Surface source`);
      } else {
        fail(`${label} derived review surface matrix cannot satisfy high-impact PLAN_REVIEW_PASSED without project-native Review Surface source`);
      }
    } else if (hasAuthoritativeSurfaceSource) {
      pass(`${label} high-impact pass has project-native Review Surface source`);
    } else {
      fail(`${label} high-impact PLAN_REVIEW_PASSED requires project-native Review Surface source`);
    }
  }
}

function checkSourceChain(label, evidence) {
  const chain = evidence.source_chain || [];
  if (["HIGH", "POSSIBLE_HIGH"].includes(evidence.task_impact) && evidence.plan_review_state === "PLAN_REVIEW_PASSED") {
    if (chain.length > 0) pass(`${label} high-impact pass has source chain`);
    else fail(`${label} high-impact PLAN_REVIEW_PASSED requires source chain`);
    const kinds = new Set(chain.map((source) => source.source_kind));
    for (const requiredKind of ["task_governance", "verification_plan"]) {
      if (kinds.has(requiredKind)) pass(`${label} high-impact pass has source_chain kind ${requiredKind}`);
      else fail(`${label} high-impact PLAN_REVIEW_PASSED requires source_chain kind ${requiredKind}`);
    }
    if (["review_surface_card", "project_native_review_surface", "project_native_equivalent"].some((kind) => kinds.has(kind))) {
      pass(`${label} high-impact pass has source_chain Review Surface authority`);
    } else {
      fail(`${label} high-impact PLAN_REVIEW_PASSED requires source_chain Review Surface authority`);
    }
    const requiredSurfaces = new Set(evidence.required_review_surfaces || []);
    if (requiredSurfaces.has("business_rule")) {
      if (kinds.has("business_rule_closure")) pass(`${label} business-rule surface has source_chain business_rule_closure`);
      else fail(`${label} business-rule surface requires source_chain business_rule_closure`);
    }
    if (requiredSurfaces.has("data_destructive") || requiredSurfaces.has("frontend_backend_consistency")) {
      if (kinds.has("change_impact_coverage")) pass(`${label} impact-sensitive surface has source_chain change_impact_coverage`);
      else fail(`${label} impact-sensitive surface requires source_chain change_impact_coverage`);
    }
  }
  const seenKinds = new Set();
  for (const source of chain) {
    if (seenKinds.has(source.source_kind)) fail(`${label} duplicate source_chain kind ${source.source_kind}`);
    else seenKinds.add(source.source_kind);
    if (/^sha256:[a-f0-9]{64}$/.test(source.source_digest)) pass(`${label} source ${source.source_kind} has sha256 digest`);
    else fail(`${label} source ${source.source_kind} must have sha256 digest`);
    if (source.source_ref === "N/A" || path.isAbsolute(source.source_ref) || source.source_ref.includes("..")) {
      fail(`${label} source ${source.source_kind} has unsafe source_ref`);
    }
    if (source.current_task_match === "Yes" || source.current_task_match === "N/A") pass(`${label} source ${source.source_kind} current task match is acceptable`);
    else fail(`${label} source ${source.source_kind} current_task_match must be Yes or N/A`);
    if (source.source_digest === zeroDigest()) fail(`${label} source ${source.source_kind} digest mismatch sentinel is blocked`);
    if (/STALE|EXPIRED|OUTDATED/i.test(source.source_state)) fail(`${label} source ${source.source_kind} is stale`);
    if (source.contradicts_plan === "Yes") fail(`${label} source ${source.source_kind} contradicts plan`);
    if (source.source_kind === "business_rule_closure" && source.owner === "codex") {
      fail(`${label} business_rule_closure source cannot be owned by Codex`);
    }
  }
}

function checkFindings(label, evidence) {
  const findings = evidence.findings || [];
  const blocking = findings.filter((finding) => ["P0", "P1"].includes(finding.severity) && finding.resolved !== "Yes");
  if (evidence.plan_review_state === "PLAN_REVIEW_PASSED" && blocking.length > 0) {
    fail(`${label} PLAN_REVIEW_PASSED has unresolved P0/P1 findings`);
  }
  for (const finding of findings) {
    if (finding.severity === "P2" && finding.resolved !== "Yes" && finding.accepted === "Yes") {
      const ref = finding.accepted_by_ref || "";
      if (/^(human-decision|owner-decision|domain-owner):/.test(ref)
        && finding.acceptance_reason !== "N/A"
        && finding.acceptance_scope !== "N/A"
        && finding.expires_at !== "N/A"
        && finding.allowed_for_task_impact !== "N/A") {
        pass(`${label} P2 finding ${finding.id} has structured owner acceptance`);
      } else {
        fail(`${label} P2 finding ${finding.id} acceptance is not structured owner acceptance`);
      }
    }
    if (finding.severity === "P2" && finding.accepted === "Yes" && /^codex:/i.test(finding.accepted_by_ref || "")) {
      fail(`${label} Codex cannot accept blocking P2 finding ${finding.id}`);
    }
  }
  if (evidence.plan_review_state === "PLAN_REVIEW_PASSED"
    && evidence.task_impact === "HIGH"
    && findings.some((finding) => finding.severity === "P2" && finding.resolved !== "Yes" && finding.accepted !== "Yes")) {
    fail(`${label} high-impact PLAN_REVIEW_PASSED has unaccepted P2 findings`);
  }
}

function checkSubagents(label, evidence) {
  const routing = evidence.subagent_review_routing || {};
  if (routing.subagent_output_is_authority === "No") pass(`${label} subagent output is not authority`);
  else fail(`${label} subagent output must not be authority`);
  if (routing.writer_subagent_used === "No") pass(`${label} no writer subagent used for plan review`);
  else fail(`${label} plan review must not use writer subagent`);
  if (routing.subagent_review_recommended === "Yes") {
    if (routing.run_plan_required === "Yes") pass(`${label} recommended subagent review requires run plan`);
    else fail(`${label} recommended subagent review must require a run plan`);
    if (routing.run_plan_ref && routing.run_plan_ref !== "N/A") pass(`${label} recommended subagent review has run_plan_ref`);
    else fail(`${label} recommended subagent review requires run_plan_ref`);
    if (routing.all_subagents_read_only === "Yes") pass(`${label} recommended subagent review is read-only`);
    else fail(`${label} recommended subagent review must be read-only`);
  }
  if (evidence.plan_review_state === "PLAN_REVIEW_PASSED"
    && routing.subagent_review_recommended === "Yes"
    && routing.all_subagents_closed_or_skipped !== "Yes"
    && !(routing.fallback_used === "Yes" && routing.fallback_reason && routing.fallback_reason !== "N/A")) {
    fail(`${label} PLAN_REVIEW_PASSED cannot leave recommended subagent review unknown`);
  }
  if (evidence.plan_review_state === "PLAN_REVIEW_PASSED"
    && routing.subagent_review_recommended === "Yes"
    && routing.fallback_used === "Yes") {
    fail(`${label} PLAN_REVIEW_PASSED cannot use fallback as substitute for recommended subagent review`);
  }
}

function checkVerificationReview(label, evidence) {
  const review = evidence.verification_command_review || {};
  if (evidence.plan_review_state !== "NO_PLAN_REQUIRED" && review.commands_reviewed === "Yes") pass(`${label} verification commands reviewed statically`);
  else if (evidence.plan_review_state === "NO_PLAN_REQUIRED") pass(`${label} verification command review skipped for no-plan low-risk task`);
  else fail(`${label} verification command review is required`);
  if (review.commands_executed_by_this_report === "No") pass(`${label} plan review does not claim tests were executed`);
  else fail(`${label} plan review must not claim tests were executed`);
  if (evidence.plan_review_state === "PLAN_REVIEW_PASSED" && review.fake_or_unstable_command_found === "Yes") {
    fail(`${label} PLAN_REVIEW_PASSED cannot contain fake or unstable verification command`);
  }
}

function checkRevisionLoop(label, evidence) {
  const loop = evidence.revision_loop || {};
  if (loop.rewrites_original_plan === "No") pass(`${label} review loop does not rewrite original plan`);
  else fail(`${label} review loop must not rewrite original plan by default`);
  if (loop.round > loop.max_auto_rounds && evidence.plan_review_state !== "BLOCKED_BY_REPEATED_PLAN_REVIEW_FAILURE") {
    fail(`${label} repeated plan review failure must be blocked after max rounds`);
  }
}

function checkPassRules(label, evidence) {
  if (evidence.plan_review_state !== "PLAN_REVIEW_PASSED") return;
  if (evidence.pre_implementation_review_prerequisite_satisfied === "Yes") pass(`${label} pass satisfies pre-implementation prerequisite`);
  else fail(`${label} PLAN_REVIEW_PASSED requires pre_implementation_review_prerequisite_satisfied Yes`);
  if (evidence.ready_for_implementation_review === "Yes") pass(`${label} pass is ready for implementation review`);
  else fail(`${label} PLAN_REVIEW_PASSED requires ready_for_implementation_review Yes`);
  if (evidence.implementation_allowed_by_full_authority === "Unknown" || evidence.implementation_allowed_by_full_authority === "No") {
    pass(`${label} pass does not claim full implementation authority`);
  } else {
    fail(`${label} PLAN_REVIEW_PASSED must not claim full implementation authority`);
  }
}

function checkMarkdownConsistency(content, label, evidence) {
  const human = sectionBody(content, "Human Summary");
  if (human.includes(evidence.plan_review_state) && human.includes(evidence.ready_for_implementation_review)) {
    pass(`${label} Human Summary matches structured state`);
  } else {
    fail(`${label} Human Summary must include structured state and readiness`);
  }
  const boundaryText = sectionBody(content, "Boundaries");
  if (boundaryText.includes("This report authorizes implementation") && boundaryText.includes("No")) {
    pass(`${label} Markdown boundaries show non-authorization`);
  } else {
    fail(`${label} Markdown boundaries must show non-authorization`);
  }
}

function resolveAsset(relativePath) {
  const direct = path.join(projectRoot, relativePath);
  if (fs.existsSync(direct) && fs.statSync(direct).isFile()) return direct;
  const managed = path.join(projectRoot, ".intentos", relativePath);
  if (fs.existsSync(managed) && fs.statSync(managed).isFile()) return managed;
  return null;
}

function resolveDirectory(relativePath) {
  const direct = path.join(projectRoot, relativePath);
  if (fs.existsSync(direct) && fs.statSync(direct).isDirectory()) return direct;
  const managed = path.join(projectRoot, ".intentos", relativePath);
  if (fs.existsSync(managed) && fs.statSync(managed).isDirectory()) return managed;
  return null;
}

function resolveRelativeFile(relativePath) {
  if (!relativePath || relativePath === "N/A" || path.isAbsolute(relativePath) || relativePath.includes("..")) return null;
  const candidate = path.resolve(projectRoot, relativePath);
  const relative = path.relative(projectRoot, candidate);
  if (relative.startsWith("..") || path.isAbsolute(relative)) return null;
  return fs.existsSync(candidate) && fs.statSync(candidate).isFile() ? candidate : null;
}

function readResolved(relativePath) {
  const resolved = resolveAsset(relativePath);
  return resolved ? fs.readFileSync(resolved, "utf8") : "";
}

function displayAsset(relativePath, resolved) {
  const normalized = resolved.replaceAll(path.sep, "/");
  return normalized.includes("/.intentos/") ? `.intentos/${relativePath}` : relativePath;
}

function markdownFiles(dir) {
  const roots = [path.join(projectRoot, dir), path.join(projectRoot, ".intentos", dir)];
  const files = [];
  for (const root of roots) {
    if (!fs.existsSync(root)) continue;
    walk(root, files);
  }
  return files.filter((file) => file.endsWith(".md")).sort();
}

function walk(current, files) {
  for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
    const fullPath = path.join(current, entry.name);
    if (entry.isDirectory()) walk(fullPath, files);
    else if (entry.isFile()) files.push(fullPath);
  }
}

function reportRefCandidates(file) {
  const relative = path.relative(projectRoot, file).replaceAll(path.sep, "/");
  const withoutIntentos = relative.startsWith(".intentos/") ? relative.slice(".intentos/".length) : relative;
  return [relative, withoutIntentos, `artifact:${withoutIntentos}`];
}

function fileDigest(file) {
  return `sha256:${crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex")}`;
}

function zeroDigest() {
  return `sha256:${"0".repeat(64)}`;
}

function rel(file) {
  return path.relative(projectRoot, file).replaceAll(path.sep, "/") || ".";
}

function pass(message) {
  checks.push({ ok: true, message });
  if (!outputJson) console.log(`PASS ${message}`);
}

function fail(message) {
  failed = true;
  checks.push({ ok: false, message });
  if (!outputJson) console.error(`FAIL ${message}`);
}

function emitAndExit() {
  if (outputJson) {
    console.log(JSON.stringify({
      ok: !failed,
      checks,
    }, null, 2));
  } else {
    console.log("");
    console.log(failed ? "Plan review check failed." : "Plan review check passed.");
  }
  if (failed) process.exit(1);
}
