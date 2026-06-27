# Minimal Commit Set

Use this guide before Codex commits changes.

The goal is:

```text
Commit only the durable work needed for the approved task.
```

## Always Include

Include files that are part of the approved task and should remain in the project:

- source code changes
- tests and fixtures
- workflow rules, templates, prompts, checklists, and scripts
- approved docs
- release evidence
- reviewed examples
- generated project assets that are intentionally managed by the dev kit

## Include Only After Human Approval

These files can enter Git only when the task or a human decision explicitly allows it:

- learning candidates promoted into project memory
- context corrections that change project rules
- production deployment docs
- release readiness decisions
- baseline decisions that affect architecture, environment, security, payment, privacy, tax, or data migration
- generated screenshots, recordings, or large evidence bundles

## Keep Out Of Git

Do not commit:

- `.DS_Store`
- editor swap files
- local scratch files
- raw private chat exports
- tokens, secrets, passwords, API keys, private keys, or signed URLs
- `.env` files unless the project already has an approved example file
- local database dumps
- build caches
- unreviewed generated logs
- unapproved learning candidates
- unrelated user changes

## Dirty Worktree Rule

When the worktree is dirty, Codex must separate:

- files created or edited by the current task
- unrelated existing user changes
- machine noise
- generated evidence that should stay local

Codex must not revert user changes to make the commit look clean.

## Suggested Commit Boundary

Before committing, Codex should prepare a plain summary:

```text
Will commit:
- files changed for the approved task
- tests and evidence that prove the task

Will not commit:
- unrelated local files
- secrets or local machine noise
- unapproved candidates or private notes
```

If this boundary is unclear, create:

```text
git-boundary-reports/<id>.md
```

## Checker Support

Run:

```bash
node scripts/check-context-governance.mjs .
git diff --check
```

The context checker rejects secret-like content in context governance artifacts. `git diff --check` catches whitespace and patch formatting issues before commit.
