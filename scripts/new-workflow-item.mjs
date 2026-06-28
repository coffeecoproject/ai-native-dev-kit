#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { addFrontmatter } from "./lib/frontmatter.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const typeMap = {
  request: { dir: "requests", template: "request-card.md" },
  preflight: { dir: "preflight", template: "preflight-report.md" },
  spec: { dir: "specs", template: "spec.md" },
  eval: { dir: "evals", template: "eval.md" },
  task: { dir: "tasks", template: "task-card.md" },
  log: { dir: "ai-logs", template: "ai-task-log.md" },
  "review-packet": { dir: "review-packets", template: "review-packet.md", defaultName: "review-packet" },
  "review-loop-report": { dir: "review-loop-reports", template: "review-loop-report.md", defaultName: "review-loop-report" },
  "gpt-review-prompt": { dir: "gpt-review-prompts", template: "gpt-review-prompt.md", defaultName: "gpt-review-prompt" },
  "adoption-assessment": { dir: ".ai-native/adoption", template: "adoption-assessment.md", defaultName: "adoption-assessment" },
  "governance-map": { dir: ".ai-native/adoption", template: "existing-governance-map.md", defaultName: "existing-governance-map" },
  "human-status-report": { dir: "status-reports", template: "human-status-report.md", defaultName: "status-report" },
  "decision-brief": { dir: "decision-briefs", template: "decision-brief.md", defaultName: "decision-brief" },
  "plain-review-summary": { dir: "review-summaries", template: "plain-review-summary.md", defaultName: "review-summary" },
  "customer-handoff": { dir: "customer-handoffs", template: "customer-handoff.md", defaultName: "customer-handoff" },
  "follow-up-proposal": { dir: "follow-up-proposals", template: "follow-up-proposal.md", defaultName: "follow-up-proposal" },
  "final-report": { dir: "final-reports", template: "final-report.md", defaultName: "final-report" },
  "goal-card": { dir: "goal-cards", template: "goal-card.md", defaultName: "goal" },
  "subagent-run-plan": { dir: "subagent-run-plans", template: "subagent-run-plan.md", defaultName: "subagent-run-plan" },
  "launch-readiness-report": { dir: "launch-readiness", template: "launch-readiness-report.md", defaultName: "launch-readiness" },
  "conversation-turn-classification": { dir: "conversation-turns", template: "conversation-turn-classification.md", defaultName: "conversation-turn" },
  "scope-change-report": { dir: "scope-change-reports", template: "scope-change-report.md", defaultName: "scope-change" },
  "adoption-trial-report": { dir: "adoption-trial-reports", template: "adoption-trial-report.md", defaultName: "adoption-trial" },
  "real-adoption-trial-report": { dir: "real-adoption-trials", template: "real-adoption-trial-report.md", defaultName: "real-adoption-trial" },
  "patch-classification": { dir: "patch-classifications", template: "patch-classification-report.md", defaultName: "patch-classification" },
  "patch-classification-false-positive": { dir: "patch-classification-false-positives", template: "patch-classification-false-positive.md", defaultName: "patch-classification-false-positive" },
  "active-work-thread": { dir: "active-work-threads", template: "active-work-thread.md", defaultName: "active-work-thread" },
  "guided-decision-summary": { dir: "guided-decision-summaries", template: "guided-decision-summary.md", defaultName: "guided-decision" },
  "change-boundary-report": { dir: "change-boundary-reports", template: "change-boundary-report.md", defaultName: "change-boundary" },
  "baseline-state-report": { dir: "baseline-state-reports", template: "baseline-state-report.md", defaultName: "baseline-state" },
};

const aliases = {
  "ai-log": "log",
  ailog: "log",
  review: "review-packet",
  reviewpacket: "review-packet",
  "review-packets": "review-packet",
  "review-loop": "review-loop-report",
  reviewloop: "review-loop-report",
  reviewloopreport: "review-loop-report",
  "review-loop-reports": "review-loop-report",
  "gpt-review": "gpt-review-prompt",
  gptreview: "gpt-review-prompt",
  gptprompt: "gpt-review-prompt",
  "gpt-review-prompts": "gpt-review-prompt",
  adoption: "adoption-assessment",
  assessment: "adoption-assessment",
  "existing-governance-map": "governance-map",
  status: "human-status-report",
  "status-report": "human-status-report",
  humanstatus: "human-status-report",
  "human-status": "human-status-report",
  decision: "decision-brief",
  "human-decision": "decision-brief",
  "review-summary": "plain-review-summary",
  reviewsummary: "plain-review-summary",
  handoff: "customer-handoff",
  "customer-summary": "customer-handoff",
  followup: "follow-up-proposal",
  "follow-up": "follow-up-proposal",
  proposal: "follow-up-proposal",
  final: "final-report",
  report: "final-report",
  finalreport: "final-report",
  goal: "goal-card",
  goalcard: "goal-card",
  route: "goal-card",
  "goal-mode": "goal-card",
  subagent: "subagent-run-plan",
  subagents: "subagent-run-plan",
  "subagent-run": "subagent-run-plan",
  "subagent-plan": "subagent-run-plan",
  "run-plan": "subagent-run-plan",
  orchestration: "subagent-run-plan",
  launch: "launch-readiness-report",
  "launch-readiness": "launch-readiness-report",
  readiness: "launch-readiness-report",
  "readiness-report": "launch-readiness-report",
  "conversation-turn": "conversation-turn-classification",
  "conversation-drift": "conversation-turn-classification",
  "turn-classification": "conversation-turn-classification",
  "scope-change": "scope-change-report",
  scopechange: "scope-change-report",
  "first-delivery": "adoption-trial-report",
  walkthrough: "adoption-trial-report",
  "adoption-trial": "adoption-trial-report",
  "adoption-evidence": "adoption-trial-report",
  trial: "adoption-trial-report",
  "real-adoption": "real-adoption-trial-report",
  "real-adoption-trial": "real-adoption-trial-report",
  "real-trial": "real-adoption-trial-report",
  "patch-classification-report": "patch-classification",
  "patch-classifier": "patch-classification",
  "repair-classification": "patch-classification",
  "repair-scale": "patch-classification",
  "patch-false-positive": "patch-classification-false-positive",
  "false-positive": "patch-classification-false-positive",
  "risk-surface-calibration": "patch-classification-false-positive",
  "work-thread": "active-work-thread",
  "active-thread": "active-work-thread",
  "mainline": "active-work-thread",
  parking: "active-work-thread",
  "guided-decision": "guided-decision-summary",
  "decision-summary": "guided-decision-summary",
  "delivery-decision": "guided-decision-summary",
  "decision-delegation": "guided-decision-summary",
  "change-boundary": "change-boundary-report",
  "diff-boundary": "change-boundary-report",
  "boundary-report": "change-boundary-report",
  "baseline-state": "baseline-state-report",
  "baseline-state-review": "baseline-state-report",
  "no-code-baseline": "baseline-state-report",
};

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (!item.startsWith("--")) continue;
    const key = item.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
    } else {
      args[key] = next;
      i += 1;
    }
  }
  return args;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function usage() {
  console.error("Usage:");
  console.error("  node scripts/new-workflow-item.mjs --type request --name first-slice");
  console.error("  node scripts/new-workflow-item.mjs --type preflight --from requests/001-first-slice.md");
  console.error("  node scripts/new-workflow-item.mjs --type spec --request requests/001-first-slice.md --preflight preflight/001-first-slice.md");
  console.error("  node scripts/new-workflow-item.mjs --type eval --spec specs/001-first-slice.md");
  console.error("  node scripts/new-workflow-item.mjs --type task --spec specs/001-first-slice.md --eval evals/001-first-slice.md --level L1");
  console.error("  node scripts/new-workflow-item.mjs --type ai-log --task tasks/001-first-slice.md");
  console.error("  node scripts/new-workflow-item.mjs --type review-packet --task tasks/001-first-slice.md");
  console.error("  node scripts/new-workflow-item.mjs --type gpt-review-prompt --task tasks/001-first-slice.md");
  console.error("  node scripts/new-workflow-item.mjs --type review-loop-report --task tasks/001-first-slice.md");
  console.error("  node scripts/new-workflow-item.mjs --type adoption-assessment --name existing-project");
  console.error("  node scripts/new-workflow-item.mjs --type governance-map --name existing-project");
  console.error("  node scripts/new-workflow-item.mjs --type human-status-report --name workflow-next");
  console.error("  node scripts/new-workflow-item.mjs --type decision-brief --name baseline-selection");
  console.error("  node scripts/new-workflow-item.mjs --type plain-review-summary --task tasks/001-first-slice.md");
  console.error("  node scripts/new-workflow-item.mjs --type customer-handoff --name release-001");
  console.error("  node scripts/new-workflow-item.mjs --type follow-up-proposal --task tasks/001-first-slice.md");
  console.error("  node scripts/new-workflow-item.mjs --type final-report --task tasks/001-first-slice.md");
  console.error("  node scripts/new-workflow-item.mjs --type goal-card --name first-slice --goal-mode DEFINE_WORK");
  console.error("  node scripts/new-workflow-item.mjs --type subagent-run-plan --name first-slice --subagent-mode READ_ONLY_RESEARCH");
  console.error("  node scripts/new-workflow-item.mjs --type launch-readiness-report --name first-slice");
  console.error("  node scripts/new-workflow-item.mjs --type conversation-turn-classification --name user-scope-change");
  console.error("  node scripts/new-workflow-item.mjs --type scope-change-report --name add-payments");
  console.error("  node scripts/new-workflow-item.mjs --type adoption-trial-report --name first-slice");
  console.error("  node scripts/new-workflow-item.mjs --type real-adoption-trial-report --name governed-web-readonly");
  console.error("  node scripts/new-workflow-item.mjs --type patch-classification --name governed-web-repair-scale");
  console.error("  node scripts/new-workflow-item.mjs --type active-work-thread --name first-slice");
  console.error("  node scripts/new-workflow-item.mjs --type guided-decision-summary --name status-model");
  console.error("  node scripts/new-workflow-item.mjs --type change-boundary-report --name task-scope");
  console.error("  node scripts/new-workflow-item.mjs --type baseline-state-report --name no-code-baseline");
}

function fail(message) {
  console.error(`FAIL ${message}`);
  process.exit(1);
}

function localDate() {
  const now = new Date();
  const year = String(now.getFullYear()).padStart(4, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function slugify(value) {
  const slug = String(value || "")
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "workflow-item";
}

function titleFromSlug(slug) {
  return slug.replace(/-/g, " ");
}

function parseNameFromPath(filePath) {
  const base = path.basename(filePath, path.extname(filePath));
  const match = base.match(/^(\d+)-(.+)$/);
  return match ? match[2] : base;
}

function numberFromPath(filePath) {
  const base = path.basename(filePath);
  const match = base.match(/^(\d+)-/);
  return match ? match[1] : null;
}

function nextNumber(root, dir) {
  const fullDir = path.join(root, dir);
  if (!fs.existsSync(fullDir)) return "001";
  let max = 0;
  for (const file of fs.readdirSync(fullDir)) {
    const match = file.match(/^(\d+)-.+\.md$/);
    if (match) max = Math.max(max, Number(match[1]));
  }
  return String(max + 1).padStart(3, "0");
}

function resolveRef(root, value, label) {
  if (!value) return null;
  const full = path.resolve(root, value);
  if (!fs.existsSync(full)) fail(`${label} does not exist: ${value}`);
  return path.relative(root, full).replaceAll(path.sep, "/");
}

function templatePath(root, templateName) {
  const candidates = [
    path.join(root, ".ai-native", "templates", templateName),
    path.join(root, "templates", templateName),
    path.resolve(__dirname, "..", "templates", templateName),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  fail(`template not found: ${templateName}`);
}

function readTemplate(root, templateName) {
  return fs.readFileSync(templatePath(root, templateName), "utf8");
}

function readCurrentDevKitVersion(root) {
  const candidates = [
    path.join(root, ".ai-native", "version.json"),
    path.resolve(__dirname, "..", "VERSION.md"),
  ];
  for (const candidate of candidates) {
    if (!fs.existsSync(candidate)) continue;
    const content = fs.readFileSync(candidate, "utf8");
    if (candidate.endsWith(".json")) {
      try {
        const parsed = JSON.parse(content);
        if (parsed.devKitVersion) return parsed.devKitVersion;
      } catch {
        continue;
      }
    }
    const match = content.match(/Current version:\s*`([^`]+)`/);
    if (match) return match[1];
  }
  return "0.0.0";
}

function sectionRange(content, heading) {
  const match = content.match(new RegExp(`^## ${escapeRegExp(heading)}\\s*$`, "m"));
  if (!match) return null;
  const start = match.index;
  const lineEnd = content.indexOf("\n", start);
  const bodyStart = lineEnd === -1 ? content.length : lineEnd + 1;
  const next = content.slice(bodyStart).search(/^## /m);
  const bodyEnd = next === -1 ? content.length : bodyStart + next;
  return { bodyStart, bodyEnd };
}

function setSection(content, heading, body) {
  const range = sectionRange(content, heading);
  if (!range) return content;
  const replacement = `\n${body.trim()}\n\n`;
  return `${content.slice(0, range.bodyStart)}${replacement}${content.slice(range.bodyEnd).replace(/^\n+/, "")}`;
}

function sectionBody(content, heading) {
  const range = sectionRange(content, heading);
  if (!range) return "";
  return content.slice(range.bodyStart, range.bodyEnd).trim();
}

function insertSectionBefore(content, heading, newHeading, body) {
  const match = content.match(new RegExp(`^## ${escapeRegExp(heading)}\\s*$`, "m"));
  const index = match ? match.index : -1;
  if (index === -1) return `${content.trimEnd()}\n\n## ${newHeading}\n\n${body.trim()}\n`;
  return `${content.slice(0, index)}## ${newHeading}\n\n${body.trim()}\n\n${content.slice(index)}`;
}

function setTitle(content, title) {
  return content.replace(/^# .+$/m, title);
}

function refLine(label, ref) {
  return ref ? `- ${label}: \`${ref}\`` : `- ${label}: not used`;
}

function firstMarkdownRef(value) {
  const codeRef = String(value || "").match(/`([^`]+\.md)`/);
  if (codeRef) return codeRef[1];
  const plainRef = String(value || "").match(/\b(?:requests|preflight|specs|evals|tasks|ai-logs|review-packets|review-loop-reports|gpt-review-prompts|follow-up-proposals|final-reports)\/[^\s`|)]+\.md\b/);
  return plainRef ? plainRef[0] : null;
}

function firstMarkdownRefFromSections(content, headings) {
  for (const heading of headings) {
    const ref = firstMarkdownRef(sectionBody(content, heading));
    if (ref) return ref;
  }
  return null;
}

function normalizeInferredRef(root, ref, baseDir) {
  if (!ref) return null;
  if (fs.existsSync(path.join(root, ref))) return ref.replaceAll(path.sep, "/");
  const bases = [baseDir, path.dirname(baseDir || ".")].filter(Boolean);
  for (const base of bases) {
    const candidate = path.relative(root, path.resolve(root, base, ref)).replaceAll(path.sep, "/");
    if (fs.existsSync(path.join(root, candidate))) return candidate;
  }
  return ref.replaceAll(path.sep, "/");
}

function firstNonEmptyLine(value) {
  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .find(Boolean) || "";
}

function inferRefsFromTask(root, current) {
  const inferred = { ...current };
  if (inferred.taskRef) {
    const taskPath = path.join(root, inferred.taskRef);
    if (fs.existsSync(taskPath)) {
      const taskContent = fs.readFileSync(taskPath, "utf8");
      const taskBaseDir = path.dirname(inferred.taskRef);
      inferred.specRef ||= normalizeInferredRef(root, firstMarkdownRefFromSections(taskContent, ["Related Spec", "Spec"]), taskBaseDir);
      inferred.evalRef ||= normalizeInferredRef(root, firstMarkdownRefFromSections(taskContent, ["Related Eval", "Eval"]), taskBaseDir);
      inferred.level ||= firstNonEmptyLine(sectionBody(taskContent, "Task Level")).replace(/^Task Level:\s*/i, "");
    }
  }
  if (inferred.specRef) {
    const specPath = path.join(root, inferred.specRef);
    if (fs.existsSync(specPath)) {
      const specContent = fs.readFileSync(specPath, "utf8");
      const sourceBody = sectionBody(specContent, "Source");
      const specBaseDir = path.dirname(inferred.specRef);
      inferred.requestRef ||= normalizeInferredRef(root, firstMarkdownRef(sourceBody.match(/Request[^\n]*/i)?.[0] || sourceBody), specBaseDir);
      inferred.preflightRef ||= normalizeInferredRef(root, firstMarkdownRef(sourceBody.match(/Preflight[^\n]*/i)?.[0] || sourceBody), specBaseDir);
    }
  }
  return inferred;
}

function siblingArtifactRef(root, dir, number, slug) {
  const rel = `${dir}/${number}-${slug}.md`;
  return fs.existsSync(path.join(root, rel)) ? rel : null;
}

function writeArtifact(root, dir, filename, content) {
  const targetDir = path.join(root, dir);
  fs.mkdirSync(targetDir, { recursive: true });
  const target = path.join(targetDir, filename);
  if (fs.existsSync(target)) fail(`target already exists: ${path.relative(root, target)}`);
  fs.writeFileSync(target, `${content.trimEnd()}\n`);
  return path.relative(root, target).replaceAll(path.sep, "/");
}

function fillRequest(content, context) {
  let output = setTitle(content, `# Request: ${context.number}-${context.slug}`);
  output = setSection(output, "Raw Request", "原始需求：\n\n<fill from conversation>");
  output = setSection(output, "Priority", context.priority || "P1");
  output = setSection(output, "Suggested Task Level", context.level || "L1");
  return output;
}

function fillPreflight(content, context) {
  let output = setTitle(content, `# Preflight: ${context.number}-${context.slug}`);
  output = setSection(output, "Source Request", `\`${context.requestRef}\``);
  output = setSection(output, "Clarity", "PARTIAL");
  output = setSection(output, "Suggested Task Level", context.level || "L1");
  output = setSection(output, "Decision", "NEEDS_CLARIFICATION");
  return output;
}

function fillSpec(content, context) {
  let output = setTitle(content, `# Spec ${context.number}: ${context.title}`);
  output = setSection(output, "Status", "Draft");
  const sourceBody = [
    refLine("Request", context.requestRef),
    refLine("Preflight", context.preflightRef),
  ].join("\n");
  output = sectionRange(output, "Source")
    ? setSection(output, "Source", sourceBody)
    : insertSectionBefore(output, "Problem", "Source", sourceBody);
  return output;
}

function fillEval(content, context) {
  let output = setTitle(content, `# Eval: ${context.title}`);
  output = setSection(output, "Related Spec", `\`${context.specRef}\``);
  return output;
}

function fillTask(content, context) {
  let output = setTitle(content, `# Task ${context.number}: ${context.title}`);
  output = setSection(output, "Task Level", context.level || "L1");
  output = setSection(output, "Related Spec", `\`${context.specRef}\``);
  output = setSection(output, "Related Eval", `\`${context.evalRef}\``);
  output = setSection(output, "Goal", `Implement one narrow change for ${context.title}.`);
  output = setSection(
    output,
    "AI Budget",
    [
      "Max agent runs: 1",
      "Max repair runs: 1",
      `Use high reasoning model: ${(context.level || "L1") === "L2" || (context.level || "L1") === "L3" ? "Yes" : "No"}`,
      "Stop if: acceptance criteria, scope, or risk boundary becomes unclear.",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Human Approval",
    [
      "Required: No",
      "Status: Not Required",
      "Approval scope: Not Required",
      "Approved by:",
      "Approved at:",
      "Approval notes:",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Final Report Required",
    [
      "- Completed",
      "- Verified",
      "- Not Changed",
      "- Risks Remaining",
      "- Next-Step Suggestions",
      "- Human Decisions Needed",
      "- Next Safe Action",
      "",
      "Next-Step Suggestions must use:",
      "",
      "| ID | Type | Suggestion | Relation to current task | Can AI do now? | Required entry | Risk / approval |",
      "|---|---|---|---|---|---|---|",
      "| N1 | IN_SCOPE_NEXT_STEP / DIRECT_FOLLOW_UP / RISK_DECISION / OUT_OF_SCOPE_OBSERVATION / DO_NOT_PROCEED |  |  | Yes / No | current task / new request / follow-up proposal / human decision / do not proceed |  |",
    ].join("\n"),
  );
  return output;
}

function fillLog(content, context) {
  let output = setTitle(content, `# AI Task Log: ${context.date}-${context.slug}`);
  output = setSection(output, "Human Summary", `One-sentence conclusion:\n\nTask log for ${context.title}.`);
  output = setSection(
    output,
    "Decision Needed",
    [
      "Does this task result require human decision before follow-up work: Yes / No",
      "",
      "Decision:",
    ].join("\n"),
  );
  output = setSection(output, "Next Safe Step", "Next action:");
  output = setSection(output, "Task", `\`${context.taskRef}\``);
  output = setSection(output, "Agent / Tool", context.agent || "Codex");
  output = setSection(
    output,
    "Runs",
    [
      "- Preflight: 0",
      "- Implementation: 1",
      "- Review: 0",
      "- Repair: 0",
    ].join("\n"),
  );
  return output;
}

function fillReviewPacket(content, context) {
  let output = setTitle(content, `# Review Packet: ${context.number}-${context.slug}`);
  output = setSection(
    output,
    "Packet Status",
    [
      "Status: DRAFT",
      "",
      `Prepared by: ${context.agent || "Codex"}`,
      "",
      `Prepared at: ${context.date}`,
      "",
      "Reviewer:",
      "",
      context.taskRef ? `Review target: \`${context.taskRef}\`` : "Review target:",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Source Artifacts",
    [
      "| Artifact | Path | Status | Notes |",
      "|---|---|---|---|",
      `| Request | ${context.requestRef ? `\`${context.requestRef}\`` : ""} |  |  |`,
      `| Preflight | ${context.preflightRef ? `\`${context.preflightRef}\`` : ""} |  |  |`,
      `| Spec | ${context.specRef ? `\`${context.specRef}\`` : ""} |  |  |`,
      `| Eval | ${context.evalRef ? `\`${context.evalRef}\`` : ""} |  |  |`,
      `| Task | ${context.taskRef ? `\`${context.taskRef}\`` : ""} |  |  |`,
      `| AI task log | ${context.logRef ? `\`${context.logRef}\`` : ""} |  |  |`,
      "| Release evidence |  |  |  |",
    ].join("\n"),
  );
  return output;
}

function reviewRequiredForLevel(level) {
  const normalized = String(level || "L1").trim().toUpperCase();
  return normalized === "L2" || normalized === "L3";
}

function fillReviewLoopReport(content, context) {
  const level = context.level || "L1";
  const reviewRequired = reviewRequiredForLevel(level) ? "Yes" : "No";
  const reason = reviewRequired === "Yes"
    ? `${level} work requires a Review Packet and at least one read-only reviewer pass.`
    : `${level} work does not require Review Loop unless the human or task risk asks for it.`;
  let output = setTitle(content, `# Review Loop Report: ${context.number}-${context.slug}`);
  output = setSection(
    output,
    "Human Summary",
    [
      "One-sentence conclusion:",
      "",
      `${context.title} review loop is open. Review findings decide whether AI may auto-fix, must stop, or needs human decision.`,
    ].join("\n"),
  );
  output = setSection(
    output,
    "Decision Needed",
    [
      "Does this review require human decision before AI continues: Yes / No",
      "",
      "Decision:",
    ].join("\n"),
  );
  output = setSection(output, "Next Safe Step", "Next action: Record reviewer findings before any AUTO_FIX attempt.");
  output = setSection(
    output,
    "Status",
    [
      context.taskRef ? `Task: \`${context.taskRef}\`` : "Task:",
      "",
      context.specRef ? `Related Spec: \`${context.specRef}\`` : "Related Spec:",
      "",
      context.evalRef ? `Related Eval: \`${context.evalRef}\`` : "Related Eval:",
      "",
      `Task Level: ${level}`,
      "",
      `Review required: ${reviewRequired}`,
      "",
      `Reason: ${reason}`,
      "",
      "Current round: 0",
      "",
      "Max auto-fix rounds: 2",
      "",
      "Final status: OPEN",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Review Packet",
    [
      context.reviewPacketRef ? `Review Packet ref: \`${context.reviewPacketRef}\`` : "Review Packet ref:",
      "",
      context.gptReviewPromptRef ? `GPT Review Prompt ref: \`${context.gptReviewPromptRef}\`` : "GPT Review Prompt ref:",
      "",
      context.taskRef ? `Task: \`${context.taskRef}\`` : "Task:",
      "",
      context.specRef ? `Spec: \`${context.specRef}\`` : "Spec:",
      "",
      context.evalRef ? `Eval: \`${context.evalRef}\`` : "Eval:",
      "",
      "Risk Gate:",
      "",
      "Risk Gate Exclusions:",
      "",
      "Human Approval:",
      "",
      "Baseline state:",
      "",
      "Industrial baseline state:",
      "",
      "Changed files:",
      "",
      "Commands run:",
      "",
      "Evidence refs:",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Next-Step Suggestions",
    [
      "Suggestions are bounded follow-up items after the current task. They are not review findings and are not approval to continue.",
      "",
      "| ID | Type | Suggestion | Relation to current task | Can AI do now? | Required entry | Risk / approval |",
      "|---|---|---|---|---|---|---|",
      "| N1 | IN_SCOPE_NEXT_STEP / DIRECT_FOLLOW_UP / RISK_DECISION / OUT_OF_SCOPE_OBSERVATION / DO_NOT_PROCEED |  |  | Yes / No | current task / new request / follow-up proposal / human decision / do not proceed |  |",
    ].join("\n"),
  );
  return output;
}

function fillGptReviewPrompt(content, context) {
  let output = setTitle(content, `# GPT Review Prompt: ${context.number}-${context.slug}`);
  output = setSection(
    output,
    "Review Packet Ref",
    [
      context.reviewPacketRef ? `Review Packet: \`${context.reviewPacketRef}\`` : "Review Packet:",
      "",
      context.taskRef ? `Task: \`${context.taskRef}\`` : "Task:",
      "",
      context.specRef ? `Spec: \`${context.specRef}\`` : "Spec:",
      "",
      context.evalRef ? `Eval: \`${context.evalRef}\`` : "Eval:",
      "",
      `Task Level: ${context.level || "L1"}`,
    ].join("\n"),
  );
  return output;
}

function fillAdoptionAssessment(content, context) {
  let output = setTitle(content, `# Existing Governed Project Adoption Assessment: ${context.slug}`);
  output = setSection(
    output,
    "Human Summary",
    [
      "One-sentence conclusion:",
      "",
      "This is a read-only assessment. It does not approve workflow setup or project writes.",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Decision Needed",
    "Should AI stay read-only, write adapter docs, or proceed to workflow asset setup after approval:",
  );
  output = setSection(output, "Next Safe Step", "Next action: Map existing governance before proposing any writes.");
  output = setSection(
    output,
    "Assessment Status",
    [
      "Mode: READ_ONLY",
      "",
      `Prepared by: ${context.agent || "Codex"}`,
      "",
      `Prepared at: ${context.date}`,
      "",
      `Target project: ${context.projectRoot}`,
      "",
      "Dev-kit version:",
    ].join("\n"),
  );
  return output;
}

function fillGovernanceMap(content, context) {
  let output = setTitle(content, `# Existing Governance Map: ${context.slug}`);
  output = setSection(
    output,
    "Mapping Status",
    [
      "Status: DRAFT",
      "",
      "Owner:",
      "",
      `Reviewed at: ${context.date}`,
    ].join("\n"),
  );
  return output;
}

function fillHumanStatusReport(content, context) {
  let output = setTitle(content, `# Human Status Report: ${context.number}-${context.slug}`);
  output = setSection(
    output,
    "Human Summary",
    [
      "One-sentence conclusion:",
      "",
      `Status report for ${context.title}.`,
    ].join("\n"),
  );
  output = setSection(
    output,
    "Technical Details",
    [
      "State fields:",
      "",
      "```text",
      context.taskRef ? `TASK: ${context.taskRef}` : "TASK:",
      context.specRef ? `SPEC: ${context.specRef}` : "SPEC:",
      context.evalRef ? `EVAL: ${context.evalRef}` : "EVAL:",
      "```",
      "",
      "Files / paths:",
      "",
      context.taskRef ? `- \`${context.taskRef}\`` : "- ",
      context.specRef ? `- \`${context.specRef}\`` : "- ",
      context.evalRef ? `- \`${context.evalRef}\`` : "- ",
      "",
      "Commands run:",
      "",
      "```text",
      "",
      "```",
    ].join("\n"),
  );
  return output;
}

function fillDecisionBrief(content, context) {
  let output = setTitle(content, `# Decision Brief: ${context.number}-${context.slug}`);
  output = setSection(
    output,
    "Decision Needed",
    [
      "Question:",
      "",
      "Owner: human",
      "",
      "Decision deadline, if any:",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Technical Basis",
    [
      "Related files:",
      "",
      context.taskRef ? `- \`${context.taskRef}\`` : "- ",
      context.specRef ? `- \`${context.specRef}\`` : "- ",
      context.evalRef ? `- \`${context.evalRef}\`` : "- ",
      "",
      "Related checks:",
      "",
      "```text",
      "",
      "```",
      "",
      "Related workflow fields:",
      "",
      "```text",
      "",
      "```",
    ].join("\n"),
  );
  return output;
}

function fillPlainReviewSummary(content, context) {
  let output = setTitle(content, `# Review Summary: ${context.number}-${context.slug}`);
  output = setSection(
    output,
    "Technical Review Details",
    [
      context.reviewPacketRef ? `Review Packet: \`${context.reviewPacketRef}\`` : "Review Packet:",
      "",
      context.reviewLoopReportRef ? `Review Loop Report: \`${context.reviewLoopReportRef}\`` : "Review Loop Report:",
      "",
      "Reviewer:",
      "",
      "Commands run:",
      "",
      "```text",
      "",
      "```",
      "",
      "Findings table:",
      "",
      "| ID | Severity | Category | Status | Evidence |",
      "|---|---|---|---|---|",
      "|  | P0 / P1 / P2 | AUTO_FIX / NEEDS_HUMAN_DECISION / NEEDS_CLARIFICATION / NO_ACTION |  |  |",
    ].join("\n"),
  );
  return output;
}

function fillCustomerHandoff(content, context) {
  let output = setTitle(content, `# Customer Handoff Summary: ${context.number}-${context.slug}`);
  output = setSection(
    output,
    "Technical Details",
    [
      context.taskRef ? `Related task: \`${context.taskRef}\`` : "Related task:",
      "",
      "Related release record:",
      "",
      "Related evidence:",
      "",
      "- ",
      "",
      "Commands run:",
      "",
      "```text",
      "",
      "```",
    ].join("\n"),
  );
  return output;
}

function fillFollowUpProposal(content, context) {
  let output = setTitle(content, `# Follow-up Proposal: ${context.number}-${context.slug}`);
  output = setSection(
    output,
    "Source",
    [
      context.taskRef ? `Related task: \`${context.taskRef}\`` : "Related task:",
      "",
      context.reviewLoopReportRef ? `Related review loop: \`${context.reviewLoopReportRef}\`` : "Related review loop:",
      "",
      context.logRef ? `Related AI task log: \`${context.logRef}\`` : "Related AI task log:",
      "",
      context.finalReportRef ? `Related final report: \`${context.finalReportRef}\`` : "Related final report:",
    ].join("\n"),
  );
  output = setSection(output, "Type", "DIRECT_FOLLOW_UP");
  output = setSection(
    output,
    "Can AI Do This Now?",
    [
      "No",
      "",
      "Reason: This proposal is outside the current task until a human accepts the entry point.",
    ].join("\n"),
  );
  return output;
}

function fillFinalReport(content, context) {
  let output = setTitle(content, `# Final Report: ${context.number}-${context.slug}`);
  output = setSection(output, "Human Summary", `One-sentence conclusion:\n\nFinal report for ${context.title}.`);
  output = setSection(
    output,
    "Technical Details",
    [
      context.taskRef ? `Task: \`${context.taskRef}\`` : "Task:",
      "",
      context.specRef ? `Spec: \`${context.specRef}\`` : "Spec:",
      "",
      context.evalRef ? `Eval: \`${context.evalRef}\`` : "Eval:",
      "",
      context.reviewPacketRef ? `Review Packet: \`${context.reviewPacketRef}\`` : "Review Packet:",
      "",
      context.reviewLoopReportRef ? `Review Loop Report: \`${context.reviewLoopReportRef}\`` : "Review Loop Report:",
      "",
      "Commands run:",
      "",
      "```text",
      "",
      "```",
      "",
      "Changed files:",
      "",
      "- ",
      "",
      "Evidence refs:",
      "",
      "- ",
    ].join("\n"),
  );
  return output;
}

const allowedGoalModes = new Set([
  "DISCUSS_ONLY",
  "ADOPT_PROJECT",
  "DEFINE_WORK",
  "IMPLEMENT_TASK",
  "REVIEW_TASK",
  "REPAIR_TASK",
  "BASELINE_DECISION",
  "HANDOFF_OR_REPORT",
]);

function normalizedGoalMode(value) {
  const mode = String(value || "DEFINE_WORK").trim().toUpperCase().replace(/-/g, "_");
  if (!allowedGoalModes.has(mode)) fail(`invalid goal mode: ${value}`);
  return mode;
}

function fillGoalCard(content, context) {
  const goalMode = normalizedGoalMode(context.goalMode);
  let output = setTitle(content, `# Goal Card: ${context.number}-${context.slug}`);
  output = setSection(
    output,
    "Human Summary",
    [
      "One-sentence conclusion:",
      "",
      `${context.title} is routed through ${goalMode}. This card selects the workflow path; it is not implementation approval.`,
    ].join("\n"),
  );
  output = setSection(
    output,
    "Goal",
    [
      `Goal: ${context.title}`,
      "",
      context.taskRef ? `Source: \`${context.taskRef}\`` : "Source: Human conversation.",
      "",
      "Non-goals: Do not implement, approve risk, approve release, or bypass required artifacts from this card alone.",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Goal Mode",
    [
      `Selected: ${goalMode}`,
      "",
      "Why: Select the smallest safe workflow route before creating artifacts, implementing, reviewing, repairing, deciding, or reporting.",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Project State",
    [
      "Project state:",
      "",
      "Workflow state:",
      "",
      "Adoption mode:",
      "",
      "Current `workflow-next` result:",
      "",
      "```text",
      "NEXT_ACTION:",
      "CAN_WRITE_WORKFLOW_ASSETS:",
      "MUST_STOP_FOR_HUMAN:",
      "```",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Risk And Level",
    [
      `Task level: ${context.level || "L1"}`,
      "",
      "Baseline level: BL0_LIGHTWEIGHT / BL1_STANDARD / BL2_INDUSTRIAL / not selected",
      "",
      "Risk reason:",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Engineering Baseline Touch",
    [
      "Does this goal touch project-wide engineering decisions: Yes / No",
      "",
      "If yes, related decision area:",
      "",
      "- structure / module boundary",
      "- DTO / schema / domain boundary",
      "- enum / string / lookup / state-machine",
      "- API contract / generated type",
      "- permission / migration / dependency / cross-module state",
      "",
      "Engineering baseline status:",
      "",
      "Decision Brief needed: Yes / No",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Required Artifacts",
    [
      "| Artifact | Required | Path / Status | Reason |",
      "|---|---|---|---|",
      `| Request | ${goalMode === "DEFINE_WORK" ? "Yes" : "No"} | ${context.requestRef ? `\`${context.requestRef}\`` : ""} |  |`,
      `| Preflight | ${goalMode === "DEFINE_WORK" ? "Yes" : "No"} | ${context.preflightRef ? `\`${context.preflightRef}\`` : ""} |  |`,
      `| Spec | ${goalMode === "DEFINE_WORK" ? "Yes" : "No"} | ${context.specRef ? `\`${context.specRef}\`` : ""} |  |`,
      `| Eval | ${goalMode === "DEFINE_WORK" ? "Yes" : "No"} | ${context.evalRef ? `\`${context.evalRef}\`` : ""} |  |`,
      `| Task | ${goalMode === "IMPLEMENT_TASK" || goalMode === "DEFINE_WORK" ? "Yes" : "No"} | ${context.taskRef ? `\`${context.taskRef}\`` : ""} |  |`,
      `| Review Packet | ${goalMode === "REVIEW_TASK" || (context.level || "").match(/^L[23]$/) ? "Yes" : "No"} | ${context.reviewPacketRef ? `\`${context.reviewPacketRef}\`` : ""} |  |`,
      `| Review Loop Report | ${goalMode === "REPAIR_TASK" || (context.level || "").match(/^L[23]$/) ? "Yes" : "No"} | ${context.reviewLoopReportRef ? `\`${context.reviewLoopReportRef}\`` : ""} |  |`,
      `| Decision Brief | ${goalMode === "BASELINE_DECISION" ? "Yes" : "No"} |  |  |`,
      `| Final Report / Handoff | ${goalMode === "HANDOFF_OR_REPORT" ? "Yes" : "No"} | ${context.finalReportRef ? `\`${context.finalReportRef}\`` : ""} |  |`,
    ].join("\n"),
  );
  output = setSection(
    output,
    "Allowed Actions",
    [
      "- Read project and workflow files needed to route the goal.",
      "- Create or update only the artifacts listed as required after the selected mode permits writes.",
      "- Run non-destructive local checks referenced by the selected route.",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Forbidden Actions",
    [
      "- Do not treat this Goal Card as approval to implement.",
      "- Do not bypass request, preflight, spec, eval, task, Engineering Baseline, Review Loop, Risk Gate, Human Approval, or Approval scope.",
      "- Do not widen scope, accept risk, approve release, change production config, add dependencies, change migrations, change permission model, or modify architecture without the required human decision.",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Human Decisions Needed",
    [
      "| Decision | Owner | Needed Before | Current Status |",
      "|---|---|---|---|",
      "| Confirm selected goal mode if risk or write authority is unclear | human | next action | Pending / Not needed |",
    ].join("\n"),
  );
  output = setSection(output, "Next Safe Step", "Next action:");
  output = setSection(
    output,
    "Technical Details",
    [
      "Related files:",
      "",
      context.taskRef ? `- \`${context.taskRef}\`` : "- ",
      context.specRef ? `- \`${context.specRef}\`` : "- ",
      context.evalRef ? `- \`${context.evalRef}\`` : "- ",
      "",
      "Commands run:",
      "",
      "```text",
      "",
      "```",
    ].join("\n"),
  );
  return output;
}

const allowedSubagentModes = new Set([
  "READ_ONLY_RESEARCH",
  "PLAN_THEN_BUILD",
  "REVIEW_LOOP",
  "AUTO_FIX_REPAIR",
  "REPORTING",
]);

function normalizedSubagentMode(value) {
  const mode = String(value || "READ_ONLY_RESEARCH").trim().toUpperCase().replace(/-/g, "_");
  if (!allowedSubagentModes.has(mode)) fail(`invalid subagent mode: ${value}`);
  return mode;
}

function fillSubagentRunPlan(content, context) {
  const subagentMode = normalizedSubagentMode(context.subagentMode);
  let output = setTitle(content, `# Subagent Run Plan: ${context.number}-${context.slug}`);
  output = setSection(
    output,
    "Human Summary",
    [
      "One-sentence conclusion:",
      "",
      `${context.title} helper-agent run is planned. Subagents must be closed or skipped before final response.`,
    ].join("\n"),
  );
  output = setSection(
    output,
    "Goal",
    [
      `Goal: ${context.title}`,
      "",
      context.taskRef ? `Related task: \`${context.taskRef}\`` : "Related task: not selected yet",
      "",
      context.specRef ? `Related spec: \`${context.specRef}\`` : "Related spec:",
      "",
      context.evalRef ? `Related eval: \`${context.evalRef}\`` : "Related eval:",
      "",
      "Non-goals: Do not use helper agents as approval, release authority, risk acceptance, or hidden background execution.",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Orchestration Mode",
    [
      `Selected: ${subagentMode}`,
      "",
      "Why: Use the smallest helper-agent pattern needed for the current goal. Main thread remains the owner.",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Role Roster",
    [
      "| Agent ID | Role | Authority | Status | Write Scope | Close Condition | Closure Evidence |",
      "|---|---|---|---|---|---|---|",
      "| A1 | Goal Planner | READ_ONLY | SKIPPED | none | no helper needed yet | No subagent launched; plan is draft |",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Writer Control",
    [
      "Many readers, one writer: Yes",
      "",
      "Current writer: main thread",
      "",
      "Single active writer: Yes",
      "",
      "Disjoint write ownership used: No",
      "",
      "Human-approved owner / expiry if disjoint ownership is used:",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Lifecycle Closure",
    [
      "All subagents closed: Yes",
      "",
      "Closure required before final response: Yes",
      "",
      "No background or standing agents: Yes",
      "",
      "No subagent left occupying a slot after handoff: Yes",
      "",
      "Closure notes: No subagent is running. If a subagent is launched, update the roster to CLOSED or SKIPPED with evidence before final response.",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Allowed Actions",
    [
      "- Use read-only helper agents to inspect files, summarize findings, or review artifacts.",
      "- Use at most one writer at a time, owned by the main thread unless a human-approved disjoint owner and expiry are recorded.",
      "- Close each subagent immediately after its handoff is consumed.",
      "- Run `node scripts/check-subagent-orchestration.mjs .` after the plan is closed.",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Forbidden Actions",
    [
      "- Do not leave subagents running after handoff.",
      "- Do not send a final response while RUNNING agents exist.",
      "- Do not keep standby subagents open.",
      "- Do not run multiple active writers.",
      "- Do not let reviewer agents edit files.",
      "- Do not use subagents to resolve NEEDS_HUMAN_DECISION items.",
      "- Do not create persistent monitors, automations, hooks, or external GPT/API reviewer calls from this plan.",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Handoff / Findings",
    [
      "| Agent ID | Handoff Summary | Findings / Output Ref | Main Thread Decision |",
      "|---|---|---|---|",
      "| A1 | No helper launched yet | none | no action |",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Human Decisions Needed",
    [
      "| Decision | Owner | Needed Before | Current Status |",
      "|---|---|---|---|",
      "| Approve any scope, risk, architecture, dependency, migration, production config, release, or automation change | human | execution | Not needed yet |",
    ].join("\n"),
  );
  output = setSection(output, "Next Safe Step", "Next action: Launch only the minimum needed helper agent, then close it after handoff.");
  output = setSection(
    output,
    "Technical Details",
    [
      "Related files:",
      "",
      context.taskRef ? `- \`${context.taskRef}\`` : "- ",
      context.specRef ? `- \`${context.specRef}\`` : "- ",
      context.evalRef ? `- \`${context.evalRef}\`` : "- ",
      "",
      "Commands run:",
      "",
      "```text",
      "",
      "```",
    ].join("\n"),
  );
  return output;
}

function fillLaunchReadinessReport(content, context) {
  let output = setTitle(content, `# Launch Readiness Report: ${context.number}-${context.slug}`);
  output = setSection(output, "Human Summary", "Plain-language summary of what can safely happen now.");
  output = setSection(output, "Baseline Level", context.level === "L2" || context.level === "L3" ? "`BL2`" : "`BL1`");
  output = setSection(output, "Final Readiness", "`NOT_READY`");
  return output;
}

function fillConversationTurnClassification(content, context) {
  let output = setTitle(content, `# Conversation Turn Classification: ${context.number}-${context.slug}`);
  output = setSection(output, "Human Summary", "Plain-language summary of what the user message means for the current work.");
  output = setSection(output, "Intent Classification", "`DISCUSS_ONLY`");
  output = setSection(output, "Can Continue Current Task?", "`No`");
  output = setSection(output, "Required Human Decision", "`None`");
  return output;
}

function fillScopeChangeReport(content, context) {
  let output = setTitle(content, `# Scope Change Report: ${context.number}-${context.slug}`);
  output = setSection(output, "Human Summary", "Plain-language explanation of the proposed scope change.");
  output = setSection(output, "Recommendation", "`STOP_FOR_DECISION`");
  output = setSection(output, "Human Decision", "`Pending`");
  output = setSection(output, "Applied Changes", "None");
  return output;
}

function fillAdoptionTrialReport(content, context) {
  let output = setTitle(content, `# Adoption Trial Report: ${context.number}-${context.slug}`);
  output = setSection(output, "Human Summary", "Plain-language summary of what was tried and what the trial proves.");
  output = setSection(output, "Scenario", [
    "- Project type:",
    "- New or existing project:",
    "- User skill level:",
    "- User starting sentence:",
    "- Platform:",
    "- Baseline target:",
  ].join("\n"));
  output = setSection(output, "Outcome", "`NEEDS_HUMAN_DECISION`");
  return output;
}

function fillRealAdoptionTrialReport(content, context) {
  let output = setTitle(content, `# Real Adoption Trial Report: ${context.number}-${context.slug}`);
  output = setSection(output, "Human Summary", "One-sentence read-only conclusion.");
  output = setSection(
    output,
    "Trial Boundary",
    [
      "| Field | Value |",
      "|---|---|",
      "| Trial mode | READ_ONLY |",
      "| No target writes performed | Yes |",
      "| Target git status checked before | Yes / No |",
      "| Target git status checked after | Yes / No |",
      "| External service commands run | No |",
      "| Runtime / DB / migration / seed commands run | No |",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Target Project State",
    [
      "| Field | Value |",
      "|---|---|",
      "| Target project label | one governed production-sensitive Web project / <sanitized label> |",
      "| Concrete target name included | No |",
      "| Primary adoption mode | NEW_PROJECT / EXISTING_LIGHT_PROJECT / EXISTING_GOVERNED_PROJECT / EXISTING_PRODUCTION_PROJECT / BLOCKED_UNKNOWN_RISK |",
      "| Secondary risk tags |  |",
      "| Confidence | low / medium / high |",
      "| Evidence |  |",
    ].join("\n"),
  );
  output = setSection(output, "Outcome", "`NEEDS_HUMAN_DECISION`");
  return output;
}

function fillPatchClassification(content, context) {
  let output = setTitle(content, `# Patch Classification Report: ${context.number}-${context.slug}`);
  output = setSection(output, "Human Summary", "One-sentence repair-scale conclusion.");
  output = setSection(
    output,
    "Classification Status",
    [
      "| Field | Value |",
      "|---|---|",
      "| Status | DRAFT |",
      "| Target project label | <sanitized label> |",
      "| Patch classification authorizes implementation | No |",
      "| Checker boundary | heuristic and structure-based; does not prove code or root-cause correctness |",
    ].join("\n"),
  );
  output = setSection(output, "Outcome", "`CLASSIFIED_ONLY`");
  return output;
}

function fillActiveWorkThread(content, context) {
  let output = setTitle(content, `# Active Work Thread: ${context.number}-${context.slug}`);
  output = setSection(output, "Human Summary", `Plain-language status of the current work thread for ${context.title}.`);
  output = setSection(
    output,
    "Current Mainline",
    [
      "| Field | Value |",
      "|---|---|",
      `| Goal | ${context.title} |`,
      context.taskRef ? `| Current task / artifact | \`${context.taskRef}\` |` : "| Current task / artifact |  |",
      "| Delivery target | demo / internal handoff / release review / not ready |",
      "| Current status | active / paused / blocked / complete |",
      "| Can AI continue now? | Yes / Limited / No |",
      "| Why |  |",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Decisions Needed",
    [
      "| Decision | Level | Owner | Needed before | Recommended path |",
      "|---|---|---|---|---|",
      "| Confirm the current mainline if scope is unclear | D1 / D2 | human | next execution step | keep one current mainline and park side ideas |",
    ].join("\n"),
  );
  return output;
}

function fillGuidedDecisionSummary(content, context) {
  let output = setTitle(content, `# Guided Decision Summary: ${context.number}-${context.slug}`);
  output = setSection(output, "Human Summary", `Plain-language explanation of the decision for ${context.title}.`);
  output = setSection(output, "Decision Level", "```text\nD1\n```");
  output = setSection(
    output,
    "Recommendation",
    [
      "I recommend:",
      "",
      "Use the smallest safe path for the current slice.",
      "",
      "Why:",
      "",
      "It keeps the current work bounded while preserving future options.",
      "",
      "What this does now:",
      "",
      "- confirms one direction",
      "- lets Codex create or update only the needed artifacts",
      "",
      "What this avoids now:",
      "",
      "- raw technical guessing",
      "- hidden scope expansion",
      "- accidental risk approval",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Technical Translation",
    [
      "If the human confirms the recommendation, Codex will translate it into:",
      "",
      "- request / spec / eval / task",
      "- engineering baseline note",
      "- decision brief",
      "- follow-up proposal",
      "- active work thread update",
      "- no artifact needed",
      "",
      "Technical consequence:",
      "",
      context.taskRef ? `- Related task: \`${context.taskRef}\`` : "- ",
    ].join("\n"),
  );
  return output;
}

function fillChangeBoundaryReport(content, context) {
  let output = setTitle(content, `# Change Boundary Report: ${context.number}-${context.slug}`);
  output = setSection(output, "Human Summary", `Boundary review for ${context.title}.`);
  output = setSection(output, "Task Ref", context.taskRef ? `\`${context.taskRef}\`` : "`tasks/<file>.md`");
  output = setSection(output, "Boundary Level", "```text\nCB1_RECORDED\n```");
  output = setSection(
    output,
    "Intended Scope",
    [
      "Allowed paths:",
      "",
      "- docs/",
      "",
      "Forbidden paths:",
      "",
      "- .env",
      "- .github/workflows/",
      "",
      "Allowed change types:",
      "",
      "- docs-only",
      "",
      "Forbidden change types:",
      "",
      "- production-config",
      "- migration",
      "- unrelated-refactor",
      "",
      "Expected diff scale:",
      "",
      "small",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Actual Changed Files",
    [
      "| File | Change type | Inside boundary? | Evidence / note |",
      "|---|---|---|---|",
      "| docs/<file>.md | docs-only | Yes | update after implementation |",
    ].join("\n"),
  );
  output = setSection(output, "Boundary Result", "Disposition: `NEEDS_REVIEW`\n\nReason: Fill after diff review.");
  return output;
}

function fillBaselineStateReport(content, context) {
  let output = setTitle(content, `# Baseline State Report: ${context.number}-${context.slug}`);
  output = setSection(output, "Human Summary", `Baseline state review for ${context.title}.`);
  output = setSection(output, "Project Mode", "```text\nNEW_PROJECT\n```");
  output = setSection(
    output,
    "Baseline Recommendation",
    [
      "| Area | Recommendation | State | Evidence ref | Human decision needed |",
      "|---|---|---|---|---|",
      "| Engineering | Start with conservative project structure | PROPOSED |  | Confirm direction |",
      "| Environment | Define commands after project scaffold exists | EVIDENCE_REQUIRED |  | Confirm runtime once selected |",
      "| Platform | Select platform profile based on user goal | PENDING_CONFIRMATION |  | Confirm platform |",
      "| Industrial | Do not claim industrial readiness yet | EVIDENCE_REQUIRED |  | Decide later if BL2 is needed |",
    ].join("\n"),
  );
  output = setSection(output, "Implementation Permission", "Can AI implement against this baseline now: Limited\n\nReason: Proposed baseline can guide low-risk setup only; high-impact work needs confirmation/evidence.");
  return output;
}

function frontmatterFor(type, context) {
  const common = {
    schema_version: "1.0",
    artifact_type: type,
    number: context.number,
    slug: context.slug,
    title: context.title,
    status: "draft",
    created_at: context.date,
    devkit_version: context.devKitVersion,
  };
  if (type === "request") {
    return { ...common, priority: context.priority || "P1", task_level: context.level || "L1" };
  }
  if (type === "preflight") {
    return { ...common, request: context.requestRef, task_level: context.level || "L1" };
  }
  if (type === "spec") {
    return { ...common, request: context.requestRef, preflight: context.preflightRef };
  }
  if (type === "eval") {
    return { ...common, spec: context.specRef };
  }
  if (type === "task") {
    return { ...common, spec: context.specRef, eval: context.evalRef, task_level: context.level || "L1" };
  }
  if (type === "review-loop-report") {
    return {
      ...common,
      task: context.taskRef,
      spec: context.specRef,
      eval: context.evalRef,
      task_level: context.level || "L1",
      status: "open",
    };
  }
  if (type === "goal-card") {
    return {
      ...common,
      goal_mode: normalizedGoalMode(context.goalMode),
      task_level: context.level || "L1",
    };
  }
  if (type === "subagent-run-plan") {
    return {
      ...common,
      subagent_mode: normalizedSubagentMode(context.subagentMode),
    };
  }
  if (type === "active-work-thread" || type === "guided-decision-summary") {
    return {
      ...common,
      task: context.taskRef,
      decision_level: type === "guided-decision-summary" ? "D1" : undefined,
    };
  }
  if (type === "change-boundary-report" || type === "baseline-state-report") {
    return {
      ...common,
      task: context.taskRef,
      status: "draft",
    };
  }
  return null;
}

const args = parseArgs(process.argv.slice(2));
const rawType = args.type ? String(args.type) : "";
const type = aliases[rawType] || rawType;

if (!type || !typeMap[type]) {
  usage();
  fail("missing or invalid --type");
}

const projectRoot = path.resolve(process.cwd(), args.root || ".");
const config = typeMap[type];
const taskBasedTypes = new Set(["log", "review-packet", "review-loop-report", "gpt-review-prompt", "follow-up-proposal", "final-report", "goal-card", "subagent-run-plan", "change-boundary-report", "baseline-state-report"]);

let requestRef = resolveRef(projectRoot, args.request || (type === "preflight" ? args.from : null), "request");
let preflightRef = resolveRef(projectRoot, args.preflight, "preflight");
let specRef = resolveRef(projectRoot, args.spec || (type === "eval" || type === "task" ? args.from : null), "spec");
let evalRef = resolveRef(projectRoot, args.eval, "eval");
let taskRef = resolveRef(projectRoot, args.task || (taskBasedTypes.has(type) ? args.from : null), "task");
const logRef = resolveRef(projectRoot, args.log, "log");
let level = args.level;

const inferredRefs = inferRefsFromTask(projectRoot, {
  evalRef,
  level,
  preflightRef,
  requestRef,
  specRef,
  taskRef,
});
requestRef = inferredRefs.requestRef;
preflightRef = inferredRefs.preflightRef;
specRef = inferredRefs.specRef;
evalRef = inferredRefs.evalRef;
level = inferredRefs.level;

if (type === "preflight" && !requestRef) fail("preflight requires --from or --request");
if (type === "spec" && !requestRef) fail("spec requires --request");
if (type === "eval" && !specRef) fail("eval requires --spec or --from");
if (type === "task" && !specRef) fail("task requires --spec or --from");
if (type === "task" && !evalRef) fail("task requires --eval");
if (type === "log" && !taskRef) fail("ai-log requires --task or --from");
if (["review-packet", "review-loop-report", "gpt-review-prompt", "follow-up-proposal", "final-report"].includes(type) && !taskRef && !args.name) {
  fail(`${type} requires --task, --from, or --name`);
}

const sourceForName = requestRef || specRef || taskRef || logRef;
const slug = slugify(args.name || (sourceForName ? parseNameFromPath(sourceForName) : config.defaultName || "workflow-item"));
const title = titleFromSlug(slug);
const number = args.number
  ? String(args.number).padStart(3, "0")
  : numberFromPath(sourceForName || "") || nextNumber(projectRoot, config.dir);
const date = localDate();
const filename = type === "log" ? `${date}-${slug}.md` : `${number}-${slug}.md`;
const reviewPacketRef = resolveRef(projectRoot, args["review-packet"] || args.packet, "review packet")
  || siblingArtifactRef(projectRoot, "review-packets", number, slug);
const gptReviewPromptRef = resolveRef(projectRoot, args["gpt-review-prompt"] || args.prompt, "GPT review prompt")
  || siblingArtifactRef(projectRoot, "gpt-review-prompts", number, slug);
const reviewLoopReportRef = resolveRef(projectRoot, args["review-loop-report"] || args["loop-report"], "review loop report")
  || siblingArtifactRef(projectRoot, "review-loop-reports", number, slug);
const finalReportRef = resolveRef(projectRoot, args["final-report"], "final report")
  || siblingArtifactRef(projectRoot, "final-reports", number, slug);
const baseContext = {
  date,
  devKitVersion: readCurrentDevKitVersion(projectRoot),
  evalRef,
  level,
  number,
  preflightRef,
  priority: args.priority,
  projectRoot,
  requestRef,
  slug,
  specRef,
  taskRef,
  logRef,
  reviewPacketRef,
  gptReviewPromptRef,
  reviewLoopReportRef,
  finalReportRef,
  title,
  agent: args.agent,
  goalMode: args["goal-mode"] || args.mode,
  subagentMode: args["subagent-mode"] || args.mode,
};

let content = readTemplate(projectRoot, config.template);
if (type === "request") content = fillRequest(content, baseContext);
if (type === "preflight") content = fillPreflight(content, baseContext);
if (type === "spec") content = fillSpec(content, baseContext);
if (type === "eval") content = fillEval(content, baseContext);
if (type === "task") content = fillTask(content, baseContext);
if (type === "log") content = fillLog(content, baseContext);
if (type === "review-packet") content = fillReviewPacket(content, baseContext);
if (type === "review-loop-report") content = fillReviewLoopReport(content, baseContext);
if (type === "gpt-review-prompt") content = fillGptReviewPrompt(content, baseContext);
if (type === "adoption-assessment") content = fillAdoptionAssessment(content, baseContext);
if (type === "governance-map") content = fillGovernanceMap(content, baseContext);
if (type === "human-status-report") content = fillHumanStatusReport(content, baseContext);
if (type === "decision-brief") content = fillDecisionBrief(content, baseContext);
if (type === "plain-review-summary") content = fillPlainReviewSummary(content, baseContext);
if (type === "customer-handoff") content = fillCustomerHandoff(content, baseContext);
if (type === "follow-up-proposal") content = fillFollowUpProposal(content, baseContext);
if (type === "final-report") content = fillFinalReport(content, baseContext);
if (type === "goal-card") content = fillGoalCard(content, baseContext);
if (type === "subagent-run-plan") content = fillSubagentRunPlan(content, baseContext);
if (type === "launch-readiness-report") content = fillLaunchReadinessReport(content, baseContext);
if (type === "conversation-turn-classification") content = fillConversationTurnClassification(content, baseContext);
if (type === "scope-change-report") content = fillScopeChangeReport(content, baseContext);
if (type === "adoption-trial-report") content = fillAdoptionTrialReport(content, baseContext);
if (type === "real-adoption-trial-report") content = fillRealAdoptionTrialReport(content, baseContext);
if (type === "patch-classification") content = fillPatchClassification(content, baseContext);
if (type === "active-work-thread") content = fillActiveWorkThread(content, baseContext);
if (type === "guided-decision-summary") content = fillGuidedDecisionSummary(content, baseContext);
if (type === "change-boundary-report") content = fillChangeBoundaryReport(content, baseContext);
if (type === "baseline-state-report") content = fillBaselineStateReport(content, baseContext);

const frontmatter = frontmatterFor(type, baseContext);
if (frontmatter) content = addFrontmatter(content, frontmatter);

const created = writeArtifact(projectRoot, config.dir, filename, content);

console.log(`created ${created}`);
console.log("");
console.log("Next steps:");
if (type === "review-packet") {
  console.log("- Fill diff summary, commands run, evidence refs, known risks, and open questions.");
  console.log("- Send this packet to a human reviewer, GPT Pro, or a second model when independent review is needed.");
  console.log("- Do not treat the packet itself as approval.");
} else if (type === "gpt-review-prompt") {
  console.log("- Pair this prompt with the matching Review Packet for GPT Pro, a second model, or another read-only reviewer.");
  console.log("- Do not paste secrets, credentials, production tokens, or sensitive runtime data.");
  console.log("- Feed findings back into a Review Loop Report before Codex fixes anything.");
} else if (type === "review-loop-report") {
  console.log("- Record review findings, AUTO_FIX attempts, verification, repeated issues, and human-decision items.");
  console.log("- AUTO_FIX is limited to 2 rounds and must stay inside approved task scope.");
  console.log("- Route scope, risk, approval, architecture, migration, dependency, production, release, and rollback decisions to humans.");
} else if (type === "adoption-assessment" || type === "governance-map") {
  console.log("- Keep this read-only until the human approves adapter setup or the target write location.");
  console.log("- Do not use this file as permission to run init-project or update workflow assets.");
} else if (type === "human-status-report") {
  console.log("- Start with status, risk, whether AI can continue, and the next safe step.");
  console.log("- Keep technical fields and command output under Technical Details.");
} else if (type === "decision-brief") {
  console.log("- Fill the decision question, options, recommendation, and what AI must not do before confirmation.");
  console.log("- Do not treat this brief as approval; record the human decision after it is made.");
} else if (type === "plain-review-summary") {
  console.log("- Summarize Review Loop results for a human before listing technical findings.");
  console.log("- Route scope, risk, approval, release, and production decisions to the human.");
} else if (type === "customer-handoff") {
  console.log("- Summarize delivered scope, verification, exclusions, risks, and decisions needed.");
  console.log("- Do not treat this handoff summary as release approval by itself.");
} else if (type === "follow-up-proposal") {
  console.log("- Classify the suggestion as IN_SCOPE_NEXT_STEP, DIRECT_FOLLOW_UP, RISK_DECISION, OUT_OF_SCOPE_OBSERVATION, or DO_NOT_PROCEED.");
  console.log("- Do not implement the proposal until it enters a valid request, task, or human-decision path.");
} else if (type === "final-report") {
  console.log("- Fill Completed, Verified, Not Changed, Risks Remaining, Next-Step Suggestions, Human Decisions Needed, and Next Safe Action.");
  console.log("- Keep next-step suggestions bounded, classified, and actionable.");
} else if (type === "goal-card") {
  console.log("- Confirm the selected Goal Mode before executing any write or implementation path.");
  console.log("- Run node scripts/check-goal-mode.mjs . after filling the card.");
  console.log("- Do not treat the Goal Card as implementation approval.");
} else if (type === "subagent-run-plan") {
  console.log("- Use the smallest needed helper-agent set and keep the main thread as owner.");
  console.log("- Close or skip every subagent after handoff; do not leave RUNNING agents occupying slots.");
  console.log("- Run node scripts/check-subagent-orchestration.mjs . before final response or commit.");
} else if (type === "launch-readiness-report") {
  console.log("- Fill verification, human decisions, release boundary, rollback, and known limitations before claiming readiness.");
  console.log("- Run node scripts/check-launch-readiness.mjs . after filling the report.");
} else if (type === "conversation-turn-classification" || type === "scope-change-report") {
  console.log("- Fill routing, scope impact, risk impact, and human decision fields before acting on the turn.");
  console.log("- Run node scripts/check-conversation-drift.mjs . after filling the report.");
} else if (type === "adoption-trial-report") {
  console.log("- Fill the starting idea, Codex routing, baseline path, artifact path, human decisions, drift events, verification, and delivery boundary.");
  console.log("- Label simulated evidence as simulated; do not claim real-project or production validation without evidence.");
  console.log("- Run node scripts/check-first-delivery-walkthrough.mjs . after filling the report.");
} else if (type === "real-adoption-trial-report") {
  console.log("- Keep the target project read-only; record git status before and after if a real target was inspected.");
  console.log("- Do not include private target names in public evidence unless explicitly approved.");
  console.log("- Run node scripts/check-real-adoption-trial.mjs . after filling the report.");
} else if (type === "patch-classification") {
  console.log("- Classify repair scale before proposing or applying a non-trivial fix.");
  console.log("- Do not treat patch classification as implementation authorization.");
  console.log("- Run node scripts/check-patch-classification.mjs . after filling the report.");
} else if (type === "patch-classification-false-positive") {
  console.log("- Use this only when a high-risk keyword appears to be background context after review.");
  console.log("- Do not use false-positive records to approve implementation or weaken gates.");
  console.log("- Run node scripts/check-patch-classification.mjs . after filling the report.");
} else if (type === "active-work-thread") {
  console.log("- Keep exactly one Current Mainline visible and move side ideas into Parking Lot.");
  console.log("- Do not treat parking-lot items as approved backlog or implementation scope.");
  console.log("- Use this artifact only when broad conversation or drift makes the mainline unclear.");
} else if (type === "guided-decision-summary") {
  console.log("- Translate raw technical choices into product, effort, or risk choices the human can own.");
  console.log("- Recommend one smallest safe path and record what Codex must not do without further approval.");
  console.log("- Do not treat this summary as approval for release, production, migration, payment, privacy, or high-risk work.");
} else if (type === "change-boundary-report") {
  console.log("- Compare actual changed files with the approved task boundary.");
  console.log("- Do not mark PASS when forbidden or out-of-scope files changed.");
  console.log("- Run node scripts/check-change-boundary.mjs . --report <this-file> after filling the report.");
} else if (type === "baseline-state-report") {
  console.log("- Keep no-code and evidence-required baselines separate from confirmed project facts.");
  console.log("- Do not claim production-ready or industrial-grade status without evidence.");
  console.log("- Run node scripts/check-baseline-state.mjs . --report <this-file> after filling the report.");
} else {
  console.log("- Fill all placeholder sections from project conversation and evidence.");
  console.log("- Keep exactly one request/preflight/spec/eval/task chain for the current implementation task.");
  console.log("- Run node scripts/check-workflow-artifacts.mjs . --mode ready before implementation.");
  console.log("- If any Risk Gate item is checked, run node scripts/check-workflow-artifacts.mjs . --mode implementation --task <task-card> after approval.");
}
