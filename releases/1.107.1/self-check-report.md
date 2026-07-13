# IntentOS 1.107.1 Self-Check Report

## Result

`PASS`

## Required Checks

- recursively resolved source effective-guidance graph;
- generated new-project Review Context Authority check;
- existing-project migration-report semantic check;
- Codex-only formal adapter distribution;
- Review Context version and digest binding;
- strict Manifest validation;
- IntentOS full self-check;
- full `npm run verify`;
- `git diff --check`.

## Evidence

- `node --test tests/active-guidance-semantic-hardcut.test.mjs tests/review-context-authority.test.mjs tests/active-guidance-distribution-closeout.test.mjs` passed `23/23`.
- `node scripts/check-review-context-authority.mjs .` passed the recursively
  resolved source and generated guidance checks.
- `node scripts/check-guided-adoption.mjs` passed all three 1.1 adoption
  fixtures after the bounded-user-input hardcut.
- `node scripts/check-manifest.mjs` passed strict schema, copy-rule, required
  asset, and reverse-drift validation.
- `npm run verify` completed with exit code `0`, including the full IntentOS
  self-check and generated-project smoke chain.
- `git diff --check` passed.

## Boundaries

This report does not approve implementation, apply, release, or production.
`PASS` proves only the repository checks listed above for the current worktree.
