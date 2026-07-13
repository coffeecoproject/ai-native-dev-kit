# IntentOS 1.105-1.107 Release Execution Topology Governance Plan

## Status

Approved architecture direction. Implementation must begin after the
Verification Runtime Trust `1.101-1.104` sequence is complete.

## Theme

Platform-neutral release execution topology governance for one zero-experience
solo developer.

## Why This Is Not IntentOS 2.0

This work improves one subsystem. It does not replace the IntentOS public user
model, natural-language operating entry, task levels, Work Queue, project
initialization contract, or the full evidence model.

The current release system can adopt the topology model through a bounded,
staged consumer migration. Legacy Release Channel Policy evidence remains
readable throughout that migration. Therefore this work is a `1.x` capability
sequence rather than a whole-product major-version hard cut.

The sequence is:

```text
1.105 Release Execution Topology Core
  -> 1.106 Release Topology Consumer Binding
  -> 1.107 Release Topology Migration And Calibration
```

`1.102-1.104` remain reserved for Verification Runtime Trust adapters,
resource ownership/cleanup execution, and downstream consumer hardening.

## Problem

Release Channel Policy `1.87` correctly separated Git source history from
GitHub Release and GitHub Actions artifact usage. Its schema is still shaped
around provider-specific questions and does not fully distinguish:

- the source provider;
- the system sequencing release steps;
- the runtime executing build or deployment commands;
- the mechanism transporting the exact package;
- the authoritative evidence store;
- the final production or platform target.

Consequently, changing an artifact or SSH transport can appear to be a release
backend migration even when hosted orchestration and hosted execution remain
unchanged.

## Product Contract

The public user remains one zero-experience solo developer.

The user states the real outcome and any discoverable business constraint:

```text
Release this product safely.
Avoid unnecessary recurring hosted execution cost when a safer project-owned
path already exists.
```

IntentOS and Codex must:

- discover the current release topology;
- derive mandatory safety capabilities;
- compare technically viable topologies;
- recommend one bounded technical path;
- prepare evidence, migration, rehearsal, rollback, and cutover details;
- perform allowed reversible inspection and rehearsal work;
- request user consent only for one prepared concrete external effect.

The user must not be asked to choose runners, orchestrators, artifact stores,
transport protocols, CI structure, lock implementation, rollback commands, or
internal IntentOS artifacts.

Internal responsibility domains must not become additional people the solo
user is expected to find. Technical responsibility belongs to Codex, project
policy, or an existing external system. The current user supplies only missing
business facts and bounded real-world consent.

## Relationship To Verification Runtime Trust

The two workstreams remain separate:

```text
Verification Runtime Trust
  = did a verification run use the intended source, runtime, and isolated
    resources?

Release Execution Topology Governance
  = is the release topology complete, safe, and correctly selected?
```

When release rehearsal runs verification, its evidence must reference the
matching Verification Runtime Plan and Verification Run Manifest. The topology
record consumes that identity; it does not create, start, or validate the
verification runtime itself.

## Core Model

The release topology is a graph of six independent planes, not a claim that
every project uses one linear pipeline:

1. Source Control
2. Orchestrator
3. Execution Backend
4. Package Transport
5. Evidence Store
6. Production Target

Approval, locking, recovery, rollback, observation, security, cost, and
resource ownership are cross-cutting controls over this graph.

Changing one plane does not prove another plane changed. For example:

- GitHub source plus SSH transport may still use GitHub-hosted compute;
- self-hosted compute may still use GitHub Actions for orchestration;
- provider-managed deployment may use Git only for source identity;
- app-store submission may use local build execution and an external platform
  as the target.

## Authority Model

The Release Execution Topology Record is a computed, read-only projection.

Authoritative sources remain:

- current project source and configuration;
- project release and rollback procedures;
- observed provider and platform state;
- current project identity and Git revision;
- structured current-user consent;
- strict release, runtime, and apply evidence.

The topology record may explain and recommend. It cannot approve release,
authorize project writes, grant production authority, or override stronger
project-native rules.

The topology record must not embed consent as authority. It may reference a
separate approval record. Downstream consumers must verify that the separately
approved action exactly matches the action Codex is about to perform.

## Topology Contract

### Source Control Plane

- provider and repository identity;
- current source revision and dirty/generated-source state;
- whether a tag is identity, trigger, both, or neither;
- source access and release-ref permissions.

### Orchestration Plane

- orchestrator kind and instance identity;
- release run identity;
- state persistence, pause, retry, resume, and interruption semantics;
- concurrency control;
- trusted-source boundary;
- whether untrusted code can reach privileged credentials or executors.

### Execution Plane

- backend class and instance identity;
- operating system and architecture requirements;
- isolation, timeout, capacity, and workspace lifetime;
- secret-delivery and network boundaries;
- recurring cost and maintenance burden;
- cleanup and cross-run contamination controls.

### Package Transport Plane

- transport kind;
- exact package identity and integrity verification;
- retention, cleanup, size, and resume policy;
- separation between runtime packages and durable evidence.

### Evidence Plane

- authoritative store identity;
- write/read boundary;
- retention and retrieval policy;
- immutability or append-only behavior;
- cross-run isolation, backup, and redaction controls.

### Production Target Plane

- target and environment identity;
- test lane or platform-approved equivalent;
- production lock or freeze mechanism;
- deployment, submission, rollback, and observation paths;
- unavailable provider or account facts requiring current-user input.

## Backend Classes

The platform-neutral core may classify an execution backend as:

- `HOSTED_CI_RUNNER`
- `SELF_HOSTED_CI_RUNNER`
- `LOCAL_CONTROLLED_EXECUTOR`
- `REMOTE_PROJECT_EXECUTOR`
- `PROVIDER_MANAGED_EXECUTOR`
- `PLATFORM_SUBMISSION_EXECUTOR`
- `PROJECT_NATIVE_EXECUTOR`
- `HYBRID_EXECUTOR`
- `UNKNOWN`

These are internal engineering classes, not user-facing choices.

## Capability Contract

A topology is viable only if it satisfies every mandatory capability derived
from the project, platform, target, task, and risk level. Capabilities include:

- exact project, source revision, release candidate, package, and run identity;
- build-once/promote-the-same-package behavior or equivalent provider identity;
- durable run state and evidence;
- test-lane or platform-approved pre-production verification;
- explicit production-effect boundary and exact action consent;
- release concurrency lock and idempotent retry behavior;
- interruption recovery;
- trusted-source and privileged-executor separation;
- secret isolation;
- backup, rollback, smoke, monitoring, and incident evidence;
- migration rehearsal when data changes are present;
- package signing, provenance, or attestation when required;
- run-owned cleanup without broad process, artifact, or workspace deletion.

Cost, provider independence, and convenience are optimization factors. They
cannot replace mandatory safety capabilities.

## Fact Confidence

Every discovered topology fact must be classified as:

- `OBSERVED`: verified from current project or provider state;
- `DECLARED`: recorded by a project-owned source but not runtime-verified;
- `INFERRED`: derived from incomplete signals;
- `UNKNOWN`: unavailable or contradictory.

Strict recommendation, migration, or cutover readiness must not treat inferred
or unknown production, secret, rollback, lock, active-trigger, executor, or
evidence-store facts as verified. Documentation presence alone does not prove
the active topology.

## Automatic Recommendation Policy

IntentOS and Codex select the technical recommendation:

1. discover current project and platform authority;
2. derive mandatory capabilities;
3. reject incomplete or unsafe candidates;
4. preserve stronger project-native rules;
5. prefer the lowest migration and operational risk among valid candidates;
6. compare recurring cost, dependency, maintenance, capacity, and reliability;
7. select one recommendation;
8. retain alternatives only in the technical explanation trace;
9. expose a user decision only for a prepared concrete real-world effect.

A healthy existing topology should normally be preserved. Migration is
recommended only when the current topology is materially unsafe, blocked,
unsustainable, capability-incomplete, or contrary to an explicit outcome.

## Recommendation States

- `KEEP_CURRENT_TOPOLOGY`
- `RECOMMEND_BOUNDED_MIGRATION`
- `RECOMMEND_PROVIDER_ADAPTER`
- `NEEDS_PROJECT_FACT_DISCOVERY`
- `NEEDS_CONCRETE_USER_CONSENT`
- `BLOCKED_BY_MISSING_CAPABILITY`
- `BLOCKED_BY_PROJECT_AUTHORITY`
- `BLOCKED_BY_UNSAFE_CUTOVER`
- `BLOCKED_BY_UNKNOWN_PRODUCTION_EFFECT`

These states summarize the technical view. They do not authorize
implementation or release.

## Unified Identity

Provider-specific IDs must not be universal requirements. The generic contract
uses:

- `release_run_id`
- `orchestrator_type`
- `orchestrator_run_ref`
- `executor_type`
- `executor_instance_ref`
- `source_revision`
- `release_candidate_ref`
- `package_identity`
- `topology_digest`

Provider adapters may add native IDs. An adapter fails closed when its provider
requires a native ID and that ID is missing.

## Compatibility Strategy

Release Channel Policy `1.87` remains readable as compatibility evidence.

- legacy fields may be translated into observed or declared topology facts;
- legacy reports remain available for audit;
- legacy reports alone cannot claim topology migration or cutover readiness;
- the existing `release-channel` entry remains a bounded compatibility alias;
- new topology records do not automatically rewrite project release assets;
- existing projects may map stronger native records instead of replacing them;
- strict consumer migration occurs only in `1.106`, with explicit fixtures and
  generated-project parity.

There must never be two conflicting current recommendations. During migration,
the public operating entry renders one result from the current structured
decision and labels legacy-only evidence explicitly.

## Version 1.105: Release Execution Topology Core

### Objective

Introduce the read-only platform-neutral topology model without changing
release execution authority or making the new artifact mandatory downstream.

### Implementation Set

- core and user documentation;
- topology record template and strict schema;
- topology review checklist and agent prompt;
- shared normalization and discovery library;
- read-only resolver and strict checker;
- Release Channel Policy compatibility translator;
- synthetic positive, negative, and adversarial fixtures;
- Evidence Authority registration;
- internal natural-language routing without a required public command;
- manifest, generated-project, reference, version, and release evidence.

### Required Behaviors

- discover the six-plane topology from project-owned evidence;
- preserve fact confidence and source chain;
- derive mandatory capabilities;
- produce one deterministic recommendation;
- distinguish transport changes from executor or orchestrator changes;
- emit one plain-language outcome without technical user choices;
- remain read-only unless writing the explicitly requested report path.

### Non-Goals

- no release-consumer hard cut;
- no project release workflow changes;
- no provider configuration changes;
- no real cutover;
- no secret movement;
- no production release;
- no claim that synthetic fixtures prove provider correctness.

### Acceptance

- healthy hosted topology recommends keep-current;
- self-hosted execution under hosted orchestration is represented correctly;
- SSH transport does not imply executor migration;
- provider-managed and platform-submission topologies remain representable;
- conflicting declared and observed facts remain unresolved or prefer observed
  facts with the conflict recorded;
- missing active executor, trigger, lock, rollback, or evidence facts fail
  strict readiness;
- source and generated-project behavior remain equivalent.

## Version 1.106: Release Topology Consumer Binding

### Objective

Make strict release consumers bind the exact topology identity without turning
the topology record into approval or execution authority.

### Consumer Changes

- Release Evidence Gate consumes exact topology ref and digest;
- Release Approval binds project, source, candidate, package, topology, exact
  allowed action, and concrete current-user consent;
- Release Execution verifies the approved action is exactly the pending action;
- Runtime Hygiene reports topology blockers without selecting a backend;
- Release Plan remains derived and non-authorizing;
- natural-language public entry renders one recommendation and next step;
- the legacy entry cannot produce a conflicting current decision.

### Required Failures

- stale or copied topology evidence;
- approval action does not match pending execution;
- embedded consent is treated as authority;
- legacy evidence alone claims current strict readiness;
- test-lane and production package identities diverge without an accepted
  provider rebuild identity;
- two active triggers can publish the same release;
- generated and source projects disagree on topology semantics.

## Version 1.107: Migration, Rehearsal And Calibration

### Objective

Govern actual release-topology migration without making IntentOS a deployment
service or production authority.

### Lifecycle

1. read-only topology discovery;
2. capability derivation and candidate comparison;
3. dependency mapping;
4. bounded migration plan and Plan Review;
5. Unified Apply Plan, exact approval, readiness, transactional apply, receipt,
   and rollback for project-file changes;
6. non-production shadow rehearsal;
7. cutover readiness;
8. separately consented controlled cutover;
9. post-cutover active-topology proof;
10. separately governed legacy-backend retirement.

### Rehearsal Requirements

- exact source, package, topology, executor, and run identity;
- Verification Runtime Trust references when tests are run;
- package transport integrity;
- test-lane operation;
- retry, interruption, lock, rollback, evidence, and cleanup proof;
- proof that rehearsal did not duplicate production deployment or submission.

### Cutover Requirements

- passed current rehearsal evidence;
- exact target topology digest;
- verified active-trigger and privileged-executor boundaries;
- current rollback and fallback path;
- no unresolved findings that affect the migration scope or release safety;
- separate structured consent for the exact cutover effect;
- separate release consent when cutover also performs a release.

### Post-Cutover And Retirement

- prove the target backend actually executed;
- prove the old backend did not also publish;
- bind source and package identity;
- verify evidence retrieval, retry, lock, and rollback behavior;
- update project source of truth;
- retain the old backend until risk-derived successful-run and fallback
  evidence requirements pass;
- never delete historical evidence as part of retirement.

### Real-Project Boundary

Repository fixtures prove contracts and negative behavior, not universal
provider correctness. Real-project calibration starts read-only, uses sanitized
evidence, preserves stronger project-native rules, and does not require a real
production cutover for the IntentOS source release.

## Safety Invariants

1. recommendation is not approval;
2. topology description is not proof of active topology;
3. transport migration is not executor migration;
4. cutover consent is not release consent;
5. user confirmation is not blanket technical authority;
6. unknown production effects fail closed;
7. cost cannot weaken mandatory safety;
8. one release run has one authoritative run identity;
9. one candidate has one exact source and package identity;
10. untrusted code cannot reach a privileged persistent release executor;
11. retries are idempotent or blocked;
12. interrupted runs are safely resumable or restartable;
13. evidence survives cleanup and backend retirement;
14. secrets are referenced and redacted, never copied into reports;
15. cleanup may remove only exact run-owned resources;
16. stronger project-native authority wins;
17. topology records cannot create or validate approval authority;
18. strict execution checks exact action-level approval.

## Review Surfaces

Required review surfaces include:

- zero-experience solo product contract;
- architecture and authority separation;
- release, production, rollback, and observation impact;
- existing-project governance preservation;
- security, secrets, and untrusted-code boundaries;
- data migration, backup, and restore when applicable;
- provider-neutral core and provider-specific adapters;
- evidence and project/task/source/run/package/topology binding;
- cost and external commitment;
- generated-project and compatibility behavior;
- retry, resume, lock, cleanup, and retirement operations;
- active-topology observation truth.

## Verification Strategy

Each version requires:

- hand-authored positive and negative expected outcomes;
- schema validation with unknown-field rejection;
- tampered-record and stale-identity tests;
- source/generated-project parity tests;
- existing-project stronger-rule preservation tests;
- natural-language zero-experience regression tests;
- recursive syntax checks;
- manifest and distribution checks;
- focused test suite;
- isolated full repository verification;
- final diff-bound review and release evidence.

Resolver output must not be the only checker oracle. Negative tests must mutate
otherwise-valid artifacts to prove that self-consistent but false claims are
rejected.

## Forbidden Claims

The sequence must not claim:

- IntentOS chooses a universally best backend;
- cheaper automatically means safer;
- recommendation authorizes writes or release;
- plan review authorizes implementation;
- all provider prices or behaviors are known;
- platform-neutral core removes the need for adapters;
- fixtures prove real production configuration;
- migration is complete before post-cutover proof;
- the user must choose technical topology;
- a topology record grants approval authority.

## Program Completion Rule

The `1.105-1.107` sequence is complete only when:

1. one platform-neutral read-only topology model exists;
2. old evidence remains readable without becoming current readiness proof;
3. one deterministic recommendation is produced without technical user choice;
4. strict consumers bind exact topology and exact approved action;
5. migration, rehearsal, cutover, release, rollback, and retirement remain
   separate governed effects;
6. generated and source projects behave equivalently;
7. real-project calibration proves observed topology can differ safely from
   declared configuration;
8. final review and full verification pass against each final Git revision.

Until those conditions pass, IntentOS may describe release topology but must
not claim complete platform-neutral release migration governance.
