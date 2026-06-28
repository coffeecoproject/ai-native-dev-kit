# Change Boundary, Guided Delivery Check & Baseline State Guard 1.12 Plan

## Human Summary

1.12.0 should close three practical gaps:

1. Codex may execute beyond the user's intended change boundary.
2. New-project or no-code baselines may be drafted too confidently before evidence exists.
3. Guided Delivery behavior currently has docs/templates/prompts, but no standalone checker.

This release should add explicit change-boundary governance, a lightweight Guided Delivery checker, and baseline state separation. It stays inside the dev kit's purpose: helping AI understand, plan, execute, verify, and report safely. It must not claim system-level write interception or evidence-free production readiness.

## Boundary Check Before Doing This Work

This phase is inside the project boundary because AI Native Dev Kit already governs:

- request, spec, eval, task, review, and final reporting;
- adoption mode and target-project write permission;
- baseline setup and baseline enforcement;
- conversation drift and next-step boundary;
- guided delivery loop and decision delegation;
- patch classification and review loop.

The phase would exceed project boundary if it claimed to:

- technically prevent all file writes at the operating-system level;
- guarantee AI can never make an out-of-scope edit;
- prove a project is industrial-grade without code, evidence, or human confirmation;
- replace human approval for architecture, release, production, payment, privacy, security, compliance, migration, or irreversible decisions;
- auto-generate and confirm project baselines without reading project evidence or receiving human confirmation.

Therefore the correct scope is:

```text
Detect, report, and fail checks for unapproved boundary drift.
Do not claim hard sandbox enforcement.

Allow proposed/no-code baselines.
Do not claim confirmed/verified baselines without evidence.
```

## Problem 1: Change Boundary Drift

Current workflow already defines task scope, risk gates, patch classification, next-step boundaries, and review loops.

The missing layer is a concrete comparison between:

```text
what the task allowed
vs.
what the diff actually changed
```

Without this layer, Codex may:

- edit unrelated files while solving a narrow task;
- perform opportunistic cleanup;
- change generated assets, CI, config, or docs outside approved scope;
- implement a parked or next-step idea inside the current task;
- broaden a local fix into structural work without re-approval;
- update tests or evidence in a way that hides the real change.

## Problem 2: No-Code Baseline Overclaim

New projects often need baseline guidance before code exists.

Codex should be able to draft:

- engineering baseline recommendations;
- environment baseline assumptions;
- platform profile recommendations;
- baseline-selection candidates;
- industrial pack candidates.

But before project files, commands, CI, architecture, or human decisions exist, these baselines cannot be called confirmed or verified.

The missing layer is a clear state model:

```text
PROPOSED
PENDING_CONFIRMATION
EVIDENCE_REQUIRED
CONFIRMED
NOT_APPLICABLE
SUPERSEDED
```

This lets Codex help early without overstating evidence.

## Problem 3: Guided Delivery Is Not Directly Checked

1.10 added Guided Decision & Delivery Loop and Decision Delegation Boundary.

The current limitation is that these assets are mostly checked indirectly. A report may claim:

```text
smallest safe path
current mainline
parking lot
D3/D4 decision
```

without a standalone checker verifying that:

- an active work thread has a current mainline;
- parking-lot items are not treated as approved backlog;
- guided decision summaries use valid `D0`-`D4` levels;
- `D3`/`D4` decisions do not appear as executed current-task work;
- final reports preserve next safe action and human decision boundaries.

## Goals

1. Add a task-level change boundary model.
2. Add a diff-boundary report template.
3. Add a checker that validates recorded change-boundary reports against git diff file paths.
4. Add a standalone Guided Delivery checker.
5. Add baseline state rules for no-code, new-project, existing-project, and governed-project modes.
6. Update templates and docs so users only confirm direction while Codex manages technical records.
7. Add CI `push main` evidence and an explicit `npm run verify` step.
8. Extend self-check coverage with good and bad examples.

## Non-Goals

1.12.0 will not:

- implement OS-level or editor-level file write sandboxing;
- auto-revert out-of-scope files;
- decide all baseline content without human confirmation;
- promote any industrial pack out of `draft`;
- require every tiny task to create a change-boundary report;
- require every new project to enable BL2;
- add automatic real-project scanning;
- add external GPT/API review automation;
- change license terms;
- add fake CODEOWNERS.

## Guided Delivery Checker Design

Add:

```text
scripts/check-guided-delivery-loop.mjs
```

Checker responsibilities:

- verify active work thread reports contain `Current Mainline`;
- verify parking-lot items are not marked as approved or executable now;
- verify guided decision summaries use one of `D0`, `D1`, `D2`, `D3`, or `D4`;
- fail if `D3` / `D4` decision summaries claim implementation was approved or completed;
- verify final reports include `Next Safe Action`;
- verify broad current-mainline reports do not silently turn side ideas into current work.

Checker boundaries:

- It does not decide whether the product direction is correct.
- It does not approve implementation.
- It does not replace Review Loop, Change Boundary, or Launch Readiness.
- It is skipped when no guided-delivery artifacts exist in a low-risk target project.

## Change Boundary Design

### Task Boundary Fields

Task Card should gain or reference a Change Boundary section:

```text
Allowed paths:
- 

Forbidden paths:
- 

Allowed change types:
- docs-only
- test-only
- source-only
- workflow-assets
- config
- generated-assets
- evidence-only

Forbidden change types:
- dependency
- migration
- production-config
- release
- permission
- payment
- security
- privacy
- generated-without-regeneration
- unrelated-refactor

Expected diff scale:
- tiny
- small
- medium
- large

Out-of-scope but related:
- 
```

The task does not need exhaustive path globs for trivial L0/L1 work. But L2/L3 work, governed projects, production-sensitive projects, baseline changes, CI/config changes, migrations, permissions, and release-related tasks should declare explicit boundaries.

### Boundary Levels

| Level | Meaning | Required Behavior |
|---|---|---|
| `CB0_ADVISORY` | low-risk local task | boundary may be implicit; final report records no unexpected changes |
| `CB1_RECORDED` | normal project task | task records allowed and forbidden scope |
| `CB2_CHECKED` | non-trivial or governed change | diff-boundary report required |
| `CB3_HUMAN_APPROVED` | high-risk or sensitive surfaces | human approval scope required before implementation |

Default recommendation:

- L0: `CB0_ADVISORY`
- L1: `CB1_RECORDED`
- L2: `CB2_CHECKED`
- L3: `CB3_HUMAN_APPROVED`

### Diff Boundary Report

Add template:

```text
templates/change-boundary-report.md
```

Expected report fields:

- task ref;
- intended scope;
- allowed paths;
- forbidden paths;
- changed files;
- change type per file;
- expected vs actual diff scale;
- out-of-scope changes found;
- disposition: `PASS`, `NEEDS_REVIEW`, `NEEDS_REVERT`, `NEEDS_HUMAN_DECISION`;
- human approval ref when applicable;
- verification commands;
- statement that this report does not approve release or production.

### Checker

Add:

```text
scripts/check-change-boundary.mjs
```

Checker responsibilities:

- read a change-boundary report;
- read git changed files through `git diff --name-only` or `--cached` when requested;
- compare changed files with allowed/forbidden paths;
- fail if forbidden paths changed;
- fail if changed files are missing from report;
- fail if out-of-scope changes are marked `PASS`;
- fail if high-risk change types appear without human approval scope;
- support advisory mode for tasks without report;
- support `--base`, `--cached`, `--task`, and `--report`.

Checker boundaries:

- It does not prove semantic correctness.
- It does not prove no runtime side effects.
- It does not auto-revert files.
- It does not replace review loop or launch readiness.

### Integration Points

Update:

- `core/output-protocol.md`
- `core/conversation-drift-control.md`
- `core/patch-classification.md`
- `core/baseline-enforcement.md`
- `templates/task-card.md`
- `templates/final-report.md`
- `templates/review-packet.md`
- `templates/review-loop-report.md`
- `docs/reference/artifacts.md`
- `docs/reference/scripts.md`
- `docs/reference/checkers.md`
- platform adapter guidance
- PR template workflow evidence

`new-workflow-item` should support:

```bash
node scripts/new-workflow-item.mjs --type change-boundary-report --name task-scope
```

## Baseline State Design

### Baseline State Model

Add a shared state model for engineering, environment, platform, and industrial baseline decisions:

| State | Meaning | May Use For Implementation? |
|---|---|---|
| `PROPOSED` | recommended by Codex before evidence or confirmation | No for high-impact work; advisory only |
| `PENDING_CONFIRMATION` | needs human confirmation | No for high-impact work |
| `EVIDENCE_REQUIRED` | plausible but needs code/docs/command evidence | No until evidence exists |
| `CONFIRMED` | supported by project evidence or human-confirmed source of truth | Yes, within scope |
| `NOT_APPLICABLE` | explicitly does not apply | Yes as exclusion evidence |
| `SUPERSEDED` | replaced by a newer baseline decision | No |

Existing `CONFIRMED`, `PENDING_CONFIRMATION`, and `NOT_APPLICABLE` remain valid. 1.12 adds `PROPOSED`, `EVIDENCE_REQUIRED`, and `SUPERSEDED` to make no-code and evolving-project states explicit.

### No-Code / New-Project Baselines

When no real code exists, Codex may draft:

- `docs/engineering-baseline.md`
- `docs/environment-baseline.md`
- baseline recommendation reports
- platform profile recommendations
- industrial pack candidates

But status must be:

```text
PROPOSED
PENDING_CONFIRMATION
EVIDENCE_REQUIRED
```

Codex must not mark no-code baselines as:

```text
CONFIRMED
BASELINE_READY
production-ready
industrial-grade
verified
```

unless evidence and/or human-confirmed source-of-truth exists.

### Existing Project Baselines

For existing projects:

- Codex should read code, docs, scripts, CI, and existing governance first.
- Codex may map discovered evidence to `CONFIRMED`.
- Unknowns remain `PENDING_CONFIRMATION` or `EVIDENCE_REQUIRED`.
- Strong existing governance should be adapted, not overwritten.

### Industrial Baseline State

Industrial packs can be selected as candidates without becoming confirmed.

Recommended wording:

```text
Selected industrial pack: PROPOSED / PENDING_CONFIRMATION
Industrial readiness: EVIDENCE_REQUIRED
Industrial compliance: not claimed
```

Draft industrial packs remain draft until a separate promotion process proves otherwise.

### Baseline State Report

Add template:

```text
templates/baseline-state-report.md
```

Expected fields:

- project mode: no-code / new project / existing light / governed existing / production-sensitive;
- platform/profile recommendation;
- baseline level recommendation;
- baseline items by state;
- evidence refs;
- human decisions needed;
- implementation allowed: yes / limited / no;
- what Codex can draft now;
- what Codex must not claim.

### Baseline State Checker

Add or extend:

```text
scripts/check-baseline-state.mjs
```

Checker responsibilities:

- verify baseline state values are allowed;
- fail no-code reports that claim `CONFIRMED` without evidence refs or human source;
- fail industrial readiness claims when selected packs remain draft;
- fail `BASELINE_READY` claims when key items are `PROPOSED` or `EVIDENCE_REQUIRED`;
- warn when existing projects have too many `PROPOSED` states without evidence review.

Checker boundaries:

- It does not know whether the product direction is correct.
- It does not verify real infrastructure.
- It does not replace environment baseline, platform baseline, or industrial baseline checks.

## User Experience

The user should not be asked to write path globs or baseline tables manually.

Codex should say:

```text
I recommend this first slice and these allowed change areas.
I will treat payment, release, CI, production config, and migration as out of scope.
Please confirm whether this boundary is right.
```

For no-code baseline:

```text
I can draft a proposed baseline for this new project.
It will guide development, but it will stay PROPOSED/EVIDENCE_REQUIRED until code, commands, or your confirmation exist.
```

Human decisions:

- confirm product direction;
- confirm change boundary;
- approve high-risk scope;
- confirm baseline assumptions;
- choose whether to defer or deepen baseline.

Codex responsibilities:

- draft the boundary;
- draft the baseline state;
- run checks;
- report diff drift;
- stop when approval is missing.

## Required Artifacts

New core docs:

- `core/change-boundary.md`
- `core/baseline-state.md`

New templates:

- `templates/change-boundary-report.md`
- `templates/baseline-state-report.md`

New checklists:

- `checklists/change-boundary-review.md`
- `checklists/baseline-state-review.md`

New prompts:

- `prompts/change-boundary-agent.md`
- `prompts/baseline-state-agent.md`

New scripts:

- `scripts/check-guided-delivery-loop.mjs`
- `scripts/check-change-boundary.mjs`
- `scripts/check-baseline-state.mjs`

New evidence directories:

- `change-boundary-reports/`
- `baseline-state-reports/`

New docs:

- `docs/change-boundary.md`
- `docs/baseline-state.md`

Examples:

- `examples/1.12-change-boundary-baseline-state/`

Bad fixtures:

- forbidden file changed;
- unrelated refactor hidden inside task;
- no-code baseline marked confirmed;
- industrial draft pack claimed stable;
- out-of-scope next-step implemented inside current task.

## Script / CLI Integration

CLI should expose:

```bash
node scripts/cli.mjs change-boundary <project> --report <file>
node scripts/cli.mjs baseline-state <project> --report <file>
```

`new-workflow-item` should support:

```bash
--type change-boundary-report
--type baseline-state-report
```

CI / self-check should include the new checkers, but target projects should not be forced to create these reports for empty or low-risk work.

GitHub workflow changes:

- PR checks should also run on `push` to `main`.
- PR/release checks should include a dedicated `npm run verify` step.

## Review Loop Interaction

Review Loop should ask:

- Did actual changed files match the task boundary?
- Were forbidden paths touched?
- Were parked items implemented?
- Was any baseline state overclaimed?
- Did the fix become larger than the approved patch classification?

`AUTO_FIX` may only repair boundary report formatting or evidence refs. It must not auto-approve out-of-scope changed files.

## Patch Classification Interaction

Patch Classification should route:

- local file drift -> `SAFE_LOCAL_FIX` only if inside task boundary;
- broader diff than approved -> `NEEDS_HUMAN_DECISION`;
- hidden unrelated refactor -> `DO_NOT_PATCH` or `STRUCTURAL_REMEDIATION`;
- baseline mismatch -> `BASELINE_ALIGNED_HARDCUT` only after scope approval.

## Launch / Delivery Interaction

Safe Launch / Delivery Readiness should not claim ready states when:

- change boundary report is required and failing;
- baseline state contains unapproved `PROPOSED` items for touched surfaces;
- high-risk touched files lack human approval;
- diff includes forbidden paths.

## Acceptance Criteria

1. `VERSION.md`, `package.json`, `templates/version-record.md`, and workflow version metadata move to `1.12.0`.
2. Change Boundary, Guided Delivery Check, and Baseline State core docs exist.
3. Task/final/review templates carry change-boundary and baseline-state refs where appropriate.
4. `new-workflow-item` can create change-boundary and baseline-state reports.
5. `check-guided-delivery-loop.mjs` passes good examples and fails D3/D4 execution or parking-lot approval fixtures.
6. `check-change-boundary.mjs` passes good examples and fails forbidden-path fixtures.
7. `check-baseline-state.mjs` passes proposed no-code baselines and fails evidence-free confirmed baselines.
8. `check-dev-kit.mjs` covers all three protocols and negative fixtures.
9. GitHub PR checks run on `push` to `main` and include `npm run verify`.
10. Manifest and workflow-version assets include new files and directories.
11. `npm run verify` passes.
12. Release record states limitations and does not claim hard write prevention or production validation.

## Release Evidence

Add:

- `requests/220-change-boundary-baseline-state.md`
- `preflight/220-change-boundary-baseline-state.md`
- `specs/220-change-boundary-baseline-state.md`
- `evals/220-change-boundary-baseline-state.md`
- `tasks/220-change-boundary-baseline-state.md`
- `final-reports/220-change-boundary-baseline-state.md`
- `releases/1.12.0/release-record.md`
- `releases/1.12.0/known-limitations.md`
- `releases/1.12.0/self-check-report.md`

## Open Human Decisions

| Decision | Why It Matters | Recommended Default |
|---|---|---|
| Should every L2 task require a change-boundary report? | More safety but more overhead | Yes for governed/prod-sensitive, optional for ordinary L2 |
| Should no-code baseline reports be generated during `start` or `baseline`? | Could help new users but increase output volume | `baseline` only |
| Should forbidden path patterns be manually editable? | Projects need flexibility | Yes, but human-confirmed |
| Should out-of-scope diff be auto-reverted? | Could be destructive | No; report and stop |

## Final Boundary Statement

1.12.0 should make boundary drift visible and harder to pass through review unnoticed.

It must not claim:

```text
AI can never write outside scope.
No-code baselines are verified.
Draft industrial packs are production-grade.
Reports approve release or risk.
```

The correct claim is:

```text
AI Native Dev Kit can record intended boundaries, compare them with actual changed files, and prevent evidence-free baseline states from being presented as confirmed.
```
