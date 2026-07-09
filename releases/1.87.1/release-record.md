# IntentOS 1.87.1 Release Record

## Release Name

Release Channel Source Binding And Reference Polish

## Summary

`1.87.1` hardens Release Channel Decoupling without adding a new release layer.

The patch makes strict source binding real: `release-channel-check
--strict-source-binding` resolves project `file:` refs and recomputes
`source_digest` from the current file bytes. It also splits release-owner timing
so source-only policy records do not require a release owner immediately, while
release review still does.

## Changed

- Release Channel Policy schema version is now `1.87.1`.
- Strict source binding verifies concrete `file:` refs and digest matches.
- Required source kinds now fail strict mode when the source ref is missing,
  unknown, outside the project, or digest-mismatched.
- Owner policy now distinguishes:
  - `release_owner_required_for_policy`;
  - `release_owner_required_before_release_review`.
- Source-only projects no longer default to a release owner or cost owner when
  no release workflow, release package, platform fee, or storage-risk signal is
  present.
- `docs/reference/scripts.md` now lists `release-channel` and
  `release-channel-check`.
- Strict source-binding positive and negative fixtures were added.

## Non-Authorizing Boundaries

This release still does not:

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

- Release Channel Policy can verify local `file:` source refs in strict mode by
  resolving them inside the project and recomputing `source_digest`.
- Release Channel Policy can reject required source refs that are missing,
  unknown, outside the project, or digest-mismatched.
- Release Channel Policy can distinguish whether the policy record itself needs
  a release owner from whether a later release review needs one.
- Release Channel Policy can record a source-only policy without a release
  owner when no release workflow, release package, platform fee, or storage-risk
  signal is present.
- Release Channel Policy can keep release owner, cost owner, retention, package
  identity, and source-chain evidence separate from release approval.

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
- A passing Release Channel Policy report does not mean Release Evidence Gate
  has approved release readiness.

## Evidence Status

`1.87.1` records release-channel policy evidence with structured
`release_channel_policy` reports using schema version `1.87.1`.

The evidence can prove that a policy report was prepared, source refs were
listed, owner timing was recorded, and strict local `file:` source bindings were
checked when `--strict-source-binding` is used.

The evidence does not prove a third-party release channel is correct, approve a
release package, approve production, or prove Release Evidence Gate has consumed
the policy as a hard release input.

## Known Limitations

- Release Channel Policy does not calculate exact GitHub Actions, storage,
  registry, provider, app-store, mini-program, or platform cost.
- Release Channel Policy does not inspect remote provider dashboards or app
  store state.
- Release Channel Policy cannot prove third-party artifact retention. It can
  only record the provided retention evidence.
- Release Evidence Gate does not yet consume Release Channel Policy as a hard
  required input.
- Release Channel Policy does not delete old artifacts or slim release bundles.

## Follow-Up Marker

Release Evidence Gate does not yet consume Release Channel Policy as a hard
input. `1.87.1` records this as a known follow-up rather than creating a second
release gate or implying release approval.

## Verification

Expected verification commands:

```bash
npm run verify:syntax
npm run verify:examples
npm run verify:release
npm run verify
git diff --check
```

Final verification is recorded in
[`self-check-report.md`](self-check-report.md).
