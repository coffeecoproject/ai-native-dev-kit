# Change Impact Coverage Review

## Required Checks

- The report has a clear user request.
- The report identifies the change type and risk level.
- The affected surface map uses only known surface classes.
- Every required surface has an expected evidence type.
- Every implemented `DONE` surface links evidence.
- In `closure` mode, no required surface remains `NOT_STARTED`.
- In strict mode, `DONE` evidence is not placeholder text.
- When evidence reference resolution is enabled, every `DONE` implementation and verification evidence ref resolves.
- Structured reports include valid `Machine-Readable Evidence`.
- Structured mode, outcome, and surface statuses match the Markdown report.
- Every current strict `NOT_APPLICABLE` surface has a concrete reason and a
  resolvable project-local evidence reference.
- Every current strict `OUT_OF_SCOPE` surface has a bounded follow-up and a
  resolvable project-local evidence reference.
- Every `NEEDS_HUMAN_DECISION` row is backed by a structured
  `BUSINESS_FACT_NEEDED`, `EXTERNAL_FACT_NEEDED`, or
  `REAL_WORLD_CONSENT_NEEDED` record; technical uncertainty is not delegated to
  the user.
- Backend validation or business-rule changes include frontend/API/test/doc consideration.
- Frontend validation changes include backend/API/test consideration.
- API contract changes include test evidence.
- Changed backend rule files close frontend/API/error-copy/test surfaces for rule changes.
- Changed frontend form files close backend/API/test surfaces for rule changes.
- Changed migration/data files do not weakly exclude `DATA_MODEL`.
- Changed auth/permission/security files do not weakly exclude `PERMISSION_RISK`.
- Changed release/deploy/CI files do not weakly exclude `RELEASE_IMPACT`.
- Changed worker/queue/scheduler/batch files do not weakly exclude `BACKGROUND_WORK`.
- Changed provider/webhook/integration files do not weakly exclude `EXTERNAL_INTEGRATION`.
- Changed startup/config/cache/session/container files do not weakly exclude `RUNTIME_BEHAVIOR`.
- Changed retry/rollback/compensation/restore files do not weakly exclude `ROLLBACK_RECOVERY`.
- Permission, data, migration, payment, production, privacy, security, or
  compliance surfaces stop the dependent action when evidence is insufficient;
  Codex owns technical resolution and surfaces only permitted user input.
- The report does not approve implementation, release, production, or high-risk decisions.

## Reject When

- The report only lists changed files and ignores missed related surfaces.
- Backend-only or frontend-only completion is claimed for a cross-surface rule change.
- High-risk surfaces are marked `NOT_APPLICABLE` without a reason.
- A current strict exclusion relies on prose rather than resolvable evidence.
- A technical uncertainty is represented as a user decision.
- A `DONE` status has no evidence.
- A `DONE` status uses placeholder evidence in strict mode.
- `--resolve-evidence-refs` is enabled and a `DONE` evidence ref cannot be resolved.
- A closure report leaves a required surface as `NOT_STARTED`.
- Required structured evidence is missing or invalid.
- The report says it is safe to release, production-ready, or approved.

## Boundaries

- This checklist does not approve implementation.
- This checklist does not approve release or production.
- This checklist does not replace Safe Launch or unavailable business/external facts.
