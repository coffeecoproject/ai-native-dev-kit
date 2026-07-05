#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { containsSecretLikeValue } from "./lib/risk-surfaces.mjs";
import { sectionBody, splitMarkdownRow, stripMarkdown } from "./lib/markdown.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["json", "require-structured-evidence", "report"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputJson = Boolean(args.json);
const requireStructuredEvidence = Boolean(args["require-structured-evidence"]);
const explicitReport = args.report ? path.resolve(process.cwd(), String(args.report)) : "";
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
  "core/existing-project-governance-convergence.md",
  "docs/existing-project-governance-convergence.md",
  "templates/governance-convergence-report.md",
  "schemas/artifacts/governance-convergence.schema.json",
  "checklists/governance-convergence-review.md",
  "prompts/governance-convergence-agent.md",
  "scripts/resolve-governance-convergence.mjs",
  "scripts/check-governance-convergence.mjs",
];
const requiredDirectories = ["governance-convergence-reports"];
const requiredSections = [
  "Human Summary",
  "Source Systems",
  "Convergence Dimensions",
  "Audit Bridge",
  "AI Log Policy",
  "Protected Authority",
  "Proposed Next Step",
  "Boundaries",
  "Outcome",
];
const requiredStructuredSections = ["Machine-Readable Evidence"];
const allowedStates = new Set([
  "CONVERGENCE_READY_FOR_PLAN",
  "CONVERGENCE_BLOCKED_BY_RULE_COVERAGE",
  "CONVERGENCE_BLOCKED_BY_PROJECT_AUTHORITY",
  "CONVERGENCE_BLOCKED_BY_DIRTY_WORKTREE",
  "CONVERGENCE_BLOCKED_BY_UPSTREAM_EVIDENCE",
  "CONVERGENCE_READ_ONLY_ONLY",
  "CONVERGENCE_PARTIAL",
]);
const allowedSourceStatuses = new Set(["RECORDED", "NEEDS_INPUT", "BLOCKED"]);
const allowedRecommendations = new Set([
  "KEEP_EXISTING_STRICTER",
  "KEEP_PROJECT_OWNED",
  "ADOPT_INTENTOS_GAP_AFTER_REVIEW",
  "MERGE_AFTER_REVIEW",
  "REPLACE_OBSOLETE_WORKFLOW_AFTER_APPROVAL",
  "MAP_TO_INTENTOS_ARTIFACT",
  "BLOCKED_NEEDS_OWNER",
  "BLOCKED_BY_RULE_COVERAGE",
  "NO_ACTION",
]);
const requiredDimensions = new Set([
  "workflow",
  "baseline",
  "audit",
  "release",
  "ci_hooks",
  "documents",
  "work_queue",
  "ai_logs",
  "risk_authority",
]);
const forbiddenClaims = [
  /\bwrite target files\b(?!\s*(?:\||:)\s*`?No`?)/i,
  /\bauthorizes? target-file writes\b(?!\s*(?:\||:)\s*`?No`?)/i,
  /\bapproves governance replacement\b(?!\s*(?:\||:)\s*`?No`?)/i,
  /\bapproves release or production\b(?!\s*(?:\||:)\s*`?No`?)/i,
  /\bmodifies CI or hooks\b(?!\s*(?:\||:)\s*`?No`?)/i,
  /\brewrites history\b(?!\s*(?:\||:)\s*`?No`?)/i,
  /\broutine command logs\b(?!\s*(?:\||:)\s*`?No`?)/i,
  /\bmaximizes migration\b(?!\s*(?:\||:)\s*`?No`?)/i,
  /\bproduction approved\b/i,
  /\bdeploy production\b/i,
  /\bIntentOS replaces existing governance\b/i,
  /\bai-logs for every command\b/i,
  /自动写入目标项目/i,
  /批准生产发布/i,
  /重写历史/i,
];

let failed = false;
const checks = [];

if (!outputJson) {
  console.log("# Governance Convergence Check");
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
    readResolved("core/existing-project-governance-convergence.md"),
    readResolved("docs/existing-project-governance-convergence.md"),
    readResolved("templates/governance-convergence-report.md"),
    readResolved("schemas/artifacts/governance-convergence.schema.json"),
  ].join("\n");
  if (!combined.trim()) return;
  for (const marker of [
    "Existing Project Governance Convergence",
    "IntentOS Operating Mode",
    "does not mean Codex can write project assets",
    "Audit Bridge",
    "AI Log Boundary",
    "KEEP_EXISTING_STRICTER",
    "CONVERGENCE_BLOCKED_BY_RULE_COVERAGE",
    "Governance Convergence Report",
    "governance_convergence_report",
  ]) {
    if (combined.includes(marker)) pass(`governance convergence docs include ${marker}`);
    else fail(`governance convergence docs missing ${marker}`);
  }
}

function checkReports() {
  const files = explicitReport ? [explicitReport] : markdownFiles("governance-convergence-reports");
  if (files.length === 0) {
    pass("governance convergence check skipped: no reports");
    return;
  }
  for (const file of files) {
    if (!fs.existsSync(file)) {
      fail(`missing explicit governance convergence report ${file}`);
      continue;
    }
    const content = fs.readFileSync(file, "utf8");
    const label = rel(file);
    if (containsSecretLikeValue(content)) fail(`${label} contains secret-like content`);
    if (!content.includes("This report is a derived read-only view")) {
      fail(`${label} must state derived read-only view boundary`);
    } else {
      pass(`${label} states derived read-only view boundary`);
    }
    for (const pattern of forbiddenClaims) {
      if (pattern.test(content)) fail(`${label} contains forbidden convergence claim: ${pattern.source}`);
    }
    for (const section of requiredSections) requireSection(content, section, label);
    if (requireStructuredEvidence) {
      for (const section of requiredStructuredSections) requireSection(content, section, label);
    }
    const summary = checkSummary(content, label);
    const dimensions = checkDimensions(content, label);
    checkAuditBridge(content, label);
    checkAiLogPolicy(content, label);
    checkBoundaries(content, label);
    const evidence = checkStructuredEvidence(content, label);
    checkStateAndOutcome(content, label, evidence, summary, dimensions);
  }
}

function checkSummary(content, label) {
  const body = sectionBody(content, "Human Summary") || "";
  const expected = [
    ["IntentOS Operating Mode", "ACTIVE"],
    ["Operating Mode Grants Write Permission", "No"],
    ["Can Codex write now", "No"],
    ["Convergence Authority", "DERIVED_READ_ONLY"],
    ["Approves Governance Replacement", "No"],
    ["Approves Release Or Production", "No"],
    ["Rewrites History", "No"],
  ];
  for (const [field, value] of expected) {
    const actual = tableValue(body, field);
    if (actual === value) pass(`${label} summary ${field} is ${value}`);
    else fail(`${label} summary ${field} must be ${value}`);
  }
  const state = tableValue(body, "Convergence State");
  if (allowedStates.has(state)) pass(`${label} summary convergence state is allowed`);
  else fail(`${label} summary convergence state invalid: ${state || "<empty>"}`);
  return { state };
}

function checkDimensions(content, label) {
  const body = sectionBody(content, "Convergence Dimensions") || "";
  const rows = tableRows(body);
  const seen = new Set();
  const byDimension = new Map();
  for (const row of rows) {
    const dimension = stripMarkdown(row[0] || "");
    const currentState = stripMarkdown(row[1] || "");
    const targetState = stripMarkdown(row[2] || "");
    const recommendation = stripMarkdown(row[3] || "");
    const humanDecision = stripMarkdown(row[4] || "");
    const applyPlan = stripMarkdown(row[5] || "");
    if (!dimension) continue;
    seen.add(dimension);
    byDimension.set(dimension, {
      dimension,
      current_state: currentState,
      target_state: targetState,
      recommendation,
      human_decision_required: humanDecision,
      write_requires_apply_plan: applyPlan,
    });
    if (allowedRecommendations.has(recommendation)) pass(`${label} ${dimension} recommendation is allowed`);
    else fail(`${label} ${dimension} recommendation invalid: ${recommendation || "<empty>"}`);
    if (humanDecision === "Yes") pass(`${label} ${dimension} requires human decision`);
    else fail(`${label} ${dimension} must require human decision`);
    if (applyPlan === "Yes") pass(`${label} ${dimension} requires apply plan before write`);
    else fail(`${label} ${dimension} must require apply plan before write`);
  }
  for (const dimension of requiredDimensions) {
    if (seen.has(dimension)) pass(`${label} includes ${dimension} dimension`);
    else fail(`${label} missing ${dimension} dimension`);
  }
  return byDimension;
}

function checkAuditBridge(content, label) {
  const body = sectionBody(content, "Audit Bridge") || "";
  const expected = [
    ["Historical Evidence Status", "preserve"],
    ["Convergence Anchor Required", "Yes"],
    ["Post-Adoption Evidence Model", "IntentOS artifacts"],
    ["Rewrite History", "No"],
  ];
  for (const [field, value] of expected) {
    const actual = tableValue(body, field);
    if (actual === value) pass(`${label} audit bridge ${field} is ${value}`);
    else fail(`${label} audit bridge ${field} must be ${value}`);
  }
}

function checkAiLogPolicy(content, label) {
  const body = sectionBody(content, "AI Log Policy") || "";
  const expected = [
    ["Write AI Logs By Default", "No"],
    ["Allowed For Governance Decisions", "Yes"],
    ["Routine Task Logging", "No"],
    ["Routine Command Logging", "No"],
  ];
  for (const [field, value] of expected) {
    const actual = tableValue(body, field);
    if (actual === value) pass(`${label} AI log policy ${field} is ${value}`);
    else fail(`${label} AI log policy ${field} must be ${value}`);
  }
}

function checkBoundaries(content, label) {
  const body = sectionBody(content, "Boundaries") || "";
  const expected = [
    "This report writes target files: No",
    "This report authorizes target-file writes: No",
    "This report approves governance replacement: No",
    "This report approves implementation: No",
    "This report approves release or production: No",
    "This report modifies CI or hooks: No",
    "This report rewrites history: No",
    "This report turns ai-logs into routine command logs: No",
    "This report maximizes migration: No",
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
  const required = [
    "schema_version",
    "artifact_type",
    "project_state",
    "intentos_operating_mode",
    "operating_mode_grants_write_permission",
    "can_codex_write_now",
    "convergence_state",
    "source_systems",
    "dimensions",
    "audit_bridge",
    "ai_log_policy",
    "blocked",
    "next_safe_step",
    "boundary",
    "outcome",
  ];
  for (const field of required) {
    if (Object.prototype.hasOwnProperty.call(parsed, field)) pass(`${label} structured evidence includes ${field}`);
    else fail(`${label} structured evidence missing ${field}`);
  }
  if (parsed.schema_version === "1.70.1") pass(`${label} structured evidence schema version is 1.70.1`);
  else fail(`${label} structured evidence schema version must be 1.70.1`);
  if (parsed.artifact_type === "governance_convergence_report") pass(`${label} structured artifact type is valid`);
  else fail(`${label} structured artifact type invalid`);
  if (parsed.intentos_operating_mode === "ACTIVE") pass(`${label} structured operating mode is active`);
  else fail(`${label} structured operating mode must be ACTIVE`);
  if (parsed.operating_mode_grants_write_permission === "No") pass(`${label} operating mode does not grant writes`);
  else fail(`${label} operating mode must not grant write permission`);
  if (parsed.can_codex_write_now === "No") pass(`${label} structured write authority is off`);
  else fail(`${label} structured can_codex_write_now must be No`);
  if (allowedStates.has(parsed.convergence_state)) pass(`${label} structured convergence state is allowed`);
  else fail(`${label} structured convergence state invalid`);
  validateStructuredSourceSystems(parsed, label);
  validateStructuredDimensions(parsed, label);
  validateStructuredBridge(parsed, label);
  validateStructuredBoundary(parsed, label);
  return parsed;
}

function validateStructuredSourceSystems(parsed, label) {
  const sources = parsed.source_systems || {};
  const required = [
    "workflow_next",
    "native_migration",
    "existing_rule_reconciliation",
    "release_plan",
  ];
  for (const source of required) {
    const item = sources[source];
    if (item && typeof item === "object" && !Array.isArray(item)) {
      pass(`${label} source system ${source} is structured`);
    } else {
      fail(`${label} source system ${source} must be structured`);
      continue;
    }
    if (allowedSourceStatuses.has(item.status)) pass(`${label} source system ${source} status is allowed`);
    else fail(`${label} source system ${source} status invalid`);
    if (isConcrete(item.ref)) pass(`${label} source system ${source} includes ref`);
    else fail(`${label} source system ${source} missing ref`);
    if (isConcrete(item.contribution)) pass(`${label} source system ${source} includes contribution`);
    else fail(`${label} source system ${source} missing contribution`);
  }
}

function validateStructuredDimensions(parsed, label) {
  const rows = Array.isArray(parsed.dimensions) ? parsed.dimensions : [];
  if (rows.length > 0) pass(`${label} structured dimensions are present`);
  else fail(`${label} structured dimensions must be present`);
  const seen = new Set();
  for (const item of rows) {
    const rowLabel = `${label} structured dimension ${item?.dimension || "dimension"}`;
    seen.add(item?.dimension);
    for (const field of ["dimension", "current_state", "target_state", "recommendation", "human_decision_required", "write_requires_apply_plan"]) {
      if (isConcrete(item?.[field])) pass(`${rowLabel} includes ${field}`);
      else fail(`${rowLabel} missing ${field}`);
    }
    if (allowedRecommendations.has(item?.recommendation)) pass(`${rowLabel} recommendation is allowed`);
    else fail(`${rowLabel} recommendation invalid`);
    if (item?.human_decision_required === "Yes") pass(`${rowLabel} requires human decision`);
    else fail(`${rowLabel} must require human decision`);
    if (item?.write_requires_apply_plan === "Yes") pass(`${rowLabel} requires apply plan before write`);
    else fail(`${rowLabel} must require apply plan before write`);
  }
  for (const dimension of requiredDimensions) {
    if (seen.has(dimension)) pass(`${label} structured evidence includes ${dimension} dimension`);
    else fail(`${label} structured evidence missing ${dimension} dimension`);
  }
}

function validateStructuredBridge(parsed, label) {
  const audit = parsed.audit_bridge || {};
  const logs = parsed.ai_log_policy || {};
  const expectedAudit = {
    historical_evidence_status: "preserve",
    convergence_anchor_required: "Yes",
    post_adoption_evidence_model: "IntentOS artifacts",
    rewrite_history: "No",
  };
  for (const [field, value] of Object.entries(expectedAudit)) {
    if (audit[field] === value) pass(`${label} audit bridge ${field} is ${value}`);
    else fail(`${label} audit bridge ${field} must be ${value}`);
  }
  const expectedLogs = {
    write_ai_logs_by_default: "No",
    allowed_for_governance_decisions: "Yes",
    routine_task_logging: "No",
    routine_command_logging: "No",
  };
  for (const [field, value] of Object.entries(expectedLogs)) {
    if (logs[field] === value) pass(`${label} AI log policy ${field} is ${value}`);
    else fail(`${label} AI log policy ${field} must be ${value}`);
  }
}

function validateStructuredBoundary(parsed, label) {
  const boundary = parsed.boundary || {};
  for (const field of [
    "writes_target_files",
    "authorizes_target_file_writes",
    "approves_governance_replacement",
    "approves_release_or_production",
    "modifies_ci_or_hooks",
    "rewrites_history",
    "routine_ai_log_spam",
    "maximizes_migration",
  ]) {
    if (boundary[field] === "No") pass(`${label} boundary ${field} is No`);
    else fail(`${label} boundary ${field} must be No`);
  }
}

function checkStateAndOutcome(content, label, evidence, summary, markdownDimensions) {
  const outcome = codeOrTextValue(sectionBody(content, "Outcome"));
  if (allowedStates.has(outcome)) pass(`${label} has valid Outcome`);
  else fail(`${label} invalid Outcome: ${outcome || "<empty>"}`);
  if (evidence) {
    if (evidence.outcome === evidence.convergence_state) pass(`${label} structured outcome matches state`);
    else fail(`${label} structured outcome must match convergence_state`);
    if (summary?.state === evidence.convergence_state) pass(`${label} human summary state matches structured state`);
    else fail(`${label} human summary state must match structured state`);
    if (outcome === evidence.outcome) pass(`${label} markdown outcome matches structured outcome`);
    else fail(`${label} markdown outcome must match structured outcome`);
    checkMarkdownStructuredDimensionConsistency(label, markdownDimensions, evidence);
    const blockedText = Array.isArray(evidence.blocked) ? evidence.blocked.join(" ") : "";
    if (/omitted extracted rules/i.test(blockedText)) {
      if (evidence.convergence_state === "CONVERGENCE_BLOCKED_BY_RULE_COVERAGE") {
        pass(`${label} omitted rules block convergence readiness`);
      } else {
        fail(`${label} omitted rules must set CONVERGENCE_BLOCKED_BY_RULE_COVERAGE`);
      }
    }
    if (/dirty worktree/i.test(blockedText)) {
      if (evidence.convergence_state === "CONVERGENCE_BLOCKED_BY_DIRTY_WORKTREE") {
        pass(`${label} dirty worktree blocks convergence readiness`);
      } else {
        fail(`${label} dirty worktree must set CONVERGENCE_BLOCKED_BY_DIRTY_WORKTREE`);
      }
    }
    const sourceSystems = evidence.source_systems || {};
    const upstreamNeedsInput = Object.values(sourceSystems)
      .some((source) => source?.status === "NEEDS_INPUT" || source?.status === "BLOCKED");
    if (upstreamNeedsInput) {
      if (/upstream source requires input/i.test(blockedText)) {
        pass(`${label} upstream source input requirement is recorded`);
      } else {
        fail(`${label} upstream source input requirement must be recorded in blocked reasons`);
      }
      if (["CONVERGENCE_READY_FOR_PLAN", "CONVERGENCE_PARTIAL"].includes(evidence.convergence_state)) {
        fail(`${label} upstream source input must not allow ready or partial convergence state`);
      } else {
        pass(`${label} upstream source input blocks ready convergence state`);
      }
    }
  }
}

function checkMarkdownStructuredDimensionConsistency(label, markdownDimensions, evidence) {
  if (!markdownDimensions || !(markdownDimensions instanceof Map)) return;
  const structured = new Map((Array.isArray(evidence.dimensions) ? evidence.dimensions : [])
    .map((item) => [item.dimension, item]));
  for (const dimension of requiredDimensions) {
    const markdown = markdownDimensions.get(dimension);
    const item = structured.get(dimension);
    if (!markdown || !item) continue;
    for (const field of ["current_state", "target_state", "recommendation", "human_decision_required", "write_requires_apply_plan"]) {
      if (stripMarkdown(markdown[field]) === stripMarkdown(item[field])) {
        pass(`${label} ${dimension} ${field} matches structured evidence`);
      } else {
        fail(`${label} ${dimension} ${field} must match structured evidence`);
      }
    }
  }
}

function requireSection(content, section, label) {
  if (sectionBody(content, section, { fallback: null }) !== null) pass(`${label} includes section ${section}`);
  else fail(`${label} missing section ${section}`);
}

function tableRows(body) {
  return body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("|") && line.endsWith("|"))
    .filter((line) => !/^\|\s*-+/.test(line))
    .map(splitMarkdownRow)
    .filter((row) => row.length > 0)
    .filter((row) => !/^field$/i.test(stripMarkdown(row[0] || "")))
    .filter((row) => !/^dimension$/i.test(stripMarkdown(row[0] || "")));
}

function tableValue(body, field) {
  for (const row of tableRows(body)) {
    if (stripMarkdown(row[0]) === field) return stripMarkdown(row[1] || "");
  }
  return "";
}

function fencedJson(body) {
  const match = body.match(/```json\s*([\s\S]*?)```/i);
  return match?.[1]?.trim() || "";
}

function codeOrTextValue(body) {
  const text = stripMarkdown(String(body || "").trim());
  const first = text.split(/\r?\n/).map(stripMarkdown).find(Boolean);
  return first || "";
}

function markdownFiles(dir) {
  const base = path.join(projectRoot, dir);
  if (!fs.existsSync(base)) return [];
  const files = [];
  walk(base, files);
  return files.filter((file) => file.endsWith(".md")).sort();
}

function walk(dir, files) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.isFile()) files.push(full);
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

function readResolved(relativePath) {
  const resolved = resolveAsset(relativePath);
  return resolved ? fs.readFileSync(resolved, "utf8") : "";
}

function displayAsset(relativePath, resolved) {
  return path.relative(projectRoot, resolved) || relativePath;
}

function rel(file) {
  return path.relative(projectRoot, file);
}

function isConcrete(value) {
  const text = String(value ?? "").trim();
  return text.length > 0 && !/^N\/A$/i.test(text) && !/^TBD$/i.test(text) && !/^TODO$/i.test(text);
}

function pass(message) {
  checks.push({ status: "PASS", message });
}

function fail(message) {
  failed = true;
  checks.push({ status: "FAIL", message });
}

function emitAndExit() {
  if (outputJson) {
    console.log(JSON.stringify({ ok: !failed, checks }, null, 2));
  } else {
    for (const check of checks) console.log(`${check.status} ${check.message}`);
    console.log("");
    if (failed) console.log("Governance Convergence check failed.");
    else console.log("Governance Convergence check passed.");
  }
  process.exit(failed ? 1 : 0);
}
