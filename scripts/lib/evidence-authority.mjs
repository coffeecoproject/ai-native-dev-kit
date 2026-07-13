import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { assertNoSymlinkInPath, isSafeRelativePath, normalizePortablePath } from "./path-safety.mjs";

const BINDING_VERSION = "1.91.0";
const workflowOutputDirectories = new Set([
  "adoption-assurance-reports", "adoption-autopilot-reports",
  "adoption-recommendations", "adoption-trial-reports", "ai-logs", "apply-execution-plans",
  "apply-plans", "apply-readiness-reports", "apply-receipts", "approval-records",
  "archive-apply-plans", "automation-proposals", "baseline-decision-cards",
  "baseline-gap-reports", "baseline-pack-selections", "baseline-recommendations",
  "baseline-state-reports", "beginner-entry-cards", "business-rule-closures", "business-universe-coverage-reports",
  "change-boundary-reports", "change-impact-coverage-reports", "closure-decisions",
  "completion-evidence-reports", "context-corrections", "controlled-apply-candidates",
  "conversation-ask-cards", "conversation-turns", "customer-handoffs", "debt-handoff-reports",
  "decision-briefs", "delivery-path-reports", "delivery-status-cards", "doc-lifecycle-reports",
  "execution-assurance-reports", "execution-closures", "existing-rule-reconciliations",
  "evidence",
  "final-reports", "follow-up-proposals", "git-boundary-reports", "goal-cards",
  "governance-convergence-reports", "governance-maps", "gpt-review-prompts",
  "guided-closure-cards", "guided-decision-summaries", "hook-orchestration-plans",
  "hook-policies", "intentos-proposals", "launch-readiness", "launch-review-views",
  "implementation-plans", "learning-candidates", "mvp-example-reports", "native-adoption-review-reports",
  "native-migration-plans", "ordinary-first-slices", "patch-classification-false-positives",
  "patch-classifications", "plan-review-reports", "product-completeness-reports", "real-adoption-trials",
  "release-adapters", "release-approval-records", "release-candidates", "release-channel-policies",
  "release-evidence-gate-reports", "release-execution-plans", "release-guides",
  "release-execution-topologies", "release-handoff-packs", "release-plans", "release-recipes",
  "release-topology-migrations",
  "review-loop-reports", "review-packets", "review-summaries", "review-surface-cards",
  "runtime-hygiene-reports", "scope-change-reports", "skill-candidates",
  "standard-baseline-selections", "status-reports", "subagent-run-plans",
  "task-governance-reports", "test-evidence-reports", "verification-plans",
  "verification-run-manifests", "verification-runtime-plans", "verification-runtime-lifecycle-plans", "runtime-runs",
  "workflow-adoption-maps", "workflow-guidance-cards", "workflow-improvements",
  "workflow-retros",
]);
const authorityIgnoredPathPrefixes = ["schemas/artifacts"];

export function isFileEvidenceRef(value) {
  return /^(artifact|file):/i.test(String(value || "").trim());
}

export function canonicalFileDigest(file) {
  const hash = crypto.createHash("sha256");
  const buffer = Buffer.allocUnsafe(1024 * 1024);
  const fd = fs.openSync(file, "r");
  try {
    let bytesRead;
    do {
      bytesRead = fs.readSync(fd, buffer, 0, buffer.length, null);
      if (bytesRead > 0) hash.update(buffer.subarray(0, bytesRead));
    } while (bytesRead > 0);
  } finally {
    fs.closeSync(fd);
  }
  return `sha256:${hash.digest("hex")}`;
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
  const gitTopResult = runGitResult(root, ["rev-parse", "--show-toplevel"]);
  if (gitTopResult.ok) {
    const gitTop = gitTopResult.stdout;
    const gitRoot = fs.realpathSync(gitTop);
    const headResult = runGitResult(root, ["rev-parse", "HEAD"]);
    const head = headResult.ok ? headResult.stdout || "NO_COMMIT" : "NO_COMMIT";
    const remote = runGitResult(root, ["config", "--get", "remote.origin.url"]).stdout;
    const scope = path.relative(gitRoot, root).split(path.sep).join("/") || ".";
    const revision = gitRevision(root, head);
    if (!revision) throw new Error("cannot establish current Git revision for evidence authority");
    return {
      kind: "GIT",
      fingerprint: digest(`git-root:${gitRoot}|scope:${scope}|remote:${remote || "none"}`),
      revision,
    };
  }
  if (fs.existsSync(path.join(root, ".git"))) {
    throw new Error(`cannot inspect Git repository for evidence authority: ${gitTopResult.error}`);
  }
  return {
    kind: "NON_GIT",
    fingerprint: digest(`project-root:${root}`),
    revision: nonGitRevision(root),
  };
}

function gitRevision(root, head) {
  const result = spawnSync("git", ["-C", root, "status", "--porcelain=v1", "-z", "--untracked-files=all", "--", "."], {
    encoding: null,
    maxBuffer: 1024 * 1024 * 64,
  });
  if (result.status !== 0) return "";
  const entries = parseGitStatus(result.stdout);
  const rows = [];
  for (const entry of entries) {
    for (const relative of entry.paths) {
      const normalized = normalizePortablePath(relative);
      if (isAuthorityIgnoredPath(normalized)) continue;
      const full = path.join(root, normalized);
      if (!fs.existsSync(full)) rows.push(`${entry.status}:${normalized}:deleted`);
      else if (fs.lstatSync(full).isSymbolicLink()) rows.push(`${entry.status}:${normalized}:symlink:${fs.readlinkSync(full)}`);
      else if (fs.lstatSync(full).isFile()) rows.push(`${entry.status}:${normalized}:${canonicalFileDigest(full)}`);
      else if (fs.lstatSync(full).isDirectory()) rows.push(`${entry.status}:${normalized}:${directoryGitState(full)}`);
    }
  }
  rows.push(...ignoredProjectRows(root));
  return rows.length === 0 ? head : digest(`git:${head}\n${rows.sort().join("\n")}`);
}

function ignoredProjectRows(root) {
  const result = spawnSync("git", ["-C", root, "ls-files", "--others", "--ignored", "--exclude-standard", "-z", "--", "."], {
    encoding: null,
    maxBuffer: 1024 * 1024 * 64,
  });
  if (result.status !== 0) throw new Error("cannot inspect ignored project files for evidence authority");
  const rows = [];
  for (const relative of result.stdout.toString("utf8").split("\0").filter(Boolean).sort()) {
    const normalized = normalizePortablePath(relative);
    if (isIgnoredBuildOrDependencyPath(normalized) || isAuthorityIgnoredPath(normalized)) continue;
    const full = path.join(root, normalized);
    if (!fs.existsSync(full)) continue;
    const stat = fs.lstatSync(full);
    if (stat.isSymbolicLink()) rows.push(`ignored:${normalized}:symlink:${fs.readlinkSync(full)}`);
    else if (stat.isFile()) rows.push(`ignored:${normalized}:${canonicalFileDigest(full)}`);
  }
  return rows;
}

function isIgnoredBuildOrDependencyPath(relative) {
  const [top] = normalizePortablePath(relative).split("/");
  return new Set([".git", "node_modules", ".pnpm-store", "dist", "build", "coverage", ".next", ".cache"]).has(top);
}

function directoryGitState(directory) {
  const head = runGitResult(directory, ["rev-parse", "HEAD"]);
  const status = spawnSync("git", ["-C", directory, "status", "--porcelain=v1", "--untracked-files=all"], {
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 16,
  });
  if (!head.ok || status.status !== 0) throw new Error(`cannot inspect nested Git state at ${directory}`);
  return digest(`${head.stdout}\n${status.stdout || ""}`);
}

function parseGitStatus(buffer) {
  const items = buffer.toString("utf8").split("\0");
  const entries = [];
  for (let index = 0; index < items.length;) {
    const item = items[index++];
    if (!item) continue;
    const status = item.slice(0, 2);
    const paths = [item.slice(3)];
    if (/[RC]/.test(status) && items[index]) paths.push(items[index++]);
    entries.push({ status, paths: paths.filter(Boolean) });
  }
  return entries;
}

function nonGitRevision(root) {
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) return digest("non-git-source:missing");
  const rows = [];
  const ignored = new Set([".git", "node_modules", ".pnpm-store", "dist", "build", "coverage", ".next", ".cache"]);
  const limits = { files: 100000, bytes: 20 * 1024 * 1024 * 1024, depth: 40 };
  let fileCount = 0;
  let totalBytes = 0;
  const walk = (dir, relative = "", depth = 0) => {
    if (depth > limits.depth) throw new Error(`Project identity exceeds maximum depth ${limits.depth}`);
    for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (entry.isDirectory() && ignored.has(entry.name)) continue;
      if (!relative && entry.isDirectory() && workflowOutputDirectories.has(entry.name)) continue;
      const rel = relative ? `${relative}/${entry.name}` : entry.name;
      if (isAuthorityIgnoredPath(rel)) continue;
      const full = path.join(dir, entry.name);
      if (entry.isSymbolicLink()) rows.push(`${rel}:symlink:${fs.readlinkSync(full)}`);
      else if (entry.isDirectory()) walk(full, rel, depth + 1);
      else if (entry.isFile()) {
        fileCount += 1;
        totalBytes += fs.statSync(full).size;
        if (fileCount > limits.files || totalBytes > limits.bytes) throw new Error("Project identity exceeds bounded file or byte limits");
        rows.push(`${rel}:${canonicalFileDigest(full)}`);
      }
    }
  };
  walk(root);
  return digest(rows.join("\n"));
}

function isAuthorityIgnoredPath(relativePath) {
  const normalized = normalizePortablePath(relativePath);
  const [top] = normalized.split("/");
  return top === ".intentos"
    || workflowOutputDirectories.has(top)
    || authorityIgnoredPathPrefixes.some((prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`));
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

function runGitResult(root, args) {
  const result = spawnSync("git", ["-C", root, ...args], { encoding: "utf8" });
  return {
    ok: result.status === 0,
    stdout: result.status === 0 ? String(result.stdout || "").trim() : "",
    error: String(result.stderr || result.error?.message || `git exited ${result.status}`).trim(),
  };
}

function digest(value) {
  return `sha256:${crypto.createHash("sha256").update(String(value)).digest("hex")}`;
}

function sameJson(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}
