# IntentOS 1.76.0 Release Record

## Phase

Verification Plan Governance.

Also known during planning as Verification And Test Governance, but the shipped scope is intentionally narrower: IntentOS now plans verification; it does not run tests.

## Summary

1.76.0 adds a source-bound Verification Plan layer between Business Rule Closure / Change Impact Coverage and later execution assurance.

Codex can now answer:

```text
What must be verified for this task, and how do we avoid weak or incorrect tests?
```

without claiming that tests were executed, implementation is complete, or release/production is approved.

## Added

- `core/verification-test-governance.md`
- `docs/verification-test-governance.md`
- `templates/verification-plan.md`
- `checklists/verification-plan-review.md`
- `prompts/verification-plan-agent.md`
- `schemas/artifacts/verification-plan.schema.json`
- `verification-plans/.gitkeep`
- `scripts/resolve-verification-plan.mjs`
- `scripts/check-verification-plan.mjs`
- CLI aliases:
  - `verification-plan`
  - `verification-plan-check`
- 1.76 appointment service-time example.

## Behavior

The resolver produces a Verification Plan with:

- `verification_plan_ref`
- `verification_plan_digest`
- `intent_digest`
- `source_systems`
- Business Rule Closure binding
- Change Impact Coverage binding
- affected surfaces
- verification obligations
- test correctness controls
- manual verification ownership
- not-applicable obligation reasons
- explicit no-authority boundaries

The checker rejects:

- missing structured evidence in strict mode
- stale or mismatched source reports
- missing `verification_plan_ref`
- task or intent mismatch across source systems
- missing obligations for required impact surfaces
- API contract plans without positive and negative checks
- backend rule plans without backend rule checks
- broad-command-only proof for required business/API/backend/UI checks
- blocking manual verification without an owner
- release, production, implementation, or test-execution overclaims

## Allowed Claims

- IntentOS can produce a source-bound Verification Plan.
- Verification Plans can be checked with strict structured evidence.
- Broad command output alone is not sufficient proof for required obligations.
- Generated or AI-written tests need correctness controls when risk requires them.

## Forbidden Claims

- This release executes tests.
- This release proves product correctness.
- This release approves implementation.
- This release approves release or production.
- This release replaces Execution Assurance.
- This release replaces human ownership of domain, release, privacy, payment, compliance, legal, tax, finance, HR, migration, or production decisions.

## Verification

Expected checks:

```bash
node --check scripts/resolve-verification-plan.mjs
node --check scripts/check-verification-plan.mjs
node scripts/check-verification-plan.mjs examples/1.76-verification-plan/appointment-service-time --report verification-plans/001-service-time.md --require-structured-evidence --require-business-rule-ref --require-impact-ref --strict-source-binding
node scripts/check-intentos.mjs
node scripts/check-manifest.mjs
npm run verify
```

## Evidence Status

- Source assets are declared in `intentos-manifest.json`.
- `templates/workflow-version.json` is expected to match manifest workflow assets.
- `scripts/check-intentos.mjs` includes 1.76 asset presence, resolver, JSON, strict example, CLI delegation, and bad-case rejection checks.
- The generated-project smoke path writes a Business Rule Closure report, writes a Change Impact Coverage report that consumes it, writes a Verification Plan report that consumes both, and checks the same saved Verification Plan with strict source binding.
- The example under `examples/1.76-verification-plan/appointment-service-time` is the public structured evidence fixture.

## Known Limitations

- Verification Plan is not a test runner.
- Verification Plan checks plan quality, source binding, and obligations; it does not prove the tests themselves passed.
- Strict structured evidence is opt-in for older projects unless a maintainer requires it.
- Manual owner fields are structural evidence only; IntentOS does not verify real-world identity.
- Execution-class completion still requires Execution Assurance. Verification Plan alone is not completion proof.

## Boundary

1.76.0 is a planning and checking layer. It does not add a test runner, write target files, execute apply plans, approve commit or push, mutate CI/hooks, touch secrets, run migrations, call providers, or approve release/production.
