# High-risk Change Industrial Pack

Status: Draft

## Purpose

Define industrial delivery expectations for high-risk changes that can affect production safety, data integrity, regulated behavior, irreversible operations, or release stability.

This pack is a risk overlay. It does not replace platform or capability packs; it adds stricter evidence, approval, rollback, and audit requirements.

## Pack Type

`risk-overlay`

## Applies To

- destructive or irreversible operations
- production configuration or deployment changes
- regulated or sensitive data handling
- large migrations or compatibility-breaking changes
- security-sensitive changes
- incident response, rollback, or recovery-sensitive changes

## Requires Additional Packs When Relevant

- platform packs for the runtime surface being changed
- `backend-api-industrial` for service and API changes
- `auth-permission-industrial` for access-control changes
- `data-storage-industrial` for data, migration, or recovery changes
- `payment-value-transfer-industrial` for value movement

## Evidence Standard

A BL2 high-risk project must be able to point to concrete evidence for:

- explicit risk classification and approval scope
- blast radius and rollback or mitigation plan
- verification matrix for affected surfaces
- production config and secret review when relevant
- monitoring, incident response, and recovery evidence
- unresolved exceptions and residual risks

## AI Boundaries

AI may draft risk reports, code, tests, audit notes, and evidence records inside an approved task scope.

AI must not self-approve high-risk execution, production release, destructive operations, secret changes, rollback acceptance, or residual risk acceptance.
