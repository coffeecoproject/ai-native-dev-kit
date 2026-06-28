---
artifact_type: spec
id: 230-baseline-pack-system
status: approved
---

# Spec: 230-baseline-pack-system

## Human Summary

1.13.0 should add a baseline pack selection layer that recommends the smallest safe pack path and keeps approval with the human.

## Request Ref

- `requests/230-baseline-pack-system.md`

## Requirements

1. Add Baseline Pack System docs that explain project state, profiles, BL levels, pack types, evidence, and human decision.
2. Add a Baseline Pack Selection Report template.
3. Add a checklist and prompt for read-only baseline pack routing.
4. Add `scripts/resolve-baseline-packs.mjs` for read-only recommendation.
5. Add `scripts/check-baseline-pack-selection.mjs` to reject overclaims and approval drift.
6. Add `baseline-packs` and `baseline-pack-selection` CLI commands.
7. Add generated-project asset copy coverage and workflow fallback coverage.
8. Update README/reference docs/version/release evidence/manifest/self-check.

## Non-Requirements

- Do not make BL2 default.
- Do not select all packs by default.
- Do not promote pack maturity.
- Do not add real project production claims.
- Do not approve target-project writes.

## Success Criteria

- `node scripts/cli.mjs baseline-packs .` returns a read-only recommendation.
- `node scripts/check-baseline-pack-selection.mjs .` passes with no reports.
- A generated Baseline Pack Selection Report passes once filled with safe defaults.
- A bad report that selects all packs or authorizes writes is rejected.
- `npm run verify` passes.

