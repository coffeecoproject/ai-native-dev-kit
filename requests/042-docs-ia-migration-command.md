---
schema_version: 1.0
artifact_type: request
number: 042
slug: docs-ia-migration-command
title: "docs ia migration command"
status: ready
created_at: 2026-06-27
devkit_version: 0.41.0
priority: P1
task_level: L3
---
# Request: 042-docs-ia-migration-command

## Raw Request

Execute Productization Hardcut phase `0.42.0`: Docs IA + Migration Command. License should not be
the focus of this phase. The main goal is to make the kit easier to enter and add a safe migration
front door that cannot directly mutate target projects.

## User / Customer

Dev kit users, Codex operators, and maintainers who need a shorter first-read README, complete
reference docs, adoption playbooks, and a safe migration command.

## Problem

The repository has strong workflow assets, but the README has become too long for first-time usage.
The CLI also still treats `migrate` as planned-only. Users need a clear entry path and a migration
command that can inspect and produce a plan without writing project files.

## Current Workflow

Users read a long README, jump between multiple docs, and cannot use `ai-native migrate` except to
learn that it is not implemented yet.

## Desired Outcome

- README becomes a 3-minute entry.
- Full detail moves into operator manual, references, playbooks, migration docs, FAQ, and
  troubleshooting.
- `ai-native migrate` supports `--dry-run` and `--write-plan`.
- Migration command refuses to mutate target projects directly.

## Constraints

- Do not make license strictness the focus.
- Do not implement direct migration writes.
- Do not change target projects unless a later reviewed plan/apply path is explicitly added.
- Keep migration command deterministic and non-destructive.
- Preserve existing init/update safety behavior.

## Priority

P1

## Suggested Task Level

L3

## Deadline

No fixed deadline. This is the next roadmap phase after 0.41.0.

## Notes

This phase is productization, not a new workflow concept.
