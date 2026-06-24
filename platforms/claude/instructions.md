# Claude Project Instructions

Use the AI Native Development Workflow:

```text
Request -> Preflight -> Spec -> Eval -> Task -> Execute -> Verify -> Review -> Release -> Log
```

For vague or large requests:

- do not write code first
- produce a preflight report
- identify first vertical slice
- mark task level L0-L3

For implementation:

- implement one task card only
- follow scope and stop conditions
- run verification
- summarize evidence and risks

For bootstrap entry:

- if the user asks to configure, apply, initialize, inject, install, or bootstrap the AI Native workflow, treat it as execution bootstrap intent
- execution bootstrap intent may write workflow and governance assets only; do not modify business code during bootstrap
- if the user asks to look, review, evaluate, discuss, or not execute yet, treat it as discussion-only intent and do not write files
- use `.ai-native/prompts/bootstrap-agent.md` when present
- run `node scripts/workflow-next.mjs .` and follow `NEXT_ACTION`
- stop for human approval before applying migration reports

For project onboarding:

- before first non-trivial implementation, use `.ai-native/prompts/project-onboarding-agent.md`
- AI drafts project context documents from conversation
- humans decide project direction, stack approval, risk boundaries, and first vertical slice
- do not ask the human to manually fill all onboarding files
- ask focused questions, propose options, record assumptions, and request confirmation
- run `node scripts/check-project-onboarding.mjs .` for baseline
- use `node scripts/check-project-onboarding.mjs . --strict` only after human confirmation

For workflow artifacts:

- use `node scripts/new-workflow-item.mjs` to create numbered request, preflight, spec, eval, task, and AI log files
- run `node scripts/check-workflow-artifacts.mjs .` before implementation when workflow artifacts exist
- fix placeholder or missing artifact content before coding

For review:

- lead with findings
- prioritize bugs, permission issues, data leakage, missing tests, and scope creep

For Skill governance:

- repeated patterns may become `skill-candidates/`
- use `.ai-native/templates/skill-candidate.md`
- review with `.ai-native/checklists/skill-review.md`
- do not create, update, install, enable, or run active Skills without explicit human approval

For automation governance:

- automations must be project-scoped by default
- proposals belong in `automation-proposals/`
- use `.ai-native/templates/project-automation-proposal.md`
- review with `.ai-native/checklists/automation-review.md`
- do not create, update, resume, delete, or enable automations without explicit human approval for project root, schedule, prompt, allowed writes, forbidden actions, and initial status
- do not attach automation to a parent directory unless the user explicitly approves a multi-project monitor

For daily workflow summary:

- `scripts/workflow-daily-summary.mjs .` is a signal check
- `NO_ACTION` means no workflow draft is needed
- `ACTION_REQUIRED` means a retro, improvement, Skill candidate, automation proposal, or dev-kit proposal may be needed
- daily summary must not modify business code, production config, secrets, or active Skills
