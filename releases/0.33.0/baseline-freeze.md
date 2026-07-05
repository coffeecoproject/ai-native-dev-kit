# Baseline Freeze: 0.33.0

## Human Summary

This file freezes the `0.33.0` baseline before Productization Hardcut phase `0.34.0`. It records the commit, major capability surface, checks, examples, generated-project assets, and license boundary that future phases must preserve unless a later phase explicitly changes them.

## Baseline Identity

- Version: `0.33.0`
- Baseline commit: `1acd7440f4ffc295cba9abd8324e943d06eb8099`
- Short commit: `1acd744`
- Branch at freeze time: `main`
- Freeze purpose: Productization Hardcut starting point

## Capability Surface

- Goal Mode Entry
- Subagent Orchestration
- Engineering Baseline
- Review Loop Protocol
- Bounded Next-Step Protocol
- Output Experience Protocol
- Fixture-driven checker validation
- Web and Mini Program industrial pack examples
- Generated-project bootstrap and workflow asset update support

## Baseline Examples

- `examples/generic-first-change/`
- `examples/review-loop-l2-first-slice/`
- `examples/web-industrial-bl2-first-slice/`
- `examples/miniprogram-industrial-bl2-first-slice/`
- `examples/goal-subagent-l2-feature/`
- `examples/engineering-baseline-enum-lookup/`
- `examples/engineering-baseline-dto-boundary/`
- `examples/next-step-boundary-bounded-suggestions/`

## Baseline Checkers

- `scripts/check-intentos.mjs`
- `scripts/check-fixtures.mjs`
- `scripts/check-ai-workflow.mjs`
- `scripts/check-workflow-artifacts.mjs`
- `scripts/check-review-loop.mjs`
- `scripts/check-next-step-boundary.mjs`
- `scripts/check-goal-mode.mjs`
- `scripts/check-subagent-orchestration.mjs`
- `scripts/check-engineering-baseline.mjs`
- `scripts/check-platform-baseline.mjs`
- `scripts/check-industrial-pack.mjs`
- `scripts/check-industrial-baseline.mjs`
- `scripts/check-workflow-version.mjs`
- `scripts/score-output-quality.mjs`
- `scripts/check-glossary-usage.mjs`

## Generated-Project Asset Boundary

The `0.33.0` generated-project surface includes `.intentos/` assets, workflow check scripts, onboarding docs, engineering baseline docs, review-loop directories, goal cards, subagent run plans, final reports, status reports, decision briefs, review summaries, customer handoffs, and GitHub workflow governance templates.

## License Statement

The repository remains licensed under Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0). This baseline record does not change the license and is not legal advice.

## Evidence Boundary

This freeze is repository baseline evidence. It is not proof that the kit has been adopted successfully in a real production project.
