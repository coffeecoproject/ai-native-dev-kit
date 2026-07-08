# Runtime Hygiene Examples

These examples show how IntentOS classifies Git, push, CI, artifact, bundle, and
release-runtime blockers without approving commit, push, release, production,
artifact deletion, gate bypass, or force push.

## Examples

- `git-old-branch-rebase-plan`: stale branch or mixed history stays blocked
  until the current task is isolated.
- `pre-push-structure-gate`: local gate failure keeps the task open and routes
  repair through the project gate.
- `ci-environment-retry`: provider or runner failure can be retried only when
  retry is safe and no production side effect exists.
- `release-artifact-quota-preflight`: artifact quota cleanup requires release
  owner approval because deletion is irreversible.
- `release-bundle-evidence-bloat`: runtime bundle slimming must preserve
  evidence outside the bundle.

## Boundaries

Runtime Hygiene is a classifier and review surface only. It does not authorize
implementation, completion, commit, push, release, production, artifact
deletion, gate bypass, force push, or evidence removal.
