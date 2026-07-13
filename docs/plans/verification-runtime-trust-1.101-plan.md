# IntentOS 1.101 Verification Runtime Trust Core Plan

## Status

Approved for implementation.

## Theme

Verification Runtime Trust Core.

## Problem

IntentOS can bind Test Evidence to the current task, Verification Plan, project,
source revision, command output, and evidence digest. That does not yet prove
that the output came from the intended service instance, isolated data
resources, current login context, or a cleanup-safe verification run.

The missing trust statement is:

```text
The evidence was produced by the intended source in the intended runtime,
using resources owned by this verification run.
```

Without that statement, a stale process, shared database, reused session, old
container, or unsafe cleanup command can make technically valid evidence
misleading.

## Product Contract

The public user remains one zero-experience solo developer.

The user describes the business need and supplies business facts that cannot
be inferred. Codex owns runtime classification, adapter selection, ports,
service identity, data isolation, session isolation, probes, verification, and
cleanup planning. The user is not asked to select a process model, container,
database, cache, port, namespace, test runner, or checker.

Only a concrete unavoidable external effect, production action, recurring
cost, irreversible provider action, or missing business fact may require a
plain-language user decision.

## Scope

1.101 introduces the platform-neutral trust core:

1. `Verification Runtime Plan`
   - derives the required runtime-trust level from Task Governance;
   - selects a compatible adapter class without asking the user;
   - records required preflight, isolation, ownership, and cleanup controls;
   - blocks `POSSIBLE_HIGH` work until classification is resolved.
2. `Verification Run Manifest`
   - binds project, task, intent, source revision, build artifacts, run window,
     service identities, data resources, sessions, verification executions,
     ownership ledger, and cleanup evidence;
   - stores only digests or redacted identifiers for sensitive identities;
   - cannot claim product correctness, business correctness, release approval,
     or production safety.
3. Strict checkers
   - validate schemas, report identity, digests, source refs, authority binding,
     risk-tier controls, run ownership, cleanup safety, and no-overclaim
     boundaries;
   - fail closed when a required source or identity cannot be established.
4. Installation and CI distribution
   - installs the core, schemas, templates, checklists, scripts, and output
     directories into new and adopted projects;
   - checks reports when they are present without making legacy Test Evidence
     silently count as runtime-trusted evidence.

## Non-Goals

1.101 does not:

- start or stop real project services;
- create or delete databases, caches, containers, pods, deployments, or login
  sessions;
- implement process, Docker, Kubernetes, serverless, or static-host adapters;
- modify Test Evidence, Execution Assurance, or Completion Evidence schemas;
- make runtime trust mandatory for every existing report;
- deploy, release, migrate production data, handle secrets, or approve an
  external effect;
- merge Verification Runtime Trust with Release Execution Backend Governance.

Those runtime adapters belong to 1.102, isolated resource ownership and cleanup
execution belong to 1.103, and strict downstream consumer hardcut belongs to
1.104.

## Runtime Trust Levels

| Task tier | Required runtime trust | Required proof |
|---|---|---|
| `LOW` | `SOURCE_OUTPUT_BINDING` | current project revision, command, output digest, run window |
| `MEDIUM` | `TARGETED_SERVICE_IDENTITY` | LOW proof plus intended service/build instance identity and targeted probes |
| `HIGH` | `ISOLATED_RUNTIME` | MEDIUM proof plus isolated data/session resources, ownership ledger, cleanup proof, positive and negative paths |
| `POSSIBLE_HIGH` | `BLOCKED_FOR_CLASSIFICATION` | no downgrade and no trusted completion until classification is resolved |

The tier is technical governance derived by Codex. It is not a user selection.

## Adapter Model

The core recognizes adapter classes without binding the model to one platform:

- `COMMAND_ONLY`
- `LOCAL_PROCESS`
- `DOCKER_CONTAINER`
- `KUBERNETES_WORKLOAD`
- `SERVERLESS_DEPLOYMENT`
- `STATIC_BUILD`
- `PROJECT_NATIVE`
- `UNRESOLVED`

Service identity is represented as typed, redacted identity fields. PID is one
possible field for a local process; container ID, image digest, pod UID,
deployment version, or build digest are other valid implementations.

## Resource Ownership Contract

Every managed resource must be attributable to the run through:

```text
run_id + owner_token_digest + resource_id + owner_marker_digest
```

The raw owner token must never be stored in evidence. Cleanup may only target a
resource whose recorded owner marker matches the current run. Broad cleanup
such as `pkill`, killing an arbitrary port owner, deleting a same-name
container, or clearing a shared database cannot count as safe cleanup proof.

## Schema Contracts

### Verification Runtime Plan

Required identity:

- task ref and intent digest;
- Verification Plan ref and digest;
- Task Governance tier and source;
- runtime trust level;
- selected adapter class;
- required preflight probes;
- required control matrix;
- resource isolation plan;
- Evidence Authority binding;
- deterministic plan digest.

### Verification Run Manifest

Required identity:

- run ID and owner-token digest;
- plan, task, intent, project, and source revision;
- build artifact identities;
- start/end time and run state;
- preflight results;
- service instance identities;
- data and session isolation identities;
- owned-resource ledger;
- verification execution outputs;
- cleanup before/after evidence;
- Evidence Authority binding;
- deterministic manifest digest.

## Fail-Closed Rules

A runtime plan or run manifest must not pass when:

- a project/task/source identity is missing, stale, or mismatched;
- an evidence ref is outside the project, symbolic-link escaped, missing, or
  digest mismatched;
- `POSSIBLE_HIGH` is represented as ready;
- a required service identity is absent;
- HIGH work uses a production or shared data resource;
- HIGH work lacks isolated session identity, positive/negative execution, or
  cleanup proof;
- cleanup touched an unrelated resource;
- a created owned resource remains after a completed run;
- the report stores a raw secret, token, password, or connection URL;
- prose claims product correctness, release approval, or production safety.

## Compatibility

Existing Verification Plan, Test Evidence, Execution Assurance, and Completion
Evidence records remain readable in 1.101. They do not gain runtime-trusted
status merely because the new assets exist.

1.104 will define the explicit migration and strict consumer cutover. There is
no implicit upgrade and no compatibility path that treats a free-form
`environment: local-dev` value as a Verification Run Manifest.

## Implementation Set

- `core/verification-runtime-trust.md`
- `docs/verification-runtime-trust.md`
- `schemas/artifacts/verification-runtime-plan.schema.json`
- `schemas/artifacts/verification-run-manifest.schema.json`
- `templates/verification-runtime-plan.md`
- `templates/verification-run-manifest.md`
- `checklists/verification-runtime-trust-review.md`
- `scripts/resolve-verification-runtime-plan.mjs`
- `scripts/check-verification-runtime-plan.mjs`
- `scripts/check-verification-run-manifest.mjs`
- `scripts/lib/verification-runtime-trust.mjs`
- `verification-runtime-plans/.gitkeep`
- `verification-run-manifests/.gitkeep`
- focused good/bad fixtures and regression tests
- Manifest, installed CI, reference docs, version, release record, limitations,
  and self-check updates

## Acceptance Plan

### Positive

- LOW plan derives `SOURCE_OUTPUT_BINDING` automatically.
- MEDIUM plan requires service identity and targeted probes.
- HIGH plan requires isolated data/session resources, ownership, cleanup, and
  positive/negative execution.
- A valid HIGH fixture passes both strict checkers.
- Installed projects receive all runtime-trust assets and can run the checkers.

### Negative

- `POSSIBLE_HIGH` cannot become ready.
- free-form `local-dev` Test Evidence is not accepted as a Run Manifest.
- stale project revision, wrong task, wrong intent, wrong plan digest, and
  wrong output digest fail.
- missing service identity fails MEDIUM/HIGH.
- production/shared data fails HIGH.
- raw credentials or full connection URLs fail.
- cleanup of unowned resources or remaining owned resources fails.
- unsafe/symlink/outside-project evidence refs fail.
- run manifest cannot approve release, production, or business correctness.

### Repository

- focused runtime-trust tests pass;
- recursive syntax checks pass;
- Manifest validation passes;
- source self-check passes;
- generated-project smoke passes;
- isolated full `npm run verify` passes;
- `git diff --check` passes;
- concurrent unrelated 2.0 plan work is not modified or included.

## Completion Condition

1.101 is complete when the repository can deterministically answer:

```text
What runtime trust level does this task require?
What identities and isolation must a valid run prove?
Does this recorded run satisfy that contract without unsafe cleanup or
overclaiming?
```

It must not claim that IntentOS can already launch every supported runtime.
