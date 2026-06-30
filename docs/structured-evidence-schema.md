# Structured Evidence Schema

IntentOS keeps workflow artifacts readable for humans, but high-risk write-control artifacts also need stable machine-readable evidence.

1.41.0 adds schema-backed evidence for:

- Unified Apply Plan
- Controlled Apply Readiness
- Approval Record

The Markdown sections remain the human-readable record. The `Machine-Readable Evidence` JSON block is the machine-checkable record.

## Rules

- The JSON block must match the schema under `schemas/artifacts/`.
- Unified Apply Plan evidence must include a recomputable `plan_digest`.
- Readiness and Approval records must reference the same `plan_digest` when the apply plan file is available.
- Boundary fields must stay false unless a future controlled runner explicitly supports a safe mode.
- Approval evidence still does not authorize automatic apply.

## Current Boundary

Structured evidence improves verification. It does not write files, execute apply plans, validate real human identity, approve implementation, approve release or production, install hooks, change CI, or enable BL2.

## Human Workflow

1. Codex writes a readable apply plan.
2. Codex includes structured evidence with exact action IDs and target paths.
3. Codex creates readiness and approval records that reference the plan digest.
4. Checkers validate both readable Markdown boundaries and structured JSON evidence.
5. Humans still approve or reject the actual decision.

