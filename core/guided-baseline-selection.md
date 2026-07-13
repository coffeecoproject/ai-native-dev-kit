# Guided Baseline Selection

Guided Baseline Selection is the user-facing entry for baseline choice.

It sits above the existing baseline tools:

- `start`
- `baseline`
- `standard-baseline`
- `baseline-packs`
- `real-adoption`
- `patch-classification`
- `next`

It does not replace those tools. It decides which path is appropriate and explains it in plain language.

## Purpose

The purpose is to let Codex recommend a baseline path without requiring the user to understand internal pack registries, resolver states, or checker names.

The output is a Baseline Decision Card.

The card answers:

- what Codex thinks the project is
- the evidence-derived recommended baseline level
- the current safe action versus any target candidate level
- the evidence-derived platform states: selected, present but not evidenced, deferred, or not detected
- the standard packs Codex selected
- the industrial packs that remain candidate-only
- the packs Codex deliberately did not select
- whether one business fact, exact real-world consent, or external fact is unavailable
- what Codex can safely do next
- what Codex must not do

## User Role

The human decides:

- project state
- platform scope
- backend/API scope
- production sensitivity
- money, permission, customer data, migration, finance, HR, tax, or other high-risk scope
- baseline level
- whether Codex may write baseline or workflow files

The human does not need to choose internal scripts, registry names, or checker names.

## Codex Role

Codex reads, recommends, explains, records, and checks.

Codex must not treat a recommendation as approval.

Codex must not:

- enable BL2 by default
- treat every pack as selected by default
- approve target-project writes
- approve implementation
- approve release or production
- approve security, privacy, compliance, payment, finance, tax, HR, migration, or irreversible data decisions
- replace existing governed project assets
- force backend for frontend-only or Mini Program projects

## Baseline Levels

| User label | Internal level | Plain meaning |
|---|---|---|
| Lightweight | `BL0_LIGHTWEIGHT` | Basic structure for demos, small tools, or low-risk experiments. |
| Standard | `BL1_STANDARD` | Normal project baseline for serious Web, app, Mini Program, backend, or admin work. |
| Industrial | `BL2_INDUSTRIAL` | Stronger governance for production, customer data, permission, payment, release, migration, or high-risk work. |

BL2 is never a quality badge. It is a heavier governance mode that requires evidence, compatibility, and internal baseline readiness.

For production-sensitive, governed, dirty, or high-risk projects, the card must separate:

```text
current safe action: usually BL1/read-only mapping or read-only until worktree decision
target candidate level: BL2_INDUSTRIAL only after evidence and internal readiness
```

This avoids presenting BL2 as already selected.

## Platform States

Large monorepos may contain more platforms than the current phase should use.

Use these states:

| State | Meaning |
|---|---|
| `selected-confirmed` | Project-owned evidence already selected the profile. |
| `selected-inferred` | Codex inferred the profile from strong project evidence. |
| `present-needs-evidence` | The platform appears in the repo, but current evidence does not establish it as active. |
| `present-inactive-or-deferred` | The platform appears in the repo and local evidence suggests it is not active in this phase. |
| `not-detected` | No meaningful signal was found. |

Do not treat every platform directory in a monorepo as active for the current task.

## Project States

| User label | Default Codex behavior |
|---|---|
| New empty project | Derive platform and rigor, then initialize after internal checks. |
| Existing light project | Review gaps first; avoid full overwrite. |
| Existing governed project | Read existing governance and map to it first. |
| Production-sensitive project | Stay read-only until controlled apply readiness passes. |
| Dirty worktree | Preserve all current changes and stay read-only until ownership and scope are evidenced. |

## Decision Card Rules

Every Baseline Decision Card must include:

- `Decision Responsibility Summary`
- `Project State`
- `Platform And Scope`
- `Platform States`
- `Recommended Baseline Level`
- `Recommended Standard Packs`
- `Candidate Industrial Packs`
- `Not Selected`
- `User Input Needed`
- `Safe Next Actions`
- `Boundary`
- `Evidence`

Normal cards should ask no technical questions. They may ask one concise business, real-world-consent, or external-fact question only when evidence cannot supply it.

The card must always state that it does not approve target-project writes, implementation, release, production, high-risk domain decisions, or real-project evidence.

## Evidence Rule

Standard packs can be recommended from project signals.

Industrial packs can be candidates from risk signals.

Industrial packs are not active until BL2, selected pack set, evidence gaps, residual risk, compatibility, and internal readiness are recorded.

## Final Boundary

Codex derives, recommends, and verifies technical controls.

The user supplies business reality and exact real-world consent only.

Workflow controls whether Codex may write.

Evidence controls whether BL2 can pass.
