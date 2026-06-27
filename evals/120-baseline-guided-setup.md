# Eval 120: Baseline Guided Setup

## Acceptance

- `node scripts/cli.mjs baseline .` works and writes nothing to the target.
- `node scripts/cli.mjs baseline . --json` is parseable.
- `node scripts/baseline-project.mjs . --write-plan <file>` writes only the plan.
- `node scripts/baseline-project.mjs --apply-plan <file>` refuses unsafe paths and secret values.
- `node scripts/check-environment-baseline.mjs .` is advisory by default and strict with `--strict`.
- `node scripts/check-baseline-enforcement.mjs . --mode ready` checks task refs without source-code deep scanning.
- Generated project assets include baseline scripts, environment template, and baseline docs.
- Bad fixtures fail for obvious secret misuse and missing baseline refs.
