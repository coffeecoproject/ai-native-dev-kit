# Industrial Pack Selection Guide

This guide helps a project choose BL2 industrial packs without making every project heavy by default.

Use it after platform profiles are selected and before `docs/baseline-selection.md` is approved.

## Short Rule

Select the smallest pack set that covers the real runtime, capability, and risk.

```text
primary platform pack
  + capability packs that the project actually uses
  + risk-overlay packs only when the risk exists
```

Do not select a pack because it exists. Select it because the project would be unsafe, unclear, or hard to verify without it.

## Pack Maturity

All current industrial packs are draft packs. They are executable with explicit human confirmation, but they are not yet stable defaults.

Current maturity shape:

| Area | Current state | Notes |
|---|---|---|
| Web | deepest draft | Web has runtime quality, interaction, API failure, accessibility, performance, release evidence, and a BL2 dogfood example. |
| Backend / Auth / Data / Internal Admin | usable draft | Best treated as Web BL2 companion packs for real service-backed work. |
| iOS / Android | platform draft | Runtime and release baselines exist, but they need more project dogfood before stable use. |
| WeChat Mini Program | deeper platform draft | Runtime, login, permission, cloud/access-rule, privacy/payment, release-review baselines, and a BL2 dogfood example exist; real project dogfood is still required before stable use. |
| Payment / Value Transfer / High-risk Change | risk-overlay draft | Use only when the risk exists and human approval is explicit. |
| CloudBase | capability draft | Use when managed cloud functions, access rules, storage, or platform cloud services are part of the project. |

## Primary Platform Packs

Choose at most the primary platform packs that match the project runtime.

| Project runtime | Candidate pack |
|---|---|
| Browser application, dashboard, admin UI, web product | `web-app-industrial` |
| iOS application | `ios-app-industrial` |
| Android application | `android-app-industrial` |
| WeChat Mini Program | `wechat-miniprogram-industrial` |

Multi-platform products may select more than one primary platform pack, but each selected pack must have evidence ownership.

## Capability Packs

Add capability packs only when that capability is in scope.

| Capability in project | Candidate pack |
|---|---|
| Backend API contracts, server-side behavior, API runtime quality | `backend-api-industrial` |
| Roles, scopes, tenants, protected resources, authorization | `auth-permission-industrial` |
| Schema, persistence, migration, recovery, backup/restore | `data-storage-industrial` |
| Internal admin operations, privileged workflows, audit trails | `internal-admin-industrial` |
| Managed cloud functions, access rules, cloud storage, platform cloud deployment | `cloudbase-industrial` |

## Risk Overlay Packs

Add risk overlays only when the risk exists.

| Risk | Candidate pack |
|---|---|
| Payments, credit, balance, billing, value transfer | `payment-value-transfer-industrial` |
| Regulated, destructive, irreversible, production-sensitive, or unusually high-risk change | `high-risk-change-industrial` |

Risk overlays do not replace primary or capability packs. They add stricter evidence and approval expectations.

## Recommended Combinations

These are starting points, not fixed recipes.

| Project shape | Typical profile selection | Typical BL2 pack selection |
|---|---|---|
| Static or low-risk browser tool | `web-app` | Usually no BL2 pack; use BL0/BL1 unless risk is real. |
| Browser app with protected server data | `web-app`, `backend-api` | `web-app-industrial`, `backend-api-industrial`, `auth-permission-industrial` |
| Browser internal admin with persistent records | `web-app`, `backend-api`, `internal-admin` | `web-app-industrial`, `backend-api-industrial`, `internal-admin-industrial`, `auth-permission-industrial`, `data-storage-industrial` |
| API-first service | `backend-api` | `backend-api-industrial`; add `auth-permission-industrial` or `data-storage-industrial` only when touched. |
| Mobile app backed by APIs | `ios-app` or `android-app`, `backend-api` | mobile platform pack + `backend-api-industrial`; add auth/data packs when relevant. |
| WeChat Mini Program with cloud functions | `wechat-miniprogram` | `wechat-miniprogram-industrial`, `cloudbase-industrial`; add auth/data packs when relevant. |
| WeChat Mini Program with admin backend | `wechat-miniprogram`, `internal-admin`, plus `backend-api` or cloud service profile | `wechat-miniprogram-industrial`, `internal-admin-industrial`, `auth-permission-industrial`, `data-storage-industrial`, plus `backend-api-industrial` or `cloudbase-industrial` depending on the backend. |
| Any project with value movement | relevant platform profiles | relevant platform/capability packs + `payment-value-transfer-industrial` |
| Any high-risk project change | relevant profiles, optionally `high-risk-change` | relevant packs + `high-risk-change-industrial` |

## Mini Program With Backend Or Admin

A mini program is usually only one runtime in a broader product. Do not put the whole backend or operations console inside `wechat-miniprogram-industrial`.

Use this split:

| Area | Use |
|---|---|
| Mini program user runtime | `wechat-miniprogram-industrial` |
| Operations or management backend | `internal-admin-industrial` |
| Server API contracts | `backend-api-industrial` |
| Cloud functions, cloud storage, managed cloud rules | `cloudbase-industrial` |
| Login, roles, tenants, protected resources | `auth-permission-industrial` |
| Persistent records, schema, backup, recovery | `data-storage-industrial` |
| WeChat Pay, balance, refund, value movement | `payment-value-transfer-industrial` |

The backend/admin packs are optional, but they become required when those surfaces are in project scope. The mini program pack should reference those companion packs; it should not absorb their responsibilities.

## Selection Procedure

1. Select platform profiles in `docs/project-profile.md`.
2. Choose BL level in `docs/baseline-selection.md`.
3. If BL2 is selected, choose the smallest relevant industrial pack set.
4. Install only selected packs:

```bash
node ai-native-dev-kit/scripts/init-project.mjs \
  --target <project> \
  --update-workflow-assets \
  --industrial-packs web-app-industrial,backend-api-industrial
```

5. Check selected packs:

```bash
node scripts/check-industrial-pack.mjs . --selected-only
node scripts/resolve-industrial-baseline.mjs .
node scripts/check-industrial-baseline.mjs . --bl2-only
```

6. Fill `docs/baseline-evidence.md` with project evidence refs.

## Human Decision Questions

Before approving BL2 selection, answer:

- Which runtime is actually being delivered?
- Which data or permission boundary would fail dangerously if wrong?
- Which selected pack has a real owner for evidence?
- Which packs are deliberately not selected, and why?
- Are any selected packs draft-only and accepted as draft?
- Which task gates should block implementation until evidence exists?

## What Not To Do

- Do not select all packs by default.
- Do not select Web just because the Web dogfood example is the most complete.
- Do not select payment or high-risk overlays without real risk.
- Do not use BL2 to compensate for unclear product scope.
- Do not treat an industrial pack as project evidence.
- Do not mark a pack stable only because its files exist.

## Stable Promotion Requirements

A draft pack can be promoted only after it has project evidence, not just complete files.

Minimum promotion bar:

- At least two real project dogfoods used the pack without bypassing gates.
- At least one existing-project adoption found no blocking mismatch or recorded the fix.
- `check-industrial-pack.mjs` passes for the pack.
- `check-industrial-baseline.mjs --strict` passes in a project that selected the pack.
- Implementation work used `check-workflow-artifacts.mjs --mode implementation --task <task-card>`.
- Release or recovery evidence exists where the pack requires it.
- Workflow retros record false positives, missing checks, and follow-up changes.

Until those conditions are met, keep the pack as draft and require explicit human acceptance before using it as a BL2 project baseline.
