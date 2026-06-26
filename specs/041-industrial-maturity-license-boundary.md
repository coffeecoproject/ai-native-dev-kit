---
schema_version: 1.0
artifact_type: spec
number: 041
slug: industrial-maturity-license-boundary
title: "industrial maturity license boundary"
status: ready
created_at: 2026-06-27
devkit_version: 0.40.1
request: requests/041-industrial-maturity-license-boundary.md
preflight: preflight/041-industrial-maturity-license-boundary.md
---
# Spec 041: industrial maturity license boundary

## Status

Ready

## Source

- Request: `requests/041-industrial-maturity-license-boundary.md`
- Preflight: `preflight/041-industrial-maturity-license-boundary.md`

## Problem

Industrial packs need a maturity model that separates availability from validation quality. The
current `status` field is too coarse and can be mistaken for production readiness. The repository
also needs plain-language license boundary files so users understand that commercial consulting,
customer delivery, resale, paid redistribution, and copying assets into paid customer projects need
prior written permission under the current policy.

## User Story

As a dev kit user, I want each industrial pack to state its maturity, evidence, owner, promotion
criteria, dogfood status, false-positive history, and changelog so that I can decide whether it is
safe to apply to a project.

As a maintainer, I want license boundary docs that stay subordinate to `LICENSE.md` so that public
usage expectations are clearer without accidentally granting commercial rights.

## Scope

Included:

- Add a shared industrial pack maturity model.
- Extend pack schema and concrete pack manifests with maturity metadata.
- Add required maturity evidence docs for concrete industrial packs.
- Add conservative `LICENSE-FAQ.md`, `LICENSE-COMMERCIAL.md`, and `NOTICE.md`.
- Update industrial pack docs, README, version, roadmap, release evidence, manifest, and checks.
- Ensure checker behavior catches missing maturity docs and draft/stable overclaims.

## Non-goals

- Do not provide legal advice.
- Do not modify `LICENSE.md`.
- Do not promote any industrial pack beyond evidence.
- Do not install all concrete industrial packs by default.
- Do not add external reviewer API, hook automation, or new platform baselines.

## Data Model Impact

New or changed entities:

- `pack.json.maturity`: object describing stage, stage reason, evidence docs, promotion criteria,
  demotion triggers, last maturity review, reviewer, and known limitations.
- `industrial-packs/index.json.packs[].maturityStage`: quick registry-level maturity signal.
- Pack maturity docs: `maturity.md`, `evidence.md`, `dogfood.md`, `false-positive-log.md`,
  `owner.md`, and `changelog.md`.

## API / Interface Contract

### Industrial Pack Manifest

Input:

```json
{
  "maturity": {
    "stage": "draft",
    "stageReason": "Draft pack; requires project dogfood before stable use.",
    "evidenceDocs": [
      "maturity.md",
      "evidence.md",
      "dogfood.md",
      "false-positive-log.md",
      "owner.md",
      "changelog.md"
    ]
  }
}
```

Output:

```json
{
  "valid": true,
  "stage": "draft",
  "requiredDocsPresent": true
}
```

Errors:

- Missing maturity metadata.
- Unknown maturity stage.
- Stable pack without required evidence and promotion criteria.
- Draft pack wording that claims production-ready/stable status.

## UI States

- Not applicable. This is repository workflow and CLI/checker work.

## Permission Rules

- No application permission model changes.
- Commercial usage permission is not granted by documentation; it remains governed by `LICENSE.md`
  and prior written permission.

## Observability

- Logs: checker output and review loop report.
- Metrics: number of concrete packs checked and maturity docs validated.
- Audit events: workflow artifacts, decision brief, release phase report.

## Acceptance Criteria

- Maturity stages are documented as `draft`, `candidate`, `stable`, `deprecated`, and `retired`.
- Every concrete industrial pack has maturity metadata and the six required maturity docs.
- Draft packs cannot be described as stable or production-ready by strict checks.
- `BL2_INDUSTRIAL` docs do not imply production readiness.
- License FAQ distinguishes personal, educational, internal evaluation, commercial product delivery,
  commercial consulting/service delivery, resale/paid redistribution, and copying generated assets
  into customer projects.
- License boundary docs state they are not legal advice and do not override `LICENSE.md`.
- Manifest, version, README, release report, and self-checks include the new assets.

## Test Plan

- Unit: `node --check` for changed scripts.
- Integration: `node scripts/check-industrial-pack.mjs . --json`.
- Integration: `node scripts/check-manifest.mjs .`.
- Integration: `node scripts/check-dev-kit.mjs`.
- Workflow: `node scripts/check-workflow-artifacts.mjs . --mode implementation --task tasks/041-industrial-maturity-license-boundary.md`.
- Review: `node scripts/check-review-loop.mjs .`.
- Manual: inspect license docs against `LICENSE.md` wording.

## Rollback Notes

Revert schema, pack manifest, maturity docs, license docs, checker changes, manifest entries, and
version/release docs in one commit if the wording or checker rules prove too broad.

## Open Questions

- Qualified legal review or explicit owner risk acceptance is still required before 1.0 release
  materials claim license boundary readiness.
