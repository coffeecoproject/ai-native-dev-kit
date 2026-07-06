# Test Evidence Binding

Test Evidence Binding answers a practical question:

> The plan said these things must be verified. Do we have real evidence for each one?

It sits after Verification Plan Governance:

```text
Business Rule Closure
  -> Change Impact Coverage
  -> Verification Plan
  -> Test Evidence Report
```

The report does not run tests by itself. It records and checks the evidence produced by normal project commands, manual review, screenshots, logs, or external reports.

## What It Prevents

- Backend-only completion when the frontend obligation was also required.
- Passing `npm test` being treated as proof without obligation mapping.
- Reusing an old report for a new task.
- Claiming skipped, flaky, or failed checks as covered.
- Claiming a command passed without a recorded `exit_code` and resolvable output artifact.
- Dropping required Verification Plan test-quality controls during evidence collection.
- Treating AI-written tests as correct without review controls.
- Manual evidence with no real owner or environment.

## What Codex Should Do

When a task reaches verification:

1. Read the Verification Plan.
2. Collect explicit evidence refs from commands, reports, screenshots, logs, or owner decisions.
3. Create a Test Evidence Report.
4. Run the checker in strict mode.
5. If required coverage is missing, say what is missing instead of claiming completion.

Strict mode treats `TEST_EVIDENCE_COMPLETE` as evidence coverage only. It does not mean the task, product, release, or real environment is fully complete.

## What The User Sees

The user should not need to understand every checker. Codex should summarize:

- covered items;
- missing items;
- failed or skipped evidence;
- manual decisions needed;
- safe next step.

## Non-Goals

- It does not design tests.
- It does not execute tests.
- It does not decide business correctness.
- It does not approve production or release.
- It does not replace existing project test strategy.
