# Conversation Drift Control

Conversation Drift Control keeps Codex aligned with the user's current intent.

It is used when a user message arrives during active work and the message may change the task, risk, or execution boundary.

## Core Rule

Classify before acting.

Codex must decide whether the message is:

- discussion
- an answer to a pending question
- permission to continue the current task
- a scope change
- a new task
- a direct follow-up
- a risk decision
- a pause or stop request
- review-only instruction
- a memory candidate
- an out-of-scope observation

## Intent Types

| Intent | Meaning |
|---|---|
| `DISCUSS_ONLY` | The user wants to talk, clarify, or understand. Do not write files. |
| `ANSWER_TO_PENDING_QUESTION` | The user answered a question Codex asked. Continue only inside the prior approved scope. |
| `CONTINUE_CURRENT_TASK` | The user explicitly continues the active task without changing scope. |
| `SCOPE_CHANGE` | The user adds, removes, or changes work materially. Stop for decision. |
| `NEW_TASK` | The user starts a separate task. Do not fold into the current one silently. |
| `DIRECT_FOLLOW_UP` | A related next step. Suggest or create a new entry, but do not execute inside current task. |
| `RISK_DECISION` | The user mentions or requests a decision on risk, release, production, payment, privacy, security, migration, or irreversible operation. Stop for human decision. |
| `PAUSE_OR_STOP` | The user asks Codex to pause, stop, or only report. |
| `REVIEW_ONLY` | The user asks Codex to inspect, review, or discuss without edits. |
| `MEMORY_CANDIDATE` | The message may become future project memory after approval. |
| `OUT_OF_SCOPE_OBSERVATION` | Useful observation, not part of current task. |

## Current Task Continuation Rules

Codex may continue the current task only when:

- the message is `ANSWER_TO_PENDING_QUESTION` or `CONTINUE_CURRENT_TASK`
- the scope did not change
- no high-risk human decision is required
- the active task is still valid

Codex must not continue when:

- intent is `DISCUSS_ONLY`
- intent is `REVIEW_ONLY`
- intent is `PAUSE_OR_STOP`
- intent is `SCOPE_CHANGE`
- intent is `NEW_TASK`
- intent is `DIRECT_FOLLOW_UP`
- intent is `RISK_DECISION`

## Scope Change Reports

Create a Scope Change Report when:

- the requested change affects deliverables
- task level may change
- new platform, baseline, dependency, permission, payment, privacy, migration, or release risk appears
- the new request competes with the current task

## Human Decision Boundary

Codex may recommend how to route the turn.

Humans decide whether to:

- change scope
- start a new task
- accept risk
- launch or release
- pause or cancel work
- promote a memory candidate

## Artifact Use

Use `conversation-turns/<id>.md` for ambiguous or high-impact turns.

Use `scope-change-reports/<id>.md` when a scope change is proposed.

For tiny unambiguous turns, Codex can classify internally and continue, but final reports should still mention meaningful drift decisions.
