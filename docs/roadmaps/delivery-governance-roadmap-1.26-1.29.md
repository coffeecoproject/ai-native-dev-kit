# Delivery Governance Roadmap 1.26-1.29

This roadmap continues the productization path after Natural Language Workflow
Guidance and Review Surface Governance.

The goal is not to add more work for the user. The goal is to let Codex route,
execute, review, and record work while the human only makes product, risk,
authorization, and acceptance decisions.

## Version Plan

| Version | Theme | Main Question | Output |
|---|---|---|---|
| 1.26 | Delivery Path Governance | How far is this project from being usable by real people? | Delivery Path Report |
| 1.27 | Debt & Knowledge Handoff | What debt and handoff knowledge did this task leave behind? | Debt Register and Knowledge Handoff |
| 1.28 | Document Archive Apply | Which document archive actions are ready for controlled apply? | Archive Plan and Archive Index |
| 1.29 | Hook Policy Hardening | Which hooks are allowed, who approves them, and how are they rolled back? | Project Hook Policy |

## 1.26 Delivery Path Governance

Codex must report the delivery path state before claiming progress toward use,
trial, release review, or launch.

States:

- `IDEA_ONLY`
- `NEEDS_PROJECT_READING`
- `READY_FOR_PLAN`
- `READY_FOR_LOCAL_BUILD`
- `READY_FOR_SELF_TEST`
- `READY_FOR_INTERNAL_TRIAL`
- `READY_FOR_RELEASE_REVIEW`
- `BLOCKED_BY_RISK`
- `BLOCKED_BY_DIRTY_WORK`
- `BLOCKED_BY_MISSING_DECISION`

Boundary:

- Does not approve implementation.
- Does not approve release or production.
- Does not replace Safe Launch.
- Does not prove real users can use the product.

## 1.27 Debt & Knowledge Handoff

Codex must make debt and handoff knowledge explicit after non-trivial work.

Debt levels:

- `D0_NO_DEBT_FOUND`
- `D1_ACCEPTABLE_SMALL_DEBT`
- `D2_MAINTENANCE_DEBT`
- `D3_RELEASE_BLOCKING_DEBT`
- `D4_HIGH_RISK_DEBT`

Boundary:

- Does not forgive debt.
- Does not approve release.
- Does not replace Review Loop or Safe Launch.

## 1.28 Document Archive Apply

Codex may prepare archive apply plans from Document Lifecycle evidence, but
archive actions stay reviewable and reversible.

Boundary:

- No deletion by default.
- No archive apply without explicit approval.
- Link checks and archive index are required before any apply claim.

## 1.29 Hook Policy Hardening

Codex may classify project hook policy and allowed automation boundaries, but
actual hook installation remains a separate approved implementation task.

Boundary:

- No hook installation.
- No CI mutation.
- No blocking gate activation.
- No external API hook enablement.

## Execution Rules

Each version must include:

- core protocol
- user-facing docs
- template
- checklist
- prompt
- CLI command and checker
- example
- bad fixture
- release record
- self-check evidence
- manifest and generated-project coverage
- full verification before commit

Each version must be committed and pushed before the next version starts.
