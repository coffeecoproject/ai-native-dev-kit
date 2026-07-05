# Execution Assurance Strict Binding 1.74 Plan

## Purpose

1.74.0 tightens Execution Assurance so IntentOS can no longer accept a
completion claim just because a report exists. A verified execution claim must
prove that its source systems, evidence, actual diff, and review records belong
to the current task.

This is a governance hardening release. It does not add a new workflow layer and
does not authorize project writes, commit, push, release, production actions,
CI/hook changes, secrets, migrations, provider actions, or external platform
operations.

## Problem

Execution Assurance 1.72.x already binds intent, contract, impact, diff,
evidence, review, patch classification, source-system trace, and closure
decision into one report.

The remaining risks are:

- a source-system trace can point to a recorded report without proving it is for
  the same task;
- a resolver-generated report can accidentally treat actual changed files as
  planned target paths;
- a checker can validate source-system presence without checking contribution,
  task match, outcome, or digest;
- declarative evidence refs such as `review:done` or `command:test` can look
  precise even though they do not resolve to a concrete record;
- generated-project smoke can miss Execution Assurance command coverage.

## Scope

1. Add source-system task binding fields to the Execution Assurance schema.
2. Require strict source-system binding for `VERIFIED_DONE` and
   `--require-precise-evidence`.
3. Require actual changed files to be covered by explicit planned target paths.
4. Reject declarative evidence prefixes in precise completion mode unless they
   are replaced by file, artifact, or checker-backed evidence.
5. Keep resolver output conservative: it may generate a report skeleton, but it
   must not auto-prove completion from stale or self-derived facts.
6. Add fixtures that prove stale source systems, mismatched plan paths,
   mismatched digests, and declarative precise evidence are rejected.
7. Keep old-project and release boundaries unchanged.

## Non-Goals

- Do not replace Execution Assurance with a new proof system.
- Do not loosen any write, release, CI, hook, migration, secret, payment,
  provider, app-store, mini-program, legal, compliance, finance, tax, HR, or
  customer-data boundary.
- Do not make resolver-generated reports claim `VERIFIED_DONE` by default.
- Do not require users to learn new public commands.
- Do not migrate real projects.

## Design

### Source-System Binding

Each `source_systems[]` entry must carry enough information to prove where its
input came from:

- `source_system_ref`
- `source_task_ref`
- `source_outcome`
- `current_task_match`
- one of `report_digest` or `evidence_digest`

For file and artifact refs, `report_digest` is checked against the referenced
file content. For checker-backed refs, `evidence_digest` records the checker
claim snapshot. In precise mode, a `RECORDED` source must match the current task
and must not carry blocked or failed outcomes.

### Planned Diff Binding

`actual_diff.changed_files` must be covered by
`execution_plan.planned_target_paths` when `--require-actual-diff`,
`--require-precise-evidence`, or `VERIFIED_DONE` is used.

Allowed planned path forms:

- exact relative file path;
- relative directory glob ending in `/**`;
- `N/A` only when there are no changed files.

Broad, absolute, parent-traversal, or unsupported wildcard paths are rejected.

### Precise Evidence Prefixes

In normal report mode, declarative refs can remain useful as notes. In precise
completion mode, refs such as `human-decision:`, `review:`, `command:`,
`git-diff:`, and `generated:` are not sufficient. They must be replaced by a
resolvable file, artifact, or checker-backed record.

### Resolver Behavior

The resolver remains read-only and conservative. When it sees changed files, it
does not convert them into planned target paths. It emits
`REQUIRES_EXPLICIT_EXECUTION_PLAN` until a task-scoped execution plan is
recorded.

## Execution Plan

1. Update schema, template, resolver, and checker.
2. Update positive examples to schema `1.74.0`.
3. Add strict negative fixtures.
4. Update source self-check and generated-project smoke coverage.
5. Update README, version, manifest, and release records.
6. Run syntax, manifest, source self-check, example checks, bad fixture checks,
   generated-project smoke, and full `npm run verify`.

## Acceptance

1. A `VERIFIED_DONE` report fails when source systems are not bound to the
   current task.
2. A `VERIFIED_DONE` report fails when an actual changed file is outside
   `planned_target_paths`.
3. A source-system artifact ref fails when `report_digest` does not match file
   content.
4. Precise mode fails when concrete evidence is replaced by declarative
   `review:`, `command:`, `git-diff:`, `generated:`, or `human-decision:` refs.
5. Resolver-generated reports are conservative and do not self-approve changed
   files as planned target paths.
6. Existing positive examples pass strict checks.
7. New bad fixtures fail.
8. `node scripts/check-intentos.mjs`, `node scripts/check-manifest.mjs`, syntax
   checks, and `npm run verify` pass.

## Human Role

People do not need to understand the internal proof chain. They only decide
when a real project action, scope expansion, release, or authority change is
acceptable. IntentOS and Codex must prove whether the execution claim is
supported before asking for that decision.
