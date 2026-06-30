# Conversation Ask Card

## Human Decision Summary

Conclusion: <what Codex understood in one sentence>

Recommended path: <plain-language next path>

Can Codex change files now: No

What I need from you: <1-3 concise decisions>

What happens if you do nothing: No files are changed. No CI, hooks, documents, task state, release, or production behavior is changed.

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

1. <decision question>

## What Codex Can Do Next

- <safe read-only or plan-first action>

## What Codex Must Not Do Yet

- <forbidden action>

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
