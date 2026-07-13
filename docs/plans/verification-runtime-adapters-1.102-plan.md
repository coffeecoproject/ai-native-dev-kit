# IntentOS 1.102 Verification Runtime Adapters Plan

## Status

Approved for implementation.

## Theme

Platform-neutral runtime adapter discovery, capability, and identity contracts.

## Problem

IntentOS `1.101` can select an adapter class and validate a generic service
identity. It does not yet prove that:

- the selected adapter is supported by concrete current project evidence;
- the adapter can satisfy the required runtime trust level;
- the recorded service identity contains the fields required by that runtime;
- the adapter discovery evidence is bound to the current project revision;
- a Docker, Kubernetes, serverless, static, native, or local-process identity
  is not being represented by unrelated generic fields.

Without an adapter contract, a report can name a plausible adapter and provide
arbitrary identity fields while remaining structurally valid.

## Product Contract

The public user remains one zero-experience solo developer. Codex discovers and
selects the runtime adapter. The user is not asked to choose a process model,
container runtime, cluster, provider, static server, simulator, port, command,
or identity field.

## Scope

`1.102` adds:

1. a project-independent adapter registry;
2. bounded project signal discovery;
3. deterministic adapter candidate selection;
4. per-adapter capability and identity requirements;
5. adapter contract digest binding in the Runtime Plan;
6. adapter-specific service identity checks in the Run Manifest;
7. compatibility for valid `1.101` plans and manifests;
8. source/generated-project distribution and regression evidence.

## Adapter Classes

- `COMMAND_ONLY`
- `LOCAL_PROCESS`
- `DOCKER_CONTAINER`
- `KUBERNETES_WORKLOAD`
- `SERVERLESS_DEPLOYMENT`
- `STATIC_BUILD`
- `PROJECT_NATIVE`
- `UNRESOLVED`

## Adapter Contract

Each selected adapter records:

- contract version and deterministic digest;
- discovery status and confidence;
- project-local discovery sources and digests;
- supported runtime trust levels;
- required service identity fields;
- adapter-specific preflight probes;
- managed resource types;
- lifecycle capability;
- explicit execution boundary.

The lifecycle capability for `1.102` is `OBSERVE_AND_PLAN_ONLY`.

## Required Identity Fields

| Adapter | Required identity fields for verified service/build evidence |
| --- | --- |
| `COMMAND_ONLY` | none beyond source, command, output, and run-window binding |
| `LOCAL_PROCESS` | `pid`, `argv`, `cwd` |
| `DOCKER_CONTAINER` | `container_id`, `image_digest` |
| `KUBERNETES_WORKLOAD` | `workload_uid`, `pod_uid`, `namespace`, `image_digest` |
| `SERVERLESS_DEPLOYMENT` | `deployment_id`, `version_id`, `target_environment` |
| `STATIC_BUILD` | `build_digest`, `serve_origin` |
| `PROJECT_NATIVE` | `build_id`, `target_id`, `artifact_digest` |

Raw values remain redacted and represented by digests in the run manifest.

## Discovery Policy

Discovery is bounded to project-local, non-symlink configuration and known
project metadata. Signals include:

- package runtime scripts for local processes;
- Compose or Docker files for containers;
- Kubernetes or Helm manifests for workloads;
- serverless/provider configuration for hosted deployments;
- static build outputs or static project entry points;
- Xcode, SwiftPM, Gradle, Android, or mini-program project metadata;
- an explicit project-native IntentOS adapter declaration when present.

Every selected non-command adapter must have at least one current project-local
discovery source. The source and digest enter Evidence Authority binding.

Multiple candidates may be discovered. Codex selects one deterministically
from task trust needs and project evidence. Alternatives remain technical trace
and are not user choices.

## Selection Rules

1. `LOW` uses `COMMAND_ONLY` unless project facts raise the task tier.
2. `POSSIBLE_HIGH` remains `UNRESOLVED` and blocked.
3. explicit safe project-native adapter declarations outrank inferred signals.
4. container orchestration metadata outranks a generic local package script.
5. Kubernetes/Helm evidence outranks a Dockerfile used only to build an image.
6. serverless provider configuration outranks a generic static entry point.
7. ambiguous high-confidence candidates block rather than silently guess.
8. unsupported required trust levels block planning.
9. missing or unsafe discovery evidence blocks strict `1.102` planning.

## Compatibility

- valid `1.101` plans and manifests remain readable under their historical
  contract;
- the `1.102` resolver emits the new adapter contract;
- strict `1.102` reports require the adapter contract and digest;
- `1.101` evidence does not gain adapter-verified status automatically;
- `1.104` remains responsible for downstream Test Evidence and Completion
  consumer hardcut.

## Implementation Set

- `core/verification-runtime-adapters.md`
- `docs/verification-runtime-adapters.md`
- `docs/plans/verification-runtime-adapters-1.102-plan.md`
- `checklists/verification-runtime-adapter-review.md`
- `scripts/lib/verification-runtime-adapters.mjs`
- updates to runtime-plan resolver, plan checker, run-manifest checker, schemas,
  templates, and shared runtime-trust semantics;
- focused positive, ambiguity, tampering, and identity-field tests;
- manifest, reference, CI, version, generated-project, release-record, known
  limitation, and self-check updates.

## Non-Goals

`1.102` does not:

- start, stop, restart, deploy, or submit a runtime;
- execute a project test command;
- create or delete a process, container, pod, deployment, database, cache,
  session, build, or simulator;
- choose or allocate real ports or namespaces;
- read or store credentials;
- call Docker, Kubernetes, cloud, app-store, or mini-program APIs;
- perform cleanup;
- change Test Evidence, Execution Assurance, Completion, release, or production
  authority;
- claim that adapter discovery proves a runtime instance actually ran.

Resource creation, ownership enforcement, and cleanup execution remain `1.103`.
Strict downstream consumer cutover remains `1.104`.

## Acceptance

### Positive

- local runtime scripts select `LOCAL_PROCESS` with current source evidence;
- Compose selects `DOCKER_CONTAINER` and requires container/image identity;
- Kubernetes/Helm selects `KUBERNETES_WORKLOAD` and requires workload/pod/image
  identity;
- serverless config selects `SERVERLESS_DEPLOYMENT` and requires deployment
  identity;
- static projects select `STATIC_BUILD` and require build/origin identity;
- native projects select `PROJECT_NATIVE` and require build/target/artifact
  identity;
- LOW stays lightweight with `COMMAND_ONLY`;
- generated projects install and validate the same contracts.

### Negative

- a selected adapter without discovery evidence fails;
- discovery source symlink or outside-project escape fails;
- modified discovery source invalidates authority binding;
- adapter contract digest tampering fails;
- unsupported trust level fails;
- ambiguous strong signals fail rather than ask the user;
- a local-process identity cannot satisfy Docker identity requirements;
- arbitrary identity field names cannot satisfy an adapter contract;
- a service instance using another adapter kind fails;
- raw credential or connection data remains rejected.

### Repository

- focused adapter and runtime-trust tests pass;
- schemas validate and reject unknown fields;
- recursive syntax checks pass;
- source self-check and manifest checks pass;
- generated-project smoke passes;
- isolated full `npm run verify` passes;
- `git diff --check` passes;
- Release Execution Topology `1.105-1.107` plan remains independent.

## Completion Rule

`1.102` is complete only when IntentOS can answer:

```text
Which runtime adapter does this task require?
Which current project evidence supports that choice?
Which identity fields must the observed runtime provide?
Does the run manifest satisfy that exact adapter contract?
```

It must not claim that IntentOS has started or controlled the runtime.
