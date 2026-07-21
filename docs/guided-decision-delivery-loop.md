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
Here is what I will do next.
Here is any exact real-world effect that still needs your consent.
```

## User Role

The user supplies only what cannot be derived safely from the project:

- the desired business outcome and priority;
- missing business facts;
- product preferences where several outcomes are genuinely acceptable;
- consent to one prepared, concrete real-world effect such as production
  deployment, paid resource use, real-user notification, or irreversible data
  change;
- external facts that are unavailable to Codex.

The user does not choose architecture, baseline, implementation scope, risk
treatment, reviewer depth, verification strategy, or release readiness. Codex
must resolve those technical judgments from evidence and independent review.

## Codex Role

Codex should:

- classify the current request
- keep one current mainline visible
- recommend the smallest safe path
- park side ideas instead of losing or executing them
- choose technical defaults and explain their business effect when useful
- automatically arrange the required review depth
- execute only task-authorized and bounded work
- verify, review, report, and recommend the next safe action

## Example

User:

```text
I want to build an appointment mini app.
```

Better Codex response:

```text
I will first build a bounded appointment loop: service list, appointment form, and appointment records.
Payment, production release, SMS, and complex role permissions should stay out of scope for this first slice.

I will create the task chain, implement that slice, and verify it. I will ask
only if a missing business rule changes what the product should do.
```

When a genuine product preference is unresolved, the user question stays simple:

```text
Is this first slice the right product direction?
```

Codex handles the workflow mechanics and technical decisions automatically.

## When To Create Artifacts

Use `active-work-thread` when:

- conversation is broad
- the user mixes current work with future ideas
- there are several parked items
- the current mainline needs to stay visible across turns

Use `guided-decision-summary` when:

- the user needs to choose between product/effort/risk paths
- a technical choice needs translation into human meaning
- a business fact, product preference, exact real-world consent, or unavailable
  external fact is needed

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
