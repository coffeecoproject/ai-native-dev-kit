# IntentOS 1.77.0 Release Record

Release date: 2026-07-06

## Theme

Test Evidence Binding.

1.77.0 adds the layer after Verification Plan Governance:

```text
Verification Plan -> Test Evidence Report
```

The Verification Plan says what must be checked. The Test Evidence Report proves whether concrete evidence actually covers each required obligation.

## Added

- `core/test-evidence-binding.md`
- `docs/test-evidence-binding.md`
- `templates/test-evidence-report.md`
- `schemas/artifacts/test-evidence.schema.json`
- `checklists/test-evidence-review.md`
- `prompts/test-evidence-agent.md`
- `test-evidence-reports/.gitkeep`
- `scripts/resolve-test-evidence.mjs`
- `scripts/check-test-evidence.mjs`
- CLI commands:
  - `test-evidence`
  - `test-evidence-check`
- Positive 1.77 example under `examples/1.77-test-evidence-binding/`
- Bad fixtures for missing, stale, skipped, failed, broad, mismatched, ownerless, and Markdown/JSON-inconsistent evidence.

## Allowed Claims

- IntentOS can record explicit evidence against a Verification Plan.
- IntentOS can check whether every required Verification Plan obligation has task-bound evidence.
- IntentOS can reject stale, failed, skipped, flaky, not-run, unresolved, wrong-task, broad-command-only, output-digest-mismatched, or ownerless evidence.
- IntentOS can preserve Business Rule Closure and Change Impact Coverage bindings through the Verification Plan into Test Evidence.

## Forbidden Claims

- 1.77.0 does not execute tests.
- 1.77.0 does not design tests.
- 1.77.0 does not approve implementation.
- 1.77.0 does not approve release or production.
- 1.77.0 does not prove product correctness.
- 1.77.0 does not prove real-environment behavior.
- 1.77.0 does not replace Execution Assurance or Unified Closure.

## Evidence Status

The 1.77.0 evidence is recorded as project-local command evidence and example fixture evidence. The positive example binds all 9 required Verification Plan obligations to concrete test evidence, preserves Business Rule Closure and Change Impact Coverage source bindings, and passes strict structured-evidence validation.

The bad fixtures intentionally cover missing Verification Plan references, digest mismatch, missing required obligations, failed evidence, skipped evidence, stale evidence, wrong-task evidence, output digest mismatch, broad command-only evidence, invalid manual evidence ownership, waiver without human decision evidence, Markdown/JSON mismatch, and source-system digest mismatch.

## Verification

- `node --check scripts/resolve-test-evidence.mjs`
- `node --check scripts/check-test-evidence.mjs`
- `node scripts/check-test-evidence.mjs . --allow-empty`
- `node scripts/check-test-evidence.mjs examples/1.77-test-evidence-binding/appointment-service-time --report test-evidence-reports/001-service-time.md --require-structured-evidence --require-verification-plan-ref --strict-source-binding --require-current-evidence --require-test-quality-controls`

## Known Limitations

- 1.77.0 records and checks test evidence binding; it does not execute tests.
- 1.77.0 can reject missing, stale, failed, skipped, weak, or mismatched evidence records; it cannot prove the underlying test implementation is semantically perfect.
- 1.77.0 does not approve release, production behavior, real-environment readiness, or business correctness by itself.
- 1.77.0 does not replace Execution Assurance or Unified Closure; later execution-level checks must consume this layer as evidence, not treat it as final delivery approval.

## Status

Complete for 1.77.0 scope.
