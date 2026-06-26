# Existing Governed Project Adoption Assessment: <project-name>

Use this file when a project already has governance, CI gates, evidence, release controls, production signals, or a dirty worktree.

This assessment is read-only by default. It does not authorize workflow asset installation, AGENTS.md changes, PR template changes, project doc edits, production changes, or business code changes.

## Assessment Status

Mode: READ_ONLY

Prepared by:

Prepared at:

Target project:

Dev-kit version:

## Detected Project State

Project state tags:

- EXISTING_PROJECT / PARTIALLY_BOOTSTRAPPED_PROJECT / BOOTSTRAPPED_PROJECT:
- GOVERNED_EXISTING_PROJECT:
- PRODUCTION_GOVERNED_PROJECT:
- DIRTY_WORKTREE_PROJECT:

Reason:

## Existing Governance Signals

| Signal | Path / Evidence | Meaning | Keep / Map / Gap |
|---|---|---|---|
| Agent rules |  |  |  |
| CI workflows |  |  |  |
| Guard scripts |  |  |  |
| Baseline docs |  |  |  |
| Evidence records |  |  |  |
| Session / work records |  |  |  |
| Architecture / ADR docs |  |  |  |
| Risk / exception docs |  |  |  |

## Production Signals

| Signal | Path / Evidence | Risk | Stop Condition |
|---|---|---|---|
| Production lane |  |  |  |
| Staging / test lane |  |  |  |
| Release workflow |  |  |  |
| Rollback policy |  |  |  |
| Deployment config |  |  |  |
| Database migration policy |  |  |  |
| Incident / SRE policy |  |  |  |
| Backup / recovery policy |  |  |  |

## Worktree Risk

Git repository: Yes / No

Current branch:

Dirty worktree: Yes / No

Changed file count:

Changed file sample:

- 

Impact:

## AI Native Concept Mapping

Link or summarize `existing-governance-map.md` here.

Mapping status: COMPLETE / PARTIAL / NOT_STARTED

Primary conflicts:

- 

Primary gaps:

- 

## Safe Adoption Options

| Option | Writes Allowed | When Safe | Human Approval Required |
|---|---|---|---|
| Read-only assessment only | None | Before understanding existing governance | No |
| Adapter docs only | `docs/ai-native-adoption.md`, `docs/existing-governance-map.md`, or approved equivalent | After human approves mapping destination | Yes |
| Workflow asset update | `.ai-native/`, workflow scripts, migration reports | Only after governance owner accepts adapter plan | Yes |
| Full workflow bootstrap | Standard workflow assets | Usually not appropriate for strong governed production projects | Yes, exceptional |

## Recommended Adoption Path

Recommended option:

Rationale:

Files safe to create or update after approval:

- 

Files that must not be changed without separate approval:

- agent rules:
- PR template:
- CI workflows:
- release / deployment config:
- production config:
- secrets / env files:
- database migrations:
- existing business docs:
- business code:

## Required Human Decisions

| Decision | Options | Recommended | Owner | Status |
|---|---|---|---|---|
| Adoption mode | read-only / adapter docs / workflow assets |  |  | PENDING |
| Mapping destination | chat only / docs / `.ai-native/adoption` |  |  | PENDING |
| Agent rule handling | keep / append with migration report / manual merge |  |  | PENDING |
| PR template handling | keep / migration report / manual merge |  |  | PENDING |
| BL level | BL0 / BL1 / BL2 |  |  | PENDING |
| Selected profiles |  |  |  | PENDING |
| Selected industrial packs |  |  |  | PENDING |

## No-write Recommendation

Do not run `init-project`.

Do not run `--update-workflow-assets`.

Do not create migration reports.

Do not modify project files until the human approves adapter setup.

Reason:

## Next Safe Step

Next action:

Suggested prompt to human:

```text
I detected an existing governed or production-sensitive project. I will not write files yet.
Please confirm whether I should create adapter documentation, and where it should live.
```
