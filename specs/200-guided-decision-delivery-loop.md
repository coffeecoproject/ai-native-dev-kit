# Spec 200: Guided Decision & Delivery Loop

## Status

Draft

## Source

- Request: `requests/200-guided-decision-delivery-loop.md`
- Preflight: `preflight/200-guided-decision-delivery-loop.md`

## Problem

Human Decision Summary makes outputs easier to read, but users can still be asked too many professional technical questions. Codex needs a formal behavior layer for recommending the smallest safe path, preserving current mainline, parking side ideas, and routing expert-risk decisions.

## Expected Behavior

Codex should:

- recommend before asking when the user request is broad or non-expert
- classify decision ownership as D0/D1/D2/D3/D4
- keep one current mainline visible
- park side ideas without executing them
- translate technical choices into user-owned product or risk decisions
- stop for expert or accountable owner review when required
- preserve existing gates and safety boundaries

## Required Assets

- `core/decision-delegation-boundary.md`
- `core/guided-delivery-loop.md`
- `templates/active-work-thread.md`
- `templates/guided-decision-summary.md`
- `prompts/delivery-coach-agent.md`
- `docs/guided-decision-delivery-loop.md`
- `active-work-threads/.gitkeep`
- `guided-decision-summaries/.gitkeep`

## Script Support

`scripts/new-workflow-item.mjs` must support:

- `--type active-work-thread`
- `--type guided-decision-summary`

These artifacts are optional and must not be treated as approval.

## Documentation

README, quickstart, Codex usage, mental model, operator manual, reference docs, platform adapters, and init/update instructions should explain the behavior and boundaries.

## Claim Boundary

Allowed claim:

```text
1.10.0 improves how Codex guides users through the next safe delivery step.
```

Forbidden claims:

- Users no longer need to approve risk.
- Codex can decide all technical questions.
- Active Work Thread approves future work.
- Guided Decision Summary authorizes implementation.
- The kit can continue through production, release, migration, payment, privacy, or security decisions without owner review.
