# IntentOS 1.82.0 Self-Check Report

## Scope

This self-check covers Controlled Native Adoption Review and its public CLI
entry points.

## Checks Run

- `node --check scripts/resolve-controlled-native-adoption-review.mjs`
- `node --check scripts/check-controlled-native-adoption-review.mjs`
- `node scripts/cli.mjs adopt-review . --intent "review deeper IntentOS adoption"`
- `node scripts/cli.mjs adopt-review-check . --allow-empty`
- `node scripts/check-controlled-native-adoption-review.mjs examples/1.82-controlled-native-adoption-review/strong-governed-stay-partial --require-structured-evidence`
- `node scripts/check-controlled-native-adoption-review.mjs examples/1.82-controlled-native-adoption-review/weak-governance-repair --require-structured-evidence`
- `node scripts/check-controlled-native-adoption-review.mjs examples/1.82-controlled-native-adoption-review/messy-production-repair-only --require-structured-evidence`
- `node scripts/check-controlled-native-adoption-review.mjs examples/1.82-controlled-native-adoption-review/light-plan-only --require-structured-evidence`
- `node scripts/check-manifest.mjs`
- `node scripts/check-intentos.mjs`
- `git diff --check`

## Boundary Assertions

- Writes target-project files: No
- Installs `.intentos/`: No
- Replaces `AGENTS.md`: No
- Changes CI or release rules: No
- Claims full adoption: No
- Approves release or production: No

## Result

Passed.

Controlled Native Adoption Review can classify strong governed, weak
governance, messy production-sensitive, and light low-risk project shapes while
remaining read-only and non-authorizing.
