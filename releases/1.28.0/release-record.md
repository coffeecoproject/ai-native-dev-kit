# Release Record: 1.28.0

## Summary

`1.28.0` adds Document Archive Apply Governance.

It lets Codex turn Document Lifecycle archive suggestions into a reviewable
Archive Apply Plan with link checks, an archive index preview, and rollback
steps before any future approved archive action.

## Added

- `core/document-archive-apply.md`
- `docs/document-archive-apply.md`
- `templates/document-archive-apply-plan.md`
- `templates/archive-index.md`
- `checklists/document-archive-apply-review.md`
- `prompts/document-archive-agent.md`
- `archive-apply-plans/`
- `scripts/resolve-document-archive-apply.mjs`
- `scripts/check-document-archive-apply.mjs`
- 1.28 example and bad fixtures

## Boundary

This release does not:

- delete files
- move or archive files now
- authorize archive apply
- change source of truth
- rewrite links automatically
- replace Document Lifecycle
- approve cleanup completion

## Allowed Claims

- IntentOS can produce a read-only Document Archive Apply Plan through `archive-apply`.
- Archive Apply Plans can map source documents to proposed archive paths, link-check steps, archive index entries, and rollback steps.
- The checker validates recorded plans for archive-approval overclaims, missing Archive Index, missing link checks, missing rollback, and cleanup-completion claims.
- Generated projects receive the 1.28 archive apply scripts, template, prompt, checklist, protocol, documentation, and plan directory through manifest-managed workflow assets.

## Forbidden Claims

- Do not claim that 1.28 archives, moves, deletes, cleans, deduplicates, or fixes project documentation.
- Do not claim that a Document Archive Apply Plan authorizes archive apply, source-of-truth changes, automatic link updates, or cleanup completion.
- Do not claim that Archive Apply replaces Document Lifecycle, Review Loop, Work Queue, Safe Launch, Hook Policy, or human approval.
- Do not claim that an archive index preview means the archive index file was written.

## Evidence Status

- Source assets, examples, bad fixtures, CLI commands, generated-project copy rules, and workflow-version assets are recorded in `intentos-manifest.json`.
- `scripts/check-document-archive-apply.mjs` validates source and generated Archive Apply Plans and rejects 1.28 bad fixtures for archive-authorization and missing archive index.
- Full release evidence is recorded in `releases/1.28.0/self-check-report.md`; `node scripts/check-intentos.mjs`, `npm run verify`, and `git diff --check` passed.

## Known Limitations

- Archive Apply is plan-first. It does not perform file moves.
- Link checks are planned unless command evidence is recorded separately.
- Source-of-truth selection and archive approval still require human decisions.
- Deletion remains out of scope and requires a separate reviewed deletion plan.

## Verification

See `releases/1.28.0/self-check-report.md`.
