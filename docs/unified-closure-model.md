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
