# Patch Classification Report

## Human Decision Summary

Compatibility heading: semantically this is the bounded `User Input Summary`; it grants no technical decision authority.

Conclusion:

User input class: NO_USER_ACTION / BUSINESS_FACT_NEEDED / REAL_WORLD_CONSENT_NEEDED / EXTERNAL_FACT_NEEDED

User input needed now: Yes / No

Plain-language question or exact consent request, if needed:

Why project evidence cannot answer it:

What happens if you do nothing:

## Codex Repair Decision And Evidence

Selected repair class: SAFE_LOCAL_FIX / BASELINE_ALIGNED_HARDCUT / STRUCTURAL_REMEDIATION / BLOCKED_BY_EVIDENCE / DO_NOT_PATCH

Can Codex continue now: yes / limited / no

Root-cause evidence:

Scope and affected surfaces:

Risk response and rollback:

Verification and review route:

Technical recovery after repeated failure:

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

None / Requires Codex plan / Exact real-world consent required:

Notes:

## Affected Baselines

- 

## Affected Surfaces

- 

## Required Evidence

- 

## Required Human Decisions

Compatibility heading: semantically this is the bounded `User Input Queue`; repair mechanics are excluded.

| Input class | Missing business fact, exact prepared effect, or external fact | Why project evidence is insufficient | Source | Status |
|---|---|---|---|---|
| NO_USER_ACTION / BUSINESS_FACT_NEEDED / REAL_WORLD_CONSENT_NEEDED / EXTERNAL_FACT_NEEDED |  |  | user / external authority / N/A | PENDING / PROVIDED / CONSENTED / NOT_REQUIRED |

## Verification Plan

- 

## Implementation Authorization

Patch classification authorizes implementation: No

Required entry before implementation:

- request-bound task / required bounded user input / separate Codex remediation plan

## Outcome

`CLASSIFIED_ONLY` / `NEEDS_HUMAN_DECISION` / `DO_NOT_PATCH`
