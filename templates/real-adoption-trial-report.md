# Real Adoption Trial Report

## Human Decision Summary

Compatibility heading: semantically this is the bounded `User Input Summary`; it grants no technical decision authority.

Conclusion:

User input class: NO_USER_ACTION / BUSINESS_FACT_NEEDED / REAL_WORLD_CONSENT_NEEDED / EXTERNAL_FACT_NEEDED

User input needed now: Yes / No

Plain-language question or exact consent request, if needed:

Why project evidence cannot answer it:

What happens if you do nothing:

## Codex Trial Decision And Evidence

Selected mode: READ_ONLY_TRIAL / ADAPTER_MAP / CONTROLLED_SETUP / BLOCKED_BY_EVIDENCE

Can Codex continue now: yes / limited / no

Project-state evidence:

Scope and exact write boundary:

Risk response and rollback:

Verification and review route:

Technical recovery path:

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
| .intentos proposed | No |
| Codex readiness required before bridge writes | Yes |

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

Compatibility heading: semantically this is the bounded `User Input Queue`; adoption mode and bridge mechanics are Codex-owned.

| Input class | Missing business fact, exact prepared effect, or external fact | Why project evidence is insufficient | Plain-language question | Source | Status |
|---|---|---|---|---|---|
| NO_USER_ACTION / BUSINESS_FACT_NEEDED / REAL_WORLD_CONSENT_NEEDED / EXTERNAL_FACT_NEEDED |  |  |  | user / external authority / N/A | PENDING / PROVIDED / CONSENTED / NOT_REQUIRED |

## Codex Adoption And Publication Decision

| Decision | Evidence | Codex disposition | Safety boundary | Status |
|---|---|---|---|---|
| Adoption mode |  | READ_ONLY / DOCS_ONLY_BRIDGE / THIN_OPERATIONAL_BRIDGE |  | PENDING_EVIDENCE / SELECTED / BLOCKED |
| Public evidence |  | LOCAL_ONLY by default; prepare an exact publication effect before requesting consent |  | LOCAL_ONLY / READY_FOR_CONSENT / PUBLISHED |
| Bridge write |  | NONE / DOCS_ONLY / ADAPTER |  | PENDING_EVIDENCE / SELECTED / BLOCKED |

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
