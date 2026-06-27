# Generated Project Smoke: 1.0.0

## Status

Status: PASS

## Commands

```text
node scripts/cli.mjs init --starter generic-project --target /tmp/ai-native-1-test
node /tmp/ai-native-1-test/scripts/check-ai-workflow.mjs /tmp/ai-native-1-test --mode core
```

## Expected Result

- init succeeds
- generated project contains workflow assets
- generated project core workflow check passes

## Evidence

- Init command exited 0 and created workflow assets under `/tmp/ai-native-1-test`.
- Generated project included `.ai-native/templates/adoption-evidence-report.md`.
- Generated project included `.ai-native/templates/productization-trial-report.md`.
- Generated project core workflow check exited 0.
- `AI workflow baseline is present (core mode).`
