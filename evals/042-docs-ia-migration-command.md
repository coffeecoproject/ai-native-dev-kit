---
schema_version: 1.0
artifact_type: eval
number: 042
slug: docs-ia-migration-command
title: "docs ia migration command"
status: ready
created_at: 2026-06-27
intentos_version: 0.41.0
spec: specs/042-docs-ia-migration-command.md
---
# Eval: docs ia migration command

## Related Spec

`specs/042-docs-ia-migration-command.md`

## Must Pass

- [ ] script syntax checks pass
- [ ] migrate safety checks pass
- [ ] manifest check passes
- [ ] intentos self-check passes
- [ ] workflow artifact checks pass
- [ ] no unrelated files changed
- [ ] no unapproved dependency added

## Spec Alignment

- [ ] Implementation matches acceptance criteria
- [ ] Implementation respects non-goals
- [ ] CLI contract matches spec
- [ ] UI states are correctly marked not applicable
- [ ] release and review evidence are covered

## Permission / Data Checks

- [ ] migration command does not mutate target project files
- [ ] write-plan writes only the requested plan file
- [ ] no secrets, production config, deployment, migration apply, or release behavior changed
- [ ] no license terms changed

## Manual Review Checklist

- README is short enough to be a first-entry page.
- Full details are reachable through reference docs.
- Migration docs include CI, AGENTS, PR template, human approval, and rollback impacts.
- `migrate` cannot apply changes.

## Reject Conditions

Reject if:

- `migrate` can write target project files
- README no longer links to full references
- migration command silently supports unsupported version ranges
- docs imply apply migration exists
- task added unapproved dependencies
- task violates non-goals

## Required Evidence

- Command output summary: record syntax, migrate dry-run, migrate write-plan, manifest, workflow, review-loop, and intentos check results.
- Screenshots / traces if UI: not applicable; no UI changed.
- Review notes: record self-review findings in `review-loop-reports/042-docs-ia-migration-command.md`.
