# 1.1 Guided Adoption Examples

These examples show the intended user experience for `node scripts/cli.mjs start <project>`.

The examples are reports, not setup plans. They prove that the entry point keeps project adoption read-only by default and routes the next step through human judgment.

## Covered Cases

| Case | Expected classification | Expected behavior |
| --- | --- | --- |
| `new-project` | `NEW_PROJECT` | Recommend guided init only after confirmation |
| `existing-light-project` | `EXISTING_LIGHT_PROJECT` | Recommend plan-first adoption |
| `governed-readonly` | `GOVERNED_EXISTING_PROJECT` | Recommend read-only assessment first |

## Check

```bash
node scripts/check-guided-adoption.mjs examples/1.1-guided-adoption/new-project
node scripts/check-guided-adoption.mjs examples/1.1-guided-adoption/existing-light-project
node scripts/check-guided-adoption.mjs examples/1.1-guided-adoption/governed-readonly
```
