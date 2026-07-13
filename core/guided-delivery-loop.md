# Guided Delivery Loop

Guided Delivery Loop defines how Codex should move a user from a natural-language idea to a bounded delivery result without forcing the user to manage workflow mechanics.

It is an experience layer over existing IntentOS workflow assets. It does not create new approval authority, does not auto-scan real projects, and does not make every task create new artifacts.

## Core Rule

Codex should keep one clear current mainline.

Side ideas, future work, unclear decisions, and high-risk requests should be parked, routed, or escalated instead of silently changing the current task.

## Loop Steps

### 1. Understand

Restate the user's goal in plain language.

Codex should identify:

- desired outcome
- likely platform or project type
- current project state when known
- obvious exclusions
- risk-sensitive surfaces

### 2. Place

Classify the request into the existing workflow:

- discussion only
- project adoption
- baseline setup
- first-slice definition
- implementation task
- review / repair
- launch readiness
- handoff / report
- risk decision

Use Goal Mode and Conversation Drift Control when routing is ambiguous.

### 3. Recommend

Select the smallest safe technical path before asking the user for any missing business or real-world input.

The recommendation should include:

- what to do now
- what not to do now
- why this is the smallest safe path
- what files may be written
- what remains parked
- what requires independent technical review or unavailable external authority

### 4. Obtain Permitted User Input

Ask only when a business fact, product preference, prepared concrete real-world effect, or unavailable external fact cannot be resolved from project evidence.

Good confirmation:

```text
I selected the first demo slice from your request: service list, appointment submission, and appointment records.
Payment, production release, and complex role permission stay out of scope.
No technical input is needed. Tell me only if that business scope is not what you meant.
```

Bad confirmation:

```text
Should I use BL2, state machine, lookup table, permission matrix, and release readiness?
```

### 5. Execute

Execute only bounded work that matches the current business request and verified authority.

Execution must follow existing artifacts when required:

- request
- preflight
- spec
- eval
- task
- engineering/environment baseline
- review loop
- patch classification
- launch readiness

### 6. Verify

Run risk-matched verification.

Record:

- commands run
- evidence refs
- not-applicable reasons
- missing evidence
- residual risks

### 7. Review

Review current work before claiming closure.

Use Review Loop for L2/L3 work, non-trivial repairs, high-risk surfaces, or when independent review is requested.

### 8. Update

Update the current thread:

- current mainline
- completed work
- parked items
- decisions made
- decisions still needed
- next safe action

Use Active Work Thread only when broad conversation, multi-step delivery, or recurring drift makes the mainline hard to track.

### 9. Continue

Recommend the next safe step.

The recommendation must be bounded:

- current task continuation
- direct follow-up
- new request
- decision brief
- parked item
- stop / do not proceed

## Active Work Thread

Active Work Thread is an optional artifact for keeping the mainline visible during long or broad work.

Use it when:

- the user mixes implementation, questions, and future ideas
- the current task has several parked side ideas
- an adoption or first delivery walkthrough spans multiple turns
- Codex needs to explain what is current versus what is deferred

Do not use it for every tiny task.

## Mainline And Parking Lot

| Item | Meaning | Codex behavior |
|---|---|---|
| Current Mainline | The work currently being pursued | Keep visible and bounded |
| Parking Lot | Useful but not current work | Preserve without executing |
| Input Needed | Business fact, exact real-world consent, or external fact blocking progress | Ask one plain question |
| Stop Item | Unsafe or invalid under current scope | Do not continue |

Parking-lot items are not backlog approval. They need a new request, follow-up proposal, decision brief, or task before execution.

## Relationship To Other Core Files

- `core/decision-delegation-boundary.md` decides who owns the decision.
- `core/conversation-drift-control.md` classifies incoming turns.
- `core/goal-mode.md` selects workflow route.
- `core/output-protocol.md` presents the recommendation.
- `core/first-delivery-walkthrough.md` records end-to-end first-slice behavior.
- `core/next-step-boundary.md` keeps follow-up suggestions bounded.

Guided Delivery Loop does not replace these protocols. It coordinates them into a user-facing delivery experience.
