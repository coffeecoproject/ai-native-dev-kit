# Approval Record: <title>

## Human Decision Summary

Approval status: `<DRAFT | PENDING_REVIEW | APPROVED | REVOKED | EXPIRED>`

Conclusion: `<what is approved or not approved>`

Can Codex apply now: No

What I need from you: `<approval details / missing scope / no action>`

## Approval Identity

| Field | Value |
|---|---|
| Approved by | `<human name or role>` |
| Approval owner type | HUMAN |
| Approval captured from | `<conversation / issue / PR / ticket>` |
| Approval captured at | `<YYYY-MM-DD HH:mm TZ>` |
| Recorded by | Codex |

## Approved Plan

| Field | Value |
|---|---|
| Unified Apply Plan | `<path>` |
| Controlled Apply Readiness Report | `<path or N/A>` |
| Plan hash | `sha256:<64 hex>` |
| Plan version/date | `<version or date>` |

## Approved Action IDs

| Action ID | Action type | Target paths | Approved? | Notes |
|---|---|---|---|---|
| `<A001>` | `<WORKFLOW_ASSET_UPDATE>` | `<exact paths>` | Yes / No | `<notes>` |

## Approval Scope

| Field | Value |
|---|---|
| Included target paths | `<exact paths>` |
| Excluded target paths | `<exact paths or N/A>` |
| Max change size | `<files or lines>` |
| Timebox | `<date or duration>` |
| Applies to future changes | No |

## Risk Acceptance

| Field | Value |
|---|---|
| Risk level | LOW_RISK / MEDIUM_REVIEW / HUMAN_ONLY / BLOCKED |
| High-risk action included | No |
| Human-only action included | No |
| Risk accepted by human | Yes / No |

## Expiry

| Field | Value |
|---|---|
| Approval expires at | `<YYYY-MM-DD HH:mm TZ>` |
| Re-approval required after expiry | Yes |

## Rollback Acknowledgement

| Field | Value |
|---|---|
| Rollback plan reviewed | Yes / No |
| Rollback owner | Human / Codex |
| Rollback evidence | `<path or command>` |

## Verification Acknowledgement

| Field | Value |
|---|---|
| Verification plan reviewed | Yes / No |
| Required post-apply verification | `<command or method>` |
| Evidence path | `<path>` |

## Human Approval Statement

`<Human approves explicit action IDs for exact scope only.>`

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
| Apply plan | `<path>` |
| Readiness report | `<path or N/A>` |
| Conversation / ticket | `<path or ref>` |

## Audit Notes

`<notes>`
