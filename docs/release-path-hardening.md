# Release Path Hardening

1.61 tightens the release path without adding another command for normal users.

The plain path remains:

```bash
node scripts/cli.mjs release-guide ../my-project --intent "帮我上线"
```

## What Changed

Release Guide now treats Release Handoff Pack as a later step.

If important inputs are missing, it says:

```text
Release Handoff Pack: DEFERRED
```

That means:

```text
Codex should not prepare a handoff package yet.
```

## Handoff vs Execution

| Layer | Meaning |
|---|---|
| Release Handoff Pack | The source of release owner, approval, rollback, monitoring, smoke, and responsibility facts. |
| Release Execution Plan | A plan-only consumer of the handoff package. It does not create a second release truth. |

## Structured Evidence

Strict handoff packs can include:

```text
Machine-Readable Evidence
```

This records rollback, monitoring, post-release smoke, release owner, structured approval, and the handoff/execution boundary in JSON.

## Important Meaning

`READY_FOR_HANDOFF_REVIEW` means:

```text
Ready for handoff review, not release approval.
```

It does not mean Codex can publish, deploy, submit, migrate, upload, or run provider commands.
