import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { evidenceDigest } from "../scripts/lib/artifact-schema.mjs";
import { canonicalFileDigest, createEvidenceAuthorityBinding } from "../scripts/lib/evidence-authority.mjs";
import {
  CONTROL_EFFECTIVENESS_DIMENSIONS,
  controlEffectivenessBinding,
  deriveControlEffectivenessRouting,
  validateBoundedControlAdapter,
  validateControlEffectivenessBinding,
  validateControlEffectivenessEvidence,
} from "../scripts/lib/control-effectiveness.mjs";
import { validatePlanReviewSourceEvidence } from "../scripts/lib/plan-review-binding.mjs";

const kitRoot = path.resolve(import.meta.dirname, "..");
const checker = path.join(kitRoot, "scripts", "check-control-effectiveness.mjs");

test("routing is conditional and keeps technical judgment away from the user", () => {
  const root = fixtureRoot();
  const low = deriveControlEffectivenessRouting({ projectRoot: root, intent: "update README wording", taskImpact: "LOW" });
  assert.equal(low.required, "No");
  assert.equal(low.technical_terms_required_from_user, "No");
  const strict = deriveControlEffectivenessRouting({ projectRoot: root, intent: "verify the release gate", taskImpact: "HIGH" });
  assert.equal(strict.required, "Yes");
  assert.ok(strict.control_candidates.length > 0);
  assert.equal(strict.technical_terms_required_from_user, "No");
});

test("exact effective proof passes strict checking", () => {
  const root = fixtureRoot();
  const { file } = writeReport(root);
  const result = spawnSync(process.execPath, [checker, root, "--report", "control-effectiveness-reports/task.md", "--require-effective"], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /required claims are proven effective/);
  assert.ok(fs.existsSync(file));
});

test("PASS-like evidence cannot hide semantic mismatch or missing failure capability", () => {
  const root = fixtureRoot();
  const mismatched = writeReport(root, (evidence) => {
    evidence.control_claims[0].semantic_assessment.match = "MISMATCH";
    evidence.control_claims[0].claim_digest = evidenceDigest(evidence.control_claims[0], ["claim_digest"]);
  });
  let result = spawnSync(process.execPath, [checker, root, "--report", path.relative(root, mismatched.file), "--require-effective"], { encoding: "utf8" });
  assert.notEqual(result.status, 0);
  assert.match(result.stdout, /cannot be effective/);

  const missingFailure = writeReport(root, (evidence) => {
    evidence.control_claims[0].failure_proof.state = "NOT_PROVEN";
    evidence.control_claims[0].claim_digest = evidenceDigest(evidence.control_claims[0], ["claim_digest"]);
  }, "missing-failure.md");
  result = spawnSync(process.execPath, [checker, root, "--report", path.relative(root, missingFailure.file), "--require-effective"], { encoding: "utf8" });
  assert.notEqual(result.status, 0);
  assert.match(result.stdout, /cannot be effective/);
});

test("changed implementation and copied-project evidence fail closed", () => {
  const root = fixtureRoot();
  const { file } = writeReport(root);
  fs.appendFileSync(path.join(root, "scripts", "gate.mjs"), "\n// changed\n");
  let result = spawnSync(process.execPath, [checker, root, "--report", "control-effectiveness-reports/task.md", "--require-effective"], { encoding: "utf8" });
  assert.notEqual(result.status, 0);
  assert.match(result.stdout, /implementation digest is stale|project identity or revision/);

  const source = fixtureRoot();
  const report = writeReport(source);
  const copied = fixtureRoot();
  fs.copyFileSync(report.file, path.join(copied, "control-effectiveness-reports", "task.md"));
  result = spawnSync(process.execPath, [checker, copied, "--report", "control-effectiveness-reports/task.md", "--require-effective"], { encoding: "utf8" });
  assert.notEqual(result.status, 0);
  assert.match(result.stdout, /project identity or revision|raw file digest/);
});

test("bounded adapters reject shell, network, secrets, and unsafe cleanup", () => {
  const safe = adapter();
  assert.equal(validateBoundedControlAdapter(safe).ok, true);
  for (const mutation of [
    (value) => { value.executable = "/bin/sh"; },
    (value) => { value.arguments = ["test", "&&", "rm"]; },
    (value) => { value.network_required = "Yes"; },
    (value) => { value.secrets_required = "Yes"; },
    (value) => { value.cleanup_required = "Yes"; value.cleanup_owner = ""; },
  ]) {
    const value = structuredClone(safe);
    mutation(value);
    assert.equal(validateBoundedControlAdapter(value).ok, false);
  }
});

test("blocked bindings are valid only as explicit non-ready evidence", () => {
  const root = fixtureRoot();
  const blocked = controlEffectivenessBinding({
    required: true,
    reason: "No current task evidence exists yet.",
  });
  assert.equal(validateControlEffectivenessBinding(root, blocked, { required: true }).ok, false);
  assert.equal(validateControlEffectivenessBinding(root, blocked, { required: true, allowBlocked: true }).ok, true);

  const forgedEffective = {
    ...blocked,
    assessment_outcome: "CONTROL_PROVEN_EFFECTIVE",
  };
  assert.equal(validateControlEffectivenessBinding(root, forgedEffective, { required: true, allowBlocked: true }).ok, false);

  const partialReference = {
    ...blocked,
    report_ref: "artifact:control-effectiveness-reports/missing.md",
  };
  assert.equal(validateControlEffectivenessBinding(root, partialReference, { required: true, allowBlocked: true }).ok, false);
});

test("Plan Review accepts digest-only Control Effectiveness identity without weakening task binding", () => {
  const root = fixtureRoot();
  const report = writeReport(root);
  const planReviewDir = path.join(root, "plan-review-reports");
  fs.mkdirSync(planReviewDir, { recursive: true });
  const planReviewFile = path.join(planReviewDir, "blocked.md");
  fs.writeFileSync(planReviewFile, "# Blocked Plan Review\n");
  const intent = "verify quality gate";
  const base = {
    schema_version: "1.113.0",
    plan_review_state: "BLOCKED_BY_INCOMPLETE_REVIEW",
    plan_ref: "N/A",
    task_ref: report.evidence.task_ref,
    intent,
    intent_digest: sha(intent),
    task_governance: { ref: "N/A", digest: "N/A", current_task_match: "Unknown" },
    source_chain: [{
      source_kind: "control_effectiveness",
      source_ref: "artifact:control-effectiveness-reports/task.md",
      source_digest: report.evidence.report_digest,
      source_state: "CONTROL_PROVEN_EFFECTIVE",
      current_task_match: "Yes",
    }],
  };

  const valid = validatePlanReviewSourceEvidence(root, planReviewFile, base);
  assert.doesNotMatch(valid.errors.join("\n"), /source_chain\.control_effectiveness intent text/);
  assert.doesNotMatch(valid.errors.join("\n"), /source_chain\.control_effectiveness intent digest/);

  const wrongIntent = structuredClone(base);
  wrongIntent.intent_digest = sha("another task");
  const rejected = validatePlanReviewSourceEvidence(root, planReviewFile, wrongIntent);
  assert.match(rejected.errors.join("\n"), /source_chain\.control_effectiveness intent digest/);
});

function fixtureRoot() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-control-effectiveness-"));
  fs.mkdirSync(path.join(root, "scripts"), { recursive: true });
  fs.mkdirSync(path.join(root, "evidence"), { recursive: true });
  fs.mkdirSync(path.join(root, "control-effectiveness-reports"), { recursive: true });
  fs.writeFileSync(path.join(root, "package.json"), `${JSON.stringify({ scripts: { "gate:quality": "node scripts/gate.mjs" } }, null, 2)}\n`);
  fs.writeFileSync(path.join(root, "scripts", "gate.mjs"), "process.exit(process.argv.includes('--bad') ? 1 : 0);\n");
  fs.writeFileSync(path.join(root, "evidence", "inventory.json"), `${JSON.stringify({ files: ["scripts/gate.mjs"] })}\n`);
  fs.writeFileSync(path.join(root, "evidence", "positive.txt"), "exit=0; assertion=quality-policy-conformance\n");
  fs.writeFileSync(path.join(root, "evidence", "negative.txt"), "fixture=bad; exit=1; cleanup=verified\n");
  return root;
}

function writeReport(root, mutate = null, name = "task.md") {
  const reportFile = path.join(root, "control-effectiveness-reports", name);
  const implementationRef = "file:scripts/gate.mjs";
  const inventoryRef = "file:evidence/inventory.json";
  const positiveRef = "file:evidence/positive.txt";
  const negativeRef = "file:evidence/negative.txt";
  const taskRef = "task:quality-gate";
  const intentDigest = sha("verify quality gate");
  const claimBase = {
    claim_id: "claim:quality-gate",
    claim_digest: "",
    control_id: "package-script:gate:quality",
    origin: "PROJECT_NATIVE",
    summary: "The quality gate blocks the recorded policy violation.",
    category: "POLICY_OR_SCHEMA_CONFORMANCE",
    enforcement_level: "BLOCKING",
    protected_surface: "quality policy",
    implementation_bindings: [
      { ref: implementationRef, digest: canonicalFileDigest(path.join(root, "scripts/gate.mjs")), role: "IMPLEMENTATION" },
      { ref: "file:package.json", digest: canonicalFileDigest(path.join(root, "package.json")), role: "CONSUMER" },
    ],
    semantic_assessment: {
      declared_assertion: "The gate rejects the bad policy fixture.",
      observed_assertion: "The bad policy fixture exits non-zero and the valid fixture exits zero.",
      match: "MATCH",
      evidence_refs: [positiveRef, negativeRef],
    },
    scope_assessment: {
      declared_inventory_ref: inventoryRef,
      declared_inventory_digest: canonicalFileDigest(path.join(root, "evidence/inventory.json")),
      observed_inventory_ref: inventoryRef,
      observed_inventory_digest: canonicalFileDigest(path.join(root, "evidence/inventory.json")),
      included_items: ["scripts/gate.mjs"],
      exclusions: [],
      completeness: "COMPLETE",
    },
    freshness_assessment: {
      revision: "current-project-identity",
      environment: "isolated-fixture",
      run_id: "run:quality-gate:1",
      observed_at: "2026-07-15T00:00:00.000Z",
      valid_until: "until source or inventory changes",
      status: "CURRENT",
    },
    failure_proof: {
      required: "Yes",
      state: "PROVEN",
      evidence_ref: negativeRef,
      output_digest: canonicalFileDigest(path.join(root, "evidence/negative.txt")),
      safe: "Yes",
      cleanup_proven: "Yes",
    },
    dynamic_assessment: {
      required: "No",
      state: "NOT_REQUIRED",
      evidence_ref: positiveRef,
      output_digest: canonicalFileDigest(path.join(root, "evidence/positive.txt")),
      exit_code: 0,
      adapter: adapter(),
    },
    effectiveness_dimensions: CONTROL_EFFECTIVENESS_DIMENSIONS.map((dimension) => ({
      dimension,
      state: "PROVEN",
      reason: `${dimension} is bound by the current fixture evidence.`,
      evidence_refs: [implementationRef, inventoryRef, positiveRef, negativeRef],
    })),
    consumers: [
      { consumer_id: "package-script:gate:quality", claim_use: "Blocks completion when the fixture violates the policy.", strict_reliance: "Yes" },
    ],
    state: "CONTROL_PROVEN_EFFECTIVE",
    reason_codes: [],
    limitations: ["Proof is bounded to the recorded quality-policy fixture and current project identity."],
  };
  const claim = { ...claimBase, claim_digest: evidenceDigest(claimBase, ["claim_digest"]) };
  const evidenceBase = {
    schema_version: "1.110.0",
    artifact_type: "control_effectiveness",
    assessment_id: "assessment:quality-gate",
    assessment_purpose: "TASK",
    report_ref: `control-effectiveness-reports/${name}`,
    report_digest: "",
    task_ref: taskRef,
    intent_digest: intentDigest,
    required_claim_ids: [claim.claim_id],
    control_claims: [claim],
    authority_binding: createEvidenceAuthorityBinding(root, {
      taskRef,
      intentDigest,
      sourceRefs: [implementationRef, "file:package.json", inventoryRef, positiveRef, negativeRef],
      fromFile: reportFile,
    }),
    limitations: ["The report proves one bounded claim, not product correctness."],
    boundaries: {
      assessment_is_read_only: "Yes",
      authorizes_implementation: "No",
      authorizes_writes: "No",
      authorizes_release: "No",
      authorizes_production: "No",
      proves_product_correctness: "No",
    },
    outcome: "CONTROL_PROVEN_EFFECTIVE",
  };
  if (mutate) mutate(evidenceBase);
  evidenceBase.report_digest = evidenceDigest(evidenceBase, ["report_digest"]);
  const direct = validateControlEffectivenessEvidence(root, reportFile, evidenceBase, { taskRef, intentDigest, requiredClaimIds: [claim.claim_id] });
  if (!mutate) assert.equal(direct.ok, true, direct.errors.join("\n"));
  fs.writeFileSync(reportFile, markdown(evidenceBase));
  return { file: reportFile, evidence: evidenceBase };
}

function adapter() {
  return {
    adapter_id: "node-fixture",
    executable: process.execPath,
    arguments: ["scripts/gate.mjs", "--bad"],
    working_directory: ".",
    environment_allowlist: ["PATH"],
    timeout_ms: 5000,
    expected_exit_codes: [0, 1],
    declared_effects: ["temporary fixture output only"],
    network_required: "No",
    secrets_required: "No",
    production_prohibited: "Yes",
    cleanup_required: "Yes",
    cleanup_owner: "run:quality-gate:1",
  };
}

function markdown(evidence) {
  return `# Control Effectiveness Report

This report does not authorize implementation, writes, CI or hook changes,
adoption apply, release, production, or completion. It does not prove product
or business correctness.

## Human Summary

The exact quality gate claim is bounded and proven by current positive and negative fixtures.

## Assessment Purpose

Task proof.

## Control Claims

One bounded claim.

## Scope And Exclusions

Current inventory is complete.

## Semantic And Failure Proof

The bad fixture fails and the positive fixture passes.

## Evidence Identity And Freshness

Current project, task, intent, source, and output are bound.

## Dynamic Assessment Safety

The recorded direct-process adapter is isolated and cleanup-owned.

## Dependent Consumers

The quality gate consumer relies on this bounded claim.

## Limitations

This does not prove product correctness.

## Boundaries

Read-only and non-authorizing.

## Machine-Readable Evidence

\`\`\`json
${JSON.stringify(evidence, null, 2)}
\`\`\`

## Outcome

\`${evidence.outcome}\`
`;
}

function sha(value) {
  return `sha256:${crypto.createHash("sha256").update(value).digest("hex")}`;
}
