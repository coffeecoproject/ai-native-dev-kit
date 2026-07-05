# Release Record: 1.39.0

## Theme

Subagent Dispatch Hygiene.

## Summary

1.39.0 adds an explicit recover-before-dispatch rule for helper agents. Codex must check and record helper cleanup before dispatching or reusing subagents.

## Added

- `core/subagent-dispatch-hygiene.md`
- `docs/subagent-dispatch-hygiene.md`
- `docs/plans/subagent-dispatch-hygiene-1.39-plan.md`
- `Dispatch Hygiene` section in `templates/subagent-run-plan.md`
- generated Subagent Run Plan defaults for dispatch hygiene
- stricter `scripts/check-subagent-orchestration.mjs` validation
- updated checklist, operator docs, README/docs references, starter/platform guidance
- good example and bad fixtures for stale dispatch, multiple writers, and missing task-drift checks

## Allowed Claims

- IntentOS now has a recorded recover-before-dispatch rule for Subagent Run Plans.
- The Subagent Orchestration checker validates dispatch hygiene fields when run plans exist.
- Generated Subagent Run Plans include default dispatch hygiene evidence.
- The release includes examples and bad fixtures for dispatch hygiene behavior.

## Forbidden Claims

- Do not claim 1.39.0 creates or closes real subagents automatically.
- Do not claim 1.39.0 adds a scheduler, hook runner, background worker, or external GPT/API review loop.
- Do not claim 1.39.0 approves target-project writes, implementation, release, production, or high-risk decisions.
- Do not claim recorded dispatch hygiene proves live tool-session state was inspected.

## Evidence Status

- Source evidence: protocol, docs, template, checker, generated defaults, manifest copy rules, examples, bad fixtures, and release evidence are present in the repository.
- Verification evidence: local checks should include `check-subagent-orchestration`, `check-manifest`, `check-intentos`, and `git diff --check`.
- Real-project evidence: not claimed by this release.

## Known Limitations

- Dispatch Hygiene validates recorded run plans; it does not inspect live subagent sessions.
- If a tool surface has no explicit close command, closure is represented by run-plan status and no further work being sent.
- Task drift still depends on Conversation Drift Control, Work Queue, and main-thread judgment.

## Non-Goals

1.39.0 does not create or close real subagents automatically, add a scheduler, install hooks, call external GPT/API review, modify CI in target projects, approve implementation, approve release/production, or grant write authority.

## Verification

Expected checks:

```bash
node scripts/check-subagent-orchestration.mjs examples/subagent-orchestration-closed-run
node scripts/check-subagent-orchestration.mjs examples/1.39-subagent-dispatch-hygiene
node scripts/check-subagent-orchestration.mjs test-fixtures/bad/bad-subagent-dispatch-idle-running
node scripts/check-subagent-orchestration.mjs test-fixtures/bad/bad-subagent-dispatch-multiple-writers
node scripts/check-subagent-orchestration.mjs test-fixtures/bad/bad-subagent-dispatch-task-drift
node scripts/check-intentos.mjs
git diff --check
```
