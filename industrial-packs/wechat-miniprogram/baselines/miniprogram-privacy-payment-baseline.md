# Mini Program Privacy And Payment Baseline

## Required Coverage

- Personal data collection is minimized and documented when login, phone number, profile, address, location, or uploaded files are touched.
- Authorization prompts, denied states, revocation behavior, and privacy policy impact are reviewed when platform permissions change.
- Client storage is reviewed for sensitive data, retention, and cleanup behavior.
- Payment entry, order creation, callback handling, refund handling, and failure recovery are covered when value movement exists.
- Payment callback handling must be idempotent and server-side verified when payment is in scope.

## Evidence Expectations

- Privacy evidence must include prompt/denied behavior or a clear non-applicability reason.
- Payment evidence must use sandbox, test order, mock, or non-production evidence unless a human approves production validation.
- Payment and refund evidence must include recovery behavior for failed, duplicate, delayed, or cancelled flows.
- No real payment credential, secret, or customer identifier may be recorded in evidence.

## AI Boundary

AI may draft privacy and payment evidence templates and test scenarios.

AI must not self-approve privacy exceptions, payment release, refund behavior, settlement behavior, or residual value-transfer risk.
