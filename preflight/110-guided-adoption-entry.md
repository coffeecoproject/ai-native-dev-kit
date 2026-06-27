# Preflight: Guided Adoption Entry

## Current State

- Current version before this phase: `1.0.0`.
- CLI exists with `init`, `update`, `next`, `check`, `doctor`, `new`, `migrate`, `fixtures`, and `self-check`.
- `workflow-next` already detects new, existing, governed, production-sensitive, dirty, and bootstrapped states.
- `doctor` runs `workflow-next` and core workflow checks, but it is not a user-facing adoption recommendation.

## Risk Review

Risk level: L2.

This change modifies workflow tooling, generated-project required assets, docs, examples, and release metadata.

## Allowed

- Add a read-only `start` command.
- Add a guided adoption recommendation template.
- Add a checker for saved adoption recommendation reports.
- Add first-hour docs and examples.
- Update manifest, version metadata, README, CI references, and self-check.

## Not Allowed

- Do not change business-code generation.
- Do not auto-apply project setup from `start`.
- Do not enable BL2 or industrial packs by default.
- Do not weaken dirty-worktree, governed-project, or production-sensitive protections.
- Do not introduce external GPT/API reviewer automation in this phase.

## Project State

This is dev-kit source maintenance.

## Evidence Needed

- Script syntax checks.
- CLI smoke for `start`.
- Checker smoke for example reports.
- Manifest check.
- Generated-project smoke proving target projects receive the new scripts and directory.
- Dev-kit self-check.

## Human Decisions

No new product-risk decision is needed beyond the approved 1.1.0 scope.
