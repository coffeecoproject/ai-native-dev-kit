# Execution And Release Runtime Hygiene

This is the part of IntentOS that handles "the code may be done, but delivery is
blocked by Git, local checks, CI, artifact storage, bundle size, or release
state."

Plain meaning:

```text
Codex should explain what is blocking delivery, keep the task open, and choose
the safest next step. It should not ask the user to understand Git or CI details.
```

Use it when:

- a branch looks dirty or carries old commits;
- push fails because a project gate failed;
- CI fails and the reason is unclear;
- release preflight fails;
- artifact quota blocks upload;
- a release bundle includes evidence archives or other non-runtime files.

It produces a Runtime Hygiene Report.

In strict use, the report also records:

- which task it belongs to;
- the Work Queue and Task Governance references when available;
- the source of the blocker, such as gate output, CI log, artifact error,
  bundle summary, or release event;
- whether a CI environment retry is allowed by project policy and whether
  production side effects were checked.

The report does not approve:

- implementation;
- commit or push;
- release or production;
- force push;
- gate bypass;
- artifact deletion;
- evidence deletion.

Good output should sound like:

```text
The code is not ready to push. The project blocked it because a local gate
failed. I need to repair that gate inside the current task and rerun the check.
```

For release storage issues:

```text
The release has not touched production. Storage for build bundles is full.
Cleanup is irreversible, so old bundle deletion needs approval while release
evidence stays preserved.
```

Technical details can be recorded in the report, but the first user-facing
answer should stay plain.

If a CI failure is environmental, Codex should not say it can simply retry
unless the report proves both the retry policy and production safety. If either
is missing, the next step is a plain approval or owner decision.
