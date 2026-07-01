# Change Impact Coverage

Change Impact Coverage is the layer that helps Codex avoid incomplete work.

Plain-language example:

```text
You ask: add a contract input restriction.

Codex should not only change backend validation.
It should also check whether frontend input behavior, API contract, error copy, tests, docs, and release impact need work.
```

## What It Does

It creates a report that says:

- what surfaces may be affected
- what must be handled before the task is complete
- what is intentionally out of scope
- what needs a human decision
- what evidence proves each surface was checked

## What It Does Not Do

- It does not edit files by itself.
- It does not approve implementation.
- It does not approve release or production.
- It does not replace human product judgment.
- It does not prove that every possible impact was discovered.

## Typical Use

```bash
node scripts/cli.mjs impact-coverage . --intent "add contract input restriction"
node scripts/cli.mjs impact-coverage-check .
```

For a target project, Codex can run this before writing a plan. For an already completed task, Codex can use the report during close-out to identify missed surfaces.

## When To Use It

Use it for:

- validation rules
- form restrictions
- backend rule changes
- API behavior changes
- permission or role changes
- status transitions
- data model changes
- visible error messages
- payment, finance, tax, HR, approval, or operational workflows

For simple copy-only or docs-only work, it can stay lightweight. Codex should still explain why broader impact coverage is not needed.

## Human Role

The user should not need to choose technical surfaces manually.

Codex should propose the surface map and ask only decision-level questions, such as:

- Is frontend behavior in scope for this change?
- Is this rule enforced only locally, or also by the server?
- Is this connected to permissions, production data, or release?

## Output

The report uses these outcomes:

- `CHANGE_IMPACT_RECORDED`
- `NEEDS_HUMAN_DECISION`
- `BLOCKED`
