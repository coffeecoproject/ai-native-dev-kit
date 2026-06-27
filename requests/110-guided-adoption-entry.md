# Request: Guided Adoption Entry

## Raw Request

Add a formal `1.1.0` Guided Adoption Entry so Codex can enter a new or existing project, inspect it, recommend the safe adoption path, and leave the human with only judgment decisions.

## User / Customer

Maintainers and project users who want to give Codex a repository path and say "configure this project yourself" without memorizing lower-level commands.

## Problem

The dev kit has strong scripts and safeguards, but first-time adoption still expects users to know whether to run `next`, `doctor`, `init`, `update`, `dry-run`, or `write-plan`. That creates unnecessary operational burden and can lead to the wrong command being used on governed or production-sensitive projects.

## Current Workflow

The user or Codex manually chooses between project inspection, doctor checks, init, update, adoption assessment, migration planning, and baseline setup.

## Desired Outcome

Add a single read-only entry command:

```bash
node scripts/cli.mjs start ../my-project
```

The command must classify the project, recommend the adoption path, list human decisions, list safe next actions, and state what AI must not do yet.

## Constraints

- `start` must be read-only by default.
- `start` must not apply init, update, baseline setup, industrial packs, or migration changes.
- Existing `workflow-next` remains the technical state detector.
- Existing `doctor` remains available for lower-level checks.
- Existing guarded-project protections remain in force.
- BL2 and industrial packs require explicit human confirmation.
- The upgrade must be a formal versioned capability, not a patch-only script.

## Priority

P0

## Suggested Task Level

L2

## Deadline

No external deadline.

## Notes

The goal is product usability: users choose and confirm, Codex inspects and recommends.
