# AI Log: Guided Adoption Entry

## Date

2026-06-27

## Task

`tasks/110-guided-adoption-entry.md`

## Summary

Implemented the 1.1.0 Guided Adoption Entry so users can start with a project path and receive a read-only recommendation instead of choosing lower-level scripts manually.

## Key Decisions

- Keep `workflow-next` as the technical detector.
- Add `start` as a human-facing adoption recommender.
- Keep `start` read-only by default.
- Add a saved-report checker to guard against recommendation drift.
- Keep BL2 and industrial packs behind explicit human confirmation.

## Commands

```text
node --check scripts/start-project.mjs
node --check scripts/check-guided-adoption.mjs
node scripts/check-guided-adoption.mjs examples/1.1-guided-adoption/new-project
node scripts/check-guided-adoption.mjs examples/1.1-guided-adoption/existing-light-project
node scripts/check-guided-adoption.mjs examples/1.1-guided-adoption/governed-readonly
node scripts/cli.mjs start .
node scripts/cli.mjs start . --json
node scripts/check-manifest.mjs
node scripts/check-dev-kit.mjs
```

## Follow-up

Run a real-project trial after 1.1.0 is verified and pushed.
