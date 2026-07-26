import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function source(file) {
  return fs.readFileSync(path.join(repoRoot, file), "utf8");
}

test("legacy source-marker checks follow modular implementation graphs", () => {
  const suites = {
    foundation: source("scripts/self-check/foundation.mjs"),
    adoption: source("scripts/self-check/adoption.mjs"),
    evidence: source("scripts/self-check/evidence.mjs"),
    architecture: source("scripts/self-check/architecture.mjs"),
  };
  const initModules = ["assets.mjs", "plan.mjs", "apply.mjs", "cli.mjs"];
  const workflowModules = [
    "cli.mjs", "registry.mjs", "references.mjs", "fillers.mjs",
    "fillers/baseline.mjs", "fillers/frontmatter.mjs", "fillers/governance.mjs",
    "fillers/reporting.mjs", "fillers/review.mjs", "fillers/routing.mjs", "fillers/workflow.mjs",
  ];
  const operatingModules = [
    "classification.mjs", "decision.mjs", "identity.mjs", "presentation.mjs",
    "shared.mjs", "source-execution.mjs", "source-orchestration.mjs", "state.mjs",
  ];

  for (const file of initModules) {
    assert.match(suites.foundation, new RegExp(`scripts/init-project/${file.replaceAll(".", "\\.")}`));
    assert.match(suites.evidence, new RegExp(`scripts/init-project/${file.replaceAll(".", "\\.")}`));
  }
  for (const file of workflowModules) {
    for (const suite of [suites.foundation, suites.adoption, suites.evidence]) {
      assert.match(suite, new RegExp(`scripts/new-workflow-item/${file.replaceAll(".", "\\.")}`));
    }
  }
  assert.match(suites.architecture, /scripts\/operating-loop\/\$\{file\}/);
  for (const file of operatingModules) {
    assert.match(suites.architecture, new RegExp(`"${file.replaceAll(".", "\\.")}"`));
  }
});
