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
