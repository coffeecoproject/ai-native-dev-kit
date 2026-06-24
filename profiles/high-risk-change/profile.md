# Profile: High-risk Change

## Purpose

Use this profile for changes that are irreversible, regulated, safety-critical, production-impacting, value-transferring, destructive, or sensitive-data-related.

## Applies To

- irreversible operations
- regulated operations
- safety-critical behavior
- production-impacting changes
- value-transfer operations
- destructive data changes
- sensitive-data operations

## Does Not Apply To

- low-risk local edits
- docs-only changes
- isolated tests that do not touch sensitive behavior

## Default Task Level

L3 unless proven otherwise.

## Required Project Docs

- `docs/product-vision.md`
- `docs/engineering-principles.md`
- `docs/risk-policy.md`
- `docs/architecture.md`
- `docs/domain-model.md`
- `docs/permission-model.md`
- `docs/test-strategy.md`

## Focus Areas

- explicit approval
- auditability
- rollback or disable path
- data and permission boundaries
- production blast radius
- post-change monitoring

## Platform / Project-type Risks

- irreversible side effects
- unauthorized access or action
- incomplete rollback
- missing audit evidence
- unsafe automation
- insufficient human confirmation

## High-risk Boundaries

Stop and ask before:

- executing irreversible operations
- changing production credentials or config
- changing approval requirements
- touching production data
- submitting or triggering regulated operations
- changing safety-critical behavior

## Required Controls

- explicit human approval
- risk gate
- audit trail
- rollback plan
- release gate
- post-release monitoring
- data retention and privacy review when data is involved

## Required Verification

- full relevant verification suite
- rejection path tests
- audit evidence review
- rollback or disable evidence
- manual approval record

## Release / Distribution Checks

- named owner
- rollback plan
- monitoring plan
- known risks
- approval record

## AI Boundaries

AI may draft, analyze, summarize, classify, test, and review.

AI must not directly approve irreversible actions, value transfers, destructive operations, production credential changes, regulated submissions, or sensitive-data operations.

## Starter Expectations

Compatible starters:

- `generic-project`

Required starter additions:

- explicit risk gate
- release note template usage
- approval evidence location
