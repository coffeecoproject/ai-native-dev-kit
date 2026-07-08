# IntentOS 1.83.2 Known Limitations

- Task Governance review policy is a routing contract, not implementation
  proof.
- A `LOW` or `MEDIUM` review policy is only valid when high-impact surfaces have
  been explicitly excluded.
- A `POSSIBLE_HIGH` policy blocks implementation review until clarification or
  read-only inspection resolves the task tier.
- A `HIGH` policy requires full review/evidence chain, but this report does not
  execute that chain by itself.
- Project-native review evidence still needs resolvable refs, matching digests,
  owners, scopes, current-task match, and summaries before it can satisfy
  mapped behavior.
- This release does not approve implementation, completion, commit/push,
  release, production, native apply, or full IntentOS adoption.
