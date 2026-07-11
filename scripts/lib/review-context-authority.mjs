import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const defaultRoot = path.resolve(moduleDir, "../..");

export const REVIEW_CONTEXT_VERSION = "1.99.1";
export const CURRENT_OPERATING_MODEL = "ZERO_EXPERIENCE_SOLO_DEVELOPER";

function normalize(relativePath) {
  return String(relativePath || "").trim().replaceAll("\\", "/").replace(/^\.\//, "");
}

function startsWithAny(value, prefixes = []) {
  return prefixes.some((prefix) => value.startsWith(prefix));
}

export function loadReviewContextAuthority(root = defaultRoot) {
  const sourceFile = path.join(root, "core", "review-context-authority.json");
  const installedFile = path.join(root, ".intentos", "core", "review-context-authority.json");
  const file = fs.existsSync(sourceFile) ? sourceFile : installedFile;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

export function classifyReviewContextAsset(relativePath, authority = loadReviewContextAuthority()) {
  const value = normalize(relativePath);
  const rows = Array.isArray(authority.classifications) ? authority.classifications : [];
  const current = rows.find((row) => row.status === "CURRENT") || {};
  const compatibility = rows.find((row) => row.status === "COMPATIBILITY") || {};
  const historical = rows.find((row) => row.status === "HISTORICAL") || {};

  if ((current.exact || []).includes(value)) return "CURRENT";
  if (startsWithAny(value, historical.versionedPrefixes)) return "HISTORICAL";
  if (startsWithAny(value, compatibility.prefixes)) return "COMPATIBILITY";
  if (startsWithAny(value, current.prefixes)) return "CURRENT";
  if (startsWithAny(value, historical.prefixes)) return "HISTORICAL";
  return "CURRENT";
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
