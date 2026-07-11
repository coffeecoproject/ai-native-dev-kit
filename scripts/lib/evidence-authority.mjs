import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { assertNoSymlinkInPath, isSafeRelativePath, normalizePortablePath } from "./path-safety.mjs";

const BINDING_VERSION = "1.91.0";
const moduleRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const workflowOutputDirectories = readWorkflowOutputDirectories();
const authorityIgnoredPathPrefixes = ["schemas/artifacts"];

export function isFileEvidenceRef(value) {
  return /^(artifact|file):/i.test(String(value || "").trim());
}

export function canonicalFileDigest(file) {
  return `sha256:${crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex")}`;
}

export function resolveAuthoritativeEvidenceReference(projectRoot, fromFile, referencePath, options = {}) {
  const value = String(referencePath || "").trim().replace(/^(artifact|file):/i, "");
  if (!isSafeRelativePath(value)) {
    return { ok: false, file: "", relativePath: "", error: "reference must be a safe project-relative path" };
  }

  const root = realProjectRoot(projectRoot);
  const baseCandidates = [
    path.join(root, normalizePortablePath(value)),
    path.join(root, ".intentos", normalizePortablePath(value)),
  ];
  if (fromFile) baseCandidates.splice(1, 0, path.resolve(path.dirname(fromFile), normalizePortablePath(value)));

  const seen = new Set();
  for (const candidate of baseCandidates) {
    const resolved = path.resolve(candidate);
    if (seen.has(resolved)) continue;
    seen.add(resolved);
    const lexicalRelative = path.relative(root, resolved);
    if (lexicalRelative.startsWith("..") || path.isAbsolute(lexicalRelative)) continue;
    if (!fs.existsSync(resolved)) continue;
    try {
      assertNoSymlinkInPath(root, resolved, "evidence reference");
      if (!fs.lstatSync(resolved).isFile()) continue;
      const realFile = fs.realpathSync(resolved);
      const actualRelative = path.relative(root, realFile);
      if (actualRelative.startsWith("..") || path.isAbsolute(actualRelative)) {
        return { ok: false, file: "", relativePath: "", error: "reference resolves outside the project root" };
      }
      if (options.markdownOnly && !/\.md$/i.test(realFile)) continue;
      return {
        ok: true,
        file: realFile,
        relativePath: actualRelative.split(path.sep).join("/"),
        error: "",
      };
    } catch (error) {
      return { ok: false, file: "", relativePath: "", error: error.message };
    }
  }
  return { ok: false, file: "", relativePath: "", error: "reference does not resolve to a project-local file" };
}

export function createEvidenceAuthorityBinding(projectRoot, options = {}) {
  const taskRef = String(options.taskRef || "").trim();
  const intentDigest = String(options.intentDigest || "").trim();
  const sources = [];
  const seen = new Set();
  for (const item of options.sourceRefs || []) {
    const ref = String(item || "").trim();
    if (!isFileEvidenceRef(ref)) continue;
    const resolved = resolveAuthoritativeEvidenceReference(projectRoot, options.fromFile || "", ref);
    if (!resolved.ok) continue;
    const key = `${ref}|${resolved.relativePath}`;
    if (seen.has(key)) continue;
    seen.add(key);
    sources.push({
      ref,
      relative_path: resolved.relativePath,
      raw_file_digest: canonicalFileDigest(resolved.file),
    });
  }
  return {
    binding_version: BINDING_VERSION,
    project: projectIdentity(projectRoot),
    task: {
      task_ref: taskRef,
      intent_digest: intentDigest,
    },
    sources,
  };
}

export function validateEvidenceAuthorityBinding(projectRoot, binding, options = {}) {
  const errors = [];
  const expectedTaskRef = String(options.taskRef || "").trim();
  const expectedIntentDigest = String(options.intentDigest || "").trim();
  if (!binding || typeof binding !== "object" || Array.isArray(binding)) {
    return { ok: false, errors: ["authority_binding is required"] };
  }
  if (binding.binding_version !== BINDING_VERSION) errors.push(`authority_binding.binding_version must be ${BINDING_VERSION}`);
  const actualProject = projectIdentity(projectRoot);
  if (!sameJson(binding.project, actualProject)) errors.push("authority_binding.project does not match the current project identity or revision");
  if (binding.task?.task_ref !== expectedTaskRef) errors.push("authority_binding.task.task_ref does not match the current report task_ref");
  if (binding.task?.intent_digest !== expectedIntentDigest) errors.push("authority_binding.task.intent_digest does not match the current report intent_digest");

  const expectedRefs = uniqueFileRefs(options.sourceRefs || []);
  const recorded = Array.isArray(binding.sources) ? binding.sources : null;
  if (!recorded) {
    errors.push("authority_binding.sources must be an array");
    return { ok: false, errors };
  }
  const byRef = new Map(recorded.map((item) => [String(item?.ref || "").trim(), item]));
  for (const ref of expectedRefs) {
    const item = byRef.get(ref);
    if (!item) {
      errors.push(`authority_binding is missing file-backed source ${ref}`);
      continue;
    }
    const resolved = resolveAuthoritativeEvidenceReference(projectRoot, options.fromFile || "", ref);
    if (!resolved.ok) {
      errors.push(`authority_binding source ${ref} is unsafe or unresolved: ${resolved.error}`);
      continue;
    }
    if (item.relative_path !== resolved.relativePath) errors.push(`authority_binding source ${ref} relative_path does not match resolved file`);
    if (item.raw_file_digest !== canonicalFileDigest(resolved.file)) errors.push(`authority_binding source ${ref} raw_file_digest does not match source file`);
  }
  for (const item of recorded) {
    const ref = String(item?.ref || "").trim();
    if (!expectedRefs.includes(ref)) errors.push(`authority_binding contains an unconsumed source ${ref || "<empty>"}`);
  }
  return { ok: errors.length === 0, errors };
}

export function projectIdentity(projectRoot) {
  const root = realProjectRoot(projectRoot);
  const gitTop = runGit(root, ["rev-parse", "--show-toplevel"]);
  if (gitTop) {
    const gitRoot = fs.realpathSync(gitTop);
    const revision = runGit(root, ["rev-parse", "HEAD"]);
    const remote = runGit(root, ["config", "--get", "remote.origin.url"]);
    const scope = path.relative(gitRoot, root).split(path.sep).join("/") || ".";
    return {
      kind: "GIT",
      fingerprint: digest(`git-root:${gitRoot}|scope:${scope}|remote:${remote || "none"}`),
      revision: revision || "NO_COMMIT",
    };
  }
  return {
    kind: "NON_GIT",
    fingerprint: digest(`project-root:${root}`),
    revision: nonGitRevision(root),
  };
}

function nonGitRevision(root) {
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) return digest("non-git-source:missing");
  const rows = [];
  const ignored = new Set([".git", "node_modules", ".pnpm-store", "dist", "build", "coverage", ".next", ".cache"]);
  const walk = (dir, relative = "") => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (entry.isDirectory() && ignored.has(entry.name)) continue;
      if (!relative && entry.isDirectory() && workflowOutputDirectories.has(entry.name)) continue;
      const rel = relative ? `${relative}/${entry.name}` : entry.name;
      if (authorityIgnoredPathPrefixes.some((prefix) => rel === prefix || rel.startsWith(`${prefix}/`))) continue;
      const full = path.join(dir, entry.name);
      if (entry.isSymbolicLink()) rows.push(`${rel}:symlink:${fs.readlinkSync(full)}`);
      else if (entry.isDirectory()) walk(full, rel);
      else if (entry.isFile()) rows.push(`${rel}:${canonicalFileDigest(full)}`);
    }
  };
  walk(root);
  return digest(rows.join("\n"));
}

function readWorkflowOutputDirectories() {
  for (const manifestPath of [
    path.join(moduleRoot, "intentos-manifest.json"),
    path.join(moduleRoot, ".intentos", "intentos-manifest.json"),
  ]) {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
      const values = Array.isArray(manifest?.groups?.workflowDirs) ? manifest.groups.workflowDirs : [];
      return new Set(values.map((value) => String(value || "").split("/")[0]).filter(Boolean));
    } catch {
      // Try the next trusted installation layout.
    }
  }
  return new Set([
    "business-rule-closures",
    "change-impact-coverage-reports",
    "completion-evidence-reports",
    "execution-assurance-reports",
    "test-evidence-reports",
    "verification-plans",
  ]);
}

function realProjectRoot(projectRoot) {
  const root = path.resolve(projectRoot);
  return fs.existsSync(root) ? fs.realpathSync(root) : root;
}

function uniqueFileRefs(values) {
  return [...new Set(values
    .map((value) => String(value || "").trim())
    .filter((value) => isFileEvidenceRef(value)))];
}

function runGit(root, args) {
  const result = spawnSync("git", ["-C", root, ...args], { encoding: "utf8" });
  if (result.status !== 0) return "";
  return String(result.stdout || "").trim();
}

function digest(value) {
  return `sha256:${crypto.createHash("sha256").update(String(value)).digest("hex")}`;
}

function sameJson(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}
