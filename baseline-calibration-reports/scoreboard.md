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
| local-miniprogram-payment-project | Mini Program with payment and cloud functions | existing or new Mini Program with high-risk companion scope | Mini Program with payment/cloud-function signals | Mini Program selected/inferred; backend possible and needs confirmation | Mini Program selected/inferred; backend/API scope possible after 1.18 | plan-first, no backend forced | BL1 plan/read-only; backend not forced | BL2 candidate only if payment/data evidence remains relevant | BL2 candidate only, not selected | no | no after 1.18 | fixed |
| local-production-governed-web-project | production governed Web/admin/backend project | production-sensitive governed project | production-sensitive project | Web/admin/backend active or needs mapping; no overwrite | governed read-only / adapter-first with mapped baselines | read-only governance mapping | BL1_STANDARD_READ_ONLY_MAPPING | BL2 candidate for production/data risk only | BL2_INDUSTRIAL candidate only | no | no after 1.18 | fixed |
| local-ios-backend-project | iOS app with backend signals and dirty worktree | dirty worktree, mobile/backend scope possible | dirty worktree | iOS active; backend possible; other platforms not selected | dirty worktree blocks writes; target candidate retained | read-only until worktree decision | READ_ONLY_UNTIL_WORKTREE_DECISION | BL2 candidate only after worktree decision | BL2 candidate after worktree resolution | no | monitor | monitor |
| local-ios-industrial-monorepo-project | iOS-led governed monorepo with Web/admin/backend and inactive/deferred shells | production/governed monorepo, adapter-first | production-sensitive or governed project | selected platform active; deferred shells separated | Platform States distinguish selected, needs confirmation, deferred, not detected | read-only adapter mapping | BL1_STANDARD_READ_ONLY_MAPPING | BL2 candidate only for high-risk evidence | BL2_INDUSTRIAL candidate only | no | no after 1.18 | fixed |

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
