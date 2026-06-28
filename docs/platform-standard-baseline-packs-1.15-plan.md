# Platform Standard Baseline Packs 1.15 Plan

## Human Summary

1.15.0 should complete the first usable platform standard baseline layer.

1.14.0 introduced the Standard Baseline Pack Registry. 1.14.1 hardened that mechanism with stricter pack metadata, selected profile validation, clearer resolver boundaries, and release evidence.

1.15.0 should now answer a more practical user question:

```text
Given my project platform and expected rigor level, which ordinary engineering baselines should Codex recommend before any industrial overlay is considered?
```

In plain terms:

```text
1.14.x = standard baseline packs can exist safely.
1.15.0 = common platforms get bounded standard baseline packs.
```

The expected user experience is still simple:

```text
User chooses or confirms platform and rigor.
Codex recommends ordinary baseline packs.
Codex separates optional backend, release, and industrial risk.
Human confirms decisions.
Writes still require the correct workflow path.
```

## Current State After 1.14.1

Current assets include:

- `standard-baseline-packs/`
- `web-runtime-standard`
- `backend-api-standard`
- `release-rollback-standard`
- `standard-baseline-packs/schema/standard-pack.schema.json`
- `templates/standard-baseline-selection-report.md`
- `checklists/standard-baseline-selection-review.md`
- `prompts/standard-baseline-router-agent.md`
- `scripts/resolve-standard-baseline.mjs`
- `scripts/check-standard-baseline-pack.mjs`
- `scripts/check-standard-baseline-selection.mjs`
- CLI entries:
  - `standard-baseline`
  - `standard-baseline-selection`
  - `baseline-packs`

1.14.1 also added these important boundaries:

- standard pack metadata fields are explicit
- custom metadata must go under `extensions`
- selected profile ids must resolve to `profiles/` or `.ai-native/profiles/`
- public documentation URLs have a narrow allowlist
- `scripts/resolve-baseline-packs.mjs` is a lower-level industrial resolver, not the preferred human entry

## Problem

The mechanism is now safer, but the content layer is still incomplete.

Today Codex can mainly reason about:

- Web runtime
- Backend API
- Release / rollback

Common project shapes are still under-covered:

- WeChat Mini Program
- iOS app
- Android app
- Internal admin / management system
- Environment baseline setup

This can cause Codex to:

- under-recommend ordinary platform baselines
- over-recommend BL2 or industrial packs
- force backend assumptions onto frontend or Mini Program projects
- treat release / rollback as mandatory when it is only conditional
- ask users too many technical questions
- confuse standard baseline confirmation with permission to write files

## Core Decision

1.15.0 should add platform standard packs, not industrial packs.

The model stays:

```text
BL0_LIGHTWEIGHT
  -> minimum structure and basic checks

BL1_STANDARD
  -> ordinary standard baseline packs

BL2_INDUSTRIAL
  -> selected standard packs plus selected industrial overlays
```

Plain meaning:

```text
BL0 = keep the project from becoming chaotic.
BL1 = make the project structurally usable and maintainable.
BL2 = add stronger controls only when risk or production sensitivity requires them.
```

## Scope

1.15.0 should add:

- platform standard baseline matrix
- new draft standard pack directories
- resolver routing for platform standard packs
- selection report support for platform decisions
- checker rules that prevent over-selection and approval overclaims
- generated-project and starter guidance updates
- examples and bad fixtures
- release evidence and known limitations

## Non-Goals

1.15.0 must not:

- create another governance layer
- make BL2 default
- make industrial packs active by default
- move industrial packs into `standard-baseline-packs/`
- promote draft packs to stable
- claim production certification or real-project production validation
- approve target-project writes
- approve implementation
- approve release or production
- approve security, privacy, legal, compliance, payment, tax, finance, HR, or migration decisions
- require every frontend project to have a backend
- require every Mini Program to have a backend
- require every project to have release / rollback automation
- replace existing project governance files automatically
- create a business app template or code generator

## Authority Boundary

This is the most important 1.15 rule:

```text
Standard baseline recommendation != human approval.
Human baseline confirmation != implementation approval.
Implementation approval != release approval.
Release review recommendation != production approval.
```

Even after the human confirms a standard baseline selection:

- Codex still cannot write target project files unless the project workflow permits it
- existing governed projects still require read-only mapping first
- write operations still need plan-first or reviewed apply flow where applicable
- standard packs remain advisory until selected and evidenced

## Standard Pack Layer

Standard packs are ordinary engineering guardrails.

They may define:

- project structure expectations
- runtime quality expectations
- platform build expectations
- environment fact recording
- API interaction expectations
- evidence templates
- review checklists
- known limits

They may not define:

- production approval
- release approval
- legal approval
- security approval
- privacy approval
- compliance approval
- payment approval
- migration approval
- target-project write approval

Every standard pack must keep the 1.14 structure:

```text
standard-baseline-packs/<pack>/
  pack.json
  pack.md
  baselines/
  checklists/
  templates/
  evidence.md
  maturity.md
  owner.md
  changelog.md
```

Every `pack.json` must keep:

```json
{
  "baselineLayer": "standard",
  "activeByDefault": false,
  "canBeRecommendedByAI": true,
  "selectionRequiresHumanDecision": true,
  "canAuthorizeWrites": false,
  "canApproveImplementation": false,
  "canApproveRelease": false,
  "canApproveComplianceSecurityPrivacy": false,
  "requiresEvidenceForConfirmed": true
}
```

`defaultForBL` remains forbidden.

`recommendedForBL` remains advisory routing metadata. It must not mean automatic activation.

## Industrial Overlay Layer

Industrial packs remain separate.

They are considered only when:

- the project is production-sensitive
- the project handles payment or value transfer
- the project handles customer, sensitive, or regulated data
- the change touches auth, permission, release, rollback, infra, migration, production config, or destructive data operations
- the human explicitly selects BL2 or industrial overlays

Industrial packs remain:

- selected-only
- evidence-based
- human-confirmed
- inactive unless approved

## Proposed Standard Packs

Keep the 1.14 packs:

```text
web-runtime-standard
backend-api-standard
release-rollback-standard
```

Add these draft standard packs in 1.15.0:

```text
miniprogram-runtime-standard
ios-app-standard
android-app-standard
internal-admin-standard
environment-standard
```

These are standard packs, not industrial packs.

They should be useful enough for real project guidance, but bounded enough that they do not pretend to be production certification.

## Deferred Packs

Do not add these in 1.15.0 unless review explicitly changes the scope:

```text
auth-permission-standard
data-storage-standard
test-quality-standard
observability-standard
dependency-supply-chain-standard
accessibility-standard
design-system-standard
desktop-app-standard
```

Reason:

These can easily become broad, risk-heavy, or overlap with industrial overlays. 1.15.0 should first stabilize the platform standard baseline layer.

## BL-Level Behavior

### BL0_LIGHTWEIGHT

BL0 may receive minimal standard guidance, but should not be overloaded.

Expected behavior:

- recommend only essential platform structure when clearly known
- keep environment facts minimal or pending
- do not force release / rollback
- do not force backend
- do not force industrial overlays

### BL1_STANDARD

BL1 is the main target for 1.15.0.

Expected behavior:

- recommend platform runtime standard pack
- recommend `environment-standard` for non-trivial projects
- recommend `internal-admin-standard` when internal admin is selected or strongly inferred
- keep backend and release packs conditional unless scope evidence exists

### BL2_INDUSTRIAL

BL2 includes standard packs first, then optional industrial overlays.

Expected behavior:

- keep standard pack selection visible
- show industrial overlays separately
- require human confirmation and evidence for overlays
- do not make overlays active automatically

## Platform Standard Matrix

### Web App

Recommended standard packs:

```text
web-runtime-standard
environment-standard
```

Conditional standard packs:

```text
backend-api-standard
internal-admin-standard
release-rollback-standard
```

Rules:

- Use `backend-api-standard` only when API, server-side code, database schema, migrations, or API contract work is in scope.
- Use `internal-admin-standard` only when the product is an admin, CRM, ERP, management dashboard, approval system, finance console, HR console, or internal operations system.
- Use `release-rollback-standard` only when staging, production, release handoff, deployment, rollback, or launch-readiness is in scope.

### Backend API

Recommended standard packs:

```text
backend-api-standard
environment-standard
```

Conditional standard packs:

```text
release-rollback-standard
```

Rules:

- Upgrade to industrial overlays only when backend work touches high-risk data, auth, permission, destructive migrations, production data, payment, privacy, compliance, or irreversible operations.

### WeChat Mini Program

Recommended standard packs:

```text
miniprogram-runtime-standard
environment-standard
```

Conditional standard packs:

```text
backend-api-standard
release-rollback-standard
```

Important rule:

```text
Mini Program backend is common, but optional.
```

Codex should ask or infer whether the Mini Program has:

- cloud functions
- CloudBase
- custom backend API
- login / session API
- database reads or writes
- admin backend
- deployment or release flow

If none is confirmed, do not force `backend-api-standard`.

Upgrade to industrial overlays only when the project touches payment, auth / permission, customer data, cloud security, production release, or privacy-sensitive surfaces.

### iOS App

Recommended standard packs:

```text
ios-app-standard
environment-standard
```

Conditional standard packs:

```text
backend-api-standard
release-rollback-standard
```

`ios-app-standard` should cover:

- app structure
- navigation baseline
- state ownership baseline
- build and simulator verification expectations
- app configuration boundary
- platform capability boundary

It must not claim:

- App Store approval
- production readiness
- security or privacy approval
- release approval

### Android App

Recommended standard packs:

```text
android-app-standard
environment-standard
```

Conditional standard packs:

```text
backend-api-standard
release-rollback-standard
```

`android-app-standard` should cover:

- app module structure
- navigation baseline
- state ownership baseline
- Gradle / build baseline
- emulator and device verification expectations
- app configuration boundary
- platform capability boundary

It must not claim:

- Play Store approval
- production readiness
- security or privacy approval
- release approval

### Internal Admin / Management System

Recommended standard packs:

```text
internal-admin-standard
web-runtime-standard
environment-standard
```

Conditional standard packs:

```text
backend-api-standard
release-rollback-standard
```

`internal-admin-standard` should cover:

- role-aware UI boundaries
- dense operational layouts
- list / detail / form / approval flow expectations
- table, filter, search, and pagination behavior
- audit-friendly actions
- data export caution
- empty, loading, error, and permission-denied states

It must not approve:

- permissions
- financial correctness
- HR policy
- tax compliance
- legal compliance
- production release
- sensitive data export

### Environment

Recommended standard pack:

```text
environment-standard
```

Use for:

- BL1 and BL2 non-trivial projects
- projects with known runtime, build, CI, deployment, environment variable, or platform setup requirements

For BL0:

- keep environment facts minimal
- mark unknowns as `PENDING_CONFIRMATION`
- do not require full environment governance unless the project scope needs it

`environment-standard` should cover:

- local environment setup
- package manager / runtime version recording
- environment variable inventory without secret values
- build command documentation
- test command documentation
- CI command inventory when present
- deployment environment facts as `PENDING_CONFIRMATION` unless proven

It must not:

- create or edit `.env`
- store secrets
- invent production facts
- change deployment config
- claim release readiness
- approve CI / CD changes

## New Project Flow

For a new project, Codex should:

```text
1. Understand the user's product goal.
2. Infer or ask for platform when unclear.
3. Recommend BL0 / BL1 / BL2.
4. Recommend standard packs from the platform matrix.
5. Mark conditional packs separately.
6. Generate a Standard Baseline Selection Report.
7. Ask the human to confirm the proposed baseline path.
8. Only after confirmation, proceed through the allowed init / write-plan / apply-plan path.
```

The user-facing decision should look like:

```text
Recommended path: BL1 standard project.
Platform: WeChat Mini Program.
Recommended packs: miniprogram-runtime-standard, environment-standard.
Optional if backend exists: backend-api-standard.
Optional if release is in scope: release-rollback-standard.
Industrial overlays: not enabled.
Can AI configure this baseline now: No, waiting for your confirmation.
```

## Existing Project Flow

For an existing project, Codex should not assume it can write.

Flow:

```text
read-only scan
  -> classify project
  -> map existing governance to standard packs
  -> produce standard baseline gap report
  -> show human decision summary
  -> wait for confirmation
  -> controlled apply only if allowed
```

Existing projects should be treated as one of:

- new or empty project
- existing light project
- existing governed project
- production-sensitive project
- dirty worktree project

For governed, production-sensitive, or dirty projects:

```text
ADOPTION_MODE: READ_ONLY
CAN_WRITE_WORKFLOW_ASSETS: no
NEXT_ACTION: adoption assessment / governance map / baseline gap report
```

Rules:

- no full overwrite
- no AGENTS overwrite
- no CI overwrite
- no PR template overwrite
- no full `.ai-native` copy unless project state allows it and the human confirms it
- use mapping and gap-review language, not replacement language

## Resolver Updates

Update `scripts/resolve-standard-baseline.mjs` to support the new platform matrix.

Inputs:

- selected profiles
- BL level
- baseline-selection docs
- project signals
- environment signals
- backend / API signals
- internal-admin signals
- Mini Program / iOS / Android signals
- release / production signals

Outputs:

- recommended standard packs
- conditional standard packs
- optional industrial overlays
- not selected standard packs
- pending decisions
- safe next actions
- forbidden actions

Resolver must keep:

```text
CAN_AI_ENABLE_PACKS_NOW: No
CAN_AI_WRITE_TARGET_FILES_NOW: No
```

unless a separate reviewed implementation path explicitly allows writes.

## CLI Updates

Keep existing commands:

```bash
node scripts/cli.mjs standard-baseline <project>
node scripts/cli.mjs standard-baseline-selection <project>
node scripts/cli.mjs baseline-packs <project>
```

Expected behavior:

- `standard-baseline` shows platform standard pack recommendations.
- `standard-baseline-selection` checks recorded selection reports.
- `baseline-packs` remains the umbrella output:
  - standard packs first
  - industrial overlays second
  - industrial overlays inactive unless human-approved

## Selection Report Updates

Update `templates/standard-baseline-selection-report.md` to support:

- platform classification
- project mode: new / existing / governed / production-sensitive / dirty
- selected profiles
- BL level
- recommended standard packs
- conditional standard packs
- optional industrial overlays
- not selected packs
- evidence required
- human decision
- boundary

It must include:

```text
This report authorizes target-project writes: No
This report approves implementation: No
This report approves release or production: No
This report approves compliance/security/privacy: No
This report proves real project evidence exists: No
```

It must also include:

```text
Human approval of this standard baseline selection does not approve a specific implementation task.
```

## Checker Updates

### `check-standard-baseline-pack.mjs`

Add or confirm coverage for:

- required platform pack metadata
- standard pack ids ending with `-standard`
- no `defaultForBL`
- `activeByDefault: false`
- no production-certification wording
- no project-specific secrets or private URLs
- no industrial overlay fields mixed into standard pack metadata
- required baselines / checklists / templates exist
- platform standard packs remain `draft`

### `check-standard-baseline-selection.mjs`

Add or confirm coverage for:

- platform-specific recommendations match resolver
- backend is optional for frontend / Mini Program projects unless evidence exists
- release / rollback is conditional unless release scope exists
- industrial overlays are not listed as standard recommendations
- standard packs are not listed as industrial overlays
- every selected profile is known
- every selected pack is known
- no all-pack default
- no BL2 default
- no target write authorization
- no implementation approval
- no release approval
- no compliance / security / privacy approval
- no draft-to-stable claim
- existing governed projects do not use overwrite language

## Documentation Updates

Add:

```text
docs/platform-standard-baseline-packs-1.15-plan.md
docs/platform-standard-baseline-packs.md
docs/reference/platform-standard-baseline-matrix.md
```

Update:

```text
README.md
README.zh-CN.md
docs/standard-baseline-pack-registry.md
docs/baseline-pack-system.md
docs/codex-usage.md
docs/operator-manual.md
docs/quickstart.md
docs/reference/scripts.md
docs/reference/checkers.md
docs/reference/artifacts.md
```

README message:

```text
The dev kit first identifies the project platform, then recommends ordinary standard baselines. Industrial baselines are only added when risk requires them and the human confirms.
```

## Starter / Platform Adapter Updates

Update:

```text
platforms/codex/AGENTS.template.md
platforms/claude/instructions.md
platforms/cursor/rules-template.md
platforms/github/ci-ai-workflow.yml
starters/generic-project/AGENTS.md
starters/codex-web-app/AGENTS.md
starters/codex-ios-app/AGENTS.md
starters/codex-android-app/AGENTS.md
```

Rules:

- standard baseline pack recommendation is allowed
- standard baseline pack activation still requires human decision
- standard baseline selection does not approve implementation
- industrial overlays remain optional and selected-only
- existing governed projects use adapter / mapping / gap-review language

## Manifest / Workflow Version Updates

Update:

```text
dev-kit-manifest.json
templates/workflow-version.json
templates/version-record.md
package.json
VERSION.md
```

Manifest must include:

- new standard pack files
- new docs
- new examples
- new fixtures
- updated scripts
- copied target assets
- workflow version assets
- workflow readiness assets

## Examples

Add:

```text
examples/1.15-platform-standard-baselines/
```

Required examples:

```text
new-miniprogram-basic
new-miniprogram-with-backend
new-internal-admin-web
new-ios-app
new-android-app
existing-governed-project-gap-review
```

Depth rule:

- Mini Program basic, Mini Program with backend, and internal admin should be full examples.
- iOS and Android can be lighter examples if implementation time needs to stay bounded, but both must still prove resolver routing and boundary language.
- Existing governed project example must stay read-only and use mapping / gap language.

Each example should show:

- project profile
- baseline selection
- standard baseline selection report
- expected resolver output or resolver-aligned recommendation
- boundary statements

## Bad Fixtures

Add fixtures for:

```text
bad-platform-standard-selects-all
bad-platform-standard-backend-forced
bad-platform-standard-bl2-default
bad-platform-standard-industrial-as-standard
bad-platform-standard-write-approved
bad-platform-standard-release-approved
bad-platform-standard-draft-stable
bad-platform-standard-existing-project-overwrite
bad-platform-standard-unknown-pack
bad-platform-standard-resolver-mismatch
```

These fixtures should prove the checker catches:

- over-selection
- forced backend
- BL2 defaulting
- industrial / standard layer mixing
- approval overclaims
- draft-to-stable wording
- unsafe existing-project adoption language
- resolver mismatch

## Goal + Subagent Execution Plan

Use Goal Mode for the implementation phase.

Goal:

```text
Implement 1.15.0 Platform Standard Baseline Packs without changing the core governance model or enabling industrial packs by default.
```

Suggested subagent roles:

```text
Reader: review 1.14.1 registry, resolver, checker, profiles, and existing platform docs.
Architect: propose pack matrix and resolver routing.
Checker: define bad fixtures and acceptance checks.
Docs reviewer: ensure user-facing docs remain understandable.
```

Main thread remains the only writer.

Subagents must be closed after their outputs are consumed.

No final response, commit, or release claim while a subagent is still running or standing by.

## Implementation Phases

### Phase 1: Plan and Boundary

- finalize this 1.15 plan
- GPT review
- revise if P0 / P1 feedback exists

No implementation until the plan is accepted.

### Phase 2: Pack Matrix and Pack Files

- add new standard pack directories
- update `standard-baseline-packs/index.json`
- update schema only if needed
- keep all new packs draft
- keep `activeByDefault: false`

### Phase 3: Resolver and Checker

- update `resolve-standard-baseline.mjs`
- update `check-standard-baseline-pack.mjs`
- update `check-standard-baseline-selection.mjs`
- keep `baseline-packs` as umbrella output

### Phase 4: Docs and Adapters

- update README / Chinese README
- update reference docs
- update Codex / Claude / Cursor / GitHub adapter docs
- update starter AGENTS

### Phase 5: Examples and Fixtures

- add good examples
- add bad fixtures
- update fixture matrix

### Phase 6: Manifest, CI, Release

- update manifest
- update workflow version
- update package version
- add release record
- add self-check report
- run full verification

## Verification

Required commands:

```bash
node scripts/check-standard-baseline-pack.mjs .
node scripts/check-standard-baseline-selection.mjs .
node scripts/check-fixtures.mjs
node scripts/check-manifest.mjs
node scripts/check-dev-kit.mjs
npm run verify
git diff --check
```

Additional generated-project checks:

```bash
node scripts/init-project.mjs --starter generic-project --target <tmp>
node <tmp>/scripts/resolve-standard-baseline.mjs <tmp>
node <tmp>/scripts/check-standard-baseline-pack.mjs <tmp>
node <tmp>/scripts/check-standard-baseline-selection.mjs <tmp>
node <tmp>/scripts/check-ai-workflow.mjs <tmp> --mode core
node <tmp>/scripts/workflow-next.mjs <tmp>
```

## Acceptance Criteria

1.15.0 is complete only when:

- all new standard packs exist and pass pack checks
- resolver recommends platform packs without selecting all packs
- backend remains optional for Mini Program / frontend projects
- release / rollback remains conditional
- environment is proportional and does not overload BL0
- industrial overlays stay optional and inactive
- existing governed projects use read-only gap-review language
- bad fixtures fail for expected reasons
- generated-project smoke passes
- `npm run verify` passes
- release record states known limitations
- self-check does not claim production validation

## Expected User Experience

For a new Mini Program:

```text
User: I want to build an appointment Mini Program.

Codex:
- Recommended level: BL1 standard
- Platform: WeChat Mini Program
- Recommended packs: miniprogram-runtime-standard, environment-standard
- Optional if backend exists: backend-api-standard
- Optional if release / handoff is needed: release-rollback-standard
- Industrial overlays: not enabled
- Can I configure this baseline now? No, waiting for your confirmation
```

For an existing governed project:

```text
Codex:
- This is an existing governed project.
- I will not overwrite AGENTS, CI, release flow, or existing docs.
- I will map the current governance to standard baseline packs.
- I will show gaps and recommended next steps.
- I need your confirmation before any controlled apply.
```

## Review Questions For GPT

1. Is 1.15 scoped correctly as platform standard baseline pack completion rather than a new governance layer?
2. Are the proposed new packs too broad, too narrow, or appropriately bounded?
3. Should `environment-standard` be recommended for BL1/BL2 non-trivial projects while staying minimal for BL0?
4. Is `internal-admin-standard` appropriate as a standard pack, or should it remain a project profile only?
5. Are Mini Program backend rules clear enough to avoid forcing backend on every Mini Program?
6. Are iOS and Android standard packs useful without becoming platform industrial packs?
7. Are the bad fixtures sufficient to prevent over-selection and approval overclaims?
8. Is the existing-project path clear enough to prevent overwrite behavior?
9. Is anything in this plan likely to create user-facing complexity instead of reducing it?

## Final Boundary

1.15.0 should make Codex better at choosing ordinary platform baselines.

It should not make Codex more aggressive.

The target behavior remains:

```text
AI recommends.
Humans confirm.
Writes happen only after the right workflow permits them.
Industrial controls are added only when risk actually requires them.
```
