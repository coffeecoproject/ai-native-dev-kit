---
schema_version: 1.0
artifact_type: preflight
number: 042
slug: docs-ia-migration-command
title: "docs ia migration command"
status: ready
created_at: 2026-06-27
intentos_version: 0.41.0
request: requests/042-docs-ia-migration-command.md
task_level: L3
---
# Preflight: 042-docs-ia-migration-command

## Source Request

`requests/042-docs-ia-migration-command.md`

## Clarity

READY

## Problem Summary

0.42.0 should reduce reading cost and replace the planned-only migrate facade with a safe,
non-mutating migration plan command.

## Missing Information

- No real 1.0 release exists yet, so migration is a plan toward the 1.0 target surface.
- No apply step is approved in this phase.

## Assumptions

- `migrate` may inspect a target project and write only the plan file requested by `--write-plan`.
- `migrate --dry-run` prints a plan preview without writing.
- Running `migrate` without `--dry-run` or `--write-plan` must fail.
- Existing init/update plan/apply safety remains separate.

## Direction Risks

- README becomes too slim and loses links to complete references.
- Migration command accidentally mutates target projects.
- Migration docs promise full 1.0 migration before 1.0 release evidence exists.

## Over-design Risks

- Building a full apply engine in this phase.
- Adding static analysis or language-specific code migration.
- Creating new workflow concepts instead of reorganizing existing usage paths.

## MVP Recommendation

Implement the full 0.42 roadmap slice: docs IA, safe migrate command, manifest/version/readme
updates, release evidence, and self-check coverage.

## Non-goals

- No direct project mutation from `migrate`.
- No license expansion or new license workflow.
- No new industrial packs or platform baselines.
- No source-code migration.

## Domain Model Draft

- Docs IA: README entry, operator manual, references, adoption playbooks, migration docs, FAQ,
  troubleshooting.
- Migration Plan: structured JSON describing source/target versions, project state, detected
  signals, recommended actions, blocked apply status, and human decisions.
- Migration Command: CLI command that only dry-runs or writes a plan file.

## Permission / Security Risks

- No runtime permission, secret, production config, deployment, or project code is changed.
- Migration is a risk word here, but this task only creates a plan-only migration command.

## First Vertical Slice

```text
user runs intentos migrate --target project --from 0.33.0 --to 1.0.0 --dry-run
-> command inspects project state
-> prints structured migration plan summary
-> writes nothing
```

## Suggested Specs

- `specs/042-docs-ia-migration-command.md`

## Suggested Task Level

L3

## Decision

READY_FOR_SPEC

## Rationale

The scope is bounded and has a hard safety rule: migration command cannot write to target projects.
