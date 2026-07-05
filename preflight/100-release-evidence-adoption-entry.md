---
schema_version: 1.0
artifact_type: preflight
number: 100
slug: release-evidence-adoption-entry
title: "release evidence adoption entry"
status: ready
created_at: 2026-06-27
intentos_version: 0.42.0
request: requests/100-release-evidence-adoption-entry.md
task_level: L3
---
# Preflight: 100-release-evidence-adoption-entry

## Source Request

`requests/100-release-evidence-adoption-entry.md`

## Clarity

READY

## Problem Summary

The IntentOS has completed productization phases through 0.42.0, but 1.0 needs durable release
evidence, adoption entry criteria, and explicit limitation wording before the version can honestly
move to 1.0.0.

## Missing Information

- No real project adoption report has been produced yet.
- No industrial pack has real evidence required for promotion to candidate.
- No package publishing decision is included in this task.

## Assumptions

- 1.0.0 can be a minimum productization release if it explicitly says 10/10 evidence is not achieved.
- Existing license boundary docs remain explanatory and are not changed.
- `intentos migrate` remains plan-only.
- All concrete industrial packs remain draft.

## Direction Risks

- Version bump could be misread as complete real-world production validation.
- Release evidence could hide the missing real adoption reports.
- Self-check could pass without checking release evidence.

## Over-design Risks

- Starting real project adoption inside the release evidence task.
- Adding migration apply to make the migration matrix look complete.
- Creating new governance concepts instead of recording evidence.

## MVP Recommendation

Complete the full 1.0 evidence slice: release record, self-check report, generated-project smoke,
update smoke, migration matrix, known limitations, adoption evidence, support templates, version
metadata, manifest, and self-check release-evidence gate.

## Non-goals

- No package publishing.
- No migration apply.
- No industrial pack promotion.
- No external reviewer or hook automation.
- No license term change.
- No production config change.

## Domain Model Draft

- Release Record: states 1.0 boundary and entry criteria.
- Self-Check Report: records final verification commands.
- Generated-Project Smoke: records init and core workflow checks.
- Update Smoke: records update dry-run safety.
- Migration Matrix: records supported migration range and impacts.
- Known Limitations: records what 1.0 does not prove.
- Adoption Evidence: distinguishes simulated dogfood from real adoption evidence.

## Permission / Security Risks

- No secrets, production config, deployment, regulated data, or target-project writes are needed.
- Migration and production appear in docs only; no runtime migration apply or production config change is made.

## First Vertical Slice

```text
release evidence files exist
-> self-check validates the evidence
-> generated-project/update/migration smokes are recorded
-> final report states 1.0 minimum release boundary
```

## Suggested Specs

- `specs/100-release-evidence-adoption-entry.md`

## Suggested Task Level

L3

## Decision

READY_FOR_SPEC

## Rationale

This is a release-boundary task with a clear human-approved constraint: 1.0 minimum release is
allowed only if 10/10 real-project evidence is not claimed.
