# IntentOS 1.87.0 Self-Check Report

## Scope

Release Channel Decoupling implementation, examples, bad fixtures, CLI surface,
schema, package verification surface, manifest, and public docs.

## Required Checks

Run before release:

```bash
npm run verify:syntax
npm run verify:examples
npm run verify:release
npm run verify
git diff --check
```

## Expected Results

- Release Channel Decoupling source repository check passes with
  `--allow-empty`.
- Positive examples pass with `--require-structured-evidence`.
- Bad fixtures reject unsafe release-channel claims, including GitHub Release
  asset auto-approval, GitHub Actions artifact package retention gaps,
  tag-triggered production release overclaims, missing cost owner, evidence
  deletion, technical user burden, and source/release-channel confusion.
- `check-intentos` covers 1.87 docs, schema, CLI commands, examples, fixtures,
  and release evidence.

## Result

Passed in the release turn.

Verified commands:

```bash
npm run verify:syntax
npm run verify:examples
npm run verify:release
npm run verify
```

Additional targeted checks completed during implementation:

```bash
node scripts/cli.mjs release-channel-check . --allow-empty
node scripts/check-release-channel-policy.mjs examples/1.87-release-channel-decoupling/new-project-source-only --require-structured-evidence
node scripts/check-release-channel-policy.mjs examples/1.87-release-channel-decoupling/existing-provider-release-sop --require-structured-evidence
node scripts/check-release-channel-policy.mjs examples/1.87-release-channel-decoupling/github-release-assets-review-needed --require-structured-evidence
node scripts/check-release-channel-policy.mjs examples/1.87-release-channel-decoupling/actions-artifact-package-blocked --require-structured-evidence
node scripts/check-release-channel-policy.mjs examples/1.87-release-channel-decoupling/tag-source-identity-only --require-structured-evidence
```

Bad fixture checks were expected to fail and did fail for the unsafe
release-channel conditions listed above.

## Notes

The feature is non-authorizing. Passing checks do not approve release,
production, artifact upload, GitHub-hosted workflow execution, artifact
deletion, CI mutation, production mutation, secret access, or cost acceptance.
