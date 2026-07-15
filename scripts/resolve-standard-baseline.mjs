#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "./lib/args.mjs";
import { resolveIndustrialBaseline } from "./resolve-industrial-baseline.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const kitRoot = path.resolve(__dirname, "..");
const standardPackTypes = new Set(["primary-platform", "capability", "quality", "environment", "release"]);
const industrialOverlayTypes = new Set(["capability", "risk-overlay"]);

function readJsonIfExists(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

function intersects(left, right) {
  const rightSet = new Set(right);
  return left.some((item) => rightSet.has(item));
}

function registryRoot(root, registryName) {
  const candidates = [
    path.join(root, ".intentos", registryName),
    path.join(root, registryName),
    path.join(kitRoot, registryName),
  ];
  return candidates.find((candidate) => fs.existsSync(path.join(candidate, "index.json"))) || candidates[0];
}

function loadIndex(root, registryName) {
  const rootPath = registryRoot(root, registryName);
  const indexPath = path.join(rootPath, "index.json");
  const index = readJsonIfExists(indexPath);
  return {
    root: rootPath,
    indexPath,
    index,
    entries: Array.isArray(index?.packs) ? index.packs : [],
  };
}

function entryWithManifest(root, entry) {
  const manifestPath = path.join(root, entry.path || "", "pack.json");
  const manifest = readJsonIfExists(manifestPath) || {};
  return {
    ...entry,
    ...manifest,
    id: manifest.id || entry.id,
    type: manifest.type || entry.type,
    status: manifest.status || entry.status,
    maturityStage: manifest.maturityStage || entry.maturityStage || entry.status || "draft",
    path: entry.path,
    displayName: manifest.displayName || entry.displayName || entry.id,
    appliesToProfiles: Array.isArray(manifest.appliesToProfiles) ? manifest.appliesToProfiles : Array.isArray(entry.appliesToProfiles) ? entry.appliesToProfiles : [],
    recommendedForBL: Array.isArray(manifest.recommendedForBL) ? manifest.recommendedForBL : Array.isArray(entry.recommendedForBL) ? entry.recommendedForBL : [],
    allowedForBL: Array.isArray(manifest.allowedForBL) ? manifest.allowedForBL : Array.isArray(entry.allowedForBL) ? entry.allowedForBL : [],
    recommendedWhen: Array.isArray(manifest.recommendedWhen) ? manifest.recommendedWhen : Array.isArray(entry.recommendedWhen) ? entry.recommendedWhen : [],
  };
}

function publicPack(entry, reason) {
  return {
    id: entry.id,
    type: entry.type,
    status: entry.status,
    maturityStage: entry.maturityStage || entry.status || "draft",
    baselineLayer: entry.baselineLayer || "standard",
    appliesToProfiles: entry.appliesToProfiles || [],
    recommendedForBL: entry.recommendedForBL || [],
    recommendedWhen: entry.recommendedWhen || [],
    reason,
  };
}

function standardReason(entry, baselineLevel, selectedProfiles) {
  const profileText = entry.appliesToProfiles?.length > 0
    ? `matches selected profile(s): ${entry.appliesToProfiles.filter((profile) => selectedProfiles.includes(profile)).join(", ")}`
    : "conditional standard pack; select only when the scope needs it";
  const blText = baselineLevel ? `baseline level: ${baselineLevel}` : "baseline level is not selected yet";
  return `${profileText}; ${blText}`;
}

function splitStandardPacks(entries, baselineLevel, selectedProfiles) {
  const recommended = [];
  const profileCandidates = [];
  const conditional = [];
  const invalid = [];

  for (const entry of entries) {
    if (!standardPackTypes.has(entry.type) || entry.baselineLayer !== "standard") {
      invalid.push(publicPack(entry, "invalid standard pack metadata"));
      continue;
    }
    const appliesTo = entry.appliesToProfiles || [];
    const profileMatch = appliesTo.length > 0 && intersects(appliesTo, selectedProfiles);
    const blAllowed = !baselineLevel || entry.allowedForBL.length === 0 || entry.allowedForBL.includes(baselineLevel);
    const blRecommended = baselineLevel && entry.recommendedForBL.includes(baselineLevel);
    const reason = standardReason(entry, baselineLevel, selectedProfiles);

    if (profileMatch && blAllowed && blRecommended) {
      recommended.push(publicPack(entry, reason));
    } else if (profileMatch && blAllowed) {
      profileCandidates.push(publicPack(entry, `${reason}; not normally recommended for this BL level`));
    } else {
      conditional.push(publicPack(entry, entry.recommendedWhen.length > 0 ? entry.recommendedWhen.join("; ") : "select only when project scope requires it"));
    }
  }

  return {
    recommendedStandardPacks: recommended,
    profileCandidateStandardPacks: profileCandidates,
    conditionalStandardPacks: conditional,
    invalidStandardPacks: invalid,
  };
}

function splitIndustrialOverlays(entries, industrial, selectedProfiles) {
  const selectedSet = new Set(industrial.selectedIndustrialPacks || []);
  const selected = [];
  const optional = [];
  const notSelected = [];

  for (const entry of entries) {
    const appliesTo = Array.isArray(entry.appliesToProfiles) ? entry.appliesToProfiles : [];
    const item = {
      id: entry.id,
      type: entry.type,
      status: entry.status,
      maturityStage: entry.maturityStage || entry.status || "draft",
      baselineLayer: "industrial",
      appliesToProfiles: appliesTo,
      reason: "Optional BL2 overlay; inactive until evidence and compatibility gates pass.",
    };
    if (selectedSet.has(entry.id)) {
      selected.push(item);
      continue;
    }
    if (industrialOverlayTypes.has(entry.type) && (appliesTo.length === 0 || intersects(appliesTo, selectedProfiles))) {
      optional.push(item);
      continue;
    }
    notSelected.push({
      id: entry.id,
      reason: "Not selected unless BL2 risk, capability, evidence, and compatibility require it.",
    });
  }

  return {
    selectedIndustrialOverlays: selected,
    optionalIndustrialOverlays: optional,
    notSelectedIndustrialPacks: notSelected,
  };
}

function recommendationState(standardIndex, industrial, standardSplit) {
  if (!standardIndex.index) return "STANDARD_PACK_INDEX_MISSING";
  if (standardSplit.invalidStandardPacks.length > 0) return "STANDARD_PACK_INDEX_INVALID";
  if (industrial.selectedProfiles.length === 0) return "PROFILE_DECISION_REQUIRED";
  if (!industrial.baselineLevel) return "BASELINE_LEVEL_DECISION_REQUIRED";
  if (standardSplit.recommendedStandardPacks.length === 0) return "NO_STANDARD_PACKS_RECOMMENDED";
  if (industrial.baselineLevel === "BL2_INDUSTRIAL") return "STANDARD_READY_WITH_OPTIONAL_INDUSTRIAL_OVERLAYS";
  return "STANDARD_BASELINE_RECOMMENDATION_READY";
}

function safeNextActions(state, industrial) {
  if (state === "STANDARD_PACK_INDEX_MISSING") {
    return ["Install or reference standard-baseline-packs/index.json before relying on standard baseline recommendations."];
  }
  if (state === "PROFILE_DECISION_REQUIRED") {
    return ["Codex derives and records evidence-backed profiles in docs/project-profile.md before selecting standard packs."];
  }
  if (state === "BASELINE_LEVEL_DECISION_REQUIRED") {
    return ["Codex derives BL0, BL1, or BL2 from scope, risk, and evidence before recording the selection in docs/baseline-selection.md."];
  }
  if (industrial.baselineLevel === "BL2_INDUSTRIAL") {
    return [
      "Record selected standard packs in a Standard Baseline Selection Report.",
      "Review optional industrial overlays internally; enable only those supported by BL2 evidence and compatibility.",
      "Run node scripts/check-standard-baseline-selection.mjs <project> before proceeding.",
    ];
  }
  return [
    "Record selected standard packs in a Standard Baseline Selection Report.",
    "Keep industrial overlays inactive unless project risk justifies BL2 and internal evidence and compatibility gates pass.",
    "Run node scripts/check-standard-baseline-selection.mjs <project> before treating the selection as ready.",
  ];
}

function notSelectedStandard(entries, selectedIds) {
  const selectedSet = new Set(selectedIds);
  return entries
    .filter((entry) => !selectedSet.has(entry.id))
    .map((entry) => ({
      id: entry.id,
      reason: "Not selected unless project profile, BL level, scope, and verified evidence require it.",
    }));
}

export function buildStandardBaselineRecommendation(root, options = {}) {
  const projectRoot = path.resolve(root);
  const industrial = resolveIndustrialBaseline(projectRoot);
  const standardIndex = loadIndex(projectRoot, "standard-baseline-packs");
  const industrialIndex = loadIndex(projectRoot, "industrial-packs");
  const standardEntries = standardIndex.entries.map((entry) => entryWithManifest(standardIndex.root, entry));
  const industrialEntries = industrialIndex.entries;
  const standardSplit = splitStandardPacks(standardEntries, industrial.baselineLevel, industrial.selectedProfiles);
  const industrialSplit = splitIndustrialOverlays(industrialEntries, industrial, industrial.selectedProfiles);
  const selectedStandardIds = [
    ...standardSplit.recommendedStandardPacks.map((pack) => pack.id),
    ...standardSplit.profileCandidateStandardPacks.map((pack) => pack.id),
  ];
  const state = recommendationState(standardIndex, industrial, standardSplit);
  return {
    reportType: options.umbrella ? "BASELINE_PACK_RECOMMENDATION" : "STANDARD_BASELINE_RECOMMENDATION",
    generatedBy: "scripts/resolve-standard-baseline.mjs",
    generatedAt: new Date().toISOString(),
    readOnly: true,
    umbrella: Boolean(options.umbrella),
    canAiEnablePacksNow: "No",
    canAiWriteTargetFilesNow: "No",
    projectRoot,
    standardPacksRoot: standardIndex.root,
    industrialPacksRoot: industrialIndex.root,
    state,
    baselineLevel: industrial.baselineLevel || null,
    selectedProfiles: industrial.selectedProfiles,
    humanApprovalStatus: industrial.humanApprovalStatus || null,
    ...standardSplit,
    ...industrialSplit,
    notSelectedStandardPacks: notSelectedStandard(standardEntries, selectedStandardIds),
    currentIndustrialBaselineState: industrial.state,
    pendingReasons: industrial.pendingReasons,
    evidenceReferenceIssues: industrial.evidenceReferenceIssues,
    safeNextActions: safeNextActions(state, industrial),
    forbiddenActions: [
      "Do not select all standard packs by default.",
      "Do not treat recommendedForBL as activeByDefault.",
      "Do not enable BL2 without evidence, compatibility, and internal baseline gates.",
      "Do not treat draft packs as stable.",
      "Do not treat pack files as real project evidence.",
      "Do not approve target-project writes, implementation, release, production, security, privacy, compliance, payment, or migration decisions.",
    ],
  };
}

function printPackList(title, packs) {
  console.log(`## ${title}`);
  console.log("");
  if (!packs || packs.length === 0) {
    console.log("- None");
  } else {
    for (const pack of packs) {
      console.log(`- ${pack.id} (${pack.status || "unknown"}): ${pack.reason}`);
    }
  }
  console.log("");
}

function printNotSelected(title, packs) {
  console.log(`## ${title}`);
  console.log("");
  if (!packs || packs.length === 0) {
    console.log("- None");
  } else {
    for (const pack of packs) console.log(`- ${pack.id}: ${pack.reason}`);
  }
  console.log("");
}

function printHuman(result) {
  console.log(result.umbrella ? "# Baseline Pack Recommendation" : "# Standard Baseline Recommendation");
  console.log("");
  if (result.umbrella) {
    console.log("This is an umbrella read-only recommendation.");
    console.log("Standard packs are shown first.");
    console.log("Industrial overlays are optional and inactive until evidence and compatibility gates pass.");
    console.log("");
  }
  console.log(`PROJECT_ROOT: ${result.projectRoot}`);
  console.log(`STATE: ${result.state}`);
  console.log(`BASELINE_LEVEL: ${result.baselineLevel || "none"}`);
  console.log(`SELECTED_PROFILES: ${result.selectedProfiles.length > 0 ? result.selectedProfiles.join(", ") : "none"}`);
  console.log(`COMPATIBILITY_APPROVAL_STATUS: ${result.humanApprovalStatus || "not used for technical selection"}`);
  console.log("CAN_AI_ENABLE_PACKS_NOW: No");
  console.log("CAN_AI_WRITE_TARGET_FILES_NOW: No");
  console.log("");
  printPackList("Recommended Standard Packs", result.recommendedStandardPacks);
  printPackList("Profile Candidate Standard Packs", result.profileCandidateStandardPacks);
  printPackList("Conditional Standard Packs", result.conditionalStandardPacks);
  printPackList("Selected Industrial Overlays", result.selectedIndustrialOverlays);
  printPackList("Optional Industrial Overlays", result.optionalIndustrialOverlays);
  printNotSelected("Not Selected Standard Packs", result.notSelectedStandardPacks);
  console.log("## Safe Next Actions");
  console.log("");
  for (const action of result.safeNextActions) console.log(`- ${action}`);
  console.log("");
  console.log("## Forbidden Actions");
  console.log("");
  for (const action of result.forbiddenActions) console.log(`- ${action}`);
  if (result.pendingReasons.length > 0) {
    console.log("");
    console.log("## Pending");
    console.log("");
    for (const reason of result.pendingReasons) console.log(`- ${reason}`);
  }
}

const isMain = process.argv[1]
  && fs.realpathSync(path.resolve(process.argv[1])) === fs.realpathSync(__filename);
if (isMain) {
  const args = parseArgs(process.argv.slice(2));
  const knownFlags = new Set(["json", "umbrella"]);
  for (const key of Object.keys(args)) {
    if (key !== "_" && !knownFlags.has(key)) {
      console.error(`FAIL unknown option: --${key}`);
      process.exit(1);
    }
  }
  const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
  const result = buildStandardBaselineRecommendation(projectRoot, { umbrella: Boolean(args.umbrella) });
  if (args.json) console.log(JSON.stringify(result, null, 2));
  else printHuman(result);
  if (["STANDARD_PACK_INDEX_MISSING", "STANDARD_PACK_INDEX_INVALID"].includes(result.state)) process.exit(1);
}
