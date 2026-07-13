# IntentOS 1.103.0 Known Limitations

- Automatic execution is limited to exact command-only and bounded local
  process/static/project-native lifecycle declarations.
- Docker, Kubernetes, serverless, provider, remote, release, and production
  lifecycle execution remains blocked.
- A project-owned lifecycle declaration is required before execution; Codex
  prepares this technical file automatically.
- Service actions require a direct runtime executable. Package-manager wrappers
  remain blocked because stopping the wrapper does not prove descendant cleanup.
- Downstream Test Evidence, Execution Assurance, Completion Evidence, and
  public `finish` hardcut consumption is scheduled for 1.104.
