import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const defaultRoot = path.resolve(moduleDir, "../..");

export const REVIEW_CONTEXT_VERSION = "1.111.0";
export const CURRENT_OPERATING_MODEL = "ZERO_EXPERIENCE_SOLO_DEVELOPER";
export const USER_DECISION_CLASSES = Object.freeze([
  "NO_USER_ACTION",
  "BUSINESS_FACT_NEEDED",
  "REAL_WORLD_CONSENT_NEEDED",
  "EXTERNAL_FACT_NEEDED",
]);

export function normalizeReviewContextPath(relativePath) {
  const raw = String(relativePath || "").trim().replaceAll("\\", "/");
  if (!raw || path.posix.isAbsolute(raw) || /^[A-Za-z]:\//.test(raw)) return "";
  const normalized = path.posix.normalize(raw.replace(/^\.\//, ""));
  if (normalized === ".." || normalized.startsWith("../")) return "";
  return normalized === "." ? "" : normalized;
}

function startsWithAny(value, prefixes = []) {
  return prefixes.some((prefix) => value.startsWith(prefix));
}

export function loadReviewContextAuthority(root = defaultRoot) {
  const resolvedRoot = path.resolve(root);
  const authoritativeSourceRoot = fs.realpathSync(defaultRoot);
  const resolvedRealRoot = fs.realpathSync(resolvedRoot);
  const installed = path.join(resolvedRoot, ".intentos", "core", "review-context-authority.json");
  const source = path.join(resolvedRoot, "core", "review-context-authority.json");
  const sourceCheckout = isIntentOSSourceCheckout(resolvedRoot);
  const defaultRootIsSourceCheckout = isIntentOSSourceCheckout(authoritativeSourceRoot);
  const insideAuthoritativeSource = defaultRootIsSourceCheckout
    && (resolvedRealRoot === authoritativeSourceRoot
      || resolvedRealRoot.startsWith(`${authoritativeSourceRoot}${path.sep}`));
  const candidates = sourceCheckout
    ? [source]
    : insideAuthoritativeSource
      ? [path.join(defaultRoot, "core", "review-context-authority.json")]
      : [installed];
  const file = candidates.find((candidate) => fs.existsSync(candidate));
  if (!file) throw new Error(`review context authority not found under ${resolvedRoot}`);
  const stat = fs.lstatSync(file);
  if (stat.isSymbolicLink()) throw new Error(`review context authority must not be a symlink: ${file}`);
  const realRoot = insideAuthoritativeSource ? authoritativeSourceRoot : resolvedRealRoot;
  const realFile = fs.realpathSync(file);
  if (realFile !== realRoot && !realFile.startsWith(`${realRoot}${path.sep}`)) {
    throw new Error(`review context authority escapes project root: ${file}`);
  }
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function isIntentOSSourceCheckout(root) {
  const manifestPath = path.join(root, "intentos-manifest.json");
  const packagePath = path.join(root, "package.json");
  if (!fs.existsSync(manifestPath) || !fs.existsSync(packagePath) || !fs.existsSync(path.join(root, "VERSION.md"))) {
    return false;
  }
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
    return manifest.mode === "authoritative"
      && manifest.compatibilityPolicy?.authoritative === true
      && packageJson.name === "intentos";
  } catch {
    return false;
  }
}

function activeGuidanceRows(authority, root = defaultRoot, installedLayout = false) {
  const rows = Array.isArray(authority.activeGuidance) ? [...authority.activeGuidance] : [];
  for (const family of authority.activeGuidanceFamilies || []) {
    const prefix = normalizeReviewContextPath(installedLayout ? family.installedPrefix : family.sourcePrefix);
    const sourcePrefix = normalizeReviewContextPath(family.sourcePrefix);
    if (!prefix || !sourcePrefix) continue;
    const absolute = path.join(root, prefix);
    if (!fs.existsSync(absolute) || !fs.statSync(absolute).isDirectory()) continue;
    const extension = String(family.extension || "");
    for (const name of fs.readdirSync(absolute).sort()) {
      if (extension && !name.endsWith(extension)) continue;
      rows.push({
        source: path.posix.join(sourcePrefix, name),
        installed: family.installedPrefix ? path.posix.join(normalizeReviewContextPath(family.installedPrefix), name) : null,
      });
    }
  }
  return rows;
}

function baseGuidanceClassification(value, authority) {
  const rows = Array.isArray(authority.classifications) ? authority.classifications : [];
  const current = rows.find((row) => row.status === "CURRENT") || {};
  const compatibility = rows.find((row) => row.status === "COMPATIBILITY") || {};
  const historical = rows.find((row) => row.status === "HISTORICAL") || {};
  if ((current.exact || []).includes(value)) return "CURRENT";
  if (startsWithAny(value, historical.versionedPrefixes)) return "HISTORICAL";
  if (startsWithAny(value, compatibility.prefixes)) return "COMPATIBILITY";
  if (startsWithAny(value, current.prefixes)) return "CURRENT";
  if (startsWithAny(value, historical.prefixes)) return "HISTORICAL";
  return authority.classificationFallback || "UNCLASSIFIED";
}

function guidanceReferences(content) {
  const matches = String(content || "").match(
    /(?:\.intentos\/)?(?:core|docs|prompts|templates|checklists|platforms)\/[A-Za-z0-9._/-]+\.(?:md|json|ya?ml)/g,
  ) || [];
  return [...new Set(matches.map((value) => normalizeReviewContextPath(value)))];
}

function sourcePathForGuidanceReference(reference) {
  const normalized = normalizeReviewContextPath(reference);
  return normalized.startsWith(".intentos/") ? normalized.slice(".intentos/".length) : normalized;
}

function installedPathForGuidanceReference(reference, source, root) {
  const normalized = normalizeReviewContextPath(reference);
  if (normalized.startsWith(".intentos/")) return normalized;
  if (fs.existsSync(path.join(root, normalized))) return normalized;
  const managed = `.intentos/${source}`;
  return fs.existsSync(path.join(root, managed)) ? managed : normalized;
}

export function effectiveGuidanceGraph(
  authority = loadReviewContextAuthority(),
  installedLayout = false,
  root = defaultRoot,
) {
  const resolvedRoot = path.resolve(root);
  const prefixes = (authority.effectiveGuidanceReferencePrefixes || [])
    .map(normalizeReviewContextPath)
    .filter(Boolean);
  const nodes = new Map();
  const edges = [];
  const queue = [];

  const addNode = (source, file, registration, discoveredFrom = null) => {
    const normalizedSource = normalizeReviewContextPath(source);
    const normalizedFile = normalizeReviewContextPath(file);
    if (!normalizedSource || !normalizedFile || nodes.has(normalizedFile)) return;
    nodes.set(normalizedFile, {
      source: normalizedSource,
      path: normalizedFile,
      registration,
      discoveredFrom,
      classification: baseGuidanceClassification(normalizedSource, authority),
    });
    queue.push(normalizedFile);
  };

  for (const row of activeGuidanceRows(authority, resolvedRoot, installedLayout)) {
    const file = installedLayout ? row.installed : row.source;
    if (file) addNode(row.source, file, "ACTIVE_ROOT");
  }
  if (!installedLayout) {
    for (const producer of authority.activeGuidanceProducers || []) {
      addNode(producer.source, producer.source, "GENERATOR");
    }
  }

  for (let index = 0; index < queue.length; index += 1) {
    const fromPath = queue[index];
    const from = nodes.get(fromPath);
    const absolute = path.join(resolvedRoot, from.path);
    if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) continue;
    // Registry JSON contains asset paths as metadata, not user-facing guidance
    // references. Expanding those values would incorrectly promote current plans
    // and release evidence into the active guidance graph.
    if (path.extname(from.path).toLowerCase() === ".json") continue;
    for (const reference of guidanceReferences(fs.readFileSync(absolute, "utf8"))) {
      const source = sourcePathForGuidanceReference(reference);
      const allowed = prefixes.some((prefix) => source.startsWith(prefix));
      if (!allowed) continue;
      const classification = baseGuidanceClassification(source, authority);
      const targetPath = installedLayout
        ? installedPathForGuidanceReference(reference, source, resolvedRoot)
        : source;
      const referenceIsManaged = reference.startsWith(".intentos/");
      const targetExists = fs.existsSync(path.join(resolvedRoot, targetPath));
      if (!referenceIsManaged && !targetExists) continue;
      const active = !["HISTORICAL", "COMPATIBILITY"].includes(classification);
      edges.push({ from: from.path, to: targetPath, source, classification, active });
      if (active) addNode(source, targetPath, "REFERENCE", from.path);
    }
  }

  const materializedNodes = [...nodes.values()].map((node) => {
    const absolute = path.join(resolvedRoot, node.path);
    if (!fs.existsSync(absolute)) return { ...node, file_state: "MISSING", content_digest: "N/A" };
    const stat = fs.lstatSync(absolute);
    if (stat.isSymbolicLink()) return { ...node, file_state: "UNSAFE_SYMLINK", content_digest: "N/A" };
    if (!stat.isFile()) return { ...node, file_state: "NOT_REGULAR_FILE", content_digest: "N/A" };
    return {
      ...node,
      file_state: "CURRENT",
      content_digest: `sha256:${createHash("sha256").update(fs.readFileSync(absolute)).digest("hex")}`,
    };
  });
  const cycles = guidanceCycles(materializedNodes, edges);
  return {
    nodes: materializedNodes,
    edges,
    activePaths: materializedNodes.map((node) => node.path),
    cycles,
  };
}

function guidanceCycles(nodes, edges) {
  const known = new Set(nodes.map((node) => node.path));
  const graph = new Map([...known].map((value) => [value, []]));
  for (const edge of edges) {
    if (edge.active && known.has(edge.from) && known.has(edge.to)) graph.get(edge.from).push(edge.to);
  }
  const visiting = new Set();
  const visited = new Set();
  const stack = [];
  const cycles = [];
  const visit = (node) => {
    if (visiting.has(node)) {
      const start = stack.indexOf(node);
      cycles.push([...stack.slice(start), node]);
      return;
    }
    if (visited.has(node)) return;
    visiting.add(node);
    stack.push(node);
    for (const next of graph.get(node) || []) visit(next);
    stack.pop();
    visiting.delete(node);
    visited.add(node);
  };
  for (const node of known) visit(node);
  return cycles;
}

function canonicalGuidanceSource(value, authority, options = {}) {
  const normalized = normalizeReviewContextPath(value);
  const root = path.resolve(options.root || defaultRoot);
  const installedLayout = Boolean(options.installedLayout);
  for (const row of activeGuidanceRows(authority, root, installedLayout)) {
    if (normalizeReviewContextPath(row.source) === normalized) return normalizeReviewContextPath(row.source);
    if (normalizeReviewContextPath(row.installed) === normalized) return normalizeReviewContextPath(row.source);
  }
  for (const family of authority.activeGuidanceFamilies || []) {
    const sourcePrefix = normalizeReviewContextPath(family.sourcePrefix);
    const installedPrefix = normalizeReviewContextPath(family.installedPrefix);
    if (sourcePrefix && normalized.startsWith(`${sourcePrefix}/`)
      && fs.existsSync(path.join(defaultRoot, normalized))) return normalized;
    if (installedPrefix && normalized.startsWith(`${installedPrefix}/`)) {
      const candidate = `${sourcePrefix}/${normalized.slice(installedPrefix.length + 1)}`;
      if (fs.existsSync(path.join(defaultRoot, candidate))) return candidate;
    }
  }
  return "";
}

export function classifyReviewContextAsset(relativePath, authority = loadReviewContextAuthority(), options = {}) {
  const input = normalizeReviewContextPath(relativePath);
  if (!input) return "UNCLASSIFIED";
  const registeredSource = canonicalGuidanceSource(input, authority, options);
  const value = registeredSource || input;
  let classification = baseGuidanceClassification(value, authority);

  if (options.productDirection === true) {
    if (!registeredSource) return "UNCLASSIFIED";
  }

  if (classification === "CURRENT"
    && typeof options.content === "string"
    && analyzeActiveGuidanceConflicts(options.content).length > 0) {
    return "CONFLICTING";
  }
  return classification;
}

export function activeGuidancePaths(authority = loadReviewContextAuthority(), installedLayout = false, root = defaultRoot) {
  return effectiveGuidanceGraph(authority, installedLayout, root).activePaths;
}

const ACTIVE_GUIDANCE_CONFLICT_RULES = [
  {
    code: "MULTI_MODE_PRODUCT_SETUP",
    pattern: /(?:IntentOS|product|system|产品|系统).{0,45}(?:supports?|offers?|provides?|requires?|uses?|支持|提供|要求|采用).{0,55}(?:solo.{0,12}team.{0,12}enterprise|个人.{0,12}团队.{0,12}企业).{0,20}(?:modes?|模式|版本|档位)/i,
    message: "Active guidance positively defines multi-person product modes.",
  },
  {
    code: "INDUSTRIAL_DEPTH_IMPLIES_TEAM",
    pattern: /(?:BL2|industrial|工业级|工业包).{0,40}(?:requires?|needs?|must|要求|需要|必须).{0,30}(?:team|department|multiple people|团队|部门|多人|多个负责人)/i,
    message: "Active guidance requires people because of engineering depth.",
  },
  {
    code: "TECHNICAL_DECISION_DELEGATED_TO_USER",
    pattern: /^(?:[-*]\s*)?(?:the\s+user|user|human|developer|用户|你|开发者)\s+(?:(?:must|should|needs?\s+to|必须|应该|需要).{0,24}(?:choose|select|decide|approve|confirm|选择|决定|批准|确认)|(?:confirms?|approves?|chooses?|selects?|decides?|确认|批准|选择|决定)).{0,50}(?:architecture|stack|database|schema|baseline|pack|test strategy|reviewer|subagent|hook|checker|workflow|架构|技术栈|数据库|数据结构|基线|工业包|测试策略|审查方式|子代理|钩子|检查器|工作流)/i,
    message: "Active guidance delegates a technical decision to the user.",
  },
  {
    code: "TECHNICAL_CONFIRMATION_REQUIRED",
    pattern: /\b(?:human|humans|user|users|the user)\b.{0,45}(?:must|should|needs?\s+to|is\s+required\s+to|requires?|explicit(?:ly)?|必须|应该|需要|要求|明确).{0,20}(?:confirm|approve|decide|choose|select|确认|批准|决定|选择).{0,80}(?:architecture|stack|profile|baseline|BL[012]|industrial pack|pack selection|test strategy|reviewer|subagent|hook|checker|workflow|risk gate|approval scope|架构|技术栈|平台档案|基线|工业包|测试策略|审查方式|子代理|钩子|检查器|工作流|风险门禁|批准范围)|(?:人工|人类|用户).{0,35}(?:必须|应该|需要|要求|明确).{0,15}(?:确认|批准|决定|选择).{0,60}(?:架构|技术栈|平台档案|基线|工业包|测试策略|审查方式|子代理|钩子|检查器|工作流|风险门禁|批准范围)/i,
    message: "Active guidance requires user confirmation for a technical decision.",
  },
  {
    code: "TECHNICAL_CONFIRMATION_REQUIRED",
    pattern: /(?:architecture|stack|profile|baseline|BL[012]|industrial pack|pack selection|test strategy|reviewer|subagent|hook|checker|workflow|risk gate|approval scope|架构|技术栈|平台档案|基线|工业包|测试策略|审查方式|子代理|钩子|检查器|工作流|风险门禁|批准范围).{0,70}(?:requires?|needs?|must|only\s+after|until|before|without|要求|需要|必须|仅在|直到|之前|未经).{0,30}(?:\b(?:human|humans|user|users|the user)\b|人工|人类|用户).{0,20}(?:confirm|confirmation|approve|approval|确认|批准)/i,
    message: "Active guidance requires user confirmation for a technical decision.",
  },
  {
    code: "TECHNICAL_CHOICE_QUESTION",
    pattern: /^(?:[-*]\s*)?(?:(?:which|choose|select|confirm|decide|which one)\b|(?:请选择|选择|确认|决定)).{0,80}(?:architecture|stack|profile|baseline|BL[012]|industrial pack|pack|test strategy|reviewer|subagent|hook|checker|workflow|架构|技术栈|平台档案|基线|工业包|测试策略|审查方式|子代理|钩子|检查器|工作流)|(?:ask|require|prompt|tell).{0,20}(?:the\s+)?(?:user|human).{0,20}(?:to\s+)?(?:choose|select|confirm|decide).{0,80}(?:architecture|stack|profile|baseline|BL[012]|industrial pack|pack|test strategy|reviewer|subagent|hook|checker|workflow)/i,
    message: "Active guidance exposes a technical choice to the user.",
  },
  {
    code: "TECHNICAL_CHOICE_TABLE",
    pattern: /^\|[^\n]*(?:architecture|stack|profile|baseline|BL[012]|industrial pack|test strategy|reviewer|subagent|hook|checker|workflow|架构|技术栈|平台档案|基线|工业包|测试策略|审查方式|子代理|钩子|检查器|工作流)[^\n]*\|[^\n]*(?:user|human|用户|人工)[^\n]*(?:choose|select|confirm|approve|选择|确认|批准)[^\n]*\|/i,
    message: "Active guidance exposes a technical-choice table to the user.",
  },
  {
    code: "BLANKET_TECHNICAL_APPROVAL_GATE",
    pattern: /(?:any|every|任意|任何).{0,25}(?:risk gate|风险门禁).{0,70}(?:human approval|human confirmation|人工批准|人工确认).{0,35}(?:before implementation|before coding|实现前|编码前)|(?:risk gate|风险门禁).{0,45}(?:requires?|must|要求|必须).{0,20}(?:human approval|human confirmation|人工批准|人工确认)/i,
    message: "Active guidance makes a generic technical risk gate depend on human approval.",
  },
  {
    code: "INTERNAL_TECHNICAL_ROUTE_DELEGATED_TO_USER",
    pattern: /(?:\b(?:human|humans|user|users|the user)\b|人工|人类|用户).{0,45}(?:choose|select|decide|approve|confirm|review|merge|选择|决定|批准|确认|审查|合并).{0,90}(?:project profile|platform profile|architecture|technology strategy|technical stack|baseline|BL[012]|industrial pack|workflow asset|governance appendix|agent instructions|PR template|native migration|adapter docs?|apply plan|hook policy|archive plan|work queue takeover|release readiness|项目档案|平台档案|架构|技术策略|技术栈|基线|工业包|工作流资产|治理附录|代理指令|迁移路径|适配文档|应用计划|钩子策略|归档计划|任务队列接管|发布准备度)|(?:project profile|platform profile|architecture|technology strategy|technical stack|baseline|BL[012]|industrial pack|workflow asset|governance appendix|agent instructions|PR template|native migration|adapter docs?|apply plan|hook policy|archive plan|work queue takeover|release readiness|项目档案|平台档案|架构|技术策略|技术栈|基线|工业包|工作流资产|治理附录|代理指令|迁移路径|适配文档|应用计划|钩子策略|归档计划|任务队列接管|发布准备度).{0,90}(?:\b(?:human|humans|user|users|the user)\b|人工|人类|用户).{0,35}(?:choose|select|decide|approve|confirm|review|merge|选择|决定|批准|确认|审查|合并)/i,
    message: "Active guidance delegates an internal technical route or readiness judgment to the user.",
  },
  {
    code: "INTERNAL_DOMAIN_REQUIRES_SEPARATE_PERSON",
    pattern: /(?:the\s+user|user|用户|你).{0,24}(?:must|should|needs?\s+to|必须|应该|需要).{0,24}(?:find|assign|appoint|consult|找|指定|安排|咨询).{0,30}(?:release owner|security owner|data owner|technical owner|professional reviewer|technical expert|发布负责人|安全负责人|数据负责人|技术负责人|专业人员|技术专家)/i,
    message: "Active guidance requires the user to find an internal technical role.",
  },
  {
    code: "CURRENT_USER_IS_UNIVERSAL_EXTERNAL_AUTHORITY",
    pattern: /(?:CURRENT_CONVERSATION_USER|current user|当前用户|用户本人).{0,40}(?:authorizes?|approves?|overrides?|授权|批准|可以绕过).{0,35}(?:legal|provider|platform|production|release|regulator|法律|供应商|平台|生产|发布|监管)/i,
    message: "Active guidance gives the current user universal external authority.",
  },
];

export function analyzeActiveGuidanceConflicts(text) {
  const value = String(text || "");
  const segments = semanticSegments(value);
  const findings = [];
  for (const rule of ACTIVE_GUIDANCE_CONFLICT_RULES) {
    const matched = segments.find((segment) => rule.pattern.test(segment)
      && (!isExplicitSafetyNegation(segment) || negatedTechnicalPermissionGate(segment)));
    if (matched) findings.push({ code: rule.code, message: rule.message, evidence: matched });
  }
  const ambiguousAuthority = value.match(/\b(?:AI|Codex)\s+drafts?\s*[.!?;,:-]?\s*humans?\s+(?:decide|confirm)\b|\bhumans?\s+(?:decide|confirm)\s*[.!?;,:-]?\s*(?:AI|Codex)\s+drafts?\b|\bAI\s+proposes?\s*[.!?;,:-]?\s*humans?\s+approve\b|AI\s*起草.{0,12}(?:人|用户).{0,8}(?:决定|批准)|(?:人|用户).{0,8}(?:决定|批准).{0,12}AI\s*起草/i);
  if (ambiguousAuthority && !isExplicitSafetyNegation(ambiguousAuthority[0])) {
    findings.push({
      code: "AMBIGUOUS_HUMAN_TECHNICAL_AUTHORITY",
      message: "Active guidance gives humans ambiguous authority over technical work.",
      evidence: ambiguousAuthority[0],
    });
  }
  for (const section of humanOnlyDecisionSections(value)) {
    const technical = section.body.split(/\r?\n/).find((line) => technicalDecisionTerm(line) && !isExplicitSafetyNegation(line));
    if (technical) {
      findings.push({
        code: "TECHNICAL_DECISION_IN_HUMAN_ONLY_SECTION",
        message: "A human-only decision section contains a technical decision.",
        evidence: `${section.heading}: ${technical.trim()}`,
      });
      break;
    }
  }
  return findings;
}

function semanticSegments(text) {
  const blocks = [];
  let current = "";
  const flush = () => {
    if (current.trim()) blocks.push(current.trim());
    current = "";
  };
  for (const rawLine of String(text || "").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) {
      flush();
      continue;
    }
    if (/^(?:#{1,6}\s+|[-*+]\s+|\d+[.)]\s+|\|)/.test(line)) {
      flush();
      current = line;
      continue;
    }
    current = current ? `${current} ${line}` : line;
  }
  flush();
  return blocks.flatMap((block) => block.split(/(?<=[.!?。！？])\s+/).map((item) => item.trim()).filter(Boolean));
}

function humanOnlyDecisionSections(text) {
  const lines = String(text || "").split(/\r?\n/);
  const sections = [];
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    const heading = /^#{1,6}\s+(?:Human-Only Decisions|Human Decisions|Decisions For The Human|用户决定|仅限人工决定)\s*$/i.test(line);
    const label = /^(?:\*\*)?(?:Humans? decides?|The human decides?|The human is responsible for|Decisions for the human|Human decisions|用户决定|用户负责|人工决定)(?:\*\*)?\s*:\s*$/i.test(line);
    if (!heading && !label) continue;
    const body = [];
    for (let cursor = index + 1; cursor < lines.length && !/^#{1,6}\s+/.test(lines[cursor].trim()); cursor += 1) {
      if (label && lines[cursor].trim() && !/^[-*+]\s+|^\d+[.)]\s+/.test(lines[cursor].trim())) break;
      body.push(lines[cursor]);
    }
    sections.push({ heading: line, body: body.join("\n") });
  }
  return sections;
}

function technicalDecisionTerm(text) {
  return /(?:architecture|technical stack|technology stack|stack approval|database|schema|profile|baseline|BL[012]|industrial pack|test strategy|reviewer|subagent|hook|checker|workflow|risk acceptance|high-risk boundar|first vertical slice approval|onboarding is ready|goal mode|工程架构|技术栈|数据库|数据结构|平台档案|基线|工业包|测试策略|审查方式|子代理|钩子|检查器|工作流|风险接受|高风险边界)/i.test(String(text || ""));
}

function isExplicitSafetyNegation(text) {
  return /\b(?:must|should|does|do|is|are|can|cannot|can't|need)\s+not\b|\b(?:does not|do not|must not|should not|cannot|not required|not user[- ]selected|separated from human selection|never|no longer)\b|(?:不得|不应|不能|不需要|无需|禁止|不会|并不|不再)/i.test(text);
}

function negatedTechnicalPermissionGate(text) {
  return /(?:do not|must not|cannot|不得|不能|禁止).{0,80}(?:architecture|stack|profile|baseline|BL[012]|industrial pack|pack|test strategy|reviewer|subagent|hook|checker|workflow|架构|技术栈|平台档案|基线|工业包|测试策略|审查方式|子代理|钩子|检查器|工作流).{0,45}(?:without|until|before|未经|直到|之前).{0,25}(?:\b(?:human|user)\b|人工|用户).{0,15}(?:confirm|confirmation|approve|approval|确认|批准)/i.test(String(text || ""));
}

function contextContractPayload(authority) {
  return {
    schemaVersion: authority.schemaVersion,
    contractId: authority.contractId,
    classificationFallback: authority.classificationFallback,
    currentProductContract: authority.currentProductContract,
    precedence: authority.precedence,
    classifications: authority.classifications,
    activeGuidance: authority.activeGuidance,
    activeGuidanceFamilies: authority.activeGuidanceFamilies,
    activeGuidanceProducers: authority.activeGuidanceProducers,
    effectiveGuidanceReferencePrefixes: authority.effectiveGuidanceReferencePrefixes,
    reviewBinding: authority.reviewBinding,
    compatibilityFields: authority.compatibilityFields,
    forbiddenReviewInferences: authority.forbiddenReviewInferences,
    boundaries: authority.boundaries,
  };
}

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

export function reviewContextDigest(authority = loadReviewContextAuthority()) {
  return `sha256:${createHash("sha256").update(stableStringify(contextContractPayload(authority))).digest("hex")}`;
}

export function reviewContextBinding(authority = loadReviewContextAuthority()) {
  return {
    contract_id: authority.contractId,
    context_version: authority.schemaVersion,
    context_digest: reviewContextDigest(authority),
  };
}

function markdownValue(content, label) {
  const pattern = new RegExp(`^${label}:[^\\S\\r\\n]*(.+)$`, "im");
  const match = String(content || "").match(pattern);
  return match ? match[1].replaceAll("`", "").trim() : "";
}

export function reviewContextBindingFromMarkdown(content) {
  const value = String(content || "");
  const heading = /^## Current Review Context Binding\s*$/gim;
  const matches = [...value.matchAll(heading)];
  const sectionStart = matches.length === 1 ? matches[0].index + matches[0][0].length : -1;
  const tail = sectionStart >= 0 ? value.slice(sectionStart) : "";
  const nextHeading = tail.search(/^##\s+/m);
  const section = sectionStart >= 0 ? (nextHeading >= 0 ? tail.slice(0, nextHeading) : tail) : "";
  const labelsOutsideSection = ["Contract ID", "Context version", "Context digest"]
    .filter((label) => markdownValue(value.replace(section, ""), label));
  return {
    contract_id: markdownValue(section, "Contract ID"),
    context_version: markdownValue(section, "Context version"),
    context_digest: markdownValue(section, "Context digest"),
    section_count: matches.length,
    out_of_section_fields: labelsOutsideSection,
  };
}

export function validateReviewContextBinding(binding, authority = loadReviewContextAuthority()) {
  const expected = reviewContextBinding(authority);
  const observed = binding || {};
  const present = Object.values(observed).some(Boolean);
  if (!present) {
    return {
      ok: false,
      legacy: true,
      errors: ["review context binding is missing"],
      expected,
    };
  }
  const errors = [];
  if (observed.section_count !== undefined && observed.section_count !== 1) {
    errors.push("exactly one Current Review Context Binding section is required");
  }
  if (Array.isArray(observed.out_of_section_fields) && observed.out_of_section_fields.length > 0) {
    errors.push(`review context fields outside binding section: ${observed.out_of_section_fields.join(", ")}`);
  }
  for (const field of ["contract_id", "context_version", "context_digest"]) {
    if (observed[field] !== expected[field]) {
      errors.push(`${field} must match current review context`);
    }
  }
  return { ok: errors.length === 0, legacy: false, errors, expected };
}

const REVIEW_DRIFT_RULES = [
  {
    code: "MULTI_MODE_PRODUCT_SETUP",
    pattern: /(?:introduce|add|create|recommend|建议|新增|设置|划分).{0,40}(?:solo\s*\/\s*team\s*\/\s*enterprise|solo,?\s*team,?\s*(?:and\s*)?enterprise|个人版.{0,12}团队版.{0,12}企业版|单人.{0,12}团队.{0,12}企业).{0,20}(?:mode|模式|版本|档位)?/i,
    message: "Review proposes multi-person product setup modes.",
  },
  {
    code: "INDUSTRIAL_DEPTH_IMPLIES_TEAM",
    pattern: /(?:BL2|industrial|工业级|工业包|high[- ]risk).{0,50}(?:requires?|needs?|must|意味着|需要|必须).{0,30}(?:team|department|multiple people|多人|团队|部门|多个负责人)/i,
    message: "Review infers a team from engineering depth.",
  },
  {
    code: "TECHNICAL_DECISION_DELEGATED_TO_USER",
    pattern: /(?:user|you|用户|你).{0,35}(?:choose|select|decide|approve|选择|决定|确认|批准).{0,45}(?:architecture|stack|database|schema|BL[012]|baseline|pack|test strategy|reviewer|subagent|hook|checker|workflow|架构|技术栈|数据库|数据结构|基线|工业包|测试策略|审查方式|子代理|钩子|检查器|工作流)/i,
    message: "Review delegates a technical decision to the user.",
  },
  {
    code: "INTERNAL_DOMAIN_REQUIRES_SEPARATE_PERSON",
    pattern: /(?:find|assign|appoint|ask|consult|找|指定|安排|聘请|咨询).{0,35}(?:release owner|security owner|data owner|technical owner|professional reviewer|technical expert|发布负责人|安全负责人|数据负责人|技术负责人|专业人员|技术专家)/i,
    message: "Review converts an internal safeguard into a person the user must find.",
  },
  {
    code: "HISTORICAL_RECORD_DEFINES_CURRENT_DIRECTION",
    pattern: /(?:because|based on|according to|根据|因为|按照).{0,30}(?:old|previous|historical|prior|旧版|历史|此前).{0,30}(?:release|plan|record|版本|方案|记录).{0,70}(?:(?:current|next|2\.0|当前|下一版|后续).{0,25}(?:should|must|recommend|应该|必须|建议)|(?:should|must|recommend|应该|必须|建议).{0,25}(?:current|next|2\.0|当前|下一版|后续))/i,
    message: "Review uses historical material as current product authority.",
  },
  {
    code: "COMPATIBILITY_FIELD_DEFINES_PUBLIC_ROLE",
    pattern: /(?:release_owner_ref|cost_owner_ref|platform_owner_ref|production_owner_ref|human_decision).{0,70}(?:means|requires|therefore|表示|意味着|所以).{0,70}(?:team|owner|department|团队|负责人|部门)/i,
    message: "Review interprets a compatibility field as a public role instruction.",
  },
  {
    code: "AVAILABLE_CAPABILITY_EXPANDS_PRODUCT_SCOPE",
    pattern: /(?:because|since|given|因为|既然|由于).{0,35}(?:pack|profile|platform|provider|capability|工业包|档位|平台|供应商|能力).{0,35}(?:exists|available|present|存在|可用|已经有).{0,45}(?:enable|implement|add|activate|启用|实现|增加|接入).{0,30}(?:all|every|全部|所有|完整能力)/i,
    message: "Review expands product scope from available technical capability.",
  },
  {
    code: "CURRENT_USER_IS_UNIVERSAL_EXTERNAL_AUTHORITY",
    pattern: /(?:CURRENT_CONVERSATION_USER|current user|当前用户|用户本人).{0,45}(?:proves|authorizes|can override|automatically approves|证明|授权|可以绕过|自动批准).{0,35}(?:legal|provider|platform|production|release|regulator|法律|供应商|平台|生产|发布|监管)/i,
    message: "Review treats the current user as universal external authority.",
  },
];

export function analyzeReviewRecommendation(text) {
  const value = String(text || "");
  return REVIEW_DRIFT_RULES
    .filter((rule) => rule.pattern.test(value))
    .map(({ code, message }) => ({ code, message }));
}

export function evaluateCurrentConversationAuthority(options = {}) {
  const authorityKind = String(options.authorityKind || "").toUpperCase();
  const exactEffectBound = options.exactEffectBound === true;
  const evidenceReady = options.evidenceReady === true;
  const rollbackPrepared = options.rollbackPrepared === true;
  const irreversibilityExplained = options.irreversibilityExplained === true;
  const consentPrepared = exactEffectBound
    && evidenceReady
    && (rollbackPrepared || irreversibilityExplained);

  if (["LEGAL_IDENTITY", "REGULATORY_FACT", "EXTERNAL_PROVIDER_AUTHORITY", "THIRD_PARTY_PERMISSION"].includes(authorityKind)) {
    return {
      canRecordConsent: false,
      satisfiesExternalAuthority: false,
      reason: "The current conversation identity cannot prove an external fact or third-party authority.",
    };
  }

  if (["REAL_WORLD_EFFECT_CONSENT", "PROJECT_LOCAL_APPLY_CONSENT"].includes(authorityKind)) {
    return {
      canRecordConsent: consentPrepared,
      satisfiesExternalAuthority: false,
      reason: consentPrepared
        ? "Consent is bounded to the exact prepared effect."
        : "Exact effect, evidence, and rollback or irreversibility must be prepared first.",
    };
  }

  return {
    canRecordConsent: false,
    satisfiesExternalAuthority: false,
    reason: "The requested authority class is not a bounded current-user consent class.",
  };
}

export function reviewContextHeader(version = REVIEW_CONTEXT_VERSION) {
  return [
    `Current IntentOS review context: ${version}.`,
    `Default user model: ${CURRENT_OPERATING_MODEL}.`,
    "Current product contracts override compatibility schemas and historical records.",
    "Industrial depth does not imply teams or additional people.",
    "The user provides business facts and concrete real-world consent; IntentOS/Codex owns technical decisions and internal workflow.",
  ].join("\n");
}
