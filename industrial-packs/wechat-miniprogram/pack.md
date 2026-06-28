# WeChat Mini Program Industrial Pack

Status: Draft

## Purpose

Define industrial delivery expectations for WeChat Mini Program runtime surfaces.

This pack covers runtime behavior, platform capability boundaries, release evidence, privacy-sensitive permissions, and operational rollback expectations. It is not a project implementation and does not prove that a real mini program is ready for release.

It covers the mini program user runtime only. A management console, operations backend, API service, cloud database, cloud functions, payments, or high-risk production process must be selected through companion packs when those areas are in scope.

## Pack Type

`primary-platform`

## Applies To

- WeChat Mini Program user interfaces
- mini programs with cloud functions, external APIs, storage, login, payments, or platform permissions
- mini programs distributed to testers or users

## Does Not Cover By Itself

- admin backend or operations console behavior
- server-side API contracts outside the mini program runtime
- cloud database schema or migration safety outside mini program access boundaries
- auth/permission model correctness outside mini program prompt and denied-state behavior
- payment settlement, refund, ledger, or value-transfer correctness
- destructive back-office operations

## Requires Additional Packs When Relevant

- `backend-api-industrial` when the mini program depends on external APIs
- `internal-admin-industrial` when the product has a management or operations backend
- `cloudbase-industrial` when cloud functions, cloud storage, or managed backend services are used
- `auth-permission-industrial` when login, roles, tenants, or protected resources exist
- `data-storage-industrial` when persistent data is in scope
- `payment-value-transfer-industrial` when value movement exists
- `high-risk-change-industrial` when production, destructive, regulated, or irreversible work is in scope

## Evidence Standard

A BL2 Mini Program project must be able to point to concrete evidence for:

- supported runtime assumptions and platform capability usage
- page lifecycle, navigation, return paths, share entry, and critical flow behavior
- WeChat login state, session binding, permission prompts, denied states, and privacy data handling
- API, cloud function, and storage boundaries
- cloud access rules, client storage, subscription messages, and payment entry behavior when present
- experience version, platform review, release, rollback, and monitoring evidence
- unresolved exceptions and residual risks

## AI Boundaries

AI may draft code, tests, release notes, audit notes, and evidence records inside an approved task scope.

AI must not self-approve release submission, production configuration, platform permission acceptance, value transfer, or residual risk acceptance.

## Scope Boundary

The Mini Program pack governs pages, components, lifecycle, navigation, platform APIs, login surface behavior, client storage, permission prompts, review readiness, and mini program runtime evidence. Backend, admin, cloud, data, auth, payment, and high-risk responsibilities require companion packs when they affect correctness or safety.

## Architecture Baseline

Evidence should identify page and component ownership, route entry points, lifecycle behavior, state ownership, platform API usage, API/cloud function boundaries, and how critical flows behave after app launch, return, share entry, login expiry, and permission denial.

## Environment Baseline

Evidence should identify the Mini Program tooling, app id handling policy without recording secrets, local/dev/test environment, preview or experience-version process, build command, upload or release command, and platform review path.

## Data Boundary

This pack can record client storage, cache, request payload, and data-display behavior. Cloud database schema, migration, backup, retention, repair, and persistent data correctness require `data-storage-industrial`.

## Permission Boundary

This pack can verify platform permission prompts, denied states, and visible login/session behavior. Role, tenant, protected-resource, and server-side permission correctness require `auth-permission-industrial`.

## Verification Baseline

BL2 evidence should include page lifecycle proof, route and return-path proof, login/session proof, permission prompt and denied-state proof, API/cloud failure proof, client-storage proof, and platform release or review readiness proof where those surfaces are in scope.

## Release And Rollback

Release evidence should reference preview or experience-version validation, upload/review readiness, rollback or mitigation path, monitoring signal, and unresolved exceptions. This pack does not approve WeChat release submission.

## Evidence Template

Record project evidence in `docs/baseline-evidence.md`. Each done requirement should include an evidence ref to a simulator/devtool output, screenshot, release record, cloud audit, review packet, or project-specific verification file.

## Bad Cases

- Selecting this pack for a web-only, iOS-only, or Android-only project.
- Treating mini program UI proof as backend API, cloud access-rule, data migration, or payment proof.
- Claiming Mini Program BL2 approval authorizes implementation or release submission.
- Handling payment or production cloud config with only the Mini Program pack selected.

## Codex Forbidden Actions

Codex must not change app id secrets, cloud production config, payment behavior, platform release settings, backend permissions, data migration, or high-risk flows without the matching companion pack and human approval.

## Maturity Limits

This pack remains draft. It is not stable, not production-proven, and does not prove any real Mini Program satisfies BL2 without project-specific evidence.
