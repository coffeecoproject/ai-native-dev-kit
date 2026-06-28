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

## Does Not Cover By Itself

- browser, iOS, Android, or mini program runtime behavior
- backend API contract correctness outside the high-risk change surface
- admin workflow safety outside the high-risk operation
- data schema, migration, retention, or recovery correctness without data pack evidence
- complete auth, role, tenant, protected-resource, payment, legal, tax, finance, HR, or compliance approval

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

## Scope Boundary

The High-risk Change pack governs risk classification, blast radius, stop/go criteria, freeze rules, approval scope, verification matrix, rollback/mitigation, incident response, recovery evidence, and human escalation for dangerous changes. Platform runtime, backend API, admin workflow, data storage, auth policy, and payment responsibilities require companion packs when they affect correctness or safety.

## Architecture Baseline

Evidence should identify the high-risk surface, affected systems, dependency boundary, data and permission impact, production config impact, migration or compatibility impact, rollback boundary, owner, and stop condition.

## Environment Baseline

Evidence should identify environment targets by safe alias only, command path, dry-run or rehearsal path, config files by name only, monitoring path, rollback or mitigation path, and secret names only.

## Data Boundary

This pack can require data-impact and rollback evidence. Schema, migration, backup, restore, retention, deletion, and repair correctness require `data-storage-industrial`.

## Permission Boundary

This pack can require access-change impact evidence. Role, tenant, protected-resource, credential lifecycle, and privileged access correctness require `auth-permission-industrial`.

## Verification Baseline

BL2 evidence must include risk-specific evidence for classification, blast radius, approval scope, verification matrix, rollback or mitigation, monitoring, incident response, recovery, and unresolved exceptions.

## Release And Rollback

Release evidence should reference freeze/stop rules, reviewed approval scope, rollback or mitigation plan, monitoring signal, incident owner, recovery path, and unresolved exceptions. This pack does not approve high-risk execution or production release.

## Evidence Template

Record project evidence in `docs/baseline-evidence.md`. Each done requirement should include an evidence ref to a risk report, verification matrix, rollback drill, incident response note, review packet, release record, or project-specific verification file.

## Bad Cases

- Proceeding with destructive, migration, production config, auth, payment, or data change without human escalation.
- Treating generic tests as blast-radius or rollback evidence.
- Claiming high-risk BL2 approval authorizes implementation, release, production execution, or residual risk acceptance.
- Recording production secrets, customer data, real environment URLs, or regulated identifiers in pack files.

## Codex Forbidden Actions

Codex must not self-approve high-risk execution, production release, destructive operation, migration, secret change, rollback acceptance, risk acceptance, or residual risk acceptance without explicit human approval and companion packs.

## Maturity Limits

This pack remains draft. It is not stable, not production-proven, and does not prove any real high-risk change satisfies BL2 without project-specific evidence.
