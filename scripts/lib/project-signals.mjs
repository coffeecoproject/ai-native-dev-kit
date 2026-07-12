import fs from "node:fs";
import path from "node:path";

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
