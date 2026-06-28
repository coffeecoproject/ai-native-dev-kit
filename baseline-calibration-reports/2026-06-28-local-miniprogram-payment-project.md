# Baseline Calibration: Local Mini Program Payment Project

| Field | Value |
|---|---|
| Artifact type | baseline calibration report |
| Public evidence status | LOCAL_ONLY_SANITIZED |
| Target label | `local-miniprogram-payment-project` |
| Project shape | WeChat Mini Program with payment and cloud functions |
| Target writes performed | No |
| Generated on | 2026-06-28 |

## Human Summary

The selector correctly noticed a Mini Program and payment risk, and it kept
writes disabled. The main calibration gap is backend scope: cloud functions were
present in the real project shape, but the guided baseline decision reported
backend API scope as `not detected`.

## Commands

```bash
node scripts/cli.mjs start <target>
node scripts/cli.mjs baseline <target>
node scripts/resolve-guided-baseline-selection.mjs <target> --json
node scripts/cli.mjs standard-baseline <target>
node scripts/cli.mjs baseline-packs <target>
```

## Observed Decision

| Area | Observed result |
|---|---|
| Project state | `EXISTING_LIGHT_PROJECT` |
| Default adoption mode | gap review first / plan-first |
| Detected platform | `wechat-miniprogram` |
| Backend API scope | `not detected` |
| Production sensitivity | `not detected` |
| High-risk scope | payment/finance/tax |
| Guided baseline level | `BL2_INDUSTRIAL` as candidate only |
| Standard packs | `environment-standard`, `miniprogram-runtime-standard` |
| Industrial candidates | `payment-value-transfer-industrial`, `wechat-miniprogram-industrial` |
| Can write target files now | No |

## Calibration Judgment

The payment and Mini Program classification is useful. It avoids turning BL2 on
automatically while still warning that value transfer may require industrial
review.

The backend signal is too weak for Mini Program projects that use cloud
functions. A Mini Program with cloud functions should not always select a full
backend baseline, but it should at least mark backend scope as `possible; needs
confirmation`.

## Recommended Follow-Up

1. Treat common Mini Program cloud function directories as backend companion
   signals.
2. Keep backend packs conditional unless API contracts, server logic, database,
   migrations, or deployment ownership are in scope.
3. Preserve the current no-write behavior for existing light projects until a
   reviewed plan is approved.

## Non-Goals

- Do not auto-enable BL2.
- Do not install all Mini Program or payment industrial overlays.
- Do not write adoption assets into the target project from this report.

