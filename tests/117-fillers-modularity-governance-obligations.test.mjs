import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fillerRoot = path.join(repoRoot, "scripts/new-workflow-item/fillers");

test("[verify:background-work-integration-contract-check-scheduled-queued-retr] tests/117-fillers-modularity-governance-obligations.test.mjs :: filler modules start no background work", () => {
  for (const name of fs.readdirSync(fillerRoot)) {
    const source = fs.readFileSync(path.join(fillerRoot, name), "utf8");
    assert.doesNotMatch(source, /setInterval|setTimeout|Worker|child_process|spawn\(/);
  }
});

test("[verify:rollback-recovery-release-smoke-check-failure-interruption-rollb] tests/117-fillers-modularity-governance-obligations.test.mjs :: filler split remains a reversible internal boundary", () => {
  const entry = fs.readFileSync(path.join(repoRoot, "scripts/new-workflow-item/fillers.mjs"), "utf8");
  assert.match(entry, /export \{ frontmatterFor \}/);
  assert.match(entry, /export function fillArtifact/);
  assert.equal(fs.readdirSync(fillerRoot).filter((name) => name.endsWith(".mjs")).length, 7);
});
