# Git Boundary

## Human Summary

Git Boundary defines what AI Native governance artifacts should enter Git, what may stay local, and what must never be committed.

## Principle

Git stores confirmed project facts, collaboration rules, task evidence, and review records. Git must not store secrets, raw conversations, local caches, machine fingerprints, or unconfirmed AI assumptions as facts.

## Should Enter Git

These are normally committed:

- `.ai-native/version.json`
- `.ai-native/dev-kit-manifest.json`
- `.ai-native/core/`
- `.ai-native/templates/`
- `.ai-native/checklists/`
- `.ai-native/prompts/`
- `.ai-native/profiles/`
- `.ai-native/docs/`
- `scripts/check-*.mjs`
- `scripts/workflow-next.mjs`
- `scripts/new-workflow-item.mjs`
- `.github/workflows/ai-workflow-checks.yml`
- `docs/project-onboarding.md`
- `docs/project-profile.md`
- `docs/engineering-baseline.md`
- `docs/environment-baseline.md`
- `docs/verification-matrix.md`
- `requests/`
- `preflight/`
- `specs/`
- `evals/`
- `tasks/`
- `review-packets/`
- `review-loop-reports/`
- `decision-briefs/`
- `final-reports/`
- `follow-up-proposals/`
- `learning-candidates/` when the team wants candidate audit history
- `context-corrections/` when the correction is reviewed or accepted
- `git-boundary-reports/` when commit or PR boundary evidence matters

## Conditional Git Artifacts

These may enter Git when they support team review or audit:

- `goal-cards/`
- `subagent-run-plans/`
- `gpt-review-prompts/`
- `status-reports/`
- `review-summaries/`
- `customer-handoffs/`
- `baseline-recommendations/`
- `baseline-gap-reports/`
- launch-readiness evidence
- `.ai-native/migration-reports/`

If the artifact is only local scratch work, keep it out of Git.

## Default Local Only

These should normally stay local:

- `.ai-native/backups/`
- `.ai-native/tmp/`
- `.ai-native/cache/`
- raw local plan JSON
- raw conversation dumps
- unreviewed scratch notes
- local machine fingerprints
- transient tool output

## Never Commit

Never commit:

- `.env`
- `.env.local`
- `.env.production`
- secret values
- tokens
- private keys
- service account JSON
- database URLs with credentials
- production credentials
- customer private data not approved for repository storage

Environment Baseline may record variable name, purpose, owner, and whether it is secret. It must not record the secret value.

## Existing Project Rule

For governed, production-sensitive, dirty, or already launched projects, Codex should produce a Git Boundary Report before adding new workflow artifact categories or changing tracked governance assets.

## Human Decision

Git Boundary Report may recommend what to include or exclude. It is not approval by itself. The human still decides whether the commit or PR boundary is acceptable.

