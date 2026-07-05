#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import {
  evidenceDigest,
  extractMachineReadableEvidence,
  loadSchema,
  resolveEvidenceReference,
  validateEvidenceBlock,
  validateSchema,
} from "./lib/artifact-schema.mjs";
import { containsSecretLikeValue } from "./lib/risk-surfaces.mjs";
import { sectionBody, splitMarkdownRow, stripMarkdown } from "./lib/markdown.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set([
  "json",
  "mode",
  "report",
  "require-structured-evidence",
  "strict-evidence",
  "resolve-evidence-refs",
  "require-precise-evidence",
  "require-business-rule-ref",
  "require-business-rule-ready",
]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputJson = Boolean(args.json);
const requestedMode = args.mode ? String(args.mode).trim().toLowerCase() : "";
const requestedReport = args.report ? String(args.report).trim() : "";
const requireStructuredEvidence = Boolean(args["require-structured-evidence"]);
const strictEvidence = Boolean(args["strict-evidence"]);
const requirePreciseEvidence = Boolean(args["require-precise-evidence"]);
const requireBusinessRuleRef = Boolean(args["require-business-rule-ref"] || args["require-business-rule-ready"]);
const requireBusinessRuleReady = Boolean(args["require-business-rule-ready"]);
const effectiveRequireStructuredEvidence = requireStructuredEvidence || requireBusinessRuleRef || requireBusinessRuleReady;
const resolveEvidenceRefs = Boolean(args["resolve-evidence-refs"] || requirePreciseEvidence);
const structuredEvidenceSchema = loadSchema(projectRoot, "schemas/artifacts/change-impact-coverage.schema.json");
const businessRuleClosureSchema = loadSchema(projectRoot, "schemas/artifacts/business-rule-closure.schema.json");
const isSourceRepo = fs.existsSync(path.join(projectRoot, "intentos-manifest.json"))
  && fs.existsSync(path.join(projectRoot, "core", "workflow.md"));
const shouldRequireAssets = isSourceRepo
  || fs.existsSync(path.join(projectRoot, ".intentos", "intentos-manifest.json"))
  || fs.existsSync(path.join(projectRoot, ".intentos", "version.json"));

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

if (requestedMode && !["preflight", "closure"].includes(requestedMode)) {
  console.error(`FAIL unknown --mode: ${requestedMode}`);
  console.error("Use --mode preflight or --mode closure.");
  process.exit(1);
}

const requiredAssets = [
  "core/change-impact-coverage.md",
  "docs/change-impact-coverage.md",
  "templates/change-impact-coverage-report.md",
  "checklists/change-impact-coverage-review.md",
  "prompts/change-impact-coverage-agent.md",
  "schemas/artifacts/change-impact-coverage.schema.json",
  "scripts/resolve-change-impact-coverage.mjs",
  "scripts/check-change-impact-coverage.mjs",
];

const requiredDirectories = [
  "change-impact-coverage-reports",
];

const reportSections = [
  "Human Summary",
  "User Request",
  "Change Type",
  "Affected Surface Map",
  "Out-of-Scope Decisions",
  "Human Decisions Needed",
  "Implementation Coverage",
  "Verification Coverage",
  "Missed Surface Review",
  "Boundaries",
  "Outcome",
];

const allowedSurfaces = new Set([
  "USER_FLOW",
  "FRONTEND_UI",
  "API_CONTRACT",
  "BACKEND_RULE",
  "DATA_MODEL",
  "ERROR_COPY",
  "TEST_COVERAGE",
  "DOCS_HANDOFF",
  "PERMISSION_RISK",
  "RELEASE_IMPACT",
]);

const allowedMapStatuses = new Set(["REQUIRED", "OPTIONAL", "NOT_APPLICABLE", "NEEDS_HUMAN_DECISION"]);
const allowedCoverageStatuses = new Set(["DONE", "NOT_APPLICABLE", "OUT_OF_SCOPE", "NEEDS_HUMAN_DECISION", "NOT_STARTED"]);
const allowedOutcomes = new Set(["CHANGE_IMPACT_RECORDED", "NEEDS_HUMAN_DECISION", "BLOCKED"]);
const highRiskSurfaces = new Set(["DATA_MODEL", "PERMISSION_RISK", "RELEASE_IMPACT"]);

const forbiddenClaims = [
  /\bwrites target files:\s*Yes\b/i,
  /\bauthorizes implementation:\s*Yes\b/i,
  /\bapproves release or production:\s*Yes\b/i,
  /\breplaces human product judgment:\s*Yes\b/i,
  /\bproves every possible impact was found:\s*Yes\b/i,
  /\bimplementation approved\b/i,
  /\brelease approved\b/i,
  /\bproduction ready\b/i,
  /\bsafe to launch\b/i,
];

let failed = false;
const checks = [];

if (!outputJson) {
  console.log("# Change Impact Coverage Check");
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

if (isSourceRepo) checkSourceEvidence();
else pass("source-only 1.48 change impact coverage evidence checks skipped for target project");

emitAndExit();

function checkCoreContent() {
  const core = readResolved("core/change-impact-coverage.md");
  if (!core) return;
  for (const marker of [
    "Change Impact Coverage",
    "prevents partial implementation",
    "Surface Classes",
    "USER_FLOW",
    "FRONTEND_UI",
    "API_CONTRACT",
    "BACKEND_RULE",
    "TEST_COVERAGE",
    "This report authorizes implementation: No",
    "This report approves release or production: No",
  ]) {
    if (core.includes(marker)) pass(`change impact coverage core includes ${marker}`);
    else fail(`change impact coverage core missing ${marker}`);
  }
}

function checkReports() {
  const files = requestedReport ? selectedReportFiles(requestedReport) : markdownFiles("change-impact-coverage-reports");
  if (files.length === 0) {
    pass("change impact coverage check skipped: no reports");
    return;
  }

  for (const file of files) checkReport(file);
}

function checkReport(file) {
  const content = fs.readFileSync(file, "utf8");
  const label = rel(file);
  for (const section of reportSections) requireSection(content, section, label);

  if (containsSecretLikeValue(content)) fail(`${label} contains secret-like content`);
  for (const pattern of forbiddenClaims) {
    if (pattern.test(content)) fail(`${label} contains forbidden change impact claim: ${pattern.source}`);
  }

  const mapRows = parseSurfaceRows(sectionBody(content, "Affected Surface Map"));
  const coverageRows = parseSurfaceRows(sectionBody(content, "Implementation Coverage"));
  const verificationRows = parseSurfaceRows(sectionBody(content, "Verification Coverage"));
  const markdownMode = modeFromMarkdown(content);
  const markdownChangedFiles = changedFilesFromMarkdown(content);

  if (mapRows.length === 0) fail(`${label} must include affected surface rows`);
  if (coverageRows.length === 0) fail(`${label} must include implementation coverage rows`);
  if (verificationRows.length === 0) fail(`${label} must include verification coverage rows`);

  for (const row of mapRows) {
    requireAllowedSurface(label, row.surface);
    if (allowedMapStatuses.has(row.status)) pass(`${label} map status ${row.surface}: ${row.status}`);
    else fail(`${label} invalid affected surface status for ${row.surface}: ${row.status || "<empty>"}`);
    if ((row.status === "REQUIRED" || row.status === "NEEDS_HUMAN_DECISION") && !meaningful(row.expected_evidence)) {
      fail(`${label} required surface ${row.surface} needs expected evidence`);
    }
  }

  for (const row of coverageRows) {
    requireAllowedSurface(label, row.surface);
    if (allowedCoverageStatuses.has(row.status)) pass(`${label} coverage status ${row.surface}: ${row.status}`);
    else fail(`${label} invalid implementation coverage status for ${row.surface}: ${row.status || "<empty>"}`);
    if (row.status === "DONE" && !meaningful(row.evidence)) fail(`${label} DONE surface ${row.surface} needs evidence`);
    if (row.status === "DONE" && strictEvidence && placeholderEvidence(row.evidence)) {
      fail(`${label} DONE surface ${row.surface} uses placeholder evidence`);
    }
    if (row.status === "DONE" && resolveEvidenceRefs) {
      requireResolvableEvidenceRef(label, file, row, "implementation coverage");
    }
    if ((row.status === "NOT_APPLICABLE" || row.status === "OUT_OF_SCOPE") && !meaningful(row.reason)) {
      fail(`${label} ${row.status} surface ${row.surface} needs reason`);
    }
    if (row.status === "NOT_APPLICABLE" && highRiskSurfaces.has(row.surface) && weakReason(row.reason)) {
      fail(`${label} high-risk surface ${row.surface} cannot be NOT_APPLICABLE without concrete reason`);
    }
  }

  requireBoundaryNo(content, label, "This report writes target files");
  requireBoundaryNo(content, label, "This report authorizes implementation");
  requireBoundaryNo(content, label, "This report approves release or production");
  requireBoundaryNo(content, label, "This report replaces human product judgment");
  requireBoundaryNo(content, label, "This report proves every possible impact was found");

  const outcome = codeOrTextValue(sectionBody(content, "Outcome"));
  if (allowedOutcomes.has(outcome)) pass(`${label} has valid Outcome`);
  else fail(`${label} has invalid Outcome: ${outcome || "<empty>"}`);

  for (const row of verificationRows) {
    if (row.status === "DONE" && !meaningful(row.evidence)) fail(`${label} DONE verification ${row.surface} needs evidence`);
    if (row.status === "DONE" && strictEvidence && placeholderEvidence(row.evidence)) {
      fail(`${label} DONE verification ${row.surface} uses placeholder evidence`);
    }
    if (row.status === "DONE" && resolveEvidenceRefs) {
      requireResolvableEvidenceRef(label, file, row, "verification coverage");
    }
  }

  const structured = checkMachineReadableEvidence(content, label, {
    outcome,
    markdownMode,
    mapRows,
    coverageRows,
    verificationRows,
    file,
  });
  const effectiveMode = requestedMode || structured?.mode || markdownMode || "preflight";
  const changedFiles = structured?.changed_files || markdownChangedFiles;

  if (effectiveMode === "closure") checkClosureMode(label, mapRows, coverageRows);
  checkCrossSurfaceCoverage(content, label, mapRows, coverageRows, verificationRows, {
    mode: effectiveMode,
    changedFiles,
  });
}

function checkCrossSurfaceCoverage(content, label, mapRows, coverageRows, verificationRows, options = {}) {
  const text = stripMarkdown(content).toLowerCase();
  const isRuleChange = /\b(contract input restriction|input restriction|validation|business rule|form rule|required|limit)\b/i.test(text);
  const map = new Map(mapRows.map((row) => [row.surface, row]));
  const coverage = new Map(coverageRows.map((row) => [row.surface, row]));
  const changedSurfaces = inferChangedFileSurfaces(options.changedFiles || []);

  if (isRuleChange) {
    for (const surface of ["USER_FLOW", "FRONTEND_UI", "API_CONTRACT", "BACKEND_RULE", "ERROR_COPY", "TEST_COVERAGE", "DOCS_HANDOFF"]) {
      if (!map.has(surface)) fail(`${label} rule change missing affected surface ${surface}`);
      if (!coverage.has(surface)) fail(`${label} rule change missing implementation coverage ${surface}`);
      else if (!closedOrPendingDecision(coverage.get(surface), true)) {
        fail(`${label} rule change surface ${surface} is not closed or decision-bound`);
      }
    }
  }

  const backendDone = coverage.get("BACKEND_RULE")?.status === "DONE";
  const frontendDone = coverage.get("FRONTEND_UI")?.status === "DONE";
  const apiDone = coverage.get("API_CONTRACT")?.status === "DONE";

  if (isRuleChange && backendDone) {
    for (const surface of ["FRONTEND_UI", "API_CONTRACT", "ERROR_COPY", "TEST_COVERAGE"]) {
      const row = coverage.get(surface);
      if (!closedOrPendingDecision(row, false)) fail(`${label} backend rule change must close ${surface}`);
    }
  }

  if (isRuleChange && frontendDone) {
    for (const surface of ["BACKEND_RULE", "API_CONTRACT", "TEST_COVERAGE"]) {
      const row = coverage.get(surface);
      if (!closedOrPendingDecision(row, false)) fail(`${label} frontend rule change must close ${surface}`);
    }
  }

  if (apiDone) {
    const testRow = coverage.get("TEST_COVERAGE");
    if (!testRow || testRow.status !== "DONE" || !meaningful(testRow.evidence)) {
      fail(`${label} API contract change needs DONE test coverage evidence`);
    }
  }

  const testVerified = verificationRows.some((row) => row.surface === "TEST_COVERAGE" && row.status === "DONE" && meaningful(row.evidence));
  if ((backendDone || frontendDone || apiDone) && !testVerified) {
    fail(`${label} completed rule/API surfaces need verification coverage evidence`);
  }

  if (options.mode === "closure") {
    checkChangedFileImplications(label, isRuleChange, coverage, changedSurfaces);
  }
}

function checkClosureMode(label, mapRows, coverageRows) {
  const coverage = new Map(coverageRows.map((row) => [row.surface, row]));
  for (const row of mapRows) {
    if (row.status !== "REQUIRED") continue;
    const covered = coverage.get(row.surface);
    if (!covered) {
      fail(`${label} closure mode requires implementation coverage for ${row.surface}`);
      continue;
    }
    if (covered.status === "NOT_STARTED") {
      fail(`${label} closure mode cannot leave required surface ${row.surface} NOT_STARTED`);
    }
    if (!closedOrPendingDecision(covered, false)) {
      fail(`${label} closure mode requires required surface ${row.surface} to be closed, out-of-scope, not-applicable with reason, or decision-bound`);
    }
  }
}

function checkChangedFileImplications(label, isRuleChange, coverage, changedSurfaces) {
  if (changedSurfaces.size === 0) return;

  if (isRuleChange && changedSurfaces.has("BACKEND_RULE")) {
    for (const surface of ["FRONTEND_UI", "API_CONTRACT", "ERROR_COPY", "TEST_COVERAGE"]) {
      if (!closedOrPendingDecision(coverage.get(surface), false)) {
        fail(`${label} closure changed-files backend rule work must close ${surface}`);
      }
    }
  }

  if (isRuleChange && changedSurfaces.has("FRONTEND_UI")) {
    for (const surface of ["BACKEND_RULE", "API_CONTRACT", "TEST_COVERAGE"]) {
      if (!closedOrPendingDecision(coverage.get(surface), false)) {
        fail(`${label} closure changed-files frontend rule work must close ${surface}`);
      }
    }
  }

  if (changedSurfaces.has("API_CONTRACT")) {
    const testRow = coverage.get("TEST_COVERAGE");
    if (!testRow || testRow.status !== "DONE" || !meaningful(testRow.evidence)) {
      fail(`${label} closure changed-files API contract work needs DONE test coverage evidence`);
    }
  }

  for (const [surface, message] of [
    ["DATA_MODEL", "data model changed files cannot be weakly excluded"],
    ["PERMISSION_RISK", "permission/security changed files cannot be weakly excluded"],
    ["RELEASE_IMPACT", "release/CI changed files cannot be weakly excluded"],
  ]) {
    if (!changedSurfaces.has(surface)) continue;
    const row = coverage.get(surface);
    if (!row) {
      fail(`${label} closure changed-files ${message}: missing ${surface} coverage`);
    } else if (row.status === "NOT_APPLICABLE" && weakReason(row.reason)) {
      fail(`${label} closure changed-files ${message}: ${surface} has weak NOT_APPLICABLE reason`);
    } else if (row.status === "NOT_STARTED") {
      fail(`${label} closure changed-files ${message}: ${surface} is NOT_STARTED`);
    } else {
      pass(`${label} closure changed-files closes ${surface}`);
    }
  }
}

function closedOrPendingDecision(row, allowNotStarted = false) {
  if (!row) return false;
  if (row.status === "DONE") return meaningful(row.evidence);
  if (row.status === "NEEDS_HUMAN_DECISION") return true;
  if (row.status === "NOT_APPLICABLE" || row.status === "OUT_OF_SCOPE") return meaningful(row.reason);
  return allowNotStarted && row.status === "NOT_STARTED";
}

function checkMachineReadableEvidence(content, label, markdown) {
  const result = validateEvidenceBlock(content, structuredEvidenceSchema, label, {
    require: effectiveRequireStructuredEvidence,
    digestField: "impact_digest",
  });
  if (!result.present && !effectiveRequireStructuredEvidence) {
    pass(`${label} structured evidence optional and not present`);
    return null;
  }
  if (!result.ok) {
    result.errors.forEach((error) => fail(error));
    return null;
  }

  const evidence = result.value;
  pass(`${label} has valid structured evidence`);

  if (requestedMode && evidence.mode !== requestedMode) {
    fail(`${label} structured mode ${evidence.mode} must match --mode ${requestedMode}`);
  } else {
    pass(`${label} structured mode recorded`);
  }

  if (markdown.markdownMode && evidence.mode !== markdown.markdownMode) {
    fail(`${label} structured mode ${evidence.mode} must match Markdown mode ${markdown.markdownMode}`);
  }

  if (evidence.outcome === markdown.outcome) pass(`${label} structured outcome matches Markdown outcome`);
  else fail(`${label} structured outcome ${evidence.outcome} must match Markdown outcome ${markdown.outcome}`);

  compareStructuredRows(label, "affected surface", evidence.affected_surface_map, markdown.mapRows);
  compareStructuredRows(label, "implementation coverage", evidence.implementation_coverage, markdown.coverageRows);
  compareStructuredRows(label, "verification coverage", evidence.verification_coverage, markdown.verificationRows);

  const boundaries = evidence.boundaries || {};
  for (const field of [
    "writes_target_files",
    "authorizes_implementation",
    "approves_release_or_production",
    "replaces_human_product_judgment",
    "proves_every_possible_impact_was_found",
  ]) {
    if (boundaries[field] === false) pass(`${label} structured boundary ${field}: false`);
    else fail(`${label} structured boundary ${field} must be false`);
  }

  if (strictEvidence) {
    for (const row of evidence.implementation_coverage || []) {
      if (row.status === "DONE" && placeholderEvidence(row.evidence)) {
        fail(`${label} structured DONE surface ${row.surface} uses placeholder evidence`);
      }
    }
    for (const row of evidence.verification_coverage || []) {
      if (row.status === "DONE" && placeholderEvidence(row.evidence)) {
        fail(`${label} structured DONE verification ${row.surface} uses placeholder evidence`);
      }
    }
  }

  if (resolveEvidenceRefs) {
    for (const row of evidence.implementation_coverage || []) {
      if (row.status === "DONE") requireResolvableEvidenceRef(label, markdown.file, row, "structured implementation coverage");
    }
    for (const row of evidence.verification_coverage || []) {
      if (row.status === "DONE") requireResolvableEvidenceRef(label, markdown.file, row, "structured verification coverage");
    }
  }

  checkBusinessRuleBinding(label, markdown.file, evidence);
  return evidence;
}

function checkBusinessRuleBinding(label, reportFile, evidence) {
  const ref = normalizeOptionalRef(evidence.business_rule_ref);
  if (!ref) {
    if (requireBusinessRuleRef || requireBusinessRuleReady) {
      fail(`${label} business_rule_ref is required`);
    } else {
      pass(`${label} business_rule_ref optional and not provided`);
    }
    return;
  }

  const resolved = resolveBusinessRuleReport(reportFile, ref);
  if (!resolved) {
    fail(`${label} business_rule_ref is not resolvable: ${ref}`);
    return;
  }
  pass(`${label} business_rule_ref resolves: ${ref}`);

  const content = fs.readFileSync(resolved, "utf8");
  const extracted = extractMachineReadableEvidence(content);
  if (!extracted) {
    fail(`${label} business_rule_ref ${ref} missing Machine-Readable Evidence`);
    return;
  }
  if (!extracted.ok) {
    for (const error of extracted.errors) fail(`${label} business_rule_ref ${ref}: ${error}`);
    return;
  }

  const businessRule = extracted.value;
  if (!businessRuleClosureSchema) {
    fail(`${label} business rule closure schema is missing`);
  } else {
    const validation = validateSchema(businessRule, businessRuleClosureSchema, { label: `${label} business_rule_ref ${ref}` });
    if (validation.ok) pass(`${label} business_rule_ref has valid Business Rule Closure structured evidence`);
    else for (const error of validation.errors) fail(error);
  }

  const allowedRefs = businessRuleRefCandidates(resolved);
  if (allowedRefs.includes(businessRule.business_rule_ref)) {
    pass(`${label} referenced Business Rule Closure self-ref matches its report`);
  } else {
    fail(`${label} referenced Business Rule Closure self-ref ${businessRule.business_rule_ref || "<missing>"} must point to ${allowedRefs.join(" or ")}`);
  }

  if (businessRule.business_rule_ref === ref) pass(`${label} business_rule_ref matches referenced Business Rule Closure ref`);
  else fail(`${label} business_rule_ref ${ref} must match referenced Business Rule Closure ref ${businessRule.business_rule_ref || "<missing>"}`);

  const expectedDigest = evidenceDigest(businessRuleModelFrom(businessRule), []);
  if (businessRule.business_rule_digest === expectedDigest) {
    pass(`${label} referenced Business Rule Closure digest is internally valid`);
  } else {
    fail(`${label} referenced Business Rule Closure business_rule_digest does not match normalized business rule`);
  }

  if (normalizeOptionalRef(evidence.business_rule_digest)) {
    if (evidence.business_rule_digest === businessRule.business_rule_digest) {
      pass(`${label} business_rule_digest matches referenced Business Rule Closure`);
    } else {
      fail(`${label} business_rule_digest ${evidence.business_rule_digest} must match referenced Business Rule Closure ${businessRule.business_rule_digest || "<missing>"}`);
    }
  } else if (requireBusinessRuleReady) {
    fail(`${label} business_rule_digest is required when --require-business-rule-ready is used`);
  } else {
    pass(`${label} business_rule_digest optional and not provided`);
  }

  if (normalizeOptionalRef(evidence.business_rule_state)) {
    if (evidence.business_rule_state === businessRule.state) {
      pass(`${label} business_rule_state matches referenced Business Rule Closure`);
    } else {
      fail(`${label} business_rule_state ${evidence.business_rule_state} must match referenced Business Rule Closure ${businessRule.state || "<missing>"}`);
    }
  } else if (requireBusinessRuleReady) {
    fail(`${label} business_rule_state is required when --require-business-rule-ready is used`);
  } else {
    pass(`${label} business_rule_state optional and not provided`);
  }

  if (requireBusinessRuleReady) {
    if (businessRule.state === "READY_FOR_IMPACT_COVERAGE") pass(`${label} referenced Business Rule Closure is READY_FOR_IMPACT_COVERAGE`);
    else fail(`${label} referenced Business Rule Closure must be READY_FOR_IMPACT_COVERAGE, got ${businessRule.state || "<missing>"}`);

    if (businessRule.can_enter_impact_coverage === "Yes") pass(`${label} referenced Business Rule Closure can enter impact coverage`);
    else fail(`${label} referenced Business Rule Closure can_enter_impact_coverage must be Yes`);

    const boundaries = businessRule.boundaries || {};
    for (const field of [
      "writes_target_files",
      "authorizes_implementation",
      "approves_release_or_production",
      "approves_high_risk_domain_decisions",
      "proves_real_environment_behavior",
    ]) {
      if (boundaries[field] === "No") pass(`${label} referenced Business Rule Closure boundary ${field}: No`);
      else fail(`${label} referenced Business Rule Closure boundary ${field} must be No`);
    }
  }
}

function normalizeOptionalRef(value) {
  const text = String(value || "").trim();
  if (!text || /^not provided$/i.test(text)) return "";
  return text;
}

function resolveBusinessRuleReport(reportFile, ref) {
  const match = String(ref || "").trim().match(/^artifact:(.+)$/i);
  if (!match) return null;
  const relativeRef = match[1].trim();
  if (!relativeRef || path.isAbsolute(relativeRef)) return null;
  const candidates = [
    path.resolve(projectRoot, relativeRef),
    path.resolve(path.dirname(reportFile), relativeRef),
  ];
  if (!relativeRef.startsWith(".intentos/")) {
    candidates.push(path.resolve(projectRoot, ".intentos", relativeRef));
  }
  for (const candidate of candidates) {
    const relative = path.relative(projectRoot, candidate);
    if (relative.startsWith("..") || path.isAbsolute(relative)) continue;
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile() && /\.md$/i.test(candidate)) return candidate;
  }
  return null;
}

function businessRuleRefCandidates(file) {
  const relative = rel(file);
  const candidates = [`artifact:${relative}`];
  if (relative.startsWith(".intentos/")) candidates.push(`artifact:${relative.slice(".intentos/".length)}`);
  return candidates;
}

function businessRuleModelFrom(evidence) {
  return {
    task_ref: evidence.task_ref,
    user_request: evidence.user_request,
    primary_business_rule_type: evidence.primary_business_rule_type,
    business_rule_types: evidence.business_rule_types,
    risk_domains: evidence.risk_domains,
    dimensions: evidence.dimensions,
    decision_items: evidence.decision_items,
    safe_defaults: evidence.safe_defaults,
    out_of_scope: evidence.out_of_scope,
    source_rule_refs: evidence.source_rule_refs,
    conflicts: evidence.conflicts,
    unknown_authority_items: evidence.unknown_authority_items,
    real_environment_validation: evidence.real_environment_validation,
    state: evidence.state,
  };
}

function compareStructuredRows(label, name, structuredRows = [], markdownRows = []) {
  const markdownBySurface = new Map(markdownRows.map((row) => [row.surface, row]));
  for (const row of structuredRows) {
    const markdownRow = markdownBySurface.get(row.surface);
    if (!markdownRow) {
      fail(`${label} structured ${name} ${row.surface} missing from Markdown table`);
    } else if (normalizeEnum(row.status) !== markdownRow.status) {
      fail(`${label} structured ${name} ${row.surface} status ${row.status} must match Markdown status ${markdownRow.status}`);
    } else {
      pass(`${label} structured ${name} ${row.surface} matches Markdown status`);
    }
  }
}

function modeFromMarkdown(content) {
  const body = sectionBody(content, "Change Type");
  const match = body.match(/Mode\s*:\s*`?([a-z]+)`?/i);
  if (!match) return "";
  const value = match[1].toLowerCase();
  return ["preflight", "closure"].includes(value) ? value : "";
}

function changedFilesFromMarkdown(content) {
  const body = sectionBody(content, "Changed Files");
  if (!body) return [];
  return String(body).split("\n")
    .map((line) => {
      const code = line.match(/`([^`]+)`/);
      return code ? code[1].trim() : line.replace(/^[-*\s]+/, "").trim();
    })
    .filter((line) => line && !/^none provided\.?$/i.test(line));
}

function inferChangedFileSurfaces(files) {
  const surfaces = new Set();
  for (const file of files || []) {
    const normalized = String(file || "").toLowerCase();
    if (!normalized) continue;
    if (/(^|\/)(pages?|views?|components?|client|frontend|ui|app|src\/app|src\/components|wxml|wxss|css|scss|tsx?|jsx?)\b/.test(normalized)) surfaces.add("FRONTEND_UI");
    if (/(^|\/)(server|backend|services?|controllers?|handlers?|domain|rules?|validators?|validation)\b/.test(normalized)) surfaces.add("BACKEND_RULE");
    if (/(api|dto|schema|contract|routes?|openapi|graphql|endpoint)/.test(normalized)) surfaces.add("API_CONTRACT");
    if (/(migration|database|db|model|models|enum|lookup|seed|prisma|drizzle|sql)/.test(normalized)) surfaces.add("DATA_MODEL");
    if (/(auth|permission|rbac|tenant|privacy|security|audit|role)/.test(normalized)) surfaces.add("PERMISSION_RISK");
    if (/(\.github\/workflows|ci|deploy|deployment|release|rollback|feature-flag|feature_flag|production)/.test(normalized)) surfaces.add("RELEASE_IMPACT");
    if (/(test|spec|fixture|e2e|playwright|vitest|jest)/.test(normalized)) surfaces.add("TEST_COVERAGE");
    if (/(readme|docs?|handoff|release-note|changelog)/.test(normalized)) surfaces.add("DOCS_HANDOFF");
  }
  return surfaces;
}

function checkSourceEvidence() {
  for (const file of [
    "core/change-impact-coverage.md",
    "docs/change-impact-coverage.md",
    "templates/change-impact-coverage-report.md",
    "checklists/change-impact-coverage-review.md",
    "prompts/change-impact-coverage-agent.md",
    "docs/plans/evidence-reference-resolution-1.50-plan.md",
    "docs/plans/closeout-evidence-precision-1.51-plan.md",
    "change-impact-coverage-reports/.gitkeep",
    "schemas/artifacts/change-impact-coverage.schema.json",
    "scripts/resolve-change-impact-coverage.mjs",
    "scripts/check-change-impact-coverage.mjs",
    "examples/1.48-change-impact-coverage/contract-input-rule/README.md",
    "examples/1.48-change-impact-coverage/contract-input-rule/change-impact-coverage-reports/001-contract-input-rule.md",
    "examples/1.49-structured-impact-coverage/contract-input-rule/README.md",
    "examples/1.49-structured-impact-coverage/contract-input-rule/change-impact-coverage-reports/001-contract-input-rule.md",
    "examples/1.49-structured-impact-coverage/contract-input-rule/evidence/user-flow-contract-title-required.txt",
    "examples/1.49-structured-impact-coverage/contract-input-rule/evidence/frontend-contract-form-validation.txt",
    "examples/1.49-structured-impact-coverage/contract-input-rule/evidence/api-contract-title-validation.txt",
    "examples/1.49-structured-impact-coverage/contract-input-rule/evidence/backend-contract-validation.txt",
    "examples/1.49-structured-impact-coverage/contract-input-rule/evidence/error-copy-title-required.txt",
    "examples/1.49-structured-impact-coverage/contract-input-rule/evidence/test-contract-input-rule.txt",
    "examples/1.49-structured-impact-coverage/contract-input-rule/evidence/docs-contract-input-rule.md",
    "examples/1.50-evidence-reference-resolution/README.md",
    "test-fixtures/bad/bad-change-impact-backend-only/change-impact-coverage-reports/001-bad.md",
    "test-fixtures/bad/bad-change-impact-frontend-only/change-impact-coverage-reports/001-bad.md",
    "test-fixtures/bad/bad-change-impact-api-without-tests/change-impact-coverage-reports/001-bad.md",
    "test-fixtures/bad/bad-change-impact-high-risk-na/change-impact-coverage-reports/001-bad.md",
    "test-fixtures/bad/bad-change-impact-approves-implementation/change-impact-coverage-reports/001-bad.md",
    "test-fixtures/bad/bad-change-impact-missing-structured-evidence/change-impact-coverage-reports/001-bad.md",
    "test-fixtures/bad/bad-change-impact-placeholder-evidence/change-impact-coverage-reports/001-bad.md",
    "test-fixtures/bad/bad-change-impact-closure-not-started/change-impact-coverage-reports/001-bad.md",
    "test-fixtures/bad/bad-change-impact-missing-evidence-ref/change-impact-coverage-reports/001-bad.md",
    "test-fixtures/bad/bad-change-impact-weak-evidence/change-impact-coverage-reports/001-bad.md",
    "test-fixtures/bad/bad-change-impact-weak-evidence/evidence/weak.txt",
    "test-fixtures/bad/bad-change-impact-unresolved-artifact-ref/change-impact-coverage-reports/001-bad.md",
    "releases/1.48.0/release-record.md",
    "releases/1.48.0/known-limitations.md",
    "releases/1.48.0/self-check-report.md",
    "releases/1.49.0/release-record.md",
    "releases/1.49.0/known-limitations.md",
    "releases/1.49.0/self-check-report.md",
    "releases/1.50.0/release-record.md",
    "releases/1.50.0/known-limitations.md",
    "releases/1.50.0/self-check-report.md",
    "releases/1.51.0/release-record.md",
    "releases/1.51.0/known-limitations.md",
    "releases/1.51.0/self-check-report.md",
  ]) {
    if (exists(file)) pass(`1.49 change impact coverage source evidence exists ${file}`);
    else fail(`1.49 change impact coverage source evidence missing ${file}`);
  }

  const resolver = runNode(["scripts/resolve-change-impact-coverage.mjs", "examples/mvp-booking-web-app", "--intent", "add contract input restriction"]);
  if (resolver.status === 0
    && resolver.stdout.includes("Change Impact Coverage Report")
    && resolver.stdout.includes("FRONTEND_UI")
    && resolver.stdout.includes("BACKEND_RULE")
    && resolver.stdout.includes("This report writes target files: No")) {
    pass("1.49 change impact coverage resolver prints safe cross-surface report");
  } else {
    fail(`1.49 change impact coverage resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-change-impact-coverage.mjs", "examples/mvp-booking-web-app", "--intent", "add contract input restriction", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "CHANGE_IMPACT_COVERAGE_REPORT"
        && parsed.boundaries?.writesTargetFiles === "No"
        && parsed.machineReadableEvidence?.artifact_type === "change_impact_coverage"
        && parsed.affectedSurfaceMap?.some((item) => item.surface === "FRONTEND_UI")
        && parsed.affectedSurfaceMap?.some((item) => item.surface === "BACKEND_RULE")) {
        pass("1.49 change impact coverage resolver JSON includes boundaries, structured evidence, and cross-surface map");
      } else {
        fail(`1.49 change impact coverage resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.49 change impact coverage resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.49 change impact coverage resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const example = runNode(["scripts/check-change-impact-coverage.mjs", "examples/1.48-change-impact-coverage/contract-input-rule"]);
  if (example.status === 0 && example.stdout.includes("Change Impact Coverage check passed")) {
    pass("1.48 change impact coverage example passes checker");
  } else {
    fail(`1.48 change impact coverage example failed: ${example.stderr || example.stdout}`);
  }

  const strictExample = runNode([
    "scripts/check-change-impact-coverage.mjs",
    "examples/1.49-structured-impact-coverage/contract-input-rule",
    "--require-structured-evidence",
    "--mode",
    "closure",
    "--strict-evidence",
    "--resolve-evidence-refs",
    "--require-precise-evidence",
    "--report",
    "change-impact-coverage-reports/001-contract-input-rule.md",
  ]);
  if (strictExample.status === 0
    && strictExample.stdout.includes("has valid structured evidence")
    && strictExample.stdout.includes("precise evidence refs pass")
    && strictExample.stdout.includes("Change Impact Coverage check passed")) {
    pass("1.51 structured change impact coverage example passes strict precision checker");
  } else {
    fail(`1.49 structured change impact coverage example failed: ${strictExample.stderr || strictExample.stdout}`);
  }

  for (const fixture of [
    ["backend only", "test-fixtures/bad/bad-change-impact-backend-only", "backend rule change must close FRONTEND_UI", []],
    ["frontend only", "test-fixtures/bad/bad-change-impact-frontend-only", "frontend rule change must close BACKEND_RULE", []],
    ["API without tests", "test-fixtures/bad/bad-change-impact-api-without-tests", "API contract change needs DONE test coverage evidence", []],
    ["high-risk not applicable", "test-fixtures/bad/bad-change-impact-high-risk-na", "high-risk surface PERMISSION_RISK cannot be NOT_APPLICABLE", []],
    ["implementation approval", "test-fixtures/bad/bad-change-impact-approves-implementation", "forbidden change impact claim", []],
    ["missing structured evidence", "test-fixtures/bad/bad-change-impact-missing-structured-evidence", "Machine-Readable Evidence is required", ["--require-structured-evidence", "--mode", "closure"]],
    ["placeholder evidence", "test-fixtures/bad/bad-change-impact-placeholder-evidence", "uses placeholder evidence", ["--strict-evidence", "--mode", "closure"]],
    ["closure not started", "test-fixtures/bad/bad-change-impact-closure-not-started", "closure mode cannot leave required surface FRONTEND_UI NOT_STARTED", ["--mode", "closure"]],
    ["missing evidence ref", "test-fixtures/bad/bad-change-impact-missing-evidence-ref", "evidence ref is not resolvable", ["--mode", "closure", "--resolve-evidence-refs"]],
    ["weak precise evidence", "test-fixtures/bad/bad-change-impact-weak-evidence", "resolved evidence file is empty or too short", ["--mode", "closure", "--resolve-evidence-refs", "--require-precise-evidence"]],
    ["unresolved artifact ref", "test-fixtures/bad/bad-change-impact-unresolved-artifact-ref", "artifact record was not found", ["--mode", "closure", "--resolve-evidence-refs", "--require-precise-evidence"]],
  ]) {
    const [name, target, expected, extraArgs] = fixture;
    const result = runNode(["scripts/check-change-impact-coverage.mjs", target, ...extraArgs]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.49 change impact coverage rejects ${name}`);
    } else {
      fail(`1.49 change impact coverage must reject ${name}: ${output}`);
    }
  }
}

function requireAllowedSurface(label, surface) {
  if (allowedSurfaces.has(surface)) pass(`${label} uses allowed surface ${surface}`);
  else fail(`${label} has invalid surface: ${surface || "<empty>"}`);
}

function requireSection(content, section, label) {
  const body = sectionBody(content, section);
  if (body && body.trim()) pass(`${label} has ${section}`);
  else fail(`${label} missing ${section}`);
}

function requireBoundaryNo(content, label, key) {
  const pattern = new RegExp(`^-\\s*${escapeRegExp(key)}:\\s*No\\s*$`, "im");
  if (pattern.test(content)) pass(`${label} boundary ${key}: No`);
  else fail(`${label} missing boundary ${key}: No`);
}

function parseSurfaceRows(body) {
  return parseTable(body).map((row) => ({
    ...row,
    surface: normalizeEnum(row.surface),
    status: normalizeEnum(row.status),
  })).filter((row) => row.surface || row.status);
}

function parseTable(body) {
  const lines = String(body || "").split("\n").map((line) => line.trim()).filter((line) => line.startsWith("|"));
  if (lines.length < 3) return [];
  const headers = splitMarkdownRow(lines[0]).map((header) => normalizeHeader(header));
  return lines.slice(2).map((line) => {
    const row = {};
    splitMarkdownRow(line).forEach((cell, index) => {
      row[headers[index] || `col_${index}`] = stripMarkdown(cell);
    });
    return row;
  });
}

function normalizeHeader(value) {
  return stripMarkdown(value).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function normalizeEnum(value) {
  return stripMarkdown(value).replace(/\s*\/.*$/, "").trim().toUpperCase();
}

function weakReason(value) {
  const text = stripMarkdown(value).toLowerCase();
  return !meaningful(text) || /^(none|n\/a|not applicable|no|unknown|tbd|na)$/.test(text);
}

function meaningful(value) {
  const text = stripMarkdown(value).replace(/[|:\-\s]/g, "");
  return text.length >= 8 && !/^notstarted$/i.test(text);
}

function placeholderEvidence(value) {
  const text = stripMarkdown(value).trim().toLowerCase();
  if (!text) return true;
  return /\b(todo|tbd|placeholder|example placeholder|sample evidence|fake evidence|not recorded|not provided|manual example verification evidence|insert evidence|fill this|unknown)\b/.test(text);
}

function requireResolvableEvidenceRef(label, reportFile, row, context) {
  const refs = evidenceReferences(row.evidence);
  if (refs.length === 0) {
    fail(`${label} ${context} ${row.surface} evidence has no resolvable reference`);
    return;
  }

  if (requirePreciseEvidence) {
    let allResolved = true;
    for (const ref of refs) {
      const result = preciseEvidenceResolution(reportFile, ref);
      if (result.ok) {
        pass(`${label} ${context} ${row.surface} precise evidence ref resolves: ${ref}`);
      } else {
        allResolved = false;
        fail(`${label} ${context} ${row.surface} precise evidence ref failed: ${ref} (${result.reason})`);
      }
    }
    if (allResolved) pass(`${label} ${context} ${row.surface} precise evidence refs pass`);
    return;
  }

  const resolved = refs.find((ref) => isResolvableEvidenceRef(reportFile, ref));
  if (resolved) {
    pass(`${label} ${context} ${row.surface} evidence ref resolves`);
    return;
  }

  fail(`${label} ${context} ${row.surface} evidence ref is not resolvable: ${refs.join(", ")}`);
}

function evidenceReferences(value) {
  const raw = stripMarkdown(value).trim();
  if (!raw || placeholderEvidence(raw)) return [];
  const codeRefs = [...String(value || "").matchAll(/`([^`]+)`/g)]
    .map((match) => match[1].trim())
    .filter(Boolean);
  if (codeRefs.length > 0) return codeRefs;
  return raw.split(/\s*(?:,|;|\n)\s*/)
    .map((item) => item.trim())
    .map((item) => item.replace(/^(see|ref|file|evidence)\s*:\s*/i, "").trim())
    .filter(Boolean);
}

function isResolvableEvidenceRef(reportFile, ref) {
  const value = String(ref || "").trim();
  if (!value || placeholderEvidence(value)) return false;

  const commandOutput = value.match(/^command-output:(.+)$/i);
  if (commandOutput) {
    return Boolean(resolveEvidenceReference(projectRoot, reportFile, commandOutput[1].trim()));
  }

  if (/^(artifact|human-decision):[a-z0-9][a-z0-9._:/-]{2,}$/i.test(value)) {
    return true;
  }

  return Boolean(resolveEvidenceReference(projectRoot, reportFile, value));
}

function preciseEvidenceResolution(reportFile, ref) {
  const value = String(ref || "").trim();
  if (!value || placeholderEvidence(value)) return { ok: false, reason: "placeholder or empty reference" };

  const commandOutput = value.match(/^command-output:(.+)$/i);
  if (commandOutput) {
    return preciseFileResolution(reportFile, commandOutput[1].trim(), "command-output");
  }

  const artifact = value.match(/^artifact:(.+)$/i);
  if (artifact) {
    return preciseRecordedReferenceResolution(reportFile, artifact[1].trim(), "artifact");
  }

  const humanDecision = value.match(/^human-decision:(.+)$/i);
  if (humanDecision) {
    return preciseRecordedReferenceResolution(reportFile, humanDecision[1].trim(), "human-decision");
  }

  return preciseFileResolution(reportFile, value, "file");
}

function preciseFileResolution(reportFile, ref, kind) {
  const file = resolveEvidenceReference(projectRoot, reportFile, ref);
  if (!file) return { ok: false, reason: `${kind} reference is not project-local or does not exist` };
  const quality = evidenceFileQuality(file);
  if (!quality.ok) return quality;
  return { ok: true, file };
}

function preciseRecordedReferenceResolution(reportFile, ref, kind) {
  const direct = resolveEvidenceReference(projectRoot, reportFile, ref);
  if (direct) {
    const quality = evidenceFileQuality(direct);
    if (!quality.ok) return quality;
    return { ok: true, file: direct };
  }

  const found = findRecordedReference(ref, kind);
  if (!found) return { ok: false, reason: `${kind} record was not found` };
  const quality = evidenceFileQuality(found);
  if (!quality.ok) return quality;
  return { ok: true, file: found };
}

function findRecordedReference(ref, kind) {
  const needle = stripMarkdown(ref).trim();
  if (!needle || placeholderEvidence(needle)) return null;
  const roots = kind === "human-decision"
    ? ["approval-records", "guided-decision-summaries", "decision-briefs", "human-status-reports"]
    : [
        "change-impact-coverage-reports",
        "execution-closures",
        "review-surface-cards",
        "review-loop-reports",
        "change-boundary-reports",
        "debt-handoff-reports",
        "delivery-path-reports",
        "approval-records",
        "apply-plans",
      ];
  for (const root of roots) {
    const dir = path.join(projectRoot, root);
    if (!fs.existsSync(dir)) continue;
    const files = [];
    walk(dir, files);
    for (const file of files.filter((item) => item.endsWith(".md"))) {
      const relative = rel(file);
      if (relative === needle || relative.endsWith(`/${needle}`) || path.basename(file, ".md") === needle) return file;
      const content = fs.readFileSync(file, "utf8");
      if (containsRecordedId(content, needle)) return file;
    }
  }
  return null;
}

function containsRecordedId(content, id) {
  const escaped = escapeRegExp(id);
  return new RegExp(`"artifact_id"\\s*:\\s*"${escaped}"`, "i").test(content)
    || new RegExp(`\\bArtifact ID\\s*[:|]\\s*\`?${escaped}\`?`, "i").test(content)
    || new RegExp(`\\bDecision ID\\s*[:|]\\s*\`?${escaped}\`?`, "i").test(content)
    || new RegExp(`\\bApproval ID\\s*[:|]\\s*\`?${escaped}\`?`, "i").test(content);
}

function evidenceFileQuality(file) {
  let content = "";
  try {
    content = fs.readFileSync(file, "utf8");
  } catch (error) {
    return { ok: false, reason: `cannot read evidence file: ${error.message}` };
  }
  const text = stripMarkdown(content).replace(/\s+/g, " ").trim();
  if (text.length < 16) return { ok: false, reason: "resolved evidence file is empty or too short" };
  if (placeholderEvidence(text)) return { ok: false, reason: "resolved evidence file contains placeholder evidence" };
  return { ok: true, file };
}

function codeOrTextValue(body) {
  const code = String(body || "").match(/`([A-Z_]+)`/);
  if (code) return code[1];
  const text = String(body || "").trim().split(/\s+/)[0];
  return text ? text.replace(/[^A-Z_]/gi, "").toUpperCase() : "";
}

function markdownFiles(dir) {
  const rootDir = path.join(projectRoot, dir);
  if (!fs.existsSync(rootDir)) return [];
  const files = [];
  walk(rootDir, files);
  return files.filter((file) => /\.md$/i.test(file)).sort();
}

function selectedReportFiles(reportRef) {
  const candidates = [];
  if (path.isAbsolute(reportRef)) candidates.push(path.resolve(reportRef));
  else {
    candidates.push(path.resolve(projectRoot, reportRef));
    candidates.push(path.resolve(projectRoot, "change-impact-coverage-reports", reportRef));
  }
  for (const candidate of candidates) {
    const relative = path.relative(projectRoot, candidate);
    if (relative.startsWith("..") || path.isAbsolute(relative)) continue;
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile() && /\.md$/i.test(candidate)) {
      pass(`selected change impact coverage report found ${relative.replaceAll(path.sep, "/")}`);
      return [candidate];
    }
  }
  fail(`selected change impact coverage report is not resolvable: ${reportRef}`);
  return [];
}

function walk(dir, files) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else files.push(full);
  }
}

function resolveAsset(file) {
  const targetAsset = path.join(projectRoot, file);
  if (fs.existsSync(targetAsset)) return targetAsset;
  const nativeAsset = path.join(projectRoot, ".intentos", file);
  if (fs.existsSync(nativeAsset)) return nativeAsset;
  return null;
}

function resolveDirectory(dir) {
  const targetDir = path.join(projectRoot, dir);
  if (fs.existsSync(targetDir) && fs.statSync(targetDir).isDirectory()) return targetDir;
  return null;
}

function readResolved(file) {
  const resolved = resolveAsset(file);
  if (!resolved) return "";
  return fs.readFileSync(resolved, "utf8");
}

function exists(file) {
  return fs.existsSync(path.join(projectRoot, file));
}

function rel(file) {
  return path.relative(projectRoot, file).replaceAll(path.sep, "/");
}

function displayAsset(expected, resolved) {
  const relative = rel(resolved);
  return relative || expected;
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function runNode(argv) {
  return spawnSync(process.execPath, argv, {
    cwd: projectRoot,
    encoding: "utf8",
  });
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
      status: failed ? "FAIL" : "PASS",
      projectRoot,
      results: checks,
    }, null, 2));
  } else if (!failed) {
    console.log("");
    console.log("Change Impact Coverage check passed.");
  }
  process.exit(failed ? 1 : 0);
}
