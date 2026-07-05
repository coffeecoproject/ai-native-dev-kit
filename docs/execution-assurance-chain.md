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

1.74.0 introduced strict binding for Execution Assurance reports, and 1.74.1
syncs the public docs and schema vocabulary with the resolver output.

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
- `target_diff_status: REQUIRES_EXPLICIT_EXECUTION_PLAN`: the resolver saw
  changed files but cannot treat them as planned work without an explicit
  execution plan.

In precise mode, `VERIFIED_DONE` requires current-task source matches, concrete
evidence, and actual changed files inside the reviewed plan. Declarative refs
such as `review:`, `command:`, `generated:`, or `git-diff:` can help explain a
run, but they are not enough by themselves as precise completion evidence.

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
