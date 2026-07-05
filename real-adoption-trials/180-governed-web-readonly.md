# Real Adoption Trial Report

## Human Summary

One governed production-sensitive Web project was inspected in read-only mode; the safe adoption path is `NO_WRITE_MAP` first, with any bridge writes requiring human approval.

## Trial Boundary

| Field | Value |
|---|---|
| Trial mode | READ_ONLY |
| No target writes performed | Yes |
| Target git status checked before | Yes |
| Target git status checked after | Yes |
| External service commands run | No |
| Runtime / DB / migration / seed commands run | No |

## Target Project State

| Field | Value |
|---|---|
| Target project label | one governed production-sensitive Web project |
| Concrete target name included | No |
| Primary adoption mode | EXISTING_PRODUCTION_PROJECT |
| Secondary risk tags | production-sensitive, already-launched, strong-agent-rules, existing-baselines, existing-release-evidence |
| Confidence | high |
| Evidence | read-only file listing showed project-specific agent instructions, engineering/environment/release baseline documents, guard scripts, release readiness records, and workflow evidence directories |

## Existing Governance Sources

| Source | Path / Evidence | Meaning | Keep / Map / Gap |
|---|---|---|---|
| Agent rules | existing project agent instruction file | local authority for Codex behavior | Keep |
| Project governance | existing governance and workflow baseline docs | project-specific delivery rules | Map |
| Engineering baseline | existing Web engineering baseline doc | engineering source of truth | Map |
| Environment baseline | existing Web environment baseline doc | runtime and environment boundary | Map |
| CI / gates | existing guard scripts and quality gate commands | validation authority | Keep |
| Release / rollback | existing release and rollback baseline docs | delivery readiness authority | Map |
| Session / evidence | existing session/evidence records | task and review trace | Map |

## Bridge Layer Decision

| Field | Value |
|---|---|
| Bridge layer mode | NO_WRITE_MAP |
| AGENTS.md proposed | No |
| Existing agent.md considered | Yes |
| .intentos proposed | No |
| Human approval required before bridge writes | Yes |

## Governance Map

Governance Map ref: `governance-maps/180-governed-web-readonly.md`

Mapping status: COMPLETE

## Patch Classification

Patch Classification ref: `patch-classifications/180-governed-web-repair-scale.md`

Patch classification status: COMPLETE

## Public Evidence

| Field | Value |
|---|---|
| Public Evidence Status | SANITIZED_APPROVED |
| Public release may name target project | No |
| Sanitization notes | Target name, local path, private architecture details, release details, endpoints, accounts, and operational data are omitted. |

## Human Decisions

| Decision | Options | Recommended | Owner | Status |
|---|---|---|---|---|
| Adoption mode | read-only / docs-only bridge / thin operational bridge | read-only | human | PENDING |
| Public evidence | LOCAL_ONLY / SANITIZED_APPROVED / PUBLIC_APPROVED | SANITIZED_APPROVED | human | APPROVED |
| Bridge write | none / docs-only / adapter | none | human | PENDING |

## Subagent Orchestration

- Subagents used: No
- Plan path: `subagent-run-plans/180-real-project-adoption-trial.md`
- Status: `NOT_USED`
- Notes: Main thread performed the sanitized source-record write. No helper agent remained open.

## Verification Evidence

- read-only commands: project-state, baseline, and next-action inspection only
- target git status before: unchanged record captured locally
- target git status after: unchanged record captured locally
- source checker: `node scripts/check-real-adoption-trial.mjs .`

## Outcome

`READ_ONLY_ADOPTION_RECORDED`
