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
- `.ai-native/core/environment-baseline.md`
- `.ai-native/core/baseline-enforcement.md`
- `.ai-native/templates/environment-baseline.md`
- `.ai-native/templates/baseline-recommendation-report.md`
- `.ai-native/templates/baseline-gap-report.md`
- `.ai-native/docs/baseline-setup.md`

## Expected Commands

```bash
node scripts/check-ai-workflow.mjs . --mode core
node scripts/check-environment-baseline.mjs .
node scripts/check-baseline-enforcement.mjs . --mode ready
```

## Evidence Status

Passed.

## Verified Evidence

- Generated project initialization passed in `check-dev-kit`.
- Generated project workflow, workflow-next, onboarding, platform baseline, selected industrial pack, and workflow asset update checks passed.
- Generated project includes the 1.2 baseline scripts, environment baseline assets, baseline folders, AGENTS guidance, and PR template markers.
