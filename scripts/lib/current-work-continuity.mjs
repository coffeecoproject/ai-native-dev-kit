import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { evidenceDigest } from "./artifact-schema.mjs";

const queueStatePattern = /(?:^|\n)(?:[-*]\s*)?(?:current\s+)?(?:state|status)\s*:\s*`?(CURRENT|PAUSED|QUEUED|DONE)`?/i;
const queueTableStatePattern = /^\|([^\n]*)\|\s*`?(CURRENT|PAUSED|QUEUED|DONE)`?\s*\|([^\n]*)$/gim;
const continuityRoots = [
  "work-queue",
  "tasks",
  "docs/sessions",
  "implementation-plans",
  "decision-briefs",
  "execution-closures",
  "closure-decisions",
  "final-reports",
];
const readOnlyGitConfig = [
  ["core.fsmonitor", "false"],
  ["core.hooksPath", os.devNull],
  ["core.pager", "cat"],
  ["diff.external", ""],
  ["credential.helper", ""],
];

export function collectCurrentWorkContinuity(projectRoot) {
  const root = path.resolve(projectRoot);
  const git = collectGitWork(root);
  const queueCandidates = collectQueueCandidates(root);
  const current = queueCandidates.filter((item) => item.state === "CURRENT");
  const state = current.length > 1
    ? "CURRENT_CONFLICTED"
    : current.length === 1
      ? "CURRENT_MAPPED"
      : git.changed_paths.length > 0
        ? "UNATTRIBUTED_CHANGES"
        : "NO_CURRENT_WORK";
  const base = {
    schema_version: "1.109.0",
    state,
    queue_candidates: queueCandidates,
    current_task_refs: current.map((item) => item.ref),
    git,
    write_overlap_state: "NOT_EVALUATED",
    concurrent_change_state: "NOT_EVALUATED",
  };
  return { ...base, continuity_digest: evidenceDigest(base, []) };
}

export function evaluateWriteOverlap(continuity, targetPaths = []) {
  const normalizedTargets = targetPaths.map(normalizePath).filter(Boolean);
  const overlaps = [];
  for (const changed of continuity?.git?.changed_paths || []) {
    if (normalizedTargets.some((target) => sameOrAncestor(target, changed))) overlaps.push(changed);
  }
  return {
    state: overlaps.length > 0 ? "OVERLAP_BLOCKED" : "NO_OVERLAP",
    overlapping_paths: [...new Set(overlaps)].sort(),
    target_paths: [...new Set(normalizedTargets)].sort(),
  };
}

export function currentWorkCheckpoint(continuity) {
  return {
    continuity_digest: continuity?.continuity_digest || "",
    git_revision: continuity?.git?.revision || "",
    git_status_digest: continuity?.git?.status_digest || "",
    current_task_refs: continuity?.current_task_refs || [],
  };
}

function collectGitWork(root) {
  const top = runGit(root, ["rev-parse", "--show-toplevel"]);
  if (!top.ok) return {
    mode: fs.existsSync(path.join(root, ".git")) ? "GIT_UNAVAILABLE" : "NON_GIT",
    revision: nonGitRevision(root),
    changed_paths: [],
    status_digest: digest("non-git:no-status"),
    observation_status: fs.existsSync(path.join(root, ".git")) ? "FAILED" : "OBSERVED",
  };
  const head = runGit(root, ["rev-parse", "HEAD"]);
  const status = runGitRaw(root, ["status", "--porcelain=v1", "-z", "--untracked-files=all", "--", "."]);
  if (!head.ok || !status.ok) return {
    mode: "GIT_UNAVAILABLE",
    revision: "",
    changed_paths: [],
    status_digest: digest(`git-error:${head.error}|${status.error}`),
    observation_status: "FAILED",
  };
  const changed = parsePorcelainZ(status.stdout);
  return {
    mode: "GIT",
    revision: head.stdout,
    changed_paths: changed,
    status_digest: digest(status.stdout),
    observation_status: "OBSERVED",
  };
}

function parsePorcelainZ(value) {
  const entries = String(value || "").split("\0");
  const paths = [];
  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index];
    if (!entry) continue;
    const status = entry.slice(0, 2);
    const current = normalizePath(entry.slice(3));
    if (current) paths.push(current);
    if (/[RC]/.test(status) && entries[index + 1]) {
      const original = normalizePath(entries[index + 1]);
      if (original) paths.push(original);
      index += 1;
    }
  }
  return [...new Set(paths)].sort();
}

function collectQueueCandidates(root) {
  const files = new Set();
  for (const relativeRoot of continuityRoots) {
    const candidateRoot = path.join(root, relativeRoot);
    if (!fs.existsSync(candidateRoot) || !fs.statSync(candidateRoot).isDirectory()) continue;
    const discovered = [];
    walk(candidateRoot, discovered);
    for (const file of discovered) if (file.endsWith(".md")) files.add(file);
  }
  for (const name of fs.readdirSync(root)) {
    if (/^(?:todo|todos|task[-_ ]?queue|work[-_ ]?queue)(?:\.[^.]+)?$/i.test(name)) {
      const file = path.join(root, name);
      if (fs.lstatSync(file).isFile()) files.add(file);
    }
  }
  return [...files].sort().flatMap((file) => {
    const content = fs.readFileSync(file, "utf8");
    const direct = content.match(queueStatePattern);
    const base = {
      ref: path.relative(root, file).replaceAll(path.sep, "/"),
      digest: digest(content),
      source_kind: continuitySourceKind(root, file),
    };
    if (direct) return [{ ...base, state: direct[1].toUpperCase() }];
    const rows = [...content.matchAll(queueTableStatePattern)];
    if (rows.length === 0) return [{ ...base, state: "UNKNOWN" }];
    const seen = new Set();
    return rows.flatMap((row, index) => {
      const taskIdentity = firstTableCell(row[1]);
      const state = row[2].toUpperCase();
      const identity = `${taskIdentity || `row-${index + 1}`}:${state}`;
      if (seen.has(identity)) return [];
      seen.add(identity);
      return [{
        ...base,
        ref: `${base.ref}#row-${index + 1}`,
        state,
      }];
    });
  });
}

function firstTableCell(value) {
  return String(value || "")
    .split("|")[0]
    .replaceAll("`", "")
    .trim()
    .toLowerCase();
}

function continuitySourceKind(root, file) {
  const relative = path.relative(root, file).replaceAll(path.sep, "/");
  const matched = continuityRoots.find((prefix) => relative === prefix || relative.startsWith(`${prefix}/`));
  return matched ? matched.toUpperCase().replaceAll("/", "_").replaceAll("-", "_") : "ROOT_TODO";
}

function walk(dir, files) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) continue;
    if (entry.isDirectory()) walk(full, files);
    else if (entry.isFile()) files.push(full);
  }
}

function runGit(root, args) {
  const result = spawnReadOnlyGit(root, args);
  return {
    ok: result.status === 0,
    stdout: result.status === 0 ? String(result.stdout || "").trim() : "",
    error: String(result.stderr || result.error?.message || `git exited ${result.status}`).trim(),
  };
}

function runGitRaw(root, args) {
  const result = spawnReadOnlyGit(root, args);
  return {
    ok: result.status === 0,
    stdout: result.status === 0 ? String(result.stdout || "") : "",
    error: String(result.stderr || result.error?.message || `git exited ${result.status}`).trim(),
  };
}

function spawnReadOnlyGit(root, args) {
  const config = readOnlyGitConfig.flatMap(([key, value]) => ["-c", `${key}=${value}`]);
  return spawnSync("git", ["-C", root, "--no-pager", ...config, ...args], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    env: {
      ...process.env,
      GIT_CONFIG_NOSYSTEM: "1",
      GIT_CONFIG_GLOBAL: os.devNull,
      GIT_OPTIONAL_LOCKS: "0",
      GIT_TERMINAL_PROMPT: "0",
      GCM_INTERACTIVE: "Never",
      GIT_PAGER: "cat",
      PAGER: "cat",
    },
  });
}

function nonGitRevision(root) {
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) return digest("non-git:missing");
  const rows = [];
  walkForRevision(root, root, rows);
  return digest(rows.join("\n"));
}

function walkForRevision(root, dir, rows) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name))) {
    if (dir === root && [".git", "node_modules"].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    const relative = path.relative(root, full).replaceAll(path.sep, "/");
    const stat = fs.lstatSync(full);
    if (stat.isSymbolicLink()) {
      rows.push(`${relative}:symlink:${fs.readlinkSync(full)}`);
    } else if (stat.isDirectory()) {
      rows.push(`${relative}:dir`);
      walkForRevision(root, full, rows);
    } else if (stat.isFile()) {
      rows.push(`${relative}:file:${stat.mode}:${stat.size}:${digest(fs.readFileSync(full))}`);
    } else {
      rows.push(`${relative}:other:${stat.mode}:${stat.size}`);
    }
  }
}

function sameOrAncestor(left, right) {
  return left === right || left.startsWith(`${right}/`) || right.startsWith(`${left}/`);
}

function normalizePath(value) {
  return String(value || "").trim().replaceAll("\\", "/").replace(/^\.\//, "");
}

function digest(value) {
  return `sha256:${crypto.createHash("sha256").update(Buffer.isBuffer(value) ? value : String(value)).digest("hex")}`;
}
