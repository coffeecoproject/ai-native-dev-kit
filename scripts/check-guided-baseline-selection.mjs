#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { sectionBody } from "./lib/markdown.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["report", "json", "strict"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const reportArg = args.report ? String(args.report) : null;
const outputJson = Boolean(args.json);
const strict = Boolean(args.strict);
const results = [];
let failed = false;
let pending = false;

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

function record(status, message) {
  results.push({ status, message });
  if (!outputJson) {
    const write = status === "FAIL" ? console.error : console.log;
    write(`${status} ${message}`);
  }
}

function pass(message) {
  record("PASS", message);
}

function fail(message) {
  failed = true;
  record("FAIL", message);
}

function warn(message) {
  pending = true;
  if (strict) fail(message);
  else record("PENDING", message);
}

function readJsonIfExists(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function registryRoot(root, registryName) {
  const candidates = [
    path.join(root, ".ai-native", registryName),
    path.join(root, registryName),
    path.resolve(process.cwd(), registryName),
  ];
  return candidates.find((candidate) => fs.existsSync(path.join(candidate, "index.json"))) || candidates[0];
}

function loadPackIds(root, registryName) {
  const index = readJsonIfExists(path.join(registryRoot(root, registryName), "index.json"));
  return new Set((Array.isArray(index?.packs) ? index.packs : []).map((entry) => entry.id).filter(Boolean));
}

function reportFiles() {
  if (reportArg) return [path.resolve(projectRoot, reportArg)];
  const dir = path.join(projectRoot, "baseline-decision-cards");
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((file) => file.endsWith(".md"))
    .sort()
    .map((file) => path.join(dir, file));
}

function extractPackIds(body, suffix) {
  const pattern = suffix === "standard"
    ? /\b[a-z0-9][a-z0-9-]*-standard\b/g
    : suffix === "industrial"
      ? /\b[a-z0-9][a-z0-9-]*-industrial\b/g
      : /\b[a-z0-9][a-z0-9-]*-(?:standard|industrial)\b/g;
  return unique(body.match(pattern) || []);
}

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

function bodyHasAny(content, patterns) {
  return patterns.some((pattern) => pattern.test(content));
}

function validateRequiredSections(content, rel) {
  for (const section of [
    "Human Summary",
    "Project State",
    "Platform And Scope",
    "Recommended Baseline Level",
    "Recommended Standard Packs",
    "Candidate Industrial Packs",
    "Not Selected",
    "Human Decisions Needed",
    "Safe Next Actions",
    "Boundary",
    "Evidence",
  ]) {
    if (sectionBody(content, section).trim()) pass(`${rel} section ${section}`);
    else fail(`${rel} missing or empty section ${section}`);
  }
}

function validateQuestionCount(content, rel) {
  const body = sectionBody(content, "Human Decisions Needed");
  const questionLines = body
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^(?:\d+\.|-)\s+/.test(line))
    .filter((line) => line.includes("?") || /是否|吗|哪|确认|选择|允许/.test(line));
  if (questionLines.length === 0) {
    fail(`${rel} human decisions needed has no concrete questions`);
  } else if (questionLines.length > 5 && !/justification|例外|exception/i.test(body)) {
    fail(`${rel} asks too many human decision questions`);
  } else {
    pass(`${rel} human questions are bounded`);
  }
}

function validateBoundary(content, rel) {
  const boundary = sectionBody(content, "Boundary");
  for (const marker of [
    "authorizes target-project writes: No",
    "approves implementation: No",
    "approves release or production: No",
    "approves security/privacy/compliance/payment/migration decisions: No",
    "proves real project evidence exists: No",
  ]) {
    if (boundary.includes(marker)) pass(`${rel} boundary includes ${marker}`);
    else fail(`${rel} boundary missing ${marker}`);
  }
}

function validateOverclaims(content, rel) {
  const forbidden = [
    { label: "BL2 is default", pattern: /\bBL2\b.{0,60}\b(default|always|required for every project|quality badge)\b/i },
    { label: "selects all standard packs by default", pattern: /\b(select|enable|install|use)\s+all\s+standard\s+packs\b/i },
    { label: "selects all industrial packs by default", pattern: /\b(select|enable|install|use)\s+all\s+industrial\s+packs\b/i },
    { label: "write approval", pattern: /\b(authorizes target-project writes|can codex write now|can ai write now|target-project write approved)\s*:\s*yes\b/i },
    { label: "implementation approval", pattern: /\b(approves implementation|implementation approved)\s*:\s*yes\b/i },
    { label: "release approval", pattern: /\b(approves release(?: or production)?|release approved|production approved)\s*:\s*yes\b/i },
    { label: "security/privacy/compliance/payment/migration approval", pattern: /\b(approves security\/privacy\/compliance\/payment\/migration decisions|security approved|privacy approved|compliance approved|payment approved|migration approved)\s*:\s*yes\b/i },
    { label: "production-ready claim", pattern: /\b(production-ready|ready for production|safe for production|真实生产验证|生产可用)\b/i },
  ];
  for (const item of forbidden) {
    if (item.pattern.test(content)) fail(`${rel} overclaims: ${item.label}`);
    else pass(`${rel} avoids ${item.label}`);
  }
}

function validatePackSelection(content, rel) {
  const standardIds = loadPackIds(projectRoot, "standard-baseline-packs");
  const industrialIds = loadPackIds(projectRoot, "industrial-packs");
  const standardBody = sectionBody(content, "Recommended Standard Packs");
  const candidateBody = sectionBody(content, "Candidate Industrial Packs");
  const standardPackIds = extractPackIds(standardBody, "standard");
  const industrialPackIds = extractPackIds(candidateBody, "industrial");
  const industrialInStandard = extractPackIds(standardBody, "industrial");
  const standardInIndustrial = extractPackIds(candidateBody, "standard");

  if (industrialInStandard.length === 0) pass(`${rel} keeps industrial packs out of standard pack section`);
  else fail(`${rel} lists industrial pack(s) as standard packs: ${industrialInStandard.join(", ")}`);

  if (standardInIndustrial.length === 0) pass(`${rel} keeps standard packs out of industrial candidate section`);
  else fail(`${rel} lists standard pack(s) as industrial candidates: ${standardInIndustrial.join(", ")}`);

  for (const id of standardPackIds) {
    if (standardIds.has(id)) pass(`${rel} standard pack exists ${id}`);
    else fail(`${rel} unknown standard pack ${id}`);
  }
  for (const id of industrialPackIds) {
    if (industrialIds.has(id)) pass(`${rel} industrial pack exists ${id}`);
    else fail(`${rel} unknown industrial pack ${id}`);
  }
  if (standardIds.size > 0 && standardPackIds.length === standardIds.size) {
    fail(`${rel} selects all known standard packs`);
  } else {
    pass(`${rel} does not select all known standard packs`);
  }
  if (industrialIds.size > 0 && industrialPackIds.length === industrialIds.size) {
    fail(`${rel} lists all known industrial packs as candidates; recommendation must be smallest set`);
  } else {
    pass(`${rel} does not list all known industrial packs`);
  }
}

function validateBackendAndBl2(content, rel) {
  const platform = sectionBody(content, "Platform And Scope");
  const standardPacks = extractPackIds(sectionBody(content, "Recommended Standard Packs"), "standard");
  const baseline = sectionBody(content, "Recommended Baseline Level");
  const industrial = sectionBody(content, "Candidate Industrial Packs");
  const evidence = sectionBody(content, "Evidence");
  const frontendOnly = /\b(web-app|web|wechat-miniprogram|mini program|小程序)\b/i.test(platform)
    && !/\bbackend-api|backend\/api scope:\s*confirmed|backend\/api scope:\s*confirmed by project signals\b/i.test(platform);
  if (frontendOnly && standardPacks.includes("backend-api-standard") && !/Backend scope evidence:\s*(?!PENDING|UNKNOWN|NO|NONE)/i.test(content)) {
    fail(`${rel} forces backend-api-standard without backend scope evidence`);
  } else {
    pass(`${rel} does not force backend without evidence`);
  }

  const hasIndustrialIds = extractPackIds(industrial, "industrial").length > 0;
  const bl2Recommended = /\bBL2_INDUSTRIAL\b/.test(baseline);
  if (hasIndustrialIds && !/Candidate only, not selected/i.test(industrial)) {
    fail(`${rel} industrial packs must be candidate-only unless separately confirmed`);
  } else {
    pass(`${rel} keeps industrial packs candidate-only`);
  }
  if (bl2Recommended && hasIndustrialIds && !/\b(PENDING|gap|evidence)\b/i.test(evidence)) {
    fail(`${rel} BL2 candidate has no evidence gap`);
  } else {
    pass(`${rel} records BL2 evidence gap when needed`);
  }
}

function validateProjectStateBoundaries(content, rel) {
  const state = sectionBody(content, "Project State");
  const safeNext = sectionBody(content, "Safe Next Actions");
  if (/\b(existing governed|governed)\b/i.test(state) && bodyHasAny(content, [
    /\bwill overwrite\b/i,
    /\bshould overwrite\b/i,
    /\boverwrite AGENTS\b/i,
    /\boverwrite CI\b/i,
    /\breplace existing governance\b/i,
    /\bfull \.ai-native copy\b/i,
    /全量覆盖/,
    /直接覆盖/,
  ])) {
    fail(`${rel} existing governed project recommends overwrite`);
  } else {
    pass(`${rel} governed overwrite boundary ok`);
  }

  if (/\bproduction-sensitive|production sensitive|已上线|生产敏感\b/i.test(state) && bodyHasAny(safeNext, [
    /\bdirect init\b/i,
    /\bdirect update\b/i,
    /\brun init\/update\b/i,
    /\badd blocking gate\b/i,
    /直接初始化/,
    /直接接入/,
  ])) {
    fail(`${rel} production-sensitive project recommends direct init/update`);
  } else {
    pass(`${rel} production-sensitive direct-init boundary ok`);
  }

  if (/\bdirty worktree\b/i.test(state) && !/\bstay read-only|stop before writes|wait|plan only|只读|停止/i.test(safeNext)) {
    fail(`${rel} dirty worktree continues without decision`);
  } else {
    pass(`${rel} dirty worktree boundary ok`);
  }
}

function validateSafeNext(content, rel) {
  const safeNext = sectionBody(content, "Safe Next Actions").trim();
  if (!safeNext || /\b(TBD|TODO|unknown|later)\b/i.test(safeNext)) {
    fail(`${rel} has vague output with no concrete next action`);
  } else {
    pass(`${rel} has concrete next action`);
  }
}

function validateReport(file) {
  if (!fs.existsSync(file)) {
    fail(`baseline decision card not found: ${file}`);
    return;
  }
  const rel = path.relative(projectRoot, file).replaceAll(path.sep, "/");
  const content = fs.readFileSync(file, "utf8");
  validateRequiredSections(content, rel);
  validateQuestionCount(content, rel);
  validateBoundary(content, rel);
  validateOverclaims(content, rel);
  validatePackSelection(content, rel);
  validateBackendAndBl2(content, rel);
  validateProjectStateBoundaries(content, rel);
  validateSafeNext(content, rel);
}

const reports = reportFiles();

if (!outputJson) {
  console.log("# Guided Baseline Selection Check");
  console.log("");
}

if (reports.length === 0) {
  pass("guided baseline selection check skipped: no baseline decision cards");
} else {
  for (const file of reports) validateReport(file);
}

if (outputJson) {
  console.log(JSON.stringify({
    status: failed ? "FAIL" : pending ? "PENDING" : "PASS",
    projectRoot,
    report: reportArg,
    strict,
    results,
  }, null, 2));
}

if (failed) process.exit(1);

if (!outputJson) {
  console.log("");
  if (pending) console.log("Guided baseline selection has pending decisions.");
  else console.log("Guided baseline selection check passed.");
}
