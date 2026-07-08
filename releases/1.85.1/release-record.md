# IntentOS 1.85.1 Release Record

## Summary

1.85.1 hardens Task Governance Consumer Integration.

It keeps the 1.85 consumer model, but makes strict task-consumer checks prove a
single task-entry chain:

```text
Work Queue item
  -> same Task Governance report
  -> same consumer task_ref
  -> downstream completion/status claim
```

## Changes

- `scripts/lib/task-entry-binding.mjs` now validates referenced Work Queue
  Takeover and Task Governance structured evidence in strict mode.
- Strict consumers now require the Work Queue item's `task_governance_ref` and
  `task_governance_digest` to match the binding's Task Governance report.
- Closure Decision and User Delivery Console strict checks now require a
  consumer `task_ref`.
- `approved_resume_review: Yes` now requires `resume_review_ref`,
  `resume_review_digest`, `resume_review_owner`, and
  `resume_review_task_match`.
- 1.85 examples now use schema-valid Work Queue and Task Governance source
  evidence instead of minimal stubs.

## Allowed Claims

- Strict task consumers can reject mismatched Work Queue / Task Governance
  chains.
- Strict task consumers can reject source reports that fail structured evidence
  schema or digest validation.
- Strict Closure and User Delivery Console records require a task ref before
  they can pass strict task-consumer checks.
- Resume review can be represented as structured evidence.

## Forbidden Claims

- This release does not authorize implementation.
- This release does not approve completion by itself.
- This release does not approve commit or push.
- This release does not approve release or production.
- This release does not replace project-native reviewers.
- This release does not create a new closure system.
- This release does not prove source-system business correctness.

## Evidence Status

1.85.1 strengthens evidence identity. It checks that the downstream consumer is
not only bound to a Work Queue item and Task Governance report, but to the same
jointly verified task-entry pair.

## Known Limitations

- Source validation is structured-evidence validation, not full business
  correctness.
- HIGH task completion still depends on the source evidence chain consumed by
  Execution Assurance and Completion Evidence.
- Resume review evidence is checked for structure and task match; it does not
  approve resuming work by itself.

## Verification

Planned verification:

```bash
node scripts/check-execution-assurance.mjs examples/1.85-task-governance-consumer-integration/high-workflow-rule --require-structured-evidence --require-task-governance --require-work-queue --strict-task-consumer
node scripts/check-completion-evidence.mjs examples/1.85-task-governance-consumer-integration/possible-high-blocked --report completion-evidence-reports/001-possible-high-blocked.md --require-structured-evidence --require-task-governance --require-work-queue --strict-task-consumer
node scripts/check-closure-decision.mjs examples/1.85-task-governance-consumer-integration/possible-high-blocked --require-task-governance --require-work-queue --strict-task-consumer
node scripts/check-user-delivery-console.mjs examples/1.85-task-governance-consumer-integration/possible-high-blocked --require-task-governance --require-work-queue --strict-task-consumer
node scripts/check-intentos.mjs
npm run verify:syntax
npm run verify:examples
git diff --check
```

