# Release 1.21.0: Document Lifecycle Governance

## Human Summary

1.21.0 adds document lifecycle governance.

It helps Codex explain which documents are active, stale, duplicated,
deprecated, archive candidates, or source-of-truth candidates without deleting,
moving, or archiving project files.

## What Changed

- Added `core/document-lifecycle.md`.
- Added `docs/document-lifecycle.md`.
- Added `templates/document-lifecycle-report.md`.
- Added `checklists/document-lifecycle-review.md`.
- Added `prompts/document-lifecycle-agent.md`.
- Added `doc-lifecycle-reports/` as the report directory.
- Added `scripts/resolve-document-lifecycle.mjs` for read-only document mapping.
- Added `scripts/check-document-lifecycle.mjs` for recorded report validation.
- Added CLI entries: `doc-lifecycle` and `doc-lifecycle-check`.
- Added an example and bad fixtures for document lifecycle reports.

## Allowed Claims

- 1.21.0 helps Codex identify document lifecycle state before cleanup.
- 1.21.0 maps possible source-of-truth documents and stale/duplicate candidates.
- 1.21.0 defaults to archive suggestions before deletion.
- 1.21.0 checks recorded reports for deletion authorization and source-of-truth overclaims.

## Forbidden Claims

- Do not claim 1.21.0 deletes, moves, archives, rewrites, or deprecates files.
- Do not claim 1.21.0 changes source of truth.
- Do not claim 1.21.0 proves the project's documentation is fully current.
- Do not claim 1.21.0 approves cleanup, implementation, release, production,
  legal, security, privacy, compliance, migration, permission, or data decisions.
- Do not claim 1.21.0 solves work queue or hook orchestration; those remain
  later phases.

## Evidence Status

- Evidence is based on local repository checks, examples, bad fixtures, and
  source self-check.
- No target project documents were deleted, moved, archived, rewritten, or
  deprecated by this release.
- No production, legal, security, compliance, or documentation-completeness
  readiness is claimed.

## Known Limitations

- `doc-lifecycle` prints a read-only recommendation; it does not write a report
  into the target project.
- 1.21.0 does not delete files, authorize deletion, move files, archive files,
  or change source of truth.
- It inventories document signals, but it does not fully understand every
  project-specific ownership rule or historical reason for keeping a document.
- Archive and deprecation suggestions still require human approval and a
  separate reviewed plan before any file changes.
- Work queue and hook orchestration remain later phases.

## Verification

Required checks:

```bash
node scripts/resolve-document-lifecycle.mjs .
node scripts/resolve-document-lifecycle.mjs . --json
node scripts/check-document-lifecycle.mjs .
node scripts/check-document-lifecycle.mjs examples/1.21-document-lifecycle
npm run verify:release
npm run verify
git diff --check
```

## Next

Next work may deepen work queues or hook orchestration as separate phases. Do
not fold them into 1.21 retroactively.
