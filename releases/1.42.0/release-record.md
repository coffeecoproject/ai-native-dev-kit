# Release 1.42.0: Ordinary User First-Slice Path

## Summary

1.42.0 makes O0 / BL0 first-slice planning a first-class ordinary-user path.

## What Changed

- Added Ordinary User First-Slice governance, docs, template, checklist, and prompt.
- Added `first-slice` and `first-slice-check`.
- Added owner-facing first-slice output with at most three questions.
- Added positive and negative fixtures for write approval, jargon leakage, and too many questions.

## Boundary

- No target files are written by the first-slice card.
- No implementation, release, production, CI, hook, payment, migration, permission, BL2, or industrial-pack approval is granted.

## Allowed Claims

- This release provides a plain-language first-slice recommendation path.
- It can separate first-version scope from backlog.
- It can ask at most three ordinary-user questions.

## Forbidden Claims

- Do not claim this release builds the product by itself.
- Do not claim it authorizes implementation or release.
- Do not claim it replaces Apply Plan, Review Loop, Safe Launch, or BL2 governance.

## Evidence Status

| Evidence | Status |
|---|---|
| First-slice resolver/checker | Local repository evidence |
| First-slice example | Local repository evidence |
| Bad fixtures | Local repository evidence |
| Full verification | See `releases/1.42.0/self-check-report.md` |

## Known Limitations

- This is a planning and owner-output path, not a code execution runner.
- It does not prove a real product was built.

## Verification

- `node scripts/check-first-slice.mjs examples/1.42-ordinary-user-first-slice`
- `node scripts/check-fixtures.mjs`
- `node scripts/check-intentos.mjs`
