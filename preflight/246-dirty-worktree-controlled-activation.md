---
schema_version: 1.0
artifact_type: preflight
number: 246
slug: dirty-worktree-controlled-activation
title: "dirty worktree controlled activation"
status: ready
created_at: 2026-08-01
intentos_version: 1.113.0
request: requests/246-dirty-worktree-controlled-activation.md
task_level: L2
---
# Preflight: 246-dirty-worktree-controlled-activation

## Source Request

`requests/246-dirty-worktree-controlled-activation.md`

## Clarity

READY

## Problem Summary

受控更新激活门没有区分“未审查 dirty 项目”与“计划已精确绑定且零重叠的
dirty 项目”，从而拒绝 `workflow-next` 的预期 `REVIEW_DIRTY_WORKTREE`
状态并回滚安全更新。

## Missing Information

- None; failure receipt, exact plan, source implementation, and rollback evidence are available.

## Assumptions

- Pawcode remains dirty throughout activation and must stay dirty after success.
- The exact plan fingerprint is the only admissible source for pre-existing dirty paths.
- Existing behavioral cold-start and route verification remain mandatory.

## Direction Risks

- Broadly accepting `REVIEW_DIRTY_WORKTREE` would allow an unbound dirty target to count as active.
- Ambiguous or malformed Git status rows must fail closed.

## Over-design Risks

- Do not redesign workflow-next states or controlled apply receipts.
- Do not add a second dirty-worktree authority record.

## MVP Recommendation

Extend the existing `isWorkflowActivationState(state, plan)` predicate with one
strict controlled-update branch that independently proves a complete dirty
fingerprint and no path overlap with executable plan writes.

## Non-goals

- No Pawcode apply inside Task 246.
- No authority, schema, dependency, CI, release, or business-code changes.
- No acceptance of other non-ready next actions.

## Domain Model Draft

- No product data model change; only an internal activation predicate.

## Permission / Security Risks

- This is internal project-local execution trust, not an end-user permission model.
- Missing, inconsistent, overlapping, or unparsable evidence must return false.

## First Vertical Slice

```text
exact controlled plan -> installed workflow-next returns REVIEW_DIRTY_WORKTREE ->
predicate verifies CONTROLLED_UPDATE + complete dirty fingerprint + zero overlap ->
existing cold-start and Work Queue / Task Governance routes remain mandatory
```

## Suggested Specs

- `specs/246-dirty-worktree-controlled-activation.md`

## Suggested Task Level

L2

## Decision

READY_FOR_SPEC

## Rationale

The failed receipt proves rollback and isolates one deterministic source defect.
The repair is bounded, reversible, testable, and requires no user technical choice.
