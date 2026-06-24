# Workflow Version Record

## Current Dev Kit Version

`0.9.2`

## Project Version File

`.ai-native/version.json`

## Last Update

## Update Command

```bash
node ai-native-dev-kit/scripts/init-project.mjs --target <project> --update-workflow-assets
```

## Notes

- Workflow asset updates must not overwrite project docs, specs, tasks, logs, or business code.
- Workflow asset updates may add missing onboarding docs and missing workflow directories.
- Existing `.github/pull_request_template.md` files are not modified unless `--apply-pr-template-governance` is explicitly used after reviewing `.ai-native/migration-reports/pr-template-governance.md`.
- Version mismatch means the project may not have the latest workflow assets.
