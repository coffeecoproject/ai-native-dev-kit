# Release 1.46.0: Ordinary User Product Loop Hardening

## Summary

1.46.0 hardens the ordinary-user product loop introduced across 1.42-1.45.

It improves the path from a plain product goal to local MVP evidence without turning IntentOS into an automatic apply runner:

```text
plain goal
-> first-slice scope
-> local MVP evidence
-> product completeness report
-> low-risk apply candidate record
-> later human-approved apply planning only when needed
```

## Added Or Changed

- Reframed Quickstart so ordinary users start with a product goal before maintainer bootstrap or baseline flows.
- Extended `scripts/lib/risk-surfaces.mjs` into a shared risk analysis and path safety module.
- Updated `first-slice` and `apply-candidate` to use shared risk-surface analysis.
- Added `schemas/artifacts/low-risk-apply-candidate.schema.json`.
- Added `Machine-Readable Evidence` to generated Low-Risk Controlled Apply Candidate records.
- Added strict structured evidence validation to `check-low-risk-apply-candidate.mjs`.
- Added `--evidence <file>` support to `product-completeness`.
- Strengthened the booking MVP example with smoke output and failure/empty-state evidence.
- Added a second local MVP example: `examples/mvp-dashboard-web-app`.
- Generalized `check-mvp-example.mjs` so it validates example metadata and explicit smoke evidence rather than only hard-coded booking terms.

## Allowed Claims

- 1.46.0 improves the ordinary-user first-version path.
- 1.46.0 can cite explicit local smoke evidence in Product Completeness reports.
- 1.46.0 makes low-risk apply candidate records machine-checkable in strict mode.
- 1.46.0 includes two local MVP examples that pass local smoke checks.

## Forbidden Claims

- Do not claim 1.46.0 applies changes automatically.
- Do not claim 1.46.0 approves implementation, release, production, CI, hooks, payments, permissions, migrations, secrets, or data changes.
- Do not claim local MVP examples prove real-user adoption or production readiness.
- Do not claim structured apply-candidate evidence replaces human approval.
- Do not claim BL2 or industrial packs are enabled by default.

## Evidence

- `docs/plans/ordinary-user-product-loop-hardening-1.46-plan.md`
- `docs/quickstart.md`
- `scripts/lib/risk-surfaces.mjs`
- `scripts/resolve-product-completeness.mjs`
- `scripts/resolve-low-risk-apply-candidate.mjs`
- `scripts/check-low-risk-apply-candidate.mjs`
- `schemas/artifacts/low-risk-apply-candidate.schema.json`
- `examples/mvp-booking-web-app/`
- `examples/mvp-dashboard-web-app/`

## Evidence Status

- Source assets are present in the repository and listed in `intentos-manifest.json`.
- Booking and dashboard MVP examples include local smoke evidence.
- Low-risk apply candidate example passes strict structured evidence validation.
- Product Completeness resolver can cite explicit local evidence through `--evidence`.
- This evidence is IntentOS governance and local-demo evidence only; it is not production validation for a target project.

## Known Limitations

- 1.46.0 does not implement a writer, apply runner, scheduler, hook installer, CI modifier, or production deployment path.
- Risk-surface analysis remains conservative and heuristic.
- Local MVP examples do not prove real-user adoption, production readiness, security, privacy, legal, payment, deployment, or release approval.
- Historical Markdown-only target-project candidate records remain compatible unless strict mode is explicitly requested.
- Structured candidate evidence does not replace human approval.

## Verification

- `node scripts/check-intentos.mjs`
- `npm run verify`
- `node scripts/check-manifest.mjs`
- `node scripts/check-fixtures.mjs`
- `git diff --check`

## Boundary

This release is a hardening release. It does not add an apply runner, target-project write executor, hook installer, CI modifier, production release gate, or industrial-pack activation path.
