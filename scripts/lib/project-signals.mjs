import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

import { isIntentOSSourceCheckout, loadManifestOrNull } from "./manifest.mjs";

export const defaultIgnoredDirs = new Set([
  ".git",
  ".intentos",
  ".DS_Store",
  "node_modules",
  ".pnpm-store",
  "dist",
  "build",
  "coverage",
  ".next",
  ".nuxt",
  ".cache",
  "tmp",
  "var",
]);

export const projectSignalFiles = [
  "package.json",
  "pnpm-lock.yaml",
  "yarn.lock",
  "package-lock.json",
  "pyproject.toml",
  "go.mod",
  "Cargo.toml",
  "Package.swift",
  "pom.xml",
  "build.gradle",
  "settings.gradle",
  "README.md",
];

export const projectSignalDirs = ["src", "app", "pages", "components", "ios", "android", "server", "backend", "frontend", "services"];

const authorityDocumentExtensionPattern = /\.(?:md|mdx|mdc|txt)$/i;
const authorityYamlExtensionPattern = /\.ya?ml$/i;
const archivedAuthorityPathPattern = /(^|\/)(?:archive|archived|history|historical|superseded)(\/|$)/i;

export function buildNativeAuthoritySourceInventory(root, relativePaths) {
  const paths = [...new Set(relativePaths
    .map((value) => normalizeSignalPath(value))
    .filter(Boolean))]
    .sort();
  const sources = [];
  for (const relativePath of paths) {
    if (!isProjectSourceFile(root, relativePath)) continue;
    const role = authoritySourceRole(relativePath);
    if (!role) continue;
    const format = authoritySourceFormat(relativePath);
    sources.push({
      path: relativePath,
      role,
      format,
      classificationDefault: authorityClassificationDefault(relativePath, role),
      disposition: format === "UNSUPPORTED" ? "REVIEW_REQUIRED" : "SELECTED",
      reason: authoritySourceReason(role, format),
    });
  }
  return sources;
}

function authorityClassificationDefault(relativePath, role) {
  if (role === "CI_WORKFLOW" || role === "RELEASE_CONTROL") return "PRODUCTION_CONTROL";
  if (role === "AGENT_GUIDANCE") return "SECTION_CONTEXT_REQUIRED";
  if (/(?:^|\/)docs\/sample-policy\.(?:md|mdx|mdc|txt)$/i.test(relativePath)) return "ENGINEERING_BASELINE";
  if (/(?:^|\/)docs\/business\/(?:baselines?\/|.*(?:business|domain|product).*(?:baseline|foundation|index)[^/]*\.)/i.test(relativePath)
    || /(?:^|[-_/])business-baseline\.(?:md|mdx|mdc|txt)$/i.test(relativePath)) {
    return "BUSINESS_FACT";
  }
  if (/(?:^|\/)docs\/(?:architecture|adr)(?:\/|[-_.])/i.test(relativePath)
    || /(?:^|\/)docs\/.*(?:engineering|environment|architecture|ui-baseline)[^/]*\.(?:md|mdx|mdc|txt)$/i.test(relativePath)) {
    return "ENGINEERING_BASELINE";
  }
  return "SECTION_CONTEXT_REQUIRED";
}

function authoritySourceRole(relativePath) {
  if (archivedAuthorityPathPattern.test(relativePath)) return null;
  if (/(^|\/)(?:AGENTS?|\.agent)\.md$/i.test(relativePath)
    || /^\.(?:codex|cursor|claude)\/.*\.(?:md|mdx|mdc|txt)$/i.test(relativePath)) {
    return "AGENT_GUIDANCE";
  }
  if (/(?:^|\/)\.github\/workflows\/.*\.ya?ml$/i.test(relativePath)
    || /(?:^|\/)(?:\.gitlab-ci|azure-pipelines|bitbucket-pipelines)\.ya?ml$/i.test(relativePath)) {
    return "CI_WORKFLOW";
  }
  if (/(?:^|\/)docs\/(?:release|releases|runbooks|rollback|incident)(?:\/|[-_.])/i.test(relativePath)
    || /(?:^|\/)docs\/.*\/(?:release|rollback|deploy|deployment|incident|runbook)[^/]*\.(?:md|mdx|mdc|txt)$/i.test(relativePath)) {
    return "RELEASE_CONTROL";
  }
  if (/(?:^|\/)(?:GOVERNANCE|ARCHITECTURE|RISK|POLICY|SECURITY)\.(?:md|mdx|mdc|txt)$/i.test(relativePath)
    || /(?:^|\/)docs\/(?:governance|baseline|baselines|architecture|adr|risk)(?:\/|[-_.])/i.test(relativePath)
    || /(?:^|\/)docs\/business\/(?:baselines?\/|.*(?:baseline|gate|policy|governance)[^/]*\.(?:md|mdx|mdc|txt)$)/i.test(relativePath)
    || /(?:^|\/)docs\/(?:sample-policy|[^/]+-(?:baseline|governance|architecture|risk-policy|rules))\.(?:md|mdx|mdc|txt)$/i.test(relativePath)) {
    return "GOVERNANCE_DOCUMENT";
  }
  return null;
}

function authoritySourceFormat(relativePath) {
  if (authorityDocumentExtensionPattern.test(relativePath)) return "MARKDOWN";
  if (authorityYamlExtensionPattern.test(relativePath)) return "YAML";
  return "UNSUPPORTED";
}

function authoritySourceReason(role, format) {
  if (format === "UNSUPPORTED") return `${role} source uses an unsupported deterministic parser format`;
  if (role === "AGENT_GUIDANCE") return "project-local agent guidance source";
  if (role === "CI_WORKFLOW") return "project-local CI workflow authority source";
  if (role === "RELEASE_CONTROL") return "project-local release or rollback authority document";
  return "project-local governance or baseline document";
}

function isProjectSourceFile(root, relativePath) {
  if (!isSafeRelativeSignalPath(relativePath)) return false;
  try {
    return !fs.lstatSync(path.join(root, relativePath)).isDirectory();
  } catch {
    return false;
  }
}

export function walkFiles(dir, options = {}) {
  if (!fs.existsSync(dir)) return [];
  const extensions = Array.isArray(options.extensions) ? options.extensions : null;
  const includeDirectories = Boolean(options.includeDirectories);
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (includeDirectories) results.push(full);
      results.push(...walkFiles(full, options));
    } else if (!extensions || extensions.some((extension) => entry.name.endsWith(extension))) {
      results.push(full);
    }
  }
  return results.sort();
}

export function walkRelativePaths(root, relDir = ".", options = {}) {
  const maxDepth = Number.isFinite(options.maxDepth) ? options.maxDepth : 4;
  const maxEntries = Number.isFinite(options.maxEntries) ? options.maxEntries : 100000;
  const ignoredDirs = options.ignoredDirs || defaultIgnoredDirs;
  const state = options._state || { entries: 0 };
  const fullDir = path.join(root, relDir);
  if (!fs.existsSync(fullDir) || maxDepth < 0) return [];
  const results = [];
  for (const entry of fs.readdirSync(fullDir, { withFileTypes: true })) {
    if (ignoredDirs.has(entry.name)) continue;
    state.entries += 1;
    if (state.entries > maxEntries) throw new Error(`Project discovery exceeds the safe ${maxEntries}-entry limit`);
    const relPath = relDir === "." ? entry.name : path.join(relDir, entry.name);
    results.push(relPath);
    if (entry.isDirectory()) {
      results.push(...walkRelativePaths(root, relPath, { ...options, maxDepth: maxDepth - 1, ignoredDirs, maxEntries, _state: state }));
    }
  }
  return results;
}

export function hasProjectSignals(root, options = {}) {
  const files = options.files || projectSignalFiles;
  const dirs = options.dirs || projectSignalDirs;
  return files.some((rel) => fs.existsSync(path.join(root, rel)))
    || dirs.some((rel) => fs.existsSync(path.join(root, rel)));
}

export function filterIntentOSManagedPaths(root, relativePaths) {
  const manifestPath = path.join(root, ".intentos", "intentos-manifest.json");
  if (!fs.existsSync(manifestPath)) return [...relativePaths];
  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  } catch {
    return [...relativePaths];
  }
  const fileTargets = new Set((manifest.copyRules?.files || [])
    .map((rule) => normalizeSignalPath(rule.target))
    .filter(Boolean));
  const directoryTargets = (manifest.copyRules?.directories || [])
    .map((rule) => normalizeSignalPath(rule.target))
    .filter(Boolean);
  const version = readJson(path.join(root, ".intentos", "version.json"));
  const versionManagedTargets = new Set((version?.workflowAssets || [])
    .map((value) => normalizeSignalPath(value))
    .filter(Boolean));
  const versionManagedDirectories = [...versionManagedTargets].filter((value) => !path.posix.extname(value));
  const nativeBootstrapPaths = version?.projectEntryOrigin === "NEW_PROJECT" ? new Set([
    "README.md",
    "AGENTS.md",
    ".github/pull_request_template.md",
    ".github/workflows/ai-workflow-checks.yml",
    "scripts/verify.sh",
    "docs/ai-workflow.md",
    "docs/architecture.md",
    "docs/domain-model.md",
    "docs/engineering-baseline.md",
    "docs/engineering-principles.md",
    "docs/environment-baseline.md",
    "docs/permission-model.md",
    "docs/product-vision.md",
    "docs/risk-policy.md",
    "docs/test-strategy.md",
    "docs/project-profile.md",
    "docs/baseline-selection.md",
    "docs/baseline-evidence.md",
  ]) : new Set();
  const managedTargets = new Set([...fileTargets, ...directoryTargets, ...versionManagedTargets, ...nativeBootstrapPaths]);
  const normalizedPaths = relativePaths.map((value) => normalizeSignalPath(value));
  const placeholderDirectories = new Set(normalizedPaths
    .filter((value) => value.endsWith("/.gitkeep"))
    .map((value) => path.posix.dirname(value))
    .filter((dir) => !normalizedPaths.some((value) => value.startsWith(`${dir}/`) && value !== `${dir}/.gitkeep`)));
  return relativePaths.filter((relativePath) => {
    const normalized = normalizeSignalPath(relativePath);
    if (normalized.endsWith("/.gitkeep") || placeholderDirectories.has(normalized)) return false;
    if (managedTargets.has(normalized)) return false;
    if ([...managedTargets].some((target) => target.startsWith(`${normalized}/`))) return false;
    return ![...directoryTargets, ...versionManagedDirectories]
      .some((target) => normalized === target || normalized.startsWith(`${target}/`));
  });
}

export function partitionNativeAuthorityPaths(root, sourceRoot, relativePaths) {
  const paths = [...new Set(relativePaths.map((value) => normalizeSignalPath(value)).filter(Boolean))].sort();
  if (!isIntentOSSourceCheckout(sourceRoot)) {
    return {
      nativePaths: paths,
      excluded: [],
      status: "NO_AUTHORITATIVE_SOURCE",
    };
  }

  const installedManifestPath = path.join(root, ".intentos", "intentos-manifest.json");
  const installedVersionPath = path.join(root, ".intentos", "version.json");
  if (!isRegularFile(installedManifestPath) || !isRegularFile(installedVersionPath)) {
    return {
      nativePaths: paths,
      excluded: [],
      status: "NO_INSTALLED_INTENTOS_EVIDENCE",
    };
  }

  const sourceManifest = loadManifestOrNull(sourceRoot);
  const version = readJson(installedVersionPath);
  if (!sourceManifest || !version) {
    return {
      nativePaths: paths,
      excluded: [],
      status: "INVALID_INSTALLED_INTENTOS_EVIDENCE",
    };
  }

  const workflowDirs = new Set((sourceManifest.groups?.workflowDirs || [])
    .map((value) => normalizeSignalPath(value))
    .filter(isSafeRelativeSignalPath));
  const distribution = sourceDistributionMappings(sourceManifest);
  const nativePaths = [];
  const excluded = [];

  for (const relativePath of paths) {
    const workflowDir = [...workflowDirs].find((dir) => relativePath === dir || relativePath.startsWith(`${dir}/`));
    if (workflowDir) {
      excluded.push({
        path: relativePath,
        classification: "INTENTOS_WORKFLOW_RECORD",
        evidence: `intentos-manifest.json#groups.workflowDirs:${workflowDir}`,
      });
      continue;
    }

    const targetDigest = regularFileDigest(root, relativePath);
    if (!targetDigest) {
      nativePaths.push(relativePath);
      continue;
    }

    if (hasVerifiedPriorManagedOwnership(version, relativePath, targetDigest)) {
      excluded.push({
        path: relativePath,
        classification: "VERIFIED_PRIOR_INTENTOS_MANAGED",
        evidence: `.intentos/version.json#managedAssetDigests:${targetDigest}`,
      });
      continue;
    }

    const mapping = distributionSourceForTarget(distribution, relativePath);
    if (!mapping) {
      nativePaths.push(relativePath);
      continue;
    }

    const sourceDigest = regularFileDigest(sourceRoot, mapping.source);
    if (sourceDigest && sourceDigest === targetDigest) {
      excluded.push({
        path: relativePath,
        classification: "EXACT_SOURCE_DISTRIBUTION_MATCH",
        evidence: `intentos-manifest.json#copyRules:${sourceDigest}`,
        source: mapping.source,
      });
      continue;
    }

    nativePaths.push(relativePath);
  }

  return {
    nativePaths,
    excluded,
    status: "PARTITIONED",
  };
}

function sourceDistributionMappings(manifest) {
  const files = (manifest.copyRules?.files || [])
    .map((item) => ({
      source: normalizeSignalPath(item.source),
      target: normalizeSignalPath(item.target),
    }))
    .filter((item) => isSafeRelativeSignalPath(item.source) && isSafeRelativeSignalPath(item.target));
  const directories = (manifest.copyRules?.directories || [])
    .map((item) => ({
      source: normalizeSignalPath(item.source),
      target: normalizeSignalPath(item.target),
    }))
    .filter((item) => isSafeRelativeSignalPath(item.source) && isSafeRelativeSignalPath(item.target))
    .sort((left, right) => right.target.length - left.target.length);
  return { files, directories };
}

function distributionSourceForTarget(distribution, target) {
  const file = distribution.files.find((item) => item.target === target);
  if (file) return file;
  const directory = distribution.directories.find((item) => target === item.target || target.startsWith(`${item.target}/`));
  if (!directory || target === directory.target) return null;
  const suffix = target.slice(directory.target.length + 1);
  const source = normalizeSignalPath(`${directory.source}/${suffix}`);
  return isSafeRelativeSignalPath(source) ? { source, target } : null;
}

function hasVerifiedPriorManagedOwnership(version, target, digest) {
  if (version?.managedAssetDigests?.[target] !== digest) return false;
  return (version.workflowAssets || [])
    .map((value) => normalizeSignalPath(value))
    .filter(Boolean)
    .some((managed) => target === managed || target.startsWith(`${managed}/`));
}

function regularFileDigest(root, relativePath) {
  if (!isSafeRelativeSignalPath(relativePath)) return null;
  const file = path.join(root, relativePath);
  if (!isRegularFile(file)) return null;
  return `sha256:${createHash("sha256").update(fs.readFileSync(file)).digest("hex")}`;
}

function isRegularFile(file) {
  try {
    const stat = fs.lstatSync(file);
    return stat.isFile() && !stat.isSymbolicLink();
  } catch {
    return false;
  }
}

function isSafeRelativeSignalPath(value) {
  const normalized = normalizeSignalPath(value);
  return Boolean(normalized)
    && !path.posix.isAbsolute(normalized)
    && !normalized.split("/").includes("..");
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function normalizeSignalPath(value) {
  return String(value || "").replaceAll(path.sep, "/").replace(/^\.\//, "").replace(/\/$/, "");
}
