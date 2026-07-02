# IntentOS 1.52.0 Release Record

## Human Summary

1.52.0 adds Guided Closure Experience.

Plainly: 1.51 made close-out evidence stricter. 1.52 makes that strictness easier to use by giving users one natural-language close-out entry instead of making them choose internal checkers and flags.

## Allowed Claims

- IntentOS includes a `finish` entry for read-only close-out guidance.
- `finish` returns one Guided Closure Card.
- Guided Closure summarizes task intent, changed-file signals, verification status, related-surface coverage, evidence freshness, missing work, safe next action, and human decisions.
- Guided Closure keeps strict evidence checks available for maintainers and CI while hiding command burden from ordinary users.
- Guided Closure does not weaken Change Impact Coverage, Execution Closure, or precise evidence checks.

## Forbidden Claims

- 1.52.0 does not write target-project files.
- 1.52.0 does not auto-generate missing reports.
- 1.52.0 does not authorize implementation, apply, commit, push, release, production, CI, hooks, migration, payment, permission, data, privacy, security, tax, legal, or compliance decisions.
- 1.52.0 does not replace Review Loop or Safe Launch.
- 1.52.0 does not prove product correctness or production readiness.

## Evidence Status

- Plan: `docs/plans/guided-closure-experience-1.52-plan.md`
- Core: `core/guided-closure-experience.md`
- Docs: `docs/guided-closure-experience.md`
- Template: `templates/guided-closure-card.md`
- Resolver: `scripts/resolve-guided-closure.mjs`
- Checker: `scripts/check-guided-closure.mjs`
- Good example: `examples/1.52-guided-closure-experience`
- Bad fixtures: `test-fixtures/bad/bad-guided-closure-technical-burden`, `test-fixtures/bad/bad-guided-closure-overclaim`

## Known Limitations

- Guided Closure is a summarizing entry, not a semantic proof engine.
- It does not automatically create missing Change Impact Coverage or Execution Closure reports.
- It does not decide whether a human should accept business, legal, payment, tax, security, privacy, release, or production risk.
- It does not replace low-level strict commands for CI or audits.

## Verification

```bash
node --check scripts/resolve-guided-closure.mjs
node --check scripts/check-guided-closure.mjs
node scripts/cli.mjs finish . --intent "维护 IntentOS 收口体验" --verification "npm run verify passed"
node scripts/check-guided-closure.mjs .
node scripts/check-guided-closure.mjs examples/1.52-guided-closure-experience
node scripts/check-dev-kit.mjs
npm run verify
git diff --check
```
