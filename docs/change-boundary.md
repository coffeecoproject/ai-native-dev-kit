# Change Boundary

Change Boundary helps Codex prove that the files it changed match the task that was approved.

It answers:

```text
What was allowed to change?
What actually changed?
Did anything outside the task change?
Does the drift need review, revert, or human decision?
```

Use it for non-trivial tasks, governed projects, production-sensitive projects, or any task that touches high-risk surfaces.

## Command

```bash
node scripts/check-change-boundary.mjs . --report change-boundary-reports/<file>.md
```

Use `--cached` to check staged files.

Use `--base <ref>` to compare against a base ref.

## Boundary

This check does not guarantee AI cannot write outside scope. It reports whether recorded changed files match the approved boundary and fails when forbidden drift is recorded or detected.

