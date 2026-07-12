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

function readInstalledVersion(projectRoot) {
  const manifestPath = path.join(projectRoot, ".intentos", "intentos-manifest.json");
  if (!fs.existsSync(manifestPath)) return null;
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    return manifest.intentOSVersion || null;
  } catch (error) {
    console.error(`Invalid installed IntentOS manifest JSON: ${error.message}`);
    process.exit(1);
  }
}

const projectRoot = path.resolve(process.cwd(), process.argv[2] || ".");
const kitRoot = findKitRoot();
const sourceVersion = readCurrentVersion(kitRoot);
const installedVersion = readInstalledVersion(projectRoot);
const currentVersion = installedVersion || sourceVersion;
const versionPath = path.join(projectRoot, ".intentos", "version.json");

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
console.log(`Project intentOSVersion: ${projectVersion.intentOSVersion || "missing"}`);
console.log(`Starter: ${projectVersion.starter || "missing"}`);
console.log(`Initialized at: ${projectVersion.initializedAt || "missing"}`);
console.log(`Last workflow asset update: ${projectVersion.lastWorkflowAssetUpdateAt || "missing"}`);

if (currentVersion) {
  console.log(`${installedVersion ? "Installed authoritative" : "Current local"} IntentOS version: ${currentVersion}`);
  if (projectVersion.intentOSVersion !== currentVersion) {
    console.log("");
    console.log("Version mismatch. Run:");
    console.log("");
    if (kitRoot) {
      console.log(`node ${path.join(kitRoot, "scripts", "init-project.mjs")} --target ${projectRoot} --update-workflow-assets`);
    } else {
      console.log("Use the currently selected IntentOS source to prepare a reviewed update plan.");
    }
    process.exit(2);
  }
} else {
  console.log("Authoritative IntentOS version: unavailable");
  process.exit(1);
}

if (!projectVersion.intentOSVersion || !projectVersion.starter) {
  console.error("Workflow version file is missing required fields.");
  process.exit(1);
}

console.log("");
console.log("Workflow version is current.");
