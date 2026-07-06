# User Delivery Console

User Delivery Console is the ordinary-user status card for IntentOS.

Use it when the user asks:

- "现在做到哪了？"
- "这个任务完成了吗？"
- "还差什么？"
- "能上线了吗？"
- "下一步你能做什么？"

Run:

```bash
node scripts/cli.mjs status <project> --intent "<what the user wants>"
node scripts/cli.mjs status-check <project>
```

The command is read-only by default. It does not ask the user for internal
artifact references.

## What It Shows

The card summarizes:

1. first version;
2. current state;
3. task completion;
4. product readiness;
5. launch readiness;
6. missing items;
7. safe next action.

## What It Does Not Do

It does not approve implementation, commit, push, release, production,
deployment, CI, hooks, secrets, migrations, payment, permissions, compliance, or
security decisions.

It does not prove real users can use the product.

## How It Uses Existing Evidence

The console reads or summarizes existing IntentOS source systems, then explains
them in plain language. The technical trace can mention the source systems, but
the user-facing summary should remain simple.

If the card says a task can be treated as done, that must be backed by valid
lower-level completion evidence. Otherwise it must say what is still missing.
