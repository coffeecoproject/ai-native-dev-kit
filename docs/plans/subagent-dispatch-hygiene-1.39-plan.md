# Subagent Dispatch Hygiene 1.39 Plan

## Goal

Make subagent dispatch safer by requiring Codex to recover stale helper-agent slots before opening or reusing helper agents.

The desired behavior is:

```text
check current task and active helpers
-> close consumed helpers
-> skip unused planned helpers
-> confirm no stale task agents remain
-> dispatch only the minimum needed helper
```

## Problem

Subagent Orchestration already requires all helpers to be `CLOSED` or `SKIPPED` before final response.

That protects the end of the task, but it does not explicitly protect the start of the next dispatch. In real use, Codex may be interrupted, redirected, or asked to continue a different task. Without a pre-dispatch cleanup rule, helper slots can be treated as available while stale or completed helpers are still logically occupying them.

## Scope

This phase adds:

- `core/subagent-dispatch-hygiene.md`
- `docs/subagent-dispatch-hygiene.md`
- a `Dispatch Hygiene` section in `templates/subagent-run-plan.md`
- generated Subagent Run Plan defaults for dispatch hygiene
- stricter `scripts/check-subagent-orchestration.mjs` validation
- updated subagent review checklist, operator docs, starter/platform guidance, README/docs references
- examples, bad fixtures, manifest/generated-project coverage, and release evidence

## Non-Scope

This phase does not:

- create, run, or close real subagents automatically;
- add a subagent scheduler;
- add external GPT/API review;
- install hooks;
- modify CI in target projects;
- add background workers or persistent monitors;
- change allowed subagent status values;
- approve task switching, implementation, release, production, or high-risk decisions;
- grant write authority beyond the existing run plan.

## Protocol

Before dispatching a helper agent, Codex must record dispatch hygiene in the Subagent Run Plan:

- `Before dispatch checked: Yes`
- idle helpers are recovered or marked `N/A`
- completed helpers are closed or marked `N/A`
- unused planned helpers are skipped or marked `N/A`
- stale task helpers are closed or skipped
- task drift is checked
- active writer count is `0` or `1`
- dispatch is allowed only when no blocking cleanup remains

The rule is recover-before-dispatch, not dispatch-then-cleanup.

## User Experience

Users should not need to understand helper-agent slots.

Codex should summarize this in plain language:

```text
我先确认没有旧的 helper 还占位，再派发新的 helper。
```

If cleanup is needed, Codex should either close/skip it in the run plan or stop for human decision when the current task changed.

## Checker Contract

`scripts/check-subagent-orchestration.mjs` must reject:

- missing `Dispatch Hygiene` section
- `Before dispatch checked` not set to `Yes`
- dispatch allowed while idle helpers are not recovered
- dispatch allowed while completed helpers are not closed
- dispatch allowed while unused planned helpers are not skipped
- dispatch allowed while stale task helpers remain
- dispatch allowed with more than one active writer
- dispatch allowed when task drift was not checked

The checker still rejects unclosed `RUNNING` agents before final response.

## Success Criteria

- Generated Subagent Run Plans pass the checker by default.
- Good examples pass.
- Bad fixtures prove the checker catches stale dispatch, multiple active writers, and missing task-drift checks.
- Generated projects receive the updated docs/template/checker assets.
- The release record states that 1.39 does not introduce real automation or target-project write authority.
