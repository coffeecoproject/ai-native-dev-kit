# User Delivery Console Card

## Human Summary

Conclusion: {{CONCLUSION}}

Current status: {{CURRENT_STATUS}}

Can this task be treated as done: {{TASK_DONE}}

Can this move toward launch review: {{LAUNCH_REVIEW}}

Recommended next step: {{NEXT_STEP}}

What I need from you: {{HUMAN_NEED}}

## Delivery Status

| Field | Value |
|---|---|
| First version | {{FIRST_VERSION}} |
| Current state | {{CURRENT_STATE_LABEL}} |
| Plain reason | {{PLAIN_REASON}} |

## Task Completion

| Question | Answer |
|---|---|
| Is the need clear? | {{NEED_CLEAR}} |
| Are affected areas checked? | {{SURFACES_CHECKED}} |
| Is the check plan prepared? | {{VERIFICATION_PLAN_PREPARED}} |
| Is test/check evidence recorded? | {{TEST_CHECK_EVIDENCE_RECORDED}} |
| Is there a user verification note? | {{USER_VERIFICATION_NOTE_PROVIDED}} |
| Is execution proof recorded? | {{EXECUTION_RECORDED}} |
| Did the final completion record pass required checks? | {{COMPLETION_STRICT_CHECK}} |
| Can the current task be treated as done? | {{TASK_DONE}} |

## Product Readiness

| Question | Answer |
|---|---|
| Is there a first useful version? | {{FIRST_VERSION_READY}} |
| Can someone try it locally or in a review environment? | {{TRIAL_READY}} |
| Is this production approval? | No |

## Launch Readiness

| Question | Answer |
|---|---|
| Can this move toward launch review? | {{LAUNCH_REVIEW}} |
| What blocks launch review? | {{LAUNCH_BLOCKER}} |
| Does this card authorize release or production? | No |

## What Is Missing

{{MISSING_ITEMS}}

## What Codex Can Safely Do Next

{{SAFE_NEXT_ACTIONS}}

## What I Need From You

{{HUMAN_DECISIONS}}

## Technical Trace

| Source system | Status | Contribution | Authority |
|---|---|---|---|
{{TECHNICAL_TRACE}}

## Boundaries

- This card writes target files: No
- This card authorizes apply: No
- This card approves implementation: No
- This card approves commit or push: No
- This card approves release or production: No
- This card changes CI or hooks: No
- This card replaces lower-level evidence systems: No
- This card proves real-user stability: No
- This card approves security/privacy/compliance/payment/permission/migration/legal/tax/finance/production-risk decisions: No

## Outcome

`{{OUTCOME}}`
