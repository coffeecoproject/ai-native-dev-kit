# Document Lifecycle Report: <project-or-area>

Use this report to identify stale, duplicated, deprecated, or unclear documents
without deleting, moving, or archiving files by default.

This report is read-only by default. It does not delete files, authorize
deletion, move files, archive files, or change source of truth.

## Human Decision Summary

Conclusion:

Recommended choice: A / B / C / D / E

Can AI continue now: yes / limited / no

What I need from you:

| Option | What it means | What AI will do | Writes project files? | Risk | When to choose |
|---|---|---|---|---|---|
| A | Keep active | Keep as source of truth or active reference | No | low | Choose when the document is still current |
| B | Archive later | Record an archive suggestion | No | low/medium | Choose when a doc is likely stale but should remain recoverable |
| C | Deprecate later | Record a deprecation-note suggestion | No | low/medium | Choose when readers need a warning but the file stays in place |
| D | Merge later | Record a merge/reconciliation suggestion | No | medium | Choose when duplicated docs need owner review |
| E | Pause | Stop until owner or source of truth is clear | No | low | Choose when risk or ownership is unclear |

Recommended reason:

What happens if you do nothing:

## Human Summary

One-sentence conclusion for this document lifecycle review.

## Document Inventory

| Document | Current role | Lifecycle state | Evidence | Owner / source | Notes |
|---|---|---|---|---|---|
|  | source of truth / reference / historical / unknown | ACTIVE_SOURCE_OF_TRUTH / ACTIVE_REFERENCE / DUPLICATE_CANDIDATE / STALE_CANDIDATE / ARCHIVE_CANDIDATE / DEPRECATION_CANDIDATE / RETIRED_REFERENCE / UNKNOWN_NEEDS_OWNER |  |  |  |

## Source Of Truth Map

| Topic | Source-of-truth document | Evidence | Confidence | Human decision needed |
|---|---|---|---|---|
|  |  |  | low / medium / high | Yes / No |

## Duplicate / Stale Candidates

| Candidate document | Suspected issue | Possible source of truth | Evidence | Recommended handling |
|---|---|---|---|---|
|  | duplicate / stale / conflicting / unclear |  |  | keep / archive suggestion / deprecation suggestion / merge suggestion / needs owner |

## Archive Suggestions

| Document | Proposed archive path | Reason | Replacement / source of truth | Approval needed | Status |
|---|---|---|---|---|---|
|  |  |  |  | Yes | SUGGESTED |

## Deprecation Suggestions

| Document | Suggested deprecation note | Why | Approval needed | Status |
|---|---|---|---|---|
|  |  |  | Yes | SUGGESTED |

## What Not To Delete

- Source-of-truth docs unless a human explicitly approves a replacement.
- AGENTS, agent rules, PR templates, CI workflows, hooks, release gates.
- Legal, license, security, privacy, compliance, or policy docs.
- Production, deployment, rollback, incident, migration, backup, or restore docs.
- Audit evidence, release evidence, historical session records, signed-off reports, and customer-facing handoff records.
- Docs containing secrets, credentials, private endpoints, customer data, or regulated records.

## Human Decisions Needed

| Decision | Options | Recommended | Owner | Status |
|---|---|---|---|---|
| Source of truth | keep / change / unclear | keep | human | PENDING |
| Archive action | none / archive later | none | human | PENDING |
| Deprecation action | none / add note later | none | human | PENDING |
| Merge action | none / merge later | none | human | PENDING |
| Deletion action | none / separate reviewed deletion plan | none | human | PENDING |

## Boundary

- This report deletes files: No
- This report authorizes deletion: No
- This report moves or archives files: No
- This report changes source of truth: No
- This report changes AGENTS, CI, hooks, release, legal, security, or production docs: No
- This report approves implementation or cleanup work: No

## Outcome

`DOCUMENT_LIFECYCLE_RECORDED` / `NEEDS_HUMAN_DECISION` / `BLOCKED`
