# Profile: Internal Admin

## Purpose

Support internal administrative tools and operation consoles while preserving the core AI Native workflow.

## Applies To

- internal admin panels
- operation consoles
- data management tools
- approval or review back offices

## Does Not Apply To

- public marketing pages
- native mobile apps
- one-project business policy

## Default Task Level

L2 by default because admin tools often touch permissions, sensitive records, audit trails, and destructive actions.
L3 when destructive, irreversible, regulated, production-impacting, or sensitive-data operations are touched.

## Required Project Docs

- `docs/product-vision.md`
- `docs/engineering-principles.md`
- `docs/risk-policy.md`
- `docs/architecture.md`
- `docs/domain-model.md`
- `docs/permission-model.md`
- `docs/test-strategy.md`

## Focus Areas

- roles and permissions
- audit logs
- data import/export
- destructive actions
- approval flows
- search/filter/table usability
- operation traceability

## Platform / Project-type Risks

- overly broad admin permissions
- missing audit trails
- unsafe bulk actions
- accidental destructive actions
- sensitive data export leakage
- weak confirmation flows
- missing operation history

## High-risk Boundaries

Stop and ask before:

- destructive or bulk operations
- permission model changes
- sensitive data export/import
- production data repair
- audit log behavior changes
- approval flow changes

## Required Verification

- admin-only route checks
- audit event checks
- confirmation dialogs for destructive actions
- export privacy review
- permission rejection tests
- manual operation review for destructive flows

## Release / Distribution Checks

- admin access reviewed
- audit trail reviewed
- rollback or disable path documented
- known sensitive operations listed

## AI Boundaries

AI may draft admin UI, scoped backend operations, tests, and audit checks.

AI must not approve destructive actions, access production data, or weaken audit requirements.

## Starter Expectations

Compatible starters:

- `generic-project`
- `codex-web-app`

Required starter additions:

- admin permission checklist
- audit log verification guidance
