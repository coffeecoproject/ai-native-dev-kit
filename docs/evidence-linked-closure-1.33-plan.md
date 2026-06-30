# Evidence-Linked Closure 1.33 Plan

## Goal

`1.33.0` upgrades Execution Review Closure from an inferred close-out report to an evidence-linked close-out report.

The goal is to make every `pass` in an Execution Closure Report traceable to a recorded source:

```text
Review Surface Card
+ Review Loop / reviewer evidence
+ Change Boundary Report
+ Verification note or verification file
+ Debt & Knowledge Handoff
+ Delivery Path Report
= Evidence-linked Execution Closure
```

This release does not add an apply layer. It only strengthens read-only closure evidence.

## Problem

`1.32.0` added execution closure, but some closure results can still be inferred from changed files.

The weak claim is:

```text
changed files detected -> FUNCTIONAL_REVIEW pass
changed files detected -> CODE_REVIEW pass
```

This is not strong enough.

Changed files prove that work happened. They do not prove that functionality was checked, code was reviewed, or the selected review surfaces were closed.

## Product Principle

Codex should reduce user effort, not shift expert judgment onto the user.

For closure, this means:

- Codex may gather and connect evidence.
- Codex may explain what is missing.
- Codex may recommend whether the task can enter commit review.
- Codex must not treat detected changes as correctness evidence.
- Codex must not approve commit, push, release, production, high-risk decisions, or debt forgiveness.

## Scope

### In Scope

- Add optional evidence refs to `closure`:
  - `--review-surface-ref`
  - `--review-loop-ref`
  - `--change-boundary-ref`
  - `--verification-file`
  - `--debt-handoff-ref`
  - `--delivery-path-ref`
  - `--base`
  - `--cached`
- Add an `Evidence Links` section to Execution Closure Reports.
- Make `FUNCTIONAL_REVIEW` and `CODE_REVIEW` conservative by default.
- Let Review Surface Card define the surfaces that must be closed.
- Let Review Loop / reviewer evidence close functional and code review only when evidence is positive.
- Let Verification evidence close verification review only when evidence is positive.
- Let Change Boundary evidence close scope boundary only when it passes.
- Let Debt Handoff evidence close debt review only when it is non-blocking.
- Update checker, examples, bad fixtures, README, CI, manifest, and release evidence.

### Out Of Scope

- No file writes to target projects.
- No task-state mutation.
- No archive apply.
- No hook install.
- No CI mutation.
- No commit or push authorization.
- No release or production approval.
- No unified apply plan.

## Evidence Semantics

### Review Surface Card

Purpose:

- Defines which review surfaces must close.
- Does not by itself make any surface pass.

Required effect:

- If provided, every selected surface must appear in closure.
- Missing selected surfaces fail closure check.

### Review Loop / Reviewer Evidence

Purpose:

- Provides review outcome evidence for functional, code, UX, data, permission, and other non-verification surfaces.

Pass conditions:

- Contains a positive review result such as `PASS`, `READY`, `APPROVED FOR REVIEW`, or an explicit pass row.
- Does not contain unresolved `FAIL`, `BLOCKED`, `NEEDS_HUMAN_DECISION`, or repeated unresolved issues for the current closure.

Boundary:

- Reviewer evidence can close a review surface.
- It does not approve implementation, commit, release, or production.

### Verification Evidence

Purpose:

- Provides command or manual verification evidence.

Inputs:

- `--verification "npm run verify passed"`
- `--verification-file reports/verify-output.txt`

Pass conditions:

- Verification text or file clearly indicates pass.
- Verification file is read only for classification; its full content is not copied into closure output.

Boundary:

- A verification note is evidence supplied to closure.
- It is not the same as Codex independently executing the command.

### Change Boundary Evidence

Purpose:

- Confirms changed files stayed inside intended scope.

Inputs:

- `--change-boundary-ref change-boundary-reports/001-task.md`
- `--base main`
- `--cached`

Pass conditions:

- Referenced report has a passing boundary result.
- No out-of-scope or forbidden changes are recorded.

Boundary:

- Boundary evidence can support commit-review readiness.
- It does not authorize implementation or commit.

### Debt Handoff Evidence

Purpose:

- Records known debt and whether it blocks release review.

Pass conditions:

- Handoff exists.
- Debt is non-blocking or explicitly deferred.
- No D3/D4 or release-blocking debt is unresolved.

Boundary:

- Debt handoff records debt.
- It does not forgive debt.

### Delivery Path Evidence

Purpose:

- Carries current delivery path state into closure.

Boundary:

- Delivery path can inform the next state.
- It does not replace Safe Launch.

## Closure State Rules

`READY_FOR_COMMIT_REVIEW` requires:

- changed scope exists or a task/change is explicitly provided
- verification status is `pass`
- every selected review surface is `pass` or explicitly `not verified` with owner, and required surfaces are not left unverified
- functional/code pass is backed by review-loop or reviewer evidence, not by changed files alone
- change boundary evidence is `pass` when changed files exist
- debt is non-blocking or explicitly handed off
- no high-risk decision is implicitly approved

`NEEDS_HUMAN_DECISION` when:

- a required evidence ref is missing
- high-risk surfaces are detected without enough evidence
- selected surfaces remain unverified
- debt is unresolved or release-blocking
- boundary is unknown for non-trivial changed files

`BLOCKED` when:

- project path is unreadable
- verification failed
- change boundary reports forbidden or out-of-scope changes
- evidence refs are invalid or unreadable

`CLOSE_WITH_LIMITATIONS` when:

- closure can summarize work, but commit-review readiness is not supported by enough evidence.

`NOT_READY_TO_CLOSE` when:

- no task, changed files, verification, or evidence refs exist.

## Checker Rules

`check-execution-closure.mjs` must reject:

- `FUNCTIONAL_REVIEW pass` with evidence equal to changed files only.
- `CODE_REVIEW pass` with evidence equal to changed files only.
- `READY_FOR_COMMIT_REVIEW` without passing verification commands.
- `READY_FOR_COMMIT_REVIEW` with `VERIFICATION_REVIEW not verified`.
- `READY_FOR_COMMIT_REVIEW` without evidence links.
- `READY_FOR_COMMIT_REVIEW` with unresolved change boundary or debt blockers.
- Missing selected review surfaces when a Review Surface Card ref is present.
- Any claim that closure approves implementation, commit, push, release, production, high-risk decisions, or debt forgiveness.

## CLI Examples

Minimal inferred closure:

```bash
node scripts/cli.mjs closure . \
  --intent "完成预约校验" \
  --verification "npm run verify passed"
```

Evidence-linked closure:

```bash
node scripts/cli.mjs closure . \
  --intent "完成预约校验" \
  --review-surface-ref review-surface-cards/001-booking.md \
  --review-loop-ref review-loop-reports/001-booking.md \
  --change-boundary-ref change-boundary-reports/001-booking.md \
  --verification-file reports/verify-output.txt \
  --debt-handoff-ref debt-handoff-reports/001-booking.md \
  --delivery-path-ref delivery-path-reports/001-booking.md
```

## Verification Plan

- Syntax check updated scripts.
- Check 1.33 good example.
- Check bad fixture where changed files are used as pass evidence.
- Check bad fixture where ready-for-commit has no evidence links.
- Check resolver JSON with evidence refs.
- Check manifest.
- Check Dev Kit.
- Run `npm run verify`.
- Run `git diff --check`.

## Release Boundary

`1.33.0` does not:

- apply plans
- write target files
- change task state
- approve implementation
- approve commit or push
- approve release or production
- approve security, privacy, compliance, payment, migration, tax, legal, data, hook, CI, automation, release, or production decisions
- claim real production validation
