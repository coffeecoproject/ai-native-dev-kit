# Release 1.71.2 - Adoption Assurance Evidence Precision

## Summary

1.71.2 tightens Adoption Execution Assurance evidence. It keeps the 1.71 old-project adoption goal, but makes simulation and source-system evidence more precise before a report can claim `VERIFIED_ACTIVE`.

## What Changed

- Simulation steps now include `exit_code`, `read_only`, `writes_target_files`, `target_diff_status`, `output_digest`, and outcome evidence.
- `SIMULATION_PASSED` requires every step to pass with exit code `0`, stay read-only, avoid target writes, and show git-backed `UNCHANGED` target diff status.
- Adoption assurance source status now uses typed source adapters instead of broad whole-output text matching.
- Governance convergence source status also uses typed source adapters to reduce false positives from incidental words in reports.
- Generated evidence refs must resolve to a recorded source system or simulation step.
- Target-installed assurance assets are distinguished from source-only examples, fixtures, release records, and calibration evidence.
- New bad fixtures cover missing simulation exit code, changed target diff, and unresolved generated evidence.

## Boundary

- This release does not write target project files.
- This release does not authorize migration, release, deployment, CI mutation, hook mutation, production approval, or project authority transfer.
- This release does not make adoption assurance a business correctness proof.
- This release does not add a new workflow layer; it only hardens evidence precision for the existing Adoption Execution Assurance layer.

## Allowed Claims

- IntentOS 1.71.2 strengthens adoption assurance simulation evidence.
- Passed simulation steps now require executable step evidence, no-write markers, target diff status, and output digests.
- Source-system status is derived from typed fields where available instead of broad text scanning.
- Source-only examples, fixtures, and release records are not proof that a target project has adopted IntentOS.

## Forbidden Claims

- IntentOS 1.71.2 does not approve production, release, deployment, CI mutation, hook mutation, data migration, secrets, payment, compliance, or project authority transfer.
- IntentOS 1.71.2 does not prove product correctness or business correctness.
- IntentOS 1.71.2 does not allow Codex to write target project files from an adoption assurance report.
- IntentOS 1.71.2 does not let Codex replace project-owned release SOPs or protected governance.

## Evidence Status

- Resolver syntax is covered by `node --check scripts/resolve-adoption-assurance.mjs`.
- Checker syntax is covered by `node --check scripts/check-adoption-assurance.mjs`.
- Governance convergence resolver syntax is covered by `node --check scripts/resolve-governance-convergence.mjs`.
- Positive adoption assurance examples cover verified, partial, blocked, and failed assurance states.
- Negative fixtures cover full-adoption overclaims, unresolved evidence, write authorization, production approval, CI/hook mutation, release SOP replacement, stale diffs, AI log spam, state mismatch, surface mismatch, upstream-blocked verified state, placeholder apply-chain overclaim, missing simulation exit code, changed target diff, and unresolved generated evidence.

## Known Limitations

- Adoption assurance remains read-only and does not execute target-project migration.
- The simulation validates IntentOS routing behavior, not real feature implementation.
- Non-git target projects can report `NOT_GIT_REPO` for target diff status; this cannot support `SIMULATION_PASSED`.
- Human or project owner approval is still required for protected authority surfaces.

## Verification

- `node --check scripts/resolve-adoption-assurance.mjs`
- `node --check scripts/check-adoption-assurance.mjs`
- `node --check scripts/resolve-governance-convergence.mjs`
- `node scripts/check-adoption-assurance.mjs examples/1.71-adoption-execution-assurance/verified-existing-project --require-structured-evidence --require-simulation`
- `node scripts/check-adoption-assurance.mjs examples/1.71-adoption-execution-assurance/partial-existing-project --require-structured-evidence`
- `node scripts/check-adoption-assurance.mjs examples/1.71-adoption-execution-assurance/blocked-production-project --require-structured-evidence`
- `node scripts/check-adoption-assurance.mjs examples/1.71-adoption-execution-assurance/failed-assurance --require-structured-evidence`
- `node scripts/check-dev-kit.mjs`
