# Patch Classification Report

## Human Decision Summary

Conclusion:

Recommended choice: A / B / C / D

Can AI continue now: yes / limited / no

What I need from you:

| Option | What it means | What AI will do | Writes project files? | Risk | When to choose |
|---|---|---|---|---|---|
| A | Safe local fix | Fix only the approved small issue | Yes, approved task files only | low/medium | Choose when evidence shows the root cause is local |
| B | Baseline-aligned hardcut | Replace the weak path with the expected baseline behavior | Yes, approved task files only | medium | Choose when a small patch would preserve the wrong structure |
| C | Structural remediation | Stop implementation and prepare a broader remediation plan | Plan/report only | medium/high | Choose when the issue is architectural or cross-cutting |
| D | Do not patch | Stop because the change would hide risk or need human decision | No | high if bypassed | Choose when root cause, approval, or rollback is unclear |

Recommended reason:

What happens if you do nothing:

## Human Summary

One-sentence repair-scale conclusion.

## Classification Status

| Field | Value |
|---|---|
| Status | DRAFT / REVIEWED |
| Target project label | <sanitized label> |
| Patch classification authorizes implementation | No |
| Checker boundary | heuristic and structure-based; does not prove code or root-cause correctness |

## Repair Classification

| Field | Value |
|---|---|
| Type | SAFE_LOCAL_FIX / BASELINE_ALIGNED_HARDCUT / STRUCTURAL_REMEDIATION / NEEDS_HUMAN_DECISION / DO_NOT_PATCH |
| Why this type |  |
| Why not SAFE_LOCAL_FIX |  |

## Why Not Another Type

| Alternative Type | Why not selected |
|---|---|
| SAFE_LOCAL_FIX |  |
| BASELINE_ALIGNED_HARDCUT |  |
| STRUCTURAL_REMEDIATION |  |
| NEEDS_HUMAN_DECISION |  |
| DO_NOT_PATCH |  |

## Patch Risk

| Field | Value |
|---|---|
| Could this hide a root cause? | Yes / No |
| Could this weaken a gate? | Yes / No |
| Patch risk notes |  |

## Rollback / Recovery Impact

None / Requires plan / Human decision required:

Notes:

## Affected Baselines

- 

## Affected Surfaces

- 

## Required Evidence

- 

## Required Human Decisions

| Decision | Reason | Owner | Status |
|---|---|---|---|
|  |  | human | PENDING |

## Verification Plan

- 

## Implementation Authorization

Patch classification authorizes implementation: No

Required entry before implementation:

- approved task / approved human decision / separate remediation plan

## Outcome

`CLASSIFIED_ONLY` / `NEEDS_HUMAN_DECISION` / `DO_NOT_PATCH`
