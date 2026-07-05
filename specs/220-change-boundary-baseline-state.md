---
artifact_type: spec
id: 220-change-boundary-baseline-state
status: approved
---

# Spec: 220-change-boundary-baseline-state

## Human Summary

1.12.0 should make Codex explain and prove three things: what it was allowed to change, what it actually changed, and whether a baseline is only proposed or truly evidenced.

## Request Ref

- `requests/220-change-boundary-baseline-state.md`

## Requirements

1. Add Change Boundary assets and a checker that compares intended scope, allowed paths, forbidden paths, actual changed files, and claim boundary.
2. Add Baseline State assets and a checker that rejects confirmed no-code/new-project baseline claims without evidence or human-confirmed source.
3. Add a Guided Delivery checker that validates active work thread, parking lot, decision level, human choice, and D3/D4 stop boundaries.
4. Add CLI commands for `guided-delivery`, `change-boundary`, and `baseline-state`.
5. Add `new-workflow-item` support for Change Boundary and Baseline State reports.
6. Install the new assets into generated or updated projects through manifest/init/update flow.
7. Update README, reference docs, platform templates, CI, package verify, version metadata, and intentos self-check.
8. Provide positive examples and negative fixtures for each new checker.

## Non-Requirements

- No automatic GitHub or GPT reviewer integration.
- No automatic real-project report generation.
- No target-project write approval.
- No replacement of existing governed project baselines.
- No requirement that every small task must create all three reports.

## Success Criteria

- New checker syntax passes.
- Positive examples pass.
- Bad fixtures fail for expected reasons.
- Manifest and workflow-version stay synchronized.
- `node scripts/check-intentos.mjs` passes.
- `npm run verify` passes.
- `git diff --check` passes.
