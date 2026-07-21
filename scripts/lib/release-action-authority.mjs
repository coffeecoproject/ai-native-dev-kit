import fs from "node:fs";
import path from "node:path";

const codexActionForStep = new Map([
  ["VERIFY", "VERIFY"],
  ["BUILD", "BUILD"],
  ["PACKAGE", "PACKAGE"],
  ["EVIDENCE_CAPTURE", "EVIDENCE_CAPTURE"],
  ["HANDOFF_PREPARATION", "HANDOFF_PREPARATION"],
  ["POST_LAUNCH_SMOKE", "POST_RELEASE_READ_ONLY_SMOKE"],
  ["ROLLBACK_READY", "HANDOFF_PREPARATION"],
]);

export const externallyOwnedReleaseSteps = new Set([
  "DEPLOY_OR_SUBMIT",
  "PROVIDER_DEPLOY",
  "PRODUCTION_DEPLOY",
  "STORE_SUBMISSION",
  "MINI_PROGRAM_RELEASE",
  "PRODUCTION_MIGRATION",
  "ROLLBACK_EXECUTION",
]);

const githubReleaseActionPattern = /^(?:softprops\/action-gh-release|ncipollo\/release-action|actions\/(?:create-release|upload-release-asset))@/i;
const providerDeployActionPattern = /^(?:amondnet\/vercel-action|firebaseextended\/action-hosting-deploy|cloudflare\/wrangler-action|google-github-actions\/deploy-(?:cloudrun|appengine|cloud-functions)|azure\/(?:webapps-deploy|functions-action|static-web-apps-deploy)|aws-actions\/(?:amazon-ecs-deploy-task-definition|aws-cloudformation-github-deploy)|actions\/deploy-pages|peaceiris\/actions-gh-pages|jamesives\/github-pages-deploy-action|appleboy\/(?:ssh-action|scp-action)|easingthemes\/ssh-deploy|maierj\/fastlane-action|apple-actions\/upload-testflight-build|wzieba\/firebase-distribution-github-action)@/i;
const ignoredActionPattern = /^(?:actions\/(?:checkout|setup-|upload-artifact|download-artifact|upload-pages-artifact)|github\/codeql-action\/upload-sarif)@/i;
const providerDeployCommandPattern = /\b(?:vercel\s+deploy|firebase\s+deploy|gcloud\s+(?:run\s+deploy|app\s+deploy|functions\s+deploy)|wrangler\s+deploy|kubectl\s+(?:apply|set\s+image)|helm\s+(?:install|upgrade)|aws\s+(?:cloudformation\s+deploy|s3\s+sync)|az\s+(?:webapp|functionapp|staticwebapp)\s+deploy)\b/i;
const registryPublishCommandPattern = /\bdocker\s+(?:push|buildx\s+build[^\n]*--push)\b|\b(?:npm|pnpm|yarn)\s+publish\b|\btwine\s+upload\b/i;
const externalSubmissionPattern = /\bapp\s*store\b|\btestflight\b|\bplay\s+console\b|\bmini[-_ ]?program\s+(?:upload|publish|release|submit)\b/i;
const shellOperators = new Set([";", "&&", "||", "|", "&", "<", ">", "<<", ">>", "(", ")", "\n"]);
const packageManagers = new Set(["npm", "pnpm", "yarn"]);
const yarnBuiltInCommands = new Set(["add", "cache", "config", "create", "dlx", "exec", "help", "import", "info", "init", "install", "link", "node", "npm", "pack", "plugin", "publish", "remove", "set", "stage", "unlink", "up", "upgrade", "version", "why", "workspace", "workspaces"]);
const releaseGraphLimits = Object.freeze({
  maxDepth: 24,
  maxNodes: 512,
  maxFileBytes: 256 * 1024,
  maxCommandBytes: 64 * 1024,
  maxProcessCallBytes: 32 * 1024,
});
const shellInterpreters = new Set(["bash", "dash", "ksh", "sh", "zsh"]);
const nodeInterpreters = new Set(["node", "nodejs"]);
const pythonInterpreters = new Set(["py", "python", "python3"]);
const localScriptExtensionPattern = /\.(?:bash|cjs|js|mjs|py|sh|zsh)$/i;
const releaseLikeRemoteActionPattern = /\/(?:[^@/]*(?:deploy|publish|submit|promote|ship|production|prod)[^@/]*)@/i;
const releaseLikeBuildTargetPattern = /^(?:deploy|publish|submit|promote|ship|release|production|prod)(?:[-_:].*)?$/i;

export function normalizedReleaseAction(value) {
  return String(value || "").trim().replaceAll("`", "").toUpperCase();
}

export function normalizeReleaseExecutionRequest(value) {
  if (value === undefined || value === null || (typeof value === "string" && !value.trim())) {
    return { ok: true, value: { request_type: "none" }, canonical: "", errors: [] };
  }

  let parsed = value;
  if (typeof value === "string") {
    const text = value.trim();
    if (/^[\[{]/.test(text)) {
      try {
        parsed = JSON.parse(text);
      } catch (error) {
        return { ok: false, value: null, canonical: "", errors: [`execution request JSON is invalid: ${error.message}`] };
      }
    } else {
      const tokenized = tokenizeShell(text, { rejectDynamicExpansion: true });
      if (!tokenized.ok) return { ok: false, value: null, canonical: "", errors: tokenized.errors };
      if (tokenized.tokens.some((token) => shellOperators.has(token))) {
        return { ok: false, value: null, canonical: "", errors: ["execution request must be one exact argv, not a compound shell command"] };
      }
      parsed = tokenized.tokens;
    }
  }

  if (Array.isArray(parsed)) return normalizeArgvRequest(parsed);
  if (!parsed || typeof parsed !== "object") {
    return { ok: false, value: null, canonical: "", errors: ["execution request must be an argv array or a structured provider request"] };
  }

  if (parsed.request_type === "none") {
    return { ok: true, value: { request_type: "none" }, canonical: "", errors: [] };
  }
  if (parsed.request_type === "argv") return normalizeArgvRequest(parsed.argv);
  const providerRequest = parsed.request_type === "provider_request" ? parsed.provider_request : parsed;
  if (!providerRequest || typeof providerRequest !== "object" || Array.isArray(providerRequest) || Object.keys(providerRequest).length === 0) {
    return { ok: false, value: null, canonical: "", errors: ["provider execution request must be a non-empty JSON object"] };
  }
  try {
    const normalized = normalizeJsonValue(providerRequest);
    return {
      ok: true,
      value: { request_type: "provider_request", provider_request: normalized },
      canonical: JSON.stringify(normalized),
      errors: [],
    };
  } catch (error) {
    return { ok: false, value: null, canonical: "", errors: [`provider execution request is not canonical JSON: ${error.message}`] };
  }
}

export function canonicalReleaseExecutionRequest(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ok: false, value: null, canonical: "", errors: ["persisted execution request must be an object"] };
  }
  if (value.request_type === "argv") return normalizeArgvRequest(value.argv);
  if (value.request_type === "provider_request") {
    return normalizeReleaseExecutionRequest({ request_type: "provider_request", provider_request: value.provider_request });
  }
  if (value.request_type === "none") return normalizeReleaseExecutionRequest(null);
  return { ok: false, value: null, canonical: "", errors: [`unsupported execution request type ${value.request_type || "<missing>"}`] };
}

export function releaseTopologyRequiredForExecution(mode, realReleaseExecutionAllowed = "No") {
  const normalizedMode = normalizedReleaseAction(mode);
  return normalizedMode === "ASSISTED_EXECUTION"
    || normalizedMode === "HUMAN_EXECUTION_HANDOFF"
    || /^yes$/i.test(String(realReleaseExecutionAllowed || "").trim());
}

export function discoverReleaseWorkflowFacts(projectRoot) {
  const root = path.resolve(projectRoot);
  const { files, errors } = safeWorkflowFiles(path.join(root, ".github", "workflows"), root);
  const packageScripts = readPackageScripts(root);
  const workflows = files.map((file) => inspectWorkflow(root, file, packageScripts));
  const inspectionErrors = workflows.flatMap((item) => item.inspectionErrors);
  const releaseWorkflowFiles = workflows.filter((item) => item.releaseWorkflow);
  const unknownRunner = releaseWorkflowFiles.some((item) => item.unknownRunner);
  const githubHostedRunner = releaseWorkflowFiles.length === 0 ? "No"
    : releaseWorkflowFiles.some((item) => item.githubHostedRunner) ? "Yes"
      : unknownRunner ? "Unknown" : "No";
  const selfHostedRunner = releaseWorkflowFiles.length === 0 ? "No"
    : releaseWorkflowFiles.some((item) => item.selfHostedRunner) ? "Yes"
      : unknownRunner ? "Unknown" : "No";
  const runnerType = releaseWorkflowFiles.length === 0 ? "unknown"
    : unknownRunner ? "unknown"
      : githubHostedRunner === "Yes" && selfHostedRunner === "Yes" ? "mixed"
        : githubHostedRunner === "Yes" ? "github_hosted"
          : selfHostedRunner === "Yes" ? "self_hosted" : "unknown";

  return {
    errors: [...errors, ...inspectionErrors],
    workflowFiles: workflows,
    releaseWorkflowFiles,
    tagTriggerWorkflowFiles: workflows.filter((item) => item.tagTrigger),
    tagTrigger: workflows.some((item) => item.tagTrigger),
    releaseEvent: workflows.some((item) => item.releaseEvent),
    workflowDispatch: workflows.some((item) => item.workflowDispatch),
    workflowDispatchActionBasedDeploy: workflows.some((item) => item.workflowDispatch && item.actionBasedDeploy),
    actionBasedDeploy: workflows.some((item) => item.actionBasedDeploy),
    commandBasedDeploy: workflows.some((item) => item.commandBasedDeploy),
    providerDeploy: workflows.some((item) => item.providerDeploy),
    dockerPush: workflows.some((item) => item.dockerPush),
    packagePublish: workflows.some((item) => item.packagePublish),
    packageScriptResolutionUnknown: workflows.some((item) => item.packageScriptResolutionUnknown),
    unresolvedPackageScripts: workflows.flatMap((item) => item.unresolvedPackageScripts.map((reason) => ({
      workflow: item.relativePath,
      reason,
    }))),
    indirectExecutionResolutionUnknown: workflows.some((item) => item.indirectExecutionResolutionUnknown),
    unresolvedIndirectExecutions: workflows.flatMap((item) => item.unresolvedIndirectExecutions.map((reason) => ({
      workflow: item.relativePath,
      reason,
    }))),
    githubReleaseAction: workflows.some((item) => item.githubReleaseAction),
    uploadArtifact: workflows.some((item) => item.uploadArtifact),
    externalReleaseAction: workflows.some((item) => item.externalReleaseAction),
    releaseWorkflow: releaseWorkflowFiles.length > 0,
    githubHostedRunner,
    selfHostedRunner,
    runnerType,
    unknownRunner,
  };
}

export function expectedReleaseStepExecutor(mode, stepAction, allowedCodexActions = [], blockedActions = []) {
  const action = normalizedReleaseAction(stepAction);
  if (externallyOwnedReleaseSteps.has(action)) return "HUMAN_REQUIRED";

  const requiredAction = codexActionForStep.get(action);
  if (!requiredAction) return "HUMAN_REQUIRED";
  if (mode === "PLAN_ONLY") return "CODEX_MAY_PREPARE";
  if (mode !== "ASSISTED_EXECUTION") return "HUMAN_REQUIRED";
  const allowed = new Set((allowedCodexActions || []).map(normalizedReleaseAction));
  const blocked = new Set((blockedActions || []).map(normalizedReleaseAction));
  if (!allowed.has(requiredAction) || blocked.has(requiredAction) || blocked.has(action)) return "HUMAN_REQUIRED";
  return "CODEX_MAY_RUN_AFTER_APPROVAL";
}

export function releaseStepAuthorityErrors({ mode, stepAction, executor, allowedCodexActions, blockedActions }) {
  const action = normalizedReleaseAction(stepAction);
  const actual = normalizedReleaseAction(executor);
  const expected = expectedReleaseStepExecutor(mode, action, allowedCodexActions, blockedActions);
  const errors = [];

  if (actual !== expected) {
    errors.push(`release step ${action || "<missing>"} executor ${actual || "<missing>"} must be ${expected}`);
  }
  if (externallyOwnedReleaseSteps.has(action) && actual !== "HUMAN_REQUIRED") {
    errors.push(`release step ${action} is an external real-world effect and cannot be assigned to Codex`);
  }
  return errors;
}

function safeWorkflowFiles(root, projectRoot) {
  if (!fs.existsSync(root)) return { files: [], errors: [] };
  const inspectedRoot = inspectProjectPath(projectRoot, root, "workflow directory");
  if (!inspectedRoot.ok) return { files: [], errors: [inspectedRoot.error] };
  if (!inspectedRoot.stat.isDirectory()) return { files: [], errors: ["workflow source path must be a directory"] };
  const files = [];
  const errors = [];
  let visited = 0;
  const visit = (dir, depth = 0) => {
    if (depth > releaseGraphLimits.maxDepth) {
      errors.push(`workflow discovery exceeds maximum directory depth ${releaseGraphLimits.maxDepth}`);
      return;
    }
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      visited += 1;
      if (visited > releaseGraphLimits.maxNodes) {
        errors.push(`workflow discovery exceeds maximum entry count ${releaseGraphLimits.maxNodes}`);
        return;
      }
      const file = path.join(dir, entry.name);
      if (entry.isSymbolicLink()) {
        errors.push(`workflow source must not be a symlink: ${path.relative(root, file).replaceAll(path.sep, "/")}`);
      } else if (entry.isDirectory()) {
        visit(file, depth + 1);
      } else if (/\.ya?ml$/i.test(entry.name)) {
        files.push(file);
      }
    }
  };
  visit(root);
  return { files: files.sort(), errors };
}

function inspectWorkflow(projectRoot, file, packageScripts) {
  const graph = inspectYamlExecutionGraph(projectRoot, file);
  const content = graph.rootContent;
  const packageScriptEffects = inspectPackageScriptEffects(
    projectRoot,
    graph.runCommands,
    packageScripts,
    graph.scriptEntries,
  );
  const unresolved = [...new Set([...graph.unresolved, ...packageScriptEffects.unresolved])].sort();
  const expandedCommands = packageScriptEffects.commands.join("\n");
  const commandAuthorityText = `${graph.runCommands.join("\n")}\n${expandedCommands}`;
  const yamlAuthorityText = graph.contents.join("\n");
  const onBlock = extractTopLevelYamlBlock(content, "on");
  const pushBlock = extractNestedYamlBlock(onBlock, "push");
  const tagTrigger = /\bpush\s*:\s*\{[^}]*\btags(?:-ignore)?\s*:/is.test(onBlock)
    || /^\s*tags(?:-ignore)?\s*:/im.test(pushBlock);
  const releaseEvent = hasWorkflowTrigger(onBlock, "release");
  const workflowDispatch = hasWorkflowTrigger(onBlock, "workflow_dispatch");
  const actionRefs = graph.actionRefs;
  for (const ref of actionRefs) {
    if (isUnknownReleaseLikeRemoteActionRef(ref)) {
      unresolved.push(`remote action ${ref} has release-like behavior but is not in the bounded inspected action set`);
    } else if ((tagTrigger || releaseEvent) && isUnknownRemoteActionRef(ref)) {
      unresolved.push(`release-triggered workflow uses uninspected remote action ${ref}`);
    }
  }
  unresolved.sort();
  const githubReleaseAction = /\bgh\s+release\s+(?:create|upload)\b/i.test(commandAuthorityText)
    || actionRefs.some((ref) => githubReleaseActionPattern.test(ref));
  const dockerBuildPushAction = actionRefs.some((ref) => /^docker\/build-push-action@/i.test(ref))
    && /^\s*push\s*:\s*(?:true|yes|on)\s*(?:#.*)?$/im.test(yamlAuthorityText);
  const actionBasedDeploy = dockerBuildPushAction || actionRefs.some(isDeployActionRef);
  const providerDeployCommand = providerDeployCommandPattern.test(commandAuthorityText);
  const dockerPush = /\bdocker\s+(?:push|buildx\s+build[^\n]*--push)\b/i.test(commandAuthorityText) || dockerBuildPushAction;
  const packagePublish = /\b(?:npm|pnpm|yarn)\s+publish\b|\btwine\s+upload\b/i.test(commandAuthorityText);
  const commandBasedDeploy = providerDeployCommand
    || registryPublishCommandPattern.test(commandAuthorityText)
    || externalSubmissionPattern.test(commandAuthorityText)
    || /\b(?:scp|rsync)\b[^\n]*(?:server|deploy|prod|production)/i.test(commandAuthorityText);
  const providerDeploy = providerDeployCommand
    || actionRefs.some((ref) => providerDeployActionPattern.test(ref))
    || actionRefs.some((ref) => isGenericDeployActionRef(ref));
  const uploadArtifact = actionRefs.some((ref) => /^actions\/upload-artifact@/i.test(ref));
  const productionEnvironment = /(?:^|\n)\s*environment\s*:\s*production\s*(?:#.*)?(?:\n|$)/i.test(yamlAuthorityText);
  const releaseLikeUnresolved = unresolved.some(isReleaseRelevantUnresolvedReason);
  const externalReleaseAction = githubReleaseAction || actionBasedDeploy || commandBasedDeploy;
  const releaseWorkflow = tagTrigger
    || releaseEvent
    || externalReleaseAction
    || (workflowDispatch && releaseLikeUnresolved)
    || (productionEnvironment && uploadArtifact);
  const runners = [...yamlAuthorityText.matchAll(/^\s*runs-on\s*:\s*(.+?)\s*$/gim)].map((match) => stripYamlScalar(match[1]));
  const githubHostedRunner = runners.some((runner) => /\b(?:ubuntu|windows|macos)-(?:latest|[0-9][a-z0-9.-]*)\b|\bgithub-hosted\b/i.test(runner));
  const selfHostedRunner = runners.some((runner) => /\bself-hosted\b/i.test(runner));
  const unknownRunner = releaseWorkflow && (runners.length === 0 || runners.some((runner) => {
    if (/\bself-hosted\b/i.test(runner)) return false;
    if (/\b(?:ubuntu|windows|macos)-(?:latest|[0-9][a-z0-9.-]*)\b|\bgithub-hosted\b/i.test(runner)) return false;
    return true;
  }));

  return {
    file,
    relativePath: path.relative(projectRoot, file).replaceAll(path.sep, "/"),
    tagTrigger,
    releaseEvent,
    workflowDispatch,
    actionBasedDeploy,
    commandBasedDeploy,
    providerDeploy,
    dockerPush,
    packagePublish,
    packageScriptResolutionUnknown: unresolved.length > 0,
    unresolvedPackageScripts: unresolved,
    indirectExecutionResolutionUnknown: unresolved.length > 0,
    unresolvedIndirectExecutions: unresolved,
    githubReleaseAction,
    uploadArtifact,
    externalReleaseAction,
    releaseWorkflow,
    githubHostedRunner,
    selfHostedRunner,
    unknownRunner,
    inspectionErrors: graph.errors,
  };
}

function isReleaseRelevantUnresolvedReason(reason) {
  const text = String(reason || "");
  if (/release-like behavior/i.test(text)) return true;
  if (/remote reusable workflow/i.test(text)
    && /(?:deploy|publish|submit|promote|ship|production|prod|release)/i.test(text)) return true;
  if (/\b(?:package script|build target)\s+(?:deploy|publish|submit|promote|ship|production|prod|release)(?:\b|[-_:])/i.test(text)) return true;

  const projectScript = text.match(/\bproject script\s+([^\s]+)/i)?.[1] || "";
  if (!projectScript || /(?:^|\/)(?:tests?|test-fixtures|examples)(?:\/|$)/i.test(projectScript)) return false;
  const basename = path.basename(projectScript).replace(/\.(?:bash|cjs|js|mjs|py|sh|zsh)$/i, "");
  if (/^(?:check|resolve|verify|test|audit|inspect)(?:[-_.]|$)/i.test(basename)) return false;
  return /(?:^|[-_.])(?:deploy|publish|submit|promote|ship|production|prod|release)(?:[-_.]|$)/i.test(basename);
}

function normalizeArgvRequest(argv) {
  if (!Array.isArray(argv) || argv.length === 0) {
    return { ok: false, value: null, canonical: "", errors: ["execution argv must contain at least one argument"] };
  }
  const errors = [];
  const normalized = argv.map((item, index) => {
    if (typeof item !== "string") {
      errors.push(`execution argv[${index}] must be a string`);
      return "";
    }
    if (!item || /[\0\r\n]/.test(item)) errors.push(`execution argv[${index}] must be a non-empty single-line value`);
    return item;
  });
  if (errors.length > 0) return { ok: false, value: null, canonical: "", errors };
  return {
    ok: true,
    value: { request_type: "argv", argv: normalized },
    canonical: normalized.map(shellQuote).join(" "),
    errors: [],
  };
}

function shellQuote(value) {
  return /^[a-zA-Z0-9_@%+=:,./-]+$/.test(value)
    ? value
    : `'${value.replaceAll("'", `'"'"'`)}'`;
}

function normalizeJsonValue(value) {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error("numbers must be finite");
    return value;
  }
  if (Array.isArray(value)) return value.map(normalizeJsonValue);
  if (!value || typeof value !== "object" || Object.getPrototypeOf(value) !== Object.prototype) {
    throw new Error("values must be JSON objects, arrays, strings, numbers, booleans, or null");
  }
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, normalizeJsonValue(value[key])]));
}

function readPackageScripts(projectRoot) {
  const file = path.join(projectRoot, "package.json");
  if (!fs.existsSync(file)) {
    return { scripts: null, error: "package.json is missing" };
  }
  const read = readBoundedProjectFile(projectRoot, file, "package.json");
  if (!read.ok) return { scripts: null, error: read.error };
  try {
    const parsed = JSON.parse(read.content);
    const scripts = parsed?.scripts;
    if (scripts === undefined) return { scripts: {}, error: "" };
    if (!scripts || typeof scripts !== "object" || Array.isArray(scripts)) {
      return { scripts: null, error: "package.json scripts must be an object" };
    }
    return { scripts, error: "" };
  } catch (error) {
    return { scripts: null, error: `package.json is invalid: ${error.message}` };
  }
}

function inspectYamlExecutionGraph(projectRoot, rootFile) {
  const contents = [];
  const runCommands = [];
  const actionRefs = [];
  const scriptEntries = [];
  const unresolved = new Set();
  const errors = [];
  const completed = new Set();
  let rootContent = "";
  let nodes = 0;

  const reserveNode = (label, depth) => {
    if (depth > releaseGraphLimits.maxDepth) {
      unresolved.add(`${label} exceeds release execution graph depth ${releaseGraphLimits.maxDepth}`);
      return false;
    }
    nodes += 1;
    if (nodes > releaseGraphLimits.maxNodes) {
      unresolved.add(`release execution graph exceeds node limit ${releaseGraphLimits.maxNodes}`);
      return false;
    }
    return true;
  };

  const visitYaml = (file, kind, depth = 0, trail = []) => {
    const label = projectRelative(projectRoot, file);
    if (trail.includes(file)) {
      unresolved.add(`local workflow/action cycle cannot be proven effect-free: ${[...trail, file].map((item) => projectRelative(projectRoot, item)).join(" -> ")}`);
      return;
    }
    if (completed.has(file) || !reserveNode(label, depth)) return;

    const read = readBoundedProjectFile(projectRoot, file, `${kind} source`);
    if (!read.ok) {
      unresolved.add(read.error);
      return;
    }
    completed.add(file);
    if (file === rootFile) rootContent = read.content;
    contents.push(read.content);

    const surface = extractYamlExecutionSurface(read.content, label);
    runCommands.push(...surface.runCommands.map((command) => expandKnownWorkflowPaths(command, projectRoot, kind === "action" ? file : "")));
    actionRefs.push(...surface.actionRefs);
    for (const reason of surface.unresolved) unresolved.add(reason);
    if (surface.workingDirectories.some((value) => !new Set([".", "./", "${{ github.workspace }}"]).has(value))) {
      unresolved.add(`${label} uses a workflow working-directory that is not root-bound`);
    }

    if (kind === "action") {
      const runsBlock = extractNestedYamlBlock(read.content, "runs");
      const using = extractYamlMappingScalar(runsBlock, "using");
      if (!using) {
        unresolved.add(`${label} local action has no statically resolved runs.using value`);
      } else if (/^composite$/i.test(using)) {
        // Composite action commands and uses references are part of the surface above.
      } else if (/^node(?:12|16|20|24)$/i.test(using)) {
        for (const key of ["pre", "main", "post"]) {
          const target = extractYamlMappingScalar(runsBlock, key);
          if (!target) continue;
          const resolved = resolveProjectScriptPath(projectRoot, path.dirname(file), target, "node", `${label} runs.${key}`);
          if (resolved.ok) scriptEntries.push(resolved.entry);
          else unresolved.add(resolved.error);
        }
        if (!extractYamlMappingScalar(runsBlock, "main")) {
          unresolved.add(`${label} Node action has no statically resolved runs.main script`);
        }
      } else {
        unresolved.add(`${label} local action runtime ${using} cannot be statically inspected`);
      }
    }

    const nextTrail = [...trail, file];
    for (const ref of surface.actionRefs) {
      if (/\$|`|\$\{\{/.test(ref)) {
        unresolved.add(`${label} uses a dynamic action or workflow reference`);
        continue;
      }
      if (ref.startsWith("./")) {
        const resolved = resolveLocalUsesReference(projectRoot, ref, label);
        if (!resolved.ok) {
          unresolved.add(resolved.error);
          continue;
        }
        visitYaml(resolved.file, resolved.kind, depth + 1, nextTrail);
      } else if (isRemoteReusableWorkflowRef(ref)) {
        unresolved.add(`${label} remote reusable workflow ${ref} cannot be inspected from the project`);
      }
    }
  };

  try {
    visitYaml(rootFile, "workflow");
  } catch (error) {
    errors.push(`${projectRelative(projectRoot, rootFile)} workflow inspection failed: ${error.message}`);
  }
  return {
    rootContent,
    contents,
    runCommands,
    actionRefs,
    scriptEntries,
    unresolved: [...unresolved].sort(),
    errors,
  };
}

function inspectPackageScriptEffects(projectRoot, workflowCommands, packageScripts, initialScriptEntries = []) {
  const commands = [];
  const unresolved = new Set();
  const completed = new Set();
  const completedFiles = new Set();
  const scripts = packageScripts.scripts;
  let nodes = 0;

  const reserveNode = (label, depth) => {
    if (depth > releaseGraphLimits.maxDepth) {
      unresolved.add(`${label} exceeds indirect execution depth ${releaseGraphLimits.maxDepth}`);
      return false;
    }
    nodes += 1;
    if (nodes > releaseGraphLimits.maxNodes) {
      unresolved.add(`indirect execution graph exceeds node limit ${releaseGraphLimits.maxNodes}`);
      return false;
    }
    return true;
  };

  const visitPackage = (invocation, trail = [], depth = 0) => {
    const name = invocation.name;
    if (invocation.unresolvedContext) {
      unresolved.add(`${invocation.manager} run ${name || "<dynamic>"} uses a non-root package or workspace selector`);
      return;
    }
    if (invocation.dynamic || !name) {
      unresolved.add(`${invocation.manager} uses a dynamic or missing package script name`);
      return;
    }
    if (!scripts) {
      unresolved.add(`${invocation.manager} run ${name} cannot be resolved because ${packageScripts.error}`);
      return;
    }
    if (trail.includes(name)) {
      unresolved.add(`package script cycle cannot be proven effect-free: ${[...trail, name].join(" -> ")}`);
      return;
    }
    if (!Object.hasOwn(scripts, name)) {
      if (!invocation.ifPresent) unresolved.add(`${invocation.manager} run ${name} references a missing package script`);
      return;
    }
    if (completed.has(name) || !reserveNode(`package script ${name}`, depth)) return;

    const nextTrail = [...trail, name];
    for (const scriptName of [`pre${name}`, name, `post${name}`]) {
      if (!Object.hasOwn(scripts, scriptName)) continue;
      const command = scripts[scriptName];
      if (typeof command !== "string") {
        unresolved.add(`package script ${scriptName} must be a string to prove its external effects`);
        continue;
      }
      consumeCommand(command, `package script ${scriptName}`, nextTrail, depth + 1);
    }
    completed.add(name);
  };

  const visitScript = (entry, trail = [], depth = 0) => {
    const label = projectRelative(projectRoot, entry.file);
    if (trail.includes(entry.file)) {
      unresolved.add(`project script cycle cannot be proven effect-free: ${[...trail, entry.file].map((item) => projectRelative(projectRoot, item)).join(" -> ")}`);
      return;
    }
    if (completedFiles.has(entry.file) || !reserveNode(`project script ${label}`, depth)) return;
    const read = readBoundedProjectFile(projectRoot, entry.file, "project script");
    if (!read.ok) {
      unresolved.add(read.error);
      return;
    }
    completedFiles.add(entry.file);
    const language = entry.language || languageForScript(entry.file, read.content);
    const nextTrail = [...trail, entry.file];

    if (language === "shell") {
      commands.push(read.content);
      consumeCommand(read.content, `project shell script ${label}`, nextTrail, depth + 1);
      return;
    }
    if (language !== "node" && language !== "python") {
      unresolved.add(`${label} script language cannot be statically inspected`);
      return;
    }

    const processCalls = extractStaticProcessCommands(read.content, language, label);
    for (const reason of processCalls.unresolved) unresolved.add(reason);
    for (const command of processCalls.commands) {
      consumeCommand(command, `${label} process call`, nextTrail, depth + 1);
    }
    const modules = extractLocalModuleReferences(projectRoot, entry.file, read.content, language);
    for (const reason of modules.unresolved) unresolved.add(reason);
    for (const moduleEntry of modules.entries) visitScript(moduleEntry, nextTrail, depth + 1);
  };

  function consumeCommand(command, origin, trail = [], depth = 0) {
    if (Buffer.byteLength(String(command || ""), "utf8") > releaseGraphLimits.maxCommandBytes) {
      unresolved.add(`${origin} exceeds command inspection limit ${releaseGraphLimits.maxCommandBytes} bytes`);
      return;
    }
    commands.push(String(command || ""));
    for (const child of extractPackageScriptInvocations(command)) visitPackage(child, trail, depth + 1);

    const localScripts = extractLocalScriptInvocations(projectRoot, command, origin);
    for (const reason of localScripts.unresolved) unresolved.add(reason);
    for (const inline of localScripts.inlineCommands) consumeCommand(inline, `${origin} inline shell`, trail, depth + 1);
    for (const inline of localScripts.inlineSources) {
      const inlineLabel = `${origin} inline ${inline.language}`;
      const processCalls = extractStaticProcessCommands(inline.source, inline.language, inlineLabel);
      for (const reason of processCalls.unresolved) unresolved.add(reason);
      for (const nested of processCalls.commands) consumeCommand(nested, `${origin} inline process call`, trail, depth + 1);
      const virtualFile = path.join(projectRoot, inline.language === "node" ? ".release-inline.mjs" : ".release-inline.py");
      const modules = extractLocalModuleReferences(projectRoot, virtualFile, inline.source, inline.language);
      for (const reason of modules.unresolved) unresolved.add(reason);
      for (const moduleEntry of modules.entries) visitScript(moduleEntry, trail, depth + 1);
    }
    for (const entry of localScripts.entries) visitScript(entry, trail, depth + 1);
  }

  for (const command of workflowCommands) consumeCommand(command, "workflow run command");
  for (const entry of initialScriptEntries) visitScript(entry);
  return { commands, unresolved: [...unresolved].sort() };
}

function extractWorkflowRunCommands(content) {
  const lines = String(content || "").split(/\r?\n/);
  const commands = [];
  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(/^(\s*)(?:-\s*)?["']?run["']?\s*:\s*(.*)$/i);
    if (!match) continue;
    const raw = match[2].trim();
    if (!isYamlBlockScalarHeader(raw)) {
      const scalar = parseConservativeYamlScalar(raw);
      if (scalar.ok && scalar.value) commands.push(scalar.value);
      continue;
    }
    const indent = match[1].length;
    const block = [];
    for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
      const line = lines[cursor];
      if (!line.trim()) {
        block.push("");
        continue;
      }
      const nextIndent = line.match(/^\s*/)?.[0].length || 0;
      if (nextIndent <= indent) break;
      block.push(line.slice(Math.min(line.length, indent + 1)).trimStart());
      index = cursor;
    }
    commands.push(block.join(raw.startsWith(">") ? " " : "\n"));
  }
  return commands;
}

function extractYamlExecutionSurface(content, label) {
  const text = String(content || "");
  const lines = text.split(/\r?\n/);
  const actionRefs = [];
  const workingDirectories = [];
  const unresolved = new Set();

  if (lines.some((line) => /^\s*\t/.test(line))) {
    unresolved.add(`${label} uses tab-indented YAML that cannot be safely inspected`);
  }
  if (lines.some((line) => /^\s*(?:<<\s*:\s*\*|-(?:\s+)?\*[a-z0-9_-]+|["']?[a-z0-9_-]+["']?\s*:\s*\*)/i.test(line))) {
    unresolved.add(`${label} uses YAML aliases in executable structure`);
  }
  if (lines.some((line) => /\{[^}]*\b["']?(?:run|uses)["']?\s*:/i.test(line))) {
    unresolved.add(`${label} uses flow-style run/uses steps that cannot be safely inspected`);
  }

  for (const line of lines) {
    const uses = line.match(/^\s*(?:-\s*)?["']?uses["']?\s*:\s*(.*)$/i);
    if (uses) {
      const parsed = parseConservativeYamlScalar(uses[1]);
      if (!parsed.ok || !parsed.value) {
        unresolved.add(`${label} has an unresolved uses reference`);
      } else {
        actionRefs.push(parsed.value);
      }
    }

    const workingDirectory = line.match(/^\s*["']?working-directory["']?\s*:\s*(.*)$/i);
    if (workingDirectory) {
      const parsed = parseConservativeYamlScalar(workingDirectory[1]);
      if (!parsed.ok || !parsed.value || /\$|`|\$\{\{/.test(parsed.value)) {
        unresolved.add(`${label} has a dynamic workflow working-directory`);
      } else {
        workingDirectories.push(parsed.value);
      }
    }

    const run = line.match(/^\s*(?:-\s*)?["']?run["']?\s*:\s*(.*)$/i);
    if (run && run[1].trim() && !isYamlBlockScalarHeader(run[1].trim())) {
      const parsed = parseConservativeYamlScalar(run[1]);
      if (!parsed.ok || !parsed.value) unresolved.add(`${label} has an unresolved run command`);
      else if (/^\s*\$\{\{[^}]+\}\}\s*$/.test(parsed.value)) unresolved.add(`${label} has a fully dynamic run command`);
    }
  }

  return {
    runCommands: extractWorkflowRunCommands(text),
    actionRefs,
    workingDirectories,
    unresolved: [...unresolved],
  };
}

function parseConservativeYamlScalar(value) {
  let text = String(value || "").trim();
  if (!text) return { ok: false, value: "" };
  if (text[0] === '"' || text[0] === "'") {
    if (text.length < 2 || text.at(-1) !== text[0]) return { ok: false, value: "" };
    const quote = text[0];
    text = text.slice(1, -1);
    if (quote === '"') text = text.replace(/\\([\\"])/g, "$1");
    else text = text.replaceAll("''", "'");
    return { ok: true, value: text };
  }
  text = text.replace(/\s+#.*$/, "").trim();
  if (!text || /^[&*!|\[{>]|^null$/i.test(text)) return { ok: false, value: "" };
  return { ok: true, value: text };
}

function isYamlBlockScalarHeader(value) {
  return /^[|>](?:[1-9][+-]?|[+-][1-9]?)?$/.test(String(value || "").trim());
}

function resolveLocalUsesReference(projectRoot, ref, origin) {
  if (!/^\.\/[a-z0-9_./-]+$/i.test(ref) || ref.includes("..")) {
    return { ok: false, error: `${origin} local uses reference ${ref} is not a static safe project path` };
  }
  const inspected = inspectProjectPath(projectRoot, path.resolve(projectRoot, ref.slice(2)), `${origin} local uses reference`);
  if (!inspected.ok) return inspected;
  if (inspected.stat.isDirectory()) {
    const descriptors = ["action.yml", "action.yaml"]
      .map((name) => path.join(inspected.path, name))
      .filter((candidate) => fs.existsSync(candidate));
    if (descriptors.length !== 1) {
      return {
        ok: false,
        error: `${origin} local action ${ref} must resolve to exactly one action.yml or action.yaml descriptor`,
      };
    }
    const descriptor = inspectProjectPath(projectRoot, descriptors[0], `${origin} local action descriptor`);
    return descriptor.ok ? { ok: true, file: descriptor.path, kind: "action" } : descriptor;
  }
  if (!inspected.stat.isFile() || !/\.ya?ml$/i.test(inspected.path)) {
    return { ok: false, error: `${origin} local uses reference ${ref} is not a reusable workflow or action descriptor` };
  }
  const relative = projectRelative(projectRoot, inspected.path);
  const kind = relative.startsWith(".github/workflows/") ? "workflow" : "action";
  return { ok: true, file: inspected.path, kind };
}

function isRemoteReusableWorkflowRef(ref) {
  return /^[^./][^@\s]*\/\.github\/workflows\/[^@\s]+@[^\s]+$/i.test(String(ref || ""));
}

function isUnknownReleaseLikeRemoteActionRef(ref) {
  return isUnknownRemoteActionRef(ref) && releaseLikeRemoteActionPattern.test(String(ref || ""));
}

function isUnknownRemoteActionRef(ref) {
  const value = String(ref || "");
  if (!value || value.startsWith("./") || isRemoteReusableWorkflowRef(value)) return false;
  return !ignoredActionPattern.test(value)
    && !githubReleaseActionPattern.test(value)
    && !providerDeployActionPattern.test(value)
    && !/^docker\/(?:build-push-action|login-action|setup-buildx-action)@/i.test(value);
}

function extractYamlMappingScalar(content, key) {
  const pattern = new RegExp(`^\\s*["']?${key}["']?\\s*:\\s*(.*?)\\s*$`, "im");
  const match = String(content || "").match(pattern);
  if (!match) return "";
  const parsed = parseConservativeYamlScalar(match[1]);
  return parsed.ok ? parsed.value : "";
}

function resolveProjectScriptPath(projectRoot, baseDir, value, language, origin) {
  const token = String(value || "").trim();
  if (!token || path.isAbsolute(token) || /\0|\$|`|\$\{\{/.test(token)) {
    return { ok: false, error: `${origin} uses a dynamic or non-project script path` };
  }
  const inspected = inspectProjectPath(projectRoot, path.resolve(baseDir, token), `${origin} script`);
  if (!inspected.ok) return inspected;
  if (!inspected.stat.isFile()) return { ok: false, error: `${origin} script ${token} is not a file` };
  return { ok: true, entry: { file: inspected.path, language } };
}

function inspectProjectPath(projectRoot, candidate, label) {
  const root = path.resolve(projectRoot);
  const resolved = path.resolve(candidate);
  const relative = path.relative(root, resolved);
  if (!relative || relative === ".") return { ok: false, error: `${label} must resolve below the project root` };
  if (relative.startsWith(`..${path.sep}`) || relative === ".." || path.isAbsolute(relative)) {
    return { ok: false, error: `${label} escapes the project root` };
  }

  let cursor = root;
  try {
    for (const part of relative.split(path.sep)) {
      cursor = path.join(cursor, part);
      const stat = fs.lstatSync(cursor);
      if (stat.isSymbolicLink()) {
        return { ok: false, error: `${label} must not traverse a symlink: ${projectRelative(root, cursor)}` };
      }
    }
    return { ok: true, path: resolved, stat: fs.statSync(resolved) };
  } catch (error) {
    return { ok: false, error: `${label} cannot be resolved: ${projectRelative(root, resolved)} (${error.code || error.message})` };
  }
}

function readBoundedProjectFile(projectRoot, file, label) {
  const inspected = inspectProjectPath(projectRoot, file, label);
  if (!inspected.ok) return inspected;
  if (!inspected.stat.isFile()) return { ok: false, error: `${label} is not a file: ${projectRelative(projectRoot, file)}` };
  if (inspected.stat.size > releaseGraphLimits.maxFileBytes) {
    return {
      ok: false,
      error: `${label} ${projectRelative(projectRoot, file)} exceeds inspection limit ${releaseGraphLimits.maxFileBytes} bytes`,
    };
  }
  try {
    const content = fs.readFileSync(file, "utf8");
    if (content.includes("\0")) return { ok: false, error: `${label} ${projectRelative(projectRoot, file)} is not a text source` };
    return { ok: true, content };
  } catch (error) {
    return { ok: false, error: `${label} ${projectRelative(projectRoot, file)} cannot be read: ${error.message}` };
  }
}

function languageForScript(file, content = "") {
  if (/\.(?:bash|sh|zsh)$/i.test(file) || /^#![^\n]*\b(?:bash|dash|ksh|sh|zsh)\b/i.test(content)) return "shell";
  if (/\.(?:cjs|js|mjs)$/i.test(file) || /^#![^\n]*\bnode\b/i.test(content)) return "node";
  if (/\.py$/i.test(file) || /^#![^\n]*\bpython(?:3)?\b/i.test(content)) return "python";
  return "";
}

function projectRelative(projectRoot, file) {
  return path.relative(path.resolve(projectRoot), path.resolve(file)).replaceAll(path.sep, "/") || ".";
}

function expandKnownWorkflowPaths(command, projectRoot, actionDescriptor = "") {
  let expanded = String(command || "").replace(/\$\{\{\s*github\.workspace\s*\}\}/gi, ".");
  if (actionDescriptor) {
    const actionPath = projectRelative(projectRoot, path.dirname(actionDescriptor));
    expanded = expanded.replace(/\$\{\{\s*github\.action_path\s*\}\}/gi, actionPath);
  }
  return expanded;
}

function extractLocalScriptInvocations(projectRoot, command, origin) {
  const entries = [];
  const inlineCommands = [];
  const inlineSources = [];
  const unresolved = new Set();
  const tokenized = tokenizeShell(command);
  if (!tokenized.ok) {
    if (/\b(?:bash|dash|ksh|node(?:js)?|py|python3?|sh|zsh|source)\b|(?:^|\s)\.\/[a-z0-9_./-]+/i.test(String(command || ""))) {
      unresolved.add(`${origin} contains an unparseable project script invocation`);
    }
    return { entries, inlineCommands, inlineSources, unresolved: [...unresolved] };
  }

  for (const segment of shellCommandSegments(tokenized.tokens)) {
    let index = firstExecutableToken(segment);
    if (index < 0) continue;
    let executable = segment[index];
    let name = path.basename(executable).toLowerCase();
    while (new Set(["command", "exec", "nohup", "sudo"]).has(name)) {
      index += 1;
      while (index < segment.length && segment[index].startsWith("-")) index += 1;
      if (index >= segment.length) break;
      executable = segment[index];
      name = path.basename(executable).toLowerCase();
    }
    if (index >= segment.length) continue;
    const args = segment.slice(index + 1);

    if (/\$|`|\$\{\{/.test(executable)) {
      unresolved.add(`${origin} uses a dynamic executable that cannot be proven effect-free`);
      continue;
    }
    if (name === "eval") {
      if (args.length === 0 || args.some((token) => /\$|`|\$\{\{/.test(token))) {
        unresolved.add(`${origin} uses a dynamic eval command`);
      } else {
        inlineCommands.push(args.join(" "));
      }
      continue;
    }

    if (name === "source" || executable === ".") {
      addResolvedScript(args.find((token) => token !== "--"), "shell", `${origin} source`);
      continue;
    }
    if (shellInterpreters.has(name)) {
      const parsed = interpreterScriptArgument(args, "shell");
      if (parsed.inline !== undefined) inlineCommands.push(parsed.inline);
      else if (parsed.path) addResolvedScript(parsed.path, "shell", `${origin} ${name}`);
      else if (parsed.unresolved) unresolved.add(`${origin} ${name} uses a dynamic or unsupported script target`);
      continue;
    }
    if (nodeInterpreters.has(name)) {
      const parsed = interpreterScriptArgument(args, "node");
      if (parsed.inline !== undefined) inlineSources.push({ language: "node", source: parsed.inline });
      else if (parsed.path) addResolvedScript(parsed.path, "node", `${origin} ${name}`);
      else if (parsed.unresolved) unresolved.add(`${origin} ${name} uses a dynamic or unsupported script target`);
      continue;
    }
    if (pythonInterpreters.has(name)) {
      const parsed = interpreterScriptArgument(args, "python");
      if (parsed.inline !== undefined) inlineSources.push({ language: "python", source: parsed.inline });
      else if (parsed.module) {
        const module = resolvePythonModuleReference(projectRoot, projectRoot, parsed.module, `${origin} ${name} -m`);
        if (module.ok && module.entry) entries.push(module.entry);
        else if (module.error) unresolved.add(module.error);
      } else if (parsed.path) addResolvedScript(parsed.path, "python", `${origin} ${name}`);
      else if (parsed.unresolved) unresolved.add(`${origin} ${name} uses a dynamic or unsupported script target`);
      continue;
    }
    if (/^(?:g?make|just|task)$/.test(name)) {
      const target = args.find((token) => token !== "--" && !token.startsWith("-")) || "";
      if (!target || releaseLikeBuildTargetPattern.test(target)) {
        unresolved.add(`${origin} invokes ${name} target ${target || "<default>"} whose external effects are not statically resolved`);
      }
      continue;
    }
    if (executable.includes("/") || localScriptExtensionPattern.test(executable)) {
      addResolvedScript(executable, "", `${origin} executable`);
    }
  }

  return { entries, inlineCommands, inlineSources, unresolved: [...unresolved] };

  function addResolvedScript(target, language, label) {
    if (!target || /\$|`|\$\{\{/.test(target)) {
      unresolved.add(`${label} uses a dynamic or missing project script path`);
      return;
    }
    const resolved = resolveProjectScriptPath(projectRoot, projectRoot, target, language, label);
    if (resolved.ok) entries.push(resolved.entry);
    else unresolved.add(resolved.error);
  }
}

function shellCommandSegments(tokens) {
  const segments = [];
  let segment = [];
  for (const token of tokens) {
    if (shellOperators.has(token)) {
      if (segment.length > 0) segments.push(segment);
      segment = [];
    } else {
      segment.push(token);
    }
  }
  if (segment.length > 0) segments.push(segment);
  return segments;
}

function firstExecutableToken(tokens) {
  let index = 0;
  if (tokens[index] === "env") {
    index += 1;
    while (index < tokens.length && (tokens[index].startsWith("-") || /^[a-z_][a-z0-9_]*=/i.test(tokens[index]))) index += 1;
  }
  while (index < tokens.length && /^[a-z_][a-z0-9_]*=/i.test(tokens[index])) index += 1;
  return index < tokens.length ? index : -1;
}

function interpreterScriptArgument(args, language) {
  const valueOptions = language === "node"
    ? new Set(["--conditions", "--diagnostic-dir", "--import", "--loader", "--openssl-config", "--require", "-C", "-r"])
    : new Set();
  for (let index = 0; index < args.length; index += 1) {
    const token = args[index];
    if (token === "--") return scriptTarget(args[index + 1]);
    if ((language === "shell" && /^-[a-z]*n[a-z]*$/i.test(token))
      || (language === "node" && new Set(["-c", "--check"]).has(token))) {
      return { ignored: true };
    }
    if ((language === "shell" && /^-[a-z]*c[a-z]*$/i.test(token))
      || (language === "node" && new Set(["-e", "--eval", "-p", "--print"]).has(token))
      || (language === "python" && token === "-c")) {
      return args[index + 1] === undefined ? { unresolved: true } : { inline: args[index + 1] };
    }
    if (language === "python" && token === "-m") {
      const module = args[index + 1];
      return !module || /\$|`/.test(module) ? { unresolved: true } : { module };
    }
    if (valueOptions.has(token)) {
      index += 1;
      continue;
    }
    if (token.startsWith("-")) continue;
    return scriptTarget(token);
  }
  return { unresolved: false };
}

function scriptTarget(token) {
  if (!token || /\$|`|\$\{\{/.test(token)) return { unresolved: true };
  return { path: token };
}

function extractStaticProcessCommands(content, language, label) {
  const commands = [];
  const unresolved = new Set();
  const searchable = maskSourceLiteralsAndComments(content, language);
  const descriptor = processCallDescriptor(content, language);
  const pattern = descriptor.pattern;
  let match;
  while ((match = pattern.exec(searchable)) !== null) {
    const openIndex = match.index + match[0].lastIndexOf("(");
    const call = extractBalancedCall(content, openIndex);
    if (!call.ok) {
      unresolved.add(`${label} ${match[1]} call cannot be statically bounded`);
      pattern.lastIndex = Math.max(pattern.lastIndex, openIndex + 1);
      continue;
    }
    pattern.lastIndex = call.end;
    const args = splitTopLevelArguments(call.content);
    const canonicalName = descriptor.aliases.get(match[1]) || match[1];
    const resolved = staticCommandForProcessCall(canonicalName, args, language);
    if (!resolved.ok) unresolved.add(`${label} ${match[1]} call cannot be statically resolved`);
    else commands.push(resolved.command);
  }
  return { commands, unresolved: [...unresolved] };
}

function processCallDescriptor(content, language) {
  const aliases = new Map();
  const base = language === "node"
    ? "(?:child_process\\.)?(?:exec|execSync|execFile|execFileSync|spawn|spawnSync)|execa(?:Sync)?|Bun\\.spawn(?:Sync)?|Deno\\.Command"
    : "subprocess\\.(?:run|call|check_call|check_output|Popen)|asyncio\\.create_subprocess_(?:exec|shell)|os\\.(?:system|popen|exec[a-z_]*|spawn[a-z_]*)";

  for (const line of String(content || "").split(/\r?\n/)) {
    if (language === "node") {
      const imported = line.match(/^\s*import\s*\{([^}]+)\}\s*from\s*["'](?:node:)?child_process["']/);
      const required = line.match(/^\s*(?:const|let|var)\s*\{([^}]+)\}\s*=\s*require\(\s*["'](?:node:)?child_process["']\s*\)/);
      for (const specifier of (imported?.[1] || required?.[1] || "").split(",")) {
        const parts = specifier.trim().split(/\s+(?:as|:)\s+|\s*:\s*/);
        const original = parts[0];
        const alias = parts[1];
        if (alias && /^(?:exec|execSync|execFile|execFileSync|spawn|spawnSync)$/.test(original) && /^[a-z_$][\w$]*$/i.test(alias)) {
          aliases.set(alias, original);
        }
      }
    } else {
      const namespace = line.match(/^\s*import\s+(subprocess|os)\s+as\s+([a-z_][a-z0-9_]*)/i);
      if (namespace) {
        const methods = namespace[1] === "subprocess"
          ? ["run", "call", "check_call", "check_output", "Popen"]
          : ["system", "popen"];
        for (const method of methods) aliases.set(`${namespace[2]}.${method}`, `${namespace[1]}.${method}`);
      }
      const imported = line.match(/^\s*from\s+(subprocess|os)\s+import\s+(.+)$/i);
      if (imported) {
        for (const specifier of imported[2].split(",")) {
          const parts = specifier.trim().split(/\s+as\s+/i);
          const original = parts[0];
          const alias = parts[1] || original;
          if (/^[a-z_][a-z0-9_]*$/i.test(alias)) aliases.set(alias, `${imported[1]}.${original}`);
        }
      }
    }
  }

  const aliasPattern = [...aliases.keys()].sort((left, right) => right.length - left.length).map(escapeRegExp).join("|");
  return {
    aliases,
    pattern: new RegExp(`\\b(${base}${aliasPattern ? `|${aliasPattern}` : ""})\\s*\\(`, "g"),
  };
}

function escapeRegExp(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function staticCommandForProcessCall(name, args, language) {
  if (args.length === 0) return { ok: false };
  const firstExpression = language === "python" ? stripPythonKeywordArgument(args[0]) : args[0];
  const first = parseStaticCommandExpression(firstExpression);
  if (!first.ok || first.values.length === 0) return { ok: false };

  const argvStyleNodeCall = /(?:execFile|spawn|execa)(?:Sync)?$/i.test(name) && !/^Bun\./.test(name);
  if (language === "node" && argvStyleNodeCall && first.values.length === 1 && args.length > 1) {
    const second = args[1].trim();
    if (!second.startsWith("{")) {
      const parsedArgs = parseStaticCommandExpression(second);
      if (!parsedArgs.ok) return { ok: false };
      first.values.push(...parsedArgs.values);
    }
  } else if (/^Deno\.Command$/.test(name) || /^Bun\.spawn/i.test(name)) {
    if (first.values.length === 1) return { ok: false };
  }
  if (first.scalar && !argvStyleNodeCall) return { ok: true, command: first.values[0] };
  return { ok: true, command: first.values.map(shellQuote).join(" ") };
}

function stripPythonKeywordArgument(value) {
  return String(value || "").replace(/^\s*args\s*=\s*/, "");
}

function parseStaticCommandExpression(value) {
  const text = String(value || "").trim();
  const scalar = parseStaticSourceString(text);
  if (scalar.ok) return { ok: true, values: [scalar.value], scalar: true };
  const pairs = new Map([["[", "]"], ["(", ")"]]);
  if (!pairs.has(text[0]) || text.at(-1) !== pairs.get(text[0])) return { ok: false, values: [], scalar: false };
  const items = splitTopLevelArguments(text.slice(1, -1)).filter((item) => item.trim());
  const values = [];
  for (const item of items) {
    const parsed = parseStaticSourceString(item);
    if (!parsed.ok) return { ok: false, values: [], scalar: false };
    values.push(parsed.value);
  }
  return { ok: true, values, scalar: false };
}

function parseStaticSourceString(value) {
  const text = String(value || "").trim();
  const prefix = text.match(/^([rubf]*)/i)?.[1] || "";
  if (/f/i.test(prefix)) return { ok: false, value: "" };
  const source = text.slice(prefix.length);
  const quote = source[0];
  if (!["'", '"', "`"].includes(quote) || source.length < 2 || source.at(-1) !== quote) return { ok: false, value: "" };
  const body = source.slice(1, -1);
  if (quote === "`" && /\$\{/.test(body)) return { ok: false, value: "" };
  return {
    ok: true,
    value: body
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "\r")
      .replace(/\\t/g, "\t")
      .replace(/\\([\\'"`])/g, "$1"),
  };
}

function extractBalancedCall(content, openIndex) {
  let quote = "";
  let escaped = false;
  let depth = 0;
  const limit = Math.min(content.length, openIndex + releaseGraphLimits.maxProcessCallBytes);
  for (let index = openIndex; index < limit; index += 1) {
    const char = content[index];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (quote) {
      if (char === "\\") escaped = true;
      else if (char === quote) quote = "";
      continue;
    }
    if (["'", '"', "`"].includes(char)) {
      quote = char;
      continue;
    }
    if (char === "(") depth += 1;
    else if (char === ")") {
      depth -= 1;
      if (depth === 0) return { ok: true, content: content.slice(openIndex + 1, index), end: index + 1 };
    }
  }
  return { ok: false, content: "", end: openIndex + 1 };
}

function splitTopLevelArguments(value) {
  const items = [];
  let start = 0;
  let quote = "";
  let escaped = false;
  const stack = [];
  const pairs = new Map([["(", ")"], ["[", "]"], ["{", "}"]]);
  const text = String(value || "");
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (quote) {
      if (char === "\\") escaped = true;
      else if (char === quote) quote = "";
      continue;
    }
    if (["'", '"', "`"].includes(char)) {
      quote = char;
      continue;
    }
    if (pairs.has(char)) stack.push(pairs.get(char));
    else if (stack.at(-1) === char) stack.pop();
    else if (char === "," && stack.length === 0) {
      items.push(text.slice(start, index));
      start = index + 1;
    }
  }
  items.push(text.slice(start));
  return items;
}

function maskSourceLiteralsAndComments(value, language) {
  const text = String(value || "");
  const masked = Array.from({ length: text.length }, (_, index) => (/\r|\n/.test(text[index]) ? text[index] : " "));
  let quote = "";
  let triple = false;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1] || "";
    if (lineComment) {
      if (char === "\n") lineComment = false;
      continue;
    }
    if (blockComment) {
      if (char === "*" && next === "/") {
        blockComment = false;
        index += 1;
      }
      continue;
    }
    if (quote) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        continue;
      }
      if (triple && text.slice(index, index + 3) === quote.repeat(3)) {
        quote = "";
        triple = false;
        index += 2;
      } else if (!triple && char === quote) {
        quote = "";
      }
      continue;
    }
    if (language === "node" && char === "/" && next === "/") {
      lineComment = true;
      index += 1;
      continue;
    }
    if (language === "node" && char === "/" && next === "*") {
      blockComment = true;
      index += 1;
      continue;
    }
    if (language === "python" && char === "#") {
      lineComment = true;
      continue;
    }
    if (["'", '"', ...(language === "node" ? ["`"] : [])].includes(char)) {
      quote = char;
      triple = language === "python" && text.slice(index, index + 3) === char.repeat(3);
      if (triple) index += 2;
      continue;
    }
    masked[index] = char;
  }
  return masked.join("");
}

function extractLocalModuleReferences(projectRoot, sourceFile, content, language) {
  const entries = [];
  const unresolved = new Set();
  const refs = new Set();

  if (language === "node") {
    for (const line of String(content || "").split(/\r?\n/)) {
      for (const pattern of [
        /\b(?:import|export)\s+(?:[^'";]*?\s+from\s+)?["']([^"']+)["']/g,
        /\b(?:require|import)\s*\(\s*["']([^"']+)["']\s*\)/g,
      ]) {
        for (const match of line.matchAll(pattern)) if (match[1].startsWith(".")) refs.add(match[1]);
      }
      if (/\b(?:require|import)\s*\(\s*(?!["'])[^)]*\)/.test(line)) {
        unresolved.add(`${projectRelative(projectRoot, sourceFile)} uses a dynamic module load`);
      }
    }
    for (const ref of refs) {
      const resolved = resolveNodeModuleReference(projectRoot, sourceFile, ref);
      if (resolved.ok) entries.push(resolved.entry);
      else unresolved.add(resolved.error);
    }
  } else if (language === "python") {
    for (const line of String(content || "").split(/\r?\n/)) {
      const from = line.match(/^\s*from\s+([.a-z_][.a-z0-9_]*)\s+import\b/i);
      if (from) refs.add(from[1]);
      const imported = line.match(/^\s*import\s+([a-z_][.a-z0-9_]*)\b/i);
      if (imported) refs.add(imported[1]);
      if (/\bimportlib\.import_module\s*\(\s*(?!["'])/.test(line)) {
        unresolved.add(`${projectRelative(projectRoot, sourceFile)} uses a dynamic Python module load`);
      }
    }
    for (const ref of refs) {
      const resolved = resolvePythonModuleReference(projectRoot, path.dirname(sourceFile), ref, `${projectRelative(projectRoot, sourceFile)} import`);
      if (resolved.ok && resolved.entry) entries.push(resolved.entry);
      else if (resolved.error && resolved.projectCandidate) unresolved.add(resolved.error);
    }
  }
  return { entries, unresolved: [...unresolved] };
}

function resolveNodeModuleReference(projectRoot, sourceFile, ref) {
  if (!/^\.\.?\/[a-z0-9_./-]+$/i.test(ref)) {
    return { ok: false, error: `${projectRelative(projectRoot, sourceFile)} has an unsafe local module reference ${ref}` };
  }
  const base = path.resolve(path.dirname(sourceFile), ref);
  const candidates = [base, `${base}.js`, `${base}.mjs`, `${base}.cjs`, path.join(base, "index.js"), path.join(base, "index.mjs"), path.join(base, "index.cjs")]
    .filter((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
  if (candidates.length !== 1) {
    return { ok: false, error: `${projectRelative(projectRoot, sourceFile)} local module ${ref} does not resolve to exactly one project file` };
  }
  const inspected = inspectProjectPath(projectRoot, candidates[0], `${projectRelative(projectRoot, sourceFile)} local module`);
  if (!inspected.ok || !inspected.stat.isFile()) return inspected.ok ? { ok: false, error: `${ref} is not a project file` } : inspected;
  return { ok: true, entry: { file: inspected.path, language: "node" } };
}

function resolvePythonModuleReference(projectRoot, baseDir, ref, origin) {
  if (!/^[.a-z_][.a-z0-9_]*$/i.test(ref)) return { ok: false, projectCandidate: true, error: `${origin} has an unsafe Python module reference ${ref}` };
  let relativeModule = ref;
  let bases = [...new Set([path.resolve(projectRoot), path.resolve(baseDir)])];
  if (ref.startsWith(".")) {
    const dots = ref.match(/^\.+/)?.[0].length || 0;
    let base = baseDir;
    for (let index = 1; index < dots; index += 1) base = path.dirname(base);
    bases = [base];
    relativeModule = ref.slice(dots);
  }
  const candidates = bases.flatMap((base) => {
    const modulePath = path.resolve(base, relativeModule.replaceAll(".", path.sep));
    return [`${modulePath}.py`, path.join(modulePath, "__init__.py")];
  }).filter((candidate, index, all) => fs.existsSync(candidate) && fs.statSync(candidate).isFile() && all.indexOf(candidate) === index);
  if (candidates.length === 0) return { ok: false, projectCandidate: ref.startsWith("."), error: `${origin} local Python module ${ref} is missing` };
  if (candidates.length !== 1) return { ok: false, projectCandidate: true, error: `${origin} Python module ${ref} is ambiguous` };
  const inspected = inspectProjectPath(projectRoot, candidates[0], `${origin} Python module`);
  if (!inspected.ok) return { ...inspected, projectCandidate: true };
  return { ok: true, projectCandidate: true, entry: { file: inspected.path, language: "python" } };
}

function extractPackageScriptInvocations(command) {
  const tokenized = tokenizeShell(command);
  if (!tokenized.ok) {
    return /\b(?:npm|pnpm|yarn)\b/i.test(String(command || ""))
      ? [{ manager: "package-manager", name: "", dynamic: true, ifPresent: false }]
      : [];
  }
  const invocations = [];
  for (let index = 0; index < tokenized.tokens.length; index += 1) {
    const manager = path.basename(tokenized.tokens[index]).toLowerCase();
    if (!packageManagers.has(manager)) continue;
    let end = index + 1;
    while (end < tokenized.tokens.length && !shellOperators.has(tokenized.tokens[end])) end += 1;
    const segment = tokenized.tokens.slice(index + 1, end);
    const invocation = packageScriptInvocation(manager, segment);
    if (invocation) invocations.push(invocation);
    index = end - 1;
  }
  return invocations;
}

function packageScriptInvocation(manager, tokens) {
  let runIndex = tokens.findIndex((token) => token === "run" || token === "run-script");
  if (runIndex < 0 && manager === "yarn") {
    const commandIndex = firstCommandToken(tokens);
    const command = tokens[commandIndex];
    if (command && !yarnBuiltInCommands.has(command)) {
      return {
        manager,
        name: command,
        dynamic: /\$|`|\$\{\{/.test(command),
        ifPresent: false,
        unresolvedContext: tokens.slice(0, commandIndex).some((token) => /^(?:--workspace|-w|--filter|--dir|-C|--cwd)(?:=|$)/.test(token)),
      };
    }
  }
  if (runIndex < 0) return null;
  const argumentSeparator = tokens.indexOf("--", runIndex + 1);
  const resolutionTokens = tokens.slice(0, argumentSeparator < 0 ? tokens.length : argumentSeparator);
  const unresolvedContext = resolutionTokens.some((token) => /^(?:--prefix|--workspace|-w|--filter|--dir|-C|--cwd)(?:=|$)/.test(token));

  const ifPresent = resolutionTokens.includes("--if-present");
  for (let index = runIndex + 1; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token === "--if-present") continue;
    if (token === "--") continue;
    if (token.startsWith("-")) continue;
    return {
      manager,
      name: token,
      dynamic: /\$|`|\$\{\{/.test(token),
      ifPresent,
      unresolvedContext,
    };
  }
  return { manager, name: "", dynamic: true, ifPresent, unresolvedContext };
}

function firstCommandToken(tokens) {
  for (let index = 0; index < tokens.length; index += 1) {
    if (tokens[index] === "--") continue;
    if (tokens[index].startsWith("-")) {
      if (new Set(["--cwd", "--use-yarnrc", "--mutex", "--cache-folder", "--modules-folder"]).has(tokens[index])) index += 1;
      continue;
    }
    return index;
  }
  return -1;
}

function tokenizeShell(value, options = {}) {
  const tokens = [];
  let token = "";
  let tokenStarted = false;
  let quote = "";
  let escaped = false;
  const push = () => {
    if (!tokenStarted) return;
    tokens.push(token);
    token = "";
    tokenStarted = false;
  };

  const text = String(value || "");
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (escaped) {
      token += char;
      tokenStarted = true;
      escaped = false;
      continue;
    }
    if (quote) {
      if (char === quote) {
        quote = "";
      } else if (char === "\\" && quote === '"') {
        escaped = true;
      } else {
        if (options.rejectDynamicExpansion && (char === "$" || char === "`")) {
          return { ok: false, tokens: [], errors: ["execution argv must not depend on shell expansion"] };
        }
        token += char;
        tokenStarted = true;
      }
      continue;
    }
    if (char === "'" || char === '"') {
      quote = char;
      tokenStarted = true;
      continue;
    }
    if (char === "\\") {
      escaped = true;
      tokenStarted = true;
      continue;
    }
    if (options.rejectDynamicExpansion && (char === "$" || char === "`")) {
      return { ok: false, tokens: [], errors: ["execution argv must not depend on shell expansion"] };
    }
    if (/\s/.test(char)) {
      push();
      if (char === "\n") tokens.push("\n");
      continue;
    }
    if (";&|<>()".includes(char)) {
      push();
      const pair = `${char}${text[index + 1] || ""}`;
      if (new Set(["&&", "||", "<<", ">>"]).has(pair)) {
        tokens.push(pair);
        index += 1;
      } else {
        tokens.push(char);
      }
      continue;
    }
    token += char;
    tokenStarted = true;
  }
  if (escaped || quote) return { ok: false, tokens: [], errors: ["shell command has an unterminated quote or escape"] };
  push();
  return { ok: true, tokens, errors: [] };
}

function isDeployActionRef(ref) {
  if (ignoredActionPattern.test(ref)) return false;
  return githubReleaseActionPattern.test(ref)
    || providerDeployActionPattern.test(ref)
    || isGenericDeployActionRef(ref);
}

function isGenericDeployActionRef(ref) {
  if (ignoredActionPattern.test(ref) || /^docker\/build-push-action@/i.test(ref)) return false;
  const action = String(ref || "").split("@")[0];
  return /(?:^|[/_.-])(?:deploy|deployment|publish|release|submit)(?:-action)?$/i.test(action);
}

function extractTopLevelYamlBlock(content, key) {
  const lines = String(content || "").split(/\r?\n/);
  const keyPattern = new RegExp(`^["']?${key}["']?\\s*:\\s*(.*)$`, "i");
  for (let index = 0; index < lines.length; index += 1) {
    if (/^\s/.test(lines[index])) continue;
    const match = lines[index].match(keyPattern);
    if (!match) continue;
    if (match[1].trim()) return match[1].trim();
    const block = [];
    for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
      const line = lines[cursor];
      if (line.trim() && !/^\s/.test(line) && !/^\s*#/.test(line)) break;
      block.push(line);
    }
    return block.join("\n");
  }
  return "";
}

function extractNestedYamlBlock(content, key) {
  const lines = String(content || "").split(/\r?\n/);
  const keyPattern = new RegExp(`^(\\s*)["']?${key}["']?\\s*:\\s*(.*)$`, "i");
  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(keyPattern);
    if (!match) continue;
    if (match[2].trim()) return match[2].trim();
    const indent = match[1].length;
    const block = [];
    for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
      const line = lines[cursor];
      if (!line.trim()) {
        block.push(line);
        continue;
      }
      const nextIndent = line.match(/^\s*/)?.[0].length || 0;
      if (nextIndent <= indent) break;
      block.push(line);
    }
    return block.join("\n");
  }
  return "";
}

function hasWorkflowTrigger(onBlock, key) {
  const text = String(onBlock || "");
  if (!text.includes("\n")) {
    const raw = text.trim();
    if (/^\{/.test(raw)) {
      return new RegExp(`(?:^|[,{}]\\s*)["']?${key}["']?\\s*:`, "i").test(raw);
    }
    const scalar = raw.replace(/^\[|\]$/g, "");
    return scalar.split(",").map((item) => item.trim().replace(/^["']|["']$/g, ""))
      .some((item) => item === key || item.startsWith(`${key}:`));
  }
  const lines = text.split(/\r?\n/).filter((line) => line.trim() && !/^\s*#/.test(line));
  const minimumIndent = Math.min(...lines.map((line) => line.match(/^\s*/)?.[0].length || 0));
  const keyPattern = new RegExp(`^["']?${key}["']?\\s*:`, "i");
  return lines.some((line) => (line.match(/^\s*/)?.[0].length || 0) === minimumIndent
    && keyPattern.test(line.trim()));
}

function stripYamlScalar(value) {
  return String(value || "").replace(/\s+#.*$/, "").replace(/^["']|["']$/g, "").trim();
}
