# Baseline Pack System

## Purpose

Baseline Pack System governs how Codex chooses, recommends, records, and checks baseline packs across project types, platforms, capabilities, and risk levels.

It exists so Codex can say:

```text
This project appears to be BL1 web + backend.
These packs are candidates.
These packs are not selected.
These risks require stronger evidence before BL2.
Codex cannot enable packs or write project files until internal gates pass.
```

## Core Rule

Baseline packs are selected by project need, not by availability.

Codex must not:

- do not select every pack by default
- treat draft packs as stable defaults
- turn BL2 on without evidence, compatibility, and internal baseline gates
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
7. Evidence and internal baseline decision

Each layer can narrow the next layer. A later layer must not silently override project-owned evidence or a stricter verified rule.

## Baseline Levels

| Level | AI behavior |
|---|---|
| `BL0_LIGHTWEIGHT` | Keep packs off by default. Mention candidates only if a task touches relevant risk. |
| `BL1_STANDARD` | Use selected profiles and project docs. Industrial packs may guide review but are not active unless selected. |
| `BL2_INDUSTRIAL` | Require explicit selected packs, evidence refs, review loop, compatibility, and internal readiness. |

## Pack Types

| Type | Rule |
|---|---|
| Primary platform | Match the runtime being delivered. |
| Capability | Select only when the capability exists in the project scope. |
| Risk overlay | Select only when the risk exists and the stricter internal path is evidenced. |

## Required Report

When baseline pack selection affects a task, create a Baseline Pack Selection Report.

Minimum report sections:

- Decision Responsibility Summary
- Project Classification
- Baseline Level
- Selected Profiles
- Recommended Pack Set
- Not Selected
- Evidence Required
- Internal Decision And User Input Class
- Boundary

## Compatibility Decision States

| State | Meaning |
|---|---|
| `PENDING` | Evidence or internal readiness is incomplete; Codex cannot apply. |
| `APPROVED` | Legacy artifact says approved; current consumers must still verify evidence and may not treat this as technical user authority. |
| `REJECTED` | Legacy artifact rejected the recorded decision. |

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

Codex gives one recommendation and continues internally rather than exposing a technical menu:

```text
Recommended: BL1 with web-app and backend-api profiles.
Do not enable BL2 yet.
If this becomes production/customer-facing, consider web-app-industrial + backend-api-industrial + auth-permission-industrial.
User decision class: NO_USER_ACTION.
AI can write now: No.
```
