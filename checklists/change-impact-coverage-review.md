# Change Impact Coverage Review

## Required Checks

- The report has a clear user request.
- The report identifies the change type and risk level.
- The affected surface map uses only known surface classes.
- Every required surface has an expected evidence type.
- Every implemented `DONE` surface links evidence.
- In `closure` mode, no required surface remains `NOT_STARTED`.
- In strict mode, `DONE` evidence is not placeholder text.
- Structured reports include valid `Machine-Readable Evidence`.
- Structured mode, outcome, and surface statuses match the Markdown report.
- Every `NOT_APPLICABLE` surface has a concrete reason.
- Every `OUT_OF_SCOPE` surface has an owner or follow-up.
- Backend validation or business-rule changes include frontend/API/test/doc consideration.
- Frontend validation changes include backend/API/test consideration.
- API contract changes include test evidence.
- Changed backend rule files close frontend/API/error-copy/test surfaces for rule changes.
- Changed frontend form files close backend/API/test surfaces for rule changes.
- Changed migration/data files do not weakly exclude `DATA_MODEL`.
- Changed auth/permission/security files do not weakly exclude `PERMISSION_RISK`.
- Changed release/deploy/CI files do not weakly exclude `RELEASE_IMPACT`.
- Permission, data, migration, payment, production, privacy, security, or compliance surfaces stop for human decision when evidence is insufficient.
- The report does not approve implementation, release, production, or high-risk decisions.

## Reject When

- The report only lists changed files and ignores missed related surfaces.
- Backend-only or frontend-only completion is claimed for a cross-surface rule change.
- High-risk surfaces are marked `NOT_APPLICABLE` without a reason.
- A `DONE` status has no evidence.
- A `DONE` status uses placeholder evidence in strict mode.
- A closure report leaves a required surface as `NOT_STARTED`.
- Required structured evidence is missing or invalid.
- The report says it is safe to release, production-ready, or approved.

## Boundaries

- This checklist does not approve implementation.
- This checklist does not approve release or production.
- This checklist does not replace Safe Launch or human product judgment.
