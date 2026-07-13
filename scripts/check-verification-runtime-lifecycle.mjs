#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { loadSchema, validateEvidenceBlock } from "./lib/artifact-schema.mjs";
import { projectIdentity, resolveAuthoritativeEvidenceReference, validateEvidenceAuthorityBinding } from "./lib/evidence-authority.mjs";
import { sectionBody, stripMarkdown } from "./lib/markdown.mjs";
import { assertNoSymlinkInPath, isSafeRelativePath, resolveUnderRoot } from "./lib/path-safety.mjs";
import { containsSecretLikeValue } from "./lib/risk-surfaces.mjs";
import { planSemanticErrors } from "./lib/verification-runtime-trust.mjs";
import { lifecyclePlanSemanticErrors, readLifecycleDeclaration } from "./lib/verification-runtime-lifecycle.mjs";

const args = parseArgs(process.argv.slice(2));
const unknown = unknownOptions(args, new Set(["json", "allow-empty", "report", "require-report", "require-ready"]));
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputJson = Boolean(args.json);
const allowEmpty = Boolean(args["allow-empty"]);
const requireReport = Boolean(args["require-report"] || args.report);
const requireReady = Boolean(args["require-ready"]);
const checks = [];
let failed = false;
if (unknown.length) fatal(`unknown option: --${unknown.join(", --")}`);
if (!outputJson) console.log("# Verification Runtime Lifecycle Plan Check\n");

const files = args.report ? [reportPath(String(args.report))] : markdownFiles();
if (!files.length) {
  if (allowEmpty) pass("no lifecycle plan; skipped by explicit --allow-empty");
  else if (requireReport) fail("no Verification Runtime Lifecycle Plan found");
  else pass("SKIPPED_NO_REPORT: no Verification Runtime Lifecycle Plan found");
} else {
  files.forEach(checkReport);
}
emit();

function checkReport(file) {
  if (!fs.existsSync(file)) return fail(`missing report ${rel(file)}`);
  if (fs.lstatSync(file).isSymbolicLink()) return fail(`report must not be a symlink: ${rel(file)}`);
  const content = fs.readFileSync(file, "utf8");
  const label = rel(file);
  if (containsSecretLikeValue(content)) fail(`${label} contains secret-like content`);
  for (const section of ["Human Summary", "Task And Runtime Binding", "Execution Actions", "Owned Resources", "Environment And Cleanup Policy", "Boundaries", "Evidence Authority", "Machine-Readable Evidence", "Outcome", "Next Step"]) {
    if (sectionBody(content, section)) pass(`${label} includes ${section}`);
    else fail(`${label} missing ${section}`);
  }
  const checked = validateEvidenceBlock(content, loadSchema(projectRoot, "schemas/artifacts/verification-runtime-lifecycle-plan.schema.json"), label, { require: true, digestField: "lifecycle_plan_digest" });
  if (!checked.ok) return checked.errors.forEach(fail);
  pass(`${label} has strict structured evidence and digest`);
  const plan = checked.value;
  if (new Set([rel(file), `artifact:${rel(file)}`, `file:${rel(file)}`]).has(plan.lifecycle_plan_ref)) pass(`${label} lifecycle_plan_ref points to this report`);
  else fail(`${label} lifecycle_plan_ref must point to this report`);

  const runtime = loadRuntimePlan(plan, file, label);
  const declaration = readLifecycleDeclaration(projectRoot);
  if (runtime) {
    const semantic = lifecyclePlanSemanticErrors(plan, runtime, declaration.status === "RECORDED" ? declaration : null, projectIdentity(projectRoot), projectRoot);
    if (semantic.length) semantic.forEach((error) => fail(`${label} ${error}`));
    else pass(`${label} runtime, declaration, actions, ownership, and boundaries are coherent`);
  }
  const sourceRefs = [plan.runtime_plan_ref, plan.declaration_source.ref].filter((ref) => /^(artifact|file):/.test(ref));
  const authority = validateEvidenceAuthorityBinding(projectRoot, plan.authority_binding, { taskRef: plan.task_ref, intentDigest: plan.intent_digest, sourceRefs, fromFile: file });
  if (authority.ok) pass(`${label} Evidence Authority is current`);
  else authority.errors.forEach((error) => fail(`${label} ${error}`));
  if (requireReady && plan.outcome !== "LIFECYCLE_PLAN_READY") fail(`${label} --require-ready requires LIFECYCLE_PLAN_READY`);
  const markdownOutcome = stripMarkdown(sectionBody(content, "Outcome") || "");
  if (markdownOutcome === plan.outcome) pass(`${label} Markdown outcome matches structured evidence`);
  else fail(`${label} Markdown outcome must match ${plan.outcome}`);
}

function loadRuntimePlan(plan, fromFile, label) {
  const resolved = resolveAuthoritativeEvidenceReference(projectRoot, fromFile, plan.runtime_plan_ref, { markdownOnly: true });
  if (!resolved.ok) { fail(`${label} Runtime Plan ref is unresolved: ${resolved.error}`); return null; }
  const checked = validateEvidenceBlock(fs.readFileSync(resolved.file, "utf8"), loadSchema(projectRoot, "schemas/artifacts/verification-runtime-plan.schema.json"), `${label} Runtime Plan`, { require: true, digestField: "runtime_plan_digest" });
  if (!checked.ok) { checked.errors.forEach(fail); return null; }
  if (checked.value.runtime_plan_digest !== plan.runtime_plan_digest) { fail(`${label} Runtime Plan digest mismatch`); return null; }
  const semantic = planSemanticErrors(checked.value);
  if (semantic.length) { semantic.forEach((error) => fail(`${label} Runtime Plan ${error}`)); return null; }
  pass(`${label} referenced Runtime Plan is valid`);
  return checked.value;
}

function reportPath(value) {
  if (!isSafeRelativePath(value) || !/^verification-runtime-lifecycle-plans\/[a-zA-Z0-9._/-]+\.md$/.test(value)) fatal("--report must stay under verification-runtime-lifecycle-plans/");
  const file = resolveUnderRoot(projectRoot, value, "lifecycle plan report");
  assertNoSymlinkInPath(projectRoot, file, "lifecycle plan report");
  return file;
}

function markdownFiles() {
  const dirs = [path.join(projectRoot, "verification-runtime-lifecycle-plans"), path.join(projectRoot, ".intentos", "verification-runtime-lifecycle-plans")];
  const dir = dirs.find((item) => fs.existsSync(item) && fs.lstatSync(item).isDirectory());
  return dir ? fs.readdirSync(dir).filter((name) => name.endsWith(".md")).sort().map((name) => path.join(dir, name)) : [];
}

function rel(file) { return path.relative(projectRoot, file).split(path.sep).join("/").replace(/^\.intentos\//, ""); }
function pass(message) { checks.push({ ok: true, message }); if (!outputJson) console.log(`PASS ${message}`); }
function fail(message) { failed = true; checks.push({ ok: false, message }); if (!outputJson) console.error(`FAIL ${message}`); }
function fatal(message) { console.error(`FAIL ${message}`); process.exit(1); }
function emit() { if (outputJson) process.stdout.write(`${JSON.stringify({ ok: !failed, checks }, null, 2)}\n`); process.exit(failed ? 1 : 0); }
