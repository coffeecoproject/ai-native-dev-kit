# Project Entry And Behavior-Complete Adoption Trust Hardcut 1.109 Execution And Acceptance Plan

## Status

Proposed execution and acceptance plan.

Document architecture, cross-project calibration abstraction, IntentOS
principles review, and acceptance-surface design have completed an initial
read-only review. The design abstracts three materially different
existing-project conditions and one blank new-project target without importing
any project-specific fact into the core. These observations are design inputs,
not current acceptance evidence.

This plan is stable input to the Phase 0 gate. Production implementation remains
blocked unless one current Work Queue item, `HIGH` Task Governance, an exact
Change Boundary, a current Review Surface Card, a current Verification Plan,
and a digest-bound Plan Review report independently reach
`PLAN_REVIEW_PASSED`. The evidence artifacts, rather than a mutable status line
in this plan, carry the live gate result.

This document does not authorize implementation, target-project writes,
initialization, migration, controlled apply, CI or hook changes, release,
production access, or version release.

## Theme

IntentOS 1.109 closes the project-entry, new-project setup, existing-project
adoption, current-work continuity, and behavioral-activation trust chain.

It answers one system-level question:

```text
Before IntentOS routes work, creates a new project, recommends adoption, applies
workflow assets, resumes current work, or accepts an adoption claim, has it
proven that the target topology and project identity are genuine, the original
goal and current project facts are preserved, the lifecycle stage is
evidence-backed, every public entry sees the same facts, the effective guidance
is valid, project authority was read completely, every consumed report is
current and strictly verified, and the behavioral activation result means what
it says?
```

## Why This Is A Hardcut

The current architecture has mature components for project identity, Review
Context Authority, native migration, rule reconciliation, controlled apply,
receipts, activation verification, and Adoption Assurance.

The remaining problem is not a missing component. It is incomplete enforcement
between components.

A checker can detect a problem while a public entry continues. A report can
exist without being a verified current authority source. A project can contain
more governance sources than a resolver scans. A pending baseline can return a
successful process code and later appear as verified activation. A direct-init
escape hatch can bypass the controlled apply chain.

These are one class of defect:

```text
trust signal exists -> strict consumer does not enforce it -> downstream state
looks safer than the evidence allows
```

Therefore 1.109 must change the shared trust contract and all relevant
consumers together. It must not add local exceptions around individual
fixtures.

## Cross-Project Calibration Findings

Read-only calibration covered multiple existing-project conditions and a blank
new-project target. The calibrated conditions included frontend-led
development, mixed platform and backend completion, strong but partially
enforced project governance, legacy workflow assets, current-work and project
fact conflicts, and an empty target with no installed project identity.

At plan-revision time, these observations are non-authoritative design inputs.
They do not satisfy Plan Review, implementation acceptance, or release claims.
Phase 0 must replace them with
`calibration-reports/project-entry-adoption-1.109.json`, a source-only generic
calibration report validated by
`schemas/artifacts/project-entry-calibration.schema.json` and
`scripts/check-project-entry-calibration.mjs`. It records fixture IDs,
observation dimensions, commands, exit codes, output digests, repository state,
target unchanged evidence, and source-tree unchanged evidence. Only that
current digest-bound report may support implementation or acceptance claims.

These are calibration conditions, not project types. IntentOS does not route by
an enumerated label such as frontend project, Web project, iOS project, or mini
program project. One repository may contain several of those conditions at
once. Routing consumes the orthogonal project facts defined by this plan.

The observed failure classes are generic:

| Failure class | Unsafe result | 1.109 correction |
|---|---|---|
| Release vocabulary is treated as deployment proof | A development project is classified as production-sensitive or production-active | Separate lifecycle stage from risk vocabulary and require current deployment evidence |
| Governance files are treated as installation proof | A project with no installed IntentOS identity is called partially bootstrapped | Keep identity state independent from governance authority posture |
| Entry commands rediscover facts independently | `start`, `baseline`, adoption review, and assurance disagree about baselines, work queue, CI, or project stage | Use one shared project-fact projection and one digest |
| Fixed source and rule limits remain hidden | A large repository appears reconciled after only a sample was read | Require paged complete accounting and visible incomplete state |
| A no-write result cannot feed the next resolver | Same-run migration and reconciliation disagree unless an intermediate file is written | Add a digest-bound in-memory evidence chain |
| Hosted CI absence is treated as adoption failure | A project with strong local gates cannot reach behavioral adoption | Keep behavioral adoption separate from release readiness |
| Strong project governance defaults to adapter-only forever | IntentOS never becomes the daily operating workflow | Recommend behavior-complete adoption with a selected overlay when evidence allows |
| Technical uncertainty is returned to the user | A zero-experience user is asked to choose migration depth, baseline, parser, or write scope | Codex derives the technical route and asks only for a missing business fact or exact real-world consent |
| Legacy workflow assets are treated as current identity | Copied historical assets appear to prove current IntentOS installation or create two active workflows | Inventory legacy assets as migration evidence, establish one current identity and entry, and retire duplicate authority only through controlled apply |
| Current work and dirty changes are treated as an adoption failure | Assessment stops, in-flight work is lost, or the user must reconstruct technical progress | Continue read-only assessment, derive work ownership, preserve current work, and block only unsafe overlapping writes |
| Local fact conflict becomes a global blocker | One platform configuration or task-state conflict prevents all behavioral adoption | Type every conflict by affected scope and block only dependent actions unless identity, Guidance, or adoption trust is affected |
| Placeholder governance is treated as effective authority | Empty baseline templates or smoke-only declarations appear to prove governance | Classify structural authority posture without claiming control effectiveness; leave bounded effectiveness proof to 1.110 |
| A blank target receives contradictory entry decisions | `start`, `next`, `doctor`, and `baseline` disagree about whether setup may continue or whether missing assets are an error | Use one target topology, intent, project-fact projection, and setup decision across every public consumer |
| Initialization is treated as behavioral activation | Files are copied but the generated project cannot cold-start IntentOS or route its first task | Require a fresh generated-project entry check, isolated read-only route calibration, and first ordinary task through Work Queue, Task Governance, verification, and finish |

These findings define source-only fixtures and system contracts. No calibrated
project name, business domain, repository path, account, port, or project-only
rule may enter IntentOS core behavior.

## Relationship To 1.108 And 1.110

### 1.108 Business Universe Coverage

1.108 protects task-level business completeness. It prevents an entire object,
event source, entry path, filter, exclusion, or separate processing path from
silently disappearing.

1.109 does not duplicate that capability. It protects the project and adoption
sources that Task Governance and later consumers depend on.

The first ordinary task acceptance in 1.109 proves routing and evidence
continuity, not business-universe completeness. When the task can affect a
business universe, Task Governance still invokes the 1.108 authority and its
strict evidence before finish.

### 1.110 Control Effectiveness

1.110 will assess whether an IntentOS-native or project-native gate actually
enforces its bounded claim.

1.109 must land first because control-effectiveness evidence cannot be trusted
while project identity, guidance, authority inventory, adoption source binding,
or apply truth can still drift.

```text
1.108 business scope completeness
-> 1.109 project entry and adoption trust
-> 1.110 relied-on control effectiveness
```

## Product Contract

The public user continues to provide a natural-language goal. The user does not
choose:

- project type enumeration;
- platform technology or framework;
- starter, Profile, baseline level, or standard/industrial pack;
- architecture, database, repository mode, or directory structure;
- task tier, test strategy/tool, or reviewer;
- project identity mechanics;
- realpath or symlink policy;
- guidance files;
- scan depth or source limits;
- parser strategy;
- adoption report selection;
- schema or digest checks;
- baseline checker mode;
- initialization transaction design;
- rollback strategy;
- exit-code policy;
- repair route;
- technical adoption depth.

Codex and IntentOS derive and execute those technical decisions from evidence.

The user may only be asked for:

- a missing business fact or product preference that cannot be inferred;
- an unavailable authoritative external fact;
- exact consent for a prepared real-world effect.

A trust-chain failure is never reframed as a technical question for a
zero-experience user.

## Goals

1. Make project identity path-safe, conflict-aware, and mandatory for public
   routing.
2. Make effective Guidance Authority a required input to every entry and
   verified-adoption claim.
3. Prove governance-source completeness without silent count or depth
   truncation.
4. Require strict, exact, current, project-bound adoption evidence at every
   downstream consumer.
5. Remove direct initialization paths that can bypass plan, readiness,
   rollback, receipt, and activation truth.
6. Make pending, blocked, failed, and verified states impossible to confuse.
7. Make process exit behavior agree with internal trust state for automation.
8. Preserve one public natural-language entry and zero-experience UX.
9. Keep stronger project authority while refusing to claim unread or
   unverified authority coverage.
10. Add adversarial tests that reproduce each trust-chain failure.
11. Make all public entry and adoption commands consume one current
    project-fact projection instead of independently guessing project state.
12. Keep identity, lifecycle, governance authority posture, platform completeness,
    behavioral adoption, and release readiness as orthogonal states.
13. Make behavior-complete operation the preferred end state for safe new and
    existing projects, without requiring full asset migration or authority
    replacement.
14. Let same-run read-only resolvers consume exact upstream structured evidence
    without forcing intermediate target-project writes.
15. Prove behavioral activation with a real task-route simulation before
    claiming `VERIFIED_ACTIVE`.
16. Make blank new projects reach the same behavior-complete operating model as
    existing projects through one controlled setup and activation chain.
17. Preserve the original user goal, derived assumptions, current work, and
    bounded task continuity across setup, adoption, interruption, and restart.
18. Distinguish legacy workflow evidence from current IntentOS identity without
    ignoring useful project history or creating duplicate active authority.
19. Scope conflicts to the identity, Guidance, task, platform, release, or
    real-world action they can actually invalidate.
20. Prove the generated project can enter IntentOS independently of the source
    repository and complete its first ordinary task through strict finish.

## Non-Goals

1. Do not redesign Business Universe Coverage.
2. Do not implement the broader 1.110 control-effectiveness model here.
3. Do not replace existing-project rules with IntentOS defaults.
4. Do not require full asset migration or project-authority replacement for
   behavior-complete adoption.
5. Do not migrate target-project assets during read-only assessment.
6. Do not make the user approve technical architecture or governance choices.
7. Do not treat a valid adoption state as product correctness.
8. Do not authorize release, production, secrets, migrations, provider actions,
   permissions, payments, or business decisions.
9. Do not add a second public entry, adoption authority, or final closure truth.
10. Do not preserve compatibility paths that bypass current safety invariants.
11. Do not make hosted CI, production deployment, or complete platform
    implementation a prerequisite for adopting the IntentOS daily workflow.
12. Do not collapse all project dimensions into a combinatorial project-type
    enum or another parallel state machine.
13. Do not rewrite project history, archive records, or existing facts as if
    IntentOS had governed them before activation.
14. Do not claim that an exercised task route proves every underlying
    project-native gate effective; that remains 1.110 responsibility.
15. Do not turn calibration conditions into a closed project-type enumeration.
16. Do not require Git, a complete backend, a release target, hosted CI, or a
    decided platform before reversible new-project setup can be planned.
17. Do not convert an empty template, marker, copied legacy directory, or
    declared check into current or effective authority without the required
    evidence.
18. Do not erase, rewrite, or silently abandon an in-flight task while
    establishing the IntentOS operating route.
19. Do not redesign Work Queue, Conversation Drift, Task Governance, Review
    Loop, Verification, or Unified Closure; integrate their existing authority
    into setup and adoption trust.
20. Do not embed one default platform, framework, starter, repository shape, or
    business example into IntentOS core routing.
21. Do not use a successful calibration or first ordinary task to claim that
    the whole product, business universe, control set, or release path is
    complete.

## Trust Invariants

### Invariant 1: one genuine project identity state

When a project claims an installed IntentOS identity, project root,
`.intentos`, identity file, project-entry origin, and observed repository state
must agree through safe canonical paths.

An approved collaboration bridge is also a durable identity form only when it
binds the canonical root, exact IntentOS source/version, project-owned entry,
effective Guidance graph, content digests, and invalidation conditions.

A project with neither a current installed identity nor a current approved
bridge is recorded explicitly as unbootstrapped. It may enter read-only
discovery and setup planning, but it cannot be treated as already adopted or
route routine IntentOS-governed engineering.

### Invariant 2: conflicted identity blocks routine work

Any identity projection other than current and trusted routes to repair or
read-only diagnosis. It cannot route to Work Queue preparation or routine
engineering.

### Invariant 3: Guidance failure is an entry failure

If effective guidance cannot be resolved and verified, no public entry or
Adoption Assurance consumer can claim active operation.

### Invariant 4: discovered authority must be accounted for

Every discovered governance source is scanned, parsed, explicitly unparsed,
explicitly excluded with evidence, or recorded as blocked. It never disappears
because of a count, depth, size, or punctuation heuristic.

### Invariant 5: downstream consumers verify sources

No consumer trusts the latest filename, regex text, self-declared state, or
report existence. It resolves one exact authoritative ref and reruns the strict
checker required by that source type.

### Invariant 6: current project binding is mandatory

Adoption evidence binds canonical project identity, source-chain digests,
relevant inventory digest, and invalidation conditions. Relevant project change
invalidates the dependent claim.

### Invariant 7: plan-only is never behavior-complete

States that authorize planning or review cannot be mapped to applied,
behavior-complete, verified-active, or implementation-ready states.

### Invariant 8: writes use one controlled path

Existing or non-empty project targets cannot be initialized or updated through
a direct-force write path. They require complete preflight, exact plan,
authority-compatible readiness, rollback, receipt, and activation evidence.

### Invariant 9: pending is not verified

A checker result must be consumed through its structured state, not process
exit code alone. Pending or warning results cannot become verified activation.

### Invariant 10: process status is truthful

Trust, integrity, and authority blockers produce a non-zero automation result
and an explicit blocked decision. User-input states remain valid product states
but cannot authorize dependent action.

### Invariant 11: one project-fact projection serves every consumer

`start`, `next`, `doctor`, `baseline`, Workflow Map, Native Migration,
Adoption Review, Governance Convergence, Adoption Assurance, and Task
Governance consume the same project-fact projection and outcome digest.

A consumer may add domain-specific interpretation. It may not independently
rediscover stage, baselines, governance authority posture, work queue, CI, release, or
adoption identity and contradict the shared projection.

### Invariant 12: project dimensions remain orthogonal

Installed identity, lifecycle stage, governance authority posture, platform surface
completion, behavioral adoption, release readiness, and real-world effect risk
are independent facts.

Release vocabulary is not production evidence. Strong governance is not
IntentOS installation evidence. Missing hosted CI is not failure to adopt the
IntentOS working method. An incomplete platform surface is not an ungoverned
project.

### Invariant 13: authoritative current evidence outranks keyword hints

An explicit current project-stage or authority record, current environment
evidence, and current repository facts outrank incidental terms such as
`production`, `release`, `rollback`, or `MVP` found in historical, draft,
example, or inactive files.

Conflicting authoritative current sources produce a structured scoped conflict
and a Codex-owned read-only investigation. The affected dimension may be
`CONFLICTED`; global trust becomes `CONFLICTED` only when identity, Guidance,
or the adoption chain is affected. Conflicts are not resolved by counting
keywords.

### Invariant 14: same-run evidence does not require a project write

Within one read-only run, an exact structured resolver output may feed the next
resolver through a digest-bound internal evidence envelope. Consumers validate
type, project binding, producer, schema version, source refs, and digest exactly
as they would for a persisted artifact.

Persistence remains required when an approval, controlled apply, release, or
future-task authority must survive the run. Same-run transport is not durable
adoption evidence.

### Invariant 15: behavior-complete is not asset-complete

Behavior-complete adoption means that the project enters through IntentOS,
routes ordinary tasks through Task Governance and Work Queue, applies the
required plan/review/verification/evidence depth, and closes work through the
current finish authority.

It does not require copying every IntentOS asset, replacing stronger project
rules, renaming project-owned authority, or moving release/runtime ownership to
IntentOS.

### Invariant 16: technical adoption choices belong to Codex

Codex determines the safe adoption target, selected overlay, baseline mapping,
rule reconciliation, verification depth, and rollback design. The original
request to configure or adopt IntentOS authorizes reversible, project-local,
low-risk preparation within the declared goal. A new user confirmation is
reserved for an otherwise unprovable business fact or a concrete effect that
is outside that low-risk authority, external, irreversible, or production.

For reversible project-local setup, Codex converts that original explicit
request into the required structured Approval Record. The record binds the
current plan digest, exact approved action IDs, current project or safe target
identity, bounded scope, expiry, and rollback requirement. This conversion does
not create new authority and does not require the user to repeat a technical
approval question.

If an action changes protected project authority, cannot prove exact rollback,
or is classified above low risk, Codex must first narrow or isolate the action.
When that is impossible, it asks only for consent to the exact understandable
project or real-world consequence; it never asks the user to approve technical
action IDs, schemas, tools, or internal workflow stages.

A request to inspect, review, compare, explain, or discuss IntentOS remains
read-only. Natural-language intent, not a magic phrase, determines whether
project-local apply was requested.

### Invariant 17: target topology is explicit before identity

IntentOS classifies the requested target as `ABSENT_LEAF`, `EMPTY_DIRECTORY`,
`NONEMPTY_DIRECTORY`, `NON_DIRECTORY`, or `UNSAFE` before deriving project
identity or write eligibility.

For an absent leaf, canonical safety is derived from the nearest trusted
existing ancestor plus the bounded leaf path. Every segment is rechecked with
`lstat` immediately before commit. An absent or empty target is not treated as
an installed project merely because source-side IntentOS guidance exists.

### Invariant 18: one goal and decision projection survives every entry

The original natural-language goal, execution intent, inferred product-use
facts, unresolved business facts, reversible assumptions, and Codex-derived
technical decisions form one digest-bound input to the shared project-fact
projection.

`work`, `start`, `next`, `doctor`, `baseline`, setup, and later task routing
cannot drop that input, ask for it again without invalidation evidence, or
derive incompatible starter, platform, baseline, pack, architecture, database,
test, reviewer, or workflow choices.

### Invariant 19: conflicts have an affected scope

Every conflict records its authority sources, semantic fact, confidence,
affected scope, dependent actions, and resolution evidence.

- identity, effective Guidance, or adoption-chain conflicts block behavioral
  activation globally;
- current-task conflicts block that task's transition or closure;
- platform configuration conflicts block dependent platform work and release;
- release conflicts block release actions;
- real-world authority conflicts block only the affected external action.

A local conflict cannot silently become a global project blocker. A global
trust conflict cannot be mislabeled as a harmless local warning.

### Invariant 20: legacy assets are evidence, not current identity

Known legacy workflow namespaces, version records, copied
workflow assets, and historical entry text are inventoried and classified.
They may inform reconciliation and migration, but they cannot establish current
IntentOS identity, Guidance, behavioral activation, or completion.

The selected controlled path preserves useful project history, maps stronger
rules, creates one current durable entry binding, and retires or archives only
the duplicate active legacy authority that the exact plan identifies. It does
not delete history or activate two operating workflows.

### Invariant 21: current work survives adoption

For a non-empty project, IntentOS discovers current task, Work Queue, TODO,
session, plan, decision, close-out, and worktree observations before applying
adoption changes. It accounts for every candidate current task and leaves at
most one mapped `CURRENT` item after activation.

A dirty worktree does not block read-only assessment, recommendation, or plan
generation. A write is blocked only when change ownership is unknown, concurrent
change is detected, selected actions overlap unsafe work, or exact rollback
cannot be proven. Codex derives a checkpoint, mapping, isolation, or pause plan;
the user is not asked to reconstruct technical progress.

### Invariant 22: new-project setup is controlled and reversible

An absent or empty safe target may use a streamlined Codex-owned setup plan
under the original creation request, but it cannot bypass complete preflight,
transactional apply, receipt, and activation verification.

Rollback restores the exact prior topology:

- an originally absent leaf leaves no target directory behind;
- an originally empty directory remains empty;
- a pre-existing ancestor is never removed;
- partial rollback is explicit, non-zero, and lists every residual path.

No extra technical approval is requested for this reversible local setup.

### Invariant 23: generated-project cold start is mandatory

`APPLY_VERIFIED` and `VERIFIED_ACTIVE` require a fresh process launched from the
generated project without relying on source-repository paths, installer memory,
ambient caches, or unrecorded environment overrides.

Cold-start isolation never renames, moves, deletes, changes permissions on, or
otherwise mutates the source repository. The generated-project process starts
from the target with a sanitized environment; source paths are absent from
working directory, module/package search paths, executable search paths,
configuration refs, and injected environment. Where filesystem sandboxing is
available, the source root is not mounted into the process. Otherwise, an
access-deny probe must prove that the process does not read it. Source-tree
before/after identity and content digests must remain equal.

Git and non-Git projects are both supported. A non-Git target uses a canonical
file inventory, content digests, and before/after topology evidence until a Git
repository is intentionally established by the technical plan.

### Invariant 24: activation and first-task proof are separate

Activation calibration is a read-only, isolated projection. It never becomes a
real Work Queue item and cannot modify the project Work Queue. A passing
calibration may support `VERIFIED_ACTIVE` after the apply, receipt, cold-start,
and Adoption Assurance chain is complete.

After activation, the original creation goal produces the first ordinary
`CURRENT` Work Queue item. It must pass Task Governance, risk-based plan and
review depth, verification, evidence binding, and strict finish. Missing any
mandatory stage prevents `DONE` and prevents `FIRST_TASK_VERIFIED`; it does not
rewrite a previously evidenced activation result. IntentOS may claim that its
operating route is active at `VERIFIED_ACTIVE`, but it may claim that the first
governed product task succeeded only at `FIRST_TASK_VERIFIED`.

Behavioral activation, first-task success, product completeness, and release
readiness remain separate outcomes.

### Invariant 25: interruptions preserve intent and responsibility

A side question, scope change, new task, pause, or resume request is classified
through Conversation Drift and Work Queue rules. A read-only side question does
not expand write scope or discard the current task. A pause records resumable
state. A new task receives its own governance route while the system preserves
at most one `CURRENT` item.

Every question presented to the user is structured as one of: missing business
fact, product-use preference, unavailable external fact, or exact consent for a
prepared real-world effect. Technical menus or disguised technical approval
questions fail the zero-experience contract.

## Orthogonal Project State Model

The machine-readable model stores separate dimensions. A plain-language public
summary may compose them, but the stored model must not invent a single
combinatorial enum.

| Dimension | Minimum states | Evidence rule |
|---|---|---|
| Identity | `UNBOOTSTRAPPED`, `INSTALLED_CURRENT`, `BRIDGE_CURRENT`, `INSTALLED_STALE`, `BRIDGE_STALE`, `CONFLICTED` | Derived from safe canonical installed identity or an exact approved bridge, not governance-file presence |
| Lifecycle | `NEW`, `DEVELOPMENT`, `INTERNAL_TRIAL`, `PRODUCTION_ACTIVE`, `UNKNOWN`, `CONFLICTED` | Requires current authoritative stage/environment evidence; vocabulary is only a low-confidence hint |
| Governance authority posture | `LIGHT`, `DECLARED_GOVERNED`, `DECLARED_STRONG_GOVERNED`, `CONFLICTED` | Derived from current structural authority, declared blocking configuration, SoT, queue/session, and evidence-production contracts without claiming that any control is effective |
| Platform surface | Per-platform `ABSENT`, `SHELL`, `IN_PROGRESS`, `FUNCTIONAL`, `RELEASE_READY`, `UNKNOWN` | Derived independently for every detected platform/backend surface |
| Behavioral adoption | `NOT_ADOPTED`, `READ_ONLY_ASSESSED`, `APPLY_PLANNED`, `APPLIED_PENDING_VERIFICATION`, `VERIFIED_ACTIVE`, `BLOCKED` | Requires exact IntentOS entry, routing, evidence, and activation proof |
| Release readiness | `NOT_ASSESSED`, `NOT_READY`, `READY_FOR_REVIEW`, `EXTERNALLY_APPROVED`, `RELEASED`, `BLOCKED` | Hosted CI is one implementation option, not the authority itself |
| Real-world effect | `NONE`, `REVERSIBLE_PROJECT_LOCAL`, `EXTERNAL_REVERSIBLE`, `IRREVERSIBLE_OR_PRODUCTION` | Determines whether fresh human consent is required |

Supporting observations remain fields in the shared projection rather than
new public project-type state machines:

| Observation | Minimum values | Purpose |
|---|---|---|
| Target topology | `ABSENT_LEAF`, `EMPTY_DIRECTORY`, `NONEMPTY_DIRECTORY`, `NON_DIRECTORY`, `UNSAFE` | Select safe setup, adoption, or rejection semantics |
| Repository evidence mode | `GIT_BOUND`, `CONTENT_DIGEST_BOUND`, `UNKNOWN` | Support both Git and pre-Git new projects without weakening evidence |
| Legacy adoption posture | `NONE`, `DETECTED`, `MAPPED`, `RETIREMENT_PLANNED`, `RETIRED` | Prevent old assets from fabricating current identity or remaining silently active |
| Current-work continuity | `NO_CURRENT_WORK`, `CURRENT_MAPPED`, `CURRENT_CONFLICTED`, `UNATTRIBUTED_CHANGES`, `CONCURRENT_CHANGE` | Preserve active work and bound apply safety |
| Declared authority posture | `MISSING`, `TEMPLATE_ONLY`, `DECLARED`, `CURRENT_AUTHORITY`, `CONFLICTED` | Distinguish file presence from current structural authority without claiming 1.110 effectiveness |
| First-task onboarding | `NOT_STARTED`, `CURRENT`, `VERIFIED`, `BLOCKED` | Report first governed product-task progress without changing behavioral adoption state |
| Conflict scope | `GLOBAL_TRUST`, `CURRENT_TASK`, `PLATFORM_SURFACE`, `RELEASE`, `REAL_WORLD_EFFECT` | Block only dependent actions while preserving global fail-closed behavior where required |
| Goal sufficiency | `SUFFICIENT_FOR_REVERSIBLE_SETUP`, `MISSING_BUSINESS_FACT`, `EXTERNAL_FACT_REQUIRED` | Keep technical choices internal while exposing only genuine user decisions |

Example of a valid composed public summary:

```text
existing governed development project; IntentOS not yet installed;
read-only assessment complete; selected behavioral adoption can be prepared;
release readiness remains separate
```

Another valid summary is:

```text
blank new-project target; goal sufficient for reversible local setup;
IntentOS setup and activation may proceed through one controlled transaction;
platform-specific external actions and release remain unapproved
```

The literal composed phrase is presentation only. Consumers use the independent
fields and one projection digest.

## Authority Model

| Authority | Owns | Cannot authorize |
|---|---|---|
| Target Topology Projection | Safe absent/empty/non-empty/non-directory/unsafe target classification | Target writes |
| Goal And Technical Decision Projection | Original goal, execution intent, reversible assumptions, unresolved facts, and Codex-derived technical decisions | Missing business truth or external effects |
| Project Identity Projection | Canonical current project identity | Routine work when conflicted |
| Unified Project Fact Projection | Lifecycle, governance, platform, current-work, baseline, CI/release observations, scoped conflicts, and confidence | Installed identity, behavioral activation, or production approval |
| Review Context Authority | Effective guidance graph and digest | Project writes or implementation |
| Native Migration | Read-only project/governance inventory | Apply or full adoption |
| Existing Rule Reconciliation | Rule coverage and comparison | Unread rules or source omission |
| Governance Convergence | Recommended preserve/merge/adopt direction | Target writes |
| Controlled Native Adoption Review | Bounded adoption recommendation | Behavior completion or apply |
| Behavioral Adoption Activation | Whether the IntentOS daily workflow is installed, routed, and verified | Project correctness, release, or authority replacement |
| Work Queue | One current task plus queued, paused, resumed, and completed task continuity | Task correctness or technical verification |
| Task Governance | Task-level required governance | Trust in unchecked adoption prose |
| Unified Apply Plan | Exact proposed writes | Execution without readiness |
| Approval Record | Current user's original explicit request bound to exact low-risk action IDs and current plan digest | New scope, high-risk action, implementation success, or external effect |
| Controlled Apply Readiness | Whether the exact plan may be attempted | Success claim |
| Apply Receipt | What actually happened and rolled back | Verification without strict activation |
| Adoption Assurance | Whether adoption is evidenced | Product correctness or production approval |
| Unified Closure | Final task close-out | External real-world authority |

## Single Trust Chain

```text
Safe Target Topology
-> Original Goal And Technical Decision Projection
-> Canonical Project Identity Or Explicit Unbootstrapped State
-> Unified Project Fact Projection
-> Effective Guidance Authority
-> Complete Existing Authority Inventory when the target is non-empty
-> Strict Native Migration And Reconciliation when existing authority exists
-> Evidence-Derived Behavioral Adoption Recommendation
-> Exact Adoption Review Binding
-> Governance Convergence And Current-Work Mapping
-> Controlled Plan / Approval Record / Readiness / Apply / Receipt when writes are needed
-> Generated Or Adopted Project Cold Start
-> Isolated Work Queue / Task Governance / Review / Verification / Finish Calibration
-> Strict Behavioral Activation Verification And Adoption Assurance
-> First Or Resumed Ordinary Task Through Work Queue And Task Governance
-> Unified Closure
```

No later stage may reconstruct or weaken an earlier result through independent
regex, filename ordering, file-existence checks, or process exit code alone.

## Workstream A: Project Entry And Project-Fact Trust Hardcut

### Canonical path policy

Create one shared safe project-path resolver used by project identity,
workflow-next, operating-loop, start, doctor, work, adoption, and initialization.

It must:

- resolve the canonical project root;
- inspect every path segment from project root to `.intentos/version.json` with
  `lstat` semantics;
- reject symlinked project identity parents and files;
- reject traversal, path escape, and outside-root realpaths;
- reject non-file identity records;
- reject malformed or unsupported identity records;
- bind the identity to the canonical root;
- record source path and digest;
- work consistently for Git and non-Git projects.

Do not implement separate path checks in each consumer.

### Identity projection enforcement

The operating decision must consume the full identity projection.

For routine IntentOS-governed engineering, if:

```text
identityState not in [INSTALLED_CURRENT, BRIDGE_CURRENT]
or confidence == LOW
or identityConflicts is non-empty
or globalTrustConflicts is non-empty
or canonical identity is not trusted
```

then:

```text
action = REPAIR_PROJECT_IDENTITY or READ_ONLY_DIAGNOSIS
routineEngineeringMayProceedAfterInternalGates = No
materialActionAuthorized = No
```

No Work Queue or implementation route may override this result.

### Unbootstrapped projects

Absence of `.intentos/version.json` is not itself corruption and does not
invalidate an otherwise current approved collaboration bridge.

For a target with neither installed identity nor an approved bridge, IntentOS
must:

- bind the canonical target root;
- classify observed new/existing project signals without fabricating installed
  identity;
- use the trusted external/source IntentOS entry for read-only discovery;
- route an empty safe target to new-project setup planning;
- route a non-empty target to existing-project adoption planning;
- keep routine engineering unauthorized until the selected setup/adoption path
  establishes the required entry trust.

### Identity invalidation

Invalidate project identity binding when relevant inputs change:

- canonical root;
- `.intentos` path topology;
- identity file digest;
- project-entry origin;
- repository identity;
- project-state signals used by the projection;
- installation version identity.
- approved collaboration-bridge entry, source/version, or digest.

### One shared project-fact projection

Add one repository-aware collector and projector for facts needed by public
entry and adoption consumers.

The collector records, with source refs, digests, confidence, and freshness:

- requested target topology and safe existing ancestor;
- original natural-language goal and execution intent;
- inferred product-use facts, reversible assumptions, and unresolved business
  or external facts;
- Codex-derived starter, platform/profile, baseline, pack, architecture,
  repository, test, reviewer, and workflow decisions;
- current lifecycle-stage authority;
- current and historical deployment evidence;
- governance source-of-truth and maturity signals;
- engineering, environment, security, testing, and release baselines even when
  they use project-native names or paths;
- baseline and control-document structural posture, including empty,
  placeholder, template-only, declared, current, and conflicted observations;
- local and hosted gates without assuming either implementation is mandatory;
- Work Queue, TODO, session, decision, and close-out systems;
- active task candidates, task-state conflicts, worktree changes, ownership,
  overlap, and concurrency observations;
- registered legacy workflow namespaces, version records, entry text, and
  migration posture;
- platform and backend surfaces independently;
- current IntentOS identity and effective-guidance state;
- unresolved conflicts, their affected scopes, dependent actions, and
  invalidation conditions.

The collector returns observations. The projector applies the orthogonal state
model. Consumers do not rescan the repository independently.

### Lifecycle evidence hierarchy

Lifecycle classification uses this precedence:

1. a current project-owned stage or environment authority that passes its
   project-native validity rules;
2. current environment/deployment evidence bound to the repository identity;
3. current executable and configuration facts;
4. low-confidence vocabulary and historical hints.

Level 4 cannot promote a project to `PRODUCTION_ACTIVE`. A repository may have
release plans, rollback documentation, production examples, and security
policies while still being in development.

An explicit current stage authority is not accepted blindly. Contradictory
current runtime or deployment evidence produces `CONFLICTED`, not a silent
override.

An active document is also not accepted blindly when current executable or
configuration evidence proves that its factual description is stale. The
projector records the contradiction, scopes its effect, and routes Codex-owned
reconciliation. It does not let documentation or executable presence win by a
global fixed rule.

### Structural authority is not control effectiveness

1.109 determines whether a baseline, gate, policy, or operational document is
missing, template-only, declared, current authority, historical, or conflicted.
It may reject an empty template or marker as current authority.

It does not claim that a current declared control actually enforces its bounded
promise. Runtime behavior, evidence freshness, scan coverage, false-green
behavior, and enforcement quality belong to 1.110 Control Effectiveness.

### Scoped conflict propagation

The shared projector emits structured conflicts with exact affected consumers.
Every consumer applies the same propagation table:

| Conflict scope | Must block | Must not automatically block |
|---|---|---|
| `GLOBAL_TRUST` | Identity repair, routine routing, apply, behavioral activation | Read-only diagnosis |
| `CURRENT_TASK` | Affected task transition, review, verification, or finish | Unrelated read-only adoption assessment |
| `PLATFORM_SURFACE` | Dependent platform implementation, environment validation, or release | IntentOS entry and unrelated platform work |
| `RELEASE` | Release planning step that relies on the conflict and every external release effect | Local behavioral adoption and unrelated development work |
| `REAL_WORLD_EFFECT` | Exact payment, secret, provider, legal, migration, or production action | Reversible local planning and unrelated tasks |

Consumers cannot widen or narrow this scope independently.

### Cross-command consistency

Every consumer records the exact project-fact projection digest it used.

For the same root and unchanged inputs:

- identity state must agree everywhere;
- lifecycle stage must agree everywhere;
- baseline presence must agree everywhere;
- governance authority posture must agree everywhere;
- Work Queue/session presence must agree everywhere;
- CI and release observations must agree while domain interpretation may
  differ;
- behavioral adoption state must agree everywhere.

Any disagreement is `PROJECT_FACT_PROJECTION_DIVERGENCE`, an internal trust
failure owned by Codex. It is not presented as a choice to the user.

## Workstream B: Effective Guidance Enforcement

### One effective-guidance resolver

Review Context Authority remains the source of truth for effective Guidance.
Expose one shared resolver/check result consumed by:

- `work`;
- `start`;
- `doctor`;
- `next` when it routes execution;
- existing-project adoption;
- Adoption Assurance;
- Task Governance when active operating mode is claimed.

### Guidance authority by entry state

- IntentOS source repository: use the source effective-guidance graph.
- Unbootstrapped project entered through a trusted IntentOS checkout/reference:
  use the trusted source graph for read-only setup/adoption planning and record
  that project-local Guidance is not active yet.
- Installed IntentOS project: use the project-local installed Guidance graph
  and bind it to installation identity.
- Existing project with an approved collaboration bridge: resolve the
  project-owned agent authority plus the exact referenced IntentOS guidance
  source through the existing authority map.

Missing project-local Guidance is a setup state before installation, but a
trust failure when a report claims installed or verified-active operation.

### Required binding

The binding records:

- effective guidance roots;
- recursively resolved guidance files;
- canonical refs and content digests;
- graph digest;
- platform authority;
- conflicts, missing files, loops, and unsupported links;
- current validation state;
- invalidation conditions.

### Fail-closed behavior

Reject active operating claims when:

- a guidance path or parent is a symlink;
- the graph contains an unresolved or outside-project ref;
- required active guidance is missing;
- active guidance conflicts with the current responsibility contract;
- the recorded graph digest differs from current guidance;
- the checker reports failure.

Searching for headings such as Review Loop, Work Queue, or IntentOS is not
effective-guidance proof.

## Workstream C: Existing Authority Completeness

### Complete discovery accounting

Native Migration and Workflow Adapter must record:

- discovered source count;
- eligible source count;
- scanned source count;
- parsed rule count;
- unparsed candidate count;
- evidence-backed excluded source count;
- omitted source/rule count;
- scan-limit state;
- inventory digest;
- parser warnings;
- source-level outcome.

Every source also receives an authority-lifecycle classification:

- `CURRENT_SOT`;
- `ACTIVE_GUIDANCE`;
- `ACTIVE_EVIDENCE`;
- `DRAFT`;
- `HISTORICAL`;
- `RETIRED`;
- `ARCHIVED`;
- `GENERATED_OR_VENDOR`;
- `UNKNOWN_REQUIRES_CLASSIFICATION`.

All classes remain inventoried. Only current active authority influences the
current rule set. Historical or archived material cannot become active merely
because it contains stronger wording.

Required equality for strict coverage:

```text
discovered
= scanned
+ explicitly excluded with evidence
+ blocked with visible reason
```

All discovered rule candidates must be parsed, recorded as
`PRESENT_UNPARSED`, excluded with evidence, or blocked. Silent omission is
forbidden.

### No silent limits

Remove unreported `slice()` and fixed-depth behavior from authority-completeness
claims.

Resource budgets may still exist, but reaching one must produce:

```text
INVENTORY_INCOMPLETE
or SCAN_BUDGET_EXCEEDED
```

and block strict adoption until Codex continues the scan through bounded pages
or batches.

### Parser behavior

Rule extraction must not depend on punctuation as the only candidate signal.

The parser should combine:

- Markdown structure;
- imperative and prohibition semantics;
- policy and authority markers;
- path and nested guidance ownership;
- explicit project registries;
- existing parser rules.

Uncertain text becomes `PRESENT_UNPARSED`. It is not dropped and is not handed
to the user as a technical parsing choice.

### Deep and large repositories

Discovery must support nested and monorepo structures without assuming a fixed
depth proves completeness.

Use repository-aware traversal with:

- ignored generated/vendor directories;
- cycle and symlink protection;
- bounded batches;
- continuation cursor or equivalent internal progress state;
- complete count accounting;
- deterministic inventory digest.

Large repositories must be processed to completion through internal pages.
Public output may summarize counts, but the machine state retains every page,
cursor, source outcome, and aggregate digest. Static caps such as the first ten
sources or first forty rules cannot support a complete claim.

Project-native lifecycle failures, such as stale active documentation, remain
visible project blockers. They do not become false claims that the baseline,
queue, or authority source is absent.

## Workstream D: Strict Adoption Consumer Binding

### Same-run structured evidence chain

Resolvers that execute in one read-only session must be composable without
writing intermediate reports to the target project.

The internal evidence envelope includes:

- producer and artifact type;
- schema and producer version;
- canonical project identity and project-fact projection digest;
- source refs and inventory digest;
- structured payload digest;
- generation sequence and run identity;
- strict checker result;
- persistence status.

For example, Existing Rule Reconciliation can consume the exact Native
Migration result generated earlier in the same run. Governance Convergence and
Adoption Assurance can then consume that exact chain. If any digest or project
binding differs, the chain fails closed.

An in-memory result may support the current recommendation. It cannot satisfy a
durable approval, apply, activation, release, or future-task evidence
obligation until persisted through the existing artifact authority.

### Authoritative source selection

Task Governance and later consumers must not select adoption evidence by:

- lexicographically latest Markdown filename;
- modification time alone;
- regex search for outcome fields;
- file existence;
- self-declared `current_project_match`;
- generated prose.

They must receive or resolve one exact evidence ref through Evidence Authority.

### Strict source validation

Before consumption:

1. resolve the safe authoritative path;
2. validate schema;
3. run the source-specific strict checker;
4. validate canonical project identity binding;
5. validate source-chain refs and digests;
6. validate inventory/guidance bindings when required;
7. validate freshness and invalidation conditions;
8. compare human-readable and structured outcomes;
9. preserve the strictest blocker.

### State mapping

Define an explicit allowed mapping table.

At minimum:

```text
READY_FOR_*_PLAN_ONLY -> plan_ready only
PARTIAL / ADAPTER_ONLY -> partial or adapter_only
APPLIED_PENDING_VERIFICATION -> applied_pending_verification
VERIFIED_ACTIVE -> behavior_complete only after strict assurance
BLOCKED / NEEDS_INPUT -> blocked
```

Substring matching such as `SELECTED_NATIVE` or `FULL` is forbidden for
authority state derivation.

### Staleness

An adoption report must bind:

- canonical project identity digest;
- relevant project-state fingerprint;
- effective-guidance graph digest;
- authority inventory digest;
- upstream source refs and digests;
- target IntentOS version;
- generated time when time matters;
- invalidation conditions.

Changing a relevant production, governance, release, or identity signal makes
the dependent report stale. A checker must recompute or compare current
identity, not only validate report shape.

## Workstream E: Behavior-Complete Adoption Recommendation And Activation

### Adoption concepts

Use these meanings consistently:

- `FULL_BEHAVIORAL_ADOPTION`: IntentOS is the default daily task operating
  method and the activation is strictly verified.
- `SELECTED_NATIVE_OVERLAY`: the smallest project-local identity, entry,
  routing, mapping, and evidence assets needed to prove that behavior.
- `FULL_ASSET_MIGRATION`: broad copying of IntentOS assets into the project;
  optional and not the default goal.
- `AUTHORITY_REPLACEMENT`: replacement of project-owned engineering,
  business, release, runtime, or production authority; never inferred from an
  adoption request.

Behavior-complete adoption may use an installed `.intentos` identity or an
approved equivalent collaboration bridge, but it always requires one durable,
project-local entry binding. It does not require creating or replacing a
specific agent filename when the project already has a valid authority entry.

### Evidence-derived recommendation

IntentOS recommends the deepest safe behavioral adoption path from evidence.

The target is condition-derived, not project-type-derived. New and existing
projects share the same behavioral end state when trust can be established:

```text
one current IntentOS entry
-> one Work Queue
-> Task Governance and risk-derived plan/review/verification
-> current evidence
-> strict finish
```

Platform completion, backend completion, governance authority posture, legacy assets,
and release readiness change the exact setup or overlay actions. They do not
create separate operating workflows.

For a blank safe new-project target, the default technical objective is:

```text
UNBOOTSTRAPPED / NEW
-> GOAL_AND_SETUP_PLAN_READY
-> SETUP_APPLIED_PENDING_VERIFICATION
-> ACTIVATION_CALIBRATION_PASSED
-> VERIFIED_ACTIVE full behavioral adoption
-> FIRST_TASK_CURRENT
-> FIRST_TASK_VERIFIED
```

The original natural-language creation request authorizes Codex to derive and
apply reversible project-local setup after internal gates. It does not
authorize external providers, paid services, secrets, public deployment,
production data, or irreversible effects.

For an unbootstrapped, existing, governed development project, the default
technical objective is:

```text
READ_ONLY_ASSESSED
-> APPLY_PLANNED for a selected native overlay
-> APPLIED_PENDING_VERIFICATION
-> VERIFIED_ACTIVE full behavioral adoption
```

Strong governance is a reason to preserve and map project-native authority. It
is not, by itself, a reason to stop permanently at `ADAPTER_ONLY`.

For a weak, inconsistent, or under-governed project, IntentOS derives the
missing baseline and governance additions, compares them with current rules,
and still targets behavior-complete adoption when controlled apply can be made
safe. It does not ask the user to design the governance system.

### New-project goal and setup continuity

IntentOS converts a creation request into one durable setup intent containing:

- original user wording and goal digest;
- inferred audience, use context, and first bounded product outcome;
- explicit reversible assumptions;
- unresolved business or external facts;
- derived platform/profile, starter, baseline, standard packs, architecture,
  repository mode, verification, and review decisions;
- excluded capabilities and external effects;
- first ordinary task seed.

When product use context is sufficient for a reversible local path, Codex
chooses a conservative first vertical slice and records assumptions instead of
asking the user for a platform or technology menu. When a missing product fact
would materially change the user-facing product, Codex asks a plain product-use
question and then resumes the same setup intent. It never asks the user to pick
the technical translation.

Setup completion requires:

1. one exact plan, one matching structured Approval Record, controlled
   readiness, and complete preflight;
2. transactional apply and exact receipt;
3. current installed identity and effective project-local Guidance;
4. a generated-project cold-start check;
5. a read-only isolated calibration projection that exercises routing and
   strict finish without entering or modifying the real Work Queue;
6. the original goal becoming the first ordinary governed task.

### Existing-project legacy and current-work continuity

Existing-project assessment inventories both current and legacy operating
assets. Legacy workflow files are classified as active, historical, duplicate,
stale, conflicting, or migration evidence. They do not count as current
identity, but they are not ignored.

Before controlled apply, IntentOS also reconciles current work:

- discover every candidate active task and its supporting diff, queue, TODO,
  session, plan, review, evidence, and close-out records;
- resolve or visibly block conflicting current-task states;
- map one supported current task into the effective Work Queue without
  rewriting history;
- isolate selected overlay writes from unrelated or concurrent changes;
- preserve resumable evidence and rollback.

Read-only assessment and recommendation continue on a dirty worktree. Unsafe
apply does not.

### Independent readiness dimensions

The recommendation must preserve these distinctions:

- missing hosted CI can block a selected release path, not behavioral adoption;
- incomplete Android, Web, mini-program, backend, or iOS surfaces affect their
  platform state and relevant task scope, not the project identity;
- an undecided platform defers only platform-specific assets until product-use
  evidence supports a Codex-derived selection;
- stale project documentation can block tasks that rely on it without
  fabricating a missing baseline;
- a template-only baseline is not current authority, while effectiveness of a
  current declared baseline remains a separate 1.110 question;
- a current-task or platform conflict blocks only its recorded dependent
  actions unless it also invalidates identity, Guidance, or adoption trust;
- production-sensitive rules can raise task or release risk without changing
  lifecycle stage to `PRODUCTION_ACTIVE`;
- project-native stronger gates remain authoritative after adoption.

### Responsibility-contract reconciliation

Project-native rules are compared not only by strictness but also by ownership
semantics.

Rules that preserve project facts, business authority, data safety, release
ownership, or stronger verification remain authoritative. Rules that delegate
architecture, baseline selection, test strategy, review depth, internal
workflow, or technical approval back to a zero-experience user conflict with
the current IntentOS responsibility contract.

Such a conflict is resolved through the existing reconciliation and controlled
apply path:

- preserve the underlying project fact and stronger safety obligation;
- replace or scope out only the obsolete technical-responsibility assignment;
- record before/after authority and rollback;
- verify that the effective project entry no longer asks the user to make the
  technical choice.

This is not a blanket rule that IntentOS always wins. The current user remains
the authority for unavailable business or product facts and for consent to an
exact understandable external or production effect that the user controls. An
external provider or account policy remains authoritative for actions requiring
that provider or account. If a legal, regulatory, secret, or production fact
cannot be proved, IntentOS marks it unverified and stops only the affected
action. It does not invent a separate professional role or turn the user into a
technical approver.

### Activation proof

`VERIFIED_ACTIVE` requires all of the following:

1. target topology, current project identity, goal/decision input, and
   project-fact projection pass;
2. one durable project-local IntentOS entry binding is active;
3. effective guidance resolves without responsibility conflict;
4. preserved, merged, added, and blocked project rules are completely
   reconciled;
5. current-work continuity is mapped or explicitly proves that no current work
   exists;
6. Work Queue and Task Governance route an ordinary task by default;
7. task tier selects the required plan, review, verification, and evidence
   depth without user technical choices;
8. finish consumes the resulting current evidence and returns the expected
   bounded decision;
9. one deterministic read-only synthetic calibration projection proves the
   full route without touching project Work Queue, business runtime, or
   external systems;
10. calibration leaves project files and the real Work Queue unchanged;
11. a fresh generated/project-local process repeats the entry and routing
    checks without source-repository dependence;
12. activation receipt binds exact before/after topology, state, checks,
    rollback, cold-start, and simulation evidence.

Marker text, a docs-only bridge, a plan, an installed directory, or a checker
that has not exercised the route is insufficient.

The route simulation proves that IntentOS orchestration is active. It does not
by itself prove that every relied-on project-native test, gate, or control is
effective; 1.110 consumes this trusted chain for that separate claim.

### User interaction boundary

The user supplies the natural-language creation or adoption goal once. A clear
request to create, build, configure, adopt, migrate, or start work authorizes
Codex to continue through read-only assessment, recommendation, exact plan,
reversible low-risk project-local controlled apply, activation verification, and the
first bounded task without asking the user to choose `ADAPTER_ONLY`, starter,
platform technology, Profile, baseline level, packs, architecture, database,
repository mode, CI provider, parser, rule disposition, test strategy,
reviewer, action list, rollback, or receipt.

Before a reversible local apply, Codex materializes the original request as the
structured Approval Record required by the existing apply chain. It shows the
user only the bounded real-world consequence when one exists; it does not ask
the user to validate plan digests, action IDs, readiness, or rollback mechanics.

Codex stops for a new user decision only when:

- an authoritative business fact cannot be inferred;
- two current project authorities conflict and repository evidence cannot
  resolve a business or product-use meaning required by the next action;
- the next step would create an external, irreversible, production, secret,
  billing, legal, or provider effect outside the original bounded request.

If the user's intent is inspection or discussion, this workstream remains
read-only and returns the recommendation without applying it.

A side discussion during setup or first-task execution is routed through
Conversation Drift without becoming apply permission, silently expanding
scope, or discarding the current task.

## Workstream F: Init And Apply Transaction Truth

### Target topology and removal of direct-force writes

`--force-new-project` must not directly write any target. It may be interpreted
as creation intent for compatibility during the hardcut, but the actual write
still requires the same exact setup plan, complete preflight, transaction,
receipt, and activation truth as the public natural-language entry.

Allowed behavior:

- absent safe leaf: resolve from the nearest safe existing ancestor, create an
  exact new-project setup plan, and recheck topology immediately before write;
- truly empty safe target: create the same exact setup plan and preserve the
  empty-directory rollback contract;
- non-empty or existing target: produce a read-only plan or route to existing
  project adoption;
- non-directory target: reject without mutation;
- ambiguous target: block and repair target topology or project identity;
- symlinked or unsafe target: reject.

Do not preserve a compatibility flag that bypasses the invariant.

### Bootstrap transaction envelope

An absent or empty target needs durable pre-write evidence before project-local
evidence storage exists. IntentOS therefore creates one bootstrap transaction
envelope under the nearest safe existing ancestor, on the same filesystem as
the target, before the first target write.

The envelope contains:

- canonical ancestor and requested target topology;
- original goal, execution intent, technical-decision, and project seed
  digests;
- immutable execution plan and exact action IDs;
- matching structured Approval Record;
- Controlled Apply Readiness result;
- source inventory and digests;
- before-state and rollback manifest;
- transaction ID, owner process, expiry, and safe failure-receipt location.

The envelope is bootstrap authority for this transaction only. It is not an
installed project identity, active Guidance, or adoption evidence.

Commit behavior is topology-specific:

- for `ABSENT_LEAF`, stage the complete target as a sibling directory and use
  one same-filesystem atomic rename after final ancestor and target recheck;
- for `EMPTY_DIRECTORY`, preserve the original directory and use a journaled
  exact action set whose rollback removes every created entry and leaves the
  original directory empty;
- for `NONEMPTY_DIRECTORY`, use the existing bounded controlled-apply path and
  never replace the project root.

After commit, IntentOS writes or promotes the exact project-local plan,
Approval Record, readiness, and receipt refs, verifies their digests against
the bootstrap envelope, then performs cold start and activation. A failed
transaction removes its staging area, restores exact prior topology, and keeps
only the predeclared failure receipt. A missing, expired, cross-filesystem,
changed, or unowned bootstrap envelope blocks before target mutation.

### Complete preflight

Before the first write, preflight every proposed target action:

- canonical target path;
- target topology and nearest trusted existing ancestor;
- parent path safety;
- symlink and traversal safety;
- existing file type;
- target inode/type and every path segment immediately before commit;
- overwrite/collision policy;
- source availability and digest;
- target before-hash;
- original goal, setup-intent, and decision-projection digest;
- immutable execution-plan ref/digest and exact action IDs;
- structured Approval Record ref/digest, `APPROVED` state, matching action IDs,
  current target binding, and unexpired scope;
- Controlled Apply Readiness ref/digest bound to the same plan and approval;
- directory creation requirements;
- rollback feasibility;
- exact absent/empty/non-empty topology restoration behavior;
- required disk/resource constraints;
- selected baseline/profile/pack consistency;
- authority compatibility;
- current-work ownership, overlap, and concurrent-change observations;
- Git or content-digest evidence mode;
- project-local receipt path and generated-project cold-start command.

If any action fails preflight, write nothing.

### Transaction and rollback

Controlled apply must:

- stage the complete action set before activation;
- record before state;
- prove that execution plan, Approval Record, readiness, and bootstrap
  transaction envelope bind the same target, digests, and action IDs;
- apply exact approved actions only;
- stop on first unexpected result;
- roll back every completed action on failure;
- verify exact rollback topology and content state;
- record failed action and rollback outcome;
- never leave an unreported partial installation;
- write a failed receipt only through a predeclared safe receipt path;
- remain idempotent when retried after complete rollback;
- detect a target or ancestor swap between preflight and commit;
- preserve all unrelated and current-work changes.

For a target that did not exist before apply, complete rollback removes only
the created target leaf and its created descendants. For a target that existed
as an empty directory, complete rollback leaves that directory present and
empty. Rollback never removes a pre-existing ancestor.

### Activation truth

Activation consumers must use structured strict checker outcomes.

For BL2 and equivalent selected capabilities:

- invoke strict mode;
- request machine-readable state;
- require state `PASS` or the capability-specific verified state;
- reject pending, warning, missing evidence, unapproved, and not-run states;
- record command, exit code, structured state, refs, and digest.

Process exit zero alone is not enough.

For setup or adoption activation, strict validation also requires:

- a fresh process whose current working directory is the generated or adopted
  project;
- no unresolved dependency on the source repository or installer process;
- current installed identity and effective Guidance digests;
- Git-bound or canonical content-digest-bound before/after evidence;
- one closed isolated read-only projection through Work Queue, Task Governance,
  required review/verification, and finish resolvers without project writes;
- project Work Queue remains unchanged and contains no synthetic `CURRENT` item;
- a first ordinary task seed bound to the original user goal.

### Receipt state

Required minimum states:

- `APPLY_VERIFIED`
- `APPLY_PENDING_ACTIVATION`
- `APPLY_FAILED_ROLLED_BACK`
- `APPLY_FAILED_ROLLBACK_INCOMPLETE`
- `APPLY_BLOCKED_BEFORE_WRITE`

`APPLY_VERIFIED` requires every selected activation obligation to pass strict
structured validation.

It does not by itself mean that the product slice is complete or release-ready.
For a new project, the first ordinary task must still execute and close through
the active operating route before IntentOS may report that ordinary governed
product work has started successfully.

## Workstream G: Public Entry And Exit Semantics

### Decision status and process status

Every public command exposes:

- decision state;
- action allowed state;
- blocker category;
- next safe action;
- whether user input is genuinely required;
- whether the process result is safe for automation.

### One public decision contract

`work` remains the ordinary natural-language entry. `start`, `next`, `doctor`,
`baseline`, setup, and adoption commands may remain advanced or internal
surfaces, but for one unchanged target and goal they must consume the same
projection and return compatible decisions.

In particular:

- an absent or empty new target is a valid pre-setup state, not a failed
  installed project;
- `doctor` does not run post-install missing-asset checks as if setup had
  already completed;
- `next` cannot authorize a direct write when `work` or `start` denies it;
- help and dry-run output preserve the supplied target and execution intent;
- a command registered as read-only cannot write under an undocumented flag;
- an explicit write-plan mode is classified as a write and uses the controlled
  transaction contract;
- missing project assets before setup are expected observations, while missing
  selected assets after verified apply are blockers.

### Non-zero requirements

Return non-zero for:

- identity conflict or unsafe path;
- invalid effective guidance;
- incomplete authority scan when strict coverage is required;
- invalid, stale, untrusted, or mismatched authority evidence;
- apply or activation failure;
- integrity or security failure;
- internal checker failure hidden by an aggregate entry.

### Valid non-error blocked states

A missing business fact or unavailable external fact can remain a valid product
response, but the dependent action remains unauthorized. Structured output must
make that distinction explicit.

An optional compatibility flag may change presentation, but no flag may turn a
trust/integrity blocker into an automation success.

### Continuous internal progression

The public natural-language entry must not stop after every internal report.
When the next action is technical, read-only, deterministic, and within the
original goal, Codex continues automatically through fact collection,
inventory paging, reconciliation, recommendation, plan generation, review,
verification, reversible setup/adoption apply, behavioral activation, and the
first bounded task when the user's creation or implementation intent permits
those actions.

Intermediate states remain recorded for audit and debugging, but the ordinary
user receives one final plain-language outcome:

- active and ready for ordinary IntentOS-governed work;
- safely prepared but blocked by one concrete external or business fact;
- not applied because a specific safety condition failed, with Codex's repair
  action already attempted or prepared.

The public entry must not ask the user to paste an intermediate report into the
next command or approve each docs-only/internal phase.

## Shared Internal Trust Object

Avoid adding another user-visible report. Internally normalize the source chain
into one `project_entry_trust` object containing:

- target topology and repository evidence mode;
- original goal, execution intent, product-use facts, assumptions, unresolved
  facts, and technical decision-projection digest;
- canonical project identity binding;
- identity projection state;
- unified project-fact projection and digest;
- independent lifecycle, governance, platform, adoption, release, and effect
  states;
- effective guidance binding;
- authority inventory completeness;
- declared-authority structural posture;
- legacy adoption posture and exact mapped/retired source refs;
- current-work continuity, dirty-work ownership, overlap, and concurrency
  state;
- structured conflicts and their affected scopes;
- same-run upstream evidence envelopes and persistence status;
- evidence-derived adoption target and rationale;
- adoption evidence binding;
- current source-chain state;
- write-path eligibility;
- activation truth state;
- behavioral route simulation result;
- blockers;
- invalidation conditions;
- outcome digest.

Each source system remains authoritative for its own domain. The normalized
object is a consumer input, not a replacement authority or new final truth.

## Consumer Matrix

| Consumer | Required trust inputs | Required fail-closed behavior |
|---|---|---|
| `work` | Target topology, goal/intent, identity, project facts, Guidance, required adoption binding | Select setup, adoption, repair, or routine route; no business implementation before required activation |
| `start` | Target topology, goal/intent, identity, shared project facts, Guidance, source health | Compatible setup/adoption decision; non-zero on trust/integrity failure; no independent stage guess |
| `doctor` | Lifecycle-appropriate entry trust inputs and shared fact digest | Do not treat valid pre-setup absence as post-install failure; report one dominant real blocker and non-zero when trust fails |
| `next` | Current decision and trust digest | No executable route from conflicted trust |
| `baseline` | Shared goal decisions and baseline/platform observations | No repeated goal prompt, technical menu, or independent missing-baseline claim |
| Workflow Map | Shared queue/session/guidance observations | No user technical choice or contradictory workflow claim |
| Setup / Init | Target topology, goal decision, exact plan, preflight, rollback | No direct-force write, unreceipted apply, or topology drift |
| Native Migration | Canonical root, project facts, and complete inventory | No selected adoption from incomplete scan |
| Reconciliation | Exact persisted or same-run migration evidence | No zero-omission claim from unparsed sources |
| Governance Convergence | Exact strict sources | Preserve upstream blockers |
| Adoption Review | Identity, facts, source, inventory, Guidance digests | Plan-only remains plan-only; recommendation is evidence-derived |
| Work Queue / Conversation Drift | Current-work projection, exact active task, user-message classification | Preserve at most one `CURRENT`; no side-question scope expansion or task loss |
| Task Governance | Strict exact adoption source, current task, goal binding | No regex/latest-file trust or ungoverned first task |
| Apply Readiness | Exact plan and authority binding | Block before writes when incomplete |
| Apply Receipt | Exact action and activation results | Pending/failed cannot become verified |
| Adoption Assurance | Identity, facts, Guidance, apply chain, simulation | No marker-only VERIFIED_ACTIVE; no independent baseline/CI guess |
| First ordinary task / Unified Closure | Original goal, current queue item, Task Governance, current review/verification/evidence | No `DONE` when any mandatory route stage or trust binding is absent |

## Compatibility Policy

### Historical records

Historical artifacts remain readable and retain their original meaning. They do
not gain current identity, Guidance, inventory, or strict-consumer proof
retroactively.

### Legacy direct initialization

Legacy command syntax may remain documented only as historical context. It
cannot bypass current target-topology and controlled-apply invariants.

Known legacy workflow directories, identity records, and entry text are
discoverable migration evidence. They cannot establish current identity or
remain silently active beside the verified IntentOS entry. Controlled
reconciliation decides preserve, map, archive, or retire for every active
legacy source; history is not deleted or rewritten.

### New projects

An absent or empty safe target begins as `UNBOOTSTRAPPED / NEW / NOT_ADOPTED`.
Source Guidance may derive the setup route but does not fabricate project-local
installation.

The setup transaction establishes current project identity, effective local
Guidance, baseline decisions, one Work Queue, Task Governance routing, receipt,
and cold-start activation. It then routes the first ordinary task from the
original goal. Git initialization is a Codex technical decision, not a user
prerequisite; content-digest evidence remains valid until Git binding exists.

Initialization success, product-slice completion, and release readiness are
reported independently.

### Existing projects

Existing-project authority is preserved. If full scanning cannot yet complete,
IntentOS stays read-only or partial and continues technical investigation. It
does not ask the user to choose which rule to ignore.

After complete assessment, strong governance does not force permanent
adapter-only operation. IntentOS may reach `FULL_BEHAVIORAL_ADOPTION` through a
selected overlay while preserving stronger project-native gates, SoT,
baselines, release rules, and runtime authority.

For under-governed projects, missing controls are derived and added through the
same controlled path. The project does not have to become well governed before
IntentOS can recommend how to make it well governed.

Historical, retired, and archived assets remain discoverable but do not become
current authority. Existing history is never rewritten as IntentOS-generated
history.

### Current verified adoption

Previously verified reports remain historical evidence. New strict task or
adoption claims require current trust-chain binding.

## Implementation Scope

### Shared libraries

- target-topology and nearest-safe-ancestor resolver;
- canonical project-path and parent-symlink validator;
- goal, execution-intent, assumption, and technical-decision projector;
- repository-aware project-fact collector;
- orthogonal project-state projector and confidence resolver;
- scoped-conflict classifier and propagation helper;
- project-entry trust normalizer;
- effective-guidance resolver result adapter;
- authority inventory completeness helper;
- paged authority inventory and lifecycle classifier;
- legacy workflow asset and identity classifier;
- current-work, queue, task, diff-ownership, overlap, and concurrency collector;
- declared-authority structural-posture classifier;
- same-run structured evidence-envelope transport;
- strict source-consumer helper;
- explicit adoption-state mapping helper;
- behavioral-adoption recommendation helper;
- behavioral-route activation verifier;
- Git/content-digest snapshot adapter;
- generated-project cold-start verifier;
- first-ordinary-task route verifier;
- activation structured-result helper;
- process/decision exit policy helper.

### Existing scripts

Update all relevant entry, identity, guidance, migration, reconciliation,
adoption, Work Queue, Conversation Drift, Task Governance, init/apply, receipt,
assurance, first-task, and finish consumers.

At minimum, `start`, `next`, `doctor`, `baseline`, Workflow Map, Native
Migration, Existing Rule Reconciliation, Governance Convergence, Controlled
Native Adoption Review, Adoption Assurance, `work`, Task Governance, and finish
must consume the shared projection or exact same-run evidence chain.

The public and advanced help paths, dry-run paths, and command metadata must use
the same target, goal, read/write classification, and decision contract as
execution.

Do not implement local copies of identity, path, schema, or report-selection
logic.

### Schemas and templates

Extend existing schemas where needed for:

- canonical project identity;
- target topology, repository evidence mode, original goal, execution intent,
  assumptions, unresolved facts, and technical decision projection;
- project-fact observations, confidence, authority refs, and projection digest;
- orthogonal state dimensions;
- Guidance graph binding;
- authority inventory accounting;
- source lifecycle and continuation accounting;
- legacy asset posture and exact preserve/map/archive/retire disposition;
- current-work continuity, queue/task identity, diff ownership, overlap, and
  concurrency observations;
- declared-authority structural posture and scoped conflicts;
- same-run evidence envelopes;
- behavioral adoption target and activation simulation;
- exact adoption source chain;
- invalidation conditions;
- explicit state mapping;
- strict activation results;
- generated-project cold-start and first-ordinary-task results;
- truthful receipt states;
- decision/process status.

Prefer extending current artifacts over creating parallel reports.

### Exact implementation change boundary

Before Phase 1, Phase 0 must persist a digest-bound change-boundary manifest.
It lists every allowed existing file, every allowed new file, its owning phase,
expected change type, generated-project parity obligation, and minimal commit
set. A file absent from that manifest cannot be edited until the plan is
re-reviewed and receives a new `PLAN_REVIEW_PASSED` result.

The initial allowed production implementation set is limited to:

```text
scripts/cli.mjs
scripts/init-project.mjs
scripts/start-project.mjs
scripts/resolve-operating-loop.mjs
scripts/workflow-next.mjs
scripts/baseline-project.mjs
scripts/resolve-workflow-guidance.mjs
scripts/check-workflow-guidance.mjs
scripts/resolve-existing-workflow.mjs
scripts/check-workflow-adoption-map.mjs
scripts/check-review-context-authority.mjs
scripts/resolve-native-migration.mjs
scripts/check-native-migration.mjs
scripts/resolve-existing-rule-reconciliation.mjs
scripts/check-existing-rule-reconciliation.mjs
scripts/resolve-governance-convergence.mjs
scripts/check-governance-convergence.mjs
scripts/resolve-controlled-native-adoption-review.mjs
scripts/check-controlled-native-adoption-review.mjs
scripts/resolve-adoption-assurance.mjs
scripts/check-adoption-assurance.mjs
scripts/resolve-work-queue.mjs
scripts/check-work-queue.mjs
scripts/check-conversation-drift.mjs
scripts/resolve-task-governance.mjs
scripts/check-task-governance.mjs
scripts/resolve-apply-plan.mjs
scripts/check-apply-plan.mjs
scripts/resolve-controlled-apply-readiness.mjs
scripts/check-controlled-apply-readiness.mjs
scripts/check-apply-execution-receipt.mjs
scripts/resolve-closure-decision.mjs
scripts/check-closure-decision.mjs
scripts/check-project-entry-calibration.mjs
scripts/check-change-boundary.mjs
scripts/resolve-plan-review.mjs
scripts/check-plan-review.mjs
scripts/resolve-work-queue-takeover.mjs
scripts/check-work-queue-takeover.mjs
scripts/lib/project-entry-trust.mjs
scripts/lib/project-fact-projection.mjs
scripts/lib/target-topology.mjs
scripts/lib/current-work-continuity.mjs
scripts/lib/same-run-evidence-envelope.mjs
scripts/lib/bootstrap-transaction.mjs
scripts/lib/behavioral-adoption-activation.mjs
scripts/lib/review-context-authority.mjs
scripts/lib/plan-review-binding.mjs
scripts/lib/artifact-schema.mjs
scripts/lib/native-rule-extraction.mjs
scripts/lib/project-signals.mjs
scripts/lib/path-safety.mjs
scripts/lib/evidence-authority.mjs
scripts/lib/adoption-apply-chain.mjs
```

The initial allowed schema and identity set is limited to:

```text
schemas/artifacts/project-entry-calibration.schema.json
schemas/artifacts/project-entry-trust.schema.json
schemas/artifacts/project-fact-projection.schema.json
schemas/artifacts/same-run-evidence-envelope.schema.json
schemas/artifacts/behavioral-adoption-activation.schema.json
schemas/artifacts/native-migration-plan.schema.json
schemas/artifacts/existing-rule-reconciliation.schema.json
schemas/artifacts/governance-convergence.schema.json
schemas/artifacts/controlled-native-adoption-review.schema.json
schemas/artifacts/work-queue-takeover.schema.json
schemas/artifacts/task-governance.schema.json
schemas/artifacts/unified-apply-plan.schema.json
schemas/artifacts/approval-record.schema.json
schemas/artifacts/controlled-apply-readiness.schema.json
schemas/artifacts/apply-execution-receipt.schema.json
schemas/artifacts/adoption-assurance.schema.json
schemas/artifacts/plan-review.schema.json
templates/workflow-version.json
templates/version-record.md
```

The initial allowed authority, guidance, documentation, and distribution set is
limited to:

```text
calibration-reports/project-entry-adoption-1.109.json
core/review-context-authority.json
core/project-entry-adoption-trust.md
core/operating-model.md
core/project-onboarding.md
core/behavior-complete-existing-project-adoption.md
docs/project-entry-adoption-trust.md
docs/operating-model.md
docs/start-here.md
docs/first-hour.md
docs/codex-usage.md
docs/behavior-complete-existing-project-adoption.md
platforms/codex/AGENTS.template.md
prompts/bootstrap-agent.md
prompts/project-onboarding-agent.md
prompts/native-migration-agent.md
prompts/adoption-assurance-agent.md
prompts/work-queue-agent.md
prompts/task-governance-agent.md
intentos-manifest.json
README.md
README.zh-CN.md
VERSION.md
package.json
docs/releases/1.109.0.md
releases/1.109.0/release-record.md
releases/1.109.0/self-check-report.md
releases/1.109.0/known-limitations.md
```

Generated parity may directly change only these starter-owned files:

```text
starters/generic-project/AGENTS.md
starters/generic-project/README.md
starters/generic-project/scripts/verify.sh
starters/codex-web-app/AGENTS.md
starters/codex-web-app/README.md
starters/codex-web-app/scripts/verify.sh
starters/codex-ios-app/AGENTS.md
starters/codex-ios-app/README.md
starters/codex-ios-app/scripts/verify.sh
starters/codex-android-app/AGENTS.md
starters/codex-android-app/README.md
starters/codex-android-app/scripts/verify.sh
```

Runtime, schema, core, docs, prompt, and Agent assets installed through the
manifest remain governed by their exact source paths in the preceding allowed
sets; generated-project tests verify their installed counterparts without
making those generated copies a second source of truth. The calibration report,
its schema, and its checker are source-only and are not copied into generated
projects. No business
project, platform runtime, release topology, CI workflow, hook, dependency, or
1.108 Business Universe implementation file is in scope. `scripts/lib/path-safety.mjs`,
`scripts/lib/evidence-authority.mjs`, and every 1.108 consumer are shared files:
their 1.108 behavior may only be preserved or consumed, never redefined.

The initial test set is:

```text
tests/project-entry-adoption-trust.test.mjs
tests/project-entry-adoption-consumer-chain.test.mjs
tests/project-entry-new-project-transaction.test.mjs
tests/project-entry-generated-parity.test.mjs
tests/project-entry-business-universe-binding.test.mjs
tests/project-entry-calibration.test.mjs
```

Minimal commit sets are: pre-implementation governance evidence; identity and
fact projection; authority inventory and evidence transport; adoption and
activation; bootstrap/apply transaction; consumer and generated parity; then
documentation, version, and release evidence. Version metadata cannot enter an
earlier commit set.

### Documentation and active guidance

Update current core and usage guidance to state:

- entry trust is mandatory;
- Guidance failure blocks active operation;
- project authority coverage must be complete or visibly incomplete;
- project stage, governance authority posture, behavioral adoption, and release
  readiness are separate;
- reports require strict current binding;
- behavior-complete adoption does not mean asset or authority replacement;
- absent, empty, non-empty, non-directory, and unsafe targets have distinct
  controlled setup behavior;
- direct-force initialization cannot bypass the controlled setup transaction;
- legacy workflow assets are migration evidence, not current identity;
- dirty current work is preserved and does not block read-only assessment;
- local conflicts block only their dependent scope;
- template-only governance is not current authority, while effectiveness
  remains a 1.110 claim;
- one original goal and decision projection serves every entry;
- generated projects must cold-start independently and route their first task;
- pending is not verified;
- hosted CI is optional unless the selected release implementation requires it;
- user does not resolve technical trust blockers or choose adoption depth.

### Current-plan authority lifecycle

Versioned plans are historical by default. During implementation, this exact
plan becomes current task authority only through the current Work Queue, Task
Governance, Change Boundary, Verification Plan, and `PLAN_REVIEW_PASSED` source
chain bound to its digest.

At 1.109 release, `core/review-context-authority.json` must register this exact
plan and the 1.109 release evidence as current product-contract assets. The
1.108 versioned plan and release records then return to historical status while
the current 1.108 Business Universe core/runtime contracts remain active. No
two versioned release plans may simultaneously claim current implementation
authority. A later release repeats the same promotion and retirement rule.

### Source and installed parity

Register required shared assets in the Manifest and every generated project
set. Generated projects must expose the same ordinary `work` entry, Guidance,
Work Queue, Task Governance, Conversation Drift, verification, and finish
contract used by source tests. Source-only adversarial fixtures remain
source-only and cannot become target adoption evidence.

## Goal And Subagent Orchestration

Implementation may use Goal Mode and read-only subagents.

### Main-thread ownership

The main thread owns:

- repository orientation and concurrent-change protection;
- architecture and authority decisions;
- final writes;
- integration and adversarial test execution;
- issue remediation;
- release close-out and claims.

### Suggested reviewers

- Identity And Path Reviewer;
- Project State And Cross-Entry Consistency Reviewer;
- New-Project Topology And Goal-Continuity Reviewer;
- Guidance Authority Reviewer;
- Existing Authority Completeness Reviewer;
- Legacy Asset And Current-Work Continuity Reviewer;
- Scoped Conflict Propagation Reviewer;
- Same-Run Evidence Chain Reviewer;
- Adoption Consumer Reviewer;
- Behavioral Adoption Activation Reviewer;
- Generated-Project Cold-Start And First-Task Reviewer;
- Apply Transaction Reviewer;
- Automation Semantics Reviewer;
- Zero-Experience Contract Reviewer;
- Compatibility And Generated-Project Reviewer;
- Adversarial Trust Reviewer.

### Rules

- declare review surfaces before assigning reviewers;
- reviewers stay read-only;
- no reviewer approves its own implementation;
- subagent output is advisory, not evidence authority;
- the main thread resolves conflicts;
- idle subagents are closed before allocating new ones;
- all subagents are closed before final close-out;
- unavailable subagents do not reduce the required review surface.

## Execution Phases

### Phase 0: Pre-implementation governance and current-state orientation

1. Bind this exact plan digest to one current Work Queue item.
2. Resolve Task Governance as `HIGH` and require plan review.
3. Persist an exact Change Boundary and phase/file ownership map, including
   explicit 1.108 shared-file ownership and forbidden paths.
4. Persist a Review Surface Card covering functional, code, verification, debt,
   target-topology/path safety, authority, migration, transaction, zero-
   experience responsibility, compatibility, and generated parity.
5. Persist a Verification Plan with exact positive, negative, rollback,
   cold-start, generated-parity, and 1.108 consumer-binding obligations.
6. Run independent read-only plan review, resolve every P0/P1 and blocking P2,
   close all review subagents, and persist a current report with
   `PLAN_REVIEW_PASSED`.
7. Produce the source-only generic calibration report with current commands,
   output digests, repository state, and target/source unchanged evidence.
8. Confirm 1.108 completion and current dirty-worktree ownership.
9. Reproduce every trust-chain issue against current code.
   This includes direct `--force-new-project` writes, absent-target pre-write
   directory creation, non-exact rollback, missing pending/blocked/rollback-
   incomplete receipt states, identity fail-open, Guidance non-consumption,
   authority truncation, same-run evidence drift, permanent adapter-only
   recommendations, marker-only activation, goal/current-work loss, and public
   write/exit metadata disagreement.
10. Reproduce cross-entry disagreement against generic source-only fixtures for
   varied existing-project conditions and a blank new-project target.
11. Map each issue to a shared invariant and consumer.
12. Freeze unrelated refactors and project-specific behavior.

Exit:

- current Work Queue, Task Governance, Change Boundary, Review Surface,
  Verification Plan, and Plan Review refs form one current source chain;
- plan review state is `PLAN_REVIEW_PASSED`, the plan digest still matches, and
  implementation review is ready;
- every accepted finding has current evidence;
- calibration claims resolve to the current generic calibration report rather
  than conversation memory or project-specific observations;
- concurrent 1.108 files are not overwritten;
- one exact integration and file-ownership map exists;
- no calibrated project-specific fact is proposed for core behavior.

No production file edit may begin before every Phase 0 exit condition passes.

### Phase 1: Canonical identity, shared project facts, and Guidance

1. Implement target-topology and shared canonical path validation.
2. Harden project identity parent topology and absent-leaf ancestor handling.
3. Implement original-goal, intent, assumption, and technical-decision
   projection.
4. Implement repository-aware project-fact and current-work collection.
5. Implement the orthogonal state projector, lifecycle evidence hierarchy, and
   scoped-conflict propagation.
6. Make global trust conflicts block globally and local conflicts block only
   dependent actions.
7. Integrate the shared projection and Review Context Authority into every
   public entry and assurance consumer.
8. Bind goal/decision, project-fact, and effective-Guidance digests.
9. Add absent/empty/non-empty topology, symlink, conflict-scope, drift,
   malformed-identity, release-vocabulary, and cross-entry-consistency tests.

Exit:

- no public route proceeds from untrusted identity or Guidance;
- one shared fact implementation is used by all consumers;
- the original goal is not lost or repeatedly requested;
- no release vocabulary can independently promote lifecycle stage;
- local conflicts cannot widen themselves into unrelated global blockers;
- unchanged facts produce identical state across all entry commands.

### Phase 2: Existing authority completeness

1. Replace silent count/depth truncation with complete accounting.
2. Add bounded continuation for large repositories.
3. Classify every source as current, active, draft, historical, retired,
   archived, generated/vendor, legacy, or unresolved.
4. Record unparsed rules and source-level outcomes.
5. Harden parser candidate discovery.
6. Recognize project-native baseline, gate, queue, session, task, and current
   work authorities from mappings rather than fixed filenames.
7. Distinguish template-only declarations from current structural authority.
8. Inventory known legacy workflow assets without treating them as current
   identity or silently deleting history.
9. Bind inventory digest through migration and reconciliation.
10. Add deep, large, mixed-lifecycle, legacy, template-only,
    punctuation-free, parser-uncertain, and current-task-conflict fixtures.

Exit:

- zero omitted means all sources are accounted for;
- incomplete scans fail closed without asking the user for technical choices;
- archived guidance cannot become current authority;
- legacy assets cannot fabricate current identity or remain silently active;
- template-only documents cannot fabricate current structural authority;
- nonstandard project-native authority is not reported missing.

### Phase 3: Same-run evidence and adoption consumer hardcut

1. Implement the structured same-run evidence envelope.
2. Let migration, reconciliation, convergence, review, and assurance consume
   one exact no-write chain.
3. Implement exact persisted authoritative source selection.
4. Run strict source checkers before consumption.
5. Bind current project, project-fact, Guidance, inventory, and source digests.
6. Replace substring state mapping with explicit mapping.
7. Add missing-intermediate-file, altered-envelope, stale, forged,
   wrong-project, and plan-only fixtures.

Exit:

- a same-run read-only chain does not require target-project files;
- a same-run envelope cannot masquerade as durable approval or activation;
- arbitrary Markdown cannot influence Task Governance;
- plan-only cannot become behavior-complete;
- stale evidence cannot pass strict review.

### Phase 4: Behavioral adoption recommendation and activation model

1. Implement evidence-derived adoption recommendation for blank new targets and
   varied existing-project conditions without project-type routing.
2. Separate behavioral adoption from asset migration, authority replacement,
   platform completion, and release readiness.
3. Model the selected native overlay as an exact controlled action set.
4. Make strong governed projects eligible for full behavioral adoption while
   preserving stronger project rules.
5. Reconcile project-native responsibility rules that delegate technical
   decisions back to the user.
6. Derive missing governance for weak projects without user technical choices.
7. Map current work and dirty-change ownership before selected apply.
8. Implement deterministic read-only behavioral route calibration,
   generated-project cold start, and strict activation evidence without
   changing the project Work Queue.
9. Seed the first ordinary task from the original creation goal, then record
   first-task progress separately from activation state.
10. Add blank-new, strong-governed, weak-governed, mixed-platform,
    local-gate-only, legacy-asset, dirty-current-work, and
    stale-project-native-authority fixtures.

Exit:

- `ADAPTER_ONLY` is not the automatic permanent result for strong projects;
- missing hosted CI affects release readiness only;
- `VERIFIED_ACTIVE` requires a proved task route, not marker files;
- blank new projects reach behavior-complete adoption through controlled setup;
- existing current work is mapped rather than discarded;
- full behavioral adoption does not replace project-owned authority.

### Phase 5: Init/apply transaction close-out

1. Remove every direct-force write bypass for absent, empty, and non-empty
   targets.
2. Add topology-aware complete no-write preflight and final `lstat` recheck.
3. Implement the same-filesystem bootstrap transaction envelope and harden
   exact absent/empty/non-empty rollback and failed-receipt behavior.
4. Add Git/content-digest evidence adapters and current-work overlap checks.
5. Consume structured strict cold-start and activation states.
6. Add pending activation receipt state.
7. Reproduce late collision, target swap, mid-apply failure, rollback failure,
   retry idempotence, concurrent change, and BL2 pending cases.

Exit:

- preflight failures write nothing;
- complete rollback restores the exact prior target topology;
- failed applies restore or explicitly report incomplete rollback;
- concurrent or overlapping current work is not overwritten;
- pending never becomes verified.

### Phase 6: Public entry and automation semantics

1. Normalize process and decision states.
2. Make `work`, `start`, `next`, `doctor`, `baseline`, help, and dry-run consume
   one target, goal, projection, and read/write classification.
3. Make pre-setup absence an expected new-project state and post-apply absence
   a strict blocker.
4. Make aggregate entries propagate internal trust failure.
5. Define non-zero trust/integrity behavior.
6. Make technical internal phases continue without user prompts.
7. Integrate Conversation Drift and Work Queue continuity for side questions,
   pauses, scope changes, and new tasks.
8. Structure every user question by an allowed responsibility reason.
9. Preserve plain-language output and one safe final outcome.
10. Add CLI, help, active-guidance, and programmatic-consumer tests.

Exit:

- automation cannot interpret an internal trust failure as success;
- public and advanced entries cannot contradict setup or write eligibility;
- the ordinary user still sees one understandable result;
- the user is not asked to pass reports between internal commands or approve
  technical phases;
- side discussions cannot discard or silently expand the current task.

### Phase 7: Consumer integration and generated parity

1. Update Adoption Assurance, Work Queue, Conversation Drift, Task Governance,
   and Unified Closure.
2. Propagate blockers to controlled apply and closure consumers.
3. Update Manifest, starters, generated projects, references, and active
   guidance.
4. Run a generated-project cold start in an isolated process with source-
   repository access excluded from that process.
5. Run one read-only isolated calibration projection and one first ordinary
   task through the generated project's own public entry.
6. Run a generic first-task fixture that conditionally requires 1.108 Business
   Universe evidence and prove strict finish blocks when that evidence is
   missing, stale, or bound to another task.
7. Run installed-project and compatibility tests for Git and non-Git targets.

Exit:

- source and installed behavior agree;
- generated projects independently reach `VERIFIED_ACTIVE` and govern their
  first ordinary task;
- no consumer reconstructs weaker trust independently.

### Phase 8: Review, remediation, and release

1. Run focused and full verification.
2. Run all adversarial fixtures.
3. Run cross-entry differential tests over every generic calibration fixture.
4. Perform independent review over every declared surface.
5. Fix P0/P1 findings and resolve or record bounded P2 follow-ups.
6. Update version and release evidence only after acceptance.

Exit:

- all accepted trust-chain reproductions are closed;
- no unresolved P0/P1 remains;
- release claims match evidence.

## Acceptance Plan

### A. Project identity positive

- ordinary new project resolves one canonical identity;
- ordinary existing project resolves one canonical identity;
- Git and non-Git projects bind supported identity correctly;
- current identity produces `CURRENT` and an allowed next route;
- an approved exact collaboration bridge produces `BRIDGE_CURRENT` without
  pretending that `.intentos` was installed;
- identity digest remains stable when inputs do not change;
- a safe absent leaf and a safe empty directory both resolve as new-project
  targets without fabricating installed identity;
- a non-empty project without a durable IntentOS identity is exactly
  `UNBOOTSTRAPPED`, regardless of how many governance documents it contains;
- a non-empty project containing known legacy workflow directories and copied
  governance assets remains `UNBOOTSTRAPPED` unless a current installed or
  approved bridge identity passes;
- unbootstrapped empty target routes only to safe new-project setup planning;
- unbootstrapped non-empty target routes only to existing-project discovery and
  adoption planning.

### B. Project identity negative

- `.intentos` parent symlink fails;
- identity-file symlink fails;
- nested parent symlink fails;
- path escape and traversal fail;
- an absent leaf beneath a symlinked or swapped ancestor fails;
- a non-directory target fails;
- malformed identity fails;
- forced origin conflicting with project evidence fails;
- a bridge with stale IntentOS version, changed entry content, mismatched root,
  or invalid Guidance digest cannot remain `BRIDGE_CURRENT`;
- governance-file presence cannot produce `PARTIALLY_BOOTSTRAPPED` without an
  installed or approved durable identity binding;
- conflicted/unknown/blocked identity cannot prepare Work Queue or routine work;
- `routineEngineeringMayProceedAfterInternalGates` is `No` for every identity
  blocker.

### C. Project fact projection positive

- an authoritative current development-stage record plus release-planning
  vocabulary remains `DEVELOPMENT`;
- `PRODUCTION_ACTIVE` requires current deployment/environment evidence bound to
  the repository identity;
- project-native engineering and environment baselines at nonstandard paths are
  recognized once and reported consistently;
- the original goal, execution intent, reversible assumptions, unresolved
  facts, and Codex-derived technical decisions retain one digest across setup,
  baseline, activation, and first-task consumers;
- template-only baseline and gate files are reported as `TEMPLATE_ONLY`, not
  missing and not current authority;
- local blocking gate declarations count toward governance authority posture
  without claiming control effectiveness or fabricating hosted CI;
- a project-native TODO, queue, or session system is detected through authority
  mapping rather than one fixed filename;
- coherent current work and owned dirty changes are detected without blocking
  read-only assessment;
- iOS, Android, Web, backend, admin, and mini-program surfaces can hold different
  completion states in one project;
- unchanged inputs produce one stable projection digest across all consumers.

### D. Project fact projection negative and consistency

- release, rollback, production, or security vocabulary alone cannot produce
  `PRODUCTION_ACTIVE`;
- missing hosted CI cannot produce `NOT_ADOPTED` when behavioral activation
  evidence otherwise passes;
- an incomplete platform shell cannot make another functional platform absent;
- a historical or archived stage statement cannot override current authority;
- contradictory current stage authorities produce `CONFLICTED`;
- active documentation that contradicts current executable or configuration
  facts produces a scoped conflict rather than silently winning or losing;
- a current-task conflict blocks that task transition without fabricating a
  global identity conflict;
- a platform configuration conflict blocks only dependent platform work and
  release unless it also invalidates global trust;
- an unowned or concurrently changing dirty path blocks overlapping apply but
  not read-only assessment;
- `start`, `next`, `doctor`, `baseline`, Workflow Map, Adoption Review, and
  Adoption Assurance cannot disagree about a shared fact for one digest;
- any cross-entry disagreement produces
  `PROJECT_FACT_PROJECTION_DIVERGENCE` and non-zero automation status.

### E. Guidance positive

- valid effective guidance graph passes all entries;
- current graph digest binds Adoption Assurance;
- nested valid guidance is included exactly once;
- generated-project guidance resolves with source parity.
- a trusted source entry can guide an unbootstrapped project without falsely
  claiming project-local Guidance is active.

### F. Guidance negative

- symlinked guidance fails;
- outside-project guidance fails;
- missing active guidance fails;
- conflicting responsibility language fails;
- stale graph digest fails;
- checker failure makes work/start/doctor/adoption fail closed;
- marker headings alone cannot prove active Guidance.

### G. Authority completeness positive

- more than ten governance sources are all accounted for;
- more than five hundred governance candidates converge through bounded pages
  without changing the final digest;
- deeply nested monorepo guidance is discovered;
- punctuation-free imperative rules are parsed or explicitly unparsed;
- bounded batches converge to one complete inventory digest;
- current, active, draft, historical, retired, archived, generated/vendor, and
  legacy, and unresolved sources receive explicit lifecycle outcomes;
- known legacy workflow identity and entry sources receive exact migration
  disposition without becoming current authority;
- project-native registries and SoT indexes are used as authority hints without
  becoming unverified truth;
- excluded sources have evidence and reason;
- reconciliation counts equal migration inventory counts.

### H. Authority completeness negative

- count truncation without warning fails;
- static first-ten-source or first-forty-rule completion claims fail;
- fixed-depth omission fails;
- parser uncertainty silently dropped fails;
- discovered/scanned/parsed counts inconsistent fails;
- an archived source influencing current rules without an active authority ref
  fails;
- a legacy source influencing current routing without an exact mapped current
  authority ref fails;
- a template-only file counted as current baseline or gate authority fails;
- strict adoption from incomplete inventory fails;
- omitted zero with an unaccounted source fails;
- user is not asked which technical source to ignore.

### I. Same-run and persisted adoption source positive

- Native Migration output can feed Reconciliation in one read-only run without
  writing an intermediate project file;
- Reconciliation, Governance Convergence, Adoption Review, and Assurance retain
  the same run identity, project binding, and upstream digests;
- exact report ref resolves through Evidence Authority;
- schema and strict checker pass;
- current identity, Guidance, inventory, and source digests match;
- explicit state mapping preserves plan, partial, applied, and verified states;
- current report can be consumed by Task Governance.

### J. Same-run and persisted adoption source negative

- a same-run envelope with an altered payload, producer, project root, schema,
  or digest fails;
- an ephemeral envelope cannot satisfy durable approval, apply, activation, or
  future-task authority;
- Reconciliation cannot silently fall back to zero rules when a valid same-run
  migration result exists;
- two-field or prose-only forged report fails;
- latest filename without authority ref fails;
- wrong-project report fails;
- stale project-state report fails;
- changed production/governance signal invalidates dependent report;
- source digest mismatch fails;
- `READY_FOR_*_PLAN_ONLY` cannot map to behavior-complete;
- blocked upstream source remains blocked downstream.

### K. Behavior-complete adoption positive

- a blank safe new-project target reaches full behavioral adoption through one
  goal-bound controlled setup, cold-start, and route-activation chain;
- a strongly governed development monorepo receives an evidence-derived target
  of full behavioral adoption through a selected native overlay;
- stronger project-owned gates, baselines, SoT, queue, release, and runtime
  authority remain active and mapped;
- an under-governed project receives Codex-derived missing governance actions
  without user technical design work;
- project-native rules that make tests, review depth, baseline, or technical
  approval user-opt-in are reconciled to the current IntentOS responsibility
  contract without weakening their actual safety obligation;
- the selected overlay contains only exact identity, entry, routing, mapping,
  and evidence actions needed by the target project;
- useful legacy rules and history remain mapped while duplicate active legacy
  routing is retired through the exact plan;
- current in-flight work is mapped to one Work Queue item without rewriting its
  pre-IntentOS history;
- a synthetic read-only route projection enters through the project entry,
  reaches Work Queue and Task Governance resolvers, selects the correct
  review/verification depth, and closes through finish without project writes;
- strict activation evidence produces `VERIFIED_ACTIVE` only after that route
  passes;
- calibration leaves no project queue item before the first ordinary task
  becomes `CURRENT`;
- hosted CI and production release readiness remain independent outcomes.

### L. Behavior-complete adoption negative

- docs-only adoption prose cannot produce `VERIFIED_ACTIVE`;
- a present `.intentos` directory alone cannot produce `VERIFIED_ACTIVE`;
- legacy workflow directories, version files, copied assets, or adoption prose
  cannot produce current identity or `VERIFIED_ACTIVE`;
- a project-local entry that does not default to IntentOS routing fails
  activation;
- a task route that skips Work Queue, required review, verification, or finish
  fails activation;
- a strong-governance project cannot be forced permanently to `ADAPTER_ONLY`
  without a concrete unresolved safety blocker;
- full behavioral adoption cannot replace project release, runtime, production,
  or business authority;
- an active project rule that still delegates required technical testing or
  review choice to a zero-experience user fails behavioral activation;
- incomplete platform surfaces cannot be hidden by a project-wide ready label;
- incomplete platform or backend surfaces cannot by themselves block an
  otherwise valid behavioral activation;
- a dirty worktree cannot be used as a blanket reason to skip read-only
  recommendation, while unsafe overlapping apply cannot proceed;
- a local task, platform, or release conflict cannot be widened into an
  unrelated global adoption blocker;

### M. Init and preflight positive

- a safe absent leaf and a truly empty safe directory initialize through the
  same controlled setup contract with distinct rollback topology;
- non-empty target produces plan/read-only route;
- Git and content-digest-bound non-Git targets produce valid before/after
  evidence;
- complete preflight validates every target before writing;
- exact controlled plan applies and records before/after state;
- successful strict cold start and activation produce `APPLY_VERIFIED`;
- setup retry after complete rollback is idempotent.

### N. Init and apply negative

- force flag cannot directly write an absent, empty, or non-empty project;
- target symlink fails;
- non-directory target fails;
- late target collision is caught before writes;
- target or ancestor swap after preflight is caught before commit;
- source missing/digest mismatch fails before writes;
- mid-apply injected failure restores exact absent or empty prior topology;
- unexpected apply result triggers rollback;
- rollback failure is explicit;
- rollback failure records every residual path and returns non-zero;
- concurrent or unowned overlapping current work blocks before write;
- no partial installation is reported as success;
- BL2 or equivalent pending evidence produces
  `APPLY_PENDING_ACTIVATION`, never `APPLY_VERIFIED`;
- exit zero with structured pending cannot satisfy activation.

### O. Public entry and exit semantics

- clean ready state returns allowed decision and successful process status;
- `work`, `start`, `next`, `doctor`, and `baseline` agree that an absent or
  empty pre-setup target is a valid new-project state;
- pre-setup `doctor` does not report expected missing installation assets as a
  failed installed project;
- help, dry-run, structured output, and execution preserve the same supplied
  target and read/write classification;
- no command says both `NO_USER_ACTION` and that the user must make a technical
  choice for the same projection;
- identity, Guidance, inventory, source, apply, and activation integrity failures
  return non-zero;
- aggregate entry propagates child-check failure;
- missing business fact remains a valid blocked product state but cannot
  authorize dependent action;
- internal inventory pages, reconciliation, recommendation, and plan review
  continue automatically within one public request;
- the user is not required to paste an intermediate report into another
  command;
- structured and human output agree;
- `--enforce` is not required to make trust/integrity failure non-zero.

### P. Cross-consumer acceptance

- one project-entry trust digest is preserved across relevant consumers;
- one project-fact digest is preserved across relevant consumers;
- one original-goal and technical-decision digest is preserved across relevant
  consumers;
- no consumer accepts a weaker independent reconstruction;
- baseline and adoption consumers cannot disagree about the same discovered
  baseline, queue, gate, CI, release, or lifecycle observation;
- scoped conflicts produce the same dependent-action set in every consumer;
- Work Queue and Conversation Drift preserve the current task across side
  questions, pauses, scope changes, and resumes;
- Task Governance cannot proceed from forged adoption evidence;
- Adoption Assurance cannot become verified from marker headings;
- Unified Closure preserves unresolved entry/adoption blockers;
- 1.108 Business Universe remains independent and passes regression tests;
- 1.110 can later consume the trusted chain without compatibility bypass.

### Q. Zero-experience acceptance

- user gives only the goal or unavailable business fact;
- no user question asks for identity, Guidance, scan, parser, schema, digest,
  platform technology, framework, starter, Profile, baseline mode or level,
  pack, architecture, database, Git, task tier, test strategy or tool,
  reviewer, adoption depth, overlay type, CI provider, rule disposition,
  action list, rollback, receipt, or technical-risk acceptance;
- Codex selects and explains the technical adoption route in plain language;
- every user question carries an allowed responsibility reason: missing
  business fact, product-use preference, unavailable external fact, or exact
  real-world-effect consent;
- reversible project-local adoption work within the original request does not
  trigger repeated technical confirmations;
- a request to inspect, review, explain, or discuss produces no project writes;
- technical blockers produce one plain explanation and Codex-owned next action;
- real-world consent is exact and bounded;
- internal hardcut does not add public commands.

### R. New-project end-to-end acceptance

- a natural-language creation request binds one goal and authorizes reversible
  local setup plus a first bounded task after internal gates;
- an insufficient goal writes nothing, asks only the minimum plain product-use
  question, and resumes the same request after the answer;
- an undecided platform defers only dependent platform-specific actions and
  never creates a technical choice menu;
- setup produces current identity, local Guidance, one Work Queue, Task
  Governance routing, exact receipt, and cold-start evidence;
- the generated-project cold-start process uses the sanitized source-isolation
  contract, cannot resolve source paths, and leaves source-tree before/after
  digests unchanged;
- calibration runs through an isolated read-only queue projection, never
  becomes a project Work Queue `CURRENT` item, and leaves project state
  unchanged;
- the original goal then creates the only ordinary `CURRENT` item;
- the first ordinary task selects risk-appropriate planning, review,
  verification, and evidence without user technical decisions;
- strict finish rejects missing queue, governance, plan-review, verification,
  evidence, or current-goal binding;
- successful first-task finish does not overclaim product or release readiness.

### S. Existing-project continuity acceptance

- varied existing-project conditions are evaluated through orthogonal facts,
  not a closed project-type enum;
- legacy assets, project-native authority, current work, dirty changes, and
  platform completion are observed independently;
- read-only assessment completes on a dirty worktree and explains the exact
  bounded apply blocker, if any;
- safe current work is mapped without resetting history or asking the user to
  reconstruct technical progress;
- task-state, documentation/executable, and platform-configuration conflicts
  retain distinct scopes;
- behavior-complete adoption can succeed while selected platform or release
  readiness remains incomplete;
- one current IntentOS operating entry remains after activation; duplicate
  active legacy routing does not.

### T. Business Universe consumer-binding acceptance

- a generic first ordinary task whose structural evidence indicates category,
  origin, participant, selection, exclusion, lifecycle, or path-coverage risk
  causes Task Governance to invoke the current 1.108 routing authority;
- required Business Universe evidence is bound to the same project, current
  Work Queue item, task, intent, Task Governance result, and scenario IDs;
- missing, stale, forged, wrong-task, or wrong-project Business Universe
  evidence blocks strict finish;
- a task for which current structural evidence proves Business Universe
  Coverage is not required does not create an empty report or user question;
- 1.109 consumes the 1.108 result and never reimplements its trigger, scenario,
  lifecycle, provenance, or challenger model.

## Adversarial Fixture Set

Required source-only fixtures:

1. parent `.intentos` symlink identity spoof;
2. conflicted forced project origin;
3. symlinked active guidance;
4. guidance checker failure with aggregate entry;
5. non-empty direct-force initialization;
6. late-path collision after earlier candidate actions;
7. pending industrial baseline with zero exit code;
8. eleven or more nested governance sources;
9. deeply nested monorepo authority source;
10. punctuation-free imperative governance rules;
11. parser-uncertain rule candidate;
12. two-field forged adoption Markdown;
13. plan-only state containing selected/native wording;
14. stale adoption report after relevant project-state change;
15. wrong-project adoption report;
16. aggregate command with internal checker failure and outer zero status;
17. strongly governed development monorepo containing release and production
    vocabulary but no current deployment evidence;
18. project-native baselines, queue, sessions, and gates at nonstandard paths;
19. strong local gates with no hosted CI configuration;
20. more than five hundred governance candidates requiring multiple pages;
21. mixed current, draft, historical, retired, archived, and generated sources;
22. same-run migration through assurance with no intermediate target file;
23. altered or cross-project same-run evidence envelope;
24. one public consumer independently contradicting the shared project facts;
25. strong project governance incorrectly forced to permanent adapter-only;
26. installed markers with a task route that bypasses Work Queue, review,
    verification, or finish;
27. stale project-native authority that exists but cannot satisfy a current
    task obligation;
28. active project-native guidance that delegates testing, reviewer, baseline,
    or technical approval selection to the user;
29. read-only natural-language intent incorrectly treated as apply permission;
30. copied legacy workflow assets and version markers with no current IntentOS
    identity;
31. coherent in-flight task with attributable dirty changes during read-only
    adoption assessment;
32. unattributed or concurrently changing dirty paths overlapping selected
    apply actions;
33. multiple current task records claiming incompatible states;
34. multiple current platform configurations claiming incompatible authority;
35. active documentation contradicting current executable or configuration
    facts;
36. empty or placeholder baseline and CI declarations counted as current
    authority;
37. absent new-project leaf beneath a safe existing ancestor;
38. absent new-project leaf beneath a symlinked or swapped ancestor;
39. empty target receiving a hidden entry or target swap between preflight and
    commit;
40. vague creation goal with one missing product-use fact;
41. undecided platform combined with a prompt that tries to make the user
    choose Profile, BL, pack, database, tests, or reviewer;
42. `work`, `start`, `next`, `doctor`, or `baseline` contradicting the shared
    pre-setup decision;
43. injected mid-apply failure over absent and empty target topology variants;
44. injected rollback failure with explicit residual-path accounting;
45. generated-project cold start in a source-isolated process with the source
    tree unchanged;
46. non-Git generated project requiring content-digest-bound activation;
47. first ordinary task bypassing each mandatory route stage in turn;
48. first-task evidence becoming stale before strict finish;
49. side discussion, scope change, pause, resume, and new-task messages during
    setup or first-task execution;
50. retry after complete rollback proving setup idempotence;
51. generated-project help or active guidance contradicting actual public-entry
    behavior.

Every fixture must assert the source checker, the final public consumer, and the
machine process status. All fixtures are generic synthetic repositories or
target topologies. They must not contain names, paths, accounts, ports,
platform credentials, or business rules copied from a calibrated real project.

## Required Verification

```text
node --check for every changed script
target topology, nearest-safe-ancestor, TOCTOU, and exact rollback tests
project identity focused tests
original-goal, intent, assumption, and technical-decision projection tests
shared project-fact projection and cross-entry differential tests
orthogonal lifecycle/governance/platform/adoption/release-state tests
scoped-conflict propagation tests
Review Context Authority tests
public work/start/doctor/next/baseline/workflow-map tests
public help, dry-run, metadata, and read/write classification tests
existing workflow and native migration tests
large paged authority inventory and source-lifecycle tests
legacy workflow asset and structural-authority posture tests
current-work, Work Queue, dirty ownership, overlap, and concurrency tests
native rule extraction tests
existing-rule reconciliation tests
same-run structured evidence-chain tests
governance convergence tests
controlled native adoption review tests
behavior-complete recommendation and activation-route tests
Conversation Drift, Work Queue, and Task Governance tests
init/update plan and transaction tests
absent/empty/non-empty target rollback and retry-idempotence tests
controlled apply/readiness/receipt tests
industrial baseline strict-state tests
Adoption Assurance tests
Unified Closure / finish tests
generated-project isolated cold-start tests
Git and non-Git content-digest activation tests
first-ordinary-task route and stale-evidence tests
1.108 Business Universe regression tests
project-entry Business Universe consumer-binding strict-chain test
generated-project and installed-project smoke in a source-isolated process with
source-tree before/after identity and content digests unchanged
Manifest and active-guidance checks
npm run verify
git diff --check
```

Release evidence must record command, exit code, relevant structured state, and
evidence path or digest.

## Review Plan

Required review surfaces:

- target topology, nearest safe ancestor, and TOCTOU safety;
- canonical path and symlink safety;
- original-goal, intent, assumption, and technical-decision continuity;
- identity conflict propagation;
- lifecycle evidence hierarchy;
- orthogonal state projection;
- scoped-conflict classification and dependent-action propagation;
- cross-entry project-fact consistency;
- effective Guidance authority;
- source inventory completeness;
- source lifecycle classification;
- legacy asset classification and duplicate-authority retirement;
- current-task, queue, dirty ownership, overlap, and concurrent-change
  continuity;
- template-only versus current structural authority;
- parser omission behavior;
- same-run evidence transport and durable-evidence boundary;
- strict adoption source selection;
- project/source/freshness binding;
- state mapping;
- behavior-complete recommendation quality;
- responsibility-contract reconciliation;
- selected overlay scope and project-authority preservation;
- behavioral task-route activation proof;
- generated-project isolated cold start;
- Git and non-Git snapshot evidence;
- first ordinary task and strict finish binding;
- Conversation Drift behavior during setup and first-task execution;
- init preflight and transaction behavior;
- rollback and receipt truth;
- structured activation outcome;
- public exit semantics;
- downstream consumer propagation;
- zero-experience responsibility;
- compatibility and installed parity;
- release claim precision.

Review rules:

- P0 stops work immediately;
- pre-implementation P1 and blocking P2 findings are fixed before
  `PLAN_REVIEW_PASSED` and before implementation begins;
- post-implementation P1 findings are fixed before release;
- a non-blocking P2 may be deferred only through a current accepted-by ref,
  reason, bounded scope, expiry, and restore or follow-up condition; the
  implementation owner cannot self-accept it;
- repeated findings trigger systemic analysis instead of local patching;
- reviewer PASS without current evidence is advisory only;
- implementation owner does not independently approve its own high-risk work.

## IntentOS Principles Review

### Zero-experience user

PASS. Technical trust decisions stay inside IntentOS/Codex. The user is not
asked to understand project identity, Guidance, scanning, parsing, evidence, or
apply mechanics. Internal phases continue automatically, and a user is not
asked to choose project type, platform technology, starter, Profile, baseline,
pack, architecture, database, repository mode, task tier, test strategy,
reviewer, adapter mode, migration depth, CI provider, rule disposition, or
verification strategy.

### Evidence-bound decisions

PASS. Every accepted source binds canonical identity, exact refs, structured
state, digests, and invalidation conditions. Same-run evidence is exact and
composable but cannot impersonate durable approval or activation evidence.
New-project setup additionally binds target topology, original goal, technical
decision projection, exact receipt, cold-start evidence, and first-task route.

### Fail-closed principles check

PASS. Identity conflict, Guidance failure, incomplete authority, untrusted
reports, apply failure, and pending activation block dependent actions.
Unbootstrapped state remains a bounded setup route rather than being mislabeled
as corruption or active adoption. Technical incomplete states trigger continued
Codex investigation where safe, not repeated user decisions.

Scoped task, platform, release, and real-world conflicts fail closed for their
dependent actions without unnecessarily disabling unrelated read-only work or
behavioral adoption.

### New-project continuity

PASS. Absent and empty targets use one controlled setup chain, exact rollback,
generated-project cold start, isolated route calibration, and first ordinary
task. Initialization markers alone cannot prove usable adoption. Git is not a
user prerequisite, and product or platform incompleteness does not become a
false adoption failure.

### Existing-project authority

PASS. The plan preserves stronger project authority and makes unread or
unparsed authority visible instead of replacing it. Strong governance does not
force permanent adapter-only operation; it becomes mapped authority under
behavior-complete adoption. Legacy assets and in-flight work are inventoried,
mapped, and preserved without fabricating current identity or rewriting
history.

### Behavior-complete adoption

PASS. The plan makes the daily IntentOS workflow the target while keeping full
asset migration, authority replacement, platform completion, and release
readiness separate. `VERIFIED_ACTIVE` requires a proved task route and a fresh
project-local cold start. A new project's first ordinary task independently
proves that the activated route is usable for real work.

### No new completion authority

PASS. The normalized trust object is a consumer input. Existing source systems
and Unified Closure retain their authority.

### No project coupling

PASS. The plan contains generic topology, goal continuity, identity, guidance,
inventory, current-work, evidence, apply, activation, and first-task contracts
only. Existing and new-project calibration is represented only by generic
conditions and synthetic fixtures, never by a closed project-type enum.

### Complexity control

PASS WITH CONDITION. The implementation must extend existing source artifacts
and share libraries rather than introduce parallel public reports and commands.
The orthogonal dimensions live in one shared projection, not separate public
state systems.

### Safety review

PASS FOR IMPLEMENTATION PLANNING, subject to independent path, transaction, and
consumer review before release.

### Review corrections applied

1. Unbootstrapped projects are now distinguished from corrupted installed
   identity. They can enter read-only setup/adoption planning without being
   mislabeled as active or trusted.
2. Guidance authority is selected by entry state: source, unbootstrapped,
   installed, or approved existing-project bridge.
3. The normalized `project_entry_trust` object is explicitly a consumer input,
   not a new authority or completion system.
4. Repository scan budgets remain allowed only with visible continuation and
   incomplete state; they can never silently prove complete authority coverage.
5. Direct-force initialization for every target topology is treated as an
   intentional safety hardcut, not a compatibility behavior that can bypass
   plan, preflight, transaction, receipt, and activation.
6. Exit semantics distinguish genuine user-input states from trust/integrity
   failures while keeping dependent actions unauthorized in both cases.
7. Identity, lifecycle, governance authority posture, platform completion, behavioral
   adoption, release readiness, and real-world effect are now independent.
8. Every public consumer uses one project-fact projection; release vocabulary
   cannot become deployment proof.
9. Same-run read-only outputs can feed downstream resolvers without requiring
   target-project report files.
10. Strong existing projects can reach full behavioral adoption through a
    selected overlay without replacing stronger project authority.
11. Hosted CI and complete platform implementation are no longer prerequisites
    for behavioral adoption.
12. Behavioral activation requires an end-to-end task-route simulation rather
    than docs-only or marker-file evidence.
13. The original adoption request covers reversible technical progression;
    repeated internal approval prompts are forbidden.
14. Calibration conditions are no longer represented as project-type enums;
    routing uses orthogonal target, lifecycle, governance, platform, work,
    adoption, release, and effect observations.
15. Known legacy workflow assets are migration evidence rather than current
    identity, and duplicate active routing must be reconciled.
16. Dirty current work no longer blocks read-only adoption assessment; exact
    ownership, overlap, concurrency, and rollback determine apply safety.
17. Conflicts now carry affected scope so local task/platform/release problems
    cannot become unrelated global blockers.
18. Template-only governance is structurally distinguished from current
    authority without preempting 1.110 effectiveness review.
19. Absent and empty new targets share one controlled setup transaction with
    distinct exact rollback outcomes.
20. Original goal and Codex-derived technical decisions remain one shared input
    across public entries, setup, activation, and first-task routing.
21. Generated-project cold start is isolated from the source repository and
    supports Git or content-digest evidence.
22. The first ordinary task must traverse Work Queue, Task Governance,
    risk-derived review/verification, evidence, and strict finish.
23. Conversation Drift preserves current work across side questions, pauses,
    scope changes, and new tasks.

## Stop Conditions

Stop implementation or release if:

- current 1.108 shared-file ownership is unclear;
- target topology or nearest-safe-ancestor handling differs across consumers;
- path safety is reimplemented inconsistently across consumers;
- an absent or empty target can bypass the controlled setup transaction;
- exact rollback cannot distinguish absent and empty prior topology;
- target or ancestor swaps after preflight are not detected;
- the original goal or technical decision projection can be dropped or
  independently reconstructed;
- identity conflict can still route routine work;
- release vocabulary can still promote a project to production-active without
  current deployment evidence;
- any public consumer can contradict the shared project-fact projection;
- any public consumer can widen or narrow a scoped conflict independently;
- governance authority posture can still fabricate installed identity;
- Guidance failure remains advisory to a public entry;
- any discovered governance source can disappear silently;
- a fixed source/rule cap can still support a complete claim;
- historical or archived authority can silently become current;
- legacy workflow assets can fabricate current identity or remain silently
  active beside the verified entry;
- template-only governance can count as current authority;
- current in-flight work can be dropped, reset, or overwritten during adoption;
- dirty worktree presence can prevent complete read-only assessment without a
  specific trust or safety reason;
- same-run consumers require a target-project file only to pass structured
  evidence between internal phases;
- a downstream consumer reads unverified Markdown directly;
- plan-only can become behavior-complete;
- marker files can become `VERIFIED_ACTIVE` without a behavioral task-route
  simulation;
- strong governance automatically forces permanent adapter-only operation;
- hosted CI absence blocks behavioral adoption rather than only the affected
  release path;
- relevant project change does not invalidate adoption evidence;
- direct-force writes remain possible for any target topology;
- preflight can write before validating every action;
- generated-project activation can depend on source-repository paths, installer
  memory, unrecorded environment, or Git-only assumptions;
- a synthetic calibration task remains `CURRENT` or replaces the first ordinary
  task;
- a generated project can claim ordinary readiness without routing its first
  task through mandatory governance and finish;
- pending can become verified;
- aggregate exit status can hide trust/integrity failure;
- technical trust decisions are delegated to the user;
- the user is asked to choose platform technology, Profile, baseline, pack,
  architecture, database, Git, tests, reviewer, or another technical menu;
- obsolete project-native responsibility text can still make testing, review,
  baseline, or technical approval user-opt-in after activation;
- the user must approve intermediate reports, choose adoption depth, or carry
  evidence between commands;
- inspection or discussion intent can trigger target-project writes;
- a side discussion can discard current work, silently expand scope, or become
  apply permission;
- source and installed behavior diverge;
- a new public workflow or completion authority is introduced;
- unresolved P0/P1 findings remain;
- release claims exceed evidence.

## Allowed Claims After Acceptance

- IntentOS can fail closed on conflicted or unsafe project identity.
- IntentOS separates identity, lifecycle, governance authority posture, platform
  completion, behavioral adoption, release readiness, and real-world effect.
- All public entry and adoption consumers use one current project-fact
  projection.
- IntentOS public entries consume one verified effective Guidance graph.
- IntentOS can account for every discovered existing-project authority source
  without silent truncation.
- IntentOS consumers accept only exact, strict, current, project-bound adoption
  evidence.
- Same-run read-only resolvers can consume exact upstream evidence without
  writing intermediate project artifacts.
- A blank safe new project can reach full behavioral adoption through one
  goal-bound controlled setup, cold-start, and route-activation chain.
- A governed existing project can reach full behavioral adoption through a
  selected overlay while preserving stronger project-owned authority.
- Legacy assets and in-flight work can be reconciled without fabricating
  current identity, duplicating active routing, or rewriting history.
- Local task, platform, release, and real-world conflicts block only their
  dependent actions unless global trust is affected.
- `VERIFIED_ACTIVE` proves that the default IntentOS task route was exercised
  and checked from the project-local entry.
- IntentOS cannot directly force-install any target outside the controlled
  setup/apply transaction.
- Generated projects can prove activation before Git exists by using canonical
  content-digest evidence.
- The first ordinary task is governed from the original goal without requiring
  user technical choices.
- IntentOS receipts distinguish blocked, pending, rolled back, and verified
  apply outcomes.
- IntentOS automation exit status reflects trust and integrity blockers.
- These technical protections do not increase ordinary user decision burden.

## Forbidden Claims After Acceptance

- IntentOS has proven every project rule semantically correct.
- Complete discovery guarantees every possible real-world rule was documented.
- Release-related vocabulary proves that a project is production-active.
- Strong governance or project-native docs prove that IntentOS is installed.
- Legacy workflow directories or copied assets prove current IntentOS identity.
- An empty template or declared check proves current or effective governance.
- A dirty worktree makes read-only adoption assessment impossible.
- One local task or platform conflict blocks unrelated project adoption.
- Successful file generation proves the generated project can run IntentOS.
- Verified adoption proves product correctness.
- Verified activation authorizes release or production.
- Full behavioral adoption means every IntentOS asset was copied.
- Full behavioral adoption means project release, runtime, production, or
  business authority was replaced.
- Hosted CI is required for all IntentOS adoption.
- Git is required before new-project behavioral activation.
- The user must choose project type, platform technology, Profile, BL, packs,
  architecture, database, tests, or reviewer before setup can continue.
- A same-run ephemeral result is durable approval or release evidence.
- IntentOS can ignore stronger project authority.
- IntentOS can safely follow arbitrary project reports or commands.
- 1.109 replaces 1.108 Business Universe or 1.110 Control Effectiveness.
- Project Entry Trust authorizes implementation or real-world effects.

## Completion Rule

1.109 is complete only when source and generated-project evidence proves:

```text
Every public entry and adoption consumer uses one safe target topology, one
canonical current project identity, one original goal and technical-decision
projection, one shared evidence-backed project-fact projection, one valid
effective Guidance graph, one completely accounted project-authority inventory,
and exact strictly checked persisted or same-run evidence; identity, lifecycle,
governance authority posture, platform, current-work continuity, behavioral adoption, release
readiness, and real-world effect remain distinct; conflicts block their exact
dependent scope and global trust failures cannot route routine work; new-project
setup and existing-project adoption both use controlled planning, structured
Approval Record, exact preflight, transaction, rollback, receipt, project-local cold start, and route
activation; legacy assets and in-flight work are reconciled without fabricated
identity, duplicate routing, or rewritten history; full behavioral adoption is
claimed only after the default IntentOS task route is exercised; a generated
project routes its first ordinary task through Work Queue, Task Governance,
risk-derived review and verification, current evidence, and strict finish;
pending or failed activation cannot be reported as verified; automation status
reflects the same blockers; internal technical phases continue without repeated
user approval; and the ordinary user is not asked to resolve technical trust
decisions.
```
