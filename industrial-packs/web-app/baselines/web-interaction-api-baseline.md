# Web Interaction And API Behavior Baseline

## Purpose

Define minimum evidence for Web forms, user actions, API failures, and recovery behavior in BL2 Web projects.

This baseline is framework-neutral. It applies whether the project uses server rendering, client rendering, or a hybrid model.

## Required Evidence

- user actions with side effects have success, failure, and retry or recovery behavior defined
- forms have validation, submission, duplicate-submit prevention, and error display behavior defined
- destructive or irreversible actions have confirmation, cancellation, and failure handling evidence
- API timeout, network failure, unauthorized, forbidden, validation error, and server error paths are verified where relevant
- data refresh, stale state, optimistic update, or cache behavior is documented when it affects user decisions
- browser refresh, back/forward navigation, deep link, or route transition behavior is checked for critical flows
- skipped interaction or API failure checks have a reason and residual risk owner

## Stop Conditions

Stop before implementation or release when:

- a side-effecting action has no failure or duplicate-submit behavior
- a form can submit invalid, partial, or stale data without a defined response
- an API failure path changes user-visible behavior without evidence
- authorization, forbidden, or validation failures are treated only as generic errors
- route transition or refresh behavior can lose user work and has no mitigation

## Evidence Locations

Use project-specific files such as:

- `docs/baseline-evidence.md`
- `evals/`
- `tasks/`
- `releases/`
- interaction test output, browser notes, screenshots, traces, or manual verification records referenced from evidence records
