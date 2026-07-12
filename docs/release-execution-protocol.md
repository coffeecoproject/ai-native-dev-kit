# Release Execution Protocol

Release Execution Protocol is the derived consumer after the strict release
trust chain. Launch Review View remains an explanatory input; it is not release
authority.

In plain language:

```text
1.55 answers: can this enter launch review?
1.93 answers: does one current human approval match this exact project,
candidate, target, package, and strict release evidence chain?
```

It does not mean technical readiness automatically publishes or deploys. After
the exact current-user consent and every strict gate pass, Codex may execute the
approved action only when the project release protocol and available provider
access allow it.

From 1.61 onward, Release Execution should consume a Release Handoff Pack when one exists. The handoff pack owns release owner, approval, rollback, monitoring, smoke, and responsibility facts. Release Execution remains a plan-only layer and should not create a second source of truth.

## How To Use

Generate a release execution plan:

```bash
node scripts/cli.mjs release-execution . \
  --intent "prepare release execution" \
  --mode PLAN_ONLY
```

Check recorded plans:

```bash
node scripts/cli.mjs release-execution-check .
```

After the current user consents to the exact concrete effect, record that
consent as a structured approval (using `CURRENT_CONVERSATION_USER` when
appropriate) and provide that
Release Approval Record:

```bash
node scripts/cli.mjs release-execution . \
  --approval-ref release-approval-records/001-release.md \
  --mode ASSISTED_EXECUTION
```

Check the approval authority before planning execution:

```bash
node scripts/cli.mjs release-approval-check . \
  --report release-approval-records/001-release.md \
  --require-structured-evidence \
  --require-approved
```

Free-form approval text and `--approval-status APPROVED` do not authorize
release execution.

## What It Produces

A Release Execution Plan tells the user:

- whether the exact Release Approval Record is current and valid
- whether Release Evidence Gate, Runtime Hygiene, Release Channel Policy, and
  required platform handoff evidence all still pass
- which mode is allowed
- which steps Codex may help with
- which concrete external effects still need current-user consent
- what evidence must be captured
- what must happen after release

## Modes

| Mode | Meaning |
|---|---|
| `PLAN_ONLY` | Safe default. Codex only prepares a plan. |
| `HUMAN_EXECUTION_HANDOFF` | Existing release system executes the approved action. |
| `ASSISTED_EXECUTION` | Codex may execute only approved local verification, build, packaging, evidence, and read-only smoke actions. External release effects stay with the current user or existing release system. |
| `BLOCKED` | Required release-review or approval evidence is missing. |

## Hard Boundary

Even with current-user consent, Codex must stop before:

- production deployment when the approval or project policy does not explicitly allow the exact Codex action
- app-store / mini-program / Play Store submission that is outside the approved provider action
- database migrations without verified backup and rollback
- production secrets, DNS, payment, permissions, or config changes outside the exact consented scope
- release rollback risk acceptance
- legal, tax, security, privacy, compliance, or finance decisions

## Good Outcome

A good Release Execution Plan should let a non-technical user understand:

```text
What can happen now?
What will Codex do, and what must an existing external system do?
What proof do we need?
Where must Codex stop?
```

If the previous step says `READY_FOR_HANDOFF_REVIEW`, that means ready for
handoff review, not release approval. A passing Release Approval Record still
does not execute or guarantee production release.
