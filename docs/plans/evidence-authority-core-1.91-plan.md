# Evidence Authority Core 1.91 Plan

## Purpose

1.91 makes evidence references verifiable project-local facts instead of self-declared strings.
It closes the gap left after 1.90: downstream reports must prove that a referenced file is inside the current project, has not been redirected through a symlink, belongs to the current task, and matches the source content actually read.

## User Outcome

Users continue to ask ordinary questions such as "is this task done?". IntentOS performs authority checks internally. A failed reference reports one practical issue: evidence is missing, unsafe, stale, or belongs to a different task. Users do not need to calculate a digest or interpret a path-security rule.

## Scope

1. Establish one shared Evidence Authority Core for project-local files.
2. Load IntentOS artifact schemas only from the kit authority, not an unreviewed target-project replacement.
3. Resolve `artifact:` and `file:` evidence only when the real file remains under the real project root; reject absolute paths, traversal, and symlink escape paths.
4. Bind authoritative evidence to project identity, source revision or non-Git source state, task reference, task-intent digest, and raw-file digest.
5. Add `--require-evidence-authority` to Verification Plan, Test Evidence, Execution Assurance, and Completion Evidence.
6. Make generated Verification Plan and Test Evidence reports emit authority bindings when an output path is supplied.
7. Add self-check coverage for schema override, symlink escape, task/intent mismatch, stale source digest, and a valid local authority chain.

## Authority Model

An `authority_binding` is a derived record, not user approval or release authority.

```text
project_identity  -> real project root fingerprint + Git HEAD (when available)
task_identity     -> task_ref + intent_digest
source_identity   -> project-relative source ref + raw file digest
```

The checker recomputes project and source portions from the filesystem. It does not trust a digest merely because a report repeats it.

## Compatibility

Existing Markdown evidence remains readable. It is not reclassified as false merely because it predates 1.91. But it cannot satisfy a new strict `--require-evidence-authority` ready/done claim until it has a valid binding. This keeps historical records inspectable while preventing their reuse as current authoritative evidence.

## Non-Goals

- Do not authorize implementation, native apply, commit, push, release, production, migrations, provider actions, or owner decisions.
- Do not make IntentOS a release executor or replace project-native gates.
- Do not introduce a second closure or approval state machine.
- Do not rewrite every historical artifact solely to add a 1.91 binding.

## Implementation

### 1. Shared Evidence Authority Library

Add `scripts/lib/evidence-authority.mjs` with project identity resolution, Git revision discovery with a bounded non-Git fallback, canonical file digesting, safe project-local evidence resolution through real paths, and binding construction/validation.

### 2. Schema Authority And Schema Contracts

`scripts/lib/artifact-schema.mjs` loads an IntentOS artifact schema from the kit source only. A target project may carry copies for reference, but it cannot silently weaken a checker by shadowing the authoritative schema.

Add an `authority_binding` object to the four active execution evidence schemas. It is required only by strict evidence-authority consumers so old records remain reviewable.

### 3. Consumer Wiring

Strict mode requires a valid binding for the report itself and every file-backed recorded source used to support a ready/done result.

### 4. Resolver Output

`resolve-verification-plan.mjs` and `resolve-test-evidence.mjs` emit authority bindings for their own output when the report has a stable, project-local output reference. A no-write preview remains non-authoritative.

### 5. Validation

Extend `scripts/check-intentos.mjs` and the strict example chain. Include positive and negative fixtures without reading files outside the test fixture root.

## Acceptance

The release is accepted only when all pass:

```bash
node scripts/check-intentos.mjs --mode full
npm run verify
git diff --check
```

Self-check proves that schema shadowing, symlinked evidence, stale file digests, and task/intent mismatch are rejected, while a valid local Verification Plan -> Test Evidence chain passes strict authority validation.

## Release Boundary

1.91 is verification-only. Passing Evidence Authority Core proves the identity and integrity of recorded evidence; it does not prove product correctness or real-environment behavior, and it does not grant execution permission.
