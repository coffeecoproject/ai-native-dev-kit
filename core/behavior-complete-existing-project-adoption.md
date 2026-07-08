# Behavior-Complete Existing Project Adoption

## Human Summary

Behavior-complete adoption lets an existing project keep its own governance
assets while Codex still follows the right IntentOS behavior for each task.

It does not mean full native migration. It does not install `.intentos/`,
replace `AGENTS.md`, change CI, or approve implementation. It classifies the
task as `LOW`, `MEDIUM`, `POSSIBLE_HIGH`, or `HIGH`, then routes the work to the
right existing IntentOS evidence chain.

## Task Tiers

`LOW` tasks are small, local, and non-behavioral. They need a scope check,
minimal verification or a concrete no-verification reason, and a clear
statement that no API, DB, permission, runtime, business-rule, release, or
production surface is affected.

`MEDIUM` tasks are localized behavior changes. They need a short plan, affected
surface check, targeted verification, and evidence that no high-impact surface
is hidden.

`POSSIBLE_HIGH` tasks have credible high-impact signals but incomplete
information. Codex must stop direct implementation and either ask one plain
clarifying question or perform read-only inspection.

`HIGH` tasks touch or may affect DB, API contract, DTO/domain boundaries,
runtime workflow state, approval, settlement, finance, permission, production,
release, security, scheduled jobs, cross-surface behavior, or long-lived
queues. They require Business Rule Closure, Change Impact Coverage, Execution
Plan, Verification Plan, Test Evidence, Execution Assurance, and Completion
Evidence / Unified Close-Out through the existing systems.

## Review Policy By Tier

Task grading does not remove review. It selects the right review strength:

- `LOW`: `LIGHTWEIGHT` review. Codex must self-check scope, excluded
  high-impact surfaces, minimal verification or explicit no-verification
  reason, and unrelated edits before any completion claim.
- `MEDIUM`: `TARGETED` review. Codex must keep a short plan, confirm the
  bounded surface, run targeted verification, and use a checker-backed or
  project-native review source when the project provides one.
- `POSSIBLE_HIGH`: `BLOCKING_CLARIFICATION` review. Codex must stop direct
  implementation until clarification or read-only inspection resolves whether
  the task is high impact.
- `HIGH`: `FULL` review. Codex must use the full review and evidence chain
  before implementation review and completion claims.

This keeps low-risk tasks light without making them unreviewed, and keeps
high-impact tasks from being treated as patch work.

## Verification Status

Task Governance reports must not claim that verification has already happened
when they only classified and routed the task.

Use status fields instead:

- `REQUIRED`: verification must happen before a completion claim.
- `RECORDED`: verification evidence has been recorded elsewhere.
- `NOT_RUN`: verification has not run.
- `NOT_APPLICABLE_WITH_REASON`: the report explains why that verification type
  does not apply.

Default classifier output should use `REQUIRED` for low or medium verification
obligations, not `done`.

## User Burden Boundary

User-facing summaries must stay plain-language. Codex should not ask a
zero-experience user to choose internal systems such as Business Rule Closure,
Change Impact Coverage, Execution Assurance, Completion Evidence, or Review
Policy.

## Boundary

Task Governance is a router and gate, not a completion system.

It does not authorize implementation.

It must not:

- write target-project files;
- authorize implementation;
- approve commit or push;
- approve release or production;
- run migrations;
- change CI or hooks;
- replace stronger project-owned rules.

## Existing Project Rule

Project-native evidence may satisfy required IntentOS behavior when it is
mapped with a source ref, digest, task match, and reason. If the project-native
rule is stronger, it must be preserved rather than downgraded.

For 1.83.1 and later, a project-native mapping is only valid when it records:

- an `artifact:` ref that resolves inside the project;
- a matching sha256 digest for that artifact;
- an evidence owner;
- a concrete scope such as `task_specific`, `project_wide`, or `release_wide`;
- `project_native_task_match: Yes` for matched or stronger mappings;
- a plain summary explaining what the project-native evidence covers.

This lets existing projects use their own RFCs, QA checklists, sessions,
engineering baselines, or release SOPs without turning an unverified reference
into a task-governance pass.
