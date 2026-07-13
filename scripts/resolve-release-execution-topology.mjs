#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { discoverReleaseTopology } from "./lib/release-execution-topology.mjs";
import { assertNoSymlinkInPath, isSafeRelativePath } from "./lib/path-safety.mjs";

const args = parseArgs(process.argv.slice(2));
const unknown = unknownOptions(args, new Set(["intent", "json", "out"]));
if (unknown.length) fail(`unknown option: --${unknown.join(", --")}`);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const out = String(args.out || "");
if (out && (!isSafeRelativePath(out) || !out.startsWith("release-execution-topologies/") || !out.endsWith(".md"))) {
  fail("--out must be a safe path under release-execution-topologies/*.md");
}
const topology = discoverReleaseTopology(projectRoot, {
  intent: args.intent,
  topologyRef: out || "release-execution-topologies/generated.md",
});
if (args.json) {
  console.log(JSON.stringify(topology, null, 2));
  process.exit(0);
}
const report = render(topology);
if (out) {
  const target = path.resolve(projectRoot, out);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  assertNoSymlinkInPath(projectRoot, target, "topology report output");
  fs.writeFileSync(target, report);
}
console.log(report);

function render(value) {
  const planeRows = Object.entries(value.planes).map(([name, item]) => `| ${name} | ${item.type} / ${item.identity_ref} | ${item.confidence} | ${item.evidence_ref} |`).join("\n");
  const capabilities = value.mandatory_capabilities.map((item) => `| ${item.id} | ${item.required} | ${item.satisfied} | ${item.evidence_ref} |`).join("\n");
  const sources = value.source_chain.map((item) => `| ${item.plane} | ${item.ref} | ${item.digest} | ${item.confidence} |`).join("\n");
  return `# Release Execution Topology Report

## Human Summary

| Field | Value |
| --- | --- |
| Current topology | Six independent release planes were inspected. |
| Recommendation | ${value.recommendation.plain_summary} |
| Missing fact or capability | ${value.outcome === "RELEASE_TOPOLOGY_RECORDED" ? "none" : "See topology and capability tables."} |
| User action now | ${value.recommendation.user_input_class} |

## Six-Plane Topology

| Plane | Type / Identity | Confidence | Evidence |
| --- | --- | --- | --- |
${planeRows}

## Mandatory Capabilities

| Capability | Required | Satisfied | Evidence |
| --- | --- | --- | --- |
${capabilities}

## Conflicts And Alternatives

${value.conflicts.length ? value.conflicts.map((item) => `- ${item}`).join("\n") : "- none"}

## Source Chain

| Plane | Ref | Digest | Confidence |
| --- | --- | --- | --- |
${sources}

## Boundaries

- This report writes project files: No
- This report approves implementation: No
- This report approves release or production: No
- This report executes release or cutover: No
- This report moves secrets or provider state: No
- This report treats embedded consent as authority: No

## Machine-Readable Evidence

\`\`\`json
${JSON.stringify(value, null, 2)}
\`\`\`

## Outcome

\`${value.outcome}\`
`;
}

function fail(message) {
  console.error(`FAIL ${message}`);
  process.exit(1);
}
