#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { containsSecretLikeValue } from "./lib/risk-surfaces.mjs";
import { sectionBody, splitMarkdownRow, stripMarkdown } from "./lib/markdown.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["json"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputJson = Boolean(args.json);
const isSourceRepo = fs.existsSync(path.join(projectRoot, "dev-kit-manifest.json"))
  && fs.existsSync(path.join(projectRoot, "core", "workflow.md"));
const shouldRequireAssets = isSourceRepo
  || fs.existsSync(path.join(projectRoot, ".ai-native", "dev-kit-manifest.json"))
  || fs.existsSync(path.join(projectRoot, ".ai-native", "version.json"));

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

const requiredAssets = [
  "core/native-first-existing-project-migration.md",
  "docs/native-first-existing-project-migration.md",
  "templates/native-migration-plan.md",
  "checklists/native-migration-review.md",
  "prompts/native-migration-agent.md",
  "scripts/resolve-native-migration.mjs",
  "scripts/check-native-migration.mjs",
];
const requiredDirectories = ["native-migration-plans"];
const requiredSections = [
  "Human Summary",
  "Existing Governance Inventory",
  "Extracted Rule Classification",
  "Conflicts And Decisions",
  "Proposed Native Migration Plan",
  "Proposed AGENTS.md Handling",
  "Preserve / Replace / Archive Suggestions",
  "Restore Plan",
  "Authority Transition",
  "Apply Chain",
  "Human Decisions Needed",
  "Boundaries",
  "Outcome",
];
const allowedPostures = new Set([
  "FULL_MANAGED_INTENTOS_NATIVE",
  "NATIVE_FIRST_MIGRATION",
  "NATIVE_FIRST_WITH_GOVERNANCE_CONFLICT_REVIEW",
  "PRODUCTION_SAFE_NATIVE_OVERLAY",
  "NATIVE_FIRST_PENDING_WORKTREE_REVIEW",
  "BLOCKED_NEEDS_OWNER",
  "ADAPTER_ONLY_RECOMMENDED",
]);
const allowedWorkflowAuthority = new Set(["ACTIVE_FOR_PLANNING", "PENDING_APPROVAL", "BLOCKED"]);
const allowedWriteAuthority = new Set(["NO_WRITE", "PLAN_REQUIRED", "APPROVAL_REQUIRED"]);
const allowedOutcomes = new Set(["NATIVE_MIGRATION_PLAN_RECORDED", "NEEDS_HUMAN_DECISION", "BLOCKED"]);
const allowedRuleClasses = new Set([
  "BUSINESS_FACT",
  "PROJECT_CONSTRAINT",
  "PRODUCTION_CONTROL",
  "ENGINEERING_BASELINE",
  "WORKFLOW_RULE",
  "HISTORICAL_NOTE",
  "UNKNOWN_AUTHORITY",
]);
const forbiddenClaims = [
  /\bfully migrated\b/i,
  /\balready fully migrated\b/i,
  /\bequal authority\b/i,
  /\boverwrote AGENTS\.md\b/i,
  /\bdirectly rewrites? AGENTS\.md\b/i,
  /\bremoves? business constraint\b/i,
  /\bdrops? business rule\b/i,
  /\bremoves? production constraint\b/i,
  /\bchanges? production config\b(?!, secrets, migrations, payment, permissions, data, provider state, legal, tax, finance, HR, security, privacy, or compliance behavior:\s*No)/i,
  /\bmodifies? CI\b(?! or hooks:\s*No)/i,
  /\binstalls? hooks?\b/i,
  /\bapproves implementation\b(?!:\s*No)/i,
  /\bapproves release\b(?! or production:\s*No)/i,
  /\bapproves production\b(?!:\s*No)/i,
  /\bsecret=.*[A-Za-z0-9]/i,
  /\bTOKEN=.*[A-Za-z0-9]/i,
  /\bPASSWORD=.*[A-Za-z0-9]/i,
];
const broadPathPattern = /(`|\s|\|)(\.|\/|repo root|repository root|docs\/\*\*|docs\/|\*\*|all workflow files|all files)(`|\s|\|)/i;

let failed = false;
const checks = [];

if (!outputJson) {
  console.log("# Native Migration Check");
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
checkNativeMigrationPlans();

if (isSourceRepo) checkSourceEvidence();
else pass("source-only 1.62 native migration evidence checks skipped for target project");

emitAndExit();

function checkCoreContent() {
  const combined = [
    readResolved("core/native-first-existing-project-migration.md"),
    readResolved("docs/native-first-existing-project-migration.md"),
    readResolved("templates/native-migration-plan.md"),
  ].join("\n");
  if (!combined.trim()) return;
  for (const marker of [
    "Native-First Existing Project Migration",
    "Native-First Migration Planning mode",
    "IntentOS may become the workflow authority",
    "IntentOS must not become the business",
    "intentOsWorkflowAuthority",
    "targetFileWriteAuthority",
    "businessAuthority",
    "productionAuthority",
    "Unified Apply Plan",
    "Controlled Apply Readiness",
    "Approval Record",
    "This plan writes target files: No",
  ]) {
    if (combined.includes(marker)) pass(`native migration docs include ${marker}`);
    else fail(`native migration docs missing ${marker}`);
  }
}

function checkNativeMigrationPlans() {
  const files = markdownFiles("native-migration-plans");
  if (files.length === 0) {
    pass("native migration check skipped: no native migration plans");
    return;
  }

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const label = rel(file);
    if (containsSecretLikeValue(content)) fail(`${label} contains secret-like content`);
    for (const pattern of forbiddenClaims) {
      if (pattern.test(content)) fail(`${label} contains forbidden native migration claim: ${pattern.source}`);
    }
    if (!content.includes("I have switched to IntentOS Native-First Migration Planning mode.")) {
      fail(`${label} must start by switching into Native-First Migration Planning mode`);
    } else {
      pass(`${label} includes Native-First mode statement`);
    }

    for (const section of requiredSections) requireSection(content, section, label);

    const summary = sectionBody(content, "Human Summary") || "";
    const posture = tableValue(summary, "Recommended Posture");
    const canWrite = tableValue(summary, "Can Codex write now");
    const workflowAuthority = tableValue(summary, "IntentOS Workflow Authority");
    const writeAuthority = tableValue(summary, "Target File Write Authority");
    const businessAuthority = tableValue(summary, "Business Authority");
    const productionAuthority = tableValue(summary, "Production Authority");
    const approvalBeforeApply = tableValue(summary, "Requires Human Approval Before Apply");

    if (allowedPostures.has(posture)) pass(`${label} has valid posture`);
    else fail(`${label} has invalid posture: ${posture || "<empty>"}`);
    if (canWrite === "No") pass(`${label} keeps Codex write authority off`);
    else fail(`${label} must say Can Codex write now is No`);
    if (allowedWorkflowAuthority.has(workflowAuthority)) pass(`${label} has valid IntentOS workflow authority`);
    else fail(`${label} has invalid IntentOS workflow authority: ${workflowAuthority || "<empty>"}`);
    if (allowedWriteAuthority.has(writeAuthority)) pass(`${label} has valid target-file write authority`);
    else fail(`${label} has invalid target-file write authority: ${writeAuthority || "<empty>"}`);
    if (businessAuthority === "PROJECT_OWNED") pass(`${label} keeps business authority project-owned`);
    else fail(`${label} must keep Business Authority PROJECT_OWNED`);
    if (productionAuthority === "HUMAN_OR_EXTERNAL_SYSTEM") pass(`${label} keeps production authority human/external`);
    else fail(`${label} must keep Production Authority HUMAN_OR_EXTERNAL_SYSTEM`);
    if (approvalBeforeApply === "Yes") pass(`${label} requires human approval before apply`);
    else fail(`${label} must require human approval before apply`);

    checkRuleClassification(content, label);
    checkProposedActions(content, label);
    checkAgentsHandling(content, label);
    checkRestorePlan(content, label);
    checkAuthorityTransition(content, label);
    checkApplyChain(content, label);
    checkBoundaries(content, label);

    const outcome = codeOrTextValue(sectionBody(content, "Outcome"));
    if (allowedOutcomes.has(outcome)) pass(`${label} has valid Outcome`);
    else fail(`${label} has invalid Outcome: ${outcome || "<empty>"}`);
  }
}

function checkRuleClassification(content, label) {
  const body = sectionBody(content, "Extracted Rule Classification") || "";
  const rows = tableRows(body);
  if (rows.length === 0) {
    fail(`${label} must include extracted rule classification rows`);
    return;
  }
  for (const row of rows) {
    const [
      ruleId,
      sourceFile,
      sourceExcerpt,
      ruleClass,
      authority,
      defaultHandling,
      preserveOrReplace,
      reason,
      riskSurfaces,
      targetAction,
      humanDecisionRequired,
    ] = row.map(stripMarkdown);
    const rowLabel = `${label} ${ruleId || "rule"}`;
    if (isConcrete(ruleId)) pass(`${rowLabel} records rule id`);
    else fail(`${rowLabel} missing rule id`);
    if (isConcrete(sourceFile) && sourceFile !== "N/A") pass(`${rowLabel} records source file`);
    else fail(`${rowLabel} missing source file`);
    if (isConcrete(sourceExcerpt) && sourceExcerpt !== "N/A") pass(`${rowLabel} records source excerpt`);
    else fail(`${rowLabel} missing source excerpt`);
    if (allowedRuleClasses.has(ruleClass)) pass(`${rowLabel} has valid rule class`);
    else fail(`${rowLabel} has invalid rule class: ${ruleClass || "<empty>"}`);
    if (isConcrete(authority)) pass(`${rowLabel} records authority`);
    else fail(`${rowLabel} missing authority`);
    if (isConcrete(defaultHandling)) pass(`${rowLabel} records default handling`);
    else fail(`${rowLabel} missing default handling`);
    if (isConcrete(preserveOrReplace)) pass(`${rowLabel} records preserve/replace decision`);
    else fail(`${rowLabel} missing preserve/replace decision`);
    if (isConcrete(reason)) pass(`${rowLabel} records reason`);
    else fail(`${rowLabel} missing reason`);
    if (isConcrete(riskSurfaces)) pass(`${rowLabel} records risk surfaces`);
    else fail(`${rowLabel} missing risk surfaces`);
    if (isConcrete(targetAction)) pass(`${rowLabel} records target action`);
    else fail(`${rowLabel} missing target action`);
    if (humanDecisionRequired === "Yes") pass(`${rowLabel} requires human decision`);
    else fail(`${rowLabel} must require human decision`);

    const excerptAndAction = `${sourceExcerpt} ${targetAction} ${preserveOrReplace}`;
    if (ruleClass === "WORKFLOW_RULE"
      && /\b(customer|business|contract|invoice|tax|finance|HR|payment|permission|data)\b/i.test(sourceExcerpt)
      && /\b(replace|remove|drop)\b/i.test(excerptAndAction)) {
      fail(`${rowLabel} misclassifies a business rule as replaceable workflow`);
    }
    if (ruleClass === "ENGINEERING_BASELINE"
      && /\b(release|rollback|deploy|production|secret|migration|incident|provider)\b/i.test(sourceExcerpt)) {
      fail(`${rowLabel} misclassifies production control as engineering baseline`);
    }
    if (ruleClass === "UNKNOWN_AUTHORITY" && !/\b(stop|classify|owner|confirm)\b/i.test(targetAction)) {
      fail(`${rowLabel} unknown authority must stop for classification`);
    }
  }
}

function checkProposedActions(content, label) {
  const body = sectionBody(content, "Proposed Native Migration Plan") || "";
  const rows = tableRows(body);
  if (rows.length === 0) {
    fail(`${label} must include proposed native migration actions`);
    return;
  }
  for (const row of rows) {
    const action = stripMarkdown(row[1] || "");
    const targetPath = stripMarkdown(row[2] || "");
    const writes = stripMarkdown(row[3] || "");
    const approval = stripMarkdown(row[4] || "");
    if (!isConcrete(targetPath)) fail(`${label} proposed action missing exact target path: ${action}`);
    else pass(`${label} proposed action has exact target path: ${targetPath}`);
    if (broadPathPattern.test(` ${targetPath} `)) fail(`${label} uses broad target path: ${targetPath}`);
    if (writes === "Yes") fail(`${label} proposed action claims direct target-file writes: ${action}`);
    else pass(`${label} proposed action stays plan-only: ${action}`);
    if (approval === "Yes") pass(`${label} proposed action requires approval: ${action}`);
    else fail(`${label} proposed action must require human approval: ${action}`);
  }
}

function checkAgentsHandling(content, label) {
  const body = sectionBody(content, "Proposed AGENTS.md Handling") || "";
  if (!body.trim()) {
    fail(`${label} missing AGENTS.md handling`);
    return;
  }
  for (const marker of [
    "Project facts preserved",
    "Old workflow rules replaced by IntentOS only after approval",
    "Restore owner",
  ]) {
    if (body.includes(marker)) pass(`${label} AGENTS handling includes ${marker}`);
    else fail(`${label} AGENTS handling missing ${marker}`);
  }
}

function checkRestorePlan(content, label) {
  const body = sectionBody(content, "Restore Plan") || "";
  for (const marker of ["Backup path", "Restore method", "Restore owner", "If owner rejects migration"]) {
    if (body.includes(marker) && isConcrete(tableValue(body, marker))) pass(`${label} restore plan includes ${marker}`);
    else fail(`${label} restore plan missing ${marker}`);
  }
}

function checkAuthorityTransition(content, label) {
  const body = sectionBody(content, "Authority Transition") || "";
  if (/\bequal authority\b/i.test(body)) {
    fail(`${label} authority transition must not keep old workflow and IntentOS as equal authority`);
  }
  for (const marker of ["Old workflow rules", "IntentOS rules", "Transition condition"]) {
    if (body.includes(marker) && isConcrete(tableValue(body, marker))) pass(`${label} authority transition includes ${marker}`);
    else fail(`${label} authority transition missing ${marker}`);
  }
}

function checkApplyChain(content, label) {
  const body = sectionBody(content, "Apply Chain") || "";
  for (const marker of ["Native Migration Plan", "Unified Apply Plan", "Controlled Apply Readiness", "Approval Record", "approved governance-file edits only"]) {
    if (body.includes(marker)) pass(`${label} apply chain includes ${marker}`);
    else fail(`${label} apply chain missing ${marker}`);
  }
}

function checkBoundaries(content, label) {
  for (const boundary of [
    "This plan writes target files",
    "This plan authorizes target-file writes",
    "This plan approves implementation",
    "This plan approves release or production",
    "This plan modifies CI or hooks",
    "This plan changes production config, secrets, migrations, payment, permissions, data, provider state, legal, tax, finance, HR, security, privacy, or compliance behavior",
    "This plan treats IntentOS workflow authority as business authority",
  ]) {
    requireBoundaryNo(content, label, boundary);
  }
  const approval = boundaryValue(content, "This plan requires human approval before governance replacement");
  if (approval === "Yes") pass(`${label} requires human approval before governance replacement`);
  else fail(`${label} must require human approval before governance replacement`);
}

function checkSourceEvidence() {
  for (const file of [
    "docs/plans/native-first-existing-project-migration-1.62-plan.md",
    "core/native-first-existing-project-migration.md",
    "docs/native-first-existing-project-migration.md",
    "templates/native-migration-plan.md",
    "checklists/native-migration-review.md",
    "prompts/native-migration-agent.md",
    "native-migration-plans/.gitkeep",
    "scripts/resolve-native-migration.mjs",
    "scripts/check-native-migration.mjs",
    "examples/1.62-native-first-existing-project/README.md",
    "examples/1.62-native-first-existing-project/light-web/native-migration-plans/001-light-web.md",
    "examples/1.62-native-first-existing-project/governed-admin/native-migration-plans/001-governed-admin.md",
    "examples/1.62-native-first-existing-project/production-maintained/native-migration-plans/001-production-maintained.md",
    "examples/1.62-native-first-existing-project/dirty-worktree/native-migration-plans/001-dirty-worktree.md",
    "releases/1.62.0/release-record.md",
    "releases/1.62.0/known-limitations.md",
    "releases/1.62.0/self-check-report.md",
  ]) {
    if (exists(file)) pass(`1.62 native migration source evidence exists ${file}`);
    else fail(`1.62 native migration source evidence missing ${file}`);
  }

  const resolver = runNode(["scripts/resolve-native-migration.mjs", "."]);
  if (resolver.status === 0
    && resolver.stdout.includes("I have switched to IntentOS Native-First Migration Planning mode.")
    && resolver.stdout.includes("This plan writes target files: No")
    && resolver.stdout.includes("Unified Apply Plan")) {
    pass("1.62 native migration resolver prints safe plan");
  } else {
    fail(`1.62 native migration resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const json = runNode(["scripts/resolve-native-migration.mjs", ".", "--json"]);
  try {
    const parsed = JSON.parse(json.stdout);
    if (json.status === 0
      && parsed.reportType === "NATIVE_FIRST_EXISTING_PROJECT_MIGRATION"
      && allowedPostures.has(parsed.posture)
      && parsed.canCodexWriteNow === "No"
      && parsed.intentOsWorkflowAuthority
      && parsed.targetFileWriteAuthority
      && parsed.businessAuthority === "PROJECT_OWNED"
      && parsed.productionAuthority === "HUMAN_OR_EXTERNAL_SYSTEM") {
      pass("1.62 native migration resolver JSON includes posture and authorities");
    } else {
      fail("1.62 native migration resolver JSON missing required fields");
    }
  } catch (error) {
    fail(`1.62 native migration resolver JSON parse failed: ${error.message}`);
  }

  for (const target of [
    "examples/1.62-native-first-existing-project/light-web",
    "examples/1.62-native-first-existing-project/governed-admin",
    "examples/1.62-native-first-existing-project/production-maintained",
    "examples/1.62-native-first-existing-project/dirty-worktree",
  ]) {
    const result = runNode(["scripts/check-native-migration.mjs", target]);
    if (result.status === 0) pass(`1.62 native migration example passes ${target}`);
    else fail(`1.62 native migration example failed ${target}: ${result.stderr || result.stdout}`);
  }

  for (const target of [
    "bad-native-migration-drops-business-rule",
    "bad-native-migration-direct-agents-overwrite",
    "bad-native-migration-keeps-split-authority",
    "bad-native-migration-auto-ci-hook",
    "bad-native-migration-production-config",
    "bad-native-migration-no-human-approval",
    "bad-native-migration-no-restore-plan",
    "bad-native-migration-approves-implementation",
    "bad-native-migration-unknown-owner",
    "bad-native-migration-business-rule-as-workflow-rule",
    "bad-native-migration-production-control-as-baseline",
    "bad-native-migration-no-source-excerpt",
    "bad-native-migration-broad-target-path",
    "bad-native-migration-no-authority-transition",
  ]) {
    const result = runNode(["scripts/check-native-migration.mjs", `test-fixtures/bad/${target}`]);
    if (result.status !== 0) pass(`1.62 native migration rejects ${target}`);
    else fail(`1.62 native migration should reject ${target}`);
  }
}

function markdownFiles(dirName) {
  const roots = candidateRoots(dirName).filter((item) => fs.existsSync(item));
  const results = [];
  for (const root of roots) results.push(...walkMarkdown(root));
  return Array.from(new Set(results)).sort();
}

function walkMarkdown(dir) {
  if (!fs.existsSync(dir)) return [];
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...walkMarkdown(full));
    else if (entry.name.endsWith(".md")) results.push(full);
  }
  return results;
}

function candidateRoots(name) {
  return [
    path.join(projectRoot, name),
    path.join(projectRoot, ".ai-native", name),
  ];
}

function resolveAsset(relPath) {
  const direct = path.join(projectRoot, relPath);
  if (fs.existsSync(direct)) return direct;
  const aiNative = path.join(projectRoot, ".ai-native", relPath);
  if (fs.existsSync(aiNative)) return aiNative;
  return null;
}

function resolveDirectory(relPath) {
  const direct = path.join(projectRoot, relPath);
  if (fs.existsSync(direct) && fs.statSync(direct).isDirectory()) return direct;
  const aiNative = path.join(projectRoot, ".ai-native", relPath);
  if (fs.existsSync(aiNative) && fs.statSync(aiNative).isDirectory()) return aiNative;
  return null;
}

function readResolved(relPath) {
  const resolved = resolveAsset(relPath);
  return resolved ? fs.readFileSync(resolved, "utf8") : "";
}

function requireSection(content, heading, label) {
  if (sectionBody(content, heading, { fallback: null }) !== null) pass(`${label} includes section ${heading}`);
  else fail(`${label} missing section ${heading}`);
}

function requireBoundaryNo(content, label, boundary) {
  const value = boundaryValue(content, boundary);
  if (value === "No") pass(`${label} boundary ${boundary}: No`);
  else fail(`${label} boundary ${boundary} must be No`);
}

function boundaryValue(content, boundary) {
  const escaped = boundary.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = content.match(new RegExp(`[-*]\\s+${escaped}:\\s*([^\\n]+)`, "i"));
  return stripMarkdown(match?.[1] || "");
}

function tableValue(content, field) {
  const rows = content.split(/\r?\n/);
  for (const row of rows) {
    if (!row.trim().startsWith("|")) continue;
    const cells = splitMarkdownRow(row).map(stripMarkdown);
    if (cells.length >= 2 && cells[0].toLowerCase() === field.toLowerCase()) return cells[1];
  }
  return "";
}

function tableRows(content) {
  return content
    .split(/\r?\n/)
    .filter((line) => line.trim().startsWith("|"))
    .map((line) => splitMarkdownRow(line))
    .filter((cells) => cells.length > 0)
    .filter((cells) => !cells.every((cell) => /^:?-{3,}:?$/.test(cell.trim())))
    .filter((cells) => !/^rule id$/i.test(stripMarkdown(cells[0] || "")))
    .filter((cells) => !/^step$/i.test(stripMarkdown(cells[0] || "")));
}

function codeOrTextValue(body) {
  const code = body?.match(/`([^`]+)`/);
  if (code) return code[1].trim();
  return stripMarkdown((body || "").split(/\r?\n/).find((line) => line.trim()) || "");
}

function isConcrete(value) {
  const text = stripMarkdown(value || "");
  return Boolean(text) && !/^(N\/A|TBD|TODO|unknown|none|<.*>)$/i.test(text);
}

function exists(relPath) {
  return fs.existsSync(path.join(projectRoot, relPath));
}

function rel(file) {
  return path.relative(projectRoot, file) || ".";
}

function displayAsset(file, resolved) {
  return path.relative(projectRoot, resolved) || file;
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
      ok: !failed,
      checks,
    }, null, 2));
  } else if (!failed) {
    console.log("");
    console.log("Native Migration check passed.");
  }
  process.exit(failed ? 1 : 0);
}
