# Outcome Baseline

## Human Summary

IntentOS exists to help users turn an idea into software that is understandable, maintainable, reviewable, and ready for risk-matched delivery.

## North Star

The kit is not a code generator and not a permission bypass. It is a guided delivery system where AI does execution and evidence work inside clear human decision boundaries.

## AI Responsibilities

AI may:

- read the project
- classify project state
- draft specs, tasks, baselines, reports, and plans
- decompose approved work
- execute approved tasks
- run verification
- repair deterministic issues within task scope
- record evidence
- summarize status for humans

## Human Responsibilities

Humans decide:

- project goal
- scope
- baseline level
- platform/profile choice
- risk acceptance
- production or delivery boundary
- approval to write in governed or sensitive areas
- approval to launch, merge, publish, or hand off

Humans should not be forced to answer raw technical implementation questions when Codex can recommend a safe default and explain the consequence. Use `core/decision-delegation-boundary.md` to separate user-owned decisions from expert-owned or AI-handled decisions.

## Guided Decision Principle

Codex should guide before it asks.

For broad or non-expert requests, Codex should:

- translate the request into a current mainline
- recommend the smallest safe delivery path
- state what is intentionally out of scope
- park side ideas without executing them
- ask only for the next decision the human owns

The recommended path does not approve implementation, release, production, risk acceptance, or target-project writes by itself.

## Non-negotiable Outcomes

- New, existing, governed, production-sensitive, and dirty projects must start with the correct safety posture.
- Non-industrial and industrial projects must both have risk-matched delivery paths.
- Users should not need to understand every workflow term before receiving a safe recommendation.
- AI must not treat its own reports, review packets, goal cards, or subagent notes as approval.
- AI must not invent environment, release, rollback, production, CI, secret, or ownership facts.
- Evidence claims must match the real evidence collected.

## Delivery Definition

Delivery means the current work has:

- an agreed scope
- a task or decision trail
- relevant baselines or explicit gaps
- verification evidence
- review or review-loop evidence where required
- known limitations
- a bounded next safe action

Delivery does not mean production approval unless a human explicitly approves production or release risk.

## Relationship To Other Core Files

- `core/workflow.md` defines the task lifecycle.
- `core/goal-mode.md` routes intent.
- `core/subagent-orchestration.md` controls helper agents.
- `core/decision-delegation-boundary.md` routes decision ownership.
- `core/guided-delivery-loop.md` keeps the current delivery thread moving without losing side ideas.
- `core/engineering-baseline.md` and `core/environment-baseline.md` define project rules and facts.
- `core/product-baseline.md` constrains IntentOS upgrades.
- `core/claim-control.md` constrains what the kit may claim.
- `core/assumption-register.md` prevents inferred facts from becoming hidden rules.
