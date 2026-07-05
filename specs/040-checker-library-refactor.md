---
schema_version: 1.0
artifact_type: spec
number: "040"
slug: checker-library-refactor
title: Checker Library Refactor
status: ready
created_at: "2026-06-27"
intentos_version: 0.40.1
request: requests/040-checker-library-refactor.md
preflight: preflight/040-checker-library-refactor.md
---
# Spec 040: Checker Library Refactor

## Status

Ready

## Source

- Request: `requests/040-checker-library-refactor.md`
- Preflight: `preflight/040-checker-library-refactor.md`

## Problem

Checker scripts duplicate basic plumbing for CLI args, Markdown sections, file walking, result recording, git state, and project signals. This makes the codebase harder to maintain as more checkers and fixture cases are added.

## User Story

As a intentos maintainer, I want repeated checker plumbing moved into shared libraries, so future checker changes are smaller, easier to review, and protected by the existing fixture matrix.

## Scope

Included:

- Add dependency-free shared helpers under `scripts/lib/`.
- Refactor repeated `parseArgs`, `sectionBody`, and file walking logic where fixture coverage protects behavior.
- Add shared result helpers where a script can adopt them without changing output.
- Add shared project signal helpers for scripts that already classify project state.
- Update manifest, version metadata, and phase evidence for the new libraries and artifacts.
- Preserve existing command names, flags, stdout/stderr shape, and exit status behavior.

## Non-goals

- No new workflow concept.
- No checker semantic change.
- No package dependency addition.
- No generated project snapshot.
- No migration command implementation.
- No change to platform or industrial baseline policy.

## Data Model Impact

New or changed entities:

- No business data model changes.
- New internal helper modules:
  - `scripts/lib/args.mjs`
  - `scripts/lib/markdown.mjs`
  - `scripts/lib/check-result.mjs`
  - `scripts/lib/git.mjs`
  - `scripts/lib/project-signals.mjs`

## API / Interface Contract

### Shared args helper

Input:

```js
parseArgs(process.argv.slice(2))
```

Output:

```js
{ _: ["."], json: true, mode: "ready" }
```

Errors:

- No direct process exit. Callers keep their existing unknown-option validation.

### Shared Markdown helper

Input:

```js
sectionBody(markdownContent, "Scope")
```

Output:

```js
"Allowed:\n- ..."
```

Errors:

- Missing section returns `null` by default.
- Callers that need empty-string fallback handle it locally.

### Shared file walking helper

Input:

```js
walkFiles(rootDir, { extensions: [".md"] })
```

Output:

```js
["/abs/path/file.md"]
```

Errors:

- Missing directory returns an empty array.

## UI States

No UI is introduced. Human-facing CLI output must remain readable and stable.

## Permission Rules

- No permission model changes.
- No external service calls.
- No secret or token handling changes.
- Git helper functions must be read-only.

## Observability

- Logs: existing checker stdout and stderr remain the evidence surface.
- Metrics: fixture count and pass/fail summaries remain in `check-fixtures`.
- Audit events: phase artifacts and release report record the refactor boundary and verification commands.

## Acceptance Criteria

- Shared helper files exist and are used by covered checker scripts.
- Fixture matrix passes after refactor.
- Dev-kit self-check passes.
- No new package dependency is added.
- No newly copied `parseArgs`, `sectionBody`, or recursive file walker appears in scripts where a shared helper can be used safely.
- Any behavior drift is either absent or explicitly documented with fixture expectation changes and review notes.

## Test Plan

- Unit: `node --check` for all `.mjs` scripts.
- Integration: `node scripts/check-fixtures.mjs`.
- E2E: `node scripts/check-intentos.mjs`.
- Manual: inspect git diff for helper scope, output drift, dependency changes, and manifest coverage.

## Rollback Notes

Rollback by reverting the 0.40.1 commit. Since this phase changes internal helper usage only, rollback should restore the previous duplicated helper implementations without target project data migration.

## Open Questions

- No open product question for this phase.
