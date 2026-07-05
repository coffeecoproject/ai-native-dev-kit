# IntentOS Naming Hardcut 1.73 Plan

## Purpose

1.73 is a naming hardcut release.

The project has already moved conceptually to IntentOS, but repository assets
still expose historical names across public docs, package metadata, CLI aliases,
generated workflow assets, manifests, schemas, CI workflows, templates, and
release records.

The goal of 1.73 is to make IntentOS the only active product, workflow, CLI,
manifest, and generated-asset identity.

This is not a copy-editing task. It is a product identity and runtime-surface
cutover.

## Human Summary

After 1.73, users should see one product:

```text
IntentOS
```

They should not need to understand historical names, compatibility aliases, or
old generated asset folders.

Expected user-facing result:

```text
Use IntentOS on this project.
```

Expected command result:

```text
intentos start <project>
intentos next <project>
intentos doctor <project>
```

Expected generated project result:

```text
.intentos/
.intentos/version.json
.intentos/intentos-manifest.json
```

## Status

Status: Planned

Target release: `1.73.0`

Task level: `L3`

Reason:

- This changes public identity, package metadata, CLI behavior, generated
  project assets, manifest/schema naming, documentation, and verification.
- It can break projects that already contain historical workflow assets.
- It must be handled as a hardcut with explicit migration evidence, not as an
  opportunistic search-and-replace.

## Context Reset

This plan must be executed from repository facts, not conversation memory.

Before implementation, Codex must re-read:

- `README.md`
- `README.zh-CN.md`
- `VERSION.md`
- `package.json`
- `dev-kit-manifest.json`
- `scripts/cli.mjs`
- `scripts/init-project.mjs`
- `scripts/check-dev-kit.mjs`
- `scripts/check-manifest.mjs`
- `scripts/lib/manifest.mjs`
- `schemas/dev-kit-manifest.schema.json`
- `.github/workflows/dev-kit-pr-checks.yml`
- `.github/workflows/dev-kit-release-checks.yml`
- `templates/`
- `core/`
- `docs/plans/productization-hardcut-1.0-plan.md`
- `docs/plans/product-adoption-simplification-1.68-plan.md`
- `docs/plans/adoption-execution-assurance-1.71-plan.md`
- `docs/plans/execution-assurance-chain-1.72-plan.md`

Implementation must start with an inventory command that records where
historical names still appear.

Private project observations may be used only as anonymized calibration. They
must not become hard-coded project rules.

## Current Baseline

Current known baseline before the hardcut:

- public name already says `IntentOS` in several places;
- package name still uses the historical repository/package name;
- CLI exposes compatibility aliases in addition to `intentos`;
- the root manifest is still named with the historical kit terminology;
- generated projects still use `.ai-native/`;
- manifest fields still include historical version naming;
- CI workflows and schemas still include historical file names;
- public README still explains historical naming compatibility;
- many release records and templates contain historical names.

This mixed state is understandable during transition, but it is no longer the
target product shape.

## Naming Contract

### Canonical Product Name

Use:

```text
IntentOS
```

### Canonical Package Name

Use:

```text
intentos
```

### Canonical CLI Command

Use:

```text
intentos
```

### Canonical Generated Asset Directory

Use:

```text
.intentos/
```

### Canonical Manifest File

Use:

```text
intentos-manifest.json
```

### Canonical Version Field

Use:

```text
intentOSVersion
```

### Terms To Remove From Active Surfaces

The following terms must not appear in active user-facing or generated-runtime
surfaces after 1.73:

```text
AI Native Dev Kit
ai-native-dev-kit
ai-native
Dev Kit
dev-kit-manifest.json
devKitVersion
.ai-native/
```

### Controlled Exception

This plan is allowed to mention historical names because it defines the hardcut.

After implementation, any remaining historical naming references must be limited
to one of these categories:

- the 1.73 release evidence explaining the cutover;
- explicit one-time migration notes for projects that already have historical
  workflow assets;
- bad fixtures that intentionally prove naming drift is rejected.

No public README, CLI help, default template, generated project asset, active
core guide, active checklist, or active schema may depend on historical names.

## Goal

Make IntentOS the only active identity across:

- public documentation;
- package metadata;
- CLI command surface;
- generated project workflow assets;
- manifests and schemas;
- script output;
- CI workflow naming;
- templates and checklists;
- self-checks and fixtures.

The hardcut should make ordinary usage look like this:

```bash
intentos start /path/to/project
intentos next /path/to/project
intentos doctor /path/to/project
intentos init --starter generic-project --target /tmp/intentos-smoke
```

## Non-Goals

1.73 must not:

- add a new workflow layer;
- weaken existing execution assurance, adoption assurance, release, baseline,
  or evidence checks;
- change IntentOS governance semantics;
- auto-migrate real projects without explicit approval;
- silently rewrite governed existing projects;
- execute commits, pushes, releases, deploys, CI changes, hooks, production
  changes, secrets, DNS, payment, provider, app-store, mini-program, migration,
  legal, finance, tax, HR, privacy, security, or compliance actions;
- remove release evidence needed to understand the cutover;
- hide migration risk for projects that already contain historical workflow
  assets;
- keep old command aliases as long-term compatibility.

## Design Principles

### Principle 1: Hardcut Public Identity

Public entry points should no longer teach old names.

This includes:

- README;
- Chinese README;
- CLI help;
- package metadata;
- generated project docs;
- first-run instructions;
- command examples.

### Principle 2: One-Time Migration, Not Ongoing Compatibility

Projects that already contain historical workflow assets need a migration path.

That migration path is allowed to detect old assets and produce a plan. It is
not allowed to keep the old identity alive as a normal runtime path.

### Principle 3: Generated Projects Must Be Clean

New projects created after 1.73 must not receive historical asset folders,
manifests, docs, or command examples.

### Principle 4: Existing Projects Must Be Protected

If an existing project contains historical workflow assets, IntentOS must:

1. detect them;
2. explain the migration impact;
3. produce a plan;
4. require approval before moving or rewriting project files;
5. verify the migrated state afterward.

### Principle 5: No Text-Only Cutover

A hardcut is valid only when scripts, schemas, templates, generated assets, and
checks agree with the new identity.

## Scope

### In Scope

- README and Chinese README rewrite for naming consistency;
- `VERSION.md` current release update;
- `package.json` name and CLI bin cleanup;
- root manifest rename;
- manifest field rename;
- manifest schema rename;
- CLI help and command output rewrite;
- init/update/generated asset path change;
- generated workflow asset path change from historical folder to `.intentos/`;
- checkers and resolver path updates;
- CI workflow file rename where practical;
- template and checklist path updates;
- examples and fixtures that depend on generated paths;
- naming drift checker;
- release evidence for 1.73;
- one-time migration planning for projects with historical generated assets.

### Out of Scope

- GitHub repository rename execution;
- npm publishing;
- app-store, mini-program, cloud, provider, or production release execution;
- automatic migration of real projects;
- broad redesign of IntentOS documentation structure beyond naming;
- removal of historical release audit value;
- making every external article or already published reference up to date.

## Execution Plan

### Phase 0: Inventory And Freeze

Goal:

```text
Record the current mixed naming state before changing files.
```

Actions:

1. Run a full naming inventory.
2. Identify active files, generated templates, release records, fixtures, and
   intentional exception locations.
3. Record the inventory result in 1.73 release evidence.
4. Confirm the worktree contains no unrelated tracked changes.

Suggested commands:

```bash
rg -n "AI Native Dev Kit|ai-native-dev-kit|ai-native|Dev Kit|dev-kit-manifest|devKitVersion|\\.ai-native"
git status --short
```

Acceptance:

- inventory exists;
- unrelated user changes are not touched;
- hardcut scope is confirmed before implementation.

### Phase 1: Public Surface Hardcut

Goal:

```text
Make the public product identity only IntentOS.
```

Actions:

1. Rewrite README naming note.
2. Rewrite Chinese README naming note.
3. Update command examples to `intentos`.
4. Remove compatibility alias wording from public docs.
5. Update `VERSION.md` current version and 1.73 release summary.
6. Update `package.json` package name to `intentos`.
7. Remove historical CLI bin aliases from `package.json`.

Acceptance:

- README public entry contains only IntentOS as the product name;
- Chinese README public entry contains only IntentOS as the product name;
- `package.json` exposes only the `intentos` command;
- no old command aliases are presented as normal usage.

### Phase 2: Manifest And Schema Hardcut

Goal:

```text
Rename the product manifest model to IntentOS.
```

Actions:

1. Rename root manifest file to `intentos-manifest.json`.
2. Rename schema file to `schemas/intentos-manifest.schema.json`.
3. Rename manifest field `devKitVersion` to `intentOSVersion`.
4. Update manifest loader logic.
5. Update manifest checker logic.
6. Update manifest references in package scripts, docs, templates, examples,
   and generated assets.

Acceptance:

- root manifest is `intentos-manifest.json`;
- schema is `schemas/intentos-manifest.schema.json`;
- version field is `intentOSVersion`;
- `check-manifest` validates the new manifest;
- no active script requires the historical manifest name.

### Phase 3: CLI And Runtime Output Hardcut

Goal:

```text
Make runtime output and command help speak IntentOS only.
```

Actions:

1. Update `scripts/cli.mjs` help output.
2. Update root detection logic.
3. Update version display.
4. Update command aliases display to only `intentos`.
5. Update error messages that mention historical names.
6. Update any generated report headers that expose historical product naming.

Acceptance:

- `node scripts/cli.mjs --help` does not display historical aliases;
- `node scripts/cli.mjs doctor .` reports IntentOS identity;
- root detection uses the new package name and new manifest;
- no runtime help text teaches old commands.

### Phase 4: Generated Asset Directory Hardcut

Goal:

```text
New target projects use .intentos/ as their workflow asset root.
```

Actions:

1. Update init/update copy rules from historical generated asset root to
   `.intentos/`.
2. Update generated version file path.
3. Update generated manifest path.
4. Update generated docs/checklists/templates path references.
5. Update workflow-next and workflow checkers to read `.intentos/`.
6. Update smoke fixtures and migration fixtures.

Acceptance:

- fresh init creates `.intentos/`;
- fresh init does not create historical generated asset folders;
- generated scripts resolve `.intentos/version.json`;
- generated checkers pass against the new asset root.

### Phase 5: Existing Project Migration Planning

Goal:

```text
Protect projects that already contain historical workflow assets.
```

Actions:

1. Add detection for old generated workflow asset roots.
2. Add a plan-first migration output for renaming historical generated assets
   to `.intentos/`.
3. Require explicit approval before moving or rewriting target project files.
4. Preserve backup/restore notes in the migration plan.
5. Verify post-migration paths in a fixture.

Acceptance:

- existing projects with old assets are not silently rewritten;
- migration plan explains exact source paths and target paths;
- migration plan separates Codex-safe local changes from human decisions;
- checker rejects mixed old/new generated roots unless explicitly marked as a
  pending migration state;
- migrated fixture passes with `.intentos/`.

### Phase 6: Templates, Core Docs, And Checklists

Goal:

```text
Remove historical naming from active workflow assets.
```

Actions:

1. Update `core/` docs.
2. Update `templates/`.
3. Update `checklists/` copied into target projects.
4. Update platform docs.
5. Update current plan docs referenced by active README flows.
6. Keep only controlled migration/release evidence exceptions.

Acceptance:

- active templates do not mention old names;
- generated project docs do not mention old names;
- platform docs use IntentOS consistently;
- active workflow instructions do not require historical terms.

### Phase 7: CI, Workflow, And Naming Drift Guard

Goal:

```text
Prevent old names from returning after the hardcut.
```

Actions:

1. Rename CI workflow files where practical.
2. Update CI workflow names.
3. Add or extend a naming drift checker.
4. Define allowed exception paths.
5. Add bad fixture coverage for old public names.
6. Wire the naming checker into `npm run verify` or the closest existing
   first-party verification path.

Acceptance:

- old public naming drift fails verification;
- intentional migration evidence is allowlisted narrowly;
- `npm run verify` includes naming hardcut checks;
- future README/CLI/template regressions are caught.

### Phase 8: Release Evidence

Goal:

```text
Make the hardcut auditable.
```

Actions:

1. Add `releases/1.73.0/release-record.md`.
2. Add `releases/1.73.0/self-check-report.md`.
3. Add `releases/1.73.0/known-limitations.md`.
4. Record inventory, changed surfaces, validation commands, and known migration
   risks.
5. Record any intentional exception paths.

Acceptance:

- release evidence explains the cutover;
- known limitations include existing-project migration risk;
- validation commands are recorded;
- no release evidence claims that real projects were migrated automatically.

## Verification Plan

### Required Static Checks

Run:

```bash
node scripts/check-manifest.mjs
node scripts/check-dev-kit.mjs
find scripts -name '*.mjs' -print0 | xargs -0 -n1 node --check
```

Expected:

- all scripts parse;
- manifest checker uses the new manifest name and field;
- IntentOS self-check recognizes the hardcut identity.

### Required Public Surface Checks

Run:

```bash
rg -n "AI Native Dev Kit|ai-native-dev-kit|ai-native|Dev Kit|dev-kit-manifest|devKitVersion|\\.ai-native" README.md README.zh-CN.md package.json scripts templates core platforms .github
```

Expected:

- no active public/runtime/generated surface references remain;
- any remaining references are confined to allowed migration/release evidence
  exceptions.

### Required CLI Checks

Run:

```bash
node scripts/cli.mjs --help
node scripts/cli.mjs doctor .
node scripts/cli.mjs start .
node scripts/cli.mjs next .
```

Expected:

- output identifies the system as IntentOS;
- help shows `intentos` as the command;
- old aliases are not advertised;
- commands continue to run.

### Required Init Smoke

Run:

```bash
tmp="$(mktemp -d)"
node scripts/cli.mjs init --starter generic-project --target "$tmp/project"
find "$tmp/project" -maxdepth 3 -type f | sort
```

Expected:

- generated project includes `.intentos/`;
- generated project includes `.intentos/version.json`;
- generated project includes `.intentos/intentos-manifest.json`;
- generated project does not include historical generated workflow asset roots.

### Required Existing-Asset Migration Fixture

Run a fixture that starts from a project with historical generated workflow
assets and verifies:

```text
detect -> plan -> explicit approval required -> migrated fixture passes
```

Expected:

- detection does not write target files;
- migration plan identifies old and new paths;
- mixed roots are treated as pending migration or invalid;
- migrated fixture passes standard checks.

### Required Full Verification

Run:

```bash
npm run verify
```

Expected:

- full first-party verification passes;
- verification includes naming drift coverage;
- no check passes because old paths are silently accepted as normal runtime
  paths.

## Review Plan

1. Perform a source review focused on public identity drift.
2. Perform a runtime review focused on CLI output and generated assets.
3. Perform a migration review focused on existing projects with old assets.
4. Perform a fixture review focused on bad naming drift examples.
5. Perform a release evidence review focused on whether 1.73 claims more than
   it proves.

Review findings must be classified:

| Class | Meaning | Action |
|---|---|---|
| `AUTO_FIX` | Deterministic naming or path inconsistency | Codex may fix and rerun checks |
| `NEEDS_HUMAN_DECISION` | Repo rename, package publish, external migration, public compatibility | Stop for user decision |
| `BLOCKER` | New and old identities both remain active | Fix before release |
| `DOCUMENT_ONLY` | Release explanation needs clarity | Fix docs and rerun naming checks |

## Rollback Plan

If the hardcut breaks verification:

1. Do not reintroduce old aliases as a silent fallback.
2. Restore from git only for files changed by this implementation.
3. Keep the failure evidence in the 1.73 working notes.
4. Decide whether to split implementation into:
   - `1.73.0` public/CLI hardcut;
   - `1.73.1` generated-asset migration;
   - `1.73.2` historical-doc cleanup.

Rollback must not delete unrelated user changes.

## External Rename Plan

Repository hosting and package publishing are external actions.

Recommended final external identity:

```text
GitHub repository: coffeecoproject/intentos
Package name: intentos
CLI command: intentos
```

These actions require human confirmation and external-system execution. IntentOS
may produce the plan, but must not perform repository rename, package publish,
or external release without explicit approval.

## Success Definition

1.73 is complete only when:

- IntentOS is the only active product name in public surfaces;
- `intentos` is the only active CLI command;
- generated projects use `.intentos/`;
- manifests use `intentos-manifest.json`;
- version metadata uses `intentOSVersion`;
- existing projects with old assets receive a plan-first migration path;
- naming drift is checked automatically;
- release evidence documents the cutover;
- full verification passes.

## Final Boundary

The hardcut changes identity and generated workflow asset paths.

It does not grant Codex permission to:

- rewrite real projects automatically;
- replace production governance without approval;
- deploy, publish, submit, migrate, or release;
- modify secrets, DNS, payments, provider settings, app stores, mini-program
  platforms, production configs, legal/compliance/finance/tax/HR decisions, or
  customer data;
- treat old-project migration as complete without evidence.

IntentOS remains a governed execution and delivery workflow system. The 1.73
hardcut makes that system's identity coherent.
