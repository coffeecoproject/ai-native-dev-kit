#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function findKitRoot() {
  const candidate = path.resolve(__dirname, "..");
  if (fs.existsSync(path.join(candidate, "VERSION.md"))) {
    return candidate;
  }
  return null;
}

function readCurrentVersion(kitRoot) {
  if (!kitRoot) return null;
  const content = fs.readFileSync(path.join(kitRoot, "VERSION.md"), "utf8");
  const match = content.match(/Current version:\s*`([^`]+)`/);
  return match ? match[1] : null;
}

const projectRoot = path.resolve(process.cwd(), process.argv[2] || ".");
const kitRoot = findKitRoot();
const currentVersion = readCurrentVersion(kitRoot);
const versionPath = path.join(projectRoot, ".ai-native", "version.json");

if (!fs.existsSync(versionPath)) {
  console.error(`Missing workflow version file: ${versionPath}`);
  process.exit(1);
}

let projectVersion;
try {
  projectVersion = JSON.parse(fs.readFileSync(versionPath, "utf8"));
} catch (error) {
  console.error(`Invalid workflow version JSON: ${error.message}`);
  process.exit(1);
}

console.log("# Workflow Version");
console.log("");
console.log(`Project: ${projectRoot}`);
console.log(`Project devKitVersion: ${projectVersion.devKitVersion || "missing"}`);
console.log(`Starter: ${projectVersion.starter || "missing"}`);
console.log(`Initialized at: ${projectVersion.initializedAt || "missing"}`);
console.log(`Last workflow asset update: ${projectVersion.lastWorkflowAssetUpdateAt || "missing"}`);

if (currentVersion) {
  console.log(`Current local dev-kit version: ${currentVersion}`);
  if (projectVersion.devKitVersion !== currentVersion) {
    console.log("");
    console.log("Version mismatch. Run:");
    console.log("");
    console.log(`node ${path.join(kitRoot, "scripts", "init-project.mjs")} --target ${projectRoot} --update-workflow-assets`);
    process.exit(2);
  }
} else {
  console.log("Current local dev-kit version: unavailable from this script location");
}

if (!projectVersion.devKitVersion || !projectVersion.starter) {
  console.error("Workflow version file is missing required fields.");
  process.exit(1);
}

console.log("");
console.log(currentVersion ? "Workflow version is current." : "Workflow version file is present.");
