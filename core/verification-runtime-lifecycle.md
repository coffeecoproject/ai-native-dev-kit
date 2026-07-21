# Verification Runtime Lifecycle

IntentOS must not treat a written test result as proof of a real verification run. A trusted run must bind the current task and source to exact local actions, observed service identity, run-owned resources, outputs, and cleanup evidence.

## Authority

Codex owns technical choices such as commands, ports, adapters, local isolation, and cleanup mechanics. The solo user provides business facts and confirms only real external effects. A lifecycle plan never authorizes production, release, remote infrastructure, secrets, or broad cleanup.

## Required Chain

```text
Task Governance
-> Verification Plan
-> Verification Runtime Plan
-> Verification Runtime Lifecycle Plan
-> bounded local execution
-> Verification Run Manifest
-> Test Evidence
-> Execution Assurance
-> Completion Evidence
```

The Runtime Plan states what trust is required. The Lifecycle Plan converts that requirement into exact actions. The Run Manifest records only observations produced by the executor.

## Execution Modes

- `NO_MANAGED_RUNTIME`: exact run-owned commands only.
- `LOCAL_CONTROLLED`: bounded local service and resource lifecycle.
- `UNRESOLVED`: technical declaration or task classification is incomplete.
- `EXTERNAL_EFFECT_BLOCKED`: container-provider, Kubernetes, serverless, remote, release, or production effect is outside 1.103 authority.

Only the first two modes can execute. Every executable mode requires a current project-owned `.intentos/verification-runtime-lifecycle.json` declaration. Codex prepares it; absence is a blocker, not permission to guess.

## Write Boundary

The executor may write only:

- `.intentos/runtime-runs/<run_id>/...`;
- optional durable evidence archive `evidence/runtime-runs/<run_id>/...`, created only by the executor for the same run ID when downstream evidence must survive a clean checkout;
- the requested `verification-run-manifests/*.md` report;
- run-owned resources declared under that run directory.

It uses exact argv with `shell: false`, resolves each bare allowlisted executable before resource creation, blocks action-level `PATH` replacement, uses a minimal environment allowlist, and keeps the owner token in memory. It cannot run generic shells, destructive process commands, provider CLIs, Docker, deploy, publish, release, or production actions.

Service actions use a direct long-lived runtime executable rather than a package-manager wrapper, so the recorded process is the process being owned and cleaned. Dependencies run in deterministic topological order.

## Ownership And Cleanup

Every process and material path is recorded before use. Filesystem resources carry a run-specific owner-marker digest. Cleanup can stop only exact child processes and remove only exact paths whose marker matches the current run. Missing or mismatched ownership fails closed and blocks completion.

Interruption still enters cleanup. The executor preserves the journal and cleanup-before/after evidence. It requests termination and, when necessary, force-stops only that exact recorded child. It never uses `pkill`, kills an arbitrary port owner, removes a similarly named resource, or clears a shared database.

## Completion Boundary

`RUNTIME_TRUST_COMPLETE` means the bounded run and cleanup evidence passed the runtime trust contract. It does not prove business correctness, approve implementation, authorize release, or authorize production.
