# Unified Closure Model

Unified Closure Model is the close-out source of truth.

The user should still be able to ask one plain question:

```text
Is this task done?
```

Codex then checks the relevant closure inputs and returns one final decision:

```text
DONE
NOT_DONE
NEEDS_EVIDENCE
NEEDS_IMPACT_COVERAGE
NEEDS_HUMAN_DECISION
BLOCKED
```

## Why This Exists

Before this model, several artifacts could all sound like close-out:

- Change Impact Coverage
- Execution Closure
- Guided Closure
- Evidence Precision

They are useful, but they should not produce competing final answers.

## Mental Model

```text
impact coverage + execution closure + guided closure + evidence precision
-> Unified Closure Decision
-> plain user answer
```

## User-Facing Command

Use the existing `finish` entry:

```bash
node scripts/cli.mjs finish ../my-project --intent "finish booking validation" --verification "npm run verify passed"
```

This is read-only. It does not approve code, commit, push, release, production, CI, hooks, or high-risk decisions.

## Explainability

`finish` should not only give a final answer. It should also explain why that answer was selected.

The Closure Decision includes:

- Decision Trace
- Dominant Reason
- Conflict Summary

These sections show which input decided the result, which inputs passed, which inputs were missing, and why the stricter result won.

## Maintainer Checks

```bash
node scripts/check-closure-decision.mjs .
```

Lower-level scripts remain available for exact evidence checks:

```bash
node scripts/check-change-impact-coverage.mjs .
node scripts/check-execution-closure.mjs .
node scripts/check-guided-closure.mjs .
```

## Task Governance Consumer Integration

From 1.85.0, `check-closure-decision` can run in strict task-consumer mode:

```bash
node scripts/check-closure-decision.mjs . --strict-task-consumer
```

In that mode, a Closure Decision cannot return `DONE` while Task Governance says
the current Work Queue item is blocked, unresolved, or missing required
verification.
