# 2026-06-29 Synthetic Precision Fixture Report

## Purpose

This report records the 1.19.0 synthetic precision fixture batch for Guided
Baseline Selection.

The fixtures are local, generated, and sanitized. They are designed to exercise
known selection-risk patterns without reading or modifying real projects.

## Cases

| Case id | Purpose |
|---|---|
| `precision-miniprogram-cloudfunctions` | Check Mini Program cloud functions make backend scope possible without forcing `backend-api-standard`. |
| `precision-permission-only-docs` | Check permission/RBAC vocabulary does not infer `internal-admin`. |
| `precision-web-admin-active` | Check active Web admin signals select Web and internal-admin standard packs. |
| `precision-production-governed-readonly` | Check production/governed projects stay read-only mapping with BL2 candidate-only language. |
| `precision-dirty-payment-risk` | Check dirty worktrees stop writes while preserving later BL2 candidate language for payment risk. |
| `precision-monorepo-deferred-platforms` | Check monorepos distinguish selected, needs-confirmation, deferred, and not-detected platform states. |
| `precision-backend-data-api` | Check backend/data signals select backend standard pack and keep BL2 candidate-only for data risk. |
| `precision-new-unknown-empty` | Check empty unknown targets stay BL0 discovery and do not select platform packs. |

## Command

```bash
node scripts/check-baseline-selection-precision.mjs .
```

## Expected Result

The command must pass when:

- `baseline-calibration-reports/scoreboard.md` contains all fixture case ids.
- Each case id is unique and machine-readable.
- False positive / false negative / fix status fields use allowed values.
- Synthetic resolver output matches each case expectation.

## Boundary

- This report is calibration evidence only.
- It is not production validation.
- It does not approve target-project writes.
- It does not approve implementation.
- It does not approve release or production.
- It does not approve security, privacy, compliance, payment, finance, tax,
  HR, migration, or irreversible data decisions.
