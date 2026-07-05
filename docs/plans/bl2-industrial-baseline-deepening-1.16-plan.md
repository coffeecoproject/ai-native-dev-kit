# BL2 Industrial Baseline Deepening 1.16 Plan

## Human Summary

1.16.0 should deepen the existing BL2 industrial baseline packs before the project adds a simpler user-facing baseline selection entry.

1.15.0 made the standard baseline layer broader:

```text
platform -> BL0 / BL1 standard packs -> optional BL2 industrial overlays
```

The next risk is that the selection experience may look clear while the selected BL2 content is still too shallow. 1.16.0 should therefore make the industrial packs more useful for real project judgment, while keeping every pack bounded, draft, selected-only, and evidence-based.

Plain meaning:

```text
1.15 = the standard pack map exists.
1.16 = the industrial pack content becomes deeper.
1.17 = users get a simpler guided selection entry.
```

## Why 1.16 Before 1.17

Guided selection only works if the thing being selected has enough substance.

If 1.17 comes first, Codex may confidently recommend BL2 packs that still lack detailed expectations. That would create a polished decision surface with weak underlying rules.

1.16 should first strengthen:

- pack scope boundaries
- platform-specific engineering expectations
- capability boundaries
- evidence requirements
- bad-case examples
- checker coverage
- dogfood readiness

Then 1.17 can safely translate those rules into a plain decision card for users.

## Current State

The repository already has industrial pack infrastructure:

- `industrial-packs/index.json`
- `industrial-packs/selection-guide.md`
- `scripts/resolve-industrial-baseline.mjs`
- `scripts/check-industrial-pack.mjs`
- `scripts/check-industrial-baseline.mjs`
- selected-only industrial pack install support
- BL2 examples for Web and Mini Program
- maturity files:
  - `maturity.md`
  - `evidence.md`
  - `dogfood.md`
  - `false-positive-log.md`
  - `owner.md`
  - `changelog.md`

Current draft industrial packs:

| Pack | Type | Current role |
|---|---|---|
| `web-app-industrial` | primary platform | Deepest current draft; has Web BL2 dogfood history. |
| `wechat-miniprogram-industrial` | primary platform | Stronger than early draft; has Mini Program BL2 direction. |
| `ios-app-industrial` | primary platform | Platform draft; needs deeper build, runtime, release, evidence rules. |
| `android-app-industrial` | primary platform | Platform draft; needs deeper build, runtime, release, evidence rules. |
| `backend-api-industrial` | capability | Usable draft; needs stronger API, data contract, migration, reliability rules. |
| `internal-admin-industrial` | capability | Important for management systems; needs deeper permissions, audit, workflow rules. |
| `data-storage-industrial` | capability | Needs stronger schema, backup, recovery, migration, retention rules. |
| `cloudbase-industrial` | capability | Needs stronger cloud function, access rule, deployment, cost boundary rules. |
| `auth-permission-industrial` | capability | Needs stronger role, tenant, permission matrix, protected resource rules. |
| `payment-value-transfer-industrial` | risk overlay | Needs strict approval, reconciliation, refund, audit, no-auto-change rules. |
| `high-risk-change-industrial` | risk overlay | Needs strict change classification, rollback, freeze, and escalation rules. |

## Problem

The BL2 layer exists, but depth is uneven.

Typical risks:

- Codex may recommend a BL2 pack without enough practical expectations.
- A platform pack may absorb backend, auth, data, or payment responsibilities that should stay in separate packs.
- A capability pack may say "check evidence" but not define what evidence is enough.
- A risk overlay may be selected too casually.
- Draft packs may be treated as if they are stable because their files exist.
- Real projects may receive too much generic governance and too little platform-specific guidance.

## Goal

1.16.0 should make each BL2 industrial pack specific enough that Codex can use it to judge:

- when the pack applies
- when the pack does not apply
- what project facts are required
- what evidence is required
- what Codex must not do
- what checks should fail
- what bad examples look like
- what remains draft-only

The goal is not to certify production readiness. The goal is to make BL2 selection more concrete and safer.

## Non-Goals

1.16.0 must not:

- promote any industrial pack to stable
- make BL2 default
- select all industrial packs by default
- make industrial packs active by default
- approve target-project writes
- approve implementation
- approve release or production
- approve security, privacy, compliance, legal, tax, finance, HR, payment, or migration decisions
- claim real-project production validation
- replace standard baseline packs
- merge backend, data, auth, payment, or admin responsibilities into platform packs
- create business app templates
- create code generators
- require every project to use BL2

## Core Rule

Every industrial pack remains:

```text
draft
selected-only
evidence-required
human-confirmed
non-authorizing
```

Pack files define standards. They do not prove a real project satisfies those standards.

## 1.16 Deepening Model

Each industrial pack should have a consistent depth model:

| Area | Required content |
|---|---|
| Applicability | When the pack should be considered. |
| Non-applicability | When the pack must not be selected. |
| Scope boundary | What belongs in this pack and what belongs in companion packs. |
| Architecture baseline | Expected structure, ownership, and dependency boundaries. |
| Environment baseline | Required runtime, build, test, local, CI, or deployment facts. |
| Data boundary | Data source, persistence, migration, recovery, or retention expectations when relevant. |
| Permission boundary | Role, tenant, protected resource, or platform permission expectations when relevant. |
| Verification baseline | Required checks, tests, manual verification, or evidence commands. |
| Release and rollback | Required launch, rollback, store review, migration, or recovery evidence when relevant. |
| Evidence template | What project evidence must reference before strict BL2 can pass. |
| Bad cases | Examples of invalid selection, overclaim, or missing evidence. |
| Codex forbidden actions | Actions Codex must not take without explicit human approval. |
| Maturity limits | Why the pack remains draft and what evidence is missing before candidate/stable. |

## Pack Prioritization

### P1: Web And Mini Program

Deepen first because they are already the most likely real use cases.

`web-app-industrial` should cover:

- routing and page boundary
- UI state and form state
- API client error handling
- accessibility and keyboard baseline
- visual regression or browser behavior evidence
- performance budget evidence
- release/handoff evidence
- frontend-only vs backend-backed boundary

`wechat-miniprogram-industrial` should cover:

- page/component lifecycle
- platform API boundary
- login/session behavior
- user permission prompts
- cloud function or backend separation
- storage/cache boundary
- privacy and payment escalation
- WeChat review/release evidence

### P2: Backend, Internal Admin, Data, Auth, Cloud

Deepen capability packs because they are usually selected with Web, Mini Program, or internal systems.

`backend-api-industrial` should cover:

- API contract ownership
- DTO/domain separation
- request/response validation
- error model
- idempotency where needed
- migration and compatibility boundary
- integration tests and contract evidence

`internal-admin-industrial` should cover:

- privileged workflows
- approval flows
- audit trail requirements
- table/form safety
- export/import boundaries
- operation reversibility
- role-based UI behavior

`data-storage-industrial` should cover:

- schema ownership
- migration safety
- enum vs lookup decision rules
- backup/restore
- retention and deletion
- data repair evidence
- destructive operation gates

`auth-permission-industrial` should cover:

- identity model
- roles, scopes, tenants
- protected resources
- permission matrix
- denied-state behavior
- audit and escalation

`cloudbase-industrial` should cover:

- cloud functions
- cloud storage
- access rules
- environment separation
- deploy and rollback
- cost and quota boundary
- local/sandbox evidence

### P3: iOS And Android

Deepen mobile packs without trying to make them stable.

`ios-app-industrial` should cover:

- app architecture and state ownership
- navigation boundary
- data persistence boundary
- permission prompts
- build/simulator evidence
- device capability evidence where needed
- App Store/TestFlight/release boundary when in scope

`android-app-industrial` should cover:

- module and package structure
- navigation and lifecycle
- state ownership
- Gradle/build variants
- permission prompts
- emulator/device evidence
- Play release/rollback boundary when in scope

### P4: Risk Overlays

Deepen risk overlays last because they must stay strict and selected only when risk exists.

`payment-value-transfer-industrial` should cover:

- payment provider boundary
- order/payment state model
- reconciliation
- refund and reversal
- webhook/idempotency
- audit evidence
- forbidden auto-fix zones

`high-risk-change-industrial` should cover:

- destructive changes
- production-sensitive changes
- migrations
- auth/payment/data changes
- rollback readiness
- freeze/stop rules
- human escalation

## Expected File Work

1.16 should avoid adding a new governance layer. It should deepen existing pack assets.

Likely touched areas:

```text
industrial-packs/<pack>/pack.md
industrial-packs/<pack>/baselines/*.md
industrial-packs/<pack>/audit/*.md
industrial-packs/<pack>/checklists/*.md
industrial-packs/<pack>/templates/*.md
industrial-packs/<pack>/evidence.md
industrial-packs/<pack>/dogfood.md
industrial-packs/<pack>/false-positive-log.md
industrial-packs/<pack>/maturity.md
industrial-packs/selection-guide.md
docs/reference/industrial-packs.md
scripts/check-industrial-pack.mjs
scripts/check-industrial-baseline.mjs
test-fixtures/bad/*
examples/*
releases/1.16.0/*
```

Optional docs:

```text
docs/bl2-industrial-baseline-deepening.md
docs/reference/bl2-industrial-pack-depth-matrix.md
```

## Checker Hardening

1.16 should add checker rules for industrial depth, not just file existence.

`check-industrial-pack.mjs` should reject:

- missing applicability/non-applicability boundary
- missing companion pack boundary
- missing evidence template
- missing forbidden actions
- draft pack claiming stable or production-ready
- platform pack absorbing backend/admin/data/auth/payment responsibilities without companion-pack split
- risk overlay selected without risk-specific evidence
- real project facts, URLs, bundle IDs, secrets, or customer data inside pack files

`check-industrial-baseline.mjs` should strengthen:

- BL2 selected without selected industrial packs
- selected pack missing project evidence refs
- selected pack incompatible with selected profiles
- risk overlay selected without matching risk terms
- draft pack accepted without human draft acceptance
- strict mode passes while evidence is only generic

## Examples

Add or deepen examples for:

| Example | Purpose |
|---|---|
| `examples/1.16-bl2-industrial-deepening/web-admin-data-auth` | Web internal admin with backend, auth, data. |
| `examples/1.16-bl2-industrial-deepening/miniprogram-cloud-auth` | Mini Program with cloud/auth but no payment. |
| `examples/1.16-bl2-industrial-deepening/ios-mobile-api` | iOS with backend API and permission evidence. |
| `examples/1.16-bl2-industrial-deepening/android-mobile-api` | Android with backend API and permission evidence. |
| `examples/1.16-bl2-industrial-deepening/payment-risk-overlay` | Payment overlay selected only with payment evidence. |
| `examples/1.16-bl2-industrial-deepening/existing-governed-bl2-gap-review` | Existing governed project gets gap review, not overwrite. |

Examples should be small but realistic. They should show evidence references, not full business implementations.

## Bad Fixtures

Add bad fixtures for:

- BL2 selected with no industrial packs
- all industrial packs selected by default
- Web pack selected for iOS-only project
- Mini Program pack includes backend/admin/payment claims without companion packs
- payment overlay selected without payment risk evidence
- draft pack treated as stable
- pack file claims production validation
- selected pack has no evidence refs
- existing governed project proposes overwrite
- Codex claims BL2 approval authorizes implementation
- Codex claims BL2 approval authorizes release
- high-risk change proceeds without human escalation

## Goal And Subagent Orchestration

Use Goal Mode for the implementation run:

```text
Goal: Complete 1.16 BL2 Industrial Baseline Deepening without promoting draft packs or adding a new governance layer.
```

Suggested subagents:

| Subagent | Mode | Responsibility | Output |
|---|---|---|---|
| Pack Inventory Reader | read-only | Compare current pack depth and missing depth fields. | Pack gap report. |
| Platform Pack Reviewer | read-only | Review Web, Mini Program, iOS, Android depth. | Platform gap list. |
| Capability Pack Reviewer | read-only | Review backend, admin, data, auth, cloud depth. | Capability gap list. |
| Risk Overlay Reviewer | read-only | Review payment and high-risk change rules. | Risk gap list. |
| Checker Reviewer | read-only | Propose checker and bad fixture coverage. | Checker coverage plan. |

Rules:

- Main thread remains the only writer.
- Subagents must not edit files directly.
- Subagents must close their run plans.
- Subagents must not approve BL2, implementation, release, production, security, privacy, legal, compliance, tax, finance, HR, payment, or migration decisions.

## Implementation Phases

### Phase 0: Inventory

- Read all industrial pack files.
- Produce current depth matrix.
- Identify missing depth areas by pack.
- Confirm no pack should be promoted beyond `draft`.

### Phase 1: Depth Contract

- Define the shared BL2 depth contract.
- Add a reference matrix.
- Update industrial pack docs to use the same structure.

### Phase 2: Platform Packs

- Deepen Web and Mini Program first.
- Deepen iOS and Android second.
- Keep backend/admin/data/auth/payment outside platform packs unless explicitly referenced as companion packs.

### Phase 3: Capability Packs

- Deepen backend, internal admin, data storage, auth/permission, and CloudBase.
- Add explicit companion-pack guidance.

### Phase 4: Risk Overlays

- Deepen payment/value-transfer and high-risk-change.
- Make stop/ask-human behavior explicit.

### Phase 5: Checkers And Fixtures

- Harden industrial pack and BL2 baseline checks.
- Add good examples and bad fixtures.
- Ensure selected-only behavior still works.

### Phase 6: Release Evidence

- Add 1.16 release record.
- Add known limitations.
- Add self-check report.
- Run full verification.

## Acceptance Criteria

1.16 is complete only if:

- every industrial pack has a clear scope and non-scope boundary
- every industrial pack has evidence expectations tied to project refs
- platform packs do not absorb unrelated capability/risk responsibilities
- risk overlays require risk-specific evidence
- checkers reject over-selection and approval overclaims
- examples cover at least Web, Mini Program, backend/admin/data/auth, iOS, Android, and payment/high-risk overlays
- bad fixtures prove the most dangerous mistakes fail
- all packs remain draft unless real evidence justifies otherwise
- `node scripts/check-industrial-pack.mjs .` passes
- `node scripts/check-fixtures.mjs` passes
- `node scripts/check-intentos.mjs` passes
- `npm run verify` passes

## Explicit Boundaries

1.16 must preserve these statements:

```text
BL2 selection is not implementation approval.
BL2 selection is not release approval.
BL2 selection is not production approval.
Industrial pack files are not project evidence.
Draft packs are not stable defaults.
Existing governed projects must be mapped before any controlled apply.
```

## Relationship To 1.17

1.16 produces the stronger industrial content that 1.17 can later explain to users.

1.17 should not simplify or hide the BL2 boundary. It should translate the 1.16 depth into a readable decision card:

```text
What project is this?
What baseline level fits?
Which standard packs apply?
Which industrial packs are candidates?
What does the user need to confirm?
What is deliberately not selected?
What can Codex do next?
```

1.16 makes the answer reliable. 1.17 makes the answer readable.
