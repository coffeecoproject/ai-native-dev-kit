# IntentOS 1.95.0 Self-Check Report

## Scope

- public operating-loop entry and six-operation routing;
- new/existing project-entry identity;
- generated-project installation behavior;
- evidence and authority view boundaries;
- task impact versus project baseline depth;
- CLI public/advanced command separation;
- manifest, documentation, and repository regression coverage.

## Results

| Check | Result |
|---|---|
| `node --test tests/operating-model.test.mjs` | PASS |
| Generated project records `NEW_PROJECT` origin | PASS |
| Generated booking-app goal routes to `START_PROJECT` | PASS |
| Initialized new project later task routes to `CONTINUE_TASK` | PASS |
| Business nouns do not hijack task routing | PASS |
| Production signals override historical entry origin without raising task impact | PASS |
| Existing normal task remains task-scoped | PASS |
| BL2 low-impact task remains LOW | PASS |
| Finish without valid closure evidence is not done | PASS |
| Source resolver failure blocks the derived state | PASS |
| Default help hides lower-level commands | PASS |
| Advanced help preserves lower-level commands | PASS |
| `node scripts/check-manifest.mjs` | PASS |
| `node scripts/check-intentos.mjs` | PASS |
| `npm run verify:syntax` | PASS |
| `npm run verify` | PASS |
| `npm run verify:release` | PASS |
| `node scripts/check-product-baseline.mjs .` | PASS |
| `node scripts/check-claim-control.mjs .` | PASS |
| Release tag must match `package.json` version | PASS |
| `git diff --check` | PASS |

## Boundary

These checks prove repository behavior and synthetic project routing. They do
not certify a real product, test correctness, provider state, compliance,
production release, or project-owner decision.
