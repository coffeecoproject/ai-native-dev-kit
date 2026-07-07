#!/usr/bin/env node

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
const explicitReport = args.report ? resolveReportPath(String(args.report)) : "";
const schema = loadSchema(projectRoot, "schemas/artifacts/existing-project-adoption-autopilot.schema.json");
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
  "core/existing-project-safe-adoption-autopilot.md",
  "docs/existing-project-safe-adoption-autopilot.md",
  "templates/existing-project-adoption-autopilot-report.md",
  "schemas/artifacts/existing-project-adoption-autopilot.schema.json",
  "checklists/existing-project-adoption-autopilot-review.md",
  "prompts/existing-project-adoption-autopilot-agent.md",
  "scripts/resolve-existing-project-adoption-autopilot.mjs",
  "scripts/check-existing-project-adoption-autopilot.mjs",
];
const requiredDirectories = ["adoption-autopilot-reports"];
const requiredSections = [
  "Human Summary",
  "What I Checked",
  "Current Adoption State",
  "Safe Action Budget",
  "What I Did Not Change",
  "What Codex Can Safely Do Next",
  "Human Decisions Needed",
  "Technical Trace",
  "Boundaries",
  "Machine-Readable Evidence",
  "Outcome",
];
const userFacingSections = requiredSections.filter((section) => !["Technical Trace", "Machine-Readable Evidence"].includes(section));
const internalBurdenPatterns = [
  /\bnative[-_ ]migration\b/i,
  /\breconcile[-_ ]rules\b/i,
  /\bgovernance[-_ ]convergence\b/i,
  /\badoption[-_ ]assurance\b/i,
  /\bcontrolled apply readiness\b/i,
  /\bselected native adoption\b/i,
  /\bagent rule convergence\b/i,
  /\bDOCS_ONLY/i,
  /\bPARTIAL_ADOPTION_SAFE_MODE\b/i,
  /\bIntentOS Operating Mode ACTIVE\b/i,
];
const forbiddenClaimPatterns = [
  /\bfully adopted\b/i,
  /\bfull adoption\b[^|`\n]*\bYes\b/i,
  /\bproject authority changed\b[^|`\n]*\bYes\b/i,
  /\bnative assets installed\b[^|`\n]*\bYes\b/i,
  /\bwrites target files\b[^|`\n]*\bYes\b/i,
  /\bruntime changes performed\b[^|`\n]*\bYes\b/i,
  /\bapproves implementation\b[^|`\n]*\bYes\b/i,
  /\bapproves release or production\b[^|`\n]*\bYes\b/i,
  /完整接入/,
  /已完整采纳/,
  /批准(实现|提交|发布|生产|上线)/,
  /自动写入目标项目/,
  /替代项目权威/,
];
const rawSummaryEnumPatterns = [
  /\bSAFE_READ_ONLY_ADOPTION_COMPLETE\b/,
  /\bREADY_FOR_RULE_ENTRY_REVIEW\b/,
  /\bBLOCKED_BY_PROJECT_AUTHORITY\b/,
  /\bBLOCKED_BY_UNSAFE_PROJECT_STATE\b/,
  /\bBLOCKED_BY_PROJECT_NOT_FOUND\b/,
  /\bFAILED_INVALID_EVIDENCE\b/,
  /\bAVAILABLE_FOR_SAFE_USE\b/,
  /\bREAD_ONLY_DIAGNOSIS_ONLY\b/,
  /\bNOT_AVAILABLE\b/,
];

let failed = false;
const checks = [];

if (!outputJson) {
  console.log("# Existing Project Adoption Autopilot Check");
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
    readResolved("core/existing-project-safe-adoption-autopilot.md"),
    readResolved("docs/existing-project-safe-adoption-autopilot.md"),
    readResolved("templates/existing-project-adoption-autopilot-report.md"),
    readResolved("schemas/artifacts/existing-project-adoption-autopilot.schema.json"),
  ].join("\n");
  if (!combined.trim()) return;
  for (const marker of [
    "Existing Project Safe Adoption Autopilot",
    "existing_project_adoption_autopilot",
    "AVAILABLE_FOR_SAFE_USE",
    "S0_READ_ONLY_ONLY",
    "project_authority_changed",
    "native_assets_installed",
    "full_adoption_claim",
    "does not claim the project is fully adopted",
  ]) {
    if (combined.includes(marker)) pass(`adoption autopilot docs include ${marker}`);
    else fail(`adoption autopilot docs missing ${marker}`);
  }
}

function checkReports() {
  const files = explicitReport ? [explicitReport] : markdownFiles("adoption-autopilot-reports");
  if (files.length === 0) {
    if (allowEmpty) pass("adoption autopilot check skipped by explicit --allow-empty: no reports");
    else if (requireReport || explicitReport) fail("no Existing Project Adoption Autopilot reports found");
    else pass("SKIPPED_NO_REPORT: no Existing Project Adoption Autopilot reports found");
    return;
  }
  for (const file of files) {
    if (!fs.existsSync(file)) {
      fail(`missing explicit Existing Project Adoption Autopilot report ${file}`);
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
    if (hasSection(content, section)) pass(`${label} includes ${section}`);
    else fail(`${label} missing section ${section}`);
  }
  const userText = userFacingText(content);
  for (const pattern of internalBurdenPatterns) {
    if (pattern.test(userText)) fail(`${label} exposes internal workflow burden to user: ${pattern.source}`);
  }
  for (const pattern of forbiddenClaimPatterns) {
    if (pattern.test(content)) fail(`${label} contains forbidden adoption claim: ${pattern.source}`);
  }
  requireTableValue(content, label, "Human Summary", "Project authority changed", "No");
  requireTableValue(content, label, "Human Summary", "Native assets installed", "No");
  requireTableValue(content, label, "Human Summary", "Full adoption claim", "No");
  requireTableValue(content, label, "Boundaries", "Writes target files", "No");
  requireTableValue(content, label, "Boundaries", "Runtime changes performed", "No");
  requireTableValue(content, label, "Boundaries", "Project authority changed", "No");
  requireTableValue(content, label, "Boundaries", "Native assets installed", "No");
  requireTableValue(content, label, "Boundaries", "Full adoption claimed", "No");
  requireTableValue(content, label, "Boundaries", "Approves implementation", "No");
  requireTableValue(content, label, "Boundaries", "Approves release or production", "No");

  const result = validateEvidenceBlock(content, schema, label, {
    require: requireStructuredEvidence,
    digestField: "adoption_autopilot_digest",
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
  checkStructuredEvidence(label, file, evidence);
  checkMarkdownConsistency(content, label, evidence);
}

function checkStructuredEvidence(label, file, evidence) {
  const refs = reportRefCandidates(file);
  if (refs.includes(evidence.adoption_autopilot_ref)) pass(`${label} adoption_autopilot_ref points to this report`);
  else fail(`${label} adoption_autopilot_ref ${evidence.adoption_autopilot_ref || "<missing>"} must point to ${refs.join(" or ")}`);

  for (const [field, expected] of [
    ["project_authority_changed", "No"],
    ["native_assets_installed", "No"],
    ["full_adoption_claim", "No"],
    ["safe_action_budget", "S0_READ_ONLY_ONLY"],
    ["writes_performed", "No"],
    ["runtime_changes_performed", "No"],
  ]) {
    if (evidence[field] === expected) pass(`${label} ${field} is ${expected}`);
    else fail(`${label} ${field} must be ${expected}`);
  }
  if (evidence.boundary?.writes_target_files === "No"
    && evidence.boundary?.runtime_changes_performed === "No"
    && evidence.boundary?.project_authority_changed === "No"
    && evidence.boundary?.native_assets_installed === "No"
    && evidence.boundary?.full_adoption_claim === "No"
    && evidence.boundary?.approves_implementation === "No"
    && evidence.boundary?.approves_release_or_production === "No") {
    pass(`${label} structured boundaries are read-only`);
  } else {
    fail(`${label} structured boundaries must remain read-only`);
  }
  for (const action of evidence.internal_actions || []) {
    if (action.level === "S0") pass(`${label} internal action ${action.id} stays S0`);
    else fail(`${label} internal action ${action.id || "<unknown>"} must stay S0 in 1.81.0`);
  }
  for (const decision of evidence.human_decisions || []) {
    for (const pattern of internalBurdenPatterns) {
      if (pattern.test(decision.plain_question || "")) {
        fail(`${label} human decision exposes internal workflow burden: ${decision.plain_question}`);
      }
    }
  }
}

function checkMarkdownConsistency(content, label, evidence) {
  const summary = sectionBody(content, "Human Summary") || "";
  for (const pattern of rawSummaryEnumPatterns) {
    if (pattern.test(summary)) fail(`${label} Human Summary exposes raw internal enum: ${pattern.source}`);
  }
  compareTable(label, summary, "Current state", plainStateFor(evidence.adoption_state));
  compareTable(label, summary, "IntentOS working mode", plainWorkingModeFor(evidence.intentos_working_mode));
  compareTable(label, summary, "Project authority changed", evidence.project_authority_changed);
  compareTable(label, summary, "Native assets installed", evidence.native_assets_installed);
  compareTable(label, summary, "Full adoption claim", evidence.full_adoption_claim);
  const outcome = stripMarkdown(sectionBody(content, "Outcome") || "").trim();
  if (outcome.includes(evidence.outcome)) pass(`${label} outcome matches structured evidence`);
  else fail(`${label} outcome must include ${evidence.outcome}`);
}

function userFacingText(content) {
  return userFacingSections
    .map((section) => sectionBody(content, section))
    .join("\n");
}

function requireTableValue(content, label, section, key, expected) {
  const body = sectionBody(content, section) || "";
  const value = tableValue(body, key);
  if (value === expected) pass(`${label} ${section} ${key} is ${expected}`);
  else fail(`${label} ${section} ${key} must be ${expected}, got ${value || "<empty>"}`);
}

function compareTable(label, body, key, expected) {
  const value = tableValue(body, key);
  if (value === expected) pass(`${label} ${key} matches structured evidence`);
  else fail(`${label} ${key} ${value || "<empty>"} does not match ${expected}`);
}

function plainStateFor(state) {
  if (state === "SAFE_READ_ONLY_ADOPTION_COMPLETE") return "The project can use IntentOS as a safe read-only working method now. No project files were changed.";
  if (state === "READY_FOR_RULE_ENTRY_REVIEW") return "The project can use IntentOS safely, but deeper adoption needs a separate collaboration-instruction review plan.";
  if (state === "BLOCKED_BY_PROJECT_AUTHORITY") return "The project has authority rules that must be reviewed before deeper adoption.";
  if (state === "BLOCKED_BY_UNSAFE_PROJECT_STATE") return "The project has an unsafe current state for adoption writes. Codex can keep analyzing without writing files.";
  if (state === "BLOCKED_BY_PROJECT_NOT_FOUND") return "The target project path was not found.";
  return "The evidence is invalid or incomplete, so Codex cannot claim adoption status.";
}

function plainWorkingModeFor(mode) {
  if (mode === "AVAILABLE_FOR_SAFE_USE") return "Available as a read-only working method.";
  if (mode === "READ_ONLY_DIAGNOSIS_ONLY") return "Read-only diagnosis only until the unsafe project state is resolved.";
  return "Not available until the blocking evidence is fixed.";
}

function tableValue(markdown, key) {
  const lines = markdown.split(/\r?\n/);
  for (const line of lines) {
    const cells = line.split("|").slice(1, -1).map((cell) => stripMarkdown(cell).trim());
    if (cells.length >= 2 && cells[0].toLowerCase() === key.toLowerCase()) return cells[1];
  }
  return "";
}

function hasSection(content, section) {
  return Boolean(sectionBody(content, section));
}

function markdownFiles(relativeDir) {
  const dir = path.join(projectRoot, relativeDir);
  if (!fs.existsSync(dir)) return [];
  return walk(dir).filter((file) => file.endsWith(".md")).sort();
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else files.push(full);
  }
  return files;
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
  const file = resolveAsset(relativePath);
  return file ? fs.readFileSync(file, "utf8") : "";
}

function displayAsset(relativePath, resolved) {
  const managedPrefix = `${path.join(projectRoot, ".intentos")}${path.sep}`;
  return resolved.startsWith(managedPrefix) ? `.intentos/${relativePath}` : relativePath;
}

function resolveReportPath(value) {
  const resolved = path.resolve(process.cwd(), value);
  return resolved;
}

function reportRefCandidates(file) {
  const relative = rel(file);
  return [
    relative,
    `./${relative}`,
  ];
}

function rel(file) {
  return path.relative(projectRoot, file).replaceAll(path.sep, "/");
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
    console.log(JSON.stringify({ ok: !failed, checks }, null, 2));
  } else if (!failed) {
    console.log("");
    console.log("Existing Project Adoption Autopilot check passed.");
  }
  process.exit(failed ? 1 : 0);
}
