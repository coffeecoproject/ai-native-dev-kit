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
- the evidence-derived platform states
- the standard baseline packs Codex selected
- the industrial packs that remain candidates
- the packs Codex deliberately did not select
- whether a business fact, exact real-world consent, or external fact is unavailable
- what Codex can safely do next
- what Codex must not do

## Recommended Command

```bash
node scripts/cli.mjs baseline-decision <project>
```

This command is read-only. It prints a decision card and does not write target-project files.

It does not save the card automatically.

When a durable record is useful, Codex creates a draft card:

```bash
node scripts/new-workflow-item.mjs --type baseline-decision-card --name project-baseline-decision
```

Codex copies the recommendation into the draft and runs the checker. Creating the record is still not write authority.

To check recorded cards:

```bash
node scripts/cli.mjs baseline-decision-check <project>
```

## How To Use It

For a new project:

```text
Codex reads the idea or empty project.
Codex derives the platform, baseline level, backend scope, risk, and bounded initialization path.
The user is asked only for an unavailable business fact or consent to a prepared real-world effect.
```

For an existing light project:

```text
Codex reads the existing structure.
Codex derives the smallest BL0/BL1 gap review and continues through bounded internal readiness before writes.
```

For an existing governed project:

```text
Codex maps existing governance first.
Codex does not run full init or overwrite existing rules by default.
```

For a production-sensitive project:

```text
Codex stays read-only.
Codex recommends adapter-only adoption unless controlled apply readiness passes.
```

For a dirty worktree:

```text
Codex stops writes, preserves all changes, derives ownership read-only, and prepares the safest bounded continuation.
```

## User Input Boundary

The card uses exactly one user-decision class. `NO_USER_ACTION` is the default.
It may ask one plain question only for an unavailable business fact, an exact
prepared real-world effect, or an external fact. Platform, backend scope, risk
treatment, BL level, packs, and write routing are Codex decisions.

## Boundary

The decision card does not approve target-project writes.

It does not approve implementation.

It does not approve release or production.

It does not approve security, privacy, compliance, payment, finance, tax, HR, migration, or irreversible data decisions.

It does not prove real-project evidence exists.

When BL2 appears, it is a candidate path for internal review. It is not selected or active until BL2 evidence, selected packs, residual risk, compatibility, and internal readiness are recorded.

For high-risk or production-sensitive projects, use this wording:

```text
Current safe action: BL1/read-only mapping
Target candidate level: BL2_INDUSTRIAL after evidence and internal readiness
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
