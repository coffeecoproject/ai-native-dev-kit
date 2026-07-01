#!/usr/bin/env node

import path from "node:path";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { evidenceDigest } from "./lib/artifact-schema.mjs";
import { analyzeRiskSurfaces } from "./lib/risk-surfaces.mjs";

const args = parseArgs(process.argv.slice(2));
const unknown = unknownOptions(args, new Set(["json", "intent", "path", "type"]));
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const intent = String(args.intent || args._.slice(1).join(" ") || "small local change").trim();
const candidateType = String(args.type || inferType(intent)).trim();
const targetPaths = normalizePaths(args.path || defaultPath(candidateType));
const risk = analyzeRiskSurfaces({
  intent,
  paths: targetPaths,
  projectRoot,
  includeProjectSignals: true,
});

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

const record = buildRecord();
if (args.json) console.log(JSON.stringify(record, null, 2));
else printRecord(record);

function buildRecord() {
  return {
    reportType: "LOW_RISK_CONTROLLED_APPLY_CANDIDATE",
    generatedBy: "scripts/resolve-low-risk-apply-candidate.mjs",
    projectRoot,
    readOnly: true,
    intent,
    candidateType,
    targetPaths,
    lowRisk: !risk.high,
    riskReasons: risk.reasons,
    riskSurfaces: risk.surfaces,
    pathFindings: risk.pathFindings,
    outcome: risk.high ? "NOT_READY" : "LOW_RISK_APPLY_CANDIDATE_RECORDED",
    machineReadableEvidence: buildMachineReadableEvidence(risk.high ? "NOT_READY" : "LOW_RISK_APPLY_CANDIDATE_RECORDED"),
  };
}

function normalizePaths(value) {
  const values = Array.isArray(value) ? value : [value];
  return values.flatMap((item) => String(item || "").split(",")).map((item) => item.trim()).filter(Boolean);
}

function defaultPath(type) {
  if (/doc/i.test(type)) return "docs/example.md";
  if (/test/i.test(type)) return "tests/example.test.js";
  return "src/example.js";
}

function inferType(value) {
  if (/doc|文档|readme/i.test(value)) return "documentation";
  if (/test|测试/i.test(value)) return "test-only";
  if (/demo|样例|example/i.test(value)) return "local demo";
  return "config-free code";
}

function buildMachineReadableEvidence(outcome) {
  const evidence = {
    schema_version: "1.46.0",
    artifact_type: "low_risk_apply_candidate",
    artifact_id: candidateId(intent, targetPaths),
    candidate_digest: "",
    intent,
    candidate_type: candidateType,
    target_paths: targetPaths,
    risk_level: risk.high ? "HIGH" : "LOW",
    risk_surfaces: risk.surfaces,
    risk_reasons: risk.reasons,
    path_safety: {
      safe: risk.pathFindings.length === 0,
      findings: risk.pathFindings,
    },
    verification: [
      {
        method: "Run the smallest relevant local check after a separately approved apply.",
        evidence_path: "final report or command output after approved apply",
        owner: "Codex after human approval",
      },
    ],
    rollback: {
      required: true,
      method: "Revert only the exact target paths listed in this candidate.",
      target_paths: targetPaths,
    },
    authority: {
      writes_now: false,
      authorizes_apply: false,
      approves_implementation: false,
      approves_release_or_production: false,
      modifies_ci_or_hooks_now: false,
      touches_payment_secrets_production_migration_data_or_permissions: false,
    },
    outcome,
  };
  return {
    ...evidence,
    candidate_digest: evidenceDigest(evidence, ["candidate_digest"]),
  };
}

function candidateId(value, paths) {
  const seed = `${value}-${paths.join("-")}`.toLowerCase();
  const slug = seed
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64)
    .replace(/^-+|-+$/g, "");
  return slug || "candidate";
}

function printRecord(record) {
  console.log("# Low-Risk Controlled Apply Candidate");
  console.log("");
  console.log("## Human Summary");
  console.log("");
  if (record.lowRisk) {
    console.log(`This looks like a small candidate: ${record.intent}. It can be reviewed for a later human-approved apply plan, but it does not change files now.`);
  } else {
    console.log(`This is not ready as a low-risk candidate: ${record.intent}. It needs review before any apply planning.`);
  }
  console.log("");
  console.log("## Candidate Scope");
  console.log("");
  console.log("| Field | Value |");
  console.log("|---|---|");
  console.log(`| Candidate type | ${record.candidateType} |`);
  console.log(`| Exact target paths | ${record.targetPaths.map((item) => `\`${item}\``).join(", ")} |`);
  console.log(`| Why this is low risk | ${record.lowRisk ? "Small, local, reversible, and avoids high-risk surfaces." : record.riskReasons.join("; ")} |`);
  console.log("| Human decision needed | Yes |");
  console.log("");
  console.log("## Required Evidence");
  console.log("");
  console.log("| Evidence | Status | Notes |");
  console.log("|---|---|---|");
  console.log("| First-slice scope | Required | Link or create before apply planning. |");
  console.log("| Verification plan | Required | Use the smallest relevant local check. |");
  console.log("| Rollback path | Required | Revert only exact target paths. |");
  console.log("");
  console.log("## Allowed Actions");
  console.log("");
  console.log("- Ask the human whether to prepare a separate apply plan.");
  console.log("- Prepare a separate apply plan only after the human agrees.");
  console.log("");
  console.log("## Forbidden Actions");
  console.log("");
  console.log("- Do not write target files from this candidate.");
  console.log("- Do not apply changes automatically.");
  console.log("- Do not change CI or hooks.");
  console.log("- Do not touch payment, secrets, production, migration, data, or permissions.");
  console.log("");
  console.log("## Verification And Rollback");
  console.log("");
  console.log("Verification:");
  console.log("");
  console.log("- Run the smallest relevant local check after a separately approved apply.");
  console.log("");
  console.log("Rollback:");
  console.log("");
  console.log(`- Revert only these exact paths: ${record.targetPaths.map((item) => `\`${item}\``).join(", ")}.`);
  console.log("");
  console.log("## Boundaries");
  console.log("");
  console.log("- This candidate writes files now: No");
  console.log("- This candidate authorizes apply: No");
  console.log("- This candidate approves implementation: No");
  console.log("- This candidate approves release or production: No");
  console.log("- This candidate changes CI or hooks: No");
  console.log("- This candidate touches payment, secrets, production, migration, data, or permissions: No");
  console.log("");
  console.log("## Machine-Readable Evidence");
  console.log("");
  console.log("```json");
  console.log(JSON.stringify(record.machineReadableEvidence, null, 2));
  console.log("```");
  console.log("");
  console.log("## Outcome");
  console.log("");
  console.log(`\`${record.outcome}\``);
}
