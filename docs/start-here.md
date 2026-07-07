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

## Public Entry Commands

When command evidence is useful, start with these:

| Need | Command |
|---|---|
| Understand the project only | `node scripts/cli.mjs start <project>` |
| Enter safe old-project adoption | `node scripts/cli.mjs adopt <existing-project> --intent "<what you want>"` |
| See the next safe workflow action | `node scripts/cli.mjs next <project>` |
| Check the current workflow health | `node scripts/cli.mjs doctor <project>` |
| Check whether an old project really adopted IntentOS | `node scripts/cli.mjs adoption-assurance <project>` |

These commands are read-only. They do not approve implementation, release, production, CI, hooks, secrets, migrations, payment, permissions, or governance replacement.

`start` is only orientation: it reads and classifies the target. It does not
install `.intentos/`, write a plan file, apply workflow assets, or start safe
adoption. Use `adopt` when the user wants an existing project to begin the
IntentOS safe adoption flow.

## Then What?

- New project: continue with the recommended baseline and first useful slice.
- Existing project: run `adopt` first; it summarizes the safe adoption path and
  required rule comparison before any workflow asset change.
- Governed or production project: stay read-only until Native Migration, Existing Rule Reconciliation, apply plan, approval, and readiness checks are complete.

For the shortest setup path, see [Minimal Adoption](minimal-adoption.md).

For the current GitHub clone path, see [Source-Only Adoption](source-only-adoption.md).

For old projects, see [For Existing Projects](for-existing-projects.md).

For maintainers and CI, see [For Maintainers](for-maintainers.md).
