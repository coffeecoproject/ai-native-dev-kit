# Evidence Reliability & Risk Calibration 1.47 Plan

## Human Summary

1.47 hardens the 1.46 ordinary-user product loop without turning IntentOS into an apply runner.

The focus is evidence reliability, risk-surface calibration, and MVP example portability. Change Impact Coverage is planned for 1.48 and is not implemented in this release.

## Problem

1.46 made the first-version product loop stronger, but four gaps remain:

1. Product completeness can read local smoke evidence, but text evidence is still heuristic.
2. Low-risk apply candidate source checks still use 1.45 wording even though structured evidence landed in 1.46.
3. Risk-surface detection is shared but lacks explicit benign false-positive calibration.
4. Real MVP examples are both static Web examples, so portability beyond Web UI is not demonstrated.

## Goals

- Support structured JSON product evidence for product completeness.
- Keep legacy text evidence compatible for existing target projects.
- Update apply-candidate checker source evidence wording to 1.46 structured evidence.
- Add risk-surface calibration fixtures for benign and risky phrases.
- Add one non-Web static MVP example.
- Keep all examples and release checks read-only and non-authorizing.

## Non-Goals

- No apply runner.
- No writer automation.
- No hook installer.
- No CI modifier.
- No automatic release or production deployment.
- No Change Impact Coverage implementation.
- No target-project migration requirement.

## Scope

### Product Evidence

Add `schemas/artifacts/product-completeness-evidence.schema.json`.

`resolve-product-completeness` should accept:

- legacy text evidence
- structured JSON evidence

Structured evidence must record:

- status
- command
- covered checks
- summary
- authority boundaries

Legacy text evidence remains supported, but structured evidence is preferred in Dev Kit examples and release checks.

### Apply Candidate Evidence

`check-low-risk-apply-candidate` should:

- include the low-risk apply schema in required assets
- check 1.46 release evidence
- use 1.46 structured apply-candidate wording for source evidence
- keep target projects compatible with legacy Markdown unless `--require-structured-evidence` is used

### Risk Calibration

Add explicit risk-surface calibration inside self-check:

- benign words such as `workflow`, `key metric`, and `package display copy` should not be high-risk by themselves
- actual GitHub workflow, secret key, deployment, payment, migration, or permission contexts should remain high-risk

The goal is not to make risk detection less safe. The goal is to reduce obvious false positives while keeping dangerous contexts blocked.

### MVP Portability

Add a small local CLI MVP example that follows the same loop:

```text
plain goal
-> first-slice
-> local runnable MVP
-> structured evidence
-> product completeness
-> final local-demo report
```

The example must not claim production readiness or real-user adoption.

## Acceptance Plan

Run:

```bash
node scripts/check-low-risk-apply-candidate.mjs examples/1.45-low-risk-apply-candidate --require-structured-evidence
node scripts/resolve-product-completeness.mjs examples/mvp-booking-web-app --evidence evidence/smoke-output.json
node scripts/resolve-product-completeness.mjs examples/mvp-cli-note-tool --evidence evidence/smoke-output.json
node scripts/check-mvp-example.mjs examples/mvp-booking-web-app
node scripts/check-mvp-example.mjs examples/mvp-dashboard-web-app
node scripts/check-mvp-example.mjs examples/mvp-cli-note-tool
node scripts/check-dev-kit.mjs
npm run verify
git diff --check
```

Expected results:

- structured JSON evidence is accepted
- legacy text evidence remains accepted
- bad product-completeness and bad apply-candidate fixtures still fail
- risk calibration catches benign and high-risk cases separately
- all MVP examples pass local smoke checks
- no command authorizes apply, implementation, release, production, hooks, CI, secrets, payment, permissions, migration, or data changes

## 1.48 Boundary

Change Impact Coverage belongs to 1.48.

1.47 may reference it only as future work. It must not add a partial impact-coverage checker or hidden implementation requirement.
