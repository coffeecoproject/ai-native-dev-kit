# Existing Project Governance Convergence 1.70 Plan

## Purpose

1.70 should move existing-project adoption from "safe native adoption decision" to "governance convergence".

The goal is:

```text
Make old projects feel operationally close to new IntentOS projects,
while preserving historical evidence, project authority, production ownership,
and stricter existing rules.
```

This is not a plan to maximize migration, overwrite old governance, or make IntentOS the owner of production decisions. It is a plan to let Codex work in IntentOS mode by default and progressively converge workflow, baseline, audit, release, CI/hook, document, and task-state governance through comparison and approval.

## Context Reset

This plan must be executed from repository facts, not conversation memory.

Before implementation, Codex must re-read:

- `README.md`
- `README.zh-CN.md`
- `VERSION.md`
- `package.json`
- `intentos-manifest.json`
- `docs/for-existing-projects.md`
- `docs/existing-project-workflow-adapter.md`
- `docs/native-first-existing-project-migration.md`
- `docs/existing-rule-reconciliation.md`
- `docs/unified-apply-plan.md`
- `docs/controlled-apply-readiness.md`
- `docs/approval-record-governance.md`
- `docs/release-core-model.md`
- `docs/work-queue.md`
- `docs/document-lifecycle.md`
- `docs/plans/existing-project-native-adoption-decision-1.69-plan.md`
- `docs/plans/existing-project-native-adoption-evidence-hardening-1.69.1-plan.md`
- `scripts/workflow-next.mjs`
- `scripts/cli.mjs`
- `scripts/resolve-native-migration.mjs`
- `scripts/resolve-existing-rule-reconciliation.mjs`
- `scripts/resolve-release-plan.mjs`
- `scripts/check-intentos.mjs`

WorkControl and AiCoffeeCo observations may be used only as anonymized calibration evidence. They must not become hard-coded project rules.

## Current Baseline

1.69.1 already establishes:

- IntentOS Operating Mode can be active for old projects.
- Active operating mode does not grant write permission.
- `doctor` avoids old-project missing-asset flooding.
- `native-migration` and `reconcile-rules --auto-native` provide read-only migration and rule comparison.
- Omitted extracted rules block selected native adoption.
- Existing rules must be preserved, merged, replaced after approval, or blocked by authority.

1.70 should build on that by making the post-adoption target clearer:

```text
Old project daily workflow should converge toward new project workflow.
Old project rule authority must still be preserved and compared.
Old project history must not be rewritten.
```

## Problems To Solve

### Problem 1: Existing Projects Still Feel Different From New Projects

For new projects, the user experience is simple:

```text
goal -> platform/baseline -> plan -> execute -> verify -> review -> close
```

For old projects, the system currently stops earlier:

```text
read-only diagnosis -> native migration -> rule reconciliation -> apply plan later
```

That is safe, but it can feel like old projects never become first-class IntentOS projects.

1.70 should define how old projects converge toward the same daily working model as new projects.

### Problem 2: Workflow Convergence Is Not Explicit

Old projects may have:

- `AGENTS.md`
- old workflow text;
- CI workflows;
- hook scripts;
- release SOPs;
- engineering baselines;
- environment baselines;
- task notes;
- issue templates;
- undocumented team habits.

IntentOS must compare those assets to its own workflow model and decide which daily behaviors should become IntentOS-native.

### Problem 3: Audit Records Are Discontinuous

New projects can record evidence from day one.

Old projects have history before IntentOS:

- git history;
- release records;
- CI runs;
- rollback SOPs;
- old logs;
- old task records;
- existing docs.

1.70 must create an audit bridge:

```text
pre-IntentOS history remains historical evidence
adoption point becomes convergence anchor
post-adoption evidence follows IntentOS structure
```

It must not pretend old projects were always governed by IntentOS.

### Problem 4: Baseline And Release Rules Need "Best Available Rule" Selection

Old projects often already have stricter or more realistic rules than the generic IntentOS baseline.

1.70 should make Codex recommend:

- keep existing stricter rule;
- adopt IntentOS gap;
- merge after review;
- replace obsolete old workflow wording;
- block because human/project authority owns the decision.

The user should not need to judge low-level engineering details.

### Problem 5: AI Log Behavior Needs Boundaries

Old projects should not start writing `ai-logs` as a noisy operation log.

1.70 should define audit writing behavior:

- read-only diagnosis writes nothing;
- convergence plan can be written only after approval;
- `ai-logs` are for important decisions, retrospectives, and workflow improvements;
- normal task evidence should use the correct artifact type, not generic log spam.

## Scope

1.70 includes the design and implementation of an Existing Project Governance Convergence layer.

It should cover:

- workflow convergence;
- baseline convergence;
- release and production governance convergence;
- CI/hook convergence;
- audit record convergence;
- document/source-of-truth convergence;
- work queue / interrupted task convergence;
- AI log boundaries;
- user-facing convergence summary;
- examples, bad fixtures, and self-check coverage.

1.70 does not include:

- automatic target-project writes;
- automatic `.intentos` installation;
- automatic `AGENTS.md`, CI, hook, release SOP, baseline, or PR template replacement;
- automatic historical log import;
- automatic deletion, archive, or rewriting of old documents;
- production release execution;
- secret, DNS, payment, permission, migration, data, provider-state, legal, tax, finance, HR, security, privacy, or compliance approval;
- any WorkControl or AiCoffeeCo hardcoding.

## Desired User Experience

For a governed old project, the user can say:

```text
Use IntentOS for this project and make it work like a new IntentOS project where safe.
```

Codex should respond in plain language:

```text
IntentOS can operate here now.

Daily workflow can converge:
- task routing
- change impact coverage
- review surface
- work queue
- closure / finish decision

Rules that should stay project-owned:
- release / rollback SOP
- production CI / hooks / guard scripts
- business rules
- permission / data / compliance controls

Rules that can be merged after review:
- engineering baseline
- environment baseline
- document/source-of-truth map
- audit record structure

Not ready yet:
- 20 extracted rules were not reconciled
- release owner / rollback / monitoring evidence needs mapping

Can Codex write now: No
Next safe step: review convergence plan and approve a bounded apply plan.
```

The human should confirm:

- whether the goal is to converge daily workflow;
- whether Codex may prepare a reviewable apply plan;
- which human/project owners control production, release, data, permissions, and compliance;
- risk acceptance for approved changes.

The human should not be asked to decide whether a CI workflow is technically stricter than IntentOS. Codex should recommend that.

## Concept Model

### Governance Convergence Report

1.70 should introduce a Governance Convergence Report as a derived, read-only artifact.

Suggested directory:

```text
governance-convergence-reports/
```

Suggested template:

```text
templates/governance-convergence-report.md
```

Suggested docs:

```text
core/existing-project-governance-convergence.md
docs/existing-project-governance-convergence.md
checklists/governance-convergence-review.md
prompts/governance-convergence-agent.md
```

Suggested scripts:

```text
scripts/resolve-governance-convergence.mjs
scripts/check-governance-convergence.mjs
```

CLI exposure should avoid public command sprawl. Prefer one of:

```text
doctor / next summarize convergence state
```

and optionally a maintainer command:

```bash
node scripts/cli.mjs convergence <project>
node scripts/cli.mjs convergence-check <project>
```

The implementation should choose the least confusing public surface.

### Convergence Dimensions

The report should evaluate:

| Dimension | Goal |
| --- | --- |
| Workflow | Can daily task flow use IntentOS by default? |
| Baseline | Which engineering/environment/platform rules should be kept, merged, or adopted? |
| Audit | How does pre-IntentOS history map into post-adoption evidence? |
| Release | Which release/rollback/monitoring/SOP rules are project-owned? |
| CI / Hooks | Which guards are stricter, risky, obsolete, or merge candidates? |
| Documents | Which docs are source of truth, historical, stale, duplicate, or archive candidates? |
| Work Queue | How are interrupted tasks, long-running work, and old TODOs handled? |
| AI Logs | Which events merit `ai-logs`, and which should use specific artifacts instead? |
| Risk Authority | Which surfaces remain human/project/external-system owned? |

### Convergence States

Use summary states, not a new execution authority.

Allowed states:

- `CONVERGENCE_READY_FOR_PLAN`
- `CONVERGENCE_BLOCKED_BY_RULE_COVERAGE`
- `CONVERGENCE_BLOCKED_BY_PROJECT_AUTHORITY`
- `CONVERGENCE_BLOCKED_BY_DIRTY_WORKTREE`
- `CONVERGENCE_READ_ONLY_ONLY`
- `CONVERGENCE_PARTIAL`

These states are report summaries only. They must not drive writes by themselves.

### Recommendation Types

For each dimension and rule, use:

- `KEEP_EXISTING_STRICTER`
- `KEEP_PROJECT_OWNED`
- `ADOPT_INTENTOS_GAP_AFTER_REVIEW`
- `MERGE_AFTER_REVIEW`
- `REPLACE_OBSOLETE_WORKFLOW_AFTER_APPROVAL`
- `MAP_TO_INTENTOS_ARTIFACT`
- `BLOCKED_NEEDS_OWNER`
- `BLOCKED_BY_RULE_COVERAGE`
- `NO_ACTION`

### Audit Bridge

The audit bridge should define:

```text
historical_evidence:
  source: old project docs, git, CI, release records, SOPs
  status: historical, not rewritten

convergence_anchor:
  source: Governance Convergence Report
  status: adoption point

post_adoption_evidence:
  source: IntentOS artifacts
  status: structured going forward
```

Rules:

- Do not rewrite old history.
- Do not pretend old work used IntentOS.
- Do not import all old logs into `ai-logs`.
- From the convergence anchor onward, use IntentOS artifacts for new work.

### AI Log Boundary

`ai-logs` may be recommended only for:

- important governance decisions;
- workflow retrospectives;
- recurring drift findings;
- tool/workflow improvement evidence;
- project-level adoption notes after approval.

`ai-logs` should not be used for:

- every command run;
- every task step;
- normal test output;
- routine close-out;
- routine apply evidence;
- release approval evidence;
- production evidence.

Those belong in the specific artifact type:

- `native-migration-plans/`
- `existing-rule-reconciliations/`
- `apply-plans/`
- `approval-records/`
- `apply-readiness-reports/`
- `closure-decisions/`
- `release-plans/`
- `debt-handoff-reports/`

## Structured Evidence Shape

If strict evidence is added, the report should include:

```json
{
  "schema_version": "1.70.0",
  "artifact_type": "governance_convergence_report",
  "project_state": "EXISTING_GOVERNED_PROJECT",
  "intentos_operating_mode": "ACTIVE",
  "operating_mode_grants_write_permission": "No",
  "can_codex_write_now": "No",
  "convergence_state": "CONVERGENCE_BLOCKED_BY_RULE_COVERAGE",
  "source_systems": {
    "native_migration": "generated:native-migration",
    "existing_rule_reconciliation": "generated:existing-rule-reconciliation",
    "release_plan": "generated:release-plan",
    "workflow_next": "generated:workflow-next"
  },
  "dimensions": [
    {
      "dimension": "workflow",
      "current_state": "old workflow present",
      "target_state": "IntentOS daily workflow",
      "recommendation": "MERGE_AFTER_REVIEW",
      "human_decision_required": "Yes",
      "write_requires_apply_plan": "Yes"
    }
  ],
  "audit_bridge": {
    "historical_evidence_status": "preserve",
    "convergence_anchor_required": "Yes",
    "post_adoption_evidence_model": "IntentOS artifacts",
    "rewrite_history": "No"
  },
  "ai_log_policy": {
    "write_ai_logs_by_default": "No",
    "allowed_for_governance_decisions": "Yes",
    "routine_task_logging": "No"
  },
  "blocked": [
    "omitted extracted rules",
    "unclear release owner"
  ],
  "next_safe_step": "review convergence report before Unified Apply Plan",
  "boundary": {
    "writes_target_files": "No",
    "approves_governance_replacement": "No",
    "approves_release_or_production": "No",
    "modifies_ci_or_hooks": "No",
    "rewrites_history": "No"
  },
  "outcome": "BLOCKED"
}
```

## Execution Plan

### Phase 0: Context And Boundary Confirmation

Tasks:

1. Re-read 1.69 and 1.69.1 source files.
2. Confirm that 1.70 is convergence, not migration execution.
3. Confirm public UX should not require users to learn a new command.
4. Confirm private project observations stay calibration-only.

Acceptance:

- Plan states no target-project writes.
- Plan states no production authority transfer.
- Plan states no hardcoded WorkControl or AiCoffeeCo rules.

### Phase 1: Core Model And Docs

Tasks:

1. Add `core/existing-project-governance-convergence.md`.
2. Add `docs/existing-project-governance-convergence.md`.
3. Update `docs/for-existing-projects.md` with convergence language.
4. Add template, checklist, and prompt.
5. Define workflow, baseline, audit, release, CI/hook, document, work queue, AI log, and authority dimensions.

Acceptance:

- Docs clearly distinguish new project, old project current adoption, and old project converged operation.
- Docs say old projects can use IntentOS daily workflow after convergence planning.
- Docs do not claim old history is rewritten.
- Docs do not claim production authority moves to IntentOS.

### Phase 2: Resolver And Report

Tasks:

1. Add `scripts/resolve-governance-convergence.mjs`.
2. Read existing source systems:
   - `workflow-next`;
   - Native Migration;
   - Existing Rule Reconciliation;
   - Release Plan;
   - Document Lifecycle if available;
   - Work Queue if available.
3. Produce one read-only Governance Convergence Report.
4. Surface dimensions and recommendations.
5. Preserve `can_codex_write_now: No` by default.

Acceptance:

- Resolver writes nothing unless an explicit future write flag exists and is separately approved.
- Resolver can run on an existing governed project without requiring `.intentos`.
- Resolver uses `reconcile-rules --auto-native` behavior when no written reconciliation exists.
- Omitted extracted rules produce convergence block.
- Dirty worktree produces convergence block.

### Phase 3: Checker And Schema

Tasks:

1. Add `scripts/check-governance-convergence.mjs`.
2. Optionally add `schemas/artifacts/governance-convergence.schema.json`.
3. Validate required sections:
   - Human Summary;
   - Source Systems;
   - Convergence Dimensions;
   - Audit Bridge;
   - AI Log Policy;
   - Protected Authority;
   - Proposed Next Step;
   - Boundaries;
   - Outcome;
   - Machine-Readable Evidence.
4. Reject unsafe claims.

Acceptance:

- Checker rejects target-file write approval.
- Checker rejects release/production approval.
- Checker rejects CI/hook mutation approval.
- Checker rejects history rewrite.
- Checker rejects `ai-logs` as routine command log.
- Checker rejects selected convergence when omitted rules exist.

### Phase 4: CLI / UX Integration

Tasks:

1. Decide whether to expose a maintainer command:
   - `convergence`;
   - `convergence-check`;
   - or integrate summary into `doctor` / `next` only.
2. Keep public user path simple:

```bash
node scripts/cli.mjs start <project>
node scripts/cli.mjs next <project>
node scripts/cli.mjs doctor <project>
```

3. If a command is added, document it as maintainer evidence, not required user knowledge.

Acceptance:

- User does not need to choose internal workflow commands.
- Old-project `doctor` can point to governance convergence without missing-asset flooding.
- CLI help does not imply write permission.

### Phase 5: Examples And Bad Fixtures

Positive examples:

```text
examples/1.70-existing-project-governance-convergence/governed-web-admin/
examples/1.70-existing-project-governance-convergence/production-multiplatform/
examples/1.70-existing-project-governance-convergence/dirty-worktree-blocked/
```

Bad fixtures:

```text
bad-governance-convergence-writes-target-files
bad-governance-convergence-rewrites-history
bad-governance-convergence-replaces-release-sop
bad-governance-convergence-mutates-ci-hooks
bad-governance-convergence-ai-log-spam
bad-governance-convergence-ignores-omitted-rules
bad-governance-convergence-claims-production-approval
bad-governance-convergence-maximizes-migration
```

Acceptance:

- Positive examples pass.
- Bad fixtures fail for the intended reason.
- No private project files are copied into examples.

### Phase 6: Generated Project / Manifest / Self-Check

Tasks:

1. Register new source files in `intentos-manifest.json`.
2. Add generated-project asset coverage only if the report is intended to be copied into projects.
3. Update `scripts/check-intentos.mjs`.
4. Add release evidence under `releases/1.70.0/`.
5. Update version metadata only during implementation.

Acceptance:

- Manifest passes.
- Generated project checks pass.
- Full `node scripts/check-intentos.mjs` passes.
- `npm --silent run verify:governance` passes if CLI integration touches governance scripts.

## Goal + Subagent Execution Model

When implementation starts, use one main goal:

```text
Implement 1.70 Existing Project Governance Convergence without granting target-project write authority.
```

Recommended work split:

| Role | Scope | Notes |
| --- | --- | --- |
| Main agent | architecture, integration, final review, release evidence | Owns final consistency |
| Subagent A | docs/template/checklist/schema review | Read/write only assigned docs if implementation is approved |
| Subagent B | resolver/checker examples/bad fixtures | Read/write only assigned scripts/examples if implementation is approved |

Subagent rules:

- Use subagents only after implementation starts.
- Do not let subagents touch the same files.
- Close subagents after results are integrated.
- Main agent must run final verification.

## Acceptance Plan

Minimum implementation verification:

- `node --check scripts/resolve-governance-convergence.mjs`
- `node --check scripts/check-governance-convergence.mjs`
- `node --check scripts/cli.mjs` if CLI changes are made
- `node scripts/check-governance-convergence.mjs examples/1.70-existing-project-governance-convergence/governed-web-admin --require-structured-evidence`
- `node scripts/check-governance-convergence.mjs examples/1.70-existing-project-governance-convergence/production-multiplatform --require-structured-evidence`
- `node scripts/check-governance-convergence.mjs test-fixtures/bad/bad-governance-convergence-writes-target-files`
- `node scripts/check-governance-convergence.mjs test-fixtures/bad/bad-governance-convergence-rewrites-history`
- `node scripts/check-governance-convergence.mjs test-fixtures/bad/bad-governance-convergence-replaces-release-sop`
- `node scripts/check-governance-convergence.mjs test-fixtures/bad/bad-governance-convergence-mutates-ci-hooks`
- `node scripts/check-governance-convergence.mjs test-fixtures/bad/bad-governance-convergence-ai-log-spam`
- `node scripts/check-governance-convergence.mjs test-fixtures/bad/bad-governance-convergence-ignores-omitted-rules`
- `node scripts/check-manifest.mjs`
- `npm --silent run verify:governance`
- `node scripts/check-intentos.mjs`
- `git diff --check`

Optional private calibration after public checks:

- WorkControl read-only convergence smoke.
- AiCoffeeCo read-only convergence smoke.

Private calibration acceptance:

- no project files are changed;
- `git status` remains unchanged;
- no hardcoded project-specific rules are introduced;
- output matches the 1.70 convergence model.

## Review Checklist

- [ ] Old projects can operate under IntentOS daily workflow after convergence planning.
- [ ] Active IntentOS Operating Mode still does not grant write permission.
- [ ] Existing stricter project rules are preserved.
- [ ] IntentOS gaps are adopted only after review.
- [ ] Obsolete old workflow wording can be replaced only after approval.
- [ ] Audit bridge preserves history and starts structured evidence at convergence anchor.
- [ ] `ai-logs` are not used as routine operation logs.
- [ ] Release, production, CI, hooks, secrets, migrations, data, payment, permissions, provider state, legal, tax, finance, HR, security, privacy, and compliance remain protected.
- [ ] Dirty worktrees block convergence writes.
- [ ] Omitted extracted rules block convergence readiness.
- [ ] Public UX remains simple.
- [ ] No private project rules are hard-coded.

## Expected End State

After 1.70, a mature old-project adoption path should look like:

```text
start / next / doctor
-> IntentOS Operating Mode active
-> Native Migration and Existing Rule Reconciliation
-> Governance Convergence Report
-> Unified Apply Plan
-> Approval Record
-> Controlled Apply Readiness
-> bounded project asset changes
-> new work follows IntentOS daily workflow
```

The user-facing result:

```text
Old projects still keep their history and production authority,
but daily AI collaboration becomes close to a new IntentOS project.
```

## Non-Negotiable Boundaries

- Convergence is not automatic migration.
- Convergence is not governance replacement.
- Convergence is not production release approval.
- Convergence is not CI/hook mutation.
- Convergence is not history rewrite.
- Convergence is not routine `ai-log` generation.
- Convergence is not permission for Codex to write target files.

## Open Questions For Review

1. Should 1.70 expose a new maintainer command, or should convergence remain summarized through `doctor` / `next`?
2. Should Governance Convergence Reports be copied into generated projects by default, or only available in the IntentOS source?
3. Should strict structured evidence be required immediately, or optional for one release like earlier evidence transitions?
4. Should the audit bridge be a section inside Governance Convergence Report, or a separate artifact later?
5. Should private WorkControl / AiCoffeeCo calibration be recorded as anonymized evidence in source releases, or kept only in conversation/review notes?
