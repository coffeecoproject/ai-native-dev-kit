# Document Lifecycle Governance

Document Lifecycle Governance defines how Codex should identify stale,
duplicated, deprecated, conflicting, or unclear project documents without
turning cleanup into silent deletion.

It is a governance layer for documents. It is not a cleanup command. It does
not delete files, move files, archive files, rewrite source-of-truth documents,
or approve documentation changes by itself.

Machine-checkable boundary:

- The report does not delete files.
- The report does not authorize deletion.
- The report does not move or archive files.
- The report does not change source of truth.

## Purpose

Use this protocol when a project has many documents, old plans, duplicate
baselines, conflicting instructions, unclear owners, or outdated generated
workflow artifacts.

The goal is to answer:

```text
Which document is source of truth?
Which documents are active references?
Which documents may be stale or duplicated?
Which documents should be archived later?
Which documents must not be touched?
What human decision is needed before any move, deprecation, rewrite, or deletion?
```

## Default Rule

For stale, duplicated, or unclear documents, Codex must recommend archive review
before recommending deletion.

Codex must recommend archive review before recommending deletion.

The default recommendation is "archive suggestion", not deletion.

## Lifecycle States

| State | Meaning | Codex action |
|---|---|---|
| `ACTIVE_SOURCE_OF_TRUTH` | Current authority for project decisions | cite and protect |
| `ACTIVE_REFERENCE` | Useful supporting document | keep |
| `DUPLICATE_CANDIDATE` | Appears to overlap another document | propose owner review |
| `STALE_CANDIDATE` | Appears old, contradicted, or superseded | propose archive review |
| `ARCHIVE_CANDIDATE` | May be moved to archive after approval | suggest archive only |
| `DEPRECATION_CANDIDATE` | Should remain visible but marked no longer current | suggest deprecation note only |
| `RETIRED_REFERENCE` | Historical evidence that should remain readable | keep as history |
| `UNKNOWN_NEEDS_OWNER` | Not enough evidence to classify | stop for owner |

## Source Of Truth Rules

Codex may identify likely source-of-truth documents, but must not declare or
change source of truth without evidence or human confirmation.

Source-of-truth evidence can include:

- `AGENTS.md` or platform agent rules
- `README.md` when it explicitly routes users
- project profile, engineering baseline, environment baseline, or release SOP
- architecture, ADR, API contract, schema, permission model, or test strategy
- CI, manifest, package scripts, or checked release evidence
- explicit human decision in a recorded report

When documents conflict, Codex must present the conflict and ask for a decision.
It must not pick the newer file just because it is newer.

## Archive Suggestion Rules

Archive suggestions should include:

- current path
- proposed archive path, if known
- reason for archive review
- source-of-truth replacement or owner
- risk if kept active
- risk if archived
- approval needed

Archive suggestions do not move files. They are planning evidence only.

## Deprecation Rules

Deprecation is different from deletion.

Use deprecation when a document should remain in place for compatibility or
historical reasons, but readers need a warning that it is no longer current.

Codex may suggest a deprecation note, but must not apply it without approval
when the document is a baseline, release record, governance document, public
README, legal/security document, or production runbook.

## What Not To Touch

Codex must not delete, move, rewrite, or weaken:

- source-of-truth docs
- `AGENTS.md`, agent rules, PR templates, CI workflows, hooks, or release gates
- legal, license, security, privacy, compliance, or policy docs
- production, deployment, rollback, incident, migration, backup, or restore docs
- audit evidence, release evidence, historical session records, signed-off
  reports, or customer-facing handoff records
- docs containing secrets, credentials, private endpoints, customer data, or
  regulated records

## Human Decision Boundary

Human approval is required before:

- moving a document into an archive path
- deleting a document
- marking a source-of-truth document deprecated
- changing source-of-truth ownership
- rewriting duplicated documents into one new authority
- changing public docs, legal/security docs, release docs, CI docs, or agent rules

## Allowed Claims

- A document lifecycle inventory was produced.
- Possible stale, duplicate, archive, or deprecation candidates were identified.
- Source-of-truth candidates were mapped with evidence status.
- Archive suggestions require human approval before file moves.

## Forbidden Claims

- Documents were cleaned up.
- Files were deleted, moved, or archived.
- Source of truth was changed.
- Stale docs were safely removed.
- The project documentation is now complete or fully current.
