# Platform Standard Baseline Packs

Platform standard baseline packs help Codex choose ordinary engineering guardrails for a project platform before considering industrial overlays.

They answer:

```text
For this platform and BL level, which normal baseline packs should be recommended?
```

## Plain Meaning

- Platform packs are ordinary project baselines.
- Industrial packs are optional risk overlays.
- Backend and release packs are conditional.
- Project evidence, compatibility, and internal readiness are still required.
- Baseline selection does not approve implementation or target-project writes.

## Current Platform Packs

| Platform / shape | Recommended standard packs | Conditional packs |
|---|---|---|
| Web app | `web-runtime-standard`, `environment-standard` | `backend-api-standard`, `internal-admin-standard`, `release-rollback-standard` |
| Mini Program | `miniprogram-runtime-standard`, `environment-standard` | `backend-api-standard`, `release-rollback-standard` |
| iOS app | `ios-app-standard`, `environment-standard` | `backend-api-standard`, `release-rollback-standard` |
| Android app | `android-app-standard`, `environment-standard` | `backend-api-standard`, `release-rollback-standard` |
| Backend API | `backend-api-standard`, `environment-standard` | `release-rollback-standard` |
| Internal admin | `internal-admin-standard`, `web-runtime-standard`, `environment-standard` | `backend-api-standard`, `release-rollback-standard` |

## BL Behavior

| Level | Behavior |
|---|---|
| `BL0_LIGHTWEIGHT` | Recommend only the essential platform runtime pack when the platform is known; environment stays minimal or pending. |
| `BL1_STANDARD` | Recommend ordinary platform and environment packs; keep backend and release conditional unless scope evidence exists. |
| `BL2_INDUSTRIAL` | Recommend standard packs first, then show optional industrial overlays separately. |

## Mini Program Backend Rule

Mini Program backend is common, but optional.

Do not force `backend-api-standard` unless there is evidence for cloud functions, CloudBase, custom backend API, login/session API, database reads/writes, admin backend, or backend deployment scope.

## Existing Project Rule

For existing governed, production-sensitive, or dirty projects:

```text
read-only mapping -> gap report -> human decision -> controlled apply only if allowed
```

Do not overwrite `AGENTS.md`, CI, PR templates, release flow, or existing governance files through standard baseline recommendation.

## Boundary

Standard baseline recommendation does not:

- authorize target-project writes
- approve implementation
- approve release or production
- approve security, privacy, legal, compliance, payment, tax, finance, HR, or migration decisions
- prove real project evidence exists
- make BL2 or industrial overlays active
