import fs from "node:fs";
import path from "node:path";

const surfaceRules = {
  environment: {
    path: /(?:^|\/)(?:[^/]*(?:environment|runtime|deploy|hosting|config)[^/]*)\.(?:md|json|ya?ml|txt)$/i,
    subject: /\b(?:environment|runtime|deployment|hosting|configuration|config)\b/i,
    action: /\b(?:target|variable|profile|version|command|verify|verification|preflight|readiness)\b/i,
  },
  monitoring: {
    path: /(?:^|\/)(?:[^/]*(?:monitor|observability|alert|logging|telemetry)[^/]*)\.(?:md|json|ya?ml|txt)$/i,
    subject: /\b(?:monitoring|observability|alert|logging|telemetry|dashboard)\b/i,
    action: /\b(?:signal|threshold|query|dashboard|alert|owner|incident|observe|health|error|verify|verification)\b/i,
  },
  rollback: {
    path: /(?:^|\/)(?:[^/]*(?:rollback|recovery|fallback|restore|feature-flag)[^/]*)\.(?:md|json|ya?ml|txt)$/i,
    subject: /\b(?:rollback|recovery|fallback|restore|revert|feature flag)\b/i,
    action: /\b(?:trigger|step|command|owner|window|restore|revert|verify|verification|procedure)\b/i,
  },
  post_launch_smoke: {
    path: /(?:^|\/)(?:[^/]*(?:smoke|post-launch|post-release|release-verification)[^/]*)\.(?:md|json|ya?ml|txt|log)$/i,
    subject: /\b(?:smoke|post[- ]launch|post[- ]release|release verification)\b/i,
    action: /\b(?:command|probe|check|expected|result|pass|fail|procedure|verify|verification)\b/i,
  },
  release_sop: {
    path: /(?:^|\/)(?:[^/]*(?:release-sop|release-procedure|release-runbook|deployment-sop)[^/]*)\.(?:md|json|ya?ml|txt)$/i,
    subject: /\b(?:release|deployment|publish|submission)\b/i,
    action: /\b(?:step|procedure|runbook|command|preflight|rollback|verify|verification|handoff)\b/i,
  },
};

const aliases = new Map([
  ["environment", "environment"],
  ["monitoring", "monitoring"],
  ["rollback", "rollback"],
  ["post-launch-smoke", "post_launch_smoke"],
  ["post-launch smoke", "post_launch_smoke"],
  ["post launch smoke", "post_launch_smoke"],
  ["post-release smoke", "post_launch_smoke"],
  ["post release smoke", "post_launch_smoke"],
  ["post_release_smoke", "post_launch_smoke"],
  ["post_launch_smoke", "post_launch_smoke"],
  ["release sop", "release_sop"],
  ["release_sop", "release_sop"],
]);

export function validateReleaseSurfaceEvidence(surface, resolved) {
  const key = normalizeSurface(surface);
  const rule = surfaceRules[key];
  if (!rule) return { ok: false, errors: [`unsupported release evidence surface ${surface}`] };
  if (!resolved?.file || !resolved?.relativePath) {
    return { ok: false, errors: [`${displaySurface(key)} evidence is unresolved`] };
  }

  const relativePath = String(resolved.relativePath).replaceAll(path.sep, "/");
  const errors = [];
  if (!rule.path.test(relativePath)) {
    errors.push(`${displaySurface(key)} evidence path does not identify that release surface: ${relativePath}`);
  }

  let content = "";
  try {
    const stat = fs.statSync(resolved.file);
    if (!stat.isFile()) errors.push(`${displaySurface(key)} evidence is not a regular file`);
    else if (stat.size > 2 * 1024 * 1024) errors.push(`${displaySurface(key)} evidence is too large for bounded semantic validation`);
    else content = fs.readFileSync(resolved.file, "utf8");
  } catch (error) {
    errors.push(`${displaySurface(key)} evidence cannot be read: ${error.message}`);
  }

  if (content) {
    if (!rule.subject.test(content)) errors.push(`${displaySurface(key)} evidence does not describe its required subject`);
    if (!rule.action.test(content)) errors.push(`${displaySurface(key)} evidence does not contain an actionable check, procedure, or ownership detail`);
    if (isPlaceholderOnly(content)) errors.push(`${displaySurface(key)} evidence is placeholder-only`);
  }

  return { ok: errors.length === 0, errors, surface: key, relativePath };
}

function normalizeSurface(value) {
  const normalized = String(value || "").trim().toLowerCase().replaceAll("_", " ").replace(/\s+/g, " ");
  return aliases.get(normalized) || normalized.replaceAll(" ", "_");
}

function displaySurface(key) {
  return {
    environment: "Environment",
    monitoring: "Monitoring",
    rollback: "Rollback",
    post_launch_smoke: "Post-launch smoke",
    release_sop: "Release SOP",
  }[key] || key;
}

function isPlaceholderOnly(content) {
  const meaningful = String(content)
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#>*`_|-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (meaningful.length < 40) return true;
  return /^(?:todo|tbd|pending|placeholder|not yet recorded|待补充|待确认)[ .:;-]*$/i.test(meaningful);
}
