import assert from "node:assert/strict";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const checker = path.join(root, "scripts/check-test-evidence.mjs");
const completionChecker = path.join(root, "scripts/check-completion-evidence.mjs");
const executionAssuranceChecker = path.join(root, "scripts/check-execution-assurance.mjs");
const runtimeHygieneChecker = path.join(root, "scripts/check-runtime-hygiene.mjs");
const businessUniverseChecker = path.join(root, "scripts/check-business-universe-coverage.mjs");

function run(args) {
  return spawnSync(process.execPath, [checker, root, ...args], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
}

test("repository Test Evidence batch preserves history while explicit old selection stays current-strict", () => {
  const batch = run([
    "--require-structured-evidence",
    "--require-verification-plan-ref",
    "--strict-source-binding",
    "--require-current-evidence",
    "--require-test-quality-controls",
    "--require-evidence-authority",
    "--require-runtime-trust",
  ]);
  assert.equal(batch.status, 0, `${batch.stdout}\n${batch.stderr}`);
  assert.match(
    batch.stdout,
    /113-cross-domain-trust-closure\.md preserves valid historical Test Evidence structure and internal bindings without claiming current runtime, source, or project authority/,
  );

  const explicitOld = run([
    "--report", "test-evidence-reports/113-cross-domain-trust-closure.md",
    "--require-structured-evidence",
    "--require-verification-plan-ref",
    "--strict-source-binding",
    "--require-current-evidence",
    "--require-test-quality-controls",
    "--require-evidence-authority",
    "--require-runtime-trust",
  ]);
  assert.notEqual(explicitOld.status, 0);
  assert.match(
    `${explicitOld.stdout}\n${explicitOld.stderr}`,
    /source_identity must match the current project identity|authority_binding\.project does not match the current project identity or revision/,
  );
});

test("repository Completion Evidence batch preserves history while explicit old selection stays current-strict", () => {
  const batch = spawnSync(process.execPath, [completionChecker, root,
    "--require-structured-evidence",
    "--require-source-refs",
    "--require-ready",
    "--require-task-governance",
    "--require-work-queue",
    "--strict-task-consumer",
    "--require-plan-review",
    "--require-evidence-authority",
  ], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  assert.equal(batch.status, 0, `${batch.stdout}\n${batch.stderr}`);
  assert.match(
    batch.stdout,
    /113-cross-domain-trust-closure\.md preserves valid historical Completion Evidence structure and recorded source refs without claiming current runtime, source, or project authority/,
  );

  const explicitOld = spawnSync(process.execPath, [completionChecker, root,
    "--report", "completion-evidence-reports/113-cross-domain-trust-closure.md",
    "--require-ready",
    "--require-task-governance",
    "--require-work-queue",
    "--strict-task-consumer",
    "--require-plan-review",
    "--require-evidence-authority",
  ], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  assert.notEqual(explicitOld.status, 0);
  assert.match(
    `${explicitOld.stdout}\n${explicitOld.stderr}`,
    /source_identity must match the current project identity|authority_binding\.project does not match the current project identity or revision/,
  );
});

test("repository Execution Assurance batch preserves history while explicit old selection stays current-strict", () => {
  const strictArgs = [
    "--require-structured-evidence",
    "--require-evidence-refs",
    "--require-review",
    "--require-actual-diff",
    "--require-precise-evidence",
    "--require-task-governance",
    "--require-work-queue",
    "--strict-task-consumer",
    "--require-plan-review",
    "--require-planning-closure",
    "--require-evidence-authority",
    "--require-runtime-trust",
  ];
  const batch = spawnSync(process.execPath, [executionAssuranceChecker, root, ...strictArgs], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  assert.equal(batch.status, 0, `${batch.stdout}\n${batch.stderr}`);
  assert.match(
    batch.stdout,
    /117-fillers-modularity\.md preserves valid historical Execution Assurance structure and recorded source refs without claiming current runtime, source, diff, or project authority/,
  );

  const explicitOld = spawnSync(process.execPath, [executionAssuranceChecker, root,
    "--report", "execution-assurance-reports/117-fillers-modularity.md",
    ...strictArgs,
  ], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  assert.notEqual(explicitOld.status, 0);
  assert.match(
    `${explicitOld.stdout}\n${explicitOld.stderr}`,
    /source_identity must match the current project identity|authority_binding\.project does not match the current project identity or revision|actual_diff\.changed_files does not match the current Git worktree/,
  );
});

test("repository Runtime Hygiene batch preserves history while explicit old selection stays current-strict", () => {
  const strictArgs = [
    "--require-structured-evidence",
    "--require-task-entry",
    "--strict-task-entry",
    "--require-runtime-sources",
    "--require-release-topology",
  ];
  const batch = spawnSync(process.execPath, [runtimeHygieneChecker, root, ...strictArgs], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  assert.equal(batch.status, 0, `${batch.stdout}\n${batch.stderr}`);
  assert.match(
    batch.stdout,
    /113-cross-domain-trust-closure\.md preserves valid historical Runtime Hygiene structure and internal bindings without claiming current source, runtime, or project authority/,
  );

  const explicitOld = spawnSync(process.execPath, [runtimeHygieneChecker, root,
    "--report", "runtime-hygiene-reports/113-cross-domain-trust-closure.md",
    ...strictArgs,
  ], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  assert.notEqual(explicitOld.status, 0);
  assert.match(
    `${explicitOld.stdout}\n${explicitOld.stderr}`,
    /release candidate source revision does not match current project|release preflight receipt source_revision does not match the current project revision|Release Execution Topology is stale/,
  );
});

test("repository Business Universe batch preserves history while explicit old selection stays current-strict", () => {
  const strictArgs = ["--require-structured-evidence", "--require-ready"];
  const batch = spawnSync(process.execPath, [businessUniverseChecker, root, ...strictArgs], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  assert.equal(batch.status, 0, `${batch.stdout}\n${batch.stderr}`);
  assert.match(
    batch.stdout,
    /113-cross-domain-trust-closure\.md preserves recorded historical Evidence Authority without claiming current project, revision, or source authority/,
  );

  const explicitOld = spawnSync(process.execPath, [businessUniverseChecker, root,
    "--report", "business-universe-coverage-reports/113-cross-domain-trust-closure.md",
    ...strictArgs,
  ], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  assert.notEqual(explicitOld.status, 0);
  assert.match(
    `${explicitOld.stdout}\n${explicitOld.stderr}`,
    /authority_binding\.project does not match the current project identity or revision|semantic locator is stale or unsupported/,
  );
});
