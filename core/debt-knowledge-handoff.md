# Debt & Knowledge Handoff

Debt & Knowledge Handoff makes two things explicit after non-trivial work:

- what debt remains
- what the next person must know to continue safely

It is not debt forgiveness. It is not release approval. It is not a substitute
for Review Loop, Delivery Path, or Safe Launch.

## Debt Levels

| Level | Meaning | Handling |
|---|---|---|
| `D0_NO_DEBT_FOUND` | No obvious debt was found | record none |
| `D1_ACCEPTABLE_SMALL_DEBT` | Small debt that does not block the next task | record and revisit later |
| `D2_MAINTENANCE_DEBT` | Debt that can affect maintainability | recommend a follow-up before related expansion |
| `D3_RELEASE_BLOCKING_DEBT` | Debt that blocks release review | stop before release review |
| `D4_HIGH_RISK_DEBT` | Debt tied to security, privacy, payment, data, migration, or production risk | stop for human decision |

## Required Report

A Debt & Knowledge Handoff Report must include:

- Human Decision Summary
- Task Context
- Debt Register
- Knowledge Handoff
- Verification Notes
- Files To Revisit
- Human Decisions
- Boundaries
- Outcome

## Knowledge Handoff Must Explain

- what changed
- why it changed
- how to verify it
- where to start next time
- what not to touch without approval

## Boundaries

Every report must say:

- This report forgives debt: No
- This report approves implementation: No
- This report approves release or production: No
- This report changes task state: No
- This report changes source of truth: No
- This report replaces Review Loop: No
- This report replaces Safe Launch: No

## Relationship To Other Protocols

- Review Surface requires a debt result after execution.
- Delivery Path uses debt state to decide whether the project can move toward trial or release review.
- Work Queue uses handoff details when work is paused or resumed.
- Document Lifecycle handles stale or conflicting docs discovered during handoff.
- Safe Launch must block release claims when D3 or D4 debt exists.
