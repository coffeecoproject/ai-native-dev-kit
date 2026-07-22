# Review Surface Card: IntentOS 1.114 Work Queue State Transition Governance

## Human Decision Summary

Conclusion: review the exact append-only handoff contract, immutable snapshot
binding, single-current-task projection, distribution parity, and fail-closed
tamper behavior before any completion claim.

## Plain Summary

This review checks that old published task records stay untouched, the new
handoff record is exact and tamper-evident, and every consumer selects the same
single current task.

## Project Reading

| Field | Value |
| --- | --- |
| Project state | `INTENTOS_REPOSITORY` |
| Risk level | `high` |
| Can write files now | `No` |
| Candidate | Isolated staged governance slice |

## Selected Review Surfaces

| Surface | Required review |
| --- | --- |
| `FUNCTIONAL_REVIEW` | One validated predecessor becomes derived DONE and one exact successor becomes CURRENT. |
| `CODE_REVIEW` | Shared loader, resolver, checker, Work Queue consumer, and takeover consumer agree. |
| `DATA_REVIEW` | Source refs, source digests, intent digests, sequence, decision ref, and transition digest are exact. |
| `VERIFICATION_REVIEW` | Stale snapshots, self-links, forks, duplicate/non-positive sequences, and mismatched intents fail closed. |
| `DOCUMENTATION_REVIEW` | Manifest, CLI, schema trust digest, template, checklist, and package script remain aligned. |
| `DEBT_REVIEW` | Independent drafts and the frozen check-intentos refactor remain excluded. |

## Review Surface Checklist

| Surface | Before execution | After execution | Missing evidence action |
| --- | --- | --- | --- |
| `FUNCTIONAL_REVIEW` | Bind predecessor and successor. | Confirm one effective CURRENT item. | Block completion. |
| `CODE_REVIEW` | Identify shared authority. | Check all consumers use it. | Remove parallel logic. |
| `DATA_REVIEW` | Bind exact refs and digests. | Reject stale or altered inputs. | Regenerate evidence. |
| `VERIFICATION_REVIEW` | Define positive and tamper cases. | Run focused and repository checks. | Keep task open. |
| `DOCUMENTATION_REVIEW` | List distributed assets. | Confirm Manifest parity. | Repair distribution. |
| `DEBT_REVIEW` | Exclude unrelated refactors. | Confirm no scope mixing. | Split the candidate. |

## Questions For Human

None. The user already authorized this bounded governance work; no production
or external decision is requested.

## Post-Execution Review Contract

- Per-surface result: record pass, fail, or unverified for every selected surface.
- Unverified surfaces: keep completion blocked and state the missing evidence.
- Debt result: confirm whether related debt is fixed, deferred, or blocking.
- Next delivery state: state whether the candidate is ready for final local closure or remains blocked.

## Machine-Readable Evidence

```json
{
  "schema_version": "1.113.0",
  "artifact_type": "review_surface_card",
  "task_ref": "task:8dced81757c1775f86637f335ba7e3dd931646e51101dd75018424c210380739",
  "intent_digest": "sha256:a2328ace8561197fad207355fc58f05fb7e4df9cb744c8f44c2bcdc0cbd7b121",
  "reviewed_surfaces": [
    "scope",
    "functional_behavior",
    "source_identity",
    "lifecycle",
    "failure_and_tamper",
    "consumer_consistency",
    "distribution"
  ],
  "outcome": "READY"
}
```

## Boundaries

- This card writes target files: No
- This card modifies CI: No
- This card installs hooks: No
- This card deletes or archives documents: No
- This card changes task state: No
- This card approves implementation: No
- This card approves release or production: No
- This card approves security/privacy/compliance/payment/migration decisions: No

## Outcome

`REVIEW_SURFACE_RECORDED`
