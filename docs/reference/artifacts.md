# Artifacts Reference

Artifacts make AI work auditable without forcing every task into the heaviest process.

Use `docs/artifact-lifecycle.md` before creating new artifacts. Use `docs/o0-bl0-lightweight-path.md` when the task is a prototype, small tool, or low-risk local change.

## Core Task Artifacts

| Directory | Purpose | When to use |
|---|---|---|
| `requests/` | Capture the user request and problem | Before non-trivial work |
| `preflight/` | Check project state, risk, assumptions, and stop conditions | Before writing code |
| `specs/` | Define expected behavior and interfaces | Before task execution |
| `evals/` | Define acceptance and verification | Before task execution |
| `tasks/` | Bound one executable task | Before implementation |
| `ai-logs/` | Record execution notes | During or after implementation |

## Review Artifacts

| Directory | Purpose |
|---|---|
| `review-surface-cards/` | Selected review surfaces before execution and post-execution close-out contract |
| `change-impact-coverage-reports/` | Affected-surface coverage for validation, rule, API, backend, data, permission, copy, and business-behavior changes |
| `delivery-path-reports/` | Current path toward useful use, self-test, internal trial, release review, or blocked status |
| `ordinary-first-slices/` | First useful version scope for ordinary user goals |
| `product-completeness-reports/` | Product-state, checklist, evidence, gaps, and next-action reports |
| `mvp-example-reports/` | Real MVP example evidence and limitations records |
| `controlled-apply-candidates/` | Low-risk controlled apply candidate records for later human approval |
| `debt-handoff-reports/` | Debt level, verification notes, files to revisit, human decisions, and next-run handoff |
| `closure-decisions/` | Single final close-out decision for a task, with explain trace and stricter result when lower-level inputs disagree |
| `guided-closure-cards/` | Plain close-out status, missing work, safe next action, human decisions, and technical evidence summary |
| `launch-review-views/` | Read-only launch review view built from Unified Closure, Safe Launch labels, launch surface gaps, and human release decisions |
| `release-adapters/` | Beginner-readable project release adapter profiles |
| `release-guides/` | Unified beginner-facing release guide cards that route adapter, launch review, structured approval, and release execution planning |
| `release-recipes/` | Platform release recipes that map platform-specific release prerequisites without executing release actions |
| `release-handoff-packs/` | Bounded release handoff packages that separate Codex, human, and external-system release responsibilities |
| `release-execution-plans/` | Bounded release execution plans after launch review and human release approval |
| `release-plans/` | Pure-view Release Plans that summarize release source systems and existing-project rule comparison without becoming release authority |
| `execution-assurance-reports/` | Task-bound proof chains that bind intent, completion contract, impact, actual diff, evidence, review, patch classification, and source-system trace before Codex claims execution-class work is complete |
| `review-packets/` | Stable input for human, GPT Pro, or reviewer agent |
| `gpt-review-prompts/` | Read-only reviewer prompt |
| `review-loop-reports/` | Findings, AUTO_FIX rounds, verification, and remaining decisions |
| `review-summaries/` | Plain-language review summary |

Review Loop is required for L2/L3 tasks and optional for smaller tasks.

## Planning And Control Artifacts

| Directory | Purpose |
|---|---|
| `conversation-ask-cards/` | Conversation-native entry cards for natural-language user goals |
| `workflow-guidance-cards/` | Plain next-step guidance cards from the natural-language front door |
| `adoption-recommendations/` | Saved first-hour adoption recommendation reports |
| `baseline-recommendations/` | Saved engineering/environment baseline recommendation reports |
| `baseline-gap-reports/` | Durable baseline gap follow-up reports when needed |
| `goal-cards/` | Goal Mode route and task level |
| `subagent-run-plans/` | Helper agent roles, authority, dispatch hygiene, handoff, and closure |
| `decision-briefs/` | Human decision input |
| `follow-up-proposals/` | Suggestions outside the current task |
| `learning-candidates/` | Proposed project memory that is not confirmed yet |
| `context-corrections/` | Evidence-backed correction records for stale or wrong context |
| `git-boundary-reports/` | Commit/PR boundary evidence for IntentOS and context artifacts |
| `launch-readiness/` | Safe Launch / Delivery Readiness reports |
| `conversation-turns/` | Conversation Turn Classification reports |
| `scope-change-reports/` | Scope Change Reports for proposed scope changes |
| `adoption-trial-reports/` | First Delivery Walkthrough and real/simulated adoption trial evidence |
| `real-adoption-trials/` | Real-project read-only adoption trial reports |
| `governance-maps/` | Maps IntentOS concepts to existing project authority |
| `native-migration-plans/` | Plan-only IntentOS-native migration records for old projects; extract and classify old rules before any governance replacement |
| `existing-rule-reconciliations/` | Recommendation-only comparison between existing project rules and IntentOS references after Native Migration |
| `governance-convergence-reports/` | Read-only convergence records that compare old-project workflow, baseline, release, audit, documents, work queue, AI logs, and protected authority against IntentOS daily governance |
| `adoption-assurance-reports/` | Evidence-bound adoption assurance records that verify whether an old project actually works in IntentOS mode through source systems and read-only simulation |
| `patch-classifications/` | Repair-scale classification before non-trivial fixes |
| `patch-classification-false-positives/` | Reviewed calibration records for conservative patch classification triggers |
| `doc-lifecycle-reports/` | Source-of-truth, stale, duplicate, archive, and deprecation candidate reports |
| `archive-apply-plans/` | Plan-only archive action, link-check, archive index, rollback, and human-decision records |
| `apply-readiness-reports/` | Pre-execution readiness reports for reviewed Unified Apply Plans |
| `approval-records/` | Human-owned approval evidence for exact action IDs, target paths, expiry, rollback, verification, and structured release approval |
| `work-queue/` | Current task, paused tasks, backlog / parking lot, and resume review records |
| `hook-orchestration-plans/` | Plan-first hook candidates, H0-H3 classification, approval requirements, and rollback notes |
| `hook-policies/` | Project hook policy, allowed hook classes, approval owners, and rollback / disable rules |
| `active-work-threads/` | Optional current-mainline and parking-lot tracking for broad or drifting work |
| `guided-decision-summaries/` | Optional decision summaries that translate technical choices into user-owned decisions |
| `change-boundary-reports/` | Intended scope versus actual changed files evidence |
| `baseline-state-reports/` | Proposed, pending, evidence-required, or confirmed baseline state evidence |
| `baseline-calibration-reports/` | Read-only real-project evidence used to calibrate baseline selection behavior |
| `baseline-decision-cards/` | Plain-language BL0/BL1/BL2, standard pack, industrial candidate, and human-decision cards |
| `standard-baseline-selections/` | Standard baseline pack recommendations, optional industrial overlays, evidence, and human-decision reports |
| `baseline-pack-selections/` | BL level, profile, pack candidate, not-selected, evidence, and human-decision reports |

False-positive records are not overrides. They document reviewed calibration only; the original patch classification remains authoritative until a new classification report or explicit human decision changes it.

Goal Card is not approval to implement. Subagent output is not authority. Human Approval remains separate.

Assumption Register is a report section or template, not a mandatory directory. Use it when a report, review, or handoff depends on inferred or unconfirmed facts.

Structured evidence blocks are not separate artifact directories. Use `docs/structured-evidence-schema.md` and `schemas/artifacts/` for the machine-readable JSON evidence inside Unified Apply Plan, Controlled Apply Readiness, Approval Record, Low-Risk Controlled Apply Candidate, Change Impact Coverage, Native Migration, Existing Rule Reconciliation, Governance Convergence, Release Plan, Adoption Assurance, and Execution Assurance artifacts. Product completeness can also cite structured JSON evidence files through `--evidence`. Schema files alone are not the complete safety boundary; run the corresponding checker, use `--require-structured-evidence` when new artifacts must be strict, and use `--resolve-evidence-refs` when Change Impact Coverage `DONE` evidence must point to real local evidence or accepted recorded refs.

## Reporting Artifacts

| Directory | Purpose |
|---|---|
| `final-reports/` | Durable task result |
| `status-reports/` | Human-readable status |
| `customer-handoffs/` | Delivery or milestone handoff |
| `releases/` | Release and evidence records |

Release records for meaningful IntentOS phases should include allowed claims, forbidden claims, evidence status, known limitations, and verification.

## Self-Iteration Artifacts

| Directory | Purpose |
|---|---|
| `workflow-retros/` | Retrospective notes |
| `workflow-improvements/` | Process improvement proposal |
| `skill-candidates/` | Candidate repeatable Skill |
| `automation-proposals/` | Candidate automation |
| `intentos-proposals/` | Proposed intentos change |

These artifacts should not be treated as automatic permission to extend scope.

## Project Docs

Common target-project docs:

- `docs/project-onboarding.md`
- `docs/project-profile.md`
- `docs/tech-stack-strategy.md`
- `docs/business-spec-index.md`
- `docs/sample-policy.md`
- `docs/onboarding-decisions.md`
- `docs/verification-matrix.md`
- `docs/engineering-baseline.md`
- `docs/environment-baseline.md`

Engineering Baseline covers decisions such as enum vs string vs lookup, DTO/domain/API boundaries, generated types, folder structure, permission model, migration rules, and cross-module state.

Environment Baseline covers local runtime, package manager, environment variable inventory, secret boundary, external services, test environment, CI/CD, preview/staging/production status, release, rollback, logs, monitoring, and alerts. It records facts and pending decisions; secret values must never be written into it.

Product Baseline and Claim Control live under `.intentos/core/` in generated projects. They constrain workflow changes, release wording, public summaries, final reports, and handoffs; they do not add approval authority to AI.

Context Governance and Git Boundary live under `.intentos/core/` in generated projects. They constrain how Codex proposes project memory, corrects stale context, and decides what belongs in Git. Learning candidates and context corrections are not project facts until approved.

Safe Launch lives under `.intentos/core/` in generated projects. It constrains readiness wording and keeps demo, internal handoff, release review, blocked, and not-ready states separate from production approval.

Launch Review View lives under `.intentos/core/` in generated projects. It answers whether closed work can enter launch review by reusing Unified Closure and Safe Launch labels. It does not approve release, deploy, submit review, change production configuration, or replace the project release SOP.

Release Execution Protocol lives under `.intentos/core/` in generated projects. It turns ready launch review plus explicit human release approval into a bounded release execution plan. It does not approve release, deploy by itself, submit app review, run migrations, change production configuration, or make Codex the release owner.

Release Handoff Packs live under `release-handoff-packs/` in generated projects. They turn selected platform recipes and structured release approvals into bounded handoff packages. From 1.61 onward, strict handoff evidence uses `schemas/artifacts/release-handoff-evidence.schema.json` so recipe, approval, owner, rollback, monitoring, post-release smoke, and handoff/execution boundaries are machine-checkable. They do not approve release, execute release commands, call provider APIs, upload packages, submit review, run migrations, change production configuration, or make Codex the release owner.

Guided Release Adapter lives under `.intentos/core/` in generated projects. It discovers a project-specific release path, recommends a safe beginner target, records missing release inputs, and bridges into Release Execution. It does not approve release, deploy production, request/store secrets, mutate release infrastructure, or make Codex the release owner.

Conversation Drift Control lives under `.intentos/core/` in generated projects. It constrains how Codex handles discussion-only turns, scope changes, new tasks, direct follow-ups, and risk decisions during active work.

Real Project Read-only Adoption Trial and Patch Classification Governance live under `.intentos/core/` in generated projects. They constrain how Codex enters governed or production-sensitive projects and prevent unsafe symptom patches from being treated as safe local fixes.

Decision Delegation Boundary and Guided Delivery Loop live under `.intentos/core/` in generated projects. They constrain how Codex recommends the next safe path, keeps one current mainline, parks side ideas, and avoids pushing raw technical decisions onto non-expert users.

Change Boundary and Baseline State Guard live under `.intentos/core/` in generated projects. They constrain how Codex proves edits stayed inside scope and how no-code baselines are described before evidence exists.

Baseline Pack System lives under `.intentos/core/` in generated projects. It constrains how Codex recommends BL0/BL1/BL2, platform packs, capability packs, and risk overlays without silently approving BL2, draft packs, target-project writes, release, or production readiness.

Standard Baseline Pack Registry lives under `.intentos/core/` in generated projects. It constrains how Codex recommends ordinary engineering baseline packs before optional BL2 industrial overlays, and keeps standard selection separate from implementation approval. Platform standard baseline packs add Web, Mini Program, iOS, Android, internal admin, and environment guidance without making backend, release, or industrial overlays default.

Guided Baseline Selection lives under `.intentos/core/` in generated projects. It turns baseline choice into a Baseline Decision Card so the user confirms project state, risk, BL level, and write permission without needing to understand internal resolver names.

Natural Language Workflow Orchestrator lives under `.intentos/core/` in generated projects. It turns a broad user goal, project path, repository, or next-step question into one Workflow Guidance Card without requiring the user to choose internal workflow commands.

Conversation-Native Ask lives under `.intentos/core/` in generated projects. It makes a plain user goal equivalent to Beginner Entry behavior in conversation, without requiring the user to know or run CLI commands first.

Controlled Apply Readiness lives under `.intentos/core/` in generated projects. It checks whether a Unified Apply Plan is eligible for a future human-approved controlled apply step, while keeping actual apply, implementation, release, production, hooks, CI, archive, and high-risk decisions unauthorized.

Approval Record Governance lives under `.intentos/core/` in generated projects. It records what a human explicitly approved after readiness: exact action IDs, target paths, plan hash, expiry, rollback acknowledgement, and verification acknowledgement. It does not execute writes, authorize automatic apply, approve implementation, approve release/production, install hooks, change CI, or enable high-risk actions.

Review Surface Governance lives under `.intentos/core/` in generated projects. It lets Codex select the surfaces that must be reviewed before and after execution, while keeping Review Surface Cards read-only and non-approving.

Change Impact Coverage lives under `.intentos/core/` in generated projects. It helps Codex avoid partial implementation by recording affected user-flow, frontend, API, backend, data, error-copy, test, docs, permission, and release surfaces before a rule or behavior change is treated as complete.

Delivery Path Governance lives under `.intentos/core/` in generated projects. It explains whether a project is still an idea, ready for plan, ready for local build, ready for self-test, ready for internal trial, ready for release review, or blocked, while keeping Delivery Path Reports read-only and non-approving.

Debt & Knowledge Handoff lives under `.intentos/core/` in generated projects. It records what remains unfinished, how to verify it, which files or areas to revisit, and where to resume next time. It does not forgive debt, approve implementation, approve release or production, change task state, change source of truth, replace Review Loop, or replace Safe Launch.

Unified Closure Model lives under `.intentos/core/` in generated projects. It makes one task close-out resolve to one final Closure Decision. Decision Explain Trace explains why that result was selected. Change Impact Coverage, Execution Closure, Guided Closure, and precise evidence checks are inputs, not competing final truth.

Guided Closure Experience lives under `.intentos/core/` in generated projects. It answers "can this task be treated as done?" with one read-only Guided Closure Card, while keeping strict Change Impact Coverage, Execution Closure, and precise evidence checks available for maintainers and CI.

Execution Assurance Chain lives under `.intentos/core/` in generated projects. It prevents Codex from claiming execution-class work is complete unless the completion contract, actual diff, evidence refs, review result, patch classification, and source-system trace are recorded in `execution-assurance-reports/`. It does not write target-project files, approve implementation beyond the recorded scope, approve commit or push, approve release or production, mutate CI/hooks, touch secrets, run migrations, or replace source systems.

Source profiles live under `profiles/`. Platform adapter instructions live under `platforms/`.

## Frontmatter

New generated artifacts include machine-readable frontmatter. Markdown remains the human-readable source, but frontmatter helps checkers avoid brittle parsing.

Legacy artifacts without frontmatter may pass with migration warnings until the relevant migration decision is complete.

## Choosing The Right Artifact

Use `docs/artifact-decision-tree.md` when unsure.

Short rule:

- need to define work: request, preflight, spec, eval, task
- need to route a plain user goal without command burden: conversation ask card
- need to decide which workflow path to use: workflow guidance card
- need to decide what must be reviewed before and after execution: review surface card
- need to prevent a rule or behavior change from being backend-only/frontend-only/API-only: change impact coverage report
- need to turn a broad ordinary-user goal into the first useful version: ordinary first-slice card
- need to tell whether the work is a runnable product or still just an idea: product completeness report
- need to prove the bundled MVP example is locally coherent: MVP example report
- need to decide whether a tiny proposed write is safe enough to ask for later approval: controlled apply candidate
- need to answer whether a task can be treated as done without exposing internal strict commands: guided closure card
- need to answer whether closed work can enter launch review: launch review view
- need to plan release execution after human approval: release execution plan
- need to review work: review packet and review loop report
- need a human decision: decision brief
- need to suggest future work: follow-up proposal
- need to remember a possible project fact: learning candidate
- need to fix stale context: context correction report
- need to review stale or duplicate docs: document lifecycle report
- need to decide what enters Git: git boundary report
- need to classify delivery readiness: launch readiness report
- need to route a new user message: conversation turn classification
- need to change approved scope: scope change report
- need to inspect a real governed project without writing: real adoption trial report
- need to map existing governance instead of copying templates: governance map
- need to compare old project rules with IntentOS references after Native Migration: existing rule reconciliation report
- need to decide whether a fix can be local or must be structural/human-owned: patch classification
- need to keep one current work thread visible: active work thread
- need to translate a technical choice into a user-owned decision: guided decision summary
- need to prove edits stayed inside current task scope: change boundary report
- need to state whether a baseline is proposed, pending, evidence-required, or confirmed: baseline state report
- need to translate baseline choice into user-readable decisions: baseline decision card
- need to recommend platform/capability/risk baseline packs: baseline pack selection report
- need to close work: final report
