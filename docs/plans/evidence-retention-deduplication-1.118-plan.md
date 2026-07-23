# IntentOS 1.118 Evidence Retention And Deduplication Plan

## Status

Active governed implementation plan.

## Intent

Establish a forward-only evidence retention and deduplication rule for runtime state that preserves authoritative reports and the final trusted runtime while preventing duplicate aggregate logs, stale retry archives, and unbounded per-task evidence growth without rewriting released evidence.

## Problem

IntentOS evidence is trustworthy but increasingly repetitive. The 1.117 batch retained about 0.86 MB across current governance and runtime artifacts, while the historical `evidence/113-full-verification.log` alone is about 4.3 MB. Repeating full aggregate logs, retaining several retry archives, or copying the same command output into several standalone files would make Git history grow without adding trust.

## Policy

For tasks numbered 118 and later:

1. Preserve structured authority reports; downstream reports reference their digests rather than creating copied standalone substitutes.
2. Preserve exactly one durable Runtime Trust archive for a completed task: the final trusted run.
3. Remove failed, stale, debug, and superseded run archives before completion evidence is generated.
4. Forbid standalone `*-full-verification.log` aggregate logs. The final runtime action log is the canonical full verification output.
5. Forbid duplicate retained raw evidence with the same content digest inside one task evidence set.
6. Enforce explicit per-file and per-task raw-evidence budgets. Exceeding a budget blocks completion and requires a reviewed policy change or a more concise command output.
7. Preserve released evidence before task 118 byte-for-byte. Historical size is audit history, not cleanup authority.
8. Never replace required observed output with a hand-written summary. Manifest, digest, command, exit code, lifecycle journal, cleanup proof, and obligation-level observed evidence remain mandatory.

## Initial Budgets

- Standalone raw evidence file: at most 256 KiB.
- Durable runtime output file: at most 512 KiB.
- All raw evidence retained for one task: at most 1 MiB.
- Structured authority report: at most 256 KiB per file.
- Durable runtime archives: exactly one per completed task slug.

Budgets are governance limits, not truncation instructions. The runtime must fail closed instead of silently truncating output.

## Scope

- Add one project-owned machine policy.
- Add a reusable policy evaluator and strict checker.
- Register the policy and checker in source, installation, Manifest, workflow-version, syntax, and pre-runtime verification.
- Add fixtures proving historical preservation, final-run-only retention, aggregate-log rejection, exact-duplicate rejection, and budget enforcement.
- Document cleanup order and the authority boundary.

## Non-Goals

- Do not rewrite, squash, delete, or recompress 1.113-1.117 evidence.
- Do not weaken Test Evidence, Runtime Trust, Change Boundary, Execution Assurance, Completion Evidence, or Closure consumers.
- Do not use Git LFS, an external evidence store, CI artifacts, or hosted automation.
- Do not silently truncate logs.
- Do not delete evidence merely because it is large.
- Do not begin `resolve-operating-loop.mjs` modularization in this batch.
- Do not implement the Controlled Adoption draft.

## Verification

- Policy schema and semantic validation.
- Good fixture with historical large evidence and one final current run passes.
- Multiple current retry archives fail.
- Current full aggregate log fails.
- Duplicate current raw evidence fails.
- Per-file and per-task budget overflow fails.
- Missing manifest binding for a durable run fails.
- Generated-project installation contains the policy and checker.
- Full IntentOS pre-runtime verification and final Consumer Chain pass.

## Completion Rule

1.118 is complete only when a fresh project receives the policy and strict checker, the source repository passes the same checker, current task evidence stays within the declared budgets, only the final trusted runtime is retained, historical evidence remains unchanged, and every existing strict completion consumer still passes.
