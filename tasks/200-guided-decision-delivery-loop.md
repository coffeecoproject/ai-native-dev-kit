# Task 200: Guided Decision & Delivery Loop

## Task Level

L2

## Related Spec

`specs/200-guided-decision-delivery-loop.md`

## Related Eval

`evals/200-guided-decision-delivery-loop.md`

## Goal

Implement the 1.10.0 Guided Decision & Delivery Loop as a formal experience/routing upgrade without adding a heavy mandatory gate.

## Allowed Scope

- Core docs
- Templates
- Prompts
- README and usage docs
- Platform adapters
- `new-workflow-item`
- init/update guidance
- manifest and version metadata
- release evidence
- self-check coverage

## Forbidden Scope

- Do not add automatic external GPT/API review.
- Do not add automatic target-project scanning.
- Do not approve target-project writes.
- Do not make the new artifacts mandatory for every task.
- Do not weaken existing gates or patch classification.

## Human Approval

Required: No

Status: Not Required

Approval scope: IntentOS workflow assets only. No target project writes.

## Verification

Run the commands listed in `evals/200-guided-decision-delivery-loop.md`.
