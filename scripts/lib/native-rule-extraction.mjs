const ruleKeywords = [
  "must",
  "should",
  "cannot",
  "never",
  "required",
  "approve",
  "approval",
  "preserve",
  "replace",
  "archive",
  "release",
  "rollback",
  "deploy",
  "production",
  "baseline",
  "workflow",
  "codex",
  "agent",
  "enum",
  "schema",
  "permission",
  "payment",
  "tax",
  "finance",
  "contract",
  "customer",
  "data",
  "hook",
  "CI",
  "客户",
  "合同",
  "协议",
  "订单",
  "发票",
  "税务",
  "结算",
  "财务",
  "门店",
  "审批",
  "权限",
  "角色",
  "数据",
  "隐私",
  "合规",
  "生产",
  "上线",
  "发布",
  "回滚",
  "事故",
  "密钥",
  "任务",
  "审查",
  "证据",
  "复盘",
  "计划",
  "执行",
  "验收",
];

const productionPattern = /\b(release|rollback|deploy|deployment|production|prod|incident|secret|migration|provider|staging|backup|restore|app store review|mini program review)\b|生产|上线|发布|回滚|事故|密钥|生产配置/i;
const businessPattern = /\b(customer|user-visible|business|contract|invoice|tax|finance|hr|payment|permission|data meaning|contract meaning|tax meaning|legal|compliance|approval limit|role changes?)\b|客户|合同|协议|订单|发票|税务|结算|财务|门店|审批|权限|角色|客户数据|隐私|合规/i;
const engineeringPattern = /\b(enum|string|schema|dto|type|architecture|build|test|lint|package|database|api|folder|structure|dependency|frontend|backend|component)\b|枚举|数据库|接口|组件|构建|测试|目录|依赖/i;
const workflowPattern = /\b(codex|ai|agent|workflow|review|approval|apply|task|commit|pr|pull request|prompt|subagent|finish|queue|evidence|plan)\b|任务|审查|证据|复盘|计划|执行|验收|工作流/i;
const historicalPattern = /\b(historical|legacy|old note|deprecated|stale|archive|todo|temporary)\b|历史|废弃|过期|归档|临时/i;
const governanceHeadingPattern = /\b(rule|rules|governance|policy|policies|constraint|constraints|baseline|release|permission|approval|workflow|agent|codex|业务|规则|治理|基线|发布|权限|审批|流程)\b/i;
const tableRuleHeaders = new Set([
  "rule",
  "requirement",
  "handling",
  "policy",
  "constraint",
  "规则",
  "要求",
  "处理",
  "治理",
]);

export function extractNativeRulesFromMarkdown(content, sourceFile) {
  const lines = content.split(/\r?\n/);
  const headingStack = [];
  const rules = [];
  const unclassifiedBlocks = [];
  const skippedBlocks = [];
  const lowSignalBlocks = [];
  const parserWarnings = [];
  let fenced = false;
  let fenceStart = 0;
  let fenceLanguage = "";
  let currentCode = [];
  let tableBlock = null;

  for (let index = 0; index < lines.length; index += 1) {
    const lineNumber = index + 1;
    const raw = lines[index];
    const trimmed = raw.trim();
    if (tableBlock && !looksLikeMarkdownTable(trimmed)) {
      flushTableBlock(tableBlock, rules, skippedBlocks, lowSignalBlocks, parserWarnings, sourceFile);
      tableBlock = null;
    }
    const fence = trimmed.match(/^```([A-Za-z0-9_-]*)/);
    if (fence) {
      if (!fenced) {
        fenced = true;
        fenceStart = lineNumber;
        fenceLanguage = fence[1] || "text";
        currentCode = [];
      } else {
        fenced = false;
        if (currentCode.some((line) => hasRuleSignal(line))) {
          const excerpt = normalizeExcerpt(currentCode.join(" "));
          unclassifiedBlocks.push({
            source_file: sourceFile,
            source_start_line: fenceStart,
            source_end_line: lineNumber,
            context_heading: currentHeading(headingStack),
            excerpt,
            reason: "Fenced code block may contain commands or rules; classify manually before migration.",
          });
          parserWarnings.push(`${sourceFile}:${fenceStart}-${lineNumber} fenced ${fenceLanguage} block needs manual classification`);
        }
      }
      continue;
    }
    if (fenced) {
      currentCode.push(trimmed);
      continue;
    }

    const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      headingStack.splice(level - 1);
      headingStack[level - 1] = normalizeText(heading[2]);
      continue;
    }

    if (looksLikeMarkdownTable(trimmed)) {
      if (!tableBlock) {
        tableBlock = {
          start: lineNumber,
          end: lineNumber,
          contextHeading: currentHeading(headingStack),
          lines: [],
        };
      }
      tableBlock.end = lineNumber;
      tableBlock.lines.push({ lineNumber, text: trimmed });
      continue;
    }

    const candidate = candidateText(trimmed);
    if (!candidate) {
      if (trimmed.length > 220) {
        skippedBlocks.push({
          source_file: sourceFile,
          source_start_line: lineNumber,
          source_end_line: lineNumber,
          context_heading: currentHeading(headingStack),
          excerpt: normalizeExcerpt(trimmed),
          reason: "Long paragraph skipped by deterministic extractor; review manually before migration.",
        });
        parserWarnings.push(`${sourceFile}:${lineNumber}-${lineNumber} long paragraph skipped by deterministic extractor`);
      }
      continue;
    }
    if (!hasRuleSignal(candidate) && !hasRuleSignal(currentHeading(headingStack))) {
      if (governanceHeadingPattern.test(currentHeading(headingStack))) {
        lowSignalBlocks.push({
          source_file: sourceFile,
          source_start_line: lineNumber,
          source_end_line: lineNumber,
          context_heading: currentHeading(headingStack),
          excerpt: normalizeExcerpt(candidate),
          reason: "Low-signal text under a governance-like heading was not classified automatically.",
        });
        parserWarnings.push(`${sourceFile}:${lineNumber}-${lineNumber} low-signal governance text needs manual review`);
      }
      continue;
    }

    const classification = classifyNativeRule({
      sourceFile,
      text: candidate,
      contextHeading: currentHeading(headingStack),
    });
    rules.push({
      source_file: sourceFile,
      source_start_line: lineNumber,
      source_end_line: lineNumber,
      source_excerpt: normalizeExcerpt(candidate),
      context_heading: currentHeading(headingStack),
      detected_terms: detectedTerms(candidate, currentHeading(headingStack)),
      ...classification,
    });
  }

  if (tableBlock) flushTableBlock(tableBlock, rules, skippedBlocks, lowSignalBlocks, parserWarnings, sourceFile);

  if (fenced) {
    unclassifiedBlocks.push({
      source_file: sourceFile,
      source_start_line: fenceStart,
      source_end_line: lines.length,
      context_heading: currentHeading(headingStack),
      excerpt: normalizeExcerpt(currentCode.join(" ")),
      reason: "Unclosed fenced code block; classify manually before migration.",
    });
    parserWarnings.push(`${sourceFile}:${fenceStart}-${lines.length} unclosed fenced block`);
  }

  return {
    rules,
    coverage: {
      source_file: sourceFile,
      lines_scanned: lines.length,
      rules_extracted: rules.length,
      unclassified_blocks: unclassifiedBlocks,
      skipped_blocks: skippedBlocks,
      low_signal_blocks: lowSignalBlocks,
      parser_warnings: parserWarnings,
    },
  };
}

export function classifyNativeRule({ sourceFile, text, contextHeading = "" }) {
  const value = `${sourceFile} ${contextHeading} ${text}`;
  if (productionPattern.test(value)) {
    return ruleClass("PRODUCTION_CONTROL", "project/release owner", "preserve and escalate", "preserve", "Release and production controls remain external to IntentOS workflow convenience.", "release, production", "map to Release Guide / Recipe / Handoff without replacement", "Yes", confidence(value, productionPattern));
  }
  if (businessPattern.test(value)) {
    return ruleClass("BUSINESS_FACT", "project owner", "preserve or escalate", "preserve", "Business facts are project-owned and cannot be replaced by workflow migration.", "business, data", "preserve as project constraint", "Yes", confidence(value, businessPattern));
  }
  if (engineeringPattern.test(value)) {
    return ruleClass("ENGINEERING_BASELINE", "project baseline", "migrate into IntentOS baseline after review", "map", "Engineering rules can become baseline evidence after review.", "engineering", "map to engineering/environment baseline", "Yes", confidence(value, engineeringPattern));
  }
  if (workflowPattern.test(value)) {
    return ruleClass("WORKFLOW_RULE", "old workflow source", "replace after reviewed plan and approval", "replace", "Old AI workflow guidance can move under IntentOS workflow authority after approval.", "workflow", "replace with IntentOS workflow rule through apply-plan", "Yes", confidence(value, workflowPattern));
  }
  if (historicalPattern.test(value)) {
    return ruleClass("HISTORICAL_NOTE", "project history", "archive suggestion", "archive suggestion", "Historical notes should not be deleted by default.", "documentation", "propose archive only after owner review", "Yes", "MEDIUM");
  }
  return ruleClass("UNKNOWN_AUTHORITY", "unknown", "stop for classification", "preserve until classified", "The source needs an owner or current authority decision before migration.", "workflow", "ask human to classify authority", "Yes", "LOW");
}

function candidateText(trimmed) {
  const bullet = trimmed.match(/^(?:[-*+]|\d+\.)\s+(?:\[[ xX]\]\s*)?(.*)$/);
  if (bullet) return normalizeText(bullet[1]);
  if (trimmed.length > 0 && trimmed.length <= 220 && /[.!?:：。]$/.test(trimmed)) return normalizeText(trimmed);
  return "";
}

function currentHeading(stack) {
  return stack.filter(Boolean).join(" > ") || "root";
}

function hasRuleSignal(value) {
  return ruleKeywords.some((keyword) => keywordMatches(value, keyword));
}

function detectedTerms(text, heading) {
  const value = `${heading} ${text}`;
  return ruleKeywords.filter((keyword) => keywordMatches(value, keyword));
}

function ruleClass(ruleClassValue, authority, defaultHandling, preserveOrReplace, reason, riskSurfaces, targetAction, humanDecisionRequired, confidenceValue) {
  return {
    rule_class: ruleClassValue,
    authority,
    default_handling: defaultHandling,
    preserve_or_replace: preserveOrReplace,
    reason,
    risk_surfaces: riskSurfaces,
    target_action: targetAction,
    human_decision_required: humanDecisionRequired,
    confidence: confidenceValue,
  };
}

function confidence(value, pattern) {
  const matches = value.match(pattern);
  return matches && matches.length > 0 ? "HIGH" : "MEDIUM";
}

function looksLikeMarkdownTable(value) {
  return value.startsWith("|") || /^:?-{3,}:?$/.test(value);
}

function flushTableBlock(block, rules, skippedBlocks, lowSignalBlocks, parserWarnings, sourceFile) {
  if (!block || block.lines.length === 0) return;
  const table = parseSimpleTable(block);
  if (table) {
    for (const row of table.rows) {
      const candidate = normalizeText(row.cells.map((cell, index) => `${table.headers[index]}: ${cell}`).join(" "));
      if (!hasRuleSignal(candidate) && !hasRuleSignal(block.contextHeading)) {
        lowSignalBlocks.push({
          source_file: sourceFile,
          source_start_line: row.lineNumber,
          source_end_line: row.lineNumber,
          context_heading: block.contextHeading,
          excerpt: normalizeExcerpt(candidate),
          reason: "Low-signal row in a simple Markdown table was not classified automatically.",
        });
        parserWarnings.push(`${sourceFile}:${row.lineNumber}-${row.lineNumber} low-signal markdown table row needs manual review`);
        continue;
      }
      const classification = classifyNativeRule({
        sourceFile,
        text: candidate,
        contextHeading: block.contextHeading,
      });
      rules.push({
        source_file: sourceFile,
        source_start_line: row.lineNumber,
        source_end_line: row.lineNumber,
        source_excerpt: normalizeExcerpt(row.raw),
        context_heading: block.contextHeading,
        detected_terms: detectedTerms(candidate, block.contextHeading),
        ...classification,
      });
    }
    return;
  }

  const excerpt = normalizeExcerpt(block.lines.map((line) => line.text).join(" "));
  skippedBlocks.push({
    source_file: sourceFile,
    source_start_line: block.start,
    source_end_line: block.end,
    context_heading: block.contextHeading,
    excerpt,
    reason: "Markdown table skipped by deterministic extractor; classify table rules manually before migration.",
  });
  parserWarnings.push(`${sourceFile}:${block.start}-${block.end} markdown table skipped by deterministic extractor`);
}

function parseSimpleTable(block) {
  const contentLines = block.lines
    .filter((line) => line.text.trim().startsWith("|"))
    .map((line) => ({
      lineNumber: line.lineNumber,
      raw: line.text,
      cells: splitTableRow(line.text).map(normalizeText),
    }));
  if (contentLines.length < 3) return null;
  const [header, separator, ...rows] = contentLines;
  if (!separator.cells.every((cell) => /^:?-{3,}:?$/.test(cell))) return null;
  const headers = header.cells.map((cell) => cell.toLowerCase());
  const hasRuleColumn = headers.some((cell) => tableRuleHeaders.has(cell));
  if (!hasRuleColumn || headers.length > 3) return null;
  const dataRows = rows.filter((row) => row.cells.length === headers.length && row.cells.some(Boolean));
  if (dataRows.length === 0) return null;
  return {
    headers: header.cells,
    rows: dataRows,
  };
}

function splitTableRow(row) {
  const trimmed = row.trim().replace(/^\|/, "").replace(/\|$/, "");
  return trimmed.split("|").map((cell) => cell.trim());
}

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function normalizeExcerpt(value) {
  return normalizeText(value).replace(/\|/g, "/").slice(0, 180);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function keywordMatches(value, keyword) {
  const text = String(value || "");
  if (/^[A-Za-z0-9_-]+$/.test(keyword)) {
    return new RegExp(`\\b${escapeRegExp(keyword)}\\b`, "i").test(text);
  }
  return text.includes(keyword);
}
