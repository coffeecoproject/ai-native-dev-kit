# CloudBase Industrial Pack

Status: Draft

## Purpose

Define industrial delivery expectations for projects using managed cloud backend capabilities such as functions, storage, database, hosting, or environment configuration.

This pack is a capability overlay. It is not a managed-platform configuration and does not prove that a real project is production-ready.

## Pack Type

`capability`

## Applies To

- managed cloud functions
- managed database or storage
- cloud-hosted assets or serverless endpoints
- environment configuration and deployment rules
- mini program or web projects using managed backend services

## Does Not Cover By Itself

- browser, iOS, Android, or mini program runtime behavior
- backend API contract behavior outside managed function boundaries
- admin workflow safety or operator UX
- complete data schema, migration, retention, backup, or recovery correctness
- complete auth, role, tenant, protected-resource, payment, refund, balance, or value-transfer correctness

## Requires Additional Packs When Relevant

- `wechat-miniprogram-industrial` when mini program runtime is in scope
- `web-app-industrial` when web runtime is in scope
- `backend-api-industrial` when cloud functions act as APIs
- `auth-permission-industrial` when protected resources exist
- `data-storage-industrial` when managed storage or database is used
- `high-risk-change-industrial` when production-impacting or irreversible work is in scope

## Evidence Standard

A BL2 CloudBase project must be able to point to concrete evidence for:

- environment separation and production configuration review
- cloud function input, permission, and side-effect boundaries
- managed storage and database access rules
- deployment, rollback, and monitoring evidence
- secret and platform configuration review
- unresolved exceptions and residual risks

## AI Boundaries

AI may draft functions, rules, tests, audit notes, and evidence records inside an approved task scope.

AI must not self-approve production environment changes, access rules, secrets, irreversible operations, or residual risk acceptance.

## Scope Boundary

The CloudBase pack governs managed cloud functions, storage, database access rules, environment separation, serverless deployment, rollback/mitigation, quota/cost boundary, and platform configuration evidence. Platform runtime, API contract, admin workflow, data storage, auth policy, payment, and high-risk production responsibilities require companion packs when they affect correctness or safety.

## Architecture Baseline

Evidence should identify function ownership, trigger boundaries, input/output validation, side effects, storage/database access rules, environment separation, dependency boundary, quota/cost assumptions, and deployment ownership.

## Environment Baseline

Evidence should identify cloud project/environment names by safe alias only, local/sandbox setup, deploy command, rollback or mitigation path, access rule review path, CI path, monitoring path, and secret names only.

## Data Boundary

This pack can verify managed storage/database access boundaries. Schema, migration, backup, restore, retention, deletion, data repair, and recovery require `data-storage-industrial`.

## Permission Boundary

This pack can verify cloud access rules and function permission boundaries. Identity model, roles, tenants, protected resources, credential lifecycle, and privileged access review require `auth-permission-industrial`.

## Verification Baseline

BL2 evidence should include function boundary proof, access rule proof, storage/database access proof, environment separation proof, deployment/rollback proof, quota/cost review, monitoring proof, and unresolved exceptions.

## Release And Rollback

Release evidence should reference deploy artifact, environment target, rollback or mitigation path, access rule review, monitoring signal, quota/cost impact, and unresolved exceptions. This pack does not approve production cloud changes.

## Evidence Template

Record project evidence in `docs/baseline-evidence.md`. Each done requirement should include an evidence ref to function tests, access-rule audit, deployment log, rollback note, monitoring proof, review packet, or project-specific verification file.

## Bad Cases

- Treating CloudBase function proof as full data, auth, payment, or UI proof.
- Editing production access rules without human approval and rollback evidence.
- Claiming CloudBase BL2 approval authorizes production config, deployment, or implementation.
- Recording cloud secrets, real project ids, production URLs, or customer data in pack files.

## Codex Forbidden Actions

Codex must not self-approve production environment changes, access rules, secrets, destructive cloud operations, payment behavior, release, or residual risk acceptance without human approval and relevant companion packs.

## Maturity Limits

This pack remains draft. It is not stable, not production-proven, and does not prove any real CloudBase project satisfies BL2 without project-specific evidence.
