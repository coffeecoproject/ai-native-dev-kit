# Verification Runtime Trust

IntentOS uses Verification Runtime Trust to distinguish a test result from a
test result produced by the intended code and runtime.

## Plain-Language Behavior

The user can continue to say:

```text
把这个功能完整做好并验证。
```

Codex determines the task tier, runtime adapter class, service identity,
isolation level, probes, evidence, and cleanup requirements. These technical
choices are not sent back to a zero-experience user for selection.

## Internal Artifacts

- `Verification Runtime Plan`: what this task's verification run must prove.
- `Verification Run Manifest`: what the observed run actually proved.

They are internal governance artifacts. They do not add a required public user
command.

## Current 1.102 Boundary

1.102 can generate and check the platform-neutral runtime plan, bind adapter
selection to current project evidence, and validate adapter-specific service or
build identities in a recorded run manifest. It does not start real services,
call providers, or provision isolated resources.

See [Verification Runtime Adapters](verification-runtime-adapters.md) for the
current adapter contract.

Existing Test Evidence remains valid under its historical contract but does not
automatically become runtime-trusted evidence. A free-form environment label
such as `local-dev` is not a substitute for a run manifest.

## Safety

- store fingerprints and digests, not credentials;
- never use a production data instance for HIGH verification;
- clean only resources carrying the current run's owner marker;
- fail closed when the source, service, data, session, or cleanup identity
  required by the task tier cannot be established;
- keep release execution and verification runtime trust as separate systems.
