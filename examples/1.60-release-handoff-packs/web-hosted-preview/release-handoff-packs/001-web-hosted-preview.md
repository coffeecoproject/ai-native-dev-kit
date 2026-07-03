# Release Handoff Pack

## Human Summary
| Field | Value |
| --- | --- |
| Pack ID | `web-hosted-preview` |
| Recipe ID | `web-hosted-preview` |
| Release Target | `preview` |
| Execution Level | `PREVIEW_ASSIST` |
| Release Owner | HUMAN_REQUIRED: release owner |
| Handoff State | `READY_FOR_HANDOFF_REVIEW` |
| Safe Next Step | Review the handoff pack with the release owner; high-risk actions remain human/external-system-owned. |

## Selected Recipe

| field | value |
| --- | --- |
| Recipe ID | `web-hosted-preview` |
| Recipe Status | `STRICT` |
| Platform Family | `web-hosted-preview` |
| Selection Confidence | `HIGH` |
| Safe First Target | `preview` |
| Recipe Ref | generated:resolve-platform-release-recipe |
| Notes | Explicit recipe requested: web-hosted-preview. |

## Required Approval

| field | value |
| --- | --- |
| Approval Type | `RELEASE_APPROVAL` |
| Approval Status | `APPROVED` |
| Release Target | preview |
| Approved Scope | preview handoff only |
| Approved By | HUMAN_REQUIRED: release owner |
| Approval Time | 2026-07-03T00:00:00Z |
| Allowed Codex Actions | LOCAL_BUILD npm run build |
| Blocked Actions | production deploy, provider API, secrets, DNS, payment |
| Evidence Path | release-handoff-packs/001-web-hosted-preview.md |
| Expiry / Reconfirm By | 2026-07-10T00:00:00Z |

## Required Inputs

| input | minimumQuality |
| --- | --- |
| Release owner | HUMAN_REQUIRED: release owner |
| Release SOP | docs/release-sop.md |
| Rollback | docs/rollback.md owned by release owner |
| Monitoring | docs/monitoring.md owned by release owner |

## Preflight Steps

| step | owner | riskClass |
| --- | --- | --- |
| Inspect local package scripts and release docs | CODEX_MAY_RUN_AFTER_APPROVAL | LOCAL_READ_ONLY |
| Run local build/test only when approved | CODEX_MAY_RUN_AFTER_APPROVAL | LOCAL_BUILD_OR_TEST |
| Prepare preview publish instructions | CODEX_MAY_PREPARE | PREVIEW_PREPARE |

## Codex May Run

| action | riskClass | condition |
| --- | --- | --- |
| LOCAL_BUILD npm run build | LOCAL_BUILD | Allowed only within structured approval, recipe policy, and stop conditions. |

## Human Must Run

| action | owner |
| --- | --- |
| Approve preview publication and release risk | HUMAN_REQUIRED |
| Run provider preview publish if it mutates remote state | HUMAN_REQUIRED |

## External System Must Run

| action | owner |
| --- | --- |
| Preview publication or hosted-provider deployment | EXTERNAL_RELEASE_SYSTEM |

## Stop Conditions

| condition | response |
| --- | --- |
| Missing structured release approval | Stop for human decision. |
| Secret required | Stop for human or external system. |
| Remote-state mutation implied | Stop for human or external system. |
| Action outside pack execution level | Stop; this pack is PREVIEW_ASSIST. |

## Evidence To Capture

| evidence | status | ref | minimumQuality |
| --- | --- | --- | --- |
| Structured release approval | PASS | release-handoff-packs/001-web-hosted-preview.md | Approval type, target, scope, owner, allowed actions, blocked actions, evidence, and expiry. |
| Release SOP | PASS | docs/release-sop.md | Project release procedure or owner-owned path. |
| Environment | PASS | preview environment reference | Target environment and non-secret setup reference. |
| Verification output | PASS | release-handoff-packs/001-web-hosted-preview.md | Command, timestamp, result, and path. |

## Rollback Evidence

| evidence | status | ref | minimumQuality |
| --- | --- | --- | --- |
| Rollback path | PASS | docs/rollback.md owned by release owner | Path, owner, and restoration condition. |

## Monitoring Evidence

| evidence | status | ref | minimumQuality |
| --- | --- | --- | --- |
| Monitoring path | PASS | docs/monitoring.md owned by release owner | Dashboard/log/check path and owner. |

## Post-release Smoke

| evidence | status | ref | minimumQuality |
| --- | --- | --- | --- |
| Post-release smoke | PASS | preview smoke checklist owned by release owner | Target level, owner, read-only checks, and result path. |

## Post-release Close-out

| item | requirement |
| --- | --- |
| Actual executor | Record human or external release system that ran the release action. |
| Result | Record pass/fail, timestamp, target, and evidence path. |
| Rollback status | Record whether rollback is still available and who owns it. |
| Monitoring status | Record observation path and owner. |
| Unresolved decisions | Record remaining human decisions or N/A reason. |
| Pack limit | This pack remains PREVIEW_ASSIST; it is not release approval. |

## Release Guide Bridge

```bash
node scripts/cli.mjs release-guide . --intent "help me launch web preview" --recipe-id web-hosted-preview --release-target preview
```

## Release Execution Bridge

```bash
node scripts/cli.mjs release-execution . --intent "prepare release execution" --mode PLAN_ONLY --release-target preview
```

## Known Limits

| limit |
| --- |
| Provider-specific deploy commands are not executed by this pack. |

## Boundaries

- This pack approves release: No
- This pack deploys, publishes, uploads, submits, migrates, or releases by itself: No
- This pack asks for or stores secrets: No
- This pack changes CI/CD, hooks, DNS, payment, permissions, app-store state, mini-program state, production data, or production config: No
- This pack makes Codex the release owner: No
- This pack treats structured approval as blanket authorization: No

## Outcome

`READY_FOR_HANDOFF_REVIEW`
