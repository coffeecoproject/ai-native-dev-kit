# Test Evidence Binding 1.77 Plan

## Human Summary

1.77 should make test results trustworthy enough to support task completion.

The goal is not to make users understand test strategy, test frameworks, or
internal checker commands. The goal is:

```text
Codex runs or records the right checks.
Codex proves those checks belong to the current task.
Codex explains what is covered, what is missing, and what still blocks closure.
```

Codex may run project-approved verification commands during task execution when
the project and current approval scope allow it. The Test Evidence Report itself
is not a runner; it records and binds the evidence that was produced.

The user-facing answer should stay simple:

```text
These checks prove the task enough to continue.
These checks failed or were not run.
These gaps block completion or need your decision.
```

The machine-facing rule is:

```text
No task-bound test evidence, no verified execution completion.
```

1.77 sits after 1.76 Verification Plan Governance:

```text
Business Rule Closure
  -> Change Impact Coverage
  -> Verification Plan
  -> Test Evidence Binding
  -> Execution Assurance
  -> Unified Closure
```

## Context Reset

This plan must be executed from repository facts, not conversation memory.

Before implementation, Codex must re-read:

- `README.md`
- `README.zh-CN.md`
- `VERSION.md`
- `package.json`
- `intentos-manifest.json`
- `docs/business-rule-closure.md`
- `docs/change-impact-coverage.md`
- `docs/verification-test-governance.md`
- `docs/execution-assurance-chain.md`
- `docs/structured-evidence-schema.md`
- `docs/reference/scripts.md`
- `docs/reference/checkers.md`
- `docs/plans/business-rule-closure-1.75-plan.md`
- `docs/plans/verification-test-governance-1.76-plan.md`
- `docs/plans/execution-assurance-chain-1.72-plan.md`
- `releases/1.76.3/release-record.md`
- `scripts/resolve-verification-plan.mjs`
- `scripts/check-verification-plan.mjs`
- `scripts/resolve-execution-assurance.mjs`
- `scripts/check-execution-assurance.mjs`
- `scripts/cli.mjs`
- `scripts/check-intentos.mjs`

Private real-project observations may be used only as anonymized calibration.
They must not become hard-coded project rules, required public fixtures, or
source-repository assumptions.

## Current Baseline

IntentOS 1.75 and 1.76 now define the front half of task correctness:

- Business Rule Closure defines what the requested behavior means.
- Change Impact Coverage maps affected product, code, data, docs, test, and
  release surfaces.
- Verification Plan defines what must be verified for the task.
- Verification Plan strict mode rejects source-chain mismatch, Markdown/JSON
  drift, broad-command-only proof, missing obligations, and weak test controls.

The remaining gap is after planning:

```text
Were the planned checks actually executed, and do their results prove the
current task obligations?
```

Without Test Evidence Binding, Codex can still overclaim:

- run a broad command that does not cover the current rule;
- use a previous command output from another task;
- run only backend tests for a frontend-visible rule;
- write a Codex-generated test that asserts the wrong behavior;
- mark skipped, mocked, flaky, or incomplete tests as proof;
- claim completion when manual verification is still pending;
- report "tests passed" without binding results to Verification Plan
  obligations.

## Problem Statement

### Problem 1: Test Output Is Not Automatically Task Evidence

A command can pass while the current task remains unverified.

Examples:

- `npm test` passes because it did not include the changed workflow.
- API tests pass but UI validation was not checked.
- UI smoke passes but backend/domain enforcement was never exercised.
- A local command ran before the current diff was produced.
- A copied output file belongs to a previous task.

1.77 must require evidence identity:

```text
test evidence -> verification plan -> current task -> current source chain
```

### Problem 2: Tests Can Be Wrong

Codex-authored tests may repeat the same incorrect assumption as the
implementation.

Common failure modes:

- testing implementation details instead of business behavior;
- asserting only happy paths;
- missing failure-path, negative-path, permission, or data-boundary cases;
- using mocks that bypass the real rule;
- testing UI copy without validating system behavior;
- checking backend status code without checking user-facing error behavior;
- treating snapshots as correctness;
- accepting skipped or flaky tests as proof.

1.77 must treat tests as evidence that also needs quality checks.

### Problem 3: Users Should Not Be Test Designers

The user should not need to choose unit, integration, API, UI, E2E, manual,
visual, release-smoke, migration, rollback, or permission tests.

Codex should infer the evidence needed from:

- Business Rule Closure;
- Change Impact Coverage;
- Verification Plan obligations;
- project platform profile;
- BL0 / BL1 / BL2 baseline level;
- risk domains;
- existing project test conventions;
- execution kind and changed surfaces.

The user should only be asked when a verification choice changes business
behavior, cost, risk, real-environment responsibility, data handling, release
safety, or owner accountability.

### Problem 4: Existing Projects Have Existing Test Gates

Old projects may already use project-specific test commands, smoke tests, CI
gates, release checklists, or manual QA conventions.

1.77 must not replace those rules. It should map them:

```text
Verification Plan obligation
  -> project test evidence
  -> covered / missing / weaker / stronger existing rule / needs owner
```

## Goals

- Add Test Evidence Binding as the second Verification And Test Governance
  layer.
- Introduce a task-bound `Test Evidence Report` artifact.
- Bind actual command/manual evidence to Verification Plan obligations.
- Reject stale, unrelated, broad-only, skipped, flaky, or weak evidence.
- Require explicit coverage for positive, negative, failure-path, cross-surface,
  and manual verification obligations when the plan requires them.
- Add test-quality controls for Codex-generated or changed tests.
- Keep ordinary users out of test design details.
- Respect existing-project test conventions and stronger project-owned gates.
- Keep Execution Assurance default behavior unchanged in 1.77.0.
- Prepare a future explicit strict-mode path where Execution Assurance may
  consume Test Evidence Report after the report model is stable.

## 1.77.0 Scope Control

1.77.0 should be intentionally narrow:

```text
Test Evidence Report
resolver
checker
schema
examples
bad fixtures
docs and release evidence
```

It should not make Execution Assurance require Test Evidence Report by default.
It should not become a test runner. It should not deeply reconcile old-project
test conventions beyond recording basic project-convention refs and statuses.

Suggested follow-up split:

```text
1.77.0  Test Evidence Binding core
1.77.1  evidence-identity hardening / existing-project calibration
1.77.2  optional Execution Assurance strict-mode consumption
1.78.0  default strict consumption only if proven stable
```

## Non-Goals

- Do not build a universal test runner.
- Do not force one framework, package manager, CI system, simulator, browser,
  device, or cloud provider.
- Do not auto-install dependencies or test tools.
- Do not mutate CI, hooks, release pipelines, secrets, DNS, provider state,
  production config, database migrations, payment systems, legal, tax, finance,
  HR, privacy, security, or compliance controls.
- Do not approve implementation, commit, push, release, production, provider
  actions, or customer-data actions.
- Do not claim that tests prove market fit, product correctness, legal
  correctness, tax correctness, financial correctness, or real-world business
  correctness.
- Do not replace Verification Plan, Execution Assurance, Unified Closure,
  Release Plan, or existing project gates.
- Do not require BL2 verification on BL0 / BL1 projects unless risk or human
  decision requires it.

## Position In The Flow

1.77 should fit between Verification Plan and Execution Assurance:

```text
User request
  -> Business Rule Closure
  -> Change Impact Coverage
  -> Verification Plan
  -> implementation / adoption / documentation / release-prep work
  -> Test Evidence Report
  -> Execution Assurance
  -> Unified Closure
```

It answers:

```text
Do the recorded test results prove the planned verification obligations for
this task?
```

It does not answer:

```text
Is the full task complete?
```

Execution Assurance remains responsible for combining:

- intent lock;
- completion contract;
- planned impact;
- actual diff;
- review;
- patch assessment;
- Test Evidence Report;
- source-system trace;
- final execution state.

## User Experience Contract

Codex should present three user-facing blocks:

```text
What was verified
What is missing
Safe next step
```

Example:

```text
What was verified:
- Backend blocks appointment creation without service time.
- API returns a user-facing validation error.
- Frontend create form shows the same rule before submit.

What is missing:
- Reschedule flow was not checked.
- Manual staging check was not run.

Safe next step:
- Run the reschedule check before claiming this task complete.
```

Codex may ask at most three user questions in one turn. Questions should be
reserved for owner, environment, cost, manual verification, release safety, or
business-risk decisions.

## Core Model

### Test Evidence Report

`Test Evidence Report` is a task-bound artifact that records actual verification
evidence and maps it to Verification Plan obligations.

It must remain:

- derived from a Verification Plan;
- bound to the current task and intent;
- evidence-backed;
- source-system traceable;
- read-only as a report;
- non-authorizing.

It must not become:

- a test runner;
- an apply system;
- a release approval system;
- a replacement for Execution Assurance;
- a claim that product correctness is fully proven.

### Source Inputs

The resolver/checker should support these source inputs:

| Input | Purpose |
|---|---|
| `verification_plan_ref` | Required source plan |
| `verification_plan_digest` | Prevent stale or swapped plans |
| `task_ref` | Bind evidence to the current task |
| `intent_digest` | Bind evidence to the current request interpretation |
| `business_rule_ref` | Optional but required when the plan used BRC |
| `impact_coverage_ref` | Optional but required when the plan used CIC |
| `command_evidence[]` | Recorded command, exit code, output digest, timestamp/order |
| `manual_evidence[]` | Human/manual check owner, environment, result, limitations |
| `artifact_evidence[]` | Screenshot, log, report, fixture, generated output, or external record |
| `test_quality_controls[]` | Controls proving the test itself is meaningful |
| `coverage_map[]` | Obligation-to-evidence mapping |
| `known_gaps[]` | Missing, skipped, flaky, not-run, or deferred checks |

### Self-Reference And Source Identity

Every report must identify itself:

```text
test_evidence_ref == artifact:<current Test Evidence Report relative path>
```

If the resolver supports `--out`, it must generate `test_evidence_ref` from the
real `--out` path. A report whose `test_evidence_ref` points to another file
must fail strict checking.

The referenced Verification Plan identity must be complete:

- `verification_plan_ref` resolves to the referenced Verification Plan;
- `verification_plan_digest` equals the referenced plan's
  `verification_plan_digest`;
- `task_ref` equals the referenced plan's `task_ref`;
- `intent_digest` equals the referenced plan's `intent_digest`;
- when the Verification Plan is sourced from Business Rule Closure or Change
  Impact Coverage, the Test Evidence Report must preserve the BRC/CIC refs and
  digests through `source_systems[]`.

The intended chain is:

```text
Business Rule Closure
  -> Change Impact Coverage
  -> Verification Plan
  -> Test Evidence Report
```

### Test Evidence States

Use simple states:

| State | Meaning |
|---|---|
| `EVIDENCE_BOUND` | Required obligations are covered by current, task-bound evidence |
| `PARTIAL_EVIDENCE` | Some obligations are covered, but completion cannot be trusted yet |
| `BLOCKED_MISSING_EVIDENCE` | Required evidence is missing |
| `BLOCKED_STALE_EVIDENCE` | Evidence is old, unrelated, or from a different task/source chain |
| `BLOCKED_WEAK_TEST` | Evidence exists but the test does not prove the obligation |
| `BLOCKED_MANUAL_VERIFICATION` | Manual/environment check is required but absent or ownerless |
| `NOT_APPLICABLE_WITH_REASON` | No test evidence is required for this task, with concrete reason |

`EVIDENCE_BOUND` must not be named `DONE`; completion is decided later by
Execution Assurance and Unified Closure.

### Evidence Item States

Each evidence item also needs its own result state:

| State | Meaning |
|---|---|
| `PASSED` | Evidence ran or was observed successfully |
| `FAILED` | Evidence ran and failed |
| `NOT_RUN_WITH_REASON` | Required check was not run, with a reason |
| `SKIPPED_WITH_REASON` | Check was skipped, with a reason |
| `FLAKY_REQUIRES_REVIEW` | Result is unstable and needs owner review |
| `WAIVED_BY_HUMAN_DECISION` | Requirement was waived by an explicit human decision |
| `NOT_APPLICABLE_WITH_REASON` | Evidence is not applicable with a concrete reason |
| `UNRESOLVED` | Evidence ref cannot be resolved |

Hard rules:

- `FAILED` cannot support `COVERED`.
- `SKIPPED_WITH_REASON` cannot support `COVERED`.
- `NOT_RUN_WITH_REASON` cannot support `COVERED`.
- `FLAKY_REQUIRES_REVIEW` cannot support `COVERED` unless mitigation, owner,
  and rerun or accepted-risk evidence exists.
- `WAIVED_BY_HUMAN_DECISION` requires owner and `decision_ref`.

## Evidence Binding Rules

### Required Binding

Every required Verification Plan obligation must map to one or more evidence
items.

Each mapping must include:

- obligation id;
- whether the obligation is required;
- evidence ids;
- coverage status;
- current-task match;
- proof strength;
- limitation or not-applicable reason.

Recommended `coverage_map[]` shape:

```json
{
  "obligation_id": "verify:api-contract-api-negative-test",
  "obligation_required": "Yes",
  "evidence_ids": ["evidence:api-negative-service-time"],
  "coverage_status": "COVERED",
  "current_task_match": "Yes",
  "proof_strength": "DIRECT",
  "limitations": ""
}
```

Coverage statuses:

| Status | Meaning |
|---|---|
| `COVERED` | Required obligation is covered by valid current evidence |
| `PARTIAL` | Evidence exists but does not fully prove the obligation |
| `MISSING` | Required evidence is missing |
| `NOT_APPLICABLE_WITH_REASON` | Obligation does not apply with a concrete reason |
| `WAIVED_BY_HUMAN_DECISION` | Explicit human decision waives the obligation |
| `BLOCKED_FAILED` | Evidence failed |
| `BLOCKED_WEAK` | Evidence exists but is too weak |
| `BLOCKED_STALE` | Evidence is stale or unrelated |

Checker rules:

- every required Verification Plan obligation must have a `coverage_map[]` row;
- each `coverage_map[].obligation_id` must exist in the referenced
  Verification Plan;
- each `coverage_map[].evidence_ids[]` entry must exist in `evidence_items[]`;
- `COVERED` requires evidence identity, result, quality, and current-task checks
  to pass;
- `coverage_map[].evidence_ids[]` and `evidence_items[].covers_obligations[]`
  must agree in strict mode.

### Evidence Identity

Command evidence must record:

- command or method;
- working directory or project context;
- exit code;
- result state;
- output path or digest;
- output digest;
- run time or sequence marker when available;
- whether it ran after the relevant change;
- whether it ran against the expected environment;
- whether it used real, mocked, fixture, staging, preview, or manual data.
- coverage claim / covered obligation ids.

Recommended command evidence shape:

```json
{
  "id": "evidence:api-negative-service-time",
  "evidence_type": "COMMAND_OUTPUT",
  "command": "npm run test:api -- service-time",
  "exit_code": 0,
  "result_state": "PASSED",
  "output_ref": "artifact:test-evidence-outputs/api-negative.txt",
  "output_digest": "sha256:...",
  "environment": "local",
  "ran_after_change": "Yes",
  "current_task_match": "Yes",
  "covers_obligations": ["verify:api-negative-service-time"],
  "limitations": ""
}
```

Manual evidence must record:

- owner;
- owner role;
- environment;
- check method;
- observed result;
- manual record digest;
- timestamp/order marker when available;
- limitations;
- whether it is blocking or advisory.

Manual evidence that supports a required obligation must not use vague owners
such as `someone`, `TBD`, `AI`, or `Codex`. Unknown environments cannot support
required blocking obligations.

### Evidence Rejection Rules

The checker should reject:

- missing Verification Plan ref;
- mismatched Verification Plan digest;
- mismatched task ref or intent digest;
- `test_evidence_ref` that does not point to the current report;
- obligation ids not present in the Verification Plan;
- required obligations with no evidence;
- coverage map rows that reference missing evidence ids;
- evidence ids not used by any coverage map row when they are claimed as proof;
- evidence refs that cannot be resolved;
- output digest mismatch;
- stale evidence from another task/source chain;
- command evidence without exit code;
- failed commands marked as passing;
- failed commands used for `COVERED`;
- skipped tests marked as proof;
- skipped tests used for `COVERED`;
- flaky tests marked as proof without rerun/owner/mitigation;
- evidence that ran before the relevant change but claims current coverage;
- evidence with `current_task_match: No` used as proof;
- broad `npm test` / `pytest` / `xcodebuild test` evidence used as the only
  proof for specific obligations;
- backend-only evidence for frontend/API/user-feedback obligations;
- UI-only evidence for backend/domain/API obligations;
- manual verification without owner;
- manual verification owned by `AI`, `Codex`, `TBD`, or other invalid owner;
- waived evidence without a `decision_ref`;
- generated tests without test-quality controls when risk requires them;
- generated tests missing reviewed intent when required;
- real-provider or production-observation claims without a release/owner path;
- Markdown/JSON evidence mismatch in strict mode.

## Test Correctness Controls

When tests are created or changed by Codex, the report should include test
quality controls.

Possible controls:

| Control | Purpose |
|---|---|
| `FAILURE_PATH_INCLUDED` | Proves the negative path is checked |
| `BEHAVIOR_ASSERTION` | Test asserts business behavior, not only implementation detail |
| `REAL_RULE_PATH` | Test exercises the actual rule path, not a bypassing mock |
| `CROSS_SURFACE_MATCH` | UI/API/backend checks agree where required |
| `OLD_BEHAVIOR_REGRESSION` | Protects existing supported behavior |
| `FIXTURE_VALIDITY` | Fixture data matches the rule and environment |
| `MANUAL_LIMITATION_RECORDED` | Manual check limits are explicit |
| `FLAKY_TEST_HANDLED` | Flaky result has rerun/owner/mitigation |
| `SKIP_NOT_COUNTED_AS_PASS` | Skipped checks are not counted as proof |
| `REVIEWED_TEST_INTENT` | Reviewer or checker confirmed what the test is intended to prove |

The first version should not pretend it can fully prove test quality. It should
block obvious weak evidence and make uncertainty visible.

## Existing Project Rules

Existing projects may have stronger or different verification conventions.

1.77 should support:

```text
Verification Plan obligation
  -> project convention
  -> evidence mapping
  -> gap / conflict / stronger existing rule / human decision
```

Rules:

- do not overwrite existing test strategy, CI, release gates, or QA SOPs;
- do not downgrade stronger existing gates;
- do not invent missing project commands as if they exist;
- do not require users to choose internal test categories;
- when existing evidence is stronger, mark it as `PROJECT_STRONGER_RULE`;
- when evidence is weaker, mark the gap and safe next step.

1.77.0 should keep this minimal. It should support:

```text
project_convention_refs[]
project_convention_status:
  NOT_PROVIDED
  RECORDED
  PROJECT_STRONGER_RULE
  PROJECT_WEAKER_RULE
  NEEDS_OWNER
```

Deep old-project test convention reconciliation should remain a later
calibration step after the core Test Evidence Report is stable.

## Platform And Baseline Calibration

1.77 should remain platform-neutral but platform-aware.

Examples:

| Platform / scope | Evidence considerations |
|---|---|
| Web | form validation, route behavior, API client, browser smoke, accessibility where relevant |
| Mini Program | page lifecycle, platform API, cloud function, device/manual review where relevant |
| iOS / Android | unit/UI/simulator/device evidence, build/test logs, manual device limits |
| Backend API | contract, domain rule, persistence, migration, permission, idempotency |
| Internal admin | role/permission, audit, table/filter/export, approval workflow |
| Release prep | dry-run, build artifact, rollback evidence, owner handoff, no production execution |

BL0 should allow light evidence with explicit limits.
BL1 should require surface-aware evidence.
BL2 should require stricter cross-surface, owner, environment, and risk evidence
when selected by project decision.

## Artifact Design

Expected new assets:

- `core/test-evidence-binding.md`
- `docs/test-evidence-binding.md`
- `templates/test-evidence-report.md`
- `schemas/artifacts/test-evidence.schema.json`
- `checklists/test-evidence-review.md`
- `prompts/test-evidence-agent.md`
- `test-evidence-reports/.gitkeep`
- `scripts/resolve-test-evidence.mjs`
- `scripts/check-test-evidence.mjs`
- examples under `examples/1.77-test-evidence-binding/`
- bad fixtures under `test-fixtures/bad/`
- release evidence under `releases/1.77.0/`

Expected CLI aliases:

```text
test-evidence
test-evidence-check
```

Expected generated project asset:

```text
test-evidence-reports/.gitkeep
```

Expected example directories:

```text
examples/1.77-test-evidence-binding/feature-rule/
examples/1.77-test-evidence-binding/manual-pending/
examples/1.77-test-evidence-binding/docs-only-na/
```

## Synchronization Scope

1.77.0 implementation should update these public/source surfaces together:

- `README.md`
- `README.zh-CN.md`
- `VERSION.md`
- `package.json`
- `intentos-manifest.json`
- `templates/workflow-version.json`
- `docs/README.md`
- `docs/index.md`
- `docs/reference/scripts.md`
- `docs/reference/checkers.md`
- `docs/reference/artifacts.md`
- `docs/structured-evidence-schema.md`
- `scripts/cli.mjs`
- `scripts/check-intentos.mjs`
- `.github/workflows/intentos-pr-checks.yml`

Release evidence and self-check evidence must list the same required local
commands. If `release-record.md` says `npm run verify` is expected,
`self-check-report.md` must also record whether it was run.

## Machine-Readable Evidence

The schema should define a `test_evidence_report` object.

Required top-level fields should include:

- `schema_version`
- `artifact_type`
- `test_evidence_ref`
- `test_evidence_digest`
- `task_ref`
- `intent_digest`
- `verification_plan_ref`
- `verification_plan_digest`
- `source_systems`
- `evidence_items`
- `coverage_map`
- `test_quality_controls`
- `known_gaps`
- `manual_verification`
- `project_convention_refs`
- `project_convention_status`
- `boundary`
- `outcome`

The schema must follow existing IntentOS artifact style:

```json
{
  "schema_version": "1.77.0",
  "artifact_type": "test_evidence_report",
  "test_evidence_ref": "artifact:test-evidence-reports/001-feature-rule.md",
  "test_evidence_digest": "sha256:..."
}
```

It should not introduce camelCase fields such as `schemaVersion` or
`artifactType`.

Keep these concepts separate:

- `source_systems[]`: Verification Plan and inherited BRC/CIC source trace.
- `evidence_items[]`: concrete command, manual, artifact, screenshot, log, or
  output evidence.
- `coverage_map[]`: obligation-to-evidence mapping and coverage judgment.

The checker should support:

```text
--require-structured-evidence
--require-verification-plan-ref
--strict-source-binding
--require-current-evidence
--require-test-quality-controls
```

Strict mode should check Markdown/JSON consistency for:

- identity;
- source systems;
- evidence items;
- coverage map;
- test-quality controls;
- known gaps;
- manual verification;
- outcome;
- boundary.

## Execution Plan

### Step 1: Design and Docs

Create the core protocol, usage doc, template, checklist, prompt, and schema.

Acceptance:

- user-facing docs explain the feature without requiring test expertise;
- core docs define states, boundaries, and rejection rules;
- template separates human summary, evidence mapping, gaps, and machine output;
- checklist checks both "evidence exists" and "test proves the right thing";
- prompt constrains reviewer/agent behavior to read-only evidence review.

### Step 2: Resolver

Add `scripts/resolve-test-evidence.mjs`.

Acceptance:

- resolver produces a safe report from available Verification Plan evidence;
- missing evidence produces `BLOCKED_MISSING_EVIDENCE` or `PARTIAL_EVIDENCE`,
  not a pass;
- resolver never fabricates passed evidence;
- resolver defaults to reading and binding supplied evidence only;
- resolver accepts explicit inputs such as `--verification-plan-ref`,
  `--evidence`, `--command-output`, `--manual-evidence`, and `--out`;
- resolver generates `test_evidence_ref` from the real `--out` path when
  writing a report;
- resolver can emit JSON;
- resolver does not write target-project files unless explicitly writing a
  report path inside the current repository artifact directory;
- resolver does not run tests by default;
- resolver does not approve implementation, commit, push, release, or
  production.

### Step 3: Checker

Add `scripts/check-test-evidence.mjs`.

Acceptance:

- checker validates source refs and digests;
- checker validates `test_evidence_ref` self-reference;
- checker validates Verification Plan task and intent identity;
- checker validates obligation-to-evidence coverage;
- checker rejects unresolved evidence refs;
- checker rejects stale or unrelated evidence;
- checker rejects output digest mismatch;
- checker rejects weak/broad-only evidence where specific obligations exist;
- checker rejects skipped/flaky/failed evidence claimed as proof;
- checker rejects evidence that ran before the relevant change when it claims
  current coverage;
- checker rejects invalid manual owners for required obligations;
- checker cross-checks `coverage_map[].evidence_ids[]` with
  `evidence_items[].covers_obligations[]`;
- checker validates Markdown/JSON consistency in strict mode;
- checker passes source repo with no reports only when explicitly allowed, or
  as source asset check if no target Test Evidence Reports exist.

### Step 4: CLI and Manifest

Wire CLI, manifest, generated-project assets, docs indexes, README references,
and package verify surfaces.

Acceptance:

- `node scripts/cli.mjs test-evidence .` delegates to resolver;
- `node scripts/cli.mjs test-evidence-check .` delegates to checker;
- `intentos-manifest.json` includes new source and target assets;
- generated projects include `test-evidence-reports/.gitkeep`;
- `package.json` verify surfaces include syntax and functional checks;
- `docs/reference/scripts.md` and `docs/reference/checkers.md` mention the new
  scripts.

### Step 5: Positive Examples

Add examples for:

- feature task with backend/API/UI evidence;
- task with manual verification pending;
- safe documentation-only task with not-applicable evidence reason.
- existing project with minimal project-owned convention refs.

Acceptance:

- strict positive example passes with structured evidence;
- partial example remains partial and does not claim completion;
- documentation-only example explains why test evidence is not applicable;
- existing-project example maps project-owned commands without overwriting them.

### Step 6: Negative Fixtures

Add bad fixtures for:

- missing Verification Plan ref;
- mismatched Verification Plan digest;
- `test_evidence_ref` points to a different report;
- evidence from another task;
- unresolved evidence ref;
- evidence id not used in coverage map;
- coverage map references missing evidence;
- broad command only;
- backend-only evidence for frontend obligation;
- UI-only evidence for backend obligation;
- covered with failed command;
- covered with skipped command;
- covered with flaky evidence without mitigation;
- output digest mismatch;
- evidence ran before change;
- current task match is no;
- skipped test counted as pass;
- flaky test counted as proof;
- failed command marked as passing;
- Codex-generated test missing correctness controls;
- Codex-generated test missing reviewed intent;
- manual verification missing owner;
- manual owner is AI/Codex/TBD;
- waiver without decision ref;
- real provider call claimed as safe local evidence;
- production observation claimed without release/owner path;
- Markdown extra evidence row;
- Markdown/JSON coverage mismatch;
- Markdown/JSON outcome drift.

Acceptance:

- every fixture is rejected by `check-test-evidence.mjs`;
- `check-intentos.mjs` includes these rejections;
- rejection messages point to a repairable reason.

### Step 7: Future Execution Assurance Integration Boundary

Do not make Execution Assurance require Test Evidence Report by default in
1.77.0. The first version should document the future relationship and keep
Execution Assurance examples stable.

If an optional strict-mode path is added later, it should be explicit, such as:

```text
check-execution-assurance --require-test-evidence
```

It must not silently change `VERIFIED_DONE` or existing old-project behavior.

Acceptance:

- existing Execution Assurance examples continue to pass;
- 1.77.0 release notes state that Execution Assurance consumption is future or
  explicit strict-mode work;
- no old project is forced into test evidence adoption without project decision;
- release notes state the integration boundary clearly.

## Acceptance Plan

### Required Local Commands

The implementation must run:

```bash
node --check scripts/resolve-test-evidence.mjs
node --check scripts/check-test-evidence.mjs
node scripts/cli.mjs test-evidence .
node scripts/cli.mjs test-evidence-check . --allow-empty
node scripts/check-test-evidence.mjs examples/1.77-test-evidence-binding/feature-rule --report test-evidence-reports/001-feature-rule.md --require-structured-evidence --require-verification-plan-ref --strict-source-binding --require-current-evidence --require-test-quality-controls
node scripts/check-intentos.mjs
npm run verify
git diff --check
```

`test-evidence-check . --allow-empty` is only a source/asset smoke check. It
must not be treated as proof that a target task has passing test evidence.

If any command cannot run in the local environment, the release record must
explain:

- why it could not run;
- whether that is an environment issue or project issue;
- what substitute evidence was used;
- what still blocks release confidence.

### Required Positive Acceptance

- Test Evidence Report is created as a first-class artifact.
- The report is task-bound and Verification Plan-bound.
- `test_evidence_ref` points to the current report.
- Verification Plan ref, digest, task ref, and intent digest all match.
- Evidence items map to obligations.
- Coverage map rows cover each required Verification Plan obligation.
- Manual checks require owner and environment.
- Test-quality controls exist for generated/changed tests where risk requires
  them.
- Markdown and JSON agree in strict mode.
- Existing projects can record minimal project-owned convention refs and status.
- Source repository self-check passes.
- Generated-project smoke includes the report directory.

### Required Negative Acceptance

The checker must reject:

- unbound or stale evidence;
- unresolved evidence paths;
- mismatched task or intent;
- mismatched Verification Plan digest;
- mismatched Test Evidence self-reference;
- required obligation without evidence;
- coverage map references missing evidence;
- broad-only command evidence;
- output digest mismatch;
- evidence that ran before the relevant change;
- evidence with current-task mismatch;
- skipped/flaky/failed evidence counted as proof;
- generated tests without quality controls when required;
- generated tests without reviewed intent when required;
- manual verification without owner;
- invalid AI/Codex/TBD manual owner;
- waiver without decision ref;
- Markdown/JSON drift;
- release, production, commit, push, or implementation approval overclaims.

## Governance Boundaries

Test Evidence Binding must explicitly state:

- This report writes target files: No
- This report runs tests by itself: No
- This report approves implementation: No
- This report approves commit or push: No
- This report approves release or production: No
- This report replaces Execution Assurance: No
- This report proves product correctness: No
- This report replaces human/domain/release owner decisions: No
- This report downgrades stronger existing project gates: No

## Review Plan

Before release, perform a file-level review from these angles:

1. Source-chain consistency:
   - BRC -> CIC -> Verification Plan -> Test Evidence Report.
2. Evidence identity:
   - current task, current intent, current report, resolvable refs.
3. Test correctness:
   - negative path, failure path, real rule path, generated-test controls.
4. Existing project safety:
   - map and compare, do not overwrite or downgrade.
5. User experience:
   - plain status first, technical details second, machine evidence last.
6. Boundary safety:
   - no authorization, no release approval, no production action.
7. Regression:
   - existing 1.75 / 1.76 / 1.72 examples still pass.

## Release Evidence

`releases/1.77.0/` should include:

- `release-record.md`
- `known-limitations.md`
- `self-check-report.md`

The release record must state:

- what Test Evidence Binding can claim;
- what it cannot claim;
- how it relates to Verification Plan and Execution Assurance;
- which commands were run;
- which bad fixtures prove failure cases;
- whether `npm run verify` passed.

## Known Limits To State Up Front

- Test Evidence Binding does not make tests correct by itself.
- It can reject obvious weak evidence, but cannot prove all possible bugs are
  absent.
- It does not replace project-specific QA, CI, manual review, or release SOPs.
- It does not force all platforms into the same testing model.
- It does not run real devices, browsers, simulators, cloud providers, stores,
  or production checks by itself.
- It depends on Verification Plan quality; weak plans still need review.

## Success Definition

1.77 is complete when IntentOS can answer:

```text
The planned checks for this task are covered by current evidence.
The evidence is tied to this task and this Verification Plan.
Weak, stale, skipped, broad-only, or wrong-surface tests are rejected.
Known gaps are visible and block completion where required.
```

It is not complete if it merely records:

```text
tests passed
```

without proving what those tests were supposed to prove.
