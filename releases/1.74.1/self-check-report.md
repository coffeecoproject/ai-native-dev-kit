# 1.74.1 Self-Check Report

## Scope

This self-check covers the 1.74.1 Execution Assurance vocabulary and docs sync.

## Required Evidence

- Version metadata updated to `1.74.1`.
- Execution Assurance schema accepts resolver target-diff vocabulary.
- Runtime bootstrapped-project tags use IntentOS terminology.
- Naming hardcut checks uppercase legacy identity tokens.
- README and Chinese README list adoption and execution assurance capabilities.
- Generated-project smoke visibly runs Execution Assurance resolver/checker
  commands and aliases.
- Release evidence is present under `releases/1.74.1/`.

## Commands

```bash
node scripts/check-manifest.mjs
node scripts/check-intentos.mjs
find scripts -name '*.mjs' -print0 | xargs -0 -n1 node --check
npm run verify
git diff --check
```

## Expected Result

All checks pass. Any failure in schema vocabulary, naming hardcut, README
metadata, generated-project smoke, manifest coverage, or Execution Assurance
strict examples blocks the release.

## Boundary

This self-check does not approve real project implementation, target-project
writes, commit, push, release, production, CI/hook mutation, secrets,
migrations, provider actions, or high-risk business decisions.
