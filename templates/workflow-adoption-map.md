# Workflow Adoption Map: <project-name>

Use this report to map an existing project's workflow to recommended IntentOS
workflow usage.

This report is read-only by default. It does not install workflow assets,
authorize target-project writes, change CI, change hooks, or approve
implementation.

## Human Decision Summary

Conclusion:

Recommended choice: A / B / C / D

Can AI continue now: yes / limited / no

What I need from you:

| Option | What it means | What AI will do | Writes project files? | Risk | When to choose |
|---|---|---|---|---|---|
| A | Read-only map | Use this as guidance only | No | low | Choose when the project is governed, sensitive, or still unclear |
| B | Docs-only bridge | Save an approved adapter doc | Docs only | low/medium | Choose when the team wants a shared workflow bridge |
| C | Thin operational bridge | Add selected reviewed workflow references | Approved assets only | medium/high | Choose only after conflict review |
| D | Pause | Stop and wait | No | low | Choose when ownership, risk, or current task is unclear |

Recommended reason:

What happens if you do nothing:

## Human Summary

One-sentence conclusion for the existing project workflow adapter.

## Existing Project Signals

| Field | Value |
|---|---|
| Project state | EXISTING_GOVERNED_PROJECT |
| Adapter mode | READ_ONLY_MAP |
| Confidence | high |
| Dirty worktree | Yes / No / Unknown |
| Production-sensitive signals | Yes / No / Unknown |
| Existing governance signals | Yes / No / Unknown |
| Target writes authorized by this report | No |

## Existing Workflow Inventory

| Area | Existing asset / signal | Coverage | Keep / Map / Gap | Notes |
|---|---|---|---|---|
| Agent rules |  | Covered / Partial / Missing | Keep / Map / Gap |  |
| Project docs |  | Covered / Partial / Missing | Keep / Map / Gap |  |
| Work intake |  | Covered / Partial / Missing | Keep / Map / Gap |  |
| Review / evidence |  | Covered / Partial / Missing | Keep / Map / Gap |  |
| CI / gates |  | Covered / Partial / Missing | Keep / Map / Gap |  |
| Release / rollback |  | Covered / Partial / Missing | Keep / Map / Gap |  |
| Hooks / automation |  | Covered / Partial / Missing | Keep / Map / Gap |  |

## Recommended IntentOS Workflow Use

| Situation | Recommended workflow | Use now? | How to connect | Human decision needed |
|---|---|---|---|---|
| New request or feature | Request / Spec / Task Card | Yes / Later / No |  | Yes / No |
| Risk or baseline choice | Baseline Decision Card | Yes / Later / No |  | Yes / No |
| Existing governance mapping | Workflow Adoption Map | Yes / Later / No |  | Yes / No |
| Actual file-change boundary | Change Boundary Report | Yes / Later / No |  | Yes / No |
| Complex repair | Patch Classification | Yes / Later / No |  | Yes / No |
| Completion review | Review Loop | Yes / Later / No |  | Yes / No |
| Delivery / handoff | Safe Launch / Launch Readiness | Yes / Later / No |  | Yes / No |
| Scope drift | Conversation Turn / Scope Change Report | Yes / Later / No |  | Yes / No |
| Context correction | Context Governance | Yes / Later / No |  | Yes / No |
| Interrupted or long-running work | Work queue / pause report when available | Later |  | Yes |
| Stale or conflicting docs | Doc lifecycle report when available | Later |  | Yes |
| Hook / CI changes | Hook orchestration plan when available | Later |  | Yes |

## What To Reuse

- Existing agent rules:
- Existing engineering baseline:
- Existing environment baseline:
- Existing CI / gate process:
- Existing release / rollback process:
- Existing evidence process:

## What To Add

| Proposed addition | Why | Writes? | Approval needed | Status |
|---|---|---|---|---|
|  |  | No / Docs only / Approved assets only | Yes / No | PENDING |

## What Not To Touch

- Existing agent rules unless separately approved.
- Existing PR templates, CI workflows, hooks, and release gates unless separately approved.
- Business code, production config, data, migrations, secrets, permissions, payment, finance, tax, HR, security, privacy, or compliance surfaces.
- Release evidence, audit evidence, historical session records, and signed-off reports.

## Conflicts / Duplicates

| Existing asset | Potential IntentOS overlap | Conflict | Recommended handling |
|---|---|---|---|
|  |  | none / possible / blocking | Keep / Map / Needs owner decision |

## Migration / Adapter Plan

| Step | Action | Writes target files? | Requires human approval | Status |
|---|---|---|---|---|
| 1 | Keep current project workflow authoritative | No | No | PROPOSED |
| 2 | Use this map for IntentOS workflow routing | No | No | PROPOSED |
| 3 | Prepare docs-only bridge only if approved | Docs only | Yes | PENDING |

## Human Decisions Needed

| Decision | Options | Recommended | Owner | Status |
|---|---|---|---|---|
| Adapter mode | READ_ONLY_MAP / DOCS_ONLY_BRIDGE / THIN_OPERATIONAL_BRIDGE / BLOCKED_NEEDS_OWNER | READ_ONLY_MAP | human | PENDING |
| Write scope | none / docs-only / approved assets | none | human | PENDING |
| Public evidence | LOCAL_ONLY / SANITIZED_APPROVED / PUBLIC_APPROVED | LOCAL_ONLY | human | PENDING |

## Boundary

- This report installs workflow assets: No
- This report authorizes target-project writes: No
- This report changes CI or hooks: No
- This report overwrites existing governance: No
- This report approves implementation: No
- This report approves release or production: No
- This report approves security, privacy, compliance, payment, finance, tax, HR, migration, permission, or data decisions: No

## Outcome

`WORKFLOW_MAP_RECORDED` / `NEEDS_HUMAN_DECISION` / `BLOCKED`
