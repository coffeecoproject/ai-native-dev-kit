# Release Guide Card

## Human Summary

| Field | Value |
|---|---|
| Guide State | `READY_FOR_RELEASE_EXECUTION_PLAN` |
| Recommended Route | `RELEASE_EXECUTION_PROTOCOL` |
| Release Target | `PREVIEW_OR_TEST` |
| Assist Level | `PREVIEW_ASSIST` |
| Safe Next Step | Prepare a Release Execution Plan in PLAN_ONLY mode; high-risk release actions remain human/external-system-owned. |

## Beginner Release Guide Card

Recommended safe next step: Prepare a PLAN_ONLY release execution record for preview.

What I found:

- Release Adapter state: READY_FOR_RELEASE_EXECUTION_PLAN.
- Launch Review label: READY_FOR_RELEASE_REVIEW.
- Structured approval: Yes.
- Missing evidence quality: none.

What I need from you:

- Confirm whether Codex may prepare a PLAN_ONLY release execution record.

What Codex can prepare:

- Release Adapter review.
- Launch Review gap summary.
- Structured release approval template.
- PLAN_ONLY Release Execution bridge.

What Codex must not do:

- Deploy production, publish previews, or submit app-store/mini-program review by itself.
- Ask for or store secrets.
- Run provider API, upload, remote-state mutation, or CI/CD-triggering commands unless explicitly classified and approved.

## Release Guide Routing

| Stage | Status | Ref | Notes |
|---|---|---|---|
| Release Adapter | `PASS` | release-adapters/001-release-adapter.md | Preview release target confirmed. |
| Launch Review View | `PASS` | launch-review-views/001-launch-review.md | READY_FOR_RELEASE_REVIEW and proceed=Yes. |
| Structured Release Approval | `PASS` | approval-records/001-preview-release-approval.md | Structured approval is complete. |
| Release Execution Protocol | `READY` | scripts/resolve-release-execution.mjs | No real release action is approved by Release Guide. |

## Structured Release Approval Gate

| Field | Value |
|---|---|
| Approval Type | `RELEASE_APPROVAL` |
| Approval Status | `APPROVED` |
| Release Target | PREVIEW_OR_TEST |
| Approved Scope | Prepare PLAN_ONLY preview release execution record and local build/test evidence only. |
| Approved By | Product Owner |
| Approval Time | 2026-07-03T10:00:00Z |
| Allowed Codex Actions | LOCAL_READ_ONLY; LOCAL_BUILD; LOCAL_TEST; PREVIEW_PREPARE |
| Blocked Actions | production deploy; preview deploy; provider API; uploads; CI/CD trigger; secrets; DNS; payment; permissions; migrations; production config |
| Evidence Path | release-guides/001-release-guide.md |
| Expiry / Reconfirm By | 2026-07-04T10:00:00Z |

## Assist Level Classification

| Level | Owner | Status | Notes |
|---|---|---|---|
| `LOCAL_ASSIST` | `CODEX_MAY_RUN_AFTER_APPROVAL` | `AVAILABLE` | Local read/build/test only. |
| `PREVIEW_ASSIST` | `HUMAN_OR_EXTERNAL_SYSTEM` | `SELECTED` | Preview deploy mutates remote state unless prepare-only. |
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
| Release owner | `PASS` | Product Owner | Named owner or external release system. |
| Rollback | `PASS` | docs/release/rollback-preview.md | Path, owner, and restoration condition. |
| Monitoring | `PASS` | docs/release/monitoring-preview.md | Dashboard/log/check path and owner. |
| Environment | `PASS` | docs/release/environment-preview.md | Target environment and non-secret setup reference. |
| Post-launch smoke | `PASS` | docs/release/smoke-preview.md | Target level: local / preview / staging / production. |
| Approval | `PASS` | approval-records/001-preview-release-approval.md | Structured release approval record. |
| Launch Review View | `PASS` | launch-review-views/001-launch-review.md | READY_FOR_RELEASE_REVIEW with proceed=Yes. |

## Internal Routing

| Input | Ref |
|---|---|
| Release Adapter | release-adapters/001-release-adapter.md |
| Launch Review View | launch-review-views/001-launch-review.md |
| Release Execution | scripts/resolve-release-execution.mjs |

## Release Execution Bridge

```bash
node scripts/cli.mjs release-execution . --intent "prepare release execution" --mode PLAN_ONLY
```

## Boundaries

- This guide approves release: No
- This guide deploys or publishes by itself: No
- This guide asks for or stores secrets: No
- This guide treats free-form approval text as release approval: No
- This guide treats beginner confirmation as production approval: No
- This guide changes CI/CD, hooks, DNS, payment, permissions, app-store state, mini-program state, or production config: No
- This guide makes Codex the release owner: No

## Outcome

`READY_FOR_RELEASE_EXECUTION_PLAN`
