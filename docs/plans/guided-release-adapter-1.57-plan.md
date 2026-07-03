# 1.57.0 Guided Release Adapter Plan

## Goal

Make release preparation usable for a beginner user.

1.55 answers whether closed work can enter launch review.
1.56 turns launch review plus human approval into a bounded release execution plan.
1.57 discovers how this specific project should release and converts that into a beginner-readable adapter profile.

## User Outcome

A user should be able to say:

```text
This new project is ready to go online. Configure the release path.
```

Codex should:

- inspect the project release shape
- recommend the safest first release target
- explain missing release inputs in plain language
- create a Release Adapter Profile
- connect that profile to Release Execution
- keep production, secrets, stores, DNS, payment, migrations, and high-risk config human-owned unless a project SOP explicitly allows otherwise

## Scope

In scope:

- release discovery from project files
- beginner release card
- project release profile
- Codex execution boundary
- release execution bridge
- CLI entry and checker
- source example and bad fixtures

Out of scope:

- automatic production deployment
- CI/CD installation or mutation
- secret collection
- DNS/payment/app-store/mini-program setting changes
- production migration execution
- replacing project release SOPs or release owners

## Protocol Shape

```text
Project files
  -> Release Discovery
  -> Beginner Release Card
  -> Project Release Profile
  -> Release Execution Bridge
  -> Human approval / controlled execution
```

## Beginner Rule

The output must not ask users to understand deployment internals first. It should recommend one safe next choice and provide short alternatives.

## Execution Rule

Codex can prepare, verify, and plan. Codex can only run release commands after:

- a project release profile exists
- release target is explicit
- release owner is known
- command is low-risk or explicitly allowed by project SOP
- evidence path is defined

High-risk release actions remain human-owned or external-release-system-owned.

## Acceptance

- README / VERSION / package / manifest report `1.57.0`
- `release-adapter` and `release-adapter-check` are available through CLI
- generated profile contains beginner release card, discovery, boundary, and bridge
- source checker validates examples and rejects bad fixtures
- new projects are not mistaken for production-governed projects only because adapter records exist
- `npm run verify` passes
