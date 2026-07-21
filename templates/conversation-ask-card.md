# Conversation Ask Card

## Human Decision Summary

Compatibility heading: semantically this is the bounded `User Input Summary`; it grants no technical decision authority.

Conclusion: <what bounded input, if any, is missing>

User input class: NO_USER_ACTION / BUSINESS_FACT_NEEDED / REAL_WORLD_CONSENT_NEEDED / EXTERNAL_FACT_NEEDED

User input needed now: Yes / No

Plain-language question or exact consent request, if needed: <question or none>

Why available evidence cannot answer it: <reason or none>

What happens if you do nothing: No action occurs.

## Codex Decision And Evidence

Conclusion: <what Codex understood in one sentence>

Selected path: <plain-language next path>

Can Codex continue now: yes / limited / no

Scope, risk, verification, review, and recovery evidence: <summary and refs>

## User Goal

<the user's natural-language goal>

## Trigger Classification

Trigger: CONVERSATION_NATIVE_ASK

Reason: <why this should enter Beginner Entry from conversation>

## What I Understood

<plain summary of the user's goal and project state>

## Recommended Path

<plain path, no internal workflow command burden>

## What I Need From You

User input class: NO_USER_ACTION / BUSINESS_FACT_NEEDED / REAL_WORLD_CONSENT_NEEDED / EXTERNAL_FACT_NEEDED

Exact question or prepared effect, if needed: <question or none>

## What Codex Can Do Next

- <Codex-selected next action>

## What Codex Must Not Do Yet

- <action blocked by missing evidence, scope, or exact real-world consent>

## Internal Routing

| Field | Value |
|---|---|
| Beginner Entry equivalent | yes/no |
| Technical evidence available | yes/no |
| Durable artifact needed | yes/no |

## Boundary

- This conversation ask writes target files: No
- This conversation ask authorizes apply: No
- This conversation ask approves implementation: No
- This conversation ask approves release or production: No
- This conversation ask modifies CI or hooks: No
- This conversation ask deletes, archives, or rewrites documents: No
- This conversation ask changes task state: No
- This conversation ask enables baseline or industrial packs: No
- This conversation ask approves high-risk decisions: No
- This conversation ask requires the user to run CLI commands first: No

## Outcome

`ENTRY_ROUTED`
