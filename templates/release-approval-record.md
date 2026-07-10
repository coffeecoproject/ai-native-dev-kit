# Release Approval Record: <id>

## Human Summary

| Field | Value |
|---|---|
| Approval Status | `PENDING` |
| Release Target | `<target>` |
| Release Candidate | `artifact:<project-relative-path>` |
| Approved By | `<human owner>` |
| Expires At | `<ISO-8601 timestamp>` |

## Approval Scope

State what the human is approving, which low-risk Codex actions are allowed,
and which human or external release system owns the actual release action.

## Machine-Readable Evidence

Use `schemas/artifacts/release-approval-record.schema.json`. Codex must compute
the project identity and all file digests from current project evidence. Do not
paste secret values into this record.

## Boundaries

- This record makes Codex the release owner: No
- This record authorizes automatic production deploy: No
- This record authorizes store or mini-program submission by Codex: No
- This record authorizes migrations, secrets, DNS, payment, permissions, or production config changes by Codex: No
- This record proves product correctness or production safety: No

## Outcome

`RELEASE_APPROVAL_PENDING`
