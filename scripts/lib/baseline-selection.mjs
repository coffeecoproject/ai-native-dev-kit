import fs from "node:fs";
import path from "node:path";

export const canonicalBaselineLevels = [
  "BL0_LIGHTWEIGHT",
  "BL1_STANDARD",
  "BL2_INDUSTRIAL",
];

const starterProfiles = {
  "codex-web-app": ["web-app"],
  "codex-ios-app": ["ios-app"],
  "codex-android-app": ["android-app"],
};

export function parseSelectionIds(value) {
  if (!value || value === true) return [];
  return [...new Set(String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean))].sort();
}

export function normalizeBaselineLevel(value) {
  const normalized = String(value || "").trim().toUpperCase();
  if (!normalized) return null;
  const aliases = {
    BL0: "BL0_LIGHTWEIGHT",
    BL0_LIGHTWEIGHT: "BL0_LIGHTWEIGHT",
    BL1: "BL1_STANDARD",
    BL1_STANDARD: "BL1_STANDARD",
    BL2: "BL2_INDUSTRIAL",
    BL2_INDUSTRIAL: "BL2_INDUSTRIAL",
  };
  return aliases[normalized] || null;
}

export function defaultProfilesForStarter(starter) {
  return [...(starterProfiles[String(starter || "")] || [])];
}

export function knownProfileIds(kitRoot) {
  const root = path.join(kitRoot, "profiles");
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(root, entry.name, "profile.md")))
    .map((entry) => entry.name)
    .sort();
}

export function loadPackIndex(kitRoot, registry) {
  const file = path.join(kitRoot, registry, "index.json");
  if (!fs.existsSync(file)) throw new Error(`${registry}/index.json not found`);
  let value;
  try {
    value = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    throw new Error(`${registry}/index.json is invalid JSON: ${error.message}`);
  }
  if (!Array.isArray(value.packs)) throw new Error(`${registry}/index.json must contain packs`);
  return value;
}

export function recommendStandardPackIds(kitRoot, profiles, baselineLevel) {
  const index = loadPackIndex(kitRoot, "standard-baseline-packs");
  const selectedProfiles = new Set(profiles);
  return index.packs
    .filter((entry) => entry && entry.id && entry.path && entry.status !== "planned")
    .filter((entry) => {
      const applies = Array.isArray(entry.appliesToProfiles) ? entry.appliesToProfiles : [];
      const profileMatch = applies.some((profile) => selectedProfiles.has(profile));
      const environmentDefault = entry.id === "environment-standard"
        && ["BL1_STANDARD", "BL2_INDUSTRIAL"].includes(baselineLevel)
        && profiles.length > 0;
      const allowed = !Array.isArray(entry.allowedForBL)
        || entry.allowedForBL.length === 0
        || entry.allowedForBL.includes(baselineLevel);
      const recommended = !Array.isArray(entry.recommendedForBL)
        || entry.recommendedForBL.length === 0
        || entry.recommendedForBL.includes(baselineLevel);
      return allowed && recommended && (profileMatch || environmentDefault);
    })
    .map((entry) => entry.id)
    .sort();
}

export function resolveBaselineConfiguration(kitRoot, options = {}) {
  const explicitProfiles = parseSelectionIds(options.profiles);
  const profiles = explicitProfiles.length > 0
    ? explicitProfiles
    : defaultProfilesForStarter(options.starter);
  const requestedLevel = options.baselineLevel;
  const baselineLevel = normalizeBaselineLevel(requestedLevel)
    || (profiles.length > 0 ? "BL1_STANDARD" : null);

  if (requestedLevel && !normalizeBaselineLevel(requestedLevel)) {
    throw new Error(`Unknown baseline level: ${requestedLevel}`);
  }
  if (requestedLevel && profiles.length === 0) {
    throw new Error("A selected baseline level requires at least one concrete project profile");
  }

  const knownProfiles = new Set(knownProfileIds(kitRoot));
  const unknownProfiles = profiles.filter((profile) => !knownProfiles.has(profile));
  if (unknownProfiles.length > 0) {
    throw new Error(`Unknown profile(s): ${unknownProfiles.join(", ")}`);
  }

  const standardIndex = loadPackIndex(kitRoot, "standard-baseline-packs");
  const standardById = new Map(standardIndex.packs.map((entry) => [entry.id, entry]));
  const explicitStandard = parseSelectionIds(options.standardPacks);
  if (explicitStandard.length > 0 && (!baselineLevel || profiles.length === 0)) {
    throw new Error("Selected standard baseline packs require a concrete baseline level and project profile");
  }
  const standardPacks = explicitStandard.length > 0
    ? explicitStandard
    : baselineLevel && profiles.length > 0
      ? recommendStandardPackIds(kitRoot, profiles, baselineLevel)
      : [];
  const unknownStandard = standardPacks.filter((id) => !standardById.has(id));
  if (unknownStandard.length > 0) {
    throw new Error(`Unknown standard baseline pack(s): ${unknownStandard.join(", ")}`);
  }
  const incompatibleStandard = standardPacks.filter((id) => {
    const allowed = standardById.get(id)?.allowedForBL;
    return baselineLevel && Array.isArray(allowed) && allowed.length > 0 && !allowed.includes(baselineLevel);
  });
  if (incompatibleStandard.length > 0) {
    throw new Error(`Standard baseline pack(s) incompatible with ${baselineLevel}: ${incompatibleStandard.join(", ")}`);
  }

  const industrialIndex = loadPackIndex(kitRoot, "industrial-packs");
  const industrialById = new Map(industrialIndex.packs.map((entry) => [entry.id, entry]));
  const industrialPacks = parseSelectionIds(options.industrialPacks);
  const unknownIndustrial = industrialPacks.filter((id) => !industrialById.has(id));
  if (unknownIndustrial.length > 0) {
    throw new Error(`Unknown industrial pack(s): ${unknownIndustrial.join(", ")}`);
  }
  if (industrialPacks.length > 0 && baselineLevel !== "BL2_INDUSTRIAL") {
    throw new Error("Industrial packs require BL2_INDUSTRIAL");
  }
  if (baselineLevel === "BL2_INDUSTRIAL" && industrialPacks.length === 0) {
    throw new Error("BL2_INDUSTRIAL requires at least one concrete selected industrial pack");
  }

  return {
    configured: Boolean(baselineLevel && profiles.length > 0),
    baselineLevel,
    profiles,
    standardPacks,
    industrialPacks,
    standardPackMaturity: Object.fromEntries(standardPacks.map((id) => [id, standardById.get(id)?.maturityStage || standardById.get(id)?.status || "unknown"])),
    industrialPackMaturity: Object.fromEntries(industrialPacks.map((id) => [id, industrialById.get(id)?.maturityStage || industrialById.get(id)?.status || "unknown"])),
  };
}

function bullets(values, empty = "- None") {
  return values.length > 0 ? values.map((value) => `- ${value}`).join("\n") : empty;
}

export function renderProjectProfile(config, options = {}) {
  return `# Project Profile: ${options.projectName || "project"}

## Status

Draft status: CONFIRMED

Human decision status: CONFIRMED

## Project Type

- Category: IntentOS configured project
- Target platform(s): ${config.profiles.join(", ")}
- Delivery model: ${config.baselineLevel}
- Expected lifecycle: maintained project

## Selected Profiles

${bullets(config.profiles)}

## Profile Rationale

The profiles were derived by Codex from the selected starter/project goal and are bound to the approved initialization plan.

## Purpose

Project purpose remains defined by the product request and business specification.

## Users / Actors

Pending business specification.

## Success Criteria

- Selected platform and baseline assets are installed and verifiable.

## Non-goals

- This profile does not prove product correctness or production readiness.

## Data Sensitivity

- Unknown until the business specification classifies project data.

## Default Task Level

${config.baselineLevel === "BL2_INDUSTRIAL" ? "L2" : "L1"}

Rationale: baseline-aware maintained-project default; task governance may raise it.

## High-risk Boundaries

Stop before production, secrets, permissions, payment, migrations, regulated data, or irreversible operations without project evidence and approval.

## Required Project Docs

- [x] \`docs/project-profile.md\`
- [x] \`docs/baseline-selection.md\`
- [x] \`docs/baseline-evidence.md\`

## Open Assumptions

Business, data, release, and production facts remain pending until supported by project evidence.
`;
}

export function renderBaselineSelection(config) {
  const maturityRows = [
    ...config.standardPacks.map((id) => `| ${id} | standard | ${config.standardPackMaturity[id]} | selected by approved plan |`),
    ...config.industrialPacks.map((id) => `| ${id} | industrial | ${config.industrialPackMaturity[id]} | selected by approved plan |`),
  ];
  return `# Baseline Selection

## Status

Draft status: CONFIRMED

Human decision status: CONFIRMED

## Baseline Level

${config.baselineLevel}

Rationale: Codex recommendation accepted through the controlled initialization plan.

## Selected Profiles

${bullets(config.profiles)}

## Selected Standard Packs

${bullets(config.standardPacks)}

## Selected Industrial Packs

${bullets(config.industrialPacks)}

## Baseline Rationale

| Selection | Layer | Maturity | Decision source |
|---|---|---|---|
${maturityRows.length > 0 ? maturityRows.join("\n") : "| None | N/A | N/A | N/A |"}

## Human Approval

Status: APPROVED

Approval scope: exact baseline selection bound to the approved IntentOS initialization action graph.

## Baseline Exceptions

| Requirement | Exception | Reason | Owner | Review date | Human accepted |
|---|---|---|---|---|---|
| None recorded | N/A | N/A | N/A | N/A | No |

## Residual Risk Register

| Risk | Impact | Mitigation | Owner | Review date | Accepted by human |
|---|---|---|---|---|---|
| Selected pack maturity may be draft | Baseline guidance is not production certification | Keep maturity visible and require project evidence | Project owner | Before release review | No |

## Review Cadence

- Recheck when platform, baseline level, selected packs, production scope, or project authority changes.
`;
}

export function renderBaselineEvidence(config) {
  return `# Baseline Evidence

## Human Decision Summary

Conclusion: selected baseline configuration is installed through an exact controlled plan.

Recommended choice: Accept the selected baseline and continue with project-specific onboarding.

Can AI continue now: limited

What I need from you: only unresolved business, data, release, or high-risk decisions when they become material.

## Human Summary

One-sentence conclusion: IntentOS baseline assets are configured; product and production evidence still belong to the project.

## Decision Needed

Does baseline evidence need human confirmation before AI continues: No

Decision: technical baseline installation may continue; high-risk project decisions remain separate.

## Next Safe Step

Next action: complete product, engineering, environment, and business onboarding using real project evidence.

## Status

Draft status: CONFIRMED

Human decision status: CONFIRMED

## Evidence Index

| Requirement | Evidence Type | Evidence Ref | Status | Reason if skipped | Owner | Review date |
|---|---|---|---|---|---|---|
| Project profile | doc | docs/project-profile.md | Done |  | IntentOS apply | On profile change |
| Baseline selection | doc | docs/baseline-selection.md | Done |  | IntentOS apply | On baseline change |
| Managed version | audit | .intentos/version.json | Done |  | IntentOS apply | On workflow update |

## Production Readiness

Status: NOT_AUDITED

## Release Readiness

Status: NOT_AUDITED

## Security Readiness

Status: NOT_AUDITED

## Privacy Readiness

Status: NOT_AUDITED

## Recovery Readiness

Status: NOT_AUDITED

## Exceptions

None recorded.

## Residual Risks

- Pack maturity: ${JSON.stringify({ ...config.standardPackMaturity, ...config.industrialPackMaturity })}
- Installation evidence does not prove product correctness or production readiness.
`;
}
