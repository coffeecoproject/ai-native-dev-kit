# Release Adapter Review

Use this checklist before treating a Release Adapter Profile as usable.

- [ ] Human Summary is plain language.
- [ ] Project Release Discovery cites files or marks missing evidence.
- [ ] Release Target Recommendation recommends a safe non-production target by default.
- [ ] Beginner Release Card asks only a few decision questions.
- [ ] Project Release Profile records build, verification, deployment, environment, rollback, monitoring, owner, and evidence path.
- [ ] Codex Execution Boundary separates safe, conditional, human-required, and blocked actions.
- [ ] Missing Inputs are explicit.
- [ ] Release Execution Bridge points to Release Execution Protocol.
- [ ] Boundaries are all `No`.
- [ ] No secrets, tokens, passwords, private keys, or production credentials are included.
- [ ] The adapter does not approve release or production.
- [ ] The adapter does not install or mutate CI/CD, hooks, DNS, payment, permissions, app-store, mini-program, or production config.
