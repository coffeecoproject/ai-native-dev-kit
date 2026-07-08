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
| Task ref | {{TASK_REF}} |
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

## Task Entry Binding

| Field | Value |
|---|---|
| Work Queue Item Ref | {{WORK_QUEUE_ITEM_REF}} |
| Work Queue Item Digest | {{WORK_QUEUE_ITEM_DIGEST}} |
| Work Queue Item State | {{WORK_QUEUE_ITEM_STATE}} |
| Work Queue Item Current Task Match | {{WORK_QUEUE_ITEM_CURRENT_TASK_MATCH}} |
| Approved Resume Review | {{APPROVED_RESUME_REVIEW}} |
| Resume Review Ref | {{RESUME_REVIEW_REF}} |
| Resume Review Digest | {{RESUME_REVIEW_DIGEST}} |
| Resume Review Owner | {{RESUME_REVIEW_OWNER}} |
| Resume Review Task Match | {{RESUME_REVIEW_TASK_MATCH}} |
| Task Governance Ref | {{TASK_GOVERNANCE_REF}} |
| Task Governance Digest | {{TASK_GOVERNANCE_DIGEST}} |
| Task Governance Tier | {{TASK_GOVERNANCE_TIER}} |
| Task Governance Review Level | {{TASK_GOVERNANCE_REVIEW_LEVEL}} |
| Task Governance Task Match | {{TASK_GOVERNANCE_TASK_MATCH}} |
| Minimal Verification Status | {{MINIMAL_VERIFICATION_STATUS}} |
| Targeted Verification Status | {{TARGETED_VERIFICATION_STATUS}} |
| High Impact Evidence Chain Complete | {{HIGH_IMPACT_EVIDENCE_CHAIN_COMPLETE}} |
| Task Governance Blocks Completion | {{TASK_GOVERNANCE_BLOCKS_COMPLETION}} |
| Tier Completion Requirements Satisfied | {{TIER_COMPLETION_REQUIREMENTS_SATISFIED}} |
| Unresolved Task Governance Blockers | {{UNRESOLVED_TASK_GOVERNANCE_BLOCKERS}} |
| Plain User Blocker | {{PLAIN_USER_BLOCKER}} |

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
