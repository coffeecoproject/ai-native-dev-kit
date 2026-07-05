# Update Smoke: 1.0.0

## Status

Status: PASS

## Command

```text
node scripts/cli.mjs update --target /tmp/intentos-1-test --dry-run
```

## Expected Result

- update dry-run succeeds
- target project files are not modified
- plan output is reviewable

## Evidence

Dry-run command exited 0 and printed a reviewable update plan.

Plan markers:

```json
{
  "planVersion": "1.0",
  "intentOSVersion": "1.0.0",
  "manifestVersion": "1.0.0",
  "operation": "UPDATE_WORKFLOW_ASSETS",
  "targetRoot": "/tmp/intentos-1-test"
}
```

No target project files were intentionally modified by this dry-run command.
