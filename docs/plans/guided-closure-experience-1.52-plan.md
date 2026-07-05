# Guided Closure Experience 1.52 Plan

## Human Summary

1.52 reduces user-facing complexity after the 1.48-1.51 evidence chain.

1.48-1.51 made IntentOS much stricter:

```text
impact coverage -> structured evidence -> evidence resolution -> precise closure evidence
```

That chain is useful, but it should not require ordinary users to choose internal commands or strict flags.

1.52 adds one guided close-out entry:

```text
User asks: "Is this task done?" / "Help me close this task."
Codex runs the relevant read-only checks internally.
Codex returns one plain Guided Closure Card.
```

This is a complexity convergence layer. It does not weaken any existing governance rule.

## Problem

After 1.51, the internal evidence system is strong, but the user-facing surface is too dense.

Users can see too many concepts at once:

- Change Impact Coverage
- Execution Closure
- structured evidence
- evidence reference resolution
- precise evidence
- artifact and human-decision references
- strict checker flags

This creates a product risk:

```text
Governance strength increases,
but the user must understand more technical process detail.
```

That conflicts with IntentOS' main promise: users should describe goals, make a few decisions, and let Codex route the workflow.

## Goals

- Add one user-facing close-out entry for "is this done?" style questions.
- Let Codex choose the internal close-out checks instead of asking the user to choose flags.
- Return one plain-language close-out card with:
  - whether the task can be treated as done;
  - what is still missing;
  - what Codex can do next;
  - what needs human decision;
  - where technical evidence lives.
- Keep strict evidence precision available for maintainers and CI.
- Move strict command examples out of the default user path.
- Add checker coverage so Guided Closure Cards cannot expose internal command burden or approve release/commit/production.

## Non-Goals

- Do not replace Change Impact Coverage.
- Do not replace Execution Closure.
- Do not remove strict evidence modes.
- Do not auto-generate missing evidence reports.
- Do not write target-project files.
- Do not authorize implementation, commit, push, release, production, CI, hooks, migrations, data, payment, permission, legal, tax, security, privacy, or compliance decisions.
- Do not prove product correctness.
- Do not force old projects to migrate historical reports.

## User-Facing Behavior

Ordinary users should ask in natural language:

```text
这个任务能算完成了吗？
帮我收口这个任务。
合同录入限制这个需求做完整了吗？
```

Maintainers can use a durable command:

```bash
node scripts/cli.mjs finish ../my-project --intent "新增合同录入限制" --verification "npm run verify passed"
```

The output is one Guided Closure Card.

The card must not force the user to choose internal command names or strict flags.

## Internal Routing

`finish` is a read-only orchestration entry. It may inspect:

- workflow guidance
- changed files
- task intent
- verification note
- existing Change Impact Coverage reports
- existing Execution Closure reports
- strict close-out readiness signals

It should summarize the result as one of:

- `NO_TASK_TO_CLOSE`
- `NEEDS_VERIFICATION`
- `NEEDS_IMPACT_COVERAGE`
- `NEEDS_HUMAN_DECISION`
- `READY_FOR_REVIEW`
- `CLOSE_WITH_LIMITATIONS`
- `BLOCKED`

The card can include technical details, but the main user sections must stay plain.

## Implementation Plan

1. Add Guided Closure governance assets.
   - `core/guided-closure-experience.md`
   - `docs/guided-closure-experience.md`
   - `templates/guided-closure-card.md`
   - `checklists/guided-closure-review.md`
   - `prompts/guided-closure-agent.md`
   - `guided-closure-cards/.gitkeep`

2. Add resolver and checker.
   - `scripts/resolve-guided-closure.mjs`
   - `scripts/check-guided-closure.mjs`
   - CLI aliases: `finish`, `finish-check`

3. Add source evidence.
   - Good example under `examples/1.52-guided-closure-experience/`
   - Bad fixtures for technical burden and overclaim.

4. Update references.
   - README default user commands become simpler.
   - Maintainer/reference docs keep strict commands available.
   - Manifest, package scripts, version records, and release records move to 1.52.0.

5. Validate.
   - Syntax checks.
   - Guided Closure checker.
   - Example and bad fixture checks.
   - IntentOS self-check.
   - Full `npm run verify`.

## Acceptance Plan

The upgrade is accepted only if:

- `node scripts/cli.mjs finish . --intent "维护 IntentOS 收口体验" --verification "npm run verify passed"` prints one safe card.
- `node scripts/check-guided-closure.mjs .` passes.
- The 1.52 example passes.
- Bad fixtures fail for:
  - forcing strict flags or checker names into user-facing sections;
  - claiming release, commit, production, or implementation approval.
- README default user section does not expose strict close-out flags.
- `npm run verify` passes.

## Boundary

1.52 is a product-experience layer over existing governance.

It hides complexity from the user. It does not lower the standard of evidence.
