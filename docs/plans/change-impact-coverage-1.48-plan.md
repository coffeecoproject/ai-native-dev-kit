# Change Impact Coverage 1.48 Plan

## Human Summary

1.48 should prevent partial implementation when a user asks for a business or product rule change.

The typical failure is:

```text
User asks: add a contract input restriction
Codex changes: backend validation only
Missing: frontend form, error copy, API contract, tests, docs, release evidence
```

Change Impact Coverage is a pre-execution and close-out governance layer. It helps Codex identify the affected surfaces before implementation and prove, after implementation, that each required surface was either handled or explicitly marked out of scope.

## Problem

Current IntentOS already has strong boundaries for scope, evidence, review, and controlled apply. However, it does not yet have a dedicated impact-coverage artifact for cross-surface changes.

This creates three risks:

1. Codex may implement only the most obvious layer.
2. Review may focus on changed files instead of missed related surfaces.
3. The user may think a requirement is complete when frontend, backend, data, copy, tests, or docs are only partially handled.

This is especially common for:

- validation rules
- permission rules
- status transitions
- contract or form restrictions
- finance, payment, invoice, tax, HR, or approval workflows
- API contract changes
- database schema or migration changes
- product copy and error-state changes

## Goals

- Add a clear Change Impact Coverage protocol.
- Make Codex list expected affected surfaces before implementation.
- Make Codex close each affected surface after implementation as `DONE`, `NOT_APPLICABLE`, `OUT_OF_SCOPE`, or `NEEDS_HUMAN_DECISION`.
- Catch backend-only, frontend-only, or docs-only partial changes when the task clearly affects multiple surfaces.
- Keep the artifact read-only and non-authorizing.
- Keep compatibility with simple tasks: a copy-only or docs-only task should not be forced through heavy coverage.

## Non-Goals

- No automatic code modification.
- No apply runner.
- No automatic CI, hook, or release-gate changes.
- No claim that impact coverage proves production readiness.
- No replacement for Engineering Baseline, Product Completeness, Safe Launch, Review Loop, or Change Boundary.
- No requirement to scan every project file exhaustively.
- No forced BL2 or industrial-pack activation.

## Scope

### Core Protocol

Add `core/change-impact-coverage.md`.

The protocol should define:

- when impact coverage is required
- how Codex classifies affected surfaces
- how Codex records surfaces before implementation
- how Codex closes surfaces after implementation
- what requires human decision
- what must stop execution

### Required Surfaces

The first implementation should cover these surface classes:

| Surface | Meaning |
|---|---|
| `USER_FLOW` | visible user journey, screen, form, command, or interaction |
| `FRONTEND_UI` | UI state, validation, disabled state, empty/error/success state |
| `API_CONTRACT` | request/response shape, DTO, schema, endpoint behavior |
| `BACKEND_RULE` | domain validation, service logic, permission check, workflow rule |
| `DATA_MODEL` | schema, enum/lookup, persistence shape, migration, seed data |
| `ERROR_COPY` | user-facing error, hint, toast, validation message, empty-state copy |
| `TEST_COVERAGE` | unit, integration, smoke, behavior, fixture, or manual evidence |
| `DOCS_HANDOFF` | docs, handoff note, release note, operator note, user decision record |
| `PERMISSION_RISK` | auth, role, visibility, audit, compliance, privacy, data sensitivity |
| `RELEASE_IMPACT` | deployment, rollback, migration, feature flag, production data concern |

### Artifact

Add `templates/change-impact-coverage-report.md`.

Required sections:

- Human Summary
- User Request
- Change Type
- Affected Surface Map
- Out-of-Scope Decisions
- Human Decisions Needed
- Implementation Coverage
- Verification Coverage
- Missed Surface Review
- Boundaries
- Outcome

Required boundaries:

- This report writes target files: No
- This report authorizes implementation: No
- This report approves release or production: No
- This report replaces human product judgment: No
- This report proves every possible impact was found: No

### Checklist And Prompt

Add:

- `checklists/change-impact-coverage-review.md`
- `prompts/change-impact-coverage-agent.md`

The checklist should catch:

- obvious backend-only changes where frontend/API/tests are missing
- frontend-only changes where backend/API/data rules are missing
- API contract changes without DTO/schema/test evidence
- permission or data changes without human decision
- high-risk surfaces marked `NOT_APPLICABLE` without reason
- close-out claims without evidence links

### Resolver And Checker

Add:

- `scripts/resolve-change-impact-coverage.mjs`
- `scripts/check-change-impact-coverage.mjs`

Resolver behavior:

- read-only
- accepts target path and optional intent
- prints a report
- supports JSON output
- does not edit target files
- classifies obvious surface candidates from intent, project signals, and optional changed files

Checker behavior:

- validates recorded reports
- rejects authorization overclaim
- rejects missing surface statuses
- rejects high-risk `DONE` without evidence
- rejects backend-only completion for validation/rule tasks unless other surfaces are explicitly `NOT_APPLICABLE` or `OUT_OF_SCOPE` with reason
- remains advisory for source repository if no reports exist

### CLI

Add commands:

```bash
node scripts/cli.mjs impact-coverage .
node scripts/cli.mjs impact-coverage-check .
```

The CLI output should stay understandable to non-technical users:

```text
This change may affect:
- what the user sees
- what the server accepts
- what the API sends
- what needs testing

Before coding, confirm whether these are in scope.
```

### Examples

Add one good example:

```text
examples/1.48-change-impact-coverage/contract-input-rule/
```

Scenario:

```text
Add a contract input restriction.
```

The report should show:

- frontend input validation: required
- backend validation: required
- API contract: required
- error copy: required
- tests: required
- docs/handoff: required
- data migration: not applicable with reason
- permission risk: not applicable or needs decision depending on scenario

Add bad fixtures:

- backend-only rule marked complete
- frontend-only rule marked complete
- API contract change without tests
- high-risk permission/data surface marked not applicable without reason
- report claims it approves implementation or release

## Integration Points

Change Impact Coverage should connect to existing layers:

- `Change Boundary`: confirms what is inside the task.
- `Review Surface`: decides which review surfaces must run.
- `Engineering Baseline`: checks project engineering conventions.
- `Product Completeness`: checks whether the product slice is usable.
- `Execution Closure`: proves what was actually completed.
- `Review Loop`: catches and fixes low-risk missed coverage.
- `Safe Launch`: remains required before real launch or production claims.

It should not replace any of these layers.

## Acceptance Plan

Run:

```bash
node --check scripts/resolve-change-impact-coverage.mjs
node --check scripts/check-change-impact-coverage.mjs
node scripts/cli.mjs impact-coverage examples/mvp-booking-web-app --intent "add contract input restriction"
node scripts/check-change-impact-coverage.mjs examples/1.48-change-impact-coverage/contract-input-rule
node scripts/check-fixtures.mjs
node scripts/check-dev-kit.mjs
npm run verify
git diff --check
```

Expected results:

- good impact coverage example passes
- backend-only bad fixture fails
- frontend-only bad fixture fails
- API contract without test evidence fails
- high-risk `NOT_APPLICABLE` without reason fails
- implementation/release approval overclaim fails
- simple docs-only or copy-only task can remain lightweight
- generated project without impact reports is not blocked
- all reports remain read-only and non-authorizing

## Stop Conditions

Stop and re-plan if implementation would:

- force every small task through heavy coverage
- require project-wide exhaustive static analysis
- approve implementation, release, production, permissions, payment, migration, data, or compliance decisions
- modify target project files automatically
- install hooks or CI gates
- make BL2 or industrial overlays default

## Boundary

1.48 should implement Change Impact Coverage as a governance and evidence layer only.

It may help Codex avoid incomplete work, but it must not claim that all possible impact has been discovered or that a change is safe for production.
