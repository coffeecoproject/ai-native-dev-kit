# First Hour: Guided Adoption

Use this when Codex first enters a project and the human says something like "configure this project yourself" or gives a repository path.

## Principle

The first hour is not for writing files. It is for deciding the adoption path.

The human should only make judgment decisions:

- Is this the right project?
- Is it new, existing, governed, production-sensitive, dirty, or already bootstrapped?
- Which platform profile should apply?
- Should AI only assess, write a plan, or apply a reviewed plan?
- Is BL2 or an industrial pack explicitly approved?

Codex should do the inspection, classification, recommendation, and plan preparation.

## Default Command

```bash
node scripts/cli.mjs start ../my-project
```

`start` is read-only by default. It runs the project-state inspection, runs core checks only when useful, and prints a Guided Adoption Recommendation.

## What Happens

1. Codex inspects the target project with `workflow-next`.
2. Codex classifies the project.
3. Codex recommends a path.
4. Codex lists the human decisions needed.
5. Codex lists safe next actions.
6. Codex states what AI must not do yet.
7. Codex runs `baseline-decision` when BL level, platform baseline, industrial candidates, or write permission need a user-readable decision card.

## Project Types

| Type | Meaning | Default path |
| --- | --- | --- |
| `NEW_PROJECT` | Empty or new target | Guided init after confirmation |
| `EXISTING_LIGHT_PROJECT` | Existing project without strong governance signals | Plan-first adoption |
| `GOVERNED_EXISTING_PROJECT` | Existing governance detected | Read-only assessment first |
| `PRODUCTION_SENSITIVE_PROJECT` | Production-sensitive signals detected | Read-only assessment first |
| `DIRTY_WORKTREE_PROJECT` | Existing git changes detected | Stop for worktree decision |
| `ALREADY_BOOTSTRAPPED_PROJECT` | IntentOS assets already installed | Doctor, then next task |
| `UNKNOWN_NEEDS_DISCUSSION` | Not enough signal | Discuss before setup |

## Safe Progression

```text
start
-> Codex verifies the derived direction
-> dry-run or write-plan
-> human reviews plan
-> apply-plan only if approved
```

Direct setup is not the default for existing, governed, production-sensitive, dirty, or unclear projects.

## Industrial Packs

Industrial packs are not installed by default.

BL2 or an industrial pack requires project evidence, compatibility checks, and a controlled apply path. Codex derives Web, mini program, mobile, backend, or internal-admin profiles and must not enable an industrial layer until those internal gates pass. The user is asked only for an unavailable business fact or consent to a prepared real-world effect.

When baseline choice affects the first task, Codex should produce a Baseline Decision Card:

```bash
node scripts/cli.mjs baseline-decision ../my-project
node scripts/check-guided-baseline-selection.mjs .
```

The card is a recommendation record. It does not approve writes, implementation, release, production, or high-risk business decisions.

## What To Save

When a recommendation needs to be retained, save it under:

```text
adoption-recommendations/<date>-guided-start.md
```

The saved report can be checked with:

```bash
node scripts/check-guided-adoption.mjs .
```

## Stop Conditions

Stop and ask for a human decision when:

- The target path is unclear.
- The project has a dirty worktree.
- Existing governance or production-sensitive signals are detected.
- BL2 or industrial packs are suggested.
- A write plan would touch governance files, CI, release process, secrets, production configuration, permissions, migrations, or business code.
