# For Existing Projects

IntentOS is useful for old projects, but it should not be copied in as a parallel governance system.

The correct posture is:

```text
Codex works under IntentOS immediately.
Project assets change only after comparison and approval.
```

## What This Means

Codex may use IntentOS to:

- understand the project state;
- route tasks;
- classify risks;
- review changes;
- compare rules;
- prepare migration and apply plans;
- produce evidence and close-out records.

Codex must not automatically replace:

- `AGENTS.md`;
- CI workflows;
- hooks;
- baseline docs;
- release SOPs;
- rollback procedures;
- production config;
- guard scripts;
- business rules;
- secrets.

## First Commands

```bash
node scripts/cli.mjs start <project>
node scripts/cli.mjs next <project>
```

If the project is governed, dirty, already online, or production-sensitive, these commands should keep writes blocked and recommend migration or reconciliation work.

## Rule Comparison

Existing project rules must be compared before migration.

IntentOS should recommend one of these postures:

- keep the existing rule;
- keep the existing rule because it is stricter or production-proven;
- adopt an IntentOS gap after review;
- merge after review;
- ask for a human decision;
- block because project authority owns the decision.

## Native Migration

Use Native Migration when the project should move from adapter-style reading into IntentOS-native working mode:

```bash
node scripts/cli.mjs native-migration <project>
node scripts/cli.mjs reconcile-rules <project>
```

These are still plan and comparison steps. They do not write target files by themselves.

## When Writes Become Possible

Project asset changes require:

1. Native Migration Plan;
2. Existing Rule Reconciliation;
3. Unified Apply Plan;
4. explicit human approval;
5. Controlled Apply Readiness.

Until then, IntentOS Operating Mode is active for work guidance only.
