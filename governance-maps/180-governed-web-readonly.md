# Existing Governance Map: governed production-sensitive Web project

Use this file to map AI Native Dev Kit concepts to governance assets that already exist in a project.

This public map is sanitized. It intentionally omits the target project name, local path, private release details, endpoints, accounts, and production data.

## Mapping Status

Status: REVIEWED

Owner: human

Reviewed at: 2026-06-27

## Project Context

Project type: existing governed Web project

Production status: production-sensitive / already launched

Existing governance summary: The target already has project-specific agent instructions, Web engineering/environment/release baseline docs, guard scripts, release readiness records, and task/session evidence. AI Native Dev Kit should map to these assets rather than overwrite them.

## Concept Map

| AI Native Concept | Existing Project Asset | Current Coverage | Gap / Conflict | Decision |
|---|---|---|---|---|
| Agent rules / `AGENTS.md` | existing project agent instruction file | Covered | AI Native should not create a competing entry by default | Keep / Map |
| Request | existing work/session records | Partial | naming differs from AI Native | Map |
| Preflight | existing release and risk checks | Partial | structure differs from AI Native | Map |
| Spec | existing project docs and task notes | Partial | no duplicate template needed yet | Map |
| Eval / acceptance | existing guard scripts and quality gates | Covered | none | Keep |
| Task card | existing session/task record | Partial | no direct AI Native task card yet | Map |
| AI task log | existing session/evidence records | Partial | optional bridge only | Map |
| Workflow retro | existing review/evidence notes | Partial | optional bridge only | Map |
| Workflow improvement | existing governance notes | Partial | optional bridge only | Map |
| Dogfood observation | local read-only trial notes | Partial | keep sanitized in public repo | Map |
| Project onboarding | existing README/governance docs | Covered | no duplicate onboarding needed | Keep |
| Project profile | existing platform and stack docs | Partial | formal profile can be adapter-only | Map |
| Platform baseline | existing Web baseline docs | Covered | path naming differs from Dev Kit defaults | Map |
| Industrial baseline | existing guard/release baseline docs | Partial | select-only, no default BL2 enablement | Map |
| Risk Gate | existing guard scripts and release rules | Covered | do not weaken | Keep |
| Human Approval | existing owner approval process | Covered | AI Native reports are not approvals | Keep |
| Evidence refs | existing evidence/session records | Covered | keep private unless sanitized | Map |
| Release evidence | existing release/readiness docs | Covered | no production validation claim | Map |
| Skill candidates | not adopted | Missing | not needed for read-only trial | Gap |
| Automation proposals | not adopted | Missing | not needed for read-only trial | Gap |
| Dev-kit proposals | 1.8 sanitized trial report | Partial | public evidence is sanitized | Map |

## Existing Authority

| Area | Existing Authority | AI Native Adapter Rule |
|---|---|---|
| Agent rules | existing project agent instruction file | Do not overwrite |
| CI / gates | existing guard and quality scripts | Do not replace |
| Release / rollback | existing release/readiness/rollback docs | Do not replace |
| Security / privacy | existing project policy and gate rules | Do not weaken |
| Data / migrations | existing DB and migration rules | Stop for human approval |
| Production config | existing production/release ownership | Stop for human approval |
| Existing docs | existing project docs | Preserve unless mapping is approved |

## Recommended Profiles

- `web-app`
- `backend-api`
- `internal-admin`
- `high-risk-change`

## Recommended BL Level

BL1_STANDARD for adoption mapping; BL2_INDUSTRIAL remains selected-only and requires explicit approval.

Rationale: the project is production-sensitive and already governed. The first bridge must map existing authority, not replace it.

## Recommended Industrial Packs

| Pack | Reason | Required Now | Notes |
|---|---|---|---|
| web-app | Web runtime and release surfaces exist | No | use only if a future approved task needs BL2 |
| backend-api | API/data surfaces exist | No | use only for approved backend/API work |
| internal-admin | permissioned workbench/admin signals exist | No | use only for approved admin workflow work |
| high-risk-change | production/release/data boundaries exist | No | use only for approved high-risk change |

## Adapter Setup Proposal

Recommended adapter mode:

- `NO_WRITE_MAP`

Allowed writes after approval:

- docs-only adoption assessment
- docs-only governance map
- docs-only patch classification report

Forbidden writes without separate approval:

- `AGENTS.md`
- `.ai-native/`
- CI workflows
- release workflow
- guard scripts
- business code
- database migrations
- production configuration
- secrets or environment files

## Open Decisions

| Decision | Owner | Status | Notes |
|---|---|---|---|
| Whether to write adapter docs into target project | human | PENDING | default remains no-write |
| Whether to create a thin operational bridge | human | PENDING | must reference existing authority |
| Whether public evidence can ever name the target | human | PENDING | default is no |
