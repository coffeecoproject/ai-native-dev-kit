# Git Boundary Review Checklist

Use this checklist before committing IntentOS workflow, context, or review artifacts.

## Include

- [ ] Confirmed project rules and baselines.
- [ ] Task evidence needed for review or audit.
- [ ] Review packet and review loop report when task level requires them.
- [ ] Decision briefs when human decision is needed or recorded.
- [ ] Learning candidates only when audit history is useful.
- [ ] Context corrections when reviewed, accepted, or needed for future tasks.

## Exclude

- [ ] Local caches.
- [ ] Temporary backups.
- [ ] Raw conversation dumps.
- [ ] Raw local plan JSON unless explicitly requested as evidence.
- [ ] Local machine fingerprints.
- [ ] Unreviewed scratch notes.

## Never Commit

- [ ] `.env` files with values.
- [ ] Tokens.
- [ ] Private keys.
- [ ] Service account JSON.
- [ ] Database URLs with credentials.
- [ ] Production credentials.
- [ ] Private customer data not approved for repository storage.

## Human Decision

- [ ] Conditional artifacts have an explicit human decision.
- [ ] Commit or PR boundary matches the approved scope.
- [ ] Report does not present itself as approval.

