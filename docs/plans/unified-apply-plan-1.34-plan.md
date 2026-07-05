# Unified Apply Plan 1.34 Plan

## Goal

`1.34.0` adds a unified apply-plan layer.

The goal is to make every possible project write pass through one reviewable plan before Codex applies anything.

```text
read-only guidance
-> unified apply plan
-> human approval
-> specialized apply command or controlled manual change
-> verification
-> execution closure
```

## Problem

IntentOS already has several plan-first flows:

- init/update write plan
- baseline write plan
- document archive apply plan
- hook plan and hook policy
- workflow map for existing governed projects

But a user can still receive scattered advice:

```text
update workflow assets
apply AGENTS migration
apply PR template migration
add baseline docs
maybe add hooks later
maybe archive docs later
```

That is too much judgment to push onto a non-specialist user.

## Product Principle

Codex should turn technical recommendations into one decision surface.

The user should decide:

```text
approve / narrow / reject
```

The user should not have to inspect many workflow internals before understanding what will change.

## Scope

### In Scope

- Add Unified Apply Plan governance.
- Add `apply-plan` and `apply-plan-check` CLI commands.
- Add `scripts/resolve-apply-plan.mjs`.
- Add `scripts/check-apply-plan.mjs`.
- Add `apply-plans/` as the recorded plan directory.
- Add a template, checklist, prompt, example, bad fixtures, manifest coverage, CI smoke checks, README references, and release evidence.

### Out Of Scope

- No target-project writes.
- No generic write executor.
- No automatic apply after plan generation.
- No CI or hook installation.
- No archive move / delete.
- No baseline or industrial pack enablement.
- No AGENTS or PR template mutation.
- No release or production approval.
- No high-risk domain approval.

## Apply Plan Inputs

The resolver accepts:

- `--intent`
- `--action`
- `--targets`
- `--from-guidance`
- `--from-workflow-map`
- `--from-baseline-decision`
- `--from-standard-baseline`
- `--from-baseline-pack-selection`
- `--from-archive-apply`
- `--from-hook-plan`
- `--from-hook-policy`
- `--from-review-surface`
- `--from-change-boundary`
- `--from-debt-handoff`
- `--from-closure`

The plan may infer action candidates from intent, but inference never authorizes writes.

## Apply States

Allowed states:

- `NO_APPLY_ACTION_READY`
- `PLAN_ONLY`
- `NEEDS_HUMAN_APPROVAL`
- `BLOCKED_BY_MISSING_EVIDENCE`
- `BLOCKED_BY_DIRTY_WORK`
- `BLOCKED_BY_RISK`
- `BLOCKED_BY_MISSING_TARGET`

Allowed outcomes:

- `APPLY_PLAN_RECORDED`
- `NEEDS_HUMAN_DECISION`
- `BLOCKED`

## Required Boundaries

Every plan must say:

- This plan writes files now: No
- This plan authorizes apply: No
- This plan approves implementation: No
- This plan approves release or production: No
- This plan modifies CI or hooks now: No
- This plan deletes or archives files now: No
- This plan changes source of truth now: No
- This plan grants Codex permission to continue beyond scope: No

## Human Experience

User asks:

```text
把这套工作流接入这个老项目，你自己判断怎么处理
```

Codex should produce:

```text
我建议先只读接入，不覆盖现有规则。

会计划新增：
- 接入映射文档
- 基线差距报告

不会改：
- AGENTS.md
- CI
- hooks
- 发布流程
- 业务代码

是否生成/确认这份 Apply Plan？
```

The technical report remains available underneath, but the decision is one surface.

## Verification

1. `node --check scripts/resolve-apply-plan.mjs`
2. `node --check scripts/check-apply-plan.mjs`
3. `node scripts/resolve-apply-plan.mjs . --intent "maintain IntentOS apply plan" --action workflow-assets`
4. `node scripts/check-apply-plan.mjs examples/1.34-unified-apply-plan`
5. bad fixtures reject apply authorization and write-now claims
6. `node scripts/check-apply-plan.mjs .`
7. `node scripts/check-intentos.mjs`
8. `npm run verify`
9. `git diff --check`
