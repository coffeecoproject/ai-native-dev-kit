#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const mode = process.argv[2];
const runId = String(process.env.INTENTOS_RUN_ID || "");
const resourceNames = ["TEST_DATA_PATH", "TEST_CACHE_PATH", "TEST_CONTEXT_PATH", "TEST_FILES_PATH"];
const resources = Object.fromEntries(resourceNames.map((name) => [name, String(process.env[name] || "")]));

if (!/^vrun-[a-z0-9-]+$/.test(runId)) fail("missing bounded run identity");
for (const [name, value] of Object.entries(resources)) {
  if (!value || !value.includes(`${path.sep}.intentos${path.sep}runtime-runs${path.sep}${runId}${path.sep}`)) {
    fail(`${name} is not bound to the current run workspace`);
  }
}

const readyFile = path.join(resources.TEST_FILES_PATH, "service.ready");
if (mode === "service") {
  fs.writeFileSync(readyFile, `${runId}\n`);
  console.log("runtime service ready", runId);
  setInterval(() => {}, 1000);
} else if (mode === "positive") {
  if (!fs.existsSync(readyFile) || fs.readFileSync(readyFile, "utf8").trim() !== runId) fail("current service identity is not observable");
  for (const value of Object.values(resources)) if (!fs.existsSync(value)) fail("run-owned resource is missing");
  console.log("positive runtime path passed", runId);
} else if (mode === "negative") {
  if (fs.existsSync(path.join(resources.TEST_FILES_PATH, "forbidden"))) fail("unexpected cross-run marker exists");
  if (Object.keys(process.env).some((name) => /SECRET|PASSWORD|DATABASE_URL|REDIS_URL|PRODUCTION/.test(name))) {
    fail("sensitive or production environment leaked into the bounded runtime");
  }
  console.log("negative runtime isolation path passed", runId);
} else {
  fail("unknown runtime self-verification mode");
}

function fail(message) {
  console.error(message);
  process.exit(2);
}
