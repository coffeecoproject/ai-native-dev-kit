# Release Record: 1.8.0

## Human Summary

1.8.0 adds read-only real-project adoption and patch classification. It helps Codex recognize existing governed projects, map rather than overwrite local governance, and stop patch-style fixes from being used where structural remediation or human decision is required.

## Scope

- Real Project Read-only Adoption Trial.
- Existing Governance Map bridge guidance.
- Patch Classification Governance.
- Sanitized source and example evidence.
- Bad fixtures and self-check integration.
- Equivalent baseline detection for existing projects with non-canonical baseline paths.

## Evidence

- `real-adoption-trials/180-governed-web-readonly.md`
- `governance-maps/180-governed-web-readonly.md`
- `patch-classifications/180-governed-web-repair-scale.md`
- `review-loop-reports/180-real-project-adoption-trial.md`
- `final-reports/180-real-project-adoption-trial.md`
- `releases/1.8.0/self-check-report.md`

## Allowed Claims

- The dev kit can record and check a sanitized read-only adoption trial.
- The dev kit can distinguish no-write mapping, docs-only bridge, thin operational bridge, and blocked routes.
- The dev kit can reject recorded patch classifications that overstate safe local fixes or authorize implementation.

## Forbidden Claims

- This release does not claim production validation.
- This release does not approve release, security, privacy, compliance, migration, payment, or customer decisions.
- This release does not authorize writes to existing governed projects.
- This release does not prove every platform or project type has been trialed.

## Evidence Status

Status: SANITIZED_SOURCE_EVIDENCE

Evidence basis:

- one sanitized read-only governed Web project trial
- local checker and fixture verification
- release self-check report

Not included:

- public target-project identity
- target project write evidence
- production validation evidence

## Verification

See `releases/1.8.0/self-check-report.md`.

## Known Limitations

See `releases/1.8.0/known-limitations.md`.
