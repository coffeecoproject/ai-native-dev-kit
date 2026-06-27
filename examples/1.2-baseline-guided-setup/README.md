# 1.2 Baseline Guided Setup Examples

These examples show how `baseline` behaves after `start`.

They are simulated baseline guided setup examples, not proof of production validation.

## Scenarios

| Scenario | Purpose |
|---|---|
| `new-web-project` | Shows a light BL0-first web project recommendation and first task baseline refs. |
| `existing-light-project` | Shows pending engineering and environment decisions for an existing project. |
| `governed-readonly-project` | Shows read-only mapping when existing governance is detected. |
| `production-sensitive-project` | Shows environment, release, rollback, and secret boundaries without applying changes. |

## Expected invariant

Every baseline recommendation includes:

```text
Can AI write now: No
```

Writes require:

```bash
node scripts/baseline-project.mjs <project> --write-plan baseline-plan.json
node scripts/baseline-project.mjs --apply-plan baseline-plan.json
```
