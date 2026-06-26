# Engineering Baseline Example: API DTO And Domain Boundary

This example shows how Engineering Baseline prevents Codex from mixing generated API DTOs, schema types, domain models, and UI view models.

Use it to inspect:

- `docs/engineering-baseline.md`
- `decision-briefs/001-dto-domain-boundary.md`

Validation:

```bash
node scripts/check-engineering-baseline.mjs examples/engineering-baseline-api-dto-domain --strict
```
