# Conversation Turn Classification

## Human Decision Summary

Compatibility heading: semantically this is the bounded `User Input Summary`; it grants no technical decision authority.

Conclusion:

User input class: NO_USER_ACTION / BUSINESS_FACT_NEEDED / REAL_WORLD_CONSENT_NEEDED / EXTERNAL_FACT_NEEDED

User input needed now: Yes / No

Plain-language question or exact consent request, if needed:

Why project evidence cannot answer it:

What happens if you do nothing:

## Codex Routing Decision And Evidence

Selected action: CONTINUE_CURRENT_TASK / START_NEW_ENTRY / REPLAN_SCOPE / DISCUSS_ONLY / PAUSE_OR_STOP

Can Codex continue now: yes / limited / no

Scope relation and evidence:

Risk response:

Verification, review route, and technical recovery:

## Human Summary

Plain-language summary of what the user message means for the current work.

## User Message

Quote or summarize the relevant user message. Do not store private raw conversation beyond what is necessary.

## Active Work

- Current goal:
- Current task:
- Current approved scope:

## Mainline Placement

| Bucket | Value |
|---|---|
| Current Mainline |  |
| Parking Lot |  |
| Decision Needed |  |
| Stop Item |  |

## Intent Classification

`DISCUSS_ONLY` / `ANSWER_TO_PENDING_QUESTION` / `CONTINUE_CURRENT_TASK` / `SCOPE_CHANGE` / `NEW_TASK` / `DIRECT_FOLLOW_UP` / `RISK_DECISION` / `PAUSE_OR_STOP` / `REVIEW_ONLY` / `MEMORY_CANDIDATE` / `OUT_OF_SCOPE_OBSERVATION`

## Relation To Current Task

`INSIDE_SCOPE` / `CHANGES_SCOPE` / `NEW_TASK` / `OUT_OF_SCOPE` / `BLOCKS_CURRENT_TASK`

## Risk / Scope Impact

Describe any impact on risk, scope, baseline, release, payment, privacy, security, data, migration, or production.

## Selected Action

What Codex will do next.

## Can Continue Current Task?

`Yes` / `No`

## Required Human Decision

Compatibility heading: semantically this is the bounded `User Input Record`.

`None` or one of `BUSINESS_FACT_NEEDED` / `REAL_WORLD_CONSENT_NEEDED` / `EXTERNAL_FACT_NEEDED`.

Exact question or prepared effect, if needed:

## Audit Notes

Why this routing is valid.
