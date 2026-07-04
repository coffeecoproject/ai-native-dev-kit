# Release Plan Review Checklist

- [ ] Release Plan is described as a pure read-only view.
- [ ] Strict structured evidence validates `release_plan_digest` when required.
- [ ] Structured evidence rejects extra authority, deploy, secret, provider, migration, or release-approval fields.
- [ ] Source systems stay authoritative.
- [ ] Trace entries explain only and have no control authority.
- [ ] Summary state does not drive execution.
- [ ] IntentOS Operating Mode is active where appropriate, but does not grant write permission.
- [ ] Existing project baselines and release rules are compared, not ignored.
- [ ] Existing stricter or proven project rules are kept or escalated.
- [ ] IntentOS gaps are recommendations only until apply plan and approval.
- [ ] Human and external release actions remain human/external-system owned.
- [ ] No production approval, deploy, publish, CI/hook mutation, secret handling, DNS, payment, migration, or provider-state change is approved by the plan.
