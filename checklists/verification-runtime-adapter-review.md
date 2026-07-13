# Verification Runtime Adapter Review

- [ ] Adapter selection was made by Codex, not delegated to the user.
- [ ] The task tier and required runtime trust level are current.
- [ ] Every non-command adapter has project-local discovery evidence.
- [ ] Discovery evidence is non-symlinked, current, and digest-bound.
- [ ] Conflicting explicit adapter declarations fail closed.
- [ ] The selected adapter supports the required runtime trust level.
- [ ] Contract version and contract digest are valid.
- [ ] Required identity fields match the selected adapter class.
- [ ] A service instance cannot use another adapter class.
- [ ] Raw credentials, tokens, cookies, or connection URLs are absent.
- [ ] Lifecycle mode remains `OBSERVE_AND_PLAN_ONLY`.
- [ ] The adapter does not start/stop runtimes or create/delete resources.
- [ ] Historical `1.101` evidence remains readable without gaining `1.102`
      adapter-verified status.
- [ ] No release, production, implementation, or completion authority is added.
