# Standard Baseline Pack Registry 1.14 Plan

## Human Summary

1.14.0 should turn baseline guidance into a separate Standard Baseline Pack Registry. The goal is to stop mixing normal engineering standards with BL2 industrial packs.

In plain terms:

```text
Standard baseline packs = what a normal project should have.
Industrial packs = what a high-risk or production-sensitive project may additionally need.
```

Codex should recommend the smallest useful standard baseline set first. It may only recommend industrial packs as an extra risk layer when the project scope justifies it and the human confirms the decision.

## Why This Upgrade Exists

1.13.0 introduced baseline pack selection, but the current resolver still reads `industrial-packs/index.json`. That is useful for BL2 and high-risk governance, but it creates a naming and responsibility problem:

- normal Web, backend, release, data, auth, testing, and environment rules look like industrial packs
- draft industrial maturity can be confused with standard engineering guidance
- users may think BL2 is required for every serious project
- future platform baseline work has no clean place to live

1.14.0 should fix that by adding a clear middle layer.

## Positioning

1.14.0 is not a new business template system. It is a governance layer for choosing engineering baselines.

It should answer:

- What standard baselines does this project need?
- Which ones are primary platform baselines?
- Which ones are capability baselines?
- Which ones are environment, release, quality, or safety baselines?
- Which industrial packs are only optional overlays?
- What evidence or human confirmation is still missing?

It should not answer:

- what exact product features to build
- which framework must always be used
- whether production launch is approved
- whether legal, compliance, security, or privacy review is complete
- whether a draft industrial pack is stable

## Core Design

```text
Project state
  -> selected profiles
  -> BL level
  -> standard baseline packs
  -> optional industrial overlays
  -> evidence gaps
  -> human decision
```

## Layer Separation

### Profile Layer

Profiles describe the project shape:

- `web-app`
- `wechat-miniprogram`
- `ios-app`
- `android-app`
- `backend-api`
- `internal-admin`
- `high-risk-change`

Profiles do not install baselines. They only help route recommendations.

### Standard Baseline Pack Layer

Standard baseline packs describe expected engineering rules for common project types and capabilities.

Examples:

- Web runtime
- Backend API
- Release and rollback
- Auth and permission
- Data storage
- Test and quality
- Environment and secrets
- Observability
- Dependency and supply chain
- Accessibility

These are not production certification. They are recommended engineering guardrails.

### Industrial Pack Layer

Industrial packs remain the heavier BL2 layer.

Use them for:

- production-sensitive systems
- customer data
- payment or value transfer
- destructive migrations
- regulated or irreversible changes
- high-risk release operations

Industrial packs stay selected-only, evidence-based, and human-approved.

## Proposed Directory Structure

Add:

```text
standard-baseline-packs/
  README.md
  index.json
  selection-guide.md
  schema/
    standard-pack.schema.json
  web-runtime/
    pack.json
    pack.md
    baselines/
      web-runtime-baseline.md
      web-ui-state-baseline.md
      web-api-client-baseline.md
    checklists/
      web-runtime-review.md
    templates/
      web-runtime-evidence.md
    evidence.md
    maturity.md
    owner.md
    changelog.md
  backend-api/
    pack.json
    pack.md
    baselines/
      backend-api-contract-baseline.md
      backend-domain-data-baseline.md
    checklists/
      backend-api-review.md
    templates/
      backend-api-evidence.md
    evidence.md
    maturity.md
    owner.md
    changelog.md
  release-rollback/
    pack.json
    pack.md
    baselines/
      release-readiness-baseline.md
      rollback-baseline.md
    checklists/
      release-rollback-review.md
    templates/
      release-rollback-evidence.md
    evidence.md
    maturity.md
    owner.md
    changelog.md
```

Later versions can add more packs after the registry and checks are stable:

```text
auth-permission/
data-storage/
test-quality/
environment-secrets/
observability/
dependency-supply-chain/
accessibility/
mobile-runtime/
wechat-miniprogram-runtime/
```

## Initial Pack Scope

1.14.0 should add only three draft standard packs.

### `web-runtime-standard`

Purpose:

- frontend structure
- routing and state boundaries
- API client boundary
- form and validation expectations
- UI behavior verification
- responsive and accessibility baseline
- build and preview commands

Applies to:

- `web-app`
- `internal-admin` when web-based

### `backend-api-standard`

Purpose:

- API contract rules
- database schema and migration expectations
- enum and domain type governance
- auth boundary
- error handling
- idempotency where needed
- integration tests and local environment checks

Applies to:

- `backend-api`
- projects with server-side APIs

### `release-rollback-standard`

Purpose:

- release plan
- rollback plan
- environment separation
- deployment evidence
- smoke test expectations
- release owner and decision boundary

Applies to:

- production or staging deployment
- projects with release risk

## Pack Metadata

Each standard pack should include:

```json
{
  "id": "web-runtime-standard",
  "type": "primary-platform",
  "status": "draft",
  "maturityStage": "draft",
  "baselineLayer": "standard",
  "recommendedForBL": ["BL1_STANDARD"],
  "allowedForBL": ["BL0_LIGHTWEIGHT", "BL1_STANDARD", "BL2_INDUSTRIAL"],
  "activeByDefault": false,
  "appliesToProfiles": ["web-app"],
  "recommendedWhen": [
    "web UI, routing, state, API client, forms, or runtime behavior is in scope"
  ],
  "canBeRecommendedByAI": true,
  "selectionRequiresHumanDecision": true,
  "canAuthorizeWrites": false,
  "canApproveImplementation": false,
  "canApproveRelease": false,
  "canApproveComplianceSecurityPrivacy": false,
  "requiresEvidenceForConfirmed": true
}
```

## Pack Types

Standard baseline packs should use explicit types:

| Type | Meaning |
|---|---|
| `primary-platform` | Main runtime such as Web, iOS, Android, Mini Program |
| `capability` | Functional capability such as backend, auth, data, admin |
| `quality` | Testing, linting, type, review, accessibility, dependency checks |
| `environment` | env files, secrets, local/dev/staging/prod separation |
| `release` | deployment, rollback, smoke, release evidence |

Industrial packs can keep their current types:

- `primary-platform`
- `capability`
- `risk-overlay`

## Baseline Levels

| Level | Standard pack behavior | Industrial pack behavior |
|---|---|---|
| `BL0_LIGHTWEIGHT` | Recommend only essential standard packs | Do not recommend by default |
| `BL1_STANDARD` | Recommend selected standard packs | Do not enable by default |
| `BL2_INDUSTRIAL` | Require selected standard packs first | Recommend selected industrial overlays only when risk exists |

BL2 should build on standard packs. It should not replace them.

## Resolver Behavior

Add:

```text
scripts/resolve-standard-baseline.mjs
scripts/check-standard-baseline-pack.mjs
scripts/check-standard-baseline-selection.mjs
```

### `resolve-standard-baseline.mjs`

Read-only recommendation.

Inputs:

- project root
- project state
- selected profiles
- BL level
- existing baseline files
- standard pack index
- optional industrial pack index

Outputs:

- recommended standard packs
- optional industrial overlays
- not-selected packs
- evidence gaps
- human decisions required
- forbidden actions

It must not:

- write target project files
- select all packs by default
- enable BL2 automatically
- treat standard pack recommendation as write approval
- treat industrial overlay recommendation as production readiness

### `check-standard-baseline-pack.mjs`

Validates pack registry quality:

- index is valid JSON
- each pack exists
- each pack has required files
- IDs are unique
- IDs end with `-standard`
- `baselineLayer` is `standard`
- `defaultForBL` is forbidden
- `recommendedForBL` is present when a pack is normally recommended
- `activeByDefault` is `false`
- `canAuthorizeWrites` is `false`
- `canApproveImplementation` is `false`
- `canApproveRelease` is `false`
- `canApproveComplianceSecurityPrivacy` is `false`
- `requiresEvidenceForConfirmed` is `true`
- status is one of `draft`, `candidate`, `stable`, `deprecated`, `retired`
- `status` and `maturityStage` are aligned for draft packs
- draft packs do not claim production stability
- pack text does not approve implementation, release, compliance, or production
- pack text does not contain real customer names, tokens, private URLs, real accounts, or project-specific evidence

### `check-standard-baseline-selection.mjs`

Validates recorded selection reports:

- required sections exist
- pack IDs exist in the standard index
- selected profiles are recorded
- BL level is recorded
- standard packs and industrial overlays are separated
- evidence gaps are recorded
- human decision is exactly one of `PENDING`, `APPROVED`, `REJECTED`
- no write, implementation, release, compliance, or production approval is implied

Optional strict mode:

```bash
node scripts/check-standard-baseline-selection.mjs . --strict --compare-resolver
```

Strict mode should compare the report against resolver JSON where possible.

`--compare-resolver` should check:

- report pack IDs exist in the standard index
- recommended standard packs match resolver output or include an explicit reason
- selected profiles match project profile evidence where available
- BL level matches baseline selection evidence where available
- optional industrial overlays come from `industrial-packs/index.json`
- evidence references exist or are explicitly marked `PENDING`
- human decision is exactly one status

## CLI Surface

Add:

```bash
node scripts/cli.mjs standard-baseline <project>
node scripts/cli.mjs standard-baseline-selection <project>
node scripts/cli.mjs baseline-packs <project>
```

Expected behavior:

- `standard-baseline` recommends standard packs.
- `standard-baseline-selection` checks recorded standard baseline selection reports.
- `baseline-packs` becomes an umbrella read-only recommendation that shows standard packs first, then optional industrial overlays.

The `baseline-packs` output must include this meaning:

```text
This is an umbrella read-only recommendation.
Standard packs are shown first.
Industrial overlays are optional and inactive unless human-approved.
```

Backward compatibility:

- Existing `baseline-packs` and `baseline-pack-selection` commands must keep working.
- Existing industrial pack checks must keep working.
- Existing generated project assets must not break.

## Templates

Add:

```text
templates/standard-baseline-selection-report.md
checklists/standard-baseline-selection-review.md
prompts/standard-baseline-router-agent.md
standard-baseline-selections/.gitkeep
```

Report sections:

- Human Summary
- Project Classification
- Selected Profiles
- BL Level
- Recommended Standard Packs
- Optional Industrial Overlays
- Not Selected
- Evidence Required
- Human Decision
- Boundary

Boundary markers:

```text
authorizes target-project writes: No
approves implementation: No
approves release or production: No
approves compliance/security/privacy: No
proves real project evidence exists: No
```

## Documentation Updates

Update:

- `README.md`
- `README.zh-CN.md`
- `docs/operator-manual.md`
- `docs/quickstart.md`
- `docs/first-hour.md`
- `docs/codex-usage.md`
- `docs/mental-model.md`
- `docs/baseline-pack-system.md`
- `docs/reference/scripts.md`
- `docs/reference/artifacts.md`
- `docs/reference/checkers.md`
- `docs/reference/industrial-packs.md`
- `docs/reference/standard-baseline-packs.md`
- `intentos-manifest.json`
- `VERSION.md`

Add:

- `core/standard-baseline-pack-registry.md`
- `docs/standard-baseline-pack-registry.md`

README wording should stay user-facing:

```text
先选标准基线，再看是否需要工业增强。
```

Avoid making README a dense technical index.

## CI And Self-Check

Add explicit checks to:

- `.github/workflows/intentos-pr-checks.yml`
- `.github/workflows/intentos-release-checks.yml`
- `platforms/github/ci-ai-workflow.yml`
- `package.json` `verify`
- `scripts/check-intentos.mjs`

Minimum CI commands:

```bash
node scripts/cli.mjs standard-baseline .
node scripts/check-standard-baseline-pack.mjs .
node scripts/check-standard-baseline-selection.mjs .
node scripts/cli.mjs baseline-packs .
node scripts/check-baseline-pack-selection.mjs .
```

The separate CI step matters because `npm run verify` can hide which product capability failed.

Add bad fixture coverage for:

- `bad-standard-pack-overclaim`
- `bad-standard-pack-default-enabled`
- `bad-standard-pack-missing-baselines`
- `bad-standard-pack-invalid-layer`
- `bad-standard-pack-production-ready`
- `bad-standard-selection-missing-section`
- `bad-standard-selection-unknown-pack`
- `bad-standard-selection-industrial-as-standard`
- `bad-standard-selection-write-approved`
- `bad-standard-selection-release-approved`
- `bad-standard-selection-compare-resolver-mismatch`

## Goal + Subagent Execution Plan

Use one main goal:

```text
Goal: Implement 1.14 Standard Baseline Pack Registry without changing the industrial pack contract or turning recommendations into approvals.
```

Suggested subagents:

| Subagent | Mode | Responsibility | Output |
|---|---|---|---|
| Registry Designer | read/write docs and pack assets | define schema, index, initial standard packs | registry files |
| Resolver Implementer | read/write scripts | implement resolver and CLI wiring | scripts and CLI |
| Checker Implementer | read/write scripts | validate packs and reports | checker scripts and fixtures |
| Documentation Reviewer | read/write docs | simplify user wording and update docs | docs updates |
| Governance Reviewer | read-only | check boundaries, overclaims, compatibility | review findings |

Subagent rules:

- each subagent gets a narrow task card
- no subagent may approve BL2, release, production, compliance, privacy, or security
- no subagent may treat a recommendation as write authorization
- every subagent must close its run with a summary and stop
- main thread owns final integration and verification

## Implementation Phases

### Phase 1: Registry Foundation

Deliver:

- `standard-baseline-packs/`
- index
- schema
- first three draft packs
- registry docs

Verification:

- schema-like structural checks
- no overclaim wording
- no production-ready claims

### Phase 2: Resolver And CLI

Deliver:

- `resolve-standard-baseline.mjs`
- CLI commands
- compatibility with `baseline-packs`
- JSON and human output

Verification:

- empty project output
- selected profile output
- BL0/BL1/BL2 output
- industrial overlay stays optional

### Phase 3: Selection Reports And Checkers

Deliver:

- report template
- review checklist
- checker script
- strict comparison path

Verification:

- good report passes
- missing sections fail
- unknown pack ID fails
- write approval overclaim fails
- industrial overlay confused as standard pack fails

### Phase 4: Docs, Manifest, CI

Deliver:

- README updates
- operator docs updates
- manifest updates
- workflow updates
- package verify updates
- generated project asset updates where needed

Verification:

- `npm run verify`
- `node scripts/check-manifest.mjs`
- `node scripts/check-intentos.mjs`
- `git diff --check`

### Phase 5: Full Review

Deliver:

- release record
- final self-check
- governance review

Review questions:

- Are standard packs clearly separate from industrial packs?
- Does every command remain read-only unless explicitly documented otherwise?
- Are BL0/BL1/BL2 semantics intact?
- Are draft packs prevented from being treated as stable?
- Can a non-specialist user understand the next decision?
- Are CI failures easy to locate?

## Migration And Compatibility

1.14.0 should not break 1.13 assets.

Keep:

- `industrial-packs/`
- `baseline-pack-selections/`
- `resolve-baseline-packs.mjs`
- `check-baseline-pack-selection.mjs`
- `baseline-packs` CLI command
- `baseline-pack-selection` CLI command

Additive behavior:

- new standard baseline registry
- new standard resolver
- new standard selection reports
- `baseline-packs` may aggregate both layers

No automatic migration should rewrite target projects.

## Human Decision Boundary

Human confirms:

- project profile
- BL level
- standard pack selection
- whether optional industrial overlays apply
- whether missing evidence blocks the next task
- whether Codex may write target project files
- whether a separate implementation task is approved

Codex may:

- recommend
- summarize
- prepare reports
- check consistency
- explain tradeoffs

Codex may not:

- approve release
- approve production
- approve legal/compliance/security/privacy
- treat draft packs as stable
- enable all packs by default
- apply industrial overlays without human confirmation

Human approval of a standard baseline selection does not approve a specific implementation task.

## Success Criteria

1. A new project can receive a platform and BL-level standard baseline recommendation without using industrial packs as the primary registry.
2. An existing project can be assessed for missing standard baselines without writing files.
3. A production-sensitive project gets standard baseline recommendations and optional industrial overlays, but remains read-only unless approved.
4. `baseline-packs` output clearly separates:
   - standard baseline packs
   - optional industrial overlays
   - not selected packs
   - evidence gaps
   - human decisions
5. CI shows dedicated standard baseline checks.
6. The README remains understandable to non-specialist users.
7. Full verification passes.

## Explicit Non-Goals

1.14.0 must not:

- fully mature every platform baseline
- make all standard packs stable
- claim real production validation
- change the license model
- replace existing project-specific baselines
- force BL2 for serious projects
- install standard packs into target projects without confirmation
- use standard baseline recommendations as implementation approval
- add full auth, data, observability, supply-chain, accessibility, mobile, or Mini Program standard packs

## Suggested Release Name

```text
1.14.0 Standard Baseline Pack Registry
```

## Review Prompt For GPT

Please review this 1.14.0 plan for overreach, missing boundaries, and implementation risk.

Focus on:

- whether standard baseline packs and industrial packs are separated clearly enough
- whether this avoids making BL2 the default
- whether the planned commands are too heavy or too confusing
- whether the initial three standard packs are the right starting scope
- whether the human decision boundary is strong enough
- whether anything should be moved out of 1.14.0 into a later version
