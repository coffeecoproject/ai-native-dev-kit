# Output Experience Protocol

Output Experience Protocol defines how IntentOS results should be explained to humans before technical or machine-readable details.

It does not change workflow gates, task levels, baseline rules, review rules, or approval authority. It changes output order and wording so humans can understand status, decisions, risk, and next steps without first decoding internal fields.

## Principle

Human first. Technical second. Machine last.

Every important workflow, baseline, adoption, review, release, or automation output should start with a plain-language explanation and then preserve technical details for engineering and audit use.

## Required Output Layers

Use this order when the output asks for a decision, reports a blocked state, reports review results, or summarizes a task:

1. Decision Responsibility Summary
2. User Summary
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

## Decision Responsibility Summary

Use this section first when output needs to explain what Codex selected, why it can or cannot continue, and whether any permitted user input is genuinely missing. Technical alternatives remain in Technical Details and are not a user menu.

It should answer in plain language:

- What is the conclusion?
- Which technical path did Codex select?
- Can AI continue now: yes / limited / no?
- Is user input `NO_USER_ACTION`, `BUSINESS_FACT_NEEDED`, `REAL_WORLD_CONSENT_NEEDED`, or `EXTERNAL_FACT_NEEDED`?
- Will the recommended option write project files?
- What is the risk?
- What happens if the human does nothing?

There must be one Codex-selected route unless evidence requires a blocked or read-only state. If it writes files, state which files and authority permit the write. Do not present Profile, architecture, stack, baseline, BL, pack, test, reviewer, subagent, hook, checker, workflow, Git handling, or technical risk as user options.

## User Summary

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
- Needs permitted user input
- Needs missing information
- Needs missing evidence
- Must stop
- Not applicable

Include:

- reason
- risk level: low / medium / high
- whether AI may continue: yes / limited / no

## What I Need From You

List only inputs the user actually owns:

- an unavailable business rule or product preference;
- exact consent to one prepared concrete production, cost, payment, real-user,
  external-account, customer-promise, or irreversible-data effect;
- a legal, tax, compliance, provider, account, or third-party fact that project
  evidence cannot establish.

All other cases are `NO_USER_ACTION`. Do not ask the user to fill templates,
choose technical controls, approve technical risk, or interpret internal states.

Do not push professional judgment back to a non-expert user as raw technical choices. Use `core/decision-delegation-boundary.md`:

- `D0`: AI handles directly.
- `D1`: Codex selects the evidence-backed default and explains it.
- `D2`: Codex compares technical options internally, selects one, and records the tradeoff.
- `D3`: Codex drafts a Decision Brief or independent review path and keeps implementation blocked until the technical gate passes.
- `D4`: AI does not continue.

Bad:

```text
Should this be enum, lookup table, or state machine?
```

Good:

```text
I selected a simple fixed first version because this slice only needs visible statuses. I will verify that behavior and park configurable statuses as separate future scope. No technical input is needed from you.
```

## Recommended Next Step

Give the next safe action.

Use `core/next-step-boundary.md` when suggesting follow-up work. The next safe action should be bounded, classified, and explicit about whether AI may do it now.

When a command is useful, include exactly the command and the condition for using it.

When the next action requires authority, state the missing evidence or exact real-world consent before the command is safe.

## What AI Can Do Safely

List actions Codex may take within the current task and bounded authority.

Examples:

- read workflow assets
- draft or update required workflow artifacts inside the current task boundary
- run non-destructive local checks
- prepare adoption assessment in read-only mode
- summarize migration reports
- fix deterministic AUTO_FIX findings inside approved task scope

## What AI Must Not Do

List actions AI must avoid until the required decision exists.

Examples:

- modify business code during bootstrap
- run workflow asset updates for read-only adoption mode
- apply AGENTS.md or PR template migration reports without a reviewed bounded plan and controlled readiness
- widen task scope
- weaken Risk Gate, bounded authority, or evidence requirements
- change architecture, dependencies, migrations, production config, release, rollback, or active automation outside reviewed task scope and controlled readiness
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

When the conversation is broad or drifting, also state:

- Current Mainline
- Parking Lot
- Decision Needed
- Next Safe Action

Parking-lot items are preserved context only. They are not approval to execute future work.

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
| plain | zero-experience solo developer or non-technical collaborator | understand business status, any missing fact or real-world consent, and what Codex does next |
| developer | engineer or implementing agent | understand exact files, commands, checks, and repair path |
| reviewer | human reviewer, GPT Pro, second model, or subagent | focus on findings, evidence, and decision routing |
| audit | release, compliance, retrospective, or project governance | preserve evidence, approval, exceptions, and residual risk |

Default interactive output should behave like `plain` first and `developer` second. Compatibility callers may still request the historical `owner` mode; render it using the same solo-developer contract.

## Required Assets

Use these templates when the output should become a file:

- `templates/human-status-report.md`
- `templates/decision-brief.md`
- `templates/plain-review-summary.md`
- `templates/customer-handoff.md`
- `templates/follow-up-proposal.md`
- `templates/final-report.md`
- `templates/active-work-thread.md`
- `templates/guided-decision-summary.md`

Use `prompts/reporter-agent.md` when an agent needs to convert technical workflow state into a human-readable report.
