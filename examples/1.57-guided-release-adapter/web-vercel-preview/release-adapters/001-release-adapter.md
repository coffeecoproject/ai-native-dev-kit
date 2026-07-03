# Release Adapter Profile: Web Preview

## Human Summary

| Field | Value |
|---|---|
| Adapter State | `READY_FOR_RELEASE_EXECUTION_PLAN` |
| Recommended Target | `PREVIEW_OR_TEST` |
| Why | Vercel-style preview deployment is visible; safest next step is preview/test before production. |
| Safe Next Step | Generate a Release Execution Plan in PLAN_ONLY mode and keep real release actions human-approved. |

## Project Release Discovery

| Signal | Finding | Evidence |
|---|---|---|
| Platform | web-app | package.json |
| Build command | npm run build | package.json |
| Test command | npm run test | package.json |
| Deployment provider | Vercel | vercel.json |
| Release workflow | missing | N/A |
| Environment source | found | docs/environment-baseline.md |
| Rollback source | found | docs/rollback.md |
| Monitoring source | found | docs/monitoring.md |

## Release Target Recommendation

| Option | Meaning | Risk | Recommendation |
|---|---|---|---|
| `PREVIEW_OR_TEST` | Validate in a non-production place first | low | Recommended |
| `STAGING_OR_INTERNAL` | Hand off to internal release review | medium | Optional |
| `PRODUCTION_REVIEW` | Prepare for production approval without deploying | high | Only after launch review |
| `APP_OR_MINI_PROGRAM_REVIEW` | Prepare store or mini-program review materials | medium/high | Platform-specific |
| `PAUSE` | Stop until account/platform details are known | low | Use if unclear |

## Beginner Release Card

Recommended choice: `PREVIEW_OR_TEST`

What I need from you:

- Confirm whether Codex may prepare the Release Execution Plan.

What Codex can do next:

- Generate a Release Execution Plan in PLAN_ONLY mode.
- Run local build or test only after confirmation.
- Record missing release inputs as a checklist.

What Codex must not do:

- Deploy production by itself.
- Ask for or store secrets.
- Change CI/CD, hooks, DNS, payment, permissions, app-store, mini-program, or production config.

## Project Release Profile

| Field | Value |
|---|---|
| Project type | web-app |
| Release target | PREVIEW_OR_TEST |
| Build command | npm run build |
| Verification command | npm run test |
| Deployment method | Vercel |
| Environment source | docs/environment-baseline.md |
| Rollback source | docs/rollback.md |
| Monitoring source | docs/monitoring.md |
| Release owner | product-owner |
| Evidence path | release-adapters |

## Codex Execution Boundary

| Action | Owner | Status | Notes |
|---|---|---|---|
| DISCOVERY | `CODEX_MAY_RUN` | `ALLOWED` | Read-only project discovery. |
| LOCAL_BUILD | `CODEX_MAY_RUN_AFTER_CONFIRMATION` | `CONDITIONAL` | Only local, non-production build. |
| LOCAL_TEST | `CODEX_MAY_RUN_AFTER_CONFIRMATION` | `CONDITIONAL` | Only local, non-production verification. |
| PREVIEW_DEPLOY | `HUMAN_APPROVAL_REQUIRED` | `CONDITIONAL` | Requires project SOP and platform/account context. |
| PRODUCTION_DEPLOY | `HUMAN_REQUIRED` | `BLOCKED` | Not automated by this adapter. |
| STORE_OR_MINI_PROGRAM_SUBMIT | `HUMAN_REQUIRED` | `BLOCKED` | Human platform owner must submit. |
| SECRETS_OR_DNS_OR_PAYMENT | `HUMAN_REQUIRED` | `BLOCKED` | Never collected or changed by this adapter. |
| RELEASE_EXECUTION_PLAN | `CODEX_MAY_PREPARE` | `ALLOWED` | Plan only until approval exists. |

## Missing Inputs

- N/A

## Release Execution Bridge

```bash
node scripts/cli.mjs release-execution . --intent "prepare release execution" --release-sop release-adapters/001-release-adapter.md
```

## Evidence

| Evidence | Ref |
|---|---|
| Release discovery | generated:resolve-release-adapter |
| Release SOP | release-adapters/001-release-adapter.md |
| Human release owner | product-owner |
| Environment source | docs/environment-baseline.md |
| Rollback source | docs/rollback.md |
| Monitoring source | docs/monitoring.md |

## Boundaries

- This adapter approves release: No
- This adapter deploys by itself: No
- This adapter asks for or stores secrets: No
- This adapter changes CI/CD, hooks, DNS, payment, permissions, app-store state, mini-program state, or production config: No
- This adapter treats beginner confirmation as production approval: No
- This adapter makes Codex the release owner: No

## Outcome

`READY_FOR_RELEASE_EXECUTION_PLAN`
