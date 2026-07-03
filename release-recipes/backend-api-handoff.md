# Backend API Handoff Release Recipe

## Human Summary

| Field | Value |
|---|---|
| Recipe ID | `backend-api-handoff` |
| Recipe Status | `STRICT` |
| Platform Family | `backend-api` |
| Selection Confidence | `HIGH` |
| Safe First Target | `staging-handoff` |
| Release Owner | `HUMAN_OR_EXTERNAL_SYSTEM` |

## Platform Signals

| Signal | Evidence |
|---|---|
| backend service | API routes, server framework, service directory, or backend package |
| data or migration risk | migration directory, database client, schema, or deployment SOP |

## Supported Targets

| Target | Default Owner |
|---|---|
| `staging` | `HUMAN_OR_EXTERNAL_SYSTEM` |
| `production` | `HUMAN_OR_EXTERNAL_SYSTEM` |

## Required Inputs

| Input | Minimum Quality |
|---|---|
| release owner | named owner or explicit external release system |
| release SOP | project backend release procedure |
| migration review | migration plan or N/A reason |
| rollback path | rollback and data restore owner |
| monitoring path | logs, metrics, health checks, or incident owner |

## Preflight Checks

| Check | Owner |
|---|---|
| local tests | `CODEX_MAY_RUN_IF_APPROVED_LOCAL_SAFE` |
| local build/typecheck | `CODEX_MAY_RUN_IF_APPROVED_LOCAL_SAFE` |
| migration diff review | `HUMAN_REQUIRED` |
| production deploy | `HUMAN_OR_EXTERNAL_SYSTEM` |

## Human Decisions

| Decision | Owner |
|---|---|
| approve migration risk | `HUMAN_REQUIRED` |
| approve deployment window | `HUMAN_REQUIRED` |
| approve rollback threshold | `HUMAN_REQUIRED` |

## Codex Allowed Actions

| Action | Risk Class |
|---|---|
| inspect local scripts and docs | `LOCAL_READ_ONLY` |
| run local tests after approval | `LOCAL_TEST` |
| prepare release handoff checklist | `PREVIEW_PREPARE` |

## Codex Blocked Actions

| Action | Reason |
|---|---|
| production deploy | human or external release system only |
| production migration | human-owned data risk |
| mutate production config | human-owned production decision |
| request or store database secrets | secrets are out of scope |

## Required Evidence

| Evidence | Minimum Quality |
|---|---|
| release owner | named owner or external release system |
| verification output | command, timestamp, and result |
| migration review | migration plan, N/A reason, or owner approval |
| release SOP | backend deployment procedure |

## Rollback Requirements

| Requirement | Minimum Quality |
|---|---|
| rollback path | deployment rollback and data restore strategy |
| rollback owner | named owner or external release system |

## Monitoring Requirements

| Requirement | Minimum Quality |
|---|---|
| health check | endpoint, log, or dashboard owner |
| incident observation | owner and escalation path |

## Release Execution Bridge

```bash
node scripts/cli.mjs release-execution . --intent "prepare backend API release handoff" --mode PLAN_ONLY
```

## Known Limits

- This recipe does not run production migrations.
- This recipe does not deploy backend services.
- Data restore and incident acceptance remain human-owned.

## Boundaries

- This recipe approves release: No
- This recipe deploys or publishes by itself: No
- This recipe asks for or stores secrets: No
- This recipe changes CI/CD, hooks, DNS, payment, permissions, app-store state, mini-program state, production data, or production config: No
- This recipe makes Codex the release owner: No
- This recipe treats provider assumptions as certainty: No

## Outcome

`RECIPE_RECORDED`
