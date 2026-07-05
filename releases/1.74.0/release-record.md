# 1.74.0 Release Record

## Release

Version: `1.74.0`

Theme: Execution Assurance Strict Binding

## Summary

1.74.0 tightens Execution Assurance from "a report exists" to "the report is
bound to this task, this evidence, and this actual diff."

This release prevents Codex from claiming execution-class work is complete when
the source-system report belongs to another task, the actual diff exceeds the
reviewed plan, source evidence digests do not match, or precise completion is
represented only by declarative refs such as `review:` or `command:`.

## What Changed

- Execution Assurance schema version is now `1.74.0`.
- `source_systems[]` now records `source_system_ref`, `source_task_ref`,
  `source_outcome`, `current_task_match`, and digest-backed evidence identity.
- Strict source-system binding is required for `VERIFIED_DONE` and
  `--require-precise-evidence`.
- Actual changed files must be covered by explicit planned target paths in
  actual-diff or precise completion mode.
- Resolver-generated reports no longer treat actual changed files as planned
  target paths.
- Precise mode rejects declarative `human-decision:`, `review:`, `command:`,
  `git-diff:`, and `generated:` refs as completion evidence.
- Generated-project smoke now checks that Execution Assurance resolver/checker
  assets are installed and runnable.
- New bad fixtures cover source-task mismatch, planned-path mismatch,
  source-digest mismatch, and declarative precise evidence.

## Existing Project Boundary

1.74.0 does not change existing-project adoption semantics. Old projects can
operate in IntentOS mode, but any target-project writes still require Native
Migration, Existing Rule Reconciliation, Unified Apply Plan, approval, and
Controlled Apply Readiness.

Execution Assurance proves whether an execution claim is supported. It does not
replace project authority, business rules, production controls, release SOPs, or
human risk acceptance.

## Allowed Claims

- IntentOS 1.74.0 can reject execution completion claims when source evidence is
  stale, task-mismatched, digest-mismatched, or outside the planned diff.
- IntentOS 1.74.0 can require concrete file, artifact, or checker-backed
  evidence in precise completion mode.
- Resolver output is conservative and can be used as a report draft, not as
  automatic completion proof.

## Forbidden Claims

- 1.74.0 does not prove that any real project task was completed.
- 1.74.0 does not approve target-project writes, commits, pushes, releases,
  production deployment, CI/hook mutation, secrets, migrations, provider
  actions, payment actions, app-store submission, mini-program submission,
  compliance decisions, finance/tax/HR/legal decisions, or customer-data
  changes.
- Passing Execution Assurance is not proof of product correctness or production
  readiness.

## Evidence Status

- The source checker validates 1.74 schema fields, source-system task binding,
  source outcome, current-task match, report/evidence digest format, and
  file-backed report digest matching.
- Positive examples cover feature implementation, old-project adoption
  migration, safe patch closure, and patch-smell blocking.
- Bad fixtures cover stale or mismatched source systems, actual diff outside the
  reviewed plan, source digest mismatch, unresolved evidence, missing review,
  missing actual diff, unexpected CI/hook diff, and declarative precise evidence.
- Generated project smoke covers Execution Assurance resolver/checker asset
  installation after workflow asset update.
- Evidence remains repository-local and does not represent a real external
  project migration or delivery task.

## Known Limitations

- Execution Assurance verifies completion evidence identity; it does not decide
  product correctness, production readiness, release approval, legal/compliance
  acceptance, finance/tax/HR outcomes, or business policy.
- Checker-backed `evidence_digest` records a source claim snapshot. A concrete
  source file or artifact is still stronger when available.
- Resolver-generated reports remain conservative and should not be treated as
  completion proof without task-scoped evidence and review.
- Planned target path matching intentionally supports exact relative paths and
  directory globs ending in `/**`; broad or ambiguous wildcard patterns are
  rejected.

## Verification

Verification must include manifest validation, IntentOS self-check, syntax
checks, positive Execution Assurance examples, bad fixture rejection,
generated-project smoke, full `npm run verify`, and whitespace diff checks.

## Verification Scope

Required checks for this release:

```bash
node scripts/check-manifest.mjs
node scripts/check-intentos.mjs
find scripts -name '*.mjs' -print0 | xargs -0 -n1 node --check
npm run verify
git diff --check
```

## Acceptance

This release is acceptable only if:

- source-system task mismatch is rejected;
- actual diff outside planned target paths is rejected;
- source report digest mismatch is rejected;
- declarative precise evidence is rejected;
- positive Execution Assurance examples still pass strict checks;
- resolver-generated reports remain conservative;
- generated project smoke proves Execution Assurance resolver/checker assets are
  available;
- full verification passes.

## Known Non-Actions

- No real project was migrated or modified.
- No deployment, release, provider, CI, hook, secret, DNS, migration, payment,
  app-store, mini-program, legal, compliance, finance, tax, HR, or customer-data
  action was performed.
