# Workflow Guidance Card

## Human Decision Summary

Conclusion: <plain project state and routing summary>

Recommended next step: <one next step>

Can AI continue now: <yes / limited / no>

What I need from you: <up to three decisions>

What happens if you do nothing: <safe default>

## Plain Summary

<Explain in non-specialist language. Do not expose internal workflow names in plain mode.>

## User Intent

| Field | Value |
|---|---|
| Provided intent | `<user intent or Not provided>` |
| Intent classification | `<NOT_PROVIDED / BUILD_NEW_PRODUCT / ADD_FEATURE / ADD_PAYMENT_OR_VALUE_TRANSFER / ADD_AUTH_OR_PERMISSION / DATA_OR_MIGRATION_CHANGE / RELEASE_OR_DEPLOY / DOCUMENT_GOVERNANCE / TASK_SWITCH_OR_RESUME / BUG_FIX / AUTOMATION_OR_HOOK / GENERAL_CHANGE>` |
| Intent risk level | `<low / medium / high / unknown>` |
| Review focus | `<plain review focus>` |

## Project Reading

| Field | Value |
|---|---|
| User mode | `plain` |
| Project state | `<NEW_PROJECT / EXISTING_PROJECT / PRODUCTION_SENSITIVE_PROJECT / DIRTY_WORKTREE_PROJECT / DEV_KIT_REPOSITORY / UNKNOWN>` |
| Existing users assumed | `<Yes / No / Unknown treated as Yes>` |
| Can write files now | `No` |
| Risk level | `<low / medium / high / unknown>` |

## Delivery Path State

`<IDEA_ONLY / NEEDS_PROJECT_READING / READY_FOR_PLAN / READY_FOR_LOCAL_BUILD / READY_FOR_SELF_TEST / READY_FOR_INTERNAL_TRIAL / READY_FOR_RELEASE_REVIEW / BLOCKED_BY_RISK / BLOCKED_BY_DIRTY_WORK / BLOCKED_BY_MISSING_DECISION>`

Next state: `<next delivery path state>`

## Recommended Next Step

<One clear next step in plain language.>

## Distance To Useful Use

| Check | Status | What is missing |
|---|---|---|
| Goal clarity | `<clear / unclear / needs confirmation>` | `<missing item>` |
| Project can run locally | `<unknown / confirmed / not yet>` | `<missing item>` |
| Core function complete | `<not started / partial / complete / unknown>` | `<missing item>` |
| Tests or checks run | `<not run / run / not applicable>` | `<missing item>` |
| High-risk scope clear | `<unknown / yes / no>` | `<missing item>` |
| Can someone else try it | `<not yet / self-test / internal trial / release review>` | `<missing item>` |

## Questions For Human

1. <question one>
2. <question two>
3. <question three>

## Internal Routing

| Situation | Internal capability | User-facing meaning | Run now |
|---|---|---|---|
| <situation> | `<internal capability>` | <plain meaning> | `<Yes / No / Later>` |

## What I Checked

Use this section only for `guide --deep`.

| Area | Status | Finding | Next action |
|---|---|---|---|
| <plain checked area> | `<PASS / FAIL / SKIPPED>` | <plain finding> | <one safe next action> |

## Boundaries

- This guidance writes target files: No
- This guidance modifies CI: No
- This guidance installs hooks: No
- This guidance deletes or archives documents: No
- This guidance changes task state: No
- This guidance approves implementation: No
- This guidance approves release or production: No
- This guidance approves security/privacy/compliance/payment/migration decisions: No

## Outcome

`<GUIDANCE_RECORDED / NEEDS_HUMAN_DECISION / BLOCKED>`
