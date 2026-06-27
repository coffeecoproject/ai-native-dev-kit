# Spec: Guided Adoption Entry

## Goal

Provide a first-hour entry point that lets Codex inspect a target project and recommend the right adoption path without requiring the user to choose lower-level commands.

## Command

```bash
node scripts/cli.mjs start <project>
```

## Behavior

`start` must:

- Run `workflow-next` in JSON mode.
- Run core workflow checks only when the project is at least partially bootstrapped.
- Classify the project into one of the approved adoption types.
- Print a Guided Adoption Recommendation in human-readable Markdown.
- Support `--json`.
- Be read-only by default.
- State that no target files were written.

## Project Types

- `NEW_PROJECT`
- `EXISTING_LIGHT_PROJECT`
- `GOVERNED_EXISTING_PROJECT`
- `PRODUCTION_SENSITIVE_PROJECT`
- `DIRTY_WORKTREE_PROJECT`
- `ALREADY_BOOTSTRAPPED_PROJECT`
- `UNKNOWN_NEEDS_DISCUSSION`
- `DEV_KIT_REPOSITORY`

## Recommendation Output

The report must include:

- Human Summary
- Project Classification
- Recommended Adoption Path
- Why This Path
- Decisions Needed From Human
- Safe Next Actions
- Actions AI Must Not Take Yet
- Generated Plan / Report Refs
- Technical Evidence
- Final Recommendation

## Safety Rules

- `Can AI write now` must be `No`.
- `start is read-only by default` must appear in the report.
- Industrial packs must not be default-enabled.
- BL2 and industrial packs must require explicit human confirmation.
- Existing governed, production-sensitive, and dirty projects must route to read-only or plan-first adoption.

## Saved Reports

If the recommendation is saved, it should go under:

```text
adoption-recommendations/<date>-guided-start.md
```

Saved reports are checked by:

```bash
node scripts/check-guided-adoption.mjs .
```

## Non-goals

- No external reviewer API integration.
- No automatic project writes.
- No new industrial-pack content.
- No new platform baseline depth.
- No package publishing.
