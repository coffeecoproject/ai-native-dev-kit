# IntentOS 1.102.0 Release Record

## Theme

Verification Runtime Adapters.

## Delivered

- project-local runtime adapter discovery;
- deterministic adapter capability contracts and digests;
- local process, Docker, Kubernetes, serverless, static, and project-native
  adapter classes;
- project-source and Evidence Authority binding for adapter discovery;
- adapter-specific service/build identity validation;
- explicit `OBSERVE_AND_PLAN_ONLY` lifecycle boundary;
- compatibility for historical `1.101` runtime plans and manifests;
- source and generated-project distribution updates.

## User Contract

The zero-experience solo user does not choose technical runtime infrastructure.
Codex derives the adapter from current project evidence. Missing or conflicting
technical evidence becomes an internal blocker, not a user questionnaire.

## Safety Boundary

This release does not start or stop runtimes, execute tests, call providers,
create/delete resources, perform cleanup, change production, or approve task
completion or release.

## Evidence Status

Repository evidence verifies deterministic adapter discovery, project-source
binding, adapter contract digests, adapter-specific identity requirements,
strict negative cases, installed-project distribution, and the inherited
runtime-plan/run-manifest authority chain. It does not prove that a real
service was started, a real test was executed, an external provider was
reached, or a production environment behaved correctly.

## Known Limitations

The adapter layer observes and plans only. Runtime startup, isolated resource
ownership, safe cleanup, and command execution remain future lifecycle work.
Unknown or conflicting project evidence fails closed as an internal technical
blocker. Projects may provide stricter native runtime evidence, but they may
not weaken the IntentOS schema, path, digest, or authority requirements. See
[known-limitations.md](known-limitations.md).

## Allowed Claims

- IntentOS can derive a typed runtime adapter contract from bounded,
  project-local evidence without asking a zero-experience user to choose
  infrastructure.
- A `1.102` runtime plan binds the selected adapter, capability contract,
  discovery sources, and adapter contract digest.
- A run manifest bound to a `1.102` plan must provide the service or build
  identity required by the selected adapter class.
- Missing, conflicting, stale, escaped, or tampered adapter evidence fails
  closed in the supported strict checks.

## Forbidden Claims

- Adapter selection does not prove that a runtime exists or is healthy.
- A valid runtime plan does not prove that tests ran or passed.
- A valid run manifest does not approve completion, release, deployment, or
  production changes.
- Repository verification does not prove external provider state, production
  behavior, or business correctness.

## Verification

- adapter/runtime focused tests: PASS;
- strict plan and run-manifest checks: PASS;
- recursive syntax checks: PASS;
- manifest and source self-check: PASS;
- generated-project smoke: PASS;
- full repository verification: PASS;
- final `git diff --check`: PASS.

Detailed command evidence is recorded in `self-check-report.md`.
