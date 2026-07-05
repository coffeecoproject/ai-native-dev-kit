#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import {
  evidenceDigest,
  extractMachineReadableEvidence,
  loadSchema,
  validateEvidenceBlock,
  validateSchema,
} from "./lib/artifact-schema.mjs";
import { containsSecretLikeValue } from "./lib/risk-surfaces.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set([
  "json",
  "allow-empty",
  "report",
  "require-report",
  "require-structured-evidence",
  "require-business-rule-ref",
  "require-impact-ref",
  "strict-source-binding",
]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputJson = Boolean(args.json);
const allowEmpty = Boolean(args["allow-empty"]);
const requireReport = Boolean(args["require-report"]);
const requireStructuredEvidence = Boolean(args["require-structured-evidence"]);
const requireBusinessRuleRef = Boolean(args["require-business-rule-ref"]);
const requireImpactRef = Boolean(args["require-impact-ref"]);
const strictSourceBinding = Boolean(args["strict-source-binding"]);
const explicitReport = args.report ? resolveReportPath(String(args.report)) : "";
const structuredEvidenceSchema = loadSchema(projectRoot, "schemas/artifacts/verification-plan.schema.json");
const businessRuleSchema = loadSchema(projectRoot, "schemas/artifacts/business-rule-closure.schema.json");
const impactSchema = loadSchema(projectRoot, "schemas/artifacts/change-impact-coverage.schema.json");
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
  "core/verification-test-governance.md",
  "docs/verification-test-governance.md",
  "templates/verification-plan.md",
  "schemas/artifacts/verification-plan.schema.json",
  "checklists/verification-plan-review.md",
  "prompts/verification-plan-agent.md",
  "scripts/resolve-verification-plan.mjs",
  "scripts/check-verification-plan.mjs",
];
const requiredDirectories = ["verification-plans"];
const requiredSections = [
  "Human Summary",
  "User Request",
  "Source Systems",
  "Verification Plan Identity",
  "Project Calibration",
  "Affected Surface Inputs",
  "Verification Obligations",
  "Test Correctness Controls",
  "Manual Verification",
  "Not Applicable Obligations",
  "Boundaries",
  "Machine-Readable Evidence",
  "Outcome",
];
const forbiddenClaims = [
  /\bimplementation approved\b/i,
  /\brelease approved\b/i,
  /\bproduction approved\b/i,
  /\bproduction ready\b/i,
  /\bsafe to launch\b/i,
  /\btests prove product correctness\b/i,
  /\bthis plan approves release or production:\s*Yes\b/i,
  /\bthis plan authorizes implementation:\s*Yes\b/i,
  /\bthis plan executes tests:\s*Yes\b/i,
  /\bthis plan proves product correctness:\s*Yes\b/i,
  /批准(实现|发布|生产|上线)/,
];
const allowedReadyStates = new Set(["VERIFICATION_PLAN_READY"]);
const highRiskSurfaces = new Set(["DATA_MODEL", "PERMISSION_RISK", "RELEASE_IMPACT"]);

let failed = false;
const checks = [];

if (!outputJson) {
  console.log("# Verification Plan Check");
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
    readResolved("core/verification-test-governance.md"),
    readResolved("docs/verification-test-governance.md"),
    readResolved("templates/verification-plan.md"),
    readResolved("schemas/artifacts/verification-plan.schema.json"),
  ].join("\n");
  if (!combined.trim()) return;
  for (const marker of [
    "Verification Plan Governance",
    "Verification Plan",
    "verification_plan_digest",
    "source_systems",
    "Test Correctness",
    "does not execute tests",
    "does not approve release or production",
  ]) {
    if (combined.includes(marker)) pass(`verification plan docs include ${marker}`);
    else fail(`verification plan docs missing ${marker}`);
  }
}

function checkReports() {
  const files = explicitReport ? [explicitReport] : markdownFiles("verification-plans");
  if (files.length === 0) {
    if (allowEmpty) {
      pass("verification plan check skipped by explicit --allow-empty: no reports");
    } else if (requireReport || explicitReport) {
      fail("no verification plan reports found; run `verification-plan --out <relative-report-path>` first");
    } else {
      pass("SKIPPED_NO_REPORT: no verification plan reports found; no readiness claim made");
    }
    return;
  }
  for (const file of files) {
    if (!fs.existsSync(file)) {
      fail(`missing explicit verification plan report ${file}`);
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
    if (pattern.test(content)) fail(`${label} contains forbidden verification plan claim: ${pattern.source}`);
  }
  for (const section of requiredSections) {
    if (hasSection(content, section)) pass(`${label} includes ${section}`);
    else fail(`${label} missing section ${section}`);
  }
  requireBoundaryNo(content, label, "This plan writes target files");
  requireBoundaryNo(content, label, "This plan executes tests");
  requireBoundaryNo(content, label, "This plan authorizes implementation");
  requireBoundaryNo(content, label, "This plan approves release or production");
  requireBoundaryNo(content, label, "This plan proves product correctness");
  requireBoundaryNo(content, label, "This plan proves real-environment behavior");

  const result = validateEvidenceBlock(content, structuredEvidenceSchema, label, {
    require: requireStructuredEvidence || requireBusinessRuleRef || requireImpactRef || strictSourceBinding,
    digestField: "verification_plan_digest",
  });
  if (!result.present && !(requireStructuredEvidence || requireBusinessRuleRef || requireImpactRef || strictSourceBinding)) {
    pass(`${label} structured evidence optional and not present`);
    return;
  }
  if (!result.ok) {
    result.errors.forEach((error) => fail(error));
    return;
  }
  const evidence = result.value;
  pass(`${label} has valid structured evidence`);
  checkStructuredEvidence(label, file, evidence);
}

function checkStructuredEvidence(label, file, evidence) {
  const planRefs = verificationPlanRefCandidates(file);
  if (planRefs.includes(evidence.verification_plan_ref)) {
    pass(`${label} verification_plan_ref points to this report`);
  } else {
    fail(`${label} verification_plan_ref ${evidence.verification_plan_ref || "<missing>"} must point to ${planRefs.join(" or ")}`);
  }

  if (allowedReadyStates.has(evidence.verification_state)) {
    if (!meaningful(evidence.task_ref)) fail(`${label} READY plan requires task_ref`);
    if (!meaningful(evidence.intent_digest)) fail(`${label} READY plan requires intent_digest`);
    if (!meaningfulDigest(evidence.verification_plan_digest)) fail(`${label} READY plan requires verification_plan_digest`);
    if (!Array.isArray(evidence.source_systems) || evidence.source_systems.length === 0) {
      fail(`${label} READY plan requires source_systems`);
    }
  }

  const sourceNames = new Set((evidence.source_systems || []).map((item) => item.name));
  if (requireBusinessRuleRef || evidence.change_kind === "BUSINESS_RULE") {
    if (!artifactRef(evidence.business_rule_ref)) fail(`${label} business_rule_ref is required for business-rule verification plans`);
    if (!sourceNames.has("business_rule_closure")) fail(`${label} source_systems must include business_rule_closure`);
  }
  if (requireImpactRef || evidence.verification_state === "VERIFICATION_PLAN_READY") {
    if (!artifactRef(evidence.impact_ref)) fail(`${label} impact_ref is required for READY verification plans`);
    if (!sourceNames.has("change_impact_coverage")) fail(`${label} source_systems must include change_impact_coverage`);
  }

  const businessRule = checkBusinessRuleBinding(label, file, evidence);
  const impact = checkImpactBinding(label, file, evidence);
  checkTaskBinding(label, evidence, businessRule, impact);
  checkObligations(label, evidence);
  checkManualVerification(label, evidence);
  checkBoundaries(label, evidence);
}

function checkBusinessRuleBinding(label, file, evidence) {
  const ref = artifactRef(evidence.business_rule_ref);
  if (!ref) return null;
  const resolved = resolveArtifact(file, ref);
  if (!resolved) {
    fail(`${label} business_rule_ref is not resolvable: ${ref}`);
    return null;
  }
  pass(`${label} business_rule_ref resolves: ${ref}`);
  const extracted = extractMachineReadableEvidence(fs.readFileSync(resolved, "utf8"));
  if (!extracted?.ok) {
    fail(`${label} business_rule_ref ${ref} missing valid Machine-Readable Evidence`);
    return null;
  }
  const businessRule = extracted.value;
  if (businessRuleSchema) {
    const validation = validateSchema(businessRule, businessRuleSchema, { label: `${label} business_rule_ref ${ref}` });
    if (validation.ok) pass(`${label} business_rule_ref has valid Business Rule Closure evidence`);
    else validation.errors.forEach((error) => fail(error));
  }
  if (evidence.business_rule_digest === businessRule.business_rule_digest) {
    pass(`${label} business_rule_digest matches referenced Business Rule Closure`);
  } else {
    fail(`${label} business_rule_digest ${evidence.business_rule_digest || "<missing>"} must match referenced Business Rule Closure ${businessRule.business_rule_digest || "<missing>"}`);
  }
  if (evidence.business_rule_state === businessRule.state) {
    pass(`${label} business_rule_state matches referenced Business Rule Closure`);
  } else {
    fail(`${label} business_rule_state ${evidence.business_rule_state || "<missing>"} must match referenced Business Rule Closure ${businessRule.state || "<missing>"}`);
  }
  if ((requireBusinessRuleRef || evidence.change_kind === "BUSINESS_RULE") && businessRule.state !== "READY_FOR_IMPACT_COVERAGE") {
    fail(`${label} business-rule verification plan requires READY Business Rule Closure`);
  }
  return businessRule;
}

function checkImpactBinding(label, file, evidence) {
  const ref = artifactRef(evidence.impact_ref);
  if (!ref) return null;
  const resolved = resolveArtifact(file, ref);
  if (!resolved) {
    fail(`${label} impact_ref is not resolvable: ${ref}`);
    return null;
  }
  pass(`${label} impact_ref resolves: ${ref}`);
  const extracted = extractMachineReadableEvidence(fs.readFileSync(resolved, "utf8"));
  if (!extracted?.ok) {
    fail(`${label} impact_ref ${ref} missing valid Machine-Readable Evidence`);
    return null;
  }
  const impact = extracted.value;
  if (impactSchema) {
    const validation = validateSchema(impact, impactSchema, { label: `${label} impact_ref ${ref}` });
    if (validation.ok) pass(`${label} impact_ref has valid Change Impact Coverage evidence`);
    else validation.errors.forEach((error) => fail(error));
  }
  if (evidence.impact_digest === impact.impact_digest) {
    pass(`${label} impact_digest matches referenced Change Impact Coverage`);
  } else {
    fail(`${label} impact_digest ${evidence.impact_digest || "<missing>"} must match referenced Change Impact Coverage ${impact.impact_digest || "<missing>"}`);
  }
  return impact;
}

function checkTaskBinding(label, evidence, businessRule, impact) {
  if (!strictSourceBinding && evidence.verification_state !== "VERIFICATION_PLAN_READY") return;
  if (businessRule?.task_ref && evidence.task_ref !== businessRule.task_ref) {
    fail(`${label} task_ref ${evidence.task_ref} must match Business Rule Closure task_ref ${businessRule.task_ref}`);
  } else if (businessRule?.task_ref) {
    pass(`${label} task_ref matches Business Rule Closure`);
  }
  if (businessRule?.source_request_digest && evidence.intent_digest !== businessRule.source_request_digest) {
    fail(`${label} intent_digest must match Business Rule Closure source_request_digest`);
  } else if (businessRule?.source_request_digest) {
    pass(`${label} intent_digest matches Business Rule Closure`);
  }
  const impactTask = impact?.user_request?.task_ref;
  if (impactTask && !/^not provided$/i.test(impactTask) && evidence.task_ref !== impactTask) {
    fail(`${label} task_ref ${evidence.task_ref} must match Change Impact Coverage task_ref ${impactTask}`);
  }
}

function checkObligations(label, evidence) {
  const obligations = evidence.verification_obligations || [];
  const requiredSurfaces = new Set((evidence.affected_surfaces || [])
    .filter((item) => item.status === "REQUIRED" || item.status === "NEEDS_HUMAN_DECISION")
    .map((item) => item.surface));
  const bySurface = new Map();
  for (const obligation of obligations) {
    if (!bySurface.has(obligation.source_surface)) bySurface.set(obligation.source_surface, []);
    bySurface.get(obligation.source_surface).push(obligation);
    if (obligation.required === "Yes" && (!Array.isArray(obligation.source_refs) || obligation.source_refs.length === 0)) {
      fail(`${label} required obligation ${obligation.id} needs source_refs`);
    }
    if (obligation.required === "Yes" && sourceRefsAreImplementationOnly(obligation.source_refs || [])) {
      fail(`${label} required obligation ${obligation.id} cannot cite only implementation files`);
    }
    if (obligation.required === "Yes"
      && obligation.broad_command_only === "Yes"
      && obligation.verification_type !== "REGRESSION_SMOKE") {
      fail(`${label} required obligation ${obligation.id} cannot be broad-command-only`);
    }
    if (obligation.required === "Yes" && !meaningful(obligation.behavior_under_test)) {
      fail(`${label} required obligation ${obligation.id} needs behavior_under_test`);
    }
    if (obligation.required === "Yes" && !meaningful(obligation.expected_evidence)) {
      fail(`${label} required obligation ${obligation.id} needs expected_evidence`);
    }
  }

  for (const surface of requiredSurfaces) {
    if (!bySurface.has(surface)) fail(`${label} required surface ${surface} has no verification obligation`);
  }

  requireTypes(label, bySurface, "API_CONTRACT", ["API_POSITIVE_TEST", "API_NEGATIVE_TEST"]);
  requireTypes(label, bySurface, "BACKEND_RULE", ["BACKEND_RULE_TEST"]);
  requireTypes(label, bySurface, "FRONTEND_UI", ["UI_INTERACTION_TEST"]);
  if (requiredSurfaces.has("DATA_MODEL")) requireTypes(label, bySurface, "DATA_MODEL", ["DATA_MODEL_CHECK"]);
  if (requiredSurfaces.has("PERMISSION_RISK")) requireAnyTypes(label, bySurface, "PERMISSION_RISK", ["PERMISSION_BOUNDARY_TEST", "MANUAL_VERIFICATION_REQUIRED", "PRIVACY_DATA_CHECK"]);

  if (evidence.change_kind === "BUG_FIX" && !obligations.some((item) => item.verification_type === "REGRESSION_SMOKE")) {
    fail(`${label} bug-fix verification plan requires regression obligation`);
  }

  const onlySmoke = obligations.length > 0 && obligations.every((item) => item.verification_type === "REGRESSION_SMOKE");
  const highRisk = evidence.project_level === "BL2"
    || (evidence.risk_domains || []).some((item) => /high-risk|permission|security|privacy|release/i.test(item))
    || [...requiredSurfaces].some((surface) => highRiskSurfaces.has(surface));
  if (highRisk && onlySmoke) fail(`${label} high-risk or BL2 plan cannot be smoke-only`);

  const controls = evidence.test_correctness_controls || [];
  if (highRisk && !controls.some((item) => item.id === "control:generated-test-review-required")) {
    fail(`${label} high-risk or BL2 plan needs generated-test review control`);
  }
  if (!controls.some((item) => item.id === "control:broad-command-not-proof")) {
    fail(`${label} needs broad-command-not-proof test correctness control`);
  }
}

function requireTypes(label, bySurface, surface, types) {
  const obligations = bySurface.get(surface);
  if (!obligations) return;
  for (const type of types) {
    if (obligations.some((item) => item.verification_type === type)) {
      pass(`${label} ${surface} includes ${type}`);
    } else {
      fail(`${label} ${surface} requires ${type}`);
    }
  }
}

function requireAnyTypes(label, bySurface, surface, types) {
  const obligations = bySurface.get(surface);
  if (!obligations) return;
  if (obligations.some((item) => types.includes(item.verification_type))) {
    pass(`${label} ${surface} includes risk verification`);
  } else {
    fail(`${label} ${surface} requires one of ${types.join(", ")}`);
  }
}

function checkManualVerification(label, evidence) {
  for (const item of evidence.manual_verification || []) {
    if (!meaningful(item.owner)) fail(`${label} manual verification ${item.id} needs owner`);
    if (!meaningful(item.decision_ref)) fail(`${label} manual verification ${item.id} needs decision_ref`);
    if (!meaningful(item.expected_manual_evidence)) fail(`${label} manual verification ${item.id} needs expected evidence`);
  }
}

function checkBoundaries(label, evidence) {
  const boundaries = evidence.boundaries || {};
  for (const field of [
    "writes_target_files",
    "executes_tests",
    "authorizes_implementation",
    "approves_release_or_production",
    "proves_product_correctness",
    "proves_real_environment_behavior",
  ]) {
    if (boundaries[field] === "No") pass(`${label} structured boundary ${field}: No`);
    else fail(`${label} structured boundary ${field} must be No`);
  }
}

function sourceRefsAreImplementationOnly(refs) {
  if (refs.some((ref) => /^artifact:(business-rule-closures|change-impact-coverage-reports|verification-plans|human-decisions)\//i.test(ref))) {
    return false;
  }
  if (refs.some((ref) => /^human-decision:/i.test(ref))) return false;
  return refs.every((ref) => /\.(js|ts|tsx|jsx|swift|kt|java|go|py|rb|php|rs|cs|sql)$/i.test(ref));
}

function artifactRef(value) {
  const text = String(value || "").trim();
  if (!text || /^not provided$/i.test(text)) return "";
  return text.startsWith("artifact:") ? text : "";
}

function resolveArtifact(reportFile, ref) {
  const match = String(ref || "").trim().match(/^artifact:(.+)$/i);
  if (!match) return null;
  const relativeRef = match[1].trim();
  if (!relativeRef || path.isAbsolute(relativeRef)) return null;
  const candidates = [
    path.resolve(projectRoot, relativeRef),
    path.resolve(path.dirname(reportFile), relativeRef),
    path.resolve(projectRoot, ".intentos", relativeRef),
  ];
  for (const candidate of candidates) {
    const relative = path.relative(projectRoot, candidate);
    if (relative.startsWith("..") || path.isAbsolute(relative)) continue;
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile() && /\.md$/i.test(candidate)) return candidate;
  }
  return null;
}

function verificationPlanRefCandidates(file) {
  const relative = rel(file);
  const candidates = [`artifact:${relative}`];
  if (relative.startsWith(".intentos/")) candidates.push(`artifact:${relative.slice(".intentos/".length)}`);
  return candidates;
}

function requireBoundaryNo(content, label, boundary) {
  const pattern = new RegExp(`${escapeRegExp(boundary)}:\\s*No`, "i");
  if (pattern.test(content)) pass(`${label} boundary ${boundary}: No`);
  else fail(`${label} must state boundary: ${boundary}: No`);
}

function hasSection(content, heading) {
  return new RegExp(`^##\\s+${escapeRegExp(heading)}\\s*$`, "im").test(content);
}

function meaningful(value) {
  const text = String(value || "").trim();
  return Boolean(text) && !/^(n\/a|none|todo|tbd|not provided|placeholder)$/i.test(text);
}

function meaningfulDigest(value) {
  return /^sha256:[a-f0-9]{64}$/.test(String(value || ""));
}

function resolveReportPath(report) {
  const normalized = String(report || "").trim();
  if (!normalized) return "";
  const direct = path.resolve(projectRoot, normalized);
  const managed = path.resolve(projectRoot, ".intentos", normalized);
  if (fs.existsSync(direct)) return direct;
  if (fs.existsSync(managed)) return managed;
  return direct;
}

function markdownFiles(relativeDir) {
  const dirs = [path.join(projectRoot, relativeDir), path.join(projectRoot, ".intentos", relativeDir)];
  const files = [];
  for (const dir of dirs) {
    if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) continue;
    for (const entry of fs.readdirSync(dir)) {
      if (/\.md$/i.test(entry)) files.push(path.join(dir, entry));
    }
  }
  return files.sort();
}

function resolveAsset(relativePath) {
  const direct = path.join(projectRoot, relativePath);
  if (fs.existsSync(direct) && fs.statSync(direct).isFile()) return direct;
  const managed = path.join(projectRoot, ".intentos", relativePath);
  if (fs.existsSync(managed) && fs.statSync(managed).isFile()) return managed;
  return "";
}

function resolveDirectory(relativePath) {
  const direct = path.join(projectRoot, relativePath);
  if (fs.existsSync(direct) && fs.statSync(direct).isDirectory()) return direct;
  const managed = path.join(projectRoot, ".intentos", relativePath);
  if (fs.existsSync(managed) && fs.statSync(managed).isDirectory()) return managed;
  return "";
}

function readResolved(relativePath) {
  const file = resolveAsset(relativePath);
  return file ? fs.readFileSync(file, "utf8") : "";
}

function displayAsset(expected, resolved) {
  const relative = path.relative(projectRoot, resolved).split(path.sep).join("/");
  return relative || expected;
}

function rel(file) {
  return path.relative(projectRoot, file).split(path.sep).join("/");
}

function pass(message) {
  checks.push({ status: "PASS", message });
  if (!outputJson) console.log(`PASS ${message}`);
}

function fail(message) {
  failed = true;
  checks.push({ status: "FAIL", message });
  if (!outputJson) console.log(`FAIL ${message}`);
}

function emitAndExit() {
  if (outputJson) {
    console.log(JSON.stringify({
      ok: !failed,
      checks,
    }, null, 2));
  } else {
    console.log("");
    console.log(failed ? "Verification Plan check failed." : "Verification Plan check passed.");
  }
  process.exit(failed ? 1 : 0);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
