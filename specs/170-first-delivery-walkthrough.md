# Spec 170: First Delivery Walkthrough

## Status

Done

## Source

- Request: `requests/170-first-delivery-walkthrough.md`
- Preflight: `preflight/170-first-delivery-walkthrough.md`

## Problem

The dev kit has strong governance layers, but needs a complete first-delivery walkthrough showing how a basic user can start from one idea and reach a bounded demo recommendation.

## User Story

As a non-technical project owner,
I want Codex to route a broad product idea through the smallest safe first-slice workflow,
so that I can make decisions without manually operating every process artifact.

## Scope

Included:

- First Delivery Walkthrough core doc.
- Adoption Trial Report template.
- Walkthrough prompt and checklist.
- `adoption-trial-reports/` directory.
- First delivery checker.
- Simulated booking mini app walkthrough.
- Bad fixtures for missing final report, missing launch readiness, and overclaim.
- CLI, CI, manifest, docs, and self-check integration.

## Non-goals

- Real project adoption claim.
- Production validation.
- Automatic release or risk approval.
- Automatic BL2/industrial-pack selection.

## Data Model Impact

New or changed entities:

- No runtime product data model change.
- New workflow artifact type: Adoption Trial Report.

## API / Interface Contract

### check-first-delivery-walkthrough

Input:

```json
{
  "target": "project root",
  "flags": ["--json"]
}
```

Output:

```json
{
  "status": "PASS or FAIL",
  "checks": []
}
```

Errors:

- missing required walkthrough assets
- invalid Adoption Trial Report outcome
- missing final report or launch readiness reference
- forbidden overclaim
- unclosed subagent status

## UI States

- Not applicable.

## Permission Rules

- Read-only checker.
- No target project writes.
- No production, release, payment, privacy, security, legal, compliance, migration, or customer approval authority.

## Observability

- Logs: command output from checker and self-check.
- Metrics: fixture pass/fail count.
- Audit events: release record and final report.

## Acceptance Criteria

- Empty target projects pass.
- Reports are required only when a walkthrough or trial is recorded.
- Simulated evidence must be labeled as simulated.
- Reports must reference final report and launch readiness before claiming a complete first-delivery path.
- Subagents must be closed, skipped, or not used.

## Test Plan

- Unit: `node --check scripts/check-first-delivery-walkthrough.mjs`
- Integration: example and bad fixture checks
- E2E: `node scripts/check-dev-kit.mjs`
- Manual: review release wording and README boundary

## Rollback Notes

Revert 1.7 files and manifest entries if the walkthrough layer proves too heavy or unclear.

## Open Questions

- Which real project should be used for the first read-only trial?
