# Review Loop Report: <task-name>

Use this file to record task-level review, automatic fixes, re-review, and bounded user-input routing after implementation.

This report does not approve risk, scope, merge, or release. It records what was reviewed and what remains.

## User Input Summary

Conclusion:

User input class: NO_USER_ACTION / BUSINESS_FACT_NEEDED / REAL_WORLD_CONSENT_NEEDED / EXTERNAL_FACT_NEEDED

User input needed now: Yes / No

Plain-language question, if needed:

Why project evidence cannot answer it:

Codex recommendation in business language:

Prepared real-world effect and safeguards, if applicable:

What happens if you do nothing:

## Human Summary

One-sentence conclusion:

## User Input Needed

Does this review require bounded user input before Codex continues: Yes / No

Input class: NO_USER_ACTION / BUSINESS_FACT_NEEDED / REAL_WORLD_CONSENT_NEEDED / EXTERNAL_FACT_NEEDED

Business fact, exact effect, or external fact needed:

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

Real-world effect consent ref:

External authority evidence ref:

Baseline state:

Industrial baseline state:

Engineering Baseline Follow-check:

Environment Baseline Follow-check:

Changed files:

Commands run:

Evidence refs:

## Assumption Register

Use this section when review or repair decisions depend on inferred or unconfirmed facts.

| Assumption | Evidence | Confidence | Can proceed? | User input class | Owner | Status |
|---|---|---|---|---|---|---|
|  |  | high / medium / low | Yes / No | NO_USER_ACTION / BUSINESS_FACT_NEEDED / REAL_WORLD_CONSENT_NEEDED / EXTERNAL_FACT_NEEDED | Codex / user / external authority | CONFIRMED / INFERRED / PENDING_CONFIRMATION / NOT_APPLICABLE |

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

| ID | Type | Suggestion | Relation to current task | Can AI do now? | Required entry | Risk / required evidence |
|---|---|---|---|---|---|---|
| N1 | IN_SCOPE_NEXT_STEP / DIRECT_FOLLOW_UP / RISK_DECISION / OUT_OF_SCOPE_OBSERVATION / DO_NOT_PROCEED |  |  | Yes / No | current task / new request / follow-up proposal / bounded user input / do not proceed |  |

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

Did implementation cause a real-world environment, release, secret, or production effect without exact consent: Yes / No

Baseline enforcement command:

```text
node scripts/check-baseline-enforcement.mjs . --mode implementation
```

## Human Decision Queue

Compatibility heading: semantically this is the bounded `User Input Queue`; it does not grant technical decision authority.

Technical findings do not belong in this queue. Codex must resolve architecture, dependency, migration, repair, review-depth, and repeated-verification questions through internal planning and evidence.

| Input class | Missing business fact, exact prepared effect, or external fact | Why project evidence is insufficient | Plain-language recommendation | Source | Status |
|---|---|---|---|---|---|
| NO_USER_ACTION / BUSINESS_FACT_NEEDED / REAL_WORLD_CONSENT_NEEDED / EXTERNAL_FACT_NEEDED |  |  |  | user / external authority / N/A | PENDING / PROVIDED / CONSENTED / NOT_REQUIRED |

## Final Summary

Automatically fixed:

- 

Still open:

- 

Needs bounded user input:

- 

Merge / release recommendation:

- 
