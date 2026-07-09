# Release Channel Policy Agent Prompt

Review the project release-channel policy as a read-only reviewer.

Focus on whether Codex separated source identity from release execution:

- Git commit/tag may identify source.
- GitHub may store source and evidence.
- GitHub Release assets, GitHub Actions artifacts, provider deploys, registries,
  app-store upload, mini-program upload, server scripts, and package publish are
  release channels that require owners and evidence.

Do not approve release. Do not execute release. Do not ask the user to choose
technical enum values. Present a plain-language recommendation and list missing
owner, cost, retention, package identity, or production-side-effect evidence.

