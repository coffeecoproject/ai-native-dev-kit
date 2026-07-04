# Start Here

IntentOS is a software delivery governance layer for AI coding agents.

Use it when you want Codex or another AI agent to help build, change, review, or prepare a project for release without bypassing human decisions.

## What You Do

You provide the goal and make judgment decisions:

- what you want to build or change;
- whether a recommendation is acceptable;
- which risk you accept;
- whether a write, migration, release, or production action is approved.

## What Codex Does

Codex uses IntentOS to:

- read the project before changing files;
- decide whether the project is new, existing, governed, dirty, or production-sensitive;
- recommend the safest path;
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

## Three Commands

When command evidence is useful, start with these:

| Need | Command |
|---|---|
| Understand the project and adoption path | `node scripts/cli.mjs start <project>` |
| See the next safe workflow action | `node scripts/cli.mjs next <project>` |
| Check the current workflow health | `node scripts/cli.mjs doctor <project>` |

These commands are read-only. They do not approve implementation, release, production, CI, hooks, secrets, migrations, payment, permissions, or governance replacement.

## Then What?

- New project: continue with the recommended baseline and first useful slice.
- Existing project: compare existing rules before changing workflow assets.
- Governed or production project: stay read-only until Native Migration, Existing Rule Reconciliation, apply plan, approval, and readiness checks are complete.

For the shortest setup path, see [Minimal Adoption](minimal-adoption.md).

For old projects, see [For Existing Projects](for-existing-projects.md).

For maintainers and CI, see [For Maintainers](for-maintainers.md).
