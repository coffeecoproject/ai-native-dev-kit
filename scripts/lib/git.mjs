import { spawnSync } from "node:child_process";

export function gitWorktreeState(root) {
  const inside = spawnSync("git", ["-C", root, "rev-parse", "--is-inside-work-tree"], {
    encoding: "utf8",
  });
  if (inside.status !== 0 || inside.stdout.trim() !== "true") {
    return {
      isGitRepository: false,
      isDirty: false,
      currentBranch: null,
      changedFileCount: 0,
      changedFilesSample: [],
    };
  }

  const branch = spawnSync("git", ["-C", root, "branch", "--show-current"], {
    encoding: "utf8",
  });
  const status = spawnSync("git", ["-C", root, "status", "--porcelain"], {
    encoding: "utf8",
  });
  const changedFiles = status.status === 0
    ? status.stdout.split("\n").map((line) => line.trim()).filter(Boolean)
    : [];

  return {
    isGitRepository: true,
    isDirty: changedFiles.length > 0,
    currentBranch: branch.status === 0 ? branch.stdout.trim() || null : null,
    changedFileCount: changedFiles.length,
    changedFilesSample: changedFiles.slice(0, 12),
  };
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
