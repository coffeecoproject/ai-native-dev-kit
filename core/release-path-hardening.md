# Release Path Hardening

Release Path Hardening keeps the release chain from growing into multiple competing truth sources.

## Main Rule

```text
One release handoff package owns release handoff facts.
```

Release Handoff Pack is the source for:

- selected platform recipe
- structured release approval
- release owner
- rollback evidence
- monitoring evidence
- post-release smoke evidence
- Codex / human / external-system ownership boundary

Release Execution can consume these facts, but must not redefine them.

## Release Chain

```text
Release Guide
  -> Platform Release Recipe
  -> Release Handoff Pack
  -> Release Execution Plan
  -> Human / External Release System
  -> Evidence / Close-out
```

## Lazy Handoff Rule

Release Guide should not produce a blocked handoff pack just because the user asked about release.

It should defer handoff when any prerequisite is missing:

- release adapter path
- confirmed or strict platform recipe
- launch review
- structured approval
- release owner
- rollback evidence
- monitoring evidence
- post-release smoke evidence

## Structured Evidence Rule

Markdown handoff records stay compatible by default.

Strict release handoff review uses Machine-Readable Evidence and `release-handoff-evidence.schema.json`.

## Boundary

Release Path Hardening does not approve release, execute release commands, deploy, publish, upload, submit review, run migrations, call provider APIs, ask for secrets, or mutate production state.
