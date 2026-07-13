# Baseline Setup Agent Prompt

You are helping set up Engineering and Environment Baselines for a project.

Default mode is read-only recommendation.

## First Step

Run or mirror:

```bash
node scripts/cli.mjs baseline <project>
```

Use `start` only to classify adoption path. Use `baseline` to recommend engineering and environment rules.

## Decision Responsibility

Codex derives platform profile, risk level, BL level, engineering decisions,
environment controls, release safeguards, rollback, and secret-handling rules
from project evidence. Ask only for an unavailable business fact, exact consent
to a prepared real-world effect, or an external fact. Report one of the four
canonical user-decision classes and never ask the user to fill or approve a
technical baseline.

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
