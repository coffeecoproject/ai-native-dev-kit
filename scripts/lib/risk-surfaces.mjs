import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

export const highRiskSurfaces = [
  {
    id: "api-contract",
    label: "API / contract / schema",
    patterns: [/\bapi\b/i, /\bcontract\b/i, /\bdto\b/i, /\bschema\b/i, /接口|契约|数据结构/],
  },
  {
    id: "database-migration",
    label: "database / migration",
    patterns: [/\bdatabase\b/i, /\bdb\b/i, /\bmigration\b/i, /\bdata compatibility\b/i, /数据库|数据迁移|迁移|表结构|兼容/],
  },
  {
    id: "auth-permission",
    label: "auth / permission",
    patterns: [/\bauth\b/i, /\bauthentication\b/i, /\bauthorization\b/i, /\bpermissions?\b/i, /\brbac\b/i, /\brole\b/i, /\bsession\b/i, /\bidentity\b/i, /登录|认证|鉴权|授权|权限|角色|身份/],
  },
  {
    id: "payment-billing",
    label: "payment / billing",
    patterns: [/\bpayment\b/i, /\bbilling\b/i, /\brefund\b/i, /\binvoice\b/i, /支付|收款|退款|账单|发票/],
  },
  {
    id: "production-release",
    label: "production / release / deployment",
    patterns: [/\bproduction\b/i, /\brelease\b/i, /\bdeployment\b/i, /\bdeploy\b/i, /\brollback\b/i, /\bmonitoring\b/i, /生产|线上|发布|部署|回滚|监控/],
  },
  {
    id: "environment-secret",
    label: "environment / secrets",
    patterns: [/\benv\b/i, /\benvironment\b/i, /\bsecret\b/i, /\btoken\b/i, /\b(api|access|secret|private|client|public|ssh|github|openai|stripe)[-_ ]?key\b/i, /\bkey\s*[:=]/i, /环境变量|密钥|令牌|凭证/],
  },
  {
    id: "ci-hook-automation",
    label: "CI / hooks / automation",
    patterns: [/\bgate\b/i, /\bci\b/i, /\.github\/workflows\//i, /\bworkflow\s+(file|yml|yaml|ci|gate|automation)\b/i, /\b(github|ci|release|automation|hook|pre-commit|post-commit|pipeline)\s+workflow\b/i, /\bhook\b/i, /\bwebhook\b/i, /\bautomation\b/i, /门禁|流水线|自动化|钩子/],
  },
  {
    id: "security-privacy-compliance",
    label: "security / privacy / compliance",
    patterns: [/\bsecurity\b/i, /\bprivacy\b/i, /\bcompliance\b/i, /\blegal\b/i, /\bregulated\b/i, /\btax\b/i, /安全|隐私|合规|法务|税务|监管/],
  },
  {
    id: "customer-sensitive-data",
    label: "customer / sensitive data",
    patterns: [/\bcustomer data\b/i, /\bpersonal data\b/i, /\bpii\b/i, /\bsensitive data\b/i, /客户数据|用户数据|个人信息|敏感数据/],
  },
  {
    id: "business-critical-flow",
    label: "business critical flow",
    patterns: [/\bstate machine\b/i, /\bworkflow transition\b/i, /\bapproval flow\b/i, /\binventory\b/i, /\btenant\b/i, /\bmulti-tenant\b/i, /\bmembership\b/i, /状态机|流程流转|审批流|库存|扣减|多租户|租户|会员/],
  },
  {
    id: "dependency-package",
    label: "dependency / package",
    patterns: [/\bdependency\b/i, /\bdependencies\b/i, /\bpackage\.json\b/i, /\bpackage-lock\.json\b/i, /\bpnpm-lock\.yaml\b/i, /\byarn\.lock\b/i, /\bupgrade package\b/i, /依赖|包管理|升级依赖/],
  },
  {
    id: "audit",
    label: "audit",
    patterns: [/\baudit\s+(log|trail|record|evidence|event)\b/i, /\bsecurity audit\b/i, /审计|留痕/],
  },
];

export const highRiskSurfacePatterns = highRiskSurfaces.flatMap((surface) => surface.patterns);

const generatedOrExternalDirs = new Set([
  ".git",
  ".next",
  ".nuxt",
  ".turbo",
  "build",
  "coverage",
  "dist",
  "node_modules",
  "out",
  "vendor",
]);

export function matchesHighRiskSurface(value) {
  const text = String(value || "");
  return highRiskSurfacePatterns.some((pattern) => pattern.test(text));
}

export function analyzeRiskSurfaces(options = {}) {
  const text = [
    options.intent,
    options.value,
    Array.isArray(options.paths) ? options.paths.join("\n") : "",
    options.includeProjectSignals ? projectRiskSignals(options.projectRoot) : "",
  ].filter(Boolean).join("\n");
  const matched = highRiskSurfaces
    .filter((surface) => surface.patterns.some((pattern) => pattern.test(text)))
    .map((surface) => surface.id);
  const pathFindings = (options.paths || []).flatMap((targetPath) => (
    pathSafetyFindings(targetPath, options.projectRoot).map((reason) => ({ path: targetPath, reason }))
  ));
  const reasons = [
    ...matched.map((surfaceId) => `risk surface: ${surfaceId}`),
    ...pathFindings.map((finding) => `unsafe target path ${finding.path}: ${finding.reason}`),
  ];
  return {
    high: reasons.length > 0,
    riskLevel: reasons.length > 0 ? "high" : "low",
    surfaces: matched,
    pathFindings,
    reasons,
  };
}

export function pathSafetyFindings(targetPath, projectRoot = "") {
  const value = String(targetPath || "").trim();
  const findings = [];
  if (!value) return ["empty path"];
  if (value === "/" || path.isAbsolute(value)) findings.push("absolute path");
  if (value.startsWith("~")) findings.push("home-relative path");
  if (value.includes("\\")) findings.push("backslash path");
  if (/[*?[\]{}]/.test(value)) findings.push("wildcard or glob path");

  const portable = value.replaceAll("\\", "/");
  const normalized = path.posix.normalize(portable);
  const segments = portable.split("/").filter(Boolean);
  if (normalized === ".." || normalized.startsWith("../") || segments.includes("..")) findings.push("parent traversal");
  if (segments.some((segment) => generatedOrExternalDirs.has(segment))) findings.push("generated, dependency, or external directory");
  if (portable.startsWith(".github/workflows/")) findings.push("CI workflow path");
  if (segments.includes("hooks") || segments.includes(".husky")) findings.push("hook path");

  if (projectRoot && !path.isAbsolute(value) && !segments.includes("..")) {
    if (isSymlinkPath(projectRoot, segments)) findings.push("symlink path");
    if (isGitIgnored(projectRoot, value)) findings.push("git ignored path");
  }

  return [...new Set(findings)];
}

export function isSafeTargetPath(targetPath, projectRoot = "") {
  return pathSafetyFindings(targetPath, projectRoot).length === 0;
}

function projectRiskSignals(projectRoot = "") {
  if (!projectRoot) return "";
  const packageJsonPath = path.join(projectRoot, "package.json");
  const signals = [];
  try {
    if (fs.existsSync(packageJsonPath)) {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
      signals.push(pkg.name);
      signals.push(Object.keys(pkg.dependencies || {}).join("\n"));
      signals.push(Object.keys(pkg.devDependencies || {}).join("\n"));
      signals.push(Object.keys(pkg.peerDependencies || {}).join("\n"));
    }
  } catch {
    // Ignore invalid project metadata for risk-surface hints.
  }
  return signals.filter(Boolean).join("\n");
}

function isSymlinkPath(projectRoot, segments) {
  let current = projectRoot;
  for (const segment of segments) {
    current = path.join(current, segment);
    try {
      if (fs.existsSync(current) && fs.lstatSync(current).isSymbolicLink()) return true;
    } catch {
      return false;
    }
  }
  return false;
}

function isGitIgnored(projectRoot, targetPath) {
  try {
    const result = spawnSync("git", ["check-ignore", "--quiet", "--", targetPath], {
      cwd: projectRoot,
      stdio: "ignore",
    });
    return result.status === 0;
  } catch {
    return false;
  }
}

export const secretLikePatterns = [
  /\b[A-Z0-9_]*(PASSWORD|TOKEN|SECRET|PRIVATE_KEY|ACCESS_KEY|CLIENT_SECRET)[A-Z0-9_]*\s*[:=]\s*(?!<|REDACTED|redacted|present|missing|not recorded|none|N\/A)(["']?)[^\s"'|`]{8,}\1/i,
  /\bpostgres(?:ql)?:\/\/[^:\s]+:[^@\s]+@/i,
  /\bmysql:\/\/[^:\s]+:[^@\s]+@/i,
  /\bredis:\/\/[^:\s]+:[^@\s]+@/i,
  /\bsk-[A-Za-z0-9_-]{16,}\b/,
  /-----BEGIN (?:RSA |EC |OPENSSH |)PRIVATE KEY-----/,
];

export function containsSecretLikeValue(value) {
  const text = String(value || "");
  return secretLikePatterns.some((pattern) => pattern.test(text));
}
