# Profile: Web App

## Purpose

Support browser-based applications and interfaces while preserving the core AI Native workflow.

## Applies To

- browser-based applications
- dashboards
- internal tools
- SaaS frontends
- web interfaces backed by APIs

## Does Not Apply To

- native iOS applications
- native Android applications
- backend-only services without browser UI
- one-project business policy

## Default Task Level

L1 for local UI behavior.
L2 when auth, permissions, data contracts, routing architecture, or cross-module state is touched.
L3 when production data, secrets, irreversible actions, value transfer, or regulated data is touched.

## Required Project Docs

- `docs/product-vision.md`
- `docs/engineering-principles.md`
- `docs/risk-policy.md`
- `docs/architecture.md`
- `docs/domain-model.md`
- `docs/permission-model.md`
- `docs/test-strategy.md`

## Focus Areas

- routes/pages
- UI states
- API contracts
- auth and permission
- responsive behavior
- frontend/backend integration
- e2e tests
- visual checks for important flows

## Platform / Project-type Risks

- client-side secret exposure
- permission checks implemented only in UI
- cross-resource data leakage
- CSRF/XSS/CORS/session mistakes
- broken responsive layouts
- missing loading/empty/error states
- unreviewed dependency additions

## High-risk Boundaries

Stop and ask before:

- auth/session/cookie policy changes
- production config or secrets
- data migrations
- destructive operations
- external side-effect integrations
- security-sensitive headers or middleware

## Required Verification

- desktop and mobile behavior check
- loading/empty/error state review
- no visible layout overlap
- API error handling
- lint/typecheck/unit/build as project stack supports
- e2e or manual behavior check for critical flows

## Release / Distribution Checks

- build output verified
- environment variables reviewed
- monitoring/logging reviewed for critical flows
- rollback or feature flag reviewed when needed

## AI Boundaries

AI may implement scoped UI/API changes, tests, and review suggestions.

AI must not expose secrets, bypass server-side permission checks, or release production changes without approval.

## Starter Expectations

Compatible starters:

- `generic-project`
- `codex-web-app`

Required starter additions:

- web-specific `scripts/verify.sh`
- UI behavior or E2E guidance when the stack is selected
