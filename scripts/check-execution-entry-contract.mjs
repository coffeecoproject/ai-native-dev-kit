#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { loadSchema, validateEvidenceBlock } from "./lib/artifact-schema.mjs";
import { validatePlanningClosureEvidence } from "./lib/planning-closure.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["json", "report", "require-contract", "task-ref", "intent-digest", "allow-empty"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = canonicalRoot(path.resolve(process.cwd(), args._[0] || "."));
const outputJson = Boolean(args.json);
const report = args.report ? safeReport(String(args.report)) : "";
const checks = [];
let failed = false;

if (unknown.length > 0) abort(`unknown option: --${unknown.join(", --")}`);
if (!report && args["allow-empty"] && !args["require-contract"]) {
  if (!outputJson) console.log("# Execution Entry Contract Check\n");
  pass("Execution Entry Contract skipped by explicit --allow-empty: no report selected");
  emit();
}
if (!report) abort("--report must identify one project-relative planning-closure-reports/*.md file");
if (!outputJson) console.log("# Execution Entry Contract Check\n");

const schema = loadSchema(projectRoot, "schemas/artifacts/planning-closure.schema.json");
const content = fs.readFileSync(report, "utf8");
const checked = validateEvidenceBlock(content, schema, rel(report), { require: true, digestField: "report_digest" });
if (!checked.ok) checked.errors.forEach(fail);
else {
  const evidence = checked.value;
  const semantic = validatePlanningClosureEvidence(projectRoot, report, evidence);
  if (semantic.ok) pass("Planning Closure evidence is current and valid");
  else semantic.errors.forEach(fail);
  const contract = evidence.execution_entry_contract;
  if (args["require-contract"] && !contract) fail("a current Execution Entry Contract is required");
  else if (!contract) pass("no contract exists for the non-ready planning state");
  else {
    pass("Execution Entry Contract exists only on PLANNING_READY evidence");
    if (contract.task_ref === evidence.task_ref && contract.intent_digest === evidence.intent_digest) pass("contract matches the current task and intent");
    else fail("contract must match the current task and intent");
    if (args["task-ref"] && contract.task_ref !== String(args["task-ref"])) fail("contract does not match --task-ref");
    if (args["intent-digest"] && contract.intent_digest !== String(args["intent-digest"])) fail("contract does not match --intent-digest");
    if (contract.requires_pre_write_revalidation === "Yes") pass("contract requires pre-write revalidation");
    else fail("contract must require pre-write revalidation");
  }
}
emit();

function safeReport(value) {
  const normalized = String(value).replace(/^(?:artifact|file):/, "").replaceAll("\\", "/");
  if (!/^(?:\.intentos\/)?planning-closure-reports\/[a-zA-Z0-9._/-]+\.md$/.test(normalized) || normalized.split("/").includes("..")) return "";
  const file = path.resolve(projectRoot, normalized);
  if (!file.startsWith(`${projectRoot}${path.sep}`)) return "";
  try { const stat = fs.lstatSync(file); return stat.isFile() && !stat.isSymbolicLink() ? file : ""; } catch { return ""; }
}

function canonicalRoot(root) { try { return fs.realpathSync(root); } catch { abort(`project root does not exist: ${root}`); } }
function rel(file) { return path.relative(projectRoot, file).split(path.sep).join("/"); }
function pass(message) { checks.push({ status: "PASS", message }); if (!outputJson) console.log(`PASS ${message}`); }
function fail(message) { failed = true; checks.push({ status: "FAIL", message }); if (!outputJson) console.log(`FAIL ${message}`); }
function emit() { if (outputJson) process.stdout.write(`${JSON.stringify({ status: failed ? "FAIL" : "PASS", checks }, null, 2)}\n`); process.exit(failed ? 1 : 0); }
function abort(message) { if (outputJson) process.stdout.write(`${JSON.stringify({ status: "FAIL", checks: [{ status: "FAIL", message }] }, null, 2)}\n`); else console.error(`FAIL ${message}`); process.exit(1); }
