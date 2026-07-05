---
schema_version: 1.0
artifact_type: task
number: 190
slug: human-decision-summary
title: Human Decision Summary
spec: specs/190-human-decision-summary.md
eval: evals/190-human-decision-summary.md
task_level: L1
status: done
created_at: 2026-06-28
---
# Task 190: Human Decision Summary

## Task Level

L1

## Related Spec

`specs/190-human-decision-summary.md`

## Related Eval

`evals/190-human-decision-summary.md`

## Goal

Upgrade IntentOS output so users can judge Codex recommendations through clear options rather than internal status fields.

## Scope

Allowed:

- core output protocol
- reporter and workflow prompts
- decision/status/adoption/baseline/review/launch templates
- `workflow-next`, `start`, `baseline`, and migration report output
- docs, README, manifest, version, checkers, and release evidence

Not allowed:

- target project writes
- automatic GPT/API review hooks
- automatic real-project scanning
- approval authority changes
- baseline direct apply without reviewed plan

## Acceptance Criteria

- `Human Decision Summary` exists in the core protocol and human-facing templates.
- Decision-heavy prompts require the summary first.
- `workflow-next --format human`, `start`, `baseline`, and migration reports print option tables.
- Options state file-write impact and risk.
- Docs explain that users choose and confirm; Codex handles drafting/checking.
- Full intentos checks pass.

## Commands

Run:

```bash
node --check scripts/workflow-next.mjs
node --check scripts/start-project.mjs
node --check scripts/baseline-project.mjs
node --check scripts/init-project.mjs
node scripts/check-manifest.mjs
node scripts/check-product-baseline.mjs .
node scripts/check-claim-control.mjs .
node scripts/check-workflow-artifacts.mjs . --mode ready --task tasks/190-human-decision-summary.md
node scripts/check-next-step-boundary.mjs . --task tasks/190-human-decision-summary.md
node scripts/check-intentos.mjs
git diff --check
```

## AI Budget

Max agent runs: 1
Max repair runs: 2
Use high reasoning model: No
Stop if: a change would turn reports into approvals, weaken governed-project protection, or add target-project write authority.

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

## Baseline References

Engineering Baseline touched: No

Environment Baseline touched: No

Baseline refs:

- `docs/engineering-baseline.md` / Not applicable
- `docs/environment-baseline.md` / Not applicable

Baseline decisions introduced:

- No

## Human Approval

Required: No
Status: Not Required
Approval scope: Not Required
Approved by:
Approved at:
Approval notes:

## Stop Conditions

Stop and report if:

- an option hides file writes
- a report becomes approval
- migration reports can apply without explicit approval
- baseline setup can write without reviewed plan
- output requires users to infer recommendations from technical status codes

## Final Report Required

- Human Decision Summary
- Completed
- Verified
- Not Changed
- Risks Remaining
- Next-Step Suggestions
- Human Decisions Needed
- Next Safe Action
