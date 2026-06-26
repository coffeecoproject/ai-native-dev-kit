# AI Native Glossary

This glossary translates AI Native Dev Kit terms into plain language.

Use it when writing human-facing reports, decision briefs, onboarding notes, review summaries, or final status updates.

## Core Workflow Terms

| Term | Plain meaning |
|---|---|
| Request Card | A short record of what the user wants to change. |
| Preflight | A before-work check that decides whether the request is clear, scoped, and safe enough to implement. |
| Spec | The agreed description of what will be built and what will not be built. |
| Eval | The acceptance standard used to decide whether the work is correct. |
| Task Card | The narrow instruction that tells AI what it may implement and what it must avoid. |
| Agent Execution | The implementation work done by AI or an AI-assisted developer. |
| Verification | Tests, checks, screenshots, commands, or other evidence that prove the work behaves as expected. |
| Review | A second look at the work to catch bugs, scope drift, missing tests, or risk mistakes. |
| Release | The step that prepares or records delivery. Release approval still belongs to humans or the project's existing governance. |
| AI Task Log | A short record of what AI did, what worked, what failed, and what should improve next time. |
| Workflow Retro | A periodic review of workflow health across several tasks or a milestone. |

## Risk and Approval Terms

| Term | Plain meaning |
|---|---|
| Risk Gate | A checklist that marks whether the task touches risky areas such as permissions, data, payments, migrations, production config, release, or rollback. |
| Risk Gate Exclusions | A record that says a risky word appeared in the task, but the risk is truly out of scope and a human accepted that explanation. |
| Human Approval | Explicit human permission for a high-risk task or decision. |
| Approval scope | The exact boundary of what the human approved. AI must not go beyond it. |
| Stop Condition | A condition that tells AI to stop and ask instead of guessing or continuing. |
| Residual Risk | A known risk that remains after implementation or review. |
| Exception | A deliberate, recorded deviation from the normal rule. |

## Project Setup Terms

| Term | Plain meaning |
|---|---|
| Project Onboarding | The step where AI drafts project context and humans confirm direction, stack, risks, and first slice. |
| O0 | Lightweight onboarding for experiments and low-risk work. |
| O1 | Standard onboarding for real projects. |
| O2 | Strict onboarding for production, shared, sensitive, or long-lived projects. |
| Project Profile | The selected project type or runtime, such as web app, backend API, iOS app, Android app, WeChat Mini Program, internal admin, or high-risk change. |
| Platform Baseline | The minimum docs, risks, verification, and AI boundaries for the selected project profiles. |
| Existing Governed Project Adoption | Read-only assessment mode for projects that already have strong rules, CI, release controls, or active worktree changes. |
| Existing Governance Map | A mapping from AI Native concepts to the project's existing rules and records. |

## Baseline and Evidence Terms

| Term | Plain meaning |
|---|---|
| BL0 | Lightweight project governance. |
| BL1 | Standard project governance. |
| BL2 | Strict project governance that requires stronger evidence and approval. |
| Industrial Pack | A platform or risk-specific quality package for BL2 work. |
| Selected Industrial Pack | An industrial pack that the project explicitly chose. Unselected packs do not apply. |
| Baseline Selection | The project decision record for BL level, selected packs, exceptions, and approvals. |
| Baseline Evidence | The project-level evidence index that proves required baseline checks are satisfied or not applicable. |
| Evidence Ref | A project-relative file path that proves a check was actually performed. |
| Not applicable | A recorded reason that a requirement does not apply to this project or task. |
| Dogfood Observation | A record of how the dev kit behaves on a real project, including cost, friction, false positives, and missed risks. |

## Review Terms

| Term | Plain meaning |
|---|---|
| Review Packet | A stable input package for a reviewer. It is not approval. |
| GPT Review Prompt | A read-only prompt used with GPT Pro, a second model, or another external reviewer. |
| Review Loop Report | The record of review rounds, findings, AUTO_FIX attempts, re-review, and human decisions. |
| Bounded Next-Step Protocol | The rule that AI may suggest next steps only when each suggestion is classified, scoped, and clear about whether AI can act now. |
| Follow-up Proposal | A draft record for a suggestion that is related to the current task but should not be implemented inside it. |
| Final Report | A durable task result summary with completed work, verification, unchanged scope, remaining risks, next-step suggestions, human decisions, and next safe action. |
| Next-Step Suggestion | A possible action or context after the current task. It is not approval to continue. |
| IN_SCOPE_NEXT_STEP | A small safe action still inside the current task scope. |
| DIRECT_FOLLOW_UP | Related follow-up work that requires a new request or follow-up proposal before implementation. |
| RISK_DECISION | A suggestion that needs human judgment before implementation because it touches scope, risk, approval, architecture, dependency, migration, production, release, rollback, payment, or similar authority. |
| OUT_OF_SCOPE_OBSERVATION | Useful context observed during a task, recorded only as background. |
| DO_NOT_PROCEED | A next action that is unsafe or unauthorized under the current scope. |
| AUTO_FIX | A deterministic, low-risk fix that AI may apply inside approved scope. |
| NEEDS_HUMAN_DECISION | A finding that requires a human decision because it touches scope, risk, architecture, dependency, migration, production, release, rollback, approval, or similar authority. |
| NEEDS_CLARIFICATION | A finding that cannot be resolved from available evidence. |
| NO_ACTION | A finding that does not require a change, with a recorded reason. |

## Governance Terms

| Term | Plain meaning |
|---|---|
| Skill Candidate | A proposal for a reusable Codex Skill. It is not an active Skill. |
| Automation Proposal | A proposal for a project-scoped automation. It is not an enabled automation. |
| Dev Kit Proposal | A proposal to improve the shared AI Native Dev Kit. |
| Migration Report | A report that shows how to update AGENTS.md or PR template governance without applying it automatically. |
| Output Experience Layer | The rule that workflow results should first explain status, decision, risk, and next step in human-readable language, then show technical details. |
