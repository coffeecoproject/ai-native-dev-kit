#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { loadSchema, validateEvidenceBlock } from "./lib/artifact-schema.mjs";
import { containsSecretLikeValue } from "./lib/risk-surfaces.mjs";
import { sectionBody, splitMarkdownRow, stripMarkdown } from "./lib/markdown.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["json", "mode", "require-structured-evidence", "strict-evidence"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputJson = Boolean(args.json);
const requestedMode = args.mode ? String(args.mode).trim().toLowerCase() : "";
const requireStructuredEvidence = Boolean(args["require-structured-evidence"]);
const strictEvidence = Boolean(args["strict-evidence"]);
const structuredEvidenceSchema = loadSchema(projectRoot, "schemas/artifacts/change-impact-coverage.schema.json");
const isSourceRepo = fs.existsSync(path.join(projectRoot, "dev-kit-manifest.json"))
  && fs.existsSync(path.join(projectRoot, "core", "workflow.md"));
const shouldRequireAssets = isSourceRepo
  || fs.existsSync(path.join(projectRoot, ".ai-native", "dev-kit-manifest.json"))
  || fs.existsSync(path.join(projectRoot, ".ai-native", "version.json"));

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
  const files = markdownFiles("change-impact-coverage-reports");
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
  }

  const structured = checkMachineReadableEvidence(content, label, {
    outcome,
    markdownMode,
    mapRows,
    coverageRows,
    verificationRows,
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
    require: requireStructuredEvidence,
    digestField: "impact_digest",
  });
  if (!result.present && !requireStructuredEvidence) {
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

  return evidence;
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
    "change-impact-coverage-reports/.gitkeep",
    "schemas/artifacts/change-impact-coverage.schema.json",
    "scripts/resolve-change-impact-coverage.mjs",
    "scripts/check-change-impact-coverage.mjs",
    "examples/1.48-change-impact-coverage/contract-input-rule/README.md",
    "examples/1.48-change-impact-coverage/contract-input-rule/change-impact-coverage-reports/001-contract-input-rule.md",
    "examples/1.49-structured-impact-coverage/contract-input-rule/README.md",
    "examples/1.49-structured-impact-coverage/contract-input-rule/change-impact-coverage-reports/001-contract-input-rule.md",
    "test-fixtures/bad/bad-change-impact-backend-only/change-impact-coverage-reports/001-bad.md",
    "test-fixtures/bad/bad-change-impact-frontend-only/change-impact-coverage-reports/001-bad.md",
    "test-fixtures/bad/bad-change-impact-api-without-tests/change-impact-coverage-reports/001-bad.md",
    "test-fixtures/bad/bad-change-impact-high-risk-na/change-impact-coverage-reports/001-bad.md",
    "test-fixtures/bad/bad-change-impact-approves-implementation/change-impact-coverage-reports/001-bad.md",
    "test-fixtures/bad/bad-change-impact-missing-structured-evidence/change-impact-coverage-reports/001-bad.md",
    "test-fixtures/bad/bad-change-impact-placeholder-evidence/change-impact-coverage-reports/001-bad.md",
    "test-fixtures/bad/bad-change-impact-closure-not-started/change-impact-coverage-reports/001-bad.md",
    "releases/1.48.0/release-record.md",
    "releases/1.48.0/known-limitations.md",
    "releases/1.48.0/self-check-report.md",
    "releases/1.49.0/release-record.md",
    "releases/1.49.0/known-limitations.md",
    "releases/1.49.0/self-check-report.md",
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
  ]);
  if (strictExample.status === 0
    && strictExample.stdout.includes("has valid structured evidence")
    && strictExample.stdout.includes("Change Impact Coverage check passed")) {
    pass("1.49 structured change impact coverage example passes strict closure checker");
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
  const nativeAsset = path.join(projectRoot, ".ai-native", file);
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
