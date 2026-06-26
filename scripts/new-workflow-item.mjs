#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

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
  const plainRef = String(value || "").match(/\b(?:requests|preflight|specs|evals|tasks|ai-logs|review-packets|review-loop-reports|gpt-review-prompts)\/[^\s`|)]+\.md\b/);
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

const args = parseArgs(process.argv.slice(2));
const rawType = args.type ? String(args.type) : "";
const type = aliases[rawType] || rawType;

if (!type || !typeMap[type]) {
  usage();
  fail("missing or invalid --type");
}

const projectRoot = path.resolve(process.cwd(), args.root || ".");
const config = typeMap[type];
const taskBasedTypes = new Set(["log", "review-packet", "review-loop-report", "gpt-review-prompt"]);

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
if (["review-packet", "review-loop-report", "gpt-review-prompt"].includes(type) && !taskRef && !args.name) {
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
const baseContext = {
  date,
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
  title,
  agent: args.agent,
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
} else {
  console.log("- Fill all placeholder sections from project conversation and evidence.");
  console.log("- Keep exactly one request/preflight/spec/eval/task chain for the current implementation task.");
  console.log("- Run node scripts/check-workflow-artifacts.mjs . --mode ready before implementation.");
  console.log("- If any Risk Gate item is checked, run node scripts/check-workflow-artifacts.mjs . --mode implementation --task <task-card> after approval.");
}
