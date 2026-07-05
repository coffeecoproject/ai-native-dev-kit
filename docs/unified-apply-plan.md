# Unified Apply Plan

Unified Apply Plan is the safe handoff point between "Codex recommends something" and "Codex may write project files."

It is for situations where the next step may change the project:

- setting up or updating workflow assets
- adding baseline documents
- applying AGENTS.md or PR template governance migration
- turning document archive suggestions into real file moves later
- proposing hook or CI changes
- enabling BL2 / industrial overlays
- connecting IntentOS to an existing governed project

## Plain Meaning

Before Codex writes anything meaningful, it should produce one plan:

```text
Here is what I would change.
Here is why.
Here is what I will not touch.
Here is what needs approval.
Here is how to verify and roll back.
```

The user should not need to inspect many separate technical reports just to decide whether Codex may continue.

## Commands

Generate a read-only apply plan:

```bash
node scripts/cli.mjs apply-plan ../my-project --intent "接入 IntentOS 工作流"
```

Generate a more specific plan:

```bash
node scripts/cli.mjs apply-plan ../my-project \
  --intent "接入已有强治理项目" \
  --action workflow-assets,agents-governance,pr-template-governance \
  --targets ".intentos,AGENTS.md,.github/pull_request_template.md" \
  --from-workflow-map workflow-adoption-maps/001-existing-project.md
```

Check recorded plans:

```bash
node scripts/cli.mjs apply-plan-check .
```

## What It Does

The plan records:

- current apply state
- proposed write actions
- target files or directories
- supporting evidence
- human-only or blocked actions
- preconditions
- backup and rollback plan
- verification plan
- decisions needed from the human
- boundaries

## What It Does Not Do

Unified Apply Plan does not:

- write files
- approve apply
- approve implementation
- approve release or production
- modify CI or hooks
- delete or archive documents
- enable industrial packs
- approve secrets, migrations, payment, legal, security, privacy, or compliance decisions

## When To Use It

Use it after read-only guidance and before any write-capable step.

Typical sequence:

```text
guide / start / workflow-map / baseline-decision
-> unified apply plan
-> controlled apply readiness
-> approval record if a human approves exact action IDs
-> specialized apply command or manual controlled change, if separately authorized
-> verification
-> execution closure
```

For existing governed projects, keep the default mode read-only. The plan should map to existing governance instead of replacing it.

For new projects, the plan may propose standard workflow and baseline assets, but it still does not authorize implementation or release.
