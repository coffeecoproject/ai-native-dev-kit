# Workflow Version Record

## Current Dev Kit Version

`1.21.0`

## Project Version File

`.ai-native/version.json`

## Last Update

## Update Command

```bash
node ai-native-dev-kit/scripts/init-project.mjs --target <project> --update-workflow-assets
```

## Notes

- For governed, production, dirty, or unbootstrapped existing projects, generate a plan first with `--write-plan <file>` and apply it with `--apply-plan <file>` after review.
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
