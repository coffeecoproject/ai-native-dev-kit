# 1.2.0 Engineering & Environment Baseline Guided Setup Plan

## Review Purpose

This document is the revised `1.2.0` planning proposal after external review.

The accepted review direction is:

```text
1.2.0 should be baseline guided setup + provable task references.
It should not become full environment governance industrialization.
```

Reviewers should focus on:

- whether the scope is complete but bounded
- whether `start` and `baseline` have clear separation
- whether Environment Baseline is first-class without becoming fake production documentation
- whether task-level baseline references are provable through artifacts
- whether BL0 / BL1 / BL2 behavior avoids overloading small projects

## Background

`1.0.0` productized the dev kit with CLI, manifest, generated-project assets, init/update safety, migration planning, checks, docs, and release evidence.

`1.1.0` added Guided Adoption Entry. Codex can now run a read-only first-hour command, classify a project, recommend an adoption path, and list the decisions a human must make before setup or execution.

The next gap is after project classification:

```text
Codex knows how the project should be adopted.
Now Codex needs to identify the project's engineering and environment rules.
Future tasks must prove they referenced those rules.
```

## Proposed Theme

```text
1.2.0 Engineering & Environment Baseline Guided Setup
```

Chinese working name:

```text
工程基线与环境基线引导式设置
```

Short product definition:

```text
Baseline recommendation first.
Plan-first writes only.
Task references must be checkable.
```

## Product Goal

Let Codex inspect a project and recommend project-specific engineering and environment baselines without requiring the human to choose lower-level scripts.

The human should only make judgment decisions:

- confirm project goal and risk level
- confirm platform profile
- confirm BL0 / BL1 / BL2 target
- accept or reject engineering decisions
- accept or reject environment and release assumptions
- approve production-sensitive, secret, release, migration, or permission boundaries

Codex should handle:

- reading project files and existing conventions
- drafting baseline recommendations
- marking missing decisions
- preparing write plans
- checking task artifact references
- routing unresolved decisions back to the human

## Key Boundary Decision

`1.2.0` must not attempt full environment industrialization.

It should not:

- infer or invent staging, production, rollback, monitoring, or release processes
- create or edit `.env` files
- record secret values
- modify CI/CD, deployment files, production config, AGENTS, or PR templates through baseline apply
- run complex source-code boundary scans
- enable BL2 or industrial packs by default

It should:

- add Environment Baseline as a first-class asset
- make baseline setup guided and read-only by default
- write baseline docs only through reviewed plans
- prove tasks declared and referenced touched baselines
- keep checks mode-aware and proportional to BL level

## Command Model

### First Entry

`start` remains the first command:

```bash
node scripts/cli.mjs start ../project
```

Purpose:

```text
Classify project adoption path.
```

### Baseline Entry

`baseline` is the second command:

```bash
node scripts/cli.mjs baseline ../project
```

Purpose:

```text
Recommend engineering and environment baseline setup.
```

Do not fold `baseline` into `start`. The two commands answer different questions:

| Command | Question answered |
|---|---|
| `start` | What kind of project is this, and how should it be adopted? |
| `baseline` | What engineering and environment rules does this project need? |

Optional future convenience may allow `start` to recommend running `baseline`, but `baseline` should remain a separate entry.

## Read-only Default

`baseline` must be read-only by default.

It must not write:

- `docs/engineering-baseline.md`
- `docs/environment-baseline.md`
- `AGENTS.md`
- CI files
- PR templates
- `.env`
- secrets
- deployment config
- production config
- industrial-pack selections

Default output:

- baseline recommendation
- missing decisions
- risk notes
- safe next actions
- suggested write-plan command

Required invariant:

```text
Can AI write now: No
```

## Plan-first Write Flow

Writing baseline files requires a reviewed plan:

```bash
node scripts/baseline-project.mjs ../project --write-plan baseline-plan.json
node scripts/baseline-project.mjs --apply-plan baseline-plan.json
```

First version apply scope must be limited to:

```text
docs/engineering-baseline.md
docs/environment-baseline.md
baseline-recommendations/
baseline-gap-reports/
```

It must not write:

```text
.env
CI
deployment files
AGENTS.md
PR template
industrial packs
production config
secret files
```

## Baseline Layers

### Engineering Baseline

Purpose:

```text
Define how the project should be coded and evolved.
```

Covered areas:

- repository structure
- frontend module and component structure
- backend module structure
- DTO / schema / domain boundary
- API contract source of truth
- enum vs string vs lookup vs state-machine decision
- database schema and migration rules
- permission model rules
- dependency addition rules
- generated type rules
- cross-module state rules
- error handling
- test requirements
- code review expectations

### Environment Baseline

Purpose:

```text
Define how the project runs, tests, releases, observes, and rolls back.
```

Covered areas:

- local development setup
- runtime versions
- package manager and lockfile
- environment variable inventory
- secret boundary
- external services
- test environment
- preview / staging / production status
- CI/CD status
- build and deploy commands
- release process
- rollback process
- logs, monitoring, alerts, and incident evidence

Important rule:

```text
Environment Baseline records real project facts and pending decisions.
It must not invent environments or operational processes.
```

### Platform Baseline

Purpose:

```text
Apply platform-specific expectations.
```

Platform-specific topics should live under profiles, not as duplicated full templates.

Recommended structure:

```text
templates/environment-baseline.md
profiles/web-app/environment-topics.md
profiles/wechat-miniprogram/environment-topics.md
profiles/ios-app/environment-topics.md
profiles/android-app/environment-topics.md
profiles/backend-api/environment-topics.md
profiles/internal-admin/environment-topics.md
```

### Industrial Baseline

Purpose:

```text
Apply BL2-level evidence and selected industrial packs only when explicitly approved.
```

Industrial baseline remains opt-in and selected-only.

## Environment Baseline State Model

Every environment item should use one of three states:

```text
CONFIRMED
PENDING_CONFIRMATION
NOT_APPLICABLE
```

Rules:

- If evidence exists, mark `CONFIRMED` and cite the source.
- If evidence is missing or unclear, mark `PENDING_CONFIRMATION`.
- If the item truly does not apply, mark `NOT_APPLICABLE`.
- Do not leave important fields blank.
- Do not guess staging, production, rollback, logs, monitoring, or release ownership.

Example:

| Area | Status | Evidence | Owner | Notes |
|---|---|---|---|---|
| Local dev command | CONFIRMED | `package.json` scripts | dev | `npm run dev` |
| Staging environment | PENDING_CONFIRMATION | no evidence found | human | Codex must not assume |
| Production rollback | PENDING_CONFIRMATION | no rollback doc found | release owner | decision needed |
| Secret values | NOT_APPLICABLE | values must not be recorded | human | variable names only |

## Secret Boundary

Environment Baseline must record secret boundaries and variable inventory, not secret values.

Allowed:

- variable names
- environment where variable is used
- owner
- required or optional
- whether it is secret
- source document path
- status

Forbidden:

- token values
- passwords
- private keys
- service account JSON
- production credentials
- connection strings with embedded credentials

Required wording in the template:

```text
Secret values must never be written into this file.
```

`check-environment-baseline.mjs` first version should detect obvious secret misuse only:

- private key markers
- GitHub token patterns
- common cloud key patterns
- `password=`
- `secret=`
- `api_key=`
- connection strings with credentials

This is not a full secret scanner.

## Environment Baseline Template

Required sections:

```text
# Environment Baseline

## Human Summary

## Status
Baseline status: DRAFT / PARTIAL / CONFIRMED
Human decision status: PENDING / APPROVED / REJECTED
Owner:
Last reviewed:

## Scope
Applies to:
Does not apply to:

## Local Development
Runtime:
Package manager:
Install command:
Dev command:
Local test command:
Known local dependencies:

## Runtime Versions
| Runtime | Version | Source | Status |
|---|---|---|---|

## Package Manager And Lockfile
Package manager:
Lockfile:
Policy:
Codex may change dependencies: Yes / No / Human approval required

## Environment Variables
| Name | Required? | Environment | Owner | Secret? | Source | Status |
|---|---|---|---|---|---|---|

Important rule:
Record variable names and ownership only. Never record secret values.

## Secret Boundary
Secret storage:
Who can access:
Codex must not:
Rotation / incident owner:

## External Services
| Service | Used for | Environment | Owner | Status |
|---|---|---|---|---|

## Test Environment
Test command:
Test data policy:
Mock / real service policy:
CI test command:

## Preview / Staging / Production
| Environment | Exists? | URL / Ref | Owner | Deploy command | Rollback path | Status |
|---|---|---|---|---|---|---|

## CI / CD
CI system:
Required checks:
Build command:
Deploy command:
Codex may modify CI: Yes / No / Human approval required

## Release Process
Release owner:
Release checklist:
Approval required:
Evidence required:

## Rollback Process
Rollback owner:
Rollback command or process:
Rollback evidence:
Codex must stop when:

## Logs / Monitoring / Alerts
Logs:
Metrics:
Alerts:
Incident owner:
Evidence refs:

## Open Environment Decisions
| Decision | Options | Recommended | Owner | Status |
|---|---|---|---|---|
```

The template must allow `NOT_APPLICABLE`, especially for BL0 and small projects.

## Proposed Required Assets

### Must Include

```text
core/environment-baseline.md
core/baseline-enforcement.md
templates/environment-baseline.md
templates/baseline-recommendation-report.md
templates/baseline-gap-report.md
checklists/environment-baseline-review.md
checklists/baseline-enforcement-review.md
prompts/environment-baseline-agent.md
prompts/baseline-setup-agent.md
scripts/baseline-project.mjs
scripts/check-environment-baseline.mjs
scripts/check-baseline-enforcement.mjs
baseline-recommendations/
baseline-gap-reports/
```

### Docs

Use one doc first:

```text
docs/baseline-setup.md
```

Do not add both `docs/environment-baseline.md` and `docs/baseline-setup.md` unless implementation proves both are needed.

### Reports

`baseline-recommendation-report` is the default report.

`baseline-gap-report` should not be generated every time. It is only for detailed gap tracking when the baseline gaps need a durable follow-up artifact.

## Baseline Recommendation Report

The report should include:

- project classification
- detected platform profile candidates
- recommended BL level
- engineering baseline status
- environment baseline status
- gap summary
- pending human decisions
- high-risk areas
- safe next actions
- actions AI must not take yet
- suggested write-plan command

Required invariant:

```text
Can AI write now: No
```

## `check-environment-baseline.mjs`

First version should check structure and risk, not source code.

Checks:

- `docs/environment-baseline.md` exists when required by BL level
- required sections exist
- required sections are not only placeholders
- pending decisions are visible
- `Open Environment Decisions` exists
- secret boundary exists
- environment variable inventory exists
- local dev command is declared or marked `NOT_APPLICABLE`
- test command is declared or marked `NOT_APPLICABLE`
- CI/CD status is declared
- release and rollback status are declared
- obvious secret values are not present

Modes:

```text
default/advisory:
  missing docs -> report PENDING, not fail
  pending decisions -> report, not fail
  obvious secret values -> fail

--strict:
  missing required sections -> fail
  pending decisions -> fail
  obvious secret values -> fail
```

Default must not be strict.

## `check-baseline-enforcement.mjs`

This is the key `1.2.0` feature.

It proves baselines are not just documents.

First version should check artifacts only. It should not attempt deep source-code scanning.

### Task Card Fields

Task cards should include:

```text
Engineering Baseline touched: Yes / No
Environment Baseline touched: Yes / No
Baseline refs:
Baseline decisions introduced:
```

If a task touches any of these areas, it should reference the baseline:

- database schema
- API contract
- permission model
- migration
- dependency
- folder structure
- build command
- CI
- environment variables
- deployment
- production config
- release process
- rollback

### Review Packet Fields

Review Packet already has Engineering Baseline fields. `1.2.0` should add:

```text
Environment baseline checked:
Environment baseline ref:
Environment baseline gaps:
```

### Review Loop Fields

Review Loop should check:

- Did implementation follow Engineering Baseline?
- Did implementation follow Environment Baseline?
- Did it add a baseline decision without updating baseline?
- Did it touch env, release, secret, or production config without approval?

### First-version Limits

`check-baseline-enforcement.mjs` should check declarations, refs, and human-decision routing.

It should not:

- parse all source imports
- detect architecture violations from code
- scan every environment variable in source
- enforce magic-string rules
- infer production behavior from code

## BL0 / BL1 / BL2 Behavior

| Level | Engineering Baseline | Environment Baseline | Enforcement |
|---|---|---|---|
| BL0 | advisory | optional / advisory | no blocking; report gaps |
| BL1 | required docs exist | required docs exist; `NOT_APPLICABLE` and `PENDING_CONFIRMATION` allowed | pending visible; task refs warn by default |
| BL2 | required and confirmed or exceptions recorded | required and confirmed or exceptions recorded | task refs, Review Loop, and evidence required |

Specific decisions:

- BL0 may lack `docs/environment-baseline.md` unless a task touches environment, CI, deploy, secrets, release, or rollback.
- BL1 should require `docs/environment-baseline.md`, but not require complete production/staging/rollback details.
- BL2 should require confirmed environment baseline decisions, explicit exceptions, evidence, Review Loop, and CI checks.

## Task Reference Failure Policy

Recommended behavior:

| Context | Missing baseline refs |
|---|---|
| BL0 | no check or warning |
| BL1 ready mode | warning |
| BL1 implementation mode | fail only for obvious touched areas |
| BL2 ready mode | fail unless `NOT_APPLICABLE` or exception is recorded |
| BL2 implementation mode | fail |
| L3 task | fail |

This avoids forcing small projects into heavy process while still protecting high-risk projects.

## CI Integration

Default CI can run the baseline checks, but they should be mode-aware:

```bash
node scripts/check-engineering-baseline.mjs .
node scripts/check-environment-baseline.mjs .
node scripts/check-baseline-enforcement.mjs . --mode ready
```

Default behavior:

- BL0: warning/advisory
- BL1: missing docs fail, pending decisions do not fail
- BL2: missing refs, missing decisions, missing Review Loop, and missing evidence fail

Do not make `check-environment-baseline.mjs` strict by default.

## Platform-specific Topics

Do not create full duplicated environment templates for every platform in `1.2.0`.

Use one shared template plus platform topic lists.

### Web

- package manager
- Node version
- route structure
- state management
- API client boundary
- auth/session rules
- form validation rules
- E2E command
- build and deployment command
- preview/staging/production status
- rollback status

### WeChat Mini Program

- appid and project config
- WeChat Developer Tools version
- CloudBase environment
- cloud function deployment
- privacy and permission declarations
- payment boundary
- experience version / audit / production release
- rollback or hotfix status

### iOS

- Xcode version
- scheme
- signing boundary
- simulator target
- permissions
- local build/test command
- TestFlight or release process
- crash/log evidence

### Android

- Gradle and JDK version
- flavor/build variant
- signing boundary
- permissions
- emulator/device target
- release channel
- rollback or phased rollout status

### Backend API

- runtime version
- database and migration command
- API contract source
- auth/permission boundary
- logs/metrics/alerts
- deployment environment
- rollback and backup status

### Internal Admin

- RBAC
- audit trail
- table/list conventions
- form validation
- import/export rules
- sensitive operations
- data correction workflow

## Examples

Keep four scenarios, but do not make every one a full task flow.

```text
examples/1.2-baseline-guided-setup/new-web-project/
examples/1.2-baseline-guided-setup/existing-light-project/
examples/1.2-baseline-guided-setup/governed-readonly-project/
examples/1.2-baseline-guided-setup/production-sensitive-project/
```

Expected coverage:

| Example | Required coverage |
|---|---|
| new-web-project | baseline recommendation, baseline docs, first task baseline refs |
| existing-light-project | current scripts/config inspection and pending decisions |
| governed-readonly-project | read-only mapping and no writes |
| production-sensitive-project | environment, release, rollback, secret boundary; no apply |

## Release Evidence

If no real project is used, release wording must say:

```text
simulated baseline guided setup release
```

Do not claim full real-project validation.

Minimum evidence:

- baseline command smoke
- generated-project smoke
- four guided setup examples
- bad fixtures for missing refs, pending BL2 decisions, and obvious secret misuse
- self-check report
- known limitations

## Implementation Phases

### Phase A: Planning Finalization

- Revise this plan from review feedback.
- Confirm scope and non-goals.
- Keep 1.2 bounded to guided setup and artifact-level enforcement.

### Phase B: Environment Baseline Core

- Add `core/environment-baseline.md`.
- Add `templates/environment-baseline.md`.
- Add `checklists/environment-baseline-review.md`.
- Add `prompts/environment-baseline-agent.md`.
- Add `scripts/check-environment-baseline.mjs`.

### Phase C: Guided Baseline Entry

- Add `scripts/baseline-project.mjs`.
- Add `node scripts/cli.mjs baseline <project>`.
- Add baseline recommendation report.
- Keep read-only default.
- Add write-plan/apply-plan with limited write scope.

### Phase D: Artifact-level Enforcement

- Add baseline fields to task, Review Packet, and Review Loop templates.
- Add `scripts/check-baseline-enforcement.mjs`.
- Check declarations, refs, BL level, and human-decision routing.

### Phase E: Examples, Fixtures, Evidence

- Add examples.
- Add bad fixtures.
- Add generated-project smoke.
- Update manifest and workflow version assets.
- Update self-check.
- Add release evidence.

## Acceptance Criteria

`1.2.0` is complete only if:

1. `node scripts/cli.mjs baseline <project>` exists and is read-only by default.
2. `baseline` is separate from `start`, and `start` can recommend it.
3. Environment Baseline exists as a first-class layer.
4. Engineering Baseline guided setup is connected to baseline recommendation.
5. Baseline Recommendation Report exists and includes `Can AI write now: No`.
6. Baseline plan flow exists and writes only approved baseline docs/reports.
7. Generated projects include environment baseline assets and checker scripts.
8. Task Card, Review Packet, and Review Loop include engineering/environment baseline refs.
9. `check-environment-baseline.mjs` detects missing docs, pending decisions, placeholders, and obvious secret misuse.
10. `check-baseline-enforcement.mjs` verifies task-level baseline references and human-decision routing.
11. BL0 / BL1 / BL2 behavior is distinct.
12. CI checks are advisory or mode-aware by default, not strict for every project.
13. Industrial packs remain opt-in and selected-only.
14. Examples cover new, existing-light, governed-readonly, and production-sensitive scenarios.
15. Release evidence states whether evidence is simulated or real.
16. Dev-kit self-check passes.

## Answered Review Questions

1. `baseline` should be a separate CLI command, recommended by `start`.
2. BL1 should require `docs/environment-baseline.md`, but allow `NOT_APPLICABLE` and `PENDING_CONFIRMATION`.
3. BL0 may omit environment baseline unless the task touches env/deploy/secrets/CI/release/rollback.
4. Missing baseline refs should be warning or fail depending on BL level, task mode, and L level.
5. CI should run baseline checks by default only in advisory/mode-aware mode.
6. Platform-specific environment topics should live under profiles; one shared template should live under templates.
7. Without real project adoption, `1.2.0` should claim simulated guided setup evidence only.

## Recommended Review Verdict

Accept `1.2.0` with the revised boundary.

The release should focus on:

```text
Guided baseline recommendation.
Environment Baseline as a first-class asset.
Artifact-level proof that tasks referenced baselines.
```

The release should not focus on:

```text
Full source-code governance.
Automatic environment discovery.
Automatic CI/deploy edits.
Production/staging inference.
Default BL2.
```

The main risk:

```text
If implemented too strictly, small projects will feel heavy.
```

The mitigation:

```text
BL0 advisory.
BL1 docs plus visible pending decisions.
BL2 strict evidence, Review Loop, and CI.
```
