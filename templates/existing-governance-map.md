# Existing Governance Map: <project-name>

Use this file to map AI Native Dev Kit concepts to governance assets that already exist in a project.

This map prevents duplicate workflow systems. It should preserve existing authority unless the human explicitly approves an adapter change.

## Mapping Status

Status: DRAFT / REVIEWED / APPROVED

Owner:

Reviewed at:

## Project Context

Project type:

Production status:

Existing governance summary:

## Concept Map

| AI Native Concept | Existing Project Asset | Current Coverage | Gap / Conflict | Decision |
|---|---|---|---|---|
| Agent rules / `AGENTS.md` |  | Covered / Partial / Missing |  | Keep / Map / Add adapter |
| Request |  | Covered / Partial / Missing |  | Keep / Map / Add adapter |
| Preflight |  | Covered / Partial / Missing |  | Keep / Map / Add adapter |
| Spec |  | Covered / Partial / Missing |  | Keep / Map / Add adapter |
| Eval / acceptance |  | Covered / Partial / Missing |  | Keep / Map / Add adapter |
| Task card |  | Covered / Partial / Missing |  | Keep / Map / Add adapter |
| AI task log |  | Covered / Partial / Missing |  | Keep / Map / Add adapter |
| Workflow retro |  | Covered / Partial / Missing |  | Keep / Map / Add adapter |
| Workflow improvement |  | Covered / Partial / Missing |  | Keep / Map / Add adapter |
| Dogfood observation |  | Covered / Partial / Missing |  | Keep / Map / Add adapter |
| Project onboarding |  | Covered / Partial / Missing |  | Keep / Map / Add adapter |
| Project profile |  | Covered / Partial / Missing |  | Keep / Map / Add adapter |
| Platform baseline |  | Covered / Partial / Missing |  | Keep / Map / Add adapter |
| Industrial baseline |  | Covered / Partial / Missing |  | Keep / Map / Add adapter |
| Risk Gate |  | Covered / Partial / Missing |  | Keep / Map / Add adapter |
| Human Approval |  | Covered / Partial / Missing |  | Keep / Map / Add adapter |
| Evidence refs |  | Covered / Partial / Missing |  | Keep / Map / Add adapter |
| Release evidence |  | Covered / Partial / Missing |  | Keep / Map / Add adapter |
| Skill candidates |  | Covered / Partial / Missing |  | Keep / Map / Add adapter |
| Automation proposals |  | Covered / Partial / Missing |  | Keep / Map / Add adapter |
| Dev-kit proposals |  | Covered / Partial / Missing |  | Keep / Map / Add adapter |

## Existing Authority

| Area | Existing Authority | AI Native Adapter Rule |
|---|---|---|
| Agent rules |  | Do not overwrite |
| CI / gates |  | Do not replace |
| Release / rollback |  | Do not replace |
| Security / privacy |  | Do not weaken |
| Data / migrations |  | Stop for human approval |
| Production config |  | Stop for human approval |
| Existing docs |  | Preserve unless mapping is approved |

## Recommended Profiles

- 

## Recommended Risk / Capability Packs

| Pack | Type | Reason | Required Now | Notes |
|---|---|---|---|---|
|  | risk overlay / industrial pack / capability pack |  | Yes / No |  |

## Recommended BL Level

BL0_LIGHTWEIGHT / BL1_STANDARD / BL2_INDUSTRIAL:

Rationale:

## Recommended Industrial Packs

| Pack | Reason | Required Now | Notes |
|---|---|---|---|
|  |  | Yes / No |  |

## Adapter Setup Proposal

Recommended bridge layer mode:

- `NO_WRITE_MAP`
- `DOCS_ONLY_BRIDGE`
- `THIN_OPERATIONAL_BRIDGE`
- `NOT_PROPOSED`

Allowed writes after approval:

- 

Forbidden writes without separate approval:

- 

Notes:

- `NO_WRITE_MAP` means no target writes.
- `DOCS_ONLY_BRIDGE` may write only approved adoption or governance-map docs.
- `THIN_OPERATIONAL_BRIDGE` may write only an approved adapter that points to existing authority.
- Full bootstrap is exceptional for strong governed projects and requires separate human approval.

## Open Decisions

| Decision | Owner | Status | Notes |
|---|---|---|---|
|  |  | PENDING |  |
