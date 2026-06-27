# Subagent Run Plan 120: Baseline Guided Setup

## Purpose

Use subagents only for bounded review or fixture verification when available.

## Planned Roles

| Role | Scope | Must Close |
|---|---|---|
| Reviewer | Check boundaries, docs, examples, and failure policy. | Yes |
| Fixture auditor | Check bad fixtures and generated-project smoke expectations. | Yes |

## Rules

- Subagents do not make final decisions.
- Subagents do not write files unless explicitly assigned.
- After use, summarize results and close the subagent context to avoid occupying capacity.
