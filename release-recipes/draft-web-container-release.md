# Web Container Release Recipe

## Human Summary

| Field | Value |
|---|---|
| Recipe ID | `web-container-release-handoff` |
| Recipe Status | `DRAFT` |
| Platform Family | `web-container` |
| Selection Confidence | `LOW` |
| Safe First Target | `staging-handoff` |
| Release Owner | `HUMAN_OR_EXTERNAL_SYSTEM` |

## Platform Signals

| Signal | Evidence |
|---|---|
| server/container deployment | Dockerfile, compose file, VPS docs, or reverse proxy docs |

## Supported Targets

| Target | Default Owner |
|---|---|
| `staging` | `HUMAN_OR_EXTERNAL_SYSTEM` |
| `production` | `HUMAN_OR_EXTERNAL_SYSTEM` |

## Required Inputs

| Input | Minimum Quality |
|---|---|
| release owner | named owner or external release system |

## Preflight Checks

| Check | Owner |
|---|---|
| local build | `CODEX_MAY_RUN_IF_APPROVED_LOCAL_SAFE` |

## Human Decisions

| Decision | Owner |
|---|---|
| server deployment | `HUMAN_REQUIRED` |

## Codex Allowed Actions

| Action | Risk Class |
|---|---|
| inspect local deployment docs | `LOCAL_READ_ONLY` |

## Codex Blocked Actions

| Action | Reason |
|---|---|
| SSH production deploy | remote production mutation |

## Required Evidence

| Evidence | Minimum Quality |
|---|---|
| release owner | named owner or external release system |

## Rollback Requirements

| Requirement | Minimum Quality |
|---|---|
| rollback path | draft requires project-specific completion |

## Monitoring Requirements

| Requirement | Minimum Quality |
|---|---|
| observation path | draft requires project-specific completion |

## Release Execution Bridge

```bash
node scripts/cli.mjs release-execution . --intent "prepare web container release handoff" --mode PLAN_ONLY
```

## Known Limits

- Draft recipe. It cannot pass strict recipe checks.

## Boundaries

- This recipe approves release: No
- This recipe deploys or publishes by itself: No
- This recipe asks for or stores secrets: No
- This recipe changes CI/CD, hooks, DNS, payment, permissions, app-store state, mini-program state, production data, or production config: No
- This recipe makes Codex the release owner: No
- This recipe treats provider assumptions as certainty: No

## Outcome

`DRAFT_RECIPE_RECORDED`
