#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { evidenceDigest } from "./lib/artifact-schema.mjs";
import { canonicalFileDigest, projectIdentity, resolveAuthoritativeEvidenceReference } from "./lib/evidence-authority.mjs";
import { defaultIgnoredDirs, walkRelativePaths } from "./lib/project-signals.mjs";

const __filename = fileURLToPath(import.meta.url);
const scriptDir = path.dirname(__filename);
const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set([
  "json",
  "format",
  "intent",
  "verification",
  "platform",
  "closure-ref",
  "release-owner",
  "rollback",
  "monitoring",
  "environment",
  "post-launch-smoke",
  "safe-launch-ref",
]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputFormat = args.json ? "json" : String(args.format || "human");

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

if (!new Set(["human", "json"]).has(outputFormat)) {
  console.error(`FAIL unknown --format: ${outputFormat}`);
  process.exit(1);
}

const context = {
  intent: stringArg("intent") || args._[1] || "prepare launch review",
  verification: stringArg("verification"),
  explicitPlatform: stringArg("platform"),
  closureRef: stringArg("closure-ref"),
  safeLaunchRef: stringArg("safe-launch-ref"),
  releaseOwner: stringArg("release-owner"),
  rollback: stringArg("rollback"),
  monitoring: stringArg("monitoring"),
  environment: stringArg("environment"),
  postLaunchSmoke: stringArg("post-launch-smoke"),
};

const report = buildLaunchReviewView(projectRoot, context);
if (outputFormat === "json") console.log(JSON.stringify(report, null, 2));
else printHuman(report);

function buildLaunchReviewView(root, options) {
  const closure = resolveClosure(root, options);
  const platform = detectPlatform(root, options.explicitPlatform);
  const launchInputs = collectLaunchInputs(root, options);
  const label = chooseSafeLaunchLabel(closure, launchInputs);
  const launchReviewCanProceed = label === "READY_FOR_RELEASE_REVIEW" ? "Yes" : "No";
  const summaryReason = summaryFor(label, closure, launchInputs);
  const report = {
    reportType: "LAUNCH_REVIEW_VIEW",
    generatedBy: "scripts/resolve-launch-review-view.mjs",
    generatedAt: new Date().toISOString(),
    projectRoot: root,
    readOnly: true,
    humanSummary: {
      launchReviewView: label,
      why: summaryReason,
      safeNextStep: nextStepFor(label, closure, launchInputs),
    },
    unifiedClosureInput: {
      closureDecision: closure.decision,
      canCountAsDone: closure.canCountAsDone,
      ref: options.closureRef || closure.ref,
      effect: closureEffect(closure),
    },
    safeLaunchView: {
      safeLaunchLabel: label,
      launchReviewCanProceed,
      releaseApproval: "No",
      plainReason: summaryReason,
    },
    platformView: platform,
    launchSurfaceGaps: launchInputs,
    humanReleaseDecisions: [
      {
        decision: "Concrete release effect consent",
        status: label === "READY_FOR_RELEASE_REVIEW" ? "REAL_WORLD_CONSENT_NEEDED" : "NOT_NEEDED_YET",
        ownerOrRef: options.releaseOwner || "N/A",
        notes: "Technical readiness is not consent. Ask only when the exact external action and rollback are ready.",
      },
      {
        decision: "External policy or provider fact",
        status: platform.platformBlocker === "None recorded." ? "NOT_APPLICABLE" : "EXTERNAL_FACT_NEEDED",
        ownerOrRef: "N/A",
        notes: "Keep only the dependent release action blocked; continue technical evidence preparation.",
      },
    ],
    evidenceMap: buildEvidenceMap(closure, launchInputs, options),
    recommendedNextStep: recommendedNextStep(label, closure, launchInputs),
    boundaries: {
      writesTargetFiles: "No",
      deploysPublishesOrSubmitsRelease: "No",
      approvesReleaseOrProduction: "No",
      modifiesCiOrHooks: "No",
      changesProductionConfigSecretsDnsAppStorePaymentPermissionsOrMigrations: "No",
      replacesUnifiedClosure: "No",
      replacesSafeLaunch: "No",
      replacesProjectReleaseSops: "No",
      approvesHighRiskDecisions: "No",
    },
    outcome: "LAUNCH_REVIEW_VIEW_RECORDED",
  };
  const machineEvidence = {
    schema_version: "1.98.1",
    artifact_type: "launch_review_view",
    artifact_id: "generated-launch-review-view",
    launch_review_digest: "sha256:pending",
    project_identity: projectIdentity(root),
    intent: options.intent || "prepare launch review",
    closure_input: {
      ref: closure.ref || "N/A",
      digest: closure.digest || "N/A",
      decision: closure.decision,
      can_count_as_done: closure.canCountAsDone,
      durable: closure.durable === true ? "Yes" : "No",
    },
    safe_launch_label: label,
    launch_review_can_proceed: launchReviewCanProceed,
    surfaces: Object.fromEntries(launchInputs.map((item) => [surfaceKey(item.surface), item.status])),
    surface_evidence: Object.fromEntries(launchInputs.map((item) => [surfaceKey(item.surface), {
      ref: item.evidence,
      digest: item.digest,
    }])),
    boundaries: {
      approves_release: "No",
      executes_release: "No",
      changes_production: "No",
      replaces_closure: "No",
    },
    outcome: "LAUNCH_REVIEW_VIEW_RECORDED",
  };
  machineEvidence.launch_review_digest = evidenceDigest(machineEvidence, ["launch_review_digest"]);
  report.machineEvidence = machineEvidence;
  return report;
}

function resolveClosure(root, options) {
  if (options.closureRef) {
    const resolved = resolveAuthoritativeEvidenceReference(root, "", options.closureRef, { markdownOnly: true });
    if (resolved.ok) {
      const content = fs.readFileSync(resolved.file, "utf8");
      const decision = tableValue(content, "Decision") || "NEEDS_EVIDENCE";
      const canCountAsDone = tableValue(content, "Can count as done") || (decision === "DONE" ? "Yes" : "No");
      const checked = spawnSync(process.execPath, [
        path.join(scriptDir, "check-closure-decision.mjs"), root,
        "--report", resolved.relativePath,
      ], { encoding: "utf8", timeout: 30000, maxBuffer: 1024 * 1024 * 20 });
      return {
        decision: checked.status === 0 ? decision : "BLOCKED",
        canCountAsDone: checked.status === 0 ? canCountAsDone : "No",
        ref: resolved.relativePath,
        digest: canonicalFileDigest(resolved.file),
        durable: checked.status === 0,
        reason: checked.status === 0
          ? tableValue(content, "Plain reason") || "Closure decision record passed its strict checker."
          : `Closure decision failed strict validation: ${firstUsefulLine(checked.stderr || checked.stdout)}`,
      };
    }
  }

  const result = spawnSync(process.execPath, [
    path.join(scriptDir, "resolve-closure-decision.mjs"),
    root,
    "--intent",
    options.intent || "prepare launch review",
    "--verification",
    options.verification || "",
    "--json",
  ], { encoding: "utf8" });

  if (result.status !== 0) {
    return {
      decision: "BLOCKED",
      canCountAsDone: "No",
      ref: "scripts/resolve-closure-decision.mjs",
      digest: "N/A",
      durable: false,
      reason: result.stderr || result.stdout || "Unified Closure could not be resolved.",
    };
  }

  try {
    const parsed = JSON.parse(result.stdout);
    return {
      decision: parsed.closureDecision?.decision || "NEEDS_EVIDENCE",
      canCountAsDone: parsed.closureDecision?.canCountAsDone || "No",
      ref: "generated:resolve-closure-decision",
      digest: "N/A",
      durable: false,
      reason: parsed.closureDecision?.plainReason || parsed.humanSummary?.conclusion || "Unified Closure generated.",
    };
  } catch (error) {
    return {
      decision: "BLOCKED",
      canCountAsDone: "No",
      ref: "scripts/resolve-closure-decision.mjs",
      digest: "N/A",
      durable: false,
      reason: `Unified Closure JSON could not be parsed: ${error.message}`,
    };
  }
}

function collectLaunchInputs(root, options) {
  return [
    boundSurface(root, "Environment", options.environment || findEvidence(root, ["environment-baseline.md", "env", "runtime"]), "Runtime or environment evidence"),
    boundSurface(root, "Monitoring", options.monitoring || findEvidence(root, ["monitor", "observability", "sentry", "logging"]), "Failure observation evidence"),
    boundSurface(root, "Rollback", options.rollback || findEvidence(root, ["rollback", "recovery", "feature-flag"]), "Rollback, fallback, or feature-disable path"),
    ownerSurface("Release consent", options.releaseOwner, "Current-user consent reference for the concrete external release effect"),
    boundSurface(root, "Post-launch smoke", options.postLaunchSmoke || findEvidence(root, ["smoke", "post-launch", "verification"]), "Post-launch smoke or observation"),
  ];
}

function boundSurface(root, name, reference, finding) {
  if (!reference || reference === "N/A") return surface(name, "MISSING", "N/A", finding, "N/A");
  const resolved = resolveAuthoritativeEvidenceReference(root, "", reference);
  if (!resolved.ok) return surface(name, "MISSING", String(reference), `${finding}; evidence is unresolved or unsafe.`, "N/A");
  return surface(name, "PASS", resolved.relativePath, `${name} evidence resolves to a current project file.`, canonicalFileDigest(resolved.file));
}

function ownerSurface(name, reference, finding) {
  const value = String(reference || "").trim();
  if (value === "CURRENT_CONVERSATION_USER" || /^(?:human|team|role):[^\s]+$/i.test(value)) return surface(name, "PASS", value, `${name} identifies the specific confirmer of the real-world effect.`, "N/A");
  return surface(name, "MISSING", value || "N/A", finding, "N/A");
}

function chooseSafeLaunchLabel(closure, inputs) {
  if (closure.decision === "BLOCKED" || closure.decision === "NEEDS_HUMAN_DECISION") return "BLOCKED";
  if (closure.decision !== "DONE" || closure.canCountAsDone !== "Yes" || closure.durable !== true) return "NOT_READY";
  const required = ["Monitoring", "Rollback", "Release consent", "Post-launch smoke"];
  const missingRequired = inputs.some((item) => required.includes(item.surface) && item.status !== "PASS");
  if (!missingRequired) return "READY_FOR_RELEASE_REVIEW";
  const anyLaunchEvidence = inputs.some((item) => item.status === "PASS");
  return anyLaunchEvidence ? "READY_FOR_INTERNAL_HANDOFF" : "READY_FOR_DEMO";
}

function summaryFor(label, closure, inputs) {
  if (label === "BLOCKED") return `Unified Closure is ${closure.decision}; missing evidence, a business/external fact, or another blocker prevents launch review.`;
  if (label === "NOT_READY") return `Unified Closure is ${closure.decision}; the task/version is not closed enough for launch review.`;
  if (label === "READY_FOR_RELEASE_REVIEW") return "Unified Closure is DONE and required launch review surfaces have visible evidence. Human release approval is still outside IntentOS.";
  const missing = inputs.filter((item) => item.status !== "PASS").map((item) => item.surface).join(", ");
  return `Unified Closure is DONE, but launch review surfaces still need evidence: ${missing || "none"}.`;
}

function nextStepFor(label, closure, inputs) {
  if (label === "READY_FOR_RELEASE_REVIEW") return "Codex should prepare the exact release action, evidence, and rollback, then ask the current user to consent to that real-world effect.";
  if (closure.decision !== "DONE") return "Close the task with Unified Closure before launch review.";
  const missing = inputs.filter((item) => item.status !== "PASS").map((item) => item.surface);
  return `Record missing launch evidence before release review: ${missing.join(", ") || "none"}.`;
}

function recommendedNextStep(label, closure, inputs) {
  if (label === "READY_FOR_RELEASE_REVIEW") {
    return [
      "Codex prepares the exact release action and follows the project release SOP.",
      "Ask the current user only for consent to the concrete external effect, then execute only the approved scope and capture evidence.",
    ];
  }
  if (closure.decision !== "DONE") {
    return [
      "Resolve the Unified Closure result before launch review.",
      "Re-run launch-view after closure and verification evidence are recorded.",
    ];
  }
  return inputs
    .filter((item) => item.status !== "PASS")
    .map((item) => `Record ${item.surface}: ${item.finding}`);
}

function closureEffect(closure) {
  if (closure.decision === "DONE" && closure.canCountAsDone === "Yes") {
    return "Launch review may inspect launch surfaces, but release is not approved.";
  }
  return "Launch review cannot be ready until Unified Closure is DONE.";
}

function buildEvidenceMap(closure, inputs, options) {
  return [
    { evidence: "Unified Closure Decision", status: closure.decision === "DONE" ? "PASS" : "MISSING", ref: options.closureRef || closure.ref || "N/A" },
    { evidence: "Verification", status: statusFrom(options.verification), ref: options.verification || "N/A" },
    { evidence: "Safe Launch / Launch Readiness", status: options.safeLaunchRef ? "PASS" : "MISSING", ref: options.safeLaunchRef || "N/A" },
    ...inputs.map((item) => ({ evidence: item.surface, status: item.status, ref: item.evidence })),
  ];
}

function detectPlatform(root, explicitPlatform) {
  if (explicitPlatform) {
    return { platform: explicitPlatform, signals: "explicit --platform", platformBlocker: "None recorded." };
  }
  const paths = fs.existsSync(root) ? walkRelativePaths(root, ".", { maxDepth: 3, ignoredDirs: defaultIgnoredDirs }) : [];
  const joined = paths.join("\n").toLowerCase();
  if (/project\.config\.json|app\.json/.test(joined) && /miniprogram|微信|小程序/.test(joined)) {
    return { platform: "wechat-miniprogram", signals: "mini program config signals", platformBlocker: "Mini-program submission requires current-user consent to the concrete provider action." };
  }
  if (/xcodeproj|package\.swift|\.swift$/.test(joined)) {
    return { platform: "ios", signals: "iOS project signals", platformBlocker: "Signing and App Store submission require current-user consent and valid provider access." };
  }
  if (/build\.gradle|androidmanifest\.xml/.test(joined)) {
    return { platform: "android", signals: "Android project signals", platformBlocker: "Signing and Play Store submission require current-user consent and valid provider access." };
  }
  if (/package\.json|vite\.config|next\.config|src\/app/.test(joined)) {
    return { platform: "web", signals: "web project signals", platformBlocker: "Deploy target, environment, monitoring, and rollback evidence must be ready before requesting production consent." };
  }
  return { platform: "generic", signals: paths.length > 0 ? "generic project files" : "N/A", platformBlocker: "The concrete platform action and rollback must be known before requesting real-world consent." };
}

function findEvidence(root, needles) {
  if (!fs.existsSync(root)) return "N/A";
  const paths = walkRelativePaths(root, ".", { maxDepth: 5, ignoredDirs: defaultIgnoredDirs });
  const found = paths.find((item) => needles.some((needle) => item.toLowerCase().includes(String(needle).toLowerCase())));
  return found || "N/A";
}

function surface(surfaceName, status, evidence, finding, digest = "N/A") {
  return {
    surface: surfaceName,
    status,
    evidence: evidence || "N/A",
    digest,
    finding: status === "PASS" ? finding : `${finding} is not confirmed.`,
  };
}

function statusFrom(value) {
  const text = String(value || "").trim();
  if (!text) return "MISSING";
  if (/\b(n\/a|not applicable|none)\b/i.test(text)) return "N/A";
  if (/\b(pending|missing|todo|unknown)\b|待确认|缺失/i.test(text)) return "MISSING";
  return "PASS";
}

function resolveRef(root, ref) {
  if (!ref) return "";
  const full = path.resolve(root, ref);
  if (!full.startsWith(root)) return "";
  return fs.existsSync(full) ? path.relative(root, full).replaceAll(path.sep, "/") : "";
}

function tableValue(content, field) {
  const escaped = field.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = content.match(new RegExp(`\\|\\s*${escaped}\\s*\\|\\s*([^|]+?)\\s*\\|`, "i"));
  return match ? strip(match[1]) : "";
}

function strip(value) {
  return String(value || "").replace(/`/g, "").trim();
}

function surfaceKey(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

function firstUsefulLine(value) {
  return String(value || "").split(/\r?\n/).map((line) => line.trim()).find((line) => /^FAIL\b/i.test(line))
    || String(value || "").split(/\r?\n/).map((line) => line.trim()).find(Boolean)
    || "checker failed";
}

function stringArg(name) {
  const value = args[name];
  return typeof value === "string" ? value.trim() : "";
}

function printHuman(report) {
  console.log("# Launch Review View");
  console.log("");
  console.log("## Human Summary");
  console.log("");
  console.log(`Launch review view: ${report.humanSummary.launchReviewView}`);
  console.log("");
  console.log(`Why: ${report.humanSummary.why}`);
  console.log("");
  console.log(`Safe next step: ${report.humanSummary.safeNextStep}`);
  console.log("");
  console.log("## Unified Closure Input");
  console.log("");
  console.log("| Field | Value |");
  console.log("|---|---|");
  console.log(`| Closure Decision | \`${report.unifiedClosureInput.closureDecision}\` |`);
  console.log(`| Can count as done | ${report.unifiedClosureInput.canCountAsDone} |`);
  console.log(`| Ref | ${report.unifiedClosureInput.ref} |`);
  console.log(`| Effect | ${report.unifiedClosureInput.effect} |`);
  console.log("");
  console.log("## Safe Launch View");
  console.log("");
  console.log("| Field | Value |");
  console.log("|---|---|");
  console.log(`| Safe Launch Label | \`${report.safeLaunchView.safeLaunchLabel}\` |`);
  console.log(`| Launch review can proceed | ${report.safeLaunchView.launchReviewCanProceed} |`);
  console.log(`| Release approval | ${report.safeLaunchView.releaseApproval} |`);
  console.log(`| Plain reason | ${report.safeLaunchView.plainReason} |`);
  console.log("");
  console.log("## Platform View");
  console.log("");
  console.log("| Field | Value |");
  console.log("|---|---|");
  console.log(`| Platform | \`${report.platformView.platform}\` |`);
  console.log(`| Signals | ${report.platformView.signals} |`);
  console.log(`| Platform blocker | ${report.platformView.platformBlocker} |`);
  console.log("");
  console.log("## Launch Surface Gaps");
  console.log("");
  console.log("| Surface | Status | Evidence / Decision | Finding |");
  console.log("|---|---|---|---|");
  for (const item of report.launchSurfaceGaps) {
    console.log(`| ${item.surface} | \`${item.status}\` | ${item.evidence} | ${item.finding} |`);
  }
  console.log("");
  console.log("## Human Release Decisions");
  console.log("");
  console.log("| Decision | Status | Owner / Ref | Notes |");
  console.log("|---|---|---|---|");
  for (const item of report.humanReleaseDecisions) {
    console.log(`| ${item.decision} | \`${item.status}\` | ${item.ownerOrRef} | ${item.notes} |`);
  }
  console.log("");
  console.log("## Evidence Map");
  console.log("");
  console.log("| Evidence | Status | Ref |");
  console.log("|---|---|---|");
  for (const item of report.evidenceMap) {
    console.log(`| ${item.evidence} | \`${item.status}\` | ${item.ref} |`);
  }
  console.log("");
  console.log("## Recommended Next Step");
  console.log("");
  report.recommendedNextStep.forEach((item, index) => console.log(`${index + 1}. ${item}`));
  console.log("");
  console.log("## Boundaries");
  console.log("");
  console.log(`- This view writes target files: ${report.boundaries.writesTargetFiles}`);
  console.log(`- This view deploys, publishes, or submits release: ${report.boundaries.deploysPublishesOrSubmitsRelease}`);
  console.log(`- This view approves release or production: ${report.boundaries.approvesReleaseOrProduction}`);
  console.log(`- This view modifies CI/CD or hooks: ${report.boundaries.modifiesCiOrHooks}`);
  console.log(`- This view changes production config, secrets, DNS, app-store state, payment, permissions, or migrations: ${report.boundaries.changesProductionConfigSecretsDnsAppStorePaymentPermissionsOrMigrations}`);
  console.log(`- This view replaces Unified Closure: ${report.boundaries.replacesUnifiedClosure}`);
  console.log(`- This view replaces Safe Launch: ${report.boundaries.replacesSafeLaunch}`);
  console.log(`- This view replaces project release SOPs: ${report.boundaries.replacesProjectReleaseSops}`);
  console.log(`- This view approves security/privacy/compliance/legal/tax/finance/payment decisions: ${report.boundaries.approvesHighRiskDecisions}`);
  console.log("");
  console.log("## Outcome");
  console.log("");
  console.log(`\`${report.outcome}\``);
  console.log("");
  console.log("## Machine-Readable Evidence");
  console.log("");
  console.log("```json");
  console.log(JSON.stringify(report.machineEvidence, null, 2));
  console.log("```");
}
