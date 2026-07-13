# First Hour: Guided Adoption

Use this when Codex first enters a project and the human says something like "configure this project yourself" or gives a repository path.

## Principle

The first hour establishes a safe adoption path from the user's ordinary-language
goal. Codex inspects the repository and owns project classification, platform
profile, baseline depth, industrial-pack selection, migration depth, and apply
routing.

The user supplies only a missing business fact or product preference, consent to
one prepared real-world effect, or an external fact that the repository cannot
prove. Project type, technical controls, and workflow commands are not user
choices.

## Default Command

```bash
node scripts/cli.mjs start ../my-project
```

`start` is read-only by default. It runs the project-state inspection, runs core checks only when useful, and prints a Guided Adoption Recommendation.

## What Happens

1. Codex inspects the target project with `workflow-next`.
2. Codex classifies the project.
3. Codex recommends a path.
4. Codex classifies any unavailable input through the four user-decision classes.
5. Codex lists safe next actions.
6. Codex states what AI must not do yet.
7. Codex runs `baseline-decision` when it needs an evidence-backed technical recommendation; the card is explanatory and does not ask the user to choose technical controls.

## Project Types

| Type | Meaning | Default path |
| --- | --- | --- |
| `NEW_PROJECT` | Empty or new target | Guided init after internal checks |
| `EXISTING_LIGHT_PROJECT` | Existing project without strong governance signals | Plan-first adoption |
| `GOVERNED_EXISTING_PROJECT` | Existing governance detected | Read-only assessment first |
| `PRODUCTION_SENSITIVE_PROJECT` | Production-sensitive signals detected | Read-only assessment first |
| `DIRTY_WORKTREE_PROJECT` | Existing git changes detected | Preserve current changes and continue read-only until ownership is evidenced |
| `ALREADY_BOOTSTRAPPED_PROJECT` | IntentOS assets already installed | Doctor, then next task |
| `UNKNOWN_NEEDS_DISCUSSION` | Not enough signal | Discuss before setup |

## Safe Progression

```text
start
-> Codex verifies the derived direction
-> dry-run or write-plan
-> IntentOS reviews the bounded plan and evidence
-> apply-plan only when controlled readiness passes
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

Stop technical writes and continue read-only when project identity, existing
changes, authority, or evidence is unclear. Codex must resolve those technical
questions from repository evidence or produce a bounded plan; it must not turn
them into user choices.

Ask the user only when one of these applies:

- a business rule or product preference is genuinely unavailable;
- one prepared action will affect production, real users, real cost, an external account, or irreversible real data;
- a legal, tax, compliance, provider, account, or third-party fact cannot be established from project evidence.
