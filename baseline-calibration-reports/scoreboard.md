# Baseline Selection Precision Scoreboard

This scoreboard tracks Guided Baseline Selection precision after sanitized
read-only trials.

It is not production validation. It records whether the selector output matched
the expected safe action, platform states, and candidate BL2 language for each
calibration case.

## Status Vocabulary

| Field | Meaning |
|---|---|
| `falsePositive` | Selector recommended or implied something stronger than expected. |
| `falseNegative` | Selector missed a signal that should have been surfaced. |
| `fixStatus` | `fixed`, `pending`, `monitor`, or `not-applicable`. |

## 2026-06-28 Calibration Batch

| Case id | Project shape | Expected project state | Actual project state | Expected platform states | Actual platform states | Expected safe action | Actual safe action | Expected BL2 candidate | Actual BL2 candidate | falsePositive | falseNegative | fixStatus |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| local-miniprogram-payment-project | Mini Program with payment and cloud functions | existing or new Mini Program with high-risk companion scope | Mini Program with payment/cloud-function signals | Mini Program selected/inferred; backend possible and needs confirmation | Mini Program selected/inferred; backend/API scope possible after 1.18 | plan-first, no backend forced | BL1 plan/read-only; backend not forced | BL2 candidate only if payment/data evidence remains relevant | BL2 candidate only, not selected | no | no | fixed |
| local-production-governed-web-project | production governed Web/admin/backend project | production-sensitive governed project | production-sensitive project | Web/admin/backend active or needs mapping; no overwrite | governed read-only / adapter-first with mapped baselines | read-only governance mapping | BL1_STANDARD_READ_ONLY_MAPPING | BL2 candidate for production/data risk only | BL2_INDUSTRIAL candidate only | no | no | fixed |
| local-ios-backend-project | iOS app with backend signals and dirty worktree | dirty worktree, mobile/backend scope possible | dirty worktree | iOS active; backend possible; other platforms not selected | dirty worktree blocks writes; target candidate retained | read-only until worktree decision | READ_ONLY_UNTIL_WORKTREE_DECISION | BL2 candidate only after worktree decision | BL2 candidate after worktree resolution | no | monitor | monitor |
| local-ios-industrial-monorepo-project | iOS-led governed monorepo with Web/admin/backend and inactive/deferred shells | production/governed monorepo, adapter-first | production-sensitive or governed project | selected platform active; deferred shells separated | Platform States distinguish selected, needs confirmation, deferred, not detected | read-only adapter mapping | BL1_STANDARD_READ_ONLY_MAPPING | BL2 candidate only for high-risk evidence | BL2_INDUSTRIAL candidate only | no | no | fixed |

## 2026-06-29 Synthetic Precision Fixture Batch

| Case id | Project shape | Expected project state | Actual project state | Expected platform states | Actual platform states | Expected safe action | Actual safe action | Expected BL2 candidate | Actual BL2 candidate | falsePositive | falseNegative | fixStatus |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| precision-miniprogram-cloudfunctions | Mini Program with cloudfunctions login | Mini Program with backend companion scope possible | Mini Program selected/inferred | Mini Program selected; backend not forced | Mini Program selected; backend/API scope possible | plan-first, no backend forced | backend-api-standard not selected | BL2 candidate only if auth/payment/data risk remains relevant | candidate only if risk signal exists | no | no | fixed |
| precision-permission-only-docs | Permission architecture docs without admin console | no internal-admin platform | permission risk without admin platform | internal-admin not-detected | internal-admin not-detected | plan-first | BL2 candidate may exist because permission risk exists | BL2 candidate must not imply admin console | no internal-admin pack selected | no | no | fixed |
| precision-web-admin-active | Web admin app with admin scripts/routes | Web app plus internal admin | Web app plus internal admin | web-app and internal-admin selected | web-app and internal-admin selected | BL1 plan-first unless high risk confirmed | standard packs selected only | BL2 not selected without high-risk evidence | no BL2 target unless risk evidence appears | no | no | fixed |
| precision-production-governed-readonly | Production governed Web/backend project | production-sensitive project | production-sensitive project | Web/backend mapped, no overwrite | production-sensitive read-only mapping | read-only governance mapping | BL1_STANDARD_READ_ONLY_MAPPING | BL2 candidate only after evidence and human confirmation | BL2_INDUSTRIAL candidate only | no | no | fixed |
| precision-dirty-payment-risk | Dirty git worktree with payment signals | dirty worktree with payment risk | dirty worktree | Web/payment risk does not allow writes | dirty worktree blocks writes | read-only until worktree decision | READ_ONLY_UNTIL_WORKTREE_DECISION | BL2 candidate only after dirty-worktree decision | BL2 candidate after worktree resolution | no | no | fixed |
| precision-monorepo-deferred-platforms | iOS-led monorepo with inactive Android and Mini Program shells | governed/high-risk monorepo, selected and deferred platforms separated | monorepo with platform states | iOS selected; Android deferred; Mini Program needs confirmation | iOS selected; Android deferred; Mini Program needs confirmation | read-only mapping | BL1_STANDARD_READ_ONLY_MAPPING | BL2 candidate only for risk evidence | BL2_INDUSTRIAL candidate only | no | no | fixed |
| precision-backend-data-api | Backend API with database/schema signals | backend-api with data risk | backend-api with data risk | backend-api selected | backend-api selected | BL1 plan-first with backend standard pack | backend-api-standard selected | BL2 candidate for data risk only | BL2_INDUSTRIAL candidate only | no | no | fixed |
| precision-new-unknown-empty | Empty target with no platform evidence | new empty project with unknown platform | new empty project | all known platforms not detected | unknown platform, no platform packs | BL0 discovery | BL0_LIGHTWEIGHT_DISCOVERY | no BL2 candidate | none | no | no | fixed |

## Open Calibration Questions

1. Do more Mini Program projects with cloud functions produce backend false
   positives?
2. Do permission-only docs still avoid internal-admin false positives?
3. Do monorepo platform states remain stable when multiple platform shells are
   present but inactive?
4. Do dirty-worktree cards keep the current safe action separate from BL2
   target candidate language?
5. Do production governed projects consistently stay adapter-first instead of
   direct init/update?

## Boundary

- The scoreboard is for calibration evidence.
- It does not approve target-project writes.
- It does not approve implementation.
- It does not approve release or production.
- It does not prove commercial or production readiness.
