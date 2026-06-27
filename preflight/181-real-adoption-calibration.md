---
schema_version: 1.0
artifact_type: preflight
number: 181
slug: real-adoption-calibration
title: Real Adoption Calibration
request: requests/181-real-adoption-calibration.md
task_level: L1
status: done
created_at: 2026-06-27
---
# Preflight: 181-real-adoption-calibration

## Source Request

`requests/181-real-adoption-calibration.md`

## Clarity

READY

## Problem Summary

1.8 is correct, but needs small usability and calibration fixes from review before more real trials.

## Missing Information

- No additional target project selected.
- No permission to auto-generate reports from a real target project.

## Assumptions

- False-positive logging should keep conservative defaults.
- Usage docs are enough for now; automatic runner remains future work.

## Direction Risks

- Accidentally making false-positive records a bypass.
- Turning 1.8.1 into a new governance layer.
- Suggesting `real-adoption` automatically scans private projects.

## Over-design Risks

- Adding an automatic target-project scanner before privacy and command-safety controls are designed.
- Turning false-positive logging into a broad exception system.
- Requiring every project to produce false-positive records.

## MVP Recommendation

Keep this as a calibration release: fix wording, add a false-positive record path, update checkers and docs, and stop before automatic project scanning.

## Non-goals

- No new automatic target scanner.
- No target project writes.
- No patch implementation.

## Domain Model Draft

- `Patch Classification False Positive`: a reviewed calibration record for a conservative keyword trigger.
- `Recommended Risk / Capability Pack`: a risk overlay or industrial pack, separate from platform profiles.
- `Recorded Report Check`: checker behavior that validates existing artifacts without generating new target-project reports.

## Permission / Security Risks

- False-positive records could be abused to bypass high-risk patch checks.
- Usage docs could be misread as permission to scan or write real target projects.
- Private project details must remain out of public calibration records.

## First Vertical Slice

```text
review finding
-> calibration task
-> false-positive template and source record
-> checker rejects unsafe false-positive acceptance
-> docs clarify recorded-report behavior
```

## Suggested Specs

- `specs/181-real-adoption-calibration.md`

## Suggested Task Level

L1

## Decision

READY_FOR_SPEC

## Rationale

The review findings are concrete and bounded. They can be handled as a calibration release without changing the core 1.8 adoption model.
