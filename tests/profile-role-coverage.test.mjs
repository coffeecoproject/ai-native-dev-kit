import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  packCoversProfile,
  profileRequiresPackCoverage,
  profileRoleFor,
  resolveBaselineConfiguration,
  uncoveredProfilesForBaselineLayer,
} from "../scripts/lib/baseline-selection.mjs";

const kitRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function projectFixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-profile-role-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return root;
}

test("profile manifests define risk overlay independently from platform and capability roles", () => {
  assert.equal(profileRoleFor(kitRoot, "web-app"), "primary-platform");
  assert.equal(profileRoleFor(kitRoot, "backend-api"), "capability");
  assert.equal(profileRoleFor(kitRoot, "high-risk-change"), "risk-overlay");
  assert.equal(profileRequiresPackCoverage(kitRoot, "high-risk-change", "standard"), false);
  assert.equal(profileRequiresPackCoverage(kitRoot, "high-risk-change", "industrial"), true);
});

test("BL1 accepts a single risk-overlay profile without inventing a Standard platform pack", (t) => {
  const config = resolveBaselineConfiguration(kitRoot, {
    starter: "generic-project",
    projectRoot: projectFixture(t),
    existingProject: false,
    profiles: "high-risk-change",
    baselineLevel: "BL1_STANDARD",
  });

  assert.deepEqual(config.profiles, ["high-risk-change"]);
  assert.deepEqual(config.standardPacks, ["environment-standard"]);
  assert.deepEqual(config.industrialPacks, []);
});

test("BL1 accepts platform, capability, and risk-overlay profiles together", (t) => {
  const selected = ["backend-api", "high-risk-change", "internal-admin", "web-app", "wechat-miniprogram"];
  const config = resolveBaselineConfiguration(kitRoot, {
    starter: "generic-project",
    projectRoot: projectFixture(t),
    existingProject: false,
    profiles: selected.join(","),
    baselineLevel: "BL1_STANDARD",
  });

  assert.deepEqual(config.profiles, selected);
  assert.ok(config.standardPacks.includes("environment-standard"));
  assert.ok(config.standardPacks.includes("backend-api-standard"));
  assert.ok(config.standardPacks.includes("internal-admin-standard"));
  assert.ok(config.standardPacks.includes("web-runtime-standard"));
  assert.ok(config.standardPacks.includes("miniprogram-runtime-standard"));
  assert.equal(config.standardPacks.some((pack) => /high-risk/.test(pack)), false);
});

test("BL2 requires role-compatible industrial coverage for platform and risk-overlay profiles", () => {
  const entries = [
    { id: "web-app-industrial", type: "primary-platform", appliesToProfiles: ["web-app"] },
    { id: "high-risk-change-industrial", type: "risk-overlay", appliesToProfiles: ["high-risk-change"] },
  ];
  assert.deepEqual(
    uncoveredProfilesForBaselineLayer(kitRoot, ["web-app", "high-risk-change"], entries, "industrial"),
    [],
  );
  assert.equal(packCoversProfile(kitRoot, entries[1], "web-app", "industrial"), false);
  assert.deepEqual(
    uncoveredProfilesForBaselineLayer(kitRoot, ["web-app", "high-risk-change"], entries.slice(0, 1), "industrial"),
    ["high-risk-change"],
  );
});

test("BL2 resolves a single risk-overlay profile with its industrial overlay", (t) => {
  const config = resolveBaselineConfiguration(kitRoot, {
    starter: "generic-project",
    projectRoot: projectFixture(t),
    existingProject: false,
    profiles: "high-risk-change",
    baselineLevel: "BL2_INDUSTRIAL",
    industrialPacks: "high-risk-change-industrial",
  });

  assert.deepEqual(config.standardPacks, ["environment-standard"]);
  assert.deepEqual(config.industrialPacks, ["high-risk-change-industrial"]);
});

test("BL2 resolves platform and risk-overlay profiles with separate compatible coverage", (t) => {
  const config = resolveBaselineConfiguration(kitRoot, {
    starter: "generic-project",
    projectRoot: projectFixture(t),
    existingProject: false,
    profiles: "web-app,high-risk-change",
    baselineLevel: "BL2_INDUSTRIAL",
    industrialPacks: "web-app-industrial,high-risk-change-industrial",
  });

  assert.ok(config.standardPacks.includes("web-runtime-standard"));
  assert.deepEqual(config.industrialPacks, ["high-risk-change-industrial", "web-app-industrial"]);
  assert.equal(config.industrialPackCompatibility.status, "COMPATIBLE");
});
