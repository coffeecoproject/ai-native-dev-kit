# Platform Release Recipe

## Human Summary

| Field | Value |
|---|---|
| Recipe ID | `REPLACE_WITH_RECIPE_ID` |
| Recipe Status | `STRICT` |
| Platform Family | `REPLACE_WITH_PLATFORM_FAMILY` |
| Selection Confidence | `HIGH` |
| Safe First Target | `REPLACE_WITH_SAFE_TARGET` |
| Release Owner | `HUMAN_OR_EXTERNAL_SYSTEM` |

## Platform Signals

| Signal | Evidence |
|---|---|
| `REPLACE_WITH_SIGNAL` | `REPLACE_WITH_EVIDENCE` |

## Supported Targets

| Target | Default Owner |
|---|---|
| `preview` | `HUMAN_OR_EXTERNAL_SYSTEM` |

## Required Inputs

| Input | Minimum Quality |
|---|---|
| release owner | named owner or external release system |

## Preflight Checks

| Check | Owner |
|---|---|
| local verification | `CODEX_MAY_RUN_IF_APPROVED_LOCAL_SAFE` |

## Human Decisions

| Decision | Owner |
|---|---|
| release target | `HUMAN_REQUIRED` |

## Codex Allowed Actions

| Action | Risk Class |
|---|---|
| summarize release prerequisites | `LOCAL_READ_ONLY` |

## Codex Blocked Actions

| Action | Reason |
|---|---|
| production deploy | human or external release system only |

## Required Evidence

| Evidence | Minimum Quality |
|---|---|
| release owner | named owner or explicit external system |

## Rollback Requirements

| Requirement | Minimum Quality |
|---|---|
| rollback path | path, owner, and restore condition |

## Monitoring Requirements

| Requirement | Minimum Quality |
|---|---|
| observation path | dashboard, logs, smoke, or owner-owned monitoring reference |

## Release Execution Bridge

```bash
node scripts/cli.mjs release-execution . --intent "prepare release execution" --mode PLAN_ONLY
```

## Known Limits

- This recipe is read-only.
- This recipe does not approve release.
- This recipe does not deploy, upload, publish, submit, migrate, or mutate remote state.

## Boundaries

- This recipe approves release: No
- This recipe deploys or publishes by itself: No
- This recipe asks for or stores secrets: No
- This recipe changes CI/CD, hooks, DNS, payment, permissions, app-store state, mini-program state, production data, or production config: No
- This recipe makes Codex the release owner: No
- This recipe treats provider assumptions as certainty: No

## Outcome

`RECIPE_RECORDED`
