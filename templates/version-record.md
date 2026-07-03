# Workflow Version Record

## Current Dev Kit Version

`1.60.0`

## Project Version File

`.ai-native/version.json`

## Last Update

## Update Command

```bash
node ai-native-dev-kit/scripts/init-project.mjs --target <project> --update-workflow-assets
```

## Notes

- For governed, production, dirty, or unbootstrapped existing projects, generate a plan first with `--write-plan <file>` and apply it with `--apply-plan <file>` after review.
- `1.60.0` adds Release Handoff Packs: Release Guide can bridge a selected platform recipe and structured release approval into a bounded handoff package.
- `1.60.0` separates Codex, human, and external-system ownership and requires owner, rollback, monitoring, smoke, and close-out evidence.
- `1.60.0` keeps handoff packs read-only: no release approval, release command execution, provider API calls, deploys, uploads, submissions, migrations, secret handling, production mutation, blanket authorization, or Codex release ownership.
- `1.59.0` adds Platform Release Recipes: Release Guide can select or suggest a platform release recipe before release execution planning.
- `1.59.0` ships strict recipes for web hosted preview, backend/API handoff, and mini-program review handoff; draft recipes remain non-strict.
- `1.59.0` keeps recipes read-only: no release approval, provider API calls, deploys, uploads, submissions, migrations, secret handling, production mutation, or Codex release ownership.
- `1.58.0` adds Release Guide Consolidation: users can ask for launch help through one `release-guide` entry that routes across release adapter, launch review, structured approval, and release execution planning.
- `1.58.0` requires structured release approval before execution readiness, classifies assist levels and command risk, and distinguishes release evidence visibility from evidence quality.
- `1.58.0` does not approve release, deploy production, publish previews by itself, run provider API commands, request or store secrets, mutate CI/CD/hooks/DNS/payment/permissions/app-store/mini-program/production config, make Codex the release owner, or treat free-form approval text as release approval.
- `1.57.0` adds Guided Release Adapter: Codex can discover a project-specific release path, recommend a safe beginner-friendly release target, record missing release inputs, and bridge into Release Execution.
- `1.57.0` does not approve release, deploy production, request or store secrets, mutate CI/CD/hooks/DNS/payment/permissions/app-store/mini-program/production config, make Codex the release owner, or treat beginner confirmation as production approval.
- `1.56.0` adds Release Execution Protocol: after Launch Review View and explicit Human Release Approval, Codex can generate a bounded release execution plan with step owners, stop conditions, and evidence capture.
- `1.56.0` does not approve release, deploy, publish, submit review, run migrations, change production configuration, change secrets/DNS/CI/hooks/payment/permissions/app-store/mini-program settings, replace release SOPs, or make Codex the release owner.
- `1.55.0` adds Launch Review View: users can ask whether closed work can enter launch review while Unified Closure remains the close-out source and Safe Launch remains the readiness-label source.
- `1.55.0` does not approve release, deploy, publish, submit review, change production configuration, change secrets/DNS/CI/hooks/payment/permissions/migrations, or replace project release SOPs.
- `1.54.0` adds Decision Explain Trace: Closure Decisions now explain why the final result was selected through Decision Trace, Dominant Reason, and Conflict Summary.
- `1.54.0` does not add another close-out command or final closure source; it keeps `finish` as the plain close-out entry.
- `1.53.0` adds Unified Closure Model: `finish` now returns one final Closure Decision for a task while Change Impact Coverage, Execution Closure, Guided Closure, and Evidence Precision remain inputs.
- `1.53.0` prevents split close-out truth by making the stricter result win when lower-level closure artifacts disagree.
- `1.52.0` adds Guided Closure Experience: users can ask whether a task is done through `finish`, while Codex summarizes close-out status, missing work, safe next action, human decisions, and technical evidence in one read-only card.
- `1.52.0` keeps low-level strict evidence commands available for maintainers and CI, but default user-facing close-out should not require users to choose strict flags.
- `1.51.0` hardens close-out evidence precision: strict checks can require exact Change Impact Coverage report selection, task/intent alignment, meaningful resolved evidence files, and real record resolution for `artifact:` / `human-decision:` refs.
- `1.51.0` keeps precision checks opt-in and does not approve implementation, apply, commit, push, release, production, or high-risk decisions.
- `1.50.0` hardens evidence reliability: strict Change Impact Coverage checks can require resolvable `DONE` evidence refs, impact coverage can read changed files from git diff, and Execution Closure can require linked strict impact coverage for cross-surface READY closures.
- `1.50.0` keeps strict evidence reference resolution opt-in and does not approve implementation, apply, commit, push, release, or production.
- `1.49.0` hardens Change Impact Coverage: reports can include structured `Machine-Readable Evidence`, `preflight` / `closure` modes, strict evidence checks, changed-file implication checks, and Execution Closure citation support.
- `1.49.0` keeps old Markdown reports compatible by default and only requires strict structured evidence when explicitly requested.
- `1.48.0` adds Change Impact Coverage: Codex can map and close affected user-flow, frontend, API, backend, data, error-copy, test, docs, permission, and release surfaces before a rule or behavior change is treated as complete.
- `1.48.0` remains non-executing: it does not write files, implement missing surfaces automatically, authorize apply, approve implementation, approve release/production, change CI/hooks, touch high-risk surfaces, enable BL2, or prove every possible impact was found.
- `1.47.0` hardens evidence reliability and risk calibration: product completeness can read structured JSON evidence, MVP examples include booking, dashboard, and CLI shapes, benign workflow/key/package wording is calibrated, and structured apply-candidate source checks use the 1.46 evidence boundary.
- `1.46.0` hardens the ordinary-user product loop: Quickstart starts with the user goal, product completeness can cite explicit smoke evidence, MVP examples cover booking and dashboard shapes, risk-surface checks are shared, and low-risk apply candidate records can be strict structured evidence.
- `1.46.0` remains non-executing: it does not add an apply runner, write files, authorize apply, approve implementation, approve release/production, change CI/hooks, touch high-risk surfaces, enable BL2, or promote industrial packs.
- `1.45.0` completes the ordinary-user first-slice product loop: first-slice scope, product completeness, runnable MVP example evidence, and low-risk controlled apply candidate records.
- `1.45.0` keeps the new loop non-executing: it does not write files, authorize apply, approve implementation, approve release/production, change CI/hooks, touch high-risk surfaces, enable BL2, or promote industrial packs.
- `1.41.1` hardens Structured Evidence Schema: apply/readiness/approval checkers support `--require-structured-evidence`, strict readiness/approval checks require local apply-plan reference resolution, and structured readiness rejects empty actions unless the state is `NO_APPLY_PLAN`.
- `1.41.1` keeps legacy Markdown compatibility by default and remains non-executing.
- `1.41.0` adds Structured Evidence Schema: Unified Apply Plan, Controlled Apply Readiness, and Approval Record can include machine-readable JSON evidence with schema validation and apply plan digest cross-checks.
- `1.41.0` keeps structured evidence non-executing: it does not add a controlled apply runner, write files, validate real human identity, authorize automatic apply, approve implementation, approve release/production, install hooks, change CI, change source of truth, enable BL2, or enable industrial packs.
- `1.40.1` hardens Approval Record Governance: naming is clarified, artifact lifecycle and O0 / BL0 lightweight path docs are added, and approval records reject wildcard paths, parent traversal, symlink aliases, expired approvals, ambiguous human owners, mismatched action IDs, and plan-changed-after-approval records.
- `1.40.0` adds Approval Record Governance: after Controlled Apply Readiness, Codex can record exactly which action IDs, target paths, plan hash, expiry, rollback, and verification a human approved.
- `1.39.0` adds Subagent Dispatch Hygiene: before opening or reusing helper agents, Codex records recover-before-dispatch checks for stale helpers, completed helpers, unused planned helpers, task drift, and active writer count.
- `1.39.0` keeps dispatch hygiene non-automating: it does not create or close real subagents, add schedulers, install hooks, call external GPT/API review, approve writes, approve implementation, or approve release/production.
- `1.38.0` adds Controlled Apply Readiness: after a Unified Apply Plan exists, Codex can evaluate whether it is eligible for a future human-approved controlled apply step.
- `1.38.0` keeps readiness non-authorizing: it does not add an apply runner, write files, authorize apply, approve implementation, approve release/production, install hooks, modify CI, archive documents, change source of truth, enable industrial packs, or approve high-risk decisions.
- `1.37.0` adds Conversation-Native Ask: a user's plain project goal can be treated as the default entry path, internally routing through Beginner Entry behavior without making the user choose workflow command names first.
- `1.37.0` keeps conversational entry non-authorizing: it does not write target-project files, authorize apply, approve implementation, approve release/production, install hooks, modify CI, archive documents, change task state, enable baseline/industrial packs, or approve high-risk decisions.
- `1.36.0` adds Repository Information Architecture: README is the product entry, `docs/README.md` and `docs/index.md` are the documentation entry, `docs/repository-structure.md` explains root artifact directories, and `docs/document-ownership.md` defines source-of-truth rules.
- `1.36.0` moves historical implementation plans into `docs/plans/` and roadmap documents into `docs/roadmaps/` without changing generated-project artifact paths or CLI behavior.
- `1.35.0` adds Beginner Entry: users can provide one natural-language goal through `ask` without choosing internal workflow commands.
- `1.35.0` keeps beginner entry non-authorizing: it does not write files, authorize apply, approve implementation, approve release/production, install hooks, change CI, archive documents, change task state, enable baseline/industrial packs, or approve high-risk decisions.
- `1.34.0` adds Unified Apply Plan: proposed writes can be collected into one plan with evidence, action scope, human-only items, backup, rollback, verification, and explicit no-apply boundaries.
- `1.34.0` keeps apply planning non-authorizing: it does not write files, approve apply, approve implementation, approve release/production, install hooks, change CI, archive documents, enable industrial packs, or approve high-risk decisions.
- `1.33.0` adds Evidence-Linked Closure: closure can link Review Surface, Review Loop, Change Boundary, Verification, Debt Handoff, and Delivery Path evidence.
- `1.33.0` treats changed files as scope evidence only; changed files do not prove functional or code review pass.
- `1.32.0` adds Execution Review Closure through `closure`, `closure-check`, and Execution Closure Reports.
- `1.32.0` keeps closure non-authorizing: closure can report commit-readiness state but does not authorize commit, push, implementation, release, production, debt forgiveness, task-state change, or high-risk decisions.
- `1.31.0` adds Intent-Aware Deep Guide through `guide --deep --intent "<goal>"`, intent classification, and user-facing `User Intent` output.
- `1.31.0` keeps intent non-authorizing: intent classification improves routing but does not approve writes, implementation, release, production, payment, auth, data, migration, security, privacy, tax, legal, hook, CI, or automation decisions.
- `1.30.0` adds Deep Guide Orchestration through `guide --deep`, selective read-only downstream checks, and a compressed `What I Checked` section.
- `1.30.0` keeps deep guide non-authorizing: it does not write target files, modify CI, install hooks, delete/archive documents, change task state, approve implementation/release/production, approve high-risk decisions, or replace detailed downstream evidence.
- `1.29.0` adds Project Hook Policy through `hook-policy`, `hook-policy-check`, and Project Hook Policy documents.
- `1.29.0` lets Codex define which hook classes a project allows, who approves H2/H3 hooks, and how hooks are disabled or rolled back before any future approved implementation task.
- `1.29.0` keeps hook policy non-authorizing: it does not install hooks, modify CI, add blocking gates, call external APIs, store tokens/secrets, enable auto-fix, approve implementation/release/production, or replace Hook Orchestration.
- `1.28.0` adds Document Archive Apply through `archive-apply`, `archive-apply-check`, Archive Apply Plans, and Archive Index previews.
- `1.28.0` lets Codex turn document lifecycle archive suggestions into a controlled apply plan while keeping actual archive/move/delete/link rewrite actions blocked until explicit approval.
- `1.28.0` keeps archive apply plans non-authorizing: they do not delete files, move/archive files, rewrite links, change source of truth, replace Document Lifecycle, or approve cleanup completion.
- `1.27.0` adds Debt & Knowledge Handoff through `debt-handoff`, `debt-handoff-check`, and Debt & Knowledge Handoff Reports.
- `1.27.0` lets Codex record interrupted work, known debt, verification notes, files to revisit, human decisions, and where to resume next.
- `1.27.0` keeps handoff reports non-approving: they do not forgive debt, approve implementation, approve release/production, change task state, change source of truth, replace Review Loop, or replace Safe Launch.
- `1.26.0` adds Delivery Path Governance through `delivery-path`, `delivery-path-check`, and Delivery Path Reports.
- `1.26.0` lets Codex explain whether a project is an idea, ready for plan, ready for local build, ready for self-test, ready for internal trial, ready for release review, or blocked.
- `1.26.0` keeps Delivery Path Reports read-only: they do not write target files, change CI/hooks, change task state, approve implementation, approve release/production, replace Safe Launch, or prove real users can use the product.
- `1.25.0` adds Review Surface Governance through `review-surface`, `review-surface-check`, and Review Surface Cards.
- `1.25.0` lets Codex select what must be reviewed before and after execution, while always requiring functional, code, verification, and debt review.
- `1.25.0` keeps review-surface cards read-only: they do not write target files, modify CI, install hooks, delete/archive documents, change task state, approve implementation, approve release/production, or approve high-risk domain decisions.
- `1.24.0` adds Natural Language Workflow Orchestrator through `guide`, `guide-check`, Workflow Guidance Cards, and a plain-language routing contract.
- `1.24.0` keeps guidance read-only: it does not write target files, modify CI, install hooks, delete/archive documents, change task state, approve implementation, approve release/production, or approve high-risk domain decisions.
- `1.23.1` adds `npm run verify:governance` so local verification explicitly runs workflow-map, doc-lifecycle, work-queue, hook-plan, and their checkers.
- `1.23.1` adds a plain README decision table for choosing the first command without changing project asset requirements.
- `1.23.0` adds Hook Orchestration Governance through `hook-plan`, `hook-plan-check`, and Hook Orchestration Plans.
- `1.23.0` keeps hooks plan-first: H0/H1 can be read-only or suggestion-only, while H2/H3 require human confirmation or explicit approval before installation, CI changes, blocking gates, API calls, auto-fix, release, or production behavior.
- `1.22.0` adds Work Queue Governance through `work-queue`, `work-queue-check`, and Work Queue Reports.
- `1.22.0` enforces at most one `CURRENT` task, requires resume review for paused work, and keeps backlog items as parked work rather than execution permission.
- `1.21.0` adds Document Lifecycle Governance through `doc-lifecycle`, `doc-lifecycle-check`, and Document Lifecycle Reports.
- `1.21.0` defaults stale and duplicate docs to archive suggestions, not deletion, and does not move files or change source of truth.
- `1.20.0` adds a read-only workflow adapter path for existing projects through `workflow-map`, `workflow-map-check`, and Workflow Adoption Map reports.
- `1.20.0` does not install target-project workflow assets, change hooks or CI, approve implementation, approve production/release, or solve doc lifecycle, work queue, or hook orchestration phases.
- `1.19.0` adds Baseline Selection Precision Calibration: the precision scoreboard is machine-checkable, synthetic fixtures exercise known selector-risk patterns, and `scripts/check-baseline-selection-precision.mjs` compares resolver output against expected safe action, Platform States, packs, and BL2 candidate wording.
- `1.19.0` does not add new packs, enable BL2, approve target-project writes, approve implementation, approve release/production, or claim real-project production validation.
- `1.18.1` hardens Guided Baseline Selection checks: Platform States are required, allowed state values are validated, required profile rows must exist, examples include Platform States, and `npm run verify` is split into named phases.
- `1.18.1` adds a baseline-selection precision scoreboard for recording false positives, false negatives, and calibration status without claiming production validation.
- `1.18.1` does not add new packs, enable BL2, approve target-project writes, approve implementation, approve release/production, or claim real-project production validation.
- `1.18.0` calibrates Guided Baseline Selection after read-only project trials: current safe action is separated from target candidate level, Platform States explain monorepo profile status, Mini Program cloud functions make backend/API scope possible, and internal-admin detection is stricter.
- `1.18.0` does not add new packs, enable BL2, approve target-project writes, approve implementation, approve release/production, or claim real-project production validation.
- `1.17.1` calibrates Guided Baseline Selection after review: BL2 is phrased as a candidate path for human review, PR/release CI runs explicit baseline-decision checks, Baseline Decision Card print-vs-save behavior is documented, and CODEOWNERS has active maintainer ownership.
- `1.17.1` does not add new packs, enable BL2, approve target-project writes, approve implementation, approve release/production, or claim real-project production validation.
- `1.17.0` adds Guided Baseline Selection Entry and Baseline Decision Cards so Codex can explain BL0/BL1/BL2, standard packs, industrial candidates, human decisions, and safe next actions in plain language.
- `1.17.0` does not approve target-project writes, implementation, release, production, BL2 activation, or high-risk domain decisions.
- `1.16.0` deepens BL2 industrial packs with a shared depth contract, pack-specific evidence boundaries, risk overlay evidence checks, 1.16 examples, and bad fixtures for depth, all-pack selection, and risk overlay misuse.
- `1.16.0` does not promote industrial packs, make BL2 default, select all packs, approve target-project writes, approve implementation, approve release/production, or claim real-project production validation.
- `1.15.1` hardens Standard Baseline Pack Registry checks with an index-level schema, index/pack.json consistency checks, resolver execution in `npm run verify`, environment overclaim fixtures, and an explicit CODEOWNERS owner-decision backlog.
- `1.15.1` does not add new standard packs, promote draft packs, enable BL2 by default, approve target-project writes, or claim production validation.
- `1.15.0` adds platform standard baseline packs for Mini Program, iOS, Android, internal admin, and environment setup. It keeps backend and release packs conditional and keeps industrial overlays separate.
- `1.15.0` does not approve target-project writes, implementation, release, production, compliance, security, privacy, payment, tax, finance, HR, migration, or BL2 activation.
- `1.14.1` hardens Standard Baseline Pack Registry checks: selected profile ids must resolve, standard pack metadata fields are explicit, public documentation URLs do not trigger private URL or bundle-id false positives, and the lower-level industrial resolver is marked deprecated for human entry.
- `1.14.1` is a patch release only; it does not add new packs, promote draft packs, change BL defaults, approve target-project writes, or claim production validation.
- `1.14.0` adds Standard Baseline Pack Registry assets and commands so Codex can recommend ordinary engineering guardrails before considering optional BL2 industrial overlays.
- `1.14.0` keeps standard pack recommendations inactive by default: they do not approve target-project writes, implementation, release, compliance, security, privacy, or industrial-pack activation.
- `1.13.0` adds Baseline Pack System assets and commands so Codex can recommend profile, BL level, platform packs, capability packs, and risk overlays without enabling packs or approving BL2.
- `1.13.0` keeps all current industrial packs selected-only and maturity-bound; draft pack files do not prove production readiness or real project evidence.
- `1.12.1` fixes manifest phase drift, updates README self-check guidance with 1.12 checks and `npm run verify`, and syncs `check-ai-workflow` fallback paths with 1.12 assets.
- `1.12.0` adds Change Boundary, Guided Delivery Check, and Baseline State Guard assets so Codex can show intended scope, actual changes, current-mainline decisions, and whether a baseline is proposed, pending, evidence-required, or confirmed.
- `1.12.0` adds `guided-delivery`, `change-boundary`, and `baseline-state` checks. These checks do not approve target-project writes, production/release/risk decisions, no-code baseline confirmation, automatic GPT/API review, or industrial-pack promotion.
- `1.11.0` adds governance hardening: README release sync, direct init non-empty protection, manifest reverse drift guard, structured release section checks, and `npm run verify`.
- Direct new-project init refuses non-empty target directories unless `--force-new-project` is explicitly passed. Existing projects should use dry-run / write-plan / apply-plan.
- `1.10.0` adds Guided Decision & Delivery Loop assets: Decision Delegation Boundary, Guided Delivery Loop, Active Work Thread, Guided Decision Summary, Delivery Coach prompt, and user-facing docs.
- `1.10.0` helps Codex recommend the smallest safe path, keep one current mainline, park side ideas, and translate raw technical choices into user-owned decisions. It does not approve implementation, release, production, payment, privacy, security, compliance, migration, or target-project writes.
- `1.9.0` adds Human Decision Summary output: recommended choice, alternatives, file-write impact, risk, and no-decision outcome should appear before technical details.
- Use `--dry-run` to preview init/update actions without writing target files.
- Use `--backup-dir <dir>` when reviewed updates may overwrite managed workflow assets.
- New workflow artifacts generated by `new-workflow-item.mjs` include frontmatter for schema-aware checks.
- Legacy artifacts without frontmatter produce migration warnings by default and fail only when `check-workflow-artifacts.mjs --strict-schema` is used.
- Dev-kit fixture checks use a typed matrix covering golden, bad, migration, CLI, init/update, and output-quality cases.
- Checker scripts use shared helper libraries under `scripts/lib/`; generated projects must keep those helper files with copied checker scripts.
- Industrial pack maturity metadata and license boundary docs are part of the dev-kit update surface.
- `ai-native migrate` is plan-only in 0.42.0: use `--dry-run` or `--write-plan <file>`; it does not apply changes to target projects.
- `1.6.0` adds Conversation Drift Control assets: Conversation Drift Control, Conversation Turn Classification, Scope Change Report, conversation router prompt, and conversation drift checks.
- `1.6.0` keeps discussion-only, review-only, direct follow-up, scope-change, new-task, and risk-decision turns from becoming automatic current-task execution.
- `1.5.0` adds Safe Launch / Delivery Readiness assets: Safe Launch, Launch Readiness Report, launch readiness prompt, and launch readiness checks.
- `1.5.0` classifies readiness as not ready, demo-ready, internal-handoff ready, release-review ready, or blocked; it does not approve production launch.
- `1.4.1` adds context governance usage and minimal commit set guidance without adding a new workflow gate.
- `1.3.0` adds Guided Delivery Baseline assets: Outcome Baseline, Product Baseline, Claim Control, Assumption Register, product baseline checks, and claim control checks.
- `1.3.0` keeps reports, review packets, goal cards, and subagent outputs from becoming approvals; simulated dogfood is not production evidence.
- `1.4.0` adds Project Memory & Context Governance assets: Context Governance, Git Boundary, Learning Candidate, Context Correction Report, Git Boundary Report, and context governance checks.
- `1.4.0` keeps project memory candidate-first: Codex may propose context updates, but humans confirm before source-of-truth changes.
- `1.2.0` adds `ai-native baseline` / `node scripts/cli.mjs baseline <project>` as a read-only baseline recommendation entry after `start`.
- `baseline` keeps `Can AI write now: No`; writes require `baseline-project --write-plan` and reviewed `--apply-plan`.
- Generated projects include Environment Baseline assets, baseline recommendation folders, and artifact-level baseline enforcement checks.
- `1.1.0` adds `ai-native start` / `node scripts/cli.mjs start <project>` as a read-only guided adoption entry.
- `start` classifies the project, recommends a safe adoption path, and keeps target project writes behind dry-run, write-plan, and human confirmation.
- `1.0.0` is a minimum productization release; 10/10 real-project evidence is not yet claimed.
- Workflow asset updates must not overwrite project docs, specs, tasks, logs, or business code.
- Workflow asset updates may add missing onboarding docs and missing workflow directories.
- Existing `.github/pull_request_template.md` files are not modified unless `--apply-pr-template-governance` is explicitly used after reviewing `.ai-native/migration-reports/pr-template-governance.md`.
- Existing `AGENTS.md` files are not modified unless `--apply-agent-governance` is explicitly used after reviewing `.ai-native/migration-reports/agents-governance.md`.
- Version mismatch means the project may not have the latest workflow assets.
- `1.7.0` adds First Delivery Walkthrough assets: First Delivery Walkthrough, Adoption Trial Report, walkthrough agent prompt, and first delivery checks.
- `1.7.0` records first-slice walkthrough and adoption trial evidence, but it does not claim production validation or approve release, payment, privacy, security, legal, compliance, migration, or customer promises.
- `1.8.0` adds Real Project Read-only Adoption Trial assets, Patch Classification Governance assets, real adoption checks, and patch classification checks.
- `1.8.0` keeps real-project evidence sanitized by default and does not treat read-only reports or patch classification as target-project write approval.
- `1.8.1` adds real adoption usage guidance and patch classification false-positive calibration records.
- `1.8.1` keeps `real-adoption` as a recorded-report checker, not an automatic target-project report generator.
