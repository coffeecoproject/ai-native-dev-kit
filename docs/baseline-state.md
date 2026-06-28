# Baseline State

Baseline State keeps proposed baselines separate from confirmed project facts.

Use it when Codex drafts baselines before code exists, or when an existing project has incomplete evidence.

## Command

```bash
node scripts/check-baseline-state.mjs . --report baseline-state-reports/<file>.md
```

## Common States

- `PROPOSED`: Codex recommendation only.
- `PENDING_CONFIRMATION`: human confirmation needed.
- `EVIDENCE_REQUIRED`: code/docs/commands must prove it later.
- `CONFIRMED`: backed by project evidence or human-confirmed source of truth.
- `NOT_APPLICABLE`: explicitly not relevant.
- `SUPERSEDED`: replaced by a newer decision.

## Boundary

No-code baselines can guide work, but they must not be presented as verified or production-ready.

