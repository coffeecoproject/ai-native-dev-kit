# BL2 Industrial Pack Depth Matrix

## Purpose

This matrix summarizes what each BL2 industrial pack is responsible for after the 1.16 deepening pass.

All packs remain draft, selected-only, evidence-required, and non-authorizing.

## Matrix

| Pack | Owns | Does not own by itself | Required evidence focus |
|---|---|---|---|
| `web-app-industrial` | Browser runtime, UI states, forms, API client behavior, accessibility, performance, web release evidence | Backend, admin, data, auth, payment, high-risk production changes | Browser behavior, API failure handling, accessibility, performance, release/rollback |
| `wechat-miniprogram-industrial` | Mini Program pages, lifecycle, navigation, platform APIs, login surface, client storage, review readiness | Backend, admin, cloud data schema, auth policy, payment correctness, destructive operations | Lifecycle, permission prompts, cloud/API failure behavior, release/review readiness |
| `ios-app-industrial` | iOS app architecture, navigation, state, simulator/device behavior, privacy prompts, release readiness | Backend, admin, server data, auth enforcement, payment correctness | Build, simulator/device proof, offline/error states, privacy prompt, signing/release boundary |
| `android-app-industrial` | Android module structure, lifecycle, navigation, state, emulator/device behavior, privacy prompts, release readiness | Backend, admin, server data, auth enforcement, payment correctness | Build, emulator/device proof, offline/background states, permission prompt, signing/release boundary |
| `backend-api-industrial` | API contracts, validation, errors, service boundaries, observability, rollback readiness | UI runtime, admin workflow, storage correctness, auth policy, payment correctness | Contract tests, validation/error behavior, integration boundary, observability |
| `internal-admin-industrial` | Privileged workflows, operator safety, audit trail, confirmation, import/export, admin release risk | Customer runtime, API correctness, storage correctness, auth policy, payment correctness | Role matrix, forbidden states, audit trail, destructive-action mitigation |
| `data-storage-industrial` | Schema, migrations, backup, restore, retention, deletion, integrity, repair | Runtime UI, API contract, admin UX, auth policy, payment correctness | Schema intent, migration safety, backup/restore, integrity, retention/deletion |
| `auth-permission-industrial` | Identity, sessions, roles, tenants, protected resources, enforcement, audit | Runtime UI outside auth-visible states, storage correctness, payment correctness | Permission matrix, allowed/forbidden proof, server enforcement, credential boundary |
| `cloudbase-industrial` | Managed functions, access rules, environment separation, cloud storage/database boundaries, deployment mitigation | Runtime UI, full API contract, full data correctness, auth policy, payment correctness | Function boundary, access rules, environment separation, deployment/rollback |
| `payment-value-transfer-industrial` | Payment, refund, balances, credits, billing, idempotency, reconciliation, audit, compensation | Platform runtime, full API contract, admin UX, storage schema, auth policy, legal/tax/finance approval | Value state model, idempotency, reconciliation, audit trail, compensation plan |
| `high-risk-change-industrial` | Risk classification, blast radius, freeze/stop rules, approval scope, rollback, incident response | Platform/capability correctness without companion packs, legal/tax/finance/HR/compliance approval | Risk-specific evidence, verification matrix, rollback, incident response, recovery |

## Checker Expectations

`scripts/check-industrial-pack.mjs` requires every pack to include:

- `Does Not Cover By Itself`
- `Scope Boundary`
- `Architecture Baseline`
- `Environment Baseline`
- `Data Boundary`
- `Permission Boundary`
- `Verification Baseline`
- `Release And Rollback`
- `Evidence Template`
- `Bad Cases`
- `Codex Forbidden Actions`
- `Maturity Limits`

`scripts/check-industrial-baseline.mjs` rejects:

- BL2 selecting all industrial packs by default
- risk overlays selected without risk-specific evidence
- selected packs missing project evidence refs
- selected packs incompatible with selected profiles

## Human Boundary

The human still decides risk acceptance. The checker can show missing evidence, but it cannot approve production, release, payment, security, privacy, compliance, legal, tax, finance, HR, migration, or residual risk.
