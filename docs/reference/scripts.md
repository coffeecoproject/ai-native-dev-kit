# Scripts Reference

This reference lists the stable command surface and the lower-level scripts that remain available for CI and evidence.

## CLI Front Door

Use `scripts/cli.mjs` for daily operation.

| Command | Purpose | Writes |
|---|---|---|
| `node scripts/cli.mjs ask <project> "<goal>"` | Accept one natural-language goal and return a beginner-friendly entry card | No |
| `node scripts/cli.mjs ask "<goal>"` | Use the current directory as the project and return a beginner-friendly entry card | No |
| `node scripts/cli.mjs ask-check <project>` | Check recorded Beginner Entry Cards | No |
| `node scripts/cli.mjs conversation-ask-check <project>` | Check recorded Conversation Ask Cards for conversation-native entry boundaries | No |
| `node scripts/cli.mjs guide <project>` | Read a project and return one plain-language Workflow Guidance Card | No |
| `node scripts/cli.mjs guide <project> --deep` | Selectively run read-only downstream resolvers and return one compressed guidance card | No |
| `node scripts/cli.mjs guide <project> --deep --intent "<goal>"` | Combine project signals with the user's natural-language goal before routing | No |
| `node scripts/cli.mjs guide-check <project>` | Check recorded Workflow Guidance Cards | No |
| `node scripts/cli.mjs review-surface <project>` | Select review surfaces before execution without writing target files | No |
| `node scripts/cli.mjs review-surface-check <project>` | Check recorded Review Surface Cards | No |
| `node scripts/cli.mjs delivery-path <project>` | Report current path toward useful use, self-test, internal trial, release review, or blocked status | No |
| `node scripts/cli.mjs delivery-path-check <project>` | Check recorded Delivery Path Reports | No |
| `node scripts/cli.mjs first-slice <project> "<goal>"` | Turn an ordinary user goal into a first useful version scope without writing target files | No |
| `node scripts/cli.mjs first-slice-check <project>` | Check recorded Ordinary User First-Slice Cards | No |
| `node scripts/cli.mjs product-completeness <project>` | Report whether a first version is idea-only, runnable MVP, internal-trial ready, release-review needed, or blocked | No |
| `node scripts/cli.mjs product-completeness-check <project>` | Check recorded Product Completeness Reports | No |
| `node scripts/cli.mjs mvp-example-check [example]` | Check the built-in booking MVP example evidence | No |
| `node scripts/cli.mjs apply-candidate <project> --intent "<change>" --path <file>` | Record whether a proposed small change is low risk enough for later human-approved apply planning | No |
| `node scripts/cli.mjs apply-candidate-check <project>` | Check recorded Low-Risk Controlled Apply Candidate records | No |
| `node scripts/cli.mjs debt-handoff <project>` | Record debt and handoff context for paused, interrupted, or unfinished work | No |
| `node scripts/cli.mjs debt-handoff-check <project>` | Check recorded Debt & Knowledge Handoff Reports | No |
| `node scripts/cli.mjs closure <project> --intent "<goal>" --verification "<evidence>"` | Close execution with scope, verification, debt, and commit-readiness review | No |
| `node scripts/cli.mjs closure-check <project>` | Check recorded Execution Closure Reports | No |
| `node scripts/cli.mjs start <project>` | Read-only guided adoption recommendation | No |
| `node scripts/cli.mjs baseline <project>` | Read-only engineering/environment baseline recommendation | No |
| `node scripts/cli.mjs baseline-decision <project>` | Produce a plain-language Baseline Decision Card | No |
| `node scripts/cli.mjs baseline-decision-check <project>` | Check recorded Baseline Decision Cards | No |
| `node scripts/cli.mjs standard-baseline <project>` | Read-only standard baseline pack recommendation | No |
| `node scripts/cli.mjs standard-baseline-selection <project>` | Check recorded standard baseline selection reports | No |
| `node scripts/cli.mjs baseline-packs <project>` | Read-only umbrella recommendation: standard packs first, optional industrial overlays second | No |
| `node scripts/cli.mjs baseline-pack-selection <project>` | Check recorded baseline pack selection reports | No |
| `node scripts/cli.mjs product-baseline <project>` | Check guided delivery product boundary and approval limits | No |
| `node scripts/cli.mjs claim-control <project>` | Check release/report wording against evidence boundaries | No |
| `node scripts/cli.mjs context-governance <project>` | Check project memory, context correction, and Git boundary governance | No |
| `node scripts/cli.mjs launch-readiness <project>` | Check Safe Launch / Delivery Readiness reports | No |
| `node scripts/cli.mjs conversation-drift <project>` | Check conversation turn routing and scope-change governance | No |
| `node scripts/cli.mjs guided-delivery <project>` | Check active work thread, parking lot, and guided decision boundaries | No |
| `node scripts/cli.mjs first-delivery <project>` | Check First Delivery Walkthrough and Adoption Trial evidence | No |
| `node scripts/cli.mjs real-adoption <project>` | Check recorded real-project read-only adoption trial evidence; does not auto-generate a report | No |
| `node scripts/cli.mjs patch-classification <project>` | Check recorded repair-scale classification and false-positive calibration reports before non-trivial fixes | No |
| `node scripts/cli.mjs workflow-map <project>` | Recommend how AI Native workflow should map to an existing project before writes | No |
| `node scripts/cli.mjs workflow-map-check <project>` | Check recorded Workflow Adoption Maps | No |
| `node scripts/cli.mjs doc-lifecycle <project>` | Recommend document lifecycle state, source-of-truth candidates, and archive suggestions without file changes | No |
| `node scripts/cli.mjs doc-lifecycle-check <project>` | Check recorded Document Lifecycle Reports | No |
| `node scripts/cli.mjs archive-apply <project>` | Plan document archive apply actions without moving, deleting, or rewriting files | No |
| `node scripts/cli.mjs archive-apply-check <project>` | Check recorded Document Archive Apply Plans | No |
| `node scripts/cli.mjs apply-plan <project> --intent "<goal>"` | Turn proposed project writes into one reviewable Unified Apply Plan | No |
| `node scripts/cli.mjs apply-plan-check <project>` | Check recorded Unified Apply Plans | No |
| `node scripts/cli.mjs apply-readiness <project> --plan <apply-plan>` | Evaluate whether an apply plan is eligible for a future human-approved controlled apply step | No |
| `node scripts/cli.mjs apply-readiness-check <project>` | Check recorded Controlled Apply Readiness Reports | No |
| `node scripts/cli.mjs approval-record-check <project>` | Check recorded Approval Records for human-owned bounded approval evidence | No |
| `node scripts/cli.mjs work-queue <project>` | Recommend current, paused, backlog, and resume state without changing task state | No |
| `node scripts/cli.mjs work-queue-check <project>` | Check recorded Work Queue Reports and single-current-task rules | No |
| `node scripts/cli.mjs hook-plan <project>` | Recommend hook candidates without installing hooks, changing CI, or adding gates | No |
| `node scripts/cli.mjs hook-plan-check <project>` | Check recorded Hook Orchestration Plans | No |
| `node scripts/cli.mjs hook-policy <project>` | Recommend project hook policy without installing hooks, changing CI, or adding gates | No |
| `node scripts/cli.mjs hook-policy-check <project>` | Check recorded Project Hook Policies | No |
| `node scripts/cli.mjs change-boundary <project> --report <file>` | Check that actual changed files stay inside recorded task scope | No |
| `node scripts/cli.mjs baseline-state <project> --report <file>` | Check proposed/pending/evidence-required/confirmed baseline state claims | No |
| `node scripts/cli.mjs init --starter <starter> --target <project>` | Initialize workflow assets | Yes |
| `node scripts/cli.mjs update --target <project>` | Update workflow assets | Yes |
| `node scripts/cli.mjs next <project>` | Read project state and report next safe action | No |
| `node scripts/cli.mjs check <project> --mode core` | Run core workflow check | No |
| `node scripts/cli.mjs doctor <project>` | Run `next` then core check | No |
| `node scripts/cli.mjs new --type <artifact> --name <slug>` | Create a workflow artifact | Yes |
| `node scripts/cli.mjs migrate --target <project> --from 0.33.0 --to 1.0.0 --dry-run` | Preview migration plan | No |
| `node scripts/cli.mjs migrate --target <project> --from 0.33.0 --to 1.0.0 --write-plan <file>` | Write migration plan JSON only | Plan file only |
| `node scripts/cli.mjs fixtures` | Run fixture suite | No |
| `node scripts/cli.mjs self-check` | Run dev-kit self-check | No |

Global `--dry-run` prints the underlying command without running it.

## Init And Update

`scripts/init-project.mjs` is the lower-level implementation for `init` and `update`.

Important flags:

- `--starter <name>`
- `--target <project>`
- `--update-workflow-assets`
- `--dry-run`
- `--write-plan <file>`
- `--apply-plan <file>`
- `--backup-dir <dir>`
- `--apply-agent-governance`
- `--apply-pr-template-governance`

Governed, production, dirty, or unbootstrapped existing projects must use plan-first flow.

## Project State

`scripts/start-project.mjs` is the first-hour adoption entry. It calls `workflow-next`, classifies the target project, lists decisions needed from the human, and recommends safe next actions. It is read-only by default and must not write target project files.

`scripts/baseline-project.mjs` is the second guided entry. It recommends Engineering and Environment Baseline setup and is read-only by default. Use `--write-plan <file>` to write a reviewable plan and `--apply-plan <file>` to apply only approved baseline docs and baseline reports.

`scripts/resolve-workflow-guidance.mjs` is the natural-language front door. It reads project state and prints one Workflow Guidance Card with a delivery path state, next step, distance to useful use, limited questions, internal routing, and explicit no-write/no-CI/no-hook/no-release boundaries. With `--deep`, it selectively runs read-only downstream resolvers such as review surface, delivery path, work queue, document lifecycle, workflow mapping, baseline decision, debt handoff, execution closure, and hook policy, then compresses them back into one card. With `--intent`, it classifies the user's goal and passes it to downstream resolvers that accept intent. It does not write target-project files.

`scripts/check-workflow-guidance.mjs` checks recorded Workflow Guidance Cards. It rejects too many questions, internal jargon leaking into plain mode, target-project write approval, CI/hook/document/task-state approval, implementation approval, release/production approval, and high-risk decision approval.

`scripts/resolve-beginner-entry.mjs` is the 1.35 beginner entry. It accepts one user goal, runs the existing read-only guidance path internally, and prints one Beginner Entry Card with what Codex understood, a plain recommended path, at most 3 human questions, safe next actions, blocked actions, routing evidence, and explicit boundaries. It supports `node scripts/cli.mjs ask <project> "<goal>"` and `node scripts/cli.mjs ask "<goal>"`.

`scripts/check-beginner-entry.mjs` checks recorded Beginner Entry Cards. It rejects internal workflow jargon on the user-facing surface, more than 3 questions, target-project write approval, apply authorization, implementation approval, release/production approval, CI/hook/document/task-state changes, baseline/industrial pack enablement, and high-risk decision approval.

`scripts/check-conversation-native-ask.mjs` checks recorded Conversation Ask Cards. It rejects making the user run CLI commands before Codex can route the work, more than 3 questions, target-project write approval, apply authorization, implementation approval, release/production approval, CI/hook/document/task-state changes, baseline/industrial pack enablement, and high-risk decision approval.

`scripts/resolve-review-surface.mjs` is the 1.25 review-surface entry. It reads project state and task intent signals, then prints one Review Surface Card with selected review surfaces, before/after expectations, human-decision flags, post-execution contract, and explicit no-write/no-approval boundaries. It does not write target-project files.

`scripts/check-review-surface.mjs` checks recorded Review Surface Cards. It requires `FUNCTIONAL_REVIEW`, `CODE_REVIEW`, `VERIFICATION_REVIEW`, and `DEBT_REVIEW`, validates allowed surfaces and outcomes, requires post-execution close-out fields, and rejects implementation approval, release/production approval, CI/hook/document/task-state approval, and high-risk decision approval.

`scripts/resolve-delivery-path.mjs` is the 1.26 delivery path entry. It reads project state and prints one Delivery Path Report with current state, next target state, distance to useful use, evidence, blockers, next safe action, human decisions, and explicit no-write/no-release boundaries. It does not write target-project files.

`scripts/check-delivery-path.mjs` checks recorded Delivery Path Reports. It validates allowed delivery states, evidence, blockers, next action, user-decision limits, and rejects implementation approval, release/production approval, CI/hook/task-state approval, Safe Launch replacement, and real-user-use overclaims.

`scripts/resolve-first-slice.mjs` is the 1.42 ordinary-user first-slice entry. It accepts a plain goal such as "I want to build a booking app" and prints one Ordinary User First-Slice Card with the first useful version, at most 3 questions, backlog, verification, and explicit no-write/no-release boundaries. It does not write target-project files.

`scripts/check-first-slice.mjs` checks recorded Ordinary User First-Slice Cards. It rejects internal jargon on the user-facing surface, more than 3 questions, missing backlog, target-project write approval, implementation approval, release/production approval, CI/hook changes, payment/secrets/production/migration/permission touch, and BL2/industrial enablement.

`scripts/resolve-product-completeness.mjs` is the 1.43 product completeness gate. It reports whether the current work is still an idea, has a defined first slice, is a runnable local MVP, is ready for internal trial, needs release review, or is blocked. It does not approve release or production.

`scripts/check-product-completeness.mjs` checks recorded Product Completeness Reports. It requires target user, core flow, surface, risk boundary, empty/error states, local run, verification, handoff, feedback capture, and next backlog coverage, and rejects release/production overclaims.

`scripts/check-mvp-example.mjs` is the 1.44 real MVP example evidence checker. It checks the built-in booking web app example, its first-slice card, completeness report, final report, and local smoke test.

`scripts/resolve-low-risk-apply-candidate.mjs` is the 1.45 low-risk controlled apply candidate entry. It records whether a proposed small change is exact, local, reversible, and testable enough to ask for later human approval. It does not write files or authorize apply.

`scripts/check-low-risk-apply-candidate.mjs` checks recorded Low-Risk Controlled Apply Candidate records. It rejects unsafe paths, high-risk surfaces without no-authority boundaries, missing rollback, missing verification, apply authorization, implementation approval, release/production approval, and CI/hook changes.

`scripts/resolve-debt-handoff.mjs` is the 1.27 debt handoff entry. It reads project state and prints one Debt & Knowledge Handoff Report with debt level, knowledge handoff, verification notes, files to revisit, human decisions, and explicit non-approval boundaries. It does not write target-project files.

`scripts/check-debt-handoff.mjs` checks recorded Debt & Knowledge Handoff Reports. It validates allowed debt levels, required handoff subsections, boundaries, outcomes, and rejects debt forgiveness, implementation approval, release/production approval, task-state/source-of-truth changes, Review Loop replacement, and Safe Launch replacement.

`scripts/resolve-execution-closure.mjs` is the 1.33 evidence-linked execution closure entry. It reads changed files, user intent, optional verification notes, and optional evidence refs such as `--review-surface-ref`, `--review-loop-ref`, `--change-boundary-ref`, `--verification-file`, `--debt-handoff-ref`, and `--delivery-path-ref`, then prints one Execution Closure Report with evidence links, review surface closure, verification closure, scope boundary closure, debt closure, and commit readiness. Changed files are not treated as functional or code-review proof. It does not write target-project files or authorize commit/push.

`scripts/check-execution-closure.mjs` checks recorded Execution Closure Reports. It rejects implementation approval, release/production approval, commit/push authorization, debt forgiveness, missing required review surfaces, missing boundaries, functional/code pass based only on changed files, and `READY_FOR_COMMIT_REVIEW` without evidence links and passing verification evidence.

`scripts/resolve-apply-plan.mjs` is the 1.34 unified apply-plan entry. It reads project state, user intent, proposed action types, target paths, and optional evidence refs, then prints one Unified Apply Plan with proposed writes, human-only or blocked actions, preconditions, backup, rollback, verification, and explicit no-write/no-apply boundaries. It does not write target-project files or authorize apply.

`scripts/check-apply-plan.mjs` checks recorded Unified Apply Plans. It rejects write-now claims, apply authorization, implementation approval, release/production approval, CI/hook/archive/source-of-truth changes now, high-risk actions without human-only or approval-required status, missing rollback, missing verification planning, and invalid structured evidence digests. Use `--require-structured-evidence` when new artifacts must include a `Machine-Readable Evidence` block.

`scripts/resolve-controlled-apply-readiness.mjs` is the 1.38 controlled apply readiness entry. It reads one Unified Apply Plan and reports whether the plan is not ready, human-only, blocked, or a low-risk candidate for future human-approved apply. It does not write target-project files or authorize apply.

`scripts/check-controlled-apply-readiness.mjs` checks recorded Controlled Apply Readiness Reports. It rejects apply authorization, write-now claims, proceeding without new approval, high-risk actions marked ready, missing rollback, missing verification, release/production/hook/CI/source-of-truth overclaims, structured readiness records with empty actions outside `NO_APPLY_PLAN`, and structured plan digest mismatches. Use `--require-structured-evidence` to require structured evidence and local apply-plan reference resolution.

`scripts/check-approval-record.mjs` checks recorded Approval Records. It allows empty projects, but when records exist it rejects non-human or ambiguous approval, missing plan hash, blanket action approval, automatic apply authorization, wildcard, parent-traversal, absolute, backslash, symlink, or otherwise unbounded target paths, open-ended or expired approval, plan changes after approval, mismatched approved action IDs between the table and human statement, missing rollback or verification acknowledgement, high-risk action approval, structured plan digest mismatches, and implementation/release/production/hook/CI/source-of-truth overclaims. Use `--require-structured-evidence` to require structured evidence and local apply-plan reference resolution.

`scripts/resolve-guided-baseline-selection.mjs` is the 1.17 guided baseline selection entry. It reads project state, platform signals, standard pack candidates, industrial pack candidates, production sensitivity, dirty-worktree state, and existing governance signals, then prints a plain-language Baseline Decision Card. It does not write target-project files, approve implementation, approve release, approve production, or activate BL2.

`scripts/check-guided-baseline-selection.mjs` checks recorded Baseline Decision Cards. It rejects default BL2, selecting all packs, forcing backend without evidence, target-project write approval, implementation approval, release/production approval, high-risk decision approval, existing-governed overwrite language, production-sensitive direct init/update, BL2 candidates without evidence gaps, dirty-worktree continuation, and vague next actions.

`scripts/resolve-standard-baseline.mjs` is the standard baseline pack entry. It is read-only and recommends platform standard packs first, keeps backend/release packs conditional, then shows optional industrial overlays when used through the umbrella CLI. It does not enable packs, install packs, approve implementation, or approve target-project writes.

`scripts/check-standard-baseline-pack.mjs` validates the standard baseline pack registry, index schema, index/pack.json consistency, required pack files, `recommendedForBL` metadata, `activeByDefault: false`, no write/release approval, draft overclaim boundaries, and environment-pack overclaims such as `.env` writes, secret values, invented deployment facts, or CI/CD approval claims.

`scripts/check-standard-baseline-selection.mjs` checks Standard Baseline Selection Reports so standard pack recommendations stay separated from human selection, target-project writes, implementation approval, release approval, production approval, compliance/security/privacy approval, and evidence claims. It also rejects selecting every standard pack, forcing backend for frontend/Mini Program projects without evidence, recommending release/rollback without evidence, and overwrite language for governed existing projects.

`scripts/resolve-baseline-packs.mjs` is now a deprecated lower-level industrial-oriented resolver for exact evidence and debugging. For human usage, use `node scripts/cli.mjs baseline-packs <project>` so standard packs appear first and optional industrial overlays stay second.

`scripts/check-baseline-pack-selection.mjs` checks Baseline Pack Selection Reports so pack recommendations stay separated from human approval, target-project writes, implementation approval, release approval, production approval, and draft-pack stability claims.

`scripts/check-product-baseline.mjs` checks the guided delivery product boundary: humans keep judgment and approval, reports are not approvals, simulated evidence is not production evidence, and industrial packs remain selected-only.

`scripts/check-claim-control.mjs` checks README, release records, final reports, and handoffs for overclaims and missing assumption boundaries.

`scripts/check-context-governance.mjs` checks Learning Candidates, Context Correction Reports, Git Boundary Reports, and source-of-truth boundaries.

`scripts/check-launch-readiness.mjs` checks Launch Readiness Reports, readiness states, verification evidence, pending human decisions, and launch overclaims.

`scripts/check-conversation-drift.mjs` checks Conversation Turn Classification reports and Scope Change Reports so discussion, new scope, direct follow-ups, and risk decisions do not silently continue the current task.

`scripts/check-guided-delivery-loop.mjs` checks Active Work Thread and Guided Decision Summary reports so current mainline, parking lot, and D0-D4 decision boundaries stay visible and non-executable decisions do not become implementation approval.

`scripts/check-first-delivery-walkthrough.mjs` checks Adoption Trial Reports so first-slice walkthroughs include the starting idea, route, baseline path, artifacts, human decisions, drift handling, verification, launch readiness, final report, and claim boundary.

`scripts/check-real-adoption-trial.mjs` checks real-project read-only adoption reports so existing governed or production-sensitive projects are mapped before writes, public evidence stays sanitized, and bridge proposals do not overwrite existing authority.

`scripts/check-patch-classification.mjs` checks patch classification reports so non-trivial fixes are routed as safe local fixes, baseline-aligned hardcuts, structural remediation, human decisions, or do-not-patch stops before implementation. It also checks `patch-classification-false-positives/` when present. False-positive records are calibration evidence only; they do not approve implementation.

`scripts/resolve-existing-workflow.mjs` prints a read-only Workflow Adoption Map recommendation for existing projects. It inventories agent rules, docs, work intake, review/evidence, CI/gates, release/rollback, hooks/automation, and existing AI Native assets, then recommends which AI Native workflow pieces to use before any target-project writes.

`scripts/check-workflow-adoption-map.mjs` checks recorded Workflow Adoption Maps so old-project workflow recommendations do not become authorization to write files, change CI/hooks, overwrite existing governance, approve implementation, or approve release/production/high-risk decisions.

`scripts/resolve-document-lifecycle.mjs` prints a read-only Document Lifecycle recommendation. It inventories likely source-of-truth docs, active references, stale candidates, duplicate candidates, archive suggestions, and deprecation suggestions. It does not delete, move, archive, rewrite, deprecate, or change source-of-truth files.

`scripts/check-document-lifecycle.mjs` checks recorded Document Lifecycle Reports so stale/duplicate documentation cleanup does not become authorization to delete files, move files, archive files, change source of truth, change AGENTS/CI/hooks/release/legal/security/production docs, or approve cleanup work.

`scripts/resolve-document-archive-apply.mjs` is the 1.28 document archive apply entry. It reads Document Lifecycle evidence when present and prints one plan-only Archive Apply Plan with readiness state, proposed archive actions, link-check plan, archive index preview, rollback plan, excluded files, human decisions, and explicit non-authorization boundaries. It does not move, delete, archive, rewrite links, or change source-of-truth files.

`scripts/check-document-archive-apply.mjs` checks recorded Archive Apply Plans. It requires link-check and archive-index sections, rollback planning, explicit human decisions, and no-authority boundaries, and rejects plans that claim files were deleted, moved, archived, links were fixed, cleanup is complete, or archive apply is authorized.

`scripts/resolve-work-queue.mjs` prints a read-only Work Queue recommendation. It inventories Work Queue reports, task cards, active work threads, paused tasks, backlog items, resume candidates, and dirty-worktree state. It does not change task state, approve implementation, approve target-project writes, promote backlog items, or resume stale work.

`scripts/check-work-queue.mjs` checks recorded Work Queue Reports so there is at most one `CURRENT` task, paused work requires resume review, backlog items are not treated as execution permission, and the report does not approve implementation, scope expansion, target-project writes, release, or production.

`scripts/resolve-hook-orchestration.mjs` prints a read-only Hook Orchestration recommendation. It inventories local Git hooks, CI workflows, package scripts, hook tooling, and schedule signals, then classifies candidates as H0/H1/H2/H3. It does not install hooks, modify CI, add blocking gates, call external APIs, enable auto-fix, or change target-project files.

`scripts/check-hook-orchestration.mjs` checks recorded Hook Orchestration Plans so automatic hooks stay plan-first. It rejects plans that claim hooks were installed, CI was modified, blocking gates were added, external APIs were called, auto-fix was enabled, hook output became human approval, or release/production was approved.

`scripts/resolve-hook-policy.mjs` prints a read-only Project Hook Policy recommendation. It inventories existing hook policies, local Git hooks, CI workflows, package scripts, hook tooling, schedules, and external automation signals, then recommends project-level H0/H1/H2/H3 rules, approval owners, and rollback requirements. It does not install hooks, modify CI, add gates, call APIs, store secrets, or enable auto-fix.

`scripts/check-hook-policy.mjs` checks recorded Project Hook Policies so policy does not become implementation authority. It rejects policies that install hooks, modify CI, add blocking gates, call external APIs, store tokens/secrets, enable auto-fix, treat hook output as approval, omit H0-H3 classes, omit approval owners, omit rollback/disable policy, or approve release/production.

`scripts/check-industrial-pack.mjs` validates industrial pack structure, maturity evidence, project-fact purity, draft overclaims, and the 1.16 BL2 depth contract sections. It rejects packs that do not state non-scope, scope, architecture, environment, data, permission, verification, release, evidence, bad-case, forbidden-action, and maturity boundaries.

`scripts/check-industrial-baseline.mjs` checks project BL2 selection and evidence. It rejects all-pack BL2 defaults, selected risk overlays without risk-specific evidence, incompatible selected packs, missing project evidence refs, and selected draft packs without the required human/evidence path.

`scripts/check-change-boundary.mjs` checks Change Boundary Reports so intended scope, allowed paths, forbidden paths, actual changed files, boundary result, and claim boundary are explicit. Use `--report <file>` for a specific report and `--cached` or `--base <ref>` when git diff comparison should be included.

`scripts/check-baseline-state.mjs` checks Baseline State Reports so no-code/new-project baselines are not marked confirmed without evidence or human-confirmed source. Use `--report <file>` for a specific report.

`scripts/workflow-next.mjs` reads project state and reports:

- `ADOPTION_MODE`
- `NEXT_ACTION`
- `CAN_WRITE_WORKFLOW_ASSETS`
- `PROJECT_STATE_TAGS`
- platform baseline readiness
- industrial baseline readiness

Use `--enforce` when the command should fail unsafe states instead of only reporting them.

## Artifact Creation

`scripts/new-workflow-item.mjs` creates supported workflow artifacts with frontmatter.

Common types:

- `request`
- `preflight`
- `spec`
- `eval`
- `task`
- `ai-task-log`
- `review-packet`
- `gpt-review-prompt`
- `review-loop-report`
- `follow-up-proposal`
- `final-report`
- `goal-card`
- `subagent-run-plan`
- `launch-readiness-report`
- `conversation-turn-classification`
- `scope-change-report`
- `adoption-trial-report`
- `real-adoption-trial-report`
- `patch-classification`
- `patch-classification-false-positive`
- `workflow-adoption-map`
- `document-lifecycle-report`
- `approval-record`
- `review-surface-card`
- `debt-knowledge-handoff-report`
- `active-work-thread`
- `guided-decision-summary`
- `change-boundary-report`
- `baseline-state-report`
- `baseline-pack-selection-report`
- `baseline-decision-card`
- `workflow-guidance-card`
- `user-decision-card`

Use `active-work-thread` only when broad conversation, side ideas, or repeated drift make the current mainline unclear. Use `guided-decision-summary` when Codex needs to recommend one safe path and translate technical choices into a human-owned decision.

Use `change-boundary-report` when actual changed files need to be checked against intended scope. Use `baseline-state-report` when Codex drafts or reviews baselines before real project evidence exists.

Use `baseline-pack-selection-report` when Codex recommends BL level and industrial pack candidates before a human confirms the pack set.

## Checks

Checker details are in `docs/reference/checkers.md`.

Common commands:

```bash
node scripts/check-ai-workflow.mjs . --mode core
node scripts/resolve-workflow-guidance.mjs .
node scripts/check-workflow-guidance.mjs .
node scripts/check-workflow-artifacts.mjs . --mode ready
node scripts/check-review-loop.mjs .
node scripts/check-next-step-boundary.mjs .
node scripts/check-goal-mode.mjs .
node scripts/check-subagent-orchestration.mjs .
node scripts/check-engineering-baseline.mjs .
node scripts/check-environment-baseline.mjs .
node scripts/check-baseline-enforcement.mjs . --mode ready
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
node scripts/check-approval-record.mjs .
node scripts/check-change-boundary.mjs .
node scripts/check-baseline-state.mjs .
node scripts/resolve-guided-baseline-selection.mjs .
node scripts/check-guided-baseline-selection.mjs .
node scripts/resolve-baseline-packs.mjs .
node scripts/check-baseline-pack-selection.mjs .
node scripts/check-guided-adoption.mjs .
node scripts/check-platform-baseline.mjs .
node scripts/check-industrial-baseline.mjs .
node scripts/check-industrial-pack.mjs .
```

## Dev-Kit Only Scripts

These are primarily for maintaining this repository:

- `scripts/check-dev-kit.mjs`
- `scripts/check-fixtures.mjs`
- `scripts/check-manifest.mjs`
- `scripts/check-product-baseline.mjs`
- `scripts/check-claim-control.mjs`
- `scripts/check-context-governance.mjs`
- `scripts/check-launch-readiness.mjs`
- `scripts/check-conversation-drift.mjs`
- `scripts/check-guided-delivery-loop.mjs`
- `scripts/check-real-adoption-trial.mjs`
- `scripts/check-patch-classification.mjs`
- `scripts/resolve-existing-workflow.mjs`
- `scripts/check-workflow-adoption-map.mjs`
- `scripts/resolve-document-lifecycle.mjs`
- `scripts/check-document-lifecycle.mjs`
- `scripts/check-approval-record.mjs`
- `scripts/check-change-boundary.mjs`
- `scripts/check-baseline-state.mjs`
- `scripts/resolve-baseline-packs.mjs`
- `scripts/check-baseline-pack-selection.mjs`
- `scripts/check-glossary-usage.mjs`
- `scripts/score-output-quality.mjs`

Target projects normally do not need to run dev-kit-only checks.
