# IntentOS 1.51.0 Release Record

## Human Summary

1.51.0 hardens strict close-out precision.

Plainly: 1.50 made Codex check whether evidence references exist. 1.51 makes strict checks verify that the referenced evidence belongs to the current task, that the linked Change Impact Coverage report is the exact report being closed, and that resolved evidence files are not empty placeholders.

## Allowed Claims

- IntentOS includes opt-in close-out evidence precision through `--require-precise-evidence`.
- Change Impact Coverage can check a single exact report through `--report`.
- Precision mode rejects weak resolved evidence files.
- Precision mode requires `artifact:<id>` and `human-decision:<id>` references to resolve to concrete project records.
- Execution Closure precision mode validates the exact linked Change Impact Coverage report instead of accepting any passing project report.
- Execution Closure precision mode checks that the linked report matches the current closure task or intent.
- Legacy Markdown reports and 1.50 evidence reference checks remain compatible by default unless strict precision flags are enabled.

## Forbidden Claims

- 1.51.0 does not write target-project files.
- 1.51.0 does not implement missing frontend/backend/API/test work automatically.
- 1.51.0 does not authorize implementation, apply, commit, push, release, production, hook, CI, migration, payment, permission, data, privacy, security, tax, legal, or compliance decisions.
- 1.51.0 does not prove every possible impact was found.
- 1.51.0 does not judge product correctness or release readiness.
- 1.51.0 does not require every historical report to migrate.

## Evidence Status

- Plan: `docs/plans/closeout-evidence-precision-1.51-plan.md`
- Checkers: `scripts/check-change-impact-coverage.mjs`, `scripts/check-execution-closure.mjs`
- Good example: `examples/1.49-structured-impact-coverage/contract-input-rule`
- Bad fixtures: `test-fixtures/bad/bad-change-impact-weak-evidence`, `test-fixtures/bad/bad-change-impact-unresolved-artifact-ref`, `test-fixtures/bad/bad-execution-closure-stale-impact-report`

## Known Limitations

- Precision mode is opt-in through `--require-precise-evidence`.
- Evidence quality checks are intentionally minimal: they reject empty and placeholder-like files, but they do not prove the product behavior is correct.
- Task matching uses closure task/intent alignment; it is not a full semantic equivalence engine.
- `artifact:<id>` and `human-decision:<id>` resolution proves a record exists; it does not approve the decision or implementation.
- Strict precision does not replace Review Loop, Safe Launch, human review, or production release governance.

## Verification

```bash
node --check scripts/check-change-impact-coverage.mjs
node --check scripts/check-execution-closure.mjs
node scripts/check-change-impact-coverage.mjs examples/1.49-structured-impact-coverage/contract-input-rule --report change-impact-coverage-reports/001-contract-input-rule.md --require-structured-evidence --mode closure --strict-evidence --resolve-evidence-refs --require-precise-evidence
node scripts/check-execution-closure.mjs examples/1.49-structured-impact-coverage/contract-input-rule --require-impact-coverage --require-precise-evidence
node scripts/check-fixtures.mjs
node scripts/check-intentos.mjs
npm run verify
git diff --check
```
