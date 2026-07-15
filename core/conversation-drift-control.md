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
| `RISK_DECISION` | The user mentions risk, release, production, payment, privacy, security, migration, or an irreversible operation. Codex selects the technical review path and asks only for a permitted missing input or exact prepared consent. |
| `PAUSE_OR_STOP` | The user asks Codex to pause, stop, or only report. |
| `REVIEW_ONLY` | The user asks Codex to inspect, review, or discuss without edits. |
| `MEMORY_CANDIDATE` | The message may become future project memory after approval. |
| `OUT_OF_SCOPE_OBSERVATION` | Useful observation, not part of current task. |

## Current Task Continuation Rules

Codex may continue the current task only when:

- the message is `ANSWER_TO_PENDING_QUESTION` or `CONTINUE_CURRENT_TASK`
- the scope did not change
- no unresolved technical gate or permitted user input blocks the dependent action
- the active task is still valid

Codex must not continue when:

- intent is `DISCUSS_ONLY`
- intent is `REVIEW_ONLY`
- intent is `PAUSE_OR_STOP`
- intent is `SCOPE_CHANGE`
- intent is `NEW_TASK`
- intent is `DIRECT_FOLLOW_UP`
- intent is `RISK_DECISION`

## Mainline And Parking Lot

When a user message contains useful but non-current work, Codex should preserve it without executing it.

Use this placement:

| Bucket | Meaning | Can AI execute now? |
|---|---|---|
| Current Mainline | The approved work currently being pursued | Yes, if all current-task rules are satisfied |
| Parking Lot | Useful future or side idea | No |
| Decision Needed | Human or expert decision blocking progress | No until decided |
| Stop Item | Unsafe or invalid under current scope | No |

Parking-lot items must not become implementation scope unless they re-enter through a request, follow-up proposal, decision brief, or approved task.

## Scope Change Reports

Create a Scope Change Report when:

- the requested change affects deliverables
- task level may change
- new platform, baseline, dependency, permission, payment, privacy, migration, or release risk appears
- the new request competes with the current task

## Responsibility Boundary

Codex determines how to route the turn, preserve the current task, classify
technical risk, and maintain memory candidates. The user supplies a business
priority when two valid product outcomes conflict, may pause/cancel work, and
may consent to an exact prepared launch or release effect. Technical scope,
risk treatment, task mechanics, and memory promotion remain Codex-owned and
evidence-bound.

## Artifact Use

Use `conversation-turns/<id>.md` for ambiguous or high-impact turns.

Use `scope-change-reports/<id>.md` when a scope change is proposed.

Use `active-work-threads/<id>.md` when broad conversation or repeated drift makes the current mainline hard to track.

For tiny unambiguous turns, Codex can classify internally and continue, but final reports should still mention meaningful drift decisions.
