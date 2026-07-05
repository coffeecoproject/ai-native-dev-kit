# IntentOS 1.49.0 Release Record

## Human Summary

1.49.0 hardens Change Impact Coverage with structured evidence, `preflight` / `closure` modes, strict evidence checks, changed-file implications, and Execution Closure citation support.

Plainly: 1.48 made Codex list the affected surfaces. 1.49 makes it harder to claim the work is complete while surfaces are still open or backed only by placeholder evidence.

## Allowed Claims

- IntentOS includes a structured Change Impact Coverage schema at `schemas/artifacts/change-impact-coverage.schema.json`.
- Change Impact Coverage reports can include `Machine-Readable Evidence` checked by `--require-structured-evidence`.
- `preflight` mode allows `NOT_STARTED` because it is an impact map before implementation.
- `closure` mode rejects required surfaces that remain `NOT_STARTED`.
- `--strict-evidence` rejects placeholder `DONE` evidence.
- Changed-file signals can catch backend-only, frontend-only, API-without-tests, and weak data/permission/release exclusions.
- Execution Closure templates can cite Change Impact Coverage evidence without changing authority boundaries.

## Forbidden Claims

- 1.49.0 does not write target-project files.
- 1.49.0 does not implement missing frontend/backend/API/test work automatically.
- 1.49.0 does not authorize implementation, apply, commit, push, release, production, hook, CI, migration, payment, permission, data, privacy, security, tax, legal, or compliance decisions.
- 1.49.0 does not prove every possible impact was found.
- 1.49.0 does not make strict structured evidence mandatory for all historical Markdown reports.
- 1.49.0 does not replace Review Surface, Change Boundary, Execution Closure, Review Loop, Product Completeness, or Safe Launch.

## Evidence Status

- Plan: `docs/plans/structured-impact-coverage-1.49-plan.md`
- Schema: `schemas/artifacts/change-impact-coverage.schema.json`
- Core protocol: `core/change-impact-coverage.md`
- User doc: `docs/change-impact-coverage.md`
- Template: `templates/change-impact-coverage-report.md`
- Resolver: `scripts/resolve-change-impact-coverage.mjs`
- Checker: `scripts/check-change-impact-coverage.mjs`
- Strict example: `examples/1.49-structured-impact-coverage/contract-input-rule`
- Bad fixtures: `test-fixtures/bad/bad-change-impact-missing-structured-evidence`, `test-fixtures/bad/bad-change-impact-placeholder-evidence`, `test-fixtures/bad/bad-change-impact-closure-not-started`
- Execution Closure citation: `templates/execution-closure-report.md`

## Known Limitations

- The resolver uses conservative intent, project, and changed-file signals; it is not exhaustive static analysis.
- The checker validates recorded reports; it does not inspect every code path in a real project.
- Strict structured evidence is opt-in for historical Markdown reports.
- Human decisions are still required for high-risk data, permission, release, compliance, payment, privacy, security, migration, production, tax, and legal scope.

## Verification

```bash
node --check scripts/resolve-change-impact-coverage.mjs
node --check scripts/check-change-impact-coverage.mjs
node scripts/cli.mjs impact-coverage examples/mvp-booking-web-app --intent "add contract input restriction"
node scripts/check-change-impact-coverage.mjs examples/1.48-change-impact-coverage/contract-input-rule
node scripts/check-change-impact-coverage.mjs examples/1.49-structured-impact-coverage/contract-input-rule --require-structured-evidence --mode closure --strict-evidence
node scripts/check-execution-closure.mjs .
node scripts/check-fixtures.mjs
node scripts/check-intentos.mjs
npm run verify
git diff --check
```
