---
schema_version: 1.0
artifact_type: eval
number: "040"
slug: checker-library-refactor
title: Checker Library Refactor
status: ready
created_at: "2026-06-27"
intentos_version: 0.40.1
spec: specs/040-checker-library-refactor.md
---
# Eval: Checker Library Refactor

## Related Spec

`specs/040-checker-library-refactor.md`

## Must Pass

- [ ] JavaScript syntax check passes for all scripts.
- [ ] Fixture matrix passes.
- [ ] Manifest check passes.
- [ ] Dev-kit self-check passes.
- [ ] No unrelated files changed.
- [ ] No unapproved dependency added.

## Spec Alignment

- [ ] Implementation matches acceptance criteria.
- [ ] Implementation respects non-goals.
- [ ] Shared helper interfaces match the spec.
- [ ] CLI output remains stable unless a reviewed fixture expectation documents the drift.
- [ ] Phase evidence records commands and review outcome.

## Permission / Data Checks

- [ ] No permission checks are changed.
- [ ] No project data is read beyond existing checker behavior.
- [ ] No secret, token, or credential handling is added.
- [ ] Git helper behavior is read-only.

## Manual Review Checklist

- Confirm shared libraries stay small and dependency-free.
- Confirm scripts with special behavior were not forced into generic helpers.
- Confirm all subagent roles are closed or skipped before commit.
- Confirm package version, manifest version, VERSION.md, README notes, and release evidence agree on `0.40.1`.

## Reject Conditions

Reject if:

- checker pass/fail semantics change without explicit fixture and review evidence
- CLI output becomes harder to diagnose
- a shared helper hides script-specific behavior
- generated project snapshots are committed
- new dependencies are added
- task violates the non-goals

## Required Evidence

Command output summary: syntax check, fixture matrix, manifest check, workflow artifact check, review loop check, next-step boundary check, output quality score, and full intentos self-check.

Screenshots / traces if UI: not applicable because no UI is changed.

Review notes: record behavior-drift review and any auto-fix rounds in `review-loop-reports/040-checker-library-refactor.md`.
