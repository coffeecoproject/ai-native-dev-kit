# Document Archive Apply

Document Archive Apply is the step after Document Lifecycle.

Plainly:

```text
Document Lifecycle says "this document may be stale".
Document Archive Apply says "if we archive it later, this is the safe plan".
```

It does not move or delete files by default.

## When To Use

Use it when:

- a project has many old docs
- Document Lifecycle found archive candidates
- old docs may confuse Codex or humans
- you want an archive index and rollback plan before any file move

## What Codex Produces

Codex should produce:

- archive readiness
- source evidence
- archive action plan
- link check plan
- archive index preview
- rollback plan
- permitted user input, if any

## What Must Be Proven

IntentOS/Codex proves:

- whether the archive should happen from authority, consumer, link, and
  freshness evidence
- which document is source of truth
- whether links may be updated
- whether risky docs must stay active

## Boundaries

This workflow does not:

- delete files
- move or archive files now
- authorize archive apply
- change source of truth
- rewrite links automatically
- replace Document Lifecycle
- approve cleanup completion

## Commands

```bash
node scripts/cli.mjs archive-apply .
node scripts/cli.mjs archive-apply-check .
```

Lower-level commands:

```bash
node scripts/resolve-document-archive-apply.mjs .
node scripts/check-document-archive-apply.mjs .
```

## Expected User Experience

The user should not need to inspect a technical doc graph.

Codex should say:

```text
I found one old planning doc that can be considered for archive.
I will not move it now.
If you approve later, I need to check links, add it to the archive index, and keep a rollback path.
```

## Relationship To Other Workflows

- Document Lifecycle identifies stale or duplicate candidates.
- Document Archive Apply prepares the controlled archive plan.
- Work Queue handles interrupted cleanup work.
- Review Surface and Review Loop review non-trivial archive changes.
- Safe Launch is still required before release or production claims.
