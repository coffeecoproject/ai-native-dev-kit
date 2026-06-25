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
};

const aliases = {
  "ai-log": "log",
  ailog: "log",
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
      "Approved by:",
      "Approved at:",
      "Approval notes:",
    ].join("\n"),
  );
  return output;
}

function fillLog(content, context) {
  let output = setTitle(content, `# AI Task Log: ${context.date}-${context.slug}`);
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

const args = parseArgs(process.argv.slice(2));
const rawType = args.type ? String(args.type) : "";
const type = aliases[rawType] || rawType;

if (!type || !typeMap[type]) {
  usage();
  fail("missing or invalid --type");
}

const projectRoot = path.resolve(process.cwd(), args.root || ".");
const config = typeMap[type];

const requestRef = resolveRef(projectRoot, args.request || (type === "preflight" ? args.from : null), "request");
const preflightRef = resolveRef(projectRoot, args.preflight, "preflight");
const specRef = resolveRef(projectRoot, args.spec || (type === "eval" || type === "task" ? args.from : null), "spec");
const evalRef = resolveRef(projectRoot, args.eval, "eval");
const taskRef = resolveRef(projectRoot, args.task || (type === "log" ? args.from : null), "task");

if (type === "preflight" && !requestRef) fail("preflight requires --from or --request");
if (type === "spec" && !requestRef) fail("spec requires --request");
if (type === "eval" && !specRef) fail("eval requires --spec or --from");
if (type === "task" && !specRef) fail("task requires --spec or --from");
if (type === "task" && !evalRef) fail("task requires --eval");
if (type === "log" && !taskRef) fail("ai-log requires --task or --from");

const sourceForName = requestRef || specRef || taskRef;
const slug = slugify(args.name || (sourceForName ? parseNameFromPath(sourceForName) : "workflow-item"));
const title = titleFromSlug(slug);
const number = args.number
  ? String(args.number).padStart(3, "0")
  : numberFromPath(sourceForName || "") || nextNumber(projectRoot, config.dir);
const date = localDate();
const filename = type === "log" ? `${date}-${slug}.md` : `${number}-${slug}.md`;
const baseContext = {
  date,
  evalRef,
  level: args.level,
  number,
  preflightRef,
  priority: args.priority,
  requestRef,
  slug,
  specRef,
  taskRef,
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

const created = writeArtifact(projectRoot, config.dir, filename, content);

console.log(`created ${created}`);
console.log("");
console.log("Next steps:");
console.log("- Fill all placeholder sections from project conversation and evidence.");
console.log("- Keep exactly one request/preflight/spec/eval/task chain for the current implementation task.");
console.log("- Run node scripts/check-workflow-artifacts.mjs . --mode ready before implementation.");
console.log("- If any Risk Gate item is checked, run node scripts/check-workflow-artifacts.mjs . --mode implementation --task <task-card> after approval.");
