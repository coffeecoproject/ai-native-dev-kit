# Approval Record Review Checklist

Use this checklist before treating any approval record as valid evidence.

## Required

- Approval status is explicit.
- Approved records identify a human approver.
- Approval owner type is `HUMAN`.
- One Unified Apply Plan is referenced.
- Plan hash is present.
- Approved action IDs are explicit.
- Target paths are exact and bounded.
- Expiry is present and not open-ended.
- Rollback acknowledgement is present.
- Verification acknowledgement is present.
- Non-authorizations all say `No`.

## Reject

- Approver is Codex, AI, reviewer, subagent, automation, or system.
- Approval says `all actions`, `everything`, `entire repo`, `all files`, or equivalent.
- Approval grants future changes.
- Approval authorizes automatic apply.
- Approval approves release or production.
- Approval installs hooks or changes CI.
- Approval enables high-risk action classes.
- Approval uses vague scope instead of explicit action IDs and paths.

## Human Handoff

If approval is incomplete, Codex should ask for the missing human decision in plain language and stop.
