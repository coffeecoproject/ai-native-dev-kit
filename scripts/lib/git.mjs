import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

export function gitWorktreeState(root) {
  const inside = spawnSync("git", ["-C", root, "rev-parse", "--is-inside-work-tree"], {
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
      changedFilesDigest: nonGitSourceDigest(root),
    };
  }

  const branch = spawnSync("git", ["-C", root, "branch", "--show-current"], {
    encoding: "utf8",
  });
  const status = spawnSync("git", ["-C", root, "status", "--porcelain", "--untracked-files=all", "--", "."], {
    encoding: "utf8",
  });
  const changedFiles = status.status === 0
    ? status.stdout.split("\n").map((line) => line.trim()).filter(Boolean)
    : [];

  if (status.status !== 0) {
    return {
      isGitRepository: true,
      observationStatus: "FAILED",
      error: String(status.stderr || "git status failed").trim(),
      isDirty: null,
      currentBranch: branch.status === 0 ? branch.stdout.trim() || null : null,
      changedFileCount: null,
      changedFilesSample: [],
      changedFilesDigest: null,
    };
  }
  return {
    isGitRepository: true,
    observationStatus: "CURRENT",
    error: "",
    isDirty: changedFiles.length > 0,
    currentBranch: branch.status === 0 ? branch.stdout.trim() || null : null,
    changedFileCount: changedFiles.length,
    changedFilesSample: changedFiles.slice(0, 12),
    changedFilesDigest: worktreeDigest(root),
  };
}

function worktreeDigest(root) {
  const options = { encoding: "utf8", maxBuffer: 1024 * 1024 * 32 };
  let tracked = spawnSync("git", ["-C", root, "diff", "--binary", "--no-ext-diff", "HEAD", "--", "."], options);
  if (tracked.status !== 0) {
    const staged = spawnSync("git", ["-C", root, "diff", "--cached", "--binary", "--no-ext-diff", "--", "."], options);
    const unstaged = spawnSync("git", ["-C", root, "diff", "--binary", "--no-ext-diff", "--", "."], options);
    tracked = {
      stdout: `${staged.status === 0 ? staged.stdout : ""}\n${unstaged.status === 0 ? unstaged.stdout : ""}`,
    };
  }
  const untracked = spawnSync("git", ["-C", root, "ls-files", "--others", "--exclude-standard", "-z", "--", "."], {
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
  const result = spawnSync("git", ["-C", root, "diff", "--name-only", "--diff-filter=ACMR", base, "--", ...pathspecs], {
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
