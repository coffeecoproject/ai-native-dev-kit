export const highRiskSurfacePatterns = [
  /\bapi\b/i,
  /\bcontract\b/i,
  /\bdto\b/i,
  /\bschema\b/i,
  /\bdatabase\b/i,
  /\bdb\b/i,
  /\bmigration\b/i,
  /\bdata compatibility\b/i,
  /\bauth\b/i,
  /\bauthentication\b/i,
  /\bauthorization\b/i,
  /\bpermission\b/i,
  /\brbac\b/i,
  /\brole\b/i,
  /\bsession\b/i,
  /\btoken\b/i,
  /\baudit\b/i,
  /\bstate machine\b/i,
  /\bworkflow transition\b/i,
  /\bproduction\b/i,
  /\brelease\b/i,
  /\bdeployment\b/i,
  /\brollback\b/i,
  /\bmonitoring\b/i,
  /\benv\b/i,
  /\benvironment\b/i,
  /\bsecret\b/i,
  /\bdependency\b/i,
  /\bpackage\b/i,
  /\bgate\b/i,
  /\bci\b/i,
  /\bsecurity\b/i,
  /\bprivacy\b/i,
  /\bcompliance\b/i,
  /\bpayment\b/i,
  /\btax\b/i,
  /\bidentity\b/i,
  /\bregulated\b/i,
];

export function matchesHighRiskSurface(value) {
  const text = String(value || "");
  return highRiskSurfacePatterns.some((pattern) => pattern.test(text));
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
