# IntentOS 1.98 Execution And Distribution Trust Hardcut Plan

## 1. Purpose

IntentOS 1.95-1.97 consolidated project entry, operating decisions, and project
identity into one read-only operating view. The 1.97 full-system audit found
that several lower-level governance systems are individually present but are
not always mandatory inputs to the public operating loop, controlled apply,
baseline activation, generated-project distribution, or release consumers.

1.98 is a hardcut release. It does not add another workflow layer. It makes the
existing authoritative systems fail closed at the consumers that claim work is
ready, complete, applied, industrial, installed, or ready for release review.

The release closes four trust boundaries:

1. Operating Entry and task-chain enforcement;
2. Evidence Authority and Release Trust enforcement;
3. atomic controlled apply and persistent adoption activation;
4. baseline semantics and generated-project distribution parity.

## 2. Non-Negotiable Invariants

- One public `work` request cannot bypass a current Work Queue conflict,
  discussion-only stop, paused-task resume review, task classification,
  required plan review, or completion evidence.
- A strict checker cannot pass because no report exists, because `--allow-empty`
  was also supplied, or because the target project replaced a local schema.
- Evidence used for completion or release must resolve inside the project,
  reject traversal and symlink escape, and bind every consumed file digest.
- Plan generation cannot overwrite arbitrary project files.
- Controlled apply either completes the approved graph and records a valid
  receipt, or restores every attempted write including the current failed
  action and activation-side writes.
- Readiness and activation are semantic states, not nonempty strings.
- BL2 cannot become ready without valid selected industrial-pack evidence.
- A pack cannot be selected for a profile to which it does not apply.
- Generated projects receive every command and dependency advertised by their
  installed CLI and verification scripts.
- Release review cannot be unlocked by an empty directory, self-reduced
  requirement list, external evidence file, unbound approval, or incompatible
  package identity vocabulary.

## 3. Scope

### 3.1 Work Package A: Operating Entry Enforcement

- expand natural-language operation routing to cover every published EN/ZH
  example;
- add explicit discussion-only, task-resume, and task-switch routing;
- consume and validate Work Queue whenever queue artifacts exist;
- propagate nested source failures and blocking outcomes into Operating State;
- default unknown code behavior to `POSSIBLE_HIGH`, not LOW;
- make UNKNOWN business rules remain open;
- require strict Completion Evidence and task binding before public completion;
- keep low-impact non-code work lightweight without weakening code tasks.

### 3.2 Work Package B: Evidence And Release Authority

- pin schema loading to the trusted IntentOS source or verify installed schema
  and checker digests;
- reject strict-plus-allow-empty contradictions;
- use project-contained authoritative reference resolution for every consumed
  completion and release artifact;
- bind all Execution Assurance evidence references, not only source systems;
- require independently supplied current-task identity;
- propagate Evidence Authority into nested Completion Evidence checks;
- derive release requirement matrices from the trusted resolver, not the
  report being checked;
- require Launch Review View, Release Evidence, Runtime Hygiene, Channel Policy,
  candidate identity, and structured approval as separate current inputs;
- normalize package identity vocabulary across release artifacts.

### 3.3 Work Package C: Atomic Apply And Adoption Activation

- constrain plan outputs to dedicated project-local plan directories;
- reject traversal, absolute paths, symlinks, protected targets, and silent
  overwrite for plan-only output;
- bind approved plans to a complete worktree/source-state digest;
- validate all readiness preconditions, classifications, rollback, and outcome
  fields in the executor itself;
- record an action as attempted before its first material write;
- use atomic same-directory replacement where possible;
- rollback the current failed action and every activation-side write;
- verify only recognized ready activation states and the installed IntentOS
  version/source identity;
- make later Workflow Next reads revalidate receipt-backed activation;
- route unsupported 1.x migration requests to the controlled update/adoption
  path instead of advertising an unusable migration.

### 3.4 Work Package D: Baseline And Distribution Parity

- enforce pack/profile applicability, conflicts, BL level, and maturity;
- keep evidence-required draft packs pending until project evidence is valid;
- require strict industrial baseline validation before BL2 readiness;
- include environment baseline actions in controlled onboarding;
- exclude every manifest-managed target from project/platform/risk detection;
- distinguish Web frontends from CLI, worker, library, and backend-only Node
  packages;
- install all CLI dependencies, docs, schemas, directories, and release-channel
  assets required by generated projects;
- test source and generated CLI help/version/path parity;
- remove contradictory beginner entry guidance and keep EN/ZH public examples
  executable as contract tests.

## 4. Explicit Non-Goals

1.98 does not:

- execute a production deployment, store submission, rollback, migration,
  secret change, DNS change, payment action, or permission change;
- make human approval cryptographically real when no external authority exists;
- replace stricter project-owned CI, release, runtime, business, or compliance
  authority;
- add a new public command or artifact family;
- treat a passing repository-only test as production proof;
- preserve fail-open compatibility for invalid strict evidence.

## 5. Compatibility Policy

- Advisory checks may continue to return `SKIP` when no report exists and no
  strict requirement was requested.
- Any `--require-*`, `--strict*`, ready, completion, apply, activation, BL2, or
  release-review claim is fail closed.
- Legacy reports may be read for diagnostics but cannot satisfy new strict
  readiness without current authoritative bindings.
- Existing projects keep stricter valid rules. Invalid or ambiguous legacy
  governance is reported and reconciled rather than silently preserved.

## 6. Acceptance Matrix

| ID | Scenario | Required result |
|---|---|---|
| T01 | Published EN new-project request | `START_PROJECT` |
| T02 | Published ZH existing-project adoption request | `ADOPT_PROJECT` |
| T03 | Discussion-only request | no implementation-review action |
| T04 | Queue has two CURRENT tasks | fail closed |
| T05 | Resume non-PAUSED task with fabricated review | fail closed |
| T06 | Unknown code/crash request | `POSSIBLE_HIGH` pending inspection |
| T07 | UNKNOWN business rule | questions/open dimensions remain |
| T08 | Finish with free text and legacy closure only | not done |
| T09 | Finish with strict current Completion Evidence | ready to report only |
| E01 | Installed schema is replaced | strict checker fails authority |
| E02 | `--require-* --allow-empty` with no reports | fail |
| E03 | Evidence path uses `../` or escaping symlink | fail |
| E04 | Bound evidence changes after report creation | fail |
| E05 | Wrong-task but internally coherent chain | fail |
| A01 | `--write-plan AGENTS.md` or absolute path | fail without write |
| A02 | readiness outcome is BLOCKED | apply cannot start |
| A03 | write fails after backup/current mutation | full rollback |
| A04 | activation returns migration/update action | not verified |
| A05 | target changes after approval | plan invalidated |
| B01 | Web profile selects Android pack | fail |
| B02 | BL2 lacks industrial requirement evidence | not ready |
| B03 | BL1 controlled plan | engineering and environment baselines included |
| B04 | backend/CLI Node package | not classified as Web frontend |
| D01 | generated `release-channel` | command runs without missing module |
| D02 | generated help/version/docs | installed paths and IntentOS version agree |
| R01 | release evidence requirement list is reduced | fail |
| R02 | approval exists but Launch Review is absent | fail |
| R03 | release tag has no trust artifacts | release trust gate does not claim ready |
| R04 | package identity uses incompatible/none bypass | fail when target requires identity |

## 7. Verification Strategy

Verification must include:

```bash
node --test tests/operating-model.test.mjs
node --test tests/manifest-authority.test.mjs
node --test tests/execution-distribution-trust.test.mjs
node scripts/check-manifest.mjs
node scripts/check-intentos.mjs
npm run verify
git diff --check
```

Tests must use disposable projects for write and rollback scenarios. No test may
modify the repository worktree, production systems, external providers, or
user projects.

## 8. Review And Close-Out

The release is complete only when:

- every acceptance row has a positive or negative executable assertion;
- source and generated-project verification both pass;
- a second review confirms that strict consumers cannot be weakened by flags,
  local schemas, report-authored requirements, or unbound evidence;
- controlled apply failure leaves no unapproved or residual target write;
- version, README, manifest, package, CI, release record, self-check report, and
  known limitations agree on `1.98.0`;
- repository-only evidence is described as repository evidence, not production
  proof.

## 9. Delivery Sequence

1. harden shared authority, path, Git/source-state, and task-entry libraries;
2. integrate authoritative sources into the public operating loop;
3. harden completion and release consumers;
4. harden controlled plan/apply/activation;
5. harden baseline selection and generated distribution;
6. add adversarial fixtures and end-to-end tests;
7. update public/version/release assets;
8. run full verification and independent review.
