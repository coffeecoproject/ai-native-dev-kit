# Test Evidence Binding

IntentOS Test Evidence Binding records whether actual verification evidence satisfies a saved Verification Plan.

It is not a test runner, CI executor, release approver, or production proof. Its purpose is narrower:

1. Bind every required Verification Plan obligation to concrete evidence.
2. Reject broad command success when it is not mapped to specific obligations.
3. Reject stale, mismatched, skipped, failed, flaky, or fabricated evidence as completed work.
4. Preserve the source chain from Business Rule Closure and Change Impact Coverage through Verification Plan.
5. Keep the user-facing answer simple while retaining a strict machine-readable record.

## Operating Rules

- A Test Evidence Report must reference exactly one Verification Plan.
- A Test Evidence Report does not approve release or production.
- The report must carry the Verification Plan digest, task ref, intent digest, and required source systems.
- Evidence must be explicit. If no evidence input exists, the report is blocked or partial.
- Command evidence must include command, environment, run time, `exit_code`, output digest, current-task match, ran-after-change, and covered obligations.
- `PASSED` command or test-report evidence must have `exit_code` `0` and a resolvable `artifact:` ref whose digest matches the recorded output.
- `FAILED` command or test-report evidence must record a non-zero `exit_code` or a concrete `failure_reason`.
- Required Verification Plan `test_correctness_controls` must be preserved in Test Evidence and marked `SATISFIED` or `NOT_APPLICABLE_WITH_REASON`.
- Manual evidence must include a real accountable owner, decision or evidence ref, environment, and limitations.
- `AI`, `Codex`, `TBD`, `unknown`, and empty owners are invalid for required manual evidence.
- `FAILED`, `SKIPPED_WITH_REASON`, `NOT_RUN_WITH_REASON`, `FLAKY_REQUIRES_REVIEW`, and `UNRESOLVED` cannot satisfy required coverage.
- `WAIVED_BY_HUMAN_DECISION` requires a concrete human decision reference and cannot silently become passed evidence.
- Markdown and `Machine-Readable Evidence` must stay synchronized.

## Boundaries

- This report writes target files: No
- This report executes tests: No
- This report fabricates evidence: No
- This report authorizes implementation: No
- This report approves release or production: No
- This report proves product correctness: No
- This report proves real-environment behavior: No
