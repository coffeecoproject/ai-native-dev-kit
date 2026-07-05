# Product Adoption Trust Finalization 1.68.2 Plan

## Purpose

1.68.2 is a narrow trust finalization patch after 1.68.1.

It does not introduce the 1.69 old-project native adoption decision layer. It only closes public adoption trust gaps:

- source-only prerequisites;
- command alias wording;
- dirty-project wording precision;
- release evidence for GitHub Release publication.

## Scope

Included:

- Update version metadata to `1.68.2`.
- Show command aliases consistently as `intentos`.
- Add Node/npm/git prerequisites to source-only adoption docs.
- Clarify dirty projects stop before workflow update or task execution; any workflow asset update after review remains plan-first.
- Add 1.68.2 release evidence.

Not included:

- npm package publication.
- Installer, dashboard, TUI, or hosted service.
- 1.69 old-project native adoption decision behavior.
- New write authority.
- GitHub Release creation from source files; this remains repository operation after source verification.

## Acceptance

- `node scripts/cli.mjs --version` prints `1.68.2`.
- `node scripts/cli.mjs --help` contains `Command: intentos`.
- `docs/source-only-adoption.md` lists Node `>=22`, npm, and git prerequisites.
- Release evidence exists under `releases/1.68.2/`.
- `node scripts/check-manifest.mjs` passes.
- `node scripts/check-intentos.mjs` passes.
- `git diff --check` passes.
