# Engineering Principles

## Purpose

Define how this project makes engineering tradeoffs before implementation begins.

## Decision Priorities

Use this order when tradeoffs conflict:

1. Correctness and user safety
2. Data integrity and permission boundaries
3. Maintainability
4. Verifiability
5. Delivery speed
6. Cost efficiency

## Default Engineering Rules

- Prefer vertical slices over broad rewrites.
- Prefer simple, explicit designs over clever abstractions.
- Keep changes scoped to the linked task card.
- Codex evaluates production dependencies from project evidence and records
  necessity, compatibility, security, verification, and rollback. Ask the user
  only before a concrete external cost, account, provider, or production effect.
- Do not introduce irreversible behavior without a rollback plan.
- Treat tests, logs, and review evidence as part of the implementation.

## Architecture Rules

- Preserve existing module boundaries unless a bounded technical decision and
  its internal review evidence justify a change.
- Keep domain rules out of UI-only layers when the project has multiple layers.
- Keep external side effects behind clear interfaces.
- Document architecture decisions in ADRs when the decision affects future work.

## AI Execution Rules

- Codex owns technical discovery, architecture, implementation, tests, review,
  repair, rollback preparation, and release-readiness judgment.
- The user owns business goals, unavailable business facts, genuine product
  preferences, and consent to a concrete real-world effect.
- Resolve technical uncertainty through project evidence, safe defaults,
  bounded experiments, tests, and internal review. Ask one plain question only
  when a business/external fact is unavailable or an exact prepared external
  effect is next.

## Project-specific Additions

- 
