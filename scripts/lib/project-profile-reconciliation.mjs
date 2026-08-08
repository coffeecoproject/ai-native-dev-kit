import { createHash } from "node:crypto";

import { evidenceDigest } from "./artifact-schema.mjs";
import { projectAssetLifecycles } from "./project-asset-lifecycle.mjs";

const targetPath = "docs/project-profile.md";
const selectedProfilesHeading = "Selected Profiles";

export function createSelectedProfilesReconciliationAction(options = {}) {
  const source = String(options.currentContent || "");
  const assessment = options.assessment || {};
  if (assessment.state !== "ADDITIVE_RECONCILIATION_REQUIRED") {
    throw new Error("selected profile reconciliation requires an additive assessment");
  }
  const declaredProfiles = normalizedProfiles(assessment.declared_profiles);
  const proposedProfiles = normalizedProfiles(assessment.proposed_profiles);
  const additions = proposedProfiles.filter((profile) => !declaredProfiles.includes(profile));
  const removals = declaredProfiles.filter((profile) => !proposedProfiles.includes(profile));
  if (additions.length === 0 || removals.length > 0) {
    throw new Error("selected profile reconciliation must be additive and non-empty");
  }
  if (evidenceDigestForAssessment(assessment) !== assessment.assessment_digest) {
    throw new Error("selected profile reconciliation assessment digest is not canonical");
  }

  const section = exactH2Section(source, selectedProfilesHeading);
  const sourceProfiles = profilesFromSection(section.content);
  if (!sameProfileSet(sourceProfiles, declaredProfiles)) {
    throw new Error("selected profile reconciliation source section does not match the assessed declaration");
  }
  const replacementProfiles = [...sourceProfiles, ...additions.filter((profile) => !sourceProfiles.includes(profile))];
  const replacement = renderSelectedProfilesSection(replacementProfiles, section.trailingWhitespace);
  const proposed = `${section.prefix}${replacement}${section.suffix}`;
  const basePreservation = {
    mode: "EXACT_MARKDOWN_SECTION_REPLACE",
    sourcePath: targetPath,
    heading: selectedProfilesHeading,
    sourceDigest: digest(source),
    sourceBytes: Buffer.byteLength(source),
    prefixDigest: digest(section.prefix),
    prefixBytes: Buffer.byteLength(section.prefix),
    sourceSectionDigest: digest(section.content),
    sourceSectionBytes: Buffer.byteLength(section.content),
    replacementSectionDigest: digest(replacement),
    replacementSectionBytes: Buffer.byteLength(replacement),
    suffixDigest: digest(section.suffix),
    suffixBytes: Buffer.byteLength(section.suffix),
    declaredProfiles,
    proposedProfiles,
    addedProfiles: additions,
    removedProfiles: [],
    assessmentDigest: assessment.assessment_digest,
  };
  const preservation = {
    ...basePreservation,
    reconciliationDigest: evidenceDigest(basePreservation, []),
  };
  return {
    type: options.backupDir ? "BACKUP_THEN_RECONCILE" : "RECONCILE_PRESERVE",
    path: targetPath,
    source: null,
    reason: "evidence-bound additive reconciliation of only docs/project-profile.md Selected Profiles",
    willWrite: true,
    hashBefore: preservation.sourceDigest,
    inlineContentBase64: Buffer.from(proposed).toString("base64"),
    preservation,
    ownership: { state: "PROJECT_OWNED_EXACT_SECTION_RECONCILIATION" },
    assetLifecycle: projectAssetLifecycles.PROJECT_OWNED_AFTER_BOOTSTRAP,
  };
}

export function validateSelectedProfilesReconciliationAction(action, plan, currentContent) {
  const preservation = action?.preservation;
  if (!action
    || !["RECONCILE_PRESERVE", "BACKUP_THEN_RECONCILE"].includes(action.type)
    || action.path !== targetPath
    || action.source
    || preservation?.mode !== "EXACT_MARKDOWN_SECTION_REPLACE"
    || preservation.sourcePath !== targetPath
    || preservation.heading !== selectedProfilesHeading
    || plan?.operationKind !== "NATIVE_ADOPTION"
    || plan?.arguments?.migrationDepth !== "DOCS_BRIDGE"
    || typeof action.inlineContentBase64 !== "string") return false;

  const source = String(currentContent ?? "");
  if (!source || digest(source) !== action.hashBefore || action.hashBefore !== preservation.sourceDigest) return false;
  const digestFields = [
    "sourceDigest",
    "prefixDigest",
    "sourceSectionDigest",
    "replacementSectionDigest",
    "suffixDigest",
    "assessmentDigest",
    "reconciliationDigest",
  ];
  if (digestFields.some((field) => !/^sha256:[a-f0-9]{64}$/.test(String(preservation[field] || "")))) return false;
  const byteFields = [
    "sourceBytes",
    "prefixBytes",
    "sourceSectionBytes",
    "replacementSectionBytes",
    "suffixBytes",
  ];
  if (byteFields.some((field) => !Number.isSafeInteger(preservation[field]) || preservation[field] < 0)) return false;
  if (preservation.sourceBytes !== preservation.prefixBytes
      + preservation.sourceSectionBytes
      + preservation.suffixBytes) return false;

  let section;
  try { section = exactH2Section(source, selectedProfilesHeading); } catch { return false; }
  if (Buffer.byteLength(section.prefix) !== preservation.prefixBytes
    || Buffer.byteLength(section.content) !== preservation.sourceSectionBytes
    || Buffer.byteLength(section.suffix) !== preservation.suffixBytes
    || digest(section.prefix) !== preservation.prefixDigest
    || digest(section.content) !== preservation.sourceSectionDigest
    || digest(section.suffix) !== preservation.suffixDigest) return false;

  const declaredProfiles = normalizedProfiles(preservation.declaredProfiles);
  const proposedProfiles = normalizedProfiles(preservation.proposedProfiles);
  const addedProfiles = normalizedProfiles(preservation.addedProfiles);
  const sourceProfiles = profilesFromSection(section.content);
  if (!sameProfileSet(sourceProfiles, declaredProfiles)
    || !sameProfileSet(proposedProfiles.filter((profile) => !declaredProfiles.includes(profile)), addedProfiles)
    || declaredProfiles.some((profile) => !proposedProfiles.includes(profile))
    || addedProfiles.length === 0
    || (Array.isArray(preservation.removedProfiles) && preservation.removedProfiles.length > 0)) return false;

  const replacementProfiles = [...sourceProfiles, ...addedProfiles.filter((profile) => !sourceProfiles.includes(profile))];
  const replacement = renderSelectedProfilesSection(replacementProfiles, section.trailingWhitespace);
  if (digest(replacement) !== preservation.replacementSectionDigest
    || Buffer.byteLength(replacement) !== preservation.replacementSectionBytes) return false;
  const proposed = Buffer.from(action.inlineContentBase64, "base64").toString("utf8");
  if (proposed !== `${section.prefix}${replacement}${section.suffix}`) return false;
  const { reconciliationDigest, ...basePreservation } = preservation;
  return reconciliationDigest === evidenceDigest(basePreservation, []);
}

function exactH2Section(content, heading) {
  const lines = String(content || "").split(/(?<=\n)/);
  const headingPattern = new RegExp(`^## ${escapeRegExp(heading)}[ \\t]*(?:\\r?\\n)?$`);
  const starts = [];
  let offset = 0;
  for (const line of lines) {
    if (headingPattern.test(line)) starts.push(offset);
    offset += line.length;
  }
  if (starts.length !== 1) {
    throw new Error(`project profile must contain exactly one ## ${heading} section`);
  }
  const start = starts[0];
  const tail = content.slice(start);
  const nextHeading = tail.slice(1).search(/^## [^#].*$/m);
  const end = nextHeading === -1 ? content.length : start + 1 + nextHeading;
  const sectionContent = content.slice(start, end);
  return {
    prefix: content.slice(0, start),
    content: sectionContent,
    suffix: content.slice(end),
    trailingWhitespace: sectionContent.match(/(?:\r?\n[ \t]*)+$/)?.[0] || "",
  };
}

function profilesFromSection(section) {
  const lines = String(section || "").split(/\r?\n/).slice(1);
  const profiles = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    const match = line.match(/^\s*-\s+([a-z0-9][a-z0-9-]*)\s*$/i);
    if (!match) throw new Error("Selected Profiles must contain only profile bullet identifiers");
    profiles.push(match[1]);
  }
  return [...new Set(profiles)];
}

function renderSelectedProfilesSection(profiles, trailingWhitespace) {
  const lineEnding = String(trailingWhitespace || "").includes("\r\n") ? "\r\n" : "\n";
  const content = [
    `## ${selectedProfilesHeading}`,
    "",
    ...[...new Set(profiles)].map((profile) => `- ${profile}`),
  ].join(lineEnding);
  return `${content}${trailingWhitespace || ""}`;
}

function evidenceDigestForAssessment(assessment) {
  const { assessment_digest: _digest, ...base } = assessment;
  return evidenceDigest(base, []);
}

function normalizedProfiles(value) {
  return [...new Set((Array.isArray(value) ? value : [])
    .map((profile) => String(profile || "").trim())
    .filter((profile) => /^[a-z0-9][a-z0-9-]*$/i.test(profile)))].sort();
}

function sameList(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function sameProfileSet(left, right) {
  return sameList(normalizedProfiles(left), normalizedProfiles(right));
}

function digest(value) {
  return `sha256:${createHash("sha256").update(String(value || "")).digest("hex")}`;
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
