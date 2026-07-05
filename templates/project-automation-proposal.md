# Project Automation Proposal: <short-name>

## Status

Draft / Ready for Review / Approved / Created / Paused / Rejected / Superseded

## Automation Name

`<project-name>-daily-workflow-summary`

## Automation Type

Daily workflow summary / Project-specific monitor / Other:

## Trigger Reason

Why is this automation being proposed?

- project setup
- deployment preparation
- release handoff
- workflow review
- explicit user request

## Project Root

Absolute path:

```text
<project-root>
```

Required files:

- [ ] `.intentos/version.json`
- [ ] `scripts/workflow-daily-summary.mjs`

## Schedule

Example:

```text
Every 24 hours
```

## Execution Environment

Local / Worktree:

## Prompt

Use `.intentos/templates/daily-automation-prompt.md` or define a project-specific prompt here:

```text

```

## Allowed Reads

- project workflow files
- `ai-logs/`
- `workflow-retros/`
- `workflow-improvements/`
- `skill-candidates/`
- `intentos-proposals/`

## Allowed Writes

- `workflow-retros/`
- `workflow-improvements/`
- `skill-candidates/`
- `.intentos/daily-summary-state.json`

## Forbidden Actions

- [ ] no business code changes
- [ ] no production config changes
- [ ] no deployment or release actions
- [ ] no migration actions
- [ ] no secrets or credential handling
- [ ] no `.codex/skills/` writes
- [ ] no active Skill creation, update, installation, or enablement
- [ ] no shared intentos changes

## No-action Behavior

When `scripts/workflow-daily-summary.mjs` reports `NO_ACTION`, the automation must not edit project files.

## Expected Outputs

- concise automation report
- draft daily retro only when `ACTION_REQUIRED`
- workflow improvement draft only when evidence supports it
- Skill candidate draft only when repeated execution pattern supports it

## Review Cadence

Review this automation:

- after first run
- after project release
- when workflow scripts change
- when project root changes
- every <period>

## Approval

Approval is required before Codex creates, updates, resumes, or deletes this automation.

Approved by:

Approved at:

Approved exact scope:

- project root:
- schedule:
- prompt:
- allowed writes:
- initial status: ACTIVE / PAUSED

## Automation Record

Fill after creation/update:

- Automation ID:
- Created / updated by:
- Created / updated at:
- Status:

## Decision

APPROVE_CREATE / APPROVE_UPDATE / START_PAUSED / REQUEST_CHANGES / REJECT / DELETE

## Notes

- 

