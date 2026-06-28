#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "./lib/args.mjs";
import { escapeRegExp, sectionBody } from "./lib/markdown.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const baselineLevels = ["BL0_LIGHTWEIGHT", "BL1_STANDARD", "BL2_INDUSTRIAL"];
const decisionStatuses = ["PENDING", "APPROVED", "REJECTED"];

function readJson(fullPath) {
  try {
    return JSON.parse(fs.readFileSync(fullPath, "utf8"));
  } catch (error) {
    return { error: error.message };
  }
}

function readIfExists(fullPath) {
  return fs.existsSync(fullPath) ? fs.readFileSync(fullPath, "utf8") : "";
}

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

function mergeObjectArrays(objects) {
  const merged = {};
  for (const item of objects) {
    for (const [key, values] of Object.entries(item || {})) {
      merged[key] = unique([...(merged[key] || []), ...(Array.isArray(values) ? values : [])]);
    }
  }
  return Object.fromEntries(Object.entries(merged).sort(([left], [right]) => left.localeCompare(right)));
}

function cleanListValue(value) {
  return String(value || "")
    .replace(/[`*_#[\]]/g, "")
    .replace(/\(.+\)$/g, "")
    .trim();
}

function isPlaceholder(value) {
  return !value
    || value.includes("<")
    || /^(profile-id|industrial-pack-id|selected profile|selected pack|none|n\/a|pending|tbd|todo|not_ready)$/i.test(value)
    || /PENDING|TBD|TODO|NOT_READY/i.test(value);
}

function parseBulletList(body, tokenPattern = null) {
  if (!body) return [];
  const values = [];
  for (const line of body.split("\n")) {
    const match = line.match(/^\s*-\s+(.+?)\s*$/);
    if (!match) continue;
    const raw = cleanListValue(match[1]);
    if (isPlaceholder(raw)) continue;
    if (tokenPattern) {
      const token = raw.match(tokenPattern)?.[0];
      if (token && !isPlaceholder(token)) values.push(token);
      continue;
    }
    const beforeComment = raw.split(/\s+-\s+|:/)[0].trim();
    if (!isPlaceholder(beforeComment)) values.push(beforeComment);
  }
  return unique(values);
}

function parseSingleEnum(body, allowed) {
  if (!body) return null;
  const allowedPattern = allowed.map(escapeRegExp).join("|");
  for (const line of body.split("\n")) {
    const matches = line.match(new RegExp(`\\b(${allowedPattern})\\b`, "g")) || [];
    const distinct = unique(matches);
    if (distinct.length === 1) return distinct[0];
  }
  const matches = body.match(new RegExp(`\\b(${allowedPattern})\\b`, "g")) || [];
  const distinct = unique(matches);
  return distinct.length === 1 ? distinct[0] : null;
}

function selectedProfilesFromProjectProfile(projectRoot) {
  const rel = "docs/project-profile.md";
  const full = path.join(projectRoot, rel);
  if (!fs.existsSync(full)) return [];
  const body = sectionBody(fs.readFileSync(full, "utf8"), "Selected Profiles");
  return parseBulletList(body);
}

function readBaselineSelection(projectRoot) {
  const rel = "docs/baseline-selection.md";
  const full = path.join(projectRoot, rel);
  if (!fs.existsSync(full)) {
    return {
      path: rel,
      exists: false,
      baselineLevel: null,
      selectedProfiles: [],
      selectedIndustrialPacks: [],
      humanApprovalStatus: null,
      pendingReasons: [`missing ${rel}`],
    };
  }

  const content = fs.readFileSync(full, "utf8");
  const baselineLevel = parseSingleEnum(sectionBody(content, "Baseline Level"), baselineLevels);
  const selectedProfiles = parseBulletList(sectionBody(content, "Selected Profiles"));
  const selectedIndustrialPacks = parseBulletList(
    sectionBody(content, "Selected Industrial Packs"),
    /\b[a-z0-9][a-z0-9-]*-industrial\b/i,
  );
  const humanApprovalStatus = parseSingleEnum(sectionBody(content, "Human Approval"), decisionStatuses);
  const pendingReasons = [];
  if (!baselineLevel) pendingReasons.push(`${rel} has no confirmed Baseline Level`);
  if (!humanApprovalStatus) pendingReasons.push(`${rel} has no single Human Approval status`);

  return {
    path: rel,
    exists: true,
    baselineLevel,
    selectedProfiles,
    selectedIndustrialPacks,
    humanApprovalStatus,
    pendingReasons,
  };
}

function industrialPacksRoot(projectRoot) {
  const candidates = [
    path.join(projectRoot, ".ai-native", "industrial-packs"),
    path.join(projectRoot, "industrial-packs"),
    path.resolve(__dirname, "..", "industrial-packs"),
  ];
  return candidates.find((candidate) => fs.existsSync(candidate)) || candidates[0];
}

function loadPackIndex(projectRoot) {
  const root = industrialPacksRoot(projectRoot);
  const indexPath = path.join(root, "index.json");
  if (!fs.existsSync(indexPath)) {
    return { root, path: indexPath, error: "index.json not found", index: null, entries: [] };
  }
  const index = readJson(indexPath);
  if (index.error) {
    return { root, path: indexPath, error: index.error, index: null, entries: [] };
  }
  return { root, path: indexPath, error: null, index, entries: Array.isArray(index.packs) ? index.packs : [] };
}

function loadPack(projectRoot, packRoot, entry) {
  const packPath = path.join(packRoot, entry.path || "");
  const manifestPath = path.join(packPath, "pack.json");
  if (entry.status === "planned") {
    return {
      id: entry.id,
      status: entry.status,
      type: entry.type,
      path: entry.path,
      displayName: entry.displayName,
      appliesToProfiles: Array.isArray(entry.appliesToProfiles) ? entry.appliesToProfiles : [],
      available: false,
      pendingReason: "pack is planned and has no executable baseline yet",
    };
  }
  if (!fs.existsSync(manifestPath)) {
    return {
      id: entry.id,
      status: entry.status,
      type: entry.type,
      path: entry.path,
      displayName: entry.displayName,
      appliesToProfiles: Array.isArray(entry.appliesToProfiles) ? entry.appliesToProfiles : [],
      available: false,
      error: "pack.json not found",
    };
  }
  const manifest = readJson(manifestPath);
  if (manifest.error) {
    return {
      id: entry.id,
      status: entry.status,
      type: entry.type,
      path: entry.path,
      displayName: entry.displayName,
      appliesToProfiles: Array.isArray(entry.appliesToProfiles) ? entry.appliesToProfiles : [],
      available: false,
      error: manifest.error,
    };
  }
  return {
    id: manifest.id || entry.id,
    status: manifest.status || entry.status,
    type: manifest.type || entry.type,
    path: entry.path,
    displayName: manifest.displayName || entry.displayName,
    appliesToProfiles: Array.isArray(manifest.appliesToProfiles) ? manifest.appliesToProfiles : [],
    available: true,
    manifestPath: path.relative(projectRoot, manifestPath).replaceAll(path.sep, "/"),
    manifest,
  };
}

function projectRelPackDoc(pack, relPath) {
  const prefix = pack.manifestPath
    ? path.dirname(pack.manifestPath)
    : path.join(".ai-native", "industrial-packs", pack.path || "");
  return path.join(prefix, relPath).replaceAll(path.sep, "/");
}

function packProfileCompatibility(pack, selectedProfiles) {
  const appliesTo = pack.appliesToProfiles || [];
  if (appliesTo.length === 0) return null;
  if (selectedProfiles.length === 0) {
    return {
      packId: pack.id,
      reason: "selected profiles are not available",
      appliesToProfiles: appliesTo,
      selectedProfiles,
    };
  }
  if (appliesTo.some((profile) => selectedProfiles.includes(profile))) return null;
  return {
    packId: pack.id,
    reason: "selected pack does not apply to selected profiles",
    appliesToProfiles: appliesTo,
    selectedProfiles,
  };
}

function packConflicts(pack, selectedPackIds) {
  const conflicts = pack.manifest?.conflictsWith || [];
  return conflicts.filter((packId) => selectedPackIds.includes(packId)).map((packId) => ({
    packId: pack.id,
    conflictsWith: packId,
  }));
}

function missingBaselineEvidenceTerms(projectRoot, requiredEvidence) {
  const rel = "docs/baseline-evidence.md";
  const content = readIfExists(path.join(projectRoot, rel)).toLowerCase();
  if (!content) return [];
  return unique(Object.values(requiredEvidence || {})
    .flat()
    .filter((term) => !content.includes(String(term).toLowerCase())));
}

function normalizeHeader(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function isFilledValue(value) {
  return Boolean(String(value || "").trim())
    && !String(value || "").includes("<")
    && !/^(pending|tbd|todo|not audited|not_ready|yes \/ no)$/i.test(String(value || "").trim());
}

function parseMarkdownTable(body) {
  if (!body) return [];
  const lines = body
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("|") && line.endsWith("|"));
  if (lines.length < 3) return [];

  const headers = lines[0].split("|").slice(1, -1).map(normalizeHeader);
  const separatorIndex = lines.findIndex((line, index) => index > 0 && /^\|\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|$/.test(line));
  if (separatorIndex === -1) return [];

  return lines.slice(separatorIndex + 1).map((line) => {
    const cells = line.split("|").slice(1, -1).map((cell) => cell.trim());
    const row = {};
    headers.forEach((header, index) => {
      row[header] = cells[index] || "";
    });
    return row;
  }).filter((row) => Object.values(row).some(isFilledValue));
}

function normalizeRequirement(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[`*_]/g, "")
    .replace(/\s+/g, " ");
}

function splitEvidenceRefs(value) {
  return String(value || "")
    .split(/[,;]/)
    .map((item) => item.trim().replace(/^`|`$/g, ""))
    .filter((item) => item && !item.includes("<"));
}

function parseBaselineEvidence(projectRoot) {
  const rel = "docs/baseline-evidence.md";
  const full = path.join(projectRoot, rel);
  if (!fs.existsSync(full)) {
    return { path: rel, exists: false, rows: [] };
  }
  const content = fs.readFileSync(full, "utf8");
  return {
    path: rel,
    exists: true,
    rows: parseMarkdownTable(sectionBody(content, "Evidence Index")),
  };
}

function validateEvidenceReferences(projectRoot, requiredEvidence, evidence) {
  if (!evidence.exists) return [`missing ${evidence.path}`];
  const requiredTerms = unique(Object.values(requiredEvidence || {}).flat());
  if (requiredTerms.length === 0) return [];

  const rowsByRequirement = new Map();
  for (const row of evidence.rows) {
    const requirement = normalizeRequirement(row.requirement);
    if (requirement) rowsByRequirement.set(requirement, row);
  }

  const issues = [];
  for (const term of requiredTerms) {
    const row = rowsByRequirement.get(normalizeRequirement(term));
    if (!row) {
      issues.push(`missing evidence row: ${term}`);
      continue;
    }
    const status = String(row.status || "").trim().toLowerCase();
    if (status === "done") {
      const refs = splitEvidenceRefs(row["evidence ref"]);
      if (refs.length === 0) {
        issues.push(`missing evidence ref for done requirement: ${term}`);
        continue;
      }
      for (const ref of refs) {
        if (path.isAbsolute(ref) || ref.split(/[\\/]/).includes("..")) {
          issues.push(`unsafe evidence ref for ${term}: ${ref}`);
        } else if (!fs.existsSync(path.join(projectRoot, ref))) {
          issues.push(`missing evidence ref for ${term}: ${ref}`);
        }
      }
    } else if (status === "not applicable") {
      if (!isFilledValue(row["reason if skipped"])) {
        issues.push(`missing not applicable reason for: ${term}`);
      }
    } else {
      issues.push(`evidence status is not complete for ${term}: ${row.status || "none"}`);
    }
  }
  return unique(issues);
}

function riskOverlayEvidenceIssues(projectRoot, packs, baselineEvidence) {
  const content = readIfExists(path.join(projectRoot, "docs", "baseline-evidence.md")).toLowerCase();
  const issues = [];
  const riskKeywordsByPack = {
    "payment-value-transfer-industrial": [
      "payment",
      "refund",
      "value movement",
      "balance",
      "credit",
      "billing",
      "reconciliation",
      "idempotency",
      "duplicate-submit",
    ],
    "high-risk-change-industrial": [
      "risk classification",
      "blast radius",
      "approval scope",
      "rollback",
      "mitigation",
      "migration",
      "production",
      "destructive",
      "incident",
    ],
  };

  for (const pack of packs.filter((item) => item.type === "risk-overlay")) {
    const keywords = riskKeywordsByPack[pack.id] || ["risk classification", "approval scope", "rollback"];
    if (!keywords.some((keyword) => content.includes(keyword))) {
      issues.push(`${pack.id} selected without risk-specific evidence`);
      continue;
    }
    if (!baselineEvidence.exists || baselineEvidence.rows.length === 0) {
      issues.push(`${pack.id} selected without docs/baseline-evidence.md risk rows`);
    }
  }
  return unique(issues);
}

export function resolveIndustrialBaseline(projectRoot) {
  const root = path.resolve(projectRoot);
  const selection = readBaselineSelection(root);
  const selectedProfiles = unique([
    ...selection.selectedProfiles,
    ...selectedProfilesFromProjectProfile(root),
  ]);
  const packIndex = loadPackIndex(root);
  const entriesById = new Map(packIndex.entries.map((entry) => [entry.id, entry]));
  const unknownPacks = selection.selectedIndustrialPacks.filter((packId) => !entriesById.has(packId));
  const knownExecutablePackIds = unique(packIndex.entries
    .filter((entry) => entry && entry.status !== "planned" && entry.id)
    .map((entry) => entry.id));
  const selectedPacks = selection.selectedIndustrialPacks
    .filter((packId) => entriesById.has(packId))
    .map((packId) => loadPack(root, packIndex.root, entriesById.get(packId)));
  const executablePacks = selectedPacks.filter((pack) => pack.available && !pack.error);
  const plannedPacks = selectedPacks.filter((pack) => pack.status === "planned").map((pack) => pack.id);
  const invalidPacks = selectedPacks.filter((pack) => pack.error).map((pack) => ({
    packId: pack.id,
    error: pack.error,
  }));
  const incompatiblePacks = executablePacks
    .map((pack) => packProfileCompatibility(pack, selectedProfiles))
    .filter(Boolean);
  const conflicts = executablePacks.flatMap((pack) => packConflicts(pack, selection.selectedIndustrialPacks));

  const requiredEvidence = mergeObjectArrays(executablePacks.map((pack) => pack.manifest?.requiredEvidence));
  const effectiveRiskMappings = mergeObjectArrays(executablePacks.map((pack) => pack.manifest?.riskMappings));
  const effectiveRequiredBaselines = unique(executablePacks.flatMap((pack) => (pack.manifest.requiredBaselines || []).map((rel) => projectRelPackDoc(pack, rel))));
  const effectiveRequiredExecutionDocs = unique(executablePacks.flatMap((pack) => (pack.manifest.requiredExecutionDocs || []).map((rel) => projectRelPackDoc(pack, rel))));
  const effectiveRequiredAuditDocs = unique(executablePacks.flatMap((pack) => (pack.manifest.requiredAuditDocs || []).map((rel) => projectRelPackDoc(pack, rel))));
  const effectiveRequiredChecklists = unique(executablePacks.flatMap((pack) => (pack.manifest.requiredChecklists || []).map((rel) => projectRelPackDoc(pack, rel))));
  const effectiveRequiredTemplates = unique(executablePacks.flatMap((pack) => (pack.manifest.requiredTemplates || []).map((rel) => projectRelPackDoc(pack, rel))));
  const effectiveTaskLevelEscalation = executablePacks.flatMap((pack) => (pack.manifest.taskLevelEscalation || []).map((rule) => ({
    packId: pack.id,
    when: Array.isArray(rule.when) ? rule.when : [],
    minTaskLevel: rule.minTaskLevel || "L1",
  })));
  const effectiveHumanApprovalRequiredFor = unique(executablePacks.flatMap((pack) => pack.manifest.humanApprovalRequiredFor || []));
  const requiredProjectDocs = selection.baselineLevel === "BL2_INDUSTRIAL"
    ? ["docs/baseline-selection.md", "docs/baseline-evidence.md"]
    : [];
  const missingProjectDocs = requiredProjectDocs.filter((rel) => !fs.existsSync(path.join(root, rel)));
  const missingEvidenceTerms = selection.baselineLevel === "BL2_INDUSTRIAL"
    ? missingBaselineEvidenceTerms(root, requiredEvidence)
    : [];
  const baselineEvidence = parseBaselineEvidence(root);
  const evidenceReferenceIssues = selection.baselineLevel === "BL2_INDUSTRIAL"
    ? validateEvidenceReferences(root, requiredEvidence, baselineEvidence)
    : [];
  const riskOverlayIssues = selection.baselineLevel === "BL2_INDUSTRIAL"
    ? riskOverlayEvidenceIssues(root, executablePacks, baselineEvidence)
    : [];

  let state = "NOT_SELECTED";
  const pendingReasons = [...selection.pendingReasons];
  if (!selection.baselineLevel) {
    state = "NOT_SELECTED";
  } else if (selection.baselineLevel !== "BL2_INDUSTRIAL") {
    state = "NOT_APPLICABLE";
  } else if (packIndex.error) {
    state = "PACK_INDEX_MISSING";
  } else if (selection.selectedIndustrialPacks.length === 0) {
    state = "PACKS_NOT_SELECTED";
    pendingReasons.push("BL2_INDUSTRIAL selected but no industrial packs are selected");
  } else if (unknownPacks.length > 0 || invalidPacks.length > 0) {
    state = "PACKS_INVALID";
  } else if (plannedPacks.length > 0) {
    state = "PACKS_NOT_AVAILABLE";
  } else if (incompatiblePacks.length > 0 || conflicts.length > 0) {
    state = "PACKS_INCOMPATIBLE";
  } else if (missingProjectDocs.length > 0) {
    state = "EVIDENCE_MISSING";
    pendingReasons.push(`missing BL2 project docs: ${missingProjectDocs.join(", ")}`);
  } else if (missingEvidenceTerms.length > 0 || evidenceReferenceIssues.length > 0 || riskOverlayIssues.length > 0) {
    state = "EVIDENCE_MISSING";
    if (missingEvidenceTerms.length > 0) {
      pendingReasons.push(`missing baseline evidence terms: ${missingEvidenceTerms.join(", ")}`);
    }
    if (evidenceReferenceIssues.length > 0) {
      pendingReasons.push(`baseline evidence reference issues: ${evidenceReferenceIssues.join("; ")}`);
    }
    if (riskOverlayIssues.length > 0) {
      pendingReasons.push(`risk overlay evidence issues: ${riskOverlayIssues.join("; ")}`);
    }
  } else if (selection.humanApprovalStatus !== "APPROVED") {
    state = "NEEDS_HUMAN_APPROVAL";
    pendingReasons.push("BL2_INDUSTRIAL requires approved Human Approval status");
  } else {
    state = "BASELINE_READY";
  }

  return {
    projectRoot: root,
    industrialPacksRoot: packIndex.root,
    state,
    baselineLevel: selection.baselineLevel,
    selectedProfiles,
    selectedIndustrialPacks: selection.selectedIndustrialPacks,
    humanApprovalStatus: selection.humanApprovalStatus,
    selection,
    packIndexPath: packIndex.path ? path.relative(root, packIndex.path).replaceAll(path.sep, "/") : null,
    packIndexError: packIndex.error,
    knownIndustrialPacks: knownExecutablePackIds,
    unknownPacks,
    plannedPacks,
    invalidPacks,
    incompatiblePacks,
    conflicts,
    selectedPacks: selectedPacks.map((pack) => ({
      id: pack.id,
      type: pack.type,
      status: pack.status,
      path: pack.path,
      displayName: pack.displayName,
      appliesToProfiles: pack.appliesToProfiles,
      available: Boolean(pack.available),
      manifestPath: pack.manifestPath || null,
      error: pack.error || null,
      pendingReason: pack.pendingReason || null,
    })),
    requiredProjectDocs,
    missingProjectDocs,
    effectiveRequiredBaselines,
    effectiveRequiredExecutionDocs,
    effectiveRequiredAuditDocs,
    effectiveRequiredChecklists,
    effectiveRequiredTemplates,
    effectiveRiskMappings,
    effectiveTaskLevelEscalation,
    effectiveRequiredEvidence: requiredEvidence,
    baselineEvidence,
    missingEvidenceTerms,
    evidenceReferenceIssues,
    riskOverlayEvidenceIssues: riskOverlayIssues,
    effectiveHumanApprovalRequiredFor,
    pendingReasons: unique(pendingReasons),
  };
}

function printHuman(result) {
  console.log("# Industrial Baseline");
  console.log("");
  console.log(`PROJECT_ROOT: ${result.projectRoot}`);
  console.log(`INDUSTRIAL_BASELINE_STATE: ${result.state}`);
  console.log(`BASELINE_LEVEL: ${result.baselineLevel || "none"}`);
  console.log(`SELECTED_PROFILES: ${result.selectedProfiles.length > 0 ? result.selectedProfiles.join(", ") : "none"}`);
  console.log(`SELECTED_INDUSTRIAL_PACKS: ${result.selectedIndustrialPacks.length > 0 ? result.selectedIndustrialPacks.join(", ") : "none"}`);
  console.log(`HUMAN_APPROVAL_STATUS: ${result.humanApprovalStatus || "none"}`);
  console.log("");
  console.log("## Selected Packs");
  console.log("");
  if (result.selectedPacks.length === 0) {
    console.log("- None");
  } else {
    for (const pack of result.selectedPacks) {
      const status = pack.available ? "OK" : pack.error ? "INVALID" : "PENDING";
      console.log(`- ${status} ${pack.id} (${pack.status})`);
    }
  }
  console.log("");
  console.log("## Required Project Docs");
  console.log("");
  if (result.requiredProjectDocs.length === 0) {
    console.log("- None");
  } else {
    for (const rel of result.requiredProjectDocs) {
      console.log(`- ${result.missingProjectDocs.includes(rel) ? "MISSING" : "OK"} ${rel}`);
    }
  }
  console.log("");
  console.log("## Human Approval Required For");
  console.log("");
  if (result.effectiveHumanApprovalRequiredFor.length === 0) {
    console.log("- None");
  } else {
    for (const item of result.effectiveHumanApprovalRequiredFor) console.log(`- ${item}`);
  }
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
  const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
  const result = resolveIndustrialBaseline(projectRoot);
  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    printHuman(result);
  }
  if (["PACK_INDEX_MISSING", "PACKS_INVALID", "PACKS_NOT_AVAILABLE", "PACKS_INCOMPATIBLE"].includes(result.state)) {
    process.exit(1);
  }
}
