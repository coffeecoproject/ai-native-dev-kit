# Review Surface Card: IntentOS 1.115 `init-project` Modularity

## Human Decision Summary

Review the exact CLI routes, plan/action identity, request-bound authority, mutation order, bootstrap topology, rollback/recovery semantics, receipts, output streams, exit codes, Manifest distribution, and generated-project behavior before completion.

## Plain Summary

This review checks that splitting one large executable changes internal ownership only and does not change any externally observable project initialization or controlled-update behavior.

## Project Reading

| Field | Value |
| --- | --- |
| Project state | `INTENTOS_REPOSITORY` |
| Risk level | `high` |
| Can write files now | `No` |
| Candidate | Local unstaged structural refactor |

## Selected Review Surfaces

| Surface | Required review |
| --- | --- |
| `FUNCTIONAL_REVIEW` | Every public CLI route, message stream, and exit status remains equivalent. |
| `CODE_REVIEW` | Modules have explicit acyclic ownership and the executable remains the only public entry. |
| `DATA_REVIEW` | Plan/action ordering, transaction preconditions, target topology, and rollback ownership remain exact. |
| `VERIFICATION_REVIEW` | Characteristic, transaction, recovery, generated-project, Manifest, Consumer Chain, and unified workflow replay pass. |
| `DOCUMENTATION_REVIEW` | Plan and evidence bind the current task and keep both user drafts excluded. |
| `DEBT_REVIEW` | This slice modularizes init-project only; no unrelated large-file or historical evidence rewrite is included. |

## Review Surface Checklist

| Surface | Before execution | After execution | Missing evidence action |
| --- | --- | --- | --- |
| `FUNCTIONAL_REVIEW` | Bind CLI, plan, receipt, output, and exit contracts. | Replay public-executable positive and failure paths. | Block completion. |
| `CODE_REVIEW` | Define assets, plan, apply, and CLI ownership. | Confirm one-way imports and no catch-all shared state. | Repair the boundary. |
| `DATA_REVIEW` | Bind mutation, journal, rollback, and cleanup order. | Replay interruption, recovery, symlink, and orphan cases. | Keep task open. |
| `VERIFICATION_REVIEW` | Define focused and full project-native commands. | Require exit code 0 and current evidence. | Keep task open. |
| `DOCUMENTATION_REVIEW` | Record scope, lifecycle, provenance, and exceptions. | Compare real diff and preserved drafts. | Restore or exclude unrelated files. |
| `DEBT_REVIEW` | Bound this refactor to init-project. | Record any deferred boundary without broadening this candidate. | Split follow-up work. |

## Questions For Human

None. The user explicitly authorized starting this bounded structural refactor and requires final workflow verification.

## Post-Execution Review Contract

- Per-surface result: record pass, fail, or unverified for every selected surface.
- Unverified surfaces: any changed CLI route, plan or receipt field, mutation order, recovery behavior, output stream, exit status, unexpected file, or module cycle blocks completion.
- Debt result: record each related structural debt item as fixed, deferred, or out of scope.
- Next delivery state: state whether the candidate is ready for user review; do not commit or push without a new instruction.

## Machine-Readable Evidence

```json
{
  "schema_version": "1.113.0",
  "artifact_type": "review_surface_card",
  "task_ref": "task:f82675870e9e2341f98b93432ad6faa433aea028d5228a2634502c9ef202c27e",
  "intent_digest": "sha256:7af7cae362f877411080859f0949df74dce0f47274ca75ef39e33bf2611ec435",
  "reviewed_surfaces": [
    "scope",
    "functional_behavior",
    "source_identity",
    "plan_and_receipt_contract",
    "mutation_and_recovery_order",
    "failure_and_exit_status",
    "distribution",
    "unrelated_edits"
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
- This card approves commit or push: No
- This card approves release or production: No
- This card approves security/privacy/compliance/payment/migration decisions: No

## Outcome

`REVIEW_SURFACE_RECORDED`
