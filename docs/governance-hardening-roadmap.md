# Governance Hardening And Goal-Oriented Orchestration Roadmap

This document defines the next development path after Engineering Baseline Entry.

The goal is not to add more governance layers. The goal is to make existing governance stable enough to reuse, check, explain, and improve.

## Position

```text
0.30.x Governance Hardening
  Make existing protocols verifiable with examples, negative fixtures, and stable checker output.

0.31.x Goal Mode Entry
  Let Codex classify the user's goal and choose the smallest safe workflow path.

0.32.x Subagent Orchestration Protocol
  Let read-only agents help planning and review while keeping writes controlled by one writer.
```

## Current Goal

Goal:

```text
Turn the 0.30.0 governance-hardening plan into repository assets and start executing it with fixture-driven checks.
```

Planning classification:

```text
DEFINE_WORK + IMPLEMENT_TASK
```

Task level:

```text
L1
```

Reason:

- The change affects dev-kit docs, examples, fixtures, and self-check scripts.
- It does not change target-project bootstrap semantics.
- It does not introduce source-code scanning gates.
- It does not introduce automated external reviewer calls.

## Subagent Run Policy

Use subagents only when they reduce risk or speed up independent read-only work.

Rules:

- Many readers, one writer.
- The main thread is the only writer for this change.
- Explorer agents may inspect existing examples, scripts, and self-check patterns.
- Reviewer-style agents may audit the final diff, but must not edit files.
- Worker agents may be used later only with disjoint write ownership.

Forbidden in this phase:

- multiple writers editing the same tree
- reviewer agents editing files
- automated GPT/API review hooks
- platform-specific engineering-topic rules
- source import boundary scans
- magic-string scans
- DTO/domain source-code scans

## 0.30.0 Governance Hardening

Objective:

```text
Use golden examples, negative fixtures, and a fixture runner to prove that the current protocols catch the failures they are supposed to catch.
```

Required assets:

```text
examples/engineering-baseline-enum-vs-lookup/
examples/engineering-baseline-api-dto-domain/
examples/next-step-boundary-suggestions/
test-fixtures/
scripts/check-fixtures.mjs
```

Required behavior:

- Good examples must pass their targeted checkers.
- Bad fixtures must fail their targeted checkers.
- Failure assertions must check the reason, not just the exit code.
- Fixture checks must be run by `scripts/check-dev-kit.mjs`.
- Fixture checks must not scan real project source code.
- Fixture checks must not become target-project required workflow assets.

## Golden Examples

Golden examples show the intended path. They are not templates to copy blindly.

Required example themes:

- `engineering-baseline-enum-vs-lookup`: shows that enum/string/lookup/state-machine choices are engineering decisions.
- `engineering-baseline-api-dto-domain`: shows that API DTOs, schema types, domain models, and UI view models need source-of-truth boundaries.
- `next-step-boundary-suggestions`: shows all allowed next-step suggestion types and their execution boundaries.

## Negative Fixtures

Negative fixtures prove that bad outputs are rejected.

Required fixture themes:

- `bad-engineering-baseline`: a baseline missing a required engineering decision section must fail strict baseline checking.
- `bad-review-loop`: a Review Loop report must not classify new dependencies or risky scope as `AUTO_FIX`.
- `bad-next-step-boundary`: a direct follow-up must not be marked as work AI can do immediately.

## 0.30.1 Fixture UX Hardening

Objective:

```text
Make fixture failures easier to understand and expand negative coverage without adding target-project gates.
```

Scope:

- fixture runner failure output includes command and repair guidance
- fixture cases include `howToFix` guidance
- negative fixtures cover unresolved Engineering Baseline decisions
- negative fixtures cover AUTO_FIX round limit violations
- negative fixtures cover `RISK_DECISION` suggestions missing human-decision routing

Non-goals:

- target-project CI changes
- source-code scanning
- Goal Mode implementation
- subagent orchestration implementation

## 0.30.2 Output Quality And Glossary

Objective:

```text
Make human-facing reports easier to understand before Goal Mode starts routing work automatically.
```

Scope:

- output quality scoring for durable human-facing reports
- glossary usage checks for important workflow terms
- output quality report template
- negative fixtures for low-quality reports and missing glossary terms

Non-goals:

- target-project CI changes
- automatic report rewriting
- external reviewer automation
- Goal Mode implementation

## 0.31.0 Goal Mode Entry

Goal Mode will classify user intent before selecting artifacts.

Initial modes:

```text
DISCUSS_ONLY
ADOPT_PROJECT
DEFINE_WORK
IMPLEMENT_TASK
REVIEW_TASK
REPAIR_TASK
BASELINE_DECISION
HANDOFF_OR_REPORT
```

This phase should add:

```text
core/goal-mode.md
templates/goal-card.md
checklists/goal-mode-review.md
prompts/goal-planner-agent.md
scripts/check-goal-mode.mjs
```

Do not make Goal Mode bypass request, spec, eval, task, Engineering Baseline, Review Loop, or Human Approval gates.

## 0.32.0 Subagent Orchestration Protocol

Subagent orchestration will define role boundaries.

Core principle:

```text
Many readers, one writer.
```

Default roles:

- Goal Planner: read-only route selection.
- Engineering Baseline Agent: read-only engineering-decision gap detection.
- Spec Agent: artifact drafting, not implementation.
- Builder: default writer for one approved task.
- Reviewer: read-only findings.
- Repair: writer limited to `AUTO_FIX`, maximum two rounds.
- Reporter: human-readable output, no approval authority.

This phase should add or update:

```text
core/subagent-orchestration.md
templates/subagent-run-plan.md
checklists/subagent-orchestration-review.md
prompts/engineering-baseline-agent.md
prompts/spec-agent.md
prompts/repair-agent.md
scripts/check-subagent-orchestration.mjs
```

## Acceptance Criteria For This Phase

- `scripts/check-fixtures.mjs` exists and is syntax-checked.
- Fixture cases are machine-readable.
- At least three golden example checks pass.
- At least three negative fixture checks fail for the expected reason.
- `scripts/check-dev-kit.mjs` runs the fixture runner.
- README and version docs point to the roadmap and fixture runner.
- No new target-project bootstrap requirement is introduced.
