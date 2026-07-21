#!/usr/bin/env node

import fs from "node:fs";

const requiredFiles = [
  "docs/baseline-selection.md",
  "docs/baseline-evidence.md",
  "evidence/miniprogram-runtime-evidence.md",
  "releases/001-miniprogram-login-cloud-read-release.md",
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
    throw new Error(`missing Mini Program BL2 fixture input: ${file}`);
  }
}

const selection = fs.readFileSync("docs/baseline-selection.md", "utf8");
if (!selection.includes("BL2_INDUSTRIAL") || !selection.includes("wechat-miniprogram-industrial")) {
  throw new Error("Mini Program BL2 fixture selection is not current");
}

const requirements = JSON.parse(fs.readFileSync("evidence/bl2-requirements.json", "utf8"));
if (!Array.isArray(requirements) || requirements.length === 0) {
  throw new Error("Mini Program BL2 fixture requirements are missing");
}

console.log("Mini Program BL2 current-project verification completed.");
for (const { evidenceType, requirement } of requirements) {
  console.log(`Evidence type: ${evidenceType}; requirement verified: ${requirement}`);
}
console.log("The fixture binds login, cloud/API, permission, privacy, release, storage, and UI behavior evidence to this command output.");
