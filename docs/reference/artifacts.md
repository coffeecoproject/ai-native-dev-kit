# Artifacts Reference

Artifacts make AI work auditable without forcing every task into the heaviest process.

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
| `delivery-path-reports/` | Current path toward useful use, self-test, internal trial, release review, or blocked status |
| `review-packets/` | Stable input for human, GPT Pro, or reviewer agent |
| `gpt-review-prompts/` | Read-only reviewer prompt |
| `review-loop-reports/` | Findings, AUTO_FIX rounds, verification, and remaining decisions |
| `review-summaries/` | Plain-language review summary |

Review Loop is required for L2/L3 tasks and optional for smaller tasks.

## Planning And Control Artifacts

| Directory | Purpose |
|---|---|
| `workflow-guidance-cards/` | Plain next-step guidance cards from the natural-language front door |
| `adoption-recommendations/` | Saved first-hour adoption recommendation reports |
| `baseline-recommendations/` | Saved engineering/environment baseline recommendation reports |
| `baseline-gap-reports/` | Durable baseline gap follow-up reports when needed |
| `goal-cards/` | Goal Mode route and task level |
| `subagent-run-plans/` | Helper agent roles, authority, handoff, and closure |
| `decision-briefs/` | Human decision input |
| `follow-up-proposals/` | Suggestions outside the current task |
| `learning-candidates/` | Proposed project memory that is not confirmed yet |
| `context-corrections/` | Evidence-backed correction records for stale or wrong context |
| `git-boundary-reports/` | Commit/PR boundary evidence for AI Native and context artifacts |
| `launch-readiness/` | Safe Launch / Delivery Readiness reports |
| `conversation-turns/` | Conversation Turn Classification reports |
| `scope-change-reports/` | Scope Change Reports for proposed scope changes |
| `adoption-trial-reports/` | First Delivery Walkthrough and real/simulated adoption trial evidence |
| `real-adoption-trials/` | Real-project read-only adoption trial reports |
| `governance-maps/` | Maps AI Native concepts to existing project authority |
| `patch-classifications/` | Repair-scale classification before non-trivial fixes |
| `patch-classification-false-positives/` | Reviewed calibration records for conservative patch classification triggers |
| `doc-lifecycle-reports/` | Source-of-truth, stale, duplicate, archive, and deprecation candidate reports |
| `work-queue/` | Current task, paused tasks, backlog / parking lot, and resume review records |
| `hook-orchestration-plans/` | Plan-first hook candidates, H0-H3 classification, approval requirements, and rollback notes |
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

## Reporting Artifacts

| Directory | Purpose |
|---|---|
| `final-reports/` | Durable task result |
| `status-reports/` | Human-readable status |
| `customer-handoffs/` | Delivery or milestone handoff |
| `releases/` | Release and evidence records |

Release records for meaningful Dev Kit phases should include allowed claims, forbidden claims, evidence status, known limitations, and verification.

## Self-Iteration Artifacts

| Directory | Purpose |
|---|---|
| `workflow-retros/` | Retrospective notes |
| `workflow-improvements/` | Process improvement proposal |
| `skill-candidates/` | Candidate repeatable Skill |
| `automation-proposals/` | Candidate automation |
| `dev-kit-proposals/` | Proposed dev-kit change |

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

Product Baseline and Claim Control live under `.ai-native/core/` in generated projects. They constrain workflow changes, release wording, public summaries, final reports, and handoffs; they do not add approval authority to AI.

Context Governance and Git Boundary live under `.ai-native/core/` in generated projects. They constrain how Codex proposes project memory, corrects stale context, and decides what belongs in Git. Learning candidates and context corrections are not project facts until approved.

Safe Launch lives under `.ai-native/core/` in generated projects. It constrains readiness wording and keeps demo, internal handoff, release review, blocked, and not-ready states separate from production approval.

Conversation Drift Control lives under `.ai-native/core/` in generated projects. It constrains how Codex handles discussion-only turns, scope changes, new tasks, direct follow-ups, and risk decisions during active work.

Real Project Read-only Adoption Trial and Patch Classification Governance live under `.ai-native/core/` in generated projects. They constrain how Codex enters governed or production-sensitive projects and prevent unsafe symptom patches from being treated as safe local fixes.

Decision Delegation Boundary and Guided Delivery Loop live under `.ai-native/core/` in generated projects. They constrain how Codex recommends the next safe path, keeps one current mainline, parks side ideas, and avoids pushing raw technical decisions onto non-expert users.

Change Boundary and Baseline State Guard live under `.ai-native/core/` in generated projects. They constrain how Codex proves edits stayed inside scope and how no-code baselines are described before evidence exists.

Baseline Pack System lives under `.ai-native/core/` in generated projects. It constrains how Codex recommends BL0/BL1/BL2, platform packs, capability packs, and risk overlays without silently approving BL2, draft packs, target-project writes, release, or production readiness.

Standard Baseline Pack Registry lives under `.ai-native/core/` in generated projects. It constrains how Codex recommends ordinary engineering baseline packs before optional BL2 industrial overlays, and keeps standard selection separate from implementation approval. Platform standard baseline packs add Web, Mini Program, iOS, Android, internal admin, and environment guidance without making backend, release, or industrial overlays default.

Guided Baseline Selection lives under `.ai-native/core/` in generated projects. It turns baseline choice into a Baseline Decision Card so the user confirms project state, risk, BL level, and write permission without needing to understand internal resolver names.

Natural Language Workflow Orchestrator lives under `.ai-native/core/` in generated projects. It turns a broad user goal, project path, repository, or next-step question into one Workflow Guidance Card without requiring the user to choose internal workflow commands.

Review Surface Governance lives under `.ai-native/core/` in generated projects. It lets Codex select the surfaces that must be reviewed before and after execution, while keeping Review Surface Cards read-only and non-approving.

Delivery Path Governance lives under `.ai-native/core/` in generated projects. It explains whether a project is still an idea, ready for plan, ready for local build, ready for self-test, ready for internal trial, ready for release review, or blocked, while keeping Delivery Path Reports read-only and non-approving.

Source profiles live under `profiles/`. Platform adapter instructions live under `platforms/`.

## Frontmatter

New generated artifacts include machine-readable frontmatter. Markdown remains the human-readable source, but frontmatter helps checkers avoid brittle parsing.

Legacy artifacts without frontmatter may pass with migration warnings until the relevant migration decision is complete.

## Choosing The Right Artifact

Use `docs/artifact-decision-tree.md` when unsure.

Short rule:

- need to define work: request, preflight, spec, eval, task
- need to decide which workflow path to use: workflow guidance card
- need to decide what must be reviewed before and after execution: review surface card
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
- need to decide whether a fix can be local or must be structural/human-owned: patch classification
- need to keep one current work thread visible: active work thread
- need to translate a technical choice into a user-owned decision: guided decision summary
- need to prove edits stayed inside current task scope: change boundary report
- need to state whether a baseline is proposed, pending, evidence-required, or confirmed: baseline state report
- need to translate baseline choice into user-readable decisions: baseline decision card
- need to recommend platform/capability/risk baseline packs: baseline pack selection report
- need to close work: final report
