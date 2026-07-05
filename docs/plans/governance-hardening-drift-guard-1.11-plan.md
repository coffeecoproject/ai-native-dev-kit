# Governance Hardening & Drift Guard 1.11 Plan

## Human Summary

1.11.0 hardens the kit after the 1.10 Guided Decision & Delivery Loop.

The goal is not to add another workflow layer. The goal is to make the existing workflow harder to misuse, harder to drift, and easier to verify before it is copied into real projects.

## Why This Exists

Review feedback after 1.10 identified several real risks:

- README release pointers can fall behind `VERSION.md`.
- Direct init can still be mistaken for safe adoption on a non-empty existing directory.
- Manifest checks verify declared assets, but do not fully catch source files that should be declared and were forgotten.
- Some checks still depend on simple string markers instead of meaningful Markdown sections.
- Users need a single verification command that represents release-level confidence.

These are governance hardening issues. They should be treated as a formal release phase, not as scattered cleanup.

## Scope

1.11.0 includes:

- README release pointer synchronization for the current release and recent release records.
- Non-empty target protection for direct new-project init.
- Manifest reverse drift guard for important source assets.
- Structured Markdown section validation for release claim checks.
- A first-party release verification script.
- Version, manifest, docs, and release evidence updates.

## Non-Goals

1.11.0 does not:

- promote any industrial pack from `draft`;
- add production validation claims;
- add automatic GPT/API review;
- add automatic real-project scanning;
- change license terms;
- add real CODEOWNERS without a human-maintainer decision;
- make BL2 or industrial packs default;
- allow target-project writes without the existing plan-first and human-review boundaries.

## Design Principles

### 1. Harden Existing Gates First

Do not create a parallel governance layer when an existing checker can be strengthened.

### 2. Make Drift Visible

If a release file, source asset, or copied workflow asset is missing from the expected inventory, the kit should fail loudly.

### 3. Protect Existing Projects

Direct init is for new or empty targets. Existing non-empty targets must use dry-run/write-plan/apply-plan or an explicit force flag.

### 4. Validate Meaning, Not Only Words

Marker checks are acceptable for broad smoke coverage, but release records and high-value reports need section body checks.

### 5. Keep User Burden Low

The default user-facing guidance remains: Codex recommends the path; humans confirm product direction, authority, and risk.

## Planned Changes

### A. README Release Sync

Add `1.10.0` and `1.9.0` release records to both README files.

Add self-check coverage so the current `VERSION.md` release must appear in README release pointers.

### B. Direct Init Non-Empty Guard

Add a guard before direct `executeInit`:

- target missing: allowed;
- target exists and is empty: allowed;
- target exists and only contains ignorable local metadata such as `.DS_Store`: allowed;
- target exists and is non-empty: blocked by default;
- non-empty direct init requires `--force-new-project`;
- safer path remains `--dry-run`, `--write-plan`, then `--apply-plan`.

This guard does not weaken update behavior. Existing governed, production, dirty, or bootstrapped projects still use the current plan-first gate.

### C. Manifest Reverse Drift Guard

Extend `check-manifest` so important source files must be represented in manifest coverage.

Coverage sources:

- `groups.sourceRequired`
- `copyRules.directories`
- `copyRules.files`

Important tracked asset classes:

- `core/**/*.md`
- `templates/**/*.md`
- `prompts/**/*.md`
- `checklists/**/*.md`
- `docs/**/*.md`
- `profiles/**/*.md`
- `platforms/**/*.md`
- `starters/**/*`
- `scripts/**/*.mjs`
- `.github/workflows/*.yml`
- selected root governance files such as `README.md`, `README.zh-CN.md`, `VERSION.md`, `package.json`, `SECURITY.md`, `CONTRIBUTING.md`, and license files

The guard should allow an explicit ignore list for archival, planning, generated, or intentionally source-only files.

### D. Structured Release Section Checks

Strengthen claim/product release checks so release records must contain meaningful bodies under:

- `Allowed Claims`
- `Forbidden Claims`
- `Evidence Status`
- `Verification`
- `Known Limitations`

This reduces "section heading only" compliance.

### E. Verify Script

Add a release-level verification entry:

```bash
npm run verify
```

The script should run:

```bash
node --check scripts/init-project.mjs
node --check scripts/new-workflow-item.mjs
node --check scripts/check-intentos.mjs
node scripts/check-manifest.mjs
node scripts/check-intentos.mjs
git diff --check
```

This is a convenience script. It does not replace individual evidence commands in release records.

## Expected User Impact

For normal users:

- fewer technical decisions;
- safer default behavior when pointing the kit at an existing folder;
- clearer README version pointers.

For maintainers:

- new source assets must be added to manifest or explicitly ignored;
- release records must contain real section content;
- `npm run verify` becomes the preferred pre-commit release check.

For target projects:

- no new automatic writes;
- no new required artifacts;
- no new BL2 default;
- no change to real-project read-only adoption policy.

## Execution Plan

1. Update README release pointers.
2. Add direct init non-empty guard and `--force-new-project` usage text.
3. Add manifest reverse drift guard.
4. Strengthen release section validation.
5. Add `verify` script and Node engine metadata.
6. Add 1.11 release evidence and version updates.
7. Extend intentos self-check coverage.
8. Run full verification.

## Acceptance Criteria

The release is complete when:

- `VERSION.md`, `package.json`, `templates/version-record.md`, and `templates/workflow-version.json` show `1.11.0`;
- README and README.zh-CN list the current release record;
- direct init blocks non-empty target directories without `--force-new-project`;
- `check-manifest` catches an intentionally unmanifested important source asset in self-check coverage;
- release records with empty required sections fail structured validation;
- `npm run verify` passes;
- `node scripts/check-intentos.mjs` passes;
- `git diff --check` passes;
- release evidence states limitations and does not claim production validation.

## Risk Controls

- Do not change target-project adoption permissions.
- Do not change update/apply-plan semantics except direct init guarding.
- Do not delete existing manifest entries.
- Keep manifest ignore behavior explicit and reviewable.
- Keep new checks dependency-free.

