# Structured Impact Coverage 1.49 Plan

## Human Summary

1.49 turns Change Impact Coverage from a human-readable checklist into a stricter, machine-checkable close-out layer.

The goal is to prevent this failure:

```text
User asks: add a contract input restriction
Codex changes: backend validation only
Report says: done
Actually missing: frontend rule, API contract, error copy, tests, handoff
```

1.48 made Codex list the affected surfaces. 1.49 must make the completion claim harder to fake.

## Problem

The 1.48 report is useful, but it is still mostly Markdown. That creates four risks:

1. `DONE` evidence can be vague or placeholder-like.
2. Pre-execution reports and post-implementation closure reports use the same checker behavior.
3. `--changed-files` is visible to the resolver, but the checker does not yet enforce enough changed-file implications.
4. Execution Closure can finish without clearly citing the Impact Coverage evidence that proved cross-surface completion.

## Goals

- Add a structured schema for Change Impact Coverage.
- Add `preflight` and `closure` modes.
- Keep legacy Markdown reports compatible by default.
- Require structured evidence when `--require-structured-evidence` is used.
- Reject placeholder `DONE` evidence in strict mode.
- In `closure` mode, reject required surfaces left as `NOT_STARTED`.
- Use changed-file signals to catch backend-only, frontend-only, API-only, data, permission, and release-impact misses.
- Let Execution Closure cite Change Impact Coverage evidence without making Impact Coverage approve implementation, commit, release, or production.

## Non-Goals

- No automatic code edits.
- No apply runner.
- No CI or hook installation.
- No production/release approval.
- No claim that static analysis found every possible impact.
- No forced BL2 or industrial baseline activation.
- No breaking of existing 1.48 Markdown reports unless strict mode is explicitly requested.

## Scope

### Structured Evidence

Add:

```text
schemas/artifacts/change-impact-coverage.schema.json
```

The schema must cover:

- schema version
- artifact type and id
- impact digest
- mode: `preflight` or `closure`
- user request
- change type
- changed files
- affected surface map
- implementation coverage
- verification coverage
- missed surface review
- boundaries
- outcome

### Report Template

Update:

```text
templates/change-impact-coverage-report.md
```

The template should include:

- mode in `Change Type`
- optional changed files section
- `Machine-Readable Evidence`
- the same no-write / no-approval boundaries as 1.48

### Resolver

Update:

```text
scripts/resolve-change-impact-coverage.mjs
```

Add:

```bash
--mode preflight
--mode closure
```

Default mode is `preflight`.

Resolver output remains read-only. In preflight mode, required surfaces may be `NOT_STARTED`. In closure mode, generated placeholders are still not enough to pass closure checks until Codex fills real evidence.

### Checker

Update:

```text
scripts/check-change-impact-coverage.mjs
```

Add:

```bash
--mode preflight
--mode closure
--require-structured-evidence
--strict-evidence
```

Default behavior remains compatible:

```text
old Markdown report -> checked with legacy semantic rules
new strict report -> checked with structured evidence and stricter closure rules
```

Closure mode must reject:

- required surfaces left `NOT_STARTED`
- `DONE` without meaningful evidence
- placeholder evidence
- backend-only rule completion
- frontend-only rule completion
- API changes without tests
- data/permission/release changed files without human decision or explicit closure

### Changed-File Integration

The checker should use structured `changed_files` to infer touched surfaces:

| Changed file signal | Required response |
|---|---|
| backend/service/handler/controller/rule/validation | close frontend, API, error copy, tests for rule changes |
| frontend/component/page/form/view/client | close backend, API, tests for rule changes |
| API/DTO/schema/contract/route | close tests and API evidence |
| migration/schema/model/database/enum | data model must not be weakly `NOT_APPLICABLE` |
| auth/permission/rbac/tenant/privacy/security | permission risk must need human decision or concrete evidence |
| deploy/release/rollback/ci/workflow | release impact must need human decision or concrete evidence |

### Execution Closure Link

Update Execution Closure template/checker to include Change Impact Coverage as an evidence link. This link does not approve implementation or commit. It only proves that cross-surface impact closure was reviewed.

## Acceptance Plan

Run:

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

Expected results:

- 1.48 legacy example still passes default mode.
- 1.49 structured example passes strict closure mode.
- Missing structured evidence fails when required.
- Placeholder `DONE` evidence fails in strict mode.
- Required closure surfaces left `NOT_STARTED` fail in closure mode.
- Backend-only changed files fail for rule changes unless frontend/API/error/test surfaces are closed or decision-bound.
- API changed files fail without test evidence.
- High-risk data/permission/release changed files cannot be weakly marked `NOT_APPLICABLE`.
- Execution Closure can cite Impact Coverage as evidence without changing its authority boundary.
- Generated projects keep empty `change-impact-coverage-reports/` without blocking.

## Stop Conditions

Stop and re-plan if implementation would:

- break existing non-strict Markdown reports
- require exhaustive static analysis
- write target project files
- approve implementation, commit, push, release, production, payment, permission, migration, privacy, security, tax, legal, or compliance decisions
- install hooks or CI gates
- make strict mode default for all historical projects
