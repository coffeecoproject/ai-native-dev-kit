# AI Native Dev Kit Productization Hardcut 1.0 Plan

## Status

Status: Active execution plan

Current baseline: `0.33.0` frozen in `releases/0.33.0/`

Current executed phase: `0.38.0` Init/Update Safety

Target release: `1.0.0`

Goal Mode: `DEFINE_WORK`

Task level: `L3`

Reason:

- This is a structural productization program, not a single feature task.
- It touches release policy, CI, CLI, manifest, init/update behavior, artifact format, fixtures, docs, license, and industrial pack maturity.
- It must be executed in small phases with review evidence and stop conditions.

## Human Summary

The goal is to hardcut `ai-native-dev-kit` from a strong workflow-asset repository into a product-grade kit.

Product-grade means:

```text
installable
upgradable
checkable
migratable
auditable
license-clear
safe for real project adoption
```

This plan does not add more workflow concepts. It turns the existing concepts into a stable product surface.

## Problem

`0.33.0` already has strong workflow governance:

- Goal Mode
- Subagent Orchestration
- Engineering Baseline
- Review Loop
- Bounded Next-Step
- Output Quality
- fixtures and dogfood examples
- Web and Mini Program BL2 examples

The remaining gap is productization:

- scripts are powerful but not a stable CLI product
- required assets are repeated across scripts
- init/update lacks full dry-run and apply-plan safety
- checker logic still depends heavily on Markdown section parsing
- artifact machine fields are not yet schema-backed
- dev-kit itself needs stronger first-party CI and release evidence
- license and commercial boundary need clearer product-level wording
- industrial packs need lifecycle maturity states

## Target Rules

1. Do not add new workflow concepts unless they are required for productization.
2. Preserve current working behavior while introducing safer product surfaces.
3. Every phase must have its own checks, review loop, and rollback notes.
4. No phase may silently weaken existing `check-dev-kit` coverage.
5. No phase may make draft industrial packs look stable.
6. No phase may auto-modify governed, production, or dirty projects without explicit approval.
7. Every helper agent must be `CLOSED` or `SKIPPED` before final response, commit, or handoff.

## Non-goals

- No SaaS.
- No online license server.
- No real commercial authorization workflow.
- No new industrial pack categories.
- No external GPT/API reviewer automation.
- No silent compatibility for every historical artifact.
- No source-code scanning gate unless a later phase has a separate approved decision brief.

Reason for excluding source-code scanning:

```text
Source-code scanning turns this program from workflow productization into static-analysis productization. It needs separate false-positive governance, project-language scope, and rollout evidence.
```

## Goal Mode Program Routing

This program uses Goal Mode at two levels.

Program-level route:

| Area | Goal Mode | Why |
|---|---|---|
| Overall 1.0 plan | `DEFINE_WORK` | The work must be split into phases before implementation |
| Each phase kickoff | `IMPLEMENT_TASK` | A phase may execute only after task card and eval exist |
| Manifest/schema decisions | `BASELINE_DECISION` | These change engineering conventions |
| Phase review | `REVIEW_TASK` | Every phase must produce review evidence |
| Auto-fix of deterministic findings | `REPAIR_TASK` | Only for bounded `AUTO_FIX` findings |
| Release candidate | `HANDOFF_OR_REPORT` | Release needs evidence and human-readable status |

Phase-level routing rule:

```text
No phase starts from natural language alone.
Each phase must create or update:
Goal Card -> Request -> Preflight -> Spec -> Eval -> Task -> Review Packet -> Review Loop Report -> Final Report
```

## Subagent Orchestration Model

Use Subagent Run Plans for every implementation phase.

Default rule:

```text
Many readers, one writer.
```

Core roles:

| Agent | Authority | Purpose | Close Condition |
|---|---|---|---|
| Goal Planner | `READ_ONLY` | Route phase goal and scope | Goal Card accepted |
| Productization Architect | `READ_ONLY_DRAFT` | Draft target rules and phase boundaries | Spec/eval handoff complete |
| Manifest Agent | `READ_ONLY_DRAFT` or `WRITER_LIMITED` | Inspect and later update manifest-related assets | Manifest checks pass |
| CLI Agent | `WRITER_LIMITED` | Implement CLI facade when approved | CLI smoke passes |
| Init/Update Safety Agent | `WRITER_LIMITED` | Implement plan/dry-run/backup changes | safety smoke passes |
| Schema Agent | `READ_ONLY_DRAFT` or `WRITER_LIMITED` | Draft schemas and migration warnings | schema fixtures pass |
| Fixture Agent | `WRITER_LIMITED` | Add golden/bad/migration fixtures | fixture suite passes |
| Docs/License Agent | `WRITER_LIMITED` | Split docs and clarify license text | doc checks pass |
| Reviewer | `READ_ONLY` | Review findings only | Review Loop handoff complete |
| Repair | `WRITER_LIMITED` | Fix `AUTO_FIX` findings only | max 2 repair rounds |
| Reporter | `READ_ONLY_DRAFT` | Produce final reports and release evidence | final report complete |

Forbidden subagent behavior:

- reviewer edits files
- multiple active writers on same file set
- helper agent left `RUNNING`
- standby helper agent kept open for later
- external GPT/API automation triggered by this plan
- `NEEDS_HUMAN_DECISION` treated as implementation approval

## Execution Order

The program is split into productization phases.

Each phase must be separately committed and reviewed.

```text
0.34.0  Baseline Freeze + Self CI
0.35.0  Manifest Introduction, read-only
0.36.0  CLI Front Door
0.37.0  Manifest Authoritative Asset Source
0.38.0  Init/Update Safety: dry-run, plan, backup
0.39.0  Artifact Frontmatter + Schema
0.40.0  Fixture Matrix Expansion
0.40.1  Checker Library Refactor
0.41.0  Industrial Pack Maturity + License Boundary
0.42.0  Docs Information Architecture + Migration Command
1.0.0   Release Evidence + Real Adoption Entry Criteria
```

## Phase Dependency Rule

A phase may start only when all previous phase final reports are either `Closed` or explicitly `Closed-With-Followups` with follow-ups that do not affect the next phase.

Additional dependency rules:

- Manifest-authoritative work must not start before first-party CI is green.
- CLI must remain thin until manifest metadata exists.
- Checker refactor must not start before fixture expansion proves current behavior.
- Schema/frontmatter work must not begin until init/update safety has a clear migration-report path.
- License wording changes require human decision before being promoted into release materials.

## Phase 0.34.0: Baseline Freeze + Self CI

Goal Mode: `IMPLEMENT_TASK`

Subagent mode: `REVIEW_LOOP`

Objective:

```text
Freeze current 0.33.0 behavior and make dev-kit itself run first-party CI.
```

Scope:

- Add `.github/workflows/dev-kit-pr-checks.yml`.
- Add `.github/workflows/dev-kit-release-checks.yml`.
- Add `.github/pull_request_template.md`.
- Add `CODEOWNERS`.
- Add `CONTRIBUTING.md`.
- Add `SECURITY.md`.
- Add `releases/current-baseline/` evidence records or `releases/0.33.0/` baseline evidence.
- Add baseline freeze doc with current commit, version, examples, checkers, generated-project assets, and license statement.

Required PR CI:

```bash
node scripts/check-dev-kit.mjs
node scripts/check-fixtures.mjs
find scripts -name '*.mjs' -print0 | xargs -0 -n1 node --check
node scripts/score-output-quality.mjs examples/goal-subagent-l2-feature --min-score 80
node scripts/check-glossary-usage.mjs .
```

Required PR smoke:

```bash
tmp=$(mktemp -d)
node scripts/init-project.mjs --starter generic-project --target "$tmp/project"
node "$tmp/project/scripts/check-ai-workflow.mjs" "$tmp/project" --mode core
node "$tmp/project/scripts/workflow-next.mjs" "$tmp/project"
node "$tmp/project/scripts/check-project-onboarding.mjs" "$tmp/project"
node "$tmp/project/scripts/check-engineering-baseline.mjs" "$tmp/project"
node "$tmp/project/scripts/check-workflow-version.mjs" "$tmp/project"
```

Required release CI:

```bash
node scripts/check-dev-kit.mjs
node scripts/check-fixtures.mjs
find . -name '*.mjs' -not -path './node_modules/*' -print0 | xargs -0 -n1 node --check
node scripts/score-output-quality.mjs examples/goal-subagent-l2-feature --min-score 80
node scripts/check-glossary-usage.mjs .
```

Required release smoke:

```bash
tmp=$(mktemp -d)
node scripts/init-project.mjs --starter generic-project --target "$tmp/project"
node "$tmp/project/scripts/check-ai-workflow.mjs" "$tmp/project" --mode core
node "$tmp/project/scripts/workflow-next.mjs" "$tmp/project"
node "$tmp/project/scripts/check-project-onboarding.mjs" "$tmp/project"
node "$tmp/project/scripts/check-engineering-baseline.mjs" "$tmp/project"
node "$tmp/project/scripts/check-workflow-version.mjs" "$tmp/project"
```

Release CI may later add update, migration, and full fixture matrix smoke after those commands exist.

Artifacts:

- `goal-cards/` phase goal card
- `subagent-run-plans/` phase run plan
- `review-packets/` CI hardcut review packet
- `review-loop-reports/` CI hardcut review loop report
- `final-reports/` CI hardcut final report

Acceptance criteria:

- Dev-kit CI exists and runs self-checks.
- CI is split into PR and release tiers, even if release tier initially runs the same checks plus broader syntax coverage.
- Local `node scripts/check-dev-kit.mjs` passes.
- Local generated-project smoke passes.
- PR template requires workflow evidence.
- No target-project bootstrap behavior changes except CI and repo governance files in dev-kit itself.

Stop conditions:

- CI cannot run on GitHub without secrets.
- Generated-project smoke becomes flaky.
- Any existing checker behavior weakens.

## Phase 0.35.0: Manifest Introduction, Read-only

Goal Mode: `BASELINE_DECISION`

Subagent mode: `READ_ONLY_RESEARCH`

Objective:

```text
Introduce central manifest without making it authoritative yet.
```

Scope:

- Add `dev-kit-manifest.json`.
- Add `schemas/dev-kit-manifest.schema.json`.
- Add `scripts/lib/manifest.mjs`.
- Add `scripts/check-manifest.mjs`.
- Manifest mirrors current asset lists from:
  - `check-dev-kit.mjs`
  - `check-ai-workflow.mjs`
  - `workflow-next.mjs`
  - `init-project.mjs`
  - `templates/workflow-version.json`
- Existing scripts still use their current lists.
- New check detects drift between manifest and script lists.
- Manifest validation runs before drift detection.

Manifest groups:

```text
sourceRequired
targetCore
targetFull
aiNativeCore
templates
prompts
checklists
profiles
industrialPackRegistry
workflowDirs
scripts
platformAdapters
examples
fixtures
```

Manifest compatibility policy:

```text
manifest.schemaVersion = 1.0
manifest.devKitVersion must match VERSION.md current version during release
check-manifest validates schema before drift detection
read-only manifest must not change init/update/check behavior
```

Acceptance criteria:

- `node scripts/check-manifest.mjs` passes.
- `node scripts/check-dev-kit.mjs` runs `check-manifest`.
- Adding a new manifest asset produces a clear drift report until scripts are aligned.
- Invalid manifest schema fails before drift checking.

Stop conditions:

- Manifest format cannot represent existing managed assets.
- Drift checker creates noisy false positives.
- Manifest drift logic requires changing production behavior before 0.37.

## Phase 0.36.0: CLI Front Door

Goal Mode: `IMPLEMENT_TASK`

Subagent mode: `PLAN_THEN_BUILD`

Objective:

```text
Create a stable `ai-native` CLI facade while preserving existing scripts as lower-level commands.
```

Scope:

- Add `package.json`.
- Add `scripts/cli.mjs`.
- Add CLI help and command routing.
- Add package scripts:
  - `check`
  - `self-check`
  - `fixtures`
  - `smoke:init`
- Update README to prefer CLI for human usage.
- Keep direct `scripts/*.mjs` paths documented as lower-level reference.
- Let CLI read basic manifest metadata when available, such as dev-kit version and command registry.

Target commands:

```bash
ai-native init
ai-native update
ai-native next
ai-native check
ai-native doctor
ai-native new
ai-native migrate
ai-native fixtures
ai-native self-check
```

Initial CLI mapping:

| CLI | Underlying script |
|---|---|
| `ai-native init` | `scripts/init-project.mjs` |
| `ai-native update` | `scripts/init-project.mjs --update-workflow-assets` |
| `ai-native next` | `scripts/workflow-next.mjs` |
| `ai-native check` | `scripts/check-ai-workflow.mjs` |
| `ai-native doctor` | `workflow-next` + core checks |
| `ai-native new` | `scripts/new-workflow-item.mjs` |
| `ai-native fixtures` | `scripts/check-fixtures.mjs` |
| `ai-native self-check` | `scripts/check-dev-kit.mjs` |

Acceptance criteria:

```bash
node scripts/cli.mjs --help
node scripts/cli.mjs next .
node scripts/cli.mjs self-check
node scripts/cli.mjs fixtures
node scripts/cli.mjs init --starter generic-project --target /tmp/ai-native-cli-test
```

Additional acceptance:

- CLI command registry is data-driven enough to survive manifest adoption without large rewrite.
- CLI does not reimplement checker or update rules that already live in underlying scripts.
- CLI prints the underlying command or equivalent operation when it performs writes.

Stop conditions:

- CLI diverges from script behavior.
- CLI hides important stop conditions from `workflow-next`.
- CLI performs writes without showing equivalent underlying command.

## Phase 0.37.0: Manifest Authoritative Asset Source

Goal Mode: `IMPLEMENT_TASK`

Subagent mode: `PLAN_THEN_BUILD`

Objective:

```text
Make manifest the single source of truth for required assets and copy rules.
```

Scope:

- Update `check-ai-workflow.mjs` to read target required paths from manifest.
- Update `workflow-next.mjs` to read workflow asset readiness from manifest.
- Update `check-dev-kit.mjs` to read source required files from manifest.
- Update `init-project.mjs` to read copy rules from manifest where safe.
- Keep migration reports for PR template and AGENTS governance behavior unchanged.

Acceptance criteria:

- Removing a manifest-required asset causes all relevant checkers to report the same missing path.
- Adding a manifest-required target asset does not require editing four scripts.
- `node scripts/check-dev-kit.mjs` passes.
- Generated-project smoke passes.

Stop conditions:

- Manifest-driven copy changes existing skip/update semantics.
- Existing governed/production/dirty protection is weakened.

## Phase 0.38.0: Init/Update Safety

Goal Mode: `IMPLEMENT_TASK`

Subagent mode: `PLAN_THEN_BUILD`

Objective:

```text
Upgrade init/update from direct copy into plan-first execution.
```

Scope:

- Add dry-run mode.
- Add write-plan mode.
- Add apply-plan mode.
- Add backup-dir support.
- Add machine-readable plan format.
- Add plan validation before writes.
- Enforce `workflow-next` gate before update on governed, production, or dirty projects.

Target commands:

```bash
ai-native init --target ../project --starter generic-project --dry-run
ai-native update --target ../project --dry-run
ai-native update --target ../project --write-plan update-plan.json
ai-native update --target ../project --apply-plan update-plan.json
ai-native update --target ../project --backup-dir .ai-native-backups/2026-06-26
```

Plan action types:

```text
CREATE
SKIP_EXISTING
UPDATE_MANAGED
NEEDS_HUMAN_APPROVAL
WRITE_MIGRATION_REPORT
BACKUP_THEN_UPDATE
FORBIDDEN
```

### Plan Integrity

Every write-plan must include:

- plan version
- dev-kit version
- manifest version
- target root
- target git branch and HEAD when available
- dirty-worktree summary
- hashes of files that will be modified
- hashes of files used for conflict or migration decisions
- action list
- expected preconditions

Example shape:

```json
{
  "planVersion": "1.0",
  "devKitVersion": "1.0.0",
  "manifestVersion": "1.0",
  "targetRoot": "../project",
  "targetFingerprint": {
    "gitBranch": "main",
    "gitHead": "abc123",
    "isDirty": true,
    "fileHashes": {
      "AGENTS.md": "sha256:...",
      ".github/pull_request_template.md": "sha256:..."
    }
  },
  "actions": []
}
```

`apply-plan` must fail if the target fingerprint changed after the plan was written. The user must create a new dry-run or write-plan for the current project state.

Acceptance criteria:

- Dry-run writes no files.
- Write-plan writes only the plan.
- Apply-plan executes only the approved plan.
- Apply-plan fails when target fingerprint no longer matches.
- Existing `AGENTS.md` and PR template still require explicit apply flags.
- Governed/production/dirty projects cannot be updated directly.

Stop conditions:

- Plan output cannot explain why a file is skipped or blocked.
- Backup behavior cannot be proven with fixture or smoke evidence.
- Fingerprint validation creates false confidence by checking only git HEAD and ignoring managed file hashes.

## Phase 0.39.0: Artifact Frontmatter + Schema

Goal Mode: `BASELINE_DECISION` then `IMPLEMENT_TASK`

Subagent mode: `PLAN_THEN_BUILD`

Objective:

```text
Add machine-readable artifact metadata while keeping Markdown readable for humans.
```

Scope:

- Add `schemas/artifacts/`.
- Add `scripts/lib/frontmatter.mjs`.
- Add schema frontmatter to newly generated artifacts.
- Update `new-workflow-item.mjs` to emit frontmatter.
- Update `check-workflow-artifacts.mjs` to prefer frontmatter.
- Add migration warning/report for old artifacts without frontmatter.

Initial schemas:

```text
request.schema.json
preflight.schema.json
spec.schema.json
eval.schema.json
task.schema.json
review-loop-report.schema.json
goal-card.schema.json
subagent-run-plan.schema.json
```

Hard rule:

```text
Markdown remains for humans.
Frontmatter becomes the primary machine-readable source for new artifacts.
```

### Legacy Artifact Policy

Compatibility must be time-boxed:

- `0.39.x`: old artifacts without frontmatter produce migration warnings by default and fail only in `--strict-schema`.
- `0.40.x`: dev-kit generated examples are migrated or covered by migration fixtures.
- `1.0.0`: new generated artifacts must include valid frontmatter; old artifacts require migration report before being treated as ready.
- `1.1.0`: strict schema may become default for dev-kit internal examples after migration evidence exists.

No silent compatibility is allowed for migrated dev-kit internal examples.

Acceptance criteria:

- New artifacts include valid frontmatter.
- Missing required frontmatter field fails in ready mode.
- Old artifacts produce migration warning/report, not silent success in strict schema mode.
- Existing 0.33 examples still pass until migrated or explicitly checked in legacy-compatible mode.
- Legacy mode has a documented end condition.

Stop conditions:

- Schema makes normal task authoring too heavy.
- Schema checker conflicts with existing Review Loop or Goal Mode semantics.
- Migration warning becomes permanent compatibility without an explicit review decision.

## Phase 0.40.0: Fixture Matrix Expansion

Goal Mode: `IMPLEMENT_TASK`

Subagent mode: `REVIEW_LOOP`

Objective:

```text
Prove checker behavior with a broader fixture matrix before refactoring checker internals.
```

Scope:

- Restructure fixtures into:
  - `test-fixtures/golden/`
  - `test-fixtures/bad/`
  - `test-fixtures/migrations/`
  - `test-fixtures/cli/`
  - `test-fixtures/init-update/`
  - `test-fixtures/output-quality/`
- Expand fixture index with case type and repair guidance.
- Add migration fixtures for manifest, init/update plan, and artifact frontmatter behavior when those features exist.
- Do not refactor checker internals in this phase except for fixture runner plumbing required to execute the matrix.

Acceptance criteria:

- Every checker has at least:
  - one golden pass case
  - one negative fail case
  - one migration/backward-compatibility case when relevant
- Fixture runner reports:
  - human summary
  - command
  - expected output
  - actual output
  - how to fix
- `node scripts/check-fixtures.mjs` remains stable.
- No checker behavior changes without matching fixture expectation changes.

Stop conditions:

- Fixture expansion requires changing production checker behavior.
- Fixture runner output becomes harder for humans to diagnose.

## Phase 0.40.1: Checker Library Refactor

Goal Mode: `IMPLEMENT_TASK`

Subagent mode: `REVIEW_LOOP`

Objective:

```text
Reduce duplicated checker plumbing after fixture coverage proves current behavior.
```

Scope:

- Add shared libraries:
  - `scripts/lib/args.mjs`
  - `scripts/lib/markdown.mjs`
  - `scripts/lib/check-result.mjs`
  - `scripts/lib/git.mjs`
  - `scripts/lib/project-signals.mjs`
  - `scripts/lib/frontmatter.mjs`
  - `scripts/lib/manifest.mjs`
- Refactor repeated `parseArgs`, `sectionBody`, and `walkFiles` where fixture coverage protects behavior.
- Preserve existing CLI output unless the change is explicitly reviewed and fixtures are updated.

Acceptance criteria:

- Fixture matrix passes before and after each refactor step.
- `node scripts/check-dev-kit.mjs` passes.
- No script has a newly copied `parseArgs`, `sectionBody`, or `walkFiles` helper when a shared helper exists.
- Refactor PR contains behavior-drift evidence.

Stop conditions:

- Refactor changes checker output without a fixture update and review note.
- Shared library hides script-specific behavior.
- A refactor requires changing unrelated productization phase behavior.

## Phase 0.41.0: Industrial Pack Maturity + License Boundary

Goal Mode: `BASELINE_DECISION` then `IMPLEMENT_TASK`

Subagent mode: `READ_ONLY_RESEARCH` for license review, `PLAN_THEN_BUILD` for docs and manifests

Objective:

```text
Clarify industrial pack maturity and commercial usage boundaries.
```

Scope:

- Add industrial pack lifecycle:
  - `draft`
  - `candidate`
  - `stable`
  - `deprecated`
  - `retired`
- Extend pack metadata with maturity evidence.
- Add pack maturity docs:
  - `maturity.md`
  - `evidence.md`
  - `dogfood.md`
  - `false-positive-log.md`
  - `owner.md`
  - `changelog.md`
- Add license docs:
  - `LICENSE-FAQ.md`
  - `LICENSE-COMMERCIAL.md`
  - `NOTICE.md`

Rules:

- `BL2_INDUSTRIAL` must not imply production-ready.
- Draft pack must not be marketed as stable standard.
- Commercial consulting/service delivery boundary must be explicit.

### License Review Boundary

License wording changes require human decision.

This plan does not provide legal advice.

Before `1.0.0`, either:

- license wording is reviewed by qualified legal counsel, or
- the repository owner explicitly accepts the legal wording risk and records that decision.

The license FAQ must distinguish:

- personal non-commercial use
- educational use
- internal company evaluation
- commercial product delivery
- commercial consulting/service delivery
- resale or paid redistribution
- copying generated assets into customer projects

Acceptance criteria:

- User can answer whether personal, educational, internal company, consulting, resale, and commercial delivery use are allowed.
- Each industrial pack has maturity stage and promotion criteria.
- No draft pack is treated as stable by strict checks.
- License risk decision is recorded before release.

Stop conditions:

- License text becomes inconsistent with `LICENSE.md`.
- Pack maturity creates false claims about real project validation.
- License FAQ appears to grant commercial rights that `LICENSE.md` does not grant.

## Phase 0.42.0: Docs IA + Migration Command

Goal Mode: `IMPLEMENT_TASK`

Subagent mode: `PLAN_THEN_BUILD`

Objective:

```text
Make docs easier to enter and add explicit migration path from 0.33 to 1.0.
```

Scope:

- Slim README into a 3-minute entry.
- Move full details into operator manual and references.
- Add migration docs and command.

Target docs:

```text
docs/operator-manual.md
docs/reference/scripts.md
docs/reference/artifacts.md
docs/reference/checkers.md
docs/reference/industrial-packs.md
docs/adoption-playbooks/new-project.md
docs/adoption-playbooks/existing-light-project.md
docs/adoption-playbooks/governed-project-read-only.md
docs/adoption-playbooks/production-project-adapter.md
docs/migrations/index.md
docs/migrations/0.33-to-1.0.md
docs/troubleshooting.md
docs/faq.md
```

Target command:

```bash
ai-native migrate --target ../project --from 0.33.0 --to 1.0.0 --dry-run
ai-native migrate --target ../project --from 0.33.0 --to 1.0.0 --write-plan migration-plan.json
```

Acceptance criteria:

- README answers in 3 minutes:
  - what this is
  - when to use it
  - which path to choose
  - how to run the smallest path
  - what not to do
- Migration doc lists:
  - added assets
  - removed assets
  - renamed assets
  - CI impact
  - AGENTS impact
  - PR template impact
  - human approval requirements
  - rollback

Stop conditions:

- README no longer links to complete references.
- Migration command can write without dry-run or plan.

## Phase 1.0.0: Release Evidence + Adoption Entry Criteria

Goal Mode: `HANDOFF_OR_REPORT`

Subagent mode: `REPORTING`

Objective:

```text
Publish 1.0 only when release evidence is complete.
```

Required release assets:

```text
releases/1.0.0/release-record.md
releases/1.0.0/self-check-report.md
releases/1.0.0/generated-project-smoke.md
releases/1.0.0/update-smoke.md
releases/1.0.0/migration-matrix.md
releases/1.0.0/known-limitations.md
releases/1.0.0/adoption-evidence.md
```

Required supporting templates before final release:

```text
templates/adoption-evidence-report.md
templates/productization-trial-report.md
```

Required checks:

```bash
ai-native self-check
ai-native fixtures
ai-native init --starter generic-project --target /tmp/ai-native-1-test
ai-native update --target /tmp/ai-native-1-test --dry-run
ai-native migrate --target /tmp/ai-native-1-test --from 0.33.0 --to 1.0.0 --dry-run
```

1.0 minimum entry criteria:

- dev-kit first-party CI is green
- CLI is stable
- manifest is authoritative
- init/update has dry-run, plan, apply-plan, and backup
- governed/production/dirty project protection is enforced by scripts
- new artifacts have frontmatter/schema support
- fixture matrix covers all checkers
- migration matrix exists
- README is slim and docs IA exists
- license/commercial boundary is clear
- industrial pack maturity lifecycle exists
- release evidence is recorded

### Release Quality Levels

`1.0 minimum` means productized CLI, manifest, checks, migration, docs, and release evidence are complete.

`10/10 evidence release` additionally requires real adoption evidence:

- 2-3 real project dogfood or adoption reports
- at least one governed existing project read-only adoption report
- at least one production-sensitive project adapter trial
- at least one industrial pack promoted from draft to candidate
- public changelog and migration matrix complete

Real adoption evidence is not a vague success note. Each adoption report must include:

- project type
- project risk level
- selected onboarding level
- selected BL level
- workflow assets used
- time cost
- false positives
- false negatives
- AI failure modes
- human decisions required
- whether the team would keep using it
- evidence refs for checks or review packets

1.0 may ship at the minimum productization level if real adoption evidence is incomplete, but release notes must clearly say that 10/10 real-project evidence has not yet been achieved.

## Program Review Loop

Every phase must produce a review loop.

Required review categories:

| Category | Meaning | Allowed action |
|---|---|---|
| `AUTO_FIX` | deterministic issue inside phase scope | Codex may repair, max 2 rounds |
| `NEEDS_HUMAN_DECISION` | scope, risk, license, architecture, migration, release, or policy decision | stop and route to human |
| `NEEDS_CLARIFICATION` | phase goal or acceptance criteria unclear | ask or write decision brief |
| `NO_ACTION` | reviewer note with reason | record only |

Program-level stop condition:

```text
If the same class of failure appears in two consecutive phases, pause productization and write a workflow improvement before continuing.
```

## Release Tracking Table

| Version | Phase | Goal Mode | Subagent Mode | Main Output | Release Gate |
|---|---|---|---|---|---|
| 0.34.0 | Baseline Freeze + Self CI | `IMPLEMENT_TASK` | `REVIEW_LOOP` | first-party CI and baseline evidence | CI green and smoke pass |
| 0.35.0 | Manifest Introduction | `BASELINE_DECISION` | `READ_ONLY_RESEARCH` | read-only manifest and drift check | manifest schema and drift check pass |
| 0.36.0 | CLI Front Door | `IMPLEMENT_TASK` | `PLAN_THEN_BUILD` | `ai-native` CLI | CLI smoke pass |
| 0.37.0 | Manifest Authoritative | `IMPLEMENT_TASK` | `PLAN_THEN_BUILD` | manifest-driven required assets | generated project smoke pass |
| 0.38.0 | Init/Update Safety | `IMPLEMENT_TASK` | `PLAN_THEN_BUILD` | dry-run, plan, backup | no-write dry-run proof |
| 0.39.0 | Artifact Schema | `BASELINE_DECISION` + `IMPLEMENT_TASK` | `PLAN_THEN_BUILD` | frontmatter and schemas | schema fixture pass |
| 0.40.0 | Fixture Matrix Expansion | `IMPLEMENT_TASK` | `REVIEW_LOOP` | golden, bad, migration fixture matrix | fixture suite pass |
| 0.40.1 | Checker Library Refactor | `IMPLEMENT_TASK` | `REVIEW_LOOP` | shared checker libraries | behavior-drift evidence and fixture suite pass |
| 0.41.0 | Industrial + License | `BASELINE_DECISION` + `IMPLEMENT_TASK` | `PLAN_THEN_BUILD` | maturity and license docs | maturity/license check pass |
| 0.42.0 | Docs IA + Migration | `IMPLEMENT_TASK` | `PLAN_THEN_BUILD` | docs split and migrate command | migration dry-run pass |
| 1.0.0 | Release Evidence | `HANDOFF_OR_REPORT` | `REPORTING` | release record | all release gates pass |

## Human Decisions Required

| Decision | Needed Before | Reason |
|---|---|---|
| Whether to publish package under `@coffeecoproject/ai-native-dev-kit` | 0.36.0 | package naming and distribution ownership |
| Whether manifest can become authoritative | 0.37.0 | affects all install/update/check flows |
| Whether old artifacts without frontmatter are warnings or failures | 0.39.0 | migration compatibility policy |
| License wording for company internal use and commercial project use | 0.41.0 | legal/commercial boundary |
| Whether license wording has legal review or owner-accepted legal risk | 0.41.0 | required before 1.0 release materials |
| Whether any industrial pack can move from draft to candidate | 1.0.0 or later | requires real project evidence |
| Whether 1.0 can be released without real adoption evidence | 1.0.0 | determines 9.5 product release vs 10/10 evidence release |

## First Implementation Recommendation

Start with:

```text
0.34.0 Baseline Freeze + Self CI
```

Do not start with CLI, authoritative manifest, or schema.

Reason:

- CI and baseline evidence reduce risk for all later hardcuts.
- Read-only manifest is the first productization step after CI freeze.
- Authoritative manifest and schema are core refactors and should only start after first-party CI is in place.
- The current `0.33.0` behavior is green and should be frozen before structural work.

## Final Acceptance

The 1.0 program is complete only when:

- all phases have final reports
- all phase review loops are closed or explicitly human-blocked
- all helper agents are closed or skipped
- release evidence is present
- migration path from `0.33.0` to `1.0.0` is documented
- generated-project smoke and update smoke pass
- user-facing README is simple enough for a first-time user
- operator/reference docs contain the full detail removed from README
