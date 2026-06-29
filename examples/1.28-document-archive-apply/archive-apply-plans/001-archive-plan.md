# Document Archive Apply Plan: governed project docs

Use this plan after Document Lifecycle has identified archive suggestions.

This plan is not an archive command. It does not delete, move, archive, rewrite
links, change source of truth, or approve cleanup completion.

## Human Decision Summary

Conclusion: One old engineering baseline plan can be prepared for future archive review, but source-of-truth and link checks must remain explicit.

Recommended choice: B

Can AI continue now: limited

What I need from you: Confirm whether `docs/engineering-baseline.md` is the replacement source of truth and whether the old plan may be archived in a separate approved task.

What happens if you do nothing: No files are deleted, moved, archived, or rewritten.

## Archive Readiness

| Field | Value |
|---|---|
| State | `NEEDS_APPROVAL` |
| Can apply archive now? | No |
| Why | Archive action is plan-ready but not approved. |
| Lifecycle evidence | `doc-lifecycle-reports/001-doc-lifecycle.md` |

## Source Evidence

| Evidence | Ref | Status |
|---|---|---|
| Document Lifecycle report | `doc-lifecycle-reports/001-doc-lifecycle.md` | reviewed |
| Source-of-truth replacement | `docs/engineering-baseline.md` | pending |
| Owner approval | project owner | pending |

## Archive Action Plan

| Action ID | Source document | Proposed archive path | Replacement / source of truth | Reason | Status | Approval needed | Link check required | Rollback required |
|---|---|---|---|---|---|---|---|---|
| A-001 | `docs/engineering-baseline-early-plan.md` | `docs/archive/engineering-baseline-early-plan.md` | `docs/engineering-baseline.md` | older plan overlaps current baseline | PLAN_ONLY | Yes | Yes | Yes |

## Link Check Plan

| Check | Command or method | Required before apply | Required after apply | Owner | Status |
|---|---|---|---|---|---|
| Pre-apply reference search | `rg "docs/engineering-baseline-early-plan.md" .` | Yes | No | Codex | planned |
| Post-apply reference search | `rg "docs/engineering-baseline-early-plan.md" .` | No | Yes | Codex | planned |
| Broken-link handling | Review unresolved references and update only after approval. | Yes | Yes | human / Codex | planned |

## Archive Index

Index path: `docs/archive/index.md`

| Original path | Archive path | Replacement / source of truth | Archive reason | Approval owner | Rollback path |
|---|---|---|---|---|---|
| `docs/engineering-baseline-early-plan.md` | `docs/archive/engineering-baseline-early-plan.md` | `docs/engineering-baseline.md` | older plan overlaps current baseline | human | `docs/engineering-baseline-early-plan.md` |

## Rollback Plan

| Archive action | Restore step | Link restore step | Evidence needed |
|---|---|---|---|
| A-001 | Restore `docs/archive/engineering-baseline-early-plan.md` to `docs/engineering-baseline-early-plan.md`. | Restore references found by pre/post link checks. | Approval record, link-check output, and archive index diff. |

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
| Source of truth | confirm / defer / reject | confirm before apply | human | PENDING |
| Archive approval | approve later / defer / reject | defer until link checks are clear | human | PENDING |
| Link update approval | approve later / defer / no link changes | defer | human | PENDING |

## Boundary

- This plan deletes files: No
- This plan moves or archives files now: No
- This plan authorizes archive apply: No
- This plan changes source of truth: No
- This plan changes links automatically: No
- This plan replaces Document Lifecycle: No
- This plan approves cleanup completion: No

## Outcome

`NEEDS_HUMAN_DECISION`
