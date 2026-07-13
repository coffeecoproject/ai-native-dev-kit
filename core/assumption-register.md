# Assumption Register

## User Summary

Assumption Register makes AI uncertainty visible. It prevents inferred project facts from silently becoming rules.

## Rule

Any assumption that affects scope, architecture, environment, release, security, data, cost, production, ownership, or risk must be recorded with evidence and confidence.

## Format

| Assumption | Evidence | Confidence | Can proceed? | User input class | Evidence owner | Status |
|---|---|---|---|---|---|---|
|  |  | high / medium / low | Yes / No | NO_USER_ACTION / BUSINESS_FACT_NEEDED / REAL_WORLD_CONSENT_NEEDED / EXTERNAL_FACT_NEEDED | project / Codex / user / external | CONFIRMED / INFERRED / PENDING_CONFIRMATION / NOT_APPLICABLE |

## Status Meaning

- `CONFIRMED`: directly proven by project/external evidence or supported by permitted user input when the fact cannot be derived.
- `INFERRED`: reasonable inference from evidence, but not a project rule.
- `PENDING_CONFIRMATION`: compatibility state; evidence or one permitted user input is still missing.
- `NOT_APPLICABLE`: explicitly not relevant, with reason.

## Baseline Boundary

`INFERRED` may appear in recommendations, gap reports, review packets, or final reports.

`INFERRED` must not become an approved engineering or environment baseline rule.

Formal baseline files should use:

- `CONFIRMED`
- `PENDING_CONFIRMATION`
- `NOT_APPLICABLE`

## High-risk Assumptions

These assumptions require project/external evidence or the indicated bounded user input; they are not raw technical questions for the user:

- staging, production, rollback, monitoring, secret storage, migration, and CI/CD facts: Codex derives and verifies them or keeps the task blocked;
- payment, tax, financial, customer, provider, legal, and compliance facts: request only the unavailable business or external fact;
- prepared production, payment, customer communication, and irreversible-data effects: request exact bounded consent only after technical readiness passes.

## Output Placement

Use Assumption Register sections in:

- baseline recommendation reports
- review packets
- review loop reports
- final reports
- customer handoffs
- release records when claim evidence depends on assumptions
