# Release Execution Protocol

Release Execution Protocol is the step after Launch Review View.

In plain language:

```text
1.55 answers: can this enter launch review?
1.56 answers: after human approval, what is the safe release execution path?
```

It does not mean Codex automatically publishes or deploys.

## How To Use

Generate a release execution plan:

```bash
node scripts/cli.mjs release-execution . \
  --intent "prepare release execution" \
  --mode PLAN_ONLY
```

Check recorded plans:

```bash
node scripts/cli.mjs release-execution-check .
```

When a release owner approves a release, provide the approval reference:

```bash
node scripts/cli.mjs release-execution . \
  --launch-view-ref launch-review-views/001-launch.md \
  --approval-ref approval-records/001-release.md \
  --mode HUMAN_EXECUTION_HANDOFF
```

## What It Produces

A Release Execution Plan tells the user:

- whether Launch Review View is ready
- whether human release approval exists
- which mode is allowed
- which steps Codex may help with
- which steps must stop for a human
- what evidence must be captured
- what must happen after release

## Modes

| Mode | Meaning |
|---|---|
| `PLAN_ONLY` | Safe default. Codex only prepares a plan. |
| `HUMAN_EXECUTION_HANDOFF` | Human or existing release system executes release. |
| `ASSISTED_EXECUTION` | Codex may assist with explicitly allowed low-risk commands after approval. |
| `BLOCKED` | Required release-review or approval evidence is missing. |

## Hard Boundary

Even with human approval, Codex must stop before:

- production deployment when project policy does not explicitly allow Codex execution
- app-store / mini-program / Play Store submission
- database migrations
- production secrets, DNS, payment, permissions, or config changes
- release rollback risk acceptance
- legal, tax, security, privacy, compliance, or finance decisions

## Good Outcome

A good Release Execution Plan should let a non-technical user understand:

```text
What can happen now?
Who must do it?
What proof do we need?
Where must Codex stop?
```
