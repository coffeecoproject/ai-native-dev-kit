# Guided Closure Card

## Human Decision Summary

Conclusion: <plain close-out conclusion>

Recommended next step: <one next step>

Can AI continue now: <yes / limited / no>

What I need from you: <up to three decisions>

What happens if you do nothing: <safe default>

## Plain Close-Out Status

| Field | Value |
|---|---|
| Closure state | `<NO_TASK_TO_CLOSE / NEEDS_VERIFICATION / NEEDS_IMPACT_COVERAGE / NEEDS_HUMAN_DECISION / READY_FOR_REVIEW / CLOSE_WITH_LIMITATIONS / BLOCKED>` |
| Can count as done | `<Yes / Limited / No>` |
| Plain reason | <plain reason without internal command burden> |

## What I Checked

| Area | Status | Finding | Next action |
|---|---|---|---|
| Task intent | `<PASS / FAIL / NEEDS_REVIEW / SKIPPED>` | <finding> | <next action> |
| Changed files | `<PASS / FAIL / NEEDS_REVIEW / SKIPPED>` | <finding> | <next action> |
| Verification | `<PASS / FAIL / NEEDS_REVIEW / SKIPPED>` | <finding> | <next action> |
| Related surfaces | `<PASS / FAIL / NEEDS_REVIEW / SKIPPED>` | <finding> | <next action> |
| Evidence freshness | `<PASS / FAIL / NEEDS_REVIEW / SKIPPED>` | <finding> | <next action> |

## What Is Still Needed

1. <missing item or `Nothing obvious from this read-only pass.`>

## What Codex Can Do Next

1. <safe next action>

## What Needs Human Decision

1. <decision or `No decision needed for this read-only close-out card.`>

## Technical Details

| Field | Value |
|---|---|
| Intent | `<intent>` |
| Changed files detected | `<number>` |
| Impact coverage reports found | `<number>` |
| Execution closure reports found | `<number>` |
| Verification provided | `<Yes / No>` |
| Internal checks selected | `<plain list>` |

## Boundaries

- This card writes target files: No
- This card authorizes apply: No
- This card approves implementation: No
- This card approves commit or push: No
- This card approves release or production: No
- This card modifies CI or hooks: No
- This card changes task state: No
- This card forgives debt: No
- This card replaces Review Loop: No
- This card replaces Safe Launch: No
- This card approves security/privacy/compliance/payment/migration decisions: No

## Outcome

`<CLOSURE_GUIDANCE_RECORDED / NEEDS_HUMAN_DECISION / BLOCKED>`
