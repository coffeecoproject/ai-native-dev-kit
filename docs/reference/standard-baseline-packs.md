# Standard Baseline Pack Reference

## Registry

- Source: `standard-baseline-packs/index.json`
- Schema: `standard-baseline-packs/schema/standard-pack.schema.json`
- Index schema: `standard-baseline-packs/schema/index.schema.json`
- Selection guide: `standard-baseline-packs/selection-guide.md`

`standard-baseline-packs/index.json` is a first-class registry artifact. Each index entry must stay aligned with the matching pack's `pack.json`.

`environment-standard` is guidance-only. It may define environment topics and evidence expectations, but it must not write `.env`, include secret values, invent deployment facts, or claim CI/CD or production approval.

## Packs

| Pack | Type | Status | Path |
|---|---|---|---|
| `web-runtime-standard` | `primary-platform` | `draft` | `standard-baseline-packs/web-runtime` |
| `miniprogram-runtime-standard` | `primary-platform` | `draft` | `standard-baseline-packs/miniprogram-runtime` |
| `ios-app-standard` | `primary-platform` | `draft` | `standard-baseline-packs/ios-app` |
| `android-app-standard` | `primary-platform` | `draft` | `standard-baseline-packs/android-app` |
| `backend-api-standard` | `capability` | `draft` | `standard-baseline-packs/backend-api` |
| `internal-admin-standard` | `capability` | `draft` | `standard-baseline-packs/internal-admin` |
| `environment-standard` | `environment` | `draft` | `standard-baseline-packs/environment` |
| `release-rollback-standard` | `release` | `draft` | `standard-baseline-packs/release-rollback` |

## Platform Matrix

See [Platform Standard Baseline Matrix](platform-standard-baseline-matrix.md).

## Scripts

| Script | Purpose |
|---|---|
| `scripts/resolve-standard-baseline.mjs` | Read-only recommendation for standard packs and optional industrial overlays |
| `scripts/check-standard-baseline-pack.mjs` | Validate standard pack registry and pack purity |
| `scripts/check-standard-baseline-selection.mjs` | Validate recorded standard baseline selection reports |

## CLI

```bash
node scripts/cli.mjs standard-baseline <project>
node scripts/cli.mjs standard-baseline-selection <project>
node scripts/cli.mjs baseline-packs <project>
```

## Boundary

The registry is not a release approval system. It cannot authorize writes, implementation, release, production, security, privacy, compliance, or legal approval.
