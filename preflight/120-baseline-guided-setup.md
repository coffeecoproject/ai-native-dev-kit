# Preflight 120: Baseline Guided Setup

## Classification

Dev-kit maintenance.

## Risk

Medium. This updates generated project assets, CLI entry, checkers, docs, templates, examples, and manifest.

## Human Decisions

- 1.2 scope is bounded to baseline guided setup and provable task refs.
- Environment governance is first-class but not full industrialized production automation.
- BL2 remains opt-in.

## Safe Scope

Allowed:

- add scripts, templates, docs, examples, fixtures, release evidence
- update generated-project manifest and checks
- update CLI and README

Not allowed:

- claim real production validation
- require strict environment baseline for every BL0 project
- auto-edit CI/deploy/secrets/production config in target projects
