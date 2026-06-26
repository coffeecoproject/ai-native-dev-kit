# AI Native Dev Kit Version

Current version: `0.27.0`

## Versioning Policy

- Patch changes update templates, prompts, checklists, scripts, or docs without changing required project structure.
- Minor changes add new required workflow assets, profiles, starters, or checks.
- Major changes alter workflow gates, task levels, initialization semantics, or compatibility expectations.

## Current Release

`0.27.0`

Includes:

- Review Loop semantic checker with task/spec/eval/review-packet reference checks, finding category validation, AUTO_FIX bounds, human-decision routing, and verification-after-fix requirements
- Bounded Next-Step semantic checker with suggestion type validation, Can AI do now consistency, required entry checks, human-decision routing, and DO_NOT_PROCEED guardrails
- Artifact Decision Tree for choosing the right workflow artifact without creating every template by default
- target-project bootstrap now installs `.ai-native/docs/artifact-decision-tree.md`
- workflow artifact implementation gate now expects Review Packet and Review Loop Report for L2/L3 tasks
- GitHub Actions workflow includes Review Loop and Next-Step semantic checks
- dev-kit self-check covers generated-project Review Loop and Next-Step semantic failures
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
- dev-kit end-to-end self-check
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
- review loop protocol self-checks in `check-dev-kit.mjs`
- adoption assessment and governance map generation entries
- Output Experience Protocol for human-first workflow, baseline, adoption, review, release, and audit reporting
- plain-language glossary for AI Native workflow terms
- reporter agent prompt for converting technical workflow state into human-readable status
- human status report, decision brief, plain review summary, and customer handoff templates
- `workflow-next --format human|technical|json` with human summary before technical fields by default
- workflow item generation for human status reports, decision briefs, plain review summaries, and customer handoffs
- generated project output report directories for status reports, decision briefs, review summaries, and customer handoffs
- AGENTS.md governance includes Output Experience rules
