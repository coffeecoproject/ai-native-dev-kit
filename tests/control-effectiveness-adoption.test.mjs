import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const kitRoot = path.resolve(import.meta.dirname, "..");

test("project ownership and stricter wording do not become proven effectiveness", () => {
  const root = fixtureRoot();
  const convergence = runJson("scripts/resolve-governance-convergence.mjs", [root, "--intent", "converge existing project governance", "--json"]);
  const baseline = convergence.structuredEvidence.dimensions.find((item) => item.dimension === "baseline");
  assert.equal(baseline.control_effectiveness_required, "Yes");
  assert.equal(baseline.control_effectiveness_state, "CONTROL_NOT_PROVEN");
  assert.notEqual(baseline.recommendation, "KEEP_EXISTING_STRICTER");

  const adoption = runJson("scripts/resolve-adoption-assurance.mjs", [root, "--intent", "verify existing project IntentOS adoption", "--json"]);
  const required = adoption.structuredEvidence.surfaces.filter((item) => item.control_effectiveness_required === "Yes");
  assert.ok(required.length > 0);
  assert.ok(required.every((item) => item.control_effectiveness_state === "CONTROL_NOT_PROVEN"));
  assert.ok(required.every((item) => item.status !== "VERIFIED"));
  assert.equal(adoption.structuredEvidence.can_claim_full_adoption, "No");
});

test("an unproven control blocks only the surfaces that rely on it", () => {
  const root = fixtureRoot();
  const adoption = runJson("scripts/resolve-adoption-assurance.mjs", [root, "--intent", "verify existing project IntentOS adoption", "--json"]);
  const unrelated = adoption.structuredEvidence.surfaces.filter((item) => item.control_effectiveness_required === "No");
  assert.ok(unrelated.length > 0);
  assert.ok(unrelated.some((item) => ["MAPPED", "PROJECT_OWNED", "PENDING_APPLY", "NOT_APPLICABLE_WITH_REASON"].includes(item.status)));
  assert.ok(unrelated.every((item) => item.control_effectiveness_state === "NOT_APPLICABLE_WITH_REASON"));
});

function fixtureRoot() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-control-adoption-"));
  fs.mkdirSync(path.join(root, "scripts"), { recursive: true });
  fs.mkdirSync(path.join(root, "docs"), { recursive: true });
  fs.writeFileSync(path.join(root, "package.json"), `${JSON.stringify({ scripts: { "gate:quality": "node scripts/gate.mjs" } }, null, 2)}\n`);
  fs.writeFileSync(path.join(root, "scripts", "gate.mjs"), "process.exit(0);\n");
  fs.writeFileSync(path.join(root, "docs", "engineering-baseline.md"), "# Engineering baseline\n\nAll quality gates are blocking.\n");
  return root;
}

function runJson(script, args) {
  const result = spawnSync(process.execPath, [path.join(kitRoot, script), ...args], { cwd: kitRoot, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  return JSON.parse(result.stdout);
}
