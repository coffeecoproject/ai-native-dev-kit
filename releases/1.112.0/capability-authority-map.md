# IntentOS 1.112 Audit-Only Capability Authority Map

## Status

Initial derived map. Every capability remains `UNPROVEN` until its domain
review proves authority, trigger, evidence production, strict checking,
consumer binding, execution effect, distribution parity, zero-experience
behavior, and positive/adversarial coverage.

This file is review evidence only. It is not a runtime registry, source of
truth, readiness decision, implementation permission, apply permission,
release approval, or completion authority.

## Audit Binding

- Audit commit: `f37436a3102b6b0c96a39aa29d4910bd802a5ffc`
- Frozen behavior baseline: `cc321791f9bb41ee7d4d300970cf0aa07eff2d81`
- IntentOS version: `1.111.1`
- Manifest SHA-256: `8a8e8dea1b84e03a3669525605da735fbe9ac371d200ac6085fe09f2da16f0c5`
- Review Context SHA-256: `7126aa2d96b108a6358e71cbbce073ba99bd3a2eecdfdcea510b8546d45dd1bd`
- Full baseline verification: `npm run verify` passed at `cc32179`
- Plan registration verification: Manifest, Review Context, IntentOS self-check,
  and `git diff --check` passed at `f37436a`
- Excluded concurrent worktree item:
  `docs/plans/controlled-adoption-change-attribution-auto-closeout.md`

The excluded item is not part of the named commit, this map, or the current
audit claims.

## Label Rules

- `VERIFIED_CLOSED`: all nine review dimensions are proved.
- `PARTIAL`: a valid chain exists but one or more required dimensions remain.
- `DISCONNECTED_CONSUMER`: a required downstream consumer does not bind the
  authoritative result.
- `DUPLICATE_AUTHORITY`: more than one source can answer the same final
  question.
- `FAIL_OPEN`: missing, malformed, stale, copied, or conflicting input can
  produce a success-like result.
- `DISTRIBUTION_DRIFT`: source and installed/generated behavior differ.
- `UNPROVEN`: evidence has not yet established closure.
- `NOT_APPLICABLE_WITH_EVIDENCE`: the capability is not required for the
  bounded case and the reason is proved.

## Domain 1: Project Entry

### Public Operating Entry

- Question: which existing source-system route is the next safe route for the
  user's natural-language goal?
- Authority: `core/operating-model.md` and the current source authorities it
  explicitly delegates to; `core/workflow.md` defines the public contract.
- Producer: `scripts/resolve-operating-loop.mjs`; public route is `intentos
  work` in `scripts/cli.mjs`.
- Strict checker/schema/template: no standalone Operating Model artifact
  checker or schema; the output is a derived in-process view.
- Required consumers: CLI `work`, beginner explanation, status/finish/release
  routing, and generated-project public entry.
- Distribution/proof: Manifest `targetCore`/`targetFull`, `init-project`,
  `tests/operating-model.test.mjs`, `tests/understanding-planning-public-ux.test.mjs`.
- Initial label: `UNPROVEN`.

### Project Fact Projection And Entry Trust

- Question: what project is this, what is its current revision/posture, and is
  this exact new/existing-project entry transaction trustworthy?
- Authority: `core/project-entry-adoption-trust.md`,
  `scripts/lib/project-fact-projection.mjs`, and
  `scripts/lib/project-entry-trust.mjs`.
- Producer: `scripts/workflow-next.mjs`, `scripts/start-project.mjs`, and
  `scripts/init-project.mjs`.
- Strict checker/schema/template: project-entry trust and calibration checks;
  `schemas/artifacts/project-entry-trust.schema.json`,
  `schemas/artifacts/project-fact-projection.schema.json`, and
  `schemas/artifacts/project-entry-calibration.schema.json`.
- Required consumers: Operating Model, Task Governance, Business Universe,
  controlled init/update, Evidence Authority, adoption, and apply.
- Distribution/proof: Manifest and installed workflow scripts;
  `tests/project-entry-*.test.mjs`.
- Initial label: `UNPROVEN`.

### Existing-Project Adoption Recommendation

- Question: how deeply should IntentOS enter the current existing project
  without weakening valid project authority?
- Authority: `core/existing-project-safe-adoption-autopilot.md` and
  `core/controlled-native-adoption-autopilot-review.md`.
- Producer: `scripts/resolve-existing-project-adoption-autopilot.mjs` and
  `scripts/resolve-controlled-native-adoption-review.mjs`.
- Strict checker/schema/template:
  `scripts/check-existing-project-adoption-autopilot.mjs`,
  `scripts/check-controlled-native-adoption-review.mjs`, and their schemas and
  templates.
- Required consumers: Operating Model `ADOPT_PROJECT`, native migration,
  controlled apply planning, and adoption assurance.
- Distribution/proof: Manifest, init/update, examples `1.81`/`1.82`, bad
  fixtures, and project-entry consumer-chain tests.
- Initial label: `UNPROVEN`.

### Native Migration And Governance Convergence

- Question: which existing rules are preserved, merged, repaired, blocked, or
  migrated, and has the selected adoption actually become active?
- Authority: `core/native-first-existing-project-migration.md`,
  `core/existing-rule-reconciliation.md`,
  `core/existing-project-governance-convergence.md`, and
  `core/adoption-execution-assurance.md`.
- Producer: native migration, rule reconciliation, convergence, and adoption
  assurance resolvers.
- Strict checker/schema/template: corresponding four checkers, schemas, and
  templates plus `scripts/lib/adoption-apply-chain.mjs`.
- Required consumers: controlled adoption review, Unified Apply Plan, Apply
  Receipt, post-apply activation, and future project entry.
- Distribution/proof: Manifest, init/update, examples `1.62`-`1.71`, bad
  fixtures, and project-entry/adoption tests.
- Initial label: `UNPROVEN`.

## Domain 2: Task Governance

### Work Queue And Interruption Recovery

- Question: what is the one current task, what is paused/backlog, and what may
  resume after a topic change or interruption?
- Authority: `core/work-queue.md` and, for existing projects,
  `core/existing-project-work-queue-takeover.md`.
- Producer: `scripts/resolve-work-queue.mjs` and
  `scripts/resolve-work-queue-takeover.mjs`.
- Strict checker/schema/template: work-queue and takeover checkers;
  takeover schema/template; project-native task evidence may remain mapped.
- Required consumers: Operating Model, Task Governance, Planning Closure,
  Plan Review, Execution Assurance, Completion Evidence, and finish.
- Distribution/proof: Manifest, Starters, init/update, `1.22`/`1.84` examples,
  bad fixtures, and operating/planning tests.
- Initial label: `UNPROVEN`.

### Task Governance And Risk-Proportional Depth

- Question: what is the current task tier and which internal governance chain
  is mandatory?
- Authority: `core/task-levels.md` and
  `core/task-governance-consumer-integration.md`.
- Producer: `scripts/resolve-task-governance.mjs` and
  `scripts/lib/task-entry-binding.mjs`.
- Strict checker/schema/template: `scripts/check-task-governance.mjs`,
  `schemas/artifacts/task-governance.schema.json`, and
  `templates/task-governance-report.md`.
- Required consumers: Business Universe, Business Rule, Impact, Plan Review,
  Verification, Runtime Trust, Execution Assurance, Completion, and release.
- Distribution/proof: Manifest, init/update, `1.83`/`1.85` examples and bad
  fixtures, operating-model and cross-chain tests.
- Initial label: `UNPROVEN`.

### Conversation Drift And Goal Continuity

- Question: is the current turn discussion, continuation, interruption,
  resumption, or a genuinely different goal?
- Authority: `core/conversation-drift-control.md`, `core/goal-mode.md`, and the
  Work Queue current-task identity.
- Producer/checker: conversation-drift and Goal Mode scripts plus Operating
  Model classification.
- Required consumers: public `work`, Work Queue mutation/recovery,
  Subagent dispatch, Planning Closure, and final response.
- Distribution/proof: Manifest, generated assets, `1.6`/Goal Mode examples,
  bad fixtures, and operating-model tests.
- Initial label: `UNPROVEN`.

### Understanding And Planning Closure

- Question: has the current task been understood and planned enough to enter
  implementation review?
- Authority: `core/understanding-planning-closure.md`.
- Producer: `scripts/resolve-planning-closure.mjs` and
  `scripts/lib/planning-closure.mjs`.
- Strict checker/schema/template: `scripts/check-planning-closure.mjs`,
  `scripts/check-execution-entry-contract.mjs`, Planning Closure schema and
  template.
- Required consumers: Operating Model, Plan Review, implementation entry,
  Execution Assurance, and Completion Evidence.
- Distribution/proof: Manifest, all Codex Starters, init/update, and the three
  `understanding-planning-*` tests.
- Initial label: `UNPROVEN`.

## Domain 3: Business Closure

### Business Universe Coverage

- Question: are all applicable business categories, sources, lifecycle stages,
  real generation paths, reverse paths, and verification obligations present?
- Authority: `core/business-universe-coverage.md`.
- Producer: `scripts/resolve-business-universe-coverage.mjs` and
  `scripts/lib/business-universe.mjs`.
- Strict checker/schema/template:
  `scripts/check-business-universe-coverage.mjs`, strict schema, template, and
  checklist.
- Required consumers: Business Rule Closure, Change Impact, Plan Review,
  Verification Plan, Test Evidence, Execution Assurance, Completion, finish.
- Distribution/proof: Manifest, all Starters, init/update, `1.108` examples and
  four Business Universe/project-entry/runtime tests.
- Initial label: `UNPROVEN`.

### Business Rule Closure

- Question: are expected outcomes, actors, scenarios, exceptions, timing,
  historical behavior, and external facts clear enough for implementation?
- Authority: `core/business-rule-closure.md`.
- Producer/checker: `scripts/resolve-business-rule-closure.mjs` and
  `scripts/check-business-rule-closure.mjs`.
- Schema/template: `schemas/artifacts/business-rule-closure.schema.json` and
  `templates/business-rule-closure-card.md`.
- Required consumers: Impact Coverage, Plan Review, Verification Plan,
  Execution Assurance, Completion Evidence, and finish.
- Distribution/proof: Manifest, init/update, `1.75` examples, bad fixtures,
  Business Universe consumer-chain tests.
- Initial label: `UNPROVEN`.

### Product Outcome And First Useful Slice

- Question: what bounded product outcome is useful without confusing a slice
  with total product completion?
- Authority: `core/outcome-baseline.md`, `core/product-baseline.md`,
  `core/ordinary-user-first-slice.md`, and
  `core/product-completeness-gate.md` for their separate questions.
- Producer/checker: first-slice and product-completeness resolvers/checkers;
  product-baseline checker.
- Required consumers: Planning Closure, Change Impact, Verification Plan,
  delivery status, and Completion Evidence when applicable.
- Distribution/proof: Manifest, Starters, examples `1.42`/`1.43`, fixtures,
  and full self-check.
- Initial label: `UNPROVEN`.

## Domain 4: Change Control

### Change Boundary

- Question: what files, surfaces, effects, and exclusions are inside the
  current task, and what is forbidden?
- Authority: `core/change-boundary.md`.
- Producer/checker: change-boundary resolver path and
  `scripts/check-change-boundary.mjs`; template and report directory.
- Required consumers: Plan Review, Unified Apply Plan, Execution Assurance,
  Completion Evidence, and review.
- Distribution/proof: Manifest, init/update, `1.12` examples, bad fixtures,
  consumer-chain/self-check coverage.
- Initial label: `UNPROVEN`.

### Change Impact Coverage

- Question: which user, UI, API, backend, data, permission, integration,
  documentation, migration, test, and release surfaces must change or be
  evidenced as not applicable?
- Authority: `core/change-impact-coverage.md`.
- Producer/checker: `scripts/resolve-change-impact-coverage.mjs` and
  `scripts/check-change-impact-coverage.mjs`.
- Schema/template: Change Impact schema and template.
- Required consumers: Plan Review, Verification Plan, Execution Assurance,
  Completion Evidence, Unified Closure, and release preparation.
- Distribution/proof: Manifest, init/update, `1.48`-`1.51` examples, extensive
  bad fixtures, Business Universe and planning tests.
- Initial label: `UNPROVEN`.

### Review Surface And Patch Classification

- Question: which independent review surfaces apply, and is a proposed repair
  a safe local fix, hardcut, structural remediation, decision need, or unsafe
  patch?
- Authority: `core/review-surface-governance.md` and
  `core/patch-classification.md` for their separate questions.
- Producer/checker: review-surface and patch-classification resolver/checker
  pairs; templates/checklists.
- Required consumers: Plan Review, Review Loop, Subagent dispatch, Execution
  Assurance, repair routing, and Completion Evidence.
- Distribution/proof: Manifest, init/update, examples `1.25`/`1.8`, fixtures,
  self-check.
- Initial label: `UNPROVEN`.

### Control Effectiveness

- Question: did each relied-on control demonstrably affect the current task or
  adoption outcome and can it fail under a meaningful probe?
- Authority: `core/control-effectiveness.md`.
- Producer/checker: `scripts/resolve-control-effectiveness.mjs`,
  `scripts/check-control-effectiveness.mjs`, and library.
- Schema/template: Control Effectiveness schema and template.
- Required consumers: Planning Closure, Plan Review, Execution Assurance,
  Completion Evidence, adoption assurance, and finish where required.
- Distribution/proof: Manifest, all Starters, init/update, and three
  `control-effectiveness*` tests.
- Initial label: `UNPROVEN`.

## Domain 5: Engineering Baselines

### Engineering And Environment Baselines

- Question: what project-wide engineering and environment constraints apply?
- Authority: project-owned baselines reconciled through
  `core/engineering-baseline.md`, `core/environment-baseline.md`, and
  `core/baseline-enforcement.md`.
- Producer/checker: baseline project/selection resolvers and engineering,
  environment, enforcement, and installation checkers.
- Required consumers: Task Governance, Planning Closure, Plan Review,
  implementation, verification, apply, and release.
- Distribution/proof: templates, platform profiles, Manifest, Starters,
  init/update, baseline examples and fixtures.
- Initial label: `UNPROVEN`.

### Platform And Standard Baseline Selection

- Question: which platform profiles and BL0/BL1 standard packs match observed
  project facts?
- Authority: `core/platform-strategy.md`, `core/baseline-state.md`,
  `core/guided-baseline-selection.md`, and
  `core/standard-baseline-pack-registry.md` for their separate questions.
- Producer/checker: platform, standard, guided, state, selection precision, and
  pack resolver/checker families.
- Required consumers: init/update plan, Planning Closure, implementation,
  verification, installed project checks, and release preparation.
- Distribution/proof: profiles, standard baseline packs, Manifest target
  groups, Starters, examples `1.14`-`1.17`, fixtures/self-check.
- Initial label: `UNPROVEN`.

### BL2 Industrial Packs

- Question: which concrete industrial capabilities are required, installed,
  evidenced, and mature for this platform and task?
- Authority: `core/baseline-pack-system.md` and `industrial-packs/index.json`;
  each selected pack owns only its bounded capability requirements.
- Producer/checker: baseline-pack and industrial-baseline resolvers/checkers,
  pack schema and evidence records.
- Required consumers: controlled baseline installation, Planning Closure,
  Plan Review, Verification Plan, release readiness, and installed CI.
- Distribution/proof: Manifest targetFull, selected-only installation,
  platform examples, bad fixtures, and `verify:industrial`.
- Initial label: `UNPROVEN`.

## Domain 6: Execution Governance

### Plan Review

- Question: is the exact current implementation plan complete, current,
  source-bound, reviewable, and non-authorizing?
- Authority: `core/plan-review-gate.md`.
- Producer/checker: `scripts/resolve-plan-review.mjs`,
  `scripts/check-plan-review.mjs`, and
  `scripts/lib/plan-review-binding.mjs`.
- Schema/template: Plan Review schema and template.
- Required consumers: implementation entry, Execution Assurance, Completion
  Evidence, Unified Apply Plan, and Controlled Apply Readiness.
- Distribution/proof: Manifest, init/update, examples `1.88*`, fixtures, and
  execution-distribution tests.
- Initial label: `UNPROVEN`.

### Review Loop And Subagent Orchestration

- Question: how are independent challenge, bounded repair, one-writer
  discipline, and agent closure enforced?
- Authority: `core/review-loop.md`, `core/subagent-orchestration.md`, and
  `core/subagent-dispatch-hygiene.md`.
- Producer/checker: review-loop and subagent orchestration checkers; prompts,
  templates, and run-plan schema.
- Required consumers: Plan Review, Execution Assurance, Completion Evidence,
  final response, and high-risk release review.
- Distribution/proof: Manifest, Starters, examples and bad fixtures,
  self-check.
- Initial label: `UNPROVEN`.

### Controlled Apply Chain

- Question: which exact reviewed action graph may write, under what current
  identity/readiness, and what was actually applied or rolled back?
- Authority: `core/unified-apply-plan.md`,
  `core/approval-record-governance.md`,
  `core/controlled-apply-readiness.md`, and
  `core/apply-execution-receipt.md` for separate stages.
- Producer/checker: apply-plan/readiness resolvers and checkers,
  approval/receipt checkers, `scripts/init-project.mjs`, and path safety.
- Schema/template: Unified Apply Plan, Approval Record, Controlled Apply
  Readiness, and Apply Receipt schemas/templates.
- Required consumers: exact apply replay, adoption activation, baseline
  installation, Completion Evidence for governance changes, and future entry.
- Distribution/proof: Manifest, installed scripts, examples `1.34`/`1.38`/
  `1.40`, bad fixtures, init smoke, atomic rollback tests.
- Initial label: `UNPROVEN`.

### Execution Assurance

- Question: did actual implementation, diff, review, tests, and evidence match
  the current task and reviewed plan without unauthorized scope?
- Authority: `core/execution-assurance-chain.md`.
- Producer/checker: `scripts/resolve-execution-assurance.mjs` and
  `scripts/check-execution-assurance.mjs`.
- Schema/template: Execution Assurance schema and template.
- Required consumers: Completion Evidence, Unified Closure, adoption assurance,
  release preparation, and final reporting.
- Distribution/proof: Manifest, init/update, examples `1.72`-`1.74`, many bad
  fixtures, execution-distribution and consumer tests.
- Initial label: `UNPROVEN`.

## Domain 7: Verification And Evidence

### Verification Plan

- Question: what exact positive, negative, boundary, integration, runtime, and
  project-native obligations must be proved for this task?
- Authority: `core/verification-test-governance.md`.
- Producer/checker: `scripts/resolve-verification-plan.mjs` and
  `scripts/check-verification-plan.mjs`.
- Schema/template: Verification Plan schema and template.
- Required consumers: Runtime Plan, Test Evidence, Execution Assurance,
  Completion Evidence, and finish.
- Distribution/proof: Manifest, init/update, `1.76` examples and bad fixtures,
  Runtime Trust consumer tests.
- Initial label: `UNPROVEN`.

### Verification Runtime Trust

- Question: did verification run against the current code, current service,
  bounded resources, isolated identity, and safely cleaned-up environment?
- Authority: `core/verification-runtime-trust.md`,
  `core/verification-runtime-adapters.md`, and
  `core/verification-runtime-lifecycle.md` for separate stages.
- Producer/executor: runtime plan/lifecycle resolvers and
  `scripts/run-verification-runtime.mjs`.
- Strict checker/schema/template: runtime-plan, lifecycle, and run-manifest
  checkers plus three schemas/templates and runtime libraries.
- Required consumers: Test Evidence, Execution Assurance, Completion Evidence,
  Unified Closure, and release evidence when runtime proof is required.
- Distribution/proof: Manifest, all Starters, init/update, installed CI, and
  runtime trust/lifecycle/consumer tests.
- Initial label: `UNPROVEN`.

### Test Evidence

- Question: which current Verification Plan obligations were actually proved,
  by which current outputs and runtime identity?
- Authority: `core/test-evidence-binding.md`.
- Producer/checker: `scripts/resolve-test-evidence.mjs` and
  `scripts/check-test-evidence.mjs`.
- Schema/template: Test Evidence schema and template.
- Required consumers: Execution Assurance, Completion Evidence, Unified
  Closure, Launch Review, and release evidence.
- Distribution/proof: Manifest, init/update, `1.77` examples and bad fixtures,
  Runtime Trust consumer tests.
- Initial label: `UNPROVEN`.

### Evidence Authority And Same-Run Binding

- Question: does an artifact belong to this project, task, intent, revision,
  source, runtime, and run without path or schema escape?
- Authority: `core/evidence-authority-core.md`,
  `scripts/lib/evidence-authority.mjs`, and
  `scripts/lib/same-run-evidence-envelope.mjs`.
- Producer/checker: shared authority binding used by strict artifact checkers;
  project identity comes from project-fact projection.
- Required consumers: every strict evidence consumer, apply/adoption,
  completion, and release.
- Distribution/proof: trusted schemas and libraries in Manifest, source and
  installed checks, `1.90`/`1.91` regressions, copied/stale/symlink fixtures.
- Initial label: `UNPROVEN`.

### Runtime And Repository Hygiene

- Question: is current Git/CI/artifact/runtime state suitable for the claimed
  execution or release stage?
- Authority: `core/execution-release-runtime-hygiene.md` and
  `core/git-boundary.md` for separate questions.
- Producer/checker: runtime-hygiene resolver/checker and Git boundary checker.
- Required consumers: Execution Assurance, Completion Evidence, apply,
  release evidence, and release execution.
- Distribution/proof: Manifest, installed CI, `1.86` examples/fixtures and
  release tests.
- Initial label: `UNPROVEN`.

## Domain 8: Unified Closure

### Completion Evidence

- Question: are all applicable current business, impact, plan, execution,
  verification, runtime, review, and control obligations satisfied?
- Authority: `core/completion-evidence-gate.md`.
- Producer/checker: `scripts/resolve-completion-evidence.mjs` and
  `scripts/check-completion-evidence.mjs`.
- Schema/template: Completion Evidence schema and template.
- Required consumers: Unified Closure, User Delivery Console, Launch Review,
  and release preparation.
- Distribution/proof: Manifest, init/update, installed CI, `1.78` examples and
  bad fixtures, Runtime Trust and execution tests.
- Initial label: `UNPROVEN`.

### Execution And Guided Closure Views

- Question: what do lower-level execution/review evidence and beginner-facing
  status say without becoming the final authority?
- Authority: `core/execution-review-closure.md` and
  `core/guided-closure-experience.md` for their bounded view questions.
- Producer/checker: execution-closure and guided-closure resolver/checker pairs.
- Required consumers: Unified Closure and User Delivery Console as inputs only.
- Distribution/proof: Manifest, examples `1.32`/`1.52`, fixtures, self-check.
- Initial label: `UNPROVEN`.

### Unified Closure Decision

- Question: can the exact current task be reported complete, and why did the
  stricter current source result dominate?
- Authority: `core/unified-closure-model.md`; Completion Evidence remains the
  required evidence gate and lower closure systems remain inputs.
- Producer/checker: `scripts/resolve-closure-decision.mjs` and
  `scripts/check-closure-decision.mjs`; decision explain trace is derived.
- Schema/template: closure decision template; strict source artifacts retain
  their own schemas.
- Required consumers: `intentos finish`, Operating Model, User Delivery
  Console, Launch Review, and release preparation.
- Distribution/proof: Manifest, init/update, examples `1.53`/`1.54`, bad
  fixtures, operating/execution/runtime tests.
- Initial label: `UNPROVEN`.

### User Delivery Console

- Question: how is the authoritative current state explained in plain language
  without transferring technical judgment or authority to the user?
- Authority: `core/user-delivery-console.md` for presentation only.
- Producer/checker: `scripts/resolve-user-delivery-console.mjs` and
  `scripts/check-user-delivery-console.mjs`.
- Required consumers: CLI `status` and public Operating Model output.
- Distribution/proof: Manifest, init/update, `1.79` examples/fixtures,
  zero-experience tests.
- Initial label: `UNPROVEN`.

## Domain 9: Release And Evolution

### Launch Readiness And Launch Review

- Question: is the current product technically prepared to enter release
  review, without treating readiness as real-world consent?
- Authority: `core/safe-launch.md` and `core/launch-review-view.md` for their
  separate readiness/view questions.
- Producer/checker: launch-readiness checker and launch-review resolver/checker.
- Required consumers: Release Plan, Release Approval, and Release Execution.
- Distribution/proof: Manifest, init/update, examples `1.5`/`1.55`, fixtures,
  release trust tests.
- Initial label: `UNPROVEN`.

### Release Route, Recipe, Handoff, And Plan

- Question: what platform/channel route, prerequisites, bounded runbook, and
  external actions apply to the exact release candidate?
- Authority: `core/release-core-model.md` with bounded authorities in
  `core/release-adapter.md`, `core/release-guide.md`,
  `core/platform-release-recipes.md`, and `core/release-handoff-packs.md`.
- Producer/checker: release adapter/guide/recipe/handoff/plan resolver-checker
  families.
- Required consumers: Release Evidence Gate, Approval Record, Release
  Execution, and User Delivery Console.
- Distribution/proof: Manifest targetFull, init/update, examples `1.57`-`1.67`,
  fixtures and release self-check.
- Initial label: `UNPROVEN`.

### Release Topology And Channel Policy

- Question: which source control, orchestrator, execution backend, transport,
  evidence store, production target, and channel are currently real?
- Authority: `core/release-execution-topology.md`,
  `core/release-topology-consumer-binding.md`,
  `core/release-topology-migration.md`, and
  `core/release-channel-decoupling.md` for separate questions.
- Producer/checker: topology, migration, and channel-policy resolver/checker
  families and libraries.
- Required consumers: release recipe/plan/evidence/approval/execution and
  runtime hygiene.
- Distribution/proof: Manifest, generated projects, installed CI, topology
  tests and channel examples/fixtures.
- Initial label: `UNPROVEN`.

### Release Evidence, Consent, And Execution

- Question: does the exact candidate have current evidence, exact external
  authority/consent where required, and a bounded execution plan that cannot
  assign external effects to Codex?
- Authority: `core/release-evidence-gate.md`,
  `core/release-approval-record.md`, and
  `core/release-execution-protocol.md` for separate stages.
- Producer/checker: release-evidence, approval, and execution resolver/checker
  families plus release trust/action authority libraries.
- Schema/template: Release Evidence Gate, Approval Record, and Execution Plan
  schemas/templates.
- Required consumers: external release action, release observation, rollback,
  and final release report.
- Distribution/proof: Manifest, installed release CI, examples `1.56`/`1.80`/
  `1.93`, bad fixtures, execution-distribution and topology tests.
- Initial label: `UNPROVEN`.

### Governed Learning And Evolution

- Question: which escaped defect, repeated finding, debt, workflow friction,
  Skill candidate, automation candidate, or document lifecycle action may be
  proposed without silently changing active governance?
- Authority: `core/self-iteration.md`, `core/debt-knowledge-handoff.md`,
  `core/skill-governance.md`, `core/automation-governance.md`,
  `core/document-lifecycle.md`, and `core/document-archive-apply.md` for their
  separate questions.
- Producer/checker: debt, document lifecycle/archive, Skill, automation,
  review-loop, and daily-summary tools.
- Required consumers: future task planning and maintainer review only; these
  outputs cannot self-activate governance, hooks, Skills, CI, or release.
- Distribution/proof: Manifest, init/update, examples `1.21`/`1.27`/`1.28`,
  fixtures and self-check.
- Initial label: `UNPROVEN`.

## Cross-Domain Edges Requiring Proof

The following edges are mandatory audit targets, not assumed truths:

1. Project Entry -> Work Queue / Task Governance;
2. Task Governance -> Business Universe / Business Rule depth;
3. Business Universe -> Business Rule -> Impact -> Verification obligations;
4. Change Boundary / Impact -> Plan Review -> actual diff;
5. Project baselines / reconciled rules -> plan, implementation, verification;
6. Planning Closure / Plan Review -> implementation entry;
7. Verification Plan -> Runtime Trust -> Test Evidence;
8. plan, diff, review, runtime, tests -> Execution Assurance;
9. all applicable sources -> Completion Evidence -> Unified Closure;
10. Unified Closure + launch/release sources -> exact external consent and
    bounded Release Execution;
11. Apply Receipt -> post-apply activation -> future Project Entry;
12. escaped defects and repeated findings -> reviewable learning candidates,
    never automatic governance mutation.

## Initial Unknowns

- The derived Operating Model has no standalone strict artifact checker; audit
  must prove whether current route tests and source checks are equivalent or a
  consumer gap exists.
- Some older capabilities use Markdown checks without a dedicated artifact
  schema; audit must distinguish safe non-artifact views from unstructured
  evidence authority.
- Manifest presence proves distribution intent, not installed behavioral
  parity; generated-project probes remain mandatory.
- Historical `Human Approval` and owner fields remain compatibility vocabulary;
  each active consumer must prove current four-class interpretation.
- Grouped authorities above may hide an overlap. Domain reviewers must split a
  row whenever two sources answer the same final question.
- A passing source self-check does not prove a required consumer actually
  consumes the strict result.

## Promotion Rule

No row may move from `UNPROVEN` based only on documentation, source existence,
schema validity, positive fixtures, or a release record. Promotion requires a
current positive path, a meaningful adversarial failure, strict consumer use,
and source/generated parity where the capability is distributed.

## Audit Result Index

The detailed evidence is recorded in `domain-audit-report.md` and
`reproduction-log.md`. These labels supersede the initial labels for this audit
only; they do not change runtime state.

| Capability group | Result | Finding or verified boundary |
|---|---|---|
| Project Entry Trust and identity | `PARTIAL` | Receipt and authority validation is substantial; complete active-output and next-session behavior parity remains unproved. |
| Work Queue and Task Governance | `FAIL_OPEN` | Optional Business Universe routing can remove the minimum non-HIGH planning and completion chain. |
| Business Universe and Business Rule Closure | `PARTIAL` | Strict scenario binding is present when triggered; one-line structural discovery can produce a false not-required result. |
| Change Boundary and Impact | `FAIL_OPEN` | Applicable CI routes accept no Change Boundary report; exact live diff is optional. |
| Baseline selection and packs | `FAIL_OPEN` | Applicable public consumers accept no Standard Baseline Selection report. |
| Planning Closure and Plan Review | `PARTIAL` | Planning Closure interprets source states correctly; generic checker consumers conflate valid artifact with ready decision. |
| Controlled apply | `PARTIAL` | Current approval/identity/hash/rollback chain is materially closed for caught failures; process interruption recovery remains unproved. |
| Runtime Trust and Test Evidence | `PARTIAL` | Strict current controls exist; final Completion Evidence does not independently consume strict Execution Assurance. |
| Completion Evidence and Unified Closure | `FAIL_OPEN`, `DUPLICATE_AUTHORITY` | Public finish can report done before failed mandatory sources dominate. |
| Release execution authority | `VERIFIED_CLOSED` for targeted external-effect assignment | Targeted tests preserve exact external effects as `HUMAN_REQUIRED`; full public release-chain continuity remains `PARTIAL`. |
| Governed evolution | `PARTIAL` | Candidate-only boundaries exist; the complete active guidance graph does not cover all current runtime outputs. |
