# Data Storage Industrial Pack

Status: Draft

## Purpose

Define industrial delivery expectations for persistent data, schema evolution, backup, restore, and data access boundaries.

This pack is a capability overlay for projects where application behavior depends on durable state. It is not a database design and does not prove that a real project is production-ready.

## Pack Type

`capability`

## Applies To

- relational or document storage
- local or remote persistence
- schema changes and migrations
- backup, restore, retention, or deletion behavior
- data import, export, or synchronization

## Does Not Cover By Itself

- browser, iOS, Android, or mini program runtime behavior
- backend API contract behavior outside data access impact
- admin approval workflow or operator UX
- complete auth, role, tenant, or protected-resource enforcement
- payment, refund, ledger, balance, or value-transfer correctness

## Requires Additional Packs When Relevant

- `backend-api-industrial` when data is accessed through APIs
- `auth-permission-industrial` when resource access is scoped by roles, tenants, or ownership
- `internal-admin-industrial` when privileged data operations exist
- `payment-value-transfer-industrial` when stored value or balances exist
- `high-risk-change-industrial` when destructive, regulated, production-impacting, or irreversible work is in scope

## Evidence Standard

A BL2 data storage project must be able to point to concrete evidence for:

- schema and migration intent
- access boundaries and resource scope
- backup, restore, rollback, or recovery strategy
- retention, deletion, and privacy-sensitive data handling
- data integrity and reconciliation checks
- unresolved exceptions and residual risks

## AI Boundaries

AI may draft migration plans, tests, audit notes, and evidence records inside an approved task scope.

AI must not self-approve production migrations, destructive data operations, retention exceptions, regulated data handling, or residual risk acceptance.

## Scope Boundary

The Data Storage pack governs schema ownership, migration safety, persistence boundaries, backup/restore, retention/deletion, import/export, data repair, and recovery evidence. Platform runtime, backend API, admin workflow, auth policy, payment, and high-risk production responsibilities require companion packs when they affect correctness or safety.

## Architecture Baseline

Evidence should identify data ownership, schema source of truth, enum versus lookup decisions, migration sequence, compatibility strategy, write paths, destructive operation paths, backup/restore path, and repair ownership.

## Environment Baseline

Evidence should identify database or storage engine, local/dev/test data setup, migration command, rollback command or mitigation path, backup/restore command or procedure, CI path, and environment variable names only.

## Data Boundary

This pack owns persistent data correctness expectations: schema, migration, backup, restore, retention, deletion, repair, integrity, reconciliation, and destructive operation gates.

## Permission Boundary

This pack can record resource scope and data access assumptions. Role, tenant, protected-resource enforcement, credential lifecycle, and privileged access review require `auth-permission-industrial`.

## Verification Baseline

BL2 evidence should include schema intent proof, compatibility proof, migration proof, rollback/recovery proof, backup/restore proof, retention/deletion proof, integrity check proof, and unresolved exceptions.

## Release And Rollback

Release evidence should reference migration order, pre-checks, rollback or forward-fix path, backup/restore readiness, monitoring signal, data repair owner, and unresolved exceptions. This pack does not approve production migration.

## Evidence Template

Record project evidence in `docs/baseline-evidence.md`. Each done requirement should include an evidence ref to migration logs, schema review, backup/restore drill, integrity check, release record, review packet, or project-specific verification file.

## Bad Cases

- Treating UI or API tests as migration safety proof.
- Changing enum/lookup/data model decisions without recording the engineering baseline.
- Claiming data BL2 approval authorizes production migration or destructive repair.
- Recording production connection strings, secrets, or real customer data in pack files.

## Codex Forbidden Actions

Codex must not self-approve production migrations, destructive data changes, retention exceptions, regulated data handling, backup bypass, repair scripts, release, or residual risk acceptance without human approval and relevant companion packs.

## Maturity Limits

This pack remains draft. It is not stable, not production-proven, and does not prove any real data storage system satisfies BL2 without project-specific evidence.
