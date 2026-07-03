# Mini Program Review Handoff Release Recipe

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
| mini-program project | `project.config.json`, `app.json`, `miniprogramRoot`, or platform docs |
| review/release path | mini-program review SOP or platform owner |

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
| rollback path | release rollback or version fallback owner |
| monitoring path | smoke, platform status, logs, or customer support observation |

## Preflight Checks

| Check | Owner |
|---|---|
| local build/lint where available | `CODEX_MAY_RUN_IF_APPROVED_LOCAL_SAFE` |
| local package sanity review | `CODEX_MAY_RUN_IF_APPROVED_LOCAL_SAFE` |
| platform upload | `HUMAN_OR_EXTERNAL_SYSTEM` |
| platform review submission | `HUMAN_OR_EXTERNAL_SYSTEM` |

## Human Decisions

| Decision | Owner |
|---|---|
| approve platform upload | `HUMAN_REQUIRED` |
| approve review submission | `HUMAN_REQUIRED` |
| approve release timing | `HUMAN_REQUIRED` |

## Codex Allowed Actions

| Action | Risk Class |
|---|---|
| inspect local mini-program config | `LOCAL_READ_ONLY` |
| run local checks after approval | `LOCAL_TEST` |
| prepare review handoff checklist | `PREVIEW_PREPARE` |

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
| local verification | command, timestamp, and result |
| review SOP | documented platform review procedure |
| platform evidence | human-owned upload/review/release record reference |

## Rollback Requirements

| Requirement | Minimum Quality |
|---|---|
| fallback version | previous version, owner, and restore condition |
| rollback owner | named owner or external release system |

## Monitoring Requirements

| Requirement | Minimum Quality |
|---|---|
| smoke path | preview/review/production smoke checklist owner |
| user feedback path | support, logs, platform status, or incident owner |

## Release Execution Bridge

```bash
node scripts/cli.mjs release-execution . --intent "prepare mini-program review handoff" --mode PLAN_ONLY
```

## Known Limits

- This recipe does not upload packages.
- This recipe does not submit mini-program review.
- This recipe does not release reviewed versions.

## Boundaries

- This recipe approves release: No
- This recipe deploys or publishes by itself: No
- This recipe asks for or stores secrets: No
- This recipe changes CI/CD, hooks, DNS, payment, permissions, app-store state, mini-program state, production data, or production config: No
- This recipe makes Codex the release owner: No
- This recipe treats provider assumptions as certainty: No

## Outcome

`RECIPE_RECORDED`
