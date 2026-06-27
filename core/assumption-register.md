# Assumption Register

## Human Summary

Assumption Register makes AI uncertainty visible. It prevents inferred project facts from silently becoming rules.

## Rule

Any assumption that affects scope, architecture, environment, release, security, data, cost, production, ownership, or risk must be recorded with evidence and confidence.

## Format

| Assumption | Evidence | Confidence | Can proceed? | Needs human confirmation? | Owner | Status |
|---|---|---|---|---|---|---|
|  |  | high / medium / low | Yes / No | Yes / No | AI / human | CONFIRMED / INFERRED / PENDING_CONFIRMATION / NOT_APPLICABLE |

## Status Meaning

- `CONFIRMED`: human-confirmed or directly proven by project artifact.
- `INFERRED`: reasonable inference from evidence, but not a project rule.
- `PENDING_CONFIRMATION`: must be confirmed before it affects a decision.
- `NOT_APPLICABLE`: explicitly not relevant, with reason.

## Baseline Boundary

`INFERRED` may appear in recommendations, gap reports, review packets, or final reports.

`INFERRED` must not become an approved engineering or environment baseline rule.

Formal baseline files should use:

- `CONFIRMED`
- `PENDING_CONFIRMATION`
- `NOT_APPLICABLE`

## High-risk Assumptions

These assumptions usually require human confirmation:

- staging or production environment exists
- rollback process exists
- release owner exists
- monitoring or alerting exists
- secrets are stored in a specific service
- payment, permission, tax, or financial logic is safe to change
- migration can run safely
- CI/CD can be modified
- customer delivery can proceed

## Output Placement

Use Assumption Register sections in:

- baseline recommendation reports
- review packets
- review loop reports
- final reports
- customer handoffs
- release records when claim evidence depends on assumptions
