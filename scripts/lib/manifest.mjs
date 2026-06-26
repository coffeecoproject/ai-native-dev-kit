import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const kitRoot = path.resolve(__dirname, "..", "..");

export const manifestGroupNames = [
  "sourceRequired",
  "targetCore",
  "targetFull",
  "aiNativeCore",
  "templates",
  "prompts",
  "checklists",
  "profiles",
  "industrialPackRegistry",
  "workflowDirs",
  "workflowReadiness",
  "scripts",
  "platformAdapters",
  "examples",
  "fixtures",
  "workflowVersionAssets",
];

export function normalizePath(value) {
  return String(value || "").replaceAll(path.sep, "/").replace(/^\.\//, "");
}

export function readText(root, relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

export function readJsonFile(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

export function readJson(root, relativePath) {
  return readJsonFile(path.join(root, relativePath));
}

export function manifestPathForRoot(root = kitRoot, manifestPath = null) {
  if (manifestPath) {
    return path.isAbsolute(manifestPath) ? manifestPath : path.join(root, manifestPath);
  }
  const sourceManifest = path.join(root, "dev-kit-manifest.json");
  if (fs.existsSync(sourceManifest)) return sourceManifest;
  return path.join(root, ".ai-native", "dev-kit-manifest.json");
}

export function loadManifest(root = kitRoot, manifestPath = null) {
  return readJsonFile(manifestPathForRoot(root, manifestPath));
}

export function loadManifestOrNull(root = kitRoot, manifestPath = null) {
  const resolved = manifestPathForRoot(root, manifestPath);
  if (!fs.existsSync(resolved)) return null;
  return readJsonFile(resolved);
}

export function manifestGroup(root, groupName, options = {}) {
  const manifest = loadManifestOrNull(root, options.manifestPath);
  if (!manifest) {
    if (options.fallback) return sortedUnique(options.fallback);
    throw new Error(`Manifest not found for ${root}`);
  }
  return sortedUnique(manifest.groups?.[groupName] || []);
}

export function sourceRequiredPaths(root = kitRoot, options = {}) {
  return manifestGroup(root, "sourceRequired", options);
}

export function targetRequiredPaths(root, mode = "full", options = {}) {
  const groupName = mode === "core" ? "targetCore" : "targetFull";
  return manifestGroup(root, groupName, options);
}

export function workflowRequiredPaths(root, options = {}) {
  return manifestGroup(root, "workflowReadiness", options);
}

export function workflowVersionAssets(root = kitRoot, options = {}) {
  return manifestGroup(root, "workflowVersionAssets", options);
}

export function manifestCopyRules(root = kitRoot, options = {}) {
  const manifest = loadManifestOrNull(root, options.manifestPath);
  if (!manifest) {
    if (options.fallback) return options.fallback;
    throw new Error(`Manifest not found for ${root}`);
  }
  return manifest.copyRules || {};
}

export function currentDevKitVersion(root = kitRoot) {
  const content = readText(root, "VERSION.md");
  const match = content.match(/Current version:\s*`([^`]+)`/);
  return match ? match[1] : null;
}

export function sortedUnique(values) {
  return [...new Set(values.map(normalizePath).filter(Boolean))].sort();
}

export function diffLists(expected, actual) {
  const expectedSet = new Set(expected);
  const actualSet = new Set(actual);
  return {
    missing: expected.filter((item) => !actualSet.has(item)),
    extra: actual.filter((item) => !expectedSet.has(item)),
  };
}

export function extractConstStringArray(content, constName) {
  const marker = new RegExp(`\\bconst\\s+${escapeRegExp(constName)}\\s*=\\s*\\[`, "m");
  const match = content.match(marker);
  if (!match) {
    throw new Error(`Could not find const array: ${constName}`);
  }
  return extractStringArrayAt(content, match.index + match[0].lastIndexOf("["));
}

export function extractPropertyStringArray(content, propertyName) {
  const marker = new RegExp(`\\b${escapeRegExp(propertyName)}\\s*:\\s*\\[`, "m");
  const match = content.match(marker);
  if (!match) {
    throw new Error(`Could not find property array: ${propertyName}`);
  }
  return extractStringArrayAt(content, match.index + match[0].lastIndexOf("["));
}

function extractStringArrayAt(content, openBracketIndex) {
  const literal = extractArrayLiteral(content, openBracketIndex);
  return sortedUnique([...literal.matchAll(/"((?:\\.|[^"\\])*)"/g)]
    .map((match) => JSON.parse(`"${match[1]}"`)));
}

function extractArrayLiteral(content, openBracketIndex) {
  let depth = 0;
  let quote = null;
  let escaped = false;

  for (let index = openBracketIndex; index < content.length; index += 1) {
    const char = content[index];

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === "\"" || char === "'") {
      quote = char;
      continue;
    }

    if (char === "[") {
      depth += 1;
    } else if (char === "]") {
      depth -= 1;
      if (depth === 0) return content.slice(openBracketIndex, index + 1);
    }
  }

  throw new Error("Could not find array closing bracket");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
