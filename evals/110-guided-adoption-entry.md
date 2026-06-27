# Eval: Guided Adoption Entry

## Acceptance Criteria

- `node scripts/cli.mjs --help` lists `start`.
- `node scripts/cli.mjs start .` returns a Guided Adoption Recommendation.
- `start` says `Can AI write now | No`.
- `start` says `start is read-only by default`.
- `start` records `target files written by start | No`.
- `start --json` returns structured classification and recommendation data.
- Empty target projects classify as `NEW_PROJECT`.
- Saved recommendation examples pass `check-guided-adoption`.
- Generated projects receive `scripts/start-project.mjs`, `scripts/check-guided-adoption.mjs`, `adoption-recommendations/`, and `.ai-native/templates/adoption-recommendation-report.md`.
- Manifest and workflow-version assets include the new generated-project surface.
- Dev-kit self-check passes.

## Commands

```bash
node --check scripts/start-project.mjs
node --check scripts/check-guided-adoption.mjs
node scripts/cli.mjs --help
node scripts/cli.mjs start .
node scripts/cli.mjs start . --json
node scripts/check-guided-adoption.mjs examples/1.1-guided-adoption/new-project
node scripts/check-guided-adoption.mjs examples/1.1-guided-adoption/existing-light-project
node scripts/check-guided-adoption.mjs examples/1.1-guided-adoption/governed-readonly
node scripts/check-manifest.mjs
node scripts/check-dev-kit.mjs
```

## Failure Cases

- A report that allows AI writes from `start` must fail.
- A report that omits human decisions must fail.
- A governed-project recommendation that allows direct setup must fail.
- A BL2 or industrial-pack recommendation without human confirmation must fail.
