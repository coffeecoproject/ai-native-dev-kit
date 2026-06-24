# Workflow Version Record

## Current Dev Kit Version

`0.8.0`

## Project Version File

`.ai-native/version.json`

## Last Update

## Update Command

```bash
node ai-native-dev-kit/scripts/init-project.mjs --target <project> --update-workflow-assets
```

## Notes

- Workflow asset updates must not overwrite project docs, specs, tasks, logs, or business code.
- Workflow asset updates may add missing onboarding docs, missing workflow directories, and append missing governance markers to `.github/pull_request_template.md`.
- Version mismatch means the project may not have the latest workflow assets.
