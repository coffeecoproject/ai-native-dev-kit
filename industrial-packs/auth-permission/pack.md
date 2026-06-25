# Auth And Permission Industrial Pack

Status: Draft

## Purpose

Define industrial delivery expectations for authentication, authorization, roles, scopes, tenants, and protected resources.

This pack is a capability overlay for projects where access control is part of correctness or safety. It is not a complete auth design and does not prove that a real project is secure.

## Pack Type

`capability`

## Applies To

- login and session flows
- roles, scopes, permissions, tenants, or ownership rules
- protected resources and forbidden states
- admin or privileged operations
- server-side permission enforcement

## Requires Additional Packs When Relevant

- `backend-api-industrial` when permission is enforced through APIs
- `internal-admin-industrial` when privileged admin roles exist
- `data-storage-industrial` when resource ownership or data access is scoped
- `payment-value-transfer-industrial` when permission affects value movement
- `high-risk-change-industrial` when production, destructive, regulated, or irreversible work is in scope

## Evidence Standard

A BL2 auth/permission project must be able to point to concrete evidence for:

- identity, role, scope, tenant, or ownership model
- allowed and forbidden behavior
- server-side enforcement for protected resources
- session, token, or credential lifecycle boundaries
- audit trail for privileged access
- unresolved exceptions and residual risks

## AI Boundaries

AI may draft code, tests, matrices, audit notes, and evidence records inside an approved task scope.

AI must not self-approve permission expansion, credential handling, production secrets, privileged access, or residual risk acceptance.
