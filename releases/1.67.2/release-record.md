# Release 1.67.2

## Theme

Release Plan Evidence Hardening.

## Summary

1.67.2 is a narrow patch for the 1.67 Release Core Model. It does not add a new workflow layer, release executor, or old-project migration authority. It hardens Release Plan evidence so unsafe authority claims are harder to hide in structured evidence or Chinese-language text.

## Changes

- Tightened `schemas/artifacts/release-plan.schema.json` with `additionalProperties: false` for the root evidence object, `release_plan`, `release_plan_boundary`, `existing_project_intentos_mode`, `trace` items, and `existing_rule_comparison` items.
- Added Chinese forbidden-claim patterns for production approval, automatic deploy/publish, review submission, release ownership, DNS/payment/provider-state changes, secret requests, skipped Native Migration, ignored rule comparison, governance replacement, trace control, and state-driven execution.
- Added bad fixtures for:
  - extra structured authority fields such as `codex_can_deploy`;
  - Chinese forbidden release-plan claims.
- Updated the Release Plan review checklist to include strict `release_plan_digest` validation and extra authority-field rejection.
- Reworded the 1.67.1 self-check report so private WorkControl-style validation is treated as optional local calibration, not public required CI evidence.

## Allowed Claims

- 1.67.2 rejects extra structured evidence fields that are not part of the Release Plan schema.
- 1.67.2 rejects Chinese-language Release Plan claims that approve production, make Codex the release owner, ask for secrets, skip Native Migration, replace existing governance, or authorize automatic publish/deploy behavior.
- 1.67.2 keeps Release Plan as a pure view model.
- 1.67.2 keeps old-project IntentOS Operating Mode separate from target-project write permission.
- 1.67.2 keeps governed project migration adapter-only until Native Migration, Existing Rule Reconciliation, apply plan, approval, and readiness checks are complete.

## Forbidden Claims

1.67.2 does not:

- add Release Plan execution authority;
- approve production, release, deploy, publish, upload, provider mutation, CI/hook mutation, DNS/payment changes, or production migration;
- make Codex the release owner;
- replace existing project baselines, release SOPs, guard scripts, CI, hooks, or governance files;
- prove every Chinese or mixed-language unsafe phrase is detected;
- require private WorkControl-style projects to exist for public verification.

## Evidence Status

- `scripts/check-release-plan.mjs` includes Chinese forbidden-claim checks and source evidence for the new bad fixtures.
- `scripts/check-intentos.mjs` includes the 1.67.2 release files and new Release Plan bad fixtures.
- `schemas/artifacts/release-plan.schema.json` rejects unknown structured evidence fields on key Release Plan objects.
- `checklists/release-plan-review.md` includes `release_plan_digest` and extra authority-field review checks.
- `releases/1.67.1/self-check-report.md` no longer publishes a private local path as required verification.

## Compatibility

- Artifact payloads still use `schema_version: "1.67.0"` for 1.67 Release Plan evidence.
- Existing valid 1.67 Release Plan evidence remains compatible if it does not rely on extra unsupported fields.
- Markdown-only historical Release Plans remain compatible unless strict structured evidence is required.

## Known Limitations

- Chinese forbidden-claim detection is intentionally conservative and cannot prove every unsafe phrasing is covered.
- Additional schema strictness rejects unknown fields; projects that added custom Release Plan evidence fields must move them into separate project-owned evidence or request a schema extension.
- Release Plan remains a view, not an approval, deployment, or migration mechanism.

## Validation

See [self-check-report.md](self-check-report.md).

## Verification

The patch is verified by:

- syntax check for `scripts/check-release-plan.mjs`;
- strict Release Plan checks for the four positive 1.67 examples;
- source Release Plan check that rejects English unsafe claims, Chinese unsafe claims, and extra structured authority fields;
- manifest drift checks;
- example verification;
- governance verification;
- full IntentOS verification;
- whitespace and patch integrity check.
