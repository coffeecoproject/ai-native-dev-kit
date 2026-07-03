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
];

const productionPattern = /\b(release|rollback|deploy|deployment|production|prod|incident|secret|migration|provider|staging|backup|restore|app store|mini program|review)\b/i;
const businessPattern = /\b(customer|user-visible|business|contract|invoice|tax|finance|hr|payment|permission|data meaning|domain|legal|compliance)\b/i;
const engineeringPattern = /\b(enum|string|schema|dto|type|architecture|build|test|lint|package|database|api|folder|structure|dependency|frontend|backend)\b/i;
const workflowPattern = /\b(codex|ai|agent|workflow|review|approval|apply|task|commit|pr|pull request|prompt|subagent|finish|queue)\b/i;
const historicalPattern = /\b(historical|legacy|old note|deprecated|stale|archive|todo|temporary)\b/i;

export function extractNativeRulesFromMarkdown(content, sourceFile) {
  const lines = content.split(/\r?\n/);
  const headingStack = [];
  const rules = [];
  const unclassifiedBlocks = [];
  const parserWarnings = [];
  let fenced = false;
  let fenceStart = 0;
  let fenceLanguage = "";
  let currentCode = [];

  for (let index = 0; index < lines.length; index += 1) {
    const lineNumber = index + 1;
    const raw = lines[index];
    const trimmed = raw.trim();
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

    const candidate = candidateText(trimmed);
    if (!candidate) continue;
    if (!hasRuleSignal(candidate) && !hasRuleSignal(currentHeading(headingStack))) continue;
    if (looksLikeMarkdownTable(candidate)) continue;

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
  return ruleKeywords.some((keyword) => new RegExp(`\\b${escapeRegExp(keyword)}\\b`, "i").test(value));
}

function detectedTerms(text, heading) {
  const value = `${heading} ${text}`;
  return ruleKeywords.filter((keyword) => new RegExp(`\\b${escapeRegExp(keyword)}\\b`, "i").test(value));
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

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function normalizeExcerpt(value) {
  return normalizeText(value).replace(/\|/g, "/").slice(0, 180);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
