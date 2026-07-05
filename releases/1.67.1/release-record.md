# Release 1.67.1

## Theme

Release Plan Evidence Strictness and Existing-Project Entry Calibration.

## Summary

1.67.1 is a patch release for the 1.67 Release Core Model. It does not add a new workflow layer or change the Release Plan schema. It tightens Release Plan evidence checks and makes old-project entry clearer:

- Codex can work in IntentOS Operating Mode immediately for planning, routing, review, and comparison.
- Existing project baselines, release rules, CI, hooks, guard scripts, and governance files must still be compared before any migration or replacement.
- Asset changes still require Native Migration, Existing Rule Reconciliation, Unified Apply Plan, Approval Record, and Controlled Apply Readiness.

## Changes

- Added `release_plan_digest` validation to strict Release Plan evidence checks.
- Split Release Plan summary states from `RELEASE_PLAN_RECORDED` outcome handling so Human Summary cannot use an outcome-only value as a state.
- Added missing positive examples for:
  - Web preview
  - Mini-program review
  - Backend API handoff
  - Governed existing-project read-only adoption
- Added bad fixtures for unsafe Release Plan claims:
  - Codex as release owner
  - secret requests
  - provider-side execution
  - skipped Native Migration
  - lower-level system replacement
  - maximizing governed-project asset migration
  - trace controlling execution
- Calibrated `start` / `next` output for governed, dirty, old, and production-sensitive projects with:
  - `INTENTOS_OPERATING_MODE`
  - `PROJECT_ASSET_MIGRATION_DEPTH`
  - `EXISTING_RULE_COMPARISON_REQUIRED`
- Updated README and version records to explain the old-project behavior in plain language.

## Existing Project Contract

For old projects, IntentOS is active as a working mode, not as write permission.

Codex may:

- use IntentOS planning and task routing;
- use IntentOS review, close-out, and comparison rules;
- compare existing baselines and release rules with IntentOS references;
- prepare Native Migration, Existing Rule Reconciliation, and apply plans.

Codex must not:

- overwrite `AGENTS.md`, CI, hooks, baseline docs, release SOPs, production config, or guard scripts just because IntentOS is active;
- maximize migration depth by default;
- treat Release Plan as release approval;
- replace stricter or proven project rules without review;
- ask for secrets or mutate provider state.

## Allowed Claims

- 1.67.1 validates `release_plan_digest` when strict Release Plan evidence is required.
- 1.67.1 covers Web preview, mini-program review, backend API handoff, and governed existing-project Release Plan examples.
- 1.67.1 rejects Release Plans that make Codex the release owner, ask for secrets, execute provider actions, skip Native Migration, replace lower-level source systems, maximize governed-project migration, or let trace control execution.
- `start` and `next` can tell old-project users that IntentOS Operating Mode is active for planning, routing, review, and comparison.
- Existing project asset migration remains blocked until Native Migration, Existing Rule Reconciliation, Unified Apply Plan, Approval Record, and Controlled Apply Readiness are complete.

## Forbidden Claims

1.67.1 does not:

- introduce a new Release Plan schema version;
- make Release Plan an authority, workflow engine, release approval, deployment approval, or execution system;
- allow Codex to deploy, publish, upload, submit review, run migrations, mutate provider state, change DNS/payment/secrets/CI/hooks, or become release owner;
- let IntentOS Operating Mode grant write permission;
- automatically replace old project governance, baselines, release SOPs, guard scripts, CI, hooks, or `AGENTS.md`;
- prove every existing project rule or release risk was found;
- maximize old-project migration depth by default.

## Evidence Status

- `scripts/check-release-plan.mjs` validates strict Release Plan evidence, summary state, forbidden release-plan claims, and source evidence.
- `scripts/check-intentos.mjs` includes expanded Release Plan example and bad-fixture coverage.
- `scripts/start-project.mjs` and `scripts/workflow-next.mjs` expose IntentOS Operating Mode, Project Asset Migration Depth, and Existing Rule Comparison Required for old-project entry.
- `examples/1.67-release-core-model/*` provides four positive Release Plan examples.
- `test-fixtures/bad/bad-release-plan-*` covers unsafe release-plan claims.
- `intentos-manifest.json`, `VERSION.md`, `package.json`, README, and workflow version templates are updated to `1.67.1`.

## Compatibility

- Artifact schema remains `1.67.0`.
- Existing 1.67.0 Release Plan records remain compatible.
- 1.67.1 only tightens source checks and example evidence.

## Known Limitations

- WorkControl-style production projects can be read and routed through IntentOS Operating Mode, but full native takeover still requires reviewed migration and reconciliation decisions.
- Release Plan remains a view, not a source of truth or permission to execute release actions.
- Existing-project rule comparison is limited by readable project files and cannot prove every rule was discovered.
- Strict digest checking applies to structured Release Plan evidence. Markdown-only historical records remain compatible unless strict mode is requested.
- 1.67.1 does not alter release provider commands, CI behavior, hook installation, or target-project write authorization.

## Validation

See [self-check-report.md](self-check-report.md).

## Verification

The patch is verified by:

- syntax checks for `scripts/check-release-plan.mjs`, `scripts/workflow-next.mjs`, and `scripts/start-project.mjs`;
- strict Release Plan checks for Web preview, mini-program review, backend API handoff, and governed existing-project examples;
- source Release Plan checks that reject the expanded unsafe fixture set;
- manifest drift checks;
- example verification through `npm --silent run verify:examples`;
- governance verification through `npm --silent run verify:governance`;
- full IntentOS verification through `node scripts/check-intentos.mjs`;
- WorkControl read-only `start` / `next` smoke checks showing IntentOS Operating Mode active and project asset migration adapter-only;
- whitespace and patch integrity check through `git diff --check`.
