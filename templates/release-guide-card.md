# Release Guide Card

## Human Summary

| Field | Value |
|---|---|
| Guide State | `NEEDS_RELEASE_ADAPTER` |
| Recommended Route | `RELEASE_ADAPTER` |
| Release Target | `PREVIEW_OR_TEST` |
| Assist Level | `LOCAL_ASSIST` |
| Safe Next Step | Generate or review a Release Adapter Profile. |

## Beginner Release Guide Card

Recommended safe next step:

What I found:

What I need from you:

- Confirm the first release target.

What Codex can prepare:

- Release discovery and release execution plan.

What Codex must not do:

- Deploy production, submit stores, run migrations, request secrets, or change production settings.

## Release Guide Routing

| Stage | Status | Ref | Notes |
|---|---|---|---|
| Release Adapter | `MISSING` | N/A | Required before release execution. |
| Launch Review View | `MISSING` | N/A | Required before real release review. |
| Structured Release Approval | `MISSING` | N/A | Required before handoff or assisted execution. |
| Release Execution Protocol | `PLAN_ONLY` | N/A | No real release action. |

## Structured Release Approval Gate

| Field | Value |
|---|---|
| Approval Type | `MISSING` |
| Approval Status | `MISSING` |
| Release Target | N/A |
| Approved Scope | N/A |
| Approved By | N/A |
| Approval Time | N/A |
| Allowed Codex Actions | N/A |
| Blocked Actions | N/A |
| Evidence Path | N/A |
| Expiry / Reconfirm By | N/A |

## Assist Level Classification

| Level | Owner | Status | Notes |
|---|---|---|---|
| `LOCAL_ASSIST` | `CODEX_MAY_RUN_AFTER_APPROVAL` | `CONDITIONAL` | Local read/build/test only. |
| `PREVIEW_ASSIST` | `HUMAN_OR_EXTERNAL_SYSTEM` | `CONDITIONAL` | Preview deploy mutates remote state. |
| `STAGING_HANDOFF` | `HUMAN_OR_EXTERNAL_SYSTEM` | `HANDOFF` | Staging release action. |
| `PRODUCTION_HANDOFF` | `HUMAN_OR_EXTERNAL_SYSTEM` | `HANDOFF` | Production/store/review/migration action. |

## Command Risk Classification

| Command Class | Owner | Status | Notes |
|---|---|---|---|
| `NO_RUN` | `HUMAN_OR_EXTERNAL_SYSTEM` | `DEFAULT` | Unknown commands default here. |
| `LOCAL_READ_ONLY` | `CODEX_MAY_RUN_AFTER_APPROVAL` | `CONDITIONAL` | Local read-only checks. |
| `LOCAL_BUILD` | `CODEX_MAY_RUN_AFTER_APPROVAL` | `CONDITIONAL` | Local build without upload/publish. |
| `LOCAL_TEST` | `CODEX_MAY_RUN_AFTER_APPROVAL` | `CONDITIONAL` | Local tests without remote writes. |
| `PREVIEW_PREPARE` | `CODEX_MAY_PREPARE` | `CONDITIONAL` | Prepare instructions/artifacts only. |
| `PREVIEW_EXECUTE_BY_HUMAN` | `HUMAN_OR_EXTERNAL_SYSTEM` | `HANDOFF` | Preview deploy or upload mutates remote state. |
| `PRODUCTION_HANDOFF_ONLY` | `HUMAN_OR_EXTERNAL_SYSTEM` | `HANDOFF` | Production, stores, migrations, DNS, payment, permissions, config. |

## Evidence Quality Map

| Evidence | Status | Ref | Quality Requirement |
|---|---|---|---|
| Release owner | `MISSING` | N/A | Named owner or external release system. |
| Rollback | `MISSING` | N/A | Path, owner, and restoration condition. |
| Monitoring | `MISSING` | N/A | Dashboard/log/check path and owner. |
| Environment | `MISSING` | N/A | Target environment and non-secret setup reference. |
| Post-launch smoke | `MISSING` | N/A | Target level: local / preview / staging / production. |
| Approval | `MISSING` | N/A | Structured release approval record. |

## Internal Routing

| Input | Ref |
|---|---|
| Release Adapter | N/A |
| Launch Review View | N/A |
| Release Execution | N/A |

## Boundaries

- This guide approves release: No
- This guide deploys or publishes by itself: No
- This guide asks for or stores secrets: No
- This guide treats free-form approval text as release approval: No
- This guide treats beginner confirmation as production approval: No
- This guide changes CI/CD, hooks, DNS, payment, permissions, app-store state, mini-program state, or production config: No
- This guide makes Codex the release owner: No

## Outcome

`RELEASE_GUIDE_RECORDED`
