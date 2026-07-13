# Governed Project Read-Only Playbook

Use this playbook when a project already has governance that the IntentOS must not overwrite.

## Goal

Map IntentOS concepts onto existing project rules without writing files first.

## Signals

Use read-only adoption when the project has any of these:

- `AGENTS.md` or `agent.md`
- CI gates
- guard scripts
- baseline docs
- evidence folders
- release or rollback docs
- production tags
- dirty worktree

`workflow-next` may report:

```text
ADOPTION_MODE: READ_ONLY
NEXT_ACTION: RUN_ADOPTION_ASSESSMENT
CAN_WRITE_WORKFLOW_ASSETS: no
```

## Steps

1. Do not run init or update.

2. Create a read-only adoption assessment from:

- `templates/adoption-assessment.md`
- `templates/existing-governance-map.md`

3. Map existing assets:

| Existing project asset | IntentOS concept |
|---|---|
| issue template or product brief | Request |
| technical design doc | Spec |
| test plan | Eval |
| PR checklist | Review Loop |
| architecture decision record | Engineering Baseline |
| release checklist | Release evidence |
| guard script | Checker |
| agent instructions | Platform adapter |

4. Identify conflicts.

5. Reconcile authority and prepare a controlled plan before any workflow asset write.

## Codex Adoption Decision

Codex derives whether to:

- keep existing governance only
- add IntentOS as adapter docs
- add selected workflow assets
- migrate gradually through a reviewed, authority-bound plan
- do not adopt

## Forbidden Before Controlled Readiness

- no init
- no update
- no migration apply
- no AGENTS overwrite
- no PR template overwrite
- no workflow CI overwrite
- no business code changes

## Stop Conditions

Stop if the mapping reveals conflicting ownership, unknown release risk, or current uncommitted work whose owner is not clear.
