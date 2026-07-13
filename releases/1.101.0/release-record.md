# IntentOS 1.101.0 Release Record

## Theme

Verification Runtime Trust Core.

## Human Summary

IntentOS can already require a test plan and bind saved test evidence to the
current task. This release adds the missing runtime identity layer: it records
which source revision, service instance, isolated resources, session context,
commands, outputs, and cleanup belong to one verification run.

The ordinary user still describes the business goal only. Codex derives the
task tier and chooses the supported runtime adapter, port, data isolation, and
test tooling. Missing technical choices do not become user questions.

## Delivered

- one Verification Runtime Plan schema and resolver;
- one Verification Run Manifest schema and strict checker;
- LOW source/output binding, MEDIUM targeted service identity, HIGH isolated
  runtime, and fail-closed POSSIBLE_HIGH classification;
- project and task identity binding through Evidence Authority;
- service-instance identities for local process, container, Kubernetes,
  serverless, static-build, and project-native adapters;
- run-owned resource ledger and bounded cleanup evidence;
- secret, production-resource, unrelated-cleanup, stale-source, and output
  digest rejection;
- installed-project CI, source CI, manifest, and self-check integration.

## Preserved Safety

- no service, container, database, simulator, or external provider is started;
- no test is executed by the plan or checker;
- no resource is created, changed, or deleted;
- no user technical selection is required;
- no completion, apply, release, or production authority is granted;
- no automatic downstream Test Evidence or Completion hardcut is introduced
  in this compatibility step.

## Evidence Boundary

The runtime plan proves which controls are required. A valid run manifest
proves that a recorded run is internally consistent with the current project,
task, source revision, service/resource identities, outputs, and cleanup. It
does not prove product correctness, legal correctness, provider state, or real
production safety by itself.

## Evidence Status

The final intended source snapshot must pass focused positive/negative runtime
trust tests, strict Manifest validation, repository self-check, generated
project installation checks, the isolated full verification suite, and the
diff check. The checked evidence remains repository-local and cannot infer an
unobserved external runtime or production result.

## Known Limitations

This release defines and validates runtime planning and recorded run identity.
It does not execute runtime adapters, manage resources, or require downstream
Test Evidence and Completion artifacts to consume the Run Manifest. Those
boundaries are detailed in [known-limitations.md](known-limitations.md).

## Allowed Claims

- IntentOS can derive the runtime trust required by a task tier.
- A valid Run Manifest is bound to the current project, task, source revision,
  runtime plan, service/resource identities, outputs, and cleanup record.
- The installed project receives the same runtime-trust schemas and checkers.

## Forbidden Claims

- A valid plan or manifest does not prove product or business correctness.
- 1.101 does not claim that IntentOS executed the tests or created the runtime.
- Runtime Trust does not approve implementation, apply, completion, release,
  production, provider action, migration, or destructive cleanup.
- Existing Test Evidence does not become runtime-trusted without an explicit
  downstream binding in a later release.

## Verification

See [self-check-report.md](self-check-report.md) for final repository checks and
[known-limitations.md](known-limitations.md) for deferred adapter execution and
downstream consumer work.
