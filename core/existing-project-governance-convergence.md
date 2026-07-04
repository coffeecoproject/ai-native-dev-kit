# Existing Project Governance Convergence

Existing Project Governance Convergence is the read-only layer that explains
how an old project can work under IntentOS day to day without pretending its
history, production authority, release rules, CI, hooks, or stricter project
rules belong to IntentOS.

It exists for old projects that should feel operationally close to new
IntentOS projects:

```text
goal -> plan -> execute -> verify -> review -> finish
```

but still need project-owned rule comparison before any governance asset is
changed.

## Core Rule

IntentOS Operating Mode can be active immediately.

That means Codex may use IntentOS to route work, classify risk, compare rules,
prepare plans, review changes, and close tasks.

It does not mean Codex can write project assets.

## Governance Convergence Report

A Governance Convergence Report is a derived read-only artifact. It summarizes
Native Migration, Existing Rule Reconciliation, Release Plan, workflow routing,
document lifecycle, work queue, and project authority into one user-readable
convergence view.

It is not a migration plan, apply plan, approval record, release decision, or
history rewrite.

Required dimensions:

- Workflow
- Baseline
- Audit
- Release
- CI / Hooks
- Documents
- Work Queue
- AI Logs
- Risk Authority

Allowed recommendation types:

- `KEEP_EXISTING_STRICTER`
- `KEEP_PROJECT_OWNED`
- `ADOPT_INTENTOS_GAP_AFTER_REVIEW`
- `MERGE_AFTER_REVIEW`
- `REPLACE_OBSOLETE_WORKFLOW_AFTER_APPROVAL`
- `MAP_TO_INTENTOS_ARTIFACT`
- `BLOCKED_NEEDS_OWNER`
- `BLOCKED_BY_RULE_COVERAGE`
- `NO_ACTION`

Allowed convergence states:

- `CONVERGENCE_READY_FOR_PLAN`
- `CONVERGENCE_BLOCKED_BY_RULE_COVERAGE`
- `CONVERGENCE_BLOCKED_BY_PROJECT_AUTHORITY`
- `CONVERGENCE_BLOCKED_BY_DIRTY_WORKTREE`
- `CONVERGENCE_BLOCKED_BY_UPSTREAM_EVIDENCE`
- `CONVERGENCE_READ_ONLY_ONLY`
- `CONVERGENCE_PARTIAL`

These are summary states only. They must not drive writes by themselves.

## Evidence Consistency

The human-readable summary, Markdown convergence dimension table, structured
machine-readable evidence, and outcome must match. A report is not valid if one
layer says the project is ready while another layer says it is blocked.

The source-system evidence must record `workflow_next`, `native_migration`,
`existing_rule_reconciliation`, and `release_plan` with status, ref, and
contribution. If any source system is `BLOCKED` or `NEEDS_INPUT`, convergence
must record that upstream input requirement and must not claim ready or partial
convergence.

## Audit Bridge

Old projects have real evidence that predates IntentOS. Convergence must bridge
that evidence instead of rewriting it.

```text
historical evidence -> convergence anchor -> post-adoption IntentOS artifacts
```

Rules:

- Do not rewrite old history.
- Do not claim old work used IntentOS.
- Do not import every old log into `ai-logs`.
- After the convergence anchor, use IntentOS artifacts for new work.

## AI Log Boundary

`ai-logs` may be recommended for important governance decisions, retrospectives,
recurring drift findings, workflow improvements, and approved project-level
adoption notes.

`ai-logs` must not be used for every command, every task step, routine test
output, routine close-out, routine apply evidence, release approval evidence,
or production evidence.

Routine evidence belongs in the specific artifact type:

- `native-migration-plans/`
- `existing-rule-reconciliations/`
- `governance-convergence-reports/`
- `apply-plans/`
- `approval-records/`
- `apply-readiness-reports/`
- `closure-decisions/`
- `release-plans/`
- `debt-handoff-reports/`

## Protected Authority

The report must preserve project or human authority for release, production,
CI, hooks, secrets, migrations, data, payment, permissions, provider state,
legal, tax, finance, HR, security, privacy, compliance, and business rules.

If existing project rules are stricter than IntentOS defaults, keep the stricter
project rule.

## Write Path

Convergence can recommend a next step, but writes require the existing apply
chain:

```text
Governance Convergence Report
-> Unified Apply Plan
-> Approval Record
-> Controlled Apply Readiness
-> bounded project asset changes
```

The convergence report itself never authorizes target-project writes.
