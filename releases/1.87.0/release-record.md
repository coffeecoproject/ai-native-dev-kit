# IntentOS 1.87.0 Release Record

## Release Name

Release Channel Decoupling

## Summary

`1.87.0` separates source identity from release-channel decisions.

Git, tags, and GitHub can remain the source and evidence system, but IntentOS no
longer treats GitHub Releases, GitHub Actions artifacts, provider deploys,
registries, app-store submissions, mini-program submissions, server scripts, or
local bundles as the release channel by default.

## Added

- `release-channel` CLI command.
- `release-channel-check` CLI command.
- Release Channel Policy protocol, user docs, template, checklist, prompt, and
  JSON schema.
- Source/evidence-only default for new projects.
- Existing-project release-channel preservation when a safe release SOP already
  exists.
- GitHub Release asset review classification.
- GitHub Actions artifact, cost, and retention classification.
- Release package identity checks for package, Docker, provider, app-store, and
  mini-program channels.
- Bad fixtures for common release-channel mistakes.

## Non-Authorizing Boundaries

This release does not:

- approve release;
- approve production;
- execute release;
- upload GitHub Release assets;
- run GitHub-hosted release workflows;
- delete artifacts;
- change CI;
- change production;
- touch secrets;
- approve cost.

## Allowed Claims

- Release Channel Policy can separate Git source identity from release-channel
  decisions.
- Release Channel Policy can classify GitHub Release assets as source/evidence,
  notes-only, or release-channel review candidates.
- Release Channel Policy can classify GitHub Actions artifacts as short-lived
  handoff evidence or unsafe long-lived release package storage.
- Release Channel Policy can preserve a safe existing release SOP instead of
  replacing it with a GitHub-first channel.
- Release Channel Policy can require release owner, cost owner, retention,
  package identity, and source-chain evidence before release-owner review.

## Forbidden Claims

- This release does not approve release.
- This release does not approve production.
- This release does not execute release.
- This release does not upload GitHub Release assets.
- This release does not run GitHub-hosted release workflows.
- This release does not delete artifacts or evidence.
- This release does not change CI or production configuration.
- This release does not approve GitHub Actions, registry, provider, platform,
  app-store, mini-program, or package-storage costs.

## Evidence Status

`1.87.0` records release-channel policy evidence with structured
`release_channel_policy` reports. The evidence can show the selected source
identity, detected release-channel signals, GitHub Release policy, GitHub
Actions artifact and billing-risk profile, owner gaps, package identity, source
chain, and non-authorizing boundaries.

The evidence proves the policy report was prepared and checked. It does not
prove an external release platform is correct, approve a release package, or
approve production.

## Known Limitations

- Release Channel Policy does not calculate exact GitHub Actions, storage,
  registry, provider, app-store, mini-program, or platform cost.
- Release Channel Policy does not replace Release Evidence Gate or the human
  release owner.
- Release Channel Policy does not inspect remote provider dashboards or app
  store state.
- Release Channel Policy cannot prove third-party artifact retention. It can
  only record the provided retention evidence.
- Release Channel Policy does not delete old artifacts or slim release bundles.

## Verification

Expected verification commands:

```bash
npm run verify:syntax
npm run verify:examples
npm run verify:release
npm run verify
```

Final verification is recorded in
[`self-check-report.md`](self-check-report.md).
