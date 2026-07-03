# 1.62.0 Release Record

## Human Summary

1.62.0 adds Native-First Existing Project Migration Planning. It lets Codex enter an existing project with an IntentOS-native planning path instead of stopping at adapter-only advice, while still keeping business rules, production controls, provider state, and target-file writes outside automatic authority.

## Theme

Native-First Existing Project Migration Planning.

1.62 changes the existing-project posture from "adapter-only as the practical end state" to "IntentOS-native planning first, apply only after reviewed plan and human approval".

It is for in-progress, legacy, governed, and production-maintained projects where Codex should use IntentOS as the planning and review workflow without overwriting project business or production authority.

## What Changed

- Added `core/native-first-existing-project-migration.md`.
- Added `docs/native-first-existing-project-migration.md`.
- Added `templates/native-migration-plan.md`.
- Added `checklists/native-migration-review.md`.
- Added `prompts/native-migration-agent.md`.
- Added `native-migration-plans/` as the recorded migration-plan artifact directory.
- Added `scripts/resolve-native-migration.mjs`.
- Added `scripts/check-native-migration.mjs`.
- Added CLI commands:
  - `native-migration`
  - `native-migration-check`
- Added built-in examples for light, governed, production-maintained, and dirty-worktree existing projects.
- Added bad fixtures for unsafe native migration plans.

## Operating Model

```text
Existing project detected
-> switch to IntentOS Native-First Migration Planning mode
-> inventory existing governance
-> classify old rules and authority
-> preserve business and production constraints
-> propose Native Migration Plan
-> route any approved governance edits through Unified Apply Plan
-> Controlled Apply Readiness
-> Approval Record
```

## Authority Boundary

1.62 allows IntentOS to become workflow planning authority for Codex behavior.

1.62 does not make IntentOS:

- business authority
- production authority
- release authority
- provider authority
- security, privacy, compliance, legal, tax, finance, HR, payment, permission, migration, data, or customer-record authority

## Allowed Claims

- IntentOS can propose a Native Migration Plan for existing projects.
- IntentOS can classify existing project rules as workflow rules, engineering baselines, business rules, or production controls.
- IntentOS can recommend an authority transition where IntentOS becomes the Codex workflow planning authority.
- IntentOS can preserve project-owned business and production authority while planning workflow adoption.
- IntentOS can route approved governance edits through Unified Apply Plan, Controlled Apply Readiness, and Approval Record.
- IntentOS can detect and reject unsafe migration plans in recorded native-migration artifacts.

## Forbidden Claims

1.62 does not:

- approve implementation
- approve release or production
- write target-project files
- directly overwrite `AGENTS.md`
- directly edit CI, hooks, release SOPs, production config, provider state, migrations, secrets, payment, permissions, or data
- remove business rules
- remove production controls
- treat Codex, subagents, or GPT review as human approval
- keep old workflow and IntentOS as equal competing authorities after migration
- claim the project is fully migrated without reviewed evidence

## Evidence Status

- `docs/plans/native-first-existing-project-migration-1.62-plan.md` records the execution and acceptance plan.
- `core/native-first-existing-project-migration.md` defines the Native-First Existing Project Migration protocol.
- `docs/native-first-existing-project-migration.md` explains how an existing project moves from adapter assessment to native planning.
- `templates/native-migration-plan.md` defines the reviewable migration-plan artifact.
- `scripts/resolve-native-migration.mjs` generates a safe read-only plan and JSON posture.
- `scripts/check-native-migration.mjs` validates source assets, positive examples, and bad fixtures.
- `examples/1.62-native-first-existing-project/*` demonstrate light, governed, production-maintained, and dirty-worktree existing project paths.
- `test-fixtures/bad/bad-native-migration-*` prove unsafe migration plans are rejected.
- `releases/1.62.0/self-check-report.md` records verification commands and final result.

## Known Limitations

- 1.62 plans workflow migration; it does not apply target-project edits by itself.
- Native Migration Plan records are not business approval, release approval, production approval, or compliance approval.
- The checker validates recorded migration plans and examples; it does not inspect live production systems.
- Real existing projects still require human review before AGENTS, CI, hooks, production, release, provider, migration, payment, permission, or data-control changes.
- Project-specific business rules remain owned by the project and must be preserved or explicitly escalated.

## Acceptance

The release is accepted only if:

- syntax checks pass for the new resolver and checker
- `native-migration` prints a safe, read-only Native Migration Plan
- `native-migration --json` reports posture and authority fields
- `check-native-migration` passes source repo and all positive examples
- `check-native-migration` rejects all unsafe bad fixtures
- manifest, workflow version assets, README, package, and VERSION metadata are synchronized
- `npm run verify` passes

## Verification

See `releases/1.62.0/self-check-report.md`.
