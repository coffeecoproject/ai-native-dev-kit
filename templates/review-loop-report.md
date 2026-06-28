# Review Loop Report: <task-name>

Use this file to record task-level review, automatic fixes, re-review, and human-decision routing after implementation.

This report does not approve risk, scope, merge, or release. It records what was reviewed and what remains.

## Human Decision Summary

Conclusion:

Recommended choice: A / B / C / D

Can AI continue now: yes / limited / no

What I need from you:

| Option | What it means | What AI will do | Writes project files? | Risk | When to choose |
|---|---|---|---|---|---|
| A | Accept review result | Keep current result and close the task report | Report only | low | Choose when findings are resolved or not applicable |
| B | Auto-fix allowed findings | Fix deterministic AUTO_FIX items in task scope | Yes, approved task files only | low/medium | Choose when issues are narrow and already classified |
| C | Human decision required | Stop and route decision before more changes | No, unless decision record is saved | medium/high | Choose for risk, scope, architecture, migration, release, or repeated findings |
| D | Pause | Stop review loop and wait | No | low | Choose when the review source or evidence is incomplete |

Recommended reason:

What happens if you do nothing:

## Human Summary

One-sentence conclusion:

## Decision Needed

Does this review require human decision before AI continues: Yes / No

Decision:

## Next Safe Step

Next action:

## Status

Task:

Related Spec:

Related Eval:

Task Level: L0 / L1 / L2 / L3

Review required: Yes / No

Reason:

Current round: 0

Max auto-fix rounds: 2

Final status: OPEN / AUTO_FIXED / NEEDS_HUMAN_DECISION / BLOCKED / DONE

## Review Packet

Review Packet ref:

GPT Review Prompt ref:

Task:

Spec:

Eval:

Risk Gate:

Risk Gate Exclusions:

Human Approval:

Baseline state:

Industrial baseline state:

Engineering Baseline Follow-check:

Environment Baseline Follow-check:

Changed files:

Commands run:

Evidence refs:

## Assumption Register

Use this section when review or repair decisions depend on inferred or unconfirmed facts.

| Assumption | Evidence | Confidence | Can proceed? | Needs human confirmation? | Owner | Status |
|---|---|---|---|---|---|---|
|  |  | high / medium / low | Yes / No | Yes / No | AI / human | CONFIRMED / INFERRED / PENDING_CONFIRMATION / NOT_APPLICABLE |

## Review Rounds

| Round | Reviewer | Mode | Result | Notes |
|---|---|---|---|---|
|  |  | self / subagent / GPT Pro / human |  |  |

## Findings

Findings are current-task review issues. Future work must be listed under `Next-Step Suggestions`, not as AUTO_FIX.

| ID | Severity | Category | Finding | Evidence | Proposed action | Owner | Status |
|---|---|---|---|---|---|---|---|
|  | P0 / P1 / P2 | AUTO_FIX / NEEDS_HUMAN_DECISION / NEEDS_CLARIFICATION / NO_ACTION |  |  |  |  |  |

## Change Boundary Follow-check

Change-boundary report checked: Yes / No / Not applicable

Forbidden paths changed: No / Yes

Out-of-scope changes were auto-fixed: No

Required disposition: PASS / NEEDS_REVIEW / NEEDS_REVERT / NEEDS_HUMAN_DECISION / NOT_APPLICABLE

## Baseline State Follow-check

Baseline-state report checked: Yes / No / Not applicable

No-code baseline overclaimed as confirmed: No / Yes

Draft industrial pack claimed stable: No / Yes

## Next-Step Suggestions

Suggestions are bounded follow-up items after the current task. They are not review findings and are not approval to continue.

| ID | Type | Suggestion | Relation to current task | Can AI do now? | Required entry | Risk / approval |
|---|---|---|---|---|---|---|
| N1 | IN_SCOPE_NEXT_STEP / DIRECT_FOLLOW_UP / RISK_DECISION / OUT_OF_SCOPE_OBSERVATION / DO_NOT_PROCEED |  |  | Yes / No | current task / new request / follow-up proposal / human decision / do not proceed |  |

## Auto-fix Attempts

| Round | Finding IDs | Fix summary | Commands run | Result | New issues |
|---|---|---|---|---|---|
|  |  |  |  |  |  |

## Verification After Fix

Commands:

```text

```

Result:

Evidence:

Failures:

## Re-review Result

Resolved:

- 

Repeated issues:

- 

Remaining issues:

- 

Stop condition triggered: Yes / No

Stop condition reason:

## Baseline Enforcement

Did implementation follow Engineering Baseline: Yes / No / Not applicable

Engineering baseline ref:

Did implementation follow Environment Baseline: Yes / No / Not applicable

Environment baseline ref:

Did implementation introduce a baseline decision without updating baseline or decision brief: Yes / No

Did implementation touch environment, release, secret, or production config without approval: Yes / No

Baseline enforcement command:

```text
node scripts/check-baseline-enforcement.mjs . --mode implementation
```

## Human Decision Queue

| Decision | Reason | Options | Recommended | Owner | Status |
|---|---|---|---|---|---|
|  |  |  |  | human | PENDING / APPROVED / REJECTED / NOT_REQUIRED |

## Final Summary

Automatically fixed:

- 

Still open:

- 

Needs human:

- 

Merge / release recommendation:

- 
