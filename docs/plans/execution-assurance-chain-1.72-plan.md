# Execution Assurance Chain 1.72 Plan

## Human Summary

1.72 should turn "Codex completed the task" into a verifiable execution chain.

The goal is not to add another report that repeats existing checks. The goal is to make all execution-class work prove:

```text
What was promised
what was planned
what actually changed
what evidence proves it
who or what reviewed it
whether the result can be closed
```

This applies beyond code changes. It should cover feature work, old-project IntentOS adoption, baseline setup, documentation governance, migration planning, release preparation, and future workflow capability additions.

The expected user-facing answer is:

```text
This work is verified / partial / blocked, and here is why.
```

The expected machine-facing rule is:

```text
No evidence chain, no verified completion.
```

## Context Reset

This plan must be executed from repository facts, not conversation memory.

Before implementation, Codex must re-read:

- `README.md`
- `README.zh-CN.md`
- `VERSION.md`
- `package.json`
- `intentos-manifest.json`
- `core/change-impact-coverage.md`
- `core/execution-review-closure.md`
- `core/unified-closure-model.md`
- `core/review-surface-governance.md`
- `core/review-loop.md`
- `core/unified-apply-plan.md`
- `core/controlled-apply-readiness.md`
- `core/approval-record-governance.md`
- `core/adoption-execution-assurance.md`
- `core/existing-project-governance-convergence.md`
- `core/release-core-model.md`
- `core/document-lifecycle.md`
- `core/work-queue.md`
- `docs/plans/change-impact-coverage-1.48-plan.md`
- `docs/plans/closeout-evidence-precision-1.51-plan.md`
- `docs/plans/adoption-execution-assurance-1.71-plan.md`
- `scripts/check-change-impact-coverage.mjs`
- `scripts/check-execution-closure.mjs`
- `scripts/check-closure-decision.mjs`
- `scripts/check-adoption-assurance.mjs`
- `scripts/check-release-plan.mjs`
- `scripts/check-intentos.mjs`

Private project observations may be used only as anonymized calibration. They must not become hard-coded project rules.

## Current Baseline

IntentOS already has strong parts of the execution proof chain:

- Change Impact Coverage prevents obvious cross-surface misses.
- Execution Closure checks whether work can be closed from evidence.
- Evidence precision rejects stale, weak, or unrelated close-out evidence.
- Adoption Assurance proves whether existing-project IntentOS adoption actually routes through IntentOS.
- Governance Convergence compares old-project workflow, baseline, audit, release, CI/hook, document, work queue, AI log, and risk authority surfaces.
- Release Plan and Launch Review View summarize release readiness without approving production.
- Unified Apply Plan, Approval Record, and Controlled Apply Readiness govern target-file writes.

The remaining gap is a generic execution-level answer:

```text
Did Codex execute this specific work completely, without hidden scope drift, patch-smell shortcuts, or unexpected damage?
```

## Problem Statement

### Problem 1: Completion Claims Are Still Distributed

Different work types currently close through different systems:

- feature work through impact coverage and execution closure;
- old-project adoption through adoption assurance;
- release work through release plan and launch view;
- document cleanup through document lifecycle and archive apply;
- baseline setup through baseline selection and baseline checks;
- controlled writes through apply plan, approval, and readiness.

Each system is valid, but users still need a single execution answer:

```text
Was this execution actually done?
```

### Problem 2: Patch-Style Fixes Can Look Successful

Codex can sometimes solve the most visible symptom:

- backend validation without frontend validation;
- one UI path without edit/import/bulk paths;
- a one-line bypass instead of project-standard logic;
- a report update without corresponding target state;
- a release checklist without rollback or owner evidence.

These can pass narrow checks while still being incomplete work.

1.72 must detect patch smell and stop verified completion unless the task is explicitly classified as a safe small patch.

### Problem 3: Actual Diff Is Not Always Bound To The Plan

Execution can drift after planning:

- planned files differ from actual files;
- additional config, CI, hook, release, or permission files are changed;
- generated files appear without explanation;
- target project state changes during a supposedly read-only operation.

1.72 must bind actual diff to planned impact and make unexpected diff block verified completion.

### Problem 4: Review May Not Be Independent

If the same Codex thread both performs and approves the work without a reviewer, weak completion claims can pass.

1.72 should require at least one review source for verified completion:

- Review Loop evidence;
- a read-only subagent review;
- a checker-backed closure artifact;
- a human decision artifact;
- a bounded external reviewer result if the project chooses to use one.

The reviewer must not become the release owner or production approver.

### Problem 5: Users Should Not Need To Understand Internal Commands

The user should not need to know whether to run:

```text
impact-coverage
closure
review-loop
adoption-assurance
release-plan
```

Codex should route internally and return:

```text
Verified / Partial / Blocked
what is missing
what is safe next
what needs human decision
```

## Scope

1.72 includes a design and implementation plan for Execution Assurance Chain.

It should cover:

- generic execution assurance model;
- execution kind classification;
- intent lock;
- completion contract;
- planned impact map;
- actual diff binding;
- evidence binding;
- independent review binding;
- patch classification;
- unified execution closure decision;
- source-system traceability;
- examples, bad fixtures, and self-check coverage.

1.72 does not include:

- automatic target-project writes;
- automatic apply runner;
- automatic commit, push, release, deploy, CI, hook, secret, DNS, payment, migration, provider, production, legal, tax, finance, HR, privacy, security, or compliance action;
- replacement of Change Impact Coverage, Execution Closure, Adoption Assurance, Release Plan, or Approval Record;
- product correctness guarantee;
- full static analysis of every project file;
- forced BL2 or industrial-pack activation;
- hard-coded private project assumptions.

## Core Concept

### Execution Assurance Chain

Execution Assurance Chain is a derived verification layer.

It consumes existing IntentOS artifacts and project facts, then answers whether one execution can be claimed as complete.

It must remain:

- read-only by default;
- evidence-bound;
- task-bound;
- source-system traceable;
- non-authorizing.

It must not become:

- a new apply system;
- a new release approval system;
- a replacement for source systems;
- a black-box authority.

## Execution Kinds

The first version should support these execution kinds:

| Kind | Meaning | Typical source systems |
|---|---|---|
| `FEATURE_IMPLEMENTATION` | Code or product feature work | impact coverage, review loop, execution closure |
| `BUG_FIX` | Defect fix or regression repair | impact coverage, review surface, tests, closure |
| `SAFE_PATCH` | Narrow, low-risk local fix | patch assessment, actual diff, verification |
| `CONTROLLED_PATCH` | Local fix with known limitations | impact coverage, debt handoff, closure |
| `ADOPTION_MIGRATION` | Existing project IntentOS adoption or migration | native migration, rule reconciliation, convergence, adoption assurance |
| `BASELINE_SETUP` | Engineering/environment/baseline setup | baseline selection, baseline checks, rule comparison |
| `DOCUMENT_GOVERNANCE` | Document source-of-truth, archive, lifecycle work | document lifecycle, archive apply |
| `RELEASE_PREPARATION` | Launch/release readiness planning | launch view, release plan, handoff, release execution plan |
| `WORKFLOW_CAPABILITY` | IntentOS feature or governance capability change | intentos self-check, fixtures, release evidence |

Unknown execution kinds must default to `NEEDS_HUMAN_DECISION` or `PARTIAL_DONE`, not `VERIFIED_DONE`.

## Chain Stages

### 1. Intent Lock

Captures what the user asked for and what is out of scope.

Required fields:

- user intent;
- normalized task intent;
- task reference;
- in-scope summary;
- out-of-scope summary;
- drift policy;
- interruption policy.

Rules:

- If the user changes topic mid-task, Work Queue / Conversation Drift must decide whether to pause, resume, or re-scope.
- Intent Lock must not approve implementation.
- Intent Lock must not authorize target-file writes.

### 2. Completion Contract

Defines what "done" means before or during execution.

Required fields:

- acceptance criteria;
- required surfaces;
- required evidence;
- required review;
- stop conditions;
- human-decision points.

Rules:

- No Completion Contract means no `VERIFIED_DONE`.
- Acceptance criteria must be specific enough to map to evidence.
- High-risk criteria require human/project owner decision before closure.

### 3. Planned Impact Map

Records expected affected surfaces.

Recommended surface classes:

- user flow;
- frontend UI;
- API contract;
- backend rule;
- data model;
- permission / risk;
- tests;
- docs / handoff;
- release impact;
- baseline / environment;
- CI / hook;
- audit / logs;
- migration / compatibility.

Rules:

- Planned impact can reuse Change Impact Coverage.
- For adoption or release work, planned impact can reuse Governance Convergence or Release Plan surfaces.
- Missing obvious surfaces must block verified completion or require explicit out-of-scope reason.

### 4. Execution Plan Binding

Links the actual work plan to the completion contract.

Required fields:

- plan artifact ref;
- planned actions;
- planned target paths;
- risk classification;
- approval refs if writes are controlled;
- rollback or restore strategy when applicable.

Rules:

- For target-file writes in governed/old/high-risk projects, this must reference Unified Apply Plan, Approval Record, and Controlled Apply Readiness where required.
- Plan refs must resolve to concrete project records.
- Broad target path patterns should not support verified completion.

### 5. Actual Diff Binding

Binds real changes to the plan.

Required fields:

- git base / head or diff source;
- changed files;
- added files;
- deleted files;
- generated files;
- unexpected files;
- target diff status before/after read-only operations;
- explanation for each out-of-plan change.

Rules:

- Unexpected diff blocks `VERIFIED_DONE` unless explicitly reviewed and accepted.
- Read-only executions must prove target diff unchanged.
- Changed files are not correctness evidence.
- `.DS_Store`, editor temp files, logs, secrets, and local-only artifacts must not be treated as task evidence.

### 6. Evidence Binding

Maps each acceptance criterion and affected surface to evidence.

Evidence may include:

- command output;
- test result;
- build result;
- screenshot or manual inspection note;
- structured artifact;
- human decision;
- reviewer finding;
- generated report;
- target state snapshot;
- release or rollback evidence.

Rules:

- Evidence refs must resolve.
- Placeholder evidence must fail strict mode.
- Stale or unrelated evidence must fail precision mode.
- Every `DONE` criterion needs evidence or a bounded reason.
- Evidence must prove the specific task, not just that some work happened.

### 7. Independent Review Binding

Records how execution was reviewed.

Allowed review sources:

- Review Loop Report;
- read-only subagent review;
- checker-backed artifact review;
- human decision record;
- GPT/external reviewer result only when project policy allows it.

Rules:

- Reviewer output must be read-only unless explicitly approved through existing apply governance.
- Main thread remains responsible for final synthesis.
- Subagents must be closed or skipped before final response.
- Review cannot approve production, release, secrets, payment, migration, or compliance decisions.

### 8. Patch Assessment

Classifies whether the execution is a safe small patch or a suspicious workaround.

States:

| State | Meaning |
|---|---|
| `NOT_A_PATCH` | Normal planned execution |
| `SAFE_PATCH` | Narrow low-risk fix with contained diff and evidence |
| `CONTROLLED_PATCH` | Local fix accepted with limitations and debt handoff |
| `PATCH_SMELL` | Symptom-only or bypass-style change |
| `BLOCKED_PATCH` | Patch would hide a deeper issue or create risk |

Patch-smell examples:

- hard-coded special case without project rule;
- backend-only fix for user-visible validation;
- skipped tests with no reason;
- broad try/catch or fallback that hides error;
- bypassing permission, status, payment, release, or migration rules;
- replacing a workflow report without target-state evidence;
- adding docs that claim a behavior exists without proof.

Rules:

- `PATCH_SMELL` and `BLOCKED_PATCH` cannot produce `VERIFIED_DONE`.
- `SAFE_PATCH` can use a lighter assurance path, but still needs actual diff and verification evidence.
- `CONTROLLED_PATCH` must produce debt/handoff evidence.

### 9. Closure Decision

Produces the final execution state.

Allowed states:

| State | Meaning |
|---|---|
| `VERIFIED_DONE` | Completion contract, impact, diff, evidence, and review all pass |
| `PARTIAL_DONE` | Some work is done but required criteria or surfaces remain open |
| `BLOCKED_BY_MISSING_EVIDENCE` | Claim cannot be proven |
| `BLOCKED_BY_UNEXPECTED_DIFF` | Actual diff does not match plan |
| `BLOCKED_BY_PATCH_SMELL` | Work appears to bypass root cause or hide risk |
| `BLOCKED_BY_SCOPE_DRIFT` | Intent changed without approved re-scope |
| `BLOCKED_BY_RISK` | High-risk surface needs human/project owner decision |
| `NEEDS_HUMAN_DECISION` | A specific decision is required before closure |

Only `VERIFIED_DONE` supports the claim:

```text
This execution is complete according to the recorded contract and evidence.
```

Even `VERIFIED_DONE` must not claim:

- product is perfect;
- release is approved;
- production is safe;
- legal/compliance/security/tax/finance/HR correctness is proven;
- high-risk decisions were approved by Codex.

## Artifact

Add:

```text
templates/execution-assurance-report.md
execution-assurance-reports/.gitkeep
schemas/artifacts/execution-assurance.schema.json
```

Suggested required sections:

- Human Summary
- Execution Kind
- Intent Lock
- Completion Contract
- Planned Impact Map
- Execution Plan Binding
- Actual Diff Binding
- Evidence Binding
- Independent Review Binding
- Patch Assessment
- Closure Decision
- Pending Human Decisions
- Forbidden Claims
- Boundary
- Machine-Readable Evidence

Required boundary lines:

```text
This report writes target files: No
This report authorizes target-file writes: No
This report approves implementation beyond recorded scope: No
This report approves commit or push: No
This report approves release or production: No
This report replaces source systems: No
This report proves product correctness: No
This report transfers project authority to IntentOS: No
```

## Machine-Readable Evidence

The structured evidence should include at minimum:

```json
{
  "schema_version": "1.72.0",
  "artifact_type": "execution_assurance_report",
  "execution_kind": "FEATURE_IMPLEMENTATION",
  "task_ref": "tasks/001-example.md",
  "assurance_state": "VERIFIED_DONE",
  "can_claim_done": "Yes",
  "can_codex_write_now": "No",
  "intent_lock": {
    "user_intent": "Add required contract number validation",
    "normalized_intent": "Contract number must be required across user-visible and server-side entry paths",
    "in_scope": ["frontend form", "API validation", "backend rule", "tests", "error copy"],
    "out_of_scope": ["data migration", "production release"]
  },
  "completion_contract": {
    "criteria": [
      {
        "id": "criterion:frontend-validation",
        "status": "DONE",
        "evidence_refs": ["file:evidence/frontend-validation.txt"]
      }
    ]
  },
  "planned_impact_map": {
    "surfaces": [
      {
        "surface": "FRONTEND_UI",
        "expected": "Yes",
        "status": "DONE",
        "evidence_refs": ["artifact:change-impact-coverage-reports/001-contract.md"]
      }
    ]
  },
  "actual_diff": {
    "diff_source": "git",
    "unexpected_files": [],
    "target_diff_status": "UNCHANGED_FOR_READ_ONLY_OR_MATCHED_FOR_WRITE"
  },
  "evidence_bindings": [
    {
      "criterion_id": "criterion:frontend-validation",
      "evidence_ref": "file:evidence/frontend-validation.txt",
      "resolved": "Yes",
      "current_task_match": "Yes"
    }
  ],
  "review": {
    "review_required": "Yes",
    "review_refs": ["artifact:review-loop-reports/001-contract.md"],
    "all_reviewers_closed": "Yes"
  },
  "patch_assessment": {
    "state": "NOT_A_PATCH",
    "reason": "Cross-surface planned change with evidence coverage."
  },
  "source_systems": [
    {
      "name": "change_impact_coverage",
      "status": "PASSED",
      "ref": "change-impact-coverage-reports/001-contract.md"
    }
  ],
  "boundary": {
    "writes_target_files": "No",
    "authorizes_target_file_writes": "No",
    "approves_release_or_production": "No",
    "replaces_source_systems": "No"
  }
}
```

## Resolver

Add:

```text
scripts/resolve-execution-assurance.mjs
```

Resolver behavior:

- read-only;
- accepts a target path and optional task/intent;
- classifies execution kind from available artifacts and optional intent;
- consumes existing source systems where present;
- computes a conservative assurance state;
- prints a human-readable report;
- supports `--json`;
- supports `--task`, `--intent`, `--base`, and `--cached` where useful;
- does not write target files;
- does not create or modify project workflow assets.

Resolver source order:

1. explicit report refs provided by flags;
2. task-bound artifacts in the target project;
3. current git diff / cached diff where applicable;
4. existing IntentOS source systems;
5. fallback to `PARTIAL_DONE` or `NEEDS_HUMAN_DECISION` if evidence is insufficient.

The resolver must be conservative. Missing evidence should reduce confidence, not invent proof.

## Checker

Add:

```text
scripts/check-execution-assurance.mjs
```

Checker behavior:

- validates report structure;
- validates Machine-Readable Evidence JSON;
- cross-checks Markdown and JSON state;
- resolves evidence refs;
- rejects stale, placeholder, unresolved, or unrelated evidence in strict mode;
- validates actual diff binding;
- validates patch assessment;
- validates review binding;
- validates source-system traceability;
- rejects forbidden claims.

Suggested flags:

```text
--require-structured-evidence
--require-evidence-refs
--require-review
--require-actual-diff
--require-precise-evidence
--report <path>
--mode default|strict|source
```

Default mode should remain compatible and advisory when no reports exist.

Strict mode should be required for examples, source self-check, and high-risk execution assurance.

## CLI

Add user-facing commands:

```bash
node scripts/cli.mjs execution-assurance .
node scripts/cli.mjs execution-assurance-check .
```

Optional aliases:

```bash
node scripts/cli.mjs done-check .
node scripts/cli.mjs verify-execution .
```

Do not add many public commands unless needed. Prefer one clear entry.

Expected plain-language output:

```text
Execution assurance: PARTIAL_DONE

What is verified:
- Backend validation changed and test evidence exists.

What is missing:
- Frontend form behavior has no evidence.
- Error message evidence is missing.
- Review Loop evidence is missing.

Can Codex claim done: No
Next safe step: cover the missing frontend/error-copy surfaces or mark them out of scope with a human decision.
```

## Integration With Existing Systems

Execution Assurance Chain should consume existing systems rather than replace them.

| Existing system | Role in 1.72 |
|---|---|
| Change Impact Coverage | planned and closed affected surfaces |
| Execution Closure | task close-out input |
| Unified Closure | single closure decision input |
| Review Surface | required review scope |
| Review Loop | independent review evidence |
| Work Queue | interruption and current-task control |
| Conversation Drift | intent drift detection |
| Unified Apply Plan | controlled write plan input |
| Approval Record | human approval input |
| Controlled Apply Readiness | controlled apply readiness input |
| Adoption Assurance | old-project adoption execution input |
| Governance Convergence | old-project workflow convergence input |
| Release Plan | release preparation input |
| Document Lifecycle | document governance input |

If source systems disagree, Execution Assurance must use the stricter result and show the trace.

## Examples

Add examples under:

```text
examples/1.72-execution-assurance-chain/
```

Recommended examples:

1. `feature-contract-validation/`
   - Shows a cross-surface feature execution.
   - Requires frontend, API, backend, error copy, tests, docs.
   - Ends in `VERIFIED_DONE`.

2. `old-project-intentos-adoption/`
   - Consumes adoption assurance and governance convergence.
   - Shows that old-project adoption can be verified without rewriting project authority.
   - Ends in `VERIFIED_DONE` only when read-only simulation and evidence refs pass.

3. `safe-copy-patch/`
   - Shows a narrow `SAFE_PATCH`.
   - Uses lighter impact map but still binds diff and evidence.

4. `patch-smell-backend-only/`
   - Shows a backend-only fix for a visible validation rule.
   - Ends in `BLOCKED_BY_PATCH_SMELL` or `PARTIAL_DONE`.

## Bad Fixtures

Add bad fixtures for:

- verified done without Completion Contract;
- verified done without actual diff binding;
- verified done with unresolved evidence refs;
- verified done with stale evidence from another task;
- verified done with backend-only patch smell;
- verified done with unexpected CI/hook/release file changes;
- safe patch with broad diff;
- controlled patch without debt handoff;
- old-project adoption marked done without Adoption Assurance;
- release preparation marked done while release owner / rollback / monitoring evidence is missing;
- review source missing or subagent still running;
- report claims it approves release, production, commit, push, or broad implementation.

## Acceptance Plan

Implementation is acceptable only when these pass:

```bash
node --check scripts/resolve-execution-assurance.mjs
node --check scripts/check-execution-assurance.mjs
node scripts/check-execution-assurance.mjs examples/1.72-execution-assurance-chain/feature-contract-validation --require-structured-evidence --require-evidence-refs --require-review --require-actual-diff --require-precise-evidence
node scripts/check-execution-assurance.mjs examples/1.72-execution-assurance-chain/old-project-intentos-adoption --require-structured-evidence --require-evidence-refs --require-review --require-actual-diff --require-precise-evidence
node scripts/check-execution-assurance.mjs examples/1.72-execution-assurance-chain/safe-copy-patch --require-structured-evidence --require-evidence-refs --require-actual-diff
node scripts/check-execution-assurance.mjs examples/1.72-execution-assurance-chain/patch-smell-backend-only --require-structured-evidence
node scripts/check-intentos.mjs
npm run verify
git diff --check
```

Bad fixtures must fail for the expected reasons.

If any full command is blocked by local environment limits, record the exact failure and run the nearest safe subset. Do not mark 1.72 complete if the resolver, checker, strict examples, bad fixtures, manifest, or intentos self-check fail.

## Review Checklist

- [ ] Version metadata is updated consistently to `1.72.0`.
- [ ] Release evidence exists under `releases/1.72.0/`.
- [ ] `docs/plans/README.md` links this plan.
- [ ] Core protocol, docs page, template, checklist, prompt, schema, resolver, checker, examples, fixtures, and manifest entries exist.
- [ ] Execution Assurance is explicitly derived and non-authorizing.
- [ ] Source systems remain authoritative.
- [ ] `VERIFIED_DONE` requires Intent Lock, Completion Contract, Planned Impact Map, Actual Diff Binding, Evidence Binding, Independent Review, and non-blocking Patch Assessment.
- [ ] Patch smell blocks verified completion.
- [ ] Read-only executions must prove no target diff change.
- [ ] Unexpected diff blocks verified completion unless reviewed and accepted.
- [ ] Strict mode rejects stale, placeholder, weak, or unrelated evidence.
- [ ] Subagent review evidence requires closed/skipped subagents.
- [ ] Existing project adoption can consume Adoption Assurance instead of inventing separate proof.
- [ ] No automatic writes, deploys, hooks, CI changes, secrets, or production approval are added.

## User Experience Goal

For a normal user, the output should avoid internal workflow burden.

They should see:

```text
This is complete / not complete.
Here is what was verified.
Here is what is missing.
Here is whether Codex can safely continue.
Here is what needs your decision.
```

They should not be asked to choose internal checkers or understand every source system.

## Expected Outcome

1.72 is complete when IntentOS can prove execution completion across work types without relying on Codex narrative claims.

The important shift is:

```text
from "Codex says it did it"
to "the execution chain proves what was done, what was not done, and whether closure is allowed"
```

This makes future feature work, old-project migration, baseline setup, document governance, and release preparation more reliable without making Codex the owner of production or business decisions.
