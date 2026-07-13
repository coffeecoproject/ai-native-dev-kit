# Project Automation Governance

## Purpose

Define how Codex may propose, create, update, pause, or enable recurring project automations.

Project automations are continuous execution capabilities. They may read project files and write workflow artifacts on a schedule, so the user's stated goal must explicitly request the persistent automation. Codex owns the technical configuration and presents the prepared recurring effect for exact consent.

## Core Rule

Codex may propose project-scoped automations during project setup, release preparation, or workflow review.

Codex must not create, update, enable, resume, or delete an automation unless the
user requested that persistent capability and gave exact consent to the
prepared recurring effect. Codex derives and verifies the automation name,
project root, schedule, prompt, allowed writes, and forbidden actions.

## Lifecycle

```text
Project Setup / Release Preparation / Workflow Review
  -> Automation Proposal
  -> Internal Automation Review
  -> Exact Recurring-Effect Consent
  -> Codex App Automation Create / Update
  -> Periodic Review
  -> Pause / Update / Delete when no longer valid
```

## Project-level Assets

Generated projects must keep:

- `automation-proposals/` for proposed or reviewed project automations

Active automation records live in the Codex App automation system, not in project source files. Project files should record the proposal, consent, and review evidence.

## Allowed Automation Types

### Daily Workflow Summary

Purpose:

- run `scripts/workflow-daily-summary.mjs`
- create workflow drafts only when the script reports `ACTION_REQUIRED`

Allowed writes:

- `workflow-retros/`
- `workflow-improvements/`
- `skill-candidates/`

Forbidden:

- business code changes
- production config changes
- active Skill creation, update, installation, or enablement
- `.codex/skills/` writes

### Project-specific Monitor

Allowed only when project evidence defines the monitored source, expected output, and internal review path.

Forbidden by default:

- production side effects
- credential handling
- deployment actions
- irreversible operations

## Scope Rules

Default automation scope is one project root.

The automation `cwd` must point to the project root that contains:

- `.intentos/version.json`
- `scripts/workflow-daily-summary.mjs` for daily workflow summary automation

Do not attach a project automation to:

- the shared intentos directory
- a broad parent directory
- a directory containing unrelated projects

Multi-project monitoring is allowed only when the user explicitly requests that
persistent scope and gives exact consent to the prepared multi-project effect.

## Required Proposal Fields

An automation proposal must define:

- automation name
- project root
- trigger reason
- schedule
- execution environment
- prompt
- allowed reads
- allowed writes
- forbidden actions
- expected no-action behavior
- exact recurring-effect consent record
- review cadence
- pause/delete conditions

## User Consent Boundary

Before Codex calls an automation tool to create, update, resume, or delete an
automation, it must derive and present:

- exact project root
- exact schedule
- exact prompt
- allowed write paths
- forbidden actions
- whether automation starts `ACTIVE` or `PAUSED`

The user gives one exact consent to that prepared recurring effect. If the
external effect materially changes, consent is required again; technical
configuration details remain Codex's responsibility.

## Release Gate Integration

Before project release or handoff, review:

- whether daily workflow summary automation is needed
- whether it should be active or paused
- whether its project root is correct
- whether its allowed writes are still valid
- whether any pending automation proposal requires bounded user input

The absence of an automation is acceptable when the project does not need scheduled workflow review.

## Hard Prohibitions

Codex must not automatically:

- create, update, resume, or delete automations without an explicit user request and exact recurring-effect consent
- attach project automation to a parent directory by default
- create automations that modify business code
- create automations that deploy, release, migrate, or change production config
- create automations that handle secrets or credentials
- create automations that write to `.codex/skills/`
- create automations that enable active Skills
- convert a one-off reminder into a recurring automation without exact recurring-effect consent

## Periodic Review

Review project automations when:

- project root changes
- workflow scripts change
- release state changes
- automation produces repeated no-action reports
- automation produces repeated low-value drafts
- Skill governance or self-iteration rules change

Pause or delete automations that no longer have a clear owner, valid project root, or useful signal.
