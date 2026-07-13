# Verification Runtime Adapters

Runtime adapters let IntentOS understand how the current project runs without
asking the user to choose technical infrastructure.

## What Changes In 1.102

IntentOS no longer records only a generic adapter name. It also records:

- which current project files support that choice;
- which trust levels the adapter can satisfy;
- which runtime identity fields a real run must provide;
- which adapter-specific preflight checks are required;
- a digest that binds the exact adapter contract.

Examples:

- a local process must identify its PID, command, and working directory;
- Docker must identify the container and image;
- Kubernetes must identify workload, pod, namespace, and image;
- serverless must identify deployment, version, and target environment;
- a static frontend must identify its build and served origin;
- a native app must identify its build, target, and artifact.

## User Experience

The user still says what should be completed and verified. Codex inspects the
project and selects the adapter. Technical alternatives stay in the internal
trace.

If project evidence is missing or contradictory, IntentOS records a technical
blocker. It does not ask a zero-experience user to choose Docker, Kubernetes,
ports, providers, simulators, or commands.

## Current Boundary

`1.102` is observation and planning only. It does not start services, execute
tests, create containers or databases, call cloud platforms, or clean up real
resources. Those lifecycle actions require the separately governed `1.103`
resource ownership and cleanup work.
