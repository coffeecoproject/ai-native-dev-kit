import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const READ_ONLY_GIT_CONFIG = [
  ["core.fsmonitor", "false"],
  ["core.hooksPath", os.devNull],
  ["core.pager", "cat"],
  ["pager.branch", "false"],
  ["pager.diff", "false"],
  ["pager.status", "false"],
  ["diff.external", ""],
  ["diff.trustExitCode", "false"],
  ["interactive.diffFilter", ""],
  ["credential.helper", ""],
  ["credential.interactive", "false"],
];

export function gitWorktreeState(root) {
  const inside = spawnReadOnlyGit(root, ["rev-parse", "--is-inside-work-tree"], {
    encoding: "utf8",
  });
  if (inside.status !== 0 || inside.stdout.trim() !== "true") {
    return {
      isGitRepository: false,
      observationStatus: "NON_GIT",
      error: "",
      isDirty: false,
      currentBranch: null,
      changedFileCount: 0,
      changedFilesSample: [],
      changedPaths: [],
      changedFilesDigest: nonGitSourceDigest(root),
    };
  }

  const branch = spawnReadOnlyGit(root, ["branch", "--show-current"], {
    encoding: "utf8",
  });
  const status = spawnReadOnlyGit(root, ["status", "--porcelain", "--untracked-files=all", "--", "."], {
    encoding: "utf8",
  });
  const changedPaths = status.status === 0 ? worktreeChangedPaths(root) : [];

  if (status.status !== 0) {
    return {
      isGitRepository: true,
      observationStatus: "FAILED",
      error: String(status.stderr || "git status failed").trim(),
      isDirty: null,
      currentBranch: branch.status === 0 ? branch.stdout.trim() || null : null,
      changedFileCount: null,
      changedFilesSample: [],
      changedPaths: [],
      changedFilesDigest: null,
    };
  }
  return {
    isGitRepository: true,
    observationStatus: "CURRENT",
    error: "",
    isDirty: changedPaths.length > 0,
    currentBranch: branch.status === 0 ? branch.stdout.trim() || null : null,
    changedFileCount: changedPaths.length,
    changedFilesSample: changedPaths.slice(0, 12),
    changedPaths,
    changedFilesDigest: worktreeDigest(root),
  };
}

function worktreeChangedPaths(root) {
  const options = { encoding: "buffer", maxBuffer: 1024 * 1024 * 32 };
  const tracked = spawnReadOnlyGit(root, ["diff", "--no-ext-diff", "--no-textconv", "--name-only", "-z", "HEAD", "--", "."], options);
  const staged = tracked.status === 0
    ? { status: 0, stdout: Buffer.alloc(0) }
    : spawnReadOnlyGit(root, ["diff", "--cached", "--no-ext-diff", "--no-textconv", "--name-only", "-z", "--", "."], options);
  const unstaged = tracked.status === 0
    ? { status: 0, stdout: Buffer.alloc(0) }
    : spawnReadOnlyGit(root, ["diff", "--no-ext-diff", "--no-textconv", "--name-only", "-z", "--", "."], options);
  const untracked = spawnReadOnlyGit(root, ["ls-files", "--others", "--exclude-standard", "-z", "--", "."], options);
  const outputs = tracked.status === 0
    ? [tracked.stdout, untracked.status === 0 ? untracked.stdout : Buffer.alloc(0)]
    : [
        staged.status === 0 ? staged.stdout : Buffer.alloc(0),
        unstaged.status === 0 ? unstaged.stdout : Buffer.alloc(0),
        untracked.status === 0 ? untracked.stdout : Buffer.alloc(0),
      ];
  return [...new Set(outputs.flatMap((output) => output.toString("utf8").split("\0"))
    .map((value) => value.trim().replaceAll("\\", "/"))
    .filter(Boolean))].sort();
}

function worktreeDigest(root) {
  const options = { encoding: "utf8", maxBuffer: 1024 * 1024 * 32 };
  let tracked = spawnReadOnlyGit(root, ["diff", "--binary", "--no-ext-diff", "--no-textconv", "HEAD", "--", "."], options);
  if (tracked.status !== 0) {
    const staged = spawnReadOnlyGit(root, ["diff", "--cached", "--binary", "--no-ext-diff", "--no-textconv", "--", "."], options);
    const unstaged = spawnReadOnlyGit(root, ["diff", "--binary", "--no-ext-diff", "--no-textconv", "--", "."], options);
    tracked = {
      stdout: `${staged.status === 0 ? staged.stdout : ""}\n${unstaged.status === 0 ? unstaged.stdout : ""}`,
    };
  }
  const untracked = spawnReadOnlyGit(root, ["ls-files", "--others", "--exclude-standard", "-z", "--", "."], {
    encoding: "buffer",
    maxBuffer: 1024 * 1024 * 8,
  });
  const untrackedRows = [];
  if (untracked.status === 0) {
    const paths = untracked.stdout.toString("utf8").split("\0").filter(Boolean).sort();
    for (const rel of paths) {
      const full = path.join(root, rel);
      const stat = fs.existsSync(full) ? fs.lstatSync(full) : null;
      const contentDigest = stat?.isFile() ? digestFile(full) : "NON_FILE";
      untrackedRows.push(`${rel}:${contentDigest}`);
    }
    untrackedRows.push(`TOTAL:${paths.length}`);
  }
  return digest(`${tracked.stdout || ""}\n${untrackedRows.join("\n")}`);
}

function digestFile(file) {
  const hash = createHash("sha256");
  const fd = fs.openSync(file, "r");
  const buffer = Buffer.allocUnsafe(1024 * 1024);
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

function nonGitSourceDigest(root) {
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) return digest("NON_GIT_MISSING");
  const rows = [];
  const ignored = new Set([".git", "node_modules", ".pnpm-store", "dist", "build", "coverage", ".next", ".cache"]);
  const walk = (dir, relative = "") => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (entry.isDirectory() && ignored.has(entry.name)) continue;
      const rel = relative ? `${relative}/${entry.name}` : entry.name;
      const full = path.join(dir, entry.name);
      if (entry.isSymbolicLink()) rows.push(`${rel}:symlink:${fs.readlinkSync(full)}`);
      else if (entry.isDirectory()) walk(full, rel);
      else if (entry.isFile()) rows.push(`${rel}:${digestFile(full)}`);
    }
  };
  walk(root);
  return digest(rows.join("\n"));
}

function digest(value) {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

export function changedFiles(root, options = {}) {
  const base = options.base || "HEAD";
  const pathspecs = Array.isArray(options.pathspecs) ? options.pathspecs : [];
  const result = spawnReadOnlyGit(root, ["diff", "--no-ext-diff", "--no-textconv", "--name-only", "--diff-filter=ACMR", base, "--", ...pathspecs], {
    encoding: "utf8",
  });
  return {
    ok: result.status === 0,
    status: result.status ?? 1,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
    files: result.status === 0
      ? result.stdout.split("\n").map((line) => line.trim()).filter(Boolean)
      : [],
  };
}

function spawnReadOnlyGit(root, args, options = {}) {
  const config = READ_ONLY_GIT_CONFIG.flatMap(([key, value]) => ["-c", `${key}=${value}`]);
  return spawnSync("git", ["-C", root, "--no-pager", ...config, ...args], {
    ...options,
    env: {
      ...process.env,
      GIT_OPTIONAL_LOCKS: "0",
      GIT_TERMINAL_PROMPT: "0",
      GCM_INTERACTIVE: "Never",
      GIT_PAGER: "cat",
      PAGER: "cat",
    },
  });
}
