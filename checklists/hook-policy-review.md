# Hook Policy Review Checklist

Use this checklist before treating a Project Hook Policy as recorded evidence.

- [ ] Policy state is one of the allowed states.
- [ ] Existing hooks, CI workflows, package scripts, scheduled jobs, and hook tooling are listed or marked none.
- [ ] H0/H1/H2/H3 classes are present.
- [ ] H2 requires human confirmation.
- [ ] H3 requires explicit human approval.
- [ ] Rollback / disable policy lists owner, restore path, and evidence.
- [ ] Forbidden automatic actions are all set to `No`.
- [ ] Boundary says the policy does not install hooks, modify CI, add blocking gates, call external APIs, store secrets, enable auto-fix, approve release, or replace Hook Orchestration.
- [ ] Any existing governed project policy is mapped, not replaced.
