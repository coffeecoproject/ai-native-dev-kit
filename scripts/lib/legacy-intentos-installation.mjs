import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const moduleRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const legacyAgentHeading = "# AI Native Workflow Governance Appendix";

const legacyCompatibility = Object.freeze({
  "1.8.1": Object.freeze({
    sourceRevision: "bb83080e43596ee8846fb2f1ff90092ef3a8111f",
    sourceManifestPath: "dev-kit-manifest.json",
    installedManifestPath: ".ai-native/dev-kit-manifest.json",
    versionRecordPath: ".ai-native/version.json",
    agentMigrationReportPath: ".ai-native/migration-reports/agents-governance.md",
    generatedAgentSourcePath: "platforms/codex/AGENTS.template.md",
    agentSectionDigests: Object.freeze({
      "Mission": ["sha256:535cf6ba077e35813f9ad290f09f7bc5c348c99ba4fe5088fc189b258af8d1bd"],
      "Core Rules": ["sha256:eca3e17a92f9c9c2ada448ba02a2d10cdcad430b76cc5445e38263a7ebd949b5"],
      "Bootstrap Entry": ["sha256:3f5c79c9c3489dc548772e10df4b6ab0c98467842ea2f5af2f53755f065a27ac"],
      "Project Onboarding": ["sha256:35e22775c2189647175f86f198f5516ce02fe78e2b00a8400687622547a4a623"],
      "Engineering Baseline": ["sha256:35fc27a6bb9611591b4958898070eadb032888e3d06f9783bda1776400f498b8"],
      "Environment Baseline": ["sha256:3433d73d52950b24acbee366acfdc5de211b33d0b09053fe61c857ed1042042d"],
      "Platform Baseline": ["sha256:c16452e5eaa00194eba9cc9b6cd5503be25eacceb0b2941ee0026fd9e3778506"],
      "Industrial Baseline": ["sha256:5f5eb1d19d26b0e276c712f53cb6fca6c31c4f33579d8c0e1d4423ee1ef86095"],
      "Workflow Artifact Generation": [
        "sha256:9555c3c56f5bf093ccf9d0a5d0f0f9e40af0a084f60a779211ed33e1d0f5215f",
        "sha256:47b6f5d6e0214f72ec039e6dfb705721b40a6cba7639acbf05be4079e3f3d89f",
      ],
      "Review Loop": ["sha256:3dbb910891bdcab7b90ddf40daa136d1ad9bd2cd703c0c0c16ae5e00e77dcbfa"],
      "Goal Mode": ["sha256:56f0b0bdce3df08416ad4a3f8f61f3cc24d9b3dd18b3a37db653a62ee757531d"],
      "Subagent Orchestration": ["sha256:a787d58885e06739e415933eabca7f804baf12f0398a04e082dd35a64005dce1"],
      "Safe Launch": ["sha256:97b7c132dc7a28e5094c2d8d073360aeb96b7fa22e44f0b061729ee0e855dc6a"],
      "Conversation Drift": ["sha256:58e514d9f5483eda3c3bb19ed797b92ea3a38e304d91ddb5534f785dc6e4201e"],
      "Bounded Next-Step": ["sha256:66ec12b2aa4af3d36efc7b3d4828702ca1106f4c350c2187364b84df99046e45"],
      "Output Experience": ["sha256:ce994bf5b6839b68378d6e08bc2c281c37775eb1cc4bc4bf40596445cf4927fc"],
      "Task Execution Rules": ["sha256:3eb632bb36358f16926caa778ceb711713d458e0eee2a3a69f8f65da85939e51"],
      "High-risk Boundaries": ["sha256:f0c2e5c13f4d196cd04a549788c72114d724159945c688b129871032eea50659"],
      "Skill Governance": ["sha256:e06c97a7ae997e1a76551fe4a5b59ce52f21880bee942875e72280939ac1cffc"],
      "Automation Governance": ["sha256:5493f1ed8377d904e2c0314cb15a2e4c7112e0766c33032d70a8d7f0e63d8b08"],
      "Final Report": [
        "sha256:c34ef0332e7a9eb3d0b29691a9bada103273a2f49f6df1f986a5e8d1384dc9fd",
        "sha256:4ac27e74eb2c2f0d7298f41c6ced282e61292d81df5fb0316288e717da916703",
      ],
      "Product Baseline": ["sha256:49993cc17fdbb00f21887936f5dd96861a903fb8b8cd05bfeb6da522171c0dab"],
      "Claim Control": ["sha256:4cf0eacb38bdbab2706da720c0e7b7945d3b42b035f6a3d12b71ea7b43974c3b"],
    }),
  }),
});

const historicalCache = new Map();
const historicalFileCache = new Map();

export function inspectLegacyIntentOSInstallation(projectRoot, sourceRoot = moduleRoot) {
  const root = safeDirectory(projectRoot);
  if (!root) return legacyState("NOT_PRESENT", ["project root is not a safe directory"]);
  const versionFile = safeRegularFile(root, ".ai-native/version.json");
  const manifestFile = safeRegularFile(root, ".ai-native/dev-kit-manifest.json");
  if (!versionFile && !manifestFile) return legacyState("NOT_PRESENT", []);
  if (!versionFile || !manifestFile) {
    return legacyState("INVALID", ["legacy installation requires regular version and manifest files"]);
  }

  const version = readJson(versionFile);
  const installedManifest = readJson(manifestFile);
  const legacyVersion = String(version?.devKitVersion || "");
  const compatibility = legacyCompatibility[legacyVersion];
  if (!compatibility) return legacyState("UNSUPPORTED_VERSION", [`unsupported legacy IntentOS version: ${legacyVersion || "missing"}`]);
  if (installedManifest?.devKitVersion !== legacyVersion || installedManifest?.mode !== "authoritative") {
    return legacyState("INVALID", ["legacy installed manifest identity does not match its version record"]);
  }
  if (!Array.isArray(version?.workflowAssets) || version.workflowAssets.length === 0) {
    return legacyState("INVALID", ["legacy version record has no workflowAssets ownership declaration"]);
  }

  const historical = loadHistoricalCompatibility(sourceRoot, compatibility);
  if (historical.state !== "READY") return legacyState("COMPATIBILITY_SOURCE_UNAVAILABLE", historical.errors);
  const installedManifestDigest = digestBuffer(fs.readFileSync(manifestFile));
  if (installedManifestDigest !== historical.manifestDigest) {
    return legacyState("DRIFTED", ["legacy installed manifest differs from the supported historical release"]);
  }

  const base = {
    state: "VERIFIED",
    projectRoot: root,
    legacyVersion,
    sourceRevision: compatibility.sourceRevision,
    versionRecordPath: compatibility.versionRecordPath,
    versionRecordDigest: digestBuffer(fs.readFileSync(versionFile)),
    installedManifestPath: compatibility.installedManifestPath,
    installedManifestDigest,
    workflowAssets: [...version.workflowAssets],
    historical,
  };
  return { ...base, installationDigest: digestObject(publicInstallation(base)) };
}

export function resolveLegacyManagedAssetOwnership(projectRoot, sourceRoot, targetPath, currentDigest = null, installation = null) {
  const normalizedTarget = normalizeRelativePath(targetPath);
  const resolved = installation || inspectLegacyIntentOSInstallation(projectRoot, sourceRoot);
  if (resolved.state !== "VERIFIED") return { state: "UNPROVEN_PROJECT_OWNED" };
  if (!normalizedTarget || normalizedTarget === "AGENTS.md" || !declaresAsset(resolved.workflowAssets, normalizedTarget)) {
    return { state: "UNPROVEN_PROJECT_OWNED" };
  }
  const currentFile = safeRegularFile(resolved.projectRoot, normalizedTarget);
  if (!currentFile) return { state: "UNPROVEN_PROJECT_OWNED" };
  const observedDigest = digestBuffer(fs.readFileSync(currentFile));
  if (currentDigest && observedDigest !== currentDigest) return { state: "UNPROVEN_PROJECT_OWNED" };
  const mapping = distributionSourceForTarget(resolved.historical.distribution, normalizedTarget);
  if (!mapping) return { state: "UNPROVEN_PROJECT_OWNED" };
  const historicalDigest = historicalSourceDigest(sourceRoot, resolved.sourceRevision, mapping.source);
  if (!historicalDigest || historicalDigest !== observedDigest) return { state: "UNPROVEN_PROJECT_OWNED" };
  return {
    state: "VERIFIED_LEGACY_INTENTOS_MANAGED",
    evidence_ref: `${resolved.versionRecordPath}+${resolved.installedManifestPath}@${resolved.sourceRevision}`,
    managed_digest: observedDigest,
    legacy_version: resolved.legacyVersion,
    source_revision: resolved.sourceRevision,
    source_path: mapping.source,
    installation_digest: resolved.installationDigest,
  };
}

export function resolveLegacyAgentReconciliation(projectRoot, sourceRoot = moduleRoot, installation = null) {
  const resolved = installation || inspectLegacyIntentOSInstallation(projectRoot, sourceRoot);
  if (resolved.state === "NOT_PRESENT") return { state: "NOT_APPLICABLE", errors: [] };
  if (resolved.state !== "VERIFIED") return { state: "BLOCKED", errors: resolved.errors || [resolved.state] };
  if (!declaresAsset(resolved.workflowAssets, "AGENTS.md")) {
    return { state: "BLOCKED", errors: ["legacy version record does not declare AGENTS.md"] };
  }
  const agentsFile = safeRegularFile(resolved.projectRoot, "AGENTS.md");
  if (!agentsFile) return { state: "BLOCKED", errors: ["legacy AGENTS.md must be a regular file"] };

  const contentBuffer = fs.readFileSync(agentsFile);
  const content = contentBuffer.toString("utf8");
  const generatedAgent = resolveExactLegacyGeneratedAgent(resolved, sourceRoot, contentBuffer);
  if (generatedAgent) return generatedAgent;

  const reportFile = safeRegularFile(resolved.projectRoot, ".ai-native/migration-reports/agents-governance.md");
  if (!reportFile) {
    return { state: "BLOCKED", errors: ["legacy appended AGENTS.md governance requires its applied migration report"] };
  }
  const report = fs.readFileSync(reportFile, "utf8");
  if (!/^Status:\s*APPLIED\s*$/m.test(report)
    || !new RegExp(`^Dev kit version:\\s*${escapeRegex(resolved.legacyVersion)}\\s*$`, "m").test(report)) {
    return { state: "BLOCKED", errors: ["legacy AGENTS.md migration report is not an applied record for the installed version"] };
  }

  const marker = new RegExp(`^${escapeRegex(legacyAgentHeading)}\\s*$`, "m").exec(content);
  if (!marker || marker.index <= 0) return { state: "BLOCKED", errors: ["legacy AGENTS.md has no separable generated appendix suffix"] };
  const projectPrefix = content.slice(0, marker.index);
  const legacySuffix = content.slice(marker.index);
  const validation = validateLegacyAgentSuffix(legacySuffix, resolved.historical.compatibility.agentSectionDigests);
  if (!validation.ok) return { state: "BLOCKED", errors: validation.errors };

  const base = {
    state: "VERIFIED_LEGACY_AGENT_SUFFIX",
    sourcePath: "AGENTS.md",
    sourceDigest: digestBuffer(Buffer.from(content)),
    sourceBytes: Buffer.byteLength(content),
    projectPrefix,
    projectPrefixDigest: digestBuffer(Buffer.from(projectPrefix)),
    projectPrefixBytes: Buffer.byteLength(projectPrefix),
    legacySuffixDigest: digestBuffer(Buffer.from(legacySuffix)),
    legacySuffixBytes: Buffer.byteLength(legacySuffix),
    legacyVersion: resolved.legacyVersion,
    sourceRevision: resolved.sourceRevision,
    installationDigest: resolved.installationDigest,
    migrationReportDigest: digestBuffer(fs.readFileSync(reportFile)),
    sections: validation.sections,
  };
  return { ...base, reconciliationDigest: digestObject(publicAgentReconciliation(base)) };
}

function resolveExactLegacyGeneratedAgent(installation, sourceRoot, content) {
  const generatedAgentSourcePath = installation.historical.compatibility.generatedAgentSourcePath;
  const historicalContent = historicalFile(sourceRoot, installation.sourceRevision, generatedAgentSourcePath);
  if (!historicalContent || !historicalContent.equals(content)) return null;
  const base = {
    state: "VERIFIED_LEGACY_GENERATED_AGENT",
    sourcePath: "AGENTS.md",
    sourceDigest: digestBuffer(content),
    sourceBytes: content.length,
    generatedAgentSourcePath,
    generatedAgentDigest: digestBuffer(historicalContent),
    generatedAgentBytes: historicalContent.length,
    legacyVersion: installation.legacyVersion,
    sourceRevision: installation.sourceRevision,
    installationDigest: installation.installationDigest,
  };
  return { ...base, reconciliationDigest: digestObject(publicGeneratedAgentReconciliation(base)) };
}

function validateLegacyAgentSuffix(suffix, knownSections) {
  const headings = [...suffix.matchAll(/^(#{1,2}) (.+)$/gm)];
  const errors = [];
  const sections = [];
  const seen = new Set();
  if (headings.length === 0 || headings[0][1] !== "#" || headings[0][2] !== legacyAgentHeading.slice(2)) {
    return { ok: false, errors: ["legacy appendix suffix does not begin with the expected generated heading"], sections: [] };
  }
  for (let index = 0; index < headings.length; index += 1) {
    const heading = headings[index];
    const end = headings[index + 1]?.index ?? suffix.length;
    const block = suffix.slice(heading.index, end).trim();
    if (heading[1] === "#") {
      if (heading[2] !== legacyAgentHeading.slice(2)) errors.push(`unexpected top-level heading in legacy appendix: ${heading[2]}`);
      const bodyWithoutHeading = block.slice(heading[0].length).trim();
      if (bodyWithoutHeading) errors.push("legacy appendix contains unsectioned content");
      continue;
    }
    const name = heading[2];
    const digest = digestBuffer(Buffer.from(block));
    if (seen.has(name)) errors.push(`duplicate legacy appendix section: ${name}`);
    seen.add(name);
    if (!knownSections[name]?.includes(digest)) errors.push(`unknown or drifted legacy appendix section: ${name}`);
    sections.push({ name, digest });
  }
  if (sections.length === 0) errors.push("legacy appendix contains no verified sections");
  return { ok: errors.length === 0, errors, sections };
}

function loadHistoricalCompatibility(sourceRoot, compatibility) {
  const root = safeDirectory(sourceRoot);
  if (!root) return { state: "UNAVAILABLE", errors: ["IntentOS source root is unavailable"] };
  const key = `${root}:${compatibility.sourceRevision}`;
  if (historicalCache.has(key)) return historicalCache.get(key);
  const manifestBuffer = historicalFile(root, compatibility.sourceRevision, compatibility.sourceManifestPath);
  if (!manifestBuffer) {
    const missing = { state: "UNAVAILABLE", errors: [`historical compatibility revision is unavailable: ${compatibility.sourceRevision}`] };
    historicalCache.set(key, missing);
    return missing;
  }
  let manifest;
  try { manifest = JSON.parse(manifestBuffer.toString("utf8")); } catch {
    const invalid = { state: "UNAVAILABLE", errors: ["historical compatibility manifest is invalid"] };
    historicalCache.set(key, invalid);
    return invalid;
  }
  if (manifest?.devKitVersion !== "1.8.1" || manifest?.mode !== "authoritative") {
    const invalid = { state: "UNAVAILABLE", errors: ["historical compatibility manifest identity is invalid"] };
    historicalCache.set(key, invalid);
    return invalid;
  }
  const ready = {
    state: "READY",
    manifest,
    manifestDigest: digestBuffer(manifestBuffer),
    distribution: sourceDistributionMappings(manifest),
    compatibility,
    errors: [],
  };
  historicalCache.set(key, ready);
  return ready;
}

function sourceDistributionMappings(manifest) {
  const files = (manifest.copyRules?.files || [])
    .map((item) => ({ source: normalizeRelativePath(item.source), target: normalizeRelativePath(item.target) }))
    .filter((item) => item.source && item.target);
  const directories = (manifest.copyRules?.directories || [])
    .map((item) => ({ source: normalizeRelativePath(item.source), target: normalizeRelativePath(item.target) }))
    .filter((item) => item.source && item.target)
    .sort((left, right) => right.target.length - left.target.length);
  return { files, directories };
}

function distributionSourceForTarget(distribution, target) {
  const exact = distribution.files.find((item) => item.target === target);
  if (exact) return exact;
  const directory = distribution.directories.find((item) => target.startsWith(`${item.target}/`));
  if (!directory) return null;
  const suffix = target.slice(directory.target.length + 1);
  const source = normalizeRelativePath(`${directory.source}/${suffix}`);
  return source ? { source, target } : null;
}

function historicalSourceDigest(sourceRoot, revision, sourcePath) {
  const content = historicalFile(sourceRoot, revision, sourcePath);
  return content ? digestBuffer(content) : null;
}

function historicalFile(sourceRoot, revision, sourcePath) {
  const key = `${sourceRoot}:${revision}:${sourcePath}`;
  if (historicalFileCache.has(key)) return historicalFileCache.get(key);
  const result = spawnSync("git", ["-C", sourceRoot, "show", `${revision}:${sourcePath}`], {
    encoding: null,
    maxBuffer: 32 * 1024 * 1024,
  });
  const content = result.status === 0 && Buffer.isBuffer(result.stdout) ? result.stdout : null;
  historicalFileCache.set(key, content);
  return content;
}

function declaresAsset(values, target) {
  return values.map(normalizeRelativePath).filter(Boolean)
    .some((managed) => target === managed || target.startsWith(`${managed}/`));
}

function publicInstallation(value) {
  return {
    state: value.state,
    legacy_version: value.legacyVersion,
    source_revision: value.sourceRevision,
    version_record_path: value.versionRecordPath,
    version_record_digest: value.versionRecordDigest,
    installed_manifest_path: value.installedManifestPath,
    installed_manifest_digest: value.installedManifestDigest,
  };
}

function publicAgentReconciliation(value) {
  return {
    state: value.state,
    source_path: value.sourcePath,
    source_digest: value.sourceDigest,
    source_bytes: value.sourceBytes,
    project_prefix_digest: value.projectPrefixDigest,
    project_prefix_bytes: value.projectPrefixBytes,
    legacy_suffix_digest: value.legacySuffixDigest,
    legacy_suffix_bytes: value.legacySuffixBytes,
    legacy_version: value.legacyVersion,
    source_revision: value.sourceRevision,
    installation_digest: value.installationDigest,
    migration_report_digest: value.migrationReportDigest,
    sections: value.sections,
  };
}

function publicGeneratedAgentReconciliation(value) {
  return {
    state: value.state,
    source_path: value.sourcePath,
    source_digest: value.sourceDigest,
    source_bytes: value.sourceBytes,
    generated_agent_source_path: value.generatedAgentSourcePath,
    generated_agent_digest: value.generatedAgentDigest,
    generated_agent_bytes: value.generatedAgentBytes,
    legacy_version: value.legacyVersion,
    source_revision: value.sourceRevision,
    installation_digest: value.installationDigest,
  };
}

function legacyState(state, errors) {
  return { state, errors };
}

function safeDirectory(value) {
  try {
    const candidate = path.resolve(String(value || ""));
    const stat = fs.lstatSync(candidate);
    return stat.isDirectory() && !stat.isSymbolicLink() ? fs.realpathSync(candidate) : null;
  } catch {
    return null;
  }
}

function safeRegularFile(root, relativePath) {
  try {
    const relative = normalizeRelativePath(relativePath);
    if (!relative) return null;
    const candidate = path.resolve(root, ...relative.split("/"));
    const lexical = path.relative(root, candidate);
    if (!lexical || lexical.startsWith("..") || path.isAbsolute(lexical)) return null;
    const stat = fs.lstatSync(candidate);
    if (!stat.isFile() || stat.isSymbolicLink()) return null;
    const real = fs.realpathSync(candidate);
    const resolved = path.relative(root, real);
    return !resolved || resolved.startsWith("..") || path.isAbsolute(resolved) ? null : real;
  } catch {
    return null;
  }
}

function normalizeRelativePath(value) {
  const normalized = String(value || "").replaceAll("\\", "/").replace(/^\.\//, "").replace(/\/$/, "");
  return normalized && !path.posix.isAbsolute(normalized) && !normalized.split("/").includes("..") ? normalized : "";
}

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return null; }
}

function digestBuffer(value) {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

function digestObject(value) {
  return digestBuffer(Buffer.from(JSON.stringify(value)));
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
