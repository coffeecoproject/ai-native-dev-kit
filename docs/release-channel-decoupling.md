# Release Channel Decoupling

Use Release Channel Decoupling when the user asks whether a project should use
GitHub Release, GitHub Actions artifacts, tags, provider deploys, app-store
submission, mini-program upload, Docker/package registries, or manual release
handoff.

Plain-language behavior:

```text
I will keep GitHub for code and records. I will not use GitHub as the place that
stores or publishes the release package unless a release owner explicitly
chooses it later.
```

For old projects, Codex reads the current release path first. It should preserve
safe existing release SOPs and only recommend decoupling when the current channel
is unclear, ownerless, cost-risky, or production-side-effect risky.

## Commands

```bash
node scripts/cli.mjs release-channel <project> --intent "decide release channel policy"
node scripts/cli.mjs release-channel-check <project>
```

`release-channel` is read-only by default. Report writes are limited to
`release-channel-policies/*.md`.

## Boundaries

The report does not:

- approve release or production;
- execute release;
- upload GitHub Release assets;
- run GitHub-hosted release workflows;
- delete artifacts;
- change CI;
- change production;
- record secrets.

