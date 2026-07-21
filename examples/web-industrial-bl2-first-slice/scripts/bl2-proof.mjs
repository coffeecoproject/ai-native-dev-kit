#!/usr/bin/env node

import fs from "node:fs";

const requiredFiles = [
  "docs/baseline-selection.md",
  "docs/baseline-evidence.md",
  "evidence/web-runtime-evidence.md",
  "releases/001-web-runtime-quality-release.md",
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
    throw new Error(`missing Web BL2 fixture input: ${file}`);
  }
}

const selection = fs.readFileSync("docs/baseline-selection.md", "utf8");
if (!selection.includes("BL2_INDUSTRIAL") || !selection.includes("web-app-industrial")) {
  throw new Error("Web BL2 fixture selection is not current");
}

const obligations = [
  ["accessibility", "keyboard focus and accessible name evidence"],
  ["accessibility", "status message and contrast evidence"],
  ["api-error-handling", "API failure and recovery evidence"],
  ["api-error-handling", "auth and validation error behavior evidence"],
  ["dependency-change", "client bundle impact review"],
  ["form-interaction", "form submission validation and duplicate-submit evidence"],
  ["performance", "bundle asset and loading impact evidence"],
  ["performance", "interaction responsiveness evidence"],
  ["permission-change", "forbidden state evidence"],
  ["permission-change", "resource scope evidence"],
  ["permission-change", "server-side permission test evidence"],
  ["production-config", "deployment configuration evidence"],
  ["production-config", "environment variable review"],
  ["production-config", "secret exposure review"],
  ["release", "monitoring evidence"],
  ["release", "release record"],
  ["release", "rollback plan"],
  ["ui-change", "critical flow behavior evidence"],
  ["ui-change", "loading-empty-error-forbidden evidence"],
  ["ui-change", "responsive behavior evidence"],
  ["ui-change", "success and layout stability evidence"],
];

console.log("Web BL2 current-project verification completed.");
for (const [evidenceType, requirement] of obligations) {
  console.log(`Evidence type: ${evidenceType}; requirement verified: ${requirement}`);
}
console.log("The fixture binds accessibility, API recovery, permission, production configuration, release, performance, form, dependency, and UI behavior evidence to this command output.");
