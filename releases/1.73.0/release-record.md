# 1.73.0 Release Record

## Release

Version: `1.73.0`

Theme: IntentOS Naming Hardcut

## Summary

1.73.0 makes IntentOS the only active product, workflow, CLI, manifest, and
generated-asset identity.

This release removes the mixed naming state from active public and runtime
surfaces. New project assets use `.intentos/`, the authoritative manifest is
`intentos-manifest.json`, package metadata exposes the `intentos` command, and
manifest version metadata uses `intentOSVersion`.

## What Changed

- Public README files now present IntentOS as the only active product identity.
- Package metadata now uses the `intentos` package name and only exposes the
  `intentos` command.
- The authoritative source manifest is now `intentos-manifest.json`.
- The manifest schema is now `schemas/intentos-manifest.schema.json`.
- Generated workflow assets now target `.intentos/`.
- Generated project manifests now target `.intentos/intentos-manifest.json`.
- Workflow version metadata now uses `intentOSVersion`.
- CI workflow files use IntentOS naming.
- The source self-check script is `scripts/check-intentos.mjs`.
- The change proposal template is `templates/intentos-change-proposal.md`.
- CLI help uses `Command: intentos` instead of compatibility alias wording.
- Naming drift is now an explicit hardcut verification concern.

## Existing Project Boundary

Existing projects that already contain older generated workflow assets are not
silently rewritten by this release.

Expected path:

```text
detect old assets
-> produce migration plan
-> require approval
-> move or rewrite target files only after approval
-> verify migrated state
```

1.73.0 does not approve project governance replacement, release ownership,
production actions, CI/hook changes, secrets, migrations, provider actions,
payments, app-store submissions, mini-program submissions, or target-project
file writes.

## Allowed Claims

- IntentOS 1.73.0 can be described as the naming hardcut release for active
  product, CLI, manifest, schema, generated-asset, template, and CI workflow
  identity.
- New generated workflow assets may be expected under `.intentos/`.
- The active source manifest may be expected at `intentos-manifest.json`.
- Manifest version metadata may be expected as `intentOSVersion`.
- Existing projects with older generated workflow assets may be detected and
  routed into a plan-first naming migration review.

## Forbidden Claims

- 1.73.0 does not prove that any real external project has been migrated.
- 1.73.0 does not authorize automatic target-project file writes.
- 1.73.0 does not approve governance replacement, release ownership, production
  deployment, package publish, repository rename, CI/hook mutation, secrets,
  migrations, provider actions, payment actions, app-store submission,
  mini-program submission, compliance decisions, finance/tax/HR/legal decisions,
  or customer-data changes.
- Passing naming checks is not proof of product correctness or production
  readiness.

## Evidence Status

- Package metadata, CLI help, manifest naming, schema naming, generated asset
  paths, CI workflow naming, templates, and active checks are included in the
  hardcut verification scope.
- `check-manifest` validates `intentos-manifest.json` and `intentOSVersion`.
- `check-intentos` includes an active-surface naming drift guard.
- Generated project smoke checks must prove `.intentos/` is produced.
- Existing-project naming migration remains plan-first and must not be claimed
  complete without migrated-state evidence.

## Known Limitations

- External repository rename and package publishing are outside this release and
  require explicit human approval.
- Historical release evidence may still describe earlier transition states; that
  evidence is not active product identity.
- Projects already containing older generated workflow assets require a
  dedicated migration plan and approval before files are moved or rewritten.
- Naming consistency does not replace execution, release, baseline, adoption, or
  production readiness verification.

## Verification Scope

Required checks for this release:

```bash
node scripts/check-manifest.mjs
node scripts/check-intentos.mjs
find scripts -name '*.mjs' -print0 | xargs -0 -n1 node --check
node scripts/cli.mjs --help
node scripts/cli.mjs doctor .
node scripts/cli.mjs start .
node scripts/cli.mjs next .
npm run verify
```

## Verification

Verification must include manifest validation, IntentOS self-check, syntax
checks, CLI help, read-only entry commands, generated project smoke, and full
`npm run verify`.

## Acceptance

This release is acceptable only if:

- `README.md` and `README.zh-CN.md` do not teach old public command aliases;
- `package.json` exposes only `intentos`;
- `intentos-manifest.json` matches `VERSION.md`;
- generated project assets use `.intentos/`;
- active CLI output uses IntentOS naming;
- old generated assets require plan-first migration;
- full verification passes.

## Known Non-Actions

- No GitHub repository rename was performed.
- No npm package publish was performed.
- No real project was migrated automatically.
- No production, release, provider, CI, hook, secret, DNS, migration, payment,
  app-store, mini-program, legal, compliance, finance, tax, HR, or customer data
  action was performed.
