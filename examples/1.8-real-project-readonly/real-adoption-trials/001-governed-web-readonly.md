# Real Adoption Trial Report

## Human Summary

A governed production-sensitive Web project should stay read-only during adoption and use `NO_WRITE_MAP` before any bridge write.

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
| Secondary risk tags | production-sensitive, existing-agent-rules, existing-baselines, existing-release-evidence |
| Confidence | high |
| Evidence | read-only inspection found existing agent rules, baseline docs, guard scripts, release records, and evidence folders |

## Existing Governance Sources

| Source | Path / Evidence | Meaning | Keep / Map / Gap |
|---|---|---|---|
| Agent rules | existing local agent instruction file | behavior authority | Keep |
| Project governance | existing governance docs | delivery authority | Map |
| Engineering baseline | existing Web engineering baseline | engineering source of truth | Map |
| Environment baseline | existing environment baseline | runtime boundary | Map |
| CI / gates | existing guard scripts | validation authority | Keep |
| Release / rollback | existing release baseline | launch authority | Map |
| Session / evidence | existing evidence records | review trace | Map |

## Bridge Layer Decision

| Field | Value |
|---|---|
| Bridge layer mode | NO_WRITE_MAP |
| AGENTS.md proposed | No |
| Existing agent.md considered | Yes |
| .intentos proposed | No |
| Human approval required before bridge writes | Yes |

## Governance Map

Governance Map ref: `governance-maps/001-governed-web-readonly.md`

Mapping status: COMPLETE

## Patch Classification

Patch Classification ref: `patch-classifications/001-structural-remediation.md`

Patch classification status: COMPLETE

## Public Evidence

| Field | Value |
|---|---|
| Public Evidence Status | SANITIZED_APPROVED |
| Public release may name target project | No |
| Sanitization notes | Public evidence omits target name, path, private release details, endpoints, accounts, and operational data. |

## Human Decisions

| Decision | Options | Recommended | Owner | Status |
|---|---|---|---|---|
| Adoption mode | read-only / docs-only bridge / thin operational bridge | read-only | human | PENDING |
| Public evidence | LOCAL_ONLY / SANITIZED_APPROVED / PUBLIC_APPROVED | SANITIZED_APPROVED | human | APPROVED |
| Bridge write | none / docs-only / adapter | none | human | PENDING |

## Subagent Orchestration

- Subagents used: No
- Plan path:
- Status: `NOT_USED`
- Notes: No helper agents were opened.

## Verification Evidence

- read-only commands: project-state, baseline, and next-action inspection only
- target git status before: unchanged
- target git status after: unchanged
- source checker: `node scripts/check-real-adoption-trial.mjs examples/1.8-real-project-readonly`

## Outcome

`READ_ONLY_ADOPTION_RECORDED`
