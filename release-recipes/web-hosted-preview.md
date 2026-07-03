# Web Hosted Preview Release Recipe

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
| frontend app | `package.json`, web framework config, or static build scripts |
| hosted preview candidate | Vercel, Netlify, Cloudflare Pages, Firebase Hosting, or equivalent project SOP |

## Supported Targets

| Target | Default Owner |
|---|---|
| `preview` | `HUMAN_OR_EXTERNAL_SYSTEM` |
| `staging` | `HUMAN_OR_EXTERNAL_SYSTEM` |
| `production` | `HUMAN_OR_EXTERNAL_SYSTEM` |

## Required Inputs

| Input | Minimum Quality |
|---|---|
| release owner | named owner or explicit external release system |
| environment reference | non-secret preview/staging environment reference |
| release SOP | project release or preview procedure |
| rollback path | restore or rollback path with owner |
| monitoring path | logs, dashboard, or smoke observation path |

## Preflight Checks

| Check | Owner |
|---|---|
| local install/build/test command discovery | `CODEX_MAY_RUN_IF_APPROVED_LOCAL_SAFE` |
| local build | `CODEX_MAY_RUN_IF_APPROVED_LOCAL_SAFE` |
| local smoke or static verification | `CODEX_MAY_RUN_IF_APPROVED_LOCAL_SAFE` |
| preview publish | `HUMAN_OR_EXTERNAL_SYSTEM` |

## Human Decisions

| Decision | Owner |
|---|---|
| choose preview provider or existing SOP | `HUMAN_REQUIRED` |
| approve preview publication | `HUMAN_REQUIRED` |
| approve production promotion | `HUMAN_REQUIRED` |

## Codex Allowed Actions

| Action | Risk Class |
|---|---|
| inspect local scripts and docs | `LOCAL_READ_ONLY` |
| run local build after approval | `LOCAL_BUILD` |
| run local tests after approval | `LOCAL_TEST` |
| prepare preview handoff instructions | `PREVIEW_PREPARE` |

## Codex Blocked Actions

| Action | Reason |
|---|---|
| publish preview | remote-state mutation |
| production deploy | human or external release system only |
| change DNS or production config | human-owned production decision |
| request or store provider secrets | secrets are out of scope |

## Required Evidence

| Evidence | Minimum Quality |
|---|---|
| release owner | named owner or external release system |
| build/test output | command, timestamp, and result |
| environment reference | non-secret target reference |
| preview or release SOP | documented procedure or owner-owned path |

## Rollback Requirements

| Requirement | Minimum Quality |
|---|---|
| rollback path | previous deployment, revert path, or provider rollback owner |
| restore condition | condition that triggers rollback decision |

## Monitoring Requirements

| Requirement | Minimum Quality |
|---|---|
| observation path | preview URL smoke, logs, analytics, or dashboard owner |
| post-release smoke | target level and responsible owner |

## Release Execution Bridge

```bash
node scripts/cli.mjs release-execution . --intent "prepare web hosted preview release" --mode PLAN_ONLY
```

## Known Limits

- Hosted provider commands are not local-safe by default.
- Preview publication stays human or external-system owned unless a project SOP explicitly classifies it.
- Production promotion is not part of this recipe's Codex allowed actions.

## Boundaries

- This recipe approves release: No
- This recipe deploys or publishes by itself: No
- This recipe asks for or stores secrets: No
- This recipe changes CI/CD, hooks, DNS, payment, permissions, app-store state, mini-program state, production data, or production config: No
- This recipe makes Codex the release owner: No
- This recipe treats provider assumptions as certainty: No

## Outcome

`RECIPE_RECORDED`
