# Safe Launch / Delivery Readiness

Safe Launch is the final delivery classification after implementation, verification, and review.

It answers one question:

```text
What can this work safely be used for right now?
```

## Core Rule

Codex may recommend readiness.

Humans approve release, production launch, legal/compliance acceptance, payment changes, privacy changes, migration, irreversible operations, and customer promises.

## Required Inputs

Before a Launch Readiness Report can mark work ready, it must reference available evidence:

- task or change scope
- baseline level
- verification results
- review loop status, when required
- human decisions
- known limitations
- rollback or recovery notes, when applicable

## Readiness States

| State | Use When |
|---|---|
| `NOT_READY` | Work is incomplete or evidence is insufficient |
| `READY_FOR_DEMO` | Work can be shown in a controlled demo or local/staging environment |
| `READY_FOR_INTERNAL_HANDOFF` | Work can be handed to an internal teammate with known limitations |
| `READY_FOR_RELEASE_REVIEW` | Work is ready for a separate release approval process |
| `BLOCKED` | A human decision, missing evidence, or unresolved risk blocks delivery |

## Baseline Fit

| Baseline | Launch Boundary |
|---|---|
| `BL0` | Demo, prototype, or local-only evidence |
| `BL1` | Internal handoff or controlled staging evidence |
| `BL2` | Release review candidate with stronger verification and review evidence |

BL0 must not be described as production-ready.

## Human Decision Stops

Stop and ask for a decision when the report includes:

- pending risk acceptance
- production deployment
- permissions or data exposure change
- payment, tax, privacy, security, or compliance concern
- data migration or destructive operation
- external customer promise
- missing verification for a ready state

## Evidence Boundary

A Launch Readiness Report is evidence routing. It is not:

- production approval
- security certification
- legal sign-off
- compliance sign-off
- customer acceptance
- replacement for a release manager

## Minimal Use

For small tasks, the report may be short:

```text
State: READY_FOR_DEMO
Evidence: lint and local smoke passed
Limit: not production-reviewed
Human decision: no production launch requested
```

For BL2 or release-sensitive work, the report must be explicit and reviewed.
