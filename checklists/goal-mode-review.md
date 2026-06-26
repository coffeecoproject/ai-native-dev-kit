# Goal Mode Review Checklist

Use this checklist when reviewing a Goal Card or a Goal Mode decision.

## Mode Validity

- [ ] The selected mode is one of `DISCUSS_ONLY`, `ADOPT_PROJECT`, `DEFINE_WORK`, `IMPLEMENT_TASK`, `REVIEW_TASK`, `REPAIR_TASK`, `BASELINE_DECISION`, or `HANDOFF_OR_REPORT`.
- [ ] The selected mode matches the human request.
- [ ] The Goal Card does not treat itself as implementation approval.
- [ ] The Goal Card names the next safe step.

## Write Authority

- [ ] `DISCUSS_ONLY` is read-only.
- [ ] `ADOPT_PROJECT` respects `ADOPTION_MODE: READ_ONLY` when governed-project protection is active.
- [ ] Existing governed, production, or dirty projects do not run `init-project` or `--update-workflow-assets` before human approval.
- [ ] `IMPLEMENT_TASK` has a selected task card.
- [ ] `REVIEW_TASK` is read-only unless the human explicitly switches to repair or implementation.
- [ ] `REPAIR_TASK` is limited to `AUTO_FIX` findings.

## Artifact Route

- [ ] Broad or vague work routes through request, preflight, spec, eval, and task.
- [ ] L2/L3 work plans Review Packet and Review Loop Report before closure.
- [ ] Baseline decisions route to Decision Brief or explicit human decision.
- [ ] Handoff/report work does not start follow-up implementation by itself.

## Governance Boundaries

- [ ] Engineering Baseline is checked when structure, contracts, schema, generated types, permissions, migrations, dependencies, or cross-module state are touched.
- [ ] Platform Baseline is checked when selected profiles or runtime expectations matter.
- [ ] Industrial Baseline is checked when BL2 or selected industrial packs matter.
- [ ] Risk Gate and Human Approval remain authoritative.
- [ ] Approval scope is not changed by Codex.

## Repair Boundary

- [ ] `AUTO_FIX` findings are deterministic, low-risk, and inside the approved task.
- [ ] Auto-fix does not exceed 2 rounds.
- [ ] Repeated failures stop and route to humans.
- [ ] Scope expansion, architecture, dependencies, migrations, production config, permission model, release, rollback, Human Approval, and Approval scope are not repaired automatically.

## Output Boundary

- [ ] Human-facing output starts with status, risk, decision needed, and next safe step.
- [ ] Technical details stay available under Technical Details or Audit Notes.
- [ ] Next-step suggestions use Bounded Next-Step categories.
- [ ] Follow-up work uses a valid entry point before execution.
