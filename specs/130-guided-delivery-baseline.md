# Spec 130: Guided Delivery Baseline

## Human Summary

1.3.0 fixes the product direction and evidence language for AI Native Dev Kit.

## Functional Requirements

- Add outcome, product, claim, and assumption core files.
- Add product baseline and claim control checkers.
- Add templates, checklists, prompts, examples, and bad fixtures.
- Update final report, review packet, review loop, customer handoff, and status report templates with Assumption Register.
- Update release records to include allowed claims, forbidden claims, evidence status, known limitations, and verification.
- Update manifest, generated-project assets, platform CI, and self-check.

## Boundary Requirements

- Reports must not approve release, risk, scope expansion, or future work.
- Simulated evidence must not be described as production evidence.
- Draft packs must not be described as stable.
- Unknown assumptions must be visible when they affect decisions.
- `INFERRED` facts must not become formal baseline rules.

## Non-goals

- No Safe Launch checker.
- No production deployment gate.
- No external GPT/API automation.
- No new approval authority for AI or subagents.
