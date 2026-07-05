# Guided Delivery Baseline 1.3 Plan

## Human Summary

This phase turns the existing IntentOS workflow kit into a bounded guided delivery system. It fixes the product direction, claim boundary, and assumption handling before adding any larger launch-readiness layer.

## Outcome

IntentOS should help users move from an idea to software that is understandable, reviewable, maintainable, and ready for risk-matched delivery.

Codex may read, judge, draft, decompose, execute approved tasks, verify, repair deterministic issues, record evidence, and report.

Humans decide, choose, approve, accept risk, confirm scope, and confirm launch or delivery boundaries.

## Scope

This phase adds:

- outcome baseline
- product baseline
- claim control
- assumption register
- product baseline checker
- claim control checker
- templates and review checklist
- examples and bad fixtures
- release evidence and workflow artifacts for this phase

This phase does not add full Safe Launch / Delivery Readiness. That remains a separate phase because it touches release, rollback, monitoring, production evidence, and operational ownership.

## Product Boundary

The phase must preserve these boundaries:

- `start` remains read-only.
- `baseline` remains read-only by default.
- Existing project writes remain plan-first.
- Reports, review packets, goal cards, and subagent outputs are not approvals.
- Simulated dogfood is not production evidence.
- Draft packs are not stable packs.
- Industrial packs remain selected-only.
- Unknown, dirty, governed, and production-sensitive projects default to read-only assessment.
- AI assumptions must be marked as assumptions and routed to humans when confidence is not enough.

## Architecture

```text
Idea
  -> Guided Adoption Entry
  -> Project Classification
  -> Engineering / Environment Baseline Setup
  -> Goal Mode
  -> IntentOS Workflow
  -> Subagent Orchestration if useful
  -> Task Execution
  -> Review Loop
  -> Baseline Enforcement
  -> Claim Control
  -> Human-facing Report
```

## Goal Mode Plan

Main goal:

```text
Establish Guided Delivery Baseline for IntentOS.
```

Modes:

- `DEFINE_WORK`: document the bounded 1.3 plan.
- `IMPLEMENT_TASK`: add core files, templates, scripts, examples, and metadata.
- `REVIEW_TASK`: run product baseline, claim control, manifest, fixture, and intentos checks.
- `REPAIR_TASK`: repair deterministic checker failures only.
- `HANDOFF_OR_REPORT`: record evidence and summarize remaining boundaries.

## Subagent Plan

Use many readers / one writer:

- Main thread is the only writer.
- Read-only subagents may review outcome, product baseline, claim control, assumptions, and overreach risks.
- Subagents do not approve scope, risk, release, or future work.
- Subagents must be `CLOSED` or `SKIPPED` before final response.

## Deliverables

Core:

- `core/outcome-baseline.md`
- `core/product-baseline.md`
- `core/claim-control.md`
- `core/assumption-register.md`

Templates:

- `templates/product-baseline-review.md`
- `templates/claim-control-report.md`
- `templates/assumption-register.md`

Checklists and prompts:

- `checklists/product-baseline-review.md`
- `checklists/claim-control-review.md`
- `prompts/product-baseline-agent.md`
- `prompts/claim-control-agent.md`

Scripts:

- `scripts/check-product-baseline.mjs`
- `scripts/check-claim-control.mjs`

Docs:

- `docs/guided-delivery-baseline.md`
- `docs/product-baseline.md`
- `docs/claim-control.md`

Examples and fixtures:

- `examples/1.3-guided-delivery-baseline/`
- `test-fixtures/bad/bad-overclaimed-release/`
- `test-fixtures/bad/bad-unmarked-assumption/`
- `test-fixtures/bad/bad-report-as-approval/`

Workflow evidence:

- request, preflight, spec, eval, task
- goal card
- subagent run plan
- review packet
- review loop report
- final report
- release record

## Checkers

`check-product-baseline.mjs` verifies that the product direction and authority boundaries exist and are referenced by templates, release evidence, and reports.

`check-claim-control.mjs` verifies that release records and reports do not overclaim simulated evidence, draft maturity, production readiness, or approval authority.

Both checkers are deterministic and conservative. They do not call external models.

## Acceptance Criteria

- IntentOS outcome is written as a durable baseline.
- IntentOS upgrade behavior is constrained by product baseline.
- Release records declare allowed claims, forbidden claims, known limitations, and evidence status.
- Final reports state that they do not approve risk, scope, release, or future work.
- Assumptions are recorded with evidence, confidence, and human-confirmation status.
- Bad fixtures fail for overclaiming, unmarked assumptions, and report-as-approval language.
- Generated projects receive the new core assets, templates, prompts, checklists, and check scripts.
- `check-intentos`, `check-manifest`, product baseline check, claim control check, and fixture checks pass.

## Non-goals

- No automatic launch approval.
- No production-readiness guarantee.
- No hook automation.
- No external GPT/API reviewer automation.
- No industrial pack promotion.
- No default BL2.
- No new target-project write behavior outside existing plan-first controls.
