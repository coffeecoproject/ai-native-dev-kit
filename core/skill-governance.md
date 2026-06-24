# Skill Governance

## Purpose

Define how workflow lessons may become Codex Skills without letting the workflow silently rewrite its own execution rules.

A Skill is an execution accelerator. It is not the source of truth for the workflow. The source of truth remains:

1. project files and task cards
2. scripts, tests, and CI
3. review gates
4. `AGENTS.md`
5. Skills and prompts

## Core Rule

The workflow may automatically identify and draft Skill candidates.

The workflow must not automatically create, update, install, enable, or rely on an active Skill without explicit human approval.

## Lifecycle

```text
AI Task Log
  -> Workflow Retro
  -> Workflow Improvement
  -> Skill Candidate
  -> Human Skill Review
  -> Approved Skill Draft
  -> Manual Generation / Update
  -> Manual Enablement
  -> Periodic Review
```

## Project-level Assets

Generated projects must keep:

- `skill-candidates/` for proposed Skills that are not active yet

Active Skills, if approved later, belong in the platform-specific active Skill location such as `.codex/skills/`. They must not be created from a candidate without explicit human approval.

## When To Create A Skill Candidate

Create a Skill candidate when one of these is true:

- three or more AI task logs show the same execution pattern or failure mode
- a workflow retro identifies a repeated manual operation that is stable and bounded
- a workflow improvement needs an execution wrapper rather than only a checklist or template change
- a platform-specific workflow is repeated across multiple projects of the same type
- the user explicitly asks to evaluate whether a repeated workflow should become a Skill

Do not create a Skill candidate for one-off preferences, temporary workarounds, project-only business rules, secrets, account-specific operations, or rushed exceptions.

## Admission Criteria

A Skill candidate must have:

- clear trigger conditions
- clear non-trigger conditions
- repeatable inputs and outputs
- bounded workflow steps
- explicit stop conditions
- required source files or references
- validation or review method
- evidence from logs, retros, improvements, or explicit user request
- classification as project-specific, profile-specific, platform-specific, or shared
- confirmation that it does not weaken any existing gate

## Layer Placement

Use the narrowest layer that solves the problem:

```text
project docs / AGENTS.md
  -> prompt
  -> checklist
  -> template
  -> profile
  -> starter
  -> Skill candidate
  -> active Skill
  -> core
```

Do not make a Skill when a checklist, template, script, or project `AGENTS.md` rule is the simpler and safer control.

## Candidate Types

### Project-specific Candidate

Used for repeated workflows inside one project.

Allowed:

- project conventions
- project-specific file locations
- project-specific verification commands

Not allowed:

- secrets
- production credentials
- customer data
- private account details
- assumptions that should be applied to unrelated projects

### Profile-specific Candidate

Used for repeated workflows across one project type, such as web apps, backend APIs, iOS apps, or Android apps.

Allowed:

- profile-specific verification patterns
- common platform risk checks
- reusable review routines

Not allowed:

- a concrete app name, bundle ID, package name, domain, API URL, release account, or customer rule

### Shared Workflow Candidate

Used for workflow behavior that applies across software projects.

Allowed:

- preflight routines
- spec review routines
- eval review routines
- AI log summarization routines
- workflow retro routines

Not allowed:

- platform-specific build commands
- business-domain assumptions
- project-specific architecture rules

## Skill Content Requirements

An approved Skill draft must define:

- name
- description
- when to use
- when not to use
- required files to read
- workflow steps
- tool or script usage, if any
- stop conditions
- human approval boundaries
- output format
- validation method
- maintenance owner or review cadence

## Hard Prohibitions

AI must not automatically:

- create or modify `.codex/skills/`
- install or enable a Skill
- update a Skill that changes high-risk behavior
- bypass preflight, spec, eval, review, release, or human approval gates
- encode secrets, credentials, tokens, private data, customer data, or production account details in a Skill
- turn one project preference into a shared Skill
- use a candidate as if it were an active Skill

## Human Review Decision

A human reviewer must decide one of:

```text
APPROVE_DRAFT
REQUEST_CHANGES
KEEP_AS_CANDIDATE
MOVE_TO_TEMPLATE_OR_CHECKLIST
PROJECT_ONLY
REJECT
```

Only `APPROVE_DRAFT` allows Skill generation or update, and manual enablement is still a separate step.

## Periodic Review

Active Skills should be reviewed when:

- the underlying workflow changes
- the project profile changes
- repeated failures appear in AI task logs
- the Skill has not been used recently
- a platform or tool behavior changes

Retire or narrow a Skill if it causes scope creep, stale assumptions, weakens gates, or increases review burden.
