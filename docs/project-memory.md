# Project Memory & Context Governance

## Human Summary

Project memory is not AI self-learning. It is a controlled way to keep project context accurate over time.

Codex may observe and draft. Humans confirm. Confirmed context is written to Git-backed source of truth.

## When To Use

Use project memory governance when:

- the same review finding appears repeatedly
- a baseline looks outdated
- project docs conflict
- a task depends on inferred environment, permission, release, or data facts
- Codex discovers a rule that should help future tasks

## What To Create

Use `learning-candidates/` when the observation may become durable context but is not confirmed.

Use `context-corrections/` when existing context appears wrong or outdated.

Use `git-boundary-reports/` when deciding which AI Native or context artifacts should enter Git.

## Human Decision

The human decides whether the candidate is:

- Pending
- Approved
- Rejected
- Needs Revision

Only approved and evidence-backed context can become source of truth.

## Source Of Truth

Confirmed project memory should usually land in:

- `docs/project-profile.md`
- `docs/tech-stack-strategy.md`
- `docs/business-spec-index.md`
- `docs/engineering-baseline.md`
- `docs/environment-baseline.md`
- `docs/verification-matrix.md`
- `decision-briefs/`
- accepted `context-corrections/`

## What AI Must Not Do

Codex must not:

- treat inference as confirmed fact
- update baselines from a candidate without approval
- use model memory to override Git docs
- persist raw chat history as project memory
- store secrets or local machine details

## Check

```bash
node scripts/check-context-governance.mjs .
```

