# Patch Classification False Positive: unsafe accepted case

This bad fixture must fail because it records real high-risk impact while accepting the false positive.

## Human Summary

The report tries to accept a false-positive classification even though the safety check admits API and gate impact.

## Classification Status

Status: ACCEPTED

Owner: Codex

Reviewed at: 2026-06-27

## Trigger

| Field | Value |
|---|---|
| Source report | `patch-classifications/001.md` |
| Triggered keyword / surface | api |
| Trigger location | affected surfaces |
| Original classification | SAFE_LOCAL_FIX |
| Proposed classification after review | SAFE_LOCAL_FIX |

## Why It Was Flagged

The change mentions API contract and validation gate behavior.

## Why It May Be A False Positive

The report claims it is safe despite admitted API and gate impact.

## Safety Check

| Check | Result | Evidence |
|---|---|---|
| Touches API / schema / contract | Yes | API contract changes are present |
| Touches auth / permission / role model | No | not mentioned |
| Touches DB / migration / seed data | No | not mentioned |
| Touches environment / secret / CI / release | No | not mentioned |
| Weakens gate / validation / baseline | Yes | validation gate is bypassed |

## Calibration Decision

Decision: DOCUMENT_EXCEPTION

Rationale: Treat as false positive.

Human reviewer: Codex

## Required Human Decisions

| Decision | Reason | Owner | Status |
|---|---|---|---|
| Accept false positive | unsafe local patch | human | PENDING |

## Outcome

`RECORD_ONLY`
