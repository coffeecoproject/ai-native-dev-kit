# Engineering Baseline Example: Enum Vs Lookup

This example shows how Engineering Baseline prevents Codex from silently choosing `string`, code enum, database enum, lookup table, or state machine.

The example is intentionally business-light. It uses a generic work item status only to show the decision shape.

Use it to inspect:

- `docs/engineering-baseline.md`
- `decision-briefs/001-status-model-decision.md`

Validation:

```bash
node scripts/check-engineering-baseline.mjs examples/engineering-baseline-enum-vs-lookup --strict
```
