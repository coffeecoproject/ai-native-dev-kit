# Conversation Turn Classification

## Human Summary

Plain-language summary of what the user message means for the current work.

## User Message

Quote or summarize the relevant user message. Do not store private raw conversation beyond what is necessary.

## Active Work

- Current goal:
- Current task:
- Current approved scope:

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

`None` or the specific decision needed before Codex continues.

## Audit Notes

Why this routing is valid.
