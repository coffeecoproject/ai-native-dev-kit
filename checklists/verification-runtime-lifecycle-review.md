# Verification Runtime Lifecycle Review

- [ ] Runtime Plan is valid, ready, task-bound, and current.
- [ ] Lifecycle declaration is current, strict, project-local, and adapter-compatible.
- [ ] Every command uses exact argv and `shell: false`.
- [ ] Every executable is a bare allowlisted name, resolves during preflight, and cannot be replaced through an action-level `PATH`.
- [ ] Every service uses a direct runtime executable, not a wrapper that can leave descendants behind.
- [ ] No provider, remote, deploy, release, production, destructive, or broad-cleanup command is present.
- [ ] Environment inheritance is minimal and contains no credentials or production bindings.
- [ ] Every resource is run-scoped, non-production, non-shared, and owner-marked.
- [ ] Action dependencies are complete and acyclic.
- [ ] Same-phase dependencies preserve topological execution order.
- [ ] Positive and negative obligations required by the task tier are covered.
- [ ] Journal entries precede material actions.
- [ ] Interruption and failure always enter cleanup.
- [ ] Cleanup targets only exact run-owned child processes and paths.
- [ ] Termination escalation can target only the same recorded child process.
- [ ] Cleanup-before and cleanup-after evidence are independently recorded.
- [ ] Run Manifest binds the Lifecycle Plan and journal digests.
- [ ] Runtime completion is not presented as business, implementation, release, or production approval.
