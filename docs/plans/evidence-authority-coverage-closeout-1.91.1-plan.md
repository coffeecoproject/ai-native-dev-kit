# Evidence Authority Coverage Close-Out 1.91.1 Plan

## Purpose

1.91.1 closes two release-trust gaps found after the 1.91.0 commit:

1. the repository-wide verification command reports a false plain-language
   regression for one valid existing-project adoption state;
2. several checkers accept an explicit strict evidence request but still pass
   when no matching report exists.

This is a patch-level close-out. It does not add a new workflow layer and does
not implement controlled apply or release execution.

## User Outcome

Users still communicate in natural language. When a strict consumer needs
Change Impact Coverage, a Unified Apply Plan, or a Release Handoff Pack,
IntentOS fails with one missing-evidence result instead of silently treating an
empty report directory as success. Ordinary source checks and projects with no
active task can still use the default non-strict skip behavior.

## Scope

1. Fix the 1.81.3 adoption-autopilot self-check so every supported plain-state
   sentence is recognized without exposing raw enum values in the Human
   Summary.
2. Make Change Impact Coverage fail closed when report evidence is explicitly
   required by `--report`, closure mode, structured evidence, strict evidence,
   evidence-reference resolution, precise evidence, or business-rule binding.
3. Make Unified Apply Plan and Release Handoff Pack fail closed when
   `--require-structured-evidence` is used and no report exists.
4. Preserve default empty-project and source-asset checks when no strict flag is
   present.
5. Add direct negative checks and repository-wide verification coverage.
6. Keep Git worktree risk signals scoped to the target project when that target
   is a subdirectory of a larger repository.

## Compatibility Boundary

- Default checks without strict flags keep their historical advisory/empty
  behavior.
- Historical Markdown remains readable.
- Strict mode does not create reports, infer approval, or authorize writes.
- Apply graph replay, Apply Receipt, adoption activation proof, and target
  before/after digests remain 1.92 work.
- Structured release approval and release-candidate identity remain 1.93 work.
- Manifest, baseline installation, and public repository-entry cleanup remain
  1.94 work.

## Implementation

### 1. Plain-Language Self-Verification

Update the 1.81.3 regression assertion to recognize all supported
`plainStateFor` outcomes while continuing to reject raw adoption enums in the
Human Summary.

### 2. Strict Empty-Report Contract

Each affected checker computes whether the current invocation explicitly
requires evidence. When it does, zero matching reports is a failure. When it
does not, the existing skip result remains valid.

### 3. Self-Check Coverage

Add negative cases for an empty temporary project:

- strict Change Impact Coverage;
- strict Unified Apply Plan;
- strict Release Handoff Pack.

Also keep positive non-strict empty checks to prove the patch did not turn all
project inspection into a mandatory artifact workflow.

### 4. Target-Scoped Git Signals

`gitWorktreeState(projectRoot)` must inspect changes under the requested target
path only. A dirty sibling or parent-only release/workflow file must not
escalate an otherwise low-risk nested project task.

## Acceptance

The release is accepted only when all pass:

```bash
node scripts/check-change-impact-coverage.mjs /tmp/intentos-empty --require-structured-evidence --mode closure --strict-evidence
node scripts/check-apply-plan.mjs /tmp/intentos-empty --require-structured-evidence
node scripts/check-release-handoff-pack.mjs /tmp/intentos-empty --require-structured-evidence
node scripts/check-intentos.mjs --mode full
npm run verify
node scripts/check-manifest.mjs
git diff --check
```

The first three commands are expected negative tests and must exit non-zero
with a missing-report reason. The remaining commands must exit zero.

## Release Boundary

1.91.1 proves that an explicit strict evidence request cannot be satisfied by
absence. It still does not prove product correctness and does not approve
implementation, apply, commit, push, release, production, migrations, provider
actions, or project-owner decisions.
