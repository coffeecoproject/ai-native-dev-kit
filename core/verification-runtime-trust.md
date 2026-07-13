# Verification Runtime Trust

Verification Runtime Trust proves that verification evidence came from the
intended project revision and runtime context. It is distinct from Runtime
Hygiene, which governs Git, CI, artifacts, bundles, and release blockers.

## Chain

```text
Task Governance
  -> Verification Plan
  -> Verification Runtime Plan
  -> Environment Preflight
  -> Isolated Verification Run
  -> Verification Run Manifest
  -> Test Evidence
  -> Execution Assurance
  -> Completion Evidence
```

1.101 implements the runtime plan and run-manifest trust core. 1.102 adds
project-evidenced adapter discovery and adapter-specific identity contracts.
Adapters remain observation-and-planning only; resource creation and cleanup
execution follow in 1.103.

## Core Rule

```text
No current runtime identity, no runtime-trusted test evidence.
No ownership-safe cleanup proof, no trusted isolated run.
```

A command exit code and output digest are not enough to prove runtime behavior.
The run must identify the source revision, intended service/build instance,
relevant data/session resources, execution window, and cleanup outcome required
by the task tier.

## Tier Contract

- `LOW` -> `SOURCE_OUTPUT_BINDING`
- `MEDIUM` -> `TARGETED_SERVICE_IDENTITY`
- `HIGH` -> `ISOLATED_RUNTIME`
- `POSSIBLE_HIGH` -> `BLOCKED_FOR_CLASSIFICATION`

Codex derives the tier and automatically selects ports, adapters, databases,
namespaces, sessions, and test tools. None of these technical choices are
delegated to the user.

## Service Identity

Service identity is adapter-neutral. A local process can use PID, argv digest,
cwd digest, and start time. Containers use container and image digests.
Kubernetes uses pod/job UID. Serverless uses deployment/version identity.
Static frontends use build and deployment digests.

Raw secrets, credentials, tokens, cookies, passwords, and full connection URLs
must never be written to a runtime plan or run manifest.

## Resource Ownership

Managed resources are bound to:

```text
run_id + owner_token_digest + resource_id + owner_marker_digest
```

The raw owner token is not evidence. Cleanup may target only resources whose
owner marker matches the current run. Broad process killing, arbitrary port
owner termination, same-name container deletion, or shared database clearing
cannot count as safe cleanup.

## Authority Boundary

Runtime trust does not:

- approve implementation, release, or production;
- prove product or business correctness;
- authorize shared or production resource changes;
- execute tests merely because a plan or manifest exists;
- turn self-declared environment text into runtime identity.

Missing or mismatched identity fails closed for the trust level that requires
it. A lower tier cannot be used to bypass unresolved high-impact signals.
