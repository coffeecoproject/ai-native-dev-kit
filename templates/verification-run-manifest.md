# Verification Run Manifest

## Human Summary

Explain whether this run proves the runtime identity and isolation required by
its Verification Runtime Plan.

## Run Binding

- Run ID:
- Task ref:
- Intent digest:
- Runtime plan ref:
- Runtime plan digest:
- Adapter contract digest:
- Runtime trust level:

## Source Identity

- Project kind:
- Project fingerprint:
- Source revision:

## Run Window

- Started at:
- Finished at:
- Run state:

## Environment Preflight

| Probe | Result | Evidence Ref | Evidence Digest | Reason |
|---|---|---|---|---|
| `SOURCE_IDENTITY` | `BLOCKED` | `not provided` | `not provided` | Not observed. |

## Service Instances

| ID | Adapter | Identity Status | Started At | Owned By Run | Evidence Ref | Evidence Digest |
|---|---|---|---|---|---|---|
| `none` | `COMMAND_ONLY` | `NOT_REQUIRED` | `N/A` | `No` | `not required` | `not required` |

## Data And Session Isolation

Record only redacted fingerprints and namespace digests. Never record passwords,
tokens, cookies, or full connection URLs.

## Resource Ownership Ledger

| Resource ID | Type | Created By Run | Owner Marker Digest | Cleanup State | Evidence Ref | Evidence Digest |
|---|---|---|---|---|---|---|
| `none` | `OTHER` | `No` | `not required` | `NOT_REQUIRED` | `not required` | `not required` |

## Verification Executions

| ID | Result | Command Digest | Output Ref | Output Digest | Positive Path | Negative Path |
|---|---|---|---|---|---|---|
| `none` | `NOT_RUN` | `not provided` | `not provided` | `not provided` | `No` | `No` |

## Cleanup Proof

- Cleanup state:
- Owned resources remaining:
- Unrelated resources touched: No
- Before evidence ref:
- After evidence ref:

## Boundaries

- This manifest stores raw secrets: No
- This manifest authorizes broad cleanup: No
- This manifest changes production: No
- This manifest approves implementation, release, or production: No
- This manifest proves product or business correctness: No

## Evidence Authority

The machine-readable record binds current project, task, intent, runtime plan,
and file-backed evidence. It is not execution or release authority.

## Machine-Readable Evidence

```json
{}
```

## Outcome

`RUNTIME_TRUST_BLOCKED`

## Next Step

Create a run through a supported adapter and record observed evidence.
