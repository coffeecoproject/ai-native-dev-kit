# Risk Policy

## Purpose

Define which changes are low-risk, which changes need review, and which changes require explicit human approval before implementation.

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

- explicit human approval before code changes
- full spec/eval/task chain
- risk report
- verification evidence
- release gate
- rollback plan
- post-release check

## Stop Conditions

Stop and ask before proceeding when:

- the requested change crosses the approved scope
- the spec and task card conflict
- required data, credentials, or production access is missing
- the same verification failure repeats twice
- a high-risk decision is needed
- rollback is unclear for an irreversible or production-impacting change

## Project-specific Risks

- 
