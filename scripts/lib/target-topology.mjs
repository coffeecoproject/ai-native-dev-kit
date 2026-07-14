import fs from "node:fs";
import path from "node:path";
import { evidenceDigest } from "./artifact-schema.mjs";

export const TARGET_TOPOLOGY_STATES = Object.freeze([
  "ABSENT_LEAF",
  "EMPTY_DIRECTORY",
  "NONEMPTY_DIRECTORY",
  "NON_DIRECTORY",
  "UNSAFE",
]);

export function inspectTargetTopology(targetPath) {
  const requestedPath = path.resolve(String(targetPath || "."));
  const requestedStat = lstatOrNull(requestedPath);
  if (requestedStat?.isSymbolicLink()) {
    return finalize({
      requested_path: requestedPath,
      canonical_target: requestedPath,
      nearest_existing_ancestor: "",
      ancestor_identity: null,
      unresolved_segments: [],
      state: "UNSAFE",
      reason: "The target itself is a symbolic link, including a dangling symbolic link.",
    });
  }
  const nearest = nearestExistingAncestor(requestedPath);
  if (!nearest) return finalize({
    requested_path: requestedPath,
    canonical_target: requestedPath,
    nearest_existing_ancestor: "",
    ancestor_identity: null,
    unresolved_segments: [],
    state: "UNSAFE",
    reason: "No existing ancestor can establish target topology.",
  });

  const relative = path.relative(nearest.path, requestedPath);
  const unresolvedSegments = relative && relative !== "." ? relative.split(path.sep).filter(Boolean) : [];
  if (relative.startsWith("..") || path.isAbsolute(relative) || unresolvedSegments.includes("..")) {
    return finalize({
      requested_path: requestedPath,
      canonical_target: requestedPath,
      nearest_existing_ancestor: nearest.realpath,
      ancestor_identity: nearest.identity,
      unresolved_segments: unresolvedSegments,
      state: "UNSAFE",
      reason: "Target escapes its nearest trusted existing ancestor.",
    });
  }

  if (!fs.existsSync(requestedPath)) {
    if (unresolvedSegments.length !== 1) {
      return finalize({
        requested_path: requestedPath,
        canonical_target: path.join(nearest.realpath, ...unresolvedSegments),
        nearest_existing_ancestor: nearest.realpath,
        ancestor_identity: nearest.identity,
        unresolved_segments: unresolvedSegments,
        state: "UNSAFE",
        reason: "Controlled setup requires one absent leaf below an existing trusted parent.",
      });
    }
    return finalize({
      requested_path: requestedPath,
      canonical_target: path.join(nearest.realpath, ...unresolvedSegments),
      nearest_existing_ancestor: nearest.realpath,
      ancestor_identity: nearest.identity,
      unresolved_segments: unresolvedSegments,
      state: "ABSENT_LEAF",
      reason: "The bounded target leaf does not exist yet.",
    });
  }

  const stat = fs.lstatSync(requestedPath);
  if (stat.isSymbolicLink()) {
    return finalize({
      requested_path: requestedPath,
      canonical_target: requestedPath,
      nearest_existing_ancestor: nearest.realpath,
      ancestor_identity: nearest.identity,
      unresolved_segments: [],
      state: "UNSAFE",
      reason: "The target itself is a symbolic link.",
    });
  }
  if (!stat.isDirectory()) {
    return finalize({
      requested_path: requestedPath,
      canonical_target: fs.realpathSync(requestedPath),
      nearest_existing_ancestor: nearest.realpath,
      ancestor_identity: nearest.identity,
      unresolved_segments: [],
      state: "NON_DIRECTORY",
      reason: "The target exists but is not a directory.",
    });
  }

  const entries = fs.readdirSync(requestedPath).sort();
  return finalize({
    requested_path: requestedPath,
    canonical_target: fs.realpathSync(requestedPath),
    nearest_existing_ancestor: nearest.realpath,
    ancestor_identity: nearest.identity,
    unresolved_segments: [],
    state: entries.length === 0 ? "EMPTY_DIRECTORY" : "NONEMPTY_DIRECTORY",
    reason: entries.length === 0 ? "The target directory exists and is empty." : "The target directory exists and contains project data.",
  });
}

export function recheckTargetTopology(snapshot) {
  const current = inspectTargetTopology(snapshot?.requested_path || snapshot?.canonical_target || ".");
  const expectedBase = withoutDigest(snapshot || {});
  const currentBase = withoutDigest(current);
  const errors = [];
  if (snapshot?.topology_digest !== evidenceDigest(expectedBase, [])) errors.push("recorded target topology digest is not canonical");
  if (current.topology_digest !== snapshot?.topology_digest) errors.push("target topology changed after preflight");
  if (JSON.stringify(currentBase.ancestor_identity) !== JSON.stringify(expectedBase.ancestor_identity)) {
    errors.push("nearest existing ancestor identity changed after preflight");
  }
  return { ok: errors.length === 0, errors, current };
}

export function assertTargetTopologyState(topology, allowedStates, label = "target") {
  const allowed = new Set(allowedStates || []);
  if (!TARGET_TOPOLOGY_STATES.includes(topology?.state)) throw new Error(`${label} has an unknown topology state`);
  if (!allowed.has(topology.state)) throw new Error(`${label} topology ${topology.state} is not allowed`);
  return topology;
}

function nearestExistingAncestor(target) {
  let current = target;
  while (!fs.existsSync(current)) {
    const parent = path.dirname(current);
    if (parent === current) return null;
    current = parent;
  }
  const realpath = fs.realpathSync(current);
  const realStat = fs.statSync(realpath);
  if (!realStat.isDirectory() && current !== target) return null;
  return {
    path: current,
    realpath,
    identity: {
      device: String(realStat.dev),
      inode: String(realStat.ino),
      mode: realStat.mode,
    },
  };
}

function finalize(value) {
  const normalized = { schema_version: "1.109.0", ...value };
  return { ...normalized, topology_digest: evidenceDigest(normalized, []) };
}

function withoutDigest(value) {
  const { topology_digest: _digest, ...rest } = value || {};
  return rest;
}

function lstatOrNull(value) {
  try { return fs.lstatSync(value); } catch (error) {
    if (error?.code === "ENOENT" || error?.code === "ENOTDIR") return null;
    throw error;
  }
}
