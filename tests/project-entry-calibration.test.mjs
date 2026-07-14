import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { evidenceDigest, validateSchema } from "../scripts/lib/artifact-schema.mjs";

const kitRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const reportRef = "calibration-reports/project-entry-adoption-1.109.json";
const schemaRef = "schemas/artifacts/project-entry-calibration.schema.json";
const sourceReport = JSON.parse(fs.readFileSync(path.join(kitRoot, reportRef), "utf8"));
const sourceSchema = JSON.parse(fs.readFileSync(path.join(kitRoot, schemaRef), "utf8"));

function fixture(report = sourceReport) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-entry-calibration-"));
  const schemaFile = path.join(root, schemaRef);
  const reportFile = path.join(root, reportRef);
  fs.mkdirSync(path.dirname(schemaFile), { recursive: true });
  fs.mkdirSync(path.dirname(reportFile), { recursive: true });
  fs.writeFileSync(schemaFile, JSON.stringify(sourceSchema, null, 2));
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  return root;
}

function canonicalReport(mutate) {
  const report = structuredClone(sourceReport);
  mutate?.(report);
  report.report_digest = evidenceDigest(report, ["report_digest"]);
  return report;
}

function check(root) {
  return spawnSync(process.execPath, [
    path.join(kitRoot, "scripts", "check-project-entry-calibration.mjs"),
    root,
    "--require-report",
    "--json",
  ], {
    cwd: kitRoot,
    encoding: "utf8",
    timeout: 30_000,
    maxBuffer: 16 * 1024 * 1024,
  });
}

test("1.109 calibration schema and checker accept a generic unchanged pre-implementation baseline", () => {
  const validation = validateSchema(sourceReport, sourceSchema, { label: reportRef });
  assert.equal(validation.ok, true, validation.errors.join("\n"));
  const result = check(fixture());
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  const parsed = JSON.parse(result.stdout);
  assert.equal(parsed.ok, true);
  assert.ok(parsed.checks.some((item) => /source tree was unchanged/.test(item.message)));
  for (const condition of ["ABSENT_TARGET", "LIGHT_EXISTING", "STRONG_GOVERNED", "CURRENT_WORK_PRESENT"]) {
    assert.ok(parsed.checks.some((item) => item.status === "PASS" && item.message.includes(`covers ${condition}`)));
  }
});

test("1.109 calibration checker rejects duplicate fixtures, missing conditions, and changed targets", () => {
  const duplicate = canonicalReport((report) => {
    report.fixtures[1].fixture_id = report.fixtures[0].fixture_id;
    report.fixtures[1].condition = report.fixtures[0].condition;
  });
  const duplicateResult = check(fixture(duplicate));
  assert.equal(duplicateResult.status, 1);
  const duplicateChecks = JSON.parse(duplicateResult.stdout).checks;
  assert.ok(duplicateChecks.some((item) => item.status === "FAIL" && /repeats fixture_id/.test(item.message)));
  assert.ok(duplicateChecks.some((item) => item.status === "FAIL" && /missing required condition LIGHT_EXISTING/.test(item.message)));

  const changedTarget = canonicalReport((report) => {
    report.fixtures[0].target_after_digest = "sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
  });
  const changedResult = check(fixture(changedTarget));
  assert.equal(changedResult.status, 1);
  assert.ok(JSON.parse(changedResult.stdout).checks.some((item) => item.status === "FAIL" && /target before\/after digests must match/.test(item.message)));
});

test("1.109 calibration checker rejects changed source state and project-specific fixture leakage", () => {
  const changedSource = canonicalReport((report) => {
    report.source_after_digest = "sha256:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc";
  });
  const sourceResult = check(fixture(changedSource));
  assert.equal(sourceResult.status, 1);
  assert.ok(JSON.parse(sourceResult.stdout).checks.some((item) => item.status === "FAIL" && /source before\/after digests must match/.test(item.message)));

  const leaked = canonicalReport((report) => {
    report.fixtures[0].command_results[0].command = "node scripts/cli.mjs start /Users/example/WorkControl --json";
  });
  const leakedResult = check(fixture(leaked));
  assert.equal(leakedResult.status, 1);
  const leakedChecks = JSON.parse(leakedResult.stdout).checks;
  assert.ok(leakedChecks.some((item) => item.status === "FAIL" && /must use the <fixture> placeholder/.test(item.message)));
  assert.ok(leakedChecks.some((item) => item.status === "FAIL" && /project-specific/.test(item.message)));
});

test("1.109 post-implementation calibration can pass only with acceptance states and unchanged evidence", () => {
  const accepted = canonicalReport((report) => {
    report.observation_scope = "POST_IMPLEMENTATION_ACCEPTANCE";
    report.outcome = "CALIBRATION_ACCEPTED";
    report.boundaries.proves_acceptance = "Yes";
    for (const item of report.fixtures.flatMap((fixtureRow) => fixtureRow.command_results)) {
      item.observation_state = "ACCEPTED";
    }
  });
  const acceptedResult = check(fixture(accepted));
  assert.equal(acceptedResult.status, 0, `${acceptedResult.stdout}\n${acceptedResult.stderr}`);

  const weak = canonicalReport((report) => {
    report.observation_scope = "POST_IMPLEMENTATION_ACCEPTANCE";
    report.outcome = "CALIBRATION_ACCEPTED";
    report.boundaries.proves_acceptance = "Yes";
  });
  const weakResult = check(fixture(weak));
  assert.equal(weakResult.status, 1);
  assert.ok(JSON.parse(weakResult.stdout).checks.some((item) => item.status === "FAIL" && /acceptance-complete/.test(item.message)));
});
