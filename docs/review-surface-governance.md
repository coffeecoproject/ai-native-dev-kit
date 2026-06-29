# Review Surface Governance

This feature answers a simple question:

```text
After Codex finishes this task, what should it check?
```

The user should not need to say "please do code review, data review, permission review, release review".

Codex reads the project and chooses the review surfaces itself.

## What Users See

Codex can produce a Review Surface Card before execution.

It says:

- what kind of project this looks like
- which review surfaces apply
- what needs human confirmation
- what Codex must report after execution
- what the card does not approve

## Example

For a new appointment app, Codex may select:

- `FUNCTIONAL_REVIEW`
- `CODE_REVIEW`
- `UX_REVIEW`
- `VERIFICATION_REVIEW`
- `DEBT_REVIEW`

For an existing admin project with login and database changes, Codex may also select:

- `DATA_REVIEW`
- `PERMISSION_REVIEW`
- `EXISTING_GOVERNANCE_REVIEW`
- `SECURITY_PRIVACY_REVIEW`

For a project with CI or deployment files, Codex may select:

- `RELEASE_IMPACT_REVIEW`

## Important Boundary

A Review Surface Card does not approve implementation.

It does not approve release.

It does not change files.

It only records what must be checked before and after the task.

## Recommended Use

Before a non-trivial task:

```bash
node scripts/cli.mjs review-surface .
```

When Review Surface Cards are recorded:

```bash
node scripts/cli.mjs review-surface-check .
```

## Plain-Language Meaning

This is the "do not forget to check the important parts" layer.

It helps Codex avoid a narrow patch that fixes one symptom but misses data, permission, release, user experience, or debt impact.
