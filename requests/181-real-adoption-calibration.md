---
schema_version: 1.0
artifact_type: request
number: 181
slug: real-adoption-calibration
title: Real Adoption Calibration
priority: P1
task_level: L1
status: done
created_at: 2026-06-27
---
# Request: 181-real-adoption-calibration

## Raw Request

Apply the 1.8 review findings without adding a new large governance layer.

## User / Customer

IntentOS users applying 1.8 to real existing projects.

## Problem

The 1.8 review found three calibration needs: profile vs risk-pack wording can be confused, conservative patch risk keywords need a false-positive log, and docs should clearly say real-adoption checks recorded reports rather than auto-generating target-project reports.

## Desired Outcome

Add a bounded 1.8.1 calibration:

- split recommended profiles from risk/capability packs in governance maps
- add patch classification false-positive records
- clarify real-adoption usage and command boundaries

## Constraints

- Do not add an automatic real-project scanning runner.
- Do not weaken patch classification high-risk defaults.
- Do not authorize implementation through false-positive records.
- Do not write to target projects.

## Priority

P1

## Suggested Task Level

L1
