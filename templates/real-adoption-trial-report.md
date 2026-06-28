# Real Adoption Trial Report

## Human Decision Summary

Conclusion:

Recommended choice: A / B / C / D

Can AI continue now: yes / limited / no

What I need from you:

| Option | What it means | What AI will do | Writes project files? | Risk | When to choose |
|---|---|---|---|---|---|
| A | Read-only trial | Record what the kit detected and where it should stop | Report only | low | Choose for first contact with real projects |
| B | Adapter map | Draft governance mapping and adoption notes | Docs/report only | low/medium | Choose when the project has existing governance |
| C | Controlled setup | Apply reviewed workflow assets after approval | Yes, approved assets only | medium/high | Choose only for projects ready to adopt directly |
| D | Pause | Stop trial and wait | No | low | Choose when the project is sensitive or unclear |

Recommended reason:

What happens if you do nothing:

## Human Summary

One-sentence read-only conclusion.

## Trial Boundary

| Field | Value |
|---|---|
| Trial mode | READ_ONLY |
| No target writes performed | Yes |
| Target git status checked before | Yes / No |
| Target git status checked after | Yes / No |
| External service commands run | No |
| Runtime / DB / migration / seed commands run | No |

## Target Project State

| Field | Value |
|---|---|
| Target project label | <sanitized label> |
| Concrete target name included | No |
| Primary adoption mode | EXISTING_GOVERNED_PROJECT |
| Secondary risk tags | production-sensitive, already-launched, existing-baselines |
| Confidence | high |
| Evidence | <paths or read-only observations> |

## Existing Governance Sources

| Source | Path / Evidence | Meaning | Keep / Map / Gap |
|---|---|---|---|
| Agent rules |  |  |  |
| Project governance |  |  |  |
| Engineering baseline |  |  |  |
| Environment baseline |  |  |  |
| CI / gates |  |  |  |
| Release / rollback |  |  |  |
| Session / evidence |  |  |  |

## Bridge Layer Decision

| Field | Value |
|---|---|
| Bridge layer mode | NO_WRITE_MAP |
| AGENTS.md proposed | No |
| Existing agent.md considered | Yes / Existing agent.md absent |
| .ai-native proposed | No |
| Human approval required before bridge writes | Yes |

## Governance Map

Governance Map ref:

Mapping status: NOT_STARTED / PARTIAL / COMPLETE

## Patch Classification

Patch Classification ref:

Patch classification status: NOT_STARTED / PARTIAL / COMPLETE

## Public Evidence

| Field | Value |
|---|---|
| Public Evidence Status | LOCAL_ONLY |
| Public release may name target project | No |
| Sanitization notes | Real target details stay local unless explicitly approved. |

## Human Decisions

| Decision | Options | Recommended | Owner | Status |
|---|---|---|---|---|
| Adoption mode | read-only / docs-only bridge / thin operational bridge | read-only | human | PENDING |
| Public evidence | LOCAL_ONLY / SANITIZED_APPROVED / PUBLIC_APPROVED | LOCAL_ONLY | human | PENDING |
| Bridge write | none / docs-only / adapter | none | human | PENDING |

## Subagent Orchestration

- Subagents used: Yes / No
- Plan path:
- Status: `NOT_USED` / `CLOSED` / `SKIPPED`
- Notes:

## Verification Evidence

- read-only commands:
- target git status before:
- target git status after:
- source checker:

## Outcome

`READ_ONLY_ADOPTION_RECORDED` / `NEEDS_HUMAN_DECISION` / `BLOCKED`
