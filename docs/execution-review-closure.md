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
- which evidence supports each `pass`

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

For cross-surface work such as validation, API, backend, data, permission, or error-copy changes, use the stricter check:

```bash
node scripts/check-execution-closure.mjs . --require-impact-coverage
```

Plainly: if the closure says the work is ready, it must point to a Change Impact Coverage report that proves the affected surfaces were closed.

If verification already ran, pass a plain evidence note:

```bash
node scripts/cli.mjs closure . --intent "finish booking validation" --verification "npm run verify passed"
```

For a stronger evidence-linked closure, provide the recorded evidence:

```bash
node scripts/cli.mjs closure . \
  --intent "finish booking validation" \
  --review-surface-ref review-surface-cards/001-booking.md \
  --review-loop-ref review-loop-reports/001-booking.md \
  --change-boundary-ref change-boundary-reports/001-booking.md \
  --verification-file reports/verify-output.txt \
  --debt-handoff-ref debt-handoff-reports/001-booking.md \
  --delivery-path-ref delivery-path-reports/001-booking.md
```

Changed files alone are not enough to mark functionality or code review as passed. They only prove that work happened.

## Important Boundary

Execution Closure does not approve implementation, release, production, commit, or push.

It is a final evidence and boundary check before handoff.

## Plain-Language Meaning

This is the "do not just say done" layer.

It makes Codex close the loop before moving on.
