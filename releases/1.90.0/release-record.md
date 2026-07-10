# Release 1.90.0: Execution Truth Hardcut

## Summary

1.90 closes the final-close-out P0 found in the full repository audit.

Unified Closure no longer treats an existing file path or rendered `PASS` text
as proof that a task is done. A `DONE` decision now requires verified, exact,
task-matched upstream close-out evidence.

## Changed Assets

- `docs/plans/execution-truth-hardcut-1.90-plan.md`
- `scripts/resolve-closure-decision.mjs`
- `scripts/check-closure-decision.mjs`
- `scripts/check-execution-closure.mjs`
- `scripts/check-intentos.mjs`
- `templates/closure-decision.md`
- `docs/unified-closure-model.md`
- `checklists/closure-decision-review.md`
- `prompts/closure-decision-agent.md`
- `examples/1.49-structured-impact-coverage/contract-input-rule/closure-decisions/001-contract-input-rule.md`
- version, README, manifest, and release evidence assets

## Allowed Claims

- A selected Execution Closure can be checked exactly with `--report`.
- A behavior-changing Unified Closure validates the exact linked Change Impact
  Coverage report in strict precision mode.
- Unified Closure records Input Verification details for each required source.
- Invalid, stale, unrelated, missing, or duplicate source evidence cannot
  produce `DONE`.
- Historical explanatory Closure Decisions remain readable, but an older
  `DONE` record without verified inputs cannot count as a current completion
  claim.

## Forbidden Claims

- 1.90 does not approve implementation, apply, commit, push, release,
  production, tests, migrations, provider actions, or project-owner decisions.
- A Unified Closure Decision remains a derived, read-only decision view; it
  does not replace Execution Closure, Change Impact Coverage, Task Governance,
  Work Queue, Review Loop, or Safe Launch.
- A free-text verification summary is not upgraded by this release into a
  canonical test-execution receipt. That Evidence Authority hardening remains
  future work.

## Evidence Status

- Positive fixture: exact matched contract-input evidence produces `DONE`.
- Negative fixture: stale Execution Closure cannot produce `DONE`.
- Negative path test: `--report` rejects traversal.
- Recorded `DONE` decisions are checked against their selected lower-level
  evidence, not only their Markdown table cells.

## Known Limitations

- Verification text is still not a canonical command/test receipt. That
  project/task/revision binding remains the later Evidence Authority scope.
- Human Decision records are distinct and meaningful project-local files in
  this release, not yet one universal structured approval artifact.

## Verification

Required verification:

```bash
npm run verify
git diff --check
```

Final executed results are recorded in
[self-check-report.md](self-check-report.md).
