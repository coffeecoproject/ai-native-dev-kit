# Guided Baseline Selection Entry

Guided Baseline Selection is the plain-language entry for choosing project baselines.

Use it when the user gives Codex a project path, Git URL, or project idea and asks Codex to decide how to configure the project.

## What It Produces

It produces a Baseline Decision Card:

```text
baseline-decision-cards/<id>.md
```

The card explains:

- what kind of project Codex thinks this is
- whether the project should start with BL0, BL1, or BL2
- what the current safe action is versus any BL2 candidate target
- which platforms are selected, present but unconfirmed, deferred, or not detected
- which standard baseline packs are recommended
- which industrial packs are only candidates
- which packs are deliberately not selected
- what the human must confirm
- what Codex can safely do next
- what Codex must not do

## Recommended Command

```bash
node scripts/cli.mjs baseline-decision <project>
```

This command is read-only. It prints a decision card and does not write target-project files.

It does not save the card automatically.

If the human wants to keep a record after reading the output, create a draft card explicitly:

```bash
node scripts/new-workflow-item.mjs --type baseline-decision-card --name project-baseline-decision
```

Then copy the reviewed recommendation into the draft and run the checker. Creating the record is still not approval to write target-project files.

To check recorded cards:

```bash
node scripts/cli.mjs baseline-decision-check <project>
```

## How To Use It

For a new project:

```text
Codex reads the idea or empty project.
Codex recommends a platform and baseline level.
The user confirms platform, backend scope, risk, and whether Codex may initialize files.
```

For an existing light project:

```text
Codex reads the existing structure.
Codex recommends the smallest BL0/BL1 gap review.
The user confirms whether Codex may write baseline files.
```

For an existing governed project:

```text
Codex maps existing governance first.
Codex does not run full init or overwrite existing rules by default.
```

For a production-sensitive project:

```text
Codex stays read-only.
Codex recommends adapter-only adoption unless controlled apply is approved.
```

For a dirty worktree:

```text
Codex stops before writes.
The user decides whether to continue read-only, create a plan, or wait.
```

## Human Decisions

The user should only need to answer decision questions, such as:

- Is this already serving real users?
- Does this include backend/API/database work?
- Does this include permission, payment, finance, HR, tax, migration, or irreversible data changes?
- Should this phase be lightweight, standard, or industrial?
- May Codex write baseline files, or should it stay read-only?

## Boundary

The decision card does not approve target-project writes.

It does not approve implementation.

It does not approve release or production.

It does not approve security, privacy, compliance, payment, finance, tax, HR, migration, or irreversible data decisions.

It does not prove real-project evidence exists.

When BL2 appears, it must be described as a candidate path for human review. It is not selected or active until BL2 evidence, selected packs, residual risk, and human approval are recorded.

For high-risk or production-sensitive projects, use this wording:

```text
Current safe action: BL1/read-only mapping
Target candidate level: BL2_INDUSTRIAL after evidence and human confirmation
```

For dirty worktrees:

```text
Current safe action: read-only until the worktree decision is resolved
Target candidate level: BL2_INDUSTRIAL only if high-risk evidence remains relevant
```

For monorepos, distinguish active profiles from present-but-unconfirmed or deferred profiles. A directory such as `apps/android` or `apps/miniapp` should not automatically mean that Android or Mini Program packs are active for the current phase.

## Relationship To Lower-Level Tools

Guided Baseline Selection sits above:

- `start`
- `baseline`
- `standard-baseline`
- `baseline-packs`
- `real-adoption`
- `patch-classification`
- `next`

Use the guided entry first when the user should not need to understand internal tool names.
