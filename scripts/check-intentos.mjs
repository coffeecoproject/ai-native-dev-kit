#!/usr/bin/env node

import { hasFailed } from "./self-check/runtime.mjs";
import { runFoundationChecks } from "./self-check/foundation.mjs";
import { runAdoptionChecks } from "./self-check/adoption.mjs";
import { runEvidenceChecks } from "./self-check/evidence.mjs";
import { runArchitectureChecks } from "./self-check/architecture.mjs";
import { runReleaseChecks } from "./self-check/release.mjs";
import { runDistributionChecks } from "./self-check/distribution.mjs";
import { runGeneratedProjectE2ECheck } from "./self-check/generated-project-e2e.mjs";

runFoundationChecks();
runAdoptionChecks();
runEvidenceChecks();
runArchitectureChecks();
runReleaseChecks();
runDistributionChecks();
runGeneratedProjectE2ECheck();

if (hasFailed()) {
  process.exit(1);
}

console.log("");
console.log("IntentOS self-check passed.");
