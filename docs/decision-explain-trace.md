# Decision Explain Trace

Decision Explain Trace answers one user question:

```text
Why is this the final close-out decision?
```

It is part of Unified Closure Model. Users still use:

```bash
node scripts/cli.mjs finish ../my-project --intent "finish contract input rule" --verification "npm run verify passed"
```

## What It Adds

`finish` still returns one final Closure Decision.

1.54 adds three explanation blocks:

- `Decision Trace`: each input and its effect.
- `Dominant Reason`: the input that decides the final result.
- `Conflict Summary`: whether inputs disagreed and why the stricter result won.

## Example

If backend validation passed but frontend form behavior was not checked, the final decision may be:

```text
NEEDS_IMPACT_COVERAGE
```

The trace should explain:

```text
Verification passed.
Execution evidence exists.
Change Impact Coverage is missing.
Missing impact coverage outranks completion.
```

## Boundary

This is read-only explanation. It does not approve implementation, apply, commit, push, release, production, CI, hooks, or high-risk decisions.
