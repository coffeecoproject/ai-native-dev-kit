# Release Owner And Completion Set Binding 1.80.3 Plan

## Purpose

1.80.3 is a Release Evidence Gate hardening patch.

It closes two review-handoff gaps:

- a release candidate may include multiple Completion Evidence reports, but the
  gate must not strictly validate only the first one;
- release owner, risk owner, environment owner, and release approval status must
  be structured evidence, not inferred only from prose.

The goal is still release-owner review handoff. This patch does not approve
release, deploy production, submit app-store or mini-program review, execute
migrations, record secrets, mutate CI, or prove real-user stability.

## Scope

1.80.3 includes:

- `completion_evidence_set` in Release Evidence Gate structured evidence;
- strict set checks for every included Completion Evidence ref in ready or
  strict reports;
- task-ref binding from every included Completion Evidence item to
  `release_scope.included_task_refs`;
- `owner_readiness` structured fields;
- production-like owner readiness checks for release owner, risk owner, and
  environment owner;
- Markdown/JSON consistency for the new sections;
- positive and negative fixtures;
- release record and verification evidence.

1.80.3 does not include:

- Post-Launch Evidence;
- release execution;
- automatic deployment;
- external platform submission;
- project-specific release rules;
- approval to write target project files.

## Execution Plan

1. Update `schemas/artifacts/release-evidence-gate.schema.json`.
2. Update `scripts/resolve-release-evidence-gate.mjs` to emit:
   - `completion_evidence_set`;
   - `owner_readiness`.
3. Update `scripts/check-release-evidence-gate.mjs` to:
   - validate every included Completion Evidence ref;
   - run strict Completion Evidence checks for ready/strict reports;
   - require task refs to belong to release scope;
   - require production-like owner refs before ready handoff;
   - reject invalid release approval refs.
4. Regenerate 1.80 examples:
   - web preview with two Completion Evidence refs;
   - mini-program review with structured owner readiness;
   - production-review blocked evidence.
5. Add bad fixtures for:
   - second Completion Evidence not strictly checked;
   - Completion Evidence task missing from release scope;
   - production-like target missing risk owner;
   - approval ref implying release approval.
6. Update docs, templates, checklist, README, VERSION, manifest, and release
   evidence.

## Acceptance Plan

Required commands:

```bash
node --check scripts/resolve-release-evidence-gate.mjs
node --check scripts/check-release-evidence-gate.mjs
node scripts/check-release-evidence-gate.mjs examples/1.80-release-evidence-gate/web-preview-handoff --require-structured-evidence --require-current-completion --strict-source-binding
node scripts/check-release-evidence-gate.mjs examples/1.80-release-evidence-gate/mini-program-review-handoff --require-structured-evidence --require-platform-recipe
node scripts/check-release-evidence-gate.mjs examples/1.80-release-evidence-gate/admin-production-review-blocked --require-structured-evidence
node scripts/check-release-evidence-gate.mjs test-fixtures/bad/bad-release-evidence-second-completion-unchecked --report release-evidence-gate-reports/001-web-preview.md --require-structured-evidence --strict-source-binding
node scripts/check-release-evidence-gate.mjs test-fixtures/bad/bad-release-evidence-completion-task-not-in-release-scope --report release-evidence-gate-reports/001-web-preview.md --require-structured-evidence --strict-source-binding
node scripts/check-release-evidence-gate.mjs test-fixtures/bad/bad-release-evidence-production-without-risk-owner-ref --report release-evidence-gate-reports/001-mini-program-review.md --require-structured-evidence --require-platform-recipe
node scripts/check-release-evidence-gate.mjs test-fixtures/bad/bad-release-evidence-approval-ref-implies-release-approved --report release-evidence-gate-reports/001-web-preview.md --require-structured-evidence
node scripts/check-intentos.mjs
npm run verify
git diff --check
```

The bad-fixture commands must fail with the expected targeted errors.

## Success Criteria

- Ready Release Evidence Gate reports cannot validate only the first Completion
  Evidence item.
- Every included Completion Evidence ref resolves, records a digest, passes
  strict checks, and belongs to the release scope before handoff.
- Owner readiness is a structured contract.
- Production-like handoff cannot be ready without concrete release, risk, and
  environment owner refs.
- Invalid approval refs cannot imply release approval.
- The gate remains a review-evidence package, not release approval.
