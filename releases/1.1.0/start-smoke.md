# Start Smoke: 1.1.0

## Purpose

Prove the new `start` entry runs without writing target project files.

## Commands

```bash
node scripts/cli.mjs start .
node scripts/cli.mjs start . --json
```

## Expected

- Human output includes `# Guided Adoption Recommendation`.
- Human output includes `Can AI write now | No`.
- Human output includes `start is read-only by default`.
- Human output includes `target files written by start | No`.
- JSON output includes `startIsReadOnlyByDefault: true`.

## Result

PASS.
