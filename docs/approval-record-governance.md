# Approval Record Governance

Approval Record Governance is the step after Controlled Apply Readiness.

In plain language:

```text
The plan looks ready. Which exact low-risk actions are already covered by the user's request?
```

It still does not write files.

## When To Use

For a zero-experience solo developer, the normal input is the original request:

```text
把 IntentOS 接入这个项目，你自己按规范处理。
```

or:

```text
增加预约取消功能，并把前后端和测试完整处理好。
```

Codex converts that request into an exact bounded plan, records
`CURRENT_CONVERSATION_USER`, checks the evidence, and continues only when every
action is reversible, low-risk, project-local, and inside the original request.
The user is not asked to inspect action IDs or technical paths.

## What Codex Should Do

Codex should capture:

- that the current conversation user supplied the explicit request;
- which apply plan was approved;
- the plan hash;
- exact approved action IDs;
- exact target paths;
- expiry;
- rollback acknowledgement;
- verification acknowledgement;
- what is not approved.

The target paths must be exact relative paths. Wildcards, parent directory traversal, absolute paths, backslashes, and symlink aliases are not valid approval scope.

The human approval statement must match the approved action IDs in the action table. Expired approvals or records where the plan changed after approval need fresh approval.

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
- accept ambiguous owners like `someone`, `owner`, or `team`;
- accept wildcard, symlink, absolute, or parent-traversal paths;
- keep using approval after it expires or after the plan changes.

## Commands

For maintainer evidence:

```bash
node scripts/cli.mjs approval-record-check .
node scripts/new-workflow-item.mjs --type approval-record --name workflow-assets
```

For ordinary users, Codex must not require these commands, action IDs, hashes,
or target-path review. Codex records and checks them internally.

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
Which exact low-risk actions are covered by the user's explicit request?
```

None of these steps is an executor.
