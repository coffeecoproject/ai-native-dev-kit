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

For strict close-out, use:

```bash
node scripts/check-change-impact-coverage.mjs . --require-structured-evidence --mode closure --strict-evidence
```

This strict invocation fails when no Change Impact Coverage report exists.
Default checks without strict or closure options may still skip an empty report
directory when no task currently requires coverage evidence.

For rule-heavy work that has a saved Business Rule Closure Card, strict binding
can require the impact report to consume that same READY rule:

```bash
node scripts/check-change-impact-coverage.mjs . \
  --report change-impact-coverage-reports/001-example.md \
  --require-business-rule-ready
```

This automatically requires machine-readable evidence and checks that
`business_rule_ref`, `business_rule_digest`, and `business_rule_state` match the
referenced Business Rule Closure report.

For stricter close-out where evidence paths must really resolve, use:

```bash
node scripts/check-change-impact-coverage.mjs . --require-structured-evidence --mode closure --strict-evidence --resolve-evidence-refs
```

Plainly:

- `preflight` means "what could be affected before we code?"
- `closure` means "after the work, did we really close every required affected part?"
- `--strict-evidence` means "`DONE` cannot be backed by vague placeholder text."
- `--resolve-evidence-refs` means "`DONE` evidence must point to a real project-local file or accepted recorded reference."
- `--require-precise-evidence` means resolved files must have meaningful content, and recorded `artifact:` / `human-decision:` references must point to real records.

To check one exact report during close-out:

```bash
node scripts/check-change-impact-coverage.mjs . \
  --report change-impact-coverage-reports/001-example.md \
  --require-structured-evidence \
  --mode closure \
  --strict-evidence \
  --resolve-evidence-refs \
  --require-precise-evidence
```

Codex can also read changed files from git:

```bash
node scripts/cli.mjs impact-coverage . --intent "add contract input restriction" --from-git-diff
node scripts/cli.mjs impact-coverage . --intent "add contract input restriction" --from-git-diff --cached
node scripts/cli.mjs impact-coverage . --intent "add contract input restriction" --from-git-diff --base origin/main
```

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

## Structured Evidence

New strict reports include a `Machine-Readable Evidence` JSON block checked against:

```text
schemas/artifacts/change-impact-coverage.schema.json
```

This lets Codex verify that the Markdown table and machine-readable record agree on mode, outcome, surfaces, statuses, changed files, and no-authority boundaries.

## Evidence References

When strict reference resolution is enabled, `DONE` evidence may be:

- a relative file path inside the project
- `command-output:<path>` for a saved command output file
- `artifact:<id-or-ref>` for a recorded workflow artifact
- `human-decision:<id-or-ref>` for a recorded human decision

Changed files and evidence paths are still evidence signals, not implementation approval.
