# Mini Program Payment Checklist

- [ ] Payment is confirmed as in scope or explicitly not applicable.
- [ ] Order creation, amount validation, callback handling, cancellation, failure, duplicate payment, and refund behavior are covered when payment is in scope.
- [ ] Payment callback handling is idempotent and server-side verified.
- [ ] Evidence uses sandbox, test order, mock, or human-approved non-production validation.
- [ ] No real payment credentials, secrets, or customer identifiers are recorded.
- [ ] Human approval exists for value transfer, refund behavior, production validation, and residual payment risk.
