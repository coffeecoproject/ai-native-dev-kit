# 1.62.0 Native-First Migration Planning Plan

## Purpose

1.62 introduces Native-First Migration Planning for in-progress, legacy,
governed, and production-maintained projects.

The current existing-project path is too conservative:

```text
existing project detected
  -> map existing governance
  -> avoid writes
  -> recommend adapter-only behavior
```

That protects projects, but it also means Codex may never really switch into the
IntentOS workflow. The user still receives cautious recommendations instead of a
clear operating mode.

1.62 should change the default posture to:

```text
existing project detected
  -> switch Codex into IntentOS workflow planning mode
  -> preserve business and production constraints
  -> classify old workflow rules for IntentOS-native migration
  -> use plan-first controlled apply for governance assets
```

The goal is not to force-copy templates. The goal is to make IntentOS the
primary planning and decision workflow Codex uses inside existing projects.

## Scope Contract

1.62 is a planning and authority-classification release.

It can:

- inspect existing project governance read-only
- classify old rules and authority sources
- detect workflow, baseline, business, production, document truth, and owner
  conflicts
- recommend a Native-First posture
- produce a reviewable Native Migration Plan
- route approved governance-file work into the existing Unified Apply Plan,
  Controlled Apply Readiness, and Approval Record chain

It must not:

- directly rewrite `AGENTS.md`
- directly rewrite PR templates
- directly modify CI, hooks, release, production, secrets, migrations,
  provider state, data, payment, permissions, security, compliance, legal, tax,
  finance, HR, or customer records
- add a native migration apply runner
- treat workflow authority as target-file write authority
- treat workflow authority as business or production authority

## User Outcome

A user should be able to say:

```text
This is my existing project. Configure yourself and continue with IntentOS.
```

Codex should answer in plain language:

```text
I have switched to IntentOS Native-First Migration Planning mode.
I will not rewrite business logic or production settings.
I will use IntentOS as the planning workflow for future work.
I found these existing rules and will classify them for IntentOS-native migration.
These business/production constraints will be preserved.
These workflow conflicts can be replaced by IntentOS rules only after a reviewed migration plan and approval.
```

The user should make decision-level choices only:

- confirm whether this project should become IntentOS-native
- confirm which detected old rules are real business constraints
- approve or reject the reviewed migration plan
- confirm high-risk production, data, payment, permission, security, compliance,
  legal, tax, finance, or migration decisions

The user should not need to understand every internal command, artifact type, or
checker before IntentOS becomes the operating workflow.

## Positioning

1.62 is not a replacement for new-project bootstrap.

It is the missing adoption posture for projects that already exist.

| Project type | Desired IntentOS posture |
| --- | --- |
| New project | `FULL_MANAGED_INTENTOS_NATIVE` |
| Existing light project | `NATIVE_FIRST_MIGRATION` |
| Existing governed project | `NATIVE_FIRST_WITH_GOVERNANCE_CONFLICT_REVIEW` |
| Existing production project | `PRODUCTION_SAFE_NATIVE_OVERLAY` |
| Dirty worktree project | `NATIVE_FIRST_PENDING_WORKTREE_REVIEW` |
| Unknown / ownerless project | `BLOCKED_NEEDS_OWNER` |

Each posture must also report authority status:

| Authority field | Allowed values | Meaning |
| --- | --- | --- |
| `intentOsWorkflowAuthority` | `ACTIVE_FOR_PLANNING`, `PENDING_APPROVAL`, `BLOCKED` | Whether IntentOS can be used as the planning and task-routing workflow now |
| `targetFileWriteAuthority` | `NO_WRITE`, `PLAN_REQUIRED`, `APPROVAL_REQUIRED` | Whether Codex may write target files now |
| `businessAuthority` | `PROJECT_OWNED` | Business behavior remains owned by the project and human decisions |
| `productionAuthority` | `HUMAN_OR_EXTERNAL_SYSTEM` | Production, release, provider, migration, and operational authority remain external to IntentOS |

The important shift:

```text
read-only adapter is no longer the preferred end state.
read-only adapter becomes the first diagnostic step before native migration.
```

Adapter-only remains the preferred end state when owner, authority, dirty
worktree, production/compliance risk, third-party project constraints, active
incident state, or explicit user refusal blocks native migration.

## Non-Goals

1.62 must not:

- rewrite business logic
- refactor product behavior merely to match IntentOS structure
- change production configuration
- change deployment, release, rollback, CI, hooks, permissions, secrets,
  certificates, DNS, payment, data migration, app-store, mini-program, or
  provider state by default
- treat IntentOS workflow authority as permission to override business,
  production, legal, compliance, safety, security, or data constraints
- auto-delete historical governance records
- silently overwrite `AGENTS.md`, PR templates, CI workflows, hooks, or release
  SOPs
- let a Codex/subagent/GPT review count as human approval
- convert a natural-language "go ahead" into blanket authorization

## Core Principle

1.62 should be strict about workflow authority and conservative about business
authority.

```text
IntentOS may replace old AI-working rules.
IntentOS must preserve real project constraints.
```

Priority order:

1. law, security, privacy, compliance, safety, production, data, payment,
   permission, and customer constraints
2. explicit human decisions and project owner approvals
3. IntentOS workflow governance
4. current project engineering baseline
5. historical project workflow documents
6. old agent-rule habits, informal notes, stale docs, or unowned conventions

This means:

- old workflow rules can be replaced by IntentOS after reviewed plan and human
  approval
- old business facts must be preserved or escalated
- unclear rules must be classified before migration

## Native-First Migration Model

### 1. Read Existing Project State

Codex should inspect:

- `AGENTS.md`, `agent.md`, `.codex`, `.cursor`, `.claude`
- README and project docs
- engineering and environment baselines
- release, rollback, incident, deployment, and evidence docs
- CI workflows, guard scripts, hooks, and task commands
- current git state
- work intake and task docs
- tests and verification commands
- production-sensitive files and platform signals

This stage is read-only.

### 2. Classify Existing Rules

Every extracted existing rule should be classified.

| Rule class | Meaning | Default handling |
| --- | --- | --- |
| `BUSINESS_FACT` | Real business behavior, domain rule, user-visible rule, data meaning | preserve |
| `PROJECT_CONSTRAINT` | Runtime, stack, architecture, integration, compatibility, dependency constraint | preserve or map |
| `PRODUCTION_CONTROL` | release, rollback, migration, environment, customer data, incident, secret, provider constraint | preserve and escalate |
| `ENGINEERING_BASELINE` | code style, schema style, enum/string choices, project structure, test standard | migrate into IntentOS baseline |
| `WORKFLOW_RULE` | how Codex/AI should plan, review, apply, or close work | IntentOS becomes preferred future authority after reviewed migration plan and approval |
| `HISTORICAL_NOTE` | stale background, old TODO, past decision not currently authoritative | archive suggestion |
| `UNKNOWN_AUTHORITY` | unclear source, owner, age, or risk | stop for classification |

Each extracted rule must have structured classification evidence:

```text
rule_id:
source_file:
source_excerpt:
source_line_or_location:
rule_class:
authority:
default_handling:
preserve_or_replace:
reason:
risk_surfaces:
target_action:
human_decision_required:
```

Classification without source file, source excerpt, reason, and target action is
not acceptable. This prevents "classified" from becoming a vague claim.

### 3. Detect Conflicts

Conflicts must be explicit.

| Conflict type | Example | Default 1.62 decision |
| --- | --- | --- |
| `WORKFLOW_CONFLICT` | Old `AGENTS.md` allows direct edits; IntentOS requires impact coverage and apply plan | IntentOS becomes preferred future authority after plan review and approval |
| `BASELINE_CONFLICT` | Old docs say strings are fine; current project uses enum/lookup model | preserve current project evidence and update baseline |
| `BUSINESS_CONFLICT` | IntentOS generated rule would alter user-visible behavior | stop; human decision |
| `PRODUCTION_CONFLICT` | IntentOS asset update would touch release, CI, hook, env, migration, or provider state | stop; reviewed plan + explicit approval |
| `DOC_TRUTH_CONFLICT` | multiple docs claim different source of truth | create doc lifecycle / source-of-truth decision |
| `OWNER_CONFLICT` | no clear owner for migration | block apply |

### 4. Produce Native Migration Plan

The output should be a reviewable plan, not direct mutation.

Suggested artifact:

```text
native-migration-plans/<id>.md
```

The plan should include:

- detected project state
- recommended posture
- existing governance inventory
- extracted rule classification
- conflicts and decisions
- files proposed for migration
- files proposed for preservation
- files proposed for archive suggestion
- exact target paths
- rollback / restore plan
- human approvals needed
- evidence to capture
- "Codex may do" and "Codex must not do" sections

### 5. Apply Only Through Existing Controlled Apply Chain

1.62 should reuse the existing plan-first chain:

```text
Native Migration Plan
  -> Unified Apply Plan
  -> Controlled Apply Readiness
  -> Approval Record
  -> Codex may prepare or perform only explicitly approved governance-file edits
  -> Change Impact Coverage / Review Loop / Finish
```

No direct native migration apply runner is required or allowed for 1.62.

## AGENTS.md Native Handling

`AGENTS.md` is the most visible conflict point.

1.62 should stop treating an existing `AGENTS.md` as untouchable forever.

Instead:

```text
existing AGENTS.md
  -> parse and classify
  -> preserve project facts and constraints
  -> migrate engineering rules into baselines
  -> replace old AI workflow rules with IntentOS-native rules
  -> archive stale or duplicate guidance by suggestion, not deletion
  -> generate reviewed replacement plan
```

Native migration plans must handle `AGENTS.md` in three sections.

### 1. Extracted Rules

Every extracted rule from `AGENTS.md` or related agent-rule files must record:

| Field | Required | Purpose |
| --- | --- | --- |
| `Rule ID` | yes | stable reference for review and approval |
| `Source file` | yes | exact source document |
| `Source line / excerpt` | yes | proof of what was extracted |
| `Rule class` | yes | business, project, production, baseline, workflow, historical, or unknown |
| `Authority` | yes | current source of truth or unknown owner |
| `Risk surfaces` | yes | production, data, permission, payment, release, CI, hook, etc. |
| `Default action` | yes | preserve, replace, map, archive suggestion, or stop |
| `Reason` | yes | why this action is safe or why it must stop |

### 2. Proposed IntentOS-Native Replacement

The replacement plan should describe the intended future `AGENTS.md` shape:

- IntentOS is workflow authority for Codex behavior.
- Project facts remain authoritative project evidence.
- Business, production, compliance, security, data, release, migration,
  payment, permission, legal, tax, finance, and customer constraints override
  workflow convenience.
- Target-file writes require the existing plan-first path.
- New work uses Work Queue, Change Boundary, Impact Coverage, Apply Plan,
  Approval, Review, Finish, and Release Handoff when relevant.

### 3. Restore Plan

The plan must define:

- backup path
- restore command or manual restore method
- owner who can approve restore
- what happens if project owner rejects migration
- what old rules remain active until approval

No `AGENTS.md` replacement is acceptable without extracted-rule
classification, proposed replacement shape, and restore plan.

### What Can Be Replaced

- old instructions that allow broad direct edits
- old instructions that skip impact coverage
- old instructions that skip review/closure
- old instructions that make Codex decide production, release, migration,
  payment, permission, security, or compliance on its own
- duplicate or contradictory AI workflow rules
- stale tool-specific rules that conflict with IntentOS workflow ownership

### What Must Be Preserved Or Escalated

- actual business rules
- project-specific architecture constraints
- test/build commands that are still true
- release owner rules
- rollback rules
- environment and secret boundaries
- permission and data boundaries
- legal/security/compliance constraints
- production incident or audit requirements

### Expected Outcome

After approval, `AGENTS.md` should become an IntentOS-native entry:

```text
IntentOS is the project workflow authority for Codex behavior.
Project facts and production constraints remain authoritative project evidence.
All new tasks use IntentOS boundary, impact, apply, review, closure, and release handoff flows.
```

## PR Template / CI / Hook Handling

1.62 should be stronger about recommending native migration, but it must keep
high-risk surfaces protected.

| Asset | Default behavior |
| --- | --- |
| PR template | propose IntentOS-native replacement or merge plan; apply only after approval |
| CI workflow | map existing gates first; do not add blocking gates by default |
| hooks | hook policy / orchestration plan first; never auto-install |
| release SOP | preserve; map to Release Guide / Recipe / Handoff; replace only with release-owner approval |
| guard scripts | preserve; reference as evidence |
| docs | propose source-of-truth cleanup; archive suggestion before deletion |

Release SOP handling must be explicit:

- preserve the existing release SOP as project evidence
- map relevant parts to Release Guide, Platform Release Recipe, Release Handoff
  Pack, and Release Execution planning
- do not replace the release SOP unless a reviewed migration plan and release
  owner approval exist
- never treat Native-First Migration Planning as release approval

## Relationship To Existing Adapter

The existing adapter remains useful, but its role changes.

Before 1.62:

```text
workflow-map -> adapter recommendation -> maybe add docs-only bridge
```

After 1.62:

```text
workflow-map -> native migration posture -> reviewed native migration plan
```

Adapter-only remains valid when:

- project owner refuses migration
- project has unknown authority
- dirty worktree blocks safe planning
- production or compliance risk cannot be resolved
- target is a third-party project that must not be changed
- active production incident or release freeze is detected
- regulatory, legal, privacy, security, or customer-data authority is unknown

The explicit adapter-only posture is:

```text
ADAPTER_ONLY_RECOMMENDED
```

## Proposed 1.62 Assets

Suggested new assets:

```text
core/native-first-existing-project-migration.md
docs/native-first-existing-project-migration.md
templates/native-migration-plan.md
checklists/native-migration-review.md
prompts/native-migration-agent.md
native-migration-plans/.gitkeep
scripts/resolve-native-migration.mjs
scripts/check-native-migration.mjs
examples/1.62-native-first-existing-project/
test-fixtures/bad/bad-native-migration-*/
releases/1.62.0/
```

Suggested updated assets:

```text
core/existing-project-workflow-adapter.md
docs/existing-project-workflow-adapter.md
scripts/resolve-existing-workflow.mjs
scripts/check-workflow-adoption-map.mjs
scripts/resolve-apply-plan.mjs
scripts/check-apply-plan.mjs
scripts/check-dev-kit.mjs
scripts/cli.mjs
scripts/new-workflow-item.mjs
README.md
README.zh-CN.md
VERSION.md
package.json
dev-kit-manifest.json
templates/workflow-version.json
templates/version-record.md
docs/reference/scripts.md
docs/reference/checkers.md
docs/reference/artifacts.md
```

## CLI Shape

Suggested commands:

```bash
node scripts/cli.mjs native-migration ../existing-project
node scripts/cli.mjs native-migration ../existing-project --json
node scripts/cli.mjs native-migration-check ../existing-project
```

`workflow-map` can remain as an inspection command, but `guide --deep` and
natural-language entry should be able to route to native migration when the user
asks to "configure this existing project", "adopt IntentOS", "use the new
workflow", or "make this project IntentOS-native".

## Resolver Output

The resolver should produce:

```json
{
  "reportType": "NATIVE_FIRST_EXISTING_PROJECT_MIGRATION",
  "posture": "NATIVE_FIRST_MIGRATION",
  "projectState": "EXISTING_GOVERNED_PROJECT",
  "canCodexWriteNow": "No",
  "intentOsWorkflowAuthority": "ACTIVE_FOR_PLANNING",
  "targetFileWriteAuthority": "PLAN_REQUIRED",
  "businessAuthority": "PROJECT_OWNED",
  "productionAuthority": "HUMAN_OR_EXTERNAL_SYSTEM",
  "requiresHumanApprovalBeforeApply": "Yes",
  "recommendedNextStep": "Review native migration plan.",
  "ruleClassifications": [],
  "conflicts": [],
  "proposedActions": []
}
```

The human output should start with:

```text
I have switched to IntentOS Native-First Migration Planning mode.
```

Then explain:

- what will be migrated
- what will be preserved
- what is blocked
- what decision the user needs to make

## Checker Rules

`check-native-migration.mjs` should reject records that:

- claim the project is already fully migrated without evidence
- overwrite `AGENTS.md` without classification and rollback
- remove business constraints
- remove production constraints
- merge old and new workflow rules without resolving conflicts
- treat IntentOS authority as permission to change business behavior
- modify CI, hooks, release, production, secrets, migrations, payment,
  permissions, security, compliance, legal, tax, finance, HR, customer data, or
  provider state
- have no exact target file list
- have no restore plan
- have no human approval requirement for governance replacement
- leave conflicting old workflow rules as equal authority with IntentOS
- classify a business rule as a workflow rule without human decision
- classify a production control as engineering baseline or low-risk migration
- omit source file or source excerpt for extracted rules
- use broad target paths such as `docs/**`, repository root, all workflow
  files, or unbounded globs
- omit authority transition between old rules and future IntentOS workflow
  authority
- approve implementation, release, production, or high-risk decisions

## Examples

### Example A: Existing Light Web Project

Expected posture:

```text
NATIVE_FIRST_MIGRATION
```

Expected plan:

- install or update selected workflow assets after approval
- rewrite `AGENTS.md` into IntentOS-native form if present
- preserve project build/test commands
- create engineering/environment baseline drafts
- route new tasks through Work Queue, Change Boundary, Impact Coverage,
  Apply Plan, Approval, Review, Finish

### Example B: Existing Governed Internal Admin

Expected posture:

```text
NATIVE_FIRST_WITH_GOVERNANCE_CONFLICT_REVIEW
```

Expected plan:

- classify existing governance
- preserve real release/rollback/permission/data constraints
- replace old Codex workflow rules with IntentOS workflow rules
- map existing CI and guard scripts as verification evidence
- do not add new blocking gates by default

### Example C: Production-Maintained Project

Expected posture:

```text
PRODUCTION_SAFE_NATIVE_OVERLAY
```

Expected plan:

- IntentOS becomes task workflow authority
- production release path remains human/external-system owned
- release SOP maps into Release Guide / Recipe / Handoff
- production config, secrets, migrations, data, provider actions, hooks, and CI
  remain protected

### Example D: Dirty Worktree Project

Expected posture:

```text
NATIVE_FIRST_PENDING_WORKTREE_REVIEW
```

Expected plan:

- do not write governance files yet
- inventory current changes
- create Work Queue / Debt Handoff if needed
- prepare native migration plan after current work is stable

## Bad Fixtures

1. `bad-native-migration-drops-business-rule`
   - Removes project business constraint while rewriting `AGENTS.md`.
2. `bad-native-migration-direct-agents-overwrite`
   - Replaces `AGENTS.md` with no classification, plan, or rollback.
3. `bad-native-migration-keeps-split-authority`
   - Leaves old workflow rules and IntentOS rules as equal authority.
4. `bad-native-migration-auto-ci-hook`
   - Adds or changes CI/hook behavior as part of native migration.
5. `bad-native-migration-production-config`
   - Changes production config, secrets, migrations, DNS, payment, or provider
     state.
6. `bad-native-migration-no-human-approval`
   - Claims governance replacement can be applied without human approval.
7. `bad-native-migration-no-restore-plan`
   - Has no backup, restore, or rollback plan for replaced governance assets.
8. `bad-native-migration-approves-implementation`
   - Treats migration plan as authorization to implement business changes.
9. `bad-native-migration-unknown-owner`
   - Applies migration while owner or authority is unknown.
10. `bad-native-migration-business-rule-as-workflow-rule`
    - Misclassifies a real business rule as a replaceable workflow rule.
11. `bad-native-migration-production-control-as-baseline`
    - Misclassifies release, rollback, environment, secret, or incident control
      as an engineering baseline item.
12. `bad-native-migration-no-source-excerpt`
    - Claims rules were classified without source path and source excerpt.
13. `bad-native-migration-broad-target-path`
    - Uses broad target paths such as `docs/**`, repository root, or all
      workflow files.
14. `bad-native-migration-no-authority-transition`
    - Does not state whether old workflow rules or IntentOS rules become future
      authority.

## Acceptance Document

### Acceptance Goal

1.62 is accepted when IntentOS no longer treats existing governed projects as
adapter-only by default, while still protecting business and production safety
and staying strictly in migration-planning mode.

### Functional Acceptance

1. For an existing clean light project, the resolver recommends
   `NATIVE_FIRST_MIGRATION`.
2. For an existing governed project, the resolver recommends
   `NATIVE_FIRST_WITH_GOVERNANCE_CONFLICT_REVIEW`.
3. For an existing production project, the resolver recommends
   `PRODUCTION_SAFE_NATIVE_OVERLAY`.
4. For a dirty project, the resolver recommends
   `NATIVE_FIRST_PENDING_WORKTREE_REVIEW` and blocks writes.
5. `workflow-map` or `guide --deep` no longer ends at adapter-only when the user
   explicitly asks to adopt IntentOS.
6. Existing `AGENTS.md` conflicts are classified into workflow rules, business
   facts, engineering baseline items, production controls, historical notes, or
   unknown authority.
7. Workflow-rule conflicts default to IntentOS authority after reviewed plan and
   approval.
8. Business, production, data, compliance, security, payment, permission,
   migration, release, and customer constraints remain preserved or escalated.
9. Native migration output starts with a human-readable decision summary.
10. Native migration does not approve implementation, release, production, or
    high-risk decisions.
11. Native migration output includes `intentOsWorkflowAuthority`,
    `targetFileWriteAuthority`, `businessAuthority`, and `productionAuthority`.
12. `intentOsWorkflowAuthority=ACTIVE_FOR_PLANNING` never implies target-file
    write authority.
13. `ADAPTER_ONLY_RECOMMENDED` is available when owner, authority, compliance,
    dirty worktree, third-party, active incident, or explicit refusal blocks
    native migration.
14. Existing release SOPs are preserved and mapped to Release Guide, Platform
    Release Recipe, Release Handoff Pack, and Release Execution planning without
    becoming replaced by default.

### Safety Acceptance

The checker must reject:

- governance replacement without exact target paths
- `AGENTS.md` replacement without conflict classification
- migration plans without restore/rollback
- business constraint deletion
- production control deletion
- CI/hook/release/secret/production mutation
- applying IntentOS authority to product behavior changes
- unowned or unknown-authority migration
- no human approval requirement for governance replacement
- claims that the project is already fully migrated without evidence
- business rule misclassified as replaceable workflow rule
- production control misclassified as engineering baseline
- extracted rules without source file and source excerpt
- broad target paths such as `docs/**`, repository root, all workflow files, or
  unbounded globs
- missing authority transition between old agent rules and future IntentOS
  workflow authority
- release SOP replacement without release-owner approval

### Documentation Acceptance

The release must document:

- what Native-First Migration means
- how it differs from adapter-only behavior
- how `AGENTS.md` is handled
- when IntentOS wins
- when project constraints win
- how authority fields prevent Native-first from becoming write-first
- how production-safe overlay works
- when `ADAPTER_ONLY_RECOMMENDED` remains valid
- what the user must decide
- what Codex must not do

### Generated Project / Target Project Acceptance

Generated or target projects should receive native migration assets only when
the manifest and selected workflow mode require them.

1. New project bootstrap remains `FULL_MANAGED_INTENTOS_NATIVE`.
2. Existing project update does not silently overwrite governance assets.
3. Native migration plans can be generated without mutating target files.
4. Applying native governance still requires Unified Apply Plan, Controlled
   Apply Readiness, and Approval Record.

### Verification Commands

Expected final verification:

```bash
node --check scripts/resolve-native-migration.mjs
node --check scripts/check-native-migration.mjs
node scripts/cli.mjs native-migration . --json
node scripts/check-native-migration.mjs .
node scripts/check-workflow-adoption-map.mjs .
node scripts/check-manifest.mjs
node scripts/check-dev-kit.mjs
npm run verify
git diff --check
```

### Example Verification

```bash
node scripts/check-native-migration.mjs examples/1.62-native-first-existing-project/light-web
node scripts/check-native-migration.mjs examples/1.62-native-first-existing-project/governed-admin
node scripts/check-native-migration.mjs examples/1.62-native-first-existing-project/production-maintained
node scripts/check-native-migration.mjs examples/1.62-native-first-existing-project/dirty-worktree
```

### Bad Fixture Verification

Each bad fixture must fail with a clear reason:

```bash
node scripts/check-native-migration.mjs test-fixtures/bad/bad-native-migration-drops-business-rule
node scripts/check-native-migration.mjs test-fixtures/bad/bad-native-migration-direct-agents-overwrite
node scripts/check-native-migration.mjs test-fixtures/bad/bad-native-migration-keeps-split-authority
node scripts/check-native-migration.mjs test-fixtures/bad/bad-native-migration-auto-ci-hook
node scripts/check-native-migration.mjs test-fixtures/bad/bad-native-migration-production-config
node scripts/check-native-migration.mjs test-fixtures/bad/bad-native-migration-no-human-approval
node scripts/check-native-migration.mjs test-fixtures/bad/bad-native-migration-no-restore-plan
node scripts/check-native-migration.mjs test-fixtures/bad/bad-native-migration-approves-implementation
node scripts/check-native-migration.mjs test-fixtures/bad/bad-native-migration-unknown-owner
node scripts/check-native-migration.mjs test-fixtures/bad/bad-native-migration-business-rule-as-workflow-rule
node scripts/check-native-migration.mjs test-fixtures/bad/bad-native-migration-production-control-as-baseline
node scripts/check-native-migration.mjs test-fixtures/bad/bad-native-migration-no-source-excerpt
node scripts/check-native-migration.mjs test-fixtures/bad/bad-native-migration-broad-target-path
node scripts/check-native-migration.mjs test-fixtures/bad/bad-native-migration-no-authority-transition
```

### Release Evidence Acceptance

`releases/1.62.0/` should include:

- `release-record.md`
- `known-limitations.md`
- `self-check-report.md`

The release record must explicitly say:

- IntentOS can become the workflow authority for existing projects.
- IntentOS can recommend replacing old workflow rules.
- IntentOS cannot override business, production, compliance, security, data, or
  release constraints.
- IntentOS native migration remains plan-first and approval-bound.
- 1.62 is Native-First Migration Planning, not Native Migration Apply.
- 1.62 does not add a native migration runner.

## Rollout Plan

### Phase 1: Documentation And Model

- Add core/doc/template/checklist/prompt for Native-First Migration Planning.
- Define postures, authority fields, conflict taxonomy, extracted-rule schema,
  and AGENTS handling.

### Phase 2: Resolver And Checker

- Add `resolve-native-migration.mjs`.
- Add `check-native-migration.mjs`.
- Add CLI routing.
- Update existing workflow adapter outputs to point to Native-First Migration
  Planning when the user requests adoption.
- Keep all writes routed through existing Unified Apply Plan, Controlled Apply
  Readiness, and Approval Record.

### Phase 3: Examples And Bad Fixtures

- Add light, governed, production, and dirty examples.
- Add bad fixtures for unsafe migration.

### Phase 4: Manifest And Verification

- Update manifest, workflow version assets, package scripts, README, reference
  docs, and check-dev-kit.
- Run full verification.

## Success Criteria

1. Existing projects are no longer treated as permanently adapter-only.
2. Codex clearly tells the user that it switched into IntentOS Native-First
   Migration Planning mode.
3. Old workflow rules can be proposed for replacement by IntentOS after
   reviewed migration plan and human approval.
4. Business and production constraints are preserved or escalated.
5. `AGENTS.md` can be migrated into an IntentOS-native entry without silent
   overwrite.
6. `AGENTS.md` migration requires extracted-rule classification, proposed
   replacement shape, and restore plan.
7. The user makes only judgment decisions, not tool-routing decisions.
8. No release, production, CI, hook, secret, migration, data, payment,
   permission, security, compliance, or business behavior change is authorized
   by migration alone.
9. Native-first planning cannot be mistaken for target-file write authority.

## Final Boundary

1.62 makes IntentOS stronger, but not reckless:

```text
Strong on workflow ownership.
Careful on project facts.
Strict on production and high-risk surfaces.
Plan-first for governance replacement.
Human-approved for apply.
```

Short form:

```text
Native-first workflow planning.
Not write-first migration.
```
