#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { loadSchema, validateEvidenceBlock } from "./lib/artifact-schema.mjs";
import { sectionBody, stripMarkdown } from "./lib/markdown.mjs";
import { containsSecretLikeValue } from "./lib/risk-surfaces.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set([
  "json",
  "allow-empty",
  "report",
  "require-report",
  "require-structured-evidence",
  "strict-source-binding",
]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputJson = Boolean(args.json);
const allowEmpty = Boolean(args["allow-empty"]);
const requireReport = Boolean(args["require-report"]);
const requireStructuredEvidence = Boolean(args["require-structured-evidence"]);
const strictSourceBinding = Boolean(args["strict-source-binding"]);
const explicitReport = args.report ? path.resolve(projectRoot, String(args.report)) : "";
const schema = loadSchema(projectRoot, "schemas/artifacts/release-channel-policy.schema.json");
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
  "core/release-channel-decoupling.md",
  "docs/release-channel-decoupling.md",
  "templates/release-channel-policy-report.md",
  "schemas/artifacts/release-channel-policy.schema.json",
  "checklists/release-channel-policy-review.md",
  "prompts/release-channel-policy-agent.md",
  "scripts/resolve-release-channel-policy.mjs",
  "scripts/check-release-channel-policy.mjs",
];
const requiredDirectories = ["release-channel-policies"];
const requiredSections = [
  "Human Summary",
  "Source Identity",
  "GitHub Release Policy",
  "GitHub Actions Policy",
  "Cost And Retention",
  "Release Package Identity",
  "Owners",
  "Source Chain",
  "Boundaries",
  "Machine-Readable Evidence",
  "Outcome",
  "Next Step",
];
const forbiddenClaims = [
  /\bapproved for production\b/i,
  /\bcan go live\b/i,
  /\bsafe to launch\b/i,
  /\bThis report approves release:\s*Yes\b/i,
  /\bThis report approves production:\s*Yes\b/i,
  /\bThis report executes release:\s*Yes\b/i,
  /\bThis report uploads GitHub Release assets:\s*Yes\b/i,
  /\bThis report runs GitHub-hosted release workflows:\s*Yes\b/i,
  /\bThis report deletes artifacts:\s*Yes\b/i,
  /\bThis report changes CI:\s*Yes\b/i,
  /\bThis report changes production:\s*Yes\b/i,
  /\btag\s+(equals|is)\s+release approval\b/i,
  /批准(发布|生产|上线)/,
  /可以(正式)?上线/,
];

let failed = false;
const checks = [];

if (!outputJson) {
  console.log("# Release Channel Policy Check");
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
    readResolved("core/release-channel-decoupling.md"),
    readResolved("docs/release-channel-decoupling.md"),
    readResolved("templates/release-channel-policy-report.md"),
    readResolved("schemas/artifacts/release-channel-policy.schema.json"),
    readResolved("scripts/resolve-release-channel-policy.mjs"),
    readResolved("scripts/check-release-channel-policy.mjs"),
  ].join("\n");
  if (!combined.trim()) return;
  for (const marker of [
    "Release Channel Decoupling",
    "release_channel_policy",
    "release-channel",
    "release-channel-check",
    "source identity",
    "GitHub source and evidence",
    "GitHub Release Policy",
    "GitHub Actions Policy",
    "release package identity",
    "cost owner",
    "does not approve release",
  ]) {
    if (combined.includes(marker)) pass(`release channel docs include ${marker}`);
    else fail(`release channel docs missing ${marker}`);
  }
}

function checkReports() {
  const files = explicitReport ? [explicitReport] : markdownFiles("release-channel-policies");
  if (files.length === 0) {
    if (allowEmpty) pass("release channel policy check skipped by explicit --allow-empty: no reports");
    else if (requireReport || explicitReport) fail("no Release Channel Policy reports found");
    else pass("SKIPPED_NO_REPORT: no Release Channel Policy reports found");
    return;
  }
  for (const file of files) {
    if (!fs.existsSync(file)) {
      fail(`missing explicit Release Channel Policy report ${file}`);
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
    if (sectionBody(content, section)) pass(`${label} includes ${section}`);
    else fail(`${label} missing section ${section}`);
  }
  for (const pattern of forbiddenClaims) {
    if (pattern.test(content)) fail(`${label} contains forbidden release channel claim: ${pattern.source}`);
  }
  const result = validateEvidenceBlock(content, schema, label, {
    require: requireStructuredEvidence,
    digestField: "release_channel_policy_digest",
  });
  if (!result.present && !requireStructuredEvidence) {
    pass(`${label} structured evidence optional and not present`);
    return;
  }
  if (!result.ok) {
    result.errors.forEach((error) => fail(error));
    return;
  }
  pass(`${label} has valid structured evidence`);
  checkStructuredEvidence(content, label, file, result.value);
}

function checkStructuredEvidence(content, label, file, evidence) {
  if (reportRefCandidates(file).includes(evidence.release_channel_policy_ref)) pass(`${label} release_channel_policy_ref points to this report`);
  else fail(`${label} release_channel_policy_ref ${evidence.release_channel_policy_ref || "<missing>"} must point to this report`);

  if (evidence.artifact_type === "release_channel_policy") pass(`${label} artifact_type is release_channel_policy`);
  else fail(`${label} artifact_type must be release_channel_policy`);
  if (evidence.schema_version === "1.87.0") pass(`${label} schema_version is 1.87.0`);
  else fail(`${label} schema_version must be 1.87.0`);
  if (stripMarkdown(sectionBody(content, "Outcome") || "").includes(evidence.outcome)) pass(`${label} Outcome includes structured state`);
  else fail(`${label} Outcome must include structured state`);

  for (const [field, expected] of [
    ["approves_release", "No"],
    ["executes_release", "No"],
    ["uploads_github_release_asset", "No"],
    ["runs_github_hosted_release_workflow", "No"],
    ["deletes_artifacts", "No"],
    ["changes_ci", "No"],
    ["changes_production", "No"],
    ["changes_secrets", "No"],
  ]) {
    if (evidence.boundaries?.[field] === expected) pass(`${label} boundary ${field} is ${expected}`);
    else fail(`${label} boundary ${field} must be ${expected}`);
  }

  if (!hasTechnicalBurden(evidence.decision?.plain_user_summary)) pass(`${label} plain summary avoids raw technical burden`);
  else fail(`${label} plain summary must not ask user to choose technical release channel primitives`);

  checkPolicyConsistency(label, evidence);
  if (strictSourceBinding) checkSourceBinding(label, evidence);
}

function checkPolicyConsistency(label, evidence) {
  const releasePolicy = evidence.github_release_policy || {};
  const actionsPolicy = evidence.github_actions_policy || {};
  const billing = evidence.github_actions_billing_profile || {};
  const cost = evidence.cost_risk || {};
  const owners = evidence.owners || {};
  const channel = evidence.effective_release_channel || {};
  const pkg = evidence.release_package_identity || {};
  const artifact = evidence.artifact_policy || {};
  const decision = evidence.decision || {};

  if (evidence.source_identity?.source_ref_role === "release_trigger" || evidence.source_identity?.tag_triggers_release_workflow === "Yes") {
    if (owners.release_owner_ref !== "missing") pass(`${label} tag-triggered release has release owner`);
    else fail(`${label} tag-triggered release workflow requires release owner evidence`);
  }
  if (releasePolicy.github_release_notes_only === "Yes" && releasePolicy.release_event_workflow_detected === "Yes") {
    if (owners.release_owner_ref !== "missing") pass(`${label} notes-only GitHub Release with release workflow has release owner`);
    else fail(`${label} notes-only GitHub Release with on: release workflow requires release owner review`);
  }
  if (releasePolicy.github_release_assets_uploaded === "Yes") {
    if (decision.can_use_github_as_source_and_evidence_only !== "Yes") pass(`${label} GitHub source/evidence-only is not claimed when release assets are uploaded`);
    else fail(`${label} cannot claim GitHub source/evidence-only while release assets are uploaded`);
    if (releasePolicy.github_release_assets_allowed === "Yes" && owners.release_owner_ref !== "missing") pass(`${label} GitHub Release asset channel has owner policy`);
    else if (releasePolicy.github_release_assets_allowed === "Yes") fail(`${label} GitHub Release assets require release owner policy`);
  }
  if (actionsPolicy.actions_artifact_used_as_release_package === "Yes") {
    if (actionsPolicy.artifact_retention_policy_ref !== "missing") pass(`${label} Actions artifact package has retention policy`);
    else fail(`${label} Actions artifact release package requires retention policy`);
    if (cost.cost_owner_ref !== "missing" && owners.cost_owner_ref !== "missing") pass(`${label} Actions artifact package has cost owner`);
    else fail(`${label} Actions artifact release package requires cost owner`);
  }
  if (actionsPolicy.release_workflow_detected === "Yes" && billing.runner_type === "github_hosted") {
    if (cost.cost_owner_ref !== "missing") pass(`${label} GitHub-hosted release workflow has cost owner`);
    else fail(`${label} GitHub-hosted release workflow requires cost owner`);
  }
  if (cost.cost_owner_required === "Yes") {
    if (cost.cost_owner_ref !== "missing" && owners.cost_owner_ref !== "missing") pass(`${label} cost-risk channel has cost owner`);
    else if (channel.blocked === "Yes" && decision.needs_cost_owner_decision === "Yes") pass(`${label} missing cost owner blocks release review`);
    else fail(`${label} cost-risk channel must have cost owner or block release review`);
  }
  if (["provider_direct_deploy", "app_store_or_mini_program", "server_release_sop"].includes(channel.channel)) {
    if (owners.release_owner_ref !== "missing") pass(`${label} ${channel.channel} has release owner`);
    else if (channel.blocked === "Yes") pass(`${label} ${channel.channel} is blocked without release owner`);
    else fail(`${label} ${channel.channel} requires release owner or blocked state`);
  }
  if (["docker_registry", "package_registry"].includes(channel.channel)) {
    if (owners.platform_owner_ref !== "missing" && owners.platform_owner_ref !== "not_applicable") pass(`${label} registry channel has registry/platform owner`);
    else if (channel.blocked === "Yes") pass(`${label} registry channel is blocked without owner`);
    else fail(`${label} registry channel requires registry/platform owner or blocked state`);
  }
  if (channel.channel !== "source_only" && pkg.identity_type !== "none") {
    if (pkg.identity_ref !== "missing" && pkg.digest_or_id !== "missing") pass(`${label} release package identity is recorded`);
    else if (channel.blocked === "Yes") pass(`${label} missing package identity blocks release review`);
    else fail(`${label} release package channel requires package identity before ready state`);
  }
  if (artifact.release_evidence_deleted_to_reduce_bundle === "No") pass(`${label} release evidence is not deleted to reduce bundle`);
  else fail(`${label} release evidence must not be deleted to reduce bundle`);
  if (artifact.evidence_preserved_outside_runtime_bundle === "Yes") pass(`${label} evidence is preserved outside runtime bundle`);
  else fail(`${label} evidence must be preserved outside runtime bundle`);
  if (channel.blocked === "Yes" && decision.blocks_release_review === "Yes") pass(`${label} blocked channel blocks release review`);
  else if (channel.blocked === "No" && decision.blocks_release_review === "No") pass(`${label} unblocked channel does not block release review`);
  else fail(`${label} decision.blocks_release_review must match channel.blocked`);
}

function checkSourceBinding(label, evidence) {
  const sources = Array.isArray(evidence.source_chain) ? evidence.source_chain : [];
  const sourceKinds = new Set(sources.map((source) => source.source_kind));
  const actions = evidence.github_actions_policy || {};
  const channel = evidence.effective_release_channel || {};
  if (actions.release_workflow_detected === "Yes") requireSource(sourceKinds, "ci_workflow", label);
  if (["package_registry"].includes(channel.channel)) requireSource(sourceKinds, "package_config", label);
  if (["docker_registry"].includes(channel.channel)) requireSource(sourceKinds, "docker_config", label);
  if (evidence.effective_release_channel?.recommendation_class === "KEEP_EXISTING_APPROVED_CHANNEL") requireSource(sourceKinds, "project_sop", label);
  for (const source of sources) {
    if (["current_task", "release_candidate", "project", "unknown", "not_applicable"].includes(source.source_scope_match)) pass(`${label} source ${source.source_kind} uses valid scope match`);
    else fail(`${label} source ${source.source_kind} has invalid scope match`);
  }
}

function requireSource(sourceKinds, kind, label) {
  if (sourceKinds.has(kind)) pass(`${label} strict source binding includes ${kind}`);
  else fail(`${label} strict source binding requires ${kind}`);
}

function hasTechnicalBurden(value) {
  const text = String(value || "");
  return /\b(SOURCE_ONLY_NO_RELEASE_CHANNEL|GITHUB_ACTIONS_ARTIFACT_HANDOFF|policy_state|enum|on\.push\.tags)\b/.test(text);
}

function resolveAsset(relativePath) {
  const candidates = [
    path.join(projectRoot, relativePath),
    path.join(projectRoot, ".intentos", relativePath),
  ];
  return candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile()) || "";
}

function resolveDirectory(relativePath) {
  const candidates = [
    path.join(projectRoot, relativePath),
    path.join(projectRoot, ".intentos", relativePath),
  ];
  return candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) || "";
}

function readResolved(relativePath) {
  const resolved = resolveAsset(relativePath);
  return resolved ? fs.readFileSync(resolved, "utf8") : "";
}

function markdownFiles(relativeDir) {
  const dirs = [
    path.join(projectRoot, relativeDir),
    path.join(projectRoot, ".intentos", relativeDir),
  ].filter((dir) => fs.existsSync(dir) && fs.statSync(dir).isDirectory());
  return dirs.flatMap((dir) => walk(dir).filter((file) => file.endsWith(".md")));
}

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function reportRefCandidates(file) {
  return [
    path.relative(projectRoot, file).replaceAll(path.sep, "/"),
    `artifact:${path.relative(projectRoot, file).replaceAll(path.sep, "/")}`,
  ];
}

function rel(file) {
  return path.relative(projectRoot, file).replaceAll(path.sep, "/");
}

function displayAsset(relativePath, resolved) {
  const relative = path.relative(projectRoot, resolved).replaceAll(path.sep, "/");
  return relative === relativePath ? relativePath : `${relativePath} (${relative})`;
}

function pass(message) {
  checks.push({ ok: true, message });
  if (!outputJson) console.log(`PASS ${message}`);
}

function fail(message) {
  failed = true;
  checks.push({ ok: false, message });
  if (!outputJson) console.log(`FAIL ${message}`);
}

function emitAndExit() {
  if (outputJson) {
    console.log(JSON.stringify({ ok: !failed, checks }, null, 2));
  }
  process.exit(failed ? 1 : 0);
}
