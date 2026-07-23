import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { assertSafeRelativePath, assertSafeWritePath, assertInsideRoot } from "../lib/path-safety.mjs";

const kitRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

function fail(message) {
  console.error(`FAIL ${message}`);
  process.exit(1);
}

export function localDate() {
  const now = new Date();
  const year = String(now.getFullYear()).padStart(4, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function slugify(value) {
  const slug = String(value || "")
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "workflow-item";
}

export function titleFromSlug(slug) {
  return slug.replace(/-/g, " ");
}

export function parseNameFromPath(filePath) {
  const base = path.basename(filePath, path.extname(filePath));
  const match = base.match(/^(\d+)-(.+)$/);
  return match ? match[2] : base;
}

export function numberFromPath(filePath) {
  const base = path.basename(filePath);
  const match = base.match(/^(\d+)-/);
  return match ? match[1] : null;
}

export function nextNumber(root, dir) {
  const fullDir = path.join(root, dir);
  if (!fs.existsSync(fullDir)) return "001";
  let max = 0;
  for (const file of fs.readdirSync(fullDir)) {
    const match = file.match(/^(\d+)-.+\.md$/);
    if (match) max = Math.max(max, Number(match[1]));
  }
  return String(max + 1).padStart(3, "0");
}

export function resolveRef(root, value, label) {
  if (!value) return null;
  const safeValue = assertSafeRelativePath(String(value), `${label} ref`);
  const full = path.resolve(root, safeValue);
  assertInsideRoot(root, full, `${label} ref`);
  if (!fs.existsSync(full)) fail(`${label} does not exist: ${value}`);
  return path.relative(root, full).replaceAll(path.sep, "/");
}

function templatePath(root, templateName) {
  const candidates = [
    path.join(root, ".intentos", "templates", templateName),
    path.join(root, "templates", templateName),
    path.join(kitRoot, "templates", templateName),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  fail(`template not found: ${templateName}`);
}

export function readTemplate(root, templateName) {
  return fs.readFileSync(templatePath(root, templateName), "utf8");
}

export function readCurrentIntentOSVersion(root) {
  const candidates = [
    path.join(root, ".intentos", "version.json"),
    path.join(kitRoot, "VERSION.md"),
  ];
  for (const candidate of candidates) {
    if (!fs.existsSync(candidate)) continue;
    const content = fs.readFileSync(candidate, "utf8");
    if (candidate.endsWith(".json")) {
      try {
        const parsed = JSON.parse(content);
        if (parsed.intentOSVersion) return parsed.intentOSVersion;
      } catch {
        continue;
      }
    }
    const match = content.match(/Current version:\s*`([^`]+)`/);
    if (match) return match[1];
  }
  return "0.0.0";
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

export function inferRefsFromTask(root, current) {
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

export function siblingArtifactRef(root, dir, number, slug) {
  const rel = `${dir}/${number}-${slug}.md`;
  return fs.existsSync(path.join(root, rel)) ? rel : null;
}

export function writeArtifact(root, dir, filename, content) {
  const targetDir = assertSafeWritePath(root, dir, "workflow item directory");
  fs.mkdirSync(targetDir, { recursive: true });
  const target = assertSafeWritePath(root, `${dir}/${filename}`, "workflow item file");
  if (fs.existsSync(target)) fail(`target already exists: ${path.relative(root, target)}`);
  fs.writeFileSync(target, `${content.trimEnd()}\n`);
  return path.relative(root, target).replaceAll(path.sep, "/");
}


function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function sectionRange(content, heading) {
  const match = content.match(new RegExp(`^## ${escapeRegExp(heading)}\\s*$`, "m"));
  if (!match) return null;
  const start = match.index;
  const lineEnd = content.indexOf("\n", start);
  const bodyStart = lineEnd === -1 ? content.length : lineEnd + 1;
  const next = content.slice(bodyStart).search(/^## /m);
  const bodyEnd = next === -1 ? content.length : bodyStart + next;
  return { bodyStart, bodyEnd };
}

export function setSection(content, heading, body) {
  const range = sectionRange(content, heading);
  if (!range) return content;
  const replacement = `\n${body.trim()}\n\n`;
  return `${content.slice(0, range.bodyStart)}${replacement}${content.slice(range.bodyEnd).replace(/^\n+/, "")}`;
}

export function sectionBody(content, heading) {
  const range = sectionRange(content, heading);
  if (!range) return "";
  return content.slice(range.bodyStart, range.bodyEnd).trim();
}

export function insertSectionBefore(content, heading, newHeading, body) {
  const match = content.match(new RegExp(`^## ${escapeRegExp(heading)}\\s*$`, "m"));
  const index = match ? match.index : -1;
  if (index === -1) return `${content.trimEnd()}\n\n## ${newHeading}\n\n${body.trim()}\n`;
  return `${content.slice(0, index)}## ${newHeading}\n\n${body.trim()}\n\n${content.slice(index)}`;
}

export function setTitle(content, title) {
  return content.replace(/^# .+$/m, title);
}

export function refLine(label, ref) {
  return ref ? `- ${label}: \`${ref}\`` : `- ${label}: not used`;
}
