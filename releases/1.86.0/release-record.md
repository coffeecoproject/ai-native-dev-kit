# IntentOS 1.86.0 Release Record

## Summary

1.86.0 adds Execution And Release Runtime Hygiene.

It gives Codex a structured way to classify engineering-runtime blockers that
appear after task work starts moving toward commit, push, CI, release handoff,
or release packaging.

```text
Work Queue
  -> Task Governance
  -> Execution / Completion Consumers
  -> Runtime Hygiene
  -> Delivery Status / Release Owner Review
```

## Changes

- Added `core/execution-release-runtime-hygiene.md` and
  `docs/execution-release-runtime-hygiene.md`.
- Added `templates/runtime-hygiene-report.md`,
  `schemas/artifacts/runtime-hygiene.schema.json`,
  `checklists/runtime-hygiene-review.md`, and
  `prompts/runtime-hygiene-agent.md`.
- Added `scripts/resolve-runtime-hygiene.mjs` and
  `scripts/check-runtime-hygiene.mjs`.
- Added CLI commands:
  - `runtime-hygiene`
  - `runtime-hygiene-check`
- Added strict examples for:
  - stale Git lineage;
  - pre-push structure gate failure;
  - CI environment retry classification;
  - artifact quota approval;
  - oversized release bundle evidence preservation.
- Added bad fixtures for force push, gate bypass, false done claims, artifact
  deletion, evidence deletion, production-side-effect uncertainty, release ID
  reuse, bundle slimming by deleting evidence, and technical user burden.

## Runtime Classes

- `GIT_LINEAGE_DIRTY`
- `COMMIT_SCOPE_MIXED`
- `PRE_PUSH_GATE_FAILED`
- `STRUCTURE_BUDGET_EXCEEDED`
- `CI_CODE_FAILURE`
- `CI_ENVIRONMENT_FAILURE`
- `RELEASE_PREFLIGHT_FAILED`
- `ARTIFACT_QUOTA_BLOCKED`
- `RELEASE_BUNDLE_OVERSIZED`
- `PRODUCTION_SIDE_EFFECT_UNKNOWN`
- `PRODUCTION_SIDE_EFFECT_PRESENT`

## Allowed Claims

- Runtime Hygiene can classify a runtime blocker.
- Runtime Hygiene can keep the task open after local gate or CI failure.
- Runtime Hygiene can require project-gate repair before push.
- Runtime Hygiene can require release-owner approval for irreversible artifact
  cleanup or production-side-effect ambiguity.
- Runtime Hygiene can require plain user approval before bundle slimming when
  evidence must be preserved outside the runtime bundle.

## Forbidden Claims

- This release does not write target-project files.
- This release does not approve commit or push.
- This release does not approve release or production.
- This release does not bypass project gates.
- This release does not delete artifacts.
- This release does not remove evidence.
- This release does not force push.
- This release does not replace project-native release authority.

## Evidence Status

Runtime Hygiene creates task-bound `runtime_hygiene` evidence with
`runtime_hygiene_digest`. Strict checks require the report reference, outcome,
boundaries, decision state, and task-continuation fields to match.

## Known Limitations

- Runtime Hygiene classifies delivery-runtime blockers; it does not prove that
  the feature or business rule is complete.
- Runtime Hygiene does not authorize commit, push, release, production,
  artifact deletion, gate bypass, force push, or evidence removal.
- CI environment retries still depend on project policy and proof that no
  production side effect exists.
- Artifact quota cleanup still requires release-owner approval because deletion
  can be irreversible.
- Bundle slimming must preserve evidence outside the runtime bundle; it cannot
  delete evidence to make a package smaller.
- Production-side-effect ambiguity blocks continuation until the release owner
  or incident path determines the production state.

## Verification

Verification commands:

```bash
node scripts/check-runtime-hygiene.mjs examples/1.86-runtime-hygiene/git-old-branch-rebase-plan --require-structured-evidence
node scripts/check-runtime-hygiene.mjs examples/1.86-runtime-hygiene/pre-push-structure-gate --require-structured-evidence
node scripts/check-runtime-hygiene.mjs examples/1.86-runtime-hygiene/ci-environment-retry --require-structured-evidence
node scripts/check-runtime-hygiene.mjs examples/1.86-runtime-hygiene/release-artifact-quota-preflight --require-structured-evidence
node scripts/check-runtime-hygiene.mjs examples/1.86-runtime-hygiene/release-bundle-evidence-bloat --require-structured-evidence
node scripts/check-intentos.mjs
node scripts/check-manifest.mjs
npm run verify:syntax
npm run verify:examples
npm run verify:release
git diff --check
```
