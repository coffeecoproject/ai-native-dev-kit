# Adoption Execution Assurance 1.71 Plan

## Purpose

1.71 should solve the next old-project problem:

```text
Codex says an existing project has adopted IntentOS,
but the adoption may be incomplete, only documented, or not actually used.
```

The goal is not to add another narrative report. The goal is to make existing-project adoption verifiable from project reality:

- real files;
- real git diff;
- real workflow artifacts;
- real checker results;
- real rule comparison coverage;
- real simulated task behavior.

The expected outcome is:

```text
Old-project IntentOS adoption can be claimed only when adoption surfaces are checked,
evidence is bound to project state, and a simulated task proves Codex follows IntentOS.
```

## Context Reset

This plan must be executed from repository facts, not conversation memory.

Before implementation, Codex must re-read:

- `README.md`
- `README.zh-CN.md`
- `VERSION.md`
- `package.json`
- `intentos-manifest.json`
- `docs/for-existing-projects.md`
- `docs/existing-project-workflow-adapter.md`
- `docs/native-first-existing-project-migration.md`
- `docs/existing-rule-reconciliation.md`
- `docs/existing-project-governance-convergence.md`
- `docs/unified-apply-plan.md`
- `docs/controlled-apply-readiness.md`
- `docs/approval-record-governance.md`
- `docs/work-queue.md`
- `docs/change-impact-coverage.md`
- `docs/unified-closure-model.md`
- `scripts/workflow-next.mjs`
- `scripts/resolve-native-migration.mjs`
- `scripts/resolve-existing-rule-reconciliation.mjs`
- `scripts/resolve-governance-convergence.mjs`
- `scripts/resolve-apply-plan.mjs`
- `scripts/check-controlled-apply-readiness.mjs`
- `scripts/check-intentos.mjs`

WorkControl, AiCoffeeCo, or any local real-project observations may be used only as anonymized calibration evidence. They must not become hard-coded rules, required public fixtures, or source-repository assumptions.

## Current Baseline

1.70 already establishes:

- existing projects can enter IntentOS Operating Mode without granting write authority;
- old project rules can be read, extracted, reconciled, and compared;
- governance convergence can summarize workflow, baseline, audit, release, CI/hooks, documents, work queue, AI logs, and risk authority;
- migration must not be maximized by default;
- old release SOPs, production rules, CI/hooks, business rules, and protected authority remain project-owned unless explicitly reviewed and approved;
- old-project writes must still pass through:

```text
Native Migration
-> Existing Rule Reconciliation
-> Governance Convergence
-> Unified Apply Plan
-> Approval Record
-> Controlled Apply Readiness
```

The remaining gap is after that chain:

```text
Did the project actually adopt IntentOS correctly?
```

## Problem Statement

### Problem 1: Adoption Claims Can Still Be Too Easy

Codex may say:

```text
IntentOS has been adopted.
```

But that can hide missing surfaces:

- `AGENTS.md` was not updated or mapped;
- baseline docs were not compared;
- release SOP was ignored;
- CI/hooks stance was not recorded;
- work queue was not activated;
- AI log policy was not bounded;
- old rules were partially extracted;
- apply plan was approved but not reflected in actual files;
- real tasks still bypass IntentOS.

1.71 must make "adopted" a checker-backed state, not a free-form statement.

### Problem 2: A Written Proof Is Not Enough

An adoption proof written by Codex is still just Codex output.

1.71 must require the proof to be derived from inspectable project state:

- file existence;
- file content markers;
- recorded artifact references;
- git status and diff;
- checker outputs;
- simulation outputs;
- known pending decisions.

If evidence cannot be resolved, the result must be partial, blocked, or failed.

### Problem 3: Existing Projects Need Effective-Use Verification

Adoption is not complete if IntentOS files exist but Codex does not use the workflow.

1.71 must add a safe read-only simulation:

```text
Given a small fake task,
does Codex route through IntentOS entry, boundary, plan, impact, review, and closure surfaces?
```

The simulation must not modify target project files. It should prove workflow behavior, not product correctness.

### Problem 4: Users Cannot Manually Judge Adoption Completeness

The user may not know whether a migration is technically complete.

1.71 should produce a plain conclusion:

```text
IntentOS adoption is verified / partial / blocked / failed.
```

The technical detail should exist for audit, but the user-facing answer must be clear.

## Scope

1.71 includes:

- Adoption Execution Assurance protocol;
- adoption surface checklist;
- `Adoption Assurance Report` artifact;
- machine-readable adoption assurance evidence schema;
- resolver that derives assurance from project state and existing artifacts;
- checker that rejects unsupported adoption claims;
- examples for verified, partial, blocked, and failed adoption states;
- bad fixtures for missing surfaces, unbound evidence, write overclaims, skipped rule comparison, stale diff, fake simulation pass, release SOP replacement, and CI/hook mutation;
- README / existing-project docs updates;
- manifest, generated-project asset coverage where appropriate;
- release evidence and self-check coverage.

1.71 does not include:

- automatic target-project writes;
- a generic apply runner;
- automatic `.intentos` installation;
- automatic `AGENTS.md`, CI, hook, release SOP, baseline, or PR template replacement;
- production deployment or release execution;
- secrets, DNS, payment, permission, migration, provider-state, compliance, legal, tax, finance, HR, privacy, security, or production approval;
- historical document deletion or rewrite;
- hard-coded WorkControl, AiCoffeeCo, or local project assumptions;
- a guarantee that the product is functionally correct.

## Desired User Experience

After a governed existing project has a migration/convergence plan, the user can ask:

```text
Has this project really adopted IntentOS?
```

Codex should answer:

```text
Adoption assurance: PARTIAL_ADOPTION

What is verified:
- IntentOS Operating Mode is active.
- Existing rules were extracted and reconciled.
- Governance convergence covers workflow, baseline, audit, release, CI/hooks, docs, work queue, AI logs, and risk authority.
- Release SOP remains project-owned.

What is not verified:
- No approved apply record for AGENTS.md migration.
- No post-adoption simulated task closure yet.
- Work queue artifact is not present in the target project.

Can Codex claim full adoption: No
Can Codex continue working in IntentOS mode: Yes, plan-first only
Next safe step: prepare or verify a bounded apply plan for the missing surfaces.
```

For a fully verified case:

```text
Adoption assurance: VERIFIED_ACTIVE

IntentOS is the active working mode for this project.
The project still owns production, release, CI/hooks, secrets, and business authority.
The latest simulated task followed IntentOS routing, impact coverage, review surface, work queue, and closure.
```

## Core Concept

### Adoption Assurance Report

Add a new artifact:

```text
adoption-assurance-reports/<id>.md
```

It is not a permission record. It is an evidence-bound verification view.

Required sections:

- `Adoption Summary`
- `Assurance State`
- `Target Project State`
- `Adoption Surface Coverage`
- `Evidence Resolution`
- `Actual Diff / File State Check`
- `Existing Rule Coverage`
- `Governance Convergence Coverage`
- `Simulation Task Result`
- `Pending Human Decisions`
- `Forbidden Claims`
- `Machine-Readable Evidence`

### Assurance States

Allowed states:

- `NOT_ADOPTED`
- `READ_ONLY_DIAGNOSIS_ONLY`
- `PLAN_READY`
- `APPLY_READY`
- `APPLIED_PENDING_VERIFICATION`
- `PARTIAL_ADOPTION`
- `VERIFIED_ACTIVE`
- `BLOCKED_BY_DIRTY_WORKTREE`
- `BLOCKED_BY_PROJECT_AUTHORITY`
- `FAILED_ASSURANCE`

State meaning:

- `VERIFIED_ACTIVE` means the required adoption surfaces passed evidence checks and a simulated task followed IntentOS behavior.
- `PARTIAL_ADOPTION` means IntentOS can be used but not all required surfaces are proven.
- `FAILED_ASSURANCE` means a claim was made but evidence contradicts it.
- `APPLY_READY` still does not write files.

### Adoption Surfaces

Every assurance report must classify these surfaces:

| Surface | Required Check |
| --- | --- |
| Workflow entry | IntentOS Operating Mode active, no hidden write authority |
| AI rules / AGENTS | mapped, preserved, merged, or pending with source references |
| Engineering baseline | existing vs IntentOS comparison recorded |
| Environment baseline | existing vs IntentOS comparison recorded |
| Release / rollback | project-owned or external-owner preserved |
| CI / hooks | no unauthorized mutation; policy or comparison recorded |
| Documents | source-of-truth and archive posture known |
| Work queue | current / paused / backlog behavior known |
| AI logs / audit | no routine log spam; audit bridge defined |
| Risk authority | business, production, data, compliance, secrets, payment, migration ownership preserved |
| Apply chain | apply plan / approval / readiness evidence resolved when writes occurred |
| Simulation task | read-only workflow behavior verified after adoption |

Each surface must be one of:

- `VERIFIED`
- `MAPPED`
- `PROJECT_OWNED`
- `PENDING_APPLY`
- `PENDING_HUMAN_DECISION`
- `BLOCKED`
- `MISSING`
- `NOT_APPLICABLE_WITH_REASON`

`NOT_APPLICABLE_WITH_REASON` must include a reason. Empty N/A must fail strict checking.

## Evidence Model

### Evidence Must Be Resolved

The checker must reject:

- `evidence: yes`;
- placeholder paths;
- old unrelated reports reused as proof;
- manually claimed checker pass without command evidence;
- simulation pass without simulation artifact;
- full adoption claim when required surfaces are `MISSING` or `PENDING_HUMAN_DECISION`;
- write authority claim without apply-plan, approval-record, and controlled-readiness references.

### Required Evidence Types

The report should support:

- `file:<path>`;
- `artifact:<type>:<id>`;
- `command:<name>`;
- `git-diff:<summary>`;
- `checker:<name>`;
- `simulation:<id>`;
- `human-decision:<id>`;

Strict mode should resolve local file and artifact references. Command evidence can be recorded as structured command result, not shell history.

### Machine-Readable Evidence

Add a schema:

```text
schemas/artifacts/adoption-assurance.schema.json
```

Required fields:

- `schema_version`
- `artifact_type: adoption_assurance_report`
- `target_project_profile`
- `assurance_state`
- `intent_os_operating_mode`
- `can_claim_full_adoption`
- `can_codex_write_now`
- `surfaces`
- `evidence_refs`
- `simulation`
- `pending_decisions`
- `forbidden_claims`

Strict mode should require valid JSON evidence.

## Simulation Task

### Purpose

The simulation proves that IntentOS is being used as the working mode, not just installed or documented.

### Simulation Input

Use a safe synthetic task:

```text
Add a required field validation to a non-production example flow.
```

For real projects, this must be read-only:

- no target file writes;
- no branch creation required;
- no business data inspection beyond existing governance docs;
- no production command execution;
- no CI/hook mutation.

### Expected Simulation Path

The simulation should verify that Codex would route through:

```text
ask / guide
-> workflow-next
-> work queue / current task check
-> change impact coverage
-> review surface
-> apply-plan if write would be needed
-> closure / finish decision
```

It should not prove product implementation correctness. It proves workflow routing.

### Simulation States

- `SIMULATION_NOT_RUN`
- `SIMULATION_PASSED`
- `SIMULATION_PARTIAL`
- `SIMULATION_FAILED`
- `SIMULATION_BLOCKED`

`VERIFIED_ACTIVE` requires `SIMULATION_PASSED`.

## Proposed Commands

Add:

```bash
node scripts/cli.mjs adoption-assurance <target>
node scripts/cli.mjs adoption-assurance-check <target>
```

Optional flags:

```bash
--require-structured-evidence
--require-simulation
--report <path>
--json
```

Default behavior:

- read-only;
- no target writes;
- summarize the best available adoption state;
- do not flood old projects with missing `.intentos` assets;
- use existing reports when present;
- clearly mark missing or unresolved evidence.

## Resolver Design

Add:

```text
scripts/resolve-adoption-assurance.mjs
```

Inputs:

- `workflow-next` signals;
- native migration plans;
- existing rule reconciliation reports;
- governance convergence reports;
- apply plans;
- approval records;
- controlled apply readiness reports;
- release plans;
- work queue records;
- document lifecycle records;
- target project file markers;
- git status / diff summary;
- optional simulation artifact.

Output:

- human-readable Adoption Assurance Report;
- JSON summary with state, surfaces, evidence, simulation, and next safe action.

The resolver must not create proof by assumption. Missing evidence must remain missing.

## Checker Design

Add:

```text
scripts/check-adoption-assurance.mjs
```

The checker must reject:

- full adoption claim with missing required surfaces;
- full adoption claim without simulation pass;
- write authorization without apply/approval/readiness chain;
- release or production approval claims;
- CI/hook mutation claims without explicit plan-first boundary;
- project-owned release SOP replacement;
- unresolved evidence refs in strict mode;
- stale or unrelated artifacts used as proof;
- empty `NOT_APPLICABLE` reasons;
- `ai-logs` as routine operation logs;
- "IntentOS owns production / business / release authority" wording.

The checker should allow:

- `PARTIAL_ADOPTION` with missing surfaces clearly listed;
- read-only diagnosis reports;
- project-owned stricter rules;
- plan-ready states without write authority;
- old Markdown compatibility by default;
- strict JSON evidence only when requested.

## Bad Fixtures

Add fixtures under `test-fixtures/bad/`:

- `bad-adoption-assurance-full-without-simulation`
- `bad-adoption-assurance-missing-rule-coverage`
- `bad-adoption-assurance-unresolved-evidence`
- `bad-adoption-assurance-authorizes-write`
- `bad-adoption-assurance-claims-production-approval`
- `bad-adoption-assurance-mutates-ci-hooks`
- `bad-adoption-assurance-replaces-release-sop`
- `bad-adoption-assurance-stale-diff`
- `bad-adoption-assurance-ai-log-spam`
- `bad-adoption-assurance-empty-na-reason`

Each fixture should fail for one clear reason.

## Positive Examples

Add examples under:

```text
examples/1.71-adoption-execution-assurance/
```

Recommended examples:

1. `verified-existing-project`
   - all required surfaces mapped;
   - simulation passed;
   - no production authority transfer;
   - full adoption claim allowed.

2. `partial-existing-project`
   - IntentOS Operating Mode active;
   - missing work queue or simulation;
   - result is `PARTIAL_ADOPTION`.

3. `blocked-production-project`
   - production-sensitive;
   - release / CI authority unresolved;
   - result is `BLOCKED_BY_PROJECT_AUTHORITY`.

4. `failed-assurance`
   - claims full adoption;
   - evidence contradicts claim;
   - checker rejects.

## User-Facing Rules

Codex must not say:

```text
This old project has fully adopted IntentOS.
```

unless:

- assurance state is `VERIFIED_ACTIVE`;
- required surfaces are verified, mapped, project-owned, or explicitly N/A with reason;
- simulation passed;
- evidence refs resolve;
- no pending human decisions block adoption;
- write chain is complete for any applied project file changes.

Codex may say:

```text
IntentOS can operate in this project in plan-first mode.
```

when:

- operating mode is active;
- adoption is partial or plan-ready;
- write authority remains blocked;
- missing surfaces are listed.

## Execution Plan

### Step 1: Add Core Protocol

Create:

- `core/adoption-execution-assurance.md`
- `docs/adoption-execution-assurance.md`
- `templates/adoption-assurance-report.md`
- `checklists/adoption-assurance-review.md`
- `prompts/adoption-assurance-agent.md`
- `adoption-assurance-reports/.gitkeep`

### Step 2: Add Schema

Create:

- `schemas/artifacts/adoption-assurance.schema.json`

The schema must require adoption state, surfaces, evidence refs, simulation result, and boundary flags.

### Step 3: Add Resolver And Checker

Create:

- `scripts/resolve-adoption-assurance.mjs`
- `scripts/check-adoption-assurance.mjs`

Wire into:

- `scripts/cli.mjs`
- `package.json`
- `scripts/check-intentos.mjs`
- `intentos-manifest.json`
- `templates/workflow-version.json`

### Step 4: Add Examples And Bad Fixtures

Add positive examples and bad fixtures listed above.

Examples must include strict machine-readable evidence where relevant.

### Step 5: Update Public Docs

Update:

- `README.md`
- `README.zh-CN.md`
- `VERSION.md`
- `docs/for-existing-projects.md`
- `docs/start-here.md` if needed;
- `docs/reference/scripts.md` if command reference is maintained there.

The docs must explain in plain language:

```text
Adoption is not claimed complete until it is checked from real project state.
```

### Step 6: Release Evidence

Add:

- `releases/1.71.0/release-record.md`
- `releases/1.71.0/known-limitations.md`
- `releases/1.71.0/self-check-report.md`

Release evidence must avoid production-proven or real-project guarantee wording.

## Acceptance Plan

### Required Local Checks

Run:

```bash
node --check scripts/resolve-adoption-assurance.mjs
node --check scripts/check-adoption-assurance.mjs
node scripts/cli.mjs adoption-assurance .
node scripts/cli.mjs adoption-assurance-check .
node scripts/check-adoption-assurance.mjs examples/1.71-adoption-execution-assurance/verified-existing-project --require-structured-evidence --require-simulation
node scripts/check-adoption-assurance.mjs examples/1.71-adoption-execution-assurance/partial-existing-project --require-structured-evidence
node scripts/check-adoption-assurance.mjs examples/1.71-adoption-execution-assurance/blocked-production-project --require-structured-evidence
node scripts/check-manifest.mjs
node scripts/check-intentos.mjs
npm run verify
git diff --check
```

### Bad Fixture Acceptance

Every bad fixture must be rejected by `check-adoption-assurance.mjs`.

The failure reason must be specific enough to explain what was unsafe.

### Product Baseline / Claim Control

Run:

```bash
node scripts/cli.mjs product-baseline .
node scripts/cli.mjs claim-control .
```

Expected:

- no "production proven" claims;
- no "adoption guarantees correctness" claims;
- no "IntentOS owns project authority" claims;
- release record includes allowed claims, forbidden claims, evidence status, known limitations, and verification.

### Existing Project Smoke Calibration

Optional local-only calibration:

```bash
node scripts/cli.mjs adoption-assurance /path/to/existing/project --json
```

Rules:

- read-only only;
- no target writes;
- no public release requirement;
- no hard-coded project paths;
- results may inform wording but must not become required public evidence.

## Governance Review Questions

Before implementation is considered complete, reviewers should answer:

1. Can Codex claim full adoption without a simulation pass?
2. Can Codex claim full adoption with missing required surfaces?
3. Can Codex claim writes happened correctly without diff / file-state evidence?
4. Can old release SOPs or CI/hooks be replaced by assurance output?
5. Can a routine AI log count as adoption proof?
6. Does the checker reject stale or unrelated evidence?
7. Does partial adoption stay useful without pretending to be complete?
8. Does the user-facing summary remain understandable for non-technical users?

Expected answers:

- Questions 1-6: No.
- Questions 7-8: Yes.

## Success Definition

1.71 is successful if:

```text
An existing project can be said to be IntentOS-adopted only when the system can prove:
what was planned,
what was applied,
what surfaces are covered,
what project authority remains protected,
what evidence resolves,
and whether a simulated task actually follows IntentOS behavior.
```

The user should not need to inspect technical details to make the first decision. Codex should provide the recommendation and the assurance state, while the checker enforces whether the claim is allowed.

## Out-Of-Bounds

1.71 must not become:

- a target-project write executor;
- a production deploy tool;
- a CI/hook installer;
- a release approval system;
- a project-specific WorkControl/AiCoffeeCo adapter;
- a replacement for human/project authority;
- a claim that IntentOS can guarantee AI correctness.

## Versioning Note

This is appropriate as `1.71.0`, not a patch, because it introduces a new assurance artifact, schema, commands, fixtures, and acceptance surface.
