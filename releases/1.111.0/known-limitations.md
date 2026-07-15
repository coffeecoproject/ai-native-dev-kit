# IntentOS 1.111.0 Known Limitations

- Planning Closure validates recorded planning evidence; it does not create the
  implementation, execute tests, or prove product correctness.
- A ready Execution Entry Contract is a non-authorizing handoff. The execution
  layer still must revalidate the current project, task, sources, and worktree
  before any write.
- Missing business or authoritative external facts can keep planning blocked;
  IntentOS cannot infer facts that neither the project nor an external authority
  can establish.
- Historical source reports remain subject to their own schema and checker
  semantics; they are not silently upgraded to 1.111 planning proof.
