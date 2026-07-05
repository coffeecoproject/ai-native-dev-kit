# Product Adoption Trust Hardening 1.68.1 Plan

## Purpose

1.68.1 hardens the 1.68 public entry experience.

It does not add a new governance layer. It makes the existing entry safer, more consistent, and easier to adopt from the source repository.

## Scope

1. Align public release trust:
   - keep version metadata consistent;
   - create 1.68.1 release evidence;
   - prepare `v1.68.0` as the external immutable tag for the 1.68.0 public-entry release.

2. Calibrate `workflow-next` recommendations:
   - existing, partially bootstrapped, governed, dirty, unbootstrapped, or version-mismatch projects should default workflow asset updates to `--write-plan`;
   - clean, already bootstrapped, low-risk projects may still show direct workflow asset update when appropriate.

3. Tighten dirty worktree handling:
   - dirty projects must stop before task execution, first-request creation, or workflow asset update;
   - continuation requires explicit human review or approval.

4. Align CLI aliases:
   - `intentos`, `intentos`, and `intentos` should match the package bin declarations and help text.

5. Clarify source-only adoption:
   - document the current GitHub clone usage path;
   - avoid claiming npm package, hosted service, installer, dashboard, or production one-click setup.

6. Clarify security reporting:
   - document preferred private vulnerability reporting channels;
   - list security impact areas for scripts, generated assets, CI templates, release guidance, and adoption docs.

## Non-Goals

- Do not publish an npm package.
- Do not add installer, TUI, dashboard, hosted service, or GitHub Action.
- Do not loosen write, release, hook, migration, baseline, approval, or apply boundaries.
- Do not make IntentOS Operating Mode a write permission.
- Do not make Codex the release owner.

## Acceptance Criteria

- README, README.zh-CN, VERSION, package, manifest, templates, and release records agree on 1.68.1.
- `workflow-next` recommends plan-first update for existing or partial projects.
- dirty projects stop before workflow update or task execution.
- CLI help aliases match package bin declarations.
- source-only adoption is documented and linked from front-door docs.
- SECURITY.md has concrete private-reporting guidance without promising an SLA.
- `node scripts/check-manifest.mjs`, `npm --silent run verify:governance`, `node scripts/check-intentos.mjs`, and `git diff --check` pass.

