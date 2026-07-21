#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { sectionBody, splitMarkdownRow } from "./lib/markdown.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["strict", "json"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const strict = Boolean(args.strict);
const outputJson = Boolean(args.json);

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

const baselineRef = "docs/environment-baseline.md";
const baselinePath = path.join(projectRoot, baselineRef);
const requiredSections = [
  "Human Summary",
  "Status",
  "Scope",
  "Local Development",
  "Runtime Versions",
  "Package Manager And Lockfile",
  "Environment Variables",
  "Secret Boundary",
  "External Services",
  "Test Environment",
  "Preview / Staging / Production",
  "CI / CD",
  "Release Process",
  "Rollback Process",
  "Logs / Monitoring / Alerts",
  "Open Environment Decisions",
];
const profileEnvironmentRequirements = {
  "ios-app": [
    { topic: "Xcode version", aliases: ["Xcode version", "Xcode"], valuePattern: /\d/ },
    { topic: "Swift version", aliases: ["Swift version", "Swift"], valuePattern: /\d/ },
    { topic: "scheme", aliases: ["scheme", "Xcode scheme", "build scheme"], valuePattern: /[A-Za-z0-9]/ },
  ],
  "android-app": [
    { topic: "JDK version", aliases: ["JDK version", "JDK", "Java version"], valuePattern: /\d/ },
    { topic: "Gradle version", aliases: ["Gradle version", "Gradle"], valuePattern: /\d/ },
    {
      topic: "Android Gradle Plugin version",
      aliases: ["Android Gradle Plugin version", "Android Gradle Plugin", "AGP version", "AGP"],
      valuePattern: /\d/,
    },
    {
      topic: "emulator or device target",
      aliases: ["emulator or device target", "Android device target", "emulator target", "device target"],
      valuePattern: /\b(?:android|pixel|emulator|device|api\s*\d+)\b/i,
    },
  ],
};
const projectProfileSelection = selectedProfilesFromDocument("docs/project-profile.md");
const baselineSelection = selectedProfilesFromDocument("docs/baseline-selection.md");
const selectedProfiles = baselineSelection.exists
  ? baselineSelection.selectedProfiles
  : projectProfileSelection.selectedProfiles;
const profileSelectionConflict = projectProfileSelection.exists
  && baselineSelection.exists
  && !sameValues(projectProfileSelection.selectedProfiles, baselineSelection.selectedProfiles);

let failed = false;
let pending = false;
let state = "READY";
const checks = [];

if (!outputJson) {
  console.log(`# Environment Baseline Check (${strict ? "strict" : "advisory"})`);
  console.log("");
}

if (!fs.existsSync(baselinePath)) {
  state = "MISSING";
  const message = `missing ${baselineRef}`;
  if (strict) fail(message);
  else warn(`${message}; create it from .intentos/templates/environment-baseline.md before environment, CI, deploy, release, rollback, or secret-sensitive work`);
} else {
  const content = fs.readFileSync(baselinePath, "utf8");
  pass(`${baselineRef} exists`);

  for (const section of requiredSections) {
    const body = sectionBody(content, section);
    if (body === null) {
      const message = `${baselineRef} missing section: ${section}`;
      if (strict) fail(message);
      else warn(message);
      continue;
    }
    if (bodyLooksPlaceholder(body)) {
      const message = `${baselineRef} section is empty or placeholder-only: ${section}`;
      if (strict) fail(message);
      else warn(message);
    } else {
      pass(`${section} section`);
    }
  }

  if (containsForbiddenSecretValue(content)) {
    fail(`${baselineRef} appears to contain secret values or credentials`);
  } else {
    pass("no obvious secret values detected");
  }

  if (/Secret values must never be written into this file\./.test(content)) {
    pass("secret-value prohibition is explicit");
  } else {
    const message = `${baselineRef} must say: Secret values must never be written into this file.`;
    if (strict) fail(message);
    else warn(message);
  }

  if (/\b(CONFIRMED|PENDING_CONFIRMATION|NOT_APPLICABLE)\b/.test(content)) {
    pass("tri-state environment status model is present");
  } else {
    const message = `${baselineRef} must use CONFIRMED / PENDING_CONFIRMATION / NOT_APPLICABLE states`;
    if (strict) fail(message);
    else warn(message);
  }

  if (hasPendingDecision(content)) {
    const message = `${baselineRef} contains pending environment decisions`;
    if (strict) fail(message);
    else warn(message);
  }

  if (!/Codex may modify CI:\s*(?:No\.?|[^\n]*(?:task|technical|project)[^\n]*(?:review|verification))/i.test(content)) {
    const message = `${baselineRef} must define a Codex-owned technical CI boundary and keep concrete external effects separately consent-gated`;
    if (strict) fail(message);
    else warn(message);
  } else {
    pass("CI modification boundary is explicit");
  }

  if (profileSelectionConflict) {
    const message = `${projectProfileSelection.path} and ${baselineSelection.path} select different profiles`;
    if (strict) fail(message);
    else warn(message);
  }

  validateSelectedProfileEnvironment(content);

  const commandIssues = validateDeclaredCommands(content);
  if (commandIssues.length > 0) {
    for (const issue of commandIssues) {
      if (strict) fail(issue);
      else warn(issue);
    }
  } else {
    pass("declared local and CI verification commands resolve to current project files");
  }
}

if (failed) state = "FAILED";
else if (pending && state !== "MISSING") state = "PENDING";

if (outputJson) {
  console.log(JSON.stringify({
    state,
    checkMode: strict ? "strict" : "advisory",
    checkStatus: failed ? "FAIL" : pending ? "PENDING" : "PASS",
    baselineRef,
    selectedProfiles,
    profileSelections: {
      projectProfile: projectProfileSelection,
      baselineSelection,
      conflict: profileSelectionConflict,
    },
    checks,
  }, null, 2));
}

if (failed) process.exit(1);

if (!outputJson) {
  console.log("");
  if (state === "READY") {
    console.log("Environment baseline is ready.");
  } else if (state === "MISSING") {
    console.log("Environment baseline is missing. This is advisory for BL0 work, but Codex must establish it before environment, CI, release, rollback, deployment, production config, or secret-sensitive changes.");
  } else {
    console.log("Environment baseline is present but still pending. Codex must resolve technical gaps and ask only for an unavailable business/external fact or consent to a concrete real-world effect.");
  }
}

function record(status, message) {
  checks.push({ status, message });
  if (!outputJson) {
    const write = status === "FAIL" ? console.error : console.log;
    write(`${status} ${message}`);
  }
}

function fail(message) {
  failed = true;
  record("FAIL", message);
}

function pass(message) {
  record("PASS", message);
}

function warn(message) {
  pending = true;
  record("PENDING", message);
}

function bodyLooksPlaceholder(body) {
  const stripped = stripMarkdown(body);
  if (!stripped) return true;
  const nonPlaceholderLines = stripped
    .split("\n")
    .map((line) => line.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean)
    .filter((line) => !/^\|?[-:| ]+\|?$/.test(line))
    .filter((line) => !/^#+\s*/.test(line))
    .filter((line) => !/^<[^>]+>$/.test(line))
    .filter((line) => !/^(Yes\s*\/\s*No|No\s*\/\s*Yes|DRAFT\s*\/|PENDING\s*\/|CONFIRMED\s*\/|NOT_APPLICABLE\s*\/)/i.test(line));
  return nonPlaceholderLines.length === 0;
}

function stripMarkdown(value) {
  return String(value || "").replace(/`/g, "").replace(/\*\*/g, "").trim();
}

function hasPendingDecision(content) {
  return /\b(PENDING|PENDING_CONFIRMATION|DRAFT|PARTIAL|TBD|TODO|NEEDS_HUMAN|NEEDS HUMAN|待定|待确认|人工确认)\b/i.test(content);
}

function containsForbiddenSecretValue(content) {
  return /-----BEGIN [A-Z ]*PRIVATE KEY-----/i.test(content)
    || /\bgithub_pat_[A-Za-z0-9_]{20,}\b/.test(content)
    || /\bghp_[A-Za-z0-9]{20,}\b/.test(content)
    || /\bAKIA[0-9A-Z]{16}\b/.test(content)
    || /\b(password|secret|api_key|apikey)\s*=\s*[^<\s][^\s]+/i.test(content)
    || /:\/\/[^/\s:@]+:[^/\s:@]+@/.test(content);
}

function selectedProfilesFromDocument(rel) {
  const file = path.join(projectRoot, rel);
  if (!fs.existsSync(file) || !fs.lstatSync(file).isFile() || fs.lstatSync(file).isSymbolicLink()) {
    return { path: rel, exists: false, selectedProfiles: [] };
  }
  const body = sectionBody(fs.readFileSync(file, "utf8"), "Selected Profiles");
  const profiles = String(body || "").split("\n").flatMap((line) => {
    const match = line.match(/^\s*-\s+(.+?)\s*$/);
    if (!match) return [];
    const value = match[1]
      .replace(/[`*_#[\]]/g, "")
      .split(/\s+-\s+|:/)[0]
      .trim();
    return value && !/^(?:none|n\/a|pending|tbd|todo|profile-id)$/i.test(value) ? [value] : [];
  });
  return { path: rel, exists: true, selectedProfiles: [...new Set(profiles)].sort() };
}

function sameValues(left, right) {
  return JSON.stringify([...(left || [])].sort()) === JSON.stringify([...(right || [])].sort());
}

function validateSelectedProfileEnvironment(content) {
  for (const profile of selectedProfiles) {
    const requirements = profileEnvironmentRequirements[profile] || [];
    for (const requirement of requirements) {
      const fact = findProfileEnvironmentFact(content, requirement);
      if (fact.valid) {
        pass(`${profile} environment topic confirmed: ${requirement.topic} (${fact.value})`);
      } else {
        const message = `${baselineRef} lacks confirmed ${profile} environment topic: ${requirement.topic}${fact.value ? ` (${fact.value})` : ""}`;
        if (strict) fail(message);
        else warn(message);
      }
    }
  }
}

function findProfileEnvironmentFact(content, requirement) {
  const tableFact = findProfileEnvironmentTableFact(content, requirement);
  if (tableFact) return tableFact;
  const aliasPattern = requirement.aliases.map(escapeRegExp).join("|");
  const labelPattern = new RegExp(`^\\s*(?:[-*]\\s*)?(?:\\*\\*)?(?:${aliasPattern})(?:\\*\\*)?\\s*:\\s*(.+?)\\s*$`, "i");
  for (const line of String(content || "").split("\n")) {
    const labelMatch = stripMarkdown(line).match(labelPattern);
    if (labelMatch) return { ...validateProfileFactValue(labelMatch[1], requirement), source: "", reason: "project-local source is missing" };
  }
  return { valid: false, value: "" };
}

function findProfileEnvironmentTableFact(content, requirement) {
  const lines = String(content || "").split(/\r?\n/);
  let header = null;
  for (const line of lines) {
    if (!line.trim().startsWith("|") || !line.trim().endsWith("|")) continue;
    const cells = splitMarkdownRow(line).map((cell) => stripMarkdown(cell));
    if (!header) {
      const normalized = cells.map((cell) => cell.toLowerCase());
      if (["profile", "topic", "value", "source", "status"].every((name) => normalized.includes(name))) {
        header = Object.fromEntries(normalized.map((name, index) => [name, index]));
      }
      continue;
    }
    if (cells.every((cell) => /^:?-+:?$/.test(cell))) continue;
    const profile = cells[header.profile] || "";
    const topic = cells[header.topic] || "";
    if (profile !== selectedProfileForRequirement(requirement)) continue;
    if (!requirement.aliases.some((alias) => topic.toLowerCase() === alias.toLowerCase())) continue;
    const value = cells[header.value] || "";
    const source = cells[header.source] || "";
    const status = cells[header.status] || "";
    const valueResult = validateProfileFactValue(`${value} ${status}`.trim(), requirement, value);
    const sourceResult = validateProjectEnvironmentSource(profile, topic, value, source);
    return {
      valid: valueResult.valid && status === "CONFIRMED" && sourceResult.valid,
      value,
      source,
      reason: sourceResult.reason,
    };
  }
  return null;
}

function selectedProfileForRequirement(requirement) {
  for (const [profile, requirements] of Object.entries(profileEnvironmentRequirements)) {
    if (requirements.includes(requirement)) return profile;
  }
  return "";
}

function validateProjectEnvironmentSource(profile, topic, value, sourceText) {
  const sources = String(sourceText || "").split(/\s*,\s*/).filter(Boolean);
  if (sources.length === 0) return { valid: false, reason: "project-local source is missing" };
  const contents = [];
  for (const source of sources) {
    if (!isProjectLocalRegularFile(source)) return { valid: false, reason: `project-local source is unsafe or missing: ${source}` };
    contents.push({ source, content: fs.readFileSync(path.join(projectRoot, source), "utf8") });
  }
  const normalizedValue = stripMarkdown(value).trim();
  if (profile === "ios-app" && topic.toLowerCase() === "xcode version") {
    return sourceValueMatch(contents, normalizedValue, [/([0-9]+(?:\.[0-9]+){0,3})/]);
  }
  if (profile === "ios-app" && topic.toLowerCase() === "swift version") {
    return sourceValueMatch(contents, normalizedValue, [
      /swift-tools-version\s*:\s*([0-9]+(?:\.[0-9]+){0,3})/i,
      /\bSWIFT_VERSION\s*=\s*([0-9]+(?:\.[0-9]+){0,3})\s*;/i,
      /([0-9]+(?:\.[0-9]+){0,3})/,
    ]);
  }
  if (profile === "ios-app" && topic.toLowerCase() === "scheme") {
    const schemes = contents.map((item) => path.basename(item.source, ".xcscheme")).sort();
    const recorded = normalizedValue.split(/\s*,\s*/).filter(Boolean).sort();
    return { valid: sameValues(schemes, recorded), reason: "scheme must match project-local shared xcscheme files" };
  }
  if (profile === "android-app" && topic.toLowerCase() === "jdk version") {
    return sourceValueMatch(contents, normalizedValue, [
      /^\s*java\s+([^\s#]+)\s*$/im,
      /\bjvmToolchain\s*\(\s*([0-9]+)\s*\)/i,
      /\bJavaVersion\.VERSION_([0-9_]+)/i,
      /(?:sourceCompatibility|targetCompatibility)\s*(?:=|\s)\s*(?:JavaVersion\.VERSION_)?([0-9][0-9_.]*)/i,
      /([0-9]+(?:\.[0-9]+){0,3})/,
    ]);
  }
  if (profile === "android-app" && topic.toLowerCase() === "gradle version") {
    return sourceValueMatch(contents, normalizedValue, [/distributionUrl\s*=.*?gradle-([0-9][A-Za-z0-9_.-]*)-(?:all|bin)\.zip/i]);
  }
  if (profile === "android-app" && topic.toLowerCase() === "android gradle plugin version") {
    return sourceValueMatch(contents, normalizedValue, [
      /\bid\s*\(?\s*["']com\.android\.(?:application|library|dynamic-feature|test)["']\s*\)?\s*version\s*["']([^"']+)["']/i,
      /com\.android\.tools\.build:gradle:([^"'\s)]+)/i,
      /^\s*(?:agp|androidGradlePlugin)\s*=\s*["']([^"']+)["']/im,
    ]);
  }
  if (profile === "android-app" && topic.toLowerCase() === "emulator or device target") {
    const observed = contents.some((item) => /(?:^|\n)\s*\S+\s+device(?:\s|$)/m.test(item.content)
      || /(?:ANDROID_DEVICE_TARGET|emulator or device target|android device target)\s*[:=]\s*[^\r\n]+/i.test(item.content));
    return { valid: observed && /\b(?:android|pixel|emulator|device|api\s*\d+)\b/i.test(normalizedValue), reason: "device target must match project-local command output evidence" };
  }
  return { valid: false, reason: `no strict source validator exists for ${profile} ${topic}` };
}

function sourceValueMatch(contents, recorded, patterns) {
  const values = [];
  for (const { content } of contents) {
    for (const pattern of patterns) {
      const match = String(content || "").match(pattern);
      if (match?.[1]) values.push(match[1].replaceAll("_", "."));
    }
  }
  return {
    valid: values.includes(recorded),
    reason: `recorded value must match project-local source evidence (${values.join(", ") || "none"})`,
  };
}

function validateProfileFactValue(raw, requirement, explicitValue = null) {
  const value = stripMarkdown(explicitValue ?? raw).trim();
  const statusText = stripMarkdown(raw);
  const placeholder = !value
    || value.includes("<")
    || /\b(?:UNKNOWN|PENDING(?:_CONFIRMATION|_CODEX_DISCOVERY)?|DRAFT|PARTIAL|TBD|TODO|NOT_APPLICABLE|NONE|N\/A)\b/i.test(statusText);
  return {
    valid: !placeholder && requirement.valuePattern.test(value),
    value,
  };
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function validateDeclaredCommands(content) {
  const issues = [];
  const commands = [...content.matchAll(/^(?:Local test command|Test command|CI test command):\s*([^\n]+)$/gim)]
    .map((match) => match[1].trim().replace(/[.`]+$/g, ""))
    .filter((value) => !/^(?:NOT_APPLICABLE|NONE|UNKNOWN)$/i.test(value));
  for (const command of [...new Set(commands)]) {
    const bash = command.match(/^bash\s+([^\s;&|]+)$/);
    if (bash) {
      const ref = bash[1];
      if (!isProjectLocalRegularFile(ref)) issues.push(`${baselineRef} declares unresolved verification command: ${command}`);
      continue;
    }
    if (/^(?:npm\s+run|npm\s+test|pnpm\s+|corepack\s+pnpm\s+|yarn\s+)/.test(command)) {
      const packageFile = path.join(projectRoot, "package.json");
      if (!fs.existsSync(packageFile) || !fs.lstatSync(packageFile).isFile() || fs.lstatSync(packageFile).isSymbolicLink()) {
        issues.push(`${baselineRef} declares package-manager command without project-local package.json: ${command}`);
      }
      const script = declaredPackageScript(command);
      if (script && !packageScriptExists(packageFile, script)) {
        issues.push(`${baselineRef} declares missing package script ${script}: ${command}`);
      }
      continue;
    }
    issues.push(`${baselineRef} declares an unverifiable command form: ${command}`);
  }
  return issues;
}

function declaredPackageScript(command) {
  const match = String(command).match(/^(?:npm\s+(?:run\s+)?|pnpm\s+(?:run\s+)?|corepack\s+pnpm\s+(?:run\s+)?|yarn\s+)([A-Za-z0-9:._-]+)/);
  if (!match || match[1] === "test" && /^npm\s+test\b/.test(command)) return match?.[1] || "test";
  return match[1];
}

function packageScriptExists(packageFile, script) {
  try {
    const value = JSON.parse(fs.readFileSync(packageFile, "utf8"));
    return typeof value?.scripts?.[script] === "string" && value.scripts[script].trim().length > 0;
  } catch {
    return false;
  }
}

function isProjectLocalRegularFile(ref) {
  if (!ref || path.isAbsolute(ref) || ref.split(/[\\/]/).includes("..")) return false;
  const full = path.resolve(projectRoot, ref);
  const relative = path.relative(projectRoot, full);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) return false;
  try {
    let cursor = full;
    while (cursor !== projectRoot) {
      const stat = fs.lstatSync(cursor);
      if (stat.isSymbolicLink()) return false;
      cursor = path.dirname(cursor);
    }
    const stat = fs.lstatSync(full);
    return stat.isFile() && !stat.isSymbolicLink();
  } catch {
    return false;
  }
}
