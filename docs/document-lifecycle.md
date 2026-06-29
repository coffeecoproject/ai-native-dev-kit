# Document Lifecycle

This page explains how AI Native Dev Kit handles old, duplicated, or unclear
project documents.

## Human Summary

When a project has too many docs, Codex should not guess which files to delete.
It should first make a document lifecycle map:

```text
what is source of truth
what is useful reference
what may be stale
what may be duplicated
what can be archived later
what must not be touched
```

The default is an archive suggestion, not deletion.

## Commands

Generate a read-only recommendation:

```bash
node scripts/cli.mjs doc-lifecycle .
node scripts/resolve-document-lifecycle.mjs .
node scripts/resolve-document-lifecycle.mjs . --json
```

Check recorded document lifecycle reports:

```bash
node scripts/cli.mjs doc-lifecycle-check .
node scripts/check-document-lifecycle.mjs .
```

`doc-lifecycle` does not write, move, archive, or delete target project files.
It only prints a recommendation.

Recorded reports live in `doc-lifecycle-reports/`.

## Recommended Flow

```text
doc-lifecycle
-> document lifecycle report
-> human chooses keep / archive later / deprecate later / merge later / pause
-> optional reviewed plan
-> controlled apply only if approved
```

## User Choices

| Choice | Meaning | Writes |
|---|---|---|
| A. Keep active | Keep the document as active or source of truth | No |
| B. Archive later | Propose moving it to archive after approval | No |
| C. Deprecate later | Propose a visible deprecation note after approval | No |
| D. Merge later | Propose combining duplicated docs after approval | No |
| E. Pause | Stop until owner or source of truth is clear | No |

## Boundary

This is not a delete command.

It does not:

- delete files
- authorize deletion
- move files
- archive files
- change source of truth
- change AGENTS, CI, hooks, release, legal, security, or production docs
- approve implementation or cleanup work

If Codex wants to do any of those, it must present a separate reviewed plan and
wait for human approval.
