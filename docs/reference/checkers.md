# Checkers Reference

Checkers enforce workflow behavior. They are not a substitute for human risk acceptance.

## Target Project Checks

| Checker | Purpose |
|---|---|
| `check-ai-workflow.mjs` | Core or full workflow asset check |
| `resolve-workflow-guidance.mjs` | Read-only natural-language front door that returns a Workflow Guidance Card; `--deep` selectively summarizes downstream read-only checks |
| `check-workflow-guidance.mjs` | Workflow Guidance Card boundary, plain-language, question-count, and overclaim checks |
| `resolve-review-surface.mjs` | Read-only review surface selector that returns a Review Surface Card before execution |
| `check-review-surface.mjs` | Review Surface Card required-surface, post-execution contract, and overclaim checks |
| `resolve-business-rule-closure.mjs` | Read-only business rule closure resolver that summarizes a user rule, required dimensions, safe defaults, and decisions before impact coverage |
| `check-business-rule-closure.mjs` | Business Rule Closure completeness, structured evidence, digest, user-question, safe-default, existing-rule, high-risk, cross-surface, and no-authority checks |
| `resolve-change-impact-coverage.mjs` | Read-only affected-surface mapper for validation, rule, API, backend, data, permission, copy, and business-behavior changes |
| `check-change-impact-coverage.mjs` | Change Impact Coverage report completeness, structured evidence, preflight/closure mode, cross-surface close-out, evidence, evidence reference resolution, precise evidence, changed-file implication, and overclaim checks |
| `resolve-verification-plan.mjs` | Read-only verification planner that maps Business Rule Closure plus Change Impact Coverage into source-bound obligations and test-correctness controls |
| `check-verification-plan.mjs` | Verification Plan source binding, obligation coverage, broad-command rejection, manual owner, test-correctness, and no-authority checks; `--require-evidence-authority` also verifies project/task/source identity |
| `resolve-test-evidence.mjs` | Read-only test evidence binder that maps explicit evidence files to Verification Plan obligations without running tests |
| `check-test-evidence.mjs` | Test Evidence source binding, obligation coverage, output digest, current-task, manual owner, Markdown/JSON, and no-authority checks; `--require-evidence-authority` also verifies project/task/source identity |
| `resolve-completion-evidence.mjs` | Read-only final completion evidence gate that binds BRC, Verification Plan, Test Evidence, and Execution Assurance source artifacts with task, digest, and intent identity |
| `check-completion-evidence.mjs` | Completion Evidence source-chain, source schema, source digest, source intent, task, outcome, strict 1.78.2+ intent-field compatibility, and no-authority checks; `--require-evidence-authority` also verifies project/task/source identity |
| `resolve-user-delivery-console.mjs` | Read-only ordinary-user status resolver that summarizes what is being built, where the work stands, whether it can be treated as done, what is missing, and what Codex can safely do next |
| `check-user-delivery-console.mjs` | User Delivery Console section, plain-language, limited-decision, technical-trace, and no-authority checks |
| `resolve-delivery-path.mjs` | Read-only delivery path resolver that reports current usable-state progress |
| `check-delivery-path.mjs` | Delivery Path Report state, evidence, blocker, and overclaim checks |
| `resolve-first-slice.mjs` | Read-only ordinary-user first-slice resolver for a first useful version |
| `check-first-slice.mjs` | Ordinary User First-Slice Card plain-language, question-count, backlog, and boundary checks |
| `resolve-product-completeness.mjs` | Read-only product completeness resolver for idea, first-slice, runnable MVP, internal-trial, release-review, or blocked state, with optional text or structured smoke evidence |
| `check-product-completeness.mjs` | Product Completeness Report state, checklist, evidence, and release-overclaim checks |
| `check-mvp-example.mjs` | Built-in MVP example metadata, evidence, boundary, and smoke-test checker |
| `resolve-low-risk-apply-candidate.mjs` | Read-only low-risk apply candidate resolver for exact, reversible, testable proposed changes with structured evidence |
| `check-low-risk-apply-candidate.mjs` | Low-Risk Controlled Apply Candidate path, risk, rollback, verification, structured evidence, and no-apply boundary checks |
| `resolve-debt-handoff.mjs` | Read-only debt and handoff resolver for paused, interrupted, or unfinished work |
| `check-debt-handoff.mjs` | Debt & Knowledge Handoff Report level, handoff, boundary, and overclaim checks |
| `resolve-closure-decision.mjs` | Read-only unified close-out resolver that turns close-out inputs into one final Closure Decision with explain trace |
| `check-closure-decision.mjs` | Unified Closure Decision single-source, explain-trace, verified `DONE` source, boundary, and split-truth checks |
| `resolve-guided-closure.mjs` | Read-only guided close-out entry that answers whether a task can be treated as done without user-facing strict command burden |
| `check-guided-closure.mjs` | Guided Closure Card state, checked-area, question-count, plain-language, and overclaim checks |
| `start-project.mjs` | Read-only guided adoption recommendation |
| `baseline-project.mjs` | Read-only engineering/environment baseline recommendation and plan-first baseline apply |
| `resolve-guided-baseline-selection.mjs` | Plain-language Baseline Decision Card recommendation |
| `check-guided-baseline-selection.mjs` | Baseline Decision Card boundary and safety checks |
| `check-baseline-selection-precision.mjs` | Baseline Selection precision scoreboard and synthetic calibration fixture checks |
| `check-guided-adoption.mjs` | Saved adoption recommendation report check |
| `workflow-next.mjs` | Project-state and next-action detector |
| `check-project-onboarding.mjs` | O0/O1/O2 onboarding readiness |
| `check-engineering-baseline.mjs` | Engineering Baseline completeness and pending decisions |
| `check-environment-baseline.mjs` | Environment Baseline structure, pending decisions, and obvious secret misuse |
| `check-baseline-enforcement.mjs` | Artifact-level baseline references in tasks, review packets, and review loops |
| `check-product-baseline.mjs` | Guided delivery product boundary, approval limits, and installed 1.3 assets |
| `check-claim-control.mjs` | Release/report wording, evidence claims, and assumption register boundaries |
| `check-context-governance.mjs` | Learning candidates, context corrections, Git boundary reports, and source-of-truth boundaries |
| `check-launch-readiness.mjs` | Launch readiness reports, evidence, human decisions, and overclaims |
| `resolve-launch-review-view.mjs` | Read-only launch review view resolver that depends on Unified Closure and Safe Launch labels |
| `check-launch-review-view.mjs` | Launch Review View closure dependency, launch surface, release-owner, and no-release-approval checks |
| `resolve-release-adapter.mjs` | Read-only beginner release adapter discovery and profile generator |
| `check-release-adapter.mjs` | Release Adapter Profile beginner card, boundary, secret, and high-risk action checks |
| `resolve-release-guide.mjs` | Read-only unified release guide that routes launch intent through adapter, launch review, structured approval, and release execution planning |
| `check-release-guide.mjs` | Release Guide Card structured approval, assist level, command risk, evidence quality, and no-release-authority checks |
| `resolve-platform-release-recipe.mjs` | Read-only platform release recipe selector with confidence, safe target, and no-execution boundaries |
| `check-platform-release-recipe.mjs` | Platform Release Recipe owner, rollback, monitoring, strict/draft, secret, and Codex-boundary checks |
| `resolve-release-handoff-pack.mjs` | Read-only release handoff pack resolver that separates Codex, human, and external-system ownership |
| `check-release-handoff-pack.mjs` | Release Handoff Pack approval, owner, evidence, Codex-boundary, structured evidence, and no-execution checks |
| `resolve-release-execution.mjs` | Read-only release execution planner after Launch Review View and Human Release Approval |
| `check-release-execution.mjs` | Release Execution Plan preconditions, approval, step ownership, evidence, and no-auto-production checks |
| `resolve-release-plan.mjs` | Read-only Release Plan resolver that turns release source systems into one pure view with trace and rule comparison |
| `check-release-plan.mjs` | Release Plan pure-view, trace, no-authority, existing-project IntentOS mode, and rule-comparison checker |
| `check-conversation-drift.mjs` | Conversation turn classification and scope-change routing |
| `check-conversation-native-ask.mjs` | Conversation Ask Card boundary, no-CLI-burden, question-count, and overclaim checks |
| `check-guided-delivery-loop.mjs` | Active work thread, parking lot, and guided decision boundaries |
| `check-first-delivery-walkthrough.mjs` | First Delivery Walkthrough and Adoption Trial evidence |
| `check-real-adoption-trial.mjs` | Real-project read-only adoption trial reports, bridge boundaries, and public evidence status |
| `check-patch-classification.mjs` | Repair-scale classification and false-positive calibration before non-trivial fixes |
| `resolve-existing-workflow.mjs` | Read-only Workflow Adoption Map recommendation for existing projects |
| `check-workflow-adoption-map.mjs` | Workflow Adoption Map boundary, routing, and overclaim checks |
| `resolve-native-migration.mjs` | Read-only Native-First Migration Plan resolver with rule-level extraction, coverage, parser warnings, and structured evidence |
| `check-native-migration.mjs` | Native Migration Plan authority, source evidence, approval, restore, no-write boundary, and optional strict structured evidence checks |
| `resolve-existing-rule-reconciliation.mjs` | Read-only Existing Rule Reconciliation resolver after Native Migration |
| `check-existing-rule-reconciliation.mjs` | Existing Rule Reconciliation boundary, recommendation, release/production, protected constraint, and optional strict structured evidence checks |
| `resolve-governance-convergence.mjs` | Read-only Existing Project Governance Convergence resolver after rule reconciliation; use `--out <relative-report-path>` to save the generated report explicitly |
| `check-governance-convergence.mjs` | Governance Convergence boundary, source-system, document/audit/AI-log, project-authority, and optional strict structured evidence checks |
| `resolve-adoption-assurance.mjs` | Read-only Adoption Assurance resolver that verifies old-project IntentOS adoption from upstream evidence and a synthetic no-write simulation; use `--out <relative-report-path>` to save the generated report explicitly |
| `check-adoption-assurance.mjs` | Adoption Assurance surface, source-system, simulation trace, evidence-ref, no-write boundary, and full-adoption-claim checks |
| `resolve-execution-assurance.mjs` | Read-only Execution Assurance resolver that binds execution intent, completion contract, planned impact, actual diff, evidence, review, patch assessment, and source-system trace; use `--out <relative-report-path>` to save the generated report explicitly |
| `check-execution-assurance.mjs` | Execution Assurance completion contract, actual diff, evidence ref, review, patch smell, source-system, no-authority, and no-empty-report checks; `--require-evidence-authority` also verifies project/task/source identity |
| `resolve-document-lifecycle.mjs` | Read-only document lifecycle recommendation with source-of-truth and archive-suggestion mapping |
| `check-document-lifecycle.mjs` | Document Lifecycle Report boundary, source-of-truth, archive, deprecation, and deletion-authorization checks |
| `resolve-document-archive-apply.mjs` | Read-only archive apply planner with link-check and archive-index preview |
| `check-document-archive-apply.mjs` | Archive Apply Plan boundary, link-check, index, rollback, and overclaim checks |
| `resolve-controlled-apply-readiness.mjs` | Read-only readiness classifier for reviewed Unified Apply Plans |
| `check-controlled-apply-readiness.mjs` | Controlled Apply Readiness boundary, approval, high-risk, rollback, verification, structured evidence digest, strict structured evidence, and empty-action checks |
| `check-approval-record.mjs` | Approval Record human-owner, action ID, target path, plan hash, expiry, rollback, verification, structured evidence, strict local plan reference, and non-authorization checks |
| `resolve-work-queue.mjs` | Read-only Work Queue recommendation for current, paused, backlog, and resume state |
| `check-work-queue.mjs` | Work Queue Report boundary, single-current-task, paused resume review, and backlog parking checks |
| `resolve-hook-orchestration.mjs` | Read-only hook candidate inventory and H0-H3 risk recommendation |
| `check-hook-orchestration.mjs` | Hook Orchestration Plan boundary, approval, rollback, and plan-first checks |
| `resolve-hook-policy.mjs` | Read-only Project Hook Policy recommendation with allowed hook classes, approval owners, and rollback requirements |
| `check-hook-policy.mjs` | Project Hook Policy boundary, H0-H3, approval owner, rollback, and non-installation checks |
| `check-change-boundary.mjs` | Intended scope, allowed paths, forbidden paths, actual changed files, and claim boundary |
| `check-baseline-state.mjs` | Baseline state claims for proposed, pending, evidence-required, and confirmed baselines |
| `resolve-standard-baseline.mjs` | Read-only standard baseline recommendation with optional industrial overlays |
| `check-standard-baseline-pack.mjs` | Standard baseline pack registry and draft overclaim checks |
| `check-standard-baseline-selection.mjs` | Standard baseline selection report boundaries and consistency checks |
| `resolve-baseline-packs.mjs` | Deprecated lower-level read-only industrial-oriented recommendation for exact evidence; prefer `node scripts/cli.mjs baseline-packs <project>` for human usage |
| `check-baseline-pack-selection.mjs` | Baseline pack selection report boundaries and overclaim checks |
| `check-platform-baseline.mjs` | Platform profile and platform baseline readiness |
| `resolve-platform-baseline.mjs` | Resolve selected platform profiles |
| `check-industrial-baseline.mjs` | BL0/BL1/BL2 and selected industrial baseline readiness |
| `resolve-industrial-baseline.mjs` | Resolve selected industrial packs |
| `check-workflow-version.mjs` | Installed workflow asset version |
| `check-workflow-artifacts.mjs` | Request/preflight/spec/eval/task/report artifact quality |
| `check-review-loop.mjs` | Review Packet and Review Loop semantics |
| `check-next-step-boundary.mjs` | Bounded Next-Step suggestions |
| `check-goal-mode.mjs` | Goal Card semantics |
| `check-subagent-orchestration.mjs` | Many readers / one writer, dispatch hygiene, and helper closure |
| `workflow-daily-summary.mjs` | Project-scoped daily summary support |
| `summarize-ai-logs.mjs` | Summarize AI task logs |

## Dev-Kit Maintenance Checks

| Checker | Purpose |
|---|---|
| `check-intentos.mjs` | Full repository self-check |
| `check-fixtures.mjs` | Golden, bad, migration, CLI, init/update, and output-quality fixture matrix |
| `check-manifest.mjs` | Manifest shape, required assets, copy rules, workflow-version sync |
| `check-industrial-pack.mjs` | Industrial pack structure, maturity metadata, draft overclaim scan |
| `score-output-quality.mjs` | Human-facing report quality score |
| `check-glossary-usage.mjs` | Plain-language glossary coverage |

## Common Modes

`check-ai-workflow.mjs`:

- `--mode core`: minimal target-project workflow check
- `--mode full`: complete workflow asset check

`check-workflow-artifacts.mjs`:

- `--mode draft`: early incomplete artifacts allowed
- `--mode ready`: before implementation
- `--mode implementation`: after implementation
- `--task <task-file>`: task-scoped graph consistency
- `--changed-only`: CI-friendly changed artifact scope
- `--strict-schema`: fail legacy artifacts without frontmatter

Industrial pack checks:

- `--selected-only`: only check selected packs for a project
- `--bl2-only`: focus on BL2 industrial baseline readiness
- `check-industrial-pack.mjs` rejects concrete industrial packs that miss the 1.16 BL2 depth contract sections, contain project facts/secrets, overclaim draft maturity, or fail required pack structure.
- `check-industrial-baseline.mjs` rejects all-pack BL2 defaults, selected risk overlays without risk-specific evidence, selected packs that do not match selected profiles, and missing evidence refs in `docs/baseline-evidence.md`.

Baseline enforcement checks:

- `check-environment-baseline.mjs` defaults to advisory mode; use `--strict` only when pending environment decisions should block work.
- `check-baseline-enforcement.mjs --mode ready` checks declarations before implementation.
- `check-baseline-enforcement.mjs --mode implementation` is stricter for BL1/BL2 or L3 task closure.

Product and claim checks:

- `check-workflow-guidance.mjs` allows empty projects, but rejects Workflow Guidance Cards that ask too many questions, expose internal workflow jargon in plain mode, claim target-project writes, modify CI, install hooks, delete/archive documents, change task state, approve implementation, approve release/production, or approve high-risk domain decisions.
- `check-review-surface.mjs` allows empty projects, but rejects Review Surface Cards that miss functional/code/verification/debt review, omit post-execution close-out fields, ask too many questions, claim target-project writes, modify CI, install hooks, delete/archive documents, change task state, approve implementation, approve release/production, or approve high-risk domain decisions.
- `check-business-rule-closure.mjs` allows empty projects only when explicitly permitted for source/asset checks, but rejects Business Rule Closure Cards that skip required dimensions, ask too many user questions, mark high-risk domain decisions as approved, treat safe defaults as user approval, claim real-environment proof without evidence, mismatch Markdown and JSON, or try to authorize implementation/release. Use `--require-structured-evidence` for new records and `--require-business-rule-closure` when execution must be blocked until a saved rule closure exists.
- `check-change-impact-coverage.mjs` allows empty projects only in default non-strict mode, but rejects Change Impact Coverage Reports that authorize implementation or release, omit affected-surface rows, mark `DONE` without evidence, mark high-risk surfaces `NOT_APPLICABLE` without concrete reasons, complete backend-only or frontend-only rule changes without closing related surfaces, or complete API contract changes without test evidence. An explicit report, closure mode, structured/strict evidence, evidence-ref resolution, precise evidence, or business-rule binding fails closed when no report exists. Use `--mode closure` to reject required surfaces left `NOT_STARTED`; use `--require-structured-evidence` for new structured records; use `--strict-evidence` to reject placeholder `DONE` evidence; use `--resolve-evidence-refs` to require project-local files or accepted recorded refs for `DONE` evidence; use `--report <path> --require-precise-evidence` when only one exact report should close the task.
- `check-verification-plan.mjs` allows empty projects only with `--allow-empty`, but rejects Verification Plans that are not bound to the current Business Rule Closure and Change Impact Coverage reports, miss required obligations, use broad commands as the only proof for required business/API/backend/UI checks, omit API negative-path checks, omit manual verification owners, skip generated-test review controls for high-risk/BL2 work, or claim tests were executed, implementation was approved, or release/production is ready.
- `check-test-evidence.mjs` allows empty projects only with `--allow-empty`, but rejects Test Evidence Reports that are not bound to the current Verification Plan, skip required obligations, cite stale/skipped/failed/broad-command evidence as passing proof, mismatch output digests, omit required test-quality controls, or use AI-owned manual verification.
- `check-completion-evidence.mjs` allows empty projects only with `--allow-empty`, but rejects Completion Evidence Gate Reports that claim completion without resolvable BRC, Verification Plan, Test Evidence, and Execution Assurance sources; mismatch source task/outcome/digest/intent; break BRC -> Verification Plan -> Test Evidence -> Execution Assurance refs; omit required gate checks; or approve commit, release, production, product correctness, or real-environment behavior. Use `--require-ready` for final completion claims. Under the 1.78.2+ strict contract, `source_chain[].intent_digest` is required and referenced Execution Assurance reports must expose top-level `intent_digest`; use one canonical task intent across the chain or regenerate stale reports.
- `check-delivery-path.mjs` allows empty projects, but rejects Delivery Path Reports that omit valid current/next states, evidence, blockers, next safe action, boundaries, or outcome, or claim target-project writes, CI/hook changes, task-state changes, implementation approval, release/production approval, Safe Launch replacement, or real-user-use proof.
- `check-first-slice.mjs` allows empty projects, but rejects First-Slice Cards that expose internal jargon, ask more than 3 questions, omit backlog, omit verification, approve target-project writes, approve implementation, approve release/production, change CI/hooks, touch payment/secrets/production/migration/permission surfaces, or enable BL2/industrial packs.
- `check-product-completeness.mjs` allows empty projects, but rejects Product Completeness Reports that omit product state, core checklist surfaces, local run/demo instructions, verification evidence, boundaries, or outcome, or claim implementation/release/production approval. New IntentOS examples should use structured JSON product evidence.
- `check-mvp-example.mjs` checks bundled local MVP examples across Web and CLI shapes. It proves the example is coherent and locally testable; it does not prove any target project is production-ready.
- `check-low-risk-apply-candidate.mjs` allows empty projects, but rejects candidate records that authorize apply, claim writes now, use wildcard/parent/absolute/home/backslash/generated/ignored/symlink/CI/hook target paths, omit rollback or verification, approve implementation, approve release/production, change CI/hooks, or touch high-risk surfaces without no-authority boundaries. Use `--require-structured-evidence` for new strict records.
- `check-debt-handoff.mjs` allows empty projects, but rejects Debt & Knowledge Handoff Reports that omit debt levels, handoff subsections, boundaries, or valid outcomes, or claim debt forgiveness, implementation approval, release/production approval, task-state/source-of-truth changes, Review Loop replacement, or Safe Launch replacement.
- `check-closure-decision.mjs` allows empty projects, but rejects Unified Closure Decisions that use non-unified final sources, miss Decision Trace / Dominant Reason / Conflict Summary, miss the single-source rule, claim `DONE` without verified Verification and Execution Closure inputs, reuse invalid or unrelated execution/impact evidence, claim `DONE` while impact coverage or human decision is missing, authorize writes/apply/implementation/commit/push/release/production/CI/hooks, replace Review Loop, replace Safe Launch, or approve high-risk decisions.
- `check-guided-closure.mjs` allows empty projects, but rejects Guided Closure Cards that expose low-level strict close-out commands or flags on the user surface, ask too many human decisions, omit checked areas or technical detail, approve target-project writes, authorize apply, approve implementation, approve commit/push, approve release/production, modify CI/hooks, change task state, forgive debt, replace Review Loop, replace Safe Launch, or approve high-risk decisions.
- `check-execution-assurance.mjs` allows empty projects, but rejects execution completion claims without a completion contract, planned impact, actual diff, evidence refs, independent review when required, source-system trace, and safe patch classification. Use `--require-structured-evidence`, `--require-evidence-refs`, `--require-review`, `--require-actual-diff`, and `--require-precise-evidence` when Codex is claiming execution-class work is complete.
- `check-product-baseline.mjs` is source-strict for IntentOS maintenance and target-safe for generated projects.
- `check-claim-control.mjs` checks public wording and reports; it does not make claim reports mandatory for every task.
- Assumption Register is required only when reports rely on inferred or unconfirmed facts.
- `check-context-governance.mjs` is candidate/audit focused; it does not approve project facts or require learning candidates for every task.
- `check-launch-readiness.mjs` allows empty projects, but rejects ready states without verification, reports with pending human decisions, and production-safety overclaims.
- `check-launch-review-view.mjs` allows empty projects, but rejects Launch Review Views that miss Unified Closure input, invent launch states, claim release review readiness without DONE closure, omit rollback/monitoring/release-owner/post-launch-smoke evidence for `READY_FOR_RELEASE_REVIEW`, approve release/production, claim deployment/publishing/submission happened, modify CI/hooks/production config/secrets/DNS/app-store/payment/permissions/migrations, or replace Unified Closure, Safe Launch, or project release SOPs.
- `check-release-adapter.mjs` allows empty projects, but rejects Release Adapter Profiles that miss the Beginner Release Card, include secret-like values or requests, assign high-risk release actions to Codex, approve release/production, mutate release infrastructure, or treat beginner confirmation as production approval.
- `check-release-guide.mjs` allows empty projects, but rejects Release Guide Cards that use unstructured approval for execution readiness, assign production handoff to Codex, classify remote-side-effect commands as local-safe, mark weak evidence as PASS, approve release/production, mutate release infrastructure, or treat free-form approval text as release approval.
- `check-platform-release-recipe.mjs` allows empty projects, but rejects Platform Release Recipes that assign production or remote-side-effect release actions to Codex, ask for secrets, omit rollback/monitoring/release owner, present provider assumptions as certainty, or pass draft recipes under `--strict`.
- `check-release-handoff-pack.mjs` allows empty projects in default non-strict mode, but rejects Release Handoff Packs that assign production deploy, store/mini-program submission, production migration, remote-state commands, provider APIs, or secrets to Codex; omit structured approval, release owner, rollback evidence, monitoring evidence, post-release smoke, or close-out evidence; approve release/production; mutate release infrastructure; make Codex the release owner; or redefine handoff evidence inside execution. `--require-structured-evidence` fails closed when no handoff pack exists and otherwise requires valid `release_handoff_evidence` JSON.
- `check-release-execution.mjs` allows empty projects, but rejects Release Execution Plans that miss Launch Review input, allow real execution without scoped Human Release Approval, mark high-risk production deploy/publish/submit/migration/secrets/DNS/payment/permissions/config steps as Codex-executed, approve release/production, treat Launch Review View as release approval, or make Codex the release owner.
- `check-conversation-drift.mjs` allows empty projects, but rejects discussion-only writes, scope changes without human decision, and risk decisions that auto-continue.
- `check-conversation-native-ask.mjs` allows empty projects, but rejects Conversation Ask Cards that make users run CLI commands before Codex can route work, ask too many questions, claim target-project writes, authorize apply, approve implementation, approve release/production, modify CI/hooks, delete/archive/rewrite documents, change task state, enable baseline/industrial packs, or approve high-risk decisions.
- `check-first-delivery-walkthrough.mjs` allows empty projects, but rejects walkthrough reports missing final report or launch readiness references, simulated evidence overclaims, and unclosed subagents.
- `check-real-adoption-trial.mjs` allows empty projects, but rejects real adoption reports with target writes, missing read-only evidence, unsafe bridge claims, local-only public naming, overclaims, secret-like content, or unclosed subagents.
- `check-patch-classification.mjs` allows empty projects, but rejects unsafe `SAFE_LOCAL_FIX` classification on high-risk surfaces, patch reports that authorize implementation, missing evidence, completed `DO_NOT_PATCH` reports, and false-positive records that accept real high-risk impact as safe.
- False-positive records are calibration evidence only. They do not modify the original patch classification report; changing repair scale still needs a new patch classification report or an explicit human decision.
- `check-workflow-adoption-map.mjs` allows empty projects, but rejects Workflow Adoption Maps that authorize target-project writes, omit required workflow routing, claim workflow assets were applied, change CI/hooks, overwrite existing governance, approve implementation, approve release/production, or miss high-risk no-touch boundaries.
- `check-document-lifecycle.mjs` allows empty projects, but rejects Document Lifecycle Reports that authorize deletion, omit source-of-truth mapping, skip archive suggestions, claim files were deleted/moved/archived, change source of truth, approve cleanup work, or miss no-delete protection for source-of-truth, AGENTS, CI/hooks, release, legal, security, production, evidence, customer, or secret-bearing docs.
- `check-document-archive-apply.mjs` allows empty projects, but rejects Archive Apply Plans that authorize archive apply, claim files were moved/deleted/archived, claim links were fixed, omit link-check planning, omit archive-index planning, omit rollback planning, replace Document Lifecycle, change source of truth, or approve cleanup completion.
- `check-controlled-apply-readiness.mjs` allows empty projects, but rejects readiness reports that authorize apply, allow Codex to proceed without new approval, mark high-risk actions ready, omit rollback or verification readiness, install hooks/change CI, change source of truth, approve implementation, or approve release/production.
- `check-apply-plan.mjs`, `check-controlled-apply-readiness.mjs`, `check-approval-record.mjs`, `check-low-risk-apply-candidate.mjs`, and `check-change-impact-coverage.mjs` accept `--require-structured-evidence` for new structured artifacts that must include `Machine-Readable Evidence`. For Apply Plan and Change Impact Coverage, this strict flag also fails when no matching report exists.
- `check-execution-closure.mjs` accepts `--report <project-relative-path>` to validate one Execution Closure without mixing historic reports, `--require-impact-coverage` when cross-surface READY closures must cite strict Change Impact Coverage evidence, and `--require-precise-evidence` when the linked report must match the current closure task or intent.
- `check-controlled-apply-readiness.mjs` rejects structured readiness records with empty actions unless `readiness_state` is `NO_APPLY_PLAN`; strict mode also requires the referenced apply plan to resolve locally.
- `check-approval-record.mjs` allows empty projects, but rejects Approval Records that use non-human or ambiguous approval, omit plan hash, use blanket action approval, authorize automatic apply, use wildcard, parent-traversal, absolute, backslash, symlink, or otherwise unbounded target paths, omit expiry, use expired approval, record plan changes after approval, mismatch approved action IDs between the table and statement, miss rollback or verification acknowledgement, approve high-risk actions, install hooks/change CI, change source of truth, approve implementation, or approve release/production. Strict mode also requires the referenced apply plan to resolve locally.
- `check-work-queue.mjs` allows empty projects, but rejects Work Queue Reports with multiple `CURRENT` tasks, paused tasks without resume review, backlog execution approval, target-project write approval, implementation approval, scope expansion approval, release/production approval, or stale-work resume without review.
- `check-hook-orchestration.mjs` allows empty projects, but rejects Hook Orchestration Plans that install hooks, modify CI, add blocking gates, call external APIs, enable auto-fix, change target-project files, treat hook output as human approval, skip H2/H3 approval, omit rollback/disable planning, or approve implementation/release/production.
- `check-hook-policy.mjs` allows empty projects, but rejects Project Hook Policies that install hooks, modify CI, add blocking gates, call external APIs, store tokens/secrets, enable auto-fix, treat hook output as human approval, omit H0-H3 classes, omit approval owners, omit rollback/disable policy, replace Hook Orchestration, or approve implementation/release/production.
- `check-guided-delivery-loop.mjs` allows empty projects, but rejects parking-lot items that are approved/executable now, D3/D4 summaries that claim implementation approval, and summaries missing human choice or next safe action.
- `check-change-boundary.mjs` allows empty projects, but rejects reports where forbidden paths changed, actual files sit outside allowed paths, forbidden change types appear, or a report claims PASS while any changed file is outside boundary.
- `check-baseline-state.mjs` allows empty projects, but rejects no-code/new-project baselines marked `CONFIRMED` without evidence or human-confirmed source, and rejects implementation permission that claims approved writes without evidence.
- `check-standard-baseline-pack.mjs` rejects standard packs that use `defaultForBL`, include unknown metadata fields, drift between `index.json` and `pack.json`, are active by default, miss required baseline/checklist/template content, claim production readiness, authorize writes, implementation, release, compliance, security, or privacy, or turn environment guidance into `.env` writes, secret values, invented deployment facts, or CI/CD approval claims.
- `check-standard-baseline-selection.mjs` allows empty projects, but rejects reports that mix industrial overlays into standard packs, use unknown profile or pack IDs, select every known standard pack, force backend without evidence, recommend release/rollback without evidence, use overwrite language for governed existing projects, claim write or implementation approval, claim release/production approval, or treat selection as evidence. `--compare-resolver` checks recorded recommendations against resolver output.
- `check-baseline-pack-selection.mjs` allows empty projects, but rejects reports that select all packs by default, treat BL2 as universal default, treat draft packs as stable, claim pack files prove real project evidence, or authorize writes, implementation, release, or production.
- `check-guided-baseline-selection.mjs` allows empty projects, but rejects Baseline Decision Cards that default to BL2, select all packs, force backend without evidence, omit Platform States, use invalid Platform States values, claim write/implementation/release/production/high-risk approval, recommend overwrite for governed projects, recommend direct init/update for production-sensitive projects, continue dirty worktrees without a decision, or omit concrete next actions.
- `check-baseline-selection-precision.mjs` checks the calibration scoreboard, validates Summary Metrics against table rows, loads synthetic case ids from `baseline-calibration-reports/precision-fixtures.json`, emits JSON summary data with `--json`, and runs synthetic resolver fixtures for Mini Program cloud functions, permission-only docs, active Web admin, production governed read-only projects, dirty payment-risk worktrees, monorepos with deferred platforms, backend data/API projects, and empty unknown projects. It is calibration evidence only and does not prove production readiness.

## Suggested Sequences

For a normal target project:

```bash
node scripts/workflow-next.mjs .
node scripts/resolve-workflow-guidance.mjs .
node scripts/resolve-workflow-guidance.mjs . --deep
node scripts/check-workflow-guidance.mjs .
node scripts/resolve-review-surface.mjs .
node scripts/check-review-surface.mjs .
node scripts/resolve-change-impact-coverage.mjs . --intent "<change>"
node scripts/check-change-impact-coverage.mjs .
node scripts/resolve-debt-handoff.mjs .
node scripts/check-debt-handoff.mjs .
node scripts/resolve-closure-decision.mjs . --intent "<change>" --verification "<verification evidence>"
node scripts/check-closure-decision.mjs .
node scripts/resolve-guided-closure.mjs . --intent "<change>" --verification "<verification evidence>"
node scripts/resolve-document-archive-apply.mjs .
node scripts/check-document-archive-apply.mjs .
node scripts/start-project.mjs .
node scripts/check-guided-adoption.mjs .
node scripts/check-ai-workflow.mjs . --mode core
node scripts/check-project-onboarding.mjs .
node scripts/check-engineering-baseline.mjs .
node scripts/check-environment-baseline.mjs .
node scripts/check-baseline-enforcement.mjs . --mode ready
node scripts/check-product-baseline.mjs .
node scripts/check-claim-control.mjs .
node scripts/check-context-governance.mjs .
node scripts/check-launch-readiness.mjs .
node scripts/resolve-launch-review-view.mjs . --intent "<release review goal>" --verification "<verification evidence>"
node scripts/check-launch-review-view.mjs .
node scripts/resolve-release-adapter.mjs . --intent "<release adapter goal>"
node scripts/check-release-adapter.mjs .
node scripts/resolve-release-guide.mjs . --intent "help me launch"
node scripts/check-release-guide.mjs .
node scripts/resolve-platform-release-recipe.mjs . --intent "help me launch"
node scripts/check-platform-release-recipe.mjs .
node scripts/resolve-release-handoff-pack.mjs . --intent "help me launch"
node scripts/check-release-handoff-pack.mjs .
node scripts/check-release-handoff-pack.mjs . --require-structured-evidence
node scripts/resolve-release-execution.mjs . --intent "<release execution goal>"
node scripts/check-release-execution.mjs .
node scripts/check-conversation-drift.mjs .
node scripts/check-guided-delivery-loop.mjs .
node scripts/check-first-delivery-walkthrough.mjs .
node scripts/check-real-adoption-trial.mjs .
node scripts/check-patch-classification.mjs .
node scripts/resolve-existing-workflow.mjs .
node scripts/check-workflow-adoption-map.mjs .
node scripts/resolve-document-lifecycle.mjs .
node scripts/check-document-lifecycle.mjs .
node scripts/check-approval-record.mjs .
node scripts/check-change-boundary.mjs .
node scripts/check-baseline-state.mjs .
node scripts/resolve-guided-baseline-selection.mjs .
node scripts/check-guided-baseline-selection.mjs .
node scripts/resolve-standard-baseline.mjs .
node scripts/check-standard-baseline-pack.mjs .
node scripts/check-standard-baseline-selection.mjs .
node scripts/resolve-baseline-packs.mjs .
node scripts/check-baseline-pack-selection.mjs .
```

For L2/L3 task completion:

```bash
node scripts/check-workflow-artifacts.mjs . --mode implementation --task tasks/<task>.md
node scripts/check-workflow-guidance.mjs .
node scripts/check-review-surface.mjs .
node scripts/check-change-impact-coverage.mjs .
node scripts/check-baseline-enforcement.mjs . --mode implementation --task tasks/<task>.md
node scripts/check-review-loop.mjs . --task tasks/<task>.md
node scripts/check-next-step-boundary.mjs . --task tasks/<task>.md
node scripts/check-launch-readiness.mjs .
node scripts/check-conversation-drift.mjs .
node scripts/check-guided-delivery-loop.mjs .
node scripts/check-first-delivery-walkthrough.mjs .
node scripts/check-real-adoption-trial.mjs .
node scripts/check-patch-classification.mjs .
node scripts/resolve-existing-workflow.mjs .
node scripts/check-workflow-adoption-map.mjs .
node scripts/resolve-document-lifecycle.mjs .
node scripts/check-document-lifecycle.mjs .
node scripts/check-change-boundary.mjs .
node scripts/check-baseline-state.mjs .
node scripts/check-guided-baseline-selection.mjs .
node scripts/resolve-baseline-packs.mjs .
node scripts/check-baseline-pack-selection.mjs .
```

For intentos changes:

```bash
node scripts/check-manifest.mjs .
node scripts/check-product-baseline.mjs .
node scripts/check-claim-control.mjs .
node scripts/check-context-governance.mjs .
node scripts/check-launch-readiness.mjs .
node scripts/check-conversation-drift.mjs .
node scripts/check-guided-delivery-loop.mjs .
node scripts/check-first-delivery-walkthrough.mjs .
node scripts/check-real-adoption-trial.mjs .
node scripts/check-patch-classification.mjs .
node scripts/resolve-existing-workflow.mjs .
node scripts/check-workflow-adoption-map.mjs .
node scripts/resolve-document-lifecycle.mjs .
node scripts/check-document-lifecycle.mjs .
node scripts/check-change-boundary.mjs .
node scripts/check-baseline-state.mjs .
node scripts/resolve-guided-baseline-selection.mjs .
node scripts/check-guided-baseline-selection.mjs .
node scripts/resolve-baseline-packs.mjs .
node scripts/check-baseline-pack-selection.mjs .
node scripts/check-fixtures.mjs
node scripts/check-intentos.mjs
git diff --check
```

## Failure Handling

Treat failures as one of three categories:

- deterministic AUTO_FIX inside current task scope
- NEEDS_HUMAN_DECISION
- out-of-scope follow-up

Do not turn checker failure into permission to rewrite unrelated parts of a project.
