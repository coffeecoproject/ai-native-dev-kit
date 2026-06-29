#!/usr/bin/env node

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { splitMarkdownRow } from "./lib/markdown.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const kitRoot = path.resolve(__dirname, "..");

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["scoreboard", "json", "skip-fixtures"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const scoreboardPath = args.scoreboard
  ? path.resolve(projectRoot, String(args.scoreboard))
  : path.join(projectRoot, "baseline-calibration-reports", "scoreboard.md");
const outputJson = Boolean(args.json);
const skipFixtures = Boolean(args["skip-fixtures"]);
const results = [];
let failed = false;

const requiredColumns = [
  "Case id",
  "Project shape",
  "Expected project state",
  "Actual project state",
  "Expected platform states",
  "Actual platform states",
  "Expected safe action",
  "Actual safe action",
  "Expected BL2 candidate",
  "Actual BL2 candidate",
  "falsePositive",
  "falseNegative",
  "fixStatus",
];

const fixtureCaseIds = [
  "precision-miniprogram-cloudfunctions",
  "precision-permission-only-docs",
  "precision-web-admin-active",
  "precision-production-governed-readonly",
  "precision-dirty-payment-risk",
  "precision-monorepo-deferred-platforms",
  "precision-backend-data-api",
  "precision-new-unknown-empty",
];

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

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function write(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

function parseScoreboardRows(content) {
  const rows = [];
  let headers = null;
  for (const rawLine of content.split("\n")) {
    const line = rawLine.trim();
    if (!line.startsWith("|")) {
      headers = null;
      continue;
    }
    const cells = splitMarkdownRow(line).map((cell) => cell.trim());
    if (cells.includes("Case id")) {
      headers = cells;
      continue;
    }
    if (!headers) continue;
    if (cells.every((cell) => /^:?-{3,}:?$/.test(cell))) continue;
    if (cells.length !== headers.length) {
      rows.push({ parseError: `row has ${cells.length} columns but expected ${headers.length}`, raw: line });
      continue;
    }
    rows.push(Object.fromEntries(headers.map((header, index) => [header, cells[index]])));
  }
  return rows;
}

function validateScoreboard() {
  if (!fs.existsSync(scoreboardPath)) {
    fail(`scoreboard not found: ${scoreboardPath}`);
    return [];
  }
  const content = read(scoreboardPath);
  for (const marker of [
    "not production validation",
    "target-project writes",
    "falsePositive",
    "falseNegative",
    "fixStatus",
  ]) {
    if (content.includes(marker)) pass(`scoreboard includes ${marker}`);
    else fail(`scoreboard missing ${marker}`);
  }
  if (/\b(production-ready|ready for production|safe for production|真实生产验证|生产可用)\b/i.test(content)) {
    fail("scoreboard contains production-readiness overclaim");
  } else {
    pass("scoreboard avoids production-readiness overclaim");
  }

  const rows = parseScoreboardRows(content);
  if (rows.length >= fixtureCaseIds.length) pass(`scoreboard has ${rows.length} calibration rows`);
  else fail(`scoreboard must have at least ${fixtureCaseIds.length} calibration rows`);

  const caseIds = new Set();
  const allowedBoolean = new Set(["yes", "no", "monitor"]);
  const allowedFixStatus = new Set(["fixed", "pending", "monitor", "not-applicable"]);
  for (const row of rows) {
    if (row.parseError) {
      fail(`scoreboard parse error: ${row.parseError}: ${row.raw}`);
      continue;
    }
    for (const column of requiredColumns) {
      if (Object.prototype.hasOwnProperty.call(row, column) && row[column]) {
        continue;
      }
      fail(`scoreboard row missing ${column}: ${row["Case id"] || "<unknown>"}`);
    }
    const id = row["Case id"];
    if (caseIds.has(id)) fail(`scoreboard duplicate case id: ${id}`);
    else caseIds.add(id);
    if (!/^[a-z0-9][a-z0-9-]*$/.test(id || "")) fail(`scoreboard invalid case id: ${id || "<empty>"}`);
    for (const column of ["falsePositive", "falseNegative"]) {
      const value = String(row[column] || "").toLowerCase();
      if (allowedBoolean.has(value)) pass(`scoreboard ${id} ${column}=${value}`);
      else fail(`scoreboard ${id} invalid ${column}: ${row[column] || "<empty>"}`);
    }
    const fixStatus = String(row.fixStatus || "").toLowerCase();
    if (allowedFixStatus.has(fixStatus)) pass(`scoreboard ${id} fixStatus=${fixStatus}`);
    else fail(`scoreboard ${id} invalid fixStatus: ${row.fixStatus || "<empty>"}`);
  }

  for (const id of fixtureCaseIds) {
    if (caseIds.has(id)) pass(`scoreboard includes fixture case ${id}`);
    else fail(`scoreboard missing fixture case ${id}`);
  }
  return rows;
}

function runDecision(targetRoot) {
  const result = spawnSync(process.execPath, [
    path.join(kitRoot, "scripts", "resolve-guided-baseline-selection.mjs"),
    targetRoot,
    "--json",
  ], {
    cwd: kitRoot,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    return { error: result.stderr || result.stdout || "resolver failed" };
  }
  try {
    return JSON.parse(result.stdout);
  } catch (error) {
    return { error: `invalid resolver JSON: ${error.message}\n${result.stdout}` };
  }
}

function platformState(decision, profile) {
  return decision.platformStates?.find((item) => item.profile === profile)?.state || null;
}

function assertCase(caseId, decision, checks) {
  if (decision.error) {
    fail(`${caseId} resolver failed: ${decision.error}`);
    return;
  }
  for (const [label, predicate] of checks) {
    if (predicate(decision)) pass(`${caseId} ${label}`);
    else fail(`${caseId} failed ${label}: ${JSON.stringify(compactDecision(decision))}`);
  }
}

function compactDecision(decision) {
  return {
    projectState: decision.projectState?.internal,
    detectedPlatform: decision.platformAndScope?.detectedPlatform,
    backendApiScope: decision.platformAndScope?.backendApiScope,
    recommendedBaselineLevel: decision.recommendedBaselineLevel,
    recommendedStandardPacks: decision.recommendedStandardPacks,
    candidateIndustrialPacks: decision.candidateIndustrialPacks,
    platformStates: decision.platformStates,
  };
}

function runSyntheticFixtures() {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ai-native-precision-"));
  try {
    const miniprogram = path.join(tempRoot, "precision-miniprogram-cloudfunctions");
    write(path.join(miniprogram, "project.config.json"), "{\"miniprogramRoot\":\"miniprogram\",\"cloudfunctionRoot\":\"cloudfunctions\"}\n");
    write(path.join(miniprogram, "cloudfunctions", "login", "index.js"), "exports.main = async () => ({ ok: true });\n");
    assertCase("precision-miniprogram-cloudfunctions", runDecision(miniprogram), [
      ["detects Mini Program", (d) => d.platformAndScope.detectedPlatform.includes("wechat-miniprogram")],
      ["marks cloud functions as backend possible", (d) => d.platformAndScope.backendApiScope.includes("Mini Program cloud functions need confirmation")],
      ["does not force backend standard pack", (d) => !d.recommendedStandardPacks.includes("backend-api-standard")],
      ["keeps Mini Program selected-inferred", (d) => platformState(d, "wechat-miniprogram") === "selected-inferred"],
    ]);

    const permissionOnly = path.join(tempRoot, "precision-permission-only-docs");
    write(path.join(permissionOnly, "package.json"), "{\"name\":\"permission-only-docs\"}\n");
    write(path.join(permissionOnly, "docs", "architecture", "permission-boundary.md"), "# Permission boundary\n");
    assertCase("precision-permission-only-docs", runDecision(permissionOnly), [
      ["does not infer internal admin from permission docs", (d) => !d.platformAndScope.detectedPlatform.includes("internal-admin")],
      ["does not select internal admin standard pack", (d) => !d.recommendedStandardPacks.includes("internal-admin-standard")],
      ["marks internal-admin not detected", (d) => platformState(d, "internal-admin") === "not-detected"],
    ]);

    const webAdmin = path.join(tempRoot, "precision-web-admin-active");
    write(path.join(webAdmin, "package.json"), JSON.stringify({
      name: "web-admin-active",
      scripts: { "admin:build": "vite build" },
      dependencies: { react: "latest", vite: "latest" },
    }, null, 2));
    write(path.join(webAdmin, "apps", "web-admin", "src", "App.tsx"), "export default function App() { return null; }\n");
    assertCase("precision-web-admin-active", runDecision(webAdmin), [
      ["selects web-app", (d) => platformState(d, "web-app") === "selected-inferred"],
      ["selects internal-admin", (d) => platformState(d, "internal-admin") === "selected-inferred"],
      ["recommends web runtime standard pack", (d) => d.recommendedStandardPacks.includes("web-runtime-standard")],
      ["recommends internal admin standard pack", (d) => d.recommendedStandardPacks.includes("internal-admin-standard")],
    ]);

    const productionGoverned = path.join(tempRoot, "precision-production-governed-readonly");
    write(path.join(productionGoverned, "package.json"), JSON.stringify({
      name: "production-governed",
      dependencies: { react: "latest", prisma: "latest" },
    }, null, 2));
    write(path.join(productionGoverned, ".github", "workflows", "release.yml"), "name: release\n");
    write(path.join(productionGoverned, "docs", "release", "rollback.md"), "# Rollback SOP\n");
    write(path.join(productionGoverned, "server", "schema.sql"), "create table accounts(id text primary key);\n");
    assertCase("precision-production-governed-readonly", runDecision(productionGoverned), [
      ["classifies production-sensitive", (d) => d.projectState.internal === "PRODUCTION_SENSITIVE_PROJECT"],
      ["keeps current safe action read-only mapping", (d) => d.recommendedBaselineLevel.currentSafeAction === "BL1_STANDARD_READ_ONLY_MAPPING"],
      ["keeps BL2 candidate only", (d) => d.recommendedBaselineLevel.targetCandidateLevel === "BL2_INDUSTRIAL" && /candidate/i.test(d.recommendedBaselineLevel.bl2Status)],
    ]);

    const dirtyPayment = path.join(tempRoot, "precision-dirty-payment-risk");
    fs.mkdirSync(dirtyPayment, { recursive: true });
    spawnSync("git", ["init"], { cwd: dirtyPayment, encoding: "utf8" });
    write(path.join(dirtyPayment, "package.json"), JSON.stringify({
      name: "dirty-payment-risk",
      dependencies: { react: "latest", stripe: "latest" },
    }, null, 2));
    write(path.join(dirtyPayment, "docs", "payment-risk.md"), "# Payment and invoice risk\n");
    assertCase("precision-dirty-payment-risk", runDecision(dirtyPayment), [
      ["classifies dirty worktree", (d) => d.projectState.internal === "DIRTY_WORKTREE_PROJECT"],
      ["blocks writes until worktree decision", (d) => d.recommendedBaselineLevel.currentSafeAction === "READ_ONLY_UNTIL_WORKTREE_DECISION"],
      ["keeps BL2 as later candidate", (d) => d.recommendedBaselineLevel.targetCandidateLevel === "BL2_INDUSTRIAL"],
    ]);

    const monorepo = path.join(tempRoot, "precision-monorepo-deferred-platforms");
    write(path.join(monorepo, "apps", "ios", "App.xcodeproj", "project.pbxproj"), "");
    write(path.join(monorepo, "apps", "android", "app", ".keep"), "");
    write(path.join(monorepo, "apps", "miniapp", "src", "app.json"), "{}\n");
    write(path.join(monorepo, "apps", "web-platform-admin", "src", "App.tsx"), "export default null;\n");
    write(path.join(monorepo, "backend", "internal", "schema.sql"), "create table users(id text primary key);\n");
    write(path.join(monorepo, "package.json"), JSON.stringify({
      name: "calibration-monorepo",
      scripts: {
        "ci:matrix:strict:active-no-android-miniapp": "echo ok",
        "web-admin:check": "echo ok",
      },
      dependencies: { react: "latest" },
    }, null, 2));
    assertCase("precision-monorepo-deferred-platforms", runDecision(monorepo), [
      ["marks android deferred", (d) => platformState(d, "android-app") === "present-inactive-or-deferred"],
      ["marks Mini Program needs confirmation", (d) => platformState(d, "wechat-miniprogram") === "present-needs-confirmation"],
      ["selects iOS inferred", (d) => platformState(d, "ios-app") === "selected-inferred"],
      ["separates safe action and BL2 target", (d) => d.recommendedBaselineLevel.currentSafeAction === "BL1_STANDARD_READ_ONLY_MAPPING" && d.recommendedBaselineLevel.targetCandidateLevel === "BL2_INDUSTRIAL"],
    ]);

    const backendData = path.join(tempRoot, "precision-backend-data-api");
    write(path.join(backendData, "package.json"), JSON.stringify({
      name: "backend-data-api",
      dependencies: { express: "latest", prisma: "latest" },
    }, null, 2));
    write(path.join(backendData, "server", "index.ts"), "export const app = {};\n");
    write(path.join(backendData, "prisma", "schema.prisma"), "model User { id String @id }\n");
    assertCase("precision-backend-data-api", runDecision(backendData), [
      ["selects backend-api", (d) => platformState(d, "backend-api") === "selected-inferred"],
      ["recommends backend standard pack", (d) => d.recommendedStandardPacks.includes("backend-api-standard")],
      ["keeps data-risk BL2 candidate", (d) => d.recommendedBaselineLevel.targetCandidateLevel === "BL2_INDUSTRIAL"],
    ]);

    const empty = path.join(tempRoot, "precision-new-unknown-empty");
    fs.mkdirSync(empty, { recursive: true });
    assertCase("precision-new-unknown-empty", runDecision(empty), [
      ["uses BL0 for unknown empty target", (d) => d.recommendedBaselineLevel.level === "BL0_LIGHTWEIGHT"],
      ["does not select platform packs", (d) => d.recommendedStandardPacks.length === 0],
      ["marks unknown platform", (d) => d.platformAndScope.detectedPlatform === "unknown platform"],
    ]);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

validateScoreboard();
if (!skipFixtures) runSyntheticFixtures();

if (outputJson) {
  console.log(JSON.stringify({
    status: failed ? "FAIL" : "PASS",
    projectRoot,
    scoreboard: scoreboardPath,
    skippedFixtures: skipFixtures,
    results,
  }, null, 2));
}

if (failed) process.exit(1);

if (!outputJson) {
  console.log("");
  console.log("Baseline selection precision check passed.");
}
