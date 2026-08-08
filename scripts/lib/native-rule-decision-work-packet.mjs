import { evidenceDigest } from "./artifact-schema.mjs";

const highRiskPatterns = Object.freeze([
  ["RELEASE_OR_PRODUCTION", /\b(?:release|production|deploy|rollback|publish)\b|发布|生产|部署|回滚/iu],
  ["PAYMENT_OR_VALUE", /\b(?:payment|refund|billing|money|transfer)\b|支付|退款|金额|转账/iu],
  ["PRIVACY_OR_SENSITIVE_DATA", /\b(?:privacy|personal data|sensitive data|pii|secret)\b|隐私|个人数据|敏感数据|密钥/iu],
  ["PERMISSION_OR_SECURITY", /\b(?:permission|authorization|authentication|security|rbac)\b|权限|鉴权|认证|安全/iu],
  ["DESTRUCTIVE_OR_IRREVERSIBLE", /\b(?:delete|destructive|irreversible|migration)\b|删除|破坏性|不可逆|迁移/iu],
]);

export function createNativeRuleDecisionWorkPacket(extractions = [], binding = {}) {
  assertCurrentBinding(binding);
  const blocks = (Array.isArray(extractions) ? extractions : [])
    .flatMap((extraction) => unresolvedPacketBlocks(extraction))
    .sort(comparePacketBlocks);
  assertUniqueExactBlocks(blocks);
  const base = {
    schema_version: "1.0.0",
    artifact_type: "native_rule_decision_work_packet",
    project_binding: object(binding.projectBinding),
    goal_digest: scalar(binding.goalDigest),
    project_fact_digest: scalar(binding.projectFactDigest),
    guidance_digest: scalar(binding.guidanceDigest),
    authority_inventory_digest: scalar(binding.authorityInventoryDigest),
    source_revision: scalar(binding.sourceRevision),
    required_decisions: blocks.length,
    blocks,
    decision_policy: {
      required_unresolved_after_decisions: 0,
      high_risk_non_rule_disposition_requires_exact_proof: "Yes",
      may_write_target_files: "No",
      may_authorize_apply: "No",
      may_authorize_release_or_production: "No",
    },
  };
  return { ...base, packet_digest: evidenceDigest(base, []) };
}

function unresolvedPacketBlocks(extraction = {}) {
  const coverage = extraction.coverage || {};
  const sourceFile = String(coverage.source_file || "");
  const unresolved = [
    ...(coverage.unclassified_blocks || []),
    ...(coverage.skipped_blocks || []),
    ...(coverage.low_signal_blocks || []),
  ];
  return (coverage.block_ledger || [])
    .filter((block) => block?.disposition === "NEEDS_REVIEW")
    .map((block) => {
      const detail = unresolved.find((item) => rangesIntersect(item, block)) || {};
      const semanticProjectText = [
        block.context_heading,
        detail.context_heading,
        detail.excerpt,
      ].filter(Boolean).join(" ");
      const riskSignals = highRiskPatterns
        .filter(([, pattern]) => pattern.test(semanticProjectText))
        .map(([risk]) => risk);
      return {
        block_id: String(block.block_id || ""),
        block_digest: String(block.block_digest || ""),
        source_file: sourceFile,
        source_start_line: Number(block.source_start_line || 0),
        source_end_line: Number(block.source_end_line || block.source_start_line || 0),
        block_type: String(block.block_type || "UNKNOWN"),
        context_heading: String(block.context_heading || ""),
        excerpt: String(detail.excerpt || ""),
        reason: String(detail.reason || block.reason || "semantic classification required"),
        risk_signals: riskSignals,
        review_constraint: riskSignals.length > 0
          ? "FAIL_CLOSED_HIGH_RISK"
          : "SEMANTIC_CLASSIFICATION_REQUIRED",
        required_output: {
          allowed_dispositions: ["PRESERVE_AS_CONTEXT", "RESOLVED_NON_RULE", "CLASSIFY_AS_RULE"],
          reason: "required",
          classification_required_when: "CLASSIFY_AS_RULE",
        },
      };
    });
}

function assertCurrentBinding(binding) {
  const projectBinding = object(binding.projectBinding);
  if (Object.keys(projectBinding).length === 0) {
    throw new Error("native rule decision work packet requires a current project binding");
  }
  for (const [field, value] of [
    ["goalDigest", binding.goalDigest],
    ["projectFactDigest", binding.projectFactDigest],
    ["guidanceDigest", binding.guidanceDigest],
    ["authorityInventoryDigest", binding.authorityInventoryDigest],
  ]) {
    if (!/^sha256:[a-f0-9]{64}$/.test(String(value || ""))) {
      throw new Error(`native rule decision work packet ${field} must be a current sha256 digest`);
    }
  }
  if (!String(binding.sourceRevision || "").trim() || binding.sourceRevision === "N/A") {
    throw new Error("native rule decision work packet requires a current source revision");
  }
}

function assertUniqueExactBlocks(blocks) {
  const ids = new Set();
  for (const block of blocks) {
    if (!/^NB-[a-f0-9]{24}-[1-9][0-9]*$/.test(block.block_id)) {
      throw new Error(`native rule decision work packet block id is invalid: ${block.block_id || "<missing>"}`);
    }
    if (!/^sha256:[a-f0-9]{64}$/.test(block.block_digest)) {
      throw new Error(`native rule decision work packet block digest is invalid: ${block.block_id}`);
    }
    if (!block.source_file || block.source_start_line <= 0 || block.source_end_line < block.source_start_line) {
      throw new Error(`native rule decision work packet block range is invalid: ${block.block_id}`);
    }
    if (ids.has(block.block_id)) {
      throw new Error(`native rule decision work packet has duplicate block id: ${block.block_id}`);
    }
    ids.add(block.block_id);
  }
}

function comparePacketBlocks(left, right) {
  return left.source_file.localeCompare(right.source_file)
    || left.source_start_line - right.source_start_line
    || left.source_end_line - right.source_end_line
    || left.block_id.localeCompare(right.block_id);
}

function rangesIntersect(left, right) {
  const leftStart = Number(left.source_start_line || 0);
  const leftEnd = Number(left.source_end_line || leftStart);
  const rightStart = Number(right.source_start_line || 0);
  const rightEnd = Number(right.source_end_line || rightStart);
  return leftStart <= rightEnd && rightStart <= leftEnd;
}

function object(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? structuredClone(value) : {};
}

function scalar(value) {
  return String(value || "N/A").trim();
}
