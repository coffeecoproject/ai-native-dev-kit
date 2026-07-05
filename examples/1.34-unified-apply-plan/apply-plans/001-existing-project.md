# Unified Apply Plan: existing governed project adoption

## Human Decision Summary

One-sentence conclusion: The project should use a docs-only bridge plan before any workflow asset update.

Recommended choice: B - Review and narrow apply scope

Can Codex write now: No

Need from human: Confirm whether the bridge docs are allowed and whether AGENTS / PR template migration should stay deferred.

If nothing is approved: No project files are written, no hooks or CI are changed, and no apply action is approved.

## Apply Readiness

| Field | Value |
|---|---|
| State | `NEEDS_HUMAN_APPROVAL` |
| Can apply now? | No |
| Can AI write now? | No |
| Why | Existing governed project adoption needs explicit approval before any bridge file is written. |
| Recommended next step | Review the docs-only bridge plan and keep workflow asset updates deferred. |

## Source Evidence

| Evidence | Ref | Status |
|---|---|---|
| Workflow Guidance Card | workflow-guidance-cards/001-existing-project.md | present |
| Workflow Adoption Map | workflow-adoption-maps/001-governed-web.md | present |
| Baseline Decision Card | baseline-decision-cards/001-baseline.md | present |
| Document Archive Apply Plan | not provided | not applicable |
| Hook Policy / Hook Plan | hook-policies/001-policy.md | present |
| Execution Closure Report | not provided | not applicable |

## Planned Actions

| ID | Action type | Target paths | Reason | Status | Will write now | Approval required | Rollback required |
|---|---|---|---|---|---|---|---|
| A-001 | EXISTING_PROJECT_BRIDGE_DOC | docs/governance/intentos-adoption-v1.md | Connect IntentOS workflow to existing governance without replacing it. | PLAN_ONLY | No | Yes | Yes |
| A-002 | BASELINE_DOC_WRITE | docs/intentos-baseline-gap-review-v1.md | Record baseline gaps instead of overwriting current baseline files. | PLAN_ONLY | No | Yes | Yes |

## Human-Only / Blocked Actions

| ID | Action type | Reason | Required owner | Status |
|---|---|---|---|---|
| H-001 | AGENTS_GOVERNANCE | Existing AGENTS.md is already governed and must not be overwritten. | human | HUMAN_APPROVAL_REQUIRED |
| H-002 | HOOK_OR_CI_CHANGE | Hooks and CI need separate hook policy approval. | human | HUMAN_APPROVAL_REQUIRED |

## Preconditions

| Precondition | Status |
|---|---|
| Target project exists | yes |
| Existing project rules reviewed | yes |
| Dirty work reviewed | pending |
| Required evidence linked | linked |
| High-risk actions separated | yes |

## Backup / Rollback Plan

| Action | Backup required | Backup path | Rollback step | Rollback verification |
|---|---|---|---|---|
| A-001 | Yes | .intentos/backups/apply-001/ | Restore or remove docs/governance/intentos-adoption-v1.md after approval. | Run project workflow checks and link search. |
| A-002 | Yes | .intentos/backups/apply-001/ | Restore or remove docs/intentos-baseline-gap-review-v1.md after approval. | Run project workflow checks and baseline review. |

## Verification Plan

| Step | Command or method | Required before apply | Required after apply | Evidence path | Owner |
|---|---|---|---|---|---|
| Pre-apply project state check | node scripts/cli.mjs next . | Yes | No | apply-plans/001-existing-project.md | Codex |
| Bridge doc link check | rg "intentos-adoption-v1" docs .intentos | No | Yes | final-reports/001-existing-project.md | Codex |
| Workflow check | node scripts/check-ai-workflow.mjs . --mode core | No | Yes | final-reports/001-existing-project.md | Codex |

## Human Decisions Needed

| Decision | Why it matters | Options | Recommended option | Owner | Status |
|---|---|---|---|---|---|
| Approve docs-only bridge scope | It writes new governance docs into an existing project. | approve / narrow / reject | narrow if unclear | human | PENDING |
| Keep AGENTS migration deferred | Existing AGENTS.md may be source-controlled by the project. | defer / apply separately / reject | defer | human | PENDING |

## Boundary

- This plan writes files now: No
- This plan authorizes apply: No
- This plan approves implementation: No
- This plan approves release or production: No
- This plan modifies CI or hooks now: No
- This plan deletes or archives files now: No
- This plan changes source of truth now: No
- This plan grants Codex permission to continue beyond scope: No

## Outcome

`NEEDS_HUMAN_DECISION`
