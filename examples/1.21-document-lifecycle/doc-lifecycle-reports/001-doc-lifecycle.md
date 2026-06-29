# Document Lifecycle Report: governed project docs

Use this report to identify stale, duplicated, deprecated, or unclear documents
without deleting, moving, or archiving files by default.

This report is read-only by default. It does not delete files, authorize
deletion, move files, archive files, or change source of truth.

## Human Decision Summary

Conclusion: The project has one clear active baseline and one older planning
doc that should be reviewed as an archive suggestion.

Recommended choice: B

Can AI continue now: limited

What I need from you: Confirm whether the older planning doc should remain
active, be archived later, or receive a deprecation note.

| Option | What it means | What AI will do | Writes project files? | Risk | When to choose |
|---|---|---|---|---|---|
| A | Keep active | Keep as source of truth or active reference | No | low | Choose when the document is still current |
| B | Archive later | Record an archive suggestion | No | low/medium | Choose when a doc is likely stale but should remain recoverable |
| C | Deprecate later | Record a deprecation-note suggestion | No | low/medium | Choose when readers need a warning but the file stays in place |
| D | Merge later | Record a merge/reconciliation suggestion | No | medium | Choose when duplicated docs need owner review |
| E | Pause | Stop until owner or source of truth is clear | No | low | Choose when risk or ownership is unclear |

Recommended reason: Archive review keeps history available while preventing old
planning docs from being mistaken as current rules.

What happens if you do nothing: No project files are changed.

## Human Summary

Keep the current engineering baseline as the active authority and review the
older plan as an archive suggestion, not a deletion.

## Document Inventory

| Document | Current role | Lifecycle state | Evidence | Owner / source | Notes |
|---|---|---|---|---|---|
| docs/engineering-baseline.md | source of truth | ACTIVE_SOURCE_OF_TRUTH | project baseline path | project owner | cite and protect |
| docs/engineering-baseline-early-plan.md | active reference | ARCHIVE_CANDIDATE | older plan overlaps current baseline | project owner | archive suggestion only |
| docs/release-sop.md | protected operations | ACTIVE_REFERENCE | release process path | release owner | keep |

## Source Of Truth Map

| Topic | Source-of-truth document | Evidence | Confidence | Human decision needed |
|---|---|---|---|---|
| Engineering baseline | docs/engineering-baseline.md | current project baseline path | high | No |
| Release process | docs/release-sop.md | release SOP path | medium | No |
| Historical planning | PENDING_CONFIRMATION | older plan overlaps current baseline | low | Yes |

## Duplicate / Stale Candidates

| Candidate document | Suspected issue | Possible source of truth | Evidence | Recommended handling |
|---|---|---|---|---|
| docs/engineering-baseline-early-plan.md | stale | docs/engineering-baseline.md | older plan overlaps current baseline | archive suggestion |

## Archive Suggestions

| Document | Proposed archive path | Reason | Replacement / source of truth | Approval needed | Status |
|---|---|---|---|---|---|
| docs/engineering-baseline-early-plan.md | docs/archive/engineering-baseline-early-plan.md | older plan overlaps current baseline | docs/engineering-baseline.md | Yes | SUGGESTED |

## Deprecation Suggestions

| Document | Suggested deprecation note | Why | Approval needed | Status |
|---|---|---|---|---|
| None | n/a | no deprecation candidate detected | Yes before future deprecation note | SUGGESTED |

## What Not To Delete

- Source-of-truth docs unless a human explicitly approves a replacement.
- AGENTS, agent rules, PR templates, CI workflows, hooks, and release gates.
- Legal, license, security, privacy, compliance, or policy docs.
- Production, deployment, rollback, incident, migration, backup, or restore docs.
- Audit evidence, release evidence, historical session records, signed-off reports, and customer-facing handoff records.
- Docs containing secrets, credentials, private endpoints, customer data, or regulated records.

## Human Decisions Needed

| Decision | Options | Recommended | Owner | Status |
|---|---|---|---|---|
| Source of truth | keep / change / unclear | keep | human | PENDING |
| Archive action | none / archive later | archive later after approval | human | PENDING |
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

`DOCUMENT_LIFECYCLE_RECORDED`
