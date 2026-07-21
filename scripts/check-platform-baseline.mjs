#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { resolvePlatformBaseline } from "./resolve-platform-baseline.mjs";
import { parseArgs } from "./lib/args.mjs";

const args = parseArgs(process.argv.slice(2));
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const strict = Boolean(args.strict);
const outputJson = Boolean(args.json);

for (const key of Object.keys(args)) {
  if (!["_", "strict", "json"].includes(key)) {
    console.error(`FAIL unknown option: --${key}`);
    process.exit(1);
  }
}

let failed = false;
let pending = false;
const checks = [];

function record(status, message) {
  checks.push({ status, message });
  if (!outputJson) {
    const write = status === "FAIL" ? console.error : console.log;
    write(`${status} ${message}`);
  }
}

function fail(message) {
  failed = true;
  record("FAIL", message);
}

function pass(message) {
  record("PASS", message);
}

function warn(message) {
  pending = true;
  record("PENDING", message);
}

function readIfExists(rel) {
  const full = path.join(projectRoot, rel);
  return fs.existsSync(full) ? fs.readFileSync(full, "utf8") : "";
}

function combinedVerificationText() {
  return [
    readIfExists("docs/test-strategy.md"),
    readIfExists("docs/verification-matrix.md"),
    readIfExists("scripts/verify.sh"),
  ].join("\n").toLowerCase();
}

function verifyScriptText() {
  return readIfExists("scripts/verify.sh").toLowerCase();
}

function riskPolicyText() {
  return readIfExists("docs/risk-policy.md").toLowerCase();
}

function permissionModelText() {
  return readIfExists("docs/permission-model.md").toLowerCase();
}

function permissionCoverageKeywords(result) {
  const riskTerms = [
    ...Object.keys(result.effectiveRiskGateMappings || {}),
    ...Object.values(result.effectiveRiskGateMappings || {}).flat(),
    ...(result.effectiveHumanApprovalRequiredFor || []),
  ];
  const profileTerms = riskTerms.filter((term) => /auth|permission|role|scope|admin|personal data|regulated data|sensitive/i.test(term));
  return unique(["roles", "resource scope", "rules", "enforcement", ...profileTerms]);
}

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

function recordCoverage(kind, missing) {
  if (missing.length === 0) {
    pass(`${kind} coverage`);
    return;
  }
  const message = `${kind} coverage missing: ${missing.join(", ")}`;
  if (strict) fail(message);
  else warn(message);
}

const result = resolvePlatformBaseline(projectRoot);

if (!outputJson) {
  console.log(`# Platform Baseline Check (${strict ? "strict" : "baseline"})`);
  console.log("");
}

if (result.state !== "BASELINE_READY") {
  const reasons = result.strictStatus?.blockingReasons?.length > 0
    ? result.strictStatus.blockingReasons
    : result.pendingReasons;
  const message = `${result.state}: ${reasons.length > 0 ? reasons.join("; ") : "platform baseline is not ready"}`;
  if (strict || result.state === "PROFILE_INVALID") fail(message);
  else warn(message);
} else {
  pass(`selected profiles: ${result.selectedProfiles.join(", ")}`);
}

if (strict && result.state === "BASELINE_READY" && result.strictState !== "BASELINE_READY") {
  const reasons = result.strictStatus?.blockingReasons?.length > 0
    ? result.strictStatus.blockingReasons.join("; ")
    : "strict baseline evidence is incomplete";
  fail(`${result.strictState}: ${reasons}`);
}

for (const item of result.missingProfiles) {
  fail(`selected profile is missing or invalid: ${item.profileId} (${item.error})`);
}

for (const profile of result.profiles) {
  pass(`profile baseline: ${profile.id}`);
}

for (const rel of result.effectiveRequiredDocs) {
  if (result.missingRequiredDocs.includes(rel)) {
    fail(`missing required profile doc: ${rel}`);
  } else {
    pass(`required profile doc: ${rel}`);
  }
}

for (const item of result.incompatibleStarters) {
  const message = `starter ${item.starter} is not listed as compatible with ${item.profileId}`;
  if (strict) fail(message);
  else warn(message);
}

if (result.selectedProfiles.length > 0 && result.missingProfiles.length === 0) {
  const verificationText = combinedVerificationText();
  const missingVerification = result.effectiveVerificationKeywords.filter((keyword) => !verificationText.includes(keyword.toLowerCase()));
  recordCoverage("verification", missingVerification);

  const verifyText = verifyScriptText();
  const missingVerifyScript = result.effectiveVerifyScriptKeywords.filter((keyword) => !verifyText.includes(keyword.toLowerCase()));
  recordCoverage("verify script", missingVerifyScript);

  const riskText = riskPolicyText();
  const missingRisk = result.effectiveHighRiskKeywords.filter((keyword) => !riskText.includes(keyword.toLowerCase()));
  recordCoverage("risk policy", missingRisk);

  const permissionText = permissionModelText();
  const missingPermission = permissionCoverageKeywords(result).filter((keyword) => !permissionText.includes(keyword.toLowerCase()));
  recordCoverage("permission model", missingPermission);
}

if (outputJson) {
  const status = failed ? "FAIL" : pending ? "PENDING" : "PASS";
  console.log(JSON.stringify({
    ...result,
    checkMode: strict ? "strict" : "baseline",
    checkStatus: status,
    checks,
  }, null, 2));
}

if (failed) {
  process.exit(1);
}

if (!outputJson) {
  console.log("");
  if (pending) {
    console.log("Platform baseline is present enough to continue; decisions or coverage are still pending.");
  } else {
    console.log("Platform baseline is ready.");
  }
}
