# Execution Assurance Chain

Execution Assurance Chain answers one plain question:

```text
Did this execution actually finish, and can Codex safely say it is done?
```

It is for execution-class work:

- feature work;
- bug fixes;
- safe small patches;
- existing-project IntentOS adoption;
- baseline setup;
- document governance;
- release preparation;
- IntentOS workflow capability changes.

## How To Use

Generate a read-only view:

```bash
node scripts/cli.mjs execution-assurance . --intent "add contract number validation"
```

Save a task-bound report when Codex wants to later claim completion:

```bash
node scripts/cli.mjs execution-assurance . \
  --intent "add contract number validation" \
  --out execution-assurance-reports/001-contract-number.md
```

Check recorded reports:

```bash
node scripts/cli.mjs execution-assurance-check .
```

If no recorded report exists, the checker fails by default. Maintainers may use `--allow-empty` only for asset-only checks, not as proof that execution work is done.

For strict evidence:

```bash
node scripts/check-execution-assurance.mjs . \
  --require-structured-evidence \
  --require-evidence-refs \
  --require-review \
  --require-actual-diff \
  --require-precise-evidence
```

## What It Checks

Execution Assurance checks:

- what the user asked for;
- what "done" means;
- which surfaces were planned;
- whether actual diff matches the plan;
- whether evidence resolves;
- whether review happened;
- whether the work smells like a narrow patch that hides a bigger issue;
- whether source systems agree.

## Strict Binding Vocabulary

1.74.0 introduced strict binding for Execution Assurance reports, 1.74.1
syncs the public docs and schema vocabulary with the resolver output, and
1.74.2 binds completion to a resolvable execution plan reference. 1.74.3
cross-checks human-readable Markdown binding tables against the
machine-readable JSON evidence.

Key fields:

- `source_system_ref`: the source report, card, or system being relied on.
- `source_task_ref`: the task identity inside that source system.
- `source_outcome`: the source system's recorded result.
- `current_task_match`: whether that source task matches the current task.
- `report_digest`: a digest of the source report when a source report is
  referenced.
- `evidence_digest`: a digest of bound evidence when evidence identity matters.
- `planned_target_paths`: explicit paths or directory globs ending in `/**`
  that the task was allowed to change.
- `execution_plan.plan_ref`: the reviewed task plan, apply candidate, or
  checker record used as the task plan source.
- `target_diff_status: REQUIRES_EXPLICIT_EXECUTION_PLAN`: the resolver saw
  changed files but cannot treat them as planned work without an explicit
  execution plan.
- `Execution Plan Binding`, `Actual Diff Binding`, `Pre-Write Revalidation`, and `Evidence Binding`
  Markdown tables: human-readable views that must match the JSON
  `execution_plan`, `actual_diff`, `pre_write_revalidation`, and
  `evidence_bindings` records. JSON remains the authority. The revalidation
  record replays the immutable Planning Closure source revision, exact
  candidate base, planned target-set digest, and observed changed-path digest;
  a bare `requires_pre_write_revalidation: Yes` declaration is not proof.

In precise mode, `VERIFIED_DONE` requires current-task source matches, concrete
evidence, a resolvable `execution_plan.plan_ref`, and actual changed files
inside the reviewed plan. Plan refs must resolve to `file:`, `artifact:`, or a
known `checker:` record; declarative refs such as `review:`, `command:`,
`generated:`, or `git-diff:` can help explain a run, but they are not enough by
themselves as precise completion evidence.

From 1.78.2, Execution Assurance reports expose a top-level `intent_digest`.
Completion Evidence uses that digest to check Execution Assurance against the
same task intent, so a stale or task-mismatched assurance report cannot support
a final completion claim.

From 1.85.0, strict task-consumer mode also checks `task_entry_binding`.
Execution Assurance can only support a completion claim when it is bound to the
current Work Queue item and the matching Task Governance report. This prevents
execution evidence from bypassing a `POSSIBLE_HIGH`, stale queue item, or
missing tier-specific verification.

```bash
node scripts/check-execution-assurance.mjs . \
  --require-task-governance \
  --require-work-queue \
  --strict-task-consumer
```

From 1.88.2, strict plan-review consumer mode checks `plan_review_binding`.
Use `--require-plan-review` when the task required Plan Review Gate before
implementation. In that mode, Execution Assurance cannot claim `VERIFIED_DONE`
unless the referenced Plan Review report is `PLAN_REVIEW_PASSED`, task-bound,
digest-bound, and non-authorizing.

If `execution_plan.approval_refs` are present in strict completion, each ref
must be bounded and use a supported prefix. Approval refs document the approval
source; they do not become blanket approval for extra files, release, commit,
push, production, secrets, migrations, or provider actions.

## What It Does Not Do

It does not:

- write target files;
- approve implementation beyond recorded scope;
- approve commit or push;
- approve release or production;
- replace Change Impact Coverage, Execution Closure, Adoption Assurance, Release Plan, or Approval Record;
- prove product correctness.

## User Result

The user should see:

```text
This is complete / not complete.
What was verified.
What is missing.
What Codex can safely do next.
What needs human decision.
```

The user should not need to choose internal checkers.
