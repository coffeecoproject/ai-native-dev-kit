# Test Evidence Review Checklist

- Every required Verification Plan obligation appears in `coverage_map`.
- Covered obligations cite one or more valid evidence items.
- Command evidence includes command, environment, run time, `exit_code`, output digest, task match, ran-after-change, and covered obligations.
- Passed command or test-report evidence uses `exit_code` `0`, a resolvable `artifact:` ref, and a matching output digest.
- Failed command or test-report evidence records either non-zero `exit_code` or a concrete `failure_reason`.
- Required Verification Plan `test_correctness_controls` are preserved and satisfied or explicitly not applicable with reason.
- Manual evidence has a real accountable owner, environment, decision/evidence ref, and limitations.
- Broad command success is not treated as proof unless mapped to specific obligations.
- Failed, skipped, not-run, flaky, unresolved, or stale evidence does not satisfy required coverage.
- Waivers cite a human decision and stay visible as waivers.
- Business Rule Closure and Change Impact Coverage source systems remain preserved through the Verification Plan.
- Markdown and `Machine-Readable Evidence` agree.
- The report does not claim implementation approval, release approval, production safety, or product correctness.
