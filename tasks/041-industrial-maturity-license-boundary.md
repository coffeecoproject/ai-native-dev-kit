---
schema_version: 1.0
artifact_type: task
number: 041
slug: industrial-maturity-license-boundary
title: "industrial maturity license boundary"
status: ready
created_at: 2026-06-27
devkit_version: 0.40.1
spec: specs/041-industrial-maturity-license-boundary.md
eval: evals/041-industrial-maturity-license-boundary.md
task_level: L3
---
# Task 041: industrial maturity license boundary

## Task Level

L3

## Related Spec

`specs/041-industrial-maturity-license-boundary.md`

## Related Eval

`evals/041-industrial-maturity-license-boundary.md`

## Goal

Implement the 0.41.0 industrial pack maturity and license boundary hardening slice without
changing runtime project behavior or broadening commercial rights.

## Scope

Allowed:

- Add maturity model documentation and pack maturity evidence docs.
- Extend industrial pack schema, index, and concrete pack manifests with maturity metadata.
- Update `check-industrial-pack.mjs` and related self-check expectations.
- Add conservative license boundary docs subordinate to `LICENSE.md`.
- Update README, VERSION, manifest, roadmap, release report, workflow artifacts, and review evidence.

Not allowed:

- Changing `LICENSE.md`.
- Claiming legal advice or granting commercial rights.
- Promoting draft packs to candidate or stable without real evidence.
- Adding dependencies, platform baselines, external GPT/API automation, hooks, migrations, or runtime
  application behavior.
- Installing concrete industrial packs by default in generated projects.

## Acceptance Criteria

- `industrial-packs/README.md` or related docs define `draft`, `candidate`, `stable`,
  `deprecated`, and `retired`.
- Every concrete industrial pack has maturity metadata and required docs.
- Checker fails for missing maturity metadata/docs and for stable claims on draft packs.
- License FAQ/commercial/notice files are present, conservative, and subordinate to `LICENSE.md`.
- Manifest, version, release, and README updates include 0.41.0.
- Verification commands pass and are recorded in review/final reports.

## Commands

Run:

```bash
node --check scripts/check-industrial-pack.mjs
node scripts/check-industrial-pack.mjs . --json
node scripts/check-manifest.mjs .
node scripts/check-workflow-artifacts.mjs . --mode implementation --task tasks/041-industrial-maturity-license-boundary.md
node scripts/check-goal-mode.mjs .
node scripts/check-subagent-orchestration.mjs .
node scripts/check-review-loop.mjs .
node scripts/check-dev-kit.mjs
git diff --check
```

## AI Budget

Max agent runs: 1
Max repair runs: 1
Use high reasoning model: Yes
Stop if: acceptance criteria, scope, or risk boundary becomes unclear.

## Risk Gate

This task touches:

- [ ] auth
- [ ] permission
- [ ] migration
- [ ] regulated operation
- [ ] irreversible operation
- [ ] value transfer
- [ ] safety-critical behavior
- [ ] data deletion
- [ ] production config
- [ ] secrets
- [ ] personal data
- [ ] regulated data
- [ ] external side effect
- [ ] privileged operation
- [ ] app signing / platform release
- [ ] cloud function / access rule
- [ ] form interaction
- [ ] api failure
- [ ] accessibility
- [ ] performance
- [ ] dependency change

If any item is checked, implementation requires explicit human approval before code changes.

## Risk Gate Exclusions

Use only when a high-risk term appears in the task/spec text but is explicitly out of scope.
If more than three exclusions are accepted, implementation requires Human Approval scope to explicitly cover Risk Gate Exclusions.

| Mentioned term | Not checked because | Human accepted |
|---|---|---|
| permission | Only license permission wording and docs are touched; no application permission model changes. | Yes |
| production config | The word production can appear only in claim-prevention language; no production config is touched. | Yes |
| release | Only dev-kit phase documentation is updated; no app signing, deployment, rollback, or platform release path is touched. | Yes |

## Human Approval

Required: No
Status: Not Required
Approval scope: Not Required
Approved by:
Approved at:
Approval notes:

## Authorized Next Actions

Codex may do after implementation:

- run verification required by this task
- fix current-task lint, typecheck, or test failures
- fix AUTO_FIX findings inside approved current task scope
- update review-loop-report when review is required
- write ai-task-log or final-report evidence for this task
- create follow-up-proposal for bounded suggestions

Codex must not do without a new request, task, or human decision:

Codex must not implement next-step suggestions unless they are `IN_SCOPE_NEXT_STEP` and inside this task scope.

- implement follow-up suggestions
- add features
- add dependencies
- change architecture
- change permissions
- change data model or migration
- change production config
- change release or rollback behavior
- change payment, value-transfer, or regulated behavior
- implement task non-goals

## Stop Conditions

Stop and report if:

- required spec/eval is missing or contradictory
- scope requires forbidden files
- same test fails twice
- production data/config/secrets are needed
- high-risk decision is required

## Final Report Required

- Completed
- Verified
- Not Changed
- Risks Remaining
- Next-Step Suggestions
- Human Decisions Needed
- Next Safe Action

Next-Step Suggestions must use:

| ID | Type | Suggestion | Relation to current task | Can AI do now? | Required entry | Risk / approval |
|---|---|---|---|---|---|---|
| N1 | IN_SCOPE_NEXT_STEP / DIRECT_FOLLOW_UP / RISK_DECISION / OUT_OF_SCOPE_OBSERVATION / DO_NOT_PROCEED |  |  | Yes / No | current task / new request / follow-up proposal / human decision / do not proceed |  |
