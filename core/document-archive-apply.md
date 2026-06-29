# Document Archive Apply Governance

Document Archive Apply Governance turns Document Lifecycle archive suggestions
into a controlled, reviewable archive plan.

It is an execution-planning layer. It does not delete files, move files,
archive files, rewrite links, change source of truth, or approve cleanup by
itself.

Machine-checkable boundary:

- The plan deletes files: No
- The plan moves or archives files now: No
- The plan authorizes archive apply: No
- The plan changes source of truth: No
- The plan changes links automatically: No
- The plan replaces Document Lifecycle: No
- The plan approves cleanup completion: No

## Purpose

Use this protocol only after Document Lifecycle evidence exists or after Codex
has produced a read-only document lifecycle recommendation.

The goal is to answer:

```text
Which archive suggestions are ready for a reviewed apply plan?
Which source-of-truth document replaces the archived document?
Which links must be checked before and after apply?
What archive index entry is required?
How can the archive action be rolled back?
Which human approval is still required?
```

## Relationship To Document Lifecycle

Document Lifecycle identifies document state and archive suggestions.
Document Archive Apply plans how an approved archive would happen.

Document Archive Apply must not be used to bypass Document Lifecycle. If there
is no lifecycle evidence, the plan must say `NO_LIFECYCLE_EVIDENCE` or
`NO_ARCHIVE_ACTION_READY`.

## Archive Apply States

| State | Meaning | Codex action |
|---|---|---|
| `NO_LIFECYCLE_EVIDENCE` | No lifecycle report or recommendation exists | run lifecycle first |
| `NO_ARCHIVE_ACTION_READY` | No archive candidate is ready for planning | keep active |
| `PLAN_ONLY` | Archive move is described but not approved | wait for human |
| `NEEDS_APPROVAL` | Candidate needs owner/source-of-truth approval | stop for human |
| `BLOCKED_BY_SOURCE_OF_TRUTH` | Replacement authority is unclear | stop for owner |
| `BLOCKED_BY_LINK_RISK` | Links or references are not checkable | define link check first |

## Required Plan Sections

Every Archive Apply Plan must include:

- Human Decision Summary
- Archive Readiness
- Source Evidence
- Archive Action Plan
- Link Check Plan
- Archive Index
- Rollback Plan
- What Not To Archive
- Human Decisions Needed
- Boundary
- Outcome

## Archive Action Rules

Archive actions are plan-only unless a separate human-approved apply task exists.

Each planned action must include:

- source document
- proposed archive path
- replacement or source of truth
- reason
- action status
- approval needed
- link check required
- rollback required

The default action status is `PLAN_ONLY`.

## Link Check Rules

Before any archive apply claim, Codex must define how links and references will
be checked.

At minimum, the plan must include:

- pre-apply reference search
- post-apply reference search
- unresolved-reference handling
- owner for broken links

The plan may name commands such as `rg "<source document>" .`, but the plan
does not run or pass those checks by itself unless evidence is recorded.

## Archive Index Rules

Every archive apply plan must include an Archive Index preview.

The index must record:

- original path
- archive path
- replacement or source of truth
- archive reason
- date or planned date
- approval owner
- rollback path

The index preview does not mean the archive index file was written.

## Rollback Rules

Every archive action must describe how to restore the archived file to the
original path and how to restore any changed links.

If rollback is unclear, outcome must be `BLOCKED_BY_LINK_RISK` or
`BLOCKED_BY_SOURCE_OF_TRUTH`.

## What Not To Archive

Do not archive:

- source-of-truth docs without explicit owner approval
- `AGENTS.md`, agent rules, PR templates, CI workflows, hooks, or release gates
- legal, license, security, privacy, compliance, or policy docs
- production, deployment, rollback, incident, migration, backup, or restore docs
- audit evidence, release evidence, historical session records, signed-off
  reports, or customer-facing handoff records
- docs containing secrets, credentials, private endpoints, customer data, or
  regulated records

## Allowed Claims

- An archive apply plan was produced.
- Archive candidates were mapped to proposed archive paths.
- Link check and rollback requirements were identified.
- An archive index preview was produced.

## Forbidden Claims

- Files were archived.
- Files were moved or deleted.
- Archive apply was approved.
- Links were fixed.
- Source of truth was changed.
- Documentation cleanup is complete.
