#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { evidenceDigest, loadSchema, validateSchema } from "./lib/artifact-schema.mjs";
import { sectionBody, splitMarkdownRow, stripMarkdown } from "./lib/markdown.mjs";
import { containsSecretLikeValue } from "./lib/risk-surfaces.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set([
  "json",
  "allow-empty",
  "report",
  "require-report",
  "require-structured-evidence",
  "require-business-rule-closure",
]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputJson = Boolean(args.json);
const allowEmpty = Boolean(args["allow-empty"]);
const requireReport = Boolean(args["require-report"] || args["require-business-rule-closure"]);
const requireStructuredEvidence = Boolean(args["require-structured-evidence"]);
const explicitReport = args.report ? resolveReportPath(String(args.report)) : "";
const schemaPath = "schemas/artifacts/business-rule-closure.schema.json";
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
  "core/business-rule-closure.md",
  "docs/business-rule-closure.md",
  "templates/business-rule-closure-card.md",
  "schemas/artifacts/business-rule-closure.schema.json",
  "checklists/business-rule-closure-review.md",
  "prompts/business-rule-closure-agent.md",
  "scripts/resolve-business-rule-closure.mjs",
  "scripts/check-business-rule-closure.mjs",
];
const requiredDirectories = ["business-rule-closures"];
const requiredSections = [
  "Human Summary",
  "User Request",
  "Codex Understanding",
  "Rule Identity",
  "Business Rule Dimensions",
  "User Confirmation Card",
  "Safe Defaults",
  "Existing Rule Check",
  "Decisions Needed",
  "Out Of Scope",
  "Real-Environment Validation Expectation",
  "Next Step",
  "Boundaries",
];
const allowedStates = new Set([
  "READY_FOR_IMPACT_COVERAGE",
  "NEEDS_USER_CONFIRMATION",
  "NEEDS_DOMAIN_OWNER",
  "BLOCKED_INCOMPLETE_RULE",
  "OUT_OF_SCOPE_FOR_CURRENT_TASK",
]);
const readyDimensionStatuses = new Set(["CLOSED", "DEFAULTED_WITH_REASON", "NOT_APPLICABLE_WITH_REASON", "OUT_OF_SCOPE_WITH_REASON"]);
const requiredByType = {
  VALIDATION_RULE: [
    "ACTOR",
    "TRIGGER_SCENARIO",
    "INPUT_CONDITION",
    "SUCCESS_PATH",
    "FAILURE_PATH",
    "USER_FEEDBACK",
    "SERVER_ENFORCEMENT",
    "DATA_BEHAVIOR",
    "EFFECTIVE_TIME",
    "EXCEPTION_POLICY",
    "CROSS_SURFACE_CONSISTENCY",
    "REAL_ENVIRONMENT_VALIDATION",
  ],
  PERMISSION_RULE: [
    "ACTOR",
    "TRIGGER_SCENARIO",
    "ROLE_PERMISSION",
    "FAILURE_PATH",
    "USER_FEEDBACK",
    "SERVER_ENFORCEMENT",
    "AUDIT_LOGGING",
    "TENANCY_DATA_BOUNDARY",
    "REAL_ENVIRONMENT_VALIDATION",
  ],
  STATUS_TRANSITION: [
    "ACTOR",
    "TRIGGER_SCENARIO",
    "SUCCESS_PATH",
    "FAILURE_PATH",
    "DATA_BEHAVIOR",
    "EFFECTIVE_TIME",
    "PRECEDENCE",
    "AUDIT_LOGGING",
    "DOWNSTREAM_EFFECT",
    "REAL_ENVIRONMENT_VALIDATION",
  ],
  FINANCE_RULE: [
    "ACTOR",
    "INPUT_CONDITION",
    "DATA_BEHAVIOR",
    "ROLE_PERMISSION",
    "HUMAN_DECISION",
    "AUDIT_LOGGING",
    "REAL_ENVIRONMENT_VALIDATION",
    "SOURCE_RULE_CONFLICT",
  ],
  DATA_LIFECYCLE_RULE: [
    "ACTOR",
    "TRIGGER_SCENARIO",
    "DATA_BEHAVIOR",
    "EFFECTIVE_TIME",
    "EXCEPTION_POLICY",
    "DOWNSTREAM_EFFECT",
    "SOURCE_RULE_CONFLICT",
    "REAL_ENVIRONMENT_VALIDATION",
  ],
  NOTIFICATION_RULE: [
    "ACTOR",
    "TRIGGER_SCENARIO",
    "SUCCESS_PATH",
    "FAILURE_PATH",
    "USER_FEEDBACK",
    "DOWNSTREAM_EFFECT",
    "LOCALIZATION_REGION",
    "REAL_ENVIRONMENT_VALIDATION",
  ],
  APPROVAL_RULE: [
    "ACTOR",
    "TRIGGER_SCENARIO",
    "SUCCESS_PATH",
    "FAILURE_PATH",
    "ROLE_PERMISSION",
    "PRECEDENCE",
    "AUDIT_LOGGING",
    "DOWNSTREAM_EFFECT",
    "REAL_ENVIRONMENT_VALIDATION",
  ],
  INTEGRATION_RULE: [
    "TRIGGER_SCENARIO",
    "FAILURE_PATH",
    "DATA_BEHAVIOR",
    "CROSS_SURFACE_CONSISTENCY",
    "IDEMPOTENCY_CONCURRENCY",
    "SOURCE_RULE_CONFLICT",
    "HUMAN_DECISION",
    "REAL_ENVIRONMENT_VALIDATION",
  ],
};
const forbiddenClaims = [
  /\bThis closure writes target files:\s*Yes\b/i,
  /\bThis closure authorizes implementation:\s*Yes\b/i,
  /\bThis closure approves release or production:\s*Yes\b/i,
  /\bThis closure approves finance, tax, HR, legal, payment, privacy, compliance, migration, production, or customer-data decisions:\s*Yes\b/i,
  /\bThis closure proves real-environment behavior:\s*Yes\b/i,
  /\bimplementation approved\b/i,
  /\brelease approved\b/i,
  /\bproduction verified\b/i,
  /\btax compliance (is )?(approved|verified|satisfied)\b/i,
  /\blegal compliance (is )?(approved|verified|satisfied)\b/i,
  /批准(实现|发布|生产|上线|税务|法务|合规)/,
];

let failed = false;
const checks = [];

if (!outputJson) {
  console.log("# Business Rule Closure Check");
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
    readResolved("core/business-rule-closure.md"),
    readResolved("docs/business-rule-closure.md"),
    readResolved("templates/business-rule-closure-card.md"),
    readResolved("schemas/artifacts/business-rule-closure.schema.json"),
  ].join("\n");
  if (!combined.trim()) return;
  for (const marker of [
    "Business Rule Closure",
    "READY_FOR_IMPACT_COVERAGE",
    "business_rule_digest",
    "closure_digest",
    "does not write target files",
    "does not approve release or production",
    "does not authorize implementation",
  ]) {
    if (combined.includes(marker)) pass(`business rule closure docs include ${marker}`);
    else fail(`business rule closure docs missing ${marker}`);
  }
}

function checkReports() {
  const files = explicitReport ? [explicitReport] : markdownFiles("business-rule-closures");
  if (files.length === 0) {
    if (allowEmpty) {
      pass("business rule closure check skipped by explicit --allow-empty: no reports");
    } else if (requireReport || explicitReport) {
      fail("no business rule closure reports found; run `business-rule --out <relative-report-path>` first");
    } else {
      pass("SKIPPED_NO_REPORT: no business rule closure reports found; no readiness claim made");
    }
    return;
  }
  for (const file of files) {
    if (!fs.existsSync(file)) {
      fail(`missing explicit business rule closure report ${file}`);
      continue;
    }
    checkReport(file);
  }
}

function checkReport(file) {
  const content = fs.readFileSync(file, "utf8");
  const label = rel(file);
  if (containsSecretLikeValue(content)) fail(`${label} contains secret-like content`);
  for (const pattern of forbiddenClaims) {
    if (pattern.test(content)) fail(`${label} contains forbidden business rule closure claim: ${pattern.source}`);
  }
  if (!content.includes("read-only business-rule interpretation")) {
    fail(`${label} must state read-only business-rule interpretation boundary`);
  } else {
    pass(`${label} states read-only business-rule interpretation boundary`);
  }
  for (const section of requiredSections) requireSection(content, section, label);
  if (requireStructuredEvidence) requireSection(content, "Machine-Readable Evidence", label);
  requireBoundaryNo(content, label, "This closure writes target files");
  requireBoundaryNo(content, label, "This closure authorizes implementation");
  requireBoundaryNo(content, label, "This closure approves release or production");
  requireBoundaryNo(content, label, "This closure approves finance, tax, HR, legal, payment, privacy, compliance, migration, production, or customer-data decisions");
  requireBoundaryNo(content, label, "This closure proves real-environment behavior");
  checkQuestionLimit(content, label);
  const summary = checkSummary(content, label);
  const evidence = checkStructuredEvidence(content, label);
  checkMarkdownJsonConsistency(content, label, summary, evidence);
  checkSelfReference(file, label, evidence);
  checkStateRules(content, label, summary, evidence);
}

function checkSummary(content, label) {
  const body = sectionBody(content, "Human Summary", { fallback: "" }) || "";
  const state = tableValue(body, "Business Rule State");
  const ruleType = tableValue(body, "Primary Rule Type");
  const canEnter = tableValue(body, "Can Enter Impact Coverage");
  const canWrite = tableValue(body, "Can Codex Write Now");
  if (allowedStates.has(state)) pass(`${label} summary state is allowed`);
  else fail(`${label} summary state invalid: ${state || "<empty>"}`);
  if (ruleType) pass(`${label} summary primary rule type is present`);
  else fail(`${label} summary primary rule type missing`);
  if (["Yes", "No"].includes(canEnter)) pass(`${label} summary impact coverage flag is bounded`);
  else fail(`${label} summary impact coverage flag invalid: ${canEnter || "<empty>"}`);
  if (canWrite === "No") pass(`${label} summary can codex write now is No`);
  else fail(`${label} summary can codex write now must be No`);
  return { state, ruleType, canEnter, canWrite };
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
  if (requireStructuredEvidence) {
    const schema = loadSchema(projectRoot, schemaPath);
    if (!schema) {
      fail(`${label} Machine-Readable Evidence schema is missing`);
    } else {
      const validation = validateSchema(parsed, schema, { label: `${label} Machine-Readable Evidence` });
      if (validation.ok) {
        pass(`${label} Machine-Readable Evidence matches schema`);
        pass(`${label} has valid structured evidence`);
      }
      else for (const error of validation.errors) fail(error);
    }
  }
  const sourceDigest = digest(parsed.user_request || "");
  if (parsed.source_request_digest === sourceDigest) pass(`${label} source_request_digest matches user_request`);
  else fail(`${label} source_request_digest does not match user_request`);
  const ruleDigest = evidenceDigest(businessRuleModelFrom(parsed), []);
  if (parsed.business_rule_digest === ruleDigest) pass(`${label} business_rule_digest matches normalized business rule`);
  else fail(`${label} business_rule_digest does not match normalized business rule`);
  const closureDigest = evidenceDigest(parsed, ["closure_digest"]);
  if (parsed.closure_digest === closureDigest) pass(`${label} closure_digest matches structured evidence`);
  else fail(`${label} closure_digest does not match structured evidence`);
  return parsed;
}

function checkMarkdownJsonConsistency(content, label, summary, evidence) {
  if (!evidence) return;
  if (summary.state && evidence.state && summary.state !== evidence.state) {
    fail(`${label} summary state ${summary.state} does not match structured evidence ${evidence.state}`);
  } else if (summary.state && evidence.state) {
    pass(`${label} summary state matches structured evidence`);
  }
  if (summary.ruleType && evidence.primary_business_rule_type && summary.ruleType !== evidence.primary_business_rule_type) {
    fail(`${label} summary primary rule type ${summary.ruleType} does not match structured evidence ${evidence.primary_business_rule_type}`);
  } else if (summary.ruleType && evidence.primary_business_rule_type) {
    pass(`${label} summary primary rule type matches structured evidence`);
  }
  const identity = sectionBody(content, "Rule Identity", { fallback: "" }) || "";
  for (const [field, key] of [
    ["Business Rule ID", "business_rule_id"],
    ["Business Rule Ref", "business_rule_ref"],
    ["Source Request Digest", "source_request_digest"],
    ["Business Rule Digest", "business_rule_digest"],
    ["Closure Digest", "closure_digest"],
  ]) {
    const value = tableValue(identity, field);
    if (!value) continue;
    if (value !== evidence[key]) fail(`${label} Rule Identity ${field} ${value} does not match structured evidence ${evidence[key]}`);
    else pass(`${label} Rule Identity ${field} matches structured evidence`);
  }
}

function checkSelfReference(file, label, evidence) {
  if (!evidence?.business_rule_ref) return;
  const allowed = businessRuleRefCandidates(file);
  if (allowed.includes(evidence.business_rule_ref)) {
    pass(`${label} business_rule_ref points to this report`);
  } else {
    fail(`${label} business_rule_ref ${evidence.business_rule_ref} must point to this report (${allowed.join(" or ")})`);
  }
}

function checkStateRules(content, label, summary, evidence) {
  if (!evidence) return;
  if (evidence.can_codex_write_now !== "No") fail(`${label} can_codex_write_now must be No`);
  if (evidence.state === "READY_FOR_IMPACT_COVERAGE" && evidence.can_enter_impact_coverage !== "Yes") {
    fail(`${label} READY_FOR_IMPACT_COVERAGE must set can_enter_impact_coverage to Yes`);
  }
  if (evidence.state !== "READY_FOR_IMPACT_COVERAGE" && evidence.can_enter_impact_coverage === "Yes") {
    fail(`${label} non-ready state must not set can_enter_impact_coverage to Yes`);
  }
  const dimensions = Array.isArray(evidence.dimensions) ? evidence.dimensions : [];
  const dimensionMap = new Map(dimensions.map((item) => [item.dimension, item]));
  const types = Array.isArray(evidence.business_rule_types) ? evidence.business_rule_types : [];
  if (evidence.state === "READY_FOR_IMPACT_COVERAGE") {
    for (const type of types) {
      for (const dimension of requiredByType[type] || []) {
        const item = dimensionMap.get(dimension);
        if (!item) fail(`${label} ${type} READY_FOR_IMPACT_COVERAGE missing required dimension ${dimension}`);
        else if (!readyDimensionStatuses.has(item.status)) fail(`${label} ${type} required dimension ${dimension} is not closed: ${item.status}`);
      }
    }
    for (const item of dimensions) {
      if (!readyDimensionStatuses.has(item.status)) fail(`${label} READY_FOR_IMPACT_COVERAGE cannot include unresolved dimension ${item.dimension}: ${item.status}`);
    }
    for (const decision of evidence.decision_items || []) {
      if (decision.blocking === "Yes" && decision.status === "PENDING") {
        fail(`${label} READY_FOR_IMPACT_COVERAGE cannot have pending blocking decision ${decision.id}`);
      }
    }
    for (const item of evidence.safe_defaults || []) {
      if (item.requires_user_acceptance === "Yes" && item.accepted_by_user !== "Yes") {
        fail(`${label} READY_FOR_IMPACT_COVERAGE cannot treat recommended safe default as accepted: ${item.id}`);
      }
      if (item.can_codex_apply_now !== "No") fail(`${label} safe default cannot be directly applied by Codex: ${item.id}`);
    }
    for (const conflict of evidence.conflicts || []) {
      if (conflict.status === "UNRESOLVED") fail(`${label} READY_FOR_IMPACT_COVERAGE cannot have unresolved conflict ${conflict.id}`);
    }
  }
  if (dimensions.some((item) => item.dimension === "DATA_BEHAVIOR" && /batch-(change|modify)|silent historical/i.test(item.summary) && item.status === "CLOSED")) {
    fail(`${label} historical data behavior cannot silently batch-modify existing records`);
  }
  if ((evidence.risk_domains || []).some((domain) => /tax|finance|payment|legal|hr|privacy|compliance|production|customer-data|high-risk/i.test(domain))
    && evidence.state === "READY_FOR_IMPACT_COVERAGE"
    && !types.every((type) => type !== "FINANCE_RULE")) {
    fail(`${label} high-risk finance/tax/legal/payment domain cannot be READY without domain-owner proof`);
  }
  if (/\btax\b|税/.test(stripMarkdown(content).toLowerCase()) && /tax compliance (is )?(approved|verified|satisfied)|税务合规(已)?(通过|满足|批准)/i.test(content)) {
    fail(`${label} field validation must not claim tax compliance`);
  }
  if (/only\s+(web|one client|single client)|只需要(Web|一个端|单端)/i.test(content)
    && /multiple platforms|multiple active clients|多端|小程序|iOS|Android|mobile/i.test(content)) {
    fail(`${label} multi-platform business rule cannot assume one client only`);
  }
  const questionCount = pendingQuestionCount(content);
  if (questionCount > 3) fail(`${label} asks more than three user-facing questions`);
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

function checkQuestionLimit(content, label) {
  const count = pendingQuestionCount(content);
  if (count <= 3) pass(`${label} asks at most three user-facing questions`);
  else fail(`${label} asks more than three user-facing questions`);
}

function pendingQuestionCount(content) {
  const body = sectionBody(content, "User Confirmation Card", { fallback: "" }) || "";
  return body.split(/\r?\n/).filter((line) => /^\s*-\s+/.test(line) && /\?/.test(line)).length;
}

function requireSection(content, section, label) {
  if (sectionBody(content, section) !== null) pass(`${label} includes section ${section}`);
  else fail(`${label} missing section ${section}`);
}

function requireBoundaryNo(content, label, boundary) {
  const pattern = new RegExp(`-\\s*${escapeRegExp(boundary)}:\\s*No\\b`, "i");
  if (pattern.test(content)) pass(`${label} boundary is No: ${boundary}`);
  else fail(`${label} boundary must be No: ${boundary}`);
}

function tableValue(markdown, field) {
  const expected = stripMarkdown(field).toLowerCase();
  for (const line of markdown.split(/\r?\n/)) {
    if (!/^\|/.test(line) || /---/.test(line)) continue;
    const cells = splitMarkdownRow(line).map(stripMarkdown);
    if (cells.length < 2) continue;
    if (cells[0].toLowerCase() === expected) return cells[1];
  }
  return "";
}

function fencedJson(markdown) {
  const match = String(markdown || "").match(/```json\s*([\s\S]*?)```/i);
  return match ? match[1] : "";
}

function markdownFiles(relativeDir) {
  const roots = [
    path.join(projectRoot, relativeDir),
    path.join(projectRoot, ".intentos", relativeDir),
  ];
  const files = [];
  for (const root of roots) {
    if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) continue;
    walk(root, (file) => {
      if (/\.md$/i.test(file) && path.basename(file) !== ".gitkeep") files.push(file);
    });
  }
  return files;
}

function walk(dir, visit) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(fullPath, visit);
    else visit(fullPath);
  }
}

function resolveReportPath(value) {
  if (path.isAbsolute(value)) return value;
  return path.resolve(projectRoot, value);
}

function resolveAsset(relativePath) {
  for (const candidate of [
    path.join(projectRoot, relativePath),
    path.join(projectRoot, ".intentos", relativePath),
  ]) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  return null;
}

function resolveDirectory(relativePath) {
  for (const candidate of [
    path.join(projectRoot, relativePath),
    path.join(projectRoot, ".intentos", relativePath),
  ]) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) return candidate;
  }
  return null;
}

function readResolved(relativePath) {
  const resolved = resolveAsset(relativePath);
  if (!resolved) return "";
  return fs.readFileSync(resolved, "utf8");
}

function displayAsset(relativePath, resolved) {
  return resolved.includes(`${path.sep}.intentos${path.sep}`) ? `.intentos/${relativePath}` : relativePath;
}

function rel(file) {
  const relative = path.relative(projectRoot, file);
  return relative && !relative.startsWith("..") ? relative.replaceAll(path.sep, "/") : file;
}

function businessRuleRefCandidates(file) {
  const relative = rel(file);
  const candidates = [`artifact:${relative}`];
  if (relative.startsWith(".intentos/")) candidates.push(`artifact:${relative.slice(".intentos/".length)}`);
  return candidates;
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
      checks,
    }, null, 2));
  } else if (!failed) {
    console.log("");
    console.log("Business Rule Closure check passed.");
  }
  if (failed) process.exit(1);
}

function digest(value) {
  return `sha256:${crypto.createHash("sha256").update(String(value || "")).digest("hex")}`;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
