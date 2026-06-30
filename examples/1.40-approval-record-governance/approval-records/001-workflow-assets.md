# Approval Record: workflow assets

## Human Decision Summary

Approval status: `APPROVED`

Conclusion: `Approve A001 and A002 for the exact listed workflow files only.`

Can Codex apply now: No

What I need from you: `No additional approval is recorded by this file. Future apply still needs the controlled apply path.`

## Approval Identity

| Field | Value |
|---|---|
| Approved by | Project owner |
| Approval owner type | HUMAN |
| Approval captured from | conversation |
| Approval captured at | 2026-06-30 10:00 +0800 |
| Recorded by | Codex |

## Approved Plan

| Field | Value |
|---|---|
| Unified Apply Plan | `apply-plans/001-workflow-assets.md` |
| Controlled Apply Readiness Report | `apply-readiness-reports/001-workflow-assets.md` |
| Plan hash | `sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa` |
| Plan version/date | 2026-06-30 |
| Plan changed after approval | No |

## Approved Action IDs

| Action ID | Action type | Target paths | Approved? | Notes |
|---|---|---|---|---|
| A001 | WORKFLOW_ASSET_UPDATE | `.ai-native/version.json` | Yes | Update workflow asset version evidence |
| A002 | WORKFLOW_ASSET_UPDATE | `scripts/check-ai-workflow.mjs` | Yes | Keep workflow checker aligned |

## Approval Scope

| Field | Value |
|---|---|
| Included target paths | `.ai-native/version.json`, `scripts/check-ai-workflow.mjs` |
| Excluded target paths | business source files, production config, CI, hooks |
| Max change size | 2 files |
| Timebox | 2026-06-30 only |
| Applies to future changes | No |

## Risk Acceptance

| Field | Value |
|---|---|
| Risk level | LOW_RISK |
| High-risk action included | No |
| Human-only action included | No |
| Risk accepted by human | Yes |

## Expiry

| Field | Value |
|---|---|
| Approval expires at | 2099-12-31 23:59 +0800 |
| Re-approval required after expiry | Yes |

## Rollback Acknowledgement

| Field | Value |
|---|---|
| Rollback plan reviewed | Yes |
| Rollback owner | Human |
| Rollback evidence | `apply-plans/001-workflow-assets.md` |

## Verification Acknowledgement

| Field | Value |
|---|---|
| Verification plan reviewed | Yes |
| Required post-apply verification | `node scripts/check-ai-workflow.mjs . --mode core` |
| Evidence path | `apply-readiness-reports/001-workflow-assets.md` |

## Human Approval Statement

Project owner approves A001 and A002 for `.ai-native/version.json` and `scripts/check-ai-workflow.mjs` only.

## Non-Authorizations

- This approval record writes files now: No
- This approval record authorizes automatic apply: No
- This approval record approves implementation: No
- This approval record approves release or production: No
- This approval record installs hooks or changes CI: No
- This approval record changes source of truth: No
- This approval record enables high-risk actions: No
- This approval record lets Codex proceed without readiness: No

## Evidence Links

| Evidence | Path |
|---|---|
| Apply plan | `apply-plans/001-workflow-assets.md` |
| Readiness report | `apply-readiness-reports/001-workflow-assets.md` |
| Conversation / ticket | `conversation:2026-06-30-workflow-assets` |

## Audit Notes

This example is repository evidence only. It is not real target-project approval.
