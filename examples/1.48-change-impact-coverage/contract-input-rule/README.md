# 1.48 Change Impact Coverage Example

This example records impact coverage for a common product-rule task:

```text
Add a contract input restriction.
```

The important behavior is not the rule itself. The important behavior is that Codex must not close the task after changing only one layer.

Expected covered surfaces:

- user flow
- frontend UI
- API contract
- backend rule
- error copy
- test coverage
- docs or handoff

This example is read-only evidence. It does not approve implementation, release, production, or every possible impact.
