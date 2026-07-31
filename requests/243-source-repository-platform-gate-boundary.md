---
schema_version: 1.0
artifact_type: request
number: 243
slug: source-repository-platform-gate-boundary
title: "source repository platform gate boundary"
status: draft
created_at: 2026-07-31
intentos_version: 1.113.0
priority: P1
task_level: L2
---
# Request: 243-source-repository-platform-gate-boundary

## Raw Request

原始需求：

Repair the workflow-artifact implementation gate so an authoritative IntentOS
source checkout is not treated as a target Web App merely because examples and
fixtures contain web signals.

## User / Customer

IntentOS maintainers running governed source changes.

## Problem

Every L2 source task fails `check-workflow-artifacts --mode implementation`
with `PROJECT_INSPECTION_INCOMPLETE`: source examples exhaust the scan limit and
create a false `web-app` inference. Platform baselines apply to adopted target
applications, not the authoritative IntentOS distribution repository itself.

## Current Workflow

The operator receives an unavoidable platform-baseline failure before the
checker change that would repair or verify source workflow behavior.

## Desired Outcome

Skip only the platform-application baseline implementation gate for a strictly
recognized authoritative IntentOS source checkout; preserve the gate for every
installed or ordinary target project.

## Constraints

- Recognition must require the authoritative source manifest and package identity.
- Industrial/task/eval/review gates remain unchanged.
- No target, dependency, CI, hook, or release changes.

## Priority

P1

## Suggested Task Level

L1

## Deadline

Prerequisite to Task 242; no external deadline.

## Notes

Observed source evidence: 5,000-entry truncation, false `web-app` inference,
missing target-style `docs/project-profile.md`.
