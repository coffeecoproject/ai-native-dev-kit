# Standard Baseline Packs

Standard baseline packs define normal engineering guardrails for common project shapes.

They are not industrial packs, production certification, security approval, privacy approval, compliance approval, release approval, or permission for Codex to write target project files.

Use them before considering BL2 industrial overlays.

`index.json` is a first-class registry file. Keep each entry aligned with the matching `pack.json`; `scripts/check-standard-baseline-pack.mjs` rejects drift.

```text
standard baseline pack -> normal project guardrail
industrial pack -> optional high-risk / production-sensitive overlay
```

## Current Packs

| Pack | Type | Status | Purpose |
|---|---|---|---|
| `web-runtime-standard` | `primary-platform` | `draft` | Web runtime, UI state, API client, forms, responsive behavior |
| `miniprogram-runtime-standard` | `primary-platform` | `draft` | Mini Program pages, components, lifecycle, platform APIs, runtime behavior |
| `ios-app-standard` | `primary-platform` | `draft` | iOS app structure, navigation, state ownership, build and simulator checks |
| `android-app-standard` | `primary-platform` | `draft` | Android app structure, navigation, state ownership, Gradle and emulator checks |
| `backend-api-standard` | `capability` | `draft` | API contract, domain/data boundary, migrations, local API verification |
| `internal-admin-standard` | `capability` | `draft` | Admin console, management dashboard, approval flow, table/form/permission-aware UI |
| `environment-standard` | `environment` | `draft` | Runtime, package manager, command, CI, and environment variable facts without secrets |
| `release-rollback-standard` | `release` | `draft` | Release plan, rollback plan, smoke evidence, deployment decision boundary |

## Boundary

- AI may recommend standard packs.
- Human selection is required before treating a pack as selected.
- Pack selection does not approve implementation.
- Pack selection does not approve release or production.
- Pack selection does not prove real project evidence exists.
- Industrial overlays remain optional and inactive unless explicitly approved.
