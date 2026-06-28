# Platform Standard Baseline Matrix

## Matrix

| Profile | BL0 recommended | BL1 recommended | BL2 standard recommended | Conditional standard packs |
|---|---|---|---|---|
| `web-app` | `web-runtime-standard` | `web-runtime-standard`, `environment-standard` | `web-runtime-standard`, `environment-standard` | `backend-api-standard`, `internal-admin-standard`, `release-rollback-standard` |
| `wechat-miniprogram` | `miniprogram-runtime-standard` | `miniprogram-runtime-standard`, `environment-standard` | `miniprogram-runtime-standard`, `environment-standard` | `backend-api-standard`, `release-rollback-standard` |
| `ios-app` | `ios-app-standard` | `ios-app-standard`, `environment-standard` | `ios-app-standard`, `environment-standard` | `backend-api-standard`, `release-rollback-standard` |
| `android-app` | `android-app-standard` | `android-app-standard`, `environment-standard` | `android-app-standard`, `environment-standard` | `backend-api-standard`, `release-rollback-standard` |
| `backend-api` | `backend-api-standard` | `backend-api-standard`, `environment-standard` | `backend-api-standard`, `environment-standard` | `release-rollback-standard` |
| `internal-admin` | `web-runtime-standard` | `internal-admin-standard`, `web-runtime-standard`, `environment-standard` | `internal-admin-standard`, `web-runtime-standard`, `environment-standard` | `backend-api-standard`, `release-rollback-standard` |

## Rules

- `environment-standard` is recommended for BL1 and BL2 non-trivial projects.
- `environment-standard` must stay minimal or pending for BL0.
- `backend-api-standard` is conditional unless backend/API/database scope is selected or evidenced.
- `release-rollback-standard` is conditional unless release, staging, handoff, deployment, rollback, or launch readiness is in scope.
- Industrial overlays are never standard packs.
- Standard baseline selection never approves target-project writes or implementation.

## Resolver Expectation

`node scripts/cli.mjs standard-baseline <project>` should:

- use selected profiles and BL level
- recommend only matching standard packs
- keep conditional packs separate
- keep industrial overlays optional and inactive
- print `CAN_AI_ENABLE_PACKS_NOW: No`
- print `CAN_AI_WRITE_TARGET_FILES_NOW: No`
