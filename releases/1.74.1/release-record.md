# 1.74.1 Release Record

## Release

Version: `1.74.1`

Theme: Execution Assurance Vocabulary And Docs Sync

## Summary

1.74.1 is a consistency patch for the 1.74 Execution Assurance Strict Binding
release.

It aligns resolver vocabulary, JSON schema enum values, runtime project-state
tags, README capability tables, active docs, generated-project smoke coverage,
and release metadata so the same behavior is visible across code, docs, and CI.

This release does not introduce a new assurance system. Execution Assurance
reports continue to use `schema_version: 1.74.0`.

## What Changed

- The Execution Assurance schema now accepts
  `REQUIRES_EXPLICIT_EXECUTION_PLAN`, matching resolver output.
- Runtime bootstrapped-project tags now use IntentOS terminology.
- Naming hardcut checks now reject uppercase legacy identity tokens.
- README and Chinese README now list Adoption Assurance and Execution Assurance
  Chain as explicit capabilities while keeping ordinary-user entry simple.
- Maintainer command tables now show `execution-assurance`,
  `execution-assurance-check`, `done-check`, and `verify-execution`.
- Execution Assurance docs and structured evidence docs now explain strict
  source binding, report/evidence digests, planned target path coverage, and
  declarative ref limits.
- Generated-project smoke explicitly runs the Execution Assurance resolver,
  checker, and plain-language aliases.

## Existing Project Boundary

1.74.1 does not change existing-project adoption authority. Old projects can be
read and planned in IntentOS mode, but target-project writes still require
Native Migration, Existing Rule Reconciliation, Unified Apply Plan, approval,
and Controlled Apply Readiness.

## Allowed Claims

- IntentOS 1.74.1 aligns public docs, runtime vocabulary, schema enum values,
  and CI smoke for Execution Assurance.
- IntentOS 1.74.1 keeps existing 1.74 strict reports compatible.
- IntentOS 1.74.1 can catch uppercase legacy identity tokens in active source
  surfaces.

## Forbidden Claims

- 1.74.1 does not prove any real project task is complete.
- 1.74.1 does not approve implementation, target-project writes, commit, push,
  release, production, CI/hook mutation, secrets, migrations, provider actions,
  app-store submission, mini-program submission, payment, permission, finance,
  tax, HR, legal, compliance, or customer-data decisions.
- 1.74.1 does not require ordinary users to choose internal proof-chain
  commands.

## Evidence Status

- Schema/resolver vocabulary alignment is repository-local and covered by
  `node scripts/check-intentos.mjs`.
- Manifest coverage is verified by `node scripts/check-manifest.mjs`.
- Runtime naming hardcut coverage is checked against active source surfaces,
  generated-asset templates, README files, scripts, docs, and CI workflow files.
- Generated-project Execution Assurance smoke verifies installed resolver,
  checker, and CLI aliases after workflow asset initialization.
- Evidence remains local to this repository and does not represent a real
  external project delivery claim.

## Known Limitations

- 1.74.1 is a consistency patch, not a new assurance model or target-project
  migration.
- Execution Assurance reports still use `schema_version: 1.74.0` by design;
  existing strict reports remain compatible.
- Generated-project smoke proves command installation and command routing, not
  product correctness or real project adoption.
- Resolver-generated reports remain conservative drafts until task-scoped
  evidence, review, source-system binding, and planned target paths support a
  completion claim.
- IntentOS still does not approve target-project writes, implementation,
  commit/push, release, production, CI/hooks, secrets, migrations, providers, or
  high-risk business decisions.

## Verification

Required checks:

```bash
node scripts/check-manifest.mjs
node scripts/check-intentos.mjs
find scripts -name '*.mjs' -print0 | xargs -0 -n1 node --check
npm run verify
git diff --check
```

## Acceptance

This release is acceptable only if:

- schema enum and resolver vocabulary match;
- runtime bootstrapped tags no longer use legacy product identity;
- naming hardcut catches uppercase legacy identity tokens;
- README and docs explain the active Execution Assurance behavior;
- generated-project smoke runs the Execution Assurance resolver/checker aliases;
- full self-check, manifest check, verify, syntax, and diff checks pass.
