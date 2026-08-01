---
schema_version: 1.0
artifact_type: task
number: 249
slug: node-22-supported-runtime-boundary
title: "node 22 supported runtime boundary"
status: ready
created_at: 2026-08-01
intentos_version: 1.113.0
spec: specs/249-node-22-supported-runtime-boundary.md
eval: evals/249-node-22-supported-runtime-boundary.md
task_level: L2
---
# Task 249: node 22 supported runtime boundary

## Task Level

L2

## Related Spec

`specs/249-node-22-supported-runtime-boundary.md`

## Related Eval

`evals/249-node-22-supported-runtime-boundary.md`

## Goal

Align the declared and enforced IntentOS verification runtime with the Node 22 environment that has complete passing evidence.

## Scope

Allowed:

- `package.json`
- `README.md`
- `README.zh-CN.md`
- `CONTRIBUTING.md`
- `docs/source-only-adoption.md`
- `docs/for-maintainers.md`
- `scripts/self-check/foundation.mjs`
- Task 249 workflow evidence

Not allowed:

- GitHub workflow changes
- Node 23 or checker-DAG repair
- dependencies, source-only adoption behavior, apply/receipt logic
- target-project writes, tag/release, production or other external operations

## Acceptance Criteria

- Runtime support is consistently declared as Node 22.x / `>=22 <23`.
- The self-check enforces the bounded engine range.
- Existing GitHub checks remain on Node 22 without workflow changes.
- Node 22.22.3 targeted checks and full source self-check pass.
- No Task 248 behavior or unrelated path changes.

## Commands

Run:

```bash
/Users/liushan/.nvm/versions/node/v22.22.3/bin/node --check scripts/self-check/foundation.mjs
/Users/liushan/.nvm/versions/node/v22.22.3/bin/node scripts/check-workflow-artifacts.mjs . --mode ready
/Users/liushan/.nvm/versions/node/v22.22.3/bin/node scripts/check-manifest.mjs
/Users/liushan/.nvm/versions/node/v22.22.3/bin/node scripts/check-change-boundary.mjs . --report change-boundary-reports/128-node-22-supported-runtime-boundary.md
/Users/liushan/.nvm/versions/node/v22.22.3/bin/node scripts/check-intentos.mjs
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

If any item is checked, Task Governance must select the stricter technical
planning, review, verification, evidence, and rollback path before code
changes. Ask the user only through a permitted user-input class.

## Risk Gate Exclusions

Use only when a high-risk term appears in the task/spec text but is explicitly out of scope.
If more than three exclusions are proposed, implementation requires stricter
internal review and evidence that explicitly covers every exclusion.

| Mentioned term | Not checked because | Evidence disposition |
|---|---|---|
| Node 23 compatibility | explicitly excluded; this task only stops overclaiming formal support | Accepted |

## Baseline References

Engineering Baseline touched: Yes

Environment Baseline touched: Yes

Baseline refs:

- `docs/engineering-baseline.md`
- `docs/environment-baseline.md`

Baseline decisions introduced: No

This task aligns the public and machine-readable support contract with the existing Node 22 first-party CI and previously completed Node 22 verification evidence.

Baseline rules:

- If this task touches structure, API contracts, DTO/schema/domain boundaries, database schema, migrations, permissions, dependencies, generated types, enum/lookup/state-machine choices, or cross-module state, set Engineering Baseline touched to Yes and cite `docs/engineering-baseline.md`.
- If this task touches build commands, CI/CD, environment variables, deployment, production config, release process, rollback, secrets, logs, monitoring, or alerts, set Environment Baseline touched to Yes and cite `docs/environment-baseline.md`.
- If the relevant baseline is missing or pending, Codex derives and reviews the
  evidence-backed baseline before implementation. Ask only for a permitted
  business/external fact or exact real-world consent.

## Change Boundary

Boundary level: CB2_CHECKED

Allowed paths:

- `package.json`
- `README.md`
- `README.zh-CN.md`
- `CONTRIBUTING.md`
- `docs/source-only-adoption.md`
- `docs/for-maintainers.md`
- `scripts/self-check/foundation.mjs`
- Task 249 evidence files

Forbidden paths:

- `.github/workflows/**`
- adoption/apply/receipt implementation and tests
- dependencies, target projects, releases and production files

Allowed change types:

- bounded runtime compatibility declaration, documentation and self-check assertion

Forbidden change types:

- Node 23 repair, checker refactor, workflow/runtime behavior expansion

Expected diff scale: small

Change-boundary report: `change-boundary-reports/128-node-22-supported-runtime-boundary.md`

## Baseline State

Baseline-state report: Not required

Baseline states used for this task:

- CONFIRMED environment boundary: Node 22 CI configuration plus Task 248 Node 22.22.3 full self-check
- NOT_APPLICABLE application baseline

No-code or evidence-required baseline items must not be treated as confirmed implementation authority.

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

Codex must not do without a new request, task, or the applicable exact
authority:

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
| N1 | IN_SCOPE_NEXT_STEP | Commit and push the verified candidate, then fast-forward the default branch under the user's existing authorization | completes the current task's already-authorized Git closeout without expanding product scope | Yes | current task | verify remote ancestry first; no force push, tag, release, or production action |
