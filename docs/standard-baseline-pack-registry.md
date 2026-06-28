# Standard Baseline Pack Registry

Standard baseline packs answer a practical question:

```text
For this project shape, what normal engineering guardrails should Codex respect?
```

They sit between profiles and industrial packs.

```text
profile -> standard baseline packs -> optional industrial overlays
```

## Plain Meaning

- Standard baseline packs are normal project guardrails.
- Industrial packs are heavier BL2 overlays for high-risk or production-sensitive work.
- Recommendations are read-only.
- Selection requires human confirmation.
- Selection does not approve implementation.

## First Three Packs

| Pack | Use When |
|---|---|
| `web-runtime-standard` | Web UI, routing, state, API client, forms, or browser behavior is in scope |
| `backend-api-standard` | Backend API, DTO/domain boundary, database schema, migrations, or API integration is in scope |
| `release-rollback-standard` | Release, rollback, staging, production, handoff, or launch readiness is in scope |

## Platform Packs

1.15.0 adds draft platform standard packs:

| Pack | Use When |
|---|---|
| `miniprogram-runtime-standard` | WeChat Mini Program pages, components, lifecycle, platform APIs, or runtime behavior is in scope |
| `ios-app-standard` | iOS app structure, navigation, state ownership, build, simulator, or device behavior is in scope |
| `android-app-standard` | Android module structure, navigation, state ownership, Gradle build, emulator, or device behavior is in scope |
| `internal-admin-standard` | Internal admin, management dashboard, approval workflow, CRM, ERP, finance, HR, or operations UI is in scope |
| `environment-standard` | Runtime, package manager, command, CI, deployment environment, or environment variable inventory is in scope |

## Commands

Read-only standard recommendation:

```bash
node scripts/cli.mjs standard-baseline <project>
```

Check recorded standard selection reports:

```bash
node scripts/cli.mjs standard-baseline-selection <project>
```

Read-only umbrella recommendation:

```bash
node scripts/cli.mjs baseline-packs <project>
```

The umbrella command shows standard packs first and optional industrial overlays second.

## Important Boundary

Standard baseline selection does not mean:

- AI can write project files
- a specific implementation task is approved
- release or production is approved
- security, privacy, legal, or compliance is approved
- evidence exists
- BL2 is required
- industrial overlays are active

It only records the intended engineering baseline path.

## 1.14.1 Hardening

- Standard pack metadata fields are explicit. Experimental pack metadata must go under `extensions`.
- Selected profile ids in Standard Baseline Selection Reports must resolve to `profiles/` or `.ai-native/profiles/`.
- Public documentation URLs such as `https://developer.mozilla.org/` or `https://owasp.org/` are allowed in standard pack docs without being treated as private project URLs.
- `scripts/resolve-baseline-packs.mjs` remains available only as a lower-level industrial resolver; humans should use `node scripts/cli.mjs baseline-packs <project>`.

## 1.15.0 Platform Matrix

- Platform runtime packs can be recommended for BL0/BL1/BL2 when the platform is selected.
- `environment-standard` is recommended for BL1/BL2 non-trivial projects and kept minimal or pending for BL0.
- `backend-api-standard` remains conditional for Web, Mini Program, iOS, and Android unless backend/API/database scope exists.
- `release-rollback-standard` remains conditional unless release, staging, handoff, deployment, rollback, or launch readiness is in scope.
- Existing governed projects use read-only mapping and gap-review language, not overwrite language.

## 1.15.1 Registry Hardening

1.15.1 does not add new packs. It tightens the registry so pack recommendations are easier to trust:

- `standard-baseline-packs/index.json` is checked against `standard-baseline-packs/schema/index.schema.json`.
- Each registry entry must match the corresponding `pack.json` for identity, level, profile, capability, status, maturity, and approval-boundary fields.
- `environment-standard` remains guidance-only; it must not write `.env`, invent deployment facts, include secret values, or claim CI/CD or production approval.
- `npm run verify` runs the standard baseline resolver and umbrella baseline-pack resolver before pack checks.
- CODEOWNERS remains inactive, but records an explicit owner-decision backlog before future required ownership.
