# Release Handoff Packs

Release Handoff Packs turn a selected platform recipe and structured approval into a bounded release handoff.

From 1.61 onward, a handoff pack is also the source of truth for release owner, approval, rollback, monitoring, smoke, and ownership boundaries. Release Execution can consume those facts, but it should not redefine them.

They are for the moment after IntentOS knows:

- what kind of project this is
- which platform release recipe fits
- what target the user wants
- whether there is structured release approval
- who owns release, rollback, monitoring, and smoke evidence

## What It Does

- selects or suggests a handoff pack
- separates Codex, human, and external-system responsibility
- lists local-safe steps Codex may help with
- lists release actions humans or external systems must run
- records required evidence and stop conditions
- bridges Release Guide into Release Execution and close-out

## What It Does Not Do

- approve release
- deploy production
- publish previews by itself
- upload to app stores or mini-program platforms
- submit review
- run provider API commands
- ask for secrets
- mutate DNS, payment, permissions, migrations, production config, CI/CD, or hooks

A handoff pack does not approve release and does not execute release commands. It only turns the release path into a clear handoff package.

## User Flow

```bash
node scripts/cli.mjs release-guide ../my-project --intent "help me launch"
```

For direct handoff inspection:

```bash
node scripts/cli.mjs release-handoff ../my-project --intent "help me launch"
node scripts/cli.mjs release-handoff-check ../my-project
node scripts/cli.mjs release-handoff-check ../my-project --require-structured-evidence
```

Strict mode requires `Machine-Readable Evidence` matching `schemas/artifacts/release-handoff-evidence.schema.json`.
It also fails when no Release Handoff Pack exists. The default non-strict check
may still skip an empty handoff directory before release work is in scope.

`READY_FOR_HANDOFF_REVIEW` means ready for handoff review, not release approval.

## Safety Rule

`Codex May Run` defaults to none. Codex may only run explicitly approved local read, local build, local test, packaging, evidence, and read-only smoke commands. Provider APIs, uploads, preview publication, remote mutation, production actions, and CI/CD triggers remain current-user-owned or external-system-owned.
