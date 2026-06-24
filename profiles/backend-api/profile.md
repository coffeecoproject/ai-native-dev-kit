# Profile: Backend API

## Purpose

Support backend services and APIs while preserving the core AI Native workflow.

## Applies To

- HTTP APIs
- RPC services
- background services with API contracts
- data-backed service modules

## Does Not Apply To

- browser-only UI changes
- native mobile UI work
- one-project business policy

## Default Task Level

L1 for local endpoint/service behavior.
L2 when data contracts, permissions, migrations, concurrency, or external integrations are touched.
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

- API contracts
- schemas and validation
- auth and authorization
- database transactions
- idempotency and concurrency
- logs and audit events
- integration tests

## Platform / Project-type Risks

- permission bypass
- missing server-side validation
- unsafe migrations
- resource isolation gaps
- non-idempotent retries
- concurrency races
- unsafe error responses
- unreviewed external side effects

## High-risk Boundaries

Stop and ask before:

- auth or authorization model changes
- production schema/data migration
- destructive data operation
- secret/config changes
- new external side-effect integration
- changing audit or retention behavior

## Required Verification

- contract tests
- permission tests
- migration tests if schema changes
- load/performance smoke checks when relevant
- integration tests for success and rejection paths

## Release / Distribution Checks

- migration plan reviewed if applicable
- rollback plan documented
- logs/metrics reviewed for critical operations
- compatibility with consumers reviewed

## AI Boundaries

AI may implement scoped API/service changes, tests, and review suggestions.

AI must not access production data, alter production credentials, or approve destructive operations.

## Starter Expectations

Compatible starters:

- `generic-project`

Required starter additions:

- backend-specific `scripts/verify.sh`
- API contract and migration verification guidance
