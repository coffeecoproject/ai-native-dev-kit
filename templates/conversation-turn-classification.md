# Conversation Turn Classification

## Human Decision Summary

Conclusion:

Recommended choice: A / B / C / D

Can AI continue now: yes / limited / no

What I need from you:

| Option | What it means | What AI will do | Writes project files? | Risk | When to choose |
|---|---|---|---|---|---|
| A | Continue current task | Treat the message as inside approved scope | Current approved task files only | low/medium | Choose when the message clarifies the active task |
| B | Start a new entry | Create a new request, preflight, or decision record | New workflow record only | low/medium | Choose when the message changes scope |
| C | Stop for human decision | Pause until the owner chooses direction | No, unless decision record is saved | medium/high | Choose for risk, release, migration, production, or unclear scope |
| D | Discuss only | Answer or clarify without executing | No | low | Choose when the user is only exploring |

Recommended reason:

What happens if you do nothing:

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
