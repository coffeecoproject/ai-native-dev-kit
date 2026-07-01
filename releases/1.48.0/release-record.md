# IntentOS 1.48.0 Release Record

## Human Summary

1.48.0 adds Change Impact Coverage so Codex can avoid treating a cross-surface rule change as complete after only one layer changes.

For example, when a user asks to add a contract input restriction, Codex should record whether user flow, frontend validation, API contract, backend rule, error copy, tests, docs/handoff, data, permission, and release impact are handled, explicitly ruled out, or waiting for human decision.

## Allowed Claims

- IntentOS includes a Change Impact Coverage protocol, template, checklist, prompt, resolver, checker, example, and bad fixtures.
- `impact-coverage` can produce a read-only affected-surface report from a project path and user intent.
- `impact-coverage-check` can reject common partial-implementation records such as backend-only rule completion, frontend-only rule completion, API contract changes without test evidence, high-risk not-applicable claims without concrete reasons, and implementation/release approval overclaims.
- Generated projects can receive the 1.48 workflow assets through manifest-managed copy rules.

## Forbidden Claims

- 1.48.0 does not write target-project files.
- 1.48.0 does not implement missing frontend/backend/API/test work automatically.
- 1.48.0 does not authorize implementation, apply, commit, push, release, production, hook, CI, migration, payment, permission, data, privacy, security, tax, legal, or compliance decisions.
- 1.48.0 does not prove every possible impact was found.
- 1.48.0 does not replace Review Surface, Change Boundary, Execution Closure, Review Loop, Product Completeness, or Safe Launch.

## Evidence Status

- Core protocol: `core/change-impact-coverage.md`
- User doc: `docs/change-impact-coverage.md`
- Template: `templates/change-impact-coverage-report.md`
- Checklist: `checklists/change-impact-coverage-review.md`
- Prompt: `prompts/change-impact-coverage-agent.md`
- Resolver: `scripts/resolve-change-impact-coverage.mjs`
- Checker: `scripts/check-change-impact-coverage.mjs`
- Good example: `examples/1.48-change-impact-coverage/contract-input-rule`
- Bad fixtures: `test-fixtures/bad/bad-change-impact-*`
- Generated-project directory: `change-impact-coverage-reports/`

## Known Limitations

- The resolver uses conservative project and intent signals; it is not exhaustive static analysis.
- The checker validates recorded reports; it does not inspect all code paths in a real project.
- Human decisions are still required for high-risk data, permission, release, compliance, payment, privacy, security, migration, production, tax, and legal scope.
- Copy-only and docs-only tasks can remain lightweight when Codex records why broader impact coverage is not needed.

## Verification

```bash
node --check scripts/resolve-change-impact-coverage.mjs
node --check scripts/check-change-impact-coverage.mjs
node scripts/cli.mjs impact-coverage . --intent "add contract input restriction"
node scripts/check-change-impact-coverage.mjs .
node scripts/check-change-impact-coverage.mjs examples/1.48-change-impact-coverage/contract-input-rule
node scripts/check-dev-kit.mjs
npm run verify
```
