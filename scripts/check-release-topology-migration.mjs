#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { assertNoSymlinkInPath, isSafeRelativePath } from "./lib/path-safety.mjs";
import { validateMigrationFile } from "./lib/release-topology-migration.mjs";

const args = parseArgs(process.argv.slice(2));
const known = new Set(["allow-empty", "report", "require-report", "require-structured-evidence", "require-current-project", "require-ready", "json"]);
const unknown = unknownOptions(args, known);
if (unknown.length) failNow(`unknown option: --${unknown.join(", --")}`);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const reportRef = String(args.report || "");
if (reportRef && (!isSafeRelativePath(reportRef) || !reportRef.startsWith("release-topology-migrations/") || !reportRef.endsWith(".md"))) failNow("--report must be a safe path under release-topology-migrations/*.md");
const requireStructured = Boolean(args["require-structured-evidence"] || args["require-current-project"] || args["require-ready"]);
const files = reportRef ? [path.resolve(projectRoot, reportRef)] : markdownFiles(path.join(projectRoot, "release-topology-migrations"));
const checks = [];
let failed = false;
if (!files.length) {
  if (args["allow-empty"] && !requireStructured && !args["require-report"]) pass("migration check skipped by explicit --allow-empty");
  else if (requireStructured || args["require-report"]) fail("Release Topology Migration report is required");
  else pass("SKIPPED_NO_REPORT: no Release Topology Migration reports found");
  emit();
}
for (const file of files) check(file);
emit();

function check(file) {
  if (!fs.existsSync(file)) return fail(`missing migration report ${file}`);
  try { assertNoSymlinkInPath(projectRoot, file, "release topology migration report"); }
  catch (error) { return fail(error.message); }
  const result = validateMigrationFile(projectRoot, file, { requireReady: args["require-ready"] });
  if (!result.ok) return result.errors.forEach((item) => fail(`${path.relative(projectRoot, file)} ${item}`));
  pass(`${path.relative(projectRoot, file)} has valid current-project migration evidence`);
  pass(`${path.relative(projectRoot, file)} remains read-only and non-authorizing`);
}
function markdownFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).filter((entry) => entry.isFile() && !entry.isSymbolicLink() && entry.name.endsWith(".md")).map((entry) => path.join(dir, entry.name)).sort();
}
function pass(message) { checks.push({ ok: true, message }); if (!args.json) console.log(`PASS ${message}`); }
function fail(message) { failed = true; checks.push({ ok: false, message }); if (!args.json) console.error(`FAIL ${message}`); }
function failNow(message) { console.error(`FAIL ${message}`); process.exit(1); }
function emit() { if (args.json) console.log(JSON.stringify({ ok: !failed, checks }, null, 2)); process.exit(failed ? 1 : 0); }
