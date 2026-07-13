#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { assertNoSymlinkInPath, isSafeRelativePath } from "./lib/path-safety.mjs";
import { buildReleaseTopologyMigration } from "./lib/release-topology-migration.mjs";

const args = parseArgs(process.argv.slice(2));
const known = new Set(["intent", "stage", "topology-ref", "target-candidate-id", "target-summary", "out", "json"]);
const unknown = unknownOptions(args, known);
if (unknown.length) fail(`unknown option: --${unknown.join(", --")}`);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const out = String(args.out || "");
if (out && (!isSafeRelativePath(out) || !out.startsWith("release-topology-migrations/") || !out.endsWith(".md"))) fail("--out must be a safe path under release-topology-migrations/*.md");
let value;
try {
  value = buildReleaseTopologyMigration(projectRoot, {
    intent: args.intent,
    stage: args.stage,
    topologyRef: args["topology-ref"],
    targetCandidateId: args["target-candidate-id"],
    targetSummary: args["target-summary"],
    migrationRef: out || "release-topology-migrations/generated.md",
  });
} catch (error) { fail(error.message); }
if (args.json) console.log(JSON.stringify(value, null, 2));
else {
  const report = render(value);
  if (out) {
    const target = path.resolve(projectRoot, out);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    assertNoSymlinkInPath(projectRoot, target, "release topology migration output");
    fs.writeFileSync(target, report);
  }
  console.log(report);
}

function render(value) {
  const dependencies = value.dependency_map.map((item) => `| ${item.plane} | ${item.current_identity_ref} | ${item.target_identity_ref} | ${item.change_kind} |`).join("\n");
  return `# Release Topology Migration Report

## Human Summary

| Field | Value |
| --- | --- |
| Current stage | ${value.stage} |
| Recommendation | ${value.recommendation.plain_summary} |
| User action now | ${value.recommendation.user_input_class} |
| Next safe step | ${value.recommendation.next_step} |

## Dependency Map

| Plane | Current | Target | Change |
| --- | --- | --- | --- |
${dependencies}

## Apply, Rehearsal, Cutover And Retirement

- Apply evidence: ${value.apply_chain.apply_plan.ref}
- Rehearsal: ${value.rehearsal.status} / ${value.rehearsal.environment}
- Cutover: ${value.cutover.readiness_status}
- Post-cutover: ${value.post_cutover.status}
- Retirement: ${value.retirement.status}

## Boundaries

This report is read-only and non-authorizing. It does not write project files,
execute rehearsal or cutover, approve release, move secrets, or retire a backend.

## Machine-Readable Evidence

\`\`\`json
${JSON.stringify(value, null, 2)}
\`\`\`

## Outcome

\`${value.outcome}\`
`;
}
function fail(message) { console.error(`FAIL ${message}`); process.exit(1); }
