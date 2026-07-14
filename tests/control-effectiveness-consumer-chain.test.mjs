import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { extractMachineReadableEvidence } from "../scripts/lib/artifact-schema.mjs";

const kitRoot = path.resolve(import.meta.dirname, "..");

test("strict control proof is propagated unchanged through verification, test, execution, and completion", () => {
  const root = fixtureRoot();
  run("scripts/resolve-verification-plan.mjs", [root, "--intent", "verify quality gate", "--out", "verification-plans/current.md"]);
  const verification = evidence(root, "verification-plans/current.md");
  assert.equal(verification.control_effectiveness_binding.requirement, "REQUIRED");
  assert.equal(verification.control_effectiveness_binding.status, "BLOCKED");

  run("scripts/resolve-test-evidence.mjs", [
    root,
    "--intent", "verify quality gate",
    "--verification-plan-ref", "artifact:verification-plans/current.md",
    "--out", "test-evidence-reports/current.md",
  ]);
  const testEvidence = evidence(root, "test-evidence-reports/current.md");
  assert.deepEqual(testEvidence.control_effectiveness_binding, verification.control_effectiveness_binding);
  assert.equal(testEvidence.test_evidence_state, "TEST_EVIDENCE_BLOCKED");

  run("scripts/resolve-execution-assurance.mjs", [
    root,
    "--intent", "verify quality gate",
    "--task", verification.task_ref,
    "--out", "execution-assurance-reports/current.md",
  ]);
  const execution = evidence(root, "execution-assurance-reports/current.md");
  assert.deepEqual(execution.control_effectiveness_binding, verification.control_effectiveness_binding);
  assert.notEqual(execution.assurance_state, "VERIFIED_DONE");

  run("scripts/resolve-completion-evidence.mjs", [
    root,
    "--intent", "verify quality gate",
    "--task", verification.task_ref,
    "--verification-plan-ref", "artifact:verification-plans/current.md",
    "--test-evidence-ref", "artifact:test-evidence-reports/current.md",
    "--execution-assurance-ref", "artifact:execution-assurance-reports/current.md",
    "--out", "completion-evidence-reports/current.md",
  ]);
  const completion = evidence(root, "completion-evidence-reports/current.md");
  assert.deepEqual(completion.control_effectiveness_binding, verification.control_effectiveness_binding);
  assert.equal(completion.gate_checks.find((item) => item.id === "check:control-effectiveness")?.status, "FAIL");
  assert.equal(completion.can_claim_complete, "No");
});

test("unrelated low-impact work records not-required proof without bypassing other completion gates", () => {
  const root = fixtureRoot();
  run("scripts/resolve-verification-plan.mjs", [root, "--intent", "update README wording", "--out", "verification-plans/current.md"]);
  const verification = evidence(root, "verification-plans/current.md");
  assert.equal(verification.control_effectiveness_binding.requirement, "NOT_REQUIRED");
  assert.equal(verification.control_effectiveness_binding.status, "NOT_REQUIRED");

  run("scripts/resolve-completion-evidence.mjs", [
    root,
    "--intent", "update README wording",
    "--task", verification.task_ref,
    "--verification-plan-ref", "artifact:verification-plans/current.md",
    "--out", "completion-evidence-reports/current.md",
  ]);
  const completion = evidence(root, "completion-evidence-reports/current.md");
  assert.equal(completion.control_effectiveness_binding.status, "BLOCKED");
  assert.equal(completion.can_claim_complete, "No");
  assert.ok(completion.gate_checks.some((item) => item.status === "FAIL"));
});

function fixtureRoot() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-control-consumer-"));
  for (const dir of ["scripts", "verification-plans", "test-evidence-reports", "execution-assurance-reports", "completion-evidence-reports"]) {
    fs.mkdirSync(path.join(root, dir), { recursive: true });
  }
  fs.writeFileSync(path.join(root, "package.json"), `${JSON.stringify({ scripts: { "gate:quality": "node scripts/gate.mjs" } }, null, 2)}\n`);
  fs.writeFileSync(path.join(root, "scripts", "gate.mjs"), "process.exit(0);\n");
  return root;
}

function run(script, args) {
  const result = spawnSync(process.execPath, [path.join(kitRoot, script), ...args], { cwd: kitRoot, encoding: "utf8" });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
}

function evidence(root, relative) {
  const extracted = extractMachineReadableEvidence(fs.readFileSync(path.join(root, relative), "utf8"));
  assert.equal(extracted?.ok, true, relative);
  return extracted.value;
}
