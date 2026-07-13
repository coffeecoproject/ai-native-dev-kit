# Decision Delegation Boundary

Decision Delegation Boundary defines which inputs belong to the user and how Codex resolves technical decisions, independent review, blocked evidence, and real-world effects.

It prevents the phrase "humans decide" from becoming a burden where non-expert users are asked to answer raw technical questions.

## Core Rule

Codex should not push professional judgment back to the user as raw technical choices.

Codex should:

- analyze the project and requested goal
- select the smallest safe technical path
- explain consequences in business/product language
- ask only for a business fact, product preference, exact consent to one prepared real-world effect, or an unavailable external fact
- translate business direction into technical artifacts
- choose the stricter internal route when technical risk, authority, or evidence is not clear

## Human-Owned Decisions

The zero-experience solo user owns:

- goal
- priority
- business scope
- product tradeoff
- exact consent to one prepared concrete release, launch, customer, production, payment, external-account, or irreversible operation
- legal, tax, compliance, provider, account, and third-party facts that project evidence cannot prove

The user does not decide architecture, dependencies, Profile, BL, packs,
verification, reviewer, subagent, hooks, migrations, permissions, security,
privacy, release mechanics, rollback, or technical risk treatment.

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

## D1: Codex Selects A Default

Use `D1` when project evidence supports a safe technical default. Codex selects it and continues; no user confirmation is required unless a genuine product preference is missing.

Bad question:

```text
Should we use enum, string, lookup table, or state machine?
```

Better question:

```text
I selected a simple fixed first version because the first slice only needs a few visible states.
If operators later need configurable statuses, I will preserve that as separate scope.
No technical input is needed from you.
```

Human role:

```text
Provide a product preference only when the request and project evidence do not establish it.
```

Codex behavior:

```text
Translate the selected direction into engineering baseline, spec, task, or decision brief language and verify it.
```

## D2: Codex Compares Options And Selects One

Use `D2` when multiple technical paths exist. Codex compares them internally and selects the smallest path that satisfies the business goal and evidence.

| Option | Business fit | Technical translation |
|---|---|---|
| A | First version only needs simple appointment states | simple internal status model |
| B | We need workflow control later | explicit state transition model |
| C | Operators must configure statuses | admin-managed lookup/config model |

Human role:

```text
Provide only a missing business priority or product preference; do not choose the implementation mechanism.
```

Codex behavior:

```text
Select the smallest safe path, record the comparison, and execute only within bounded authority.
```

## D3: Needs Independent Technical Review Or External Fact

Use `D3` when Codex must not rely on its first implementation judgment alone.

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
This is high-risk technical work. I will draft a Decision Brief, run an independent reviewer or project-native gate, and require verification and rollback evidence before execution can continue. I will ask you only if a business fact, concrete real-world consent, or external authority fact is missing.
```

Human role:

```text
Provide only the permitted business, consent, or external input when one is missing.
```

Codex behavior:

```text
Create Decision Brief / RISK_DECISION / independent review and keep implementation blocked until evidence closes the gate.
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
- User input class and the one plain question, if any
- What Codex will do next
- What Codex must not do without evidence, bounded authority, or exact real-world consent

## Relationship To Existing Workflow

- `core/output-protocol.md` defines how the decision is presented.
- `core/conversation-drift-control.md` decides whether a new message changes the current task.
- `core/guided-delivery-loop.md` keeps the delivery thread moving after a decision.
- `templates/guided-decision-summary.md` records a human-readable decision input.
- `templates/active-work-thread.md` records mainline and parking-lot state when the conversation is broad or drifting.

Decision Delegation Boundary does not approve implementation. It only routes decision ownership.
