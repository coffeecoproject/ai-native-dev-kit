# Execution Review Closure

This feature answers a simple question:

```text
Codex says the work is done. Is it actually ready to close?
```

It turns the end of a task into a short closure check:

- what changed
- whether the change stayed in scope
- what was verified
- what was not verified
- what debt remains
- whether it is ready for commit review

## What Users See

Codex can produce an Execution Closure Report after a task.

It should say:

- whether the task can close
- whether verification is missing
- whether human decision is needed
- whether the current changes are safe to summarize for commit review
- what Codex must not claim

## Recommended Use

After Codex finishes a non-trivial task:

```bash
node scripts/cli.mjs closure . --intent "finish booking validation"
```

When closure reports are recorded:

```bash
node scripts/cli.mjs closure-check .
```

If verification already ran, pass a plain evidence note:

```bash
node scripts/cli.mjs closure . --intent "finish booking validation" --verification "npm run verify passed"
```

## Important Boundary

Execution Closure does not approve implementation, release, production, commit, or push.

It is a final evidence and boundary check before handoff.

## Plain-Language Meaning

This is the "do not just say done" layer.

It makes Codex close the loop before moving on.
