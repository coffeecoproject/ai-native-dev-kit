# WeChat Mini Program Industrial Pack

Status: Draft

## Purpose

Define industrial delivery expectations for WeChat Mini Program runtime surfaces.

This pack covers runtime behavior, platform capability boundaries, release evidence, privacy-sensitive permissions, and operational rollback expectations. It is not a project implementation and does not prove that a real mini program is ready for release.

## Pack Type

`primary-platform`

## Applies To

- WeChat Mini Program user interfaces
- mini programs with cloud functions, external APIs, storage, login, payments, or platform permissions
- mini programs distributed to testers or users

## Requires Additional Packs When Relevant

- `backend-api-industrial` when the mini program depends on external APIs
- `cloudbase-industrial` when cloud functions, cloud storage, or managed backend services are used
- `auth-permission-industrial` when login, roles, tenants, or protected resources exist
- `data-storage-industrial` when persistent data is in scope
- `payment-value-transfer-industrial` when value movement exists
- `high-risk-change-industrial` when production, destructive, regulated, or irreversible work is in scope

## Evidence Standard

A BL2 Mini Program project must be able to point to concrete evidence for:

- supported runtime assumptions and platform capability usage
- critical flow behavior in development and review-like environments
- permission prompts, denied states, and privacy data handling
- API, cloud function, and storage boundaries
- release, rollback, and monitoring evidence
- unresolved exceptions and residual risks

## AI Boundaries

AI may draft code, tests, release notes, audit notes, and evidence records inside an approved task scope.

AI must not self-approve release submission, production configuration, platform permission acceptance, value transfer, or residual risk acceptance.
