#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import {
  extractMachineReadableEvidence,
  loadSchema,
  validateEvidenceBlock,
} from "./lib/artifact-schema.mjs";
import { sectionBody, stripMarkdown } from "./lib/markdown.mjs";
import { containsSecretLikeValue } from "./lib/risk-surfaces.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set([
  "json",
  "allow-empty",
  "report",
  "require-report",
  "require-structured-evidence",
  "require-source-refs",
  "require-ready",
]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputJson = Boolean(args.json);
const allowEmpty = Boolean(args["allow-empty"]);
const requireReport = Boolean(args["require-report"]);
const requireStructuredEvidence = Boolean(args["require-structured-evidence"] || args["require-source-refs"] || args["require-ready"]);
const requireSourceRefs = Boolean(args["require-source-refs"] || args["require-ready"]);
const requireReady = Boolean(args["require-ready"]);
const explicitReport = args.report ? resolveReportPath(String(args.report)) : "";
const schema = loadSchema(projectRoot, "schemas/artifacts/completion-evidence.schema.json");
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
  "core/completion-evidence-gate.md",
  "docs/completion-evidence-gate.md",
  "templates/completion-evidence-report.md",
  "schemas/artifacts/completion-evidence.schema.json",
  "checklists/completion-evidence-review.md",
  "prompts/completion-evidence-agent.md",
  "scripts/resolve-completion-evidence.mjs",
  "scripts/check-completion-evidence.mjs",
];
const requiredDirectories = ["completion-evidence-reports"];
const requiredSections = [
  "Human Summary",
  "User Request",
  "Completion Evidence Gate",
  "Source Chain",
  "Task Consistency",
  "Missing Or Blocking Items",
  "Boundaries",
  "Machine-Readable Evidence",
  "Outcome",
  "Next Step",
];
const requiredSourceNames = new Set([
  "business_rule_closure",
  "verification_plan",
  "test_evidence",
  "execution_assurance",
]);
const forbiddenClaims = [
  /\brelease approved\b/i,
  /\bproduction approved\b/i,
  /\bapproved for production\b/i,
  /\bthis report writes target files:\s*Yes\b/i,
  /\bthis report runs tests:\s*Yes\b/i,
  /\bthis report fabricates evidence:\s*Yes\b/i,
  /\bthis report authorizes implementation:\s*Yes\b/i,
  /\bthis report approves commit or push:\s*Yes\b/i,
  /\bthis report approves release or production:\s*Yes\b/i,
  /\bthis report proves product correctness:\s*Yes\b/i,
  /\bthis report proves real-environment behavior:\s*Yes\b/i,
  /批准(提交|发布|生产|上线)/,
];

let failed = false;
const checks = [];

if (!outputJson) {
  console.log("# Completion Evidence Gate Check");
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
    readResolved("core/completion-evidence-gate.md"),
    readResolved("docs/completion-evidence-gate.md"),
    readResolved("templates/completion-evidence-report.md"),
    readResolved("schemas/artifacts/completion-evidence.schema.json"),
  ].join("\n");
  if (!combined.trim()) return;
  for (const marker of [
    "Completion Evidence Gate",
    "completion_evidence_gate",
    "can_claim_complete",
    "Business Rule Closure",
    "Verification Plan",
    "Test Evidence",
    "Execution Assurance",
    "This report approves release or production: No",
  ]) {
    if (combined.includes(marker)) pass(`completion evidence docs include ${marker}`);
    else fail(`completion evidence docs missing ${marker}`);
  }
}

function checkReports() {
  const files = explicitReport ? [explicitReport] : markdownFiles("completion-evidence-reports");
  if (files.length === 0) {
    if (allowEmpty) pass("completion evidence check skipped by explicit --allow-empty: no reports");
    else if (requireReport || explicitReport) fail("no Completion Evidence Gate reports found; run `completion-evidence --out <relative-report-path>` first");
    else pass("SKIPPED_NO_REPORT: no Completion Evidence Gate reports found; no completion claim made");
    return;
  }
  for (const file of files) {
    if (!fs.existsSync(file)) {
      fail(`missing explicit Completion Evidence Gate report ${file}`);
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
    if (pattern.test(content)) fail(`${label} contains forbidden Completion Evidence claim: ${pattern.source}`);
  }
  for (const section of requiredSections) {
    if (hasSection(content, section)) pass(`${label} includes ${section}`);
    else fail(`${label} missing section ${section}`);
  }
  requireBoundaryNo(content, label, "This report writes target files");
  requireBoundaryNo(content, label, "This report runs tests");
  requireBoundaryNo(content, label, "This report fabricates evidence");
  requireBoundaryNo(content, label, "This report authorizes implementation");
  requireBoundaryNo(content, label, "This report approves commit or push");
  requireBoundaryNo(content, label, "This report approves release or production");
  requireBoundaryNo(content, label, "This report proves product correctness");
  requireBoundaryNo(content, label, "This report proves real-environment behavior");
  requireBoundaryNo(content, label, "This report replaces source systems");

  const result = validateEvidenceBlock(content, schema, label, {
    require: requireStructuredEvidence,
    digestField: "completion_gate_digest",
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
  checkSummary(content, label, evidence);
  checkStructuredEvidence(label, file, evidence);
}

function checkSummary(content, label, evidence) {
  const body = sectionBody(content, "Human Summary") || "";
  const state = tableValue(body, "Completion State");
  const canClaim = tableValue(body, "Can Claim Complete");
  if (state === evidence.completion_state) pass(`${label} summary completion state matches structured evidence`);
  else fail(`${label} summary completion state ${state || "<empty>"} does not match ${evidence.completion_state}`);
  if (canClaim === evidence.can_claim_complete) pass(`${label} summary claim flag matches structured evidence`);
  else fail(`${label} summary claim flag ${canClaim || "<empty>"} does not match ${evidence.can_claim_complete}`);
}

function checkStructuredEvidence(label, file, evidence) {
  const refs = reportRefCandidates(file);
  if (refs.includes(evidence.completion_evidence_ref)) pass(`${label} completion_evidence_ref points to this report`);
  else fail(`${label} completion_evidence_ref ${evidence.completion_evidence_ref || "<missing>"} must point to ${refs.join(" or ")}`);

  const sources = Array.isArray(evidence.source_chain) ? evidence.source_chain : [];
  const sourceNames = new Set(sources.map((item) => item.name));
  for (const name of requiredSourceNames) {
    if (sourceNames.has(name)) pass(`${label} includes source ${name}`);
    else fail(`${label} missing source ${name}`);
  }
  for (const source of sources) {
    checkSource(label, source);
  }
  const checksById = new Map((evidence.gate_checks || []).map((item) => [item.id, item]));
  for (const id of [
    "check:business_rule_closure",
    "check:verification_plan",
    "check:test_evidence",
    "check:execution_assurance",
    "check:task-consistency",
  ]) {
    if (checksById.has(id)) pass(`${label} includes gate check ${id}`);
    else fail(`${label} missing gate check ${id}`);
  }
  if (evidence.task_consistency?.all_sources_same_task === "Yes") pass(`${label} source chain task refs are consistent`);
  else fail(`${label} source chain task refs must be consistent before completion can be claimed`);
  const allPass = (evidence.gate_checks || []).every((item) => item.status === "PASS");
  if (evidence.completion_state === "COMPLETION_EVIDENCE_READY") {
    if (evidence.can_claim_complete === "Yes") pass(`${label} ready gate can claim complete`);
    else fail(`${label} ready gate must set can_claim_complete Yes`);
    if (allPass) pass(`${label} ready gate has all checks passing`);
    else fail(`${label} COMPLETION_EVIDENCE_READY requires all gate checks to PASS`);
    for (const source of sources) {
      if (source.status === "RECORDED" && source.ready === "Yes") pass(`${label} ready source ${source.name} is recorded and ready`);
      else fail(`${label} ready gate requires recorded ready source ${source.name}`);
    }
  } else if (evidence.can_claim_complete === "Yes") {
    fail(`${label} cannot claim complete unless state is COMPLETION_EVIDENCE_READY`);
  }
  if (requireReady && evidence.completion_state !== "COMPLETION_EVIDENCE_READY") {
    fail(`${label} --require-ready requires COMPLETION_EVIDENCE_READY`);
  }
}

function checkSource(label, source) {
  if (!requiredSourceNames.has(source.name)) fail(`${label} unknown source ${source.name}`);
  if (requireSourceRefs || source.ready === "Yes") {
    const resolved = resolveArtifact(String(source.ref || ""));
    if (resolved) {
      pass(`${label} source ${source.name} ref resolves`);
      checkReferencedSource(label, source, resolved);
    } else {
      fail(`${label} source ${source.name} ref is not resolvable: ${source.ref || "<missing>"}`);
    }
  }
  if (source.ready === "Yes" && source.status !== "RECORDED") {
    fail(`${label} source ${source.name} cannot be ready unless RECORDED`);
  }
}

function checkReferencedSource(label, source, file) {
  const extracted = extractMachineReadableEvidence(fs.readFileSync(file, "utf8"));
  if (!extracted?.ok) {
    fail(`${label} source ${source.name} has invalid Machine-Readable Evidence`);
    return;
  }
  const evidence = extracted.value;
  if (source.task_ref === evidence.task_ref) pass(`${label} source ${source.name} task_ref matches referenced evidence`);
  else fail(`${label} source ${source.name} task_ref ${source.task_ref || "<missing>"} must match referenced evidence ${evidence.task_ref || "<missing>"}`);
  const expected = expectedOutcomeFor(source.name, evidence);
  if (source.source_outcome === expected) pass(`${label} source ${source.name} outcome matches referenced evidence`);
  else fail(`${label} source ${source.name} outcome ${source.source_outcome || "<missing>"} must match referenced evidence ${expected || "<missing>"}`);
  if (source.name === "execution_assurance" && evidence.can_claim_done !== "Yes" && source.ready === "Yes") {
    fail(`${label} execution assurance ready source requires can_claim_done Yes`);
  }
}

function expectedOutcomeFor(name, evidence) {
  if (name === "business_rule_closure") return evidence.state || evidence.outcome;
  if (name === "verification_plan") return evidence.verification_state || evidence.outcome;
  if (name === "test_evidence") return evidence.test_evidence_state || evidence.outcome;
  if (name === "execution_assurance") return evidence.assurance_state || evidence.outcome;
  return evidence.outcome;
}

function resolveReportPath(relativeOrAbsolute) {
  if (path.isAbsolute(relativeOrAbsolute)) return relativeOrAbsolute;
  return path.resolve(projectRoot, relativeOrAbsolute);
}

function resolveAsset(relativePath) {
  const direct = path.join(projectRoot, relativePath);
  if (fs.existsSync(direct)) return direct;
  const managed = path.join(projectRoot, ".intentos", relativePath);
  if (fs.existsSync(managed)) return managed;
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
  const resolved = resolveAsset(relativePath);
  if (!resolved || !fs.statSync(resolved).isFile()) return "";
  return fs.readFileSync(resolved, "utf8");
}

function displayAsset(relativePath, resolved) {
  if (resolved.includes(`${path.sep}.intentos${path.sep}`)) return `.intentos/${relativePath}`;
  return relativePath;
}

function markdownFiles(dir) {
  const resolved = resolveDirectory(dir);
  if (!resolved) return [];
  const files = [];
  for (const entry of fs.readdirSync(resolved, { withFileTypes: true })) {
    const full = path.join(resolved, entry.name);
    if (entry.isDirectory()) files.push(...markdownFiles(path.relative(projectRoot, full)));
    else if (entry.isFile() && entry.name.endsWith(".md")) files.push(full);
  }
  return files.sort();
}

function hasSection(content, heading) {
  return Boolean(sectionBody(content, heading));
}

function requireBoundaryNo(content, label, name) {
  const pattern = new RegExp(`-\\s*${escapeRegExp(name)}:\\s*No\\b`, "i");
  if (pattern.test(content)) pass(`${label} boundary ${name}: No`);
  else fail(`${label} must include boundary "${name}: No"`);
}

function tableValue(markdown, field) {
  for (const line of String(markdown || "").split(/\r?\n/)) {
    if (!line.trim().startsWith("|")) continue;
    const cells = line.split("|").slice(1, -1).map((cell) => stripMarkdown(cell.trim()));
    if (cells[0] === field) return cells[1] || "";
  }
  return "";
}

function reportRefCandidates(file) {
  const relative = path.relative(projectRoot, file);
  return [`artifact:${relative}`, `file:${relative}`, relative];
}

function resolveArtifact(ref) {
  const relative = String(ref || "").replace(/^(artifact|file):/, "");
  if (!relative || path.isAbsolute(relative) || relative.includes("..")) return "";
  const candidates = [
    path.resolve(projectRoot, relative),
    path.resolve(projectRoot, ".intentos", relative),
  ];
  return candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile()) || "";
}

function rel(file) {
  return path.relative(projectRoot, file);
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
    process.stdout.write(`${JSON.stringify({ ok: !failed, checks }, null, 2)}\n`);
  } else if (!failed) {
    console.log("");
    console.log("Completion Evidence Gate check passed.");
  }
  if (failed) process.exit(1);
}
