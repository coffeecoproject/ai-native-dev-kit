---
schema_version: 1.0
artifact_type: request
number: 242
slug: native-authority-source-boundary
title: "native authority source boundary"
status: draft
created_at: 2026-07-31
intentos_version: 1.113.0
priority: P1
task_level: L2
---
# Request: 242-native-authority-source-boundary

## Raw Request

原始需求：

Use `codex/source-only-external-adoption-hardening` as the authority and repair
source-only adoption so Pawcode can be assessed without treating installed
IntentOS runtime assets or historical workflow records as Pawcode-native rules.

## User / Customer

IntentOS maintainers and operators adopting an existing, previously bootstrapped
project from an external source checkout.

## Problem

Native Migration scans filename patterns across the target. In Pawcode this
causes exact IntentOS-distributed scripts, release recipes, and generated
workflow records to be mined as project-native governance. At the same time,
real Pawcode baseline tables and Chinese rules remain parser omissions. The
result is a false `CONVERGENCE_BLOCKED_BY_RULE_COVERAGE` decision.

## Current Workflow

The operator runs the read-only source adoption chain and receives 241 omitted
blocks across 93 files, then has no safe path to distinguish distribution
artifacts from current project authority.

## Desired Outcome

The source checkout must prove and exclude its own managed/distributed assets
and generated record directories from native-rule authority, while fully
representing real project governance tables and rule text in reconciliation.

## Constraints

- Pawcode remains read-only during diagnosis and source repair.
- Customized or drifted project files must never be excluded by path alone.
- Business, production, and project baseline rules remain project-owned.
- No dependencies, CI/hooks, release behavior, or target-project files change.

## Priority

P1

## Suggested Task Level

L1

## Deadline

No external deadline; resolve before Pawcode UI design resumes.

## Notes

Real Pawcode evidence: 8,965 classified rules plus 64 unclassified, 154 skipped,
and 23 low-signal blocks before this task. Most unresolved files are IntentOS
records or exact source-distribution matches; `docs/miniprogram-ui-baseline.md`
is the material project-owned exception.
