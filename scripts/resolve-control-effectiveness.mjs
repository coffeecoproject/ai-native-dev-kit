#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { evidenceDigest } from "./lib/artifact-schema.mjs";
import { canonicalFileDigest, createEvidenceAuthorityBinding } from "./lib/evidence-authority.mjs";
import {
  CONTROL_EFFECTIVENESS_DIMENSIONS,
  deriveControlEffectivenessRouting,
  discoverReliedControls,
} from "./lib/control-effectiveness.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set([
  "json", "intent", "task-ref", "purpose", "control-ref", "claim", "category",
  "enforcement", "protected-surface", "consumer", "out",
]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = canonicalRoot(path.resolve(process.cwd(), args._[0] || "."));
const intent = String(args.intent || args._.slice(1).join(" ") || "assess relied-on project control").trim();
const taskRef = String(args["task-ref"] || `task:${slug(intent)}`);
const intentDigest = digest(intent);
const purpose = String(args.purpose || "TASK").toUpperCase();
const outputPath = args.out ? safeOutputPath(String(args.out)) : "";

if (unknown.length > 0) abort(`unknown option: --${unknown.join(", --")}`);
if (!["ADOPTION", "TASK", "VERIFICATION", "RELEASE_READINESS", "COMPLETION"].includes(purpose)) abort("--purpose is invalid");
if (args.out && !outputPath) abort("--out must be a project-relative control-effectiveness-reports/*.md path");

const report = buildReport();
const output = args.json ? `${JSON.stringify(report, null, 2)}\n` : renderMarkdown(report);
if (outputPath) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, output);
}
process.stdout.write(output);

function buildReport() {
  const discovered = discoverReliedControls(projectRoot, intent);
  const selected = selectControl(discovered);
  const routing = deriveControlEffectivenessRouting({ projectRoot, intent, taskImpact: "POSSIBLE_HIGH" });
  if (!selected) {
    return {
      reportType: "CONTROL_EFFECTIVENESS_CANDIDATE",
      schemaVersion: "1.110.0",
      generatedAt: new Date().toISOString(),
      readOnly: true,
      routing,
      outcome: "TECHNICAL_INSPECTION_REQUIRED",
      plainSummary: "No exact project control implementation was resolved. Codex must continue technical inspection; no user decision is needed.",
    };
  }
  const implementationRef = selected.implementation_ref;
  const implementationFile = resolveLocalRef(implementationRef);
  const implementationDigest = canonicalFileDigest(implementationFile);
  const reportRef = outputPath
    ? path.relative(projectRoot, outputPath).split(path.sep).join("/")
    : "control-effectiveness-reports/generated.md";
  const now = new Date().toISOString();
  const claimBase = {
    claim_id: String(args.claim || selected.claim_id),
    claim_digest: "",
    control_id: selected.control_id,
    origin: selected.origin,
    summary: selected.summary,
    category: String(args.category || selected.category),
    enforcement_level: String(args.enforcement || "WARNING").toUpperCase(),
    protected_surface: String(args["protected-surface"] || selected.consumer),
    implementation_bindings: [
      { ref: implementationRef, digest: implementationDigest, role: "IMPLEMENTATION" },
    ],
    semantic_assessment: {
      declared_assertion: "The exact depended-on assertion still needs project evidence.",
      observed_assertion: "The implementation exists, but existence does not prove semantic enforcement.",
      match: "UNKNOWN",
      evidence_refs: [implementationRef],
    },
    scope_assessment: {
      declared_inventory_ref: implementationRef,
      declared_inventory_digest: implementationDigest,
      observed_inventory_ref: implementationRef,
      observed_inventory_digest: implementationDigest,
      included_items: [selected.consumer],
      exclusions: [],
      completeness: "UNKNOWN",
    },
    freshness_assessment: {
      revision: "current-project-identity",
      environment: "read-only-static-assessment",
      run_id: "not-executed",
      observed_at: now,
      valid_until: "until implementation, scope, configuration, consumer, or project identity changes",
      status: "IDENTITY_INCOMPLETE",
    },
    failure_proof: {
      required: "Yes",
      state: "NOT_PROVEN",
      evidence_ref: "N/A",
      output_digest: "N/A",
      safe: "N/A",
      cleanup_proven: "N/A",
    },
    dynamic_assessment: {
      required: "No",
      state: "NOT_REQUIRED",
      evidence_ref: "N/A",
      output_digest: "N/A",
      exit_code: 0,
      adapter: emptyAdapter(),
    },
    effectiveness_dimensions: CONTROL_EFFECTIVENESS_DIMENSIONS.map((dimension) => ({
      dimension,
      state: dimension === "IMPLEMENTATION_IDENTITY" ? "PROVEN" : "NOT_PROVEN",
      reason: dimension === "IMPLEMENTATION_IDENTITY"
        ? "The exact current implementation file and digest resolve."
        : "This dimension requires bounded current evidence before strict reliance.",
      evidence_refs: [implementationRef],
    })),
    consumers: [
      {
        consumer_id: String(args.consumer || selected.consumer),
        claim_use: "Candidate strict reliance discovered from the current intent and project controls.",
        strict_reliance: "Yes",
      },
    ],
    state: "CONTROL_NOT_PROVEN",
    reason_codes: ["EVIDENCE_IDENTITY_INCOMPLETE", "FAILURE_CAPABILITY_UNPROVEN", "TECHNICAL_INVESTIGATION_REQUIRED"],
    limitations: ["Static discovery proves implementation identity only; it does not prove enforcement behavior."],
  };
  const claim = { ...claimBase, claim_digest: evidenceDigest(claimBase, ["claim_digest"]) };
  const sourceRefs = [implementationRef];
  const evidenceBase = {
    schema_version: "1.110.0",
    artifact_type: "control_effectiveness",
    assessment_id: `assessment:${slug(taskRef)}:${slug(claim.claim_id)}`,
    assessment_purpose: purpose,
    report_ref: reportRef,
    report_digest: "",
    task_ref: taskRef,
    intent_digest: intentDigest,
    required_claim_ids: [claim.claim_id],
    control_claims: [claim],
    authority_binding: createEvidenceAuthorityBinding(projectRoot, {
      taskRef,
      intentDigest,
      sourceRefs,
      fromFile: outputPath,
    }),
    limitations: ["This generated report is deliberately blocked until semantic, scope, freshness, failure, result, and safety proof is recorded."],
    boundaries: {
      assessment_is_read_only: "Yes",
      authorizes_implementation: "No",
      authorizes_writes: "No",
      authorizes_release: "No",
      authorizes_production: "No",
      proves_product_correctness: "No",
    },
    outcome: "CONTROL_NOT_PROVEN",
  };
  const evidence = { ...evidenceBase, report_digest: evidenceDigest(evidenceBase, ["report_digest"]) };
  return {
    reportType: "CONTROL_EFFECTIVENESS",
    schemaVersion: "1.110.0",
    generatedAt: now,
    generatedBy: "scripts/resolve-control-effectiveness.mjs",
    projectRoot,
    readOnly: true,
    plainSummary: "The control implementation was found, but its exact claim is not yet proven. Codex must finish technical evidence work before relying on it.",
    routing,
    structuredEvidence: evidence,
    outcome: evidence.outcome,
  };
}

function selectControl(discovered) {
  if (args["control-ref"]) {
    const normalized = normalizeRef(String(args["control-ref"]));
    const file = path.join(projectRoot, normalized);
    if (!safeRegularFile(file)) abort("--control-ref must resolve to a safe project-local regular file");
    return {
      control_id: `file:${normalized}`,
      claim_id: `claim:${slug(normalized)}`,
      origin: normalized.startsWith(".intentos/") ? "INTENTOS_NATIVE" : "PROJECT_NATIVE",
      implementation_ref: `file:${normalized}`,
      consumer: normalized,
      summary: `Project control implemented by ${normalized}`,
      category: "CUSTOM_PROJECT_OWNED_CLAIM",
    };
  }
  return discovered[0] || null;
}

function renderMarkdown(report) {
  if (!report.structuredEvidence) {
    return `# Control Effectiveness Assessment\n\n## Human Summary\n\n${report.plainSummary}\n\n## Outcome\n\n\`${report.outcome}\`\n`;
  }
  const evidence = report.structuredEvidence;
  return `# Control Effectiveness Report

This report does not authorize implementation, writes, CI or hook changes,
adoption apply, release, production, or completion. It does not prove product
or business correctness.

## Human Summary

${report.plainSummary}

## Assessment Purpose

\`${evidence.assessment_purpose}\` for \`${evidence.task_ref}\`.

## Control Claims

${evidence.control_claims.map((claim) => `- \`${claim.claim_id}\`: ${claim.summary} -> \`${claim.state}\``).join("\n")}

## Scope And Exclusions

The generated candidate records the current implementation as a starting
inventory. Scope remains unproven until project evidence establishes the full
protected inventory and exclusions.

## Semantic And Failure Proof

Semantic enforcement and safe representative failure capability remain
unproven. Implementation existence is not accepted as claim proof.

## Evidence Identity And Freshness

Evidence Authority binds the current project, task, intent, and implementation
file. Runtime and result identity remain incomplete.

## Dynamic Assessment Safety

No dynamic probe was executed by this read-only resolver.

## Dependent Consumers

${evidence.control_claims.flatMap((claim) => claim.consumers.map((consumer) => `- \`${consumer.consumer_id}\`: ${consumer.claim_use}`)).join("\n")}

## Limitations

${evidence.limitations.map((item) => `- ${item}`).join("\n")}

## Boundaries

The assessment is read-only and non-authorizing. Unified Closure remains the
only final task close-out truth.

## Machine-Readable Evidence

\`\`\`json
${JSON.stringify(evidence, null, 2)}
\`\`\`

## Outcome

\`${evidence.outcome}\`
`;
}

function emptyAdapter() {
  return {
    adapter_id: "not-required",
    executable: "N/A",
    arguments: [],
    working_directory: ".",
    environment_allowlist: [],
    timeout_ms: 1,
    expected_exit_codes: [0],
    declared_effects: [],
    network_required: "No",
    secrets_required: "No",
    production_prohibited: "Yes",
    cleanup_required: "No",
    cleanup_owner: "",
  };
}

function resolveLocalRef(ref) {
  const relative = normalizeRef(ref);
  const file = path.resolve(projectRoot, relative);
  if (!file.startsWith(`${projectRoot}${path.sep}`) || !safeRegularFile(file)) abort(`unsafe or unresolved control ref: ${ref}`);
  return file;
}

function safeOutputPath(value) {
  const normalized = value.replaceAll("\\", "/");
  if (!/^control-effectiveness-reports\/[a-zA-Z0-9._/-]+\.md$/.test(normalized) || normalized.split("/").includes("..")) return "";
  const file = path.resolve(projectRoot, normalized);
  return file.startsWith(`${projectRoot}${path.sep}`) ? file : "";
}

function canonicalRoot(root) {
  try {
    return fs.realpathSync(root);
  } catch {
    abort(`project root does not exist: ${root}`);
  }
}

function safeRegularFile(file) {
  try {
    const stat = fs.lstatSync(file);
    return stat.isFile() && !stat.isSymbolicLink();
  } catch {
    return false;
  }
}

function normalizeRef(value) {
  return String(value || "").replace(/^(?:artifact|file):/, "").replaceAll("\\", "/");
}

function digest(value) {
  return `sha256:${crypto.createHash("sha256").update(String(value)).digest("hex")}`;
}

function slug(value) {
  return String(value || "task").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "task";
}

function abort(message) {
  console.error(`FAIL ${message}`);
  process.exit(1);
}
