import { createHash } from "node:crypto";

const yamlWorkflowPathPattern = /(^|\/)\.github\/workflows\/.*\.ya?ml$|\.ya?ml$/i;
const executableFenceLanguages = new Set([
  "bash",
  "cjs",
  "javascript",
  "js",
  "jsx",
  "node",
  "powershell",
  "python",
  "sh",
  "shell",
  "sql",
  "ts",
  "tsx",
  "typescript",
  "zsh",
]);

export function isPlainTextDiagram(language, lines) {
  const normalizedLanguage = String(language || "text").toLowerCase();
  if (!["text", "txt", "plaintext", "mermaid"].includes(normalizedLanguage)) return false;
  const nonempty = lines.map(normalizeText).filter(Boolean);
  if (nonempty.length < 2) return false;
  const joined = nonempty.join("\n");
  const hasDiagramShape = /(?:->|=>|-->|→|←|⇢|\|\s*$|^[+|].*[+|]$)|\b(?:graph|flowchart|sequenceDiagram)\b/m.test(joined);
  const hasExecutableCommand = nonempty.some((line) => /^(?:npm|pnpm|yarn|node|git|bash|sh|zsh|curl|docker|kubectl|rm|mv|cp|python|python3|psql)\b/i.test(line));
  return hasDiagramShape && !hasExecutableCommand;
}

export function buildNativeRuleBlockLedger(content, sourceFile, rules, coverage) {
  const blocks = yamlWorkflowPathPattern.test(String(sourceFile || ""))
    ? segmentYamlBlocks(content)
    : segmentMarkdownBlocks(content);
  const unresolved = [
    ...(coverage.unclassified_blocks || []),
    ...(coverage.skipped_blocks || []),
    ...(coverage.low_signal_blocks || []).filter((block) => block.disposition !== "RESOLVED_NON_RULE"),
  ];
  const resolvedNonRules = (coverage.low_signal_blocks || [])
    .filter((block) => block.disposition === "RESOLVED_NON_RULE");
  const occurrences = new Map();
  return blocks.map((block) => {
    const matchingUnresolved = unresolved.filter((item) => blockRangesIntersect(block, item));
    const matchingResolved = resolvedNonRules.filter((item) => blockRangesIntersect(block, item));
    const matchingRules = rules.filter((rule) => blockRangesIntersect(block, rule));
    let disposition = "PRESERVED_CONTEXT";
    let reason = block.type === "TEXT_DIAGRAM"
      ? "typed text diagram preserved as project context"
      : block.type === "EXECUTABLE_CODE"
        ? "typed executable code preserved without granting execution authority"
        : "content block preserved as project context";
    if (matchingUnresolved.length > 0) {
      disposition = "NEEDS_REVIEW";
      reason = matchingUnresolved.map((item) => item.reason).filter(Boolean).join("; ") || "content block requires deterministic review";
    } else if (matchingResolved.length > 0) {
      disposition = "RESOLVED_NON_RULE";
      reason = matchingResolved.map((item) => item.reason).filter(Boolean).join("; ") || "content block is a resolved non-rule";
    } else if (matchingRules.length > 0) {
      disposition = "EXTRACTED_RULE";
      reason = `${matchingRules.length} deterministic rule(s) extracted from this block`;
    }
    const digestValue = nativeBlockDigestValue(sourceFile, block.type, block.contextHeading, block.content);
    const occurrence = (occurrences.get(digestValue) || 0) + 1;
    occurrences.set(digestValue, occurrence);
    return {
      block_id: `NB-${digestValue.slice(0, 24)}-${occurrence}`,
      block_digest: `sha256:${digestValue}`,
      block_type: block.type,
      source_start_line: block.start,
      source_end_line: block.end,
      context_heading: block.contextHeading,
      disposition,
      rule_count: matchingRules.length,
      reason,
    };
  });
}

export function createSyntheticNativeRuleBlock(options = {}) {
  const sourceFile = requiredText(options.sourceFile, "synthetic native rule source");
  const contextHeading = requiredText(options.contextHeading, "synthetic native rule context");
  const observation = requiredText(options.observation, "synthetic native rule observation");
  const reason = requiredText(options.reason, "synthetic native rule reason");
  const ruleCount = Number(options.ruleCount ?? 1);
  if (!Number.isInteger(ruleCount) || ruleCount < 0) {
    throw new Error("synthetic native rule count must be a non-negative integer");
  }
  const digestValue = nativeBlockDigestValue(
    sourceFile,
    "SYNTHETIC_OBSERVATION",
    contextHeading,
    observation,
  );
  return {
    block_id: `NB-${digestValue.slice(0, 24)}-1`,
    block_digest: `sha256:${digestValue}`,
    block_type: "SYNTHETIC_OBSERVATION",
    source_start_line: 1,
    source_end_line: 1,
    context_heading: contextHeading,
    disposition: ruleCount > 0 ? "EXTRACTED_RULE" : "PRESERVED_CONTEXT",
    rule_count: ruleCount,
    reason,
  };
}

export function validateNativeRuleBlockCoverage(rules = [], coverage = {}) {
  const errors = [];
  const sourceFile = String(coverage?.source_file || "");
  const sourceRules = Array.isArray(rules) ? rules : [];
  const ledger = Array.isArray(coverage?.block_ledger) ? coverage.block_ledger : [];
  const extractedCount = Number(coverage?.rules_extracted);
  const ledgerRuleCount = ledger.reduce((sum, block) => sum + Number(block?.rule_count || 0), 0);

  if (!Number.isInteger(extractedCount) || extractedCount < 0) {
    errors.push(`${sourceFile || "native rule source"} rules_extracted is invalid`);
  } else if (extractedCount !== sourceRules.length) {
    errors.push(`${sourceFile || "native rule source"} rules_extracted must exactly match its rule classifications`);
  }
  if (Number.isInteger(extractedCount) && ledgerRuleCount !== extractedCount) {
    errors.push(`${sourceFile || "native rule source"} block ledger rule count must exactly match rules_extracted`);
  }

  for (const rule of sourceRules) {
    const ruleSource = String(rule?.source_file ?? rule?.sourceFile ?? "");
    const start = Number(rule?.source_start_line ?? rule?.sourceStartLine);
    const end = Number(rule?.source_end_line ?? rule?.sourceEndLine);
    if (sourceFile && ruleSource !== sourceFile) {
      errors.push(`${sourceFile} coverage includes a rule from another source: ${ruleSource || "<missing>"}`);
      continue;
    }
    const matches = ledger.filter((block) => blockRangesIntersect(block, {
      source_start_line: start,
      source_end_line: end,
    }));
    if (matches.length !== 1) {
      errors.push(`${sourceFile || "native rule source"}:${start}-${end} must belong to exactly one ledger block`);
    } else if (matches[0].disposition !== "EXTRACTED_RULE") {
      errors.push(`${sourceFile || "native rule source"}:${start}-${end} belongs to a non-rule ledger block`);
    }
  }

  for (const block of ledger) {
    const matchingRules = sourceRules.filter((rule) => blockRangesIntersect(block, {
      source_start_line: Number(rule?.source_start_line ?? rule?.sourceStartLine),
      source_end_line: Number(rule?.source_end_line ?? rule?.sourceEndLine),
    }));
    if (Number(block?.rule_count) !== matchingRules.length) {
      errors.push(`${sourceFile || "native rule source"} block ${block?.block_id || "<unknown>"} rule count does not match its exact rule ownership`);
    }
  }
  return [...new Set(errors)];
}

function nativeBlockDigestValue(sourceFile, blockType, contextHeading, content) {
  return createHash("sha256")
    .update(`${sourceFile}\0${blockType}\0${contextHeading}\0${normalizeText(content)}`)
    .digest("hex");
}

function requiredText(value, label) {
  const normalized = normalizeText(value);
  if (!normalized) throw new Error(`${label} is required`);
  return normalized;
}

function segmentMarkdownBlocks(content) {
  const lines = String(content || "").split(/\r?\n/);
  const blocks = [];
  const headingStack = [];
  for (let index = 0; index < lines.length;) {
    const lineNumber = index + 1;
    const trimmed = lines[index].trim();
    if (!trimmed) {
      index += 1;
      continue;
    }
    const fence = trimmed.match(/^```([A-Za-z0-9_-]*)/);
    if (fence) {
      const language = fence[1] || "text";
      const start = lineNumber;
      const inner = [];
      index += 1;
      while (index < lines.length && !lines[index].trim().startsWith("```")) {
        inner.push(lines[index].trim());
        index += 1;
      }
      const closed = index < lines.length;
      const end = closed ? index + 1 : lines.length;
      if (closed) index += 1;
      blocks.push({
        type: codeFenceBlockType(language, inner),
        start,
        end,
        contextHeading: currentHeading(headingStack),
        content: [trimmed, ...inner, ...(closed ? ["```"] : [])].join("\n"),
      });
      continue;
    }
    if (looksLikeMarkdownTable(trimmed)) {
      const start = lineNumber;
      const tableLines = [];
      while (index < lines.length && looksLikeMarkdownTable(lines[index].trim())) {
        tableLines.push(lines[index].trim());
        index += 1;
      }
      blocks.push({
        type: "TABLE",
        start,
        end: start + tableLines.length - 1,
        contextHeading: currentHeading(headingStack),
        content: tableLines.join("\n"),
      });
      continue;
    }
    const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      headingStack.splice(level - 1);
      headingStack[level - 1] = normalizeText(heading[2]);
      blocks.push({
        type: "HEADING",
        start: lineNumber,
        end: lineNumber,
        contextHeading: currentHeading(headingStack),
        content: trimmed,
      });
      index += 1;
      continue;
    }
    blocks.push({
      type: /^(?:[-*+]|\d+\.)\s+/.test(trimmed) ? "LIST_ITEM" : "PARAGRAPH",
      start: lineNumber,
      end: lineNumber,
      contextHeading: currentHeading(headingStack),
      content: trimmed,
    });
    index += 1;
  }
  return blocks;
}

function segmentYamlBlocks(content) {
  const lines = String(content || "").split(/\r?\n/);
  return lines.flatMap((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return [];
    return [{
      type: trimmed.startsWith("#") ? "YAML_CONTEXT" : "YAML_ENTRY",
      start: index + 1,
      end: index + 1,
      contextHeading: "CI workflow root",
      content: trimmed,
    }];
  });
}

function codeFenceBlockType(language, lines) {
  if (isPlainTextDiagram(language, lines)) return "TEXT_DIAGRAM";
  const normalizedLanguage = String(language || "text").toLowerCase();
  if (executableFenceLanguages.has(normalizedLanguage)
    || lines.some((line) => /^(?:npm|pnpm|yarn|node|git|bash|sh|zsh|curl|docker|kubectl|rm|mv|cp|python|python3|psql)\b/i.test(normalizeText(line)))) {
    return "EXECUTABLE_CODE";
  }
  return "CODE_FENCE";
}

function blockRangesIntersect(left, right) {
  const leftStart = Number(left.start ?? left.source_start_line ?? 0);
  const leftEnd = Number(left.end ?? left.source_end_line ?? leftStart);
  const rightStart = Number(right.start ?? right.source_start_line ?? 0);
  const rightEnd = Number(right.end ?? right.source_end_line ?? rightStart);
  return leftStart <= rightEnd && rightStart <= leftEnd;
}

function currentHeading(stack) {
  return stack.filter(Boolean).join(" > ") || "root";
}

function looksLikeMarkdownTable(value) {
  return value.startsWith("|") || /^:?-{3,}:?$/.test(value);
}

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}
