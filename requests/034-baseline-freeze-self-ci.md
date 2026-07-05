# Request: Baseline Freeze And Self CI

## Raw Request

Start executing the Productization Hardcut plan by implementing Phase 0.34.0: Baseline Freeze + Self CI.

## User / Customer

Maintainers of `intentos` who need the repository to become a product-grade workflow kit.

## Problem

The IntentOS already has strong workflow governance and examples, but the repository itself does not yet have first-party CI, baseline release evidence, or repository-level contribution and security guidance.

## Desired Outcome

Freeze the current `0.33.0` state, add intentos-owned CI and repository governance files, and record proof that the current checks and generated-project smoke can run as a baseline for later productization phases.

## Constraints

- Do not start CLI, manifest, schema, or init/update plan refactors in this phase.
- Do not change target-project bootstrap semantics.
- Do not add new workflow concepts.
- Keep existing `check-intentos` behavior green.
- Record evidence before moving to 0.35.

## Priority

P1

## Suggested Task Level

L2
