# IntentOS 1.87.1 Known Limitations

- Release Channel Policy remains a policy/evidence layer, not a release
  executor.
- Strict source binding verifies local `file:` refs and digests. It does not
  inspect remote provider dashboards, app stores, mini-program platforms,
  registries, or external release systems.
- Release Channel Policy does not calculate exact GitHub Actions, storage,
  registry, platform, or provider cost. It only avoids marking absent
  source-only signals as cost risk by default.
- Release Evidence Gate does not yet consume Release Channel Policy as a hard
  required input. Use the policy report as release-channel evidence, not as
  release approval.
- Release owner timing is split. A source-only policy report can be recorded
  without an immediate release owner, but release review still requires a
  release owner before any release action.
- This release does not delete old artifacts, optimize bundle size, mutate CI,
  change production configuration, or approve cost.
