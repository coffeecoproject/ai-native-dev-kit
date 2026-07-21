#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "./lib/args.mjs";
import { deriveConsumerOutcome } from "./lib/check-result.mjs";
import { sectionBody } from "./lib/markdown.mjs";
import { buildStandardBaselineRecommendation } from "./resolve-standard-baseline.mjs";

const args = parseArgs(process.argv.slice(2));
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const reportArg = args.report ? String(args.report) : null;
const outputJson = Boolean(args.json);
const strict = Boolean(args.strict);
const compareResolver = Boolean(args["compare-resolver"]);
const knownFlags = new Set(["report", "json", "strict", "compare-resolver"]);
const results = [];
let failed = false;
let pending = false;
const kitRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

for (const key of Object.keys(args)) {
  if (key !== "_" && !knownFlags.has(key)) {
    console.error(`FAIL unknown option: --${key}`);
    process.exit(1);
  }
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
    path.join(root, ".intentos", registryName),
    path.join(root, registryName),
    ...(isInsideSourceCheckout(root) ? [path.join(kitRoot, registryName)] : []),
  ];
  return candidates.find((candidate) => fs.existsSync(path.join(candidate, "index.json"))) || candidates[0];
}

function loadPackIds(root, registryName) {
  const index = readJsonIfExists(path.join(registryRoot(root, registryName), "index.json"));
  return new Set((Array.isArray(index?.packs) ? index.packs : []).map((entry) => entry.id).filter(Boolean));
}

function profileRoots(root) {
  return [
    path.join(root, ".intentos", "profiles"),
    path.join(root, "profiles"),
    ...(isInsideSourceCheckout(root) ? [path.join(kitRoot, "profiles")] : []),
  ];
}

function isInsideSourceCheckout(root) {
  const resolved = path.resolve(root);
  return resolved === kitRoot || resolved.startsWith(`${kitRoot}${path.sep}`);
}

function loadProfileIds(root) {
  const ids = new Set();
  for (const profilesRoot of profileRoots(root)) {
    if (!fs.existsSync(profilesRoot)) continue;
    for (const entry of fs.readdirSync(profilesRoot, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const profileDir = path.join(profilesRoot, entry.name);
      if (fs.existsSync(path.join(profileDir, "profile.md")) || fs.existsSync(path.join(profileDir, "baseline.json"))) {
        ids.add(entry.name);
      }
    }
  }
  return ids;
}

function reportFiles() {
  if (reportArg) return [path.resolve(projectRoot, reportArg)];
  const dir = path.join(projectRoot, "standard-baseline-selections");
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((file) => file.endsWith(".md"))
    .sort()
    .map((file) => path.join(dir, file));
}

function bodyHasAny(content, patterns) {
  return patterns.some((pattern) => pattern.test(content));
}

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

function singleDecisionStatus(body) {
  const matches = body.match(/\b(PENDING|APPROVED|REJECTED)\b/g) || [];
  return unique(matches).length === 1 ? matches[0] : null;
}

function extractPackIds(body, suffix) {
  const pattern = suffix === "standard"
    ? /\b[a-z0-9][a-z0-9-]*-standard\b/g
    : suffix === "industrial"
      ? /\b[a-z0-9][a-z0-9-]*-industrial\b/g
      : /\b[a-z0-9][a-z0-9-]*-(?:standard|industrial)\b/g;
  return unique(body.match(pattern) || []);
}

function extractSelectedProfiles(body) {
  const profiles = [];
  for (const line of body.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.includes("---")) continue;
    if (trimmed.startsWith("|")) {
      const cells = trimmed.split("|").map((cell) => cell.trim()).filter(Boolean);
      for (const cell of cells) {
        const match = cell.match(/`?([a-z0-9][a-z0-9-]*[a-z0-9])`?/);
        if (match && !/^(profile|profiles|selected|none|pending|not-applicable|not_applicable)$/i.test(match[1])) {
          profiles.push(match[1]);
        }
      }
      continue;
    }
    const bullet = trimmed.match(/^[-*]\s+`?([a-z0-9][a-z0-9-]*[a-z0-9])`?/);
    if (bullet && !/^(none|pending|not-applicable|not_applicable)$/i.test(bullet[1])) {
      profiles.push(bullet[1]);
    }
  }
  return unique(profiles);
}

function extractEvidenceRows(body) {
  return body
    .split("\n")
    .filter((line) => line.trim().startsWith("|") && !line.includes("---"))
    .map((line) => line.split("|").map((cell) => cell.trim()).filter(Boolean))
    .filter((cells) => cells.length >= 3)
    .filter((cells) => !(cells[0] === "Requirement" && cells[1] === "Evidence ref" && cells[2] === "Status"));
}

function validateSelectedProfiles(content, rel) {
  const body = sectionBody(content, "Selected Profiles");
  const selectedProfiles = extractSelectedProfiles(body);
  if (selectedProfiles.length === 0) {
    if (/\b(none|pending|not applicable|not_applicable|not-applicable)\b/i.test(body)) {
      pass(`${rel} selected profiles explicitly pending or not applicable`);
    } else {
      warn(`${rel} should list selected profile ids or state pending/not applicable`);
    }
    return;
  }

  const knownProfiles = loadProfileIds(projectRoot);
  for (const profileId of selectedProfiles) {
    if (knownProfiles.has(profileId)) pass(`${rel} selected profile exists ${profileId}`);
    else fail(`${rel} unknown selected profile ${profileId}`);
  }
}

function validateRequiredSections(content, rel) {
  const requiredSections = [
    "Human Summary",
    "Project Classification",
    "Selected Profiles",
    "BL Level",
    "Recommended Standard Packs",
    "Optional Industrial Overlays",
    "Not Selected",
    "Evidence Required",
    "Human Decision",
    "Boundary",
  ];
  for (const section of requiredSections) {
    const body = sectionBody(content, section);
    if (body.trim()) pass(`${rel} section ${section}`);
    else fail(`${rel} missing or empty section ${section}`);
  }
}

function validateBoundary(content, rel) {
  const boundary = sectionBody(content, "Boundary");
  for (const marker of [
    "authorizes target-project writes: No",
    "approves implementation: No",
    "approves release or production: No",
    "approves compliance/security/privacy: No",
    "proves real project evidence exists: No",
  ]) {
    if (boundary.includes(marker)) pass(`${rel} boundary includes ${marker}`);
    else fail(`${rel} boundary missing ${marker}`);
  }
  if (content.includes("does not approve a specific implementation task")) {
    pass(`${rel} separates baseline selection from implementation task approval`);
  } else {
    warn(`${rel} should state that standard baseline selection does not approve a specific implementation task`);
  }
}

function validateOverclaims(content, rel) {
  const forbidden = [
    { label: "selects all standard packs by default", pattern: /\b(select|enable|install|use)\s+all\s+standard\s+packs\b/i },
    { label: "activeByDefault true", pattern: /\bactiveByDefault\b\s*[:=]\s*true\b/i },
    { label: "defaultForBL", pattern: /\bdefaultForBL\b/i },
    { label: "BL2 is default", pattern: /\bBL2\b.{0,40}\b(default|always|required for every project)\b/i },
    { label: "draft pack stable claim", pattern: /\bdraft\b.{0,80}\b(stable|production[- ]ready|validated for production)\b/i },
    { label: "pack files prove real evidence", pattern: /\b(pack files|standard pack files|industrial pack files)\b.{0,80}\b(prove|confirm|validate)\b.{0,80}\b(real project|production|evidence)\b/i },
    { label: "write authorization", pattern: /\b(authorizes target-project writes|can ai write now|target-project write approved)\s*:\s*yes\b/i },
    { label: "implementation approval", pattern: /\b(approves implementation|implementation approved)\s*:\s*yes\b/i },
    { label: "release approval", pattern: /\b(approves release(?: or production)?|production approved|release approved)\s*:\s*yes\b/i },
    { label: "compliance/security/privacy approval", pattern: /\b(approves compliance\/security\/privacy|security approved|privacy approved|compliance approved)\s*:\s*yes\b/i },
  ];
  for (const item of forbidden) {
    if (item.pattern.test(content)) fail(`${rel} overclaims: ${item.label}`);
    else pass(`${rel} avoids ${item.label}`);
  }
}

function validatePackIds(content, rel) {
  const standardIds = loadPackIds(projectRoot, "standard-baseline-packs");
  const industrialIds = loadPackIds(projectRoot, "industrial-packs");
  const standardBody = sectionBody(content, "Recommended Standard Packs");
  const overlayBody = sectionBody(content, "Optional Industrial Overlays");
  const standardPackIds = extractPackIds(standardBody, "standard");
  const industrialInStandard = extractPackIds(standardBody, "industrial");
  const overlayIndustrialIds = extractPackIds(overlayBody, "industrial");
  const standardInOverlay = extractPackIds(overlayBody, "standard");

  if (industrialInStandard.length === 0) pass(`${rel} does not list industrial overlays as standard packs`);
  else fail(`${rel} lists industrial overlay(s) as standard packs: ${industrialInStandard.join(", ")}`);
  if (standardInOverlay.length === 0) pass(`${rel} does not list standard packs as industrial overlays`);
  else fail(`${rel} lists standard pack(s) as industrial overlays: ${standardInOverlay.join(", ")}`);

  for (const packId of standardPackIds) {
    if (standardIds.has(packId)) pass(`${rel} standard pack exists ${packId}`);
    else fail(`${rel} unknown standard pack ${packId}`);
  }
  for (const packId of overlayIndustrialIds) {
    if (industrialIds.has(packId)) pass(`${rel} industrial overlay exists ${packId}`);
    else fail(`${rel} unknown industrial overlay ${packId}`);
  }
  if (standardIds.size > 0 && standardPackIds.length === standardIds.size) {
    fail(`${rel} selects all known standard packs; standard packs must be selected by platform and scope`);
  } else {
    pass(`${rel} does not select all known standard packs`);
  }
}

function hasConfirmedScopeEvidence(content, label) {
  const pattern = new RegExp(`${label}\\\\s*:\\\\s*(.+)`, "i");
  const match = content.match(pattern);
  if (!match) return false;
  const value = match[1].trim();
  return Boolean(value)
    && !/^(PENDING|NONE|N\/A|NOT_APPLICABLE|NOT APPLICABLE|NO|UNKNOWN)$/i.test(value)
    && !value.includes("<");
}

function validateConditionalScope(content, rel) {
  const selectedProfiles = extractSelectedProfiles(sectionBody(content, "Selected Profiles"));
  const selectedProfileSet = new Set(selectedProfiles);
  const recommendedStandardPacks = extractPackIds(sectionBody(content, "Recommended Standard Packs"), "standard");
  const hasBackend = recommendedStandardPacks.includes("backend-api-standard");
  const frontendWithoutBackendProfile = (selectedProfileSet.has("web-app") || selectedProfileSet.has("wechat-miniprogram"))
    && !selectedProfileSet.has("backend-api");
  if (hasBackend && frontendWithoutBackendProfile && !hasConfirmedScopeEvidence(content, "Backend scope evidence")) {
    fail(`${rel} forces backend-api-standard without backend scope evidence`);
  } else {
    pass(`${rel} does not force backend without evidence`);
  }

  const hasRelease = recommendedStandardPacks.includes("release-rollback-standard");
  if (hasRelease && !hasConfirmedScopeEvidence(content, "Release scope evidence")) {
    fail(`${rel} recommends release-rollback-standard without release scope evidence`);
  } else {
    pass(`${rel} keeps release and rollback conditional`);
  }
}

function validateExistingProjectBoundary(content, rel) {
  const classification = sectionBody(content, "Project Classification");
  const isGovernedOrSensitive = /\b(governed|production-sensitive|dirty)\b/i.test(classification);
  if (!isGovernedOrSensitive) {
    pass(`${rel} existing-project overwrite boundary not applicable`);
    return;
  }
  const forbiddenOverwrite = [
    /\bwill overwrite\b/i,
    /\bcan overwrite\b/i,
    /\bshould overwrite\b/i,
    /\boverwrite AGENTS\b/i,
    /\boverwrite CI\b/i,
    /\boverwrite PR template\b/i,
    /\breplace existing governance\b/i,
    /\bfull \.intentos copy\b/i,
    /\bcopy full \.intentos\b/i,
    /全量覆盖/,
    /直接覆盖/,
  ];
  if (bodyHasAny(content, forbiddenOverwrite)) {
    fail(`${rel} governed or sensitive existing project uses overwrite language`);
  } else {
    pass(`${rel} governed or sensitive existing project avoids overwrite language`);
  }
}

function validateDecision(content, rel) {
  const decision = sectionBody(content, "Human Decision");
  const status = singleDecisionStatus(decision);
  if (status) pass(`${rel} Human Decision status ${status}`);
  else fail(`${rel} Human Decision must contain exactly one status: PENDING, APPROVED, or REJECTED`);
}

function validateEvidence(content, rel) {
  const rows = extractEvidenceRows(sectionBody(content, "Evidence Required"));
  if (rows.length === 0) {
    warn(`${rel} has no evidence rows`);
    return;
  }
  for (const cells of rows) {
    const evidenceRef = cells[1] || "";
    const status = cells[2] || "";
    if (/^(PENDING|NOT_APPLICABLE)$/i.test(status) || /^PENDING$/i.test(evidenceRef)) {
      pass(`${rel} evidence row is explicitly pending or not applicable`);
      continue;
    }
    if (/^DONE$/i.test(status)) {
      const candidate = path.join(projectRoot, evidenceRef.replace(/^`|`$/g, ""));
      if (fs.existsSync(candidate)) pass(`${rel} evidence ref exists ${evidenceRef}`);
      else fail(`${rel} DONE evidence ref missing ${evidenceRef}`);
      continue;
    }
    warn(`${rel} evidence row has unclear status: ${status}`);
  }
}

function validateTypeSeparation(content, rel) {
  if (bodyHasAny(content, [/\bprimary platform packs\b/i, /\bcapability packs\b/i, /\bquality, environment, or release packs\b/i])) {
    pass(`${rel} separates standard pack types`);
  } else {
    fail(`${rel} must separate primary platform, capability, and quality/environment/release standard packs`);
  }
}

function validateResolverComparison(content, rel) {
  if (!compareResolver) return;
  const recommendation = buildStandardBaselineRecommendation(projectRoot);
  const expected = recommendation.recommendedStandardPacks.map((pack) => pack.id).sort();
  const actual = extractPackIds(sectionBody(content, "Recommended Standard Packs"), "standard").sort();
  const same = expected.length === actual.length && expected.every((item, index) => item === actual[index]);
  if (same) {
    pass(`${rel} recommended standard packs match resolver`);
    return;
  }
  if (/Resolver (difference|override) reason:/i.test(content)) {
    warn(`${rel} recommended standard packs differ from resolver with recorded reason`);
    return;
  }
  fail(`${rel} recommended standard packs differ from resolver: expected [${expected.join(", ")}], got [${actual.join(", ")}]`);
}

function validateReport(file) {
  if (!fs.existsSync(file)) {
    fail(`standard baseline selection report not found: ${file}`);
    return;
  }
  const rel = path.relative(projectRoot, file).replaceAll(path.sep, "/");
  const content = fs.readFileSync(file, "utf8");
  validateRequiredSections(content, rel);
  validateSelectedProfiles(content, rel);
  validateBoundary(content, rel);
  validateOverclaims(content, rel);
  validatePackIds(content, rel);
  validateConditionalScope(content, rel);
  validateExistingProjectBoundary(content, rel);
  validateDecision(content, rel);
  validateEvidence(content, rel);
  validateTypeSeparation(content, rel);
  validateResolverComparison(content, rel);
}

const reports = reportFiles();

if (!outputJson) {
  console.log("# Standard Baseline Selection Check");
  console.log("");
}

if (reports.length === 0) {
  if (strict) fail("strict standard baseline selection requires at least one report");
  else pass("standard baseline selection check skipped: no reports");
} else {
  for (const file of reports) validateReport(file);
}

if (outputJson) {
  const consumerOutcome = deriveConsumerOutcome({
    hasArtifact: reports.length > 0,
    invalid: failed,
    blocked: !failed && pending,
    ready: reports.length > 0 && !failed && !pending && compareResolver,
  });
  console.log(JSON.stringify({
    status: failed ? "FAIL" : pending ? "PENDING" : "PASS",
    consumerOutcome,
    projectRoot,
    report: reportArg,
    strict,
    compareResolver,
    results,
  }, null, 2));
}

if (failed) process.exit(1);

if (!outputJson) {
  console.log("");
  if (pending) console.log("Standard baseline selection has pending decisions.");
  else console.log("Standard baseline selection check passed.");
}
