import fs from "node:fs";
import path from "node:path";

export function normalizePortablePath(value) {
  return String(value || "").replaceAll(path.sep, "/").replace(/^\.\//, "");
}

export function isSafeRelativePath(value, options = {}) {
  const { allowDot = false } = options;
  if (typeof value !== "string") return false;
  const normalized = normalizePortablePath(value);
  if (!normalized) return false;
  if (normalized === ".") return allowDot;
  if (path.isAbsolute(normalized) || normalized.includes("\\") || normalized.includes("\0")) return false;
  const parts = normalized.split("/");
  return parts.every((part) => part && part !== "." && part !== "..");
}

export function assertSafeRelativePath(value, label, options = {}) {
  if (!isSafeRelativePath(value, options)) {
    throw new Error(`${label} must be a safe relative path without absolute paths, backslashes, '.', or '..': ${value || "<empty>"}`);
  }
  return normalizePortablePath(value);
}

export function assertSafeNameSegment(value, label) {
  const normalized = normalizePortablePath(value);
  if (!normalized || normalized.includes("/") || normalized === "." || normalized === "..") {
    throw new Error(`${label} must be a single safe path segment: ${value || "<empty>"}`);
  }
  return assertSafeRelativePath(normalized, label);
}

export function resolveUnderRoot(root, relativePath, label, options = {}) {
  const safeRel = assertSafeRelativePath(relativePath, label, options);
  const resolvedRoot = path.resolve(root);
  const resolved = safeRel === "." ? resolvedRoot : path.resolve(resolvedRoot, ...safeRel.split("/"));
  assertInsideRoot(resolvedRoot, resolved, label);
  return resolved;
}

export function assertInsideRoot(root, candidate, label) {
  const resolvedRoot = path.resolve(root);
  const resolvedCandidate = path.resolve(candidate);
  const relative = path.relative(resolvedRoot, resolvedCandidate);
  if (relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative))) return;
  throw new Error(`${label} resolves outside root: ${resolvedCandidate}`);
}

export function assertNoSymlinkInPath(root, candidate, label) {
  const resolvedRoot = path.resolve(root);
  const resolvedCandidate = path.resolve(candidate);
  assertInsideRoot(resolvedRoot, resolvedCandidate, label);
  if (!fs.existsSync(resolvedRoot)) return;

  let current = resolvedRoot;
  const relative = path.relative(resolvedRoot, resolvedCandidate);
  if (!relative) return;
  for (const part of relative.split(path.sep)) {
    if (!part) continue;
    current = path.join(current, part);
    if (!fs.existsSync(current)) return;
    const stat = fs.lstatSync(current);
    if (stat.isSymbolicLink()) {
      throw new Error(`${label} must not pass through or overwrite a symlink: ${current}`);
    }
  }
}

export function assertSafeWritePath(root, relativePath, label, options = {}) {
  const target = resolveUnderRoot(root, relativePath, label, options);
  assertNoSymlinkInPath(root, target, label);
  return target;
}

export function resolveBackupRoot(targetRoot, backupDir) {
  if (!backupDir) return null;
  const safeRel = assertSafeRelativePath(String(backupDir), "backupDir");
  return assertSafeWritePath(targetRoot, safeRel, "backupDir");
}
