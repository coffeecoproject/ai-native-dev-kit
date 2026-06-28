# Environment Facts Baseline

## Scope

Use this baseline to record runtime, package manager, build, test, CI, deployment, and environment variable facts without storing secret values.

## Expectations

- Record local runtime and package manager facts as confirmed or pending.
- Record build, test, lint, and typecheck commands when known.
- Record environment variable names and purpose, not values.
- Mark deployment, CI, and production facts as pending unless proven by project files or human confirmation.

## BL0 Behavior

For BL0, keep environment facts minimal and pending when unknown. Do not require full environment governance unless project scope needs it.

## Boundary

This baseline does not create or edit .env files, store secrets, invent deployment facts, change CI / CD config, approve release readiness, or authorize target-project writes.
