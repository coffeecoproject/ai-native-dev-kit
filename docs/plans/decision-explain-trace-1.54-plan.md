# Decision Explain Trace 1.54 Plan

## Goal

1.54 makes Unified Closure Decisions explainable.

The goal is not to add another closure checker or user command. The goal is to make `finish` explain why one final decision was selected.

## Problem

1.53 creates one final close-out truth, but a single final answer can hide why it was selected.

Users need to see:

- which input decided the result
- which inputs passed
- which inputs were missing or failed
- whether inputs disagreed
- why the stricter result won

## Non-Goals

- Do not add a new user command.
- Do not create a second final closure source.
- Do not change the Unified Closure Decision enum.
- Do not approve implementation, apply, commit, push, release, production, CI, hooks, or high-risk decisions.
- Do not replace lower-level evidence checks.

## Design

Extend current Closure Decision records with:

- `Decision Trace`
- `Dominant Reason`
- `Conflict Summary`

Update:

- `scripts/resolve-closure-decision.mjs`
- `scripts/check-closure-decision.mjs`
- `templates/closure-decision.md`
- closure decision prompt/checklist
- docs and examples
- manifest and version metadata

## Acceptance

- `finish` prints Decision Trace, Dominant Reason, and Conflict Summary.
- JSON output contains `decisionTrace`, `dominantReason`, and `conflictSummary`.
- Good examples pass `check-closure-decision`.
- Bad fixtures fail when a decision lacks explain trace.
- `node scripts/check-intentos.mjs` passes.
- `npm run verify` passes.
