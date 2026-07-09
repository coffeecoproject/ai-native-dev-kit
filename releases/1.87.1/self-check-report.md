# IntentOS 1.87.1 Self-Check Report

## Scope

Release Channel Source Binding And Reference Polish.

This patch covers:

- `1.87.1` schema upgrade;
- strict `file:` source ref resolution and digest matching;
- source-only owner/cost default calibration;
- release-owner timing split;
- public scripts reference sync;
- strict source-binding examples and bad fixtures;
- 1.87.1 release evidence.

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

- Existing 1.87 examples still pass structured evidence checks.
- The strict source-binding example passes with `--strict-source-binding`.
- Bad fixtures reject missing required source refs and digest mismatches.
- `check-intentos` covers 1.87.1 docs, schema, CLI commands, examples,
  fixtures, and release evidence.

## Result

Passed.

Verified in this release turn:

```bash
npm run verify:syntax
npm run verify:examples
npm run verify:release
node scripts/check-manifest.mjs
```

The release verification covered:

- manifest/version consistency for `1.87.1`;
- Release Channel Policy schema, resolver, checker, CLI entries, docs, examples,
  bad fixtures, and release evidence;
- strict source-binding positive fixture with `--strict-source-binding`;
- bad fixture rejection for missing required source refs;
- bad fixture rejection for `source_digest` mismatch;
- generated-project workflow/update smoke checks;
- historical governance, adoption, execution, completion, release, and
  documentation consistency checks;
- `git diff --check` as part of `verify:release`.

Final release hygiene before commit:

```bash
npm run verify
git diff --check
```

Status: passed.

Final verification completed in this release turn:

```bash
npm run verify
```

`npm run verify` completed successfully and included:

- `npm run verify:syntax`;
- `npm run verify:baseline`;
- `npm run verify:governance`;
- `npm run verify:industrial`;
- `npm run verify:examples`;
- `npm run verify:release`;
- `git diff --check` through `verify:release`.

## Notes

An already-present `1.88` plan draft was preserved and registered in the
manifest source inventory so release verification can detect it as intentional
source material instead of untracked documentation drift.
npm run verify:syntax
npm run verify:examples
npm run verify:release
npm run verify
git diff --check
```
