# Verification Runtime Lifecycle

Version 1.103 adds the local execution layer between a trusted Runtime Plan and a Verification Run Manifest.

## Plain-Language Behavior

The user can continue saying: “把这个功能完整做好并验证。” IntentOS decides how to verify it. The user is not asked to choose a port, database, process manager, test command, or cleanup method.

Codex first records exact local actions in `.intentos/verification-runtime-lifecycle.json`. IntentOS then creates a lifecycle plan. A separate runner executes only those actions, records what actually happened, and cleans only resources owned by that run.

## Advanced Commands

```bash
node scripts/resolve-verification-runtime-lifecycle.mjs . \
  --runtime-plan-ref artifact:verification-runtime-plans/current.md \
  --out verification-runtime-lifecycle-plans/current.md

node scripts/check-verification-runtime-lifecycle.mjs . \
  --report verification-runtime-lifecycle-plans/current.md \
  --require-ready

node scripts/run-verification-runtime.mjs . \
  --plan artifact:verification-runtime-lifecycle-plans/current.md \
  --out verification-run-manifests/current.md

node scripts/check-verification-run-manifest.mjs . \
  --report verification-run-manifests/current.md \
  --require-complete
```

These are advanced/internal commands. The public guided entry should orchestrate them automatically when runtime trust is required.

## Declaration Shape

The project-owned declaration contains only exact, non-shell local actions and run-relative resources. Environment entries cannot contain credentials or production bindings. `SERVICE` actions use a direct runtime executable and remain alive until verification completes; package-manager wrappers are rejected because they can leave descendants behind. `COMMAND` and `PROBE` actions must exit within their timeout, and dependencies run in deterministic topological order.

## Failure Behavior

An unsafe command, changed Runtime Plan, changed declaration, reused run ID, failed verification, interruption, owner-marker mismatch, or incomplete cleanup blocks the result. Evidence is retained under `.intentos/runtime-runs/<run_id>/`, while owned runtime resources are removed. When current-run evidence must survive a clean checkout or source handoff, Codex uses `--durable-evidence-out evidence/runtime-runs/<run_id>`; the executor copies only the completed run workspace, refuses reuse or symlinks, and makes the Run Manifest bind the durable project-local copy.
