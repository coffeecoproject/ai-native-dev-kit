# Release Adapter Profile: <title>

## Human Summary

| Field | Value |
|---|---|
| Adapter State | `NEEDS_BEGINNER_RELEASE_DECISION` |
| Recommended Target | `PREVIEW_OR_TEST` |
| Why | <plain language reason> |
| Safe Next Step | <one recommended next step> |

## Project Release Discovery

| Signal | Finding | Evidence |
|---|---|---|
| Platform | <web / backend / miniprogram / ios / android / generic> | <file or N/A> |
| Build command | <command or N/A> | <file or N/A> |
| Test command | <command or N/A> | <file or N/A> |
| Deployment provider | <provider or UNKNOWN> | <file or N/A> |
| Release workflow | <found / missing> | <file or N/A> |

## Release Target Recommendation

| Option | Meaning | Risk | Recommendation |
|---|---|---|---|
| PREVIEW_OR_TEST | Validate in a non-production place first | low | Recommended |
| STAGING_OR_INTERNAL | Hand off to internal release review | medium | Optional |
| PRODUCTION_REVIEW | Prepare for production approval | high | Only after launch review |
| PAUSE | Stop until account/platform details are known | low | Use if unclear |

## Beginner Release Card

Recommended choice: <recommended choice>

What I need from you:

- <question 1>
- <question 2>
- <question 3>

What Codex can do next:

- <safe action>

What Codex must not do:

- <high-risk action>

## Project Release Profile

| Field | Value |
|---|---|
| Project type | <type> |
| Release target | <target> |
| Build command | <command or N/A> |
| Verification command | <command or N/A> |
| Deployment method | <method or UNKNOWN> |
| Environment source | <ref or N/A> |
| Rollback source | <ref or N/A> |
| Monitoring source | <ref or N/A> |
| Release owner | <owner or N/A> |
| Evidence path | <path or N/A> |

## Codex Execution Boundary

| Action | Owner | Status | Notes |
|---|---|---|---|
| DISCOVERY | `CODEX_MAY_RUN` | `ALLOWED` | Read-only project discovery |
| LOCAL_BUILD | `CODEX_MAY_RUN_AFTER_CONFIRMATION` | `CONDITIONAL` | Only local, non-production |
| LOCAL_TEST | `CODEX_MAY_RUN_AFTER_CONFIRMATION` | `CONDITIONAL` | Only local, non-production |
| PREVIEW_DEPLOY | `HUMAN_APPROVAL_REQUIRED` | `CONDITIONAL` | Needs project SOP and account context |
| PRODUCTION_DEPLOY | `HUMAN_REQUIRED` | `BLOCKED` | Not automated by this adapter |
| SECRETS_OR_DNS_OR_PAYMENT | `HUMAN_REQUIRED` | `BLOCKED` | Never collected or changed by this adapter |

## Missing Inputs

- <missing input or N/A>

## Release Execution Bridge

```bash
node scripts/cli.mjs release-execution . --intent "prepare release execution" --release-sop release-adapters/<id>.md
```

## Evidence

| Evidence | Ref |
|---|---|
| Discovery | <ref or generated> |
| Human decision | <ref or N/A> |
| Release SOP | <ref or N/A> |

## Boundaries

- This adapter approves release: No
- This adapter deploys by itself: No
- This adapter asks for or stores secrets: No
- This adapter changes CI/CD, hooks, DNS, payment, permissions, app-store state, mini-program state, or production config: No
- This adapter treats beginner confirmation as production approval: No
- This adapter makes Codex the release owner: No

## Outcome

`NEEDS_BEGINNER_RELEASE_DECISION`
