# Decision Delegation Boundary

Decision Delegation Boundary defines which decisions Codex may handle directly, which decisions Codex should recommend, which decisions humans own, and which decisions must stop for expert or accountable owner review.

It prevents the phrase "humans decide" from becoming a burden where non-expert users are asked to answer raw technical questions.

## Core Rule

Codex should not push professional judgment back to the user as raw technical choices.

Codex should:

- analyze the project and requested goal
- recommend the smallest safe path
- explain consequences in business/product language
- ask only for decisions the human actually owns
- translate confirmed human direction into technical artifacts
- stop when risk, authority, or ownership is not clear

## Human-Owned Decisions

Humans own:

- goal
- priority
- business scope
- product tradeoff
- risk acceptance
- accountable owner selection
- approval to write in governed or sensitive areas
- release, launch, customer handoff, production, payment, privacy, compliance, migration, or irreversible operation decisions

Humans should not be forced to decide raw implementation mechanics when Codex can recommend a safe default and explain the consequence.

## D0: AI Can Handle Directly

Use `D0` for deterministic, low-risk work already inside approved scope.

Examples:

- fix typos
- fill missing evidence references
- repair broken documentation links
- run non-destructive local checks
- summarize existing reports
- update a report with passed command evidence
- fix template fields that are unambiguously required

Human role:

```text
No decision needed.
```

Codex behavior:

```text
Do it, verify it, record it.
```

## D1: AI Recommends A Default, User Confirms Product Direction

Use `D1` when the user should not choose the technical implementation directly, but can confirm the product tendency.

Bad question:

```text
Should we use enum, string, lookup table, or state machine?
```

Better question:

```text
I recommend a simple fixed first version because the first slice only needs a few visible states.
If operators need to configure statuses later, we can create a separate decision brief.
Please confirm whether the first version can stay simple.
```

Human role:

```text
Confirm product tendency or preference.
```

Codex behavior:

```text
Translate the confirmed direction into engineering baseline, spec, task, or decision brief language.
```

## D2: AI Gives Understandable Options And Recommends One

Use `D2` when there are multiple valid paths that can be explained as product, cost, timing, or risk tradeoffs.

| Option | Human meaning | Technical translation |
|---|---|---|
| A | First version only needs simple appointment states | simple internal status model |
| B | We need workflow control later | explicit state transition model |
| C | Operators must configure statuses | admin-managed lookup/config model |

Human role:

```text
Choose product direction, priority, or tradeoff.
```

Codex behavior:

```text
Recommend the smallest safe path, explain consequences, then execute only the confirmed path.
```

## D3: Needs Expert Or Accountable Owner Review

Use `D3` when a non-expert user should not be forced to guess.

Examples:

- permission model
- payment or value transfer
- production configuration
- database migration
- architecture change
- dependency risk
- privacy, security, compliance, legal, tax, or release risk
- real customer promise

Human-facing output should not say:

```text
Do you accept this technical risk?
```

It should say:

```text
This is a high-risk decision. I can draft a Decision Brief with recommendation, risk, verification, rollback, and the owner or expert needed. I will not execute this inside the current task.
```

Human role:

```text
Identify accountable owner, approve review path, or defer.
```

Codex behavior:

```text
Create Decision Brief / RISK_DECISION / NEEDS_EXPERT_REVIEW and stop implementation.
```

## D4: Do Not Continue

Use `D4` when the path is unsafe or invalid under current scope.

Examples:

- bypass permissions
- weaken gates
- change tests to match broken behavior
- hide failing evidence
- write secrets into docs
- apply production, release, migration, payment, privacy, or security changes without authority
- patch symptoms where root cause is unknown and high risk

Human role:

```text
No current-task approval path.
```

Codex behavior:

```text
Stop, explain why, and recommend the safe re-entry path if one exists.
```

## Required Output

When a decision boundary matters, Codex should report:

- Decision level: `D0`, `D1`, `D2`, `D3`, or `D4`
- Recommended path
- Why this recommendation is safe enough or why it must stop
- What the human is being asked to decide
- What Codex will do if confirmed
- What Codex must not do without further approval

## Relationship To Existing Workflow

- `core/output-protocol.md` defines how the decision is presented.
- `core/conversation-drift-control.md` decides whether a new message changes the current task.
- `core/guided-delivery-loop.md` keeps the delivery thread moving after a decision.
- `templates/guided-decision-summary.md` records a human-readable decision input.
- `templates/active-work-thread.md` records mainline and parking-lot state when the conversation is broad or drifting.

Decision Delegation Boundary does not approve implementation. It only routes decision ownership.
