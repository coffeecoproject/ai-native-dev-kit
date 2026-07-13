#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { loadSchema, validateEvidenceBlock } from "./lib/artifact-schema.mjs";
import { canonicalFileDigest, projectIdentity, resolveAuthoritativeEvidenceReference } from "./lib/evidence-authority.mjs";
import { assertNoSymlinkInPath, isSafeRelativePath } from "./lib/path-safety.mjs";
import { containsSecretLikeValue } from "./lib/risk-surfaces.mjs";
import { PLANE_NAMES, topologyDigest } from "./lib/release-execution-topology.mjs";

const args = parseArgs(process.argv.slice(2));
const known = new Set(["allow-empty", "report", "require-report", "require-structured-evidence", "require-current-project", "require-ready", "json"]);
const unknown = unknownOptions(args, known);
if (unknown.length) failNow(`unknown option: --${unknown.join(", --")}`);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const reportRef = String(args.report || "");
if (reportRef && (!isSafeRelativePath(reportRef) || !reportRef.startsWith("release-execution-topologies/") || !reportRef.endsWith(".md"))) {
  failNow("--report must be a safe path under release-execution-topologies/*.md");
}
const report = reportRef ? path.resolve(projectRoot, reportRef) : "";
const schema = loadSchema(projectRoot, "schemas/artifacts/release-execution-topology.schema.json");
const requireStructured = Boolean(args["require-structured-evidence"] || args["require-ready"]);
const files = report ? [report] : markdownFiles(path.join(projectRoot, "release-execution-topologies"));
const checks = [];
let failed = false;

if (!files.length) {
  if (args["allow-empty"] && !requireStructured && !args["require-report"]) pass("topology check skipped by explicit --allow-empty");
  else if (requireStructured || args["require-report"]) fail("Release Execution Topology report is required");
  else pass("SKIPPED_NO_REPORT: no Release Execution Topology reports found");
  emit();
}
for (const file of files) checkFile(file);
emit();

function checkFile(file) {
  if (!fs.existsSync(file)) return fail(`missing topology report ${file}`);
  try { assertNoSymlinkInPath(projectRoot, file, "topology report"); }
  catch (error) { return fail(error.message); }
  const content = fs.readFileSync(file, "utf8");
  const label = path.relative(projectRoot, file).split(path.sep).join("/");
  if (containsSecretLikeValue(content)) fail(`${label} contains secret-like content`);
  const result = validateEvidenceBlock(content, schema, label, { require: requireStructured, digestField: "topology_digest" });
  if (!result.ok) return result.errors.forEach(fail);
  if (!result.present) return pass(`${label} has no structured evidence and is compatibility-only`);
  const value = result.value;
  pass(`${label} has valid strict topology evidence`);
  if (topologyDigest(value) === value.topology_digest) pass(`${label} topology digest matches canonical content`);
  else fail(`${label} topology digest mismatch`);
  if ([label, `file:${label}`, `artifact:${label}`].includes(value.topology_ref)) pass(`${label} topology_ref points to this report`);
  else fail(`${label} topology_ref must point to this report`);
  for (const name of PLANE_NAMES) {
    if (value.planes?.[name]) pass(`${label} includes ${name}`);
    else fail(`${label} missing topology plane ${name}`);
  }
  const ready = ["KEEP_CURRENT_TOPOLOGY", "RECOMMEND_BOUNDED_MIGRATION", "RECOMMEND_PROVIDER_ADAPTER"].includes(value.recommendation?.state);
  const criticalUnknown = ["orchestration", "execution_backend", "package_transport", "evidence_store", "production_target"]
    .filter((name) => ["INFERRED", "UNKNOWN"].includes(value.planes?.[name]?.confidence));
  const missing = (value.mandatory_capabilities || []).filter((item) => item.required === "Yes" && item.satisfied !== "Yes");
  if (ready && criticalUnknown.length) fail(`${label} ready recommendation has inferred or unknown critical planes: ${criticalUnknown.join(", ")}`);
  if (ready && missing.length) fail(`${label} ready recommendation misses mandatory capabilities: ${missing.map((item) => item.id).join(", ")}`);
  if (args["require-ready"] && !ready) fail(`${label} is not ready for a technical recommendation`);
  if (args["require-current-project"]) {
    try {
      if (JSON.stringify(value.project_identity) === JSON.stringify(projectIdentity(projectRoot))) pass(`${label} matches current project identity and revision`);
      else fail(`${label} project identity or revision is stale or copied`);
    } catch (error) { fail(`${label} project identity cannot be established: ${error.message}`); }
  }
  for (const source of value.source_chain || []) {
    if (["missing", "not_available", "not_applicable"].includes(source.ref)) continue;
    const resolved = resolveAuthoritativeEvidenceReference(projectRoot, file, source.ref);
    if (!resolved.ok) fail(`${label} source ${source.ref} is unsafe or unresolved`);
    else if (canonicalFileDigest(resolved.file) === source.digest) pass(`${label} source ${source.ref} digest matches`);
    else fail(`${label} source ${source.ref} digest mismatch`);
  }
  if (value.legacy_compatibility?.can_establish_readiness !== "No") fail(`${label} legacy policy must not establish topology readiness`);
  const text = value.recommendation?.plain_summary || "";
  if (/choose|select|confirm.*(runner|orchestrator|backend|transport|store|protocol)/i.test(text)) fail(`${label} asks the user to choose technical topology`);
}

function markdownFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && !entry.isSymbolicLink() && entry.name.endsWith(".md"))
    .map((entry) => entry.name).sort().map((name) => path.join(dir, name));
}
function pass(message) { checks.push({ ok: true, message }); if (!args.json) console.log(`PASS ${message}`); }
function fail(message) { failed = true; checks.push({ ok: false, message }); if (!args.json) console.error(`FAIL ${message}`); }
function failNow(message) { console.error(`FAIL ${message}`); process.exit(1); }
function emit() {
  if (args.json) console.log(JSON.stringify({ ok: !failed, checks }, null, 2));
  process.exit(failed ? 1 : 0);
}
