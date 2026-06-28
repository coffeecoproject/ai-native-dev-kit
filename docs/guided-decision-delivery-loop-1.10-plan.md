# Guided Decision & Delivery Loop 1.10 Plan

## Human Summary

This plan calibrates AI Native Dev Kit after the 1.9 Human Decision Summary upgrade. 1.9 makes recommendations easier to read. 1.10 should make Codex better at guiding non-expert users through delivery without pushing professional technical judgment back onto them.

The theme is:

```text
Users decide goals, priorities, tradeoffs, risk acceptance, and final approval.
Codex analyzes, recommends, explains consequences, executes approved work, verifies, reviews, and keeps the current delivery thread moving.
```

This is an experience-layer upgrade, not a new heavy governance layer.

## Current Repository Readback

The current mainline is at 1.9.0 in the working tree.

Current major capabilities already exist:

- `start`: read-only project adoption classification.
- `baseline`: read-only engineering/environment baseline recommendation.
- Goal Mode: routes discuss, adopt, define, implement, review, repair, baseline decision, and handoff/report work.
- Output Experience / Human Decision Summary: puts recommendation, alternatives, risk, file-write impact, and no-decision outcome before technical fields.
- Conversation Drift Control: prevents discussion, scope changes, new tasks, direct follow-ups, and risk decisions from silently becoming current-task execution.
- Review Loop: handles task-level review, deterministic AUTO_FIX repair, re-review, and human-decision routing.
- Next-Step Boundary: classifies follow-up suggestions as in-scope, direct follow-up, risk decision, out-of-scope observation, or do-not-proceed.
- Context Governance: prevents unconfirmed observations from becoming project truth.
- Safe Launch: classifies delivery readiness without approving production launch.
- First Delivery Walkthrough: simulates or records a first slice from human idea to bounded delivery recommendation.
- Real Adoption / Patch Classification: keeps real governed projects read-only by default and classifies repair scale before non-trivial patching.

Current gap:

```text
The kit is strong at safety, boundaries, checks, and readable recommendations.
It is not yet explicit enough about how Codex should continuously guide a non-expert user from messy intent to the next smallest deliverable.
```

## Problem

The phrase "Humans decide" can be misread.

Correct meaning:

```text
Humans decide goals, priorities, business tradeoffs, risk acceptance, and final approval.
```

Wrong meaning:

```text
Humans must answer every professional technical question Codex encounters.
```

This wrong meaning is especially harmful for users with weak engineering background. They may not know whether a project needs enum, lookup tables, state machines, BL2, a permission model, release review, or production rollback. If Codex simply asks them to choose, the workflow becomes safe-looking but still burdensome and confusing.

The desired behavior is:

```text
User expresses a goal naturally.
Codex translates it into a current mainline.
Codex recommends the smallest safe path.
Codex parks side ideas instead of losing them or implementing them immediately.
Codex escalates expert-risk decisions without forcing the user to guess.
Codex executes the confirmed slice, verifies it, reviews it, updates the thread, and recommends the next safe step.
```

## Upgrade Name

Version theme:

```text
1.10.0 Guided Decision & Delivery Loop
```

Chinese name:

```text
引导式决策与交付循环
```

Positioning:

```text
Experience and routing upgrade on top of existing workflow assets.
```

## Non-Goals

1.10 must not:

- replace 1.9 Human Decision Summary
- add automatic GPT/API review hooks
- auto-scan real target projects
- approve target-project writes
- weaken governed-project read-only protection
- weaken patch classification
- make BL2 or industrial packs default
- make every project create heavy artifacts
- create a new mandatory gate for every low-risk task
- let Codex decide business direction for the user
- let Codex approve release, risk, production, payment, privacy, migration, or compliance
- turn parking-lot items into execution permission

## Product Principle

The next product principle should be added to the kit:

```text
Codex should not push professional judgment back to the user as raw technical choices.
Codex should analyze, recommend, explain consequences, and ask the user only for decisions they actually own.
```

This complements 1.9:

| Version | Main improvement | Remaining gap |
|---|---|---|
| 1.9 | Recommendations are decision-readable | Users may still be asked to confirm too many expert-level decisions |
| 1.10 | Decisions are delegated to the right owner | Needs future real-project calibration |

## Decision Delegation Boundary

Add a new core concept:

```text
Decision Delegation Boundary
中文：决策委托边界
```

It defines which decisions Codex may handle, which decisions Codex may recommend, which decisions humans own, which require expert review, and which are not allowed in the current task.

### D0: AI Can Handle Directly

Use D0 for deterministic, low-risk work already inside approved scope.

Examples:

- fix typos
- fill missing evidence refs
- repair broken documentation links
- run verification commands
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

### D1: AI Recommends A Default, User Confirms Product Direction

Use D1 when the user should not be asked to choose the technical implementation directly, but can confirm the product tendency.

Bad question:

```text
Should we use enum or lookup table?
```

Better question:

```text
Do these statuses need to be configured by operators later, or is a simple fixed first version enough?
I recommend the simple fixed version for the first slice. If status configuration becomes a real product need, we can create a later decision brief.
```

Human role:

```text
Confirm product tendency or preference.
```

Codex behavior:

```text
Translate the human preference into an engineering decision record or task rule.
```

### D2: AI Gives 2-3 Understandable Options And Recommends One

Use D2 when there are multiple valid paths, but they can be explained as product/effort tradeoffs rather than technical jargon.

Example:

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

### D3: Needs Expert Or Accountable Owner Review

Use D3 when a non-expert user should not be forced to guess.

Examples:

- permission model
- payment or value transfer
- production config
- database migration
- architecture change
- privacy, security, compliance
- release or rollback
- real customer promise

Human-facing output should not say:

```text
Do you accept this risk?
```

It should say:

```text
This is a high-risk decision. I can draft a Decision Brief with recommendation, risk, verification, rollback, and the owner/expert needed. I will not execute this inside the current task.
```

Human role:

```text
Identify accountable owner, approve review path, or defer.
```

Codex behavior:

```text
Create Decision Brief / RISK_DECISION / NEEDS_EXPERT_REVIEW and stop implementation.
```

### D4: Do Not Continue

Use D4 when the path is unsafe or invalid under current scope.

Examples:

- bypass permissions
- weaken gates
- change tests to match broken behavior
- deploy to production without approval
- add payment inside a simple demo task
- hide root cause with a local patch

Human-facing output:

```text
This cannot continue as part of the current task.
It needs a new request, decision, approval path, or it should not proceed.
```

Human role:

```text
None inside current task.
```

Codex behavior:

```text
Stop, record boundary, and do not execute.
```

## Guided Delivery Loop

Add a new core concept:

```text
Guided Delivery Loop
中文：引导式交付循环
```

This loop does not replace the existing workflow. It coordinates existing modules around the user's current delivery goal.

Each interaction round follows:

1. Understand
2. Place
3. Recommend
4. Confirm
5. Execute
6. Verify
7. Review
8. Update
9. Continue

### 1. Understand

Codex interprets the user's natural-language message.

It should accept that users may be incomplete, exploratory, or non-linear.

### 2. Place

Codex places the message into one of:

- current mainline
- answer to pending question
- side idea
- direct follow-up
- new task
- risk decision
- discussion only
- pause/stop
- memory/context candidate

This uses existing Conversation Drift Control, but adds a positive placement behavior:

```text
Do not just block drift. Park it, route it, or turn it into the right future entry.
```

### 3. Recommend

Codex recommends the smallest safe path.

It should avoid asking broad professional questions first.

Bad:

```text
Do you want BL0, BL1, or BL2?
Do you want enum or lookup table?
Do you want Review Loop?
```

Better:

```text
I recommend a demo-ready first slice:
- service list
- appointment submission
- appointment records

Do not include payment, production launch, or configurable status workflow yet.
```

### 4. Confirm

Codex asks only for decisions the human owns.

Examples:

- Is this first slice acceptable?
- Is payment intentionally out of scope for now?
- Is the goal demo-ready, internal handoff, or release review?
- Should this side idea be parked as follow-up?

### 5. Execute

Codex executes the confirmed smallest path through existing workflow:

```text
start -> baseline -> request -> preflight -> spec -> eval -> task -> implementation
```

or uses the appropriate already-existing route.

### 6. Verify

Codex runs the relevant verification, records evidence, and avoids claiming readiness without proof.

### 7. Review

Codex uses lightweight self-review for low-risk work and Review Loop when required by task level/risk.

### 8. Update

Codex updates the relevant records:

- final report
- launch readiness
- follow-up proposal
- decision brief
- scope change report
- learning candidate
- context correction
- baseline gap
- parking lot / active work thread

### 9. Continue

Codex recommends one next safe step and keeps side ideas separated from current execution.

## Active Work Thread

Add a new lightweight template:

```text
templates/active-work-thread.md
```

Suggested generated directory:

```text
active-work-threads/
```

This should be optional. It should not be required for every L0 task.

Purpose:

```text
Keep the current mainline clear while allowing the user to think out loud.
```

Suggested fields:

```md
# Active Work Thread: <name>

## Current Mainline

Current goal:

Current minimum slice:

Current delivery target: READY_FOR_DEMO / READY_FOR_INTERNAL_HANDOFF / READY_FOR_RELEASE_REVIEW / not selected

Currently doing:

Current approved scope:

## Latest User Input

Summary:

Placement: current mainline / answer / parking lot / risk decision / new task / discussion / pause

## Mainline Decision

Recommended next action:

Why this is the smallest safe path:

What AI can do now:

What AI will not do now:

## Parking Lot

| Item | Type | Why parked | Re-entry path | Risk |
|---|---|---|---|---|
|  | DIRECT_FOLLOW_UP / RISK_DECISION / NEW_TASK / OUT_OF_SCOPE_OBSERVATION |  | request / decision brief / follow-up proposal / do not proceed |  |

## Decisions Needed

| Decision | Owner | Decision type | Codex recommendation | Status |
|---|---|---|---|---|
|  | human / expert / AI | D0 / D1 / D2 / D3 / D4 |  | pending / confirmed / deferred |

## Loop State

Understand:

Place:

Recommend:

Confirm:

Execute:

Verify:

Review:

Update:

Continue:
```

## Mainline + Parking Lot

Add a new behavior rule:

```text
User ideas are not discarded, but they are not automatically merged into the current task.
```

Mapping:

| User input | Placement | Artifact |
|---|---|---|
| clarifies current work | current mainline | current task / final report |
| adds small adjacent idea | parking lot | follow-up proposal |
| changes deliverable | scope change | scope-change report |
| starts a separate feature | new task | request candidate |
| touches risk | risk decision | decision brief |
| is useful context | context candidate | learning candidate |
| is unsafe | do not proceed | final report / decision brief |

This changes the user experience:

```text
The user can be messy.
Codex stays organized.
```

## Guided Decision Support

Add a new template:

```text
templates/guided-decision-summary.md
```

This is not the same as `templates/decision-brief.md`.

Use `guided-decision-summary` for user-facing, low-to-medium risk choice framing.

Use `decision-brief` for formal risk, architecture, migration, production, payment, privacy, security, or expert-owner decisions.

Suggested shape:

```md
# Guided Decision Summary: <name>

## Recommendation

I recommend:

Why:

Delivery target:

## What We Should Do Now

-

## What We Should Not Do Now

-

## Options

| Option | Plain meaning | Cost | Risk | Delivery impact | Recommended |
|---|---|---|---|---|---|
| A |  | low / medium / high | low / medium / high |  | Yes / No |

## Human Choice Needed

Question:

Recommended answer:

What happens if you choose this:

What happens if you do nothing:

## Technical Translation

If confirmed, Codex will translate this into:

- request / spec / eval / task
- engineering baseline note
- decision brief
- follow-up proposal
- parking lot item
```

## Delivery Coach Agent

Add a new prompt:

```text
prompts/delivery-coach-agent.md
```

Role:

```text
Help non-expert users move from natural-language intent to the next smallest safe deliverable.
```

It should:

- maintain the current mainline
- classify side ideas without losing them
- recommend the smallest safe path
- avoid raw expert questions
- translate product preference into workflow artifacts
- route D3 decisions to Decision Brief / expert review
- keep delivery target visible
- keep the user answering only goal, tradeoff, priority, risk, and final approval questions

It must not:

- implement code directly
- approve risk
- approve release
- override existing workflow gates
- turn parked ideas into current scope
- create active automations or Skills
- call external GPT/API reviewers

## Existing Files To Update In Execution Phase

### Core

Update:

- `core/outcome-baseline.md`
- `core/conversation-drift-control.md`
- `core/first-delivery-walkthrough.md`
- `core/output-protocol.md`
- `core/goal-mode.md`
- `core/next-step-boundary.md`

Add:

- `core/decision-delegation-boundary.md`
- `core/guided-delivery-loop.md`

### Templates

Add:

- `templates/active-work-thread.md`
- `templates/guided-decision-summary.md`

Update:

- `templates/conversation-turn-classification.md`
- `templates/scope-change-report.md`
- `templates/follow-up-proposal.md`
- `templates/decision-brief.md`
- `templates/adoption-trial-report.md`
- `templates/final-report.md`
- `templates/launch-readiness-report.md`
- `templates/goal-card.md`

### Prompts

Add:

- `prompts/delivery-coach-agent.md`

Update:

- `prompts/goal-planner-agent.md`
- `prompts/conversation-router-agent.md`
- `prompts/walkthrough-agent.md`
- `prompts/project-onboarding-agent.md`
- `prompts/reporter-agent.md`
- `prompts/spec-agent.md`
- `prompts/preflight-agent.md`
- `prompts/builder-agent.md`

### Scripts

First execution phase should avoid a heavy checker.

Add only if needed:

- `scripts/check-guided-delivery-loop.mjs`

Preferred first implementation:

- extend `new-workflow-item.mjs` with optional item types:
  - `active-work-thread`
  - `guided-decision-summary`
- extend `check-dev-kit.mjs` to verify required assets exist and prompts include key terms
- do not require every project to create active-work-thread artifacts

### Docs

Add:

- `docs/guided-decision-delivery-loop.md`

Update:

- `docs/quickstart.md`
- `docs/codex-usage.md`
- `docs/operator-manual.md`
- `docs/mental-model.md`
- `docs/first-delivery-walkthrough.md`
- `docs/conversation-drift-control.md`
- `docs/reference/artifacts.md`
- `docs/reference/checkers.md`

### Examples

Add a lightweight example:

```text
examples/1.10-guided-decision-delivery-loop/
```

Scenario:

```text
User wants a booking mini app.
User later mentions payment, configurable status, and SMS.
Codex keeps appointment submission as the current mainline.
Payment becomes RISK_DECISION.
Configurable status becomes DIRECT_FOLLOW_UP.
SMS becomes DIRECT_FOLLOW_UP or parking lot.
Final delivery target remains READY_FOR_DEMO.
```

## User Interaction Model

### Example: Booking Mini App

User:

```text
I want to make a booking mini app.
```

Codex should not start with:

```text
Do you want BL0, BL1, BL2?
Do you want enum or lookup?
Do you want Review Loop?
```

Codex should say:

```text
I recommend a first demo-ready slice:

1. service list
2. appointment submission
3. appointment record view

Do not include payment, production launch, complex workflow status, SMS, or operator-configured statuses yet.

You only need to confirm:
- Is this first slice acceptable?
- Is payment intentionally out of scope for the first version?

If yes, I will translate this into request/spec/eval/task and keep the other ideas in the parking lot.
```

### Example: Status Model

Bad:

```text
Should I use enum or lookup table?
```

Good:

```text
For the first version, I recommend simple fixed statuses because they are faster and easier to verify.

Choose A if statuses do not need operator configuration now.
Choose B if status transitions matter soon.
Choose C only if operators must configure statuses from the admin side.

My recommendation is A for the first demo slice.
```

### Example: Payment Mentioned Mid-task

User:

```text
Can we also add payment?
```

Codex:

```text
Payment is not part of the current demo slice and touches value-transfer risk.
I will not add it to the current task.

I recommend:
- keep current mainline: appointment submission demo
- park payment as RISK_DECISION
- create a Decision Brief later if you want to explore it
```

## Interaction Rules

### Rule 1: Recommend Before Asking

Codex should not ask the user to choose from raw professional terms when it can first make a safe recommendation.

### Rule 2: Ask Fewer, Better Questions

Ask only questions that affect:

- goal
- priority
- first slice
- business tradeoff
- risk acceptance
- delivery target
- final approval

### Rule 3: Keep Current Mainline Visible

Every delivery loop output should be able to answer:

- What are we currently trying to deliver?
- What is the smallest current slice?
- What are we not doing now?
- What got parked?
- What is the next safe action?

### Rule 4: Side Ideas Are Not Lost

Parking lot items must have a re-entry path.

### Rule 5: Expert Decisions Are Not Dumped On Non-experts

If a decision requires expert/accountable-owner review, Codex should draft the decision support artifact and stop.

### Rule 6: Delivery Target Is Explicit

Use Safe Launch states:

- `READY_FOR_DEMO`
- `READY_FOR_INTERNAL_HANDOFF`
- `READY_FOR_RELEASE_REVIEW`
- `NOT_READY`
- `BLOCKED`

The first slice for weak-background users should usually target `READY_FOR_DEMO`, not production.

## Proposed 1.10 Implementation Phases

### Phase 1: Plan And Product Boundary

Files:

- `docs/guided-decision-delivery-loop-1.10-plan.md`

Goal:

```text
Agree on direction before implementation.
```

### Phase 2: Core Protocols

Files:

- `core/decision-delegation-boundary.md`
- `core/guided-delivery-loop.md`
- updates to `core/outcome-baseline.md`
- updates to `core/conversation-drift-control.md`
- updates to `core/first-delivery-walkthrough.md`

Goal:

```text
Define the new behavior without adding heavy enforcement.
```

### Phase 3: Templates And Prompts

Files:

- `templates/active-work-thread.md`
- `templates/guided-decision-summary.md`
- `prompts/delivery-coach-agent.md`
- updates to existing routing/reporting prompts

Goal:

```text
Give Codex concrete language and artifacts for the new behavior.
```

### Phase 4: Light Script Support

Files:

- `scripts/new-workflow-item.mjs`
- `scripts/check-dev-kit.mjs`
- `dev-kit-manifest.json`

Optional:

- `scripts/check-guided-delivery-loop.mjs`

Goal:

```text
Let teams create optional artifacts and verify asset presence without forcing every project through a new gate.
```

### Phase 5: Docs And Example

Files:

- `docs/guided-decision-delivery-loop.md`
- docs usage updates
- `examples/1.10-guided-decision-delivery-loop/`

Goal:

```text
Make the behavior understandable and test it with a realistic messy-user scenario.
```

### Phase 6: Release Evidence

Files:

- `requests/200-guided-decision-delivery-loop.md`
- `preflight/200-guided-decision-delivery-loop.md`
- `specs/200-guided-decision-delivery-loop.md`
- `evals/200-guided-decision-delivery-loop.md`
- `tasks/200-guided-decision-delivery-loop.md`
- `final-reports/200-guided-decision-delivery-loop.md`
- `releases/1.10.0/`

Goal:

```text
Record the upgrade as formal product behavior, not ad hoc wording.
```

## Acceptance Criteria

1. Non-expert user guidance is explicit.
2. Human responsibilities are narrowed to goals, priorities, tradeoffs, risk acceptance, and final approval.
3. D0-D4 decision delegation is documented.
4. Current mainline and parking lot behavior is documented.
5. Conversation Drift Control routes side ideas without losing them.
6. First Delivery Walkthrough emphasizes minimum deliverable and readiness target.
7. Delivery Coach prompt exists and does not implement directly.
8. Optional active-work-thread and guided-decision-summary templates exist.
9. Existing safety boundaries remain intact.
10. Full dev-kit self-check passes after implementation.

## Verification Plan

During implementation, run:

```bash
node --check scripts/new-workflow-item.mjs
node scripts/check-manifest.mjs
node scripts/check-product-baseline.mjs .
node scripts/check-claim-control.mjs .
node scripts/check-conversation-drift.mjs .
node scripts/check-first-delivery-walkthrough.mjs .
node scripts/check-dev-kit.mjs
git diff --check
```

If a new checker is added:

```bash
node --check scripts/check-guided-delivery-loop.mjs
node scripts/check-guided-delivery-loop.mjs .
node scripts/check-fixtures.mjs
```

## Risks

### Risk: Too Many New Artifacts

Mitigation:

- Make Active Work Thread optional.
- Make Guided Decision Summary optional.
- Do not fail empty projects.
- Add checker later only if repeated drift appears.

### Risk: Codex Over-directs Product Direction

Mitigation:

- Codex recommends path, but user owns product goal and tradeoff.
- Use "I recommend" and "If confirmed" language.
- Keep alternatives visible.

### Risk: Parking Lot Becomes Backlog Bloat

Mitigation:

- Each parked item needs type, reason, and re-entry path.
- Do not turn parking lot into an implementation backlog automatically.

### Risk: Expert Decisions Still Get Dumped On User

Mitigation:

- D3 explicitly says to generate Decision Brief / expert-owner review.
- Do not ask weak users to approve technical risk directly.

## Claim Boundary

Allowed claim:

```text
1.10 improves how Codex guides non-expert users through the next safe delivery step.
```

Forbidden claims:

- "AI can decide all technical questions."
- "Users no longer need to approve risk."
- "The kit guarantees correct product decisions."
- "The kit can safely continue through payment, production, migration, or release decisions without expert review."
- "Parking lot items are approved backlog."

## Summary

1.9 makes output decision-ready.

1.10 should make the whole delivery loop user-friendly:

```text
User can speak naturally.
Codex keeps the mainline clear.
Codex recommends the smallest safe deliverable.
Codex parks side ideas.
Codex escalates expert-risk decisions.
Codex executes only confirmed work.
Codex verifies, reviews, updates, and continues.
```

This is the next logical productization layer for AI Native Dev Kit.
