# Git Boundary

## Human Summary

Git should contain confirmed project knowledge, reviewable workflow evidence, and team rules. It should not contain secrets, local scratch data, or unconfirmed AI guesses as facts.

## Simple Rule

Commit what helps the team understand and review the project later. Do not commit what only helps one local run, exposes private data, or makes AI inference look official.

## Usually Commit

- confirmed docs and baselines
- task artifacts
- review packets and review loop reports when needed
- final reports
- decision briefs
- accepted context corrections
- useful learning candidate audit history

## Usually Keep Local

- caches
- backups
- raw local plan JSON
- raw conversation dumps
- temporary tool output
- machine-specific paths or fingerprints

## Never Commit

- `.env` files with values
- tokens
- private keys
- service account JSON
- database URLs with credentials
- production credentials
- private customer data without explicit approval

## Check

```bash
node scripts/check-context-governance.mjs .
```

