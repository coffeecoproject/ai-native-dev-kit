export function createCheckRecorder(options = {}) {
  const outputJson = Boolean(options.outputJson);
  const checks = [];
  let failed = false;
  let pending = false;

  function record(status, message) {
    checks.push({ status, message });
    if (!outputJson) {
      const write = status === "FAIL" ? console.error : console.log;
      write(`${status} ${message}`);
    }
    if (status === "FAIL") failed = true;
    if (status === "PENDING" || status === "WARN") pending = true;
  }

  return {
    checks,
    record,
    pass(message) {
      record("PASS", message);
    },
    fail(message) {
      record("FAIL", message);
    },
    warn(message) {
      record("PENDING", message);
    },
    get failed() {
      return failed;
    },
    get pending() {
      return pending;
    },
    status() {
      return failed ? "FAIL" : pending ? "PENDING" : "PASS";
    },
  };
}

export const CONSUMER_OUTCOMES = Object.freeze({
  VALID: "VALID",
  READY: "READY",
  NOT_APPLICABLE_WITH_EVIDENCE: "NOT_APPLICABLE_WITH_EVIDENCE",
  BLOCKED: "BLOCKED",
  MISSING: "MISSING",
  INVALID: "INVALID",
});

const knownConsumerOutcomes = new Set(Object.values(CONSUMER_OUTCOMES));

export function deriveConsumerOutcome({
  hasArtifact = true,
  invalid = false,
  blocked = false,
  ready = false,
  notApplicableWithEvidence = false,
} = {}) {
  if (!hasArtifact) return CONSUMER_OUTCOMES.MISSING;
  if (invalid) return CONSUMER_OUTCOMES.INVALID;
  if (blocked) return CONSUMER_OUTCOMES.BLOCKED;
  if (notApplicableWithEvidence) return CONSUMER_OUTCOMES.NOT_APPLICABLE_WITH_EVIDENCE;
  if (ready) return CONSUMER_OUTCOMES.READY;
  return CONSUMER_OUTCOMES.VALID;
}

export function validateConsumerResult(result) {
  const outcome = String(result?.consumerOutcome || "");
  if (!knownConsumerOutcomes.has(outcome)) {
    return { ok: false, outcome, reason: "missing or unknown consumerOutcome" };
  }
  return { ok: true, outcome, reason: "" };
}

export function requireAcceptedOutcome(result, acceptedOutcomes = [
  CONSUMER_OUTCOMES.READY,
  CONSUMER_OUTCOMES.NOT_APPLICABLE_WITH_EVIDENCE,
]) {
  const validation = validateConsumerResult(result);
  if (!validation.ok) return validation;
  const accepted = new Set(acceptedOutcomes);
  if (!accepted.has(validation.outcome)) {
    return {
      ok: false,
      outcome: validation.outcome,
      reason: `consumerOutcome ${validation.outcome} is not accepted; expected ${[...accepted].join(" or ")}`,
    };
  }
  return validation;
}
