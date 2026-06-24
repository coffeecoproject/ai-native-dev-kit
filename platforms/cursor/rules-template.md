# Cursor Rules Template

This project uses an AI-native, spec-first workflow.

## Core Rules

1. Do not implement vague requests directly.
2. Ask for or create a request card for large features.
3. Use preflight before coding for unclear, cross-module, or high-risk work.
4. Implement only one task card at a time.
5. Respect allowed and forbidden file scope.
6. Do not modify auth, permission, migration, production config, secrets, high-risk, or security-sensitive logic without explicit approval.
7. Add or update tests for behavior changes.
8. Run project verification before claiming completion.
9. Report what changed, tests run, and remaining risks.

## Required Project Context

Before non-trivial work, read:

- `AGENTS.md`
- `.ai-native/core/project-onboarding.md`
- `.ai-native/core/workflow.md`
- the linked request, preflight, spec, eval, and task card when they exist
- project docs that define architecture, permissions, risks, and verification

## Project Onboarding

- Before the first non-trivial implementation, run project onboarding.
- Use `.ai-native/prompts/project-onboarding-agent.md`.
- AI drafts project onboarding docs from conversation; humans confirm decisions.
- Do not ask the human to manually fill all onboarding files.
- Ask focused questions, propose options, record assumptions, and request confirmation.
- Run `node scripts/check-project-onboarding.mjs .` for baseline and `node scripts/check-project-onboarding.mjs . --strict` after decisions are confirmed.

## Workflow Artifacts

- Use `node scripts/new-workflow-item.mjs` to create numbered workflow files.
- Run `node scripts/check-workflow-artifacts.mjs .` before implementation when request/spec/eval/task files exist.
- Fix placeholder or missing artifact content before writing code.

## Skill Governance

- Repeated execution patterns may become `skill-candidates/` entries.
- Do not create, update, install, enable, or run an active Skill unless the user has explicitly approved it.
- Do not promote one-project behavior into shared workflow rules.
- Use `.ai-native/templates/skill-candidate.md` and `.ai-native/checklists/skill-review.md` for Skill proposals.

## Automation Governance

- Codex/Cursor may propose project-scoped automations, but must not create, update, resume, delete, or enable them without explicit human approval.
- Automation proposals belong in `automation-proposals/` and must use `.ai-native/templates/project-automation-proposal.md`.
- A valid automation approval must include exact project root, schedule, prompt, allowed writes, forbidden actions, and initial status.
- Do not attach automation to a parent directory unless the user explicitly approves a multi-project monitor.

## Daily Workflow Summary

- `scripts/workflow-daily-summary.mjs .` is a signal check, not an implementation step.
- `NO_ACTION` means no workflow draft is needed.
- `ACTION_REQUIRED` means draft retros, improvements, Skill candidates, automation proposals, or dev-kit proposals may be needed.
- Daily summary must not modify business code, production config, secrets, or active Skills.
