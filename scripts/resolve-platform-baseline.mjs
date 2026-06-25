#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseArgs(argv) {
  const parsed = { _: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (!item.startsWith("--")) {
      parsed._.push(item);
      continue;
    }
    const key = item.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      parsed[key] = true;
    } else {
      parsed[key] = next;
      index += 1;
    }
  }
  return parsed;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function sectionBody(content, heading) {
  const match = content.match(new RegExp(`^## ${escapeRegExp(heading)}\\s*$`, "m"));
  if (!match) return null;
  const start = match.index;
  const lineEnd = content.indexOf("\n", start);
  const bodyStart = lineEnd === -1 ? content.length : lineEnd + 1;
  const next = content.slice(bodyStart).search(/^## /m);
  const bodyEnd = next === -1 ? content.length : bodyStart + next;
  return content.slice(bodyStart, bodyEnd).trim();
}

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

function selectedProfilesFromProjectProfile(projectRoot) {
  const rel = "docs/project-profile.md";
  const full = path.join(projectRoot, rel);
  if (!fs.existsSync(full)) {
    return { selectedProfiles: [], pendingReasons: [`missing ${rel}`] };
  }

  const content = fs.readFileSync(full, "utf8");
  const body = sectionBody(content, "Selected Profiles");
  if (body === null) {
    return { selectedProfiles: [], pendingReasons: [`${rel} missing Selected Profiles`] };
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

  return { selectedProfiles: unique(selected), pendingReasons: unique(pendingReasons) };
}

function kitProfilesRoot(projectRoot) {
  const candidates = [
    path.join(projectRoot, ".ai-native", "profiles"),
    path.join(projectRoot, "profiles"),
    path.resolve(__dirname, "..", "profiles"),
  ];
  return candidates.find((candidate) => fs.existsSync(candidate)) || candidates[0];
}

function loadBaseline(projectRoot, profileId) {
  const roots = [
    path.join(projectRoot, ".ai-native", "profiles"),
    path.join(projectRoot, "profiles"),
    path.resolve(__dirname, "..", "profiles"),
  ];
  for (const root of roots) {
    const full = path.join(root, profileId, "baseline.json");
    if (!fs.existsSync(full)) continue;
    const baseline = readJson(full);
    return baseline.error ? { profileId, path: full, error: baseline.error } : { profileId, path: full, baseline };
  }
  return { profileId, path: null, error: "baseline.json not found" };
}

function readProjectVersion(projectRoot) {
  const full = path.join(projectRoot, ".ai-native", "version.json");
  if (!fs.existsSync(full)) return {};
  const json = readJson(full);
  return json.error ? {} : json;
}

export function resolvePlatformBaseline(projectRoot) {
  const root = path.resolve(projectRoot);
  const { selectedProfiles, pendingReasons } = selectedProfilesFromProjectProfile(root);
  const loaded = selectedProfiles.map((profileId) => loadBaseline(root, profileId));
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
  const effectiveHumanApprovalRequiredFor = unique(profiles.flatMap((item) => item.baseline.humanApprovalRequiredFor || []));
  const effectiveRiskGateMappings = mergeRiskGateMappings(profiles);
  const effectiveEscalation = effectiveEscalationRules(profiles);
  const effectiveReleaseChecks = unique(profiles.flatMap((item) => item.baseline.releaseChecks || []));
  const effectiveAiBoundaryRules = effectiveAiBoundaries(profiles);
  const missingRequiredDocs = effectiveRequiredDocs.filter((rel) => !fs.existsSync(path.join(root, rel)));
  const projectVersion = readProjectVersion(root);
  const starter = projectVersion.starter || null;
  const incompatibleStarters = starter
    ? profiles
        .filter((item) => {
          const compatible = item.baseline.compatibleStarters || [];
          return compatible.length > 0 && !compatible.includes(starter);
        })
        .map((item) => ({ profileId: item.id, starter, compatibleStarters: item.baseline.compatibleStarters || [] }))
    : [];

  let state = "BASELINE_READY";
  if (selectedProfiles.length === 0) {
    state = "MISSING_PROFILE";
  } else if (missingProfiles.length > 0) {
    state = "PROFILE_INVALID";
  } else if (missingRequiredDocs.length > 0) {
    state = "BASELINE_DOCS_MISSING";
  } else if (pendingReasons.length > 0) {
    state = "MISSING_PROFILE";
  } else {
    state = "BASELINE_READY";
  }

  return {
    projectRoot: root,
    profileRoot: kitProfilesRoot(root),
    state,
    selectedProfiles,
    pendingReasons,
    missingProfiles,
    profiles,
    starter,
    incompatibleStarters,
    effectiveRequiredDocs,
    effectiveRecommendedDocs,
    missingRequiredDocs,
    effectiveEscalationRules: effectiveEscalation,
    effectiveRiskGateMappings,
    effectiveVerification,
    effectiveVerificationKeywords,
    effectiveVerifyScriptKeywords,
    effectiveHighRiskKeywords,
    effectiveHumanApprovalRequiredFor,
    effectiveReleaseChecks,
    effectiveAiBoundaries: effectiveAiBoundaryRules,
  };
}

function printHuman(result) {
  console.log("# Platform Baseline");
  console.log("");
  console.log(`PROJECT_ROOT: ${result.projectRoot}`);
  console.log(`PLATFORM_BASELINE_STATE: ${result.state}`);
  console.log(`PROFILE_ROOT: ${result.profileRoot}`);
  console.log(`SELECTED_PROFILES: ${result.selectedProfiles.length > 0 ? result.selectedProfiles.join(", ") : "none"}`);
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
  console.log("## Human Approval");
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
