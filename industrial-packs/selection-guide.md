# Industrial Pack Selection Guide

This guide tells IntentOS Codex how to derive BL2 industrial packs without making every project heavy by default.

Use it after Codex has established platform profiles from current project evidence and before baseline readiness is claimed. The user does not select or approve technical packs.

## Short Rule

Codex selects the smallest pack set that covers the real runtime, capability, and risk.

```text
primary platform pack
  + capability packs that the project actually uses
  + risk-overlay packs only when the risk exists
```

Pack availability alone never activates a pack. Codex activates it only when the project would otherwise be unsafe, unclear, or hard to verify.

## Pack Maturity

All current industrial packs are draft packs. Codex may select a draft pack when current project risk requires it, but must keep its maturity visible and satisfy the pack's evidence contract before readiness can be claimed.

BL2 selection means the project chose stronger governance. It does not mean the selected pack is
stable, production-ready, or externally validated.

Lifecycle stages:

| Stage | Use |
|---|---|
| `draft` | Controlled project use with strict evidence and review; not a stable default. |
| `candidate` | Broader governed trial after early real-project evidence. |
| `stable` | Normal BL2 input after repeated real-project evidence and false-positive review. |
| `deprecated` | Existing reference only; avoid new selection. |
| `retired` | No longer an active baseline input. |

Current maturity shape:

| Area | Current state | Notes |
|---|---|---|
| Web | deepest draft | Web has runtime quality, interaction, API failure, accessibility, performance, release evidence, and a BL2 dogfood example. |
| Backend / Auth / Data / Internal Admin | usable draft | Best treated as Web BL2 companion packs for real service-backed work. |
| iOS / Android | platform draft | Runtime and release baselines exist, but they need more project dogfood before stable use. |
| WeChat Mini Program | deeper platform draft | Runtime, login, permission, cloud/access-rule, privacy/payment, release-review baselines, and a BL2 dogfood example exist; real project dogfood is still required before stable use. |
| Payment / Value Transfer / High-risk Change | risk-overlay draft | Use only when concrete project risk exists; real-world execution still requires its own bounded consent. |
| CloudBase | capability draft | Use when managed cloud functions, access rules, storage, or platform cloud services are part of the project. |

## Primary Platform Packs

Codex limits primary platform packs to those that match the project runtime.

| Project runtime | Candidate pack |
|---|---|
| Browser application, dashboard, admin UI, web product | `web-app-industrial` |
| iOS application | `ios-app-industrial` |
| Android application | `android-app-industrial` |
| WeChat Mini Program | `wechat-miniprogram-industrial` |

Multi-platform products may select more than one primary platform pack, but each selected pack must have project-bound evidence.

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

Risk overlays must be backed by risk-specific evidence:

- `payment-value-transfer-industrial`: payment, refund, balance, billing, value movement, reconciliation, idempotency, duplicate-submit, or operator review evidence.
- `high-risk-change-industrial`: risk classification, blast radius, approval scope, rollback, mitigation, migration, production, destructive, or incident evidence.

If those terms cannot be backed by `docs/baseline-evidence.md`, do not select the risk overlay yet.

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

## Codex Selection Procedure

1. Read project code, configuration, existing governance, and the business goal.
2. Derive platform and capability profiles and record the evidence in `docs/project-profile.md`.
3. Derive the BL level and standard baseline first.
4. If concrete risk requires BL2, select the smallest complete industrial pack set.
5. Create a controlled plan and install only selected packs:

```bash
node intentos/scripts/init-project.mjs \
  --target <project> \
  --update-workflow-assets \
  --industrial-packs web-app-industrial,backend-api-industrial
```

6. Check selected packs:

```bash
node scripts/check-industrial-pack.mjs . --selected-only
node scripts/resolve-industrial-baseline.mjs .
node scripts/check-industrial-baseline.mjs . --bl2-only
```

7. Bind every required evidence row to concrete current-project evidence in `docs/baseline-evidence.md`.
8. Do not enter task implementation until the platform, standard baseline, industrial pack, and evidence checks are ready.

## User Input Boundary

Codex records these technical conclusions internally:

- the runtime actually being delivered;
- the data or permission boundary whose failure would be dangerous;
- the concrete evidence for every selected pack;
- deliberately unselected packs and their exclusion reasons;
- draft selections that require stricter evidence;
- task gates that block implementation until evidence exists.

The user is asked only for a missing business fact, a genuine product preference, a concrete real-world action consent, or an external fact that cannot be established from the project. Technical uncertainty remains Codex work and blocks readiness until resolved.

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

Until those conditions are met, keep the pack as draft. Codex may use it only with strict project evidence and must not describe it as a stable default.

Pack files prove the standard exists. They do not prove that a real project already satisfies it.
