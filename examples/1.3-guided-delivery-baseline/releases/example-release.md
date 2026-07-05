# Example Release Record

## Human Summary

This is a simulated example of bounded release wording.

## Allowed Claims

- Simulated dogfood passed.
- Generated-project smoke can be checked separately.
- Human approval remains required for production use.

## Forbidden Claims

- Do not claim production validation.
- Do not claim guaranteed safety.
- Do not claim AI approved release.

## Evidence Status

| Evidence | Status | Notes |
|---|---|---|
| Simulated dogfood | Present | Example only. |
| Generated-project smoke | Not included | Use intentos self-check. |
| Controlled real-project trial | Not present | Not claimed. |
| Production adoption evidence | Not present | Not claimed. |

## Known Limitations

- Example only.
- No production deployment.
- No launch readiness claim.

## Verification

```bash
node scripts/check-claim-control.mjs examples/1.3-guided-delivery-baseline --file examples/1.3-guided-delivery-baseline/releases/example-release.md
```
