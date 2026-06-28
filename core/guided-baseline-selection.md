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
- which baseline level is recommended
- which standard packs are recommended
- which industrial packs are candidate-only
- which packs are deliberately not selected
- which decisions the human must confirm
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
- select all packs by default
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

BL2 is never a quality badge. It is a heavier governance mode that requires evidence and human confirmation.

## Project States

| User label | Default Codex behavior |
|---|---|
| New empty project | Recommend platform and rigor, then ask before initialization. |
| Existing light project | Review gaps first; avoid full overwrite. |
| Existing governed project | Read existing governance and map to it first. |
| Production-sensitive project | Stay read-only unless controlled apply is approved. |
| Dirty worktree | Stop before writes and ask how to handle current changes. |

## Decision Card Rules

Every Baseline Decision Card must include:

- `Human Summary`
- `Project State`
- `Platform And Scope`
- `Recommended Baseline Level`
- `Recommended Standard Packs`
- `Candidate Industrial Packs`
- `Not Selected`
- `Human Decisions Needed`
- `Safe Next Actions`
- `Boundary`
- `Evidence`

Normal cards should ask 3 to 5 human questions.

The card must always state that it does not approve target-project writes, implementation, release, production, high-risk domain decisions, or real-project evidence.

## Evidence Rule

Standard packs can be recommended from project signals.

Industrial packs can be candidates from risk signals.

Industrial packs are not active until BL2, selected pack set, evidence gaps, residual risk, and human confirmation are recorded.

## Final Boundary

Codex recommends.

Human decides.

Workflow controls whether Codex may write.

Evidence controls whether BL2 can pass.
