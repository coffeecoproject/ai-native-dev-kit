#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { parseArgs } from "./lib/args.mjs";
import {
  evaluateIndustrialPackCompatibility,
  requiresRealWorldConsent,
} from "./lib/baseline-selection.mjs";
import { escapeRegExp, sectionBody } from "./lib/markdown.mjs";
import {
  assertInsideRoot,
  assertNoSymlinkInPath,
  assertSafeRelativePath,
  isSafeRelativePath,
} from "./lib/path-safety.mjs";
import { canonicalFileDigest, projectIdentity } from "./lib/evidence-authority.mjs";
import { resolveRuntimeTrustBinding } from "./lib/verification-runtime-consumer.mjs";

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
  if (!fs.existsSync(full)) {
    return { path: rel, exists: false, sectionExists: false, selectedProfiles: [] };
  }
  const body = sectionBody(fs.readFileSync(full, "utf8"), "Selected Profiles");
  return {
    path: rel,
    exists: true,
    sectionExists: body !== null,
    selectedProfiles: parseBulletList(body),
  };
}

function sameValues(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function profileDocumentConflict(selection, projectProfile) {
  if (!projectProfile.exists) return null;
  if (!selection.selectedProfilesSectionExists) {
    return {
      baselineSelection: selection.selectedProfiles,
      projectProfile: projectProfile.selectedProfiles,
      reason: `${selection.path} does not provide a Selected Profiles contract`,
    };
  }
  if (sameValues(selection.selectedProfiles, projectProfile.selectedProfiles)) return null;
  return {
    baselineSelection: selection.selectedProfiles,
    projectProfile: projectProfile.selectedProfiles,
    reason: `${selection.path} and ${projectProfile.path} select different profiles`,
  };
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
      selectedProfilesSectionExists: false,
      selectedIndustrialPacks: [],
      humanApprovalStatus: null,
      pendingReasons: [`missing ${rel}`],
    };
  }

  const content = fs.readFileSync(full, "utf8");
  const baselineLevel = parseSingleEnum(sectionBody(content, "Baseline Level"), baselineLevels);
  const selectedProfilesBody = sectionBody(content, "Selected Profiles");
  const selectedProfiles = parseBulletList(selectedProfilesBody);
  const selectedIndustrialPacks = parseBulletList(
    sectionBody(content, "Selected Industrial Packs"),
    /\b[a-z0-9][a-z0-9-]*-industrial\b/i,
  );
  const humanApprovalStatus = parseSingleEnum(sectionBody(content, "Human Approval"), decisionStatuses);
  const pendingReasons = [];
  if (!baselineLevel) pendingReasons.push(`${rel} has no confirmed Baseline Level`);

  return {
    path: rel,
    exists: true,
    baselineLevel,
    selectedProfiles,
    selectedProfilesSectionExists: selectedProfilesBody !== null,
    selectedIndustrialPacks,
    humanApprovalStatus,
    pendingReasons,
  };
}

function lstatIfExists(fullPath) {
  try {
    return fs.lstatSync(fullPath);
  } catch (error) {
    if (error.code === "ENOENT" || error.code === "ENOTDIR") return null;
    throw error;
  }
}

function isPathInside(root, candidate) {
  const relative = path.relative(path.resolve(root), path.resolve(candidate));
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function assertAuthorityLexicalPath(authorityRoot, candidate, label) {
  const lexicalRoot = path.resolve(authorityRoot);
  const lexicalCandidate = path.resolve(candidate);
  assertInsideRoot(lexicalRoot, lexicalCandidate, `${label} lexical containment`);
  let current = lexicalRoot;
  for (const part of path.relative(lexicalRoot, lexicalCandidate).split(path.sep)) {
    if (!part) continue;
    current = path.join(current, part);
    const stat = lstatIfExists(current);
    if (!stat) break;
    if (stat.isSymbolicLink()) throw new Error(`${label} must not pass through a symlink: ${current}`);
  }
}

function assertContainedAuthorityPath(authorityRoot, candidate, label, expectedType) {
  const lexicalRoot = path.resolve(authorityRoot);
  const lexicalCandidate = path.resolve(candidate);
  assertAuthorityLexicalPath(lexicalRoot, lexicalCandidate, label);
  const stat = fs.lstatSync(lexicalCandidate);
  if (stat.isSymbolicLink()) throw new Error(`${label} must not be a symlink: ${lexicalCandidate}`);
  if (expectedType === "directory" && !stat.isDirectory()) {
    throw new Error(`${label} must be a directory: ${lexicalCandidate}`);
  }
  if (expectedType === "file" && !stat.isFile()) {
    throw new Error(`${label} must be a regular file: ${lexicalCandidate}`);
  }

  const realRoot = fs.realpathSync(lexicalRoot);
  const realCandidate = fs.realpathSync(lexicalCandidate);
  assertInsideRoot(realRoot, realCandidate, `${label} realpath containment`);
  return { realPath: realCandidate, stat };
}

function industrialPacksRoot(projectRoot) {
  const candidates = [
    { authorityRoot: projectRoot, relativePath: ".intentos/industrial-packs" },
    { authorityRoot: projectRoot, relativePath: "industrial-packs" },
  ];
  const kitRoot = path.resolve(__dirname, "..");
  const projectPath = path.resolve(projectRoot);
  if (isPathInside(kitRoot, projectPath)) {
    try {
      if (isPathInside(fs.realpathSync(kitRoot), fs.realpathSync(projectPath))) {
        candidates.push({ authorityRoot: kitRoot, relativePath: "industrial-packs" });
      }
    } catch {
      // A missing project root cannot inherit the source registry authority.
    }
  }

  const resolvedCandidates = candidates.map((candidate) => {
    const relativePath = assertSafeRelativePath(
      candidate.relativePath,
      "industrial pack registry root",
    );
    const root = path.resolve(candidate.authorityRoot, relativePath);
    assertInsideRoot(candidate.authorityRoot, root, "industrial pack registry root lexical containment");
    return { ...candidate, root };
  });
  return resolvedCandidates.find((candidate) => lstatIfExists(candidate.root)) || resolvedCandidates[0];
}

function loadPackIndex(projectRoot) {
  const fallbackRoot = path.join(projectRoot, ".intentos", "industrial-packs");
  let registry = { authorityRoot: projectRoot, root: fallbackRoot };
  let indexPath = path.join(fallbackRoot, "index.json");
  try {
    registry = industrialPacksRoot(projectRoot);
    const root = registry.root;
    indexPath = path.resolve(root, assertSafeRelativePath("index.json", "industrial pack registry index"));
    assertAuthorityLexicalPath(registry.authorityRoot, root, "industrial pack registry root");
    if (!lstatIfExists(root)) {
      return { root, realRoot: null, path: indexPath, error: "index.json not found", index: null, entries: [] };
    }
    const rootAuthority = assertContainedAuthorityPath(
      registry.authorityRoot,
      root,
      "industrial pack registry root",
      "directory",
    );
    assertAuthorityLexicalPath(root, indexPath, "industrial pack registry index");
    if (!lstatIfExists(indexPath)) {
      return { root, realRoot: rootAuthority.realPath, path: indexPath, error: "index.json not found", index: null, entries: [] };
    }
    const indexAuthority = assertContainedAuthorityPath(
      root,
      indexPath,
      "industrial pack registry index",
      "file",
    );
    assertInsideRoot(
      rootAuthority.realPath,
      indexAuthority.realPath,
      "industrial pack registry index realpath containment",
    );
    const index = readJson(indexPath);
    if (index.error) {
      return { root, realRoot: rootAuthority.realPath, path: indexPath, error: index.error, index: null, entries: [] };
    }
    return {
      root,
      realRoot: rootAuthority.realPath,
      path: indexPath,
      error: null,
      index,
      entries: Array.isArray(index.packs) ? index.packs : [],
    };
  } catch (error) {
    return {
      root: registry.root,
      realRoot: null,
      path: indexPath,
      error: `unsafe industrial pack registry authority: ${error.message}`,
      index: null,
      entries: [],
    };
  }
}

function packEntryResult(entry, extra = {}) {
  return {
    id: entry?.id,
    status: entry?.status,
    type: entry?.type,
    path: entry?.path,
    displayName: entry?.displayName,
    appliesToProfiles: Array.isArray(entry?.appliesToProfiles) ? entry.appliesToProfiles : [],
    available: false,
    ...extra,
  };
}

function loadPack(projectRoot, packIndex, entry) {
  const packRoot = packIndex.root;
  let entryPath;
  try {
    entryPath = assertSafeRelativePath(
      entry?.path,
      `industrial pack ${entry?.id || "<unknown>"} entry.path`,
    );
  } catch (error) {
    return packEntryResult(entry, { error: `unsafe industrial pack entry.path: ${error.message}` });
  }

  const packPath = path.resolve(packRoot, entryPath);
  try {
    assertAuthorityLexicalPath(packRoot, packPath, `industrial pack ${entry.id} entry.path`);
  } catch (error) {
    return packEntryResult(entry, { error: `unsafe industrial pack entry.path: ${error.message}` });
  }

  if (entry.status === "planned") {
    try {
      if (lstatIfExists(packPath)) {
        const packAuthority = assertContainedAuthorityPath(
          packRoot,
          packPath,
          `industrial pack ${entry.id} entry.path`,
          "directory",
        );
        assertInsideRoot(
          packIndex.realRoot,
          packAuthority.realPath,
          `industrial pack ${entry.id} entry.path realpath containment`,
        );
      }
    } catch (error) {
      return packEntryResult(entry, { error: `unsafe industrial pack entry.path authority: ${error.message}` });
    }
    return packEntryResult(entry, {
      pendingReason: "pack is planned and has no executable baseline yet",
    });
  }

  if (!lstatIfExists(packPath)) {
    return packEntryResult(entry, { error: "pack.json not found" });
  }

  let packAuthority;
  try {
    packAuthority = assertContainedAuthorityPath(
      packRoot,
      packPath,
      `industrial pack ${entry.id} entry.path`,
      "directory",
    );
    assertInsideRoot(
      packIndex.realRoot,
      packAuthority.realPath,
      `industrial pack ${entry.id} entry.path realpath containment`,
    );
  } catch (error) {
    return packEntryResult(entry, { error: `unsafe industrial pack entry.path authority: ${error.message}` });
  }

  const manifestPath = path.resolve(
    packPath,
    assertSafeRelativePath("pack.json", `industrial pack ${entry.id} manifest`),
  );
  try {
    assertAuthorityLexicalPath(packPath, manifestPath, `industrial pack ${entry.id} manifest`);
    assertInsideRoot(packRoot, manifestPath, `industrial pack ${entry.id} manifest registry containment`);
  } catch (error) {
    return packEntryResult(entry, { error: `unsafe industrial pack manifest authority: ${error.message}` });
  }
  if (!lstatIfExists(manifestPath)) {
    return packEntryResult(entry, { error: "pack.json not found" });
  }
  try {
    const manifestAuthority = assertContainedAuthorityPath(
      packPath,
      manifestPath,
      `industrial pack ${entry.id} manifest`,
      "file",
    );
    assertInsideRoot(
      packAuthority.realPath,
      manifestAuthority.realPath,
      `industrial pack ${entry.id} manifest pack realpath containment`,
    );
    assertInsideRoot(
      packIndex.realRoot,
      manifestAuthority.realPath,
      `industrial pack ${entry.id} manifest registry realpath containment`,
    );
  } catch (error) {
    return packEntryResult(entry, { error: `unsafe industrial pack manifest authority: ${error.message}` });
  }

  const manifest = readJson(manifestPath);
  if (manifest.error) {
    return packEntryResult(entry, { error: manifest.error });
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
    : path.join(".intentos", "industrial-packs", pack.path || "");
  return path.join(prefix, relPath).replaceAll(path.sep, "/");
}

function packProfileCompatibility(pack, selectedProfiles) {
  if (pack.type === "risk-overlay") return null;
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

function requirementToken(value) {
  return normalizeRequirement(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function industrialEvidenceRequirementId(packId, evidenceType, requirement) {
  return ["bl2", packId, evidenceType, requirementToken(requirement)]
    .map((value) => String(value || "").trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-"))
    .join(":");
}

function requiredEvidenceBindingsForPacks(packs) {
  return packs.flatMap((pack) => Object.entries(pack.manifest?.requiredEvidence || {})
    .flatMap(([evidenceType, requirements]) => (Array.isArray(requirements) ? requirements : []).map((requirement) => ({
      requirementId: industrialEvidenceRequirementId(pack.id, evidenceType, requirement),
      packId: pack.id,
      evidenceType,
      requirement,
    })))).sort((left, right) => left.requirementId.localeCompare(right.requirementId));
}

function parseSemanticEvidenceBindings(content) {
  const bindings = [];
  for (const line of String(content || "").split("\n")) {
    const match = line.match(/^\s*(?:[-*]\s*)?INTENTOS_BL2_EVIDENCE:\s*(.+?)\s*$/i);
    if (!match) continue;
    const [requirementId, evidenceType, requirement, ...summaryParts] = match[1]
      .split("|")
      .map((item) => item.trim());
    bindings.push({
      requirementId: String(requirementId || "").toLowerCase(),
      evidenceType: normalizeRequirement(evidenceType),
      requirement: normalizeRequirement(requirement),
      summary: summaryParts.join(" | ").trim(),
    });
  }
  return bindings;
}

const supportedCommandExecutables = new Set([
  "adb", "bash", "bundle", "bun", "cargo", "cmake", "corepack", "ctest", "docker",
  "dotnet", "flutter", "go", "gradle", "java", "make", "mvn", "node", "npm", "npx",
  "pnpm", "python", "python3", "pytest", "ruby", "sh", "swift", "xcodebuild", "xcrun",
  "yarn",
]);

function commandTokens(command) {
  return String(command || "").match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
}

function unquoteCommandToken(value) {
  return String(value || "").replace(/^(?:"([\s\S]*)"|'([\s\S]*)')$/, "$1$2");
}

function validateConcreteCommand(command, projectRoot) {
  if (!command || command.length > 1000 || /[\r\n\0;&|`]/.test(command) || /\$\(|\$\{/.test(command)) {
    return "command must be one concrete non-interactive invocation without shell composition";
  }
  if (/<[^>]+>/.test(command)) return "command contains placeholder tokens";
  const tokens = commandTokens(command);
  if (tokens.length < 2) return "command must include an executable and explicit arguments";
  const executable = unquoteCommandToken(tokens[0]);
  if (!executable) return "command executable is missing";
  if (!executable.includes("/") && !supportedCommandExecutables.has(executable)) {
    return `command executable is not a recognized concrete tool or project-local path: ${executable}`;
  }
  if (executable.includes("/")) {
    const executableRef = executable.replace(/^\.\//, "");
    if (!isSafeRelativePath(executableRef)) return `command executable path is unsafe: ${executable}`;
    const executablePath = path.resolve(projectRoot, executableRef);
    try {
      assertNoSymlinkInPath(projectRoot, executablePath, "BL2 command executable");
      const stat = fs.lstatSync(executablePath);
      if (!stat.isFile() || stat.isSymbolicLink()) return `command executable is not a regular project file: ${executable}`;
    } catch (error) {
      return `command executable is unavailable: ${executable} (${error.message})`;
    }
  }
  if (["bash", "node", "python", "python3", "sh"].includes(executable)) {
    const scriptToken = tokens.slice(1).map(unquoteCommandToken).find((token) => !token.startsWith("-"));
    if (scriptToken && (scriptToken.includes("/") || /\.(?:js|mjs|cjs|py|sh)$/.test(scriptToken))) {
      if (!isSafeRelativePath(scriptToken)) return `command script path is unsafe: ${scriptToken}`;
      const scriptPath = path.resolve(projectRoot, scriptToken);
      try {
        assertNoSymlinkInPath(projectRoot, scriptPath, "BL2 command script");
        const stat = fs.lstatSync(scriptPath);
        if (!stat.isFile() || stat.isSymbolicLink()) return `command script is not a regular project file: ${scriptToken}`;
      } catch (error) {
        return `command script is unavailable: ${scriptToken} (${error.message})`;
      }
    }
  }
  return null;
}

function invalidBoundEvidence(issue) {
  return { valid: false, issue };
}

function validateBoundEvidenceSummary(value, binding, projectRoot, evidencePath) {
  const summary = String(value || "").trim();
  if (summary.length < 20 || /^(?:hello|pass|passed|done|ok|covered|evidence|placeholder|sample|test)$/i.test(summary)) {
    return invalidBoundEvidence("semantic summary is empty or placeholder-only");
  }
  const facts = Object.fromEntries([...summary.matchAll(/\b([a-z][a-z0-9_-]*)\s*=\s*([^;|]+)/gi)]
    .map((match) => [match[1].toLowerCase(), match[2].trim()]));
  const resultValue = String(facts.result || facts.status || "").trim();
  const hasSuccessfulResult = /^(?:pass|passed|success|succeeded|ok|verified)$/i.test(resultValue);
  const exitCode = String(facts.exit || "").trim();
  const command = String(facts.command || "").trim();
  const recordedRevision = String(facts.revision || "").trim();
  const receiptDigest = String(facts.receipt_digest || "").trim().toLowerCase();
  const outputDigest = String(facts.output_digest || "").trim().toLowerCase();
  const receiptRef = String(facts.receipt || facts.report || "")
    .replace(/^(?:artifact|file):/i, "")
    .trim();
  const outputRef = String(facts.output || facts.output_ref || "")
    .replace(/^(?:artifact|file):/i, "")
    .trim();
  if (!hasSuccessfulResult || exitCode !== "0") return invalidBoundEvidence("summary must report a successful zero-exit execution");
  const commandIssue = validateConcreteCommand(command, projectRoot);
  if (commandIssue) return invalidBoundEvidence(commandIssue);
  if (!/^sha256:[a-f0-9]{64}$/.test(receiptDigest)) return invalidBoundEvidence("receipt_digest must be a sha256 digest");
  if (!/^sha256:[a-f0-9]{64}$/.test(outputDigest)) return invalidBoundEvidence("output_digest must be a sha256 digest");
  if (!isSafeRelativePath(receiptRef) || !isSafeRelativePath(outputRef)) {
    return invalidBoundEvidence("receipt and output refs must be safe project-relative paths");
  }
  const receiptPath = path.resolve(projectRoot, receiptRef);
  const outputPath = path.resolve(projectRoot, outputRef);
  if (receiptPath === evidencePath || outputPath === evidencePath || outputPath === receiptPath) {
    return invalidBoundEvidence("receipt, command output, and semantic evidence must be distinct files");
  }
  try {
    assertNoSymlinkInPath(projectRoot, receiptPath, "BL2 execution receipt");
    assertNoSymlinkInPath(projectRoot, outputPath, "BL2 command output");
    const receiptStat = fs.lstatSync(receiptPath);
    const outputStat = fs.lstatSync(outputPath);
    if (!receiptStat.isFile() || receiptStat.isSymbolicLink() || receiptStat.size === 0) {
      return invalidBoundEvidence("execution receipt is not a non-empty regular file");
    }
    if (!outputStat.isFile() || outputStat.isSymbolicLink() || outputStat.size === 0) {
      return invalidBoundEvidence("command output is not a non-empty regular file");
    }
    if (canonicalFileDigest(receiptPath) !== receiptDigest) return invalidBoundEvidence("receipt_digest does not match the execution receipt");
    if (canonicalFileDigest(outputPath) !== outputDigest) return invalidBoundEvidence("output_digest does not match the command output");
    const receipt = JSON.parse(fs.readFileSync(receiptPath, "utf8"));
    const requiredReceiptFields = [
      "schema_version", "artifact_type", "requirement_id", "pack_id", "evidence_type",
      "requirement", "command", "command_argv", "command_digest", "result", "exit_code", "source_revision",
      "output_ref", "output_digest", "run_manifest_ref", "run_manifest_digest", "run_id", "execution_id",
    ];
    const allowedReceiptFields = new Set([
      ...requiredReceiptFields,
      "started_at", "finished_at", "environment",
    ]);
    const missingFields = requiredReceiptFields.filter((field) => receipt?.[field] === undefined);
    if (missingFields.length > 0) return invalidBoundEvidence(`execution receipt missing field(s): ${missingFields.join(", ")}`);
    const unsupportedFields = Object.keys(receipt || {}).filter((field) => !allowedReceiptFields.has(field));
    if (unsupportedFields.length > 0) {
      return invalidBoundEvidence(`execution receipt has unsupported self-declared field(s): ${unsupportedFields.join(", ")}`);
    }
    if (receipt?.artifact_type !== "bl2_execution_receipt" || receipt?.schema_version !== "1.113.0") {
      return invalidBoundEvidence("execution receipt artifact identity is invalid");
    }
    if (receipt.requirement_id !== binding.requirementId
      || receipt.pack_id !== binding.packId
      || normalizeRequirement(receipt.evidence_type) !== normalizeRequirement(binding.evidenceType)
      || normalizeRequirement(receipt.requirement) !== normalizeRequirement(binding.requirement)) {
      return invalidBoundEvidence("execution receipt must bind exactly one selected pack requirement and evidence type");
    }
    if (!Array.isArray(receipt.command_argv)
      || receipt.command_argv.length === 0
      || receipt.command_argv.some((token) => typeof token !== "string" || !token.trim())) {
      return invalidBoundEvidence("execution receipt command_argv must be a non-empty bounded argv array");
    }
    if (receipt.command !== command
      || receipt.command !== renderCommandArgv(receipt.command_argv)
      || receipt.command_digest !== fileDigest(Buffer.from(JSON.stringify(receipt.command_argv)))) {
      return invalidBoundEvidence("execution receipt command or command_digest does not match command_argv");
    }
    if (receipt.exit_code !== 0 || !/^(?:PASS|SUCCESS|VERIFIED)$/.test(String(receipt.result || ""))) {
      return invalidBoundEvidence("execution receipt result is not a successful zero-exit execution");
    }
    const currentRevision = projectIdentity(projectRoot).revision;
    if (recordedRevision !== currentRevision || receipt.source_revision !== currentRevision) {
      return invalidBoundEvidence("execution receipt source_revision is stale or mismatched");
    }
    if (receipt.output_ref !== outputRef || receipt.output_digest !== outputDigest) {
      return invalidBoundEvidence("execution receipt does not bind the referenced command output and digest");
    }
    const runtime = resolveRuntimeTrustBinding(projectRoot, {
      required: true,
      manifestRef: receipt.run_manifest_ref,
      fromFile: receiptPath,
    });
    if (!runtime.ok) return invalidBoundEvidence(`execution receipt Runtime Trust binding failed: ${runtime.binding.reason}`);
    if (receipt.run_manifest_digest !== runtime.binding.run_manifest_digest || receipt.run_id !== runtime.binding.run_id) {
      return invalidBoundEvidence("execution receipt run manifest digest or run ID does not match the authoritative current run");
    }
    const execution = (runtime.manifest?.verification_executions || [])
      .find((item) => item.id === receipt.execution_id);
    if (!execution || execution.result !== "PASSED" || execution.exit_code !== 0) {
      return invalidBoundEvidence("execution receipt must identify one successful execution from the authoritative run manifest");
    }
    if (execution.command_digest !== receipt.command_digest) {
      return invalidBoundEvidence("execution receipt command digest does not match the authoritative runtime execution");
    }
    if (normalizeArtifactPath(execution.output_ref) !== normalizeArtifactPath(outputRef)
      || execution.output_digest !== outputDigest) {
      return invalidBoundEvidence("execution receipt output does not match the authoritative runtime execution");
    }
    if (!(execution.covers_obligations || []).includes(binding.requirementId)) {
      return invalidBoundEvidence("authoritative runtime execution does not cover the selected BL2 requirement ID");
    }
    const outputContent = fs.readFileSync(outputPath, "utf8").trim();
    if (outputContent.length < 20 || /^(?:pass|success|verified|ok)$/i.test(outputContent)) {
      return invalidBoundEvidence("command output is empty or result-token-only");
    }
    const outputText = normalizeRequirement(outputContent);
    const keywords = requirementKeywords(binding);
    const requiredMatches = Math.min(2, keywords.length);
    const matchedKeywords = keywords.filter((keyword) => outputText.includes(keyword));
    if (requiredMatches > 0 && matchedKeywords.length < requiredMatches) {
      return invalidBoundEvidence(`command output does not address the bound requirement context: ${keywords.join(", ")}`);
    }
  } catch (error) {
    return invalidBoundEvidence(`execution receipt or command output is unavailable: ${error.message}`);
  }
  return { valid: true, receiptRef, outputRef };
}

function normalizeArtifactPath(value) {
  return String(value || "").trim().replace(/^(?:artifact|file):/i, "");
}

function renderCommandArgv(argv) {
  return argv.map((token) => (/^[A-Za-z0-9_./:=@+-]+$/.test(token) ? token : JSON.stringify(token))).join(" ");
}

const dispositionKeys = new Set([
  "$schema",
  "schemaVersion",
  "kind",
  "requirementId",
  "packId",
  "evidenceType",
  "requirement",
  "disposition",
  "selectedProfiles",
  "scope",
  "basis",
  "projectEvidence",
  "reviewTriggers",
  "determinedBy",
]);
const projectEvidenceKeys = new Set(["path", "sha256", "claim"]);
const requiredReviewTriggers = ["PROFILE_CHANGE", "PROJECT_SCOPE_CHANGE", "REQUIREMENT_CHANGE"];

function fileDigest(value) {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

function isStrongDispositionText(value, minimumLength) {
  const text = String(value || "").trim();
  if (text.length < minimumLength || text.includes("<")) return false;
  return !/^(?:n\/?a|none|no|not applicable|does not apply|out of scope|not needed|unused|skipped|see (?:exception|disposition))(?:[.!])?$/i.test(text);
}

function requirementKeywords(binding) {
  const ignored = new Set([
    "and", "the", "for", "from", "with", "without", "evidence", "review", "readiness",
    "handling", "behavior", "change", "record", "plan", "project", "current", "required",
  ]);
  return unique(`${binding.evidenceType} ${binding.requirement}`.toLowerCase().match(/[a-z0-9]{3,}/g) || [])
    .filter((token) => !ignored.has(token));
}

function validatesCurrentProjectEvidence(projectRoot, dispositionPath, evidencePath, item, index) {
  const issues = [];
  if (!item || typeof item !== "object" || Array.isArray(item)) {
    return [`projectEvidence[${index}] must be an object`];
  }
  const extraKeys = Object.keys(item).filter((key) => !projectEvidenceKeys.has(key));
  if (extraKeys.length > 0) issues.push(`projectEvidence[${index}] has unsupported field(s): ${extraKeys.join(", ")}`);
  const sourceRef = String(item.path || "").trim();
  if (!isSafeRelativePath(sourceRef)) {
    issues.push(`projectEvidence[${index}].path must be a safe project-relative path`);
    return issues;
  }
  if (/^(?:\.intentos\/)?(?:industrial-packs|standard-baseline-packs|profiles|templates)\//.test(sourceRef)) {
    issues.push(`projectEvidence[${index}].path points to installed baseline authority, not current project evidence: ${sourceRef}`);
    return issues;
  }
  const sourcePath = path.resolve(projectRoot, sourceRef);
  if (sourcePath === dispositionPath || sourcePath === evidencePath) {
    issues.push(`projectEvidence[${index}].path is self-referential: ${sourceRef}`);
    return issues;
  }
  try {
    assertNoSymlinkInPath(projectRoot, sourcePath, "BL2 disposition project evidence");
    const stat = fs.lstatSync(sourcePath);
    if (!stat.isFile() || stat.isSymbolicLink() || stat.size === 0) {
      issues.push(`projectEvidence[${index}].path is not a non-empty regular project file: ${sourceRef}`);
      return issues;
    }
    const source = fs.readFileSync(sourcePath);
    const sourceText = source.toString("utf8").trim();
    if (!sourceText || /^(?:pending|tbd|todo|placeholder|not[_ -]?ready)$/i.test(sourceText)) {
      issues.push(`projectEvidence[${index}].path is empty or placeholder-only: ${sourceRef}`);
    }
    if (String(item.sha256 || "").trim().toLowerCase() !== fileDigest(source)) {
      issues.push(`projectEvidence[${index}].sha256 does not bind current project file: ${sourceRef}`);
    }
  } catch (error) {
    issues.push(`projectEvidence[${index}].path is unavailable: ${sourceRef} (${error.message})`);
  }
  if (!isStrongDispositionText(item.claim, 20)) {
    issues.push(`projectEvidence[${index}].claim is missing or weak`);
  }
  return issues;
}

function validateDispositionDocument(projectRoot, dispositionPath, evidencePath, binding, selectedProfiles, value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return ["disposition must be a JSON object"];
  }
  const issues = [];
  const extraKeys = Object.keys(value).filter((key) => !dispositionKeys.has(key));
  if (extraKeys.length > 0) issues.push(`unsupported disposition field(s): ${extraKeys.join(", ")}`);
  if (value.schemaVersion !== 1) issues.push("schemaVersion must be 1");
  if (value.kind !== "INTENTOS_BL2_DISPOSITION") issues.push("kind must be INTENTOS_BL2_DISPOSITION");
  if (String(value.requirementId || "").toLowerCase() !== binding.requirementId) issues.push("requirementId does not match the selected pack requirement");
  if (value.packId !== binding.packId) issues.push("packId does not match the selected pack");
  if (normalizeRequirement(value.evidenceType) !== normalizeRequirement(binding.evidenceType)) issues.push("evidenceType does not match the selected pack requirement");
  if (normalizeRequirement(value.requirement) !== normalizeRequirement(binding.requirement)) issues.push("requirement text does not match the selected pack requirement");
  if (value.disposition !== "NOT_APPLICABLE") issues.push("disposition must be NOT_APPLICABLE");
  if (value.determinedBy !== "CODEX_PROJECT_EVIDENCE") issues.push("determinedBy must be CODEX_PROJECT_EVIDENCE");

  const dispositionProfiles = Array.isArray(value.selectedProfiles) ? value.selectedProfiles : [];
  const normalizedProfiles = unique(dispositionProfiles.map((item) => String(item || "").trim()));
  if (normalizedProfiles.length !== dispositionProfiles.length || !sameValues(normalizedProfiles, selectedProfiles)) {
    issues.push(`selectedProfiles must exactly match current profile documents: ${selectedProfiles.join(", ") || "none"}`);
  }
  if (!isStrongDispositionText(value.scope, 20)) issues.push("scope is missing or weak");
  if (!isStrongDispositionText(value.basis, 30)) issues.push("basis is missing or weak");

  const projectEvidence = Array.isArray(value.projectEvidence) ? value.projectEvidence : [];
  if (projectEvidence.length === 0) {
    issues.push("projectEvidence must contain at least one current project source binding");
  } else {
    projectEvidence.forEach((item, index) => {
      issues.push(...validatesCurrentProjectEvidence(projectRoot, dispositionPath, evidencePath, item, index));
    });
  }
  const semanticText = [
    value.scope,
    value.basis,
    ...projectEvidence.map((item) => item?.claim),
  ].join(" ").toLowerCase();
  const keywords = requirementKeywords(binding);
  if (keywords.length > 0 && !keywords.some((keyword) => semanticText.includes(keyword))) {
    issues.push(`scope, basis, and project evidence claims do not address requirement context: ${keywords.join(", ")}`);
  }

  const reviewTriggers = Array.isArray(value.reviewTriggers) ? value.reviewTriggers : [];
  const allowedReviewTriggers = new Set([...requiredReviewTriggers, "PROJECT_EVIDENCE_CHANGE"]);
  if (reviewTriggers.some((trigger) => !allowedReviewTriggers.has(trigger))) {
    issues.push("reviewTriggers contains an unsupported value");
  }
  for (const trigger of requiredReviewTriggers) {
    if (!reviewTriggers.includes(trigger)) issues.push(`reviewTriggers must include ${trigger}`);
  }
  if (unique(reviewTriggers).length !== reviewTriggers.length) issues.push("reviewTriggers must not contain duplicates");
  return unique(issues);
}

function validateDispositionRow(projectRoot, evidencePath, binding, selectedProfiles, row) {
  const issues = [];
  if (!isStrongDispositionText(row["reason if skipped"], 20)) {
    issues.push("Reason if skipped is missing or weak; free text does not authorize a BL2 exception");
  }
  const refs = splitEvidenceRefs(row["evidence ref"]);
  if (refs.length !== 1) {
    issues.push("Not Applicable must reference exactly one structured JSON disposition");
    return { valid: false, issues };
  }
  const ref = refs[0];
  if (!isSafeRelativePath(ref)) {
    issues.push(`disposition ref must be a safe project-relative path: ${ref}`);
    return { valid: false, issues };
  }
  const dispositionPath = path.resolve(projectRoot, ref);
  if (dispositionPath === evidencePath) {
    issues.push(`disposition ref is self-referential: ${ref}`);
    return { valid: false, issues };
  }
  let value;
  try {
    assertNoSymlinkInPath(projectRoot, dispositionPath, "BL2 evidence disposition");
    const stat = fs.lstatSync(dispositionPath);
    if (!stat.isFile() || stat.isSymbolicLink() || stat.size === 0) {
      issues.push(`disposition ref is not a non-empty regular project file: ${ref}`);
      return { valid: false, issues };
    }
    value = JSON.parse(fs.readFileSync(dispositionPath, "utf8"));
  } catch (error) {
    issues.push(`disposition ref is missing or invalid JSON: ${ref} (${error.message})`);
    return { valid: false, issues };
  }
  issues.push(...validateDispositionDocument(
    projectRoot,
    dispositionPath,
    evidencePath,
    binding,
    selectedProfiles,
    value,
  ));
  return { valid: issues.length === 0, issues: unique(issues) };
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

function validateEvidenceReferences(projectRoot, requiredEvidenceBindings, evidence, selectedProfiles) {
  if (!evidence.exists) {
    return {
      status: "EVIDENCE_MISSING",
      missingIssues: [`missing ${evidence.path}`],
      invalidIssues: [],
      issues: [`missing ${evidence.path}`],
    };
  }
  if (requiredEvidenceBindings.length === 0) {
    return { status: "VALID", missingIssues: [], invalidIssues: [], issues: [] };
  }

  const rowsByRequirement = new Map();
  for (const row of evidence.rows) {
    const requirement = normalizeRequirement(row.requirement);
    if (!requirement) continue;
    const rows = rowsByRequirement.get(requirement) || [];
    rows.push(row);
    rowsByRequirement.set(requirement, rows);
  }

  const missingIssues = [];
  const invalidIssues = [];
  const declaredStatusByRequirementId = new Map();
  const evidencePath = path.resolve(projectRoot, evidence.path);
  for (const binding of requiredEvidenceBindings) {
    const rows = rowsByRequirement.get(normalizeRequirement(binding.requirement)) || [];
    if (rows.length === 0) {
      missingIssues.push(`missing evidence row: ${binding.requirement} (${binding.requirementId})`);
      continue;
    }
    const statuses = unique(rows.map((row) => String(row.status || "").trim().toLowerCase()));
    const unsupportedStatuses = statuses.filter((status) => !["done", "not applicable"].includes(status));
    if (unsupportedStatuses.length > 0) {
      invalidIssues.push(`evidence status is invalid for ${binding.requirementId}: ${unsupportedStatuses.join(", ") || "none"}`);
      continue;
    }
    const doneRows = rows.filter((row) => String(row.status || "").trim().toLowerCase() === "done");
    const notApplicableRows = rows.filter((row) => String(row.status || "").trim().toLowerCase() === "not applicable");
    if (doneRows.length > 0 && notApplicableRows.length > 0) {
      invalidIssues.push(`conflicting Done and Not Applicable rows for ${binding.requirementId}`);
      continue;
    }
    if (doneRows.length > 0) {
      declaredStatusByRequirementId.set(binding.requirementId, "done");
      let semanticBindingFound = false;
      const semanticBindingIssues = [];
      for (const row of doneRows) {
        const refs = splitEvidenceRefs(row["evidence ref"]);
        if (refs.length === 0) {
          invalidIssues.push(`Done requirement has no evidence ref: ${binding.requirementId}`);
          continue;
        }
        for (const ref of refs) {
          if (!isSafeRelativePath(ref)) {
            invalidIssues.push(`unsafe evidence ref for ${binding.requirementId}: ${ref}`);
            continue;
          }
          const supportingEvidencePath = path.resolve(projectRoot, ref);
          const projectRelative = path.relative(projectRoot, supportingEvidencePath).replaceAll(path.sep, "/");
          if (projectRelative === evidence.path) {
            invalidIssues.push(`self-referential evidence ref for ${binding.requirementId}: ${ref}`);
          } else if (!fs.existsSync(supportingEvidencePath)) {
            invalidIssues.push(`claimed Done evidence ref is missing for ${binding.requirementId}: ${ref}`);
          } else {
            try {
              assertNoSymlinkInPath(projectRoot, supportingEvidencePath, "BL2 supporting evidence");
            } catch (error) {
              invalidIssues.push(`unsafe evidence ref for ${binding.requirementId}: ${ref} (${error.message})`);
              continue;
            }
            const stat = fs.lstatSync(supportingEvidencePath);
            if (!stat.isFile() || stat.isSymbolicLink()) {
              invalidIssues.push(`evidence ref is not a regular project file for ${binding.requirementId}: ${ref}`);
              continue;
            }
            const evidenceContent = fs.readFileSync(supportingEvidencePath, "utf8").trim();
            if (!evidenceContent || /^(pending|tbd|todo|placeholder|not[_ -]?ready)$/i.test(evidenceContent)) {
              invalidIssues.push(`empty or placeholder evidence ref for ${binding.requirementId}: ${ref}`);
              continue;
            }
            const semanticBindings = parseSemanticEvidenceBindings(evidenceContent).filter((candidate) => (
              candidate.requirementId === binding.requirementId
              && candidate.evidenceType === normalizeRequirement(binding.evidenceType)
              && candidate.requirement === normalizeRequirement(binding.requirement)
            ));
            for (const semanticBinding of semanticBindings) {
              const validation = validateBoundEvidenceSummary(
                semanticBinding.summary,
                binding,
                projectRoot,
                supportingEvidencePath,
              );
              if (validation.valid) semanticBindingFound = true;
              else if (validation.issue) semanticBindingIssues.push(validation.issue);
            }
          }
        }
      }
      if (!semanticBindingFound) {
        invalidIssues.push(`missing semantic evidence binding for ${binding.requirementId}; expected INTENTOS_BL2_EVIDENCE with matching evidence type, one-requirement receipt, concrete command, and bound output digest${semanticBindingIssues.length > 0 ? `; ${unique(semanticBindingIssues).join("; ")}` : ""}`);
      }
      continue;
    }
    if (notApplicableRows.length > 0) {
      declaredStatusByRequirementId.set(binding.requirementId, "not applicable");
      const dispositions = notApplicableRows.map((row) => (
        validateDispositionRow(projectRoot, evidencePath, binding, selectedProfiles, row)
      ));
      if (dispositions.some((item) => item.valid)) {
        continue;
      }
      const dispositionIssues = unique(dispositions.flatMap((item) => item.issues));
      invalidIssues.push(`invalid Not Applicable disposition for ${binding.requirementId}: ${dispositionIssues.join("; ")}`);
      continue;
    }
    invalidIssues.push(`evidence status is not complete for ${binding.requirementId}: ${rows.map((row) => row.status || "none").join(", ")}`);
  }

  const bindingsByPack = new Map();
  for (const binding of requiredEvidenceBindings) {
    const bindings = bindingsByPack.get(binding.packId) || [];
    bindings.push(binding);
    bindingsByPack.set(binding.packId, bindings);
  }
  for (const [packId, bindings] of bindingsByPack) {
    const statuses = bindings.map((binding) => declaredStatusByRequirementId.get(binding.requirementId));
    if (statuses.length > 0 && statuses.every((status) => status === "not applicable")) {
      invalidIssues.push(`selected BL2 pack ${packId} cannot disposition every required evidence row as Not Applicable; at least one applicable requirement must have bound Done evidence`);
    }
  }

  const normalizedMissing = unique(missingIssues);
  const normalizedInvalid = unique(invalidIssues);
  return {
    status: normalizedInvalid.length > 0
      ? "EVIDENCE_INVALID"
      : normalizedMissing.length > 0
        ? "EVIDENCE_MISSING"
        : "VALID",
    missingIssues: normalizedMissing,
    invalidIssues: normalizedInvalid,
    issues: unique([...normalizedMissing, ...normalizedInvalid]),
  };
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
  const projectProfile = selectedProfilesFromProjectProfile(root);
  const documentConflict = profileDocumentConflict(selection, projectProfile);
  const selectedProfiles = selection.selectedProfiles.length > 0
    ? selection.selectedProfiles
    : projectProfile.selectedProfiles;
  const packIndex = loadPackIndex(root);
  const entriesById = new Map(packIndex.entries.map((entry) => [entry.id, entry]));
  const unknownPacks = selection.selectedIndustrialPacks.filter((packId) => !entriesById.has(packId));
  const knownExecutablePackIds = unique(packIndex.entries
    .filter((entry) => entry && entry.status !== "planned" && entry.id)
    .map((entry) => entry.id));
  const selectedPacks = selection.selectedIndustrialPacks
    .filter((packId) => entriesById.has(packId))
    .map((packId) => loadPack(root, packIndex, entriesById.get(packId)));
  const executablePacks = selectedPacks.filter((pack) => pack.available && !pack.error);
  const plannedPacks = selectedPacks.filter((pack) => pack.status === "planned").map((pack) => pack.id);
  const invalidPacks = selectedPacks.filter((pack) => pack.error).map((pack) => ({
    packId: pack.id,
    error: pack.error,
  }));
  const incompatiblePacks = executablePacks
    .map((pack) => packProfileCompatibility(pack, selectedProfiles))
    .filter(Boolean);
  const industrialPackCompatibility = evaluateIndustrialPackCompatibility(executablePacks.map((pack) => ({
    id: pack.id,
    compatiblePacks: pack.manifest?.compatiblePacks,
    conflictsWith: pack.manifest?.conflictsWith,
  })));
  const conflicts = industrialPackCompatibility.incompatiblePairs.map((pair) => ({
    packId: pair.left,
    conflictsWith: pair.right,
    compatibilityStatus: pair.status,
    reason: pair.reason,
  }));

  const requiredEvidence = mergeObjectArrays(executablePacks.map((pack) => pack.manifest?.requiredEvidence));
  const requiredEvidenceBindings = requiredEvidenceBindingsForPacks(executablePacks);
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
  const declaredHumanApprovalRequiredFor = unique(executablePacks.flatMap((pack) => pack.manifest.humanApprovalRequiredFor || []));
  const effectiveHumanApprovalRequiredFor = declaredHumanApprovalRequiredFor.filter(requiresRealWorldConsent);
  const localTechnicalRiskTerms = declaredHumanApprovalRequiredFor.filter((term) => !requiresRealWorldConsent(term));
  const requiredProjectDocs = selection.baselineLevel === "BL2_INDUSTRIAL"
    ? ["docs/baseline-selection.md", "docs/baseline-evidence.md"]
    : [];
  const missingProjectDocs = requiredProjectDocs.filter((rel) => !fs.existsSync(path.join(root, rel)));
  const missingEvidenceTerms = selection.baselineLevel === "BL2_INDUSTRIAL"
    ? missingBaselineEvidenceTerms(root, requiredEvidence)
    : [];
  const baselineEvidence = parseBaselineEvidence(root);
  const evidenceValidation = selection.baselineLevel === "BL2_INDUSTRIAL"
    ? validateEvidenceReferences(root, requiredEvidenceBindings, baselineEvidence, selectedProfiles)
    : { status: "NOT_REQUIRED", missingIssues: [], invalidIssues: [], issues: [] };
  const evidenceReferenceIssues = unique([
    ...evidenceValidation.issues,
    ...(documentConflict ? [`profile document conflict: ${documentConflict.reason}`] : []),
  ]);
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
  } else if (documentConflict) {
    state = "EVIDENCE_INVALID";
    pendingReasons.push(`profile document conflict: ${documentConflict.reason}`);
  } else if (incompatiblePacks.length > 0 || industrialPackCompatibility.incompatiblePairs.length > 0) {
    state = "PACKS_INCOMPATIBLE";
  } else if (missingProjectDocs.length > 0) {
    state = "EVIDENCE_MISSING";
    pendingReasons.push(`missing BL2 project docs: ${missingProjectDocs.join(", ")}`);
  } else if (evidenceValidation.invalidIssues.length > 0 || riskOverlayIssues.length > 0) {
    state = "EVIDENCE_INVALID";
    if (evidenceValidation.invalidIssues.length > 0) {
      pendingReasons.push(`invalid baseline evidence: ${evidenceValidation.invalidIssues.join("; ")}`);
    }
    if (riskOverlayIssues.length > 0) {
      pendingReasons.push(`risk overlay evidence issues: ${riskOverlayIssues.join("; ")}`);
    }
  } else if (missingEvidenceTerms.length > 0 || evidenceValidation.missingIssues.length > 0) {
    state = "EVIDENCE_MISSING";
    if (missingEvidenceTerms.length > 0) {
      pendingReasons.push(`missing baseline evidence terms: ${missingEvidenceTerms.join(", ")}`);
    }
    if (evidenceValidation.missingIssues.length > 0) {
      pendingReasons.push(`missing baseline evidence: ${evidenceValidation.missingIssues.join("; ")}`);
    }
  } else {
    state = "BASELINE_READY";
  }

  return {
    projectRoot: root,
    industrialPacksRoot: packIndex.root,
    state,
    strictState: state,
    strictStatus: {
      state,
      ready: ["BASELINE_READY", "NOT_APPLICABLE"].includes(state),
    },
    baselineLevel: selection.baselineLevel,
    selectedProfiles,
    profileDocuments: {
      baselineSelection: {
        path: selection.path,
        selectedProfiles: selection.selectedProfiles,
        sectionExists: selection.selectedProfilesSectionExists,
      },
      projectProfile,
      conflict: documentConflict,
    },
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
    industrialPackCompatibility,
    incompatiblePackPairs: industrialPackCompatibility.incompatiblePairs,
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
    effectiveRequiredEvidenceBindings: requiredEvidenceBindings,
    baselineEvidence,
    missingEvidenceTerms,
    evidenceValidation,
    evidenceReferenceIssues,
    riskOverlayEvidenceIssues: riskOverlayIssues,
    declaredHumanApprovalRequiredFor,
    effectiveHumanApprovalRequiredFor,
    localTechnicalRiskTerms,
    pendingReasons: unique(pendingReasons),
  };
}

function printHuman(result) {
  console.log("# Industrial Baseline");
  console.log("");
  console.log(`PROJECT_ROOT: ${result.projectRoot}`);
  console.log(`INDUSTRIAL_BASELINE_STATE: ${result.state}`);
  console.log(`INDUSTRIAL_BASELINE_STRICT_STATE: ${result.strictState}`);
  console.log(`BASELINE_LEVEL: ${result.baselineLevel || "none"}`);
  console.log(`SELECTED_PROFILES: ${result.selectedProfiles.length > 0 ? result.selectedProfiles.join(", ") : "none"}`);
  console.log(`SELECTED_INDUSTRIAL_PACKS: ${result.selectedIndustrialPacks.length > 0 ? result.selectedIndustrialPacks.join(", ") : "none"}`);
  console.log(`COMPATIBILITY_APPROVAL_STATUS: ${result.humanApprovalStatus || "not used for technical selection"}`);
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
  if (result.incompatiblePackPairs.length > 0) {
    console.log("");
    console.log("## Incompatible Pack Pairs");
    console.log("");
    for (const pair of result.incompatiblePackPairs) {
      console.log(`- ${pair.left} + ${pair.right}: ${pair.status} (${pair.reason})`);
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
  console.log("## Real-world Consent Required For");
  console.log("");
  if (result.effectiveHumanApprovalRequiredFor.length === 0) {
    console.log("- None");
  } else {
    for (const item of result.effectiveHumanApprovalRequiredFor) console.log(`- ${item} (classify as business/external fact or exact real-world consent; never delegate the technical choice)`);
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
  if (["PACK_INDEX_MISSING", "PACKS_INVALID", "PACKS_NOT_AVAILABLE", "PACKS_INCOMPATIBLE", "EVIDENCE_INVALID"].includes(result.state)) {
    process.exit(1);
  }
}
