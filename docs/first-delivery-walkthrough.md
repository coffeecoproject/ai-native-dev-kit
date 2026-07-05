# First Delivery Walkthrough

First Delivery Walkthrough shows how the IntentOS workflow behaves from the first user sentence to a bounded delivery recommendation.

Use it when a user says something like:

```text
I want to build a booking app.
```

Codex should not ask the user to understand every workflow file first. Codex should route the work, propose a lightweight path, ask only the necessary decisions, and record the evidence.

## What It Proves

It proves whether the workflow can guide a first slice without forcing the human to operate the process manually.

It does not prove production readiness.

## Minimal Path

For a low-risk first slice:

```text
start
-> baseline
-> request
-> spec
-> eval
-> task
-> verify
-> final-report
-> launch-readiness
```

Use heavier artifacts only when needed:

| Situation | Add |
|---|---|
| broad or ambiguous goal | Goal Card |
| helper agents are used | Subagent Run Plan |
| independent review is needed | Review Packet / Review Loop Report |
| user changes scope mid-task | Conversation Turn Classification / Scope Change Report |
| delivery status is claimed | Launch Readiness Report |
| trial needs product evidence | Adoption Trial Report |

## Example

See:

```text
examples/1.7-first-delivery-walkthrough/
```

The example simulates a basic booking mini app first slice. It shows:

- user starts with one simple idea
- Codex recommends `BL0_LIGHTWEIGHT`
- Codex creates first-slice artifacts
- payment is treated as a scope change, not silently added
- final state is `READY_FOR_DEMO`
- production launch is not approved

## Check

```bash
node scripts/check-first-delivery-walkthrough.mjs .
```

Or through the CLI:

```bash
node scripts/cli.mjs first-delivery .
```

## Real Project Trials

For real projects, create an Adoption Trial Report:

```bash
node scripts/new-workflow-item.mjs --type adoption-trial-report --name first-slice
```

Record:

- whether Codex selected the right path
- whether the human only made decisions and confirmations
- whether too many files were created
- whether scope drift was caught
- whether delivery readiness was clear
- what evidence was real and what was simulated

## Boundary

This layer is a walkthrough and evidence capture layer. It does not approve release, production launch, legal, compliance, payment, privacy, security, migration, or customer promises.
