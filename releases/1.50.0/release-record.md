# IntentOS 1.50.0 Release Record

## Human Summary

1.50.0 hardens close-out evidence after 1.49 structured impact coverage.

Plainly: 1.49 made Codex record which surfaces were closed. 1.50 makes strict checks verify that `DONE` evidence references actually resolve, and that cross-surface Execution Closure cannot be `READY_FOR_COMMIT_REVIEW` without linked strict Change Impact Coverage.

## Allowed Claims

- IntentOS includes strict Change Impact Coverage evidence reference resolution through `--resolve-evidence-refs`.
- `DONE` implementation and verification evidence can be required to resolve to a project-local file, `command-output:<path>`, `artifact:<id-or-ref>`, or `human-decision:<id-or-ref>`.
- Change Impact Coverage can read changed-file signals from git diff through `--from-git-diff`, `--cached`, and `--base`.
- Execution Closure can require linked strict Change Impact Coverage through `--require-impact-coverage`.
- The 1.49 structured contract input example now includes real evidence files and a linked Execution Closure example.
- Legacy Markdown reports and 1.49 structured reports remain compatible by default unless strict flags are enabled.

## Forbidden Claims

- 1.50.0 does not write target-project files.
- 1.50.0 does not implement missing frontend/backend/API/test work automatically.
- 1.50.0 does not authorize implementation, apply, commit, push, release, production, hook, CI, migration, payment, permission, data, privacy, security, tax, legal, or compliance decisions.
- 1.50.0 does not prove every possible impact was found.
- 1.50.0 does not make evidence reference resolution mandatory for all historical reports.
- 1.50.0 does not replace Review Surface, Change Boundary, Execution Closure, Review Loop, Product Completeness, Safe Launch, or human judgment.

## Evidence Status

- Plan: `docs/plans/evidence-reference-resolution-1.50-plan.md`
- Core protocol: `core/change-impact-coverage.md`, `core/execution-review-closure.md`
- User docs: `docs/change-impact-coverage.md`, `docs/execution-review-closure.md`
- Checkers: `scripts/check-change-impact-coverage.mjs`, `scripts/check-execution-closure.mjs`
- Resolver: `scripts/resolve-change-impact-coverage.mjs`
- Strict example: `examples/1.49-structured-impact-coverage/contract-input-rule`
- 1.50 example note: `examples/1.50-evidence-reference-resolution/README.md`
- Bad fixtures: `test-fixtures/bad/bad-change-impact-missing-evidence-ref`, `test-fixtures/bad/bad-execution-closure-missing-impact-coverage`

## Known Limitations

- Evidence reference resolution validates recorded references; it does not judge whether the evidence content is sufficient product proof.
- `artifact:<id-or-ref>` and `human-decision:<id-or-ref>` are accepted as recorded references, not as automatic approval.
- Git diff changed-file input is path-based and remains a conservative signal, not full static analysis.
- Strict Execution Closure impact linking is opt-in through `--require-impact-coverage`.
- Human decisions are still required for high-risk data, permission, release, compliance, payment, privacy, security, migration, production, tax, and legal scope.

## Verification

```bash
node --check scripts/resolve-change-impact-coverage.mjs
node --check scripts/check-change-impact-coverage.mjs
node --check scripts/check-execution-closure.mjs
node scripts/check-change-impact-coverage.mjs examples/1.49-structured-impact-coverage/contract-input-rule --require-structured-evidence --mode closure --strict-evidence --resolve-evidence-refs
node scripts/check-execution-closure.mjs examples/1.49-structured-impact-coverage/contract-input-rule --require-impact-coverage
node scripts/check-fixtures.mjs
node scripts/check-intentos.mjs
npm run verify
git diff --check
```
