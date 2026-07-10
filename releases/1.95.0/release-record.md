# IntentOS 1.95.0 Release Record

## Theme

Operating Model Consolidation.

## Human Summary

Users can now give IntentOS one natural-language goal instead of choosing among
many internal commands. IntentOS determines whether the project is new or
existing and whether the user wants to start, continue, check status, finish,
prepare release, or adopt an existing project.

The result shows one current state, one safe next step, and at most one
meaningful decision. Maintainers can still inspect every lower-level source
system through the advanced command reference.

## Delivered

- one public read-only `work` command and six-operation routing model;
- durable new-project versus existing-project entry origin in the installed
  workflow version record;
- Project Entry classification that is not polluted by managed governance
  assets installed during bootstrap;
- one derived Operating State over existing task, evidence, adoption, closure,
  baseline, and release source systems;
- derived Evidence Trace with source outcome, missing/blocking input, freshness
  meaning, and invalidation conditions;
- derived Authority Recommendation that never grants authority;
- beginner-only default CLI help with complete lower-level commands preserved
  in `--help-advanced`;
- generated-project, unit, self-check, PR, and release regression coverage;
- release-tag and package-version parity enforcement;
- task-depth calibration proving that a BL2 project can still have a genuinely
  low-impact task.

## Allowed Claims

- A user can enter the common IntentOS operating loop with one natural-language
  goal and without selecting an internal checker.
- New and existing projects share one daily task lifecycle after Project Entry.
- The Operating Model explains which source systems were read and which owner
  may be needed before a material action.
- Lower-level source systems remain available and authoritative.

## Forbidden Claims

- The Operating Model is a new evidence authority or source of truth.
- `CURRENT_RUN` means a strict checker passed.
- Authority Recommendation grants approval or transfers project authority.
- The `work` command writes target files, changes task state, authorizes
  implementation/apply, or approves release/production.
- BL2 project depth makes every task high impact.

## Evidence Status

- new empty project routing: PASS
- initialized generated-project routing: PASS
- existing project task routing: PASS
- existing project adoption routing: PASS
- task impact and BL2 separation: PASS
- initialized-new-project task continuation: PASS
- business-term routing conflict regression: PASS
- production-project signal override with task-impact separation: PASS
- release tag/package version parity gate: PASS
- finish-without-evidence fail-closed path: PASS
- source failure visibility: PASS
- default/advanced CLI help separation: PASS
- manifest and generated asset installation: PASS
- full repository verification: PASS

## Known Limitations

Projects installed before 1.95 may not have durable project-entry origin and
must fall back to current project signals and intent. Natural-language routing
is conservative, and the operating view does not run strict source checkers,
tests, provider checks, or production checks. Existing-project rule comparison
and controlled migration requirements remain in force.

See [known-limitations.md](known-limitations.md) for the complete boundary.

## Verification

The release is checked through operating-model unit and negative tests,
generated-project installation and routing smoke tests, manifest validation,
full IntentOS self-check, product/claim boundaries, and the complete repository
verification surfaces. These checks prove synthetic routing and repository
behavior only; they do not certify a real product or production release.

See [self-check-report.md](self-check-report.md) for command-level evidence.
