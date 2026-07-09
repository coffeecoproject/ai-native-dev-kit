# Release Channel Policy Review Checklist

- Source identity is separated from release channel.
- Git and tags are not treated as release approval.
- GitHub Releases are not treated as safe release package channels without
  release owner policy.
- GitHub Actions artifacts are not treated as long-lived release packages
  without retention and cost owner evidence.
- GitHub Release notes-only flow is checked for `on: release` workflow side
  effects.
- External provider, registry, app-store, mini-program, Docker, server, or
  package release channels have owner evidence.
- Release package identity is recorded when a package exists.
- Release evidence is preserved and not deleted to shrink bundles.
- The user-facing summary is plain language and does not ask the user to choose
  technical enum values.
- The report does not approve release, production, CI mutation, artifact
  deletion, or secret handling.

