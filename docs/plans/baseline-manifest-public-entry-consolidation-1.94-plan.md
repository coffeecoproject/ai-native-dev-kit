# Baseline, Manifest And Public Entry Consolidation 1.94 Execution And Acceptance Plan

## 1. Purpose

IntentOS 1.90-1.93 established execution truth, evidence authority, exact
controlled apply, adoption closure, and release trust. The remaining product
foundation is inconsistent in three places:

- baseline classification and installation do not always describe the real
  project state;
- the authoritative manifest is not fully validated against its own schema and
  contains redundant copy expressions;
- public entry documentation and legacy baseline write commands can disagree
  with the current controlled execution model.

1.94 consolidates those foundations:

```text
natural-language project goal
-> Codex-derived platform and baseline recommendation
-> one plain confirmation only when the choice changes material risk or cost
-> exact baseline selection in the controlled init/update plan
-> exact approved replay and receipt
-> installed baseline verification
-> one plain next action
```

For an existing project the route is different:

```text
project-owned baseline and release rules
-> read-only comparison with IntentOS baseline
-> preserve the stricter valid rule
-> selected gap plan
-> controlled apply only after bounded approval
-> post-apply verification and receipt
```

The user is not expected to choose profile IDs, BL labels, pack IDs, checker
commands, manifest groups, or copy rules.

## 2. Architectural Position

1.94 is a consolidation release, not a new governance subsystem.

- Platform profiles remain the project-shape source.
- BL0 / BL1 / BL2 remain the governance-depth model.
- Standard and industrial packs remain implementation assets.
- Baseline recommendation remains read-only.
- The 1.92 controlled init/update plan remains the only baseline installation
  execution graph.
- Existing-project rule reconciliation remains authoritative for preserve,
  merge, replace, block, and exception decisions.
- The manifest remains the single source for distributable IntentOS assets.
- Public `start`, `adopt`, `next`, `doctor`, and natural-language usage remain
  simple views over internal checks.

No second approval engine, baseline state machine, copy engine, or public
command family is introduced.

## 3. Non-Goals

1.94 does not:

- claim that every draft baseline or industrial pack is production-certified;
- auto-enable BL2 merely because a platform is detected;
- let Codex silently decide legal, compliance, production, secret, migration,
  payment, permission, data-retention, or release-owner questions;
- overwrite a stricter valid existing-project rule;
- require a beginner to understand engineering baseline terminology;
- treat copied IntentOS assets as evidence that project behavior is correct;
- restore direct baseline writes outside the controlled apply chain;
- change application runtime, business code, CI, deployment, production, DNS,
  secrets, data, or release ownership.

## 4. Baseline Truth Model

### 4.1 Canonical Baseline Levels

All resolvers and checkers use the exact canonical levels:

- `BL0_LIGHTWEIGHT`
- `BL1_STANDARD`
- `BL2_INDUSTRIAL`

Short `BL0`, `BL1`, and `BL2` values may remain readable as legacy input, but
must normalize to the canonical value before comparison. `BL1_STANDARD` must
never be interpreted as BL0.

### 4.2 Project Signals

Project classification must use project-owned sources. Managed IntentOS assets
under `.intentos/` must not create platform, risk, release, package, or baseline
signals for the host project.

This exclusion is central and shared. Individual resolvers must not maintain
inconsistent ad-hoc exclusions.

### 4.3 New Project Baseline Contract

For a new project, Codex derives a recommendation from the user's goal and
starter, then places the exact selected values in the init execution plan:

- selected project profiles;
- canonical baseline level;
- selected standard baseline packs;
- selected industrial packs when BL2 applies;
- rationale and unresolved high-risk decisions;
- expected project baseline documents and installed managed assets.

The plan must create the project baseline selection/evidence documents from
plan-bound generated content. Generated content receives the same digest,
target fingerprint, approval, replay, rollback, and receipt protection as a
copied source file.

Default technical recommendation:

- BL0 for genuinely disposable/local low-risk work;
- BL1 for normal maintained applications and services;
- BL2 only for industrial, production-sensitive, regulated, high-risk, or
  explicitly requested delivery, with concrete selected industrial packs.

Missing BL2 pack selection or unresolved high-risk ownership fails closed. It
must not silently downgrade to BL1 or claim that BL2 is installed.

### 4.4 Existing Project Baseline Contract

Existing projects do not receive an unreviewed baseline overwrite. IntentOS:

1. discovers project-owned engineering, environment, release, runtime, data,
   permission, and platform sources;
2. compares them against the selected IntentOS profile and level;
3. classifies each rule as preserve, merge, replace, block, exception, or
   unresolved;
4. recommends the professionally safer and more complete valid rule;
5. generates only selected gap actions;
6. applies those actions through the 1.92 controlled execution chain;
7. proves installed state and continued behavior activation.

The recommendation is technical work performed by Codex. The user is asked
only for a meaningful product/risk decision that cannot be determined from
project evidence.

## 5. Baseline Installation Evidence

Add one internal baseline installation verification entry that proves:

- the project profile and canonical baseline level are concrete;
- required project baseline documents exist;
- selected profile assets exist;
- selected standard packs resolve to current registry entries;
- BL2 selected industrial packs resolve and are installed;
- selected pack status is reported honestly, including `draft` maturity;
- no unselected pack is claimed as installed;
- project-managed and IntentOS-managed sources are distinguishable;
- the current selection matches the apply plan and receipt when writes occurred.

The checker is an internal consumer. Public users receive a plain result such
as `baseline ready`, `safe to continue with limits`, or `one decision needed`.

## 6. Controlled Baseline Write Hardcut

`baseline-project.mjs` remains a read-only recommender and may emit a plan-only
proposal for review. Its legacy direct `--apply-plan` path must not write files.

All real baseline setup writes must be emitted as exact actions by
`init-project.mjs --write-plan` and replayed only with:

- current plan digest and project/Git fingerprint;
- exact structured Approval Record;
- exact Controlled Apply Readiness Report;
- exact action IDs and target paths;
- source or generated-content digest;
- bounded backup and rollback behavior;
- Apply Receipt and post-apply activation verification.

Editing a baseline plan JSON or passing a legacy command flag cannot authorize
write access.

## 7. Manifest Authority Consolidation

### 7.1 Real Schema Validation

`check-manifest.mjs` must validate `intentos-manifest.json` against the actual
`schemas/intentos-manifest.schema.json` through the repository's strict schema
validator before domain-specific checks run.

Unknown root, group, compatibility, copy-rule, or item fields fail. The checker
must not merely inspect the schema file shape.

### 7.2 Group Cleanup

Obsolete, unconsumed groups are removed rather than added to the schema. The
schema and `manifestGroupNames` remain the explicit accepted group set.

### 7.3 Copy Rule Normalization

Copy rules must have one effective expression for one target asset:

- reject exact duplicate targets;
- reject conflicting source-to-target mappings;
- reject a child file rule already covered by an identical parent directory
  mapping;
- permit a child override only when explicitly supported and independently
  validated; 1.94 does not require such an override;
- preserve deterministic action ordering and generated-project results.

Removing redundant child rules must not remove target files from generated
projects or change `workflowVersionAssets` truth.

## 8. Public Entry Consolidation

Public documentation and command output must use the real repository source:

```text
https://github.com/coffeecoproject/ai-native-dev-kit.git
```

The beginner interaction is:

```text
User: Here is the IntentOS repository. Configure this project yourself.
Codex: inspects new/existing state, recommends the route, and performs all
       technical comparison and planning.
Codex: asks one plain confirmation only for a material human-owned decision.
Codex: performs the approved bounded work and reports one result.
```

Public output must not require the user to select internal commands, profile
IDs, BL values, pack IDs, schema modes, or apply action IDs. Maintainer CLI
commands remain documented in technical references, not as user obligations.

## 9. Implementation Work Packages

### WP1 - Baseline Signal And Level Integrity

- centralize `.intentos` exclusion from project signals;
- normalize canonical BL0/BL1/BL2 values;
- fix BL1_STANDARD enforcement;
- add negative tests for managed-asset signal pollution and missing selection.

### WP2 - Baseline Configuration And Installation

- add controlled init inputs for profiles and baseline level;
- derive starter defaults where safe;
- resolve standard/industrial pack selection from registries;
- add plan-bound generated project profile, baseline selection, and evidence;
- add baseline installation verification;
- keep BL2 fail-closed and maturity claims precise.

### WP3 - Write Path Consolidation

- disable legacy direct baseline apply;
- route every baseline write through 1.92 exact plan replay;
- bind generated content, selected packs, and selection identity to plan/receipt;
- preserve existing-project compare/selected-gap behavior.

### WP4 - Manifest Authority

- validate manifest content against its schema;
- remove obsolete groups;
- remove redundant descendant copy rules;
- add duplicate/conflict/overlap negative tests;
- verify generated project contents remain complete.

### WP5 - Public Entry And Product Integration

- correct source-only repository instructions;
- make new-project output recommendation-first and plain-language;
- update CLI help, README files, reference indexes, starter guidance, manifest,
  workflow-version assets, version files, self-checks, and release evidence;
- preserve internal commands without exposing them as user decisions.

## 10. Acceptance Matrix

| ID | Scenario | Expected result |
|---|---|---|
| B01 | `BL1_STANDARD` in project baseline | normalized and enforced as BL1 |
| B02 | only `.intentos` contains web/iOS/risk terms | no host-project signal inferred |
| B03 | new web app with default maintained lifecycle | Codex recommends BL1 and web profile |
| B04 | new industrial web app with selected web pack | exact BL2 selection enters plan |
| B05 | BL2 without concrete industrial pack | blocked/pending, never downgraded silently |
| B06 | unknown platform | one plain clarification, no guessed install |
| B07 | selected pack does not exist | fail before first write |
| B08 | selected pack is draft | installed status reports draft truthfully |
| B09 | generated selection content changed after approval | apply fails before first write |
| B10 | legacy baseline direct apply attempted | no target write; controlled route shown |
| B11 | existing stricter project baseline | preserved |
| B12 | existing weaker/missing rule | selected bounded gap action recommended |
| B13 | existing conflicting high-risk rule | human-owned decision, no silent overwrite |
| B14 | successful baseline apply | receipt and installed baseline check pass |
| M01 | current manifest validates against schema | pass |
| M02 | unknown manifest group/property | fail |
| M03 | exact duplicate target | fail |
| M04 | conflicting target mapping | fail |
| M05 | redundant directory/child copy mapping | fail |
| M06 | normalized manifest initializes temp project | all expected assets exist |
| P01 | source-only setup instructions | real GitHub repository used |
| P02 | beginner provides only project goal | Codex selects technical route |
| P03 | public output | no requirement to understand BL/profile/pack IDs |
| P04 | read-only start/adopt/doctor/next | no hidden write |
| P05 | full repository verification | pass |

## 11. Verification Commands

```bash
node scripts/check-baseline-enforcement.mjs <fixture>
node scripts/check-platform-baseline.mjs <fixture>
node scripts/check-standard-baseline-pack.mjs <fixture>
node scripts/check-industrial-baseline.mjs <fixture> --bl2-only
node scripts/check-baseline-installation.mjs <fixture> --require-selection
node scripts/check-manifest.mjs
node scripts/check-intentos.mjs --mode full
npm run verify:syntax
npm run verify
npm run verify:release
node scripts/check-product-baseline.mjs
node scripts/check-claim-control.mjs
git diff --check
```

The implementation must also run isolated negative fixtures for B01-B14 and
M02-M05 and initialize a temporary generated project from the normalized
manifest.

## 12. Release Evidence

Create:

- `releases/1.94.0/release-record.md`
- `releases/1.94.0/known-limitations.md`
- `releases/1.94.0/self-check-report.md`

Allowed claim: IntentOS can derive, plan, install, and verify a concrete
project baseline through the controlled apply chain, while preserving stricter
existing-project rules and validating its distributable manifest as a single
source of truth.

Forbidden claim: every baseline pack is production-certified, baseline setup
guarantees product correctness, or IntentOS may overwrite project authority or
perform high-risk project/release actions without bounded approval.

## 13. Completion Criteria

1. Canonical BL levels produce consistent results across public and internal
   resolvers.
2. Managed `.intentos` content cannot classify the host project.
3. A new-project controlled plan contains exact selected baseline identity and
   generated baseline records.
4. BL2 cannot pass without concrete selected and installed industrial packs.
5. Existing-project baseline reconciliation preserves the stricter valid rule
   and never performs an unreviewed overwrite.
6. Direct legacy baseline apply cannot write target files.
7. Manifest content passes real strict schema validation.
8. Obsolete groups and redundant copy rules are removed and guarded against.
9. Generated-project E2E proves no asset loss after manifest normalization.
10. Public entry uses the real repository and keeps technical selection inside
    Codex.
11. Full verification, release verification, claim control, and diff checks
    pass.

