# Approval Record Governance

Approval Record Governance is the step after Controlled Apply Readiness.

In plain language:

```text
The plan looks ready. What exactly did the human approve?
```

It still does not write files.

## When To Use

Use it when the user says things like:

```text
我批准 A001 和 A002。
```

or:

```text
这份计划可以执行，但只限这些文件。
```

Codex should record the decision as an Approval Record, check it, and stop before any future apply step.

## What Codex Should Do

Codex should capture:

- who approved;
- which apply plan was approved;
- the plan hash;
- exact approved action IDs;
- exact target paths;
- expiry;
- rollback acknowledgement;
- verification acknowledgement;
- what is not approved.

## What Codex Must Not Do

Approval Record Governance must not:

- write files;
- apply the plan;
- treat approval as release approval;
- treat approval as production approval;
- approve hooks or CI changes;
- approve migrations, secrets, payments, legal, privacy, security, or compliance changes;
- accept Codex, AI, reviewer, or subagent output as human approval;
- accept `all actions` or `entire repo` as valid scope.

## Commands

For maintainer evidence:

```bash
node scripts/cli.mjs approval-record-check .
node scripts/new-workflow-item.mjs --type approval-record --name workflow-assets
```

For ordinary users, Codex should not require these commands. Codex can record the approval details and explain the result.

## Relationship To Earlier Steps

Unified Apply Plan answers:

```text
What would change?
```

Controlled Apply Readiness answers:

```text
Is the plan eligible for a human-approved apply step?
```

Approval Record answers:

```text
What exactly did the human approve?
```

None of these steps is an executor.
