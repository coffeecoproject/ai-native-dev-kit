import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export const ADAPTER_CONTRACT_VERSION = "1.102.0";

export const ADAPTER_KINDS = new Set([
  "COMMAND_ONLY",
  "LOCAL_PROCESS",
  "DOCKER_CONTAINER",
  "KUBERNETES_WORKLOAD",
  "SERVERLESS_DEPLOYMENT",
  "STATIC_BUILD",
  "PROJECT_NATIVE",
  "UNRESOLVED",
]);

const CONTRACTS = {
  COMMAND_ONLY: contract({
    trust: ["SOURCE_OUTPUT_BINDING"],
    identity: [],
    probes: ["SOURCE_IDENTITY", "WORKTREE_STATE"],
    resources: [],
  }),
  LOCAL_PROCESS: contract({
    identity: ["pid", "argv", "cwd"],
    probes: ["PROCESS_IDENTITY", "PORT_OWNERSHIP", "WORKING_DIRECTORY"],
    resources: ["PROCESS", "PORT"],
  }),
  DOCKER_CONTAINER: contract({
    identity: ["container_id", "image_digest"],
    probes: ["CONTAINER_IDENTITY", "IMAGE_IDENTITY", "CONTAINER_NETWORK"],
    resources: ["CONTAINER", "NETWORK", "VOLUME", "PORT"],
  }),
  KUBERNETES_WORKLOAD: contract({
    identity: ["workload_uid", "pod_uid", "namespace", "image_digest"],
    probes: ["WORKLOAD_IDENTITY", "POD_IDENTITY", "NAMESPACE_IDENTITY", "IMAGE_IDENTITY"],
    resources: ["POD", "DEPLOYMENT", "JOB", "NAMESPACE", "SERVICE"],
  }),
  SERVERLESS_DEPLOYMENT: contract({
    identity: ["deployment_id", "version_id", "target_environment"],
    probes: ["DEPLOYMENT_IDENTITY", "VERSION_IDENTITY", "TARGET_ENVIRONMENT"],
    resources: ["DEPLOYMENT", "FUNCTION", "PREVIEW_ENVIRONMENT"],
  }),
  STATIC_BUILD: contract({
    identity: ["build_digest", "serve_origin"],
    probes: ["BUILD_IDENTITY", "SERVE_ORIGIN"],
    resources: ["STATIC_BUILD", "PREVIEW_SERVER", "PORT"],
  }),
  PROJECT_NATIVE: contract({
    identity: ["build_id", "target_id", "artifact_digest"],
    probes: ["BUILD_IDENTITY", "TARGET_IDENTITY", "TOOLCHAIN_IDENTITY"],
    resources: ["BUILD", "SIMULATOR", "DEVICE", "PLATFORM_SANDBOX"],
  }),
  UNRESOLVED: contract({
    trust: [],
    identity: [],
    probes: [],
    resources: [],
    lifecycle: "BLOCKED",
  }),
};

export function selectRuntimeAdapter(projectRoot, taskTier) {
  const tier = String(taskTier || "").trim().toUpperCase();
  if (tier === "LOW") {
    return selection("COMMAND_ONLY", [], [], "OBSERVED", "LOW work uses source and output binding without a managed runtime.");
  }
  if (tier === "POSSIBLE_HIGH") {
    return blockedSelection("Potentially high-impact work must be classified before adapter selection.");
  }

  const discovered = discoverRuntimeAdapters(projectRoot);
  if (discovered.conflict) return blockedSelection(discovered.conflict, discovered.candidates);

  const explicit = discovered.candidates.filter((item) => item.explicit);
  if (explicit.length === 1) {
    const chosen = explicit[0];
    return selection(chosen.adapter_kind, chosen.sources, discovered.candidates, "DECLARED", `Project-owned adapter declaration selects ${chosen.adapter_kind}.`);
  }

  const chosen = discovered.candidates.sort(compareCandidates)[0];
  if (!chosen) {
    return blockedSelection("No supported project runtime signal was found. A project adapter must resolve this without asking the user to choose technical tooling.");
  }
  return selection(chosen.adapter_kind, chosen.sources, discovered.candidates, "OBSERVED", chosen.reason);
}

export function discoverRuntimeAdapters(projectRoot) {
  const root = path.resolve(projectRoot);
  const candidates = [];
  const declarations = explicitDeclarations(root);
  const declaredKinds = [...new Set(declarations.map((item) => item.adapter_kind))];
  if (declaredKinds.length > 1) {
    return {
      conflict: `Conflicting project-owned runtime adapter declarations: ${declaredKinds.join(", ")}.`,
      candidates: declarations,
    };
  }
  if (declarations.length) candidates.push(mergeCandidateSources(declarations[0].adapter_kind, declarations, true, "Project-owned runtime adapter declaration is present."));

  addCandidate(candidates, root, "KUBERNETES_WORKLOAD", kubernetesSignals(root), "Project metadata includes Kubernetes or Helm runtime assets.");
  addCandidate(candidates, root, "DOCKER_CONTAINER", fixedSignals(root, ["docker-compose.yml", "docker-compose.yaml", "compose.yml", "compose.yaml", "Dockerfile"]), "Project-owned Docker or Compose configuration is available.");
  addCandidate(candidates, root, "SERVERLESS_DEPLOYMENT", fixedSignals(root, ["serverless.yml", "serverless.yaml", "vercel.json", "netlify.toml", "wrangler.toml"]), "Project metadata indicates a serverless or hosted deployment runtime.");
  addCandidate(candidates, root, "LOCAL_PROCESS", localProcessSignals(root), "Project package scripts expose a local runtime entry.");
  addCandidate(candidates, root, "STATIC_BUILD", fixedSignals(root, ["index.html", "dist/index.html", "build/index.html"]), "Project has a static frontend build surface.");
  addCandidate(candidates, root, "PROJECT_NATIVE", nativeSignals(root), "Project uses a native platform runtime controlled by project tooling.");

  return { conflict: "", candidates: mergeDuplicateCandidates(candidates) };
}

export function adapterSelectionSemanticErrors(adapterSelection, runtimeTrustLevel, schemaVersion = "1.102.0") {
  if (schemaVersion !== "1.102.0") return [];
  const errors = [];
  const selectionValue = adapterSelection || {};
  const kind = selectionValue.adapter_kind;
  if (!ADAPTER_KINDS.has(kind)) return ["adapter_kind is not supported by the 1.102 adapter registry"];
  if (selectionValue.contract_version !== ADAPTER_CONTRACT_VERSION) errors.push(`adapter contract_version must be ${ADAPTER_CONTRACT_VERSION}`);
  const expected = contractView(kind);
  for (const [field, value] of Object.entries(expected)) {
    if (JSON.stringify(selectionValue[field]) !== JSON.stringify(value)) errors.push(`adapter ${field} must match the ${kind} contract`);
  }
  const expectedDigest = adapterContractDigest(kind);
  if (selectionValue.contract_digest !== expectedDigest) errors.push(`adapter contract_digest must be ${expectedDigest}`);
  if (!Array.isArray(selectionValue.discovery_sources)) errors.push("adapter discovery_sources must be recorded");
  if (!["OBSERVED", "DECLARED", "NOT_REQUIRED", "UNRESOLVED"].includes(selectionValue.discovery_confidence)) errors.push("adapter discovery_confidence is invalid");
  if (selectionValue.status === "SELECTED" && !["COMMAND_ONLY"].includes(kind) && (selectionValue.discovery_sources || []).length === 0) {
    errors.push(`${kind} requires current project discovery evidence`);
  }
  if (selectionValue.status === "SELECTED" && !(selectionValue.supported_trust_levels || []).includes(runtimeTrustLevel)) {
    errors.push(`${kind} does not support ${runtimeTrustLevel}`);
  }
  if (selectionValue.lifecycle_mode !== "OBSERVE_AND_PLAN_ONLY" && selectionValue.status === "SELECTED") {
    errors.push("1.102 selected adapters must remain OBSERVE_AND_PLAN_ONLY");
  }
  if (selectionValue.starts_or_stops_runtime !== "No" || selectionValue.creates_or_deletes_resources !== "No") {
    errors.push("1.102 adapter selection cannot start runtimes or create/delete resources");
  }
  return errors;
}

export function serviceInstanceIdentityErrors(instance, adapterSelection, schemaVersion = "1.102.0") {
  if (schemaVersion !== "1.102.0" || instance?.identity_status !== "VERIFIED") return [];
  const errors = [];
  const expectedKind = adapterSelection?.adapter_kind;
  if (instance?.adapter_kind !== expectedKind) errors.push(`service ${instance?.id || "instance"} adapter_kind must match ${expectedKind}`);
  const names = new Set((instance?.identity_fields || []).map((item) => item.name));
  for (const field of adapterSelection?.required_identity_fields || []) {
    if (!names.has(field)) errors.push(`service ${instance?.id || "instance"} requires adapter identity field ${field}`);
  }
  return errors;
}

export function adapterContractDigest(adapterKind) {
  return sha256(JSON.stringify(canonicalize({
    contract_version: ADAPTER_CONTRACT_VERSION,
    adapter_kind: adapterKind,
    ...contractView(adapterKind),
  })));
}

function selection(adapterKind, sources, candidates, confidence, reason) {
  const view = contractView(adapterKind);
  return {
    status: "SELECTED",
    adapter_kind: adapterKind,
    selected_by: "CODEX",
    reason,
    user_selection_required: "No",
    contract_version: ADAPTER_CONTRACT_VERSION,
    contract_digest: adapterContractDigest(adapterKind),
    discovery_confidence: adapterKind === "COMMAND_ONLY" ? "NOT_REQUIRED" : confidence,
    discovery_sources: sources,
    alternative_adapters: [...new Set(candidates.map((item) => item.adapter_kind).filter((kind) => kind !== adapterKind))].sort(),
    ...view,
    starts_or_stops_runtime: "No",
    creates_or_deletes_resources: "No",
  };
}

function blockedSelection(reason, candidates = []) {
  const view = contractView("UNRESOLVED");
  return {
    status: "BLOCKED",
    adapter_kind: "UNRESOLVED",
    selected_by: "CODEX",
    reason,
    user_selection_required: "No",
    contract_version: ADAPTER_CONTRACT_VERSION,
    contract_digest: adapterContractDigest("UNRESOLVED"),
    discovery_confidence: "UNRESOLVED",
    discovery_sources: [],
    alternative_adapters: [...new Set(candidates.map((item) => item.adapter_kind))].sort(),
    ...view,
    starts_or_stops_runtime: "No",
    creates_or_deletes_resources: "No",
  };
}

function contract({ trust = ["TARGETED_SERVICE_IDENTITY", "ISOLATED_RUNTIME"], identity, probes, resources, lifecycle = "OBSERVE_AND_PLAN_ONLY" }) {
  return {
    supported_trust_levels: trust,
    required_identity_fields: identity,
    adapter_preflight_probes: probes,
    managed_resource_types: resources,
    lifecycle_mode: lifecycle,
  };
}

function contractView(kind) {
  return structuredClone(CONTRACTS[kind] || CONTRACTS.UNRESOLVED);
}

function explicitDeclarations(root) {
  const declarations = [];
  const packageSource = readJsonSignal(root, "package.json");
  const packageKind = packageSource?.value?.intentos?.verificationRuntime?.adapter;
  if (ADAPTER_KINDS.has(packageKind) && packageKind !== "UNRESOLVED") {
    declarations.push(candidate(packageKind, [signalFromJson(packageSource, "PACKAGE_JSON_DECLARATION")], true, "Package metadata declares the adapter."));
  }
  const fileSource = readJsonSignal(root, ".intentos/runtime-adapter.json");
  const fileKind = fileSource?.value?.adapter_kind;
  if (ADAPTER_KINDS.has(fileKind) && fileKind !== "UNRESOLVED") {
    declarations.push(candidate(fileKind, [signalFromJson(fileSource, "INTENTOS_ADAPTER_DECLARATION")], true, "Project adapter metadata declares the adapter."));
  }
  return declarations;
}

function addCandidate(candidates, root, adapterKind, signals, reason) {
  if (signals.length) candidates.push(candidate(adapterKind, signals, false, reason));
}

function candidate(adapterKind, sources, explicit, reason) {
  return { adapter_kind: adapterKind, sources, explicit, reason };
}

function mergeCandidateSources(adapterKind, entries, explicit, reason) {
  return candidate(adapterKind, entries.flatMap((entry) => entry.sources), explicit, reason);
}

function mergeDuplicateCandidates(candidates) {
  const values = new Map();
  for (const item of candidates) {
    const current = values.get(item.adapter_kind);
    if (!current) values.set(item.adapter_kind, item);
    else values.set(item.adapter_kind, candidate(item.adapter_kind, uniqueSources([...current.sources, ...item.sources]), current.explicit || item.explicit, current.explicit ? current.reason : item.reason));
  }
  return [...values.values()];
}

function compareCandidates(left, right) {
  if (left.explicit !== right.explicit) return left.explicit ? -1 : 1;
  const rank = {
    KUBERNETES_WORKLOAD: 10,
    DOCKER_CONTAINER: 20,
    SERVERLESS_DEPLOYMENT: 30,
    LOCAL_PROCESS: 40,
    STATIC_BUILD: 50,
    PROJECT_NATIVE: 60,
  };
  return (rank[left.adapter_kind] || 999) - (rank[right.adapter_kind] || 999);
}

function fixedSignals(root, relatives) {
  return relatives.map((relative) => fileSignal(root, relative, "PROJECT_FILE")).filter(Boolean);
}

function localProcessSignals(root) {
  const source = readJsonSignal(root, "package.json");
  const scripts = source?.value?.scripts || {};
  const runtimeNames = ["dev", "start", "serve", "preview", "dev:web", "local:up"];
  if (!runtimeNames.some((name) => typeof scripts[name] === "string" && scripts[name].trim())) return [];
  return [signalFromJson(source, "PACKAGE_RUNTIME_SCRIPT")];
}

function kubernetesSignals(root) {
  return boundedFiles(root, ["k8s", "kubernetes", "helm", "charts"], 4, (relative) => /\.(ya?ml|json)$/i.test(relative))
    .map((relative) => fileSignal(root, relative, "KUBERNETES_MANIFEST"))
    .filter(Boolean);
}

function nativeSignals(root) {
  const fixed = fixedSignals(root, ["Package.swift", "settings.gradle", "settings.gradle.kts", "gradlew", "project.config.json"]);
  const nested = boundedFiles(root, ["."], 4, (relative) => /\.xcodeproj\/project\.pbxproj$/.test(relative))
    .map((relative) => fileSignal(root, relative, "NATIVE_PROJECT_FILE"))
    .filter(Boolean);
  return uniqueSources([...fixed, ...nested]);
}

function readJsonSignal(root, relative) {
  const signal = fileSignal(root, relative, "PROJECT_JSON");
  if (!signal) return null;
  try {
    return { signal, value: JSON.parse(fs.readFileSync(path.join(root, relative), "utf8")) };
  } catch {
    return null;
  }
}

function signalFromJson(source, kind) {
  return { ...source.signal, signal: kind };
}

function fileSignal(root, relative, signalKind) {
  const normalized = relative.split(path.sep).join("/").replace(/^\.\//, "");
  const file = path.resolve(root, normalized);
  if (!inside(root, file) || !fs.existsSync(file)) return null;
  const stat = fs.lstatSync(file);
  if (!stat.isFile() || stat.isSymbolicLink() || pathContainsSymlink(root, file)) return null;
  return {
    signal: signalKind,
    ref: `file:${normalized}`,
    digest: fileDigest(file),
  };
}

function boundedFiles(root, startDirectories, maxDepth, predicate) {
  const results = [];
  for (const start of startDirectories) {
    const absolute = path.resolve(root, start);
    if (!inside(root, absolute) || !fs.existsSync(absolute)) continue;
    walk(absolute, start === "." ? 0 : 1);
  }
  return [...new Set(results)].sort().slice(0, 64);

  function walk(directory, depth) {
    if (depth > maxDepth) return;
    const stat = fs.lstatSync(directory);
    if (!stat.isDirectory() || stat.isSymbolicLink()) return;
    for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if ([".git", "node_modules", ".intentos", "dist", "build"].includes(entry.name)) continue;
      const file = path.join(directory, entry.name);
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) walk(file, depth + 1);
      else if (entry.isFile()) {
        const relative = path.relative(root, file).split(path.sep).join("/");
        if (predicate(relative)) results.push(relative);
      }
      if (results.length >= 64) return;
    }
  }
}

function pathContainsSymlink(root, file) {
  let current = path.dirname(file);
  const boundary = path.resolve(root);
  while (inside(boundary, current) && current !== boundary) {
    if (fs.lstatSync(current).isSymbolicLink()) return true;
    current = path.dirname(current);
  }
  return false;
}

function inside(root, candidate) {
  const relative = path.relative(path.resolve(root), path.resolve(candidate));
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function uniqueSources(values) {
  const seen = new Set();
  return values.filter((item) => {
    const key = `${item.ref}:${item.digest}:${item.signal}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function fileDigest(file) {
  return sha256(fs.readFileSync(file));
}

function sha256(value) {
  return `sha256:${crypto.createHash("sha256").update(value).digest("hex")}`;
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
}
