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
- Do not add production dependencies without explicit approval.
- Do not introduce irreversible behavior without a rollback plan.
- Treat tests, logs, and review evidence as part of the implementation.

## Architecture Rules

- Preserve existing module boundaries unless an approved spec changes them.
- Keep domain rules out of UI-only layers when the project has multiple layers.
- Keep external side effects behind clear interfaces.
- Document architecture decisions in ADRs when the decision affects future work.

## AI Execution Rules

- AI may propose options, draft code, write tests, and summarize evidence.
- Humans own goals, priorities, risk acceptance, and final approval.
- If the task requires a product, architecture, security, or release decision, AI must stop and ask.

## Project-specific Additions

- 
