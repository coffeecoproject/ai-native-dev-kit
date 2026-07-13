# IntentOS 1.102.0 Known Limitations

- Adapters discover and validate contracts but do not start or stop runtimes.
- `1.102` does not create isolated databases, caches, sessions, containers,
  pods, deployments, previews, simulators, or native builds.
- Resource ownership enforcement and cleanup execution remain `1.103` work.
- Test Evidence, Execution Assurance, Completion, and release consumers do not
  yet require the Runtime Plan or Run Manifest; that hardcut remains `1.104`.
- Project-native adapter declarations are optional and must be project-owned;
  conflicting declarations block selection.
- Repository fixtures do not prove that a real Docker daemon, cluster, cloud
  provider, app store, mini-program platform, simulator, or device is correctly
  configured.
- Historical `1.101` evidence remains readable but is not adapter-verified.
