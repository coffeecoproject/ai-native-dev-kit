# Baseline Pack System 1.13 Plan

## Human Summary

1.13.0 turns the existing profile, BL level, and industrial pack assets into a guided Baseline Pack System. The goal is not to make every project heavy. The goal is to let Codex explain which baseline layer applies, which packs are candidates, which packs are deliberately not selected, and which human decisions are still required.

## Problem

The repository already has:

- project profiles
- BL0/BL1/BL2 baseline levels
- industrial packs for platforms, capabilities, and risk overlays
- pack maturity metadata
- selected-only checks

But in real project usage, the output can still be hard for a non-specialist user to judge:

- Should this project use BL0, BL1, or BL2?
- Is a Web, Mini Program, iOS, Android, backend, admin, auth, data, or payment baseline involved?
- Is a pack only recommended, actually selected, or already approved?
- Are draft packs being treated as stable defaults?
- Did Codex silently select too many packs?

## Goal

Create a formal baseline pack selection layer that is read-only by default and decision-oriented for humans.

## Non-Goal

1.13.0 must not:

- promote any industrial pack to stable
- install all industrial packs by default
- make BL2 the default for every project
- approve target-project writes
- confirm production readiness
- replace legal, security, platform, or release review
- generate real project evidence automatically

## Layer Model

```text
Project state
  -> project profile(s)
  -> BL level
  -> primary platform pack(s)
  -> capability pack(s)
  -> risk overlay pack(s)
  -> evidence and human decision
```

## Project State Layer

Project state controls adoption safety.

| State | Default AI behavior |
|---|---|
| New empty project | Guided init after human confirms platform |
| Existing light project | Plan-first adoption |
| Existing governed project | Read-only mapping first |
| Production-sensitive project | Adapter-only unless human approves controlled apply |
| Dirty worktree | Stop and ask how to handle existing changes |

## Profile Layer

Profiles describe the type of project or runtime.

Current profiles:

- `web-app`
- `wechat-miniprogram`
- `ios-app`
- `android-app`
- `backend-api`
- `internal-admin`
- `high-risk-change`

Profiles do not automatically select industrial packs. They only create candidates.

## Baseline Level Layer

| Level | Meaning | Pack behavior |
|---|---|---|
| `BL0_LIGHTWEIGHT` | Small, local, prototype, low-risk | No industrial pack by default |
| `BL1_STANDARD` | Normal project work with selected profiles | Industrial packs are usually not active; may be referenced as guidance |
| `BL2_INDUSTRIAL` | Production, customer, permission, data, payment, release, or high-risk work | Selected industrial packs require evidence and explicit human acceptance |

BL2 means stronger governance. It does not mean the selected pack is stable or production-proven.

## Pack Type Layer

| Type | Purpose | Examples |
|---|---|---|
| Primary platform | Main runtime surface | Web, WeChat Mini Program, iOS, Android |
| Capability | Cross-platform capability in scope | Backend API, internal admin, auth, data, CloudBase |
| Risk overlay | Extra strict rules for risky work | Payment/value transfer, high-risk change |

Use the smallest set that covers the real project.

## Default Selection Rule

```text
primary platform pack
  + capability packs actually in scope
  + risk overlay packs only when the risk exists
```

Do not select a pack because it exists.

## Required Human Decisions

Before Codex treats a pack as selected, the human must confirm:

- project runtime
- selected profiles
- BL level
- selected packs
- deliberately not selected packs
- draft pack acceptance when a pack is draft
- evidence owner and missing evidence
- whether the next task may proceed

## 1.13 Assets

Add:

- `core/baseline-pack-system.md`
- `docs/baseline-pack-system.md`
- `templates/baseline-pack-selection-report.md`
- `checklists/baseline-pack-selection-review.md`
- `prompts/baseline-pack-router-agent.md`
- `baseline-pack-selections/`
- `scripts/resolve-baseline-packs.mjs`
- `scripts/check-baseline-pack-selection.mjs`
- CLI command `baseline-packs`
- CLI command `baseline-pack-selection`

## Subagent Use

Optional subagent split:

| Subagent | Mode | Output |
|---|---|---|
| Project Signal Reader | read-only | candidate profiles and risks |
| Pack Matrix Reviewer | read-only | candidate pack set and not-selected reasons |
| Evidence Reviewer | read-only | missing evidence and decision gaps |

Subagents must close their run plan after use. They cannot approve BL2, packs, target-project writes, release, or production readiness.

## Success Criteria

- Codex can explain the likely baseline pack path without asking the user to understand internal scripts.
- `baseline-packs` is read-only and shows candidates, blockers, and safe next actions.
- `check-baseline-pack-selection` rejects overclaims such as all-packs-by-default, stable claims for draft packs, or pack selection as write approval.
- README, reference docs, CLI help, manifest, generated-project assets, and self-check include the new layer.
- Full verification passes.

