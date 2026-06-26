# AI Native Dev Kit Mental Model

This document explains when to use each layer of the dev kit.

It is intentionally short. Use it when a project owner or agent is unsure whether a project needs only the workflow, a platform profile, or BL2 industrial governance.

## The Short Version

Use the smallest layer that can control the risk.

```text
Workflow
  -> Goal Mode
  -> Engineering Baseline
  -> Profile
  -> BL Level
  -> Selected Industrial Pack
  -> Project Evidence
  -> Task Gate
  -> Output Experience
```

For an already governed or already-online project, add one step before setup:

```text
Read-only adoption assessment
  -> Existing governance map
  -> Human approval
  -> Adapter setup, if still needed
```

## Workflow

Use the core workflow for every project.

It answers:

- What is the request?
- Is the request clear enough?
- What is the spec?
- How will the work be evaluated?
- What task is AI allowed to execute?
- What evidence must be reported?
- What should be logged and improved after the task?

If the project is a prototype, internal experiment, or low-risk local tool, the core workflow plus O0/O1 onboarding may be enough.

## Goal Mode

Use Goal Mode when Codex needs to decide what kind of work the human is asking for before creating artifacts or writing code.

It answers:

- Is this discussion only?
- Is this existing project adoption?
- Should Codex define work before implementation?
- Is there an approved task to implement?
- Is the user asking for review, repair, a baseline decision, or a report?

Goal Mode can create `goal-cards/` for durable route records. It is not approval to implement and does not replace task cards, Engineering Baseline, Review Loop, or Human Approval.

## Engineering Baseline

Use Engineering Baseline when Codex is about to make project-wide engineering decisions.

It answers:

- Where does code belong?
- Which types are source of truth?
- How are DTO, schema, domain model, and view model separated?
- Where do API contracts and generated types come from?
- How should enum / string / lookup / state-machine choices be decided?
- Who owns schema, migration, permission, dependency, and cross-module state decisions?

Engineering Baseline does not prescribe a universal directory layout or platform style. It says where the project decision lives and whether Codex may decide.

```text
Codex may follow local patterns for low-risk local work.
Codex must not invent a project standard.
```

If the baseline is missing or ambiguous and the task touches structural engineering decisions, Codex should create a Decision Brief or ask for human confirmation before implementation.

## Profile

Use a profile when the target runtime matters.

Examples:

- `web-app`
- `backend-api`
- `ios-app`
- `android-app`
- `wechat-miniprogram`
- `internal-admin`
- `high-risk-change`

A profile answers:

- What platform is this project built for?
- What docs are required?
- What task level should common risks use?
- What risk gate labels matter?
- What verification evidence is expected?
- What must AI not do without human approval?

Profiles do not replace the workflow. They tune the workflow for the project type.

## BL Level

BL level is project governance strength.

```text
BL0 = lightweight project governance
BL1 = standard project governance
BL2 = industrial project governance with evidence
```

Use BL0 when the project is exploratory and low risk.

Use BL1 when the project has real users, repeated development, or shared ownership.

Use BL2 when the project touches production, sensitive data, permissions, payments, destructive behavior, release risk, regulated work, or long-term maintainability.

## Industrial Pack

Use an industrial pack only when BL2 is selected and the pack is relevant.

An industrial pack answers:

- What baseline docs apply?
- What audit docs apply?
- What checklists apply?
- What evidence must exist?
- Which risks require task level escalation?
- Which actions require human approval?

Industrial packs should not be selected just because they exist. Select them when the project actually needs that runtime, capability, or risk overlay.

The dev kit keeps the industrial pack registry and schemas available by default, but concrete pack files should be installed only when selected. This keeps BL0 and BL1 projects light while preserving a clear path to BL2.

Use `industrial-packs/selection-guide.md` when deciding pack combinations. Web remains the most dogfooded draft pack, and WeChat Mini Program now has a deeper BL2 draft with its own dogfood example. Backend, Auth/Permission, Data Storage, Internal Admin, iOS, Android, CloudBase, Payment/Value Transfer, and High-risk Change packs are also available as BL2 inputs when relevant.

When dogfooding the workflow on a real project, use `.ai-native/templates/dogfood-observation.md` as a separate observation record. It measures whether the workflow is affordable and accurate in practice: setup time, evidence effort, Risk Gate misses, false positives, false negatives, AI drift, and follow-up improvements. It should inform retros and dev-kit proposals, but it should not become another required task gate.

## Existing Governed Project Adoption

Some projects already have strong governance: agent rules, CI gates, guard scripts, baselines, evidence records, release/rollback controls, production lanes, incident response, backup/recovery, or a dirty worktree.

These projects should not be initialized as if they were ordinary existing projects.

`workflow-next` should classify them with project state tags such as:

```text
GOVERNED_EXISTING_PROJECT
PRODUCTION_GOVERNED_PROJECT
DIRTY_WORKTREE_PROJECT
```

When protection is active, the adoption mode is:

```text
ADOPTION_MODE: READ_ONLY
NEXT_ACTION: RUN_ADOPTION_ASSESSMENT
```

In this mode, AI Native Dev Kit should map to existing governance instead of replacing it. Use `templates/adoption-assessment.md` and `templates/existing-governance-map.md` to decide whether adapter docs, workflow assets, or no project writes are appropriate.

If the project is already bootstrapped but is both production-governed and dirty, `workflow-next` can return:

```text
ADOPTION_MODE: GUARDED
NEXT_ACTION: REVIEW_DIRTY_WORKTREE
```

That is not a setup problem. It means task execution should wait until the human confirms what the existing changes are and whether to continue, split, stash, commit, or package them for review.

## Evidence

BL2 requires evidence, not claims.

There are three evidence layers:

```text
Baseline evidence = project-level evidence index
Task evidence = evidence required by the current task risk
Release evidence = evidence needed before a release or rollout
```

`docs/baseline-evidence.md` is the project-level evidence index. It should point to real project files:

```text
Requirement -> Evidence Type -> Evidence Ref -> Status -> Owner -> Review date
```

`Done` means there is a real evidence reference.

`Not applicable` means there is a reason.

`Pending` means the project is not ready for strict BL2 execution.

A task does not need to satisfy the entire industrial pack catalog every time. The task gate should require evidence only for the areas touched by the task risk, while release evidence is checked when the task or release flow actually reaches release readiness.

## Task Gate

The task gate controls what AI may implement.

Before implementation, the task should prove:

- the project baseline is ready
- the task level matches the risk
- Risk Gate labels are checked when high-risk areas appear in the task or related spec
- Risk Gate exclusions are explicit and human accepted when a risk term is mentioned but out of scope
- Human Approval is present when a checked risk requires it
- the eval names the evidence required by selected industrial packs

If a high-risk area appears in the task or related spec but Risk Gate is not checked, ready mode should warn and implementation mode should fail.

If a high-risk term appears only as an explicit non-goal or out-of-scope note, record it in `Risk Gate Exclusions` with a concrete reason and human acceptance. Do not make the wording vague just to pass the checker. More than three accepted exclusions is a signal to review scope quality; implementation then needs Human Approval scope to explicitly cover those exclusions.

## Review Packet

Use a Review Packet when a change needs independent review beyond the implementing agent's final report.

It packages:

- request, preflight, spec, eval, and task refs
- risk gate and human approval state
- baseline and industrial evidence state
- commands run and evidence refs
- files changed and diff summary
- known risks and open questions

It is a review input, not approval. Approval still belongs in the task card, release gate, PR review, or the project's existing governance process.

## Review Loop

Use a Review Loop when a task needs more than a final report:

- L2 work requires a Review Packet and one read-only reviewer pass.
- L3 work requires a Review Packet and independent reviewer, GPT Pro, or human review.
- Review Packet is input.
- GPT Review Prompt is reviewer instruction.
- Review Loop Report is the record of findings, automatic fixes, re-review, and human decisions.

Codex can only auto-fix deterministic, low-risk issues inside the approved task scope, and only for 2 rounds. Scope expansion, risk acceptance, permission model, architecture, dependency, migration, production config, release, rollback, Human Approval, and Approval scope decisions stay with humans.

## Bounded Next-Step

Use Bounded Next-Step when Codex reports possible next work after a task, review, baseline check, or status report.

It does not forbid suggestions. It makes suggestions clear:

- Is this still inside the current task?
- Can AI do it now?
- Does it need a new request, follow-up proposal, preflight, or human decision?
- Is it only context that should not become immediate work?

Allowed types are `IN_SCOPE_NEXT_STEP`, `DIRECT_FOLLOW_UP`, `RISK_DECISION`, `OUT_OF_SCOPE_OBSERVATION`, and `DO_NOT_PROCEED`.

Only `IN_SCOPE_NEXT_STEP` may be handled inside the current task. Other types must be recorded, proposed, routed to humans, or stopped.

## Output Experience

Use Output Experience for every important workflow status, blocked state, review result, baseline result, adoption assessment, release summary, or automation proposal.

It answers:

- What happened?
- Can AI continue?
- Why?
- What does the human need to decide?
- What is the next safe step?
- What may AI do now?
- What must AI avoid?

It does not replace technical details. It moves them after the human-facing summary.

Use:

- `core/output-protocol.md`
- `core/glossary.md`
- `core/next-step-boundary.md`
- `prompts/reporter-agent.md`
- `templates/human-status-report.md`
- `templates/decision-brief.md`
- `templates/plain-review-summary.md`
- `templates/customer-handoff.md`
- `templates/follow-up-proposal.md`
- `templates/final-report.md`

## Practical Choices

Use `docs/artifact-decision-tree.md` when it is unclear which artifact should be created. The decision should start from the current work state, not from the full template list.

Use this decision path:

```text
Starting any project?
  Use core workflow.

Target runtime matters?
  Select profiles.

Production, sensitive, permission, payment, destructive, or release risk?
  Consider BL2.

BL2 selected?
  Install selected industrial packs and require evidence.

Single task touches a risky area?
  Raise task level, check Risk Gate, and require Human Approval where needed.

Reporting status to a human?
  Start with Output Experience, then include technical details.
```

## What Not To Do

- Do not use BL2 for every small experiment.
- Do not select every industrial pack by default.
- Do not treat passing local checks as production readiness.
- Do not let AI approve its own high-risk scope.
- Do not turn framework or hosting preferences into core workflow rules.
