# Baseline Pack System

## Purpose

Baseline Pack System governs how Codex chooses, recommends, records, and checks baseline packs across project types, platforms, capabilities, and risk levels.

It exists so Codex can say:

```text
This project appears to be BL1 web + backend.
These packs are candidates.
These packs are not selected.
These risks require human decision before BL2.
AI cannot enable packs or write project files yet.
```

## Core Rule

Baseline packs are selected by project need, not by availability.

Codex must not:

- select every pack by default
- treat draft packs as stable defaults
- turn BL2 on without human confirmation
- treat a recommendation as approval
- treat a pack selection as target-project write approval
- treat pack files as real project evidence

## Decision Stack

1. Project state
2. Selected project profiles
3. BL level
4. Primary platform packs
5. Capability packs
6. Risk overlay packs
7. Evidence and human decision

Each layer can narrow the next layer. A later layer must not silently override an earlier human decision.

## Baseline Levels

| Level | AI behavior |
|---|---|
| `BL0_LIGHTWEIGHT` | Keep packs off by default. Mention candidates only if a task touches relevant risk. |
| `BL1_STANDARD` | Use selected profiles and project docs. Industrial packs may guide review but are not active unless selected. |
| `BL2_INDUSTRIAL` | Require explicit selected packs, evidence refs, review loop, and human approval. |

## Pack Types

| Type | Rule |
|---|---|
| Primary platform | Match the runtime being delivered. |
| Capability | Select only when the capability exists in the project scope. |
| Risk overlay | Select only when the risk exists and the human accepts the stricter path. |

## Required Report

When baseline pack selection affects a task, create a Baseline Pack Selection Report.

Minimum report sections:

- Human Summary
- Project Classification
- Baseline Level
- Selected Profiles
- Recommended Pack Set
- Not Selected
- Evidence Required
- Human Decision
- Boundary

## Human Decision States

| State | Meaning |
|---|---|
| `PENDING` | Codex may recommend, but cannot apply. |
| `APPROVED` | Human accepted the recorded baseline pack decision. |
| `REJECTED` | Human rejected the recorded decision. |

`APPROVED` still does not approve implementation, release, production, payment, privacy, security, compliance, migrations, or target-project writes.

## Evidence Rule

Pack files are standards. Project evidence is separate.

BL2 evidence normally includes:

- `docs/baseline-selection.md`
- `docs/baseline-evidence.md`
- task-level verification evidence
- release or rollback evidence when relevant
- exception records when something is intentionally not applicable

## Output Rule

Codex should give the human a small decision, not a technical burden:

```text
Recommended: BL1 with web-app and backend-api profiles.
Do not enable BL2 yet.
If this becomes production/customer-facing, consider web-app-industrial + backend-api-industrial + auth-permission-industrial.
Human decision needed: confirm profile and BL level.
AI can write now: No.
```

