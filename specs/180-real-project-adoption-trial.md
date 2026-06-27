---
schema_version: 1.0
artifact_type: spec
number: 180
slug: real-project-adoption-trial
title: Real Project Read-only Adoption Trial
request: requests/180-real-project-adoption-trial.md
preflight: preflight/180-real-project-adoption-trial.md
status: done
created_at: 2026-06-27
---
# Spec 180: Real Project Read-only Adoption Trial

## Status

Done

## Source

- Request: `requests/180-real-project-adoption-trial.md`
- Preflight: `preflight/180-real-project-adoption-trial.md`

## Problem

The dev kit must support existing governed projects without treating them like greenfield projects. It also needs a governance mechanism for patch-like work so Codex does not keep escalating issues through small local fixes when the change is structural or requires human judgment.

## User Story

As a user applying the dev kit to an existing project,
I want Codex to inspect the project, decide whether it can write workflow assets, and classify the scale of any repair,
so that I only need to make meaningful decisions instead of operating the workflow manually.

## Scope

Included:

- Real Project Read-only Adoption Trial protocol.
- Patch Classification Governance protocol.
- templates, prompts, and checklists for both.
- `real-adoption-trials/`, `governance-maps/`, and `patch-classifications/` artifact directories.
- checkers for real adoption trials and patch classifications.
- sanitized source evidence and sanitized example evidence.
- bad fixtures for overclaim, target writes, public naming, unsafe local patching, unauthorized implementation, and completed do-not-patch.
- CLI, CI, manifest, README, reference docs, platform adapters, and self-check integration.
- baseline-project equivalent baseline detection for existing projects with non-canonical baseline paths.

## Non-goals

- Writing to the inspected real project.
- Publishing private target identifiers.
- Approving release, security, privacy, compliance, migration, payment, or production configuration.
- Replacing existing target governance.
- Making patch classification an implementation approval.

## Data Model Impact

New workflow artifact types:

- Real Adoption Trial Report.
- Existing Governance Map.
- Patch Classification Report.

No runtime product data model changes.

## API / Interface Contract

### check-real-adoption-trial

Input:

```json
{
  "target": "project root",
  "flags": ["--json"]
}
```

Output:

```json
{
  "status": "PASS or FAIL",
  "checks": []
}
```

Errors:

- missing required source assets
- missing adoption trial sections
- target project writes recorded in read-only mode
- forbidden overclaim
- private project identity without public approval
- unclosed subagent status

### check-patch-classification

Input:

```json
{
  "target": "project root",
  "flags": ["--json"]
}
```

Output:

```json
{
  "status": "PASS or FAIL",
  "checks": []
}
```

Errors:

- missing required source assets
- unsafe `SAFE_LOCAL_FIX`
- implementation authorization claim
- completed `DO_NOT_PATCH`
- missing evidence, verification, or human decision routing

## UI States

Not applicable.

## Permission Rules

- Checkers are read-only.
- Real adoption trial reports must record target write status.
- `READ_ONLY` adoption mode cannot include target writes.
- Patch classification cannot authorize implementation.
- High-risk surfaces must not be classified as safe local fixes.

## Observability

- Logs: checker command output.
- Metrics: good and bad fixture pass/fail coverage.
- Audit events: review loop report, release record, known limitations, and self-check report.

## Acceptance Criteria

- 1.8 source evidence passes both new checkers.
- Sanitized example passes both new checkers.
- Bad fixtures fail with expected reasons.
- README and usage docs explain the user-facing behavior in non-specialist language.
- Existing governed projects are routed to mapping/adapter decisions instead of direct initialization.
- Equivalent baseline files can be detected when canonical dev-kit baseline names are not present.
- Full dev-kit self-check passes.

## Test Plan

- Syntax: `node --check` on new and changed scripts.
- Targeted: `node scripts/check-real-adoption-trial.mjs .`
- Targeted: `node scripts/check-patch-classification.mjs .`
- Example: run both checkers against `examples/1.8-real-project-readonly`.
- Fixtures: `node scripts/check-fixtures.mjs`.
- Governance: manifest, product baseline, claim control, context governance, workflow artifacts, review loop, next-step boundary, and full self-check.

## Rollback Notes

Revert 1.8 files, manifest entries, CLI commands, CI checks, and version records if the layer proves too broad or confusing.

## Open Questions

- Which governed projects should be used for future private trials after this sanitized first trial?
- Whether a docs-only bridge should later be generated automatically after human approval.
