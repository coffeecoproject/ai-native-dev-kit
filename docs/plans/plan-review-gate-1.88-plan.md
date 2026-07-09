# Plan Review Gate 1.88 Execution And Acceptance Plan

## Purpose

1.88 should close the gap between "Codex wrote an implementation plan" and
"the plan is safe enough to implement."

Plain-language target:

```text
For important work, writing a plan is not enough.
Codex must review the plan, repair blocking gaps, review it again, and only
then move to implementation review.
```

This phase is based on a real observed failure mode:

```text
Codex correctly decided to write a plan first.
But it did not automatically run a complete plan review.
The user had to ask several times before issues like permission leakage,
historical data guards, and reliable verification commands were found.
```

1.88 should make that review path automatic and enforceable.

## Relationship To Existing Phases

1.83 Task Governance answers:

```text
How risky is this task, and what governance does it require?
```

1.25 Review Surface Governance answers:

```text
What must be reviewed before and after this task?
```

1.84 Work Queue Takeover answers:

```text
Is there a safe current task entry?
```

1.85 Task Governance Consumer Integration answers:

```text
Do execution and completion consumers respect the current Work Queue item and
Task Governance record?
```

1.86 Runtime Hygiene answers:

```text
Can Codex recover safely when Git, push, CI, artifact, bundle, or release
runtime conditions block delivery?
```

1.87 Release Channel Decoupling answers:

```text
Which source/release channel is appropriate, without confusing Git, GitHub
Actions artifact, GitHub Release assets, provider release SOP, and production
deployment?
```

1.88 answers:

```text
Before coding begins, is the implementation plan reviewed, corrected, and
accepted as a pre-implementation prerequisite for this task class?
```

The intended chain is:

```text
Work Queue -> Task Governance
-> Review Surface Analysis
-> Business Rule Closure / Change Impact Coverage / Verification Plan as required
-> Plan Draft
-> Plan Review Gate
-> Implementation Review / Apply Chain
-> Execution Assurance -> Completion Evidence -> Closure / Delivery Status
```

1.88 must not replace Review Surface Governance, Business Rule Closure, Change
Impact Coverage, Verification Plan, Review Loop, Subagent Orchestration,
Execution Assurance, or Approval Records. It coordinates the
pre-implementation plan review gate.

Review Surface Governance remains the source for "what must be reviewed."
Plan Review Gate consumes that result and checks whether the implementation
plan actually covers the required review surfaces.

For `HIGH` and other high-impact task classes, Plan Review Gate must consume
the relevant upstream evidence. It should not review an isolated Markdown plan
without checking the Task Governance source and required Business Rule Closure,
Change Impact Coverage, Verification Plan, or project-native equivalents.

For broad or high-impact review work, Plan Review Gate may recommend read-only
subagent review through Subagent Orchestration. Subagents remain inputs only:
they do not approve the plan, write implementation files, accept risk, or
replace the main thread's final judgment.

## Context Reset

This plan must be executed from repository facts, not conversation memory.

Before implementation, Codex must re-read:

- `README.md`
- `README.zh-CN.md`
- `VERSION.md`
- `package.json`
- `intentos-manifest.json`
- `docs/plans/behavior-complete-existing-project-adoption-1.83-plan.md`
- `docs/plans/existing-project-work-queue-takeover-1.84-plan.md`
- `docs/plans/task-governance-consumer-integration-1.85-plan.md`
- `core/review-surface-governance.md`
- `docs/review-surface-governance.md`
- `templates/review-surface-card.md`
- `scripts/check-review-surface.mjs`
- `scripts/resolve-review-surface.mjs`
- `core/behavior-complete-existing-project-adoption.md`
- `docs/behavior-complete-existing-project-adoption.md`
- `schemas/artifacts/task-governance.schema.json`
- `scripts/check-task-governance.mjs`
- `core/business-rule-closure.md`
- `docs/business-rule-closure.md`
- `core/change-impact-coverage.md`
- `docs/change-impact-coverage.md`
- `core/verification-test-governance.md`
- `docs/verification-test-governance.md`
- `core/review-loop.md`
- `templates/review-loop-report.md`
- `scripts/check-review-loop.mjs`
- `core/subagent-orchestration.md`
- `core/subagent-dispatch-hygiene.md`
- `templates/subagent-run-plan.md`
- `core/execution-assurance-chain.md`
- `docs/execution-assurance-chain.md`
- `templates/task-governance-report.md`
- `templates/business-rule-closure-card.md`
- `templates/change-impact-coverage-report.md`
- `templates/verification-plan.md`
- `scripts/check-intentos.mjs`

Real-project observations such as permission-sensitive draft deletion can be
used as calibration evidence. They must not be hard-coded as WorkControl-only
rules.

## Problem Statement

### Problem 1: Plan Creation Is Treated As Enough

Codex may generate a plan document and then continue directly to code.

That is unsafe for high-impact work.

Plain-language failure:

```text
Codex wrote the plan, but no one checked whether the plan was complete.
```

Required correction:

```text
Plan written != pre-implementation review passed.
Plan review passed != implementation authorized.
```

### Problem 2: Reviews Are Too Dependent On User Prompting

The user should not need to ask:

- "Did you review the plan?"
- "Was the review complete?"
- "Did you check permission edge cases?"
- "Did you check existence leakage?"
- "Did you check historical data?"
- "Did you check stable test commands?"

Codex should trigger plan review automatically when Task Governance indicates
that a plan is required.

### Problem 3: Plan Review Is Not Yet A First-Class Artifact

A plan may exist as a normal Markdown document, but without:

- plan identity;
- plan digest;
- source task binding;
- review status;
- finding severity;
- revision loop;
- pass/fail state;
- implementation authorization boundary.

As a result, downstream implementation can consume an unreviewed or stale plan.

### Problem 4: High-Impact Plans Need Domain-Specific Review Surfaces

Some task classes need specialized review surfaces.

Examples:

- permission semantics;
- data deletion;
- audit sequence;
- existence leakage;
- workflow state transition;
- financial / tax / HR / legal logic;
- settlement / payment / invoice behavior;
- production release behavior;
- migration / rollback;
- public API contract;
- frontend/backend capability consistency.

Codex should not rely on chance to remember these surfaces.

### Problem 5: Verification Commands Can Be Wrong

A plan can include a verification command that looks plausible but does not
actually run the intended test.

Plain-language failure:

```text
The plan says "run this test", but the command may not target the real test or
may not be stable in the project.
```

Plan Review Gate must check that verification commands are:

- project-native;
- stable;
- statically identifiable in the repo or explicitly marked `Unknown` with a
  blocker;
- aligned with the affected behavior;
- not merely aspirational.

Plan Review Gate does not execute those commands. Execution belongs to later
verification and evidence systems.

## Scope

1.88 should add:

- Plan Review Gate protocol;
- plan review report template;
- plan review schema;
- plan review resolver;
- plan review checker;
- examples for low/medium/high plan review;
- permission/data-destructive example;
- bad fixtures for unreviewed plans and incomplete reviews;
- CLI entries;
- self-check coverage;
- release evidence.

## Non-Goals

1.88 must not:

- replace Task Governance;
- replace Business Rule Closure;
- replace Change Impact Coverage;
- replace Verification Plan;
- replace Approval Record;
- approve implementation by itself;
- approve completion;
- approve commit/push;
- approve release/production;
- execute code changes;
- execute migrations;
- create project-specific rules tied only to WorkControl;
- require human users to understand plan review internals.

## Core Rule

For tasks that require an implementation plan:

```text
The implementation phase cannot be treated as ready until Plan Review Gate
reaches PLAN_REVIEW_PASSED and all other required authorities still allow
implementation review.
```

For high-impact tasks:

```text
Plan Review Gate is mandatory.
```

For low-impact tasks:

```text
Plan Review Gate may be skipped only if Task Governance allows lightweight
execution and the skip reason is recorded.
```

Important boundary:

```text
PLAN_REVIEW_PASSED is a prerequisite signal, not implementation authorization.
```

It can satisfy the plan-review prerequisite. It cannot skip:

- Task Governance;
- Approval Record;
- Apply Plan;
- Controlled Apply Readiness;
- project owner approval;
- project-native implementation rules.

## Task Governance Source Of Truth

Task Governance is the task-tier source of truth.

Plan Review Gate must consume:

- Task Governance ref;
- Task Governance digest;
- Task Governance task impact;
- Task Governance task ref;
- whether Task Governance requires a plan review;
- whether the Task Governance record matches the current task.

Plan Review Gate may detect that the plan contains risk signals missing from
the current task classification. In that case it should output:

```text
PLAN_REVIEW_REQUIRED_WITH_TASK_GOVERNANCE_RECHECK
```

or an equivalent blocker that tells Codex to re-run or update Task Governance.
It must not silently become a second task classifier.

Checker requirements:

- reject `HIGH` task reviews without Task Governance ref;
- reject Task Governance digest mismatch;
- reject Task Governance task mismatch;
- reject `NO_PLAN_REQUIRED` unless Task Governance supports the skip;
- reject Plan Review Gate that downgrades a Task Governance-required review.

## Review Surface Analysis Precondition

Review Surface Governance is the review-surface source of truth.

Before a non-trivial plan review, Codex must know which surfaces need review.
That can come from:

- an existing Review Surface Card;
- project-native equivalent review-surface evidence;
- resolver-generated review surface analysis;
- Task Governance plus plan content when no durable card exists.

The user should not need to choose review surfaces.

Plan Review Gate must consume or generate a review-surface matrix that records:

- selected review surface;
- why it is required;
- whether it is required before implementation;
- whether it is required after implementation;
- whether human decision is needed;
- source of the surface decision;
- whether the plan reviewed that surface;
- blocking findings count.

For high-impact tasks, missing review-surface analysis blocks
`PLAN_REVIEW_PASSED`.

Allowed fallback:

```text
If no durable Review Surface Card exists, Plan Review Gate may derive a
temporary review-surface matrix from Task Governance and plan content, but the
report must say the matrix is derived and not a replacement for project-native
review evidence.
```

If project-native governance requires a durable Review Surface Card or
equivalent review-surface artifact, a derived matrix can only produce
`PLAN_REVIEW_REQUIRED` or `PLAN_REVISION_REQUIRED`. It cannot produce
`PLAN_REVIEW_PASSED` unless the missing durable surface artifact is explicitly
accepted by the project authority.

Checker requirements:

- reject high-impact `PLAN_REVIEW_PASSED` with no review-surface matrix;
- reject a required surface marked `reviewed: No`;
- reject a plan that omits a selected high-risk surface;
- reject a report that asks the user to choose technical review surfaces;
- reject a report that treats Review Surface Card as implementation approval.

## Subagent Review Routing

Subagents are optional review helpers, not a required user-facing concept.

Plan Review Gate may recommend read-only subagent review when:

- review-surface count is broad;
- task impact is `HIGH`;
- permission, data, release, security, privacy, or business-rule surfaces are
  selected;
- implementation plan touches multiple platforms or layers;
- an independent reviewer is required by Task Governance or project-native
  governance.

Subagent use must follow Subagent Orchestration:

- many readers, one writer;
- reviewer subagents are read-only;
- subagent output is input, not authority;
- all subagents must be closed or skipped before final response;
- no subagent can approve implementation, release, risk acceptance, or scope
  expansion.

If subagent review is recommended but not available, Plan Review Gate should
fall back to main-thread structured review and record the reason. It must not
pretend independent review happened.

If `plan_review_state` is `PLAN_REVIEW_PASSED` and subagent review was
recommended, the report must show either:

- all launched subagents are `CLOSED` or `SKIPPED`; or
- subagent review was unavailable, a main-thread structured review fallback was
  used, and the fallback reason is recorded.

`Unknown` subagent closure cannot support `PLAN_REVIEW_PASSED`.

## Document Review vs Task Review

Plan Review Gate must distinguish two review targets:

```text
Document review: Is the plan document complete, bounded, sourced, and safe to
use as an implementation input?

Task review: Does the actual task, impact, risk, implementation path, and
verification chain satisfy the governance required for this task?
```

Both may be required.

Document review checks:

- plan identity and digest;
- task binding;
- source-chain references;
- missing sections;
- contradictions;
- unsupported claims;
- accidental implementation authorization;
- stale examples treated as rules;
- fake or unstable verification commands;
- user-facing clarity.

Task review checks:

- task impact from Task Governance;
- selected review surfaces;
- business-rule completeness;
- affected surface coverage;
- verification obligations;
- permission, data, release, security, privacy, or production risk;
- project-native authority conflicts;
- whether the plan can proceed to implementation review.

For high-impact tasks, a plan cannot pass because the Markdown document is
well-written. It must also pass task review against Task Governance, Review
Surface Analysis, and required source-chain evidence.

## Task Classes Requiring Plan Review

Plan Review Gate is required when any of these are true:

- Task Governance impact is `HIGH`;
- Task Governance impact is `POSSIBLE_HIGH`;
- task requires Business Rule Closure;
- task requires Change Impact Coverage;
- task requires Execution Plan;
- task requires Verification Plan;
- task modifies permissions or authorization;
- task deletes or hides data;
- task changes audit behavior;
- task changes workflow state;
- task changes settlement, payment, finance, tax, HR, legal, or compliance behavior;
- task changes public API contract;
- task changes DB schema, migrations, or persistence rules;
- task changes production release path;
- task creates irreversible user-facing behavior.

## Plan Review States

Plan Review Gate should use these states:

| State | Meaning |
| --- | --- |
| `NO_PLAN_REQUIRED` | Task is low risk and Task Governance permits lightweight execution |
| `PLAN_REQUIRED` | A plan is required but not found |
| `PLAN_DRAFTED` | A plan exists but has not been reviewed |
| `PLAN_REVIEW_REQUIRED` | Review must run before implementation |
| `PLAN_REVISION_REQUIRED` | Review found P0/P1 findings that must be fixed |
| `PLAN_REVIEW_PASSED` | Plan passed required review |
| `BLOCKED_BY_STALE_PLAN` | Plan digest or source task no longer matches |
| `BLOCKED_BY_INCOMPLETE_REVIEW` | Review omitted required surfaces |
| `BLOCKED_BY_USER_DECISION` | A real user/business owner decision is missing |
| `BLOCKED_BY_REPEATED_PLAN_REVIEW_FAILURE` | Plan review failed after the allowed automatic review/repair rounds |
| `PLAN_REVIEW_REQUIRED_WITH_TASK_GOVERNANCE_RECHECK` | The plan contains risk signals that require Task Governance to be rechecked |

## Finding Severity

Findings should use:

| Severity | Meaning | Implementation allowed? |
| --- | --- | --- |
| `P0` | Unsafe, contradictory, or unauthorized plan | No |
| `P1` | Required before implementation | No |
| `P2` | Should be fixed or explicitly accepted before implementation | Usually no for high-impact tasks |
| `P3` | Non-blocking improvement | Yes if recorded |

Required behavior:

- Any `P0` blocks implementation.
- Any `P1` blocks implementation.
- `P2` blocks high-impact tasks unless explicitly accepted with a reason.
- `P3` does not block but must be recorded.

For `P2` acceptance, an unstructured "accepted: yes" is not enough.

Accepted P2 findings must include:

- human decision ref;
- acceptance reason;
- acceptance scope;
- expiry or revisit condition;
- task impact for which the acceptance applies.

Codex cannot accept a blocking P2 on behalf of the user or domain owner.

## Required Source Chain

Plan Review Gate should not review high-impact plans as isolated Markdown.

When Task Governance requires upstream evidence, the review report must include
a source chain.

Required source chain examples:

| Task class | Required source or project-native equivalent |
| --- | --- |
| Business behavior | Business Rule Closure |
| Affected surfaces | Change Impact Coverage |
| Verification obligations | Verification Plan / Verification Test Governance |
| Permission or authorization | Task Governance + Business Rule Closure + project-native permission model |
| Data-destructive action | Business Rule Closure + Change Impact Coverage + Verification Plan |
| API contract | Change Impact Coverage + Verification Plan |
| Release or production behavior | Release Evidence / Release Plan source, as applicable |

Each source-chain entry should record:

- source kind;
- source ref;
- source digest;
- source state;
- current task match;
- whether a project-native equivalent is used;
- owner or authority when project-native evidence is used.

Checker requirements:

- `HIGH` plan review must reject missing required source-chain entries;
- missing source may be satisfied only by a project-native equivalent with
  digest, owner, scope, and current-task match;
- source digest mismatch blocks `PLAN_REVIEW_PASSED`;
- stale source state blocks `PLAN_REVIEW_PASSED`;
- a plan cannot pass review if it contradicts its source chain.

## Review Loop

Plan Review Gate should run:

```text
Draft plan
-> Review plan
-> If P0/P1/P2 blocking findings exist, revise plan
-> Re-run review
-> Produce PLAN_REVIEW_PASSED or BLOCKED state
```

Maximum automatic review/repair rounds:

```text
2
```

After two failed rounds:

```text
BLOCKED_BY_REPEATED_PLAN_REVIEW_FAILURE
```

Plain-language output:

```text
The plan is not ready to implement yet. I found required gaps and will revise
the plan before writing code.
```

## Review Loop Write Boundary

Plan Review Gate is read-only by default.

It should output:

- findings;
- required plan changes;
- proposed revised plan patch;
- optional revised plan draft path.

It should not directly rewrite the original implementation plan by default.

If a future implementation supports writing a revised plan, it must require an
explicit output path such as:

```text
--revised-plan-out <relative path>
```

That path must:

- stay inside the target project;
- stay inside `plan-review-revisions/`, `docs/plans/`, or another explicitly
  allowed documentation directory;
- not edit implementation files;
- not edit project authority files;
- not approve implementation.

The safest `1.88.0` implementation is:

```text
review report + recommended plan patch only
```

## Required Review Surfaces

### Universal Surfaces

Every plan review must check:

- source task identity;
- current Work Queue item, if present;
- Task Governance tier;
- plan digest;
- plan scope;
- excluded surfaces;
- implementation boundaries;
- verification commands;
- rollback or recovery expectations;
- whether plan authorizes implementation.

### Permission-Sensitive Surfaces

When permissions or authorization are involved, review must check:

- permission key;
- scope (`OWN`, `ALL`, project-specific scopes);
- actor roles vs permission grants;
- system/admin role separation;
- frontend capability source;
- backend authority;
- existence leakage;
- error-return priority;
- negative cases;
- audit sequence;
- project-native permission model.

### Data-Destructive Surfaces

When deletion, archival, hiding, or destructive mutation is involved, review
must check:

- allowed lifecycle states;
- owner vs elevated actor rules;
- workflow history;
- settlement/payment/submission history;
- import/batch history;
- schedule/background job references;
- concurrent edit behavior;
- audit before delete;
- DB restrict / cascade / set-null behavior;
- rollback limitations;
- production data safety.

### Business Rule Surfaces

When business behavior changes, review must check:

- actor;
- trigger;
- allowed state;
- blocked state;
- exception policy;
- historical data behavior;
- effective time;
- real-environment validation;
- domain owner decision if policy is ambiguous.

### Frontend / Backend Consistency

When UI and API behavior both matter, review must check:

- frontend uses backend capability flags where required;
- frontend does not recreate permission logic independently;
- API response shape is stable;
- list/detail/actions remain consistent;
- hidden button does not imply missing backend guard;
- backend remains authoritative.

### Verification Surfaces

Every plan review must check:

- stable project-native commands;
- positive tests;
- negative tests;
- regression tests;
- role/permission matrix where applicable;
- real code path coverage;
- whether command selection is known to work in the repo;
- whether command is too narrow or fake-targeted.

## Example: Permission + Draft Record Deletion

The observed class:

```text
record.lifecycle.manage:ALL can delete any eligible draft record.
record.write:OWN can still delete only own eligible draft record.
platform_admin does not gain business delete permission unless the project
explicitly grants that business capability.
```

Plan Review Gate should require the plan to cover:

- `record.write:OWN` own draft behavior;
- `record.lifecycle.manage:ALL` any draft behavior;
- platform/admin non-business-authority boundary;
- ordinary user deleting another user's draft returns non-existence style result
  where project policy requires existence protection;
- non-draft cannot be deleted;
- draft with workflow history cannot be deleted;
- draft with payment/settlement/submission history cannot be deleted;
- workflow schedule / settlement references are guarded or mapped to controlled
  domain errors;
- audit record is written before deletion;
- frontend button uses backend capability;
- stable tests exist for all role and lifecycle cases.

This example must remain generic. The protocol should apply to any
permission-sensitive or data-destructive task, not only contract drafts.

## Proposed Assets

Add:

- `core/plan-review-gate.md`
- `docs/plan-review-gate.md`
- `templates/plan-review-report.md`
- `schemas/artifacts/plan-review.schema.json`
- `checklists/plan-review-gate-review.md`
- `prompts/plan-review-gate-agent.md`
- `plan-review-reports/.gitkeep`
- `scripts/resolve-plan-review.mjs`
- `scripts/check-plan-review.mjs`
- `releases/1.88.0/release-record.md`
- `releases/1.88.0/known-limitations.md`
- `releases/1.88.0/self-check-report.md`

Add CLI entries:

```text
plan-review
plan-review-check
```

Candidate commands:

```bash
node scripts/cli.mjs plan-review . --plan docs/example-plan.md --intent "change permission-sensitive behavior"
node scripts/cli.mjs plan-review-check . --allow-empty
```

## Plan Review Report Schema

The machine-readable evidence should include:

```json
{
  "schema_version": "1.88.0",
  "artifact_type": "plan_review",
  "plan_review_ref": "plan-review-reports/generated.md",
  "plan_review_digest": "sha256:<64 hex>",
  "task_ref": "task:<id>",
  "work_queue_item_ref": "<ref or N/A>",
  "work_queue_item_digest": "<sha256 or N/A>",
  "review_surface_analysis": {
    "ref": "artifact:review-surface-cards/001.md",
    "digest": "sha256:<64 hex>",
    "source": "review_surface_card",
    "derived_by_plan_review": "No",
    "current_task_match": "Yes",
    "user_selected_surfaces": "No"
  },
  "task_governance": {
    "ref": "artifact:task-governance-reports/001.md",
    "digest": "sha256:<64 hex>",
    "task_ref": "task:<id>",
    "task_impact": "HIGH",
    "plan_review_required": "Yes",
    "current_task_match": "Yes"
  },
  "source_chain": [
    {
      "source_kind": "business_rule_closure",
      "source_ref": "artifact:business-rule-closures/001.md",
      "source_digest": "sha256:<64 hex>",
      "source_state": "READY_FOR_IMPACT_COVERAGE",
      "current_task_match": "Yes",
      "project_native_equivalent": "No",
      "owner": "domain-owner"
    },
    {
      "source_kind": "change_impact_coverage",
      "source_ref": "artifact:change-impact-coverage-reports/001.md",
      "source_digest": "sha256:<64 hex>",
      "source_state": "READY",
      "current_task_match": "Yes",
      "project_native_equivalent": "No",
      "owner": "codex"
    },
    {
      "source_kind": "verification_plan",
      "source_ref": "artifact:verification-plans/001.md",
      "source_digest": "sha256:<64 hex>",
      "source_state": "VERIFICATION_PLAN_READY",
      "current_task_match": "Yes",
      "project_native_equivalent": "No",
      "owner": "codex"
    }
  ],
  "plan_ref": "<plan path>",
  "plan_digest": "sha256:<64 hex>",
  "plan_task_match": "Yes|No|Unknown",
  "plan_review_state": "PLAN_REVIEW_PASSED",
  "pre_implementation_review_prerequisite_satisfied": "Yes",
  "ready_for_implementation_review": "Yes",
  "implementation_authorized_by_this_report": "No",
  "implementation_allowed_by_full_authority": "Unknown",
  "task_impact": "LOW|MEDIUM|POSSIBLE_HIGH|HIGH|Unknown",
  "skip_review": {
    "skip_allowed": "No",
    "skip_source": "task_governance",
    "skip_reason": "N/A",
    "task_impact": "HIGH"
  },
  "required_review_surfaces": [
    "permission",
    "data_destructive",
    "business_rule",
    "verification"
  ],
  "review_surface_matrix": [
    {
      "surface": "permission",
      "required": "Yes",
      "required_before_implementation": "Yes",
      "required_after_implementation": "Yes",
      "reviewed": "Yes",
      "source": "review_surface_card|task_governance|plan_content|business_rule_closure",
      "human_decision_needed": "Yes",
      "finding_count": 1,
      "blocking": "Yes"
    }
  ],
  "subagent_review_routing": {
    "subagent_review_recommended": "Yes",
    "reason": "HIGH task with permission and data-destructive surfaces.",
    "run_plan_required": "Yes",
    "run_plan_ref": "artifact:subagent-run-plans/001.md",
    "all_subagents_read_only": "Yes",
    "subagent_output_is_authority": "No",
    "all_subagents_closed_or_skipped": "Unknown"
  },
  "reviewed_surfaces": [
    {
      "surface": "permission",
      "reviewed": "Yes",
      "finding_count": 0,
      "notes": "Permission scope and backend authority are covered."
    }
  ],
  "findings": [
    {
      "id": "P1-001",
      "severity": "P1",
      "surface": "permission",
      "summary": "Ordinary users deleting another user's draft must not receive state-specific errors.",
      "required_action": "Specify 404/non-existence style behavior before lifecycle checks for unauthorized actors.",
      "resolved": "No",
      "accepted": "No",
      "accepted_by_ref": "N/A",
      "acceptance_reason": "N/A",
      "acceptance_scope": "N/A",
      "expires_at": "N/A",
      "allowed_for_task_impact": "N/A"
    }
  ],
  "revision_loop": {
    "round": 1,
    "max_auto_rounds": 2,
    "requires_revision": "Yes",
    "previous_plan_digest": "sha256:<64 hex or N/A>"
  },
  "verification_command_review": {
    "commands_reviewed": "Yes",
    "commands_exist_in_project": "Yes|No|Unknown",
    "commands_are_project_native": "Yes|No|Unknown",
    "commands_target_required_behavior": "Yes|No|Unknown",
    "commands_executed_by_this_report": "No",
    "requires_test_evidence_later": "Yes",
    "fake_or_unstable_command_found": "Yes|No",
    "notes": "<notes>"
  },
  "plain_user_summary": "The plan is not ready yet. I found required permission-rule gaps and will revise the plan before coding.",
  "plain_next_step": "I will update the plan, run the plan review again, and only then move to implementation review.",
  "technical_terms_required": "No",
  "boundaries": {
    "writes_target_files": "No",
    "authorizes_implementation": "No",
    "approves_commit_or_push": "No",
    "approves_release_or_production": "No",
    "executes_tests": "No",
    "changes_production": "No"
  },
  "outcome": "PLAN_REVISION_REQUIRED"
}
```

For `NO_PLAN_REQUIRED`:

```json
{
  "plan_review_state": "NO_PLAN_REQUIRED",
  "plan_ref": "N/A",
  "plan_digest": "N/A",
  "skip_review": {
    "skip_allowed": "Yes",
    "skip_source": "task_governance",
    "skip_reason": "<structured reason>",
    "task_impact": "LOW"
  },
  "implementation_authorized_by_this_report": "No"
}
```

Do not invent a fake plan ref or fake digest for a skipped plan.

Important boundary:

```text
Even PLAN_REVIEW_PASSED does not implement code by itself.
It only allows the implementation phase to start if Task Governance and
project authority also allow it.
```

## Resolver Behavior

`resolve-plan-review.mjs` should:

- read a plan file;
- consume an existing Review Surface Card when available;
- derive a temporary review-surface matrix when no durable card exists;
- mark derived review-surface analysis as derived, not project authority;
- read Task Governance evidence when required by task impact or provided by the
  caller;
- treat Task Governance as the task-impact source of truth;
- refuse to silently reclassify task impact inside Plan Review Gate;
- emit `PLAN_REVIEW_REQUIRED_WITH_TASK_GOVERNANCE_RECHECK` when the plan reveals
  risk signals not represented in Task Governance;
- read Business Rule Closure, Change Impact Coverage, Verification Plan, or
  project-native equivalents when required by Task Governance or plan content;
- infer required review surfaces from task impact and plan content;
- scan for permission/data-destructive/business-rule/release/verification risks;
- output a review report;
- output findings and a recommended plan patch instead of rewriting the source
  implementation plan by default;
- recommend read-only subagent review when task impact and selected surfaces
  make independent review useful;
- never write target implementation files;
- never mutate source Task Governance, Business Rule Closure, Change Impact
  Coverage, Verification Plan, or project-native evidence;
- never approve implementation by itself;
- keep user-facing summary plain.

Suggested flags:

```text
--plan
--intent
--task-governance
--work-queue-item
--mode draft|review|rereview
--out
--json
--source
--revised-plan-out
```

`--out` must:

- be relative to the target project;
- stay under `plan-review-reports/*.md` unless a project-native report
  directory is explicitly configured;
- reject absolute paths;
- reject `..` path traversal;
- reject writes to implementation files, authority files, CI, release,
  production, or runtime configuration.

`--revised-plan-out` is reserved for an explicit future write mode. If enabled,
it must write only to an approved documentation path and must not edit the
original plan or implementation files.

## Checker Behavior

`check-plan-review.mjs` should reject:

- high-impact plan with no review report;
- plan review report that authorizes implementation;
- `PLAN_REVIEW_PASSED` that lacks
  `pre_implementation_review_prerequisite_satisfied: Yes`;
- `PLAN_REVIEW_PASSED` that claims `implementation_authorized_by_this_report`
  is `Yes`;
- `PLAN_REVIEW_PASSED` that claims full implementation authority while upstream
  authorities remain unknown;
- high-impact plan review without a Task Governance ref;
- high-impact plan review without Review Surface Card, project-native
  equivalent, or derived review-surface matrix;
- Task Governance digest mismatch;
- Task Governance task mismatch;
- plan review report that downgrades or overrides Task Governance task impact;
- `NO_PLAN_REQUIRED` without Task Governance `LOW` or equivalent lightweight
  skip authority;
- `NO_PLAN_REQUIRED` without a structured skip reason;
- high-impact plan review without required source-chain entries;
- source-chain digest mismatch;
- stale source-chain entry;
- source-chain contradiction with the implementation plan;
- unresolved P0/P1 findings with `PLAN_REVIEW_PASSED`;
- unresolved blocking P2 findings without structured human acceptance;
- P2 acceptance claimed by Codex instead of a human or domain-owner decision ref;
- missing required review surfaces;
- missing `review_surface_matrix`;
- required review surface marked as not reviewed;
- report that asks the user to choose technical review surfaces;
- report that treats Review Surface Card as implementation approval;
- subagent review routing that treats subagent output as authority;
- subagent review routing with writer subagents for plan review;
- subagent review routing that leaves known launched subagents unclosed;
- stale plan digest;
- plan/task mismatch;
- missing verification command review;
- verification command review that claims commands were executed by this report;
- verification command review that does not distinguish command existence,
  project-native command selection, behavior targeting, and future test evidence;
- permission-sensitive plan without existence leakage and error priority review;
- data-destructive plan without historical association and audit review;
- frontend/backend plan without backend authority and capability source review;
- user-facing output that exposes internal workflow burden;
- review-loop output that rewrites the original plan without an explicit allowed
  revised-plan path;
- repeated review failures without
  `BLOCKED_BY_REPEATED_PLAN_REVIEW_FAILURE`.

## Examples

Add positive examples:

- `examples/1.88-plan-review-gate/low-docs-plan-skip`
  - Task Governance allows no plan review;
  - skip reason recorded;
  - `NO_PLAN_REQUIRED` is backed by Task Governance `LOW` or equivalent
    lightweight authority.

- `examples/1.88-plan-review-gate/medium-ui-plan-reviewed`
  - localized UI/API behavior;
  - targeted surfaces reviewed;
  - no high-impact surfaces.

- `examples/1.88-plan-review-gate/high-permission-delete-plan-revision`
  - permission/data deletion plan;
  - first review finds P1/P2 issues;
  - revision required.

- `examples/1.88-plan-review-gate/high-permission-delete-plan-passed`
  - revised plan;
  - Task Governance, source chain, and review surface matrix are present;
  - all required surfaces reviewed;
  - implementation still not authorized by the report itself.

- `examples/1.88-plan-review-gate/high-business-rule-plan-stale`
  - plan digest mismatch blocks implementation.

Add bad fixtures:

- `bad-plan-review-high-without-review`
- `bad-plan-review-high-without-review-surface-analysis`
- `bad-plan-review-high-without-task-governance`
- `bad-plan-review-task-governance-digest-mismatch`
- `bad-plan-review-task-governance-task-mismatch`
- `bad-plan-review-downgrades-task-governance`
- `bad-plan-review-no-plan-required-without-task-governance-low`
- `bad-plan-review-authorizes-implementation`
- `bad-plan-review-passed-without-prerequisite-satisfied`
- `bad-plan-review-passed-claims-full-authority`
- `bad-plan-review-unresolved-p1-passed`
- `bad-plan-review-unstructured-p2-acceptance`
- `bad-plan-review-codex-accepted-p2`
- `bad-plan-review-missing-permission-surface`
- `bad-plan-review-missing-review-surface-matrix`
- `bad-plan-review-required-surface-not-reviewed`
- `bad-plan-review-user-asked-to-pick-technical-surfaces`
- `bad-plan-review-surface-card-treated-as-approval`
- `bad-plan-review-subagent-output-treated-as-authority`
- `bad-plan-review-subagent-writer-used-for-review`
- `bad-plan-review-subagent-left-running`
- `bad-plan-review-missing-source-chain`
- `bad-plan-review-source-chain-digest-mismatch`
- `bad-plan-review-source-chain-contradiction`
- `bad-plan-review-missing-existence-leakage`
- `bad-plan-review-missing-data-history-guards`
- `bad-plan-review-missing-audit-before-delete`
- `bad-plan-review-frontend-reimplements-permission`
- `bad-plan-review-fake-test-command`
- `bad-plan-review-claims-test-executed`
- `bad-plan-review-stale-plan-digest`
- `bad-plan-review-rewrites-original-plan`
- `bad-plan-review-repeated-failure-not-blocked`
- `bad-plan-review-technical-user-burden`

## Implementation Plan

### Step 1: Define Core Protocol

Create:

- `core/plan-review-gate.md`
- `docs/plan-review-gate.md`

Must include:

- state model;
- severity model;
- required surfaces;
- review loop;
- user-facing output boundary;
- non-authorizing boundary.

### Step 2: Add Template And Schema

Create:

- `templates/plan-review-report.md`
- `schemas/artifacts/plan-review.schema.json`

The schema must require:

- plan ref and digest;
- source task binding;
- review-surface analysis binding or derived matrix flag;
- Task Governance binding object;
- source chain for high-impact tasks;
- review state;
- pre-implementation prerequisite signal;
- explicit non-authorization fields;
- reviewed surfaces;
- review surface matrix;
- subagent review routing when independent review is recommended;
- findings;
- structured P2 acceptance fields;
- revision loop;
- verification command review;
- static command review fields that do not claim test execution;
- skip-review object for `NO_PLAN_REQUIRED`;
- plain user summary;
- non-authorizing boundaries.

### Step 3: Add Resolver

Create:

- `scripts/resolve-plan-review.mjs`

It should produce review reports from plan documents and optional Task
Governance / Work Queue sources.

For high-impact work, Task Governance and source-chain evidence are not
optional. The resolver may still produce a report without them, but that report
must be blocked and must not pass.

For high-impact work, review-surface analysis is also not optional. If no
durable Review Surface Card or project-native equivalent exists, the resolver
must derive a temporary matrix and mark it as derived evidence.

### Step 4: Add Checker

Create:

- `scripts/check-plan-review.mjs`

It should enforce required review surfaces and reject unsafe pass states.

It should also enforce that Plan Review Gate remains a pre-implementation
review prerequisite and never becomes implementation authority.

### Step 5: Add CLI

Update `scripts/cli.mjs`:

```text
plan-review
plan-review-check
```

CLI help should describe it plainly:

```text
Review an implementation plan before coding, especially for permission,
data-destructive, workflow, or business-rule changes.
```

### Step 6: Add Examples And Fixtures

Add the example and bad-fixture sets listed above.

### Step 7: Integrate Self-Check

Update:

- `scripts/check-intentos.mjs`;
- `package.json` verify scripts;
- `intentos-manifest.json`;
- `docs/plans/README.md`;
- `README.md`;
- `README.zh-CN.md`;
- `VERSION.md`;
- `templates/version-record.md`;
- `templates/workflow-version.json`.

### Step 8: Release Evidence

Create:

- `releases/1.88.0/release-record.md`
- `releases/1.88.0/known-limitations.md`
- `releases/1.88.0/self-check-report.md`

Release record must state:

- 1.88 adds Plan Review Gate;
- 1.88 is non-authorizing;
- plan review pass does not itself implement code;
- unresolved P0/P1 findings block implementation;
- users should receive plain summaries, not internal review mechanics.

## Acceptance Plan

### Syntax

```bash
node --check scripts/resolve-plan-review.mjs
node --check scripts/check-plan-review.mjs
node --check scripts/check-intentos.mjs
```

### Positive Checks

```bash
node scripts/check-plan-review.mjs examples/1.88-plan-review-gate/low-docs-plan-skip --require-structured-evidence
node scripts/check-plan-review.mjs examples/1.88-plan-review-gate/medium-ui-plan-reviewed --require-structured-evidence
node scripts/check-plan-review.mjs examples/1.88-plan-review-gate/high-permission-delete-plan-revision --require-structured-evidence
node scripts/check-plan-review.mjs examples/1.88-plan-review-gate/high-permission-delete-plan-passed --require-structured-evidence
node scripts/check-plan-review.mjs examples/1.88-plan-review-gate/high-business-rule-plan-stale --require-structured-evidence
```

Positive checks must prove:

- low-risk skip is backed by Task Governance and a structured skip reason;
- high-impact pass includes Task Governance binding;
- high-impact pass includes required source-chain entries;
- high-impact pass includes review surface matrix coverage;
- `PLAN_REVIEW_PASSED` only satisfies the pre-implementation review
  prerequisite;
- the report does not authorize implementation, commit, push, or release.

### Negative Checks

Each bad fixture must fail:

```bash
node scripts/check-plan-review.mjs test-fixtures/bad/bad-plan-review-high-without-review --require-structured-evidence
node scripts/check-plan-review.mjs test-fixtures/bad/bad-plan-review-high-without-review-surface-analysis --require-structured-evidence
node scripts/check-plan-review.mjs test-fixtures/bad/bad-plan-review-high-without-task-governance --require-structured-evidence
node scripts/check-plan-review.mjs test-fixtures/bad/bad-plan-review-task-governance-digest-mismatch --require-structured-evidence
node scripts/check-plan-review.mjs test-fixtures/bad/bad-plan-review-task-governance-task-mismatch --require-structured-evidence
node scripts/check-plan-review.mjs test-fixtures/bad/bad-plan-review-downgrades-task-governance --require-structured-evidence
node scripts/check-plan-review.mjs test-fixtures/bad/bad-plan-review-no-plan-required-without-task-governance-low --require-structured-evidence
node scripts/check-plan-review.mjs test-fixtures/bad/bad-plan-review-authorizes-implementation --require-structured-evidence
node scripts/check-plan-review.mjs test-fixtures/bad/bad-plan-review-passed-without-prerequisite-satisfied --require-structured-evidence
node scripts/check-plan-review.mjs test-fixtures/bad/bad-plan-review-passed-claims-full-authority --require-structured-evidence
node scripts/check-plan-review.mjs test-fixtures/bad/bad-plan-review-unresolved-p1-passed --require-structured-evidence
node scripts/check-plan-review.mjs test-fixtures/bad/bad-plan-review-unstructured-p2-acceptance --require-structured-evidence
node scripts/check-plan-review.mjs test-fixtures/bad/bad-plan-review-codex-accepted-p2 --require-structured-evidence
node scripts/check-plan-review.mjs test-fixtures/bad/bad-plan-review-missing-permission-surface --require-structured-evidence
node scripts/check-plan-review.mjs test-fixtures/bad/bad-plan-review-missing-review-surface-matrix --require-structured-evidence
node scripts/check-plan-review.mjs test-fixtures/bad/bad-plan-review-required-surface-not-reviewed --require-structured-evidence
node scripts/check-plan-review.mjs test-fixtures/bad/bad-plan-review-user-asked-to-pick-technical-surfaces --require-structured-evidence
node scripts/check-plan-review.mjs test-fixtures/bad/bad-plan-review-surface-card-treated-as-approval --require-structured-evidence
node scripts/check-plan-review.mjs test-fixtures/bad/bad-plan-review-subagent-output-treated-as-authority --require-structured-evidence
node scripts/check-plan-review.mjs test-fixtures/bad/bad-plan-review-subagent-writer-used-for-review --require-structured-evidence
node scripts/check-plan-review.mjs test-fixtures/bad/bad-plan-review-subagent-left-running --require-structured-evidence
node scripts/check-plan-review.mjs test-fixtures/bad/bad-plan-review-missing-source-chain --require-structured-evidence
node scripts/check-plan-review.mjs test-fixtures/bad/bad-plan-review-source-chain-digest-mismatch --require-structured-evidence
node scripts/check-plan-review.mjs test-fixtures/bad/bad-plan-review-source-chain-contradiction --require-structured-evidence
node scripts/check-plan-review.mjs test-fixtures/bad/bad-plan-review-missing-existence-leakage --require-structured-evidence
node scripts/check-plan-review.mjs test-fixtures/bad/bad-plan-review-missing-data-history-guards --require-structured-evidence
node scripts/check-plan-review.mjs test-fixtures/bad/bad-plan-review-missing-audit-before-delete --require-structured-evidence
node scripts/check-plan-review.mjs test-fixtures/bad/bad-plan-review-frontend-reimplements-permission --require-structured-evidence
node scripts/check-plan-review.mjs test-fixtures/bad/bad-plan-review-fake-test-command --require-structured-evidence
node scripts/check-plan-review.mjs test-fixtures/bad/bad-plan-review-claims-test-executed --require-structured-evidence
node scripts/check-plan-review.mjs test-fixtures/bad/bad-plan-review-stale-plan-digest --require-structured-evidence
node scripts/check-plan-review.mjs test-fixtures/bad/bad-plan-review-rewrites-original-plan --require-structured-evidence
node scripts/check-plan-review.mjs test-fixtures/bad/bad-plan-review-repeated-failure-not-blocked --require-structured-evidence
node scripts/check-plan-review.mjs test-fixtures/bad/bad-plan-review-technical-user-burden --require-structured-evidence
```

Negative checks must prove the checker rejects:

- Plan Review Gate acting as a second task classifier;
- `PLAN_REVIEW_PASSED` acting as implementation authorization;
- `NO_PLAN_REQUIRED` created without Task Governance support;
- missing review-surface analysis for high-impact tasks;
- user-facing output that asks the user to select technical review surfaces;
- fake or merely aspirational verification commands;
- claims that tests were executed by the plan-review report;
- high-impact plan reviews without source-chain evidence;
- unstructured P2 acceptance;
- plan-review loops that rewrite the original plan by default.

### CLI Checks

```bash
node scripts/cli.mjs plan-review . --plan docs/example-plan.md --intent "change permission behavior"
node scripts/cli.mjs plan-review-check . --allow-empty
```

### Full Checks

```bash
npm run verify:syntax
npm run verify:release
git diff --check
```

## Review Plan For 1.88 Implementation

Before releasing 1.88, perform a static review focused on:

- high-impact tasks cannot enter implementation from an unreviewed plan;
- high-impact tasks cannot pass without Task Governance binding;
- high-impact tasks cannot pass without review-surface analysis;
- high-impact tasks cannot pass without required source-chain evidence;
- Plan Review Gate does not authorize implementation by itself;
- Plan Review Gate does not reclassify task impact by itself;
- `NO_PLAN_REQUIRED` is only possible through Task Governance-backed
  lightweight execution;
- permission-sensitive and data-destructive surfaces are explicit;
- review surface matrix covers all required surfaces;
- review surface selection is AI-owned and does not ask the user to pick
  technical surfaces;
- subagent review is read-only, input-only, and closed/skipped before final
  response when used;
- structured P2 acceptance requires a real human or domain-owner decision ref;
- existence leakage and error-return priority are first-class checks;
- verification command review rejects fake or unstable commands;
- verification command review does not claim tests were executed;
- stale plan digests block implementation;
- review loop output does not rewrite the original plan by default;
- users are shown a plain summary and next step;
- technical findings remain available for reviewers.

## User Experience Target

For an unreviewed high-impact plan:

```text
I wrote the plan, but this task affects permissions and deletion. I need to
review the plan before coding.
```

For a plan with blocking findings:

```text
The plan is not ready yet. I found 3 issues that must be fixed before coding:
who can see deletion errors, how historical records are guarded, and which
stable tests prove the rule.
```

For a reviewed and revised plan:

```text
The plan review passed. I can now move to implementation review under the
approved scope. If implementation is already authorized by the project workflow,
I can implement within that scope. The review itself still does not approve code
changes, commit, push, or release.
```

## Completion Definition

1.88 is complete when:

- Plan Review Gate protocol exists;
- resolver and checker exist;
- CLI entries exist;
- plan-review schema exists;
- Task Governance binding is enforced;
- Review Surface Governance is consumed or a derived matrix is recorded;
- source-chain evidence is enforced for high-impact plans;
- `NO_PLAN_REQUIRED` requires Task Governance-backed skip evidence;
- `PLAN_REVIEW_PASSED` is limited to pre-implementation prerequisite status;
- high-impact unreviewed plans are rejected;
- unresolved P0/P1 findings are rejected;
- unstructured or Codex-accepted P2 findings are rejected where they block;
- review surface matrix is required and checked;
- subagent review routing remains optional, read-only, and input-only;
- permission/data-destructive plan examples are covered;
- fake verification command examples are rejected;
- plan-review reports cannot claim test execution;
- review-loop reports cannot rewrite original plans by default;
- `check-intentos` covers 1.88 assets and fixtures;
- release evidence exists;
- full release verification passes.

## What 1.88 Does Not Mean

1.88 does not mean:

- every task needs a heavy plan review;
- Codex can approve implementation by writing a review report;
- Plan Review Gate can reclassify task impact independently of Task Governance;
- `PLAN_REVIEW_PASSED` means implementation is authorized;
- `NO_PLAN_REQUIRED` can be decided by Plan Review Gate alone;
- Plan Review Gate executes tests;
- Plan Review Gate rewrites the original implementation plan by default;
- Plan Review Gate replaces Review Surface Governance;
- users must choose technical review surfaces;
- subagent reviewer output becomes authority;
- subagents can remain running after review handoff;
- plan review replaces business owner decisions;
- plan review replaces tests;
- plan review replaces completion evidence;
- plan review approves commit/push/release;
- project-specific rules are hard-coded into IntentOS.

1.88 means:

```text
When a task needs an implementation plan, Codex must treat that plan as a
reviewable artifact. High-impact work cannot proceed from "plan written" to
"code implementation" until the plan has been reviewed, repaired when needed,
and passed the required gate.
```
