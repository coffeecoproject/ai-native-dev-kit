# 1.67.0 Release Core Model Consolidation Plan

## Purpose

1.67 is a consolidation release.

1.57-1.61 built a complete release path:

```text
release adapter
  -> release guide
  -> platform release recipe
  -> release handoff pack
  -> release execution plan
  -> human / external release system
```

1.62-1.66 then hardened existing-project adoption:

```text
existing project
  -> IntentOS Operating Mode is active for Codex work
  -> Native Migration Plan
  -> Existing Rule Reconciliation
  -> Unified Apply Plan
  -> Controlled Apply Readiness
  -> Approval Record
```

Both lines are correct, but the user-facing system now has too many adjacent
decision surfaces. A beginner or project owner can see many technically correct
reports and still not know what to do next.

1.67 should reduce that complexity by introducing a single release-facing model:

```text
Release Plan
```

The Release Plan is the user-facing and machine-checkable release decision
view. Existing lower-level release assets remain valid as inputs, but they
should no longer be the primary concepts a user must understand.

Important: Release Plan is derived only. It is not a new release subsystem, not
an execution authority, and not the new source of truth for adapter, recipe,
handoff, or execution facts.

## Review Input

This plan incorporates two review inputs:

1. Release path review:
   - the release system is structurally correct
   - `release-guide`, `recipe`, `handoff`, `execution`, `launch-view`, and
     `adapter` overlap as separate decision surfaces
   - the next step should be consolidation, not new release capability
   - Release Plan must be a derived view, not a new hidden meta-system
   - release-plan must include traceability back to lower-level inputs so the
     system does not become a black box
2. Read-only WorkControl trial:
   - IntentOS correctly classified WorkControl as a production-sensitive,
     governed existing project
   - the safe posture was read-only
   - the safe posture should restrict target-project writes and asset
     migration, not prevent Codex from working in IntentOS mode
   - multiple commands were individually correct, but the final user answer was
     still dispersed across `start`, `baseline`, `next`, `native-migration`,
     `reconcile-rules`, and `real-adoption`
   - existing-project UX needs a single plain-language decision summary without
     weakening safety
   - existing-project UX should not maximize governance asset migration by
     default; Codex should work in IntentOS Operating Mode and recommend the
     most suitable project asset migration depth

## Goal

Make release and governed-existing-project decisions easier to understand
without reducing any safety boundary.

After 1.67, a user should be able to say:

```text
Help me launch this project.
```

or:

```text
Use IntentOS on this existing project.
```

and get one decision-oriented response:

```text
Current conclusion:
- can continue / cannot continue
- why
- what Codex may do
- what the human must decide
- what external systems must execute
- what evidence is missing
- the safest next action
```

The user should not need to choose between internal release commands or
understand the full Native Migration chain before seeing the next safe step.

For existing projects, the goal is not "make every old project fully
IntentOS-native." The goal is:

```text
Codex works in IntentOS Operating Mode immediately, then judges the safest
project-asset migration depth.
```

This keeps the user in decision mode instead of forcing the user to understand
workflow architecture. The user should not need to choose whether Codex uses
IntentOS as its working method. That should be the default. The user only needs
to confirm risky project-file changes, governance replacement, release actions,
or unclear business/production decisions.

## Non-Goals

1.67 must not:

- delete existing release modules
- break current `release-guide`, `release-recipe`, `release-handoff`,
  `release-execution`, `launch-view`, or `release-adapter` commands
- execute deploys, preview publishes, production releases, app-store submits,
  mini-program submits, DNS changes, migrations, provider API calls, payment
  changes, permission changes, or production config changes
- make Codex the release owner
- treat a Release Plan as release approval
- treat an existing-project read-only conclusion as permission to write files
- replace existing project governance, release SOPs, production controls,
  business rules, `AGENTS.md`, `agent.md`, CI, hooks, secrets, customer data,
  permissions, security, privacy, compliance, finance, tax, HR, legal, or
  migration rules
- remove 1.66 Existing Rule Reconciliation
- require users to learn internal checker names
- maximize governance asset migration by default for existing projects
- confuse IntentOS Operating Mode with project governance asset migration
- hide lower-level release inputs so debugging becomes impossible
- make `release-plan` drive or rewrite `release-adapter`, `release-guide`,
  `release-recipe`, `release-handoff`, or `release-execution`
- let Release Plan state change execution behavior
- let Release Plan Trace become a control path
- treat IntentOS Operating Mode as target-project write permission

## Core Definition

### Release Plan

`Release Plan` is the single public release decision view.

It derives one structured output from lower-level inputs:

```text
Release Plan
  = release intent
  + selected release target
  + project release shape
  + platform recipe summary
  + launch readiness summary
  + handoff / execution summary
  + human decisions
  + external system actions
  + Codex-allowed actions
  + evidence requirements
  + rollback / monitoring / smoke expectations
  + final release-plan state
```

It does not replace the underlying artifacts. It is the decision view that
prevents multiple lower-level systems from producing competing user-facing
messages.

Release Plan must be:

- derived from lower-level inputs
- explainable by trace
- read-only by default
- non-authoritative for release approval
- non-authoritative for existing-project governance replacement
- unable to create reverse dependencies into adapter, recipe, handoff, or
  execution modules

Release Plan must not be:

- a release orchestrator
- a deployment executor
- a new source of release truth
- a workflow engine state machine
- a replacement for release guide, recipe, handoff, or execution facts
- a hidden black-box decision system

### Pure View Model Contract

Release Plan is a computed read-only projection.

It may:

- summarize lower-level release inputs
- point to missing evidence
- explain why the user-facing conclusion was chosen
- recommend the next safe planning or review action
- list Codex-safe local actions after approval
- list human decisions and external-system actions

It must not:

- approve release or production
- approve target-project writes
- approve provider, store, DNS, migration, payment, permission, secret, or
  production-config actions
- mutate, rewrite, or backfill lower-level release artifacts
- change command behavior
- become a release state machine
- become the only source a reviewer can inspect

Implementation rule:

```text
release-plan output must be reproducible from lower-level inputs.
If the same lower-level inputs are unchanged, Release Plan should not invent a
new release fact.
```

### Release Plan Trace

Every Release Plan should include a trace section.

Minimum trace entries:

```text
adapter_input
release_guide_input
platform_recipe_input
launch_review_input
handoff_input
execution_input
existing_project_input
```

Each trace entry should record:

- source type
- source path or generated source
- status
- decision contribution
- whether the source is missing, stale, blocked, or not applicable

Trace is required so a user or reviewer can understand why the Release Plan
reached its conclusion without reading every lower-level report.

Trace is explanation only.

Trace must not:

- authorize execution
- choose commands
- update lower-level artifacts
- override lower-level artifact state
- become a hidden routing engine

If a trace entry conflicts with a lower-level source, the lower-level source
wins and Release Plan must surface the conflict.

### Release Plan State

Allowed states:

```text
NEEDS_RELEASE_SHAPE
NEEDS_PLATFORM_RECIPE
NEEDS_LAUNCH_REVIEW
NEEDS_STRUCTURED_APPROVAL
READY_FOR_HANDOFF_REVIEW
READY_FOR_LOCAL_ASSIST
READY_FOR_PREVIEW_HANDOFF
READY_FOR_STAGING_HANDOFF
READY_FOR_PRODUCTION_HANDOFF
BLOCKED_BY_HUMAN_DECISION
BLOCKED_BY_EXTERNAL_SYSTEM
BLOCKED_BY_HIGH_RISK_SURFACE
```

Important wording:

- `READY_FOR_*_HANDOFF` means ready for handoff review, not release approval.
- `READY_FOR_LOCAL_ASSIST` means Codex may run explicitly allowed local-safe
  commands after approval, not release commands.
- Release Plan state is a summary state, not a workflow-engine state.
- Release Plan state must not drive execution behavior by itself.
- Production, app-store, mini-program, migration, DNS, payment, provider-state,
  permission, and production-config actions remain human-owned or
  external-system-owned.

### Existing Project Decision Summary

1.67 should also add an existing-project read-only summary layer, but only as a
UX calibration, not a new migration subsystem.

This layer must separate two decisions:

```text
IntentOS Operating Mode
  = whether Codex uses IntentOS as its working method

Project Asset Migration Depth
  = how much of the project's files, governance assets, rules, CI, hooks, and
    templates may be migrated or replaced
```

For existing projects, IntentOS Operating Mode should normally become active
immediately:

```text
Codex uses IntentOS for:
- intent reading
- project classification
- risk and boundary judgment
- task planning
- change impact coverage
- work queue / task switching
- review loop
- closure and evidence
- release planning view
```

This does not authorize target-project writes.

This does not authorize replacing existing governance.

This does not authorize changing baseline files, release rules, CI, hooks, or
production controls.

This does not authorize release, production, CI, hook, migration, secret,
provider, data, permission, security, privacy, compliance, legal, finance, tax,
HR, or customer changes.

The adoption-fit model should control project asset migration depth, not whether
Codex works in IntentOS mode.

Allowed project asset migration depth recommendations:

```text
NO_ASSET_MIGRATION
RECORD_NATIVE_MIGRATION_PLAN
NEW_WORK_USES_INTENTOS_FLOW
PARTIAL_WORKFLOW_RULE_MIGRATION
FULL_INTENTOS_NATIVE_CANDIDATE
BLOCKED_BY_PROJECT_AUTHORITY
```

Default rule:

```text
Codex starts working in IntentOS Operating Mode, then recommends the lowest
project asset migration depth that solves the user's immediate goal without
weakening existing project governance.
```

`FULL_INTENTOS_NATIVE_CANDIDATE` should be rare and requires clear evidence:

- light or new project
- weak or missing existing governance
- user explicitly asks to replace governance
- no production-sensitive constraints block migration
- reviewed apply chain is available before any target write

For a production-sensitive or governed existing project, IntentOS should be able
to produce:

```text
Current conclusion:
- do not directly initialize or overwrite workflow assets
- project has existing governance and production controls
- IntentOS Operating Mode is active for Codex planning and task work
- recommended asset migration depth is no asset migration, migration-plan only,
  or partial workflow-rule migration
- full project governance asset migration is not recommended by default
- next safe action is Native Migration Plan only if migration evidence is needed
- rule comparison requires a recorded Native Migration Plan
- no target files can change until apply plan, readiness, approval, and exact
  scope are reviewed
```

This summary should draw from existing outputs:

- `start`
- `baseline`
- `next`
- `native-migration`
- `reconcile-rules`
- `real-adoption`

It should not create a separate competing migration protocol.

### Existing Project Rule Comparison Contract

IntentOS Operating Mode does not mean "leave old project rules untouched
forever."

For an existing project, Codex should compare the project's current baseline and
release rules against IntentOS expectations and recommend the more suitable
path.

The comparison must cover, when evidence exists:

- engineering baseline
- environment baseline
- platform baseline
- testing and quality gates
- code structure and dependency rules
- release / rollback / monitoring rules
- CI and hook rules
- documentation source-of-truth rules
- security, privacy, compliance, permission, data, migration, payment, finance,
  tax, HR, legal, customer, and production constraints

Allowed recommendation posture:

```text
KEEP_EXISTING
KEEP_EXISTING_AS_STRICTER
ADOPT_INTENTOS_GAP
MERGE_AFTER_REVIEW
GAP_SUGGESTION
NEEDS_HUMAN_DECISION
BLOCKED_BY_PROJECT_AUTHORITY
```

Rules:

- If the existing project rule is stricter, more concrete, or production-proven,
  prefer keeping it.
- If IntentOS has a missing engineering or workflow safety rule, recommend it as
  a gap, not as an automatic write.
- If both sides are useful, recommend merge wording through Unified Apply Plan.
- If the area is release, production, compliance, permission, data, migration,
  payment, finance, tax, HR, legal, customer, or security-sensitive, preserve
  project authority and escalate conflicts.
- If authority is unclear, stop for human decision.

This means old projects are not ignored. They are actively compared, but changes
are applied only through the reviewed apply chain.

## Architecture

### Before 1.67

```text
release-guide
release-adapter
launch-view
release-recipe
release-handoff
release-execution
```

Each command can produce a useful answer, but several of them also contain:

- next action
- decision state
- missing evidence
- human decision
- execution boundary

### After 1.67

```text
Level 0: lower-level release inputs
  release-adapter
  release-guide
  launch-view
  release-recipe
  release-handoff
  release-execution

Level 1: derived aggregation view
release-plan
  -> derives one Release Plan from lower-level inputs
  -> emits one Release Plan

Level 2: user-facing decision output
  -> what should the user do next
  -> what can Codex do
  -> what remains human/external-system owned

release-check
  -> validates Release Plan structure, boundaries, evidence links, and wording

legacy release commands
  -> remain available
  -> documented as lower-level inputs / compatibility wrappers
```

Conceptually:

```text
adapter + launch-view + guide + recipe + handoff + execution
  -> Release Plan derived view
  -> single user-facing release conclusion
```

Forbidden dependency:

```text
release-plan must not rewrite or drive lower-level release systems.
```

Allowed dependency:

```text
lower-level release systems may be read as inputs by release-plan.
```

## Authority Model

Release Plan authority is bounded:

| Area | Authority |
| --- | --- |
| User release intent summary | Release Plan may summarize |
| Platform route recommendation | Release Plan may recommend |
| Local read-only / build / test preparation | Release Plan may list allowed actions |
| Preview, staging, production, store, mini-program, provider, DNS, migration | Human or external release system |
| Release approval | Human or external release system |
| Production ownership | Human or external release system |
| IntentOS Operating Mode for Codex planning | IntentOS may activate by default |
| Existing project governance replacement | Unified Apply Plan + Controlled Apply Readiness + Approval Record |
| Business / security / privacy / compliance / legal / finance / tax / HR | Project owner / human authority |

Release Plan is not the release authority. It is a release decision view.

## Truth Model

1.67 must avoid creating a second source of truth.

Truth hierarchy:

```text
project release SOP / human release owner / external release system
  > lower-level IntentOS release artifacts
  > Release Plan derived view
  > user-facing summary text
```

Release Plan may summarize, route, and explain. It may not override:

- project release SOP
- structured release approval status
- release owner
- rollback owner
- monitoring owner
- provider state
- CI/CD state
- human decisions
- external-system release status

If lower-level inputs conflict, Release Plan must surface the conflict and choose
the stricter user-facing state. It must not silently collapse the conflict.

## User-Facing Behavior

### New Project Release

User says:

```text
Help me launch this project.
```

Codex should produce a Release Plan:

```text
Conclusion: not ready for release handoff yet.

Why:
- local verification exists
- platform recipe is missing
- rollback owner is missing
- monitoring evidence is missing

Codex can:
- prepare a preview release plan
- run local build/test after approval
- list missing release inputs

Human must:
- choose release target
- confirm release owner
- confirm whether preview publish is allowed

External system must:
- run provider publish / production release if approved
```

### Existing Governed Project

User says:

```text
Use IntentOS on this existing project.
```

Codex should produce a single plain summary:

```text
Conclusion: do not directly initialize or overwrite project workflow assets.

Why:
- production-sensitive signals detected
- existing governance, release, CI, and evidence controls exist
- IntentOS Operating Mode is active for planning and task work
- IntentOS cannot replace project authority by itself

Recommended project asset migration depth:
- no direct asset migration yet
- Native Migration Plan only when old rules need classification
- optional partial workflow-rule migration after review
- not full governance asset migration

Next safe action:
- continue working in IntentOS Operating Mode
- record Native Migration Plan if rule migration is needed
- run Existing Rule Reconciliation only after migration evidence exists
- prepare Unified Apply Plan only if approved
```

The user should not have to interpret five separate reports before knowing the
safe next step.

## Implementation Plan

### Phase 0 - Plan and Evidence Setup

Add the 1.67 plan and make it visible in the plan index.

Deliverables:

- `docs/plans/release-core-model-consolidation-1.67-plan.md`
- `docs/plans/README.md` link

Acceptance:

- plan clearly states consolidation scope
- plan includes release and existing-project UX calibration
- plan explicitly forbids production execution and target-project writes

### Phase 1 - Release Core Model Assets

Add the model and user-facing docs.

Expected deliverables:

- `core/release-core-model.md`
- `docs/release-core-model.md`
- `templates/release-plan.md`
- `schemas/artifacts/release-plan.schema.json`
- `checklists/release-plan-review.md`
- `prompts/release-plan-agent.md`
- `release-plans/.gitkeep`

Acceptance:

- docs define Release Plan as a consolidation object, not a new release
  executor
- docs define Release Plan as a pure view model / computed read-only projection
- template includes human summary, state, input sources, Codex actions, human
  actions, external-system actions, evidence, rollback, monitoring, smoke, and
  boundaries
- template includes Release Plan Trace with lower-level input status and
  decision contribution
- template states Trace is explanation only and cannot control execution
- docs forbid reverse dependency from Release Plan into lower-level release
  systems
- schema rejects release approval, production execution, secret request, and
  Codex release ownership

### Phase 2 - Resolver and Checker

Add a resolver and checker.

Expected deliverables:

- `scripts/resolve-release-plan.mjs`
- `scripts/check-release-plan.mjs`
- CLI entries:
  - `release-plan`
  - `release-check`
- `scripts/check-intentos.mjs` coverage
- `scripts/new-workflow-item.mjs` type for `release-plan`

Resolver behavior:

- read existing release signals
- derive from existing lower-level release artifacts when present
- otherwise emit a safe blocked/deferred Release Plan
- default unknown release commands to no-run
- keep production/stores/provider actions external
- never write target files
- include trace entries for every lower-level input considered
- surface conflicts instead of silently flattening them
- recommend the stricter state when inputs disagree
- keep Release Plan state as a summary state only
- never use Release Plan state to trigger execution behavior

Checker behavior:

- require safe boundaries
- reject production approval claims
- reject Codex release owner claims
- reject provider/API/secret/DNS/migration/payment/permission execution claims
- reject `READY_FOR_*` wording that implies release approval
- validate structured evidence in strict mode
- ensure lower-level inputs are treated as inputs, not competing final truth
- reject Release Plan records that claim to drive, rewrite, or replace
  lower-level release systems
- require traceability in strict mode
- reject plans that hide conflicting lower-level inputs
- reject plans where trace authorizes execution or command selection
- reject plans where summary state is used as workflow-engine authority
- reject plans where IntentOS Operating Mode is treated as write permission

Acceptance:

- `release-plan` prints one user-facing release conclusion
- `release-check` validates generated and example plans
- bad fixtures fail deterministically
- trace entries explain why the final state was selected
- state remains summary-only and never execution authority

### Phase 3 - Existing Project Read-Only UX Calibration

Add a summary layer or resolver behavior that converts governed-existing-project
signals into a single human-readable next step.

Expected deliverables may include:

- update `start`, `next`, or a shared guidance helper to include a unified
  existing-project conclusion
- optional `templates/existing-project-decision-summary.md` if a separate
  template is cleaner
- anonymized calibration example based on the WorkControl read-only trial,
  without copying private project content

Required behavior:

- production-sensitive / governed existing projects default to IntentOS
  Operating Mode with read-only target-file posture
- no direct init or workflow asset write
- Codex recommends the most suitable project asset migration depth, not maximum
  governance migration
- Codex compares existing engineering, environment, baseline, release,
  rollback, CI, hook, and documentation rules against IntentOS expectations
  when evidence exists
- comparison output recommends keep, adopt gap, merge after review, gap
  suggestion, or human decision
- Native Migration Plan is the next safe step when rule migration or
  reconciliation is needed
- Existing Rule Reconciliation requires recorded migration evidence
- apply chain remains required before any target write
- user sees one recommended next action, not only a list of commands
- full governance asset migration is not recommended for governed production
  projects unless evidence and explicit approval support it

Acceptance:

- a governed existing project example produces a single conclusion:
  `INTENTOS_OPERATING_MODE_ACTIVE_WITH_NO_ASSET_MIGRATION`
- the output says Codex is working in IntentOS Operating Mode
- the output does not say IntentOS can directly replace project governance
- the output does not say IntentOS should maximize governance asset migration
- the output does not ignore existing baseline or release rules
- the output says existing rules should be compared and the stricter or more
  project-suitable rule should be recommended
- the output does not ask the user to understand internal checker names
- the output preserves existing governance, release SOPs, CI, hooks, and
  production controls

### Phase 4 - Compatibility and Documentation

Update docs without breaking old commands.

Expected deliverables:

- README / README.zh-CN current release section
- `VERSION.md`
- `package.json`
- `intentos-manifest.json`
- `templates/version-record.md`
- `templates/workflow-version.json`
- `docs/reference/scripts.md`
- `docs/reference/artifacts.md`
- `docs/reference/checkers.md`

Compatibility rule:

```text
release-guide / recipe / handoff / execution remain available
release-plan becomes the recommended user-facing entry
old commands are documented as lower-level inputs or compatibility wrappers
release-plan is a derived view, not the source of truth
```

Acceptance:

- no existing release tests are removed
- README explains release path in one simplified model
- Chinese README uses non-technical wording for ordinary users
- manifest includes all new source and target workflow assets

### Phase 5 - Examples and Bad Fixtures

Add positive examples and rejection fixtures.

Expected positive examples:

- `examples/1.67-release-core-model/web-preview`
- `examples/1.67-release-core-model/mini-program-review`
- `examples/1.67-release-core-model/backend-api-handoff`
- `examples/1.67-release-core-model/governed-existing-project-readonly`

Expected bad fixtures:

- release plan approves production
- release plan makes Codex release owner
- release plan requests or stores secrets
- release plan runs provider / DNS / migration / payment / permission action
- release plan treats lower-level recipe as final approval
- release plan claims to replace lower-level release systems
- release plan omits trace in strict mode
- release plan hides lower-level conflict
- release plan uses trace as execution authority
- release plan uses summary state to trigger execution
- release plan treats IntentOS Operating Mode as write permission
- release plan claims existing project can be directly overwritten
- release plan skips Native Migration Plan before rule reconciliation
- release plan maximizes governance asset migration for a governed production
  project
- release plan ignores stricter existing baseline or release rules

Acceptance:

- all positive examples pass strict checks
- all bad fixtures fail
- examples stay anonymized and do not depend on local private projects

### Phase 6 - Release Evidence

Add release evidence.

Expected deliverables:

- `releases/1.67.0/release-record.md`
- `releases/1.67.0/known-limitations.md`
- `releases/1.67.0/self-check-report.md`

Release record must include:

- Allowed Claims
- Forbidden Claims
- Evidence Status
- Known Limitations
- Verification

Acceptance:

- claim control passes
- product baseline check passes
- self-check records exact commands and results

## Acceptance Plan

### Syntax and Manifest

```bash
node --check scripts/resolve-release-plan.mjs
node --check scripts/check-release-plan.mjs
node scripts/check-manifest.mjs
```

### Release Plan Checks

```bash
node scripts/cli.mjs release-plan .
node scripts/cli.mjs release-check .
node scripts/check-release-plan.mjs examples/1.67-release-core-model/web-preview --require-structured-evidence
node scripts/check-release-plan.mjs examples/1.67-release-core-model/mini-program-review --require-structured-evidence
node scripts/check-release-plan.mjs examples/1.67-release-core-model/backend-api-handoff --require-structured-evidence
node scripts/check-release-plan.mjs examples/1.67-release-core-model/governed-existing-project-readonly --require-structured-evidence
```

Strict mode must require Release Plan Trace.

### Existing Project Read-Only Calibration

Source-repo examples should be deterministic and anonymized:

```bash
node scripts/check-release-plan.mjs examples/1.67-release-core-model/governed-existing-project-readonly --require-structured-evidence
```

Optional local calibration, only when the local project exists and the run is
explicitly read-only:

```bash
node scripts/cli.mjs start /Users/liushan/Developer/WorkControl
node scripts/cli.mjs baseline /Users/liushan/Developer/WorkControl
node scripts/cli.mjs next /Users/liushan/Developer/WorkControl
node scripts/cli.mjs native-migration /Users/liushan/Developer/WorkControl
node scripts/cli.mjs reconcile-rules /Users/liushan/Developer/WorkControl
```

This optional calibration must not be part of required CI verification because
the private project may not exist on other machines.

The local calibration target is to prove the user-facing decision, not to copy
private project content:

```text
intentos_operating_mode = active
recommended_asset_migration_depth = NO_ASSET_MIGRATION or
RECORD_NATIVE_MIGRATION_PLAN or PARTIAL_WORKFLOW_RULE_MIGRATION
full_governance_asset_migration = not recommended by default
target_project_writes = No
```

### Bad Fixtures

Implementation should add a compact bad-fixture loop or individual checks that
prove unsafe plans fail:

```bash
node scripts/check-release-plan.mjs test-fixtures/bad/bad-release-plan-approves-production --require-structured-evidence
node scripts/check-release-plan.mjs test-fixtures/bad/bad-release-plan-codex-owner --require-structured-evidence
node scripts/check-release-plan.mjs test-fixtures/bad/bad-release-plan-secret-request --require-structured-evidence
node scripts/check-release-plan.mjs test-fixtures/bad/bad-release-plan-provider-exec --require-structured-evidence
node scripts/check-release-plan.mjs test-fixtures/bad/bad-release-plan-skips-native-migration --require-structured-evidence
node scripts/check-release-plan.mjs test-fixtures/bad/bad-release-plan-missing-trace --require-structured-evidence
node scripts/check-release-plan.mjs test-fixtures/bad/bad-release-plan-replaces-lower-level-system --require-structured-evidence
node scripts/check-release-plan.mjs test-fixtures/bad/bad-release-plan-asset-migration-maximize-governed-project --require-structured-evidence
node scripts/check-release-plan.mjs test-fixtures/bad/bad-release-plan-trace-controls-execution --require-structured-evidence
node scripts/check-release-plan.mjs test-fixtures/bad/bad-release-plan-state-drives-execution --require-structured-evidence
node scripts/check-release-plan.mjs test-fixtures/bad/bad-release-plan-operating-mode-writes-files --require-structured-evidence
node scripts/check-release-plan.mjs test-fixtures/bad/bad-release-plan-ignores-existing-rules --require-structured-evidence
```

Each command above must fail.

### Existing Regression Suite

```bash
npm run verify:syntax
npm run verify:governance
npm run verify:examples
node scripts/check-product-baseline.mjs .
node scripts/check-claim-control.mjs .
node scripts/check-intentos.mjs
git diff --check
```

## Success Criteria

1. `release-plan` becomes the recommended public release entry.
2. Existing lower-level release commands remain available and passing.
3. Release Plan is a derived view, not a new source of truth.
4. Release Plan includes traceability to lower-level inputs.
5. Release Plan Trace is explanation only and cannot control execution.
6. Release Plan state is summary-only and cannot drive behavior.
7. Release Plan does not approve release, production, deploy, provider API,
   stores, DNS, migrations, payment, permissions, production config, or secrets.
8. Release Plan clearly separates:
   - Codex may prepare / verify / run local-safe commands after approval
   - humans decide
   - external systems execute release actions
9. Existing governed projects get one clear next-step summary:
   - IntentOS Operating Mode active for Codex work
   - target-file posture read-only first when production-sensitive
   - project asset migration depth selected by Codex
   - no full governance asset migration unless justified
   - existing baseline, environment, release, CI, hook, and documentation rules
     are compared against IntentOS expectations
   - stricter or more project-suitable existing rules are kept
   - IntentOS gaps are proposed, not directly written
   - Native Migration Plan only when rule migration or reconciliation is needed
   - Existing Rule Reconciliation only after migration evidence
   - no target writes before reviewed apply chain
10. Users no longer need to understand internal release command names to know
   what to do next.
11. All new examples pass, all bad fixtures fail, and existing release-path
   regression tests remain intact.

## Risks

### Risk 1 - Accidental New Subsystem

Release Plan could become another release module instead of a consolidation
layer.

Mitigation:

- define Release Plan as a derived view
- keep lower-level modules as inputs
- avoid new release authority
- forbid reverse dependencies from Release Plan into lower-level release modules

### Risk 2 - Breaking Existing Release Commands

Consolidation could accidentally break `release-guide`, `release-recipe`,
`release-handoff`, or `release-execution`.

Mitigation:

- keep legacy commands available
- run existing 1.57-1.61 checks
- update docs before changing command semantics

### Risk 3 - User-Facing Overclaim

The simplified output might imply release approval.

Mitigation:

- checker rejects approval language
- Release Plan state names must say handoff/review when appropriate
- claim-control checks cover README, release records, and examples

### Risk 4 - Black-Box Collapse

The simplified Release Plan could hide why a decision was made.

Mitigation:

- require Release Plan Trace in strict mode
- include source, status, and decision contribution for each lower-level input
- surface conflicts instead of silently collapsing them
- choose stricter state when inputs disagree

### Risk 5 - View Becomes Control Plane

The Release Plan state or trace could accidentally be used as a control path.

Mitigation:

- define Release Plan as pure view model
- checker rejects trace-as-execution and state-drives-execution claims
- source systems remain authoritative
- Release Plan cannot change command behavior

### Risk 6 - Existing Project Overreach

The WorkControl-derived calibration could be misread as permission to migrate
or overwrite a governed production project.

Mitigation:

- anonymized calibration only
- no private project content copied
- read-only target-file posture stays explicit
- IntentOS Operating Mode remains active for planning and task work
- project asset migration depth is selected by Codex; asset migration maximize
  is forbidden by default
- Native Migration Plan and apply chain remain mandatory

### Risk 7 - Existing Rules Are Ignored

The "do not overwrite" safety language could be misread as "do not process old
rules."

Mitigation:

- require existing project rule comparison when evidence exists
- keep stricter or production-proven existing rules
- propose IntentOS gaps instead of direct writes
- route merge and replacement through Existing Rule Reconciliation and apply
  chain

## Human Decisions Needed

Before implementation, confirm:

1. 1.67 should prioritize Release Plan consolidation over new release features.
2. Existing release commands should remain as compatibility wrappers / lower
   level tools.
3. WorkControl read-only feedback should be represented only as anonymized
   calibration and UX behavior, not as a direct project write.
4. `release-plan` and `release-check` should become the recommended public CLI
   entries.
5. Release Plan should be implemented as a derived view with trace, not a new
   release authority.
6. Existing-project behavior should activate IntentOS Operating Mode by default
   while using a fit-based recommendation for project asset migration depth.
7. Existing-project baseline, file-governance, release, CI, hook, and
   documentation rules should be compared against IntentOS expectations instead
   of being ignored or blindly preserved.

## Final Boundary

1.67 is a productization and consolidation release.

It does not:

- deploy anything
- approve release
- approve production
- modify target projects
- migrate WorkControl
- replace existing governance
- make Codex a release owner
- remove lower-level release capabilities
- hide lower-level release inputs
- block IntentOS Operating Mode on existing projects by default
- maximize governance asset migration by default
- ignore existing project baseline, release, CI, hook, or documentation rules
- use Release Plan state or trace as execution authority

It should make the system easier to use by making one release-facing answer the
default.
