# Start Here

IntentOS is a software delivery operating system for a zero-experience solo
developer working with an AI coding agent.

Use it when you want to describe the real business in ordinary language and let
Codex handle the complete technical delivery path without bypassing real-world
consent.

## What You Do

You provide only:

- what you want to build or change;
- business facts the project cannot reveal, such as cancellation or refund
  rules;
- product preferences and constraints;
- consent before a concrete cost, production, real-user communication,
  account/provider, or irreversible real-data effect.

You do not need to choose profile IDs, BL levels, pack IDs, checker commands,
action IDs, schemas, migration mechanics, architecture, database design, test
strategy, reviewers, or technical approvers.

## What Codex Does

Codex uses IntentOS to:

- read the project before changing files;
- decide whether the project is new, existing, governed, dirty, or production-sensitive;
- choose the safest technical path;
- derive the platform profile, baseline level, required packs, and capability
  coverage;
- prepare plans, tests, reviews, evidence, repair, and rollback;
- execute ordinary reversible project-local engineering after internal gates;
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

The command is read-only and selects the lower-level systems internally. After
that entry, ordinary reversible engineering does not need another technical
approval. Real-world external effects remain disabled until explicitly
consented to.

Maintainers can inspect those systems with `node scripts/cli.mjs
--help-advanced`; ordinary users do not need to choose them.

## Then What?

- New project: Codex derives architecture, platform, capability coverage, and
  the complete baseline, then continues to the first useful business slice.
- Existing project: `work` routes internally to the adoption and rule-comparison
  sources, preserves stronger proven rules, and prepares controlled changes
  without asking the user to choose an adoption mode.
- Governed or production project: IntentOS completes Native Migration, rule
  reconciliation, exact plan, readiness, approval evidence, receipt, and
  verification internally. It asks the user only before a concrete external or
  irreversible effect not already expressed in the business request.

For the shortest setup path, see [Minimal Adoption](minimal-adoption.md).

For the current GitHub clone path, see [Source-Only Adoption](source-only-adoption.md).

For old projects, see [For Existing Projects](for-existing-projects.md).

For maintainers and CI, see [For Maintainers](for-maintainers.md).

For the six-operation model and its boundaries, see [Operating Model](operating-model.md).
