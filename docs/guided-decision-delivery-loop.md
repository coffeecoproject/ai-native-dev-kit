# Guided Decision & Delivery Loop

Guided Decision & Delivery Loop is the user-facing delivery behavior added after Human Decision Summary.

It keeps the workflow from turning into a list of technical questions for the user. Codex should recommend the next safe path, explain the tradeoff in plain language, and ask the user only for decisions they actually own.

## What It Solves

Before this layer, Codex could be safe but still hard to use:

```text
Should we use BL2?
Should this be enum or lookup?
Should I create a permission model?
Should I run init or adapter mode?
```

After this layer, Codex should lead with:

```text
I recommend the smallest safe first slice.
Here is what it includes.
Here is what it excludes.
Here is what I can do after you confirm.
Here is what I must not do without a separate decision.
```

## User Role

The user decides:

- goal
- priority
- product/business tradeoff
- whether the recommended first slice is right
- risk acceptance when they are accountable
- who must review expert or high-risk decisions
- final approval for launch, release, production, or handoff

The user should not be forced to answer raw technical implementation questions when Codex can recommend a safe default.

## Codex Role

Codex should:

- classify the current request
- keep one current mainline visible
- recommend the smallest safe path
- park side ideas instead of losing or executing them
- translate technical choices into understandable options
- create decision briefs for expert-risk items
- execute only confirmed and bounded work
- verify, review, report, and recommend the next safe action

## Example

User:

```text
I want to build an appointment mini app.
```

Better Codex response:

```text
I recommend first building a demo appointment loop: service list, appointment form, and appointment records.
Payment, production release, SMS, and complex role permissions should stay out of scope for this first slice.

If you confirm this direction, I can create the request/spec/eval/task chain and implement only that first slice.
```

This keeps the human decision simple:

```text
Is this first slice the right product direction?
```

Codex handles the workflow mechanics after confirmation.

## When To Create Artifacts

Use `active-work-thread` when:

- conversation is broad
- the user mixes current work with future ideas
- there are several parked items
- the current mainline needs to stay visible across turns

Use `guided-decision-summary` when:

- the user needs to choose between product/effort/risk paths
- a technical choice needs translation into human meaning
- Codex recommends a default but needs confirmation
- an expert or accountable owner decision is needed

Do not create these artifacts for every tiny task.

## Commands

```bash
node scripts/new-workflow-item.mjs --type active-work-thread --name first-slice
node scripts/new-workflow-item.mjs --type guided-decision-summary --name status-model
```

These commands create optional artifacts. They do not approve implementation and do not replace request/spec/eval/task, Review Loop, Goal Mode, or Safe Launch.

## Boundaries

This layer does not:

- approve production launch
- approve release or customer promise
- approve payment, privacy, security, legal, tax, or compliance decisions
- approve database migration or destructive operations
- approve target-project writes in governed or production-sensitive projects
- weaken patch classification
- make BL2 or industrial packs default
- turn parking-lot items into approved backlog

## Related Files

- `core/decision-delegation-boundary.md`
- `core/guided-delivery-loop.md`
- `core/output-protocol.md`
- `core/conversation-drift-control.md`
- `core/first-delivery-walkthrough.md`
- `templates/active-work-thread.md`
- `templates/guided-decision-summary.md`
- `prompts/delivery-coach-agent.md`
