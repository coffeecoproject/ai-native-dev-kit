# IntentOS 1.103.0 Release Record

## Theme

Verification Runtime Lifecycle And Resource Ownership.

## Delivered

- strict lifecycle-plan schema and project-bound resolver;
- exact no-shell local command and direct-runtime service execution;
- executable availability preflight, action-level `PATH` replacement rejection,
  and deterministic dependency ordering;
- minimal environment inheritance and credential-shaped input rejection;
- run-scoped owner token, marker digest, resource ledger, and journal;
- interruption/failure cleanup limited to exact child processes and owned paths,
  including bounded termination escalation for an unresponsive child;
- cleanup-before/after and observed output evidence;
- 1.103 Run Manifest binding to the exact lifecycle plan and journal;
- CLI, installed CI, manifest, documentation, and focused regressions.

## Boundaries

This release does not execute Docker, Kubernetes, serverless, provider, remote,
release, production, migration, secret, payment, DNS, or irreversible actions.
It does not approve implementation, completion, release, or production.

## User Contract

The zero-experience solo user states the business goal. Codex chooses commands,
ports, local isolation, and cleanup mechanics. Missing technical runtime facts
remain an internal blocker rather than a user questionnaire.

## Evidence Status

Focused evidence proves exact local command execution, current plan
and declaration binding, owner-token redaction, run-scoped evidence output,
dangerous-command rejection, deterministic dependency execution, positive and
negative local-service probes, and interruption cleanup. Repository and
installed-distribution evidence passed the full verification chain.

## Known Limitations

Automatic execution is local and bounded. Provider, Docker, Kubernetes,
serverless, remote, release, and production lifecycle effects remain blocked.
Downstream completion consumers do not yet require this runtime chain. See
[known-limitations.md](known-limitations.md).

## Allowed Claims

- IntentOS can execute a current, exact, project-owned local lifecycle plan
  without a shell.
- It records observed outputs, run identity, resource ownership, and cleanup
  evidence for the supported local modes.
- Missing declarations, stale bindings, unsafe commands, external effects,
  unowned resources, and incomplete cleanup fail closed.

## Forbidden Claims

- Runtime trust does not prove business or product correctness.
- A valid lifecycle plan does not prove that execution happened.
- A passing Run Manifest does not approve implementation, task completion,
  release, provider actions, or production.
- This release does not support automatic external or production lifecycle
  execution.

## Acceptance

The release is accepted only when focused lifecycle tests, runtime trust tests,
source self-check, installed-distribution smoke checks, manifest validation, and
the full `npm run verify` chain pass.

## Verification

- focused lifecycle and runtime-trust tests: PASS, 23 tests;
- strict schema, manifest, and source self-check: PASS, 9,071 checks;
- generated-project init/update and installed checker smoke: PASS;
- full repository verification: PASS, 22,154 checks;
- final `git diff --check`: PASS.
