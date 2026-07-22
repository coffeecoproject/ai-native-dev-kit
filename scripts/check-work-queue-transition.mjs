#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { loadWorkQueueTransitions } from "./lib/work-queue-transition.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["require-report", "json"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const requireReport = Boolean(args["require-report"]);
const outputJson = Boolean(args.json);

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

const directory = path.join(projectRoot, "work-queue-transitions");
const reportCount = fs.existsSync(directory)
  ? fs.readdirSync(directory).filter((entry) => entry.endsWith(".md")).length
  : 0;
const loaded = loadWorkQueueTransitions(projectRoot);
const checks = [];
if (reportCount === 0 && requireReport) checks.push({ status: "FAIL", message: "no Work Queue State Transition report found" });
else if (reportCount === 0) checks.push({ status: "PASS", message: "SKIPPED_NO_REPORT: no Work Queue State Transition report found" });
else if (loaded.errors.length > 0) checks.push(...loaded.errors.map((message) => ({ status: "FAIL", message })));
else {
  checks.push({ status: "PASS", message: `${reportCount} Work Queue State Transition report(s) are valid` });
  checks.push({ status: "PASS", message: "transition chain is linear, append-only, and source-bound" });
  checks.push({ status: "PASS", message: "transition reports do not rewrite Work Queue snapshots or authorize implementation, commit, push, or release" });
}

if (outputJson) process.stdout.write(`${JSON.stringify({ reportCount, checks }, null, 2)}\n`);
else {
  console.log("# Work Queue State Transition Check\n");
  for (const check of checks) console.log(`${check.status} ${check.message}`);
}
process.exit(checks.some((check) => check.status === "FAIL") ? 1 : 0);
