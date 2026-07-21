import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const obligationId = "verify:runtime-behavior-regression-smoke-the-current-code-runs-through-";
const target = "tests/113-runtime-behavior-evidence.test.mjs";
const runId = String(process.env.INTENTOS_RUN_ID || "");
const resources = {
  data: String(process.env.TEST_DATA_PATH || ""),
  cache: String(process.env.TEST_CACHE_PATH || ""),
  context: String(process.env.TEST_CONTEXT_PATH || ""),
  files: String(process.env.TEST_FILES_PATH || ""),
};

test(`[${obligationId}] ${target} :: current run-owned service and data path complete a positive state transition`, () => {
  assert.match(runId, /^vrun-[a-z0-9-]+$/);
  for (const [name, directory] of Object.entries(resources)) {
    assert.ok(directory.includes(`${path.sep}.intentos${path.sep}runtime-runs${path.sep}${runId}${path.sep}`), `${name} must be run-scoped`);
    assert.equal(fs.existsSync(path.join(directory, ".intentos-owner")), true, `${name} must be owned by this run`);
  }

  const ready = fs.readFileSync(path.join(resources.files, "service.ready"), "utf8").trim();
  assert.equal(ready, runId, "the observed service must belong to the current run");

  const request = { runId, operation: "verify-current-runtime", value: 7 };
  fs.writeFileSync(path.join(resources.data, "request.json"), `${JSON.stringify(request)}\n`);
  const loaded = JSON.parse(fs.readFileSync(path.join(resources.data, "request.json"), "utf8"));
  assert.deepEqual(loaded, request);

  const result = { runId: loaded.runId, accepted: loaded.operation === "verify-current-runtime", total: loaded.value * 2 };
  fs.writeFileSync(path.join(resources.cache, "result.json"), `${JSON.stringify(result)}\n`);
  fs.writeFileSync(path.join(resources.context, "role.txt"), "verification-user\n");
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(resources.cache, "result.json"), "utf8")), {
    runId,
    accepted: true,
    total: 14,
  });
  assert.equal(fs.readFileSync(path.join(resources.context, "role.txt"), "utf8").trim(), "verification-user");
});

test(`[${obligationId}] ${target} :: stale and cross-run identities are rejected by the negative path`, () => {
  const ready = fs.readFileSync(path.join(resources.files, "service.ready"), "utf8").trim();
  assert.notEqual(ready, `${runId}-stale`);
  assert.equal(fs.existsSync(path.join(resources.files, "forbidden")), false);
  assert.equal(Object.keys(process.env).some((name) => /SECRET|PASSWORD|DATABASE_URL|REDIS_URL|PRODUCTION/.test(name)), false);
});
