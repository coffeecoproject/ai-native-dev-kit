# Approval Record Review Checklist

Use this checklist before treating any approval record as valid evidence.

## Required

- Approval status is explicit.
- Approved records identify `CURRENT_CONVERSATION_USER` or another specific
  human confirmer and link to an explicit request or consent statement.
- Approval owner type is `HUMAN`.
- One Unified Apply Plan is referenced.
- Plan hash is present.
- Approved action IDs are explicit.
- Target paths are exact, relative, and bounded.
- Expiry is present and not open-ended.
- Approval is not expired.
- Plan did not change after approval.
- The generated approval statement and exact action table match the current
  user's request; the user was not required to inspect technical identifiers.
- Rollback acknowledgement is present.
- Verification acknowledgement is present.
- Non-authorizations all say `No`.

## Reject

- Approver is Codex, AI, reviewer, subagent, automation, or system.
- Approver is ambiguous, such as `someone`, `owner`, `human`, `team`, or `unknown`.
- Approval says `all actions`, `everything`, `entire repo`, `all files`, or equivalent.
- Approval grants future changes.
- Approval authorizes automatic apply.
- Approval approves release or production.
- Approval installs hooks or changes CI.
- Approval enables high-risk action classes.
- Approval uses vague scope instead of explicit action IDs and paths.
- Approval uses wildcard, parent traversal, absolute, backslash, or symlink target paths.
- Approval statement names different action IDs than the action table.
- Approval is expired or records that the plan changed after approval.

## Human Handoff

If approval is incomplete, Codex first narrows the technical plan itself. It
asks the user only for a missing business fact or consent to a concrete
real-world effect, then records the resulting statement internally.
