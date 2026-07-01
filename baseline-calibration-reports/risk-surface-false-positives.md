# Risk Surface False-Positive Calibration

## Human Summary

1.47 calibrates shared risk-surface detection so benign wording is not treated as high risk by itself.

This is not a safety downgrade. Real secret, CI, deployment, payment, permission, migration, production, and data contexts must still be high risk.

## Benign Phrases

These should stay low risk unless paired with actual risky paths or security-sensitive context:

- `product workflow label`
- `key metric copy`
- `package display text`

## High-Risk Phrases

These should remain high risk:

- `API key and secret token handling`
- `.github/workflows/dev-kit-release-checks.yml`
- `database migration for payment permissions`

## Boundary

- This calibration does not authorize writes.
- This calibration does not approve apply.
- This calibration does not weaken path safety checks.
- This calibration does not override human decisions.
