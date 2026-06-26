# Mini Program CloudBase And Security Baseline

## Required Coverage

- Cloud functions or external APIs touched by the mini program have explicit boundary notes.
- Database and storage access rules are reviewed when records, files, or protected resources are touched.
- WeChat login state, openid/unionid/session binding, and role/resource scope are documented when used.
- Client-side filtering is not treated as an authorization boundary.
- Environment separation is documented for development, test, staging, and production-like resources when present.
- Logs and failure observation exist for cloud function or API failures in critical flows.

## Evidence Expectations

- Evidence must show how unauthorized, forbidden, expired-session, and failure states behave.
- Evidence must include access-rule or server-side permission proof when protected data is touched.
- Evidence must identify production configuration changes and require human approval before implementation.
- Evidence must not include secrets, credentials, real tokens, or production-only identifiers.

## AI Boundary

AI may draft cloud function boundary notes, access-rule review notes, and safe test scenarios.

AI must not approve production configuration, access rules, secrets, or permission boundaries.
