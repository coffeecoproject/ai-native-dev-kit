# Conversation Drift Review Checklist

Use this checklist when a user message may affect the active task.

## Required Checks

- [ ] Intent is classified before acting.
- [ ] Relation to the current task is explicit.
- [ ] Scope and risk impact are visible.
- [ ] Codex does not write files for discussion-only, review-only, or pause/stop turns.
- [ ] Scope changes require a human decision.
- [ ] Risk decisions require a human decision.
- [ ] Direct follow-ups are not executed inside the current task without approval.
- [ ] Memory candidates stay candidates until approved.

## Must Stop

Stop and ask for human decision when the turn includes:

- release or production decision
- payment, tax, privacy, security, compliance, or migration risk
- irreversible operation
- new project scope
- conflict with current approved task
- request to pause, stop, or only discuss

## Good Behavior

Codex can still be useful while stopped:

- answer the question
- summarize options
- prepare a recommendation
- draft a scope change report
- explain what would be needed to continue
