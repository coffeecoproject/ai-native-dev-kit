# Controlled Native Adoption Review

Use `adopt-review` after `adopt` when an existing project needs a professional
recommendation about how deeply IntentOS should be adopted.

The command is read-only:

```bash
node scripts/cli.mjs adopt-review <existing-project> --intent "review deeper IntentOS adoption"
```

It can recommend:

- keep the current safe partial working mode;
- repair governance first;
- prepare a plan-only deeper adoption proposal;
- stop until owner, production, data, or unsafe state is resolved.

It cannot:

- install `.intentos/`;
- change `AGENTS.md`;
- change CI, hooks, release, DB, API, Web, Docker, production, secrets,
  payment, data, or external systems;
- approve implementation or release;
- claim full adoption from a recommendation.

The user should only see simple decisions such as whether to accept the
recommendation or let Codex prepare a plan. Technical source systems remain in
the trace for review.
