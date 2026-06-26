# Task 001: Review Loop L2 Slice

## Task Level

L2

## Related Spec

`specs/001-review-loop-l2-slice.md`

## Related Eval

`evals/001-review-loop-l2-slice.md`

## Goal

Create one complete Review Loop L2 dogfood example that passes workflow artifact and semantic review checks.

## Scope

Allowed:

- example request, preflight, spec, eval, and task artifacts
- review packet, GPT review prompt, review loop report, final report, follow-up proposal, and plain review summary
- self-check coverage for this example

Not allowed:

- hook automation
- external API integration
- product feature implementation
- platform-specific baseline requirement
- production release
- production config change
- new dependency

## Acceptance Criteria

- `AUTO_FIX`, `NEEDS_HUMAN_DECISION`, `DIRECT_FOLLOW_UP`, and `DO_NOT_PROCEED` are represented in the right artifact sections.
- Review Loop semantic checker passes.
- Next-Step Boundary semantic checker passes.
- Human-decision finding is not auto-fixed.
- Future suggestions are not implemented inside this task.

## Commands

Run:

```bash
node scripts/check-workflow-artifacts.mjs examples/review-loop-l2-first-slice --mode implementation --task tasks/001-review-loop-l2-slice.md
node scripts/check-review-loop.mjs examples/review-loop-l2-first-slice --mode implementation --task tasks/001-review-loop-l2-slice.md
node scripts/check-next-step-boundary.mjs examples/review-loop-l2-first-slice --mode implementation --task tasks/001-review-loop-l2-slice.md
```

## AI Budget

Max agent runs: 1
Max repair runs: 1
Use high reasoning model: No
Stop if: the example needs hook automation, external API use, dependency addition, or production behavior.

## Risk Gate

This task touches:

- [ ] auth
- [ ] permission
- [ ] migration
- [ ] regulated operation
- [ ] irreversible operation
- [ ] value transfer
- [ ] safety-critical behavior
- [ ] data deletion
- [ ] production config
- [ ] secrets
- [ ] personal data
- [ ] regulated data
- [ ] external side effect
- [ ] privileged operation
- [ ] app signing / platform release
- [ ] cloud function / access rule
- [ ] form interaction
- [ ] api failure
- [ ] accessibility
- [ ] performance
- [ ] dependency change

If any item is checked, implementation requires explicit human approval before code changes.

## Human Approval

Required: No
Status: Not Required
Approval scope: Not Required
Approved by:
Approved at:
Approval notes:

## Stop Conditions

Stop and report if:

- the example starts requiring real product code
- a reviewer asks to implement hook automation
- a finding requires dependency, architecture, production, release, or approval-boundary changes
- semantic checker output conflicts with the documented protocol

## Final Report Required

- What changed
- What did not change
- Tests or evidence recorded
- Risks remaining
- Bounded next-step suggestions
