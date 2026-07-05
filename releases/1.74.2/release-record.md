# 1.74.2 Release Record

## Release

Version: `1.74.2`

Theme: Runtime Naming And Plan Ref Binding

## Summary

1.74.2 hardens the 1.74 Execution Assurance line in two places:

- active runtime source-repository vocabulary now uses IntentOS-native
  `INTENTOS_*` terms instead of legacy `DEV_KIT_*` tokens;
- strict completion now requires `execution_plan.plan_ref` to resolve to a
  concrete plan, artifact, or known checker record before `VERIFIED_DONE` can
  pass.

This release does not change the Execution Assurance report schema shape.
Reports continue to use `schema_version: 1.74.0`.

## What Changed

- Workflow source-repository states, workflow states, next actions, and
  maintainer goal-mode signals now use `INTENTOS_*` vocabulary.
- Naming hardcut checks now reject active `DEV_KIT` runtime identity drift.
- Execution Assurance strict/precise checks resolve `execution_plan.plan_ref`
  for `VERIFIED_DONE` and `--require-precise-evidence`.
- Non-empty `execution_plan.approval_refs` are checked as bounded references in
  strict completion contexts.
- A bad fixture proves unresolved plan refs cannot support completion claims.
- The safe-patch positive example now references a concrete task plan file.
- Generated-project smoke now writes an Execution Assurance report with
  `--out` and checks that same recorded report.

## Existing Project Boundary

1.74.2 does not change existing-project adoption authority. Old projects can be
read and planned in IntentOS mode, but target-project writes still require
Native Migration, Existing Rule Reconciliation, Unified Apply Plan, approval,
and Controlled Apply Readiness.

## Allowed Claims

- IntentOS 1.74.2 removes active `DEV_KIT_*` runtime vocabulary from source
  repository detection and self-check routing.
- IntentOS 1.74.2 rejects strict completion claims whose execution plan
  reference is missing, bare, stale, or unresolved.
- IntentOS 1.74.2 keeps 1.74.0 Execution Assurance report shape compatible.

## Forbidden Claims

- 1.74.2 does not prove any real project task is complete.
- 1.74.2 does not approve implementation, target-project writes, commit, push,
  release, production, CI/hook mutation, secrets, migrations, provider actions,
  app-store submission, mini-program submission, payment, permission, finance,
  tax, HR, legal, compliance, or customer-data decisions.
- 1.74.2 does not make `approval_refs` a blanket authorization mechanism.
- 1.74.2 does not require ordinary users to choose internal proof-chain
  commands.

## Evidence Status

- Runtime naming hardcut coverage is repository-local and checked by
  `node scripts/check-intentos.mjs`.
- Plan-reference binding is covered by positive examples and the unresolved
  plan-ref bad fixture.
- Generated-project smoke proves installed assets can save and check the same
  Execution Assurance report after initialization.
- Manifest coverage is verified by `node scripts/check-manifest.mjs`.
- Evidence remains local to this repository and does not represent a real
  external project delivery claim.

## Known Limitations

- 1.74.2 is a hardening patch, not a new assurance model or execution runner.
- Execution Assurance reports still use `schema_version: 1.74.0` by design.
- Resolver-generated reports remain conservative drafts until task-scoped
  evidence, source-system binding, a resolvable execution plan, planned target
  paths, review, and strict checks support a completion claim.
- Generated-project smoke proves installed assets and same-report checking are
  runnable; it does not prove a real external project has adopted IntentOS or
  completed a feature.
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

- active runtime vocabulary uses `INTENTOS_*` terms;
- naming hardcut catches active `DEV_KIT` drift;
- strict/precise Execution Assurance requires resolvable plan refs;
- positive examples pass and unresolved plan-ref fixtures fail;
- generated-project smoke writes and checks a saved Execution Assurance report;
- full self-check, manifest check, verify, syntax, and diff checks pass.
