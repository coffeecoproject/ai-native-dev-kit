#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "./lib/args.mjs";
import { parseFrontmatter, validateFrontmatter } from "./lib/frontmatter.mjs";
import { changedFiles } from "./lib/git.mjs";
import { requiresRealWorldConsent } from "./lib/baseline-selection.mjs";
import { escapeRegExp, sectionBody } from "./lib/markdown.mjs";
import { resolveIndustrialBaseline } from "./resolve-industrial-baseline.mjs";
import { resolvePlatformBaseline } from "./resolve-platform-baseline.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = parseArgs(process.argv.slice(2));
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const mode = String(args.mode || "ready").toLowerCase();
const taskArg = args.task ? String(args.task) : null;
const changedOnly = Boolean(args["changed-only"]);
const changedBase = args.base ? String(args.base) : "HEAD";
const strictSchema = Boolean(args["strict-schema"]);
const allowedModes = new Set(["draft", "ready", "implementation"]);
const knownFlags = new Set(["mode", "task", "changed-only", "base", "strict-schema"]);

if (!allowedModes.has(mode)) {
  console.error(`FAIL invalid --mode: ${mode}`);
  console.error("Valid modes: draft, ready, implementation");
  process.exit(1);
}

for (const key of Object.keys(args)) {
  if (key !== "_" && !knownFlags.has(key)) {
    console.error(`FAIL unknown option: --${key}`);
    process.exit(1);
  }
}

if (taskArg && changedOnly) {
  console.error("FAIL use either --task or --changed-only, not both");
  process.exit(1);
}

if (mode === "implementation" && !taskArg) {
  console.error("FAIL implementation mode requires --task tasks/<file>.md");
  process.exit(1);
}

const placeholderPattern = /<[^>\n]+>|\b(TBD|TODO|FIXME|XXX)\b|待补|待定|稍后补|稍后填写|以后补|以后填写|以后完善|placeholder/i;
const artifactDirs = ["requests", "preflight", "specs", "evals", "tasks", "ai-logs"];
const checksByDir = new Map([
  ["requests", checkRequest],
  ["preflight", checkPreflight],
  ["specs", checkSpec],
  ["evals", checkEval],
  ["tasks", checkTask],
  ["ai-logs", checkLog],
]);
const frontmatterTypesByDir = new Map([
  ["requests", "request"],
  ["preflight", "preflight"],
  ["specs", "spec"],
  ["evals", "eval"],
  ["tasks", "task"],
]);

let failed = false;
let checked = 0;
const checkedFiles = new Set();
const frontmatterByFile = new Map();
const taskLevelRank = { L0: 0, L1: 1, L2: 2, L3: 3 };

function fail(message) {
  failed = true;
  console.error(`FAIL ${message}`);
}

function pass(message) {
  console.log(`PASS ${message}`);
}

function warn(message) {
  console.log(`WARN ${message}`);
}

function rel(fullPath) {
  return path.relative(projectRoot, fullPath).replaceAll(path.sep, "/") || ".";
}

function toProjectPath(value) {
  return path.relative(projectRoot, path.resolve(projectRoot, value)).replaceAll(path.sep, "/");
}

function listMarkdownFiles(dir) {
  const fullDir = path.join(projectRoot, dir);
  if (!fs.existsSync(fullDir)) return [];
  return fs
    .readdirSync(fullDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => path.join(fullDir, entry.name))
    .sort();
}

function hasMeaning(body) {
  if (!body) return false;
  const cleaned = body
    .replace(/```[\s\S]*?```/g, " code ")
    .replace(/[`*_#[\]()]/g, " ")
    .replace(/^-+\s*$/gm, "")
    .trim();
  return /[A-Za-z0-9\u4e00-\u9fff]/.test(cleaned);
}

function requireSections(file, content, sections) {
  for (const section of sections) {
    const body = sectionBody(content, section);
    if (body === null) {
      fail(`${file} missing section: ${section}`);
      continue;
    }
    if (mode !== "draft" && !hasMeaning(body)) {
      fail(`${file} section has no meaningful content: ${section}`);
    }
  }
}

function requireNoPlaceholders(file, content) {
  if (mode === "draft") return;
  const match = stripCode(content).match(placeholderPattern);
  if (match) fail(`${file} contains placeholder content: ${match[0]}`);
}

function stripCode(content) {
  return content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`\n]+`/g, " ");
}

function requireSingleChoice(file, content, section, choices) {
  if (mode === "draft") return;
  const body = sectionBody(content, section);
  if (body === null) {
    fail(`${file} missing section: ${section}`);
    return;
  }
  const found = choices.filter((choice) => new RegExp(`\\b${escapeRegExp(choice)}\\b`).test(body));
  if (body.includes("/") || found.length !== 1) {
    fail(`${file} section must choose exactly one value for ${section}: ${choices.join(", ")}`);
  }
}

function refsFromSection(content, section) {
  const body = sectionBody(content, section);
  if (!body) return [];
  return [...body.matchAll(/`([^`]+\.md)`/g)].map((match) => match[1]);
}

function firstRefFromSection(content, section) {
  return refsFromSection(content, section)[0] || null;
}

function labeledRefFromSection(content, section, label) {
  const body = sectionBody(content, section);
  if (!body) return null;
  const pattern = new RegExp(`${escapeRegExp(label)}:\\s*\\\`([^\\\`]+\\.md)\\\``, "i");
  const match = body.match(pattern);
  return match ? match[1] : null;
}

function requireExistingRefs(file, content, section) {
  for (const ref of refsFromSection(content, section)) {
    if (ref.includes("<")) {
      if (mode !== "draft") fail(`${file} references placeholder file in ${section}: ${ref}`);
      continue;
    }
    const full = path.resolve(projectRoot, ref);
    if (!fs.existsSync(full)) fail(`${file} references missing file: ${ref}`);
  }
}

function requireFilledColonLines(file, content, section) {
  if (mode === "draft") return;
  const body = sectionBody(content, section);
  if (!body) return;
  const filled = body
    .split("\n")
    .some((line) => {
      const index = line.indexOf(":");
      if (index === -1) return false;
      return line.slice(index + 1).trim().length > 0;
    });
  if (!filled) fail(`${file} section must define concrete values after ':' labels: ${section}`);
}

function requireSubList(file, content, section, label) {
  if (mode === "draft") return;
  const body = sectionBody(content, section);
  if (!body) return;
  const start = body.indexOf(label);
  if (start === -1) {
    fail(`${file} section ${section} missing ${label}`);
    return;
  }
  const rest = body.slice(start + label.length);
  const nextLabel = rest.search(/\n[A-Z][A-Za-z /-]{1,40}:\s*\n/);
  const block = nextLabel === -1 ? rest : rest.slice(0, nextLabel);
  if (!/-\s+\S+/.test(block)) {
    fail(`${file} section ${section} must include at least one concrete item under ${label}`);
  }
}

function labeledValue(content, section, label) {
  const body = sectionBody(content, section);
  if (!body) return "";
  const pattern = new RegExp(`^${escapeRegExp(label)}:[^\\S\\r\\n]*(.*)$`, "im");
  const match = body.match(pattern);
  return match ? match[1].trim() : "";
}

function checkedRiskLabels(content) {
  const body = sectionBody(content, "Risk Gate") || "";
  return [...body.matchAll(/-\s*\[[xX]\]\s*(.+?)\s*$/gm)]
    .map((match) => match[1].trim())
    .filter(Boolean);
}

function checkedRealWorldConsentRiskLabels(content) {
  return checkedRiskLabels(content).filter(requiresRealWorldConsent);
}

function normalizeRiskTerm(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[`*_]/g, "")
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function riskScanBlock(content, section, subLabel = null) {
  const body = sectionBody(content, section);
  if (!body) return "";
  if (!subLabel) return removeNegativeRiskLines(body);
  const start = body.indexOf(subLabel);
  if (start === -1) return "";
  const rest = body.slice(start + subLabel.length);
  const nextLabel = rest.search(/\n[A-Z][A-Za-z /-]{1,40}:\s*\n/);
  return removeNegativeRiskLines(nextLabel === -1 ? rest : rest.slice(0, nextLabel));
}

function removeNegativeRiskLines(value) {
  return String(value || "")
    .split("\n")
    .filter((line) => !/\b(?:no|not|do not|does not|without|avoid|must not|should not)\b/i.test(line.trim()))
    .join("\n");
}

function taskRiskScanText(content) {
  return [
    riskScanBlock(content, "Goal"),
    riskScanBlock(content, "Scope", "Allowed:"),
    riskScanBlock(content, "Acceptance Criteria"),
  ].join("\n");
}

function specRiskScanText(content) {
  return [
    riskScanBlock(content, "Problem"),
    riskScanBlock(content, "User Story"),
    riskScanBlock(content, "Scope", "Included:"),
    riskScanBlock(content, "Data Model Impact"),
    riskScanBlock(content, "API / Interface Contract"),
    riskScanBlock(content, "UI States"),
    riskScanBlock(content, "Permission Rules"),
    riskScanBlock(content, "Observability"),
    riskScanBlock(content, "Acceptance Criteria"),
    riskScanBlock(content, "Test Plan"),
    riskScanBlock(content, "Rollback Notes"),
  ].join("\n");
}

function riskTermAliases(term) {
  const normalized = normalizeRiskTerm(term);
  const phrase = normalized.replace(/-/g, " ");
  const aliases = new Set([normalized, phrase]);
  const explicit = {
    auth: ["authentication", "authorization", "session", "cookie"],
    permission: ["authorization", "access control", "forbidden", "tenant scope", "resource scope"],
    secrets: ["secret", "credential", "token", "api key"],
    "production-config": ["production config", "environment variable", "deployment config"],
    migration: ["schema migration", "data migration"],
    "destructive-operation": ["delete", "archive", "destructive"],
    "data-deletion": ["delete", "data deletion"],
    "value-transfer": ["payment", "billing", "credit", "balance"],
    "form-submission": ["form submission", "submit"],
    "api-failure": ["api failure", "timeout", "network failure", "server error"],
    "accessibility-critical": ["keyboard", "focus", "accessible", "accessibility"],
    "performance-sensitive": ["performance", "bundle", "asset", "heavy dependency", "responsiveness"],
    "dependency-addition": ["dependency", "package"],
  };
  for (const alias of explicit[normalized] || []) aliases.add(alias);
  return [...aliases].filter((item) => item.length >= 3);
}

function containsRiskTerm(text, term) {
  const normalizedText = ` ${stripCode(text).toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, " ")} `;
  return riskTermAliases(term).some((alias) => {
    const normalizedAlias = alias.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, " ").trim();
    if (!normalizedAlias) return false;
    return normalizedText.includes(` ${normalizedAlias} `);
  });
}

function addRiskTerm(map, term, labels = []) {
  const key = normalizeRiskTerm(term);
  if (!key || key.length < 3) return;
  const existing = map.get(key) || new Set();
  existing.add(term);
  for (const label of labels) existing.add(label);
  map.set(key, existing);
}

function baselineRiskTerms(platformBaseline, industrialBaseline) {
  const terms = new Map();
  for (const term of platformBaseline.effectiveHighRiskKeywords || []) addRiskTerm(terms, term);
  for (const term of platformBaseline.effectiveHumanApprovalRequiredFor || []) addRiskTerm(terms, term);
  for (const rule of platformBaseline.effectiveEscalationRules || []) {
    for (const term of rule.when || []) addRiskTerm(terms, term);
  }
  for (const [term, labels] of Object.entries(platformBaseline.effectiveRiskGateMappings || {})) {
    addRiskTerm(terms, term, labels);
  }

  for (const term of industrialBaseline.effectiveHumanApprovalRequiredFor || []) addRiskTerm(terms, term);
  for (const rule of industrialBaseline.effectiveTaskLevelEscalation || []) {
    for (const term of rule.when || []) addRiskTerm(terms, term);
  }
  for (const [term, labels] of Object.entries(industrialBaseline.effectiveRiskMappings || {})) {
    addRiskTerm(terms, term, labels);
  }
  return terms;
}

function riskIsChecked(term, labels, checkedTokens) {
  const candidates = [term, ...labels].map(normalizeRiskTerm).filter(Boolean);
  return candidates.some((candidate) => checkedTokens.some((checked) => (
    checked === candidate || checked.includes(candidate) || candidate.includes(checked)
  )));
}

function riskGateExclusions(content) {
  const body = sectionBody(content, "Risk Gate Exclusions");
  if (!body) return [];
  return body
    .split("\n")
    .filter((line) => line.trim().startsWith("|"))
    .map((line) => line.split("|").slice(1, -1).map((cell) => cell.trim()))
    .filter((cells) => cells.length >= 3)
    .filter((cells) => !/^mentioned term$/i.test(cells[0]) && !/^-+$/.test(cells[0]))
    .map(([term, reason, accepted]) => ({
      term: normalizeRiskTerm(term),
      reason,
      accepted: /^yes$/i.test(accepted),
    }))
    .filter((item) => item.term && item.reason && !placeholderPattern.test(item.reason) && item.accepted);
}

function riskIsExcluded(term, labels, exclusions) {
  const candidates = [term, ...labels].map(normalizeRiskTerm).filter(Boolean);
  return candidates.some((candidate) => exclusions.some((exclusion) => (
    exclusion.term === candidate || exclusion.term.includes(candidate) || candidate.includes(exclusion.term)
  )));
}

function requireNoMissedRiskGate(file, taskContent) {
  if (mode === "draft") return;
  const platformBaseline = resolvePlatformBaseline(projectRoot);
  const industrialBaseline = resolveIndustrialBaseline(projectRoot);
  if (platformBaseline.selectedProfiles.length === 0 && !industrialBaseline.baselineLevel) return;

  const specRef = normalizeRef(firstRefFromSection(taskContent, "Related Spec"));
  const specContent = specRef ? readProjectFile(specRef) : "";
  const scanText = [
    taskRiskScanText(taskContent),
    specContent ? specRiskScanText(specContent) : "",
  ].join("\n");

  const checkedTokens = checkedRiskLabels(taskContent).map(normalizeRiskTerm);
  const exclusions = riskGateExclusions(taskContent);
  const riskTerms = baselineRiskTerms(platformBaseline, industrialBaseline);
  const missed = [];
  for (const [term, labels] of riskTerms) {
    if (!containsRiskTerm(scanText, term)) continue;
    if (!riskIsChecked(term, labels, checkedTokens)) missed.push(term);
  }

  const unhandled = missed.filter((term) => !riskIsExcluded(term, riskTerms.get(term) || [], exclusions));
  if (unhandled.length === 0) return;
  const message = `${file} may mention high-risk areas without matching Risk Gate checks: ${unhandled.sort().join(", ")}`;
  if (mode === "implementation") fail(message);
  else warn(message);
}

function taskLevel(content) {
  const body = sectionBody(content, "Task Level") || "";
  const match = body.match(/\bL[0-3]\b/);
  return match ? match[0] : null;
}

function maxTaskLevel(levels) {
  return levels.reduce((max, level) => (
    taskLevelRank[level] > taskLevelRank[max] ? level : max
  ), "L0");
}

function baselineRequiredTaskLevel(taskContent, platformBaseline, industrialBaseline) {
  const checked = new Set(checkedRiskLabels(taskContent).map(normalizeRiskTerm));
  const checkedValues = [...checked];
  const levels = [];
  for (const rule of platformBaseline.effectiveEscalationRules || []) {
    const triggers = (rule.when || []).map(normalizeRiskTerm);
    if (triggers.some((trigger) => checkedValues.some((checkedToken) => checkedToken === trigger || checkedToken.includes(trigger) || trigger.includes(checkedToken)))) {
      levels.push(rule.minLevel || "L1");
    }
  }
  for (const rule of industrialBaseline.effectiveTaskLevelEscalation || []) {
    const triggers = (rule.when || []).map(normalizeRiskTerm);
    if (triggers.some((trigger) => checkedValues.some((checkedToken) => checkedToken === trigger || checkedToken.includes(trigger) || trigger.includes(checkedToken)))) {
      levels.push(rule.minTaskLevel || "L1");
    }
  }
  return levels.length > 0 ? maxTaskLevel(levels) : null;
}

function relevantIndustrialEvidenceTerms(industrialBaseline, taskContent) {
  const checked = checkedRiskLabels(taskContent).map(normalizeRiskTerm);
  if (checked.length === 0) return [];
  const terms = [];
  for (const [category, values] of Object.entries(industrialBaseline.effectiveRequiredEvidence || {})) {
    const categoryToken = normalizeRiskTerm(category);
    const categoryMatches = checked.some((token) => categoryToken.includes(token) || token.includes(categoryToken));
    const valueMatches = (values || []).some((value) => {
      const valueToken = normalizeRiskTerm(value);
      return checked.some((token) => valueToken.includes(token) || token.includes(valueToken));
    });
    if (categoryMatches || valueMatches) terms.push(...values);
  }
  return [...new Set(terms.filter(Boolean))].sort();
}

function requireIndustrialEvalEvidence(file, taskContent, industrialBaseline) {
  if (industrialBaseline.baselineLevel !== "BL2_INDUSTRIAL" || industrialBaseline.state !== "BASELINE_READY") return;
  const evalRef = normalizeRef(firstRefFromSection(taskContent, "Related Eval"));
  if (!evalRef) return;
  const evalContent = readProjectFile(evalRef);
  if (!evalContent) return;
  const evidenceBody = sectionBody(evalContent, "Required Evidence") || "";
  const missing = relevantIndustrialEvidenceTerms(industrialBaseline, taskContent)
    .filter((term) => !evidenceBody.toLowerCase().includes(String(term).toLowerCase()));
  if (missing.length > 0) {
    fail(`${file} related eval missing industrial evidence terms: ${missing.join(", ")}`);
  }
}

function requireBaselineImplementationGates(file, taskContent) {
  if (mode !== "implementation") return;

  const platformBaseline = resolvePlatformBaseline(projectRoot);
  const platformSelectionApplies = platformBaseline.selectedProfiles.length > 0
    || platformBaseline.inferredProfiles.length > 0;
  if (platformSelectionApplies && platformBaseline.strictState !== "BASELINE_READY") {
    fail(`${file} platform baseline is not satisfied: ${platformBaseline.strictState}`);
  }

  const industrialBaseline = resolveIndustrialBaseline(projectRoot);
  if (industrialBaseline.baselineLevel === "BL2_INDUSTRIAL" && industrialBaseline.strictState !== "BASELINE_READY") {
    fail(`${file} industrial baseline is not satisfied: ${industrialBaseline.strictState}`);
  }

  const requiredLevel = baselineRequiredTaskLevel(taskContent, platformBaseline, industrialBaseline);
  const actualLevel = taskLevel(taskContent);
  if (requiredLevel && actualLevel && taskLevelRank[actualLevel] < taskLevelRank[requiredLevel]) {
    fail(`${file} Task Level ${actualLevel} is lower than baseline-required ${requiredLevel}`);
  }

  requireIndustrialEvalEvidence(file, taskContent, industrialBaseline);
}

function expectedTaskSibling(dir, file) {
  return path.join(projectRoot, dir, path.basename(file));
}

function requireReviewLoopForTask(file, content) {
  if (mode === "draft") return;
  const level = taskLevel(content);
  if (!level || taskLevelRank[level] < taskLevelRank.L2) return;

  const reviewPacket = expectedTaskSibling("review-packets", file);
  const reviewLoopReport = expectedTaskSibling("review-loop-reports", file);
  const missing = [];
  if (!fs.existsSync(reviewPacket)) missing.push(`review-packets/${path.basename(file)}`);
  if (!fs.existsSync(reviewLoopReport)) missing.push(`review-loop-reports/${path.basename(file)}`);
  if (missing.length === 0) return;

  const message = `${file} is ${level}; missing Review Loop artifact(s): ${missing.join(", ")}`;
  if (mode === "implementation") fail(message);
  else warn(message);
}

function readProjectFile(ref) {
  const full = path.resolve(projectRoot, ref);
  if (!fs.existsSync(full)) return null;
  return fs.readFileSync(full, "utf8");
}

function normalizeRef(ref) {
  return ref ? toProjectPath(ref) : null;
}

function schemaPathForType(artifactType) {
  const fileName = `${artifactType}.schema.json`;
  const candidates = [
    path.join(projectRoot, ".intentos", "schemas", "artifacts", fileName),
    path.resolve(__dirname, "..", "schemas", "artifacts", fileName),
  ];
  return candidates.find((candidate) => fs.existsSync(candidate)) || null;
}

function schemaForType(artifactType) {
  const schemaPath = schemaPathForType(artifactType);
  if (!schemaPath) return null;
  try {
    return JSON.parse(fs.readFileSync(schemaPath, "utf8"));
  } catch (error) {
    fail(`artifact schema is not valid JSON: ${schemaPath}: ${error.message}`);
    return null;
  }
}

function checkFrontmatter(file, content) {
  const topDir = file.split("/")[0];
  const artifactType = frontmatterTypesByDir.get(topDir);
  if (!artifactType) return;
  const parsed = parseFrontmatter(content);
  frontmatterByFile.set(file, parsed);
  const schema = schemaForType(artifactType);
  if (!schema) {
    warn(`${file} has no artifact schema for ${artifactType}`);
    return;
  }
  if (!parsed.hasFrontmatter) {
    const message = `${file} missing artifact frontmatter; migration warning for 0.39.x`;
    if (strictSchema) fail(message);
    else warn(message);
    return;
  }
  for (const error of parsed.errors) fail(`${file} ${error}`);
  const errors = validateFrontmatter(parsed.data, schema);
  for (const error of errors) fail(`${file} ${error}`);
  if (parsed.data.artifact_type && parsed.data.artifact_type !== artifactType) {
    fail(`${file} frontmatter artifact_type ${parsed.data.artifact_type} does not match ${artifactType}`);
  }
}

function metadataForRef(ref) {
  const normalized = normalizeRef(ref);
  return normalized ? frontmatterByFile.get(normalized)?.data || {} : {};
}

function requireTaskGraph(file, content) {
  if (mode === "draft") return;
  const taskMeta = metadataForRef(file);
  const taskSpecRef = normalizeRef(taskMeta.spec || firstRefFromSection(content, "Related Spec"));
  const taskEvalRef = normalizeRef(taskMeta.eval || firstRefFromSection(content, "Related Eval"));
  if (!taskSpecRef || !taskEvalRef) {
    fail(`${file} must reference one related spec and one related eval`);
    return;
  }

  const evalContent = readProjectFile(taskEvalRef);
  const specContent = readProjectFile(taskSpecRef);
  if (!evalContent || !specContent) return;

  const evalMeta = metadataForRef(taskEvalRef);
  const specMeta = metadataForRef(taskSpecRef);
  const evalSpecRef = normalizeRef(evalMeta.spec || firstRefFromSection(evalContent, "Related Spec"));
  if (!evalSpecRef) {
    fail(`${taskEvalRef} must reference its related spec`);
  } else if (evalSpecRef !== taskSpecRef) {
    fail(`${file} references ${taskSpecRef}, but ${taskEvalRef} references ${evalSpecRef}`);
  }

  const requestRef = normalizeRef(specMeta.request || labeledRefFromSection(specContent, "Source", "Request"));
  const preflightRef = normalizeRef(specMeta.preflight || labeledRefFromSection(specContent, "Source", "Preflight"));
  if (!requestRef) {
    fail(`${taskSpecRef} Source must reference its request`);
    return;
  }
  if (!fs.existsSync(path.join(projectRoot, requestRef))) {
    fail(`${taskSpecRef} Source references missing request: ${requestRef}`);
  }
  if (preflightRef) {
    const preflightContent = readProjectFile(preflightRef);
    if (!preflightContent) {
      fail(`${taskSpecRef} Source references missing preflight: ${preflightRef}`);
      return;
    }
    const preflightRequestRef = normalizeRef(firstRefFromSection(preflightContent, "Source Request"));
    if (!preflightRequestRef) {
      fail(`${preflightRef} must reference its source request`);
    } else if (preflightRequestRef !== requestRef) {
      fail(`${taskSpecRef} references request ${requestRef}, but ${preflightRef} references ${preflightRequestRef}`);
    }
    const suggestedSpecs = refsFromSection(preflightContent, "Suggested Specs").map(normalizeRef);
    if (!suggestedSpecs.includes(taskSpecRef)) {
      fail(`${preflightRef} Suggested Specs must include ${taskSpecRef}`);
    }
  }
}

function requireHumanApproval(file, content) {
  if (mode === "draft") return;
  const consentRiskLabels = checkedRealWorldConsentRiskLabels(content);
  const approval = sectionBody(content, "Human Approval");
  if (approval === null) {
    fail(`${file} missing section: Human Approval`);
    return;
  }

  const required = labeledValue(content, "Human Approval", "Required");
  const status = labeledValue(content, "Human Approval", "Status");
  const approvalScope = labeledValue(content, "Human Approval", "Approval scope");
  const approvedBy = labeledValue(content, "Human Approval", "Approved by");
  const approvedAt = labeledValue(content, "Human Approval", "Approved at");

  if (consentRiskLabels.length > 0) {
    const reason = `real-world consent risk item(s) ${consentRiskLabels.join(", ")}`;
    if (!/^Yes$/i.test(required)) {
      fail(`${file} ${reason} require Human Approval Required: Yes`);
    }
    if (!/^(Pending|Approved)$/i.test(status)) {
      fail(`${file} ${reason} require Human Approval Status: Pending or Approved`);
    }
    if (!approvalScope || /^Not Required$/i.test(approvalScope)) {
      fail(`${file} ${reason} require Human Approval scope`);
    }
    if (mode === "implementation" && !/^Approved$/i.test(status)) {
      fail(`${file} implementation mode requires Human Approval Status: Approved`);
    }
  } else {
    if (!/^No$/i.test(required)) {
      fail(`${file} reversible project-local technical risks do not require Human Approval; use Required: No`);
    }
    if (!/^Not Required$/i.test(status)) {
      fail(`${file} no real-world consent effect should use Human Approval Status: Not Required`);
    }
  }

  if (/^Approved$/i.test(status)) {
    if (!approvedBy) fail(`${file} approved Human Approval must include Approved by`);
    if (!approvedAt) fail(`${file} approved Human Approval must include Approved at`);
  }
}

function requireRiskGateExclusionGovernance(file, content) {
  if (mode === "draft") return;
  const exclusions = riskGateExclusions(content);
  if (exclusions.length <= 3) return;

  const message = `${file} has ${exclusions.length} accepted Risk Gate Exclusions; Codex must reduce or technically reclassify them before implementation. Human Approval cannot satisfy this technical evidence gap.`;
  if (mode !== "implementation") {
    warn(message);
    return;
  }

  fail(message);
}

function checkRequest(file, content) {
  requireSections(file, content, [
    "Raw Request",
    "User / Customer",
    "Problem",
    "Desired Outcome",
    "Constraints",
    "Priority",
    "Suggested Task Level",
  ]);
  requireSingleChoice(file, content, "Priority", ["P0", "P1", "P2"]);
  requireSingleChoice(file, content, "Suggested Task Level", ["L0", "L1", "L2", "L3"]);
}

function checkPreflight(file, content) {
  requireSections(file, content, [
    "Source Request",
    "Clarity",
    "Problem Summary",
    "Missing Information",
    "Assumptions",
    "Direction Risks",
    "Over-design Risks",
    "MVP Recommendation",
    "Non-goals",
    "Domain Model Draft",
    "Permission / Security Risks",
    "First Vertical Slice",
    "Suggested Specs",
    "Suggested Task Level",
    "Decision",
    "Rationale",
  ]);
  requireSingleChoice(file, content, "Clarity", ["READY", "PARTIAL", "UNCLEAR"]);
  requireSingleChoice(file, content, "Suggested Task Level", ["L0", "L1", "L2", "L3"]);
  requireSingleChoice(file, content, "Decision", ["READY_FOR_SPEC", "NEEDS_CLARIFICATION", "TOO_LARGE_SPLIT_REQUIRED", "NOT_RECOMMENDED"]);
  requireExistingRefs(file, content, "Source Request");
  requireExistingRefs(file, content, "Suggested Specs");
}

function checkSpec(file, content) {
  requireSections(file, content, [
    "Status",
    "Source",
    "Problem",
    "User Story",
    "Scope",
    "Non-goals",
    "Data Model Impact",
    "API / Interface Contract",
    "UI States",
    "Permission Rules",
    "Observability",
    "Acceptance Criteria",
    "Test Plan",
    "Rollback Notes",
  ]);
  requireSingleChoice(file, content, "Status", ["Draft", "Ready", "Implementing", "Done", "Superseded"]);
  requireExistingRefs(file, content, "Source");
}

function checkEval(file, content) {
  requireSections(file, content, [
    "Related Spec",
    "Must Pass",
    "Spec Alignment",
    "Permission / Data Checks",
    "Manual Review Checklist",
    "Reject Conditions",
    "Required Evidence",
  ]);
  requireExistingRefs(file, content, "Related Spec");
  requireFilledColonLines(file, content, "Required Evidence");
}

function checkTask(file, content) {
  requireSections(file, content, [
    "Task Level",
    "Related Spec",
    "Related Eval",
    "Goal",
    "Scope",
    "Acceptance Criteria",
    "Commands",
    "AI Budget",
    "Risk Gate",
    "Human Approval",
    "Stop Conditions",
    "Final Report Required",
  ]);
  requireSingleChoice(file, content, "Task Level", ["L0", "L1", "L2", "L3"]);
  requireExistingRefs(file, content, "Related Spec");
  requireExistingRefs(file, content, "Related Eval");
  requireSubList(file, content, "Scope", "Allowed:");
  requireSubList(file, content, "Scope", "Not allowed:");

  const budget = sectionBody(content, "AI Budget") || "";
  if (mode !== "draft") {
    if (!/Max agent runs:\s*\d+/i.test(budget)) fail(`${file} AI Budget must include numeric Max agent runs`);
    if (!/Max repair runs:\s*\d+/i.test(budget)) fail(`${file} AI Budget must include numeric Max repair runs`);
    if (!/Stop if:\s*\S+/i.test(budget)) fail(`${file} AI Budget must include concrete Stop if condition`);
  }

  requireHumanApproval(file, content);
  requireRiskGateExclusionGovernance(file, content);
  requireTaskGraph(file, content);
  requireNoMissedRiskGate(file, content);
  requireBaselineImplementationGates(file, content);
  requireReviewLoopForTask(file, content);
}

function checkLog(file, content) {
  requireSections(file, content, [
    "Task",
    "Agent / Tool",
    "Runs",
    "Result",
    "Human Time",
    "AI Helpfulness",
    "What Worked",
    "Problems",
    "Cost / Usage",
    "Issues Caught By Review",
    "Lessons",
    "IntentOS Updates Needed",
    "Workflow Improvement Trigger",
    "Related Follow-up",
  ]);
  requireSingleChoice(file, content, "Result", ["Merged", "Rejected", "Blocked", "Abandoned"]);
  requireSingleChoice(file, content, "AI Helpfulness", ["High", "Medium", "Low"]);
  requireExistingRefs(file, content, "Task");
  const cost = sectionBody(content, "Cost / Usage") || "";
  if (mode !== "draft") {
    if (!/AI runs:\s*\d+/i.test(cost)) fail(`${file} Cost / Usage must include numeric AI runs`);
    if (!/Repair runs:\s*\d+/i.test(cost)) fail(`${file} Cost / Usage must include numeric Repair runs`);
  }
}

function checkerForFile(filePath) {
  const relPath = rel(filePath);
  const topDir = relPath.split("/")[0];
  return checksByDir.get(topDir) || null;
}

function addFile(files, relPath) {
  if (!relPath || relPath.includes("<")) return;
  const full = path.resolve(projectRoot, relPath);
  if (fs.existsSync(full) && fs.statSync(full).isFile()) {
    files.set(rel(full), full);
  }
}

function filesForTask(taskRef) {
  const files = new Map();
  const taskPath = toProjectPath(taskRef);
  addFile(files, taskPath);
  const taskContent = readProjectFile(taskPath);
  if (!taskContent) {
    fail(`task not found: ${taskRef}`);
    return files;
  }
  const specRef = normalizeRef(firstRefFromSection(taskContent, "Related Spec"));
  const evalRef = normalizeRef(firstRefFromSection(taskContent, "Related Eval"));
  addFile(files, evalRef);
  addFile(files, specRef);

  const specContent = specRef ? readProjectFile(specRef) : null;
  if (specContent) {
    addFile(files, labeledRefFromSection(specContent, "Source", "Request"));
    addFile(files, labeledRefFromSection(specContent, "Source", "Preflight"));
  }
  return [...files.values()];
}

function changedArtifactFiles() {
  const result = changedFiles(projectRoot, { base: changedBase, pathspecs: artifactDirs });
  if (!result.ok) {
    fail(`changed-only diff failed from ${changedBase}: ${result.stderr || result.stdout}`);
    return [];
  }
  return result.files
    .filter((line) => line.endsWith(".md"))
    .map((line) => path.join(projectRoot, line))
    .filter((file) => fs.existsSync(file))
    .sort();
}

function filesToCheck() {
  if (taskArg) return filesForTask(taskArg);
  if (changedOnly) return changedArtifactFiles();
  const files = [];
  for (const dir of artifactDirs) {
    const dirFiles = listMarkdownFiles(dir);
    if (dirFiles.length === 0) warn(`${dir} has no markdown artifacts`);
    files.push(...dirFiles);
  }
  return files;
}

const selectedFiles = filesToCheck();
const contentByFile = new Map();

for (const filePath of selectedFiles) {
  const file = rel(filePath);
  if (checkedFiles.has(file)) continue;
  const checker = checkerForFile(filePath);
  if (!checker) continue;
  const content = fs.readFileSync(filePath, "utf8");
  contentByFile.set(file, content);
  checkFrontmatter(file, content);
}

for (const filePath of selectedFiles) {
  const file = rel(filePath);
  if (checkedFiles.has(file)) continue;
  checkedFiles.add(file);
  const checker = checkerForFile(filePath);
  if (!checker) continue;
  checked += 1;
  const content = contentByFile.get(file) || fs.readFileSync(filePath, "utf8");
  requireNoPlaceholders(file, content);
  checker(file, content);
}

if (failed) {
  console.error("");
  console.error(`Workflow artifact quality check failed for ${checked} file(s) in ${mode} mode.`);
  process.exit(1);
}

console.log("");
pass(`workflow artifact quality check passed for ${checked} file(s) in ${mode} mode`);
