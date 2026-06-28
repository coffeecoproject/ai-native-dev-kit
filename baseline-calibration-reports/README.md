# Baseline Calibration Reports

These reports record read-only trials against real local projects so the guided
baseline selection flow can be calibrated without writing to target projects.

## Boundary

- Reports are evidence, not project setup instructions.
- Target projects must stay read-only unless a separate human approval allows a
  reviewed write plan.
- Public reports should use sanitized project labels. Do not publish local
  business names, secrets, repository URLs, customer names, or environment
  values.
- A calibration finding does not change the baseline selector by itself. It only
  creates evidence for a later implementation task.

## First Calibration Batch

The 2026-06-28 batch used three project shapes:

| Sanitized target | Shape | Purpose |
|---|---|---|
| `local-miniprogram-payment-project` | WeChat Mini Program with payment and cloud functions | Check Mini Program, payment, and backend-scope detection |
| `local-production-governed-web-project` | Production governed Web/admin/backend project | Check adapter-only, BL2 candidate, and no-write boundaries |
| `local-ios-backend-project` | iOS app with backend signals and dirty worktree | Check mobile/backend detection and dirty-worktree protection |
| `local-ios-industrial-monorepo-project` | iOS-led governed monorepo with Web/admin/backend and inactive-or-deferred mobile shells | Check large-monorepo platform clarity, BL1 safe action vs BL2 candidate language, and adapter-only protection |

## Commands Used

Commands were run from the Dev Kit repository root with sanitized targets:

```bash
node scripts/cli.mjs start <target>
node scripts/cli.mjs baseline <target>
node scripts/resolve-guided-baseline-selection.mjs <target> --json
node scripts/cli.mjs standard-baseline <target>
node scripts/cli.mjs baseline-packs <target>
```

All commands are intended to be read-only for this calibration batch.
