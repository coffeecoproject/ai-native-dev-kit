# IntentOS 1.103 Verification Runtime Lifecycle Plan

## Status

Approved for implementation.

## Theme

Controlled local verification execution, run-owned resources, interruption
recovery, and ownership-safe cleanup.

## Position In The Version Line

```text
1.101 Verification Runtime Trust Core
  -> 1.102 Verification Runtime Adapters
  -> 1.103 Verification Runtime Lifecycle
  -> 1.104 Runtime Trust Consumer Hardcut
```

`1.101` defines what a trusted run must prove. `1.102` derives the runtime
adapter and exact identity contract from current project evidence. `1.103`
executes only the bounded local lifecycle needed to produce those identities
and records the result. `1.104` will make Test Evidence, Execution Assurance,
Completion Evidence, and public finish consumers require the resulting runtime
evidence.

## Problem

A valid `1.102` Runtime Plan can say that a task requires a local process,
container, static build, or project-native runtime. It still cannot prove that:

- the intended current-source service was actually started;
- the verification command ran inside the intended run window;
- ports, workspaces, sessions, and local data namespaces belong to this run;
- a stale process or pre-existing resource was not silently reused;
- interruption or command failure triggered bounded cleanup;
- cleanup touched only resources owned by the current run;
- the generated Run Manifest came from observed execution rather than manual
  self-declaration.

## Product Contract

The public user remains one zero-experience solo developer.

The user describes the business behavior and supplies facts the project cannot
infer. Codex owns runtime selection, commands, ports, local namespaces,
timeouts, preflight, process identity, verification execution, evidence
capture, cleanup, and repair.

The user is never asked to choose a shell command, package manager, port,
container, database, cache, simulator, namespace, or cleanup strategy.

Only a concrete external effect may require plain-language consent, including
provider cost, production access, real user communication, external account
mutation, app-store submission, or irreversible data impact. Consent is to the
prepared effect, not to a technical implementation choice.

## Core Rule

```text
No exact project-bound lifecycle plan, no execution.
No current run ownership marker, no resource mutation or cleanup.
No verified cleanup, no completed isolated runtime evidence.
```

## Scope

`1.103` adds:

1. a structured Verification Runtime Lifecycle Plan;
2. a project-owned lifecycle declaration consumed as technical source input before every command or managed runtime execution; Codex prepares it without asking the user to choose commands, ports, or isolation details;
3. deterministic lifecycle-plan and declaration digests;
4. a controlled local lifecycle executor without shell interpolation;
5. exact argv, project-bounded cwd, timeout, environment, and output rules;
6. in-memory owner tokens with persisted digests only;
7. a run workspace under `.intentos/runtime-runs/<run_id>/`;
8. an append-only lifecycle journal written before each material action;
9. run-owned process and file-namespace resource records;
10. signal, timeout, command-failure, and normal-exit cleanup paths;
11. exact process cleanup using the child process identity created by the run;
12. generated Verification Run Manifest evidence from observed execution;
13. positive and negative lifecycle, interruption, tampering, and cleanup tests;
14. source and generated-project installation/CI coverage.

## Artifacts

### Project Lifecycle Declaration

Optional project-owned technical configuration:

```text
.intentos/verification-runtime-lifecycle.json
```

It may declare exact local actions only. Codex prepares or updates it from
project facts. The ordinary user does not edit it.

### Verification Runtime Lifecycle Plan

Stored under:

```text
verification-runtime-lifecycle-plans/*.md
```

The plan binds:

- current project, task, intent, and source revision;
- exact Runtime Plan ref and digest;
- exact adapter contract digest;
- lifecycle declaration ref and raw digest;
- run ID and execution mode;
- exact ordered actions;
- expected run-owned resources;
- output and cleanup policy;
- Evidence Authority binding;
- non-authorizing safety boundaries.

### Verification Run Manifest

The controlled executor writes the existing Run Manifest as its receipt. The
manifest must distinguish:

- observed values from declared values;
- commands actually executed from commands only planned;
- resources created by this run from pre-existing resources;
- cleanup completed from cleanup merely requested;
- current-run output from copied or stale output.

## Lifecycle States

- `PLANNED`
- `PREFLIGHT_RUNNING`
- `PREFLIGHT_BLOCKED`
- `PREPARING`
- `SERVICE_STARTING`
- `VERIFYING`
- `CLEANING_UP`
- `COMPLETED`
- `FAILED_CLEANED`
- `INTERRUPTED_CLEANED`
- `CLEANUP_BLOCKED`

A terminal successful run is `COMPLETED`. Failure or interruption may only be
considered safely closed when cleanup is observed and recorded.

## Execution Modes

- `NO_MANAGED_RUNTIME`: LOW command/output binding only.
- `LOCAL_CONTROLLED`: local command, local process, static build, or
  project-native command execution with run-owned resources.
- `LOCAL_CONTAINER_CONTROLLED`: local container execution only when current
  daemon/context and exact run labels can be proven non-production.
- `EXTERNAL_EFFECT_BLOCKED`: Kubernetes, serverless, remote container context,
  device/account mutation, or any provider-backed action without a separately
  prepared exact-effect consent chain.
- `UNRESOLVED`: declaration, identity, or ownership evidence is incomplete.

`1.103` implements automatic execution for `NO_MANAGED_RUNTIME` and
`LOCAL_CONTROLLED`. Other modes remain fail-closed unless an adapter can prove
the same local, non-production, ownership-safe contract without weakening the
core.

## Lifecycle Action Contract

Each action records:

- action ID and phase;
- action kind: `COMMAND`, `SERVICE`, or `PROBE`;
- exact argv array; no command string and no shell mode;
- project-relative cwd;
- bounded timeout;
- inherited environment policy and explicit safe environment names;
- output file path inside the current run workspace;
- verification obligation IDs;
- positive/negative path markers;
- created resource IDs;
- whether an external effect is possible;
- execution order and required predecessor IDs.

Forbidden executables and patterns include broad/destructive/system execution
such as `sudo`, `su`, `ssh`, `scp`, `rsync` to remote targets, `rm`, `pkill`,
`killall`, infrastructure apply/destroy, cloud deployment CLIs, store
submission tools, shell interpreters, `eval`, and shell control operators.

`SERVICE` actions must start a direct long-lived runtime executable. Package
manager or task-runner wrappers are not accepted as service owners because
stopping the wrapper does not prove that its descendant service stopped.
Dependencies are executed in deterministic topological order, including when
two dependent actions share the same phase.

Project scripts are still project code. Passing this gate does not prove that
the project itself is non-malicious; the executor limits authority, cwd,
environment, resource ownership, and cleanup, and records that residual trust
boundary explicitly.

## Resource Ownership

Every created resource uses:

```text
run_id + owner_token_digest + resource_id + owner_marker_digest
```

The raw owner token exists only in executor memory and child-process
environment. It must never be written to reports, logs, command arguments, or
project files.

Persisted resources may carry only the owner marker digest. Cleanup may target
only a resource that:

1. is listed in the current lifecycle plan;
2. was recorded as created by the current run;
3. has the current run owner marker;
4. has not changed identity since creation;
5. has an exact cleanup operation owned by the current adapter.

## Run Workspace

The executor may write only beneath:

```text
.intentos/runtime-runs/<run_id>/
verification-run-manifests/<run_id>.md
```

The run workspace contains:

- lifecycle journal;
- command stdout/stderr files;
- observed identity records;
- resource ledger;
- cleanup before/after evidence;
- terminal state.

Symlinked parents, path traversal, absolute paths, and pre-existing run
workspaces fail before execution.

## Preflight

Before a material action, the executor verifies:

- lifecycle plan schema and semantic validity;
- Runtime Plan, adapter contract, declaration, project, task, and source
  digests;
- current worktree/source identity still matches planning time;
- every argv/cwd/output path is bounded and non-shell;
- required executables are available;
- no production or external-effect action is authorized;
- run workspace does not already exist;
- sensitive environment variables are not forwarded by default;
- required service/data/session ownership strategy is concrete;
- cleanup is defined for every material run-owned resource.

## Execution And Interruption

The journal is written before an action starts and after its result is
observed. Service processes are spawned directly with exact argv, never through
a shell. Verification commands execute only after required service probes pass.

On verification failure, timeout, `SIGINT`, `SIGTERM`, or executor exception:

1. stop scheduling new actions;
2. journal the terminal trigger;
3. clean current-run resources in reverse creation order;
4. observe the cleanup result;
5. write a non-success Run Manifest;
6. return non-zero.

## Cleanup Safety

The following never count as cleanup:

```text
pkill <name>
kill <port-owner>
delete same-name container
remove shared namespace
clear shared database
delete an unowned directory
```

Local service cleanup uses the exact child process created by the executor.
It first requests `SIGTERM`, then uses `SIGKILL` only for that same recorded
child if it does not stop within the bounded grace period.
File cleanup uses exact run-workspace paths and recorded identity. A failed
ownership check results in `CLEANUP_BLOCKED`; the executor records the blocker
and does not broaden the deletion target.

## Environment Policy

- start from a minimal inherited environment;
- allow only explicitly safe names plus platform-required process basics;
- never persist raw secret values;
- deny common credential/token/production variable names unless a later
  separately governed adapter provides redacted secret handling;
- inject `INTENTOS_RUN_ID` and the raw owner token only into child process
  memory;
- store only digests in evidence.

## Fail-Closed Rules

Execution fails before mutation when:

- the Runtime Plan is blocked, stale, task-mismatched, or adapter-mismatched;
- the lifecycle declaration is absent for a managed runtime;
- the lifecycle plan or declaration digest changed;
- the target project revision changed;
- an action uses a command string, shell, unsafe executable, unsafe cwd, path
  traversal, symlink, unbounded timeout, or unsafe output path;
- any action can produce an unapproved external or production effect;
- a created resource lacks an exact owner marker or cleanup contract;
- a pre-existing run workspace or resource would be reused;
- a required probe is missing.

Completion fails when:

- any required command did not pass;
- required positive or negative obligations were not exercised;
- service identity was not observed;
- cleanup was not verified;
- an owned resource remains;
- an unrelated resource was touched;
- the Run Manifest cannot bind all output files and lifecycle journal evidence.

## Compatibility

- `1.101` and `1.102` Runtime Plans and Run Manifests remain readable.
- Only `1.103` Lifecycle Plans authorize the controlled executor.
- Historical hand-written Run Manifests remain evidence records, not executor
  receipts.
- `1.103` does not make runtime evidence mandatory in Test Evidence,
  Execution Assurance, Completion Evidence, or public finish. That consumer
  hardcut remains `1.104`.

## Non-Goals

`1.103` does not:

- deploy or release software;
- mutate production, cloud accounts, DNS, payment, permissions, or app stores;
- connect to a production database or shared production cache;
- install system packages or obtain elevated privileges;
- use remote SSH execution;
- infer that tests are correct merely because they pass;
- prove product, business, legal, security, privacy, or production correctness;
- let a user-facing confirmation replace technical evidence;
- make downstream completion consumers trust Runtime evidence yet.

## Implementation Assets

- `docs/plans/verification-runtime-lifecycle-1.103-plan.md`
- `core/verification-runtime-lifecycle.md`
- `docs/verification-runtime-lifecycle.md`
- `templates/verification-runtime-lifecycle-plan.md`
- `checklists/verification-runtime-lifecycle-review.md`
- `schemas/artifacts/verification-runtime-lifecycle-plan.schema.json`
- `scripts/lib/verification-runtime-lifecycle.mjs`
- `scripts/resolve-verification-runtime-lifecycle.mjs`
- `scripts/check-verification-runtime-lifecycle.mjs`
- `scripts/run-verification-runtime.mjs`
- `verification-runtime-lifecycle-plans/.gitkeep`
- focused lifecycle tests, generated-project distribution, CI, Manifest,
  release evidence, and documentation indexes.

## Acceptance

### Positive

- LOW command-only lifecycle runs an exact local command and records output.
- LOCAL_PROCESS starts one exact child, observes its PID/argv/cwd, runs exact
  positive and negative checks, and stops only that child.
- run workspace, outputs, journal, receipt, and manifest are current-run bound.
- timeout and verification failure trigger reverse-order owned cleanup.
- `SIGINT`/`SIGTERM` use the same cleanup path.
- generated projects install all lifecycle assets and can run the checkers.

### Negative

- shell command strings and control operators fail.
- unsafe executable, absolute cwd, traversal, symlink, or external output path
  fails.
- stale Runtime Plan, changed declaration, changed project revision, or wrong
  adapter fails.
- production/external-effect action fails.
- pre-existing run workspace or reused resource fails.
- owner marker mismatch blocks cleanup without broadening the target.
- unrelated process/resource cleanup fails.
- missing cleanup action for a created material resource fails.
- raw owner token, secret, password, or full connection URL in evidence fails.
- copied lifecycle plan or manifest fails project/task/source binding.

### Repository

- lifecycle and inherited runtime-trust tests pass;
- strict schemas reject unknown fields;
- Manifest, trusted schema digests, references, CLI, CI, and installation assets
  are consistent;
- generated-project init and update smoke pass;
- full `npm run verify` passes;
- `git diff --check` passes.

## Completion Rule

`1.103` is complete only when IntentOS can prove:

```text
The exact current-project lifecycle plan ran.
Every material local resource belonged to this run.
Every recorded output came from this run window.
Failure or interruption used the same bounded cleanup path.
No unrelated resource was touched.
```

It must not claim that the tests themselves are semantically correct or that
the task, release, or production system is approved. Those remain separate
consumer and domain judgments.
