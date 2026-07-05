# 1.31.0 Self-Check Report

Status: PASS

## Checks

```bash
node --check scripts/resolve-workflow-guidance.mjs
node --check scripts/check-workflow-guidance.mjs
node --check scripts/check-intentos.mjs
node scripts/resolve-workflow-guidance.mjs . --deep --intent "我要加支付预约"
node scripts/resolve-workflow-guidance.mjs . --deep --intent "我要加支付预约" --json
node scripts/check-workflow-guidance.mjs examples/1.31-intent-aware-deep-guide
node scripts/check-workflow-guidance.mjs .
node scripts/check-manifest.mjs
node scripts/check-intentos.mjs
npm run verify
git diff --check
```

## Result

- `node --check` passed for the intent-aware guide resolver, guidance checker, intentos checker, and CLI.
- Intent-aware guide classified `我要加支付预约` as `ADD_PAYMENT_OR_VALUE_TRANSFER`, marked it high risk, selected read-only deep capabilities, and kept target writes as `No`.
- `examples/1.31-intent-aware-deep-guide` passed `check-workflow-guidance`.
- Source repository workflow guidance, manifest, intentos self-check, full `npm run verify`, and `git diff --check` passed on 2026-06-29.
