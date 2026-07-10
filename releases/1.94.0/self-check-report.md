# IntentOS 1.94.0 Self-Check Report

## Scope

- baseline level and project-signal truth;
- exact new-project baseline plan content;
- baseline installation proof;
- controlled write boundary and legacy apply retirement;
- manifest schema authority and copy-rule normalization;
- public source path and zero-experience entry wording;
- generated-project and full repository regression coverage.

## Results

| Check | Result |
|---|---|
| `BL1_STANDARD` resolves to BL1 | PASS |
| `.intentos` assets excluded from project signals | PASS |
| BL2 without selected pack fails closed | PASS |
| Unknown profile/pack rejected before write | PASS |
| Generated baseline records bound to plan | PASS |
| Controlled baseline installation and exact Apply Receipt binding | PASS |
| Missing baseline Apply Receipt fails closed | PASS |
| Legacy baseline direct apply writes nothing | PASS |
| Manifest strict schema validation | PASS |
| Unknown manifest fields rejected | PASS |
| Duplicate/conflicting target mappings rejected | PASS |
| Redundant ancestor/child mapping rejected | PASS |
| Conflicting target-space overlap rejected | PASS |
| Normalized manifest preserves generated assets | PASS |
| `node --test tests/manifest-authority.test.mjs` | PASS |
| `node scripts/check-manifest.mjs` | PASS |
| `node scripts/check-intentos.mjs --mode full` | PASS |
| `npm run verify:syntax` | PASS |
| `npm run verify` | PASS |
| `npm run verify:release` | PASS |
| `node scripts/check-product-baseline.mjs` | PASS |
| `node scripts/check-claim-control.mjs` | PASS |
| `git diff --check` | PASS |

## Boundary

These checks prove IntentOS repository behavior and synthetic controlled
baseline setup. They do not certify a real product, baseline pack maturity,
production release, provider state, compliance decision, or project-owner
decision.
