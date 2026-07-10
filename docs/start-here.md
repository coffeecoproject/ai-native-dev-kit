# Start Here

IntentOS is a software delivery governance layer for AI coding agents.

Use it when you want Codex or another AI agent to help build, change, review, or prepare a project for release without bypassing human decisions.

## What You Do

You provide the goal and make only meaningful judgment decisions:

- what you want to build or change;
- whether Codex's plain-language recommendation is acceptable when it changes
  product scope, material risk, cost, release, or production authority.

You do not need to choose profile IDs, BL levels, pack IDs, checker commands,
action IDs, schemas, or migration mechanics.

## What Codex Does

Codex uses IntentOS to:

- read the project before changing files;
- decide whether the project is new, existing, governed, dirty, or production-sensitive;
- recommend the safest path;
- derive the technical platform profile, baseline level, and required packs;
- prepare plans and evidence;
- execute only after the needed approval exists;
- verify, review, and close the work.

## Start With Natural Language

Most users should start by telling Codex the goal:

```text
I want to build a booking app. Start this project for me.
```

Or:

```text
Read this existing project and work under IntentOS.
```

Codex should not require you to know internal commands before starting.

## Public Entry Commands

When command evidence is useful, use one entry:

| Need | Command |
|---|---|
| Start, continue, check, finish, prepare release, or adopt | `node scripts/cli.mjs work <project> "<what you want>"` |

The command is read-only. It does not approve implementation, release,
production, CI, hooks, secrets, migrations, payment, permissions, or governance
replacement. IntentOS selects the lower-level source systems internally.

Maintainers can inspect those systems with `node scripts/cli.mjs
--help-advanced`; ordinary users do not need to choose them.

## Then What?

- New project: Codex derives the technical baseline, prepares the controlled
  setup plan, asks for one meaningful confirmation when required, and then
  continues to the first useful slice.
- Existing project: `work` routes internally to the adoption and rule-comparison
  sources before any workflow asset change.
- Governed or production project: stay read-only until Native Migration, Existing Rule Reconciliation, apply plan, approval, and readiness checks are complete.

For the shortest setup path, see [Minimal Adoption](minimal-adoption.md).

For the current GitHub clone path, see [Source-Only Adoption](source-only-adoption.md).

For old projects, see [For Existing Projects](for-existing-projects.md).

For maintainers and CI, see [For Maintainers](for-maintainers.md).

For the six-operation model and its boundaries, see [Operating Model](operating-model.md).
