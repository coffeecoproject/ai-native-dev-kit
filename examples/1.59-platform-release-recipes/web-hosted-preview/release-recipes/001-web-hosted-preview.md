# Web Hosted Preview Recipe Example

## Human Summary

| Field | Value |
|---|---|
| Recipe ID | `web-hosted-preview` |
| Recipe Status | `STRICT` |
| Platform Family | `web-hosted-preview` |
| Selection Confidence | `HIGH` |
| Safe First Target | `preview` |
| Release Owner | `HUMAN_OR_EXTERNAL_SYSTEM` |

## Platform Signals

| Signal | Evidence |
|---|---|
| frontend app | `package.json` build script |
| hosted preview candidate | project preview SOP |

## Supported Targets

| Target | Default Owner |
|---|---|
| `preview` | `HUMAN_OR_EXTERNAL_SYSTEM` |
| `production` | `HUMAN_OR_EXTERNAL_SYSTEM` |

## Required Inputs

| Input | Minimum Quality |
|---|---|
| release owner | named owner or external release system |
| environment reference | non-secret preview environment reference |
| release SOP | project preview procedure |

## Preflight Checks

| Check | Owner |
|---|---|
| local build | `CODEX_MAY_RUN_IF_APPROVED_LOCAL_SAFE` |
| preview publish | `HUMAN_OR_EXTERNAL_SYSTEM` |

## Human Decisions

| Decision | Owner |
|---|---|
| approve preview publication | `HUMAN_REQUIRED` |

## Codex Allowed Actions

| Action | Risk Class |
|---|---|
| inspect local scripts | `LOCAL_READ_ONLY` |
| run local build after approval | `LOCAL_BUILD` |

## Codex Blocked Actions

| Action | Reason |
|---|---|
| production deploy | human or external release system only |
| request or store provider secrets | secrets are out of scope |

## Required Evidence

| Evidence | Minimum Quality |
|---|---|
| release owner | named owner or external release system |
| build output | command, timestamp, and result |

## Rollback Requirements

| Requirement | Minimum Quality |
|---|---|
| rollback path | previous deployment, owner, and restore condition |

## Monitoring Requirements

| Requirement | Minimum Quality |
|---|---|
| observation path | preview smoke, logs, or dashboard owner |

## Release Execution Bridge

```bash
node scripts/cli.mjs release-execution . --intent "prepare web hosted preview release" --mode PLAN_ONLY
```

## Known Limits

- Preview publication stays human or external-system owned.

## Boundaries

- This recipe approves release: No
- This recipe deploys or publishes by itself: No
- This recipe asks for or stores secrets: No
- This recipe changes CI/CD, hooks, DNS, payment, permissions, app-store state, mini-program state, production data, or production config: No
- This recipe makes Codex the release owner: No
- This recipe treats provider assumptions as certainty: No

## Outcome

`RECIPE_RECORDED`
