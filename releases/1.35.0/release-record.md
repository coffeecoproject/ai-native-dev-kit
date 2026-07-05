# Release Record: 1.35.0

## Summary

`1.35.0` adds Beginner Entry Governance.

The release creates a simpler natural-language entry for users who should not need to understand internal workflow commands. Users can provide one sentence, and Codex returns one Beginner Entry Card with what it understood, the recommended path, the few human decisions needed, safe next actions, blocked actions, routing evidence, and explicit boundaries.

## Added

- `core/beginner-entry.md`
- `docs/beginner-entry.md`
- `docs/plans/beginner-entry-1.35-plan.md`
- `templates/beginner-entry-card.md`
- `checklists/beginner-entry-review.md`
- `prompts/beginner-entry-agent.md`
- `beginner-entry-cards/`
- `scripts/resolve-beginner-entry.mjs`
- `scripts/check-beginner-entry.mjs`
- `ask` and `ask-check` CLI entries
- 1.35 example and bad fixtures

## Changed

- README, script references, manifest, CI, generated-project asset lists, starter governance wording, and release checks now include Beginner Entry.
- `npm run verify` includes beginner-entry syntax and governance smoke checks.
- Dev-kit self-check and document lifecycle checker use a larger child-process output buffer so large read-only lifecycle JSON reports do not fail verification because of stdout size.

## Boundary

This release does not:

- replace Workflow Guidance;
- write target-project files;
- authorize apply;
- approve implementation;
- approve release or production;
- install hooks;
- modify CI;
- delete, move, archive, or rewrite documents;
- change task state;
- enable baseline or industrial packs;
- approve security, privacy, compliance, payment, migration, tax, legal, data, hook, automation, release, or production decisions.

## Allowed Claims

- IntentOS can accept a user goal through `ask`.
- Codex can choose internal workflow routing without making the user select workflow commands.
- Beginner Entry can summarize the safest next path and required human decisions.

## Forbidden Claims

- Do not claim Beginner Entry authorizes writes.
- Do not claim Beginner Entry approves implementation.
- Do not claim Beginner Entry approves release, production, hooks, CI, archive moves, task-state changes, baseline packs, industrial packs, or high-risk decisions.
- Do not claim users no longer need to make risk decisions.

## Evidence Status

- Release evidence passed. See `releases/1.35.0/self-check-report.md`.

## Known Limitations

- Beginner Entry depends on the existing Workflow Guidance resolver for project reading.
- It simplifies the user-facing path; it is not a full product manager or automatic implementation planner.
- It does not eliminate human judgment for scope, risk, release, or production decisions.

## Verification

See `releases/1.35.0/self-check-report.md`.
