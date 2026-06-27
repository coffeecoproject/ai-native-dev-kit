---
schema_version: 1.0
artifact_type: preflight
number: 180
slug: real-project-adoption-trial
title: Real Project Read-only Adoption Trial
request: requests/180-real-project-adoption-trial.md
task_level: L2
status: done
created_at: 2026-06-27
---
# Preflight: 180-real-project-adoption-trial

## Source Request

`requests/180-real-project-adoption-trial.md`

## Clarity

READY

## Problem Summary

The dev kit needs to handle real governed projects without defaulting to init, overwrite, or patch-style repair. The result should be a reusable read-only adoption and patch-classification workflow.

## Missing Information

- No permission to write to the inspected real project.
- No approval to disclose target project identity.
- No approval to change target CI, release, baseline, or production gates.
- No human decision yet on which mapped dev-kit capabilities should later be adopted by the target project.

## Assumptions

- A governed production-sensitive Web project is enough to validate the read-only routing pattern.
- Sanitized evidence is acceptable for source-repo release records.
- Patch classification can be added as a decision support layer without authorizing implementation.
- Existing governed projects should prefer adapter mapping over direct initialization.

## Direction Risks

- Accidentally turning read-only assessment into target project writes.
- Publishing private project names, local paths, or internal details.
- Treating missing canonical dev-kit paths as missing governance when the target project has equivalent assets.
- Treating patch classification as permission to implement.

## Over-design Risks

- Adding a new heavy governance layer for every project.
- Requiring all existing projects to copy `.ai-native`.
- Turning one real trial into a universal production validation claim.
- Creating another release gate instead of a bridge-layer decision.

## MVP Recommendation

Implement 1.8 as a bounded workflow upgrade: real adoption trial reports, existing-governance maps, patch classification reports, checkers, examples, bad fixtures, CLI/CI/manifest/self-check integration, and sanitized release evidence.

## Non-goals

- No target project writes.
- No target project release or compliance approval.
- No external GPT/API automation.
- No production validation claim.
- No generic rewrite of existing governed projects.

## Domain Model Draft

- `Real Adoption Trial`: recorded read-only inspection of a real project.
- `Existing Governance Map`: mapping from dev-kit concepts to target project assets.
- `Bridge Layer Decision`: whether to use no-write mapping, docs-only bridge, thin operational bridge, or stop.
- `Patch Classification`: pre-implementation classification of repair scale and risk.
- `Public Evidence Status`: whether evidence is local only, sanitized, or explicitly public approved.

## Permission / Security Risks

- Real project names and paths can be sensitive.
- Baseline, release, and CI assets can imply operational risk if copied or overwritten.
- Patch-style fixes can escalate risk in auth, permission, migration, release, production config, or data model areas.

## First Vertical Slice

```text
read-only real project inspection
-> adoption mode decision
-> existing governance map
-> patch classification
-> review loop
-> sanitized release evidence
```

## Suggested Specs

- `specs/180-real-project-adoption-trial.md`

## Suggested Task Level

L2

## Decision

READY_FOR_SPEC

## Rationale

The problem is clear and has concrete evidence from a read-only governed-project trial. The implementation can stay inside the dev-kit source repository while avoiding target project writes.
