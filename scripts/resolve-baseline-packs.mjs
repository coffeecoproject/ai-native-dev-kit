#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "./lib/args.mjs";
import { resolveIndustrialBaseline } from "./resolve-industrial-baseline.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const kitRoot = path.resolve(__dirname, "..");
const args = parseArgs(process.argv.slice(2));
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputJson = Boolean(args.json);
const knownFlags = new Set(["json"]);

for (const key of Object.keys(args)) {
  if (key !== "_" && !knownFlags.has(key)) {
    console.error(`FAIL unknown option: --${key}`);
    process.exit(1);
  }
}

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

function packIndexRoot(root) {
  const candidates = [
    path.join(root, ".intentos", "industrial-packs"),
    path.join(root, "industrial-packs"),
    path.join(kitRoot, "industrial-packs"),
  ];
  return candidates.find((candidate) => fs.existsSync(path.join(candidate, "index.json"))) || candidates[0];
}

function loadPackEntries(root) {
  const industrialRoot = packIndexRoot(root);
  const index = readJsonIfExists(path.join(industrialRoot, "index.json"));
  return {
    industrialRoot,
    entries: Array.isArray(index?.packs) ? index.packs : [],
  };
}

function candidateReason(pack) {
  const reasons = {
    "auth-permission-industrial": "Use when login, roles, tenants, permissions, or protected resources are in scope.",
    "data-storage-industrial": "Use when schema, persistent records, migrations, backup, or recovery are in scope.",
    "cloudbase-industrial": "Use when cloud functions, cloud storage, access rules, or managed cloud deployment are in scope.",
    "payment-value-transfer-industrial": "Use only when payment, billing, refund, balance, credit, or value transfer exists.",
    "high-risk-change-industrial": "Use only for destructive, irreversible, regulated, production-sensitive, or unusually high-risk changes.",
  };
  return reasons[pack.id] || "Use only when this capability or risk is in the current project scope.";
}

function splitCandidates(entries, selectedProfiles) {
  const primary = [];
  const profileCapabilities = [];
  const conditionalCapabilities = [];
  const riskOverlays = [];

  for (const entry of entries) {
    const appliesTo = Array.isArray(entry.appliesToProfiles) ? entry.appliesToProfiles : [];
    const candidate = {
      id: entry.id,
      type: entry.type,
      status: entry.status,
      maturityStage: entry.maturityStage || entry.status || "draft",
      appliesToProfiles: appliesTo,
      reason: candidateReason(entry),
    };

    if (entry.type === "primary-platform") {
      if (intersects(appliesTo, selectedProfiles)) primary.push(candidate);
      continue;
    }

    if (entry.type === "capability") {
      if (appliesTo.length > 0 && intersects(appliesTo, selectedProfiles)) {
        profileCapabilities.push(candidate);
      } else {
        conditionalCapabilities.push(candidate);
      }
      continue;
    }

    if (entry.type === "risk-overlay") {
      if (intersects(appliesTo, selectedProfiles) || appliesTo.length === 0) {
        riskOverlays.push(candidate);
      }
    }
  }

  return {
    primaryPlatformCandidates: primary,
    profileCapabilityCandidates: profileCapabilities,
    conditionalCapabilityCandidates: conditionalCapabilities,
    riskOverlayCandidates: riskOverlays,
  };
}

function recommendedState(industrial, candidates) {
  if (industrial.selectedProfiles.length === 0) return "PROFILE_DECISION_REQUIRED";
  if (!industrial.baselineLevel) return "BASELINE_LEVEL_DECISION_REQUIRED";
  if (industrial.baselineLevel !== "BL2_INDUSTRIAL") {
    if (industrial.selectedIndustrialPacks.length > 0) return "PACKS_SELECTED_BELOW_BL2_REVIEW_REQUIRED";
    return "PACKS_NOT_ACTIVE";
  }
  if (industrial.selectedIndustrialPacks.length === 0) return "BL2_PACK_SELECTION_REQUIRED";
  if (industrial.state !== "BASELINE_READY") return industrial.state;
  if (candidates.primaryPlatformCandidates.length === 0) return "BASELINE_READY_WITH_NO_PRIMARY_PLATFORM_PACK";
  return "BASELINE_READY";
}

function safeNextActions(state, industrial) {
  if (state === "PROFILE_DECISION_REQUIRED") {
    return [
      "Codex derives and records the project profiles from project evidence and the stated product goal.",
      "Run node scripts/cli.mjs baseline <project> after the profiles are evidence-backed.",
    ];
  }
  if (state === "BASELINE_LEVEL_DECISION_REQUIRED") {
    return [
      "Codex derives BL0, BL1, or BL2 from project scope, risk, and evidence, then records it in docs/baseline-selection.md.",
      "Keep industrial packs inactive until BL2 is internally justified and verified.",
    ];
  }
  if (industrial.baselineLevel !== "BL2_INDUSTRIAL") {
    return [
      "Continue with selected profiles and BL0/BL1 rules.",
      "Do not install industrial packs unless project risk justifies BL2 and internal evidence and compatibility gates pass.",
    ];
  }
  return [
    "Record selected packs in docs/baseline-selection.md.",
    "Record evidence rows in docs/baseline-evidence.md.",
    "Run node scripts/check-industrial-baseline.mjs <project> --bl2-only.",
  ];
}

function notSelected(entries, selectedPackIds) {
  const selectedSet = new Set(selectedPackIds);
  return entries
    .filter((entry) => !selectedSet.has(entry.id))
    .map((entry) => ({
      id: entry.id,
      reason: "Not selected unless project scope, capability, risk, evidence, and compatibility require it.",
    }));
}

function buildRecommendation(root) {
  const industrial = resolveIndustrialBaseline(root);
  const { industrialRoot, entries } = loadPackEntries(root);
  const candidates = splitCandidates(entries, industrial.selectedProfiles);
  const state = recommendedState(industrial, candidates);
  return {
    reportType: "BASELINE_PACK_RECOMMENDATION",
    generatedBy: "scripts/resolve-baseline-packs.mjs",
    generatedAt: new Date().toISOString(),
    deprecated: true,
    replacementCommand: "node scripts/cli.mjs baseline-packs <project>",
    deprecationNote: "This lower-level resolver reports industrial pack candidates only. Use the CLI baseline-packs command for the standard-first umbrella recommendation.",
    readOnly: true,
    canAiEnablePacksNow: "No",
    projectRoot: root,
    industrialPacksRoot: industrialRoot,
    state,
    baselineLevel: industrial.baselineLevel || null,
    selectedProfiles: industrial.selectedProfiles,
    selectedIndustrialPacks: industrial.selectedIndustrialPacks,
    humanApprovalStatus: industrial.humanApprovalStatus || null,
    candidates,
    notSelectedPacks: notSelected(entries, industrial.selectedIndustrialPacks),
    currentIndustrialBaselineState: industrial.state,
    pendingReasons: industrial.pendingReasons,
    evidenceReferenceIssues: industrial.evidenceReferenceIssues,
    safeNextActions: safeNextActions(state, industrial),
    forbiddenActions: [
      "Do not select all packs by default.",
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

function printHuman(result) {
  console.log("# Baseline Pack Recommendation");
  console.log("");
  console.log("> Deprecated lower-level resolver: this command reports industrial pack candidates only. Use `node scripts/cli.mjs baseline-packs <project>` for the standard-first umbrella recommendation.");
  console.log("");
  console.log(`PROJECT_ROOT: ${result.projectRoot}`);
  console.log(`STATE: ${result.state}`);
  console.log(`BASELINE_LEVEL: ${result.baselineLevel || "none"}`);
  console.log(`SELECTED_PROFILES: ${result.selectedProfiles.length > 0 ? result.selectedProfiles.join(", ") : "none"}`);
  console.log(`SELECTED_INDUSTRIAL_PACKS: ${result.selectedIndustrialPacks.length > 0 ? result.selectedIndustrialPacks.join(", ") : "none"}`);
  console.log(`COMPATIBILITY_APPROVAL_STATUS: ${result.humanApprovalStatus || "not used for technical selection"}`);
  console.log("CAN_AI_ENABLE_PACKS_NOW: No");
  console.log("");
  printPackList("Primary Platform Candidates", result.candidates.primaryPlatformCandidates);
  printPackList("Profile Capability Candidates", result.candidates.profileCapabilityCandidates);
  printPackList("Conditional Capability Candidates", result.candidates.conditionalCapabilityCandidates);
  printPackList("Risk Overlay Candidates", result.candidates.riskOverlayCandidates);
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

const result = buildRecommendation(projectRoot);

if (outputJson) {
  console.log(JSON.stringify(result, null, 2));
} else {
  printHuman(result);
}
