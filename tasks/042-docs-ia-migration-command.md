---
schema_version: 1.0
artifact_type: task
number: 042
slug: docs-ia-migration-command
title: "docs ia migration command"
status: ready
created_at: 2026-06-27
devkit_version: 0.41.0
spec: specs/042-docs-ia-migration-command.md
eval: evals/042-docs-ia-migration-command.md
task_level: L3
---
# Task 042: docs ia migration command

## Task Level

L3

## Related Spec

`specs/042-docs-ia-migration-command.md`

## Related Eval

`evals/042-docs-ia-migration-command.md`

## Goal

Implement 0.42.0 Docs IA + Migration Command with a short README, complete reference docs, and a
non-mutating migration plan CLI.

## Scope

Allowed:

- Add roadmap target docs under `docs/`.
- Slim README and README.zh-CN while preserving complete reference links.
- Add `scripts/migrate-project.mjs` and wire `scripts/cli.mjs migrate`.
- Add dev-kit self-check coverage for migration safety.
- Update manifest, VERSION, package version, workflow version templates, release evidence, and
  workflow artifacts.

Not allowed:

- Applying migration changes.
- Mutating target project files from migrate.
- Adding dependencies.
- Changing license terms.
- Adding new workflow concepts, industrial packs, platform baselines, hooks, or external reviewer
  automation.

## Acceptance Criteria

- README is a 3-minute entry and links to complete references.
- All roadmap target docs exist.
- `node scripts/cli.mjs migrate --target <project> --from 0.33.0 --to 1.0.0 --dry-run` succeeds and writes nothing.
- `node scripts/cli.mjs migrate --target <project> --from 0.33.0 --to 1.0.0 --write-plan <file>` writes a plan JSON only.
- `node scripts/cli.mjs migrate --target <project> --from 0.33.0 --to 1.0.0` fails.
- Self-check and workflow checks pass.

## Commands

Run:

```bash
node --check scripts/cli.mjs
node --check scripts/migrate-project.mjs
node scripts/cli.mjs migrate --target . --from 0.33.0 --to 1.0.0 --dry-run
node scripts/cli.mjs migrate --target . --from 0.33.0 --to 1.0.0 --write-plan /tmp/ai-native-migration-plan.json
node scripts/cli.mjs migrate --target . --from 0.33.0 --to 1.0.0
node scripts/check-manifest.mjs .
node scripts/check-workflow-artifacts.mjs . --mode implementation --task tasks/042-docs-ia-migration-command.md
node scripts/check-review-loop.mjs . --task tasks/042-docs-ia-migration-command.md
node scripts/check-goal-mode.mjs .
node scripts/check-subagent-orchestration.mjs .
node scripts/check-next-step-boundary.mjs . --task tasks/042-docs-ia-migration-command.md
node scripts/check-dev-kit.mjs
git diff --check
```

## AI Budget

Max agent runs: 1
Max repair runs: 2
Use high reasoning model: Yes
Stop if: migrate needs to write target project files or apply changes.

## Risk Gate

This task touches:

- [ ] auth
- [ ] permission
- [x] migration
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
| production | Docs mention production project playbook only; no production config is changed. | Yes |
| release | Dev-kit phase report and docs only; no deploy or rollback behavior changed. | Yes |

## Human Approval

Required: Yes
Status: Approved
Approval scope: Implement plan-only migration command and docs IA; migration apply and target-project mutation remain forbidden.
Approved by: user
Approved at: 2026-06-27
Approval notes: User asked to continue after 0.41.0; assistant stated 0.42 scope and user confirmed.

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

- implement migrate apply
- mutate target project files from migrate
- add features outside docs IA and migration plan
- add dependencies
- change architecture beyond CLI route and script
- change permissions
- change data model or migration
- change production config
- change release or rollback behavior
- change payment, value-transfer, or regulated behavior
- implement task non-goals

## Stop Conditions

Stop and report if:

- required spec/eval is missing or contradictory
- migrate requires target-project writes
- migration apply becomes necessary
- same test fails twice
- production data/config/secrets are needed
- high-risk decision is required outside approved scope

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
