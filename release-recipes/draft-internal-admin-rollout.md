# Internal Admin Rollout Release Recipe

## Human Summary

| Field | Value |
|---|---|
| Recipe ID | `internal-admin-rollout` |
| Recipe Status | `DRAFT` |
| Platform Family | `internal-admin` |
| Selection Confidence | `LOW` |
| Safe First Target | `protected-preview` |
| Release Owner | `HUMAN_OR_EXTERNAL_SYSTEM` |

## Platform Signals

| Signal | Evidence |
|---|---|
| internal admin | admin docs, RBAC docs, audit-sensitive UI, or ops workflow |

## Supported Targets

| Target | Default Owner |
|---|---|
| `protected-preview` | `HUMAN_OR_EXTERNAL_SYSTEM` |

## Required Inputs

| Input | Minimum Quality |
|---|---|
| release owner | named owner or external release system |

## Preflight Checks

| Check | Owner |
|---|---|
| role/access review | `HUMAN_REQUIRED` |

## Human Decisions

| Decision | Owner |
|---|---|
| access rollout | `HUMAN_REQUIRED` |

## Codex Allowed Actions

| Action | Risk Class |
|---|---|
| inspect local admin docs | `LOCAL_READ_ONLY` |

## Codex Blocked Actions

| Action | Reason |
|---|---|
| change production permissions | human-owned production decision |

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
node scripts/cli.mjs release-execution . --intent "prepare internal admin rollout" --mode PLAN_ONLY
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
