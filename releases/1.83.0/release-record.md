# IntentOS 1.83.0 Release Record

## Theme

Task Impact Tier Classifier for behavior-complete existing-project adoption.

## Summary

1.83.0 closes the gap between "IntentOS is available as a working method" and
"Codex chooses the right governance strength for this task." It adds Task
Governance so each task is classified as `LOW`, `MEDIUM`, `POSSIBLE_HIGH`, or
`HIGH` before implementation review.

The release is intentionally narrow. Task Governance routes work to existing
IntentOS systems; it does not create a parallel completion system and does not
authorize implementation.

## Changed

- Added Behavior-Complete Existing Project Adoption core and user docs.
- Added Task Governance report template, checklist, prompt, schema, report
  directory, resolver, and checker.
- Added `task-governance` and `task-governance-check` CLI entries.
- Added strict positive examples for low, medium, possible-high, high-impact,
  and project-native evidence mapping cases.
- Added bad fixtures for hidden high-impact surfaces, missing required
  governance, implementation overclaim, technical user burden, adoption-review
  blockers, and stronger-rule downgrades.
- Added self-check coverage for assets, examples, bad fixtures, CLI exposure,
  package verification surface, and generated report smoke.

## Allowed Claims

- Codex can classify a task as `LOW`, `MEDIUM`, `POSSIBLE_HIGH`, or `HIGH`.
- Codex can map required governance before implementation review and before a
  completion claim.
- Existing project-native evidence can be accepted when it is mapped with a
  ref, digest, task match, mapping state, and stronger-rule preservation.
- Low and medium tasks can stay lightweight when high-impact surfaces are
  explicitly excluded.
- High-impact tasks are routed to Business Rule Closure, Change Impact
  Coverage, Execution Plan, Verification Plan, Test Evidence, Execution
  Assurance, and Completion Evidence / Unified Close-Out.

## Forbidden Claims

- This release does not write target-project files.
- This release does not install `.intentos/`.
- This release does not create or replace `AGENTS.md`.
- This release does not change CI, hooks, release SOPs, production config,
  business code, DB, API, Web, Docker, secrets, payment, provider state, or
  project authority.
- This release does not approve implementation, commit, push, release,
  production, app-store review, or mini-program review.
- This release does not claim full IntentOS adoption.
- This release does not claim task completion.

## Evidence Status

- Resolver and checker syntax are covered by `verify:syntax`.
- Task Governance CLI smoke is covered by `verify:governance`.
- Representative positive examples are covered by `verify:examples`.
- `check-intentos` covers all 1.83 assets, positive examples, bad fixtures,
  CLI entries, package verification markers, and release evidence.

## Known Limitations

- 1.83.0 is a classifier and router only.
- It does not implement 1.83.1 source-binding expansion or 1.83.2 behavior
  enforcement.
- Classification is conservative and heuristic; project-specific calibration
  still depends on later source binding and project-native evidence mapping.
- High-impact task readiness remains blocked until required source systems or
  mapped project-native equivalents are recorded.

## Verification

Required verification:

```bash
node --check scripts/resolve-task-governance.mjs
node --check scripts/check-task-governance.mjs
node scripts/cli.mjs task-governance . --intent "新增审批状态规则"
node scripts/cli.mjs task-governance-check . --allow-empty
node scripts/check-task-governance.mjs examples/1.83-task-governance/low-copy-change --require-structured-evidence
node scripts/check-task-governance.mjs examples/1.83-task-governance/medium-list-filter --require-structured-evidence
node scripts/check-task-governance.mjs examples/1.83-task-governance/review-required-step-policy --require-structured-evidence
node scripts/check-task-governance.mjs examples/1.83-task-governance/project-native-rfc-mapping --require-structured-evidence
```

Bad fixtures must be rejected:

```bash
node scripts/check-task-governance.mjs test-fixtures/bad/bad-task-governance-authorizes-implementation --require-structured-evidence
node scripts/check-task-governance.mjs test-fixtures/bad/bad-task-governance-technical-user-prompt --require-structured-evidence
node scripts/check-task-governance.mjs test-fixtures/bad/bad-task-governance-no-business-rule-closure --require-structured-evidence
node scripts/check-task-governance.mjs test-fixtures/bad/bad-task-governance-stronger-rule-not-preserved --require-structured-evidence
```

Full suite:

```bash
npm run verify
node scripts/check-intentos.mjs
git diff --check
```
