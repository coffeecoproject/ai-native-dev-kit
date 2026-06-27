# 1.2.0 Baseline Smoke

## Scope

Simulated baseline guided setup smoke.

## Commands

```bash
node scripts/cli.mjs baseline .
node scripts/cli.mjs baseline . --json
node scripts/baseline-project.mjs . --write-plan /tmp/ai-native-baseline-plan.json
node scripts/check-environment-baseline.mjs .
node scripts/check-baseline-enforcement.mjs . --mode ready
```

## Expected Results

- `baseline` prints a read-only recommendation.
- JSON mode is parseable.
- Write-plan writes only the plan file.
- Apply-plan is limited to approved baseline docs and report folders.
- Environment checker fails obvious secret values.
- Enforcement checker catches missing task baseline refs.

## Evidence Status

Passed.

## Verified Evidence

- `baseline` prints a read-only recommendation and `Can AI write now: No`.
- JSON mode returns machine-readable recommendation output.
- `check-environment-baseline.mjs` reports missing target docs as advisory by default and fails obvious secret-bearing baseline files.
- `check-baseline-enforcement.mjs` passes the 1.2 task-scoped artifact and fails the bad fixtures for missing baseline references and missing BL2 review-loop evidence.
