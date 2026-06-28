# Output Experience Protocol

Output Experience Protocol defines how AI Native Dev Kit results should be explained to humans before technical or machine-readable details.

It does not change workflow gates, task levels, baseline rules, review rules, or approval authority. It changes output order and wording so humans can understand status, decisions, risk, and next steps without first decoding internal fields.

## Principle

Human first. Technical second. Machine last.

Every important workflow, baseline, adoption, review, release, or automation output should start with a plain-language explanation and then preserve technical details for engineering and audit use.

## Required Output Layers

Use this order when the output asks for a decision, reports a blocked state, reports review results, or summarizes a task:

1. Human Decision Summary
2. Human Summary
3. Current Status
4. What I Need From You
5. Recommended Next Step
6. What AI Can Do Safely
7. What AI Must Not Do
8. Next-Step Suggestions
9. Technical Details
10. Audit Notes
11. Machine-readable Output, when needed

Do not hide risk to make output shorter. Explain risk simply and keep the technical basis below it.

## Human Decision Summary

Use this section first when the output contains more than one valid path, asks for confirmation, blocks execution, recommends migration, proposes adoption, classifies a patch, or summarizes a launch/review decision.

It should answer in plain language:

- What is the conclusion?
- Which option is recommended?
- Can AI continue now: yes / limited / no?
- What does the human need to decide?
- Will the recommended option write project files?
- What is the risk?
- What happens if the human does nothing?

Use a compact options table when the human has to choose.

| Option | What it means | What AI will do | Writes project files? | Risk | When to choose |
|---|---|---|---|---|---|
| A | Inspect only | Read and report | No | low | Choose when you only want diagnosis |
| B | Controlled plan | Draft or update a plan/report | Plan/report only | low/medium | Choose when you want a durable decision record |
| C | Apply approved change | Modify approved workflow assets | Yes | medium/high | Choose only after reviewing the plan |
| D | Pause | Stop and wait | No | low | Choose when the decision is not ready |

There should be exactly one recommended option unless the safest answer is to pause. If an option writes files, say which kind of files it writes and whether it changes business code, workflow assets, CI, release, or production configuration.

## Human Summary

Use one short paragraph.

It should answer:

- What happened?
- Can AI continue?
- Why?
- What is the main decision or blocker?

Bad:

```text
INDUSTRIAL_BASELINE_STATE: EVIDENCE_MISSING
NEXT_ACTION: RUN_INDUSTRIAL_BASELINE_SETUP
```

Good:

```text
The project selected strict BL2 governance, but the required evidence records are not complete yet. AI should not continue high-risk implementation until the missing evidence is added or marked not applicable with a reason.
```

## Current Status

State must be one of:

- Can continue
- Needs confirmation
- Needs missing information
- Needs missing evidence
- Must stop
- Not applicable

Include:

- reason
- risk level: low / medium / high
- whether AI may continue: yes / limited / no

## What I Need From You

List only decisions that humans actually own.

Humans decide:

- scope changes
- risk acceptance
- Human Approval and Approval scope
- baseline level
- selected profiles and industrial packs
- architecture changes
- dependency choices
- migration decisions
- production configuration
- release, rollback, or customer handoff decisions
- whether to apply migration reports
- whether to create, enable, update, or run active Skills or automations

Do not ask humans to manually fill routine templates when AI can draft them. Ask for focused confirmation instead.

## Recommended Next Step

Give the next safe action.

Use `core/next-step-boundary.md` when suggesting follow-up work. The next safe action should be bounded, classified, and explicit about whether AI may do it now.

When a command is useful, include exactly the command and the condition for using it.

When the next action requires approval, say what approval is needed before the command is safe.

## What AI Can Do Safely

List actions AI may take without new approval.

Examples:

- read workflow assets
- draft request, preflight, spec, eval, task, or report files
- run non-destructive local checks
- prepare adoption assessment in read-only mode
- summarize migration reports
- fix deterministic AUTO_FIX findings inside approved task scope

## What AI Must Not Do

List actions AI must avoid until the required decision exists.

Examples:

- modify business code during bootstrap
- run workflow asset updates for read-only adoption mode
- apply AGENTS.md or PR template migration reports without approval
- widen task scope
- weaken Risk Gate, Human Approval, or Approval scope
- change architecture, dependencies, migrations, production config, release, rollback, or active automation without approval
- paste secrets or sensitive runtime data into external review prompts

## Next-Step Suggestions

Use this section when the output includes more than one possible next action or any follow-up that is outside current task scope.

Allowed types:

- `IN_SCOPE_NEXT_STEP`
- `DIRECT_FOLLOW_UP`
- `RISK_DECISION`
- `OUT_OF_SCOPE_OBSERVATION`
- `DO_NOT_PROCEED`

Each suggestion must include relation to the current task, whether AI can do it now, the required entry point, and risk or approval needs.

## Technical Details

Keep original fields, script output, paths, states, and command output here.

Technical details should be complete enough for engineers and reviewers to reproduce the decision.

## Audit Notes

Record:

- evidence refs
- approval refs
- exceptions
- residual risks
- reviewer source
- commands run
- date and owner when known

## Machine-readable Output

Use JSON only when the caller asked for it or an automation depends on it.

Machine-readable output must not replace human-readable status in normal interactive use.

## Output Modes

Different audiences need different detail.

| Mode | Audience | Goal |
|---|---|---|
| owner | project owner, product owner, client, or non-technical collaborator | understand status, decision, risk, and next step |
| developer | engineer or implementing agent | understand exact files, commands, checks, and repair path |
| reviewer | human reviewer, GPT Pro, second model, or subagent | focus on findings, evidence, and decision routing |
| audit | release, compliance, retrospective, or project governance | preserve evidence, approval, exceptions, and residual risk |

Default interactive output should behave like `owner` first and `developer` second.

## Required Assets

Use these templates when the output should become a file:

- `templates/human-status-report.md`
- `templates/decision-brief.md`
- `templates/plain-review-summary.md`
- `templates/customer-handoff.md`
- `templates/follow-up-proposal.md`
- `templates/final-report.md`

Use `prompts/reporter-agent.md` when an agent needs to convert technical workflow state into a human-readable report.
