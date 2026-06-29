# Document Archive Apply Plan: <project-or-area>

Use this plan after Document Lifecycle has identified archive suggestions.

This plan is not an archive command. It does not delete, move, archive, rewrite
links, change source of truth, or approve cleanup completion.

## Human Decision Summary

Conclusion:

Recommended choice: A / B / C / D

Can AI continue now: yes / limited / no

What I need from you:

What happens if you do nothing:

## Archive Readiness

| Field | Value |
|---|---|
| State | NO_LIFECYCLE_EVIDENCE / NO_ARCHIVE_ACTION_READY / PLAN_ONLY / NEEDS_APPROVAL / BLOCKED_BY_SOURCE_OF_TRUTH / BLOCKED_BY_LINK_RISK |
| Can apply archive now? | No |
| Why |  |
| Lifecycle evidence |  |

## Source Evidence

| Evidence | Ref | Status |
|---|---|---|
| Document Lifecycle report |  | missing / present / reviewed |
| Source-of-truth replacement |  | missing / pending / confirmed |
| Owner approval |  | missing / pending / approved |

## Archive Action Plan

| Action ID | Source document | Proposed archive path | Replacement / source of truth | Reason | Status | Approval needed | Link check required | Rollback required |
|---|---|---|---|---|---|---|---|---|
| A-001 |  |  |  |  | PLAN_ONLY | Yes | Yes | Yes |

## Link Check Plan

| Check | Command or method | Required before apply | Required after apply | Owner | Status |
|---|---|---|---|---|---|
| Pre-apply reference search |  | Yes | No | Codex | planned |
| Post-apply reference search |  | No | Yes | Codex | planned |
| Broken-link handling |  | Yes | Yes | human / Codex | planned |

## Archive Index

Index path: `docs/archive/index.md`

| Original path | Archive path | Replacement / source of truth | Archive reason | Approval owner | Rollback path |
|---|---|---|---|---|---|
|  |  |  |  | human |  |

## Rollback Plan

| Archive action | Restore step | Link restore step | Evidence needed |
|---|---|---|---|
| A-001 |  |  |  |

## What Not To Archive

- Source-of-truth docs without explicit owner approval.
- AGENTS, agent rules, PR templates, CI workflows, hooks, release gates.
- Legal, license, security, privacy, compliance, or policy docs.
- Production, deployment, rollback, incident, migration, backup, or restore docs.
- Audit evidence, release evidence, historical session records, signed-off reports, and customer-facing handoff records.
- Docs containing secrets, credentials, private endpoints, customer data, or regulated records.

## Human Decisions Needed

| Decision | Options | Recommended | Owner | Status |
|---|---|---|---|---|
| Archive approval | approve later / defer / reject | defer until source of truth and link checks are clear | human | PENDING |

## Boundary

- This plan deletes files: No
- This plan moves or archives files now: No
- This plan authorizes archive apply: No
- This plan changes source of truth: No
- This plan changes links automatically: No
- This plan replaces Document Lifecycle: No
- This plan approves cleanup completion: No

## Outcome

`ARCHIVE_PLAN_RECORDED` / `NEEDS_HUMAN_DECISION` / `BLOCKED`
