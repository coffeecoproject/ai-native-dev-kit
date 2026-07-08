# IntentOS Version

Current version: `1.83.2`

## Versioning Policy

- Patch changes update templates, prompts, checklists, scripts, or docs without changing required project structure.
- Minor changes add new required workflow assets, profiles, starters, or checks.
- Major changes alter workflow gates, task levels, initialization semantics, or compatibility expectations.

## Current Release

`1.83.2`

Includes:

- Task Governance Review Policy patch `1.83.2`: Task Governance now records
  tier-specific review policy so `LOW`, `MEDIUM`, `POSSIBLE_HIGH`, and `HIGH`
  tasks each have explicit review level, review source, timing, and coverage.
- `1.83.2` remains non-authorizing. It does not write target-project files,
  approve implementation, approve completion, approve commit/push, approve
  release, or replace project-native reviewers.

- Project-Native Evidence Binding patch `1.83.1`: Task Governance now requires
  project-native mappings to carry resolvable artifact refs, matching sha256
  digests, owners, scopes, current-task match, and plain summaries before those
  mappings can satisfy IntentOS behavior.
- `1.83.1` remains non-authorizing. It does not write target-project files,
  install `.intentos/`, replace `AGENTS.md`, change CI/hooks/release rules,
  authorize implementation, approve commit/push, approve release/production, or
  claim task completion.

- Task Impact Tier Classifier phase `1.83.0`: adds Task Governance so Codex can
  classify each task as `LOW`, `MEDIUM`, `POSSIBLE_HIGH`, or `HIGH` and route it
  to the right governance strength before implementation review.
- `1.83.0` keeps behavior-complete existing-project adoption non-authorizing:
  it does not write target-project files, install `.intentos/`, replace
  `AGENTS.md`, change CI/hooks/release rules, authorize implementation, approve
  commit/push, approve release/production, or claim completion.

- Controlled Native Adoption Review hardening patch `1.82.1`: upstream source
  blockers must match the target project before they drive blocked
  recommendations, maturity/recommendation outcomes are checked by a complete
  matrix, light low-risk requires explicit low production sensitivity, and
  source traces include refs, digests, outcomes, project-match status, and
  blocker classes.
- `1.82.1` remains review-only. It does not write target-project files, install
  `.intentos/`, replace `AGENTS.md`, change CI, approve implementation, approve
  release, or claim full adoption.

- Controlled Native Adoption Review phase `1.82.0`: adds `adopt-review` and
  `adopt-review-check` so Codex can judge existing-project governance maturity
  and recommend whether to stay partial, repair governance, prepare a selected
  deeper adoption plan, or remain blocked.
- `1.82.0` is review-only. It does not write target-project files, install
  `.intentos/`, replace `AGENTS.md`, change CI, approve implementation, approve
  release, or claim full adoption.

- Adoption Autopilot Plain-Language And Reference Polish patch `1.81.3`:
  `adopt` Human Summary now uses plain-language adoption state and working-mode
  wording instead of raw internal enums.
- `1.81.3` keeps raw adoption enums in JSON, Outcome, and Technical Trace for
  auditability, adds `adopt` / `adopt-check` to the script reference, and
  exposes Existing Project Safe Adoption Autopilot in the capability table.
- `1.81.3` remains read-only. It does not write target-project files, install
  `.intentos/`, change project authority, approve implementation, or approve
  release.

- Public Entry Adoption Integration patch `1.81.2`: `start` remains read-only
  orientation only, while `adopt` is the public old-project safe adoption
  entry.
- `1.81.2` prevents `start` output from directly recommending workflow-asset
  apply actions. It does not write target-project files, install `.intentos/`,
  change project authority, approve implementation, or approve release.

- Existing Project Safe Adoption Autopilot `1.81.0`: `adopt` now gives old
  projects one read-only result card instead of exposing internal adoption
  commands to the user.
- `1.81.0` separates safe use from full adoption: it may say IntentOS is
  available as a read-only working method, but it does not write target-project
  files, install `.intentos/`, change project authority, or claim full adoption.

- Release Owner And Completion Set Binding patch `1.80.3`: strict Release
  Evidence Gate checks now validate every included Completion Evidence ref,
  bind each completion task back to `release_scope.included_task_refs`, and
  require structured owner readiness for release owner, risk owner,
  environment owner, and non-authorizing release approval refs.
- `1.80.3` remains a review-evidence gate. It does not approve release, deploy,
  submit app-store or mini-program review, execute migrations, record secrets,
  change DNS/payment/CI, or prove real-user stability.

- Release Evidence Gate Runtime Digest and Markdown/JSON Consistency patch
  `1.80.2`: strict release evidence checks now require runtime smoke,
  rollback, and monitoring digest fields when those artifacts are required,
  recompute them from resolved artifacts, and cross-check key human-readable
  Markdown tables against machine-readable JSON.
- `1.80.2` remains a review-evidence gate. It does not approve release, deploy,
  submit app-store or mini-program review, execute migrations, record secrets,
  change DNS/payment/CI, or prove real-user stability.

- Release Evidence Gate Precision patch `1.80.1`: strict release evidence checks
  now recompute source-chain file digests, resolve required build/runtime/
  rollback/monitoring artifacts, run strict Completion Evidence validation when
  current completion is required, and add generated-project smoke coverage for
  `release-evidence` / `release-evidence-check`.
- `1.80.1` remains a review-evidence gate. It does not approve release, deploy,
  submit app-store or mini-program review, execute migrations, record secrets,
  change DNS/payment/CI, or prove real-user stability.

- Release Evidence Gate phase `1.80.0`: Codex can prepare a read-only release
  review evidence package that answers whether a release candidate can be
  handed to a human release owner for formal review.
- `1.80.0` adds `release-evidence` / `release-evidence-check`, structured
  `release_evidence_gate` evidence, release candidate identity, target-specific
  required evidence, source-chain digest binding, owner/approval separation,
  runtime/rollback/monitoring/environment/migration/cost readiness fields, and
  existing-project release SOP mapping.
- `1.80.0` is not release approval. It does not deploy, submit app-store or
  mini-program review, execute migrations, record secrets, change DNS/payment
  providers/CI, or prove real-user stability.

- User Delivery Console Source Signal Calibration patch `1.79.4`: intermediate
  source signals now match the current `--intent` before user-facing task
  completion fields show Business Rule Closure, Change Impact Coverage,
  Verification Plan, Test Evidence, or Execution Assurance as recorded.
- Other-task source records remain visible in Technical Trace and JSON
  `sourceSignals`, but they no longer make the current task look more complete
  than it is.
- `1.79.4` also adds the `1.80` Release Evidence Gate execution and acceptance
  plan. It does not implement the 1.80 gate, add release approval, write target
  files, approve implementation, approve commit/push, approve
  release/production, mutate CI/hooks, or prove real-user stability.

- User Delivery Console Verification Note Polish patch `1.79.3`: `--verification`
  free text is now displayed as a user verification note only, while
  `testCheckEvidenceRecorded` depends on real `test-evidence-reports/`
  artifacts.
- `1.79.3` also records `git diff --check` in release self-check evidence and
  keeps User Delivery Console a derived view. It does not add a completion gate,
  replace Test Evidence, replace Completion Evidence, write target files,
  approve implementation, approve commit/push, approve release/production,
  mutate CI/hooks, or prove real-user stability.

- User Delivery Console Current Task Binding patch `1.79.2`: `status --intent`
  now treats a task as done only when strict Completion Evidence both passes and
  matches the current request intent, while other valid completion records are
  shown as other-task completion records.
- `1.79.2` removes raw internal status enums from the user-facing status card,
  keeps enums in Outcome / JSON / trace, supports `.intentos/` asset checks for
  target projects, and verifies generated status cards through same-card smoke.
- `1.79.2` remains a derived view layer. It does not add a new completion gate,
  replace Completion Evidence, replace Release Plan, write target files,
  approve implementation, approve commit/push, approve release/production,
  mutate CI/hooks, or prove real-user stability.

- User Delivery Console Evidence Validation patch `1.79.1`: `status` now treats
  a task as done only when strict Completion Evidence checks pass, separates
  verification planning from actual test/check evidence, and keeps PR
  generated-project smoke aligned with the `1.78.2` Execution Assurance
  `intent_digest` contract.
- `1.79.1` remains a derived view layer. It does not add a new completion gate,
  replace Completion Evidence, replace Release Plan, write target files,
  approve implementation, approve commit/push, approve release/production,
  mutate CI/hooks, or prove real-user stability.

- User Delivery Console phase `1.79.0`: `status` / `status-check` provide one
  ordinary-user delivery status card that answers what is being built, where
  the work stands, whether the task can be treated as done, what is missing,
  and what Codex can safely do next.
- `1.79.0` is a derived view layer. It does not add a new completion gate,
  replace Completion Evidence, replace Release Plan, write target files,
  approve implementation, approve commit/push, approve release/production,
  mutate CI/hooks, or prove real-user stability.

- Completion Evidence Reference Docs And Compatibility Notes patch `1.78.3`:
  reference docs now expose the Completion Evidence CLI/checker/artifact
  surface, strict-chain compatibility notes explain the `1.78.2` required
  intent fields, and docs call out canonical task intent usage across BRC,
  Verification Plan, Test Evidence, Execution Assurance, and Completion
  Evidence.
- `1.78.3` is a documentation and compatibility-notes patch. It does not
  change checker authority, add a new gate, run tests, approve
  release/production, or prove real-environment behavior.

- Completion Evidence Reference And Intent Contract Sync patch `1.78.2`:
  `source_chain[].intent_digest` is now part of the Completion Evidence schema
  contract, Execution Assurance exposes top-level `intent_digest`, and
  Completion Evidence checks Execution Assurance intent directly.
- `1.78.2` keeps Completion Evidence artifact schema at `1.78.0` and Execution
  Assurance artifact schema at `1.74.0`; this is a contract hardening patch,
  not a new workflow layer.

- Completion Evidence Source Chain Binding patch `1.78.1`: strict Completion
  Evidence checks now verify cross-source refs and digests across Business Rule
  Closure -> Verification Plan -> Test Evidence -> Execution Assurance.
- `1.78.1` validates source artifact schemas, source identity digests, and
  source intent digests before Codex can claim the task is complete. The
  Completion Evidence artifact schema remains `1.78.0`; this is a checker and
  fixture hardening patch.

- Completion Evidence Gate phase `1.78.0`: final task-completion claims now
  require a recorded Business Rule Closure, Verification Plan, Test Evidence,
  and Execution Assurance report to be ready and bound to the same task.
- `1.78.0` adds `completion-evidence` / `completion-evidence-check`,
  structured `completion_evidence_gate` evidence, source-chain readiness checks,
  task-consistency checks, positive BRC -> Verification Plan -> Test Evidence ->
  Execution Assurance -> Completion Evidence example coverage, and bad fixtures
  for missing Test Evidence, task mismatch, and unverified execution.
- `1.78.0` is a completion-claim gate. It does not run tests, write target
  files, approve implementation, approve commit/push, approve release or
  production, prove product correctness, prove real-environment behavior, or
  replace the source systems it consumes.

- Test Evidence Installation And Schema Contract Sync patch `1.77.2`: the
  stricter Test Evidence artifact shape is now explicitly schema `1.77.1`;
  source examples and fixtures are regenerated with matching digests; PR
  generated-project smoke visibly runs BRC -> CIC -> Verification Plan -> Test
  Evidence strict binding.
- `1.77.2` adds Markdown/JSON reason consistency checks for Test Evidence
  coverage maps, test-quality controls, known gaps, manual verification, and
  existing-project mapping. It does not make Execution Assurance require Test
  Evidence by default.

- Test Evidence Identity Hardening patch `1.77.1`: command/test-report
  evidence now records `exit_code` and `failure_reason`; passed evidence must
  resolve to real artifact output with matching digest; required Verification
  Plan test-correctness controls must be preserved in Test Evidence.
- `1.77.1` introduced the stricter Test Evidence report shape; `1.77.2`
  formalizes that shape as Test Evidence artifact schema `1.77.1`.

- Test Evidence Binding phase `1.77.0`: after Verification Plan Governance,
  Codex can record whether concrete evidence actually covers every required
  Verification Plan obligation.
- `1.77.0` adds `test-evidence` / `test-evidence-check`, structured
  `test_evidence` evidence, obligation-to-evidence coverage maps, current-task
  evidence checks, output digest checks, Markdown/JSON consistency checks, and
  bad fixtures for stale, skipped, failed, broad-command, mismatched, or
  ownerless evidence.
- `1.77.0` is an evidence-binding layer. It does not run tests, design tests,
  approve implementation, approve release or production, or prove product
  correctness.

- Verification Plan Consistency Closure patch `1.76.3`: strict checks now reject
  extra Markdown rows that are not present in JSON evidence, cross-check Test
  Correctness Controls, and require READY plans to use `RECORDED` BRC/CIC source
  systems.
- `1.76.3` keeps the Verification Plan artifact schema at `1.76.0`; this is the
  final consistency hardening pass before Test Evidence Binding.

- Verification Plan Markdown/JSON Consistency patch `1.76.2`: strict
  Verification Plan checks now compare human-readable Markdown sections with
  machine-readable JSON evidence for source systems, identity, project
  calibration, affected surfaces, verification obligations, manual verification,
  not-applicable obligations, and outcome.
- `1.76.2` keeps the Verification Plan artifact schema at `1.76.0`; this is a
  report consistency hardening patch, not Test Evidence Binding and not a test
  runner.

- Verification Plan Source Chain Consistency patch `1.76.1`: strict
  Verification Plan checks now prove that the referenced Change Impact Coverage
  report consumed the same Business Rule Closure as the Verification Plan.
- `1.76.1` also binds `source_systems[]` entries to the top-level
  business-rule and impact refs/digests/outcomes, so source trace cannot drift
  into display-only evidence.
- `1.76.1` keeps the Verification Plan artifact schema at `1.76.0`; this is a
  checker and fixture hardening patch, not a new workflow layer.

- Verification Plan Governance phase `1.76.0`: after Business Rule Closure
  and Change Impact Coverage, Codex can produce a read-only Verification Plan
  that binds the current task, rule, and impact report to concrete verification
  obligations.
- `1.76.0` adds `verification-plan` / `verification-plan-check`, structured
  `verification_plan` evidence, strict source binding, broad-command
  rejection, API positive/negative obligation checks, backend rule checks, and
  manual-verification owner checks.
- `1.76.0` is a verification planning layer. It does not execute tests,
  approve implementation, approve release or production, replace Execution
  Assurance, or prove product correctness.

- Business Rule Binding Enforcement patch `1.75.2`: strict
  `--require-business-rule-ref` / `--require-business-rule-ready` checks now
  require Change Impact Coverage machine-readable evidence, Business Rule
  Closure `--out` reports self-reference the actual output path, and
  generated-project smoke proves a saved Business Rule Closure can be strictly
  consumed by a saved Change Impact Coverage report.
- `1.75.2` keeps 1.75.0/1.75.1 artifact schemas compatible. It tightens
  enforcement under explicit strict flags and does not add a new workflow
  layer.

- Business Rule Closure Binding patch `1.75.1`: Business Rule Closure reports
  now validate that `business_rule_ref` points to the current report, and
  Change Impact Coverage strict mode can require a resolvable READY Business
  Rule Closure with matching `business_rule_digest` and `business_rule_state`.
- `1.75.1` keeps 1.75.0 artifact schemas compatible by adding optional
  Change Impact Coverage business-rule binding fields; existing reports remain
  valid unless `--require-business-rule-ref` or `--require-business-rule-ready`
  is explicitly used.

- Business Rule Closure phase `1.75.0`: before Codex turns a user request into
  implementation work, it produces a read-only Business Rule Closure Card that
  summarizes the rule, closes required dimensions, records safe defaults,
  limits user questions, and links the closed rule into Change Impact Coverage.
- `1.75.0` adds `business-rule` / `business-rule-check`, structured
  `business_rule_closure` evidence, positive appointment-service-time example
  coverage, and bad fixtures for partial, overconfident, high-risk, and
  cross-surface rule closure failures.
- `1.75.0` is a generic task-communication layer. Contract, tax, finance, HR,
  legal, payment, privacy, compliance, migration, production, and customer-data
  wording is treated as a risk signal or example; it is not the default business
  domain and does not authorize Codex to approve those decisions.

- Execution Assurance Log And Markdown Consistency patch `1.74.3`: self-check
  output labels now describe the full 1.72-1.74 assurance line, and strict
  checker validation cross-checks Markdown Execution Plan, Actual Diff, and
  Evidence Binding tables against machine-readable JSON evidence.
- `1.74.3` keeps the Execution Assurance artifact schema version at `1.74.0`;
  this patch tightens report consistency checks rather than changing the report
  shape.

- Execution Assurance Runtime Plan Ref Binding patch `1.74.2`: removes
  remaining legacy uppercase runtime vocabulary from active source-repository
  routing and binds `VERIFIED_DONE` to a resolvable execution plan reference.
- `1.74.2` keeps the Execution Assurance artifact schema version at `1.74.0`;
  this patch tightens checker interpretation of existing `execution_plan`
  fields rather than changing the report shape.
- `1.74.2` adds same-report generated-project smoke coverage so an installed
  project writes an Execution Assurance report with `--out` and checks that
  same recorded artifact.

- Execution Assurance vocabulary and docs sync patch `1.74.1`: aligns resolver output, schema enum values, runtime project-state tags, README capability tables, and generated-project smoke coverage after the `1.74.0` strict-binding release.
- `1.74.1` keeps the Execution Assurance artifact schema version at `1.74.0`; this patch fixes repository/tooling consistency and does not introduce a new evidence artifact shape.
- `1.74.1` extends the IntentOS naming hardcut to uppercase legacy identity tokens so generated/runtime signals no longer rely on old product names.

- Execution Assurance Strict Binding phase `1.74.0`: completion claims now require source-system task binding, source outcome, current-task match, and digest-backed evidence identity.
- `1.74.0` rejects verified completion when actual changed files fall outside the reviewed planned target paths, routing the work to scope-drift handling instead of allowing a patch-style close-out.
- `1.74.0` keeps resolver output conservative: changed files are not treated as planned target paths, and declarative refs such as `review:` or `command:` are not accepted as precise completion evidence.

- IntentOS Naming Hardcut phase `1.73.0`: makes IntentOS the only active public product, workflow, CLI, manifest, and generated-asset identity.
- `1.73.0` removes historical CLI aliases from the public package surface, renames generated workflow assets to `.intentos/`, moves the authoritative manifest to `intentos-manifest.json`, and changes manifest version metadata to `intentOSVersion`.
- `1.73.0` keeps old-project asset migration plan-first: existing projects with older generated workflow assets must be detected, planned, approved, and verified before target files are moved or rewritten.

- Execution Assurance empty-report hardening patch `1.72.1`: `execution-assurance-check`, `done-check`, and `verify-execution` now fail when no recorded Execution Assurance Report exists.
- `1.72.1` adds explicit `--allow-empty` only for asset-only maintenance checks, and keeps completion claims bound to saved reports generated with `--out`.
- `1.72.1` keeps the public first-step README focused on `start` / `next` / `doctor` so ordinary users do not need to choose internal proof-chain commands.

- Execution Assurance Chain phase `1.72.0`: adds `execution-assurance` / `execution-assurance-check` so execution-class work cannot be claimed complete without a task-bound proof chain.
- `1.72.0` binds user intent, completion contract, planned impact, execution plan, actual diff, evidence refs, independent review, patch classification, source-system trace, and closure decision into one report.
- `1.72.0` covers feature work, bug fixes, safe patches, old-project adoption, baseline setup, document governance, release preparation, and workflow capability changes without authorizing target-project writes, commit, push, CI/hook mutation, release, production, secrets, migrations, or provider actions.

- Adoption Assurance Evidence Closure patch `1.71.3`: generated assurance and convergence reports can be saved with explicit `--out <relative-report-path>` and then checked as the same artifact.
- `1.71.3` requires every Adoption Assurance surface evidence ref to appear in `evidence_refs`, rejects unknown evidence ref prefixes, and replaces broad authority-block text scanning with typed `authority_block` source evidence.

- Adoption Assurance Evidence Precision patch `1.71.2`: simulation steps now include exit code, read-only marker, target write marker, target diff status, output digest, and outcome; `SIMULATION_PASSED` requires every step to pass with no target diff change.
- `1.71.2` replaces broad source-status text matching in adoption assurance and governance convergence with typed source adapters, and documents target-installed vs source-only assurance assets.

- Adoption Assurance Evidence Hardening patch `1.71.1`: resolver output now records source systems and an actual read-only simulation step trace; upstream blocked evidence prevents `VERIFIED_ACTIVE`; checker validation cross-checks Markdown and JSON state, surface, simulation, and evidence refs before adoption can be claimed.
- `1.71.1` separates no-target-writes, placeholder-only apply-chain presence, incomplete apply evidence, and verified apply evidence; production approval, IntentOS production/business ownership, release SOP replacement, CI/hook mutation, and routine AI log claims remain forbidden.

- Adoption Execution Assurance phase `1.71.0`: adds `adoption-assurance` / `adoption-assurance-check` so old-project IntentOS adoption claims are verified from real surfaces, evidence refs, and read-only simulated task behavior.
- `1.71.0` makes full old-project adoption claimable only as `VERIFIED_ACTIVE`; partial, blocked, missing, or unsupported evidence states must stay plan-first and cannot authorize writes, production, CI/hook mutation, release SOP replacement, or project authority transfer.
- Existing Project Governance Convergence Evidence Consistency patch `1.70.1`: strict convergence reports now require all 9 convergence dimensions in machine-readable evidence, structured upstream source status for Workflow Next / Native Migration / Existing Rule Reconciliation / Release Plan, and cross-checks between Human Summary, Markdown dimensions, Machine-Readable Evidence, and Outcome.
- `1.70.1` treats upstream `BLOCKED` or `NEEDS_INPUT` source systems as blocking evidence, rejects ready/partial convergence claims when upstream source input is unresolved, and adds bad fixtures for upstream-blocked-ready claims, Markdown/JSON state mismatch, Markdown/JSON dimension mismatch, and one-dimension schema drift.
- Existing Project Governance Convergence phase `1.70.0`: adds `convergence` / `convergence-check` so old, governed, production-sensitive, or dirty projects can be summarized against the new-project IntentOS daily workflow target without writing target files.
- `1.70.0` compares workflow, baseline, audit, release, CI/hooks, documents, work queue, AI log policy, and protected authority as convergence dimensions; every dimension still requires human decision and Unified Apply Plan before any target-project write.
- `1.70.0` defines an audit bridge for old projects: pre-IntentOS history is preserved, the adoption point becomes a convergence anchor, and post-adoption evidence should use IntentOS artifacts without rewriting old history or creating routine AI log spam.
- Existing Rule Reconciliation Evidence Consistency patch `1.69.2`: strict reconciliation reports now require `schema_version: 1.69.2`, `evidence_profile: existing-rule-reconciliation-1.69.2`, complete source coverage for every reconciliation item reference, and a complete human-readable IntentOS Adoption Recommendation section
- Existing Project Native Adoption Evidence Hardening patch `1.69.1`: Existing Rule Reconciliation now records rule coverage, blocks selected native adoption when extracted rules are omitted, separates "recommend apply plan now" from "after human review", and makes `doctor --dry-run` show the old-project adoption diagnosis branch instead of the generic missing-asset path
- Existing Project Native Adoption Decision phase `1.69.0`: old-project `doctor` now stops at adoption diagnosis instead of flooding missing workflow assets, and `reconcile-rules --auto-native` can generate temporary read-only Native Migration input so Codex can recommend the safest IntentOS-native adoption path without asking non-technical users to judge technical rules
- Product Adoption Trust Finalization patch `1.68.2`: source-only adoption now documents Node/npm/git prerequisites, CLI help shows all command aliases consistently, dirty-project wording matches stop-first behavior, and release evidence is prepared for GitHub Release publication
- Product Adoption Trust Hardening patch `1.68.1`: workflow-next now recommends plan-first workflow asset updates for existing, governed, unbootstrapped, or version-mismatch projects; dirty worktrees stop before workflow updates or task execution; after human review any workflow asset update remains plan-first; source-only adoption and private security reporting are documented; and CLI aliases now match package bin declarations
- Product Adoption Simplification / Public Entry Consolidation phase `1.68.0`: README, docs, and CLI help now lead with the public entry path `start`, `next`, and `doctor`; new front-door docs explain minimal adoption, existing-project adoption, and maintainer commands without adding workflow authority or changing command behavior
- Release Plan Evidence Hardening phase `1.67.2`: strict Release Plan evidence rejects unsupported extra fields, Chinese unsafe release-plan claims are blocked, the review checklist includes `release_plan_digest`, and private governed-project smoke checks are documented as optional local calibration rather than public required verification
- Release Plan Evidence and Existing-Project Entry Calibration phase `1.67.1`: strict Release Plan checks now validate `release_plan_digest`, cover Web preview, mini-program review, backend API handoff, and governed existing-project examples, and reject unsafe release-plan claims around secrets, Codex release ownership, provider execution, skipped migration, lower-level system replacement, and maximizing governed-project asset migration
- `1.67.1` clarifies `start` / `next` output for old, governed, dirty, or production-sensitive projects: IntentOS Operating Mode is active for planning, routing, review, and comparison, but project asset changes still require Native Migration, Existing Rule Reconciliation, Unified Apply Plan, approval, and Controlled Apply Readiness
- Release Core Model Consolidation phase `1.67.0`: adds `release-plan` / `release-check` so Release Adapter, Release Guide, Platform Release Recipe, Launch Review View, Release Handoff Pack, Release Execution, Native Migration, and Existing Rule Reconciliation can be summarized into one user-facing Release Plan
- `1.67.0` defines Release Plan as a pure view model: it is derived only, source systems remain authoritative, trace explains but does not control execution, and summary state does not drive workflow behavior
- `1.67.0` clarifies existing-project behavior: Codex can work in IntentOS Operating Mode immediately, while baselines, release rules, CI, hooks, and governance files require Existing Rule Reconciliation, migration-depth recommendation, Unified Apply Plan, approval, and Controlled Apply Readiness before changes
- Existing Rule Reconciliation Calibration phase `1.66.0`: adds recommendation-only comparison between existing project rules and IntentOS reference rules after Native Migration planning
- `1.66.0` introduces `existing-rule-reconciliations/`, `reconcile-rules`, `reconcile-rules-check`, structured reconciliation evidence, a governed web-admin positive example, anonymous calibration evidence, and bad fixtures for release SOP replacement, business-rule downgrades, unauthorized writes, skipped approval chains, and gap suggestions treated as approval
- `1.66.0` does not replace business rules, production controls, release SOPs, permissions, compliance, data, payment, tax, finance, HR, legal, secrets, hooks, CI, provider state, or target-project governance files; any future wording change must still go through Unified Apply Plan -> Controlled Apply Readiness -> Approval Record
- Native Migration Classification Calibration phase `1.65.0`: calibrates mixed business + engineering rules, Chinese business/production/permission text, conservative simple table extraction, and Markdown/JSON proposed-action consistency
- `1.65.0` keeps complex or high-risk tables skipped or human-review bound, keeps 1.63 and 1.64 structured records compatible, and does not authorize target-project writes or governance replacement
- `1.65.0` adds a mixed-domain bilingual positive example plus bad fixtures for mixed rule misclassification, Chinese production misclassification, missing table line range, missing complex-table warning, and proposed-action mismatch
- Native Migration Parser Calibration phase `1.64.0`: adds skipped-block and low-signal block visibility for tables, long paragraphs, and ambiguous governance text, and tightens strict Markdown/JSON rule consistency by `rule_id`
- `1.64.0` validates structured `proposed_actions` as plan-only and human-approved, keeps 1.63 structured records compatible, and clarifies workflow-map output as diagnostic before Native Migration Plan
- `1.64.0` adds a table/long-paragraph/bilingual positive example plus bad fixtures for rule JSON mismatch, line-range mismatch, missing skipped-block reporting, and structured action writes
- Native Migration Precision Hardening phase `1.63.0`: upgrades old-project native migration from file-level governance detection to rule-level extraction with source line ranges, context headings, confidence, rule extraction coverage, parser warnings, and machine-readable migration evidence
- `1.63.0` adds `schemas/artifacts/native-migration-plan.schema.json`, `scripts/lib/native-rule-extraction.mjs`, strict `check-native-migration --require-structured-evidence`, a mixed-rule positive example, and bad fixtures for collapsed rules, missing line ranges, structured-evidence mismatch, schema drift, and workflow-map endpoint overclaim
- `1.63.0` keeps old Markdown native migration reports compatible by default; strict structured evidence is required only when explicitly requested for real governance replacement review
- Native-First Existing Project Migration phase `1.62.0`: lets Codex switch old, governed, dirty, or production-maintained projects into IntentOS-native migration planning instead of stopping at adapter-only advice
- `1.62.0` classifies existing rules as business facts, project constraints, production controls, engineering baselines, workflow rules, historical notes, or unknown-authority items before any replacement
- `1.62.0` keeps business and production authority project-owned/human-owned, and routes any approved governance-file edits through Native Migration Plan -> Unified Apply Plan -> Controlled Apply Readiness -> Approval Record
- Release Path Hardening phase `1.61.0`: makes Release Guide defer Release Handoff Pack generation until prerequisite route steps are ready, adds strict machine-readable release handoff evidence, and clarifies that `READY_FOR_HANDOFF_REVIEW` means handoff review only, not release approval
- `1.61.0` treats the Release Handoff Pack as the single source for recipe, structured approval, release owner, rollback, monitoring, post-release smoke, and handoff/execution boundary facts; Release Execution must consume these facts and must not redefine them
- `1.61.0` does not approve release, execute release commands, deploy, publish, upload, submit, migrate, call provider APIs, ask for or store secrets, mutate CI/CD/hooks/DNS/payment/permissions/app-store/mini-program/production data/production config, or make Codex the release owner
- Release Handoff Packs phase `1.60.0`: adds `release-handoff` / `release-handoff-check` so a selected platform recipe and structured release approval can become a bounded handoff package with Codex, human, and external-system ownership separated
- `1.60.0` requires selected recipe, structured approval, release owner, rollback evidence, monitoring evidence, post-release smoke, and close-out evidence before a handoff can be treated as ready
- `1.60.0` does not approve release, execute release commands, deploy, publish, upload, submit, migrate, call provider APIs, ask for or store secrets, mutate CI/CD/hooks/DNS/payment/permissions/app-store/mini-program/production data/production config, turn structured approval into blanket authorization, or make Codex the release owner
- Platform Release Recipes phase `1.59.0`: adds `release-recipe` / `release-recipe-check` so Release Guide can map a launch request to platform-specific release prerequisites without requiring provider command execution
- `1.59.0` ships strict recipes for `web-hosted-preview`, `backend-api-handoff`, and `mini-program-review-handoff`, plus draft recipes for iOS, Android, internal admin, and web container/server release paths
- `1.59.0` does not approve release, deploy, publish, upload, submit, migrate, call provider APIs, ask for or store secrets, mutate CI/CD/hooks/DNS/payment/permissions/app-store/mini-program/production data/production config, or make Codex the release owner
- Release Guide Consolidation phase `1.58.0`: adds `release-guide` / `release-guide-check` so users can say "help me launch" and Codex can route through Release Adapter, Launch Review View, Structured Release Approval, and Release Execution without exposing internal command choice
- `1.58.0` requires structured release approval before execution readiness, adds explicit assist levels, adds command risk classes, distinguishes evidence visibility from evidence quality, and keeps unknown or remote-side-effect commands away from Codex execution by default
- `1.58.0` does not approve release, deploy production, publish previews by itself, run provider API commands, ask for or store secrets, mutate CI/CD/hooks/DNS/payment/permissions/app-store/mini-program/production config, make Codex the release owner, or treat free-form approval text as release approval
- Guided Release Adapter phase `1.57.0`: adds `release-adapter` / `release-adapter-check` so Codex can discover a project-specific release path and translate it into a beginner-readable release profile
- `1.57.0` recommends a safe first release target, records build/test/deploy/environment/rollback/monitoring/owner evidence, and bridges into Release Execution without requiring the user to understand deployment internals
- `1.57.0` does not approve release, deploy production, ask for or store secrets, mutate CI/CD/hooks/DNS/payment/permissions/app-store/mini-program/production config, make Codex the release owner, or treat beginner confirmation as production approval
- Release Execution Protocol phase `1.56.0`: adds `release-execution` / `release-execution-check` so users can turn ready launch review plus human release approval into a bounded release execution plan
- `1.56.0` supports `PLAN_ONLY`, `HUMAN_EXECUTION_HANDOFF`, `ASSISTED_EXECUTION`, and `BLOCKED` modes while keeping high-risk production actions human-owned or external-release-system-owned by default
- `1.56.0` does not approve release, deploy, publish, submit review, run migrations, change production configuration, change secrets/DNS/CI/hooks/payment/permissions/app-store/mini-program settings, replace release SOPs, make Codex the release owner, or treat user confirmation as blanket production authorization
- Launch Review View phase `1.55.0`: adds `launch-view` / `launch-view-check` so users can ask whether closed work can enter launch review without choosing internal evidence commands
- `1.55.0` reuses Unified Closure as the close-out source and Safe Launch readiness labels as the launch label source; it does not create a second launch decision system
- `1.55.0` does not write target-project files, deploy, publish, submit app review, approve release/production, modify CI/hooks, change secrets/DNS/environment/app-store/payment/permission/migration/production data, replace project release SOPs, or approve security/privacy/compliance/legal/tax/finance/payment decisions
- Decision Explain Trace phase `1.54.0`: adds Decision Trace, Dominant Reason, and Conflict Summary to Unified Closure Decisions so the single final answer explains why it was selected
- `1.54.0` keeps `finish` as the user-facing close-out entry, does not add another closure source, and makes `finish-check` reject current Closure Decision records that lack explainability
- `1.54.0` does not write target-project files, authorize implementation, authorize apply, approve commit/push, approve release/production, modify CI/hooks, replace lower-level evidence checks, or approve security/privacy/compliance/payment/migration decisions
- Unified Closure Model phase `1.53.0`: adds Unified Closure Decisions so one task has one final close-out truth while Change Impact Coverage, Execution Closure, Guided Closure, and Evidence Precision remain inputs
- `1.53.0` upgrades `finish` / `finish-check` to the unified decision entry, keeps lower-level 1.49-1.52 scripts available for maintainers and CI, and uses the stricter result when close-out inputs disagree
- `1.53.0` does not remove existing close-out artifacts, migrate historical records, write target-project files, authorize implementation, authorize apply, approve commit/push, approve release/production, modify CI/hooks, replace Review Loop, replace Safe Launch, or approve security/privacy/compliance/payment/migration decisions
- Guided Closure Experience phase `1.52.0`: adds `finish` / `finish-check`, Guided Closure Cards, and a plain close-out entry so users can ask whether a task is done without choosing internal strict evidence commands
- `1.52.0` keeps strict 1.48-1.51 evidence checks available for maintainers and CI while keeping the default user surface read-only and plain-language
- `1.52.0` does not write target-project files, auto-generate missing reports, authorize implementation, authorize apply, approve commit/push, approve release/production, modify CI/hooks, touch production/secrets/payment/permission/migration/data surfaces, replace Review Loop, replace Safe Launch, judge product correctness, or prove production readiness
- Close-Out Evidence Precision phase `1.51.0`: adds `--require-precise-evidence`, exact Change Impact Coverage report checking through `--report`, strict Execution Closure task/intent alignment, weak evidence-file rejection, and real record resolution for `artifact:` / `human-decision:` refs
- `1.51.0` keeps legacy Markdown reports and 1.50 evidence reference checks compatible by default; precision checks run only when explicitly requested
- `1.51.0` does not write target-project files, automatically implement missing surfaces, authorize implementation, authorize apply, approve commit/push, approve release/production, modify CI/hooks, touch production/secrets/payment/permission/migration/data surfaces, replace Safe Launch, judge product correctness, or prove every possible impact was found
- Evidence Reference Resolution phase `1.50.0`: adds `--resolve-evidence-refs` for strict Change Impact Coverage close-out, read-only git changed-file input through `--from-git-diff` / `--cached` / `--base`, and strict Execution Closure linking through `--require-impact-coverage`
- `1.50.0` keeps legacy Markdown reports and 1.49 structured records compatible by default; evidence reference resolution and impact-coverage-required closure checks run only when explicitly requested
- `1.50.0` does not write target-project files, automatically implement missing surfaces, authorize implementation, authorize apply, approve commit/push, approve release/production, modify CI/hooks, touch production/secrets/payment/permission/migration/data surfaces, replace Safe Launch, or prove every possible impact was found
- Structured Impact Coverage phase `1.49.0`: adds `schemas/artifacts/change-impact-coverage.schema.json`, machine-readable Change Impact Coverage evidence, `preflight` / `closure` modes, `--require-structured-evidence`, `--strict-evidence`, changed-file implication checks, a strict 1.49 example, bad fixtures, and Execution Closure citation support
- `1.49.0` keeps legacy Markdown reports compatible by default; strict structured evidence is required only when explicitly requested
- `1.49.0` does not write target-project files, automatically implement missing surfaces, authorize implementation, authorize apply, approve release/production, modify CI/hooks, touch production/secrets/payment/permission/migration/data surfaces, replace Safe Launch, or prove every possible impact was found
- Change Impact Coverage phase `1.48.0`: adds `impact-coverage` and `impact-coverage-check` so Codex can map and close affected user-flow, frontend, API, backend, data, error-copy, test, docs, permission, and release surfaces before a rule or behavior change is treated as complete
- Added `core/change-impact-coverage.md`, `docs/change-impact-coverage.md`, `templates/change-impact-coverage-report.md`, `checklists/change-impact-coverage-review.md`, `prompts/change-impact-coverage-agent.md`, `change-impact-coverage-reports/`, `scripts/resolve-change-impact-coverage.mjs`, `scripts/check-change-impact-coverage.mjs`, a 1.48 example, bad fixtures, generated-project asset coverage, and release evidence
- `1.48.0` does not write target-project files, automatically implement missing surfaces, authorize implementation, authorize apply, approve release/production, modify CI/hooks, touch production/secrets/payment/permission/migration/data surfaces, replace Safe Launch, or prove every possible impact was found
- Evidence Reliability & Risk Calibration phase `1.47.0`: adds structured product-completeness evidence, risk-surface false-positive calibration, a non-Web CLI MVP example, and source-evidence naming cleanup for structured apply candidates
- `1.47.0` does not add an apply runner, write target files, authorize apply, approve implementation, approve release/production, modify CI, install hooks, touch production/secrets/payment/permission/migration/data surfaces, or enable BL2
- Ordinary User Product Loop Hardening phase `1.46.0`: hardens the 1.42-1.45 ordinary-user path with Quickstart entry-first guidance, shared risk-surface analysis, product-completeness explicit evidence support, a second local MVP example, and structured low-risk apply candidate evidence
- `1.46.0` does not add an apply runner, write target files, authorize apply, approve implementation, approve release/production, modify CI, install hooks, touch production/secrets/payment/permission/migration/data surfaces, enable BL2, or promote industrial packs
- Ordinary User Product Loop phase `1.45.0`: completes the 1.42-1.45 first-slice chain with a low-risk controlled apply candidate layer for small, exact, reversible, testable proposed changes
- Ordinary User First-Slice phase `1.42.0`: adds `first-slice` and `first-slice-check` so a plain goal can become a first useful version scope, with at most 3 questions, backlog, verification, and no-write boundaries
- Product Completeness phase `1.43.0`: adds `product-completeness` and `product-completeness-check` so Codex can distinguish idea-only, first-slice-defined, runnable MVP, internal-trial-ready, release-review-needed, and blocked states without approving release
- Real MVP Example Evidence phase `1.44.0`: adds a locally runnable booking web MVP example with first-slice, completeness, final-report, and smoke-test evidence
- Low-Risk Controlled Apply Candidate phase `1.45.0`: adds `apply-candidate` and `apply-candidate-check` so small proposed writes can be classified for later human-approved apply planning without writing files now
- `1.45.0` does not add an apply runner, write target files, authorize apply, approve implementation, approve release/production, modify CI, install hooks, touch production/secrets/payment/permission/migration/data surfaces, enable BL2, or promote industrial packs
- Structured Evidence Hardening patch `1.41.1`: fixes stale 1.41 release evidence, adds `--require-structured-evidence` strict mode to apply/readiness/approval checkers, requires local plan reference resolution in strict readiness/approval checks, rejects non-`NO_APPLY_PLAN` structured readiness evidence with empty actions, and adds strict-mode bad fixtures
- `1.41.1` keeps compatibility fallback by default: historical Markdown artifacts still pass the existing semantic checks unless strict mode is explicitly requested
- `1.41.1` does not add a controlled apply runner, write target files, validate real human identity, authorize automatic apply, approve implementation, approve release/production, install hooks, modify CI, change source of truth, enable BL2, or enable industrial packs
- Structured Evidence Schema phase `1.41.0`: adds machine-readable JSON evidence schemas for Unified Apply Plan, Controlled Apply Readiness, and Approval Record, with canonical apply plan digest validation and digest cross-checks from readiness/approval records back to the referenced apply plan
- Added `schemas/artifacts/unified-apply-plan.schema.json`, `schemas/artifacts/controlled-apply-readiness.schema.json`, `schemas/artifacts/approval-record.schema.json`, `scripts/lib/artifact-schema.mjs`, `docs/structured-evidence-schema.md`, templates with `Machine-Readable Evidence` blocks, examples, bad fixtures, manifest/generated-project coverage, and release evidence
- `1.41.0` does not add a controlled apply runner, write target files, validate real human identity, authorize automatic apply, approve implementation, approve release/production, install hooks, modify CI, change source of truth, enable BL2, or enable industrial packs
- Approval Record hardening patch `1.40.1`: clarifies IntentOS / IntentOS / `intentos` naming, adds artifact lifecycle and O0 / BL0 lightweight path docs, and strengthens Approval Record boundaries for wildcard paths, parent traversal, symlink aliases, expired approvals, ambiguous human owners, mismatched action IDs, and plan-changed-after-approval records
- `1.40.1` remains a stabilization release: it does not add machine-readable apply schemas, controlled apply runner behavior, target-project writes, automatic apply, CI/hook changes, release/production approval, BL2 activation, or industrial pack enablement
- Approval Record Governance phase `1.40.0`: adds a human approval evidence layer after Controlled Apply Readiness so Codex records exactly which action IDs, target paths, plan hash, expiry, rollback, and verification a human approved
- Added `core/approval-record-governance.md`, `docs/approval-record-governance.md`, `templates/approval-record.md`, `approval-records/`, `approval-record-check`, `scripts/check-approval-record.mjs`, `approval-record` artifact generation, examples, bad fixtures, manifest/generated-project coverage, and release evidence
- `1.40.0` does not add an apply runner, write target files, authorize automatic apply, approve implementation, approve release/production, install hooks, modify CI, change source of truth, enable high-risk actions, or let Codex/AI/reviewer/subagent output count as human approval
- Subagent Dispatch Hygiene phase `1.39.0`: adds recover-before-dispatch rules so Codex checks stale helpers, completed helpers, unused planned helpers, task drift, and active writer count before opening or reusing helper agents
- Added `core/subagent-dispatch-hygiene.md`, `docs/subagent-dispatch-hygiene.md`, `Dispatch Hygiene` run-plan fields, generated defaults, checker enforcement, examples, bad fixtures, generated-project copy coverage, and release evidence
- `1.39.0` does not create or close real subagents automatically, add a scheduler, install hooks, call external GPT/API review, modify CI in target projects, approve implementation, approve release/production, or grant new write authority
- Controlled Apply Readiness phase `1.38.0`: adds a pre-execution readiness gate after Unified Apply Plan so Codex can evaluate whether a reviewed plan is eligible for a future human-approved controlled apply step
- Added `core/controlled-apply-readiness.md`, `docs/controlled-apply-readiness.md`, `templates/controlled-apply-readiness-report.md`, `apply-readiness-reports/`, resolver/checker scripts, CLI entries, examples, bad fixtures, manifest/generated-project coverage, and release evidence
- `1.38.0` does not add an apply runner, write target files, authorize apply, approve implementation, approve release/production, install hooks, modify CI, archive/delete/rewrite documents, change source of truth, enable baseline/industrial packs, or approve high-risk decisions
- Conversation-Native Ask phase `1.37.0`: makes natural-language project goals the default conversational entry, internally routing through Beginner Entry behavior without requiring users to know workflow commands
- Added `core/conversation-native-ask.md`, `docs/conversation-native-ask.md`, `templates/conversation-ask-card.md`, `conversation-ask-cards/`, checker/prompt/checklist assets, examples, bad fixtures, manifest/generated-project coverage, and release evidence
- `1.37.0` does not write target files, authorize apply, approve implementation, approve release/production, install hooks, modify CI, archive/delete/rewrite documents, change task state, enable baseline/industrial packs, add an apply runner, or approve high-risk decisions
- Repository Information Architecture phase `1.36.0`: adds documentation entry points, repository structure guidance, document ownership rules, and separates historical plans and roadmaps from active usage docs
- Added `docs/README.md`, `docs/index.md`, `docs/repository-structure.md`, `docs/document-ownership.md`, `docs/plans/`, `docs/roadmaps/`, 1.36 release evidence, manifest coverage, and README product-homepage alignment
- `1.36.0` does not move root workflow artifact directories, change generated-project paths, change CLI behavior, delete historical documents, archive release evidence, or change adoption/baseline/review/hook/apply semantics
- Beginner Entry phase `1.35.0`: adds `ask` and `ask-check` so users can provide one natural-language goal without choosing internal workflow commands
- Added `core/beginner-entry.md`, `docs/beginner-entry.md`, `templates/beginner-entry-card.md`, `beginner-entry-cards/`, resolver/checker scripts, examples, bad fixtures, CI/manifest coverage, and release evidence
- `1.35.0` does not write target files, authorize apply, approve implementation, approve release/production, install hooks, modify CI, archive/delete documents, change task state, enable baseline/industrial packs, or approve high-risk decisions
- Unified Apply Plan phase `1.34.0`: adds one reviewable apply-plan layer before any Codex action that may write target-project files
- Added `core/unified-apply-plan.md`, `docs/unified-apply-plan.md`, `templates/unified-apply-plan.md`, `apply-plans/`, `apply-plan`, `apply-plan-check`, resolver/checker scripts, examples, bad fixtures, CI/manifest coverage, and release evidence
- `1.34.0` does not write target files, approve apply, add a generic executor, apply init/update/baseline/archive/hook actions, enable industrial packs, approve implementation, approve release/production, or approve high-risk decisions
- Evidence-Linked Closure phase `1.33.0`: upgrades execution closure so every `pass` can be linked to Review Surface, Review Loop, Change Boundary, Verification, Debt Handoff, and Delivery Path evidence
- Added `docs/plans/evidence-linked-closure-1.33-plan.md`, evidence-link CLI args, evidence-link report section, 1.33 example, bad fixtures, checker rules, CI/manifest coverage, and release evidence
- `1.33.0` does not apply plans, write target files, approve implementation, authorize commit/push, approve release/production, forgive debt, or approve high-risk decisions
- Execution Review Closure phase `1.32.0`: adds `closure` and `closure-check` so Codex can close a completed task with changed-file scope, review surface closure, verification closure, debt closure, and commit-readiness state
- Added `core/execution-review-closure.md`, `docs/execution-review-closure.md`, execution closure templates/checklists/prompts, `execution-closures/`, resolver/checker scripts, CLI/CI/manifest coverage, a 1.32 example, bad fixtures, and release evidence
- `1.32.0` does not write target files, approve implementation, approve release/production, change task state, forgive debt, replace Review Loop, replace Safe Launch, authorize commit/push, or approve high-risk decisions
- Intent-Aware Deep Guide phase `1.31.0`: adds `guide --deep --intent "<goal>"` so Codex can combine project signals with the user's natural-language goal before choosing read-only downstream checks
- Added intent classification, `intentUnderstanding` JSON output, a user-facing `User Intent` card section, docs/checker/CI coverage, a 1.31 example, and release evidence
- `1.31.0` does not write target files, modify CI, install hooks, delete/archive documents, change task state, approve implementation/release/production, approve high-risk decisions, or make intent classification authoritative
- Deep Guide Orchestration phase `1.30.0`: adds `guide --deep` so Codex can selectively run relevant read-only workflow resolvers and compress the result back into one user-facing Workflow Guidance Card
- Added deep orchestration JSON output, a plain `What I Checked` section, docs/template updates, a 1.30 example, and release evidence
- `1.30.0` does not write target files, modify CI, install hooks, delete/archive documents, change task state, approve implementation/release/production, approve high-risk decisions, or replace detailed downstream evidence
- Hook Policy Hardening phase `1.29.0`: adds `hook-policy` and `hook-policy-check` so Codex can define project-level hook rules, approval owners, and rollback / disable requirements before any hook work is proposed
- Added `core/hook-policy.md`, `docs/hook-policy.md`, `templates/project-hook-policy.md`, `checklists/hook-policy-review.md`, `prompts/hook-policy-agent.md`, `hook-policies/`, `scripts/resolve-hook-policy.mjs`, and `scripts/check-hook-policy.mjs`
- `1.29.0` does not install hooks, modify CI, add blocking gates, call external APIs, store tokens/secrets, enable auto-fix, approve implementation/release/production, or replace Hook Orchestration
- Document Archive Apply phase `1.28.0`: adds `archive-apply` and `archive-apply-check` so Codex can convert archive suggestions into an explicit apply plan without moving, deleting, or rewriting files
- Added `core/document-archive-apply.md`, `docs/document-archive-apply.md`, `templates/document-archive-apply-plan.md`, `templates/archive-index.md`, `checklists/document-archive-apply-review.md`, `prompts/document-archive-agent.md`, `archive-apply-plans/`, `scripts/resolve-document-archive-apply.mjs`, and `scripts/check-document-archive-apply.mjs`
- `1.28.0` does not delete files, move/archive files, rewrite links, change source of truth, replace Document Lifecycle, approve cleanup completion, or authorize archive apply without explicit human approval
- Debt & Knowledge Handoff phase `1.27.0`: adds `debt-handoff` and `debt-handoff-check` so Codex can record interrupted work, known debt, verification notes, files to revisit, human decisions, and where to resume next
- Added `core/debt-knowledge-handoff.md`, `docs/debt-knowledge-handoff.md`, `templates/debt-knowledge-handoff-report.md`, `checklists/debt-knowledge-handoff-review.md`, `prompts/debt-handoff-agent.md`, `debt-handoff-reports/`, `scripts/resolve-debt-handoff.mjs`, and `scripts/check-debt-handoff.mjs`
- `1.27.0` does not forgive debt, approve implementation, approve release/production, change task state, change source of truth, replace Review Loop, or replace Safe Launch
- Delivery Path Governance phase `1.26.0`: adds `delivery-path` and `delivery-path-check` so Codex can report whether a project is an idea, ready for plan, ready for local build, ready for self-test, ready for internal trial, ready for release review, or blocked
- Added `core/delivery-path-governance.md`, `docs/delivery-path-governance.md`, `templates/delivery-path-report.md`, `checklists/delivery-path-review.md`, `prompts/delivery-path-agent.md`, `delivery-path-reports/`, `scripts/resolve-delivery-path.mjs`, and `scripts/check-delivery-path.mjs`
- `1.26.0` does not write target files, change CI/hooks, change task state, approve implementation, approve release/production, replace Safe Launch, or prove real users can use the product
- Review Surface Governance phase `1.25.0`: adds `review-surface` and `review-surface-check` so Codex can decide what must be reviewed before and after execution without asking users to choose technical review types
- Added `core/review-surface-governance.md`, `docs/review-surface-governance.md`, `templates/review-surface-card.md`, `checklists/review-surface-review.md`, `prompts/review-surface-agent.md`, `review-surface-cards/`, `scripts/resolve-review-surface.mjs`, and `scripts/check-review-surface.mjs`
- `1.25.0` always requires `FUNCTIONAL_REVIEW`, `CODE_REVIEW`, `VERIFICATION_REVIEW`, and `DEBT_REVIEW`, then adds data, permission, UX, documentation, release, existing-governance, and security/privacy review surfaces from project signals
- `1.25.0` does not write target files, modify CI, install hooks, delete/archive documents, change task state, approve implementation, approve release/production, or approve security/privacy/compliance/payment/migration/data decisions
- Natural Language Workflow Orchestrator phase `1.24.0`: adds `guide` and `guide-check` so Codex can read a project and return one plain Workflow Guidance Card before users need to understand internal workflow commands
- Added `core/natural-language-orchestrator.md`, `docs/natural-language-orchestrator.md`, `templates/workflow-guidance-card.md`, `templates/user-decision-card.md`, `checklists/workflow-guidance-review.md`, `prompts/workflow-concierge-agent.md`, `workflow-guidance-cards/`, `scripts/resolve-workflow-guidance.mjs`, and `scripts/check-workflow-guidance.mjs`
- `1.24.0` does not write target files, modify CI, install hooks, delete/archive documents, change task state, approve implementation, approve release/production, or approve security/privacy/compliance/payment/migration/data decisions
- Governance verification and README entry patch `1.23.1`: adds `npm run verify:governance` for local workflow-map, doc-lifecycle, work-queue, and hook-plan checks, and adds a plain decision table for which command to run first
- `1.23.1` does not add new workflow assets, execute document archive actions, update task queues, install hooks, modify CI, add blocking gates, call external APIs, or approve implementation/release/production
- Hook Orchestration Governance phase `1.23.0`: adds plan-first hook classification for automatic read-only checks, suggestion-only plans, confirmation-required hooks, and explicit-approval high-risk hooks
- Added `core/hook-orchestration.md`, `docs/hook-orchestration.md`, `templates/hook-orchestration-plan.md`, `checklists/hook-orchestration-review.md`, `prompts/hook-orchestration-agent.md`, `hook-orchestration-plans/`, `scripts/resolve-hook-orchestration.mjs`, and `scripts/check-hook-orchestration.mjs`
- `1.23.0` does not install hooks, modify CI, add blocking gates, call external APIs, enable auto-fix, change target-project files, or approve implementation/release/production
- Work Queue / Todo Governance phase `1.22.0`: adds a dedicated task-state layer for interrupted work, long-running work, pause/resume, backlog parking, and single-current-task enforcement
- Added `core/work-queue.md`, `docs/work-queue.md`, `templates/work-queue-report.md`, `checklists/work-queue-review.md`, `prompts/work-queue-agent.md`, `work-queue/`, `scripts/resolve-work-queue.mjs`, and `scripts/check-work-queue.mjs`
- `1.22.0` does not approve implementation, target-project writes, scope expansion, release/production, hook execution, document cleanup, or stale-work resume without review
- Document Lifecycle Governance phase `1.21.0`: adds read-only `doc-lifecycle` and `doc-lifecycle-check` so Codex can identify source-of-truth docs, stale docs, duplicate docs, archive suggestions, and deprecation suggestions before cleanup
- Existing Project Workflow Adapter phase `1.20.0`: adds read-only `workflow-map` and `workflow-map-check` so Codex can map IntentOS workflow onto existing governed projects before recommending writes
- Added `core/existing-project-workflow-adapter.md`, `docs/existing-project-workflow-adapter.md`, `templates/workflow-adoption-map.md`, `checklists/workflow-adoption-map-review.md`, `prompts/workflow-adapter-agent.md`, `workflow-adoption-maps/`, `scripts/resolve-existing-workflow.mjs`, and `scripts/check-workflow-adoption-map.mjs`
- `1.20.0` does not install target-project workflow assets, change hooks or CI, approve implementation, approve production/release, or solve doc lifecycle, work queue, or hook orchestration phases
- Baseline Selection Precision Metrics patch `1.19.1`: adds scoreboard summary metrics with checker validation, externalizes synthetic fixture case ids to `precision-fixtures.json`, emits precision checker JSON summaries, and exposes the precision check as an explicit PR/release CI step
- `1.19.1` does not add new packs, promote draft packs, enable BL2, approve target-project writes, approve implementation, approve release/production, or claim real-project production validation
- Baseline Selection Precision Calibration phase `1.19.0`: adds a machine-checkable precision scoreboard, synthetic calibration fixtures, and `scripts/check-baseline-selection-precision.mjs` so Guided Baseline Selection can track false positives, false negatives, safe actions, Platform States, and BL2 candidate wording
- `1.19.0` does not add new packs, promote draft packs, enable BL2, approve target-project writes, approve implementation, approve release/production, or claim real-project production validation
- Guided Baseline Selection Check Hardening patch `1.18.1`: makes `Platform States` a required Baseline Decision Card section, validates platform-state enum values and required profile rows, adds bad fixtures for missing/invalid platform states, splits `npm run verify` into named phases, and introduces a baseline-selection precision scoreboard
- `1.18.1` does not add new packs, promote draft packs, enable BL2, approve target-project writes, approve implementation, approve release/production, or claim real-project production validation
- Guided Baseline Selection Calibration phase `1.18.0`: separates current safe action from target candidate level, adds Platform States for monorepos, makes Mini Program cloud functions mark backend/API scope as possible, and tightens internal-admin detection so permission/RBAC vocabulary alone does not infer an admin console
- `1.18.0` does not add new packs, promote draft packs, enable BL2, approve target-project writes, approve implementation, approve release/production, or claim real-project production validation
- Guided Baseline Selection calibration patch `1.17.1`: makes BL2 wording explicitly candidate-only, adds explicit baseline-decision PR/release CI steps, clarifies print-vs-save behavior for Baseline Decision Cards, and declares active maintainer CODEOWNERS for governance-sensitive areas
- `1.17.1` does not add new packs, enable BL2, approve target-project writes, approve implementation, approve release/production, or claim real-project production validation
- Guided Baseline Selection Entry phase `1.17.0`: adds a plain-language Baseline Decision Card, `baseline-decision` CLI entry, decision-card checker, examples, bad fixtures, and generated-project assets for user-readable baseline selection
- `1.17.0` does not make BL2 default, select all packs, approve target-project writes, approve implementation, approve release/production, approve high-risk domain decisions, or replace existing governed project assets
- BL2 Industrial Baseline Deepening phase `1.16.0`: adds a shared depth contract across industrial packs, pack-specific scope/evidence boundaries, risk overlay evidence checks, 1.16 examples, and bad fixtures for missing depth, all-pack BL2 selection, and risk overlay misuse
- `1.16.0` keeps every industrial pack draft, selected-only, evidence-required, human-confirmed, and non-authorizing; it does not make BL2 default, approve target-project writes, approve implementation, approve release/production, or claim real-project production validation
- Standard Baseline Pack Registry hardening patch `1.15.1`: adds index-level schema, index/pack.json consistency checks, local verify resolver execution, environment-standard overclaim fixtures, and explicit CODEOWNERS owner-decision backlog
- `1.15.1` does not add new standard packs, promote draft packs, make BL2 default, enable industrial overlays, approve target-project writes, approve implementation, approve release/production, or claim real-project production validation
- Platform Standard Baseline Packs phase `1.15.0`: adds draft Mini Program, iOS, Android, internal admin, and environment standard packs, platform matrix docs, platform examples, bad fixtures, resolver/checker hardening, and release evidence
- `1.15.0` keeps standard packs draft and inactive by default; it does not make BL2 default, enable industrial overlays, approve target-project writes, approve implementation, approve release/production, or claim real-project production validation
- Standard Baseline Pack Registry hardening patch `1.14.1`: deprecates the lower-level industrial-only resolver for human use, tightens standard pack schema and metadata fields, validates selected profile ids, calibrates public URL handling, and records explicit standard baseline verification evidence
- `1.14.1` does not add new standard packs, promote draft packs, make BL2 default, approve target-project writes, approve implementation, approve release/production, or claim real-project production validation
- Standard Baseline Pack Registry phase `1.14.0`: separates ordinary standard baseline packs from BL2 industrial overlays, adds `standard-baseline-packs/`, three draft standard packs, standard baseline resolver/checkers, CLI commands, CI visibility, and release evidence
- `1.14.0` does not make standard packs active by default, promote draft packs to stable, make BL2 default, approve target-project writes, approve implementation, approve release/production, or claim real-project production validation
- Baseline Pack System phase `1.13.0`: read-only baseline pack recommendation, Baseline Pack Selection Report, pack selection checker, CLI commands, generated-project asset coverage, and release evidence
- `1.13.0` does not promote industrial packs to stable, make BL2 default, select all packs by default, approve target-project writes, or prove real-project production readiness
- Manifest, README & Fallback Sync patch `1.12.1`: manifest `compatibilityPolicy.phase` now matches `intentOSVersion`, phase drift is checked, README self-check guidance includes 1.12 checks and `npm run verify`, and `check-ai-workflow` fallback paths include 1.12 assets
- `1.12.1` does not add standard baseline packs, assign real CODEOWNERS, add automatic GPT/API review, automatically scan real projects, approve target-project writes, or prove production/commercial readiness
- Change Boundary, Guided Delivery Check & Baseline State Guard phase `1.12.0`: recorded change scope proof, standalone guided delivery checks, no-code baseline state protection, and CI/verify integration
- Added `core/change-boundary.md`, `core/baseline-state.md`, `docs/change-boundary.md`, `docs/baseline-state.md`, `docs/guided-delivery-check.md`, Change Boundary and Baseline State report templates, prompts, checklists, examples, bad fixtures, and dedicated checkers
- CLI now includes `guided-delivery`, `change-boundary`, and `baseline-state`; `new-workflow-item` can create Change Boundary and Baseline State reports
- `1.12.0` does not automatically inspect real projects, approve target-project writes, approve production/release/risk decisions, confirm no-code baselines as implemented, add automatic GPT/API review, or promote industrial packs
- Governance Hardening & Drift Guard phase `1.11.0`: README release sync, direct init non-empty protection, manifest reverse drift guard, structured release section checks, and `npm run verify`
- Added `docs/plans/governance-hardening-drift-guard-1.11-plan.md` and `releases/1.11.0/` evidence for this hardening phase
- Direct new-project init now refuses non-empty target directories unless `--force-new-project` is explicitly passed; existing-project update remains plan-first
- `check-manifest` now fails important source assets that are not covered by manifest source or copy-rule inventory
- `check-claim-control` and `check-product-baseline` now require meaningful release section bodies, not only section headings
- `1.11.0` does not promote industrial packs, add production validation, add automatic GPT/API review, add automatic real-project scanning, change license terms, add fake CODEOWNERS, or grant target-project write approval
- Guided Decision & Delivery Loop phase `1.10.0`: Codex recommends the smallest safe path, keeps one current mainline, parks side ideas, and translates raw technical choices into user-owned product/risk decisions
- Added `core/decision-delegation-boundary.md`, `core/guided-delivery-loop.md`, `templates/active-work-thread.md`, `templates/guided-decision-summary.md`, `prompts/delivery-coach-agent.md`, and `docs/guided-decision-delivery-loop.md`
- Added `active-work-threads/` and `guided-decision-summaries/` as optional evidence directories; empty target projects are not forced to create these reports
- `new-workflow-item` can now create `active-work-thread` and `guided-decision-summary` artifacts
- `1.10.0` does not add a new blocking checker, automatic GPT/API review, automatic real-project scanning, target-project write approval, implementation approval, release approval, risk approval, production approval, or weaker patch classification defaults
- Human Decision Summary phase `1.9.0`: decision-heavy output now starts with a clear recommendation, alternatives, file-write impact, risk, and no-decision outcome before technical details
- Added `docs/plans/human-decision-summary-1.9-plan.md` and `releases/1.9.0/` evidence for the output clarity upgrade
- Updated `core/output-protocol.md`, reporter/workflow prompts, human-facing templates, `workflow-next`, `start`, `baseline`, and governance migration reports to use the decision-summary format
- `1.9.0` does not add automatic GPT/API review, automatic real-project scanning, new target-project write authority, release approval, risk approval, or baseline direct apply
- Real adoption calibration phase `1.8.1`: separates recommended profiles from risk/capability packs, adds patch classification false-positive records, and clarifies that `real-adoption` checks recorded reports rather than auto-generating target-project reports
- Added `docs/real-adoption-usage.md`, `templates/patch-classification-false-positive.md`, `patch-classification-false-positives/`, and false-positive validation in `scripts/check-patch-classification.mjs`
- `1.8.1` does not add an automatic real-project scanning runner, target-project write approval, implementation approval, or weaker patch classification defaults
- Real Project Read-only Adoption Trial phase `1.8.0`: sanitized real-project adoption reports, governance maps, patch classification reports, and `scripts/check-real-adoption-trial.mjs`
- Patch Classification Governance phase `1.8.0`: repair scale classification before non-trivial fixes, with `SAFE_LOCAL_FIX`, `BASELINE_ALIGNED_HARDCUT`, `STRUCTURAL_REMEDIATION`, `NEEDS_HUMAN_DECISION`, and `DO_NOT_PATCH`
- Added `core/real-project-adoption-trial.md`, `core/patch-classification.md`, `templates/real-adoption-trial-report.md`, `templates/patch-classification-report.md`, `checklists/real-adoption-trial-review.md`, `checklists/patch-classification-review.md`, `prompts/real-adoption-agent.md`, `prompts/patch-classifier-agent.md`, and `scripts/check-patch-classification.mjs`
- Added `real-adoption-trials/`, `governance-maps/`, and `patch-classifications/` as optional evidence directories; real-project entry remains read-only by default
- Added sanitized read-only evidence for one governed production-sensitive Web project under `real-adoption-trials/`, `governance-maps/`, `patch-classifications/`, and `examples/1.8-real-project-readonly/`
- `1.8.0` does not claim production validation, release approval, security/privacy/compliance approval, target-project write approval, or implementation authorization from patch classification
- First Delivery Walkthrough phase `1.7.0`: complete first-slice walkthrough, Adoption Trial Report, walkthrough agent prompt, and `scripts/check-first-delivery-walkthrough.mjs`
- Added `core/first-delivery-walkthrough.md`, `templates/adoption-trial-report.md`, `checklists/first-delivery-walkthrough-review.md`, `prompts/walkthrough-agent.md`, and `docs/first-delivery-walkthrough.md`
- Added `adoption-trial-reports/` as an optional evidence directory; empty target projects are not forced to create reports
- Added simulated booking mini app walkthrough under `examples/1.7-first-delivery-walkthrough/`
- `1.7.0` does not claim production validation, real-project adoption evidence, automatic release approval, or automatic scope/risk approval
- Conversation Drift Control phase `1.6.0`: turn classification, scope change reports, conversation router prompt, and `scripts/check-conversation-drift.mjs`
- Added `core/conversation-drift-control.md`, `templates/conversation-turn-classification.md`, `templates/scope-change-report.md`, `checklists/conversation-drift-review.md`, `prompts/conversation-router-agent.md`, and `docs/conversation-drift-control.md`
- Added `conversation-turns/` and `scope-change-reports/` as optional routing evidence directories; empty target projects are not forced to create reports
- `DISCUSS_ONLY`, `REVIEW_ONLY`, `PAUSE_OR_STOP`, `DIRECT_FOLLOW_UP`, `SCOPE_CHANGE`, `NEW_TASK`, and `RISK_DECISION` turns cannot silently authorize current-task execution
- Safe Launch / Delivery Readiness phase `1.5.0`: readiness states, launch readiness report, launch readiness agent, and `scripts/check-launch-readiness.mjs`
- Added `core/safe-launch.md`, `templates/launch-readiness-report.md`, `checklists/launch-readiness-review.md`, `prompts/launch-readiness-agent.md`, and `docs/safe-launch.md`
- Added `launch-readiness/` as an optional delivery readiness evidence directory; ready states require verification and no pending human decisions
- `READY_FOR_DEMO`, `READY_FOR_INTERNAL_HANDOFF`, and `READY_FOR_RELEASE_REVIEW` are recommendations only and do not approve production launch
- Context polish phase `1.4.1`: added `docs/context-governance-usage.md`, `docs/minimal-commit-set.md`, and cleaned old guided delivery wording
- Added `docs/roadmaps/delivery-readiness-and-drift-roadmap-1.4.1-1.6.md`, `releases/1.4.1/`, `releases/1.5.0/`, and `releases/1.6.0/`
- CLI now includes `launch-readiness` and `conversation-drift`
- `1.6.0` does not implement external GPT/API hook automation, production deployment automation, legal/compliance approval, or automatic scope approval
- Project Memory & Context Governance phase `1.4.0`: Git Boundary, Context Governance, Learning Candidate, Context Correction Report, and Git Boundary Report
- Added `core/context-governance.md`, `core/git-boundary.md`, context templates, context/Git boundary checklists, `prompts/context-governance-agent.md`, and `scripts/check-context-governance.mjs`
- Added `learning-candidates/`, `context-corrections/`, and `git-boundary-reports/` as candidate and audit directories; candidates are not project facts until approved
- Git-backed source of truth now explicitly overrides model memory, historical AI logs, and unconfirmed Codex inference
- Added 1.4 examples, bad fixtures, generated-project asset installation, and `releases/1.4.0/`
- `1.4.0` does not implement AI self-learning, external memory storage, raw conversation persistence, full secret scanning, or Safe Launch / Delivery Readiness
- Guided Delivery Baseline phase `1.3.0`: product outcome, product boundary, claim control, and assumption visibility
- Added `core/outcome-baseline.md`, `core/product-baseline.md`, `core/claim-control.md`, and `core/assumption-register.md`
- Added `scripts/check-product-baseline.mjs` and `scripts/check-claim-control.mjs`
- Added product/claim templates, checklists, prompts, examples, bad fixtures, and `releases/1.3.0/`
- Final Report, Review Packet, Review Loop Report, Human Status Report, and Customer Handoff templates now include Assumption Register sections for inferred or unconfirmed facts
- Release evidence must distinguish allowed claims, forbidden claims, evidence status, known limitations, and verification
- `1.3.0` does not implement Safe Launch / Delivery Readiness and does not claim production validation
- Engineering and Environment Baseline Guided Setup phase `1.2.0`: `node scripts/cli.mjs baseline <project>` as the second entry after `start`
- `baseline` produces a read-only baseline recommendation with `Can AI write now: No`
- Added `scripts/baseline-project.mjs`, `scripts/check-environment-baseline.mjs`, `scripts/check-baseline-enforcement.mjs`, `core/environment-baseline.md`, `core/baseline-enforcement.md`, `templates/environment-baseline.md`, baseline recommendation/gap templates, and baseline setup docs
- Baseline writes now use `write-plan -> human review -> apply-plan`; apply scope is limited to `docs/engineering-baseline.md`, `docs/environment-baseline.md`, `baseline-recommendations/`, and `baseline-gap-reports/`
- Environment Baseline uses `CONFIRMED`, `PENDING_CONFIRMATION`, and `NOT_APPLICABLE`; secret values, `.env` writes, CI/CD/deploy/production config edits, AGENTS/PR template edits, and industrial-pack writes are forbidden through baseline apply
- Task Card, Review Packet, and Review Loop templates now include engineering/environment baseline reference fields
- Added platform-specific environment topic lists under profiles without duplicating full environment templates per platform
- Added 1.2 examples, bad fixtures for secret misuse and missing baseline refs, and `releases/1.2.0/` simulated baseline guided setup evidence
- BL0/BL1/BL2 behavior stays proportional; BL2 and industrial packs remain opt-in only
- Guided Adoption Entry phase `1.1.0`: `node scripts/cli.mjs start <project>` as the first-hour project adoption entry
- `start` runs read-only project inspection, classifies the target, recommends the adoption path, lists human decisions, and records that no target files were written
- Added `scripts/start-project.mjs`, `scripts/check-guided-adoption.mjs`, `templates/adoption-recommendation-report.md`, `adoption-recommendations/`, `docs/first-hour.md`, `examples/1.1-guided-adoption/`, and `releases/1.1.0/`
- Generated projects now receive the guided adoption entry scripts, saved recommendation directory, local first-hour doc, and recommendation template
- BL2 and industrial packs remain opt-in only and require explicit human confirmation; no platform baseline or industrial pack was deepened in `1.1.0`
- No target project writes are performed by `start`; writes still go through dry-run, write-plan, and apply-plan after human review
- Productization Hardcut phase `1.0.0`: release evidence and adoption entry criteria
- Added `releases/1.0.0/` release record, self-check report, generated-project smoke, update smoke, migration matrix, known limitations, and adoption evidence
- Added `templates/adoption-evidence-report.md` and `templates/productization-trial-report.md`
- `1.0.0` is a minimum productization release: productized CLI, manifest, checks, migration plan, docs, and release evidence are complete
- `1.0.0` does not claim 10/10 real-project evidence; real adoption reports, governed-project adoption, production-sensitive adapter trial, and industrial pack candidate promotion remain future evidence work
- No package publishing, migration apply, external reviewer automation, license term change, or industrial pack promotion is included
- Productization Hardcut phase `0.42.0`: docs information architecture and migration command
- README and README.zh-CN are now short entry pages that link to complete operator, reference, playbook, migration, FAQ, and troubleshooting docs
- Added `docs/operator-manual.md`, `docs/reference/`, `docs/adoption-playbooks/`, `docs/migrations/`, `docs/troubleshooting.md`, and `docs/faq.md`
- `scripts/migrate-project.mjs` powers `intentos migrate` as a plan-only command for `0.33.0 -> 1.0.0`
- `intentos migrate --dry-run` prints a migration plan without writing target project files
- `intentos migrate --write-plan <file>` writes only the requested JSON plan
- `intentos migrate` without `--dry-run` or `--write-plan` fails instead of applying changes
- IntentOS self-check now covers migrate safety and docs IA pointers
- Productization Hardcut phase `0.41.0`: industrial pack maturity and license boundary
- Industrial packs now expose maturity metadata with stage, evidence docs, dogfood, false-positive log, owner, changelog, promotion criteria, demotion triggers, and known limitations
- All concrete industrial packs remain `draft`; no pack is promoted by file completeness alone
- `check-industrial-pack.mjs` now validates maturity metadata/docs and scans draft packs for stable or production-ready overclaims
- `industrial-packs/README.md` and `industrial-packs/selection-guide.md` now define `draft`, `candidate`, `stable`, `deprecated`, and `retired`
- Added `LICENSE-FAQ.md`, `LICENSE-COMMERCIAL.md`, and `NOTICE.md` as conservative license-boundary explanations subordinate to `LICENSE.md`
- Productization Hardcut phase `0.41.0` records that qualified legal review or owner risk acceptance remains required before 1.0 release materials treat license wording as final
- Productization Hardcut phase `0.40.1`: checker library refactor
- Added shared checker helpers under `scripts/lib/args.mjs`, `scripts/lib/markdown.mjs`, `scripts/lib/check-result.mjs`, `scripts/lib/git.mjs`, and `scripts/lib/project-signals.mjs`
- Checker scripts now reuse shared argument parsing, Markdown section extraction, git state, file walking, and result recording helpers where fixture coverage protects behavior
- `init-project.mjs` and `new-workflow-item.mjs` keep local script-specific helpers where behavior differs from generic checker plumbing
- Generated projects now receive the shared helper libraries needed by copied checker scripts
- Productization Hardcut phase `0.40.0`: fixture matrix expansion
- `test-fixtures/` is organized into golden, bad, migration, CLI, init/update, and output-quality fixture areas
- `test-fixtures/fixture-cases.json` now records case type, checker coverage, expected output, and repair guidance
- `scripts/check-fixtures.mjs` supports generated-project setup, migration manifest setup, typed coverage summaries, and clearer failure diagnostics
- Fixture coverage now includes workflow assets, onboarding, workflow version, platform baseline, industrial baseline, manifest, CLI, init/update, frontmatter migration, and workflow-next smoke cases
- Productization Hardcut phase `0.39.0`: artifact frontmatter and schema
- `schemas/artifacts/` defines initial metadata schemas for request, preflight, spec, eval, task, review loop report, goal card, and subagent run plan
- `scripts/lib/frontmatter.mjs` provides dependency-free frontmatter parsing, formatting, and validation
- `scripts/new-workflow-item.mjs` now adds frontmatter to newly generated schema-backed artifacts
- `scripts/check-workflow-artifacts.mjs` validates frontmatter when present and warns for legacy artifacts without frontmatter
- `check-workflow-artifacts.mjs --strict-schema` fails legacy artifacts without frontmatter for migration rehearsals
- generated projects now receive artifact schemas and `scripts/lib/frontmatter.mjs`
- Productization Hardcut phase `0.38.0`: init/update safety
- `scripts/init-project.mjs --dry-run` emits a machine-readable init/update plan without writing target files
- `scripts/init-project.mjs --write-plan <file>` writes a reviewable plan without mutating the target
- `scripts/init-project.mjs --apply-plan <file>` validates target fingerprint and applies the reviewed plan
- `--backup-dir <dir>` preserves overwritten managed workflow assets during apply/update
- direct workflow asset update now requires plan-first flow for governed, production, dirty, or unbootstrapped existing projects
- `scripts/cli.mjs` now separates global dry-run command preview from command-level init/update plan preview
- intentos self-check now covers dry-run, write-plan, apply-plan, stale-plan rejection, backup, and legacy plan-first adoption
- Productization Hardcut phase `0.37.0`: manifest authoritative asset source
- `intentos-manifest.json` is now the authoritative source for source required files, target required paths, workflow readiness paths, workflow version assets, and safe static copy rules
- `check-ai-workflow.mjs`, `workflow-next.mjs`, `check-intentos.mjs`, and `init-project.mjs` now consume manifest data for their asset lists
- generated projects now receive `.intentos/intentos-manifest.json` and `scripts/lib/manifest.mjs`
- `scripts/check-manifest.mjs` now validates authoritative manifest shape, copy rule sources, target group coverage, workflow version asset sync, and script consumption markers
- Productization Hardcut phase `0.36.0`: CLI Front Door
- `package.json` with private package metadata, `intentos` bin mapping, and productization scripts
- `scripts/cli.mjs` as a thin CLI facade for init, update, next, check, doctor, new, fixtures, and self-check
- planned-only `intentos migrate` placeholder that does not pretend migration is implemented before its approved phase
- CLI smoke coverage in `scripts/check-intentos.mjs`, including help, version, dry-run routing, fixture delegation, and generated-project init smoke
- README guidance that prefers CLI for human usage while keeping lower-level scripts for CI, debugging, and exact evidence
- Productization Hardcut phase `0.35.0`: read-only intentos manifest introduction
- `intentos-manifest.json` with grouped source and generated-project asset inventory
- manifest schema, loader, and drift checker through `schemas/intentos-manifest.schema.json`, `scripts/lib/manifest.mjs`, and `scripts/check-manifest.mjs`
- intentos self-check and CI coverage for manifest validation, invalid manifest rejection, and drift reporting
- decision brief and phase evidence for keeping manifest read-only and non-authoritative
- Productization Hardcut phase `0.34.0`: Baseline Freeze + Self CI
- first-party intentos PR and release CI under `.github/workflows/`
- repository PR template, CODEOWNERS draft guidance, CONTRIBUTING, and SECURITY docs
- `0.33.0` baseline freeze evidence and `0.34.0` phase evidence under `releases/`
- task-scoped Goal Card, Subagent Run Plan, Review Packet, Review Loop Report, and Final Report for the phase
- intentos self-check coverage for first-party CI and repository governance assets
- Simulated Goal + Subagent L2 feature dogfood for rehearsing a full task closure without requiring a real project
- `docs/goal-subagent-usage.md` for plain-language Goal Card and Subagent Run Plan usage
- `examples/goal-subagent-l2-feature/` with Goal Card, Subagent Run Plan, Engineering Baseline, request, preflight, spec, eval, task, Review Packet, GPT review prompt, Review Loop Report, final report, follow-up proposal, and review summary
- intentos self-check now validates the Goal + Subagent L2 feature example through Goal Mode, Subagent Orchestration, Engineering Baseline strict mode, workflow artifacts, Review Loop, Bounded Next-Step, and output quality gates
- target-project bootstrap now installs `.intentos/docs/goal-subagent-usage.md` as a usage guide, not as a business workflow artifact
- Subagent Orchestration Protocol for goal-oriented helper-agent planning, read-only research, review, repair analysis, and reporting
- `core/subagent-orchestration.md`, `templates/subagent-run-plan.md`, `checklists/subagent-orchestration-review.md`, and `prompts/engineering-baseline-agent.md`
- `scripts/check-subagent-orchestration.mjs` for enforcing many readers / one writer, role authority, handoff, lifecycle closure, and no lingering `RUNNING` subagents
- `new-workflow-item --type subagent-run-plan`
- generated projects and workflow asset updates now include `subagent-run-plans/` and Subagent Orchestration assets
- Codex, Cursor, Claude, GitHub CI, and PR governance now require subagents to be closed or skipped after handoff so helper agents do not occupy slots after use
- Subagent Orchestration golden example and bad fixtures for unclosed subagents and multiple active writers
- Goal Mode Entry for classifying user intent before selecting workflow artifacts
- `core/goal-mode.md`, `templates/goal-card.md`, `checklists/goal-mode-review.md`, and `prompts/goal-planner-agent.md`
- `scripts/check-goal-mode.mjs` for Goal Card semantic checks
- `new-workflow-item --type goal-card`
- generated projects and workflow asset updates now include `goal-cards/` and Goal Mode assets
- Goal Mode golden example and bad fixtures for invalid mode and read-only adoption write attempts
- CI and intentos self-check now include Goal Mode semantics without requiring every target project to create Goal Cards by default
- Output Quality and Glossary checks for intentos human-facing report quality
- `scripts/score-output-quality.mjs` for scoring final reports, status reports, decision briefs, review summaries, and customer handoffs
- `scripts/check-glossary-usage.mjs` for required plain-language explanations of important workflow terms
- `templates/output-quality-report.md`
- negative fixtures for low-quality output and missing glossary terms
- Fixture runner UX hardening with command and repair guidance in failure output
- expanded negative fixtures for pending Engineering Baseline decisions, excessive AUTO_FIX rounds, and missing human-decision routing for `RISK_DECISION`
- fixture cases now include repair guidance for stable checker maintenance
- Governance Hardening roadmap for 0.30 fixture-driven checks, 0.31 Goal Mode, and 0.32 Subagent Orchestration
- `docs/roadmaps/governance-hardening-roadmap.md`
- `scripts/check-fixtures.mjs` for intentos-only golden example and negative fixture validation
- `test-fixtures/` with bad Engineering Baseline, Review Loop, and Next-Step Boundary cases
- golden examples for Engineering Baseline enum-vs-lookup, DTO/domain boundary, and Next-Step Boundary suggestions
- intentos self-check now runs the fixture suite and asserts that bad fixtures fail for expected reasons
- Engineering Baseline Entry for pre-coding engineering decision governance
- `core/engineering-baseline.md`, `templates/engineering-baseline.md`, `checklists/engineering-baseline-review.md`, and `scripts/check-engineering-baseline.mjs`
- generated projects and workflow asset updates now include `docs/engineering-baseline.md`
- AGENTS, Builder/Reviewer prompts, Cursor, Claude, and GitHub PR governance now constrain Codex from creating or upgrading project-wide engineering conventions without source-of-truth or human approval
- Review Packet now records Engineering Baseline checked/ref/gaps
- dedicated Review Loop L2 dogfood example with request, preflight, spec, eval, task, review packet, GPT review prompt, review loop report, final report, follow-up proposal, and plain review summary
- Review Loop L2 dogfood coverage for `AUTO_FIX`, `NEEDS_HUMAN_DECISION`, `DIRECT_FOLLOW_UP`, and `DO_NOT_PROCEED`
- intentos self-check now validates the dedicated Review Loop L2 dogfood example with workflow artifact, review loop, and next-step semantic gates
- Codex usage guide now documents the GPT Pro semi-automatic review handoff path
- Review Loop semantic checker with task/spec/eval/review-packet reference checks, finding category validation, AUTO_FIX bounds, human-decision routing, and verification-after-fix requirements
- Bounded Next-Step semantic checker with suggestion type validation, Can AI do now consistency, required entry checks, human-decision routing, and DO_NOT_PROCEED guardrails
- Artifact Decision Tree for choosing the right workflow artifact without creating every template by default
- target-project bootstrap now installs `.intentos/docs/artifact-decision-tree.md`
- workflow artifact implementation gate now expects Review Packet and Review Loop Report for L2/L3 tasks
- GitHub Actions workflow includes Review Loop and Next-Step semantic checks
- intentos self-check covers generated-project Review Loop and Next-Step semantic failures
- existing Web and Mini Program BL2 dogfood examples now include Review Packet / Review Loop Report assets and semantic self-check coverage
- Bounded Next-Step Protocol for classifying Codex follow-up suggestions without treating them as execution approval
- `core/next-step-boundary.md` and `checklists/next-step-boundary-review.md`
- follow-up proposal and final report templates
- `new-workflow-item --type follow-up-proposal`
- `new-workflow-item --type final-report`
- generated project and starter directories for `follow-up-proposals/` and `final-reports/`
- AGENTS, Cursor, Claude, and GitHub PR governance for bounded next-step suggestions
- Review Loop separation between current-task findings and future suggestions
- generic workflow starter
- self-iteration loop
- workflow asset update mode
- intentos end-to-end self-check
- Web/backend/internal-admin/high-risk profiles
- iOS and Android profiles/starters
- workflow version records
- project constitution docs for engineering principles and risk policy
- controlled Skill candidate governance
- daily workflow summary automation support
- project-scoped daily automation guidance
- project automation proposal governance
- platform adapter governance synchronization for Codex, Cursor, Claude, GitHub PRs, and GitHub Actions
- generated project baseline checks for PR governance and workflow CI commands
- PR template governance migration report with explicit apply flag during workflow asset updates
- manual PR template governance merges resolve pending migration reports
- project onboarding workflow where AI drafts project context and humans only confirm decisions
- onboarding templates for project profile, technology strategy, business spec index, sample policy, and decision log
- project onboarding baseline and strict readiness check
- quickstart and Codex-first usage guides
- workflow item generator for request, preflight, spec, eval, task, and AI task log files
- workflow artifact quality checker for filled specs, evals, tasks, requests, preflights, and AI logs
- concrete web internal admin first-slice example
- O0/O1/O2 onboarding levels for lightweight, normal, and high-risk adoption
- Codex bootstrap entry prompt for execution-vs-discussion intent gating
- `workflow-next.mjs` project state and next-action detector
- `AGENTS.md` governance migration report with explicit apply flag during workflow asset updates
- workflow artifact checker modes for draft, ready, and implementation gates
- task-scoped workflow artifact checks with graph consistency validation
- structured Human Approval gate for checked risk items
- Human Approval scope gate for checked risk items
- GitHub Actions workflow artifact check uses ready mode only for changed artifacts
- platform baseline profiles with machine-readable baseline JSON
- platform baseline resolver and checker scripts
- `workflow-next` reports platform baseline readiness
- project onboarding checks for O0, O1, and O2 levels
- `workflow-next --enforce` for optional project-state gating
- industrial baseline pack framework with BL0/BL1/BL2 governance levels
- industrial pack schema, index, candidate policy, and full draft pack coverage
- draft industrial packs for Web, iOS, Android, WeChat Mini Program, Backend API, Internal Admin, Data Storage, CloudBase, Auth/Permission, Payment/Value Transfer, and High-risk Change
- industrial pack structure and purity checker
- project-level industrial baseline resolver and checker
- `workflow-next` reports BL2 industrial baseline readiness
- baseline selection and baseline evidence templates
- structured BL2 evidence references with strict existence checks
- workflow artifact implementation checks read platform and industrial baselines
- WeChat Mini Program profile and machine-readable baseline
- necessary Web industrial deepening for form interactions, API failures, accessibility, performance, and runtime evidence
- Risk Gate missed-risk detection for ready and implementation artifact checks
- industrial pack registry and manifest consistency checks
- industrial pack version and stability metadata
- mental model guide for workflow/profile/BL2/industrial pack decisions
- Web BL2 dogfood example connecting baseline selection, evidence, task gate, release record, and AI log
- Mini Program BL2 industrial deepening for runtime, cloud/access rules, auth/permission, privacy/payment, and release review
- Mini Program BL2 dogfood example connecting baseline selection, evidence, task gate, release record, and AI log
- optional Mini Program admin/backend composition guidance through companion industrial packs
- lightweight default industrial pack bootstrap with registry/schema only
- selected industrial pack installation through `--industrial-packs`
- repair hints for missing selected industrial packs in industrial pack and baseline checks
- selected-only industrial pack checks for target projects
- BL2-only industrial baseline checks for routine CI
- `workflow-next` no longer treats the Web industrial pack as a global required asset
- human-accepted `Risk Gate Exclusions` for auditable missed-risk false positives
- abuse guard for tasks with more than three accepted `Risk Gate Exclusions`
- evidence layering guidance for baseline, task, and release evidence
- industrial pack selection guide for primary platform, capability, and risk-overlay combinations
- draft-to-stable promotion requirements for industrial packs
- `check-ai-workflow.mjs --mode core|full` for routine target-project checks versus full asset checks
- target-project bootstrap now carries industrial pack selection guidance without installing concrete packs by default
- dogfood observation template for measuring real project workflow cost, evidence effort, missed-risk behavior, and AI collaboration quality
- README path guidance for O0/BL0, O1/BL1, and O2/BL2 adoption choices
- README quick index includes the Mini Program BL2 dogfood example
- Existing Governed Project Adoption mode for governed, production-sensitive, or dirty projects
- `workflow-next` project state tags, governance signals, and read-only adoption mode
- adoption assessment and existing governance map templates
- guarded task execution for dirty production-governed projects
- review packet template and `new-workflow-item --type review-packet`
- Review Loop Protocol for task-level review, AUTO_FIX, re-review, and human-decision routing
- GPT review prompt template for read-only external reviewer use
- Review Loop Report template and `new-workflow-item --type review-loop-report`
- `new-workflow-item --type gpt-review-prompt`
- review loop directories for generated projects and starter projects
- review loop protocol self-checks in `check-intentos.mjs`
- adoption assessment and governance map generation entries
- Output Experience Protocol for human-first workflow, baseline, adoption, review, release, and audit reporting
- plain-language glossary for IntentOS workflow terms
- reporter agent prompt for converting technical workflow state into human-readable status
- human status report, decision brief, plain review summary, and customer handoff templates
- `workflow-next --format human|technical|json` with human summary before technical fields by default
- workflow item generation for human status reports, decision briefs, plain review summaries, and customer handoffs
- generated project output report directories for status reports, decision briefs, review summaries, and customer handoffs
- AGENTS.md governance includes Output Experience rules
