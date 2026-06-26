import fs from "node:fs";
import path from "node:path";

export const defaultIgnoredDirs = new Set([
  ".git",
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
  const ignoredDirs = options.ignoredDirs || defaultIgnoredDirs;
  const fullDir = path.join(root, relDir);
  if (!fs.existsSync(fullDir) || maxDepth < 0) return [];
  const results = [];
  for (const entry of fs.readdirSync(fullDir, { withFileTypes: true })) {
    if (ignoredDirs.has(entry.name)) continue;
    const relPath = relDir === "." ? entry.name : path.join(relDir, entry.name);
    results.push(relPath);
    if (entry.isDirectory()) {
      results.push(...walkRelativePaths(root, relPath, { ...options, maxDepth: maxDepth - 1, ignoredDirs }));
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
