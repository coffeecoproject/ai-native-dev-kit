# Guided Release Adapter

Guided Release Adapter is the project-specific bridge between launch readiness and release execution.

It does not deploy. It does not approve release. It does not install CI/CD. It makes the release path understandable and bounded.

It does not ask for or store secrets.

It does not treat beginner confirmation as production approval.

## Inputs

- project files and scripts
- platform signals
- deployment provider hints
- Launch Review View
- Release Execution Protocol
- human release owner and project SOP, when available

## Outputs

- Beginner Release Card
- Project Release Profile
- Codex Execution Boundary
- Missing Inputs
- Release Execution Bridge

## Beginner Release Card

The card must recommend one safe next choice first. Usually this is preview, test, staging, internal handoff, or app-review preparation before production.

The user should only need to choose between plain options such as:

- preview/test environment
- staging/pre-production
- production release review
- app-store or mini-program review preparation
- pause until platform/account details are known

## Project Release Profile

The profile records:

- project type and platform
- release target
- build/test commands found
- deployment provider or missing provider
- environment source
- rollback source
- monitoring source
- post-launch smoke source
- allowed Codex actions
- human-only actions
- evidence paths

## Codex Execution Boundary

Codex may prepare plans, run local discovery, and run local checks when allowed.

Codex must not:

- approve release or production
- deploy by itself
- ask for or store secrets
- change CI/CD, hooks, DNS, payment, permissions, app-store, mini-program, or production config
- run migrations unless a project SOP explicitly assigns that action
- treat beginner confirmation as production approval
- become the release owner

## Relationship To 1.55 And 1.56

1.55 produces Launch Review View.
1.56 produces Release Execution Plan.
1.57 prepares the project-specific release adapter that makes 1.56 executable in a specific project.

The adapter is not a new source of release truth. It is a translation and routing layer.
