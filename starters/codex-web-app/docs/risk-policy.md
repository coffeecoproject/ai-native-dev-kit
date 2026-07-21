# Risk Policy

## Purpose

Define which changes are low-risk, which need stricter internal review, and which prepared real-world effects require exact user consent before execution.

## Risk Levels

### L0: Local Low-risk Change

Examples:

- wording updates
- isolated visual polish
- small test-only changes
- local bug fixes with no data, permission, or production impact

Required:

- scoped change
- relevant verification
- final report

### L1: Standard Product / Engineering Change

Examples:

- ordinary feature slice
- local API or UI behavior
- non-sensitive refactor inside one module

Required:

- spec or accepted task card
- acceptance criteria
- verification evidence
- AI task log when AI was used materially

### L2: Cross-boundary or Data-impacting Change

Examples:

- cross-module behavior
- data model or API contract changes
- permission-adjacent behavior
- integration behavior
- non-destructive migration

Required:

- preflight
- spec
- eval
- reviewer pass
- rollback notes

### L3: High-risk Change

Examples:

- auth or permission model changes
- irreversible operation
- data deletion
- regulated data
- personal data exposure risk
- production config
- secrets
- destructive migration
- external API with side effects
- value transfer
- safety-critical behavior

Required:

- strict technical planning, review, verification, and rollback evidence before
  code changes; user input only for business/external facts or exact real-world
  consent
- full spec/eval/task chain
- risk report
- verification evidence
- release gate
- rollback plan
- post-release check

## Stop Conditions

Stop the dependent engineering path and resolve it internally when:

- the requested change crosses the natural-language task boundary
- the spec and task card conflict
- required technical data or credentials are missing
- the same verification failure repeats twice
- a high-risk technical decision lacks evidence or independent review
- rollback is unclear for an irreversible or production-impacting change

Do not turn these conditions into a request for technical approval. Codex
inspects, narrows, tests, reviews, repairs, or keeps the dependent capability
disabled. Ask the user only for an unavailable business/external fact or exact
consent immediately before a prepared real-world effect.

## Project-specific Risks

- 
