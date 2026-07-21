#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseArgs } from "./lib/args.mjs";
import {
  deriveProfilesFromProjectEvidence,
  requiresRealWorldConsent,
} from "./lib/baseline-selection.mjs";
import { sectionBody } from "./lib/markdown.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    return { error: error.message };
  }
}

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

function sortedObject(value) {
  return Object.fromEntries(Object.entries(value).sort(([left], [right]) => left.localeCompare(right)));
}

function mergeRiskGateMappings(profiles) {
  const merged = {};
  for (const item of profiles) {
    for (const [key, values] of Object.entries(item.baseline.riskGateMappings || {})) {
      merged[key] = unique([...(merged[key] || []), ...values]);
    }
  }
  return sortedObject(merged);
}

function effectiveEscalationRules(profiles) {
  return profiles.flatMap((item) => (item.baseline.escalationRules || []).map((rule) => ({
    profileId: item.id,
    when: rule.when || [],
    minLevel: rule.minLevel || item.baseline.defaultTaskLevel || "L1",
  })));
}

function effectiveAiBoundaries(profiles) {
  return {
    may: unique(profiles.flatMap((item) => item.baseline.aiBoundaries?.may || [])),
    mustNot: unique(profiles.flatMap((item) => item.baseline.aiBoundaries?.mustNot || [])),
  };
}

function cleanProfileId(value) {
  return String(value || "")
    .replace(/[`*_#[\]]/g, "")
    .replace(/\(.+\)$/g, "")
    .trim();
}

function isPlaceholder(value) {
  return !value
    || value.includes("<")
    || /^(profile-id|selected profile|none|n\/a|pending|tbd|todo|not_ready)$/i.test(value)
    || /PENDING|TBD|TODO|NOT_READY/i.test(value);
}

function selectedProfilesFromDocument(projectRoot, rel, required = false) {
  const full = path.join(projectRoot, rel);
  if (!fs.existsSync(full)) {
    return {
      path: rel,
      exists: false,
      sectionExists: false,
      selectedProfiles: [],
      pendingReasons: required ? [`missing ${rel}`] : [],
    };
  }

  const content = fs.readFileSync(full, "utf8");
  const body = sectionBody(content, "Selected Profiles");
  if (body === null) {
    return {
      path: rel,
      exists: true,
      sectionExists: false,
      selectedProfiles: [],
      pendingReasons: [`${rel} missing Selected Profiles`],
    };
  }

  const selected = [];
  const pendingReasons = [];
  for (const line of body.split("\n")) {
    const match = line.match(/^\s*-\s+(.+?)\s*$/);
    if (!match) continue;
    const value = cleanProfileId(match[1]);
    if (isPlaceholder(value)) {
      pendingReasons.push(`${rel} has placeholder Selected Profiles`);
      continue;
    }
    selected.push(value);
  }

  if (selected.length === 0 && pendingReasons.length === 0) {
    pendingReasons.push(`${rel} has no selected profiles`);
  }

  return {
    path: rel,
    exists: true,
    sectionExists: true,
    selectedProfiles: unique(selected),
    pendingReasons: unique(pendingReasons),
  };
}

function sameValues(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function profileDocumentConflict(projectProfile, baselineSelection) {
  if (!baselineSelection.exists) return null;
  if (!baselineSelection.sectionExists) {
    return {
      projectProfile: projectProfile.selectedProfiles,
      baselineSelection: baselineSelection.selectedProfiles,
      reason: `${baselineSelection.path} does not provide a Selected Profiles contract`,
    };
  }
  if (sameValues(projectProfile.selectedProfiles, baselineSelection.selectedProfiles)) return null;
  return {
    projectProfile: projectProfile.selectedProfiles,
    baselineSelection: baselineSelection.selectedProfiles,
    reason: `${projectProfile.path} and ${baselineSelection.path} select different profiles`,
  };
}

function projectEvidenceProfileConflict(selectedProfiles, projectEvidence) {
  if (selectedProfiles.length === 0) return null;
  const missingEvidenceProfiles = (projectEvidence.profiles || [])
    .filter((profile) => !selectedProfiles.includes(profile));
  if (missingEvidenceProfiles.length === 0) return null;
  return {
    selectedProfiles,
    inferredProfiles: projectEvidence.profiles,
    missingEvidenceProfiles,
    reason: `documented profile selection omits project-evidenced profile(s): ${missingEvidenceProfiles.join(", ")}`,
  };
}

function parseBulletIds(content, section) {
  const body = sectionBody(content, section);
  if (!body) return [];
  return unique(body.split("\n").flatMap((line) => {
    const match = line.match(/^\s*-\s+(.+?)\s*$/);
    if (!match) return [];
    const value = cleanProfileId(match[1]).split(/\s+-\s+|:/)[0].trim();
    return isPlaceholder(value) ? [] : [value];
  }));
}

function baselineSelectionEnvironment(projectRoot) {
  const rel = "docs/baseline-selection.md";
  const full = path.join(projectRoot, rel);
  if (!fs.existsSync(full)) {
    return {
      path: rel,
      exists: false,
      baselineLevel: null,
      selectedStandardPacks: [],
      selectedIndustrialPacks: [],
      draftStatus: "MISSING",
      technicalSelectionStatus: "MISSING",
    };
  }
  const content = fs.readFileSync(full, "utf8");
  const levelMatches = sectionBody(content, "Baseline Level")?.match(/\bBL[012]_(?:LIGHTWEIGHT|STANDARD|INDUSTRIAL)\b/g) || [];
  const levels = unique(levelMatches);
  return {
    path: rel,
    exists: true,
    baselineLevel: levels.length === 1 ? levels[0] : null,
    selectedStandardPacks: parseBulletIds(content, "Selected Standard Packs"),
    selectedIndustrialPacks: parseBulletIds(content, "Selected Industrial Packs"),
    draftStatus: content.match(/^Draft status:\s*([^\n]+)$/im)?.[1]?.trim() || "MISSING",
    technicalSelectionStatus: content.match(/^Technical selection status:\s*([^\n]+)$/im)?.[1]?.trim() || "MISSING",
  };
}

function standardPackEvidenceState(projectRoot, selection) {
  if (!selection.exists) return { state: "MISSING", issues: [`missing ${selection.path}`] };
  const pendingStatuses = [selection.draftStatus, selection.technicalSelectionStatus]
    .filter((value) => !/^(?:CONFIRMED|VERIFIED|READY)$/i.test(String(value || "")));
  const evidenceFile = path.join(projectRoot, "docs", "baseline-evidence.md");
  const evidenceContent = fs.existsSync(evidenceFile) ? fs.readFileSync(evidenceFile, "utf8") : "";
  const evidenceStatus = evidenceContent.match(/^Draft status:\s*([^\n]+)$/im)?.[1]?.trim()
    || evidenceContent.match(/^Evidence status:\s*([^\n]+)$/im)?.[1]?.trim()
    || "MISSING";
  const issues = [
    ...pendingStatuses.map((status) => `${selection.path} retains non-ready selection status ${status}`),
    ...(!/^(?:CONFIRMED|VERIFIED|READY)$/i.test(evidenceStatus)
      ? [`docs/baseline-evidence.md has non-ready evidence status ${evidenceStatus}`]
      : []),
  ];
  return {
    state: issues.length === 0 ? "READY" : "EVIDENCE_INCOMPLETE",
    evidenceRef: "docs/baseline-evidence.md",
    evidenceStatus,
    issues: unique(issues),
  };
}

function strictEnvironmentBaseline(projectRoot, selection) {
  const required = ["BL1_STANDARD", "BL2_INDUSTRIAL"].includes(selection.baselineLevel);
  const selected = selection.selectedStandardPacks.includes("environment-standard");
  if (!required) {
    return {
      required: false,
      selected,
      state: "NOT_REQUIRED",
      checkStatus: "NOT_RUN",
      baselineRef: "docs/environment-baseline.md",
      issues: [],
    };
  }
  if (!selected) {
    return {
      required: true,
      selected: false,
      state: "PACK_NOT_SELECTED",
      checkStatus: "FAIL",
      baselineRef: "docs/environment-baseline.md",
      issues: [`${selection.path} does not select environment-standard for ${selection.baselineLevel}`],
    };
  }

  const check = spawnSync(process.execPath, [
    path.join(__dirname, "check-environment-baseline.mjs"),
    projectRoot,
    "--strict",
    "--json",
  ], { encoding: "utf8", maxBuffer: 1024 * 1024 * 4 });
  let report = null;
  try {
    report = JSON.parse(check.stdout || "");
  } catch {
    // The strict state remains unavailable and blocking when its JSON contract cannot be read.
  }
  const issues = Array.isArray(report?.checks)
    ? report.checks.filter((item) => item.status !== "PASS").map((item) => item.message).filter(Boolean)
    : [];
  if (check.status === 0 && report?.checkStatus === "PASS") {
    return {
      required: true,
      selected: true,
      state: "READY",
      checkStatus: "PASS",
      baselineRef: report.baselineRef || "docs/environment-baseline.md",
      issues: [],
    };
  }
  return {
    required: true,
    selected: true,
    state: report?.state === "MISSING" ? "MISSING" : "INCOMPLETE",
    checkStatus: report?.checkStatus || "FAIL",
    baselineRef: report?.baselineRef || "docs/environment-baseline.md",
    issues: issues.length > 0
      ? unique(issues)
      : [String(check.stderr || "strict environment baseline validation failed").trim()],
  };
}

function installedPackManifestBindingIssues(projectRoot, selection) {
  const issues = [];
  for (const [registry, packIds] of [
    ["standard-baseline-packs", selection.selectedStandardPacks || []],
    ["industrial-packs", selection.selectedIndustrialPacks || []],
  ]) {
    const index = readJson(path.join(projectRoot, ".intentos", registry, "index.json"));
    if (!index || index.error) {
      issues.push(`installed ${registry} index is unavailable for manifest identity binding`);
      continue;
    }
    const byId = new Map((index.packs || []).map((entry) => [entry.id, entry]));
    for (const packId of packIds) {
      const entry = byId.get(packId);
      if (!entry) {
        issues.push(`selected ${registry} pack has no installed registry identity: ${packId}`);
        continue;
      }
      const manifestPath = path.join(projectRoot, ".intentos", registry, entry.path || "", "pack.json");
      const manifest = readJson(manifestPath);
      if (!manifest || manifest.error) {
        issues.push(`selected ${registry} pack manifest is unavailable or invalid: ${packId}`);
        continue;
      }
      if (manifest.id !== packId) {
        issues.push(`installed ${registry} pack manifest id ${manifest.id || "<missing>"} does not match selected id ${packId}`);
      }
      if (manifest.type !== entry.type) {
        issues.push(`installed ${registry} pack ${packId} type does not match its registry entry`);
      }
      if (!sameValues(
        unique(Array.isArray(manifest.appliesToProfiles) ? manifest.appliesToProfiles : []),
        unique(Array.isArray(entry.appliesToProfiles) ? entry.appliesToProfiles : []),
      )) {
        issues.push(`installed ${registry} pack ${packId} profile coverage does not match its registry entry`);
      }
    }
  }
  return unique(issues);
}

function strictBaselineInstallation(projectRoot, selection) {
  const checker = path.join(__dirname, "check-baseline-installation.mjs");
  if (!fs.existsSync(checker)) {
    return {
      state: "CHECKER_MISSING",
      checkStatus: "FAIL",
      checkerRef: "scripts/check-baseline-installation.mjs",
      receiptBinding: "DELEGATED",
      issues: ["authoritative baseline installation checker is missing"],
      checks: [],
    };
  }
  const check = spawnSync(process.execPath, [
    checker,
    projectRoot,
    "--require-selection",
    "--allow-pending-receipt",
    "--json",
  ], {
    cwd: projectRoot,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 8,
    timeout: 30_000,
  });
  let report = null;
  try {
    report = JSON.parse(check.stdout || "");
  } catch {
    // An unreadable authority report is blocking; stderr is surfaced below.
  }
  const authorityChecks = Array.isArray(report?.checks) ? report.checks : [];
  const failures = authorityChecks
    .filter((item) => item.status === "FAIL")
    .map((item) => item.message)
    .filter(Boolean);
  const unexpectedPending = authorityChecks
    .filter((item) => item.status === "PENDING" && !/Apply Receipt validation is delegated/i.test(String(item.message || "")))
    .map((item) => item.message)
    .filter(Boolean);
  const authorityContractMatches = report?.requireSelection === true
    && report?.allowPendingReceipt === true;
  const manifestBindingIssues = check.status === 0 && report && authorityContractMatches && failures.length === 0
    ? installedPackManifestBindingIssues(projectRoot, selection)
    : [];
  if (check.status === 0
    && report
    && authorityContractMatches
    && failures.length === 0
    && unexpectedPending.length === 0
    && manifestBindingIssues.length === 0) {
    return {
      state: "READY",
      checkStatus: "PASS",
      checkerRef: "scripts/check-baseline-installation.mjs",
      receiptBinding: "DELEGATED",
      authorityStatus: report.status,
      issues: [],
      checks: authorityChecks,
    };
  }
  const processIssue = check.error?.message
    || String(check.stderr || "").trim()
    || (!report ? "authoritative baseline installation report is unavailable or invalid JSON" : "")
    || (!authorityContractMatches ? "authoritative baseline installation report did not confirm the required selection contract" : "")
    || (failures.length === 0 && unexpectedPending.length === 0 && manifestBindingIssues.length === 0
      ? `authoritative baseline installation check exited ${String(check.status)}`
      : "");
  return {
    state: "INCOMPLETE",
    checkStatus: "FAIL",
    checkerRef: "scripts/check-baseline-installation.mjs",
    receiptBinding: "DELEGATED",
    authorityStatus: report?.status || "UNAVAILABLE",
    issues: unique([...failures, ...unexpectedPending, ...manifestBindingIssues, processIssue]),
    checks: authorityChecks,
  };
}

function isAuthoritativeSourceRoot(root) {
  const manifestPath = path.join(root, "intentos-manifest.json");
  const packagePath = path.join(root, "package.json");
  if (!fs.existsSync(manifestPath)
    || !fs.existsSync(packagePath)
    || !fs.existsSync(path.join(root, "VERSION.md"))) return false;
  const manifest = readJson(manifestPath);
  const packageJson = readJson(packagePath);
  return !manifest.error
    && !packageJson.error
    && manifest.mode === "authoritative"
    && manifest.compatibilityPolicy?.authoritative === true
    && packageJson.name === "intentos";
}

function resolveProfileAuthority(projectRoot) {
  const installedRoot = path.join(projectRoot, ".intentos", "profiles");
  const installedMarkers = [
    path.join(projectRoot, ".intentos", "intentos-manifest.json"),
    path.join(projectRoot, ".intentos", "version.json"),
    installedRoot,
  ];
  if (installedMarkers.some((candidate) => fs.existsSync(candidate))) {
    return {
      mode: "INSTALLED_TARGET_COPY",
      root: installedRoot,
      reference: ".intentos/profiles",
      diagnosticOnly: false,
    };
  }

  const runtimeRoot = path.resolve(__dirname, "..");
  if (isAuthoritativeSourceRoot(runtimeRoot)) {
    return {
      mode: "SOURCE_RUN_AUTHORITY_READ_ONLY",
      root: path.join(runtimeRoot, "profiles"),
      reference: "source:profiles",
      diagnosticOnly: true,
    };
  }

  return {
    mode: "INSTALLED_TARGET_COPY_UNAVAILABLE",
    root: installedRoot,
    reference: ".intentos/profiles",
    diagnosticOnly: true,
  };
}

function loadBaseline(authority, profileId) {
  const full = path.join(authority.root, profileId, "baseline.json");
  if (fs.existsSync(full)) {
    const baseline = readJson(full);
    return baseline.error ? { profileId, path: full, error: baseline.error } : { profileId, path: full, baseline };
  }
  return { profileId, path: null, error: "baseline.json not found" };
}

function readProjectVersion(projectRoot) {
  const full = path.join(projectRoot, ".intentos", "version.json");
  if (!fs.existsSync(full)) return {};
  const json = readJson(full);
  return json.error ? {} : json;
}

export function resolvePlatformBaseline(projectRoot) {
  const root = path.resolve(projectRoot);
  const profileAuthority = resolveProfileAuthority(root);
  const projectProfile = selectedProfilesFromDocument(root, "docs/project-profile.md", true);
  const baselineSelectionProfiles = selectedProfilesFromDocument(root, "docs/baseline-selection.md");
  const selectedProfiles = projectProfile.selectedProfiles;
  const projectEvidence = deriveProfilesFromProjectEvidence(root);
  const inferredProfiles = projectEvidence.profiles || [];
  const candidateProfileIds = selectedProfiles.length > 0 ? selectedProfiles : inferredProfiles;
  const documentConflict = profileDocumentConflict(projectProfile, baselineSelectionProfiles);
  const evidenceConflict = projectEvidenceProfileConflict(selectedProfiles, projectEvidence);
  const pendingReasons = unique([
    ...projectProfile.pendingReasons,
    ...(projectEvidence.inspectionIssues || []).map((issue) => issue.message),
    ...(documentConflict ? [documentConflict.reason] : []),
    ...(evidenceConflict ? [evidenceConflict.reason] : []),
    ...(selectedProfiles.length === 0 && inferredProfiles.length > 0
      ? [`Codex inferred profile candidate(s) ${inferredProfiles.join(", ")} from project evidence; selection and satisfaction remain pending`]
      : []),
    ...(selectedProfiles.length === 0 && inferredProfiles.length === 0
      ? ["project evidence is insufficient for a profile; Codex must continue technical inspection"]
      : []),
  ]);
  const loaded = selectedProfiles.map((profileId) => loadBaseline(profileAuthority, profileId));
  const missingProfiles = loaded.filter((item) => item.error).map((item) => ({
    profileId: item.profileId,
    error: item.error,
    path: item.path,
  }));
  const profiles = loaded.filter((item) => !item.error).map((item) => ({
    id: item.baseline.id || item.profileId,
    path: path.relative(root, item.path).replaceAll(path.sep, "/"),
    baseline: item.baseline,
  }));

  const effectiveRequiredDocs = unique(profiles.flatMap((item) => item.baseline.requiredDocs || []));
  const effectiveRecommendedDocs = unique(profiles.flatMap((item) => item.baseline.recommendedDocs || []));
  const effectiveVerification = unique(profiles.flatMap((item) => item.baseline.requiredVerification || []));
  const effectiveVerificationKeywords = unique(profiles.flatMap((item) => item.baseline.verificationKeywords || []));
  const effectiveVerifyScriptKeywords = unique(profiles.flatMap((item) => item.baseline.verifyScriptKeywords || []));
  const effectiveHighRiskKeywords = unique(profiles.flatMap((item) => item.baseline.highRiskKeywords || []));
  const declaredHumanApprovalRequiredFor = unique(profiles.flatMap((item) => item.baseline.humanApprovalRequiredFor || []));
  const effectiveHumanApprovalRequiredFor = declaredHumanApprovalRequiredFor.filter(requiresRealWorldConsent);
  const localTechnicalRiskTerms = declaredHumanApprovalRequiredFor.filter((term) => !requiresRealWorldConsent(term));
  const effectiveRiskGateMappings = mergeRiskGateMappings(profiles);
  const effectiveEscalation = effectiveEscalationRules(profiles);
  const effectiveReleaseChecks = unique(profiles.flatMap((item) => item.baseline.releaseChecks || []));
  const effectiveAiBoundaryRules = effectiveAiBoundaries(profiles);
  const missingRequiredDocs = effectiveRequiredDocs.filter((rel) => !fs.existsSync(path.join(root, rel)));
  const projectVersion = readProjectVersion(root);
  const starter = projectVersion.starter || null;
  const candidateLoaded = candidateProfileIds.map((profileId) => loadBaseline(profileAuthority, profileId));
  const candidateMissingProfiles = candidateLoaded.filter((item) => item.error).map((item) => ({
    profileId: item.profileId,
    error: item.error,
    path: item.path,
  }));
  const candidateProfiles = candidateLoaded.filter((item) => !item.error).map((item) => ({
    id: item.baseline.id || item.profileId,
    path: path.relative(root, item.path).replaceAll(path.sep, "/"),
    baseline: item.baseline,
  }));
  const incompatibleStarters = starter
    ? candidateProfiles
        .filter((item) => {
          const compatible = item.baseline.compatibleStarters || [];
          return !compatible.includes(starter);
        })
        .map((item) => ({
          profileId: item.id,
          starter,
          compatibleStarters: item.baseline.compatibleStarters || [],
          selectionSource: selectedProfiles.includes(item.id) ? "DOCUMENTED" : "PROJECT_EVIDENCE_CANDIDATE",
        }))
    : [];
  const baselineSelection = baselineSelectionEnvironment(root);
  const baselineInstallation = strictBaselineInstallation(root, baselineSelection);
  const environmentBaseline = strictEnvironmentBaseline(root, baselineSelection);
  const standardPackEvidence = standardPackEvidenceState(root, baselineSelection);

  let state = "BASELINE_READY";
  if (projectEvidence.inspectionStatus === "INCOMPLETE") {
    state = "PROJECT_INSPECTION_INCOMPLETE";
  } else if (documentConflict || evidenceConflict || incompatibleStarters.length > 0) {
    state = "PROFILE_INVALID";
  } else if (selectedProfiles.length === 0 && candidateMissingProfiles.length > 0) {
    state = "PROFILE_INVALID";
  } else if (selectedProfiles.length === 0 && inferredProfiles.length > 0) {
    state = "PROFILE_SELECTION_PENDING";
  } else if (selectedProfiles.length === 0) {
    state = "TECHNICAL_DISCOVERY_REQUIRED";
  } else if (missingProfiles.length > 0) {
    state = "PROFILE_INVALID";
  } else if (missingRequiredDocs.length > 0) {
    state = "BASELINE_DOCS_MISSING";
  } else if (pendingReasons.length > 0) {
    state = "MISSING_PROFILE";
  } else {
    state = "BASELINE_READY";
  }
  const strictState = state !== "BASELINE_READY"
    ? state
    : baselineInstallation.state !== "READY"
      ? "BASELINE_INSTALLATION_INCOMPLETE"
      : standardPackEvidence.state !== "READY"
      ? "STANDARD_PACK_EVIDENCE_INCOMPLETE"
      : environmentBaseline.required && environmentBaseline.state !== "READY"
        ? "ENVIRONMENT_BASELINE_INCOMPLETE"
        : "BASELINE_READY";
  const strictBlockingReasons = unique([
    ...(state === "BASELINE_READY" ? [] : pendingReasons),
    ...(documentConflict ? [documentConflict.reason] : []),
    ...(evidenceConflict ? [evidenceConflict.reason] : []),
    ...incompatibleStarters.map((item) => `starter ${item.starter} is incompatible with profile ${item.profileId}`),
    ...(strictState === "BASELINE_INSTALLATION_INCOMPLETE" ? baselineInstallation.issues : []),
    ...(strictState === "STANDARD_PACK_EVIDENCE_INCOMPLETE" ? standardPackEvidence.issues : []),
    ...(strictState === "ENVIRONMENT_BASELINE_INCOMPLETE" ? environmentBaseline.issues : []),
  ]);
  const technicalSelectionStatus = projectEvidence.inspectionStatus === "INCOMPLETE"
    ? "PROJECT_EVIDENCE_INCOMPLETE"
    : documentConflict || evidenceConflict
      ? "PROFILE_EVIDENCE_CONFLICT"
    : incompatibleStarters.length > 0
      ? "STARTER_PROFILE_INCOMPATIBLE"
      : selectedProfiles.length > 0
        ? "DOCUMENTED_SELECTION"
        : inferredProfiles.length > 0
          ? "PROJECT_EVIDENCE_INFERRED_SELECTION_PENDING"
          : "TECHNICAL_DISCOVERY_REQUIRED";

  return {
    projectRoot: root,
    profileRoot: profileAuthority.root,
    profileAuthority: {
      mode: profileAuthority.mode,
      reference: profileAuthority.reference,
      diagnosticOnly: profileAuthority.diagnosticOnly,
    },
    state,
    strictState,
    strictStatus: {
      state: strictState,
      ready: strictState === "BASELINE_READY",
      blockingReasons: strictBlockingReasons,
    },
    selectedProfiles,
    inferredProfiles,
    candidateProfileIds,
    projectEvidence,
    technicalSelection: {
      status: technicalSelectionStatus,
      userInputRequired: false,
      nextAction: technicalSelectionStatus === "PROJECT_EVIDENCE_INCOMPLETE"
        ? "CODEX_REPAIR_PROJECT_INSPECTION"
        : technicalSelectionStatus === "TECHNICAL_DISCOVERY_REQUIRED"
        ? "CODEX_CONTINUE_PROJECT_INSPECTION"
        : technicalSelectionStatus === "PROJECT_EVIDENCE_INFERRED_SELECTION_PENDING"
          ? "CODEX_VALIDATE_AND_RECORD_PROFILE_SELECTION"
          : technicalSelectionStatus === "DOCUMENTED_SELECTION"
            ? "CODEX_VERIFY_PROFILE_SATISFACTION"
            : "CODEX_REPAIR_PROFILE_SELECTION",
    },
    profileDocuments: {
      projectProfile,
      baselineSelection: baselineSelectionProfiles,
      conflict: documentConflict,
      evidenceConflict,
    },
    pendingReasons,
    missingProfiles,
    candidateMissingProfiles,
    profiles,
    starter,
    incompatibleStarters,
    baselineInstallation,
    standardPackEvidence,
    environmentBaseline,
    effectiveRequiredDocs,
    effectiveRecommendedDocs,
    missingRequiredDocs,
    effectiveEscalationRules: effectiveEscalation,
    effectiveRiskGateMappings,
    effectiveVerification,
    effectiveVerificationKeywords,
    effectiveVerifyScriptKeywords,
    effectiveHighRiskKeywords,
    declaredHumanApprovalRequiredFor,
    effectiveHumanApprovalRequiredFor,
    localTechnicalRiskTerms,
    effectiveReleaseChecks,
    effectiveAiBoundaries: effectiveAiBoundaryRules,
  };
}

function printHuman(result) {
  console.log("# Platform Baseline");
  console.log("");
  console.log(`PROJECT_ROOT: ${result.projectRoot}`);
  console.log(`PLATFORM_BASELINE_STATE: ${result.state}`);
  console.log(`PLATFORM_BASELINE_STRICT_STATE: ${result.strictState}`);
  console.log(`BASELINE_INSTALLATION_STATE: ${result.baselineInstallation.state}`);
  console.log(`ENVIRONMENT_BASELINE_STATE: ${result.environmentBaseline.state}`);
  console.log(`TECHNICAL_SELECTION_STATUS: ${result.technicalSelection.status}`);
  console.log(`PROFILE_ROOT: ${result.profileRoot}`);
  console.log(`PROFILE_AUTHORITY_MODE: ${result.profileAuthority.mode}`);
  console.log(`SELECTED_PROFILES: ${result.selectedProfiles.length > 0 ? result.selectedProfiles.join(", ") : "none"}`);
  console.log(`INFERRED_PROFILE_CANDIDATES: ${result.inferredProfiles.length > 0 ? result.inferredProfiles.join(", ") : "none"}`);
  console.log("");
  console.log("## Required Docs");
  console.log("");
  if (result.effectiveRequiredDocs.length === 0) {
    console.log("- None");
  } else {
    for (const rel of result.effectiveRequiredDocs) {
      console.log(`- ${result.missingRequiredDocs.includes(rel) ? "MISSING" : "OK"} ${rel}`);
    }
  }
  console.log("");
  console.log("## Required Verification");
  console.log("");
  if (result.effectiveVerification.length === 0) {
    console.log("- None");
  } else {
    for (const item of result.effectiveVerification) console.log(`- ${item}`);
  }
  console.log("");
  console.log("## Risk Gate Mappings");
  console.log("");
  const mappings = Object.entries(result.effectiveRiskGateMappings);
  if (mappings.length === 0) {
    console.log("- None");
  } else {
    for (const [key, values] of mappings) console.log(`- ${key}: ${values.join(", ")}`);
  }
  console.log("");
  console.log("## Real-world Consent Required For");
  console.log("");
  if (result.effectiveHumanApprovalRequiredFor.length === 0) {
    console.log("- None");
  } else {
    for (const item of result.effectiveHumanApprovalRequiredFor) console.log(`- ${item}`);
  }
  console.log("");
  console.log("## Release Checks");
  console.log("");
  if (result.effectiveReleaseChecks.length === 0) {
    console.log("- None");
  } else {
    for (const item of result.effectiveReleaseChecks) console.log(`- ${item}`);
  }
  if (result.pendingReasons.length > 0) {
    console.log("");
    console.log("## Pending");
    console.log("");
    for (const reason of result.pendingReasons) console.log(`- ${reason}`);
  }
  if (result.missingProfiles.length > 0) {
    console.log("");
    console.log("## Missing Profiles");
    console.log("");
    for (const item of result.missingProfiles) console.log(`- ${item.profileId}: ${item.error}`);
  }
}

const isMain = process.argv[1]
  && fs.realpathSync(path.resolve(process.argv[1])) === fs.realpathSync(__filename);
if (isMain) {
  const args = parseArgs(process.argv.slice(2));
  const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
  const result = resolvePlatformBaseline(projectRoot);
  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    printHuman(result);
  }
  if (result.state === "PROFILE_INVALID") process.exit(1);
}
