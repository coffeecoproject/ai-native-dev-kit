---
schema_version: 1.0
artifact_type: eval
number: 250
slug: current-project-identity-reconciliation
title: "current project identity reconciliation"
status: ready
created_at: 2026-08-02
intentos_version: 1.113.0
spec: specs/250-current-project-identity-reconciliation.md
---
# Eval 250: Current Project Identity Reconciliation

## Related Spec

`specs/250-current-project-identity-reconciliation.md`

## Must Pass

- [x] relevant syntax checks pass
- [x] focused identity and dirty-worktree tests pass
- [x] generated-project distribution remains compatible
- [x] no unrelated path or dependency is changed
- [x] project-information and missing-task status omit the User Delivery
  Console while identified current-task status retains it
- [x] the prior 180-second source identity case passes in about 21 seconds and
  leaves no associated process behind
- [x] the independently governed runtime-interruption readiness repair passes
  its exact regression and the complete 22-test lifecycle module
- [x] final source self-check passes
- [x] Pawcode final before/after snapshot remains identical

Final verification completed with `scripts/check-intentos.mjs` exiting 0 and
printing `IntentOS self-check passed.` The exact candidate then resolved
Pawcode read-only to `NEEDS_CURRENT_WORK_REVIEW`; HEAD, project fingerprint,
project revision, 240-entry status digest/count, and index digest were
identical before and after.

## Spec Alignment

- [x] implementation matches the current-content reconciliation contract
- [x] historical origin remains unchanged
- [x] non-goals and no-write boundary are preserved
- [x] UI is not applicable beyond existing CLI presentation
- [x] public identity exposes no project path

## Permission / Data Checks

- [x] no permission behavior changes
- [x] no application or user data is read beyond the existing bounded inventory
- [x] public output exposes counts/state/digest rather than project paths
- [x] Pawcode validation is read-only and snapshot-bound

## Manual Review Checklist

- Confirm the managed/workflow exclusion uses the installed Manifest first and
  the authoritative source Manifest for source-only operation.
- Confirm a project with installed version metadata but neither a readable
  installed nor authoritative source Manifest fails to `NOT_OBSERVED` rather
  than inventing project content.
- Confirm creating workflow evidence does not change the project-content or
  Project Fact digest, while genuine project content does.
- Confirm current identity and historical origin are both visible.
- Confirm status source selection follows `PROJECT_INFORMATION` versus
  `CURRENT_TASK` and does not use a source-repository special case.
- Confirm no apply, receipt, ownership, CI, release, or dependency file changed.

## Acceptance Matrix

| Case | Origin | Current evidence | Expected identity |
|---|---|---|---|
| empty target | unknown | no project | `NEW_PROJECT` |
| freshly initialized scaffold | `NEW_PROJECT` | managed assets and workflow records only | `NEW_PROJECT` |
| established initialized project | `NEW_PROJECT` | project-owned source/product content | `EXISTING_PROJECT` |
| dirty established project | `NEW_PROJECT` | project-owned content plus Git changes | `EXISTING_PROJECT`, `DIRTY`, safe stop |
| adopted existing project | `EXISTING_PROJECT` | current installed identity | existing/governed behavior unchanged |
| source-only evidence update | any | authoritative workflow record only | project-content and Project Fact digests unchanged |
| IntentOS source checkout | not applicable | source identity and project-information status | `INTENTOS_SOURCE`, no task delivery source |
| required source failure | any | failed current read | blocked and low confidence |

## Required Checks

```bash
/Users/liushan/.nvm/versions/node/v22.22.3/bin/node --check scripts/lib/project-fact-projection.mjs
/Users/liushan/.nvm/versions/node/v22.22.3/bin/node --check scripts/lib/project-entry-trust.mjs
/Users/liushan/.nvm/versions/node/v22.22.3/bin/node --check scripts/operating-loop/classification.mjs
/Users/liushan/.nvm/versions/node/v22.22.3/bin/node --check scripts/operating-loop/identity.mjs
/Users/liushan/.nvm/versions/node/v22.22.3/bin/node --check scripts/operating-loop/source-orchestration.mjs
/Users/liushan/.nvm/versions/node/v22.22.3/bin/node --test tests/operating-model.test.mjs
/Users/liushan/.nvm/versions/node/v22.22.3/bin/node scripts/check-manifest.mjs
/Users/liushan/.nvm/versions/node/v22.22.3/bin/node scripts/check-intentos.mjs
git diff --check
```

## External Read-Only Check

Run the published/current IntentOS source against Pawcode with
`GIT_OPTIONAL_LOCKS=0`. Compare Pawcode HEAD, content fingerprint, revision,
status digest/count, and index digest before and after. Every value must remain
identical.

## Reject Conditions

Reject if a fresh scaffold becomes an existing project, historical origin is
rewritten, a workflow record alone establishes product content, a dirty project
is allowed to write, project-information status starts task-completion
processing, Pawcode changes, or verification requires an out-of-scope repair.

## Required Evidence

- Command output summary: focused identity, trust, consumer-chain, generated
  distribution, manifest, artifact, boundary, diff, and source self-check.
- Screenshots / traces if UI: Not applicable; no UI change.
- Review notes: exact changed-file boundary and Pawcode before/after immutable
  snapshot comparison.
