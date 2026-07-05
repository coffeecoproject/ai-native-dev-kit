# Unified Closure Model 1.53 Plan

## Goal

1.53 reduces close-out fragmentation.

The goal is not to add another approval layer. The goal is to make one final closure decision object that consumes existing close-out inputs.

## Problem

The current system has several valid close-out artifacts:

- Change Impact Coverage
- Execution Closure
- Guided Closure
- Evidence Precision

Without a single final source, one artifact can appear to say "done" while another says evidence or surface coverage is missing.

## Non-Goals

- Do not remove existing 1.49-1.52 artifacts.
- Do not migrate historical records.
- Do not authorize apply, commit, push, release, production, CI, hooks, or high-risk decisions.
- Do not make users run lower-level evidence commands.

## Design

Add:

- `core/unified-closure-model.md`
- `docs/unified-closure-model.md`
- `templates/closure-decision.md`
- `checklists/closure-decision-review.md`
- `prompts/closure-decision-agent.md`
- `closure-decisions/.gitkeep`
- `scripts/resolve-closure-decision.mjs`
- `scripts/check-closure-decision.mjs`
- `examples/1.53-unified-closure-model/`
- bad fixtures for split-truth and done-without-evidence

Update:

- CLI `finish` uses the Unified Closure Decision resolver.
- CLI `finish-check` checks Unified Closure Decisions.
- README and reference docs explain `finish` as the user close-out entry.
- Manifest and verification include the 1.53 assets.

## Acceptance

- `node scripts/cli.mjs finish . --intent "maintain close-out model" --verification "npm run verify passed"` prints a Unified Closure Decision.
- `node scripts/check-closure-decision.mjs examples/1.53-unified-closure-model` passes.
- Bad fixtures fail for split closure truth and DONE without evidence.
- `node scripts/check-intentos.mjs` passes.
- `npm run verify` passes.
