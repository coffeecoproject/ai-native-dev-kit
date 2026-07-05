# Contributing

## Human Summary

Changes to this repository should keep IntentOS installable, checkable, and safe for real project adoption. Small documentation fixes can stay lightweight. Productization, workflow, checker, CI, or template changes need workflow evidence and local verification.

## Required Checks

Run the core checks before opening a pull request:

```bash
node scripts/check-intentos.mjs
node scripts/check-fixtures.mjs
find scripts -name '*.mjs' -print0 | xargs -0 -n1 node --check
node scripts/score-output-quality.mjs examples/goal-subagent-l2-feature --min-score 80
node scripts/check-glossary-usage.mjs .
```

For productization phase work, also include the phase artifacts:

- request
- preflight
- spec
- eval
- task
- goal card
- subagent run plan
- review packet
- review loop report
- final report
- release or phase evidence when the change affects releases

## Scope Discipline

Do not combine unrelated phases. A phase that changes CLI behavior, manifest authority, init/update behavior, schemas, license wording, or industrial pack maturity needs its own task card and review evidence.

## Generated-Project Smoke

When a change affects initialization, workflow assets, scripts copied into target projects, or project checks, run a generated-project smoke:

```bash
tmp="$(mktemp -d)"
node scripts/init-project.mjs --starter generic-project --target "$tmp/project"
node "$tmp/project/scripts/check-ai-workflow.mjs" "$tmp/project" --mode core
node "$tmp/project/scripts/workflow-next.mjs" "$tmp/project"
node "$tmp/project/scripts/check-project-onboarding.mjs" "$tmp/project"
node "$tmp/project/scripts/check-engineering-baseline.mjs" "$tmp/project"
node "$tmp/project/scripts/check-workflow-version.mjs" "$tmp/project"
```

## Review Boundary

Reviewer feedback may create `AUTO_FIX`, `NEEDS_HUMAN_DECISION`, `NEEDS_CLARIFICATION`, or `NO_ACTION` findings. Only `AUTO_FIX` findings may be repaired automatically, and only inside the approved task scope.
