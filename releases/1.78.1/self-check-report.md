# IntentOS 1.78.1 Self-Check Report

## Status

Passed.

## Commands

```bash
node --check scripts/resolve-completion-evidence.mjs
node --check scripts/check-completion-evidence.mjs
node --check scripts/check-intentos.mjs
node scripts/check-completion-evidence.mjs examples/1.78-completion-evidence-gate/appointment-service-time --report completion-evidence-reports/001-service-time.md --require-structured-evidence --require-source-refs --require-ready
node scripts/check-manifest.mjs
node scripts/check-product-baseline.mjs .
node scripts/check-claim-control.mjs .
node scripts/check-intentos.mjs
npm run verify
git diff --check
```

Bad fixture sweep:

```text
bad-completion-evidence-missing-test-evidence: rejected
bad-completion-evidence-task-mismatch: rejected
bad-completion-evidence-execution-not-verified: rejected
bad-completion-evidence-vp-bound-to-different-brc: rejected
bad-completion-evidence-test-evidence-bound-to-different-plan: rejected
bad-completion-evidence-ea-missing-test-evidence-ref: rejected
bad-completion-evidence-source-digest-mismatch: rejected
bad-completion-evidence-source-schema-invalid: rejected
bad-completion-evidence-intent-digest-mismatch: rejected
```

## Result

- Syntax checks passed for the Completion Evidence resolver, checker, and
  IntentOS self-check.
- Strict positive Completion Evidence example passed with source refs,
  structured evidence, and ready-mode checks enabled.
- Manifest, product baseline, and claim-control checks passed after the
  1.78.1 release record was expanded with a meaningful Verification section.
- `node scripts/check-intentos.mjs` passed.
- `npm run verify` passed.
- `git diff --check` passed.

## Notes

The `completion_evidence_gate` artifact schema remains at `1.78.0` because
1.78.1 is a checker, fixture, and documentation hardening patch. The added
strictness is enforced by source-chain binding checks, not a new artifact type.
