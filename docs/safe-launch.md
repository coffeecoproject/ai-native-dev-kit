# Safe Launch

Safe Launch helps answer:

```text
Can we show it, hand it off, send it to release review, or should we stop?
```

It is used after a task is built and verified.

## Plain Meaning

Safe Launch is not a launch button. It is a readiness label.

| Label | Plain meaning |
|---|---|
| `NOT_READY` | Do not use yet |
| `READY_FOR_DEMO` | Can show in a controlled demo |
| `READY_FOR_INTERNAL_HANDOFF` | Can hand to an internal teammate |
| `READY_FOR_RELEASE_REVIEW` | Ready for someone to review for release |
| `BLOCKED` | Stop until a decision or missing evidence is handled |

## When To Use

Use it when:

- a task is finished
- the user asks whether it can be used
- work touches release, deployment, permissions, payment, privacy, security, data migration, or customer-facing promises
- a project is BL2 or industrial-grade

For tiny local-only tasks, a short readiness note is enough.

## What The User Decides

The user still decides:

- whether to launch
- whether to accept risk
- whether to change customer promises
- whether to proceed with production operations
- whether pending decisions are acceptable

Codex prepares the evidence and recommendation.

## Command

Run:

```bash
node scripts/check-launch-readiness.mjs .
```

Or through the CLI:

```bash
node scripts/cli.mjs launch-readiness .
```

The checker allows empty projects to pass when no Launch Readiness Report exists. It becomes strict once reports are present.
