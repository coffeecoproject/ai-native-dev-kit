# IntentOS 1.86.0 Known Limitations

- Runtime Hygiene classifies delivery-runtime blockers; it does not prove that
  the feature or business rule is complete.
- Runtime Hygiene does not authorize commit, push, release, production,
  artifact deletion, gate bypass, force push, or evidence removal.
- CI environment failures can be retried only when project policy allows retry
  and no production side effect exists.
- Artifact quota cleanup still requires release-owner approval because deletion
  is irreversible.
- Bundle slimming must preserve evidence outside the runtime bundle; the report
  cannot be used to delete evidence to make a package smaller.
- Production-side-effect ambiguity blocks continuation until the release owner
  or incident path determines the production state.
- Git lineage classification is conservative. It can block mixed or stale
  history, but it does not rewrite history by itself.
