# Completion Evidence Gate

Completion Evidence Gate is the final task-completion evidence gate.

It connects:

1. Business Rule Closure
2. Verification Plan
3. Test Evidence
4. Execution Assurance

Codex may only claim a task is complete when the recorded source artifacts are all present, all ready, and all bound to the same task.

1.78.1 hardens this gate from a ready-state aggregator into a source-chain
binding gate. A ready completion claim must prove:

- Verification Plan is bound to the same Business Rule Closure.
- Test Evidence is bound to the same Verification Plan.
- Execution Assurance is bound to the same Test Evidence.
- Source digests match the referenced artifacts.
- Source intent digests match the current completion intent when the upstream
  artifact exposes one.

1.78.2 makes intent binding explicit across the final source chain:

- Every `source_chain[]` item must carry `intent_digest`.
- Execution Assurance exposes top-level `intent_digest`.
- Completion Evidence checks Execution Assurance intent directly instead of
  relying only on task refs and source-system links.

## What It Prevents

- Backend-only completion when frontend or API surfaces were required.
- Test plans without actual test evidence.
- Test evidence reused from an older task.
- Execution summaries that say done without Business Rule Closure or Test Evidence.
- Patch-style completion claims that bypass the planned evidence chain.
- Same-task but wrong-source-chain completion claims.
- Display-only source digests or intent digests.

## Required Ready States

| Source | Required State |
|---|---|
| Business Rule Closure | `READY_FOR_IMPACT_COVERAGE` |
| Verification Plan | `VERIFICATION_PLAN_READY` |
| Test Evidence | `TEST_EVIDENCE_COMPLETE` |
| Execution Assurance | `VERIFIED_DONE` with `can_claim_done: Yes` |

## Boundary

Completion Evidence Gate is read-only.
It does not approve release or production.

- This report writes target files: No
- This report runs tests: No
- This report fabricates evidence: No
- This report authorizes implementation: No
- This report approves commit or push: No
- This report approves release or production: No
- This report proves product correctness: No
- This report proves real-environment behavior: No
- This report replaces source systems: No

## Rule

No source chain, no completion claim.
