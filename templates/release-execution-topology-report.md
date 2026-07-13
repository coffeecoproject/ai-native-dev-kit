# Release Execution Topology Report

## Human Summary

| Field | Value |
| --- | --- |
| Current topology | `<plain summary>` |
| Recommendation | `<plain recommendation>` |
| Missing fact or capability | `<plain item/none>` |
| User action now | `<none/business fact/external fact/concrete consent>` |

## Six-Plane Topology

| Plane | Type / Identity | Confidence | Evidence |
| --- | --- | --- | --- |
| Source Control | `<value>` | `<OBSERVED/DECLARED/INFERRED/UNKNOWN>` | `<ref>` |
| Orchestration | `<value>` | `<confidence>` | `<ref>` |
| Execution Backend | `<value>` | `<confidence>` | `<ref>` |
| Package Transport | `<value>` | `<confidence>` | `<ref>` |
| Evidence Store | `<value>` | `<confidence>` | `<ref>` |
| Production Target | `<value>` | `<confidence>` | `<ref>` |

## Mandatory Capabilities

| Capability | Required | Satisfied | Evidence |
| --- | --- | --- | --- |
| `<capability>` | `<Yes/No>` | `<Yes/No/Unknown>` | `<ref>` |

## Conflicts And Alternatives

- `<conflict or none>`

## Source Chain

| Plane | Ref | Digest | Confidence |
| --- | --- | --- | --- |
| `<plane>` | `<project-relative ref>` | `sha256:<64 hex>` | `<confidence>` |

## Boundaries

- This report writes project files: No
- This report approves implementation: No
- This report approves release or production: No
- This report executes release or cutover: No
- This report moves secrets or provider state: No
- This report treats embedded consent as authority: No

## Machine-Readable Evidence

```json
{
  "schema_version": "1.105.0",
  "artifact_type": "release_execution_topology"
}
```

## Outcome

`<RELEASE_TOPOLOGY_RECORDED/RELEASE_TOPOLOGY_BLOCKED>`
