# Existing Project Native Adoption Decision 1.69 Plan

## Purpose

1.69 turns existing-project adoption from "adapter-only diagnosis" into an AI-assisted native adoption decision.

The goal is not to maximize migration, overwrite old governance, or ask non-technical users to judge technical rules. The goal is:

```text
Let Codex work under IntentOS by default for an existing project,
while AI recommends the safest native adoption path,
and humans only confirm goal, authority, and risk acceptance.
```

## Context Reset

This plan must be executed from repository facts, not conversation memory.

Before implementation, Codex must re-read:

- `VERSION.md`
- `package.json`
- `intentos-manifest.json`
- `scripts/cli.mjs`
- `scripts/workflow-next.mjs`
- `scripts/resolve-native-migration.mjs`
- `scripts/resolve-existing-rule-reconciliation.mjs`
- `scripts/check-intentos.mjs`
- current release records under `releases/`

WorkControl observations may be used only as calibration evidence. They must not become hard-coded project rules.

## Problems To Solve

### Problem 1: Users Cannot Judge Technical Migration Details

Current old-project flow asks humans to confirm decisions, but many decisions are technical:

- whether existing CI is stricter than IntentOS guidance;
- whether a release SOP should be preserved;
- whether an engineering baseline should be merged;
- whether old workflow text should be replaced;
- whether a hook or guard script should be mapped, preserved, or left alone.

1.69 must make AI provide the professional recommendation first.

The human should confirm:

- target goal;
- authority to write reports or plans;
- whether to continue under the AI-recommended migration path;
- high-risk ownership and risk acceptance.

The human should not be asked to perform the technical comparison.

### Problem 2: Existing Projects Should Not Stay Adapter-Only Forever

For old projects, IntentOS must not be treated as permanent sidecar guidance.

Expected posture:

```text
IntentOS Operating Mode = active for Codex work
Project asset migration = plan-first and evidence-bound
Existing rules = compared and either preserved, merged, replaced, or marked as protected
```

The migration target is native IntentOS operation without breaking the project.

### Problem 3: `doctor` Is Too Noisy For Old Projects

When `workflow-next` detects:

```text
ADOPTION_MODE=READ_ONLY
INTENTOS_OPERATING_MODE=ACTIVE
PROJECT_ASSET_MIGRATION_DEPTH=ADAPTER_ONLY
EXISTING_RULE_COMPARISON_REQUIRED=yes
```

`doctor` should not continue into full missing-asset checks and emit a large list of missing `.intentos` files.

Expected behavior:

```text
doctor -> adoption diagnosis only
doctor -> explain old-project native adoption path
doctor -> exit 0 unless the diagnosis command itself fails
```

It may still expose exact asset gaps in advanced checks, but the public `doctor` entry should not make old projects look broken.

### Problem 4: `reconcile-rules` Requires A Written Native Migration Plan

Current `reconcile-rules` reads `native-migration-plans/` from the target project. In pure read-only simulation, `native-migration` can generate useful output, but `reconcile-rules` cannot consume it unless the report is written first.

1.69 should support a continuous read-only path:

```text
reconcile-rules --auto-native
```

or equivalent behavior where the resolver can internally generate a temporary native migration report for reconciliation without writing target files.

## Scope

1.69 includes:

- AI-assisted native adoption recommendation for old projects.
- `doctor` old-project mode calibration.
- read-only continuous reconciliation using generated native migration input.
- concise user-facing adoption decision output.
- fixtures / self-check coverage for governed existing projects.
- release evidence for 1.69.0.

1.69 does not include:

- npm publication;
- installer or global CLI packaging;
- GitHub Release publication;
- automatic write/apply runner;
- automatic `.intentos` installation into governed projects;
- automatic AGENTS / CI / hook / PR template replacement;
- production release execution;
- any project-specific WorkControl hardcoding.

## Desired User Experience

For an old governed project, user says:

```text
Use IntentOS for this project.
```

Codex should respond with a plain decision:

```text
AI recommendation: SELECTED_NATIVE_ADOPTION

Recommended migration depth:
DOCS_BRIDGE -> SELECTED_ASSETS

Keep as project authority:
- release / rollback SOP
- production CI / hooks / guard scripts
- business rules
- permissions / data / compliance controls

Merge after review:
- engineering baseline
- environment baseline

Let IntentOS take over:
- task routing
- change boundary
- review loop
- closure / finish decision
- patch classification
- work queue / drift control

Can Codex write now: No
Next safe step: generate a reviewable apply plan.
```

The human decision should be:

```text
Do you allow Codex to prepare the apply plan for the recommended migration path?
```

not:

```text
Please decide whether CI is stricter than IntentOS.
```

## Technical Design

### A. Native Adoption Decision Model

Add a derived decision object to the existing reconciliation output.

The object should be recommendation-only:

```json
{
  "native_adoption_decision": {
    "recommendation": "SELECTED_NATIVE_ADOPTION",
    "migration_depth": "DOCS_BRIDGE_THEN_SELECTED_ASSETS",
    "confidence": "MEDIUM",
    "can_codex_write_now": "No",
    "default_path": "prepare apply plan after review",
    "preserve": ["release", "production", "business", "permissions"],
    "merge": ["engineering baseline", "environment baseline"],
    "replace": ["old AI workflow routing"],
    "blocked": ["production execution", "secrets", "CI/hook mutation without approval"]
  }
}
```

Allowed recommendations:

- `READ_ONLY_DIAGNOSIS`
- `DOCS_BRIDGE`
- `SELECTED_NATIVE_ADOPTION`
- `BLOCKED_NEEDS_OWNER`
- `BLOCKED_BY_DIRTY_WORKTREE`

The decision must not authorize writes.

### B. AI Recommendation Rules

Default recommendation logic:

- Dirty worktree -> `BLOCKED_BY_DIRTY_WORKTREE`
- Production or governed project with known release/CI/baseline assets -> `SELECTED_NATIVE_ADOPTION`
- Governed but low production signal -> `DOCS_BRIDGE`
- Light existing project -> `SELECTED_NATIVE_ADOPTION`
- Unknown authority -> `BLOCKED_NEEDS_OWNER`

Recommendation must include:

- what to preserve;
- what to merge;
- what to replace;
- what is blocked;
- why this is safer than full overwrite;
- what human is confirming.

### C. `doctor` Old-Project Mode

Update `doctor` in `scripts/cli.mjs`:

1. Run `workflow-next`.
2. If `workflow-next` identifies read-only adapter/native adoption mode for old project:
   - do not run `check-ai-workflow`;
   - print or rely on `workflow-next` output;
   - exit 0.
3. For bootstrapped projects and intentos source, retain existing checks.

The detection may use `workflow-next --json` internally or a lightweight helper.

### D. `reconcile-rules --auto-native`

Update `scripts/resolve-existing-rule-reconciliation.mjs`:

- accept `--auto-native`;
- when no recorded native migration plans exist, internally call native migration builder or shared extraction logic;
- do not write files;
- mark input evidence as `generated:native-migration`;
- produce reconciliation items from generated rules;
- include the Native Adoption Decision model.

Implementation should avoid shelling out if practical. Prefer exported functions or shared logic only if low-risk; otherwise use a controlled internal child process and parse JSON.

### E. CLI Help

Update command help so users can discover:

```text
reconcile-rules <project> --auto-native
doctor <project>
```

Plain-language docs should say old projects can start using IntentOS mode before project assets are migrated.

## Acceptance Plan

### Static Checks

- `node --check scripts/cli.mjs`
- `node --check scripts/resolve-existing-rule-reconciliation.mjs`
- `node --check scripts/resolve-native-migration.mjs`
- `node --check scripts/check-intentos.mjs`

### Behavior Checks

Create or use fixture coverage where possible.

Required cases:

1. Existing governed project:
   - `workflow-next` reports `INTENTOS_OPERATING_MODE=ACTIVE`
   - `CAN_WRITE_WORKFLOW_ASSETS=no`
   - `EXISTING_RULE_COMPARISON_REQUIRED=yes`

2. `doctor` on existing governed project:
   - exits 0;
   - does not emit a long missing asset failure list;
   - recommends native migration / rule reconciliation path.

3. `reconcile-rules --auto-native`:
   - does not require `native-migration-plans/`;
   - produces reconciliation items from generated native migration input;
   - includes a native adoption decision;
   - does not write target files.

4. Dirty project:
   - remains blocked before migration or execution;
   - does not recommend selected native adoption until dirty ownership is resolved.

5. WorkControl-style governed project calibration:
   - release / rollback / CI / guard scripts are preserved or kept as stricter;
   - engineering/environment baselines are merge candidates;
   - old workflow routing can be replaced only after apply plan and approval.

### Full Verification

- `node scripts/check-manifest.mjs`
- `node scripts/check-intentos.mjs`
- `npm --silent run verify:governance`
- `git diff --check`

### Manual Read-Only Calibration

Run, without writing target files:

```bash
node scripts/cli.mjs next /Users/liushan/Developer/WorkControl
node scripts/cli.mjs doctor /Users/liushan/Developer/WorkControl
node scripts/cli.mjs reconcile-rules /Users/liushan/Developer/WorkControl --auto-native
node scripts/cli.mjs release-plan /Users/liushan/Developer/WorkControl --intent "continue existing project under IntentOS"
```

Expected:

- WorkControl remains unmodified.
- `doctor` no longer emits missing `.intentos` asset failures as the public old-project diagnosis.
- `reconcile-rules --auto-native` gives a real recommendation without requiring a written native migration plan.

## Release Evidence

Add:

- `releases/1.69.0/release-record.md`
- `releases/1.69.0/known-limitations.md`
- `releases/1.69.0/self-check-report.md`

Update:

- `VERSION.md`
- `package.json`
- `intentos-manifest.json`
- `templates/version-record.md`
- `templates/workflow-version.json`
- public docs / README only where needed.

## Success Criteria

1. Old projects are not treated as broken because IntentOS assets are missing.
2. Codex can work under IntentOS mode immediately for planning and review.
3. AI provides the migration recommendation; humans confirm authorization and risk.
4. Rule comparison can run in one read-only flow.
5. No project-specific behavior is hardcoded.
6. No new write authority, release authority, CI authority, hook authority, or production authority is introduced.
