# Android Internal Testing Release Recipe

## Human Summary

| Field | Value |
|---|---|
| Recipe ID | `android-internal-testing-handoff` |
| Recipe Status | `DRAFT` |
| Platform Family | `android` |
| Selection Confidence | `LOW` |
| Safe First Target | `internal-testing-handoff` |
| Release Owner | `HUMAN_OR_EXTERNAL_SYSTEM` |

## Platform Signals

| Signal | Evidence |
|---|---|
| Android app | Gradle project, AndroidManifest, or Android docs |

## Supported Targets

| Target | Default Owner |
|---|---|
| `internal-testing` | `HUMAN_OR_EXTERNAL_SYSTEM` |
| `play-console` | `HUMAN_OR_EXTERNAL_SYSTEM` |

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
| Play Console upload and rollout | `HUMAN_REQUIRED` |

## Codex Allowed Actions

| Action | Risk Class |
|---|---|
| inspect local Android project | `LOCAL_READ_ONLY` |

## Codex Blocked Actions

| Action | Reason |
|---|---|
| upload bundle | external platform mutation |

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
node scripts/cli.mjs release-execution . --intent "prepare Android release handoff" --mode PLAN_ONLY
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
