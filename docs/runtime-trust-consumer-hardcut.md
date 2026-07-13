# Runtime Trust Consumer Hardcut

Version 1.104 connects the bounded verification run from 1.103 to the task completion chain.

## Plain-Language Behavior

The user still says:

```text
把这个功能完整做好并确认可以使用。
```

IntentOS automatically finds the current task's Verification Run Manifest and checks that Test Evidence, Execution Assurance, Completion Evidence, and the final `finish` result all use that same run. Missing technical runtime evidence is work for Codex, not a technical questionnaire for the user.

## Strict Maintainer Checks

These lower-level commands are for maintainers and CI:

```bash
node scripts/check-test-evidence.mjs . --require-runtime-trust
node scripts/check-execution-assurance.mjs . --require-runtime-trust
node scripts/check-completion-evidence.mjs . --require-runtime-trust
node scripts/check-closure-decision.mjs .
```

Resolvers accept `--runtime-manifest-ref artifact:verification-run-manifests/<run>.md` for reproducible advanced checks. Ordinary users do not select this reference.

## What Fails

- the Run Manifest is missing, copied from another project, stale, symlinked, or invalid;
- task, intent, source revision, or Verification Plan does not match;
- an evidence item claims PASS without a matching passing execution output;
- Test Evidence and Execution Assurance refer to different runs;
- a historical consumer report is used in strict mode;
- `--allow-empty` is combined with strict Runtime Trust;
- cleanup or run ownership is incomplete.

## What A Pass Means

A pass means every strict completion consumer independently accepted the same current runtime record. It does not mean the product is correct merely because a command ran, and it does not authorize release or production.
