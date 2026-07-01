# Change Impact Coverage

## Purpose

Change Impact Coverage prevents partial implementation when a task affects more than one product or engineering surface.

It answers:

```text
If this change is done, what else must also be checked or explicitly ruled out?
```

This is a governance and evidence layer. It is not an apply runner, release approval, or proof that every possible impact has been found.

## When It Is Required

Use Change Impact Coverage when a task changes or may change:

- validation rules
- form or input restrictions
- API request or response behavior
- backend domain rules
- status transitions
- permissions, roles, or visibility
- data model, enum, lookup, persistence, migration, or seed data
- error copy, hints, empty states, or user-facing messages
- finance, payment, invoice, tax, HR, approval, or other business-critical workflows

It is optional for clearly isolated copy-only or docs-only tasks, but Codex must say why broader coverage is not needed.

## Surface Classes

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

## Statuses

### Affected Surface Map

- `REQUIRED`: this surface must be handled or explicitly closed.
- `OPTIONAL`: this surface may be affected, but current evidence is weak.
- `NOT_APPLICABLE`: this surface is intentionally ruled out with a reason.
- `NEEDS_HUMAN_DECISION`: this surface requires human judgment before implementation.

### Implementation Coverage

- `DONE`: handled and linked to evidence.
- `NOT_APPLICABLE`: not relevant, with a concrete reason.
- `OUT_OF_SCOPE`: relevant but intentionally excluded from this task, with owner or follow-up.
- `NEEDS_HUMAN_DECISION`: cannot be closed without human decision.
- `NOT_STARTED`: pre-execution report only; implementation has not started.

## Modes

Change Impact Coverage has two modes:

- `preflight`: used before implementation. Required surfaces may be `NOT_STARTED` because the report is an impact map, not a completion claim.
- `closure`: used after implementation or during task close-out. Required surfaces must not remain `NOT_STARTED`; each one must be `DONE`, `NOT_APPLICABLE`, `OUT_OF_SCOPE`, or `NEEDS_HUMAN_DECISION` with evidence or reason.

Legacy Markdown reports remain valid by default. New strict records should include `Machine-Readable Evidence` and can be checked with:

```bash
node scripts/check-change-impact-coverage.mjs . --require-structured-evidence --mode closure --strict-evidence
```

Strict mode rejects placeholder `DONE` evidence such as `TBD`, `placeholder`, `not recorded`, or example-only evidence.

## Required Behavior

Before implementation, Codex should:

1. Read the user request and project signals.
2. Select likely affected surfaces.
3. Ask only the minimum necessary human questions.
4. Mark any high-risk surface as `NEEDS_HUMAN_DECISION` when evidence is insufficient.
5. Keep the report read-only.

After implementation, Codex should:

1. Close every required surface.
2. Link evidence for every `DONE` surface.
3. Explain every `NOT_APPLICABLE` or `OUT_OF_SCOPE` surface.
4. Stop if permission, data, migration, payment, production, or compliance scope needs human decision.
5. Feed missed surfaces into Review Loop or Execution Closure.

When `--changed-files` or a changed-file list is available, Codex must use it as a risk signal:

- backend validation/rule files imply frontend, API, error copy, and test closure for rule changes
- frontend form/view files imply backend, API, and test closure for rule changes
- API/DTO/schema files imply API and test closure
- migration/schema/model files imply data-model review
- auth/permission/security files imply human permission-risk review unless clearly closed
- deploy/release/rollback/CI files imply release-impact review unless clearly closed

## Stop Conditions

Stop and ask for human decision when:

- a high-risk surface is affected and no approval or baseline exists
- the task requires a migration, production config change, payment change, permission model change, or sensitive data handling
- the report cannot determine whether frontend, backend, API, data, or tests are in scope
- the user request changes during implementation
- closing the surface would require work outside the approved task

## Boundaries

- This report writes target files: No
- This report authorizes implementation: No
- This report approves release or production: No
- This report replaces human product judgment: No
- This report proves every possible impact was found: No

## Relationship To Other Layers

- Change Boundary defines what is in scope.
- Review Surface defines what must be reviewed.
- Engineering Baseline defines project conventions.
- Product Completeness checks whether a product slice is usable.
- Execution Closure proves what changed and how it was verified.
- Execution Closure should cite Change Impact Coverage when a cross-surface rule or behavior change is closed.
- Review Loop handles low-risk repair and re-review.
- Safe Launch remains required before launch or production claims.
