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
