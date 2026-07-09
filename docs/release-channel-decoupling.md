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

## 1.87.1 Calibration

`release-channel-check --strict-source-binding` resolves `file:` source refs
inside the checked project and recomputes the file digest. A report can no
longer pass strict mode just because a source kind is listed; required project
sources must point to an existing project file and the recorded digest must
match that file.

Release owner wording is split into two moments:

- `release_owner_required_for_policy`: whether this policy record needs a
  release owner now.
- `release_owner_required_before_release_review`: whether a release owner is
  required before any later release review.

Source-only projects can record the policy without naming a release owner, but
they still cannot enter release review without one. Release Evidence Gate does
not yet consume Release Channel Policy as a hard gate; treat this as a recorded
follow-up instead of a release approval shortcut.

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
