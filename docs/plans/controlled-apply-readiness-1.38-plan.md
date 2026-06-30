# 1.38 Controlled Apply Readiness Plan

## Goal

Add a pre-execution readiness layer after Unified Apply Plan.

The layer should help Codex answer whether a reviewed apply plan is eligible for a future controlled apply step, while still preventing Codex from writing files or treating the plan as approval.

## Scope

- Add Controlled Apply Readiness governance.
- Add report template, checklist, prompt, docs, examples, and bad fixtures.
- Add read-only resolver and checker.
- Add CLI entries.
- Add generated-project assets.
- Add CI and release verification coverage.

## Non-Goals

- Do not add an apply runner.
- Do not execute writes from a Unified Apply Plan.
- Do not approve implementation, release, production, CI, hooks, archive apply, migrations, secrets, payments, security, privacy, compliance, legal, or industrial packs.
- Do not let a user sentence count as blanket approval.

## User Experience

User says:

```text
这份 apply plan 我确认了，接下来能执行吗？
```

Codex should answer:

```text
我先做受控执行准备检查。它只判断是否具备执行条件，不会写文件。
```

## Required Behavior

1. Read one Unified Apply Plan.
2. Check plan boundaries.
3. Classify actions as low-risk candidate, human-only, or blocked.
4. Check target scope, git safety, backup, rollback, and verification readiness.
5. Return one Controlled Apply Readiness Report.
6. Stop for explicit human approval before any future apply.

## Verification

- `node scripts/check-controlled-apply-readiness.mjs .`
- `node scripts/check-controlled-apply-readiness.mjs examples/1.38-controlled-apply-readiness`
- `node scripts/check-dev-kit.mjs`
- `npm run verify:release`
- `git diff --check`
