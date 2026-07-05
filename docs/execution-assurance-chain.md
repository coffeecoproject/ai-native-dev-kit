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

Check recorded reports:

```bash
node scripts/cli.mjs execution-assurance-check .
```

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
