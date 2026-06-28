# Patch Classification False Positive: <case-name>

Use this file when a patch classification checker or reviewer flags a high-risk surface, but review shows the trigger is not actually high risk for the current task.

This record does not approve implementation. It only documents why the classifier may need calibration.

## Human Decision Summary

Conclusion:

Recommended choice: A / B / C / D

Can AI continue now: yes / limited / no

What I need from you:

| Option | What it means | What AI will do | Writes project files? | Risk | When to choose |
|---|---|---|---|---|---|
| A | Keep conservative flag | Leave the original high-risk signal in place | Report only | low if respected | Choose when safety is more important than reducing noise |
| B | Document exception | Record why this case is not high risk | Report only | low/medium | Choose when evidence shows the trigger is narrow |
| C | Adjust classifier later | Open a separate calibration proposal | Proposal/report only | medium | Choose when repeated false positives create workflow noise |
| D | Reject false positive | Treat the original classification as correct | Report only | low | Choose when the evidence does not justify calibration |

Recommended reason:

What happens if you do nothing:

## Human Summary


## Classification Status

Status: DRAFT / REVIEWED / ACCEPTED / REJECTED

Owner:

Reviewed at:

## Trigger

| Field | Value |
|---|---|
| Source report |  |
| Triggered keyword / surface |  |
| Trigger location |  |
| Original classification |  |
| Proposed classification after review |  |

## Why It Was Flagged


## Why It May Be A False Positive


## Safety Check

| Check | Result | Evidence |
|---|---|---|
| Touches API / schema / contract | Yes / No |  |
| Touches auth / permission / role model | Yes / No |  |
| Touches DB / migration / seed data | Yes / No |  |
| Touches environment / secret / CI / release | Yes / No |  |
| Weakens gate / validation / baseline | Yes / No |  |

## Calibration Decision

Decision: KEEP_CONSERVATIVE / ADJUST_KEYWORD / DOCUMENT_EXCEPTION / REJECT_FALSE_POSITIVE

Rationale:

Human reviewer:

## Required Human Decisions

| Decision | Reason | Owner | Status |
|---|---|---|---|
|  |  | human | PENDING |

## Outcome

`RECORD_ONLY`
