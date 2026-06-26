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

## Bootstrap Entry

- When the user asks to configure, apply, initialize, inject, install, or bootstrap the AI Native workflow, treat that as execution bootstrap intent.
- Execution bootstrap intent may write workflow and governance assets only; do not modify business code during bootstrap.
- When the user asks to look, review, evaluate, discuss, or not execute yet, treat that as discussion-only intent and do not write files.
- For bootstrap work, use `.ai-native/prompts/bootstrap-agent.md` when present, then run `node scripts/workflow-next.mjs .`.
- Follow `NEXT_ACTION` and stop for human approval before applying migration reports.
- If `workflow-next` reports `REVIEW_DIRTY_WORKTREE` or `ADOPTION_MODE: GUARDED`, stop before creating artifacts or executing tasks until the human confirms how to handle existing changes.

## Project Onboarding

- Before the first non-trivial implementation, run project onboarding.
- Use `.ai-native/prompts/project-onboarding-agent.md`.
- AI drafts project onboarding docs from conversation; humans confirm decisions.
- Do not ask the human to manually fill all onboarding files.
- Ask focused questions, propose options, record assumptions, and request confirmation.
- Run `node scripts/check-project-onboarding.mjs .` for baseline and `node scripts/check-project-onboarding.mjs . --strict` after decisions are confirmed.

## Platform Baseline

- Select target runtime profiles in `docs/project-profile.md` under `Selected Profiles`.
- Run `node scripts/check-platform-baseline.mjs .` before the first non-trivial implementation.
- Use `node scripts/resolve-platform-baseline.mjs .` when effective platform verification or risk requirements need review.
- Use strict mode only after humans confirm selected profiles and project docs.

## Industrial Baseline

- Baseline level is `BL0_LIGHTWEIGHT`, `BL1_STANDARD`, or `BL2_INDUSTRIAL`; it is not task level.
- Run `node scripts/check-industrial-pack.mjs . --selected-only` to validate selected industrial pack assets.
- Run `node scripts/resolve-industrial-baseline.mjs .` and `node scripts/check-industrial-baseline.mjs . --bl2-only` to inspect project-level BL2 readiness when BL2 is selected.
- Read `.ai-native/industrial-packs/selection-guide.md` before recommending pack combinations.
- Do not treat BL2 or selected industrial packs as accepted until humans confirm baseline level, selected packs, exceptions, residual risk acceptance, and project-level industrial baseline status.

## Workflow Artifacts

- Use `node scripts/new-workflow-item.mjs` to create numbered workflow files.
- Use `node scripts/new-workflow-item.mjs --type review-packet --task <task-card>` when a change needs independent human, GPT Pro, or second-model review.
- Use `node scripts/new-workflow-item.mjs --type review-loop-report --task <task-card>` for L2/L3 work or when review findings need closure.
- Use `node scripts/new-workflow-item.mjs --type gpt-review-prompt --task <task-card>` only as a read-only reviewer prompt paired with a Review Packet.
- Run `node scripts/check-workflow-artifacts.mjs . --mode ready` before implementation when request/spec/eval/task files exist.
- Run `node scripts/check-workflow-artifacts.mjs . --mode implementation --task <task-card>` for high-risk implementation after human approval is recorded.
- If any Risk Gate item is checked, `Human Approval` status and `Approval scope` must be recorded before implementation.
- Fix placeholder or missing artifact content before writing code.
- AUTO_FIX is limited to deterministic, low-risk findings inside approved task scope, for at most 2 rounds.
- Route scope, risk, permission, architecture, dependency, migration, production config, release, rollback, Human Approval, and Approval scope changes to the human.

## Output Experience

- Use `.ai-native/core/output-protocol.md` and `.ai-native/prompts/reporter-agent.md` for workflow, baseline, adoption, review, release, and automation status.
- Human-facing output starts with a human summary, current status, decision needed, next safe step, what AI can do, and what AI must not do.
- Put technical fields, paths, commands, and audit notes after the plain-language status.
- Use `.ai-native/core/glossary.md` when internal terms need translation.

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
