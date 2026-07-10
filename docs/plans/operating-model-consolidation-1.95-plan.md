# IntentOS 1.95 Operating Model Consolidation Execution And Acceptance Plan

## 1. Purpose

IntentOS 1.90-1.94 established execution truth, evidence authority, controlled
apply, release trust, baseline truth, and manifest authority. The remaining
system risk is not missing governance. It is that entry, evidence, authority,
closure, release, and adoption are individually correct but can still appear
to users and Codex as separate systems.

1.95 consolidates those systems into one derived operating model:

```text
natural-language goal
-> Project Entry
-> one current Operating Loop operation
-> existing task/release/adoption systems run as inputs
-> one Evidence Trace
-> one Authority Recommendation
-> one plain next action
```

The user is not expected to choose an artifact, checker, BL label, lifecycle
module, approval type, or internal command.

## 2. Architectural Position

1.95 is a consolidation release. It does not add a new governance authority,
evidence authority, approval engine, task state machine, closure system, or
release system.

The model has three levels:

```text
Level 0 - existing source systems
  project reading, workflow guidance, task governance, business rules,
  impact, verification, evidence, closure, adoption, release

Level 1 - derived Operating State
  Project Entry + current operation + Evidence Trace + Authority Recommendation

Level 2 - beginner output
  what IntentOS understood, what it can do now, one decision if needed,
  and one next safe action
```

Level 1 is read-only. It consumes Level 0 and cannot drive or override it.

## 3. Project Entry Model

Adoption is treated as a project-entry route rather than a later lifecycle
stage.

Canonical entry states:

- `NEW_PROJECT_ENTRY`
- `EXISTING_PROJECT_ENTRY`
- `GOVERNED_PROJECT_ENTRY`
- `PRODUCTION_SENSITIVE_ENTRY`
- `INTENTOS_SOURCE_ENTRY`
- `UNKNOWN_PROJECT_ENTRY`

New and existing projects enter the same task lifecycle after entry. Existing
projects retain rule reconciliation and controlled migration requirements,
but they do not receive a separate day-to-day task lifecycle.

Project Entry does not authorize initialization, adoption writes, baseline
replacement, CI changes, release changes, or runtime changes.

## 4. Operating Loop Model

The public operating loop has six user meanings:

- `START_PROJECT`
- `CONTINUE_TASK`
- `CHECK_STATUS`
- `FINISH_TASK`
- `PREPARE_RELEASE`
- `ADOPT_PROJECT`

These are user-facing meanings, not new workflow engines. Each operation maps
to existing source systems.

| Operation | Existing source systems |
|---|---|
| `START_PROJECT` | Beginner Entry, Workflow Guidance, baseline recommendation |
| `CONTINUE_TASK` | Workflow Guidance, Work Queue, Task Governance, Review Surface |
| `CHECK_STATUS` | User Delivery Console, Task Governance, recorded evidence |
| `FINISH_TASK` | Unified Closure, Completion Evidence, Execution Assurance |
| `PREPARE_RELEASE` | Release Guide, Release Plan, Release Evidence, Release Approval |
| `ADOPT_PROJECT` | Adoption Autopilot, Native Migration, Rule Reconciliation, Convergence |

The resolver must not execute implementation, apply, release, production,
migration, hook, CI, secret, payment, permission, data, or provider actions.

## 5. Operating State Contract

One operating-state response contains:

- current Project Entry state;
- selected Operating Loop operation;
- task impact when task work is involved;
- lifecycle phase;
- current plain state;
- Evidence Trace;
- Authority Recommendation;
- internal source-system trace;
- one next safe action;
- at most one material user decision by default;
- explicit no-authority boundaries.

The state is computed for the current invocation. It is not persisted as a new
artifact and is not a new source of truth.

## 6. Evidence Trace

Evidence Trace is a derived view over existing evidence. It must not introduce
an `evidence-graph-reports/` directory or another required task artifact.

The trace records:

- source system;
- current outcome;
- source ref when available;
- relationship to the current operation;
- whether the source was read in the current invocation;
- whether a required source is missing or blocking;
- invalidation conditions.

Canonical invalidation conditions include:

- project or Git revision changed;
- task or intent changed;
- referenced source digest changed;
- required evidence was removed;
- authority or approval expired;
- target diff changed after review;
- release candidate or package identity changed.

`CURRENT_RUN` means that the resolver read the source now. It does not mean the
source artifact passed its strict checker unless the source-system result says
so. Missing or unverified evidence must remain visible.

## 7. Authority Recommendation

Authority Recommendation answers who should decide the current material
action. It is not an approval and cannot create an owner.

Possible recommended authority roles include:

- `PROJECT_OWNER`
- `TASK_SCOPE_OWNER`
- `DOMAIN_OWNER`
- `DATA_OWNER`
- `SECURITY_OWNER`
- `RELEASE_OWNER`
- `PRODUCTION_OWNER`
- `COMPLIANCE_OWNER`
- `EXTERNAL_SYSTEM_OWNER`

The recommendation is derived from the selected operation, Task Governance
impact, detected risk surfaces, project-owned rules, and existing structured
approval evidence.

Rules:

- read-only orientation needs no write approval;
- implementation scope remains task/project owned;
- permission and security changes require the relevant domain/security owner;
- data and migration changes require the data/production owner;
- release requires a current structured human Release Approval Record;
- production and external-provider actions remain human or external-system
  owned;
- unknown or conflicting authority blocks the material action and asks one
  plain owner question;
- the recommendation never changes project authority.

## 8. Baseline And Task Governance Invariant

Project Baseline and Task Governance remain separate:

```text
Project Baseline = project-wide engineering defaults and available controls
Task Governance = current task risk and required process depth
```

BL2 must not automatically classify every task as HIGH. A BL2 project may use
lightweight handling for a genuinely LOW task, while still applying any
project-wide baseline control that is relevant to that task.

Task risk may raise process depth above the project default. It must not lower
or bypass a stricter applicable project-owned rule.

## 9. Verification / Evidence / Execution Assurance Invariant

Responsibilities remain distinct:

```text
Verification Plan   -> what must be proved
Test Evidence       -> what was actually proved
Execution Assurance -> whether execution matched intent, plan, diff, review,
                       and authoritative evidence bindings
```

Execution Assurance may validate the identity and required presence of Test
Evidence. It must not become a second test-quality evaluator or redesign the
Verification Plan.

## 10. Public Entry Consolidation

Add one public natural-language command:

```bash
node scripts/cli.mjs work <project> "<plain-language goal>"
```

Default CLI help shows only the six user meanings through `work`, plus a plain
status entry. Existing lower-level commands remain supported and appear under
explicit advanced help for maintainers, CI, debugging, and exact evidence
references.

The default user output must not ask the user to select:

- `ask`, `guide`, `task-governance`, `business-rule`, `impact-coverage`,
  `verification-plan`, `completion-evidence`, or `execution-assurance`;
- an evidence schema or checker flag;
- an authority enum or approval artifact type;
- an adoption depth, profile ID, BL level, or pack ID.

## 11. Compatibility

Existing commands, artifacts, schemas, checkers, CI references, release
records, and generated-project assets remain supported.

1.95 does not silently rewrite historical artifacts. The new operating model
is a view over current source systems. Lower-level commands remain the exact
debug and CI surface.

## 12. Implementation Work Packages

### WP1 - Operating Model Core

- add the Project Entry and six-operation classifier;
- consume current workflow guidance and task governance;
- route status, finish, release, and adoption through existing resolvers;
- keep the output read-only and fail closed when a required source fails.

### WP2 - Evidence And Authority Views

- derive a source-system trace from current resolver outputs;
- expose missing, blocking, current-run, and invalidation information;
- derive authority roles without granting approval;
- keep strict source systems authoritative.

### WP3 - Public CLI And Documentation

- add `work` as the default natural-language operating entry;
- reduce default help to the beginner surface;
- move the complete command inventory behind advanced help;
- document Project Entry and the shared task lifecycle;
- update quickstart, operator, maintainer, and reference docs.

### WP4 - Distribution And Release

- install the operating model docs and resolver through the manifest;
- update managed workflow-version assets;
- add generated-project and old-project smoke coverage;
- publish 1.95 release evidence and exact limitations.

## 13. Acceptance Matrix

| ID | Scenario | Expected result |
|---|---|---|
| O01 | new empty target + product goal | `NEW_PROJECT_ENTRY` + `START_PROJECT` |
| O02 | existing project + normal task | existing entry + `CONTINUE_TASK` |
| O03 | existing project + adoption intent | `ADOPT_PROJECT`; no writes |
| O04 | status question | `CHECK_STATUS`; current evidence remains visible |
| O05 | finish question without completion evidence | `FINISH_TASK`; not done |
| O06 | release intent | `PREPARE_RELEASE`; Release Owner recommended |
| O07 | permission/security task | HIGH/POSSIBLE_HIGH and relevant owner recommendation |
| O08 | low-risk text task in BL2 project | LOW remains possible; BL2 does not force HIGH |
| O09 | dirty worktree | current work/scope review blocks unrelated continuation |
| O10 | source resolver failure | operating state is blocked, not fabricated |
| O11 | user output | no internal command selection requested |
| O12 | default CLI help | only beginner operating surface shown |
| O13 | advanced CLI help | complete lower-level command surface remains available |
| O14 | resolver invocation | no target files changed |
| O15 | Evidence Trace | source status and invalidation conditions visible |
| O16 | Authority Recommendation | recommendation explicitly non-authorizing |
| O17 | generated project | installed resolver and docs execute successfully |
| O18 | full repository verification | pass |

## 14. Negative Tests

The implementation must reject or safely block:

- an empty goal being treated as permission to work;
- release wording being treated as release approval;
- an Authority Recommendation being treated as an Approval Record;
- a source-system failure being hidden by a positive summary;
- missing completion evidence being reported as done;
- dirty unrelated changes being ignored;
- BL2 being used as a blanket HIGH task classification;
- a technical trace being shown as user-required choices;
- `work` writing output or target-project files;
- removal or behavior breakage of existing lower-level commands.

## 15. Verification Commands

```bash
node --test tests/operating-model.test.mjs
node scripts/cli.mjs work . "检查当前项目状态" --json
node scripts/cli.mjs --help
node scripts/cli.mjs --help-advanced
node scripts/check-manifest.mjs
npm run verify:syntax
npm run verify
npm run verify:release
node scripts/check-product-baseline.mjs .
node scripts/check-claim-control.mjs .
git diff --check
```

## 16. Release Evidence

Create:

- `releases/1.95.0/release-record.md`
- `releases/1.95.0/known-limitations.md`
- `releases/1.95.0/self-check-report.md`

Allowed claim: IntentOS can turn one natural-language project goal into one
read-only operating state that exposes project entry, lifecycle operation,
evidence trace, authority recommendation, and one safe next action while
preserving all existing source-system authority.

Forbidden claim: the Operating State approves implementation, apply, release,
production, ownership, or proves product correctness.
