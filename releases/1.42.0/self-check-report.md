# Self-Check Report: 1.42.0

## Scope

Ordinary User First-Slice Path.

## Checks

- `node --check scripts/resolve-first-slice.mjs`
- `node --check scripts/check-first-slice.mjs`
- `node scripts/check-first-slice.mjs examples/1.42-ordinary-user-first-slice`
- `node scripts/check-first-slice.mjs test-fixtures/bad/bad-first-slice-authorizes-write`
- `node scripts/check-first-slice.mjs test-fixtures/bad/bad-first-slice-jargon`
- `node scripts/check-first-slice.mjs test-fixtures/bad/bad-first-slice-too-many-questions`
- `node scripts/check-first-slice.mjs .`
- `node scripts/check-fixtures.mjs`
- `npm run verify`

## Result

Passed as part of the 1.42-1.45 integrated verification run.
