# Existing Governance Map: governed production-sensitive Web project

## Mapping Status

Status: REVIEWED

Owner: human

Reviewed at: 2026-06-27

## Project Context

Project type: existing governed Web project

Production status: production-sensitive / already launched

Existing governance summary: Existing agent rules, baseline docs, guard scripts, release records, and evidence records are authoritative.

## Concept Map

| IntentOS Concept | Existing Project Asset | Current Coverage | Gap / Conflict | Decision |
|---|---|---|---|---|
| Agent rules / `AGENTS.md` | existing local agent instruction file | Covered | do not create a competing entry | Keep / Map |
| Engineering baseline | existing Web engineering baseline | Covered | path naming differs | Map |
| Environment baseline | existing environment baseline | Covered | path naming differs | Map |
| Review loop | existing review/evidence records | Partial | structure differs | Map |
| Release evidence | existing release records | Covered | do not claim production validation | Map |
| Patch classification | no-patch project rule and 1.8 report | Partial | use only before future tasks | Map |

## Existing Authority

| Area | Existing Authority | IntentOS Adapter Rule |
|---|---|---|
| Agent rules | existing local agent instruction file | Do not overwrite |
| CI / gates | existing guard scripts | Do not replace |
| Release / rollback | existing release/readiness docs | Do not replace |
| Security / privacy | existing policy and gates | Do not weaken |
| Data / migrations | existing DB policy | Stop for human approval |
| Production config | existing ownership | Stop for human approval |
| Existing docs | existing project docs | Preserve unless mapping is approved |

## Recommended Profiles

- `web-app`
- `backend-api`
- `internal-admin`

## Recommended BL Level

BL1_STANDARD:

Rationale: map existing authority first; BL2 remains selected-only.

## Recommended Industrial Packs

| Pack | Reason | Required Now | Notes |
|---|---|---|---|
| web-app | Web project signals | No | select only for approved BL2 work |

## Adapter Setup Proposal

Recommended adapter mode:

- `NO_WRITE_MAP`

Allowed writes after approval:

- docs-only adoption assessment
- docs-only governance map

Forbidden writes without separate approval:

- `AGENTS.md`
- `.intentos/`
- CI workflows
- release workflow
- business code
- database migrations

## Open Decisions

| Decision | Owner | Status | Notes |
|---|---|---|---|
| Whether to write adapter docs | human | PENDING | default is no-write |
