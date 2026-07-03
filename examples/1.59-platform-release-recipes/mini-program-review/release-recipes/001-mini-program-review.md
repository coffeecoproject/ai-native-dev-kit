# Mini Program Review Recipe Example

## Human Summary

| Field | Value |
|---|---|
| Recipe ID | `mini-program-review-handoff` |
| Recipe Status | `STRICT` |
| Platform Family | `mini-program` |
| Selection Confidence | `HIGH` |
| Safe First Target | `review-handoff` |
| Release Owner | `HUMAN_OR_EXTERNAL_SYSTEM` |

## Platform Signals

| Signal | Evidence |
|---|---|
| mini-program project | `project.config.json` |
| review path | platform review SOP |

## Supported Targets

| Target | Default Owner |
|---|---|
| `preview` | `HUMAN_OR_EXTERNAL_SYSTEM` |
| `review` | `HUMAN_OR_EXTERNAL_SYSTEM` |
| `production` | `HUMAN_OR_EXTERNAL_SYSTEM` |

## Required Inputs

| Input | Minimum Quality |
|---|---|
| release owner | named owner or external release system |
| platform account owner | named owner, not a secret |
| review SOP | mini-program upload/review/release procedure |

## Preflight Checks

| Check | Owner |
|---|---|
| local package sanity review | `CODEX_MAY_RUN_IF_APPROVED_LOCAL_SAFE` |
| platform upload | `HUMAN_OR_EXTERNAL_SYSTEM` |

## Human Decisions

| Decision | Owner |
|---|---|
| approve platform upload | `HUMAN_REQUIRED` |
| approve review submission | `HUMAN_REQUIRED` |

## Codex Allowed Actions

| Action | Risk Class |
|---|---|
| inspect local mini-program config | `LOCAL_READ_ONLY` |
| prepare review checklist | `PREVIEW_PREPARE` |

## Codex Blocked Actions

| Action | Reason |
|---|---|
| upload mini-program package | platform remote mutation |
| submit review | human-owned platform decision |
| release reviewed version | human-owned production decision |
| request or store platform secrets | secrets are out of scope |

## Required Evidence

| Evidence | Minimum Quality |
|---|---|
| release owner | named owner or external release system |
| review SOP | documented platform review procedure |

## Rollback Requirements

| Requirement | Minimum Quality |
|---|---|
| fallback version | previous version, owner, and restore condition |

## Monitoring Requirements

| Requirement | Minimum Quality |
|---|---|
| smoke path | preview/review/production smoke checklist owner |

## Release Execution Bridge

```bash
node scripts/cli.mjs release-execution . --intent "prepare mini-program review handoff" --mode PLAN_ONLY
```

## Known Limits

- Upload, review, and release stay human-owned.

## Boundaries

- This recipe approves release: No
- This recipe deploys or publishes by itself: No
- This recipe asks for or stores secrets: No
- This recipe changes CI/CD, hooks, DNS, payment, permissions, app-store state, mini-program state, production data, or production config: No
- This recipe makes Codex the release owner: No
- This recipe treats provider assumptions as certainty: No

## Outcome

`RECIPE_RECORDED`
