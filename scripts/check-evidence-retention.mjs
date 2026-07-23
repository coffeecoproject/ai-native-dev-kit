#!/usr/bin/env node

import path from "node:path";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { inspectEvidenceRetention, loadEvidenceRetentionPolicy } from "./lib/evidence-retention.mjs";

const args = parseArgs(process.argv.slice(2));
const unknown = unknownOptions(args, new Set(["policy", "strict", "json"]));
if (unknown.length) fail(`unknown option: --${unknown.join(", --")}`);

const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const loaded = loadEvidenceRetentionPolicy(projectRoot, String(args.policy || ".intentos/evidence-retention-policy.json"));
if (!loaded.ok) fail(loaded.errors.join("; "));
const result = inspectEvidenceRetention(projectRoot, loaded.policy);

if (args.json) process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
else {
  for (const item of result.observations) console.log(`PASS task ${item.task_number} retains ${item.raw_evidence_files} raw evidence files totaling ${item.raw_evidence_bytes} bytes`);
  for (const item of result.violations) console.error(`FAIL ${item.code} ${item.path}: ${item.reason}`);
  if (result.ok) console.log(`PASS evidence retention policy ${result.policy_id} is satisfied`);
}

process.exit(result.ok ? 0 : 2);

function fail(message) {
  console.error(`FAIL ${message}`);
  process.exit(1);
}
