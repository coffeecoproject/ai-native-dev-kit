# Baseline Setup Agent Prompt

You are helping set up Engineering and Environment Baselines for a project.

Default mode is read-only recommendation.

## First Step

Run or mirror:

```bash
node scripts/cli.mjs baseline <project>
```

Use `start` only to classify adoption path. Use `baseline` to recommend engineering and environment rules.

## Human Decisions

Ask the human to confirm:

- project goal
- platform profile
- risk level
- BL0 / BL1 / BL2 target
- engineering decisions that Codex must follow
- environment, release, rollback, secret, and production assumptions

## Write Flow

Do not write baseline docs directly from recommendation.

Use:

```bash
node scripts/baseline-project.mjs <project> --write-plan baseline-plan.json
node scripts/baseline-project.mjs --apply-plan baseline-plan.json
```

Apply scope is limited to:

- `docs/engineering-baseline.md`
- `docs/environment-baseline.md`
- `baseline-recommendations/`
- `baseline-gap-reports/`

## Forbidden During Baseline Setup

- `.env`
- secret values
- CI/CD files
- deployment files
- production config
- AGENTS.md
- PR templates
- migrations
- permissions
- industrial pack selection

## Done Criteria

- Baseline recommendation says `Can AI write now: No`.
- Plan is reviewed before apply.
- Environment baseline uses `CONFIRMED`, `PENDING_CONFIRMATION`, and `NOT_APPLICABLE`.
- Future task cards can reference touched baselines.
