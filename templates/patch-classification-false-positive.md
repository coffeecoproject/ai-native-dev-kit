# Patch Classification False Positive: <case-name>

Use this file when a patch classification checker or reviewer flags a high-risk surface, but review shows the trigger is not actually high risk for the current task.

This record does not approve implementation. It only documents why the classifier may need calibration.

## Human Decision Summary

Compatibility heading: semantically this is the bounded `User Input Summary`; it grants no technical decision authority.

Conclusion:

User input class: NO_USER_ACTION / BUSINESS_FACT_NEEDED / REAL_WORLD_CONSENT_NEEDED / EXTERNAL_FACT_NEEDED

User input needed now: Yes / No

Plain-language question or exact consent request, if needed:

Why project evidence cannot answer it:

What happens if you do nothing:

## Codex Calibration Decision And Evidence

Selected disposition: KEEP_CONSERVATIVE / DOCUMENT_EXCEPTION / ADJUST_CLASSIFIER_LATER / REJECT_FALSE_POSITIVE

Can Codex continue now: yes / limited / no

Trigger and root-cause evidence:

Safety and scope analysis:

Verification, review route, and technical recovery:

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

Codex reviewer and evidence ref:

## Required Human Decisions

Compatibility heading: semantically this is the bounded `User Input Queue`; classifier calibration is excluded.

| Input class | Missing business fact, exact prepared effect, or external fact | Why project evidence is insufficient | Source | Status |
|---|---|---|---|---|
| NO_USER_ACTION / BUSINESS_FACT_NEEDED / REAL_WORLD_CONSENT_NEEDED / EXTERNAL_FACT_NEEDED |  |  | user / external authority / N/A | PENDING / PROVIDED / CONSENTED / NOT_REQUIRED |

## Outcome

`RECORD_ONLY`
