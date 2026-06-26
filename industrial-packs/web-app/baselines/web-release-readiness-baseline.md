# Web Release Readiness Baseline

## Purpose

Define minimum release, rollback, and monitoring evidence for BL2 Web projects.

## Required Evidence

- release scope is recorded
- verification commands and results are recorded
- production config changes are reviewed
- rollback, disable, or hotfix path is documented
- monitoring, logging, or post-release check is identified for critical flows
- runtime quality evidence is linked when UI states, forms, API failure paths, accessibility, or performance are touched
- exceptions and residual risks are recorded before release approval

## Stop Conditions

Stop before release when:

- rollback path is unclear for a production-impacting change
- verification evidence is missing
- unresolved high-risk exceptions have no owner or approval
- monitoring or post-release checks are absent for a critical flow
- accepted performance, accessibility, or runtime quality exceptions have no owner or approval

## Evidence Locations

Use project-specific files such as:

- `releases/`
- `docs/baseline-evidence.md`
- `workflow-retros/`
- release notes or deployment records referenced from evidence records
