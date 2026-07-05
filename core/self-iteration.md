# Controlled Self-iteration

## Purpose

The workflow must learn from real project execution without letting one project's special case pollute the shared IntentOS.

## Loop

```text
AI Task Log
  -> Daily Summary Check
  -> Workflow Retro
  -> Workflow Improvement
  -> Skill Candidate
  -> Automation Proposal when recurring execution is needed
  -> IntentOS Change Proposal
  -> IntentOS Review
  -> check-intentos
  -> IntentOS Update
```

## Project-level Assets

Generated projects must keep:

- `ai-logs/` for individual task execution records
- `workflow-retros/` for daily summaries, periodic reviews, or milestone reviews
- `workflow-improvements/` for concrete workflow improvement candidates
- `skill-candidates/` for proposed Skills that are not active until human approval
- `automation-proposals/` for proposed project automations that require human approval
- `intentos-proposals/` for changes proposed back to the shared IntentOS

## Rules

1. Every L1/L2/L3 task should produce an AI task log.
2. Every L2/L3 task must produce an AI task log.
3. A workflow retro should be created at milestones or after a meaningful batch of tasks.
4. Daily summary automation should be scoped to one project root and may run `scripts/workflow-daily-summary.mjs`, but should only create draft workflow files when it reports `ACTION_REQUIRED`.
5. If three or more task logs identify the same workflow problem, create a workflow improvement.
6. A high-impact L3 failure may create a workflow improvement immediately.
7. A Skill candidate may be created when repeated workflow evidence suggests a reusable execution wrapper.
8. A Skill candidate must not create, update, install, enable, or rely on an active Skill without explicit human approval.
9. A project automation proposal may be created when recurring execution is useful, but Codex must not create, update, resume, delete, or enable the automation without explicit human approval.
10. A intentos change proposal must reference a workflow improvement, Skill candidate, automation proposal, or explicit platform expansion need.
11. Project-specific fixes should stay in project docs or project `AGENTS.md`.
12. Profile-specific fixes should stay in the relevant profile.
13. Core changes require a core purity review.
14. No project should automatically mutate the shared IntentOS without review.

## Escalation From Project To IntentOS

Use the narrowest layer that solves the repeated problem:

```text
project docs / AGENTS.md
  -> prompt
  -> checklist
  -> template
  -> profile
  -> starter
  -> Skill candidate
  -> Automation proposal
  -> core
```

Core is the last resort.

## Anti-patterns

- Updating core because one project had a unique edge case.
- Turning a business rule into a generic workflow rule.
- Turning a platform rule into a core rule.
- Letting AI change the IntentOS without proposal and review.
- Letting AI create or enable active Skills from candidates without human approval.
- Letting AI create, update, resume, delete, or enable recurring automations without human approval.
- Attaching daily automation to the shared IntentOS or a broad parent directory when the intended scope is one project.
- Counting template existence as implementation evidence.
