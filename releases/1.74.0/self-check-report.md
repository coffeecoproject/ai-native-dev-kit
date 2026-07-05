# 1.74.0 Self-Check Report

## Scope

This self-check covers Execution Assurance strict binding, source-system task
identity, planned diff coverage, precise evidence refs, generated-project smoke,
manifest/version consistency, and full repository verification.

## Required Evidence

- Positive examples pass strict Execution Assurance checks.
- Bad fixtures reject source-task mismatch, planned-path mismatch, source-digest
  mismatch, declarative precise evidence, stale evidence, unresolved evidence,
  missing review, missing actual diff, unexpected CI/hook diff, and unsafe patch
  claims.
- Generated project smoke checks Execution Assurance resolver and checker after
  workflow asset update.
- `README.md`, `README.zh-CN.md`, `VERSION.md`, `package.json`, and
  `intentos-manifest.json` all point to `1.74.0`.

## Verification

Final verification is recorded in the commit close-out after these commands run:

```bash
node scripts/check-manifest.mjs
node scripts/check-intentos.mjs
find scripts -name '*.mjs' -print0 | xargs -0 -n1 node --check
npm run verify
git diff --check
```

## Boundary

This self-check does not approve real-project writes, releases, production
actions, external provider operations, CI/hook mutation, secrets, migrations,
payments, app-store submissions, mini-program submissions, or business/legal
decisions.
