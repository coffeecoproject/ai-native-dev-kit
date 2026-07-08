# IntentOS 1.83.1 Known Limitations

- 1.83.1 validates project-native evidence bindings, but it still does not
  write or migrate target project assets.
- A valid project-native mapping can satisfy a governance requirement only for
  routing and review. It does not authorize implementation or completion.
- Digest matching proves artifact identity, not business correctness.
- Owner and scope fields are evidence metadata. They do not replace project
  owner approval, release owner approval, or production risk acceptance.
- Existing projects with weak or missing records still need governance repair
  before deeper adoption or high-impact task execution.
