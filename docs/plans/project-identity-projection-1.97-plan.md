# IntentOS 1.97 Project Identity Projection Execution And Acceptance Plan

## 1. Purpose

IntentOS 1.95 established one Operating State and 1.96 established one
structured Operating Decision. Those views still consume several different
project descriptions:

- Workflow Next classifies bootstrap, governance, production, and worktree
  state;
- Workflow Guidance describes the project for task routing;
- platform and baseline checks describe selected engineering context;
- Evidence Authority binds evidence to a Git or non-Git project identity.

These descriptions are valid for their own purposes, but the Operating Model
does not yet expose one stable account of which project it is reasoning about.
1.97 adds a read-only Project Identity Projection inside the existing
`INTENTOS_OPERATING_STATE`.

The projection answers:

- whether this is a new, existing, IntentOS-source, or unknown project;
- how much project-owned governance was observed;
- whether production-sensitive evidence was observed;
- whether the current worktree is clean, dirty, or unavailable;
- which IntentOS, baseline, and platform states apply;
- which evidence identity binds the current project and revision;
- which current source inputs produced the projection;
- which changes invalidate the projection.

## 2. Architectural Position

Project Identity Projection is a computed view:

```text
Workflow Next + Workflow Guidance + Evidence Authority + current Git state
-> Project Identity Projection
-> Operating State and Operating Decision binding
-> beginner project summary
```

It is not:

- a project profile document;
- an onboarding decision;
- an adoption state machine;
- an evidence authority replacement;
- an approval or write permission;
- a platform or baseline selector;
- a new public command or persisted report.

Evidence Authority keeps responsibility for project/revision identity used by
strict evidence checks. Project Identity Projection only includes that identity
as a security binding; it does not reinterpret or replace it.

## 3. Scope

1.97 includes:

- `projectIdentityProjection` in every successful `work --json` response;
- canonical project, governance, production, worktree, IntentOS, baseline, and
  platform postures;
- a current Git/non-Git evidence identity binding;
- source-input semantic digests and a stable projection digest;
- conflict and confidence reporting;
- Operating Decision digest binding to the current projection;
- one plain-language project summary in the default human output;
- generated-project, CI, documentation, manifest, release, and regression
  coverage.

1.97 does not include:

- a `project-identity` CLI command;
- a `project-identity-reports/` directory;
- automatic edits to `docs/project-profile.md`;
- automatic profile, baseline, adoption-depth, or industrial-pack selection;
- automatic project-owner resolution;
- implementation, apply, migration, release, or production authority;
- removal of existing project classifiers.

## 4. Contract

Every successful Operating State contains:

```json
{
  "projectIdentityProjection": {
    "contractVersion": "1.97.0",
    "derivedOnly": "Yes",
    "grantsAuthority": "No",
    "projectKind": "EXISTING_PROJECT",
    "entryState": "PRODUCTION_SENSITIVE_ENTRY",
    "governancePosture": "PRODUCTION_GOVERNED",
    "productionPosture": "PRODUCTION_SENSITIVE",
    "worktreePosture": "CLEAN",
    "intentosPosture": {
      "workflowState": "NOT_BOOTSTRAPPED",
      "versionState": "NO_VERSION_FILE",
      "operatingMode": "ACTIVE",
      "adoptionMode": "READ_ONLY",
      "assetMigrationDepth": "ADAPTER_ONLY"
    },
    "baselinePosture": {
      "onboardingState": "NOT_APPLICABLE",
      "platformBaselineState": "NOT_APPLICABLE",
      "industrialBaselineState": "NOT_APPLICABLE",
      "baselineLevel": "NOT_SELECTED",
      "selectedProfiles": [],
      "selectedIndustrialPacks": []
    },
    "evidenceIdentity": {
      "kind": "GIT",
      "fingerprint": "sha256:...",
      "revision": "..."
    },
    "observedSignals": {
      "governanceSignalCount": 10,
      "productionSignalCount": 4,
      "governanceRefs": [],
      "productionRefs": []
    },
    "projectionStatus": "CURRENT",
    "confidence": "HIGH",
    "conflicts": [],
    "sourceInputs": [],
    "projectionDigest": "sha256:...",
    "invalidationConditions": []
  }
}
```

Required invariants:

- the projection is derived in the current invocation;
- it never grants authority or write permission;
- Evidence Authority supplies `evidenceIdentity` unchanged;
- source inputs only refer to current source reads or current in-process
  identity/Git observations;
- raw remote URLs and changed-file names are not exposed by the projection;
- `projectionDigest` excludes timestamps, absolute paths, localized prose, and
  volatile display-only fields;
- conflicts remain visible and reduce confidence;
- a required project-source failure cannot produce a high-confidence current
  projection;
- no projection field replaces a stricter project-owned rule.

## 5. Canonical Vocabulary

### 5.1 Project Kind

- `NEW_PROJECT`
- `EXISTING_PROJECT`
- `INTENTOS_SOURCE`
- `UNKNOWN_PROJECT`

### 5.2 Governance Posture

- `NOT_ESTABLISHED`
- `LIGHT_GOVERNANCE`
- `GOVERNED`
- `PRODUCTION_GOVERNED`
- `INTENTOS_SOURCE_GOVERNANCE`
- `UNKNOWN`

This posture describes observed project evidence. It does not score the quality
of the governance or authorize IntentOS to replace it.

### 5.3 Production Posture

- `PRODUCTION_SENSITIVE`
- `NO_PRODUCTION_EVIDENCE`
- `NOT_ESTABLISHED`
- `NOT_APPLICABLE`
- `UNKNOWN`

`NO_PRODUCTION_EVIDENCE` means that the current bounded read did not observe a
production signal. It must never be presented as proof that the project is not
in production.

### 5.4 Worktree Posture

- `CLEAN`
- `DIRTY`
- `NON_GIT`
- `UNKNOWN`

## 6. Derivation Rules

The projection derives project kind from Project Entry, not from task wording.
Natural-language business nouns must not change project identity.

Governance and production postures use Workflow Next's current observed signal
sets. IntentOS-managed assets do not count as project-owned production signals.

Worktree posture uses the current project-local Git observation. It does not
expose changed filenames and does not discard or rewrite dirty work.

Baseline and platform posture reuses Workflow Next's structured states. 1.97
may expose already selected profiles but cannot select or approve them.

Evidence identity comes directly from `projectIdentity(projectRoot)` in
Evidence Authority. The projection must not calculate a competing fingerprint.

## 7. Conflict And Confidence Rules

Projection status:

- `CURRENT`: required sources were read and no material identity conflict was
  observed;
- `CONFLICTED`: source descriptions disagree on project kind, governance, or
  production posture;
- `BLOCKED_BY_SOURCE_READ`: a required project source failed;
- `UNKNOWN`: the project does not provide enough evidence for a safe identity
  projection.

Confidence:

- `HIGH`: current sources agree and evidence identity is available;
- `MEDIUM`: the bounded read supports a project kind but governance or platform
  posture remains incomplete;
- `LOW`: sources conflict, fail, or leave the project kind unknown.

Conflicts are explanatory only. The projection does not resolve conflicts by
overriding Workflow Next, Workflow Guidance, Evidence Authority, project-owned
rules, or human approval.

## 8. Operating Decision Binding

Operating Decision keeps its 1.96 action vocabulary and precedence. 1.97 adds
the current `projectionDigest` to the decision digest.

Consequences:

- an old decision becomes stale when the project identity projection changes;
- a decision from another project cannot be treated as the same current
  operating decision;
- the projection does not itself authorize the selected action;
- a production-sensitive projection preserves the current production-aware
  review path without automatically classifying every task as HIGH.

## 9. Beginner Experience

Default human output adds one line:

```text
项目识别: 这是一个已有项目，已观察到生产相关治理；后续必须保留项目原有权威。
```

The summary is rendered from the same projection as JSON. It must avoid asking
the user to interpret enum values, Git hashes, profiles, BL levels, or internal
commands.

The user is not asked to confirm facts that Codex can read from the project.
Only unresolved product, ownership, or material-risk decisions may be escalated.

## 10. Implementation Work Packages

### WP1 - Projection Core

- derive the projection inside the current Operating Model;
- reuse Evidence Authority for project identity;
- reuse current Git and Workflow Next observations;
- add canonical posture and conflict rules;
- calculate a stable projection digest.

### WP2 - Operating Integration

- include the projection in Operating State;
- bind Operating Decision digest to the projection;
- add the plain-language project summary;
- preserve all 1.96 no-authority boundaries.

### WP3 - Structured Source Coverage

- expose selected platform profiles from Workflow Next as structured source
  data instead of parsing human notes;
- keep profile selection and baseline approval outside this projection;
- keep generated-project behavior compatible.

### WP4 - Product And Distribution Integration

- update CLI wording, operating-model docs, README, version records, manifest,
  CI smoke checks, and release records;
- do not add a public command or persistent artifact family.

### WP5 - Verification And Close-Out

- add positive and conflict-oriented test scenarios;
- update IntentOS self-check markers;
- run syntax, manifest, claim-control, product-baseline, operating-model,
  generated-project, and full verification surfaces.

## 11. Acceptance Matrix

| ID | Scenario | Expected projection |
|---|---|---|
| P01 | empty target | `NEW_PROJECT / NOT_ESTABLISHED` |
| P02 | existing light project | `EXISTING_PROJECT / LIGHT_GOVERNANCE` |
| P03 | governed existing project | `EXISTING_PROJECT / GOVERNED` |
| P04 | production-governed project | `EXISTING_PROJECT / PRODUCTION_GOVERNED / PRODUCTION_SENSITIVE` |
| P05 | dirty Git worktree | `worktreePosture = DIRTY` without changed filenames in projection |
| P06 | IntentOS source repository | `INTENTOS_SOURCE / INTENTOS_SOURCE_GOVERNANCE` |
| P07 | non-Git project | Evidence Authority reports `NON_GIT`; projection remains read-only |
| P08 | repeated unchanged read | stable `projectionDigest` and decision digest |
| P09 | current identity or project posture changes | projection or decision digest changes |
| P10 | source failure or conflict | low-confidence fail-closed projection |
| P11 | BL2 project with LOW task | project posture remains industrial while task impact remains LOW |
| P12 | default human output | one plain project summary; no enum selection burden |
| P13 | generated target | copied Operating Model runs with all required dependencies |
| P14 | no-authority regression | no implementation/apply/release/production permission |

## 12. Verification Commands

At minimum:

```bash
node --check scripts/resolve-operating-loop.mjs
node --check scripts/workflow-next.mjs
node --test tests/operating-model.test.mjs
node scripts/check-manifest.mjs
node scripts/check-product-baseline.mjs .
node scripts/check-claim-control.mjs .
node scripts/check-intentos.mjs
npm run verify
git diff --check
```

Repository-only checks do not prove a real provider, runtime, user journey, or
production state. Release evidence must state that limitation.

## 13. Release Evidence

1.97 release records must state:

- the projection is read-only and derived;
- Evidence Authority remains authoritative for project/revision binding;
- no new command, artifact family, approval, or execution authority exists;
- project identity facts are read by Codex instead of delegated to a beginner;
- production posture is evidence-bounded, not proof of production absence;
- tests and self-check results;
- repository-only limitations.

## 14. Completion Criteria

1.97 is complete only when:

- every successful `work --json` output has one valid projection;
- the projection and beginner summary use the same derived facts;
- the Operating Decision digest binds the projection;
- new, existing, governed, production-sensitive, dirty, source, and non-Git
  scenarios are covered;
- selected profiles come from structured source output;
- no project file is written by `work`;
- no new public command or persistent project-identity artifact exists;
- version, manifest, README, generated-project assets, CI, release records, and
  self-check agree on `1.97.0`;
- full verification passes.

## 15. Next Release Boundary

Internal command and source-system surface consolidation belongs to 1.98.
1.97 must not remove lower-level commands, merge source-system responsibilities,
or make Project Identity Projection a new control plane.
