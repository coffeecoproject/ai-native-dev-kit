# IntentOS 1.78.1 Known Limitations

- Completion Evidence Gate checks recorded artifacts; it does not execute tests.
- Source-chain binding proves local refs, digests, schemas, and task/intent data
  are consistent. It does not prove product correctness.
- Execution Assurance does not currently expose a top-level `intent_digest`, so
  Completion Evidence binds it through task ref and Test Evidence source refs.
- This release does not approve release, production, deployment, migration,
  provider actions, or customer rollout.
