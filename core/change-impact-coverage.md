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
| `BACKGROUND_WORK` | queue, worker, scheduled job, retry, asynchronous side effect, or batch execution |
| `EXTERNAL_INTEGRATION` | third-party API, webhook, provider, external account, callback, or synchronization boundary |
| `RUNTIME_BEHAVIOR` | service startup, process/container behavior, configuration, cache, session, or runtime dependency |
| `ROLLBACK_RECOVERY` | rollback, compensation, retry recovery, partial-write repair, restore, or failure recovery path |

## Statuses

### Affected Surface Map

- `REQUIRED`: this surface must be handled or explicitly closed.
- `OPTIONAL`: this surface may be affected, but current evidence is weak.
- `NOT_APPLICABLE`: this surface is intentionally ruled out with a reason.
- `NEEDS_HUMAN_DECISION`: compatibility state only for a missing business fact,
  missing external authoritative fact, or exact real-world consent. Technical
  uncertainty remains Codex-owned and cannot be converted into a user decision.

### Implementation Coverage

- `DONE`: handled and linked to evidence.
- `NOT_APPLICABLE`: not relevant, with a concrete reason.
- `OUT_OF_SCOPE`: relevant but intentionally excluded from this task, with a
  project-local evidence reference and a concrete bounded follow-up.
- `NEEDS_HUMAN_DECISION`: cannot close until its structured
  `BUSINESS_FACT_NEEDED`, `EXTERNAL_FACT_NEEDED`, or
  `REAL_WORLD_CONSENT_NEEDED` record is resolved.
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
An explicit strict or closure invocation also requires at least one selected
Change Impact Coverage report. Absence is not valid close-out evidence.

For stricter evidence reliability, use:

```bash
node scripts/check-change-impact-coverage.mjs . --require-structured-evidence --mode closure --strict-evidence --resolve-evidence-refs
```

`--resolve-evidence-refs` requires every `DONE` implementation and verification evidence reference to resolve to a bounded project-local file, `command-output:<path>`, `artifact:<id-or-ref>`, or `human-decision:<id-or-ref>`.

For close-out evidence precision, use:

```bash
node scripts/check-change-impact-coverage.mjs . --report change-impact-coverage-reports/001-example.md --require-structured-evidence --mode closure --strict-evidence --resolve-evidence-refs --require-precise-evidence
```

`--report` checks one exact Change Impact Coverage report. `--require-precise-evidence` requires resolved evidence files to contain meaningful non-placeholder content, and requires `artifact:<id-or-ref>` and `human-decision:<id-or-ref>` to resolve to real recorded project artifacts. It remains read-only.

## Required Behavior

Before implementation, Codex should:

1. Read the user request and project signals.
2. Select likely affected surfaces.
3. Ask only for a permitted unavailable business/external fact or exact
   real-world consent.
4. Keep high-risk technical evidence gaps Codex-owned and mark the compatibility
   state with its exact current interpretation.
5. Keep the report read-only.

After implementation, Codex should:

1. Close every required surface.
2. Link evidence for every `DONE` surface.
3. Bind every `NOT_APPLICABLE` or `OUT_OF_SCOPE` surface to current,
   project-local evidence; prose alone is not close-out evidence.
4. Stop the dependent action when permission, data, migration, payment,
   production, or compliance lacks technical evidence, external authority, or
   exact real-world consent; do not ask the user to choose technical treatment.
5. Feed missed surfaces into Review Loop or Execution Closure.

When `--changed-files`, `--from-git-diff`, `--cached`, `--base`, or another changed-file list is available, Codex must use it as a risk signal:

- backend validation/rule files imply frontend, API, error copy, and test closure for rule changes
- frontend form/view files imply backend, API, and test closure for rule changes
- API/DTO/schema files imply API and test closure
- migration/schema/model files imply data-model review
- auth/permission/security files imply permission-risk review unless clearly closed
- deploy/release/rollback/CI files imply release-impact review unless clearly closed
- worker/queue/scheduler/batch files imply background-work and recovery review
- provider/webhook/integration/client files imply external-integration review
- startup/config/cache/session/container files imply runtime-behavior review
- retry/rollback/compensation/restore files imply rollback-recovery review

Changed files reduce manual copying but do not prove correctness.

## Stop Conditions

Stop the dependent action when:

- a high-risk surface is affected and no current baseline, evidence, review, or
  rollback path exists;
- the task requires a migration, production config change, payment change,
  permission model change, or sensitive data handling whose technical path is
  not yet proven;
- an unavailable business/external fact or exact prepared real-world consent is
  required.
- the report cannot determine whether frontend, backend, API, data, or tests are in scope
- the user request changes during implementation
- closing the surface would require work outside the approved task

## Boundaries

- This report writes target files: No
- This report authorizes implementation: No
- This report approves release or production: No
- This report replaces unavailable business or external facts: No
- This report proves every possible impact was found: No

## Relationship To Other Layers

- Change Boundary defines what is in scope.
- Review Surface defines what must be reviewed.
- Engineering Baseline defines project conventions.
- Product Completeness checks whether a product slice is usable.
- Execution Closure proves what changed and how it was verified.
- Execution Closure should cite Change Impact Coverage when a cross-surface rule or behavior change is closed.
- Strict Execution Closure can use `--require-impact-coverage` to require a linked Change Impact Coverage report before `READY_FOR_COMMIT_REVIEW`.
- Precision Execution Closure can use `--require-precise-evidence` to require the exact linked report to match the current closure task or intent.
- Review Loop handles low-risk repair and re-review.
- Safe Launch remains required before launch or production claims.
