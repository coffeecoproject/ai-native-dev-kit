# Backend API Industrial Pack

Status: Draft

## Purpose

Define industrial delivery expectations for backend APIs and service boundaries.

This pack converts the `backend-api` profile into evidence-backed requirements for API contracts, authentication boundaries, data access, observability, release safety, and operational recovery.

## Pack Type

`capability`

## Applies To

- HTTP APIs
- service endpoints
- server-side application logic
- integration boundaries used by web, mobile, mini program, or internal admin clients

## Does Not Cover By Itself

- browser, iOS, Android, or mini program runtime behavior
- admin approval workflow or operator UX
- database schema, backup, retention, or migration correctness beyond API-facing contract impact
- full auth, role, tenant, or protected-resource policy design
- payment, refund, ledger, balance, or value-transfer correctness

## Requires Additional Packs When Relevant

- `auth-permission-industrial` when protected resources, roles, tenants, or scopes exist
- `data-storage-industrial` when persistent data is read or written
- `payment-value-transfer-industrial` when value movement exists
- `high-risk-change-industrial` when destructive, regulated, production-impacting, or irreversible work is in scope

## Evidence Standard

A BL2 backend API project must be able to point to concrete evidence for:

- API contract and compatibility behavior
- authentication and authorization enforcement
- validation, error, rate, and failure behavior
- database or external side-effect boundaries
- observability, rollback, and incident readiness
- unresolved exceptions and residual risks

## AI Boundaries

AI may draft code, tests, contracts, audit notes, and evidence records inside an approved task scope.

AI must not self-approve production config, auth or permission changes, destructive operations, data migrations, value transfer, or residual risk acceptance.

## Scope Boundary

The Backend API pack governs API contracts, request/response validation, error models, compatibility, service-side side effects, observability, and API release safety. Platform runtime, admin, data storage, auth policy, payment, and high-risk production responsibilities require companion packs when they affect correctness or safety.

## Architecture Baseline

Evidence should identify endpoint ownership, DTO/domain boundaries, validation layer, error model, auth boundary, data access boundary, external integration boundary, compatibility strategy, and dependency ownership.

## Environment Baseline

Evidence should identify runtime version, package manager, local command, test command, database or external-service dependency names, CI path, deployment target, and environment variable names only. Secret values and production config edits are outside this pack's authority.

## Data Boundary

This pack can verify how APIs read, write, validate, and expose data. Schema ownership, migrations, backup, restore, retention, destructive data repair, and recovery require `data-storage-industrial`.

## Permission Boundary

This pack can verify auth hooks and server-side enforcement points. Identity model, roles, tenants, permission matrix, credential lifecycle, and privileged access review require `auth-permission-industrial`.

## Verification Baseline

BL2 evidence should include contract tests, validation/error behavior proof, compatibility proof, integration boundary proof, permission enforcement proof when relevant, observability proof, rollback/mitigation proof, and unresolved exceptions.

## Release And Rollback

Release evidence should reference API compatibility impact, deployment or migration boundary, rollback or mitigation path, monitoring signal, incident readiness, and unresolved exceptions. This pack does not approve production deployment.

## Evidence Template

Record project evidence in `docs/baseline-evidence.md`. Each done requirement should include an evidence ref to contract tests, API test output, migration review, release record, observability note, review packet, or project-specific verification file.

## Bad Cases

- Selecting this pack as proof that web, mobile, admin, data, auth, or payment behavior is safe.
- Changing DTO/domain boundaries without compatibility evidence.
- Claiming API BL2 approval authorizes implementation, migration, or release.
- Recording production URLs, tokens, credentials, or customer data in pack files.

## Codex Forbidden Actions

Codex must not self-approve production config, auth policy, data migration, destructive operation, value transfer, release, or residual risk acceptance without companion packs and human approval.

## Maturity Limits

This pack remains draft. It is not stable, not production-proven, and does not prove any real backend API satisfies BL2 without project-specific evidence.
