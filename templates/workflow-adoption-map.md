# Workflow Adoption Map: <project-name>

Use this report to map an existing project's workflow to recommended IntentOS
workflow usage.

This report is read-only by default. It does not install workflow assets,
authorize target-project writes, change CI, change hooks, or approve
implementation.

## Human Decision Summary

Compatibility heading: semantically this is the bounded `User Input Summary`; it grants no technical decision authority.

Conclusion:

User input class: NO_USER_ACTION / BUSINESS_FACT_NEEDED / REAL_WORLD_CONSENT_NEEDED / EXTERNAL_FACT_NEEDED

User input needed now: Yes / No

Plain-language question or exact consent request, if needed:

Why project evidence cannot answer it:

What happens if you do nothing:

## Codex Workflow Decision And Evidence

Selected adapter mode: READ_ONLY_MAP / DOCS_ONLY_BRIDGE / THIN_OPERATIONAL_BRIDGE / BLOCKED_BY_EVIDENCE

Can Codex continue now: yes / limited / no

Existing-authority evidence:

Scope and exact write boundary:

Conflict and risk response:

Verification and review route:

Technical recovery path:

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

| Situation | Recommended workflow | Codex disposition | How to connect | User input class |
|---|---|---|---|---|
| New request or feature | Request / Spec / Task Card | Use now / Later / Not applicable |  | NO_USER_ACTION unless a bounded fact is missing |
| Risk or baseline choice | Baseline Decision Card | Use now / Later / Not applicable |  | NO_USER_ACTION |
| Existing governance mapping | Workflow Adoption Map | Use now / Later / Not applicable |  | NO_USER_ACTION |
| Actual file-change boundary | Change Boundary Report | Use now / Later / Not applicable |  | NO_USER_ACTION |
| Complex repair | Patch Classification | Use now / Later / Not applicable |  | NO_USER_ACTION |
| Completion review | Review Loop | Use now / Later / Not applicable |  | NO_USER_ACTION |
| Delivery / handoff | Safe Launch / Launch Readiness | Use now / Later / Not applicable |  | NO_USER_ACTION / REAL_WORLD_CONSENT_NEEDED |
| Scope drift | Conversation Turn / Scope Change Report | Use now / Later / Not applicable |  | NO_USER_ACTION unless a bounded fact is missing |
| Context correction | Context Governance | Use now / Later / Not applicable |  | NO_USER_ACTION / BUSINESS_FACT_NEEDED / EXTERNAL_FACT_NEEDED |
| Interrupted or long-running work | Work queue / pause report when available | Use now / Later / Not applicable |  | NO_USER_ACTION |
| Stale or conflicting docs | Doc lifecycle report when available | Use now / Later / Not applicable |  | NO_USER_ACTION |
| Hook / CI changes | Hook orchestration plan when available | Use now / Later / Not applicable |  | NO_USER_ACTION / REAL_WORLD_CONSENT_NEEDED |

## What To Reuse

- Existing agent rules:
- Existing engineering baseline:
- Existing environment baseline:
- Existing CI / gate process:
- Existing release / rollback process:
- Existing evidence process:

## What To Add

| Proposed addition | Why | Writes? | Codex readiness evidence | User input class | Status |
|---|---|---|---|---|---|
|  |  | No / Docs only / Controlled assets only |  | NO_USER_ACTION / BUSINESS_FACT_NEEDED / REAL_WORLD_CONSENT_NEEDED / EXTERNAL_FACT_NEEDED | PENDING_EVIDENCE / SELECTED / BLOCKED |

## What Not To Touch

- Existing agent rules unless included in a separate evidence-backed Codex plan.
- Existing PR templates, CI workflows, hooks, and release gates unless included in a separate evidence-backed Codex plan.
- Business code, production config, data, migrations, secrets, permissions, payment, finance, tax, HR, security, privacy, or compliance surfaces.
- Release evidence, audit evidence, historical session records, and signed-off reports.

## Conflicts / Duplicates

| Existing asset | Potential IntentOS overlap | Conflict | Recommended handling |
|---|---|---|---|
|  |  | none / possible / blocking | Keep / Map / Codex replan |

## Migration / Adapter Plan

| Step | Action | Writes target files? | Codex readiness evidence | User input class | Status |
|---|---|---|---|---|---|
| 1 | Keep current project workflow authoritative | No | Existing authority map | NO_USER_ACTION | PROPOSED |
| 2 | Use this map for IntentOS workflow routing | No | Routing evidence | NO_USER_ACTION | PROPOSED |
| 3 | Prepare a docs-only bridge only when Codex records scope, rollback, and verification | Docs only | Controlled-apply evidence | NO_USER_ACTION unless a bounded fact or effect applies | PENDING_EVIDENCE |

## Human Decisions Needed

Compatibility heading: semantically this is the bounded `User Input Queue`; adapter mode and write scope are Codex-owned.

| Input class | Missing business fact, exact prepared effect, or external fact | Why project evidence is insufficient | Plain-language question | Source | Status |
|---|---|---|---|---|---|
| NO_USER_ACTION / BUSINESS_FACT_NEEDED / REAL_WORLD_CONSENT_NEEDED / EXTERNAL_FACT_NEEDED |  |  |  | user / external authority / N/A | PENDING / PROVIDED / CONSENTED / NOT_REQUIRED |

## Codex Adapter Decision Record

| Decision | Evidence | Codex disposition | Status |
|---|---|---|---|
| Adapter mode |  | READ_ONLY_MAP / DOCS_ONLY_BRIDGE / THIN_OPERATIONAL_BRIDGE / BLOCKED_NEEDS_OWNER | PENDING_EVIDENCE / SELECTED / BLOCKED |
| Write scope |  | none / docs-only / controlled assets | PENDING_EVIDENCE / SELECTED / BLOCKED |
| Public evidence |  | LOCAL_ONLY by default; exact publication consent only after preparation | LOCAL_ONLY / READY_FOR_CONSENT / PUBLISHED |

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
