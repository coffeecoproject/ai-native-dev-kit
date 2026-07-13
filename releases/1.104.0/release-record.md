# IntentOS 1.104.0 Release Record

## Theme

Runtime Trust Consumer Hardcut.

## Delivered

- one shared authoritative Runtime Trust consumer library;
- automatic safe discovery and strict validation of the current Verification Run Manifest;
- schema `1.104.0` Runtime Trust bindings in Test Evidence, Execution Assurance, and Completion Evidence;
- exact current task, intent, project, source, Verification Plan, Runtime Plan, and Lifecycle Plan matching;
- Test Evidence mapping to observed passing execution outputs;
- cross-consumer one-run agreement before Completion Evidence can become ready;
- public `finish` Runtime Trust input and strict `DONE` blocker;
- historical-schema compatibility without strict-completion authority;
- focused stale, copied-project, wrong-task, and empty-evidence regressions;
- installed distribution, CI, manifest, references, and version synchronization.

## User Contract

The zero-experience solo user continues to describe business behavior only. Codex owns runtime selection, execution, evidence binding, repair, and technical close-out. Missing Runtime Trust is an internal work item unless an unavailable business fact or concrete external effect is involved.

## Boundaries

This release does not make a passing command proof that a test assertion is correct. It does not approve implementation, commit, push, release, provider operations, production, payment, DNS, secrets, migrations, or irreversible effects.

## Evidence Status

Focused positive and adversarial Runtime Trust consumer tests pass. Final
repository-wide and generated-project verification is recorded in
[self-check-report.md](self-check-report.md).

## Known Limitations

Automatic runtime execution remains local and bounded. Runtime provenance does
not prove semantic assertion correctness, and external/provider/production
lifecycle execution remains blocked. See
[known-limitations.md](known-limitations.md).

## Allowed Claims

- Strict completion consumers independently validate one current-task run.
- Textual, historical, copied, stale, mismatched, and empty evidence cannot replace that run.
- Test Evidence coverage can be traced to exact passing outputs recorded by the bound manifest.

## Forbidden Claims

- Runtime provenance alone proves product correctness.
- A valid Run Manifest overrides missing impact, review, business, or external-decision evidence.
- Runtime Trust authorizes release or production.

## Acceptance

The release is accepted only when focused 1.101-1.104 runtime tests, strict schema checks, source self-check, generated-project installation smoke, full `npm run verify`, and `git diff --check` pass.

## Verification

The complete verification run passed. Counts and acceptance evidence are recorded in [self-check-report.md](self-check-report.md).
