# Automation Review Checklist

Use this checklist before creating, updating, resuming, or deleting any project automation.

## Proposal

- [ ] `automation-proposals/<file>.md` exists
- [ ] Automation name is clear
- [ ] Automation type is defined
- [ ] Trigger reason is documented
- [ ] Human approval decision is recorded

## Scope

- [ ] Automation is scoped to one project root
- [ ] Project root contains `.intentos/version.json`
- [ ] Project root contains required workflow scripts
- [ ] Automation is not attached to the shared intentos directory
- [ ] Automation is not attached to a broad parent directory unless explicitly approved as multi-project monitor

## Schedule

- [ ] Schedule is explicit
- [ ] Initial status is explicit: ACTIVE / PAUSED
- [ ] Review cadence is defined
- [ ] Pause/delete conditions are defined

## Prompt

- [ ] Prompt is self-contained
- [ ] Prompt names allowed writes
- [ ] Prompt names forbidden actions
- [ ] Prompt preserves `NO_ACTION` behavior
- [ ] Prompt does not ask for deployment, migration, production config, or secret handling

## Safety

- [ ] No business code changes
- [ ] No production config changes
- [ ] No release or deployment actions
- [ ] No destructive operations
- [ ] No secrets or credentials
- [ ] No `.codex/skills/` writes
- [ ] No active Skill creation, update, installation, or enablement
- [ ] No shared intentos mutation

## Decision

Choose one:

- [ ] `APPROVE_CREATE`
- [ ] `APPROVE_UPDATE`
- [ ] `START_PAUSED`
- [ ] `REQUEST_CHANGES`
- [ ] `REJECT`
- [ ] `DELETE`

## Reject If

- automation lacks explicit human approval
- project root is ambiguous
- allowed writes are too broad
- prompt can modify business code or production config
- prompt can create or enable active Skills
- automation is scoped to a parent directory by default

