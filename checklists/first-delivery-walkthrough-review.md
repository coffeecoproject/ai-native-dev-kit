# First Delivery Walkthrough Review

Use this checklist when reviewing a first delivery walkthrough or adoption trial report.

## Scope

- [ ] The human starting idea is recorded.
- [ ] The first slice is narrow and understandable.
- [ ] The baseline path is the smallest safe path.
- [ ] Heavy artifacts are used only when needed.

## Human Role

- [ ] The human only needs to choose, confirm, or decide.
- [ ] Codex does not require the human to manually operate the workflow.
- [ ] Human decision points are explicit.
- [ ] Risk acceptance, release, and production decisions remain human-owned.

## Evidence

- [ ] Request/spec/eval/task path exists or the omission is justified.
- [ ] Verification evidence exists or is explicitly not applicable.
- [ ] Final report exists.
- [ ] Launch readiness exists when readiness is claimed.
- [ ] Simulated evidence is clearly labeled as simulated.

## Drift And Scope

- [ ] Scope changes are not silently absorbed into the current task.
- [ ] Risk decisions stop for human decision.
- [ ] Payment, privacy, security, compliance, migration, production, and release concerns are not auto-approved.

## Subagents

- [ ] Subagent roles are bounded if helpers were used.
- [ ] The main thread remains the only writer.
- [ ] Subagents are `CLOSED`, `SKIPPED`, or not used.

## Claims

- [ ] The report does not claim production readiness.
- [ ] The report does not claim real-project validation unless real project evidence is present.
- [ ] The report does not claim legal, compliance, security, payment, privacy, migration, release, or customer approval.
