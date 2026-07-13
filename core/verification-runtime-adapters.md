# Verification Runtime Adapters

Verification Runtime Adapters translate a project runtime into the
platform-neutral Verification Runtime Trust contract.

## Position

```text
Task Governance
  -> Verification Plan
  -> Runtime Adapter Discovery
  -> Verification Runtime Plan
  -> Observed Run Identity
  -> Verification Run Manifest
```

The adapter is selected by Codex from current project evidence. It is not a
technical choice delegated to the user.

## Current Adapter Classes

- `COMMAND_ONLY`
- `LOCAL_PROCESS`
- `DOCKER_CONTAINER`
- `KUBERNETES_WORKLOAD`
- `SERVERLESS_DEPLOYMENT`
- `STATIC_BUILD`
- `PROJECT_NATIVE`
- `UNRESOLVED`

## Contract

Every `1.102` selected adapter records:

- current project-local discovery evidence;
- supported runtime trust levels;
- required service or build identity fields;
- adapter-specific preflight probes;
- managed resource types;
- one deterministic contract digest;
- `OBSERVE_AND_PLAN_ONLY` lifecycle mode.

The run manifest must bind the exact contract digest and provide the required
identity fields for the selected adapter.

## Discovery Rules

Only bounded, project-local, non-symlink evidence may support adapter
selection. Explicit project-owned declarations take precedence. Conflicting
explicit declarations fail closed. Alternatives remain internal technical
trace and are not user choices.

## Identity Rules

- local process: PID, argv, and working-directory identity;
- container: container and image identity;
- Kubernetes: workload, pod, namespace, and image identity;
- serverless: deployment, version, and target-environment identity;
- static build: build digest and serve-origin identity;
- native platform: build, target, and artifact identity.

Raw values are not copied into evidence. Identity fields use digests and
redacted displays.

## Boundary

`1.102` adapters discover, describe, and validate. They do not start or stop a
runtime, execute tests, allocate ports, call providers, create resources,
perform cleanup, change production, or approve completion.

Resource lifecycle execution belongs to `1.103`. Downstream Test Evidence and
Completion binding belongs to `1.104`.
