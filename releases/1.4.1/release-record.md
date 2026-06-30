# Release Record 1.4.1

## Human Summary

`1.4.1` is a context governance polish release.

It improves how users and Codex understand project memory, context correction, and minimal commit scope. It does not add a new workflow gate.

## Included

- `docs/context-governance-usage.md`
- `docs/minimal-commit-set.md`
- wording cleanup in `scripts/check-product-baseline.mjs`
- roadmap coverage in `docs/roadmaps/delivery-readiness-and-drift-roadmap-1.4.1-1.6.md`

## Not Included

- no new memory store
- no automatic self-learning
- no external GPT/API hook automation
- no production release approval

## Verification

```text
node scripts/check-context-governance.mjs .
node scripts/check-product-baseline.mjs .
node scripts/check-dev-kit.mjs
```

## Allowed Claims

- `1.4.1` improves context governance usage guidance.
- `1.4.1` clarifies minimal commit boundaries.
- `1.4.1` does not add a new workflow gate.

## Forbidden Claims

- Do not claim automatic project memory.
- Do not claim secret scanning coverage.
- Do not claim production validation.

## Evidence Status

Documentation and wording updates are present in the source repo.

## Known Limitations

See `releases/1.4.1/known-limitations.md`.

## Human Boundary

Codex may draft learning candidates and context corrections. Humans still approve durable project facts.
