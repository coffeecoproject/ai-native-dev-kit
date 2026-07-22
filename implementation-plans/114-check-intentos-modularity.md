# IntentOS 1.114 `check-intentos` Structural Modularity Plan

Intent: make a local structural split of scripts/check-intentos.mjs into domain suites while preserving output order and exit status

Task reference: task:12c82c109c92bf447d2fef6ab90654f6bed9f8d6a657e8a632d267297cf6c3a2

## Scope

Move the existing 109 self-check functions into seven ordered domain suites and one shared runtime module. Keep `scripts/check-intentos.mjs` as the only executable entry, preserve the original check-call order, shared PASS/FAIL accumulation, final exit code, Manifest distribution, and generated-project behavior.

## Boundaries

This is a repository-local structural refactor. It does not change product behavior, public APIs, database state, permissions, business rules, release policy, CI or hosted automation. It does not authorize commit, push, release, production, or external operations. The two untracked documents under `docs/plans/` remain independent user drafts and are excluded.

## Retrospective Governance Recovery

The implementation slice existed before the current evidence chain was completed. This plan binds and reviews the exact staged candidate without pretending the plan preceded the code. Completion remains blocked until Change Boundary, Test Evidence, Execution Assurance, closure, and a final unified-entry replay all pass.

## Implementation Sequence

1. Extract shared filesystem, process, fixture, PASS/FAIL, and exit-state helpers into `scripts/self-check/runtime.mjs`.
2. Move checks, without rewriting their bodies, into foundation, adoption, evidence, architecture, release, distribution, and generated-project-e2e suites.
3. Replace the former monolithic entry with ordered imports and one call per suite.
4. Add a structural characteristic test proving the entry stays thin, all 109 checks run exactly once in declaration order, suites do not depend on one another, and every module remains Manifest-authoritative.
5. Preserve package and Manifest distribution behavior for installed/generated projects.
6. Re-run focused positive/fail-closed tests, each domain suite, and finally the unified entry.

## Business Universe Scenario Review

Each bounded scenario is reviewed for lifecycle, provenance, and its exact negative or reverse behavior:

- `coverage-scenario:01d578497ee5964233f79b03` — `ORIGIN_OR_ENTRY`, `PROJECT_NATIVE_AUTOMATION`: Foundation and manifest checks cannot be omitted, duplicated, or reordered without the modularity contract failing.
- `coverage-scenario:9b4a4ff97feb8d5006f53a6d` — `ORIGIN_OR_ENTRY`, `PROJECT_NATIVE_AUTOMATION`: Adoption and project-entry checks cannot be omitted, duplicated, or reordered without the modularity contract failing.
- `coverage-scenario:7f0e56b0e62657c56bce3aca` — `ORIGIN_OR_ENTRY`, `PROJECT_NATIVE_AUTOMATION`: Evidence-chain checks cannot be omitted, duplicated, or reordered without the modularity contract failing.
- `coverage-scenario:303aba3df26da849267360df` — `ORIGIN_OR_ENTRY`, `PROJECT_NATIVE_AUTOMATION`: Architecture and governance checks cannot be omitted, duplicated, or reordered without the modularity contract failing.
- `coverage-scenario:7498182880c709117e157cbe` — `ORIGIN_OR_ENTRY`, `PROJECT_NATIVE_AUTOMATION`: Release checks cannot be omitted, duplicated, or reordered without the modularity contract failing.
- `coverage-scenario:5696811b3d45e0a14c6a26a6` — `ORIGIN_OR_ENTRY`, `PROJECT_NATIVE_AUTOMATION`: Distribution and trust checks cannot be omitted, duplicated, or reordered without the modularity contract failing.
- `coverage-scenario:c53e9fdd0c1684bdf256ee46` — `ORIGIN_OR_ENTRY`, `PROJECT_NATIVE_AUTOMATION`: Generated-project end-to-end check cannot be omitted, duplicated, or reordered without the modularity contract failing.
- `coverage-scenario:ecda09645d937df4ad616f84` — `ORIGIN_OR_ENTRY`, `PROJECT_RUNTIME_PATH`: Shared result and exit-state orchestration cannot be omitted, duplicated, or reordered without the modularity contract failing.
- `coverage-scenario:53bcc8749ab68010a8dfc71b` — `FAILURE_RETRY_OR_RECOVERY`, `PROJECT_RUNTIME_PATH`: A split suite must not reset, hide, or convert a prior failure into a successful unified exit.

## Source Authority And Consumer Consistency

`scripts/check-intentos.mjs` remains the executable source authority. Domain modules cannot call each other. `scripts/self-check/runtime.mjs` owns the shared result state. `tests/check-intentos-modularity.test.mjs` binds the static order and count, while the final unified replay proves the executable consumer composition.

## Verification

- `node --test tests/check-intentos-modularity.test.mjs tests/execution-distribution-trust.test.mjs`
- run each exported domain suite in isolation and confirm exit code 0
- `node scripts/check-manifest.mjs`
- `node scripts/check-intentos.mjs`
- `git diff --cached --check`
- compare the staged file set bidirectionally with Change Boundary
- confirm the only unstaged/untracked exceptions are the two preserved user drafts

## Rollback And Recovery

Before commit, reverse only this explicit structural patch if any characteristic or unified-entry check fails. Do not weaken a checker, edit failure output into success, or delete a failed run to claim completion. No production or external rollback path is involved.

## Completion Boundary

Completion requires exact staged scope agreement, Business Universe and Control Effectiveness, Change Impact, Verification Plan, current Test Evidence, Execution Assurance, Completion Evidence, closure checks, Manifest validation, unified-entry exit code 0, and a clean `git diff --cached --check`. This plan does not approve commit or push.
