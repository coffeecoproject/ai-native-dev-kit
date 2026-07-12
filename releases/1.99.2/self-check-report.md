# IntentOS 1.99.2 Self-Check Report

## Scope

Fail-closed context classification, active-guidance conflict detection,
targeted review-input binding, current public wording, Manifest distribution,
and generated-project parity.

## Focused Checks

| Check | Status |
|---|---|
| Unknown semantic source classification | PASS |
| Current / compatibility / historical precedence | PASS |
| Direct active-guidance contradiction regressions | PASS |
| Negative-rule false-positive regression | PASS |
| Review context contract digest | PASS |
| Review Packet template binding | PASS |
| GPT review prompt template binding | PASS |
| Generated review-input binding | PASS |
| Installed context checker | PASS |
| Manifest and version consistency | PASS |
| Full repository verification | PASS |
| Diff whitespace validation | PASS |

## Evidence

- `node scripts/check-review-context-authority.mjs`: PASS
- `node --test tests/review-context-authority.test.mjs`: 9 passed, 0 failed
- generated-project Review Packet and GPT prompt binding smoke: PASS
- `node scripts/check-manifest.mjs`: PASS
- `node scripts/check-intentos.mjs`: PASS
- `npm run verify`: PASS
- `git diff --check`: PASS

## Claim Boundary

These checks prove repository and generated-project conformance for this source
snapshot. They do not authorize implementation, apply, release, production,
provider actions, or external claims.
