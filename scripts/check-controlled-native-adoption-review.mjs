#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { loadSchema, validateEvidenceBlock } from "./lib/artifact-schema.mjs";
import { containsSecretLikeValue } from "./lib/risk-surfaces.mjs";
import { sectionBody, stripMarkdown } from "./lib/markdown.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["json", "allow-empty", "report", "require-report", "require-structured-evidence"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputJson = Boolean(args.json);
const allowEmpty = Boolean(args["allow-empty"]);
const requireReport = Boolean(args["require-report"]);
const requireStructuredEvidence = Boolean(args["require-structured-evidence"]);
const explicitReport = args.report ? path.resolve(process.cwd(), String(args.report)) : "";
const schema = loadSchema(projectRoot, "schemas/artifacts/controlled-native-adoption-review.schema.json");
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
  "core/controlled-native-adoption-autopilot-review.md",
  "docs/controlled-native-adoption-autopilot-review.md",
  "templates/controlled-native-adoption-review-report.md",
  "schemas/artifacts/controlled-native-adoption-review.schema.json",
  "checklists/controlled-native-adoption-review.md",
  "prompts/controlled-native-adoption-review-agent.md",
  "scripts/resolve-controlled-native-adoption-review.mjs",
  "scripts/check-controlled-native-adoption-review.mjs",
];
const requiredDirectories = ["native-adoption-review-reports"];
const requiredSections = [
  "Human Summary",
  "Maturity Evidence",
  "Source Authority",
  "Recommended Actions",
  "Blocked Actions",
  "Human Decisions",
  "Risk / Verification / Rollback",
  "Boundaries",
  "Machine-Readable Evidence",
  "Outcome",
];
const forbiddenClaims = [
  /\bfully adopted\b/i,
  /\b(?:claim|claims|claimed|achieved|completed|ready for)\s+full adoption\b/i,
  /\binstall(?:s|ed)?\s+\.intentos\b/i,
  /\breplace(?:s|d)?\s+AGENTS\.md\b/i,
  /\bmodify(?:ing|ies)?\s+CI\b/i,
  /\bdeploy(?:s|ed)?\s+production\b/i,
  /\bapprove(?:d)?\s+(?:release|production)\b/i,
  /\bnative apply\b\s*(?:is\s*)?(?:allowed|approved|ready|can proceed)\b(?!\s*(?:\||:)\s*`?No`?)/i,
  /自动写入目标项目/,
  /安装\s*\.intentos/,
  /替换\s*AGENTS/,
  /批准(发布|生产|上线)/,
];
const userBurdenPatterns = [
  /selected native adoption/i,
  /controlled apply readiness/i,
  /native migration/i,
  /install \.intentos/i,
  /是否允许 selected native adoption/i,
  /是否进入 controlled apply readiness/i,
  /是否安装 \.intentos/i,
];

let failed = false;
const checks = [];

if (!outputJson) {
  console.log("# Controlled Native Adoption Review Check");
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
    readResolved("core/controlled-native-adoption-autopilot-review.md"),
    readResolved("docs/controlled-native-adoption-autopilot-review.md"),
    readResolved("templates/controlled-native-adoption-review-report.md"),
    readResolved("schemas/artifacts/controlled-native-adoption-review.schema.json"),
  ].join("\n");
  if (!combined.trim()) return;
  for (const marker of [
    "Controlled Native Adoption Review",
    "review-only",
    "does not write target-project files",
    "controlled_native_adoption_review",
    "source evidence",
    "native_apply_allowed",
    "RECOMMEND_GOVERNANCE_REPAIR",
  ]) {
    if (combined.includes(marker)) pass(`controlled native adoption review docs include ${marker}`);
    else fail(`controlled native adoption review docs missing ${marker}`);
  }
}

function checkReports() {
  const files = explicitReport ? [explicitReport] : markdownFiles("native-adoption-review-reports");
  if (files.length === 0) {
    if (allowEmpty) pass("controlled native adoption review check skipped by explicit --allow-empty: no reports");
    else if (requireReport || explicitReport) fail("no Controlled Native Adoption Review reports found");
    else pass("SKIPPED_NO_REPORT: no Controlled Native Adoption Review reports found");
    return;
  }
  for (const file of files) {
    if (!fs.existsSync(file)) {
      fail(`missing explicit Controlled Native Adoption Review report ${file}`);
      continue;
    }
    checkReport(file);
  }
}

function checkReport(file) {
  const content = fs.readFileSync(file, "utf8");
  const label = rel(file);
  if (containsSecretLikeValue(content)) fail(`${label} contains secret-like content`);
  if (content.includes("read-only maturity and adoption-depth recommendation")) pass(`${label} states read-only recommendation boundary`);
  else fail(`${label} must state read-only recommendation boundary`);
  for (const section of requiredSections) {
    if (sectionBody(content, section)) pass(`${label} includes ${section}`);
    else fail(`${label} missing ${section}`);
  }
  const claimScanContent = content
    .replace(/Do not claim full adoption\.?/gi, "")
    .replace(/Full adoption claim\s*\|\s*`?No`?/gi, "");
  for (const pattern of forbiddenClaims) {
    if (pattern.test(claimScanContent)) fail(`${label} contains forbidden adoption-review claim: ${pattern.source}`);
  }
  const userText = [
    sectionBody(content, "Human Summary") || "",
    sectionBody(content, "Recommended Actions") || "",
    sectionBody(content, "Blocked Actions") || "",
    sectionBody(content, "Human Decisions") || "",
    sectionBody(content, "Risk / Verification / Rollback") || "",
  ].join("\n");
  for (const pattern of userBurdenPatterns) {
    if (pattern.test(userText)) fail(`${label} exposes technical adoption decision to user: ${pattern.source}`);
  }
  checkBoundaryTables(content, label);
  const result = validateEvidenceBlock(content, schema, label, {
    require: requireStructuredEvidence,
    digestField: "review_digest",
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
  if (reportRefCandidates(file).includes(evidence.review_ref)) pass(`${label} review_ref points to this report`);
  else fail(`${label} review_ref ${evidence.review_ref || "<missing>"} must point to this report`);

  const boundaries = evidence.boundaries || {};
  for (const [field, expected] of [
    ["writes_target_files", "No"],
    ["installs_intentos", "No"],
    ["changes_agents_or_ci", "No"],
    ["native_apply_allowed", "No"],
    ["approves_implementation", "No"],
    ["approves_release_or_production", "No"],
    ["full_adoption_claim", "No"],
  ]) {
    if (boundaries[field] === expected) pass(`${label} ${field} is ${expected}`);
    else fail(`${label} ${field} must be ${expected}`);
  }
  if (evidence.adoption_recommendation?.safe_to_apply_now === false) pass(`${label} safe_to_apply_now is false`);
  else fail(`${label} safe_to_apply_now must be false`);
  if (evidence.adoption_recommendation?.native_apply_allowed === false) pass(`${label} native_apply_allowed is false`);
  else fail(`${label} native_apply_allowed must be false`);
  if (evidence.outcome === evidence.adoption_recommendation?.state) pass(`${label} outcome matches recommendation state`);
  else fail(`${label} outcome must match recommendation state`);

  const sourceEvidence = (evidence.source_chain || []).filter((source) => source.authority === "source_evidence");
  if (sourceEvidence.length > 0) pass(`${label} source chain includes source evidence`);
  else fail(`${label} must not rely only on derived adoption card`);
  for (const source of evidence.source_chain || []) {
    if (source.ref && /^sha256:[a-f0-9]{64}$/.test(source.digest || "") && source.source_outcome && source.current_project_match && source.blocker_class) {
      pass(`${label} source ${source.name} has trace ref, digest, outcome, project match, and blocker class`);
    } else {
      fail(`${label} source ${source.name || "<unknown>"} must include ref, digest, source_outcome, current_project_match, and blocker_class`);
    }
  }
  const adoptionCard = (evidence.source_chain || []).find((source) => source.name === "existing_project_adoption_autopilot");
  if (!adoptionCard || adoptionCard.authority === "derived_view") pass(`${label} adoption card is derived view only`);
  else fail(`${label} adoption card must be marked derived_view`);

  const maturity = evidence.governance_maturity?.state;
  const maturityDepth = evidence.governance_maturity?.recommended_adoption_depth;
  const recommendationClass = evidence.adoption_recommendation?.recommendation_class;
  const outcome = evidence.outcome;
  checkMaturityMatrix(label, maturity, maturityDepth, recommendationClass, outcome, evidence);
  checkSourceBlockers(label, evidence);
  if (evidence.risk_verification_rollback?.risk_summary
    && evidence.risk_verification_rollback?.verification_required
    && evidence.risk_verification_rollback?.rollback_plan_required) {
    pass(`${label} records risk, verification, and rollback`);
  } else {
    fail(`${label} must record risk, verification, and rollback`);
  }
  checkMarkdownConsistency(content, label, evidence);
}

function checkMaturityMatrix(label, maturity, maturityDepth, recommendationClass, outcome, evidence) {
  const matrix = {
    STRONG_GOVERNED_PROJECT: {
      classes: ["SELECTED_NATIVE_OVERLAY_PLAN"],
      outcomes: ["READY_FOR_SELECTED_NATIVE_OVERLAY_PLAN"],
    },
    WEAK_GOVERNANCE_PROJECT: {
      classes: ["GOVERNANCE_REPAIR_THEN_SELECTED_OVERLAY_PLAN"],
      outcomes: ["READY_FOR_GOVERNANCE_REPAIR_AND_OVERLAY_PLAN"],
    },
    MESSY_PRODUCTION_PROJECT: {
      classes: ["GOVERNANCE_REPAIR_THEN_SELECTED_OVERLAY_PLAN"],
      outcomes: ["READY_FOR_GOVERNANCE_REPAIR_AND_OVERLAY_PLAN"],
    },
    LIGHT_LOW_RISK_PROJECT: {
      classes: ["SELECTED_NATIVE_OVERLAY_PLAN"],
      outcomes: ["READY_FOR_SELECTED_NATIVE_OVERLAY_PLAN"],
    },
    UNKNOWN_OR_OWNERLESS_PROJECT: {
      classes: ["AUTHORITY_RECONCILIATION_THEN_SELECTED_OVERLAY_PLAN"],
      outcomes: ["READY_FOR_AUTHORITY_RECONCILIATION"],
    },
    DIRTY_OR_UNSAFE_PROJECT: {
      classes: ["BLOCK_NATIVE_ADOPTION"],
      outcomes: ["BLOCKED_BY_UNSAFE_PROJECT_STATE"],
    },
  };
  const rule = matrix[maturity];
  if (!rule) {
    fail(`${label} has unknown governance maturity ${maturity || "<missing>"}`);
    return;
  }
  if (rule.classes.includes(recommendationClass)) pass(`${label} maturity ${maturity} allows recommendation class ${recommendationClass}`);
  else fail(`${label} maturity ${maturity} must not use recommendation class ${recommendationClass || "<missing>"}`);
  if (rule.outcomes.includes(outcome)) pass(`${label} maturity ${maturity} allows outcome ${outcome}`);
  else fail(`${label} maturity ${maturity} must not use outcome ${outcome || "<missing>"}`);
  if (maturityDepth === recommendationClass) pass(`${label} maturity adoption depth matches recommendation class`);
  else fail(`${label} governance_maturity.recommended_adoption_depth must match adoption_recommendation.recommendation_class`);
  if (maturity === "LIGHT_LOW_RISK_PROJECT") {
    if (evidence.governance_maturity?.production_sensitivity === "no") pass(`${label} light low-risk project has explicit low production sensitivity`);
    else fail(`${label} LIGHT_LOW_RISK_PROJECT requires production_sensitivity = no`);
  }
}

function checkSourceBlockers(label, evidence) {
  const targetBlockers = (evidence.source_chain || []).filter((source) => source.status === "BLOCKED"
    && source.current_project_match === "Yes"
    && ["dirty_or_unsafe", "project_authority"].includes(source.blocker_class));
  if (targetBlockers.length === 0) {
    pass(`${label} source blocker consistency satisfied`);
    return;
  }
  const hasDirty = targetBlockers.some((source) => source.blocker_class === "dirty_or_unsafe");
  const hasAuthority = targetBlockers.some((source) => source.blocker_class === "project_authority");
  if (hasDirty) {
    if (evidence.governance_maturity?.state === "DIRTY_OR_UNSAFE_PROJECT"
      && evidence.adoption_recommendation?.recommendation_class === "BLOCK_NATIVE_ADOPTION"
      && evidence.outcome === "BLOCKED_BY_UNSAFE_PROJECT_STATE") {
      pass(`${label} dirty/unsafe source blocker drives unsafe blocked recommendation`);
    } else {
      fail(`${label} dirty/unsafe source blocker must drive DIRTY_OR_UNSAFE_PROJECT and BLOCKED_BY_UNSAFE_PROJECT_STATE`);
    }
  }
  if (hasAuthority && !hasDirty) {
    if (evidence.governance_maturity?.state === "UNKNOWN_OR_OWNERLESS_PROJECT"
      && evidence.adoption_recommendation?.recommendation_class === "AUTHORITY_RECONCILIATION_THEN_SELECTED_OVERLAY_PLAN"
      && evidence.outcome === "READY_FOR_AUTHORITY_RECONCILIATION") {
      pass(`${label} project-authority source blocker drives read-only authority reconciliation`);
    } else {
      fail(`${label} project-authority source blocker must drive UNKNOWN_OR_OWNERLESS_PROJECT and READY_FOR_AUTHORITY_RECONCILIATION`);
    }
  }
}

function checkMarkdownConsistency(content, label, evidence) {
  const summary = sectionBody(content, "Human Summary") || "";
  const outcome = stripMarkdown(sectionBody(content, "Outcome") || "").trim();
  if (summary.includes("Codex can write now") && summary.includes("No")) pass(`${label} Human Summary keeps write boundary`);
  else fail(`${label} Human Summary must keep write boundary`);
  if (outcome.includes(evidence.outcome)) pass(`${label} outcome section matches structured outcome`);
  else fail(`${label} outcome section must include ${evidence.outcome}`);
}

function checkBoundaryTables(content, label) {
  const body = sectionBody(content, "Boundaries") || "";
  for (const [key, expected] of [
    ["Writes target files", "No"],
    ["Installs IntentOS assets", "No"],
    ["Changes AGENTS or CI", "No"],
    ["Native apply allowed", "No"],
    ["Approves implementation", "No"],
    ["Approves release or production", "No"],
  ]) {
    const value = tableValue(body, key);
    if (value === expected) pass(`${label} boundary ${key} is ${expected}`);
    else fail(`${label} boundary ${key} must be ${expected}, got ${value || "<empty>"}`);
  }
}

function tableValue(markdown, key) {
  const lines = markdown.split(/\r?\n/);
  for (const line of lines) {
    const cells = line.split("|").slice(1, -1).map((cell) => stripMarkdown(cell).trim());
    if (cells.length >= 2 && cells[0].toLowerCase() === key.toLowerCase()) return cells[1];
  }
  return "";
}

function reportRefCandidates(file) {
  return [
    path.relative(projectRoot, file).replaceAll(path.sep, "/"),
    path.relative(path.dirname(file), file).replaceAll(path.sep, "/"),
  ];
}

function markdownFiles(relativeDir) {
  const dir = path.join(projectRoot, relativeDir);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return markdownFiles(path.relative(projectRoot, full));
      return entry.isFile() && entry.name.endsWith(".md") ? [full] : [];
    });
}

function resolveAsset(relativePath) {
  const direct = path.join(projectRoot, relativePath);
  if (fs.existsSync(direct)) return direct;
  const managed = path.join(projectRoot, ".intentos", relativePath);
  if (fs.existsSync(managed)) return managed;
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
  const managedPrefix = `${path.join(projectRoot, ".intentos")}${path.sep}`;
  if (resolved.startsWith(managedPrefix)) return `.intentos/${relativePath}`;
  return relativePath;
}

function rel(file) {
  return path.relative(projectRoot, file).replaceAll(path.sep, "/");
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
    console.log(JSON.stringify({ ok: !failed, checks }, null, 2));
  } else if (!failed) {
    console.log("");
    console.log("Controlled Native Adoption Review check passed.");
  }
  process.exit(failed ? 1 : 0);
}
