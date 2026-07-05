# 1.2.0 Generated Project Smoke

## Scope

Generated-project smoke for baseline assets.

## Expected Generated Assets

- `docs/environment-baseline.md`
- `baseline-recommendations/`
- `baseline-gap-reports/`
- `scripts/baseline-project.mjs`
- `scripts/check-environment-baseline.mjs`
- `scripts/check-baseline-enforcement.mjs`
- `.intentos/core/environment-baseline.md`
- `.intentos/core/baseline-enforcement.md`
- `.intentos/templates/environment-baseline.md`
- `.intentos/templates/baseline-recommendation-report.md`
- `.intentos/templates/baseline-gap-report.md`
- `.intentos/docs/baseline-setup.md`

## Expected Commands

```bash
node scripts/check-ai-workflow.mjs . --mode core
node scripts/check-environment-baseline.mjs .
node scripts/check-baseline-enforcement.mjs . --mode ready
```

## Evidence Status

Passed.

## Verified Evidence

- Generated project initialization passed in `check-intentos`.
- Generated project workflow, workflow-next, onboarding, platform baseline, selected industrial pack, and workflow asset update checks passed.
- Generated project includes the 1.2 baseline scripts, environment baseline assets, baseline folders, AGENTS guidance, and PR template markers.
