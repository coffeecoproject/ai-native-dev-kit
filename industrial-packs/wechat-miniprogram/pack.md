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
