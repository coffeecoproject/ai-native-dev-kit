# Workflow Adoption Map: governed web project

Use this report to map an existing project's workflow to recommended AI Native
workflow usage.

This report is read-only by default. It does not install workflow assets,
authorize target-project writes, change CI, change hooks, or approve
implementation.

## Human Decision Summary

Conclusion: This governed web project already has its own workflow. AI Native
should map onto the existing rules first, without changing files.

Recommended choice: A

Can AI continue now: limited

What I need from you: Confirm whether this should remain read-only guidance or
whether a later docs-only bridge can be drafted.

| Option | What it means | What AI will do | Writes project files? | Risk | When to choose |
|---|---|---|---|---|---|
| A | Read-only map | Use this as guidance only | No | low | Choose while current governance remains authoritative |
| B | Docs-only bridge | Save an approved adapter doc | Docs only | low/medium | Choose after owner review |
| C | Thin operational bridge | Add selected reviewed workflow references | Approved assets only | medium/high | Choose only after conflict review |
| D | Pause | Stop and wait | No | low | Choose when ownership or risk is unclear |

Recommended reason: Existing governance, release evidence, and CI gates should
stay authoritative.

What happens if you do nothing: No project files are changed; Codex should keep
using read-only mapping before task work.

## Human Summary

Use AI Native as a workflow routing layer; do not replace this project's
existing governance.

## Existing Project Signals

| Field | Value |
|---|---|
| Project state | EXISTING_GOVERNED_PROJECT |
| Adapter mode | READ_ONLY_MAP |
| Confidence | high |
| Dirty worktree | No |
| Production-sensitive signals | Yes |
| Existing governance signals | Yes |
| Target writes authorized by this report | No |

## Existing Workflow Inventory

| Area | Existing asset / signal | Coverage | Keep / Map / Gap | Notes |
|---|---|---|---|---|
| Agent rules | AGENTS.md | Covered | Keep | Existing authority remains primary |
| Project docs | docs/governance, docs/baselines | Covered | Keep / Map | Map AI Native terms to existing docs |
| Work intake | PR template, issue labels | Partial | Map | Use Request / Spec / Task only after task boundary is approved |
| Review / evidence | docs/evidence, releases | Covered | Keep | Evidence remains project-owned |
| CI / gates | .github/workflows, scripts/guard | Covered | Keep | Do not change CI from this report |
| Release / rollback | docs/release, docs/rollback | Covered | Keep | Safe Launch can wrap evidence but not approve release |
| Hooks / automation | pre-push gate | Partial | Keep / Map | Hook changes need a later hook plan |

## Recommended AI Native Workflow Use

| Situation | Recommended workflow | Use now? | How to connect | Human decision needed |
|---|---|---|---|---|
| New request or feature | Request / Spec / Task Card | Yes | Use after the current project owner confirms task scope | Yes |
| Risk or baseline choice | Baseline Decision Card | Yes | Use before changing baseline, platform, or risk scope | Yes |
| Existing governance mapping | Workflow Adoption Map | Yes | This report records the map | No |
| Actual file-change boundary | Change Boundary Report | Yes | Use before multi-file changes | Yes |
| Complex repair | Patch Classification | Yes | Use before non-trivial fixes or hardcuts | Yes |
| Completion review | Review Loop | Yes | Use after task completion, not after every small edit | No |
| Delivery / handoff | Safe Launch / Launch Readiness | Later | Use only when demo, staging, or release is claimed | Yes |
| Scope drift | Conversation Turn / Scope Change Report | Yes | Use when the user switches tasks | No |
| Context correction | Context Governance | Yes | Use when old context conflicts with current project reality | No |
| Interrupted or long-running work | Work queue / pause report when available | Later | Recommended later; do not resume paused work automatically | Yes |
| Stale or conflicting docs | Doc lifecycle report when available | Later | Recommended later; do not delete docs by default | Yes |
| Hook / CI changes | Hook orchestration plan when available | Later | Recommended later; never install hooks from this map | Yes |

## What To Reuse

- Existing agent rules: AGENTS.md.
- Existing engineering baseline: docs/baselines.
- Existing environment baseline: docs/baselines.
- Existing CI / gate process: .github/workflows and scripts/guard.
- Existing release / rollback process: docs/release and docs/rollback.
- Existing evidence process: docs/evidence and releases.

## What To Add

| Proposed addition | Why | Writes? | Approval needed | Status |
|---|---|---|---|---|
| Workflow Adoption Map report | Record how AI Native should route future work | No | No | PROPOSED |
| Docs-only bridge | Give the team a shared adapter page later | Docs only | Yes | PENDING |

## What Not To Touch

- Existing agent rules unless separately approved.
- Existing PR templates, CI workflows, hooks, and release gates unless separately approved.
- Business code, production config, data, migrations, secrets, permissions, payment, finance, tax, HR, security, privacy, or compliance surfaces.
- Release evidence, audit evidence, historical session records, and signed-off reports.

## Conflicts / Duplicates

| Existing asset | Potential AI Native overlap | Conflict | Recommended handling |
|---|---|---|---|
| AGENTS.md | AI Native agent governance | possible | Keep existing authority; add adapter only after owner approval |
| .github/workflows | AI Native workflow checks | possible | Map first; do not add blocking gates from this report |
| docs/release | Safe Launch / Launch Readiness | possible | Use launch readiness as evidence wrapper, not release approval |

## Migration / Adapter Plan

| Step | Action | Writes target files? | Requires human approval | Status |
|---|---|---|---|---|
| 1 | Keep existing project workflow authoritative | No | No | PROPOSED |
| 2 | Use this map for AI Native workflow routing | No | No | PROPOSED |
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

`WORKFLOW_MAP_RECORDED`
