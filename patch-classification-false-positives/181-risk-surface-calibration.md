# Patch Classification False Positive: risk surface calibration

This source-level calibration record documents the first accepted false-positive boundary for 1.8.1. It is intentionally generic and does not reference a private target project.

## Human Summary

Some high-risk keywords such as API, package, env, or CI are intentionally conservative. They should block unsafe `SAFE_LOCAL_FIX` claims when real risk is present, but teams need a recorded way to explain reviewed false positives without weakening the default classifier.

## Classification Status

Status: REVIEWED

Owner: human

Reviewed at: 2026-06-27

## Trigger

| Field | Value |
|---|---|
| Source report | `patch-classifications/180-governed-web-repair-scale.md` |
| Triggered keyword / surface | api / env / ci / package class terms |
| Trigger location | affected surfaces and verification wording |
| Original classification | STRUCTURAL_REMEDIATION |
| Proposed classification after review | STRUCTURAL_REMEDIATION |

## Why It Was Flagged

The classifier treats API, environment, CI, package, schema, contract, permission, migration, release, and gate terms as high-risk surface markers.

## Why It May Be A False Positive

In future reports, a high-risk word can appear only as background context or as an explicitly excluded non-goal. That should not automatically prove the task is structural, but it must be recorded and reviewed before being treated as safe.

## Safety Check

| Check | Result | Evidence |
|---|---|---|
| Touches API / schema / contract | No | false-positive path is only for reviewed background mention |
| Touches auth / permission / role model | No | false-positive path cannot be used when permission changes are present |
| Touches DB / migration / seed data | No | false-positive path cannot be used when data changes are present |
| Touches environment / secret / CI / release | No | false-positive path cannot be used for real env, CI, or release changes |
| Weakens gate / validation / baseline | No | false-positive path cannot weaken gates |

## Calibration Decision

Decision: KEEP_CONSERVATIVE

Rationale: keep the default checker conservative, but require a false-positive record when a report claims the trigger is only background context.

Human reviewer: human

## Required Human Decisions

| Decision | Reason | Owner | Status |
|---|---|---|---|
| Adjust high-risk keyword list | not enough evidence yet | human | DEFERRED |

## Outcome

`RECORD_ONLY`
