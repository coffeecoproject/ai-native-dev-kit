# Verification Plan Governance

Verification Plan Governance defines what must be verified before execution
work can later claim completion.

It sits after Business Rule Closure and Change Impact Coverage:

```text
Business Rule Closure
  -> Change Impact Coverage
  -> Verification Plan
  -> Test Evidence Report
  -> Execution Assurance
```

1.76.0 implements only the Verification Plan layer. It does not run tests and
does not approve implementation, release, production, migration, secrets,
payment, provider, CI, hooks, or customer-data actions.

Machine-readable boundary wording:

- Verification Plan does not execute tests.
- Verification Plan does not approve release or production.

## Core Rule

```text
No task-bound verification obligations, no trusted test evidence.
No trusted test evidence, no verified execution completion.
```

Test output is not trusted just because it exists. A test must be tied to the
current task, source rule, affected surface, expected behavior, and failure path.

## Required Properties

A ready Verification Plan must record:

- `task_ref`
- `intent_digest`
- `verification_plan_ref`
- `verification_plan_digest`
- `source_systems[]`
- Business Rule Closure ref and digest when the task is a business rule
- Change Impact Coverage ref and digest
- surface-mapped `verification_obligations[]`
- `test_correctness_controls[]`
- no-authority boundaries

Strict source binding must also prove that the Change Impact Coverage report
consumed the same Business Rule Closure referenced by the Verification Plan.
`source_systems[]` is binding trace data: its refs, digests, and outcomes must
match the top-level Business Rule Closure and Change Impact Coverage fields.

Markdown/JSON consistency is part of strict verification-plan governance. The
human-readable report sections must match the machine-readable evidence for
source systems, identity, project calibration, affected surfaces, verification
obligations, manual checks, not-applicable items, and outcome.

## Test Correctness

Codex-generated tests can be wrong. Verification Plan must guard against:

- happy-path-only tests for validation and permission rules;
- UI-only proof for backend rules;
- backend-only proof for user-facing behavior;
- broad `npm test` style evidence that is not mapped to the task;
- skipped, flaky, or not-run tests treated as passed;
- tests that assert implementation detail instead of required behavior;
- stale evidence from another task.

## Boundary

Verification Plan is a plan, not proof that tests passed. Actual results belong
in a later Test Evidence Report.
