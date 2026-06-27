# Learning Candidate: project status source of truth

## Human Summary

Codex observed that this example project appears to use a lookup table for project status. It is approved in this example only because evidence and destination are explicit.

## Observation

Project status should be documented as lookup-table-driven instead of free string.

## Evidence

| Evidence | Source | Confidence |
|---|---|---|
| status table referenced in task notes | tasks/001-project-status-filter.md | High |

## Type

`ENGINEERING_DECISION`

## Confidence

High

## Recommended Destination

`docs/engineering-baseline.md`

## Human Decision

Approved

## Rejection Reason

Not applicable.

## AI Must Not

- Do not update source-of-truth until approved.
- Do not treat this candidate as `CONFIRMED` context in other projects.
- Do not cite this candidate as a baseline rule outside this example.

