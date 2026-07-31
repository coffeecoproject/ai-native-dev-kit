---
schema_version: 1.0
artifact_type: spec
number: 242
slug: native-authority-source-boundary
title: "native authority source boundary"
status: draft
created_at: 2026-07-31
intentos_version: 1.113.0
request: requests/242-native-authority-source-boundary.md
---
# Spec 242: native authority source boundary

## Status

Ready

## Source

- Request: `requests/242-native-authority-source-boundary.md`
- Preflight: `preflight/242-native-authority-source-boundary.md`

## Problem

`resolve-native-migration` scans broad path patterns without separating
IntentOS-distributed/runtime assets and generated workflow records from
project-native governance. Its Markdown extractor also leaves simple baseline
tables and Chinese rules under governance headings unresolved. Reconciliation
therefore blocks on evidence that either is not Pawcode authority or can be
deterministically represented.

## User Story

As an IntentOS operator,
I want source-only adoption to distinguish proven IntentOS artifacts from real
project authority and fully represent the latter,
so that fail-closed adoption blocks only on genuine unresolved project rules.

## Scope

Included:

- Partition native-authority candidates before filename-pattern classification.
- Exclude a distributed file only with verified prior-managed ownership or an
  exact match to an authoritative source-manifest mapping.
- Exclude known workflow record paths only when an installed IntentOS manifest
  exists and the directory is in the authoritative source manifest registry.
- Keep customized/drifted files in project-native scanning.
- Parse simple Markdown table rows under governance context.
- Classify substantive text under governance headings instead of emitting
  unresolved low-signal blocks.
- Keep sentinel-only declarations visible but do not count them as omitted
  project rules.
- Expose the source-boundary decision in human and structured evidence.

## Non-goals

- No target-project writes or controlled apply.
- No changes to business/production authority or replacement decisions.
- No arbitrary Markdown/HTML table parser.
- No CI YAML parser redesign.
- No dependency, hook, CI, release, or schema-version upgrade.

## Data Model Impact

No persisted entity changes. The read-only Native Migration report gains an
optional authority-source boundary projection.

## API / Interface Contract

### Native authority partition

Input:

```json
{
  "projectRoot": "/target/project",
  "sourceRoot": "/authoritative/intentos",
  "relativePaths": ["AGENTS.md", "docs/project-baseline.md"]
}
```

Output:

```json
{
  "nativePaths": ["docs/project-baseline.md"],
  "excluded": [
    {
      "path": "AGENTS.md",
      "classification": "VERIFIED_PRIOR_INTENTOS_MANAGED",
      "evidence": ".intentos/version.json"
    }
  ]
}
```

Errors:

- Unsafe/malformed manifest or digest evidence fails open to project ownership:
  the path remains a native authority candidate.
- Source or target symlinks are not accepted as exact-distribution proof.

## UI States

Not applicable; this task changes read-only CLI evidence only.

## Permission Rules

- Project-owned business and production rules remain protected.
- Path membership alone never proves a mutable file is IntentOS-owned.
- Unknown or drifted sources remain preserved for classification.

## Observability

- Logs: human `Authority Source Boundary` report section.
- Metrics: native/excluded counts and exclusion classifications in structured evidence.
- Audit events: none; execution is read-only.

## Acceptance Criteria

- Proven IntentOS-managed/distributed files are excluded from project-native
  rule extraction with explicit evidence.
- Customized or content-drifted files at the same paths remain scanned.
- Installed IntentOS workflow records are not mined as active native authority.
- Simple project baseline tables are represented row-by-row.
- Substantive project rules under governance headings are classified and
  reconciled; exact empty-value sentinels remain visible without creating an omitted rule.
- Genuine unclosed fences or unparsable governance structures still block.
- Pawcode read-only assurance reports zero omitted rule blocks and retains
  `docs/miniprogram-ui-baseline.md` as project-owned reconciliation evidence.
- Pawcode Git status digest is unchanged.

## Test Plan

- Unit: authority partition proof and drift preservation; table/governance text;
  sentinel coverage.
- Integration: Native Migration -> Reconciliation -> Adoption Assurance fixture.
- E2E: real Pawcode source-run read-only assurance.
- Manual: inspect boundary counts and representative retained/excluded paths.

## Rollback Notes

Revert Task 242 source files. No Pawcode rollback is needed because this task
does not write the target.

## Open Questions

- None.
